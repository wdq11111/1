import { expect, it } from 'vitest';
import type { Bounds, CameraView, Point } from '../../core-types/src/map';
import { screenAt, worldAt, zoomAt } from './camera';

const bounds: Bounds = [-3000000,-3000000,3000000,3000000];
const view: CameraView = { x:260000,y:55000,width:1880000 };
const start: Point = [382,274], end: Point = [310,336];

it('keeps the world point under the wheel or moving pinch midpoint', () => {
  const anchor = worldAt(view,1208,793,...start);
  const zoomed = zoomAt(view,1208,793,start,end,.65,bounds);
  const result = screenAt(zoomed,1208,793,anchor);
  expect(result[0]).toBeCloseTo(end[0],8);
  expect(result[1]).toBeCloseTo(end[1],8);
});

it('clamps view width at supported limits', () => {
  expect(zoomAt(view,1208,793,start,end,.0001,bounds).width).toBe(60000);
  expect(zoomAt(view,1208,793,start,end,150,bounds).width).toBe(6000000);
});
