"""bpyx —— 无头 Blender（bpy）常用操作的小工具集。

只依赖 bpy / mathutils / 标准库；pip 版 bpy 和 `blender -b -P script.py` 里都能用。

    import sys; sys.path.insert(0, "<skill目录>/scripts")
    import bpyx as bx
    bx.reset()
    obj = bx.add("monkey", mat=bx.material("#ff7a1a", roughness=0.35), smooth=True, subsurf=2)
    bx.backdrop()
    bx.studio_lights()
    cam = bx.camera(direction=(1, -1.6, 0.7))
    bx.setup_render(res=(1280, 720), samples=64)
    bx.preview("preview.png")      # 先看构图
    bx.render("final.png")

颜色约定：hex 字符串（"#ff8800"）和 0-255 整数元组按 sRGB 理解并自动转成 Blender 用的线性值；
0-1 浮点元组按 Blender 原生的线性值原样使用。
角度参数一律用"度"。长度单位是 Blender 单位（米）。
"""
import math
import os
import shutil
import subprocess
import sys
import time
import ctypes.util

import bpy
from mathutils import Vector

__all__ = [
    "args", "reset", "rgba", "material", "assign", "add", "look_at", "bounds",
    "camera", "frame", "light", "studio_lights", "world", "backdrop",
    "setup_render", "gl_available", "preview", "render", "turntable",
    "render_frames", "encode_video", "export", "load",
]


# ---------------------------------------------------------------- 基础

def args():
    """脚本自己的命令行参数。`blender -b -P x.py -- a b` 取 '--' 之后；`python x.py a b` 取 sys.argv[1:]。"""
    if "--" in sys.argv:
        return sys.argv[sys.argv.index("--") + 1:]
    return sys.argv[1:]


def reset():
    """清空成一个空场景（无物体、无相机、无灯），返回 scene。每个脚本开头调一次。"""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def _scene():
    return bpy.context.scene


def _vec(v):
    return Vector(v) if not isinstance(v, Vector) else v.copy()


def _srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rgba(color, alpha=1.0):
    """把各种颜色写法转成 Blender 节点要的线性 RGBA 元组。

    "#rrggbb" / "rrggbb" / "#rgb" / (255, 128, 0)  → 当 sRGB，转线性
    (1.0, 0.5, 0.0) / (1.0, 0.5, 0.0, 1.0)         → 当线性，原样
    """
    if isinstance(color, str):
        h = color.lstrip("#")
        if len(h) == 3:
            h = "".join(ch * 2 for ch in h)
        r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
        return (_srgb_to_linear(r), _srgb_to_linear(g), _srgb_to_linear(b), alpha)
    c = tuple(color)
    if any(isinstance(x, int) and x > 1 for x in c[:3]):
        r, g, b = (_srgb_to_linear(x / 255) for x in c[:3])
        return (r, g, b, alpha)
    return (float(c[0]), float(c[1]), float(c[2]), float(c[3]) if len(c) > 3 else alpha)


# ---------------------------------------------------------------- 材质

def material(color="#cccccc", roughness=0.5, metallic=0.0, *, name=None,
             emission=None, emission_strength=1.0, alpha=1.0,
             transmission=0.0, ior=1.45, coat=0.0):
    """Principled BSDF 材质。

    常用组合：
      塑料   material("#e84a2f", roughness=0.35)
      金属   material("#d4af37", roughness=0.25, metallic=1)
      玻璃   material("#ffffff", roughness=0.02, transmission=1, ior=1.5)
      发光   material("#000000", emission="#33ccff", emission_strength=8)
      车漆   material("#0a3d91", roughness=0.4, coat=1)
    """
    m = bpy.data.materials.new(name or "Mat")
    if bpy.app.version < (5, 0):
        m.use_nodes = True  # 5.x 起新材质默认就有节点，且 use_nodes 已弃用
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = rgba(color)
    b.inputs["Roughness"].default_value = roughness
    b.inputs["Metallic"].default_value = metallic
    b.inputs["Alpha"].default_value = alpha
    b.inputs["Transmission Weight"].default_value = transmission
    b.inputs["IOR"].default_value = ior
    b.inputs["Coat Weight"].default_value = coat
    if emission is not None:
        b.inputs["Emission Color"].default_value = rgba(emission)
        b.inputs["Emission Strength"].default_value = emission_strength
    m.diffuse_color = rgba(color)  # Workbench 预览里显示的颜色
    return m


def assign(obj, mat, replace=True):
    """给物体上材质（默认替换已有材质）。"""
    if replace:
        obj.data.materials.clear()
    obj.data.materials.append(mat)
    return obj


# ---------------------------------------------------------------- 物体

_PRIMS = {
    "cube": "primitive_cube_add", "sphere": "primitive_uv_sphere_add",
    "icosphere": "primitive_ico_sphere_add", "cylinder": "primitive_cylinder_add",
    "cone": "primitive_cone_add", "torus": "primitive_torus_add",
    "plane": "primitive_plane_add", "circle": "primitive_circle_add",
    "grid": "primitive_grid_add", "monkey": "primitive_monkey_add",
}


def add(kind, location=(0, 0, 0), rot_deg=(0, 0, 0), scale=1.0, *, name=None,
        mat=None, smooth=False, subsurf=0, bevel=0.0, bevel_segments=3, **op_kwargs):
    """加一个基本体并顺手设好常用属性，返回物体。

    kind: cube / sphere / icosphere / cylinder / cone / torus / plane / circle / grid / monkey
    scale: 数字或 (x, y, z)
    subsurf: 细分曲面级数（0 = 不加）；bevel: 倒角宽度（0 = 不加）
    op_kwargs: 原样传给 bpy.ops.mesh.primitive_*_add，例如 size=2、radius=0.5、depth=3、vertices=64
    """
    getattr(bpy.ops.mesh, _PRIMS[kind])(location=location, **op_kwargs)
    obj = bpy.context.object
    obj.rotation_euler = [math.radians(a) for a in rot_deg]
    obj.scale = (scale,) * 3 if isinstance(scale, (int, float)) else scale
    if name:
        obj.name = name
    if bevel:
        m = obj.modifiers.new("Bevel", "BEVEL")
        m.width, m.segments = bevel, bevel_segments
        m.limit_method = "ANGLE"
    if subsurf:
        m = obj.modifiers.new("Subsurf", "SUBSURF")
        m.levels = m.render_levels = subsurf
    if smooth and obj.type == "MESH":
        obj.data.shade_smooth()
    if mat is not None:
        assign(obj, mat)
    return obj


def look_at(obj, target):
    """让物体（相机/灯）的 -Z 轴对准 target 点。"""
    bpy.context.view_layer.update()
    d = _vec(target) - obj.matrix_world.translation
    obj.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    return obj


_LIGHT_K = 10.0  # studio_lights 的亮度系数（经验值，Standard 视图下校准）
_RENDERABLE = {"MESH", "CURVE", "SURFACE", "META", "FONT", "CURVES", "POINTCLOUD", "VOLUME"}


def _default_objs(objs):
    if objs:
        return list(objs)
    return [o for o in _scene().objects
            if o.type in _RENDERABLE and not o.get("bpyx_backdrop") and o.visible_get()]


def bounds(objs=None):
    """世界坐标包围盒（含修改器效果）。返回 (min, max, center, radius)，radius 是包围球半径。"""
    objs = _default_objs(objs)
    if not objs:
        raise ValueError("场景里没有可渲染物体")
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for o in objs:
        oe = o.evaluated_get(dg)
        pts += [oe.matrix_world @ Vector(c) for c in oe.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    center = (lo + hi) / 2
    return lo, hi, center, (hi - lo).length / 2


# ---------------------------------------------------------------- 相机

def camera(location=None, target=None, *, lens=50, direction=(1, -1.4, 0.8),
           objs=None, margin=1.15, name="Camera"):
    """建相机并设为场景相机。

    给了 location：放在那里，对准 target（默认物体中心）。
    没给 location：沿 direction（从物体中心指向相机的方向）自动后退到刚好框住 objs，
    margin 是留白倍数。场景里还没物体时请手动给 location。
    lens 是焦距（mm）：35 偏广角，50 标准，85-100 适合产品特写（透视压缩小）。
    """
    cam_data = bpy.data.cameras.new(name)
    cam_data.lens = lens
    cam = bpy.data.objects.new(name, cam_data)
    _scene().collection.objects.link(cam)
    _scene().camera = cam
    if location is not None:
        cam.location = location
        look_at(cam, target if target is not None else bounds(objs)[2])
    else:
        frame(cam, objs, margin=margin, direction=direction)
    return cam


def frame(cam=None, objs=None, margin=1.15, direction=None, sweep=False):
    """移动相机让 objs 完整入画（考虑渲染宽高比）。

    direction 为 None 时保持相机当前朝向，只前后/平移；否则先转到沿 direction 看向物体中心。
    sweep=True 时按物体绕竖直轴转一整圈扫过的范围来框（转台动画用，转到任何角度都不出画）。
    改了分辨率之后应重新 frame 一次。
    """
    cam = cam or _scene().camera
    lo, hi, center, radius = bounds(objs)
    if sweep:
        rh = max(math.hypot(x - center.x, y - center.y) for x in (lo.x, hi.x) for y in (lo.y, hi.y))
        lo = Vector((center.x - rh, center.y - rh, lo.z))
        hi = Vector((center.x + rh, center.y + rh, hi.z))
        radius = (hi - lo).length / 2
    if direction is not None:
        cam.location = center + _vec(direction).normalized() * (radius * 4 + 1)
        look_at(cam, center)
    if sweep:  # 圆柱侧面 16 个点 + 上下圆心，比方盒角点更贴合
        corners = [Vector((center.x + rh * math.cos(a), center.y + rh * math.sin(a), z))
                   for a in (i * math.pi / 8 for i in range(16)) for z in (lo.z, hi.z)]
    else:
        corners = [Vector((x, y, z)) for x in (lo.x, hi.x) for y in (lo.y, hi.y) for z in (lo.z, hi.z)]
    corners = [center + (c - center) * margin for c in corners]
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    flat = [v for c in corners for v in c]
    loc, _scale = cam.camera_fit_coords(dg, flat)
    cam.location = loc
    cam.data.clip_start = min(cam.data.clip_start, 0.01 * radius)
    cam.data.clip_end = max(cam.data.clip_end, (loc - center).length + radius * 20)
    return cam


# ---------------------------------------------------------------- 灯光与环境

def light(kind="AREA", location=(4, -4, 6), target=(0, 0, 0), energy=500, *,
          size=2.0, color="#ffffff", name=None):
    """加一盏灯。kind: AREA / POINT / SPOT / SUN。
    energy 单位：面光/点光/聚光是瓦，太阳光是 W/m²（3~10 就很亮）。"""
    ld = bpy.data.lights.new(name or kind.title(), kind)
    ld.energy = energy
    ld.color = rgba(color)[:3]
    if kind == "AREA":
        ld.size = size
    elif kind in ("POINT", "SPOT"):
        ld.shadow_soft_size = size
    elif kind == "SUN":
        ld.angle = math.radians(size if size > 0.2 else 2)
    obj = bpy.data.objects.new(ld.name, ld)
    _scene().collection.objects.link(obj)
    obj.location = location
    if target is not None:
        look_at(obj, target)
    return obj


def studio_lights(objs=None, strength=1.0, warm_key=True):
    """按物体大小自动摆三点光（主光/补光/轮廓光），返回 [key, fill, rim]。
    strength 整体调亮暗；用 Standard 视图时 1.0 左右曝光正常。"""
    _lo, _hi, c, r = bounds(objs)
    r = max(r, 0.05)
    specs = [  # 方向, 距离倍数, 相对能量, 面光尺寸倍数, 色温
        ((-1.0, -1.2, 1.3), 4.0, 1.00, 1.5, "#fff1e0" if warm_key else "#ffffff"),  # 主光：左前上
        ((1.4, -0.8, 0.4), 5.0, 0.35, 3.0, "#e6f0ff"),                              # 补光：右前，大而柔
        ((0.3, 1.5, 1.2), 4.0, 0.80, 1.0, "#ffffff"),                               # 轮廓光：后上
    ]
    out = []
    for (d, dist_k, e_k, size_k, col), nm in zip(specs, ("Key", "Fill", "Rim")):
        dist = r * dist_k
        loc = c + Vector(d).normalized() * dist
        energy = _LIGHT_K * dist * dist * e_k * strength  # 按平方反比折算，不同尺度亮度一致
        out.append(light("AREA", loc, c, energy, size=r * size_k, color=col, name=nm))
    return out


def world(color="#1e2226", strength=1.0, hdri=None, hdri_rotation_deg=0.0):
    """设置世界背景。纯色或 HDRI 贴图（.hdr/.exr 路径）。背景也会作为环境光照亮物体。"""
    sc = _scene()
    w = sc.world or bpy.data.worlds.new("World")
    sc.world = w
    if bpy.app.version < (5, 0):
        w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    bg.inputs["Strength"].default_value = strength
    if hdri:
        env = nt.nodes.new("ShaderNodeTexEnvironment")
        env.image = bpy.data.images.load(os.path.abspath(hdri), check_existing=True)
        if hdri_rotation_deg:
            coord = nt.nodes.new("ShaderNodeTexCoord")
            mp = nt.nodes.new("ShaderNodeMapping")
            mp.inputs["Rotation"].default_value[2] = math.radians(hdri_rotation_deg)
            nt.links.new(coord.outputs["Generated"], mp.inputs["Vector"])
            nt.links.new(mp.outputs["Vector"], env.inputs["Vector"])
        nt.links.new(env.outputs["Color"], bg.inputs["Color"])
    else:
        bg.inputs["Color"].default_value = rgba(color)
    return w


def backdrop(color="#e9e9e9", *, width=None, back=None, height=None, radius=None,
             floor_z=None, roughness=0.6, segments=24, objs=None):
    """无缝影棚背景：地面 + 弧形过渡 + 背墙（墙在 +Y 方向，相机应从 -Y 一侧拍）。
    尺寸不给时按物体大小自动定，地面默认贴住物体底部。"""
    if objs is not None or any(o.type in _RENDERABLE for o in _scene().objects):
        lo, _hi, c, r = bounds(objs)
    else:
        lo, c, r = Vector((0, 0, 0)), Vector((0, 0, 0)), 1.0
    r = max(r, 0.1)
    width = width or r * 30
    back = back if back is not None else c.y + r * 3
    height = height or r * 15
    radius = radius or r * 2.5
    floor_z = lo.z if floor_z is None else floor_z
    front = c.y - r * 30

    prof = [(front, 0.0)]
    y0 = back - radius
    for i in range(segments + 1):
        t = -math.pi / 2 + (math.pi / 2) * i / segments
        prof.append((y0 + radius * math.cos(t), radius + radius * math.sin(t)))
    prof.append((back, height))

    verts, faces = [], []
    for x in (c.x - width / 2, c.x + width / 2):
        verts += [(x, y, z + floor_z) for y, z in prof]
    n = len(prof)
    faces = [(i, i + 1, n + i + 1, n + i) for i in range(n - 1)]
    me = bpy.data.meshes.new("Backdrop")
    me.from_pydata(verts, [], faces)
    me.update()
    me.shade_smooth()
    obj = bpy.data.objects.new("Backdrop", me)
    obj["bpyx_backdrop"] = True
    _scene().collection.objects.link(obj)
    assign(obj, material(color, roughness=roughness, name="Backdrop"))
    return obj


# ---------------------------------------------------------------- 渲染

def setup_render(engine="CYCLES", res=(1280, 720), samples=64, *, denoise=True,
                 view="Khronos PBR Neutral", look=None, exposure=0.0, transparent=False,
                 percent=100, fmt="PNG", time_limit=0, threads=0):
    """渲染设置。

    engine: CYCLES（无 GPU 时唯一靠谱的写实引擎）/ BLENDER_EEVEE / BLENDER_WORKBENCH
            后两个在无显卡的 Linux 上要先 `setup_bpy.sh --with-gl`。
    samples: Cycles 采样；开了降噪 32~128 就够干净。
    view: "AgX"（Blender 默认，高光过渡自然，颜色偏淡）
          "Standard"（颜色最接近 hex 值，适合品牌色/扁平风/产品图）
          "Khronos PBR Neutral"（色彩准且高光不炸）
    look: 例如 "AgX - Punchy" / "AgX - High Contrast"（仅 AgX 视图）
    transparent: 背景透明（PNG 带 alpha）
    fmt: PNG / JPEG / OPEN_EXR / WEBP
    time_limit: 单帧秒数上限（0 = 不限），到点就停在当前采样数
    """
    sc = _scene()
    r = sc.render
    r.engine = engine
    r.resolution_x, r.resolution_y = res
    r.resolution_percentage = percent
    r.film_transparent = transparent
    if threads:
        r.threads_mode, r.threads = "FIXED", threads
    if engine == "CYCLES":
        sc.cycles.device = "CPU"
        sc.cycles.samples = samples
        sc.cycles.use_adaptive_sampling = True
        sc.cycles.use_denoising = denoise
        if denoise:
            sc.cycles.denoiser = "OPENIMAGEDENOISE"
        sc.cycles.time_limit = time_limit
    elif engine == "BLENDER_EEVEE":
        sc.eevee.taa_render_samples = samples
    sc.view_settings.view_transform = view
    if look:
        sc.view_settings.look = look
    sc.view_settings.exposure = exposure
    im = r.image_settings
    im.file_format = fmt
    if fmt in ("PNG", "OPEN_EXR", "WEBP"):
        im.color_mode = "RGBA" if transparent else "RGB"
    else:
        im.color_mode = "RGB"
    return sc


def gl_available():
    """当前环境能不能用 Workbench/EEVEE（需要 GPU 或 Mesa 软件驱动）。
    GPU 初始化失败会直接杀掉进程，所以必须先判断再用。可用环境变量 BPYX_GL=0/1 强制。"""
    env = os.environ.get("BPYX_GL")
    if env in ("0", "1"):
        return env == "1"
    if os.path.exists(os.path.join(sys.prefix, ".gl_ok")):
        return True
    if sys.platform in ("darwin", "win32"):
        return True
    return bool(ctypes.util.find_library("EGL") and ctypes.util.find_library("vulkan"))


def _log(msg):
    print(f"[bpyx] {msg}", flush=True)


def preview(path, percent=50, samples=16):
    """快速出一张低清预览看构图/布局，不改动正式渲染设置。
    有 GL 用 Workbench（灰模+材质色，几秒）；没有就用 Cycles 低采样。"""
    sc = _scene()
    r = sc.render
    saved = (r.engine, r.resolution_percentage, sc.cycles.samples, sc.cycles.time_limit)
    try:
        r.resolution_percentage = percent
        if gl_available():
            r.engine = "BLENDER_WORKBENCH"
            sh = sc.display.shading
            sh.light, sh.color_type = "STUDIO", "MATERIAL"
            sh.show_shadows = False  # 大背景板上 Workbench 阴影会出条纹瑕疵
        else:
            r.engine = "CYCLES"
            sc.cycles.samples = samples
        return render(path)
    finally:
        r.engine, r.resolution_percentage, sc.cycles.samples, sc.cycles.time_limit = saved


def render(path):
    """渲染当前帧到 path（目录不存在会自动建），返回绝对路径。"""
    path = os.path.abspath(path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    sc = _scene()
    sc.render.filepath = path
    t = time.time()
    bpy.ops.render.render(write_still=True)
    r = sc.render
    _log(f"{r.engine} {r.resolution_x * r.resolution_percentage // 100}x"
         f"{r.resolution_y * r.resolution_percentage // 100} → {path} ({time.time() - t:.1f}s)")
    return path


# ---------------------------------------------------------------- 动画

def turntable(objs=None, frames=120, fps=30, turns=1.0, rotate="objects", start_deg=0.0,
              reframe=True, margin=1.08):
    """360° 旋转展示。rotate="objects" 转物体（灯光不动，反光会流动，像真转台）；
    rotate="camera" 绕物体转相机。首尾无缝循环。返回旋转用的空物体。
    reframe=True 会保持相机朝向、按旋转扫过的范围重新构图，长条物体转到侧面也不出画。
    要先建好相机和背景再调用。"""
    sc = _scene()
    _lo, _hi, c, _r = bounds(objs)
    if reframe and sc.camera:
        frame(sc.camera, objs, margin=margin, sweep=True)
    pivot = bpy.data.objects.new("TurntablePivot", None)
    sc.collection.objects.link(pivot)
    pivot.location = c
    bpy.context.view_layer.update()
    targets = [sc.camera] if rotate == "camera" else _default_objs(objs)
    for o in targets:
        mw = o.matrix_world.copy()
        o.parent = pivot
        o.matrix_world = mw
    prefs = bpy.context.preferences.edit
    old = prefs.keyframe_new_interpolation_type
    prefs.keyframe_new_interpolation_type = "LINEAR"
    try:
        pivot.rotation_euler.z = math.radians(start_deg)
        pivot.keyframe_insert("rotation_euler", index=2, frame=1)
        pivot.rotation_euler.z = math.radians(start_deg) + 2 * math.pi * turns
        pivot.keyframe_insert("rotation_euler", index=2, frame=frames + 1)
    finally:
        prefs.keyframe_new_interpolation_type = old
    sc.frame_start, sc.frame_end = 1, frames   # 第 frames+1 帧 == 第 1 帧，不渲染，保证循环不卡顿
    sc.render.fps = fps
    return pivot


def render_frames(out_dir, start=None, end=None):
    """把动画逐帧渲成 out_dir/frame_0001.png ...，返回 out_dir。
    动画耗时 = 单帧耗时 × 帧数，先单帧试渲再估算；长任务放后台跑。"""
    sc = _scene()
    out_dir = os.path.abspath(out_dir)
    os.makedirs(out_dir, exist_ok=True)
    if start is not None:
        sc.frame_start = start
    if end is not None:
        sc.frame_end = end
    sc.render.image_settings.file_format = "PNG"
    sc.render.filepath = os.path.join(out_dir, "frame_")
    t = time.time()
    bpy.ops.render.render(animation=True)
    n = sc.frame_end - sc.frame_start + 1
    _log(f"{n} 帧 → {out_dir} ({time.time() - t:.1f}s, {(time.time() - t) / max(n, 1):.1f}s/帧)")
    return out_dir


def encode_video(frames_dir, out_path, fps=30, crf=18):
    """用系统 ffmpeg 把 frame_####.png 合成 .mp4（H.264, yuv420p, 兼容微信/手机）或 .gif。"""
    ff = shutil.which("ffmpeg")
    if not ff:
        raise RuntimeError("没有 ffmpeg：apt-get install -y ffmpeg，或 pip install imageio-ffmpeg")
    src = os.path.join(os.path.abspath(frames_dir), "frame_%04d.png")
    out_path = os.path.abspath(out_path)
    if out_path.lower().endswith(".gif"):
        vf = "fps={0},scale=trunc(iw/2)*2:-2:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse".format(fps)
        cmd = [ff, "-y", "-loglevel", "error", "-framerate", str(fps), "-i", src, "-vf", vf, out_path]
    else:
        cmd = [ff, "-y", "-loglevel", "error", "-framerate", str(fps), "-i", src,
               "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", "-c:v", "libx264",
               "-pix_fmt", "yuv420p", "-crf", str(crf), "-movflags", "+faststart", out_path]
    subprocess.run(cmd, check=True)
    _log(f"视频 → {out_path}")
    return out_path


# ---------------------------------------------------------------- 导入导出

def _select_only(objs):
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    for o in objs:
        o.select_set(True)
    if objs:
        bpy.context.view_layer.objects.active = objs[0]


def export(path, objs=None, **kw):
    """按扩展名导出：.blend .glb .gltf .fbx .obj .stl .ply .usd/.usdc/.usda/.usdz。
    objs 给了就只导出这些物体（.blend 总是整个文件）。kw 原样传给对应导出算子，
    例如 STL 想按毫米出：export("a.stl", global_scale=1000)。"""
    path = os.path.abspath(path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    ext = os.path.splitext(path)[1].lower()
    sel = objs is not None
    if sel:
        _select_only(list(objs))
    if ext == ".blend":
        try:
            bpy.ops.file.pack_all()  # 把贴图打进 .blend，发给别人不丢图
        except RuntimeError:
            pass
        bpy.ops.wm.save_as_mainfile(filepath=path, copy=True, **kw)
    elif ext in (".glb", ".gltf"):
        bpy.ops.export_scene.gltf(filepath=path, use_selection=sel,
                                  export_format="GLB" if ext == ".glb" else "GLTF_SEPARATE", **kw)
    elif ext == ".fbx":
        bpy.ops.export_scene.fbx(filepath=path, use_selection=sel, **kw)
    elif ext == ".obj":
        bpy.ops.wm.obj_export(filepath=path, export_selected_objects=sel, **kw)
    elif ext == ".stl":
        bpy.ops.wm.stl_export(filepath=path, export_selected_objects=sel, **kw)
    elif ext == ".ply":
        bpy.ops.wm.ply_export(filepath=path, export_selected_objects=sel, **kw)
    elif ext in (".usd", ".usdc", ".usda", ".usdz"):
        kw.setdefault("convert_world_material", False)  # 否则会多出一个 textures/ 文件夹
        bpy.ops.wm.usd_export(filepath=path, selected_objects_only=sel, **kw)
    else:
        raise ValueError(f"不支持的导出格式: {ext}")
    _log(f"导出 → {path} ({os.path.getsize(path) / 1024:.0f} KB)")
    return path


def load(path, **kw):
    """按扩展名导入模型（.blend 会作为整个场景打开），返回新增的物体列表。"""
    path = os.path.abspath(path)
    ext = os.path.splitext(path)[1].lower()
    before = set(bpy.data.objects)
    if ext == ".blend":
        bpy.ops.wm.open_mainfile(filepath=path, **kw)
        return list(bpy.data.objects)
    ops = {
        ".glb": lambda: bpy.ops.import_scene.gltf(filepath=path, **kw),
        ".gltf": lambda: bpy.ops.import_scene.gltf(filepath=path, **kw),
        ".fbx": lambda: bpy.ops.import_scene.fbx(filepath=path, **kw),
        ".obj": lambda: bpy.ops.wm.obj_import(filepath=path, **kw),
        ".stl": lambda: bpy.ops.wm.stl_import(filepath=path, **kw),
        ".ply": lambda: bpy.ops.wm.ply_import(filepath=path, **kw),
    }
    if ext in (".usd", ".usdc", ".usda", ".usdz"):
        bpy.ops.wm.usd_import(filepath=path, **kw)
    elif ext in ops:
        ops[ext]()
    else:
        raise ValueError(f"不支持的导入格式: {ext}")
    return [o for o in bpy.data.objects if o not in before]
