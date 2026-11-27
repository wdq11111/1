// Derived, render-ready data computed once from world.json (+ lens colours on demand).
// Works with world.json v2 (water / relief / cover / pct / tables) and falls back to v1 (`terrain` codes).
import { makeGrid, hash01 } from "./hex.js";
import { V1_TERRAIN, resolveTables, elevColor, OCEAN_DEEP } from "./terrain.js";
import { css, mix, shade, desaturate, rampColor, parseHex, STATE_PALETTE } from "./color.js";

export const WATER = -1;
export const FOREIGN = -2;

// pct group → the cover id whose colour represents it (for blending mixed cells).
const PCT_COVER = { forest: 3, crop: 7, pasture: 6, grass: 5, shrub: 4, wetland: 8, developed: 9 };

export function prepareWorld(world, cities, extras = {}) {
  const grid = makeGrid(world.grid);
  const n = grid.size;
  const { owner, elev } = world;
  const v2 = Array.isArray(world.water);

  // Normalise to the v2 arrays whatever the file version.
  const water = v2 ? world.water : world.terrain.map((t) => V1_TERRAIN[t]?.water || 0);
  const relief = Array.isArray(world.relief) ? world.relief : (world.terrain || []).map((t) => V1_TERRAIN[t]?.relief || 0);
  const cover = Array.isArray(world.cover) ? world.cover : new Array(n).fill(0);
  const pct = world.pct && typeof world.pct === "object" ? world.pct : null;
  const tables = resolveTables(world.tables);

  // Hill-shading: light from the north-west, from neighbour elevation differences (m per km).
  const shadeK = new Float32Array(n);
  const e = (j, fallback) => (j < 0 || water[j] ? fallback : elev[j]);
  for (let i = 0; i < n; i++) {
    if (water[i]) continue;
    const z = elev[i];
    const dzx = e(grid.neighbour(i, 0), z) - e(grid.neighbour(i, 3), z);
    const north = (e(grid.neighbour(i, 4), z) + e(grid.neighbour(i, 5), z)) / 2;
    const south = (e(grid.neighbour(i, 1), z) + e(grid.neighbour(i, 2), z)) / 2;
    const illum = dzx / (2 * grid.W) + (south - north) / (3 * grid.R);
    shadeK[i] = Math.max(-0.32, Math.min(0.32, illum * 0.03));
  }

  // State colours: greedy graph colouring so neighbours differ.
  const nStates = world.states.length;
  const adj = Array.from({ length: nStates }, () => new Set());
  for (let i = 0; i < n; i++) {
    if (owner[i] < 0) continue;
    for (let d = 0; d < 3; d++) {
      const j = grid.neighbour(i, d);
      if (j >= 0 && owner[j] >= 0 && owner[j] !== owner[i]) {
        adj[owner[i]].add(owner[j]);
        adj[owner[j]].add(owner[i]);
      }
    }
  }
  const stateColor = new Array(nStates);
  const order = [...Array(nStates).keys()].sort((a, b) => adj[b].size - adj[a].size);
  for (const s of order) {
    const used = new Set([...adj[s]].map((t) => stateColor[t]).filter(Boolean));
    let k = (s * 5) % STATE_PALETTE.length;
    for (let m = 0; m < STATE_PALETTE.length && used.has(STATE_PALETTE[k]); m++) k = (k + 1) % STATE_PALETTE.length;
    stateColor[s] = STATE_PALETTE[k];
  }

  // Border segments, grouped for batched drawing. coastLines also carry the water-side normal for foam.
  const bands = new Map(); // stateIdx -> [x0,y0,x1,y1, ix0,iy0,ix1,iy1, ...]
  const stateLines = [], nationLines = [], coastLines = [];
  const INSET = 0.16;
  for (let i = 0; i < n; i++) {
    const o = owner[i];
    if (o < 0) continue;
    const cx = grid.cx(i), cy = grid.cy(i);
    for (let d = 0; d < 6; d++) {
      const j = grid.neighbour(i, d);
      const oj = j < 0 ? WATER : owner[j];
      if (oj === o) continue;
      const [ax, ay] = grid.corners[d];
      const [bx, by] = grid.corners[(d + 1) % 6];
      const seg = [cx + ax, cy + ay, cx + bx, cy + by];
      if (!bands.has(o)) bands.set(o, []);
      bands.get(o).push(...seg, cx + ax * (1 - INSET), cy + ay * (1 - INSET), cx + bx * (1 - INSET), cy + by * (1 - INSET));
      if (oj >= 0) { if (j > i) stateLines.push(...seg); }
      else if (oj === FOREIGN) nationLines.push(...seg);
      else coastLines.push(...seg);
    }
  }
  // Foreign coasts too (for foam around Canada / Mexico).
  const foreignCoast = [];
  for (let i = 0; i < n; i++) {
    if (owner[i] !== FOREIGN) continue;
    const cx = grid.cx(i), cy = grid.cy(i);
    for (let d = 0; d < 6; d++) {
      const j = grid.neighbour(i, d);
      if (j < 0 || owner[j] !== WATER) continue;
      const [ax, ay] = grid.corners[d];
      const [bx, by] = grid.corners[(d + 1) % 6];
      foreignCoast.push(cx + ax, cy + ay, cx + bx, cy + by);
    }
  }

  const cityByCell = new Map();
  for (const c of cities) if (c.cell != null && !cityByCell.has(c.cell)) cityByCell.set(c.cell, c);

  const prepared = {
    raw: world, version: v2 ? 2 : 1, grid, water, relief, cover, pct, tables, shadeK, stateColor, bands,
    stateLines, nationLines, coastLines, foreignCoast, cityByCell, coverRGB: null, stateLabels: null,
    resources: null, terrainColors: null, colors: null, rgb: null, dim: null,
  };
  prepared.coverRGB = tables.cover.reduce((a, t) => ((a[t.id] = t.color ? parseHex(t.color) : null), a), []);
  prepared.waterRGB = tables.water.reduce((a, t) => ((a[t.id] = t.color ? parseHex(t.color) : null), a), []);
  prepared.terrainColors = terrainColors(prepared);
  prepared.stateLabels = computeStateLabels(prepared);
  prepared.resources = prepareResources(extras.resources);
  return prepared;
}

export const isCapital = (city) => (city.capital != null ? !!city.capital : city.id === "47900");

// --- tile colours ---------------------------------------------------------------------------------------------

function landRGB(w, i) {
  const { elev } = w.raw;
  const cv = w.cover[i];
  let c = cv > 0 && w.coverRGB[cv] ? w.coverRGB[cv] : elevColor(elev[i]);
  if (cv > 0 && w.pct) {
    // Blend a little of the cell's mixture, so a farm cell with 40% forest reads greener than a pure one.
    let tot = 0, r = 0, g = 0, b = 0;
    for (const [key, id] of Object.entries(PCT_COVER)) {
      const p = w.pct[key]?.[i] || 0;
      const col = w.coverRGB[id];
      if (!p || !col) continue;
      tot += p; r += col[0] * p; g += col[1] * p; b += col[2] * p;
    }
    if (tot > 0) c = mix(c, [r / tot, g / tot, b / tot], 0.3);
  }
  if (cv > 0) {
    // Subtle elevation tint: high country goes dustier and paler.
    const t = Math.max(0, Math.min(1, (elev[i] - 300) / 2800));
    c = mix(c, [176, 160, 128], t * 0.28);
  }
  const rel = w.relief[i];
  if (rel >= 2) c = mix(c, rel === 3 ? [200, 204, 208] : [128, 116, 102], rel === 3 ? 0.45 : 0.32);
  else if (rel === 1) c = shade(c, -0.05);
  return c;
}

function terrainRGB(w, i) {
  const { elev, owner } = w.raw;
  const wt = w.water[i];
  if (wt) {
    const base = w.waterRGB[wt] || w.waterRGB[1];
    if (wt === 1) return mix(base, OCEAN_DEEP, Math.min(1, Math.max(0, -elev[i] / 4000)));
    if (wt === 2) return shade(base, Math.max(-0.08, Math.min(0.06, (elev[i] + 100) / 1500)));
    return base;
  }
  let c = landRGB(w, i);
  c = shade(c, (hash01(i, 7) - 0.5) * 0.08 + w.shadeK[i]);
  if (owner[i] === FOREIGN) c = mix(shade(desaturate(c, 0.6), -0.3), [70, 82, 96], 0.25); // fog of war
  return c;
}

/** Terrain-view colour ([r, g, b]) of every cell. Recompute (and re-apply the lens) after changing the cell
 *  arrays or w.shadeK of a prepared world, e.g. in the art gallery's synthetic worlds. */
export function terrainColors(w) {
  const rgb = [];
  for (let i = 0; i < w.grid.size; i++) rgb.push(terrainRGB(w, i));
  return rgb;
}

const NO_DATA = parseHex("#55534d");
const DIM_RGB = [36, 42, 52];

export function lensScale(lens) {
  const [d0, d1] = lens.domain;
  if (lens.scale === "log") {
    const l0 = Math.log(d0), l1 = Math.log(d1);
    return (v) => (Math.log(Math.max(v, 1e-9)) - l0) / (l1 - l0);
  }
  return (v) => (v - d0) / (d1 - d0);
}

// Sets w.rgb / w.colors for the terrain view (lens = null) or a lens. `band` = [t0, t1] in normalised lens
// units (0..1 along the ramp): cells whose value falls outside it are dimmed, and w.dim[i] is set.
export function applyLens(w, lens, band = null) {
  const n = w.grid.size;
  const rgb = new Array(n);
  const dim = new Uint8Array(n);
  if (!lens) {
    for (let i = 0; i < n; i++) rgb[i] = w.terrainColors[i];
  } else {
    const stops = lens.ramp.map(parseHex);
    const t = lensScale(lens);
    const { owner } = w.raw;
    for (let i = 0; i < n; i++) {
      const base = w.terrainColors[i];
      if (owner[i] < 0) {
        rgb[i] = w.water[i] ? base : shade(desaturate(base, 0.7), -0.2);
        continue;
      }
      const v = lens.values[i];
      const tv = v == null ? null : t(v);
      let c = tv == null ? NO_DATA : rampColor(stops, tv);
      if (band && (tv == null || tv < band[0] || tv > band[1])) {
        // Out of band: mostly grey, pushed toward a cool slate so it recedes like fog rather than turning muddy.
        c = mix(desaturate(c, 0.92), DIM_RGB, 0.66);
        dim[i] = 1;
      }
      rgb[i] = shade(c, w.shadeK[i] * 0.6);
    }
  }
  w.rgb = rgb;
  w.dim = band ? dim : null;
  w.colors = rgb.map((c) => css(c));
}

// --- state labels ---------------------------------------------------------------------------------------------

// For each state: anchor at the hex farthest from its border (BFS), angle from the PCA of the hex centres of
// that part of the state (clamped to ±35°), and a font size (km) that fits the state's extent.
function computeStateLabels(w) {
  const { grid } = w;
  const { owner, states } = w.raw;
  const n = grid.size;
  const dist = new Int16Array(n).fill(-1);
  const queue = new Int32Array(n);
  let qh = 0, qt = 0;
  for (let i = 0; i < n; i++) {
    if (owner[i] < 0) continue;
    for (let d = 0; d < 6; d++) {
      const j = grid.neighbour(i, d);
      if (j < 0 || owner[j] !== owner[i]) { dist[i] = 0; queue[qt++] = i; break; }
    }
  }
  while (qh < qt) {
    const i = queue[qh++];
    for (let d = 0; d < 6; d++) {
      const j = grid.neighbour(i, d);
      if (j >= 0 && dist[j] < 0 && owner[j] === owner[i]) { dist[j] = dist[i] + 1; queue[qt++] = j; }
    }
  }

  // Rough centroid per state, used to break ties between equally deep hexes.
  const cxs = new Float64Array(states.length), cys = new Float64Array(states.length), cnt = new Int32Array(states.length);
  for (let i = 0; i < n; i++) {
    const o = owner[i];
    if (o < 0) continue;
    cxs[o] += grid.cx(i); cys[o] += grid.cy(i); cnt[o]++;
  }
  const best = new Int32Array(states.length).fill(-1);
  const score = (i) => {
    const o = owner[i];
    return dist[i] * 1e6 - Math.hypot(grid.cx(i) - cxs[o] / cnt[o], grid.cy(i) - cys[o] / cnt[o]);
  };
  for (let i = 0; i < n; i++) {
    const o = owner[i];
    if (o < 0) continue;
    if (best[o] < 0 || score(i) > score(best[o])) best[o] = i;
  }

  const labels = [];
  const seen = new Uint8Array(n);
  for (let s = 0; s < states.length; s++) {
    const a = best[s];
    if (a < 0) continue;
    // PCA over the connected part that holds the anchor (Michigan's Lower Peninsula, not both).
    let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, m = 0;
    const part = [a];
    seen[a] = 1;
    for (let k = 0; k < part.length; k++) {
      const i = part[k];
      const x = grid.cx(i), y = grid.cy(i);
      sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; m++;
      for (let d = 0; d < 6; d++) {
        const j = grid.neighbour(i, d);
        if (j >= 0 && !seen[j] && owner[j] === s) { seen[j] = 1; part.push(j); }
      }
    }
    const mx = sx / m, my = sy / m;
    const vxx = sxx / m - mx * mx, vyy = syy / m - my * my, vxy = sxy / m - mx * my;
    const tr = vxx + vyy, det = vxx * vyy - vxy * vxy;
    const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
    const l1 = tr / 2 + disc, l2 = Math.max(tr / 2 - disc, 1);
    let angle = 0.5 * Math.atan2(2 * vxy, vxx - vyy);
    if (angle > Math.PI / 2) angle -= Math.PI;
    if (angle < -Math.PI / 2) angle += Math.PI;
    if (l1 / l2 < 1.6) angle = 0; // roundish states read best horizontal
    const lim = (35 * Math.PI) / 180;
    angle = Math.max(-lim, Math.min(lim, angle));
    // Extents along/across the text direction (uniform spread: length ≈ 3.46 σ), plus a hex's own size.
    const across = (ang) => {
      const ux = Math.cos(ang), uy = Math.sin(ang);
      return 3.46 * Math.sqrt(Math.max(vxx * uy * uy - 2 * vxy * ux * uy + vyy * ux * ux, 0)) + grid.W;
    };
    const depth = (dist[a] + 0.7) * 2 * grid.H; // how thick the state is at the anchor
    const name = states[s].name.toUpperCase();
    // Try the PCA angle (slightly preferred), horizontal and halfway; keep the largest text that stays inside.
    const tries = [angle, 0, angle / 2].filter((t, k, arr) => arr.findIndex((u) => Math.abs(u - t) < 0.03) === k);
    const bestFit = (text) => {
      let pick = null;
      for (const ang of tries) {
        const f = fitAlong(w, s, a, ang, text, Math.min(0.62 * across(ang), 0.75 * depth, 150));
        const score = f.size * (ang === angle ? 1.1 : 1);
        if (!pick || score > pick.score) pick = { ...f, text, angle: ang, score };
      }
      return pick;
    };
    let pick = bestFit(name);
    // Names that cannot be set at a readable size fall back to the postal code (capped, so it stays modest).
    if (pick.size < 18 && states[s].abbr) {
      pick = bestFit(states[s].abbr);
      pick.size = Math.min(pick.size, 40);
    }
    labels.push({ state: s, text: pick.text, x: pick.x, y: pick.y, angle: pick.angle, size: pick.size, depth: dist[a] });
  }
  return labels;
}

// State-name letter spacing (fraction of the font size); map.js draws with the same values.
export const LABEL_FONT = '"Palatino Linotype", Palatino, "Book Antiqua", Georgia, "Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC", "Noto Serif SC", serif'; // ChinaCiv: CJK fallbacks
export const LABEL_SPACING = 0.32;
export const CJK_LABEL_SPACING = 0.75; // ChinaCiv: Chinese region names are set wide, like the spaced capitals
let measureCtx = null;
/** Width of `text` in em at LABEL_FONT with LABEL_SPACING between letters (falls back to an estimate). */
function labelEm(text) {
  try {
    measureCtx ??= document.createElement("canvas").getContext("2d");
    measureCtx.font = `100px ${LABEL_FONT}`;
    let wsum = 0;
    for (const ch of text) wsum += measureCtx.measureText(ch).width;
    return wsum / 100 + (/[\u3400-\u9fff]/.test(text) ? CJK_LABEL_SPACING : LABEL_SPACING) * (text.length - 1);
  } catch {
    return text.length * 1.02;
  }
}

// Fit `text` on a baseline through hex `a` at angle `ang`, staying inside state `s`: walk the baseline (and
// two parallel lines at ± half the cap height) both ways until the state ends, re-centre on the free run and
// size the text to ~92% of it. Iterates because the cap height depends on the size.
function fitAlong(w, s, a, ang, text, cap) {
  const { grid } = w, owner = w.raw.owner;
  const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
  const em = labelEm(text);
  const step = grid.H * 0.25;
  const inside = (x, y) => {
    const i = grid.cellAt(x, y);
    return i >= 0 && owner[i] === s;
  };
  const run = (x, y, dir) => {
    let t = 0;
    while (t < 4000 && inside(x + ux * (t + step) * dir, y + uy * (t + step) * dir)) t += step;
    return t;
  };
  let x = grid.cx(a), y = grid.cy(a), size = cap;
  for (let it = 0; it < 4; it++) {
    const h = 0.36 * size; // half the cap height of a serif capital
    let lo = Infinity, hi = Infinity;
    for (const off of [0, -h, h]) {
      const px = x + nx * off, py = y + ny * off;
      if (!inside(px, py)) { if (off === 0) lo = hi = 0; continue; }
      lo = Math.min(lo, run(px, py, -1));
      hi = Math.min(hi, run(px, py, 1));
    }
    const len = lo + hi + grid.H * 0.6; // a little slack for the half hex at each end
    const shift = (hi - lo) / 2;
    x += ux * shift; y += uy * shift;
    size = Math.min(cap, (0.92 * len) / em);
  }
  return { x, y, size };
}


// --- resources ------------------------------------------------------------------------------------------------

// resources.json → {types, typeById, byCell: Map<cell, items sorted best-first>, norm: Map<item, 0..1>}.
// Null if not loaded. Priority: energy > minerals > agriculture, then the biggest site (value relative to the
// largest site of the same type, so MW and tonnes compare), then the type order in resources.json.
export const RESOURCE_CATEGORY_RANK = { energy: 0, mineral: 1, agri: 2 };

function prepareResources(res) {
  if (!res || !Array.isArray(res.items) || !Array.isArray(res.types)) return null;
  const typeById = new Map(res.types.map((t, k) => [t.id, {
    ...t, rank: k, rgb: parseHex(t.color || "#c9a45c"), cat: RESOURCE_CATEGORY_RANK[t.category] ?? 3, max: 0,
  }]));
  for (const it of res.items) {
    const t = typeById.get(it.type);
    if (t && Number.isFinite(it.value) && it.value > t.max) t.max = it.value;
  }
  const norm = new Map();
  const byCell = new Map();
  for (const it of res.items) {
    if (it.cell == null || it.cell < 0 || !typeById.has(it.type)) continue;
    const t = typeById.get(it.type);
    norm.set(it, t.max > 0 && Number.isFinite(it.value) ? Math.max(0, it.value / t.max) : 0);
    if (!byCell.has(it.cell)) byCell.set(it.cell, []);
    byCell.get(it.cell).push(it);
  }
  const key = (it) => typeById.get(it.type);
  for (const list of byCell.values()) {
    list.sort((a, b) => key(a).cat - key(b).cat || norm.get(b) - norm.get(a) || key(a).rank - key(b).rank);
  }
  return { types: res.types, typeById, byCell, norm, count: res.items.length };
}

// --- state outlines (selection highlight) ----------------------------------------------------------------------

/** Resolve a state reference (index, abbr, fips, or {abbr|fips|index}) to its index in world.states, or -1. */
export function stateIndex(w, ref) {
  if (ref == null) return -1;
  const states = w.raw.states;
  if (typeof ref === "number") return ref >= 0 && ref < states.length ? ref : -1;
  if (typeof ref === "object") {
    if (Number.isInteger(ref.index)) return stateIndex(w, ref.index);
    ref = ref.abbr ?? ref.fips ?? null;
    if (ref == null) return -1;
  }
  const s = String(ref);
  return states.findIndex((st) => st.abbr === s || st.fips === s);
}

/** Closed outline loops of a state as flat [x0, y0, x1, y1, ...] arrays (km), plus a Path2D of them. Cached. */
export function stateOutline(w, s) {
  w.stateOutlines ??= new Map();
  let o = w.stateOutlines.get(s);
  if (o) return o;
  const { grid } = w;
  const owner = w.raw.owner;
  // Boundary edges, each running clockwise around its cell (corner d → d + 1), so they chain head to tail.
  const key = (x, y) => `${Math.round(x * 20)},${Math.round(y * 20)}`;
  const from = new Map();
  const edges = [];
  for (let i = 0; i < grid.size; i++) {
    if (owner[i] !== s) continue;
    const cx = grid.cx(i), cy = grid.cy(i);
    for (let d = 0; d < 6; d++) {
      const j = grid.neighbour(i, d);
      if (j >= 0 && owner[j] === s) continue;
      const [ax, ay] = grid.corners[d], [bx, by] = grid.corners[(d + 1) % 6];
      const e = { ax: cx + ax, ay: cy + ay, bx: cx + bx, by: cy + by, used: false };
      edges.push(e);
      const k = key(e.ax, e.ay);
      if (!from.has(k)) from.set(k, []);
      from.get(k).push(e);
    }
  }
  const loops = [];
  for (const e0 of edges) {
    if (e0.used) continue;
    const pts = [e0.ax, e0.ay];
    let e = e0;
    while (e && !e.used) {
      e.used = true;
      pts.push(e.bx, e.by);
      e = (from.get(key(e.bx, e.by)) || []).find((n) => !n.used);
    }
    loops.push(pts);
  }
  const path = new Path2D();
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of loops) {
    path.moveTo(p[0], p[1]);
    for (let k = 2; k < p.length; k += 2) {
      path.lineTo(p[k], p[k + 1]);
      x0 = Math.min(x0, p[k]); y0 = Math.min(y0, p[k + 1]); x1 = Math.max(x1, p[k]); y1 = Math.max(y1, p[k + 1]);
    }
    path.closePath();
  }
  o = { loops, path, bbox: { x0, y0, x1, y1 } };
  w.stateOutlines.set(s, o);
  return o;
}

export { css };
