// Loose typings for the vendored USACiv JavaScript (see index.js). The renderer's own TypeScript wraps these.
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UsaGrid {
  R: number; W: number; H: number; cols: number; rows: number; size: number; corners: [number, number][];
  cx(i: number): number; cy(i: number): number; neighbour(i: number, d: number): number;
  cellAt(x: number, y: number): number;
  range(x0: number, y0: number, x1: number, y1: number): { r0: number; r1: number; c0: number; c1: number };
}
export interface PreparedWorld { grid: UsaGrid; colors: string[]; water: number[]; raw: any; [key: string]: any }
export interface StaticViewport { x0: number; y0: number; x1: number; y1: number; s: number; dpr: number; cssW?: number; cssH?: number }
export interface BannerHit { x: number; y: number; w: number; h: number; city: any; specialty: string | null }

export function prepareWorld(world: any, cities: any[], extras?: any): PreparedWorld;
export function applyLens(w: PreparedWorld, lens: any, band?: [number, number] | null): void;
export function drawStatic(ctx: CanvasRenderingContext2D, vp: StaticViewport, w: PreparedWorld, opts: any): void;
export function drawOverlay(ctx: CanvasRenderingContext2D, cam: any, w: PreparedWorld, state: any, now?: number): void;
export function warmSprites(ctx: CanvasRenderingContext2D, vp: StaticViewport, w: PreparedWorld, opts?: any): void;
export const OCEAN_BG: string;
export const Z: Readonly<Record<string, number>>;
export function drawBanners(ctx: CanvasRenderingContext2D, cam: any, w: PreparedWorld, state: any, yields: any[], nation?: any): BannerHit[];
export function prepareNetwork(w: PreparedWorld, infra: any): any;
export function drawRoads(ctx: CanvasRenderingContext2D, net: any, vp: StaticViewport, o: any): void;
export function drawRail(ctx: CanvasRenderingContext2D, net: any, vp: StaticViewport, o: any): void;
export const ROAD_MIN_RPX: number;
export function spriteStats(): { count: number; pixels: number; hits: number; misses: number; painted: number };
export function svgIcon(id: string, opts?: { size?: number; title?: string }): string;
export function hasIcon(id: string): boolean;
export function makeGrid(spec: { radius: number; cols: number; rows: number }): UsaGrid;
export function hash01(i: number, salt?: number): number;
export const COVER: Record<string, number>;
