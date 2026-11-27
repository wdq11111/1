# ChinaCiv《华夏文明》工程架构 V0.2（合并版）

> 由 00–20 分册与 CHANGELOG 按顺序合并生成，内容以分册为准。

---

<!-- 文件：00-README.md -->

# ChinaCiv《华夏文明》工程架构 V0.2

| 字段 | 值 |
|---|---|
| 文档版本 | **V0.2（根据 GPT-6.2 第 0 轮审查修订，待第二次审查）** |
| 上一版本 | V0.1（`docs/architecture/v0.1/`，保留不改） |
| 审查记录 | `docs/architecture/reviews/GPT-R0-review-of-V0.1.md`（原文存档） |
| 审查回复 | `20-review-response.md`（R001–R045 逐条处理） |
| 变更记录 | `CHANGELOG.md` |
| 状态 | 未冻结，**禁止进入编码** |
| 主设计 / 审查 | Claude；独立技术审查：GPT-6.2；最终决策：项目负责人（用户） |
| 日期 | 2026-11-27 |

## 1. 一句话定义

一款浏览器端的、基于**真实中国地理与社会经济数据**的《文明》风格六边形策略地图。分两步交付：

1. **M1「华夏图鉴」**：可探索的真实数据地图——文明风格手绘感六边形地形、城市旗标、数据透镜、省/市详情面板、数据来源（参照对象 USACiv 的功能形态，见 01 §1）。
2. **M2「华夏文明」**：在同一地图上加入回合制发展策略模拟——城市、交通、经济、政策、AI。

## 2. 文件清单

| # | 文件 | 内容 | V0.2 变化程度 |
|---|---|---|---|
| 00 | `00-README.md` | 总览、约定、冻结规则、审查指引 | 改写 |
| 01 | `01-product-scope.md` | 产品定义、参照对象、里程碑、范围 | 大改 |
| 02 | `02-tech-stack.md` | 技术选型、能力矩阵、依赖锁定 | 中改 |
| 03 | `03-repo-structure.md` | 目录、模块职责、依赖规则 | 小改 |
| 04 | `04-geo-grid.md` | 坐标系、网格、取整规则、GridSpec 冻结 | 大改 |
| 05 | `05-data-pipeline.md` | 数据源、覆盖审计、分层世界包、合规与许可 | 大改 |
| 06 | `06-data-formats.md` | CCB wire spec、包身份、字段字典、ID 域、存档 | 大改 |
| 07 | `07-rendering.md` | A 档俯视手绘地图（V1）+ B 档 3D 倾斜（可选） | 大改 |
| 08 | `08-sim-core.md` | 确定性、规范状态、PRNG、哈希、命令语义 | 大改 |
| 09 | `09-city-population.md` | 城市与人口 | 中改 |
| 10 | `10-transport.md` | 有向多模态图、分配、复杂度 | 大改 |
| 11 | `11-economy.md` | 经济账户、守恒贸易分配、校准 | 大改 |
| 12 | `12-strategy-ai.md` | 政策、事件、AI、计分 | 中改 |
| 13 | `13-visual-ui.md` | 美术方向、UI、平台优先级 | 中改 |
| 14 | `14-interfaces.md` | 完整接口契约、Worker 协议 | 大改 |
| 15 | `15-performance.md` | 预算（含余量与口径） | 中改 |
| 16 | `16-testing.md` | 测试策略 | 中改 |
| 17 | `17-build-deploy.md` | 构建、发布、权限隔离、合规生命周期 | 中改 |
| 18 | `18-roadmap-acceptance.md` | 新阶段划分（含可行性门禁、M1、垂直切片） | 改写 |
| 19 | `19-risks-decisions.md` | 待决策、风险（含负责人与最迟决策点）、ADR | 改写 |
| 20 | `20-review-response.md` | R001–R045 审查回复表 | 新增 |
| — | `CHANGELOG.md` | V0.1 → V0.2 变更记录 | 新增 |

另附 `ChinaCiv-Architecture-V0.2-ALL.md`（合并版，便于整体转交）。

## 3. 全局约定

- **语言**：文档中文；代码标识符、Schema 字段英文（TS `camelCase`，Python 与数据列 `snake_case`）。
- **关键字**：「必须 / 禁止」= 硬约束；「应当」= 默认做法，偏离需 ADR；「可以」= 可选。
- **单位**：长度 m、面积 km²、货币「万元，2020 年不变价」、时间「回合」（1 回合 = 1 季度）。字节单位统一用 **MiB / KiB（1024 进制）**，网络速率用 Mbps（10⁶ bit/s）。
- **事实标注**：外部事实标注「已核实（来源）」或「待核实」。待核实项在对应门禁前必须关闭，不得作为事实写入代码、数据说明或宣传材料。
- **估算标注**：所有性能与规模数字若非实测，标注「估算」；验收以参考设备实测为准。
- **ADR**：偏离默认或否决方案时写 `docs/adr/ADR-xxx.md`，索引见 19。

## 4. 冻结规则（两层，回应 R002）

| 层 | 冻结内容 | 冻结时点 | 变更代价 |
|---|---|---|---|
| **L1 架构基准 V1.0** | 模块边界、接口契约（14）、格式规范（06）、确定性规范（08）、管线阶段与数据分层（05）、验收体系（18） | 第二次审查阻断项全部关闭 + 用户确认 | 走 ADR + 双方审查 |
| **L2 网格实例 GridSpec** | 投影、半径 R、原点、行列、范围 AOI、轴向约定、`gridHash` | P1 结束时（验收 P1-G） | 全部世界包重建、旧存档显式失效 |

- L2 冻结前：不承诺任何存档兼容；所有产物携带 `gridHash`，不匹配一律拒绝加载。
- 测试区（如 `test-sichuan`）使用全国 GridSpec 的子窗口（同一原点、同一 TileId 编号），不另建网格。

## 5. 架构总览

```
            ┌────────────────────────── 离线（构建期，Python + 少量 Node）──────────────────────────┐
 原始数据 ─▶│ fetch → license_gate → normalize → grid → zonal / hydro / admin_xwalk / settlements     │
            │   → classify → [base-geo 包]                                                            │
            │   → stats_attach → networks → [scenario-raw 包]                                         │
            │   → calibrate(Node, 调用 sim) → [scenario-cal 包]                                       │
            │   → validate → compliance → package                                                     │
            └───────────────────────────────────────────┬───────────────────────────────────────────┘
                                                        │ 对象存储 + CDN（internal / public 隔离）
            ┌──────────────────────── 运行时（浏览器）──┴───────────────────────────────────────────┐
            │  主线程：AppShell ── ViewModelStore ── UI(React) / Renderer(three.js)                  │
            │                 │                                                                     │
            │                 └── SimClient ⇄ Sim Worker（M2 才启用；M1 不需要模拟）                │
            │  Asset Worker：CCB 解析 / KTX2 / glTF 解码                                            │
            └──────────────────────────────────────────────────────────────────────────────────────┘
```

核心原则：数据离线化、模拟与表现分离、确定性、数据驱动、合规隔离、可度量验收（与 V0.1 相同，细则见各分册）。

## 6. 给 GPT-6.2 的第二次审查指引

1. 先读 `20-review-response.md`，逐条核对：标「采纳」的是否在所述章节真正落实；标「部分采纳 / 不采纳」的理由是否成立。
2. 再读 `CHANGELOG.md` 了解全部变更，重点检查新增内容本身是否引入新矛盾（尤其 04、06、08、14、18）。
3. 回传格式不变：`[编号] [文件#章节] [严重度] [类型]` + 问题 + 建议。新意见编号从 **R101** 起；对旧意见的复议写作 `R0xx-复议`。
4. 请明确给出：R001–R019 各阻断项「已关闭 / 未关闭（原因）」。

---

<!-- 文件：01-product-scope.md -->

# 01 产品定义与范围

## 1. 参照对象：USACiv（已核实）

2026-11-27 用无头浏览器实际打开 https://karpathy.ai/usaciv/ （页面标题 "usaciv — the United States as a strategy game"），观察与源码检查结论如下：

| 方面 | 观察结果 | 证据 |
|---|---|---|
| 形态 | **可探索的数据地图**，以策略游戏的视觉语言呈现美国；未发现回合/结束回合机制 | 页面交互、`main.js` 中无回合逻辑 |
| 网格 | 尖顶六边形、odd-r 偏移布局；R = 25 km；117×90 = 10,530 格；客户端与 Python 管线共用网格数学 | `js/hex.js` 注释 "Mirrors pipeline/core/hexgrid.py"、`data/world.json` 的 `grid` |
| 渲染 | Canvas 2D 俯视；地形以手绘风格的格子 + 植被/山体精灵表现；城市为带人口数字的旗标；海洋为深蓝渐变 | `getContext("2d")`、截图 |
| 功能 | 顶栏国家指标；数据透镜（人口、收入、学历等，按组：People / Prosperity / Knowledge / Daily life / Faith / Hazards / Land）；城市与州详情面板；搜索；小地图；百科（Almanac）；分享（URL 状态）；资源、基础设施、军事、奇观、贸易等图层 | 页面文本、`data/lenses.json`、请求列表 |
| 数据 | 约 30 个美国政府公开数据源（ACS、BEA、BLS、NLCD、ETOPO、FAF 等），每源记录 URL、版本、sha256、许可 | `data/sources.json` |
| 人口落格 | 县人口按「格覆盖县面积的比例」分摊到格 | `lenses.json` density 说明 |

结论与对本项目的影响：

1. USACiv 本身**不是**回合制模拟。用户要求在其基础上覆盖城市、交通、经济、策略模拟系统，因此本项目 = **USACiv 式数据地图（M1）+ 回合制策略模拟（M2）**。
2. M1 是独立、可展示的里程碑，也是 M2 的地基；先交付 M1 能尽早验证数据、网格、渲染与合规路径（回应 R036、R041）。
3. 视觉上，USACiv 证明了「俯视 + 手绘感六边形 + 精灵 + 旗标」即可达到《文明》式观感。V0.2 把 **A 档俯视手绘地图**定为 V1 主渲染形态，3D 倾斜地形降为可选的 B 档（07，决策 D-11）。
4. 本项目只借鉴「真实数据 + 策略游戏视觉语言」这一形态，**不复制 USACiv 的代码、美术、图标、界面布局或文案**；其代码与资产许可未核实，一律不使用。

## 2. 设计支柱

| 支柱 | 含义 | 可检查的体现 |
|---|---|---|
| P1 真实 | 数据可溯源，估算与观测区分 | 每个发布字段有字段级来源与 `observed/estimated/derived` 标记（06 §6）；初始控制量误差见 05 §8 |
| P2 可读 | 复杂信息通过地图直接看懂 | 每个系统都有对应透镜，3 次点击内可达 |
| P3 有后果 | （M2）决策带来空间上可见的变化 | 垂直切片验收 VS-A4 |
| P4 好看 | 每个缩放级别都值得截图 | 12 机位参考截图评审（13 §6） |

## 3. 里程碑定义

### 3.1 M1「华夏图鉴」（数据地图）

- 全国真实地形六边形地图（A 档渲染），覆盖中国全部领土（含台湾省、香港、澳门、南海诸岛），周边国家地区为背景。
- 数据透镜（首批 ≥ 12 个）：人口密度、城镇化、人均 GDP、产业结构、地形、高程、土地覆盖、气候（气温/降水）、河流水系、交通网络、行政区划、数据缺失度。
- 城市旗标（地级及以上，按缩放显示县级）；省、市详情面板（统计数据 + 来源）；搜索；小地图；数据来源页；URL 状态分享。
- 不含任何模拟、回合、AI。

### 3.2 M2「华夏文明」（策略模拟，V1 规则集：发展竞赛）

> **设计约束（不变）**：现代场景**不设计中国境内地区间的军事冲突、割据、独立**等内容（ADR-013）。军事玩法仅可能出现在后续历史场景，需单独评估（D-02）。

- **玩家身份**：选择一个省级行政区「主政」（主模式），或「全国沙盒」（统管全部省份，无胜负）。权限模型见 08 §6.1。
- **时间口径（回应 R003，D-09 待确认）**：场景 `modern-2020base` 是「**以 2020 年数据为基准的情景**」，不是严格的历史截面：
  - 存量（人口、城市、网络）取 2020 年观测：人口以第七次全国人口普查（标准时点 2020-11-01）为准；网络以可获得的 2020 年末快照为目标（05 §4）；
  - 流量（GDP、财政等）取 2020 年度值，按**年值 ÷ 4** 换算为季度流量，V1 不建季节性；
  - 货币为 2020 年不变价，V1 不模拟通胀。
  - **回合 0 = 2021 年第 1 季度（未结算状态）**；结束于 2050Q4；共 **120 回合**。
- **单回合闭环**：观察 → 决策（命令立即生效，08 §6）→ 结束回合 → 结算 → 反馈。
- **玩家动作**（V1）：交通建设、功能区设置、经济政策与预算、发展树、国家项目投标、区域协作。
- **胜负**：终局「综合发展指数」排名（进步幅度为主，12 §6）。

## 4. 场景分层

| 层 | 内容 | 世界包层（05 §5） |
|---|---|---|
| 地理基底 | 网格、地形、海陆掩膜、水系、气候、土地覆盖、行政交叉表、城镇位置、合规层、渲染资产 | `base-geo` |
| 场景数据 | 人口、经济统计、交通网络、设施 | `scenario-raw` |
| 场景校准 | 模型参数校准结果 | `scenario-cal`（仅 M2） |
| 规则集 | 系统参数、建筑、政策、事件、胜利条件 | `content.json` |

## 5. 范围

### 5.1 V1 必须包含
- M1 全部（§3.1）。
- M2：31 个省级行政区（不含港澳台）可选；台湾省、香港、澳门**地图表示与玩法处理分开**：地图上完整、正确表示；玩法上 V1 作为不可经营区域，统计口径与是否参与全国市场由 D-03 决定（默认：参与全国市场计算，不参与竞赛）。
- 实体：城市（地级及以上，约 337 个，管线统计）；城镇（县级行政中心，约 2,800 余个，管线统计，不写死）。
- M2 七个系统的 V1 版本，但**内容数量在垂直切片通过后再扩充**（18）。
- 存档/读档（M2）、设置、新手引导（基础）。简体中文完整；英文 UI 框架就绪。

### 5.2 V1 非目标
多人联机、账号、服务器端模拟；军事系统；模组编辑器 UI；实时模拟；街道级精度；完整手机布局；Service Worker 离线（推迟，17 §3）；音频（推迟到 P8，基础 UI 音效除外）。

## 6. 目标平台（回应 R040，D-12 待确认）

| 项 | V1 目标（默认：桌面优先） |
|---|---|
| 浏览器 | 桌面 Chrome/Edge、Firefox、Safari 的当期稳定版及前一主版本（具体版本号在 P1a 锁定并实测，WebGL2 必需） |
| 参考硬件 | Apple M1 8GB / Intel Iris Xe 16GB / GTX 1650 级；1920×1080（DPR 1 与 2 各测） |
| 最低 | WebGL2，4 GB 内存，1280×720，低画质 |
| 平板 | **仅浏览级支持**：拖拽平移、双指缩放、点选格子、触摸替代悬停（长按）；不承诺完整 M2 操作的触控验收。若用户将 iPad 定为正式交付平台，按 13 §2.5 升级 |
| 4K | 不作为实时 60 fps 验收档；4K 仅作为截图导出目标 |

---

<!-- 文件：02-tech-stack.md -->

# 02 技术选型

选型原则：优先成熟、可调试、AI 协作熟悉的技术；新技术需 ADR。V0.1 的基础选型经 GPT-6.2 审查认可保留（R022）；V0.2 补充版本锁定、能力矩阵与可行性门禁。

## 1. 选型总表

| 领域 | 选型 | 说明 |
|---|---|---|
| 客户端语言 | TypeScript（`strict`） | — |
| 包管理 / 构建 | pnpm workspaces + Vite | — |
| 渲染 | three.js（WebGLRenderer + 自定义 GLSL ES 3.0 着色器） | A 档俯视地图为 V1 主形态（07） |
| UI | React 18 + CSS Modules + 设计 tokens | — |
| UI 状态 | Zustand | — |
| 模拟内核（M2） | 纯 TypeScript，Web Worker | — |
| Worker 通信 | 自研 RPC（14 §5） | — |
| 数据管线 | Python 3.12 + GDAL/rasterio/geopandas/shapely 2/pyproj/numpy | 流式窗口处理（05 §5.4） |
| 规则数据 | YAML → JSON 编译，Zod 校验 + 导出 JSON Schema | — |
| 纹理 / 模型 | KTX2（Basis Universal）/ glTF 2.0 + meshopt | — |
| 字体 | 思源宋体 / 思源黑体（SIL OFL 1.1） | — |
| 地图文字 | MSDF 图集（构建期按用字子集生成） | — |
| 测试 | Vitest、Playwright（Chromium/Firefox/WebKit）、fast-check、pytest | — |
| 规范 | ESLint（含 boundaries）+ Prettier；ruff + mypy | — |
| CI | GitHub Actions | — |

### 1.1 版本锁定（回应 R022）

- **不使用版本区间**。P1a 结束时在 `docs/adr/ADR-016-dependency-lock.md` 记录确切版本：Node、pnpm、TypeScript、Vite、three、React、Zustand、Zod、Vitest、Playwright（含其浏览器构建号）、Python、GDAL、PROJ（含 proj-data 版本）、rasterio、geopandas、shapely、numpy、pyproj、uv。
- 锁文件（`pnpm-lock.yaml`、`uv.lock`）入库；管线 Docker 镜像以 digest 引用。
- 升级任何上述依赖 = 单独 PR + 回放测试 + 视觉回归 + 管线可复现性检查。

### 1.2 自研与依赖清单（回应 R022：明确「依赖还是自研」）

| 功能 | 决定 | 理由 |
|---|---|---|
| YAML 解析 | 依赖 `yaml`（开发依赖，仅构建期） | 成熟 |
| CRC-32 | 自研（~30 行，查表） | 规范简单，需与 Python `zlib.crc32` 对齐 |
| xxHash32 | 自研（~80 行），用官方测试向量验证 | sim 内需确定性、零依赖 |
| PCG32 | 自研（双 uint32 实现，08 §2.2） | 同上 |
| MSDF 生成 | 开发依赖 `msdf-atlas-gen`（命令行，构建期）——**许可与可用性待 P1a 核实** | 无则退回 SDF（单通道）方案 |
| KTX2 编码 | 开发依赖 Basis Universal 命令行（`basisu`）或 KTX-Software `toktx`——**P1a 二选一并核实许可** | — |
| KTX2 / meshopt 解码 | 运行时使用 three.js 附带的 KTX2Loader（Basis 转码器 WASM）与 meshopt 解码器 | 随 three 版本锁定 |
| JSON Schema → Pydantic | 开发依赖 `datamodel-code-generator` | — |

### 1.3 运行时依赖白名单

`three`（含其 examples 中的 KTX2Loader、GLTFLoader 与对应 WASM 解码器）、`react`、`react-dom`、`zustand`、`zod`。新增需 ADR。

## 2. 关键选型理由（ADR 摘要）

### ADR-001 Web 优先
浏览器 + WebGL2，链接即可分享，自动化验收方便；否决 Unity / Godot（首包、Web UI 集成、CJK、AI 协作可审查性）。

### ADR-002 three.js 自研渲染（V0.2 修订）
- USACiv 使用 Canvas 2D 即可达到文明式观感（01 §1）。本项目仍选 **WebGL（three.js）**，理由是规模与交互：中国可经营格约 2.6 万（USACiv 约 1 万格总量，估算），加上海洋与背景约 8 万格，叠加实时透镜切换、热力插值、数千标注、缩放平滑与后续 M2 的线路/流量动画，Canvas 2D 在 1080p@DPR2 下逐帧重绘的成本不可控（估算，未实测）；WebGL 以单着色器 + 数据纹理即可完成整图绘制（07 §3）。
- 否决 MapLibre/deck.gl（Web Mercator、风格化与六边形能力弱）、Babylon（无决定性优势）、裸 WebGL（工作量）。WebGPU 推迟。
- **退路**：若 P1a 能力测试显示目标设备 WebGL2 能力不足，A 档可退回 Canvas 2D 预渲染瓦片方案（07 §8），接口不变。

### ADR-003 模拟内核 TypeScript
规模可控（R022 静态估算认可）；WASM 仅作单热点退路，需 ADR。

### ADR-004 表驱动状态，不引入通用 ECS。
### ADR-005 React DOM UI + GPU 地图文字。
### ADR-006 Python 管线，契约为世界包格式与 JSON Schema。
### ADR-015（新）V1 主渲染形态为 A 档俯视手绘地图，3D 倾斜为可选 B 档（07，D-11）。

## 3. GPU / 浏览器能力矩阵（回应 R023）

V1 只依赖 **WebGL2 核心能力**，不依赖扩展；每项在 P1a 用能力探针 + 实测验证：

| 能力 | 用途 | 依赖方式 | 不满足时 |
|---|---|---|---|
| WebGL2 上下文 | 全部 | 必需 | 显示「浏览器不支持」页 |
| `MAX_TEXTURE_SIZE ≥ 4096` | 格数据纹理（260×317 远小于此）、图集 | 必需 | 同上 |
| `texelFetch` 整数纹理（`R16UI`/`R8UI`/`RGBA8UI`） | 格数据纹理、高度图（不需过滤，着色器内手动插值） | 必需（WebGL2 核心） | — |
| `R32F` 纹理（不过滤） | 连续值透镜数据 | 必需（WebGL2 核心，可采样不可线性过滤） | 退回 `RGBA8` 打包 |
| 顶点纹理采样 | B 档地形位移 | 仅 B 档 | B 档不可用，保持 A 档 |
| `TEXTURE_2D_ARRAY` | 材质与精灵图集 | 必需（WebGL2 核心） | — |
| KTX2 转码目标（ASTC/ETC2/BC7/BC3） | 压缩纹理 | 运行时探测，Basis 转码器自动选择 | 回退未压缩 RGBA8 低分辨率资源（体积预算单列） |
| `EXT_color_buffer_float` | 仅 B 档后处理（可选） | 可选 | 关闭对应效果 |
| WebGL 上下文丢失 | — | 必须处理 `webglcontextlost/restored`：释放 → 重建 GPU 资源（数据仍在 CPU 侧缓存） | — |

着色器统一使用 GLSL ES 3.00，色彩空间约定：材质与 UI 颜色在 sRGB 中定义，渲染在线性空间，输出 sRGB（具体 three.js 设置在 P1a 按锁定版本确认）。

## 4. 开发环境

Node 22 LTS、pnpm 9、Python 3.12（uv）、GDAL/PROJ（Docker 镜像为准）。所有版本号以 ADR-016 为准。

---

<!-- 文件：03-repo-structure.md -->

# 03 仓库结构与模块职责

## 1. 目录结构（Monorepo）

```
chinaciv/
├── apps/
│   └── web/                         # 游戏客户端入口（Vite 应用）
│       ├── index.html
│       ├── src/
│       │   ├── main.tsx             # 启动：能力检测 → 加载世界包 → 挂载 AppShell
│       │   ├── shell/               # AppShell：协调 sim-worker / renderer / ui
│       │   │   ├── AppShell.ts
│       │   │   ├── SimClient.ts     # 主线程侧 RPC 客户端
│       │   │   ├── ViewModelStore.ts# 把 sim 差量折叠为只读视图（供 UI 与渲染）
│       │   │   └── InputRouter.ts   # 键鼠 → 相机 / 拾取 / 工具模式
│       │   ├── screens/             # 主菜单、新游戏、游戏中、读档、设置
│       │   └── dev/                 # 仅 dev 构建：调试面板、数据检视器、性能 HUD
│       └── vite.config.ts
│
├── packages/
│   ├── core-types/                  # 跨包共享：ID 类型、枚举、常量、Zod schema、生成的类型、纯值转换（如回合↔年季）
│   │   └── src/{ids.ts, enums.ts, time.ts, schema/, generated/}
│   │       └── schema/{ccb-sections.json, fields.json, manifest.schema.json, …}   # 唯一事实源（06、14 §8）
│   ├── hexgrid/                     # 六边形网格数学（坐标转换、邻接、距离、线、环、区域）
│   ├── world-format/                # 世界包 / 存档二进制容器读写、版本迁移、校验
│   ├── sim/                         # 确定性模拟内核（无 DOM / 无 WebGL / 无 Date / 无 Math.random）
│   │   └── src/
│   │       ├── state/               # GameState 定义：TileStore、实体表、全局量
│   │       ├── commands/            # Command 定义、校验器、执行器
│   │       ├── systems/
│   │       │   ├── population/
│   │       │   ├── city/
│   │       │   ├── transport/       # 网络、建设、寻路、流量分配
│   │       │   ├── economy/         # 生产、贸易、价格、财政
│   │       │   ├── policy/          # 政策、发展树
│   │       │   ├── events/
│   │       │   ├── projects/        # 国家项目竞标
│   │       │   ├── ai/
│   │       │   └── scoring/
│   │       ├── turn/                # 回合管线编排（固定顺序）
│   │       ├── math/                # 定点数、确定性数学函数、PRNG
│   │       ├── diff/                # 状态差量生成
│   │       └── index.ts             # 公开 API：createGame / applyCommand / endTurn / snapshot
│   ├── sim-worker/                  # Worker 宿主：消息协议、调度、存档序列化
│   ├── renderer/                    # three.js 渲染层（只依赖 RenderView 接口）
│   │   └── src/
│   │       ├── core/                # Renderer 生命周期、帧循环、画质档位
│   │       ├── camera/              # 战略相机（俯仰、缩放、平移、惯性、边界）
│   │       ├── terrain/             # 地形 chunk、LOD、材质 splat
│   │       ├── water/               # 海洋、湖泊、海岸线
│   │       ├── rivers/              # 河流带状网格
│   │       ├── hexoverlay/          # 六边形网格线、选中高亮、区域着色
│   │       ├── overlays/            # 数据叠加层（人口、产业、货流等）
│   │       ├── features/            # 植被、城市建筑群、基础设施模型（实例化）
│   │       ├── network/             # 道路/铁路/航线的线型渲染、流量动画
│   │       ├── labels/              # MSDF 标注、碰撞避让
│   │       ├── fog/                 # 迷雾 / 未探索区（水墨风格）
│   │       ├── strategic/           # 战略视图（2D 舆图风格）
│   │       ├── post/                # 后处理：色调映射、AO、调色 LUT、描边
│   │       ├── picking/             # 屏幕坐标 → 六边形 ID
│   │       ├── assets/              # 资源加载、缓存、释放（KTX2/glTF/chunk）
│   │       └── gpu/                 # 着色器源、材质抽象（为 WebGPU 迁移预留）
│   ├── ui/                          # React 组件库 + 设计 tokens + 图表组件
│   │   └── src/{tokens/, primitives/, panels/, charts/, hud/, i18n/}
│   ├── content/                     # 规则数据源（YAML）与编译器
│   │   ├── rules/                   # buildings.yaml, policies.yaml, techtree.yaml, events.yaml, victory.yaml, sectors.yaml ...
│   │   ├── locales/                 # zh-CN.yaml, en.yaml
│   │   └── compiler/                # YAML → 校验 → content.json（附 hash）
│   ├── almanac/                     # M1 数据地图逻辑：透镜定义、统计汇总、搜索索引、URL 状态（无模拟）
│   └── test-utils/                  # 测试夹具：合成世界（含规定的默认驱动量）、确定性回放工具、golden vectors
│
├── pipeline/                        # Python 数据管线
│   ├── pyproject.toml
│   ├── chinaciv_pipeline/
│   │   ├── cli.py                   # `ccp run <stage|all> --scenario modern-2020`
│   │   ├── registry.py              # 阶段注册、依赖、内容哈希缓存
│   │   ├── sources/                 # 每个数据源一个模块：下载、校验 checksum、许可元数据
│   │   ├── stages/                  # 10_fetch … 99_package（见 05）
│   │   ├── grid/                    # 六边形网格生成（与 packages/hexgrid 数学一致，见 04）
│   │   ├── compliance/              # 合规检查：必须要素清单、边界来源校验
│   │   ├── validate/                # 数据质量断言
│   │   └── io/                      # 世界包写出（与 world-format 契约一致）
│   ├── config/
│   │   ├── sources.yaml             # 数据源清单（URL、版本、checksum、许可）
│   │   ├── grid.yaml                # 投影与网格参数
│   │   └── scenarios/modern-2020.yaml
│   └── tests/
│
├── assets-src/                      # 美术源文件（Git LFS）：.blend、PSD、参考图
├── assets/                          # 美术产物（glTF/KTX2），由 tools/ 从 assets-src 导出
├── data/                            # 不入库（.gitignore）：raw/、cache/、out/
├── tools/
│   ├── calibrate/                   # Node 脚本：加载 scenario-raw + sim，输出 calibration.json（05 §5.9）
│   ├── glyphs/                      # MSDF 字形图集生成（按用字子集）
│   ├── textures/                    # KTX2 批量转码
│   ├── bench/                       # 性能基准脚本（Playwright 驱动）
│   └── schema/                      # JSON Schema → TS 类型 / Pydantic 模型 代码生成
├── tests/
│   ├── e2e/                         # Playwright E2E
│   ├── visual/                      # 视觉回归（参考截图 + 阈值）
│   └── replays/                     # 确定性回放用例（命令日志 + 期望哈希）
├── docs/
│   ├── architecture/                # 本架构文档（按版本分目录）
│   ├── adr/                         # ADR-xxx.md
│   └── data-sources/                # 每个数据源的许可原文存档与使用说明
├── .github/workflows/
├── package.json / pnpm-workspace.yaml / tsconfig.base.json / .eslintrc.cjs
└── Makefile                         # 统一入口：make data / make dev / make test / make build
```

## 2. 模块职责与边界

| 包 | 职责 | 允许依赖 | 禁止 |
|---|---|---|---|
| `core-types` | 共享类型、ID、枚举、schema、纯值转换与 schema 校验 | 无（仅 zod） | 业务规则、I/O、状态 |
| `hexgrid` | 纯数学 | `core-types` | 状态、I/O |
| `world-format` | 二进制容器、世界包/存档读写、迁移 | `core-types` | three、react、sim |
| `almanac` | M1 透镜与统计汇总（纯函数） | `core-types`、`hexgrid`、`world-format` | three、react、sim |
| `sim` | 游戏规则与状态演化 | `core-types`、`hexgrid`、`world-format`（只读解码） | DOM、WebGL、`Date`、`Math.random`、`performance`、`setTimeout`、浮点超越函数（见 08）；计时由宿主通过 step 观察者完成（08 §5.1） |
| `sim-worker` | Worker 宿主与协议 | `sim`、`world-format`、`core-types` | three、react |
| `renderer` | 画面 | `core-types`、`hexgrid`、`world-format`、three | `sim`（只能通过 `RenderView` 接口） |
| `ui` | React 组件 | `core-types`、react、zustand | three、`sim` |
| `content` | 规则数据编译 | `core-types` | 运行时被 `sim` 以 JSON 形式加载，不被 import 代码 |
| `apps/web` | 组装 | 以上全部 | 在 shell 外直接调用 sim |

依赖方向（箭头 = 可依赖）：

```
apps/web ─▶ ui ───────────────┐
   │       renderer ──────────┤
   │       sim-worker ─▶ sim ─┼─▶ hexgrid ─▶ core-types
   │                          └─▶ world-format ─▶ core-types
   └─▶（所有包）
```

- **强制方式**：`eslint-plugin-boundaries` + CI `pnpm lint` 阻断合并。`sim` 包：`no-restricted-globals`（`Date`、`performance`、`setTimeout`、`setInterval`、`fetch`、`crypto`）+ `no-restricted-properties`（`Math.random` 与 08 §2 列出的全部超越函数）+ `no-restricted-syntax`（禁止对 `Math` 解构或别名赋值，如 `const M = Math`、`const { sin } = Math`）。
- **规则自测**：`packages/sim/test/lint-fixtures/` 放置故意违规文件（含别名绕过写法），CI 断言 ESLint 对每个文件都报错（ESLint 具体版本行为在 P1a 锁定后验证）。
- **构建验证**：`sim` 包必须能在纯 Node（无 DOM lib）下 `tsc --noEmit` 通过（tsconfig 中 `lib: ["ES2022"]`，不含 `DOM`）。

## 3. 命名约定

- 文件：TS 源 `PascalCase.ts`（类/组件）、`camelCase.ts`（函数模块）；Python `snake_case.py`。
- ID 类型使用品牌类型（branded type），如 `type CityId = number & { __brand: 'CityId' }`，禁止裸 `number` 混用（见 14）。
- 规则数据键：`snake_case` 字符串 ID，如 `building.industrial_park`、`tech.high_speed_rail`；运行时映射为紧凑整数索引（编译期生成，稳定排序）。

## 4. 分支与提交

- 主干开发：`main` 受保护；功能分支 `feat/<阶段>-<主题>`；每个 PR 对应一个任务包。
- 提交信息：Conventional Commits（`feat(sim): …`、`fix(renderer): …`、`data(pipeline): …`）。
- 每个 PR 必须附：任务包编号、验收项自检结果、相关命令的真实输出。

## 5. 生成与编译顺序（回应 R024）

```
1. core-types/schema（Zod 源）──▶ tools/schema 生成：JSON Schema、TS 类型、Pydantic 模型（生成文件入库，CI 检查是否过期）
2. content/compiler：YAML ──▶ content.json（依赖 1 的 schema）
3. pipeline：base-geo / scenario-raw 包（依赖 1 的 ccb-sections.json、fields.json）
4. tools/calibrate：scenario-raw + sim + content ──▶ calibration.json ──▶ scenario-cal 包（仅 M2）
5. apps/web 构建：引用世界包 identity（06 §1.2）与 contentHash
```
`make` 目标与上述顺序一一对应（17 §1）。

---

<!-- 文件：04-geo-grid.md -->

# 04 坐标系、投影与六边形网格

本文件分两部分：**网格规范**（算法与约定，L1 冻结）与 **GridSpec 实例**（具体数值，L2 在 P1-G 冻结，见 00 §4）。

## 1. 坐标参考系

| 用途 | 坐标系 | 约定 |
|---|---|---|
| 原始数据基准 | WGS84 经纬度 | **轴序固定为 (lon, lat)**：pyproj 一律 `always_xy=True`；GeoJSON/GeoPackage 写出均为 (lon, lat) |
| 数据基准说明 | CGCS2000 与 WGS84 视为同一基准，不做转换 | 二者差异的量级在 P1 报告中按 PROJ 实际转换管道核实（V0.1 「厘米级」说法改为待核实，回应 R025） |
| 游戏平面坐标 | Albers 等积圆锥 | `+proj=aea +lat_0=0 +lon_0=105 +lat_1=25 +lat_2=47 +x_0=0 +y_0=0 +ellps=GRS80 +units=m +no_defs`；x 向东、y 向北 |
| 渲染世界坐标 | 右手系，单位 km | `worldX = (x − sceneOriginX)/1000`，`worldZ = −(y − sceneOriginY)/1000`（**北 = −Z**），`worldY` = 高程（km × 夸张系数）；A 档相机沿 −Y 俯视、屏幕上方为北 |

- 投影选择理由与 V0.1 相同（等积）。中国范围内的最大角度畸变、最大线性比例误差在 P1 由 PROJ 计算写入 `reports/projection.md`（不预先声称数值）。
- **禁止** Web Mercator 作为游戏投影；**禁止**使用 GCJ-02/BD-09 加偏坐标源。

## 2. 网格规范（L1）

### 2.1 基本约定

| 项 | 约定 |
|---|---|
| 朝向 | 尖顶（pointy-top） |
| 存储布局 | 偏移坐标 odd-r（奇数行右移半格），行优先 |
| 算法坐标 | 轴向 `(q, r)`，立方 `s = −q − r` |
| 行方向 | `row` 随 y 增大（向北）递增；`row = 0` 为最南行 |
| 常量 | `R`（外接圆半径，**整数米**）；`W = √3·R`；`H = 1.5·R`。`√3` 统一取 IEEE 754 双精度 `Math.sqrt(3)` / `math.sqrt(3)` 的结果（两语言一致） |
| 原点 | `(originX, originY)`：**整数米**，为第 (col 0, row 0) 格中心 |

### 2.2 公式（`packages/hexgrid` 与 `pipeline/grid` 必须逐位一致）

- 偏移 → 中心：`x = originX + W·(col + 0.5·(row & 1))`，`y = originY + H·row`
- 偏移 ↔ 轴向：`q = col − (row − (row & 1)) / 2`，`r = row`；`col = q + (r − (r & 1)) / 2`（整数除法，row 非负故无负数歧义）
- 轴向 → 中心：`x = originX + R·(√3·q + (√3/2)·r)`，`y = originY + 1.5·R·r`
- 邻接方向（轴向，逆时针，索引 0 = 东）：`0 (+1,0) 东；1 (0,+1) 东北；2 (−1,+1) 西北；3 (−1,0) 西；4 (0,−1) 西南；5 (+1,−1) 东南`。所有遍历邻居的代码按此顺序。
- 距离：`(|dq| + |dr| + |dq+dr|) / 2`

### 2.3 点 → 格（取整规则完整定义，回应 R025）

```
输入：平面点 (x, y)（双精度）
1. px = (x − originX) / R ;  py = (y − originY) / R
2. qf = (√3/3)·px − (1/3)·py ;  rf = (2/3)·py ;  sf = −qf − rf
3. 初次取整：rq = roundHalfAwayFromZero(qf)，rr = 同理(rf)，rs = 同理(sf)
   roundHalfAwayFromZero(v) = sign(v) · floor(|v| + 0.5)
   （禁止使用 Python round()（银行家舍入）与 JS Math.round()（.5 向 +∞）——二者平局语义不同）
4. dq = |rq − qf|，dr = |rr − rf|，ds = |rs − sf|
5. 重算：若 dq > dr 且 dq > ds → rq = −rr − rs
         否则若 dr > ds       → rr = −rq − rs
         否则                 → rs = −rq − rr（s 不存储，仅保证约束）
   （平局优先级固定：q 仅在严格最大时重算；dr 与 ds 相等时重算 s）
6. (col, row) = 轴向转偏移；若越界 → 返回 null（不抛异常）
```

- 恰好落在格边/顶点上的点，结果由上述确定性规则唯一决定；**CPU 实现为权威**。
- GPU 着色器（叠加层、格线）使用 float32 重算同一公式，允许在格边 ±1 像素内与 CPU 不一致；拾取、模拟、统计一律用 CPU 结果（07 §6）。
- 跨语言 golden vectors（`core-types/schema/hexgrid-vectors.json`）必须包含：随机点 10 万；格中心；6 个顶点与 6 条边中点（每类各 1,000 格）；负坐标；网格外；距原点最远角。

### 2.4 ID 与 Chunk

- `TileId = row · cols + col`（uint32）；越界无 ID。
- Chunk = 32×32 格（偏移对齐），`ChunkId = chunkRow · chunkCols + chunkCol`。

## 3. GridSpec 实例（L2，P1-G 冻结）

```jsonc
// grid.yaml → 写入每个世界包 manifest
{
  "proj": "+proj=aea …",            // 同 §1
  "orientation": "pointy", "layout": "odd-r",
  "radiusM": 12000,                 // 候选值，见 §3.1
  "originX": <整数>, "originY": <整数>,
  "cols": <整数>, "rows": <整数>,
  "chunkSize": 32,
  "aoiId": "china-full-v1",         // 覆盖范围多边形（含缓冲）的版本 ID，多边形文件 hash 进入 gridHash
  "gridHash": "sha256:…"            // 对上述全部字段的规范化 JSON（06 §1.2 规则）取 SHA-256
}
```

### 3.1 半径 R 的选择（候选，P1 实测后定）

| R | 单格面积 | 中国陆地格数（估算） | 说明 |
|---|---|---|---|
| 12 km | 374.12 km² | ~2.6 万 | V0.1 默认；东部县级可区分 |
| 16 km | 665.1 km² | ~1.4 万 | 性能余量大 |
| 20 km | 1,039.2 km² | ~0.9 万 | 接近 USACiv（R=25 km、全美约 1 万格）的视觉密度 |

决策指标（P1-G）：(a) 县级中心落格冲突率（东部 6 省）；(b) 地级市中心冲突率（目标 0，冲突时按 §4.3 处理）；(c) M1 地图在全国/省/市三级视野的可读性（截图评审）；(d) P1a 合成世界的渲染与模拟基准。**以 (b)、(c) 为主**；R 越小数据越细但成本越高。

规模估算（R = 12 km，AOI 包围盒约 5,400 × 5,700 km）：cols ≈ 260，rows ≈ 317，总格 ≈ 8.2 万（估算，P1 以实际 AOI 为准）。

## 4. 栅格 / 矢量 → 网格的映射规则

### 4.1 统计归属与管理归属分离（回应 R004）

| 概念 | 定义 | 用途 |
|---|---|---|
| **交叉表 `tile_admin_xwalk`** | 稀疏表：`(tile_id, county_idx, land_area_km2, pop_weight)`，记录每格与每个县级单元的**陆地交集面积**及人口栅格权重 | 统计汇总、人口/经济分摊、面积验收 |
| **管理归属 `manage_county_idx`** | 每格唯一：取交集**陆地面积最大**的县；平局取区划代码较小者 | 游戏中的辖区、着色、权限 |

- **县级人口落格**：`pop(tile) = Σ_county pop_census(county) × pop_weight(tile, county) / Σ_tiles pop_weight(·, county)`；`pop_weight` = 人口栅格在交集区域内的总和（守恒重映射：对计数量做面积加权求和，**不做双线性重采样**）。人口栅格在某县内总和为 0 时，退回按陆地交集面积分摊。
- 因此**每个县都有归属格**（只要有陆地交集），不存在「县无中心格」导致人口丢失的情况；小县人口会落入其交集格中（与大县共享格）。
- 整数化：每县人口先按权重得到实数，再用**最大余数法**分配整数（余数相同时按 TileId 升序），保证 Σ = 普查值。
- 格人口 = 各县分摊之和（一个格可含多个县的人口）。
- **面积验收**：省级陆地面积 = Σ交叉表陆地交集面积（不是格数 × 374 km²）。

### 4.2 连续与分类变量
- 连续值（高程、气温、降水）：面积加权统计，高程额外存 `min/max/std/p90`。
- 分类值（土地覆盖）：每格类别直方图 → 前 3 类及占比；另存各类面积。高分辨率分类栅格先在源 CRS 下按 100–250 m 窗口预聚合为「类别面积直方图」，再分区汇总（05 §5.4，回应 R029），精度对照报告随 P1 提交。

### 4.3 城镇点落格（回应 R005）
- 城镇锚点 = 民政部/统计口径的行政中心坐标（来源记录在 provenance）。**不挪动真实坐标。**
- 锚点所在格为该城镇的 `anchorTile`。冲突（多城镇同格）时：级别高者为该格「主城镇」，其余为「附属城镇」——附属城镇**仍是独立实体**，拥有自己的人口与统计，只是在该格不单独绘制旗标（缩放到足够近时以小图标显示）。人口不并入、不重复计算（回应 R004 关于去重的意见）。
- 锚点所在格的 `terrainClass` 为海洋（小岛或海岸城市）时：该格的 `landMask` 仍为「含陆地」（§4.4），城镇照常落格，**不**因格的主地形类为海洋而禁止。

### 4.4 海陆与地形分层（回应 R005）

| 字段 | 定义 |
|---|---|
| `land_area_km2` | 格内陆地面积，来自**独立陆海掩膜**（合规层海岸线多边形；开发期为 dev 海岸线），不由高程正负推导 |
| `inland_water_km2` | 格内内陆水体（湖泊、水库、河道）面积，来自土地覆盖与湖泊矢量 |
| `has_land` | `land_area_km2 > 0` |
| `terrainClass` | 视觉/玩法主地形类（05 §5.6），可为 `ocean` 即使 `has_land = 1`（小岛） |
| `domain` | 中国可经营 / 中国不可经营 / 外域背景 / 纯海域（由交叉表与合规层决定） |
| `islandFeature` | 小岛点/面要素列表（独立表，渲染与合规用，不因格分类而丢失） |

### 4.5 矢量线
- 渲染使用简化原始矢量；模拟使用格化结果（河流边掩码、网络格序列）。
- 国界、省界的**显示**必须来自合规矢量源（05 §6），格子归属边界只作为游戏叠加层（「政区格」示意）。

## 5. 渲染精度
渲染坐标 km、相对场景原点；全图约 ±2,900 km，float32 绝对精度约 2.4×10⁻⁴ km（≈0.24 m），满足需求。

## 6. 验收

| 编号 | 内容 | 阶段 |
|---|---|---|
| G1 | hexgrid TS 与 Python 对 §2.3 全部 golden vectors 结果 100% 一致 | P1a |
| G2 | 全格往返（TileId → 中心 → TileId）恒等 | P1a |
| G3 | 格多边形椭球面积与 `(3√3/2)R²` 相对误差 ≤ 0.1%（等积性）——抽样 1,000 格 | P1 |
| G4 | 投影畸变报告 | P1 |
| G5 | 交叉表守恒：每县 Σ交集陆地面积 与县多边形陆地面积相对误差 ≤ 0.5%；每县 Σ格人口 = 普查值（整数相等） | P1 / P2 |
| G6 | 冲突率报告 + R 值决策 ADR + GridSpec 冻结（`gridHash` 写入 ADR） | P1-G |

---

<!-- 文件：05-data-pipeline.md -->

# 05 真实数据处理管线

## 1. 原则

1. **可复现（范围明确，回应 R009）**：在**锁定环境**（管线 Docker 镜像 digest）+ **完整输入清单**（§3.1）相同时，输出的规范化世界包文件逐字节一致；跨平台/跨环境只保证语义容差（数值差 ≤ 量化步长），不保证逐字节。
2. **可溯源**：字段级来源（06 §6）。观测值、估算值、派生值明确区分，**缺失不以 0 代替**。
3. **许可先行**：未核实许可的数据不进入任何对外分发产物；内部使用也遵守源许可条款（§3）。
4. **合规隔离**：合规图层独立来源、独立文件、独立校验与审批登记（§6）。
5. **增量与正确失效**：阶段缓存键覆盖全部上游依赖（§7）。

## 2. 数据源清单与覆盖审计（回应 R026）

V0.1 的 S01–S17 清单保留（许可状态列不变：除已核实项外均为「待核实」）。

> 「许可状态」：**已核实**＝已见许可原文/官方说明；**待核实**＝P1a 必须核实原文。

| ID | 数据 | 候选源 | 分辨率/粒度 | 用途 | 许可状态 |
|---|---|---|---|---|---|
| S01 | 陆地高程 | Copernicus DEM GLO-90（备选 GLO-30） | 90 m | 高程统计、坡度、渲染高度图 | 免费许可，分发需署名，修改后需注明 "produced using Copernicus WorldDEM-30 © DLR e.V."（GLO-30 文本已见；GLO-90 文本**待核实**；商业使用条款**待核实**）|
| S02 | 海底地形 | GEBCO 最新年度网格 | ~450 m | 海水着色 | 待核实 |
| S03 | 土地覆盖 | ESA WorldCover 2021 v200 | 10 m | 地表分类、耕地/林地面积、渲染 splat | 据了解为 CC BY 4.0，待核实 |
| S04 | 气候 | WorldClim 2.1（备选 CHELSA） | ~1 km | 气温、降水 → 农业潜力、生态 | 待核实 |
| S05 | 河流与湖泊 | HydroRIVERS / HydroLAKES（备选 OSM 水系） | 矢量 | 河流位掩码、流量等级、渲染 | 待核实 |
| S06 | 人口栅格 | WorldPop 2020（约束版 100 m）或 GHSL GHS-POP | 100 m | 人口空间分布（用普查总量校正） | 据了解为 CC BY 4.0，待核实 |
| S07 | 人口总量 | 第七次全国人口普查公报（省级、地级、县级常住人口） | 行政单元 | 控制总量 | 官方公开统计，引用条件待核实 |
| S08 | 建成区 | GHSL GHS-BUILT-S | 100 m | 城市初始建成格、城市模型密度 | 据了解为 CC BY 4.0，待核实 |
| S09 | 经济统计 | 《中国统计年鉴 2021》《中国城市统计年鉴 2021》《中国县域统计年鉴 2021》（均为 2020 年数据） | 省/地/县 | GDP 及三产、财政、就业、固定资产投资 | 统计数据人工录入为 CSV，逐项标来源页码；出版物使用条件待核实 |
| S10 | 夜间灯光 | VIIRS 年度合成 | ~500 m | 县内经济活动空间分配的辅助权重 | 待核实 |
| S11 | 道路/铁路 | OpenStreetMap（Geofabrik 中国区域提取） | 矢量 | 高速、国道、铁路、高铁线路几何 | ODbL 1.0（已知），衍生数据库共享义务见 §3.2 |
| S12 | 交通设施开通年份（铁路为主，公路/港口/机场按审计补充） | 人工整理表（依据国铁集团、各地政府公开信息） | 线路 | 筛出 2020-01-01 时点网络 | 自建，逐行记录来源 URL |
| S13 | 机场 | OurAirports + 民航局《2020 年民航机场生产统计公报》 | 点 | 机场位置、旅客/货邮吞吐量 | OurAirports 据了解为公有领域，待核实 |
| S14 | 港口 | 交通运输部港口统计 + OSM 港口要素 | 点 | 港口位置、吞吐量 | 待核实 |
| S15 | 行政区划代码与名称 | 民政部 县级以上行政区划代码（2020 年版 + 最新版） | 列表 | 行政 ID、标准名称 | 官方公开 |
| S16 | 行政边界与海岸线（合规层） | **待用户决策（D-04）**，见 §6 | 矢量 | 边界显示、海陆掩膜、交叉表 | — |
| S17 | 地名（补充） | OSM `name:zh` + 民政部标准名称（以民政部为准） | 点 | 标注 | 同 S11 / S15 |

**禁用源**：任何使用 GCJ-02 / BD-09 加偏坐标的数据（高德、百度、腾讯等商业地图 POI/路网）——既有坐标偏移问题，也有服务条款限制，且自行纠偏存在合规风险。
新增要求：**每个源在 P1a 产出一份覆盖审计卡** `docs/data-sources/<id>/AUDIT.md`：

| 审计项 | 内容 |
|---|---|
| 时间 | 数据参考期（referencePeriod）、观测时点（observedAt）、版本发布日期；能否取得 2020 年对应版本或历史快照 |
| 空间覆盖 | 是否覆盖全部 AOI（含台湾、港澳、南海岛礁）；缺口位置 |
| 字段覆盖 | 每个计划使用字段的缺失率（按实体数与按人口/GDP 加权两种口径） |
| 获取方式 | 下载接口、是否需人工录入、预计人工工时 |
| 许可 | 许可原文存档、商业使用、再分发、署名、相同方式共享义务 |
| 替代源 | 不可用时的备选 |
| 结论 | 用于：M1 / M2 / 仅内部 / 不用 |

调整（基于审查意见）：
- **经济统计以地级市为 V1 核心单元**；县级经济数据仅作补充，按实际可得性降级使用，缺失如实标注，不设「县级缺失率 ≤ 15%」这类未经证据的门槛。
- **交通网络时点**：优先取得 OSM 历史全量数据中 2020-12-31 的快照（获取方式与许可在审计中确认）；若不可得，使用当前数据 + 开通年份表剔除新线，**并把网络标注为「近似 2020 年末」**，不宣称精确历史截面。公路、港口、机场同样做时点审计。
- 每个场景字段带 `referencePeriod`（如 `2020`、`2020-11-01`）。

## 3. 许可管理

### 3.1 `sources.yaml` 字段（扩充）
`id, name, url, version, sha256, retrieved_at, license_id, license_url, license_archive_path, license_status(verified|pending), commercial_ok(true|false|unknown), redistribution_ok, share_alike, attribution_text, used_for[], distribution_allowed(internal|public|none)`。

人工录入 CSV（`pipeline/data-manual/*.csv`）同样登记为源：每个文件有 sha256 与逐行 `source_ref`。

### 3.2 门禁
- `15_license_gate`：构建目标 `public` 时，任何 `distribution_allowed != public` 的源被引用 → 失败；构建目标 `internal` 时，`distribution_allowed == none` 的源被引用 → 失败。
- **D-08（商业化）未决定前按「可能商业化」从严**：`commercial_ok == unknown` 视为不可用于 public。

### 3.3 OSM / ODbL 与派生链（回应 R027）
- 维护**派生链清单** `reports/derivation_chain.md`：列出每个世界包文件由哪些源派生（例如 `networks.osm.ccb`、渲染线网格、标注、交叉引用这些网络的城市可达性字段等）。
- 物理分离（OSM 派生内容单独成文件）是**工程措施，不是许可结论**；ODbL 对「衍生数据库 / 产出作品 / 集合数据库」的认定由专业意见确定（D-05，**P1a 启动、P2 公开发布前必须有结论**）。

## 4. 坐标、时点与口径
- 矢量源统一转 WGS84 (lon, lat)；之后投影到游戏 Albers（04 §1）。
- 时点与口径见 01 §3.2：存量取 2020 观测，流量取 2020 年度值，季度化 = 年值 ÷ 4，2020 年不变价。
- 行政区划：默认 2020 年版本（与普查、年鉴一致，D-06）；与最新区划差异报告 `reports/admin_diff.md`。

## 5. 分层世界包与阶段（回应 R001）

### 5.1 三层产物

| 包 | 内容 | 产出阶段 | 首次使用 |
|---|---|---|---|
| `base-geo` | GridSpec、海陆掩膜、地形统计、土地覆盖、气候、水系、交叉表、城镇锚点、合规层、渲染资产 | P1 | P1（数据检视器）、P2（M1） |
| `scenario-raw` | 人口（普查落格）、经济统计（城市×部门，未校准）、交通网络与设施、字段级来源 | P2 | M1 透镜与面板；M2 的输入 |
| `scenario-cal` | `scenario-raw` + `calibration.json` | P6（经济完成后） | M2 正式游戏 |

- P3/P4 不依赖 `scenario-cal`：模拟开发使用 `test-utils` 合成世界与 `scenario-raw` 的子集，未实现子系统的输入使用**明文规定的默认驱动量**（例：P3 时 `wageIndex = 1.0`、`C_ij = 直线距离 × 常数`、财政不参与），默认值表见 08 §9.1，并记录在 provenance 为 `fixture-default`。
- 每层包都可独立加载；上层包 manifest 引用下层包 identity（06 §1.2）。

### 5.2 阶段图

```
10_fetch ─▶ 15_license_gate ─▶ 20_normalize ─▶ 30_grid ─┬─▶ 40_zonal ──────┐
                                                        ├─▶ 42_landmask ───┤
                                                        ├─▶ 45_hydro ──────┼─▶ 60_classify ─▶ 85_render_assets ─▶ [base-geo]
                                                        ├─▶ 50_admin_xwalk ┤
                                                        └─▶ 55_settlements ┘
[base-geo] ─▶ 62_population ─▶ 65_networks ─▶ 70_economy ─▶ [scenario-raw]
[scenario-raw] ─▶ 80_calibrate (Node) ─▶ [scenario-cal]
每个包产出前：90_validate（对应层断言）─▶ 95_compliance ─▶ 99_package
```

### 5.3 各阶段要点（仅列与 V0.1 不同或补充的部分）

- **30_grid**：生成格表与格多边形（GeoPackage）；按 AOI 版本生成 GridSpec 与 `gridHash`。
- **40_zonal（回应 R029）**：
  - **按 COG 瓦片窗口流式处理**，禁止全国高分辨率整幅拼接入内存。
  - 10 m 土地覆盖：在源 CRS 下按 100 m 窗口预聚合为「11 类面积直方图」中间栅格（uint16 × 11 波段），再重投影/分区汇总；精度对照：在测试区比较预聚合前后每格各类面积，相对误差报告（目标 P95 ≤ 2%）。
  - 90 m DEM：窗口化重投影（双线性）→ 每格统计。
  - 资源预算（估算，P1a 用测试区 + 东部密集区 + 边界区三个样本实测后更新）：峰值内存 ≤ 16 GiB；中间缓存磁盘 ≤ 200 GiB。
- **42_landmask（新）**：海陆掩膜来自合规层海岸线多边形（开发期 dev 海岸线）；计算 `land_area_km2`；小岛要素表。
- **50_admin_xwalk（替代 V0.1 50_admin）**：县级多边形 × 格多边形求交 → 交叉表（04 §4.1）；管理归属；省/地/县层级汇总表。
- **55_settlements**：锚点落格、主/附属城镇（04 §4.3）；冲突报告。
- **60_classify**：分类规则同 V0.1（`terrain-rules@1`，阈值可调），但 `ocean` 判定改为 `land_area_km2 / tile_area < 0.3 且无城镇锚点`；有城镇锚点的格最低分类为陆地类。
- **62_population（新）**：普查县级人口 × 人口栅格权重守恒分摊（04 §4.1）。
- **65_networks（回应 R016、R006）**：
  - **先从真实拓扑构图**：OSM 路网/铁路按真实交汇关系（共享节点、立交、站点）建立有向多模态图，桥隧、立交不连通的交叉**不**产生连接；再把边几何映射为格路径；最后收缩（10 §2）。
  - 站点：铁路车站、高速出入口、港口码头、机场作为设施节点，城市枢纽通过接驳边连接设施（10 §2.2）。
  - 渡运：真实存在的车客渡航线作为 `ferry` 边（来源记录），不存在则不造。
- **70_economy**：地级市 × 6 部门；数据为 **增加值（GDP 口径）**，总产出在 M2 由投入系数推导（11 §2）；缺失值估算并标记。
- **80_calibrate**：Node 脚本调用 `sim`（仅 P6 起运行）。
- **85_render_assets**：A 档所需（07 §3）：常驻低分辨率高程/晕渲（每 chunk 129²）、地形材质索引、海岸距离场、河流与线网格、标注与字形清单。B 档细节高度图（513²）**仅在 B 档启用时生成**。

## 6. 地图合规（回应 R019、R027、R028）

### 6.1 已核实法规事实
- 公开地图需地图审核并标注审图号；**互联网地图服务**审图号标注在地图页面左下角，有效期两年，到期重新送审（《地图审核管理规定》2019 修正文本，司法部公开文本第 27–32 条，GPT 审查 [E4] 亦核对）。
- 2024 年两部门通知规范移动互联网应用程序（APP）登载使用地图行为：需地图审核与 ICP 备案，内容变化需重新审核，引用地图注明来源与审图号。
- 地图不得表示危害国家统一、主权和领土完整的内容。

**待专业意见（D-13，P1a 启动）**：本 Web 游戏是否属于「互联网地图服务」；是否涉及测绘资质、网络游戏出版审批（版号）、数据存储与跨境要求；具体主管部门与送审材料。**技术架构不替代法律意见。**

### 6.2 架构措施
1. 合规图层独立文件 `compliance.ccb`，**stage = boot**；客户端在首个地图帧前加载并校验（hash + 必需要素存在性），失败则**不渲染地图**，显示错误页。
2. 合规线在**最终合成阶段**绘制（07 §2：后处理之后、UI 之前），任何透镜、迷雾、后处理、画质档位都不能遮盖或改变其颜色。
3. 合规来源（D-04，P1a 完成可行性评估，P2 公开发布前确定）：方案 A 采购合规矢量；B 以标准地图为参照人工核对修正；C 已审图服务接口（条款待核实）。
4. **内部开发使用真实开源数据（部分采纳 R027）**：在源许可允许的前提下，开发期使用真实开源数据（含 dev 边界）构建 `internal` 包；`internal` 包只在受访问控制的环境中使用（17 §4），客户端显示「内部测试版本，地图未经审核」水印。未核实许可的源不进入任何包。合成世界用于自动化测试，不替代真实数据开发。
5. **审批登记（approval registry，替代 V0.1 的 `signed` 布尔值）** `compliance/approvals.yaml`：
   ```yaml
   - approval_id: A-2027-001
     approval_number: "审图号文本"
     document_ref: 批准文件扫描件路径（私有存储）
     scope: { distribution: public, regions: [CN], surfaces: [web-map, screenshot-export] }
     bound_to: { base_geo_identity: "sha256:…", compliance_file_sha256: "…", style_hash: "…", zoom_range: [..], inset_spec: "…" }
     issued: 2027-01-10
     expires: 2029-01-09          # 若适用
     review_due: 2028-10-01
     owner: 项目负责人
   ```
   - `public` 构建要求：存在一条 `scope` 覆盖本构建、`bound_to` 与当前产物 hash 完全一致、未过期的登记；否则构建失败。
   - 地图表现变化（边界数据、合规层样式、缩放范围、附图）→ `bound_to` 不匹配 → 先人工评估是否需重新送审，再更新登记。CI 不能仅凭布尔值放行。
   - 撤回：登记标记 `revoked` 后，发布流程必须使对应版本的 CDN 资源下线（17 §5）。
6. 截图/导出：应用级导出（非仅 canvas）必须合成审图号、水印（如适用）与南海诸岛附图（14 §4.2）。
7. 敏感信息：不采集、不显示军事设施等敏感要素（USACiv 有军事图层，本项目**不做**）；矿产资源为游戏化近似。

## 7. 缓存与可复现（回应 R009）

- 阶段缓存键 = SHA-256（阶段代码文件内容 ∥ 阶段参数规范化 JSON ∥ 全部上游输入文件内容 hash（含人工 CSV、content、grid.yaml、AOI 多边形）∥ 工具链 digest（Docker 镜像 digest，含 GDAL/PROJ/proj-data 版本））。
- 输出规范化：浮点字段按 06 §6 字段字典量化；GeoPackage/Parquet 只作中间产物，**不进入世界包**；世界包文件写出时不含时间戳等非语义元数据。
- 失效测试：修改任一输入（一行人工 CSV、一个参数、一个工具版本）→ 下游所有依赖阶段缓存失效，非依赖阶段命中（自动化测试）。

## 8. 数据质量断言（`90_validate`，按包分层）

| # | 包 | 断言 |
|---|---|---|
| V1 | base-geo | 省级陆地面积（Σ交叉表）与官方面积相对误差 ≤ 2%（官方面积口径与来源在审计中记录） |
| V2 | scenario-raw | 每县 Σ格人口 = 普查值（整数相等）；全国合计 = 普查全国值 |
| V3 | scenario-raw | 省级 GDP 合计与年鉴误差 ≤ 2%（若省年鉴与城市合计本身不一致，报告差异来源，不强行调平） |
| V4 | base-geo | 所有城镇锚点落在 `has_land = 1` 的格，且该格交叉表中包含其所属县 |
| V5 | scenario-raw | **按真实覆盖验收连通性（回应 R006）**：输出各模式连通分量报告；所有省会在「多式联运图」（含真实渡运、航空）中可达；单模式孤立节点必须在白名单 `reports/known_isolated.yaml` 中给出原因（岛屿、无铁路等）；**禁止为通过断言添加不存在的边** |
| V6 | base-geo | 所有数值字段无非有限数；缺失值使用字段字典规定的哨兵或有效位图 |
| V7 | scenario-raw | 估算字段比例按字段报告（实体数与人口/GDP 加权两种口径），作为信息项，不设硬阈值 |
| V8 | 全部 | manifest、字段字典、CCB 段表三者一致（06） |

## 9. 运行方式与预算（回应 R029）

```
make data LAYER=base-geo|scenario-raw|scenario-cal [REGION=test-sichuan]
ccp run <stage> --force ; ccp report
```

| 预算项 | 目标 | 性质 |
|---|---|---|
| 原始数据下载 | 不设时间门槛，记录体积 | 信息 |
| 人工录入 | 按审计卡估算工时 | 计划 |
| 测试区冷构建（base-geo） | ≤ 15 分钟（参考 8 核/32 GiB） | P1a 实测后确认 |
| 全国冷构建 | P1a 三样本实测后外推设定 | P1 验收时为硬指标 |
| 全国热增量（单阶段改动） | ≤ 10 分钟 | P1 硬指标 |
| 打包 | ≤ 5 分钟 | P1 硬指标 |

## 10. 验收（P1 相关）
1. 锁定环境下两次冷构建 `base-geo` 包 identity 相同（06 §1.2）。
2. §8 中 base-geo 层断言全过；报告页可浏览。
3. 全部数据源审计卡完成；发布用源许可 `verified`。
4. 合规来源可行性评估与 D-13 专业意见已启动（有书面记录）。

---

<!-- 文件：06-data-formats.md -->

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

---

<!-- 文件：07-rendering.md -->

# 07 渲染引擎

## 1. 两档渲染形态（ADR-015，D-11 待用户确认）

| 档 | 形态 | 定位 |
|---|---|---|
| **A 档（V1 主形态）** | 正交俯视（可小角度倾斜 ≤ 15°）、手绘风格六边形地形 + 晕渲 + 精灵装饰 + 旗标 | M1 与 M2 的默认画面；参照 USACiv 已验证的文明式观感（01 §1） |
| **B 档（可选，P8 评估）** | 透视倾斜 35°–75°、高程位移 3D 地形、3D 实例模型 | 近景「电影感」视图；仅在 A 档全部验收后、性能余量允许时实施 |

两档共用：相机/输入框架、格数据纹理、透镜系统、线网、标注、合规合成、拾取接口。B 档的设计保留在 §9（已按审查意见修正），但**不在 V1 关键路径上**。

## 2. 帧结构与合成顺序（回应 R019）

```
1. 相机更新
2. 可见集：视口 × chunk 包围盒 → 可见 chunk；按缩放级别确定装饰与标注层级
3. 流式请求（Asset Worker）
4. 应用 ViewModel 差量（数据纹理局部更新，≤ 2 ms/帧）
5. 场景 Pass（渲染到离屏目标，线性空间）：
   a. 地形底图（A 档：全图格着色 Pass，§3.1）
   b. 水体（海洋/湖泊/河流）
   c. 装饰精灵（植被、山体、设施；实例化）
   d. 透镜叠加（数据着色、格线、区域描边、选中高亮）
   e. 交通线网与流量动画
   f. 城市旗标（实例化四边形 + MSDF 文字）
   g. 迷雾/未调研遮罩（若启用）
6. 后处理：色调映射 → 调色 LUT → 暗角/纸纹 → FXAA → 输出 sRGB
7. **合规合成 Pass（最终）**：国界、省界、南海诸岛及其断续线、重要岛屿，以固定样式绘制在后处理结果之上；不受透镜、迷雾、后处理、画质档位影响
8. 标注（地名，MSDF，屏幕空间，碰撞避让）——在合规线之上绘制，但碰撞系统把合规线作为「禁止完全遮挡」区域（标注背景采用半透明描边而非实心底，保证线可见）
9. DOM UI（含左下角审图号/水印组件，13 §2.1）
```

- 合规资源（`compliance.ccb`）在首帧前加载并校验，失败则不进入地图（05 §6.2）。
- 统计口径：`renderer.info` 在每次 `render()` 调用时会重置（GPT 审查 [E3] 核对 three.js 文档），本项目**关闭自动重置、每帧手动累加所有 Pass**，`stats()` 报告整帧合计（回应 R018）。

## 3. A 档地图

### 3.1 地形底图：单 Pass 全图格着色
- 几何：每个可见 chunk 一个覆盖矩形（共享几何，按 chunk 实例化 → **1 次 draw call**）。
- 片元着色器：由片元平面坐标按 04 §2.3 公式（float32）求所在格 → `texelFetch` 格数据纹理（`terrain_class`、地形材质索引、土地覆盖前 3 类与占比、海岸标记）→ 从**地形材质纹理数组**（`TEXTURE_2D_ARRAY`，每类 512² 手绘风格平铺纹理，约 12 层）采样，按格内占比与到格边距离做柔和混合（边缘 15% 宽度内与邻格混合，噪声扰动边界，避免机械感）。
- 晕渲：采样 `relief_lo`（每 chunk 129² R16UI，`texelFetch` + 着色器内手动双线性），实时计算 hillshade（光源西北 315°、高度角 45°），以正片叠底方式叠加，强度随缩放调整。
- 格线：同一着色器内按到格边距离绘制，宽度以屏幕像素为单位，远景淡出。
- 纹理：格数据纹理 `cols×rows`（约 260×317）若干张（`RGBA8UI`/`R16UI`）。

### 3.2 水体
- 海洋：全图底层四边形；颜色按海岸距离场（`coast_sdf`，每 chunk 256² R8）由浅青到深蓝过渡；海岸线处白色浪花描边（距离场阈值）；可选慢速法线扰动动画（「减少动效」时关闭）。
- 湖泊：属于格底图的一种材质 + 湖泊矢量轮廓描边。
- 河流：带状网格（`lines/<chunk>.ccb`），宽度按 `river_class`，最小屏幕宽 1.5 px；主河流在远景保留。

### 3.3 装饰精灵（回应 R032 的实例预算思路）
- 类型：森林（4 种植被风格）、山体（丘陵/山地/高山/冰川）、沙丘、农田纹样、设施图标。
- 精灵图集：`TEXTURE_2D_ARRAY` 或 2048² 图集页，KTX2。
- 放置：管线按格分类与占比预计算每格候选位置（确定性抖动，种子 = TileId），运行时按**缩放级别密度表**取前 k 个：

| 视野宽度 | 每格最多精灵数 | 全屏可见格（估算，1080p） |
|---|---|---|
| ≥ 3,000 km | 0（只用底图纹理） | ~2–8 万 |
| 1,000–3,000 km | 1 | ~5,000–2 万 |
| 300–1,000 km | 3 | ~600–5,000 |
| < 300 km | 6 | ≤ 600 |

- **全局上限**：可见精灵实例 ≤ 2 万（每实例 2 三角形 → ≤ 4 万三角形）；超出时按屏幕面积与优先级裁减。实例化后每种图集页 1 次 draw call。
- 每帧统计实例数、三角形数、draw call，计入 15 §2.1 预算。

### 3.4 城市旗标
- 地级及以上城市旗标：圆角色块（省份色）+ 人口数值 + 城市名 + 等级图标；县级城镇在视野 < 600 km 时显示小旗标。
- 实例化四边形 + MSDF 文字；旗标之间做碰撞避让（与地名标注同一系统，城市优先级更高）。
- 原创样式（13 §1），不复制 USACiv 的旗标设计。

### 3.5 透镜（叠加层）
- 统一叠加着色器 + 格数据纹理（数据纹理按透镜切换，不重建几何）。
- 连续值：`R32F` 纹理，`texelFetch`，着色器内映射到 1D 调色板纹理；分类值：`R8UI` + 调色板。
- 支持：着色、区域描边（与邻格值不同处）、选中/悬停高亮、缺失值斜线纹理（显示「无数据」而非 0，回应 R030）。

### 3.6 相机（A 档）
- 正交投影，视野宽度 60–6,000 km；缩放以光标为锚点；平移惯性；默认正北朝上，**V1 不提供旋转**（简化合规与小地图同步）。
- 可选小角度倾斜（≤ 15°，用于营造立体感；B 档之前不做透视）。

## 4. 标注与字形（回应 R033）
- 用字统计：构建期从全部地名 + 地图内文字统计实际字数 `G`，写入报告；V0.1 的 4,000–6,000 为估算。
- MSDF 单元 32 px + 每边 4 px 留白 = **40×40 px/字**，2048² 页 → **51×51 = 2,601 字/页**；宋体、黑体两套分别成图集。
- 分级加载：boot 字集（省、地级市名 + 数字符号，估算 ≤ 1,500 字/套 → 1 页/套）；lazy 字集（县级及自然地物名，按需）。
- 体积：每页 2048² 像素；压缩格式（UASTC 或无损）与实际体积在 P2 视觉测试后确定，**不再预先声称 MB 数**。
- 碰撞避让、滞回规则同 V0.1。

## 5. 拾取（回应 R033）
- **CPU 权威**：屏幕坐标 → （A 档）正交反投影得到平面坐标 → 04 §2.3 → TileId。A 档无高程位移，结果精确。
- B 档：射线与「实际显示高度」求交，显示高度函数（含 geomorph 与 LOD 插值）在 CPU 侧有同一实现（共享常数与插值公式）。
- 测试真值来源**独立于被测函数**：A 档用高精度有理数实现的点→格参考函数（Python `fractions`）生成 golden vectors；B 档用高采样率光线步进（步长 ≤ 1/8 顶点间距）作为 oracle。容差：格边 ±1 px 内的结果按 04 §2.3 规则判定，不计为错误。

## 6. 资源生命周期
- `AssetCache`：LRU，按估算字节计费，分别统计 CPU 侧缓存、GPU 纹理（含 mipmap）、GPU 缓冲、渲染目标、解码临时缓冲；上限按画质档位（15 §2.1）。
- 流式解码在 Asset Worker（CCB 解析、KTX2 转码由 three.js KTX2Loader 管理其自身 Worker 池——**所有权：KTX2/Basis 解码交给 three.js loader；CCB 解析交给本项目 Asset Worker**，回应 R023）。
- 每帧 GPU 上传 ≤ 4 MiB 或 3 ms；离开视野资源保留 10 s 再逐出；超上限时紧急逐出最久未用。
- WebGL 上下文丢失：停止渲染循环 → 恢复后从 CPU 缓存重建全部 GPU 资源 → 恢复（E2E 用 `WEBGL_lose_context` 扩展模拟）。

## 7. 画质档位（A 档）

| 项 | 低 | 中（默认） | 高 |
|---|---|---|---|
| 渲染分辨率 | drawingBuffer ≤ 1.0×CSS（DPR 上限 1） | DPR 上限 1.5 | DPR 上限 2 |
| 精灵密度 | 表值 × 0.5 | × 1 | × 1.5（受全局上限） |
| 海面动画 | 关 | 开 | 开 |
| 后处理 | 仅色调映射 | + LUT + FXAA | + 纸纹/暗角 |

DPR 按实际 drawingBuffer 像素计费（回应 R032）：1920×1080 CSS 在 DPR 2 下为 3840×2160 = 829 万像素，每张 RGBA8 全尺寸目标约 31.6 MiB；中档上限 1.5 → 约 466 万像素。

## 8. 退路：Canvas 2D 预渲染瓦片
若 P1a 能力测试显示 WebGL2 方案在目标设备不达标，A 档可改为「管线预渲染底图瓦片（PNG/WebP，多级）+ Canvas 2D 绘制透镜与旗标」。接口（14 §4 `Renderer`）不变。这是退路，不是并行实现。

## 9. B 档（可选）设计要点（回应 R018、R031）

仅当 A 档全部验收且用户确认实施时启用。

- **地形组织**：每 chunk 4×4 父 patch；LOD 0 为父 patch 拆 2×2 子块。全部 patch 按 LOD 级别**实例化提交**：同一 LOD 的所有可见 patch 共用一份网格几何，实例属性携带 `(chunkLayer, patchOffset, lodMorph)`；高度数据放在 `TEXTURE_2D_ARRAY`（每 chunk 一层，常驻层 129²、细节层 513² 分属两个数组）。**每帧地形 draw call = LOD 级数（4）× 高度数组数（≤2）≤ 8**。
- 三角形预算：全局上限 1.0M（地形）；LOD 选择后若超限，从最远 patch 起逐级降 LOD 直至满足（确定性的降级顺序）。估算：全国视角全部 LOD3 约 960 patch × 512 ≈ 49 万三角形；最坏近景在 P1a 合成场景实测后确定 LOD 阈值。
- 深度预通道：中画质关闭；高画质开启时单列预算。
- 边缘与接缝：相邻 patch LOD 差 ≤ 1；高/低两档高度图在 chunk 边界共享 1 texel 边框（border texel）；geomorph 在 patch 边缘强制对齐到粗级网格；细节噪声振幅在 chunk/patch 边缘 2 个顶点间距内衰减为 0。
- splat：7 个材质权重（RGBA8 + RGB8，第 8 层 = 1 − Σ）+ **AO 独立 R8 纹理**（修正 V0.1 通道冲突）。
- 实例模型（树木、建筑）：按视距使用 impostor（远）/简模（中）/模型（近），全局实例与三角形上限同 A 档思路。
- B 档验收另立（18 P8-B）。

---

<!-- 文件：08-sim-core.md -->

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

---

<!-- 文件：09-city-population.md -->

# 09 城市与人口系统（M2）

## 1. 实体粒度
| 实体 | 数量（管线统计） | 模拟角色 |
|---|---|---|
| 城市 City | 地级及以上，约 337 | 经济、迁移基本单元 |
| 城镇 Town | 县级行政中心，约 2,800 余 | 人口空间分布与视觉节点；统计独立存储（06 §4.3），经济计入所属城市（11 §6 口径规则） |
| 格 Tile | 中国可经营格（R 定稿后统计） | 人口分布、功能区 |

## 2. 城市属性（单位与取值域，回应 R035）

| 列 | 类型 | 单位 / 域 |
|---|---|---|
| `popUrban`, `popRural` | int | 人，≥ 0 |
| `housingCap` | int | 人，≥ 1（下限 1 防止除零；初始值 = popUrban × 1.1） |
| `serviceEdu`, `serviceHealth` | int | 指数 [1, 1000]（下限 1） |
| `amenity` | Fixed4 | [−1, 1] |
| `satisfaction` | int | [0, 1000] |
| `wageIndex` | f64 | > 0，全国均值 = 1.0（经济系统输出，下限 0.05） |
| `unemploymentRate` | Fixed4 | 比例 [0, 1]（**V0.1 的 ‰ 改为比例**） |
| `pollutionIndex` | Fixed4 | [0, 1] |
| `tier` | u8 | 0–5 |

## 3. 人口模型

### 3.1 自然增长（出生、死亡分项，回应 R035）
```
births(c) = P(c) × b_p(t) / 4 × M_birthPolicy(p) × M_dev(c)
deaths(c) = P(c) × d_p(t) / 4
ΔP_nat = births − deaths
```
- `M_birthPolicy` 只作用于出生项，死亡率不受生育政策影响。
- `b_p(t)`, `d_p(t)`：省级年率；基准为 2020 年统计（场景数据，带来源）；随时间的趋势表若无可靠来源则标为「游戏假设」。

### 3.2 迁移
1. 吸引力（无量纲，所有输入已有下限，ln 安全）：
   ```
   A(c) = w1·ln(wageIndex) + w2·(1 − unemploymentRate) + w3·ln((serviceEdu + serviceHealth)/2000)
        + w4·amenity − w5·ln(max(popUrban, 1)/housingCap) − w6·pollutionIndex + A0(c)
   ```
2. 迁出：`Out(i) = floor(P(i) × m0 × sigmoid(A_ref − A(i)))`。
3. 目的地集合 `J(i)` = 除 i 外、`C_ij` 有限（可达）的城市；**不允许迁往自身**；若 `J(i)` 为空则 `Out(i) = 0`。
4. 分配：`share(i→j) = softmaxStable_j( λ·A(j) − β·ln(C_ij) + κ·sameProvince(i,j) )`，`C_ij ≥ 1`（下限）。
5. 整数化：`Out(i)` 按 share 最大余数法分配。
6. 成本矩阵 `C_ij` 使用**本回合**交通步骤输出（08 §5 步骤 6）。
7. 城乡转化：`ΔUrban(c) = floor(popRural × u0 × clamp(就业缺口率, 0, 1))`，城镇化率上限 95%。

### 3.3 格内分布
- 城市人口变化 → 辖区格：权重 = 住宅区容量 × 可达性衰减；乡村人口 → 非城市格：权重 = 耕地面积 × 初始人口分布。最大余数法整数化。
- 守恒：每回合结束断言 Σ格人口 = Σ城市人口 + Σ不可经营/背景人口（整数相等）。
- 事件导致的人口变化（12 §4）以城市为单位执行，再按本节同步到格（回应 R035「事件后同步」）。

## 4. 城市空间
- 辖区：管理归属为该地级行政区的格（04 §4.1）。
- 建成区初值：`builtupPct ≥ 20%`。
- 扩张：触发条件「建成区平均密度 > densityMax(tier)」；候选 = 建成区相邻且**通过硬过滤**的格（生态区、湿地、冰川、海洋、`has_land = 0` 一律排除——**不再使用 ×∞**）；评分 `−slopePenalty + accessBonus + riverBonus − farmlandProtection`，平局按 TileId；每城市每回合最多 1 格。
- 功能区规则同 V0.1。

## 5. 服务与满意度
同 V0.1（滞后趋近 15%/回合）。

## 6. 视觉映射
同 V0.1：tier、建成格、地域风格、旗标优先级。

## 7. 验收（P3，合成 fixture + scenario-raw 子集）
1. 初始：每县 Σ格人口 = 普查值；全国合计相等（继承 05 V2）。
2. 迁移守恒：迁移前后总人口（不含自然增长）整数相等。
3. 零值边界：fixture 含「无住房城市」「不可达城市」「空目的地集」「出生=死亡」等，模型不产生非有限数。
4. 相对因果（合成 fixture，回应 R035）：两城市对照，提高 A 城市 `wageIndex` 20%，10 回合后 A 的净迁入**相对对照组**更高。
5. 扩张：接近扩张阈值的 fixture 城市在人口上升后新增建成格 ≥ 1。
6. 无干预 40 回合（`scenario-raw` + 默认驱动量）：无负值/非有限值；单回合城市人口变化 ≤ 3%（信息项，超出时出报告而非直接失败，用于调参）。
7. 性能：人口 + 城市 ≤ 150 ms（统一口径，回应 R042）。

---

<!-- 文件：10-transport.md -->

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

---

<!-- 文件：11-economy.md -->

# 11 经济系统（M2）

设计目标：可解释、可校准、计算量固定、**账户闭合**。是「空间经济玩具模型」，不声称反映现实行政或经济机制（回应 R037）。

## 1. 主体
城市（约 337，规则驱动）；省级政府（玩家/AI）；中央（规则：转移支付、国家项目）；外部市场（口岸虚拟节点）。

## 2. 口径（回应 R015、R003）

| 量 | 定义 | 单位 |
|---|---|---|
| 增加值 `VA[c,s]` | 统计 GDP 口径；初始值 = 2020 年度城市分部门增加值 ÷ 4 | 万元/季度，2020 年不变价 |
| 总产出 `X[c,s]` | `X = VA / v_s`，`v_s = 1 − Σ_{s'} a[s',s]` 为部门增加值率 | 同上 |
| 中间投入 | `a[s',s] × X[c,s]` | 同上 |
| 价格指数 `p[c,s]` | 无量纲，初始 1.0，域 [0.5, 2.0] | — |
| 实际 / 名义 | V1 只有「游戏价格指数」对名义量的调整；GDP 统计口径用实际量（不变价）；不模拟通胀 | — |

投入系数矩阵 `a`（6×6）：来自国家投入产出表的聚合（表的年份、来源、聚合方法在 P6 核实并入库；核实前使用标注为「游戏假设」的占位矩阵，仅用于开发）。

部门（不变）：`agri, energy, mfg, cons, svc, tech`；可贸易：agri、energy、mfg、tech（tech 贸易系数 0.5）；本地：cons、svc。

## 3. 生产（增加值形式）

```
VA[c,s] = A[c,s] × L[c,s]^α_s × K[c,s]^(1−α_s) × Access(c)^θ_s × R[c,s]
```
- 零值规则：`L = 0` 或 `K = 0` → `VA = 0`（显式分支，不调用 pow）；`Access` 下限 1e-6；`R[c,s] = 0`（如无耕地城市的 agri）→ `VA = 0`。
- `L` 由劳动力按相对工资缓慢再分配（≤ 5%/回合）；`K' = K(1 − δ) + I`。
- `pow` 使用 `sim/math`（08 §2.3），输入已保证 > 0。

## 4. 需求与贸易

### 4.1 需求
- 中间需求：`ID[c,s'] = Σ_s a[s',s] × X[c,s]`
- 最终需求：居民消费（收入 × 消费率 × 部门份额）+ 政府消费 + 投资（资本品来自 mfg、cons）
- `D[c,s] = ID + FD`

### 4.2 本地部门
`supply = min(X_cap, D)`；缺口记为 `shortage[c,s]`（影响满意度），**不跨城市调配**。

### 4.3 可贸易部门：有供给上限的确定性分配（回应 R015）

```
输入：可供给量 S[i,s] = X[i,s]（本回合产出）；需求 D[j,s]；运输成本 C_freight[i,j]
1. 吸引权重：w[i,j] = S[i,s] × exp(−τ_s × C[i,j]) × p[i,s]^(−σ)（不可达 → 0；S=0 → 0）
2. 第 1 轮：按需求侧归一化分配 F1[i,j] = D[j] × w[i,j] / Σ_k w[k,j]（Σ_k w = 0 → 该需求全部转外部市场）
3. 供给约束：对每个供给 i，若 Σ_j F1[i,j] > S[i]，按比例缩放 i 的全部流出到 S[i]
4. 剩余需求 D'[j] = D[j] − Σ_i F[i,j]；剩余供给 S'[i] = S[i] − Σ_j F[i,j]
5. 重复步骤 1–4 共 K = 3 轮（固定轮数，仅在有剩余供给的 i 中分配）
6. 剩余需求 → 外部市场进口（口岸城市，按外部价格曲线，有进口上限）；仍不足 → unmet[j,s]
7. 剩余供给 → 外部市场出口（有上限）；仍剩余 → 库存 inventory[i,s]（下回合可售，库存有折损率）
```
- 守恒（逐行、逐列、逐部门）：`Σ_j F[i,j] + export[i] + Δinventory[i] = S[i]`；`Σ_i F[i,j] + import[j] + unmet[j] = D[j]`。
- 复杂度估算：每轮 337² × 4 ≈ 45 万次权重计算（`exp` 可预计算：`exp(−τ_s × C[i,j])` 每回合每部门一次 → 45 万次 exp），3 轮总计约 1.4×10⁶ 次乘加（估算，未实测）。软目标 120 ms。
- 输出：城市间货流矩阵（下一回合货运 OD）、各城市销售额与进出口。

### 4.4 价格与产能利用
`p ← p × (1 + η × clamp((D − 实际供给)/max(D, ε), −0.1, 0.1))`，截断到 [0.5, 2.0]。

## 5. 财政与账户（回应 R037）

### 5.1 省级账户（每回合，万元）
```
收入 R = Σ_城市 VA × taxRate(band) + T_central + 运营收入 + 土地收入
支出 E = 建设拨款 + 维护 + 教育 + 卫生 + 研发 + 生态 + 利息
现金 cash' = cash + R − E + 新增借款 − 还本
债务 debt' = debt + 新增借款 − 还本
利息 = debt × r(debt/GDP)，r 随负债率分段上升
```
- 不变量：每回合 `cash` 变化 = 上式（逐省断言）；`cash` 不得为负——支出不足时按优先级自动削减（建设拨款最后保障在建工程，削减导致工期顺延）。
- 负债率软上限（利率上升）与硬上限（禁止新开工、禁止新借款）：参数在 content。
- 中央转移支付 `T_central`：人均财力低于全国均值的省按差额比例补助，资金来源为中央虚拟账户（各省上解，比例固定），中央账户同样守恒。
- 跨省出资：`fundingShares` 在协议生效时一次性冻结；每回合按份额从各省扣款。

### 5.2 「税率 → 收入/迁移」的因果
不作为无条件断言；在固定种子、固定其他变量的 fixture 中验证方向（§8.3）。

## 6. 校准（P6，`80_calibrate`）

| 参数 | 目标 | 方法 | 适用条件 |
|---|---|---|---|
| `A[c,s]` | 回合 0 的 `VA[c,s]` = 观测值 | 闭式反解 | 仅对 `valid` 且 `L, K, Access, R > 0` 的单元；其余单元 `VA` 观测为 0 或缺失 → `A` 设为部门中位数并标 `derived` |
| `K` 初值 | 资本产出比 = 配置基准（游戏假设，标注） | 设定 | — |
| `A0(c)` | 回合 0 无干预净迁移 ≈ 0 | 不动点迭代 ≤ 50 次 | **明确为游戏假设**，不是现实观测 |
| 交通常数 | 全国客运量级（来源 P5 核实） | 缩放 | — |

- 城市与城镇的经济口径：城市值 = 地级行政区整体；城镇统计值仅用于 M1 展示与县级透镜，不进入 M2 经济计算（避免重复计入）。
- 校准报告区分：观测控制量 / 估算量 / 拟合参数；保留残差统计，不强行抹平。

## 7. 宏观护栏（无干预 40 回合）
无非有限值、无负产出/负价格/负现金；全国实际 GDP 增速落在 content 配置区间（游戏假设，标注）；任一城市单回合 VA 变化 ≤ ±8%（无事件）；部门份额单回合变化 ≤ 2 个百分点；全部账户守恒断言通过。

## 8. 验收
1. （P6）回合 0 校准：省级 VA 合计与年鉴误差 ≤ 2%；城市级 P95 ≤ 5%（仅对观测有效单元）。
2. （P6）§7 全部通过。
3. （VS / P6）因果方向（固定种子 fixture）：Access 提升 → 可贸易部门 VA 相对对照上升；税率档位上调 → 财政收入上升（其余不变时）。
4. （VS 起）守恒：贸易逐行/逐列/逐部门；财政逐省；中央账户。
5. 性能：经济 + 财政软目标 250 ms / 硬上限 320 ms。

---

<!-- 文件：12-strategy-ai.md -->

# 12 策略层：政策、发展树、国家项目、事件、AI、计分

全部内容数据驱动，定义在 `packages/content/rules/*.yaml`，遵循 06 §6 的声明式效果语言。

## 1. 政策（policies.yaml）

- 政策分 5 类：产业、人才、生态、财税、开放。每省有政策槽（初始每类 1 槽，发展树可增加至 2–3 槽）。
- 每项政策：前置条件、每回合成本、效果列表、**切换冷却 4 回合**、互斥组（例如「重化工优先」与「生态优先」互斥）。
- V1 内容量：约 30 项政策。

## 2. 发展树（techtree.yaml）

- 约 40 个节点，三个时代（2020s / 2030s / 2040s），时代内可自由选择，跨时代需前一时代 ≥ 60% 节点。
- 研发点 `RP = f(研发支出, 科教区格数, 高端人才)`，每回合累计。
- 节点效果：解锁建筑/线路模式/政策槽，或修改参数（如「高铁技术 II：高铁设计速度 +50 km/h」）。
- 发展树为**原创内容**，节点名称采用通用技术与制度概念，不使用任何既有游戏的科技树结构与命名。

## 3. 国家项目（projects.yaml）

- 中央每 4–6 回合（确定性随机）发布 1 个项目：类型（国家级枢纽、实验室、自贸区、大科学装置、生态示范区等）、参评条件、评标权重。
- 省份投标：投入资金承诺 + 满足条件得分 + 现有基础（指标）得分；最高分者获得项目（长期加成），平局按省索引决胜。
- AI 与玩家使用同一投标命令 `BidProject`。

## 4. 事件（events.yaml）

```yaml
- id: event.summer_flood
  trigger:
    season: [3]                       # 第 3 季度
    scope: tile_cluster               # 作用于满足条件的格簇
    where: { river_class_gte: 3, ecology_lte: 120 }
    chance_per_turn: 0.04             # 每个合格流域簇
  effects:
    - { target: tile, stat: pop, op: add_pct, value: -0.5 }
    - { target: city, stat: sector_capacity.agri, op: add_pct, value: -10, duration: 2 }
  choices:
    - { id: relief, cost: { capital: 20 }, effects: [ { target: city, stat: satisfaction, op: add, value: 30 } ] }
    - { id: none, effects: [ { target: city, stat: satisfaction, op: add, value: -50 } ] }
```

- 触发条件为**受限谓词集合**（地形/河流/季节/阈值/概率/冷却），不允许任意脚本。
- V1 内容量：约 30 个事件（自然、经济周期、技术突破、社会民生）。
- **内容红线**：事件不得涉及真实政治人物、真实政治事件、民族宗教敏感议题、地区间对立；灾害类事件用中性表述，不指向真实历史灾难的具体伤亡。由内容审核清单（16 §7）检查。

## 5. AI 省级主政者（回应 R021、R039）

### 5.1 观察
- 所有 AI 在步骤 1 读取**同一份回合开始快照**（只读视图），互不看到彼此本回合决策。
- V1 中 AI 视为全知（不维护 AI 迷雾）。玩家迷雾默认 `data_only`（07 迷雾为可选项）。这是已知的公平性取舍，难度说明中向玩家明示。

### 5.2 候选生成与评分（有界、确定）
```
对每个 AI 省：
 1. 交通候选：从「需求缺口表」（高潜在需求 / 高广义成本的城市对，交通步骤输出）取前 20 对
    → 代理粗筛：直线距离 × 地形走廊系数（管线预计算的省际走廊成本表）× 单位成本 估算造价，
      按 Δ可达性×人口 / 估算造价 排序，取前 3 → 仅这 3 个运行 A*（每次 maxExpansions = 20,000）
 2. 功能区：本省城市评分前 5 格 × 可用类型
 3. 政策：每类槽位最优替换候选 1 个
 4. 预算：3 个预设方向
 5. 项目投标：0/中/高 三档
 6. 评分：utility = Σ w_k(personality) × proxyGain_k − costPenalty + 确定性小扰动（PRNG 流 AI）
 7. 贪心选择（预算约束），平局按动作稳定 ID
```
- 全局上限：每回合全部 AI 合计 A* 调用 ≤ 31 × 3 = 93 次；A* 扩展总数上限 93 × 20,000。估算（未实测）：若每次 A* 平均 2–4 ms，约 0.2–0.4 s，P4 用 AI 代理基准实测，超预算先降低入围数。
- 「性格」是**游戏参数**，由各省初始产业结构按固定映射表生成（`content/rules/ai_personality.yaml`，映射逐项列出），不是对现实地区的评价。

### 5.3 冲突解决（回应 R039 的先手优势）
- 资源竞争类（国家项目投标）：所有省的投标**同时收集**，在项目步骤（步骤 10）统一按评分结算，不受执行顺序影响。
- 互斥类（两个 AI 选择同一格/同一线路）：按「效用值降序，平局按 PRNG 抽签」决定执行顺序；后执行者若校验失败则跳过，不重新规划（本回合）。
- 其余命令按省索引顺序执行（相互独立，顺序不影响结果，测试验证：随机打乱独立命令顺序哈希不变）。

### 5.4 可调试性
`AIDecisionLog` 仅 dev 构建开启，保留最近 8 回合。

## 6. 计分与胜利
- 综合发展指数（进步幅度为主）；终局于 2050Q4（第 119 回合结算后）。
- 里程碑命名原创。

## 7. 内容数量（回应 R041）
垂直切片（VS）阶段只需：政策 3、发展树节点 5、事件 3、项目类型 1。完整数量（政策 ≥ 30、节点 ≥ 40、事件 ≥ 30、项目类型 ≥ 6）在 P7 核心玩法稳定后扩充。

## 8. 验收（P7，回应 R039）
1. 31 省全 AI 完整一局（120 回合）× 5 个固定种子：无异常；每回合预算达标。
2. 行为（可执行条件下）：对「存在 ≥ 1 个可建且预算允许的交通候选」的 AI 省，完整一局内至少修建 1 条线路的比例 ≥ 90%；破产（触及硬上限）AI 省 ≤ 3（每局）。不满足的省需在日志中给出原因。
3. 性格差异：5 种子 × 全部省的统计中，生态型 AI 的终局生态指标排名中位数优于发展型（统计检验方法在测试中写明）。
4. 平衡：玩家「全默认不操作」在 10 个（种子 × 起始省）组合中，终局排名中位数位于后半；「脚本化简单合理策略」中位数进入前 1/3。允许的失败情形（如起始省为极小省份时的排名偏差）在测试中列出。
5. 事件与政策内容通过内容审核清单。

---

<!-- 文件：13-visual-ui.md -->

# 13 视觉设计与 UI/UX

## 1. 美术方向：「新舆图」

一句话：**中国传统舆图与青绿山水的色彩与笔意，以手绘感六边形地图呈现（A 档）；可选 3D 倾斜近景（B 档）。** 原创风格，不复刻任何既有游戏（含 USACiv、《文明》系列）的界面、图标、旗标样式或美术。

### 1.1 缩放层次的视觉目标（A 档）

| 层次 | 视野宽度 | 画面目标（可截图检查） |
|---|---|---|
| 近景 | 60–300 km | 每格地形材质清晰，精灵（林木、山体、农田纹样）丰富；城镇旗标与县名可见；河流、线路清楚 |
| 中景 | 300–1,500 km | 城市群与地形关系清楚；地级市旗标；透镜最可读 |
| 远景 / 全国 | 1,500–6,000 km | 全国轮廓、山系水系由晕渲与底图纹理表达；省名与主要城市；精灵退场 |
| 战略视图（可选，P8） | 任意 | 宣纸舆图风格切换 |

### 1.2 色彩 tokens（初稿，P2 视觉初审调整，P8 定稿）

| Token | 值 | 用途 |
|---|---|---|
| `--c-paper` | `#EFE6D2` | 宣纸底（战略视图、面板背景） |
| `--c-ink` | `#1F2326` | 墨色（主文字、线条） |
| `--c-cinnabar` | `#B23A2B` | 朱砂（强调、城市印章、警示） |
| `--c-azurite` | `#2F6E8E` | 石青（水体、信息） |
| `--c-malachite` | `#4E8B6A` | 石绿（植被、正向指标） |
| `--c-ochre` | `#B8863B` | 赭石（土地、经济） |
| `--c-gold` | `#C9A45C` | 金（高亮、成就，少量使用） |
| `--c-panel` | `rgba(24,28,30,0.86)` | 游戏内深色面板 |

- 地形材质调色遵循同一色板的低饱和版本；数据叠加层使用经色盲安全检查的顺序/发散调色板（以 `--c-malachite`→`--c-ochre`→`--c-cinnabar` 为主轴，另提供色盲模式）。
- 光照：暖色主光 + 冷色环境光，整体偏「午后」；色调映射 ACES（或 AgX，P7 对比后定），调色 LUT 统一风格。

### 1.3 字体
- 标题与地名：思源宋体（Source Han Serif）；正文与数据：思源黑体（Source Han Sans）；数字：等宽表格数字（`font-variant-numeric: tabular-nums`）。
- 均为 SIL OFL 1.1，可嵌入与商用（字体许可原文存档到 `docs/data-sources/fonts/`）。
- Web 字体子集化：UI 常用字 + 动态加载补全，首屏字体 ≤ 1.5 MB。

### 1.4 美术资产规范

**A 档（V1）——2D 精灵与材质：**

| 类别 | 规格 | 数量（V1） |
|---|---|---|
| 地形材质（平铺手绘纹理） | 512²，无缝 | 约 12 类 |
| 植被/山体/沙丘精灵 | 128² 单元，图集 2048² | 每类 4–8 变体，合计约 60 |
| 设施图标 | 64² / 128²，矢量源 | 约 20 |
| 旗标与 UI 图标 | 矢量（SVG 源）→ 图集 | 约 40 |

**B 档（可选）——3D 模型**：沿用 V0.1 面数与贴图规范（树木 300/60、建筑模块 800/150、地标 5,000/800 等），并使用 impostor（07 §9）。

- 格式：glTF 2.0 + meshopt + KTX2；朝向 +Y 向上，单位 km（导入时统一缩放），原点在底部中心。
- 来源：原创制作或明确可商用许可（CC0 等）资产，逐个登记许可于 `assets-src/LICENSES.csv`；**禁止**使用来源不明的模型。
- AI 生成图像仅可用于概念参考与 UI 插画草图，最终资产需人工审核其版权与风格一致性。

## 2. UI 架构

### 2.1 布局（1920×1080 基准，最小支持 1280×720）

```
┌──────────────────────────────────────────────────────────────┐
│ 顶栏：省份徽记 | 回合/年份季度 | 财政 | 研发 | 满意度 | 菜单   │
├──────┬───────────────────────────────────────────┬───────────┤
│ 左侧 │                                           │ 右侧情境面板│
│ 工具 │                地图（WebGL）               │（选中格/城市│
│ 栏   │                                           │ /线路详情） │
│      │                                           │           │
├──────┴──────────────┬────────────────────────────┴───────────┤
│ 审图号（左下角固定） │ 叠加层切换条            │ 小地图 | 结束回合 │
└─────────────────────┴─────────────────────────────────────────┘
```

- 审图号徽标 `MapApprovalBadge` 固定在**地图页面左下角**，任何面板不得遮挡（布局测试检查其可见性）。

### 2.2 核心界面清单

- **M1**：主界面（地图 + 顶栏全国指标）、透镜坞、省份详情、城市详情、搜索、小地图（含完整国土与南海诸岛附图）、数据来源与署名页、图鉴（Almanac：指标说明）、分享（URL 状态）、设置（画质、语言、色盲模式、减少动效）。
- **M2 新增**：新游戏（选省/沙盒、难度）、线路建设工具、功能区工具、政策、发展树、财政预算、国家项目、报告与图表、事件弹窗、通知中心、存读档、新手引导。

### 2.3 平台与触控（回应 R040，D-12）
- 默认桌面优先。InputRouter 从一开始抽象「指针」输入：拖拽平移、双指缩放、点击选格、长按替代悬停，平板可浏览 M1。
- 若 D-12 定为「iPad 正式支持」：增加以 iPad 具体型号（实际渲染分辨率）为准的验收、可滚动面板与横屏安全区适配、触控目标 ≥ 44 pt。

### 2.4 状态与数据流
- UI 只读 `ViewModelStore`（Zustand），通过 selector 订阅最小数据切片；UI 动作 → `SimClient.submit(command)`。
- UI 本地状态（面板开关、选中对象、工具模式）存于独立的 `uiStore`，不进入存档。
- 大表格（如 337 城市排行）使用虚拟滚动。

### 2.5 交互规范
- 所有破坏性或高成本操作（开工、发债、切换政策）有确认步骤，显示成本与预计影响。
- 悬停提示（tooltip）延迟 300 ms；所有数值提示可展开「构成明细」与「数据来源」；估算值带「估」标记，缺失显示「无数据」（不显示 0）。
- 键盘：全部核心操作有快捷键，可重绑定；`Enter` 结束回合需二次确认（可在设置中关闭）。
- 动效：面板 150–200 ms 缓动；地图相机飞行 600–1,000 ms；设置中可「减少动效」。

## 3. 本地化

- 文本键：`ui.panel.city.title` 形式，源文件 `packages/content/locales/zh-CN.yaml`；运行时按语言加载 JSON。
- 地名：以民政部标准名称为准；英文版地名用汉语拼音（按国家标准拼写规则），在数据中单独存储，不运行时转换。
- 数字与单位格式化走统一 `format.ts`（万/亿 中文计数；英文用 million/billion）。

## 4. 无障碍（V1 基础项）
- UI 文本对比度 ≥ WCAG AA（4.5:1）。
- 色盲模式：叠加层改用色盲安全调色板 + 图案纹理区分。
- UI 缩放 90%–150%。

## 5. 音频（推迟到 P8；V1 前仅基础 UI 音效）
- 背景音乐：原创或明确授权的民乐/现代融合曲目 3–5 首；环境音（风、水、城市）随缩放层次混合；UI 音效。
- Web Audio API，音量分组（音乐、环境、音效），首次交互后才启动（浏览器自动播放策略）。

## 6. 视觉验收方法（P2 / P8）

1. **参考机位集**：12 个固定机位（如「四川盆地 近景」「长三角 中景」「青藏高原 远景」「全国」「南海诸岛附图」「珠三角城市旗标密集区」）。每个机位由用户确认一张「目标效果参考」（原创概念图或经批准的方向说明）。
2. 视觉相关 PR 产出同机位截图，Claude 审查（构图、色彩、可读性），用户确认。
3. 自动视觉回归（16 §5）保护已确认画面。
4. 可读性：每机位省名/城市名无重叠、无裁切；透镜图例可读；**合规要素在每个机位完整可见**。

---

<!-- 文件：14-interfaces.md -->

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

---

<!-- 文件：15-performance.md -->

# 15 性能预算与测量口径

> 本文件全部数字为**目标或估算**，以参考设备实测为准；P1a 实测后修订（回应 R042）。

## 1. 参考环境
| 档 | 设备 | 分辨率 | 目标 |
|---|---|---|---|
| 参考中档 A | Apple M1 8 GB，Chrome 稳定版（版本锁定见 ADR-016） | 1920×1080 CSS，DPR 2（drawingBuffer 受画质 DPR 上限约束，07 §7） | 中画质 |
| 参考中档 B | Intel Iris Xe 级 16 GB，Chrome | 1920×1080，DPR 1 | 中画质 |
| 参考独显 | GTX 1650 级 | 2560×1440，DPR 1 | 高画质 |
| 最低 | WebGL2、4 GB | 1280×720，DPR 1 | 低画质 |

验收在真实设备上运行 `tools/bench`；CI 无 GPU 环境只做趋势监控。

## 2. 预算

### 2.1 渲染（A 档，中画质，参考中档 A）

| 指标 | 目标 | 口径 |
|---|---|---|
| 帧时间 | 平均 ≤ 16.7 ms；P95 ≤ 20 ms；单帧 > 50 ms 的卡顿每分钟 ≤ 2 次 | bench 8 段相机路径，预热 5 s 后统计 60 s |
| 主线程 JS | ≤ 6 ms/帧（P95） | 不含 GPU 等待 |
| Draw calls（整帧累加） | ≤ 150（A 档）；B 档另定 ≤ 400 | 07 §2 手动累加 |
| 三角形 | A 档 ≤ 0.3M；B 档 ≤ 1.5M（地形 ≤ 1.0M） | 整帧 |
| 精灵实例 | ≤ 20,000 | 07 §3.3 |
| GPU 上传 | ≤ 4 MiB 或 3 ms / 帧 | — |
| GPU 内存估算 | 低 ≤ 256 MiB；中 ≤ 512 MiB；高 ≤ 768 MiB（A 档） | 纹理（含 mip）+ 缓冲 + 渲染目标 |
| CPU 侧资源缓存 | ≤ 300 MiB | AssetCache 统计 |

### 2.2 模拟（M2，31 省全 AI，第 40–80 回合，5 个固定种子取 P95）

| 步骤 | 软目标 | 硬上限 |
|---|---|---|
| AI | 300 ms | 400 ms |
| 交通 | 300 ms | 500 ms |
| 经济 + 财政 | 250 ms | 320 ms |
| 人口 + 城市 | 120 ms | 150 ms |
| 其他（事件、项目、计分、量化、哈希、差量） | 100 ms | 130 ms |
| **合计** | **≤ 1,070 ms（预留余量）** | **≤ 1,500 ms** |
| Worker 内存 | — | ≤ 300 MiB（完整一局结束时） |

测量范围：从 Worker 收到 `endTurn` 到发出响应（含差量拷贝、不含主线程应用差量）；主线程应用差量另计 ≤ 50 ms。

### 2.3 加载（M1 冷启动）

| 项 | 目标 |
|---|---|
| 应用壳（JS + CSS，Brotli） | ≤ 1.5 MiB |
| 首屏字体（UI 子集） | ≤ 1.5 MiB |
| 地图首帧必需数据（base-geo boot + scenario-raw boot + 合规 + boot 字集 + 低分辨率晕渲） | ≤ 12 MiB（Brotli 后，P2 实测修订） |
| 50 Mbps 冷启动到可交互 | ≤ 10 s（理论传输约 2.5 s，其余为请求、解压、解析、GPU 上传；P2 实测） |
| 二次访问 | ≤ 3 s（HTTP immutable 缓存；不依赖 Service Worker） |

## 3. 优化策略（已纳入设计）
单 Pass 底图 + 数据纹理（07 §3.1）；实例化精灵与全局上限（07 §3.3）；字形分级加载（07 §4）；CSR + 预分配堆 + 树累加（10 §5）；预计算 exp 核（11 §4.3）；有界 AI（12 §5）；Transferable 拷贝（14 §6）。

## 4. 测量
- `renderer.stats()`（整帧累加）、dev HUD、`TurnResult` 的宿主计时。
- `tools/bench`：相机路径 + 固定回放；输出 JSON（P50/P95/max、卡顿次数）。
- CI 趋势：相对基线退化 > 20% 告警（不阻断）；阶段验收用参考设备报告。

## 5. 退化处理
渲染：降精灵密度 → 降 DPR → 关海面动画；B 档不达标则不启用 B 档。模拟：剖析 → 收缩图/降候选 → WASM 热点（ADR）。内存：降低缓存上限、字集按需卸载。

---

<!-- 文件：16-testing.md -->

# 16 测试策略

原则：测试用来证明「功能真的可用」，不追求覆盖率数字。每类测试都写明它保护的是什么。

## 1. 测试分层

| 层 | 工具 | 保护对象 | 运行时机 |
|---|---|---|---|
| 单元 | Vitest / pytest | 纯函数：网格数学、公式、解析器、确定性数学 | 每次提交 |
| 属性 | fast-check | 不变量：人口守恒、货币守恒、排序全序、坐标往返 | 每次提交 |
| 契约 | Vitest + pytest | Python 写出 ↔ TS 读取；网格数学跨语言一致 | 每次提交 |
| 数据质量 | 管线 `90_validate` | 05 §8 断言 | 每次数据构建 |
| 模拟集成 | Vitest（Node） | 完整回合管线、系统间因果、护栏 | 每次提交（短）/ 每晚（长） |
| 确定性回放 | Vitest + Playwright | 跨引擎 stateHash 一致 | 每次提交（Node）/ 每晚（Chromium、Firefox、WebKit）；Safari 与 iPad（若 D-12 要求）实机在阶段签核 |
| E2E | Playwright | 关键用户流程 | 每次合并 |
| 视觉回归 | Playwright 截图 | 已确认画面不被意外改变（**不衡量美术质量**，美术质量由人工评审） | 每次合并 |
| 性能 | tools/bench | 15 预算 | 每次合并（趋势）/ 阶段验收（参考设备） |

## 2. 关键测试用例清单

### 2.1 网格与数据
- `hexgrid`：04 §2.3 全部 golden vectors（含边、顶点、负坐标、越界）；参考实现为 Python `fractions` 有理数版本，**独立于被测代码**。
- `world-format`：06 §2.4 的 golden fixtures 与坏包集合；identity 变/不变测试（06 §1.2）。
- 管线：合成栅格已知答案；交叉表守恒（两县共享一格、县无格中心、海岸格、小岛城镇）；缓存失效测试（05 §7）。
- 确定性数学：PCG32、xxHash32 官方向量；`sim/math` 高精度参考向量。

### 2.2 模拟
- 守恒：迁移前后人口总量相等；财政收支 = 余额变化；货流总量 = 供给满足量。
- 护栏：11 §7、09 §7 中的全部断言。
- 因果方向：10 §7.3、11 §8.3、09 §7.4。
- 命令：每个命令的 validate 拒绝路径各至少一个用例；`apply` 后状态变化断言。
- AI：完整一局（120 回合）无异常、无超时（每晚）。

### 2.3 确定性回放
- 回放用例 ≥ 5（短局、长局、事件选择、存读档、AI 全开）；期望哈希序列入库。
- golden 回放由 Node 生成，浏览器回放比对；`simVersion` 变化时显式重新生成，PR 说明原因。
- 额外：独立命令乱序测试（12 §5.3）、重复 `commandId`、差量缺口触发 resync、Worker 重启恢复。

## 3. 测试夹具

- `test-utils/synthetic-world`：程序生成的 64×64 格小世界（含山地、河流、海岸小岛、2 个省、6 个城市、公路+高铁、1 条渡运），使用 08 §9.1 默认驱动量；用于 PR 快速回归。**全国验收不以合成 fixture 代替。**
- `test-sichuan` 区域世界包：真实数据子集，用于集成测试（CI 缓存）。
- 全国世界包：仅每晚与阶段验收使用。

## 4. E2E 关键流程
**M1**：冷启动 → 地图首帧（断言：画布非空、审图号/水印组件可见、合规层已加载）→ 切换 12 个透镜（每个有图例、缺失值显示斜线）→ 搜索城市并飞到 → 打开省/市面板（数值与来源与 `Almanac` 输出一致）→ 导出截图（检测审图号/水印/附图存在）→ URL 分享往返。
**M2**：新游戏 → 线路预览/建设 → 结束回合 → 存档 → 刷新 → 读档（哈希一致）→ 结束 5 回合（通知与报表更新）→ 模拟 WebGL 上下文丢失并恢复。

## 5. 视觉回归
- 固定机位、种子、状态、画质，`deterministicTime` 关闭动画。
- CI 锁定：浏览器构建号、OS 镜像、字体文件、软件渲染器（SwiftShader）版本、DPR = 1、抗锯齿设置。
- 阈值：初始用 `pixelmatch` 0.1 / 差异像素 ≤ 0.5%，**P2 根据实测噪声调整**（锁定环境下仍可能有非零差异，不假定逐像素一致）。
- 参考图更新必须经人工批准。

## 6. 合规测试（自动 + 人工）

- 自动：`95_compliance` 存在性检查；`MapApprovalBadge` 在所有屏幕尺寸、面板组合、全屏模式下可见且位于左下角；合规线在所有透镜/画质/缩放下像素级可见（采样检测）；`internal` 构建水印存在；应用级导出图像包含审图号/水印/附图；`public` 构建的审批登记绑定校验（05 §6.2）。
- 人工：按 `required_features.yaml` 对照标准地图逐项核对（记录核对人、日期、对照图号）。**内部核对不等于行政审批**。

## 7. 内容审核清单（人工，每次内容变更）

- 不出现真实政治人物、真实政治事件、地区对立、民族宗教敏感表述。
- 地名使用标准名称；港澳台表述符合规范。
- 所有第三方资产与数据有许可登记。

## 8. 质量门禁（合并到 main 必须满足）

1. `pnpm lint`（含依赖边界、确定性规则）零错误。
2. `pnpm typecheck` 通过（含 `sim` 无 DOM 检查）。
3. 单元 + 属性 + 契约 + 短集成 + Node 回放全部通过。
4. E2E 与视觉回归通过（或视觉基线更新已被审查批准）。
5. PR 描述包含任务包编号与验收自检。

---

<!-- 文件：17-build-deploy.md -->

# 17 构建、CI/CD 与部署

## 1. 统一命令
| 命令 | 作用 |
|---|---|
| `make setup` | 安装依赖（锁文件）、拉取管线镜像（digest） |
| `make schema` | Zod → JSON Schema → TS / Pydantic 生成（03 §5 步骤 1） |
| `make content` | 规则编译 |
| `make data LAYER=… [REGION=…]` | 管线（05 §9） |
| `make calibrate` | 生成 scenario-cal（P6 起） |
| `make assets` | 精灵/材质/字形图集生成与 KTX2 转码 |
| `make dev` / `make test` / `make test-all` / `make bench` | — |
| `make build DIST=internal|public` | `public` 触发许可门禁、审批登记校验 |

## 2. CI 工作流与权限隔离（回应 R038）

| 工作流 | 触发 | 凭证 |
|---|---|---|
| `ci.yml` | PR（含 fork）、push | **无任何写凭证**；只读公开缓存 |
| `e2e.yml` | PR 合并前 | 只读 internal 测试区世界包（短期只读令牌，仅受信分支；fork PR 使用合成 fixture） |
| `pipeline.yml` | `main` 上 `pipeline/**` 变化、手动 | internal 存储写凭证（环境保护规则：仅 `main`） |
| `nightly.yml` | 每晚（`main`） | internal 写 |
| `release.yml` | 受保护 tag `v*`，需人工批准 | public 写；短期最小权限凭证 |

- 不受信代码（PR）永远拿不到写凭证或 internal 数据下载凭证。
- 原始数据缓存：internal 对象存储（按 sha256 寻址）。

## 3. 客户端产物与缓存（回应 R044）
```
dist/index.html                       no-cache
dist/assets/*.[hash].*                immutable, 1 年
dist/build-info.json                  { appVersion, gitSha, worldIdentities[], contentHash, distribution }
```
- **V1 不引入 Service Worker**（推迟到存档格式稳定后另行 ADR）；依赖 HTTP immutable 缓存。
- 启动时**原子选择兼容组合**：`build-info.json` 指定唯一的 app + world identities + content 组合，客户端只加载该组合；加载失败（404/hash 不符）→ 错误页，不混用版本。
- 存档兼容：06 §7。

## 4. 部署与访问控制
| 环境 | 存储与 URL 空间 | 访问 |
|---|---|---|
| internal | 独立存储桶/前缀 `internal/`，**全部文件**（HTML、JS、世界包、历史包）都在访问控制之后 | 身份认证网关（具体服务商待 D-07 定） |
| public | 独立存储桶 `public/` | 公开 |

- internal 与 public **不共享任何路径**；public 构建只能读取 `distribution = public` 的世界包（构建时校验）。
- 托管地区与方案（境内 / 境外 / 双轨）：D-07；涉及 ICP 备案、数据存储地等法规适用待 D-13 专业意见（未核实）。
- COOP/COEP：V1 不启用。

## 5. 发布与撤回
- 发布检查表：阶段验收报告；许可门禁；**审批登记有效且绑定当前产物**（05 §6.2）；视觉评审；性能报告；内容审核。
- 撤回：审批登记 `revoked` 或许可问题 → 执行 `make revoke VERSION=…`：删除 public 存储中该版本全部文件、CDN 清除缓存、`index.html` 回退到上一个合规版本、记录撤回日志。由于 V1 无 Service Worker，撤回后客户端在下次加载 `index.html` 时即不再获取旧版本。
- 历史世界包保留策略：public 仅保留有效审批覆盖的版本；internal 保留最近 5 个。

## 6. 密钥
客户端无密钥；CI 密钥按 §2 分级，最小权限、短期。不引入第三方遥测（如需另行决策）。

---

<!-- 文件：18-roadmap-acceptance.md -->

# 18 开发路线与逐阶段验收

## 1. 阶段与依赖（回应 R001、R022、R036、R041）

```
P0 架构冻结 L1
 └─▶ P1a 可行性与合规门禁 ─▶ P1 地理基底包 + GridSpec 冻结（L2）
                               ├─▶ P2 M1「华夏图鉴」（scenario-raw + A 档渲染 + 数据地图 UI）── M1 可交付
                               └─▶ P3 模拟内核（合成 fixture + 默认驱动量）
                                      └─▶ P4 垂直切片 VS（小世界完整回合闭环）
                                             └─▶ P5 交通全量 ─▶ P6 经济全量 + 校准（scenario-cal）─▶ P7 策略/AI/内容扩充 ── M2 可玩
P2 之后美术持续并行 ─────────────────────────────────────────────────────────▶ P8 视觉打磨（+B 档评估）
                                                                                   └─▶ P9 加固与发布候选
```

| 阶段 | 依赖 | 产出 |
|---|---|---|
| P0 | — | 架构 V1.0（L1 冻结） |
| P1a | P0 | 锁定依赖；合成世界技术样例（网格/CCB/Worker/A 档渲染/路由/确定性数学）实测；数据源审计卡；许可与合规路径评估启动 |
| P1 | P1a | `base-geo` 包（测试区 → 全国）；数据检视器；GridSpec 冻结 |
| P2 | P1 | `scenario-raw` 包；M1 全部功能（01 §3.1） |
| P3 | P1（可与 P2 并行） | 确定性内核、Worker 协议、存档、人口/城市（合成 fixture + 默认驱动量） |
| P4 | P3（P2 的渲染用于展示） | 垂直切片 |
| P5 | P4 | 全国交通 |
| P6 | P5 | 全国经济、财政、校准 → `scenario-cal` |
| P7 | P6 | 政策、发展树、项目、事件、AI 全量；内容扩充 |
| P8 | P2 起并行，P7 后整合 | 美术定稿、战略视图、音频；B 档评估与（若批准）实施 |
| P9 | P7、P8 | 加固、兼容、合规、发布 |

关键路径：P0 → P1a → P1 → P3 → P4 → P5 → P6 → P7 → P9。M1（P2）是独立交付点。

## 2. 任务包规则（回应 R045）
- 一个任务包 = 一个**可独立测试的结果**（不再以代码行数衡量）；数据与视觉任务以「产出物 + 报告/截图」衡量。
- 每个任务包引用验收编号；GPT 回传五段格式；Claude 逐条判定并给证据。
- 共同基线：每个任务包注明所依据的架构版本与 Git commit。

## 3. 逐阶段验收

### P0 架构冻结（L1）
| 编号 | 验收项 |
|---|---|
| P0-A1 | 第二次审查（R101+ 与复议）全部有处理结论；**R001–R019 全部「已关闭」** |
| P0-A2 | 19 §1 中「最迟 P0」的决策项已决定 |
| P0-A3 | 文档改为 V1.0，打 tag `arch-v1.0` |

### P1a 可行性与合规门禁
| 编号 | 验收项 | 通过条件 |
|---|---|---|
| P1a-A1 | 依赖锁定 | ADR-016 记录全部确切版本；锁文件入库；镜像 digest |
| P1a-A2 | 网格契约 | 04 G1、G2 通过（TS/Python） |
| P1a-A3 | CCB 契约 | 06 §2.4 golden fixtures 双向通过；坏包全部被拒 |
| P1a-A4 | 确定性基元 | PCG32、xxHash32 官方向量通过；`sim/math` 精度测试通过；Chromium/Firefox/WebKit/Node 结果一致 |
| P1a-A5 | A 档渲染样例 | 合成 8 万格世界：底图单 Pass + 2 万精灵 + 透镜切换，参考中档 A/B 实测帧时间报告 |
| P1a-A6 | 路由样例 | 10 §5 合成图组合的 P50/P95 实测报告 |
| P1a-A7 | 能力矩阵 | 02 §3 每项在 Chrome/Firefox/Safari 实机探测结果 |
| P1a-A8 | 数据审计 | S01–S17 审计卡完成；不可用源有替代方案 |
| P1a-A9 | 合规与许可路径 | D-04 可行性评估、D-05/D-13 专业意见已启动（书面记录）；D-08 已决定或按从严默认 |
| P1a-A10 | 管线资源样本 | 测试区、东部密集区、边界区三样本：耗时、峰值内存、磁盘、I/O 报告；据此设定全国构建预算 |

### P1 地理基底包
| 编号 | 验收项 | 通过条件 |
|---|---|---|
| P1-A1 | Monorepo、lint 边界、确定性 lint 自测、CI | 03；规则自测文件全部报错 |
| P1-A2 | 测试区 `base-geo` | ≤ 15 分钟冷构建（或 P1a 修订值）；断言通过 |
| P1-A3 | 全国 `base-geo` | 05 §8 base-geo 层断言全过；构建时间 ≤ P1a 设定值 |
| P1-A4 | 可复现 | 锁定环境两次冷构建 identity 相同；缓存失效测试通过 |
| P1-A5 | 交叉表 | 04 G5 通过 |
| P1-A6 | 数据检视器（dev） | 任一列 2D 着色、悬停属性、交叉表明细 |
| P1-G | **GridSpec 冻结** | 04 G3、G4、G6 报告；R 值 ADR；`gridHash` 写入 ADR |

### P2 M1「华夏图鉴」
| 编号 | 验收项 | 通过条件 |
|---|---|---|
| P2-A1 | `scenario-raw` | 05 §8 V2、V3、V5、V7 通过；lineage 完整 |
| P2-A2 | 地图 | A 档底图、晕渲、水体、精灵、格线；全国平移缩放无空洞 |
| P2-A3 | 透镜 | ≥ 12 个（01 §3.1），图例、缺失值显示正确 |
| P2-A4 | 旗标与标注 | 地级市旗标、县级按缩放；12 机位无重叠/裁切 |
| P2-A5 | 面板与来源 | 省/市面板数值 = Almanac 输出；每项可查来源与 observed/estimated 标记 |
| P2-A6 | 搜索、小地图、URL 分享 | E2E 通过 |
| P2-A7 | 合规显示与导出 | 16 §6 自动项全过；导出图像含审图号/水印/附图 |
| P2-A8 | 拾取 | 10 万个随机屏幕点与独立参考实现一致（格边 ±1 px 按规则） |
| P2-A9 | 性能与加载 | 15 §2.1、§2.3 在参考中档 A、B 实测达标 |
| P2-A10 | 视觉初审 | 12 机位截图，用户确认方向 |
| P2-A11 | 公开发布前置 | 若要公开 M1：许可门禁通过 + 审批登记有效（否则仅 internal） |

### P3 模拟内核
| 编号 | 验收项 |
|---|---|
| P3-A0 | 14 附录 A 结果类型补全并评审 |
| P3-A1 | 08 §10 全部 |
| P3-A2 | Worker 协议 14 §6 全部规则（含重启恢复、resync、过期响应） |
| P3-A3 | 存档：IndexedDB 轮换、导出/导入、损坏文件拒绝 |
| P3-A4 | 09 §7 第 1–5、7 条 |

### P4 垂直切片 VS（回应 R041）
合成世界（或测试区子集）：2 个省、≥ 2 个城市、公路 + 高铁 2 种模式、经济 2 个可贸易部门 + 1 个本地部门（简化）、1 个建设操作（BuildLink）、结束回合、存读档。
| 编号 | 验收项 |
|---|---|
| VS-A1 | 完整回合闭环可玩（人工 + E2E） |
| VS-A2 | 存读档哈希一致；回放三浏览器一致 |
| VS-A3 | 守恒：人口、贸易（逐行列）、财政 |
| VS-A4 | 可见后果：建高铁后 4 回合内，沿线城市可达性、贸易流、人口变化在透镜中可见（截图证据）；10 §7.3 因果测试通过 |
| VS-A5 | 用户试玩确认「核心循环成立」后才进入 P5 |

### P5 交通全量
P5-A1 初始网络（近似 2020 年末）渲染与连通性报告（05 V5）；P5-A2 10 §7 第 2、4、5、6 条；P5-A3 流量透镜。

### P6 经济全量 + 校准
P6-A1 11 §8 第 1、2、4、5 条；P6-A2 校准报告（观测/估算/拟合分列）；P6-A3 `Explain` 查询可展示 GDP 与财政构成；P6-A4 `scenario-cal` 包产出且可复现。

### P7 策略 / AI / 内容
P7-A1 内容数量（12 §7）通过编译校验；P7-A2 12 §8 全部；P7-A3 人工完整一局（120 回合）无阻断 bug；P7-A4 新手引导：新用户 10 分钟内完成首条线路与首次结算；P7-A5 回合合计满足 15 §2.2。

### P8 视觉打磨
P8-A1 12 机位终版经用户确认达到宣传图标准；P8-A2 资产许可登记 100%；P8-A3 战略视图（可选）；P8-A4 音频；P8-A5 性能不退化。**P8-B（仅当 D-11 批准 B 档）**：07 §9 预算实测达标、接缝与流式测试通过。

### P9 加固与发布候选
P9-A1 浏览器矩阵 E2E + Safari 实机（+ iPad，若 D-12）；P9-A2 全部性能预算参考设备报告；P9-A3 连续 3 局无崩溃、Worker 内存达标；P9-A4 合规：审批登记有效且绑定当前产物；P9-A5 许可与 ODbL 义务履行；P9-A6 内容审核通过；P9-A7 撤回流程演练一次。

## 4. 协作流程
Claude 出任务包 → GPT 实现与自测（五段回传）→ Claude 逐条验收 → 下一包。架构偏离走 ADR + 用户确认；同一问题两轮未修好升级处理。

---

<!-- 文件：19-risks-decisions.md -->

# 19 待决策、风险与 ADR 索引

## 1. 待用户决策（回应 R045：增加负责人与最迟决策点）

负责人默认均为项目负责人（用户）；Claude 负责准备选项与影响分析。

| 编号 | 决策 | 默认方案（未决前按此推进） | 最迟决策点 |
|---|---|---|---|
| D-01 | 产品形态 | **M1 数据地图（USACiv 式）+ M2 回合制策略**（01） | **P0** |
| D-02 | 军事/征服玩法 | 现代场景不做 | P7 前 |
| D-03 | 台湾省、香港、澳门的玩法与统计口径 | 地图完整正确表示；玩法为不可经营区域；参与全国市场计算 | P2（M1 面板口径）/ P6 |
| D-04 | 合规边界数据来源 | P1a 评估 A/B/C；内部开发用 dev 边界 | P1a 启动、**公开发布 M1 前**确定 |
| D-05 | OSM/ODbL 法律处理 | 物理分离 + 派生链清单；待专业意见 | **公开发布 M1 前** |
| D-06 | 行政区划版本 | 2020 年版 | P1 |
| D-07 | 托管方案 | 开发期受控 internal；正式发布方案待定 | 公开发布前 |
| D-08 | 商业化（免费/付费/开源） | 按可能商业化从严 | **P1a** |
| D-09 | 时间口径 | 2020 基准情景，回合 0 = 2021Q1，120 回合（01 §3.2） | **P0** |
| D-10 | 玩家身份 | 单省主政 + 全国沙盒 | P3 |
| D-11（新） | 渲染主形态 | A 档俯视手绘（V1）；B 档 3D 倾斜为 P8 可选 | **P0** |
| D-12（新） | 平台优先级 | 桌面优先；平板仅浏览级；4K 仅截图 | P2 |
| D-13（新） | 发布地区、形式与法规适用路径（地图审核类别、测绘资质、游戏出版、数据存储） | 需专业意见；未确认前只做 internal | P1a 启动、公开发布前完成 |

## 2. 风险登记

| 编号 | 风险 | 可能性 | 影响 | 缓解 | 触发信号 | 最迟处理 |
|---|---|---|---|---|---|---|
| R-01 | 地图审核不通过或周期长 | 中 | 高 | 合规层独立；D-04/D-13 提前到 P1a；审批登记机制 | P2 结束仍无合规来源 | P2 |
| R-02 | 数据许可不允许商用/再分发 | 中 | 高 | P1a 审计卡与替代源 | `commercial_ok=false` | P1a |
| R-03 | 统计数据缺失 | 高 | 中 | 地级为核心；缺失如实标注 | 审计卡缺失率高 | P1a |
| R-04 | 跨引擎确定性破坏 | 低 | 高 | 08 §2 + 夜间三浏览器回放 | 哈希不一致 | 持续 |
| R-05 | A 档渲染性能不达标 | 低 | 中 | P1a 合成样例实测；Canvas 2D 退路（07 §8） | P1a-A5 不达标 | P1a |
| R-06 | 经济模型动态不合理 | 中 | 中 | 有界调整、守恒断言、护栏 | 护栏失败 | P6 |
| R-07 | 美术产能不足 | 中 | 中 | A 档 2D 资产量小；P2 起并行 | P8 前资产完成 < 70% | P8 |
| R-08 | 接口漂移 | 中 | 中 | 14 为唯一事实源；契约测试 | 同类返工 ≥ 2 | 持续 |
| R-09 | 内容敏感性 | 中 | 高 | 内容红线与审核清单；不做军事图层 | 审核不通过 | 持续 |
| R-10 | three.js 升级破坏 | 中 | 低 | 版本锁定 | — | — |
| R-11 | 网格 R 不合适 | 中 | 高 | L2 冻结在 P1-G；候选 12/16/20 km | 冲突率/可读性不达标 | P1-G |
| R-12（新） | 交通/AI 计算超预算 | 中 | 中 | P1a 路由样例、有界候选 | P1a-A6 超标 | P1a / P4 |
| R-13（新） | 历史网络快照不可得 | 中 | 低 | 标注「近似 2020 年末」 | 审计卡结论 | P1a |
| R-14（新） | 管线资源超出单机 | 中 | 中 | 流式窗口处理、预聚合 | P1a-A10 超标 | P1a |

## 3. ADR 索引

| ADR | 标题 | 位置 | V0.2 状态 |
|---|---|---|---|
| ADR-001 | Web 优先 | 02 | 保留 |
| ADR-002 | three.js 自研渲染（含 Canvas 2D 对比与退路） | 02 | 修订 |
| ADR-003 | 模拟内核 TypeScript | 02 | 保留 |
| ADR-004 | 表驱动状态 | 02 | 保留 |
| ADR-005 | DOM UI + GPU 地图文字 | 02 | 保留 |
| ADR-006 | Python 管线 | 02 | 保留 |
| ADR-007 | Albers 等积 + 尖顶六边形；R 候选，P1-G 冻结 | 04 | 修订 |
| ADR-008 | 校准在 TS 中完成（P6） | 05 | 修订（时点） |
| ADR-009 | 自定义 CCB 容器（wire spec v2） | 06 | 修订 |
| ADR-010 | 跨回合平滑的交通分配（玩法近似，非均衡） | 10 | 修订 |
| ADR-011 | 有供给上限的多轮贸易分配 | 11 | 修订 |
| ADR-012 | 效用 AI + 有界候选 + 同快照观察 | 12 | 修订 |
| ADR-013 | 现代场景不含地区间军事冲突 | 01 | 保留 |
| ADR-014 | 受限声明式效果语言 | 06 | 保留 |
| ADR-015 | A 档俯视为 V1 主渲染形态 | 07 | 新增（待 D-11） |
| ADR-016 | 依赖确切版本锁定 | 02 | 新增（P1a 填写） |
| ADR-017 | 标准 PCG32 + 双路 xxHash32 状态哈希 | 08 | 新增 |
| ADR-018 | 命令提交即原子生效 + 幂等 commandId | 08 | 新增 |
| ADR-019 | 三层世界包（base-geo / scenario-raw / scenario-cal） | 05 | 新增 |
| ADR-020 | 统计归属（交叉表）与管理归属分离 | 04 | 新增 |

## 4. 推迟到 V1 之后
多人联机、历史场景、模组编辑器、手机布局、WebGPU、城市内部交通、海军、遥测、Service Worker 离线、桌面封装。

---

<!-- 文件：20-review-response.md -->

# 20 GPT-6.2 第 0 轮审查回复表（R001–R045）

- 审查原文：`docs/architecture/reviews/GPT-R0-review-of-V0.1.md`
- 统计：**采纳 41 条，部分采纳 4 条（R027、R033、R036、R040），不采纳 0 条**。
- 状态说明：「已修订」= V0.2 文档已改；「待验证」= 文档已给出方案，需在指定阶段用实测/证据关闭；「待用户」= 需用户裁决。

## 一、阻断项（R001–R019）

| 编号 | 结论 | 处理（修订位置） | 验收标准 | 状态 |
|---|---|---|---|---|
| R001 阶段依赖循环 | **采纳** | 世界包拆三层 `base-geo`（P1）/`scenario-raw`（P2）/`scenario-cal`（P6）（05 §5.1、06 §1.1、ADR-019）；P3/P4 用合成 fixture + 明文默认驱动量（08 §9.1）；校准移至 P6（05 §5.3、11 §6）；依赖图重画（18 §1） | 18 P1-A3、P2-A1、P6-A4；P3 测试不加载 scenario-cal | 已修订 |
| R002 冻结时点矛盾 | **采纳** | 两层冻结：L1 架构（P0）与 L2 GridSpec（P1-G，含 `gridHash`）（00 §4、04 §3）；L2 前不承诺存档兼容；测试区用全国网格子窗口 | 18 P1-G；所有产物携带 gridHash 且不匹配拒绝加载 | 已修订 |
| R003 时点与年/季口径 | **采纳**（选择「2020 基准情景，回合 0 = 2021Q1」） | 存量取 2020 观测、流量取 2020 年值 ÷ 4、2020 不变价、无季节性、120 回合（01 §3.2、05 §4、11 §2）；字段带 `referencePeriod`（05 §2） | 时间换算单测；`turnToYearQuarter` 测试；D-09 用户确认 | 已修订 / 待用户（D-09） |
| R004 县人口与格归属冲突 | **采纳** | 格×县交叉表（陆地交集面积 + 人口权重）；统计归属与管理归属分离；最大余数法整数化；附属城镇独立实体不并入；省面积用交集面积（04 §4.1、§4.3，ADR-020） | 04 G5；05 V1、V2；16 §2.1 的四类边界 fixture | 已修订 |
| R005 海陆判定与小岛城市 | **采纳** | 独立陆海掩膜（42_landmask）；`land_area`/`terrainClass`/`domain`/`islandFeature` 分层；有锚点的格不判为纯海洋；不挪动城市坐标（04 §4.3–4.4、05 §5.3） | 05 V4（锚点所在格 has_land 且含其县）；小岛 fixture | 已修订 |
| R006 强制全连通 | **采纳** | V5 改为按真实覆盖的连通分量报告 + 多式联运可达 + 孤立白名单；禁止伪造边；真实渡运建 ferry 边（05 §8 V5、10 §2.3） | 05 V5；10 §7.1 | 已修订 |
| R007 CCB 规范歧义 | **采纳** | 完整 wire spec：头部、段名字符集与唯一性、dtype/arity/count 语义、对齐与不重叠、padding 全零、CRC-32/ISO-HDLC、u64 安全范围、utf8_table 与 json 规则、required 标志、字节序处理；`state_hash` 改用单元素 utf8_table（06 §2、§7）；containerVersion 升 2 | 06 §2.4 golden fixtures + 坏包集合；18 P1a-A3 | 已修订 |
| R008 packageHash 覆盖不全 | **采纳** | 包身份 = 规范化 `manifestCore` 的 SHA-256，覆盖网格、文件清单（路径/字节/哈希/stage）、distribution、合规文件、许可集；非语义时间进 `buildInfo`；规范 JSON 禁用浮点（06 §1.2） | 06 §1.2 的「必变/不变」测试；审批登记绑定 identity | 已修订 |
| R009 可复现输入不全 | **采纳** | 可复现范围限定为锁定环境 + 完整输入；缓存键含全部上游内容哈希与工具链 digest；人工 CSV 入清单；世界包不含时间戳（05 §1、§3.1、§7） | 18 P1-A4（两次冷构建 identity 相同 + 失效测试） | 已修订 |
| R010 ID 域混用 | **采纳** | 定义 AdminIdx/ProvinceId/PrefectureIdx/CountyIdx/SettlementId/CityId/TownId 各自的域、排序与哨兵；显式映射列；禁止隐式换算（06 §3、14 §1） | 打乱 admin 行序 fixture 测试（06 §3） | 已修订 |
| R011 PRNG 与哈希不一致 | **采纳** | 标准 PCG32 XSH-RR（64 位 state/inc 以双 uint32 实现）、官方初始化、种子派生、连续流、Lemire 取样；状态哈希统一为「两路 xxHash32 拼接 = 16 位小写 hex」（08 §2.2、§2.5，ADR-017）。说明：GPT 建议 xxHash64 或其他明确 64 位算法，此处选后者以避免 JS 64 位乘法 | 官方 PCG32 向量（从官方 C 实现运行获得，不凭记忆）；xxHash32 官方向量；18 P1a-A4 | 已修订 / 待验证（P1a） |
| R012 规范状态未定义 | **采纳** | 规范序列化（字段顺序、有效行、nextId 与删除集、小端、UTF-8）；纳入/不纳入哈希的清单；−0 归一、非有限值抛错、安全整数检查、统一舍入与最大余数法（08 §2.4–2.5） | 08 §10 第 2、4 条 | 已修订 |
| R013 命令重复执行 | **采纳**（选择「提交即原子生效 + 日志唯一记录」） | 删除 endTurn 步骤 0 的重复执行；`commandId` 幂等、`acceptedSeq`、拒绝不入日志、取消为补偿命令、结算期间 BUSY（08 §5、§6.2，ADR-018） | 08 §10 第 3 条；16 §2.3 | 已修订 |
| R014 沙盒授权与 waypoint 类型 | **采纳** | `Controller` + `actingProvince` 权限模型；沙盒可代任何省；跨省协议原子扣款；带 kind 的 `Waypoint`；RoutePreview 返回 `quoteId`，过期报 `QUOTE_STALE`（08 §6.1、§6.3，10 §3，14 §5） | 沙盒命令、越权命令、过期报价、资金不足回滚测试 | 已修订 |
| R015 贸易不守恒与 GDP 口径 | **采纳** | 生产以增加值为口径，总产出由增加值率推导；可贸易部门改为「需求侧分配 → 供给上限缩放 → 剩余重分配，固定 3 轮 → 外部市场 → unmet/库存」；逐行逐列逐部门守恒；全部零值分支（11 §2–4） | 11 §8 第 4 条；VS-A3 | 已修订 |
| R016 交通模态与容量契约 | **采纳** | 有向多模态图：节点种类、边种类（link/transfer/access/ferry/sea_lane/air_route）、客货分容量与准入、桥隧结构、先真实拓扑后格化（10 §2、05 §5.3）；CCB schema 更新（10 §2.4） | 10 §7.1、§7.6；P5-A1 | 已修订 |
| R017 接口未封闭 | **采纳** | 14 补全：WorldData/Manifest/GridSpec/StateDiff/StateSnapshot/SubmitResult/RenderStats/PickResult 等；Worker 协议含 protocol 版本、gameId、revision、resync、cancel、超时、重启、过期响应；所有权规则（权威状态不转移、世界数据各自加载）；差量唯一路径（14 §1–6） | 18 P3-A0（附录 A 结果类型补全）、P3-A2 | 已修订（附录 A 待 P3-A0） |
| R018 地形 draw call/三角形超预算 | **采纳** | B 档地形改为「按 LOD 实例化 + 高度纹理数组」，每帧地形 draw call ≤ 8；三角形全局上限与确定性降级；深度预通道中档关闭；整帧手动累加统计（07 §2、§9）。另：V1 主形态改为 A 档俯视（D-11），B 档不在关键路径 | P1a-A5（A 档）；P8-B（B 档，若批准） | 已修订 / 待用户（D-11） |
| R019 合规覆盖与截图 | **采纳** | 合规 Pass 移至后处理之后的最终合成；`compliance.ccb` 为 boot 且首帧前校验失败不渲染；应用级导出强制合成审图号/水印/附图，无可关闭参数（07 §2、14 §4.2、05 §6.2）；签核 ≠ 行政审批（16 §6） | P2-A7；16 §6 自动项 | 已修订 |

## 二、重要项（R020–R039）

| 编号 | 结论 | 处理（修订位置） | 验收标准 | 状态 |
|---|---|---|---|---|
| R020 路由复杂度与均衡表述 | **采纳** | 声明为玩法近似非均衡；客货两套图；CSR、预分配堆、最短路树逆序累加；航空稀疏化（k=6 + m=10 枢纽）；删除「<5% 复用」；零容量与不可达处理；复杂度重估（10 §2.5、§5） | P1a-A6 合成图实测；10 §7.4 | 已修订 / 待验证 |
| R021 AI 寻路超预算 | **采纳** | 代理粗筛后每省仅 3 次 A*；A* 固定扩展上限（非时间）；全局调用上限 93 次（12 §5.2、10 §3） | P4 AI 代理基准；P7-A5 | 已修订 / 待验证 |
| R022 版本锁定与早期基准 | **采纳** | 新增 P1a 可行性门禁；ADR-016 确切版本；自研/依赖清单（02 §1.1–1.2、18 P1a） | P1a-A1、A5、A6、A7 | 已修订 |
| R023 GPU 能力与回退 | **采纳** | 能力矩阵（仅依赖 WebGL2 核心；整数纹理 texelFetch + 手动插值；R32F 不过滤；KTX2 回退；上下文丢失恢复）；解码所有权划分（02 §3、07 §6） | P1a-A7 实机探测；E2E 上下文丢失 | 已修订 / 待验证 |
| R024 core-types/计时/lint 一致性 | **采纳** | core-types 允许纯值转换与 schema 校验；sim 计时改为宿主观察者；lint 增加 `no-restricted-properties` 与别名检测及自测文件；补 tools/calibrate 与生成顺序（03 §2、§5，08 §5.1） | P1-A1 lint 规则自测 | 已修订 |
| R025 网格取整与轴约定 | **采纳** | (lon,lat) 轴序、always_xy；整数原点与半径；roundHalfAwayFromZero 初次取整 + 固定重算优先级；越界 null；渲染 x/z 与北向约定；CPU 权威、GPU ±1 px 容差；完整 golden vectors（04 §1–2）；「厘米级」改为待核实 | 04 G1、G2 | 已修订 |
| R026 数据时点与覆盖 | **采纳** | 每源覆盖审计卡；地级为经济核心；网络标注「近似 2020 年末」除非取得快照；取消县级 15% 门槛（05 §2） | P1a-A8 | 已修订 |
| R027 合规/许可路径 | **部分采纳** | 采纳：合规来源评估与法律意见提前到 P1a；物理分离 ≠ 许可结论；派生链清单；D-08 未定前从严（05 §3、§6，19 D-04/D-05/D-13）。**不采纳**的部分：「无合规真实地图来源前仅使用合成 fixture」——理由：本项目核心是真实数据，开发必须基于真实数据迭代；在**源许可允许**且**严格访问控制**的 internal 环境中使用真实开源数据开发是合理做法，对外分发才是合规与许可的关键节点。合成 fixture 继续用于自动化测试 | P1a-A9；public 构建门禁 | 已修订 / **分歧待用户裁决（见 §四）** |
| R028 法规适用与审批生命周期 | **采纳** | 新增 D-13（法规适用路径需专业意见）；审批登记取代 `signed` 布尔值，绑定产物 hash、范围、有效期、复核时间、撤回（05 §6.2、17 §5） | public 构建校验登记；P9-A7 撤回演练 | 已修订 |
| R029 管线资源估算 | **采纳** | 流式窗口处理；10 m 土地覆盖 100 m 预聚合直方图 + 精度对照；人口守恒重映射；拆分下载/人工/冷构建/热增量/打包预算；全国构建时间在 P1a 三样本实测后设定（05 §5.3、§9） | P1a-A10；P1-A3 | 已修订 / 待验证 |
| R030 字段字典与缺失语义 | **采纳** | 字段字典（dtype、单位、scale、范围、缺失哨兵/有效位、聚合口径）；字段级 lineage + override；补 inland_water、facilities、lineage 文件；gdp 用 f64（06 §4、§6） | 05 V6、V8 | 已修订 |
| R031 splat/AO 通道冲突与接缝 | **采纳** | 7 权重 + 派生第 8 层 + 独立 AO 纹理；border texel、geomorph 边缘对齐、噪声边缘衰减（07 §9）。A 档不使用 splat 混合，问题仅涉及 B 档 | P8-B | 已修订 |
| R032 实例与内存预算 | **采纳** | 精灵按缩放密度表 + 全局上限 2 万；DPR 按 drawingBuffer 计费；分项统计 CPU/GPU/渲染目标/解码临时；紧急逐出与上下文丢失（07 §3.3、§6、§7，15 §2.1） | P2-A9；P1a-A5 | 已修订 / 待验证 |
| R033 字形容量与拾取真值 | **部分采纳** | 采纳：40 px 单元 → 2,601 字/页；用字以实际统计为准；不再预先声称压缩体积；拾取真值用独立参考实现（Python 有理数 / 高采样光线步进）（07 §4–5）。**不采纳**「解析法失败时改 GPU ID pass」作为预设方案——A 档正交投影下 CPU 解析拾取是精确的，无需额外 Pass；B 档使用与显示一致的高度函数，若 P8-B 实测失败再评估 | P2-A8；P8-B | 已修订 |
| R034 确定性数学域与误差 | **采纳** | `sim/math` 每函数定义有效域、误差、越域行为；稳定 softmax；调用前零值分支；exp 核预计算；高精度参考向量（08 §2.3、11 §4.3） | P1a-A4 | 已修订 / 待验证 |
| R035 人口模型边界 | **采纳** | 出生/死亡分项；单位与下限；不迁往自身；空目的地集；ln 输入下限；生态禁区硬过滤（不用 ×∞）；交通成本口径统一为本回合；事件后同步格人口；因果验收改为相对对照 fixture（09 §2–4、§7） | 09 §7 | 已修订 |
| R036 产品优先级 | **部分采纳** | 采纳「先交付可探索的真实数据地图，再做回合制」：新增 M1/M2 里程碑（01 §3、18 §1）。**事实更正**：GPT 称 USACiv 网址「已由先前交流给出」「用户已确认回合制方向」——在我方对话中用户未提供该网址；我已于 2026-11-27 实际打开该网址核实：它是 Canvas 2D 的文明风格六边形数据地图，**未发现回合机制**（01 §1）。用户原始需求包含城市/交通/经济/策略模拟系统，因此 M2 回合制保留 | D-01 用户确认 | 已修订 / 待用户（D-01） |
| R037 经济账户不闭合 | **采纳** | 省级现金/债务/利息/转移支付账户与逐省守恒；中央账户；跨省出资冻结；A0 明确为游戏假设；校准适用条件与残差报告（11 §5–6） | 11 §8 第 4 条 | 已修订 |
| R038 存储与 CI 权限 | **采纳** | internal/public 独立存储与 URL 空间、全部文件受控；PR 无写凭证；release 需人工批准 + 短期凭证；撤回覆盖 CDN 与旧包（17 §2、§4、§5） | P9-A7 | 已修订 |
| R039 AI 行为与平衡验收 | **采纳** | 同一快照观察；投标同时结算；互斥冲突规则；性格为游戏参数（映射表）；验收改为多种子统计与「可执行条件下」（12 §5、§8） | 12 §8 | 已修订 |

## 三、建议项（R040–R045）

| 编号 | 结论 | 处理 | 状态 |
|---|---|---|---|
| R040 平板与 4K | **部分采纳** | 采纳：明确平台优先级为待用户决策 D-12，指针输入抽象从一开始支持基础触控（13 §2.3）；4K 仅截图目标（01 §6）。默认「桌面优先、平板浏览级」由用户最终决定 | 待用户（D-12） |
| R041 范围过大 | **采纳** | 新增 M1 与垂直切片 VS（18 P4）；内容数量推迟到 P7；音频、战略视图、Service Worker、B 档推迟（01 §5.2、12 §7、13 §5） | 已修订 |
| R042 预算口径不一致 | **采纳** | 统一单位 MiB；人口+城市统一 150 ms；软目标合计 1,070 ms + 硬上限 1,500 ms；测量范围、种子与回合区间；整列差量单独度量（15、08 §7） | 已修订 |
| R043 浏览器与视觉回归 | **采纳** | WebKit ≠ Safari，Safari/iPad 实机签核；CI 环境锁定项；阈值实测后定；全国验收不以 fixture 代替（16 §1、§3、§5） | 已修订 |
| R044 Service Worker 等过早 | **采纳** | V1 不用 SW；启动原子选择兼容组合；存档兼容以四元组判定（17 §3、06 §7） | 已修订 |
| R045 风险治理与关闭条件 | **采纳** | 决策项增加最迟决策点；风险增加最迟处理；任务包按可测结果划分；共同基线注明 commit；本表即关闭跟踪（19、18 §2） | 已修订 |

## 四、需要用户裁决的事项

| 编号 | 事项 | Claude 意见 | GPT 意见 |
|---|---|---|---|
| U1（R027） | 合规数据来源确定前，内部开发能否使用真实开源数据 | 能：在源许可允许、internal 严格访问控制、显示水印的前提下使用；公开分发前必须完成许可与审批 | 未确认合规来源前仅用合成 fixture |
| U2（D-11） | V1 主渲染形态 | A 档俯视手绘（参照 USACiv 已验证的观感，风险与工作量更低），3D 倾斜作为 P8 可选 | 未表态（R018 指出 3D 地形预算问题，建议不换 three.js） |
| U3（D-01、D-09） | 产品形态与时间口径 | M1 数据地图 → M2 回合制；2020 基准情景、2021Q1 开始、120 回合 | 同意先交付地图再做回合制；时点二选一由用户定 |
| U4（D-08、D-12） | 商业化意图；平台优先级 | 按可能商业化从严；桌面优先 | 同 |

---

<!-- 文件：CHANGELOG.md -->

# 变更记录：V0.1 → V0.2（2026-11-27）

依据：GPT-6.2 第 0 轮审查（R001–R045）+ Claude 对参照对象 USACiv 的实际核实。逐条对应关系见 `20-review-response.md`。

## 一、方向性变更（需用户确认）
1. **产品分两个里程碑**：M1「华夏图鉴」（USACiv 式真实数据地图，无模拟）→ M2「华夏文明」（回合制策略）。依据：USACiv 实测为数据地图、无回合（01 §1）。〔R036、R041；D-01〕
2. **V1 主渲染形态改为 A 档俯视手绘六边形地图**；3D 倾斜地形降为 P8 可选 B 档。〔R018；D-11、ADR-015〕
3. **时间口径**：2020 基准情景；回合 0 = 2021Q1；120 回合（原 2020Q1 起、124 回合）。〔R003；D-09〕

## 二、结构性变更
4. 世界包拆为 `base-geo` / `scenario-raw` / `scenario-cal` 三层；校准移至 P6；P3/P4 使用合成 fixture 与默认驱动量。〔R001；ADR-019〕
5. 冻结分两层：L1 架构（P0）、L2 GridSpec（P1-G）。〔R002〕
6. 路线图重排：新增 P1a 可行性与合规门禁、P2 = M1、P4 = 垂直切片；原 P4–P8 顺延为 P5–P9。〔R001、R022、R041〕

## 三、规范补全
7. 网格：轴序、整数原点/半径、取整与平局规则、越界、渲染轴向；R 改为候选 12/16/20 km。〔R025〕
8. 格×县交叉表；统计归属与管理归属分离；人口守恒落格；附属城镇独立。〔R004；ADR-020〕
9. 独立陆海掩膜与海陆字段分层；小岛城镇处理。〔R005〕
10. 连通性按真实覆盖验收；真实渡运。〔R006〕
11. CCB wire spec v2（containerVersion = 2）。〔R007〕
12. 包身份（identity）规范化定义。〔R008〕
13. 可复现范围与缓存键。〔R009〕
14. ID 域与映射列。〔R010〕
15. 标准 PCG32 + 双路 xxHash32 状态哈希。〔R011；ADR-017〕
16. 规范状态序列化、数值域、舍入、整数分配。〔R012〕
17. 命令提交即原子生效、幂等、去掉 endTurn 重复执行。〔R013；ADR-018〕
18. Controller/actingProvince 权限、跨省事务、带类型 Waypoint、报价版本。〔R014〕
19. 经济：增加值口径、守恒的多轮贸易分配、外部市场、库存、零值分支；财政账户闭合。〔R015、R037〕
20. 交通：有向多模态图 schema、客货分容量与准入、航空稀疏化、树累加加载、删除不安全的复用规则。〔R016、R020〕
21. 接口契约补全与 Worker 协议（版本、revision、resync、所有权、重启）。〔R017〕
22. 合规 Pass 移至最终合成；应用级导出；审批登记替代布尔签核；新增 D-13。〔R019、R028〕

## 四、其他
23. AI：同快照观察、粗筛后少量 A*、固定扩展上限、冲突规则、统计式验收。〔R021、R039〕
24. 依赖确切版本锁定、自研/依赖清单、GPU 能力矩阵。〔R022、R023；ADR-016〕
25. lint 规则补全（属性限制、别名检测、自测）；sim 计时改为宿主观察者。〔R024〕
26. 数据源覆盖审计卡；县级缺失门槛取消。〔R026〕
27. 合规/许可路径提前到 P1a；派生链清单；internal 真实数据开发（部分采纳，待用户裁决）。〔R027〕
28. 管线流式处理、预聚合、预算拆分。〔R029〕
29. 字段字典、lineage、缺失语义。〔R030〕
30. B 档 splat/AO 通道与接缝修正。〔R031〕
31. 精灵实例全局上限、DPR 按 drawingBuffer 计费、内存分项统计。〔R032〕
32. 字形容量（40 px 单元、2,601 字/页）与独立拾取真值。〔R033〕
33. 确定性数学函数的域与误差。〔R034〕
34. 人口模型边界条件与相对因果验收。〔R035〕
35. 平台优先级 D-12、基础触控抽象。〔R040〕
36. 性能预算统一口径与余量。〔R042〕
37. 测试：Safari 实机、CI 锁定、阈值实测。〔R043〕
38. 推迟 Service Worker；启动原子选择版本组合。〔R044〕
39. 决策与风险增加最迟处理点；任务包按可测结果划分。〔R045〕
40. 不做军事图层（USACiv 有，本项目不做）。〔05 §6.2 第 7 条〕
