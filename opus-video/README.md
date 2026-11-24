# 下一代 Opus 什么时候来｜发布节奏分析（视频工程）

3 分 10 秒、1920×1080、30fps 的数据解说视频。内容来自报告《Claude Fable 与 Opus 发布间隔分析及下一代 Opus 发布预测》，数据截至 2026-11-23。

成片在 `out/`：

- `next-opus.mp4`：成片（配音 + 配乐 + 烧录字幕，H.264 约 6 Mbps，147 MB）。文件超过 GitHub 单文件上限，没有提交进仓库，按下面的步骤可以完整重新生成
- `next-opus.srt`：字幕文件，可以单独上传到平台
- `cover.png`：封面（片名帧）

## 怎么做出来的

画面是一个网页，`renderFrame(t)` 只依赖时间 t，用 Playwright 逐帧截图，再交给 ffmpeg 编码，所以每一帧都能单独重渲。

| 文件 | 作用 |
| --- | --- |
| `script/narration.json` | 旁白定稿：字幕文本、朗读文本（数字写成汉字）、画面同步点 `{cue}` |
| `tools/tts.py` | 用开源 Kokoro-82M-v1.1-zh（男声 zm_010）本地合成配音，生成 `build/timeline.json` |
| `src/` | 画面：`main.js` 是背景、HUD、字幕、转场；`scenes.js` 是 12 个镜头 |
| `tools/render.js` | 逐帧渲染：`stills` 出静帧、`contact` 出总览图、`video` 渲染全片 |
| `tools/music.py` | 本地合成配乐和音效（无版权素材），按配音自动避让并混音 |

## 重新生成

```bash
npm install                                   # 字体（Space Grotesk / JetBrains Mono）
# 中文字体：apt-get install fonts-noto-cjk fonts-noto-cjk-extra
# Python 3.12 环境：pip install torch --index-url https://download.pytorch.org/whl/cpu
#                   pip install "kokoro>=0.9.4" "misaki[zh]>=0.9.4" soundfile scipy
python tools/tts.py                           # 配音 + 时间轴
python tools/music.py                         # 配乐 + 混音
node tools/render.js video --workers 4        # 画面（4 核约 12 分钟）
bash tools/finish.sh                          # 响度标准化、合成成片、字幕、封面
# finish.sh 产出的是 CRF 17 母版（约 370 MB），上传用的版本再压一次：
ffmpeg -i out/next-opus.mp4 -c:v libx264 -preset slow -crf 21 -c:a copy -movflags +faststart next-opus-crf21.mp4
```

改旁白时只改 `script/narration.json`，再从第一步跑。改画面时只需重跑 `render.js` 和 `finish.sh`。
