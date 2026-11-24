# bpy 5.x 常用写法与踩坑笔记

以下代码都在 bpy 5.3（pip 版，无 GPU）里实际跑过。每段默认已经执行了：

```
import bpy, bmesh, math, sys
sys.path.insert(0, "<skill目录>/scripts"); import bpyx as bx
bx.reset()
```

目录：
1. 后台模式的限制
2. 从顶点/面直接建网格
3. bmesh 程序化建模
4. 修改器（阵列/镜像/实体化/布尔）与应用修改器
5. 曲线：管子、路径
6. 文字（含中文）
7. 贴图：图片纹理 / 程序纹理
8. 大量重复物体：共享网格
9. 关键帧动画（5.x 的 Action 改了）
10. 相机：景深、正交/等轴测
11. 刚体物理
12. 导入用户模型并归一化
13. 3D 打印检查
14. 用数值检查渲染结果

---

## 1. 后台模式的限制

- 没有 3D 视图窗口，`bpy.ops.view3d.*`、依赖鼠标/视口的算子都不能用；优先用数据 API（`bpy.data`、`obj.data`、bmesh）。
- 大部分 `bpy.ops.object.*` / `bpy.ops.mesh.*` 能用，前提是有活动物体：
  `bpy.context.view_layer.objects.active = obj`，必要时用 `bpy.context.temp_override(...)`。
- `Material.use_nodes` / `World.use_nodes` 在 5.x 已弃用（新材质/世界默认就有节点），不要再设。
- `Action.fcurves` 在 5.x 已删除，见第 9 节。
- glTF 导出的 Draco 压缩在 pip 版里不可用（缺库），别开 `export_draco_mesh_compression_enable`。
- 列表里能看到 CUDA/OptiX，但容器里没显卡，`cycles.device` 只能用 `"CPU"`。
- 一个进程只 import 一次 bpy；想要干净场景就 `bx.reset()`，不要试图重新 import。
- 金属（metallic=1）和镜面只会反射周围环境：世界背景是暗色又没有背景板时，金属会发黑、几乎看不见。给它亮一点的 `bx.world(...)`、HDRI 或 `bx.backdrop()`。

## 2. 从顶点/面直接建网格

```python
verts = [(0, 0, 0), (2, 0, 0), (2, 1, 0), (0, 1, 0), (1, 0.5, 1.2)]
faces = [(0, 1, 2, 3), (0, 1, 4), (1, 2, 4), (2, 3, 4), (3, 0, 4)]
me = bpy.data.meshes.new("Pyramid")
me.from_pydata(verts, [], faces)
me.validate(); me.update()
obj = bpy.data.objects.new("Pyramid", me)
bpy.context.scene.collection.objects.link(obj)
bx.assign(obj, bx.material("#3aa76d"))
```

## 3. bmesh 程序化建模

适合"挤出、内插、按规则生成"的模型。改完 `bm.to_mesh(me)` 写回。

```python
me = bpy.data.meshes.new("Building")
bm = bmesh.new()
bmesh.ops.create_cube(bm, size=1.0)
top = [f for f in bm.faces if f.normal.z > 0.9][0]
for _ in range(4):  # 逐层：顶面内缩一圈 → 向上挤出，做出阶梯塔
    bmesh.ops.inset_individual(bm, faces=[top], thickness=0.08)
    ext = bmesh.ops.extrude_face_region(bm, geom=[top])
    bmesh.ops.delete(bm, geom=[top], context="FACES_ONLY")   # 挤出后原面留在内部，要删掉
    top = [g for g in ext["geom"] if isinstance(g, bmesh.types.BMFace)][0]
    bmesh.ops.translate(bm, verts=top.verts, vec=(0, 0, 0.5))
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
bm.to_mesh(me); bm.free()
obj = bpy.data.objects.new("Building", me)
bpy.context.scene.collection.objects.link(obj)
```

## 4. 修改器与应用修改器

```python
# 阵列 + 镜像：一排 5 个，再以世界原点为镜面复制到对面
obj = bx.add("cube", location=(-1.2, 1, 0.25), size=0.5, mat=bx.material("#888888"))
arr = obj.modifiers.new("Array", "ARRAY")
arr.count = 5
arr.relative_offset_displace = (1.2, 0, 0)       # 间距 = 1.2 倍自身尺寸
center = bpy.data.objects.new("MirrorCenter", None)
bpy.context.scene.collection.objects.link(center)
mir = obj.modifiers.new("Mirror", "MIRROR")
mir.use_axis = (False, True, False)
mir.mirror_object = center                        # 不设的话以物体自身原点为镜面，会和自己重叠

# 实体化：给薄片加厚度（对封闭物体没意义）
sheet = bx.add("plane", location=(0, -3, 0), size=2)
sol = sheet.modifiers.new("Solidify", "SOLIDIFY"); sol.thickness = 0.1

# 布尔：用一个圆柱在立方体上打孔，切割体渲染时隐藏
block = bx.add("cube", location=(0, 3, 0), size=1)
cutter = bx.add("cylinder", location=(0, 3, 0), radius=0.25, depth=2)
cutter.hide_render = True; cutter.display_type = "WIRE"
b = block.modifiers.new("Hole", "BOOLEAN"); b.operation = "DIFFERENCE"; b.object = cutter

# 应用修改器（把效果真正写进网格，例如导出 STL 前）
with bpy.context.temp_override(object=block, active_object=block, selected_objects=[block]):
    bpy.ops.object.modifier_apply(modifier="Hole")
bpy.data.objects.remove(cutter)
```

导出 glb/fbx/obj/stl 时修改器默认会自动应用（导出的是计算后的网格），不必手动应用。

## 5. 曲线：管子、路径

```python
cu = bpy.data.curves.new("Tube", "CURVE")
cu.dimensions = "3D"
cu.bevel_depth = 0.12          # 管子半径
cu.bevel_resolution = 4
cu.use_fill_caps = True
sp = cu.splines.new("BEZIER")
pts = [(0, 0, 0), (1, 1, 0.5), (2, 0, 1), (3, 1, 1.5)]
sp.bezier_points.add(len(pts) - 1)
for bp, co in zip(sp.bezier_points, pts):
    bp.co = co
    bp.handle_left_type = bp.handle_right_type = "AUTO"
obj = bpy.data.objects.new("Tube", cu)
bpy.context.scene.collection.objects.link(obj)
bx.assign(obj, bx.material("#c0c0c0", roughness=0.2, metallic=1))
```

把 `"BEZIER"` 换成 `"POLY"`、用 `sp.points`（4 维坐标 `(x, y, z, 1)`）可以直接画折线。

## 6. 文字（含中文）

默认字体不含中文，必须加载 CJK 字体。先 `fc-list :lang=zh` 找字体文件；没有就 `apt-get install -y fonts-noto-cjk`（或 `fonts-wqy-zenhei`）。

```python
bpy.ops.object.text_add()
t = bpy.context.object
t.data.body = "新品上市 2026"
t.data.font = bpy.data.fonts.load("/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc")
t.data.align_x = "CENTER"
t.data.extrude = 0.06            # 厚度
t.data.bevel_depth = 0.008       # 边缘倒角，反光更好看
t.rotation_euler = (math.radians(90), 0, 0)   # 立起来面向 -Y（相机方向）
bx.assign(t, bx.material("#ffd23f", roughness=0.3, metallic=0.6))
```

## 7. 贴图

图片纹理（标签、logo、照片）需要 UV；基本体自带 UV。

```python
img = bpy.data.images.load("/abs/path/label.png")
obj = bx.add("plane", size=2)
m = bx.material(name="Label")
nt = m.node_tree
tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = img
bsdf = nt.nodes["Principled BSDF"]
nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
nt.links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])   # PNG 透明区域
bx.assign(obj, m)
```

程序纹理（大理石、噪波、渐变）不需要外部文件：

```python
obj = bx.add("sphere", segments=64, ring_count=32, smooth=True)
m = bx.material(name="Marble", roughness=0.15)
nt = m.node_tree
noise = nt.nodes.new("ShaderNodeTexNoise")
noise.inputs["Scale"].default_value = 4.0
noise.inputs["Detail"].default_value = 12.0
ramp = nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].color = bx.rgba("#2b2b2b")
ramp.color_ramp.elements[1].color = bx.rgba("#f4f1ea")
nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
nt.links.new(ramp.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"])
bx.assign(obj, m)
```

其他常用纹理节点：`ShaderNodeTexVoronoi`、`ShaderNodeTexWave`、`ShaderNodeTexGradient`、`ShaderNodeTexChecker`、`ShaderNodeTexBrick`。

## 8. 大量重复物体：共享网格

几百上千个相同物体时，复制物体但共享同一份网格数据，又快又省内存：

```python
import random
random.seed(7)
src = bx.add("icosphere", subdivisions=2, radius=0.1, mat=bx.material("#ff5d8f"), smooth=True)
for i in range(300):
    o = src.copy()                       # 不 copy data，所以共享网格
    o.location = (random.uniform(-3, 3), random.uniform(-3, 3), random.uniform(0, 2))
    o.scale = (random.uniform(0.5, 1.5),) * 3
    bpy.context.scene.collection.objects.link(o)
```

## 9. 关键帧动画

```python
obj = bx.add("cube", size=0.5)
sc = bpy.context.scene
sc.frame_start, sc.frame_end = 1, 60
sc.render.fps = 30

obj.location = (-2, 0, 0); obj.keyframe_insert("location", frame=1)
obj.location = (2, 0, 1);  obj.keyframe_insert("location", frame=60)
obj.rotation_euler = (0, 0, 0); obj.keyframe_insert("rotation_euler", frame=1)
obj.rotation_euler = (0, 0, math.radians(180)); obj.keyframe_insert("rotation_euler", frame=60)

# 5.x 里 Action 没有 .fcurves 了，要通过 channelbag 取
from bpy_extras import anim_utils
ad = obj.animation_data
cb = anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot)
for fc in cb.fcurves:
    for kp in fc.keyframe_points:
        kp.interpolation = "BEZIER"
        kp.easing = "EASE_IN_OUT"       # 或在插入前设 preferences.edit.keyframe_new_interpolation_type
```

材质参数也能打关键帧，例如发光强度：
`bsdf.inputs["Emission Strength"].keyframe_insert("default_value", frame=10)`。

渲染：`bx.render_frames("frames")` 然后 `bx.encode_video("frames", "out.mp4", fps=30)`。

## 10. 相机：景深、正交/等轴测

```python
target = bx.add("monkey", smooth=True)
cam = bx.camera(direction=(0.5, -1, 0.3), lens=85)
cam.data.dof.use_dof = True
cam.data.dof.focus_object = target
cam.data.dof.aperture_fstop = 2.0     # 越小虚化越强

# 等轴测（游戏/信息图风格）
iso = bx.camera(location=(10, -10, 10), target=(0, 0, 0), name="Iso")
iso.data.type = "ORTHO"
iso.data.ortho_scale = 6              # 画面能装下的宽度
iso.rotation_euler = (math.radians(54.736), 0, math.radians(45))
bpy.context.scene.camera = iso
```

## 11. 刚体物理

```python
sc = bpy.context.scene
ground = bx.add("plane", size=10)
bpy.context.view_layer.objects.active = ground
bpy.ops.rigidbody.world_add()
bpy.ops.rigidbody.object_add(); ground.rigid_body.type = "PASSIVE"
for i in range(5):
    c = bx.add("cube", location=(0.1 * i, 0, 1 + i * 0.6), size=0.4, rot_deg=(10 * i, 5 * i, 0))
    bpy.ops.rigidbody.object_add()     # 作用于刚加的活动物体
    c.rigid_body.mass = 1.0
sc.frame_start, sc.frame_end = 1, 80
sc.rigidbody_world.point_cache.frame_end = 80
for f in range(1, 81):                 # 逐帧推进 = 模拟；之后渲染任意帧都正确
    sc.frame_set(f)
```

## 12. 导入用户模型并归一化

用户给的模型尺寸、位置各不相同，先归一化再布光，否则灯光/相机全乱：

```python
from mathutils import Vector
objs = bx.load("/abs/path/model.glb")
meshes = [o for o in objs if o.type == "MESH"]
lo, hi, c, r = bx.bounds(meshes)
root = bpy.data.objects.new("ModelRoot", None)
bpy.context.scene.collection.objects.link(root)
for o in objs:
    if o.parent is None:
        o.parent = root
s = 1.0 / max(r, 1e-6)               # 缩放到包围球半径 1
root.scale = (s, s, s)
root.location = (-c.x * s, -c.y * s, -lo.z * s)   # 底部贴地、水平居中
bx.backdrop(); bx.studio_lights(); bx.camera(direction=(1, -1.6, 0.6))
```

## 13. 3D 打印检查

- Blender 单位是米；切片软件通常把 STL 数值当毫米。在 Blender 里按"1 单位 = 1 毫米"建模最省事，或者导出时 `bx.export("a.stl", global_scale=1000)`（按米建模时）。
- 先应用所有修改器（导出默认会应用），再检查是否水密：

```python
obj = bx.add("cube", size=20)
bm = bmesh.new(); bm.from_mesh(obj.data)
non_manifold = [e for e in bm.edges if not e.is_manifold]
loose = [v for v in bm.verts if not v.link_edges]
print("非流形边:", len(non_manifold), "孤立点:", len(loose), "体积:", round(bm.calc_volume(), 2))
bm.free()
```

## 14. 用数值检查渲染结果

除了用 Read 工具看图，还可以读像素判断主体过曝/欠曝。用透明背景渲一张小图，只统计主体像素：

```python
import numpy as np
bx.add("monkey", smooth=True, mat=bx.material("#808080")); bx.studio_lights(); bx.camera()
bx.setup_render(res=(160, 90), samples=8, transparent=True)
p = bx.render("/tmp/check.png")
img = bpy.data.images.load(p)
a = np.array(img.pixels[:]).reshape(img.size[1], img.size[0], 4)
subj = a[a[..., 3] > 0.5][:, :3]          # 只看主体（alpha 不透明的像素）
print(f"主体平均亮度 {subj.mean():.2f}，过曝像素 {(subj >= 0.99).mean():.1%}")
```

中灰材质的主体平均亮度在 0.35~0.6 之间算正常；过曝像素超过百分之几，就降低 `studio_lights(strength=...)` 或 `setup_render(exposure=-0.5)`。
