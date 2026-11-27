# 08 模拟内核（M2）

## 1. 职责
`packages/sim` 是游戏规则的唯一实现：输入（世界包 + content + 种子 + 命令序列）→ 状态、事件、差量。无 DOM、WebGL、时间、网络。

## 2. 确定性规范

### 2.1 规则表

| # | 规则 | 检查方式 |
|---|---|---|
| D1 | 禁用 `Math.random`、`Date`、`performance`、`setTimeout/setInterval`、`crypto` | ESLint（03 §2，含别名绕过检测） |
| D2 | 禁用全部超越函数（`sin/cos/tan/asin/acos/atan/atan2/exp/expm1/log/log1p/log2/log10/pow/hypot/cbrt/sinh/cosh/tanh…`）与 `**` 运算符的非整数指数；允许 `+ − × ÷ %`、`Math.sqrt/abs/floor/ceil/round/trunc/sign/min/max/imul/fround/clz32` | ESLint；需要时用 `sim/math`（§2.3） |
| D3 | 数值域：所有持久状态数值必须有限；整数量必须在 `[−(2^53−1), 2^53−1]`；中间乘积按 §2.4 规则检查 | 运行时断言（dev/test 构建开启，生产构建在回合末统一检查） |
| D4 | 迭代顺序：数组按索引；`Map/Set` 仅在插入顺序确定时使用；禁止依赖对象键顺序的逻辑 | 代码审查 + `guard-for-in` |
| D5 | 排序稳定且全序，平局按 ID | `assertTotalOrder` 测试工具 |
| D6 | PRNG：标准 PCG32（§2.2） | golden vectors |
| D7 | 浮点累加固定顺序，禁止并行归约 | 代码审查 |
| D8 | 状态哈希：§2.5 | golden vectors |
| D9 | 计时与日志不得影响状态：`timingsMs`、调试日志由宿主通过观察者采集；观察者只接收步骤 ID，异常被隔离吞掉（§5.1） | ESLint + 审查 |
| D10 | 字符串比较只用码点/字节序（禁止 `localeCompare`、`Intl.*`、`toLocale*`） | ESLint `no-restricted-properties` |
| D11 | 输入确定：sim 只接受经 schema 校验的输入（content.json、世界包、命令）；命令按 Worker 串行队列顺序处理；sim 内无异步、无宿主回调影响状态 | 代码审查 + 类型 |
| D12 | 写入窄类型 TypedArray 前必须经 `writeChecked`（有限性 + 范围 + 整数性检查），禁止直接赋值（隐式截断/回绕） | ESLint 自定义规则 + 测试 |

> lint 是辅助手段而非充分证明；确定性最终由跨引擎回放与首个差异定位工具（§2.6）保证（回应 R117）。

### 2.2 PRNG：标准 PCG32 XSH-RR 64/32（回应 R011）

- 内部 64 位 `state` 与 64 位 `inc`（奇数），JS 中各以 `(hi, lo)` 两个 uint32 表示；64 位乘加按 16 位分块用 `Math.imul` 与 `>>> 0` 实现，乘数 `6364136223846793005`（PCG 官方常数）。
- 初始化：遵循 PCG 官方 `pcg32_srandom_r(initstate, initseq)` 流程。
- **种子派生（回应 R116）**：
  - SplitMix64 指 Vigna 的标准**生成器**：`state = state + 0x9E3779B97F4A7C15 (mod 2^64)`；`z = state`；`z = (z ^ (z >>> 30)) × 0xBF58476D1CE4E5B9`；`z = (z ^ (z >>> 27)) × 0x94D049BB133111EB`；输出 `z ^ (z >>> 31)`（全部 mod 2^64，以双 uint32 实现）。
  - `gameSeed64`：玩家 uint32 种子零扩展为 SplitMix64 初始 state，取第 1 个输出。
  - 系统 k：`initstate_k` = 以 `gameSeed64 ^ k` 为初始 state 的 SplitMix64 第 1 个输出；`initseq_k = k`（PCG 规则 `inc = (initseq << 1) | 1`）。
  - **系统 ID 全表（冻结；增删需 simVersion +1）**：`1 AI`、`2 EVENTS`、`3 PROJECTS`、`4 ECONOMY`、`5 POPULATION`、`6 MISC`。渲染装饰抖动用 TileId 哈希，不用 PRNG 状态。
- **流策略**：每系统一条连续流（跨回合不重置），状态只存在于规范状态内（§2.5）。
- **取样**：`nextU32()`；`nextFloat01()` = `nextU32() / 2^32`；`nextBelow(n)`：n 合法域为整数 `[1, 2^32 − 1]`，否则抛错；Lemire 32 位无偏拒绝采样：`m = nextU32() × n`（64 位积，双 uint32）、`l = m mod 2^32`；若 `l < n`，令 `t = (2^32 − n) mod n`，当 `l < t` 时重抽（每次消费 1 个 U32）；返回 `floor(m / 2^32)`。
- **测试向量**（P1a 从官方 C 实现与独立 Python 参考实现运行生成后入库，不凭记忆填写）：PCG `(42, 54)` 前 32 个输出；种子 0 与 `2^32−1`；6 个系统各 16 个输出；`nextBelow` 在 n = 1、3、2^31+1、2^32−1 及触发拒绝分支的样例；跨回合存读档后的续接输出。
- 修改 PRNG 或消费顺序 = `simVersion` +1。

### 2.3 确定性数学库 `sim/math`（回应 R034）

| 函数 | 有效域 | 精度 | 越域行为 |
|---|---|---|---|
| `exp(x)` | `[−700, 700]` | 相对误差 ≤ 1e-13 | `x < −700` → 返回 0（定义为下溢）；`x > 700` → 抛 `MathDomainError`（视为 bug） |
| `ln(x)` | `[1e-300, 1e300]` | 绝对误差 ≤ 1e-13（x∈[0.5,2]），其余相对 ≤ 1e-13 | `x ≤ 0` → 抛错 |
| `pow(x, y)` | `x > 0`，`|y·ln x| ≤ 700` | 由上两者组合 | 同上；`x == 0` 时由调用方显式分支处理 |
| `logisticSigmoid(x)` | 全实数 | 1e-13 | `x > 40` 返回 1、`x < −40` 返回 0（固定阈值） |
| `softmaxStable(v[])` | 有限值数组 | — | 先减最大值；空数组/全 −∞ 由调用方处理 |

- 实现：范围约化 + 固定系数多项式（系数以**双精度位模式**常量入库，运算顺序固定）。P1a 同时测**吞吐**：45 万次 exp + 45 万次 ln 的耗时（桌面与 iPad 真机），供 11 §4.3 预算使用（回应 R122）。系数与误差在 P1a 用高精度参考（Python `mpmath`）验证并生成测试集（0、负数、域边界、极端指数、随机 100 万点）。
- 所有模型公式中可能为 0 的输入（就业、资本、可达性、住房、需求）必须在调用 `ln/pow` 前显式分支（09、10、11 中逐处定义）。

### 2.4 数值表示
- 持久整数量（货币万元、人口人、计数）：`number` 存储，保证安全整数范围。
- 中间计算：允许 double；**任何「量 × 比例系数」的乘法若可能超过 2^53，须先除后乘或使用比例 ≤ 1 的形式**；dev 构建对关键乘法点加 `assertSafe()`。
- 定点比率：`Fixed4`（×10,000，int32）。
- **写入即规范（替代 V0.2「回合末量化」，回应 R105）**：持久字段每次写入经 `writeChecked(field, v)`：有限性 → 按 scale 用 `rhaz`（04 §2.3）量化 → 范围与整数性 → `−0` 归一 → 写入；失败抛 `StateInvariantError`。回合中途与回合末状态都已是规范值，存档不改变任何值。
- 可能超出安全整数或窄类型的乘法先做上界检查（`assertSafe`），在任何分支使用其结果之前完成。
- 整数分配（人口、资金按比例拆分）一律**最大余数法**，余数平局按实体 ID 升序。

### 2.5 规范状态编码 CSE-1 与哈希（回应 R012、R105）

规范状态 = 一个 CCB 文件（06 §2，containerVersion 2），段顺序 = 段名 ASCII 升序：

| 段 | 内容 |
|---|---|
| `meta`（json，CCJ-1） | 语义头：`stateSchemaVersion`、`simVersion`、`worldIdentity`（scenario-cal 叶子）、`contentHash`、`turn`、`gameOver`、`mode`、`controller`、`seed`、`revision`、`acceptedSeqNext` |
| `<表>.id`（u32） | 实体表**有效行的显式 ID**，升序 |
| `<表>.<列>` | 有效行的列值，与 `.id` 对齐；dtype/单位/scale 由 `state-fields.json` 规定 |
| `<表>.next_id`（u32，count 1） | 下一个 ID（ID 不复用；删除即从 `.id` 中消失） |
| `tiles.<列>` | 格动态列，按窗口 localIndex 全长度 |
| `rng.<系统名>`（u32×4，count 1） | PCG32 state(hi,lo)、inc(hi,lo) |
| `xs.<名称>` | 影响后续结果的跨回合量：交通上一回合流量、价格指数、库存、在建工程、待决事件、协议、AI 持久记忆 |

- CCB 自带每段名称、dtype、arity、count、长度与 CRC，**提供完整 framing**，变长列不会拼出相同字节串；有效行带显式 ID，可复原空槽。
- **`state-fields.json`**：每个持久字段 `{id, dtype, arity, unit, scale, min, max, integer, owner}`。L1 冻结编码规则与 V1 核心字段（§3.1）；P3a-A0 补全；之后增删字段 = `stateSchemaVersion` +1 并提供迁移函数。
- **哈希**：`stateHash = hex8(xxHash32(cse, 0)) ∥ hex8(xxHash32(cse, 0x9E3779B1))`，每路 8 位小写十六进制（补零）；`cse` = 整个 CSE-1 字节。语义头使哈希绑定世界/内容/规则版本。**非密码学用途**，只用于确定性与存档一致性校验（回应 R116）。
- **不纳入**：`timingsMs`、调试日志、ViewModel、可确定性重建的缓存（有「丢弃后继续运行哈希不变」测试）。

### 2.6 差异定位工具（回应 R117）
跨引擎回放哈希不一致时，测试工具导出两端 CSE-1，逐段比较并报告**首个不同的段名、元素索引与字节偏移**。

## 3. 状态模型

### 3.1 V1 核心持久字段（L1 冻结；完整清单见 `state-fields.json`，P3a-A0 补全）

| 表/区 | 字段（单位） |
|---|---|
| meta | 见 §2.5 |
| `provinces` | `cash`、`debt`（万元，安全整数）、`taxBand`（1–5）、`spending.*`（Fixed4）、`policySlots`、`researchPoints`、`aiMemory.*` |
| `central` | `cash`、`debt`（万元） |
| `cities` | `popUrban`、`popRural`（人）、`housingCap`、`serviceEdu`、`serviceHealth`、`amenity`、`satisfaction`、`capital.*`（万元）、`employment.*`（人）、`priceIndex.*`（Fixed4）、`inventory.*`（万元） |
| `city_tile_pop` | CSR `(city_id, tile_id, pop)`（09 §3.3） |
| `edges` | 动态列：`status`、`condition`、`openTurn`、`ownerProvince`、资金份额 CSR |
| `works` | 在建工程：`kind`、`target`、`totalCost`、`paid`、`periodsLeft`、出资份额 CSR |
| `agreements`、`events_pending`、`projects` | 状态、参与方、截止回合 |
| `xs.*`、`rng.*` | §2.5、§2.2 |
| `history` | 关键指标时间序列（整数或 Fixed4） |

### 3.2 其他
- 实体表：列式 + `alive`；ID 不复用；表容量增长不影响哈希（只序列化逻辑有效行）。
- TileStore 动态列：`pop`（整数人）、`zone`、`building`、`urbanLevel`、`pollution`、`ecology`、`surveyed`、`infraFlags`。
- 新增 `controller` 元数据（§6.1）。

## 4. 回合与时间
- 回合 0 = 2021Q1 未结算（01 §3.2）；`endTurn` 结算当前回合并进入下一回合；最后回合 119（2050Q4）结算后 `gameOver = true`。

## 5. 回合管线（固定顺序）

```
endTurn(state):
  0. 关闭玩家命令窗口；在回放日志记录 EndTurn 边界（§6.4）
  1. AI：基于步骤 0 之后的同一只读快照，所有 AI 省生成候选；按 12 §5.3 冲突规则依次以 AI 身份执行
     （与玩家同一执行路径，但不写入回放日志——回放时由相同 seed/state 重算）
  2. 工程推进（含按期扣款，§6.3）
  3. 交通（10 §5）
  4. 经济（11 §4）
  5. 财政（11 §5）
  6. 人口（使用步骤 3 本回合的成本矩阵与可达位图、步骤 4 本回合工资）
  7. 城市
  8. 研发与政策
  9. 事件（需选择的进入待决，下回合开始展示）
 10. 国家项目（投标统一结算）
 11. 计分与历史
 12. 不变量检查、stateHash、差量；turn += 1；若 turn == 120 → gameOver = true
```

### 5.1 计时与观察者（回应 R024）
`endTurn(state, observer?)`：`observer.onStepStart(stepId)` / `onStepEnd(stepId)` 由宿主（sim-worker）实现并在宿主侧读取时间；sim 本身不调用任何计时 API。`TurnResult.timingsMs` 由宿主填充。

### 5.2 预算
软目标合计 ≤ 1,070 ms，硬上限 1,500 ms；工程推进与研发计入「其他」（15 §2.2，回应 R122）。

## 6. 命令语义（回应 R013、R014）

### 6.1 控制者与权限
```
controller：{ kind: 'player', scope: 'province', province: P } | { kind: 'player', scope: 'nation' } | { kind: 'ai', province: P } | { kind: 'system' }
actingProvince：命令以哪个省的名义执行（扣谁的钱、建在谁的辖区）
```
- 省级玩家：`actingProvince` 必须等于自己的省；跨省线路须对方同意（协议机制）。
- 全国沙盒：可为任何省执行命令（`actingProvince` 任意）；无竞赛与计分。
- 宿主（sim-worker）提供真实 `Controller`，sim 校验权限；回放日志记录每条命令的授权主体。
- AI：只能以自己的省执行。
- `system`：仅事件与中央规则内部使用，不出现在外部命令中。

### 6.2 生命周期：提交即原子生效（回应 R013、R108）
1. 宿主生成 `commandId`（UUIDv4）与 `payloadDigest = hex(SHA-256(CCJ-1(命令去掉 commandId、clientSeq)))`。
2. Worker 串行处理：`commandId` 已在幂等账中——digest 相同 → 返回 `duplicate`（只含原 `acceptedSeq` 与**当前** revision，**不含差量**）；digest 不同 → 拒绝 `COMMAND_ID_CONFLICT`。
3. 否则 `validate` → 原子 `apply` → 分配 `acceptedSeq` → 写回放日志与幂等账 → 返回 `{accepted, acceptedSeq, revision, diff}`。
4. 拒绝：返回原因；不写日志、不入幂等账（同 commandId 重试按新请求校验）。
5. 命令携带 `baseTurn`；与当前回合不同 → `STALE_TURN`。
6. 取消：`CancelOrder` 为新命令，按 §6.3 处理。
7. 幂等账与回放日志随存档持久化（06 §7），读档后重试仍幂等。

### 6.3 工程与跨省出资：单一账本（回应 R107）
- 模式：「**承诺比例、按期原子扣款、不预扣**」。
  - 开工（`BuildLink` / `Construct` / 协议生效）只登记 `works` 行：`totalCost`、`periods`、出资份额（基点整数，Σ = 10,000），不扣款。
  - 每回合步骤 2：本期应付 = `totalCost` 按期数最大余数法拆分的本期额；各方份额同样最大余数法拆分；**所有出资方现金都够才原子扣款并推进**，否则本期整体顺延（不部分扣款）。
  - 取消：未付部分不再支付；已付部分不退（沉没成本）；不存在凭空增减。
  - 协议接受：校验双方至少能付首期（不扣款），否则拒绝。
- 11 §5.1 的跨省出资按本节执行。

### 6.4 回放日志（回应 R106）
- **唯一权威回放日志** = 玩家已接受命令（`turn`、`acceptedSeq`、`controller`、完整命令）+ 每次 `EndTurn` 边界 + 终局标记；空回合也有 EndTurn。
- AI 命令**不进入**回放日志；回放时由同一 seed 与状态重算。可选保存 AI 轨迹（每回合 AI 命令摘要与哈希）用于诊断，不参与重放。
- AI 生成的实体 ID 用状态内确定性计数器（`next_id`），不用 UUID。
- 回放用例：0 玩家命令、连续空回合、被拒命令（不在日志）、事件选项、AI 全开、回合中途存读档、终局后命令被拒。

### 6.5 路线报价（回应 R107）
- `RoutePreview` 返回确定性报价 `{mode, waypoints, actingProvince, tiles, cost, periods, topologyRevision, paramsRevision}`，`quoteDigest = SHA-256(CCJ-1(报价))`。
- `BuildLink` 携带 `waypoints`、`expectedCost`、`expectedPeriods`、`quoteDigest`；sim **用当前权威状态重新计算**路径与成本（A* 与参数确定），摘要不同 → `QUOTE_STALE`。不依赖 UI 缓存，回放与读档后同样可验证。

## 7. 差量与修订号
- 每次状态变化产生 `StateDiff` 与新 `revision`（单调递增，持久化于 meta）；差量带 `baseRevision`。主线程只在 `gameId` 匹配且 `baseRevision == 本地 revision` 时应用，否则请求全量快照（14 §6 `snapshot`）。
- 预算（回应 R122）：常规回合差量 ≤ 512 KiB；单条消息 ≤ 4 MiB，超过则按同一 revision 分片，全部到齐才应用；主线程**分帧应用**，每帧 ≤ 4 ms，期间 UI 处于「结算展示中」锁定态；全列发送（如 pop ≈ 320 KiB）的峰值单独度量。

## 8. 公开 API
见 14 §5；Worker 协议见 14 §6。

## 9. 开发期默认驱动量（回应 R001）

### 9.1 未实现子系统的默认值（P3/P4 使用，provenance = `fixture-default`）

| 子系统未实现时 | 替代输入 |
|---|---|
| 经济（P3、P4） | `wageIndex(c) = 1.0`；`unemployment = 0.05`；就业 = 劳动年龄人口 × 0.7 |
| 交通（P3） | `C_ij = 直线距离(km) × 0.5`（单位：广义成本）；`Access(c) = Σ_j P_j·exp(−0.002·C_ij)` |
| 财政（P3、P4） | 服务水平固定为初始值 |
| 政策/事件/AI（P3–P6） | 关闭（P6 校准时同样关闭，11 §6） |

## 10. 验收
1. 同一回放在 Chromium、Firefox、WebKit（Playwright）与 Node 以及桌面 Safari 与 iPadOS Safari 真机中逐回合 `stateHash` 一致（P3a-A5）。
2. 存档→读档→继续 = 直接继续（哈希一致）；「丢弃可重建缓存后继续」哈希一致。
3. 重复提交同一 `commandId` 不重复执行；乱序/缺口差量触发 resync。
4. 极端值测试：容量扩张、ID 删除后新增、`−0`、超大值断言触发。
5. ESLint 确定性规则（含别名绕过）零违规；`sim` 无 DOM lib 下 `tsc` 通过。
