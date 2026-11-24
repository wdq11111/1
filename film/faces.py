"""用 Pillow 程序化绘制表情贴图图集（眼睛 / 嘴巴），全部由脚本生成。

贴图覆盖头部正面 FACE_W×FACE_W 区域（头部局部坐标，米），布局取自 body.FACE。
图集 4×2 格，行优先，左上为 0 号。
"""
import math
import os

from PIL import Image, ImageDraw, ImageFilter, ImageChops

CELL = 1024
SS = 2
L = dict(FACE_W=0.160, FACE_Z0=-0.112, EYE_X=0.0315, EYE_Z=-0.021, EYE_HW=0.0178, EYE_HH=0.0215,
         MOUTH_Z=-0.070, NOSE_Z=-0.046, BLUSH_X=0.046, BLUSH_Z=-0.047)

EYE_CELLS = ["open", "happy", "surprised", "blink", "determined", "calm", "squeeze", "star"]
MOUTH_CELLS = ["smile", "open", "o", "flat", "cat", "wavy", "shout", "frown"]


def set_layout(**kw):
    L.update(kw)


def _hex(h, a=255):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


def _mix(c1, c2, t):
    return tuple(int(round(a + (b - a) * t)) for a, b in zip(c1, c2))


class Canvas:
    def __init__(self):
        self.S = CELL * SS
        self.img = Image.new("RGBA", (self.S, self.S), (0, 0, 0, 0))

    def px(self, x, z):
        u = 0.5 + x / L["FACE_W"]
        v = (z - L["FACE_Z0"]) / L["FACE_W"]
        return (u * self.S, (1 - v) * self.S)

    def m(self, d):
        return d / L["FACE_W"] * self.S

    def layer(self):
        return Image.new("RGBA", (self.S, self.S), (0, 0, 0, 0))

    def over(self, lay, mask=None):
        if mask is not None:
            lay.putalpha(ImageChops.multiply(lay.split()[3], mask))
        self.img = Image.alpha_composite(self.img, lay)

    def result(self):
        return self.img.resize((CELL, CELL), Image.LANCZOS)


def _catmull(ctrl, n=40):
    if len(ctrl) == 2:
        return [(ctrl[0][0] + (ctrl[1][0] - ctrl[0][0]) * i / (n - 1),
                 ctrl[0][1] + (ctrl[1][1] - ctrl[0][1]) * i / (n - 1)) for i in range(n)]
    P = [(2 * ctrl[0][0] - ctrl[1][0], 2 * ctrl[0][1] - ctrl[1][1])] + list(ctrl) + \
        [(2 * ctrl[-1][0] - ctrl[-2][0], 2 * ctrl[-1][1] - ctrl[-2][1])]
    segs = len(ctrl) - 1
    out = []
    for k in range(n):
        u = k / (n - 1) * segs
        i = min(int(u), segs - 1)
        t = u - i
        p0, p1, p2, p3 = P[i], P[i + 1], P[i + 2], P[i + 3]
        pt = []
        for d in range(2):
            pt.append(0.5 * ((2 * p1[d]) + (-p0[d] + p2[d]) * t
                             + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t * t
                             + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t ** 3))
        out.append(tuple(pt))
    return out


def stroke(draw, pts, wfn, color):
    n = len(pts)
    Lp, Rp = [], []
    for i in range(n):
        a = pts[max(i - 1, 0)]
        b = pts[min(i + 1, n - 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        ln = math.hypot(dx, dy) or 1.0
        nx, ny = -dy / ln, dx / ln
        w = wfn(i / (n - 1)) / 2
        Lp.append((pts[i][0] + nx * w, pts[i][1] + ny * w))
        Rp.append((pts[i][0] - nx * w, pts[i][1] - ny * w))
    draw.polygon(Lp + Rp[::-1], fill=color)
    for i in (0, n - 1):
        w = wfn(i / (n - 1)) / 2
        if w > 0.6:
            draw.ellipse([pts[i][0] - w, pts[i][1] - w, pts[i][0] + w, pts[i][1] + w], fill=color)


def _soft(cv, rgb, draw_fn, blur):
    m = Image.new("L", (cv.S, cv.S), 0)
    draw_fn(ImageDraw.Draw(m))
    if blur > 0:
        m = m.filter(ImageFilter.GaussianBlur(blur))
    lay = Image.new("RGBA", (cv.S, cv.S), tuple(rgb[:3]) + (0,))
    lay.putalpha(m)
    return lay


# ------------------------------------------------------------------ 眼睛

def _eye(cv, side, expr, iris_hex, lash_hex, st):
    """side=+1 为角色左眼（图像右侧）。st: 眼型参数 dict(w, h, tilt, lash, iris)。"""
    cx = side * L["EYE_X"]
    cz = L["EYE_Z"]
    HW = L["EYE_HW"] * st.get("w", 1.0)
    HH = L["EYE_HH"] * st.get("h", 1.0)
    tilt = st.get("tilt", 0.0)

    def P(ex, ey):
        ey2 = ey + tilt * ex
        return cv.px(cx + side * ex * HW, cz + ey2 * HH)

    lash = _hex(lash_hex)
    iris = _hex(iris_hex)
    iris_dark = _mix(iris, _hex(lash_hex), 0.62)
    iris_light = _mix(iris, (255, 255, 255, 255), 0.50)
    unit = cv.m(HH)
    lw = st.get("lash", 1.0)

    if expr in ("happy", "blink", "squeeze"):
        lay = cv.layer()
        d = ImageDraw.Draw(lay)
        if expr == "happy":
            pts = [P(*q) for q in _catmull([(-0.95, -0.32), (-0.45, 0.28), (0.25, 0.40), (1.0, -0.10)])]
            stroke(d, pts, lambda t: unit * (0.09 + 0.12 * math.sin(math.pi * t)) * lw, lash)
            pts = [P(*q) for q in _catmull([(0.92, -0.06), (1.22, 0.02)], 10)]
            stroke(d, pts, lambda t: unit * 0.09 * (1 - t) + 1, lash)
        elif expr == "blink":
            pts = [P(*q) for q in _catmull([(-1.0, 0.0), (-0.35, -0.32), (0.45, -0.30), (1.10, 0.08)])]
            stroke(d, pts, lambda t: unit * (0.05 + 0.15 * t) * lw, lash)
            for k, (a, b) in enumerate((((0.95, 0.02), (1.25, -0.10)), ((0.75, -0.12), (0.95, -0.32)))):
                stroke(d, [P(*q) for q in _catmull([a, b], 8)], lambda t: unit * 0.08 * (1 - t) + 1, lash)
        else:
            pts = _catmull([(0.95, 0.55), (-0.55, 0.0), (0.95, -0.50)], 30)
            stroke(d, [P(*q) for q in pts], lambda t: unit * 0.16 * lw, lash)
        cv.over(lay)
        return

    if expr == "surprised":
        up = [(-1.0, 0.05), (-0.55, 0.92), (0.15, 1.15), (0.75, 0.95), (1.08, 0.35)]
        lo = [(-1.0, 0.05), (-0.55, -0.80), (0.15, -1.02), (0.80, -0.62), (1.08, 0.35)]
        irx, iry, prx, pry, icz = 0.46, 0.64, 0.16, 0.24, 0.02
    elif expr == "calm":
        up = [(-1.0, 0.00), (-0.55, 0.42), (0.15, 0.52), (0.75, 0.42), (1.08, 0.22)]
        lo = [(-1.0, 0.00), (-0.55, -0.72), (0.15, -0.96), (0.80, -0.60), (1.08, 0.22)]
        irx, iry, prx, pry, icz = 0.62, 0.88, 0.26, 0.42, -0.14
    elif expr == "determined":
        up = [(-1.0, 0.18), (-0.55, 0.55), (0.15, 0.68), (0.75, 0.62), (1.08, 0.40)]
        lo = [(-1.0, 0.10), (-0.55, -0.70), (0.15, -0.92), (0.80, -0.55), (1.08, 0.40)]
        irx, iry, prx, pry, icz = 0.62, 0.88, 0.26, 0.40, -0.10
    else:
        up = [(-1.0, 0.05), (-0.58, 0.74), (0.12, 0.98), (0.72, 0.80), (1.08, 0.30)]
        lo = [(-1.0, 0.05), (-0.55, -0.76), (0.15, -0.98), (0.80, -0.60), (1.08, 0.30)]
        irx, iry, prx, pry, icz = 0.66, 0.92, 0.30, 0.46, -0.08
    irx *= st.get("iris", 1.0); iry *= st.get("iris", 1.0)
    up_pts = _catmull(up, 60)
    lo_pts = _catmull(lo, 60)
    poly = [P(*q) for q in up_pts] + [P(*q) for q in lo_pts[::-1]]
    mask = Image.new("L", (cv.S, cv.S), 0)
    ImageDraw.Draw(mask).polygon(poly, fill=255)

    # 眼白 + 上缘投影
    lay = cv.layer()
    ImageDraw.Draw(lay).polygon(poly, fill=_hex("#fbfbff"))
    sh = _soft(cv, _hex("#c9c0e2"), lambda d: d.polygon(
        [P(*q) for q in up_pts] + [P(x, y - 0.38) for x, y in up_pts[::-1]], fill=255), unit * 0.08)
    lay = Image.alpha_composite(lay, sh)
    cv.over(lay, mask)

    # 虹膜
    ix0, iy0 = P(-irx, icz + iry)
    ix1, iy1 = P(irx, icz - iry)
    x0, x1 = min(ix0, ix1), max(ix0, ix1)
    y0, y1 = min(iy0, iy1), max(iy0, iy1)
    imask = Image.new("L", (cv.S, cv.S), 0)
    ImageDraw.Draw(imask).ellipse([x0, y0, x1, y1], fill=255)
    grad = Image.new("RGBA", (1, 256))
    for k in range(256):
        t = k / 255
        c = _mix(iris_dark, iris, t / 0.42) if t < 0.42 else _mix(iris, iris_light, (t - 0.42) / 0.58)
        grad.putpixel((0, k), c)
    grad = grad.resize((int(x1 - x0) + 2, int(y1 - y0) + 2))
    il = cv.layer()
    il.paste(grad, (int(x0), int(y0)))
    il.putalpha(imask)
    d = ImageDraw.Draw(il)
    pcx, pcy = P(0.0, icz + 0.04)
    # 放射纹
    for k in range(28):
        th = k / 28 * 2 * math.pi
        r0, r1 = 0.32, 0.88
        a_ = (pcx + math.cos(th) * (x1 - x0) / 2 * r0, pcy + math.sin(th) * (y1 - y0) / 2 * r0)
        b_ = (pcx + math.cos(th) * (x1 - x0) / 2 * r1, pcy + math.sin(th) * (y1 - y0) / 2 * r1)
        col = _mix(iris_light, (255, 255, 255, 255), 0.2)[:3] + (60,) if k % 2 else iris_dark[:3] + (70,)
        d.line([a_, b_], fill=col, width=max(2, int(unit * 0.025)))
    # 上方暗影
    top = _soft(cv, iris_dark, lambda dd: dd.ellipse([x0, y0 - (y1 - y0) * 0.05, x1, y0 + (y1 - y0) * 0.45], fill=200),
                unit * 0.06)
    il = Image.alpha_composite(il, top)
    il.putalpha(ImageChops.multiply(il.split()[3], imask))
    d = ImageDraw.Draw(il)
    pw, ph = (x1 - x0) / 2 * prx / irx, (y1 - y0) / 2 * pry / iry
    d.ellipse([pcx - pw, pcy - ph, pcx + pw, pcy + ph], fill=_mix(iris_dark, (15, 8, 25, 255), 0.55))
    d.ellipse([x0, y0, x1, y1], outline=_mix(iris_dark, (25, 15, 35, 255), 0.45), width=int(unit * 0.065))
    # 下半亮弧
    hx0, hy0 = P(-irx * 0.62, icz - iry * 0.12)
    hx1, hy1 = P(irx * 0.62, icz - iry * 0.88)
    hl = _soft(cv, _mix(iris_light, (255, 255, 255, 255), 0.25), lambda dd: dd.ellipse(
        [min(hx0, hx1), min(hy0, hy1), max(hx0, hx1), max(hy0, hy1)], fill=165), unit * 0.10)
    il = Image.alpha_composite(il, hl)
    d = ImageDraw.Draw(il)
    if expr == "star":
        sx, sy = P(-0.02, icz + 0.08)
        r1, r2 = unit * 0.55, unit * 0.11
        pts = []
        for k in range(8):
            ang = k * math.pi / 4
            r = r1 if k % 2 == 0 else r2
            pts.append((sx + r * math.sin(ang), sy - r * math.cos(ang)))
        d.polygon(pts, fill=(255, 255, 255, 255))
        hx, hy = P(0.38, icz - 0.5)
        r = unit * 0.10
        d.ellipse([hx - r, hy - r, hx + r, hy + r], fill=(255, 255, 255, 255))
    else:
        hx, hy = P(-0.26, icz + 0.40)
        r = unit * (0.21 if expr != "surprised" else 0.14)
        d.ellipse([hx - r * 0.9, hy - r * 1.15, hx + r * 0.9, hy + r * 1.15], fill=(255, 255, 255, 252))
        hx, hy = P(0.34, icz - 0.46)
        r = unit * 0.085
        d.ellipse([hx - r, hy - r, hx + r, hy + r], fill=(255, 255, 255, 235))
        hx, hy = P(0.18, icz + 0.50)
        r = unit * 0.05
        d.ellipse([hx - r, hy - r, hx + r, hy + r], fill=(255, 255, 255, 200))
    cv.over(il, mask)

    # 上睫毛（外侧粗）+ 眼尾 + 睫毛尖
    lay = cv.layer()
    d = ImageDraw.Draw(lay)
    stroke(d, [P(*q) for q in up_pts], lambda t: unit * (0.06 + 0.21 * t ** 1.3) * lw, lash)
    ox, oy = up[-1]
    wing = _catmull([(ox - 0.18, oy + 0.08), (ox + 0.12, oy + 0.10), (ox + 0.30, oy + 0.24)], 14)
    stroke(d, [P(*q) for q in wing], lambda t: unit * (0.20 * (1 - t) + 0.02) * lw, lash)
    for k, (bx_, by_, ex_, ey_) in enumerate(((0.80, 0.62, 1.05, 0.80), (0.60, 0.80, 0.78, 1.02),
                                              (0.95, 0.42, 1.22, 0.50))):
        stroke(d, [P(*q) for q in _catmull([(bx_, by_), (ex_, ey_)], 8)], lambda t: unit * 0.09 * (1 - t) * lw + 1, lash)
    lp = [P(*q) for q in lo_pts[36:58]]
    stroke(d, lp, lambda t: unit * (0.02 + 0.055 * math.sin(math.pi * t)), _mix(lash, (255, 255, 255, 255), 0.2))
    cr = [(x * 0.9 + 0.05, y + 0.22) for x, y in up[1:4]]
    stroke(d, [P(*q) for q in _catmull(cr, 20)], lambda t: unit * 0.035 * math.sin(math.pi * t) + 0.5,
           _mix(lash, (255, 220, 210, 255), 0.45)[:3] + (190,))
    cv.over(lay)


def _brow(cv, side, expr, col, st):
    cx = side * L["EYE_X"]
    HW = L["EYE_HW"] * st.get("w", 1.0)
    HH = L["EYE_HH"] * st.get("h", 1.0)

    def P(ex, ey):
        return cv.px(cx + side * ex * HW, L["EYE_Z"] + ey * HH)
    if expr == "surprised":
        ctrl = [(-0.75, 1.75), (0.1, 2.00), (0.95, 1.80)]
    elif expr == "determined":
        ctrl = [(-0.80, 1.30), (0.05, 1.50), (0.95, 1.62)]
    elif expr == "squeeze":
        ctrl = [(-0.80, 1.35), (0.05, 1.62), (0.95, 1.45)]
    elif expr == "calm":
        ctrl = [(-0.75, 1.45), (0.1, 1.58), (0.95, 1.42)]
    else:
        ctrl = [(-0.75, 1.55), (0.1, 1.72), (0.95, 1.55)]
    lay = cv.layer()
    d = ImageDraw.Draw(lay)
    unit = cv.m(HH)
    stroke(d, [P(*q) for q in _catmull(ctrl, 30)], lambda t: unit * (0.085 * math.sin(math.pi * (0.15 + 0.7 * t))), col)
    cv.over(lay)


def _blush(cv, strength=1.0, lines=False):
    def dr(d):
        for side in (-1, 1):
            x, y = cv.px(side * L["BLUSH_X"], L["BLUSH_Z"])
            rx, ry = cv.m(0.017), cv.m(0.0075)
            d.ellipse([x - rx, y - ry, x + rx, y + ry], fill=int(min(255, 100 * strength)))
    lay = _soft(cv, (255, 125, 150), dr, cv.m(0.005))
    if lines:
        d = ImageDraw.Draw(lay)
        for side in (-1, 1):
            for k in range(3):
                x, y = cv.px(side * (L["BLUSH_X"] - 0.008 + k * 0.006), L["BLUSH_Z"] + 0.001)
                d.line([(x + cv.m(0.0025), y - cv.m(0.0035)), (x - cv.m(0.0015), y + cv.m(0.0035))],
                       fill=(230, 90, 110, 200), width=max(2, int(cv.m(0.001))))
    cv.over(lay)


def eye_atlas(path, iris_r, iris_l, lash, brow, blush=1.0, style=None):
    st = style or {}
    atlas = Image.new("RGBA", (CELL * 4, CELL * 2), (0, 0, 0, 0))
    for k, expr in enumerate(EYE_CELLS):
        cv = Canvas()
        _blush(cv, blush * (1.5 if expr in ("happy", "squeeze") else 1.0), lines=expr in ("happy", "squeeze", "star"))
        for side, ic in ((-1, iris_r), (1, iris_l)):
            _eye(cv, side, expr, ic, lash, st)
            _brow(cv, side, expr, _hex(brow), st)
        atlas.paste(cv.result(), ((k % 4) * CELL, (k // 4) * CELL))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    atlas.save(path)
    return path


# ------------------------------------------------------------------ 嘴

def mouth_atlas(path, line="#6b2a2e", inner="#9a3440", tongue="#f08a96", nose="#d99a8c"):
    atlas = Image.new("RGBA", (CELL * 4, CELL * 2), (0, 0, 0, 0))
    lc, ic, tc = _hex(line), _hex(inner), _hex(tongue)
    for k, expr in enumerate(MOUTH_CELLS):
        cv = Canvas()
        lay = cv.layer()
        d = ImageDraw.Draw(lay)
        u = cv.m(0.001)
        z = L["MOUTH_Z"]
        sc = 0.8

        def P(x, zz):
            return cv.px(x * sc, z + zz * sc)
        nz = L["NOSE_Z"]
        stroke(d, _catmull([cv.px(0.0028, nz + 0.002), cv.px(0.0008, nz - 0.002)], 8), lambda t: u * 1.0 * (1 - t) + 1,
               _hex(nose))
        if expr == "smile":
            pts = [P(*q) for q in _catmull([(-0.011, 0.003), (0, -0.003), (0.011, 0.003)], 30)]
            stroke(d, pts, lambda t: u * (0.7 + 0.8 * math.sin(math.pi * t)), lc)
        elif expr in ("open", "shout"):
            big = expr == "shout"
            top = _catmull([(-0.014 if big else -0.013, 0.005 if big else 0.004), (0, 0.0028),
                            (0.014 if big else 0.013, 0.005 if big else 0.004)], 20)
            bot = _catmull([(0.014 if big else 0.013, 0.005 if big else 0.004), (0.008 if big else 0.006, -0.014 if big else -0.010),
                            (-0.008 if big else -0.006, -0.014 if big else -0.010), (-0.014 if big else -0.013, 0.005 if big else 0.004)], 30)
            poly = [P(*q) for q in top + bot]
            d.polygon(poly, fill=ic)
            tl = cv.layer()
            dd = ImageDraw.Draw(tl)
            dd.ellipse([P(-0.0085, -0.004)[0], P(0, -0.004)[1], P(0.0085, -0.017 if big else -0.013)[0],
                        P(0, -0.017 if big else -0.013)[1]], fill=tc)
            if big:
                dd.polygon([P(-0.012, 0.0045), P(0.012, 0.0045), P(0.011, 0.0015), P(-0.011, 0.0015)],
                           fill=(255, 255, 255, 255))
            m_ = Image.new("L", (cv.S, cv.S), 0)
            ImageDraw.Draw(m_).polygon(poly, fill=255)
            tl.putalpha(ImageChops.multiply(tl.split()[3], m_))
            lay = Image.alpha_composite(lay, tl)
            d = ImageDraw.Draw(lay)
            d.line(poly + [poly[0]], fill=lc, width=int(u * 0.9), joint="curve")
        elif expr == "o":
            x0, y0 = P(-0.005, 0.004)
            x1, y1 = P(0.005, -0.008)
            d.ellipse([x0, y0, x1, y1], fill=ic, outline=lc, width=int(u * 0.9))
        elif expr == "flat":
            stroke(d, [P(*q) for q in _catmull([(-0.007, 0.0), (0.007, 0.0005)], 10)], lambda t: u * 1.1, lc)
        elif expr == "cat":
            pts = [P(*q) for q in _catmull([(-0.012, 0.003), (-0.006, -0.0028), (0, 0.0015),
                                            (0.006, -0.0028), (0.012, 0.003)], 40)]
            stroke(d, pts, lambda t: u * 1.1, lc)
        elif expr == "wavy":
            pts = [P(-0.012 + 0.024 * i / 39, 0.0016 * math.sin(i / 39 * math.pi * 3)) for i in range(40)]
            stroke(d, pts, lambda t: u * 1.0, lc)
        elif expr == "frown":
            pts = [P(*q) for q in _catmull([(-0.008, -0.0018), (0, 0.0016), (0.008, -0.0018)], 30)]
            stroke(d, pts, lambda t: u * (0.7 + 0.7 * math.sin(math.pi * t)), lc)
        cv.over(lay)
        atlas.paste(cv.result(), ((k % 4) * CELL, (k // 4) * CELL))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    atlas.save(path)
    return path
