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
