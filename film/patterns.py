"""花纹贴图：脚本用 Pillow 画出来（蕾丝、藤蔓刺绣、细条纹、金边、星点、太阳纹、扭结纹、龙鳞）。

PatternAtlas：竖向叠放若干条带（band），每条 2048×512，上下各留透明边。
材质里按 UVMap 叠加；网格用 uvp(s,a) 把参数映射到某条带里。
"""
import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter

BW, BH = 2048, 512
SS = 2


def _rgba(h, a=255):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


class PatternAtlas:
    def __init__(self, nbands):
        self.n = nbands + 1          # 0 号留空（透明），不带花纹的面都映射到那里
        self.layers = [None] * self.n
        self.next = 1

    def new_band(self):
        k = self.next
        self.next += 1
        im = Image.new("RGBA", (BW * SS, BH * SS), (0, 0, 0, 0))
        self.layers[k] = im
        return k, im, ImageDraw.Draw(im)

    def uvp(self, band, rep=1.0, s0=0.0, s1=1.0, flip=False, a_off=0.0):
        """返回 uvp(s,a)。s 在 [s0,s1] 映射到条带的上→下（flip 反向）。"""
        n = self.n
        margin = 6 / BH

        def fn(s, a):
            t = (s - s0) / max(s1 - s0, 1e-6)
            t = min(max(t, 0.0), 1.0)
            if flip:
                t = 1 - t
            t = margin + t * (1 - 2 * margin)
            v = 1.0 - (band + t) / n
            return ((a + a_off) * rep, v)
        return fn

    def save(self, path):
        out = Image.new("RGBA", (BW, BH * self.n), (0, 0, 0, 0))
        for k, im in enumerate(self.layers):
            if im is None:
                continue
            sm = im.resize((BW, BH), Image.LANCZOS)
            # 上下 4px 清空
            clear = Image.new("RGBA", (BW, 4), (0, 0, 0, 0))
            sm.paste(clear, (0, 0)); sm.paste(clear, (0, BH - 4))
            out.paste(sm, (0, k * BH))
        os.makedirs(os.path.dirname(path), exist_ok=True)
        out.save(path)
        return path


# ------------------------------------------------------------------ 画法（坐标为超采样像素）

def _w(x):
    return int(x * SS)


def hline(d, y, col, width):
    d.rectangle([0, _w(y - width / 2), BW * SS, _w(y + width / 2)], fill=col)


def vine_band(atlas, color, y0=0.15, y1=0.85, motifs=6, lines=True, line_col=None, seed=1):
    """藤蔓刺绣：主茎正弦 + 叶片 + 卷须。"""
    k, im, d = atlas.new_band()
    R = random.Random(seed)
    col = _rgba(color)
    H = BH
    yc = (y0 + y1) / 2 * H
    amp = (y1 - y0) / 2 * H * 0.55
    per = BW / motifs
    pts = []
    for i in range(0, BW + 1, 2):
        pts.append((_w(i), _w(yc + amp * math.sin(i / per * 2 * math.pi))))
    d.line(pts, fill=col, width=_w(5), joint="curve")
    for m in range(motifs * 2):
        x = (m + 0.25) * per / 2
        y = yc + amp * math.sin(x / per * 2 * math.pi)
        dirc = 1 if m % 2 == 0 else -1
        # 叶片
        for j, (dx, dy, ang) in enumerate(((22, -20 * dirc, -35), (48, 10 * dirc, 25))):
            cx, cy = x + dx, y + dy
            L, Wd = 34, 13
            a = math.radians(ang + (0 if dirc > 0 else 180))
            leaf = []
            for t in range(21):
                u = t / 20
                px = (u - 0.5) * L
                py = math.sin(u * math.pi) * Wd / 2
                leaf.append((px, py))
            for t in range(20, -1, -1):
                u = t / 20
                leaf.append(((u - 0.5) * L, -math.sin(u * math.pi) * Wd / 2))
            poly = [(_w(cx + px * math.cos(a) - py * math.sin(a)), _w(cy + px * math.sin(a) + py * math.cos(a)))
                    for px, py in leaf]
            d.polygon(poly, fill=col)
        # 卷须
        cx, cy = x - 20, y + 26 * dirc
        sp = []
        for t in range(40):
            th = t / 39 * 4.2
            r = 16 * (1 - t / 45)
            sp.append((_w(cx + r * math.cos(th * dirc)), _w(cy + r * math.sin(th))))
        d.line(sp, fill=col, width=_w(3.5), joint="curve")
        # 小花
        fx, fy = x + 70, y - 30 * dirc
        for p in range(5):
            th = p / 5 * 2 * math.pi
            d.ellipse([_w(fx + 9 * math.cos(th) - 6), _w(fy + 9 * math.sin(th) - 6),
                       _w(fx + 9 * math.cos(th) + 6), _w(fy + 9 * math.sin(th) + 6)], fill=col)
    if lines:
        lc = _rgba(line_col or color)
        hline(d, 0.06 * H, lc, 6)
        hline(d, 0.11 * H, lc, 3)
        hline(d, 0.89 * H, lc, 3)
        hline(d, 0.94 * H, lc, 6)
    return k


def lace_band(atlas, color, scallops=24, holes=True):
    """蕾丝花边：下缘扇形 + 镂空圆点 + 小花。"""
    k, im, d = atlas.new_band()
    col = _rgba(color)
    H = BH
    per = BW / scallops
    for i in range(scallops):
        x0 = i * per
        d.pieslice([_w(x0), _w(H * 0.55), _w(x0 + per), _w(H * 0.97)], 0, 180, fill=col)
        d.ellipse([_w(x0 + per * 0.38), _w(H * 0.62), _w(x0 + per * 0.62), _w(H * 0.74)], fill=(0, 0, 0, 0))
        cx = x0 + per / 2
        for p in range(6):
            th = p / 6 * 2 * math.pi
            d.ellipse([_w(cx + 14 * math.cos(th) - 7), _w(H * 0.36 + 14 * math.sin(th) - 7),
                       _w(cx + 14 * math.cos(th) + 7), _w(H * 0.36 + 14 * math.sin(th) + 7)], fill=col)
    hline(d, H * 0.18, col, 8)
    hline(d, H * 0.52, col, 5)
    return k


def stripes_band(atlas, color, period=24, width=3, bg=None):
    k, im, d = atlas.new_band()
    if bg:
        d.rectangle([0, 0, BW * SS, BH * SS], fill=_rgba(bg))
    col = _rgba(color)
    x = 0.0
    while x < BW:
        d.rectangle([_w(x), 0, _w(x + width), BH * SS], fill=col)
        x += period
    return k


def lines_band(atlas, color, ys, widths):
    k, im, d = atlas.new_band()
    for y, w in zip(ys, widths):
        hline(d, y * BH, _rgba(color), w)
    return k


def stars_band(atlas, color, count=40, size=(10, 22), seed=5, line=None):
    k, im, d = atlas.new_band()
    R = random.Random(seed)
    col = _rgba(color)
    for i in range(count):
        x = R.uniform(0, BW)
        y = R.uniform(BH * 0.15, BH * 0.85)
        r = R.uniform(*size)
        pts = []
        for j in range(16):
            th = j / 16 * 2 * math.pi
            rr = r if j % 4 == 0 else (r * 0.22 if j % 2 == 0 else r * 0.32)
            pts.append((_w(x + rr * math.sin(th)), _w(y - rr * math.cos(th))))
        d.polygon(pts, fill=col)
    if line:
        hline(d, BH * 0.08, _rgba(line), 10)
    return k


def sun_band(atlas, color, count=4, r=90, rays=16, y=0.5):
    """Claude 的橙色太阳纹（放射线 + 圆心）。"""
    k, im, d = atlas.new_band()
    col = _rgba(color)
    for i in range(count):
        cx = (i + 0.5) * BW / count
        cy = BH * y
        for j in range(rays):
            th = j / rays * 2 * math.pi
            d.line([(_w(cx + r * 0.42 * math.cos(th)), _w(cy + r * 0.42 * math.sin(th))),
                    (_w(cx + r * math.cos(th)), _w(cy + r * math.sin(th)))], fill=col, width=_w(9))
        d.ellipse([_w(cx - r * 0.3), _w(cy - r * 0.3), _w(cx + r * 0.3), _w(cy + r * 0.3)], outline=col, width=_w(8))
        d.ellipse([_w(cx - r * 0.12), _w(cy - r * 0.12), _w(cx + r * 0.12), _w(cy + r * 0.12)], fill=col)
    return k


def knot_band(atlas, color, count=6, r=70, y=0.5, line=None):
    """六环扭结纹（简化）。"""
    k, im, d = atlas.new_band()
    col = _rgba(color)
    for i in range(count):
        cx = (i + 0.5) * BW / count
        cy = BH * y
        for p in range(6):
            th = p / 6 * 2 * math.pi
            ex = cx + r * 0.38 * math.cos(th)
            ey = cy + r * 0.38 * math.sin(th)
            d.ellipse([_w(ex - r * 0.55), _w(ey - r * 0.26), _w(ex + r * 0.55), _w(ey + r * 0.26)],
                      outline=col, width=_w(7))
    if line:
        hline(d, BH * 0.12, _rgba(line), 6)
        hline(d, BH * 0.88, _rgba(line), 6)
    return k


def scale_tile(path, line="#b9b2cf", fill=None, size=1024, rows=8, cols=8):
    """龙鳞平铺图（四方连续），单独一张。"""
    S = size * SS
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    lc = _rgba(line)
    cw, ch = S / cols, S / rows
    for r in range(-1, rows + 1):
        for c in range(-1, cols + 2):
            x = c * cw + (cw / 2 if r % 2 else 0)
            y = r * ch
            box = [x - cw * 0.55, y - ch * 0.2, x + cw * 0.55, y + ch * 1.1]
            if fill:
                d.pieslice(box, 0, 180, fill=_rgba(fill))
            d.arc(box, 0, 180, fill=lc, width=int(S * 0.006))
    im = im.resize((size, size), Image.LANCZOS)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path)
    return path


def knit_tile(path, line="#d9d6e6", size=512, cols=16):
    """针织罗纹（泡泡袜）。"""
    S = size * SS
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for c in range(cols):
        x = c * S / cols
        d.line([(x, 0), (x, S)], fill=_rgba(line, 200), width=int(S * 0.012))
    im = im.resize((size, size), Image.LANCZOS)
    im.save(path)
    return path
