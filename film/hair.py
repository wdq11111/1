"""动漫发型：新月形截面的发束（头顶束、刘海、鬓发、后发多层、飞丝、呆毛）+ 高光带。"""
import math
import random

from mathutils import Vector

import core
from core import V, C, TAU, Geo, lerp, mixc, sstep, clamp, adist, tube, ellipsoid, bezier_pts, resample, \
    rings_to_geo, smooth_pts
from body import HC, HS, I_HAIR, mirror, SH, EL, WR

CAP_C = HC + V((0.0, 0.010, 0.012)) * HS
CAP_R = V((0.092, 0.099, 0.103)) * HS


def cap_point(az, pol, k=1.0):
    """az: 0 正前 / 90 角色左(+X)；pol: 0 头顶 / 90 赤道（度）。"""
    a, p = math.radians(az), math.radians(pol)
    d = V((math.sin(p) * math.sin(a), -math.sin(p) * math.cos(a), math.cos(p)))
    return CAP_C + V((d.x * CAP_R.x, d.y * CAP_R.y, d.z * CAP_R.z)) * k


def head_out(p, t=None):
    return p - CAP_C


def body_out(p, t=None):
    """头部以下：朝外方向 = 离开身体中轴（水平）。"""
    if p.z > HC.z - 0.06:
        return p - CAP_C
    o = V((p.x, p.y - 0.01, 0.0))
    if o.length < 1e-4:
        o = V((0, 1, 0))
    return o


def lock(path, w_max, thick=0.30, bend=0.45, out_fn=head_out, root=0.55, belly=0.35, tip_len=0.20,
         n=14, tip_pow=None):
    """一束头发：宽度从根部 root*w 涨到 w_max，最后 tip_len 段用 smoothstep 收尖（不拉成细面条）。"""
    m = len(path)
    radii = []
    for i in range(m):
        s = i / (m - 1)
        w = w_max * (root + (1 - root) * math.sin(min(1.0, s / belly) * math.pi / 2))
        if s > 1 - tip_len:
            u = (1 - s) / tip_len
            w *= max(u * u * (3 - 2 * u), 0.015)
        w = max(w, 0.0005)
        radii.append((w, max(w * thick, 0.0008)))
    return tube(path, radii, n=n, out_fn=out_fn, cap_start=True, cap_end=False, bend=bend)


def profile_fn(pts):
    """[(z, 半宽)...] → fn(z)"""
    pts = sorted(pts)

    def fn(z):
        return core.piecewise(pts, z)
    return fn


class HairStyle:
    """收集发型参数，统一生成。"""

    def __init__(self, acc, rig, collider, palette, hl=None, seed=1):
        self.acc, self.rig, self.col = acc, rig, collider
        self.pal = palette          # dict: base, dark, tip, (tip_from, tip_to 高度)
        self.hl = hl                # 高光颜色
        self.R = random.Random(seed)
        self.arm_caps = []
        for side in (1, -1):
            self.arm_caps.append((mirror(SH, side), mirror(EL, side), 0.042))
            self.arm_caps.append((mirror(EL, side), mirror(WR, side), 0.036))

    # ---- 颜色
    def color(self, layer=0, hl=True):
        P = self.pal

        def fn(s, a, fc):
            z = fc.z
            t = clamp((P.get("grad_top", 1.35) - z) / max(P.get("grad_top", 1.35) - P.get("grad_bot", 0.5), 1e-3))
            c = mixc(P["base"], P.get("tip", P["base"]), sstep(0.0, 1.0, t) ** P.get("grad_pow", 1.0))
            if "mid" in P:
                c = mixc(c, P["mid"], math.sin(clamp(t) * math.pi) * P.get("mid_k", 0.5))
            c = mixc(c, P["dark"], 0.30 * layer)
            if hl and self.hl is not None:
                q = (fc - HC) / HS
                if q.z > -0.03 and q.y < 0.07:
                    zz = q.z - P.get("hl_z", 0.052) - 0.007 * math.sin(math.atan2(q.x, -q.y) * 11)
                    k = 1.0 - sstep(0.002, 0.007, abs(zz))
                    if k > 0:
                        c = mixc(c, self.hl, 0.7 * k)
            return c
        return fn

    def weights(self):
        def fn(p):
            h = sstep(1.27, 1.40, p.z)
            if h >= 0.999:
                return {"head": 1.0}
            rest = 1 - h
            if p.z > 1.14:
                return {"head": h, "chest": rest}
            if p.z > 1.0:
                k = sstep(1.0, 1.14, p.z)
                return {"head": h, "chest": rest * k, "spine": rest * (1 - k)}
            return {"spine": 0.6, "hips": 0.4}
        return fn

    def push(self, p, m=0.02):
        q = self.col.push_out(p, m)
        for a, b, r in self.arm_caps:
            d, t = core.seg_dist(q, a, b)
            if d < r + m * 0.5:
                c = a + (b - a) * t
                dirv = q - c
                if dirv.length < 1e-5:
                    dirv = V((0, 1, 0))
                q = c + dirv.normalized() * (r + m * 0.5)
        return q

    # ---- 头皮外壳（极少露出，作为底色）
    def cap(self, front_cut=58, pol_face=50):
        nu, nv = 72, 40
        rings = []
        for i in range(1, nv):
            pol = 180.0 * i / nv
            rings.append([cap_point(360.0 * j / nu, pol, 0.985) for j in range(nu)])
        g = rings_to_geo(rings, True, centers=[CAP_C] * len(rings))

        def keep(s, a, c):
            q = c - CAP_C
            pol = math.degrees(math.acos(max(-1, min(1, q.z / max(q.length, 1e-6)))))
            az = math.degrees(math.atan2(q.x, -q.y))
            if abs(az) < front_cut and pol > pol_face:
                return False
            if pol > 125:
                return False
            if abs(az) < 105 and pol > 98:
                return False
            return True
        g.keep(keep)
        top = len(g.v); g.v.append(cap_point(0, 0, 0.985))
        for j in range(nu):
            g.f.append((top, j, (j + 1) % nu)); g.fp.append((0.0, j / nu)); g.fcp.append([(0, 0)] * 3)
        s = 0.0
        for f in g.f[-nu:]:
            vs = [g.v[i] for i in f]
            s += core._face_normal(vs).dot(sum(vs, V()) / len(vs) - CAP_C)
        if s < 0:
            g.f[-nu:] = [tuple(reversed(f)) for f in g.f[-nu:]]
        self.acc.add(g, self.pal["dark"], mat=I_HAIR, vcol=True, weights={"head": 1.0}, ol=0.0)

    # ---- 头顶发束：从发旋放射，贴着头皮
    def crown(self, count=34, whorl=(180, 18), part_az=None, pol_end_front=60, pol_end_back=112, w=1.7):
        waz, wpol = whorl
        for k in range(count):
            az = 360.0 * k / count + self.R.uniform(-3, 3)
            front = abs(((az + 180) % 360) - 180) < 70
            pol1 = pol_end_front if front else lerp(pol_end_front + 25, pol_end_back, sstep(70, 150, abs(((az + 180) % 360) - 180)))
            pts = []
            for i in range(20):
                t = i / 19
                # 从发旋点出发，经头顶，沿各自方位角下来
                pol = lerp(wpol * 0.4, pol1, t)
                a = lerp(waz, az, sstep(0.0, 0.35, t)) if not front else az
                pts.append(cap_point(a, pol, 1.0 + 0.045 * math.sin(t * math.pi) + 0.012))
            width = TAU * 0.10 / count * w
            g = lock(pts, width, thick=0.22, bend=0.5, root=0.3, belly=0.5, tip_len=0.35)
            self.acc.add(g, self.color(0), mat=I_HAIR, vcol=True, weights={"head": 1.0}, ol=0.45)

    # ---- 刘海
    def bangs(self, specs, k_end=0.93, layer_dark=0.0):
        """specs: [(az, pol_end, width, sweep_deg, (tip_curl_deg))]"""
        for sp in specs:
            az, pol_end, w, sweep = sp[:4]
            curl = sp[4] if len(sp) > 4 else 0.0
            n = 22
            pts = []
            for i in range(n):
                t = i / (n - 1)
                pol = lerp(12, pol_end - 9, t)
                a = az + sweep * t ** 1.6 + curl * sstep(0.7, 1.0, t)
                k = lerp(1.06, k_end, t ** 1.6) + 0.03 * math.sin(t * math.pi)
                pts.append(cap_point(a, pol, k))
            g = lock(pts, w, thick=0.24, bend=0.55, root=0.5, belly=0.45, tip_len=0.45)
            self.acc.add(g, self.color(layer_dark), mat=I_HAIR, vcol=True, weights={"head": 1.0}, ol=0.75)

    # ---- 鬓发（脸两侧垂到胸前）
    def side_lock(self, side, az, z_end, w, wave=0.0, fwd=0.0, out=0.0, seed=0, pol0=40, curl=0.0, k_top=1.05):
        R = random.Random(seed)
        top = [cap_point(az * side, pol0, k_top), cap_point(az * side, 78, k_top + 0.03),
               cap_point((az + 6) * side, 102, k_top + 0.07)]
        top = bezier_pts(top, 12)
        p2 = top[-1]
        rest = []
        n = 34
        ph = R.uniform(0, TAU)
        for i in range(1, n):
            t = i / (n - 1)
            z = lerp(p2.z, z_end, t)
            x = p2.x + side * (out * t ** 1.2) + wave * math.sin(t * 5 + ph) * sstep(0.1, 0.5, t)
            y = p2.y - fwd * t
            if curl and t > 0.8:
                x += side * curl * (t - 0.8) / 0.2
            rest.append(self.push(V((x, y, z)), 0.018))
        pts = resample(smooth_pts(top + rest, 3), 40)
        g = lock(pts, w * 1.25, thick=0.17, bend=0.6, root=0.55, belly=0.3, tip_len=0.22,
                 out_fn=lambda p, t: V((p.x * 0.8, -0.35, 0)) if p.z < HC.z - 0.08 else p - CAP_C)
        self.acc.add(g, self.color(0), mat=I_HAIR, vcol=True, weights=self.weights(), ol=0.75)

    # ---- 后发
    def back(self, z_end, count=26, layers=3, wave=0.02, freq=7.0, spread=1.8, width=0.06, y_back=0.10,
             az_range=(78, 282), lean=0.0, curl_tip=0.0, z_jit=0.06, straight=False, seed=7, out_flare=0.0):
        """多层后发：内层暗、外层亮；宽束 + 尖梢；可带波浪、末端卷、整体偏向一侧（lean）。"""
        R = random.Random(seed)
        for layer in range(layers):
            lk = layers - 1 - layer       # 先画内层
            cnt = count + (4 if lk == 0 else 0)
            for k in range(cnt):
                u = (k + R.uniform(-0.35, 0.35)) / (cnt - 1)
                az = lerp(az_range[0], az_range[1], u)
                side = 1 if az < 180 else -1
                pol0 = R.uniform(30, 65) if lk == 0 else R.uniform(55, 95)
                ze = z_end + R.uniform(-z_jit, z_jit * 0.6) + 0.05 * lk
                k_sc = 1.03 + 0.012 * (2 - lk)
                top = [cap_point(az, lerp(pol0, 112, t), k_sc + 0.02 * t) for t in (0, 0.35, 0.7, 1.0)]
                p1 = top[-1]
                hang = []
                n = 46
                ph = R.uniform(0, TAU)
                xs = p1.x * 1.25
                for i in range(1, n):
                    t = i / (n - 1)
                    z = lerp(p1.z, ze, t)
                    fan = 1 + (spread - 1) * sstep(0.0, 0.9, t) ** 1.1
                    wv = 0.0 if straight else wave * sstep(0.05, 0.45, t) * math.sin(t * freq + ph)
                    x = xs * fan + wv + lean * t ** 1.3
                    yb = y_back + 0.012 * (2 - lk) + out_flare * t
                    y = lerp(p1.y, yb, sstep(0.0, 0.3, t)) + (0 if straight else 0.35 * wave * math.cos(t * freq * 0.8 + ph))
                    if curl_tip and t > 0.82:
                        c = (t - 0.82) / 0.18
                        x += math.copysign(curl_tip * math.sin(c * math.pi * 0.9), x if abs(x) > 0.02 else side)
                        z += curl_tip * 0.6 * (1 - math.cos(c * math.pi * 0.9))
                    hang.append(self.push(V((x, y, z)), 0.022 + 0.008 * (2 - lk)))
                pts = resample(smooth_pts(bezier_pts(top, 10) + hang, 3), 50)
                w = width * R.uniform(0.85, 1.25) * (1.15 if lk == 0 else 1.0)
                g = lock(pts, w, thick=0.24, bend=0.45, root=0.45, belly=0.45, tip_len=0.38,
                         out_fn=body_out)
                self.acc.add(g, self.color(0.9 if lk == 0 else (0.35 if lk == 1 else 0.0)), mat=I_HAIR, vcol=True,
                             weights=self.weights(), ol=0.7)


    # ---- 主发团：按原图量得的外轮廓分布主发束，每束再拆成几缕（尖端错开）
    def mass(self, profiles, z_end, n_main=11, children=3, wave=0.03, waves=3.0, curl=0.04, depth_in=0.13,
             depth_out=0.035, width=0.07, seed=5, lean=0.0, straight=False, z_jit=0.06, inner=0.035,
             pol_range=(35, 80), az_out=78, ol=0.7, layer_dark=None):
        """profiles: {side: fn(z)→外轮廓半宽}。u=0 是背中线、u=1 是最外侧（贴着手臂后面垂下）。"""
        R = random.Random(seed)
        for side, prof in profiles.items():
            for k in range(n_main):
                u = (k + 0.5) / n_main
                az = side * lerp(178, az_out, u) + R.uniform(-4, 4)
                pol0 = R.uniform(*pol_range)
                ze = (z_end(side, u) if callable(z_end) else z_end) + R.uniform(-z_jit, z_jit * 0.5)
                top = [cap_point(az, lerp(pol0, 114, t), 1.03 + 0.03 * t) for t in (0, 0.35, 0.7, 1.0)]
                p1 = top[-1]
                ph = R.uniform(0, TAU)
                hang = []
                n = 48
                for i in range(1, n):
                    t = i / (n - 1)
                    z = lerp(p1.z, ze, t)
                    Xo = prof(z)
                    xt = side * lerp(inner, Xo, u ** 0.85)
                    x = lerp(p1.x, xt, sstep(0.0, 0.35, t))
                    y = lerp(p1.y, lerp(depth_in, depth_out, u ** 1.2), sstep(0.0, 0.3, t))
                    if not straight:
                        amp = wave * sstep(0.08, 0.5, t)
                        x += side * amp * math.sin(t * waves * TAU + ph)
                        y += 0.35 * amp * math.cos(t * waves * TAU + ph)
                    x += lean * sstep(0.0, 1.0, t)
                    hang.append(V((x, y, z)))
                main = resample(smooth_pts(bezier_pts(top, 10) + hang, 3), 56)
                if curl:
                    # 末端 15% 向外上卷
                    m = len(main)
                    for i in range(int(m * 0.82), m):
                        c = (i - m * 0.82) / (m * 0.18)
                        main[i] = main[i] + V((side * curl * math.sin(c * 1.4), 0, curl * 0.7 * (1 - math.cos(c * 1.4))))
                main = [self.push(p, 0.02 + 0.01 * (1 - u)) for p in main]
                # 拆分子束
                fr = core.frames_along(main, out_fn=body_out)
                w_main = width * R.uniform(0.9, 1.2)
                wc = w_main / children * 1.35
                dark = layer_dark if layer_dark is not None else 0.5 * (1 - u)
                for c in range(children):
                    off = (c - (children - 1) / 2) / max(children - 1, 1)   # -0.5..0.5
                    cut = 1.0 - R.uniform(0.0, 0.14) * (c != children // 2)
                    pts = []
                    for i, (p, (T, N, B)) in enumerate(zip(main, fr)):
                        s = i / (len(main) - 1)
                        if s > cut:
                            break
                        spread = lerp(0.55, 1.0, sstep(0.0, 0.4, s)) + 0.6 * sstep(0.7, 1.0, s)
                        q = p + B * (off * w_main * spread) + N * (0.004 * math.sin(c * 2.1 + s * 6))
                        pts.append(q)
                    if len(pts) < 8:
                        continue
                    pts = resample(pts, 50)
                    g = lock(pts, wc * R.uniform(0.9, 1.1), thick=0.20, bend=0.55, root=0.5, belly=0.3, tip_len=0.18,
                             out_fn=body_out)
                    self.acc.add(g, self.color(dark), mat=I_HAIR, vcol=True, weights=self.weights(), ol=ol)

    # ---- 飞丝：细长弯曲
    def wisps(self, count, z_range, x_out, seed=3, width=0.012, curl=0.06):
        R = random.Random(seed)
        for k in range(count):
            side = 1 if k % 2 == 0 else -1
            az = side * R.uniform(70, 130)
            p0 = cap_point(az, R.uniform(70, 100), 1.06)
            ze = R.uniform(*z_range)
            xo = side * R.uniform(x_out * 0.6, x_out)
            ctrl = [p0, p0 + V((side * 0.04, 0.04, -0.12)),
                    V((xo * 0.6, 0.12, lerp(p0.z, ze, 0.45))),
                    V((xo, 0.10 + R.uniform(-0.04, 0.04), lerp(p0.z, ze, 0.8))),
                    V((xo + side * curl, 0.06, ze))]
            pts = [self.push(p, 0.03) for p in resample(bezier_pts(ctrl, 50), 40)]
            g = lock(pts, width, thick=0.4, bend=0.2, root=0.7, belly=0.2, tip_len=0.5, n=8, out_fn=body_out)
            self.acc.add(g, self.color(0.2), mat=I_HAIR, vcol=True, weights=self.weights(), ol=0.6)

    # ---- 呆毛
    def ahoge(self, az=0, h=0.075, curl=1.0, w=0.010):
        p0 = cap_point(az, 6, 1.02)
        pts = bezier_pts([p0, p0 + V((0.0, -0.006, h * 0.55)), p0 + V((0.016 * curl, -0.03, h)),
                          p0 + V((0.036 * curl, -0.05, h * 0.78)), p0 + V((0.040 * curl, -0.055, h * 0.62))], 24)
        g = lock(pts, w, thick=0.35, bend=0.3, root=0.9, belly=0.2, tip_len=0.5, n=8,
                 out_fn=lambda p, t: V((1, 0, 0)))
        self.acc.add(g, self.color(0, hl=False), mat=I_HAIR, vcol=True, weights={"head": 1.0}, ol=0.5)
