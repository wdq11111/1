---
name: blender-headless
description: 在没有 Blender 界面的环境（云端容器、服务器、CI，或者没有 Blender MCP 的时候）用 Python 版 Blender（pip 装的 bpy，或 blender -b）写脚本建模、上材质、打光、渲染出图和视频，并导入导出 .blend/.glb/.fbx/.obj/.stl/.usd。自带一键安装脚本、工具库（自动构图、三点布光、无缝影棚背景、360° 转台动画、合成 MP4/GIF）和 bpy 5.x 踩坑笔记。只要用户想做 3D 相关的东西就用它：提到 Blender、bpy、3D 建模、3D 渲染、产品渲染图/白底图、产品 360 度旋转展示视频、3D 文字或 logo、低多边形场景、程序化生成模型、3D 打印 STL、模型格式转换、给模型拍预览图，即使用户没明说 Blender 也要用。
---

# 无头 Blender（bpy）建模与渲染

没有 Blender 界面时，用 pip 版 Blender（`bpy` 模块）写 Python 脚本完成建模 → 材质 → 灯光 → 相机 → 渲染 → 导出。
看不到视口，所以"看图"靠渲染出 PNG 再用 Read 工具查看；整个流程是 **写脚本 → 低清预览 → 看图修改 → 正式渲染**。

本 skill 目录（加载时给出的 Base directory）下文记作 `$SKILL`：
- `$SKILL/scripts/setup_bpy.sh`：安装 + 自检
- `$SKILL/scripts/bpyx.py`：工具库（自动构图、布光、背景、渲染、动画、导入导出）
- `$SKILL/references/api-notes.md`：bpy 5.x 常用写法（bmesh、修改器、曲线、文字、贴图、动画、物理、3D 打印检查……）和踩坑，用到相关功能时再读

## 1. 准备环境（每个新容器做一次）

```bash
bash $SKILL/scripts/setup_bpy.sh --with-gl
```

- 自动查 PyPI 上最新 bpy 需要的 Python 版本（5.x 要 3.13），建虚拟环境 `~/.venvs/bpy` 并安装（约 1 GB），最后真渲一张小图自检。装过就跳过，重复跑没关系。
- `--with-gl` 用 apt 装 Mesa 软件渲染驱动，这样 Workbench（秒出的灰模预览）和 EEVEE 也能用。没有 apt/root 就不加，那只能用 Cycles。
- 输出最后一行 `BPY_PYTHON=...`，之后都用这个解释器跑脚本。
- 如果机器上本来就有 Blender（`blender --version` 能跑），也可以 `blender -b -P scene.py -- 参数`，bpyx 一样能用（`bx.args()` 会自动取 `--` 之后的参数）。
- 只支持 Linux x86_64、macOS arm64、Windows（PyPI 只有这些平台的包）。

## 2. 工作流程

1. **把需求落实**：画幅和分辨率、风格（写实产品图 / 低多边形 / 卡通 / 等轴测）、颜色（尽量拿到 hex）、交付物（PNG、透明 PNG、MP4、GIF、glb、stl、blend）。关键信息缺了就问；不关键的用合理默认值，交付时说明。
2. **写场景脚本到文件**（比如 `work/scene.py`），不要用 `python -c` 塞一长串：脚本要反复改。
3. **先预览**：`bx.preview("work/preview.png")`，再用 Read 看构图、比例、颜色。不满意就改脚本重跑。预览几秒一张，正式渲染要几十秒，别拿正式渲染来调构图。
4. **正式渲染**后再用 Read 检查一遍：过曝、发黑、穿模、出画、文字反了，都在这一步发现。
5. **动画**先渲 1 帧确认并计时，用 单帧时间 × 帧数 估算总时长，超过一两分钟就用 Bash 的 `run_in_background` 跑，或者加大 `timeout`。
6. **交付**：成品放到用户能打开的目录，或用发送文件的工具发出去；说明分辨率、耗时、文件格式。`.blend` 要 Blender 5.x 才能完整打开，对方版本旧就同时给 `.glb`/`.fbx`。云端容器是临时的，重要产物别只留在 /tmp。

运行脚本时过滤掉刷屏的进度行：

```bash
~/.venvs/bpy/bin/python work/scene.py 2>&1 | grep -v -e "^Fra:" -e "CUEW"
```

## 3. 脚本模板

```python
import sys; sys.path.insert(0, "$SKILL/scripts")   # 换成实际路径
import bpyx as bx

bx.reset()                                           # 空场景
bottle = bx.add("cylinder", location=(0, 0, 0.6), vertices=64, radius=0.35, depth=1.2,
                mat=bx.material("#e84a2f", roughness=0.3), smooth=True, bevel=0.03)
cap = bx.add("cylinder", location=(0, 0, 1.3), vertices=64, radius=0.18, depth=0.2,
             mat=bx.material("#d4af37", roughness=0.25, metallic=1), smooth=True, bevel=0.01)
bx.backdrop("#f0ece4")                               # 无缝影棚背景，自动贴住物体底部
bx.studio_lights()                                   # 按物体大小自动三点布光
bx.world("#ffffff", strength=0.15)                   # 少量环境光，给金属/玻璃一点反射
cam = bx.camera(direction=(0.6, -1.6, 0.55), lens=70)  # 沿这个方向自动退到刚好框住
bx.setup_render(res=(1200, 900), samples=48)         # 4 核约 40~50 秒
bx.preview("work/preview.png")
bx.render("out/bottle.png")
bx.export("out/bottle.glb", objs=[bottle, cap])
```

坐标约定：Z 朝上，地面是 z=0，`backdrop` 的背墙在 +Y，所以相机 `direction` 的 y 分量要取负（从 -Y 一侧拍）。

## 4. bpyx 速查

| 函数 | 作用 |
|---|---|
| `reset()` | 清成空场景 |
| `add(kind, location, rot_deg, scale, mat=, smooth=, subsurf=, bevel=, **op参数)` | 基本体：cube / sphere / icosphere / cylinder / cone / torus / plane / circle / grid / monkey |
| `material(color, roughness, metallic, emission=, emission_strength=, transmission=, ior=, coat=, alpha=)` | Principled 材质；文档字符串里有塑料、金属、玻璃、发光、车漆的参数组合 |
| `assign(obj, mat)` / `rgba(color)` | 上材质 / 颜色转换 |
| `backdrop(color)` | 无缝影棚背景（地面 + 弧形 + 背墙） |
| `studio_lights(strength=1)` | 三点布光，亮度随场景尺度自动换算 |
| `light(kind, location, target, energy, size=, color=)` | 单盏灯 |
| `world(color, strength, hdri=)` | 世界背景 / 环境光 / HDRI |
| `camera(location=None, target=None, lens=, direction=, margin=)` | 建相机；不给 location 就自动构图 |
| `frame(cam, objs, margin, direction, sweep)` | 重新构图（改分辨率后要重新调用） |
| `look_at(obj, point)` / `bounds(objs)` | 朝向 / 包围盒（min, max, center, radius） |
| `setup_render(engine, res, samples, view=, transparent=, fmt=, exposure=)` | 渲染设置 |
| `preview(path)` / `render(path)` | 低清预览 / 正式渲染 |
| `turntable(frames, fps, rotate="objects"/"camera")` | 360° 无缝循环转台，自动按旋转范围构图 |
| `render_frames(dir)` / `encode_video(dir, "x.mp4"/"x.gif", fps)` | 渲序列帧 / 用 ffmpeg 合成 |
| `export(path, objs=None, **kw)` / `load(path)` | 按扩展名导出 / 导入，`load` 返回新增的物体 |
| `gl_available()` | 能否用 Workbench/EEVEE |

## 5. 要点和坑

- **颜色空间**：Blender 节点里的颜色是线性值。`bx.material("#ff8800")` 会按 sRGB hex 自动转换；直接写 `(1, 0.5, 0)` 会被当成线性值，渲出来比想象的浅。用户给的颜色一律用 hex 传。
- **色彩视图**：`setup_render` 默认用 `"Khronos PBR Neutral"`，颜色接近 hex、高光也不炸，适合产品图。`"AgX"`（Blender 默认）整体偏灰偏淡，适合有强光源、需要胶片感的写实场景；`"Standard"` 适合扁平风或自发光的 UI 类画面。
- **引擎选择**（无显卡，4 核 CPU 实测）：Cycles 是主力。960×640、48 采样加降噪、4 个物体（含玻璃）约 26 秒；1600×1200、64 采样约 100 秒（已经接近 Bash 默认的 2 分钟超时）；320×180、8 采样约 0.7 秒一帧。Workbench 预览不到 3 秒。EEVEE 是靠 CPU 软件模拟显卡跑的，比 Cycles 还慢（同一场景 43 秒对 18 秒），无 GPU 时别为了快去用 EEVEE。耗时大致和 像素数 × 采样数 成正比；开着降噪 32～128 采样就够干净。
- **GPU 初始化失败会直接杀掉进程**，没有异常可捕获。用 Workbench/EEVEE 前先确认 `bx.gl_available()`（`bx.preview` 已经帮你判断）。
- **金属和玻璃要有东西可反射**：暗背景 + 没有背景板时，金属会发黑。加 `bx.world(...)` 环境光或背景板。
- **透明背景**：`setup_render(transparent=True)` + 隐藏背景板（`obj.hide_render = True`），输出带 alpha 的 PNG。
- **文字**：默认字体不含中文，必须 `bpy.data.fonts.load(中文字体路径)`，写法见 api-notes 第 6 节。文字默认平躺在 XY 平面，要绕 X 轴转 90° 立起来面向 -Y。
- **5.x API 变化**：不要再设 `material.use_nodes`；`action.fcurves` 已经删了，改用 channelbag（api-notes 第 9 节）。网上搜到的 2.x / 3.x 老代码经常跑不通，以 api-notes 和实际报错为准。
- **后台模式**没有视口，`bpy.ops.view3d.*` 一类算子不能用，优先用数据 API 和 bmesh。
- 路径都用绝对路径或相对当前工作目录，`bx.render` / `bx.export` 会自动建目录。
