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
