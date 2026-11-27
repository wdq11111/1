// icons.js — single-source vector icon set for canvas and DOM.
//
// Every icon is drawn in a 24x24 box as one or more SVG path strings. Filled
// paths use the even-odd rule, so a sub-path inside another one cuts a hole
// (that is how flasks get empty glass, books get spines, etc.). Overlapping
// solid parts are kept in separate path entries so they never cancel out.
//
// Glyphs are two-tone. Each path entry is one of three layers, painted in this order:
//   tone   (T / TS)  secondary parts (the person behind, smoke, a box's shaded side) at ~55% of the glyph colour
//   main   (F / S)   the glyph itself, in the glyph colour (a soft top-lit gradient on canvas)
//   detail (D)       thin "engraved" lines on top of the glyph (dark ink on light glyphs)
// Main strokes use one of two weights (2.2 primary, 1.6 secondary) so the set reads as one family.
//
//   svgIcon(id, {size, title})              -> inline <svg> string (currentColor)
//   drawIcon(ctx, id, x, y, size, opts)     -> canvas, centred at x,y (cached sprites, see below)
//   hasIcon(id)                             -> boolean
//
// All drawings are original.

// ---------------------------------------------------------------- helpers
const f = (n) => +n.toFixed(2);

/** Full circle as a path string. */
function circle(cx, cy, r) {
  return `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
}

/** Ellipse rotated by deg around its centre. */
function ellipse(cx, cy, rx, ry, deg = 0) {
  const a = (deg * Math.PI) / 180;
  const dx = Math.cos(a) * rx, dy = Math.sin(a) * rx;
  const x1 = cx - dx, y1 = cy - dy, x2 = cx + dx, y2 = cy + dy;
  return `M${f(x1)} ${f(y1)}A${f(rx)} ${f(ry)} ${f(deg)} 1 0 ${f(x2)} ${f(y2)}A${f(rx)} ${f(ry)} ${f(deg)} 1 0 ${f(x1)} ${f(y1)}Z`;
}

/** Polygon from [x,y] pairs. */
function poly(pts) {
  return 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';
}

/** Rotate a list of points around (cx,cy). */
function rot(pts, cx, cy, deg) {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return pts.map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]);
}

/** Rounded rectangle. */
function rrect(x, y, w, h, r) {
  return `M${f(x + r)} ${f(y)}H${f(x + w - r)}a${r} ${r} 0 0 1 ${r} ${r}V${f(y + h - r)}a${r} ${r} 0 0 1 ${-r} ${r}H${f(x + r)}a${r} ${r} 0 0 1 ${-r} ${-r}V${f(y + r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`;
}

function gear(cx, cy, teeth, rOut, rIn, hole) {
  const pts = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2;
    const t = step * 0.22; // half tooth width (angle)
    const v = step * 0.30; // half valley shoulder
    pts.push([cx + Math.cos(a - v) * rIn, cy + Math.sin(a - v) * rIn]);
    pts.push([cx + Math.cos(a - t) * rOut, cy + Math.sin(a - t) * rOut]);
    pts.push([cx + Math.cos(a + t) * rOut, cy + Math.sin(a + t) * rOut]);
    pts.push([cx + Math.cos(a + v) * rIn, cy + Math.sin(a + v) * rIn]);
  }
  return poly(pts) + circle(cx, cy, hole);
}

/** Star polygon with n points, outer radius r, inner radius r·inner (first point straight up). */
function star(cx, cy, r, inner = 0.45, n = 5) {
  const pts = [];
  for (let k = 0; k < n * 2; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / n, rr = k % 2 ? r * inner : r;
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  return poly(pts);
}

const S = (d, width = 2.2) => ({ d, stroke: 'currentColor', width });
const F = (d) => ({ d });
/** Secondary-tone fill / stroke (drawn behind the main glyph, lighter). */
const T = (d) => ({ d, tone: true });
const TS = (d, width = 2.2) => ({ d, stroke: 'currentColor', width, tone: true });
/** Engraved detail line, drawn over the glyph. */
const D = (d, width = 1.1) => ({ d, detail: true, width });

// Shared shapes ---------------------------------------------------------
const BOLT = (ox = 0, oy = 0, k = 1) =>
  poly([[13.2, 7.5], [8.6, 14], [11.6, 14], [10.6, 19], [15.4, 12.2], [12.4, 12.2], [13.2, 7.5]]
    .map(([x, y]) => [ox + 12 + (x - 12) * k, oy + 13 + (y - 13) * k]));

const DROP = 'M12 2.2C12 2.2 4.8 10.4 4.8 15.2a7.2 7.2 0 0 0 14.4 0C19.2 10.4 12 2.2 12 2.2Z';
const FLAME = 'M12.6 1.8c.4 3.6 5.9 6.2 5.9 12.4a6.5 6.5 0 0 1-13 0c0-3.2 1.8-5.4 3.1-6.6-.1 2.2.8 3.6 2 4-.6-3.6.3-7.1 2-9.8Z';

const PERSON_A = [
  F(circle(8.6, 7.2, 3.3)),
  F('M2.4 20.5v-1.2a6.2 6.2 0 0 1 12.4 0v1.2Z'),
];
const PERSON_B = [
  F(circle(17.2, 8.4, 2.7)),
  F('M16.1 20.5v-1.6c0-1.9-.6-3.7-1.7-5a5.2 5.2 0 0 1 7.2 4.8v1.8Z'),
];

const HOUSE = 'M12 2.6L22.4 11.6H19.4V21.4H14.4V15.4H9.6V21.4H4.6V11.6H1.6Z';

// ---------------------------------------------------------------- icons
const RAW = {
  // ---- yields
  'y-food': {
    bg: '#4f7a22',
    paths: [
      T('M12 21.6C8.7 21.1 6.6 18.8 6 15.9c2.8.6 5 2.5 6 5.7Z'),
      T('M12 21.6c3.3-.5 5.4-2.8 6-5.7-2.8.6-5 2.5-6 5.7Z'),
      S('M12 22V7.5', 1.6),
      F(ellipse(12, 4.6, 1.6, 2.8)),
      F(ellipse(9.9, 8.8, 2.9, 1.5, 55)),
      F(ellipse(14.1, 8.8, 2.9, 1.5, 125)),
      F(ellipse(9.9, 12.8, 2.9, 1.5, 55)),
      F(ellipse(14.1, 12.8, 2.9, 1.5, 125)),
      F(ellipse(9.9, 16.8, 2.9, 1.5, 55)),
      F(ellipse(14.1, 16.8, 2.9, 1.5, 125)),
    ],
  },
  'y-production': {
    bg: '#7a4a24',
    paths: [F(gear(12, 12, 8, 10.4, 7.6, 3.2)), D(circle(12, 12, 5.5), 1.2)],
  },
  'y-gold': {
    bg: '#9a7414',
    paths: [
      F(ellipse(12, 5, 8, 2.6) + ellipse(12, 5, 4.2, 1.1)),
      F('M4 6.8A8 2.6 0 0 0 20 6.8V9.6A8 2.6 0 0 1 4 9.6Z'),
      F('M4 11.4A8 2.6 0 0 0 20 11.4V14.2A8 2.6 0 0 1 4 14.2Z'),
      F('M4 16A8 2.6 0 0 0 20 16V18.8A8 2.6 0 0 1 4 18.8Z'),
      D(ellipse(12, 5, 6.2, 1.85), 0.9),
      D('M7 8.9v1.4M12 9.5v1.4M17 8.9v1.4M7 13.5v1.4M12 14.1v1.4M17 13.5v1.4', 0.9),
    ],
  },
  'y-science': {
    bg: '#245d92',
    paths: [
      F('M8.6 1.8h6.8v2.2h-1.2v5.2l6.1 10.3a2 2 0 0 1-1.7 3H5.4a2 2 0 0 1-1.7-3L9.8 9.2V4H8.6Z' +
        'M11.9 4h.2v5.8l2.9 4.9H9l2.9-4.9Z'),
      T(circle(11.2, 13, 0.85) + circle(12.5, 11.5, 0.55)),
      D('M6.4 18.6h11.2', 1),
    ],
  },
  'y-culture': {
    bg: '#6a3488',
    paths: [
      F('M3.6 3.6C9 1.8 15 1.8 20.4 3.6c.5 9.4-2.6 16.6-8.4 18.6C6.2 20.2 3.1 13 3.6 3.6Z' +
        ellipse(8.4, 9.2, 2.2, 1.3, 15) + ellipse(15.6, 9.2, 2.2, 1.3, -15) +
        'M7.4 13.8Q12 19.6 16.6 13.8Q12 16.2 7.4 13.8Z'),
      D('M6.2 6.6q2-1.1 4-.1M17.8 6.6q-2-1.1-4-.1', 1.1),
    ],
  },

  // ---- UI
  pop: { bg: '#2f4a6b', paths: [...PERSON_B.map((p) => T(p.d)), ...PERSON_A] },
  unemployment: {
    bg: '#6b3a2f',
    paths: [
      TS('M8.8 7.4V5.6a1.4 1.4 0 0 1 1.4-1.4h3.6a1.4 1.4 0 0 1 1.4 1.4v1.8', 2.2),
      D('M3.4 11.8h6M14.6 11.8h6', 1),
      F(rrect(2.4, 7.4, 19.2, 13.6, 2) + poly([[10.8, 9.6], [13.2, 9.6], [13.2, 13.6], [16, 13.6], [12, 18.6], [8, 13.6], [10.8, 13.6]])),
    ],
  },
  pedia: {
    bg: '#5a3d22',
    paths: [
      F('M1.8 5.2c3.2-1.6 6.6-1.6 9.4.6V21c-2.8-1.8-6.2-1.9-9.4-.6Z'),
      F('M22.2 5.2c-3.2-1.6-6.6-1.6-9.4.6V21c2.8-1.8 6.2-1.9 9.4-.6Z'),
      D('M3.8 8.4c1.8-.6 3.6-.5 5.4.4M3.8 11.6c1.8-.6 3.6-.5 5.4.4M3.8 14.8c1.8-.6 3.6-.5 5.4.4' +
        'M20.2 8.4c-1.8-.6-3.6-.5-5.4.4M20.2 11.6c-1.8-.6-3.6-.5-5.4.4M20.2 14.8c-1.8-.6-3.6-.5-5.4.4', 1),
    ],
  },
  search: { paths: [T(circle(10, 10, 5)), S(circle(10, 10, 6.2), 2.6), S('M14.8 14.8L20.8 20.8', 3.4)] },
  share: {
    paths: [
      TS('M17.6 5.4L6.4 12L17.6 18.6', 2.2),
      F(circle(18, 5, 3)), F(circle(6, 12, 3)), F(circle(18, 19, 3)),
    ],
  },
  help: {
    paths: [
      S('M8.4 8.6a3.7 3.7 0 1 1 5.4 3.3c-1.1.6-1.8 1.4-1.8 2.6v1', 2.8),
      F(circle(12, 19.6, 1.8)),
    ],
  },
  close: { paths: [S('M5.5 5.5L18.5 18.5M18.5 5.5L5.5 18.5', 3.2)] },
  resources: {
    bg: '#2c5f6b',
    paths: [
      T('M8.2 10.6h7.6L12 17.2Z'),
      F('M7 3h10l5 6-10 12.4L2 9Z' + 'M3.7 8.3h16.6v1.2H3.7Z' + 'M8.2 10.6h7.6L12 17.2Z'),
      D('M9.4 3.4L8 8.2M14.6 3.4L16 8.2M12 3.4V8.2', 0.9),
    ],
  },
  terrain: {
    bg: '#4e6a2e',
    paths: [
      F('M2 6l6-2.2 8 2.2 6-2.2v14.4l-6 2.2-8-2.2-6 2.2Z' +
        'M7.4 4.2h1.2V18h-1.2Z' + 'M15.4 6.2h1.2V20h-1.2Z'),
      D('M3.6 15.4l2.6-2.4 2.6 1.6 3.4-4.2 2.6 1.4 3.6-3.6', 1.1),
    ],
  },
  layers: {
    paths: [
      F('M12 2.6L22 7.8 12 13 2 7.8Z'),
      S('M2.6 12.2L12 17.1L21.4 12.2', 2.2),
      TS('M2.6 16.4L12 21.3L21.4 16.4', 2.2),
    ],
  },

  // ---- lens groups
  'g-people': {
    bg: '#2f4a6b',
    paths: [
      T(circle(5.4, 9.6, 2.3)), T('M1.2 20.5v-1.4a4.2 4.2 0 0 1 6.4-3.6 7 7 0 0 0-1.4 5Z'),
      T(circle(18.6, 9.6, 2.3)), T('M22.8 20.5v-1.4a4.2 4.2 0 0 0-6.4-3.6 7 7 0 0 1 1.4 5Z'),
      F(circle(12, 7.2, 3.3)), F('M5.8 20.5v-1.2a6.2 6.2 0 0 1 12.4 0v1.2Z'),
    ],
  },
  'g-prosperity': {
    bg: '#7a5a14',
    paths: [
      T('M3 15h3.6v6H3Z' + 'M8.8 12h3.6v9H8.8Z' + 'M14.6 9h3.6v12h-3.6Z'),
      S('M3 10.6L9 5.6L12.6 8L19.6 2.8', 2.2),
      F(poly([[21.6, 1.4], [21.2, 6.6], [16.6, 3.2]])),
    ],
  },
  'g-knowledge': {
    bg: '#245d92',
    paths: [
      F('M12 1.8a7 7 0 0 0-4.2 12.6v2.4h8.4v-2.4A7 7 0 0 0 12 1.8Z' + 'M11.1 15.6V11h-1.6V9.6h5V11h-1.6v4.6Z'),
      T(rrect(8.2, 18, 7.6, 1.8, 0.6)), T(rrect(9.4, 20.6, 5.2, 1.8, 0.6)),
      D('M9.6 4.6a4.4 4.4 0 0 0-1.6 2.6', 1),
    ],
  },
  'g-life': {
    bg: '#2e6b5a',
    paths: [
      T(circle(12, 12, 7.9)),
      F(circle(12, 12, 10) + circle(12, 12, 7.8)),
      S('M12 6.6V12L15.8 14.4', 2.2),
      F(circle(12, 12, 1.4)),
    ],
  },
  'g-land': {
    bg: '#4e6a2e',
    paths: [
      T(circle(17.6, 4.8, 2.4)),
      F('M1.4 20.6L8.8 7.6L13.2 14.4L16.2 10.2L22.6 20.6Z'),
      D('M6.4 11.8l1.6 1.2 1.4-1.3 1.6 1.4M14.6 12.6l1.6 1.2 1.4-.9', 1),
    ],
  },

  // ---- lenses
  'l-income': {
    bg: '#2f6b3a',
    paths: [
      S('M16.4 7.4c-.8-1.5-2.4-2.2-4.4-2.2-2.5 0-4.3 1.3-4.3 3.2s1.8 2.7 4.3 3.3 4.3 1.5 4.3 3.5-1.9 3.2-4.3 3.2c-2.1 0-3.7-.8-4.6-2.4', 2.4),
      S('M12 2.4v19.2', 2.4),
    ],
  },
  'l-home': {
    bg: '#6b4a2f',
    paths: [T('M15.8 3.4h2.8v6.2l-2.8-2.4Z'), F(HOUSE + 'M10.9 8.4h2.2v2.2h-2.2Z'), D('M6.2 13.2h3.4M14.4 13.2h3.4', 1)],
  },
  'l-poverty': {
    // an empty drawstring purse with a falling arrow cut through it
    bg: '#6b2f3a',
    paths: [
      T('M8.2 4.4L6.4 1.6 9.6 2.8 12 1.4 14.4 2.8 17.6 1.6 15.8 4.4Z'),
      F(rrect(7.8, 4.2, 8.4, 2.6, 1.1)),
      F('M8.6 7.4C5.2 10 3.4 13.4 3.4 16.4c0 3.6 3.4 5.6 8.6 5.6s8.6-2 8.6-5.6c0-3-1.8-6.4-5.2-9Z' +
        poly([[10.5, 9.8], [13.5, 9.8], [13.5, 14.2], [16, 14.2], [12, 19], [8, 14.2], [10.5, 14.2]])),
      D('M9.4 5.5h5.2', 0.9),
    ],
  },
  'l-age': {
    bg: '#5a4a2a',
    paths: [
      F('M5.4 1.8h13.2v2.4h-1.4V7c0 2.2-2 3.8-3.6 5 1.6 1.2 3.6 2.8 3.6 5v2.8h1.4v2.4H5.4v-2.4h1.4V17c0-2.2 2-3.8 3.6-5C8.8 10.8 6.8 9.2 6.8 7V4.2H5.4Z' +
        'M9 4.2h6V7c0 1.1-1.5 2.5-3 3.6C10.5 9.5 9 8.1 9 7Z'),
      T('M9.9 7h4.2c-.5.9-1.2 1.6-2.1 2.4-.9-.8-1.6-1.5-2.1-2.4Z'),
    ],
  },
  'l-foreign-born': {
    bg: '#245d7a',
    paths: [
      T(circle(12, 12, 8.4)),
      S(circle(12, 12, 9.4), 2.2),
      S(ellipse(12, 12, 4.2, 9.4), 1.6),
      S('M2.8 12h18.4M4.4 7h15.2M4.4 17h15.2', 1.6),
    ],
  },
  'l-degrees': {
    bg: '#2a3f7a',
    paths: [
      F('M12 3.4L23.2 8.6 12 13.8 0.8 8.6Z'),
      F('M5.6 11.4v4.8c0 1.6 3 3.4 6.4 3.4s6.4-1.8 6.4-3.4v-4.8L12 14.4Z'),
      TS('M21 9.6v6.6', 1.6),
      T(circle(21, 17.2, 1.4)),
      D('M5.6 12.6c2.4 1.4 4.4 2 6.4 2s4-.6 6.4-2', 1),
    ],
  },
  'l-broadband': {
    bg: '#2a5a7a',
    paths: [
      TS('M2.2 9.2a14 14 0 0 1 19.6 0', 2.4),
      S('M5.6 12.8a9.2 9.2 0 0 1 12.8 0', 2.4),
      S('M9 16.3a4.4 4.4 0 0 1 6 0', 2.4),
      F(circle(12, 19.8, 1.9)),
    ],
  },
  'l-commute': {
    bg: '#5a3a6b',
    paths: [
      F('M1.8 17.4v-4.6c0-.9.6-1.6 1.5-1.8l2.8-.6 2.6-4.2h7l3.2 4.2 2.2.4c.8.2 1.2.9 1.2 1.7v4.9h-2.3a2.9 2.9 0 0 0-5.8 0H9.8a2.9 2.9 0 0 0-5.8 0Z' +
        'M9.2 7.8h2.3v2.8H7.6Z' + 'M13 7.8h1.9l2 2.8H13Z'),
      F(circle(6.9, 17.6, 2.2)), F(circle(17.1, 17.6, 2.2)),
      D(circle(6.9, 17.6, 0.8) + circle(17.1, 17.6, 0.8), 0.9),
      D('M11.8 12.6h1.6', 1),
    ],
  },
  'l-homeownership': {
    bg: '#7a5a14',
    paths: [
      T(circle(6.6, 12, 2)),
      F(circle(6.6, 12, 5) + circle(6.6, 12, 2)),
      F('M11.2 10.7H22.6V16.6H20.2V13.3H18.8V15.4H16.4V13.3H11.2Z'),
    ],
  },
  'l-uninsured': {
    bg: '#7a2f2f',
    paths: [
      F('M12 1.6L20.4 4.8v6.4c0 5.2-3.6 9.2-8.4 11.2-4.8-2-8.4-6-8.4-11.2V4.8Z' +
        'M10.6 6.6h2.8v3.8h3.8v2.8h-3.8V17h-2.8v-3.8H6.8v-2.8h3.8Z'),
      T('M10.6 6.6h2.8v3.8h3.8v2.8h-3.8V17h-2.8v-3.8H6.8v-2.8h3.8Z'),
    ],
  },
  'l-forest': {
    bg: '#2e5a2a',
    paths: [
      F('M12 1.4L17.4 7.8H14.8L19.6 13.6H16.4L21 19.2H13.3V22.6H10.7V19.2H3L7.6 13.6H4.4L9.2 7.8H6.6Z'),
      D('M9.8 7.8L12 5.6M8 13.6L11 11.2M6.2 19.2L10 16.4', 1),
    ],
  },
  'l-farmland': {
    bg: '#7a3a24',
    paths: [
      F('M2.4 10.4L7 4.4h10l4.6 6V21.4H2.4Z' + 'M8.8 13.4h6.4v8H8.8Z' + 'M10.4 7.4h3.2v3h-3.2Z'),
      TS('M9.4 14l5.2 6.8M14.6 14l-5.2 6.8', 1.6),
    ],
  },
  'l-developed': {
    bg: '#3f4a5a',
    paths: [
      F('M1.6 21.6V11.4H6V6.2h5.2V3.4h3.4v5.2h2.6V2h5.2v19.6Z' +
        'M3.4 13.4h1.4v1.6H3.4Z' + 'M3.4 16.8h1.4v1.6H3.4Z' +
        'M7.8 8.4h1.4V10H7.8Z' + 'M7.8 11.8h1.4v1.6H7.8Z' + 'M7.8 15.2h1.4v1.6H7.8Z' +
        'M12.2 10.6h1.4v1.6h-1.4Z' + 'M12.2 14h1.4v1.6h-1.4Z' +
        'M18.8 4.4h1.4V6h-1.4Z' + 'M18.8 7.8h1.4v1.6h-1.4Z' + 'M18.8 11.2h1.4v1.6h-1.4Z' + 'M18.8 14.6h1.4v1.6h-1.4Z'),
    ],
  },

  // ---- resources (power)
  'r-nuclear': {
    bg: '#6b5f14',
    paths: [
      F('M4.4 22.2C6.9 17.2 7.6 13.6 6.8 10.6H17.2C16.4 13.6 17.1 17.2 19.6 22.2Z'),
      T(circle(9.2, 5.6, 2.2)), T(circle(13, 4.2, 2.7)), T(circle(16.6, 5.8, 1.9)),
      D('M7.4 14.2h9.2M7.2 18h9.6', 1),
    ],
  },
  'r-hydro': { bg: '#1f5f86', paths: [F(DROP + BOLT(0, 1.4, 0.95)), D('M7.6 13.4a5 5 0 0 0 1.6 4.6', 1.1)] },
  'r-pumped_storage': {
    bg: '#1f4f7a',
    paths: [F(DROP + poly([[12, 7.6], [15.6, 11.4], [13.2, 11.4], [13.2, 14.8], [15.6, 14.8], [12, 18.6], [8.4, 14.8], [10.8, 14.8], [10.8, 11.4], [8.4, 11.4]]))],
  },
  'r-wind': {
    bg: '#2f6b62',
    paths: [
      T('M11.3 10.4h1.4l1.1 11.6h-3.6Z'),
      ...[0, 120, 240].map((a) => F(poly(rot([[-1.3, -0.6], [-0.5, -8.4], [0.6, -8.6], [1.3, -0.6]], 12, 9, a)))),
      F(circle(12, 9, 1.8)),
      D(circle(12, 9, 0.7), 0.9),
    ],
  },
  'r-solar': {
    bg: '#8a6a10',
    paths: [
      T(circle(6, 5.4, 2.6)),
      TS('M6 .9v.9M10.5 5.4h-.9M1.5 5.4h.9M9.2 2.2l-.6.6M2.8 2.2l.6.6', 1.6),
      F(poly([[6.2, 10.2], [19.8, 10.2], [22.4, 18.6], [8.8, 18.6]]) +
        poly([[12.4, 10.2], [13.6, 10.2], [16.2, 18.6], [15, 18.6]]) +
        poly([[7.3, 13.8], [20.9, 13.8], [21.2, 15], [7.7, 15]])),
      F('M14.8 18.6h1.8v3.6h-1.8Z'),
    ],
  },
  'r-coal_plant': {
    bg: '#3a3a3a',
    paths: [
      F('M1.8 21.8V12.4l5 3v-3l5 3v-3l5 3V7.6h4.4v14.2Z' + 'M4.4 17.4h2v2h-2Z' + 'M9.4 17.4h2v2h-2Z' + 'M14.4 17.4h2v2h-2Z'),
      T(circle(17.4, 4.6, 1.9)), T(circle(20.6, 3, 1.5)), T(circle(14.4, 2.6, 1.4)),
    ],
  },
  'r-gas_plant': { bg: '#8a4a10', paths: [F(FLAME + BOLT(0, 2.2, 0.8))] },
  'r-geothermal': {
    bg: '#7a2a2a',
    paths: [
      F('M1.4 22c2.6-5 6-6.6 10.6-6.6S20 17 22.6 22Z'),
      TS('M8.4 13.4c-1.6-1.6 1.6-3 0-4.6s1.6-3 0-4.6', 1.6),
      S('M12.4 12.6c-1.6-1.6 1.6-3 0-4.6s1.6-3 0-4.6s1.6-1.6 0-2.4', 2.2),
      TS('M16.4 13.4c-1.6-1.6 1.6-3 0-4.6s1.6-3 0-4.6', 1.6),
      D('M4.6 19.4c2.2-1.4 4.6-2 7.4-2', 1),
    ],
  },
  'r-battery': {
    bg: '#2f6b2a',
    paths: [
      F(rrect(1.6, 6.4, 18, 11.2, 1.8) + BOLT(-1.4, -1, 0.8)),
      T(rrect(20.2, 9.6, 2.4, 4.8, 0.6)),
    ],
  },

  // ---- resources (extraction)
  'r-coal_mine': {
    bg: '#3a332c',
    paths: [
      T('M1.4 22.4l1.2-3.8 3.4-1.9 3.4.9 1.4 2.7-.3 2.1Z'),
      F(poly(rot([[-1, -1.4], [1, -1.4], [1, 13.6], [-1, 13.6]], 11, 7.4, -40))),
      F(poly(rot([[-9, 0.6], [-4.4, -2.4], [0, -3.4], [4.4, -2.4], [9, 0.6], [4.2, -0.6], [0, -1.2], [-4.2, -0.6]], 11, 7.4, -40))),
    ],
  },
  'r-gold': {
    bg: '#8a6a10',
    paths: [
      F(poly([[3.8, 14.4], [10.2, 14.4], [11.4, 21], [2.6, 21]])),
      F(poly([[13.8, 14.4], [20.2, 14.4], [21.4, 21], [12.6, 21]])),
      F(poly([[8.8, 6.6], [15.2, 6.6], [16.4, 13.2], [7.6, 13.2]])),
      T(poly([[12, 1.4], [12.6, 3.2], [14.4, 3.8], [12.6, 4.4], [12, 6.2], [11.4, 4.4], [9.6, 3.8], [11.4, 3.2]])),
      D('M4.4 16h5.2M14.4 16h5.2M9.4 8.2h5.2', 1),
    ],
  },
  'r-silver': {
    bg: '#4f5a66',
    paths: [
      F(poly([[5.6, 9.6], [18.4, 9.6], [21, 19.4], [3, 19.4]]) + poly([[8.2, 11.6], [15.8, 11.6], [16.4, 13.6], [7.6, 13.6]])),
      T(poly([[19, 1.6], [19.7, 4], [22.2, 4.7], [19.7, 5.4], [19, 7.8], [18.3, 5.4], [15.8, 4.7], [18.3, 4]])),
    ],
  },
  'r-copper': {
    bg: '#7a4420',
    paths: [
      F(ellipse(5.6, 12, 3.2, 8.4) + ellipse(5.6, 12, 1.2, 3.4)),
      F('M5.6 3.6H18.4A3.2 8.4 0 0 1 18.4 20.4H5.6A3.2 8.4 0 0 0 5.6 3.6Z' +
        'M9.2 3.9h1.2v16.2H9.2Z' + 'M12.4 3.9h1.2v16.2h-1.2Z' + 'M15.6 3.9h1.2v16.2h-1.2Z'),
    ],
  },
  'r-iron': {
    bg: '#5a3020',
    paths: [F('M3 3.4H21V7H14V17H21V20.6H3V17H10V7H3Z'), D('M4 5.2h16M4 18.8h16', 0.9)],
  },
  'r-platinum': {
    bg: '#3f5266',
    paths: [
      F(ellipse(12, 14.6, 8.2, 7) + ellipse(12, 14.6, 5.6, 4.6)),
      T(poly([[9, 4.2], [15, 4.2], [17, 6.4], [12, 10], [7, 6.4]])),
    ],
  },
  'r-molybdenum': {
    // a cubic crystal seen corner-on, its top facet in the second tone
    bg: '#3f4a56',
    paths: [
      T(poly([[12, 4.4], [17.4, 7.4], [12, 10.4], [6.6, 7.4]])),
      F(poly([[12, 1.6], [20.4, 6.4], [20.4, 17.4], [12, 22.4], [3.6, 17.4], [3.6, 6.4]]) +
        poly([[12, 4.4], [17.4, 7.4], [12, 10.4], [6.6, 7.4]])),
      D('M12 10.4V20.2M5.8 8.6l6.2 3.6 6.2-3.6', 1),
    ],
  },
  'r-lead_zinc': {
    // a plumb bob (lead, plumbum) on its line
    bg: '#3f4a56',
    paths: [
      S('M12 1.4V5.6', 1.6),
      F(rrect(8.8, 5.2, 6.4, 2.8, 1)),
      F('M6 9H18c0 4.4-2.6 8.6-6 13.4C8.6 17.6 6 13.4 6 9Z'),
      D('M8.2 11.4h7.6', 1),
    ],
  },
  'r-rare_earths': {
    bg: '#5a2a6b',
    paths: [
      T('M3.2 3.2h5.6v3.8H3.2Z' + 'M15.2 3.2h5.6v3.8h-5.6Z'),
      F('M3 3h6v9a3 3 0 0 0 6 0V3h6v9a9 9 0 0 1-18 0Z' + 'M3 3h6v4.2H3Z' + 'M15 3h6v4.2h-6Z' + 'M3 7.2h6v1.2H3Z' + 'M15 7.2h6v1.2h-6Z'),
      D('M5.6 14.4a6.6 6.6 0 0 0 4 4', 1),
    ],
  },
  'r-uranium': {
    bg: '#3a6b1f',
    paths: [
      T(circle(12, 12, 11) + circle(12, 12, 10.2)),
      F(circle(12, 12, 2)),
      ...[0, 120, 240].map((a) => {
        const r1 = 3.4, r2 = 10.2, h = 30;
        const p = (r, d) => {
          const t = ((a - 90 + d) * Math.PI) / 180;
          return [12 + Math.cos(t) * r, 12 + Math.sin(t) * r];
        };
        const [ax, ay] = p(r1, -h), [bx, by] = p(r2, -h), [cx2, cy2] = p(r2, h), [dx, dy] = p(r1, h);
        return F(`M${f(ax)} ${f(ay)}L${f(bx)} ${f(by)}A${r2} ${r2} 0 0 1 ${f(cx2)} ${f(cy2)}L${f(dx)} ${f(dy)}A${r1} ${r1} 0 0 0 ${f(ax)} ${f(ay)}Z`);
      }),
    ],
  },
  'r-oil': {
    bg: '#3a2f24',
    paths: [
      F('M9.4 1.8h5.2l4 18.4h-3l-.6-3H9L8.4 20.2h-3Z' + 'M10.6 4.6h2.8l.9 4.2H9.7Z' + 'M9.4 10.8h5.2l1.1 4.8H8.3Z'),
      T('M2.4 20.4h19.2v2H2.4Z'),
    ],
  },
  'r-gas': { bg: '#2f5a7a', paths: [F(FLAME + 'M12.2 12.4c.6 2.2 3 2.8 3 5.2a3.2 3.2 0 0 1-6.4 0c0-1.8 2-3 3.4-5.2Z')] },

  // ---- industries (nation.industries keys; agriculture, mining, real_estate, education and arts are aliases below)
  'i-construction': {
    bg: '#8a5426',
    paths: [
      F('M3.6 15.6a8.4 8.4 0 0 1 16.8 0Z' + 'M10.9 8.4h2.2v5.6h-2.2Z'),
      T(rrect(1.4, 16.6, 21.2, 3.4, 1.2)),
      D('M6.6 12.4a6 6 0 0 1 2.2-3', 1),
    ],
  },
  'i-manufacturing': {
    bg: '#7a4a24',
    paths: [
      F('M1.8 21.8V10.2L7.2 13.4V10.2L12.6 13.4V10.2L16.6 12.8V2.6H21.6V21.8Z' +
        'M4.2 15.8h2.6v2.6H4.2Z' + 'M9.2 15.8h2.6v2.6H9.2Z' + 'M14.2 15.8h2.6v2.6h-2.6Z'),
      T('M4.2 15.8h2.6v2.6H4.2Z' + 'M9.2 15.8h2.6v2.6H9.2Z' + 'M14.2 15.8h2.6v2.6h-2.6Z'),
      D('M17.2 5h3.8', 1),
    ],
  },
  'i-wholesale': {
    bg: '#6b5428',
    paths: [
      F(poly([[12, 1.8], [21.4, 6.4], [12, 11], [2.6, 6.4]]) + poly([[8.4, 3.6], [10.2, 2.7], [19.4, 7.3], [17.6, 8.2]])),
      T(poly([[2, 8], [11.1, 12.5], [11.1, 22.4], [2, 17.9]])),
      F(poly([[12.9, 12.5], [22, 8], [22, 17.9], [12.9, 22.4]])),
    ],
  },
  'i-retail': {
    bg: '#7a3a5a',
    paths: [
      TS('M8.2 8.6V6.6a3.8 3.8 0 0 1 7.6 0v2', 2.2),
      F(poly([[4, 8], [20, 8], [21.4, 22], [2.6, 22]]) + circle(8.2, 11, 1.1) + circle(15.8, 11, 1.1)),
    ],
  },
  'i-transportation': {
    bg: '#3a5a6b',
    paths: [
      F(rrect(1.2, 4.4, 13.6, 11.2, 1)),
      T('M15.8 7.8h4l2.8 4.2v3.6h-6.8Z' + 'M17.1 9.1h2.1l1.8 2.7h-3.9Z'),
      D('M3.4 7.4h9.2M3.4 10h9.2M3.4 12.6h9.2', 0.9),
      F(circle(6, 18.6, 2.7) + circle(6, 18.6, 1)),
      F(circle(18.2, 18.6, 2.7) + circle(18.2, 18.6, 1)),
    ],
  },
  'i-utilities': { bg: '#2a5f86', paths: [F(BOLT(0, -1, 1.75))] },
  'i-information': {
    bg: '#25557e',
    paths: [
      F(circle(12, 6, 2.1)),
      F(poly([[11, 8.4], [13, 8.4], [17.8, 22.2], [15.2, 22.2], [12, 12.6], [8.8, 22.2], [6.2, 22.2]])),
      F('M8.8 16.4h6.4v1.9H8.8Z'),
      S('M8.6 3.4a4 4 0 0 0 0 5.2M15.4 3.4a4 4 0 0 1 0 5.2', 1.6),
      TS('M5.4 1.4a7 7 0 0 0 0 9.2M18.6 1.4a7 7 0 0 1 0 9.2', 1.6),
    ],
  },
  'i-finance': {
    bg: '#7a6420',
    paths: [
      F(poly([[12, 1.6], [22.6, 7], [22.6, 9.2], [1.4, 9.2], [1.4, 7]]) + circle(12, 6.4, 1.3)),
      T('M3.2 10.4h3v7.8h-3Z' + 'M8.2 10.4h3v7.8h-3Z' + 'M12.8 10.4h3v7.8h-3Z' + 'M17.8 10.4h3v7.8h-3Z'),
      F(rrect(1.4, 19.4, 21.2, 3, 0.6)),
    ],
  },
  'i-professional': {
    bg: '#25557e',
    paths: [
      F(poly(rot([[-1.9, -6.2], [1.9, -6.2], [1.9, 5.6], [-1.9, 5.6]], 10.2, 8.4, -32))),
      F(poly(rot([[-2.8, -8.2], [2.8, -8.2], [2.8, -6.8], [-2.8, -6.8]], 10.2, 8.4, -32))),
      TS('M16.4 8.8c3.4 2.4 3.6 6.8 1.4 10.2', 2.2),
      F('M8 15.4h8.6v1.9H8Z'),
      F(rrect(3.6, 19.6, 16.8, 2.8, 1)),
    ],
  },
  'i-management': {
    bg: '#3a4a6e',
    paths: [
      F('M7 22.4V3.8L17 1.6V22.4Z' +
        'M9 6.4h2.2v2H9Z' + 'M12.8 5.6h2.2v2.4h-2.2Z' +
        'M9 10.2h2.2v2H9Z' + 'M12.8 10.2h2.2v2h-2.2Z' +
        'M9 14h2.2v2H9Z' + 'M12.8 14h2.2v2h-2.2Z' + 'M10.9 18.4h2.2v4h-2.2Z'),
      T('M1.6 22.4V11.4H5.8V22.4Z'),
      T('M18.2 22.4V8.4H22.4V22.4Z'),
    ],
  },
  'i-admin': {
    bg: '#4a5a6a',
    paths: [
      F(rrect(3.8, 4.2, 16.4, 18.4, 2) + 'M7.4 9.6h9.2v1.9H7.4Z' + 'M7.4 13.6h9.2v1.9H7.4Z' + 'M7.4 17.6h6v1.9h-6Z'),
      T(rrect(8.2, 1.4, 7.6, 4.6, 1.2) + circle(12, 3.4, 0.9)),
    ],
  },
  'i-health': {
    bg: '#8a2f34',
    paths: [F('M9 2.2h6v6.8h6.8v6H15v6.8H9V15H2.2V9H9Z'), D('M10.6 3.8h2.8v6.8h6.8v2.8h-6.8v6.8h-2.8v-6.8H3.8v-2.8h6.8Z', 1)],
  },
  'i-accommodation': {
    bg: '#7a4a2a',
    paths: [
      F('M3.6 2h1.6v5.6h1.3V2h1.6v5.6h1.3V2H11v6.6a3.2 3.2 0 0 1-2.5 3.1v9.3a1.3 1.3 0 0 1-2.6 0v-9.3A3.2 3.2 0 0 1 3.4 8.6V2Z'),
      T('M17.6 2c2.8 1.4 3.6 5.4 3.6 10h-2.1v9a1.3 1.3 0 0 1-2.6 0V3.2A1.2 1.2 0 0 1 17.6 2Z'),
    ],
  },
  'i-other': {
    bg: '#4a4a52',
    paths: [
      F((() => {
        // open-ended wrench head: a ring with a jaw cut toward the upper left
        const cx = 7.6, cy = 7.6, r = 5.6, a0 = (225 * Math.PI) / 180, d = (27 * Math.PI) / 180;
        const at = (a, rr) => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
        const [x1, y1] = at(a0 + d, r), [x2, y2] = at(a0 - d, r);
        const jw = 1.75, depth = 0.6; // half jaw width, how far past centre the jaw goes
        const ux = Math.cos(a0), uy = Math.sin(a0), px = -uy, py = ux;
        const j1 = [cx - ux * depth + px * jw, cy - uy * depth + py * jw];
        const j2 = [cx - ux * depth - px * jw, cy - uy * depth - py * jw];
        const e1 = [cx + ux * r + px * jw, cy + uy * r + py * jw];
        const e2 = [cx + ux * r - px * jw, cy + uy * r - py * jw];
        // choose the jaw edge nearest each arc end
        const near = (p, a, b) => (Math.hypot(p[0] - a[0], p[1] - a[1]) < Math.hypot(p[0] - b[0], p[1] - b[1]) ? a : b);
        const s1 = near([x1, y1], e1, e2), s2 = s1 === e1 ? e2 : e1;
        const k1 = s1 === e1 ? j1 : j2, k2 = s1 === e1 ? j2 : j1;
        return `M${f(x1)} ${f(y1)}A${r} ${r} 0 1 1 ${f(x2)} ${f(y2)}L${f(s2[0])} ${f(s2[1])}L${f(k2[0])} ${f(k2[1])}L${f(k1[0])} ${f(k1[1])}L${f(s1[0])} ${f(s1[1])}Z`;
      })()),
      S('M10.8 10.8L19.8 19.8', 4),
    ],
  },
  'i-public_admin': {
    bg: '#3a4a6e',
    paths: [
      F('M5.4 12.2a6.6 6.6 0 0 1 13.2 0Z'),
      F('M11.3 6.2V2.8h1.4v3.4Z'), F(circle(12, 2.2, 1.1)),
      F('M3 12.9h18v1.6H3Z'),
      T('M5 15.4h2v4H5Z' + 'M9 15.4h2v4H9Z' + 'M13 15.4h2v4h-2Z' + 'M17 15.4h2v4h-2Z'),
      D('M7.6 10.4a4.6 4.6 0 0 1 3-3', 1),
      F('M2 20.2h20v2.4H2Z'),
    ],
  },

  // ---- districts (districts.json catalog `icon` ids)
  'd-campus': {
    bg: '#2c5a9a',
    paths: [
      T('M6.2 10.6v4.6c3.6 2.6 8 2.6 11.6 0v-4.6L12 13.4Z'),
      F('M12 3.2L22.8 8.4 12 13.6 1.2 8.4Z'),
      S('M20.6 9.4v6.2', 1.6), F(circle(20.6, 16.6, 1.4)),
      D('M6.8 8.4L12 6l5.2 2.4', 1),
    ],
  },
  'd-commercial-hub': {
    bg: '#8a6a14',
    paths: [
      F('M9.2 2.4h5.6l-1.8 3.4c4.6 1.2 7.8 5.4 7.8 10 0 4.2-3.6 6.2-8.8 6.2S3.2 20 3.2 15.8c0-4.6 3.2-8.8 7.8-10Z'),
      D('M9.4 6.2h5.2', 1.2),
      D('M14.3 11.4c-.5-.9-1.4-1.3-2.5-1.3-1.4 0-2.3.7-2.3 1.7s1 1.5 2.3 1.8 2.4.8 2.4 1.9-1 1.8-2.4 1.8c-1.2 0-2.1-.5-2.6-1.4M11.8 9v9.4', 1.3),
    ],
  },
  'd-industrial-zone': {
    bg: '#8a4424',
    paths: [
      T(circle(18.2, 3.4, 1.7)), T(circle(15.2, 2.2, 1.2)),
      F('M1.6 22V11.4l5.2 3.4v-3.4l5.2 3.4v-3.4l5.2 3.4V6h4.2v16Z' +
        'M3.8 17.2h2.2v2.2H3.8Z' + 'M9 17.2h2.2v2.2H9Z' + 'M14.2 17.2h2.2v2.2h-2.2Z'),
    ],
  },
  'd-harbor': {
    bg: '#1f5f86',
    paths: [
      T('M4.6 8.8h4.2v4.6H4.6Z' + 'M9.4 8.8h4.2v4.6H9.4Z' + 'M7 4.6h4.2v3.8H7Z'),
      F('M15 6.4h4.2v7.2H15Z' + 'M16 7.6h2.2v1.8H16Z'),
      F('M1.4 13.6h21.2l-3 5.4H4.4Z'),
      S('M1.6 21.8q2.6-1.6 5.2 0t5.2 0 5.2 0 5.2 0', 1.6),
    ],
  },
  'd-theater-square': {
    bg: '#5e3480',
    paths: [
      T('M1.8 19.4h20.4v2.6H1.8Z'),
      F('M1.6 2.2h20.8v3.2H1.6Z'),
      F('M2.4 5.4h5.8c-.8 5-2.4 9.6-1.4 14H2.4Z'),
      F('M21.6 5.4h-5.8c.8 5 2.4 9.6 1.4 14h4.4Z'),
      F(star(12, 12.4, 3.6, 0.45)),
    ],
  },
  'd-entertainment-complex': {
    bg: '#8a2f5e',
    paths: [
      T([0, 1, 2, 3, 4, 5, 6, 7].map((k) => circle(12 + 7.4 * Math.cos((k * Math.PI) / 4), 10 + 7.4 * Math.sin((k * Math.PI) / 4), 1.5)).join('')),
      S(circle(12, 10, 7.4), 1.8),
      S('M12 2.6V17.4M4.6 10h14.8M6.8 4.8l10.4 10.4M17.2 4.8L6.8 15.2', 1.1),
      F('M12 11.2L6.6 22.4h2.6L12 15.6l2.8 6.8h2.6Z'),
      F(circle(12, 10, 1.9)),
    ],
  },
  'd-aerodrome': {
    bg: '#3a5a86',
    paths: [
      F(poly(rot([[0, -10.4], [1.3, -8.8], [1.3, -3], [9.6, 1.8], [9.6, 3.8], [1.3, 1.4], [1.2, 6.6], [4, 8.6], [4, 10.2],
        [0, 9.2], [-4, 10.2], [-4, 8.6], [-1.2, 6.6], [-1.3, 1.4], [-9.6, 3.8], [-9.6, 1.8], [-1.3, -3], [-1.3, -8.8]], 12, 12, 45))),
    ],
  },
  'd-government-plaza': {
    bg: '#4e5a34',
    paths: [
      F(poly([[12, 1.8], [22.6, 8.2], [1.4, 8.2]]) + star(12, 5.8, 1.7, 0.45)),
      T('M3.4 9.6h2.8v8.6H3.4Z' + 'M8.2 9.6H11v8.6H8.2Z' + 'M13 9.6h2.8v8.6H13Z' + 'M17.8 9.6h2.8v8.6h-2.8Z'),
      F(rrect(1.6, 19.2, 20.8, 3.2, 0.6)),
    ],
  },
  'd-encampment': {
    bg: '#6a3a2a',
    paths: [
      T('M13.4 21.8l5.2-9 4.2 9Z'),
      F('M1.4 21.8L10.4 6.6l9 15.2Z' + 'M10.4 13.4l-3.2 8.4h6.4Z'),
      S('M10.4 6.8V1.4', 1.6),
      F('M10.4 1.4h6.6l-1.6 1.8 1.6 1.8h-6.6Z'),
    ],
  },
  'd-aqueduct': {
    bg: '#22706e',
    paths: [
      T('M1.2 2.8h21.6v2.6H1.2Z'),
      F('M1.2 5.4h21.6v2.6H1.2Z'),
      F('M1.6 8v14h2.2v-6.4a2.5 2.5 0 0 1 5 0V22h2.4v-6.4a2.5 2.5 0 0 1 5 0V22h2.4v-6.4a2.5 2.5 0 0 1 5 0V22h-.2V8Z'),
      D('M3.4 11.6a1.6 1.6 0 0 1 3.2 0M10.4 11.6a1.6 1.6 0 0 1 3.2 0M17.4 11.6a1.6 1.6 0 0 1 3.2 0', 1),
    ],
  },

  // ---- military (forts by component, restricted ground)
  'm-army': {
    bg: '#4e5a2e',
    paths: [F(star(12, 12.6, 10.6, 0.62) + circle(12, 12.6, 3.4)), T(circle(12, 12.6, 2.2))],
  },
  'm-navy': {
    bg: '#22406a',
    paths: [
      S('M12 6.6V21', 2.2), S(circle(12, 4.4, 2), 1.8), S('M7.8 9.4h8.4', 2),
      S('M4 14.8c.8 4.2 4.2 6.4 8 6.4s7.2-2.2 8-6.4', 2.2),
      F(poly([[2.4, 16.2], [3.4, 12.6], [6.2, 15]])), F(poly([[21.6, 16.2], [20.6, 12.6], [17.8, 15]])),
    ],
  },
  'm-air-force': {
    bg: '#2e5a8a',
    paths: [
      T('M12 9.4L23 6.2l-2.2 4.4-6 3.2ZM12 9.4L1 6.2l2.2 4.4 6 3.2Z'),
      F(circle(12, 12.4, 5.2) + star(12, 12.6, 3.4, 0.42)),
    ],
  },
  'm-marines': {
    bg: '#7a2424',
    paths: [
      F(poly([[2.6, 9.2], [12, 2.8], [21.4, 9.2], [21.4, 12.8], [12, 6.4], [2.6, 12.8]])),
      F(poly([[2.6, 14.6], [12, 8.2], [21.4, 14.6], [21.4, 18.2], [12, 11.8], [2.6, 18.2]])),
      T(poly([[2.6, 20], [12, 13.6], [21.4, 20], [21.4, 22.6], [12, 17.2], [2.6, 22.6]])),
    ],
  },
  'm-guard': {
    bg: '#5a5a40',
    paths: [F('M12 1.6l8.8 3.2v6.4c0 5.6-3.6 9.4-8.8 11.2-5.2-1.8-8.8-5.6-8.8-11.2V4.8Z' + star(12, 11.2, 4.8, 0.42))],
  },
  'm-range': {
    bg: '#7a2a1a',
    paths: [
      T('M6.2 9.2l3-3M6.4 14.4l8-8M9.2 17l8-8M14.4 17.2l3-3'),
      F(circle(12, 12, 10.2) + circle(12, 12, 7.6)),
      F(poly(rot([[-7.8, -1.3], [7.8, -1.3], [7.8, 1.3], [-7.8, 1.3]], 0, 0, 45).map(([x, y]) => [x + 12, y + 12]))),
    ],
  },

  // ---- wonders
  'w-park': {
    bg: '#2f5a2a',
    paths: [
      T('M1.2 21L9 6.4l3.8 6.2 2.6-3.4L22.8 21Z'),
      D('M7.2 10l1.8 1.2 1.8-1.4', 1.1),
      F('M17.6 8.6l3.6 5.4h-1.8l3 4.6h-3.6V22h-2.4v-3.4h-3.6l3-4.6H14Z'),
    ],
  },
  'w-university': {
    bg: '#2c4a78',
    paths: [
      T('M1.6 22v-8.4l7.4-2.8V22Z' + 'M22.4 22v-8.4L15 10.8V22Z'),
      F('M9.4 22V7.2L12 2.2l2.6 5V22Z' + circle(12, 9.6, 1.4) + 'M11 17.4h2V22h-2Z'),
      D('M3.6 15.6h3M3.6 18.4h3M17.4 15.6h3M17.4 18.4h3', 1.1),
    ],
  },
  'w-landmark': {
    bg: '#6a4a1c',
    paths: [
      T(rrect(3.4, 20.4, 17.2, 2.2, 0.5)),
      F('M10.2 18.8L11 4.2 12 2.2l1 2 .8 14.6Z'),
      F(rrect(6.6, 18.4, 10.8, 2.6, 0.5)),
      D('M12.4 5.2l.5 12.4', 0.9),
    ],
  },

  // ---- tile improvements and trade
  't-road': {
    bg: '#6a5434',
    paths: [F('M9.2 2.4h5.6l6.6 19.4H2.6Z'), D('M12 4.2v2.4M12 8.8v3.2M12 14.6v5', 1.5)],
  },
  't-rail': {
    bg: '#4a4a52',
    paths: [
      T('M8.4 4.4h7.2v1.6H8.4Z' + 'M7.4 9h9.2v1.8H7.4Z' + 'M6.2 13.8h11.6v2H6.2Z' + 'M4.8 19h14.4v2.2H4.8Z'),
      S('M9.6 2.4L5 21.8M14.4 2.4L19 21.8', 1.8),
    ],
  },
  't-trade': {
    bg: '#7a5a24',
    paths: [
      T('M2 13.2h18.4v3H2Z'),
      F('M3.4 13.2V9.8c0-4.2 3-6.4 7.8-6.4s7.6 2.2 7.6 6.4v3.4Z'),
      D('M8.2 4.8v8.2M14 4.4v8.6', 1.1),
      S('M20.4 14.6l2.6-1.6', 1.6),
      F(circle(6.4, 18.8, 2.8) + circle(6.4, 18.8, 1)),
      F(circle(16.2, 18.8, 2.8) + circle(16.2, 18.8, 1)),
    ],
  },

  // ---- county lenses
  'l-faith': {
    bg: '#5a3a7a',
    paths: [
      T(circle(12, 7.2, 5.4)),
      F('M12 1.6c.4 2 3 3.4 3 6.2a3 3 0 0 1-6 0c0-1.8 1-3 1.8-3.8 0 1.2.4 2 1 2.2-.3-1.8.1-3.4.2-4.6Z'),
      F(rrect(8.4, 11.6, 7.2, 10.8, 1.2)),
      D('M10.4 12.6v3.4', 1.1),
    ],
  },
  'l-faith-tradition': {
    bg: '#5a3a7a',
    paths: [
      F('M12 12V1.8a10.2 10.2 0 0 1 8.83 15.3Z'),
      T('M12 12l8.83 5.1A10.2 10.2 0 0 1 3.17 17.1Z'),
      F('M12 12L3.17 17.1A10.2 10.2 0 0 1 12 1.8Z'),
      D('M12 12V1.8M12 12l8.83 5.1M12 12L3.17 17.1', 1.4),
    ],
  },
  'l-amenities': {
    bg: '#8a3a4a',
    paths: [
      F('M12 21.4C5 16.6 1.6 12.6 1.6 8.4a5.3 5.3 0 0 1 10.4-1.6 5.3 5.3 0 0 1 10.4 1.6c0 4.2-3.4 8.2-10.4 13Z'),
      D('M8 11.4q4 3.6 8 0', 1.4), D(circle(8.6, 8, 0.4) + circle(15.4, 8, 0.4), 1.2),
    ],
  },
  'l-disasters': {
    bg: '#5a4a6a',
    paths: [
      T(poly([[12.8, 12.6], [8.4, 18.2], [11.2, 18.2], [10, 22.8], [15.8, 16], [12.8, 16], [14.2, 12.6]])),
      F('M6.4 14.4a4.4 4.4 0 0 1-.6-8.8A6 6 0 0 1 17.2 4.6a4.7 4.7 0 0 1 .8 9.8Z'),
      D('M6.2 11.2h11', 1),
    ],
  },
  'l-veterans': {
    bg: '#3a4a6a',
    paths: [
      T(poly([[6.2, 1.6], [10.6, 1.6], [13.8, 9.6], [10.2, 10.4]])),
      T(poly([[17.8, 1.6], [13.4, 1.6], [10.2, 9.6], [13.8, 10.4]])),
      F(circle(12, 15.4, 6.8) + star(12, 15.6, 4, 0.42)),
    ],
  },
  // lens groups (ui/lenses.js and ui/pedia.js look up `g-<group id>`)
  'g-faith': {
    bg: '#5a3a7a',
    paths: [
      // a generic meeting house: steps, a peaked roof, a round window; no single tradition's symbol
      T(rrect(2.4, 19.6, 19.2, 2.6, 0.6)),
      F('M3.6 19.6V10.4L12 3l8.4 7.4v9.2h-5.6v-4.8a2.8 2.8 0 0 0-5.6 0v4.8Z' + circle(12, 9.6, 1.7)),
      D('M12 3V1.2', 1.4),
    ],
  },
  'g-hazards': {
    bg: '#5a4a6a',
    paths: [
      // a storm swirl
      T(circle(12, 12, 9.6)),
      F(circle(12, 12, 3.6) + circle(12, 12, 1.6)),
      S('M12 8.4C12.4 4.4 15.6 2 20.4 2.6', 2.4),
      S('M12 15.6C11.6 19.6 8.4 22 3.6 21.4', 2.4),
      S('M15.6 12C19.6 12.4 22 15.6 21.4 20.4', 1.6),
      S('M8.4 12C4.4 11.6 2 8.4 2.6 3.6', 1.6),
    ],
  },
};

// Aliases: id variants used by data files or other modules.
export const ALIASES = {
  'l-people': 'pop',
  'l-density': 'pop',
  'l-degree': 'l-degrees',
  'l-bachelors': 'l-degrees',
  'l-homeowner': 'l-homeownership',
  'l-foreign_born': 'l-foreign-born',
  'r-coal': 'r-coal_mine',
  'r-coal-mine': 'r-coal_mine',
  'r-coal-plant': 'r-coal_plant',
  'r-gas-plant': 'r-gas_plant',
  'r-pumped-storage': 'r-pumped_storage',
  'r-lead-zinc': 'r-lead_zinc',
  'r-rare-earths': 'r-rare_earths',
  'y-gdp': 'y-gold',
  people: 'pop',
  book: 'pedia',
  map: 'terrain',
  // industries reusing an existing glyph (same choices as banners.js INDUSTRY_ICON)
  'i-agriculture': 'y-food',
  'i-mining': 'r-coal_mine',
  'i-real_estate': 'l-home',
  'i-education': 'l-degrees',
  'i-arts': 'y-culture',
  'i-real-estate': 'l-home',
  'i-public-admin': 'i-public_admin',
  // map-art ids that reuse a glyph
  't-port': 'd-harbor',
  't-airport': 'd-aerodrome',
  'm-air_force': 'm-air-force',
  'm-fort': 'm-army',
  'w-natural': 'w-park',
  'l-faith_tradition': 'l-faith-tradition',
  'd-commercial_hub': 'd-commercial-hub',
  'd-industrial_zone': 'd-industrial-zone',
  'd-theater_square': 'd-theater-square',
  'd-entertainment_complex': 'd-entertainment-complex',
  'd-government_plaza': 'd-government-plaza',
};

export const ICONS = { ...RAW };
for (const [a, t] of Object.entries(ALIASES)) ICONS[a] = RAW[t];

const resolve = (id) => (RAW[id] ? id : ALIASES[id] && RAW[ALIASES[id]] ? ALIASES[id] : null);

export function hasIcon(id) {
  return resolve(id) !== null;
}

// ---------------------------------------------------------------- SVG
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Paths of an icon in paint order: tone, main, detail (each group keeps its authored order). */
const layer = (p) => (p.tone ? 0 : p.detail ? 2 : 1);
const ordered = (paths) => [...paths].sort((a, b) => layer(a) - layer(b));
const TONE_ALPHA = 0.55;

export function svgIcon(id, { size = 18, title = '' } = {}) {
  const key = resolve(id);
  const icon = key ? RAW[key] : null;
  const a11y = title ? `role="img" aria-label="${esc(title)}"` : 'role="img" aria-hidden="true" focusable="false"';
  const head = `<svg class="icon icon-${esc(id)}" ${a11y} width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;flex:none">`;
  const t = title ? `<title>${esc(title)}</title>` : '';
  if (!icon) return `${head}${t}</svg>`;
  // Detail lines are hairlines at DOM sizes; below 16px they only add mud, so leave them out.
  const body = ordered(icon.paths).filter((p) => !(p.detail && size < 16)).map((p) => {
    const op = p.tone ? ` opacity="${TONE_ALPHA}"` : '';
    if (p.detail) {
      return `<path d="${p.d}" fill="none" stroke="#000" stroke-opacity=".38" stroke-width="${p.width}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    if (p.stroke) {
      return `<path d="${p.d}" fill="none" stroke="${p.stroke}" stroke-width="${p.width ?? 2}" stroke-linecap="round" stroke-linejoin="round"${op}/>`;
    }
    return `<path d="${p.d}" fill="${p.fill ?? 'currentColor'}" fill-rule="evenodd"${op}/>`;
  }).join('');
  return `${head}${t}${body}</svg>`;
}

// ---------------------------------------------------------------- colour helpers
const TAU = Math.PI * 2;

/** '#rgb' | '#rrggbb' | 'rgb(a)(r,g,b[,a])' -> [r,g,b] or null. */
function parseColor(c) {
  if (Array.isArray(c)) return c;
  if (typeof c !== 'string') return null;
  let m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c.trim());
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h.split('').map((ch) => ch + ch).join('');
    const n = parseInt(h, 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
  }
  m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(c.trim());
  return m ? [+m[1], +m[2], +m[3]] : null;
}

function luminance(c) {
  const rgb = parseColor(c);
  if (!rgb) return 0;
  const lin = (v) => { v /= 255; return v <= 0.04 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
}

/** k > 0 lightens toward white, k < 0 darkens toward black. */
const shade = (c, k) => (k >= 0 ? c.map((v) => v + (255 - v) * k) : c.map((v) => v * (1 + k)));
const rgba = (c, a = 1) => (a >= 1 ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`);

const GLYPH_LIGHT = '#f8f0d8';
const GLYPH_DARK = '#1c1710';
const DEFAULT_BG = '#24384f';
const DEFAULT_RING = '#c9a45c';

// ---------------------------------------------------------------- canvas painting
const compiledCache = new Map();
function compiled(key) {
  let c = compiledCache.get(key);
  if (!c) {
    c = ordered(RAW[key].paths).map((p) => ({ ...p, p2d: new Path2D(p.d) }));
    compiledCache.set(key, c);
  }
  return c;
}

/**
 * Paint the bare glyph of `key` in a gs x gs box centred at (x, y).
 * g: {color, ink, shadowColor, shadowOff (px), halo (px blur, 0 = none)}
 */
function paintGlyph(c, key, x, y, gs, g) {
  const k = gs / 24;
  const paths = compiled(key);
  const rgb = parseColor(g.color);
  c.save();
  c.translate(x - gs / 2, y - gs / 2);
  c.scale(k, k);
  c.lineCap = 'round';
  c.lineJoin = 'round';

  const pass = (fill, { tone = true, main = true } = {}) => {
    for (const p of paths) {
      if (p.detail || (p.tone && !tone) || (!p.tone && !main)) continue;
      c.globalAlpha = p.tone && fill === null ? TONE_ALPHA : 1;
      const style = fill ?? (p.tone ? toneFill : mainFill);
      if (p.stroke) {
        c.strokeStyle = style;
        c.lineWidth = p.width ?? 2;
        c.stroke(p.p2d);
      } else {
        c.fillStyle = p.fill && p.fill !== 'currentColor' ? p.fill : style;
        c.fill(p.p2d, 'evenodd');
      }
    }
    c.globalAlpha = 1;
  };

  // Top-lit gradient on the glyph: a touch brighter at the top, a touch deeper at the foot.
  let mainFill = g.color, toneFill = g.color;
  if (rgb && gs >= 11 && !g.flat) {
    const lg = c.createLinearGradient(0, 1, 0, 23);
    lg.addColorStop(0, rgba(shade(rgb, 0.3)));
    lg.addColorStop(0.55, rgba(rgb));
    lg.addColorStop(1, rgba(shade(rgb, -0.16)));
    mainFill = toneFill = lg;
  }

  // Drop shadow: the main silhouette in an opaque dark tone, offset down-right (opaque so overlaps don't stack).
  if (g.shadowColor && g.shadowOff > 0) {
    c.save();
    c.translate(g.shadowOff / k, g.shadowOff * 1.3 / k);
    pass(g.shadowColor, { tone: false });
    c.restore();
  }
  if (g.halo > 0) {
    c.shadowColor = 'rgba(0,0,0,0.85)';
    c.shadowBlur = g.halo;
  }
  pass(null);
  c.shadowColor = 'transparent';
  c.shadowBlur = 0;

  // Engraved details (skipped when the glyph is too small to resolve them).
  if (gs >= 10 && g.ink) {
    c.strokeStyle = g.ink;
    for (const p of paths) {
      if (!p.detail) continue;
      c.lineWidth = Math.max(p.width, 0.9 * 24 / Math.max(gs, 1)); // never thinner than ~0.9 device px
      c.stroke(p.p2d);
    }
  }
  c.restore();
}

/** Bevelled metal medallion with the glyph. Draws directly into c, centred at (x, y). */
function paintMedallion(c, key, x, y, size, o) {
  const r = size / 2;
  const bgRGB = parseColor(o.bg || RAW[key].bg || DEFAULT_BG) || parseColor(DEFAULT_BG);
  // Bright type colours are deepened so a cream glyph always reads; the highlight keeps the original hue.
  const face = luminance(bgRGB) > 0.3 ? shade(bgRGB, -0.32) : bgRGB;
  const ring = parseColor(o.ring || DEFAULT_RING) || parseColor(DEFAULT_RING);
  if (size < 15) {
    paintSmallMedallion(c, key, x, y, size, bgRGB, face, ring, o);
    return;
  }
  const rimW = size * 0.105;

  // soft cast shadow
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.55)';
  c.shadowBlur = Math.max(1.5, size * 0.12);
  c.shadowOffsetY = Math.max(0.6, size * 0.05);
  c.beginPath();
  c.arc(x, y, r - 0.4, 0, TAU);
  c.fillStyle = rgba(shade(ring, -0.8));
  c.fill();
  c.restore();

  // metal rim, lit from the upper left
  const rg = c.createLinearGradient(x - r, y - r, x + r * 0.8, y + r);
  rg.addColorStop(0, rgba(shade(ring, 0.6)));
  rg.addColorStop(0.4, rgba(ring));
  rg.addColorStop(1, rgba(shade(ring, -0.55)));
  c.beginPath();
  c.arc(x, y, r - Math.max(0.55, size * 0.035), 0, TAU);
  c.fillStyle = rg;
  c.fill();

  // inner bevel: the face sits in a recess, so its edge is dark at the top-left and lit at the bottom-right
  const ri = r - rimW;
  const bg2 = c.createLinearGradient(x - ri, y - ri, x + ri, y + ri);
  bg2.addColorStop(0, rgba(shade(ring, -0.7)));
  bg2.addColorStop(1, rgba(shade(ring, 0.35)));
  c.beginPath();
  c.arc(x, y, ri, 0, TAU);
  c.fillStyle = bg2;
  c.fill();

  // face: radial gradient in the type colour, light falling from the upper left
  const rf = ri - Math.max(0.55, size * 0.03);
  const fg = c.createRadialGradient(x - rf * 0.35, y - rf * 0.45, rf * 0.05, x, y, rf * 1.08);
  fg.addColorStop(0, rgba(shade(bgRGB, 0.18)));
  fg.addColorStop(0.5, rgba(face));
  fg.addColorStop(1, rgba(shade(face, -0.45)));
  c.beginPath();
  c.arc(x, y, rf, 0, TAU);
  c.fillStyle = fg;
  c.fill();

  const color = o.color || (luminance(face) > 0.36 ? GLYPH_DARK : GLYPH_LIGHT);
  const lightGlyph = luminance(color) > 0.3;
  const gs = size * (size < 20 ? 0.64 : 0.6); // a slightly bigger glyph where the rim takes a bigger share
  paintGlyph(c, key, x, y, gs, {
    color,
    ink: lightGlyph ? rgba(shade(face, -0.35), 0.8) : 'rgba(255,255,255,0.45)',
    shadowColor: size >= 12 ? rgba(shade(face, -0.7)) : null,
    shadowOff: Math.max(0.45, size * 0.03),
    halo: 0,
  });

  // glass sheen across the upper face
  c.save();
  c.beginPath();
  c.arc(x, y, rf, 0, TAU);
  c.clip();
  const sg = c.createLinearGradient(0, y - rf, 0, y);
  sg.addColorStop(0, 'rgba(255,255,255,0.22)');
  sg.addColorStop(1, 'rgba(255,255,255,0)');
  c.beginPath();
  c.ellipse(x - rf * 0.12, y - rf * 0.52, rf * 0.92, rf * 0.58, 0, 0, TAU);
  c.fillStyle = sg;
  c.fill();
  c.restore();
  // specular glint on the rim
  c.beginPath();
  c.arc(x, y, r - rimW * 0.55, Math.PI * 1.1, Math.PI * 1.42);
  c.strokeStyle = 'rgba(255,252,235,0.8)';
  c.lineWidth = Math.max(0.7, size * 0.032);
  c.lineCap = 'round';
  c.stroke();

  // value pips: up to 5 studs along the bottom of the rim, the first `pips` of them lit
  const pips = Math.max(0, Math.min(5, Math.round(o.pips || 0)));
  if (pips > 0 && size >= 16) {
    const pr = Math.max(0.9, size * 0.045), rr = r - rimW * 0.5;
    for (let i = 0; i < 5; i++) {
      const a = Math.PI / 2 + (i - 2) * 0.36;
      const px = x - Math.cos(a) * rr, py = y + Math.sin(a) * rr; // left to right
      c.beginPath();
      c.arc(px, py, pr, 0, TAU);
      c.fillStyle = i < pips ? '#fff1b0' : rgba(shade(ring, -0.6));
      c.fill();
      c.lineWidth = Math.max(0.5, pr * 0.45);
      c.strokeStyle = 'rgba(30,20,6,0.85)';
      c.stroke();
    }
  }
}

/**
 * Medallions under 15px: the full bevel, sheen and engraving turn to mush at that size, so this is a filled disk
 * with a thin metal rim and a large, flat, single-colour glyph (tone parts kept, details dropped), clipped to the face.
 */
function paintSmallMedallion(c, key, x, y, size, bgRGB, face, ring, o) {
  const r = size / 2;
  const rimW = Math.max(1, size * 0.075);
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.6)';
  c.shadowBlur = 1.2;
  c.shadowOffsetY = 0.6;
  c.beginPath();
  c.arc(x, y, r - 0.3, 0, TAU);
  const rg = c.createLinearGradient(x - r, y - r, x + r * 0.7, y + r);
  rg.addColorStop(0, rgba(shade(ring, 0.5)));
  rg.addColorStop(0.5, rgba(ring));
  rg.addColorStop(1, rgba(shade(ring, -0.55)));
  c.fillStyle = rg;
  c.fill();
  c.restore();

  const rf = r - 0.3 - rimW;
  const fg = c.createLinearGradient(0, y - rf, 0, y + rf);
  fg.addColorStop(0, rgba(shade(bgRGB, 0.1)));
  fg.addColorStop(0.5, rgba(face));
  fg.addColorStop(1, rgba(shade(face, -0.35)));
  c.beginPath();
  c.arc(x, y, rf, 0, TAU);
  c.fillStyle = fg;
  c.fill();
  c.lineWidth = 0.6;
  c.strokeStyle = 'rgba(0,0,0,0.55)';
  c.stroke();

  const color = o.color || (luminance(face) > 0.36 ? GLYPH_DARK : GLYPH_LIGHT);
  c.save();
  c.beginPath();
  c.arc(x, y, rf, 0, TAU);
  c.clip();
  paintGlyph(c, key, x, y, size * 0.72, {
    color,
    flat: true,
    ink: null,
    shadowColor: luminance(color) > 0.3 ? rgba(shade(face, -0.75)) : null,
    shadowOff: 0.5,
    halo: 0,
  });
  c.restore();
}

function paintIcon(c, key, x, y, size, o) {
  if (o.medallion) {
    paintMedallion(c, key, x, y, size, o);
    return;
  }
  const color = o.color || GLYPH_LIGHT;
  paintGlyph(c, key, x, y, size, {
    color,
    ink: luminance(color) > 0.3 ? 'rgba(0,0,0,0.42)' : 'rgba(255,255,255,0.4)',
    shadowColor: null,
    shadowOff: 0,
    halo: o.shadow ? Math.max(2, size * 0.15) : 0,
  });
}

// ---------------------------------------------------------------- sprite cache
// Every (icon, size, device scale, colours, options) combination is painted once into an offscreen canvas and
// then blitted with drawImage, so a map full of medallions costs one image draw each.
const SPRITE_MAX = 1200;
const sprites = new Map(); // key -> {canvas, logical}

function newCanvas(w, h) {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  if (typeof document !== 'undefined') {
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    return cv;
  }
  return null;
}

function sprite(key, size, scale, o) {
  const id = `${key}|${size}|${scale}|${o.medallion ? 1 : 0}|${o.shadow ? 1 : 0}|${o.bg || ''}|${o.ring || ''}|${o.color || ''}|${o.pips || 0}`;
  let sp = sprites.get(id);
  if (sp) {
    sprites.delete(id); // LRU: move to the end
    sprites.set(id, sp);
    return sp;
  }
  const pad = Math.ceil(o.medallion ? size * 0.14 + 2 : o.shadow ? size * 0.18 + 2 : 1);
  const logical = size + pad * 2;
  const px = Math.max(1, Math.ceil(logical * scale));
  const canvas = newCanvas(px, px);
  const c = canvas && canvas.getContext('2d');
  if (!c) return null;
  c.scale(px / logical, px / logical);
  paintIcon(c, key, logical / 2, logical / 2, size, o);
  sp = { canvas, logical };
  sprites.set(id, sp);
  if (sprites.size > SPRITE_MAX) sprites.delete(sprites.keys().next().value);
  return sp;
}

/** Drop every cached sprite (e.g. after changing the art at runtime). */
export function clearIconCache() {
  sprites.clear();
}

/**
 * Draw an icon centred at (x, y), `size` px across (in the context's current units).
 * opts: medallion (default true), bg (face colour), ring (rim metal colour), color (glyph colour; auto-contrasts
 *       with the face when omitted), shadow (soft halo when medallion is false, default true),
 *       pips (0..5: lit value studs along the bottom of the rim; medallions of 16px and up).
 * Medallions under 15px switch to a simpler filled disk with a thin rim and a large flat glyph, so they stay legible.
 * Returns false when the id is unknown.
 */
export function drawIcon(ctx, id, x, y, size, opts = {}) {
  const key = resolve(id);
  if (!key || !(size > 0)) return !!key;
  const o = {
    medallion: opts.medallion ?? true,
    shadow: opts.shadow ?? true,
    bg: opts.bg || RAW[key].bg || DEFAULT_BG,
    ring: opts.ring || DEFAULT_RING,
    color: opts.color || '',
    pips: opts.pips || 0,
  };
  const t = typeof ctx.getTransform === 'function' ? ctx.getTransform() : null;
  const scale = t ? Math.hypot(t.a, t.b) || 1 : 1;
  const sizeB = Math.max(4, Math.round(size * 2) / 2);
  const scaleB = Math.max(0.25, Math.round(scale * 4) / 4);
  const sp = sizeB * scaleB <= 256 ? sprite(key, sizeB, scaleB, o) : null;
  if (!sp) {
    paintIcon(ctx, key, x, y, size, o); // huge or no offscreen canvas: paint directly
    return true;
  }
  let dx = x - sp.logical / 2, dy = y - sp.logical / 2;
  if (t && t.b === 0 && t.c === 0 && t.a > 0 && t.d > 0) {
    // snap to the device pixel grid so the sprite stays crisp
    dx = (Math.round(t.a * dx + t.e) - t.e) / t.a;
    dy = (Math.round(t.d * dy + t.f) - t.f) / t.d;
  }
  ctx.drawImage(sp.canvas, dx, dy, sp.logical, sp.logical);
  return true;
}

/** Ids of all drawable icons (canonical + aliases). */
export const ICON_IDS = Object.keys(ICONS);
