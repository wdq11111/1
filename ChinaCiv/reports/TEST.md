# P1a-01 验证记录

日期 2026-11-27。环境为 Cloud Debian Linux x86‑64、Node 24.22.3、pnpm 9.15.9、Chromium 156.0.8078.79 / SwiftShader。

| 检查 | 覆盖 | 证据 |
| --- | --- | --- |
| 静态检查与生产构建 | TypeScript strict，Vite 生成可静态服务的产物 | [build.log](build.log) |
| 单元测试 | 12/16/20 km 半径各 82,420 格往返，窗口索引，精确格边与相邻值取整，锚点缩放，夹具身份与数据稳定性 | [unit-test.log](unit-test.log) |
| Chromium 桌面 | 地块、城镇、铁路拾取，图层，键盘与拖拽滚轮，搜索，小地图，PNG 下载，控制台错误检查 | [browser-test.log](browser-test.log) |
| Chromium 触控代理 | 1024×768 / DPR 1.5，双指捏合、双指轻点、单指拖拽、长按、双击 | [browser-test.log](browser-test.log) |
| WebGL2 能力 | 无上下文提示，模拟上下文丢失恢复后的透镜和选中状态 | [browser-test.log](browser-test.log) |
| Cloud 基准 | 相机路径，帧间隔与 CPU 渲染耗时，整场 draw calls、三角形和实例，纹理占用估算 | [测量协议](bench-protocol.md) · [实际 JSON](cloud-benchmark.json) |

已检查 [桌面地形](terrain.png)、[人口透镜](population.png)、[横屏触控布局](touch-landscape.png) 和 [PNG 导出](exported-map.png)。原型的截图尺寸为当前地图绘图缓冲。iPadOS Safari 真机、正式硬件性能预算、正式合规图层、4K 分块导出均留在相应门禁。

## 结果

生产构建成功，Vitest 10/10、Playwright 4/4 通过。30–60 FPS 级别的正式性能目标留待硬件实测。Cloud SwiftShader 相机路径记录 78 个帧间隔，P95 为 249.9 ms，CPU 渲染提交 P95 为 4.1 ms，最高 8 次绘制、7,872 个三角形、2,862 个精灵，纹理估算约 2.88 MiB。该软件环境未达到正式桌面帧间隔目标。冷态导航到首帧统计就绪为 2.88 s，未施加 50 Mbps 网络限制。
