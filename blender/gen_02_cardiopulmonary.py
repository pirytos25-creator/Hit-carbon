"""
Upgraded public/models/cardiopulmonary.glb:
- High-resolution smooth organic Heart (Subsurf level 1, clear left/right ventricles & auricles,
  aortic arch, pulmonary trunk, vena cava, coronary arteries, SA/AV/His-Purkinje system).
- Organic sculpted bilateral Lungs (curved mediastinal notches, smooth lobar profile)
  with cartilaginous Trachea & Bronchial Tree + Macro Alveolar Cluster + Capillary Web.
"""
import math
import os
import sys
import bpy
import bmesh

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

import lib_bio_mesh as bio


def _smooth_stations_along_z(x_fn, y_fn, rx_fn, ry_fn, z_min, z_max, steps=16):
    stations = []
    for i in range(steps):
        t = i / (steps - 1)
        z = z_min + t * (z_max - z_min)
        stations.append(((x_fn(t), y_fn(t), z), rx_fn(t), ry_fn(t), 0.0))
    return stations


def build_heart(root, col):
    heart_root = bio.create_empty("Heart_Assembly", (0.04, 0.04, -0.02), parent=root, collection=col)

    mat_myocard = bio.make_pbr_material(
        "Heart_Myocardium",
        (0.72, 0.11, 0.15, 1.0),
        roughness=0.30,
        coat_weight=0.55,
        subsurface_weight=0.40,
    )
    mat_atria = bio.make_pbr_material(
        "Heart_Atria_Tissue",
        (0.58, 0.10, 0.17, 1.0),
        roughness=0.34,
        coat_weight=0.45,
    )
    mat_aorta = bio.make_pbr_material(
        "Vessel_Arterial_Oxy",
        (0.86, 0.12, 0.18, 1.0),
        roughness=0.28,
        coat_weight=0.35,
    )
    mat_vein = bio.make_pbr_material(
        "Vessel_Venous_Deoxy",
        (0.32, 0.15, 0.42, 1.0),
        roughness=0.34,
        coat_weight=0.30,
    )
    mat_valve = bio.make_pbr_material("Heart_Valve_Leaflet", (0.94, 0.88, 0.84, 1.0), roughness=0.26)
    mat_conduction = bio.make_pbr_material(
        "Conduction_Purkinje",
        (0.18, 0.90, 0.98, 1.0),
        roughness=0.2,
        emission_color=(0.25, 0.94, 1.0, 1.0),
        emission_strength=1.9,
    )
    mat_coronary = bio.make_pbr_material(
        "Heart_Coronary_Artery",
        (0.95, 0.24, 0.24, 1.0),
        roughness=0.26,
        emission_color=(0.95, 0.22, 0.22, 1.0),
        emission_strength=0.35,
    )

    # Smooth organic Left Ventricle (thick conical apex tilted down-left-forward)
    lv_pivot = bio.create_empty("Left_Ventricle_Pivot", (0.036, 0.015, -0.035), parent=heart_root, collection=col)
    bm_lv = bmesh.new()
    lv_st = _smooth_stations_along_z(
        lambda t: 0.025 * (1.0 - t),
        lambda t: 0.025 * (1.0 - t),
        lambda t: 0.014 + 0.062 * math.sin(math.pow(t, 0.65) * math.pi * 0.82),
        lambda t: 0.013 + 0.056 * math.sin(math.pow(t, 0.65) * math.pi * 0.82),
        -0.135,
        0.055,
        steps=14,
    )
    bio.add_lofted_profile_to_bm(bm_lv, lv_st, rings=26, dome_factor=0.45)
    bio.finish_bmesh_object("Left_Ventricle", bm_lv, mat_myocard, parent=lv_pivot, collection=col, subsurf_levels=1)

    # Smooth organic Right Ventricle (crescent wrapping anterior-right)
    rv_pivot = bio.create_empty("Right_Ventricle_Pivot", (-0.038, 0.030, -0.025), parent=heart_root, collection=col)
    bm_rv = bmesh.new()
    rv_st = _smooth_stations_along_z(
        lambda t: 0.012 * (1.0 - t),
        lambda t: 0.008 * (1.0 - t),
        lambda t: 0.015 + 0.050 * math.sin(math.pow(t, 0.65) * math.pi * 0.86),
        lambda t: 0.014 + 0.044 * math.sin(math.pow(t, 0.65) * math.pi * 0.86),
        -0.105,
        0.065,
        steps=14,
    )
    bio.add_lofted_profile_to_bm(bm_rv, rv_st, rings=24, dome_factor=0.45)
    bio.finish_bmesh_object("Right_Ventricle", bm_rv, mat_myocard, parent=rv_pivot, collection=col, subsurf_levels=1)

    # Right & Left Atria
    ra_pivot = bio.create_empty("Right_Atrium_Pivot", (-0.062, -0.008, 0.072), parent=heart_root, collection=col)
    bm_ra = bmesh.new()
    bio.add_uv_sphere_to_bm(bm_ra, (0.0, 0.0, 0.0), (0.048, 0.044, 0.052), u_seg=22, v_seg=16)
    bio.add_uv_sphere_to_bm(bm_ra, (0.022, 0.026, 0.016), (0.024, 0.022, 0.018), u_seg=14, v_seg=10)
    bio.finish_bmesh_object("Right_Atrium", bm_ra, mat_atria, parent=ra_pivot, collection=col)

    la_pivot = bio.create_empty("Left_Atrium_Pivot", (0.042, -0.022, 0.072), parent=heart_root, collection=col)
    bm_la = bmesh.new()
    bio.add_uv_sphere_to_bm(bm_la, (0.0, 0.0, 0.0), (0.046, 0.042, 0.048), u_seg=22, v_seg=16)
    bio.finish_bmesh_object("Left_Atrium", bm_la, mat_atria, parent=la_pivot, collection=col)

    # 4 Valves
    for vname, vloc, vrad in [
        ("Tricuspid_Valve", (-0.044, 0.012, 0.032), 0.022),
        ("Pulmonary_Valve", (-0.020, 0.045, 0.068), 0.018),
        ("Mitral_Valve", (0.036, 0.002, 0.032), 0.021),
        ("Aortic_Valve", (0.012, 0.018, 0.055), 0.019),
    ]:
        vpiv = bio.create_empty(f"{vname}_Pivot", vloc, parent=heart_root, collection=col)
        bm_v = bmesh.new()
        for k in range(3):
            ang = (2.0 * math.pi * k) / 3.0
            bio.add_uv_sphere_to_bm(
                bm_v,
                (math.cos(ang) * vrad * 0.42, math.sin(ang) * vrad * 0.42, 0.0),
                (vrad * 0.55, vrad * 0.36, 0.006),
                u_seg=12,
                v_seg=8,
                rot_euler=(0.3, 0.0, ang),
            )
        bio.finish_bmesh_object(vname, bm_v, mat_valve, parent=vpiv, collection=col)

    # Aortic Arch + Pulmonary Veins
    bm_art = bmesh.new()
    aorta_pts = [
        (0.01, 0.015, 0.055),
        (0.015, 0.022, 0.11),
        (0.018, 0.012, 0.155),
        (0.015, -0.012, 0.185),
        (0.022, -0.045, 0.175),
        (0.022, -0.072, 0.115),
        (0.018, -0.075, 0.01),
        (0.012, -0.075, -0.14),
    ]
    bio.add_tube_along_points(bm_art, aorta_pts, [0.021, 0.022, 0.022, 0.021, 0.020, 0.018, 0.017, 0.015], rings=18)
    bio.add_tube_along_points(bm_art, [(-0.002, 0.008, 0.175), (-0.016, 0.01, 0.22), (-0.028, 0.01, 0.255)], 0.0085, rings=12)
    bio.add_tube_along_points(bm_art, [(0.014, -0.005, 0.184), (0.017, 0.002, 0.225), (0.019, 0.005, 0.26)], 0.0075, rings=12)
    bio.add_tube_along_points(bm_art, [(0.026, -0.022, 0.178), (0.040, -0.018, 0.215), (0.055, -0.015, 0.25)], 0.0078, rings=12)
    bio.add_tube_along_points(bm_art, [(0.065, -0.025, 0.085), (0.11, -0.022, 0.090), (0.15, -0.02, 0.095)], 0.0095, rings=10)
    bio.add_tube_along_points(bm_art, [(0.065, -0.030, 0.062), (0.11, -0.026, 0.064), (0.15, -0.024, 0.066)], 0.0095, rings=10)
    bio.finish_bmesh_object("Aortic_Arch_And_PulmVeins", bm_art, mat_aorta, parent=heart_root, collection=col)

    # Vena Cava & Pulmonary Trunk
    bm_ven = bmesh.new()
    bio.add_tube_along_points(bm_ven, [(-0.070, -0.012, 0.10), (-0.072, -0.014, 0.17), (-0.074, -0.015, 0.24)], 0.017, rings=16)
    bio.add_tube_along_points(bm_ven, [(-0.070, -0.015, 0.03), (-0.070, -0.018, -0.06), (-0.070, -0.022, -0.14)], 0.018, rings=16)
    bio.add_tube_along_points(bm_ven, [(-0.022, 0.045, 0.065), (-0.018, 0.042, 0.105), (-0.014, 0.036, 0.135), (0.045, 0.015, 0.145), (0.145, 0.0, 0.125)], [0.018, 0.018, 0.017, 0.014, 0.012], rings=14)
    bio.add_tube_along_points(bm_ven, [(-0.014, 0.036, 0.135), (-0.055, 0.015, 0.138), (-0.11, 0.0, 0.13), (-0.155, -0.01, 0.12)], [0.015, 0.014, 0.013, 0.012], rings=12)
    bio.finish_bmesh_object("Vena_Cava_And_PulmArtery", bm_ven, mat_vein, parent=heart_root, collection=col)

    # Coronary arteries & Conduction System
    bm_cor = bmesh.new()
    bio.add_tube_along_points(bm_cor, [(0.015, 0.035, 0.05), (0.012, 0.070, 0.015), (0.022, 0.068, -0.045), (0.038, 0.046, -0.11)], [0.0045, 0.004, 0.0032, 0.0022], rings=8)
    bio.add_tube_along_points(bm_cor, [(-0.015, 0.04, 0.048), (-0.058, 0.054, 0.015), (-0.064, 0.045, -0.045)], [0.004, 0.0035, 0.0025], rings=8)
    bio.finish_bmesh_object("Coronary_Arteries", bm_cor, mat_coronary, parent=heart_root, collection=col)

    bm_cond = bmesh.new()
    bio.add_uv_sphere_to_bm(bm_cond, (-0.075, 0.015, 0.100), (0.011, 0.009, 0.013), u_seg=12, v_seg=10)
    bio.add_uv_sphere_to_bm(bm_cond, (-0.014, 0.012, 0.038), (0.010, 0.009, 0.010), u_seg=12, v_seg=10)
    bio.add_tube_along_points(bm_cond, [(-0.075, 0.015, 0.100), (-0.045, 0.018, 0.070), (-0.014, 0.012, 0.038)], 0.0026, rings=6)
    bio.add_tube_along_points(bm_cond, [(-0.014, 0.012, 0.038), (0.0, 0.014, 0.01), (0.035, 0.024, -0.085), (0.064, 0.025, -0.02)], 0.0028, rings=6)
    bio.add_tube_along_points(bm_cond, [(0.0, 0.014, 0.01), (-0.032, 0.032, -0.070), (-0.064, 0.025, -0.02)], 0.0026, rings=6)
    bio.finish_bmesh_object("Conduction_SA_AV_Purkinje", bm_cond, mat_conduction, parent=heart_root, collection=col)


def build_lungs_and_alveoli(root, col):
    lungs_root = bio.create_empty("Lungs_Assembly", (0.0, 0.0, 0.02), parent=root, collection=col)

    mat_lung_parenchyma = bio.make_pbr_material(
        "Lung_Parenchyma_Translucent",
        (0.90, 0.50, 0.58, 1.0),
        roughness=0.40,
        alpha=0.28,
        subsurface_weight=0.45,
    )
    mat_bronchi = bio.make_pbr_material("Bronchial_Cartilage", (0.85, 0.79, 0.75, 1.0), roughness=0.42)
    mat_alveoli = bio.make_pbr_material("Alveolar_Membrane", (0.96, 0.68, 0.74, 1.0), roughness=0.32, alpha=0.76, subsurface_weight=0.5)
    mat_cap_net = bio.make_pbr_material(
        "Alveolar_Capillary_Web",
        (0.86, 0.14, 0.24, 1.0),
        roughness=0.28,
        emission_color=(0.86, 0.16, 0.26, 1.0),
        emission_strength=0.35,
    )

    # Smooth sculpted organic Lung lobes (16 stations + Subsurf level 1 -> silky organic curvature)
    bm_lungs = bmesh.new()
    for sx, width_scale in ((-1.0, 1.05), (1.0, 0.96)):
        lung_st = []
        for i in range(16):
            t = i / 15.0
            z = -0.15 + t * 0.37
            # Dome-tapered lung profile (broad base, smoothly rounded apex)
            bell = math.sin(math.pow(t, 0.72) * math.pi * 0.92)
            rx = max(0.018, 0.112 * width_scale * bell + 0.018 * (1.0 - t))
            ry = max(0.020, 0.132 * bell + 0.020 * (1.0 - t))
            cx = sx * (0.195 - 0.055 * (t ** 1.4))
            cy = -0.018 * (1.0 - 0.5 * t)
            lung_st.append(((cx, cy, z), rx, ry, 0.0))
        bio.add_lofted_profile_to_bm(bm_lungs, lung_st, rings=28, dome_factor=0.5)
    bio.finish_bmesh_object("Lungs_Translucent_Lobes", bm_lungs, mat_lung_parenchyma, parent=lungs_root, collection=col, subsurf_levels=1)

    # Smooth curved Trachea & Bronchial Tree (3+ points per smooth arc, no twisted caps!)
    bm_br = bmesh.new()
    bio.add_tube_along_points(bm_br, [(0.0, -0.01, 0.34), (0.0, -0.01, 0.24), (0.0, -0.01, 0.14)], 0.019, rings=16)
    for rz in range(9):
        z_ring = 0.155 + rz * 0.020
        bio.add_uv_sphere_to_bm(bm_br, (0.0, -0.01, z_ring), (0.022, 0.022, 0.0045), u_seg=16, v_seg=8)

    branches = [
        [(0.0, -0.01, 0.14), (-0.05, -0.01, 0.11), (-0.11, -0.01, 0.075), (-0.17, -0.015, 0.015), (-0.21, -0.02, -0.08)],
        [(-0.11, -0.01, 0.075), (-0.135, 0.005, 0.115), (-0.16, 0.01, 0.165)],
        [(-0.17, -0.015, 0.015), (-0.20, 0.005, 0.012), (-0.23, 0.02, 0.008)],
        [(0.0, -0.01, 0.14), (0.055, -0.01, 0.112), (0.115, -0.01, 0.078), (0.175, -0.015, 0.015), (0.215, -0.02, -0.08)],
        [(0.115, -0.01, 0.078), (0.140, 0.005, 0.118), (0.168, 0.01, 0.168)],
        [(0.175, -0.015, 0.015), (0.205, 0.005, 0.012), (0.235, 0.02, 0.008)],
    ]
    for br in branches:
        radii = [0.0135 - i * 0.0022 for i in range(len(br))]
        bio.add_tube_along_points(bm_br, br, radii, rings=12)
    bio.finish_bmesh_object("Trachea_And_Bronchial_Tree", bm_br, mat_bronchi, parent=lungs_root, collection=col)

    # Macro Alveolar Sac Cluster (positioned at X = +0.52m cleanly outside left lung lobe)
    alv_root = bio.create_empty("Alveolar_Sac_Hero", (0.54, 0.0, 0.0), parent=root, collection=col)
    bm_alv = bmesh.new()
    bio.add_tube_along_points(bm_alv, [(-0.14, 0.0, 0.03), (-0.06, 0.0, 0.012), (0.0, 0.0, 0.0)], [0.020, 0.017, 0.015], rings=14)
    sac_offsets = [
        (0.025, 0.0, 0.0, 0.042),
        (0.068, 0.032, 0.024, 0.036),
        (0.068, -0.034, 0.018, 0.038),
        (0.060, 0.018, -0.036, 0.035),
        (0.088, -0.012, -0.028, 0.034),
        (0.095, 0.015, 0.012, 0.036),
        (0.038, 0.042, -0.015, 0.032),
        (0.036, -0.042, -0.016, 0.032),
    ]
    for ox, oy, oz, rad in sac_offsets:
        bio.add_uv_sphere_to_bm(bm_alv, (ox, oy, oz), (rad, rad, rad), u_seg=18, v_seg=14)
    bio.finish_bmesh_object("Alveolar_Sac_Cluster", bm_alv, mat_alveoli, parent=alv_root, collection=col)

    bm_cap = bmesh.new()
    for i, (ox, oy, oz, rad) in enumerate(sac_offsets):
        pts_ring = []
        for k in range(17):
            t = (k / 16.0) * math.pi * 2.0
            r_net = rad * 1.05
            pts_ring.append((
                ox + math.cos(t) * r_net,
                oy + math.sin(t) * r_net * math.cos(i * 0.7),
                oz + math.sin(t) * r_net * math.sin(i * 0.7),
            ))
        bio.add_tube_along_points(bm_cap, pts_ring, 0.0042, rings=8, cap_ends=False)
    bio.finish_bmesh_object("Capillary_Mesh_Web", bm_cap, mat_cap_net, parent=alv_root, collection=col)


def main():
    bio.clear_scene()
    col = bio.ensure_collection("Cardiopulmonary")
    root = bio.create_empty("Cardiopulmonary_Root", (0.0, 0.0, 0.0), collection=col)
    build_heart(root, col)
    build_lungs_and_alveoli(root, col)

    out_dir = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "public", "models"))
    os.makedirs(out_dir, exist_ok=True)
    bio.export_hierarchy_glb(root, os.path.join(out_dir, "cardiopulmonary.glb"))


if __name__ == "__main__":
    main()
