// ChinaCiv entry point into the vendored USACiv renderer (MIT, © 2026 Andrej Karpathy; see ./LICENSE and ./NOTICE.md).
// Only the modules ChinaCiv drives are re-exported here; the rest of the vendored tree is imported by these.
export { prepareWorld, applyLens } from "./world.js";
export { drawStatic, drawOverlay, warmSprites, OCEAN_BG, Z } from "./render/map.js";
export { drawBanners } from "./render/banners.js";
export { prepareNetwork, drawRoads, drawRail, ROAD_MIN_RPX } from "./render/art/improvements.js";
export { spriteStats } from "./render/art/sprites.js";
export { svgIcon, hasIcon } from "./icons.js";
export { makeGrid, hash01 } from "./hex.js";
export { COVER } from "./terrain.js";
