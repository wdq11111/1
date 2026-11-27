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

export interface GridCore {
  aoiId: string; aoiSha256: string; chunkSize: 32; cols: number; rows: number;
  layout: 'odd-r'; orientation: 'pointy'; originX: number; originY: number; proj: string; radiusM: number;
}
export interface GridSpec extends GridCore { gridHash: string }          // gridHash = sha256(CCJ-1(GridCore))
export interface TileWindow { col0: number; row0: number; cols: number; rows: number }
/** 全局 TileId → 窗口内下标；窗口外返回 -1 */
export type TileIndexFn = (t: TileId) => number;
export type ObsKind = 'observed' | 'estimated' | 'derived' | 'simulated' | 'fixture-default' | 'unknown';

export type Waypoint = { kind: 'node'; id: NodeId } | { kind: 'tile'; id: TileId };
export type GeomRef = Brand<number, 'GeomRef'>;           // render/lines 中的几何索引
```

## 2. 世界数据（world-format，回应 R103）

```ts
export interface ReleaseDescriptor {                 // 17 §5；dev 环境用本地等价配置
  descriptorVersion: 1; distribution: 'internal' | 'public';
  appBuildHash: string; contentHash: string; styleHash: string;
  chain: { layer: ManifestCore['layer']; identity: string; baseUrl: string }[];   // 叶子在最后
  approval: { approvalId: string; approvalNumberText: string; validFrom: string; validTo: string | null; scope: string[] } | null;
  revoked: boolean;
}

export interface WorldLoader {
  /** 依 descriptor.chain 逐层加载并校验（06 §1.4）；任一失败 → reject(WorldChainError) */
  loadChain(d: ReleaseDescriptor, onProgress: (loaded: number, total: number) => void): Promise<WorldData>;
  stream(layer: ManifestCore['layer'], path: string, signal?: AbortSignal): Promise<CcbFile>;
}
export type WorldChainErrorCode =
  | 'IDENTITY_MISMATCH' | 'PARENT_MISSING' | 'PARENT_MISMATCH' | 'GRID_MISMATCH' | 'WINDOW_MISMATCH'
  | 'SCENARIO_MISMATCH' | 'DISTRIBUTION_VIOLATION' | 'CYCLE' | 'FILE_MISSING' | 'FILE_HASH' | 'CCB_INVALID' | 'COMPLIANCE_INVALID';

export interface Manifest { identity: string; core: ManifestCore; buildInfo: Record<string, string> }
export interface ManifestCore {                       // 06 §1.3，字段全部必选，不允许额外字段
  formatVersion: number; layer: 'base-geo' | 'scenario-raw' | 'scenario-cal'; scenarioId: string | null;
  gridCore: GridCore; gridHash: string; window: TileWindow; parentIdentity: string | null; contentHash: string | null;
  distribution: 'internal' | 'public';
  files: { path: string; bytes: number; sha256: string; stage: 'boot' | 'stream' | 'lazy'; required: boolean }[];
  complianceFileSha256: string | null; licenseSetHash: string; toolRegistryHash: string;
}

/** 不可变：加载后冻结；主线程与 Worker 各自从 URL 加载，不跨线程转移 */
export interface WorldData {
  chain: Manifest[];                               // [base-geo, scenario-raw?, scenario-cal?]
  grid: GridSpec; window: TileWindow; tileIndex: TileIndexFn;
  tilesGeo: CcbSections;                           // 字段由 fields.json 生成类型
  xwalkGeo: { tileOffsets: Uint32Array; countyIdx: Uint16Array; landAreaM2: Uint32Array };
  admin: AdminTable; settlements: SettlementTable; islands: IslandTable; compliance: ComplianceData;
  scenario?: { xwalkPop: { popWeight: Float64Array; popInt: Int32Array }; cities: CityStatsTable; towns: TownStatsTable;
               economy: EconomyTable; network: NetworkData; facilities: FacilityTable; lineage: LineageData };
  calibration?: unknown;                           // sim 按 schema 解析
}
export type CcbSections = Readonly<Record<string, ArrayBufferView | readonly string[] | unknown>>;
export interface CcbFile { sections: CcbSections }

// —— M1 必需的表（字段名、单位与哨兵由 fields.json 生成，此处为冻结的最小字段集）——
export interface AdminTable {
  count: number; code: Uint32Array; level: Uint8Array /*1 省 2 地 3 县*/; parentIdx: Uint16Array /*0xFFFF 无*/;
  name: readonly string[]; namePinyin: readonly string[]; nameShort: readonly string[] /*仅省级，否则 ''*/;
  provinceId: Uint16Array; prefectureIdx: Uint16Array; countyIdx: Uint16Array;          // 各自专用序号，非本级为 0xFFFF
  landAreaM2: Float64Array; officialAreaKm2: Float64Array /*NaN 不允许；缺失用 validOfficialArea=0*/; validOfficialArea: Uint8Array;
  capitalSettlement: Uint16Array;
}
export interface SettlementTable {
  count: number; code: Uint32Array; kind: Uint8Array /*1 直辖市 2 省会 3 地级 4 县级市 5 县/区/旗*/;
  adminIdx: Uint16Array; anchorX: Int32Array; anchorY: Int32Array; anchorTile: Uint32Array; isPrimaryOnTile: Uint8Array;
  cityId: Uint16Array; townId: Uint16Array; name: readonly string[]; namePinyin: readonly string[];
}
export interface IslandTable { count: number; kind: Uint8Array /*1 点 2 面*/; x: Int32Array; y: Int32Array; geomRef: Uint32Array; name: readonly string[] }
export interface ComplianceData {
  fileSha256: string; requiredFeaturesVersion: number;
  layers: { id: string; kind: 'national-border' | 'provincial-border' | 'coastline' | 'island' | 'scs-line' | 'inset'; geomRefs: Uint32Array; style: string }[];
  insetSpec: { id: string; boundsKm: [number, number, number, number]; screenAnchor: 'bottom-right' } ;
}
export interface CityStatsTable { count: number; settlementId: Uint16Array; popTotal: Int32Array; popUrban: Int32Array; gdpWan: Float64Array; validBits: Uint32Array; lineageRef: Uint32Array }
export type TownStatsTable = CityStatsTable;
export interface EconomyTable { cities: number; sectors: 6; vaWan: Float64Array /*cities×6*/; employment: Float64Array; valid: Uint8Array; lineageRef: Uint32Array }
export interface LineageData { sources: { id: string; title: string; version: string; license: string; url: string }[];
  fieldDefault(field: string): { kind: ObsKind; sourceIds: string[]; referencePeriod: string; method: string };
  override(field: string, entityKind: string, id: number): { kind: ObsKind; sourceIds: string[]; referencePeriod: string; method: string; note?: string } | null }
// NetworkData、FacilityTable：字段见 10 §2.4（由 fields.json 生成）

export interface AssetSource {                    // renderer 读取资源的唯一入口
  boot(path: string): ArrayBufferView;            // 已加载的 boot 资源
  stream(layer: ManifestCore['layer'], path: string, priority: number, signal?: AbortSignal): Promise<ArrayBufferView>;
  texture(path: string): Promise<{ width: number; height: number; layers: number; format: string; data: ArrayBufferView | 'ktx2' }>;
}
```

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
export interface SummaryWithLineage { rows: { key: string; value: number | null; unit: string; kind: ObsKind; sourceIds: string[]; referencePeriod: string }[] }
export type PaletteId = 'seq-green-ochre-red' | 'seq-blue' | 'div-azurite-cinnabar' | 'cat-admin' | 'cat-terrain' | 'cb-safe-seq' | 'cb-safe-div';
export interface LegendSpec { title: string; unit: string; stops: { value: number; color: string; label: string }[]; missingLabel: string; source: string }
export interface SearchHit { kind: 'province' | 'prefecture' | 'county' | 'city' | 'town'; id: number; name: string; pinyin: string; parentName: string; anchorTile: TileId }
export interface ViewState { v: 1; centerX: number; centerY: number; widthKm: number; lens: string | null; selected: { kind: string; id: number } | null }   // URL 编码：base64url(CCJ-1)
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
  | { accepted: 'duplicate'; commandId: CommandId; acceptedSeq: number; currentRevision: Revision };   // 不含差量（回应 R108）

export type RejectReason =
  | 'INSUFFICIENT_FUNDS' | 'TERRAIN_FORBIDDEN' | 'NOT_AUTHORIZED' | 'TECH_REQUIRED' | 'SLOT_UNAVAILABLE'
  | 'COOLDOWN' | 'INVALID_TARGET' | 'GAME_OVER' | 'DEBT_LIMIT' | 'QUOTE_STALE' | 'ROUTE_TOO_COMPLEX' | 'BUSY'
  | 'COMMAND_ID_CONFLICT' | 'STALE_TURN';

export interface TurnResult { turn: Turn; revision: Revision; diff: StateDiff; events: GameEvent[]; notifications: Notification[]; stateHash: string; gameOver: boolean }
```

### 5.1 命令
```ts
interface CommandBase { commandId: CommandId; clientSeq: number; baseTurn: Turn; actingProvince: ProvinceId }
export type Command =
  | CommandBase & { type: 'BuildLink'; mode: TransportMode; waypoints: Waypoint[]; expectedCost: Money; expectedPeriods: number; quoteDigest: string }
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
- `spending` 五项之和必须 = 10,000，否则 `INVALID_TARGET`。
- `BuildLink` 的校验见 08 §6.5（以当前权威状态重算，摘要不符 → `QUOTE_STALE`）。
- `RejectReason` 增加：`'COMMAND_ID_CONFLICT' | 'STALE_TURN'`。

### 5.2 查询
```ts
export type Query =
  | { type: 'RoutePreview'; mode: TransportMode; waypoints: Waypoint[]; actingProvince: ProvinceId }
  | { type: 'BuildCost'; tile: TileId; building: ContentKey; actingProvince: ProvinceId }
  | { type: 'CityReport'; city: CityId } | { type: 'ProvinceReport'; province: ProvinceId }
  | { type: 'Ranking'; metric: string } | { type: 'History'; series: string[]; province?: ProvinceId; city?: CityId }
  | { type: 'Explain'; target: string };

export interface RoutePreviewResult { quoteDigest: string; tiles: Uint32Array; lengthKm: number; cost: Money; periods: number; topologyRevision: number; paramsRevision: number; tunnelPct: number; bridgeCount: number; violations: RejectReason[] }
// 其余 QueryResultOf<Q> 的结构在 sim/query/types.ts 中定义，并在本文件附录 A 维护列表（P3a-A0 补全）
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

## 6. Worker 协议（回应 R017、R108）

### 6.1 消息
```ts
const PROTOCOL_VERSION = 2;
interface Envelope { protocol: 2; workerEpoch: number; reqId: number; gameId: string | null }   // workerEpoch：每次（重）启动 Worker 由宿主递增
type Req = Envelope & (
  | { op: 'init'; descriptor: ReleaseDescriptor; contentUrl: string }
  | { op: 'newGame'; opts: NewGameOptions }                // → { gameId, snapshot }（新 gameId 由宿主生成并在请求中给出：gameId 字段即新值）
  | { op: 'load'; save: ArrayBuffer }                      // 转移给 Worker → { gameId, snapshot }
  | { op: 'validate'; cmd: Command; by: Controller }
  | { op: 'submit'; cmd: Command; by: Controller }         // → SubmitResult（差量只在此处与 endTurn 响应中出现）
  | { op: 'endTurn' }                                      // → TurnResult；期间 push progress
  | { op: 'query'; q: Query }
  | { op: 'snapshot' }                                     // 重同步
  | { op: 'save' }                                         // → ArrayBuffer（新分配副本，转移给主线程）
  | { op: 'cancel'; targetReqId: number }                  // 仅 query：结果被丢弃（不中断计算）
);
type Res = Envelope & (
  | { ok: true; result: unknown }
  | { ok: false; error: { code: WorkerErrorCode; message: string } }
  | { push: 'progress'; step: TurnStep; index: number; total: number }
);
type WorkerErrorCode = 'BUSY' | 'NO_GAME' | 'GAME_MISMATCH' | 'PROTOCOL_MISMATCH' | 'CANCELLED' | 'TIMEOUT' | 'INTERNAL' | 'LOAD_INVALID';
```

### 6.2 规则
- **所有响应与 progress 都带 `workerEpoch`、`gameId`、`reqId`**；SimClient 丢弃 epoch 或 gameId 不匹配、或 reqId 未登记的响应。
- **差量唯一路径**：`submit` 与 `endTurn` 的成功响应；SimClient 仅当 `gameId` 匹配且 `diff.baseRevision == 本地 revision` 时应用，否则发 `snapshot`。`duplicate` 响应不含差量，若 `currentRevision > 本地` 则发 `snapshot`。
- **宿主侧闸门（回应 R108 与审查 [E3]）**：Worker 同步执行 `endTurn` 时无法处理新消息，因此：SimClient 在发出 `endTurn` 后立即进入锁定态，**不再发送 `submit`**（UI 禁用相关操作）；Worker 内部仍维护逻辑队列，若收到 `submit` 且其 `cmd.baseTurn` 已过期则返回 `STALE_TURN`。
- 所有权：Worker 权威状态永不转移；发给主线程的 TypedArray 为新分配拷贝并以 Transferable 发送；世界数据两侧各自加载；`load` 的 ArrayBuffer 转移后主线程不再使用。
- **自动存档点**：每次 `endTurn` 开始前，Worker 先生成自动存档（含回放日志与幂等账）并发给主线程写入 IndexedDB（iPad 后台/内存告警时同样触发，13 §2.3）。
- 超时：`query` 2 s（结果丢弃）；`endTurn` 桌面 30 s、iPad 60 s（P1a 后修订）→ 宿主终止 Worker，`workerEpoch + 1`，重启 → `init` → `load`（最近自动存档，即本回合 endTurn 前的状态）→ `snapshot`；**用户可见回滚范围**：只丢失本次未完成的回合结算，本回合已接受的玩家命令全部保留（它们在自动存档中）。提示用户并提供导出回放。
- 提交成功但响应丢失（例如 Worker 崩溃）：恢复后客户端以相同 `commandId` 重试，按幂等账得到 `duplicate`（若该命令在存档中）或重新执行（若不在）。

### 6.3 输入抽象（DEC-001 D-12）
```ts
export type PointerIntent =
  | { kind: 'pan'; dxCss: number; dyCss: number } | { kind: 'zoom'; factor: number; anchorCssX: number; anchorCssY: number }
  | { kind: 'select'; cssX: number; cssY: number } | { kind: 'inspect'; cssX: number; cssY: number }   // inspect = 悬停（桌面）或长按（iPad）
  | { kind: 'context'; cssX: number; cssY: number }                                                     // 右键（桌面）或长按菜单（iPad）
  | { kind: 'cancel' };
export interface InputRouter { onIntent(listener: (i: PointerIntent) => void): () => void; setMode(m: 'map' | 'route-plan' | 'zone-paint' | 'locked'): void }
```
渲染、UI 只消费 `PointerIntent`，不直接处理原始鼠标/触控事件，保证两平台功能等价。

## 7. 管线 ↔ 客户端契约
- 事实源层级见 00 §3：L1 冻结前本文件为规范；冻结后 `core-types/schema/` 中 Zod 定义为机器事实源 → 导出 JSON Schema → TS 类型 / Pydantic 模型（生成文件入库，CI 校验）。
- `ccb-sections.json`、`fields.json`、`hexgrid-vectors.json`、`ccb-golden/`、`pcg32-vectors.json`、`xxhash32-vectors.json`、`detmath-vectors.json`：两端测试共用。

## 附录 A：待 P3a-A0 补全的结果类型清单（契约变更机制：新增类型以「契约变更 PR」提交，Claude 审查；若改动 L1 已冻结的类型，需 ADR + GPT 复核）
`CityReport`、`ProvinceReport`、`Ranking`、`History`、`Explain` 结果结构；`GameEvent`、`Notification`；`Content` 编译产物结构（由 content 编译器 schema 生成）。补全属于 P3 第一个任务包的验收项（18 P3a-A0）。
