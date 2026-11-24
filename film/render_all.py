"""正式渲染：打开 film/work/film.blend，逐帧渲到 film/work/frames/frame_####.png。
已存在的帧会跳过（可断点续渲）。用法：python film/render_all.py [宽 高 采样 起始帧 结束帧]"""
import os, sys
import bpy
HERE = os.path.dirname(os.path.abspath(__file__))
a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
w, h, spp = (int(a[0]), int(a[1]), int(a[2])) if len(a) >= 3 else (960, 540, 20)
bpy.ops.wm.open_mainfile(filepath=os.path.join(HERE, "work", "film.blend"))
sc = bpy.context.scene
if len(a) >= 5:
    sc.frame_start, sc.frame_end = int(a[3]), int(a[4])
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
    if os.path.getsize(p) == 0:
        os.remove(p)
r.filepath = os.path.join(out, "frame_")
bpy.ops.render.render(animation=True)
print("RENDER_DONE")
