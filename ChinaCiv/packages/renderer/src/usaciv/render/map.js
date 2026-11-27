// Draws the hex world. Two layers:
//  * drawStatic(): everything that only depends on the view, the lens and toggles (ocean, tiles, biome and
//    relief glyphs, rivers, borders, city tiles, resources, edge fog, state names). main.js renders it into an
//    offscreen cache and blits it.
//  * drawOverlay(): hover and selection, drawn every frame on top.
// `vp` is the static layer's viewport: {x0, y0, x1, y1} in km, `s` = css px per km, `dpr` = device pixel ratio.
// World drawing uses transform dpr·s with the origin at (x0, y0); screen-space drawing uses dpr.
//
// The tile ART lives in render/art/: terrain.js (cover + relief glyphs), city.js (city tiles, capital landmark)
// and water.js (ocean texture, foam, lakes, rivers). This file orders the layers and draws the map furniture
// (borders, resources, state names, fog, selection). web/dev/art.html shows every art piece side by side.
import { css, smoothstep } from "../color.js";
import { OCEAN_DEEP_CSS } from "../terrain.js";
import { LABEL_FONT, LABEL_SPACING, CJK_LABEL_SPACING, stateIndex, stateOutline } from "../world.js";
import { drawIcon, hasIcon } from "../icons.js";
import { drawTerrainGlyphs, GLYPHS_MIN_RPX } from "./art/terrain.js";
import { drawCityTile, cityTileVisible, cityIsDot, metroSpill } from "./art/city.js";
import { drawWater, drawRivers, strokeSegs } from "./art/water.js";
import { lodFor } from "./art/lod.js";

export const OCEAN_BG = OCEAN_DEEP_CSS;
export { cityIsDot } from "./art/city.js";

/**
 * z order of the built-in steps of drawStatic(). A registered static layer (app.registerStaticLayer, passed here as
 * opts.layers) with z between two steps draws after the lower one and before the higher one; a layer whose z equals
 * a step's draws right after that step. Suggested slots:
 *   45  tile improvements under the rivers (farms, terrain decals)
 *   55  roads and railroads (above rivers and borders, below the city tiles)
 *   58  restricted ground / protected land hatching on hexes
 *   65  sites on hexes: ports, airports, forts, wonders, district plaques (above city tiles, under the fog)
 *   85  trade routes and other long lines over everything on the map (above resources, below state names)
 *   95  labels above the state names (rarely needed)
 */
export const Z = Object.freeze({
  WATER: 10, LAND: 20, GRID: 30, GLYPHS: 40, RIVERS_BORDERS: 50, CITIES: 60, FOG: 70, RESOURCES: 80, LABELS: 90,
});

/** Is a static layer drawn at this zoom? (its visible() and its minRpx / maxRpx range) */
export function layerActive(l, Rpx) {
  if (!l || typeof l.draw !== "function") return false;
  if (l.minRpx != null && Rpx < l.minRpx) return false;
  if (l.maxRpx != null && Rpx >= l.maxRpx) return false;
  try {
    return typeof l.visible !== "function" || l.visible() !== false;
  } catch (err) {
    layerError(l, "visible", err);
    return false;
  }
}

const failedLayers = new WeakSet();
/** Log a layer's first failure (per layer object) and carry on; the rest of the map still draws. */
export function layerError(l, what, err) {
  if (failedLayers.has(l)) return;
  failedLayers.add(l);
  console.error(`static layer "${l?.id}" ${what}() failed; it is skipped while it keeps failing`, err);
}

// Options handed to a layer's draw() / warm(): the zoom, the visible cells and transform helpers.
function layerOpts(ctx, vp, w, opts, extra) {
  const { s, dpr } = vp;
  const Rpx = w.grid.R * s;
  return {
    Rpx, s, dpr, lod: lodFor(Rpx),
    lens: opts.lens || null, selectedCity: opts.selectedCity || null, showResources: !!opts.showResources,
    snapshot: !!opts.snapshot, app: opts.app || null,
    // ctx back to world units (km, the default when draw() is called) or to screen css px of this canvas
    world: () => ctx.setTransform(dpr * s, 0, 0, dpr * s, -vp.x0 * dpr * s, -vp.y0 * dpr * s),
    screen: () => ctx.setTransform(dpr, 0, 0, dpr, 0, 0),
    toScreen: (x, y) => [(x - vp.x0) * s, (y - vp.y0) * s],
    ...extra,
  };
}

/**
 * Draw the static layer into ctx (see the header for `vp`).
 * opts:
 *   lens            a lenses.json lens or null (terrain)
 *   showResources   draw resource icons
 *   resourceFilter  {types?: Set<typeId>, minValue?: number} | null: only matching resources are drawn
 *   selectedCity    the selected city (passed to the city art as `selected`)
 *   edgeFog = true  sea mist beyond the world's edges
 *   labels = true   the big state names
 *   hits            optional object; gets hits.resources = [{item, x, y, r}] (x, y in km, r in css px)
 *   timings         optional {section: ms} for profiling (registered layers time as "layer:<id>")
 *   layers          registered static layers ({id, z, draw(ctx, vp, w, o), visible?, minRpx?, maxRpx?}, see
 *                   app.registerStaticLayer in main.js), drawn at their z among the steps below (see Z)
 *   app             handed to the layers as o.app
 *   snapshot        true when drawing a share image (layers see o.snapshot)
 *
 * A layer's draw(ctx, vp, w, o) starts in world units (km; o.screen() / o.world() switch transforms) with ctx saved
 * and restored around it. o = {Rpx, s, dpr, lod, lens, selectedCity, showResources, snapshot, app, cells, range,
 * world(), screen(), toScreen(x, y) → css px}. An error is logged once per layer and the layer is skipped.
 */
export function drawStatic(ctx, vp, w, opts) {
  const { grid } = w;
  const { s, dpr } = vp;
  const R = grid.R;
  const Rpx = R * s;
  const lod = lodFor(Rpx);
  const W = w.raw.width, H = w.raw.height;
  const { r0, r1, c0, c1 } = grid.range(vp.x0, vp.y0, vp.x1, vp.y1);
  const worldT = () => ctx.setTransform(dpr * s, 0, 0, dpr * s, -vp.x0 * dpr * s, -vp.y0 * dpr * s);

  const T = opts.timings; // optional {section: ms} for profiling
  let tMark = T ? performance.now() : 0;
  const lap = (name) => {
    if (!T) return;
    const t = performance.now();
    T[name] = (T[name] || 0) + t - tMark;
    tMark = t;
  };
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = OCEAN_BG;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  worldT();

  // Visible cells, row by row.
  const cells = [];
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) cells.push(r * grid.cols + c);

  // Registered static layers, by z (stable), drawn by upTo(z) before each built-in step.
  const layers = (opts.layers || []).filter((l) => layerActive(l, Rpx)).sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
  let nextLayer = 0;
  let lo = null;
  const upTo = (z) => {
    while (nextLayer < layers.length && (layers[nextLayer].z ?? 0) < z) {
      const l = layers[nextLayer++];
      lo ??= layerOpts(ctx, vp, w, opts, { cells, range: { r0, r1, c0, c1 } });
      ctx.save();
      lo.world();
      try {
        l.draw(ctx, vp, w, lo);
      } catch (err) {
        layerError(l, "draw", err);
      }
      ctx.restore();
      lap(`layer:${l.id}`);
    }
    worldT();
  };
  upTo(Z.WATER);

  // Corners grown by ~0.7px so neighbouring fills overlap (no seams).
  const grow = (R + 0.7 / s) / R;
  const K = grid.corners.map(([x, y]) => [x * grow, y * grow]);
  const tile = (i) => {
    const x = grid.cx(i), y = grid.cy(i);
    ctx.beginPath();
    ctx.moveTo(x + K[0][0], y + K[0][1]);
    for (let k = 1; k < 6; k++) ctx.lineTo(x + K[k][0], y + K[k][1]);
    ctx.fillStyle = w.colors[i];
    ctx.fill();
  };

  // 1. Water tiles, then the water art (texture, per-cell decoration, coast foam).
  for (const i of cells) if (w.water[i]) tile(i);
  drawWater(ctx, vp, w, cells, { Rpx, s, lod });
  lap("water");

  // 2. Land tiles.
  upTo(Z.LAND);
  for (const i of cells) if (!w.water[i]) tile(i);
  lap("land");
  if (w.dim) drawBandEdge(ctx, w, r0, r1, c0, c1, s);

  // 3. Hex grid lines once hexes are big enough to read.
  upTo(Z.GRID);
  if (Rpx > 11 && opts.grid !== false) { // ChinaCiv: opts.grid = false hides the hex grid
    ctx.beginPath();
    for (const i of cells) {
      if (w.water[i]) continue; // open water and lakes read as one surface, without the grid
      const x = grid.cx(i), y = grid.cy(i);
      // Each cell draws its NE, E-side and SE edges (corners 5→0→1→2); together they cover every edge once.
      ctx.moveTo(x + grid.corners[5][0], y + grid.corners[5][1]);
      for (const k of [0, 1, 2]) ctx.lineTo(x + grid.corners[k][0], y + grid.corners[k][1]);
    }
    ctx.lineJoin = "miter";
    ctx.lineCap = "butt";
    ctx.strokeStyle = `rgba(0,0,0,${Math.min(0.14, (Rpx - 11) * 0.012)})`;
    ctx.lineWidth = 1 / s;
    ctx.stroke();
  }

  // 4. Biome + relief glyphs (terrain view only, readable sizes only).
  lap("grid");
  upTo(Z.GLYPHS);
  if (!opts.lens && Rpx > GLYPHS_MIN_RPX) drawTerrainGlyphs(ctx, cells, w, { Rpx, s, lod });
  lap("glyphs");

  // 5. Rivers and borders, clipped to the world rectangle.
  upTo(Z.RIVERS_BORDERS);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip();
  drawRivers(ctx, w, { s, Rpx, lod, lens: !!opts.lens });
  drawBorders(ctx, w, s, Rpx, !!opts.lens);
  ctx.restore();

  // 6. City tiles.
  lap("rivers+borders");
  upTo(Z.CITIES);
  drawCityTiles(ctx, w, Rpx, s, lod, opts.selectedCity || null, vp);
  lap("cities");

  // 7. Sea mist around the edges of the known world.
  upTo(Z.FOG);
  if (opts.edgeFog !== false) drawEdgeFog(ctx, vp, W, H);
  lap("fog");

  // 8. Screen-space bits: resources, then the big state names.
  upTo(Z.RESOURCES);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const placed = opts.showResources && w.resources ? drawResources(ctx, vp, w, r0, r1, c0, c1, Rpx, opts.resourceFilter) : [];
  if (opts.hits) opts.hits.resources = placed;
  lap("resources");
  upTo(Z.LABELS);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (opts.labels !== false) drawStateLabels(ctx, vp, w, Rpx);
  lap("labels");
  upTo(Infinity);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawCityTiles(ctx, w, Rpx, s, lod, selectedCity, vp) {
  const { grid } = w;
  const R = grid.R;
  // Only cities near the viewport: every tile is a cached sprite, and painting sprites for the whole country at a
  // new zoom is what made the first render at each zoom slow. 3R covers the tallest skyline and the capital dome.
  const m = 3 * R;
  for (const [cell, city] of w.cityByCell) {
    if (!cityTileVisible(city, Rpx)) continue;
    if (vp) {
      const x = grid.cx(cell), y = grid.cy(cell);
      if (x < vp.x0 - m || x > vp.x1 + m || y < vp.y0 - m || y > vp.y1 + m) continue;
    }
    const stateColor = w.stateColor[w.raw.owner[cell]] || [200, 200, 200];
    drawCityTile(ctx, city, grid.cx(cell), grid.cy(cell), R, { Rpx, s, lod, stateColor, seed: cell, selected: city === selectedCity });
  }
  // Big metros spill their mid-rise blocks into the most built-up neighbouring hexes, so a skyline reads as a
  // cluster across several hexes rather than one tower hex in a ring of suburbs.
  for (const [cell, spill] of metroSpill(w)) {
    if (cityIsDot(spill, Rpx) || !cityTileVisible(spill.of, Rpx) || cityIsDot(spill.of, Rpx)) continue;
    const x = grid.cx(cell), y = grid.cy(cell);
    if (vp && (x < vp.x0 - m || x > vp.x1 + m || y < vp.y0 - m || y > vp.y1 + m)) continue;
    const stateColor = w.stateColor[w.raw.owner[cell]] || [200, 200, 200];
    drawCityTile(ctx, spill, x, y, R, { Rpx, s, lod, stateColor, seed: cell });
  }
}



/**
 * Warm the sprite caches for a render of `vp` without drawing anything that matters: paints the terrain-glyph and
 * city-tile sprites that drawStatic() would need at vp.s, so the first real render at that zoom is mostly blits.
 * `ctx` should be a small scratch canvas (the sprites are sized from ctx's transform, not its canvas, and every
 * stamp lands off-canvas). opts: {lens, selectedCity, layers, app}: registered layers with a warm(ctx, vp, w, o)
 * get it called (same o as draw(); paint your sprites, stamps may land anywhere). Used by main.js in idle time for
 * the next zoom steps.
 */
export function warmSprites(ctx, vp, w, opts = {}) {
  const { grid } = w;
  const { s, dpr } = vp;
  const Rpx = grid.R * s;
  const lod = lodFor(Rpx);
  ctx.setTransform(dpr * s, 0, 0, dpr * s, -vp.x0 * dpr * s, -vp.y0 * dpr * s);
  if (!opts.lens && Rpx > GLYPHS_MIN_RPX) {
    const { r0, r1, c0, c1 } = grid.range(vp.x0, vp.y0, vp.x1, vp.y1);
    const cells = [];
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) cells.push(r * grid.cols + c);
    drawTerrainGlyphs(ctx, cells, w, { Rpx, s, lod });
  }
  drawCityTiles(ctx, w, Rpx, s, lod, opts.selectedCity || null, vp);
  const layers = (opts.layers || []).filter((l) => typeof l.warm === "function" && layerActive(l, Rpx));
  if (layers.length) {
    const { r0, r1, c0, c1 } = grid.range(vp.x0, vp.y0, vp.x1, vp.y1);
    const cells = [];
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) cells.push(r * grid.cols + c);
    const lo = layerOpts(ctx, vp, w, opts, { cells, range: { r0, r1, c0, c1 } });
    for (const l of layers) {
      ctx.save();
      lo.world();
      try {
        l.warm(ctx, vp, w, lo);
      } catch (err) {
        layerError(l, "warm", err);
      }
      ctx.restore();
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawEdgeFog(ctx, vp, W, H) {
  const band = 260;
  const v = vp;
  if (v.x0 > band && v.y0 > band && v.x1 < W - band && v.y1 < H - band) return;
  // Beyond the map: misty deep ocean (not grey), so tall/portrait screens read as open sea.
  const fog = (a) => `rgba(24,48,74,${a})`;
  // Outside the rectangle: solid sea mist.
  ctx.fillStyle = fog(0.92);
  const big = 1e5;
  ctx.fillRect(-big, -big, 2 * big + W, big); ctx.fillRect(-big, H, 2 * big + W, big);
  ctx.fillRect(-big, 0, big, H); ctx.fillRect(W, 0, big, H);
  // Soft gradient bands along each edge.
  const edge = (x0, y0, x1, y1, rx, ry, rw, rh) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, fog(0.92)); g.addColorStop(0.3, fog(0.3)); g.addColorStop(1, fog(0));
    ctx.fillStyle = g;
    ctx.fillRect(rx, ry, rw, rh);
  };
  edge(0, 0, 0, band, 0, 0, W, band);
  edge(0, H, 0, H - band, 0, H - band, W, band);
  edge(0, 0, band, 0, 0, 0, band, H);
  edge(W, 0, W - band, 0, W - band, 0, band, H);
  // No cloud puffs: soft radial blobs read as a rendering glitch; the flat mist bands read as open sea.
}


function drawBorders(ctx, w, s, Rpx, lens) {
  // Inner colour band per state (Civ-style), then the edge lines.
  for (const [st, segs] of w.bands) {
    ctx.beginPath();
    for (let k = 0; k < segs.length; k += 8) {
      ctx.moveTo(segs[k], segs[k + 1]);
      ctx.lineTo(segs[k + 2], segs[k + 3]);
      ctx.lineTo(segs[k + 6], segs[k + 7]);
      ctx.lineTo(segs[k + 4], segs[k + 5]);
      ctx.closePath();
    }
    ctx.fillStyle = css(w.stateColor[st], lens ? 0.45 : 0.62);
    ctx.fill();
  }
  // The smoothed shore (render/art/water.js drawShore) draws the waterline; a stroke along the hex edges here would
  // bring the hex staircase back, so it is only drawn when hexes are too small for the shore pass's lobes.
  if (Rpx < 4) strokeSegs(ctx, w.coastLines, "rgba(240,226,180,.5)", 1.1 / s);
  strokeSegs(ctx, w.stateLines, "rgba(15,10,5,.55)", Math.max(0.8, Math.min(2, Rpx * 0.08)) / s);
  strokeSegs(ctx, w.nationLines, "rgba(255,232,160,.85)", Math.max(1.2, Math.min(3, Rpx * 0.12)) / s);
}


export function hexPath(ctx, grid, i, f = 1) {
  const x = grid.cx(i), y = grid.cy(i);
  ctx.beginPath();
  ctx.moveTo(x + grid.corners[0][0] * f, y + grid.corners[0][1] * f);
  for (let k = 1; k < 6; k++) ctx.lineTo(x + grid.corners[k][0] * f, y + grid.corners[k][1] * f);
  ctx.closePath();
}


// --- resources (screen space) --------------------------------------------------------------------------------------

export const RESOURCE_MIN_RPX = 11; // below this only each state's headline sites show (overview mode)
const RESOURCE_OVERVIEW_MIN_RPX = 2.5; // nothing at all below this
const RESOURCE_OVERVIEW_PER_STATE = 2;
// Slots inside a hex (in R units) for 1, 2 and 3 icons; city cells push them off the skyline.
const RES_SLOTS = {
  free: [[[0, 0.08]], [[-0.36, 0.12], [0.36, 0.12]], [[-0.4, 0.22], [0.4, 0.22], [0, -0.34]]],
  city: [[[0.46, 0.4]], [[0.46, 0.4], [-0.46, 0.4]], [[0.46, 0.4], [-0.46, 0.4], [0, 0.66]]],
};

/** Icon diameter (css px) for a resource at this zoom; very large sites get a boost. */
export function resourceIconSize(Rpx, norm = 0) {
  if (Rpx < RESOURCE_MIN_RPX) return 11 + 3 * smoothstep(RESOURCE_OVERVIEW_MIN_RPX, RESOURCE_MIN_RPX, Rpx) + 3 * smoothstep(0.6, 1, norm);
  const base = Math.max(16, Math.min(24, 16 + (Rpx - RESOURCE_MIN_RPX) * 0.2));
  return base + 5 * smoothstep(0.45, 1, norm);
}

// Zoomed out: each state's few headline sites, so the resource layer still says something at the national view.
// Per state: the biggest site of each type (relative to the largest site of that type nationally), then up to
// RESOURCE_OVERVIEW_PER_STATE of distinct types, with types already picked often elsewhere discounted so the
// overview isn't a wall of coal plants. Cached on the prepared resources as Map<cell, item>.
function overviewItems(w, filter = null, sig = "") {
  const res = w.resources;
  if (res.overview && res.overviewSig === sig) return res.overview;
  const owner = w.raw.owner;
  const cand = new Map(); // state -> Map<type, item>
  for (const [i, list] of res.byCell) {
    const st = owner[i];
    if (st == null || st < 0) continue;
    if (!cand.has(st)) cand.set(st, new Map());
    const m = cand.get(st);
    for (const it of list) {
      if (filter && !filter(it)) continue;
      const cur = m.get(it.type);
      if (!cur || (res.norm.get(it) ?? 0) > (res.norm.get(cur) ?? 0)) m.set(it.type, it);
    }
  }
  const used = new Map();
  const out = new Map();
  const states = [...cand.keys()].sort((a, b) => a - b);
  for (let round = 0; round < RESOURCE_OVERVIEW_PER_STATE; round++) {
    for (const st of states) {
      const m = cand.get(st);
      let best = null, bestScore = 0.02;
      for (const it of m.values()) {
        if (out.has(it.cell)) continue;
        const score = (res.norm.get(it) ?? 0) * 0.8 ** (used.get(it.type) ?? 0);
        if (score > bestScore) { best = it; bestScore = score; }
      }
      if (!best) continue;
      out.set(best.cell, best);
      m.delete(best.type);
      used.set(best.type, (used.get(best.type) ?? 0) + 1);
    }
  }
  res.overview = out;
  res.overviewSig = sig;
  return out;
}

/** A predicate for app.state.resourceFilter ({types?: Set<typeId>, minValue?: number}), or null for "all". */
export function resourcePredicate(f) {
  if (!f || (!f.types && !(f.minValue > 0))) return null;
  return (it) => (!f.types || f.types.has(it.type)) && (!(f.minValue > 0) || (Number.isFinite(it.value) && it.value >= f.minValue));
}
/** A string that changes whenever the filter's effect changes (for cache keys). */
export function resourceFilterSig(f) {
  if (!f) return "";
  return `${f.types ? [...f.types].sort().join(",") : "*"}|${f.minValue ?? ""}`;
}

function drawResources(ctx, vp, w, r0, r1, c0, c1, Rpx, filterSpec = null) {
  if (Rpx < RESOURCE_OVERVIEW_MIN_RPX) return [];
  const filter = resourcePredicate(filterSpec);
  const overview = Rpx < RESOURCE_MIN_RPX ? overviewItems(w, filter, resourceFilterSig(filterSpec)) : null;
  const { grid } = w;
  const R = grid.R;
  const { typeById, byCell, norm } = w.resources;
  const perCell = overview ? 1 : Rpx < 26 ? 1 : Rpx < 42 ? 2 : 3;
  const badges = !overview && Rpx >= 24;
  const toS = (x, y) => [(x - vp.x0) * vp.s, (y - vp.y0) * vp.s];

  // Visible cells, best first (the first item of each list is that cell's best), so the most important
  // sites win the screen-space declutter below.
  const cells = [];
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const i = r * grid.cols + c;
      if (overview) {
        const it = overview.get(i);
        if (it) cells.push([i, [it]]);
        continue;
      }
      let list = byCell.get(i);
      if (list && filter) list = list.filter(filter);
      if (list && list.length) cells.push([i, list]);
    }
  }
  const prio = overview ? (it) => -(norm?.get(it) ?? 0) : (it) => typeById.get(it.type).cat * 2 - (norm?.get(it) ?? 0);
  cells.sort((a, b) => prio(a[1][0]) - prio(b[1][0]));

  const placed = []; // [x, y, r]
  // Zoomed out, icons keep clear of each other (fewer, more important ones); zoomed in they may touch.
  const gap = overview ? 1.6 ** 2 : (1.3 - 0.45 * smoothstep(13, 30, Rpx)) ** 2;
  const free = (x, y, r) => placed.every(([px, py, pr]) => (px - x) ** 2 + (py - y) ** 2 > (pr + r) ** 2 * gap);
  const draws = [], extras = [];
  for (const [i, list] of cells) {
    const n = Math.min(perCell, list.length);
    const slots = overview ? [[0, 0]] : RES_SLOTS[w.cityByCell.has(i) ? "city" : "free"][n - 1];
    let shown = 0, last = null;
    for (let k = 0; k < n; k++) {
      const it = list[k];
      const size = resourceIconSize(Rpx, norm?.get(it) ?? 0);
      const [sx, sy] = toS(grid.cx(i) + slots[k][0] * R, grid.cy(i) + slots[k][1] * R);
      if (!free(sx, sy, size / 2)) continue;
      placed.push([sx, sy, size / 2]);
      draws.push({ it, sx, sy, size, dim: w.dim && w.dim[i] });
      shown++;
      last = [sx, sy, size];
    }
    if (badges && last && list.length > shown) extras.push([last, list.length - shown]);
  }

  // Draw lowest priority first so the important ones sit on top where they touch.
  for (let k = draws.length - 1; k >= 0; k--) {
    const { it, sx, sy, size, dim } = draws[k];
    const t = typeById.get(it.type);
    if (dim) ctx.globalAlpha = 0.45;
    // medallions carry their own soft cast shadow; the value-pip ring shows the site's size within its type
    const id = t.icon || `r-${t.id}`;
    const pips = Math.max(1, Math.round((norm?.get(it) ?? 0) * 5));
    if (!hasIcon(id) || !drawIcon(ctx, id, sx, sy, size, { bg: t.color || "#24384f", pips })) {
      ctx.beginPath();
      ctx.arc(sx, sy, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = css(t.rgb);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#c9a45c";
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  ctx.font = "700 9px -apple-system, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const [[sx, sy, size], n] of extras) {
    const text = `+${n}`;
    const bw = Math.max(14, ctx.measureText(text).width + 7), bh = 12;
    const bx = sx + size * 0.32, by = sy - size * 0.5 - 1;
    pill(ctx, bx, by, bw, bh);
    ctx.fillStyle = "rgba(18,14,8,.92)";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#c9a45c";
    ctx.stroke();
    ctx.fillStyle = "#f6e7bf";
    ctx.fillText(text, bx + bw / 2, by + bh / 2 + 0.5);
  }
  // Where each icon landed, in km (so hit tests and highlight rings survive pans of the cached layer).
  return draws.map((d) => ({ item: d.it, x: vp.x0 + d.sx / vp.s, y: vp.y0 + d.sy / vp.s, r: d.size / 2 }));
}

function pill(ctx, x, y, w, h) {
  const r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + r, r, Math.PI / 2, (3 * Math.PI) / 2);
  ctx.closePath();
}

// --- lens band edge ------------------------------------------------------------------------------------------------

// A thin bright line where in-band cells meet dimmed US cells, so the selected range reads as a region.
function drawBandEdge(ctx, w, r0, r1, c0, c1, s) {
  const { grid, dim } = w;
  const owner = w.raw.owner;
  ctx.beginPath();
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const i = r * grid.cols + c;
      if (owner[i] < 0 || dim[i]) continue;
      const x = grid.cx(i), y = grid.cy(i);
      for (let d = 0; d < 6; d++) {
        const j = grid.neighbour(i, d);
        if (j < 0 || owner[j] < 0 || !dim[j]) continue;
        const [ax, ay] = grid.corners[d], [bx, by] = grid.corners[(d + 1) % 6];
        ctx.moveTo(x + ax, y + ay);
        ctx.lineTo(x + bx, y + by);
      }
    }
  }
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(10,8,4,.55)";
  ctx.lineWidth = 3 / s;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,236,170,.85)";
  ctx.lineWidth = 1.3 / s;
  ctx.stroke();
}

// --- state names (screen space) ------------------------------------------------------------------------------------

export function stateLabelAlpha(lbl, Rpx, s) {
  const px = lbl.size * s;
  return smoothstep(8, 13, px) * (1 - smoothstep(13, 22, Rpx));
}

// Cells per state (for sizing postal-code labels of small states). Cached on w.
function stateCells(w) {
  if (!w._stateCells) {
    const n = new Int32Array(w.raw.states.length);
    for (const o of w.raw.owner) if (o >= 0) n[o]++;
    w._stateCells = n;
  }
  return w._stateCells;
}

function drawStateLabels(ctx, vp, w, Rpx) {
  const { s } = vp;
  const spaced = "letterSpacing" in ctx;
  const cells = stateCells(w);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  // Biggest labels first; a label that would collide with one already placed is dropped.
  const order = [...w.stateLabels].sort((a, b) => b.size - a.size);
  const placed = [];
  for (const lbl of order) {
    let a = stateLabelAlpha(lbl, Rpx, s);
    if (a < 0.02) continue;
    let px = Math.min(lbl.size * s, 110);
    const abbr = lbl.text.length <= 3 && /^[A-Z.]+$/.test(lbl.text); // ChinaCiv: 2-character Chinese names are full labels
    const cjk = /[\u3400-\u9fff]/.test(lbl.text);
    if (cjk) px = Math.min(px, 40); // ChinaCiv: two big ideographs read larger than a long run of capitals
    if (abbr) {
      // Small states (DE, RI, CT, NJ, MD, DC...): a modest postal code that must fit the state on screen.
      const extent = Math.sqrt(cells[lbl.state] || 1) * Rpx * 1.6;
      px = Math.min(px, 15, extent * 0.42);
      if (px < 9) continue;
      a = Math.min(a, smoothstep(9, 11, px));
    }
    const sx = (lbl.x - vp.x0) * s, sy = (lbl.y - vp.y0) * s;
    if (sx < -600 || sy < -200 || sx > vp.cssW + 600 || sy > vp.cssH + 200) continue;
    // Axis-aligned box of the rotated text (approximate width from the em estimate).
    const tw = px * (lbl.text.length * (cjk ? 1 : 0.78) + (cjk ? CJK_LABEL_SPACING : LABEL_SPACING) * (lbl.text.length - 1)), th = px * 0.8;
    const c = Math.abs(Math.cos(lbl.angle)), sn = Math.abs(Math.sin(lbl.angle));
    const bw = (tw * c + th * sn) / 2, bh = (tw * sn + th * c) / 2;
    const box = [sx - bw, sy - bh, sx + bw, sy + bh];
    if (placed.some((p) => box[0] < p[2] && p[0] < box[2] && box[1] < p[3] && p[1] < box[3])) continue;
    placed.push(box);
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(lbl.angle);
    ctx.font = `${abbr ? "bold " : ""}${px.toFixed(1)}px ${LABEL_FONT}`;
    ctx.lineWidth = Math.max(abbr ? 2.5 : 1.5, px * 0.07);
    ctx.strokeStyle = `rgba(25,18,10,${(abbr ? 0.6 : 0.45) * a})`;
    ctx.fillStyle = `rgba(255,246,222,${(abbr ? 0.8 : 0.72) * a})`;
    const gap = px * (abbr ? 0.12 : cjk ? CJK_LABEL_SPACING : LABEL_SPACING);
    if (spaced) {
      ctx.letterSpacing = `${gap.toFixed(1)}px`;
      // letterSpacing also adds space after the last glyph; shift by half of it to stay centred.
      ctx.strokeText(lbl.text, gap / 2, 0);
      ctx.fillText(lbl.text, gap / 2, 0);
      ctx.letterSpacing = "0px";
    } else {
      const widths = [...lbl.text].map((ch) => ctx.measureText(ch).width);
      let x = -(widths.reduce((p, q) => p + q, 0) + gap * (widths.length - 1)) / 2;
      ctx.textAlign = "left";
      [...lbl.text].forEach((ch, k) => {
        ctx.strokeText(ch, x, 0);
        ctx.fillText(ch, x, 0);
        x += widths[k] + gap;
      });
      ctx.textAlign = "center";
    }
    ctx.restore();
  }
}

// --- per-frame overlay ------------------------------------------------------------------------------------------

const reducedMotion = (() => {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)");
  } catch {
    return { matches: false };
  }
})();

// The selected state's border pulses for a short while after it is selected, then rests on a still frame, so an
// idle map draws nothing. The pulse period is 2π·420 ms; the animation stops 1.5 periods in, where the pulse is
// back at 0.6 (the still / reduced-motion value), so the hand-off is seamless.
const SELECT_ANIM_MS = Math.round(420 * (3 * Math.PI - Math.asin(0.2))); // ≈ 3.87 s
let selAnim = { key: null, t0: 0 };

/** True while the overlay animates (the selected state's border); main's draw loop keeps requesting frames. */
export function isAnimating(state) {
  if (state?.selectedState == null || reducedMotion.matches) return false;
  // A selection the overlay has not drawn yet starts its animation on the next frame.
  return selAnim.key !== state.selectedState || performance.now() - selAnim.t0 < SELECT_ANIM_MS;
}

// Selected state (dim the rest, glowing marching border), hover outline and the selected city's ring.
// ctx is in world transform. `now` (ms) drives the animation; it defaults to performance.now().
export function drawOverlay(ctx, cam, w, state, now = performance.now()) {
  const { grid } = w;
  const s = cam.scale;
  const si = state.selectedState != null ? stateIndex(w, state.selectedState) : -1;
  // now === 0 (share images) draws the still frame and leaves the live animation's clock alone.
  if (now && selAnim.key !== state.selectedState) selAnim = { key: state.selectedState, t0: now };
  const t = now && !reducedMotion.matches && si >= 0 ? Math.min(SELECT_ANIM_MS, Math.max(0, now - selAnim.t0)) : -1;
  if (si >= 0) drawSelectedState(ctx, cam, w, si, t);
  if (state.selectedCity && state.selectedCity.cell != null) {
    const i = state.selectedCity.cell;
    hexPath(ctx, grid, i, 1.0);
    ctx.lineJoin = "round";
    ctx.strokeStyle = `rgba(255,214,110,.5)`;
    ctx.lineWidth = Math.max(5 / s, grid.R * 0.16);
    ctx.stroke();
    ctx.strokeStyle = "#ffe9a8";
    ctx.lineWidth = Math.max(2 / s, grid.R * 0.05);
    ctx.stroke();
  }
  if (state.hoverCell >= 0) {
    hexPath(ctx, grid, state.hoverCell);
    ctx.strokeStyle = "rgba(255,240,200,.9)";
    ctx.lineWidth = 2 / s;
    ctx.stroke();
  }
}

let dimPath = null, dimFor = -1, dimWorld = null;
// t: ms into the selection animation (it rests at SELECT_ANIM_MS), or -1 for the still frame.
function drawSelectedState(ctx, cam, w, si, t) {
  const s = cam.scale;
  const o = stateOutline(w, si);
  // Everything outside the state, as one even-odd path: a big rectangle with the state's loops cut out.
  if (dimFor !== si || dimWorld !== w) {
    dimPath = new Path2D();
    dimPath.rect(-1e5, -1e5, 2e5 + w.raw.width, 2e5 + w.raw.height);
    dimPath.addPath(o.path);
    dimFor = si;
    dimWorld = w;
  }
  ctx.save();
  ctx.fillStyle = "rgba(6,10,18,.4)";
  ctx.fill(dimPath, "evenodd");
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const pulse = t >= 0 ? 0.5 + 0.5 * Math.sin(t / 420) : 0.6;
  // Glow: wide soft strokes under a crisp line.
  ctx.strokeStyle = `rgba(255,200,90,${0.12 + 0.1 * pulse})`;
  ctx.lineWidth = 11 / s;
  ctx.stroke(o.path);
  ctx.strokeStyle = `rgba(255,214,120,${0.28 + 0.14 * pulse})`;
  ctx.lineWidth = 5.5 / s;
  ctx.stroke(o.path);
  ctx.strokeStyle = "rgba(30,20,6,.85)";
  ctx.lineWidth = 3.2 / s;
  ctx.stroke(o.path);
  ctx.strokeStyle = "#ffe7a3";
  ctx.lineWidth = 2 / s;
  ctx.setLineDash([9 / s, 6 / s]);
  ctx.lineDashOffset = -((Math.max(0, t) / 1000) * 22) / s;
  ctx.stroke(o.path);
  ctx.restore();
}
