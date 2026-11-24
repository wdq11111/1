"""生成笔记本屏幕的逐帧画面（复古终端风），输出 film/work/screen/screen_0001.png ...

时间轴与 build.py 中的 TIMELINE 保持一致（24fps）。
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "work", "screen")
W, H = 640, 520
BG = (3, 14, 24)
FG = (110, 236, 255)
DIM = (40, 110, 130)
PIX = "/usr/share/fonts/opentype/unifont/unifont.otf"
F32 = ImageFont.truetype(PIX, 32)
F64 = ImageFont.truetype(PIX, 64)
F96 = ImageFont.truetype(PIX, 96)

LAST = 1104

CMD = "C:\\> run hello_world.exe"
MODULES = [("好奇心.dll", 128), ("善良.sys", 146), ("幽默感.cfg", 162), ("一点点勇气.exe", 178)]


def cursor_on(f, period=14):
    return (f // (period // 2)) % 2 == 0


def base():
    return Image.new("RGB", (W, H), BG)


def finish(img, glow=1.0, flash=0.0):
    # 磷光辉光 + 扫描线 + 暗角
    blur = img.filter(ImageFilter.GaussianBlur(6))
    img = Image.blend(img, Image.eval(blur, lambda v: min(255, int(v * 1.6))), 0.35 * glow)
    d = ImageDraw.Draw(img, "RGBA")
    for y in range(0, H, 4):
        d.line([(0, y), (W, y)], fill=(0, 0, 0, 46))
    if flash > 0:
        img = Image.blend(img, Image.new("RGB", (W, H), (235, 252, 255)), min(1.0, flash))
    return img


def text(d, xy, s, font=F32, fill=FG):
    d.text(xy, s, font=font, fill=fill)


def frame(f):
    img = base()
    d = ImageDraw.Draw(img)
    x0, y0, lh = 28, 26, 40
    flash = 0.0
    if f <= 120:
        # 开机：光标闪烁 → 敲命令
        text(d, (x0, y0), "RETRO-BOOK 386  BIOS v1.07", fill=DIM)
        text(d, (x0, y0 + lh), "640K OK", fill=DIM)
        n = 0 if f < 34 else min(len(CMD), (f - 34) * 2 // 5 + 4)
        s = CMD[:n] if n else "C:\\>"
        cur = "_" if (cursor_on(f) or 34 <= f < 100) else " "
        text(d, (x0, y0 + lh * 3), s + cur)
        if f > 104:
            text(d, (x0, y0 + lh * 4), "正在唤醒……")
    elif f <= 216:
        text(d, (x0, y0), CMD, fill=DIM)
        text(d, (x0, y0 + lh), "正在加载人格模块")
        for i, (name, t) in enumerate(MODULES):
            if f >= t - 16:
                ok = f >= t
                line = f"> {name}"
                text(d, (x0, y0 + lh * (3 + i)), line)
                text(d, (W - 28 - 64, y0 + lh * (3 + i)), "OK" if ok else ("." * (1 + (f // 3) % 3)))
        p = max(0.0, min(1.0, (f - 122) / (196 - 122)))
        bx0, by0, bw, bh = x0, H - 92, W - 2 * x0 - 110, 34
        d.rectangle([bx0, by0, bx0 + bw, by0 + bh], outline=FG, width=3)
        fillw = int((bw - 12) * p)
        if fillw > 0:
            d.rectangle([bx0 + 6, by0 + 6, bx0 + 6 + fillw, by0 + bh - 6], fill=FG)
        text(d, (bx0 + bw + 18, by0 + 1), f"{int(p * 100):3d}%")
        if f >= 197:
            flash = ((f - 197) / 14.0) ** 1.5
    elif f <= 300:
        # 闪白后余晖
        flash = max(0.0, 1.0 - (f - 216) / 30.0)
        text(d, (x0, y0), "hello_world.exe 运行中", fill=DIM)
        text(d, (x0, y0 + lh), ">" + ("_" if cursor_on(f) else " "))
    elif f <= 960:
        text(d, (x0, y0), "hello_world.exe 运行中", fill=DIM)
        text(d, (x0, y0 + lh), ">" + ("_" if cursor_on(f) else " "))
        if f >= 680:
            # 灯亮之后，屏幕上冒出一个笑脸
            s = ":)"
            tw = d.textlength(s, font=F96)
            text(d, ((W - tw) / 2, H / 2 - 40), s, font=F96)
    else:
        # 结尾：你好，世界！
        n = min(6, max(0, (f - 966) // 5))
        s = "你好，世界！"[:n]
        tw = d.textlength("你好，世界！", font=F64)
        text(d, ((W - tw) / 2, H / 2 - 70), s, font=F64)
        if n >= 6:
            s2 = "Hello, World"
            tw2 = d.textlength(s2, font=F32)
            text(d, ((W - tw2) / 2, H / 2 + 20), s2, fill=DIM)
            if cursor_on(f, 20):
                text(d, ((W - 32) / 2, H / 2 + 80), "♥", font=F32)
    return finish(img, flash=flash)


def main():
    os.makedirs(OUT, exist_ok=True)
    frames = range(1, LAST + 1) if len(sys.argv) < 2 else [int(a) for a in sys.argv[1:]]
    for f in frames:
        frame(f).save(os.path.join(OUT, f"screen_{f:04d}.png"))
    print("screen frames ->", OUT, len(list(frames)))


if __name__ == "__main__":
    main()
