"""拼版：角色设定图（正面 / 3/4 两行 × 四角色）+ 脸部特写条。用法：python compose_sheet.py <素材目录> <输出目录>"""
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

SRC = sys.argv[1]
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)
FONT = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
KEYS = ["gpt", "gem", "cla", "ds"]
NAMES = {"gpt": "ChatGPT", "gem": "Gemini", "cla": "Claude", "ds": "DeepSeek"}
DESC = {"gpt": "白龙 · 角 / 翼 / 尾 · 扭结纹饰", "gem": "星猫 · 异色瞳 · 星光宝石",
        "cla": "橙发学者 · 菊花发饰 · 皮面书", "ds": "鲸鱼女仆 · 鲸鳍耳 · 鲸尾"}
ACCENT = {"gpt": (150, 140, 200), "gem": (110, 90, 220), "cla": (224, 108, 52), "ds": (52, 82, 168)}


def font(sz):
    return ImageFont.truetype(FONT, sz)


def background(W, H):
    bg = Image.new("RGB", (W, H))
    top, bot = (250, 244, 238), (232, 232, 246)
    px = bg.load()
    for y in range(H):
        t = y / (H - 1)
        c = tuple(int(a + (b - a) * t) for a, b in zip(top, bot))
        for x in range(W):
            px[x, y] = c
    return bg.convert("RGBA")


def shadow(w, h):
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).ellipse([w * 0.1, h * 0.3, w * 0.9, h * 0.7], fill=90)
    m = m.filter(ImageFilter.GaussianBlur(h * 0.18))
    s = Image.new("RGBA", (w, h), (70, 60, 90, 0))
    s.putalpha(m)
    return s


W, CELL_H, HEAD = 3840, 1000, 150
H = HEAD + 2 * CELL_H + 40
sheet = background(W, H)
d = ImageDraw.Draw(sheet)
d.text((60, 30), "《深夜服务器》角色设定", font=font(64), fill=(60, 50, 80))
d.text((60, 104), "正面 / 3/4 侧面 · 全部由 Blender Python 脚本程序化建模、材质与表情贴图生成", font=font(28),
       fill=(110, 100, 130))
cw = W // 4
for i, k in enumerate(KEYS):
    x0 = i * cw
    for r, view in enumerate(("front", "q34")):
        p = os.path.join(SRC, f"{k}_{view}.png")
        if not os.path.exists(p):
            continue
        im = Image.open(p).convert("RGBA")
        s = (CELL_H - 20) / im.height
        im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
        y0 = HEAD + r * CELL_H
        sh = shadow(int(im.width * 0.8), 120)
        sheet.alpha_composite(sh, (x0 + (cw - sh.width) // 2, y0 + int(im.height * 0.93) - 60))
        sheet.alpha_composite(im, (x0 + (cw - im.width) // 2, y0 + 10))
        d = ImageDraw.Draw(sheet)
        d.text((x0 + 24, y0 + 14), "正面" if view == "front" else "3/4 侧面", font=font(26), fill=(130, 120, 150))
    # 名字牌
    d.rounded_rectangle([x0 + 24, HEAD + 2 * CELL_H - 70, x0 + cw - 24, HEAD + 2 * CELL_H + 30], 18,
                        fill=(255, 255, 255, 210), outline=ACCENT[k], width=3)
    d.text((x0 + 44, HEAD + 2 * CELL_H - 62), NAMES[k], font=font(40), fill=ACCENT[k])
    d.text((x0 + 44 + 30 * len(NAMES[k]) // 1 + 40, HEAD + 2 * CELL_H - 50), DESC[k], font=font(24),
           fill=(90, 80, 110))
for i in range(1, 4):
    d.line([(i * cw, HEAD), (i * cw, HEAD + 2 * CELL_H - 80)], fill=(215, 210, 230), width=2)
sheet.convert("RGB").save(os.path.join(OUT, "character_sheet.png"))

# 脸部特写条
FH = 1000
strip = background(W, FH + 90)
d = ImageDraw.Draw(strip)
for i, k in enumerate(KEYS):
    p = os.path.join(SRC, f"{k}_face.png")
    if not os.path.exists(p):
        continue
    im = Image.open(p).convert("RGBA")
    s = (cw - 40) / im.width
    im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    strip.alpha_composite(im, (i * cw + 20, 70))
    d = ImageDraw.Draw(strip)
    d.text((i * cw + 30, 16), NAMES[k] + " · 脸部特写", font=font(34), fill=ACCENT[k])
strip.convert("RGB").save(os.path.join(OUT, "character_faces.png"))
print("[compose] ->", OUT)
