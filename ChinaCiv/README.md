# ChinaCiv《华夏文明》

P1a-02「青澜流域」是 Karpathy《USACiv》风格的中国版六边形策略地图技术样例，仍使用 Three.js、React、TypeScript 和 WebGL2。地图绘制代码移植自 USACiv（MIT，见 `packages/renderer/src/usaciv/NOTICE.md`）。场景包含 82,420 个尖顶格，以及 USACiv 绘制器画出的地形、植被、河湖、海岸、城市、城镇旗标、交通网络和三种透镜。地形、城镇及数值均为固定种子合成内容。

## 运行

使用满足 Vite 7 要求的 Node.js（推荐 22.12+ 或 24 LTS）和 pnpm 9.15.9。从本目录运行以下命令。

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

打开 `http://localhost:5173/`。交付压缩包已包含编译后的 `dist/`，也可以直接在本目录运行 `python3 -m http.server 5173 --directory dist`。

## 操作

- 拖拽平移，滚轮以光标为锚点缩放。聚焦地图后可用方向键、WASD、加号及减号。
- 触控支持单指拖拽和惯性、双指捏合、双击放大、双指轻点缩小。长按打开提示卡，点卡片内按钮查看详情。
- 点选旗标、线路或格子查看详情。用汉字或拼音搜索城镇，或点小地图移动视野。
- 右下透镜坞切换地形地貌、人口密度和经济活动；“地图”弹层独立控制交通网络、六边形网格与地名旗标。悬停地块显示地表、海拔与所属合成分区。透镜中的斜线代表无数据。右上角相机按钮导出有合成标识的 PNG，尺寸与当前地图绘图缓冲一致。

## 验证

```sh
corepack pnpm test
corepack pnpm build
corepack pnpm exec playwright install chromium   # 或用 CHINACIV_CHROMIUM 指定已有 Chromium
corepack pnpm test:e2e
# 另一个终端运行 corepack pnpm preview
corepack pnpm bench
```

已有系统 Chromium 时可以通过 `CHINACIV_CHROMIUM` 指定可执行程序。基准在 `reports/` 写出 JSON。测试和基准使用 Chromium 软件 WebGL2，可用于重复验证和趋势记录。正式设备验收另见 [工程进度](docs/PROGRESS.md)。

入口与输入协调位于 `apps/web`。六边形数学、地图数据类型、透镜定义、合成数据和 Three.js 渲染分别位于 `packages/` 的对应目录。
