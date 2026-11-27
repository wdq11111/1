# 06 数据格式

## 1. 世界包（World Package）目录结构

世界包 = 管线产物 = 客户端加载的全部数据。以内容哈希作为版本，部署路径不可变。

```
world/modern-2020/<packageHash>/
├── manifest.json            # 入口：版本、投影、网格参数、文件清单（含 hash、大小、加载阶段）
├── ATTRIBUTION.md           # 数据来源与署名（游戏内展示）
├── tiles.ccb                # 全部格子的模拟属性（SoA 列）
├── admin.ccb                # 行政区表
├── settlements.ccb          # 城市/城镇实体初始状态
├── networks.osm.ccb         # 交通网络（OSM 衍生，ODbL，独立文件）
├── economy.ccb              # 初始经济数据（城市×部门）
├── calibration.json         # 校准参数
├── compliance.ccb           # 合规图层几何 + 元数据（审图号、签核记录）
├── render/
│   ├── height_lo.ccb        # 全部 chunk 的 129² 常驻高度图（打包为一个文件）
│   ├── height_hi/<chunkId>.ccb   # 513² 细节高度图（流式）
│   ├── splat/<chunkId>.ktx2      # 土地覆盖权重贴图（流式）
│   ├── lines/<chunkId>.ccb       # 河流/海岸/边界/网络线带状网格（流式）
│   ├── labels.ccb           # 标注定义（文字、锚点、级别、优先级）
│   └── glyphs/              # MSDF 图集 (.ktx2) + 字形度量 (.json)
└── content.json             # 编译后的规则数据（来自 packages/content，带 contentHash）
```

`.ccb` = ChinaCiv Binary 容器（§2）。HTTP 层使用 Brotli 压缩（CDN 配置），容器内部不再压缩，以支持零拷贝 `TypedArray` 视图。

### 1.1 manifest.json（JSON Schema 摘要）

```jsonc
{
  "formatVersion": 1,                    // 世界包格式版本（整数，破坏性变更 +1）
  "scenarioId": "modern-2020",
  "packageHash": "sha256:…",             // 除 manifest 外所有文件 hash 的 Merkle 根
  "pipelineVersion": "git:abc1234",
  "distribution": "internal",            // internal | public
  "createdAt": "2026-…Z",                // 仅信息用途，不参与 hash
  "projection": { "proj": "+proj=aea …", "unit": "m" },
  "grid": {
    "orientation": "pointy",
    "radiusM": 12000,
    "originX": -2900000, "originY": 1700000,   // 示例值
    "cols": 260, "rows": 317,
    "chunkSize": 32, "chunkCols": 9, "chunkRows": 10
  },
  "chunks": [ { "id": 0, "empty": false, "bbox": [minX,minY,minZ,maxX,maxY,maxZ] } ],
  "files": [
    { "path": "tiles.ccb", "sha256": "…", "bytes": 1234567, "stage": "boot" },
    { "path": "render/height_hi/12.ccb", "sha256": "…", "bytes": 526000, "stage": "stream" }
  ],
  "contentHash": "sha256:…",
  "compliance": { "signed": false, "approvalNumber": null, "requiredFeaturesVersion": 1 }
}
```

`stage`：`boot`（开始游戏前必须加载）、`stream`（按视野加载）、`lazy`（打开相关界面时加载）。

## 2. CCB 二进制容器

小端序；所有段 8 字节对齐，便于直接创建 `Float64Array` 等视图。

```
偏移   大小   字段
0      4     magic = "CCB1"
4      2     containerVersion (u16) = 1
6      2     flags (u16)            // 保留，0
8      4     sectionCount (u32)
12     4     headerBytes (u32)      // 头 + 段表总长
16     8     reserved
24     N*56  段表，每项（56 字节）：
             name[24]    UTF-8, 不足补 0     例："elev_mean"
             dtype(u8)   0=u8 1=i8 2=u16 3=i16 4=u32 5=i32 6=f32 7=f64 8=utf8_table 9=json
             arity(u8)   每元素分量数（如 top3 类别 = 3）
             reserved(u16)
             count(u32)  元素数
             offset(u64) 相对文件起始
             bytes(u64)
             crc32(u32)
             reserved(u32)  // 24+1+1+2+4+8+8+4+4 = 56 字节
…            数据段（8 字节对齐）
```

- `utf8_table`：`u32 count` + `u32[count+1] offsets` + 拼接的 UTF-8 字节（用于名称列）。
- `json`：UTF-8 JSON 文本（用于少量元数据）。
- 读取器（`packages/world-format`）：校验 magic/版本/CRC，返回 `{ [name]: TypedArray | string[] | object }`，**不拷贝**数值段。
- Python 写出器（`pipeline/io`）与 TS 读取器有契约测试：Python 写 → TS 读 → 比对每段 hash。

## 3. tiles.ccb 段定义（count = cols × rows，按 TileId 顺序）

| 段名 | dtype×arity | 说明 |
|---|---|---|
| `domain` | u8 | 0=外域背景 1=中国可经营 2=中国不可经营（V1 中台港澳，见 D-03）3=海洋 |
| `terrain` | u8 | `terrainType` 枚举（05 §5.6） |
| `land_frac` | u8 | 陆地占比 0–100 |
| `elev_mean` / `elev_min` / `elev_max` / `elev_p90` | i16 | 米 |
| `elev_std` | u16 | 米 |
| `slope_mean` | u8 | 度 × 2（0.5° 精度） |
| `lc_top3_class` | u8×3 | 土地覆盖类别 |
| `lc_top3_pct` | u8×3 | 占比 |
| `cropland_km2` / `forest_km2` / `builtup_km2` | u16 | km² × 10 |
| `temp_mean` | i16 | °C × 10 |
| `precip` | u16 | mm |
| `river_edges` | u8 | 低 6 位：方向 0–5 的边上有河流 |
| `river_class` | u8 | 0 无，1–4 等级 |
| `coastal` | u8 | 0/1 |
| `province_idx` / `prefecture_idx` | u16 | 行政表索引，0xFFFF = 无 |
| `county_idx` | u16 | 同上 |
| `pop_2020` | u32 | 人 |
| `resource` | u8×2 | 资源类型、储量等级（游戏化近似） |
| `settlement_idx` | u16 | 该格的主要城镇实体索引，0xFFFF = 无 |

总量估算：约 50 字节/格 × 8.2 万 ≈ **4.1 MB**（Brotli 后预计 1–1.5 MB）。

## 4. 实体表

### 4.1 admin.ccb

| 段 | 说明 |
|---|---|
| `code` u32 | 民政部 6 位区划代码 |
| `level` u8 | 1 省 2 地 3 县 |
| `parent_idx` u16 | |
| `name` utf8_table | 标准名称 |
| `name_short` utf8_table | 简称（如「川」）——仅省级 |
| `area_km2_official` f32 | 官方面积（用于验证） |
| `tile_count` u32 | |
| `capital_settlement_idx` u16 | 行政中心 |

### 4.2 settlements.ccb

`kind`（1 直辖市 2 省会 3 地级市 4 县级市 5 县/区/旗 中心）、`admin_idx`、`tile_id`、`name`、`pop_urban_2020`、`pop_total_2020`、`gdp_2020`（万元）、`attached_to`（冲突降级时指向主城镇，否则 0xFFFF）、`provenance_idx`。

### 4.3 networks.osm.ccb

- `node_tile_id` u32[N]、`node_kind` u8（0 普通转折 1 城镇 2 枢纽 3 港口 4 机场）
- `edge_from` / `edge_to` u32、`edge_mode` u8（1 高速公路 2 普通公路 3 普速铁路 4 高速铁路 5 内河航道 6 海运 7 航空）
- `edge_tiles_offset` u32[E+1] + `edge_tiles` u32[...]：每条边经过的格序列
- `edge_length_km` f32、`edge_design_speed` u16（km/h）、`edge_capacity` u32（年运能，单位见 10 §3）、`edge_open_year` u16

### 4.4 economy.ccb

按「城市 × 部门」矩阵：`output`（f64，万元）、`employment`（f64，人）、`capital`（f64）、`estimated` u8 标记。部门顺序由 `content.json` 中 `sectors` 列表定义。

## 5. 溯源（provenance）

- `provenance.json`（lazy 加载）：`[{ idx, source_id, version, stage, method, note }]`。
- 实体与字段通过 `provenance_idx` 引用；UI「数据来源」提示可显示任一数值的来源链。

## 6. 规则数据（content）

YAML 源示例（`packages/content/rules/buildings.yaml`）：

```yaml
- id: building.industrial_park
  name: { zh: 产业园区, en: Industrial Park }
  category: district
  cost: { capital: 120, upkeep: 4 }        # 单位：亿游戏元；upkeep 为每回合
  build_turns: 4
  requires: { tech: [tech.modern_manufacturing], terrain_not: [mountain, high_mountain, glacier, ocean, lake] }
  effects:
    - { target: tile, stat: sector_capacity.manufacturing, op: add_pct, value: 25 }
    - { target: city, stat: pollution, op: add, value: 2 }
```

- 编译器：YAML → Zod 校验 → 引用完整性检查（所有 `tech.*`、`building.*` ID 存在、无循环依赖）→ 生成稳定整数索引（按 ID 字典序）→ `content.json` + `contentHash`。
- `effects` 采用**受限的声明式效果语言**：`target ∈ {tile, city, province, nation}`，`op ∈ {add, add_pct, mul, set, unlock}`；**不允许**在 YAML 中写表达式或脚本（避免变成第二门编程语言，也保证确定性与可审查）。需要复杂逻辑时在系统代码中实现并给出命名效果，如 `{ op: special, id: hsr_station_bonus }`。

## 7. 存档格式

```
save/<slot>.ccsave = CCB 容器，段：
  meta (json)          : { saveVersion, worldPackageHash, contentHash, seed, turn, playerProvince, createdAt, simVersion }
  state_* (多段)       : GameState 完整快照（SoA 列 + 实体表），与运行时内存布局一致
  cmdlog (json)        : 自上一个快照以来的命令列表（用于回放与调试）
  stateHash (utf8)     : 快照状态哈希
```

- **存储位置**：IndexedDB（自动存档 3 个轮换槽 + 手动槽）；支持导出/导入文件。
- **兼容策略**：`saveVersion` 不同 → 通过 `world-format/migrations/` 中逐版本迁移函数升级；`worldPackageHash` 不同 → 提示「地图数据已更新，该存档需用旧版本数据」（客户端按 hash 从 CDN 拉取旧世界包，旧包至少保留 2 个大版本）。
- **回放文件**：`.ccreplay` = `meta + 初始种子 + 全部命令日志`，体积小，用于 bug 报告与确定性测试。

## 8. 版本号体系

| 版本 | 含义 | 变更规则 |
|---|---|---|
| `formatVersion` | 世界包格式 | 字段增删改 |
| `containerVersion` | CCB 容器 | 二进制布局变化（应极少） |
| `saveVersion` | 存档 | GameState 结构变化 |
| `simVersion` | 模拟规则语义 | 同输入结果会改变的任何修改（用于判断回放是否可复现） |
| `contentHash` | 规则数据 | 自动 |
| `packageHash` | 世界包 | 自动 |
