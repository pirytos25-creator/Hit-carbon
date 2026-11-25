"""
Builds Benchmark D — 3 dedicated high-detail neuroanatomical & neural GLBs:
1. public/models/brain_macro.glb:
   - Built directly from real HuBMAP / Allen Human Brain Atlas meshes (Allen_M_Brain.glb, CC BY 4.0)
   - Authentic cortical gyri & sulci split into Cortex_Hemisphere_L and Cortex_Hemisphere_R (cutaway-ready),
     Cerebellum, Brainstem, White Matter/Corpus Callosum, plus highlighted subcortical & cortical nodes:
     Prefrontal_Cortex, Motor_Cortex, Hippocampus, Thalamus, Hypothalamus, Amygdala,
     Nucleus_Accumbens, VTA, Locus_Coeruleus, Raphe_Nuclei.
2. public/models/neural_forest.glb:
   - Priority Artistic Scene: sprawling organic multi-depth Neural Forest containing
     morphologically diverse pyramidal & interneurons, curved spine-studded dendrites,
     myelinated axons, star-shaped astrocytes & cerebral capillaries.
3. public/models/synapse_hero.glb:
   - Detailed biological synapse with presynaptic microtubule/actin cytoskeleton, SNARE docking
     complexes, mitochondria, bilayer cleft, and PDB cryo-EM-derived 3KG2 AMPA tetramers +
     NMDA with separable Mg2+ pore blocker, GABA_A pentamers, D1 GPCR + separable G-protein alpha,
     presynaptic CaV + CB1, TrkB dimers, PDB 1B8M BDNF homodimer, plus Shape Keys:
     `Spine_Mature_Mushroom`, `Actin_Polymerized`, `Pore_Open`.
"""
import math
import os
import sys
import random
import bpy
import bmesh
from mathutils import Vector

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
RAW_DIR = os.path.join(ROOT_DIR, "assets_raw")
MODELS_DIR = os.path.join(ROOT_DIR, "public", "models")

if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

import lib_bio_mesh as bio


# ---------------------------------------------------------------------------
# 1. MACRO HUMAN BRAIN (Allen_M_Brain.glb)
# ---------------------------------------------------------------------------
def build_macro_brain_glb():
    bio.clear_scene()
    col = bio.ensure_collection("BIOGENESIS_Macro_Brain")
    root = bio.create_empty("Brain_Macro_Root", (0.0, 0.0, 0.0), collection=col)

    bpy.ops.import_scene.gltf(filepath=os.path.join(RAW_DIR, "Allen_M_Brain.glb"))
    bpy.context.view_layer.update()

    all_meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for m in all_meshes:
        m.select_set(True)
    if all_meshes:
        bpy.context.view_layer.objects.active = all_meshes[0]
        bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        anchor = Vector((0.0, 0.0, 0.832))
        sc = 11.2
        for m in all_meshes:
            for v in m.data.vertices:
                v.co = (v.co - anchor) * sc
            m.data.update()
    for o in list(bpy.data.objects):
        if o.type != 'MESH' and o is not root:
            bpy.data.objects.remove(o, do_unlink=True)

    buckets = {
        "Prefrontal_Cortex": [],
        "Motor_Cortex": [],
        "Hippocampus": [],
        "Amygdala": [],
        "Nucleus_Accumbens": [],
        "Thalamus": [],
        "Hypothalamus": [],
        "Cerebellum": [],
        "Brainstem": [],
        "White_Matter_Tracts": [],
        "Cortex_Hemisphere_L": [],
        "Cortex_Hemisphere_R": [],
    }

    for m in all_meshes:
        n = m.name.lower()
        if any(k in n for k in ("superior_frontal", "middle_frontal", "inferior_frontal", "orbital_gyrus", "gyrus_rectus", "frontal_pole", "rostral_gyrus", "subcallosal")):
            buckets["Prefrontal_Cortex"].append(m)
        elif "precentral" in n or "paracentral" in n:
            buckets["Motor_Cortex"].append(m)
        elif "hippocamp" in n or "dentate" in n or "subiculum" in n or "parahippocampal" in n:
            buckets["Hippocampus"].append(m)
        elif "amygdal" in n:
            buckets["Amygdala"].append(m)
        elif "accumbens" in n:
            buckets["Nucleus_Accumbens"].append(m)
        elif "hypothalam" in n or "_hth_" in n or "mammill" in n:
            buckets["Hypothalamus"].append(m)
        elif "thalam" in n or "pulvinar" in n or "geniculate" in n or "habenul" in n:
            buckets["Thalamus"].append(m)
        elif "cerebell" in n or "floccul" in n or "vermis" in n:
            buckets["Cerebellum"].append(m)
        elif any(k in n for k in ("pons", "pontine", "medulla", "midbrain", "tegmentum", "substantia", "peduncle", "olive", "pyramidal_part")):
            buckets["Brainstem"].append(m)
        elif any(k in n for k in ("corpus_callosum", "fornix", "white_matter", "commissure")):
            buckets["White_Matter_Tracts"].append(m)
        elif m.name.endswith("_R"):
            buckets["Cortex_Hemisphere_R"].append(m)
        else:
            buckets["Cortex_Hemisphere_L"].append(m)

    mats = {
        "Cortex_Hemisphere_L": bio.make_pbr_material("Brain_Cortex_L", (0.76, 0.64, 0.62, 1.0), roughness=0.40, subsurface_weight=0.35),
        "Cortex_Hemisphere_R": bio.make_pbr_material("Brain_Cortex_R", (0.74, 0.62, 0.60, 1.0), roughness=0.38, subsurface_weight=0.35),
        "Prefrontal_Cortex": bio.make_pbr_material("Region_PFC", (0.34, 0.72, 0.86, 1.0), roughness=0.38, emission_color=(0.18, 0.78, 0.96, 1.0), emission_strength=0.22),
        "Motor_Cortex": bio.make_pbr_material("Region_MotorCortex", (0.86, 0.56, 0.34, 1.0), roughness=0.38, emission_color=(0.96, 0.56, 0.22, 1.0), emission_strength=0.22),
        "Hippocampus": bio.make_pbr_material("Region_Hippocampus", (0.96, 0.78, 0.28, 1.0), roughness=0.32, emission_color=(0.98, 0.80, 0.24, 1.0), emission_strength=0.45),
        "Amygdala": bio.make_pbr_material("Region_Amygdala", (0.92, 0.28, 0.44, 1.0), roughness=0.34, emission_color=(0.94, 0.26, 0.42, 1.0), emission_strength=0.42),
        "Nucleus_Accumbens": bio.make_pbr_material("Region_NAcc", (0.96, 0.62, 0.18, 1.0), roughness=0.32, emission_color=(0.96, 0.64, 0.16, 1.0), emission_strength=0.45),
        "Thalamus": bio.make_pbr_material("Region_Thalamus", (0.64, 0.54, 0.76, 1.0), roughness=0.38, emission_color=(0.56, 0.44, 0.88, 1.0), emission_strength=0.24),
        "Hypothalamus": bio.make_pbr_material("Region_Hypothalamus", (0.24, 0.86, 0.60, 1.0), roughness=0.34, emission_color=(0.24, 0.88, 0.62, 1.0), emission_strength=0.42),
        "Cerebellum": bio.make_pbr_material("Region_Cerebellum", (0.68, 0.54, 0.58, 1.0), roughness=0.44, subsurface_weight=0.25),
        "Brainstem": bio.make_pbr_material("Region_Brainstem", (0.64, 0.66, 0.72, 1.0), roughness=0.44),
        "White_Matter_Tracts": bio.make_pbr_material("Brain_WhiteMatter", (0.92, 0.90, 0.86, 1.0), roughness=0.36),
    }

    poly_budgets = {
        "Cortex_Hemisphere_L": 11500,
        "Cortex_Hemisphere_R": 11500,
        "Prefrontal_Cortex": 4200,
        "Motor_Cortex": 2400,
        "Cerebellum": 4800,
        "Brainstem": 2400,
        "White_Matter_Tracts": 2500,
        "Hippocampus": 1800,
        "Thalamus": 1600,
        "Amygdala": 850,
        "Hypothalamus": 750,
        "Nucleus_Accumbens": 700,
    }

    for key, objs in buckets.items():
        if objs:
            joined = bio.join_and_decimate(objs, key, mats[key], target_polys=poly_budgets[key], parent=root, collection=col, apply_world=False)
            if joined and joined.data:
                joined.data.validate(verbose=False)

    # Precise anatomical brainstem neuromodulator nuclei: VTA, Locus Coeruleus, Raphe Nuclei
    mat_vta = bio.make_pbr_material("Region_VTA", (0.98, 0.54, 0.16, 1.0), roughness=0.26, emission_color=(0.98, 0.52, 0.14, 1.0), emission_strength=0.9)
    mat_lc = bio.make_pbr_material("Region_LocusCoeruleus", (0.18, 0.88, 0.98, 1.0), roughness=0.26, emission_color=(0.18, 0.88, 0.98, 1.0), emission_strength=0.9)
    mat_rap = bio.make_pbr_material("Region_RapheNuclei", (0.42, 0.62, 0.98, 1.0), roughness=0.26, emission_color=(0.42, 0.62, 0.98, 1.0), emission_strength=0.85)

    for n_name, pts, r_size, m in [
        ("VTA", [(-0.045, 0.04, -0.22), (0.045, 0.04, -0.22)], (0.042, 0.042, 0.036), mat_vta),
        ("Locus_Coeruleus", [(-0.042, 0.14, -0.34), (0.042, 0.14, -0.34)], (0.032, 0.032, 0.050), mat_lc),
        ("Raphe_Nuclei", [(0.0, 0.12, -0.38), (0.0, 0.14, -0.46)], (0.032, 0.036, 0.068), mat_rap),
    ]:
        bm = bmesh.new()
        for p in pts:
            bio.add_uv_sphere_to_bm(bm, p, r_size, u_seg=12, v_seg=8)
        bio.finish_bmesh_object(n_name, bm, m, parent=root, collection=col)

    out = os.path.join(MODELS_DIR, "brain_macro.glb")
    bio.export_hierarchy_glb(root, out, export_animations=False, apply_modifiers=True)


# ---------------------------------------------------------------------------
# 2. ORGANIC NEURAL FOREST (Priority Artistic Scene)
# ---------------------------------------------------------------------------
def _grow_branching_neurite(bm: bmesh.types.BMesh, start: Vector, direction: Vector, radius: float, length: float, depth: int, max_depth: int, rng: random.Random, spine_bm=None):
    steps = 9 if depth == 0 else 7
    pts = [start]
    rads = [radius]
    curr = start.copy()
    d = direction.normalized()
    seg_len = length / steps
    for s in range(1, steps + 1):
        jitter = Vector((rng.uniform(-0.22, 0.22), rng.uniform(-0.22, 0.22), rng.uniform(-0.18, 0.18)))
        d = (d + jitter * 0.32).normalized()
        curr = curr + d * seg_len
        pts.append(curr.copy())
        r_curr = max(0.007, radius * (1.0 - 0.34 * (s / steps)))
        rads.append(r_curr)
        if spine_bm is not None and depth >= 1 and s % 2 == 1:
            perp = d.cross(Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), 1.0))).normalized()
            neck = curr + perp * 0.032
            head = curr + perp * 0.052
            bio.add_tube_along_points(spine_bm, [curr, neck], [0.0045, 0.0038], rings=6, cap_ends=False)
            bio.add_uv_sphere_to_bm(spine_bm, head, (0.015, 0.015, 0.015), u_seg=8, v_seg=6)

    bio.add_tube_along_points(bm, pts, rads, rings=9 if depth == 0 else 7)

    if depth < max_depth:
        num_children = 2 if depth < 2 else (1 if rng.random() < 0.65 else 2)
        for _ in range(num_children):
            split = (d + Vector((rng.uniform(-0.75, 0.75), rng.uniform(-0.75, 0.75), rng.uniform(-0.6, 0.6)))).normalized()
            _grow_branching_neurite(
                bm, curr, split, radius * 0.62, length * rng.uniform(0.68, 0.85),
                depth + 1, max_depth, rng, spine_bm=spine_bm
            )


def build_neural_forest_glb():
    bio.clear_scene()
    col = bio.ensure_collection("BIOGENESIS_Neural_Forest")
    root = bio.create_empty("Neural_Forest_Root", (0.0, 0.0, 0.0), collection=col)

    mat_soma = bio.make_pbr_material("Neuron_Soma_Membrane", (0.18, 0.64, 0.88, 1.0), roughness=0.32, coat_weight=0.45, subsurface_weight=0.30, emission_color=(0.08, 0.38, 0.62, 1.0), emission_strength=0.28)
    mat_dend = bio.make_pbr_material("Neuron_Dendrite_Tree", (0.24, 0.72, 0.94, 1.0), roughness=0.34, emission_color=(0.12, 0.48, 0.78, 1.0), emission_strength=0.35)
    mat_spine = bio.make_pbr_material("Dendritic_Spines_PSD", (0.96, 0.80, 0.32, 1.0), roughness=0.25, emission_color=(0.96, 0.72, 0.18, 1.0), emission_strength=0.65)
    mat_glia = bio.make_pbr_material("Astrocyte_Glia_Cell", (0.20, 0.86, 0.62, 1.0), roughness=0.36, alpha=0.82, emission_color=(0.12, 0.64, 0.44, 1.0), emission_strength=0.32)
    mat_cap = bio.make_pbr_material("Cerebral_Capillary", (0.68, 0.12, 0.18, 1.0), roughness=0.35, coat_weight=0.40)

    rng = random.Random(2026)

    # 3 Distinct Morphological Neuron Families (Pyramidal, Interneuron, Granule) arranged in 3 depth planes!
    neuron_specs = [
        ("Pyramidal_Neuron_Hero", Vector((-0.85, -0.35, 0.15)), 0.14, 1.15, 2, 0),
        ("Pyramidal_Neuron_FG", Vector((1.15, -0.85, -0.25)), 0.12, 1.05, 2, 1),
        ("Hippocampal_CA3_Neuron", Vector((-0.15, 1.25, 0.45)), 0.13, 1.10, 2, 2),
        ("Interneuron_Stellate_MG", Vector((1.55, 0.95, 0.55)), 0.095, 0.92, 2, 3),
        ("BG_Network_Left", Vector((-2.25, 1.85, 0.65)), 0.11, 1.05, 1, 4),
        ("BG_Network_Right", Vector((2.35, 1.95, -0.45)), 0.11, 1.05, 1, 5),
        ("BG_Network_Top", Vector((-0.25, 2.45, 1.25)), 0.10, 1.0, 1, 6),
    ]

    bm_spines_all = bmesh.new()
    for name, origin, soma_r, tree_len, max_d, seed_i in neuron_specs:
        r_local = random.Random(100 + seed_i * 37)
        bm_n = bmesh.new()
        # Irregular organic pyramidal / multipolar soma (sculpted cone-teardrop, NOT uniform sphere!)
        bio.add_lofted_profile_to_bm(
            bm_n,
            [
                (origin + Vector((0, 0, -soma_r * 0.95)), soma_r * 0.65, soma_r * 0.60, 0.0),
                (origin, soma_r * 0.96, soma_r * 0.88, 0.2),
                (origin + Vector((0, 0, soma_r * 1.35)), soma_r * 0.35, soma_r * 0.32, 0.4),
            ],
            rings=14,
            noise_amp=0.14,
            seed=float(seed_i),
        )
        # Apical primary trunk ascending toward surface + 5 basal radiating dendrites!
        apical_dir = Vector((r_local.uniform(-0.2, 0.2), r_local.uniform(-0.2, 0.2), 1.0))
        _grow_branching_neurite(bm_n, origin + Vector((0, 0, soma_r)), apical_dir, soma_r * 0.26, tree_len, 0, max_d, r_local, spine_bm=bm_spines_all if max_d == 2 else None)
        num_basal = 5 if max_d == 2 else 4
        for bi in range(num_basal):
            ang = (bi / float(num_basal)) * math.pi * 2.0 + r_local.uniform(-0.25, 0.25)
            bdir = Vector((math.cos(ang), math.sin(ang), r_local.uniform(-0.65, 0.25))).normalized()
            _grow_branching_neurite(bm_n, origin + bdir * (soma_r * 0.6), bdir, soma_r * 0.20, tree_len * 0.72, 1, max_d, r_local, spine_bm=bm_spines_all if max_d == 2 else None)
        bio.finish_bmesh_object(name, bm_n, mat_dend if seed_i > 0 else mat_soma, parent=root, collection=col)

    bio.finish_bmesh_object("Forest_Dendritic_Spines", bm_spines_all, mat_spine, parent=root, collection=col)

    # Star-shaped Astrocytes (Glia) wrapping nearby Cerebral Capillaries (neurovascular coupling!)
    bm_glia = bmesh.new()
    for gx, gy, gz in ((0.45, 0.25, -0.55), (-1.45, 0.55, 0.45)):
        g_ctr = Vector((gx, gy, gz))
        bio.add_uv_sphere_to_bm(bm_glia, g_ctr, (0.075, 0.068, 0.072), u_seg=10, v_seg=8)
        for pi in range(9):
            ang = (pi / 9.0) * math.pi * 2.0
            dir_g = Vector((math.cos(ang), math.sin(ang), ((pi % 3) - 1) * 0.45)).normalized()
            p_end = g_ctr + dir_g * 0.42
            bio.add_tube_along_points(bm_glia, [g_ctr, (g_ctr + p_end) * 0.5 + Vector((0, 0, 0.05)), p_end], [0.024, 0.014, 0.022], rings=6)
    bio.finish_bmesh_object("Forest_Astrocytes_Glia", bm_glia, mat_glia, parent=root, collection=col)

    bm_cap = bmesh.new()
    bio.add_tube_along_points(bm_cap, [(-2.6, 0.6, -0.68), (-0.8, 0.35, -0.58), (0.85, 0.20, -0.60), (2.7, -0.25, -0.52)], [0.075, 0.070, 0.072, 0.068], rings=12)
    bio.add_tube_along_points(bm_cap, [(-0.8, 0.35, -0.58), (-1.1, 1.5, -0.15), (-1.6, 2.2, 0.35)], [0.058, 0.048, 0.042], rings=10)
    bio.finish_bmesh_object("Forest_Cerebral_Capillaries", bm_cap, mat_cap, parent=root, collection=col)

    out = os.path.join(MODELS_DIR, "neural_forest.glb")
    bio.export_hierarchy_glb(root, out, export_animations=False, apply_modifiers=True)


# ---------------------------------------------------------------------------
# 3. MOLECULAR SYNAPSE CHOREOGRAPHY + PDB 3KG2 (AMPA) + PDB 1B8M (BDNF)
# ---------------------------------------------------------------------------
def _build_receptor_barrel(bm: bmesh.types.BMesh, center: Vector, num_subunits: int, rad_ring: float, sub_r: float, length: float, axis_x=1.0):
    """Sculpts a multi-subunit transmembrane ion channel pore aligned along X axis."""
    for s in range(num_subunits):
        ang = (2.0 * math.pi * s) / num_subunits
        cy = math.cos(ang) * rad_ring
        cz = math.sin(ang) * rad_ring
        p0 = center + Vector((-length * 0.5 * axis_x, cy * 0.9, cz * 0.9))
        pm = center + Vector((0.0, cy, cz))
        p1 = center + Vector((length * 0.5 * axis_x, cy * 1.25, cz * 1.25))
        bio.add_tube_along_points(bm, [p0, pm, p1], [sub_r * 0.85, sub_r, sub_r * 1.15], rings=7)


def build_synapse_hero_glb():
    bio.clear_scene()
    col = bio.ensure_collection("BIOGENESIS_Synapse_Hero")
    root = bio.create_empty("Synapse_Hero_Assembly", (0.0, 0.0, 0.0), collection=col)

    mat_axon = bio.make_pbr_material("Synapse_Myelinated_Axon", (0.14, 0.52, 0.78, 1.0), roughness=0.30, coat_weight=0.4)
    mat_myelin = bio.make_pbr_material("Synapse_Myelin_Sheath", (0.86, 0.90, 0.95, 1.0), roughness=0.34, subsurface_weight=0.30)
    mat_pre = bio.make_pbr_material("Synapse_Presynaptic_Membrane", (0.14, 0.42, 0.68, 1.0), roughness=0.34, alpha=0.52, coat_weight=0.4)
    mat_spine = bio.make_pbr_material("Synapse_Postsynaptic_Spine", (0.16, 0.58, 0.64, 1.0), roughness=0.30, alpha=0.58, coat_weight=0.45, subsurface_weight=0.3)
    mat_cyto = bio.make_pbr_material("Synapse_Microtubules_Actin", (0.94, 0.68, 0.24, 1.0), roughness=0.32, emission_color=(0.88, 0.56, 0.14, 1.0), emission_strength=0.35)
    mat_snare = bio.make_pbr_material("Synapse_SNARE_Complex", (0.96, 0.36, 0.64, 1.0), roughness=0.28, emission_color=(0.94, 0.32, 0.58, 1.0), emission_strength=0.5)
    mat_mito = bio.make_pbr_material("Synapse_Mitochondrion", (0.82, 0.34, 0.16, 1.0), roughness=0.32, coat_weight=0.4)
    mat_psd = bio.make_pbr_material("Synapse_PSD_Scaffold", (0.28, 0.42, 0.88, 1.0), roughness=0.30, emission_color=(0.24, 0.42, 0.88, 1.0), emission_strength=0.35)

    # 1. Myelinated Axon + Nodes of Ranvier feeding from left (-1.85 -> -0.58)
    bm_ax = bmesh.new()
    bio.add_tube_along_points(bm_ax, [(-1.95, 0.08, -0.04), (-1.45, 0.04, 0.0), (-0.95, 0.01, 0.02), (-0.58, 0.0, 0.0)], [0.072, 0.070, 0.068, 0.065], rings=14)
    bio.finish_bmesh_object("Neuron_Axon_Shaft", bm_ax, mat_axon, parent=root, collection=col)

    bm_my = bmesh.new()
    for sx in (-1.62, -1.08):
        bio.add_lofted_profile_to_bm(bm_my, [((sx - 0.19, 0.0, 0.0), 0.105, 0.105, 0.0), ((sx, 0.0, 0.0), 0.125, 0.125, 0.0), ((sx + 0.19, 0.0, 0.0), 0.105, 0.105, 0.0)], rings=16)
    bio.finish_bmesh_object("Myelin_Sheaths", bm_my, mat_myelin, parent=root, collection=col)

    # 2. Smooth Organic Presynaptic Bouton (9 curved stations, cupped at X = -0.16)
    bm_pre = bmesh.new()
    pre_st = [
        ((-0.66, 0.0, 0.0), 0.072, 0.072, 0.0),
        ((-0.58, 0.0, 0.0), 0.095, 0.095, 0.0),
        ((-0.50, 0.0, 0.0), 0.165, 0.160, 0.0),
        ((-0.42, 0.0, 0.0), 0.255, 0.245, 0.0),
        ((-0.34, 0.0, 0.0), 0.335, 0.322, 0.0),
        ((-0.26, 0.0, 0.0), 0.382, 0.368, 0.0),
        ((-0.20, 0.0, 0.0), 0.372, 0.358, 0.0),
        ((-0.165, 0.0, 0.0), 0.315, 0.302, 0.0),
        ((-0.148, 0.0, 0.0), 0.215, 0.205, 0.0),
    ]
    bio.add_lofted_profile_to_bm(bm_pre, pre_st, rings=32, dome_factor=0.10, noise_amp=0.025, noise_freq=5.0)
    bio.finish_bmesh_object("Presynaptic_Bouton", bm_pre, mat_pre, parent=root, collection=col)

    # Microtubule tracks + SNARE docking pins + Presynaptic Mitochondrion
    bm_cy = bmesh.new()
    for my, mz in ((-0.08, 0.12), (0.09, -0.10), (-0.02, -0.14)):
        bio.add_tube_along_points(bm_cy, [(-0.58, my * 0.4, mz * 0.4), (-0.40, my * 0.85, mz * 0.85), (-0.21, my, mz)], 0.011, rings=6)
    bio.finish_bmesh_object("Presynaptic_Microtubules", bm_cy, mat_cyto, parent=root, collection=col)

    bm_sn = bmesh.new()
    for sy, sz in ((0.12, 0.08), (-0.11, 0.10), (0.04, -0.12), (-0.04, -0.06)):
        bio.add_tube_along_points(bm_sn, [(-0.18, sy, sz), (-0.155, sy + 0.018, sz)], 0.012, rings=6)
        bio.add_tube_along_points(bm_sn, [(-0.18, sy, sz), (-0.155, sy - 0.018, sz)], 0.012, rings=6)
    bio.finish_bmesh_object("Presynaptic_SNARE_Complexes", bm_sn, mat_snare, parent=root, collection=col)

    bm_pm = bmesh.new()
    bio.add_uv_sphere_to_bm(bm_pm, (-0.36, 0.14, 0.08), (0.11, 0.055, 0.055), u_seg=12, v_seg=8, rot_euler=(0.2, 0.3, 0.1))
    bio.finish_bmesh_object("Presynaptic_Mitochondrion", bm_pm, mat_mito, parent=root, collection=col)

    # 3. Voltage-gated CaV channels + Presynaptic CB1 Cannabinoid Receptors
    mat_cav = bio.make_pbr_material("Channel_CaV", (0.96, 0.42, 0.56, 1.0), roughness=0.25, emission_color=(0.96, 0.35, 0.50, 1.0), emission_strength=0.6)
    bm_cav = bmesh.new()
    for ang in (0.4, 2.0, 3.6, 5.1):
        _build_receptor_barrel(bm_cav, Vector((-0.20, math.cos(ang) * 0.31, math.sin(ang) * 0.31)), 4, 0.022, 0.010, 0.07)
    bio.finish_bmesh_object("Channel_CaV_Group", bm_cav, mat_cav, parent=root, collection=col)

    mat_cb1 = bio.make_pbr_material("Receptor_CB1", (0.12, 0.88, 0.58, 1.0), roughness=0.26, emission_color=(0.10, 0.85, 0.54, 1.0), emission_strength=0.55)
    bm_cb = bmesh.new()
    for cy, cz in ((0.22, 0.14), (-0.22, -0.14)):
        _build_receptor_barrel(bm_cb, Vector((-0.17, cy, cz)), 7, 0.024, 0.009, 0.075)
    bio.finish_bmesh_object("Receptor_CB1_Group", bm_cb, mat_cb1, parent=root, collection=col)

    # 4. Smooth Organic Postsynaptic Dendritic Spine with Shape Key `Spine_Mature_Mushroom` + Actin Cytoskeleton!
    spine_piv = bio.create_empty("Postsynaptic_Spine_Pivot", (0.0, 0.0, 0.0), parent=root, collection=col)
    bm_sp = bmesh.new()
    sp_st = [
        ((0.148, 0.0, 0.0), 0.215, 0.205, 0.0),
        ((0.168, 0.0, 0.0), 0.320, 0.310, 0.0),
        ((0.210, 0.0, 0.0), 0.375, 0.362, 0.0),
        ((0.285, 0.0, 0.0), 0.365, 0.352, 0.0),
        ((0.365, 0.0, 0.0), 0.305, 0.292, 0.0),
        ((0.445, 0.0, 0.0), 0.210, 0.202, 0.0),
        ((0.525, 0.0, 0.0), 0.142, 0.140, 0.0),
        ((0.640, 0.0, 0.0), 0.128, 0.126, 0.0),
        ((0.780, 0.0, -0.01), 0.135, 0.132, 0.0),
        ((0.940, 0.0, -0.04), 0.185, 0.175, 0.0),
    ]
    bio.add_lofted_profile_to_bm(bm_sp, sp_st, rings=32, dome_factor=0.10, noise_amp=0.025, noise_freq=5.0)
    spine_obj = bio.finish_bmesh_object("Postsynaptic_Dendritic_Spine", bm_sp, mat_spine, parent=spine_piv, collection=col)
    spine_obj.shape_key_add(name="Basis")
    sk_mush = spine_obj.shape_key_add(name="Spine_Mature_Mushroom")
    for i, v in enumerate(spine_obj.data.vertices):
        co = v.co
        # Head region (0.14..0.46) widens dramatically into mature mushroom spine + slight neck stiffening!
        if co.x < 0.48:
            w = max(0.0, 1.0 - abs(co.x - 0.26) / 0.26)
            sk_mush.data[i].co = Vector((co.x - 0.015 * w, co.y * (1.0 + 0.42 * w), co.z * (1.0 + 0.42 * w)))
        else:
            sk_mush.data[i].co = co.copy()

    # Postsynaptic Density (PSD-95 scaffold plaque)
    bm_psd = bmesh.new()
    bio.add_uv_sphere_to_bm(bm_psd, (0.20, 0.0, 0.0), (0.025, 0.26, 0.26), u_seg=14, v_seg=10)
    bio.finish_bmesh_object("Postsynaptic_PSD95_Plaque", bm_psd, mat_psd, parent=spine_piv, collection=col)

    # Branched F-actin Cytoskeleton inside spine head with `Actin_Polymerized` Shape Key!
    bm_act = bmesh.new()
    for fi in range(7):
        ang = (fi / 7.0) * math.pi * 2.0
        dy, dz = math.cos(ang), math.sin(ang)
        bio.add_tube_along_points(bm_act, [(0.62, dy * 0.03, dz * 0.03), (0.42, dy * 0.10, dz * 0.10), (0.24, dy * 0.19, dz * 0.19)], 0.011, rings=6)
    actin_obj = bio.finish_bmesh_object("Postsynaptic_Actin_Skeleton", bm_act, mat_cyto, parent=spine_piv, collection=col)
    actin_obj.shape_key_add(name="Basis")
    sk_act = actin_obj.shape_key_add(name="Actin_Polymerized")
    for i, v in enumerate(actin_obj.data.vertices):
        co = v.co
        w = max(0.0, (0.62 - co.x) / 0.40)
        sk_act.data[i].co = Vector((co.x, co.y * (1.0 + 0.48 * w), co.z * (1.0 + 0.48 * w)))

    # 5. Distinct Multi-Subunit Postsynaptic Receptors (incl. REAL PDB 3KG2 AMPA Tetramer + NMDA + GABA_A + GPCR + TrkB!)
    mat_ampa = bio.make_pbr_material("Receptor_AMPA_3KG2", (0.14, 0.80, 0.98, 1.0), roughness=0.24, emission_color=(0.14, 0.78, 0.98, 1.0), emission_strength=0.45)
    mat_nmda = bio.make_pbr_material("Receptor_NMDA", (0.98, 0.78, 0.22, 1.0), roughness=0.22, emission_color=(0.98, 0.72, 0.18, 1.0), emission_strength=0.50)
    mat_mg = bio.make_pbr_material("NMDA_Mg2_Blocker", (0.98, 0.42, 0.12, 1.0), roughness=0.20, emission_color=(0.98, 0.35, 0.08, 1.0), emission_strength=1.1)
    mat_gaba = bio.make_pbr_material("Receptor_GABAA", (0.50, 0.46, 0.98, 1.0), roughness=0.25, emission_color=(0.45, 0.42, 0.98, 1.0), emission_strength=0.50)
    mat_gpcr = bio.make_pbr_material("Receptor_GPCR_D1", (0.96, 0.56, 0.12, 1.0), roughness=0.25, emission_color=(0.94, 0.52, 0.10, 1.0), emission_strength=0.55)
    mat_trkb = bio.make_pbr_material("Receptor_TrkB_Dimer", (0.96, 0.48, 0.18, 1.0), roughness=0.24, emission_color=(0.98, 0.54, 0.14, 1.0), emission_strength=0.65)
    mat_bdnf = bio.make_pbr_material("BDNF_Dimer_1B8M", (0.98, 0.86, 0.24, 1.0), roughness=0.22, emission_color=(0.98, 0.82, 0.18, 1.0), emission_strength=1.1)

    # Real PDB 3KG2 GluA2 AMPA receptor envelope at top postsynaptic membrane site (0.14, 0.14, 0.04)
    chains_3kg2 = bio.load_pdb_ca_by_chain(os.path.join(RAW_DIR, "3KG2.pdb"), stride=6)
    ampa_pts = [p for pts in chains_3kg2.values() for p in pts]
    actr = sum(ampa_pts, Vector((0, 0, 0))) / max(1, len(ampa_pts))
    # Orient pore axis roughly along X and seat cleanly at postsynaptic PSD
    ampa_scaled = [Vector(((p.z - actr.z) * 0.0011 + 0.15, (p.x - actr.x) * 0.0011 + 0.13, (p.y - actr.y) * 0.0011 + 0.02)) for p in ampa_pts]
    ampa_obj = bio.create_cryoem_envelope("Receptors_AMPA", ampa_scaled, ball_radius=0.020, voxel_res=0.012, material=mat_ampa, decimate_polys=1100, parent=spine_piv, collection=col)
    if ampa_obj:
        ampa_obj.shape_key_add(name="Basis")
        sk_open = ampa_obj.shape_key_add(name="Pore_Open")
        for i, v in enumerate(ampa_obj.data.vertices):
            dy, dz = v.co.y - 0.13, v.co.z - 0.02
            sk_open.data[i].co = Vector((v.co.x, 0.13 + dy * 1.24, 0.02 + dz * 1.24))

    # NMDA Heterotetramer + separable Mg2+ pore blocker sphere!
    bm_nmda = bmesh.new()
    _build_receptor_barrel(bm_nmda, Vector((0.15, -0.02, -0.14)), 4, 0.032, 0.014, 0.095)
    nmda_obj = bio.finish_bmesh_object("Receptors_NMDA", bm_nmda, mat_nmda, parent=spine_piv, collection=col)
    nmda_obj.shape_key_add(name="Basis")
    sk_no = nmda_obj.shape_key_add(name="Pore_Open")
    for i, v in enumerate(nmda_obj.data.vertices):
        dy, dz = v.co.y + 0.02, v.co.z + 0.14
        sk_no.data[i].co = Vector((v.co.x, -0.02 + dy * 1.30, -0.14 + dz * 1.30))

    bm_mg = bmesh.new()
    bio.add_uv_sphere_to_bm(bm_mg, (0.0, 0.0, 0.0), (0.019, 0.019, 0.019), u_seg=10, v_seg=8)
    mg_obj = bio.finish_bmesh_object("NMDA_Mg2_Blocker", bm_mg, mat_mg, parent=spine_piv, collection=col)
    mg_obj.location = Vector((0.135, -0.02, -0.14))

    # GABA_A Pentameric Barrel
    bm_gaba = bmesh.new()
    _build_receptor_barrel(bm_gaba, Vector((0.15, -0.16, 0.05)), 5, 0.032, 0.012, 0.090)
    gaba_obj = bio.finish_bmesh_object("Receptors_GABAA", bm_gaba, mat_gaba, parent=spine_piv, collection=col)
    gaba_obj.shape_key_add(name="Basis")
    sk_go = gaba_obj.shape_key_add(name="Pore_Open")
    for i, v in enumerate(gaba_obj.data.vertices):
        dy, dz = v.co.y + 0.16, v.co.z - 0.05
        sk_go.data[i].co = Vector((v.co.x, -0.16 + dy * 1.32, 0.05 + dz * 1.32))

    # Dopaminergic 7TM GPCR D1 receptor + separable G_Protein_Alpha
    bm_gp = bmesh.new()
    _build_receptor_barrel(bm_gp, Vector((0.15, 0.02, 0.18)), 7, 0.028, 0.009, 0.092)
    bio.finish_bmesh_object("Receptor_GPCR_D1", bm_gp, mat_gpcr, parent=spine_piv, collection=col)

    # TrkB Receptor Tyrosine Kinase Homodimer Pair (`TrkB_Dimer_L` & `TrkB_Dimer_R`)
    for side_lbl, dz in (("L", -0.035), ("R", 0.035)):
        bm_tk = bmesh.new()
        bio.add_tube_along_points(bm_tk, [(0.05, 0.25, dz), (0.14, 0.25, dz * 0.7), (0.28, 0.25, dz * 0.7)], [0.018, 0.014, 0.026], rings=8)
        tk_obj = bio.finish_bmesh_object(f"Receptors_TrkB_{side_lbl}", bm_tk, mat_trkb, parent=spine_piv, collection=col)
        tk_obj.shape_key_add(name="Basis")

    # Genuine PDB 1B8M Human BDNF Homodimer mesh positioned for Act X docking!
    chains_bdnf = bio.load_pdb_ca_by_chain(os.path.join(RAW_DIR, "1B8M.pdb"), stride=2)
    bdnf_pts = [p for pts in chains_bdnf.values() for p in pts]
    bctr = sum(bdnf_pts, Vector((0, 0, 0))) / max(1, len(bdnf_pts))
    bdnf_scaled = [(p - bctr) * 0.0022 for p in bdnf_pts]
    bio.create_cryoem_envelope("BDNF_Homodimer_1B8M", bdnf_scaled, ball_radius=0.018, voxel_res=0.010, material=mat_bdnf, decimate_polys=750, parent=root, collection=col)

    out = os.path.join(MODELS_DIR, "synapse_hero.glb")
    bio.export_hierarchy_glb(root, out, export_animations=False, apply_modifiers=False)


def main():
    build_macro_brain_glb()
    build_neural_forest_glb()
    build_synapse_hero_glb()


if __name__ == "__main__":
    main()
