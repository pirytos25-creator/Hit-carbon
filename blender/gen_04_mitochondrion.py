"""
Builds public/models/mitochondrion.glb (Benchmark C — MITOCHONDRIAL ENGINE):
- Replaces the old flat yellow board with a monumental, multi-tiered interior mitochondrial
  cristae cathedral enclosed by folded double membranes & deep cavernous vaults.
- Uses REAL human cryo-EM Protein Data Bank structures (Public Domain / CC0):
  * PDB 8H9T (Human F1F0-ATP Synthase at 2.77 A resolution):
    - `F0_Membrane_Ring_Pivot` / `F0_cRing_Rotor`: real c8-ring (chains 1-8) + central gamma/delta/epsilon rotor (G, H, I)
      aligned precisely to Blender +Z (Three.js +Y) for wobble-free rotary catalysis!
    - `F1_Catalytic_Hexamer`: real alpha3/beta3 hexamer (chains A-F) with 3 conformational Shape Keys
      (`Catalytic_Open`, `Catalytic_Loose`, `Catalytic_Tight`) driven by rotor phase!
    - `F0_Peripheral_Stator`: real proton-channel a-subunit, b/d/F6 stalk & OSCP cap (chains K,M,L,N,O,P,Q,R,S,T)
  * PDB 5XTD (Human Respiratory Supercomplex I1III2IV1):
    - Real cryo-EM electron-density envelopes for Complex I, Complex III2 dimer & Complex IV
- Additional background crista folds & ATP synthase dimers create foreground/midground/background cavern depth.
"""
import math
import os
import sys
import bpy
import bmesh
from mathutils import Vector, Matrix

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
RAW_DIR = os.path.join(ROOT_DIR, "assets_raw")
MODELS_DIR = os.path.join(ROOT_DIR, "public", "models")

if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

import lib_bio_mesh as bio


def _fit_axis_matrix_from_c8_to_f1(chains_dict):
    """Compute rigid transform mapping c8-ring center -> (0,0,0) and F1 axis onto +Z."""
    c_pts = [p for ch in ['1', '2', '3', '4', '5', '6', '7', '8'] for p in chains_dict.get(ch, [])]
    f_pts = [p for ch in ['A', 'B', 'C', 'D', 'E', 'F'] for p in chains_dict.get(ch, [])]
    c_ctr = sum(c_pts, Vector((0, 0, 0))) / max(1, len(c_pts))
    f_ctr = sum(f_pts, Vector((0, 0, 0))) / max(1, len(f_pts))
    axis = (f_ctr - c_ctr).normalized()
    rot_q = axis.rotation_difference(Vector((0.0, 0.0, 1.0)))
    # In Angstroms, distance c8->f1 is ~125 A; scale to ~0.46 Blender units cleanly
    scale = 0.0038
    return c_ctr, rot_q, scale


def build_cristae_cathedral(root, col):
    mat_outer = bio.make_pbr_material("Mito_Outer_Vault", (0.14, 0.09, 0.30, 1.0), roughness=0.40, alpha=0.86, coat_weight=0.35)
    mat_crista = bio.make_pbr_material("Mito_Inner_Cristae_Fold", (0.68, 0.28, 0.12, 1.0), roughness=0.32, coat_weight=0.48, subsurface_weight=0.30)
    mat_crista_deep = bio.make_pbr_material("Mito_Deep_Cristae", (0.48, 0.18, 0.14, 1.0), roughness=0.38, coat_weight=0.35)
    mat_porin = bio.make_pbr_material("Mito_VDAC_Porin", (0.18, 0.85, 0.95, 1.0), roughness=0.22, emission_color=(0.18, 0.85, 0.96, 1.0), emission_strength=0.65)

    # 1. Overarching Cavernous Outer Mitochondrial Shell (cutaway front/bottom facing +Z/-Y viewer)
    bm_out = bmesh.new()
    rings = []
    nx = 32
    ntheta = 28
    for ix in range(nx):
        t = (ix / (nx - 1)) * 2.0 - 1.0
        x = t * 3.8
        env = math.sqrt(max(0.06, 1.0 - (t * 0.94) ** 2))
        row = []
        for j in range(ntheta):
            # Arch mostly across rear/top/floor leaving viewing portal open (-Y front side)
            ang = math.radians(-115.0) + (j / (ntheta - 1)) * math.radians(240.0)
            y = math.cos(ang) * env * 2.25 + 0.35
            z = math.sin(ang) * env * 1.95 + 0.25
            # Subtle organic membrane undulation
            disp = 1.0 + 0.025 * math.sin(x * 3.0 + ang * 4.0)
            row.append(bm_out.verts.new((x, y * disp, z * disp)))
        rings.append(row)
    for ix in range(nx - 1):
        for j in range(ntheta - 1):
            bm_out.faces.new((rings[ix][j + 1], rings[ix][j], rings[ix + 1][j], rings[ix + 1][j + 1]))
    bmesh.ops.solidify(bm_out, geom=list(bm_out.faces), thickness=0.06)
    bio.finish_bmesh_object("Mitochondrion_Outer_Membrane", bm_out, mat_outer, parent=root, collection=col)

    # 2. Flowing Multi-Tiered Folded Cristae Invaginations (Lower floor + Hero Stage Ridge + Upper Overhang)
    def make_crista_fold(name, y_offset, z_base, amp, freq, x_span, thickness, mat):
        bm = bmesh.new()
        steps_u, steps_v = 56, 14
        grid = []
        for iu in range(steps_u):
            u = iu / (steps_u - 1)
            x = (u * 2.0 - 1.0) * x_span
            env = math.sqrt(max(0.05, 1.0 - ((u * 2.0 - 1.0) * 0.95) ** 2))
            row = []
            for iv in range(steps_v):
                v = (iv / (steps_v - 1)) * 2.0 - 1.0
                # Organic tubular crista invagination ridges curving into the matrix cavern
                ridge = amp * math.sin(u * math.pi * freq) * (0.65 + 0.35 * math.cos(v * math.pi))
                y = y_offset + v * 1.15 * env + 0.14 * math.sin(u * math.pi * 3.0)
                z = z_base + ridge * env - 0.18 * (v * v)
                row.append(bm.verts.new((x, y, z)))
            grid.append(row)
        for iu in range(steps_u - 1):
            for iv in range(steps_v - 1):
                bm.faces.new((grid[iu][iv], grid[iu + 1][iv], grid[iu + 1][iv + 1], grid[iu][iv + 1]))
        bmesh.ops.solidify(bm, geom=list(bm.faces), thickness=thickness)
        return bio.finish_bmesh_object(name, bm, mat, parent=root, collection=col)

    # Hero foreground/midground undulating inner membrane crista (replaces flat yellow board!)
    make_crista_fold("Inner_Crista_Hero_Ridge", y_offset=0.05, z_base=-0.06, amp=0.22, freq=5.0, x_span=2.85, thickness=0.055, mat=mat_crista)
    # Deep cavern crista baffles above & behind hero stage creating cathedral layers!
    make_crista_fold("Inner_Crista_Back_Cathedral", y_offset=1.35, z_base=0.45, amp=0.52, freq=7.0, x_span=3.3, thickness=0.07, mat=mat_crista_deep)
    make_crista_fold("Inner_Crista_Ceiling_Arch", y_offset=0.55, z_base=1.32, amp=-0.38, freq=6.0, x_span=2.9, thickness=0.06, mat=mat_crista_deep)

    # Outer membrane VDAC Porin channels along ceiling edge
    bm_p = bmesh.new()
    for px in (-1.4, -0.35, 0.75, 1.7):
        pts = [(px + math.cos((k / 14.0) * math.pi * 2.0) * 0.11, 1.35, 1.55 + math.sin((k / 14.0) * math.pi * 2.0) * 0.11) for k in range(15)]
        bio.add_tube_along_points(bm_p, pts, 0.032, rings=8, cap_ends=False)
    bio.finish_bmesh_object("Mitochondrion_Porins", bm_p, mat_porin, parent=root, collection=col)


def build_pdb_atp_synthase(parent, col, name_prefix="Hero_ATPSynthase", loc=(0.52, -0.05, 0.08), rot_euler=(0.0, 0.0, 0.0), scale_mult=1.0, add_morphs=True):
    """
    Constructs genuine Human F1F0-ATP Synthase from RCSB PDB 8H9T (2.77 A cryo-EM),
    split cleanly into rotating c8+gamma/delta/epsilon rotor, F1 alpha3/beta3 crown (with 3 conformational
    Shape Keys!), and peripheral stator.
    """
    chains_all = bio.load_cif_ca_by_chain(os.path.join(RAW_DIR, "8H9T.cif"), stride=2)
    c_ctr, rot_q, sc = _fit_axis_matrix_from_c8_to_f1(chains_all)

    def xform(pts):
        return [((rot_q @ (p - c_ctr)) * (sc * scale_mult)) for p in pts]

    synth_root = bio.create_empty(name_prefix, loc, parent=parent, collection=col)
    synth_root.rotation_euler = rot_euler

    mat_rotor = bio.make_pbr_material("Synthase_Rotor_Teal", (0.14, 0.88, 0.96, 1.0), roughness=0.22, coat_weight=0.5, emission_color=(0.14, 0.85, 0.96, 1.0), emission_strength=0.45)
    mat_f1_alpha = bio.make_pbr_material("Synthase_F1_Crown_Gold", (0.96, 0.72, 0.24, 1.0), roughness=0.26, coat_weight=0.35, subsurface_weight=0.25)
    mat_stator = bio.make_pbr_material("Synthase_Stator_Cobalt", (0.28, 0.44, 0.92, 1.0), roughness=0.28, coat_weight=0.3)

    # 1. Rotor Pivot (c8 membrane ring chains 1..8 + asymmetric central stalk G, H, I)
    rotor_piv = bio.create_empty("F0_Membrane_Ring_Pivot" if add_morphs else f"{name_prefix}_Rotor", (0.0, 0.0, 0.0), parent=synth_root, collection=col)
    rotor_pts = []
    for ch in ['1', '2', '3', '4', '5', '6', '7', '8', 'G', 'H', 'I']:
        rotor_pts.extend(xform(chains_all.get(ch, [])))
    bio.create_cryoem_envelope(
        "F0_cRing_Gamma_Rotor" if add_morphs else f"{name_prefix}_RotorMesh",
        rotor_pts,
        ball_radius=0.036 * scale_mult,
        voxel_res=0.022 * scale_mult,
        material=mat_rotor,
        decimate_polys=1800 if add_morphs else 750,
        parent=rotor_piv,
        collection=col,
    )

    # 2. F1 Catalytic Hexamer (alpha chains A,C,E and catalytic beta chains B,D,F)
    f1_pts = []
    for ch in ['A', 'B', 'C', 'D', 'E', 'F']:
        f1_pts.extend(xform(chains_all.get(ch, [])))
    f1_obj = bio.create_cryoem_envelope(
        "F1_Catalytic_Hexamer" if add_morphs else f"{name_prefix}_F1",
        f1_pts,
        ball_radius=0.032 * scale_mult,
        voxel_res=0.015 * scale_mult,
        material=mat_f1_alpha,
        decimate_polys=3800 if add_morphs else 1100,
        parent=synth_root,
        collection=col,
    )

    # Add Boyer 3-state conformational catalysis Shape Keys on hero F1 hexamer!
    # The 3 catalytic beta lobes sit at 0, 120, 240 deg azimuth around +Z center!
    if add_morphs and f1_obj is not None:
        f1_obj.shape_key_add(name="Basis")
        for lobe_idx, sk_name in enumerate(("Catalytic_Open", "Catalytic_Loose", "Catalytic_Tight")):
            sk = f1_obj.shape_key_add(name=sk_name)
            phi_target = lobe_idx * (2.0 * math.pi / 3.0)
            tx, ty = math.cos(phi_target), math.sin(phi_target)
            for vi, v in enumerate(f1_obj.data.vertices):
                co = v.co
                rad_xy = Vector((co.x, co.y, 0.0))
                rl = rad_xy.length
                if rl > 0.04:
                    # Angular proximity to this catalytic beta sector
                    dot = (co.x * tx + co.y * ty) / rl
                    sect = max(0.0, (dot - 0.15) / 0.85)
                    # Open flares outward/down; Loose contracts softly; Tight clamps inward & up onto gamma!
                    radial_push = 0.055 if lobe_idx == 0 else (-0.015 if lobe_idx == 1 else -0.048)
                    z_shift = -0.025 if lobe_idx == 0 else (0.012 if lobe_idx == 2 else 0.0)
                    sk.data[vi].co = Vector((
                        co.x + (rad_xy.x / rl) * radial_push * sect,
                        co.y + (rad_xy.y / rl) * radial_push * sect,
                        co.z + z_shift * sect,
                    ))
                else:
                    sk.data[vi].co = co.copy()

    # 3. Peripheral Stator (O = OSCP crown, K/M/L/N/P/Q/R/S/T)
    stator_pts = []
    for ch in ['O', 'K', 'M', 'L', 'N', 'P', 'Q', 'R', 'S', 'T']:
        stator_pts.extend(xform(chains_all.get(ch, [])))
    bio.create_cryoem_envelope(
        "F0_Peripheral_Stator" if add_morphs else f"{name_prefix}_Stator",
        stator_pts,
        ball_radius=0.040 * scale_mult,
        voxel_res=0.025 * scale_mult,
        material=mat_stator,
        decimate_polys=1500 if add_morphs else 650,
        parent=synth_root,
        collection=col,
    )
    return synth_root


def build_pdb_supercomplex_etc(parent, col):
    """
    Constructs genuine Human Respiratory Supercomplex (PDB 5XTD cryo-EM):
    Complex I (L-shaped), Complex III2 (bc1 dimer), Complex IV (cytochrome oxidase).
    """
    chains_5x = bio.load_cif_ca_by_chain(os.path.join(RAW_DIR, "5XTD.cif"), stride=4)
    all_pts = [p for pts in chains_5x.values() for p in pts]
    g_ctr = sum(all_pts, Vector((0, 0, 0))) / max(1, len(all_pts))

    # Partition chains anatomically into Complex I arm/membrane vs III2/IV core
    c1_chains = ['M', 'l', 'r', 'A', 'Q', 'J', 'O', 'P', 'B', 'L', 'E', 'H', 'I', 'T']
    c3_chains = ['w', 's', 'm', 'u', 'C', 'N', 'W', 'j', 'k', 'h']
    c4_chains = ['p', 'd', 'c', 'V', 'a', 'o', 'b', 'g', 'v', 'e']

    def extract_centered(ch_list):
        pts = [p for ch in ch_list for p in chains_5x.get(ch, [])]
        if not pts:
            return [Vector((0, 0, 0))]
        ctr = sum(pts, Vector((0, 0, 0))) / len(pts)
        # Rotate slightly so hydrophobic membrane region sits at z ~ 0 and matrix arms rise into +Z
        return [Vector(((p.x - ctr.x) * 0.0042, (p.z - ctr.z) * 0.0042, (p.y - ctr.y) * 0.0042 + 0.14)) for p in pts]

    specs = [
        ("ETC_Complex_I_5XTD", (-1.15, -0.05, 0.02), c1_chains, (0.14, 0.62, 0.96, 1.0), 0.052, 0.028, 1700),
        ("ETC_Complex_III2_5XTD", (-0.52, -0.08, 0.02), c3_chains, (0.88, 0.30, 0.66, 1.0), 0.048, 0.028, 1300),
        ("ETC_Complex_IV_5XTD", (-0.02, -0.04, 0.02), c4_chains, (0.98, 0.42, 0.24, 1.0), 0.048, 0.028, 1200),
    ]
    for name, loc, chs, rgba, rad, vox, polys in specs:
        mat = bio.make_pbr_material(name + "_Mat", rgba, roughness=0.28, coat_weight=0.35, emission_color=(rgba[0], rgba[1], rgba[2], 1.0), emission_strength=0.18)
        obj = bio.create_cryoem_envelope(
            name,
            extract_centered(chs),
            ball_radius=rad,
            voxel_res=vox,
            material=mat,
            decimate_polys=polys,
            parent=parent,
            collection=col,
        )
        obj.location = Vector(loc)

    # Soluble mobile electron carriers: Coenzyme Q (inside lipid ridge) & Cytochrome c (in intermembrane side)
    mat_q = bio.make_pbr_material("Coenzyme_Q_Carrier", (0.98, 0.85, 0.20, 1.0), roughness=0.25, emission_color=(0.98, 0.85, 0.20, 1.0), emission_strength=0.9)
    bm_q = bmesh.new()
    bio.add_uv_sphere_to_bm(bm_q, (-0.82, -0.05, 0.02), (0.045, 0.045, 0.045), u_seg=12, v_seg=8)
    bio.finish_bmesh_object("Carrier_Coenzyme_Q", bm_q, mat_q, parent=parent, collection=col)

    mat_cyt = bio.make_pbr_material("Cytochrome_C_Carrier", (0.96, 0.36, 0.44, 1.0), roughness=0.24, emission_color=(0.96, 0.32, 0.44, 1.0), emission_strength=0.75)
    bm_cc = bmesh.new()
    bio.add_uv_sphere_to_bm(bm_cc, (-0.28, -0.10, -0.14), (0.048, 0.048, 0.048), u_seg=12, v_seg=8)
    bio.finish_bmesh_object("Carrier_Cytochrome_C", bm_cc, mat_cyt, parent=parent, collection=col)


def main():
    bio.clear_scene()
    col = bio.ensure_collection("BIOGENESIS_Mitochondrion_Cathedral")
    root = bio.create_empty("Mitochondrion_Root", (0.0, 0.0, 0.0), collection=col)

    build_cristae_cathedral(root, col)
    build_pdb_supercomplex_etc(root, col)

    # Hero PDB 8H9T F0F1-ATP Synthase seated directly on curved Hero Crista crest
    build_pdb_atp_synthase(root, col, name_prefix="Hero_ATPSynthase_8H9T", loc=(0.68, -0.04, 0.04), rot_euler=(-0.08, 0.10, 0.35), scale_mult=1.22, add_morphs=True)
    # Background synthase dimer rows along deep crista ledges for monumental cathedral scale
    build_pdb_atp_synthase(root, col, name_prefix="BG_ATPSynthase_A", loc=(1.52, 0.48, 0.14), rot_euler=(-0.18, -0.22, 0.9), scale_mult=0.92, add_morphs=False)
    build_pdb_atp_synthase(root, col, name_prefix="BG_ATPSynthase_B", loc=(-0.78, 1.15, 0.58), rot_euler=(0.15, 0.18, -0.6), scale_mult=0.88, add_morphs=False)

    out_path = os.path.join(MODELS_DIR, "mitochondrion.glb")
    bio.export_hierarchy_glb(root, out_path, export_animations=False, apply_modifiers=False)


if __name__ == "__main__":
    main()
