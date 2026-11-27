# P1a-02 验证记录

日期：2026-11-27。环境：Cloud Debian Linux x86-64、Node 22.23.5、pnpm 9.15.9、Chromium 158.0.8127.36（Playwright 预装，`CHINACIV_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`），WebGL2 走 ANGLE/SwiftShader 软件渲染。

| 检查 | 命令 | 结果 | 证据 |
| --- | --- | --- | --- |
| 类型检查与生产构建 | `corepack pnpm build` | 通过（仅有 chunk > 500 kB 提示） | [build.log](build.log) |
| 单元测试 | `corepack pnpm test` | 15/15 通过（原 10 项 + 适配层 5 项） | [unit-test.log](unit-test.log) |
| 浏览器测试 | `corepack pnpm exec playwright test --trace off` | 4/4 通过 | [browser-test.log](browser-test.log) |
| 基准 | `corepack pnpm preview` 后运行 `node tools/bench.mjs` | 见下文 | [cloud-benchmark.json](cloud-benchmark.json) · [benchmark.log](benchmark.log) |

改动前的基线：同一容器中，P1a-01 原工程的单元测试 10/10、构建通过、e2e 3/4。失败的一项是 PNG 导出：中文文件名在 Chromium 158 下被改成 `download`，与本轮改动无关。本轮改用 ASCII 文件名后通过。

## e2e 改动说明

- 去掉的断言：“三角形数 > 实例数”和“关闭路网后 draw calls 下降”。现在主地图是 1 个纹理四边形，这两个指标没有意义了。改为断言：缓存覆盖格数 > 200、静态层已绘制、纹理字节 > 0、首页 LOD 为 far、旗标 ≥ 5 个；关闭路网会触发静态层重绘，关闭后同一点只选中地块。
- 路线拾取改为放大到路网显示档（六边形半径 ≥ 10 px，与 USACiv 一致）后再点击。点击位置是路线上离城镇最远的格心，通过 `atlasBench.routeProbe` 取得。
- 图层开关移进“地图”弹层（与 USACiv 的 Map 按钮一致），测试先打开弹层。
- 首页不再默认选中临川（USACiv 首页不开面板）。触控测试去掉开头的“关闭详情”；上下文恢复测试先搜索临川再断言。
- 详情面板有分节 h3，标题断言限定为 h2。

## 基准（Cloud SwiftShader，不代表真机）

相机路径与 P1a-01 相同：1440×900，DPR 1，预热 5 s，采样 12 s。为便于对照，在同一容器里用原 P1a-01 的 `dist/` 重新测了一次。

| 指标 | P1a-01（同机复测） | P1a-02 |
| --- | --- | --- |
| 帧间隔 P50 / P95 / 最大 | 66.7 / 133.4 / 166.6 ms | 33.3 / 250 / 433 ms |
| 超过 50 ms 的帧 | 135/148 | 20/250 |
| 每帧 CPU 渲染 P50 / P95 | 0.4 / 1.1 ms | 0.3 / 217 ms |
| 静态层重绘 | — | 15 次，P50 229 ms，P95 347 ms |
| 首帧就绪 | 1.07 s | 1.34 s |
| 缓存纹理 | — | 约 7.9 MiB（1760×1180×4） |

结论：
- 平时的帧更快，主地图只是 1 次 draw call。
- 连续缩放时，USACiv 绘制器重绘静态层，单次约 0.2–0.35 s（软件渲染下），造成 P95/最大帧间隔变差。
- 这与原版 USACiv 的取舍相同：缩放时先拉伸缓存，停稳后重绘。
- 仍未达到桌面帧间隔目标，需要在参考硬件上复测。可选优化：分条带渐进重绘、OffscreenCanvas Worker、降低软件渲染下的缓存 DPR。

## 视觉对标截图

[p1a-02-compare/](p1a-02-compare/)：`compare-*.jpg` 为左右并排图。左侧是原版 USACiv 实拍，仅作对照参考，不是本项目资产；右侧是本版。共 6 组，按六边形屏幕半径对齐：首页、区域（约 13 px）、近景（约 31 px）、特写（约 140–150 px）、城市面板、人口透镜。`before-P1a-01.jpeg` 是改版前的截图。另有 [terrain.png](terrain.png)、[population.png](population.png)、[touch-landscape.png](touch-landscape.png)（1024×768 @1.5 触控）和 [exported-map.png](exported-map.png)。

## 未验证

- iPadOS Safari 真机：只做了 Chromium 触控模拟。
- 参考桌面硬件的 GPU 性能。
- Palatino 和中文宋体在 macOS/iPadOS 上的实际排版：容器里只有文泉驿正黑，截图中的中文是黑体回退。
