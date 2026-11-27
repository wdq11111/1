# 06 数据格式

## 1. 世界包

### 1.1 目录（三层，05 §5.1）

```
world/<layer>/<identity>/          layer ∈ base-geo | scenario-raw | scenario-cal
base-geo:
  manifest.json
  ATTRIBUTION.md
  tiles_geo.ccb          # 格静态地理列（§4.1）
  xwalk.ccb              # 格×县交叉表（04 §4.1）
  admin.ccb              # 行政区表
  settlements.ccb        # 城镇锚点与级别（无统计值）
  islands.ccb            # 小岛要素
  compliance.ccb         # 合规层（stage=boot）
  render/
    relief_lo.ccb        # 每 chunk 129² 高程（A 档晕渲 / B 档远景）
    coast_sdf/<chunk>.ktx2
    lines/<chunk>.ccb    # 河流、海岸、边界线带状网格
    labels.ccb ; glyphs/
    height_hi/<chunk>.ccb  # 仅 B 档启用时生成
scenario-raw:
  manifest.json          # 引用 base-geo identity
  tiles_pop.ccb          # 格人口（普查落格）
  cities.ccb / towns.ccb # 城市、城镇统计（§4.3）
  economy.ccb            # 城市×部门增加值、就业等（§4.4）
  networks.osm.ccb       # 有向多模态网络（OSM 派生，独立文件）
  facilities.ccb         # 港口、机场、车站
  lineage.ccb            # 字段级来源与覆盖（§6.2）
scenario-cal:
  manifest.json          # 引用 scenario-raw identity
  calibration.json
content/<contentHash>/content.json
```

文件 `stage`：`boot`（地图首帧前必须）、`stream`（按视野）、`lazy`（打开相关界面时）。

### 1.2 包身份（identity，回应 R008）

- `identity = SHA-256(canonicalJSON(manifestCore))`，`manifestCore` 包含：
  `formatVersion, layer, scenarioId, gridSpec（含 gridHash）, parentIdentity, contentHash（如有）, distribution, files[]（按 path 字典序；每项 {path, bytes, sha256, stage, required}）, complianceFileSha256, licenseSetHash（参与源的 {id, version, sha256, distribution_allowed} 列表的 hash）`。
- **不**纳入：`createdAt`、构建机器信息、`identity` 本身。这些放在 `manifest.json` 的 `buildInfo` 子对象中，不参与身份计算。
- `canonicalJSON`：UTF-8、对象键按 Unicode 码点字典序、无多余空白、数字用最短往返表示（JS `JSON.stringify` / Python `json.dumps(…, sort_keys=True, separators=(',',':'), ensure_ascii=False)` 的公共子集：**manifestCore 中禁止使用浮点数**，数值一律整数或字符串，以避免两语言数字格式差异）。
- 「可复现」= 规范化产物（全部数据文件 + `identity`）逐字节一致；`manifest.json` 整体文件因 `buildInfo` 可不同。
- 验收测试：相同输入 → identity 相同；分别修改 grid 原点、某文件名、某文件 1 字节、distribution、content → identity 必变。
- 审批登记（05 §6.2）绑定 `base-geo` identity 与 `complianceFileSha256`。

### 1.3 manifest.json 示例

```jsonc
{
  "identity": "sha256:…",
  "core": { "formatVersion": 2, "layer": "base-geo", "scenarioId": null,
            "gridSpec": { …, "gridHash": "sha256:…" }, "parentIdentity": null,
            "distribution": "internal", "files": [ … ], "complianceFileSha256": "…", "licenseSetHash": "sha256:…" },
  "buildInfo": { "createdAt": "…", "pipelineGitSha": "…", "imageDigest": "sha256:…" }
}
```

## 2. CCB 二进制容器 wire spec（回应 R007）

### 2.1 布局
全部整数**小端**。文件头 24 字节 + 段表 `56 × N` 字节 + 数据区。

```
off  size  field
0    4     magic        = 0x43 0x43 0x42 0x31 ("CCB1")
4    2     containerVersion (u16) = 2
6    2     flags (u16)  = 0（非 0 → 拒绝）
8    4     sectionCount N (u32)，1 ≤ N ≤ 4096
12   4     headerBytes (u32)：必须 == 24 + 56·N
16   8     reserved：必须全 0
24   56·N  段表项：
           name[24]   UTF-8，1–24 字节，字符集限定 [a-z0-9_.]，不足补 0x00；全文件内唯一
           dtype u8   0=u8 1=i8 2=u16 3=i16 4=u32 5=i32 6=f32 7=f64 8=utf8_table 9=json 10=bytes
           arity u8   数值段：1–16；utf8_table/json/bytes：必须为 1
           flags u16  bit0 = required（读取器遇到未知 required 段 → 拒绝）；其余位必须 0
           count u32  数值段：元素个数（每元素 arity 个分量）；utf8_table：字符串个数；json/bytes：必须为 1
           offset u64 绝对偏移
           bytes u64  数据字节数（不含 padding）
           crc32 u32  CRC-32/ISO-HDLC（与 zlib.crc32 相同；多项式 0xEDB88320 反射、初值 0xFFFFFFFF、结果异或 0xFFFFFFFF），覆盖本段 bytes 范围（不含 padding）
           reserved u32 = 0
```

### 2.2 校验规则（读取器必须全部执行，失败即拒绝整个文件，**禁止静默容错**）
1. magic、containerVersion、flags、reserved 字段符合上表。
2. `headerBytes == 24 + 56·N`，且 `headerBytes ≤ fileLength`。
3. 每段：`offset ≥ headerBytes`；`offset % 8 == 0`；`offset + bytes ≤ fileLength`；u64 先检查 `≤ 2^53 − 1` 再转 `number`。
4. 段按 offset 升序排列且**互不重叠**；相邻段之间的 padding 长度 < 8 且全为 0x00；最后一段之后无多余字节（文件长度 = 最后段 offset + bytes + 末尾 padding 至 8 对齐）。
5. 数值段：`bytes == count × arity × sizeof(dtype)`。
6. `utf8_table`：数据 = `u32 n` + `u32 offsets[n+1]` + UTF-8 字节；`n == count`；`offsets[0] == 0`；单调不减；`offsets[n] == 剩余字节长度`；每个字符串为严格 UTF-8（拒绝非法序列与 BOM）。
7. `json`：严格 UTF-8 JSON 文本，无 BOM，顶层为对象或数组。
8. CRC 匹配。
9. 名称唯一、字符集合法。
10. 未知 dtype → 拒绝；未知**非 required** 段 → 忽略（向前兼容）；缺少期望的 required 段 → 拒绝。

### 2.3 字节序
写出器显式按小端写；TS 读取器在启动时检测平台字节序（`new Uint8Array(new Uint16Array([1]).buffer)[0] === 1`），非小端平台对数值段做字节交换后再建视图（当前所有目标平台为小端，此分支保留以保证正确性并有单测）。

### 2.4 测试
golden fixtures（Python 写、TS 写各一套，双向读取比对）；坏包集合：截断、CRC 错、重叠、重复名、超长名、非法 UTF-8、offset 溢出、headerBytes 不符、未知 required 段、padding 非零。

## 3. ID 域（回应 R010）

| 类型 | 定义 | 稳定排序 | 哨兵 |
|---|---|---|---|
| `TileId` | `row·cols + col` | 网格决定 | `0xFFFFFFFF` |
| `AdminIdx` | `admin.ccb` 全表行号（省/地/县混合） | 按 `(level, code)` 升序 | `0xFFFF` |
| `ProvinceId` | 省级单元的**专用序号** 0…P−1 | 按区划代码升序 | `0xFFFF` |
| `PrefectureIdx` | 地级单元专用序号 | 按代码升序 | `0xFFFF` |
| `CountyIdx` | 县级单元专用序号 | 按代码升序 | `0xFFFF` |
| `SettlementId` | `settlements.ccb` 行号（城市 + 城镇混合） | 按 `(kind, code)` 升序 | `0xFFFF` |
| `CityId` | 城市实体专用序号（地级及以上） | 按代码升序 | `0xFFFF` |
| `TownId` | 城镇实体专用序号 | 按代码升序 | `0xFFFF` |

- 映射列（显式存储，禁止隐式换算）：`admin.ccb` 中 `province_id / prefecture_idx / county_idx`（对应专用序号）与反向表 `province_admin_idx[]` 等；`settlements.ccb` 中 `city_id / town_id`，`cities.ccb` 中 `settlement_id`。
- 品牌类型见 14 §1；任何跨域转换只能通过 `world-format` 提供的映射函数。
- 测试：打乱 `admin` 行顺序的 fixture，验证 UI/sim/pipeline 映射结果不变。

## 4. 主要表（字段以字段字典 §6.1 为准，此处列结构）

### 4.1 `tiles_geo.ccb`（count = cols×rows）
`domain u8`、`terrain_class u8`、`land_area u16（km²×10）`、`inland_water_area u16`、`elev_mean/min/max/p90 i16`、`elev_std u16`、`slope_mean u8`、`lc_top3_class u8×3`、`lc_top3_pct u8×3`、`cropland/forest/builtup_area u16`、`temp_mean i16`、`precip u16`、`river_edges u8`、`river_class u8`、`coastal u8`、`manage_county_idx u16`、`manage_province_id u16`、`anchor_settlement_id u16`、`resource u8×2`。

### 4.2 `xwalk.ccb`
CSR：`tile_offsets u32[cols·rows+1]`、`county_idx u16[]`、`land_area u32[]（m² ÷ 1000，即 0.001 km²）`、`pop_weight f64[]`。

### 4.3 `cities.ccb` / `towns.ccb`
`settlement_id`、`admin_idx`、`anchor_tile`、`pop_total i32`（-1 = 缺失，配合有效位）、`pop_urban i32`、`gdp_wan f64`（万元；f64 防止 u32 溢出，GPT R030 指出）、`valid_bits u32`（每字段一位）。城镇有自己的统计值，与城市不重复计入（城市值为地级行政区整体口径，城镇值为县级口径，汇总时只取一个层级，规则见 11 §6）。

### 4.4 `economy.ccb`
城市 × 6 部门矩阵：`va_wan f64`（增加值）、`employment f64`、`valid u8`、`lineage_ref u32`。

### 4.5 `networks.osm.ccb`
见 10 §2.4 的 schema（有向多模态图）。

## 5. 规则数据（content）
同 V0.1（受限声明式效果语言，不允许脚本）。

## 6. 字段字典与来源（回应 R030）

### 6.1 字段字典 `core-types/schema/fields.json`
每个发布字段一条：`file, section, dtype, arity, unit, scale, offset, valid_min, valid_max, missing(sentinel 值 | "valid_bits:<section>.<bit>"), aggregation(sum|mean|area_weighted_mean|mode|none), quantization, description, lineage_required(bool)`。
- 写出器与读取器都从字典读取并断言；V8 断言保证字典、段表、manifest 三者一致。
- 示例：`pop_total`：i32、人、missing = −1、aggregation = sum；`temp_mean`：i16、°C、scale 0.1、missing = −32768。

### 6.2 来源（lineage）
- `lineage.ccb`：`sources`（json 段，源 ID 列表）+ `field_lineage`（每字段默认来源与方法）+ `overrides`（CSR：实体/区域 → 字段 → {kind: observed|estimated|derived|fixture-default, source_ids[], method, note_idx}）+ `notes`（utf8_table）。
- 对外展示：任一数值的来源链与 `kind`；估算值在 UI 中有明显标记（13 §2.4）。

## 7. 存档（M2）

```
<slot>.ccsave = CCB 容器：
  meta        json   { saveVersion, appVersion, worldIdentity(scenario-cal), contentHash, simVersion, seed, turn, mode, controller, createdAt }
  state.*     多段   规范状态（08 §4），与 stateHash 计算使用同一序列化
  cmdlog      json   本局已接受命令（含 acceptedSeq）
  rng         u32×4  count = 系统数；每系统 PCG32 的 64 位 state 与 64 位 inc，各拆为 (hi, lo) 两个 u32（08 §2.2）
  state_hash  utf8_table（count = 1）  16 个小写十六进制字符
```
- `createdAt` 不参与 stateHash。
- 兼容判定以 `saveVersion / worldIdentity / contentHash / simVersion` 为准（回应 R044）；`appVersion`（SemVer）仅作信息。
- 存储：IndexedDB + 导出/导入文件；导入时完整校验（CCB 规则 + hash），损坏文件拒绝并提示。
- 回放文件 `.ccreplay` = meta + 全部命令日志。

## 8. 版本号
`formatVersion`（世界包）、`containerVersion`（CCB）、`saveVersion`、`simVersion`、`contentHash`、`identity`。含义同 V0.1；`containerVersion` 因 wire spec 收紧升为 2。
