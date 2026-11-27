import { createHash } from 'node:crypto';
import { expect, it } from 'vitest';
import { Terrain } from '../../core-types/src/map';
import { pickTile } from '../../hexgrid/src/grid';
import { createFixture } from './fixture';

it('generates consistent grid identity, visible terrain types, valid anchors, and missing values', () => {
  const a = createFixture(), b = createFixture();
  const { gridHash, ...core } = a.grid;
  const canonical = JSON.stringify(core,Object.keys(core).sort());
  expect(gridHash).toBe('sha256:' + createHash('sha256').update(canonical).digest('hex'));
  expect(a.terrain.length).toBe(82420);
  expect(new Set(a.terrain)).toEqual(new Set(Object.values(Terrain).filter(t => typeof t === 'number')));
  expect(Buffer.compare(Buffer.from(a.terrain),Buffer.from(b.terrain))).toBe(0);
  expect(Buffer.compare(Buffer.from(a.coast.values),Buffer.from(b.coast.values))).toBe(0);
  expect(Buffer.compare(Buffer.from(a.population.buffer),Buffer.from(b.population.buffer))).toBe(0);
  expect(a.valid.some((valid,i) => a.terrain[i] > Terrain.Lake && valid === 0)).toBe(true);
  for (const c of a.cities) {
    expect(pickTile(a.grid,c.anchorX,c.anchorY)).toBe(c.anchorTile);
    expect(a.land[a.tileIndex(c.anchorTile)]).toBe(1);
  }
});
