"""人体：比例（约 7 头身）、骨骼、头部（动漫脸型）、躯干、四肢、五指手、碰撞包络。"""
import math

from mathutils import Vector, Matrix

import core
from core import V, C, TAU, Geo, Rig, lerp, sstep, clamp, adist, piecewise, loft, tube, ellipsoid, \
    bezier_pts, resample, ellipse_ring, rings_to_geo

# ------------------------------------------------------------------ 比例（身高约 1.60，未缩放）

HS = 1.08                             # 头部整体放大（按原图量得约 6.5 头身）
HC = V((0.0, 0.006, 1.496))          # 头部中心
HR = V((0.080, 0.086, 0.094)) * HS    # 头部半径（下巴在 HC.z-0.118 左右）
SH = V((0.112, 0.004, 1.296))         # 左肩关节（原图量得肩宽约 0.23 m）
EL = V((0.162, 0.024, 1.050))         # 左肘
WR = V((0.200, 0.008, 0.836))         # 左腕
HT = V((0.213, -0.004, 0.676))        # 左手指尖方向
HIP = V((0.066, 0.000, 0.874))
KN = V((0.071, -0.006, 0.470))
AN = V((0.074, 0.024, 0.078))
TOE = V((0.078, -0.095, 0.020))

# 躯干截面 (z, rx, ry, cy)：按原图量得的纤细比例
TORSO = [
    (1.352, 0.021, 0.023, 0.012),
    (1.330, 0.046, 0.039, 0.010),
    (1.312, 0.085, 0.048, 0.008),
    (1.293, 0.114, 0.054, 0.006),
    (1.268, 0.114, 0.059, 0.002),
    (1.238, 0.104, 0.067, -0.004),
    (1.208, 0.099, 0.074, -0.010),
    (1.180, 0.093, 0.073, -0.012),
    (1.152, 0.082, 0.063, -0.004),
    (1.112, 0.069, 0.054, 0.002),
    (1.070, 0.060, 0.049, 0.004),
    (1.030, 0.068, 0.054, 0.004),
    (0.990, 0.084, 0.062, 0.004),
    (0.950, 0.096, 0.068, 0.006),
    (0.910, 0.099, 0.069, 0.008),
    (0.872, 0.095, 0.065, 0.010),
    (0.842, 0.076, 0.055, 0.010),
    (0.822, 0.046, 0.035, 0.010),
]
BUST_Z = 1.200


def mirror(v, side):
    return V((v.x * side, v.y, v.z))


def torso_at(z):
    T = TORSO
    if z >= T[0][0]:
        return T[0][1:4]
    if z <= T[-1][0]:
        return T[-1][1:4]
    for a, b in zip(T, T[1:]):
        if a[0] >= z >= b[0]:
            t = (a[0] - z) / (a[0] - b[0])
            return tuple(lerp(a[k], b[k], t) for k in (1, 2, 3))


class Collider:
    """碰撞包络：躯干 + 后加的裙子等。push_out 把点推到所有层外面。"""

    def __init__(self):
        self.layers = [(TORSO[-1][0], TORSO[0][0], torso_at, 1.0)]

    def add(self, z_lo, z_hi, fn, k=1.0):
        self.layers.append((z_lo, z_hi, fn, k))

    def push_out(self, p, margin=0.015):
        q = V(p)
        for z_lo, z_hi, fn, k in self.layers:
            if not (z_lo <= q.z <= z_hi):
                continue
            rx, ry, cy = fn(q.z)
            rx += margin; ry += margin
            dx, dy = q.x, q.y - cy
            kk = math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2)
            if kk < 1.0:
                s = 1.0 / max(kk, 1e-6)
                q = V((dx * s, cy + dy * s, q.z))
        return q


# ------------------------------------------------------------------ 骨骼

def base_rig():
    r = Rig()
    r.add("root", (0, 0, 0), (0, 0.15, 0), None, deform=False)
    r.add("hips", (0, 0.004, 0.90), (0, 0.004, 1.03), "root", roll_to=(0, -1, 0))
    r.add("spine", (0, 0.004, 1.03), (0, 0.004, 1.16), "hips", roll_to=(0, -1, 0))
    r.add("chest", (0, 0.004, 1.16), (0, 0.006, 1.335), "spine", roll_to=(0, -1, 0))
    r.add("neck", (0, 0.008, 1.335), (0, 0.010, 1.41), "chest", roll_to=(0, -1, 0))
    r.add("head", (0, 0.010, 1.41), (0, 0.010, 1.62), "neck", roll_to=(0, -1, 0))
    for s, sx in (("L", 1), ("R", -1)):
        r.add(f"shoulder.{s}", (0.02 * sx, 0.004, 1.305), mirror(SH, sx) + V((0, 0, 0.006)), "chest", roll_to=(0, -1, 0))
        r.add(f"upper_arm.{s}", mirror(SH, sx), mirror(EL, sx), f"shoulder.{s}", roll_to=(0, -1, 0))
        r.add(f"forearm.{s}", mirror(EL, sx), mirror(WR, sx), f"upper_arm.{s}", roll_to=(0, -1, 0))
        r.add(f"hand.{s}", mirror(WR, sx), mirror(HT, sx), f"forearm.{s}", roll_to=(0, -1, 0))
        r.add(f"thigh.{s}", mirror(HIP, sx), mirror(KN, sx), "hips", roll_to=(0, -1, 0))
        r.add(f"shin.{s}", mirror(KN, sx), mirror(AN, sx), f"thigh.{s}", roll_to=(0, -1, 0))
        r.add(f"foot.{s}", mirror(AN, sx), mirror(TOE, sx), f"shin.{s}", roll_to=(0, 0, 1))
    return r


def chain_bones(rig, prefix, pts, parent, n=4):
    pts = resample([V(p) for p in pts], n + 1)
    names = []
    for i in range(n):
        nm = f"{prefix}.{i + 1}"
        rig.add(nm, pts[i], pts[i + 1], parent if i == 0 else names[-1])
        names.append(nm)
    return names


# ------------------------------------------------------------------ 头

def head_deform(u):
    x, y, z = u.x, u.y, u.z
    if z < 0.15:
        t = (0.15 - z) / 1.15
        x *= 1 - 0.46 * t ** 1.6
        if y > 0:
            y *= 1 - 0.55 * t ** 1.3
        else:
            y *= 1 - 0.12 * t
            y -= 0.08 * t ** 3
        z -= 0.08 * t ** 2.2
    if y < 0:
        x *= 1 + 0.035 * math.exp(-((z + 0.25) / 0.3) ** 2)
    if y < -0.6:
        y = -0.6 + (y + 0.6) * 0.6
    if y < 0:
        y -= 0.05 * math.exp(-(x * x) / 0.0022 - ((z + 0.40) ** 2) / 0.010)
    return V((x, y, z))


def head_geo():
    return ellipsoid(HC, HR.x, HR.y, HR.z, nu=96, nv=60, deform=head_deform)


FACE = {k: v * HS for k, v in dict(FACE_W=0.160, FACE_Z0=-0.112, EYE_X=0.0330, EYE_Z=-0.020, EYE_HW=0.0192,
                                      EYE_HH=0.0238, MOUTH_Z=-0.064, NOSE_Z=-0.043, BLUSH_X=0.047,
                                      BLUSH_Z=-0.045).items()}


def face_uv(p):
    q = p - HC
    return (0.5 + q.x / FACE["FACE_W"], (q.z - FACE["FACE_Z0"]) / FACE["FACE_W"])


def face_mask(p):
    q = p - HC
    q = q / HS
    m = 1.0 - sstep(-0.040, -0.015, q.y)
    m *= 1.0 - sstep(0.070, 0.078, abs(q.x))
    m *= 1.0 - sstep(0.040, 0.046, q.z)
    m *= sstep(-0.112, -0.104, q.z)
    return m


def ear_geo(side, pointy=0.0):
    """耳朵：小的 C 形壳；pointy>0 变精灵耳（向后上方伸长）。"""
    base = V((0.077 * HS * side, 0.010, HC.z - 0.026 * HS))
    tip_len = 0.022 + pointy
    up = V((0.0, 0.25, 1.0)).normalized()
    out = V((side, 0.35 if pointy else 0.15, 0.20 if pointy else 0.0)).normalized()
    pts = bezier_pts([base, base + out * tip_len * 0.5 + up * 0.012, base + out * tip_len + up * (0.02 + pointy * 0.25)], 14)
    radii = []
    for i in range(14):
        s = i / 13
        radii.append((lerp(0.017, 0.002, s ** 0.9), lerp(0.006, 0.0015, s)))
    return tube(pts, radii, n=12, out_fn=lambda p, t: V((0, -1, 0.15)), cap_start=True, cap_end=True, bend=0.6)


# ------------------------------------------------------------------ 躯干 / 四肢

def torso_rows(k=4):
    """把 TORSO 截面按 Catmull-Rom 加密（衣服与皮肤分界更平滑）。"""
    T = TORSO
    out = []
    for i in range(len(T) - 1):
        p0, p1, p2, p3 = T[max(i - 1, 0)], T[i], T[i + 1], T[min(i + 2, len(T) - 1)]
        for s in range(k):
            t = s / k
            out.append(tuple(0.5 * ((2 * p1[d]) + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t * t
                                    + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t ** 3) for d in range(4)))
    out.append(T[-1])
    return out


def torso_geo(bust=1.0, n=128):
    secs = []
    for z, rx, ry, cy in torso_rows(4):
        k = math.exp(-((z - BUST_Z) / 0.040) ** 2) * bust

        def rfn(a, k=k):
            b = math.exp(-(adist(a, 0.085) / 0.065) ** 2) + math.exp(-(adist(a, 0.915) / 0.065) ** 2)
            return 1 + 0.20 * k * b
        secs.append((z, rx, ry, cy, 0.0, rfn))
    return loft(secs, n=n, cap_start=True, cap_end=True)


def torso_weights(rig):
    base = rig.w_chain(["hips", "spine", "chest", "neck"], blend=0.05)

    def fn(p):
        w = base(p)
        # 肩头一圈跟上臂走一点，抬手时不至于裂开
        k = sstep(0.08, 0.118, abs(p.x)) * sstep(1.215, 1.265, p.z) * 0.55
        if k > 0:
            side = "L" if p.x > 0 else "R"
            w = {b: x * (1 - k) for b, x in w.items()}
            w[f"upper_arm.{side}"] = w.get(f"upper_arm.{side}", 0) + k
        return w
    return fn


def arm_path(side, n=26):
    pts = bezier_pts([mirror(SH, side) + V((-0.014 * side, 0, 0.012)), mirror(EL, side), mirror(WR, side)], 60)
    return resample(pts, n)


ARM_R = [(0.0, 0.030), (0.10, 0.0272), (0.45, 0.0222), (0.52, 0.0195), (0.60, 0.0207), (0.76, 0.0192),
         (0.92, 0.0150), (1.0, 0.0144)]


def arm_geo(side, scale=1.0, sleeve=None):
    path = arm_path(side)
    radii = []
    for i in range(len(path)):
        s = i / (len(path) - 1)
        r = piecewise(ARM_R, s) * scale
        k = sstep(0.78, 1.0, s)
        radii.append((r * (1 - 0.18 * k), r * (1 + 0.08 * k)))
    return tube(path, radii, n=24, up_hint=V((0, -1, 0)), cap_start=True, cap_end=True)


LEG_R = [(0.0, 0.060), (0.08, 0.057), (0.25, 0.052), (0.42, 0.0435), (0.50, 0.0352), (0.545, 0.0322),
         (0.60, 0.0345), (0.68, 0.0372), (0.80, 0.0292), (0.92, 0.0225), (1.0, 0.0200)]


def leg_path(side, n=34):
    pts = bezier_pts([mirror(HIP, side) + V((0, 0, 0.05)), mirror(KN, side), mirror(AN, side)], 70)
    return resample(pts, n)


def leg_geo(side, extra=0.0, s0=0.0, s1=1.0, rfn=None, cap_end=True):
    path = leg_path(side)
    i0 = int(round(s0 * (len(path) - 1)))
    i1 = int(round(s1 * (len(path) - 1)))
    pts = path[i0:i1 + 1]
    radii = []
    for i in range(len(pts)):
        s = (i0 + i) / (len(path) - 1)
        r = piecewise(LEG_R, s) + extra
        # 小腿肚靠后
        radii.append((r * 0.96, r))
    return tube(pts, radii, n=28, up_hint=V((0, -1, 0)), cap_start=False, cap_end=cap_end, rfn=rfn)


def hand_frame(side):
    w, t = mirror(WR, side), mirror(HT, side)
    d = (t - w).normalized()
    n = V((-side, 0, 0))
    n = (n - d * n.dot(d)).normalized()          # 掌心方向（朝身体）
    f = n.cross(d) * side                        # 拇指一侧（朝前）
    f = (f - d * f.dot(d)).normalized()
    return w, d, n, f


def finger(base, d, n, f, length, r0, curl=(12, 16, 12), spread=0.0, pts_per=6):
    """一根手指：三节，向掌心弯曲。"""
    dirv = (d + f * spread).normalized()
    segs = (0.45, 0.32, 0.23)
    pts = [base]
    p = V(base)
    for k, (fr, ang) in enumerate(zip(segs, curl)):
        npp = (n - dirv * n.dot(dirv)).normalized()
        th = math.radians(ang)
        dirv = (dirv * math.cos(th) + npp * math.sin(th)).normalized()
        for i in range(1, pts_per + 1):
            pts.append(p + dirv * (length * fr * i / pts_per))
        p = pts[-1]
    m = len(pts)
    radii = []
    for i in range(m):
        s = i / (m - 1)
        r = lerp(r0, r0 * 0.74, s)
        if s > 0.9:
            r *= math.sqrt(max(0.0, 1 - ((s - 0.9) / 0.1) ** 2)) * 0.6 + 0.4
        radii.append((r, r * 0.82))
    return tube(pts, radii, n=10, out_fn=lambda p_, t_: n * -1, cap_start=True, cap_end=True)


def hand_geo(side, open_=0.0):
    """五指手。open_=0 放松微弯，1 张开伸直。"""
    w, d, n, f = hand_frame(side)
    g = Geo()
    c = w + d * 0.036

    def deform(u):
        x = math.copysign(abs(u.x) ** 0.85, u.x)
        y = math.copysign(abs(u.y) ** 0.75, u.y)
        return V((x, y, u.z))
    palm = ellipsoid(V((0, 0, 0)), 0.010, 0.028, 0.037, nu=20, nv=12, deform=deform)
    M = Matrix((n, f, d)).transposed().to_4x4()
    M.translation = c
    g.extend(palm.transformed(M))
    k = 1 - open_
    specs = [  # 沿 f 偏移, 沿 d 起点, 长度, 半径, 张开
        (0.0215, 0.071, 0.049, 0.0066, 0.10),
        (0.0072, 0.074, 0.055, 0.0068, 0.02),
        (-0.0072, 0.072, 0.051, 0.0064, -0.04),
        (-0.0205, 0.066, 0.040, 0.0057, -0.12),
    ]
    for off, dd, L_, r0, sp in specs:
        base = w + d * dd + f * off + n * 0.002
        curl = (lerp(4, 14, k), lerp(4, 20, k), lerp(3, 14, k))
        g.extend(finger(base, d, n, f, L_, r0, curl=curl, spread=sp * (0.6 + 0.6 * open_)))
    # 拇指
    tb = w + d * 0.018 + f * 0.022 + n * 0.006
    tdir = (d * 0.75 + f * 0.55 + n * 0.30).normalized()
    pts = [tb]
    p = V(tb)
    for i in range(1, 13):
        pts.append(p + tdir * 0.0042 * i)
    pts = bezier_pts([tb, tb + tdir * 0.026, tb + tdir * 0.045 + n * (0.008 * k) + d * 0.004], 14)
    radii = [(lerp(0.0095, 0.0058, i / 13), lerp(0.0082, 0.0050, i / 13)) for i in range(14)]
    g.extend(tube(pts, radii, n=10, out_fn=lambda p_, t_: n * -1, cap_start=True, cap_end=True))
    return g


# ------------------------------------------------------------------ 组装

I_CLOTH, I_FACE, I_GLOW, I_SKIN, I_HAIR = range(5)


def build_body(acc, rig, spec):
    """头、耳、颈、躯干、手臂、手、腿。spec 里给颜色函数。"""
    skin = C(spec["skin"])
    acc.add(head_geo(), skin, mat=I_FACE, weights={"head": 1.0}, uv=face_uv, ol=0.7, facemask=face_mask)
    if spec.get("ears", True):
        for side in (1, -1):
            acc.add(ear_geo(side, spec.get("ear_point", 0.0)), skin, mat=I_SKIN, weights={"head": 1.0}, ol=0.6)
    ng = tube([V((0, 0.010, 1.300)), V((0, 0.010, 1.36)), V((0, 0.012, 1.425))], [(0.0205, 0.0235)] * 3,
              n=28, cap_start=False, cap_end=False)
    acc.add(ng, spec.get("neck_color", skin), mat=spec.get("neck_mat", I_SKIN),
            weights=rig.w_chain(["chest", "neck", "head"], blend=0.035), ol=0.8)
    acc.add(torso_geo(spec.get("bust", 1.0)), spec["torso_color"], mat=I_CLOTH, weights=torso_weights(rig),
            uvp=spec.get("torso_uvp"))
    for side, sn in ((1, "L"), (-1, "R")):
        acc.add(arm_geo(side, spec.get("arm_scale", 1.0)), spec["arm_color"], mat=spec.get("arm_mat", I_SKIN),
                weights=rig.w_chain([f"upper_arm.{sn}", f"forearm.{sn}", f"hand.{sn}"], blend=0.035),
                uvp=spec.get("arm_uvp"))
        acc.add(hand_geo(side, spec.get("hand_open", 0.0)), C(spec.get("hand", spec["skin"])),
                mat=spec.get("hand_mat", I_SKIN),
                weights=rig.w_chain([f"forearm.{sn}", f"hand.{sn}"], blend=0.008), ol=0.55)
        if spec.get("legs", True):
            acc.add(leg_geo(side), spec["leg_color"], mat=spec.get("leg_mat", I_SKIN),
                    weights=rig.w_chain([f"thigh.{sn}", f"shin.{sn}", f"foot.{sn}"], blend=0.04),
                    uvp=spec.get("leg_uvp"))
