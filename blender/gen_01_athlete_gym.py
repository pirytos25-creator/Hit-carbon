"""
Builds public/models/athlete_gym.glb (Benchmark A — HUMAN MOTION):
- Realistic adult athlete created with MPFB2 (MakeHuman CC0 basemesh + athletic macrodetails)
- Skinned to the 53-bone MPFB2 `game_engine` Armature with 6 baked NLA cyclic gait Actions:
  Idle_Prep, Walk, Jog, Run_Fast, HIIT_Sprint, Recovery_Walk
- Separate fitted compression singlet, running shorts, articulated sneakers, hair, eyes
- Fitted internal anatomical layers (sculpted striated muscular layer skinned to the SAME armature,
  recessed spine/ribcage/pelvis/limb skeleton, HuBMAP heart & lungs proxy, vascular & nervous trees)
- Shape Keys (`Breath_Expand`, `Effort_Face`) for respiratory chest motion and facial effort
- Sunlit architectural gym with natural window daylight shafts, dumbbell/kettlebell rack, bench,
  mirror, indoor plant, and detailed commercial motorized HIIT treadmill (deck Z = 0.145m).
"""
import math
import os
import sys
import bpy
import bmesh
from mathutils import Vector, Euler, Quaternion

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
RAW_DIR = os.path.join(ROOT_DIR, "assets_raw")
MODELS_DIR = os.path.join(ROOT_DIR, "public", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

import lib_bio_mesh as bio
from bl_ext.blender_org.mpfb.services.humanservice import HumanService


DECK_Z = 0.145


def rotate_pose_bone_armature(pb, ax: float, ay: float, az: float):
    """
    Sets bone rotation_quaternion from armature-space Euler angles (XYZ radians):
    - Around +X (ax): + = leg swings back / knee bends back / trunk leans forward; - = leg/arm swings forward
    - Around +Y (ay): adduction/abduction & side lean
    - Around +Z (az): axial yaw twist
    """
    pb.rotation_mode = 'QUATERNION'
    q_arm = Euler((ax, ay, az), 'XYZ').to_quaternion()
    rest_q = pb.bone.matrix_local.to_3x3().to_quaternion()
    pb.rotation_quaternion = (rest_q.inverted() @ q_arm @ rest_q).normalized()


def get_helper_eye_centers(bm_obj):
    """Reads exact orbital eye centers from MPFB2 helper-l-eye / helper-r-eye BEFORE deleting helpers."""
    centers = {}
    for gname in ('helper-l-eye', 'helper-r-eye'):
        vg = bm_obj.vertex_groups.get(gname)
        if vg is None:
            continue
        pts = [v.co.copy() for v in bm_obj.data.vertices if any(g.group == vg.index and g.weight > 0.5 for g in v.groups)]
        if pts:
            centers[gname] = sum(pts, Vector((0, 0, 0))) / len(pts)
    return centers


def apply_hide_helpers_cleanly(bm_obj):
    """Applies Hide helpers mask cleanly, removes hidden foot vertices under sneakers, preserves weights."""
    bpy.ops.object.select_all(action='DESELECT')
    bm_obj.select_set(True)
    bpy.context.view_layer.objects.active = bm_obj
    if 'Hide helpers' in bm_obj.modifiers:
        bpy.ops.object.modifier_move_to_index(modifier='Hide helpers', index=0)
        bpy.ops.object.modifier_apply(modifier='Hide helpers')
    for vg in list(bm_obj.vertex_groups):
        if vg.name.startswith('helper-') or vg.name in ('HelperGeometry', 'JointCubes', 'Left', 'Mid', 'Right', 'body') or vg.name.startswith('joint-'):
            bm_obj.vertex_groups.remove(vg)

    # Remove skin vertices inside athletic sneakers (below ankle cuff z < 0.058m) so bare toes NEVER clip shoes!
    me = bm_obj.data
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.faces.ensure_lookup_table()
    foot_faces = [f for f in bm.faces if f.calc_center_median().z < 0.058]
    if foot_faces:
        bmesh.ops.delete(bm, geom=foot_faces, context='FACES')
        bm.normal_update()
        bm.to_mesh(me)
    bm.free()


def bind_rigid_mesh_to_bone(obj, rig_obj, bone_name: str):
    """
    Binds any rigid accessory or organ mesh directly to a single bone via ARMATURE modifier
    and 1.0 vertex weight. Far more reliable in Three.js glTF/SkeletonUtils than BONE parenting!
    """
    obj.parent = rig_obj
    obj.vertex_groups.clear()
    vg = obj.vertex_groups.new(name=bone_name)
    all_idx = [v.index for v in obj.data.vertices]
    if all_idx:
        vg.add(all_idx, 1.0, 'REPLACE')
    arm_mod = obj.modifiers.new(name="Armature", type='ARMATURE')
    arm_mod.object = rig_obj
    return obj


def build_extracted_garment(source_obj, name: str, z_min_fn, z_max_fn, offset_m: float, mat, rig_obj, col, limit_arms_x=None):
    """
    Duplicates anatomical `source_obj`, keeps faces inside contoured [z_min_fn(x,y), z_max_fn(x,y)],
    smooths garment boundary loops to eliminate jagged triangles, pushes outward along normals,
    and binds to `rig_obj` inheriting true MPFB2 skin weights!
    """
    garment = source_obj.copy()
    garment.data = source_obj.data.copy()
    garment.name = name
    garment.modifiers.clear()
    bio.link_obj(garment, col)

    me = garment.data
    bmesh_tmp = bmesh.new()
    bmesh_tmp.from_mesh(me)
    bmesh_tmp.verts.ensure_lookup_table()
    bmesh_tmp.faces.ensure_lookup_table()

    to_del = []
    for f in bmesh_tmp.faces:
        c = f.calc_center_median()
        if c.z < z_min_fn(c.x, c.y) or c.z > z_max_fn(c.x, c.y):
            to_del.append(f)
        elif limit_arms_x is not None and abs(c.x) > limit_arms_x:
            to_del.append(f)
    if to_del:
        bmesh.ops.delete(bmesh_tmp, geom=to_del, context='FACES')

    # Clean isolated vertices and smooth boundary hem/collar vertices across 4 passes for crisp tailored edges!
    bmesh_tmp.normal_update()
    b_edges = [e for e in bmesh_tmp.edges if e.is_boundary]
    b_verts = list({v for e in b_edges for v in e.verts})
    if b_verts:
        for v in b_verts:
            z_lo = z_min_fn(v.co.x, v.co.y)
            z_hi = z_max_fn(v.co.x, v.co.y)
            if abs(v.co.z - z_lo) < 0.032:
                v.co.z = z_lo
            elif abs(v.co.z - z_hi) < 0.032:
                v.co.z = z_hi
        for _ in range(4):
            bmesh.ops.smooth_vert(bmesh_tmp, verts=b_verts, factor=0.65, use_axis_x=True, use_axis_y=True, use_axis_z=True)

    bmesh_tmp.normal_update()
    for v in bmesh_tmp.verts:
        v.co += v.normal * offset_m
    bmesh_tmp.to_mesh(me)
    bmesh_tmp.free()

    me.materials.clear()
    me.materials.append(mat)
    for p in me.polygons:
        p.use_smooth = True

    garment.parent = rig_obj
    arm_mod = garment.modifiers.new(name="Armature", type='ARMATURE')
    arm_mod.object = rig_obj
    return garment


def build_muscular_cutaway_layer(skin_obj, rig_obj, mat_muscle, col):
    """
    Creates a full fitted anatomical muscular layer inside the skin (~4.5 mm recessed)
    using duplicated MPFB2 skin topology + sinusoidal anatomical muscle belly relief
    bound 1:1 to `rig_obj` so muscles visibly deform during leg stride when exposed!
    """
    musc = skin_obj.copy()
    musc.data = skin_obj.data.copy()
    musc.name = "Layer_Muscular_Body"
    musc.modifiers.clear()
    bio.link_obj(musc, col)

    me = musc.data
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.verts.ensure_lookup_table()
    bm.faces.ensure_lookup_table()

    # Keep body below neck (exclude head & distal fingers/toes so eyeballs/shoes never poke)
    to_del = [f for f in bm.faces if f.calc_center_median().z > 1.50 or f.calc_center_median().z < 0.05]
    if to_del:
        bmesh.ops.delete(bm, geom=to_del, context='FACES')

    bm.normal_update()
    for v in bm.verts:
        # Carve subtle anatomical muscle-group grooves along quadriceps, rectus abdominis, pectorals
        groove = (
            math.sin(v.co.x * 48.0 + v.co.y * 22.0) * math.cos(v.co.z * 32.0) * 0.0022
        )
        v.co -= v.normal * (0.0055 - groove)
    bm.to_mesh(me)
    bm.free()

    me.materials.clear()
    me.materials.append(mat_muscle)
    for p in me.polygons:
        p.use_smooth = True

    musc.parent = rig_obj
    arm_mod = musc.modifiers.new(name="Armature", type='ARMATURE')
    arm_mod.object = rig_obj
    return musc


def add_athlete_accessories(skin_obj, rig_obj, col, eye_centers=None):
    """Adds glossy eyeballs fitted to exact MPFB2 sockets, eyebrows, hair cap, and detailed sneakers."""
    mat_sclera = bio.make_pbr_material("Athlete_Eye_Sclera", (0.95, 0.94, 0.92, 1.0), roughness=0.14, coat_weight=0.85)
    mat_iris = bio.make_pbr_material("Athlete_Eye_Iris", (0.12, 0.32, 0.48, 1.0), roughness=0.10, coat_weight=0.95)
    mat_pupil = bio.make_pbr_material("Athlete_Eye_Pupil", (0.02, 0.02, 0.03, 1.0), roughness=0.08, coat_weight=1.0)
    mat_hair = bio.make_pbr_material("Athlete_Hair", (0.08, 0.055, 0.042, 1.0), roughness=0.72)
    mat_shoe_upper = bio.make_pbr_material("Sneaker_Upper_Mesh", (0.10, 0.14, 0.22, 1.0), roughness=0.68)
    mat_shoe_sole = bio.make_pbr_material("Sneaker_Foam_Midsole", (0.92, 0.94, 0.96, 1.0), roughness=0.46)
    mat_shoe_accent = bio.make_pbr_material("Sneaker_Cyan_Trim", (0.08, 0.72, 0.92, 1.0), roughness=0.35)

    head_bone = rig_obj.data.bones['head']
    h_base = head_bone.head_local
    l_eye = (eye_centers or {}).get('helper-l-eye', Vector((0.0315, -0.098, h_base.z + 0.068)))
    r_eye = (eye_centers or {}).get('helper-r-eye', Vector((-0.0315, -0.098, h_base.z + 0.068)))

    # Eyeballs centered precisely in MPFB2 orbital sockets
    bm_eye = bmesh.new()
    for ec in (l_eye, r_eye):
        bio.add_uv_sphere_to_bm(bm_eye, ec, (0.0135, 0.0135, 0.0135), u_seg=14, v_seg=10)
    eye_obj = bio.finish_bmesh_object("Athlete_Eyes_Sclera", bm_eye, mat_sclera, collection=col)
    bind_rigid_mesh_to_bone(eye_obj, rig_obj, 'head')

    bm_iris = bmesh.new()
    for ec in (l_eye, r_eye):
        bio.add_uv_sphere_to_bm(bm_iris, ec + Vector((0.0, -0.0112, 0.0)), (0.0062, 0.0036, 0.0062), u_seg=12, v_seg=8)
    iris_obj = bio.finish_bmesh_object("Athlete_Eyes_Iris", bm_iris, mat_iris, collection=col)
    bind_rigid_mesh_to_bone(iris_obj, rig_obj, 'head')

    bm_pup = bmesh.new()
    for ec in (l_eye, r_eye):
        bio.add_uv_sphere_to_bm(bm_pup, ec + Vector((0.0, -0.0138, 0.0)), (0.0030, 0.0020, 0.0030), u_seg=10, v_seg=6)
    pup_obj = bio.finish_bmesh_object("Athlete_Eyes_Pupil", bm_pup, mat_pupil, collection=col)
    bind_rigid_mesh_to_bone(pup_obj, rig_obj, 'head')

    # Short sculpted athletic hair cap extracted directly from MPFB2 cranium above natural hairline
    eye_z = 0.5 * (l_eye.z + r_eye.z)
    eye_y = 0.5 * (l_eye.y + r_eye.y)

    hair_obj = skin_obj.copy()
    hair_obj.data = skin_obj.data.copy()
    hair_obj.name = "Athlete_Hair_Cap"
    hair_obj.modifiers.clear()
    bio.link_obj(hair_obj, col)

    me_h = hair_obj.data
    bm_hair = bmesh.new()
    bm_hair.from_mesh(me_h)
    bm_hair.verts.ensure_lookup_table()
    bm_hair.faces.ensure_lookup_table()

    del_faces = []
    for f in bm_hair.faces:
        c = f.calc_center_median()
        if abs(c.x) > 0.068 and c.z < eye_z + 0.028:
            del_faces.append(f)
            continue
        if c.y < eye_y + 0.045:
            z_cut = eye_z + 0.044 - 0.14 * max(0.0, abs(c.x) - 0.032)
        else:
            z_cut = eye_z - 0.036 + 0.03 * max(0.0, 0.075 - (c.y - eye_y))
        if c.z < z_cut:
            del_faces.append(f)
    if del_faces:
        bmesh.ops.delete(bm_hair, geom=del_faces, context='FACES')

    bm_hair.normal_update()
    b_edges_h = [e for e in bm_hair.edges if e.is_boundary]
    b_verts_h = list({v for e in b_edges_h for v in e.verts})
    if b_verts_h:
        for _ in range(4):
            bmesh.ops.smooth_vert(bm_hair, verts=b_verts_h, factor=0.65, use_axis_x=True, use_axis_y=True, use_axis_z=True)

    bm_hair.normal_update()
    for v in bm_hair.verts:
        offset = (
            0.0035
            + 0.0095 * max(0.0, v.normal.z)
            + 0.0012 * math.sin(v.co.x * 110.0) * math.cos(v.co.y * 90.0)
        )
        v.co += v.normal * offset
    bm_hair.to_mesh(me_h)
    bm_hair.free()

    me_h.materials.clear()
    me_h.materials.append(mat_hair)
    for p in me_h.polygons:
        p.use_smooth = True
    bind_rigid_mesh_to_bone(hair_obj, rig_obj, 'head')

    mat_brow = bio.make_pbr_material("Athlete_Eyebrows", (0.05, 0.035, 0.025, 1.0), roughness=0.72)

    # Eyebrows nested cleanly along superciliary arches relative to exact MPFB2 orbital coordinates
    bm_brow = bmesh.new()
    for sx in (-1.0, 1.0):
        bio.add_tube_along_points(
            bm_brow,
            [
                (sx * 0.015, eye_y - 0.015, eye_z + 0.017),
                (sx * 0.033, eye_y - 0.013, eye_z + 0.020),
                (sx * 0.052, eye_y - 0.003, eye_z + 0.015),
            ],
            [0.0038, 0.0040, 0.0024],
            rings=6,
        )
    brow_obj = bio.finish_bmesh_object("Athlete_Eyebrows", bm_brow, mat_brow, collection=col)
    bind_rigid_mesh_to_bone(brow_obj, rig_obj, 'head')

    # Detailed sculpted Running Sneakers enclosing ankle collar (skin trimmed cleanly below z=0.058m)
    for side, foot_bone_name in (("L", "foot_l"), ("R", "foot_r")):
        fb = rig_obj.data.bones[foot_bone_name]
        fx = fb.head_local.x
        bm_sole = bmesh.new()
        sole_pts = [
            ((fx, 0.042, -0.018), 0.046, 0.019, 0.0),
            ((fx, -0.03, -0.018), 0.047, 0.018, 0.0),
            ((fx, -0.14, -0.017), 0.053, 0.016, 0.0),
            ((fx, -0.242, -0.012), 0.040, 0.013, 0.0),
        ]
        bio.add_lofted_profile_to_bm(bm_sole, sole_pts, rings=20, dome_factor=0.35)
        sole_obj = bio.finish_bmesh_object(f"Sneaker_Sole_{side}", bm_sole, mat_shoe_sole, collection=col)
        bind_rigid_mesh_to_bone(sole_obj, rig_obj, foot_bone_name)

        bm_up = bmesh.new()
        up_pts = [
            ((fx, 0.025, 0.072), 0.046, 0.044, 0.0),
            ((fx, -0.015, 0.068), 0.050, 0.050, 0.0),
            ((fx, -0.090, 0.036), 0.050, 0.044, 0.0),
            ((fx, -0.175, 0.018), 0.050, 0.032, 0.0),
            ((fx, -0.238, 0.008), 0.038, 0.020, 0.0),
        ]
        bio.add_lofted_profile_to_bm(bm_up, up_pts, rings=20, dome_factor=0.45)
        up_obj = bio.finish_bmesh_object(f"Sneaker_Upper_{side}", bm_up, mat_shoe_upper, collection=col)
        bind_rigid_mesh_to_bone(up_obj, rig_obj, foot_bone_name)

        bm_acc = bmesh.new()
        bio.add_tube_along_points(bm_acc, [(fx - 0.043, 0.03, 0.018), (fx - 0.048, -0.09, 0.012), (fx - 0.044, -0.20, 0.002)], 0.005, rings=8)
        bio.add_tube_along_points(bm_acc, [(fx + 0.043, 0.03, 0.018), (fx + 0.048, -0.09, 0.012), (fx + 0.044, -0.20, 0.002)], 0.005, rings=8)
        # Athletic laces along dorsal instep
        for li in range(3):
            ly = -0.075 - li * 0.028
            lz = 0.066 - li * 0.014
            bio.add_tube_along_points(bm_acc, [(fx - 0.022, ly, lz), (fx + 0.022, ly - 0.01, lz - 0.003)], 0.004, rings=6)
        acc_obj = bio.finish_bmesh_object(f"Sneaker_Accent_{side}", bm_acc, mat_shoe_accent, collection=col)
        bind_rigid_mesh_to_bone(acc_obj, rig_obj, foot_bone_name)


def build_internal_skeleton_and_organs(rig_obj, col):
    """
    Recessed skeleton, HuBMAP Heart/Lungs, Vascular and Nervous trees parented cleanly
    to MPFB2 `game_engine` bones so every internal layer moves with the running athlete!
    """
    mat_bone = bio.make_pbr_material("Layer_Bone_Mat", (0.86, 0.83, 0.76, 1.0), roughness=0.45)
    mat_heart = bio.make_pbr_material("Layer_Heart_Mat", (0.76, 0.09, 0.16, 1.0), roughness=0.25, coat_weight=0.55, emission_color=(0.75, 0.1, 0.15, 1.0), emission_strength=0.25)
    mat_lung = bio.make_pbr_material("Layer_Lung_Mat", (0.86, 0.44, 0.54, 1.0), roughness=0.42, alpha=0.82)
    mat_vasc = bio.make_pbr_material("Layer_Vascular_Mat", (0.88, 0.14, 0.22, 1.0), roughness=0.25, emission_color=(0.90, 0.16, 0.22, 1.0), emission_strength=0.45)
    mat_nerve = bio.make_pbr_material("Layer_Nerve_Mat", (0.18, 0.86, 0.98, 1.0), roughness=0.22, emission_color=(0.22, 0.90, 1.0, 1.0), emission_strength=0.95)

    def parent_to_bone(obj, bname):
        bind_rigid_mesh_to_bone(obj, rig_obj, bname)

    # Pelvis + Recessed Ribcage + Vertebrae
    bm_pel = bmesh.new()
    bio.add_uv_sphere_to_bm(bm_pel, (0.0, 0.0, 0.96), (0.115, 0.068, 0.072), u_seg=14, v_seg=10)
    pel_obj = bio.finish_bmesh_object("Layer_Thoracic_Pelvis", bm_pel, mat_bone, collection=col)
    parent_to_bone(pel_obj, 'pelvis')

    bm_rib = bmesh.new()
    sp3 = rig_obj.data.bones['spine_03']
    # Thoracic spine column
    for i in range(9):
        zv = 1.08 + i * 0.036
        bio.add_uv_sphere_to_bm(bm_rib, (0.0, 0.055, zv), (0.018, 0.020, 0.014), u_seg=8, v_seg=6)
    # Recessed ribcage (safely inside skin bounds!)
    for r_idx in range(7):
        rz = 1.15 + r_idx * 0.034
        rx = 0.095 + math.sin((r_idx / 6.0) * math.pi) * 0.025
        ry = 0.062 + math.sin((r_idx / 6.0) * math.pi) * 0.018
        pts = [(math.sin(-0.78 * math.pi + (k / 14.0) * 1.56 * math.pi) * rx, -0.01 + math.cos(-0.78 * math.pi + (k / 14.0) * 1.56 * math.pi) * ry, rz) for k in range(15)]
        bio.add_tube_along_points(bm_rib, pts, 0.0075, rings=6)
    rib_obj = bio.finish_bmesh_object("Layer_Thoracic_Ribcage", bm_rib, mat_bone, collection=col)
    parent_to_bone(rib_obj, 'spine_02')

    # Leg Bones (femur + tibia recessed inside thigh & calf!)
    for side, tb, cb in (("L", "thigh_l", "calf_l"), ("R", "thigh_r", "calf_r")):
        b_th = rig_obj.data.bones[tb]
        bm_f = bmesh.new()
        bio.add_tube_along_points(bm_f, [b_th.head_local, b_th.tail_local], [0.022, 0.018], rings=10)
        f_obj = bio.finish_bmesh_object(f"Layer_Thoracic_Femur_{side}", bm_f, mat_bone, collection=col)
        parent_to_bone(f_obj, tb)

        b_ca = rig_obj.data.bones[cb]
        bm_t = bmesh.new()
        bio.add_tube_along_points(bm_t, [b_ca.head_local, b_ca.tail_local], [0.017, 0.013], rings=10)
        t_obj = bio.finish_bmesh_object(f"Layer_Thoracic_Tibia_{side}", bm_t, mat_bone, collection=col)
        parent_to_bone(t_obj, cb)

    # Heart Proxy in left mediastinum
    bm_h = bmesh.new()
    bio.add_uv_sphere_to_bm(bm_h, (0.020, -0.025, 1.245), (0.042, 0.038, 0.052), u_seg=14, v_seg=10, rot_euler=(0.15, 0.2, 0.0))
    heart_obj = bio.finish_bmesh_object("Layer_Heart_Proxy", bm_h, mat_heart, collection=col)
    parent_to_bone(heart_obj, 'spine_03')

    # Lungs Proxy inside ribcage
    bm_l = bmesh.new()
    for sx in (-1.0, 1.0):
        bio.add_uv_sphere_to_bm(bm_l, (sx * 0.058, 0.005, 1.265), (0.042, 0.048, 0.088), u_seg=12, v_seg=10)
    lung_obj = bio.finish_bmesh_object("Layer_Lungs_Proxy", bm_l, mat_lung, collection=col)
    parent_to_bone(lung_obj, 'spine_02')

    # Vascular arterial trunk + femoral arteries down thighs
    bm_v = bmesh.new()
    bio.add_tube_along_points(bm_v, [(0.015, -0.02, 1.29), (0.0, 0.015, 1.32), (0.0, 0.02, 1.02)], [0.012, 0.011, 0.009], rings=8)
    v_torso = bio.finish_bmesh_object("Layer_Vascular_Aorta", bm_v, mat_vasc, collection=col)
    parent_to_bone(v_torso, 'spine_02')

    for side, tb, cb in (("L", "thigh_l", "calf_l"), ("R", "thigh_r", "calf_r")):
        b_th = rig_obj.data.bones[tb]
        sx = 1.0 if side == "L" else -1.0
        bm_vt = bmesh.new()
        p0 = b_th.head_local + Vector((-sx * 0.025, -0.02, 0.0))
        p1 = b_th.tail_local + Vector((-sx * 0.015, 0.01, 0.0))
        bio.add_tube_along_points(bm_vt, [p0, (p0 + p1) * 0.5, p1], 0.0065, rings=7)
        vt_obj = bio.finish_bmesh_object(f"Layer_Vascular_Femoral_{side}", bm_vt, mat_vasc, collection=col)
        parent_to_bone(vt_obj, tb)

    # Nervous System: Brain + Spinal Cord + Sciatic/Femoral tracts
    bm_nh = bmesh.new()
    hb = rig_obj.data.bones['head']
    bio.add_uv_sphere_to_bm(bm_nh, (0.0, -0.015, hb.head_local.z + 0.095), (0.056, 0.068, 0.052), u_seg=14, v_seg=10)
    nh_obj = bio.finish_bmesh_object("Layer_Nervous_Brain", bm_nh, mat_nerve, collection=col)
    parent_to_bone(nh_obj, 'head')

    bm_ns = bmesh.new()
    bio.add_tube_along_points(bm_ns, [(0.0, 0.048, 1.54), (0.0, 0.055, 1.25), (0.0, 0.052, 0.98)], 0.0075, rings=8)
    ns_obj = bio.finish_bmesh_object("Layer_Nervous_Spine", bm_ns, mat_nerve, collection=col)
    parent_to_bone(ns_obj, 'spine_02')


def add_torso_breath_and_effort_shape_keys(mesh_obj):
    """Adds Shape Keys `Breath_Expand` and `Effort_Face` directly onto `mesh_obj`."""
    mesh_obj.shape_key_add(name="Basis")
    sk_breath = mesh_obj.shape_key_add(name="Breath_Expand")
    sk_effort = mesh_obj.shape_key_add(name="Effort_Face")

    for i, v in enumerate(mesh_obj.data.vertices):
        co = v.co
        no = v.normal
        # Ribcage/chest expansion (z in 1.12..1.44, primarily anterior -Y and lateral +-X)
        if 1.10 < co.z < 1.46 and abs(co.x) < 0.19:
            w_z = math.sin(((co.z - 1.10) / 0.36) * math.pi)
            w_front = max(0.15, -no.y * 0.9 + 0.35)
            sk_breath.data[i].co = co + no * (0.013 * w_z * w_front)
        else:
            sk_breath.data[i].co = co.copy()

        # Subtle facial effort (jaw lower slightly, brow focus)
        if co.z > 1.54 and co.y < -0.06:
            if 1.55 < co.z < 1.62 and abs(co.x) < 0.05:
                sk_effort.data[i].co = co + Vector((0.0, -0.002, -0.0045))
            elif co.z > 1.655 and abs(co.x) < 0.04:
                sk_effort.data[i].co = co + Vector((-0.0015 if co.x > 0 else 0.0015, -0.002, -0.002))
            else:
                sk_effort.data[i].co = co.copy()
        else:
            sk_effort.data[i].co = co.copy()


def create_gait_action(rig_obj, action_name: str, num_frames: int, params: dict):
    """
    Authors a smooth cyclic biomechanical gait Action on `rig_obj` armature.
    Zero knee hyperextension, natural pelvic yaw & vertical COM wave, counter-rotating thorax,
    natural A-pose-to-running-arm adduction, ankle heel-strike & push-off plantarflexion!
    """
    act = bpy.data.actions.new(name=action_name)
    if not rig_obj.animation_data:
        rig_obj.animation_data_create()
    rig_obj.animation_data.action = act

    # Put armature in POSE mode
    bpy.context.view_layer.objects.active = rig_obj
    pelvis_pb = rig_obj.pose.bones['pelvis']
    pelvis_rest_loc = Vector((0.0, 0.0, 0.0))

    thigh_amp = params['thigh_amp']
    thigh_bias = params['thigh_bias']
    knee_base = params['knee_base']
    knee_amp = params['knee_amp']
    ankle_amp = params['ankle_amp']
    arm_amp = params['arm_amp']
    elbow_bend = params['elbow_bend']
    trunk_lean = params['trunk_lean']
    bounce_amp = params['bounce_amp']
    base_drop = params['base_drop']

    step = 2
    for f in range(0, num_frames + 1, step):
        u = (f % num_frames) / float(num_frames)
        phi = u * math.pi * 2.0
        bpy.context.scene.frame_set(f)

        # Two steps per cycle (Left stance/swing, Right shifted by pi)
        # Double-frequency COM bounce: highest during flight (phi ~ pi/2, 3pi/2), lowest midstance
        bounce = -base_drop + math.cos(phi * 2.0 + math.pi) * bounce_amp
        pelvis_pb.location = Vector((0.0, bounce, 0.0))  # pelvis Y-axis points roughly UP!
        pelvis_pb.keyframe_insert(data_path='location', frame=f)

        # Pelvis yaw/roll
        rotate_pose_bone_armature(
            pelvis_pb,
            0.03 + trunk_lean * 0.25,
            math.sin(phi) * 0.035,
            math.cos(phi) * 0.065 * (0.4 + thigh_amp),
        )
        pelvis_pb.keyframe_insert(data_path='rotation_quaternion', frame=f)

        # Counter-rotating spine & head stabilization
        rotate_pose_bone_armature(rig_obj.pose.bones['spine_01'], trunk_lean * 0.35, 0.0, -math.cos(phi) * 0.04)
        rotate_pose_bone_armature(rig_obj.pose.bones['spine_02'], trunk_lean * 0.35, 0.0, -math.cos(phi) * 0.05)
        rotate_pose_bone_armature(rig_obj.pose.bones['spine_03'], trunk_lean * 0.25, 0.0, -math.cos(phi) * 0.06)
        rotate_pose_bone_armature(rig_obj.pose.bones['neck_01'], -trunk_lean * 0.45, 0.0, math.cos(phi) * 0.03)
        rotate_pose_bone_armature(rig_obj.pose.bones['head'], -trunk_lean * 0.35, 0.0, math.cos(phi) * 0.02)

        for bn in ('spine_01', 'spine_02', 'spine_03', 'neck_01', 'head'):
            rig_obj.pose.bones[bn].keyframe_insert(data_path='rotation_quaternion', frame=f)

        # Legs (L phase = phi, R phase = phi + pi)
        for side_suffix, ph in (('l', phi), ('r', phi + math.pi)):
            # sin(ph) > 0 => swing forward (-ax) to push back (+ax) smoothly
            thigh_ax = thigh_bias - math.sin(ph) * thigh_amp
            # Knee bend peaks during swing recovery (when cos(ph) < 0) and cushions slightly on landing
            swing_lift = max(0.0, math.sin(ph + 1.15))
            stance_cushion = max(0.0, math.sin(ph + 0.15)) * 0.22
            knee_ax = knee_base + swing_lift * knee_amp + stance_cushion
            # Foot dorsiflexes before heel-strike and plantarflexes on push-off!
            foot_ax = -0.08 + math.cos(ph - 0.35) * ankle_amp
            ball_ax = max(0.0, math.sin(ph - 1.2)) * 0.28

            rotate_pose_bone_armature(rig_obj.pose.bones[f'thigh_{side_suffix}'], thigh_ax, 0.0, 0.0)
            rotate_pose_bone_armature(rig_obj.pose.bones[f'calf_{side_suffix}'], knee_ax, 0.0, 0.0)
            rotate_pose_bone_armature(rig_obj.pose.bones[f'foot_{side_suffix}'], foot_ax, 0.0, 0.0)
            rotate_pose_bone_armature(rig_obj.pose.bones[f'ball_{side_suffix}'], -ball_ax, 0.0, 0.0)

            for part in ('thigh', 'calf', 'foot', 'ball'):
                rig_obj.pose.bones[f'{part}_{side_suffix}'].keyframe_insert(data_path='rotation_quaternion', frame=f)

        # Arms counter-swinging! Plus permanent A-pose adduction toward torso!
        for side_suffix, sign_x, ph in (('l', 1.0, phi + math.pi), ('r', -1.0, phi)):
            shoulder_swing_ax = -math.sin(ph) * arm_amp + 0.06
            adduct_ay = sign_x * 0.56  # brings arms cleanly down beside ribcage!
            yaw_az = -sign_x * 0.12
            rotate_pose_bone_armature(rig_obj.pose.bones[f'clavicle_{side_suffix}'], 0.0, sign_x * 0.05, 0.0)
            rotate_pose_bone_armature(rig_obj.pose.bones[f'upperarm_{side_suffix}'], shoulder_swing_ax, adduct_ay, yaw_az)
            elbow_ax = -elbow_bend - max(0.0, math.sin(ph)) * 0.22
            rotate_pose_bone_armature(rig_obj.pose.bones[f'lowerarm_{side_suffix}'], elbow_ax, 0.0, -sign_x * 0.10)
            # Relaxed curled athletic fingers
            rotate_pose_bone_armature(rig_obj.pose.bones[f'hand_{side_suffix}'], 0.0, 0.0, 0.0)
            for part in ('clavicle', 'upperarm', 'lowerarm', 'hand'):
                rig_obj.pose.bones[f'{part}_{side_suffix}'].keyframe_insert(data_path='rotation_quaternion', frame=f)

        # Slight curl of fingers into natural runner grip
        for side_suffix, sign_x in (('l', 1.0), ('r', -1.0)):
            for fbone in ('index_01', 'middle_01', 'ring_01', 'pinky_01'):
                pb = rig_obj.pose.bones.get(f'{fbone}_{side_suffix}')
                if pb:
                    rotate_pose_bone_armature(pb, -0.35, sign_x * 0.35, 0.0)
                    pb.keyframe_insert(data_path='rotation_quaternion', frame=f)

    # Push Action into NLA Track so glTF exporter cleanly exports ALL 6 named clips!
    track = rig_obj.animation_data.nla_tracks.new()
    track.name = action_name
    strip = track.strips.new(action_name, 0, act)
    strip.name = action_name
    rig_obj.animation_data.action = None
    return act


def build_gym_and_treadmill(root, col):
    mat_floor = bio.make_pbr_material("Gym_Rubber_Floor", (0.042, 0.048, 0.062, 1.0), roughness=0.72)
    mat_wall = bio.make_pbr_material("Gym_Concrete_Wall", (0.10, 0.12, 0.16, 1.0), roughness=0.82)
    mat_wood = bio.make_pbr_material("Gym_Wood_Slat", (0.26, 0.16, 0.10, 1.0), roughness=0.58)
    mat_metal = bio.make_pbr_material("Treadmill_Anodized_Metal", (0.14, 0.16, 0.21, 1.0), roughness=0.28, metallic=0.82)
    mat_chrome = bio.make_pbr_material("Gym_Brushed_Steel", (0.72, 0.75, 0.80, 1.0), roughness=0.22, metallic=0.92)
    mat_belt = bio.make_pbr_material("Treadmill_Belt_Surface", (0.025, 0.030, 0.038, 1.0), roughness=0.84)
    mat_accent = bio.make_pbr_material("Gym_Cyan_Accent", (0.08, 0.72, 0.92, 1.0), roughness=0.2, emission_color=(0.12, 0.82, 1.0, 1.0), emission_strength=1.8)
    mat_window = bio.make_pbr_material("Gym_Daylight_Window", (0.98, 0.94, 0.86, 1.0), roughness=0.1, emission_color=(1.0, 0.94, 0.82, 1.0), emission_strength=2.4)
    mat_shaft = bio.make_pbr_material("Gym_Light_Shaft", (1.0, 0.94, 0.80, 1.0), roughness=0.9, alpha=0.06, emission_color=(1.0, 0.92, 0.78, 1.0), emission_strength=0.65)
    mat_plant = bio.make_pbr_material("Gym_Plant_Leaf", (0.10, 0.28, 0.14, 1.0), roughness=0.52)
    mat_screen = bio.make_pbr_material("Treadmill_Console_Display", (0.02, 0.09, 0.15, 1.0), roughness=0.14, emission_color=(0.08, 0.56, 0.84, 1.0), emission_strength=1.5)

    # 1. Floor + Raised Mat under Treadmill
    bm_fl = bmesh.new()
    bio.add_box_to_bm(bm_fl, (0.0, 0.0, -0.05), (5.0, 5.2, 0.05))
    bio.add_box_to_bm(bm_fl, (0.0, 0.0, 0.015), (0.92, 1.42, 0.015))
    bio.finish_bmesh_object("Gym_Floor", bm_fl, mat_floor, parent=root, collection=col, smooth=False)

    # 2. Architectural Room Envelope, Wood Slats & Tall Sunlit Windows on +X
    bm_wall = bmesh.new()
    bio.add_box_to_bm(bm_wall, (0.0, -3.6, 1.8), (5.0, 0.10, 1.85))  # rear wall
    bio.add_box_to_bm(bm_wall, (-4.0, 0.2, 1.8), (0.10, 4.4, 1.85))  # -X wall
    # +X window mullions & wall header/sill
    bio.add_box_to_bm(bm_wall, (3.9, 0.2, 0.22), (0.12, 4.4, 0.22))
    bio.add_box_to_bm(bm_wall, (3.9, 0.2, 3.45), (0.12, 4.4, 0.22))
    for wy in (-2.6, -1.2, 0.2, 1.6, 3.0):
        bio.add_box_to_bm(bm_wall, (3.88, wy, 1.85), (0.09, 0.07, 1.50))
    bio.finish_bmesh_object("Gym_Walls", bm_wall, mat_wall, parent=root, collection=col, smooth=False)

    bm_win = bmesh.new()
    for wy in (-1.9, -0.5, 0.9, 2.3):
        bio.add_box_to_bm(bm_win, (3.96, wy, 1.85), (0.02, 0.62, 1.42))
    bio.finish_bmesh_object("Gym_Sunlit_Windows", bm_win, mat_window, parent=root, collection=col, smooth=False)

    bm_wood = bmesh.new()
    for i in range(18):
        wx = -2.2 + i * 0.26
        bio.add_box_to_bm(bm_wood, (wx, -3.48, 1.75), (0.04, 0.03, 1.65))
    bio.finish_bmesh_object("Gym_Wood_Accents", bm_wood, mat_wood, parent=root, collection=col, smooth=False)

    # 3. Studio Equipment (Dumbbell Rack, Kettlebells, Bench, Barbell Stand, Corner Plant)
    bm_eq = bmesh.new()
    # Dumbbell rack at (-2.3, -2.2)
    bio.add_box_to_bm(bm_eq, (-2.3, -2.2, 0.42), (0.75, 0.24, 0.40))
    bio.add_box_to_bm(bm_eq, (2.3, -2.4, 0.24), (0.28, 0.65, 0.22))  # weight bench
    bio.add_box_to_bm(bm_eq, (2.3, -2.9, 0.55), (0.24, 0.14, 0.35), rot_euler=(0.35, 0, 0))
    # Barbell squat stand at (-2.6, 0.4)
    bio.add_box_to_bm(bm_eq, (-2.7, -0.35, 0.92), (0.05, 0.05, 0.92))
    bio.add_box_to_bm(bm_eq, (-2.7, 0.85, 0.92), (0.05, 0.05, 0.92))
    # Corner planter pot near sunlit window
    bio.add_uv_sphere_to_bm(bm_eq, (3.2, -2.6, 0.22), (0.22, 0.22, 0.24), u_seg=12, v_seg=8)
    bio.finish_bmesh_object("Gym_Architecture", bm_eq, mat_metal, parent=root, collection=col, smooth=True)

    bm_ch = bmesh.new()
    # Dumbbell heads & barbell bar + plates
    for i in range(5):
        dx = -2.75 + i * 0.22
        bio.add_uv_sphere_to_bm(bm_ch, (dx, -2.14, 0.86), (0.055, 0.055, 0.055), u_seg=10, v_seg=8)
        bio.add_uv_sphere_to_bm(bm_ch, (dx, -2.28, 0.86), (0.055, 0.055, 0.055), u_seg=10, v_seg=8)
    bio.add_tube_along_points(bm_ch, [(-2.65, -0.55, 1.38), (-2.65, 1.05, 1.38)], 0.018, rings=10)
    for py in (-0.48, 0.98):
        bio.add_uv_sphere_to_bm(bm_ch, (-2.65, py, 1.38), (0.21, 0.032, 0.21), u_seg=14, v_seg=8)
    bio.finish_bmesh_object("Gym_Chrome_Weights", bm_ch, mat_chrome, parent=root, collection=col, smooth=True)

    bm_pl = bmesh.new()
    for a_i in range(7):
        ang = (a_i / 7.0) * math.pi * 2.0
        bio.add_uv_sphere_to_bm(bm_pl, (3.2 + math.cos(ang) * 0.18, -2.6 + math.sin(ang) * 0.18, 0.72 + (a_i % 3) * 0.12), (0.12, 0.22, 0.04), u_seg=8, v_seg=6, rot_euler=(0.4, 0.2, ang))
    bio.finish_bmesh_object("Gym_Planter_Leaves", bm_pl, mat_plant, parent=root, collection=col, smooth=True)

    bm_glow = bmesh.new()
    bio.add_box_to_bm(bm_glow, (-0.94, 0.0, 0.025), (0.016, 1.42, 0.008))
    bio.add_box_to_bm(bm_glow, (0.94, 0.0, 0.025), (0.016, 1.42, 0.008))
    bio.finish_bmesh_object("Gym_Light_Strips", bm_glow, mat_accent, parent=root, collection=col, smooth=False)

    # 4. Commercial Treadmill (facing +Y forward; belt surface Z = DECK_Z = 0.145m)
    bm_tm = bmesh.new()
    bio.add_box_to_bm(bm_tm, (-0.43, 0.0, 0.10), (0.055, 1.08, 0.06))
    bio.add_box_to_bm(bm_tm, (0.43, 0.0, 0.10), (0.055, 1.08, 0.06))
    bio.add_box_to_bm(bm_tm, (0.0, 0.96, 0.16), (0.47, 0.22, 0.12))
    bio.add_box_to_bm(bm_tm, (0.0, -1.06, 0.10), (0.47, 0.055, 0.055))
    bio.add_tube_along_points(bm_tm, [(-0.43, 0.86, 0.14), (-0.43, 0.74, 1.18)], [0.038, 0.032], rings=12)
    bio.add_tube_along_points(bm_tm, [(0.43, 0.86, 0.14), (0.43, 0.74, 1.18)], [0.038, 0.032], rings=12)
    bio.add_tube_along_points(bm_tm, [(-0.43, 0.74, 1.15), (-0.43, 0.50, 1.02), (-0.43, 0.25, 0.96)], [0.025, 0.024, 0.022], rings=10)
    bio.add_tube_along_points(bm_tm, [(0.43, 0.74, 1.15), (0.43, 0.50, 1.02), (0.43, 0.25, 0.96)], [0.025, 0.024, 0.022], rings=10)
    bio.add_box_to_bm(bm_tm, (0.0, 0.75, 1.24), (0.44, 0.10, 0.16), rot_euler=(-0.55, 0.0, 0.0))
    bio.finish_bmesh_object("Treadmill_Frame", bm_tm, mat_metal, parent=root, collection=col, smooth=True)

    bm_scr = bmesh.new()
    bio.add_box_to_bm(bm_scr, (0.0, 0.695, 1.265), (0.35, 0.012, 0.11), rot_euler=(-0.55, 0.0, 0.0))
    bio.finish_bmesh_object("Treadmill_Console_Screen", bm_scr, mat_screen, parent=root, collection=col, smooth=False)

    bm_belt = bmesh.new()
    bio.add_box_to_bm(bm_belt, (0.0, -0.05, 0.123), (0.36, 0.98, 0.018))
    bio.finish_bmesh_object("Treadmill_Deck", bm_belt, mat_belt, parent=root, collection=col, smooth=False)

    bm_slats = bmesh.new()
    for i in range(18):
        y_slat = -0.96 + i * 0.105
        bio.add_box_to_bm(bm_slats, (0.0, y_slat, 0.1415), (0.34, 0.012, 0.0018))
    bio.finish_bmesh_object("Treadmill_Belt_Slats", bm_slats, mat_floor, parent=root, collection=col, smooth=False)


def main():
    bio.clear_scene()
    col = bio.ensure_collection("BIOGENESIS_Gym_Rigged_Athlete")
    root = bio.create_empty("BIOGENESIS_Act01_Root", (0.0, 0.0, 0.0), collection=col)

    build_gym_and_treadmill(root, col)

    # 1. Create athletic MPFB2 adult human (facing -Y in MPFB2 local frame)
    bm_skin = HumanService.create_human(
        mask_helpers=True,
        detailed_helpers=True,
        extra_vertex_groups=True,
        feet_on_ground=True,
        scale=0.1,
        macro_detail_dict={
            'gender': 0.92,
            'age': 0.42,
            'muscle': 0.80,
            'weight': 0.43,
            'proportions': 0.55,
            'height': 0.64,
            'cupsize': 0.50,
            'firmness': 0.50,
            'race': {'asian': 0.12, 'caucasian': 0.78, 'african': 0.10},
        },
    )
    bm_skin.name = "Layer_Skin_Body"
    # Bake MPFB2 macrodetail shape keys cleanly into mesh vertices BEFORE rigging & mask cleanup
    bpy.context.view_layer.objects.active = bm_skin
    bm_skin.select_set(True)
    if bm_skin.data.shape_keys:
        bpy.ops.object.shape_key_remove(all=True, apply_mix=True)

    eye_centers = get_helper_eye_centers(bm_skin)
    rig_obj = HumanService.add_builtin_rig(bm_skin, 'game_engine', import_weights=True)
    rig_obj.name = "Athlete_Rig"

    # Apply Hide helpers mask cleanly right now (keeps bone vertex weights intact!)
    apply_hide_helpers_cleanly(bm_skin)

    # Place rig inside root, rotated Z=180 deg so athlete faces +Y (toward treadmill console)
    # and raise slightly so sneaker soles (bottom ~ -0.036m) rest cleanly on belt deck Z = 0.145m!
    rig_obj.parent = root
    rig_obj.location = Vector((0.0, -0.08, DECK_Z + 0.038))
    rig_obj.rotation_euler = (0.0, 0.0, math.pi)
    bpy.context.view_layer.update()
    for c in list(rig_obj.users_collection):
        c.objects.unlink(rig_obj)
    bio.link_obj(rig_obj, col)
    for c in list(bm_skin.users_collection):
        c.objects.unlink(bm_skin)
    bio.link_obj(bm_skin, col)

    mat_skin = bio.make_pbr_material("Bio_Skin_Shell", (0.76, 0.55, 0.46, 1.0), roughness=0.46, subsurface_weight=0.35)
    mat_singlet = bio.make_pbr_material("Athlete_Compression_Top", (0.07, 0.12, 0.20, 1.0), roughness=0.68)
    mat_shorts = bio.make_pbr_material("Athlete_Running_Shorts", (0.11, 0.16, 0.22, 1.0), roughness=0.62)
    mat_muscle = bio.make_pbr_material("Bio_Muscle_Striated", (0.72, 0.14, 0.16, 1.0), roughness=0.32, coat_weight=0.40, subsurface_weight=0.30)

    bm_skin.data.materials.clear()
    bm_skin.data.materials.append(mat_skin)
    for p in bm_skin.data.polygons:
        p.use_smooth = True
    bio.ensure_box_uv(bm_skin)
    add_torso_breath_and_effort_shape_keys(bm_skin)

    # Fitted athletic mock-neck short-sleeve compression top (clean horizontal base-of-neck seam!)
    singlet_obj = build_extracted_garment(
        bm_skin,
        "Layer_Skin_Singlet",
        lambda x, y: 0.985,
        lambda x, y: 1.505,
        0.0042,
        mat_singlet,
        rig_obj,
        col,
        limit_arms_x=0.295,
    )
    shorts_obj = build_extracted_garment(
        bm_skin,
        "Layer_Skin_Shorts",
        lambda x, y: 0.72,
        lambda x, y: 1.03,
        0.0048,
        mat_shorts,
        rig_obj,
        col,
        limit_arms_x=0.24,
    )
    add_torso_breath_and_effort_shape_keys(singlet_obj)

    # Fitted striated Muscle layer skinned to SAME rig
    build_muscular_cutaway_layer(bm_skin, rig_obj, mat_muscle, col)

    # Accessories (Exact socket Eyes, Eyebrows, Hair, Sneakers) + Internal Organs/Skeleton
    add_athlete_accessories(bm_skin, rig_obj, col, eye_centers=eye_centers)
    build_internal_skeleton_and_organs(rig_obj, col)

    # Author 6 Cyclic Skeletal Gait Actions pushed into NLA Tracks!
    GAITS = {
        "Idle_Prep": dict(thigh_amp=0.02, thigh_bias=0.0, knee_base=0.04, knee_amp=0.02, ankle_amp=0.02, arm_amp=0.03, elbow_bend=0.18, trunk_lean=0.02, bounce_amp=0.003, base_drop=0.0),
        "Walk": dict(thigh_amp=0.34, thigh_bias=0.02, knee_base=0.08, knee_amp=0.52, ankle_amp=0.18, arm_amp=0.28, elbow_bend=0.42, trunk_lean=0.04, bounce_amp=0.016, base_drop=0.015),
        "Jog": dict(thigh_amp=0.50, thigh_bias=0.08, knee_base=0.14, knee_amp=0.82, ankle_amp=0.24, arm_amp=0.48, elbow_bend=1.18, trunk_lean=0.09, bounce_amp=0.032, base_drop=0.035),
        "Run_Fast": dict(thigh_amp=0.66, thigh_bias=0.14, knee_base=0.16, knee_amp=1.08, ankle_amp=0.28, arm_amp=0.64, elbow_bend=1.32, trunk_lean=0.14, bounce_amp=0.045, base_drop=0.048),
        "HIIT_Sprint": dict(thigh_amp=0.84, thigh_bias=0.20, knee_base=0.18, knee_amp=1.28, ankle_amp=0.34, arm_amp=0.82, elbow_bend=1.42, trunk_lean=0.19, bounce_amp=0.056, base_drop=0.062),
        "Recovery_Walk": dict(thigh_amp=0.26, thigh_bias=0.03, knee_base=0.07, knee_amp=0.40, ankle_amp=0.14, arm_amp=0.20, elbow_bend=0.36, trunk_lean=0.05, bounce_amp=0.012, base_drop=0.012),
    }

    for act_name, g_params in GAITS.items():
        create_gait_action(rig_obj, act_name, num_frames=40, params=g_params)

    # Set clean mid-jog rest pose in viewport before export so static preview renders look heroic
    bpy.context.scene.frame_set(0)
    out_path = os.path.join(MODELS_DIR, "athlete_gym.glb")
    bio.export_hierarchy_glb(root, out_path, export_animations=True, apply_modifiers=False)


if __name__ == "__main__":
    main()
