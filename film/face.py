"""机器人"小光"的屏幕脸：根据表情参数画出一帧脸部图像（PIL）。

参数（都是 0~1，除了 look）：
  look=(x, y)   眼睛看向，x 正 = 画面右（机器人自己的左边），y 正 = 上
  open          睁眼程度（眨眼用）
  happy         笑眼 ^ ^
  surprise      惊讶：眼睛变大变圆 + 小 o 嘴
  sad           难过：眼睛外上角塌下 + 撇嘴
  determined    坚定：眼睛上沿斜切（像皱眉）
  squeeze       用力：> <
  heart         爱心眼
  wink          右眼眨（配合点赞）
  smile         嘴角上扬程度
  blush         腮红
  question      头顶冒问号
  boot          开机加载（0 = 未开机，0~1 = 加载动画，1 = 开好）
  glow          整体亮度
"""
import math

from PIL import Image, ImageChops, ImageDraw, ImageFilter

FW, FH = 560, 376          # 屏幕贴图分辨率（与屏幕面板宽高比一致）
SS = 2                     # 超采样
CYAN = (110, 244, 255)
PINK = (255, 120, 170)
BG = (2, 6, 10)

DEFAULT = dict(look=(0.0, 0.0), open=1.0, happy=0.0, surprise=0.0, sad=0.0, determined=0.0, squeeze=0.0,
               heart=0.0, wink=0.0, smile=0.0, blush=0.0, question=0.0, boot=1.0, glow=1.0, sparkle=0.0, t=0)


def _rr(d, box, r, fill):
    d.rounded_rectangle(box, radius=r, fill=fill)


def _heart(d, cx, cy, s, fill):
    pts = []
    for i in range(80):
        t = 2 * math.pi * i / 80
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((cx + x * s, cy - y * s))
    d.polygon(pts, fill=fill)


def _eye(layer, cx, cy, p, side):
    """在 mask 图层上画一只眼（白色），side=-1 左眼（画面左），+1 右眼。"""
    W, H = layer.size
    d = ImageDraw.Draw(layer)
    s = SS
    wink = p["wink"] if side > 0 else 0.0
    if p["heart"] > 0.5:
        _heart(d, cx, cy, 4.2 * s * (0.9 + 0.1 * math.sin(p["t"] * 0.5)), 255)
        return
    if p["squeeze"] > 0.5:
        w = 34 * s
        k = -side
        d.line([(cx - k * w, cy - 30 * s), (cx + k * w * 0.6, cy), (cx - k * w, cy + 30 * s)], fill=255,
               width=int(16 * s), joint="curve")
        return
    if p["happy"] > 0.5 or wink > 0.5:
        w, h = 52 * s, 38 * s
        d.arc([cx - w, cy - h + 8 * s, cx + w, cy + h + 8 * s], 200, 340, fill=255, width=int(20 * s))
        for ang in (200, 340):
            a = math.radians(ang)
            ex, ey = cx + w * math.cos(a), cy + 8 * s + h * math.sin(a)
            d.ellipse([ex - 10 * s, ey - 10 * s, ex + 10 * s, ey + 10 * s], fill=255)
        return
    sur = p["surprise"]
    w = (42 + 14 * sur) * s
    h = (64 + 6 * sur) * s * max(0.06, p["open"])
    r = min(w, h) * (0.85 + 0.15 * sur)
    _rr(d, [cx - w, cy - h, cx + w, cy + h], r, 255)
    # 高光（挖掉一个小点，像眼睛里的反光）
    if p["open"] > 0.4:
        hx, hy = cx + w * 0.35, cy - h * 0.45
        rr = 10 * s * (1 + 0.4 * sur)
        d.ellipse([hx - rr, hy - rr, hx + rr, hy + rr], fill=0)
        rr2 = 5 * s
        d.ellipse([hx - w * 0.55 - rr2, hy + h * 0.55 - rr2, hx - w * 0.55 + rr2, hy + h * 0.55 + rr2], fill=0)
    # 难过：外上角斜切
    if p["sad"] > 0.02:
        k = p["sad"]
        top = cy - h - 4 * s
        poly = [(cx - side * (w + 8 * s), top - 2), (cx + side * (w + 8 * s), top - 2),
                (cx + side * (w + 8 * s), top + 2 * h * 0.55 * k)]
        d.polygon(poly, fill=0)
    # 坚定：内上角斜切（眉头下压）
    if p["determined"] > 0.02:
        k = p["determined"]
        top = cy - h - 4 * s
        poly = [(cx - side * (w + 8 * s), top - 2), (cx + side * (w + 8 * s), top - 2),
                (cx - side * (w + 8 * s), top + 2 * h * 0.5 * k)]
        d.polygon(poly, fill=0)


def draw(params):
    p = dict(DEFAULT)
    p.update(params)
    W, H = FW * SS, FH * SS
    s = SS
    mask = Image.new("L", (W, H), 0)          # 青色内容
    pink = Image.new("L", (W, H), 0)          # 粉色内容（腮红、爱心）
    d = ImageDraw.Draw(mask)
    lx, ly = p["look"]
    cx, cy = W / 2 + lx * 52 * s, H / 2 - 6 * s - ly * 34 * s
    gap = 136 * s * (1 - 0.06 * abs(lx))
    boot = p["boot"]
    if boot < 1.0:
        if boot > 0.0:
            # 加载：一圈转动的点
            n = 8
            for i in range(n):
                a = 2 * math.pi * i / n + p["t"] * 0.35
                k = ((i - p["t"] * 0.35 * n / (2 * math.pi)) % n) / n
                rr = (4 + 7 * k) * s
                x, y = W / 2 + math.cos(a) * 46 * s, H / 2 + math.sin(a) * 46 * s
                d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=int(80 + 175 * k))
            # 进度条
            bw = 220 * s
            d.rounded_rectangle([W / 2 - bw / 2, H - 70 * s, W / 2 + bw / 2, H - 58 * s], radius=6 * s, outline=120,
                                width=2 * s)
            d.rounded_rectangle([W / 2 - bw / 2, H - 70 * s, W / 2 - bw / 2 + bw * boot, H - 58 * s], radius=6 * s,
                                fill=230)
    else:
        for side in (-1, 1):
            ex = cx + side * gap / 2
            e = Image.new("L", (W, H), 0)
            _eye(e, ex, cy, p, side)
            if p["heart"] > 0.5:
                pink = ImageChops.lighter(pink, e)
            else:
                mask = ImageChops.lighter(mask, e)
        d = ImageDraw.Draw(mask)
        # 嘴
        mx, my = cx, cy + 82 * s
        if p["surprise"] > 0.4 and p["happy"] < 0.5:
            r = 12 * s * p["surprise"]
            d.ellipse([mx - r, my - r * 1.15, mx + r, my + r * 1.15], outline=255, width=int(7 * s))
        elif p["sad"] > 0.4:
            d.arc([mx - 24 * s, my + 2 * s, mx + 24 * s, my + 30 * s], 205, 335, fill=255, width=int(7 * s))
        else:
            sm = max(p["smile"], p["happy"] * 0.9, p["heart"])
            if sm > 0.05:
                w = (16 + 22 * sm) * s
                d.arc([mx - w, my - 22 * s * sm - 4 * s, mx + w, my + 16 * s * sm], 20, 160, fill=255,
                      width=int(8 * s))
            elif p["determined"] > 0.4 or p["squeeze"] > 0.5:
                d.line([(mx - 18 * s, my + 4 * s), (mx + 18 * s, my + 4 * s)], fill=255, width=int(7 * s))
        if p["blush"] > 0.01:
            pd = ImageDraw.Draw(pink)
            for side in (-1, 1):
                bx = cx + side * (gap / 2 + 26 * s)
                by = cy + 58 * s
                pd.ellipse([bx - 30 * s, by - 13 * s, bx + 30 * s, by + 13 * s], fill=int(150 * p["blush"]))
        if p["question"] > 0.01:
            q = p["question"]
            qx, qy = W - 92 * s, 70 * s - 10 * s * q
            d.arc([qx - 22 * s, qy - 24 * s, qx + 22 * s, qy + 18 * s], 180, 80, fill=int(255 * q), width=int(9 * s))
            d.line([(qx + 4 * s, qy + 16 * s), (qx, qy + 34 * s)], fill=int(255 * q), width=int(9 * s))
            d.ellipse([qx - 6 * s, qy + 46 * s, qx + 6 * s, qy + 58 * s], fill=int(255 * q))
        if p["sparkle"] > 0.01:
            for i, (sx, sy, sz) in enumerate([(0.12, 0.2, 1.0), (0.86, 0.26, 0.8), (0.9, 0.72, 0.6), (0.1, 0.7, 0.7)]):
                ph = (p["t"] * 0.25 + i * 1.7)
                k = p["sparkle"] * (0.5 + 0.5 * math.sin(ph)) * sz
                if k < 0.05:
                    continue
                X, Y, R = sx * W, sy * H, 16 * s * k
                d.polygon([(X, Y - R), (X + R * 0.25, Y - R * 0.25), (X + R, Y), (X + R * 0.25, Y + R * 0.25),
                           (X, Y + R), (X - R * 0.25, Y + R * 0.25), (X - R, Y), (X - R * 0.25, Y - R * 0.25)],
                          fill=int(255 * k))
    # 合成：辉光 + 本体 + 像素格
    img = Image.new("RGB", (W, H), BG)
    g = p["glow"]
    for m, col in ((mask, CYAN), (pink, PINK)):
        if m.getbbox() is None:
            continue
        blur = m.filter(ImageFilter.GaussianBlur(14 * s))
        img = Image.composite(Image.new("RGB", (W, H), tuple(int(c * 0.55 * g) for c in col)), img,
                              blur.point(lambda v: int(v * 0.8)))
        img = Image.composite(Image.new("RGB", (W, H), tuple(min(255, int(c * g)) for c in col)), img, m)
    img = img.resize((FW, FH), Image.LANCZOS)
    d = ImageDraw.Draw(img, "RGBA")
    for y in range(0, FH, 3):
        d.line([(0, y), (FW, y)], fill=(0, 0, 0, 40))
    return img


if __name__ == "__main__":
    import os
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "work", "face_sheet.png")
    tests = [dict(), dict(look=(0.7, 0.2)), dict(open=0.1), dict(happy=1, blush=1),
             dict(surprise=1, question=1), dict(sad=1, look=(0, -0.3)), dict(determined=1), dict(squeeze=1),
             dict(heart=1, blush=1), dict(wink=1, smile=1), dict(boot=0.5, t=10), dict(happy=1, sparkle=1, t=3)]
    sheet = Image.new("RGB", (FW * 4, FH * 3))
    for i, t in enumerate(tests):
        sheet.paste(draw(t), ((i % 4) * FW, (i // 4) * FH))
    sheet.save(out)
    print(out)
