# 08 模拟内核

## 1. 职责

`packages/sim` 是游戏规则的唯一实现。输入：世界包 + 规则数据 + 种子 + 命令序列；输出：新状态、事件、差量。它不知道画面、UI、时间、网络的存在。

## 2. 确定性规范（硬约束）

| # | 规则 | 检查方式 |
|---|---|---|
| D1 | 禁用 `Math.random`、`Date`、`performance.now`、`setTimeout`/`setInterval`、`crypto.getRandomValues` | ESLint `no-restricted-globals` / `no-restricted-properties` |
| D2 | 禁用全部超越函数（`Math.sin/cos/tan/exp/log/pow/atan2/hypot/cbrt` 等）；`Math.sqrt`、`Math.abs`、`Math.floor/ceil/round/trunc`、`Math.min/max`、`Math.imul` 允许（结果由规范精确定义） | ESLint；需要时使用 `sim/math` 中的确定性实现（多项式/查表，纯加减乘除） |
| D3 | 货币、人口、产出等累计量用**整数**（BigInt 不用；使用 `number` 但保证 < 2^53，单位见 §4）或在每回合末按固定精度量化 | 单元测试 + 断言 |
| D4 | 迭代顺序固定：数组按索引；`Map`/`Set` 只允许按插入顺序且插入顺序确定；**禁止**对对象键做 `for…in` 依赖顺序的逻辑 | 代码审查 + ESLint `guard-for-in` |
| D5 | 排序必须稳定且比较函数全序（平局时按 ID 决胜） | 测试工具 `assertTotalOrder` |
| D6 | 随机数：每个系统一个独立 PRNG 流，种子由 `(gameSeed, turn, systemId)` 派生；算法 **PCG32**（32 位输出，用 `Math.imul` 与 `>>> 0` 实现） | 单元测试对已知种子输出比对 |
| D7 | 浮点累加顺序固定；大规模求和用固定顺序（不使用并行归约） | — |
| D8 | 每回合结束计算 `stateHash`（对全部状态列做 xxHash32/64 的固定顺序混合），写入回合记录 | 回放测试 |

说明：JS 的 `+ − × ÷` 与 `Math.sqrt` 在所有符合规范的引擎中对 IEEE 754 double 结果一致；`Math.sin` 等规范只要求「近似」，不同引擎可能不同，因此禁用。

## 3. 状态模型

```ts
interface GameState {
  meta:   { turn: number; seed: number; simVersion: number; playerProvince: ProvinceId | null; mode: 'contest' | 'sandbox' };
  tiles:  TileStore;          // SoA，长度 = 格数；静态列只读引用世界包，动态列为本局状态
  cities: CityTable;          // 列式实体表
  network: NetworkState;      // 节点、边、在建工程
  economy: EconomyState;      // 城市×部门矩阵、价格、全国宏观量
  provinces: ProvinceTable;   // 省级政府：财政、政策、研发、AI 状态
  projects: ProjectTable;     // 国家项目
  events:  EventState;        // 活跃事件、冷却
  rng:     RngState;          // 各系统 PRNG 状态
  history: HistoryBuffer;     // 关键指标时间序列（每回合，供图表）
}
```

### 3.1 TileStore 动态列（世界包静态列见 06 §3）

| 列 | 类型 | 说明 |
|---|---|---|
| `owner` | Uint16Array | 管辖省索引（初始 = province_idx；V1 中不变，预留） |
| `cityId` | Uint16Array | 所属城市（城市辖格），0xFFFF 无 |
| `zone` | Uint8Array | 功能区：0 无 1 住宅 2 产业 3 科教 4 生态 5 农业 |
| `building` | Uint16Array | 主要设施（content 索引） |
| `pop` | Float64Array | 人口（人，回合末量化为整数） |
| `urbanLevel` | Uint8Array | 0 乡村 1 城镇 2 城市 3 都市核心 |
| `pollution` | Uint8Array | 0–255 |
| `ecology` | Uint8Array | 生态质量 0–255 |
| `surveyed` | Uint8Array | 对玩家是否已调研（0/1）；V1 不为 AI 维护调研状态（AI 视为全知，12 §5 说明） |
| `infraFlags` | Uint16Array | 位：电网、通信、水利等 |

### 3.2 实体表约定

- 每张表：`count`、各列 TypedArray（容量按 2 倍增长）、`alive: Uint8Array`。
- **ID 稳定**：删除只标记 `alive=0`，ID 不复用（单局内实体数量有限，V1 线路最多约 2 万条）。
- 表的增删只能在回合结算中的指定阶段或命令执行中进行，并记录到差量。

## 4. 数值单位（整数化）

| 量 | 存储单位 | 上限检查 |
|---|---|---|
| 货币 | 万元（整数） | 全国年 GDP 约 1e10 万元 量级 < 2^53 ✓ |
| 人口 | 人（整数，回合末量化） | 1.5e9 ✓ |
| 货流 | 万吨/季度（定点 ×100） | ✓ |
| 比率/系数 | 定点 ×10,000（`Int32`），或在单回合内用 double 计算、回合末量化 | — |

回合内部计算允许使用 double（规则 D2 保证一致），**回合末统一量化**到上述单位，保证快照紧凑且哈希稳定。

## 5. 回合管线（固定顺序）

```
endTurn(state, playerCommands):
  0. validate & apply 玩家命令（建设下单、政策变更、预算）——按提交顺序
  1. AI 决策：各 AI 省按省索引升序生成命令并 apply（12 §5）
  2. 工程推进：在建项目进度 +1，完工 → 生效（网络边、建筑）
  3. 交通：重建受影响路径 → OD 需求 → 流量分配 → 拥堵与运输成本（10 §5）
  4. 经济：生产 → 贸易（基于运输成本）→ 价格调整 → 收入（11 §4）
  5. 财政：税收、支出、债务（11 §5）
  6. 人口：自然增长 → 迁移（基于吸引力，依赖 3、4 的结果）→ 城镇化（09 §3）
  7. 城市：辖格扩张、等级变化、污染与生态（09 §4）
  8. 研发与政策：研发点累计、解锁（12 §2）
  9. 事件：触发判定 → 生效（12 §4）
 10. 国家项目：发布、竞标结算（12 §3）
 11. 计分与历史记录（12 §6）
 12. 量化、stateHash、生成差量与通知
```

- 顺序是规则的一部分，修改顺序 = `simVersion` +1。
- 每一步是纯函数 `step(state, ctx) → void`（就地修改 state，ctx 含 rng、content、calibration、差量记录器）。
- 性能预算：全部步骤合计 ≤ **1,500 ms**（参考硬件，31 省全 AI，回合 100 附近），其中交通 ≤ 500 ms、经济 ≤ 300 ms、AI ≤ 400 ms（15 §2）。

## 6. 命令（Command）

- 命令是玩家或 AI 的意图，可序列化（JSON），带 `type`、`issuer`（省 ID）、参数。
- 两阶段：`validate(state, cmd) → Ok | Err(reasonCode)`，`apply(state, cmd) → void`。UI 在提交前可调用 `validate` 做预检（通过 Worker RPC），显示原因（如「资金不足」「地形不允许」）。
- 命令在当前回合内立即生效（扣款、开工），效果在回合结算中体现；可撤销窗口：同回合内，未结算前可撤销「建设下单」类命令（`CancelOrder`），撤销是另一条命令（保证日志可回放）。
- 完整命令清单与参数见 14 §3。

## 7. 差量（Diff）

- 每次 `applyCommand` 与 `endTurn` 产生 `StateDiff`：
  - `tiles`: 变化列 → 变化的 TileId 列表 + 新值（TypedArray，可 Transfer）
  - `entities`: 每表的新增/修改/删除行（列式）
  - `globals`: 变化的标量
  - `events`: 本回合事件与通知
- 主线程 `ViewModelStore` 折叠差量，渲染与 UI 只读 ViewModel。
- 差量大小预算：常规回合 ≤ 500 KB；超过时改为发送整列（阈值：变化行 > 30% 时整列发送）。

## 8. 公开 API（详见 14 §2）

```ts
createGame(world: WorldData, content: Content, opts: NewGameOptions): GameState
loadGame(world: WorldData, content: Content, save: SaveData): GameState
validateCommand(s: GameState, c: Command): ValidationResult
applyCommand(s: GameState, c: Command): StateDiff
endTurn(s: GameState): TurnResult            // { diff, events, stateHash, timings }
query(s: GameState, q: Query): QueryResult    // 只读查询：寻路预览、建设成本估算、报表
serialize(s: GameState): SaveData
```

## 9. 系统间依赖规则

- 系统只能读取管线中**在它之前**的步骤产出的本回合结果，或上一回合的结果；不得读取之后步骤的本回合结果（防止隐式顺序依赖）。在代码中通过 `ctx.turnOutputs` 只暴露已完成步骤的输出实现。
- 系统之间不直接互相调用；共享数据通过 `GameState` 与 `ctx.turnOutputs`。
- 每个系统目录结构统一：`index.ts`（step 函数）、`model.ts`（公式，纯函数）、`params.ts`（参数读取自 content/calibration）、`*.test.ts`。

## 10. 验收（P3 本文件相关）

1. 同一 `.ccreplay` 在 Chrome、Firefox、Safari、Node 22 中回放 50 回合，每回合 `stateHash` 完全一致。
2. ESLint 确定性规则在 `sim` 包零违规；`tsc` 在无 DOM lib 下通过。
3. 存档 → 读档 → 继续 10 回合，与不存档直接运行 10 回合的 `stateHash` 一致。
4. 回合结算耗时（P3 时仅人口/城市系统）≤ 200 ms。
