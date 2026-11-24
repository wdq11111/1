"""后期：渲染帧 → 1080p + 暗角/颗粒 + 字幕 + 淡入淡出 + 片尾字幕卡 → 合成 MP4（带配乐）。

用法：python film/post.py            # 处理全部并编码
      python film/post.py 300 760   # 只出这些帧的成片预览（不编码），看字幕效果
"""
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FR = os.path.join(HERE, "work", "frames")
FINAL = os.path.join(HERE, "work", "final")
OUT_DIR = os.path.join(os.path.dirname(HERE), "out")
AUDIO = os.path.join(HERE, "work", "audio.wav")
W, H = 1920, 1080
LAST_RENDER = 1104
TOTAL = 1200
FONT = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"

SUBS = [  # 起始帧, 结束帧, 台词（机器人的内心独白）
    (322, 372, "嗯？……这是哪儿？"),
    (392, 434, "好黑啊……"),
    (448, 502, "那个……是灯吗？"),
    (646, 668, "嘿咻！"),
    (724, 770, "哇——！"),
    (774, 815, "这样好多了！"),
    (850, 902, "你好呀！"),
    (910, 958, "很高兴认识你。"),
]
CAPTION = (16, 112, "凌晨 2:07")

F_SUB = ImageFont.truetype(FONT, 52)
F_CAP = ImageFont.truetype(FONT, 34)
F_TITLE = ImageFont.truetype(FONT, 118)
F_EN = ImageFont.truetype(FONT, 40)
F_CRED = ImageFont.truetype(FONT, 24)

_vig = None
rng = np.random.default_rng(3)


def vignette():
    global _vig
    if _vig is None:
        y, x = np.mgrid[0:H, 0:W]
        d = np.sqrt(((x - W / 2) / (W / 2)) ** 2 + ((y - H / 2) / (H / 2)) ** 2)
        _vig = (1 - 0.28 * np.clip(d - 0.55, 0, 1) ** 1.6)[..., None].astype(np.float32)
    return _vig


def alpha_for(f, a, b, ramp=4):
    if f < a or f > b:
        return 0.0
    return min(1.0, (f - a + 1) / ramp, (b - f + 1) / ramp)


def draw_text_center(img, text, font, y, alpha, fill=(255, 255, 255), stroke=3):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    tw = d.textlength(text, font=font)
    x = (img.size[0] - tw) / 2
    # 柔和阴影
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((x + 2, y + 3), text, font=font, fill=(0, 0, 0, int(200 * alpha)),
                            stroke_width=stroke + 3, stroke_fill=(0, 0, 0, int(140 * alpha)))
    sh = sh.filter(ImageFilter.GaussianBlur(5))
    d.text((x, y), text, font=font, fill=fill + (int(255 * alpha),), stroke_width=stroke,
           stroke_fill=(10, 10, 14, int(220 * alpha)))
    img.alpha_composite(sh)
    img.alpha_composite(layer)


def title_card(f):
    img = Image.new("RGBA", (W, H), (6, 8, 12, 255))
    a = min(1.0, (f - 1104) / 16) * min(1.0, (TOTAL - f) / 14)
    a = max(0.0, a)
    if a <= 0:
        return img
    # 屏幕同款的青色微光
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([W / 2 - 520, H / 2 - 260, W / 2 + 520, H / 2 + 160], fill=(40, 140, 170, int(60 * a)))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(120)))
    draw_text_center(img, "你好，世界", F_TITLE, H / 2 - 150, a, fill=(235, 250, 255), stroke=0)
    draw_text_center(img, "H e l l o ,  W o r l d", F_EN, H / 2 + 10, a * 0.85, fill=(120, 230, 255), stroke=0)
    a2 = max(0.0, min(1.0, (f - 1128) / 14) * min(1.0, (TOTAL - f) / 14))
    creds = ["角色模型  RobotExpressive — Tomás Laulhé (Quaternius) · CC0",
             "道具模型  Poly Haven（复古笔记本 / 台灯 / 闹钟 / 盆栽 / 木桌）· CC0",
             "制作  Blender (bpy) 无头渲染 · 配乐与音效为程序合成"]
    for i, c in enumerate(creds):
        draw_text_center(img, c, F_CRED, H - 190 + i * 40, a2 * 0.8, fill=(170, 180, 190), stroke=0)
    return img


def process(f):
    if f > LAST_RENDER:
        img = title_card(f)
    else:
        src = Image.open(os.path.join(FR, f"frame_{f:04d}.png")).convert("RGB")
        src = src.resize((W, H), Image.LANCZOS)
        arr = np.asarray(src).astype(np.float32) / 255.0
        arr *= vignette()
        arr += rng.normal(0, 0.012, (H, W, 1)).astype(np.float32)   # 轻微胶片颗粒
        fade = min(1.0, f / 20.0, max(0.0, (LAST_RENDER - f) / 18.0))  # 开头淡入、结尾淡出到黑
        arr *= fade
        img = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8)).convert("RGBA")
        for a, b, text in SUBS:
            al = alpha_for(f, a, b)
            if al > 0:
                draw_text_center(img, text, F_SUB, H - 150, al)
        a, b, text = CAPTION
        al = alpha_for(f, a, b, 10)
        if al > 0:
            layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
            d = ImageDraw.Draw(layer)
            d.text((90, H - 120), text, font=F_CAP, fill=(220, 230, 240, int(230 * al)))
            d.line([(90, H - 72), (90 + d.textlength(text, font=F_CAP), H - 72)], fill=(120, 230, 255, int(200 * al)),
                   width=2)
            img.alpha_composite(layer)
    img.convert("RGB").save(os.path.join(FINAL, f"f_{f:04d}.png"), compress_level=1)


def main():
    os.makedirs(FINAL, exist_ok=True)
    os.makedirs(OUT_DIR, exist_ok=True)
    if len(sys.argv) > 1:
        for f in map(int, sys.argv[1:]):
            process(f)
        print("preview frames ->", FINAL)
        return
    missing = [f for f in range(1, LAST_RENDER + 1)
               if not os.path.exists(os.path.join(FR, f"frame_{f:04d}.png"))
               or os.path.getsize(os.path.join(FR, f"frame_{f:04d}.png")) == 0]
    if missing:
        sys.exit(f"还缺 {len(missing)} 帧，例如 {missing[:5]}")
    for f in range(1, TOTAL + 1):
        process(f)
    out = os.path.join(OUT_DIR, "hello_world_ai_short_1080p.mp4")
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-framerate", "24", "-i", os.path.join(FINAL, "f_%04d.png"),
           "-i", AUDIO, "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out]
    subprocess.run(cmd, check=True)
    print("video ->", out)


if __name__ == "__main__":
    main()
