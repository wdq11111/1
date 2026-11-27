// Pointy-top hex grid, "odd-r" offset layout, map km with y down.
// Mirrors pipeline/core/hexgrid.py – keep the two in sync.

export const SQRT3 = Math.sqrt(3);

// Directions: 0 E, 1 SE, 2 SW, 3 W, 4 NW, 5 NE. Edge d runs from corner d to corner d+1.
const NEIGHBOURS = [
  [[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]], // even rows
  [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]], // odd rows
];

export function makeGrid({ radius: R, cols, rows }) {
  const W = SQRT3 * R;
  const H = 1.5 * R;
  const corners = [];
  for (let k = 0; k < 6; k++) {
    const a = ((60 * k - 30) * Math.PI) / 180;
    corners.push([R * Math.cos(a), R * Math.sin(a)]);
  }
  return {
    R, W, H, cols, rows, size: cols * rows, corners,
    cx(i) { const r = (i / cols) | 0; return W * ((i % cols) + 0.5 * (r & 1)); },
    cy(i) { return H * ((i / cols) | 0); },
    neighbour(i, d) {
      const c = i % cols, r = (i / cols) | 0;
      const [dc, dr] = NEIGHBOURS[r & 1][d];
      const nc = c + dc, nr = r + dr;
      return nc < 0 || nr < 0 || nc >= cols || nr >= rows ? -1 : nr * cols + nc;
    },
    cellAt(x, y) {
      const q = ((SQRT3 / 3) * x - y / 3) / R;
      const r = ((2 / 3) * y) / R;
      let rx = Math.round(q), rz = Math.round(r);
      const ry = Math.round(-q - r);
      const dx = Math.abs(rx - q), dy = Math.abs(ry - (-q - r)), dz = Math.abs(rz - r);
      if (dx > dy && dx > dz) rx = -ry - rz;
      else if (dy <= dz) rz = -rx - ry;
      const row = rz, col = rx + ((row - (row & 1)) >> 1);
      return col < 0 || row < 0 || col >= cols || row >= rows ? -1 : row * cols + col;
    },
    // Inclusive range of cell rows/cols touching a world-space rectangle.
    range(x0, y0, x1, y1) {
      return {
        r0: Math.max(0, Math.floor(y0 / H) - 1), r1: Math.min(rows - 1, Math.ceil(y1 / H) + 1),
        c0: Math.max(0, Math.floor(x0 / W) - 1), c1: Math.min(cols - 1, Math.ceil(x1 / W) + 1),
      };
    },
  };
}

// Cheap deterministic per-cell pseudo-random in [0, 1).
export function hash01(i, salt = 0) {
  let h = (i * 374761393 + salt * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
