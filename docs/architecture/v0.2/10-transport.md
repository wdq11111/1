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

### 2.4 CCB schema（`networks.osm.ccb`，替代 V0.1 §4.3）
节点表：`node_kind u8, node_tile u32, node_settlement u16, node_facility u16`；
边表：`from u32, to u32, edge_kind u8, mode u8, line_id u32, length_km f32, t0_min f32, cap_pax f64, cap_freight f64, allow u8 (bit0 pax, bit1 freight), status u8, open_turn i16（−1 = 场景开始前已开通）, structure u8, geom_ref u32`；
格路径：`edge_tiles_offset u32[E+1], edge_tiles u32[]`；
渲染几何：在 `render/lines/` 中按 `geom_ref` 引用。

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

## 5. 流量分配（每回合，回应 R020）

**性质声明**：这是**玩法近似**——单次全有全无分配 + 跨回合指数平滑，**不是**用户均衡求解，不保证收敛到均衡。

```
对客运、货运两套图分别执行：
 1. 边成本：c_e = t_e(上一回合平滑流量) × VOT_class + fare_e（不可准入的边不在该图中）
 2. 对每个有出发需求的 city_hub（≤ 337）运行 Dijkstra：CSR 邻接、预分配二叉堆（TypedArray）、平局按节点 ID
 3. 流量加载：对每个起点，按最短路树**逆拓扑序（按距离降序）一次性累加子树需求**得到边流量（O(V) / 起点），不逐 OD 回溯路径
 4. 平滑：v_e ← (1 − λ)·v_e + λ·y_e，λ = 0.5
 5. 拥堵：t_e = t0_e × (1 + 0.15 × (v_e / cap_e)^4)，cap_e > 0；利用率 > 3 时按 3 截断（避免数值爆炸）
 6. 输出 C_pax、C_freight（337² Float64Array），不可达 = +∞ 的哨兵（实现用 1e30）
```
- **复杂度估算**（未实测）：设收缩图 V ≈ 6,000、有向边 E ≈ 20,000（含 transfer/access/air）。每套图 337 次 Dijkstra，每次约 E 次松弛 + V·log₂V ≈ 2.0×10⁴ + 7.5×10⁴ 堆操作 → 每套约 3.2×10⁷ 基本操作，两套约 6.4×10⁷；加载 O(337·V) ≈ 2×10⁶。
- **预算**：软目标 300 ms、硬上限 500 ms（参考中档 A）。P1a 用合成图（3k/6k 节点 × 5k/10k/20k 边 × 两套权重 × 最坏拥堵）实测 P50/P95；不达标的处理顺序：① 收缩更多（合并度为 2 链、合并同站多设施）；② 减少起点（城镇需求聚合到城市已是如此）；③ WASM 热点（ADR）。
- V0.1 的「成本变化 < 5% 复用最短路树」**删除**（无法保证正确性）。

## 6. 输出
`C_pax`、`C_freight`、`Access(c) = Σ_{j∈可达} P_j·exp(−β·C_ij)`、边流量与利用率、运营收支（按 `fundingShares` 分配给省）。

## 7. 验收（P4 / P5）
1. 连通性按 05 V5（真实覆盖 + 白名单），不可达对被正确处理（不产生 NaN）。
2. 对照：10 组城市对最快客运时间与 2020 年真实最快车次时间误差 ≤ 25%（对照表与来源入库）——P5 验收（需完整网络）。
3. 因果（垂直切片 fixture）：新建高铁后两城市间 `C_pax` 下降，新线流量 > 0，旧并行线流量下降。
4. 性能：交通 ≤ 300 ms 软 / 500 ms 硬（31 省全 AI 场景，第 40–80 回合区间的 P95）。
5. `RoutePreview` P95 ≤ 50 ms（典型 500 km 线路）；`ROUTE_TOO_COMPLEX` 路径可触发且被 UI 处理。
6. 守恒：每个 OD 需求 = 加载到其路径首边的流量（逐起点检查）。
