// Water art: the ocean's wave texture, per-cell water decoration (lake colour and depth, shelf, crests, glints), the
// smoothed shore (rounded shoreline, shallows, foam, sand, surf lines, lake shore highlight) and rivers (tapered, with
// banks and a lighter centre line). The flat water tile colours come from world.js (w.colors, darker with depth) and
// are filled by render/map.js; lakes are repainted here in one brighter colour (LAKE_RGB) so no per-hex step shows.
//
// Interface (used by render/map.js and web/dev/gallery.js):
//
//   drawWater(ctx, vp, w, cells, {Rpx, s, lod})
//     Everything that goes on top of the water tiles and under the land: soft blending between sea tiles of
//     different depth (so no hex steps show), texture and per-cell glyphs. It also
//     QUEUES the shore pass (drawShore) for the next drawRivers() call on the same world, because the shore must
//     be drawn after the land tiles.
//     ctx    2D context; may be in any transform on entry, is left in the WORLD transform of `vp`
//     vp     static-layer viewport {x0, y0, s, dpr} (km origin of the canvas, css px per km, device px ratio)
//     w      prepared world (needs grid, water[], colors[], raw.elev)
//     cells  iterable of visible cell indices (land cells are ignored)
//   The pieces, for callers that need them separately:
//     drawOceanTexture(ctx, vp, {Rpx}?)          screen-space wave pattern anchored to the world (all water)
//     drawWaterGlyphs(ctx, cells, w, opts)      per-cell decoration of ocean (1), coast (2) and lake (3) cells:
//                                               the lake fill and its soft depth, the shelf glow, crests, glints
//     drawShore(ctx, w, cells, {s, Rpx, lod, lens})  AFTER the land tiles: the smoothed shoreline (Chaikin through
//                                               the hex-edge midpoints), shallows, foam, sand and surf; world transform
//     drawRivers(ctx, w, {s, Rpx, lod, lens})   world.json rivers, tapered from source to mouth; world transform.
//                                               Runs a queued drawShore first. map.js draws it after the land and
//                                               the terrain glyphs, with the borders, clipped to the world.
//     shoreRegions(w) → {water, land}          the smoothed regions (Path2D, even-odd), for clipping other layers
//
// LOD: far = colour, texture, smoothed shore, shallows and foam; mid adds the river centre line; near adds wave
// crests and surf lines; close adds a second surf line, glints and lake ripples. Everything is deterministic.
//
// Water ids (world.json): 0 land, 1 ocean, 2 coast, 3 lake.
import { hash01 } from "../../hex.js";
import { lodFor, atLeast } from "./lod.js";
import { bucketPx, deviceScale, getSprite, drawSprite } from "./sprites.js";

export const WATER_OCEAN = 1, WATER_COAST = 2, WATER_LAKE = 3;

/** Lakes: one brighter, fresher blue than the coastal sea (and the same family as the rivers), so a lake two hexes
 *  wide still reads as water at mid zoom. */
export const LAKE_RGB = [64, 146, 202];
const LAKE_CSS = `rgb(${LAKE_RGB.join(",")})`;

let pendingShore = null; // {w, cells, opts}: queued by drawWater, drawn by the next drawRivers (or drawShore)

const worldT = (ctx, vp) =>
  ctx.setTransform(vp.dpr * vp.s, 0, 0, vp.dpr * vp.s, -vp.x0 * vp.dpr * vp.s, -vp.y0 * vp.dpr * vp.s);

export function drawWater(ctx, vp, w, cells, opts = {}) {
  const s = opts.s ?? vp.s;
  const Rpx = opts.Rpx ?? w.grid.R * s;
  const o = { ...opts, s, Rpx, lod: opts.lod ?? lodFor(Rpx), cells };
  worldT(ctx, vp);
  blendWaterTiles(ctx, w, cells, Rpx);
  drawOceanTexture(ctx, vp, o);
  worldT(ctx, vp);
  drawWaterGlyphs(ctx, cells, w, o);
  pendingShore = { w, cells, opts: o };
}

/** Soften the steps between sea tiles of different depth: each sea cell whose colour differs from a sea neighbour
 *  spreads its own colour over its edges with a soft radial falloff (lakes are one colour anyway). */
function blendWaterTiles(ctx, w, cells, Rpx) {
  if (Rpx < 6 || !w.rgb) return;
  const { grid, water, rgb } = w;
  const R = grid.R, r1 = R * 1.25;
  for (const i of cells) {
    const wt = water[i];
    if (!wt || wt === WATER_LAKE) continue;
    const c = rgb[i];
    let diff = false;
    for (let d = 0; d < 6 && !diff; d++) {
      const j = grid.neighbour(i, d);
      if (j < 0 || !water[j] || water[j] === WATER_LAKE) continue;
      const q = rgb[j];
      diff = Math.abs(c[0] - q[0]) + Math.abs(c[1] - q[1]) + Math.abs(c[2] - q[2]) > 3;
    }
    if (!diff) continue;
    const x = grid.cx(i), y = grid.cy(i);
    const gr = ctx.createRadialGradient(x, y, R * 0.45, x, y, r1);
    gr.addColorStop(0, `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},.6)`);
    gr.addColorStop(1, `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},0)`);
    ctx.fillStyle = gr;
    ctx.fillRect(x - r1, y - r1, 2 * r1, 2 * r1);
  }
}

const newCanvas = (wd, ht) => {
  if (typeof document !== "undefined") {
    const cv = document.createElement("canvas");
    cv.width = wd;
    cv.height = ht;
    return cv;
  }
  return new OffscreenCanvas(wd, ht);
};

// --- ocean texture -------------------------------------------------------------------------------------------------
// Two screen-space patterns with sizes that don't share a small common multiple (128 and 211 css px), so the
// repetition is hard to spot: crisp wave marks (a pale crest over a dark trough) and soft light/dark mottling.

const WAVE_TILE = 128, MOTTLE_TILE = 211;
let patterns = null; // {ctx, dpr, waves, mottle}

function makeWaveTile(dpr) {
  const size = WAVE_TILE;
  const cv = newCanvas(Math.round(size * dpr), Math.round(size * dpr));
  const g = cv.getContext("2d");
  g.scale(dpr, dpr);
  g.lineCap = "round";
  g.lineJoin = "round";
  const marks = [];
  for (let k = 0; k < 15; k++) {
    marks.push({
      x: hash01(k, 41) * size, y: hash01(k, 42) * size,
      len: 6 + hash01(k, 43) * 9, a: 0.07 + hash01(k, 44) * 0.09, kind: hash01(k, 45) < 0.35 ? 2 : hash01(k, 45) < 0.7 ? 1 : 0,
    });
  }
  // kind 0: one crescent, 1: a double hump, 2: two stacked crescents (a little swell)
  const crest = (x, y, len) => {
    g.moveTo(x - len, y + len * 0.12);
    g.quadraticCurveTo(x, y - len * 0.38, x + len, y + len * 0.12);
  };
  const hump = (x, y, len) => {
    g.moveTo(x - len, y);
    g.quadraticCurveTo(x - len / 2, y - len * 0.36, x, y);
    g.quadraticCurveTo(x + len / 2, y - len * 0.36, x + len, y);
  };
  const shape = (m, ox, oy, dy) => {
    const x = m.x + ox, y = m.y + oy + dy;
    if (m.kind === 1) hump(x, y, m.len * 0.75);
    else crest(x, y, m.len * 0.6);
    if (m.kind === 2) crest(x + m.len * 0.35, y + m.len * 0.55, m.len * 0.42);
  };
  for (const pass of [0, 1]) {
    for (const m of marks) {
      g.beginPath();
      for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) shape(m, ox, oy, pass ? 0 : 1.1);
      g.strokeStyle = pass ? `rgba(196,230,252,${m.a})` : `rgba(4,22,40,${m.a * 0.9})`;
      g.lineWidth = pass ? 1 : 1.2;
      g.stroke();
    }
  }
  return cv;
}

function makeMottleTile(dpr) {
  const size = MOTTLE_TILE;
  const cv = newCanvas(Math.round(size * dpr), Math.round(size * dpr));
  const g = cv.getContext("2d");
  g.scale(dpr, dpr);
  for (let k = 0; k < 14; k++) {
    const x = hash01(k, 71) * size, y = hash01(k, 72) * size, r = 26 + hash01(k, 73) * 46;
    const light = hash01(k, 74) < 0.5;
    const a = 0.025 + hash01(k, 75) * 0.03;
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        const cx = x + ox, cy = y + oy;
        if (cx + r < 0 || cy + r < 0 || cx - r > size || cy - r > size) continue;
        const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
        gr.addColorStop(0, light ? `rgba(120,190,230,${a})` : `rgba(0,10,25,${a * 1.4})`);
        gr.addColorStop(1, light ? "rgba(120,190,230,0)" : "rgba(0,10,25,0)");
        g.fillStyle = gr;
        g.fillRect(cx - r, cy - r, 2 * r, 2 * r);
      }
    }
  }
  return cv;
}

/** Wave marks and mottling over the whole canvas, in screen pixels (same size at every zoom) but anchored to the
 *  world. Drawn before the land tiles, so only the water keeps them. Leaves the identity transform set. */
export function drawOceanTexture(ctx, vp, opts = {}) {
  const { s, dpr } = vp;
  if (!patterns || patterns.dpr !== dpr || patterns.ctx !== ctx) {
    patterns = {
      ctx, dpr,
      waves: ctx.createPattern(makeWaveTile(dpr), "repeat"),
      mottle: ctx.createPattern(makeMottleTile(dpr), "repeat"),
    };
  }
  // One pattern pixel = one device pixel; the pattern origin sits at world (0, 0).
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const ox = -vp.x0 * s * dpr, oy = -vp.y0 * s * dpr;
  const Rpx = opts.Rpx ?? 20;
  const W = ctx.canvas.width, H = ctx.canvas.height;
  patterns.mottle.setTransform(new DOMMatrix([1, 0, 0, 1, ox, oy]));
  ctx.fillStyle = patterns.mottle;
  ctx.fillRect(0, 0, W, H);
  // Zoomed far out the marks are as big as a state: keep them quieter there.
  ctx.globalAlpha = Rpx < 6 ? 0.55 : Rpx < 10 ? 0.75 : 1;
  patterns.waves.setTransform(new DOMMatrix([1, 0, 0, 1, ox, oy]));
  ctx.fillStyle = patterns.waves;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
}

// --- shore analysis (cached per world) -------------------------------------------------------------------------
// mask[i]: bit d set when water cell i has a LAND neighbour in direction d. dist[i]: hex steps from water cell i
// to the nearest land (1 = on the shore), capped at 4; 0 for land.

const shoreCache = new WeakMap();
function shoreInfo(w) {
  let info = shoreCache.get(w);
  if (info && info.water === w.water) return info;
  const { grid, water } = w;
  const n = grid.size;
  const mask = new Uint8Array(n), dist = new Uint8Array(n);
  let front = [];
  for (let i = 0; i < n; i++) {
    if (!water[i]) continue;
    let m = 0;
    for (let d = 0; d < 6; d++) {
      const j = grid.neighbour(i, d);
      if (j >= 0 && !water[j]) m |= 1 << d;
    }
    mask[i] = m;
    if (m) { dist[i] = 1; front.push(i); }
  }
  for (let step = 2; step <= 4 && front.length; step++) {
    const next = [];
    for (const i of front) {
      for (let d = 0; d < 6; d++) {
        const j = grid.neighbour(i, d);
        if (j >= 0 && water[j] && !dist[j]) { dist[j] = step; next.push(j); }
      }
    }
    front = next;
  }
  for (let i = 0; i < n; i++) if (water[i] && !dist[i]) dist[i] = 4;
  info = { water, mask, dist };
  shoreCache.set(w, info);
  return info;
}

const allCells = (w) => {
  const out = [];
  for (let i = 0; i < w.grid.size; i++) if (w.water[i]) out.push(i);
  return out;
};

// --- per-cell water decoration ---------------------------------------------------------------------------------

/** Per-cell decoration of water cells (world transform):
 *   lakes    one bright lake colour (LAKE_RGB), softly deeper (darker) away from the shore
 *   shelf    a soft pale glow where the coastal shelf (2) meets open ocean (1)
 *   crests   (near+) small wave crests on open water, a pale crest over a dark trough
 *   glints   (close) sun glints on oceans and lakes */
export function drawWaterGlyphs(ctx, cells, w, opts = {}) {
  const { grid, water } = w;
  const R = grid.R;
  const s = opts.s ?? 1;
  const Rpx = opts.Rpx ?? R * s;
  const lod = opts.lod ?? lodFor(Rpx);
  const { dist } = shoreInfo(w);
  const px = (v) => v / s; // css px → km

  const lakes = new Path2D(), shelf = new Path2D();
  const drawn = cells instanceof Set ? cells : new Set(cells);
  const deep = []; // [x, y, alpha] soft depth blobs in lakes
  const crests = new Path2D(), glints = new Path2D();
  let nLake = 0, nShelf = 0, nCrest = 0, nGlint = 0;
  const near = atLeast(lod, "near"), close = lod === "close";
  const K = grid.corners;
  for (const i of cells) {
    const wt = water[i];
    if (!wt) continue;
    const x = grid.cx(i), y = grid.cy(i);
    if (wt === WATER_LAKE) {
      // One colour for the whole lake (grown a little so no seam shows), darker toward the middle by soft blobs.
      lakes.moveTo(x + K[0][0] * 1.03, y + K[0][1] * 1.03);
      for (let k = 1; k < 6; k++) lakes.lineTo(x + K[k][0] * 1.03, y + K[k][1] * 1.03);
      lakes.closePath();
      nLake++;
      if (dist[i] >= 2) deep.push(x, y, dist[i] >= 3 ? 0.22 : 0.13);
    }
    if (wt === WATER_COAST) {
      for (let d = 0; d < 6; d++) {
        const j = grid.neighbour(i, d);
        if (j < 0 || water[j] !== WATER_OCEAN) continue;
        if (!drawn.has(j)) continue; // the glow spills onto that neighbour: only where it is drawn too
        shelf.moveTo(x + K[d][0], y + K[d][1]);
        shelf.lineTo(x + K[(d + 1) % 6][0], y + K[(d + 1) % 6][1]);
        nShelf++;
      }
    }
    if (near && dist[i] >= 2) {
      const nC = close ? (hash01(i, 301) < 0.3 ? 2 : 1) : 1;
      const p = close ? 0.62 : 0.42;
      for (let k = 0; k < nC; k++) {
        if (hash01(i, 302 + k) > p) continue;
        const cx = x + (hash01(i, 310 + k) - 0.5) * R * 1.0;
        const cy = y + (hash01(i, 320 + k) - 0.5) * R * 0.9;
        const wl = R * (wt === WATER_LAKE ? 0.16 : 0.24) * (0.75 + hash01(i, 330 + k) * 0.5);
        if (hash01(i, 340 + k) < 0.5) {
          crests.moveTo(cx - wl / 2, cy + wl * 0.06);
          crests.quadraticCurveTo(cx, cy - wl * 0.28, cx + wl / 2, cy + wl * 0.06);
        } else {
          crests.moveTo(cx - wl / 2, cy);
          crests.quadraticCurveTo(cx - wl / 4, cy - wl * 0.2, cx, cy);
          crests.quadraticCurveTo(cx + wl / 4, cy - wl * 0.2, cx + wl / 2, cy);
        }
        nCrest++;
      }
    }
    if (close && hash01(i, 350) < (wt === WATER_LAKE ? 0.22 : 0.1)) {
      const gx = x + (hash01(i, 351) - 0.5) * R * 0.9, gy = y + (hash01(i, 352) - 0.5) * R * 0.8;
      const gr = px(2.2 + hash01(i, 353) * 1.6);
      // a four-pointed sparkle
      glints.moveTo(gx - gr, gy);
      glints.quadraticCurveTo(gx, gy, gx, gy - gr * 0.7);
      glints.quadraticCurveTo(gx, gy, gx + gr, gy);
      glints.quadraticCurveTo(gx, gy, gx, gy + gr * 0.7);
      glints.quadraticCurveTo(gx, gy, gx - gr, gy);
      nGlint++;
    }
  }

  if (nLake) {
    ctx.fillStyle = LAKE_CSS;
    ctx.fill(lakes);
    // The ocean's mottle and waves again over the lakes (they were painted over), a little quieter.
    if (patterns && patterns.ctx === ctx) {
      ctx.save();
      ctx.clip(lakes);
      const m = ctx.getTransform();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = patterns.mottle;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.globalAlpha = Rpx < 6 ? 0.35 : Rpx < 10 ? 0.45 : 0.6;
      ctx.fillStyle = patterns.waves;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.setTransform(m);
      ctx.restore();
    }
  }
  if (deep.length) {
    const spr = blobSprite(R * deviceScale(ctx));
    for (let k = 0; k < deep.length; k += 3) {
      ctx.globalAlpha = deep[k + 2];
      drawSprite(ctx, spr, deep[k], deep[k + 1], R);
    }
    ctx.globalAlpha = 1;
  }
  if (nShelf) {
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(110,185,220,.06)";
    ctx.lineWidth = R * 0.55;
    ctx.stroke(shelf);
    ctx.strokeStyle = "rgba(130,200,230,.06)";
    ctx.lineWidth = R * 0.25;
    ctx.stroke(shelf);
  }
  if (nCrest) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const lw = Math.min(px(close ? 1.5 : 1.15), R * 0.04);
    ctx.save();
    ctx.translate(0, px(1.1));
    ctx.strokeStyle = "rgba(3,20,38,.32)";
    ctx.lineWidth = lw * 1.2;
    ctx.stroke(crests);
    ctx.restore();
    ctx.strokeStyle = "rgba(205,236,252,.42)";
    ctx.lineWidth = lw;
    ctx.stroke(crests);
  }
  if (nGlint) {
    ctx.fillStyle = "rgba(240,250,255,.75)";
    ctx.fill(glints);
  }
}

/** A soft round darkening, 1.6 R in radius (in R units), for lake depth. Low resolution is plenty. */
function blobSprite(devPerR) {
  const upx = bucketPx(devPerR, { min: 4, max: 48 });
  return getSprite("water:depth-blob", upx, { x0: -1.6, y0: -1.6, x1: 1.6, y1: 1.6 }, (g) => {
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1.6);
    gr.addColorStop(0, "rgba(14,52,96,1)");
    gr.addColorStop(0.45, "rgba(14,52,96,.6)");
    gr.addColorStop(1, "rgba(14,52,96,0)");
    g.fillStyle = gr;
    g.fillRect(-1.6, -1.6, 3.2, 3.2);
  });
}

// --- shore geometry (cached per world) ----------------------------------------------------------------------------
// Every water/land boundary of the hex grid, chained into closed loops. Cells beyond the grid count as water, so
// every loop closes, and at every hex corner exactly 0 or 2 boundary edges meet, so the chaining is unambiguous.
// Each loop runs with the water on its RIGHT (corners go clockwise on screen around a water cell).
// The smoothed shoreline is the polygon through the edge MIDPOINTS (a hex zigzag becomes a straight line), rounded
// by Chaikin corner cutting; it stays within ~0.3 R of the hex boundary. The smoothed water region is the even-odd
// fill of a rectangle around the whole grid plus every loop (each loop flips water ↔ land).

const CHAIKIN_ITERS = 3;
const CHUNK = 48; // smoothed points per stroke chunk (for culling to the view)
const A_LAKE = 1, A_VIRTUAL = 2; // point attributes: lake shore; grid-edge (not a real shore, never stroked)

const geomCache = new WeakMap();
function shoreGeom(w) {
  let G = geomCache.get(w);
  if (G && G.water === w.water) return G;
  const { grid, water } = w;
  const n = grid.size, K = grid.corners, R = grid.R;
  const wMask = new Uint8Array(n); // water cell: bit d = land neighbour in direction d
  const lMask = new Uint8Array(n); // land cell: bit d = water neighbour in direction d
  const ex0 = [], ey0 = [], ex1 = [], ey1 = [], eAttr = [];
  const out = new Map(); // vertex key → the edge leaving it
  const key = (x, y) => `${Math.round(x * 16)},${Math.round(y * 16)}`;
  const addEdge = (ax, ay, bx, by, attr) => {
    out.set(key(ax, ay), ex0.length);
    ex0.push(ax); ey0.push(ay); ex1.push(bx); ey1.push(by); eAttr.push(attr);
  };
  let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
  for (let i = 0; i < n; i++) {
    const x = grid.cx(i), y = grid.cy(i);
    if (x < xMin) xMin = x;
    if (x > xMax) xMax = x;
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
    for (let d = 0; d < 6; d++) {
      const j = grid.neighbour(i, d);
      const a = K[d], b = K[(d + 1) % 6];
      if (water[i]) {
        if (j < 0 || water[j]) continue;
        wMask[i] |= 1 << d;
        addEdge(x + a[0], y + a[1], x + b[0], y + b[1], water[i] === WATER_LAKE ? A_LAKE : 0);
      } else if (j < 0) {
        addEdge(x + b[0], y + b[1], x + a[0], y + a[1], A_VIRTUAL); // reversed: the (virtual) water is outside
      } else if (water[j]) {
        lMask[i] |= 1 << d;
      }
    }
  }

  const loops = [], chunks = [];
  const used = new Uint8Array(ex0.length);
  for (let e0 = 0; e0 < ex0.length; e0++) {
    if (used[e0]) continue;
    const es = [];
    for (let e = e0; e != null && !used[e]; e = out.get(key(ex1[e], ey1[e]))) {
      used[e] = 1;
      es.push(e);
    }
    if (es.length < 3) continue;
    let xs = es.map((e) => (ex0[e] + ex1[e]) / 2), ys = es.map((e) => (ey0[e] + ey1[e]) / 2);
    let at = es.map((e) => eAttr[e]);
    for (let it = 0; it < CHAIKIN_ITERS; it++) {
      const m = xs.length;
      const nx = new Array(2 * m), ny = new Array(2 * m), na = new Array(2 * m);
      for (let k = 0; k < m; k++) {
        const k1 = (k + 1) % m;
        nx[2 * k] = 0.75 * xs[k] + 0.25 * xs[k1];
        ny[2 * k] = 0.75 * ys[k] + 0.25 * ys[k1];
        nx[2 * k + 1] = 0.25 * xs[k] + 0.75 * xs[k1];
        ny[2 * k + 1] = 0.25 * ys[k] + 0.75 * ys[k1];
        na[2 * k] = at[k];
        na[2 * k + 1] = at[k1];
      }
      xs = nx; ys = ny; at = na;
    }
    const m = xs.length;
    const L = {
      x: Float64Array.from(xs), y: Float64Array.from(ys), at: Uint8Array.from(at),
      nx: new Float64Array(m), ny: new Float64Array(m), bbox: bboxOf(xs, ys, 0, m),
    };
    // Water-side unit normals: right of the direction of travel, (-ty, tx) with y down.
    for (let k = 0; k < m; k++) {
      const a = (k + m - 1) % m, b = (k + 1) % m;
      const tx = L.x[b] - L.x[a], ty = L.y[b] - L.y[a];
      const tl = Math.hypot(tx, ty) || 1;
      L.nx[k] = -ty / tl;
      L.ny[k] = tx / tl;
    }
    loops.push(L);
    // Chunks: runs of one attribute, at most CHUNK points, each sharing its last point with the next.
    let s = 0;
    for (let k = 1; k <= m; k++) {
      if (k < m && at[k] === at[s] && k - s < CHUNK) continue;
      const ix = [];
      for (let q = s; q <= k; q++) ix.push(q % m);
      chunks.push({ L, ix, attr: at[s], bbox: bboxOf(ix.map((q) => L.x[q]), ix.map((q) => L.y[q]), 0, ix.length) });
      s = k;
    }
  }

  // The smoothed water region (even-odd): a rectangle well beyond the grid plus every loop. Adding the rectangle
  // a second time flips the parity, which gives the smoothed land region.
  const pad = 6 * R;
  const rect = [xMin - pad, yMin - pad, xMax - xMin + 2 * pad, yMax - yMin + 2 * pad];
  const waterRegion = new Path2D();
  waterRegion.rect(...rect);
  for (const L of loops) {
    waterRegion.moveTo(L.x[0], L.y[0]);
    for (let k = 1; k < L.x.length; k++) waterRegion.lineTo(L.x[k], L.y[k]);
    waterRegion.closePath();
  }
  const landRegion = new Path2D(waterRegion);
  landRegion.rect(...rect);

  G = { water, wMask, lMask, loops, chunks, waterRegion, landRegion };
  geomCache.set(w, G);
  return G;
}

function bboxOf(xs, ys, a, b) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let k = a; k < b; k++) {
    if (xs[k] < x0) x0 = xs[k];
    if (xs[k] > x1) x1 = xs[k];
    if (ys[k] < y0) y0 = ys[k];
    if (ys[k] > y1) y1 = ys[k];
  }
  return [x0, y0, x1, y1];
}

const outside = (bb, view, pad) => bb[2] < view[0] - pad || bb[0] > view[2] + pad || bb[3] < view[1] - pad || bb[1] > view[3] + pad;

/** Add a chunk's points to path P, pushed `off` km toward the water. */
function traceChunk(P, c, off = 0) {
  const { L, ix } = c;
  for (let k = 0; k < ix.length; k++) {
    const q = ix[k];
    const x = L.x[q] + L.nx[q] * off, y = L.y[q] + L.ny[q] * off;
    k ? P.lineTo(x, y) : P.moveTo(x, y);
  }
}

/** The fill used for a water cell's colour next to the shore (lakes use the lake colour, see drawWaterGlyphs). */
const waterFill = (w, j) => (w.water[j] === WATER_LAKE ? LAKE_CSS : w.colors[j]);

// --- shore: smoothed shoreline, shallows, foam, sand, surf ----------------------------------------------------------

/** The smoothed shore, drawn AFTER the land tiles (world transform):
 *   1. the corner lobes: where the smooth shoreline cuts into a land hex it is filled with the neighbouring water
 *      colour, and where it cuts into a water hex with the neighbouring land colour (the hex steps disappear)
 *   2. on the water side (clipped to the smoothed water region): turquoise shallows, a foam rim, a crisp waterline;
 *      lakes get a bright shoreline highlight; near+: broken surf lines parallel to the shore; close: lake ripples
 *   3. on the land side: a thin sandy beach rim
 *  `cells` limits the lobes to those cells (strokes are culled by the view); lens: lobes and a quiet waterline only.
 *  map.js does not need to call this: drawWater() queues it and the next drawRivers() for the same world draws it
 *  first (rivers then run over it). Calling it yourself (e.g. right after the land tiles) clears the queue. */
export function drawShore(ctx, w, cells, opts = {}) {
  pendingShore = null;
  const { grid, water } = w;
  if (!w.colors) return;
  const R = grid.R;
  const s = opts.s ?? 1;
  const Rpx = opts.Rpx ?? R * s;
  const lod = opts.lod ?? lodFor(Rpx);
  const lens = !!opts.lens;
  const G = shoreGeom(w);
  if (!G.loops.length) return;
  cells = cells ?? allCells(w);
  const px = (v) => v / s;
  const near = atLeast(lod, "near"), close = lod === "close";
  const K = grid.corners;
  const view = visibleRect(ctx);

  // 1. Lobes: wedges (cell centre → shore edge) in the neighbour's colour, clipped to the region they change to.
  if (Rpx >= 4) {
    const toLand = new Map(), toWater = new Map();
    const gr = 1.03;
    const wedge = (map, colour, x, y, d) => {
      let P = map.get(colour);
      if (!P) map.set(colour, (P = new Path2D()));
      const a = K[d], b = K[(d + 1) % 6];
      P.moveTo(x, y);
      P.lineTo(x + a[0] * gr, y + a[1] * gr);
      P.lineTo(x + b[0] * gr, y + b[1] * gr);
      P.closePath();
    };
    for (const i of cells) {
      const m = water[i] ? G.wMask[i] : G.lMask[i];
      if (!m) continue;
      const x = grid.cx(i), y = grid.cy(i);
      for (let d = 0; d < 6; d++) {
        if (!(m & (1 << d))) continue;
        const j = grid.neighbour(i, d);
        if (water[i]) wedge(toLand, w.colors[j], x, y, d);
        else wedge(toWater, waterFill(w, j), x, y, d);
      }
    }
    if (toLand.size) {
      ctx.save();
      ctx.clip(G.landRegion, "evenodd");
      for (const [colour, P] of toLand) {
        ctx.fillStyle = colour;
        ctx.fill(P);
      }
      ctx.restore();
    }
    if (toWater.size) {
      ctx.save();
      ctx.clip(G.waterRegion, "evenodd");
      for (const [colour, P] of toWater) {
        ctx.fillStyle = colour;
        ctx.fill(P);
      }
      ctx.restore();
    }
  }

  // The visible shoreline, split into sea and lake shores, plus the offset surf lines.
  const sea = new Path2D(), lake = new Path2D();
  const surf1 = new Path2D(), surf2 = new Path2D(), ripple = new Path2D();
  let nSea = 0, nLake = 0;
  const padV = R * 1.5;
  for (const c of G.chunks) {
    if (c.attr & A_VIRTUAL) continue;
    if (view && outside(c.bbox, view, padV)) continue;
    if (c.attr & A_LAKE) {
      traceChunk(lake, c);
      nLake++;
      if (close && !lens) traceChunk(ripple, c, R * 0.15);
    } else {
      traceChunk(sea, c);
      nSea++;
      if (near && !lens) {
        traceChunk(surf1, c, R * 0.17);
        if (close) traceChunk(surf2, c, R * 0.34);
      }
    }
  }
  if (!nSea && !nLake) return;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 2. Water side. Strokes are centred on the shoreline and clipped, so each width shows by half.
  ctx.save();
  ctx.clip(G.waterRegion, "evenodd");
  if (lens) {
    ctx.strokeStyle = "rgba(225,240,245,.45)";
    ctx.lineWidth = px(2.2);
    if (nSea) ctx.stroke(sea);
    if (nLake) ctx.stroke(lake);
    ctx.restore();
    return;
  }
  if (nSea) {
    // Shallows: turquoise, strongest against the land; then a soft foam band and a crisp waterline.
    const bands = [[1.3, "rgba(70,170,180,.07)"], [0.85, "rgba(80,185,190,.085)"], [0.48, "rgba(110,205,205,.11)"]];
    for (const [k, style] of bands) {
      ctx.strokeStyle = style;
      ctx.lineWidth = Math.max(R * k, px(4));
      ctx.stroke(sea);
    }
    ctx.strokeStyle = "rgba(225,245,248,.24)";
    ctx.lineWidth = Math.max(R * 0.22, px(3));
    ctx.stroke(sea);
    ctx.strokeStyle = "rgba(242,252,252,.62)";
    ctx.lineWidth = Math.max(R * 0.075, px(2));
    ctx.stroke(sea);
  }
  if (nLake) {
    // Lakes: a lighter, cleaner rim so even a narrow lake reads at mid zoom.
    ctx.strokeStyle = "rgba(140,210,230,.16)";
    ctx.lineWidth = Math.max(R * 0.7, px(4));
    ctx.stroke(lake);
    ctx.strokeStyle = "rgba(170,225,236,.2)";
    ctx.lineWidth = Math.max(R * 0.3, px(3));
    ctx.stroke(lake);
    ctx.strokeStyle = "rgba(236,248,246,.7)";
    ctx.lineWidth = Math.max(R * 0.07, px(2.2));
    ctx.stroke(lake);
  }
  if (near && nSea) {
    ctx.setLineDash([R * 0.55, R * 0.24]);
    ctx.lineDashOffset = 0;
    ctx.strokeStyle = "rgba(235,250,252,.4)";
    ctx.lineWidth = Math.min(px(close ? 1.6 : 1.2), R * 0.05);
    ctx.stroke(surf1);
    if (close) {
      ctx.setLineDash([R * 0.32, R * 0.45]);
      ctx.lineDashOffset = R * 0.2;
      ctx.strokeStyle = "rgba(225,245,250,.22)";
      ctx.lineWidth = px(1.3);
      ctx.stroke(surf2);
    }
    ctx.setLineDash([]);
  }
  if (close && nLake) {
    ctx.setLineDash([R * 0.3, R * 0.3]);
    ctx.strokeStyle = "rgba(225,245,250,.24)";
    ctx.lineWidth = px(1.1);
    ctx.stroke(ripple);
    ctx.setLineDash([]);
  }
  ctx.restore();

  // 3. Land side: a sandy beach rim on sea shores, a pale grassy-sand edge on lakes, with a brighter line at the waterline.
  ctx.save();
  ctx.clip(G.landRegion, "evenodd");
  if (nSea) {
    ctx.strokeStyle = "rgba(226,208,156,.55)";
    ctx.lineWidth = Math.max(R * 0.13, px(2.6));
    ctx.stroke(sea);
    ctx.strokeStyle = "rgba(246,232,190,.5)";
    ctx.lineWidth = Math.max(R * 0.05, px(1.4));
    ctx.stroke(sea);
  }
  if (nLake) {
    ctx.strokeStyle = "rgba(214,206,160,.42)";
    ctx.lineWidth = Math.max(R * 0.09, px(2.2));
    ctx.stroke(lake);
  }
  ctx.restore();
}

/** The smoothed water and land regions as Path2D in world km; fill or clip them with "evenodd". Lets other layers
 *  follow the smoothed coast, e.g. ctx.clip(shoreRegions(w).land, "evenodd") around the state border bands. */
export function shoreRegions(w) {
  const G = shoreGeom(w);
  return { water: G.waterRegion, land: G.landRegion };
}

/** Older name of the shore pass (it used to stroke the hex edges before the land); same as drawShore(). */
export const drawCoastFoam = (ctx, w, opts = {}) => drawShore(ctx, w, opts.cells, opts);

// --- rivers ------------------------------------------------------------------------------------------------------
// Each river is drawn as a filled ribbon whose width grows from source to mouth (the end that lies lower, or in
// water), over a darker bank ribbon, with a lighter centre line on top. Rivers outside the canvas are skipped.

const riverCache = new WeakMap(); // rivers array -> prepared [{pts (source → mouth), cum, len, bbox, rank}]

function prepRivers(w) {
  const rivers = w.raw?.rivers || [];
  let prep = riverCache.get(rivers);
  if (prep) return prep;
  const grid = w.grid, elev = w.raw?.elev, water = w.water;
  const height = (x, y) => {
    if (!grid || !elev) return null;
    const c = grid.cellAt(x, y);
    if (c < 0) return null;
    return water && water[c] ? -1e4 : elev[c];
  };
  prep = [];
  for (const rv of rivers) {
    let p = rv.pts;
    if (!p || p.length < 4) continue;
    const n = p.length;
    // pts run in either direction in world.json; make them run source → mouth.
    const h0 = height(p[0], p[1]), h1 = height(p[n - 2], p[n - 1]);
    if (h0 != null && h1 != null && h0 < h1) {
      const q = [];
      for (let k = n - 2; k >= 0; k -= 2) q.push(p[k], p[k + 1]);
      p = q;
    }
    const cum = new Float64Array(n / 2);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let k = 0; k < n; k += 2) {
      if (k) cum[k / 2] = cum[k / 2 - 1] + Math.hypot(p[k] - p[k - 2], p[k + 1] - p[k - 1]);
      x0 = Math.min(x0, p[k]); x1 = Math.max(x1, p[k]);
      y0 = Math.min(y0, p[k + 1]); y1 = Math.max(y1, p[k + 1]);
    }
    prep.push({ pts: p, cum, len: cum[cum.length - 1], bbox: [x0, y0, x1, y1], rank: rv.rank });
  }
  riverCache.set(rivers, prep);
  return prep;
}

/** The world rectangle the canvas shows under ctx's current (axis-aligned) transform, or null if unknown. */
function visibleRect(ctx) {
  if (!ctx.getTransform || !ctx.canvas) return null;
  const m = ctx.getTransform();
  if (!m.a || !m.d || m.b || m.c) return null;
  const xa = -m.e / m.a, xb = (ctx.canvas.width - m.e) / m.a;
  const ya = -m.f / m.d, yb = (ctx.canvas.height - m.f) / m.d;
  return [Math.min(xa, xb), Math.min(ya, yb), Math.max(xa, xb), Math.max(ya, yb)];
}

/** Add a ribbon around polyline p (flat x,y pairs) to path P; halfWidth(k) gives the half width at vertex k. */
function ribbon(P, p, halfWidth) {
  const n = p.length / 2;
  const L = new Float64Array(n * 2), Rr = new Float64Array(n * 2);
  for (let k = 0; k < n; k++) {
    const i0 = Math.max(0, k - 1) * 2, i1 = Math.min(n - 1, k + 1) * 2;
    let dx = p[i1] - p[i0], dy = p[i1 + 1] - p[i0 + 1];
    const dl = Math.hypot(dx, dy) || 1;
    dx /= dl; dy /= dl;
    // Miter: divide by the cosine between the vertex normal and the outgoing segment's normal (capped).
    let miter = 1;
    if (k > 0 && k < n - 1) {
      let sx = p[k * 2 + 2] - p[k * 2], sy = p[k * 2 + 3] - p[k * 2 + 1];
      const sl = Math.hypot(sx, sy) || 1;
      sx /= sl; sy /= sl;
      miter = 1 / Math.max(0.55, dx * sx + dy * sy);
    }
    const hw = halfWidth(k) * miter;
    L[k * 2] = p[k * 2] - dy * hw; L[k * 2 + 1] = p[k * 2 + 1] + dx * hw;
    Rr[k * 2] = p[k * 2] + dy * hw; Rr[k * 2 + 1] = p[k * 2 + 1] - dx * hw;
  }
  P.moveTo(L[0], L[1]);
  for (let k = 1; k < n; k++) P.lineTo(L[k * 2], L[k * 2 + 1]);
  // Round-ish mouth: go through a point just past the end.
  const e = (n - 1) * 2;
  const ex = p[e] - p[Math.max(0, e - 2)], ey = p[e + 1] - p[Math.max(1, e - 1)];
  const el = Math.hypot(ex, ey) || 1;
  const hwEnd = halfWidth(n - 1);
  P.lineTo(p[e] + (ex / el) * hwEnd * 0.8, p[e + 1] + (ey / el) * hwEnd * 0.8);
  for (let k = n - 1; k >= 0; k--) P.lineTo(Rr[k * 2], Rr[k * 2 + 1]);
  P.closePath();
}

export function drawRivers(ctx, w, { s, Rpx, lod, lens = false }) {
  const R = w.grid?.R ?? (Rpx && s ? Rpx / s : 25);
  Rpx = Rpx ?? R * s;
  lod = lod ?? lodFor(Rpx);
  // The shore queued by drawWater() goes first: it must follow the land tiles, and the rivers run over it.
  if (pendingShore && pendingShore.w === w) {
    const q = pendingShore;
    drawShore(ctx, w, q.cells, { ...q.opts, s, Rpx, lod, lens });
  }
  const rivers = prepRivers(w);
  const view = visibleRect(ctx);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // Mouth width in css px by rank (1 = biggest), never wider than a good part of a hex.
  const mouthPx = (rank) => Math.min(Math.max(0.8, (10 - rank) * 0.24 * Math.sqrt(s / 0.25)), Rpx * 0.3);
  const visible = (rv, padKm) =>
    !view || !(rv.bbox[2] < view[0] - padKm || rv.bbox[0] > view[2] + padKm || rv.bbox[3] < view[1] - padKm || rv.bbox[1] > view[3] + padKm);

  if (lens) {
    // Lens views: one quiet constant-width line, so the rivers orient without competing with the data.
    ctx.strokeStyle = "rgba(120,170,210,.45)";
    for (const rv of rivers) {
      if (!visible(rv, 10)) continue;
      ctx.lineWidth = mouthPx(rv.rank) * 0.8 / s;
      strokePolyline(ctx, rv.pts);
    }
    return;
  }

  // Each river gets its own ribbons: one path for all of them would cancel where two ribbons of opposite
  // winding overlap (confluences). Banks first, then the water, then the centre lines.
  const banks = [], bodies = [], centre = new Path2D();
  let nCentre = 0;
  const showCentre = atLeast(lod, "mid");
  for (const rv of rivers) {
    const Wm = mouthPx(rv.rank);
    if (!visible(rv, (Wm * 2) / s)) continue;
    const taper = Math.min(1, rv.len / 450); // short pieces keep their width
    const frac = (k) => 1 - taper * (1 - (0.32 + 0.68 * Math.sqrt(rv.len ? rv.cum[k] / rv.len : 1)));
    const hwPx = (k) => Math.max(0.35, (Wm * frac(k)) / 2);
    const body = new Path2D(), bank = new Path2D();
    ribbon(body, rv.pts, (k) => hwPx(k) / s);
    ribbon(bank, rv.pts, (k) => (hwPx(k) * 1.25 + 0.75) / s);
    bodies.push(body);
    banks.push(bank);
    if (showCentre && Wm >= 2.2) {
      // The centre line starts some way down, where the river has some width.
      const p = rv.pts;
      let started = false;
      for (let k = 0; k < p.length; k += 2) {
        if (rv.cum[k / 2] < rv.len * 0.3 * taper) continue;
        if (!started) { centre.moveTo(p[k], p[k + 1]); started = true; }
        else centre.lineTo(p[k], p[k + 1]);
      }
      nCentre++;
    }
  }
  ctx.fillStyle = "rgba(38,52,30,.42)";
  for (const P of banks) ctx.fill(P);
  ctx.fillStyle = "#3f8cc4";
  for (const P of bodies) ctx.fill(P);
  if (nCentre) {
    ctx.strokeStyle = "rgba(150,210,240,.55)";
    ctx.lineWidth = Math.max(0.6, Math.min(2.2, Rpx * 0.035)) / s;
    ctx.stroke(centre);
  }
}

function strokePolyline(ctx, p) {
  ctx.beginPath();
  ctx.moveTo(p[0], p[1]);
  for (let k = 2; k < p.length; k += 2) ctx.lineTo(p[k], p[k + 1]);
  ctx.stroke();
}

/** Stroke flat [x0, y0, x1, y1, ...] segment pairs in one path. */
export function strokeSegs(ctx, segs, style, width) {
  ctx.beginPath();
  for (let k = 0; k < segs.length; k += 4) {
    ctx.moveTo(segs[k], segs[k + 1]);
    ctx.lineTo(segs[k + 2], segs[k + 3]);
  }
  ctx.strokeStyle = style;
  ctx.lineWidth = width;
  ctx.stroke();
}
