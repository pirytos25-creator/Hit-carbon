"""
Builds public/models/bloodstream_tunnel.glb (Benchmark B — IMMERSIVE BLOODSTREAM & Act VII BBB):
- Sweeping enclosed interior organic arterial -> capillary tunnel centered cleanly along an S-curve
  from (-5.5, 0, 0) to (+5.5, 0, 0).
- Inward-facing normals + rich smooth 3D cobblestone endothelial cell cushions (no flat cylinder,
  no floating ring cutouts, no bisecting septum blocking the camera!).
- Organic side bifurcation pocket curving cleanly out of the main arterial wall at u = 0.48.
"""
import math
import os
import sys
import bpy
import bmesh
from mathutils import Vector

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
MODELS_DIR = os.path.join(ROOT_DIR, "public", "models")

if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

import lib_bio_mesh as bio


def main_center(u: float):
    x = -5.5 + u * 11.0
    y = math.sin(u * math.pi * 1.25) * 0.85
    z = math.cos(u * math.pi * 1.1) * 0.30 - 0.08
    return (x, y, z)


def main_radius(u: float):
    taper = 1.38 - 0.82 * (u ** 1.18)
    pulse = 0.035 * math.sin(u * math.pi * 8.0)
    return max(0.50, taper + pulse)


def _build_inward_vessel_tube(bm: bmesh.types.BMesh, center_fn, radius_fn, t_steps: int, ring_seg: int, bump_amp: float, pinch_start_wall=False):
    rings = []
    pts = []
    rads = []
    for i in range(t_steps):
        u = i / float(t_steps - 1)
        pts.append(Vector(center_fn(u)))
        rads.append(radius_fn(u))

    frames = bio._parallel_transport_frames(pts)
    for i in range(t_steps):
        pos = pts[i]
        r = rads[i]
        n_vec, b_vec, _ = frames[i]
        row = []
        for j in range(ring_seg):
            ang = (2.0 * math.pi * j) / ring_seg
            cell1 = math.sin(ang * 6.0 + i * 0.42) * math.cos(i * 0.55 - ang * 3.0)
            cell2 = math.sin(ang * 12.0 + i * 0.8) * 0.4
            r_eff = r * (1.0 - bump_amp * (0.5 + 0.5 * cell1) * 0.72 - bump_amp * 0.25 * (cell2 + 0.4))
            p = pos + n_vec * (math.cos(ang) * r_eff) + b_vec * (math.sin(ang) * r_eff)
            row.append(bm.verts.new(p))
        rings.append(row)

    for i in range(t_steps - 1):
        r0 = rings[i]
        r1 = rings[i + 1]
        for j in range(ring_seg):
            jn = (j + 1) % ring_seg
            # Inward face winding
            bm.faces.new((r0[jn], r0[j], r1[j], r1[jn]))


def main():
    bio.clear_scene()
    col = bio.ensure_collection("BIOGENESIS_Bloodstream_Interior")
    root = bio.create_empty("Bloodstream_Tunnel_Root", (0.0, 0.0, 0.0), collection=col)

    mat_endothelium = bio.make_pbr_material(
        "Endothelium_Interior_Wall",
        (0.58, 0.09, 0.13, 1.0),
        roughness=0.32,
        coat_weight=0.55,
        subsurface_weight=0.35,
        emission_color=(0.28, 0.03, 0.06, 1.0),
        emission_strength=0.14,
    )
    mat_sheath = bio.make_pbr_material(
        "Vessel_Outer_Tunica",
        (0.28, 0.05, 0.09, 1.0),
        roughness=0.55,
        alpha=0.20,
    )

    bm_wall = bmesh.new()
    _build_inward_vessel_tube(bm_wall, main_center, main_radius, t_steps=110, ring_seg=36, bump_amp=0.065)

    # Organic bifurcation branch taking off outside main wall circumference from u=0.50 -> side exit
    base_b = Vector(main_center(0.50))
    rad_b = main_radius(0.50)

    def branch_center(u):
        return (
            base_b.x + u * 3.4,
            base_b.y + (rad_b * 1.48) + (u ** 1.15) * 2.15,
            base_b.z + 0.15 + u * 0.95,
        )

    def branch_radius(u):
        return 0.56 * (1.0 - 0.45 * u)

    bm_branch = bmesh.new()
    _build_inward_vessel_tube(bm_branch, branch_center, branch_radius, t_steps=42, ring_seg=24, bump_amp=0.06)

    for mesh_name, bmesh_src in (("Endothelium_Interior_Tunnel", bm_wall), ("Endothelium_Bifurcation_Branch", bm_branch)):
        bmesh_src.normal_update()
        me = bpy.data.meshes.new(mesh_name + "_Mesh")
        bmesh_src.to_mesh(me)
        bmesh_src.free()
        for p in me.polygons:
            p.use_smooth = True
        obj = bpy.data.objects.new(mesh_name, me)
        obj.data.materials.append(mat_endothelium)
        obj.parent = root
        bio.link_obj(obj, col)
        bio.ensure_box_uv(obj)

    bm_out = bmesh.new()
    pts_o = [Vector(main_center(i / 48.0)) for i in range(49)]
    rads_o = [main_radius(i / 48.0) + 0.12 for i in range(49)]
    bio.add_tube_along_points(bm_out, pts_o, rads_o, rings=24, cap_ends=False)
    bio.finish_bmesh_object("Vessel_Outer_Adventitia", bm_out, mat_sheath, parent=root, collection=col)

    out_path = os.path.join(MODELS_DIR, "bloodstream_tunnel.glb")
    bio.export_hierarchy_glb(root, out_path, export_animations=False, apply_modifiers=True)


if __name__ == "__main__":
    main()
