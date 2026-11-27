# 14 模块接口契约

本文件中的 TypeScript 定义是接口契约，编码时原样落入 `packages/core-types`（或标注的包）。**本文件是唯一事实源**；修改需同步更新契约测试（回应 R017、R024）。

## 1. 基础类型（core-types）

```ts
type Brand<T, B extends string> = T & { readonly __brand: B };

// ID 域（06 §3）
export type TileId = Brand<number, 'TileId'>;
export type ChunkId = Brand<number, 'ChunkId'>;
export type AdminIdx = Brand<number, 'AdminIdx'>;
export type ProvinceId = Brand<number, 'ProvinceId'>;
export type PrefectureIdx = Brand<number, 'PrefectureIdx'>;
export type CountyIdx = Brand<number, 'CountyIdx'>;
export type SettlementId = Brand<number, 'SettlementId'>;
export type CityId = Brand<number, 'CityId'>;
export type TownId = Brand<number, 'TownId'>;
export type NodeId = Brand<number, 'NodeId'>;
export type EdgeId = Brand<number, 'EdgeId'>;
export type LineId = Brand<number, 'LineId'>;
export type ProjectId = Brand<number, 'ProjectId'>;
export type OrderId = Brand<number, 'OrderId'>;
export type AgreementId = Brand<number, 'AgreementId'>;
export type EventInstanceId = Brand<number, 'EventInstanceId'>;
export type ContentKey = string;                          // 'building.industrial_park'
export type ContentIdx = Brand<number, 'ContentIdx'>;
export type CommandId = string;                           // UUIDv4
export type Revision = Brand<number, 'Revision'>;         // 状态修订号，单调递增
export type Turn = Brand<number, 'Turn'>;                 // 0 = 2021Q1

export type Money = Brand<number, 'Money'>;               // 万元，安全整数
export type Fixed4 = Brand<number, 'Fixed4'>;             // ×10,000 定点

// 纯值转换（core-types/time.ts；允许：无业务规则）
export function turnToYearQuarter(t: Turn): { year: number; quarter: 1 | 2 | 3 | 4 };   // 2021 + floor(t/4), (t mod 4)+1

export enum TerrainClass { Ocean, Lake, Glacier, HighMountain, Mountain, Plateau, Hills, Desert, Wetland, Grassland, Plain }
export enum Domain { Background, ChinaPlayable, ChinaNonPlayable, Sea }
export enum TransportMode { Motorway = 1, Road, Rail, HighSpeedRail, Waterway, Sea, Air }
export enum EdgeKind { Link = 1, Transfer, Access, Ferry, SeaLane, AirRoute }
export enum Zone { None, Residential, Industrial, Science, Ecology, Agriculture }
export enum Sector { Agri, Energy, Mfg, Cons, Svc, Tech }

export interface GridSpec {
  proj: string; orientation: 'pointy'; layout: 'odd-r';
  radiusM: number; originX: number; originY: number; cols: number; rows: number;
  chunkSize: 32; aoiId: string; gridHash: string;
}

export type Waypoint = { kind: 'node'; id: NodeId } | { kind: 'tile'; id: TileId };
export type GeomRef = Brand<number, 'GeomRef'>;           // render/lines 中的几何索引
```

## 2. 世界数据（world-format）

```ts
export interface WorldLoader {
  loadManifest(baseUrl: string): Promise<Manifest>;                       // 校验 identity
  loadBoot(m: Manifest, onProgress: (loadedBytes: number, totalBytes: number) => void): Promise<WorldData>;
  stream(path: string, signal?: AbortSignal): Promise<CcbFile>;
}

export interface Manifest { identity: string; core: ManifestCore; buildInfo: Record<string, string> }
export interface ManifestCore {
  formatVersion: number; layer: 'base-geo' | 'scenario-raw' | 'scenario-cal'; scenarioId: string | null;
  gridSpec: GridSpec; parentIdentity: string | null; contentHash: string | null;
  distribution: 'internal' | 'public';
  files: { path: string; bytes: number; sha256: string; stage: 'boot' | 'stream' | 'lazy'; required: boolean }[];
  complianceFileSha256: string; licenseSetHash: string;
}

/** 不可变：加载后冻结，主线程与 Worker 各持一份（Worker 侧从同一 URL 独立加载，不跨线程转移） */
export interface WorldData {
  manifestChain: Manifest[];                                  // [base-geo, scenario-raw?, scenario-cal?]
  grid: GridSpec;
  tilesGeo: CcbSections;                                      // 字段见 fields.json
  xwalk: { tileOffsets: Uint32Array; countyIdx: Uint16Array; landArea: Uint32Array; popWeight: Float64Array };
  admin: AdminTable; settlements: SettlementTable; islands: CcbSections;
  compliance: ComplianceData;
  scenario?: { tilesPop: CcbSections; cities: CcbSections; towns: CcbSections; economy: CcbSections; network: NetworkData; facilities: CcbSections; lineage: LineageData };
  calibration?: unknown;                                      // 由 sim 按 schema 解析
}
export type CcbSections = Readonly<Record<string, ArrayBufferView | readonly string[] | unknown>>;
export interface CcbFile { sections: CcbSections }
```

`AdminTable`、`SettlementTable`、`NetworkData`、`ComplianceData`、`LineageData` 的字段与 06 §3–6、10 §2.4 的段一一对应，由 `fields.json` 生成类型（不手写）。

## 3. M1 数据地图接口（almanac）

```ts
export interface LensDef {
  id: string; group: 'people' | 'prosperity' | 'land' | 'climate' | 'transport' | 'admin' | 'quality';
  name: Record<'zh' | 'en', string>; unit: string;
  source: { field: string; aggregation: 'tile' | 'county' | 'prefecture' | 'province' };
  scale: 'linear' | 'log' | 'quantile' | 'categorical';
  palette: PaletteId; domain: 'auto-p2-p98' | [number, number];
  missing: 'hatch';                         // 缺失值显示斜线纹理
}
export interface Almanac {
  lenses(): readonly LensDef[];
  lensData(id: string): OverlayData;                             // 每格值 + 有效位
  provinceSummary(p: ProvinceId): SummaryWithLineage;
  citySummary(c: CityId): SummaryWithLineage;
  search(q: string, limit: number): SearchHit[];                  // 地名（含拼音）
  urlState: { encode(s: ViewState): string; decode(h: string): ViewState | null };
}
export interface SummaryWithLineage { rows: { key: string; value: number | null; unit: string; kind: 'observed' | 'estimated' | 'derived'; sourceIds: string[]; referencePeriod: string }[] }
```

## 4. 渲染接口（renderer 只依赖这些）

### 4.1 RenderView 与 Renderer
```ts
export interface RenderView {
  grid: GridSpec;
  staticTiles: CcbSections;                                // 只读地理列
  overlay(kind: OverlayKind): OverlayData;
  cities(): readonly CityVisual[];
  towns(minZoomKm: number): readonly TownVisual[];
  network(): NetworkVisual | null;                         // M1 显示现状网络；M2 含状态与流量
  selection(): SelectionState;
  subscribe(listener: (c: RenderChange) => void): () => void;
}
export type OverlayKind = string;                           // = LensDef.id 或 M2 专用（'transport.flow' 等）
export interface OverlayData { kind: OverlayKind; values: Float32Array | Uint8Array; valid: Uint8Array; palette: PaletteId; domain: [number, number]; scale: LensDef['scale']; legend: LegendSpec }
export interface CityVisual { id: CityId; anchorTile: TileId; tier: 0|1|2|3|4|5; provinceColor: string; population: number | null; label: string; style: ArchStyle; builtTiles: Uint32Array }
export interface TownVisual { id: TownId; anchorTile: TileId; label: string; population: number | null; attachedToTileOwner: boolean }
export interface NetworkVisual { edges: { id: EdgeId; mode: TransportMode; status: 'planned' | 'building' | 'active'; geom: GeomRef; utilization: number | null; flow: number | null }[] }
export interface SelectionState { hoverTile: TileId | null; selected: { kind: 'tile' | 'city' | 'town' | 'edge'; id: number } | null; highlightTiles: Uint32Array }
export type RenderChange =
  | { kind: 'overlay'; overlay: OverlayKind; changedTiles: Uint32Array | 'all' }
  | { kind: 'cities'; changed: CityId[] } | { kind: 'network'; changed: EdgeId[] } | { kind: 'selection' };

export interface RenderOptions { quality: 'low' | 'medium' | 'high'; tier: 'A' | 'B'; reducedMotion: boolean; deterministicTime?: number }
export interface RenderStats { frameMs: number; drawCalls: number; triangles: number; instances: number; textureBytes: number; bufferBytes: number; renderTargetBytes: number; streamQueue: number }
export interface PickResult { tile: TileId | null; entity: { kind: 'city' | 'town' | 'edge'; id: number } | null }

export interface Renderer {
  mount(canvas: HTMLCanvasElement, view: RenderView, assets: AssetSource, opts: RenderOptions): Promise<void>;  // 合规资源校验失败 → reject(ComplianceLoadError)
  setOverlay(kind: OverlayKind | null): void;
  setQuality(q: RenderOptions['quality']): void;
  flyTo(target: { tile?: TileId; city?: CityId; bboxKm?: [number, number, number, number] }, ms?: number): void;
  pick(cssX: number, cssY: number): PickResult;
  previewRoute(tiles: Uint32Array | null): void;
  renderToImage(opts: { width: number; height: number }): Promise<ImageBitmap>;   // 仅地图画面（含合规 Pass），供应用级导出合成
  stats(): RenderStats;                                                          // 整帧累加
  dispose(): void;
}
```

### 4.2 应用级截图导出（回应 R019）
`apps/web/shell/exportImage()`：`renderer.renderToImage()` + 合成（审图号、水印（internal 构建）、南海诸岛附图（若当前视野未完整包含）、数据来源署名）→ PNG。**不存在可以去掉上述元素的参数**；E2E 对导出图像做 OCR/模板检测验证。

## 5. 模拟 API（sim，M2）

```ts
export interface NewGameOptions { seed: number; mode: 'contest' | 'sandbox'; playerProvince: ProvinceId | null; difficulty: 'easy' | 'normal' | 'hard' }
export type Controller =
  | { kind: 'player'; scope: 'province'; province: ProvinceId }
  | { kind: 'player'; scope: 'nation' }
  | { kind: 'ai'; province: ProvinceId };

export interface Sim {
  createGame(world: WorldData, content: Content, opts: NewGameOptions): GameState;
  loadGame(world: WorldData, content: Content, save: SaveData): GameState;          // 校验 world identity、contentHash、simVersion
  validate(s: GameState, c: Command, by: Controller): ValidationResult;
  submit(s: GameState, c: Command, by: Controller): SubmitResult;                   // 原子执行，08 §6.2
  endTurn(s: GameState, observer?: StepObserver): TurnResult;
  query<Q extends Query>(s: GameState, q: Q): QueryResultOf<Q>;
  snapshot(s: GameState): StateSnapshot;                                          // 全量视图（用于初始化与 resync）
  serialize(s: GameState): SaveData;
  stateHash(s: GameState): string;                                                // 16 位小写 hex
}

export interface StepObserver { onStepStart(step: TurnStep): void; onStepEnd(step: TurnStep): void }
export type TurnStep = 'close' | 'ai' | 'works' | 'transport' | 'economy' | 'fiscal' | 'population' | 'city' | 'research' | 'events' | 'projects' | 'scoring' | 'finalize';

export type ValidationResult = { ok: true; cost: Money; turns: number } | { ok: false; reason: RejectReason; detail?: Record<string, string | number> };
export type SubmitResult =
  | { accepted: true; commandId: CommandId; acceptedSeq: number; revision: Revision; diff: StateDiff }
  | { accepted: false; commandId: CommandId; reason: RejectReason; detail?: Record<string, string | number> }
  | { accepted: 'duplicate'; commandId: CommandId; original: SubmitResult };

export type RejectReason =
  | 'INSUFFICIENT_FUNDS' | 'TERRAIN_FORBIDDEN' | 'NOT_AUTHORIZED' | 'TECH_REQUIRED' | 'SLOT_UNAVAILABLE'
  | 'COOLDOWN' | 'INVALID_TARGET' | 'GAME_OVER' | 'DEBT_LIMIT' | 'QUOTE_STALE' | 'ROUTE_TOO_COMPLEX' | 'BUSY';

export interface TurnResult { turn: Turn; revision: Revision; diff: StateDiff; events: GameEvent[]; notifications: Notification[]; stateHash: string; gameOver: boolean }
```

### 5.1 命令
```ts
interface CommandBase { commandId: CommandId; clientSeq: number; actingProvince: ProvinceId }
export type Command =
  | CommandBase & { type: 'BuildLink'; quoteId: string; mode: TransportMode; waypoints: Waypoint[] }
  | CommandBase & { type: 'UpgradeLink'; edge: EdgeId; upgrade: ContentKey }
  | CommandBase & { type: 'CancelOrder'; order: OrderId }
  | CommandBase & { type: 'SetZone'; tile: TileId; zone: Zone }
  | CommandBase & { type: 'Construct'; tile: TileId; building: ContentKey }
  | CommandBase & { type: 'SetPolicy'; slot: number; policy: ContentKey | null }
  | CommandBase & { type: 'SetBudget'; taxBand: 1 | 2 | 3 | 4 | 5; spending: Record<'infra' | 'edu' | 'health' | 'rnd' | 'eco', Fixed4>; borrow: Money }
  | CommandBase & { type: 'Research'; tech: ContentKey }
  | CommandBase & { type: 'BidProject'; project: ProjectId; commitment: Money }
  | CommandBase & { type: 'ProposeAgreement'; to: ProvinceId; agreement: ContentKey; terms: Record<string, number> }
  | CommandBase & { type: 'RespondAgreement'; agreement: AgreementId; accept: boolean }
  | CommandBase & { type: 'ChooseEventOption'; event: EventInstanceId; option: string };
```
- `spending` 五项之和必须 = 10,000（Fixed4 的 100%），否则 `INVALID_TARGET`。

### 5.2 查询
```ts
export type Query =
  | { type: 'RoutePreview'; mode: TransportMode; waypoints: Waypoint[]; actingProvince: ProvinceId }
  | { type: 'BuildCost'; tile: TileId; building: ContentKey; actingProvince: ProvinceId }
  | { type: 'CityReport'; city: CityId } | { type: 'ProvinceReport'; province: ProvinceId }
  | { type: 'Ranking'; metric: string } | { type: 'History'; series: string[]; province?: ProvinceId; city?: CityId }
  | { type: 'Explain'; target: string };

export interface RoutePreviewResult { quoteId: string; tiles: Uint32Array; lengthKm: number; cost: Money; turns: number; tunnelPct: number; bridgeCount: number; violations: RejectReason[] }
// 其余 QueryResultOf<Q> 的结构在 sim/query/types.ts 中定义，并在本文件附录 A 维护列表（P3 前补全）
```

### 5.3 差量
```ts
export interface StateDiff {
  baseRevision: Revision; revision: Revision;
  tiles: ({ column: string; mode: 'sparse'; ids: Uint32Array; values: ArrayBufferView } | { column: string; mode: 'full'; values: ArrayBufferView })[];
  entities: { table: string; upserts: { ids: Uint32Array; columns: Record<string, ArrayBufferView> }; deletes: Uint32Array }[];
  globals: Record<string, number | string>;
}
export interface StateSnapshot { revision: Revision; turn: Turn; /* 全部 ViewModel 所需列与表（只读拷贝）*/ tables: Record<string, Record<string, ArrayBufferView>>; globals: Record<string, number | string> }
```

## 6. Worker 协议（sim-worker ↔ SimClient，回应 R017）

### 6.1 消息
```ts
const PROTOCOL_VERSION = 1;
type Req = { protocol: 1; reqId: number; gameId: string | null } & (
  | { op: 'init'; worldBaseUrls: string[]; contentUrl: string }
  | { op: 'newGame'; opts: NewGameOptions }                     // → { gameId, snapshot }
  | { op: 'load'; save: ArrayBuffer }                           // 转移所有权给 Worker → { gameId, snapshot }
  | { op: 'validate'; cmd: Command }
  | { op: 'submit'; cmd: Command }                              // → SubmitResult（diff 只在此响应中传递）
  | { op: 'endTurn' }                                           // → TurnResult；期间 push progress
  | { op: 'query'; q: Query }
  | { op: 'snapshot' }                                          // resync
  | { op: 'save' }                                              // → ArrayBuffer（Worker 新分配的副本，转移给主线程）
  | { op: 'cancel'; targetReqId: number }                       // 仅可取消 query；endTurn 不可取消
);
type Res =
  | { protocol: 1; reqId: number; ok: true; result: unknown }
  | { protocol: 1; reqId: number; ok: false; error: { code: WorkerErrorCode; message: string } }
  | { protocol: 1; reqId: 0; push: 'progress'; step: TurnStep; index: number; total: number };
type WorkerErrorCode = 'BUSY' | 'NO_GAME' | 'GAME_MISMATCH' | 'PROTOCOL_MISMATCH' | 'CANCELLED' | 'TIMEOUT' | 'INTERNAL' | 'LOAD_INVALID';
```

### 6.2 规则
- **差量唯一路径**：diff 只出现在 `submit`、`endTurn` 的响应里（V0.1 的 push diff 删除）。
- 串行：Worker 内单队列；`endTurn` 期间 `submit` → `BUSY`；`query` 可并行排队。
- 修订号：主线程 ViewModel 记录 `revision`；收到 `baseRevision ≠ 本地 revision` → 发 `snapshot` 重同步。
- 所有权（回应 R017 关于 Transferable）：
  - **Worker 权威状态永不转移**。传给主线程的 TypedArray 一律是 Worker 为本次消息**新分配**的拷贝，并以 Transferable 发送（发送后 Worker 侧该拷贝失效，不影响权威状态）。
  - 世界包数据：主线程与 Worker 各自从 URL 加载，互不转移（避免 CCB 底层 buffer 被分离）。
  - `load` 的 `ArrayBuffer` 由主线程转移给 Worker，主线程不再使用。
- 超时：`query` 2 s（超时返回 `TIMEOUT`，结果丢弃）；`endTurn` 30 s（超时 → UI 提示并提供导出回放；Worker 被终止并重启，从最近存档恢复）。
- Worker 崩溃/重启：SimClient 检测 `error` 事件 → 重启 Worker → `init` → 从内存中最近一次 `save` 结果或自动存档 `load` → `snapshot`；期间 UI 锁定。
- 过期响应：`gameId` 不匹配的响应丢弃。

## 7. 管线 ↔ 客户端契约
- `core-types/schema/` 中 Zod 定义为唯一事实源 → 导出 JSON Schema → TS 类型 / Pydantic 模型（生成文件入库，CI 校验）。
- `ccb-sections.json`、`fields.json`、`hexgrid-vectors.json`、`ccb-golden/`、`pcg32-vectors.json`、`xxhash32-vectors.json`、`detmath-vectors.json`：两端测试共用。

## 附录 A：待 P3 前补全的结果类型清单
`CityReport`、`ProvinceReport`、`Ranking`、`History`、`Explain` 结果结构；`GameEvent`、`Notification`；`Content` 编译产物结构（由 content 编译器 schema 生成）。补全属于 P3 第一个任务包的验收项（18 P3-A0）。
