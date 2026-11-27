import { describe, expect, it } from 'vitest';
import type { GridCore, TileId } from '../../core-types/src/map';
import { center, gridBounds, indexInWindow, pickTile, rhaz, SQRT3, tileCenter, tileId } from './grid';

const base: GridCore = {
  aoiId:'test', aoiSha256:'test', chunkSize:32, cols:260, rows:317,
  layout:'odd-r', orientation:'pointy', originX:-2700000, originY:-2844000,
  proj:'fixture:cartesian-m', radiusM:12000,
};

describe('odd-r grid coordinates', () => {
  it.each([12000, 16000, 20000])('round-trips every center at R=%i m', radiusM => {
    const grid = { ...base, radiusM };
    let failures = 0;
    for (let id = 0; id < grid.cols * grid.rows; id++) {
      if (pickTile(grid, ...tileCenter(grid,id as TileId)) !== id) failures++;
    }
    expect(failures).toBe(0);
  });

  it('keeps global IDs in a compact subwindow and rejects invalid IDs', () => {
    const window = { col0:4,row0:7,cols:3,rows:2 };
    expect(indexInWindow(base, window, tileId(base, 4, 7)!)).toBe(0);
    expect(indexInWindow(base, window, tileId(base, 6, 8)!)).toBe(5);
    expect(indexInWindow(base, window, tileId(base, 3, 7)!)).toBe(-1);
    expect(indexInWindow(base, window, -1 as TileId)).toBe(-1);
    expect(indexInWindow(base, window, 1824.5 as TileId)).toBe(-1);
  });

  it('picks opposite sides of a shared edge and resolves exact ties consistently', () => {
    const grid = { ...base, originX: 0, originY: 0 };
    const edge = (SQRT3 * grid.radiusM) / 2;
    expect(pickTile(grid,edge - .001,0)).toBe(0);
    expect(pickTile(grid,edge,0)).toBe(1);
    expect(pickTile(grid,edge + .001,0)).toBe(1);
    expect(pickTile(grid,-edge + .001,0)).toBe(0);
    expect(pickTile(grid,-edge - .001,0)).toBeNull();
    expect(pickTile(grid,Infinity,0)).toBeNull();
  });

  it('includes all corner hexes in bounds for either window row parity', () => {
    for (const row0 of [0,1,8,9]) {
      const [minX,minY,maxX,maxY] = gridBounds(base,{col0:9,row0,cols:3,rows:2});
      for (const row of [row0,row0+1]) for (const col of [9,11]) {
        const [x,y] = center(base,col,row);
        expect(x-base.radiusM*SQRT3/2 + 1e-8).toBeGreaterThanOrEqual(minX);
        expect(x+base.radiusM*SQRT3/2 - 1e-8).toBeLessThanOrEqual(maxX);
        expect(y-base.radiusM).toBeGreaterThanOrEqual(minY);
        expect(y+base.radiusM).toBeLessThanOrEqual(maxY);
      }
    }
  });

  it('implements R219 at half values and at adjacent binary64 values', () => {
    const data = new DataView(new ArrayBuffer(8));
    function around(x: number, step: bigint) {
      data.setFloat64(0,x); data.setBigUint64(0,data.getBigUint64(0)+step); return data.getFloat64(0);
    }
    for (const [half,lower,upper] of [[.5,0,1],[1.5,1,2]]) {
      expect([rhaz(around(half,-1n)),rhaz(half),rhaz(around(half,1n))]).toEqual([lower, upper, upper]);
      expect([rhaz(-around(half,-1n)),rhaz(-half),rhaz(-around(half,1n))]).toEqual([lower ? -lower : 0, -upper, -upper]);
    }
    expect(Object.is(rhaz(-0),0)).toBe(true);
  });
});
