import type { GridCore, TileId, TileWindow, Point, Bounds } from '../../core-types/src/map';

const bits = new DataView(new ArrayBuffer(8));
bits.setBigUint64(0, 0x3ffbb67ae8584caan);
export const SQRT3 = bits.getFloat64(0);
const SQRT3_OVER_3 = SQRT3 / 3;
export const DIRECTIONS: readonly Point[] = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];

export function rhaz(value: number): number {
  const magnitude = Math.abs(value);
  const integral = Math.floor(magnitude);
  const rounded = integral + Number(magnitude - integral >= 0.5);
  return rounded === 0 ? 0 : value < 0 ? -rounded : rounded;
}

export function tileId(grid: GridCore, col: number, row: number): TileId | null {
  if (!Number.isInteger(col) || !Number.isInteger(row) || col < 0 || col >= grid.cols || row < 0 || row >= grid.rows) return null;
  return (row * grid.cols + col) as TileId;
}

export function center(grid: GridCore, col: number, row: number): Point {
  return [grid.originX + (SQRT3 * grid.radiusM) * (col + 0.5 * (row & 1)),
    grid.originY + (1.5 * grid.radiusM) * row];
}

export function tileCenter(grid: GridCore, id: TileId): Point {
  return center(grid, id % grid.cols, Math.floor(id / grid.cols));
}

export function pickTile(grid: GridCore, x: number, y: number): TileId | null {
  const px = (x - grid.originX) / grid.radiusM;
  const py = (y - grid.originY) / grid.radiusM;
  const qf = SQRT3_OVER_3 * px - py / 3;
  const rf = (2 * py) / 3;
  const sf = (-qf) - rf;
  let q = rhaz(qf), r = rhaz(rf);
  const s = rhaz(sf);
  const dq = Math.abs(q - qf), dr = Math.abs(r - rf), ds = Math.abs(s - sf);
  if (dq > dr && dq > ds) q = -r - s;
  else if (dr > ds) r = -q - s;
  return tileId(grid, q + (r - (r & 1)) / 2, r);
}

export function indexInWindow(grid: GridCore, window: TileWindow, id: TileId): number {
  if (!Number.isInteger(id) || id < 0 || id >= grid.cols * grid.rows) return -1;
  const col = id % grid.cols - window.col0;
  const row = Math.floor(id / grid.cols) - window.row0;
  return col >= 0 && row >= 0 && col < window.cols && row < window.rows ? row * window.cols + col : -1;
}

export function gridBounds(grid: GridCore, window: TileWindow): Bounds {
  const [x, y] = center(grid, window.col0, window.row0);
  const [lastX, lastY] = center(grid, window.col0 + window.cols - 1, window.row0 + window.rows - 1);
  const halfWidth = grid.radiusM * SQRT3 / 2;
  return [x - halfWidth * (1 + (window.row0 & 1)), y - grid.radiusM,
    lastX + halfWidth * (2 - ((window.row0 + window.rows - 1) & 1)), lastY + grid.radiusM];
}
