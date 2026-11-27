// Level-of-detail tiers shared by the tile-art modules (render/art/*).
// Rpx = hex radius in css px at the current zoom (grid.R * scale).
//
//   far    Rpx <  10   whole-country view: flat colour, at most a few strong glyphs, cities as dots
//   mid    Rpx <  22   region view: simple glyphs (trees, fields, peaks), big cities as tiles
//   near   Rpx <  44   state view: full glyph detail, every city as a tile
//   close  Rpx >= 44   street-ish view: room for extra detail (buildings, field furrows, foam crests)
//
// The tiers are a convenience for artists: existing art still uses its own Rpx thresholds (e.g. "fine" detail from
// Rpx >= 13), so the output did not change when the tiers were introduced. New art should prefer the tiers.

export const LOD = Object.freeze({ FAR: "far", MID: "mid", NEAR: "near", CLOSE: "close" });
export const LOD_ORDER = [LOD.FAR, LOD.MID, LOD.NEAR, LOD.CLOSE];
export const LOD_MIN_RPX = { far: 0, mid: 10, near: 22, close: 44 };

/** The LOD tier for a hex radius in css px. */
export function lodFor(Rpx) {
  return Rpx < 10 ? LOD.FAR : Rpx < 22 ? LOD.MID : Rpx < 44 ? LOD.NEAR : LOD.CLOSE;
}

/** True when tier `lod` is at least `min` (e.g. atLeast(lod, "near")). */
export const atLeast = (lod, min) => LOD_ORDER.indexOf(lod) >= LOD_ORDER.indexOf(min);

/** Pointy-top hex path centred at (x, y) with radius R·f (same corners as hex.js makeGrid). Adds to the current path. */
export function hexAt(ctx, x, y, R, f = 1) {
  for (let k = 0; k < 6; k++) {
    const a = ((60 * k - 30) * Math.PI) / 180;
    const px = x + R * f * Math.cos(a), py = y + R * f * Math.sin(a);
    k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
}
