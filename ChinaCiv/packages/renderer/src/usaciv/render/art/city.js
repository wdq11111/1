// City-tile art: the city-centre hex (a village, or a pseudo-isometric street grid that grows from a small town into
// a dense skyline), the capital's domed landmark, the small marker used for cities when hexes are too small for a
// tile, and the suburban-fringe art that terrain.js can stamp on urban cells.
//
// Interface (used by render/map.js, render/art/terrain.js and web/dev/gallery.js):
//
//   cityTileVisible(city, Rpx) → bool     is the city drawn at all at this zoom (small towns vanish zoomed out)
//   cityIsDot(city, Rpx) → bool           drawn as a dot (true) or as a full tile (false)
//   cityClass(population) → {id, ...}     size class: village, town, city, metropolis, megalopolis
//   metroSpill(w) → Map(cell → pseudo-city)  urban neighbours of 1.5M+ metros drawn as smaller city tiles (map.js);
//                                         terrain.js leaves them bare like real city cells
//   drawCityTile(ctx, city, x, y, R, {Rpx, s, lod, selected, stateColor, seed})
//     ctx        2D context in WORLD transform (km; s css px per km applied)
//     city       a cities.json record (uses population, capital/id via world.js isCapital)
//     x, y, R    hex centre and radius in km
//     Rpx        hex radius in css px; s css px per km; lod "far"|"mid"|"near"|"close" (optional)
//     selected   true for the selected city; the selection ring itself is drawn by render/map.js drawOverlay
//     stateColor [r, g, b] of the owning state (rim, accent roofs, crowns, steeples, water towers, dot)
//     seed       per-city integer for deterministic variation (map.js passes city.cell)
//   Draws a dot or a tile according to cityIsDot(); the caller checks cityTileVisible() first.
//   SUBURB_ART = {ground, build}: sprite definitions {box, paint(g, upx, v, kind)} in R units (1 unit = the hex
//     radius, kind "" or "small"), the same shape as terrain.js SPRITES entries: ground = lawn, cul-de-sac roads,
//     a parking lot or a school field; build = rows of houses, tree clumps, a strip mall or a school.
//
// How a city tile is made:
//   village      6-10 houses along one or two country roads, a church with a steeple or a water tower, garden
//                trees and a few crop fields around it, straight on the terrain (no paving), within ~45% of the hex.
//   town+        the hex gets a lawn base; the built-up area is a paved pad (an asphalt street grid with a lighter
//                kerb and a short soft feather) made of iso blocks packed edge to edge. Each block has a sidewalk
//                and becomes: core (a podium filling the block with one or two towers), mid-rise (1, 2 or 4 parcels
//                of packed buildings), residential (a lawn block with houses at its corners and a tree), a park
//                (paths, trees, a pond), a plaza (fountain) or a civic church. Bigger classes have smaller blocks,
//                a bigger pad and taller towers; outside the pad the hex has scattered houses and trees.
//   Buildings are boxes with a lit top, a half-lit south-west face and a shaded south-east face (light from the
//   upper left), cast shadows to the lower right (one fill, so overlaps don't darken twice), gable roofs, set-backs,
//   crowns in the state colour, a spire on the tallest tower, windows at close zoom. The capital gets a domed
//   capitol on a stone plaza at the head of a tree-lined mall with an obelisk, and a low skyline around it.
//
// Every tile is painted once into an offscreen sprite keyed by (city seed, class, colour, capital, zoom bucket,
// device scale) and blitted with drawImage afterwards; an LRU with a pixel budget bounds the memory. Close-zoom tiles
// (over 220 device px of hex radius) have their own smaller LRU; past 480 px they are painted directly.
import { hash01 } from "../../hex.js";
import { css, mix, shade } from "../../color.js";
import { isCapital } from "../../world.js";
import { COVER } from "../../terrain.js";
import { lodFor } from "./lod.js";
import { rng } from "./sprites.js";

/** Cities draw as a dot (on top of the terrain) rather than a full tile when hexes are small. */
export const cityIsDot = (city, Rpx) =>
  Rpx < 9 || (Rpx < 18 && city.population < 2.5e5) || (Rpx < 26 && city.population < 1e5);

// --- metro spill ----------------------------------------------------------------------------------------------
const SPILL_MIN_POP = 1.5e6;
const spills = new WeakMap(); // world → Map(cell → pseudo-city)
/** Neighbour hexes of big metros drawn as smaller city tiles: 1 for 1.5M+, 2 for 5M+, the most developed urban ones. */
export function metroSpill(w) {
  let out = spills.get(w);
  if (out) return out;
  out = new Map();
  const { grid } = w, dev = w.pct?.developed;
  for (const [cell, city] of w.cityByCell) {
    if (!(city.population >= SPILL_MIN_POP)) continue;
    const cand = [];
    for (let d = 0; d < 6; d++) {
      const j = grid.neighbour(cell, d);
      if (j < 0 || w.water[j] || w.cityByCell.has(j) || out.has(j) || w.cover[j] !== COVER.URBAN) continue;
      cand.push([j, dev ? dev[j] || 0 : 50]);
    }
    cand.sort((a, b) => b[1] - a[1]);
    const n = city.population >= 5e6 ? 2 : 1;
    cand.slice(0, n).forEach(([j], k) => {
      out.set(j, { id: `spill-${j}`, name: city.name, capital: false, of: city, population: (city.population >= 5e6 ? 9e5 : 5e5) / (k + 1) });
    });
  }
  spills.set(w, out);
  return out;
}

/** Zoomed far out only the big cities show at all. */
export const cityTileVisible = (city, Rpx) => !(Rpx < 9 && city.population < (Rpx < 6 ? 1e6 : 2.5e5));

// --- size classes --------------------------------------------------------------------------------------------------
//   extent   how far (hex apothem = 1) the paved pad reaches
//   lot      block pitch in R at full zoom (never smaller than LOT_MIN_PX css px)
//   core     centrality (0 edge … 1 centre) above which blocks get towers; mid likewise for mid-rise blocks
//   height   tallest tower in R
//   park     share of blocks that are parks
//   ragged   chance that an outer block is left out (an irregular edge)
//   grey     how grey the lawn base of the hex is (0 green … 1 concrete)
//   fringe   houses and trees on the unpaved rest of the hex
//   civic    one block becomes a church / meeting house
export const CITY_CLASSES = [
  { id: "village", min: 0, village: true },
  { id: "town", min: 1.5e5, extent: 0.66, lot: 0.2, core: 0.9, mid: 0.55, height: 0.2, park: 0.05, ragged: 0.4, grey: 0.08, fringe: true, civic: true },
  { id: "city", min: 4e5, extent: 0.8, lot: 0.18, core: 0.66, mid: 0.33, height: 0.44, park: 0.06, ragged: 0.32, grey: 0.14, fringe: true, civic: true },
  { id: "metropolis", min: 1.5e6, extent: 0.9, lot: 0.16, core: 0.5, mid: 0.18, height: 0.58, park: 0.06, ragged: 0.25, grey: 0.2, fringe: true },
  { id: "megalopolis", min: 5e6, extent: 0.96, lot: 0.145, core: 0.36, mid: 0.08, height: 0.68, park: 0.05, ragged: 0.12, grey: 0.26, fringe: false },
];
const LOT_MIN_PX = 5.5;

export function cityClass(population) {
  let c = CITY_CLASSES[0];
  for (const k of CITY_CLASSES) if (population >= k.min) c = k;
  return c;
}

// --- palette -------------------------------------------------------------------------------------------------------
const P = {
  asphalt: [74, 72, 70], kerb: [182, 176, 160], walk: [196, 190, 174], concrete: [168, 162, 148],
  lawn: [118, 150, 80], lawnBlock: [128, 160, 88], park: [96, 146, 70], path: [218, 208, 176],
  plaza: [204, 194, 168], plazaInner: [224, 216, 194], pond: [92, 160, 206],
  tree: [60, 108, 50], treeMid: [82, 132, 60], treeLit: [128, 170, 82], conifer: [44, 88, 54],
  field: [[214, 186, 104], [176, 178, 86], [196, 160, 92], [150, 172, 80]],
  road: [196, 186, 160], roadEdge: [92, 84, 70],
  walls: [[236, 226, 204], [242, 238, 228], [218, 200, 164], [226, 214, 190], [214, 222, 226]],
  roofs: [[170, 78, 56], [124, 82, 60], [92, 98, 112], [184, 110, 66], [70, 82, 100]],
  stone: [[208, 196, 172], [188, 178, 160], [168, 98, 74], [196, 188, 176], [150, 118, 96]],
  glass: [[118, 160, 190], [96, 128, 158], [150, 178, 196], [196, 170, 112], [128, 170, 176]],
  marble: [240, 236, 224], dome: [246, 244, 236], white: [244, 240, 230],
};

// --- geometry ------------------------------------------------------------------------------------------------------
// Iso ground axes (screen units per km along each axis); the up vector is (0, -1).
const AX = 0.866, AY = 0.5;
const iso = (u, v) => [(u - v) * AX, (u + v) * AY]; // ground (u along A, v along B) → screen offset
const CORNERS = [0, 1, 2, 3, 4, 5].map((k) => {
  const a = ((60 * k - 30) * Math.PI) / 180;
  return [Math.cos(a), Math.sin(a)];
});
function hexPath(ctx, x, y, R, f) {
  ctx.beginPath();
  ctx.moveTo(x + R * CORNERS[0][0] * f, y + R * CORNERS[0][1] * f);
  for (let k = 1; k < 6; k++) ctx.lineTo(x + R * CORNERS[k][0] * f, y + R * CORNERS[k][1] * f);
  ctx.closePath();
}
/** Pointy-top hex "radius" of an offset, as a fraction of the apothem (1 on the flat sides). */
const hexRho = (x, y, R) => Math.max(Math.abs(x), 0.5 * Math.abs(x) + 0.866 * Math.abs(y)) / (0.866 * R);

/** Footprint corners [N, E, S, W] of a lot/box centred at screen (x, y) with half sizes a (along A), b (along B). */
function foot(x, y, a, b) {
  const [ax, ay] = iso(a, 0), [bx, by] = iso(0, b);
  return [
    [x - ax - bx, y - ay - by], // N (back)
    [x + ax - bx, y + ay - by], // E
    [x + ax + bx, y + ay + by], // S (front)
    [x - ax + bx, y - ay + by], // W
  ];
}
const up = (p, h) => [p[0], p[1] - h];
function poly(ctx, pts) {
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
  ctx.closePath();
}
function fillPoly(g, pts, style) {
  g.beginPath();
  poly(g, pts);
  g.fillStyle = style;
  g.fill();
}
// Convex hull (monotone chain) for shadows.
function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  for (let k = p.length - 1; k >= 0; k--) {
    const q = p[k];
    while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop();
    hi.push(q);
  }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}
/** Shadow polygon of a box of height h on footprint F (light from the upper left, so cast to the lower right). */
const shadowOf = (F, h) => hull(F.concat(F.map((p) => [p[0] + h * 0.62, p[1] + h * 0.26])));
const pick = (arr, t) => arr[Math.min(arr.length - 1, Math.floor(t * arr.length))];

/** A gabled house body on footprint F: walls of height hw, roof rise hr; ridge along A (along = 0) or B (1). */
function gable(g, F, hw, hr, wall, roof, along, lineW) {
  const [N, E, S, W] = F;
  const [Nt, Et, St, Wt] = F.map((p) => up(p, hw));
  const lit = css(wall), dark = css(shade(wall, -0.32));
  fillPoly(g, [W, S, St, Wt], lit);
  fillPoly(g, [S, E, Et, St], dark);
  const rLit = css(shade(roof, 0.14)), rDark = css(shade(roof, -0.28)), rBack = css(shade(roof, 0.26));
  if (along === 0) {
    const r0 = up([(Nt[0] + Wt[0]) / 2, (Nt[1] + Wt[1]) / 2], hr), r1 = up([(Et[0] + St[0]) / 2, (Et[1] + St[1]) / 2], hr);
    fillPoly(g, [Nt, Et, r1, r0], rBack); // back slope (faces NE, catches the light from above)
    fillPoly(g, [St, Et, r1], dark); // gable end on the SE face
    fillPoly(g, [Wt, St, r1, r0], rLit); // front slope
    if (lineW) {
      g.beginPath();
      g.moveTo(r0[0], r0[1]);
      g.lineTo(r1[0], r1[1]);
      g.strokeStyle = css(shade(roof, 0.45), 0.8);
      g.lineWidth = lineW;
      g.stroke();
    }
  } else {
    const r0 = up([(Nt[0] + Et[0]) / 2, (Nt[1] + Et[1]) / 2], hr), r1 = up([(Wt[0] + St[0]) / 2, (Wt[1] + St[1]) / 2], hr);
    fillPoly(g, [Wt, St, r1], lit); // gable end on the SW face
    fillPoly(g, [Nt, Wt, r1, r0], rBack);
    fillPoly(g, [Et, St, r1, r0], rDark);
    if (lineW) {
      g.beginPath();
      g.moveTo(r0[0], r0[1]);
      g.lineTo(r1[0], r1[1]);
      g.strokeStyle = css(shade(roof, 0.45), 0.8);
      g.lineWidth = lineW;
      g.stroke();
    }
  }
  if (lineW) {
    g.beginPath();
    poly(g, [W, Wt, Nt, Et, E, S]);
    g.strokeStyle = "rgba(40,28,18,.35)";
    g.lineWidth = lineW;
    g.stroke();
  }
}

/** A round deciduous tree (trunk, dark underside, mid canopy, lit crown) or a two-tier conifer; base at (x, y). */
function treeShape(g, x, y, r, conifer, shadowToo = true) {
  if (shadowToo) {
    g.beginPath();
    g.ellipse(x + r * 0.6, y + r * 0.1, r * 1.05, r * 0.5, 0, 0, Math.PI * 2);
    g.fillStyle = "rgba(20,30,10,.26)";
    g.fill();
  }
  if (conifer) {
    for (const [t, w0] of [[0, 0.85], [0.7, 0.62]]) {
      const yb = y - r * (0.1 + t), yt = yb - r * 1.5;
      g.beginPath();
      g.moveTo(x, yt);
      g.lineTo(x + r * w0, yb);
      g.lineTo(x - r * w0, yb);
      g.closePath();
      g.fillStyle = css(P.conifer);
      g.fill();
      g.beginPath();
      g.moveTo(x, yt);
      g.lineTo(x - r * w0, yb);
      g.lineTo(x - r * w0 * 0.1, yb);
      g.closePath();
      g.fillStyle = css(shade(P.conifer, 0.2));
      g.fill();
    }
    return;
  }
  g.beginPath();
  g.arc(x + r * 0.12, y - r * 0.62, r, 0, Math.PI * 2);
  g.fillStyle = css(P.tree);
  g.fill();
  g.beginPath();
  g.arc(x - r * 0.08, y - r * 0.78, r * 0.82, 0, Math.PI * 2);
  g.fillStyle = css(P.treeMid);
  g.fill();
  g.beginPath();
  g.arc(x - r * 0.34, y - r * 1.02, r * 0.42, 0, Math.PI * 2);
  g.fillStyle = css(P.treeLit);
  g.fill();
}

// --- painter -------------------------------------------------------------------------------------------------------
// A painter draws in km around the hex centre (0, 0) into context g. `px(n)` converts css px to km.

class Painter {
  constructor(g, R, sCss, dev, detail, accent) {
    this.g = g;
    this.R = R;
    this.s = sCss; // css px per km (bucketed)
    this.dev = dev; // device px per km of the target (for shadowBlur)
    this.detail = detail; // 0 mid, 1 near, 2 close
    this.accent = accent;
    this.shadows = new Path2D();
  }
  px(n) {
    return n / this.s;
  }
  /** Ground shadow of a box (cast to the lower right). */
  shadow(F, h) {
    poly(this.shadows, shadowOf(F, h));
  }
  /** A box on footprint F (from foot()), from height z0 to z0 + h. Colours: base [r,g,b]. */
  box(F, z0, h, base, { glass = false, outline = true, top = null } = {}) {
    const g = this.g;
    const [N, E, S, W] = F.map((p) => up(p, z0));
    const [Nt, Et, St, Wt] = [N, E, S, W].map((p) => up(p, h));
    const lit = base, dark = shade(base, glass ? -0.38 : -0.34), topC = top || shade(base, 0.2);
    // South-west face (half lit) and south-east face (shaded), with a gentle vertical gradient on taller boxes.
    if (h > this.px(6)) {
      const gr = g.createLinearGradient(0, Wt[1], 0, W[1]);
      gr.addColorStop(0, css(shade(lit, glass ? 0.16 : 0.06)));
      gr.addColorStop(1, css(shade(lit, -0.14)));
      fillPoly(g, [W, S, St, Wt], gr);
      const gd = g.createLinearGradient(0, Et[1], 0, E[1]);
      gd.addColorStop(0, css(shade(dark, 0.08)));
      gd.addColorStop(1, css(shade(dark, -0.18)));
      fillPoly(g, [S, E, Et, St], gd);
    } else {
      fillPoly(g, [W, S, St, Wt], css(lit));
      fillPoly(g, [S, E, Et, St], css(dark));
    }
    fillPoly(g, [Nt, Et, St, Wt], css(topC));
    if (outline && this.detail >= 1) {
      g.lineJoin = "round";
      // crisp lit edges: the front vertical edge and the top's front edges
      g.beginPath();
      g.moveTo(Wt[0], Wt[1]);
      g.lineTo(St[0], St[1]);
      g.lineTo(Et[0], Et[1]);
      g.moveTo(St[0], St[1]);
      g.lineTo(S[0], S[1]);
      g.strokeStyle = "rgba(255,250,235,.35)";
      g.lineWidth = this.px(0.6);
      g.stroke();
      g.beginPath();
      poly(g, [W, Wt, Nt, Et, E, S]);
      g.strokeStyle = "rgba(28,22,16,.45)";
      g.lineWidth = this.px(0.6);
      g.stroke();
    }
    return { N: Nt, E: Et, S: St, W: Wt, base: [N, E, S, W] };
  }
  /** Rows of windows on both visible faces of a box placed with box(). */
  windows(F, z0, h, glass) {
    if (this.detail < 2) return;
    const g = this.g;
    const floor = Math.max(this.px(3.2), this.R * 0.022);
    const nf = Math.floor((h - floor * 0.6) / floor);
    if (nf < 1) return;
    const [, E, S, W] = F.map((p) => up(p, z0));
    const faces = [
      [W, S, glass ? "rgba(225,240,250,.42)" : "rgba(70,78,92,.55)"],
      [S, E, glass ? "rgba(160,200,230,.22)" : "rgba(30,34,44,.5)"],
    ];
    for (const [a, b, style] of faces) {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const nCol = Math.max(1, Math.floor(len / this.px(3)));
      const path = new Path2D();
      for (let f = 0; f < nf; f++) {
        const z = floor * (f + 0.45), zh = floor * 0.45;
        for (let c = 0; c < nCol; c++) {
          const t0 = (c + 0.22) / nCol, t1 = (c + 0.78) / nCol;
          const p0 = [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0 - z];
          const p1 = [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1 - z];
          poly(path, [p0, p1, [p1[0], p1[1] - zh], [p0[0], p0[1] - zh]]);
        }
      }
      g.fillStyle = style;
      g.fill(path);
    }
  }
  /** A small house with a gable roof; `along` = 0 ridge along A, 1 along B. */
  house(x, y, a, b, wall, roof, along) {
    const hw = Math.max(this.R * 0.03, this.px(2)), hr = Math.max(this.R * 0.026, this.px(1.6));
    const F = foot(x, y, a, b);
    gable(this.g, F, hw, hr, wall, roof, along, this.detail >= 1 ? this.px(0.5) : 0);
    this.shadow(F, hw + hr * 0.6);
  }
  tree(x, y, r, conifer = false) {
    treeShape(this.g, x, y, r, conifer);
  }
  /** Feathered fill: a soft dark halo of `blur` km around path P, then P itself. */
  feather(P, style, blur, haloStyle) {
    const g = this.g;
    g.save();
    g.shadowColor = haloStyle;
    g.shadowBlur = Math.max(1, blur * this.dev);
    g.fillStyle = style;
    g.fill(P);
    g.restore();
  }
}

// --- landmarks -----------------------------------------------------------------------------------------------------

/** A white church with a gabled nave along A and a steeple at its front (lower right) end. */
function drawChurch(p, x, y, sz, accent) {
  const g = p.g;
  const roof = mix([88, 92, 104], accent, 0.35);
  const F = foot(x, y, sz, sz * 0.55);
  const hw = sz * 0.62;
  p.shadow(F, hw + sz * 0.4);
  gable(g, F, hw, sz * 0.48, P.white, roof, 0, p.detail >= 1 ? p.px(0.5) : 0);
  // steeple: a square tower, a belfry band and a spire in the state colour, a gold finial
  const [tx, ty] = iso(sz * 0.95, 0);
  const t = sz * 0.3, th = sz * 1.55, sh = sz * 1.15;
  const Ft = foot(x + tx, y + ty, t, t);
  p.shadow(Ft, th + sh * 0.6);
  const top = p.box(Ft, 0, th, P.white);
  if (p.detail >= 1) {
    const [, E, S, W] = Ft.map((q) => up(q, th * 0.72));
    const bh = th * 0.14;
    fillPoly(g, [W, S, up(S, bh), up(W, bh)], "rgba(60,52,44,.7)");
    fillPoly(g, [S, E, up(E, bh), up(S, bh)], "rgba(30,26,22,.75)");
  }
  const tip = [x + tx, y + ty - th - sh];
  fillPoly(g, [top.W, top.S, tip], css(shade(accent, 0.12)));
  fillPoly(g, [top.S, top.E, tip], css(shade(accent, -0.3)));
  g.beginPath();
  g.arc(tip[0], tip[1], Math.max(p.px(0.7), sz * 0.07), 0, Math.PI * 2);
  g.fillStyle = "#f0d27a";
  g.fill();
}

/** A water tower: four legs, a white tank with a band in the state colour and a conical cap. */
function drawWaterTower(p, x, y, sz, accent) {
  const g = p.g;
  const z = sz * 1.9, rx = sz * 0.62, ry = rx * 0.5, th = sz * 0.7;
  g.beginPath();
  g.ellipse(x + z * 0.5, y + z * 0.2, rx * 1.1, ry * 0.9, 0, 0, Math.PI * 2);
  g.fillStyle = "rgba(22,18,12,.22)";
  g.fill();
  // legs (back pair darker)
  const lw = Math.max(p.px(0.7), sz * 0.07);
  for (const [lx, ly, a] of [[-0.45, -0.18, 0.55], [0.45, -0.18, 0.55], [-0.5, 0.2, 0.9], [0.5, 0.2, 0.9]]) {
    g.beginPath();
    g.moveTo(x + lx * rx, y + ly * rx);
    g.lineTo(x + lx * rx * 0.55, y - z + ly * ry * 0.5);
    g.strokeStyle = `rgba(70,74,80,${a})`;
    g.lineWidth = lw;
    g.stroke();
  }
  const cy = y - z;
  const body = g.createLinearGradient(x - rx, 0, x + rx, 0);
  body.addColorStop(0, "#fbfaf6");
  body.addColorStop(0.5, "#e6e4de");
  body.addColorStop(1, "#9c9a96");
  g.beginPath();
  g.ellipse(x, cy, rx, ry, 0, 0, Math.PI);
  g.lineTo(x - rx, cy - th);
  g.ellipse(x, cy - th, rx, ry, 0, Math.PI, 2 * Math.PI);
  g.closePath();
  g.fillStyle = body;
  g.fill();
  // band in the state colour
  const b0 = cy - th * 0.38, bh = th * 0.28;
  g.beginPath();
  g.ellipse(x, b0, rx, ry, 0, 0, Math.PI);
  g.lineTo(x - rx, b0 - bh);
  g.ellipse(x, b0 - bh, rx, ry, 0, Math.PI, 0, true);
  g.closePath();
  g.fillStyle = css(accent);
  g.fill();
  // cap
  g.beginPath();
  g.ellipse(x, cy - th, rx, ry, 0, 0, Math.PI);
  g.lineTo(x, cy - th - sz * 0.55);
  g.closePath();
  g.fillStyle = "#d2d0ca";
  g.fill();
  g.beginPath();
  g.moveTo(x - rx, cy - th);
  g.lineTo(x, cy - th - sz * 0.55);
  g.lineTo(x - rx * 0.1, cy - th + ry);
  g.closePath();
  g.fillStyle = "rgba(255,255,255,.55)";
  g.fill();
}

// --- village -------------------------------------------------------------------------------------------------------

/** A village: one or two country roads, 6-10 houses along them, a landmark, garden trees and fields around. */
function paintVillage(p, seed, accent, Rpx) {
  const g = p.g, R = p.R;
  const r = rng(seed * 7919 + 101);
  const roadW = Math.max(R * 0.05, p.px(2.6)), roadIn = Math.max(R * 0.03, p.px(1.4));
  const hs = Math.max(R * 0.048, p.px(2.6)); // house half size
  const S = hs * 2.35; // spacing along a road
  const side = roadW / 2 + hs * 0.9 + Math.max(R * 0.012, p.px(0.8));
  const v0 = (r() - 0.5) * 0.08 * R; // main road along A at v = v0
  const cross = r() < 0.7 ? { u: (r() - 0.5) * 0.2 * R, v1: (0.26 + r() * 0.12) * R } : null; // road along B at u
  const nHouses = Rpx < 34 ? 6 : Rpx < 56 ? 8 : 10;

  // House spots along the roads, nearest the crossroads first (a compact cluster).
  const spots = [];
  const cu = cross ? cross.u : 0;
  for (let u = -0.44 * R; u <= 0.44 * R; u += S) {
    if (cross && Math.abs(u - cross.u) < S * 0.8) continue;
    for (const sg of [-1, 1]) spots.push({ u, v: v0 + sg * side, along: 0 });
  }
  if (cross) {
    for (let v = -cross.v1; v <= cross.v1; v += S) {
      if (Math.abs(v - v0) < S * 0.8) continue;
      for (const sg of [-1, 1]) spots.push({ u: cross.u + sg * side, v, along: 1 });
    }
  }
  for (const sp of spots) sp.d = Math.hypot(sp.u - cu, sp.v - v0) * (0.8 + r() * 0.4);
  spots.sort((a, b) => a.d - b.d);

  // The landmark sits behind the main road near the crossroads; spots too close to it are dropped.
  const church = r() < 0.62;
  const lm = { u: cu + S * 1.1, v: v0 - side - hs * (church ? 0.5 : 0.2) };
  const free = spots.filter((sp) => Math.hypot(sp.u - lm.u, sp.v - lm.v) > hs * 3.2);
  const houses = free.slice(0, nHouses);

  const items = [];
  for (const sp of houses) {
    const [x, y] = iso(sp.u, sp.v);
    const wall = pick(P.walls, r()), roof = r() < 0.2 ? mix(P.roofs[0], accent, 0.55) : pick(P.roofs, r());
    const a = hs * (sp.along === 0 ? 1.05 : 0.75) * (0.9 + r() * 0.2), b = hs * (sp.along === 0 ? 0.75 : 1.05) * (0.9 + r() * 0.2);
    items.push({ y, draw: () => p.house(x, y, a, b, wall, roof, sp.along) });
  }
  {
    const [x, y] = iso(lm.u, lm.v);
    items.push({ y, draw: () => (church ? drawChurch(p, x, y, hs * 1.35, accent) : drawWaterTower(p, x, y, hs * 1.1, accent)) });
  }
  // Garden trees between and behind the houses, away from the roads and the buildings.
  const roadDist = (u, v) => Math.min(Math.abs(v - v0), cross && Math.abs(v) <= cross.v1 + S ? Math.abs(u - cross.u) : Infinity);
  const nTrees = 7 + Math.floor(r() * 4);
  const treeR = Math.max(R * 0.042, p.px(2.2));
  const placed = houses.map((sp) => [sp.u, sp.v]).concat([[lm.u, lm.v]]);
  for (let k = 0, tries = 0; k < nTrees && tries < 140; tries++) {
    const ang = r() * Math.PI * 2, rad = (0.12 + r() * 0.46) * R;
    const u = cu + Math.cos(ang) * rad, v = v0 + Math.sin(ang) * rad * 0.8;
    const [x, y] = iso(u, v);
    if (hexRho(x, y, R) > 0.7) continue;
    if (roadDist(u, v) < roadW + treeR) continue;
    if (placed.some(([pu, pv]) => Math.hypot(pu - u, pv - v) < hs * 1.7)) continue;
    placed.push([u, v]);
    const conifer = r() < 0.25, tr = treeR * (0.85 + r() * 0.3);
    items.push({ y, draw: () => p.tree(x, y, tr, conifer) });
    k++;
  }

  // Fields (near+): a few striped patches in the outer ring, away from the main road.
  if (p.detail >= 1) {
    const nF = 3 + Math.floor(r() * 2);
    for (let k = 0, tries = 0; k < nF && tries < 30; tries++) {
      const ang = r() * Math.PI * 2, rad = (0.52 + r() * 0.16) * R;
      const u = Math.cos(ang) * rad, v = Math.sin(ang) * rad;
      const fa = (0.1 + r() * 0.07) * R, fb = (0.07 + r() * 0.05) * R;
      const F = foot(...iso(u, v), fa, fb);
      if (F.some(([fx, fy]) => hexRho(fx, fy, R) > 0.84)) continue;
      if (Math.abs(v - v0) < fb + roadW * 2 || (cross && Math.abs(u - cross.u) < fa + roadW * 2 && Math.abs(v) < cross.v1)) continue;
      if (placed.some(([pu, pv]) => Math.abs(pu - u) < fa + hs * 1.5 && Math.abs(pv - v) < fb + hs * 1.5)) continue;
      placed.push([u, v]);
      const col = pick(P.field, r());
      fillPoly(g, F, css(col, 0.9));
      // furrows along the long side
      g.beginPath();
      const [N, E, S2, W] = F;
      const nS = Math.max(3, Math.round((fb * 2 * p.s) / 2.4));
      for (let q = 1; q < nS; q++) {
        const t = q / nS;
        g.moveTo(N[0] + (W[0] - N[0]) * t, N[1] + (W[1] - N[1]) * t);
        g.lineTo(E[0] + (S2[0] - E[0]) * t, E[1] + (S2[1] - E[1]) * t);
      }
      g.strokeStyle = css(shade(col, -0.25), 0.5);
      g.lineWidth = p.px(0.6);
      g.stroke();
      g.beginPath();
      poly(g, F);
      g.strokeStyle = "rgba(70,60,30,.35)";
      g.lineWidth = p.px(0.6);
      g.stroke();
    }
  }

  // A warm, light patch of trodden ground under the houses (lighter, not a dark vignette).
  const [gx, gy] = iso(cu, v0);
  const gr = g.createRadialGradient(gx, gy, 0, gx, gy, R * 0.5);
  gr.addColorStop(0, "rgba(236,226,186,.2)");
  gr.addColorStop(1, "rgba(236,226,186,0)");
  g.fillStyle = gr;
  g.fillRect(gx - R * 0.5, gy - R * 0.5, R, R);

  // Roads: the main road runs on to the hex edge (fading), the cross road stops in the village.
  const road = new Path2D();
  const [m0x, m0y] = iso(-0.6 * R, v0), [m1x, m1y] = iso(0.6 * R, v0);
  road.moveTo(m0x, m0y);
  road.lineTo(m1x, m1y);
  if (cross) {
    const [c0x, c0y] = iso(cross.u, -cross.v1), [c1x, c1y] = iso(cross.u, cross.v1);
    road.moveTo(c0x, c0y);
    road.lineTo(c1x, c1y);
  }
  const tail = new Path2D();
  for (const sg of [-1, 1]) {
    const [ax, ay] = iso(sg * 0.6 * R, v0), [bx, by] = iso(sg * 0.8 * R, v0);
    tail.moveTo(ax, ay);
    tail.lineTo(bx, by);
  }
  g.lineCap = "round";
  for (const [P2, a] of [[road, 1], [tail, 0.5]]) {
    g.strokeStyle = css(P.roadEdge, 0.5 * a);
    g.lineWidth = roadW;
    g.stroke(P2);
    g.strokeStyle = css(P.road, 0.95 * a);
    g.lineWidth = roadIn;
    g.stroke(P2);
  }
  return items;
}

// --- street-grid layout ----------------------------------------------------------------------------------------------

/** Blocks of the tile: {L (pitch), sw (street width), bh (block half size), lots: [{x, y, u, v, c, id, type}],
 *  fringe: [{x, y, id}]} (km). */
function gridLayout(cls, seed, R, Rpx, capital) {
  const L = Math.max(cls.lot * R, (LOT_MIN_PX / Rpx) * R);
  const sw = Math.max(L * 0.19, (1.3 / Rpx) * R);
  const half = L / 2, bh = half - sw / 2;
  const n = Math.ceil((R * 1.2) / L) + 1;
  const lots = [], fringe = [];
  const H = (id, salt) => hash01(seed * 7919 + id, salt);
  const capR = capital ? capitolExtent(R, Rpx) : null;
  for (let u = -n; u <= n; u++) {
    for (let v = -n; v <= n; v++) {
      const [x, y] = iso(u * L, v * L);
      const id = (u + 64) * 131 + (v + 64);
      const rho = Math.max(...foot(x, y, half, half).map((q) => hexRho(q[0], q[1], R)));
      const rc = hexRho(x, y, R);
      const reserved = capR && reservedByCapitol(u * L, v * L, L, capR);
      const cut = !reserved && rc > cls.extent * 0.68 && H(id, 10) < cls.ragged;
      if (rho <= cls.extent && !cut) {
        const c = Math.max(0, Math.min(1, 1 - rc / cls.extent + (H(id, 11) - 0.5) * 0.16));
        lots.push({ x, y, u, v, c, id, type: reserved ? "reserved" : null });
      } else if (cls.fringe && rho <= 0.86) {
        fringe.push({ x, y, id });
      }
    }
  }
  // Types: towers in the core, mid-rise around it, houses at the edge; a park, a plaza, a civic building.
  const free = lots.filter((l) => !l.type);
  const best = (ok, salt) => {
    let b = null, bv = -1;
    for (const l of free) {
      if (l.type || !ok(l)) continue;
      const h = H(l.id, salt);
      if (h > bv) { b = l; bv = h; }
    }
    return b;
  };
  if (free.length >= 4) {
    const park = best((l) => l.c > 0.2 && l.c < 0.7, 12);
    if (park) park.type = "park";
  }
  if (free.length > 12 && cls.core < 1) {
    const plaza = best((l) => l.c > 0.45 && l.c < 0.82, 14);
    if (plaza) plaza.type = "plaza";
  }
  if (cls.civic && free.length >= 8 && !capital) {
    const civ = best((l) => l.c > 0.3 && l.c < 0.75, 16);
    if (civ) civ.type = "civic";
  }
  for (const l of free) {
    if (l.type) continue;
    if (H(l.id, 13) < cls.park) l.type = "park";
    else if (l.c > cls.core && H(l.id, 15) < 0.9) l.type = "core";
    else if (l.c > cls.mid) l.type = "mid";
    else l.type = "res";
  }
  return { L, sw, half, bh, lots, fringe };
}

// --- the capitol complex ---------------------------------------------------------------------------------------

function capitolExtent(R, Rpx) {
  const q = R * 0.1 * Math.max(1, Math.min(1.5, 26 / Rpx)); // grows a bit when zoomed out, to stay legible
  return { q, half: q * 2.9, mallFrom: q * 2.9, mallTo: Math.min(R * 0.78, q * 8.5), mallHalf: q * 1.05 };
}
function reservedByCapitol(u, v, L, C) {
  const h = L * 0.5;
  const inSq = Math.abs(u) - h < C.half && Math.abs(v) - h < C.half;
  const inMall = u + h > C.mallFrom && u - h < C.mallTo && Math.abs(v) - h < C.mallHalf;
  return inSq || inMall;
}

function paintCapitolGround(p, C) {
  const g = p.g;
  // stone plaza
  fillPoly(g, foot(0, 0, C.half, C.half), css(P.plaza));
  fillPoly(g, foot(0, 0, C.half * 0.82, C.half * 0.82), css(P.plazaInner));
  // the mall: lawn with two gravel walks and rows of trees
  const mu = (C.mallFrom + C.mallTo) / 2, mh = (C.mallTo - C.mallFrom) / 2;
  const [mx, my] = iso(mu, 0);
  fillPoly(g, foot(mx, my, mh, C.mallHalf), css(P.lawn));
  if (p.detail >= 1) {
    for (const sv of [-0.55, 0.55]) {
      const [ax, ay] = iso(C.mallFrom, sv * C.mallHalf), [bx, by] = iso(C.mallTo, sv * C.mallHalf);
      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(bx, by);
      g.strokeStyle = css(P.path, 0.85);
      g.lineWidth = Math.max(p.px(1), C.q * 0.12);
      g.stroke();
    }
    // reflecting pool near the far end
    const [rx, ry] = iso(C.mallTo - C.q * 1.6, 0);
    fillPoly(g, foot(rx, ry, C.q * 0.9, C.q * 0.22), "rgba(110,170,210,.95)");
  }
}

/** Items to draw in depth order for the capitol complex: [{y, draw()}]. */
function capitolItems(p, C) {
  const items = [];
  const q = C.q;
  // tree rows along the mall
  if (p.detail >= 1) {
    const nT = Math.max(2, Math.floor((C.mallTo - C.mallFrom - q) / Math.max(q * 0.9, p.px(5))));
    for (let k = 0; k <= nT; k++) {
      const u = C.mallFrom + q * 0.5 + ((C.mallTo - C.mallFrom - q * 1.6) * k) / nT;
      for (const sv of [-0.95, 0.95]) {
        const [tx, ty] = iso(u, sv * C.mallHalf);
        items.push({ y: ty, draw: () => p.tree(tx, ty, Math.max(q * 0.22, p.px(1.6))) });
      }
    }
  }
  // the obelisk at the far end of the mall
  const [ox, oy] = iso(C.mallTo - q * 0.4, 0);
  items.push({
    y: oy,
    draw: () => {
      const a = Math.max(q * 0.13, p.px(1.2)), h = q * 2.1;
      const F = foot(ox, oy, a, a);
      p.shadow(F, h);
      const t = p.box(F, 0, h, P.marble, { outline: false });
      const tip = [ox, oy - h - a * 2.4];
      fillPoly(p.g, [t.W, t.S, tip], css(shade(P.marble, 0.05)));
      fillPoly(p.g, [t.S, t.E, tip], css(shade(P.marble, -0.3)));
    },
  });
  // the capitol: a long marble block (long axis along B), a portico toward the mall, a drum and a dome
  items.push({
    y: 0,
    draw: () => {
      const g = p.g;
      const wingH = q * 0.55;
      const F = foot(0, 0, q * 0.95, q * 2.5);
      p.shadow(F, q * 1.4);
      p.box(F, 0, wingH, P.marble);
      // centre block, a little taller
      const Fc = foot(0, 0, q * 1.05, q * 0.95);
      p.box(Fc, 0, wingH * 1.25, P.marble);
      // portico on the SE face with columns
      const Fp = foot(q * 1.25, 0, q * 0.3, q * 0.6);
      const por = p.box(Fp, 0, wingH * 1.1, shade(P.marble, -0.02));
      // pediment
      const ped = [por.S, por.E, [(por.S[0] + por.E[0]) / 2, (por.S[1] + por.E[1]) / 2 - q * 0.28]];
      fillPoly(g, ped, css(shade(P.marble, -0.12)));
      if (p.detail >= 1) {
        const [, E, S] = Fp;
        g.beginPath();
        for (let k = 1; k < 6; k++) {
          const t = k / 6;
          const bx = S[0] + (E[0] - S[0]) * t, by = S[1] + (E[1] - S[1]) * t;
          g.moveTo(bx, by - q * 0.05);
          g.lineTo(bx, by - wingH * 1.0);
        }
        g.strokeStyle = "rgba(255,255,250,.85)";
        g.lineWidth = Math.max(p.px(0.6), q * 0.05);
        g.stroke();
      }
      // drum (a short cylinder) on the centre block
      const z = wingH * 1.25;
      const rx = q * 0.78, ry = rx * 0.5, dh = q * 0.55;
      const cy = -z;
      const drum = g.createLinearGradient(-rx, 0, rx, 0);
      drum.addColorStop(0, css(shade(P.dome, 0.0)));
      drum.addColorStop(0.45, css(shade(P.dome, -0.08)));
      drum.addColorStop(1, css(shade(P.dome, -0.4)));
      g.beginPath();
      g.ellipse(0, cy, rx, ry, 0, 0, Math.PI);
      g.lineTo(-rx, cy - dh);
      g.ellipse(0, cy - dh, rx, ry, 0, Math.PI, 2 * Math.PI);
      g.closePath();
      g.fillStyle = drum;
      g.fill();
      g.beginPath();
      g.ellipse(0, cy - dh, rx, ry, 0, 0, Math.PI * 2);
      g.fillStyle = css(shade(P.dome, -0.12));
      g.fill();
      if (p.detail >= 1) {
        g.beginPath();
        for (let k = 1; k < 10; k++) {
          const a = Math.PI - (k * Math.PI) / 10;
          const cx = Math.cos(a) * rx;
          g.moveTo(cx, cy + Math.sin(a) * ry - q * 0.04);
          g.lineTo(cx, cy + Math.sin(a) * ry - dh + q * 0.04);
        }
        g.strokeStyle = "rgba(120,110,95,.45)";
        g.lineWidth = Math.max(p.px(0.5), q * 0.035);
        g.stroke();
      }
      // dome: a tall half-ellipse with a highlight from the upper left
      const dy = cy - dh, dr = rx * 0.9, dhh = q * 1.05;
      const dome = g.createRadialGradient(-dr * 0.35, dy - dhh * 0.6, dr * 0.05, 0, dy - dhh * 0.3, dr * 1.25);
      dome.addColorStop(0, "#ffffff");
      dome.addColorStop(0.5, css(P.dome));
      dome.addColorStop(1, css(shade(P.dome, -0.42)));
      g.beginPath();
      g.ellipse(0, dy, dr, ry * 0.9, 0, 0, Math.PI);
      g.ellipse(0, dy, dr, dhh, 0, Math.PI, 0);
      g.closePath();
      g.fillStyle = dome;
      g.fill();
      g.strokeStyle = "rgba(60,50,40,.4)";
      g.lineWidth = p.px(0.6);
      g.stroke();
      if (p.detail >= 1) {
        // ribs
        g.beginPath();
        for (const f of [-0.55, 0, 0.55]) {
          g.moveTo(dr * f, dy + ry * 0.9 * Math.sqrt(1 - f * f) * 0.9);
          g.quadraticCurveTo(dr * f * 0.95, dy - dhh * 0.7, 0, dy - dhh);
        }
        g.strokeStyle = "rgba(150,140,120,.45)";
        g.lineWidth = p.px(0.5);
        g.stroke();
      }
      // lantern and statue
      const lw = Math.max(q * 0.16, p.px(1.2)), lh = q * 0.36;
      g.fillStyle = css(shade(P.dome, -0.05));
      g.fillRect(-lw, dy - dhh - lh, lw * 2, lh + q * 0.04);
      g.fillStyle = css(shade(P.dome, -0.35));
      g.fillRect(0, dy - dhh - lh, lw, lh + q * 0.04);
      g.beginPath();
      g.arc(0, dy - dhh - lh - lw * 0.5, lw * 0.75, 0, Math.PI * 2);
      g.fillStyle = "#c9a45c";
      g.fill();
    },
  });
  return items;
}

// --- painting a whole tile ---------------------------------------------------------------------------------------

function paintTile(g, city, R, Rpx, dev, detail, col, seed, capital) {
  const cls = cityClass(city.population);
  const sCss = Rpx / R;
  const p = new Painter(g, R, sCss, dev, detail, col);
  const items = cls.village ? paintVillage(p, seed, col, Rpx) : paintGrid(p, cls, seed, Rpx, capital);
  items.sort((a, b) => a.y - b.y);

  // All cast shadows first, as one fill so overlapping shadows don't darken twice, then the buildings. The
  // shadow geometry comes from a dry run of the same draw calls against a context that paints nothing.
  prepassShadows(p, items);
  g.fillStyle = "rgba(22,18,12,.3)";
  g.fill(p.shadows);
  p.shadows = new Path2D(); // the real pass adds the same shapes again; they are dropped
  for (const it of items) it.draw();

  // No hex rim: the built-up area fades into the land around it, and the state shows only through accents (roof
  // trims, crowns, steeples, water-tower bands). Up close a faint hairline keeps the city hex findable.
  if (detail >= 2 && !cls.village) {
    hexPath(g, 0, 0, R, 0.95);
    g.lineJoin = "round";
    g.strokeStyle = css(shade(col, 0.1), 0.25);
    g.lineWidth = p.px(1);
    g.stroke();
  }
}

/** Town and bigger: lawn base, paved street grid, block fills; returns the standing items. */
function paintGrid(p, cls, seed, Rpx, capital) {
  const g = p.g, R = p.R;
  const lay = gridLayout(cls, seed, R, Rpx, capital);
  const { L, half, bh, lots, fringe } = lay;
  const ci = CITY_CLASSES.indexOf(cls);
  const accent = p.accent;
  const r0 = (id, salt) => hash01(seed * 7919 + id, salt);

  // 1. A suburban lawn base, opaque in the middle and feathered out to nothing near the hex edge, so the built-up
  //    land blends into the forest, fields or suburbs around it (no pad, no rim).
  g.save();
  hexPath(g, 0, 0, R, 0.97);
  g.clip();
  const lawn = mix(mix(P.lawn, [96, 128, 66], 0.4), P.concrete, cls.grey * 0.6);
  const lg = g.createRadialGradient(-R * 0.08, -R * 0.1, 0, 0, 0, R * 0.97);
  lg.addColorStop(0, css(shade(lawn, 0.04)));
  lg.addColorStop(0.5, css(lawn, 0.96));
  lg.addColorStop(0.7, css(shade(lawn, -0.06), 0.5));
  lg.addColorStop(0.88, css(shade(lawn, -0.08), 0));
  g.fillStyle = lg;
  g.fillRect(-R, -R, 2 * R, 2 * R);
  // a little mottling so the base isn't flat (kept inside the opaque middle)
  for (let k = 0; k < 6; k++) {
    const mx = (hash01(seed, 40 + k) - 0.5) * 0.9 * R, my = (hash01(seed, 50 + k) - 0.5) * 0.9 * R, mr = R * (0.16 + hash01(seed, 60 + k) * 0.2);
    const mg = g.createRadialGradient(mx, my, 0, mx, my, mr);
    const c = k % 2 ? "40,60,20" : "230,236,190";
    mg.addColorStop(0, `rgba(${c},.12)`);
    mg.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = mg;
    g.fillRect(mx - mr, my - mr, 2 * mr, 2 * mr);
  }
  g.restore();

  // 2. The pad: kerb (with a soft feather) and asphalt, the union of the blocks' street cells.
  const kw = Math.max(p.px(0.9), L * 0.05);
  const pad = new Path2D(), kerb = new Path2D();
  for (const l of lots) {
    poly(pad, foot(l.x, l.y, half, half));
    poly(kerb, foot(l.x, l.y, half + kw, half + kw));
  }
  g.save();
  hexPath(g, 0, 0, R, 0.95); // keep the feather off the neighbouring hexes
  g.clip();
  p.feather(kerb, css(P.kerb), R * 0.05, "rgba(40,36,28,.55)");
  g.fillStyle = css(shade(P.asphalt, ci * 0.03));
  g.fill(pad);
  g.restore();

  // 3. Blocks: a sidewalk, then the block's own surface.
  const swk = Math.max(p.px(0.55), L * 0.035);
  const paths = { walk: new Path2D(), paved: new Path2D(), lawn: new Path2D(), park: new Path2D(), plaza: new Path2D() };
  const parkWalks = new Path2D();
  for (const l of lots) {
    if (l.type === "reserved") continue;
    poly(paths.walk, foot(l.x, l.y, bh, bh));
    const kind = l.type === "res" ? "lawn" : l.type === "park" ? "park" : l.type === "plaza" ? "plaza" : "paved";
    const F = foot(l.x, l.y, bh - swk, bh - swk);
    poly(paths[kind], F);
    if (l.type === "park" && p.detail >= 1) {
      const [N, E, S, W] = F;
      parkWalks.moveTo(N[0], N[1]);
      parkWalks.lineTo(S[0], S[1]);
      parkWalks.moveTo(W[0], W[1]);
      parkWalks.lineTo(E[0], E[1]);
    }
  }
  g.fillStyle = css(P.walk);
  g.fill(paths.walk);
  g.fillStyle = css(P.concrete);
  g.fill(paths.paved);
  g.fillStyle = css(P.lawnBlock);
  g.fill(paths.lawn);
  g.fillStyle = css(P.park);
  g.fill(paths.park);
  g.fillStyle = css(P.plazaInner);
  g.fill(paths.plaza);
  if (p.detail >= 1) {
    g.strokeStyle = css(P.path, 0.9);
    g.lineWidth = Math.max(p.px(0.8), L * 0.04);
    g.stroke(parkWalks);
  }
  // 4. Lane markings on the two main avenues (close).
  if (p.detail >= 2 && ci >= 2) {
    const avenue = new Path2D();
    const reach = R * 1.2;
    for (const off of [0.5, -0.5]) {
      const [ax, ay] = iso(-reach, off * L), [bx, by] = iso(reach, off * L);
      avenue.moveTo(ax, ay);
      avenue.lineTo(bx, by);
      const [cx, cy] = iso(off * L, -reach), [dx, dy] = iso(off * L, reach);
      avenue.moveTo(cx, cy);
      avenue.lineTo(dx, dy);
    }
    g.save();
    g.clip(pad);
    g.setLineDash([p.px(2.2), p.px(2.2)]);
    g.strokeStyle = "rgba(240,214,130,.6)";
    g.lineWidth = p.px(0.7);
    g.stroke(avenue);
    g.setLineDash([]);
    g.restore();
  }
  const C = capital ? capitolExtent(R, Rpx) : null;
  if (C) paintCapitolGround(p, C);

  // 5. Everything that stands up.
  const items = [];
  const hMax = R * (capital ? Math.min(cls.height, 0.24) : cls.height);
  const big = bh * p.s >= 6; // blocks big enough to subdivide (css px)
  let tallest = null;
  for (const l of lots) {
    const r = (salt) => r0(l.id, salt);
    const { x, y } = l;
    if (l.type === "core") {
      const h = Math.max(p.px(7), hMax * (0.3 + 0.7 * l.c ** 1.4 * (0.55 + 0.45 * r(21))));
      const it = { y, h, draw: () => drawCore(p, x, y, bh, h, r, it === tallest) };
      if (!tallest || h > tallest.h) tallest = it;
      items.push(it);
    } else if (l.type === "mid") {
      const h = Math.max(p.px(3.5), R * (0.045 + 0.06 * r(24)) * (0.8 + ci * 0.12) * (0.6 + 0.6 * l.c));
      const split = !big ? 1 : r(25) < 0.3 ? 1 : r(25) < 0.55 ? 2 : r(25) < 0.8 ? 3 : 4;
      for (const pc of parcels(split, bh)) {
        const [ox, oy] = iso(pc.u, pc.v);
        const gap = Math.max(p.px(0.45), L * 0.018);
        const k = pc.k;
        items.push({
          y: y + oy,
          draw: () => drawBlock(p, x + ox, y + oy, pc.a - gap, pc.b - gap, h * (0.7 + 0.55 * r(26 + k)), r, k),
        });
      }
    } else if (l.type === "res") {
      const spots = big ? [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]] : [[0, 0]];
      spots.forEach(([su, sv], k) => {
        const [hx, hy] = iso(su * bh, sv * bh);
        const sz = big ? 0.34 : 0.55;
        const along = r(100 + k) < 0.5 ? 0 : 1;
        const a = bh * sz * (along === 0 ? 1 : 0.75) * (0.9 + r(50 + k) * 0.2);
        const b = bh * sz * (along === 0 ? 0.75 : 1) * (0.9 + r(60 + k) * 0.2);
        const wall = pick(P.walls, r(70 + k));
        const roof = r(80 + k) < 0.2 ? mix(P.roofs[0], accent, 0.6) : pick(P.roofs, r(90 + k));
        items.push({ y: y + hy, draw: () => p.house(x + hx, y + hy, a, b, wall, roof, along) });
      });
      if (big && p.detail >= 1 && r(105) < 0.7) {
        items.push({ y: y + 0.001, draw: () => p.tree(x, y, Math.max(bh * 0.2, p.px(1.6)), r(106) < 0.2) });
      }
    } else if (l.type === "park") {
      const nT = p.detail === 0 ? 2 : big ? 6 : 3;
      if (p.detail >= 2 && big) {
        const [px2, py2] = iso(bh * 0.3, -bh * 0.25);
        g.beginPath();
        g.ellipse(x + px2, y + py2, bh * 0.32, bh * 0.17, 0, 0, Math.PI * 2);
        g.fillStyle = css(P.pond);
        g.fill();
        g.strokeStyle = "rgba(240,250,255,.6)";
        g.lineWidth = p.px(0.6);
        g.stroke();
      }
      for (let k = 0; k < nT; k++) {
        const [tx, ty] = iso((r(110 + k) - 0.5) * bh * 1.5, (r(120 + k) - 0.5) * bh * 1.5);
        items.push({ y: y + ty, draw: () => p.tree(x + tx, y + ty, Math.max(bh * 0.2, p.px(1.6)), r(130 + k) < 0.3) });
      }
    } else if (l.type === "plaza") {
      items.push({ y, draw: () => drawPlaza(p, x, y, bh, accent) });
    } else if (l.type === "civic") {
      items.push({ y, draw: () => drawChurch(p, x, y, bh * 0.5, accent) });
    }
  }
  // Fringe: houses and trees on the lawn outside the pad.
  for (const f of fringe) {
    const r = (salt) => r0(f.id, salt);
    const n = 1 + (r(200) < 0.6 ? 1 : 0);
    for (let k = 0; k < n; k++) {
      const [ox, oy] = iso((r(201 + k) - 0.5) * L * 0.6, (r(211 + k) - 0.5) * L * 0.6);
      const hx = f.x + ox, hy = f.y + oy;
      if (r(221 + k) < 0.45) {
        items.push({ y: hy, draw: () => p.tree(hx, hy, Math.max(L * 0.1, p.px(1.6)), r(231 + k) < 0.3) });
      } else {
        const a = Math.max(L * 0.14, p.px(2)), b = a * 0.75;
        const wall = pick(P.walls, r(241 + k)), roof = pick(P.roofs, r(251 + k));
        items.push({ y: hy, draw: () => p.house(hx, hy, a, b, wall, roof, r(261 + k) < 0.5 ? 0 : 1) });
      }
    }
  }
  if (C) items.push(...capitolItems(p, C));
  return items;
}

/** Parcels of a block (half size bh): 1 whole, 2 split along A, 3 split along B, 4 a 2x2 grid. */
function parcels(split, bh) {
  if (split === 1) return [{ u: 0, v: 0, a: bh, b: bh, k: 0 }];
  if (split === 2) return [-1, 1].map((sg, k) => ({ u: (sg * bh) / 2, v: 0, a: bh / 2, b: bh, k }));
  if (split === 3) return [-1, 1].map((sg, k) => ({ u: 0, v: (sg * bh) / 2, a: bh, b: bh / 2, k }));
  const out = [];
  for (const su of [-1, 1]) for (const sv of [-1, 1]) out.push({ u: (su * bh) / 2, v: (sv * bh) / 2, a: bh / 2, b: bh / 2, k: out.length });
  return out;
}

/** Run each item's draw with a context that swallows paint, so only the shadow geometry is collected. */
function prepassShadows(p, items) {
  const real = p.g;
  p.g = NULL_CTX;
  for (const it of items) it.draw();
  p.g = real;
}
const NULL_CTX = new Proxy(
  {},
  {
    get(_, key) {
      if (key === "createLinearGradient" || key === "createRadialGradient") return () => ({ addColorStop() {} });
      return () => {};
    },
    set() {
      return true;
    },
  },
);

/** A downtown block: a podium filling the block, then one tower or two (side by side along A). */
function drawCore(p, x, y, bh, h, r, tallest) {
  const podH = Math.max(p.px(2.2), p.R * 0.028);
  const F = foot(x, y, bh * 0.95, bh * 0.95);
  const podC = pick(P.stone, r(230));
  p.shadow(F, podH);
  p.box(F, 0, podH, podC);
  if (p.detail >= 1) {
    // shop fronts: a dark band along the two visible faces
    const [, E, S, W] = F;
    const bandH = podH * 0.45;
    fillPoly(p.g, [W, S, up(S, bandH), up(W, bandH)], "rgba(40,48,60,.45)");
    fillPoly(p.g, [S, E, up(E, bandH), up(S, bandH)], "rgba(20,24,32,.45)");
  }
  const twin = bh * p.s >= 7 && r(231) < 0.35 && !tallest;
  if (twin) {
    for (const [sg, k] of [[-1, 0], [1, 1]]) {
      const [ox, oy] = iso(sg * bh * 0.46, 0);
      drawTower(p, x + ox, y + oy, bh * 0.4, bh * 0.66, h * (k ? 0.72 : 1), (salt) => r(salt + k * 50), false, podH);
    }
  } else {
    const a = bh * (0.6 + r(22) * 0.2), b = bh * (0.6 + r(23) * 0.2);
    drawTower(p, x, y, a, b, h, r, tallest, podH);
  }
}

function drawTower(p, x, y, a, b, h, r, tallest, z0 = 0) {
  const glass = r(201) < 0.65;
  const base = glass ? pick(P.glass, r(202)) : pick(P.stone, r(203));
  const F = foot(x, y, a, b);
  p.shadow(F, z0 + h);
  const setback = h > p.R * 0.3 && r(204) < 0.45;
  const h1 = setback ? h * (0.55 + r(205) * 0.15) : h;
  p.box(F, z0, h1, base, { glass });
  p.windows(F, z0, h1, glass);
  let top = { F, z: z0 + h1, a, b };
  if (setback) {
    const F2 = foot(x, y, a * 0.68, b * 0.68);
    p.box(F2, z0 + h1, h - h1, shade(base, 0.04), { glass });
    p.windows(F2, z0 + h1, h - h1, glass);
    top = { F: F2, z: z0 + h, a: a * 0.68, b: b * 0.68 };
  }
  const g = p.g;
  // roof: parapet inset, a crown band in the state colour on some, a rooftop box or a spire on the tallest
  const [, E, S, W] = top.F.map((q) => up(q, top.z));
  const ins = foot(x, y - top.z, top.a * 0.72, top.b * 0.72);
  if (p.detail >= 1) fillPoly(g, ins, css(shade(base, -0.05)));
  if (r(206) < 0.4 || tallest) {
    const band = Math.max(p.px(1), h * 0.035);
    fillPoly(g, [W, S, up(S, -band), up(W, -band)], css(p.accent));
    fillPoly(g, [S, E, up(E, -band), up(S, -band)], css(shade(p.accent, -0.3)));
  }
  if (tallest && h > p.R * 0.3) {
    const sh = h * 0.22;
    g.beginPath();
    g.moveTo(x, y - top.z);
    g.lineTo(x, y - top.z - sh);
    g.strokeStyle = "rgba(235,235,230,.95)";
    g.lineWidth = Math.max(p.px(0.9), top.a * 0.12);
    g.stroke();
    g.beginPath();
    g.arc(x, y - top.z - sh, Math.max(p.px(0.9), top.a * 0.1), 0, Math.PI * 2);
    g.fillStyle = "#ffe08a";
    g.fill();
  } else if (p.detail >= 1 && r(207) < 0.6) {
    const Fb = foot(x + (r(208) - 0.5) * top.a * 0.6, y - top.z + (r(209) - 0.5) * top.b * 0.3, top.a * 0.28, top.b * 0.28);
    p.box(Fb, 0, Math.max(p.px(1.2), h * 0.04), [150, 148, 140], { outline: false });
  }
}

function drawBlock(p, x, y, a, b, h, r, k) {
  const base = pick(P.stone, r(220 + k));
  const F = foot(x, y, a, b);
  p.shadow(F, h);
  p.box(F, 0, h, base);
  p.windows(F, 0, h, false);
  if (p.detail >= 1) {
    // parapet + a green roof on some, a roof hatch at close
    const ins = foot(x, y - h, a * 0.8, b * 0.8);
    fillPoly(p.g, ins, r(224 + k) < 0.2 ? css(mix(P.park, P.concrete, 0.3)) : css(shade(base, 0.08)));
    if (p.detail >= 2 && r(228 + k) < 0.5) p.box(foot(x - a * 0.2, y - h - b * 0.05, a * 0.22, b * 0.22), 0, p.px(1.4), [150, 146, 138], { outline: false });
  }
}

function drawPlaza(p, x, y, bh, accent) {
  const g = p.g;
  fillPoly(g, foot(x, y, bh * 0.72, bh * 0.72), css(P.plaza));
  const r = Math.max(bh * 0.24, p.px(1.4));
  g.beginPath();
  g.ellipse(x, y, r, r * 0.55, 0, 0, Math.PI * 2);
  g.fillStyle = p.detail >= 1 ? "#6fb0d8" : css(accent);
  g.fill();
  g.strokeStyle = "rgba(255,255,255,.7)";
  g.lineWidth = p.px(0.6);
  g.stroke();
  if (p.detail >= 2) {
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x, y - r * 1.2);
    g.strokeStyle = "rgba(235,248,255,.85)";
    g.lineWidth = p.px(0.8);
    g.stroke();
  }
}

// --- suburban fringe art (for terrain.js urban cells) --------------------------------------------------------------
// Drawn in R units (1 = hex radius) around the cell centre; upx = device px per unit; v = variant; kind "small" is the
// compact version used on hills. The plan (roads, houses, trees, amenity) is shared by the ground and build sprites.

const SUB_ROOFS = [[164, 71, 58], [107, 111, 122], [138, 90, 60], [79, 93, 110], [179, 107, 69], [91, 74, 68], [128, 64, 54]];
const SUB_WALLS = [[239, 230, 210], [226, 215, 189], [216, 223, 224], [240, 220, 192], [230, 225, 214]];
const suburbPlans = new Map();

function segDist(x, y, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy || 1e-9;
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2));
  return Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t);
}

function suburbPlan(v, small) {
  const key = `${v}|${small ? 1 : 0}`;
  let plan = suburbPlans.get(key);
  if (plan) return plan;
  const r = rng(v * 7349 + (small ? 5 : 11));
  const lim = small ? 0.5 : 0.82;
  const inHex = (x, y, m = 0) => hexRho(x, y, 1) <= lim - m;
  const roads = [], bulbs = [];
  // A gently winding collector road across the cell.
  const ang = (r() - 0.5) * 1.0;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const off = (r() - 0.5) * 0.24, wa = 0.04 + r() * 0.05, wp = r() * 6.28;
  const span = small ? 0.62 : 1.15;
  const along = (t) => {
    const nrm = off + wa * Math.sin(t * 2.4 + wp);
    return [t * ca - nrm * sa, t * sa + nrm * ca];
  };
  const collector = [];
  for (let k = 0; k <= 24; k++) collector.push(along(-span + (2 * span * k) / 24));
  roads.push(collector);
  // Cul-de-sacs and loops branching off it, alternating sides.
  const nb = small ? 1 : 2 + (r() < 0.55 ? 1 : 0);
  let sideSign = r() < 0.5 ? -1 : 1;
  for (let b = 0; b < nb; b++) {
    const t = small ? (r() - 0.5) * 0.3 : -0.5 + (1.0 * (b + 0.5)) / nb + (r() - 0.5) * 0.12;
    const base = along(t);
    sideSign = -sideSign;
    const dir = ang + sideSign * (Math.PI / 2) + (r() - 0.5) * 0.5;
    const dx = Math.cos(dir), dy = Math.sin(dir);
    const len = small ? 0.16 : 0.2 + r() * 0.12;
    const loopC = [base[0] + dx * (len + 0.13), base[1] + dy * (len + 0.13)];
    if (!small && r() < 0.45 && inHex(loopC[0], loopC[1], 0.14)) {
      const loop = [];
      const lx = 0.16, ly = 0.1;
      for (let k = 0; k <= 20; k++) {
        const a = (k / 20) * Math.PI * 2;
        const ex = Math.cos(a) * lx, ey = Math.sin(a) * ly;
        loop.push([loopC[0] + ex * dx - ey * dy, loopC[1] + ex * dy + ey * dx]);
      }
      roads.push(loop);
      roads.push([base, [base[0] + dx * (len + 0.13 - lx), base[1] + dy * (len + 0.13 - lx)]]);
    } else {
      const bend = (r() - 0.5) * 0.08;
      const mid = [base[0] + dx * len * 0.5 - dy * bend, base[1] + dy * len * 0.5 + dx * bend];
      const end = [base[0] + dx * len, base[1] + dy * len];
      roads.push([base, mid, end]);
      bulbs.push([end[0], end[1], 0.05]);
    }
  }
  const roadDist = (x, y) => {
    let d = Infinity;
    for (const R2 of roads) for (let k = 1; k < R2.length; k++) d = Math.min(d, segDist(x, y, R2[k - 1], R2[k]));
    for (const [bx, by, br] of bulbs) d = Math.min(d, Math.hypot(x - bx, y - by) - br);
    return d;
  };
  // An amenity by the collector: a strip mall with its parking lot, or a school with its playing field.
  let amenity = null;
  if (!small) {
    for (const t of [0.45, -0.45, 0.15, -0.15]) {
      for (const sg of [1, -1]) {
        const [cx0, cy0] = along(t);
        const x = cx0 - sa * sg * 0.17, y = cy0 + ca * sg * 0.17;
        if (amenity || !inHex(x, y, 0.16)) continue;
        let clear = Infinity;
        for (let k = 1; k < roads.length; k++) for (let q = 1; q < roads[k].length; q++) clear = Math.min(clear, segDist(x, y, roads[k][q - 1], roads[k][q]));
        for (const [bx, by, br] of bulbs) clear = Math.min(clear, Math.hypot(x - bx, y - by) - br);
        if (clear < 0.17) continue;
        amenity = { x, y, kind: r() < 0.5 ? "school" : "mall", a: 0.11, b: 0.065 };
      }
    }
  }
  const inAmenity = (x, y, m) => amenity && Math.abs(x - amenity.x) < 0.17 + m && Math.abs(y - amenity.y) < 0.12 + m;
  // Houses: both sides of every road, then around the bulbs; nothing too close to a road or another house.
  const roofs = [pick(SUB_ROOFS, r()), pick(SUB_ROOFS, r()), pick(SUB_ROOFS, r())];
  const houses = [];
  const hs = small ? 0.048 : 0.052;
  const tryHouse = (x, y, ridge) => {
    if (!inHex(x, y, 0.04) || roadDist(x, y) < 0.062 || inAmenity(x, y, 0.03)) return;
    for (const h of houses) if (Math.hypot(h.x - x, h.y - y) < 0.098) return;
    houses.push({ x, y, s: hs * (0.9 + r() * 0.2), ridge, wall: pick(SUB_WALLS, r()), roof: roofs[Math.floor(r() * 3)] });
  };
  for (const R2 of roads) {
    let carry = 0.05;
    for (let k = 1; k < R2.length; k++) {
      const [ax, ay] = R2[k - 1], [bx, by] = R2[k];
      const sl = Math.hypot(bx - ax, by - ay);
      if (!sl) continue;
      const tx = (bx - ax) / sl, ty = (by - ay) / sl;
      const ridge = Math.abs(tx * 0.866 + ty * 0.5) >= Math.abs(-tx * 0.866 + ty * 0.5) ? 0 : 1;
      let d = carry;
      for (; d < sl; d += 0.106) {
        const x = ax + tx * d, y = ay + ty * d;
        tryHouse(x - ty * 0.088, y + tx * 0.088, ridge);
        tryHouse(x + ty * 0.088, y - tx * 0.088, ridge);
      }
      carry = d - sl;
    }
  }
  for (const [bx, by, br] of bulbs) {
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + r() * 0.4;
      tryHouse(bx + Math.cos(a) * (br + 0.08), by + Math.sin(a) * (br + 0.08), k % 2);
    }
  }
  // Tree clumps in the gaps, plus a few yard trees.
  const trees = [];
  const tryTree = (x, y) => {
    if (!inHex(x, y, 0.02) || roadDist(x, y) < 0.045 || inAmenity(x, y, 0)) return;
    for (const h of houses) if (Math.hypot(h.x - x, h.y - y) < 0.07) return;
    for (const t of trees) if (Math.hypot(t.x - x, t.y - y) < 0.045) return;
    trees.push({ x, y, h: 0.06 + r() * 0.025, conifer: r() < 0.22 });
  };
  const nc = small ? 2 : 4 + Math.floor(r() * 3);
  for (let c = 0; c < nc; c++) {
    let cx = 0, cy = 0;
    for (let tries = 0; tries < 14; tries++) {
      cx = (r() - 0.5) * 1.5 * lim;
      cy = (r() - 0.5) * 1.6 * lim;
      if (inHex(cx, cy, 0.06) && roadDist(cx, cy) > 0.09) break;
    }
    const n = 3 + Math.floor(r() * 4);
    for (let k = 0; k < n; k++) tryTree(cx + (r() - 0.5) * 0.2, cy + (r() - 0.5) * 0.15);
  }
  for (const h of houses) if (r() < 0.3) tryTree(h.x + (r() - 0.5) * 0.06, h.y - 0.075);
  // Lawn tone varies by variant.
  const lawn = shade(mix([116, 152, 80], [146, 156, 92], r()), (r() - 0.5) * 0.12);
  plan = { lim, roads, bulbs, houses, trees, amenity, lawn };
  suburbPlans.set(key, plan);
  return plan;
}

function paintSuburbGround(g, upx, v, kind) {
  const plan = suburbPlan(v, kind === "small");
  const px = 1 / upx;
  const small = kind === "small";
  g.save();
  hexPath(g, 0, 0, 1, small ? 0.92 : 1.01);
  g.clip();
  // Lawn over the cell (edge to edge, so neighbouring suburbs merge instead of showing a hex mosaic) with a
  // feathered edge, then soft tone variation.
  g.save();
  g.shadowColor = css(plan.lawn, 0.85);
  g.shadowBlur = Math.max(1, 0.07 * upx);
  hexPath(g, 0, 0, 1, small ? plan.lim + 0.05 : 0.97);
  g.fillStyle = css(plan.lawn, 0.9);
  g.fill();
  g.restore();
  const rr = rng(v * 131 + 7);
  for (let k = 0; k < 5; k++) {
    const mx = (rr() - 0.5) * 1.3 * plan.lim, my = (rr() - 0.5) * 1.3 * plan.lim, mr = 0.18 + rr() * 0.2;
    const mg = g.createRadialGradient(mx, my, 0, mx, my, mr);
    const c = k % 2 ? "40,64,22" : "232,238,190";
    mg.addColorStop(0, `rgba(${c},.13)`);
    mg.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = mg;
    g.fillRect(mx - mr, my - mr, 2 * mr, 2 * mr);
  }
  // Amenity ground: a parking lot with stalls, or a playing field with a track.
  const am = plan.amenity;
  if (am) {
    if (am.kind === "mall") {
      const F = foot(am.x, am.y + 0.035, am.a + 0.05, am.b + 0.06);
      fillPoly(g, F, "rgba(118,116,110,.92)");
      if (upx > 50) {
        g.beginPath();
        const [N, E, S, W] = F;
        for (let q = 1; q < 8; q++) {
          const t = q / 8;
          g.moveTo(W[0] + (S[0] - W[0]) * t, W[1] + (S[1] - W[1]) * t);
          g.lineTo(W[0] + (S[0] - W[0]) * t + (N[0] - W[0]) * 0.35, W[1] + (S[1] - W[1]) * t + (N[1] - W[1]) * 0.35);
        }
        g.strokeStyle = "rgba(235,232,220,.55)";
        g.lineWidth = px;
        g.stroke();
      }
    } else {
      const [ox, oy] = iso(0, am.b + 0.09);
      const F = foot(am.x + ox, am.y + oy, am.a + 0.02, 0.075);
      fillPoly(g, F, "rgba(132,178,88,.95)");
      const cx = am.x + ox, cy = am.y + oy;
      g.beginPath();
      g.ellipse(cx, cy, 0.09, 0.045, 0, 0, Math.PI * 2);
      g.strokeStyle = "rgba(196,110,84,.8)";
      g.lineWidth = Math.max(px * 1.2, 0.012);
      g.stroke();
      fillPoly(g, foot(am.x, am.y, am.a + 0.03, am.b + 0.03), "rgba(150,146,136,.85)");
    }
  }
  suburbRoads(g, plan, px);
  g.restore();
}

/** The plan's roads: a dark casing, then the light surface; cul-de-sac bulbs as discs. */
function suburbRoads(g, plan, px) {
  g.lineCap = "round";
  g.lineJoin = "round";
  const roadP = new Path2D();
  for (const R2 of plan.roads) {
    roadP.moveTo(R2[0][0], R2[0][1]);
    for (let k = 1; k < R2.length; k++) roadP.lineTo(R2[k][0], R2[k][1]);
  }
  const bulbP = new Path2D();
  for (const [bx, by, br] of plan.bulbs) {
    bulbP.moveTo(bx + br, by);
    bulbP.arc(bx, by, br, 0, Math.PI * 2);
  }
  const casing = Math.max(0.05, px * 2.4), surface = Math.max(0.034, px * 1.4);
  g.strokeStyle = "rgba(70,66,58,.55)";
  g.lineWidth = casing;
  g.stroke(roadP);
  g.save();
  g.lineWidth = casing - surface;
  g.strokeStyle = "rgba(70,66,58,.55)";
  g.stroke(bulbP);
  g.restore();
  g.strokeStyle = "#b8b4a8";
  g.lineWidth = surface;
  g.stroke(roadP);
  g.fillStyle = "#b8b4a8";
  g.fill(bulbP);
}

function paintSuburbBuild(g, upx, v, kind) {
  const plan = suburbPlan(v, kind === "small");
  const px = 1 / upx;
  if (kind === "small") {
    // the small (hill) version has no ground sprite under it: its own roads, kept to its little patch
    g.save();
    hexPath(g, 0, 0, 1, plan.lim + 0.08);
    g.clip();
    suburbRoads(g, plan, px);
    g.restore();
  }
  const items = [];
  const shadows = new Path2D();
  for (const h of plan.houses) {
    const a = h.ridge === 0 ? h.s : h.s * 0.72, b = h.ridge === 0 ? h.s * 0.72 : h.s;
    const F = foot(h.x, h.y, a, b);
    const hw = Math.max(h.s * 0.55, px * 2), hr = Math.max(h.s * 0.45, px * 1.5);
    poly(shadows, shadowOf(F, hw + hr * 0.6));
    items.push({ y: h.y, draw: () => gable(g, F, hw, hr, h.wall, h.roof, h.ridge, upx * h.s > 14 ? px * 0.8 : 0) });
  }
  for (const t of plan.trees) {
    const rad = Math.max(t.h * 0.6, px * 2);
    items.push({ y: t.y, draw: () => treeShape(g, t.x, t.y, rad, t.conifer, true) });
  }
  const am = plan.amenity;
  if (am) {
    const F = foot(am.x, am.y, am.a, am.b);
    const h = am.kind === "mall" ? 0.05 : 0.07;
    poly(shadows, shadowOf(F, h));
    items.push({
      y: am.y,
      draw: () => {
        const wall = am.kind === "mall" ? [226, 214, 188] : [178, 96, 72];
        const [N, E, S, W] = F;
        const [Nt, Et, St, Wt] = F.map((q) => up(q, h));
        fillPoly(g, [W, S, St, Wt], css(wall));
        fillPoly(g, [S, E, Et, St], css(shade(wall, -0.32)));
        fillPoly(g, [Nt, Et, St, Wt], css(am.kind === "mall" ? [196, 192, 182] : [150, 148, 140]));
        // a storefront / window band on the lit face
        const bz = h * 0.35, bh = h * 0.3;
        fillPoly(g, [up(W, bz), up(S, bz), up(S, bz + bh), up(W, bz + bh)], am.kind === "mall" ? "rgba(60,80,104,.7)" : "rgba(240,236,224,.6)");
        if (upx > 40) {
          g.beginPath();
          poly(g, [W, Wt, Nt, Et, E, S]);
          g.strokeStyle = "rgba(40,28,18,.35)";
          g.lineWidth = px * 0.8;
          g.stroke();
        }
      },
    });
  }
  g.fillStyle = "rgba(22,24,12,.24)";
  g.fill(shadows);
  items.sort((a, b) => a.y - b.y);
  for (const it of items) it.draw();
}

/** Suburban fringe sprites for terrain.js (same shape as its SPRITES entries; boxes in R units). */
export const SUBURB_ART = Object.freeze({
  ground: { box: { x0: -0.92, y0: -1.02, x1: 0.92, y1: 1.02 }, paint: paintSuburbGround },
  build: { box: { x0: -0.92, y0: -1.1, x1: 0.92, y1: 1.0 }, paint: paintSuburbBuild },
});

// --- sprite cache --------------------------------------------------------------------------------------------------
// Sprites cover x ∈ [-SX·R, SX·R] and y ∈ [-SY0·R, SY1·R] around the hex centre (towers rise above the hex).
const SX = 1.0, SY0 = 1.55, SY1 = 1.0;
const MAX_SPRITE_RPX = 220; // device px; tiles up to this size share the main sprite cache
// Bigger tiles (close zoom on a dpr-2/3 screen) get their own small cache, so panning there blits instead of
// repainting every building, without pushing the zoomed-out sprites out. Past MAX_BIG_RPX, or when the big cache
// is full of sprites used in the last BIG_KEEP_MS (a huge window), the tile is painted directly as before.
const MAX_BIG_RPX = 480;
const BUDGET_PX = 14e6; // total sprite pixels kept (~56 MB)
const BIG_BUDGET_PX = 12e6; // ~48 MB, 10-25 close-zoom tiles
const BIG_KEEP_MS = 500;
const makeCache = (budget) => ({ map: new Map(), px: 0, budget }); // map: key -> {cv, k, t}; insertion order = LRU
const spriteCache = makeCache(BUDGET_PX), bigSpriteCache = makeCache(BIG_BUDGET_PX);

const newCanvas = (wd, ht) => {
  if (typeof document !== "undefined") {
    const cv = document.createElement("canvas");
    cv.width = wd;
    cv.height = ht;
    return cv;
  }
  return new OffscreenCanvas(wd, ht);
};

/** Drop every cached city sprite (e.g. after changing the art at runtime). */
export function clearCitySprites() {
  for (const c of [spriteCache, bigSpriteCache]) {
    c.map.clear();
    c.px = 0;
  }
  suburbPlans.clear();
}

const spriteSize = (k, R) => [Math.ceil(2 * SX * R * k), Math.ceil((SY0 + SY1) * R * k)];

/** The cached sprite for key, or a newly painted one; null when the cache is too full of fresh sprites (only for a
 *  cache with keepMs: then nothing used in the last keepMs is evicted and the caller paints directly). */
function getSprite(cache, key, k, R, paint, keepMs = 0) {
  const now = keepMs ? performance.now() : 0;
  let sp = cache.map.get(key);
  if (sp) {
    cache.map.delete(key);
    cache.map.set(key, sp);
    sp.t = now;
    return sp;
  }
  const [wd, ht] = spriteSize(k, R);
  for (const [kk, old] of cache.map) {
    if (cache.px + wd * ht <= cache.budget) break;
    if (keepMs && old.t > now - keepMs) return null;
    cache.map.delete(kk);
    cache.px -= old.cv.width * old.cv.height;
  }
  if (keepMs && cache.px + wd * ht > cache.budget) return null;
  const cv = newCanvas(wd, ht);
  const g = cv.getContext("2d");
  g.setTransform(k, 0, 0, k, SX * R * k, SY0 * R * k);
  paint(g, k);
  sp = { cv, k, t: now };
  cache.map.set(key, sp);
  cache.px += wd * ht;
  return sp;
}

const bucket = (v, steps) => 2 ** (Math.ceil(Math.log2(v) * steps - 1e-9) / steps);

// --- public drawing --------------------------------------------------------------------------------------------------

export function drawCityTile(ctx, city, x, y, R, opts = {}) {
  const { Rpx = R, s = 1, stateColor = [200, 200, 200] } = opts;
  const seed = opts.seed ?? city.cell ?? 0;
  const col = stateColor;
  if (cityIsDot(city, Rpx)) {
    drawCityDot(ctx, x, y, R, { Rpx, s, stateColor: col, capital: isCapital(city), population: city.population });
    return;
  }
  const lod = opts.lod ?? lodFor(Rpx);
  const detail = lod === "close" ? 2 : lod === "near" ? 1 : 0;
  const capital = isCapital(city);
  const RpxB = bucket(Rpx, 4); // layout zoom bucket (css px)
  const m = ctx.getTransform ? ctx.getTransform() : null;
  const kDev = m && m.a > 0 ? m.a : s; // device px per km
  const kB = bucket(kDev, 6); // ≤ 12% downscale when blitted
  const flat = m && !m.b && !m.c;
  const isBig = !flat || R * kB > MAX_SPRITE_RPX;
  if (isBig && ctx.canvas && flat) {
    // Big tiles are painted directly or into the small big-sprite cache: skip one that lands wholly off the canvas
    // (the caller's margin around the viewport, and warmSprites' tiny scratch canvas, where every stamp is
    // off-canvas), so it neither costs a paint nor pushes the visible tiles out of the cache.
    const cvs = ctx.canvas;
    const ax = m.a * (x - SX * R) + m.e, bx = m.a * (x + SX * R) + m.e;
    const ay = m.d * (y - SY0 * R) + m.f, by = m.d * (y + SY1 * R) + m.f;
    if (Math.max(ax, bx) < 0 || Math.min(ax, bx) > cvs.width || Math.max(ay, by) < 0 || Math.min(ay, by) > cvs.height) return;
  }
  // Big sprites are painted at the exact device scale (no bucket, so they match a direct paint); they are only
  // reused while panning at one zoom, which is when the static layer re-renders the most.
  const kS = isBig ? kDev : kB;
  let sp = null;
  if (flat && R * kS <= MAX_BIG_RPX) {
    const key = `${seed}|${cityClass(city.population).id}|${col.join(",")}|${capital ? 1 : 0}|${RpxB.toFixed(3)}|${detail}|${kS.toFixed(4)}|${R}`;
    const paint = (g, k) => paintTile(g, city, R, RpxB, k, detail, col, seed, capital);
    sp = isBig ? getSprite(bigSpriteCache, key, kS, R, paint, BIG_KEEP_MS) : getSprite(spriteCache, key, kS, R, paint);
  }
  if (!sp) {
    ctx.save();
    ctx.translate(x, y);
    paintTile(ctx, city, R, RpxB, kDev, detail, col, seed, capital);
    ctx.restore();
    return;
  }
  // Snap the sprite's corner to a device pixel; it is drawn at its own resolution or a hair smaller.
  const x0 = x - SX * R, y0 = y - SY0 * R;
  const dx = (Math.round(m.a * x0 + m.e) - m.e) / m.a, dy = (Math.round(m.d * y0 + m.f) - m.f) / m.d;
  ctx.drawImage(sp.cv, dx, dy, sp.cv.width / sp.k, sp.cv.height / sp.k);
}

/** The marker used for a city at small zoom: a neutral cream-and-bronze disc on a dark rim (so dots never read as
 *  state-coloured confetti or as resources), ringed for big cities; a gold star for the capital. */
export function drawCityDot(ctx, x, y, R, { Rpx, s, capital = false, population = 0 }) {
  const big = population >= 1.5e6;
  const r = Math.max((big ? 2.8 : 2.1) / s, R * (Rpx < 9 ? (big ? 0.34 : 0.27) : 0.19));
  ctx.beginPath();
  ctx.arc(x + 0.6 / s, y + 0.9 / s, r * 1.1, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,.38)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  const gr = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  gr.addColorStop(0, "#fff6dc");
  gr.addColorStop(0.6, "#e6d2a2");
  gr.addColorStop(1, "#a9844a");
  ctx.fillStyle = gr;
  ctx.fill();
  ctx.strokeStyle = "rgba(28,20,10,.9)";
  ctx.lineWidth = 1 / s;
  ctx.stroke();
  if (big) {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(70,50,22,.75)";
    ctx.fill();
  }
  if (capital) drawCapitalLandmark(ctx, x, y - r * 0.05, r * 4.2, { s });
}

/** The capital marker used with dots: a small gold star (the full tile has the domed capitol instead). */
export function drawCapitalLandmark(ctx, x, y, R, { s = 1 } = {}) {
  ctx.beginPath();
  star(ctx, x, y, Math.max(R * 0.2, 3.2 / s));
  ctx.fillStyle = "#ffe08a";
  ctx.fill();
  ctx.strokeStyle = "rgba(60,40,0,.85)";
  ctx.lineWidth = 1 / s;
  ctx.stroke();
}

function star(ctx, x, y, r) {
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const rr = k % 2 ? r * 0.45 : r;
    k ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
}
