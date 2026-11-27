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
| D9 | 计时与日志不得影响状态：`timingsMs`、调试日志由宿主通过观察者采集（§5.1） | ESLint + 审查 |

### 2.2 PRNG：标准 PCG32 XSH-RR 64/32（回应 R011）

- 内部 64 位 `state` 与 64 位 `inc`（奇数），JS 中各以 `(hi, lo)` 两个 uint32 表示；64 位乘加按 16 位分块用 `Math.imul` 与 `>>> 0` 实现，乘数 `6364136223846793005`（PCG 官方常数）。
- 初始化：遵循 PCG 官方 `pcg32_srandom_r(initstate, initseq)` 流程。
- **种子派生**：`initstate = splitmix64(gameSeed64 ⊕ systemId)`，`initseq = systemId`；`gameSeed64` 由 32 位玩家种子经 splitmix64 扩展。`systemId` 为固定枚举（AI=1、事件=2、项目=3、装饰=4（仅渲染侧，不入状态）……），列表冻结在 `sim/rng/systems.ts`。
- **流策略**：每系统一条**连续流**（跨回合不重置），状态随存档持久化（06 §7）。
- 取样：`nextU32()`；`nextFloat()` = `nextU32() / 2^32`；整数区间 `[0, n)` 用 Lemire 无偏拒绝采样的 32 位版本（规格写入代码注释与测试）。
- golden vectors：使用 PCG 官方最小实现对 `pcg32_srandom(42, 54)` 的前若干输出作为测试向量（向量值在 P1a 从官方 C 实现运行得到并入库，不在文档中凭记忆填写）。
- 修改 PRNG 或消费顺序 = `simVersion` +1。

### 2.3 确定性数学库 `sim/math`（回应 R034）

| 函数 | 有效域 | 精度 | 越域行为 |
|---|---|---|---|
| `exp(x)` | `[−700, 700]` | 相对误差 ≤ 1e-13 | `x < −700` → 返回 0（定义为下溢）；`x > 700` → 抛 `MathDomainError`（视为 bug） |
| `ln(x)` | `(0, 1e300]` | 绝对误差 ≤ 1e-13（x∈[0.5,2]），其余相对 ≤ 1e-13 | `x ≤ 0` → 抛错 |
| `pow(x, y)` | `x > 0`，`|y·ln x| ≤ 700` | 由上两者组合 | 同上；`x == 0` 时由调用方显式分支处理 |
| `logisticSigmoid(x)` | 全实数 | 1e-13 | 对大 |x| 直接返回 0/1 |
| `softmaxStable(v[])` | 有限值数组 | — | 先减最大值；空数组/全 −∞ 由调用方处理 |

- 实现：范围约化 + 固定系数多项式（系数作为十进制字符串常量入库，运算顺序固定）。系数与误差在 P1a 用高精度参考（Python `mpmath`）验证并生成测试集（0、负数、域边界、极端指数、随机 100 万点）。
- 所有模型公式中可能为 0 的输入（就业、资本、可达性、住房、需求）必须在调用 `ln/pow` 前显式分支（09、10、11 中逐处定义）。

### 2.4 数值表示
- 持久整数量（货币万元、人口人、计数）：`number` 存储，保证安全整数范围。
- 中间计算：允许 double；**任何「量 × 比例系数」的乘法若可能超过 2^53，须先除后乘或使用比例 ≤ 1 的形式**；dev 构建对关键乘法点加 `assertSafe()`。
- 定点比率：`Fixed4`（×10,000，int32）。
- **量化规则**：回合末对每个持久浮点字段执行 `q = roundHalfAwayFromZero(v × scale) / scale`（与 04 §2.3 同一舍入函数）；`−0` 归一为 `+0`；非有限值 → 抛 `StateInvariantError`（不静默修正）。
- 整数分配（人口、资金按比例拆分）一律**最大余数法**，余数平局按实体 ID 升序。

### 2.5 规范状态与哈希（回应 R012、R011）
- **规范序列化**：GameState → 固定顺序的段列表（字段顺序由 `sim/state/schema.ts` 中的有序列表定义）；每个实体表只序列化**有效行**（`alive = 1`）按 ID 升序，同时序列化 `nextId` 与已删除 ID 集合（删除状态影响后续 ID 分配）；TypedArray 按逻辑长度（非容量）写出，小端；字符串 UTF-8。
- **纳入哈希**：全部持久状态、PRNG 状态、在建工程、AI 持久记忆、跨回合缓存中**会影响后续结果**的部分（如交通上一回合流量 `v_e`、价格指数）。
- **不纳入**：`timingsMs`、调试日志、ViewModel、可从状态确定性重建的纯缓存（重建规则写入代码并有测试：「丢弃缓存后继续运行哈希不变」）。
- **算法**：`stateHash = hex(xxHash32(bytes, seed=0)) ∥ hex(xxHash32(bytes, seed=0x9E3779B1))`，共 16 个小写十六进制字符；`bytes` = 规范序列化结果。xxHash32 用官方测试向量验证。（选择两路 xxHash32 而非 xxHash64：避免 JS 中 64 位乘法的实现与性能成本；碰撞概率对回放校验足够。）

## 3. 状态模型
（结构同 V0.1 §3；以下为修订）
- 实体表：列式 + `alive`；ID 不复用；表容量增长不影响哈希（只序列化逻辑有效行）。
- TileStore 动态列：`pop`（整数人）、`zone`、`building`、`urbanLevel`、`pollution`、`ecology`、`surveyed`、`infraFlags`。
- 新增 `controller` 元数据（§6.1）。

## 4. 回合与时间
- 回合 0 = 2021Q1 未结算（01 §3.2）；`endTurn` 结算当前回合并进入下一回合；最后回合 119（2050Q4）结算后 `gameOver = true`。

## 5. 回合管线（固定顺序，修订：去掉重复执行命令，回应 R013）

```
endTurn(state):
  0. 关闭本回合命令窗口：记录 turnCommandRange（命令在提交时已执行，此处不再执行）
  1. AI 决策：所有 AI 省基于**同一份回合开始快照**的只读视图生成候选（回应 R039）；
     然后按「冲突解决规则」（12 §5.3）依次以 AI 身份提交命令（与玩家同一执行路径）
  2. 工程推进
  3. 交通（10 §5）
  4. 经济（11 §4）
  5. 财政（11 §5）
  6. 人口：自然增长 → 迁移（使用步骤 3 本回合交通成本矩阵与步骤 4 本回合工资，回应 R035 的口径矛盾：统一为「本回合已完成步骤的输出」）
  7. 城市
  8. 研发与政策
  9. 事件（新触发；需要玩家选择的事件进入「待决」状态，下回合开始时向玩家展示）
 10. 国家项目
 11. 计分与历史
 12. 量化、不变量检查、stateHash、差量
```

### 5.1 计时与观察者（回应 R024）
`endTurn(state, observer?)`：`observer.onStepStart(stepId)` / `onStepEnd(stepId)` 由宿主（sim-worker）实现并在宿主侧读取时间；sim 本身不调用任何计时 API。`TurnResult.timingsMs` 由宿主填充。

### 5.2 预算
步骤软目标合计 ≤ 1,200 ms，硬上限 1,500 ms（15 §2.2）。

## 6. 命令语义（回应 R013、R014）

### 6.1 控制者与权限
```
controller：{ kind: 'player', scope: 'province', province: P } | { kind: 'player', scope: 'nation' } | { kind: 'ai', province: P } | { kind: 'system' }
actingProvince：命令以哪个省的名义执行（扣谁的钱、建在谁的辖区）
```
- 省级玩家：`actingProvince` 必须等于自己的省；跨省线路须对方同意（协议机制）。
- 全国沙盒：可为任何省执行命令（`actingProvince` 任意）；无竞赛与计分。
- AI：只能以自己的省执行。
- `system`：仅事件与中央规则内部使用，不出现在外部命令中。

### 6.2 生命周期：提交即原子生效 + 日志唯一记录
1. 客户端提交 `Command`（带 `commandId`：会话内唯一的 UUIDv4 字符串，由宿主生成；`clientSeq` 单调递增）。
2. Worker 串行处理：`validate` → 通过则 `apply`（原子：要么全部状态变化生效，要么无变化）→ 分配 `acceptedSeq`（全局单调）→ 写入 cmdlog → 返回 `{accepted, acceptedSeq, diff, revision}`。
3. 拒绝：返回 `RejectReason`，不写日志，不改变状态。
4. **幂等**：同一 `commandId` 重复提交 → 返回第一次的结果，不重复执行。
5. 取消：`CancelOrder` 是新命令，执行补偿（退回未拨付资金，按规则扣除已发生费用）。
6. `endTurn` 执行期间提交的命令 → `BUSY` 拒绝。
7. 回放：按 `acceptedSeq` 顺序重放 cmdlog（含 AI 命令），结果确定。

### 6.3 跨省协作的事务
- `ProposeAgreement` 创建待定协议（对方下回合开始前响应，AI 在步骤 1 响应）；`RespondAgreement(accept)` 时一次性校验双方资金并原子扣款，任一方不足 → 整体拒绝，协议失效。

## 7. 差量与修订号
- 每次状态变化产生 `StateDiff` 与新的 `revision`（单调递增整数）；差量携带 `baseRevision`。主线程按 revision 顺序应用，发现缺口 → 请求全量快照（14 §5 `resync`）。
- 预算：常规回合差量 ≤ 512 KiB；单列变化 > 30% 时整列发送（全列 pop 约 8.2 万格 × 4 B = 320 KiB，int32），整列发送的成本单独度量（回应 R042）。

## 8. 公开 API
见 14 §2。

## 9. 开发期默认驱动量（回应 R001）

### 9.1 未实现子系统的默认值（P3/P4 使用，provenance = `fixture-default`）

| 子系统未实现时 | 替代输入 |
|---|---|
| 经济（P3、P4） | `wageIndex(c) = 1.0`；`unemployment = 0.05`；就业 = 劳动年龄人口 × 0.7 |
| 交通（P3） | `C_ij = 直线距离(km) × 0.5`（单位：广义成本）；`Access(c) = Σ_j P_j·exp(−0.002·C_ij)` |
| 财政（P3、P4） | 服务水平固定为初始值 |
| 政策/事件/AI（P3–P5） | 关闭 |

## 10. 验收
1. 同一回放在 Chromium、Firefox、WebKit（Playwright）与 Node 中逐回合 `stateHash` 一致；Safari 实机在 P9 签核。
2. 存档→读档→继续 = 直接继续（哈希一致）；「丢弃可重建缓存后继续」哈希一致。
3. 重复提交同一 `commandId` 不重复执行；乱序/缺口差量触发 resync。
4. 极端值测试：容量扩张、ID 删除后新增、`−0`、超大值断言触发。
5. ESLint 确定性规则（含别名绕过）零违规；`sim` 无 DOM lib 下 `tsc` 通过。
