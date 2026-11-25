"""
Upgraded public/models/brain_synapse.glb:
1. Smooth, high-resolution Cerebral Cortex with cortical gyri/sulci folding (sphere-deformed hemispheres + Subsurf)
   and anatomically nested Prefrontal_Cortex, Motor_Cortex, Hippocampus, Amygdala, Nucleus_Accumbens,
   Hypothalamus, Brainstem, VTA, Locus_Coeruleus, Raphe_Nuclei, Cerebellum.
2. High-resolution bulbous Presynaptic Bouton & mushroom-shaped Postsynaptic Dendritic Spine
   with flat active zone / PSD interface and smooth curved axonal neck.
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


def _build_gyri_hemisphere(bm, side_sign):
    """Creates a smooth deformed anatomical cerebral hemisphere with frontal/occipital/temporal curvature."""
    temp_bm = bmesh.new()
    bmesh.ops.create_icosphere(temp_bm, subdivisions=4, radius=1.0)
    for v in temp_bm.verts:
        p = v.co.copy()
        # Flatten medial interhemispheric fissure wall (inner X side)
        if p.x * side_sign < 0.0:
            p.x *= 0.14
        else:
            p.x *= 0.42
        # Elongate anteroposteriorly (+Y frontal, -Y occipital) and dome superiorly (+Z)
        p.y *= 0.84
        p.z *= 0.56
        # Carve ventral base & curve temporal lobe
        if p.z < -0.10:
            p.z = -0.10 + (p.z + 0.10) * 0.45
        if p.y > -0.15 and p.y < 0.35 and p.z < 0.02 and p.x * side_sign > 0.10:
            # Temporal lobe bulge
            p.z -= 0.15 * math.exp(-((p.y - 0.08) ** 2) / 0.08)
            p.x += side_sign * 0.05 * math.exp(-((p.y - 0.08) ** 2) / 0.08)

        # Subtle organic cortical gyri/sulci undulations
        gyri = (
            math.sin(p.x * 26.0 + p.y * 14.0)
            * math.cos(p.y * 22.0 + p.z * 18.0)
            * 0.014
        )
        p += p.normalized() * gyri
        p.x += side_sign * 0.045
        v.co = p

    # Copy into main bmesh
    vert_map = {}
    for v in temp_bm.verts:
        vert_map[v] = bm.verts.new(v.co)
    for f in temp_bm.faces:
        bm.faces.new([vert_map[v] for v in f.verts])
    temp_bm.free()


def build_macro_brain(root, col):
    brain_root = bio.create_empty("Brain_Macro_Assembly", (0.0, 0.0, 0.0), parent=root, collection=col)

    mat_cortex = bio.make_pbr_material("Brain_Cortex_Glass", (0.44, 0.60, 0.82, 1.0), roughness=0.25, alpha=0.20, subsurface_weight=0.35)
    mat_pfc = bio.make_pbr_material("Region_PFC", (0.22, 0.84, 0.98, 1.0), roughness=0.32, emission_color=(0.22, 0.84, 0.98, 1.0), emission_strength=0.45)
    mat_motor = bio.make_pbr_material("Region_MotorCortex", (0.98, 0.56, 0.22, 1.0), roughness=0.32, emission_color=(0.98, 0.56, 0.22, 1.0), emission_strength=0.45)
    mat_hippo = bio.make_pbr_material("Region_Hippocampus", (0.98, 0.80, 0.24, 1.0), roughness=0.28, emission_color=(0.98, 0.80, 0.24, 1.0), emission_strength=0.6)
    mat_amyg = bio.make_pbr_material("Region_Amygdala", (0.94, 0.26, 0.42, 1.0), roughness=0.30, emission_color=(0.94, 0.26, 0.42, 1.0), emission_strength=0.5)
    mat_nacc = bio.make_pbr_material("Region_NucleusAccumbens", (0.96, 0.64, 0.16, 1.0), roughness=0.28, emission_color=(0.96, 0.64, 0.16, 1.0), emission_strength=0.55)
    mat_hypo = bio.make_pbr_material("Region_Hypothalamus", (0.24, 0.88, 0.62, 1.0), roughness=0.30, emission_color=(0.24, 0.88, 0.62, 1.0), emission_strength=0.5)
    mat_stem = bio.make_pbr_material("Region_Brainstem", (0.58, 0.66, 0.78, 1.0), roughness=0.40)
    mat_vta = bio.make_pbr_material("Region_VTA", (0.98, 0.52, 0.14, 1.0), roughness=0.26, emission_color=(0.98, 0.52, 0.14, 1.0), emission_strength=0.85)
    mat_lc = bio.make_pbr_material("Region_LocusCoeruleus", (0.18, 0.88, 0.98, 1.0), roughness=0.24, emission_color=(0.18, 0.88, 0.98, 1.0), emission_strength=1.0)
    mat_raphe = bio.make_pbr_material("Region_RapheNuclei", (0.42, 0.62, 0.98, 1.0), roughness=0.26, emission_color=(0.42, 0.62, 0.98, 1.0), emission_strength=0.85)
    mat_cereb = bio.make_pbr_material("Region_Cerebellum", (0.72, 0.48, 0.68, 1.0), roughness=0.38)

    bm_cort = bmesh.new()
    _build_gyri_hemisphere(bm_cort, -1.0)
    _build_gyri_hemisphere(bm_cort, 1.0)
    bio.finish_bmesh_object("Cerebral_Cortex_Shell", bm_cort, mat_cortex, parent=brain_root, collection=col, subsurf_levels=1)

    bm_pfc = bmesh.new()
    for sx in (-1.0, 1.0):
        bio.add_uv_sphere_to_bm(bm_pfc, (sx * 0.19, 0.42, 0.06), (0.12, 0.14, 0.15), u_seg=16, v_seg=12)
    bio.finish_bmesh_object("Prefrontal_Cortex", bm_pfc, mat_pfc, parent=brain_root, collection=col)

    # Motor cortex hugging inside dorsal precentral curve
    bm_mot = bmesh.new()
    mot_st = []
    for i in range(13):
        ang = -1.05 + (i / 12.0) * 2.10
        x = math.sin(ang) * 0.34
        z = math.cos(ang) * 0.39 + 0.02
        y = 0.05 + math.cos(ang) * 0.03
        r = 0.046 * (0.7 + 0.3 * math.cos(ang))
        mot_st.append(((x, y, z), r, r * 0.72, 0.0))
    bio.add_lofted_profile_to_bm(bm_mot, mot_st, rings=16)
    bio.finish_bmesh_object("Motor_Cortex", bm_mot, mat_motor, parent=brain_root, collection=col)

    # Bilateral C-shaped Hippocampus
    bm_hip = bmesh.new()
    for sx in (-1.0, 1.0):
        hip_pts = [
            (sx * 0.20, 0.09, -0.19),
            (sx * 0.24, -0.02, -0.17),
            (sx * 0.23, -0.14, -0.09),
            (sx * 0.17, -0.21, 0.02),
            (sx * 0.10, -0.15, 0.10),
        ]
        bio.add_tube_along_points(bm_hip, hip_pts, [0.054, 0.048, 0.042, 0.034, 0.024], rings=14)
    bio.finish_bmesh_object("Hippocampus", bm_hip, mat_hippo, parent=brain_root, collection=col)

    bm_amy = bmesh.new()
    for sx in (-1.0, 1.0):
        bio.add_uv_sphere_to_bm(bm_amy, (sx * 0.20, 0.16, -0.18), (0.052, 0.062, 0.048), u_seg=14, v_seg=10)
    bio.finish_bmesh_object("Amygdala", bm_amy, mat_amyg, parent=brain_root, collection=col)

    bm_na = bmesh.new()
    for sx in (-1.0, 1.0):
        bio.add_uv_sphere_to_bm(bm_na, (sx * 0.10, 0.23, -0.06), (0.052, 0.065, 0.046), u_seg=14, v_seg=10)
    bio.finish_bmesh_object("Nucleus_Accumbens", bm_na, mat_nacc, parent=brain_root, collection=col)

    bm_hy = bmesh.new()
    bio.add_uv_sphere_to_bm(bm_hy, (0.0, 0.08, -0.12), (0.072, 0.078, 0.060), u_seg=14, v_seg=10)
    bio.finish_bmesh_object("Hypothalamus", bm_hy, mat_hypo, parent=brain_root, collection=col)

    bm_bs = bmesh.new()
    bs_st = []
    for i in range(10):
        t = i / 9.0
        z = -0.58 + t * 0.44
        y = -0.18 + t * 0.13
        pons_bulge = 0.038 * math.exp(-((t - 0.65) ** 2) / 0.06)
        r = 0.058 + t * 0.032 + pons_bulge
        bs_st.append(((0.0, y, z), r, r * 0.94, 0.0))
    bio.add_lofted_profile_to_bm(bm_bs, bs_st, rings=18)
    bio.finish_bmesh_object("Brainstem", bm_bs, mat_stem, parent=brain_root, collection=col)

    bm_vta = bmesh.new()
    bio.add_uv_sphere_to_bm(bm_vta, (0.0, -0.03, -0.16), (0.044, 0.040, 0.034), u_seg=12, v_seg=10)
    bio.finish_bmesh_object("VTA", bm_vta, mat_vta, parent=brain_root, collection=col)

    bm_lc = bmesh.new()
    for sx in (-1.0, 1.0):
        bio.add_uv_sphere_to_bm(bm_lc, (sx * 0.036, -0.13, -0.28), (0.022, 0.026, 0.036), u_seg=12, v_seg=10)
    bio.finish_bmesh_object("Locus_Coeruleus", bm_lc, mat_lc, parent=brain_root, collection=col)

    bm_rap = bmesh.new()
    for rz in (-0.22, -0.30, -0.40):
        bio.add_uv_sphere_to_bm(bm_rap, (0.0, -0.11, rz), (0.024, 0.024, 0.032), u_seg=10, v_seg=8)
    bio.finish_bmesh_object("Raphe_Nuclei", bm_rap, mat_raphe, parent=brain_root, collection=col)

    bm_cb = bmesh.new()
    for sx in (-1.0, 1.0):
        bio.add_uv_sphere_to_bm(bm_cb, (sx * 0.19, -0.36, -0.30), (0.19, 0.18, 0.14), u_seg=20, v_seg=14)
    bio.finish_bmesh_object("Cerebellum", bm_cb, mat_cereb, parent=brain_root, collection=col)


def build_neuron_and_synapse(root, col):
    """
    Smooth bulbous Presynaptic Bouton & Mushroom Postsynaptic Spine with 14-station organic lofting + Subsurf!
    """
    syn_root = bio.create_empty("Synapse_Hero_Assembly", (3.6, 0.0, 0.0), parent=root, collection=col)

    mat_pre = bio.make_pbr_material("Synapse_Presynaptic_Membrane", (0.14, 0.56, 0.80, 1.0), roughness=0.25, alpha=0.52, coat_weight=0.45)
    mat_post = bio.make_pbr_material("Synapse_Postsynaptic_Spine", (0.20, 0.70, 0.56, 1.0), roughness=0.26, alpha=0.56, coat_weight=0.4)
    mat_myelin = bio.make_pbr_material("Neuron_Myelin_Sheath", (0.86, 0.88, 0.94, 1.0), roughness=0.34, coat_weight=0.3)
    mat_axon = bio.make_pbr_material("Neuron_Axon_Core", (0.24, 0.84, 0.98, 1.0), roughness=0.24, emission_color=(0.2, 0.85, 1.0, 1.0), emission_strength=0.6)
    mat_ampa = bio.make_pbr_material("Receptor_AMPA", (0.24, 0.84, 0.98, 1.0), roughness=0.24, emission_color=(0.2, 0.8, 1.0, 1.0), emission_strength=0.45)
    mat_nmda = bio.make_pbr_material("Receptor_NMDA", (0.98, 0.66, 0.18, 1.0), roughness=0.24, emission_color=(0.98, 0.65, 0.15, 1.0), emission_strength=0.55)
    mat_gaba = bio.make_pbr_material("Receptor_GABAA", (0.56, 0.46, 0.98, 1.0), roughness=0.24, emission_color=(0.55, 0.45, 0.98, 1.0), emission_strength=0.45)
    mat_trkb = bio.make_pbr_material("Receptor_TrkB_Dimer", (0.98, 0.84, 0.24, 1.0), roughness=0.22, emission_color=(0.98, 0.84, 0.24, 1.0), emission_strength=0.65)
    mat_cb1 = bio.make_pbr_material("Receptor_CB1_Presyn", (0.18, 0.92, 0.58, 1.0), roughness=0.24, emission_color=(0.18, 0.92, 0.58, 1.0), emission_strength=0.55)
    mat_cav = bio.make_pbr_material("Channel_CaV", (0.96, 0.34, 0.42, 1.0), roughness=0.26, emission_color=(0.96, 0.34, 0.42, 1.0), emission_strength=0.45)
    mat_astro = bio.make_pbr_material("Astrocyte_Endfoot", (0.32, 0.54, 0.48, 1.0), roughness=0.45, alpha=0.40)

    bm_ax = bmesh.new()
    bio.add_tube_along_points(bm_ax, [(-2.4, 0.0, 0.0), (-1.4, 0.0, 0.0), (-0.58, 0.0, 0.0)], 0.062, rings=16)
    bio.finish_bmesh_object("Neuron_Axon_Shaft", bm_ax, mat_axon, parent=syn_root, collection=col)

    bm_my = bmesh.new()
    for mx in (-2.05, -1.45, -0.85):
        my_st = []
        for i in range(9):
            t = i / 8.0
            x = (mx - 0.22) + t * 0.44
            r = 0.066 + 0.052 * math.sin(math.pow(t, 0.7) * math.pi)
            my_st.append(((x, 0.0, 0.0), r, r, 0.0))
        bio.add_lofted_profile_to_bm(bm_my, my_st, rings=20, dome_factor=0.15)
    bio.finish_bmesh_object("Neuron_Myelin_Sheaths", bm_my, mat_myelin, parent=syn_root, collection=col)

    # Smooth bulbous Presynaptic Bouton (rounded dome ending flat at active zone X = -0.14)
    bm_pre = bmesh.new()
    pre_st = []
    for i in range(14):
        t = i / 13.0
        x = -0.60 + t * 0.46  # -0.60 -> -0.14
        # Sigmoidal flare into bulbous terminal, slight lip rounding at active zone
        flare = 0.065 + 0.34 * math.sin(t * math.pi * 0.58)
        if t > 0.88:
            flare *= (1.0 - (t - 0.88) * 1.4)
        pre_st.append(((x, 0.0, 0.0), flare, flare, 0.0))
    bio.add_lofted_profile_to_bm(bm_pre, pre_st, rings=30, dome_factor=0.06)
    bio.finish_bmesh_object("Presynaptic_Terminal", bm_pre, mat_pre, parent=syn_root, collection=col, subsurf_levels=1)

    # Smooth mushroom-shaped Postsynaptic Dendritic Spine (flat PSD face at local X = 0 -> world X = +0.14)
    spine_piv = bio.create_empty("Postsynaptic_Spine_Pivot", (0.14, 0.0, 0.0), parent=syn_root, collection=col)
    bm_post = bmesh.new()
    post_st = []
    for i in range(14):
        t = i / 13.0
        x = t * 0.72
        if t < 0.52:
            # Mushroom spine head
            u = t / 0.52
            r = 0.33 + 0.12 * math.sin(u * math.pi) - 0.18 * (u ** 3)
        else:
            # Slender spine neck flaring into dendrite shaft
            u = (t - 0.52) / 0.48
            r = 0.15 + 0.03 * math.sin(u * math.pi * 0.5)
        post_st.append(((x, 0.0, 0.0), r, r, 0.0))
    bio.add_lofted_profile_to_bm(bm_post, post_st, rings=30, dome_factor=0.06)
    bio.finish_bmesh_object("Postsynaptic_Dendritic_Spine", bm_post, mat_post, parent=spine_piv, collection=col, subsurf_levels=1)

    # Presynaptic CaV channels & CB1 receptors seated right onto terminal rim
    bm_cav = bmesh.new()
    for ang in (0.4, 1.9, 3.6, 5.1):
        bio.add_uv_sphere_to_bm(bm_cav, (-0.19, math.cos(ang) * 0.33, math.sin(ang) * 0.33), (0.038, 0.028, 0.028), u_seg=12, v_seg=10)
    bio.finish_bmesh_object("Channel_CaV_Group", bm_cav, mat_cav, parent=syn_root, collection=col)

    bm_cb1 = bmesh.new()
    for ang in (1.1, 2.7, 4.3):
        bio.add_uv_sphere_to_bm(bm_cb1, (-0.17, math.cos(ang) * 0.32, math.sin(ang) * 0.32), (0.034, 0.026, 0.026), u_seg=12, v_seg=10)
    bio.finish_bmesh_object("Receptor_CB1_Group", bm_cb1, mat_cb1, parent=syn_root, collection=col)

    def _build_receptor_cluster(rname, rmat, coords, is_dimer=False):
        bm_r = bmesh.new()
        for ry, rz in coords:
            if is_dimer:
                bio.add_uv_sphere_to_bm(bm_r, (-0.015, ry - 0.016, rz), (0.044, 0.020, 0.020), u_seg=12, v_seg=10)
                bio.add_uv_sphere_to_bm(bm_r, (-0.015, ry + 0.016, rz), (0.044, 0.020, 0.020), u_seg=12, v_seg=10)
            else:
                bio.add_tube_along_points(bm_r, [(-0.04, ry, rz), (0.0, ry, rz), (0.04, ry, rz)], [0.034, 0.030, 0.026], rings=12)
        bio.finish_bmesh_object(rname, bm_r, rmat, parent=spine_piv, collection=col)

    _build_receptor_cluster("Receptors_AMPA", mat_ampa, [(0.11, 0.08), (-0.13, -0.06), (0.02, -0.17), (-0.06, 0.15)])
    _build_receptor_cluster("Receptors_NMDA", mat_nmda, [(0.0, 0.0), (0.16, -0.11), (-0.15, 0.11)])
    _build_receptor_cluster("Receptors_GABAA", mat_gaba, [(0.22, 0.04), (-0.20, -0.08)])
    _build_receptor_cluster("Receptors_TrkB", mat_trkb, [(0.06, 0.21), (-0.08, -0.21)], is_dimer=True)

    bm_ast = bmesh.new()
    bio.add_uv_sphere_to_bm(bm_ast, (0.0, 0.48, 0.24), (0.22, 0.13, 0.16), u_seg=16, v_seg=12)
    bio.finish_bmesh_object("Astrocyte_Endfoot", bm_ast, mat_astro, parent=syn_root, collection=col)


def main():
    bio.clear_scene()
    col = bio.ensure_collection("BrainSynapse")
    root = bio.create_empty("BrainSynapse_Root", (0.0, 0.0, 0.0), collection=col)
    build_macro_brain(root, col)
    build_neuron_and_synapse(root, col)

    out_dir = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "public", "models"))
    os.makedirs(out_dir, exist_ok=True)
    bio.export_hierarchy_glb(root, os.path.join(out_dir, "brain_synapse.glb"))


if __name__ == "__main__":
    main()
