// Adapter: ChinaCiv RenderView (metres, y up, odd-r pointy hexes) → the USACiv world model (km, y down, the same
// odd-r pointy layout, cell index row*cols+col). The vendored USACiv painters (./usaciv, MIT) then draw it.
//
// Everything this file derives is VISUAL DERIVATION of the synthetic fixture: land cover, relief classes, coastal
// depth, synthetic provinces (合成分区), road/rail hex links and lens definitions. None of it is real Chinese
// geography, administrative division or statistics.
import { Terrain, type CityVisual, type Point, type RenderView, type TileId } from '../../core-types/src/map';
import { pickTile } from '../../hexgrid/src/grid';
import { COVER, hash01, prepareWorld, type PreparedWorld } from './usaciv/index';

export const FOREIGN = -2;
export const WATER = -1;
/** City art (size class, skyline, metro spill, banner floor) is keyed to population thresholds tuned for the U.S.
 * dataset (largest metro 20M). The synthetic basin's towns are ~20× smaller, so the ART uses population × this
 * factor. Every number shown to the user stays the fixture's own value. */
export const ART_POPULATION_SCALE = 4;

/** Synthetic provinces. Seeds are in fixture km (x east, y north). Names are invented for the synthetic basin. */
export const PROVINCES = [
  { abbr: '澜', name: '澜东', pinyin: 'landong', seeds: [[430, -40]] },
  { abbr: '泽', name: '云泽', pinyin: 'yunze', seeds: [[-270, 90]] },
  { abbr: '岭', name: '横岭', pinyin: 'hengling', seeds: [[0, 420]] },
  { abbr: '麓', name: '南麓', pinyin: 'nanlu', seeds: [[60, -430]] },
  { abbr: '望', name: '望海', pinyin: 'wanghai', seeds: [[640, 390]] },
  { abbr: '石', name: '石门', pinyin: 'shimen', seeds: [[-720, -200]] },
  { abbr: '原', name: '西原', pinyin: 'xiyuan', seeds: [[-1280, 260]] },
  { abbr: '陵', name: '北陵', pinyin: 'beiling', seeds: [[-620, 860]] },
  { abbr: '屿', name: '海屿', pinyin: 'haiyu', seeds: [[1040, -330], [1450, 410]] },
] as const;
/** Land outside this box (fixture km) is drawn as neighbouring land under fog, like Canada/Mexico in USACiv. */
export const REGION_BOX = [-1760, -1060, 1560, 1120] as const;

export const COVER_NAMES: Record<number, string> = {
  0: '未知', 1: '阔叶林', 2: '针叶林', 3: '混交林', 4: '灌丛荒漠', 5: '草地', 6: '牧草地', 7: '耕地', 8: '湿地',
  9: '城镇', 10: '裸地', 11: '冰雪',
};
export const RELIEF_NAMES = ['平地', '丘陵', '山地', '高山'];
const RIVER_NAMES = ['青澜河', '鹤溪', '松江', '南汀河', '望海河'];

export interface UsaLensDef {
  id: string; name: string; unit: string; scale: 'log' | 'linear'; domain: [number, number]; ramp: string[];
  values: (number | null)[]; format: string; higher_is: string;
}

export interface UsaCity {
  id: string; name: string; full: string; states: string[]; metro: boolean; capital: boolean; x: number; y: number;
  cell: number; population: number; popLabel: string; employed: null; yields: Record<string, number | null>;
  growth: null; footprint: number[]; source: CityVisual;
}

export interface UsaScene {
  w: PreparedWorld;
  cities: UsaCity[];
  /** Cities in the fixture's order (index = CityVisual.id). */
  cityById: UsaCity[];
  yields: { key: string; icon: string; label: string; color: string; unit: string }[];
  nation: { yields: UsaScene['yields'] };
  lenses: Record<'population' | 'economy', UsaLensDef>;
  infra: { roads: [number, number, number][]; rail: [number, number, number][] };
  /** Per network line (index = lineId): the hex-centre path it is drawn along, in fixture metres. */
  routePaths: Point[][];
  worldW: number; worldH: number;
  toKm(p: Point): Point;
  toM(p: Point): Point;
  cellOfTile(tile: TileId): number;
  tileOfCell(cell: number): TileId;
  province(tile: TileId): { name: string; foreign: boolean } | null;
  coverOf(tile: TileId): number;
  reliefOf(tile: TileId): number;
  totals: { population: number; economy: number; towns: number };
}

// Smooth value noise (deterministic), for coherent patches of land cover and organic province borders.
function lattice(x: number, y: number, salt: number) {
  return hash01((x * 73856093) ^ (y * 19349663), salt);
}
function noise(x: number, y: number, salt: number) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = lattice(ix, iy, salt), b = lattice(ix + 1, iy, salt), c = lattice(ix, iy + 1, salt), d = lattice(ix + 1, iy + 1, salt);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export const popLabel = (n: number) => n >= 1e8 ? `${(n / 1e8).toFixed(1)}亿` : n >= 1e5 ? `${(n / 1e4).toFixed(n >= 1e6 ? 0 : 1)}万`
  : n >= 1e4 ? `${(n / 1e4).toFixed(1)}万` : String(Math.round(n));

function percentile(values: number[], p: number) {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.round((s.length - 1) * p)))];
}

export function buildUsaScene(view: RenderView): UsaScene {
  const g = view.grid;
  const { cols, rows } = g;
  if (view.window.col0 !== 0 || view.window.row0 !== 0 || view.window.cols !== cols || view.window.rows !== rows)
    throw new Error('USACiv adapter expects the full grid window.');
  if ((rows - 1) & 1) throw new Error('USACiv adapter needs an odd row count so the odd-r parity survives the y flip.');
  const R = g.radiusM / 1000, Wc = Math.sqrt(3) * R, Hc = 1.5 * R;
  const n = cols * rows;
  const yTop = g.originY + 1.5 * g.radiusM * (rows - 1);
  const toKm = ([x, y]: Point): Point => [(x - g.originX) / 1000, (yTop - y) / 1000];
  const toM = ([x, y]: Point): Point => [x * 1000 + g.originX, yTop - y * 1000];
  const cellOfTile = (tile: TileId) => (rows - 1 - Math.floor(tile / cols)) * cols + (tile % cols);
  const tileOfCell = (cell: number) => ((rows - 1 - Math.floor(cell / cols)) * cols + (cell % cols)) as TileId;
  const fixtureKm = (cell: number): Point => { const [x, y] = toM([Wc * ((cell % cols) + 0.5 * (Math.floor(cell / cols) & 1)), Hc * Math.floor(cell / cols)]); return [x / 1000, y / 1000]; };

  const owner = new Int16Array(n).fill(WATER);
  const elev = new Int32Array(n), elevMax = new Int32Array(n), water = new Uint8Array(n);
  const relief = new Uint8Array(n), cover = new Uint8Array(n);
  const pctKeys = ['forest', 'crop', 'pasture', 'grass', 'shrub', 'wetland', 'developed'] as const;
  const pct = Object.fromEntries(pctKeys.map(k => [k, new Uint8Array(n)])) as Record<typeof pctKeys[number], Uint8Array>;

  // --- land, provinces, cover, relief ---
  for (let tile = 0; tile < n; tile++) {
    const i = view.tileIndex(tile as TileId), u = cellOfTile(tile as TileId);
    if (!view.land[i]) continue;
    const t = view.terrain[i];
    if (t === Terrain.Lake) { water[u] = 3; elev[u] = -25; continue; }
    const [x, y] = fixtureKm(u);
    const foreign = y > REGION_BOX[3] || x < REGION_BOX[0] || x > REGION_BOX[2] || y < REGION_BOX[1];
    if (foreign) owner[u] = FOREIGN;
    else {
      let best = 0, bestD = Infinity;
      PROVINCES.forEach((p, k) => {
        for (const [sx, sy] of p.seeds) {
          const d = Math.hypot(x - sx, y - sy) + (noise(x / 150, y / 150, 31 + k) - 0.5) * 210;
          if (d < bestD) { bestD = d; best = k; }
        }
      });
      owner[u] = best;
    }
    const e = view.elevation[i];
    elev[u] = e;
    const h = hash01(u, 3), patch = noise(x / 55, y / 55, 11) * 0.72 + h * 0.28;
    let rel = 0, cv: number = COVER.CROP;
    switch (t) {
      case Terrain.Glacier: rel = 3; cv = patch < 0.35 ? COVER.ICE : COVER.BARREN; break;
      case Terrain.HighMountain: rel = e > 3250 ? 3 : 2; cv = patch < 0.5 ? COVER.EVERGREEN : COVER.BARREN; break;
      case Terrain.Mountain: rel = 2; cv = patch < 0.62 ? COVER.EVERGREEN : patch < 0.85 ? COVER.MIXED : COVER.SCRUB; break;
      case Terrain.Plateau: rel = patch < 0.45 ? 1 : 0; cv = patch < 0.55 ? COVER.GRASS : COVER.SCRUB; break;
      case Terrain.Hills: rel = 1; cv = patch < 0.38 ? COVER.DECIDUOUS : patch < 0.62 ? COVER.MIXED : patch < 0.8 ? COVER.PASTURE : COVER.CROP; break;
      case Terrain.Desert: rel = 0; cv = patch < 0.7 ? COVER.SCRUB : COVER.BARREN; break;
      case Terrain.Wetland: rel = 0; cv = COVER.WETLAND; break;
      case Terrain.Grassland: rel = 0; cv = patch < 0.55 ? COVER.GRASS : patch < 0.85 ? COVER.PASTURE : COVER.DECIDUOUS; break;
      default: rel = 0; cv = patch < 0.6 ? COVER.CROP : patch < 0.74 ? COVER.PASTURE : patch < 0.9 ? COVER.DECIDUOUS : COVER.GRASS;
    }
    relief[u] = rel; cover[u] = cv;
    elevMax[u] = e + (rel >= 3 ? 700 + 900 * h : rel === 2 ? 350 + 600 * h : rel === 1 ? 120 + 180 * h : 20 + 40 * h);
    const main = 58 + Math.round(30 * hash01(u, 5));
    const group = cv === COVER.DECIDUOUS || cv === COVER.EVERGREEN || cv === COVER.MIXED ? 'forest' : cv === COVER.CROP ? 'crop'
      : cv === COVER.PASTURE ? 'pasture' : cv === COVER.GRASS ? 'grass' : cv === COVER.SCRUB || cv === COVER.BARREN ? 'shrub'
        : cv === COVER.WETLAND ? 'wetland' : null;
    if (group) pct[group][u] = main;
    const second = group === 'forest' ? 'pasture' : group === 'crop' ? 'forest' : group === 'shrub' ? 'grass' : 'forest';
    if (group !== second) pct[second][u] = Math.max(0, 100 - main - 6);
  }

  // --- water depth: hex steps from land (coast = next to land) ---
  const grid = { cols, rows };
  const neighbour = (i: number, d: number) => {
    const c = i % cols, r = Math.floor(i / cols);
    const NB = r & 1 ? [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]] : [[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]];
    const nc = c + NB[d][0], nr = r + NB[d][1];
    return nc < 0 || nr < 0 || nc >= grid.cols || nr >= grid.rows ? -1 : nr * cols + nc;
  };
  const dist = new Int16Array(n).fill(-1);
  const queue = new Int32Array(n);
  let qh = 0, qt = 0;
  for (let u = 0; u < n; u++) if (owner[u] !== WATER) { dist[u] = 0; queue[qt++] = u; }
  while (qh < qt) {
    const u = queue[qh++];
    for (let d = 0; d < 6; d++) { const j = neighbour(u, d); if (j >= 0 && dist[j] < 0 && water[j] !== 3) { dist[j] = dist[u] + 1; queue[qt++] = j; } }
  }
  for (let u = 0; u < n; u++) {
    if (owner[u] !== WATER || water[u] === 3) continue;
    const k = Math.max(1, dist[u]);
    water[u] = k <= 1 ? 2 : 1;
    elev[u] = Math.max(-4000, -Math.round(60 + (k - 1) * 230 + 300 * hash01(u, 9)));
  }

  // --- cities: banner anchors, art population, urban footprint ---
  const cityById: UsaCity[] = view.cities.map(c => {
    const cell = cellOfTile(c.anchorTile);
    const [x, y] = toKm([c.anchorX, c.anchorY]);
    const footprint = [cell];
    const ring = c.population >= 7e5 ? 6 : c.population >= 4e5 ? 4 : c.population >= 2.5e5 ? 2 : c.population >= 1.2e5 ? 1 : 0;
    const order = [0, 1, 2, 3, 4, 5].sort((a, b) => hash01(cell, 40 + a) - hash01(cell, 40 + b));
    for (const d of order.slice(0, ring)) {
      const j = neighbour(cell, d);
      if (j >= 0 && owner[j] >= 0) footprint.push(j);
    }
    for (const j of footprint) {
      cover[j] = COVER.URBAN;
      pct.developed[j] = j === cell ? 70 : 38 + Math.round(20 * hash01(j, 12));
    }
    const prov = owner[cell] >= 0 ? PROVINCES[owner[cell]] : null;
    return {
      id: String(c.id), name: c.label, full: `${c.pinyin.toUpperCase()} · ${prov ? prov.name : '邻境'}（合成）`,
      states: prov ? [prov.abbr] : [], metro: true, capital: false, x, y, cell,
      population: c.population * ART_POPULATION_SCALE, popLabel: popLabel(c.population), employed: null,
      yields: { gold: c.economy * 1e8, food: c.population }, growth: null, footprint, source: c,
    };
  });
  const cities = [...cityById].sort((a, b) => b.population - a.population);

  // --- roads and rail: the fixture polylines rasterised onto hex links (like USACiv's infrastructure.json) ---
  const toCube = (cell: number) => { const c = cell % cols, r = Math.floor(cell / cols); const q = c - (r - (r & 1)) / 2; return [q, r, -q - r]; };
  const fromCube = (q: number, r: number) => r * cols + (q + (r - (r & 1)) / 2);
  const roundCube = (q: number, r: number, s: number) => {
    let rq = Math.round(q), rr = Math.round(r); const rs = Math.round(s);
    const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s);
    if (dq > dr && dq > ds) rq = -rr - rs; else if (dr > ds) rr = -rq - rs;
    return [rq, rr];
  };
  const roads: [number, number, number][] = [], rail: [number, number, number][] = [];
  const seen = { road: new Set<string>(), rail: new Set<string>() };
  const routePaths: Point[][] = view.network.map(line => {
    const cells: number[] = [];
    const push = (cell: number) => { if (cell >= 0 && cells[cells.length - 1] !== cell) cells.push(cell); };
    for (let k = 1; k < line.points.length; k++) {
      const a = line.points[k - 1], b = line.points[k];
      const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3000));
      for (let s = 0; s <= steps; s++) {
        const t = pickTile(g, a[0] + (b[0] - a[0]) * s / steps, a[1] + (b[1] - a[1]) * s / steps);
        if (t !== null) push(cellOfTile(t));
      }
    }
    const path: number[] = [];
    for (const cell of cells) {
      const prev = path[path.length - 1];
      if (prev !== undefined) {
        const [aq, ar, as] = toCube(prev), [bq, br, bs] = toCube(cell);
        const N = Math.max(Math.abs(aq - bq), Math.abs(ar - br), Math.abs(as - bs));
        for (let k = 1; k < N; k++) {
          const [q, r] = roundCube(aq + (bq - aq) * k / N + 1e-6, ar + (br - ar) * k / N + 1e-6, as + (bs - as) * k / N - 2e-6);
          const mid = fromCube(q, r);
          if (mid !== path[path.length - 1]) path.push(mid);
        }
      }
      if (cell !== path[path.length - 1]) path.push(cell);
    }
    const list = line.mode0 === 'rail' ? rail : roads, set = line.mode0 === 'rail' ? seen.rail : seen.road;
    for (let k = 1; k < path.length; k++) {
      const a = Math.min(path[k - 1], path[k]), b = Math.max(path[k - 1], path[k]), key = `${a},${b}`;
      if (!set.has(key)) { set.add(key); list.push([a, b, 0]); }
    }
    return path.map(cell => toM([Wc * ((cell % cols) + 0.5 * (Math.floor(cell / cols) & 1)), Hc * Math.floor(cell / cols)]));
  });

  // --- rivers ---
  const rivers = view.rivers.map((pts, k) => ({
    name: RIVER_NAMES[k] ?? `河流 ${k + 1}`, rank: k === 0 ? 1 : 4,
    pts: pts.flatMap(p => toKm(p) as unknown as number[]),
  }));

  const world = {
    version: 2, grid: { radius: R, cols, rows }, width: Wc * (cols + 0.5), height: Hc * (rows - 1), margin: 0,
    owner: Array.from(owner), county: new Array(n).fill(-1), elev: Array.from(elev), elev_max: Array.from(elevMax),
    water: Array.from(water), relief: Array.from(relief), cover: Array.from(cover),
    pct: Object.fromEntries(pctKeys.map(k => [k, Array.from(pct[k])])),
    states: PROVINCES.map((p, k) => ({ fips: String(k), abbr: p.abbr, name: p.name })),
    counties: [], rivers,
  };
  const w = prepareWorld(world, cities);

  // --- lenses (USACiv lens contract: per-cell values, null = no data) ---
  const lensValues = (src: Float32Array) => {
    const values: (number | null)[] = new Array(n).fill(null);
    const all: number[] = [];
    for (let tile = 0; tile < n; tile++) {
      const i = view.tileIndex(tile as TileId), u = cellOfTile(tile as TileId);
      if (owner[u] < 0 || !view.valid[i]) continue;
      values[u] = src[i]; all.push(src[i]);
    }
    return { values, all };
  };
  const pop = lensValues(view.population), eco = lensValues(view.economy);
  const lenses = {
    population: { id: 'population', name: '人口密度', unit: '人/km²', scale: 'log' as const, format: 'float', higher_is: 'neutral',
      domain: [Math.max(0.5, percentile(pop.all, 0.02)), percentile(pop.all, 0.98)] as [number, number],
      ramp: ['#1b1035', '#4b2377', '#9a3b8a', '#e0645e', '#f9b24a', '#fff3a8'], values: pop.values },
    economy: { id: 'economy', name: '经济活动', unit: '合成指数', scale: 'log' as const, format: 'float', higher_is: 'good',
      domain: [Math.max(0.5, percentile(eco.all, 0.02)), percentile(eco.all, 0.98)] as [number, number],
      ramp: ['#3a1c0b', '#7a4413', '#b8781f', '#e3b23c', '#f6e27f', '#fffbe0'], values: eco.values },
  };

  const yields = [
    { key: 'food', icon: 'pop', label: '人口', color: '#e8dcb4', unit: 'people' },
    { key: 'gold', icon: 'y-gold', label: '经济', color: '#f2c94c', unit: 'cny' },
  ];
  return {
    w, cities, cityById, yields, nation: { yields }, lenses, infra: { roads, rail }, routePaths,
    worldW: world.width, worldH: world.height, toKm, toM, cellOfTile, tileOfCell,
    province: tile => {
      const o = owner[cellOfTile(tile)];
      return o >= 0 ? { name: PROVINCES[o].name, foreign: false } : o === FOREIGN ? { name: '邻境', foreign: true } : null;
    },
    coverOf: tile => cover[cellOfTile(tile)],
    reliefOf: tile => relief[cellOfTile(tile)],
    totals: {
      population: view.cities.reduce((a, c) => a + c.population, 0),
      economy: view.cities.reduce((a, c) => a + c.economy, 0),
      towns: view.cities.length,
    },
  };
}
