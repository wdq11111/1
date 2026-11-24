"""角色设定图：每个角色渲染 正面 + 3/4 侧面（透明底）+ 头部特写，之后由 compose_sheet.py 拼版。

用法：python sheet.py <key> <outdir> [高度像素=1800] [采样=32] [views=front,q34,face]
"""
import math
import os
import sys
import time

import bpy
from mathutils import Vector, Matrix

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import core
from core import bx
import chars
import posing

key = sys.argv[1]
out = sys.argv[2]
H = int(sys.argv[3]) if len(sys.argv) > 3 else 1800
SPP = int(sys.argv[4]) if len(sys.argv) > 4 else 32
views = (sys.argv[5] if len(sys.argv) > 5 else "front,q34,face").split(",")
os.makedirs(out, exist_ok=True)

t0 = time.time()
bx.reset()
sc = bpy.context.scene
ch = chars.build_character(key)
arm = ch["arm"]
print(f"[sheet] {key} build {time.time() - t0:.1f}s, verts {len(ch['mesh'].data.vertices)}", flush=True)

# ---- 设定图姿势：Claude 右手把书抱在胸前，其余保持静止姿态
if key == "cla":
    # 右手把书立在右胸前（解析两骨 IK），书面朝前、略向内转
    posing.two_bone(arm, "upper_arm.R", "forearm.R", (-0.085, -0.120, 1.075), (-1.0, 0.5, -0.4))
    posing.aim(arm, "hand.R", Vector((0.10, -0.35, 1.0)))
    bpy.context.view_layer.update()
    book = ch["props"][0]
    pb = arm.pose.bones["hand.R"]
    hd = (pb.tail - pb.head).normalized()
    c = pb.head + hd * 0.075 + Vector((0.012, -0.030, 0.0))
    R = Matrix.Rotation(math.radians(14), 4, "Z") @ Matrix.Rotation(math.radians(-10), 4, "X")
    book.matrix_world = arm.matrix_world @ (Matrix.Translation(c) @ R)
if key == "gem":
    pass

# ---- 灯光：暖色主光（左前上）、冷色轮廓光（右后）、弱补光
def sun(name, energy, color, rot):
    l = bpy.data.lights.new(name, "SUN")
    l.energy = energy
    l.color = color
    l.angle = math.radians(2.0)
    o = bpy.data.objects.new(name, l)
    sc.collection.objects.link(o)
    o.rotation_euler = [math.radians(a) for a in rot]
    return o


sun("Key", 2.1, (1.0, 0.93, 0.86), (52, 0, -36))
sun("Rim", 2.6, (0.62, 0.76, 1.0), (-62, 0, -28))
sun("Rim2", 1.4, (0.75, 0.80, 1.0), (-60, 0, 40))
sun("Fill", 0.25, (0.85, 0.88, 1.0), (75, 0, 65))
bx.world("#7c86a8", 0.18)

cam = bx.camera(location=(0, -5.2, 0.86), target=(0, 0, 0.84), lens=85)
sc.render.engine = "BLENDER_EEVEE"
sc.eevee.taa_render_samples = SPP
sc.eevee.use_raytracing = False
sc.eevee.use_shadows = True
sc.eevee.shadow_resolution_scale = 1.0
sc.render.film_transparent = True
sc.view_settings.view_transform = "Standard"
sc.view_settings.look = "None"
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGBA"


def shoot(name, rot_deg, res, loc, target, lens):
    arm.rotation_euler.z = math.radians(rot_deg)
    sc.render.resolution_x, sc.render.resolution_y = res
    cam.location = loc
    cam.data.lens = lens
    bx.look_at(cam, target)
    t = time.time()
    bx.render(os.path.join(out, f"{key}_{name}.png"))
    print(f"[sheet] {key} {name} {time.time() - t:.1f}s", flush=True)


W = int(H * 0.60)
if "front" in views:
    shoot("front", 0, (W, H), (0, -5.6, 0.86), (0, 0, 0.84), 85)
if "q34" in views:
    shoot("q34", 32, (W, H), (0, -5.6, 0.86), (0, 0, 0.84), 85)
if "face" in views:
    s = chars.SCALE[key]
    hz = 1.49 * s
    shoot("face", 14, (int(H * 0.5), int(H * 0.5)), (0, -2.0, hz + 0.02), (0, 0, hz - 0.01), 105)
print(f"[sheet] {key} total {time.time() - t0:.1f}s", flush=True)
