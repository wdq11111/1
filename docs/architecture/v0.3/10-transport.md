# 10 交通系统（M2）

## 1. 范围
模式：高速公路、普通干线公路、普速铁路、高速铁路、内河航道、海运、航空，以及**换乘/接驳/渡运**三类连接边（回应 R016）。城市内部交通不单独模拟。

## 2. 网络模型：有向多模态图（回应 R016）

### 2.1 构建顺序
真实拓扑 → 有向图 → 格路径映射 → 收缩（05 §5.3 `65_networks`）。只有真实共享节点、站点或渡运才产生连接；**同格相交不代表连接**。

### 2.2 节点

| `nodeKind` | 含义 |
|---|---|
| `junction` | 同模式线路真实交汇点 |
| `station_rail` / `station_hsr` | 铁路车站 / 高铁站 |
| `interchange` | 高速出入口 |
| `port` / `river_port` / `airport` | 设施 |
| `city_hub` | 城市虚拟枢纽（每城市 1 个） |
| `town_hub` | 城镇虚拟枢纽 |
| `ext_market` | 外部市场（口岸） |

### 2.3 边（全部**有向**；双向线路存为两条边，共享 `lineId`）

| `edgeKind` | 说明 |
|---|---|
| `link` | 实际线路区段（带 `mode`） |
| `transfer` | 同一枢纽内设施之间、设施与 `city_hub` 之间的换乘边（带时间惩罚） |
| `access` | `town_hub` ↔ `city_hub` 接驳（代表县乡道路） |
| `ferry` | 真实渡运航线 |
| `sea_lane` | 港口间海运航道（管线生成航道骨架，只经海洋格） |
| `air_route` | 航线（§2.5 稀疏生成） |

边属性：`from, to, edgeKind, mode, lineId, lengthKm, t0Minutes（自由流时间）, capPax（万人次/季度）, capFreight（万吨/季度）, allowPax, allowFreight, status, openTurn, ownerProvince, fundingShares, condition, geomRef, structure（none|bridge|tunnel）`。
- 客运与货运**分别准入**：例如高铁 `allowFreight = 0`；航空货运容量单列。
- 容量为 0 的边：在对应类别图中不出现（不进入 BPR 计算）。

### 2.4 持久 schema（回应 R016、R110）

**ID 域**（06 §3 体系，哨兵 = 类型最大值）：`NodeId u32`、`EdgeId u32`、`LineId u32`、`FacilityId u16`、`PoolId u32`、`GeomRef u32`。

**模式编码**：`mode u8`：`0 = 非物理连接（transfer/access）`，`1–7` = 物理模式（14 §1 `TransportMode`）；`ferry` 与 `sea_lane` 的 mode = `6 Sea`，`air_route` 的 mode = `7 Air`；`edge_kind` 区分边种类。

**节点表**（`networks.osm.ccb`）：`node_kind u8`、`node_tile u32`、`node_x i32`、`node_y i32`（整数米）、`node_settlement u16`、`node_facility u16`。

**边表**：
| 字段 | 类型 | 说明 |
|---|---|---|
| `from`, `to` | u32 | 有向 |
| `edge_kind` | u8 | 14 §1 `EdgeKind` |
| `mode` | u8 | 见上 |
| `line_id` | u32 | 同一物理线路的双向边共享；渲染按 line_id 去重 |
| `length_km` | f32 | — |
| `t0_min` | f32 | 自由流时间（分钟），**严格 > 0**（下限 0.01，回应 R118） |
| `cap_pax` / `cap_freight` | f64 | 万人次/季度、万吨/季度；**按方向**给出（数据为双向总量时按 50/50 拆分并标 `estimated`） |
| `allow` | u8 | bit0 客、bit1 货 |
| `pool_id` | u32 | 共享吞吐资源（容量池）引用；无 = 哨兵 |
| `fare_pax` | f32 | 元/人次（该边） |
| `cost_freight` | f32 | 万元/万吨（该边） |
| `status` | u8 | 0 规划 1 在建 2 运营 3 停运 |
| `open_turn` | i16 | −1 = 场景开始前已开通 |
| `structure` | u8 | 0 无 1 桥 2 隧 |
| `owner_province` | u16 | 运营归属；**初始真实线路未知 → 哨兵并在 lineage 标 `unknown`**，游戏中视为中央运营（运营收支进入中央账户） |
| `condition` | u16 | 0–1000；初始真实线路默认 1000 并标 `fixture-default` |
| `geom_ref` | u32 | 指向 `geom_index.ccb` |

**资金份额**：CSR `funding_offsets u32[E+1]`、`funding_province u16[]`、`funding_bp u16[]`（基点，Σ = 10,000）；初始真实线路为空（中央）。

**容量池**（`facilities.ccb`）：`pool_id`、`facility_id`、`cap_pax`、`cap_freight`（方向无关的总吞吐，如港口、机场）；引用同一池的所有边共同受池容量约束（在 BPR 中以池利用率 `Σ v_e / cap_pool` 作为附加拥堵项），**不在多条边上复制额度**。

**几何索引**（`geom_index.ccb`）：`geom_chunk u16`、`geom_offset u32`、`geom_length u32`（指向 `render/lines/<chunk>.ccb` 中的顶点段）。

**格路径**：`edge_tiles_offset u32[E+1]`、`edge_tiles u32[]`。

完整性校验：端点、pool、geom、facility 引用存在；双向边成对；`allow` 与容量一致（容量 0 ⇔ 对应位为 0）。

### 2.5 海运与航空
- 海运航道：只在 `sea_lane` 骨架上路由；港口容量约束在港口节点 `transfer` 边上。
- **航空稀疏化（回应 R020）**：仅为满足等级条件的机场生成航线：每机场连接 (a) 同等级以上最近 k=6 个机场，(b) 全国前 m=10 个枢纽机场；距离 < 400 km 不生成。生成规则确定（按距离、平局按机场 ID）。估算：若 200 个机场，边数 ≤ 200×(6+10)×2 = 6,400 条有向边。

## 3. 建设
- 流程：`RoutePreview`（查询，返回报价版本 `quoteId`）→ `BuildLink(quoteId)`；报价在「拓扑修订号 + 价格参数修订号」不变时有效，否则命令被拒绝为 `QUOTE_STALE`（回应 R014）。
- 路径点统一为带类型的 `Waypoint = {kind:'node', id} | {kind:'tile', id}`（14 §3）。
- 成本模型与地形系数同 V0.1（参数来源要求不变）。
- **A\* 有界（回应 R021）**：格路径层 A\*，启发式 = 直线距离 × 最低单位成本（可采纳）；扩展上限 `maxExpansions = 20,000`（固定，非时间上限）；超限返回 `ROUTE_TOO_COMPLEX`，UI 提示增加途经点。

## 4. 需求
- 客运 OD（337²）：重力模型（参数 P4/P5 校准）；`C_ij` 不可达时该对需求为 0（记录为「潜在需求」用于 AI 与报告）。
- 货运 OD：上一回合经济贸易流（11 §4），按部门「价值→吨位」系数换算。

## 5. 流量分配（每回合，回应 R020、R118）

**性质声明**：玩法近似——单次全有全无分配 + 跨回合指数平滑，**不是**用户均衡求解。

```
对客运图、货运图分别：
 1. 边成本 c_e = t_e × VOT_class + 费用（t_e 为上一回合末计算的拥堵时间）；所有 c_e > 0
 2. 对每个有出发需求的 city_hub（≤ 337）：Dijkstra（CSR 邻接、预分配二叉堆、**惰性删除**而非 decrease-key、平局按节点 ID）
    记录 settle 顺序与前驱边（前驱在节点 settle 时确定，之后不改）
 3. 流量加载：按该起点的 **settle 顺序逆序**遍历节点，把子树需求累加到前驱边（无需额外排序；
    因 c_e > 0，前驱树无环）
 4. 平滑 v_e ← (1 − λ)·v_e + λ·y_e，λ = 0.5
 5. 新拥堵时间 t_e = t0_e × (1 + 0.15 × (min(v_e/cap_e, 3))^4) + 池拥堵项；**下一回合生效**
 6. 输出：成本矩阵 C（本回合路由实际使用的成本，即步骤 1 的成本）与可达位图 reach（337² bit）
```

- **可达性语义**：不可达**只**由 `reach[i,j] = 0` 表示；C 中不可达位置填哨兵 `UNREACHABLE = −1`（任何消费者必须先查 reach，禁止用 `isFinite` 判断）。OD 自环（i = i）：本地出行，成本 0，不进入网络加载。
- **复杂度（重估，未实测）**：V ≈ 6,000、E ≈ 20,000，两套图 × 337 起点：边松弛检查 ≈ 1.35×10⁷，节点 settle ≈ 4.0×10⁶；惰性删除堆最坏推入次数 ≈ 松弛成功次数（≤ E/起点），上界估算堆层级工作 ≈ (1.35×10⁷ + 4.0×10⁶) × 12.6 ≈ 2.2×10⁸ 基本操作（GPT 审查给出的上界；V0.2 的 6.4×10⁷ 为乐观估计）。**300 ms 软 / 500 ms 硬未经证实**，以 P1a-A6 实测为准（门禁见 18）。
- 不达标处理顺序：① 收缩更多（合并度 2 链、合并同站设施）；② 减少起点（合并近距离城市需求）；③ 路由核迁 WASM（ADR）。
- 删除 V0.2 之前的「成本变化 < 5% 复用最短路树」（无正确性保证）。

## 6. 输出
`C_pax`、`C_freight`、`Access(c) = Σ_{j∈可达} P_j·exp(−β·C_ij)`、边流量与利用率、运营收支（按 `fundingShares` 分配给省）。

## 7. 验收（P4 / P5）
1. 连通性按 05 V5（真实覆盖 + 审计例外清单）；不可达对只通过 reach 位图处理，消费者不产生非有限值。
2. 对照（回应 R104）：选 10 组有高铁直达的城市对，比较**模型高铁单模式在途时间**（同一对车站、只走 HSR 边、自由流）与时刻表来源中同一对车站的最快在途时间（来源与日期入库），误差 ≤ 25%；广义成本单独报告，不与时刻表比较。P5 验收。
3. 因果（垂直切片 fixture）：新建高铁后两城市间 `C_pax` 下降，新线流量 > 0，旧并行线流量下降。
4. 性能：P5 用**固定 OD（无 AI）**做全国交通单系统压力测试：≤ 300 ms 软 / 500 ms 硬（P95，桌面参考中档 A；iPad 预算见 15 §3）。31 省全 AI 下的整回合负载测试在 P7（回应 R113）。
5. `RoutePreview` P95 ≤ 50 ms（典型 500 km 线路）；`ROUTE_TOO_COMPLEX` 路径可触发且被 UI 处理。
6. 守恒：每个 OD 需求 = 加载到其路径首边的流量（逐起点检查）。
