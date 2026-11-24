"""《你好，世界》—— AI 拟人化短片 · 场景构建脚本（无头 Blender / bpy 5.x）

用法：
    python film/build.py                      # 构建并保存 film/work/film.blend
    python film/build.py preview 300 650 ...  # 构建后渲染这些帧的低清预览到 film/work/preview/

坐标约定：桌面顶面 z = 0，相机大多从 -Y 一侧拍，墙在 +Y。单位：米。24 fps。
"""
import math
import os
import random
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SKILL = os.environ.get("BPYX_DIR", HERE)  # bpyx 工具库（来自 blender-headless skill）放在本目录
sys.path.insert(0, SKILL)
sys.path.insert(0, HERE)

import bpy  # noqa: E402
import bmesh  # noqa: E402  (pip 版 bpy 要先 import bpy)
import bpyx as bx  # noqa: E402
from bpy_extras import anim_utils  # noqa: E402
from mathutils import Euler, Matrix, Vector  # noqa: E402

RAW = os.path.join(ROOT, "assets", "raw")
WORK = os.path.join(HERE, "work")
FPS = 24
END = 1104
random.seed(7)

# ---------------------------------------------------------------- 时间轴（帧）
SHOTS = [  # 名称, 起始帧, 说明
    ("S01_wide", 1, "深夜书桌全景，缓慢推近"),
    ("S02_screen", 121, "屏幕特写：加载人格模块"),
    ("S03_birth", 217, "光粒子汇聚，小机器人诞生"),
    ("S04_face", 313, "面部特写：这是哪儿？好黑"),
    ("S05_ots", 433, "过肩：发现台灯"),
    ("S06_walk", 505, "侧面跟拍：走向开关"),
    ("S07_jump", 621, "跳上开关，灯亮"),
    ("S08_react", 721, "特写：哇，好亮"),
    ("S09_hello", 817, "转向镜头：挥手、点赞"),
    ("S10_dance", 961, "跳舞，镜头拉远"),
]

P_SPAWN = Vector((-0.14, -0.16, 0.0))
P_SWITCH = Vector((0.30, -0.12, 0.0))
P_STOP = Vector((0.222, -0.125, 0.0))
SWITCH_TOP = 0.021
ROBOT_H = 0.15
HEAD_Z = 0.12   # 头部中心离地高度，build_robot 里按实际模型重算

WALK_START, WALK_END = 512, 600
JUMP_F = 648            # Jump 动作起始帧；起跳 +5，落地 +12
LAND_F = JUMP_F + 12
LIGHT_ON = LAND_F + 1


# ---------------------------------------------------------------- 小工具
def link(o, coll=None):
    (coll or bpy.context.scene.collection).objects.link(o)
    return o


def empty(name, loc=(0, 0, 0)):
    e = bpy.data.objects.new(name, None)
    e.location = loc
    return link(e)


def load_group(path, name, scale=1.0, loc=(0, 0, 0), rot_deg=(0, 0, 0)):
    objs = bx.load(path)
    g = empty(name)
    for o in objs:
        if o.parent is None:
            o.parent = g
    g.scale = (scale,) * 3
    g.location = loc
    g.rotation_euler = [math.radians(a) for a in rot_deg]
    return g, objs


class interp:
    """上下文管理器：期间新插入的关键帧用指定插值。"""

    def __init__(self, kind):
        self.kind = kind

    def __enter__(self):
        e = bpy.context.preferences.edit
        self.old = e.keyframe_new_interpolation_type
        e.keyframe_new_interpolation_type = self.kind

    def __exit__(self, *a):
        bpy.context.preferences.edit.keyframe_new_interpolation_type = self.old


def key(obj, path, frame, value=None, index=-1):
    if value is not None:
        if index >= 0:
            getattr(obj, path)[index] = value
        else:
            setattr(obj, path, value)
    obj.keyframe_insert(path, frame=frame, index=index)


def key_input(sock, frame, value):
    sock.default_value = value
    sock.keyframe_insert("default_value", frame=frame)


def smoothstep(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


def node(nt, kind, **props):
    n = nt.nodes.new(kind)
    for k, v in props.items():
        setattr(n, k, v)
    return n


# ---------------------------------------------------------------- 场景与布景
sc = bx.reset()
sc.render.fps = FPS
sc.frame_start, sc.frame_end = 1, END


def build_room():
    # 桌子（Poly Haven wooden_table_02，放大一点，桌面顶面对齐 z=0）
    g, objs = load_group(os.path.join(RAW, "wooden_table_02/wooden_table_02_1k.gltf"), "Desk", scale=1.25)
    g.location.z = -0.8 * 1.25
    g.location.y = 0.0

    # 地板
    floor = bx.add("plane", location=(0, 0, -1.0), size=8, name="Floor")
    fm = bx.material("#2a1f18", roughness=0.55, name="Floor")
    nt = fm.node_tree
    wave = node(nt, "ShaderNodeTexWave")
    wave.inputs["Scale"].default_value = 3.0
    wave.inputs["Distortion"].default_value = 6.0
    ramp = node(nt, "ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = bx.rgba("#1e1610")
    ramp.color_ramp.elements[1].color = bx.rgba("#4a3626")
    nt.links.new(wave.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"])
    bx.assign(floor, fm)

    # 背墙（带窗洞）：用四块板拼，窗洞在左侧
    wall_y = 0.47
    wm = bx.material("#c9bba6", roughness=0.85, name="Wall")
    nt = wm.node_tree
    noise = node(nt, "ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 40
    bump = node(nt, "ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.08
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], nt.nodes["Principled BSDF"].inputs["Normal"])
    win_x0, win_x1, win_z0, win_z1 = -1.25, -0.45, 0.22, 1.05

    def wall_box(x0, x1, z0, z1):
        o = bx.add("cube", location=((x0 + x1) / 2, wall_y + 0.05, (z0 + z1) / 2), name="Wall")
        o.scale = ((x1 - x0) / 2, 0.05, (z1 - z0) / 2)
        bx.assign(o, wm)
        return o

    X0, X1, Z0, Z1 = -2.6, 2.6, -1.0, 1.9
    wall_box(X0, win_x0, Z0, Z1)  # 左
    wall_box(win_x1, X1, Z0, Z1)  # 右
    wall_box(win_x0, win_x1, Z0, win_z0)  # 下
    wall_box(win_x0, win_x1, win_z1, Z1)  # 上
    # 左侧墙
    lw = bx.add("cube", location=(-1.6, -1.0, 0.45), name="WallL")
    lw.scale = (0.05, 1.6, 1.45)
    bx.assign(lw, wm)

    # 窗框
    fr = bx.material("#e8e4dc", roughness=0.5, name="WindowFrame")
    t = 0.035
    for (cx, cz, sx, sz) in [
        ((win_x0 + win_x1) / 2, win_z0, (win_x1 - win_x0) / 2 + t, t),
        ((win_x0 + win_x1) / 2, win_z1, (win_x1 - win_x0) / 2 + t, t),
        ((win_x0 + win_x1) / 2, (win_z0 + win_z1) / 2, (win_x1 - win_x0) / 2, t * 0.5),
        (win_x0, (win_z0 + win_z1) / 2, t, (win_z1 - win_z0) / 2),
        (win_x1, (win_z0 + win_z1) / 2, t, (win_z1 - win_z0) / 2),
        ((win_x0 + win_x1) / 2, (win_z0 + win_z1) / 2, t * 0.5, (win_z1 - win_z0) / 2),
    ]:
        o = bx.add("cube", location=(cx, wall_y + 0.03, cz), name="Frame")
        o.scale = (sx, 0.03, sz)
        bx.assign(o, fr)
    sill = bx.add("cube", location=((win_x0 + win_x1) / 2, wall_y - 0.02, win_z0 - 0.03), name="Sill")
    sill.scale = ((win_x1 - win_x0) / 2 + 0.08, 0.07, 0.018)
    bx.assign(sill, fr)

    # 窗外夜空（渐变自发光）+ 远处城市灯光（虚化成光斑）
    sky = bx.add("plane", location=(-0.85, 2.6, 0.7), rot_deg=(90, 0, 0), size=1, name="NightSky")
    sky.scale = (3.2, 1.8, 1)
    skm = bx.material("#000000", name="NightSky")
    nt = skm.node_tree
    for n in list(nt.nodes):
        if n.bl_idname != "ShaderNodeOutputMaterial":
            nt.nodes.remove(n)
    out = nt.nodes["Material Output"]
    tc = node(nt, "ShaderNodeTexCoord")
    sep = node(nt, "ShaderNodeSeparateXYZ")
    rp = node(nt, "ShaderNodeValToRGB")
    rp.color_ramp.elements[0].position = 0.25
    rp.color_ramp.elements[0].color = bx.rgba("#0c1730")
    rp.color_ramp.elements[1].position = 0.85
    rp.color_ramp.elements[1].color = bx.rgba("#02040b")
    em = node(nt, "ShaderNodeEmission")
    em.inputs["Strength"].default_value = 1.2
    nt.links.new(tc.outputs["Generated"], sep.inputs["Vector"])
    nt.links.new(sep.outputs["Y"], rp.inputs["Fac"])
    nt.links.new(rp.outputs["Color"], em.inputs["Color"])
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    sky.visible_shadow = False
    # 月亮
    moon = bx.add("sphere", location=(-1.25, 2.5, 1.0), radius=0.07, segments=32, ring_count=16, name="Moon",
                  mat=bx.material("#000000", emission="#dfe8ff", emission_strength=6, name="Moon"), smooth=True)
    moon.visible_shadow = False
    # 城市灯光
    src = bx.add("icosphere", subdivisions=2, radius=0.012, name="CityLight",
                 mat=bx.material("#000000", emission="#ffc37a", emission_strength=25, name="CityLight"))
    src.visible_shadow = False
    cols = ["#ffc37a", "#ffdca8", "#9fd0ff", "#ff9f6b"]
    mats = [bx.material("#000000", emission=c, emission_strength=22, name="City") for c in cols]
    for i in range(46):
        o = src.copy()
        o.data = src.data.copy() if i < 4 else o.data
        link(o)
        o.location = (random.uniform(-1.6, -0.0), random.uniform(2.2, 2.45), random.uniform(0.0, 0.42))
        if i < 4:
            bx.assign(o, mats[i])
    bpy.data.objects.remove(src)

    # 右侧地上的大盆栽
    load_group(os.path.join(RAW, "potted_plant_02/potted_plant_02_1k.gltf"), "BigPlant", scale=1.0,
               loc=(1.15, 0.1, -1.0), rot_deg=(0, 0, 200))

    # 墙上搁板 + 书
    shelf = bx.add("cube", location=(-0.06, wall_y - 0.1, 0.66), name="Shelf")
    shelf.scale = (0.27, 0.1, 0.012)
    bx.assign(shelf, bx.material("#6b4a32", roughness=0.5, name="ShelfWood"))
    book_cols = ["#8c2f39", "#2e4a62", "#d9a441", "#3b6e4f", "#5a3e6b", "#c75b39", "#1f2a36", "#a8b3a1"]
    x = -0.31
    while x < 0.12:
        w = random.uniform(0.018, 0.035)
        h = random.uniform(0.16, 0.24)
        d = random.uniform(0.13, 0.17)
        b = bx.add("cube", location=(x + w / 2, wall_y - 0.1, 0.672 + h / 2), name="Book", bevel=0.002)
        b.scale = (w / 2, d / 2, h / 2)
        b.rotation_euler.y = math.radians(random.uniform(-2, 2))
        bx.assign(b, bx.material(random.choice(book_cols), roughness=0.6, name="Cover"))
        x += w + 0.002
    # 桌面上的一摞书
    y = 0.0
    for i, (c, w, d, h) in enumerate([("#2e4a62", 0.24, 0.17, 0.035), ("#8c2f39", 0.22, 0.16, 0.03), ("#d9a441", 0.2, 0.15, 0.025)]):
        b = bx.add("cube", location=(0.47, 0.22, y + h / 2), rot_deg=(0, 0, 8 - i * 7), name="DeskBook", bevel=0.002)
        b.scale = (w / 2, d / 2, h / 2)
        bx.assign(b, bx.material(c, roughness=0.6, name="Cover"))
        y += h
    return wall_y


def build_props():
    props = {}
    # 复古笔记本（Poly Haven classic_laptop）
    g, objs = load_group(os.path.join(RAW, "classic_laptop/classic_laptop_1k.gltf"), "Laptop", scale=0.55,
                         loc=(-0.16, 0.11, 0.0), rot_deg=(0, 0, 9))
    props["laptop"] = g
    scr = bpy.data.objects["classic_laptop_screen"]
    props["screen_obj"] = scr
    # 屏幕材质：逐帧图片序列 + 自发光
    seq0 = os.path.join(WORK, "screen", "screen_0001.png")
    img = bpy.data.images.load(seq0)
    img.source = "SEQUENCE"
    m = bx.material("#000000", roughness=0.18, name="ScreenDisplay")
    nt = m.node_tree
    tex = node(nt, "ShaderNodeTexImage")
    tex.image = img
    tex.image_user.frame_duration = END
    tex.image_user.frame_start = 1
    tex.image_user.frame_offset = 0
    tex.image_user.use_auto_refresh = True
    tex.interpolation = "Cubic"
    b = nt.nodes["Principled BSDF"]
    nt.links.new(tex.outputs["Color"], b.inputs["Emission Color"])
    b.inputs["Emission Strength"].default_value = 3.0
    b.inputs["Coat Weight"].default_value = 0.6
    props["screen_strength"] = b.inputs["Emission Strength"]
    slot = [i for i, mm in enumerate(scr.data.materials) if mm and mm.name.startswith("classic_laptop_screen")][0]
    scr.data.materials[slot] = m
    # 重新投影屏幕 UV（原 UV 在 1~2 的 UDIM 区）
    me = scr.data
    fs = [p for p in me.polygons if p.material_index == slot]
    vs = [me.vertices[v].co for p in fs for v in p.vertices]
    x0, x1 = min(v.x for v in vs), max(v.x for v in vs)
    z0, z1 = min(v.z for v in vs), max(v.z for v in vs)
    uv = me.uv_layers.active.data
    for p in fs:
        for li, vi in zip(p.loop_indices, p.vertices):
            co = me.vertices[vi].co
            uv[li].uv = ((co.x - x0) / (x1 - x0), (co.z - z0) / (z1 - z0))
    bpy.context.view_layer.update()
    wc = [scr.matrix_world @ me.vertices[v].co for p in fs for v in p.vertices]
    props["screen_center"] = sum(wc, Vector()) / len(wc)
    props["screen_size"] = (max(v.x for v in wc) - min(v.x for v in wc), max(v.z for v in wc) - min(v.z for v in wc))

    # 闹钟（Poly Haven alarm_clock_01），指针定在 2:07
    g, objs = load_group(os.path.join(RAW, "alarm_clock_01/alarm_clock_01_1k.gltf"), "Clock", scale=0.8,
                         loc=(-0.5, 0.02, 0.0), rot_deg=(0, 0, 24))
    props["clock"] = g
    gl = bpy.data.materials.get("alarm_clock_01_Glass")
    if gl:
        bb = gl.node_tree.nodes["Principled BSDF"]
        for l in list(bb.inputs["Alpha"].links):
            gl.node_tree.links.remove(l)
        bb.inputs["Alpha"].default_value = 0.12
        bb.inputs["Roughness"].default_value = 0.05
    for n, ang in [("houd_hand", 63.5), ("minute_hand", 42.0)]:
        h = bpy.data.objects[n]
        h.rotation_mode = "XYZ"
        h.rotation_euler = (0, math.radians(ang), 0)
    sh = bpy.data.objects["second_hand"]
    sh.rotation_mode = "XYZ"
    with interp("CONSTANT"):
        for f in range(1, END + 1, FPS):
            sh.rotation_euler = (0, math.radians(((f // FPS) * 6 + 90) % 360), 0)
            sh.keyframe_insert("rotation_euler", index=1, frame=f)

    # 小盆栽（Poly Haven potted_plant_04）
    load_group(os.path.join(RAW, "potted_plant_04/potted_plant_04_1k.gltf"), "Succulent", scale=0.62,
               loc=(0.16, 0.25, 0.0), rot_deg=(0, 0, 30))

    # 马克杯（程序建模）
    mug_m = bx.material("#e7dfd2", roughness=0.25, coat=0.5, name="Mug")
    mug = bx.add("cylinder", location=(-0.36, -0.27, 0.05), vertices=48, radius=0.04, depth=0.1, name="Mug",
                 smooth=True, bevel=0.003)
    bm = bmesh.new()
    bm.from_mesh(mug.data)
    top = [f for f in bm.faces if f.normal.z > 0.9]
    bmesh.ops.inset_region(bm, faces=top, thickness=0.004)
    top2 = [f for f in bm.faces if f.normal.z > 0.9 and f.calc_area() < 0.0045]
    r = bmesh.ops.extrude_face_region(bm, geom=top2)
    nv = [v for v in r["geom"] if isinstance(v, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=nv, vec=(0, 0, -0.085))
    bmesh.ops.delete(bm, geom=top2, context="FACES_ONLY")
    bm.to_mesh(mug.data)
    bm.free()
    mug.data.shade_smooth()
    bx.assign(mug, mug_m)
    hd = bx.add("torus", location=(-0.36 - 0.045, -0.27, 0.05), rot_deg=(90, 0, 0), major_radius=0.026,
                minor_radius=0.006, name="MugHandle", smooth=True)
    bx.assign(hd, mug_m)
    hd.rotation_euler.z = math.radians(-35)
    hd.location = (-0.36 - 0.045 * math.cos(math.radians(35)), -0.27 - 0.045 * math.sin(math.radians(35)), 0.05)
    mug.rotation_euler.z = 0
    # 便签纸 & 铅笔
    for (x, y, rz, c) in [(0.05, -0.32, 12, "#ffe36e"), (0.09, -0.29, -7, "#ff9ec4"), (-0.42, 0.25, 20, "#9ee7ff")]:
        n_ = bx.add("plane", location=(x, y, 0.0006 + random.uniform(0, 0.0004)), size=0.075, rot_deg=(0, 0, rz),
                    name="Note")
        bx.assign(n_, bx.material(c, roughness=0.8, name="Note"))
    pen = bx.add("cylinder", location=(0.0, -0.36, 0.004), rot_deg=(0, 90, 22), vertices=6, radius=0.0042,
                 depth=0.17, name="Pencil", bevel=0.0005)
    bx.assign(pen, bx.material("#e8a228", roughness=0.4, name="Pencil"))
    tip = bx.add("cone", location=(0.0 + 0.085 * math.cos(math.radians(22)) + 0.008 * math.cos(math.radians(22)),
                                   -0.36 + 0.085 * math.sin(math.radians(22)) + 0.008 * math.sin(math.radians(22)),
                                   0.004),
                 rot_deg=(0, 90, 22), vertices=6, radius1=0.0042, radius2=0.0008, depth=0.016, name="PencilTip")
    bx.assign(tip, bx.material("#e9d2a8", roughness=0.6, name="Wood"))
    return props


def build_lamp():
    # Poly Haven desk_lamp_arm_01：夹在桌子后沿，灯头伸向桌面
    g, objs = load_group(os.path.join(RAW, "desk_lamp_arm_01/desk_lamp_arm_01_1k.gltf"), "Lamp", scale=0.85,
                         loc=(0.44, 0.43, 0.0), rot_deg=(0, 0, 180 + 18))
    lamp = bpy.data.objects["desk_lamp_arm_01"]
    lm = bpy.data.materials["desk_lamp_arm_01_light"]
    b = lm.node_tree.nodes["Principled BSDF"]
    b.inputs["Emission Color"].default_value = bx.rgba("#ffd9a0")
    bulb_strength = b.inputs["Emission Strength"]
    bpy.context.view_layer.update()
    li = [i for i, m in enumerate(lamp.data.materials) if m.name == "desk_lamp_arm_01_light"][0]
    pts = [lamp.matrix_world @ lamp.data.vertices[v].co for p in lamp.data.polygons if p.material_index == li
           for v in p.vertices]
    bulb = sum(pts, Vector()) / len(pts)
    return g, bulb, bulb_strength


def build_switch(lamp_root_xy):
    """圆形按压开关 + 电线。返回 (按钮物体, LED 材质发光插口)。"""
    body = bx.add("cylinder", location=(P_SWITCH.x, P_SWITCH.y, 0.0075), vertices=64, radius=0.046, depth=0.015,
                  name="SwitchBody", smooth=True, bevel=0.004)
    bx.assign(body, bx.material("#26282c", roughness=0.35, name="SwitchBody"))
    ring_m = bx.material("#111111", roughness=0.3, emission="#ff9a3c", emission_strength=0.0, name="SwitchLED")
    ring = bx.add("torus", location=(P_SWITCH.x, P_SWITCH.y, 0.015), major_radius=0.036, minor_radius=0.0022,
                  name="SwitchLED", smooth=True)
    bx.assign(ring, ring_m)
    btn = bx.add("cylinder", location=(P_SWITCH.x, P_SWITCH.y, 0.0175), vertices=64, radius=0.031, depth=0.007,
                 name="SwitchButton", smooth=True, bevel=0.002)
    bx.assign(btn, bx.material("#e9e4da", roughness=0.4, coat=0.4, name="SwitchButton"))
    # 电线：从台灯夹子沿桌面绕到开关，再从开关拖到桌子右前角
    def cord(points, name):
        cu = bpy.data.curves.new(name, "CURVE")
        cu.dimensions = "3D"
        cu.bevel_depth = 0.0028
        cu.bevel_resolution = 3
        sp = cu.splines.new("BEZIER")
        sp.bezier_points.add(len(points) - 1)
        for bp, co in zip(sp.bezier_points, points):
            bp.co = co
            bp.handle_left_type = bp.handle_right_type = "AUTO"
        o = bpy.data.objects.new(name, cu)
        link(o)
        bx.assign(o, bx.material("#1b1b1d", roughness=0.45, name="Cord"))
        return o
    lx, ly = lamp_root_xy
    cord([(lx, ly - 0.01, 0.0028), (lx - 0.02, ly - 0.2, 0.0028), (P_SWITCH.x + 0.11, -0.02, 0.0028),
          (P_SWITCH.x + 0.045, P_SWITCH.y + 0.005, 0.006)], "Cord1")
    cord([(P_SWITCH.x + 0.03, P_SWITCH.y - 0.035, 0.006), (P_SWITCH.x + 0.12, -0.26, 0.0028),
          (0.62, -0.33, 0.0028), (0.8, -0.38, -0.05)], "Cord2")
    return btn, ring_m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]


# ---------------------------------------------------------------- 机器人
def build_robot():
    # 骨骼推断必须用 TEMPERANCE：默认的 BLENDER 方式会把这个模型的腿塞进身体里
    objs = bx.load(os.path.join(RAW, "RobotExpressive.glb"), bone_heuristic="TEMPERANCE")
    for o in list(objs):
        if o.name.startswith("Icosphere"):
            objs.remove(o)
            bpy.data.objects.remove(o)
    arm = bpy.data.objects["RobotArmature"]
    ad = arm.animation_data
    # 这个 glTF 的每个动作只给"会动的骨骼"打了关键帧，没打的骨骼会沿用之前残留的值，
    # 动作一切换姿势就乱。所以先取一个中性站姿（Jump 第 0 帧 + 导入时的默认值），
    # 做成覆盖全部骨骼的 DefaultPose，垫在 NLA 最底层。
    jump = bpy.data.actions["Jump"]
    ad.action = jump
    ad.action_slot = [s_ for s_ in jump.slots if s_.identifier.startswith("OB")][0]
    sc.frame_set(0)
    pose = {b.name: (b.location.copy(), b.rotation_quaternion.copy(), b.scale.copy()) for b in arm.pose.bones}
    for t in list(ad.nla_tracks):
        ad.nla_tracks.remove(t)
    defp = bpy.data.actions.new("DefaultPose")
    ad.action = defp
    for b in arm.pose.bones:
        b.rotation_mode = "QUATERNION"
        b.location, b.rotation_quaternion, b.scale = pose[b.name]
        for path in ("location", "rotation_quaternion", "scale"):
            b.keyframe_insert(path, frame=1)
    ad.action = None
    sc.frame_set(1)
    # 按中性站姿量身高，缩放到 ROBOT_H，脚底贴地
    lo, hi, _c, _r = bx.bounds([o for o in objs if o.type == "MESH"])
    rig = empty("Robot", P_SPAWN)
    rootn = bpy.data.objects["RootNode"]
    rootn.location.z -= lo.z
    rootn.parent = rig
    s = ROBOT_H / (hi.z - lo.z)
    rig.scale = (s, s, s)
    rig["base_scale"] = s
    bpy.context.view_layer.update()
    head = bpy.data.objects["Head"]
    global HEAD_Z
    HEAD_Z = bx.bounds([head])[2].z - P_SPAWN.z
    print("[build] robot head center z =", round(HEAD_Z, 4))
    if head.data.shape_keys and head.data.shape_keys.animation_data:
        head.data.shape_keys.animation_data_clear()

    # 材质：机身黄色玩具塑料，眼睛换成会发光、会转动的 AI 瞳孔
    main = bpy.data.materials["Main"]
    mb = main.node_tree.nodes["Principled BSDF"]
    mb.inputs["Roughness"].default_value = 0.42
    mb.inputs["Coat Weight"].default_value = 0.35
    grey = bpy.data.materials["Grey"].node_tree.nodes["Principled BSDF"]
    grey.inputs["Metallic"].default_value = 0.6
    grey.inputs["Roughness"].default_value = 0.35

    # 黑色材质 = 两只眼球 + 两条眉毛。在头部局部坐标里按"高度"（局部 -Y 朝上）找最大间隙分开
    import numpy as np
    me = head.data
    bi = [i for i, m in enumerate(me.materials) if m.name == "Black"][0]
    blk = [p for p in me.polygons if p.material_index == bi]
    ups = sorted(-p.center.y for p in blk)
    gaps = [(ups[i + 1] - ups[i], (ups[i + 1] + ups[i]) / 2) for i in range(len(ups) - 1)]
    cut = max(gaps)[1]
    eyes = [p for p in blk if -p.center.y < cut]
    # 每只眼球用最小二乘拟合球心（眼球只露出前半球，平均值会偏）
    centers, radii = [], []
    for side in (-1, 1):
        vs = np.array([me.vertices[v].co[:] for p in eyes if p.center.x * side > 0 for v in p.vertices])
        A = np.c_[2 * vs, np.ones(len(vs))]
        sol = np.linalg.lstsq(A, (vs ** 2).sum(1), rcond=None)[0]
        centers.append(Vector(sol[:3]))
        radii.append(math.sqrt(sol[3] + Vector(sol[:3]).length_squared))
    # 按高度切只能拿到眼球的一部分；用拟合出的球重新归类：所有顶点都在球面上的面才是眼球
    eyes = [p for p in blk if any(all(abs((me.vertices[v].co - c).length - r) < r * 0.08 for v in p.vertices)
                                  for c, r in zip(centers, radii))]
    bpy.context.view_layer.update()
    inv = head.matrix_world.to_3x3().inverted()
    basis = {k: (inv @ Vector(v)).normalized() for k, v in
             (("fwd", (0, -1, 0)), ("left", (1, 0, 0)), ("up", (0, 0, 1)))}
    head["eye_basis"] = {k: list(v) for k, v in basis.items()}
    eye = eye_material(centers, basis)
    me.materials.append(eye)
    ei = len(me.materials) - 1
    for p in eyes:
        p.material_index = ei
    # 表情形态键会挪动眼球顶点，导致发光瞳孔偏位；让眼球不参与形态键，表情交给眉毛 + 瞳孔着色器
    eye_vi = {v for p in eyes for v in p.vertices}
    kbs = me.shape_keys.key_blocks
    for kb_ in kbs:
        if kb_.name != kbs[0].name:
            for vi in eye_vi:
                kb_.data[vi].co = kbs[0].data[vi].co
    brow = bpy.data.materials["Black"].node_tree.nodes["Principled BSDF"]
    brow.inputs["Roughness"].default_value = 0.3

    # 诞生时的发光：给每个机身材质加一个自发光通道
    glow_inputs = []
    for mname in ("Main", "Grey", "Black"):
        bb = bpy.data.materials[mname].node_tree.nodes["Principled BSDF"]
        bb.inputs["Emission Color"].default_value = bx.rgba("#8ff3ff")
        bb.inputs["Emission Strength"].default_value = 0.0
        glow_inputs.append(bb.inputs["Emission Strength"])
    return rig, arm, head, eye, glow_inputs


def eye_material(centers, basis):
    """AI 眼睛：在低模眼球上画出平滑的发光瞳孔。
    用"局部坐标 - 球心"当法线（不依赖低模的硬边法线，所以瞳孔是圆的）。
    可动画参数：节点 Look（看向，局部坐标）、Glow（亮度）、Open（眨眼）、Happy（^ ^ 笑眼）。"""
    m = bpy.data.materials.new("AIEye")
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = bx.rgba("#050608")
    b.inputs["Roughness"].default_value = 0.12
    b.inputs["Coat Weight"].default_value = 1.0
    b.inputs["Emission Color"].default_value = bx.rgba("#57e6ff")
    tc = node(nt, "ShaderNodeTexCoord")
    sepx = node(nt, "ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sepx.inputs[0])
    side = node(nt, "ShaderNodeMath", operation="GREATER_THAN")
    nt.links.new(sepx.outputs["X"], side.inputs[0])
    side.inputs[1].default_value = (centers[0].x + centers[1].x) / 2
    cmix = node(nt, "ShaderNodeMix", data_type="VECTOR")
    vin = [s_ for s_ in cmix.inputs if s_.type == "VECTOR" and s_.name in ("A", "B")]
    fin = [s_ for s_ in cmix.inputs if s_.name == "Factor" and s_.type == "VALUE"][0]
    vout = [s_ for s_ in cmix.outputs if s_.type == "VECTOR"][0]
    nt.links.new(side.outputs[0], fin)
    vin[0].default_value = centers[0]
    vin[1].default_value = centers[1]
    rel = node(nt, "ShaderNodeVectorMath", operation="SUBTRACT")
    nt.links.new(tc.outputs["Object"], rel.inputs[0])
    nt.links.new(vout, rel.inputs[1])
    nrm = node(nt, "ShaderNodeVectorMath", operation="NORMALIZE")
    nt.links.new(rel.outputs[0], nrm.inputs[0])
    look = node(nt, "ShaderNodeCombineXYZ", name="Look", label="Look")
    look.inputs["X"].default_value, look.inputs["Y"].default_value, look.inputs["Z"].default_value = basis["fwd"]
    lookn = node(nt, "ShaderNodeVectorMath", operation="NORMALIZE")
    nt.links.new(look.outputs[0], lookn.inputs[0])
    dot = node(nt, "ShaderNodeVectorMath", operation="DOT_PRODUCT")
    nt.links.new(nrm.outputs[0], dot.inputs[0])
    nt.links.new(lookn.outputs[0], dot.inputs[1])
    up = node(nt, "ShaderNodeVectorMath", operation="DOT_PRODUCT")
    nt.links.new(nrm.outputs[0], up.inputs[0])
    up.inputs[1].default_value = basis["up"]

    def mr(src, a, b_, name=None):
        n = node(nt, "ShaderNodeMapRange", interpolation_type="SMOOTHSTEP")
        if name:
            n.name = name
        n.inputs["From Min"].default_value = a
        n.inputs["From Max"].default_value = b_
        nt.links.new(src, n.inputs["Value"])
        return n

    def cosd(d):
        return math.cos(math.radians(d))

    def mul(a, b_):
        n = node(nt, "ShaderNodeMath", operation="MULTIPLY")
        nt.links.new(a, n.inputs[0])
        if isinstance(b_, (int, float)):
            n.inputs[1].default_value = b_
        else:
            nt.links.new(b_, n.inputs[1])
        return n.outputs[0]

    def add(a, b_):
        n = node(nt, "ShaderNodeMath", operation="ADD", use_clamp=True)
        nt.links.new(a, n.inputs[0])
        nt.links.new(b_, n.inputs[1])
        return n.outputs[0]

    disc = mr(dot.outputs["Value"], cosd(24), cosd(21)).outputs[0]
    core = mul(mr(dot.outputs["Value"], cosd(9), cosd(6)).outputs[0], 0.6)
    halo = mul(mr(dot.outputs["Value"], cosd(34), cosd(26)).outputs[0], 0.12)
    normal_eye = add(add(disc, core), halo)
    band_out = mr(dot.outputs["Value"], cosd(32), cosd(29)).outputs[0]
    band_in = mr(dot.outputs["Value"], cosd(15), cosd(12)).outputs[0]
    inv = node(nt, "ShaderNodeMath", operation="SUBTRACT")
    inv.inputs[0].default_value = 1.0
    nt.links.new(band_in, inv.inputs[1])
    band = mul(band_out, inv.outputs[0])
    upper = mr(up.outputs["Value"], 0.0, 0.1).outputs[0]
    happy_eye = mul(mul(band, upper), 1.4)
    happy = node(nt, "ShaderNodeValue", name="Happy", label="Happy")
    happy.outputs[0].default_value = 0.0
    mix = node(nt, "ShaderNodeMix", data_type="FLOAT")
    nt.links.new(happy.outputs[0], mix.inputs["Factor"])
    nt.links.new(normal_eye, mix.inputs["A"])
    nt.links.new(happy_eye, mix.inputs["B"])
    opn = node(nt, "ShaderNodeValue", name="Open", label="Open")
    opn.outputs[0].default_value = 1.0
    glow = node(nt, "ShaderNodeValue", name="Glow", label="Glow")
    glow.outputs[0].default_value = 0.0
    strength = mul(mul(mix.outputs["Result"], opn.outputs[0]), mul(glow.outputs[0], 1.0))
    nt.links.new(strength, b.inputs["Emission Strength"])
    m.diffuse_color = (0, 0, 0, 1)
    return m


def nla_strip(track, action, start, *, length=None, scale=1.0, blend_in=0, blend_out=0, extrap="NOTHING",
              a_start=None, a_end=None, blend="REPLACE"):
    st = track.strips.new(action.name, int(start), action)
    if action.slots:
        try:
            st.action_slot = action.slots[0]
        except Exception:
            pass
    r = action.frame_range
    st.action_frame_start = r[0] if a_start is None else a_start
    st.action_frame_end = r[1] if a_end is None else a_end
    st.scale = scale
    alen = (st.action_frame_end - st.action_frame_start) * scale
    st.repeat = (length / alen) if length else 1.0
    st.blend_in = blend_in
    st.blend_out = blend_out
    st.extrapolation = extrap
    st.blend_type = blend
    return st


def animate_robot(rig, arm, head, eye, glow_inputs):
    A = bpy.data.actions
    ad = arm.animation_data
    t_def = ad.nla_tracks.new()
    t_def.name = "Default"
    nla_strip(t_def, A["DefaultPose"], 1, a_start=1, a_end=2, length=END + 10, extrap="HOLD")
    t_base = ad.nla_tracks.new()
    t_base.name = "Base"
    t1 = ad.nla_tracks.new()
    t1.name = "ActA"
    t2 = ad.nla_tracks.new()
    t2.name = "ActB"
    # 底层：全程 Idle 循环
    nla_strip(t_base, A["Idle"], 1, length=END + 10, extrap="HOLD")
    # 走路（慢一点更可爱）
    walk_scale = 1.25
    nla_strip(t1, A["Walking"], WALK_START - 4, length=WALK_END - WALK_START + 10, scale=walk_scale,
              blend_in=8, blend_out=8)
    # 起跳落到开关上
    nla_strip(t2, A["Jump"], JUMP_F, blend_in=3, blend_out=4)
    # 点头 Yes
    nla_strip(t1, A["Yes"], 748, blend_in=5, blend_out=6)
    # 挥手 Wave
    nla_strip(t2, A["Wave"], 846, scale=1.3, blend_in=6, blend_out=6)
    # 点赞 ThumbsUp
    nla_strip(t1, A["ThumbsUp"], 906, scale=1.1, blend_in=6, blend_out=6)
    # 跳舞 Dance
    nla_strip(t2, A["Dance"], 966, length=END - 966 + 8, scale=1.0, blend_in=8)

    # ------------ 头部转动（叠加层，COMBINE）
    pb = arm.pose.bones["Head"]
    pb.rotation_mode = "QUATERNION"
    head_act = bpy.data.actions.new("HeadLook")
    ad.action = head_act
    # 头骨局部轴：Y 沿骨骼向上（世界 +Z），所以绕 Y 转 = 左右摇头；绕 X 转 = 抬头/低头
    def head_key(f, yaw=0.0, pitch=0.0, roll=0.0):
        q = Euler((math.radians(pitch), math.radians(yaw), math.radians(roll)), "XYZ").to_quaternion()
        pb.rotation_quaternion = q
        pb.keyframe_insert("rotation_quaternion", frame=f)

    HK = [  # 帧, 偏航(+ = 机器人自己的左边), 俯仰(+ = 低头), 侧倾
        (1, 0, 0, 0), (318, 0, 0, 0), (324, 0, -6, 0),
        (334, 38, -4, 0), (352, 38, -2, 6), (366, -38, -4, 0), (384, -38, -2, -6), (396, 0, 4, 0),
        (406, 0, 10, 0), (430, 0, 12, 0),  # 好黑……低头
        (446, 0, 0, 0), (456, 52, -8, 0), (480, 30, -10, 0), (492, 0, -4, 0),  # 看见灯，身体跟着转
        (606, 0, 0, 0), (618, 0, 22, 0), (630, 0, 22, 0), (638, 0, -18, 0), (646, 0, 0, 0),  # 低头看开关、抬头
        (668, 0, 0, 0), (676, 0, -24, 0), (700, 0, -28, 4), (712, 0, -10, 0),  # 灯亮：抬头看灯
        (726, 0, -14, 0), (742, 0, -4, 8), (800, 0, -2, 6), (812, 0, 0, 0),
        (842, 0, 0, 0), (900, 0, 0, 0), (904, 0, 0, 0), (960, 0, 0, 0), (END, 0, 0, 0),
    ]
    for f, yw, pt, rl in HK:
        head_key(f, yw, pt, rl)
    ad.action = None
    t3 = ad.nla_tracks.new()
    t3.name = "HeadLook"
    nla_strip(t3, head_act, 1, extrap="HOLD", blend="COMBINE")

    # ------------ 根运动：出生缩放、转身、走路、跳
    base = rig["base_scale"]
    # 出生：从无到有，带一点回弹
    for f, k in [(1, 0.0001), (226, 0.0001), (234, 1.14), (240, 0.94), (245, 1.02), (250, 1.0)]:
        rig.scale = (base * k,) * 3
        rig.keyframe_insert("scale", frame=f)
    rig.hide_render = True
    rig.keyframe_insert("hide_render", frame=1)
    for o in rig.children_recursive:
        o.hide_render = True
        o.keyframe_insert("hide_render", frame=1)
        o.hide_render = False
        o.keyframe_insert("hide_render", frame=226)
    rig.hide_render = False
    rig.keyframe_insert("hide_render", frame=226)

    # 朝向：0 = 面向 -Y（镜头），90 = 面向 +X
    walk_dir = (P_STOP - P_SPAWN).normalized()
    heading = math.degrees(math.atan2(walk_dir.x, -walk_dir.y))
    rot_keys = [(1, 0), (462, 0), (470, 15), (496, heading), (JUMP_F, heading), (JUMP_F + 14, 90),
                (820, 90), (842, 12), (END, 12)]
    for f, a in rot_keys:
        rig.rotation_euler = (0, 0, math.radians(a))
        rig.keyframe_insert("rotation_euler", index=2, frame=f)

    # 走路：逐帧积分速度曲线（两端平滑加减速），避免脚底打滑
    frames = list(range(WALK_START, WALK_END + 1))
    prof = [smoothstep(WALK_START, WALK_START + 10, f) * (1 - smoothstep(WALK_END - 10, WALK_END, f)) for f in frames]
    total = sum(prof)
    dist = (P_STOP - P_SPAWN).length
    acc = 0.0
    rig.location = P_SPAWN
    rig.keyframe_insert("location", frame=1)
    rig.keyframe_insert("location", frame=WALK_START - 1)
    with interp("LINEAR"):
        for f, v in zip(frames, prof):
            acc += v / total * dist
            rig.location = P_SPAWN + walk_dir * acc
            rig.keyframe_insert("location", frame=f)
    # 起跳：+5 离地，+12 落在开关顶面
    t0, t1_ = JUMP_F + 5, JUMP_F + 12
    rig.location = P_STOP
    rig.keyframe_insert("location", frame=t0)
    with interp("LINEAR"):
        for f in range(t0 + 1, t1_ + 1):
            u = (f - t0) / (t1_ - t0)
            p = P_STOP.lerp(Vector((P_SWITCH.x, P_SWITCH.y, 0)), smoothstep(0, 1, u))
            p.z = SWITCH_TOP * smoothstep(0, 1, min(1, u * 1.4))
            rig.location = p
            rig.keyframe_insert("location", frame=f)
    # 落地后按钮被踩下 3 mm
    rig.location = (P_SWITCH.x, P_SWITCH.y, SWITCH_TOP - 0.003)
    rig.keyframe_insert("location", frame=t1_ + 2)
    rig.keyframe_insert("location", frame=END)

    # ------------ 表情（形态键）
    kb = head.data.shape_keys.key_blocks

    def face(name, pts):
        for f, v in pts:
            kb[name].value = v
            kb[name].keyframe_insert("value", frame=f)

    face("Surprised", [(1, 0), (318, 0), (324, 0.9), (360, 0.8), (372, 0.0), (446, 0), (452, 0.6), (472, 0.3),
                       (490, 0), (668, 0), (674, 1.0), (720, 0.7), (735, 0.2), (744, 0), (END, 0)])
    face("Sad", [(1, 0), (390, 0), (402, 0.8), (436, 0.6), (452, 0), (END, 0)])
    face("Angry", [(1, 0), (628, 0), (636, 0.35), (648, 0.35), (654, 0), (END, 0)])  # 起跳前"鼓起勇气"

    # ------------ 眼睛：开机、眨眼、看向、开心
    ent = eye.node_tree.nodes
    glow, opn, happy, look = ent["Glow"].outputs[0], ent["Open"].outputs[0], ent["Happy"].outputs[0], ent["Look"]

    def k(sock, f, v):
        sock.default_value = v
        sock.keyframe_insert("default_value", frame=f)

    with interp("CONSTANT"):
        for f, v in [(1, 0), (258, 0), (262, 3), (264, 0), (267, 5), (269, 1), (272, 9)]:
            k(glow, f, v)
    k(glow, 300, 9)
    k(glow, 662, 9)
    k(glow, 676, 5)  # 灯亮后环境变亮，眼睛亮度稍降，免得过曝
    for f in [286, 410, 530, 612, 760, 880, 1000, 1060]:  # 眨眼
        k(opn, f - 1, 1)
        k(opn, f + 1, 0.05)
        k(opn, f + 3, 1)
    for f, v in [(1, 0), (744, 0), (752, 1), (812, 1), (820, 0), (848, 0), (854, 1), (900, 1), (906, 0),
                 (916, 0), (920, 1), (958, 1), (972, 1), (END, 1)]:
        k(happy, f, v)

    B = {k: Vector(v) for k, v in head["eye_basis"].items()}

    def lk(f, x, y):
        vec = (B["fwd"] + B["left"] * x + B["up"] * y).normalized()
        for comp, v in zip("XYZ", vec):
            look.inputs[comp].default_value = v
            look.inputs[comp].keyframe_insert("default_value", frame=f)

    for f, x, y in [(1, 0, 0), (272, 0, 0), (290, 0, 0), (296, 0.18, -0.06), (306, 0.18, -0.06), (312, 0, 0),
                    (330, 0.3, 0), (350, 0.3, 0), (362, -0.3, 0), (382, -0.3, 0), (396, 0, 0),
                    (404, 0, 0.15), (430, 0, 0.2), (446, 0, 0), (452, 0.35, -0.1), (476, 0.2, -0.1), (494, 0, 0),
                    (616, 0, 0.25), (632, 0, 0.25), (640, 0, -0.2), (648, 0, 0), (672, 0, -0.3), (712, 0, -0.25),
                    (726, 0, 0), (END, 0, 0)]:
        lk(f, x, y)

    # ------------ 诞生时机身发光，随后褪去
    for s_ in glow_inputs:
        for f, v in [(1, 0), (226, 0), (228, 30), (238, 12), (252, 2), (266, 0)]:
            k(s_, f, v)
    return rig


# ---------------------------------------------------------------- 光粒子（诞生）
def build_particles(screen_center, screen_size):
    pm = bx.material("#000000", emission="#9ff6ff", emission_strength=40, name="Spark")
    src = bx.add("icosphere", subdivisions=1, radius=0.0035, name="Spark", mat=pm)
    src.visible_shadow = False
    target = P_SPAWN + Vector((0, 0, 0.07))
    n = 70
    for i in range(n):
        o = src.copy() if i else src
        if i:
            link(o)
        start = screen_center + Vector((random.uniform(-0.45, 0.45) * screen_size[0], -0.004,
                                        random.uniform(-0.45, 0.45) * screen_size[1]))
        t_emit = random.randint(204, 216)
        t_arrive = random.randint(224, 233)
        ang = random.uniform(0, 2 * math.pi)
        rad = random.uniform(0.04, 0.09)
        mid = target.lerp(start, 0.45) + Vector((math.cos(ang) * rad, math.sin(ang) * rad * 0.6,
                                                 random.uniform(0.0, 0.05)))
        o.location = start
        o.scale = (0.001,) * 3
        o.keyframe_insert("location", frame=t_emit - 1)
        o.keyframe_insert("scale", frame=t_emit - 1)
        o.scale = (random.uniform(0.7, 1.4),) * 3
        o.keyframe_insert("scale", frame=t_emit + 2)
        o.location = mid
        o.keyframe_insert("location", frame=(t_emit + t_arrive) // 2)
        o.location = target + Vector((random.uniform(-0.01, 0.01), random.uniform(-0.01, 0.01),
                                      random.uniform(-0.04, 0.04)))
        o.keyframe_insert("location", frame=t_arrive)
        o.keyframe_insert("scale", frame=t_arrive - 2)
        o.scale = (0.001,) * 3
        o.keyframe_insert("scale", frame=t_arrive + 1)
        o.hide_render = True
        o.keyframe_insert("hide_render", frame=1)
        o.hide_render = False
        o.keyframe_insert("hide_render", frame=t_emit - 1)
        o.hide_render = True
        o.keyframe_insert("hide_render", frame=t_arrive + 2)
    # 诞生瞬间的闪光灯
    fl = bx.light("POINT", target, None, 0, size=0.02, color="#9ff6ff", name="BirthFlash")
    for f, e in [(1, 0), (218, 0), (226, 6), (230, 14), (240, 3), (262, 0)]:
        fl.data.energy = e
        fl.data.keyframe_insert("energy", frame=f)
    return fl


# ---------------------------------------------------------------- 灯光
def build_lights(props, bulb, bulb_strength, led_strength, screen_strength):
    w = bx.world("#0a1020", strength=0.35)
    bg = w.node_tree.nodes["Background"]
    for f, v in [(1, 0.35), (LIGHT_ON, 0.35), (LIGHT_ON + 6, 0.55)]:
        bg.inputs["Strength"].default_value = v
        bg.inputs["Strength"].keyframe_insert("default_value", frame=f)

    # 月光：从窗户斜射进来
    moon = bx.light("AREA", (-0.85, 1.3, 1.15), (0.05, -0.1, 0.0), 160, size=0.8, color="#7ea6ff", name="MoonLight")
    moon.data.shape = "RECTANGLE"
    moon.data.size_y = 0.9

    # 屏幕光：贴着屏幕的面光
    sc_c = props["screen_center"]
    lp = props["laptop"]
    fwd = (lp.matrix_world.to_3x3() @ Vector((0, -1, 0))).normalized()
    scr_l = bx.light("AREA", sc_c + fwd * 0.01, sc_c + fwd * 1.0, 2.0, size=props["screen_size"][0],
                     color="#62e4ff", name="ScreenLight")
    scr_l.data.shape = "RECTANGLE"
    scr_l.data.size_y = props["screen_size"][1]
    E = [(1, 0.4), (30, 1.4), (120, 1.6), (196, 1.8), (205, 5), (211, 14), (217, 12), (240, 3), (300, 1.6),
         (LIGHT_ON, 1.6), (LIGHT_ON + 4, 1.0), (960, 1.0), (975, 2.0)]
    for f, e in E:
        scr_l.data.energy = e
        scr_l.data.keyframe_insert("energy", frame=f)
    S = [(1, 1.0), (30, 3.0), (196, 3.0), (205, 6), (216, 10), (240, 4), (300, 3.0), (LIGHT_ON, 3.0),
         (LIGHT_ON + 4, 2.2), (960, 2.2), (975, 3.2)]
    for f, v in S:
        screen_strength.default_value = v
        screen_strength.keyframe_insert("default_value", frame=f)

    # 台灯：聚光 + 灯泡发光 + 暖色补光，落地瞬间点亮并闪一下
    aim = Vector((P_SWITCH.x - 0.12, P_SWITCH.y + 0.05, 0.0))
    spot = bx.light("SPOT", bulb + Vector((0, 0, 0.005)), aim, 0, size=0.02, color="#ffcf8f", name="LampSpot")
    spot.data.spot_size = math.radians(95)
    spot.data.spot_blend = 0.55
    warm = bx.light("AREA", (0.15, -0.2, 0.9), (0.1, 0.0, 0.0), 0, size=1.2, color="#ffc890", name="WarmBounce")
    flick = [(1, 0), (LIGHT_ON - 1, 0), (LIGHT_ON, 1.0), (LIGHT_ON + 1, 0.25), (LIGHT_ON + 3, 0.9),
             (LIGHT_ON + 4, 0.4), (LIGHT_ON + 6, 1.0)]
    with interp("CONSTANT"):
        for f, v in flick:
            spot.data.energy = 9.0 * v
            spot.data.keyframe_insert("energy", frame=f)
            warm.data.energy = 9.0 * v
            warm.data.keyframe_insert("energy", frame=f)
            bulb_strength.default_value = 30.0 * v
            bulb_strength.keyframe_insert("default_value", frame=f)
            led_strength.default_value = 6.0 * v
            led_strength.keyframe_insert("default_value", frame=f)
    # 正面柔和冷色补光（月光在房间里的漫反射），保证夜景里也看得清表情
    fill = bx.light("AREA", (-0.1, -1.0, 0.55), (0.05, -0.12, 0.06), 6.0, size=0.9, color="#8fa8ff", name="FaceFill")
    for f, e in [(1, 6.0), (LIGHT_ON, 6.0), (LIGHT_ON + 6, 2.5)]:
        fill.data.energy = e
        fill.data.keyframe_insert("energy", frame=f)
    return spot


# ---------------------------------------------------------------- 相机
def make_cam(name, lens=50, fstop=5.6):
    cd = bpy.data.cameras.new(name)
    cd.lens = lens
    cd.sensor_width = 36
    cd.clip_start = 0.005
    cd.clip_end = 30
    cd.dof.use_dof = True
    cd.dof.aperture_fstop = fstop
    cam = bpy.data.objects.new(name, cd)
    link(cam)
    return cam


def cam_move(cam, keys, focus=None):
    """keys: [(frame, location, target)]；用一个空物体做注视目标，平滑移动。"""
    tgt = empty(cam.name + "_target")
    con = cam.constraints.new("TRACK_TO")
    con.target = tgt
    con.track_axis = "TRACK_NEGATIVE_Z"
    con.up_axis = "UP_Y"
    for f, loc, t in keys:
        cam.location = loc
        cam.keyframe_insert("location", frame=f)
        tgt.location = t
        tgt.keyframe_insert("location", frame=f)
    if focus is not None:
        cam.data.dof.focus_object = focus
    else:
        cam.data.dof.focus_object = tgt
    return tgt


def head_focus(arm):
    e = empty("FocusHead")
    e.parent = arm
    e.parent_type = "BONE"
    e.parent_bone = "Head"
    bpy.context.view_layer.update()
    pbm = arm.matrix_world @ arm.pose.bones["Head"].matrix
    e.matrix_world = Matrix.Translation(pbm.translation)
    return e


def build_cameras(props, arm):
    V = Vector
    fh = head_focus(arm)
    cams = {}
    sp = P_SPAWN
    # S01 全景推近
    c = make_cam("S01_wide", lens=32, fstop=3.2)
    cam_move(c, [(1, V((-0.36, -1.58, 0.50)), V((0.07, 0.06, 0.22))),
                 (120, V((-0.28, -1.25, 0.41)), V((0.03, 0.06, 0.19)))])
    c.data.dof.focus_object = None
    c.data.dof.focus_distance = 1.05
    for f, d in [(1, 1.62), (120, 1.30)]:
        c.data.dof.focus_distance = d
        c.data.dof.keyframe_insert("focus_distance", frame=f)
    cams["S01_wide"] = c
    # S02 屏幕特写
    scc = props["screen_center"]
    lp = props["laptop"]
    fwd = (lp.matrix_world.to_3x3() @ V((0, -1, 0))).normalized()
    c = make_cam("S02_screen", lens=50, fstop=4.0)
    cam_move(c, [(121, scc + fwd * 0.50 + V((0.03, 0, -0.04)), scc), (216, scc + fwd * 0.40 + V((0.0, 0, -0.03)), scc)])
    cams["S02_screen"] = c
    # S03 诞生：低机位，屏幕在背后
    c = make_cam("S03_birth", lens=35, fstop=4.0)
    hz = HEAD_Z
    cam_move(c, [(217, sp + V((0.10, -0.46, 0.07)), sp + V((-0.01, 0.12, hz * 0.72))),
                 (312, sp + V((0.07, -0.38, 0.075)), sp + V((-0.01, 0.10, hz * 0.72)))])
    c.data.dof.focus_object = None
    for f, d in [(217, 0.5), (312, 0.4)]:
        c.data.dof.focus_distance = d
        c.data.dof.keyframe_insert("focus_distance", frame=f)
    cams["S03_birth"] = c
    # S04 面部特写
    c = make_cam("S04_face", lens=54, fstop=8.0)
    cam_move(c, [(313, sp + V((0.03, -0.36, hz + 0.004)), sp + V((0, 0, hz - 0.006))),
                 (432, sp + V((0.02, -0.31, hz + 0.002)), sp + V((0, 0, hz - 0.006)))], focus=fh)
    cams["S04_face"] = c
    # S05 过肩看台灯（焦点从机器人转到台灯）
    c = make_cam("S05_ots", lens=40, fstop=4.0)
    lh = props["bulb"]
    H = sp + V((0, 0, hz))
    D = lh - H
    dh = V((D.x, D.y, 0)).normalized()
    right = V((dh.y, -dh.x, 0))
    c0 = H - dh * 0.21 + right * 0.065 + V((0, 0, 0.018))
    c.data.lens = 24
    cam_move(c, [(433, c0, H + D * 0.13), (504, c0 + dh * 0.015 + V((0, 0, 0.003)), H + D * 0.16)])
    c.data.dof.focus_object = None
    dl = (lh - c0).length
    dr = (H - c0).length
    for f, d in [(433, dr), (454, dr), (470, dl), (504, dl)]:
        c.data.dof.focus_distance = d
        c.data.dof.keyframe_insert("focus_distance", frame=f)
    cams["S05_ots"] = c
    # S06 侧面跟拍走路（相机跟着机器人 x 走，略滞后）
    c = make_cam("S06_walk", lens=45, fstop=5.6)
    keys = []
    for f in range(505, 621, 8):
        u = smoothstep(WALK_START - 6, WALK_END + 10, f)
        rx = P_SPAWN.lerp(P_STOP, u)
        keys.append((f, V((rx.x + 0.05, -0.62, 0.085)), V((rx.x + 0.02, rx.y, hz * 0.62))))
    cam_move(c, keys, focus=fh)
    cams["S06_walk"] = c
    # S07 起跳：中景，能看到开关和上方的台灯
    c = make_cam("S07_jump", lens=28, fstop=5.6)
    cam_move(c, [(621, V((0.47, -0.60, 0.075)), V((0.29, -0.05, 0.16))),
                 (720, V((0.46, -0.56, 0.08)), V((0.29, -0.04, 0.17)))], focus=fh)
    cams["S07_jump"] = c
    # S08 反应特写（机器人朝 +X，相机在它前方）
    c = make_cam("S08_react", lens=55, fstop=8.0)
    hp = V((P_SWITCH.x, P_SWITCH.y, SWITCH_TOP + hz - 0.008))
    cam_move(c, [(721, hp + V((0.36, -0.09, 0.0)), hp + V((0, 0, 0.005))),
                 (816, hp + V((0.32, -0.08, 0.0)), hp + V((0, 0, 0.005)))], focus=fh)
    cams["S08_react"] = c
    # S09 正面中景：转向镜头、挥手、点赞
    c = make_cam("S09_hello", lens=42, fstop=6.3)
    cam_move(c, [(817, V((P_SWITCH.x + 0.06, -0.64, 0.11)), V((P_SWITCH.x, P_SWITCH.y, SWITCH_TOP + hz * 0.62))),
                 (960, V((P_SWITCH.x + 0.04, -0.57, 0.11)), V((P_SWITCH.x, P_SWITCH.y, SWITCH_TOP + hz * 0.66)))],
             focus=fh)
    cams["S09_hello"] = c
    # S10 跳舞 + 拉远成全景
    c = make_cam("S10_dance", lens=35, fstop=4.5)
    cam_move(c, [(961, V((P_SWITCH.x + 0.02, -0.55, 0.12)), V((P_SWITCH.x, P_SWITCH.y, 0.1))),
                 (1000, V((P_SWITCH.x - 0.02, -0.66, 0.15)), V((P_SWITCH.x - 0.03, P_SWITCH.y, 0.1))),
                 (END, V((-0.02, -1.32, 0.42)), V((0.02, 0.02, 0.12)))], focus=fh)
    cams["S10_dance"] = c
    # 镜头切换
    for name, f, _ in SHOTS:
        m = sc.timeline_markers.new(name, frame=f)
        m.camera = cams[name]
    sc.camera = cams["S01_wide"]
    return cams


# ---------------------------------------------------------------- 主流程
def build():
    build_room()
    props = build_props()
    lamp_g, bulb, bulb_strength = build_lamp()
    props["bulb"] = bulb
    btn, led = build_switch((lamp_g.location.x, lamp_g.location.y))
    rig, arm, head, eye, glow_inputs = build_robot()
    animate_robot(rig, arm, head, eye, glow_inputs)
    build_particles(props["screen_center"], props["screen_size"])
    build_lights(props, bulb, bulb_strength, led, props["screen_strength"])
    # 开关按钮被踩下
    btn.keyframe_insert("location", index=2, frame=LAND_F - 1)
    btn.location.z -= 0.003
    btn.keyframe_insert("location", index=2, frame=LAND_F + 1)
    build_cameras(props, arm)

    # 性能：纯装饰的发光体（城市灯、月亮、夜空、光粒子、屏幕、眼睛、灯泡）不作为光源采样，
    # 照明交给对应的灯光对象，大幅减少噪点和耗时
    for m in bpy.data.materials:
        if m.name.startswith(("City", "CityLight", "Moon", "NightSky", "Spark", "ScreenDisplay", "AIEye",
                              "desk_lamp_arm_01_light", "SwitchLED", "Main", "Grey", "Black")):
            m.cycles.emission_sampling = "NONE"
    bx.setup_render(res=(1280, 720), samples=40, view="AgX", look="AgX - Medium High Contrast")
    c = sc.cycles
    c.max_bounces = 4
    c.diffuse_bounces = 2
    c.glossy_bounces = 1
    c.transmission_bounces = 4
    c.transparent_max_bounces = 8
    c.caustics_reflective = c.caustics_refractive = False
    c.blur_glossy = 1.0
    c.adaptive_threshold = 0.02
    sc.render.use_persistent_data = True
    sc.render.film_transparent = False
    sc.frame_set(1)
    return sc


if __name__ == "__main__":
    a = bx.args()
    build()
    os.makedirs(WORK, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(WORK, "film.blend"))
    print("[build] saved", os.path.join(WORK, "film.blend"))
    if a and a[0] == "preview":
        pct = int(os.environ.get("PCT", "50"))
        spp = int(os.environ.get("SPP", "16"))
        sc.render.resolution_percentage = pct
        sc.cycles.samples = spp
        for f in [int(x) for x in a[1:]]:
            sc.frame_set(f)
            for name, start, _ in reversed(SHOTS):
                if f >= start:
                    sc.camera = bpy.data.objects[name]
                    break
            bx.render(os.path.join(WORK, "preview", f"f{f:04d}.png"))
