import { Terrain, type Bounds, type CameraView, type CityId, type CityVisual, type GridCore, type LineId,
  type NetworkVisual, type Point, type RenderView, type ScalarTexture } from '../../core-types/src/map';
import { center, gridBounds, indexInWindow, pickTile } from '../../hexgrid/src/grid';

export const DEFAULT_VIEW: CameraView = { x: 265000, y: 55000, width: 1880000 };
const SEED = 281137;
export const GRID_CORE: GridCore = {
  aoiId: 'qinglan-procedural-fixture-281137',
  aoiSha256: 'sha256:46970d7ddd8dd0ef3060aa34f297c2fcc76e598aa1aa7bdc7d5f28cf1ab64409',
  chunkSize: 32, cols: 260, rows: 317, layout: 'odd-r', orientation: 'pointy',
  originX: -2700000, originY: -2844000, radiusM: 12000,
  proj: 'fixture:cartesian-m',
};
const GRID_HASH = 'sha256:9ebb7d97be51175873652566e6f513f9fba0bdeede1a3de35692c610821e9817';

const clamp = (x: number, low = 0, high = 1) => Math.max(low, Math.min(high, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };

export function cellNoise(x: number, y: number): number {
  let n = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ SEED;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function noise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const u = smooth(x - ix), v = smooth(y - iy);
  return lerp(lerp(cellNoise(ix, iy), cellNoise(ix + 1, iy), u),
    lerp(cellNoise(ix, iy + 1), cellNoise(ix + 1, iy + 1), u), v);
}

const oval = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) =>
  1 - Math.hypot((x - cx) / rx, (y - cy) / ry);
const bell = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) => {
  const dx = (x - cx) / rx, dy = (y - cy) / ry;
  return Math.exp(-dx * dx - dy * dy);
};

function coastDistance(x: number, y: number): number {
  const main = oval(x, y, -615, 135, 1530, 1160);
  const headland = oval(x, y, 704, -184, 242, 270);
  const island = oval(x, y, 1035, -327, 132, 146);
  const farIsland = oval(x, y, 1450, 410, 245, 415);
  const northeast = oval(x, y, 300, 1560, 705, 800);
  const inlet = oval(x, y, 858, 278, 268, 157);
  const delta = oval(x, y, 865, -476, 175, 74);
  const fringe = (noise(x / 115, y / 115) - 0.5) * 0.19 + (noise(x / 28, y / 28) - 0.5) * 0.034;
  return Math.max(Math.min(Math.max(main, headland, northeast), -Math.max(inlet, delta)), island, farIsland) + fringe;
}

function lakeDistance(x: number, y: number): number {
  return Math.max(oval(x, y, -334, 105, 103, 60), oval(x, y, -295, 143, 56, 76),
    oval(x, y, 407, -260, 77, 48)) + (noise(x / 33, y / 33) - 0.5) * 0.22;
}

function riverY(x: number): number {
  return 84 - (x + 340) * 0.15 + 44 * Math.sin((x + 47) / 125) + 15 * Math.sin(x / 45);
}

function altitude(x: number, y: number): number {
  const north = 0.88 * bell(x, y, -120, 415 + 0.28 * x, 460, 141);
  const west = 1.03 * bell(x, y, -619, 95, 238, 530);
  const south = 0.89 * bell(x, y, 65, -365 + 0.18 * x, 385, 142);
  const ridges = 0.48 * bell(x, y, 535, 320, 257, 172);
  const folds = 0.59 + 0.5 * noise(x / 101, y / 84) + 0.35 * noise((x + y) / 47, y / 68);
  return clamp((north + west + south + ridges) * folds + 0.14 * noise(x / 78, y / 69)
    - 0.10 * bell(x, y, 180, riverY(x), 820, 110));
}

const places = [
  ['临川', 'linchuan', 245, 42, 936000, 1820, '青澜河中游的枢纽城镇，向东连接三角洲与港口。'],
  ['云津', 'yunjin', -185, 151, 518000, 840, '云泽湖东岸的渡口，连接西部山口与中部平原。'],
  ['鹤岭', 'heling', 52, 330, 362000, 460, '坐落在横岭南麓，沿河谷通往青澜河中游。'],
  ['澜浦', 'lanpu', 659, -126, 763000, 1435, '位于青澜河口，铁路与沿岸道路在此交会。'],
  ['青原', 'qingyuan', 333, 264, 484000, 697, '横岭以东的丘陵城镇，沿公路连接河谷。'],
  ['南汀', 'nanting', 515, -311, 329000, 512, '湖滨与南部丘陵之间的城镇。'],
  ['石门', 'shimen', -492, -104, 284000, 315, '山口外的聚落，汇集西部低地的道路。'],
  ['松渡', 'songdu', -164, -192, 295000, 385, '山前渡口，连接南部山地和青澜河谷。'],
  ['望海', 'wanghai', 661, 390, 392000, 663, '海湾北岸的丘陵聚落。'],
  ['白屿', 'baiyu', 1045, -328, 112000, 183, '外海岛上的聚落。'],
] as const;

function makeTexture(bounds: Bounds, width: number, height: number, sample: (x: number, y: number) => number): ScalarTexture {
  const values = new Uint8Array(width * height);
  for (let row = 0; row < height; row++) for (let col = 0; col < width; col++) {
    const x = lerp(bounds[0], bounds[2], (col + 0.5) / width) / 1000;
    const y = lerp(bounds[1], bounds[3], (row + 0.5) / height) / 1000;
    values[row * width + col] = Math.round(clamp(sample(x, y)) * 255);
  }
  return { width, height, values, bounds };
}

function meters(x: number, y: number): Point { return [x * 1000, y * 1000]; }

function curve(points: readonly Point[]): Point[] {
  const result: Point[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[Math.max(0, i - 1)], b = points[i], c = points[i + 1], d = points[Math.min(i + 2, points.length - 1)];
    for (let step = 0; step < 9; step++) {
      const t = step / 9, t2 = t * t, t3 = t2 * t;
      const value = (axis: 0 | 1) => 0.5 * ((2 * b[axis]) + (-a[axis] + c[axis]) * t
        + (2 * a[axis] - 5 * b[axis] + 4 * c[axis] - d[axis]) * t2
        + (-a[axis] + 3 * b[axis] - 3 * c[axis] + d[axis]) * t3);
      result.push(meters(value(0), value(1)));
    }
  }
  const last = points[points.length - 1];
  result.push(meters(...last));
  return result;
}

export function createFixture(): RenderView {
  const grid = { ...GRID_CORE, gridHash: GRID_HASH };
  const window = { col0: 0, row0: 0, cols: grid.cols, rows: grid.rows };
  const bounds = gridBounds(grid, window);
  const count = window.cols * window.rows;
  const terrain = new Uint8Array(count), land = new Uint8Array(count), elevation = new Uint16Array(count);
  const population = new Float32Array(count), economy = new Float32Array(count), valid = new Uint8Array(count);
  for (let row = 0; row < window.rows; row++) for (let col = 0; col < window.cols; col++) {
    const i = row * window.cols + col;
    const [mx, my] = center(grid, col, row), x = mx / 1000, y = my / 1000;
    const coast = coastDistance(x, y);
    if (coast < 0) continue;
    land[i] = 1;
    if (lakeDistance(x, y) > 0) { terrain[i] = Terrain.Lake; continue; }
    const h = altitude(x, y), n = noise(x / 110, y / 116);
    elevation[i] = Math.round(45 + h * 3520);
    terrain[i] = h > 0.94 ? Terrain.Glacier : h > 0.78 ? Terrain.HighMountain : h > 0.57 ? Terrain.Mountain
      : h > 0.45 && x < -580 ? Terrain.Plateau : h > 0.31 ? Terrain.Hills : n < 0.21 && x < -310 ? Terrain.Desert
        : coast < 0.055 && n > 0.50 ? Terrain.Wetland : n > 0.53 ? Terrain.Grassland : Terrain.Plain;
    const urban = places.reduce((max, town) => Math.max(max, bell(x, y, town[2], town[3], 105, 91) * town[4] / 950000), 0);
    population[i] = Math.round((2 + 75 * (1 - h) ** 3 * n + 620 * urban) * 10) / 10;
    economy[i] = Math.round((4 + 18 * n + 165 * urban ** 1.55 + (coast < 0.10 ? 8 : 0)) * 10) / 10;
    valid[i] = cellNoise(col + 7, row + 51) > 0.045 && !(x > 970 && y < -250) ? 1 : 0;
  }

  const cities: CityVisual[] = places.map(([label, pinyin, x, y, pop, gdp, description], id) => {
    const [anchorX, anchorY] = meters(x, y);
    const anchorTile = pickTile(grid, anchorX, anchorY);
    if (anchorTile === null || !land[anchorTile] || terrain[anchorTile] === Terrain.Lake) throw new Error(`Invalid fixture anchor: ${label}`);
    return { id: id as CityId, anchorTile, anchorX, anchorY, label, pinyin, population: pop,
      economy: gdp, primary: id < 9, description };
  });
  const routes = [
    ['青澜铁路', 'rail', [[-185, 151], [-95, 100], [37, 98], [155, 67], [245, 42], [369, 34], [510, -65], [659, -126]]],
    ['横岭公路', 'road', [[52, 330], [119, 278], [217, 276], [333, 264], [386, 164], [382, 101], [245, 42]]],
    ['南麓公路', 'road', [[-492, -104], [-322, -113], [-164, -192], [-50, -145], [66, -108], [245, 42]]],
    ['滨海公路', 'road', [[515, -311], [583, -247], [659, -126], [753, -58], [767, 76], [620, 162], [530, 259], [661, 390]]],
    ['云津山道', 'road', [[-492, -104], [-477, 5], [-440, 82], [-410, 186], [-326, 234], [-185, 151]]],
  ] as const;
  const network: NetworkVisual[] = routes.map(([name, mode0, points], id) => ({
    name, mode0, lineId: id as LineId, edgeKind: 'link', kind: 'fixture-default', status: 'active', points: curve(points),
  }));
  const mainRiver = Array.from({ length: 155 }, (_, i) => {
    const x = -465 + i * 8;
    return meters(x, riverY(x));
  });
  const rivers = [mainRiver,
    curve([[-110, 501], [-67, 400], [2, 338], [28, 262], [89, 216], [104, 153], [118, riverY(118)]]),
    curve([[-368, -429], [-307, -323], [-222, -288], [-191, -188], [-95, -118], [-76, -29], [-49, riverY(-49)]]),
    curve([[440, -260], [473, -214], [464, -184], [489, -129], [460, -82], [465, riverY(465)]]),
    curve([[379, 440], [362, 355], [434, 296], [436, 218], [516, 177], [608, 119], [708, 82], [768, 71], [850, 79]]),
  ];
  const regions = [
    { name: '横 岭 山 脉', point: meters(-54, 484) },
    { name: '云 泽 湖', point: meters(-323, 105) },
    { name: '青 澜 平 原', point: meters(311, -171) },
    { name: '南 麓 丘 陵', point: meters(98, -414) },
    { name: '东 澜 海', point: meters(1103, 44) },
  ];
  const relief = makeTexture(bounds, 650, 684, (x, y) => {
    const h = altitude(x, y), east = altitude(x + 7, y), north = altitude(x, y + 7);
    return 0.48 + h * 0.26 + clamp((h - east + north - h) * 6.5, -0.25, 0.25);
  });
  const coast = makeTexture(bounds, 900, 944, (x, y) => 0.5 + coastDistance(x, y) * 1.4);
  return { grid, window, bounds, tileIndex: id => indexInWindow(grid, window, id), terrain, land, elevation,
    population, economy, valid, relief, coast, cities, network, rivers, regions };
}
