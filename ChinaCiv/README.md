# ChinaCiv《华夏文明》

P1a-01「青澜流域」是用 Three.js、React、TypeScript 和 WebGL2 构建的可操作六边形地图技术样例。场景包含 82,420 个尖顶格、原创程序绘制的山体与植被、河湖、海岸、城镇旗标、交通网络和三种透镜。地形、城镇及数值均为固定种子合成内容。

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
- 左栏切换地形、人口密度和经济活动，独立控制线路、网格与旗标。透镜中的斜线代表无数据。右上角相机按钮导出有合成标识的 PNG，尺寸与当前地图绘图缓冲一致。

## 验证

```sh
corepack pnpm test
corepack pnpm build
corepack pnpm exec playwright install chromium
corepack pnpm test:e2e
# 另一个终端运行 corepack pnpm preview
corepack pnpm bench
```

已有系统 Chromium 时可以通过 `CHINACIV_CHROMIUM` 指定可执行程序。基准在 `reports/` 写出 JSON。测试和基准使用 Chromium 软件 WebGL2，可用于重复验证和趋势记录。正式设备验收另见 [工程进度](docs/PROGRESS.md)。

入口与输入协调位于 `apps/web`。六边形数学、地图数据类型、透镜定义、合成数据和 Three.js 渲染分别位于 `packages/` 的对应目录。
