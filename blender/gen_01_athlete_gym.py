"""
Generates public/models/athlete_gym.glb:
- Modern architectural gym booth + detailed motorized treadmill (belt, rollers, deck, handrails, console)
- Anatomically proportioned 1.78m adult human with hierarchical skeletal pivots for real-time kinematics
- Separate translucent/peelable anatomical layers:
  Layer_Skin_Shell, Layer_Muscular, Layer_Thoracic_Ribcage_Spine,
  Layer_Heart_Proxy, Layer_Lungs_Proxy, Layer_Vascular_Tree, Layer_Nervous_Tree
"""
import math
import os
import sys
import bpy
import bmesh
from mathutils import Vector

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

import lib_bio_mesh as bio


def build_gym_and_treadmill(root, col):
    mat_floor = bio.make_pbr_material("Gym_Rubber_Floor", (0.045, 0.052, 0.068, 1.0), roughness=0.72)
    mat_metal = bio.make_pbr_material("Treadmill_Anodized_Metal", (0.14, 0.16, 0.21, 1.0), roughness=0.28, metallic=0.82)
    mat_belt = bio.make_pbr_material("Treadmill_Belt_Surface", (0.03, 0.035, 0.045, 1.0), roughness=0.82)
    mat_accent = bio.make_pbr_material(
        "Gym_Cyan_Accent",
        (0.08, 0.72, 0.92, 1.0),
        roughness=0.2,
        emission_color=(0.12, 0.82, 1.0, 1.0),
        emission_strength=2.2,
    )
    mat_screen = bio.make_pbr_material(
        "Treadmill_Console_Display",
        (0.02, 0.08, 0.14, 1.0),
        roughness=0.15,
        emission_color=(0.06, 0.52, 0.78, 1.0),
        emission_strength=1.4,
    )

    # 1. Gym Architectural Deck & Ribbed Light Arches
    bm_floor = bmesh.new()
    bio.add_box_to_bm(bm_floor, (0.0, 0.0, -0.04), (3.8, 4.4, 0.04))
    # Subtle raised gym platform under treadmill
    bio.add_box_to_bm(bm_floor, (0.0, 0.0, 0.015), (0.88, 1.38, 0.015))
    bio.finish_bmesh_object("Gym_Floor", bm_floor, mat_floor, parent=root, collection=col, smooth=False)

    bm_arch = bmesh.new()
    for y_pos in (-1.4, 0.0, 1.4):
        # Left & right sleek pillars
        bio.add_box_to_bm(bm_arch, (-2.6, y_pos, 1.5), (0.08, 0.12, 1.5))
        bio.add_box_to_bm(bm_arch, (2.6, y_pos, 1.5), (0.08, 0.12, 1.5))
        bio.add_box_to_bm(bm_arch, (0.0, y_pos, 3.04), (2.68, 0.12, 0.06))
    # Weight rack silhouette in deep background (-2.2m, -2.5m)
    bio.add_box_to_bm(bm_arch, (-1.85, -2.6, 0.48), (0.55, 0.18, 0.45))
    bio.add_box_to_bm(bm_arch, (1.85, -2.6, 0.48), (0.55, 0.18, 0.45))
    bio.finish_bmesh_object("Gym_Architecture", bm_arch, mat_metal, parent=root, collection=col, smooth=False)

    # Architectural LED strips on floor & overhead
    bm_glow = bmesh.new()
    bio.add_box_to_bm(bm_glow, (-0.9, 0.0, 0.025), (0.018, 1.38, 0.008))
    bio.add_box_to_bm(bm_glow, (0.9, 0.0, 0.025), (0.018, 1.38, 0.008))
    for y_pos in (-1.4, 0.0, 1.4):
        bio.add_box_to_bm(bm_glow, (0.0, y_pos, 2.97), (2.1, 0.025, 0.012))
    bio.finish_bmesh_object("Gym_Light_Strips", bm_glow, mat_accent, parent=root, collection=col, smooth=False)

    # 2. Treadmill Frame, Handrails & Console (facing +Y forward)
    # Treadmill belt surface sits at Z = 0.13 m
    bm_tm = bmesh.new()
    # Side deck rails
    bio.add_box_to_bm(bm_tm, (-0.42, 0.0, 0.10), (0.055, 1.06, 0.06))
    bio.add_box_to_bm(bm_tm, (0.42, 0.0, 0.10), (0.055, 1.06, 0.06))
    # Motor hood at front (+Y)
    bio.add_box_to_bm(bm_tm, (0.0, 0.94, 0.16), (0.46, 0.22, 0.12))
    # Rear roller housing
    bio.add_box_to_bm(bm_tm, (0.0, -1.04, 0.10), (0.46, 0.05, 0.055))
    # Upright columns (angled forward)
    bio.add_tube_along_points(bm_tm, [(-0.42, 0.85, 0.14), (-0.42, 0.72, 1.18)], [0.038, 0.032], rings=12)
    bio.add_tube_along_points(bm_tm, [(0.42, 0.85, 0.14), (0.42, 0.72, 1.18)], [0.038, 0.032], rings=12)
    # Ergonomic side handrails
    bio.add_tube_along_points(bm_tm, [(-0.42, 0.72, 1.15), (-0.42, 0.50, 1.02), (-0.42, 0.28, 0.96)], [0.024, 0.024, 0.022], rings=10)
    bio.add_tube_along_points(bm_tm, [(0.42, 0.72, 1.15), (0.42, 0.50, 1.02), (0.42, 0.28, 0.96)], [0.024, 0.024, 0.022], rings=10)
    # Console shell
    bio.add_box_to_bm(bm_tm, (0.0, 0.73, 1.24), (0.44, 0.10, 0.16), rot_euler=(-0.55, 0.0, 0.0))
    bio.finish_bmesh_object("Treadmill_Frame", bm_tm, mat_metal, parent=root, collection=col, smooth=True)

    # Console glass display
    bm_scr = bmesh.new()
    bio.add_box_to_bm(bm_scr, (0.0, 0.675, 1.265), (0.35, 0.012, 0.11), rot_euler=(-0.55, 0.0, 0.0))
    bio.finish_bmesh_object("Treadmill_Console_Screen", bm_scr, mat_screen, parent=root, collection=col, smooth=False)

    # Treadmill belt deck + individual raised tread slats (animated via JS/shader)
    bm_belt = bmesh.new()
    bio.add_box_to_bm(bm_belt, (0.0, -0.05, 0.122), (0.34, 0.96, 0.018))
    bio.finish_bmesh_object("Treadmill_Deck", bm_belt, mat_belt, parent=root, collection=col, smooth=False)

    bm_slats = bmesh.new()
    for i in range(18):
        y_slat = -0.96 + i * 0.105
        bio.add_box_to_bm(bm_slats, (0.0, y_slat, 0.143), (0.32, 0.008, 0.004))
    bio.finish_bmesh_object("Treadmill_Belt_Slats", bm_slats, mat_metal, parent=root, collection=col, smooth=False)


def _create_limb_part(name, stations, mat, parent, col, rings=22, noise_amp=0.0, subsurf=1):
    bm = bmesh.new()
    bio.add_lofted_profile_to_bm(bm, stations, rings=rings, cap_ends=True, noise_amp=noise_amp, noise_freq=8.0, dome_factor=0.55)
    return bio.finish_bmesh_object(name, bm, mat, parent=parent, collection=col, smooth=True, subsurf_levels=subsurf)


def build_anatomical_athlete(root, col):
    """
    Human proportions (standing Z from deck Z=0.145m up to 1.925m -> 1.78m height).
    All joint pivots are placed in local anatomical coordinates so R3F rotations animate limbs naturally.
    """
    deck_z = 0.145

    mat_skin = bio.make_pbr_material(
        "Bio_Skin_Shell",
        (0.76, 0.56, 0.47, 1.0),
        roughness=0.52,
        alpha=1.0,
        subsurface_weight=0.35,
    )
    mat_muscle = bio.make_pbr_material(
        "Bio_Muscle_Tissue",
        (0.68, 0.14, 0.16, 1.0),
        roughness=0.38,
        coat_weight=0.35,
        subsurface_weight=0.25,
    )
    mat_bone = bio.make_pbr_material(
        "Bio_Bone_Scaffold",
        (0.86, 0.83, 0.76, 1.0),
        roughness=0.48,
    )
    mat_heart = bio.make_pbr_material(
        "Bio_Heart_Organ",
        (0.76, 0.09, 0.15, 1.0),
        roughness=0.28,
        coat_weight=0.5,
        emission_color=(0.8, 0.1, 0.15, 1.0),
        emission_strength=0.15,
    )
    mat_lung = bio.make_pbr_material(
        "Bio_Lungs_Organ",
        (0.84, 0.44, 0.52, 1.0),
        roughness=0.45,
        alpha=0.88,
        subsurface_weight=0.4,
    )
    mat_artery = bio.make_pbr_material(
        "Bio_Vascular_System",
        (0.85, 0.11, 0.18, 1.0),
        roughness=0.25,
        emission_color=(0.9, 0.16, 0.22, 1.0),
        emission_strength=0.6,
    )
    mat_nerve = bio.make_pbr_material(
        "Bio_Nervous_System",
        (0.18, 0.78, 0.96, 1.0),
        roughness=0.25,
        emission_color=(0.2, 0.85, 1.0, 1.0),
        emission_strength=1.5,
    )

    # Root & Pelvis at hip height (Z = deck_z + 0.93m)
    athlete_root = bio.create_empty("Athlete_Root", (0.0, 0.0, deck_z), parent=root, collection=col)
    pelvis = bio.create_empty("Pelvis_Pivot", (0.0, 0.0, 0.93), parent=athlete_root, collection=col)

    # Torso / Pelvis muscular + skin sculpted segments (relative to Pelvis_Pivot)
    pelvis_stations = [
        ((0.0, 0.0, -0.11), 0.155, 0.115, 0.0),
        ((0.0, 0.01, -0.02), 0.175, 0.130, 0.0),
        ((0.0, 0.0, 0.08), 0.162, 0.118, 0.0),
    ]
    _create_limb_part("Layer_Skin_Pelvis", pelvis_stations, mat_skin, pelvis, col, rings=22)
    _create_limb_part("Layer_Muscular_Pelvis", [(p, rx * 0.92, ry * 0.92, a) for p, rx, ry, a in pelvis_stations], mat_muscle, pelvis, col, rings=20, noise_amp=0.05)

    # Spine -> Ribcage / Chest Breath Pivot
    spine = bio.create_empty("Spine_Pivot", (0.0, 0.0, 0.08), parent=pelvis, collection=col)
    torso_stations = [
        ((0.0, 0.0, 0.00), 0.152, 0.112, 0.0),
        ((0.0, 0.01, 0.12), 0.156, 0.116, 0.0),  # waist / obliques
        ((0.0, 0.015, 0.26), 0.184, 0.136, 0.0), # lower ribcage / lats
        ((0.0, 0.02, 0.39), 0.206, 0.144, 0.0),  # pectoral & chest width
        ((0.0, 0.00, 0.48), 0.162, 0.112, 0.0),  # trapezius / upper chest
    ]
    _create_limb_part("Layer_Skin_Torso", torso_stations, mat_skin, spine, col, rings=24)

    chest_breath = bio.create_empty("Chest_Breath_Pivot", (0.0, 0.0, 0.25), parent=spine, collection=col)
    # Sculpted muscular chest & abdominal wall (relative to spine)
    chest_muscle_stations = [
        ((0.0, 0.0, -0.24), 0.140, 0.102, 0.0),
        ((0.0, 0.01, -0.10), 0.144, 0.106, 0.0),
        ((0.0, 0.015, 0.04), 0.172, 0.126, 0.0),
        ((0.0, 0.02, 0.16), 0.194, 0.134, 0.0),
        ((0.0, 0.0, 0.23), 0.150, 0.102, 0.0),
    ]
    _create_limb_part("Layer_Muscular_Torso", chest_muscle_stations, mat_muscle, chest_breath, col, rings=20, noise_amp=0.06)

    # Internal Thoracic Skeleton (Vertebrae + Curved Ribs nestled cleanly INSIDE thoracic cavity)
    bm_skel = bmesh.new()
    for vz in range(14):
        z_v = -0.22 + vz * 0.034
        bio.add_uv_sphere_to_bm(bm_skel, (0.0, -0.048, z_v), (0.018, 0.018, 0.014), u_seg=10, v_seg=8)
    for rib_i in range(7):
        rz = -0.02 + rib_i * 0.031
        rw = 0.102 + math.sin((rib_i / 6.0) * math.pi) * 0.020
        rd = 0.068 + math.sin((rib_i / 6.0) * math.pi) * 0.012
        for side in (-1.0, 1.0):
            pts = []
            for k in range(7):
                t = k / 6.0
                ang = -math.pi * 0.48 + t * math.pi * 0.92
                pts.append((side * math.cos(ang) * rw, math.sin(ang) * rd - 0.005, rz - t * 0.015))
            bio.add_tube_along_points(bm_skel, pts, 0.007, rings=7)
    # Sternum
    bio.add_box_to_bm(bm_skel, (0.0, 0.064, 0.085), (0.014, 0.008, 0.085))
    bio.finish_bmesh_object("Layer_Thoracic_Ribcage_Spine", bm_skel, mat_bone, parent=chest_breath, collection=col, smooth=True)

    # Internal Heart Proxy (slightly left, tilted anteriorly) & Bilateral Lungs Proxy
    bm_heart = bmesh.new()
    bio.add_uv_sphere_to_bm(bm_heart, (0.022, 0.028, 0.075), (0.046, 0.044, 0.058), u_seg=16, v_seg=12, rot_euler=(0.25, -0.35, 0.1))
    bio.add_tube_along_points(bm_heart, [(0.018, 0.028, 0.12), (0.01, 0.015, 0.165), (-0.01, -0.015, 0.175)], 0.013, rings=10)
    bio.finish_bmesh_object("Layer_Heart_Proxy", bm_heart, mat_heart, parent=chest_breath, collection=col, smooth=True)

    bm_lungs = bmesh.new()
    bio.add_uv_sphere_to_bm(bm_lungs, (-0.076, 0.005, 0.09), (0.058, 0.068, 0.105), u_seg=16, v_seg=12, rot_euler=(0.08, 0.12, 0.0))
    bio.add_uv_sphere_to_bm(bm_lungs, (0.078, 0.002, 0.095), (0.052, 0.064, 0.102), u_seg=16, v_seg=12, rot_euler=(0.08, -0.12, 0.0))
    bio.add_tube_along_points(bm_lungs, [(0.0, 0.008, 0.25), (0.0, 0.008, 0.16)], 0.012, rings=10)
    bio.finish_bmesh_object("Layer_Lungs_Proxy", bm_lungs, mat_lung, parent=chest_breath, collection=col, smooth=True)

    # Internal Vascular & Nervous System Trunks (Torso + Head + Limbs summary pathways)
    bm_vasc = bmesh.new()
    # Descending aorta + carotids + iliac split
    bio.add_tube_along_points(bm_vasc, [(0.01, 0.015, 0.16), (0.006, -0.025, 0.12), (0.004, -0.02, -0.22)], [0.012, 0.011, 0.009], rings=8)
    for side in (-1.0, 1.0):
        bio.add_tube_along_points(bm_vasc, [(side * 0.015, 0.015, 0.16), (side * 0.022, 0.012, 0.34)], 0.0065, rings=7)
        bio.add_tube_along_points(bm_vasc, [(0.0, -0.02, -0.22), (side * 0.085, 0.0, -0.26)], 0.0075, rings=7)
        bio.add_tube_along_points(bm_vasc, [(0.0, 0.01, 0.16), (side * 0.14, 0.0, 0.19)], 0.0065, rings=7)
    bio.finish_bmesh_object("Layer_Vascular_Torso", bm_vasc, mat_artery, parent=chest_breath, collection=col, smooth=True)

    bm_nerv = bmesh.new()
    # Spinal cord + brachial & sciatic plexus roots
    bio.add_tube_along_points(bm_nerv, [(0.0, -0.055, -0.23), (0.0, -0.055, 0.36)], 0.0085, rings=8)
    for side in (-1.0, 1.0):
        bio.add_tube_along_points(bm_nerv, [(0.0, -0.055, 0.19), (side * 0.14, -0.01, 0.19)], 0.0045, rings=6)
        bio.add_tube_along_points(bm_nerv, [(0.0, -0.055, -0.20), (side * 0.09, -0.02, -0.26)], 0.0055, rings=6)
    bio.finish_bmesh_object("Layer_Nervous_Torso", bm_nerv, mat_nerve, parent=chest_breath, collection=col, smooth=True)

    # Head & Neck (Head_Pivot at neck base Z = 0.49 above spine)
    head = bio.create_empty("Head_Pivot", (0.0, 0.0, 0.49), parent=spine, collection=col)
    head_stations = [
        ((0.0, -0.005, 0.00), 0.058, 0.056, 0.0),   # neck base
        ((0.0, 0.005, 0.08), 0.054, 0.054, 0.0),    # mid neck
        ((0.0, 0.025, 0.13), 0.068, 0.082, 0.0),    # jaw / chin
        ((0.0, 0.015, 0.19), 0.080, 0.098, 0.0),    # cheekbones / nose level
        ((0.0, 0.005, 0.25), 0.082, 0.102, 0.0),    # cranium
        ((0.0, -0.005, 0.305), 0.058, 0.072, 0.0),  # crown
    ]
    _create_limb_part("Layer_Skin_Head", head_stations, mat_skin, head, col, rings=20)
    # Translucent cranial nervous brain proxy inside head (nestled strictly inside cranium & neck center)
    bm_brain_proxy = bmesh.new()
    bio.add_uv_sphere_to_bm(bm_brain_proxy, (0.0, 0.005, 0.235), (0.058, 0.072, 0.052), u_seg=14, v_seg=10)
    bio.add_tube_along_points(bm_brain_proxy, [(0.0, 0.0, 0.18), (0.0, 0.0, 0.0)], 0.007, rings=8)
    bio.finish_bmesh_object("Layer_Nervous_Head", bm_brain_proxy, mat_nerve, parent=head, collection=col, smooth=True)

    # Arms (Left & Right)
    for side_tag, sx in (("L", -1.0), ("R", 1.0)):
        shoulder = bio.create_empty(f"Shoulder_{side_tag}_Pivot", (sx * 0.215, -0.005, 0.43), parent=spine, collection=col)
        # Upper arm (deltoid -> biceps/triceps -> elbow at Z = -0.29)
        ua_stations = [
            ((0.0, 0.0, 0.01), 0.062, 0.058, 0.0),
            ((sx * 0.01, 0.005, -0.06), 0.058, 0.056, 0.0),  # deltoid cap
            ((sx * 0.012, 0.005, -0.16), 0.050, 0.052, 0.0), # biceps belly
            ((sx * 0.012, 0.0, -0.28), 0.039, 0.041, 0.0),   # elbow
        ]
        _create_limb_part(f"Layer_Skin_UpperArm_{side_tag}", ua_stations, mat_skin, shoulder, col, rings=16)
        _create_limb_part(f"Layer_Muscular_UpperArm_{side_tag}", [(p, rx * 0.90, ry * 0.90, a) for p, rx, ry, a in ua_stations], mat_muscle, shoulder, col, rings=14, noise_amp=0.05)

        bm_arm_v = bmesh.new()
        bio.add_tube_along_points(bm_arm_v, [(0.0, 0.0, 0.0), (sx * 0.01, 0.0, -0.28)], 0.005, rings=6)
        bio.finish_bmesh_object(f"Layer_Vascular_UpperArm_{side_tag}", bm_arm_v, mat_artery, parent=shoulder, collection=col)

        elbow = bio.create_empty(f"Elbow_{side_tag}_Pivot", (sx * 0.012, 0.0, -0.29), parent=shoulder, collection=col)
        fa_stations = [
            ((0.0, 0.0, 0.0), 0.039, 0.040, 0.0),
            ((0.0, 0.008, -0.09), 0.044, 0.042, 0.0),  # brachioradialis
            ((0.0, 0.005, -0.24), 0.028, 0.024, 0.0),  # wrist
            ((0.0, 0.015, -0.35), 0.020, 0.036, 0.0),  # hand / fingers
        ]
        _create_limb_part(f"Layer_Skin_Forearm_{side_tag}", fa_stations, mat_skin, elbow, col, rings=14)
        _create_limb_part(f"Layer_Muscular_Forearm_{side_tag}", [(p, rx * 0.89, ry * 0.89, a) for p, rx, ry, a in fa_stations[:3]], mat_muscle, elbow, col, rings=12, noise_amp=0.04)

    # Legs (Left & Right) — Hip_Pivot at Z = 0 relative to Pelvis_Pivot (height 0.93m above deck)
    for side_tag, sx in (("L", -1.0), ("R", 1.0)):
        hip = bio.create_empty(f"Hip_{side_tag}_Pivot", (sx * 0.102, 0.0, -0.02), parent=pelvis, collection=col)
        thigh_stations = [
            ((0.0, 0.0, 0.01), 0.088, 0.088, 0.0),
            ((0.0, 0.01, -0.14), 0.084, 0.086, 0.0),  # rectus femoris / vastus
            ((0.0, 0.005, -0.29), 0.070, 0.072, 0.0),
            ((0.0, 0.0, -0.43), 0.056, 0.058, 0.0),   # knee
        ]
        _create_limb_part(f"Layer_Skin_Thigh_{side_tag}", thigh_stations, mat_skin, hip, col, rings=18)
        _create_limb_part(f"Layer_Muscular_Thigh_{side_tag}", [(p, rx * 0.91, ry * 0.91, a) for p, rx, ry, a in thigh_stations], mat_muscle, hip, col, rings=16, noise_amp=0.06)

        bm_lv = bmesh.new()
        bio.add_tube_along_points(bm_lv, [(0.0, 0.01, 0.0), (0.0, 0.0, -0.43)], 0.0065, rings=7)
        bio.finish_bmesh_object(f"Layer_Vascular_Thigh_{side_tag}", bm_lv, mat_artery, parent=hip, collection=col)

        bm_ln = bmesh.new()
        bio.add_tube_along_points(bm_ln, [(0.0, -0.025, 0.0), (0.0, -0.02, -0.43)], 0.0055, rings=7)
        bio.finish_bmesh_object(f"Layer_Nervous_Thigh_{side_tag}", bm_ln, mat_nerve, parent=hip, collection=col)

        knee = bio.create_empty(f"Knee_{side_tag}_Pivot", (0.0, 0.0, -0.44), parent=hip, collection=col)
        shin_stations = [
            ((0.0, 0.0, 0.0), 0.055, 0.057, 0.0),
            ((0.0, -0.014, -0.12), 0.059, 0.064, 0.0),  # gastrocnemius belly
            ((0.0, -0.008, -0.26), 0.042, 0.044, 0.0),  # soleus / achilles taper
            ((0.0, 0.0, -0.39), 0.034, 0.036, 0.0),     # ankle
        ]
        _create_limb_part(f"Layer_Skin_Shin_{side_tag}", shin_stations, mat_skin, knee, col, rings=16)
        _create_limb_part(f"Layer_Muscular_Shin_{side_tag}", [(p, rx * 0.90, ry * 0.90, a) for p, rx, ry, a in shin_stations], mat_muscle, knee, col, rings=14, noise_amp=0.05)

        bm_sv = bmesh.new()
        bio.add_tube_along_points(bm_sv, [(0.0, -0.01, 0.0), (0.0, -0.005, -0.39)], 0.0045, rings=6)
        bio.finish_bmesh_object(f"Layer_Vascular_Shin_{side_tag}", bm_sv, mat_artery, parent=knee, collection=col)

        ankle = bio.create_empty(f"Ankle_{side_tag}_Pivot", (0.0, 0.0, -0.40), parent=knee, collection=col)
        foot_stations = [
            ((0.0, -0.035, -0.032), 0.036, 0.030, 0.0),  # heel
            ((0.0, 0.035, -0.036), 0.044, 0.028, 0.0),   # arch
            ((0.0, 0.125, -0.042), 0.048, 0.022, 0.0),   # forefoot
            ((0.0, 0.185, -0.046), 0.035, 0.015, 0.0),   # toes
        ]
        _create_limb_part(f"Layer_Skin_Foot_{side_tag}", foot_stations, mat_skin, ankle, col, rings=14)


def main():
    bio.clear_scene()
    col = bio.ensure_collection("AthleteGym")
    root = bio.create_empty("AthleteGym_Root", (0.0, 0.0, 0.0), collection=col)
    build_gym_and_treadmill(root, col)
    build_anatomical_athlete(root, col)

    out_dir = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "public", "models"))
    os.makedirs(out_dir, exist_ok=True)
    bio.export_hierarchy_glb(root, os.path.join(out_dir, "athlete_gym.glb"))


if __name__ == "__main__":
    main()
