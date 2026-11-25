"""
Builds public/models/cardiopulmonary.glb (Benchmark B Macro Heart & Lungs):
- Uses real HuBMAP Visible Human anatomical meshes (VH_M_Heart, VH_M_Blood_Vasculature_Heart, VH_M_Lung)
  licensed CC BY 4.0, decimated cleanly and fitted with biomechanical Shape Keys (Morph Targets):
  * Heart_Ventricles: `Ventricular_Systole`, `Apex_Helical_Twist`
  * Heart_Atria: `Atrial_Systole`
  * Heart_Valves_AV & Heart_Valves_SL: `Valve_Open`
  * Lungs_Parenchyma: `Lung_Inspiration`
  * Diaphragm_Dome: `Diaphragm_Contract`
- Includes SA -> AV -> His-Purkinje conduction fibers and Hero Alveolar Acinus + Capillary Plexus.
"""
import math
import os
import sys
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


ANCHOR_OFFSET = Vector((-0.015, 0.032, -0.478))
ORG_SCALE = 4.2  # 12cm heart -> ~0.50m stage hero size for clear macro visualization


def _import_recentered(glb_filename: str):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(RAW_DIR, glb_filename))
    bpy.context.view_layer.update()
    imported = [o for o in bpy.data.objects if o not in before]
    meshes = [o for o in imported if o.type == 'MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for m in meshes:
        m.select_set(True)
    if meshes:
        bpy.context.view_layer.objects.active = meshes[0]
        bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        for m in meshes:
            # Recenter & scale directly into vertex coordinates so all transforms stay clean identity
            for v in m.data.vertices:
                v.co = (v.co + ANCHOR_OFFSET) * ORG_SCALE
            m.data.update()
    # Delete non-mesh empties created by glTF importer
    for o in imported:
        if o.type != 'MESH' and o.name in bpy.data.objects:
            bpy.data.objects.remove(o, do_unlink=True)
    return meshes


def _add_atrial_systole_key(obj):
    obj.shape_key_add(name="Basis")
    sk = obj.shape_key_add(name="Atrial_Systole")
    verts = obj.data.vertices
    l_ctr = Vector((0.08, 0.09, 0.06))
    r_ctr = Vector((-0.11, -0.01, 0.02))
    for i, v in enumerate(verts):
        ctr = l_ctr if v.co.x >= 0.0 else r_ctr
        d = v.co - ctr
        sk.data[i].co = ctr + d * 0.81


def _add_ventricular_keys(obj):
    obj.shape_key_add(name="Basis")
    sk_sys = obj.shape_key_add(name="Ventricular_Systole")
    sk_tw = obj.shape_key_add(name="Apex_Helical_Twist")
    verts = obj.data.vertices
    zs = [v.co.z for v in verts]
    z_min, z_max = min(zs), max(zs)
    span = max(0.05, z_max - z_min)
    # Approximate ventricular axis from base toward apex
    for i, v in enumerate(verts):
        p = v.co
        # 0 at base (top), 1 at apex (bottom)
        u_apex = max(0.0, min(1.0, (z_max - p.z) / span))
        axis = Vector((0.06 + u_apex * 0.06, -0.07, p.z))
        rad = p - axis
        # Radial wall squeeze + base-to-apex long-axis shortening toward AV base (z_max)
        p_sys = Vector((axis.x + rad.x * 0.80, axis.y + rad.y * 0.80, p.z + (z_max - p.z) * 0.095))
        sk_sys.data[i].co = p_sys

        # Helical wringing twist strongest at apex (~16 deg)
        ang = u_apex * 0.28
        ca, sa = math.cos(ang), math.sin(ang)
        rx = rad.x * ca - rad.y * sa
        ry = rad.x * sa + rad.y * ca
        sk_tw.data[i].co = Vector((axis.x + rx, axis.y + ry, p.z))


def _add_valve_open_key(obj, axial_shift: float, radial_expand: float):
    obj.shape_key_add(name="Basis")
    sk = obj.shape_key_add(name="Valve_Open")
    verts = obj.data.vertices
    xs = [v.co.x for v in verts]
    ys = [v.co.y for v in verts]
    cx, cy = sum(xs) / len(xs), sum(ys) / len(ys)
    for i, v in enumerate(verts):
        p = v.co
        dx, dy = p.x - cx, p.y - cy
        sk.data[i].co = Vector((cx + dx * radial_expand, cy + dy * radial_expand, p.z + axial_shift))


def _add_lung_inspiration_key(obj):
    obj.shape_key_add(name="Basis")
    sk = obj.shape_key_add(name="Lung_Inspiration")
    verts = obj.data.vertices
    zs = [v.co.z for v in verts]
    z_min, z_max = min(zs), max(zs)
    span = max(0.1, z_max - z_min)
    for i, v in enumerate(verts):
        p = v.co
        u_low = max(0.0, min(1.0, (z_max - p.z) / span))
        # Lateral bucket-handle expansion & diaphragmatic descent stronger basally
        scale_xy = 1.0 + 0.075 + 0.045 * u_low
        drop_z = -0.055 * (u_low ** 1.3)
        sk.data[i].co = Vector((p.x * scale_xy, p.y * (1.0 + 0.065), p.z + drop_z))


def build_conduction_and_alveoli(root, col):
    mat_cond = bio.make_pbr_material(
        "Conduction_Purkinje",
        (0.20, 0.90, 0.98, 1.0),
        roughness=0.22,
        emission_color=(0.24, 0.94, 1.0, 1.0),
        emission_strength=1.8,
    )
    bm_c = bmesh.new()
    # SA Node -> internodal -> AV Node -> Bundle of His -> L/R Purkinje subendocardial branches
    sa = (-0.11, -0.02, 0.14)
    av = (-0.01, -0.04, 0.04)
    his = (0.02, -0.06, -0.01)
    bio.add_uv_sphere_to_bm(bm_c, sa, (0.016, 0.016, 0.016), u_seg=10, v_seg=8)
    bio.add_uv_sphere_to_bm(bm_c, av, (0.014, 0.014, 0.014), u_seg=10, v_seg=8)
    bio.add_tube_along_points(bm_c, [sa, (-0.06, -0.05, 0.10), av, his], 0.0055, rings=7)
    # Left & Right ventricular Purkinje arborization
    bio.add_tube_along_points(bm_c, [his, (0.07, -0.07, -0.10), (0.14, -0.10, -0.19), (0.19, -0.06, -0.09)], 0.0045, rings=6)
    bio.add_tube_along_points(bm_c, [his, (0.02, -0.11, -0.12), (-0.05, -0.12, -0.15), (-0.10, -0.08, -0.06)], 0.0045, rings=6)
    bio.finish_bmesh_object("Conduction_SA_AV_Purkinje", bm_c, mat_cond, parent=root, collection=col)

    # Diaphragm muscular dome beneath lungs with Shape Key `Diaphragm_Contract`
    mat_diaph = bio.make_pbr_material("Diaphragm_Muscle", (0.64, 0.18, 0.22, 1.0), roughness=0.40, alpha=0.82)
    bm_d = bmesh.new()
    nx, ny = 24, 14
    grid = []
    for ix in range(nx):
        ux = (ix / (nx - 1)) * 2.0 - 1.0
        row = []
        for iy in range(ny):
            uy = (iy / (ny - 1)) * 2.0 - 1.0
            x = ux * 0.44
            y = uy * 0.22 - 0.02
            dome = math.cos(ux * math.pi * 0.48) * math.cos(uy * math.pi * 0.48)
            dual_cupola = 0.035 * math.sin(ux * ux * math.pi)
            z = -0.27 + (dome * 0.11 + dual_cupola)
            row.append(bm_d.verts.new((x, y, z)))
        grid.append(row)
    for ix in range(nx - 1):
        for iy in range(ny - 1):
            bm_d.faces.new((grid[ix][iy], grid[ix + 1][iy], grid[ix + 1][iy + 1], grid[ix][iy + 1]))
    bmesh.ops.solidify(bm_d, geom=list(bm_d.faces), thickness=0.018)
    diaph_obj = bio.finish_bmesh_object("Diaphragm_Dome", bm_d, mat_diaph, parent=root, collection=col)
    diaph_obj.shape_key_add(name="Basis")
    sk_dc = diaph_obj.shape_key_add(name="Diaphragm_Contract")
    for i, v in enumerate(diaph_obj.data.vertices):
        w = max(0.0, 1.0 - (abs(v.co.x) / 0.46) ** 2)
        sk_dc.data[i].co = Vector((v.co.x, v.co.y, v.co.z - 0.068 * w))

    # Macro Hero Alveolar Cluster & Wrapping Capillary Plexus offset clearly at X = +1.18 (Act III Shot 4 dive site!)
    alv_root = bio.create_empty("Alveolar_Sac_Cluster", (1.18, 0.0, 0.02), parent=root, collection=col)
    mat_alv = bio.make_pbr_material("Alveolar_Epithelium", (0.95, 0.68, 0.72, 1.0), roughness=0.28, alpha=0.58, coat_weight=0.55)
    mat_cap = bio.make_pbr_material("Alveolar_Capillary_Web", (0.88, 0.16, 0.24, 1.0), roughness=0.25, emission_color=(0.75, 0.15, 0.22, 1.0), emission_strength=0.35)
    bm_a = bmesh.new()
    for i in range(16):
        ang = i * 2.39996
        r = 0.025 + (i % 5) * 0.015
        cx = math.cos(ang) * r
        cy = math.sin(ang) * r
        cz = ((i % 4) - 1.5) * 0.032
        bio.add_uv_sphere_to_bm(bm_a, (cx, cy, cz), (0.034, 0.032, 0.034), u_seg=14, v_seg=10)
    alv_mesh = bio.finish_bmesh_object("Alveolar_Sacs_Mesh", bm_a, mat_alv, parent=alv_root, collection=col)
    alv_mesh.shape_key_add(name="Basis")
    sk_a = alv_mesh.shape_key_add(name="Lung_Inspiration")
    for i, v in enumerate(alv_mesh.data.vertices):
        sk_a.data[i].co = v.co * 1.15

    bm_cap = bmesh.new()
    for i in range(6):
        phi0 = i * math.pi / 3.0
        pts = [
            (
                math.cos(phi0 + (k / 12.0) * 1.4) * 0.088,
                math.sin(phi0 + (k / 12.0) * 1.4) * 0.085,
                -0.06 + (k / 12.0) * 0.12,
            )
            for k in range(13)
        ]
        bio.add_tube_along_points(bm_cap, pts, 0.0085, rings=7)
    bio.finish_bmesh_object("Alveolar_Capillaries", bm_cap, mat_cap, parent=alv_root, collection=col)


def main():
    bio.clear_scene()
    col = bio.ensure_collection("BIOGENESIS_Cardiopulmonary")
    root = bio.create_empty("Cardiopulmonary_Root", (0.0, 0.0, 0.0), collection=col)

    mat_vent = bio.make_pbr_material("Heart_Myocardium", (0.68, 0.10, 0.14, 1.0), roughness=0.28, coat_weight=0.60, subsurface_weight=0.35)
    mat_atria = bio.make_pbr_material("Heart_Atria_Tissue", (0.52, 0.10, 0.18, 1.0), roughness=0.32, coat_weight=0.45)
    mat_valve = bio.make_pbr_material("Heart_Valve_Leaflets", (0.94, 0.89, 0.84, 1.0), roughness=0.26)
    mat_art = bio.make_pbr_material("Vessel_Arterial_Oxy", (0.84, 0.12, 0.18, 1.0), roughness=0.26, coat_weight=0.40)
    mat_vein = bio.make_pbr_material("Vessel_Venous_Deoxy", (0.30, 0.16, 0.44, 1.0), roughness=0.32, coat_weight=0.32)
    mat_lung_l = bio.make_pbr_material("Lung_Parenchyma_L", (0.86, 0.48, 0.56, 1.0), roughness=0.45, alpha=1.0, subsurface_weight=0.35)
    mat_lung_r = bio.make_pbr_material("Lung_Parenchyma_R", (0.86, 0.48, 0.56, 1.0), roughness=0.45, alpha=1.0, subsurface_weight=0.35)
    mat_trachea = bio.make_pbr_material("Trachea_Bronchi_Cartilage", (0.88, 0.86, 0.82, 1.0), roughness=0.38)

    # 1. Import & Categorize HuBMAP Heart
    heart_meshes = _import_recentered("VH_M_Heart.glb")
    vent_parts, atria_parts, av_valves, sl_valves = [], [], [], []
    for m in heart_meshes:
        n = m.name.lower()
        if "ventricle" in n or "septum" in n or "papillary" in n:
            vent_parts.append(m)
        elif "atrium" in n:
            atria_parts.append(m)
        elif "mitral" in n or "tricuspid" in n:
            av_valves.append(m)
        else:
            sl_valves.append(m)

    vent_obj = bio.join_and_decimate(vent_parts, "Heart_Ventricles", mat_vent, target_polys=7500, parent=root, collection=col, apply_world=False)
    atria_obj = bio.join_and_decimate(atria_parts, "Heart_Atria", mat_atria, target_polys=4500, parent=root, collection=col, apply_world=False)
    av_obj = bio.join_and_decimate(av_valves, "Heart_Valves_AV", mat_valve, target_polys=1800, parent=root, collection=col, apply_world=False)
    sl_obj = bio.join_and_decimate(sl_valves, "Heart_Valves_SL", mat_valve, target_polys=1800, parent=root, collection=col, apply_world=False)

    if atria_obj:
        _add_atrial_systole_key(atria_obj)
    if vent_obj:
        _add_ventricular_keys(vent_obj)
    if av_obj:
        _add_valve_open_key(av_obj, axial_shift=-0.032, radial_expand=1.22)
    if sl_obj:
        _add_valve_open_key(sl_obj, axial_shift=0.028, radial_expand=1.26)

    # 2. Import & Categorize HuBMAP Cardiac Vasculature & Great Vessels
    vasc_meshes = _import_recentered("VH_M_Blood_Vasculature_Heart.glb")
    art_parts, vein_parts = [], []
    for m in vasc_meshes:
        n = m.name.lower()
        if "vein" in n or "cava" in n or "pulmonary" in n or "sinus" in n:
            vein_parts.append(m)
        else:
            art_parts.append(m)
    bio.join_and_decimate(art_parts, "Great_Arteries_Coronary", mat_art, target_polys=5500, parent=root, collection=col, apply_world=False)
    bio.join_and_decimate(vein_parts, "Great_Veins_Pulmonary", mat_vein, target_polys=4000, parent=root, collection=col, apply_world=False)

    # 3. Import & Categorize HuBMAP Lungs & Bronchial Tree (split L/R cleanly without translucent segment shard overlap!)
    lung_meshes = _import_recentered("VH_M_Lung.glb")
    lobe_l, lobe_r, airway_parts = [], [], []
    for m in lung_meshes:
        n = m.name.lower()
        if "trachea" in n or ("bronch" in n and "segment" not in n):
            airway_parts.append(m)
        elif "_r" in n or "right_" in n:
            lobe_r.append(m)
        else:
            lobe_l.append(m)
    lung_l_obj = bio.join_and_decimate(lobe_l, "Lungs_Parenchyma_L", mat_lung_l, target_polys=4500, parent=root, collection=col, apply_world=False)
    lung_r_obj = bio.join_and_decimate(lobe_r, "Lungs_Parenchyma_R", mat_lung_r, target_polys=4500, parent=root, collection=col, apply_world=False)
    if lung_l_obj:
        _add_lung_inspiration_key(lung_l_obj)
    if lung_r_obj:
        _add_lung_inspiration_key(lung_r_obj)
    bio.join_and_decimate(airway_parts, "Trachea_Bronchial_Tree", mat_trachea, target_polys=4500, parent=root, collection=col, apply_world=False)

    # 4. Conduction network, Diaphragm dome, Hero Alveoli
    build_conduction_and_alveoli(root, col)

    out_path = os.path.join(MODELS_DIR, "cardiopulmonary.glb")
    bio.export_hierarchy_glb(root, out_path, export_animations=False, apply_modifiers=False)


if __name__ == "__main__":
    main()
