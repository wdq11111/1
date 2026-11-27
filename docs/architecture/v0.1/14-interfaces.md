# 14 模块接口定义

本文件中的 TypeScript 定义是**接口契约**（编码阶段放入 `packages/core-types` 或对应包的 `index.ts`）。修改需同时更新本文件与契约测试。

## 1. 基础类型（core-types）

```ts
// 品牌类型：防止不同 ID 混用
type Brand<T, B extends string> = T & { readonly __brand: B };
export type TileId     = Brand<number, 'TileId'>;      // 04 §2.4
export type ChunkId    = Brand<number, 'ChunkId'>;
export type CityId     = Brand<number, 'CityId'>;      // CityTable 行号
export type TownId     = Brand<number, 'TownId'>;
export type ProvinceId = Brand<number, 'ProvinceId'>;  // admin 表中 level=1 的序号
export type NodeId     = Brand<number, 'NodeId'>;
export type EdgeId     = Brand<number, 'EdgeId'>;
export type ProjectId  = Brand<number, 'ProjectId'>;
export type ContentKey = string;                       // 'building.industrial_park'
export type ContentIdx = Brand<number, 'ContentIdx'>;  // 编译期稳定索引

export type Turn = Brand<number, 'Turn'>;              // 0 = 2020Q1
export const turnToYearQuarter = (t: Turn) => ({ year: 2020 + Math.floor(t / 4), quarter: (t % 4) + 1 });

export type Money = Brand<number, 'Money'>;            // 万元，整数
export type Fixed4 = Brand<number, 'Fixed4'>;          // 定点 ×10,000

export enum TerrainType { Ocean, Lake, Glacier, HighMountain, Mountain, Plateau, Hills, Desert, Wetland, Grassland, Plain }
export enum Domain { Background, ChinaPlayable, ChinaNonPlayable, Sea }
export enum TransportMode { Motorway = 1, Road, Rail, HighSpeedRail, Waterway, Sea, Air }
export enum Zone { None, Residential, Industrial, Science, Ecology, Agriculture }
export enum Sector { Agri, Energy, Mfg, Cons, Svc, Tech }
```

## 2. 模拟 API（sim）

```ts
export interface NewGameOptions {
  seed: number;                       // uint32
  mode: 'contest' | 'sandbox';
  playerProvince: ProvinceId | null;  // sandbox 时为 null
  difficulty: 'easy' | 'normal' | 'hard';
  endTurn: Turn;                      // 默认 123（2050Q4）
}

export interface Sim {
  createGame(world: WorldData, content: Content, opts: NewGameOptions): GameState;
  loadGame(world: WorldData, content: Content, save: SaveData): GameState;
  validateCommand(s: GameState, c: Command): ValidationResult;
  applyCommand(s: GameState, c: Command): StateDiff;          // 先内部 validate，失败抛 CommandRejected
  endTurn(s: GameState): TurnResult;
  query<Q extends Query>(s: GameState, q: Q): QueryResultOf<Q>;
  serialize(s: GameState): SaveData;
  stateHash(s: GameState): string;                            // 16 位十六进制
}

export type ValidationResult =
  | { ok: true; cost?: Money; turns?: number }
  | { ok: false; reason: RejectReason; detail?: Record<string, number | string> };

export type RejectReason =
  | 'INSUFFICIENT_FUNDS' | 'TERRAIN_FORBIDDEN' | 'NOT_OWNER' | 'TECH_REQUIRED'
  | 'SLOT_UNAVAILABLE' | 'COOLDOWN' | 'INVALID_TARGET' | 'GAME_OVER' | 'DEBT_LIMIT';

export interface TurnResult {
  turn: Turn;                 // 结算后的新回合
  diff: StateDiff;
  events: GameEvent[];
  notifications: Notification[];
  stateHash: string;
  timingsMs: Record<string, number>;   // 仅调试用，不进入状态与哈希
}
```

## 3. 命令（Command）

```ts
interface CommandBase { type: string; issuer: ProvinceId; clientSeq: number }   // clientSeq：客户端单调序号，用于对账

export type Command =
  | CommandBase & { type: 'BuildLink'; mode: TransportMode; waypoints: NodeId[] | TileId[]; fundingShare?: Record<number, number> }
  | CommandBase & { type: 'UpgradeLink'; edge: EdgeId; upgrade: ContentKey }
  | CommandBase & { type: 'CancelOrder'; orderId: number }
  | CommandBase & { type: 'SetZone'; tile: TileId; zone: Zone }
  | CommandBase & { type: 'Construct'; tile: TileId; building: ContentKey }
  | CommandBase & { type: 'SetPolicy'; slot: number; policy: ContentKey | null }
  | CommandBase & { type: 'SetBudget'; taxBand: 1|2|3|4|5; spending: Record<'infra'|'edu'|'health'|'rnd'|'eco', Fixed4>; borrow: Money }
  | CommandBase & { type: 'Research'; tech: ContentKey }
  | CommandBase & { type: 'BidProject'; project: ProjectId; commitment: Money }
  | CommandBase & { type: 'ProposeAgreement'; to: ProvinceId; agreement: ContentKey; terms: Record<string, number> }
  | CommandBase & { type: 'RespondAgreement'; agreementId: number; accept: boolean }
  | CommandBase & { type: 'ChooseEventOption'; eventInstance: number; option: string };
```

- 所有命令必须可 JSON 序列化（回放日志）。
- `issuer` 由宿主填写：玩家命令为玩家省；AI 命令由 AI 系统生成。sim 校验 `issuer` 对目标的权限。

## 4. 渲染接口（renderer 只依赖这些）

```ts
export interface RenderView {
  grid: GridSpec;                              // 来自 manifest.grid
  staticTiles: StaticTileColumns;              // terrain、elev_*、lc_*、river_*（TypedArray 视图）
  getTileOverlay(kind: OverlayKind): OverlayData;           // 数据纹理源
  cities(): ReadonlyArray<CityVisual>;
  network(): NetworkVisual;
  selection(): SelectionState;
  subscribe(listener: (change: RenderChange) => void): Unsubscribe;
}

export interface CityVisual {
  id: CityId; centerTile: TileId; tier: 0|1|2|3|4|5; style: ArchStyle;
  builtTiles: Uint32Array; landmark: ContentKey | null; label: LabelSpec;
}

export interface NetworkVisual {
  edges: { id: EdgeId; mode: TransportMode; status: 'planned'|'building'|'active'; geomRef: GeomRef; utilization: number; flow: number }[];
}

export type OverlayKind = 'none'|'admin'|'population'|'urban'|'economy.sector'|'pollution'|'ecology'|'transport.flow'|'accessibility'|'resources'|'zones';

export interface OverlayData { kind: OverlayKind; values: Float32Array | Uint8Array; palette: PaletteId; domain: [number, number]; legend: LegendSpec }

export type RenderChange =
  | { kind: 'tiles'; overlay: OverlayKind; changed: Uint32Array }
  | { kind: 'cities'; changed: CityId[] }
  | { kind: 'network'; changed: EdgeId[] }
  | { kind: 'selection' };

export interface Renderer {
  mount(canvas: HTMLCanvasElement, view: RenderView, assets: AssetSource, opts: RenderOptions): Promise<void>;
  setOverlay(kind: OverlayKind): void;
  setQuality(q: 'low'|'medium'|'high'): void;
  setStrategicView(on: boolean): void;
  flyTo(target: { tile?: TileId; city?: CityId; bbox?: [number, number, number, number] }, ms?: number): void;
  pick(screenX: number, screenY: number): PickResult;      // { tile: TileId | null; entity?: … }
  previewRoute(tiles: Uint32Array | null, style: RoutePreviewStyle): void;
  screenshot(opts?: { hideUI?: boolean }): Promise<Blob>;  // 合规：截图必须包含审图号与水印（若适用）
  stats(): RenderStats;                                     // fps、drawCalls、triangles、gpuMemEstimate
  dispose(): void;
}
```

## 5. Worker 协议（sim-worker ↔ SimClient）

```ts
// 主线程 → Worker
type Req =
  | { id: number; op: 'init'; worldUrl: string; contentUrl: string }
  | { id: number; op: 'newGame'; opts: NewGameOptions }
  | { id: number; op: 'load'; save: ArrayBuffer }
  | { id: number; op: 'validate'; cmd: Command }
  | { id: number; op: 'apply'; cmd: Command }
  | { id: number; op: 'endTurn' }
  | { id: number; op: 'query'; q: Query }
  | { id: number; op: 'save' };

// Worker → 主线程
type Res =
  | { id: number; ok: true; result: unknown; transfer?: true }
  | { id: number; ok: false; error: { code: string; message: string } }
  | { id: 0; push: 'progress'; stage: string; pct: number }      // 回合结算进度
  | { id: 0; push: 'diff'; diff: StateDiffWire };                 // 差量（TypedArray 通过 Transferable 传输）
```

- 请求串行化：Worker 内部队列，`endTurn` 执行期间到达的 `apply` 被拒绝（`code: 'BUSY'`），UI 在结算时锁定操作。
- 大数据（存档、差量的 TypedArray）一律用 Transferable 传输，禁止 JSON 化。
- 超时：`query` 2 s、`endTurn` 30 s，超时 UI 提示并提供「导出回放文件」以便报告。

## 6. 查询（Query）

```ts
export type Query =
  | { type: 'RoutePreview'; mode: TransportMode; waypoints: TileId[] }      // → { tiles, lengthKm, cost, turns, tunnelPct, bridgeCount, violations }
  | { type: 'BuildCost'; tile: TileId; building: ContentKey }
  | { type: 'CityReport'; city: CityId }
  | { type: 'ProvinceReport'; province: ProvinceId }
  | { type: 'Ranking'; metric: string }
  | { type: 'History'; series: string[]; scope: { province?: ProvinceId; city?: CityId } }
  | { type: 'Explain'; target: string };     // 数值构成明细（例如 GDP 的部门构成、税收构成）
```

## 7. 世界包读取（world-format）

```ts
export interface WorldLoader {
  loadManifest(baseUrl: string): Promise<Manifest>;
  loadBoot(manifest: Manifest, onProgress: (p: number) => void): Promise<WorldData>;   // stage=boot 文件
  stream(path: string, signal?: AbortSignal): Promise<CcbFile>;                       // stage=stream 文件
}
export interface CcbFile { sections: Record<string, TypedArrayLike | string[] | unknown>; }
```

## 8. 管线 ↔ 客户端契约

- JSON Schema（`core-types/schema/*.schema.json`）由 Zod 定义导出，是唯一事实源；Python 端用 `datamodel-code-generator` 生成 Pydantic 模型（生成文件入库，CI 检查是否过期）。
- CCB 段名与 dtype 的约定表 `core-types/schema/ccb-sections.json`，Python 写出器与 TS 读取器都从此表读取并断言。
