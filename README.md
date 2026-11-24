# 《你好，世界》—— AI 拟人化 3D 短片

凌晨两点，一台 90 年代的旧笔记本自己开了机。屏幕上加载完"好奇心""善良""幽默感"和"一点点勇气"四个人格模块后，一个小机器人从光里诞生了。它怕黑，于是鼓起勇气跳上开关，点亮了台灯，然后转过身来，跟屏幕前的你打招呼。

- 时长约 50 秒（24 fps，1200 帧，含片尾字幕卡）
- 成片：`out/hello_world_ai_short_1080p.mp4`（1920×1080，H.264 + AAC）
- 全部用无头 Blender（pip 版 `bpy` 5.3，Cycles CPU）脚本搭建和渲染，没有手工操作 Blender 界面

## 分镜

| 镜头 | 帧 | 内容 |
|---|---|---|
| S01 | 1–120 | 深夜书桌全景，旧笔记本开机、敲命令 `run hello_world.exe` |
| S02 | 121–216 | 屏幕特写：加载人格模块，进度条到 100%，闪白 |
| S03 | 217–312 | 光粒子从屏幕飞出汇聚，小机器人诞生，眼睛开机 |
| S04 | 313–432 | 面部特写："嗯？……这是哪儿？""好黑啊……" |
| S05 | 433–504 | 过肩镜头，发现台灯："那个……是灯吗？" |
| S06 | 505–620 | 侧面跟拍，走向台灯开关 |
| S07 | 621–720 | 跳上开关，灯亮 |
| S08 | 721–816 | 特写："哇——！""这样好多了！" |
| S09 | 817–960 | 转向镜头，挥手"你好呀！"、点赞"很高兴认识你。" |
| S10 | 961–1104 | 在开关上跳舞，屏幕显示"你好，世界！"，镜头拉远淡出 |
| 片尾 | 1105–1200 | 片名与素材署名 |

## 拟人化的处理

- **眼睛**：给模型原本的黑色眼球写了一个程序化着色器，画出会发光的圆形瞳孔。瞳孔可以看向不同方向、可以眨眼，开心时变成弯弯的笑眼。
- **表情**：用模型自带的 Surprised / Sad / Angry 形态键控制眉毛。
- **动作**：用 NLA 把模型自带的 Idle / Walking / Jump / Yes / Wave / ThumbsUp / Dance 动作混合起来，上面再叠一层头部转动（COMBINE 模式）。走路的根运动按步速逐帧积分，避免脚底打滑。
- **声音**：机器人"说话"用带滑音和颤音的电子音节，每句台词配一段，另外配了中文字幕。

## 目录

```
film/
  build.py        场景构建：布景、道具、机器人、动作编排、灯光、10 个镜头（保存 film/work/film.blend）
  screen_gen.py   笔记本屏幕的逐帧画面（复古终端风，Unifont 像素字体）
  render_all.py   正式渲染，支持断点续渲
  audio.py        配乐与音效，全部用 numpy/scipy 合成
  post.py         后期：放大到 1080p、暗角、颗粒、字幕、淡入淡出、片尾卡，再合成 MP4
  wb_preview.py   Workbench 灰模快速预览动画
  montage.py      把多张预览图拼成一张
  bpyx.py         无头 Blender 工具库（来自 blender-headless skill）
assets/raw/       下载的开放素材（均为 CC0）
out/              成片
```

## 复现

```bash
# 1. 装 pip 版 Blender（Python 3.13）
uv venv ~/.venvs/bpy --python 3.13 && VIRTUAL_ENV=~/.venvs/bpy uv pip install bpy
# 音频和后期用另一个环境
uv venv ~/.venvs/audio --python 3.13 && VIRTUAL_ENV=~/.venvs/audio uv pip install numpy scipy pillow

# 2. 生成屏幕画面 → 构建场景 → 渲染（4 核 CPU，960×540、20 采样，每帧约 12 秒）
python3 film/screen_gen.py
~/.venvs/bpy/bin/python film/build.py
~/.venvs/bpy/bin/python film/build.py preview 300 700   # 可选：渲几帧低清预览
~/.venvs/bpy/bin/python film/render_all.py 960 540 20

# 3. 配乐、后期、合成
~/.venvs/audio/bin/python film/audio.py
~/.venvs/audio/bin/python film/post.py
```

需要系统里有 `ffmpeg` 和中文字体（文泉驿正黑 `fonts-wqy-zenhei`、`unifont`）。

## 素材来源与许可

| 素材 | 作者 / 来源 | 许可 |
|---|---|---|
| 机器人角色 RobotExpressive（含动作和表情形态键） | Tomás Laulhé（Quaternius），Don McCurdy 修改；取自 three.js 示例仓库 | CC0 1.0 |
| 复古笔记本 classic_laptop | Poly Haven | CC0 |
| 台灯 desk_lamp_arm_01 | Poly Haven | CC0 |
| 闹钟 alarm_clock_01 | Poly Haven | CC0 |
| 盆栽 potted_plant_02 / potted_plant_04 | Poly Haven | CC0 |
| 木桌 wooden_table_02 | Poly Haven | CC0 |
| 墙、窗、书、马克杯、便签、铅笔、开关、电线 | 脚本程序建模 | — |
| 配乐与音效 | `film/audio.py` 程序合成 | — |

## 踩过的坑（bpy 5.3）

- 这个 glTF 用 Blender 默认的骨骼推断（`bone_heuristic="BLENDER"`）导入，腿会被塞进身体里，必须用 `TEMPERANCE`。
- 每个动作只给会动的骨骼打了关键帧，切换动作时没打关键帧的骨骼会沿用残留值，姿势就乱了。所以在 NLA 最底层垫了一条覆盖全部骨骼的 DefaultPose。
- 表情形态键会轻微挪动眼球顶点，导致程序化瞳孔偏位，所以让眼球不参与形态键。
- 城市灯光、屏幕、光粒子这些装饰性发光体如果也被当成光源采样，渲染又慢又脏。把它们的 `emission_sampling` 设成 `NONE`，照明交给对应的灯光对象。
