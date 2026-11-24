"""深夜服务器 —— 公共工具：网格累加器、程序化几何、卡通材质、骨骼与权重。

所有角色都由这里的函数在脚本里生成，不读取任何外部模型/贴图。
坐标：Z 朝上，角色面向 -Y，角色的左手在 +X（骨骼后缀 .L）。
"""
import math
import os
import sys

import bpy
from mathutils import Vector, Matrix, Quaternion

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
import bpyx as bx  # noqa: E402

V = Vector
TAU = math.pi * 2
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))


# ------------------------------------------------------------------ 小工具

def C(h, a=1.0):
    """hex → 线性 RGBA"""
    return bx.rgba(h, a)


def lerp(a, b, t):
    return a + (b - a) * t


def mixc(c1, c2, t):
    t = max(0.0, min(1.0, t))
    return tuple(lerp(x, y, t) for x, y in zip(c1, c2))


def mulc(c, k):
    return tuple(x * k for x in c[:3]) + (c[3] if len(c) > 3 else 1.0,)


def sstep(e0, e1, x):
    if e1 == e0:
        return 1.0 if x >= e1 else 0.0
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def adist(a, b):
    """环形参数 a,b∈[0,1) 的最短距离"""
    d = abs((a - b) % 1.0)
    return min(d, 1 - d)


def piecewise(pts, s):
    """[(s0,v0),(s1,v1)...] 线性插值"""
    if s <= pts[0][0]:
        return pts[0][1]
    for (s0, r0), (s1, r1) in zip(pts, pts[1:]):
        if s0 <= s <= s1:
            return lerp(r0, r1, (s - s0) / max(s1 - s0, 1e-9))
    return pts[-1][1]


# ------------------------------------------------------------------ 几何片段

class Geo:
    """一块几何：顶点、面、每面参数 fp=(s,a)、每面每角参数 fcp=[(s,a)...]（不跨接缝回绕，可做 UV）。
    s 沿长度 0..1，a 绕一圈 0..1（0 = 正前方 -Y）。"""

    def __init__(self, verts=None, faces=None, fparam=None, fcp=None):
        self.v = verts or []
        self.f = faces or []
        self.fp = fparam or []
        self.fcp = fcp if fcp is not None else [[p] * len(f) for f, p in zip(self.f, self.fp)]

    def extend(self, g):
        b = len(self.v)
        self.v += g.v
        self.f += [tuple(i + b for i in f) for f in g.f]
        self.fp += g.fp
        self.fcp += g.fcp
        return self

    def transformed(self, m):
        return Geo([m @ v for v in self.v], list(self.f), list(self.fp), list(self.fcp))

    def flip(self, idx=None):
        rng = range(len(self.f)) if idx is None else idx
        for i in rng:
            self.f[i] = tuple(reversed(self.f[i]))
            self.fcp[i] = list(reversed(self.fcp[i]))
        return self

    def keep(self, pred):
        """pred(s, a, face_center)→True 保留"""
        F, P, CP = [], [], []
        for f, p, cp in zip(self.f, self.fp, self.fcp):
            c = sum((self.v[i] for i in f), Vector()) / len(f)
            if pred(p[0], p[1], c):
                F.append(f); P.append(p); CP.append(cp)
        self.f, self.fp, self.fcp = F, P, CP
        return self

    def map_verts(self, fn):
        self.v = [fn(v) for v in self.v]
        return self


def rings_to_geo(rings, closed=True, cap_start=False, cap_end=False, centers=None, orient=True):
    """若干等点数的环 → 网格。rings[i][j] 是 Vector。closed=True 时每环首尾相连。"""
    nr, n = len(rings), len(rings[0])
    verts = [p for r in rings for p in r]
    faces, fp, fcp = [], [], []
    nj = n if closed else n - 1
    den_a = n if closed else max(n - 1, 1)
    den_s = max(nr - 1, 1)
    for i in range(nr - 1):
        for j in range(nj):
            j2 = (j + 1) % n
            faces.append((i * n + j, i * n + j2, (i + 1) * n + j2, (i + 1) * n + j))
            fp.append(((i + 0.5) / den_s, (j + 0.5) / den_a))
            fcp.append([(i / den_s, j / den_a), (i / den_s, (j + 1) / den_a),
                        ((i + 1) / den_s, (j + 1) / den_a), ((i + 1) / den_s, j / den_a)])
    if cap_start:
        c = sum(rings[0], Vector()) / n
        ci = len(verts); verts.append(c)
        for j in range(nj):
            faces.append((ci, (j + 1) % n, j))
            fp.append((0.0, (j + 0.5) / den_a))
            fcp.append([(0.0, (j + 0.5) / den_a), (0.0, (j + 1) / den_a), (0.0, j / den_a)])
    if cap_end:
        c = sum(rings[-1], Vector()) / n
        ci = len(verts); verts.append(c)
        b = (nr - 1) * n
        for j in range(nj):
            faces.append((ci, b + j, b + (j + 1) % n))
            fp.append((1.0, (j + 0.5) / den_a))
            fcp.append([(1.0, (j + 0.5) / den_a), (1.0, j / den_a), (1.0, (j + 1) / den_a)])
    g = Geo(verts, faces, fp, fcp)
    if orient:
        _orient_outward(g, rings, centers)
    return g


def _face_normal(vs):
    n = Vector()
    for k in range(len(vs)):
        a, b = vs[k], vs[(k + 1) % len(vs)]
        n.x += (a.y - b.y) * (a.z + b.z)
        n.y += (a.z - b.z) * (a.x + b.x)
        n.z += (a.x - b.x) * (a.y + b.y)
    return n


def _orient_outward(g, rings, centers=None):
    """按多数票把面法线翻成朝外（远离各环中心）。"""
    if centers is None:
        centers = [sum(r, Vector()) / len(r) for r in rings]
    n = len(rings[0])
    score = 0.0
    for fi, f in enumerate(g.f):
        if len(f) != 4:
            continue
        ri = min(f[0] // n, len(centers) - 1)
        vs = [g.v[i] for i in f]
        fc = sum(vs, Vector()) / 4
        score += _face_normal(vs).dot(fc - centers[ri])
    if score < 0:
        g.flip()


def ellipse_ring(center, rx, ry, n, rfn=None, z=None, a0=0.0):
    """水平椭圆环。a=0 在正前方 (-Y)，a=0.25 在 +X（角色左侧）。rfn(a)→半径倍数。"""
    pts = []
    for j in range(n):
        a = (j / n + a0) % 1.0
        th = a * TAU
        k = rfn(a) if rfn else 1.0
        pts.append(Vector((center.x + rx * k * math.sin(th),
                           center.y - ry * k * math.cos(th),
                           center.z if z is None else z)))
    return pts


def loft(sections, n=32, cap_start=False, cap_end=False):
    """竖直放样。sections: [(z, rx, ry, cy[, cx[, rfn]])...]"""
    rings, cents = [], []
    for s in sections:
        z, rx, ry, cy = s[:4]
        cx = s[4] if len(s) > 4 else 0.0
        rfn = s[5] if len(s) > 5 else None
        c = Vector((cx, cy, z))
        rings.append(ellipse_ring(c, rx, ry, n, rfn))
        cents.append(c)
    return rings_to_geo(rings, True, cap_start, cap_end, centers=cents)


def frames_along(path, up_hint=None, out_fn=None):
    """沿路径求每点的 (T, N, B)。out_fn(p,T)→希望 N 指向的方向；否则用平行移动。"""
    T = []
    for i in range(len(path)):
        a = path[max(i - 1, 0)]
        b = path[min(i + 1, len(path) - 1)]
        t = (b - a)
        T.append(t.normalized() if t.length > 1e-9 else Vector((0, 0, 1)))
    frames = []
    if out_fn is None:
        up = Vector(up_hint) if up_hint is not None else Vector((0, -1, 0))
        if abs(up.normalized().dot(T[0])) > 0.95:
            up = Vector((1, 0, 0))
        N = (up - T[0] * up.dot(T[0])).normalized()
        for i, t in enumerate(T):
            if i > 0:
                N = (N - t * N.dot(t))
                if N.length < 1e-6:
                    N = frames[-1][1]
                N = N.normalized()
            frames.append((t, N, t.cross(N)))
    else:
        for p, t in zip(path, T):
            o = out_fn(p, t)
            N = o - t * o.dot(t)
            if N.length < 1e-6:
                N = frames[-1][1] if frames else Vector((0, -1, 0))
            N = N.normalized()
            frames.append((t, N, t.cross(N)))
    return frames


def tube(path, radii, n=12, up_hint=None, out_fn=None, cap_start=True, cap_end=True,
         flat=1.0, rfn=None, twist=0.0, bend=0.0, offset_fn=None):
    """沿路径扫掠截面。radii: 每点半径（数字）或 (宽, 厚)。
    宽方向沿 B，厚方向沿 N（out_fn 给出的"朝外"方向）。
    bend>0：截面弯成新月形（中间朝外鼓、两边向内卷），做发束用。
    rfn(s, a)→半径倍数；offset_fn(s, a)→沿 N 的额外偏移（米）。"""
    path = [Vector(p) for p in path]
    fr = frames_along(path, up_hint, out_fn)
    m = len(path)
    rings, cents = [], []
    for i, (p, (t, N, B)) in enumerate(zip(path, fr)):
        r = radii[i]
        rw, rt = (r, r * flat) if not isinstance(r, (tuple, list)) else r
        s = i / max(m - 1, 1)
        ring = []
        for j in range(n):
            a = j / n
            th = a * TAU + twist * s
            k = rfn(s, a) if rfn else 1.0
            cx = math.sin(th)
            cy = -math.cos(th)
            off = bend * rw * (1 - cx * cx) if bend else 0.0
            if offset_fn:
                off += offset_fn(s, a)
            ring.append(p + (B * cx * rw + N * cy * rt) * k + N * off)
        rings.append(ring)
        cents.append(p + N * (bend * rw * 0.5 if bend else 0.0))
    return rings_to_geo(rings, True, cap_start, cap_end, centers=cents)


def ellipsoid(center, rx, ry, rz, nu=24, nv=14, deform=None):
    """椭球（两极三角扇封口）。deform(unit_vec)→unit_vec 可整形。"""
    center = Vector(center)
    rings, cents = [], []
    for i in range(1, nv):
        ph = -math.pi / 2 + math.pi * i / nv
        z = math.sin(ph)
        rr = math.cos(ph)
        ring = []
        for j in range(nu):
            th = j / nu * TAU
            u = Vector((rr * math.sin(th), -rr * math.cos(th), z))
            if deform:
                u = deform(u)
            ring.append(center + Vector((u.x * rx, u.y * ry, u.z * rz)))
        rings.append(ring)
        cents.append(center + Vector((0, 0, z * rz)))
    g = rings_to_geo(rings, True, False, False, centers=cents, orient=False)
    for pole, ring_i, zz in ((-1, 0, -1.0), (1, len(rings) - 1, 1.0)):
        u = Vector((0, 0, zz))
        if deform:
            u = deform(u)
        pi_ = len(g.v)
        g.v.append(center + Vector((u.x * rx, u.y * ry, u.z * rz)))
        b = ring_i * nu
        for j in range(nu):
            j2 = (j + 1) % nu
            f = (pi_, b + j2, b + j) if pole < 0 else (pi_, b + j, b + j2)
            g.f.append(f)
            s_ = 0.0 if pole < 0 else 1.0
            g.fp.append((s_, (j + 0.5) / nu))
            g.fcp.append([(s_, (j + 0.5) / nu), (s_, (j + 1) / nu), (s_, j / nu)])
    sc = 0.0
    for f in g.f:
        vs = [g.v[i] for i in f]
        sc += _face_normal(vs).dot(sum(vs, Vector()) / len(vs) - center)
    if sc < 0:
        g.flip()
    return g


def bezier_pts(ctrl, n=24):
    """Catmull-Rom 过所有控制点。"""
    ctrl = [Vector(c) for c in ctrl]
    if len(ctrl) == 2:
        return [ctrl[0].lerp(ctrl[1], i / (n - 1)) for i in range(n)]
    pts = []
    P = [ctrl[0] * 2 - ctrl[1]] + ctrl + [ctrl[-1] * 2 - ctrl[-2]]
    segs = len(ctrl) - 1
    for k in range(n):
        u = k / (n - 1) * segs
        i = min(int(u), segs - 1)
        t = u - i
        p0, p1, p2, p3 = P[i], P[i + 1], P[i + 2], P[i + 3]
        t2, t3 = t * t, t * t * t
        pts.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2
                          + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    return pts


def resample(pts, n):
    """按弧长重采样到 n 个点。"""
    d = [0.0]
    for a, b in zip(pts, pts[1:]):
        d.append(d[-1] + (b - a).length)
    L = d[-1]
    out = []
    k = 0
    for i in range(n):
        s = L * i / (n - 1)
        while k < len(d) - 2 and d[k + 1] < s:
            k += 1
        seg = d[k + 1] - d[k]
        t = 0 if seg < 1e-9 else (s - d[k]) / seg
        out.append(pts[k].lerp(pts[k + 1], t))
    return out


def smooth_pts(pts, it=2):
    for _ in range(it):
        pts = [pts[0]] + [(pts[i - 1] + pts[i] * 2 + pts[i + 1]) / 4 for i in range(1, len(pts) - 1)] + [pts[-1]]
    return pts


def flat_shape(outline, thickness, offset=0.0, bevel=0.0):
    """平面多边形（XZ 平面轮廓 list[(x,z)]）挤出成薄片，正面朝 -Y。bevel>0 时正面中间略鼓。"""
    n = len(outline)
    cx = sum(x for x, _ in outline) / n
    cz = sum(z for _, z in outline) / n
    front = [Vector((x, offset - thickness / 2, z)) for x, z in outline]
    back = [Vector((x, offset + thickness / 2, z)) for x, z in outline]
    verts = front + back + [Vector((cx, offset - thickness / 2 - bevel, cz)),
                            Vector((cx, offset + thickness / 2 + bevel * 0.3, cz))]
    cf, cb = 2 * n, 2 * n + 1
    faces, fp, fcp = [], [], []
    for j in range(n):
        j2 = (j + 1) % n
        faces.append((cf, j2, j)); fp.append((0.0, j / n)); fcp.append([(0.0, j / n)] * 3)
        faces.append((cb, n + j, n + j2)); fp.append((1.0, j / n)); fcp.append([(1.0, j / n)] * 3)
        faces.append((j, j2, n + j2, n + j)); fp.append((0.5, j / n)); fcp.append([(0.5, j / n)] * 4)
    g = Geo(verts, faces, fp, fcp)
    nn = _face_normal([verts[i] for i in faces[0]])
    if nn.y > 0:
        g.flip()
    return g


def star_outline(n_pts, r_out, r_in, cx=0.0, cz=0.0, rot=0.0, sub=2, concave=0.0):
    """星形轮廓（n 角）。concave>0 让边内凹（Gemini 的四角星）。"""
    pts = []
    for k in range(n_pts * 2):
        for s in range(sub):
            u = (k + s / sub) / (n_pts * 2)
            ang = rot + u * TAU
            kk = k % 2
            t = s / sub
            r0 = r_out if kk == 0 else r_in
            r1 = r_in if kk == 0 else r_out
            r = lerp(r0, r1, t)
            if concave:
                r *= 1 - concave * math.sin(t * math.pi)
            pts.append((cx + r * math.sin(ang), cz + r * math.cos(ang)))
    return pts


def place(center, normal, up=Vector((0, 0, 1)), scale=1.0):
    """局部坐标：-Y 朝 normal，+Z 朝 up。"""
    n = Vector(normal).normalized()
    ly = -n
    lz = Vector(up) - n * Vector(up).dot(n)
    if lz.length < 1e-6:
        lz = Vector((0, 1, 0)) - n * n.y
    lz.normalize()
    lx = ly.cross(lz)
    sc = scale if isinstance(scale, (tuple, list)) else (scale, scale, scale)
    m = Matrix((lx * sc[0], ly * sc[1], lz * sc[2])).transposed().to_4x4()
    m.translation = Vector(center)
    return m


# ------------------------------------------------------------------ 网格累加器

class Acc:
    """把很多几何片段累加成一个网格对象：材质索引、面角颜色、UV、骨骼权重、描边粗细。"""

    def __init__(self, name):
        self.name = name
        self.v, self.f, self.fmat, self.fcol, self.fuv = [], [], [], [], []
        self.w, self.ol, self.fmask, self.smooth = [], [], [], []

    def add(self, g, color, *, mat=0, weights=None, uv=None, uvp=None, ol=1.0, smooth=True, facemask=None,
            xform=None, vcol=False):
        """color: RGBA / fn(s, a, face_center)→RGBA。weights: {bone:w} / fn(p)→{bone:w}。
        uv: fn(p)→(u,v)（按顶点）；uvp: fn(s,a)→(u,v)（按面角参数，适合花纹贴图）。
        ol: 描边粗细系数（0 = 不描边），可为 fn(p)。"""
        if xform is not None:
            g = g.transformed(xform)
        b = len(self.v)
        self.v += g.v
        for p in g.v:
            if weights is None:
                self.w.append({})
            elif callable(weights):
                self.w.append(weights(p))
            else:
                self.w.append(dict(weights))
            self.ol.append(ol(p) if callable(ol) else ol)
            self.fmask.append(facemask(p) if facemask else 0.0)
        for fi, f in enumerate(g.f):
            self.f.append(tuple(i + b for i in f))
            self.fmat.append(mat)
            self.smooth.append(smooth)
            if callable(color) and vcol:
                s, a = g.fp[fi] if fi < len(g.fp) else (0.0, 0.0)
                c = [color(s, a, g.v[i]) for i in f]      # 按角求色：渐变平滑，无台阶
            elif callable(color):
                s, a = g.fp[fi] if fi < len(g.fp) else (0.0, 0.0)
                fc = sum((g.v[i] for i in f), Vector()) / len(f)
                c = color(s, a, fc)
            else:
                c = color
            self.fcol.append(c)
            if uv:
                self.fuv.append([uv(g.v[i]) for i in f])
            elif uvp:
                cps = g.fcp[fi] if fi < len(g.fcp) else [(0.0, 0.0)] * len(f)
                self.fuv.append([uvp(s_, a_) for s_, a_ in cps])
            else:
                self.fuv.append([(0.001, 0.001)] * len(f))
        return self

    def build(self, mats, outline_mat=None, outline=0.004, collection=None, recalc=False):
        me = bpy.data.meshes.new(self.name)
        me.from_pydata([tuple(v) for v in self.v], [], self.f)
        if recalc:
            import bmesh
            bm = bmesh.new(); bm.from_mesh(me)
            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
            bm.to_mesh(me); bm.free()
        me.polygons.foreach_set("material_index", self.fmat)
        me.polygons.foreach_set("use_smooth", self.smooth)
        col = []
        for f, c in zip(self.f, self.fcol):
            if isinstance(c, list):
                for cc in c:
                    col += list(cc)
            else:
                col += list(c) * len(f)
        ca = me.color_attributes.new("Col", "FLOAT_COLOR", "CORNER")
        ca.data.foreach_set("color", col)
        uvl = me.uv_layers.new(name="UVMap")
        uvf = [x for face in self.fuv for uv in face for x in uv]
        uvl.data.foreach_set("uv", uvf)
        fa = me.attributes.new("facemask", "FLOAT", "POINT")
        fa.data.foreach_set("value", self.fmask)
        me.update()
        ob = bpy.data.objects.new(self.name, me)
        (collection or bpy.context.scene.collection).objects.link(ob)
        for m in mats:
            me.materials.append(m)
        groups = {}
        for vi, wd in enumerate(self.w):
            for bn, wt in wd.items():
                if wt <= 0.004:
                    continue
                groups.setdefault(bn, {}).setdefault(round(wt, 3), []).append(vi)
        for bn, by_w in groups.items():
            vg = ob.vertex_groups.new(name=bn)
            for wt, idx in by_w.items():
                vg.add(idx, wt, "REPLACE")
        olg = ob.vertex_groups.new(name="_outline")
        by = {}
        for vi, o in enumerate(self.ol):
            by.setdefault(round(o, 2), []).append(vi)
        for o, idx in by.items():
            if o > 0:
                olg.add(idx, o, "REPLACE")
        if outline_mat is not None and outline > 0:
            n = len(mats)
            for _ in range(n):
                me.materials.append(outline_mat)
            sm = ob.modifiers.new("Outline", "SOLIDIFY")
            sm.thickness = outline
            sm.offset = 1.0
            sm.use_flip_normals = True
            sm.use_rim = False
            sm.use_even_offset = False
            sm.material_offset = n
            sm.vertex_group = "_outline"
            sm.thickness_vertex_group = 0.0
        return ob


# ------------------------------------------------------------------ 材质

def toon_group():
    """节点组 ToonShade：Base(颜色)、Shadow(阴影色倍率)、Lo/Hi(明暗分界)；输出 Color。
    漫反射 → Shader to RGB → 亮度平滑分段（卡通明暗），保留灯光色相（暖主光/冷轮廓光）。"""
    if "ToonShade" in bpy.data.node_groups:
        return bpy.data.node_groups["ToonShade"]
    g = bpy.data.node_groups.new("ToonShade", "ShaderNodeTree")
    g.interface.new_socket("Base", in_out="INPUT", socket_type="NodeSocketColor")
    g.interface.new_socket("Shadow", in_out="INPUT", socket_type="NodeSocketColor")
    g.interface.new_socket("Lo", in_out="INPUT", socket_type="NodeSocketFloat")
    g.interface.new_socket("Hi", in_out="INPUT", socket_type="NodeSocketFloat")
    g.interface.new_socket("Floor", in_out="INPUT", socket_type="NodeSocketFloat")
    g.interface.new_socket("Color", in_out="OUTPUT", socket_type="NodeSocketColor")
    N, L = g.nodes, g.links
    gi = N.new("NodeGroupInput")
    go = N.new("NodeGroupOutput")
    dif = N.new("ShaderNodeBsdfDiffuse")
    dif.inputs["Color"].default_value = (1, 1, 1, 1)
    dif.inputs["Roughness"].default_value = 1.0
    s2r = N.new("ShaderNodeShaderToRGB")
    L.new(dif.outputs[0], s2r.inputs[0])
    bw = N.new("ShaderNodeRGBToBW")
    L.new(s2r.outputs["Color"], bw.inputs[0])
    mr = N.new("ShaderNodeMapRange")
    mr.interpolation_type = "SMOOTHSTEP"
    L.new(bw.outputs[0], mr.inputs["Value"])
    L.new(gi.outputs["Lo"], mr.inputs["From Min"])
    L.new(gi.outputs["Hi"], mr.inputs["From Max"])
    mx = N.new("ShaderNodeMath"); mx.operation = "MAXIMUM"; mx.inputs[1].default_value = 0.06
    L.new(bw.outputs[0], mx.inputs[0])
    div = N.new("ShaderNodeMix"); div.data_type = "RGBA"; div.blend_type = "DIVIDE"
    div.inputs["Factor"].default_value = 1.0
    L.new(s2r.outputs["Color"], div.inputs[6])
    L.new(mx.outputs[0], div.inputs[7])
    hue = N.new("ShaderNodeMix"); hue.data_type = "RGBA"
    hue.inputs["Factor"].default_value = 0.35
    hue.inputs[6].default_value = (1, 1, 1, 1)
    L.new(div.outputs[2], hue.inputs[7])
    lumc = N.new("ShaderNodeMath"); lumc.operation = "MINIMUM"; lumc.inputs[1].default_value = 1.4
    L.new(bw.outputs[0], lumc.inputs[0])
    lg = N.new("ShaderNodeMath"); lg.operation = "MULTIPLY_ADD"
    lg.inputs[1].default_value = 0.10; lg.inputs[2].default_value = 0.92
    L.new(lumc.outputs[0], lg.inputs[0])
    lit = N.new("ShaderNodeMix"); lit.data_type = "RGBA"; lit.blend_type = "MULTIPLY"
    lit.inputs["Factor"].default_value = 1.0
    L.new(gi.outputs["Base"], lit.inputs[6])
    L.new(hue.outputs[2], lit.inputs[7])
    litg = N.new("ShaderNodeVectorMath"); litg.operation = "SCALE"
    L.new(lit.outputs[2], litg.inputs[0])
    L.new(lg.outputs[0], litg.inputs["Scale"])
    sh = N.new("ShaderNodeMix"); sh.data_type = "RGBA"; sh.blend_type = "MULTIPLY"
    sh.inputs["Factor"].default_value = 1.0
    L.new(gi.outputs["Base"], sh.inputs[6])
    L.new(gi.outputs["Shadow"], sh.inputs[7])
    sh2 = N.new("ShaderNodeMix"); sh2.data_type = "RGBA"; sh2.blend_type = "MULTIPLY"
    sh2.inputs["Factor"].default_value = 0.3
    L.new(sh.outputs[2], sh2.inputs[6])
    L.new(hue.outputs[2], sh2.inputs[7])
    fl = N.new("ShaderNodeMath"); fl.operation = "MAXIMUM"
    L.new(mr.outputs[0], fl.inputs[0])
    L.new(gi.outputs["Floor"], fl.inputs[1])
    out = N.new("ShaderNodeMix"); out.data_type = "RGBA"
    L.new(fl.outputs[0], out.inputs["Factor"])
    L.new(sh2.outputs[2], out.inputs[6])
    L.new(litg.outputs[0], out.inputs[7])
    L.new(out.outputs[2], go.inputs["Color"])
    return g


def _toon_wrap(m, base_socket_fn, shadow="#b9a3c9", lo=0.08, hi=0.22):
    nt = m.node_tree
    N, L = nt.nodes, nt.links
    for n in list(N):
        N.remove(n)
    out = N.new("ShaderNodeOutputMaterial")
    grp = N.new("ShaderNodeGroup")
    grp.node_tree = toon_group()
    grp.inputs["Shadow"].default_value = C(shadow)
    grp.inputs["Lo"].default_value = lo
    grp.inputs["Hi"].default_value = hi
    base = base_socket_fn(N, L)
    L.new(base, grp.inputs["Base"])
    em = N.new("ShaderNodeEmission")
    em.name = "TOON_EMIT"
    em.inputs["Strength"].default_value = 1.0
    L.new(grp.outputs["Color"], em.inputs["Color"])
    L.new(em.outputs[0], out.inputs["Surface"])
    return m


def _pattern_mix(N, L, base_sock, img):
    """base 颜色上叠一张花纹贴图（按 UVMap，alpha 混合）。"""
    uv = N.new("ShaderNodeUVMap"); uv.uv_map = "UVMap"
    tx = N.new("ShaderNodeTexImage"); tx.image = img
    tx.interpolation = "Cubic"; tx.extension = "REPEAT"
    L.new(uv.outputs["UV"], tx.inputs["Vector"])
    mx = N.new("ShaderNodeMix"); mx.data_type = "RGBA"
    L.new(tx.outputs["Alpha"], mx.inputs["Factor"])
    L.new(base_sock, mx.inputs[6])
    L.new(tx.outputs["Color"], mx.inputs[7])
    return mx.outputs[2]


def toon_vc(name="ToonVC", shadow="#b8a6cc", lo=0.08, hi=0.22, pattern=None):
    """面角颜色作底色的卡通材质；pattern 为花纹贴图（可选）。"""
    m = bpy.data.materials.new(name)

    def base(N, L):
        a = N.new("ShaderNodeAttribute")
        a.attribute_name = "Col"
        a.attribute_type = "GEOMETRY"
        s = a.outputs["Color"]
        if pattern is not None:
            s = _pattern_mix(N, L, s, pattern)
        return s
    _toon_wrap(m, base, shadow, lo, hi)
    m.diffuse_color = (0.8, 0.8, 0.8, 1)
    return m


def glow_vc(name="GlowVC", strength=3.0):
    """顶点色自发光（星星、霓虹饰品），带一点面朝向明暗，像宝石。"""
    m = bpy.data.materials.new(name)
    nt = m.node_tree
    N, L = nt.nodes, nt.links
    for n in list(N):
        N.remove(n)
    out = N.new("ShaderNodeOutputMaterial")
    a = N.new("ShaderNodeAttribute"); a.attribute_name = "Col"
    lw = N.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.35
    mr = N.new("ShaderNodeMapRange")
    mr.inputs["To Min"].default_value = 1.3
    mr.inputs["To Max"].default_value = 0.6
    L.new(lw.outputs["Facing"], mr.inputs["Value"])
    sc = N.new("ShaderNodeVectorMath"); sc.operation = "SCALE"
    L.new(a.outputs["Color"], sc.inputs[0])
    L.new(mr.outputs[0], sc.inputs["Scale"])
    em = N.new("ShaderNodeEmission"); em.name = "GLOW"
    em.inputs["Strength"].default_value = strength
    L.new(sc.outputs[0], em.inputs["Color"])
    L.new(em.outputs[0], out.inputs["Surface"])
    return m


def outline_mat(name="Outline", k=0.28, tint="#3a2a40"):
    """反向外壳描边：背面剔除（相机与阴影都剔除），颜色 = 顶点色压暗 + 统一色调。"""
    m = bpy.data.materials.new(name)
    m.use_backface_culling = True
    m.use_backface_culling_shadow = True
    nt = m.node_tree
    N, L = nt.nodes, nt.links
    for n in list(N):
        N.remove(n)
    out = N.new("ShaderNodeOutputMaterial")
    a = N.new("ShaderNodeAttribute"); a.attribute_name = "Col"
    mul = N.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"
    mul.inputs["Factor"].default_value = 1.0
    L.new(a.outputs["Color"], mul.inputs[6])
    mul.inputs[7].default_value = C(tint)
    mx = N.new("ShaderNodeMix"); mx.data_type = "RGBA"
    mx.inputs["Factor"].default_value = 0.5
    L.new(mul.outputs[2], mx.inputs[6])
    mx.inputs[7].default_value = C(tint)
    sc = N.new("ShaderNodeVectorMath"); sc.operation = "SCALE"
    sc.inputs["Scale"].default_value = k * 2.2
    L.new(mx.outputs[2], sc.inputs[0])
    em = N.new("ShaderNodeEmission")
    L.new(sc.outputs[0], em.inputs["Color"])
    L.new(em.outputs[0], out.inputs["Surface"])
    return m


def face_mat(name, skin_hex, eyes_img, mouth_img, eye_grid=(4, 2), mouth_grid=(4, 2),
             shadow="#d9a7a7"):
    """皮肤 + 两层表情贴图（眼睛 / 嘴）。图集格子由 Mapping 节点位移切换，可打关键帧。"""
    m = bpy.data.materials.new(name)

    def base(N, L):
        uv = N.new("ShaderNodeUVMap"); uv.uv_map = "UVMap"
        fm = N.new("ShaderNodeAttribute"); fm.attribute_name = "facemask"
        skin = N.new("ShaderNodeRGB"); skin.outputs[0].default_value = C(skin_hex)
        col_prev = skin.outputs[0]
        for tag, img, grid in (("eyes", eyes_img, eye_grid), ("mouth", mouth_img, mouth_grid)):
            mp = N.new("ShaderNodeMapping")
            mp.name = f"MAP_{tag}"
            mp.inputs["Scale"].default_value = (1 / grid[0], 1 / grid[1], 1)
            L.new(uv.outputs["UV"], mp.inputs["Vector"])
            tx = N.new("ShaderNodeTexImage"); tx.image = img
            tx.interpolation = "Cubic"; tx.extension = "CLIP"
            L.new(mp.outputs[0], tx.inputs["Vector"])
            am = N.new("ShaderNodeMath"); am.operation = "MULTIPLY"
            L.new(tx.outputs["Alpha"], am.inputs[0])
            L.new(fm.outputs["Fac"], am.inputs[1])
            mx = N.new("ShaderNodeMix"); mx.data_type = "RGBA"
            L.new(am.outputs[0], mx.inputs["Factor"])
            L.new(col_prev, mx.inputs[6])
            L.new(tx.outputs["Color"], mx.inputs[7])
            col_prev = mx.outputs[2]
        return col_prev
    _toon_wrap(m, base, shadow=shadow, lo=0.05, hi=0.16)
    nt = m.node_tree
    N, L = nt.nodes, nt.links
    grp = [n for n in N if n.type == "GROUP"][0]
    lw = N.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.5
    mr = N.new("ShaderNodeMapRange"); mr.interpolation_type = "SMOOTHSTEP"
    mr.inputs["From Min"].default_value = 0.50
    mr.inputs["From Max"].default_value = 0.88
    mr.inputs["To Min"].default_value = 1.0
    mr.inputs["To Max"].default_value = 0.0
    L.new(lw.outputs["Facing"], mr.inputs["Value"])
    L.new(mr.outputs[0], grp.inputs["Floor"])
    # 每个镜头可调的脸部光色（夜景/霓虹时压暗、染色）
    em = N["TOON_EMIT"]
    tint = N.new("ShaderNodeRGB"); tint.name = "FACE_TINT"; tint.outputs[0].default_value = (1, 1, 1, 1)
    mul = N.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"
    mul.inputs["Factor"].default_value = 1.0
    L.new(grp.outputs["Color"], mul.inputs[6])
    L.new(tint.outputs[0], mul.inputs[7])
    L.new(mul.outputs[2], em.inputs["Color"])
    m.diffuse_color = C(skin_hex)
    return m


def set_face_cell(mat, tag, cell, grid=(4, 2), frame=None):
    """切换表情：cell 为图集格子序号（左上起、行优先）。frame 给了就打恒定插值关键帧。"""
    mp = mat.node_tree.nodes[f"MAP_{tag}"]
    col = cell % grid[0]
    row = cell // grid[0]
    loc = (col / grid[0], (grid[1] - 1 - row) / grid[1], 0)
    mp.inputs["Location"].default_value = loc
    if frame is not None:
        mp.inputs["Location"].keyframe_insert("default_value", frame=frame)
        constant_keys(mat.node_tree)


def constant_keys(idblock):
    ad = idblock.animation_data
    if not ad or not ad.action:
        return
    from bpy_extras import anim_utils
    cb = anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot)
    if cb is None:
        return
    for fc in cb.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = "CONSTANT"


# ------------------------------------------------------------------ 骨骼

def seg_dist(p, a, b):
    ab = b - a
    L2 = ab.length_squared
    t = 0.0 if L2 < 1e-12 else max(0.0, min(1.0, (p - a).dot(ab) / L2))
    return (p - (a + ab * t)).length, t


class Rig:
    """先在 Python 里定义骨骼（静止姿态），用于算权重，最后生成 Armature。"""

    def __init__(self):
        self.bones = {}
        self.order = []

    def add(self, name, head, tail, parent=None, deform=True, roll_to=None):
        self.bones[name] = (Vector(head), Vector(tail), parent, deform, roll_to)
        self.order.append(name)
        return name

    def head(self, n):
        return self.bones[n][0]

    def tail(self, n):
        return self.bones[n][1]

    def w(self, bones, power=4.0, eps=0.004):
        segs = [(b, self.bones[b][0], self.bones[b][1]) for b in bones]

        def fn(p):
            ws = {}
            for b, h, t in segs:
                d, _ = seg_dist(p, h, t)
                ws[b] = 1.0 / (d + eps) ** power
            s = sum(ws.values())
            return {b: x / s for b, x in ws.items()}
        return fn

    def w_chain(self, bones, blend=0.03):
        """沿骨链按投影位置分配，关节附近 ±blend 线性过渡。"""
        segs = [(b, self.bones[b][0], self.bones[b][1]) for b in bones]
        lens = [(t - h).length for _, h, t in segs]
        cum = [0.0]
        for L_ in lens:
            cum.append(cum[-1] + L_)

        def fn(p):
            best = None
            for i, (b, h, t) in enumerate(segs):
                d, tt = seg_dist(p, h, t)
                if best is None or d < best[0] - 1e-9:
                    best = (d, i, tt)
            _, i, tt = best
            s = cum[i] + tt * lens[i]
            out = {}
            for k in range(len(segs)):
                a0, a1 = cum[k], cum[k + 1]
                lo = a0 - blend if k > 0 else -1e9
                hi = a1 + blend if k < len(segs) - 1 else 1e9
                if s < lo or s > hi:
                    continue
                w = 1.0
                if k > 0 and s < a0 + blend:
                    w = min(w, (s - (a0 - blend)) / (2 * blend))
                if k < len(segs) - 1 and s > a1 - blend:
                    w = min(w, ((a1 + blend) - s) / (2 * blend))
                if w > 0:
                    out[segs[k][0]] = w
            tot = sum(out.values()) or 1.0
            return {b: x / tot for b, x in out.items()} if out else {segs[i][0]: 1.0}
        return fn

    def build(self, name, collection=None):
        arm = bpy.data.armatures.new(name)
        ob = bpy.data.objects.new(name, arm)
        (collection or bpy.context.scene.collection).objects.link(ob)
        bpy.context.view_layer.objects.active = ob
        for o in bpy.context.view_layer.objects:
            o.select_set(False)
        ob.select_set(True)
        bpy.ops.object.mode_set(mode="EDIT")
        for n in self.order:
            h, t, p, d, roll_to = self.bones[n]
            eb = arm.edit_bones.new(n)
            eb.head, eb.tail = h, t
            eb.use_deform = d
            if roll_to is not None:
                eb.align_roll(Vector(roll_to))
            if p:
                eb.parent = arm.edit_bones[p]
                eb.use_connect = False
        bpy.ops.object.mode_set(mode="OBJECT")
        arm.display_type = "STICK"
        for pb in ob.pose.bones:
            pb.rotation_mode = "QUATERNION"
        return ob


def bind(mesh_ob, arm_ob):
    """网格挂到骨架：Armature 修改器放在描边 Solidify 之前。"""
    mesh_ob.parent = arm_ob
    md = mesh_ob.modifiers.new("Armature", "ARMATURE")
    md.object = arm_ob
    md.use_vertex_groups = True
    if mesh_ob.modifiers[0].name != md.name:
        with bpy.context.temp_override(object=mesh_ob, active_object=mesh_ob):
            bpy.ops.object.modifier_move_to_index(modifier=md.name, index=0)
    return md
