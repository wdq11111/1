// Shared sprite cache for the tile-art modules (render/art/*): small offscreen canvases painted once per
// (key, size bucket) and stamped with drawImage, so rich vector art costs one blit per use.
//
// Units. A sprite is painted in "art units" chosen by the caller (terrain.js uses 1 unit = the hex radius R).
// `upx` = device pixels per art unit at the current zoom; it is rounded to a quarter-octave bucket, so every zoom
// between two buckets shares the same canvases and a sprite is never scaled by more than ~9% when drawn.
//
//   bucketPx(upx, {min, max}) → number        the bucket for a device-px-per-unit value
//   deviceScale(ctx) → number                  device px per user unit of ctx's current transform
//   getSprite(key, upx, box, paint) → sprite   cached; box = {x0, y0, x1, y1} in art units around the anchor
//                                              (0, 0); paint(g, upx) draws in art units (the transform is set,
//                                              1 device px = 1 / upx units). Returns {canvas, x0, y0, w, h} (units).
//   drawSprite(ctx, spr, x, y, k)               draw with the anchor at (x, y) in ctx user units, k user units per
//                                              art unit (terrain.js: k = R km, times any size jitter)
//   makePattern(ctx, key, sizePx, dpr, paint) → CanvasPattern   a cached repeating tile of sizePx css px
//                                              (paint(g, size) in css px; wrap shapes yourself, see wrapDraw)
//   rng(seed) → () => [0, 1)                    small deterministic PRNG (mulberry32) for painting variants
//   spriteStats()                               {count, pixels, hits, misses, painted ms} for profiling
//   clearSprites()                              drop everything (e.g. after a palette change)
//
// Memory: canvases are evicted least-recently-used once the cache holds more than BUDGET_PX device pixels.

const BUDGET_PX = 24e6; // ~96 MB of RGBA at most
const cache = new Map(); // key → sprite; Map order = recency (re-inserted on use)
const stats = { count: 0, pixels: 0, hits: 0, misses: 0, painted: 0 };

function newCanvas(w, h) {
  if (typeof document !== "undefined") {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    return cv;
  }
  return new OffscreenCanvas(w, h);
}

/** Quarter-octave bucket of a device-px-per-unit value, clamped to [min, max]. */
export function bucketPx(upx, { min = 4, max = 256 } = {}) {
  const v = Math.min(max, Math.max(min, upx || min));
  return Math.pow(2, Math.round(Math.log2(v) * 4) / 4);
}

/** Device pixels per user unit of ctx's current transform (assumes no skew). */
export function deviceScale(ctx) {
  const t = ctx.getTransform();
  return Math.hypot(t.a, t.b) || 1;
}

export function getSprite(key, upx, box, paint) {
  const k = `${key}@${upx}`;
  let spr = cache.get(k);
  if (spr) {
    stats.hits++;
    cache.delete(k);
    cache.set(k, spr);
    return spr;
  }
  stats.misses++;
  const t0 = typeof performance !== "undefined" ? performance.now() : 0;
  const pw = Math.max(1, Math.ceil((box.x1 - box.x0) * upx));
  const ph = Math.max(1, Math.ceil((box.y1 - box.y0) * upx));
  const cv = newCanvas(pw, ph);
  const g = cv.getContext("2d");
  g.setTransform(upx, 0, 0, upx, -box.x0 * upx, -box.y0 * upx);
  g.lineCap = "round";
  g.lineJoin = "round";
  paint(g, upx);
  spr = { canvas: cv, x0: box.x0, y0: box.y0, w: pw / upx, h: ph / upx, px: pw * ph };
  cache.set(k, spr);
  stats.count++;
  stats.pixels += spr.px;
  if (t0) stats.painted += performance.now() - t0;
  evict();
  return spr;
}

function evict() {
  if (stats.pixels <= BUDGET_PX) return;
  for (const [k, spr] of cache) {
    if (stats.pixels <= BUDGET_PX * 0.8 || cache.size <= 1) break;
    cache.delete(k);
    stats.count--;
    stats.pixels -= spr.px;
  }
}

export function drawSprite(ctx, spr, x, y, k) {
  ctx.drawImage(spr.canvas, x + spr.x0 * k, y + spr.y0 * k, spr.w * k, spr.h * k);
}

// Patterns: the tile canvas is cached by (key, dpr); the CanvasPattern by context (patterns are cheap to make).
const patternTiles = new Map();
const patterns = new WeakMap(); // ctx → Map<key, CanvasPattern>
export function makePattern(ctx, key, sizePx, dpr, paint) {
  const k = `${key}|${sizePx}|${dpr}`;
  let tile = patternTiles.get(k);
  if (!tile) {
    const n = Math.max(1, Math.round(sizePx * dpr));
    tile = newCanvas(n, n);
    const g = tile.getContext("2d");
    g.setTransform(n / sizePx, 0, 0, n / sizePx, 0, 0);
    g.lineCap = "round";
    g.lineJoin = "round";
    paint(g, sizePx);
    patternTiles.set(k, tile);
  }
  let m = patterns.get(ctx);
  if (!m) patterns.set(ctx, (m = new Map()));
  let p = m.get(k);
  if (!p) m.set(k, (p = ctx.createPattern(tile, "repeat")));
  return p;
}

/** Call draw(dx, dy) for the 3×3 copies of a tile of `size`, so shapes crossing an edge wrap seamlessly. */
export function wrapDraw(size, draw) {
  for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) draw(dx, dy);
}

/** mulberry32: a small, fast, deterministic PRNG. */
export function rng(seed) {
  let a = (seed | 0) + 0x6d2b79f5;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const spriteStats = () => ({ ...stats, painted: Math.round(stats.painted * 10) / 10 });

export function clearSprites() {
  cache.clear();
  patternTiles.clear();
  stats.count = 0;
  stats.pixels = 0;
}
