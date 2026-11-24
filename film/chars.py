"""四个 AI 角色（高精度版）：ChatGPT（白龙）、Gemini（星猫）、Claude（橙发学者）、DeepSeek（鲸鱼女仆）。

build_character(key) → dict(arm, mesh, face, mats, props)
全部几何、花纹、表情贴图都由脚本生成，不依赖外部素材。
"""
import math
import os
import random

import bpy
from mathutils import Vector, Matrix

import core
from core import (V, C, TAU, Acc, Geo, lerp, mixc, mulc, sstep, clamp, adist, piecewise, loft, tube,
                  ellipsoid, bezier_pts, resample, flat_shape, star_outline, ellipse_ring, rings_to_geo,
                  place, smooth_pts)
import body
from body import (HC, SH, EL, WR, HT, HIP, KN, AN, TOE, mirror, torso_at, Collider, base_rig, chain_bones,
                  arm_path, leg_path, build_body, leg_geo, I_CLOTH, I_FACE, I_GLOW, I_SKIN, I_HAIR)
import hair
from hair import HairStyle, cap_point, CAP_C
import cloth
import faces
import patterns as PT

I_EXTRA = 5
TEX = os.path.join(core.ROOT, "film", "tex")


def W1(b):
    return {b: 1.0}


# ================================================================== ChatGPT：白龙

def build_gpt(acc, rig, col):
    S = dict(skin="#fcefe9", iris_r="#9f90d8", iris_l="#9f90d8", lash="#5a4f74", brow="#cbc3dd",
             cloth_shadow="#cdc8ec", hair_shadow="#cdc7ee", skin_shadow="#ecbcc8", line="#5a5274", blush=0.8,
             eye_style=dict(w=1.0, h=0.98, tilt=0.06, lash=0.95), eyes="calm", mouth="flat", ear_point=0.040)
    atlas = PT.PatternAtlas(4)
    b_lace = PT.lace_band(atlas, "#d9d3ee", scallops=36)
    b_edge = PT.lines_band(atlas, "#c9c3e0", [0.2, 0.3, 0.7, 0.8], [6, 3, 3, 6])
    S["atlas"] = atlas
    S["extra"] = ("scales", PT.scale_tile(os.path.join(TEX, "gpt_scales.png"), line="#b5afcf", fill="#f4f2fa"))
    WH = C("#f8f7fc"); WH2 = C("#ecebf6"); SIL = C("#c9c7da"); SK = C(S["skin"]); LAV = C("#e3def3")

    def torso(s, a, fc):
        if fc.z > 1.262 and abs(fc.x) > 0.034 + (1.345 - fc.z) * 0.62:
            return SK                                     # 挂脖：露肩
        if 0.985 < fc.z < 1.05 and 0.18 < adist(a, 0.0) < 0.27 and fc.x < 0:
            return SK                                     # 右腰侧镂空
        return WH
    S["torso_color"] = torso
    S["neck_color"] = lambda s, a, fc: WH if fc.z < 1.405 else SK
    S["neck_mat"] = I_CLOTH

    def armc(s, a, fc):
        if 0.30 < s < 0.37:
            return WH                                     # 上臂环
        if s > 0.86:
            return WH2 if (int(a * 24) % 2 == 0) else WH  # 手腕蕾丝护腕
        return SK
    S["arm_color"] = armc
    S["leg_color"] = lambda s, a, fc: LAV if (0.66 < fc.z < 0.69 and fc.x < 0) else SK
    build_body(acc, rig, S)
    # 高领顶圈 + 前胸竖排小环结
    cloth.trim_ring(acc, [V((0.026 * math.sin(t), 0.010 - 0.028 * math.cos(t), 1.405)) for t in
                          [k / 40 * TAU for k in range(40)]], 0.0028, SIL, I_CLOTH, W1("neck"))
    for k, z in enumerate((1.29, 1.255, 1.22, 1.185, 1.15, 1.115)):
        rx, ry, cy = torso_at(z)
        p = V((0, cy - ry * (1.0 + (0.16 if 1.16 < z < 1.24 else 0.0)) - 0.003, z))
        cloth.rosette(acc, p, V((0, -1, 0.05)), 0.010 if k % 2 else 0.007, SIL, I_CLOTH, W1("chest"), ol=0.3)
    # 长裙（右前高开衩、后拖尾、蕾丝下摆）
    cloth.skirt(acc, rig, col, lambda s, a, fc: mixc(WH, WH2, 0.5 * sstep(0.7, 1.0, s)), I_CLOTH, 1.075, 0.03,
                (0.084, 0.060), (0.31, 0.30), n=180, rows=36,
                folds=[(5, 0.035, 0.3), (9, 0.025, 1.7), (13, 0.012, 0.6)], hem_wave=0.045, hem_freq=17,
                back_flare=0.22, bell=0.85, cut=lambda a, t: 0.785 < a < 0.865 and t > 0.30, thigh=0.6,
                lining=LAV, uvp=atlas.uvp(b_lace, rep=10, s0=0.90, s1=0.995))
    # 腰链：菱形坠 + 流苏
    pts = [col.push_out(V((0.12 * math.sin(t), 0.004 - 0.085 * math.cos(t), 1.04 - 0.055 * math.cos(t) ** 2)), 0.012)
           for t in [lerp(-1.6, 1.6, k / 40) for k in range(41)]]
    cloth.chain(acc, pts, 0.0035, SIL, I_CLOTH, W1("hips"), 60)
    for x in (-0.07, -0.02, 0.03, 0.075):
        top = col.push_out(V((x, -0.10, 1.04 - 0.055 * (1 - (x / 0.12) ** 2) - 0.004)), 0.016)
        dia = [(0, 0.012), (0.009, 0), (0, -0.012), (-0.009, 0)]
        g = flat_shape(dia, 0.004, bevel=0.002)
        acc.add(g.transformed(place(top + V((0, -0.004, -0.02)), V((0, -1, 0)))), SIL, mat=I_CLOTH,
                weights=W1("hips"), ol=0.4)
        cloth.tassel(acc, top + V((0, -0.008, -0.04)), 0.045, 0.006, WH, SIL, I_CLOTH, W1("hips"), strands=8)
    # 环结装饰
    for p, n_, r in ((V((0.125, -0.07, 0.995)), V((0.7, -1, 0)), 0.026),
                     (V((-0.15, -0.20, 0.28)), V((-0.3, -1, -0.1)), 0.022),
                     (V((0.12, -0.24, 0.20)), V((0.25, -1, -0.1)), 0.022),
                     (V((0.02, -0.30, 0.09)), V((0, -1, -0.15)), 0.02)):
        cloth.rosette(acc, col.push_out(p, 0.02), n_, r, C("#eeecf6"), I_CLOTH, W1("hips"))
    # 披纱长袖：从上臂环垂到地面附近
    for side in (1, -1):
        cloth.sleeve(acc, rig, side, lambda s, a, fc: mixc(WH, LAV, 0.25 * s), I_CLOTH, s0=0.62, s1=1.0,
                     r_fn=lambda t: (lerp(0.024, 0.17, sstep(0.0, 1.0, t) ** 0.8), lerp(0.024, 0.065, sstep(0.0, 0.6, t))),
                     hang=(0.10, 0.17), out=0.14, back=0.10, wave=0.16, freq=9, lining=C("#e6e2f4"), n=96,
                     uvp=atlas.uvp(b_edge, rep=4, s0=0.93, s1=1.0))
        ap = arm_path(side, 40)
        q = ap[int(0.64 * 39)]
        cloth.frill_ring(acc, WH, I_CLOTH, q.z + 0.012, 0.026, 0.026, 0.024, 0.012, waves=12, amp=0.3, rows=3,
                         n=96, cy=q.y, weights=W1(f"forearm.{'L' if side > 0 else 'R'}"), ol=0.4)
    # 鞋：白色尖头高跟 + 环结；左脚踝链
    for side in (1, -1):
        sn = "L" if side > 0 else "R"
        cloth.shoe(acc, rig, side, C("#f4f3fa"), I_CLOTH, heel=0.065, length=0.185, width=0.036, height=0.045,
                   toe_round=0.4, sole_col=C("#d7d4e6"))
        a = mirror(AN, side)
        cloth.rosette(acc, V((a.x, a.y - 0.115, 0.05)), V((0, -1, 0.8)), 0.014, C("#e9e7f2"), I_CLOTH,
                      W1(f"foot.{sn}"))
    a = mirror(AN, 1) + V((0, 0, 0.035))
    cloth.chain(acc, [a + V((0.032 * math.sin(t), -0.032 * math.cos(t), -0.006 * math.cos(t))) for t in
                      [k / 30 * TAU for k in range(31)]], 0.003, SIL, I_CLOTH, W1("shin.L"), 26)
    # ---- 头发：白、超长、蓬松波浪
    H = HairStyle(acc, rig, col, dict(base=C("#f9f8fd"), dark=C("#cfc9e8"), tip=C("#ebe7f6"), grad_top=1.3,
                                      grad_bot=0.3, hl_z=0.05), hl=C("#ffffff"), seed=11)
    H.cap()
    H.crown(count=30, whorl=(175, 20))
    H.bangs([(-58, 96, 0.030, 6, -8), (-44, 104, 0.032, 10), (-30, 99, 0.030, -6), (-17, 107, 0.028, 9),
             (-5, 101, 0.027, -8), (7, 108, 0.026, 12), (19, 100, 0.028, -7), (31, 104, 0.030, 8),
             (44, 98, 0.031, -6), (57, 94, 0.030, 7, 8), (-24, 90, 0.022, 22), (14, 88, 0.022, -24),
             (2, 84, 0.018, 18)])
    for side in (1, -1):
        H.side_lock(side, 58, 1.02, 0.026, wave=0.022, fwd=0.012, out=0.02, seed=3 + side, curl=0.02)
        H.side_lock(side, 72, 0.92, 0.030, wave=0.028, fwd=0.0, out=0.05, seed=7 + side, curl=0.03)
        H.side_lock(side, 86, 0.82, 0.032, wave=0.03, fwd=-0.02, out=0.09, seed=9 + side, curl=0.04)
    H.back(z_end=0.50, count=16, layers=2, wave=0.035, freq=7.0, spread=1.6, width=0.075, y_back=0.11,
           curl_tip=0.04, z_jit=0.08, seed=12, out_flare=0.03)
    prof = hair.profile_fn([(1.42, 0.11), (1.27, 0.19), (1.12, 0.245), (0.97, 0.245), (0.82, 0.225), (0.62, 0.20)])
    H.mass({1: prof, -1: prof}, z_end=lambda side, u: lerp(0.55, 0.64, u), n_main=10, children=3, wave=0.032,
           waves=3.2, curl=0.035, width=0.075, seed=13, depth_in=0.12, depth_out=0.03)
    H.ahoge(az=-12, h=0.075, curl=-1.0)
    # ---- 龙角（上扬的新月形，外缘锯齿）
    for side in (1, -1):
        B = cap_point(66 * side, 44, 0.94)
        ctrl = [B, B + V((0.014 * side, 0.010, 0.045)), B + V((0.020 * side, 0.020, 0.095)),
                B + V((0.012 * side, 0.026, 0.135)), B + V((-0.002 * side, 0.024, 0.160)),
                B + V((-0.012 * side, 0.018, 0.170))]
        pts = resample(bezier_pts(ctrl, 80), 64)
        radii = [lerp(0.021, 0.0012, (i / 63) ** 0.95) for i in range(64)]

        def rfn(s, a, side=side):
            k = max(0.0, math.sin(a * TAU) * side) ** 1.5    # 外侧锯齿
            return 1 + 0.32 * k * max(0.0, math.sin(s * 62)) ** 3
        g = tube(pts, radii, n=20, rfn=rfn, up_hint=V((0, -1, 0)), cap_start=True, cap_end=True)
        acc.add(g, lambda s, a, fc: mixc(C("#f6f4fa"), C("#d6d1e8"), 0.15 + 0.6 * (math.sin(s * 62) > 0.75)),
                mat=I_CLOTH, weights=W1("head"), ol=0.9)
    # 发饰环结 + 耳坠流苏
    cloth.rosette(acc, cap_point(58, 62, 1.10), cap_point(58, 62) - CAP_C, 0.020, C("#f2f0f8"), I_CLOTH, W1("head"))
    for side in (1, -1):
        e = V((0.088 * side, 0.004, HC.z - 0.036))
        cloth.tassel(acc, e + V((0, -0.004, -0.008)), 0.022, 0.004, WH, SIL, I_CLOTH, W1("head"), strands=6)
    # ---- 龙翼（腰后，向两侧展开）
    for side, sn in ((1, "L"), (-1, "R")):
        root = V((0.045 * side, 0.070, 1.06))
        wb = chain_bones(rig, f"wing.{sn}", [root, root + V((0.20 * side, 0.12, 0.05)),
                                             root + V((0.40 * side, 0.17, -0.08))], "spine", n=2)
        ol_pts = [(0.00, 0.03), (0.08, 0.10), (0.18, 0.15), (0.29, 0.14), (0.40, 0.06), (0.46, -0.05),
                  (0.40, -0.06), (0.36, -0.12), (0.34, -0.25), (0.28, -0.20), (0.22, -0.24), (0.18, -0.36),
                  (0.13, -0.27), (0.08, -0.29), (0.04, -0.18), (0.0, -0.10)]
        sm = resample(bezier_pts([V((x, 0, z)) for x, z in ol_pts] + [V((0.0, 0, 0.03))], 160), 140)
        g = flat_shape([(p.x, p.z) for p in sm], 0.005, bevel=0.004)
        Mw = Matrix.Translation(root) @ Matrix.Rotation(math.radians(28 * side), 4, "Z") @ \
            Matrix.Rotation(math.radians(-8), 4, "X")
        if side < 0:
            Mw = Mw @ Matrix.Scale(-1, 4, V((1, 0, 0)))
            g.flip()
        acc.add(g.transformed(Mw), lambda s, a, fc: mixc(C("#f3f1fa"), C("#ddd8ee"), 0.4 * (a > 0.5)),
                mat=I_CLOTH, weights=rig.w(wb, power=3), ol=0.9)
        for tip in ((0.46, -0.05), (0.34, -0.25), (0.18, -0.36), (0.08, -0.29)):
            if tip[0] > 0.4:
                bp = [V((0.0, -0.004, 0.0)), V((0.20, -0.004, 0.13)), V((0.29, -0.004, 0.14)), V((tip[0], -0.004, tip[1]))]
            else:
                bp = [V((0.0, -0.004, 0.0)), V((0.20, -0.004, 0.10)), V((tip[0], -0.004, tip[1]))]
            pp = bezier_pts(bp, 20)
            tg = tube(pp, [lerp(0.009, 0.0025, i / 19) for i in range(20)], n=8)
            acc.add(tg.transformed(Mw), C("#d8d4e8"), mat=I_CLOTH, weights=rig.w(wb, power=3), ol=0.8)
    # ---- 龙尾（鳞片平铺贴图）
    tp = [V((0, 0.07, 0.93)), V((0.10, 0.20, 0.82)), V((0.30, 0.22, 0.66)), V((0.45, 0.17, 0.42)),
          V((0.50, 0.06, 0.18)), V((0.47, -0.07, 0.06)), V((0.39, -0.15, 0.055)), V((0.32, -0.15, 0.09)),
          V((0.29, -0.10, 0.13))]
    pts = resample(bezier_pts(tp, 120), 90)
    tb = chain_bones(rig, "tail", pts, "hips", n=6)
    radii = [lerp(0.072, 0.008, (i / 89) ** 0.8) for i in range(90)]
    g = tube(pts, radii, n=28, cap_start=True, cap_end=True, up_hint=V((0, 0, 1)))
    acc.add(g, lambda s, a, fc: C("#f6f4fb") if adist(a, 0.5) < 0.22 else C("#e9e6f3"), mat=I_EXTRA,
            weights=rig.w_chain(tb, blend=0.05), ol=0.9, uvp=lambda s, a: (a * 3, s * 22))
    for i in range(6, 80, 6):   # 尾背小棘
        p = pts[i]
        d = (pts[i + 1] - pts[i - 1]).normalized()
        up = (V((0, 0, 1)) - d * d.z).normalized()
        r = radii[i]
        acc.add(tube([p + up * r * 0.7, p + up * (r + 0.018 * (1 - i / 90))], [0.008 * (1 - i / 95), 0.001], n=6),
                C("#e0dcee"), mat=I_CLOTH, weights=rig.w_chain(tb, blend=0.05), ol=0.6)
    return S


def cloud_prop(name="GPT_Cloud"):
    """ChatGPT 身边的小云朵（蓝白软团 + 两只眼睛）。"""
    acc = Acc(name)
    blue = C("#9cc3f2"); dark = C("#2a3f8f")
    for c, r in ((V((0, 0, 0)), 0.045), (V((0.04, 0.0, 0.01)), 0.035), (V((-0.04, 0.0, 0.005)), 0.035),
                 (V((0.02, 0.0, 0.035)), 0.032), (V((-0.02, 0.0, 0.03)), 0.03), (V((0.0, 0.0, -0.02)), 0.035)):
        acc.add(ellipsoid(c, r, r * 0.85, r, nu=24, nv=14), blue, mat=0, ol=1.0)
    for x in (-0.016, 0.016):
        acc.add(ellipsoid(V((x, -0.040, 0.008)), 0.008, 0.004, 0.012, nu=12, nv=8), dark, mat=0, ol=0.0)
        acc.add(ellipsoid(V((x - 0.003, -0.044, 0.013)), 0.0028, 0.001, 0.0035, nu=8, nv=6), C("#ffffff"), mat=0, ol=0.0)
    return acc


# ================================================================== Gemini：星猫

def build_gem(acc, rig, col):
    S = dict(skin="#fde8e1", iris_r="#e2436d", iris_l="#efae2e", lash="#2b2357", brow="#4a47a6",
             cloth_shadow="#a69ae0", hair_shadow="#a99ef0", skin_shadow="#ecb8c6", line="#2b2357", blush=1.1,
             eye_style=dict(w=1.0, h=1.06, tilt=0.03, lash=1.0, iris=1.02), eyes="open", mouth="cat",
             hand_open=0.3)
    atlas = PT.PatternAtlas(4)
    b_star = PT.stars_band(atlas, "#ffe7a0", count=26, size=(8, 16), line="#e6bf5a")
    b_sgold = PT.lines_band(atlas, "#e6bf5a", [0.55, 0.85], [12, 5])
    S["atlas"] = atlas
    S["extra"] = ("knit", PT.knit_tile(os.path.join(TEX, "gem_knit.png"), line="#cfcbe0"))
    NAVY = C("#28245e"); NAVY2 = C("#3a3384"); PUR = C("#6e52d6"); LIL = C("#a48cf0"); WHITE = C("#f6f4fd")
    GOLD = C("#e8c05a"); SK = C(S["skin"]); IRI = [C("#a9c8ff"), C("#d3a8ff"), C("#ffb6e6"), C("#b6f0ff"), C("#fff0a8")]

    def torso(s, a, fc):
        if fc.z > 1.335:
            return NAVY
        if fc.z > 1.118:
            if fc.z > 1.215 and abs(fc.x) > 0.050 + (fc.z - 1.215) * 0.20:
                return SK
            if adist(a, 0.0) < 0.075 and fc.z > 1.15:
                return WHITE                     # 胸前白色片
            return NAVY
        if fc.z > 1.012:
            return SK                            # 露腰
        return NAVY
    S["torso_color"] = torso
    S["neck_color"] = lambda s, a, fc: NAVY if fc.z < 1.395 else SK
    S["neck_mat"] = I_CLOTH
    S["arm_color"] = lambda s, a, fc: SK

    def legc(s, a, fc):
        if fc.x < 0 and 0.640 < fc.z < 0.662:
            return C("#1d1b3c")                  # 右大腿腿环
        if fc.x > 0 and 0.335 < fc.z < 0.39:
            return NAVY                          # 左腿深蓝短袜口
        return SK
    S["leg_color"] = legc
    build_body(acc, rig, S)
    # 领口白边 + 胸前星
    cloth.trim_ring(acc, [V((0.026 * math.sin(t), 0.010 - 0.029 * math.cos(t), 1.336)) for t in
                          [k / 40 * TAU for k in range(40)]], 0.003, WHITE, I_CLOTH, W1("neck"))
    rx, ry, cy = torso_at(1.21)
    cloth.star_gem(acc, V((0, cy - ry * 1.16 - 0.006, 1.215)), V((0, -1, 0.1)), 0.026,
                   [C("#cfe6ff"), C("#e2ccff"), C("#bfe9ff")], I_GLOW, W1("chest"), rim=GOLD)
    # 斜挎紫色腰带
    band = []
    for k in range(30):
        t = k / 29
        a_ = lerp(0.30, -0.22, t)
        z = lerp(1.02, 1.115, t)
        rx, ry, cy = torso_at(z)
        th = a_ * TAU
        band.append(V((rx * 1.06 * math.sin(th), cy - ry * 1.06 * math.cos(th), z)))
    g = tube(band, [(0.020, 0.004)] * 30, n=10, out_fn=lambda p, t: V((p.x, p.y, 0)), cap_start=True, cap_end=True)
    acc.add(g, lambda s, a, fc: mixc(PUR, C("#c08cf4"), s), mat=I_CLOTH, weights=W1("spine"), ol=0.7)
    # 衬裙两层 + 百褶短裙（星点下摆）
    for z, rr, dr in ((0.815, 0.205, 0.055), (0.78, 0.225, 0.05)):
        cloth.frill_ring(acc, WHITE, I_CLOTH, z, rr, rr * 0.88, dr, 0.05, waves=30, amp=0.12, rows=5, n=240,
                         weights=cloth.skirt_weights(1.01, 0.70, 0.35), ol=0.5, lining=C("#e8e4f6"))

    def skc(s, a, fc):
        if adist(a, 0.04) < 0.055:
            return NAVY2
        return NAVY
    cloth.skirt(acc, rig, col, skc, I_CLOTH, 1.012, 0.80, (0.092, 0.066), (0.215, 0.185), n=168, rows=16,
                pleats=14, pleat_amp=0.07, bell=0.35, thigh=0.35, lining=C("#3c3480"),
                uvp=atlas.uvp(b_star, rep=6, s0=0.55, s1=1.0))
    cloth.chain(acc, [col.push_out(V((0.135 * math.sin(t), -0.115 * math.cos(t), 0.955 - 0.05 * math.cos(t))), 0.02)
                      for t in [lerp(-1.1, 1.0, k / 30) for k in range(31)]], 0.0035, GOLD, I_CLOTH, W1("hips"), 48)
    for p in (V((0.10, -0.13, 0.90)), V((-0.14, -0.10, 0.86))):
        cloth.star_gem(acc, col.push_out(p, 0.02), V((0.2 * p.x, -1, 0)), 0.018, IRI, I_GLOW, W1("hips"), rim=GOLD)
    cloth.star_gem(acc, V((-0.140, -0.035, 0.645)), V((-0.8, -1, 0)), 0.013, IRI, I_GLOW, W1("thigh.R"), rim=GOLD)
    # 袖：上臂白色泡袖 + 长垂的深蓝喇叭袖（紫里、金边、挂星）
    for side in (1, -1):
        sn = "L" if side > 0 else "R"
        cloth.sleeve(acc, rig, side, WHITE, I_CLOTH, s0=0.30, s1=0.66,
                     r_fn=lambda t: 0.031 + 0.012 * math.sin(t * math.pi), n=40)
        pts, radii = cloth.sleeve(acc, rig, side, lambda s, a, fc: mixc(NAVY, PUR, sstep(0.4, 1.0, s)), I_CLOTH,
                                  s0=0.62, s1=1.0, r_fn=lambda t: lerp(0.040, 0.15, sstep(0.0, 1.0, t) ** 0.8),
                                  hang=(0.46 if side > 0 else 0.40, 0.15), out=0.11, back=0.07, wave=0.04, freq=5,
                                  lining=LIL, n=64, uvp=atlas.uvp(b_sgold, rep=3, s0=0.88, s1=1.0))
        end = pts[-1]
        for k, da in enumerate((0.18, 0.45, 0.8)):
            th = da * TAU
            q = end + V((math.sin(th) * radii[-1] * side, -math.cos(th) * radii[-1], -0.012))
            cloth.chain(acc, [q, q + V((0, 0, -0.04))], 0.002, GOLD, I_CLOTH, W1(f"forearm.{sn}"), 6)
            cloth.star_gem(acc, q + V((0, 0, -0.06)), V((0, -1, 0)), 0.018, IRI, I_GLOW, W1(f"forearm.{sn}"), rim=GOLD)
    # 白色泡泡袜（罗纹）+ 厚底玛丽珍
    for side in (1, -1):
        sn = "L" if side > 0 else "R"
        g = leg_geo(side, extra=0.016, s0=0.66, s1=0.97, rfn=lambda s, a: 1 + 0.13 * abs(math.sin(s * 9 + a * 2)),
                    cap_end=False)
        acc.add(g, WHITE, mat=I_EXTRA, weights=rig.w_chain([f"shin.{sn}", f"foot.{sn}"]), ol=0.8,
                uvp=lambda s, a: (a * 2, s * 3))
        cloth.shoe(acc, rig, side, NAVY, I_CLOTH, heel=0.0, platform=0.05, length=0.19, width=0.043, height=0.055,
                   sole_col=C("#a9b8ff"), strap_col=GOLD)
        a_ = mirror(AN, side)
        cloth.bow(acc, V((a_.x, a_.y - 0.125, 0.10)), V((0, -1, 0.6)), 0.024, NAVY, I_CLOTH, W1(f"foot.{sn}"),
                  tails=False)
    # ---- 头发：蓝→紫粉渐变，超蓬松大波浪
    H = HairStyle(acc, rig, col, dict(base=C("#5a60de"), mid=C("#8b78ea"), tip=C("#d69cf0"), dark=C("#3b3aa6"),
                                      grad_top=1.42, grad_bot=0.50, grad_pow=0.9, mid_k=0.3, hl_z=0.05),
                  hl=C("#c9d0ff"), seed=21)
    H.cap()
    H.crown(count=28, whorl=(180, 18))
    H.bangs([(-56, 96, 0.031, 6), (-42, 103, 0.032, -8), (-28, 98, 0.030, 8), (-14, 106, 0.030, -6),
             (0, 100, 0.029, 9), (13, 105, 0.030, -9), (27, 98, 0.031, 7), (41, 102, 0.032, -6),
             (55, 95, 0.031, 6), (-6, 88, 0.020, 26), (20, 86, 0.020, -24)])
    for side in (1, -1):
        H.side_lock(side, 60, 1.00, 0.028, wave=0.03, fwd=0.01, out=0.04, seed=5 + side, curl=0.03)
        H.side_lock(side, 76, 0.90, 0.032, wave=0.035, fwd=-0.01, out=0.10, seed=8 + side, curl=0.04)
    H.back(z_end=0.62, count=16, layers=2, wave=0.05, freq=8.0, spread=2.0, width=0.08, y_back=0.11,
           curl_tip=0.05, z_jit=0.08, seed=22, out_flare=0.04)
    prof = hair.profile_fn([(1.42, 0.12), (1.27, 0.23), (1.12, 0.34), (0.97, 0.385), (0.82, 0.375), (0.68, 0.33)])
    H.mass({1: prof, -1: prof}, z_end=lambda side, u: lerp(0.62, 0.68, u), n_main=12, children=3, wave=0.045,
           waves=3.5, curl=0.05, width=0.085, seed=23, depth_in=0.12, depth_out=0.02)
    H.ahoge(az=4, h=0.08, curl=1.0)
    for side in (1, -1):   # 双侧小发髻
        c = cap_point(62 * side, 46, 1.10)
        g = ellipsoid(c, 0.036, 0.034, 0.033, nu=32, nv=18,
                      deform=lambda u: u * (1 + 0.07 * math.sin(math.atan2(u.y, u.x) * 6 + u.z * 5)))
        acc.add(g, C("#5a60de"), mat=I_HAIR, weights=W1("head"), ol=0.8)
    for side in (1, -1):   # 猫耳
        base = cap_point(40 * side, 32, 0.97)
        tip = base + V((0.040 * side, 0.010, 0.118))
        rings = []
        for i in range(16):
            t = i / 15
            c = base.lerp(tip, t)
            w = lerp(0.056, 0.002, t ** 1.0)
            d = lerp(0.020, 0.001, t)
            rings.append(ellipse_ring(c, w, d, 20, rfn=lambda a: 1 - 0.35 * math.exp(-(adist(a, 0.0) / 0.12) ** 2)))
        g = rings_to_geo(rings, True, cap_end=True)
        R = Matrix.Translation(base) @ Matrix.Rotation(math.radians(-16 * side), 4, "Y") @ \
            Matrix.Rotation(math.radians(-10), 4, "X") @ Matrix.Translation(-base)
        acc.add(g.transformed(R), lambda s, a, fc: C("#5a56d8") if adist(a, 0.0) > 0.17 else
                (C("#ffffff") if s < 0.25 else C("#f3a9c6")), mat=I_HAIR, weights=W1("head"), ol=0.9)
    p = cap_point(60, 52, 1.12)   # 星形发夹
    cloth.star_gem(acc, p, p - CAP_C, 0.032, [C("#7a63e8"), C("#b28cff"), C("#d9c8ff"), C("#8ab6ff")], I_GLOW,
                   W1("head"), rot=0.25, rim=GOLD, depth=0.45)
    p = cap_point(78, 64, 1.10)
    cloth.star_gem(acc, p, p - CAP_C, 0.012, IRI, I_GLOW, W1("head"))
    # ---- 猫尾（蓬松，蓝→紫）
    tp = [V((0, 0.07, 0.93)), V((-0.03, 0.17, 0.80)), V((-0.08, 0.17, 0.58)), V((-0.15, 0.10, 0.40)),
          V((-0.25, 0.04, 0.33)), V((-0.32, 0.01, 0.40)), V((-0.33, 0.0, 0.52)), V((-0.29, 0.0, 0.58))]
    pts = resample(bezier_pts(tp, 90), 64)
    tb = chain_bones(rig, "tail", pts, "hips", n=5)
    R = random.Random(4)
    lumps = [(R.uniform(0, TAU), R.uniform(5, 9), R.uniform(0.04, 0.09)) for _ in range(4)]
    radii = [0.020 + 0.030 * math.sin(min(1, i / 63 * 1.25) * math.pi * 0.92) for i in range(64)]
    radii[-1] = 0.004

    def rfn(s, a):
        k = 1.0
        for ph, fq, am in lumps:
            k += am * math.sin(a * TAU * fq + ph + s * 25)
        return k
    g = tube(pts, radii, n=28, rfn=rfn, cap_start=True, cap_end=True)
    acc.add(g, lambda s, a, fc: mixc(C("#5d66e2"), C("#c79af0"), s ** 0.9), mat=I_HAIR,
            weights=rig.w_chain(tb, blend=0.05), ol=0.9)
    return S


def sparkle_props():
    acc = Acc("Gemini_Sparkles")
    IRI = [C("#a9d4ff"), C("#e1b3ff"), C("#ffc4e8"), C("#c2fff3"), C("#fff1b0")]
    for p, r in ((V((-0.38, -0.05, 1.32)), 0.06), (V((0.40, -0.03, 1.52)), 0.075), (V((-0.30, -0.05, 1.62)), 0.03)):
        cloth.star_gem(acc, p, V((0, -1, 0)), r, IRI, 0, None, depth=0.35, ol=0.0)
    return acc


# ================================================================== Claude：橙发学者

def build_cla(acc, rig, col):
    S = dict(skin="#fcebe2", iris_r="#c8732e", iris_l="#c8732e", lash="#47220f", brow="#a5481d",
             cloth_shadow="#d6bcae", hair_shadow="#d98a6d", skin_shadow="#ebbac2", line="#47220f", blush=0.7,
             eye_style=dict(w=1.06, h=0.86, tilt=0.10, lash=1.05, iris=0.96), eyes="calm", mouth="flat",
             hand="#fbfaf6", hand_mat=I_CLOTH)
    atlas = PT.PatternAtlas(6)
    b_vine = PT.vine_band(atlas, "#de7a3c", motifs=6, line_col="#c79a4a", seed=2)
    b_pleat = PT.stripes_band(atlas, "#d8cbb5", period=26, width=4)
    b_edge = PT.lines_band(atlas, "#cf9f4c", [0.30, 0.42, 0.62], [10, 4, 4])
    b_sun = PT.sun_band(atlas, "#e07a35", count=2, r=150, rays=16)
    b_lace = PT.stripes_band(atlas, "#4a3328", period=64, width=5)
    b_vine2 = PT.vine_band(atlas, "#e9884a", motifs=5, line_col="#d0a24f", seed=9)
    S["atlas"] = atlas
    CREAM = C("#f4ecdf"); WHITE = C("#fcf9f2"); BLACK = C("#241b1d"); ORANGE = C("#df6c33"); GOLD = C("#d6a24a")

    def torso(s, a, fc):
        if 0.975 < fc.z < 1.150:
            if abs(fc.z - 1.145) < 0.005 or abs(fc.z - 0.98) < 0.005:
                return GOLD
            return BLACK
        return WHITE
    S["torso_color"] = torso
    S["neck_color"] = WHITE
    S["neck_mat"] = I_CLOTH
    S["arm_color"] = CREAM
    S["arm_mat"] = I_CLOTH
    S["arm_uvp"] = atlas.uvp(b_lace, rep=2, s0=0.62, s1=0.86)
    S["leg_color"] = C("#efe6d8")
    build_body(acc, rig, S)
    for z in (1.10, 1.04):   # 胸衣金扣
        rx, ry, cy = torso_at(z)
        for x in (-0.03, 0.03):
            cloth.button(acc, V((x, cy - ry * 0.99 - 0.002, z)), V((0, -1, 0)), 0.0055, GOLD, I_CLOTH, W1("spine"))
    # 荷叶高领 + 胸前层叠荷叶（jabot）
    cloth.frill_ring(acc, WHITE, I_CLOTH, 1.418, 0.030, 0.032, 0.036, 0.010, waves=16, amp=0.30, rows=4, n=160,
                     cy=0.010, weights=W1("neck"), ol=0.5)
    for k, z in enumerate((1.33, 1.30, 1.27, 1.24, 1.21)):
        rx, ry, cy = torso_at(z)
        bump = 1.16 if 1.17 < z < 1.24 else 1.0
        cloth.frill_ring(acc, WHITE, I_CLOTH, z, rx * 0.3, ry * bump + 0.008, 0.032, 0.014, waves=4, amp=0.35,
                         rows=4, n=60, cy=cy, a_range=(-0.07, 0.07), weights=W1("chest"), ol=0.45)
    # 披肩（奶油色、金边、左肩太阳纹，前开襟）+ 白色大翻领
    cp = [(1.392, 0.034, 0.036, 0.010), (1.36, 0.070, 0.058, 0.008), (1.33, 0.125, 0.077, 0.006),
          (1.300, 0.175, 0.098, 0.002), (1.255, 0.198, 0.118, -0.004), (1.205, 0.212, 0.132, -0.008),
          (1.165, 0.218, 0.140, -0.010)]
    g = loft(cp, n=120)
    g.keep(lambda s, a, c: adist(a, 0.0) > 0.03 + 0.05 * s)
    sun_uv = atlas.uvp(b_sun, rep=1.0, s0=0.35, s1=0.85)
    edge_uv = atlas.uvp(b_edge, rep=8, s0=0.84, s1=1.0)

    def cap_uv(s, a):
        if adist(a, 0.22) < 0.08 and 0.35 < s < 0.85:
            return sun_uv(s, (a - 0.14) / 0.16 * 0.5)
        return edge_uv(s, a)
    tw = body.torso_weights(rig)
    acc.add(g, CREAM, mat=I_CLOTH, weights=lambda p: {"chest": 0.85, "neck": 0.15} if p.z > 1.36 else tw(p),
            uvp=cap_uv)
    for side in (1, -1):
        flap = [(0.0, 0.0), (0.06 * side, -0.01), (0.085 * side, -0.07), (0.03 * side, -0.115), (0.008 * side, -0.05)]
        g = flat_shape(flap, 0.003, bevel=0.003)
        rx, ry, cy = torso_at(1.30)
        M = Matrix.Translation(V((0.0, cy - ry - 0.014, 1.352))) @ Matrix.Rotation(math.radians(-22), 4, "X") @ \
            Matrix.Scale(0.8, 4)
        acc.add(g.transformed(M), WHITE, mat=I_CLOTH, weights=W1("chest"), ol=0.7)
    # 黑色宽领巾 + 橙花胸针
    cloth.bow(acc, V((0, -0.050, 1.338)), V((0, -1, 0.35)), 0.024, BLACK, I_CLOTH, W1("chest"), tail_len=2.6)
    cloth.flower(acc, V((0, -0.054, 1.356)), V((0, -1, 0.25)), 0.020, 14, ORANGE, C("#f5b158"), I_CLOTH, W1("chest"))
    # 袖：上臂大泡袖 + 袖口荷叶
    for side in (1, -1):
        sn = "L" if side > 0 else "R"
        cloth.sleeve(acc, rig, side, CREAM, I_CLOTH, s0=0.02, s1=0.60,
                     r_fn=lambda t: 0.038 + 0.026 * math.sin(min(1.0, t * 1.15) * math.pi) ** 0.8, n=56)
        w = mirror(WR, side)
        d = (w - mirror(EL, side)).normalized()
        rr = []
        for i in range(5):
            t = i / 4
            c0 = w - d * 0.012 + d * 0.022 * t
            rr.append([c0 + V((math.sin(a_ * TAU), -math.cos(a_ * TAU), 0)) * (0.024 + 0.014 * t) *
                       (1 + 0.28 * t * math.sin(a_ * TAU * 11)) for a_ in [j / 88 for j in range(88)]])
        acc.add(rings_to_geo(rr, True), WHITE, mat=I_CLOTH, weights=W1(f"forearm.{sn}"), ol=0.45)
    # 长裙：奶油百褶 + 左前橙色竖片 + 下摆藤蔓刺绣 + 白荷叶
    vine_uv = atlas.uvp(b_vine, rep=7, s0=0.80, s1=0.955)
    pleat_uv = atlas.uvp(b_pleat, rep=3, s0=0.0, s1=0.80)

    def skc(s, a, fc):
        if 0.045 < a < 0.10 and s < 0.88:
            return ORANGE
        return CREAM

    def sk_uv(s, a):
        if s > 0.80:
            return vine_uv(s, a)
        if 0.045 < a < 0.10:
            return (0.001, 0.001)
        return pleat_uv(s, a)
    cloth.skirt(acc, rig, col, skc, I_CLOTH, 0.985, 0.075, (0.088, 0.064), (0.37, 0.33), n=200, rows=36,
                pleats=34, pleat_amp=0.022, folds=[(4, 0.02, 0.5)], bell=0.75, thigh=0.5, uvp=sk_uv,
                lining=C("#ece2d0"))
    cloth.frill_ring(acc, WHITE, I_CLOTH, 0.092, 0.370, 0.332, 0.07, 0.035, waves=38, amp=0.10, rows=5, n=280,
                     weights=cloth.skirt_weights(0.985, 0.06, 0.5), ol=0.5, lining=C("#ede6da"))
    # 外层黑裙片（两侧，橙色刺绣边，橙色里衬）
    cloth.skirt(acc, rig, col, BLACK, I_CLOTH, 0.99, 0.13, (0.094, 0.070), (0.40, 0.36), n=200, rows=30,
                folds=[(3, 0.04, 0.2), (7, 0.03, 1.1)], bell=0.75, thigh=0.5,
                cut=lambda a, t: adist(a, 0.0) < 0.12 + 0.10 * t,
                hem_fn=lambda a: 0.10 * math.cos(a * TAU) ** 2 * (math.cos(a * TAU) > 0),
                lining=ORANGE, uvp=atlas.uvp(b_vine2, rep=5, s0=0.80, s1=0.97), margin=0.016)
    # 最外层奶油色斜裙片（不对称：右侧长、左前开）
    cloth.skirt(acc, rig, col, CREAM, I_CLOTH, 0.995, 0.28, (0.098, 0.074), (0.42, 0.38), n=200, rows=26,
                folds=[(3, 0.05, 1.4), (6, 0.03, 0.4)], bell=0.7, thigh=0.45,
                cut=lambda a, t: (0.0 < a < 0.30 and t > 0.05) or adist(a, 0.0) < 0.05,
                hem_fn=lambda a: -0.10 * math.cos((a - 0.75) * TAU) - 0.05, lining=ORANGE,
                uvp=atlas.uvp(b_edge, rep=10, s0=0.88, s1=1.0), margin=0.024)
    # 金链 + 橙色垂带流苏 + 侧边蝴蝶结与橙花
    cloth.chain(acc, [col.push_out(V((0.11 * math.sin(t), -0.09 * math.cos(t), 1.00 - 0.035 * math.cos(t))), 0.008)
                      for t in [lerp(-1.2, 1.2, k / 24) for k in range(25)]], 0.0032, GOLD, I_CLOTH, W1("hips"), 36)
    tt = col.push_out(V((0.025, -0.10, 0.975)), 0.012)
    acc.add(tube([tt, tt + V((0.0, -0.012, -0.09)), tt + V((0.006, -0.016, -0.22))],
                 [(0.012, 0.003), (0.016, 0.003), (0.006, 0.002)], n=8, out_fn=lambda p, t: V((0, -1, 0))),
            ORANGE, mat=I_CLOTH, weights=W1("hips"), ol=0.6)
    cloth.tassel(acc, tt + V((0.006, -0.018, -0.23)), 0.05, 0.007, C("#d8a04e"), GOLD, I_CLOTH, W1("hips"))
    for p, n_ in ((V((-0.20, -0.14, 0.68)), V((-0.6, -1, 0))), (V((0.17, -0.20, 0.62)), V((0.5, -1, 0)))):
        q = col.push_out(p, 0.02)
        cloth.bow(acc, q, n_, 0.036, BLACK, I_CLOTH, W1("hips"), tail_len=1.2)
        cloth.flower(acc, q + V(n_).normalized() * 0.014, n_, 0.026, 14, ORANGE, C("#f5b158"), I_CLOTH, W1("hips"))
        cloth.tassel(acc, q + V((0, -0.01, -0.03)), 0.055, 0.006, C("#d8a04e"), GOLD, I_CLOTH, W1("hips"))
    for side in (1, -1):   # 系带高跟短靴
        cloth.shoe(acc, rig, side, C("#efe6d8"), I_CLOTH, heel=0.055, length=0.18, width=0.037, height=0.05,
                   toe_round=0.7, sole_col=C("#cdb796"), boot_top=0.23, boot_col=C("#efe6d8"),
                   boot_uvp=atlas.uvp(b_lace, rep=1, s0=0.0, s1=1.0))
    # ---- 头发：橙色、极长直发 + 飞丝
    H = HairStyle(acc, rig, col, dict(base=C("#ee7b34"), dark=C("#c5521e"), tip=C("#e86d2b"), grad_top=1.3,
                                      grad_bot=0.3, hl_z=0.05), hl=C("#ffc28f"), seed=31)
    H.cap()
    H.crown(count=30, whorl=(185, 16))
    H.bangs([(-62, 98, 0.030, 10), (-48, 104, 0.032, 14), (-34, 108, 0.033, 18), (-20, 110, 0.032, 20),
             (-6, 106, 0.030, 20), (8, 102, 0.030, 16), (22, 98, 0.030, 12), (36, 95, 0.030, 8),
             (50, 93, 0.030, 5), (-28, 96, 0.022, 30)])
    for side in (1, -1):
        H.side_lock(side, 56, 0.98, 0.030, wave=0.004, fwd=0.016, out=0.015, seed=2 + side)
        H.side_lock(side, 70, 0.86, 0.032, wave=0.006, fwd=0.004, out=0.03, seed=9 + side)
        H.side_lock(side, 84, 0.70, 0.034, wave=0.008, fwd=-0.01, out=0.06, seed=13 + side)
    H.back(z_end=0.66, count=18, layers=2, wave=0.004, spread=1.6, width=0.075, y_back=0.11, z_jit=0.05,
           straight=True, seed=33, out_flare=0.02)
    prof = hair.profile_fn([(1.42, 0.11), (1.27, 0.15), (1.12, 0.19), (0.97, 0.22), (0.82, 0.235), (0.68, 0.24)])
    H.mass({1: prof, -1: prof}, z_end=lambda side, u: lerp(0.66, 0.72, u), n_main=10, children=3, wave=0.006,
           waves=1.5, curl=0.0, width=0.07, seed=34, depth_in=0.12, depth_out=0.03, straight=True)
    H.wisps(8, (0.62, 1.0), 0.36, seed=12, width=0.009, curl=0.03)
    # 发饰：橙色菊花 + 黑缎带 + 白缎带流苏
    fp = cap_point(66, 46, 1.10)
    cloth.bow(acc, fp + V((0.006, 0.026, -0.022)), fp - CAP_C, 0.030, BLACK, I_CLOTH, W1("head"), tail_len=1.4)
    cloth.flower(acc, fp, fp - CAP_C, 0.040, 18, ORANGE, C("#f6b25c"), I_CLOTH, W1("head"))
    rib = fp + V((0.014, 0.020, -0.04))
    acc.add(tube([rib, rib + V((0.008, -0.004, -0.05)), rib + V((0.012, -0.006, -0.085))], [(0.010, 0.002)] * 3,
                 n=8, out_fn=lambda p, t: V((1, -0.3, 0))), WHITE, mat=I_CLOTH, weights=W1("head"), ol=0.6)
    cloth.tassel(acc, rib + V((0.012, -0.006, -0.09)), 0.03, 0.005, C("#f6f0e4"), GOLD, I_CLOTH, W1("head"))
    for side in (1, -1):   # 小金耳坠
        e = V((0.084 * side, 0.004, HC.z - 0.040))
        acc.add(ellipsoid(e + V((0, -0.002, -0.012)), 0.0035, 0.0035, 0.006, nu=10, nv=6), GOLD, mat=I_CLOTH,
                weights=W1("head"), ol=0.3)
    return S


def book_prop():
    acc = Acc("Claude_Book")
    Wb, Hb, Tb = 0.135, 0.185, 0.036
    cover = C("#6e2a21"); gold = C("#d7a54c"); page = C("#f3e7d0"); orange = C("#e07a35")
    vs = [V((sx * Wb / 2, sy * Tb / 2, sz * Hb / 2)) for sz in (-1, 1) for sy in (-1, 1) for sx in (-1, 1)]
    fs = [(0, 2, 3, 1), (4, 5, 7, 6), (0, 1, 5, 4), (2, 6, 7, 3), (0, 4, 6, 2), (1, 3, 7, 5)]
    box = Geo(vs, fs, [(0, k / 6) for k in range(6)])
    acc.add(box, lambda s, a, fc: page if (fc.x > Wb / 2 - 1e-4 or abs(fc.z) > Hb / 2 - 1e-4) else cover, mat=0)
    for sy in (-1, 1):
        y = sy * (Tb / 2 + 0.0012)
        rect = [V((-Wb / 2 + 0.012, y, -Hb / 2 + 0.012)), V((Wb / 2 - 0.012, y, -Hb / 2 + 0.012)),
                V((Wb / 2 - 0.012, y, Hb / 2 - 0.012)), V((-Wb / 2 + 0.012, y, Hb / 2 - 0.012)),
                V((-Wb / 2 + 0.012, y, -Hb / 2 + 0.012))]
        acc.add(tube(rect, [0.0022] * 5, n=6, cap_start=False, cap_end=False), gold, mat=0, ol=0.0)
        cloth.flower(acc, V((0, y + sy * 0.001, 0.0)), V((0, sy, 0)), 0.032, 16, orange, gold, 0, None, ol=0.0)
        for cx in (-1, 1):
            for cz in (-1, 1):
                acc.add(ellipsoid(V((cx * (Wb / 2 - 0.012), y, cz * (Hb / 2 - 0.012))), 0.007, 0.002, 0.007,
                                  nu=10, nv=6), gold, mat=0, ol=0.0)
    return acc


# ================================================================== DeepSeek：鲸鱼女仆

def build_ds(acc, rig, col):
    S = dict(skin="#fde9e2", iris_r="#3b7de0", iris_l="#3b7de0", lash="#1b2552", brow="#2a4590",
             cloth_shadow="#9eaae0", hair_shadow="#93a3e6", skin_shadow="#ecb8c4", line="#1b2552", blush=1.15,
             eye_style=dict(w=1.05, h=1.08, tilt=0.02, lash=1.0, iris=1.05), eyes="star", mouth="open",
             hand_open=0.6)
    atlas = PT.PatternAtlas(5)
    b_vine = PT.vine_band(atlas, "#cfa84e", motifs=5, line_col="#cfa84e", seed=4)
    b_pin = PT.stripes_band(atlas, "#dfe6ff", period=30, width=3)
    b_pleat = PT.stripes_band(atlas, "#d6dbef", period=40, width=4)
    b_cuff = PT.lines_band(atlas, "#cfa84e", [0.3, 0.7], [5, 5])
    S["atlas"] = atlas
    NAVY = C("#1f2b5e"); BLUE = C("#5468b4"); WHITE = C("#fbfbff"); GOLD = C("#d6ae50"); TIGHT = C("#f5f5fb")
    SK = C(S["skin"])

    def torso(s, a, fc):
        if fc.z > 1.235 and abs(fc.x) > 0.050 + (fc.z - 1.235) * 0.3:
            return SK                                   # 露肩
        if fc.z > 1.15:
            return WHITE                                # 白色褶皱衬胸
        return NAVY
    pleat_uv = atlas.uvp(b_pleat, rep=10, s0=0.0, s1=0.42)
    S["torso_color"] = torso
    S["torso_uvp"] = lambda s, a: pleat_uv(s, a) if (s < 0.42 and adist(a, 0) < 0.15) else (0.001, 0.001)
    S["neck_color"] = lambda s, a, fc: WHITE if fc.z < 1.385 else SK
    S["neck_mat"] = I_CLOTH
    S["arm_color"] = lambda s, a, fc: SK if s < 0.10 else NAVY
    S["arm_mat"] = I_CLOTH
    S["leg_color"] = TIGHT
    S["leg_mat"] = I_CLOTH
    build_body(acc, rig, S)
    # 领口白荷叶 + 黑领结（蓝宝石）
    cloth.frill_ring(acc, WHITE, I_CLOTH, 1.392, 0.028, 0.031, 0.022, 0.012, waves=10, amp=0.2, rows=3, n=120,
                     cy=0.010, weights=W1("neck"), ol=0.5)
    cloth.bow(acc, V((0, -0.036, 1.360)), V((0, -1, 0.25)), 0.024, C("#161c3c"), I_CLOTH, W1("chest"), tail_len=1.6)
    cloth.star_gem(acc, V((0, -0.045, 1.360)), V((0, -1, 0.2)), 0.008, [C("#6fb6ff"), C("#bfe2ff")], I_GLOW,
                   W1("chest"), concave=0.0, depth=0.6)
    for z in (1.29, 1.255, 1.22, 1.185):   # 胸前小扣
        rx, ry, cy = torso_at(z)
        bump = 1.16 if 1.17 < z < 1.24 else 1.0
        cloth.button(acc, V((0, cy - ry * bump - 0.003, z)), V((0, -1, 0)), 0.0045, NAVY, I_CLOTH, W1("chest"))
    for z in (1.115, 1.075):               # 腰封金扣
        rx, ry, cy = torso_at(z)
        for x in (-0.032, 0.032):
            cloth.button(acc, V((x, cy - ry * 0.95 - 0.003, z)), V((0, -1, 0)), 0.0065, GOLD, I_CLOTH, W1("spine"))
    # 肩带荷叶边（从胸前过肩到背后）
    for side in (1, -1):
        pts = []
        for k in range(24):
            t = k / 23
            z = 1.24 + 0.075 * math.sin(t * math.pi) + 0.02 * t
            x = side * (0.056 + 0.045 * math.sin(t * math.pi))
            y = lerp(-0.075, 0.07, t)
            pts.append(col.push_out(V((x, y, z)), 0.006))
        cloth.frill_along(acc, WHITE, I_CLOTH, pts, lambda p, side=side: V((side * 0.9, 0, -0.45)).normalized(),
                          0.032, waves=7, amp=0.35, rows=4, weights=W1("chest"), ol=0.5,
                          normal_fn=lambda p: V((0, -1, 0.3)).normalized())
    # 袖：落肩泡袖 + 长袖（金扣袖口带 + 白荷叶袖口）
    for side in (1, -1):
        sn = "L" if side > 0 else "R"
        cloth.sleeve(acc, rig, side, NAVY, I_CLOTH, s0=0.08, s1=0.48,
                     r_fn=lambda t: 0.036 + 0.026 * math.sin(min(1.0, t) * math.pi) ** 0.7, n=56)
        cloth.sleeve(acc, rig, side, NAVY, I_CLOTH, s0=0.84, s1=0.97, r_fn=lambda t: 0.0255, n=32,
                     uvp=atlas.uvp(b_cuff, rep=3, s0=0.0, s1=1.0))
        ap = arm_path(side, 40)
        q = ap[int(0.90 * 39)]
        d = (mirror(WR, side) - mirror(EL, side)).normalized()
        cloth.button(acc, q + V((0.0, -0.026, 0)), V((0, -1, 0)), 0.004, GOLD, I_CLOTH, W1(f"forearm.{sn}"))
        w = mirror(WR, side)
        rr = []
        for i in range(5):
            t = i / 4
            c0 = w - d * 0.004 + d * 0.024 * t
            rr.append([c0 + V((math.sin(a_ * TAU), -math.cos(a_ * TAU), 0)) * (0.024 + 0.016 * t) *
                       (1 + 0.3 * t * math.sin(a_ * TAU * 10)) for a_ in [j / 80 for j in range(80)]])
        acc.add(rings_to_geo(rr, True), WHITE, mat=I_CLOTH, weights=W1(f"forearm.{sn}"), ol=0.45)
    # 衬裙荷叶（两层）
    for z, rr_, dr in ((0.205, 0.325, 0.06), (0.17, 0.345, 0.05)):
        cloth.frill_ring(acc, WHITE, I_CLOTH, z, rr_, rr_ * 0.92, dr, 0.04, waves=30, amp=0.11, rows=5, n=240,
                         weights=cloth.skirt_weights(1.09, 0.15, 0.5), ol=0.5, lining=C("#e6e8f4"))
    # 内裙：蓝色细条纹
    cloth.skirt(acc, rig, col, BLUE, I_CLOTH, 1.085, 0.165, (0.084, 0.060), (0.31, 0.28), n=180, rows=30,
                folds=[(6, 0.02, 0.3)], bell=0.65, thigh=0.5, uvp=atlas.uvp(b_pin, rep=14, s0=0.0, s1=1.0),
                lining=C("#3e4f98"))
    # 外裙：深蓝，前开襟，下摆金色藤蔓
    cloth.skirt(acc, rig, col, NAVY, I_CLOTH, 1.09, 0.185, (0.088, 0.064), (0.35, 0.31), n=180, rows=30,
                folds=[(4, 0.035, 0.8), (9, 0.02, 0.2)], bell=0.68, thigh=0.5,
                cut=lambda a, t: adist(a, 0.0) < 0.06 + 0.07 * t ** 1.2, lining=C("#2c3a78"),
                uvp=atlas.uvp(b_vine, rep=6, s0=0.80, s1=0.97), margin=0.016)
    for a_ in (0.14, 0.86):
        th = a_ * TAU
        p = col.push_out(V((0.31 * math.sin(th), -0.29 * math.cos(th), 0.30)), 0.012)
        cloth.bow(acc, p, V((math.sin(th), -math.cos(th), 0)), 0.018, GOLD, I_CLOTH,
                  cloth.skirt_weights(1.09, 0.18, 0.5), tail_len=0.9)
    # 围裙：白色前片 + 荷叶边 + 小鲸鱼
    zs = [lerp(1.09, 0.50, i / 26) for i in range(27)]
    rings = []
    for z in zs:
        t = (1.09 - z) / (1.09 - 0.50)
        erx, ery, ecy = cloth.env(col, z)
        rx, ry = erx + 0.010, ery + 0.010
        half = lerp(0.105, 0.17, t ** 0.8)
        rings.append([V((rx * math.sin(a_ * TAU), ecy * 0.5 - ry * math.cos(a_ * TAU), z))
                      for a_ in [lerp(-half, half, j / 40) for j in range(41)]])
    g = rings_to_geo(rings, closed=False, centers=[V((0, 0, z)) for z in zs])
    wap = cloth.skirt_weights(1.09, 0.5, 0.4)
    acc.add(g, WHITE, mat=I_CLOTH, weights=wap)
    edge = [r[0] for r in rings][::-1] + rings[-1][1:] + [r[-1] for r in rings][-2::-1]
    edge = resample(edge, 120)
    cloth.frill_along(acc, WHITE, I_CLOTH, edge,
                      lambda p: (V((p.x, p.y, 0)).normalized() * 0.6 + V((0, 0, -0.8))).normalized(),
                      0.038, waves=34, amp=0.32, rows=4, weights=wap, ol=0.45,
                      normal_fn=lambda p: V((p.x, p.y, 0)).normalized())
    wh = [(-0.030, 0.0), (-0.018, 0.011), (0.006, 0.013), (0.020, 0.006), (0.030, 0.014), (0.036, 0.020),
          (0.034, 0.004), (0.040, -0.006), (0.026, -0.004), (0.012, -0.010), (-0.020, -0.010), (-0.030, -0.004)]
    erx, ery, ecy = cloth.env(col, 0.58)
    g = flat_shape(wh, 0.002)
    acc.add(g.transformed(place(V((0.05, ecy * 0.5 - (ery + 0.010) * 0.985 - 0.003, 0.58)), V((0.18, -1, 0)), scale=1.2)),
            NAVY, mat=I_CLOTH, weights=wap, ol=0.0)
    r0 = torso_at(1.09)
    cloth.trim_ring(acc, [V(((r0[0] + 0.012) * math.sin(t), 0.004 - (r0[1] + 0.012) * math.cos(t), 1.09))
                          for t in [k / 60 * TAU for k in range(60)]], 0.006, WHITE, I_CLOTH, W1("spine"))
    cloth.bow(acc, V((0, 0.085, 1.085)), V((0, 1, 0)), 0.06, WHITE, I_CLOTH, W1("spine"), tail_len=2.0)
    for side in (1, -1):   # 玛丽珍鞋
        cloth.shoe(acc, rig, side, NAVY, I_CLOTH, heel=0.02, length=0.18, width=0.038, height=0.048,
                   strap_col=NAVY, sole_col=C("#151a38"))
        a_ = mirror(AN, side)
        acc.add(ellipsoid(V((a_.x + 0.032 * side, a_.y - 0.075, 0.05)), 0.004, 0.003, 0.004, nu=8, nv=6), GOLD,
                mat=I_CLOTH, weights=W1(f"foot.{'L' if side > 0 else 'R'}"), ol=0.3)
    # ---- 头发：深蓝，发梢浅蓝，波浪，整体飘向右侧
    H = HairStyle(acc, rig, col, dict(base=C("#3452a8"), dark=C("#1c2a6a"), tip=C("#7cb4ea"), grad_top=1.15,
                                      grad_bot=0.55, grad_pow=1.3, hl_z=0.05), hl=C("#8fb0ff"), seed=41)
    H.cap()
    H.crown(count=30, whorl=(178, 18))
    H.bangs([(-56, 96, 0.031, 7), (-42, 103, 0.032, -7), (-28, 99, 0.030, 8), (-14, 106, 0.030, -8),
             (-1, 101, 0.029, 9), (12, 106, 0.030, -9), (26, 99, 0.031, 8), (40, 103, 0.032, -6),
             (54, 95, 0.031, 6), (6, 90, 0.020, -22)])
    for side in (1, -1):
        H.side_lock(side, 60, 1.06, 0.028, wave=0.022, fwd=0.012, out=0.03, seed=4 + side, curl=0.02)
        H.side_lock(side, 76, 0.96, 0.032, wave=0.028, fwd=-0.004, out=0.07, seed=6 + side, curl=0.03)
    H.back(z_end=0.72, count=16, layers=2, wave=0.04, freq=7.0, spread=1.8, width=0.08, y_back=0.11,
           lean=-0.06, curl_tip=0.04, z_jit=0.08, seed=42, out_flare=0.03)
    pr_r = hair.profile_fn([(1.42, 0.12), (1.27, 0.21), (1.12, 0.31), (0.97, 0.37), (0.85, 0.36)])
    pr_l = hair.profile_fn([(1.42, 0.11), (1.27, 0.16), (1.12, 0.20), (0.97, 0.215), (0.85, 0.21)])
    H.mass({-1: pr_r, 1: pr_l}, z_end=lambda side, u: lerp(0.80, 0.86, u) if side > 0 else lerp(0.76, 0.84, u),
           n_main=10, children=3, wave=0.035, waves=3.0, curl=0.045, width=0.08, seed=43, depth_in=0.12,
           depth_out=0.03)
    H.ahoge(az=-6, h=0.085, curl=-1.0)
    # 女仆头饰：白色荷叶发箍 + 左上蓝色蝴蝶结
    band = [cap_point(lerp(-95, 95, j / 79), 30 + 14 * (abs(j - 39.5) / 39.5) ** 2, 1.07) for j in range(80)]
    cloth.frill_along(acc, WHITE, I_CLOTH, band, lambda p: ((p - CAP_C).normalized() * 0.55 + V((0, -0.55, 0.25))).normalized(),
                      0.050, waves=22, amp=0.40, rows=5, weights=W1("head"), ol=0.5,
                      normal_fn=lambda p: V((0, -0.6, 0.8)).normalized())
    acc.add(tube(band, [(0.008, 0.004)] * 80, n=8, out_fn=lambda p, t: p - CAP_C), WHITE, mat=I_CLOTH,
            weights=W1("head"), ol=0.5)
    bp = cap_point(62, 46, 1.10)
    cloth.bow(acc, bp, bp - CAP_C, 0.024, C("#4fb0ea"), I_CLOTH, W1("head"), tails=True, tail_len=0.6)
    # 鲸鳍耳：向两侧斜下伸出，上深蓝、下灰白
    for side in (1, -1):
        base = V((0.095 * side, 0.016, HC.z - 0.008))
        ol_pts = [(0.0, 0.026), (0.055, 0.030), (0.110, 0.012), (0.150, -0.022), (0.162, -0.046), (0.130, -0.040),
                  (0.090, -0.030), (0.045, -0.028), (0.0, -0.022)]
        sm = resample(bezier_pts([V((x, 0, z)) for x, z in ol_pts] + [V((0.0, 0, 0.016))], 60), 60)
        g = flat_shape([(p.x, p.z) for p in sm], 0.010, bevel=0.004)
        Mx = Matrix.Translation(base) @ Matrix.Rotation(math.radians(22 * side), 4, "Z") @ \
            Matrix.Rotation(math.radians(-42 * side), 4, "Y") @ Matrix.Rotation(math.radians(40), 4, "X")
        if side < 0:
            Mx = Mx @ Matrix.Scale(-1, 4, V((1, 0, 0)))
            g.flip()
        acc.add(g.transformed(Mx), lambda s, a, fc: C("#24336f") if s < 0.3 else C("#dfe5f2"), mat=I_HAIR,
                weights=W1("head"), ol=0.9)
    # ---- 鲸尾 + 尾鳍
    tp = [V((0, 0.08, 0.92)), V((0.05, 0.22, 0.74)), V((0.17, 0.30, 0.50)), V((0.30, 0.29, 0.38)),
          V((0.40, 0.22, 0.46)), V((0.44, 0.17, 0.60))]
    pts = resample(bezier_pts(tp, 90), 60)
    tb = chain_bones(rig, "tail", pts, "hips", n=5)
    radii = [lerp(0.064, 0.016, (i / 59) ** 0.8) for i in range(60)]
    g = tube(pts, radii, n=24, cap_start=True, cap_end=True, up_hint=V((0, 0, 1)))
    acc.add(g, lambda s, a, fc: C("#253274") if adist(a, 0.5) > 0.2 else C("#6c84cc"), mat=I_CLOTH,
            weights=rig.w_chain(tb, blend=0.05), ol=0.9)
    end = pts[-1]
    d = (pts[-1] - pts[-5]).normalized()
    fl = [(0.0, 0.0), (0.06, 0.04), (0.14, 0.12), (0.19, 0.165), (0.20, 0.12), (0.17, 0.06), (0.15, 0.0),
          (0.17, -0.06), (0.20, -0.12), (0.19, -0.165), (0.14, -0.12), (0.06, -0.04)]
    sm = resample(bezier_pts([V((x, 0, z)) for x, z in fl] + [V((0, 0, 0))], 80), 80)
    g = flat_shape([(p.x, p.z) for p in sm], 0.012, bevel=0.004)
    xa = d
    za = V((1, 0, 0)).cross(d).normalized()
    if za.y > 0:
        za = -za
    ya = za.cross(xa)
    M = Matrix((xa, ya, za)).transposed().to_4x4()
    M.translation = end - d * 0.01
    acc.add(g.transformed(M), C("#253274"), mat=I_CLOTH, weights=W1(tb[-1]), ol=0.9)
    return S


BUILDERS = {"gpt": build_gpt, "gem": build_gem, "cla": build_cla, "ds": build_ds}
NAMES = {"gpt": "ChatGPT", "gem": "Gemini", "cla": "Claude", "ds": "DeepSeek"}
SCALE = {"gpt": 1.0, "gem": 0.95, "cla": 1.02, "ds": 0.98}


def char_materials(key, S):
    faces.set_layout(**body.FACE)
    eyes = os.path.join(TEX, f"eyes_{key}.png")
    mouth = os.path.join(TEX, "mouth.png")
    faces.eye_atlas(eyes, S["iris_r"], S["iris_l"], S["lash"], S["brow"], S.get("blush", 1.0), S.get("eye_style"))
    faces.mouth_atlas(mouth)
    ei = bpy.data.images.load(eyes, check_existing=False)
    mi = bpy.data.images.load(mouth, check_existing=True)
    pat = None
    if "atlas" in S:
        pp = S["atlas"].save(os.path.join(TEX, f"pattern_{key}.png"))
        pat = bpy.data.images.load(pp, check_existing=False)
    cloth_m = core.toon_vc(f"{key}_cloth", shadow=S["cloth_shadow"], pattern=pat)
    face_m = core.face_mat(f"{key}_face", S["skin"], ei, mi, shadow=S["skin_shadow"])
    glow = core.glow_vc(f"{key}_glow", strength=1.6)
    skin = core.toon_vc(f"{key}_skin", shadow=S["skin_shadow"], lo=0.05, hi=0.16)
    hair_m = core.toon_vc(f"{key}_hair", shadow=S["hair_shadow"])
    mats = [cloth_m, face_m, glow, skin, hair_m]
    if "extra" in S:
        tag, path = S["extra"]
        img = bpy.data.images.load(path, check_existing=False)
        mats.append(core.toon_vc(f"{key}_{tag}", shadow=S["cloth_shadow"], pattern=img))
    else:
        mats.append(cloth_m)
    ol = core.outline_mat(f"{key}_outline", tint=S["line"])
    return mats, ol


def build_character(key, location=(0, 0, 0), rot_z=0.0, collection=None):
    rig = base_rig()
    col = Collider()
    acc = Acc(f"{NAMES[key]}_body")
    S = BUILDERS[key](acc, rig, col)
    mats, ol = char_materials(key, S)
    arm = rig.build(f"{NAMES[key]}_rig", collection)
    mesh = acc.build(mats, outline_mat=ol, outline=0.0024, collection=collection)
    core.bind(mesh, arm)
    sub = mesh.modifiers.new("Subsurf", "SUBSURF")
    sub.levels = 1
    sub.render_levels = 1
    sub.quality = 1
    with bpy.context.temp_override(object=mesh, active_object=mesh):
        bpy.ops.object.modifier_move_to_index(modifier="Subsurf", index=1)
    s = SCALE[key]
    arm.scale = (s, s, s)
    arm.location = location
    arm.rotation_euler.z = rot_z
    core.set_face_cell(mats[1], "eyes", faces.EYE_CELLS.index(S.get("eyes", "open")))
    core.set_face_cell(mats[1], "mouth", faces.MOUTH_CELLS.index(S.get("mouth", "smile")))
    props = []
    if key == "cla":
        bm = book_prop().build([mats[0]], outline_mat=ol, outline=0.0022, collection=collection, recalc=True)
        bm.parent = arm
        bm.parent_type = "BONE"
        bm.parent_bone = "hand.R"
        props.append(bm)
    if key == "gpt":
        cm = cloud_prop().build([mats[0]], outline_mat=ol, outline=0.002, collection=collection)
        cm.parent = arm
        cm.location = (0.42, -0.10, 1.36)
        props.append(cm)
    if key == "gem":
        sm = sparkle_props().build([mats[2]], collection=collection)
        sm.parent = arm
        props.append(sm)
    return {"key": key, "arm": arm, "mesh": mesh, "face": mats[1], "mats": mats, "props": props, "rig": rig,
            "spec": S}
