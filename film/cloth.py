"""服装与饰品：裙（褶/垂坠/开衩/不对称下摆/里衬）、荷叶边、袖、蝴蝶结、花、宝石星、扭结、链、流苏、鞋靴。"""
import math
import random

from mathutils import Vector, Matrix

import core
from core import V, C, TAU, Geo, lerp, mixc, sstep, clamp, adist, piecewise, loft, tube, ellipsoid, \
    bezier_pts, resample, flat_shape, star_outline, ellipse_ring, rings_to_geo, place, smooth_pts
from body import torso_at, mirror, arm_path, leg_path, AN, TOE, WR, EL, SH, I_CLOTH, I_GLOW


def env(collider, z):
    """碰撞包络在 z 处的最大椭圆 (rx, ry, cy)。"""
    rx, ry, cy = torso_at(z) if 0.82 <= z <= 1.36 else (0.0, 0.0, 0.0)
    for z_lo, z_hi, fn, k in collider.layers[1:]:
        if z_lo <= z <= z_hi:
            a, b, c = fn(z)
            rx, ry = max(rx, a), max(ry, b)
            cy = c
    return rx, ry, cy


def skirt_weights(z_top, z_bot, thigh):
    def wfn(p):
        depth = clamp((z_top - p.z) / max(z_top - z_bot, 1e-6))
        wt = thigh * depth ** 1.3
        fl = 0.5 + 0.5 * clamp(p.x / (abs(p.x) + 0.04), -1, 1)
        out = {"hips": 1 - wt, "thigh.L": wt * fl, "thigh.R": wt * (1 - fl)}
        if p.z > 1.03:
            k = sstep(1.03, 1.10, p.z)
            out = {"spine": k, "hips": 1 - k}
        return out
    return wfn


def skirt(acc, rig, collider, color, mat, z_top, z_bot, top_r, bot_r, *, n=160, rows=32, folds=(),
          pleats=0, pleat_amp=0.0, hem_wave=0.0, hem_freq=14, back_flare=0.0, bell=0.6, cut=None,
          thigh=0.5, lining=None, uvp=None, register=True, hem_fn=None, ol=1.0, margin=0.010, cy_off=0.0,
          front_flat=0.0):
    """folds: [(频率, 幅度, 相位)] 柔和垂坠褶；pleats: 规则百褶数。hem_fn(a)→下摆额外下垂（米，负数=更短）。"""
    rings, cents = [], []
    max_amp = sum(abs(f[1]) for f in folds) + pleat_amp + hem_wave
    for i in range(rows + 1):
        t = i / rows
        tt = 1 - (1 - t) ** (1 + bell)
        ring = []
        zc = lerp(z_top, z_bot, t)
        for j in range(n):
            a = j / n
            zb = z_bot + (hem_fn(a) if hem_fn else 0.0)
            z = lerp(z_top, zb, t)
            rx = lerp(top_r[0], bot_r[0], tt)
            ry = lerp(top_r[1], bot_r[1], tt)
            erx, ery, ecy = env(collider, z)
            rx = max(rx, erx + margin)
            ry = max(ry, ery + margin)
            dep = sstep(0.0, 0.6, t)
            k = 1.0
            for fq, am, ph in folds:
                k += am * dep * math.sin(a * TAU * fq + ph)
            if pleats:
                tri = math.asin(math.sin(a * TAU * pleats)) / (math.pi / 2)
                k += pleat_amp * dep * tri
            k += hem_wave * sstep(0.55, 1.0, t) * math.sin(a * TAU * hem_freq)
            k *= 1 + back_flare * t * max(0.0, -math.cos(a * TAU))
            if front_flat:
                k *= 1 - front_flat * t * max(0.0, math.cos(a * TAU)) ** 2
            th = a * TAU
            cyv = ecy * 0.5 + cy_off
            ring.append(V((rx * k * math.sin(th), cyv - ry * k * math.cos(th), z)))
        rings.append(ring)
        cents.append(V((0, cy_off, zc)))
    g = rings_to_geo(rings, True, centers=cents)
    if cut:
        g.keep(lambda s, a, c: not cut(a, s))
    w = skirt_weights(z_top, z_bot, thigh)
    acc.add(g, color, mat=mat, weights=w, uvp=uvp, ol=ol)
    if lining is not None:
        rings2 = [[c + (p - c) * 0.985 for p in r] for r, c in zip(rings, cents)]
        g2 = rings_to_geo(rings2, True, centers=cents)
        g2.flip()
        if cut:
            g2.keep(lambda s, a, c: not cut(a, s))
        acc.add(g2, lining, mat=mat, weights=w, ol=0.0)
    if register:
        def fn(z, z_top=z_top, z_bot=z_bot):
            t = clamp((z_top - z) / max(z_top - z_bot, 1e-6))
            tt = 1 - (1 - t) ** (1 + bell)
            erx, ery, ecy = torso_at(z) if z > 0.82 else (0, 0, 0)
            rx = max(lerp(top_r[0], bot_r[0], tt), erx + margin) * (1 + max_amp)
            ry = max(lerp(top_r[1], bot_r[1], tt), ery + margin) * (1 + max_amp) * (1 + back_flare * t)
            return rx, ry, cy_off
        collider.add(z_bot - 0.05, z_top, fn)
    return rings


def frill_ring(acc, color, mat, z, rx, ry, drop, flare, waves=24, amp=0.25, rows=6, n=240, cy=0.0,
               weights=None, a_range=None, ol=0.6, zwave=0.35, lining=None):
    """一圈（或一段）荷叶边：从 (rx,ry) 往下 drop、往外 flare，波浪随距离变大。"""
    rings, cents = [], []
    for i in range(rows + 1):
        t = i / rows
        ring = []
        for j in range(n):
            a = lerp(a_range[0], a_range[1], j / (n - 1)) if a_range else j / n
            th = a * TAU
            w = math.sin(a * TAU * waves)
            r = 1.0 + (flare * t) / max(rx, 1e-3) + amp * t ** 1.2 * w
            zz = z - drop * t + zwave * drop * t * math.cos(a * TAU * waves) * 0.5
            ring.append(V((rx * r * math.sin(th), cy - ry * r * math.cos(th), zz)))
        rings.append(ring)
        cents.append(V((0, cy, z - drop * t)))
    g = rings_to_geo(rings, closed=a_range is None, centers=cents)
    acc.add(g, color, mat=mat, weights=weights, ol=ol)
    if lining is not None:
        g2 = rings_to_geo([[c + (p - c) * 0.99 for p in r] for r, c in zip(rings, cents)], closed=a_range is None,
                          centers=cents)
        g2.flip()
        acc.add(g2, lining, mat=mat, weights=weights, ol=0.0)
    return rings


def frill_along(acc, color, mat, pts, down, width, waves=10, amp=0.3, rows=5, weights=None, ol=0.6,
                normal_fn=None, scallop=0.0):
    """沿曲线的荷叶边：每点往 down(p) 方向长出 width，并沿法线方向起伏。"""
    pts = [V(p) for p in pts]
    m = len(pts)
    rings = []
    for i in range(rows + 1):
        t = i / rows
        ring = []
        for j, p in enumerate(pts):
            dvec = down(p) if callable(down) else V(down)
            nrm = normal_fn(p) if normal_fn else V((0, -1, 0))
            u = j / (m - 1)
            wv = math.sin(u * TAU * waves)
            wk = 1.0 - scallop * (1.0 - abs(math.sin(u * math.pi * waves))) ** 2 * t ** 3
            ring.append(p + dvec * (width * t * wk) + nrm * (amp * width * t * wv))
        rings.append(ring)
    g = rings_to_geo(rings, closed=False, orient=False)
    nf = normal_fn or (lambda p: V((0, -1, 0)))
    flip = []
    for i, f in enumerate(g.f):
        vs = [g.v[k] for k in f]
        fc = sum(vs, V()) / len(vs)
        if core._face_normal(vs).dot(nf(fc)) < 0:
            flip.append(i)
    g.flip(flip)
    acc.add(g, color, mat=mat, weights=weights, ol=ol)


def sleeve(acc, rig, side, color, mat, *, s0=0.3, s1=1.0, r_fn=None, hang=None, out=0.0, back=0.0, wave=0.0,
           freq=10, lining=None, n=48, uvp=None, ol=1.0, extra=None):
    """沿手臂的袖子。r_fn(t)→半径（t: 0 袖口上端 → 1 下端）。
    hang=(z_end, 张开半径) 时，袖子过了手腕继续往下垂成喇叭袖。"""
    sn = "L" if side > 0 else "R"
    ap = arm_path(side, 40)
    i0 = int(s0 * (len(ap) - 1))
    i1 = int(s1 * (len(ap) - 1))
    pts = ap[i0:i1 + 1]
    if hang:
        z_end, _r = hang
        w = mirror(WR, side)
        d = (w - mirror(EL, side)).normalized()
        end = V((w.x + out * side, w.y + back, z_end))
        mid = w + d * 0.06
        pts = pts + resample(bezier_pts([pts[-1], mid, end], 30), 16)[1:]
    pts = resample(smooth_pts(pts, 2), 30)
    radii = [r_fn(i / (len(pts) - 1)) for i in range(len(pts))]
    rfn = (lambda s, a: 1 + wave * sstep(0.7, 1.0, s) * math.sin(a * TAU * freq)) if wave else None
    g = tube(pts, radii, n=n, up_hint=V((0, -1, 0)), cap_start=False, cap_end=False, rfn=rfn)
    wf = rig.w_chain([f"upper_arm.{sn}", f"forearm.{sn}", f"hand.{sn}"], blend=0.05)

    def wfn(p):
        w = wf(p)
        if "hand." + sn in w:   # 垂下来的袖口跟前臂走
            w[f"forearm.{sn}"] = w.get(f"forearm.{sn}", 0) + w.pop(f"hand.{sn}")
        return w
    acc.add(g, color, mat=mat, weights=wfn, uvp=uvp, ol=ol)
    if lining is not None:
        gi = tube(pts, [r * 0.965 if not isinstance(r, tuple) else (r[0] * 0.965, r[1] * 0.965) for r in radii],
                  n=n, up_hint=V((0, -1, 0)), cap_start=False, cap_end=False, rfn=rfn)
        gi.flip()
        acc.add(gi, lining, mat=mat, weights=wfn, ol=0.0)
    return pts, radii


def bow(acc, center, normal, size, col, mat, weights, tails=True, up=V((0, 0, 1)), ol=0.8, tail_len=1.0,
        tail_col=None, knot_col=None):
    """蝴蝶结：两个捏褶环 + 结 + 两条 V 口飘带。局部 X 为左右。"""
    M = place(center, normal, up)
    for sx in (-1, 1):
        def dfm(u, sx=sx):
            pinch = 0.35 + 0.65 * (abs(u.x * sx + 1) / 2) ** 0.7
            return V((u.x, u.y * (0.6 + 0.4 * pinch), u.z * pinch))
        loop = ellipsoid(V((sx * size * 0.56, 0, size * 0.04)), size * 0.58, size * 0.20, size * 0.42, nu=24,
                         nv=14, deform=dfm)
        acc.add(loop.transformed(M), col, mat=mat, weights=weights, ol=ol)
        if tails:
            L_ = size * 1.1 * tail_len
            tp = [V((sx * size * 0.08, 0, -size * 0.10)), V((sx * size * 0.30, -size * 0.06, -L_ * 0.55)),
                  V((sx * size * 0.42, 0, -L_))]
            pts = bezier_pts(tp, 12)
            radii = [(size * lerp(0.16, 0.24, i / 11), size * 0.045) for i in range(12)]
            tg = tube(pts, radii, n=8, out_fn=lambda p, t: V((0, -1, 0)), cap_start=True, cap_end=True)
            acc.add(tg.transformed(M), tail_col or col, mat=mat, weights=weights, ol=ol)
    knot = ellipsoid(V((0, -size * 0.06, 0)), size * 0.18, size * 0.17, size * 0.26, nu=16, nv=10)
    acc.add(knot.transformed(M), knot_col or col, mat=mat, weights=weights, ol=ol)


def flower(acc, center, normal, radius, petals, col, center_col, mat, weights, up=V((0, 0, 1)), thin=0.28,
           ol=0.6, layers=2, cup=0.25):
    """菊花样的花：两层细长花瓣（略成碗状）+ 圆鼓花心。"""
    M = place(center, normal, up)
    for layer in range(layers):
        rr = radius * (1.0 - 0.28 * layer)
        off = (0.5 / petals) * layer
        for k in range(petals):
            ang = (k / petals + off) * TAU
            d = V((math.sin(ang), 0, math.cos(ang)))
            p = ellipsoid(V((0, 0, 0)), rr * thin * 0.5, rr * 0.06, rr * 0.5, nu=12, nv=8,
                          deform=lambda u: V((u.x * (0.55 + 0.45 * (1 - abs(u.z))), u.y, u.z)))
            R = Matrix.Rotation(-ang, 4, "Y")
            T = Matrix.Translation(d * rr * 0.52 + V((0, rr * cup * 0.4 - layer * rr * 0.08, 0)))
            tilt = Matrix.Rotation(-cup, 4, V((math.cos(ang), 0, -math.sin(ang))))
            pc = mixc(col, center_col, 0.15 * layer)
            acc.add(p.transformed(M @ T @ tilt @ R), pc, mat=mat, weights=weights, ol=ol)
    c = ellipsoid(V((0, -radius * 0.10, 0)), radius * 0.24, radius * 0.16, radius * 0.24, nu=16, nv=10)
    acc.add(c.transformed(M), center_col, mat=mat, weights=weights, ol=ol)


def star_gem(acc, center, normal, r, cols, mat, weights=None, up=V((0, 0, 1)), depth=0.35, ol=0.0, rot=0.0,
             concave=0.38, rim=None):
    """立体四角星（宝石切面）：正反两面金字塔，每个切面一种颜色（彩虹渐变）。"""
    M = place(center, normal, up)
    outline = star_outline(4, r, r * 0.26, rot=rot, sub=6, concave=concave)
    n = len(outline)
    verts = [V((x, 0, z)) for x, z in outline] + [V((0, -r * depth, 0)), V((0, r * depth * 0.6, 0))]
    faces, fp = [], []
    for j in range(n):
        j2 = (j + 1) % n
        faces.append((n, j2, j)); fp.append((0.0, j / n))
        faces.append((n + 1, j, j2)); fp.append((1.0, j / n))
    g = Geo(verts, faces, fp)
    nn = core._face_normal([verts[i] for i in faces[0]])
    if nn.y > 0:
        g.flip()
    cl = list(cols)

    def colfn(s, a, fc):
        k = (a * 8) % len(cl)
        i = int(k)
        return mixc(cl[i], cl[(i + 1) % len(cl)], k - i) if s < 0.5 else mixc(cl[(i + 2) % len(cl)], cl[i], 0.5)
    acc.add(g.transformed(M), colfn, mat=mat, weights=weights, ol=ol, smooth=False)
    if rim is not None:
        pts = [V((x, -0.0005, z)) for x, z in outline] + [V((outline[0][0], -0.0005, outline[0][1]))]
        tg = tube(pts, [r * 0.035] * len(pts), n=6, cap_start=False, cap_end=False)
        acc.add(tg.transformed(M), rim, mat=I_CLOTH, weights=weights, ol=0.3)


def rosette(acc, center, normal, r, col, mat, weights, up=V((0, 0, 1)), ol=0.5, tube_r=0.075):
    """六瓣环结（扭结标志的简化）：6 个圆角长环交叠旋转。"""
    M = place(center, normal, up)
    for k in range(6):
        ang = k / 6 * TAU
        loop = []
        L_, W_ = r * 0.62, r * 0.21
        for i in range(33):
            t = i / 32 * TAU
            x = W_ * math.cos(t)
            z = L_ * 0.5 * math.sin(t) + r * 0.33
            y = -r * 0.04 * math.sin(t + ang)   # 上下穿插
            loop.append(V((x + r * 0.16, y, z)))
        R = Matrix.Rotation(-ang, 4, "Y")
        g = tube(loop, [r * tube_r] * len(loop), n=8, out_fn=lambda p, t: V((0, -1, 0)), cap_start=False,
                 cap_end=False)
        acc.add(g.transformed(M @ R), col, mat=mat, weights=weights, ol=ol)


def chain(acc, pts, bead_r, col, mat, weights, n_beads=None, links=True):
    pts = resample([V(p) for p in pts], n_beads or 20)
    for i, p in enumerate(pts):
        if links:
            d = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
            up = V((0, 0, 1)) if abs(d.z) < 0.9 else V((1, 0, 0))
            side = d.cross(up).normalized()
            if i % 2:
                side = d.cross(side).normalized()
            ring = [p + d * bead_r * 1.3 * math.cos(t) + side * bead_r * 0.8 * math.sin(t)
                    for t in [k / 12 * TAU for k in range(13)]]
            acc.add(tube(ring, [bead_r * 0.28] * 13, n=6, cap_start=False, cap_end=False), col, mat=mat,
                    weights=weights, ol=0.0)
        else:
            acc.add(ellipsoid(p, bead_r, bead_r, bead_r, nu=10, nv=6), col, mat=mat, weights=weights, ol=0.0)


def tassel(acc, top, length, r, col, cap_col, mat, weights, strands=10, dirv=V((0, 0, -1))):
    dirv = V(dirv).normalized()
    acc.add(ellipsoid(top, r * 0.8, r * 0.8, r * 1.0, nu=12, nv=8), cap_col, mat=mat, weights=weights, ol=0.4)
    up = V((1, 0, 0)) if abs(dirv.x) < 0.9 else V((0, 1, 0))
    s1 = dirv.cross(up).normalized()
    s2 = dirv.cross(s1).normalized()
    for k in range(strands):
        th = k / strands * TAU
        o = s1 * math.cos(th) * r * 0.6 + s2 * math.sin(th) * r * 0.6
        p0 = top + dirv * r * 0.5 + o
        p1 = p0 + dirv * length + o * 0.5
        acc.add(tube([p0, p0.lerp(p1, 0.5), p1], [r * 0.22, r * 0.2, r * 0.12], n=5), col, mat=mat,
                weights=weights, ol=0.3)
    acc.add(tube([top + dirv * r * 0.6, top + dirv * r * 1.0], [r * 0.85, r * 0.85], n=12), cap_col, mat=mat,
            weights=weights, ol=0.3)


def button(acc, center, normal, r, col, mat, weights):
    g = ellipsoid(V((0, 0, 0)), r, r * 0.45, r, nu=14, nv=8)
    acc.add(g.transformed(place(center, normal)), col, mat=mat, weights=weights, ol=0.35)


def trim_ring(acc, ring_pts, r, col, mat, weights, closed=True, ol=0.4):
    pts = list(ring_pts) + ([ring_pts[0]] if closed else [])
    acc.add(tube(pts, [r] * len(pts), n=6, cap_start=not closed, cap_end=not closed), col, mat=mat,
            weights=weights, ol=ol)


# ------------------------------------------------------------------ 鞋

def shoe(acc, rig, side, col, mat, *, heel=0.015, platform=0.0, toe_round=1.0, sole_col=None, length=0.19,
         width=0.040, height=0.050, strap_col=None, uvp=None, boot_top=None, boot_col=None, boot_uvp=None,
         extra_leg=0.006):
    """鞋：沿脚长放样（后跟 → 鞋头），鞋底随鞋跟高度弯成足弓。"""
    sn = "L" if side > 0 else "R"
    a = mirror(AN, side)
    x0 = a.x + 0.002 * side
    y_back = a.y + 0.045
    y_toe = y_back - length
    W = {f"foot.{sn}": 1.0}
    rings, cents = [], []
    N = 26
    sole_h = lambda u: platform + heel * (1 - sstep(0.30, 0.72, u))   # u: 0 后跟 → 1 鞋头
    for i in range(N + 1):
        u = i / N
        y = lerp(y_back, y_toe, u)
        hw = width * (0.62 + 0.38 * math.sin(min(1, u * 1.25) * math.pi * 0.62)) * (1 - 0.35 * sstep(0.85, 1.0, u) * toe_round)
        top = height * (1.05 - 0.45 * sstep(0.35, 0.95, u)) * (1 - 0.6 * sstep(0.92, 1.0, u))
        zb = sole_h(u)
        ring = []
        for j in range(32):
            th = j / 32 * TAU
            cx = math.sin(th)
            cz = -math.cos(th)
            zz = zb + top * 0.5 + cz * top * 0.5
            # 底面压平
            if cz < -0.3:
                zz = zb + (1 + cz) * 0.4 * top * 0.5 / 0.7 * 0.7
            ring.append(V((x0 + hw * cx * (1 - 0.15 * max(0, cz)), y, zz)))
        rings.append(ring)
        cents.append(V((x0, y, zb + top * 0.5)))
    g = rings_to_geo(rings, True, cap_start=True, cap_end=True, centers=cents)
    acc.add(g, col, mat=mat, weights=W, ol=0.8, uvp=uvp)
    if heel > 0.02:
        hg = loft([(0.0, 0.012, 0.014, y_back - 0.022, x0), (heel * 0.5, 0.013, 0.016, y_back - 0.020, x0),
                   (heel + 0.004, 0.018, 0.022, y_back - 0.018, x0)], n=16, cap_start=True, cap_end=True)
        acc.add(hg, sole_col or col, mat=mat, weights=W, ol=0.6)
    if platform > 0:
        pg_rings = []
        cents = []
        for i in range(N + 1):
            u = i / N
            y = lerp(y_back + 0.004, y_toe - 0.006, u)
            hw = width * 1.08 * (0.70 + 0.30 * math.sin(min(1, u * 1.25) * math.pi * 0.62)) * (1 - 0.3 * sstep(0.85, 1.0, u))
            pg_rings.append([V((x0 + hw * math.sin(t), y, platform * (0.5 - 0.5 * math.cos(t)) * 1.02))
                             for t in [j / 24 * TAU for j in range(24)]])
            cents.append(V((x0, y, platform * 0.5)))
        pg = rings_to_geo(pg_rings, True, cap_start=True, cap_end=True, centers=cents)
        acc.add(pg, sole_col or col, mat=mat, weights=W, ol=0.7)
    if strap_col is not None:   # 玛丽珍搭扣带
        ring = [V((x0 + width * 1.02 * math.sin(t), lerp(y_back, y_toe, 0.42), platform + height * 0.55 + height * 0.5 * -math.cos(t) * 0.9))
                for t in [lerp(-1.4, 1.4, k / 20) for k in range(21)]]
        acc.add(tube(ring, [0.0045] * 21, n=6), strap_col, mat=mat, weights=W, ol=0.5)
    if boot_top:
        lp = leg_path(side)
        pts = [p for p in lp if p.z < boot_top]
        if len(pts) >= 2:
            from body import LEG_R
            n0 = len(lp) - len(pts)
            radii = []
            for i in range(len(pts)):
                s = (n0 + i) / (len(lp) - 1)
                r = piecewise(LEG_R, s) + extra_leg
                radii.append((r * 0.98, r * 1.02))
            bg = tube(pts, radii, n=28, up_hint=V((0, -1, 0)), cap_start=False, cap_end=False)
            acc.add(bg, boot_col or col, mat=mat, weights=rig.w_chain([f"shin.{sn}", f"foot.{sn}"], blend=0.02),
                    ol=0.9, uvp=boot_uvp)
            # 靴口翻边
            top_ring = [pts[0] + V((r_ * math.sin(t), -r_ * math.cos(t), 0)) for t in [k / 32 * TAU for k in range(32)]
                        for r_ in [radii[0][1] + 0.003]]
            trim_ring(acc, top_ring, 0.003, boot_col or col, mat, {f"shin.{sn}": 1.0})
