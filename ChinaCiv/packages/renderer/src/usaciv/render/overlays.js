// Per-frame layers on top of the cached map: the highlight (app.state.highlight) and extension overlays
// (app.registerOverlay). Both are drawn by main.js every frame, after map.js drawOverlay (selection / hover).
//
// Highlight: state.highlight = {cells?: Set<cell>, cities?: Set<cityId>, states?: Set<stateIdx>,
//                              resources?: Set<itemIndex into resources.json items>, dimOthers?: bool, color?: css}
//   * the highlighted cell group = cells ∪ every cell of the listed states
//   * dimOthers: everything outside that group is darkened (all land, if the group is empty)
//   * the group is outlined along its outer edge (a dark under-stroke, then `color`)
//   * highlighted cities and resources get a ring in `color`
// The derived geometry is cached per highlight object; replace the object (or call app.invalidate()) after
// mutating its sets.
import { hexPath } from "./map.js";

const DEFAULT_COLOR = "#ffe08a";
const cacheByHighlight = new WeakMap();
let version = 0;

/** Forget cached highlight geometry (main.js calls this from app.invalidate()). */
export function invalidateHighlight() {
  version++;
}

function geometry(w, h) {
  const sig = `${version}|${h.cells?.size ?? -1}|${h.states ? [...h.states].join(",") : ""}`;
  let g = cacheByHighlight.get(h);
  if (g && g.sig === sig && g.w === w) return g;
  const { grid } = w;
  const owner = w.raw.owner;
  const mask = new Uint8Array(grid.size);
  let count = 0;
  if (h.cells) for (const i of h.cells) if (i >= 0 && i < grid.size && !mask[i]) { mask[i] = 1; count++; }
  if (h.states && h.states.size) {
    for (let i = 0; i < grid.size; i++) if (!mask[i] && h.states.has(owner[i])) { mask[i] = 1; count++; }
  }
  // Even-odd "everything but the group" path, and the group's outer edges.
  const dim = new Path2D();
  dim.rect(-1e5, -1e5, 2e5 + w.raw.width, 2e5 + w.raw.height);
  const edge = new Path2D();
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < grid.size; i++) {
    if (!mask[i]) continue;
    const x = grid.cx(i), y = grid.cy(i);
    const C = grid.corners;
    dim.moveTo(x + C[0][0], y + C[0][1]);
    for (let k = 1; k < 6; k++) dim.lineTo(x + C[k][0], y + C[k][1]);
    dim.closePath();
    for (let d = 0; d < 6; d++) {
      const j = grid.neighbour(i, d);
      if (j >= 0 && mask[j]) continue;
      const [ax, ay] = C[d], [bx, by] = C[(d + 1) % 6];
      edge.moveTo(x + ax, y + ay);
      edge.lineTo(x + bx, y + by);
    }
    x0 = Math.min(x0, x - grid.R); y0 = Math.min(y0, y - grid.R);
    x1 = Math.max(x1, x + grid.R); y1 = Math.max(y1, y + grid.R);
  }
  g = { sig, w, mask, count, dim, edge, bbox: count ? { x0, y0, x1, y1 } : null };
  cacheByHighlight.set(h, g);
  return g;
}

/** Bounding box (km) of the highlighted cell group, or null. Handy for app.fitBounds(). */
export function highlightBounds(w, h) {
  return h ? geometry(w, h).bbox : null;
}

/**
 * Draw state.highlight. ctx is in the WORLD transform (as for map.js drawOverlay).
 * opts: resourceHits = [{item, x, y, r}] (from drawStatic's opts.hits.resources), items = resources.json items,
 *       cityById = Map<id, city>.
 */
export function drawHighlight(ctx, cam, w, state, opts = {}) {
  const h = state.highlight;
  if (!h) return;
  const s = cam.scale;
  const color = h.color || DEFAULT_COLOR;
  const g = geometry(w, h);
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (h.dimOthers) {
    ctx.fillStyle = "rgba(6,10,18,.5)";
    ctx.fill(g.dim, "evenodd");
  }
  if (g.count) {
    ctx.strokeStyle = "rgba(20,14,4,.8)";
    ctx.lineWidth = 4 / s;
    ctx.stroke(g.edge);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 / s;
    ctx.stroke(g.edge);
  }
  const ring = (x, y, r) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(20,14,4,.8)";
    ctx.lineWidth = 4.5 / s;
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2 / s;
    ctx.stroke();
  };
  if (h.cities && h.cities.size) {
    const byId = opts.cityById;
    for (const id of h.cities) {
      const city = byId ? byId.get(id) : null;
      if (!city || city.cell == null) continue;
      if (h.dimOthers && !g.mask[city.cell]) {
        // Lift the city's own hex out of the dimming.
        hexPath(ctx, w.grid, city.cell, 1);
        ctx.fillStyle = "rgba(255,240,200,.08)";
        ctx.fill();
      }
      ring(w.grid.cx(city.cell), w.grid.cy(city.cell), Math.max(w.grid.R * 0.95, 9 / s));
    }
  }
  if (h.resources && h.resources.size && opts.items) {
    const placed = new Map((opts.resourceHits || []).map((p) => [p.item, p]));
    for (const idx of h.resources) {
      const it = opts.items[idx];
      if (!it) continue;
      const p = placed.get(it);
      if (p) ring(p.x, p.y, p.r / s + 3 / s);
      else if (it.cell != null && it.cell >= 0) ring(w.grid.cx(it.cell), w.grid.cy(it.cell), 9 / s);
    }
  }
  ctx.restore();
}

/**
 * Draw registered overlays ({id, z, space: "world"|"screen", draw(ctx, cam, app)}) whose z is in [zMin, zMax).
 * World overlays get the map transform (km), screen overlays css px (dpr applied). A throwing overlay is logged
 * once and skipped, so one broken extension cannot stop the map from drawing.
 */
export function drawOverlays(ctx, cam, overlays, app, { dpr = 1, zMin = -Infinity, zMax = Infinity } = {}) {
  const s = cam.scale;
  for (const o of overlays) {
    const z = o.z ?? 0;
    if (z < zMin || z >= zMax || o.hidden) continue;
    ctx.save();
    if (o.space === "screen") ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    else ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * (cam.w / 2 - cam.x * s), dpr * (cam.h / 2 - cam.y * s));
    try {
      o.draw(ctx, cam, app);
    } catch (err) {
      if (!o._warned) {
        o._warned = true;
        console.error(`overlay "${o.id}" failed`, err);
      }
    }
    ctx.restore();
  }
}
