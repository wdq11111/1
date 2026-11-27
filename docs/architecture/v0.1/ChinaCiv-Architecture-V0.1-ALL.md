# ChinaCiv《华夏文明》工程架构 V0.1（合并版）

> 本文件由 00–19 各分册按顺序合并生成，内容以分册为准。

---

<!-- 文件：00-README.md -->

# ChinaCiv《华夏文明》工程架构 V0.1

| 字段 | 值 |
|---|---|
| 文档版本 | **V0.1（草案，待独立技术审查）** |
| 状态 | 第 0 轮：架构设计。**未冻结，禁止进入编码** |
| 主设计 / 审查 | Claude（主设计师、审查员） |
| 独立技术审查 | GPT-6.2 |
| 最终决策 | 项目负责人（用户） |
| 日期 | 2026-11-27 |
| 冻结目标 | 双方审查一致 + 用户确认 → V1.0 基准架构 |

## 1. 一句话定义

一款运行在浏览器（后续可打包桌面端）中的回合制策略游戏：以**真实中国地理与社会经济数据**生成六边形地图，玩家经营城市、修建交通、调控经济、推行政策，在《文明》级别的 3D 风格化画面上进行长期战略决策。

## 2. 文件清单与阅读顺序

| # | 文件 | 内容 | 审查优先级 |
|---|---|---|---|
| 00 | `00-README.md` | 总览、约定、审查指引 | — |
| 01 | `01-product-scope.md` | 产品定义、玩法闭环、范围与非目标、假设 | 高 |
| 02 | `02-tech-stack.md` | 技术选型与理由、被否决的方案 | **最高** |
| 03 | `03-repo-structure.md` | Monorepo 目录、模块职责、依赖规则 | 高 |
| 04 | `04-geo-grid.md` | 坐标系、投影、六边形网格规范、ID 体系 | **最高** |
| 05 | `05-data-pipeline.md` | 数据源、许可、ETL 阶段、地图合规 | **最高** |
| 06 | `06-data-formats.md` | 世界包、二进制容器、JSON Schema、存档格式 | 高 |
| 07 | `07-rendering.md` | 渲染架构、地形/水体/河流/标注/迷雾、LOD | 高 |
| 08 | `08-sim-core.md` | 模拟内核、回合管线、确定性、状态存储 | **最高** |
| 09 | `09-city-population.md` | 城市与人口系统 | 中 |
| 10 | `10-transport.md` | 交通网络、建设、流量分配 | 高 |
| 11 | `11-economy.md` | 经济系统、部门、贸易、财政、校准 | 高 |
| 12 | `12-strategy-ai.md` | 政策、发展树、事件、AI 决策、胜利条件 | 中 |
| 13 | `13-visual-ui.md` | 美术方向、视觉规范、UI/UX、本地化 | 中 |
| 14 | `14-interfaces.md` | 模块间接口（TypeScript 定义）、消息协议 | **最高** |
| 15 | `15-performance.md` | 性能预算、优化策略、测量方法 | 高 |
| 16 | `16-testing.md` | 测试策略、确定性回放、视觉回归 | 高 |
| 17 | `17-build-deploy.md` | 构建、CI/CD、发布、托管、版本管理 | 中 |
| 18 | `18-roadmap-acceptance.md` | 阶段划分、依赖关系、逐阶段验收标准 | **最高** |
| 19 | `19-risks-decisions.md` | 风险登记、待用户决策项、ADR 索引 | 高 |

另附 `ChinaCiv-Architecture-V0.1-ALL.md`：上述文件按顺序合并的单文件版本，便于整体转交审查。

## 3. 全局约定

- **语言**：文档中文；代码标识符、文件名、Schema 字段英文 `camelCase`（TS）/ `snake_case`（Python、数据列）。
- **关键字**：「必须 / 禁止」= 硬约束，违反即验收不通过；「应当」= 默认做法，偏离需在 ADR 记录理由；「可以」= 可选。
- **单位**：长度米（m）、面积平方千米（km²）、货币「游戏元」以 2020 年人民币不变价为锚、时间以「回合」为单位（1 回合 = 1 季度，见 01）。
- **事实标注**：涉及外部事实（数据许可、法规、统计数字）时标注「已核实（来源）」或「待核实」。**待核实项在 P1 阶段必须逐一核实后才能使用**，不得当作事实写入代码或宣传材料。
- **ADR**：每一个「被否决方案」或「偏离默认」都记录为 ADR（Architecture Decision Record），编号 `ADR-xxx`，索引见 `19-risks-decisions.md`。

## 4. 架构总览图

```
                   ┌──────────────────────── 离线（构建期） ────────────────────────┐
  原始数据源        │  pipeline/ (Python)                                              │
  DEM / 土地覆盖 ──▶│  fetch → normalize → project → grid → classify → aggregate      │
  人口 / 统计 ─────▶│  → network → calibrate → validate → compliance → package         │
  路网 / 水系 ─────▶│                                         │                        │
  行政区划(合规) ──▶│                                         ▼                        │
                   │                          world package（版本化、内容寻址）        │
                   └─────────────────────────────────────────┬────────────────────────┘
                                                             │ CDN（不可变路径）
                   ┌──────────────────────── 运行时（浏览器） ┼───────────────────────┐
                   │                                         ▼                        │
                   │   主线程                                    Sim Worker           │
                   │  ┌──────────┐  ViewModel  ┌──────────┐  Command  ┌───────────┐   │
                   │  │ UI(React)│◀───────────▶│ AppShell │──────────▶│ sim (纯TS)│   │
                   │  └──────────┘   订阅       │ (协调层) │◀──────────│ 确定性内核 │   │
                   │  ┌──────────┐  RenderView  └──────────┘ Diff/Event└───────────┘   │
                   │  │ renderer │◀─────────────────┘                                  │
                   │  │ (three)  │                       Asset Loader Worker           │
                   │  └──────────┘◀──────────────── 解码 chunk / KTX2 / glTF ──────────│
                   └──────────────────────────────────────────────────────────────────┘
```

核心原则（每条都可在代码审查中检查）：

1. **数据离线化**：所有地理计算（投影、栅格化、分类、聚合）在构建期完成；运行时只读预计算的世界包，不做 GIS 运算。
2. **模拟与表现分离**：`sim` 是无 DOM、无 WebGL、无随机时钟的纯 TypeScript 包，运行在 Web Worker；渲染与 UI 只读快照/差量。
3. **确定性**：同一世界包 + 同一种子 + 同一命令序列 → 逐字节相同的状态哈希。这是存档、回放、调试、测试的基础。
4. **数据驱动**：规则（建筑、政策、事件、发展树、部门参数）放在 `content/` 的 YAML，构建期编译并校验，不硬编码进系统逻辑。
5. **合规隔离**：国界、省界、重要岛屿等合规敏感图层单独成层、单独来源、单独校验，发布前必须通过合规清单。
6. **可度量的质量**：每个阶段都有数字化的验收标准（性能、精度、确定性、视觉对比），见 18。

## 5. 给 GPT-6.2 的审查指引

请对每个文件独立审查，重点回答：

1. **可行性**：选型、数据量、性能预算之间是否自洽？有没有在浏览器里做不到或代价被低估的地方？
2. **缺口**：是否有关键技术细节缺失，导致编码阶段必须猜测？请指出具体章节与缺失内容。
3. **过度设计**：是否有 V1 不需要、可以推迟或删掉的模块？
4. **一致性**：文件之间的数字、命名、接口是否冲突（例如 04 的网格参数与 15 的性能预算、06 的格式与 14 的接口）？
5. **替代方案**：如果你认为某项选型错误，请给出替代方案 + 理由 + 迁移代价。

回传格式（每条一行，便于逐条合并）：

```
[编号] [文件#章节] [严重度: 阻断/重要/建议] [类型: 可行性/缺口/过度设计/一致性/替代方案]
问题：……
建议：……
```

审查意见由 Claude 逐条回复「采纳 / 部分采纳 / 不采纳（附理由）」，产出 V0.2；分歧项提交用户裁决；全部关闭后冻结 V1.0。

---

<!-- 文件：01-product-scope.md -->

# 01 产品定义与范围

## 1. 参照对象与假设

- **USACiv**：用户提出以「中国版 USACiv」为目标。经检索，**未能确认名为 USACiv 的具体产品及其玩法细节（待用户提供链接或说明）**。本架构按以下理解设计：「基于真实国家地理与数据的、《文明》风格的交互式策略地图游戏」。若 USACiv 的实际玩法与此不同（例如偏向即时、偏向军事、偏向教育），以 `19-risks-decisions.md` 中 D-01 的用户决策为准修订本文件。
- **《文明》级视觉风格**指：倾斜俯视 3D 相机、风格化写实地形、六边形格子叠加、清晰的战略信息层、精致 UI，而**不是**复刻任何既有游戏的美术资产、名称、界面布局或角色。所有美术与 UI 为原创。

## 2. 目标体验

玩家面对一张真实比例、真实地形的中国地图：青藏高原的高耸、四川盆地的环山、长江黄河的走向、东部平原的城市密度都来自真实数据。玩家的决策（修高铁、建港口、定产业政策）在符合直觉的经济与人口规律下产生可见后果：城市扩张、人口迁移、货流变化、地区差距变化。

### 2.1 设计支柱（每次加功能都要回答它服务哪一条）

| 支柱 | 含义 | 可检查的体现 |
|---|---|---|
| P1 真实 | 地理与初始状态来自可溯源的真实数据 | 每个数值字段可追溯到 `provenance`（见 06）；初始省级人口/GDP 与源数据误差 ≤ 2% |
| P2 可读 | 复杂系统通过地图直接看懂 | 任意系统（人口、货流、产业）都有对应地图叠加层，3 次点击内可达 |
| P3 有后果 | 决策带来空间上可见的变化 | 修一条线路后，下 4 回合内沿线城市人口/产出变化可在叠加层中看到 |
| P4 好看 | 每个缩放级别都是值得截图的画面 | 视觉验收用参考截图对比（见 13、16） |

## 3. 核心玩法闭环（V1 默认规则集：发展竞赛）

> **重要设计约束**：现代中国场景下，**不设计中国境内各地区之间的军事冲突、割据、独立等内容**。此类内容涉及国家统一与领土完整的表述，既违反地图内容管理规定，也会导致游戏无法过审。V1 规则集定位为「发展与治理」。军事玩法仅可能出现在后续**历史场景**（如战国、三国）中，且需单独评估（D-02）。

- **玩家身份**：选择一个省级行政区担任「主政者」（默认）；或选择「全国沙盒」模式统管全国（无胜负）。
- **对手**：其余省级行政区由 AI 主政者管理，在同一全国市场中竞争人口、投资、人才与国家级项目，也可合作共建跨省线路。
- **时间**：起始 2020 年第 1 季度（以第七次全国人口普查等 2020 年数据为初始状态），默认结束于 2050 年第 4 季度，共 **124 回合**。1 回合 = 1 季度。
- **单回合闭环**：

```
观察（叠加层/报告） → 决策（建设、政策、预算、项目竞标）
      → 结束回合 → 模拟结算（人口、经济、交通流、事件、AI）
      → 结果反馈（报告、地图变化、通知） → 观察 ……
```

- **玩家可执行的动作（V1）**：
  1. 交通建设：公路（高速）、铁路（普速/高铁）、港口扩建、机场扩建、内河航道整治。
  2. 城市建设：在城市辖格设置功能区（产业区、住宅区、科教区、生态区），升级公共服务。
  3. 经济政策：产业扶持方向、税率档位、财政投入结构、发债。
  4. 发展树：投入「研发点」解锁技术与制度（如「高速铁路技术」「特高压」「数字政务」）。
  5. 国家项目：竞标中央下发的项目（枢纽、实验室、试验区），与 AI 竞争。
  6. 区域协作：与相邻省份签订协议（共建线路、产业转移、生态补偿）。
- **胜负**：结束时按「综合发展指数」排名（GDP、人均可支配收入、城镇化率、生态质量、科技、民生满意度加权）；另设里程碑成就。权重在 `content/rules/victory.yaml` 中定义。

## 4. 场景（Scenario）分层

为将「通用地理」与「时代数据」解耦：

| 层 | 内容 | 是否随场景变化 |
|---|---|---|
| 地理基底（Base Geography） | 地形、海陆、河流湖泊、气候、土地覆盖 | 否（全场景共用） |
| 场景包（Scenario Pack） | 行政区划、城市、人口、交通网络、经济数据、可用规则 | 是 |
| 规则集（Ruleset） | 系统参数、建筑、政策、事件、胜利条件 | 是（场景引用规则集） |

V1 只交付一个场景：`modern-2020`。架构保证后续可新增历史场景（如 `qin-221bc`）而不改动地理基底与引擎，只需新场景包 + 规则集。

## 5. 范围

### 5.1 V1 必须包含

- 全国（含台湾省、香港、澳门、南海诸岛）真实地形六边形地图；周边国家地区作为不可经营的背景区域显示地形。
- 31 个省级行政区（不含港澳台）可选为玩家；台湾省、香港、澳门在地图上完整、正确表示，V1 中作为不可选、由规则统一处理的区域（参与全国市场计算，不参与竞赛）——此处理方式需用户确认（D-03）。
- 地级及以上城市（约 330 余个）作为主要城市实体；县级行政中心作为「城镇」实体（约 2,800 余个，以民政部当期数据为准，管线自动统计，**不在文档中写死数字**）。
- 交通、城市、人口、经济、政策、发展树、事件、AI 七个系统的 V1 版本。
- 存档/读档、回放、设置、新手引导（基础）。
- 简体中文完整；英文 UI 框架就绪（文本可后补）。

### 5.2 V1 非目标（明确不做）

- 多人联机、账号系统、服务器端模拟。
- 移动端适配（仅保证平板横屏可用，不做触控优化验收）。
- 军事/战斗系统。
- 模组（Mod）编辑器 UI（但规则数据格式开放，为后续模组铺路）。
- 实时（非回合制）模拟。
- 街道级精度：游戏粒度为六边形格（约 375 km²，见 04），不表示具体街道。

## 6. 目标平台

| 项 | V1 目标 |
|---|---|
| 浏览器 | Chrome/Edge ≥ 120、Firefox ≥ 121、Safari ≥ 17（需 WebGL2） |
| 参考硬件（「中档」） | Apple M1 8GB / Intel Iris Xe 16GB / GTX 1650，1920×1080 |
| 最低硬件 | WebGL2 + 4GB 内存设备，以「低画质」档位运行 |
| 桌面封装 | P8 之后可选 Tauri 封装（非 V1 验收项） |

---

<!-- 文件：02-tech-stack.md -->

# 02 技术选型

选型原则：**优先成熟、可调试、团队（含 AI 协作）熟悉的技术**；只有在成熟方案明确无法满足需求时才引入新技术，并写 ADR。

## 1. 选型总表

| 领域 | 选型 | 版本策略 | 理由（简） |
|---|---|---|---|
| 语言（客户端） | TypeScript（`strict: true`） | 5.x 锁定小版本 | 类型系统支撑大规模接口约束；与浏览器原生 |
| 包管理 | pnpm workspaces | 9.x | 严格依赖隔离，monorepo 原生支持 |
| 构建 | Vite | 5.x/6.x 锁定 | 快速 HMR，Worker/WASM/资源处理成熟 |
| 3D 渲染 | three.js（WebGLRenderer + 自定义 GLSL 3.0 着色器） | 锁定具体 r 版本，升级需走回归 | 生态最大、调试工具多、对自定义着色器友好 |
| UI | React 18 + CSS Modules + 设计 tokens（CSS 变量） | 18.x | 复杂面板/表格/表单的成熟方案 |
| UI 状态 | Zustand | 4.x/5.x | 轻量；可在 React 外订阅（渲染层也需读） |
| 模拟内核 | 纯 TypeScript，运行在 Web Worker | — | 与客户端同语言共享类型；无需跨语言序列化 |
| Worker 通信 | 自研轻量 RPC（结构化克隆 + Transferable） | — | 协议简单可控，见 14；不引入 Comlink 以免隐藏传输成本 |
| 数据管线 | Python 3.12 + GDAL 3.8+ / rasterio / geopandas / shapely 2 / pyproj / numpy | `uv` 锁定 | GIS 生态事实标准 |
| 管线编排 | 自研阶段注册 + 内容哈希缓存，`make` 入口 | — | 阶段数 ~15，不值得引入 Airflow/Snakemake |
| 规则数据 | YAML 源 → JSON（构建期编译），Zod 校验并导出 JSON Schema | — | 人可编辑、机器可校验 |
| 纹理压缩 | KTX2（Basis Universal：UASTC/ETC1S） | — | 一份资源适配所有 GPU 压缩格式 |
| 3D 模型 | glTF 2.0 + `EXT_meshopt_compression` + KTX2 | — | 标准格式，three.js 原生加载 |
| 字体 | 思源宋体 / 思源黑体（SIL OFL 1.1） | — | 可商用开源 CJK 字体，见 13 |
| 文字渲染 | MSDF 字形图集（构建期按数据用字子集生成） | — | 数千地名标注需 GPU 渲染 |
| 单元/集成测试 | Vitest | — | 与 Vite 同栈 |
| E2E / 视觉回归 | Playwright（Chromium） | — | 截图对比、性能埋点采集 |
| 属性测试 | fast-check | — | 模拟系统不变量测试 |
| 管线测试 | pytest + hypothesis（少量） | — | — |
| 代码规范 | ESLint（含 `eslint-plugin-boundaries`）+ Prettier；Python 用 ruff + mypy | — | 依赖方向规则自动化检查 |
| CI | GitHub Actions | — | 仓库托管于 GitHub |
| 大文件 | Git LFS（仅美术源文件）；数据产物放对象存储 | — | 避免仓库膨胀 |

## 2. 关键选型的理由与被否决方案

### 2.1 平台：Web 优先（ADR-001）

- **选择**：浏览器 + WebGL2。
- **理由**：「交互式策略地图」天然适合链接分享；迭代与验收（截图、回放）全程可自动化；后续可用 Tauri 包装为桌面端而不改代码。
- **否决 Unity / Godot**：
  - Unity WebGL 首包大（通常数十 MB 起）、加载慢、与 Web UI 集成差；AI 协作写 C# 场景文件可审查性差。
  - Godot 4 Web 导出对 CJK 文本、多线程（需 SharedArrayBuffer + 跨源隔离）有额外约束，GIS 数据导入需自研。
  - 两者的优势（编辑器、物理）在本项目价值有限：地图是数据生成的，没有手工关卡。
- **代价**：需自研地形 LOD、标注、迷雾等系统（见 07），这些在引擎里也大多需要定制。

### 2.2 渲染：three.js 而非地图引擎（ADR-002）

- **否决 MapLibre GL / Mapbox GL**：瓦片地图范式（Web Mercator、2.5D 挤出）难以实现《文明》式风格化地形材质、六边形叠加、单位与城市 3D 模型、战争迷雾、自定义后处理；且 Web Mercator 在中国纬度跨度上面积畸变明显（面积放大系数为 sec²φ：漠河约 53.5°N 为 2.83，三亚约 18.2°N 为 1.11，相对失真约 2.5 倍）。
- **否决 deck.gl**：擅长数据可视化图层，不擅长风格化场景；与自定义地形材质结合需要绕开其渲染管线。
- **否决 Babylon.js**：功能完整，但本项目大量使用自定义着色器，three.js 的着色器扩展与社区样例更丰富；二者能力差距不构成决定因素，选 three.js 主要因为生态与 AI 协作熟悉度。
- **否决裸 WebGL2**：需要自写场景图、资源管理、glTF/KTX2 加载器，工作量不对等。
- **WebGPU**：V1 **不**作为目标。渲染层通过 `renderer/src/gpu/` 抽象材质与 Pass，所有着色器集中管理，为后续迁移到 three.js WebGPURenderer（TSL）保留路径。理由：WebGPU 在 Safari/Firefox 的稳定覆盖与 three.js WebGPU 后端的成熟度在 V1 周期内存在不确定性（待 P7 时重新评估）。

### 2.3 模拟内核：TypeScript 而非 Rust/WASM（ADR-003）

- **理由**：
  1. 数据规模可控：可经营格子约 2.6 万、城市实体约 3,200、网络节点约 1 万（见 04、10），TypedArray + 紧凑循环在 JS 中可在预算内完成（预算见 15）。
  2. 类型共享：Command、ViewModel、存档格式与 UI 共用一份 TS 类型，避免跨语言绑定层。
  3. 可审查性：GPT 生成 + Claude 审查的协作模式下，单语言显著降低出错面。
- **退路**：若 P5 性能测试显示交通流分配或经济求解超预算 2 倍以上，允许把**单个热点函数**移植为 Rust→WASM（接口为纯 TypedArray 输入输出），需 ADR 审批。不允许整体迁移。

### 2.4 ECS：不引入通用 ECS 框架（ADR-004）

- **选择**：「表驱动状态」——格子数据为结构化数组（SoA，TypedArray），城市/线路/项目等实体为带稳定 ID 的表（列式存储），系统是按固定顺序执行的纯函数。
- **理由**：实体类型少（< 15 种）且结构稳定，通用 ECS（bitECS 等）带来的组合灵活性用不上，反而让存档、差量同步、确定性排序复杂化。

### 2.5 UI：React DOM 叠加层，而非 Canvas 内 UI（ADR-005）

- 面板、表格、图表、文本输入、无障碍、CJK 排版都是 DOM 的强项。
- 地图内标注（地名、数值气泡）用 GPU 渲染（MSDF），不用 DOM，避免数千个 DOM 节点。
- 图表库：**轻量自绘 SVG 组件**（折线、柱状、堆叠面积、桑基图仅 V1 后），不引入 ECharts（体积大且风格难统一）。若 P6 发现自绘成本过高，可引入 visx（需 ADR）。

### 2.6 数据管线：Python 而非 Node（ADR-006）

- GDAL/rasterio/geopandas 的栅格重投影、分区统计、拓扑处理在 Node 生态无对等成熟方案。
- 管线与客户端的唯一契约是**世界包格式**（06）及其 JSON Schema；Python 端通过 schema 生成的 Pydantic 模型写出，TS 端通过同一 schema 生成的类型读取，契约测试保证一致（16）。

## 3. 运行时依赖白名单（V1）

客户端生产依赖**仅限**以下包，新增需 ADR：

```
three, react, react-dom, zustand, zod, meshoptimizer (decoder), 
three/examples 中的 KTX2Loader / GLTFLoader / basis transcoder (随 three 版本)
```

开发依赖不受此限，但需在 PR 中说明用途。

## 4. 开发环境

- Node.js 22 LTS（`.nvmrc` 锁定）、pnpm 9、Python 3.12（`uv`）、GDAL 3.8+（通过 conda-forge 或系统包，`pipeline/README` 给出 Docker 镜像作为可复现环境）。
- 管线 Docker 镜像：`ghcr.io/<org>/chinaciv-pipeline:<git-sha>`，CI 与本地共用。
- 编辑器配置：`.editorconfig`、VS Code 推荐插件列表（ESLint、Prettier、ruff）。

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
│   ├── core-types/                  # 跨包共享：ID 类型、枚举、常量、Zod schema、生成的类型
│   │   └── src/{ids.ts, enums.ts, schema/, generated/}
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
│   └── test-utils/                  # 测试夹具：小型合成世界、确定性回放工具
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
| `core-types` | 共享类型、ID、枚举、schema | 无（仅 zod） | 任何运行时逻辑 |
| `hexgrid` | 纯数学 | `core-types` | 状态、I/O |
| `world-format` | 二进制容器、世界包/存档读写、迁移 | `core-types` | three、react、sim |
| `sim` | 游戏规则与状态演化 | `core-types`、`hexgrid`、`world-format`（只读解码） | DOM、WebGL、`Date`、`Math.random`、`performance.now`、`setTimeout`、浮点超越函数（见 08） |
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

- **强制方式**：`eslint-plugin-boundaries` 规则 + CI 中 `pnpm lint` 失败即阻断合并；`sim` 包额外配置 `no-restricted-globals` 禁用 `Date`、`Math.random`、`performance`、`setTimeout`、`fetch`。
- **构建验证**：`sim` 包必须能在纯 Node（无 DOM lib）下 `tsc --noEmit` 通过（tsconfig 中 `lib: ["ES2022"]`，不含 `DOM`）。

## 3. 命名约定

- 文件：TS 源 `PascalCase.ts`（类/组件）、`camelCase.ts`（函数模块）；Python `snake_case.py`。
- ID 类型使用品牌类型（branded type），如 `type CityId = number & { __brand: 'CityId' }`，禁止裸 `number` 混用（见 14）。
- 规则数据键：`snake_case` 字符串 ID，如 `building.industrial_park`、`tech.high_speed_rail`；运行时映射为紧凑整数索引（编译期生成，稳定排序）。

## 4. 分支与提交

- 主干开发：`main` 受保护；功能分支 `feat/<阶段>-<主题>`；每个 PR 对应一个任务包。
- 提交信息：Conventional Commits（`feat(sim): …`、`fix(renderer): …`、`data(pipeline): …`）。
- 每个 PR 必须附：任务包编号、验收项自检结果、相关命令的真实输出。

---

<!-- 文件：04-geo-grid.md -->

# 04 坐标系、投影与六边形网格

本文件定义整个项目最底层、最难返工的约定。**V1.0 冻结后，修改本文件任何参数都意味着重新生成全部数据与存档不兼容。**

## 1. 坐标参考系

| 用途 | 坐标系 | 说明 |
|---|---|---|
| 原始数据统一基准 | WGS84 经纬度（EPSG:4326） | CGCS2000 与 WGS84 差异在厘米级，对本项目（格子边长 ~12 km）可忽略，视为等同 |
| 游戏平面坐标（构建期与运行时） | **Albers 等积圆锥投影（中国常用参数）** | 见下方 PROJ 定义 |
| 渲染世界坐标 | 游戏平面坐标 ÷ 1000（单位：km），Y 轴向上为高程 | 避免 float32 精度问题，见 §5 |

游戏投影 PROJ 字符串（写入 `pipeline/config/grid.yaml` 与世界包 manifest）：

```
+proj=aea +lat_0=0 +lon_0=105 +lat_1=25 +lat_2=47 +x_0=0 +y_0=0 +ellps=GRS80 +units=m +no_defs
```

选择理由：
- **等积**：每个六边形代表相同实际面积，人口密度、耕地面积等统计可直接按格比较——这是游戏公平性与真实性的基础。
- 中国常用标准纬线 25°N / 47°N、中央经线 105°E，在中国范围内形状畸变可接受（经验上角度畸变不超过数度，**具体最大值在 P1 用 PROJ 计算并写入验收报告**）。
- **禁止**使用 Web Mercator（面积畸变，见 02 ADR-002）。
- **禁止**使用 GCJ-02 / BD-09 等加偏坐标数据源（详见 05 §4）。

## 2. 六边形网格规范

### 2.1 基本参数

| 参数 | 值 | 说明 |
|---|---|---|
| 朝向 | **尖顶（pointy-top）** | 行方向为东西，契合中国地图东西宽的版式与标注习惯 |
| 外接圆半径 R | **12,000 m**（可配置，冻结前在 P1 用基准测试确认） | 单格面积 = (3√3/2)·R² ≈ **374.1 km²** |
| 边心距 r | R·√3/2 ≈ 10,392 m | 相邻格中心距 = 2r ≈ 20.78 km |
| 坐标系 | 轴向坐标（axial）`(q, r)`；存储用 **偏移坐标「奇行右移」（odd-r）** `(col, row)` | 轴向坐标用于算法，偏移坐标用于连续数组存储 |
| 网格原点 | 投影坐标 `(originX, originY)` = 覆盖范围包围盒左下角向外取整到 10 km | 写入 manifest |
| 覆盖范围 | 中国全部陆地领土 + 领海及主要海域 + 周边 300 km 缓冲（背景区） | 南海诸岛海域全部覆盖 |

**规模估算**（P1 以实际生成结果为准）：
- 包围盒约 东西 5,400 km × 南北 5,700 km（含南海及缓冲）→ 列数 ≈ 5,400 / 20.78 ≈ 260，行数 ≈ 5,700 / 18.0 ≈ 317，**总格数 ≈ 8.2 万**。
- 其中中国陆地格 ≈ 960 万 km² / 374 km² ≈ **2.57 万**；其余为海洋、外域背景格。

### 2.2 为什么是 R = 12 km

| R | 单格面积 | 中国陆地格数 | 评价 |
|---|---|---|---|
| 8 km | 166 km² | ~5.8 万 | 东部县平均约 2–6 格，AI 与渲染成本高，回合 > 预算 |
| **12 km** | **374 km²** | **~2.6 万** | 东部小县约 1–3 格、西部大县数十格；地级市平均约 45 格（以地级行政区平均面积约 1.7 万 km² 估算）；性能可控 |
| 16 km | 665 km² | ~1.4 万 | 东部大量县级单元落不进独立格，城市辖区与真实行政区关系过粗 |

R 作为冻结前唯一保留可调的网格参数：P1 结束前根据「东部县级中心落格冲突率」（两个县级中心落在同一格的比例，目标 ≤ 15%）与性能基准选定最终值。冲突时的处理规则见 §4.3。

### 2.3 坐标公式（`packages/hexgrid` 与 `pipeline/grid` 必须逐位一致）

设 `w = √3·R`（列距），`h = 1.5·R`（行距）。

- 偏移 → 平面中心：
  ```
  x = originX + w * (col + 0.5 * (row & 1))
  y = originY + h * row
  ```
- 偏移 → 轴向：`q = col - (row - (row & 1)) / 2`，`r = row`
- 轴向 → 偏移：`col = q + (r - (r & 1)) / 2`，`row = r`
- 平面点 → 格：先转分数轴向坐标
  ```
  px = (x - originX) / R ; py = (y - originY) / R
  qf = (√3/3) * px - (1/3) * py ; rf = (2/3) * py
  ```
  再做立方坐标取整（cube rounding），**取整平局规则固定**：差值最大的分量被重算，差值相等时按 `q > r > s` 优先级。
- 邻接方向（轴向，平面 y 轴朝北）：`[(+1,0) 东, (0,+1) 东北, (-1,+1) 西北, (-1,0) 西, (0,-1) 西南, (+1,-1) 东南]`，索引 0 为正东，逆时针。推导：轴向→平面为 `x = R(√3·q + √3/2·r)`、`y = R·1.5·r`。所有遍历邻居的代码**必须**按此顺序（影响确定性）。
- 距离：`(|dq| + |dr| + |dq+dr|) / 2`。

### 2.4 格子 ID

- `TileId = row * cols + col`（uint32），即偏移坐标的行优先线性索引。
- 网格外坐标无 ID；所有 API 收到越界坐标返回 `null`，不抛异常。
- 「中国可经营格」与「背景格」通过 `tile.domain` 字段区分（见 06），不改变 ID 编号。

### 2.5 Chunk 划分（渲染与加载单位）

- Chunk = **32 × 32 格**（偏移坐标对齐），`ChunkId = chunkRow * chunkCols + chunkCol`。
- 8.2 万格 → 约 9 × 10 = 90 个 chunk；全部为海洋且无特征的 chunk 标记为 `empty`，只渲染海面。
- 每个 chunk 的世界空间包围盒（含最大高程）写入 manifest，供视锥裁剪。

## 3. 高程与垂直方向

- 高程单位：米，海平面为 0；渲染时乘以**垂直夸张系数**（默认 4.0，画质设置可调 2.0–6.0）。理由：在 ~20 km 格距下真实比例的地形几乎是平的，视觉上需要夸张；夸张不影响模拟（模拟使用真实高程与坡度）。
- 海洋深度（来自海底地形数据）只用于水体着色，不参与模拟（V1 无海军/海底开发）。

## 4. 栅格到网格的映射规则

### 4.1 连续变量（高程、气温、降水、人口密度）

- 每格取格内所有源像元的**面积加权统计**，源像元先重投影到 Albers 等积平面（重采样：连续值用双线性，分类值用众数）。
- 每格存储：`mean`；高程额外存储 `min`、`max`、`std`、`p90`（用于坡度与山地判定）。
- 人口等**计数量**用「总和」而非均值，并保证 **全国总和守恒**：映射后各省汇总与源栅格省内汇总误差 ≤ 0.5%。

### 4.2 分类变量（土地覆盖）

- 每格存储**前 3 类及其占比**（uint8 类别 + uint8 百分比），而非单一类别。理由：渲染需要混合材质，经济需要耕地/林地面积。
- 游戏地形类型 `terrainType` 由规则从占比 + 高程统计推导（见 05 §5.6 分类规则），推导规则版本化。

### 4.3 矢量点（城市、县级中心、港口、机场）

- 点落格：按 §2.3 公式计算所在格。
- **冲突规则**（多个城镇落入同一格）：行政级别高者占据该格作为「城市中心格」；级别相同按 2020 年常住人口大者；其余城镇降级为该格的「附属城镇」（数据保留、人口并入、在 UI 中可见），不做位置挪移。理由：挪移会造成地理失真，且挪移规则难以审查。
- 冲突率与降级清单输出到 `data/out/reports/settlement_conflicts.csv`，作为 P1 验收材料。

### 4.4 矢量线（河流、海岸线、行政边界）

- **渲染**使用简化后的原始矢量（保留真实形状），不使用格子边。
- **模拟**使用格化结果：
  - 河流 → 每格的 6 条边的「河流穿越边」位掩码（uint8 低 6 位）+ 格内主河流流量等级。
  - 行政区 → 每格的省/地/县归属（按格中心点落入的多边形；中心落海但格内陆地占比 ≥ 30% 时按格内面积最大的多边形）。
  - 海岸 → `isCoastal`（格内同时存在陆地与海洋，或与海洋格相邻）。
- **国界与省界的显示**：画面上显示的边界线**必须**来自合规矢量源（05 §6），格子归属边界（锯齿状）只能作为游戏叠加层使用，并在 UI 中明确为「政区格」示意，不得替代真实边界线显示。

## 5. 渲染坐标与精度

- 渲染世界坐标 = 投影坐标（m）÷ 1000 → 单位 km，再减去**场景原点**（全图中心）。全图范围约 ±2,900 km，float32 在此范围精度约 0.0002 km（0.2 m），满足需求，无需相机相对渲染（camera-relative rendering）。
- 高程在渲染坐标中同样以 km 计并乘以夸张系数。

## 6. 验收（P1 本文件相关）

1. `packages/hexgrid` 与 `pipeline/grid` 对 10 万个随机平面点的「点→格」结果 100% 一致（跨语言契约测试，16）。
2. 往返测试：任意 TileId → 中心点 → TileId 恒等，覆盖全部格。
3. 格面积：用 PROJ 计算若干格多边形在 WGS84 椭球上的真实面积，与 374.1 km² 的相对误差 ≤ 0.1%（验证等积性）。
4. 投影畸变报告：输出中国范围内最大角度畸变与最大线性比例误差，写入 `reports/projection.md`。
5. 县级中心落格冲突率报告（§4.3），用于最终确定 R。

---

<!-- 文件：05-data-pipeline.md -->

# 05 真实数据处理管线

## 1. 原则

1. **可复现**：给定 `sources.yaml`（含 URL、版本、SHA-256）与管线代码版本，输出世界包逐字节一致（浮点运算顺序固定；写出前对浮点字段量化到固定精度）。
2. **可溯源**：世界包中每个数据字段都能追溯到源数据集、版本、处理阶段（`provenance`，见 06 §5）。
3. **许可先行**：数据源的许可在 P1 核实并把许可原文存档到 `docs/data-sources/<source>/LICENSE.*` 之前，**禁止**进入发布用的世界包。开发期可用，但产物标记 `distribution: internal`。
4. **合规隔离**：国界、省界、重要岛屿等表示由独立的合规图层负责（§6）。
5. **增量**：每个阶段声明输入与输出，按「输入内容哈希 + 阶段代码哈希 + 参数哈希」缓存，未变化的阶段跳过。

## 2. 数据源清单（V1 候选）

> 「许可状态」列：**已核实**＝已在本轮检索中看到许可原文/官方说明；**待核实**＝依据既有了解，P1 必须核实原文。任何「待核实」源在核实前不得用于对外发布。

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
| S12 | 铁路开通年份 | 人工整理表（依据国铁集团、各地政府公开信息） | 线路 | 筛出 2020-01-01 时点网络 | 自建，逐行记录来源 URL |
| S13 | 机场 | OurAirports + 民航局《2020 年民航机场生产统计公报》 | 点 | 机场位置、旅客/货邮吞吐量 | OurAirports 据了解为公有领域，待核实 |
| S14 | 港口 | 交通运输部港口统计 + OSM 港口要素 | 点 | 港口位置、吞吐量 | 待核实 |
| S15 | 行政区划代码与名称 | 民政部 县级以上行政区划代码（2020 年版 + 最新版） | 列表 | 行政 ID、标准名称 | 官方公开 |
| S16 | 行政边界（合规层） | **待用户决策（D-04）**，见 §6 | 矢量 | 国界、省界显示与格子归属 | — |
| S17 | 地名（补充） | OSM `name:zh` + 民政部标准名称（以民政部为准） | 点 | 标注 | 同 S11 / S15 |

**禁用源**：任何使用 GCJ-02 / BD-09 加偏坐标的数据（高德、百度、腾讯等商业地图 POI/路网）——既有坐标偏移问题，也有服务条款限制，且自行纠偏存在合规风险。

## 3. 许可管理

### 3.1 机制

- `pipeline/config/sources.yaml` 每个源必须含字段：`id, name, url, version, sha256, license_id, license_url, license_status(verified|pending), attribution_text, share_alike(bool), commercial_ok(true|false|unknown)`。
- 阶段 `15_license_gate`：若打包目标为 `distribution: public`，任何 `license_status != verified` 或 `commercial_ok == unknown`（且项目目标为商业）的源被引用 → 构建失败。
- 世界包内生成 `ATTRIBUTION.md`，游戏内「关于 / 数据来源」页面直接渲染该文件。

### 3.2 OSM（ODbL）的处理

- ODbL 要求：公开使用衍生数据库时需以 ODbL 提供该衍生数据库，并标注「© OpenStreetMap contributors」。
- 设计：世界包中**所有 OSM 衍生内容放在独立文件**（`networks.osm.bin`、`labels.osm.bin`），与其他数据物理分离；这些文件以 ODbL 对外提供下载，游戏代码与其他数据不受传染。
- 「衍生数据库」与「产出作品（Produced Work）」边界的具体判断**需法律意见**（列入 D-05）。

## 4. 坐标与时点规则

- 所有矢量源先转换到 EPSG:4326，再在 `30_grid` 之后统一投影到游戏 Albers（04 §1）。
- 时点：`modern-2020` 场景的「现实状态」锚定 **2020-01-01**（网络、行政区划）与 **2020 年度**（人口普查、年度经济统计）。行政区划以 2020 年 1 月版本为准；与最新区划的差异在 `reports/admin_diff.md` 中列出，供用户决定是否用最新区划（D-06）。

## 5. 管线阶段

```
10_fetch ─▶ 15_license_gate ─▶ 20_normalize ─▶ 30_grid ─┬─▶ 40_raster_zonal ─┐
                                                        ├─▶ 45_hydro ────────┤
                                                        ├─▶ 50_admin ────────┼─▶ 60_classify ─▶ 65_networks ─▶ 70_economy
                                                        └─▶ 55_settlements ──┘                                   │
            ┌────────────────────────────────────────────────────────────────────────────────────────────────────┘
            ▼
       80_calibrate (Node, 调用 sim 包) ─▶ 85_render_assets ─▶ 90_validate ─▶ 95_compliance ─▶ 99_package
```

每个阶段：输入/输出写在 `data/cache/<stage>/<hash>/`；中间格式统一为 **GeoPackage（矢量）**、**Cloud-Optimized GeoTIFF（栅格）**、**Parquet（表格，按 TileId 排序）**。

### 5.1 `10_fetch`
- 按 `sources.yaml` 下载，校验 SHA-256；不匹配则失败（不自动接受新版本）。
- 大文件（DEM 瓦片）支持断点续传；下载清单写入 `data/raw/MANIFEST.json`。
- 人工录入的 CSV（S09、S12）存放于 `pipeline/data-manual/`，**入库**（文本小文件），每行带 `source_ref` 列。

### 5.2 `20_normalize`
- 裁剪到研究区 AOI（04 §2.1 覆盖范围多边形）。
- 统一 CRS、编码（UTF-8）、名称规范化（全角/半角、繁简一致性：大陆名称用简体，台湾地名按大陆标准简体名称）。
- 输出：每源一个规范化文件。

### 5.3 `30_grid`
- 根据 `grid.yaml` 生成全部格子：`tile_id, col, row, q, r, cx, cy`，以及格子多边形（GeoPackage，用于分区统计）。
- 计算陆地占比（基于高程 > 0 且土地覆盖非水体，海岸线以合规层海岸线为准）。
- 输出 `tiles_base.parquet`、`tiles_poly.gpkg`。

### 5.4 `40_raster_zonal`
- DEM → 重投影到 Albers 90 m → 每格 `elev_mean/min/max/std/p90`；坡度栅格 → `slope_mean_deg`。
- WorldCover → 每格类别直方图 → 前 3 类 + 占比；另存 `cropland_km2`、`forest_km2`、`builtup_km2`、`water_km2`。
- 气候 → `temp_mean_c`、`precip_mm`。
- 人口栅格 → 每格 `pop_raw`；再按 S07 县级常住人口**按县等比例缩放**，使每县格人口总和 = 普查值（县内空间分布用栅格，总量用普查）。
- 实现：`rasterio` + `exactextract`（若许可与安装可行）或自研「格多边形栅格化 → 按标签 bincount」方案；**二选一在 P1 定，标准是全国 8.2 万格的单变量统计 ≤ 10 分钟**。

### 5.5 `45_hydro` / `50_admin` / `55_settlements`
- **45_hydro**：河流按 Strahler 级别或年均流量筛选（保留主干与重要支流，目标渲染河段数 ≤ 6,000）；与格边求交得 `river_edges`（6 位掩码）与 `river_class`（0–4）；湖泊面积占比 ≥ 50% 的格标为湖泊格。河流几何简化（Douglas-Peucker，容差 500 m）供渲染。
- **50_admin**：按 04 §4.4 规则为每格写 `province_idx, prefecture_idx, county_idx`（索引对应行政区表）；产出行政区表（代码、名称、级别、上级、面积、格数）。
- **55_settlements**：地级及以上城市、县级行政中心点落格；冲突处理按 04 §4.3；输出 `settlements.parquet` 与冲突报告。

### 5.6 `60_classify`（游戏地形分类，规则版本 `terrain-rules@1`）

按顺序匹配，首个命中即为 `terrainType`（阈值为初始值，P2 结合渲染效果与参考地形图调参，调参只改 YAML）：

| 顺序 | 类型 | 规则 |
|---|---|---|
| 1 | `ocean` | 陆地占比 < 30% 且不属于湖泊格 |
| 2 | `lake` | 湖泊格 |
| 3 | `glacier` | 冰雪类占比 ≥ 40% |
| 4 | `high_mountain` | `elev_p90 ≥ 4500` 且 `elev_std ≥ 300` |
| 5 | `mountain` | `elev_std ≥ 250` 或 `(elev_max − elev_min) ≥ 1200` |
| 6 | `plateau` | `elev_mean ≥ 2500` 且 `elev_std < 250` |
| 7 | `hills` | `elev_std ≥ 80` |
| 8 | `desert` | 裸地占比 ≥ 60% 且 `precip_mm < 200` |
| 9 | `wetland` | 湿地+水体占比 ≥ 40% |
| 10 | `grassland` | 草地占比 ≥ 50% |
| 11 | `plain` | 其余 |

叠加属性（不互斥）：`forestPct`、`croplandPct`、`builtupPct`、`isCoastal`、`riverEdges`。资源点（煤、油气、矿产）V1 采用**省级产量统计 + 地质适宜度启发式**放置，明确标注为「游戏化近似」，不声称真实矿点位置（真实矿点数据来源与敏感性不确定，不采集）。

### 5.7 `65_networks`
- OSM 高速（`motorway`、`trunk`）、铁路（`railway=rail`，高铁按 `highspeed=yes` 与 `maxspeed ≥ 200`）提取。
- 时点筛选：与 S12 开通年份表连接，剔除 2020-01-01 之后开通的线路；无法匹配的线路列入 `reports/network_unmatched.csv` 由人工处理。
- **格化成游戏网络**：线路几何 → 依次经过的格序列（超采样后逐点落格、去重、保证相邻格连续）→ 网络边（10 §2），保存原始简化几何供渲染。
- 输出：`network_nodes.parquet`、`network_edges.parquet`、`network_geom.gpkg`。

### 5.8 `70_economy`
- 地级市 GDP（三产）、财政收支、就业 → 城市实体；县级 GDP 作为城镇实体（缺失值用夜间灯光与人口加权从地级市分配，并标 `estimated=true`）。
- 省级合计与省统计年鉴核对，误差报告输出。
- 部门映射：三次产业 → 游戏 6 部门（11 §2），映射系数表 `sector_mapping.yaml` 版本化。

### 5.9 `80_calibrate`
- 由 Node 脚本 `tools/calibrate` 加载**未校准世界包** + `sim` 包，求解使初始回合模型输出匹配统计数据的参数（城市生产率、迁移基准吸引力等，11 §6）。
- **为什么在 TS 中**：模型逻辑只能有一份实现（在 `sim`），避免 Python 复刻造成不一致。
- 输出 `calibration.json` 合入世界包。

### 5.10 `85_render_assets`
- 每 chunk 高度图（chunk 约 665 km × 576 km）：从 90 m DEM 面积平均重采样，生成两档——
  - **常驻档 129×129**（约 5.2 km/采样），全部 chunk 随首包加载，用于远景与战略视图；
  - **细节档 513×513**（约 1.3 km/采样），按视野流式加载，用于中近景。
  更细的近景起伏由着色器细节噪声补足（07 §3）。格式：R16 无符号，编码 `(elev_m + 500) * 2`（0.5 m 精度，覆盖 −500…32,267 m）。
  体积估算：细节档 513²×2 B ≈ 526 KB/chunk，陆地 chunk 约 60 个 → 约 32 MB 原始（流式，非首包）；常驻档全部约 3 MB。
- 土地覆盖 splat 贴图：每 chunk 512×512，RGBA8 × 2（8 个材质权重），KTX2 压缩。
- 河流、海岸线、边界线：简化矢量 → 预三角化的带状网格顶点（位置 + UV + 宽度），按 chunk 切分。
- 标注：地名列表（含级别、优先级、锚点）+ 用字集合 → `tools/glyphs` 生成 MSDF 图集。

## 6. 地图合规（关键）

### 6.1 法规事实（已核实来源见文末）

- 公开登载的地图需履行地图审核程序并标注审图号；**互联网地图服务的审图号应标注在地图页面左下角，有效期两年，到期需重新送审**。
- 自然资源部、工信部 2024 年通知：从事互联网地图服务的 APP 需办理地图审核与 ICP 备案，地图内容变化需重新审核；引用地图需注明来源与审图号。
- 地图上不得表示危害国家统一、主权和领土完整的内容。
- 标准地图服务（自然资源部）提供可免费下载的标准地图，直接使用需标注审图号。

> 本游戏面向公众展示中国全境地图，**发布前必须完成地图审核**。架构负责让审核所需工作可执行、可检查；审核本身由项目负责人办理。

### 6.2 架构措施

1. **合规图层独立**：`compliance_layer`（国界线、省级界线、海岸线、南海诸岛及断续线、钓鱼岛及赤尾屿、台湾岛及附属岛屿等）独立来源、独立文件 `compliance.bin`，渲染层对其使用专用、不可被画质档位隐藏的绘制路径。
2. **来源决策（D-04）**：候选方案——
   - A. 采购或申请具有合规资质的测绘单位提供的矢量数据；
   - B. 以标准地图服务的标准地图为参考，对开源边界进行人工核对修正，修正结果最终以送审版本为准；
   - C. 使用天地图等已审图服务的数据接口（需核实其服务条款是否允许缓存与再加工，**待核实**）。
   开发期使用 `dev-boundaries`（任意开源边界），产物强制标记 `distribution: internal`，客户端在画面显著位置显示「内部测试版本，地图未经审核，禁止截图外传」水印，**该水印仅在 `public` 构建且 `compliance.signed == true` 时去除**。
3. **必须要素清单** `compliance/required_features.yaml`：逐项列出必须正确表示的要素，`95_compliance` 阶段逐项检查存在性与几何有效性（几何正确性由人工对照标准地图签核，记录签核人、日期、对照的标准地图编号）。
4. **审图号**：客户端预留左下角固定位置组件 `MapApprovalBadge`，读取世界包 `compliance.approvalNumber`；`public` 构建若为空则构建失败。
5. **视图约束**：任何缩放、平移、战略视图、小地图、截图功能中，合规要素不得被裁剪掉一部分而形成错误表示；小地图必须包含完整国土（含南海诸岛，可用附图形式）。
6. **敏感信息**：不采集、不显示军事设施等涉密或敏感要素；矿产位置为游戏化近似（§5.6）。

## 7. 运行方式

```
make data SCENARIO=modern-2020            # 全量（带缓存）
ccp run 40_raster_zonal --force           # 单阶段强制重跑
ccp run all --region test-sichuan         # 小区域快速迭代（四川盆地测试区）
ccp report                                # 汇总所有报告到 data/out/reports/index.html
```

- **测试区**：`test-sichuan`（约 400×400 km，含盆地、山地、长江支流、成都/重庆）用于开发期分钟级迭代；全量构建目标 ≤ 60 分钟（8 核 / 32 GB）。

## 8. 数据质量断言（`90_validate`，任一失败即构建失败）

| # | 断言 |
|---|---|
| V1 | 每个省级行政区格数 × 374.1 km² 与官方面积误差 ≤ 3%（小面积省市如上海、天津放宽至 ≤ 10%，格化误差所致） |
| V2 | 全国人口总和与普查值误差 ≤ 0.5%；各省误差 ≤ 1% |
| V3 | 省级 GDP 合计与年鉴误差 ≤ 2% |
| V4 | 所有地级及以上城市均落入其所属省份的格内 |
| V5 | 网络连通性：所有省会城市在铁路网中相互可达；所有地级市在公路网中可达 |
| V6 | 不存在海洋格上的城市；不存在高程 > 6000 m 的城市格 |
| V7 | 每个数值字段无 NaN；枚举字段均在合法范围 |
| V8 | 所有 `estimated=true` 字段比例低于阈值（经济字段 ≤ 15%），并列出清单 |

## 9. 本文件相关验收（P1）

1. `make data` 在干净环境（Docker 镜像）中从零运行成功，两次运行输出世界包 SHA-256 一致。
2. §8 全部断言通过，报告页可浏览。
3. `sources.yaml` 中每个源均有许可存档；发布用源 `license_status` 全部为 `verified`。
4. 合规清单检查通过（开发期：存在性检查通过；发布前：人工签核完成）。

---
已核实来源：
- 人民日报《两部门规范APP登载使用地图行为》（2024-05-15）：https://paper.people.com.cn/rmrbwap/html/2024-05/15/nw.D110000renmrb_20240515_3-02.htm
- 地图审核管理规定（审图号位置与有效期）：外交部边海司法规汇编 PDF https://www.mfa.gov.cn/wjb_673085/zzjg_673183/bjhysws_674671/bhflfg/dtdmxgfl/202303/P020230313586382250479.pdf
- Copernicus GLO-30 许可：https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Data/DEM/resources/license/License-COPDEM-30.pdf

---

<!-- 文件：06-data-formats.md -->

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

---

<!-- 文件：07-rendering.md -->

# 07 渲染引擎

## 1. 目标与约束

- 《文明》级观感：倾斜俯视、风格化写实地形、清晰的格子与信息层、细腻的水体与光照。
- 预算（详见 15）：参考硬件 1080p **60 fps**（中画质），三角形 ≤ 1.5M/帧，draw call ≤ 400/帧，GPU 内存 ≤ 800 MB（中）/ 1.2 GB（高）。
- 渲染层只读 `RenderView`（14 §4），不依赖 `sim`；任何模拟数据变化通过 ViewModel 差量推送。

## 2. 帧结构

```
每帧：
 1. 相机更新（输入、惯性、边界约束）
 2. 可见集计算：视锥 × chunk 包围盒 → 可见 chunk；每 chunk 内 4×4 patch 选择 LOD
 3. 流式请求：缺失的细节高度图 / splat / 线网格 → AssetLoader Worker（优先级 = 屏幕占比）
 4. 应用 ViewModel 差量（城市、网络、叠加层数据纹理更新，节流到每帧 ≤ 2 ms）
 5. 渲染 Pass：
    a. 深度预通道（地形 + 不透明特征）           —— 仅中/高画质
    b. 不透明：地形 → 特征实例（植被、建筑、设施）→ 网络线
    c. 水体：海洋 / 湖泊 / 河流（读取深度做岸线泡沫与软边）
    d. 叠加层：格线、区域着色、数据叠加、选中高亮（深度测试 + 偏移）
    e. 合规线：国界/省界（独立 Pass，始终可见，不受迷雾与画质影响）
    f. 迷雾 / 未探索（屏幕空间合成）
    g. 标注（MSDF，屏幕空间，碰撞避让）
    h. 后处理：AO(可选) → 色调映射 → 调色 LUT → 暗角 → FXAA/SMAA
 6. UI（DOM，独立于 WebGL）
```

## 3. 地形

### 3.1 网格与 LOD

- 每 chunk（约 665×576 km）划分为 **4×4 个 patch**（每 patch 约 166×144 km）；所有 patch 共用 3 套**规则网格几何**（65²、33²、17² 顶点），在顶点着色器中采样高度纹理位移（GPU 位移，CPU 不生成地形网格）。
- LOD 选择（每 patch）：按相机到 patch 包围盒的屏幕空间误差（阈值 2 px，可配置）选择 LOD 0–3：

| LOD | 几何 | 顶点间距 | 高度源 |
|---|---|---|---|
| 0 | patch 拆为 2×2 子块，每块 65² | ≈1.3 km | height_hi（513²） |
| 1 | 65² | ≈2.6 km | height_hi |
| 2 | 33² | ≈5.2 km | height_lo（129²） |
| 3 | 17² | ≈10.4 km | height_lo |

  三角形量估算：近景视野内约 20 个 LOD0 子块（20×4×64²×2 ≈ 65.5 万三角形）+ 中远景 LOD1–3 合计约 30 万 → 地形 ≤ 100 万三角形，留 50 万给特征实例。

- 接缝处理：相邻 patch LOD 差 ≤ 1（强制约束），边缘顶点在着色器中对齐到较粗 LOD 的网格（geomorph 过渡，消除跳变）。
- 细节噪声：LOD 0 时在顶点着色器叠加基于 `elev_std` 调制的分形噪声（振幅 ≤ 100 m），避免近景过于平滑；噪声为固定种子，纯视觉，不进入模拟。

### 3.2 材质

- **8 层材质 splat**：耕地、草地、森林、灌木/荒漠草原、裸岩、沙漠、冰雪、城市建成区。权重来自 `splat/<chunk>.ktx2`（两张 RGBA8）。
- 每层材质：反照率 + 法线 + 粗糙度（打包为 2 张贴图），组成 `Texture2DArray`（8 层 × 2），分辨率 1024²，KTX2 UASTC。
- **三平面投影**仅用于坡度 > 35° 的岩石层（避免拉伸），其余层用世界空间 XZ 投影。
- 高度与坡度驱动的规则混合（雪线随纬度变化：`snowline = 5200 − 60 × (lat − 30)` 米，作为视觉近似）。
- **格子轮廓**不画在地形纹理里，由叠加层 Pass 绘制（§6），以便开关。

### 3.3 光照

- 单方向光（固定太阳方位：西北偏上，模拟传统地图光照习惯——光从左上来）+ 半球环境光 + 预计算的地形 AO（来自高度图的水平角近似，管线生成，存于 splat 第二张贴图的 A 通道）。
- 阴影：仅高画质对特征实例启用（级联阴影 2 级）；地形自阴影由预计算 AO 代替，不做实时地形阴影。

## 4. 水体

- **海洋**：全图一张大平面网格（按距相机分级的同心网格），着色器：深度着色（读取 GEBCO 深度纹理，浅水青绿到深海靛蓝）、法线贴图双层滚动、菲涅耳、海岸泡沫（读取场景深度差 + 海岸距离场纹理）。
- **湖泊**：多边形三角化网格，同一水体着色器，无潮汐动画。
- **河流**：带状网格（管线预生成，宽度按 `river_class` 1.5–8 km 视觉宽度，随缩放调整最小像素宽度 ≥ 1.5 px），着色器沿 UV 方向流动，与地形用深度偏移避免 z-fighting。远景时河流退化为线（不低于 1 px）。

## 5. 特征实例（植被、城市、设施）

- 全部使用 `InstancedMesh`，按 chunk 与 LOD 分桶；每个桶一个 draw call。
- **植被**：按格内 `forest_pct` 与气候带选择树种模型（针叶、阔叶、热带、竹林 4 类 × 2 LOD），每格最多 24 株（视觉代表，不是真实株数），位置由格 ID 种子的确定性抖动生成。
- **城市**：城市建筑群由「建筑套件」组合：按城市人口等级、地域风格（华北、江南、岭南、西南、西北、现代 CBD）选择模块；城市占据格数随人口增长（09 §4），建筑密度随 `builtupPct`。每个建成格最多 40 个建筑实例，地级市中心格额外放置地标（原创风格化，不使用真实建筑商标造型）。
- **设施**：港口、机场、车站、电厂、产业园区等使用单独模型。
- 远景（LOD 3）：城市以「灯光点 + 平面图标」代替模型。

## 6. 叠加层系统

所有叠加层由**一个统一的叠加着色器**完成，数据通过「格数据纹理」传入：

- `TileDataTexture`：尺寸 `cols × rows`（260×317），RGBA8/RG16F 多张，每格一个纹素。叠加类型切换 = 换纹理 + 换调色板，不重建几何。
- 着色器根据片元世界坐标反算所在格（与 04 §2.3 相同的公式，GLSL 实现）与到格边的距离，实现：
  - 格线（宽度随缩放，远景淡出）
  - 区域着色（政区、所有权、规划区）+ 区域边界描边（与邻格值不同处描边）
  - 数据热力（人口密度、产出、污染）——调色板为 1D LUT 纹理
  - 选中/悬停高亮（uniform 指定格 ID 集合，最多 64 个高亮格，超出用掩码纹理）
- 数据纹理更新：sim 差量中包含变化的格 ID → 仅 `texSubImage2D` 更新变化行。

## 7. 交通网络渲染

- 线路几何来自 `lines/<chunk>.ccb`（真实线形简化后）+ 玩家新建线路（按格序列生成平滑样条，Catmull-Rom 过格中心，再偏移避免与已有线路重叠）。
- 线型：高速（双线 + 中线）、铁路（枕木纹理）、高铁（亮色实线 + 光晕）、航线（大圆弧，仅在航线叠加层显示）。
- 流量动画：在流量叠加层中，线宽 ∝ log(流量)，沿线滚动的虚线速度 ∝ 平均速度；颜色表示拥堵度（容量利用率）。
- 宽度以屏幕像素为下限，保证远景可见。

## 8. 标注

- MSDF 字形图集：构建期从全部地名 + 地图内文字收集用字（预计 4,000–6,000 字），每字 **32 px** 采样单元（MSDF 在 32 px 下放大到 48 px 显示仍清晰，P2 验证；不足再升至 40 px），多页 2048²（每页约 4,000 字），KTX2 UASTC。
- 分两级加载：**boot 字集**（省、地级市名 + 数字与常用符号，约 1,000–1,500 字，约 1.5 MB）；**lazy 字集**（县级及自然地物名称，缩放到相应层级前预取）。体积估算：5,000 字 × 32² ≈ 510 万像素 ≈ 5 MB（UASTC 约 1 B/像素）。
- 标注等级：省（显示于远景）→ 地级市 → 县城镇 → 河流/山脉/湖泊（沿线排布）。
- **碰撞避让**：每帧（或相机变化时节流 100 ms）在屏幕空间网格（64 px 单元）中按优先级贪心放置，被遮挡的低优先级标注淡出（200 ms），避免闪烁使用滞回（hysteresis）。
- 字体风格：省名与地级市用思源宋体（加描边），县级与数值用思源黑体。

## 9. 迷雾与战略视图

- **未探索区（迷雾）**：V1 发展竞赛模式中，全国地理默认可见，但「未调研」格的详细数据（资源储量等）隐藏；视觉上用水墨宣纸纹理在屏幕空间合成覆盖，边缘用噪声侵蚀动画。是否启用迷雾由规则集配置（`ruleset.fog: off|data_only|full`），V1 默认 `data_only`（画面不遮挡，仅数据遮挡）。
- **战略视图**（快捷键切换）：2D 正交俯视，所有地形压平为「舆图」风格——宣纸底色、青绿山水调色的地形晕渲（由高度图实时计算 hillshade）、墨线河流、朱印式城市图标。用于宏观规划，性能开销低。

## 10. 相机

- 透视相机，俯仰角 35°–75°（随缩放自动插值：远景更俯视，近景更倾斜），FOV 35°。
- 缩放范围：视野宽度 60 km（近景）～ 6,000 km（全国）。
- 约束：相机目标点不得离开网格范围；近景地面碰撞（相机高度 ≥ 地形 + 安全距离）。
- 输入：WASD/方向键平移、滚轮缩放（以光标为锚点）、中键/右键拖拽旋转（偏航角限制 ±30°，默认正北朝上，可一键回正）。**旋转后小地图与指北针必须同步，合规要素不受影响。**

## 11. 拾取

- **解析法为主**：屏幕射线 → 与地形高度求交（在可见 patch 上用高度图做步进 + 二分，≤ 32 次采样）→ 交点平面坐标 → 04 §2.3 公式得到 TileId。
- 实体拾取（城市模型、线路）：在 TileId 基础上查询该格实体列表，再按屏幕距离选择；不使用 GPU 颜色 ID 拾取（避免额外 Pass 与读回延迟）。

## 12. 画质档位

| 项 | 低 | 中（默认） | 高 |
|---|---|---|---|
| 渲染分辨率缩放 | 0.75 | 1.0 | 1.0（DPR 上限 2） |
| 地形最高 LOD | 1 | 0 | 0 + 子网格 |
| 植被密度 | 25% | 60% | 100% |
| 阴影 | 关 | 关 | 2 级级联 |
| AO 后处理 | 关 | 关 | 开（半分辨率） |
| 水体反射 | 环境贴图 | 环境贴图 | 环境贴图 + 屏幕空间泡沫 |
| 抗锯齿 | FXAA | FXAA | SMAA |

自动画质：首次启动运行 3 秒基准（固定相机路径），按帧时间选择档位；运行中若 5 秒平均帧时间 > 20 ms，提示降档（不自动切换，避免画面跳变）。

## 13. 资源生命周期

- `AssetCache`：LRU，按 GPU 内存估算（纹理字节 + 缓冲字节）计费，上限按画质档位（低 400 MB / 中 800 MB / 高 1.2 GB）。
- 流式加载在专用 Worker 中完成 fetch + 解码（CCB 解析、KTX2 转码、meshopt 解码），主线程只做 GPU 上传，每帧上传预算 ≤ 4 MB 或 ≤ 3 ms。
- 离开视野的 chunk 资源保留 10 秒后才可被逐出（避免来回平移抖动）。

---

<!-- 文件：08-sim-core.md -->

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

---

<!-- 文件：09-city-population.md -->

# 09 城市与人口系统

## 1. 实体粒度

| 实体 | 数量（modern-2020） | 模拟角色 |
|---|---|---|
| **城市（City）** | 地级及以上行政单元，约 337 个（333 地级 + 4 直辖市，以 2020 年区划为准，管线统计） | 经济与迁移的基本单元；拥有辖区格、功能区、服务水平 |
| **城镇（Town）** | 县级行政中心，约 2,800 余个 | 人口与视觉节点；经济并入所属城市；作为交通网络节点 |
| **格（Tile）** | 中国可经营格约 2.6 万 | 人口空间分布、功能区、地形约束 |

理由：以地级为经济单元（337×337 OD 矩阵、337×6 部门矩阵）可把交通与经济计算控制在预算内；县级以下用格人口表达空间分布即可满足「看得见的变化」。直辖市在 V1 中作为单一城市实体（不拆区）。

## 2. 城市属性（CityTable 列）

| 列 | 类型 | 说明 |
|---|---|---|
| `adminIdx` | u16 | 对应地级行政区 |
| `provinceIdx` | u16 | |
| `centerTile` | u32 | |
| `popUrban` / `popRural` | f64 | 回合末量化为整数 |
| `housingCap` | f64 | 住房容量（人），由住宅区格与建筑提供 |
| `serviceEdu` / `serviceHealth` | u16 | 服务水平指数 0–1000 |
| `amenity` | i16 | 宜居度（生态、气候、文化设施），定点 ×10 |
| `satisfaction` | u16 | 民生满意度 0–1000 |
| `accessibility` | f64 | 来自交通系统（10 §6） |
| `wageIndex` | f64 | 来自经济系统（11） |
| `unemployment` | u16 | ‰ |
| `tier` | u8 | 城市等级 0–5（由人口与经济决定，影响模型与标注） |

## 3. 人口模型（每回合，08 §5 步骤 6）

### 3.1 自然增长

```
ΔP_nat(c) = P(c) × (b_p − d_p) / 4 × M_policy(p) × M_dev(c)
```
- `b_p`、`d_p`：所在省出生率、死亡率（年率，来自 2020 年省级统计，**场景数据，带来源**），随时间按场景配置的趋势表线性插值（趋势表本身需标注来源或标明为「游戏假设」）。
- `M_policy`：生育支持类政策修正（12），`M_dev`：发展水平修正（收入越高出生率越低的温和项，系数在 content 中配置）。

### 3.2 迁移（离散选择 / logit 目的地选择）

1. 城市吸引力（标量，单位无量纲）：
   ```
   A(c) = w1·ln(wageIndex) + w2·(1 − unemployment) + w3·ln(serviceEdu+serviceHealth)
        + w4·amenity − w5·ln(housingPressure) − w6·pollutionIndex + A0(c)
   ```
   `housingPressure = popUrban / housingCap`；`A0(c)` 为校准常数（11 §6），使无干预时初始回合净迁移与基准一致。
2. 迁出量：`Out(i) = P(i) × m0 × σ(A_ref − A(i))`，`m0` 为每季基础流动率，σ 为平滑 S 型函数（确定性实现）。
3. 目的地分配：
   ```
   share(i→j) = exp(λ·A(j) − β·ln(C_ij) + κ·sameProvince(i,j)) / Σ_k (…)
   ```
   `C_ij` 来自交通系统的广义出行成本（上一回合矩阵）。
4. 复杂度：337×337 ≈ 11.4 万对，单回合 < 20 ms。
5. 城乡转化：`ΔUrban(c) = popRural × u0 × f(城市就业缺口)`，城镇化率上限 95%。

### 3.3 格内分布

城市人口变化按格分配：城市人口 → 辖区格，权重 = 住宅区容量 × 交通可达性（格到城市中心的网络距离衰减）；乡村人口 → 非城市格，权重 = 耕地面积 × 原始人口分布。保证 Σ格 = 城市总量（整数量化时余数按格 ID 顺序分配，确定性）。

## 4. 城市空间（辖区与扩张）

- **辖区**：城市辖区 = 其地级行政区的全部格（`tiles.cityId`）。V1 辖区不变。
- **建成区**：`urbanLevel ≥ 2` 的格。初始值由 GHSL 建成区占比确定（`builtupPct ≥ 20%` → 城市格，阈值可调）。
- **扩张规则**：当建成区平均人口密度 > `densityMax(tier)` 时，在建成区相邻格中选择评分最高者升级：
  ```
  score = −slopePenalty − ecologyRedLine×∞ + accessBonus + riverBonus − farmlandProtection
  ```
  `ecologyRedLine`：生态区与特定地形（湿地、冰川）不可扩张；`farmlandProtection` 受政策影响。
  每城市每回合最多扩张 1 格（避免突变）。
- **功能区**：玩家在辖区格上设置 `zone`（住宅/产业/科教/生态/农业），每类有地形与前置条件（content 定义），影响住房容量、部门产能、服务、生态。

## 5. 服务与满意度

- `serviceEdu/Health = f(人均财政投入的移动平均, 科教区格数, 政策)`，带滞后（每回合向目标值靠拢 15%）。
- `satisfaction = 加权(收入增长, 就业, 住房压力, 服务, 污染, 通勤成本)`，影响迁移与计分；低于阈值触发事件（12 §4）。

## 6. 视觉映射（供渲染）

ViewModel 为每个城市提供：`tier`、建成格列表、`style`（地域建筑风格，由省份查表）、`landmark`（tier≥4）、标注优先级。人口变化 → 建成区扩张 → 建筑实例增加，满足支柱 P3「有后果」。

## 7. 验收（P3）

1. 初始回合：各省 Σ城市人口 与普查误差 ≤ 1%，全国 ≤ 0.5%（继承管线断言）。
2. 无玩家干预运行 40 回合（10 年）：全国人口变化方向与场景趋势表一致；没有城市人口单回合变化 > 3%；没有负人口或 NaN。
3. 人口守恒：迁移步骤前后全国总人口（不含自然增长）完全相等（整数）。
4. 敏感性测试：把某城市 `wageIndex` 提高 20%，10 回合后该城市净迁入为正且显著高于对照（自动化测试，阈值在测试中定义并记录）。
5. 扩张可视：上述测试中城市建成格数增加 ≥ 1，并在截图中可见（视觉测试）。

---

<!-- 文件：10-transport.md -->

# 10 交通系统

## 1. 范围

V1 模式：高速公路、普通公路（干线，聚合表示）、普速铁路、高速铁路、内河航道、海运、航空。城市内部交通不单独模拟（通过城市服务与通勤成本参数体现）。

## 2. 网络模型

### 2.1 两层表示

| 层 | 用途 | 规模估算 |
|---|---|---|
| **格路径层**（物理） | 线路经过哪些格；建设成本、地形约束、渲染 | 每条边一个格序列 |
| **路由图层**（逻辑） | 寻路与流量分配 | 收缩后的图：只保留度 ≠ 2 的交汇点、城市/城镇节点、港口、机场；度为 2 的链被收缩为单条边 |

- 管线初始网络（2020-01-01 状态）预计：原始格化节点约 2–4 万，收缩后路由图**约 3,000–6,000 节点、5,000–10,000 边**（含所有模式），P4 以实测为准并写入性能报告。
- 每个城市有一个「城市枢纽」虚拟节点，与该城市各模式站点之间以**换乘边**连接（带换乘时间惩罚，content 配置）。城镇节点连接到所属城市枢纽（接驳边，代表县乡道路）。

### 2.2 边属性

| 属性 | 说明 |
|---|---|
| `mode` | 06 §4.3 枚举 |
| `lengthKm` | 真实线形长度（初始网络）或格路径长度×曲折系数 1.15（玩家新建） |
| `designSpeed` | km/h，按模式与地形 |
| `capPax` / `capFreight` | 季度客运能力（万人次）/ 货运能力（万吨） |
| `condition` | 0–1000，维护不足会下降，影响速度 |
| `ownerProvince` | 建设者；跨省线路记录出资比例 |
| `status` | 规划 / 在建（剩余回合）/ 运营 / 停运 |

### 2.3 海运与航空

- **海运**：沿海港口间的预定义海上航路图（管线按海岸线生成的航道骨架，避开陆地，约 200–400 段），港口节点有吞吐能力。
- **航空**：机场节点两两之间按需生成虚拟航线边（仅当两端机场等级支持且距离 > 400 km），成本按平面距离；容量受机场吞吐能力约束。

## 3. 建设

### 3.1 玩家操作流程

1. 选择模式 → 在地图上点选起点城市/节点与若干途经点。
2. UI 调用 `query(RoutePreview)`：sim 用 **A\*（格路径层）** 在格间求最低建设成本路径，返回格序列、长度、总成本、工期、桥隧占比、约束冲突。
3. 玩家确认 → 提交 `BuildLink` 命令 → 扣首期款，进入在建状态，按工期分回合拨款（资金不足则工期顺延）。

### 3.2 建设成本模型

```
cost = Σ_{tile∈path} segLenKm(tile) × baseCost[mode] × terrainMult[terrain] × slopeMult(slope_mean)
       × (1 + urbanMult × builtupPct) + Σ_{river crossing} bridgeCost[mode][river_class]
```

| 地形 | terrainMult（初始值，P4 校准） |
|---|---|
| plain | 1.0 |
| grassland / desert | 1.1 |
| hills | 1.6 |
| plateau | 1.8 |
| wetland | 2.0 |
| mountain | 3.0 |
| high_mountain | 5.0 |
| glacier / ocean / lake | 不可建（跨海通道为特殊工程，V1 不提供） |

- `baseCost` 与工期按模式配置，**参照公开报道的单位里程造价量级设定，P4 校准时在 `content/rules/transport.yaml` 中逐项写明来源；无来源的值标为「游戏假设」**。
- 模式约束：高铁要求路径上 `slope_mean` 超阈值的格计为隧道（成本 × 隧道系数）；航道只能沿 `river_class ≥ 3` 的河流边；港口只能建在 `coastal` 或大河格。

## 4. 需求模型

- **客运 OD**（城市对，337×337）：重力模型
  ```
  T_ij = k_pax × P_i^0.8 × P_j^0.8 × g(incomes) / C_ij^γ
  ```
  （指数为初始值，P4 校准；幂运算使用 `sim/math` 确定性实现）
- **货运 OD**：来自上一回合经济系统的城市间贸易流（11 §4.3），按部门的「价值→吨位」系数换算。
- 广义成本 `C_ij`：`时间 × 时间价值 + 运价 + 换乘惩罚`，客运与货运分别计算（时间价值不同）。

## 5. 流量分配（每回合）

计算量控制的核心设计：**跨回合的连续平均法（MSA across turns）**，每回合只做一次全有全无分配，再与上回合流量加权平均，使系统在若干回合内逐步逼近用户均衡。

```
每回合：
 1. 用上回合的拥堵边成本 c_e 构建路由图权重
 2. 对每个有需求的起点城市（≤ 337）跑一次 Dijkstra（二叉堆，TypedArray 实现）→ 最短路树
 3. 全有全无分配：把 T_ij 加载到路径上 → 辅助流量 y_e（客、货分开）
 4. 平滑：v_e ← (1 − λ)·v_e + λ·y_e，λ = 0.5（可配置）
 5. 更新拥堵成本（BPR 函数，指数为整数 4，用乘法实现）：
    t_e = t0_e × (1 + 0.15 × (v_e / cap_e)^4)
 6. 输出：边流量、利用率、城市对广义成本矩阵 C（供迁移与经济使用）
```

- 复杂度：337 次 Dijkstra × 约 1 万边 ≈ 337 × ~1.4×10⁵ 基本操作 ≈ 5×10⁷，目标 ≤ 300 ms（参考硬件）。
- 增量优化：网络拓扑未变化且成本变化 < 5% 的回合，可复用上回合最短路树（P5 性能不足时启用，默认关闭以简化）。
- 确定性：Dijkstra 平局按节点 ID 决胜；邻接表按边 ID 排序。

## 6. 输出给其他系统

| 输出 | 消费者 |
|---|---|
| 城市对广义成本矩阵 `C_pax`、`C_freight`（Float64Array 337²） | 迁移（09）、贸易（11） |
| 城市可达性 `Access(c) = Σ_j P_j·exp(−β·C_ij)` | 经济生产率（11）、城市吸引力（09） |
| 边流量与利用率 | 渲染流量叠加层、运营收入、拥堵事件 |
| 运营收支（按边归属省） | 财政（11 §5） |

## 7. 验收（P4）

1. 初始网络连通性：继承 05 §8 V5；全国路由图无孤立城市枢纽。
2. 合理性对照：初始回合「北京—上海」「广州—深圳」「成都—重庆」等 10 组城市对的最快客运时间，与 2020 年真实最快车次时间的误差 ≤ 25%（对照表在测试中列出并注明来源）。
3. 新建线路效果：在测试场景中新建一条连接两城市的高铁，下一回合两城市间广义成本下降、沿线边流量增加、旧线路流量下降（自动化测试）。
4. 性能：交通步骤 ≤ 500 ms（31 省全 AI 场景，回合 60）。
5. 确定性：交通步骤输出跨浏览器 hash 一致。
6. RoutePreview 查询 P95 ≤ 50 ms（玩家拖拽途经点时交互流畅）。

---

<!-- 文件：11-economy.md -->

# 11 经济系统

设计目标：**可解释、可校准、计算量可控**。不是计量经济模型，而是一个能让玩家决策（交通、产业、财政）产生符合直觉后果的「空间经济玩具模型」。所有参数在 `content/rules/economy.yaml` 与 `calibration.json` 中，可审查。

## 1. 经济主体

| 主体 | 数量 | 决策者 |
|---|---|---|
| 城市（生产与消费单元） | ~337 | 规则（无自主决策） |
| 省级政府 | 31 可经营 + 不可经营区域 | 玩家 / AI |
| 中央 | 1 | 规则（转移支付、国家项目、宏观基准） |

## 2. 部门（V1 共 6 个）

| ID | 名称 | 可贸易 | 由统计口径映射 |
|---|---|---|---|
| `agri` | 农业 | 是 | 第一产业 |
| `energy` | 能源与采矿 | 是 | 第二产业中采矿业 + 电力热力燃气 |
| `mfg` | 制造业 | 是 | 第二产业中制造业 |
| `cons` | 建筑业 | 否（本地） | 第二产业中建筑业 |
| `svc` | 一般服务业 | 否（本地） | 第三产业扣除 `tech` 部分 |
| `tech` | 科技与高端服务 | 部分（贸易系数 0.5） | 第三产业中信息、金融、科研（比例由省级统计估计） |

二产、三产内部拆分系数来自省级统计年鉴（缺失时用全国结构），映射表 `sector_mapping.yaml` 逐省列出并标来源。

## 3. 生产

每城市 c、部门 s：

```
Y[c,s] = A[c,s] × L[c,s]^α_s × K[c,s]^(1−α_s) × Access(c)^θ_s × R[c,s]
```

- `A`：全要素生产率，初始由校准求得（§6），之后受发展树、政策、科教区、集聚效应 `(popUrban)^ε` 影响。
- `L`：就业（人），由劳动力供给按部门相对工资缓慢再分配（每回合调整幅度 ≤ 5%）。
- `K`：资本存量，`K' = K × (1 − δ) + I`，季度折旧率 δ 配置化。
- `Access`：交通可达性（10 §6）。
- `R`：资源/土地项——`agri` 用耕地面积与气候适宜度；`energy` 用资源点；其余为 1。
- 幂运算：`sim/math.pow(x, y)` = `exp(y × ln x)`，确定性多项式实现，相对误差 ≤ 1e-12，并有跨引擎一致性测试。

## 4. 需求与贸易

### 4.1 需求
- 中间需求：全国统一的 6×6 投入系数矩阵 `a[s', s]`（基于国家投入产出表的简化聚合，**来源与年份在 P5 核实后写入**）。
- 最终需求：居民消费（收入 × 消费率 × 部门份额）+ 政府消费 + 投资需求（资本品来自 `mfg` 与 `cons`）。

### 4.2 本地部门
`cons`、`svc`：供给 = 本地需求（产能约束下取 min，缺口记为「服务不足」，影响满意度）。

### 4.3 可贸易部门：空间交互分配（每回合闭式计算，无迭代求解）
```
城市 j 对部门 s 的需求 D[j,s] 由各供给城市 i 按份额满足：
share[i→j,s] = S[i,s] × exp(−τ_s × C_freight[i,j]) × p[i,s]^(−σ) / Σ_k (…)
Flow[i→j,s] = share[i→j,s] × D[j,s]
```
- `S[i,s]`：i 的可供给量（产出 − 本地留用最小比例）；`τ_s`：部门运输敏感度（农业、能源高，科技低）。
- 进出口：在沿海港口与边境口岸城市设「外部市场」虚拟节点，外部需求/供给为场景外生曲线（content 配置，标注为游戏假设）。
- 复杂度：337² × 4 可贸易部门 ≈ 45 万项，≤ 50 ms。
- 结果：城市间货流矩阵（→ 交通货运 OD，下一回合使用），各城市实际销售额。

### 4.4 价格与产能利用
- 每城市每部门的「出厂价格指数」`p[i,s]` 按超额供需做有界调整：`p ← p × (1 + η × clamp(超额需求率, −0.1, 0.1))`。
- 跨回合趋近，不在单回合内求均衡（与交通的跨回合 MSA 思想一致，保证计算量固定）。

## 5. 财政（省级）

```
收入 = Σ_城市 VA × 税率档位(t) + 中央转移支付 + 交通运营收入 + 土地出让（与建成区扩张挂钩，规则化）
支出 = 基础设施建设拨款 + 维护（与网络与建筑规模成正比）+ 教育 + 卫生 + 研发 + 生态 + 债务利息
余额 → 债务；债务/GDP 超过上限 → 融资成本上升，超过硬上限 → 禁止新开工
```
- 玩家可调：税率档位（5 档）、支出结构（滑块，和为 100%）、发债额度。
- 中央转移支付：规则化均等化公式（人均财力低于全国均值的省按差额比例补助），保证西部省份可玩。
- 所有货币为「万元」整数（08 §4）。

## 6. 校准（`80_calibrate`，见 05 §5.9）

| 参数 | 校准目标 | 方法 |
|---|---|---|
| `A[c,s]` | 初始回合 `Y[c,s]` = 统计数据（城市×部门产出） | 闭式反解（给定 L、K、Access、R） |
| `K[c,s]` 初值 | 资本产出比 = 全国基准（配置） | 直接设定 |
| `A0(c)`（迁移常数） | 无干预首回合各城市净迁移 ≈ 0（或 = 场景基准净迁移，若有可靠来源） | 迭代（≤ 50 次不动点） |
| `k_pax` 等交通常数 | 全国客运总量量级 = 2020 年统计（来源待 P4 核实） | 缩放 |

校准输出附带 `calibration_report.md`：每个目标的残差统计（最大、P95、中位）。

## 7. 宏观合理性护栏（自动测试）

无玩家干预（AI 关闭，全部省按默认预算）运行 40 回合：
1. 无 NaN、无负产出、无负价格。
2. 全国实际 GDP 年化增速落在场景配置的基准区间内（区间本身是游戏假设，需在 content 中标注）。
3. 任一城市单回合 GDP 变化 ≤ ±8%（无事件时）。
4. 部门结构变化平滑：任一城市部门份额单回合变化 ≤ 2 个百分点。

## 8. 验收（P5）

1. 初始回合省级 GDP 与年鉴误差 ≤ 2%，城市级 P95 误差 ≤ 5%（以校准报告为证据）。
2. §7 护栏测试全部通过。
3. 因果测试：某城市修通高铁（Access 提升）→ 8 回合内该城市 `mfg`、`tech` 产出相对对照组上升；提高某省税率档位 → 财政收入上升、迁入下降（方向性断言）。
4. 经济步骤 ≤ 300 ms；财政步骤 ≤ 20 ms。

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

## 5. AI 省级主政者

### 5.1 架构：效用 AI（Utility AI）+ 候选动作生成

```
每回合，对每个 AI 省（按省索引升序）：
 1. 观察：读取本省及全国公开指标（V1 AI 视为全知，不维护 AI 迷雾——简化且对玩家公平性影响小，文档化为已知取舍）
 2. 生成候选动作（有界）：
    - 交通：从「需求缺口表」取前 K=5 个城市对（高需求 / 高广义成本），用 RoutePreview 估算成本
    - 功能区：本省城市中评分最高的 5 个格 × 可用区类型
    - 政策：每类槽位的最优替换候选（1 个）
    - 预算：3 个预设结构的微调方向
    - 国家项目：是否投标、投多少（2–3 档）
 3. 评分：utility = Σ_k w_k(personality) × proxyGain_k(action) − costPenalty
    proxyGain 为快速近似（如线路：Δ可达性 × 沿线人口；不做模拟前瞻）
 4. 选择：在预算约束下贪心选择，平局按动作稳定 ID 决胜
 5. 输出 Command 列表（与玩家同一套命令与校验）
```

- **性格**（personality）：每省一组权重（发展/生态/民生/开放/稳健），默认由该省 2020 年产业结构推导（数据驱动），并加入少量确定性扰动避免同质化。
- **难度**：只调整 AI 的资源系数与决策质量（候选数 K、评分噪声），不给 AI 额外信息。
- 预算：全部 AI 合计 ≤ 400 ms/回合（31 省 → 约 13 ms/省）。

### 5.2 可调试性
- 每个 AI 决策记录 `AIDecisionLog`（候选、得分、选择理由），dev 构建可在 UI 中查看「AI 为什么修这条线」。

## 6. 计分与胜利（victory.yaml）

- 综合发展指数 `DI = Σ w_k × normalize(indicator_k)`，指标：GDP、人均可支配收入、城镇化率、生态质量、研发强度、民生满意度、债务健康度。
- 归一化：相对全国均值的比值（避免大省天然优势），并按初始值做基准调整——**以「进步幅度」为主**，让西部省份也有胜机。
- 结束（2050Q4）时排名；另有里程碑成就（如「八纵八横」式路网目标——仅作为风格参考，命名需原创）。

## 7. 验收（P6）

1. 31 省全 AI 运行 124 回合（完整一局）无异常，耗时与每回合预算达标。
2. AI 行为合理性：完整一局后，每个 AI 省至少修建 1 条线路、设置 ≥ 3 个功能区、切换过政策；不存在破产（债务超硬上限）的 AI 省超过 3 个。
3. 不同性格的 AI 在终局指标上存在可测差异（生态型生态指标排名中位数优于发展型）。
4. 玩家省以「全默认不操作」游玩，终局排名应处于后半（证明决策有意义）；以「测试脚本中的简单合理策略」游玩，排名应进入前 1/3。
5. 事件与政策内容通过内容审核清单。

---

<!-- 文件：13-visual-ui.md -->

# 13 视觉设计与 UI/UX

## 1. 美术方向：「新舆图」

一句话：**中国传统舆图与青绿山水的色彩与笔意，叠加现代 3D 风格化写实地形。** 原创风格，不复刻任何既有游戏的界面或美术。

### 1.1 三个缩放层次的视觉目标

| 层次 | 视野宽度 | 画面目标（可截图检查） |
|---|---|---|
| 近景 | 60–300 km | 3D 地形起伏清晰（垂直夸张 4×）；可辨认植被类型、城市建筑群风格、河流流动、线路线型；格线淡显 |
| 中景 | 300–1,500 km | 地形与城市群关系清楚；城市以建筑簇 + 标注表示；数据叠加层最可读 |
| 远景 / 全国 | 1,500–6,000 km | 全国轮廓、主要山系与水系、省级区域；城市为光点 + 图标；标注只显示省与主要城市 |
| 战略视图 | 任意 | 2D 舆图风格：宣纸底、晕渲、墨线、朱印图标（07 §9） |

### 1.2 色彩 tokens（初稿，P7 由美术评审定稿）

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

### 1.4 3D 资产规范

| 类别 | 面数上限（LOD0 / LOD1） | 贴图 | 数量（V1） |
|---|---|---|---|
| 树木 | 300 / 60 | 共享图集 512² | 4 类 × 2 变体 |
| 建筑模块 | 800 / 150 | 共享图集 2048²（按地域风格 6 张） | 6 风格 × 8 模块 |
| 地标 | 5,000 / 800 | 独立 1024² | 约 20 个（原创造型） |
| 设施（港口、机场、车站、电厂、园区） | 2,000 / 300 | 共享图集 | 约 12 个 |
| 交通工具（列车、货船，用于动画点缀） | 1,000 / 200 | 共享图集 | 约 6 个 |

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

### 2.2 核心界面清单（V1）

主菜单、新游戏（选省、难度、模式）、游戏主界面、城市详情、线路建设工具、政策面板、发展树、财政预算、国家项目、报告与图表（时间序列、省份排行）、事件弹窗、通知中心、存读档、设置（画质、音量、按键、语言、色盲模式）、数据来源与署名页、新手引导。

### 2.3 状态与数据流
- UI 只读 `ViewModelStore`（Zustand），通过 selector 订阅最小数据切片；UI 动作 → `SimClient.submit(command)`。
- UI 本地状态（面板开关、选中对象、工具模式）存于独立的 `uiStore`，不进入存档。
- 大表格（如 337 城市排行）使用虚拟滚动。

### 2.4 交互规范
- 所有破坏性或高成本操作（开工、发债、切换政策）有确认步骤，显示成本与预计影响。
- 悬停提示（tooltip）延迟 300 ms；所有数值提示可展开「构成明细」与「数据来源」。
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

## 5. 音频（V1 基础）
- 背景音乐：原创或明确授权的民乐/现代融合曲目 3–5 首；环境音（风、水、城市）随缩放层次混合；UI 音效。
- Web Audio API，音量分组（音乐、环境、音效），首次交互后才启动（浏览器自动播放策略）。

## 6. 视觉验收方法（P7）

1. **参考截图集**：固定 12 个机位（如「四川盆地近景」「长江三角洲中景」「青藏高原远景」「全国战略视图」），每个机位一张经用户确认的「目标效果图/概念图」。
2. 每次视觉相关 PR 产出同机位截图，由 Claude 审查对照（构图、色彩、可读性），用户最终确认。
3. 自动视觉回归（16 §5）保证已确认的画面不被意外破坏。
4. 可读性检查：每个机位下，省名/主要城市名无重叠、无被裁切；叠加层图例可读。

---

<!-- 文件：14-interfaces.md -->

# 14 模块接口定义

本文件中的 TypeScript 定义是**接口契约**（编码阶段放入 `packages/core-types` 或对应包的 `index.ts`）。修改需同时更新本文件与契约测试。

## 1. 基础类型（core-types）

```ts
// 品牌类型：防止不同 ID 混用
type Brand<T, B extends string> = T & { readonly __brand: B };
export type TileId     = Brand<number, 'TileId'>;      // 04 §2.4
export type ChunkId    = Brand<number, 'ChunkId'>;
export type CityId     = Brand<number, 'CityId'>;      // CityTable 行号
export type TownId     = Brand<number, 'TownId'>;
export type ProvinceId = Brand<number, 'ProvinceId'>;  // admin 表中 level=1 的序号
export type NodeId     = Brand<number, 'NodeId'>;
export type EdgeId     = Brand<number, 'EdgeId'>;
export type ProjectId  = Brand<number, 'ProjectId'>;
export type ContentKey = string;                       // 'building.industrial_park'
export type ContentIdx = Brand<number, 'ContentIdx'>;  // 编译期稳定索引

export type Turn = Brand<number, 'Turn'>;              // 0 = 2020Q1
export const turnToYearQuarter = (t: Turn) => ({ year: 2020 + Math.floor(t / 4), quarter: (t % 4) + 1 });

export type Money = Brand<number, 'Money'>;            // 万元，整数
export type Fixed4 = Brand<number, 'Fixed4'>;          // 定点 ×10,000

export enum TerrainType { Ocean, Lake, Glacier, HighMountain, Mountain, Plateau, Hills, Desert, Wetland, Grassland, Plain }
export enum Domain { Background, ChinaPlayable, ChinaNonPlayable, Sea }
export enum TransportMode { Motorway = 1, Road, Rail, HighSpeedRail, Waterway, Sea, Air }
export enum Zone { None, Residential, Industrial, Science, Ecology, Agriculture }
export enum Sector { Agri, Energy, Mfg, Cons, Svc, Tech }
```

## 2. 模拟 API（sim）

```ts
export interface NewGameOptions {
  seed: number;                       // uint32
  mode: 'contest' | 'sandbox';
  playerProvince: ProvinceId | null;  // sandbox 时为 null
  difficulty: 'easy' | 'normal' | 'hard';
  endTurn: Turn;                      // 默认 123（2050Q4）
}

export interface Sim {
  createGame(world: WorldData, content: Content, opts: NewGameOptions): GameState;
  loadGame(world: WorldData, content: Content, save: SaveData): GameState;
  validateCommand(s: GameState, c: Command): ValidationResult;
  applyCommand(s: GameState, c: Command): StateDiff;          // 先内部 validate，失败抛 CommandRejected
  endTurn(s: GameState): TurnResult;
  query<Q extends Query>(s: GameState, q: Q): QueryResultOf<Q>;
  serialize(s: GameState): SaveData;
  stateHash(s: GameState): string;                            // 16 位十六进制
}

export type ValidationResult =
  | { ok: true; cost?: Money; turns?: number }
  | { ok: false; reason: RejectReason; detail?: Record<string, number | string> };

export type RejectReason =
  | 'INSUFFICIENT_FUNDS' | 'TERRAIN_FORBIDDEN' | 'NOT_OWNER' | 'TECH_REQUIRED'
  | 'SLOT_UNAVAILABLE' | 'COOLDOWN' | 'INVALID_TARGET' | 'GAME_OVER' | 'DEBT_LIMIT';

export interface TurnResult {
  turn: Turn;                 // 结算后的新回合
  diff: StateDiff;
  events: GameEvent[];
  notifications: Notification[];
  stateHash: string;
  timingsMs: Record<string, number>;   // 仅调试用，不进入状态与哈希
}
```

## 3. 命令（Command）

```ts
interface CommandBase { type: string; issuer: ProvinceId; clientSeq: number }   // clientSeq：客户端单调序号，用于对账

export type Command =
  | CommandBase & { type: 'BuildLink'; mode: TransportMode; waypoints: NodeId[] | TileId[]; fundingShare?: Record<number, number> }
  | CommandBase & { type: 'UpgradeLink'; edge: EdgeId; upgrade: ContentKey }
  | CommandBase & { type: 'CancelOrder'; orderId: number }
  | CommandBase & { type: 'SetZone'; tile: TileId; zone: Zone }
  | CommandBase & { type: 'Construct'; tile: TileId; building: ContentKey }
  | CommandBase & { type: 'SetPolicy'; slot: number; policy: ContentKey | null }
  | CommandBase & { type: 'SetBudget'; taxBand: 1|2|3|4|5; spending: Record<'infra'|'edu'|'health'|'rnd'|'eco', Fixed4>; borrow: Money }
  | CommandBase & { type: 'Research'; tech: ContentKey }
  | CommandBase & { type: 'BidProject'; project: ProjectId; commitment: Money }
  | CommandBase & { type: 'ProposeAgreement'; to: ProvinceId; agreement: ContentKey; terms: Record<string, number> }
  | CommandBase & { type: 'RespondAgreement'; agreementId: number; accept: boolean }
  | CommandBase & { type: 'ChooseEventOption'; eventInstance: number; option: string };
```

- 所有命令必须可 JSON 序列化（回放日志）。
- `issuer` 由宿主填写：玩家命令为玩家省；AI 命令由 AI 系统生成。sim 校验 `issuer` 对目标的权限。

## 4. 渲染接口（renderer 只依赖这些）

```ts
export interface RenderView {
  grid: GridSpec;                              // 来自 manifest.grid
  staticTiles: StaticTileColumns;              // terrain、elev_*、lc_*、river_*（TypedArray 视图）
  getTileOverlay(kind: OverlayKind): OverlayData;           // 数据纹理源
  cities(): ReadonlyArray<CityVisual>;
  network(): NetworkVisual;
  selection(): SelectionState;
  subscribe(listener: (change: RenderChange) => void): Unsubscribe;
}

export interface CityVisual {
  id: CityId; centerTile: TileId; tier: 0|1|2|3|4|5; style: ArchStyle;
  builtTiles: Uint32Array; landmark: ContentKey | null; label: LabelSpec;
}

export interface NetworkVisual {
  edges: { id: EdgeId; mode: TransportMode; status: 'planned'|'building'|'active'; geomRef: GeomRef; utilization: number; flow: number }[];
}

export type OverlayKind = 'none'|'admin'|'population'|'urban'|'economy.sector'|'pollution'|'ecology'|'transport.flow'|'accessibility'|'resources'|'zones';

export interface OverlayData { kind: OverlayKind; values: Float32Array | Uint8Array; palette: PaletteId; domain: [number, number]; legend: LegendSpec }

export type RenderChange =
  | { kind: 'tiles'; overlay: OverlayKind; changed: Uint32Array }
  | { kind: 'cities'; changed: CityId[] }
  | { kind: 'network'; changed: EdgeId[] }
  | { kind: 'selection' };

export interface Renderer {
  mount(canvas: HTMLCanvasElement, view: RenderView, assets: AssetSource, opts: RenderOptions): Promise<void>;
  setOverlay(kind: OverlayKind): void;
  setQuality(q: 'low'|'medium'|'high'): void;
  setStrategicView(on: boolean): void;
  flyTo(target: { tile?: TileId; city?: CityId; bbox?: [number, number, number, number] }, ms?: number): void;
  pick(screenX: number, screenY: number): PickResult;      // { tile: TileId | null; entity?: … }
  previewRoute(tiles: Uint32Array | null, style: RoutePreviewStyle): void;
  screenshot(opts?: { hideUI?: boolean }): Promise<Blob>;  // 合规：截图必须包含审图号与水印（若适用）
  stats(): RenderStats;                                     // fps、drawCalls、triangles、gpuMemEstimate
  dispose(): void;
}
```

## 5. Worker 协议（sim-worker ↔ SimClient）

```ts
// 主线程 → Worker
type Req =
  | { id: number; op: 'init'; worldUrl: string; contentUrl: string }
  | { id: number; op: 'newGame'; opts: NewGameOptions }
  | { id: number; op: 'load'; save: ArrayBuffer }
  | { id: number; op: 'validate'; cmd: Command }
  | { id: number; op: 'apply'; cmd: Command }
  | { id: number; op: 'endTurn' }
  | { id: number; op: 'query'; q: Query }
  | { id: number; op: 'save' };

// Worker → 主线程
type Res =
  | { id: number; ok: true; result: unknown; transfer?: true }
  | { id: number; ok: false; error: { code: string; message: string } }
  | { id: 0; push: 'progress'; stage: string; pct: number }      // 回合结算进度
  | { id: 0; push: 'diff'; diff: StateDiffWire };                 // 差量（TypedArray 通过 Transferable 传输）
```

- 请求串行化：Worker 内部队列，`endTurn` 执行期间到达的 `apply` 被拒绝（`code: 'BUSY'`），UI 在结算时锁定操作。
- 大数据（存档、差量的 TypedArray）一律用 Transferable 传输，禁止 JSON 化。
- 超时：`query` 2 s、`endTurn` 30 s，超时 UI 提示并提供「导出回放文件」以便报告。

## 6. 查询（Query）

```ts
export type Query =
  | { type: 'RoutePreview'; mode: TransportMode; waypoints: TileId[] }      // → { tiles, lengthKm, cost, turns, tunnelPct, bridgeCount, violations }
  | { type: 'BuildCost'; tile: TileId; building: ContentKey }
  | { type: 'CityReport'; city: CityId }
  | { type: 'ProvinceReport'; province: ProvinceId }
  | { type: 'Ranking'; metric: string }
  | { type: 'History'; series: string[]; scope: { province?: ProvinceId; city?: CityId } }
  | { type: 'Explain'; target: string };     // 数值构成明细（例如 GDP 的部门构成、税收构成）
```

## 7. 世界包读取（world-format）

```ts
export interface WorldLoader {
  loadManifest(baseUrl: string): Promise<Manifest>;
  loadBoot(manifest: Manifest, onProgress: (p: number) => void): Promise<WorldData>;   // stage=boot 文件
  stream(path: string, signal?: AbortSignal): Promise<CcbFile>;                       // stage=stream 文件
}
export interface CcbFile { sections: Record<string, TypedArrayLike | string[] | unknown>; }
```

## 8. 管线 ↔ 客户端契约

- JSON Schema（`core-types/schema/*.schema.json`）由 Zod 定义导出，是唯一事实源；Python 端用 `datamodel-code-generator` 生成 Pydantic 模型（生成文件入库，CI 检查是否过期）。
- CCB 段名与 dtype 的约定表 `core-types/schema/ccb-sections.json`，Python 写出器与 TS 读取器都从此表读取并断言。

---

<!-- 文件：15-performance.md -->

# 15 性能预算与优化

## 1. 参考环境

| 档 | 设备 | 分辨率 | 目标 |
|---|---|---|---|
| 参考中档 A | Apple M1 8 GB，Chrome 稳定版 | 1920×1080 | 中画质 60 fps |
| 参考中档 B | Intel Iris Xe（i5-1135G7 级）16 GB，Chrome | 1920×1080 | 中画质 ≥ 45 fps，低画质 60 fps |
| 参考独显 | GTX 1650 级 | 2560×1440 | 高画质 60 fps |
| 最低 | WebGL2，4 GB 内存 | 1280×720 | 低画质 ≥ 30 fps |

性能验收在**真实设备**上运行 `tools/bench`（CI 中的无 GPU 环境仅做回归趋势监控，不作为验收依据）。

## 2. 预算表

### 2.1 渲染（每帧，中画质，参考中档 A）

| 项 | 预算 |
|---|---|
| 帧时间 | ≤ 16.6 ms（P95 ≤ 20 ms） |
| 主线程 JS（不含 GPU 等待） | ≤ 6 ms |
| Draw calls | ≤ 400 |
| 三角形 | ≤ 1.5M（地形 ≤ 1.0M） |
| 纹理上传 | ≤ 4 MB 或 3 ms / 帧 |
| GPU 内存估算 | ≤ 800 MB（中）/ 1.2 GB（高） |
| 标注碰撞计算 | ≤ 1.5 ms（节流执行） |

### 2.2 模拟（每回合，31 省全 AI，回合 60 附近，参考中档 A）

| 步骤 | 预算 |
|---|---|
| AI | ≤ 400 ms |
| 交通 | ≤ 500 ms |
| 经济 + 财政 | ≤ 320 ms |
| 人口 + 城市 | ≤ 150 ms |
| 其他（事件、项目、计分、量化、哈希、差量） | ≤ 130 ms |
| **合计** | **≤ 1,500 ms** |
| Worker 内存 | ≤ 300 MB |

### 2.3 加载

| 项 | 预算 |
|---|---|
| 首包（HTML+JS+CSS+首屏字体），Brotli | ≤ 1.5 MB JS + ≤ 1.5 MB 字体 |
| 进入游戏前必需数据（boot：tiles、admin、settlements、networks、economy、height_lo、content、标注、glyphs） | ≤ 15 MB（Brotli 后） |
| 50 Mbps 网络冷启动到可操作 | ≤ 10 s |
| 二次访问（HTTP 缓存 + Service Worker） | ≤ 3 s |
| 存档读取 | ≤ 2 s |

## 3. 优化策略（已纳入设计）

| 领域 | 策略 | 所在文档 |
|---|---|---|
| 地形 | GPU 位移 + 共享网格 + patch LOD；不在 CPU 生成网格 | 07 §3 |
| 实例 | `InstancedMesh` 按 chunk×LOD 分桶 | 07 §5 |
| 叠加层 | 单着色器 + 格数据纹理，局部更新 | 07 §6 |
| 标注 | 节流碰撞、屏幕网格空间索引 | 07 §8 |
| 数据 | SoA TypedArray、零拷贝 CCB、Transferable | 06 §2、08 §3 |
| 交通 | 收缩图 + 跨回合 MSA，每回合仅一次全有全无 | 10 §5 |
| 经济 | 闭式空间交互分配，跨回合价格调整 | 11 §4 |
| AI | 有界候选 + 代理评分，无前瞻模拟 | 12 §5 |
| 加载 | boot/stream/lazy 分级、Worker 解码、KTX2 | 06 §1、07 §13 |
| 回合 | Worker 中执行，UI 显示分步进度，不阻塞渲染 | 14 §5 |

## 4. 测量与监控

- `renderer.stats()` + dev HUD（fps、帧时间分布、draw calls、三角形、GPU 内存估算、流式队列长度）。
- `TurnResult.timingsMs` 记录每步骤耗时；dev 构建可导出每回合耗时 CSV。
- `tools/bench`：Playwright 驱动固定相机路径（8 段，覆盖近/中/远景与战略视图），输出 P50/P95 帧时间 JSON；固定回放跑 20 回合输出每步骤耗时。
- CI：每次合并到 `main` 运行 bench（软件渲染环境）记录趋势，**相对基线退化 > 20%** 时在 PR 上告警（不阻断）；阶段验收在参考设备上人工运行并提交报告。

## 5. 退化处理

- 渲染超预算：依次降低植被密度 → 地形最高 LOD → 分辨率缩放（自动画质建议，07 §12）。
- 模拟超预算：先剖析定位，按 ADR-003 退路允许单热点函数迁 WASM；或启用 10 §5 的最短路树复用。
- 内存超预算：降低细节高度图驻留数量（LRU 上限）、splat 分辨率降为 256²。

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
| 确定性回放 | Vitest + Playwright | 跨引擎 stateHash 一致 | 每次提交（Node）/ 每晚（三浏览器） |
| E2E | Playwright | 关键用户流程 | 每次合并 |
| 视觉回归 | Playwright 截图 | 已确认画面不被破坏 | 每次合并 |
| 性能 | tools/bench | 15 预算 | 每次合并（趋势）/ 阶段验收（参考设备） |

## 2. 关键测试用例清单

### 2.1 网格与数据
- `hexgrid`：10 万随机点跨语言一致；全格往返；邻居顺序；距离对称性与三角不等式。
- `world-format`：每种 dtype 的往返；CRC 损坏检测；未知段忽略（向前兼容）；版本迁移链。
- 管线：小型合成栅格（已知答案）上的分区统计；人口县级缩放守恒；冲突规则。

### 2.2 模拟
- 守恒：迁移前后人口总量相等；财政收支 = 余额变化；货流总量 = 供给满足量。
- 护栏：11 §7、09 §7 中的全部断言。
- 因果方向：10 §7.3、11 §8.3、09 §7.4。
- 命令：每个命令的 validate 拒绝路径各至少一个用例；`apply` 后状态变化断言。
- AI：完整一局（124 回合）无异常、无超时（每晚）。

### 2.3 确定性回放
- `tests/replays/*.ccreplay`：至少 5 个（短局、长局、含事件选择、含存读档、含 AI 全开）。
- 期望 `stateHash` 序列文件入库；`simVersion` 变化时需显式重新生成并在 PR 中说明原因（`pnpm replays:regen` 生成 diff 报告）。

## 3. 测试夹具

- `test-utils/synthetic-world`：程序生成的 64×64 格小世界（含山地、河流、2 个省、6 个城市、简单网络），用于快速单测，不依赖真实数据。
- `test-sichuan` 区域世界包：真实数据子集，用于集成测试（CI 缓存）。
- 全国世界包：仅每晚与阶段验收使用。

## 4. E2E 关键流程

1. 冷启动 → 主菜单 → 新游戏（选四川）→ 地图加载完成（断言：画布非空、审图号/水印组件可见）。
2. 选中城市 → 打开详情 → 数值与 `CityReport` 查询一致。
3. 建设高铁：点选两城市 → 预览出现 → 确认 → 财政扣款 → 结束回合 → 工程进度更新。
4. 切换 5 种叠加层，每种截图非空且图例出现。
5. 存档 → 刷新页面 → 读档 → `stateHash` 与存档前一致。
6. 结束 5 回合，通知与报表更新。

## 5. 视觉回归

- 固定机位（13 §6 的 12 个机位）+ 固定种子 + 固定回合状态 + 固定画质 + 关闭动画与时间相关着色器（`renderer` 提供 `deterministicTime` 选项）。
- 比较：像素差异（`pixelmatch`，阈值 0.1）+ 差异像素比例 ≤ 0.5% 视为通过；超阈值输出差异图，由审查者判断是否更新基线。
- 运行环境固定为 CI 的 Chromium + SwiftShader（软件渲染保证跨机器一致）；参考设备截图仅用于美术评审，不做像素比对。

## 6. 合规测试（自动 + 人工）

- 自动：`95_compliance` 存在性检查；客户端测试断言 `MapApprovalBadge` 在所有屏幕尺寸、所有面板组合下可见且位于左下角；`internal` 构建水印存在；截图 API 输出包含审图号/水印。
- 人工：发布前按 `required_features.yaml` 对照标准地图逐项签核（记录签核人、日期、对照图号）。

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

## 1. 统一命令（Makefile / package.json scripts）

| 命令 | 作用 |
|---|---|
| `make setup` | 安装 Node/pnpm 依赖、Python 环境（uv）、检查 GDAL |
| `make data SCENARIO=modern-2020 [REGION=test-sichuan]` | 运行数据管线，输出 `data/out/world/...` |
| `make content` | 编译规则数据 → `content.json` |
| `make assets` | 美术资源导出与 KTX2/meshopt 处理 |
| `make dev` | 启动 Vite 开发服务器（读取本地世界包） |
| `make test` / `make test-all` | 快速测试 / 含 E2E、视觉、长回放 |
| `make bench` | 性能基准 |
| `make build DIST=internal|public` | 生产构建；`public` 触发许可门禁与合规门禁 |

## 2. CI 工作流（GitHub Actions）

| 工作流 | 触发 | 内容 |
|---|---|---|
| `ci.yml` | PR、push | lint → typecheck → 单元/属性/契约 → 短集成 → Node 回放 → 构建（internal）|
| `e2e.yml` | PR 合并前（required） | Playwright E2E + 视觉回归（使用缓存的 test-sichuan 世界包）|
| `pipeline.yml` | `pipeline/**` 变化、手动 | 管线 Docker 镜像构建；test-sichuan 区域全流程 + pytest |
| `nightly.yml` | 每晚 | 全国世界包构建（缓存原始数据）、三浏览器回放、完整一局 AI、bench 趋势 |
| `release.yml` | 打 tag `v*` | public 构建（门禁）、上传 CDN、生成发布说明 |

- 原始数据缓存：放在对象存储（按 sha256 寻址），CI 通过只读凭证拉取，不放 GitHub Actions cache（体积大）。
- 世界包产物：上传对象存储 `world/<scenario>/<packageHash>/`，CI 输出 hash 供客户端构建引用。

## 3. 客户端构建产物

```
dist/
├── index.html                      # 不缓存（no-cache）
├── assets/*.[hash].js|css|woff2    # 永久缓存（immutable，1 年）
├── sw.js                           # Service Worker：缓存应用壳与已访问的世界包文件
└── build-info.json                 # { appVersion, gitSha, worldPackageHash, contentHash, distribution }
```

- 世界包与应用分开部署；`build-info.json` 指定所用世界包 hash，CDN 路径不可变，回滚 = 切换 `index.html` 指向的旧构建。

## 4. 部署与托管（需用户决策 D-07）

| 方案 | 适用 | 要点 |
|---|---|---|
| A. 境内托管（境内云对象存储 + CDN） | 面向中国大陆用户正式发布 | 需 ICP 备案；公开地图需审图号（05 §6）；访问速度好 |
| B. 境外托管（如 Cloudflare Pages / R2） | 开发期内测、海外展示 | 无需备案；大陆访问速度与可用性不稳定；**仍不改变地图内容合规要求的适用判断，需法律意见** |
| C. 双轨 | 开发期 B，正式发布 A | 推荐；构建产物与托管解耦，同一产物可部署到两处 |

- 开发期内测环境：`internal` 构建 + 访问控制（Cloudflare Access 或基础认证），防止未审图版本公开传播。
- HTTP 头：`Cross-Origin-Opener-Policy: same-origin` 与 `Cross-Origin-Embedder-Policy: require-corp` **V1 不强制**（V1 不使用 SharedArrayBuffer）；保留在配置中以便将来启用多线程。
- 压缩：CDN 开启 Brotli，`.ccb`、`.json`、`.js` 均压缩；`.ktx2` 已压缩不再处理。

## 5. 版本与发布

- 应用版本：SemVer `MAJOR.MINOR.PATCH`；`MAJOR` 变化表示存档不兼容（提供迁移则不升 MAJOR）。
- 发布检查表（`release.yml` 前人工确认）：
  1. 所有阶段验收项通过的报告链接
  2. 许可门禁通过（全部 `verified`）
  3. 合规签核完成，审图号已写入世界包
  4. 视觉评审通过
  5. 参考设备性能报告
- 发布后：错误上报（V1 仅本地日志 + 用户主动导出回放；**不引入第三方遥测**，避免隐私与跨境数据问题，如需遥测另行决策）。

## 6. 环境变量与密钥

- 客户端不含任何密钥。
- CI 密钥：对象存储写凭证（仅 `pipeline.yml`、`release.yml` 可用，受环境保护规则限制）。

---

<!-- 文件：18-roadmap-acceptance.md -->

# 18 开发路线与逐阶段验收

## 1. 阶段总览与依赖

```
P0 架构冻结
 │
 ├─▶ P1 工程基座 + 数据管线 MVP ──┬─▶ P2 渲染 MVP ─────────────┐
 │                                │                            │
 │                                └─▶ P3 模拟内核 + 人口城市 ──┼─▶ P4 交通 ─▶ P5 经济 ─▶ P6 策略/AI/可玩闭环 ─┐
 │                                                             │                                         │
 │                                                             └──────────── P7 视觉打磨（与 P4–P6 部分并行）◀┘
 │                                                                                                          │
 └──────────────────────────────────────────────────────────────────────────────────────────▶ P8 加固与发布候选
```

| 阶段 | 依赖 | 可并行 | 主要产出 |
|---|---|---|---|
| P0 | — | — | V1.0 冻结架构 |
| P1 | P0 | 管线与工程基座内部并行 | Monorepo、CI、hexgrid、world-format、管线（测试区 → 全国）、世界包 v1 |
| P2 | P1（世界包、hexgrid、world-format） | 与 P3 并行 | 可浏览的全国 3D 地图 |
| P3 | P1 | 与 P2 并行 | 确定性内核、回合管线、人口/城市、存档、Worker |
| P4 | P3（+ P2 用于可视化） | 与 P7 部分并行 | 交通网络、建设、流量分配 |
| P5 | P4 | — | 经济、财政、校准 |
| P6 | P5 | — | 政策、发展树、项目、事件、AI、计分、完整 UI 闭环 |
| P7 | P2 起即可启动美术资产；整合在 P6 后 | 资产制作并行 | 视觉定稿、战略视图、音频 |
| P8 | P6、P7 | — | 性能/兼容性/合规/内容审核、发布候选 |

关键路径：**P1 → P3 → P4 → P5 → P6 → P8**。P2/P7 不在关键路径但决定「好看」，必须按期验收。

## 2. 每阶段的任务包拆分原则

- 一个任务包 = 一个可独立验收的增量（通常 1 个 PR），规模以「GPT 一轮可完成并自测」为准：新增/修改代码约 300–1,500 行。
- 每个任务包必须引用本文件中的验收编号（如 `P1-A3`）。
- 阶段内任务包顺序遵循依赖；阶段验收 = 该阶段全部验收项通过 + 阶段演示（截图/录屏/报告）。

## 3. 逐阶段验收标准

### P0 架构冻结
| 编号 | 验收项 | 证据 |
|---|---|---|
| P0-A1 | GPT-6.2 审查意见全部有处理结论（采纳/部分采纳/不采纳+理由） | 审查回复表 |
| P0-A2 | 19 中「待用户决策」中标为「阻断 P1」的项全部有决定 | 决策记录 |
| P0-A3 | 文档版本号改为 V1.0，并打 tag `arch-v1.0` | Git tag |

### P1 工程基座 + 数据管线 MVP
| 编号 | 验收项 | 检查方法 | 通过条件 |
|---|---|---|---|
| P1-A1 | Monorepo 结构符合 03 | 目录对照 + `pnpm -r build` | 全部包构建成功 |
| P1-A2 | 依赖边界与确定性 lint 规则生效 | 故意违规的测试文件 | lint 报错（规则自测） |
| P1-A3 | CI `ci.yml` 运行 | PR 触发 | 全绿 |
| P1-A4 | hexgrid 跨语言一致 | 契约测试 | 10 万点 100% 一致；全格往返 |
| P1-A5 | CCB 容器读写契约 | Python 写 → TS 读 | 所有 dtype 段 hash 一致 |
| P1-A6 | 测试区世界包 | `make data REGION=test-sichuan` | ≤ 10 分钟，断言全过 |
| P1-A7 | 全国世界包 | `make data` | ≤ 60 分钟（8 核/32 GB）；05 §8 断言 V1–V8 全过 |
| P1-A8 | 可复现 | 干净环境运行两次 | `packageHash` 一致 |
| P1-A9 | 网格参数定稿 | 04 §6 报告 | 冲突率、畸变、面积误差报告提交；R 值写入 ADR |
| P1-A10 | 数据许可核实 | `sources.yaml` + 许可存档 | 所有源 `license_status` 明确；发布用源均 `verified` 或已提出替代 |
| P1-A11 | 数据检视器（dev） | 浏览器打开 | 以 2D 色块显示任一 tiles 列，悬停显示格属性（用于人工核对数据） |

### P2 渲染 MVP
| 编号 | 验收项 | 通过条件 |
|---|---|---|
| P2-A1 | 全国地形渲染 | 全国可平移缩放，chunk 流式加载无空洞、无接缝裂缝（12 机位截图人工检查） |
| P2-A2 | 水体 | 海洋、湖泊、主要河流显示正确，河流与地形无 z-fighting |
| P2-A3 | 格叠加层 | 格线、政区着色、一个数据热力层可切换；悬停高亮 |
| P2-A4 | 拾取精度 | 1,000 个随机屏幕点：拾取格 = 解析真值格，正确率 100%（地形遮挡处以射线首交点为准） |
| P2-A5 | 标注 | 省名、地级市名显示，无重叠；缩放时无闪烁（录屏检查） |
| P2-A6 | 合规显示 | 国界/省界来自合规层（开发期为 dev 层），所有缩放级别可见；左下角审图号/水印组件可见 |
| P2-A7 | 性能 | 参考中档 A：bench 路径 P95 帧时间 ≤ 20 ms；draw calls ≤ 400；GPU 内存估算 ≤ 800 MB |
| P2-A8 | 加载 | 50 Mbps 冷启动到可交互 ≤ 10 s |
| P2-A9 | 视觉初审 | 12 机位截图提交，用户确认「方向正确」（非最终美术） |

### P3 模拟内核 + 人口城市
| 编号 | 验收项 | 通过条件 |
|---|---|---|
| P3-A1 | 确定性 | 08 §10 全部通过（三浏览器 + Node） |
| P3-A2 | Worker 协议 | 14 §5 全部操作可用；结算时 UI 锁定；Transferable 传输（代码审查 + 测试） |
| P3-A3 | 存档 | 存档/读档 `stateHash` 一致；IndexedDB 3 个自动槽轮换；导出/导入文件 |
| P3-A4 | 人口与城市 | 09 §7 全部通过 |
| P3-A5 | 差量 → 渲染 | 人口变化在叠加层中局部更新（无整纹理重传，性能面板验证） |
| P3-A6 | 回合耗时 | 人口+城市步骤 ≤ 150 ms |

### P4 交通
| 编号 | 验收项 | 通过条件 |
|---|---|---|
| P4-A1 | 初始网络 | 2020-01-01 网络渲染正确；未匹配线路报告已人工处理 |
| P4-A2 | 建设流程 | RoutePreview → BuildLink → 在建 → 完工 全流程（E2E） |
| P4-A3 | 交通模型 | 10 §7 全部通过 |
| P4-A4 | 流量叠加层 | 线宽/颜色反映流量与拥堵，图例正确 |

### P5 经济
| 编号 | 验收项 | 通过条件 |
|---|---|---|
| P5-A1 | 校准 | 11 §8.1：省级 ≤ 2%，城市 P95 ≤ 5%（校准报告） |
| P5-A2 | 护栏 | 11 §7 全部通过 |
| P5-A3 | 因果 | 11 §8.3 全部通过 |
| P5-A4 | 可解释 | `Explain` 查询可给出 GDP、财政收入的构成明细，UI 可展示 |
| P5-A5 | 性能 | 经济+财政 ≤ 320 ms；回合合计（当时已实现系统）≤ 1,100 ms |

### P6 策略 / AI / 可玩闭环
| 编号 | 验收项 | 通过条件 |
|---|---|---|
| P6-A1 | 内容 | 政策 ≥ 30、发展树 ≥ 40 节点、事件 ≥ 30、国家项目类型 ≥ 6，均通过编译器校验 |
| P6-A2 | AI | 12 §7 第 1–3 条通过 |
| P6-A3 | 平衡性 | 12 §7 第 4 条通过 |
| P6-A4 | 完整一局 | 人工游玩 1 局（124 回合）无阻断 bug；全部 13 §2.2 界面可用 |
| P6-A5 | 新手引导 | 新用户（未看文档）在引导下 10 分钟内完成首条线路建设与首次回合结算（用户亲测） |
| P6-A6 | 性能 | 回合合计 ≤ 1,500 ms（15 §2.2） |

### P7 视觉打磨
| 编号 | 验收项 | 通过条件 |
|---|---|---|
| P7-A1 | 12 机位终版 | 每个机位截图经用户确认达到「可作宣传图」标准 |
| P7-A2 | 资产 | 13 §1.4 数量与规范达标；许可登记 100% |
| P7-A3 | 战略视图 | 舆图风格完成，切换 ≤ 300 ms 动画 |
| P7-A4 | 音频 | 音乐/环境/音效分组可调 |
| P7-A5 | 性能不退化 | P2-A7 指标仍满足 |

### P8 加固与发布候选
| 编号 | 验收项 | 通过条件 |
|---|---|---|
| P8-A1 | 兼容性 | 01 §6 浏览器矩阵 E2E 通过 |
| P8-A2 | 性能 | 15 全部预算在参考设备达标（报告） |
| P8-A3 | 稳定性 | 连续 3 局完整游玩无崩溃；内存无持续增长（124 回合后 Worker 内存 ≤ 300 MB） |
| P8-A4 | 合规 | 合规签核完成；审图号写入；public 构建门禁通过 |
| P8-A5 | 许可 | ATTRIBUTION 完整；ODbL 数据下载页可用 |
| P8-A6 | 内容审核 | 16 §7 清单通过 |

## 4. 双模型协作流程（每个任务包）

```
Claude：拆任务包（目标、输入、范围、验收编号、自检要求） → 用户转发 → GPT：实现 + 自测 + 五段回传
→ 用户转发 → Claude：逐条验收（通过/不通过/未验证 + 证据） → 修改指令或进入下一包
```

- 任何对 V1.0 架构的偏离：GPT 在「不确定的地方」中提出 → Claude 评估 → 必要时写 ADR → 用户确认。
- 同一问题两轮未修好：升级处理（换思路 / 换模型 / Claude 接手），由用户决定。

---

<!-- 文件：19-risks-decisions.md -->

# 19 风险、待决策项与 ADR 索引

## 1. 待用户决策（D 项）

| 编号 | 决策 | 默认方案（未决定时按此推进） | 影响 | 是否阻断 P1 |
|---|---|---|---|---|
| D-01 | USACiv 的确切含义与参照玩法 | 按「真实地理 + 文明式回合策略地图」理解（01 §1） | 玩法核心，若差异大需重写 01、09–12 | **是**（至少确认方向） |
| D-02 | 是否需要军事/征服玩法 | 现代场景不做；历史场景后续单独评估 | 规则集、AI、内容审核 | 否 |
| D-03 | 台湾省、香港、澳门在 V1 中的处理 | 地图完整正确表示；作为不可选区域，参与全国市场计算 | 数据管线、经济、UI 文案 | 否（P5 前定） |
| D-04 | 合规边界数据来源 | 开发期 dev 边界 + 内部水印；正式来源 P8 前确定（05 §6.2 方案 A/B/C） | 发布可行性 | 否（但需尽早启动） |
| D-05 | OSM（ODbL）衍生数据的法律处理 | 按 05 §3.2 物理分离 + ODbL 提供 | 发布许可 | 否（P8 前） |
| D-06 | 行政区划用 2020 年版还是最新版 | 2020 年版（与普查、年鉴数据时点一致） | 数据一致性 | 否（P1 内定） |
| D-07 | 托管方案 | 开发期境外 + 访问控制；正式发布境内（17 §4 方案 C） | 部署、备案 | 否 |
| D-08 | 商业化意图（免费 / 付费 / 开源） | 按「可能商业化」从严处理许可 | 数据源可用范围 | **是**（影响许可核实标准） |
| D-09 | 开始年份与回合长度 | 2020Q1 起、1 回合 = 1 季度、124 回合 | 数据时点、节奏 | 否（P3 前） |
| D-10 | 玩家身份（单省主政 vs 全国） | 单省主政为主模式 + 全国沙盒 | 玩法、AI | 否（P6 前，但影响 P3 状态设计，建议 P1 内确认） |

## 2. 风险登记

| 编号 | 风险 | 可能性 | 影响 | 缓解措施 | 触发信号 |
|---|---|---|---|---|---|
| R-01 | 地图审核无法通过或周期长 | 中 | 高（无法在境内公开发布） | 合规层独立；尽早确定 D-04；预留审核周期；开发期严格内部访问 | P6 结束时 D-04 仍未定 |
| R-02 | 数据许可不允许商业使用或再分发 | 中 | 高 | P1 许可门禁；每个关键源准备备选源（05 §2 备选列） | 核实结果为 `commercial_ok=false` |
| R-03 | 统计数据缺失（县级 GDP、部门拆分） | 高 | 中 | 估算并标 `estimated`；经济以地级为单元降低对县级数据依赖 | V8 断言超阈值 |
| R-04 | 浏览器跨引擎确定性破坏 | 低 | 高（存档/回放失效） | D1–D8 规则 + lint + 三浏览器夜间回放 | 夜间回放哈希不一致 |
| R-05 | 渲染性能在集显不达标 | 中 | 中 | 画质档位；GPU 位移地形；预算在 P2 即验收 | P2-A7 不通过 |
| R-06 | 经济模型产生不合理动态（爆炸、塌缩） | 中 | 中 | 有界调整、跨回合平滑、护栏测试 | 护栏测试失败 |
| R-07 | 美术资产产能不足 | 高 | 中（「文明级」观感打折） | 套件化建筑、程序化放置；P2 起并行制作；优先保证地形与水体质量 | P7 资产完成度 < 70% |
| R-08 | 双模型协作中接口漂移 | 中 | 中 | 本文档 14 为契约；契约测试；任务包引用验收编号 | 同类返工 ≥ 2 次 |
| R-09 | 内容敏感性（事件、地名、表述） | 中 | 高 | 内容红线 + 审核清单 + 地名以民政部为准 | 审核清单出现不通过项 |
| R-10 | three.js 大版本升级破坏着色器 | 中 | 低 | 锁定版本；着色器集中于 `renderer/gpu`；升级走视觉回归 | — |
| R-11 | 网格尺度（R=12 km）不合适 | 中 | 高（冻结后不可改） | P1 报告后才最终定 R（P1-A9）；冻结前唯一保留的可调参数 | 冲突率 > 15% 或性能不达标 |

## 3. ADR 索引（V0.1 中已作出的决策）

| ADR | 标题 | 文档位置 |
|---|---|---|
| ADR-001 | Web 优先，否决 Unity/Godot | 02 §2.1 |
| ADR-002 | three.js 自研渲染，否决 MapLibre/deck.gl/Babylon/裸 WebGL；WebGPU 推迟 | 02 §2.2 |
| ADR-003 | 模拟内核用 TypeScript，WASM 仅作热点退路 | 02 §2.3 |
| ADR-004 | 表驱动状态，不引入通用 ECS | 02 §2.4 |
| ADR-005 | React DOM UI + GPU 地图标注 | 02 §2.5 |
| ADR-006 | 数据管线用 Python，契约为世界包格式 | 02 §2.6 |
| ADR-007 | Albers 等积投影 + 尖顶六边形 + R=12 km（R 待 P1 定稿） | 04 |
| ADR-008 | 校准在 TS（调用 sim）中完成，避免模型双实现 | 05 §5.9 |
| ADR-009 | 自定义 CCB 二进制容器，而非 FlatBuffers/Protobuf | 06 §2 |
| ADR-010 | 跨回合 MSA 交通分配 | 10 §5 |
| ADR-011 | 空间交互闭式贸易分配 + 跨回合价格调整 | 11 §4 |
| ADR-012 | 效用 AI + 有界候选，无前瞻 | 12 §5 |
| ADR-013 | 现代场景不含地区间军事冲突 | 01 §3 |
| ADR-014 | 规则数据使用受限声明式效果语言，不允许脚本 | 06 §6 |

ADR-009 理由补充：数据主体是大块同构数值数组，自定义「段表 + 原始 TypedArray」容器可实现零拷贝且实现量很小（读写器各约 200 行）；FlatBuffers 擅长复杂嵌套结构，此处收益不明显且增加代码生成链；Protobuf 需要解码拷贝，不适合大数组。

## 4. 明确推迟到 V1 之后的事项

多人联机、历史场景、模组编辑器、移动端触控、WebGPU 渲染后端、城市内部交通、海军/海洋开发、遥测与在线排行榜、桌面封装（Tauri）。
