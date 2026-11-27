// Tile improvements: roads, railroads, ports, airports and freight "trade routes", drawn in code as strategy-map art.
//
// Everything here is drawn into the CACHED static map (see ext/layers/, which registers the layers), never per frame:
//   * Roads and rail come from infrastructure.json as links between neighbouring hex centres. prepareNetwork() turns
//     them into Path2D pieces once (bucketed into ~300 km tiles so a draw only strokes what is on screen). Inside a hex
//     a road with exactly two links of its class is a smooth quadratic curve through the centre, so a run of links
//     reads as one winding road rather than a zigzag; junctions and dead ends are straight spokes. Rail sharing a link
//     with a road is shifted to one side so the two read as parallel lines.
//   * Ports and airports are small painted glyphs (sprites, sized in css px by zoom and by rank / hub class).
//   * Trade routes are dashed caravan arcs between the two anchor cities (the ends of trade.json `path`), weighted by
//     value and coloured by the dominant mode, with a cart / boat / barrel marker at the middle. Static: no animation.
//
// Exports
//   prepareNetwork(w, infra) → net                     once per data load
//   drawRoads(ctx, net, vp, o) / drawRail(ctx, net, vp, o)   world transform (km), o = the static-layer options
//   ROAD_MIN_RPX, MAJOR_MIN_RPX, RAIL2_MIN_RPX           zoom thresholds (hex radius in css px)
//   portTier(port), drawPort(ctx, x, y, sizeKm, opts), drawAirport(ctx, x, y, sizeKm, opts)   (any transform)
//   prepareRoutes(w, trade) → routes; drawTradeRoutes(ctx, routes, vp, o); hitRoute(routes, x, y, Rpx, s)
//   MODE_STYLE                                          per FAF mode: colour, dash, marker kind, label
//   routeArc(grid, cellA, cellB, bow) → arc               the trade-route arc geometry (for advisors drawing the same)
//   drawTradeMarker(ctx, kind, x, y, sizePx)              the medallion marker (screen units)
import { bucketPx, deviceScale, getSprite, drawSprite } from "./sprites.js";

const H = Math.sqrt(3) / 2; // edge-midpoint distance in hex radii
const TILE_KM = 300;
const DIR_COS = [0, 1, 2, 3, 4, 5].map((d) => Math.cos((d * Math.PI) / 3));
const DIR_SIN = [0, 1, 2, 3, 4, 5].map((d) => Math.sin((d * Math.PI) / 3));

export const ROAD_MIN_RPX = 10; // Interstates and main-line rail from the region view ("mid") in
export const MAJOR_MIN_RPX = 18; // major highways and secondary rail once hexes are big enough to read them
export const RAIL2_MIN_RPX = 18;
const DETAIL_RPX = 30; // cobbles, centre dashes, sleepers

// --- network geometry ----------------------------------------------------------------------------------------------

/** Direction 0..5 from cell a to its neighbour b, or -1. */
function dirTo(grid, a, b) {
  for (let d = 0; d < 6; d++) if (grid.neighbour(a, d) === b) return d;
  return -1;
}

/**
 * Build Path2D pieces for a list of links ([a, b, cls, ...]).
 * classes: the class values in drawing order; each tile gets one Path2D per class.
 * offsetOf(a, b) → km to shift the link sideways (0 = on the centre line). The shift goes to one fixed physical side
 * of the line (below it, leaning right), so it is the same seen from either end and a run of links never swaps sides.
 */
function buildPieces(w, links, classes, offsetOf = null) {
  const { grid } = w;
  const R = grid.R;
  const byCell = new Map(); // cell → [{d, cls, vx, vy}]
  const add = (i, d, cls, vx, vy) => {
    let l = byCell.get(i);
    if (!l) byCell.set(i, (l = []));
    l.push({ d, cls, vx, vy });
  };
  for (const [a, b, cls] of links) {
    const d = dirTo(grid, a, b);
    if (d < 0) continue;
    const off = offsetOf ? offsetOf(a, b) : 0;
    let px = -DIR_SIN[d], py = DIR_COS[d];
    if (py + 0.3 * px < 0) { px = -px; py = -py; }
    add(a, d, cls, off * px, off * py);
    add(b, (d + 3) % 6, cls, off * px, off * py);
  }
  const tiles = new Map(); // "tx,ty" → {x0, y0, x1, y1, paths: {cls: Path2D}}
  for (const [i, list] of byCell) {
    const cx = grid.cx(i), cy = grid.cy(i);
    const key = `${Math.floor(cx / TILE_KM)},${Math.floor(cy / TILE_KM)}`;
    let t = tiles.get(key);
    if (!t) tiles.set(key, (t = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity, paths: {} }));
    t.x0 = Math.min(t.x0, cx - R); t.y0 = Math.min(t.y0, cy - R);
    t.x1 = Math.max(t.x1, cx + R); t.y1 = Math.max(t.y1, cy + R);
    for (const cls of classes) {
      const mine = list.filter((p) => p.cls === cls);
      if (!mine.length) continue;
      const p = t.paths[cls] || (t.paths[cls] = new Path2D());
      // end of a piece: the shared edge midpoint (+ the link's sideways shift); hub: the centre + the mean shift
      const ends = mine.map((q) => [cx + R * H * DIR_COS[q.d] + q.vx, cy + R * H * DIR_SIN[q.d] + q.vy]);
      let hx = 0, hy = 0;
      for (const q of mine) { hx += q.vx; hy += q.vy; }
      hx = cx + hx / mine.length; hy = cy + hy / mine.length;
      if (mine.length === 2) {
        // a through road: one smooth curve, tangent to both links where it crosses the hex edges
        p.moveTo(ends[0][0], ends[0][1]);
        p.quadraticCurveTo(hx, hy, ends[1][0], ends[1][1]);
      } else {
        for (const e of ends) { p.moveTo(hx, hy); p.lineTo(e[0], e[1]); }
      }
    }
  }
  return [...tiles.values()];
}

/**
 * infrastructure.json → {roads: tiles, rail: tiles, roadLinks: Set, ports, airports, counts}.
 * Road classes: 0 Interstate, 1 major highway. Rail tiers: 0 main, 1 secondary.
 */
export function prepareNetwork(w, infra) {
  const roads = Array.isArray(infra?.roads) ? infra.roads : [];
  const rail = Array.isArray(infra?.rail) ? infra.rail : [];
  const roadLinks = new Map(); // "a,b" → class
  for (const [a, b, cls] of roads) roadLinks.set(a < b ? `${a},${b}` : `${b},${a}`, cls);
  const R = w.grid.R;
  // Rail on a road link runs alongside it (a fifth of a hex to the side); elsewhere on the centre line.
  const railOff = (a, b) => (roadLinks.has(a < b ? `${a},${b}` : `${b},${a}`) ? 0.2 * R : 0);
  return {
    roads: buildPieces(w, roads, [1, 0]),
    rail: buildPieces(w, rail, [1, 0], railOff),
    roadLinks,
    counts: { roads: roads.length, rail: rail.length },
  };
}

function visibleTiles(tiles, vp, pad) {
  const out = [];
  for (const t of tiles) {
    if (t.x1 < vp.x0 - pad || t.x0 > vp.x1 + pad || t.y1 < vp.y0 - pad || t.y0 > vp.y1 + pad) continue;
    out.push(t);
  }
  return out;
}

function strokeAll(ctx, tiles, cls) {
  for (const t of tiles) if (t.paths[cls]) ctx.stroke(t.paths[cls]);
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Road widths in css px at a zoom (exported for the legend / gallery). */
export function roadWidths(Rpx) {
  return { inter: clamp(Rpx * 0.095, 1.7, 9), major: clamp(Rpx * 0.06, 1.1, 5.5) };
}

/** Paved Interstates (stone kerbs, pale paving, cobble joints when close) and dirt-track major highways. */
export function drawRoads(ctx, net, vp, o) {
  if (!net || o.Rpx < ROAD_MIN_RPX) return;
  const s = vp.s, Rpx = o.Rpx;
  const tiles = visibleTiles(net.roads, vp, 2 * (o.Rpx / s));
  if (!tiles.length) return;
  const { inter, major } = roadWidths(Rpx);
  const fade = clamp((Rpx - ROAD_MIN_RPX) / 4, 0.55, 1); // softer while just switched on
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const a0 = ctx.globalAlpha;
  ctx.globalAlpha = a0 * fade;
  // Major highways: a packed-earth track with a darker rut edge.
  if (Rpx >= MAJOR_MIN_RPX) {
    ctx.strokeStyle = "rgba(74,56,34,.55)";
    ctx.lineWidth = (major + 1.4) / s;
    strokeAll(ctx, tiles, 1);
    ctx.strokeStyle = "#c9ab78";
    ctx.lineWidth = major / s;
    strokeAll(ctx, tiles, 1);
    if (Rpx >= DETAIL_RPX) {
      ctx.strokeStyle = "rgba(120,92,56,.45)";
      ctx.lineWidth = Math.max(0.6, major * 0.18) / s;
      ctx.setLineDash([major * 0.9 / s, major * 1.6 / s]);
      strokeAll(ctx, tiles, 1);
      ctx.setLineDash([]);
    }
  }
  // Interstates: dark stone kerb, pale paving, then (close) a cobble rhythm and a faint crown line.
  ctx.strokeStyle = "rgba(52,40,26,.8)";
  ctx.lineWidth = (inter + 2.2) / s;
  strokeAll(ctx, tiles, 0);
  ctx.strokeStyle = "#a98f63";
  ctx.lineWidth = (inter + 0.8) / s;
  strokeAll(ctx, tiles, 0);
  ctx.strokeStyle = "#e6d6ad";
  ctx.lineWidth = inter / s;
  strokeAll(ctx, tiles, 0);
  if (Rpx >= DETAIL_RPX) {
    ctx.lineCap = "butt";
    ctx.strokeStyle = "rgba(138,112,72,.5)";
    ctx.lineWidth = inter * 0.92 / s;
    ctx.setLineDash([0.7 / s, inter * 0.75 / s]);
    strokeAll(ctx, tiles, 0);
    ctx.setLineDash([]);
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255,250,232,.55)";
    ctx.lineWidth = Math.max(0.6, inter * 0.16) / s;
    strokeAll(ctx, tiles, 0);
  }
  ctx.globalAlpha = a0;
}

/** Railroads: a ballast bed, sleepers (near), a steel line with a bright edge. Secondary lines thinner, nearer. */
export function drawRail(ctx, net, vp, o) {
  if (!net || o.Rpx < ROAD_MIN_RPX) return;
  const s = vp.s, Rpx = o.Rpx;
  const tiles = visibleTiles(net.rail, vp, 2 * (Rpx / s));
  if (!tiles.length) return;
  const fade = clamp((Rpx - ROAD_MIN_RPX) / 4, 0.55, 1);
  const a0 = ctx.globalAlpha;
  ctx.globalAlpha = a0 * fade;
  ctx.lineJoin = "round";
  const tiers = Rpx >= RAIL2_MIN_RPX ? [1, 0] : [0];
  for (const tier of tiers) {
    const k = tier === 0 ? 1 : 0.72;
    const tie = clamp(Rpx * 0.11, 2.6, 9) * k; // sleeper length (css px)
    const steel = clamp(Rpx * 0.022, 0.9, 2.4) * k;
    // ballast bed: a pale casing, so the line reads on dark forest as well as on pale plains
    ctx.lineCap = "round";
    ctx.strokeStyle = Rpx >= 16 ? "rgba(168,154,132,.55)" : "rgba(226,214,190,.5)";
    ctx.lineWidth = (Rpx >= 16 ? tie + 1 : steel + 2.6) / s;
    strokeAll(ctx, tiles, tier);
    if (Rpx >= 16) {
      // sleepers: a dashed line as wide as a sleeper is long
      ctx.lineCap = "butt";
      ctx.strokeStyle = tier === 0 ? "#4a3424" : "rgba(74,52,36,.85)";
      ctx.lineWidth = tie / s;
      const gap = clamp(Rpx * 0.06, 2.2, 6);
      ctx.setLineDash([Math.max(0.9, gap * 0.45) / s, gap / s]);
      strokeAll(ctx, tiles, tier);
      ctx.setLineDash([]);
    }
    ctx.lineCap = "round";
    ctx.strokeStyle = "#2a2522";
    ctx.lineWidth = (steel + (Rpx >= 16 ? 0 : 0.5)) / s;
    strokeAll(ctx, tiles, tier);
    if (Rpx >= DETAIL_RPX) {
      ctx.strokeStyle = "rgba(210,214,222,.7)";
      ctx.lineWidth = Math.max(0.5, steel * 0.35) / s;
      strokeAll(ctx, tiles, tier);
    }
  }
  ctx.globalAlpha = a0;
}

// --- shared sprite helpers -------------------------------------------------------------------------------------------

/** Stamp a sprite of an art box (art units: 1 = half the glyph's size) at (x, y), sizeU user units across. */
function stamp(ctx, key, x, y, size, box, paint) {
  const k = size / 2; // user units per art unit
  const upx = bucketPx(deviceScale(ctx) * k, { min: 3, max: 200 });
  const spr = getSprite(key, upx, box, paint);
  drawSprite(ctx, spr, x, y, k);
}

const BOX = { x0: -1.25, y0: -1.25, x1: 1.25, y1: 1.25 };

function shadow(g, y = 0.78, rx = 0.9, ry = 0.22, a = 0.32) {
  g.fillStyle = `rgba(20,14,6,${a})`;
  g.beginPath();
  g.ellipse(0, y, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
}

function inkStroke(g, upx, wPx = 1.1, col = "rgba(28,20,10,.9)") {
  g.lineWidth = wPx / upx;
  g.strokeStyle = col;
  g.stroke();
}

// --- ports ----------------------------------------------------------------------------------------------------------

/** 0: 100M+ short tons, 1: 25–100M, 2: under 25M (the research's tonnage tiers). */
export function portTier(p) {
  const t = p?.tons;
  return t == null ? 2 : t >= 1e8 ? 0 : t >= 2.5e7 ? 1 : 2;
}

/**
 * A harbour: timber quay on the water line, a gantry crane (big ports) or a derrick (small ones), and containers
 * for coastal ports or a coal barge for Great Lakes / river ports. Painted upright; size = glyph width (user units).
 */
export function drawPort(ctx, x, y, size, { tier = 1, type = "coastal" } = {}) {
  const river = type === "inland" || type === "great_lakes";
  stamp(ctx, `imp:port:${tier}:${river ? "r" : "c"}`, x, y, size, BOX, (g, upx) => paintPort(g, upx, tier, river));
}

function paintPort(g, upx, tier, river) {
  // water strip under the quay
  g.fillStyle = "#3f7fa6";
  g.beginPath();
  g.moveTo(-1.05, 0.45); g.lineTo(1.05, 0.45); g.lineTo(0.95, 0.95); g.lineTo(-0.95, 0.95); g.closePath();
  g.fill();
  g.strokeStyle = "rgba(220,240,255,.75)";
  g.lineWidth = 1 / upx;
  g.beginPath();
  g.moveTo(-0.8, 0.72); g.quadraticCurveTo(-0.65, 0.64, -0.5, 0.72);
  g.moveTo(0.1, 0.84); g.quadraticCurveTo(0.25, 0.76, 0.4, 0.84);
  g.stroke();
  // timber quay
  g.fillStyle = "#8a6238";
  g.beginPath();
  g.rect(-1.0, 0.28, 2.0, 0.2);
  g.fill();
  inkStroke(g, upx, 1);
  g.strokeStyle = "rgba(40,24,10,.6)";
  g.lineWidth = 0.8 / upx;
  g.beginPath();
  for (let k = -0.8; k <= 0.85; k += 0.27) { g.moveTo(k, 0.48); g.lineTo(k, 0.6); }
  g.stroke();
  if (river) {
    // barge with coal heaps on the water
    g.fillStyle = "#5a4a3a";
    g.beginPath();
    g.moveTo(-0.95, 0.56); g.lineTo(0.15, 0.56); g.lineTo(0.05, 0.78); g.lineTo(-0.85, 0.78); g.closePath();
    g.fill();
    inkStroke(g, upx, 1);
    g.fillStyle = "#24211f";
    g.beginPath();
    g.ellipse(-0.6, 0.57, 0.18, 0.12, 0, Math.PI, 0); g.ellipse(-0.22, 0.57, 0.18, 0.12, 0, Math.PI, 0);
    g.fill();
  } else {
    // stacked containers on the quay
    const box = (bx, by, c) => {
      g.fillStyle = c;
      g.beginPath();
      g.rect(bx, by, 0.36, 0.2);
      g.fill();
      inkStroke(g, upx, 0.9);
    };
    box(-0.95, 0.08, "#c2553a"); box(-0.57, 0.08, "#3a78a8");
    if (tier <= 1) { box(-0.76, -0.12, "#d8a23a"); box(-0.19, 0.08, "#4a8a4a"); }
    if (tier === 0) box(-0.38, -0.12, "#c2553a");
  }
  // crane
  const col = "#d86a2a";
  g.strokeStyle = col;
  g.lineCap = "butt";
  if (tier <= 1) {
    // gantry: two legs, a girder, a boom out over the water
    const h = tier === 0 ? -0.95 : -0.72;
    g.lineWidth = Math.max(1.6 / upx, 0.09);
    g.beginPath();
    g.moveTo(0.25, 0.3); g.lineTo(0.3, h); g.moveTo(0.75, 0.3); g.lineTo(0.7, h);
    g.stroke();
    g.fillStyle = col;
    g.beginPath();
    g.rect(0.12, h - 0.08, 1.0, 0.14);
    g.fill();
    inkStroke(g, upx, 0.9);
    g.strokeStyle = "rgba(30,20,10,.8)";
    g.lineWidth = 0.9 / upx;
    g.beginPath();
    g.moveTo(1.0, h + 0.06); g.lineTo(1.0, 0.1);
    g.stroke();
    g.fillStyle = "#3a3a3a";
    g.fillRect(0.93, 0.08, 0.14, 0.08);
    // cross bracing
    g.strokeStyle = "rgba(150,60,20,.9)";
    g.lineWidth = 0.9 / upx;
    g.beginPath();
    g.moveTo(0.27, -0.1); g.lineTo(0.73, h + 0.2); g.moveTo(0.73, -0.1); g.lineTo(0.27, h + 0.2);
    g.stroke();
  } else {
    // derrick: mast, jib and a hook
    g.lineWidth = Math.max(1.4 / upx, 0.08);
    g.beginPath();
    g.moveTo(0.45, 0.3); g.lineTo(0.45, -0.55); g.lineTo(0.95, -0.2);
    g.stroke();
    g.strokeStyle = "rgba(30,20,10,.8)";
    g.lineWidth = 0.9 / upx;
    g.beginPath();
    g.moveTo(0.95, -0.2); g.lineTo(0.95, 0.2);
    g.stroke();
  }
  // bollards
  g.fillStyle = "#2a2520";
  for (const bx of [-0.2, 0.55]) { g.beginPath(); g.arc(bx, 0.3, 0.05, 0, Math.PI * 2); g.fill(); }
}

// --- airports -------------------------------------------------------------------------------------------------------

const HUB_ORDER = { L: 0, M: 1, S: 2, N: 3 };
/** 0 large hub … 3 nonhub, 4 cargo-only (no FAA hub class). */
export const airportTier = (a) => (a?.hub && HUB_ORDER[a.hub] != null ? HUB_ORDER[a.hub] : 4);

/**
 * An airfield: a diagonal runway with threshold bars and centre dashes, a terminal and tower for hubs, a hangar for
 * small and cargo fields, a parked plane for large and medium hubs.
 */
export function drawAirport(ctx, x, y, size, { tier = 2 } = {}) {
  stamp(ctx, `imp:air:${tier}`, x, y, size, BOX, (g, upx) => paintAirport(g, upx, tier));
}

function plane(g, upx, x, y, k, rot, col = "#f4f1ea") {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.scale(k, k);
  g.beginPath();
  g.moveTo(0, -1); g.quadraticCurveTo(0.12, -0.9, 0.12, -0.55);
  g.lineTo(0.12, -0.2); g.lineTo(0.95, 0.15); g.lineTo(0.95, 0.32); g.lineTo(0.12, 0.12);
  g.lineTo(0.1, 0.62); g.lineTo(0.38, 0.8); g.lineTo(0.38, 0.92); g.lineTo(0, 0.84);
  g.lineTo(-0.38, 0.92); g.lineTo(-0.38, 0.8); g.lineTo(-0.1, 0.62); g.lineTo(-0.12, 0.12);
  g.lineTo(-0.95, 0.32); g.lineTo(-0.95, 0.15); g.lineTo(-0.12, -0.2); g.lineTo(-0.12, -0.55);
  g.quadraticCurveTo(-0.12, -0.9, 0, -1);
  g.closePath();
  g.fillStyle = col;
  g.fill();
  g.lineWidth = 0.9 / upx / k;
  g.strokeStyle = "rgba(28,24,30,.9)";
  g.stroke();
  g.restore();
}

function paintAirport(g, upx, tier) {
  shadow(g, 0.7, 1.0, 0.26, 0.22);
  // grass apron
  g.fillStyle = "rgba(120,140,80,.55)";
  g.beginPath();
  g.ellipse(0, 0.25, 1.08, 0.62, -0.42, 0, Math.PI * 2);
  g.fill();
  // runway
  const len = tier <= 1 ? 1.12 : tier <= 3 ? 0.95 : 0.88, wid = tier <= 1 ? 0.2 : 0.15;
  g.save();
  g.translate(0, 0.25);
  g.rotate(-0.42);
  g.fillStyle = "#4a4a4e";
  g.beginPath();
  g.rect(-len, -wid / 2, 2 * len, wid);
  g.fill();
  inkStroke(g, upx, 0.9, "rgba(20,20,24,.8)");
  g.strokeStyle = "#f2efe4";
  g.lineWidth = Math.max(0.8 / upx, wid * 0.12);
  g.setLineDash([0.12, 0.09]);
  g.beginPath();
  g.moveTo(-len + 0.22, 0); g.lineTo(len - 0.22, 0);
  g.stroke();
  g.setLineDash([]);
  g.lineWidth = 0.8 / upx;
  g.beginPath();
  for (const e of [-1, 1]) for (let k = -2; k <= 2; k++) {
    const yy = (k / 2.6) * (wid / 2);
    g.moveTo(e * (len - 0.04), yy); g.lineTo(e * (len - 0.15), yy);
  }
  g.stroke();
  // second runway for large hubs
  if (tier === 0) {
    g.fillStyle = "#55555a";
    g.beginPath();
    g.rect(-len * 0.7, -0.42, 1.4 * len, wid * 0.8);
    g.fill();
    inkStroke(g, upx, 0.8, "rgba(20,20,24,.7)");
  }
  g.restore();
  if (tier <= 2) {
    // terminal block with blue glazing and a control tower
    const tw = tier === 0 ? 0.95 : tier === 1 ? 0.75 : 0.5;
    g.fillStyle = "#e7e2d6";
    g.beginPath();
    g.rect(-0.95, -0.55, tw, 0.34);
    g.fill();
    inkStroke(g, upx, 1);
    g.fillStyle = "#4a86b8";
    g.fillRect(-0.9, -0.48, tw - 0.1, 0.1);
    g.fillStyle = "#d9d3c4";
    g.beginPath();
    g.rect(-0.95 + tw + 0.04, -0.95, 0.16, 0.74);
    g.fill();
    inkStroke(g, upx, 1);
    g.fillStyle = "#4a86b8";
    g.beginPath();
    g.moveTo(-0.95 + tw - 0.01, -1.02); g.lineTo(-0.95 + tw + 0.25, -1.02);
    g.lineTo(-0.95 + tw + 0.22, -0.88); g.lineTo(-0.95 + tw + 0.02, -0.88); g.closePath();
    g.fill();
    inkStroke(g, upx, 0.9);
  } else {
    // hangar: a curved roof shed (cargo fields get a crate beside it)
    g.fillStyle = tier === 4 ? "#8a8f96" : "#b9a888";
    g.beginPath();
    g.moveTo(-0.95, -0.2); g.lineTo(-0.95, -0.4); g.quadraticCurveTo(-0.65, -0.78, -0.35, -0.4); g.lineTo(-0.35, -0.2);
    g.closePath();
    g.fill();
    inkStroke(g, upx, 1);
    if (tier === 4) {
      g.fillStyle = "#b8874a";
      g.beginPath();
      g.rect(-0.28, -0.42, 0.24, 0.22);
      g.fill();
      inkStroke(g, upx, 0.9);
    }
  }
  if (tier <= 1 || tier === 4) plane(g, upx, 0.55, -0.35, tier === 0 ? 0.48 : 0.4, 0.55, tier === 4 ? "#d9dee6" : "#f4f1ea");
}

// --- trade routes ---------------------------------------------------------------------------------------------------

/** Per FAF mode: line colour (saturated, to read on any terrain over a parchment halo), dash pattern (in line widths;
 * null = solid), marker kind and a label. */
export const MODE_STYLE = {
  truck: { color: "#ee8a1e", dash: [2.4, 1.1], marker: "cart", label: "Truck" },
  rail: { color: "#d2402f", dash: [3.2, 0.9], marker: "rail", label: "Rail" },
  water: { color: "#1f8ad2", dash: [2.4, 1.1], marker: "boat", label: "Water" },
  air: { color: "#18a99a", dash: [1.4, 1.2], marker: "plane", label: "Air" },
  multiple: { color: "#9b4fd0", dash: [2.4, 1.1], marker: "cart", label: "Multiple modes" },
  pipeline: { color: "#3a3430", dash: null, dots: "#f0a830", marker: "barrel", label: "Pipeline" },
  other: { color: "#7d7466", dash: [1.6, 1.4], marker: "cart", label: "Other / unknown" },
};

export const TOP_ROUTES = 10; // drawn wider and fully opaque; the rest thinner and lighter

/**
 * The arc between two hexes as the map draws it (world km): a quadratic curve from the west end, bowing by `bow`
 * (a signed fraction of the chord; positive = north). Exported so an advisor can draw the same geometry.
 *   routeArc(grid, cellA, cellB, bow) → {pts: Float64Array [x,y,…], path: Path2D, ends: [ax, ay, bx, by], len, bbox}
 */
export function routeArc(grid, ca, cb, bow = 0.16) {
  let ax = grid.cx(ca), ay = grid.cy(ca), bx = grid.cx(cb), by = grid.cy(cb);
  if (bx < ax) [ax, ay, bx, by] = [bx, by, ax, ay];
  const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1;
  const nx = dy / d, ny = -dx / d; // left of west→east: up on the map
  const qx = (ax + bx) / 2 + nx * bow * d, qy = (ay + by) / 2 + ny * bow * d;
  const N = 32;
  const pts = new Float64Array((N + 1) * 2);
  for (let k = 0; k <= N; k++) {
    const t = k / N, u = 1 - t;
    pts[2 * k] = u * u * ax + 2 * u * t * qx + t * t * bx;
    pts[2 * k + 1] = u * u * ay + 2 * u * t * qy + t * t * by;
  }
  let len = 0;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let k = 0; k < pts.length; k += 2) {
    if (k) len += Math.hypot(pts[k] - pts[k - 2], pts[k + 1] - pts[k - 1]);
    x0 = Math.min(x0, pts[k]); x1 = Math.max(x1, pts[k]); y0 = Math.min(y0, pts[k + 1]); y1 = Math.max(y1, pts[k + 1]);
  }
  const path = new Path2D();
  path.moveTo(ax, ay);
  path.quadraticCurveTo(qx, qy, bx, by);
  return { pts, path, ends: [ax, ay, bx, by], len, bbox: [x0, y0, x1, y1] };
}

/**
 * trade.json → [{route, a, b, pts: Float64Array [x,y,…] (a sampled arc), path, ends, len, bbox, weight, top, bow, style}],
 * biggest first. Each route is drawn as a gentle arc between its two anchor cities (the ends of trade.json `path`),
 * like a caravan route on a strategy map: arcs keep the 40 routes legible where a road-following drawing would bundle
 * them along the same Interstates. Routes that share an anchor fan out (alternating sides, growing bow by rank) so
 * they leave it as a spray rather than a single wedge. Neither form is data: FAF assigns no route.
 */
export function prepareRoutes(w, trade) {
  const { grid } = w;
  const zones = new Map((trade?.zones || []).map((z) => [z.id, z]));
  const list = [...(trade?.routes || [])].sort((p, q) => (q.value_musd || 0) - (p.value_musd || 0));
  const vmax = Math.max(1, ...list.map((r) => r.value_musd || 0));
  const seen = new Map(); // anchor cell → routes so far
  const routes = [];
  for (const r of list) {
    const za = zones.get(r.a), zb = zones.get(r.b);
    const ca = Array.isArray(r.path) && r.path.length ? r.path[0] : za?.anchor?.cell;
    const cb = Array.isArray(r.path) && r.path.length ? r.path[r.path.length - 1] : zb?.anchor?.cell;
    if (ca == null || cb == null || ca === cb) continue;
    const ia = seen.get(ca) || 0, ib = seen.get(cb) || 0;
    seen.set(ca, ia + 1);
    seen.set(cb, ib + 1);
    const idx = Math.max(ia, ib);
    const bow = (idx % 2 ? -1 : 1) * Math.min(0.42, 0.12 + 0.08 * Math.ceil(idx / 2));
    const arc = routeArc(grid, ca, cb, bow);
    routes.push({
      route: r, a: za || null, b: zb || null, ...arc, bow,
      weight: Math.sqrt((r.value_musd || 0) / vmax), top: routes.length < TOP_ROUTES,
      style: MODE_STYLE[r.top_mode] || MODE_STYLE.other,
    });
  }
  return routes;
}

/** Route line width in css px at a zoom. */
export function routeWidth(rt, Rpx) {
  const base = clamp(1.3 + Rpx * 0.04, 1.4, 3.8);
  return base * (rt.top ? 1.1 + 1.0 * rt.weight : 0.55 + 0.5 * rt.weight);
}

// Point at fraction t along the polyline.
function along(pts, len, t) {
  let goal = len * t;
  for (let k = 2; k < pts.length; k += 2) {
    const l = Math.hypot(pts[k] - pts[k - 2], pts[k + 1] - pts[k - 1]);
    if (goal <= l || k === pts.length - 2) {
      const f = l ? Math.min(1, goal / l) : 0;
      return [pts[k - 2] + (pts[k] - pts[k - 2]) * f, pts[k - 1] + (pts[k + 1] - pts[k - 1]) * f];
    }
    goal -= l;
  }
  return [pts[0], pts[1]];
}

const MARKER_EVERY_PX = 240; // one medallion per this much route on screen (up to 4)

/**
 * Draw the routes (world transform). Smallest first so the biggest flows sit on top. Each is a parchment halo (with a
 * faint dark edge) under dashes in the mode colour; the top routes are wider and opaque, the rest thinner and lighter.
 * Marker medallions every ~240 css px along a route (the top routes at any zoom, the rest from the region view in).
 * opts.highlight: a route object to emphasise (others fade).
 */
export function drawTradeRoutes(ctx, routes, vp, o, opts = {}) {
  if (!routes?.length) return;
  const s = vp.s, Rpx = o.Rpx;
  const pad = 40 / s;
  const shown = [];
  for (let k = routes.length - 1; k >= 0; k--) {
    const rt = routes[k];
    const [x0, y0, x1, y1] = rt.bbox;
    if (x1 < vp.x0 - pad || x0 > vp.x1 + pad || y1 < vp.y0 - pad || y0 > vp.y1 + pad) continue;
    shown.push(rt);
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const alphaOf = (rt) => (opts.highlight && opts.highlight !== rt ? 0.3 : rt.top || opts.highlight === rt ? 1 : 0.72);
  for (const rt of shown) {
    const wpx = routeWidth(rt, Rpx);
    const path = rt.path;
    ctx.globalAlpha = alphaOf(rt);
    const halo = wpx * 1.5 + 2;
    ctx.strokeStyle = "rgba(30,20,8,.35)";
    ctx.lineWidth = (halo + 1.4) / s;
    ctx.stroke(path);
    ctx.strokeStyle = "rgba(250,241,214,.9)";
    ctx.lineWidth = halo / s;
    ctx.stroke(path);
    const st = rt.style;
    ctx.strokeStyle = st.color;
    ctx.lineWidth = wpx / s;
    if (st.dash) {
      ctx.lineCap = "butt";
      ctx.setLineDash(st.dash.map((d) => (d * wpx) / s));
    }
    ctx.stroke(path);
    ctx.setLineDash([]);
    ctx.lineCap = "round";
    if (st.dots) {
      // pipeline: amber beads along a dark pipe
      ctx.strokeStyle = st.dots;
      ctx.lineWidth = (wpx * 0.55) / s;
      ctx.setLineDash([0.01 / s, (wpx * 2.4) / s]);
      ctx.stroke(path);
      ctx.setLineDash([]);
    }
  }
  ctx.globalAlpha = 1;
  // anchor studs where routes start and end
  ctx.fillStyle = "#f3e6c4";
  ctx.strokeStyle = "rgba(18,12,6,.8)";
  ctx.lineWidth = 1 / s;
  const studs = new Set();
  for (const rt of shown) for (const k of [0, 2]) {
    const key = `${rt.ends[k]},${rt.ends[k + 1]}`;
    if (studs.has(key)) continue;
    studs.add(key);
    ctx.beginPath();
    ctx.arc(rt.ends[k], rt.ends[k + 1], clamp(2 + Rpx * 0.06, 2.4, 4.5) / s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // markers in screen space, spaced along each route
  const sizeFor = (rt) => clamp(10 + Rpx * 0.22, 11, 19) * (rt.top ? 0.95 + 0.25 * rt.weight : 0.78);
  o.screen();
  for (const rt of shown) {
    rt._markers = [];
    if (Rpx < 8 && !rt.top) continue;
    const n = clamp(Math.round((rt.len * s) / MARKER_EVERY_PX), 1, 4);
    const size = sizeFor(rt);
    ctx.globalAlpha = alphaOf(rt);
    for (let i = 0; i < n; i++) {
      const [mx, my] = along(rt.pts, rt.len, (i + 0.5) / n);
      const [sx, sy] = o.toScreen(mx, my);
      drawTradeMarker(ctx, rt.style.marker, sx, sy, size, rt.style.color);
      rt._markers.push([mx, my, size / 2]);
    }
  }
  ctx.globalAlpha = 1;
  o.world();
}

/** The route nearest to (x, y) km within a few css px of its line or one of its markers, or null. */
export function hitRoute(routes, x, y, Rpx, s) {
  let best = null, bestD = Infinity;
  for (const rt of routes || []) {
    const tol = (routeWidth(rt, Rpx) * 0.75 + 4) / s;
    const [x0, y0, x1, y1] = rt.bbox;
    if (x < x0 - tol - 30 / s || x > x1 + tol + 30 / s || y < y0 - tol - 30 / s || y > y1 + tol + 30 / s) continue;
    for (const [mx, my, r] of rt._markers || []) {
      if (Math.hypot(x - mx, y - my) <= (r + 2) / s) return rt;
    }
    const p = rt.pts;
    for (let k = 2; k < p.length; k += 2) {
      const d = segDist(x, y, p[k - 2], p[k - 1], p[k], p[k + 1]);
      if (d < tol && d < bestD) { bestD = d; best = rt; }
    }
  }
  return best;
}

function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)) : 0;
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

/** A round marker for a route: a bronze-rimmed disk with a cart, boat, train, plane or barrel. Screen units. */
export function drawTradeMarker(ctx, kind, x, y, size, ring = "#c9a45c") {
  stamp(ctx, `imp:mk:${kind}:${ring}`, x, y, size, { x0: -1.2, y0: -1.2, x1: 1.2, y1: 1.3 }, (g, upx) => paintMarker(g, upx, kind, ring));
}

function paintMarker(g, upx, kind, ring) {
  g.fillStyle = "rgba(10,6,2,.35)";
  g.beginPath(); g.arc(0, 0.1, 1.02, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#2a2016";
  g.beginPath(); g.arc(0, 0, 0.98, 0, Math.PI * 2); g.fill();
  g.lineWidth = Math.max(1.4 / upx, 0.14);
  g.strokeStyle = ring;
  g.stroke();
  g.fillStyle = "#f3e6c4";
  g.strokeStyle = "#f3e6c4";
  g.lineWidth = Math.max(1 / upx, 0.09);
  g.beginPath();
  if (kind === "boat") {
    g.moveTo(-0.62, 0.05); g.lineTo(0.62, 0.05); g.lineTo(0.42, 0.38); g.lineTo(-0.45, 0.38); g.closePath();
    g.fill();
    g.beginPath(); g.rect(-0.38, -0.28, 0.3, 0.3); g.rect(-0.04, -0.28, 0.3, 0.3); g.fill();
    g.beginPath(); g.moveTo(-0.7, 0.55); g.quadraticCurveTo(-0.35, 0.45, 0, 0.55); g.quadraticCurveTo(0.35, 0.65, 0.7, 0.55); g.stroke();
  } else if (kind === "rail") {
    g.rect(-0.62, -0.38, 0.7, 0.62); g.rect(0.12, -0.18, 0.5, 0.42);
    g.fill();
    g.fillStyle = "#2a2016";
    g.beginPath(); g.rect(-0.5, -0.26, 0.24, 0.2); g.fill();
    g.fillStyle = "#f3e6c4";
    g.beginPath(); for (const cx of [-0.42, 0, 0.42]) { g.moveTo(cx + 0.14, 0.36); g.arc(cx, 0.36, 0.14, 0, Math.PI * 2); } g.fill();
  } else if (kind === "plane") {
    g.moveTo(0.7, 0); g.lineTo(-0.5, -0.12); g.lineTo(-0.2, -0.62); g.lineTo(-0.38, -0.62); g.lineTo(-0.72, -0.1);
    g.lineTo(-0.72, 0.1); g.lineTo(-0.38, 0.62); g.lineTo(-0.2, 0.62); g.lineTo(-0.5, 0.12); g.closePath();
    g.fill();
  } else if (kind === "barrel") {
    g.ellipse(0, -0.42, 0.4, 0.13, 0, 0, Math.PI * 2);
    g.moveTo(-0.4, -0.42); g.lineTo(-0.4, 0.42); g.ellipse(0, 0.42, 0.4, 0.13, 0, Math.PI, 0, true); g.lineTo(0.4, -0.42);
    g.fill();
    g.strokeStyle = "#2a2016";
    g.lineWidth = Math.max(0.9 / upx, 0.07);
    g.beginPath(); g.moveTo(-0.4, -0.12); g.lineTo(0.4, -0.12); g.moveTo(-0.4, 0.16); g.lineTo(0.4, 0.16); g.stroke();
  } else {
    // covered cart
    g.moveTo(-0.62, 0.15); g.lineTo(0.5, 0.15); g.lineTo(0.5, -0.1); g.quadraticCurveTo(-0.06, -0.75, -0.62, -0.1); g.closePath();
    g.fill();
    g.beginPath(); g.moveTo(0.5, 0.02); g.lineTo(0.78, -0.08); g.stroke();
    g.fillStyle = "#2a2016";
    g.beginPath(); g.moveTo(-0.38, -0.32); g.quadraticCurveTo(-0.06, -0.52, 0.26, -0.32); g.lineWidth = 0.8 / upx; g.strokeStyle = "#2a2016"; g.stroke();
    g.fillStyle = "#f3e6c4";
    g.beginPath(); for (const cx of [-0.38, 0.3]) { g.moveTo(cx + 0.2, 0.38); g.arc(cx, 0.38, 0.2, 0, Math.PI * 2); } g.fill();
    g.fillStyle = "#2a2016";
    g.beginPath(); for (const cx of [-0.38, 0.3]) { g.moveTo(cx + 0.06, 0.38); g.arc(cx, 0.38, 0.06, 0, Math.PI * 2); } g.fill();
  }
}
