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
