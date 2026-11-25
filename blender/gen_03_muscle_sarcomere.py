"""
Upgraded public/models/muscle_sarcomere.glb:
- Replaces flat slab Z-Discs and M-Line with authentic hexagonal/alpha-actinin protein lattice scaffolds!
- Adds detailed dual-lobe S1 Myosin catalytic heads + actin helices + tropomyosin ribbons + troponin C/I/T.
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


def build_muscle_hierarchy(root, col):
    mat_epimysium = bio.make_pbr_material("Muscle_Epimysium_Sheath", (0.76, 0.22, 0.26, 1.0), roughness=0.38, alpha=0.40, subsurface_weight=0.3)
    mat_type1 = bio.make_pbr_material("Muscle_Fiber_TypeI_Oxidative", (0.68, 0.10, 0.14, 1.0), roughness=0.34, coat_weight=0.4)
    mat_type2 = bio.make_pbr_material("Muscle_Fiber_TypeII_Glycolytic", (0.88, 0.42, 0.44, 1.0), roughness=0.36, coat_weight=0.3)
    mat_sr = bio.make_pbr_material("Sarcoplasmic_Reticulum_Mesh", (0.24, 0.86, 0.56, 1.0), roughness=0.28, emission_color=(0.18, 0.78, 0.48, 1.0), emission_strength=0.45, alpha=0.82)
    mat_ttub = bio.make_pbr_material("T_Tubule_Membrane", (0.18, 0.78, 0.96, 1.0), roughness=0.22, emission_color=(0.18, 0.78, 0.96, 1.0), emission_strength=1.1)

    macro = bio.create_empty("Muscle_Hierarchy_Group", (0.0, -1.35, 0.85), parent=root, collection=col)

    bm_epi = bmesh.new()
    belly_stations = []
    for i in range(13):
        t = i / 12.0
        x = -1.4 + t * 2.8
        r = 0.09 + 0.36 * math.sin(t * math.pi)
        belly_stations.append(((x, 0.0, 0.0), r, r * 0.92, 0.0))
    bio.add_lofted_profile_to_bm(bm_epi, belly_stations, rings=26)
    bio.finish_bmesh_object("Muscle_Belly_Epimysium", bm_epi, mat_epimysium, parent=macro, collection=col)

    bm_t1 = bmesh.new()
    bm_t2 = bmesh.new()
    for i in range(9):
        ang = (2.0 * math.pi * i) / 9.0
        r_off = 0.22 if i > 0 else 0.0
        cy = math.cos(ang) * r_off
        cz = math.sin(ang) * r_off
        x_end = 1.65 if i % 2 == 0 else 1.25
        target_bm = bm_t1 if i % 2 == 0 else bm_t2
        bio.add_tube_along_points(target_bm, [(-0.9, cy, cz), (-0.3, cy, cz), (0.3, cy, cz), (x_end, cy * 0.75, cz * 0.75)], [0.068, 0.088, 0.084, 0.066], rings=14)
    bio.finish_bmesh_object("Fascicles_TypeI_Oxidative", bm_t1, mat_type1, parent=macro, collection=col)
    bio.finish_bmesh_object("Fascicles_TypeII_Glycolytic", bm_t2, mat_type2, parent=macro, collection=col)

    bm_sr = bmesh.new()
    for ring_i in range(8):
        x_r = 0.65 + ring_i * 0.16
        pts = [(x_r + math.sin((k / 16.0) * math.pi * 8.0) * 0.025, math.cos((k / 16.0) * math.pi * 2.0) * 0.115, math.sin((k / 16.0) * math.pi * 2.0) * 0.115) for k in range(17)]
        bio.add_tube_along_points(bm_sr, pts, 0.0085, rings=6, cap_ends=False)
    for str_i in range(6):
        ang = (2.0 * math.pi * str_i) / 6.0
        bio.add_tube_along_points(bm_sr, [(0.62, math.cos(ang) * 0.112, math.sin(ang) * 0.112), (1.2, math.cos(ang) * 0.11, math.sin(ang) * 0.11), (1.82, math.cos(ang) * 0.108, math.sin(ang) * 0.108)], 0.007, rings=6)
    bio.finish_bmesh_object("Sarcoplasmic_Reticulum", bm_sr, mat_sr, parent=macro, collection=col)

    bm_tt = bmesh.new()
    for tx in (0.85, 1.35, 1.78):
        pts = [(tx, math.cos((k / 20.0) * math.pi * 2.0) * 0.125, math.sin((k / 20.0) * math.pi * 2.0) * 0.125) for k in range(21)]
        bio.add_tube_along_points(bm_tt, pts, 0.011, rings=8, cap_ends=False)
    bio.finish_bmesh_object("T_Tubules", bm_tt, mat_ttub, parent=macro, collection=col)


def build_hero_sarcomere(root, col):
    sarc_root = bio.create_empty("Sarcomere_Hero_Assembly", (0.0, 0.0, 0.0), parent=root, collection=col)

    mat_zdisc = bio.make_pbr_material("Sarcomere_Z_Disc", (0.20, 0.62, 0.94, 1.0), roughness=0.30, metallic=0.25)
    mat_mline = bio.make_pbr_material("Sarcomere_M_Line", (0.94, 0.62, 0.22, 1.0), roughness=0.32, metallic=0.3)
    mat_actin = bio.make_pbr_material("Sarcomere_Actin_Filament", (0.36, 0.78, 0.96, 1.0), roughness=0.28, coat_weight=0.2)
    mat_tropo = bio.make_pbr_material("Sarcomere_Tropomyosin", (0.96, 0.86, 0.34, 1.0), roughness=0.32)
    mat_troponin = bio.make_pbr_material("Sarcomere_Troponin", (0.22, 0.92, 0.54, 1.0), roughness=0.26, emission_color=(0.15, 0.85, 0.45, 1.0), emission_strength=0.4)
    mat_myosin_body = bio.make_pbr_material("Sarcomere_Myosin_Backbone", (0.86, 0.22, 0.34, 1.0), roughness=0.28, coat_weight=0.35)
    mat_myosin_head = bio.make_pbr_material("Sarcomere_Myosin_S1_Head", (0.98, 0.58, 0.18, 1.0), roughness=0.24, emission_color=(0.95, 0.48, 0.12, 1.0), emission_strength=0.45)

    myosin_lanes = [(0.0, 0.22, 0.0), (0.0, -0.22, 0.0), (0.0, 0.0, 0.22), (0.0, 0.0, -0.22)]
    actin_offsets = [(0.38, 0.0), (-0.38, 0.0), (0.0, 0.38), (0.0, -0.38), (0.24, 0.24), (-0.24, -0.24)]

    # Hexagonal / Radial Protein Lattice M-Line (instead of solid flat box!)
    bm_m = bmesh.new()
    for i in range(len(myosin_lanes)):
        _, y1, z1 = myosin_lanes[i]
        bio.add_uv_sphere_to_bm(bm_m, (0.0, y1, z1), (0.045, 0.048, 0.048), u_seg=12, v_seg=10)
        for j in range(i + 1, len(myosin_lanes)):
            _, y2, z2 = myosin_lanes[j]
            bio.add_tube_along_points(bm_m, [(0.0, y1, z1), (0.0, (y1 + y2) * 0.5, (z1 + z2) * 0.5), (0.0, y2, z2)], 0.016, rings=8)
    bio.add_uv_sphere_to_bm(bm_m, (0.0, 0.0, 0.0), (0.038, 0.055, 0.055), u_seg=12, v_seg=10)
    bio.finish_bmesh_object("M_Line", bm_m, mat_mline, parent=sarc_root, collection=col)

    # Thick Myosin Backbone
    bm_myo = bmesh.new()
    for _, ly, lz in myosin_lanes:
        bio.add_tube_along_points(bm_myo, [(-0.98, ly, lz), (-0.45, ly, lz), (0.0, ly, lz), (0.45, ly, lz), (0.98, ly, lz)], 0.036, rings=14)
    bio.finish_bmesh_object("Myosin_Backbone", bm_myo, mat_myosin_body, parent=sarc_root, collection=col)

    # Articulated Myosin S1 Cross-Bridge Heads (curved S2 neck + dual S1 catalytic/lever domains)
    head_idx = 0
    for lane_idx, (_, ly, lz) in enumerate(myosin_lanes):
        dir_y = 1.0 if ly > 0.05 else (-1.0 if ly < -0.05 else 0.0)
        dir_z = 1.0 if lz > 0.05 else (-1.0 if lz < -0.05 else 0.0)
        for side_sign in (-1.0, 1.0):
            for step in range(4):
                hx = side_sign * (0.24 + step * 0.21)
                hpiv = bio.create_empty(f"Myosin_Head_Pivot_{head_idx:02d}", (hx, ly, lz), parent=sarc_root, collection=col)
                bm_h = bmesh.new()
                mid = (side_sign * 0.03, dir_y * 0.065, dir_z * 0.065)
                end = (side_sign * 0.06, dir_y * 0.13, dir_z * 0.13)
                bio.add_tube_along_points(bm_h, [(0.0, 0.0, 0.0), mid, end], [0.016, 0.014, 0.013], rings=8)
                bio.add_uv_sphere_to_bm(bm_h, (end[0], end[1] + dir_y * 0.025, end[2] + dir_z * 0.025), (0.044, 0.030, 0.030), u_seg=12, v_seg=10)
                bio.add_uv_sphere_to_bm(bm_h, (end[0] + side_sign * 0.018, end[1] + dir_y * 0.010, end[2] + dir_z * 0.038), (0.028, 0.022, 0.022), u_seg=10, v_seg=8)
                bio.finish_bmesh_object(f"Myosin_Head_{head_idx:02d}", bm_h, mat_myosin_head, parent=hpiv, collection=col)
                head_idx += 1

    # Left & Right Alpha-Actinin Lattice Z-Discs + Thin Filaments
    for side_label, sx in (("Left", -1.0), ("Right", 1.0)):
        z_piv = bio.create_empty(f"Z_Disc_{side_label}_Pivot", (sx * 1.55, 0.0, 0.0), parent=sarc_root, collection=col)

        bm_zd = bmesh.new()
        ring_pts = [(0.0, math.cos((k / 16.0) * math.pi * 2.0) * 0.50, math.sin((k / 16.0) * math.pi * 2.0) * 0.50) for k in range(17)]
        bio.add_tube_along_points(bm_zd, ring_pts, 0.024, rings=10, cap_ends=False)
        for ay, az in actin_offsets:
            bio.add_uv_sphere_to_bm(bm_zd, (0.0, ay, az), (0.038, 0.038, 0.038), u_seg=10, v_seg=8)
            # Zigzag alpha-actinin struts linking neighbors & outer rim
            bio.add_tube_along_points(bm_zd, [(0.0, ay, az), (-sx * 0.03, ay * 0.5, az * 0.5), (0.0, 0.0, 0.0)], 0.015, rings=7)
            r_len = max(0.01, math.hypot(ay, az))
            bio.add_tube_along_points(bm_zd, [(0.0, ay, az), (sx * 0.025, ay / r_len * 0.48, az / r_len * 0.48)], 0.014, rings=7)
        bio.finish_bmesh_object(f"Z_Disc_{side_label}", bm_zd, mat_zdisc, parent=z_piv, collection=col)

        bm_act = bmesh.new()
        bm_tm = bmesh.new()
        bm_tn = bmesh.new()
        for ay, az in actin_offsets:
            for m in range(28):
                t = m / 27.0
                mx = -sx * (0.06 + t * 1.18)
                ang = m * 0.55
                for strand in (0.0, math.pi):
                    py = ay + math.cos(ang + strand) * 0.017
                    pz = az + math.sin(ang + strand) * 0.017
                    bio.add_uv_sphere_to_bm(bm_act, (mx, py, pz), (0.022, 0.020, 0.020), u_seg=8, v_seg=6)

            tm_pts = [(-sx * (0.06 + (m / 21.0) * 1.18), ay + math.cos(m * 0.68) * 0.029, az + math.sin(m * 0.68) * 0.029) for m in range(22)]
            bio.add_tube_along_points(bm_tm, tm_pts, 0.0075, rings=7)

            for k in range(4):
                kx = -sx * (0.20 + k * 0.28)
                ang = k * 1.6
                bio.add_uv_sphere_to_bm(bm_tn, (kx, ay + math.cos(ang) * 0.036, az + math.sin(ang) * 0.036), (0.026, 0.022, 0.022), u_seg=10, v_seg=8)

        bio.finish_bmesh_object(f"Actin_Filaments_{side_label}", bm_act, mat_actin, parent=z_piv, collection=col)
        bio.finish_bmesh_object(f"Tropomyosin_Strands_{side_label}", bm_tm, mat_tropo, parent=z_piv, collection=col)
        bio.finish_bmesh_object(f"Troponin_Complexes_{side_label}", bm_tn, mat_troponin, parent=z_piv, collection=col)


def main():
    bio.clear_scene()
    col = bio.ensure_collection("MuscleSarcomere")
    root = bio.create_empty("MuscleSarcomere_Root", (0.0, 0.0, 0.0), collection=col)
    build_muscle_hierarchy(root, col)
    build_hero_sarcomere(root, col)

    out_dir = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "public", "models"))
    os.makedirs(out_dir, exist_ok=True)
    bio.export_hierarchy_glb(root, os.path.join(out_dir, "muscle_sarcomere.glb"))


if __name__ == "__main__":
    main()
