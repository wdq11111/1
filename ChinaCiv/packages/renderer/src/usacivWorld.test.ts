import { beforeAll, expect, it } from 'vitest';
import type { TileId } from '../../core-types/src/map';
import { tileCenter } from '../../hexgrid/src/grid';
import { createFixture } from '../../test-utils/src/fixture';
import { buildUsaScene, FOREIGN, PROVINCES, type UsaScene } from './usacivWorld';

const map = createFixture();
let scene: UsaScene;
beforeAll(() => { scene = buildUsaScene(map); });

it('maps every tile onto the USACiv grid with the same centre (y flipped, odd-r parity kept)', () => {
  const g = scene.w.grid;
  expect(g.size).toBe(map.grid.cols * map.grid.rows);
  for (let tile = 0; tile < g.size; tile += 97) {
    const cell = scene.cellOfTile(tile as TileId);
    expect(scene.tileOfCell(cell)).toBe(tile);
    const [x, y] = scene.toKm(tileCenter(map.grid, tile as TileId));
    expect(g.cx(cell)).toBeCloseTo(x, 6);
    expect(g.cy(cell)).toBeCloseTo(y, 6);
    expect(g.cellAt(x, y)).toBe(cell);
    const [mx, my] = scene.toM([x, y]);
    const [ox, oy] = tileCenter(map.grid, tile as TileId);
    expect(mx).toBeCloseTo(ox, 3);
    expect(my).toBeCloseTo(oy, 3);
  }
});

it('derives land, water, provinces and cover from the synthetic fixture only', () => {
  const { owner, water, cover } = scene.w.raw;
  let land = 0, foreign = 0, lakes = 0;
  const provinces = new Set<number>();
  for (let tile = 0; tile < scene.w.grid.size; tile++) {
    const i = map.tileIndex(tile as TileId), cell = scene.cellOfTile(tile as TileId);
    if (!map.land[i]) { expect(owner[cell]).toBe(-1); expect([1, 2]).toContain(water[cell]); continue; }
    if (water[cell] === 3) { lakes++; continue; }
    land++;
    if (owner[cell] === FOREIGN) foreign++; else provinces.add(owner[cell]);
    expect(cover[cell]).toBeGreaterThan(0);
  }
  expect(land).toBeGreaterThan(10000);
  expect(lakes).toBeGreaterThan(0);
  expect(foreign).toBeGreaterThan(0);
  expect(provinces.size).toBe(PROVINCES.length);
});

it('anchors every city banner on its land tile and keeps the shown population unscaled', () => {
  for (const c of map.cities) {
    const u = scene.cityById[c.id];
    expect(u.cell).toBe(scene.cellOfTile(c.anchorTile));
    expect(scene.w.cityByCell.get(u.cell)?.id).toBe(String(c.id));
    expect(scene.w.raw.owner[u.cell]).toBeGreaterThanOrEqual(0);
    expect(u.popLabel).toMatch(/万$/);
  }
  const sorted = scene.cities.map(c => c.population);
  expect(sorted).toEqual([...sorted].sort((a, b) => b - a));
});

it('rasterises every route onto neighbouring hex links', () => {
  const g = scene.w.grid;
  const neighbours = (a: number, b: number) => [0, 1, 2, 3, 4, 5].some(d => g.neighbour(a, d) === b);
  for (const [a, b] of [...scene.infra.roads, ...scene.infra.rail]) {
    expect(a).toBeLessThan(b);
    expect(neighbours(a, b)).toBe(true);
  }
  expect(scene.infra.rail.length).toBeGreaterThan(20);
  expect(scene.routePaths).toHaveLength(map.network.length);
});

it('builds lenses in the USACiv contract with nulls for missing values', () => {
  for (const lens of Object.values(scene.lenses)) {
    expect(lens.values).toHaveLength(scene.w.grid.size);
    expect(lens.domain[0]).toBeLessThan(lens.domain[1]);
    expect(lens.values.some(v => v === null)).toBe(true);
    expect(lens.values.some(v => typeof v === 'number')).toBe(true);
  }
});
