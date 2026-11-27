# 06 数据格式

## 1. 世界包

### 1.1 目录（三层，05 §5.1）

```
world/<layer>/<identity>/          layer ∈ base-geo | scenario-raw | scenario-cal
base-geo:
  manifest.json
  ATTRIBUTION.md
  tiles_geo.ccb          # 格静态地理列（§4.1）
  xwalk_geo.ccb          # 格×县几何交叉表（04 §4.1，无人口）
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
  xwalk_pop.ccb          # 与 xwalk_geo 同索引的人口权重与整数贡献（04 §4.1）
  cities.ccb / towns.ccb # 城市、城镇统计（§4.3）
  economy.ccb            # 城市×部门增加值、就业等（§4.4）
  networks.osm.ccb       # 有向多模态网络（OSM 派生，独立文件）
  facilities.ccb         # 港口、机场、车站、容量池（10 §2.4）
  geom_index.ccb         # 网络几何索引（GeomRef → chunk/偏移/长度，10 §2.4）
  lineage.ccb            # 字段级来源与覆盖（§6.2）
scenario-cal:
  manifest.json          # 引用 scenario-raw identity
  calibration.json
content/<contentHash>/content.json
```

文件 `stage`：`boot`（地图首帧前必须）、`stream`（按视野）、`lazy`（打开相关界面时）。

### 1.2 规范 JSON：CCJ-1（回应 R008、R102）

所有参与哈希的 JSON（`gridCore`、`manifestCore`、状态 `meta`、发布描述符核心）使用受限规范 **CCJ-1**，TS 与 Python 各自实现专用序列化器（不使用通用 `JSON.stringify` / `json.dumps` 的排序行为）：

| 项 | 规则 |
|---|---|
| 键 | 必须匹配 `^[a-z][A-Za-z0-9_]*$`（ASCII、非数字开头，避免 JS 整数键枚举顺序差异）；对象内**重复键拒绝** |
| 键顺序 | 按键的 ASCII 字节序升序 |
| 数字 | 只允许安全整数 `[−(2^53−1), 2^53−1]`，十进制无前导零、无 `+`、无指数；**禁止浮点与 −0** |
| 字符串 | UTF-8 严格（拒绝孤立代理项）；只转义 `"`、`\` 与 U+0000–U+001F（以 `\u00xx` 小写十六进制）；其余字符（含非 BMP）原样输出；不做 Unicode 归一化 |
| 布尔、null | `true` / `false` / `null` |
| 数组 | 顺序有语义；每个数组的排序规则在 schema 中规定（如 `files` 按 `path` 的 UTF-8 字节序） |
| 空白 | 无 |
| 编码 | UTF-8，无 BOM |

golden vectors：键排序、非 BMP 字符、换行与反斜杠、null 与缺省字段、数组顺序变化、安全整数边界；两端独立实现互相验证。

### 1.3 包身份（identity）

`identity = "sha256:" + hex(SHA-256(CCJ-1(manifestCore)))`。`manifestCore` 的**全部必选字段**（缺一拒绝；不允许额外字段）：

| 字段 | 类型 | 说明 |
|---|---|---|
| `formatVersion` | int | 世界包格式版本 |
| `layer` | `"base-geo"` \| `"scenario-raw"` \| `"scenario-cal"` | — |
| `scenarioId` | string \| null | base-geo 为 `null` |
| `gridCore` | object | 04 §3 |
| `gridHash` | string | 必须等于由 `gridCore` 计算的值（加载时复算） |
| `window` | `{col0,row0,cols,rows}` | 04 §2.4；全国包为全网格 |
| `parentIdentity` | string \| null | base-geo 为 `null`；其余层必填 |
| `contentHash` | string \| null | 仅 scenario-cal 必填（校准依赖规则数据），其余层为 `null` |
| `distribution` | `"internal"` \| `"public"` | — |
| `files` | array | 按 `path` 字节序；每项 `{path, bytes, sha256, stage, required}` |
| `complianceFileSha256` | string \| null | base-geo 必填，其余层 `null` |
| `licenseSetHash` | string | 本层引用源集合的 hash |
| `toolRegistryHash` | string | 03 §6 工具登记 hash |

- `manifest.json` = `{ identity, core: manifestCore, buildInfo }`；`buildInfo`（时间、机器、镜像 digest）不参与 identity。
- 可复现 = 全部数据文件 + identity 逐字节一致。
- 测试：相同输入 → identity 相同；修改 gridCore 任一字段、AOI 文件、文件名、文件 1 字节、distribution、许可集、工具登记、数组顺序 → identity 必变。

### 1.4 包链加载（回应 R103）
- 客户端从发布描述符（或 dev 配置）得到**叶子包**的 identity 与 URL；每层 manifest 的 `parentIdentity` 指向父包，父包 URL 由描述符中的 `chain[]` 给出（不由客户端猜测）。
- 校验：每层 identity 复算一致；`gridHash` 全链相同；`window` 全链相同；`scenarioId` 在 raw/cal 间相同；`distribution`：public 叶子的全部祖先必须为 public；无环；`required` 文件存在且 sha256 一致。任一失败 → 拒绝加载并报告具体原因。
- 文件路径相对各自层的根 URL 解析；同名文件在不同层互不覆盖（以层名命名空间访问）。
- 每层的必需文件清单在 `ccb-sections.json` 中按层定义。

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
3. 每段：u64 先检查 `≤ 2^53 − 1` 再转 `number`；`offset ≥ headerBytes`；`offset % 8 == 0`；**`offset ≤ fileLength` 且 `bytes ≤ fileLength − offset`**（避免相加溢出）。**全部范围检查在任何内存分配之前完成**；解码器设单文件最大解码字节上限（默认 512 MiB，可配置），超限拒绝。
4. 段表顺序 = offset 严格升序；**`bytes = 0` 的空段合法**，其 offset 必须等于前一段结束后 8 对齐的位置，且与后续段 offset 不同（即每段占据唯一对齐位置）；段间互不重叠。首段 offset 必须等于 `headerBytes`（无前置间隙）；相邻段之间与文件末尾的 padding 长度 < 8 且全为 0x00；文件长度 = 最后段 offset + bytes 向上取整到 8。
5. 数值段：`bytes == count × arity × sizeof(dtype)`。
6. `utf8_table`：数据 = `u32 n` + `u32 offsets[n+1]` + UTF-8 字节；`n == count`；`offsets[0] == 0`；单调不减；`offsets[n] == 剩余字节长度`；每个字符串为严格 UTF-8（拒绝非法序列与 BOM）。
7. `json`：严格 UTF-8、无 BOM、顶层对象或数组；**重复键拒绝**；数字不得为 NaN/Infinity（JSON 本身不允许）；若该段参与哈希则必须是 CCJ-1。
8. CRC 匹配。
9. 名称唯一、字符集合法。
10. 未知 dtype → 拒绝；未知**非 required** 段 → 忽略（向前兼容）；缺少期望的 required 段 → 拒绝；段的 `required` 标志必须与 `ccb-sections.json` 对该段的定义一致，不一致 → 拒绝。
11. `utf8_table` 的 `n` 先与 `count` 和 `bytes` 做上限校验（`4·(n+2) ≤ bytes`）再分配 offsets 数组。

### 2.3 字节序
写出器显式按小端写；TS 读取器在启动时检测平台字节序（`new Uint8Array(new Uint16Array([1]).buffer)[0] === 1`），非小端平台对数值段做字节交换后再建视图（当前所有目标平台为小端，此分支保留以保证正确性并有单测）。

### 2.4 测试
golden fixtures（Python 写、TS 写各一套，双向读取比对）；CRC-32 已知向量（如 ASCII `"123456789"` → `0xCBF43926`）；坏包集合：截断、CRC 错、重叠、重复名、超长名、非法 UTF-8、BOM、JSON 重复键、offset 溢出、`offset+bytes` 溢出、超大 n、首段前间隙、末尾非零 padding、headerBytes 不符、未知 required 段、required 标志不一致、空段位置错误、超过最大解码字节。

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

- **容量**：每个 ID 域的最大值 = 哨兵 − 1（u16 域最多 65,535 个实体）；管线在写出前检查实体数不超限。
- 跨表引用完整性（引用的 ID 必须存在于目标表）在读取器与管线 `90_validate` 中检查。
- 映射列（显式存储，禁止隐式换算）：`admin.ccb` 中 `province_id / prefecture_idx / county_idx`（对应专用序号）与反向表 `province_admin_idx[]` 等；`settlements.ccb` 中 `city_id / town_id`，`cities.ccb` 中 `settlement_id`。
- 品牌类型见 14 §1；任何跨域转换只能通过 `world-format` 提供的映射函数。
- 测试：「打乱 admin 行顺序」的 fixture **只用于内部映射函数测试**（验证代码不依赖行序）；正式 wire 包始终按稳定排序写出，读取器校验排序，不合规即拒绝。

## 4. 主要表（字段以字段字典 §6.1 为准，此处列结构）

### 4.1 `tiles_geo.ccb`（count = 窗口格数，按 localIndex 排列）
`domain u8`、`terrain_class u8`、`has_land u8`（独立有效位）、`land_area_m2 u32`、`inland_water_area u16`、`elev_mean/min/max/p90 i16`、`elev_std u16`、`slope_mean u8`、`lc_top3_class u8×3`、`lc_top3_pct u8×3`、`cropland/forest/builtup_area u16`、`temp_mean i16`、`precip u16`、`river_edges u8`、`river_class u8`、`coastal u8`、`manage_county_idx u16`、`manage_province_id u16`、`anchor_settlement_id u16`、`resource u8×2`。

### 4.2 交叉表
- `xwalk_geo.ccb`（base-geo）：CSR `tile_offsets u32[窗口格数+1]`、`county_idx u16[]`、`land_area_m2 u32[]`。
- `xwalk_pop.ccb`（scenario-raw）：与 `xwalk_geo` **同长度同顺序**：`pop_weight f64[]`、`pop_int i32[]`；外加 `xwalk_geo_sha256`（json 段）声明对齐的几何表，读取器校验。

### 4.3 `settlements.ccb`（base-geo）与 `cities.ccb` / `towns.ccb`（scenario-raw）
`settlements.ccb`：`code`、`kind`、`admin_idx`、`anchor_x i32`、`anchor_y i32`（整数米平面坐标）、`anchor_tile u32`、`is_primary_on_tile u8`、`name`、`name_pinyin`。
`cities/towns.ccb`：`settlement_id`、`admin_idx`、`anchor_tile`、`pop_total i32`（-1 = 缺失，配合有效位）、`pop_urban i32`、`gdp_wan f64`（万元；f64 防止 u32 溢出，GPT R030 指出）、`valid_bits u32`（每字段一位）。城镇有自己的统计值，与城市不重复计入（城市值为地级行政区整体口径，城镇值为县级口径，汇总时只取一个层级，规则见 11 §6）。

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

## 7. 存档（M2，回应 R105、R108）

```
<slot>.ccsave = CCB 容器（containerVersion 2）：
  meta          json(CCJ-1, required)   { saveVersion, appVersion, createdAt }        —— 不参与状态哈希
  state         bytes(required)         规范状态 CSE-1（08 §2.5），本身是一个完整的 CCB 文件
  replay_log    json(CCJ-1, required)   权威回放日志（08 §6.4）：玩家已接受命令 + EndTurn 边界
  idem_ledger   json(CCJ-1, required)   幂等账：已接受命令的 commandId → {payloadDigest, acceptedSeq}
  state_hash    utf8_table(count=1)     16 个小写 hex
```
- PRNG 状态、回合、控制者、世界/内容/规则版本等**只存在于 `state` 内**（不再单独存 `rng` 段，消除重复）。
- 存档不改变任何状态值：状态在写入时即已是规范单位（08 §2.4），回合中途存档与回合末存档使用同一编码。
- 兼容判定以 `state` 内语义头的 `worldIdentity / contentHash / simVersion / stateSchemaVersion` 为准；`appVersion` 仅作信息。
- 存储：IndexedDB + 导出/导入；导入时完整校验（CCB 规则 + 哈希复算 + 回放日志与幂等账一致性）。
- `.ccreplay` = `meta` + 初始参数（世界/内容/规则版本、种子、模式、控制者）+ `replay_log`。

## 8. 版本号
`formatVersion`（世界包）、`containerVersion`（CCB）、`saveVersion`、`simVersion`、`contentHash`、`identity`。含义同 V0.1；`containerVersion` 因 wire spec 收紧升为 2。
