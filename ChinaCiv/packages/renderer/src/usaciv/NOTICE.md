# USACiv 移植说明（第三方代码）

本目录的 JavaScript 来自 Andrej Karpathy 的 USACiv：https://karpathy.ai/usaciv/

- **获取方式**：2026-11-27 下载官方源码包 `https://karpathy.ai/usaciv/usaciv-source.zip`（8,008,568 字节），从中取出 `web/js/` 下的模块。
- **许可**：源码包根目录的 `LICENSE` 是 MIT License，“Copyright (c) 2026 Andrej Karpathy”。原文复制在本目录的 `LICENSE`，构建产物里也带一份 `LICENSE-USACIV.txt`。
- **美术资产**：USACiv README 写明“every glyph, icon and texture here is original and drawn in code”。地形、城市、水体、旗标、图标都是 JS 程序绘制的，属于 MIT 覆盖的代码。本工程**没有复制** USACiv 的任何位图（如 `og-image.png`、`docs/images/*`）。
- **字体**：USACiv 只用系统字体栈（Palatino / Georgia / -apple-system），没有打包字体文件。本工程同样只用系统字体，另外补了中文回退字体。
- **数据**：USACiv README 写明 MIT 只覆盖代码、不覆盖数据。本工程**没有使用** USACiv 的任何数据文件（`web/data/*.json`）。地图、城镇和数值全部来自 ChinaCiv 的合成夹具。两个透镜色阶的颜色值（6 个十六进制色）参照 USACiv `lenses.json` 中的 density / income 色阶。

## 取用的模块

`hex.js` `color.js` `terrain.js` `world.js` `icons.js` `format.js` `ext/cityView/fmt.js` `render/map.js` `render/banners.js`
`render/art/{terrain,water,city,lod,sprites,improvements}.js`。`index.js` 和 `index.d.ts` 是 ChinaCiv 自己写的入口与类型声明。

## ChinaCiv 的修改（都在源码中以 `ChinaCiv:` 注释标出）

1. `format.js` 和 `ext/cityView/fmt.js`：数字单位从 K/M/B/T 改为 万/亿/万亿，货币改为“元”。
2. `render/banners.js`：字体栈加上中文回退。旗标人口优先显示 `city.popLabel`，美术分级和显示数值可以分开。
3. `world.js` 和 `render/map.js`：区名字体加中文回退。两字中文区名不再被当作邮政缩写，改用较宽的字距（0.75 em），最大 40 px。
4. `render/map.js`：`opts.grid === false` 时不画六边形网格（对应“六边形网格”开关）。
