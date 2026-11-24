"""正式渲染：打开 film/work/film.blend，逐帧渲到 film/work/frames/frame_####.png。
已存在的帧会跳过（可断点续渲，中途断了重新运行即可接着渲）。

用法（两种都行）：
    blender -b -P film/render_all.py -- 宽 高 采样 [起始帧 结束帧] [--gpu]
    python film/render_all.py 宽 高 采样 [起始帧 结束帧] [--gpu]      # pip 版 bpy
例：blender -b -P film/render_all.py -- 1920 1080 64 --gpu
"""
import os
import sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
use_gpu = "--gpu" in a
a = [x for x in a if x != "--gpu"]
w, h, spp = (int(a[0]), int(a[1]), int(a[2])) if len(a) >= 3 else (960, 540, 20)

bpy.ops.wm.open_mainfile(filepath=os.path.join(HERE, "work", "film.blend"))
sc = bpy.context.scene
if len(a) >= 5:
    sc.frame_start, sc.frame_end = int(a[3]), int(a[4])


def enable_gpu():
    """依次尝试 OPTIX / CUDA / HIP / METAL / ONEAPI，找到能用的显卡就切过去。返回所用后端名或 None。"""
    prefs = bpy.context.preferences.addons["cycles"].preferences
    for kind in ("OPTIX", "CUDA", "HIP", "METAL", "ONEAPI"):
        try:
            prefs.compute_device_type = kind
        except TypeError:
            continue
        for fn in ("refresh_devices", "get_devices"):
            if hasattr(prefs, fn):
                try:
                    getattr(prefs, fn)()
                except Exception:
                    pass
        gpus = [d for d in prefs.devices if d.type == kind]
        if gpus:
            for d in prefs.devices:
                d.use = d.type == kind
            sc.cycles.device = "GPU"
            return f"{kind}: " + ", ".join(d.name for d in gpus)
    return None


if use_gpu:
    dev = enable_gpu()
    print("[render] GPU ->", dev or "没找到可用显卡，改用 CPU")
    if not dev:
        sc.cycles.device = "CPU"
else:
    sc.cycles.device = "CPU"

r = sc.render
r.resolution_x, r.resolution_y, r.resolution_percentage = w, h, 100
sc.cycles.samples = spp
r.use_persistent_data = True
r.use_overwrite = False
r.use_placeholder = True
r.image_settings.file_format = "PNG"
r.image_settings.color_mode = "RGB"
out = os.path.join(HERE, "work", "frames")
os.makedirs(out, exist_ok=True)
# 清掉上次被中断留下的 0 字节占位文件
for f in os.listdir(out):
    p = os.path.join(out, f)
    if os.path.isfile(p) and os.path.getsize(p) == 0:
        os.remove(p)
r.filepath = os.path.join(out, "frame_")
print(f"[render] {w}x{h} {spp}spp 帧 {sc.frame_start}-{sc.frame_end} -> {out}")
bpy.ops.render.render(animation=True)
print("RENDER_DONE")
