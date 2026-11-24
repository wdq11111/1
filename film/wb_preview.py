"""快速灰模（Workbench）预览动画：打开 film.blend，用镜头标记对应的相机渲指定帧。
用法：python film/wb_preview.py out_prefix f1 f2 ...   （加环境变量 CAM=xxx 可强制用某个相机）"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bpyx as bx
HERE = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.open_mainfile(filepath=os.path.join(HERE, "work", "film.blend"))
sc = bpy.context.scene
pre, frames = bx.args()[0], [int(x) for x in bx.args()[1:]]
sc.render.engine = "BLENDER_WORKBENCH"
sh = sc.display.shading
sh.light, sh.color_type = "STUDIO", "MATERIAL"
sc.render.resolution_percentage = 30
sc.view_settings.view_transform = "Standard"
for f in frames:
    sc.frame_set(f)
    if os.environ.get("CAM"):
        sc.camera = bpy.data.objects[os.environ["CAM"]]
    else:
        ms = sorted([m for m in sc.timeline_markers if m.frame <= f], key=lambda m: m.frame)
        sc.camera = ms[-1].camera
    sc.render.filepath = os.path.join(HERE, "work", "wb", f"{pre}_{f:04d}.png")
    bpy.ops.render.render(write_still=True)
print("done")
