export type TileId = number & { readonly __brand: 'TileId' };
export type CityId = number & { readonly __brand: 'CityId' };
export type LineId = number & { readonly __brand: 'LineId' };
export type Point = readonly [x: number, y: number];
export type Bounds = readonly [minX: number, minY: number, maxX: number, maxY: number];

export interface GridCore {
  aoiId: string; aoiSha256: string; chunkSize: 32; cols: number; rows: number;
  layout: 'odd-r'; orientation: 'pointy'; originX: number; originY: number; proj: string; radiusM: number;
}
export interface GridSpec extends GridCore { gridHash: string }
export interface TileWindow { col0: number; row0: number; cols: number; rows: number }
export enum Terrain { Ocean, Lake, Glacier, HighMountain, Mountain, Plateau, Hills, Desert, Wetland, Grassland, Plain }

export const terrainNames = ['海洋', '湖泊', '雪峰', '高山', '山地', '高原', '丘陵', '荒地', '湿地', '草地', '平原'];
export const terrainColors = ['39747b', '559599', 'd4d6c1', '898e76', '657c61', 'a0a77b', '8fa475', 'bea574', '7eaa8e', 'b5bf89', 'c7c893'];

export type Lens = 'terrain' | 'population' | 'economy';
export interface CameraView { x: number; y: number; width: number }
export interface CityVisual {
  id: CityId; anchorTile: TileId; anchorX: number; anchorY: number; label: string;
  pinyin: string; population: number; economy: number; primary: boolean; description: string;
}
export interface NetworkVisual {
  lineId: LineId; edgeKind: 'link'; mode0: 'rail' | 'road'; kind: 'fixture-default';
  status: 'active'; name: string; points: readonly Point[];
}
export type Selection = { kind: 'city'; id: number } | { kind: 'edge'; id: number } | { kind: 'tile'; id: TileId };
export interface ScalarTexture { width: number; height: number; values: Uint8Array; bounds: Bounds }
export interface RenderView {
  grid: GridSpec; window: TileWindow; tileIndex(tile: TileId): number; bounds: Bounds;
  terrain: Uint8Array; land: Uint8Array; population: Float32Array; economy: Float32Array;
  elevation: Uint16Array; valid: Uint8Array;
  relief: ScalarTexture; coast: ScalarTexture;
  cities: readonly CityVisual[]; network: readonly NetworkVisual[];
  rivers: readonly (readonly Point[])[]; regions: readonly { name: string; point: Point }[];
}
export interface RenderStats {
  frameMs: number; drawCalls: number; triangles: number; instances: number;
  textureBytes: number; bufferWidth: number; bufferHeight: number;
}
