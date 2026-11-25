"""
Upgraded public/models/mitochondrion.glb:
- Smooth organic folded Inner Membrane Cristae (serpentine continuous curved folds, zero flat blocks!).
- Porin channels embedded directly onto the outer membrane curvature.
- Multi-subunit ETC Complexes I-IV and F0F1-ATP Synthase seated directly on a gently curved crista ridge.
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


def build_mitochondrion_shell(root, col):
    mat_outer = bio.make_pbr_material("Mito_Outer_Membrane", (0.28, 0.16, 0.52, 1.0), roughness=0.30, alpha=0.40, coat_weight=0.45)
    mat_cristae = bio.make_pbr_material("Mito_Inner_Cristae", (0.86, 0.42, 0.14, 1.0), roughness=0.28, coat_weight=0.5, subsurface_weight=0.35)
    mat_porin = bio.make_pbr_material("Mito_VDAC_Porin", (0.22, 0.88, 0.96, 1.0), roughness=0.22, emission_color=(0.18, 0.85, 0.96, 1.0), emission_strength=0.7)
    mat_matrix = bio.make_pbr_material("Mito_Matrix_Core", (0.22, 0.58, 0.92, 1.0), roughness=0.35, emission_color=(0.18, 0.45, 0.85, 1.0), emission_strength=0.35)

    # Outer capsule-like cut-open shell with smooth dense resolution
    bm_outer = bmesh.new()
    stations = []
    for i in range(25):
        t = (i / 24.0) * 2.0 - 1.0
        x = t * 1.92
        r_prof = math.sqrt(max(0.03, 1.0 - (t * 0.96) ** 2)) * 0.98
        stations.append(((x, 0.0, 0.0), r_prof * 0.92, r_prof * 0.88))

    ring_verts = []
    for pos, rx, ry in stations:
        row = []
        for j in range(32):
            ang = math.radians(108.0) + (j / 31.0) * math.radians(235.0)
            row.append(bm_outer.verts.new((pos[0], math.cos(ang) * rx, math.sin(ang) * ry)))
        ring_verts.append(row)
    for i in range(len(ring_verts) - 1):
        for j in range(len(ring_verts[i]) - 1):
            bm_outer.faces.new((ring_verts[i][j], ring_verts[i][j + 1], ring_verts[i + 1][j + 1], ring_verts[i + 1][j]))
    bmesh.ops.solidify(bm_outer, geom=list(bm_outer.faces), thickness=0.045)
    bio.finish_bmesh_object("Mitochondrion_Outer_Membrane", bm_outer, mat_outer, parent=root, collection=col, subsurf_levels=1)

    # Porins seated directly into the outer membrane wall
    bm_porin = bmesh.new()
    for px in (-0.82, 0.0, 0.82):
        t = px / 1.92
        r_prof = math.sqrt(max(0.05, 1.0 - (t * 0.96) ** 2)) * 0.98
        ang_w = math.radians(225.0)
        py = math.cos(ang_w) * r_prof * 0.90
        pz = math.sin(ang_w) * r_prof * 0.86
        pts = [(px + math.cos((k / 16.0) * math.pi * 2.0) * 0.08, py - math.sin((k / 16.0) * math.pi * 2.0) * 0.04, pz + math.sin((k / 16.0) * math.pi * 2.0) * 0.07) for k in range(17)]
        bio.add_tube_along_points(bm_porin, pts, 0.025, rings=10, cap_ends=False)
    bio.finish_bmesh_object("Mitochondrion_Porins", bm_porin, mat_porin, parent=root, collection=col)

    # Smooth Organic Serpentine Cristae Ribbon (swept wave profile across mitochondrion interior!)
    bm_cr = bmesh.new()
    # Continuous curved serpentine cristae floor + tubular invagination baffles
    nx = 96
    ny = 18
    grid_v = []
    for ix in range(nx):
        u = ix / (nx - 1)
        x = -1.58 + u * 3.16
        env = math.sqrt(max(0.05, 1.0 - (x / 1.68) ** 2))
        # Smooth organic folded cristae wave (peaking under the ETC/Synthase hero stage and dipping into matrix valleys)
        wave = math.pow(max(0.0, math.cos(u * math.pi * 9.0)), 2.2)
        z_fold = -0.34 + env * 0.56 * wave
        row = []
        for iy in range(ny):
            v = (iy / (ny - 1)) * 2.0 - 1.0
            y = v * 0.60 * env - 0.05
            z = z_fold + 0.08 * (v * v) * env
            row.append(bm_cr.verts.new((x, y, z)))
        grid_v.append(row)

    for ix in range(nx - 1):
        for iy in range(ny - 1):
            bm_cr.faces.new((grid_v[ix][iy], grid_v[ix + 1][iy], grid_v[ix + 1][iy + 1], grid_v[ix][iy + 1]))
    bmesh.ops.solidify(bm_cr, geom=list(bm_cr.faces), thickness=0.055)
    bio.finish_bmesh_object("Inner_Membrane_Cristae", bm_cr, mat_cristae, parent=root, collection=col, subsurf_levels=1)

    # Circular mtDNA plasmids nestled in matrix valleys
    bm_mat = bmesh.new()
    for ring_x in (-0.70, 0.70):
        pts = [(ring_x + math.cos((k / 24.0) * math.pi * 2.0) * 0.14, 0.06, -0.02 + math.sin((k / 24.0) * math.pi * 2.0) * 0.14) for k in range(25)]
        bio.add_tube_along_points(bm_mat, pts, 0.011, rings=8, cap_ends=False)
    bio.finish_bmesh_object("Mitochondrial_Matrix_mtDNA", bm_mat, mat_matrix, parent=root, collection=col)


def build_etc_and_atp_synthase(root, col):
    """
    Hero molecular assembly embedded smoothly into a curved organic crista lipid crest at Z = +0.26.
    """
    mol_root = bio.create_empty("ETC_And_Synthase_Stage", (0.0, 0.04, 0.28), parent=root, collection=col)

    # Gently curved biological lipid bilayer ribbon (NOT a sharp rectangular board!)
    mat_bilayer = bio.make_pbr_material("Crista_Lipid_Bilayer", (0.86, 0.50, 0.20, 1.0), roughness=0.30, alpha=0.68)
    bm_bil = bmesh.new()
    bio.add_lofted_profile_to_bm(
        bm_bil,
        [
            ((-0.88, 0.0, -0.02), 0.24, 0.032, 0.0),
            ((-0.44, 0.0, 0.00), 0.28, 0.036, 0.0),
            ((0.0, 0.0, 0.01), 0.30, 0.036, 0.0),
            ((0.44, 0.0, 0.00), 0.28, 0.036, 0.0),
            ((0.82, 0.0, -0.02), 0.22, 0.032, 0.0),
        ],
        rings=20,
    )
    bio.finish_bmesh_object("Crista_Bilayer_Patch", bm_bil, mat_bilayer, parent=mol_root, collection=col, subsurf_levels=1)

    complex_specs = [
        ("ETC_Complex_I", (-0.60, 0.0, 0.02), (0.12, 0.56, 0.96), [(0, 0, -0.03, 0.072), (0.03, 0, 0.08, 0.060), (0.08, 0, 0.16, 0.056)]),
        ("ETC_Complex_II", (-0.36, 0.03, 0.02), (0.28, 0.88, 0.48), [(0, 0, 0.01, 0.052), (0, 0, 0.08, 0.044)]),
        ("ETC_Complex_III", (-0.14, -0.02, 0.02), (0.90, 0.32, 0.68), [(-0.03, 0, 0.03, 0.056), (0.03, 0, 0.03, 0.056)]),
        ("ETC_Complex_IV", (0.10, 0.01, 0.02), (0.24, 0.78, 0.92), [(0, 0, 0.02, 0.068), (0, 0, 0.10, 0.048)]),
    ]
    for cname, cloc, ccol, lobes in complex_specs:
        cmat = bio.make_pbr_material(f"Mat_{cname}", (*ccol, 1.0), roughness=0.26, emission_color=(*ccol, 1.0), emission_strength=0.45)
        bm_c = bmesh.new()
        for lx, ly, lz, lrad in lobes:
            bio.add_uv_sphere_to_bm(bm_c, (cloc[0] + lx, cloc[1] + ly, cloc[2] + lz), (lrad, lrad * 0.9, lrad * 1.15), u_seg=16, v_seg=12)
        bio.finish_bmesh_object(cname, bm_c, cmat, parent=mol_root, collection=col)

    # Hero F0F1-ATP Synthase Complex
    atp_root = bio.create_empty("ATP_Synthase_Complex", (0.46, 0.0, 0.0), parent=mol_root, collection=col)

    mat_f0 = bio.make_pbr_material("ATP_F0_CRing", (0.16, 0.78, 0.94, 1.0), roughness=0.24, metallic=0.15)
    mat_gamma = bio.make_pbr_material("ATP_Gamma_Rotor", (0.98, 0.82, 0.24, 1.0), roughness=0.22, emission_color=(0.98, 0.82, 0.24, 1.0), emission_strength=0.75)
    mat_alpha = bio.make_pbr_material("ATP_F1_Alpha", (0.94, 0.42, 0.28, 1.0), roughness=0.28, coat_weight=0.35)
    mat_beta = bio.make_pbr_material("ATP_F1_Beta_Catalytic", (0.98, 0.72, 0.22, 1.0), roughness=0.24, emission_color=(0.98, 0.65, 0.16, 1.0), emission_strength=0.55)
    mat_stator = bio.make_pbr_material("ATP_Stator_Stalk", (0.58, 0.68, 0.82, 1.0), roughness=0.32)

    f0_piv = bio.create_empty("F0_Membrane_Ring_Pivot", (0.0, 0.0, 0.0), parent=atp_root, collection=col)
    bm_f0 = bmesh.new()
    for k in range(10):
        ang = (2.0 * math.pi * k) / 10.0
        bio.add_uv_sphere_to_bm(bm_f0, (math.cos(ang) * 0.095, math.sin(ang) * 0.095, 0.0), (0.032, 0.032, 0.075), u_seg=12, v_seg=10)
    bio.finish_bmesh_object("F0_CRing_Subunits", bm_f0, mat_f0, parent=f0_piv, collection=col)

    gamma_piv = bio.create_empty("Gamma_Rotor_Stalk_Pivot", (0.0, 0.0, 0.04), parent=atp_root, collection=col)
    bm_gam = bmesh.new()
    bio.add_lofted_profile_to_bm(
        bm_gam,
        [
            ((0.0, 0.0, 0.0), 0.044, 0.038, 0.0),
            ((0.014, 0.0, 0.09), 0.028, 0.024, 0.6),
            ((-0.012, 0.01, 0.19), 0.025, 0.021, 1.4),
            ((0.0, 0.0, 0.26), 0.022, 0.022, 2.0),
        ],
        rings=14,
    )
    bio.finish_bmesh_object("Gamma_Rotor_Axle", bm_gam, mat_gamma, parent=gamma_piv, collection=col)

    bm_f1_a = bmesh.new()
    bm_f1_b = bmesh.new()
    for k in range(6):
        ang = (2.0 * math.pi * k) / 6.0
        px = math.cos(ang) * 0.11
        py = math.sin(ang) * 0.11
        target_bm = bm_f1_a if k % 2 == 0 else bm_f1_b
        bio.add_uv_sphere_to_bm(target_bm, (px, py, 0.26), (0.068, 0.062, 0.11), u_seg=16, v_seg=12, rot_euler=(0.0, 0.0, ang))
    bio.finish_bmesh_object("F1_Alpha_Subunits", bm_f1_a, mat_alpha, parent=atp_root, collection=col)
    bio.finish_bmesh_object("F1_Beta_Catalytic_Subunits", bm_f1_b, mat_beta, parent=atp_root, collection=col)

    bm_stat = bmesh.new()
    bio.add_tube_along_points(
        bm_stat,
        [(0.145, 0.0, -0.02), (0.19, 0.0, 0.08), (0.18, 0.0, 0.24), (0.11, 0.0, 0.36), (0.0, 0.0, 0.39)],
        [0.026, 0.022, 0.020, 0.022, 0.032],
        rings=12,
    )
    bio.finish_bmesh_object("Stator_Stalk", bm_stat, mat_stator, parent=atp_root, collection=col)


def main():
    bio.clear_scene()
    col = bio.ensure_collection("Mitochondrion")
    root = bio.create_empty("Mitochondrion_Root", (0.0, 0.0, 0.0), collection=col)
    build_mitochondrion_shell(root, col)
    build_etc_and_atp_synthase(root, col)

    out_dir = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "public", "models"))
    os.makedirs(out_dir, exist_ok=True)
    bio.export_hierarchy_glb(root, os.path.join(out_dir, "mitochondrion.glb"))


if __name__ == "__main__":
    main()
