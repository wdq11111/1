import type { Bounds, CameraView, Point } from '../../core-types/src/map';

const clamp = (x: number, min: number, max: number) => Math.max(min, Math.min(max, x));

export function boundCamera(view: CameraView, bounds: Bounds): CameraView {
  return { x: clamp(view.x, bounds[0], bounds[2]), y: clamp(view.y, bounds[1], bounds[3]),
    width: clamp(view.width, 60000, 6000000) };
}
export function worldAt(view: CameraView, screenWidth: number, screenHeight: number, x: number, y: number): Point {
  const scale = view.width / screenWidth;
  return [view.x + (x - screenWidth / 2) * scale, view.y - (y - screenHeight / 2) * scale];
}
export function screenAt(view: CameraView, screenWidth: number, screenHeight: number, [x, y]: Point): Point {
  const scale = screenWidth / view.width;
  return [(x - view.x) * scale + screenWidth / 2, (view.y - y) * scale + screenHeight / 2];
}
export function zoomAt(view: CameraView, w: number, h: number, start: Point, end: Point, factor: number, bounds: Bounds): CameraView {
  const anchor = worldAt(view, w, h, ...start);
  const width = clamp(view.width * factor, 60000, 6000000);
  return boundCamera({ x: anchor[0] - (end[0] - w / 2) * width / w,
    y: anchor[1] + (end[1] - h / 2) * width / w, width }, bounds);
}
