"""姿势工具：让骨骼指向某方向（骨架空间），可打关键帧。"""
import math

import bpy
from mathutils import Vector, Quaternion, Matrix


def _update():
    bpy.context.view_layer.update()


def aim(arm, bone, direction, twist_deg=0.0, key=None):
    """把骨骼 Y 轴转到 direction（骨架局部空间，未缩放朝向，即角色坐标：-Y 是前方）。"""
    pb = arm.pose.bones[bone]
    pb.rotation_mode = "QUATERNION"
    pb.rotation_quaternion = (1, 0, 0, 0)
    _update()
    B0 = pb.matrix.to_3x3().normalized()  # 当前（单位旋转）姿态
    y0 = B0.col[1]
    d = Vector(direction).normalized()
    q = y0.rotation_difference(d)
    if twist_deg:
        q = Quaternion(d, math.radians(twist_deg)) @ q
    R = B0.inverted() @ q.to_matrix() @ B0
    pb.rotation_quaternion = R.to_quaternion()
    _update()
    if key is not None:
        pb.keyframe_insert("rotation_quaternion", frame=key)
    return pb


def rot(arm, bone, axis, deg, key=None, reset=True):
    """绕骨骼局部轴旋转（axis: 'X'/'Y'/'Z'）。"""
    pb = arm.pose.bones[bone]
    pb.rotation_mode = "QUATERNION"
    q = Quaternion(Vector({"X": (1, 0, 0), "Y": (0, 1, 0), "Z": (0, 0, 1)}[axis]), math.radians(deg))
    pb.rotation_quaternion = q if reset else (pb.rotation_quaternion @ q)
    _update()
    if key is not None:
        pb.keyframe_insert("rotation_quaternion", frame=key)
    return pb


def rest(arm, bones=None, key=None):
    for pb in arm.pose.bones:
        if bones and pb.name not in bones:
            continue
        pb.rotation_mode = "QUATERNION"
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.location = (0, 0, 0)
        if key is not None:
            pb.keyframe_insert("rotation_quaternion", frame=key)
            pb.keyframe_insert("location", frame=key)
    _update()


def bone_world(arm, bone, tail=True):
    pb = arm.pose.bones[bone]
    return arm.matrix_world @ (pb.tail if tail else pb.head)


def two_bone(arm, b1, b2, target, pole, key=None):
    """解析两骨 IK（骨架局部坐标）：b1 头部为根，b2 尾部到达 target，肘/膝朝 pole 方向。"""
    pb1 = arm.pose.bones[b1]
    pb2 = arm.pose.bones[b2]
    rest(arm, [b1, b2])
    S = pb1.head.copy()
    L1 = (pb1.tail - pb1.head).length
    L2 = (pb2.tail - pb2.head).length
    T = Vector(target)
    d = min((T - S).length, (L1 + L2) * 0.999)
    dirv = (T - S).normalized()
    a = (L1 * L1 - L2 * L2 + d * d) / (2 * d)
    h = math.sqrt(max(L1 * L1 - a * a, 0.0))
    P = Vector(pole)
    perp = (P - dirv * P.dot(dirv)).normalized()
    E = S + dirv * a + perp * h
    aim(arm, b1, E - S, key=key)
    aim(arm, b2, (S + dirv * d) - arm.pose.bones[b2].head, key=key)
    return E
