"""
Inspect downloaded HuBMAP GLBs inside Blender 5.2 and parse RCSB CIF/PDB metadata.
Run:
  blender.exe --background --python blender/inspect_raw_assets.py
"""
import os
import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RAW = os.path.join(ROOT, "assets_raw")


def inspect_glb(filename):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    path = os.path.join(RAW, filename)
    bpy.ops.import_scene.gltf(filepath=path)
    bpy.context.view_layer.update()
    print(f"\n=== GLB: {filename} ===")
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    print(f"Total objects={len(bpy.context.scene.objects)}, meshes={len(meshes)}")
    mins = Vector((1e9, 1e9, 1e9))
    maxs = Vector((-1e9, -1e9, -1e9))
    for o in meshes[:45]:
        mw = o.matrix_world
        b = [mw @ Vector(c) for c in o.bound_box]
        omi = Vector((min(v.x for v in b), min(v.y for v in b), min(v.z for v in b)))
        oma = Vector((max(v.x for v in b), max(v.y for v in b), max(v.z for v in b)))
        mins = Vector((min(mins.x, omi.x), min(mins.y, omi.y), min(mins.z, omi.z)))
        maxs = Vector((max(maxs.x, oma.x), max(maxs.y, oma.y), max(maxs.z, oma.z)))
        tris = len(o.data.polygons)
        cols = [m.name for m in o.data.materials if m]
        print(f"  {o.name:<48} polys={tris:<7} center=({(omi.x+oma.x)/2:.3f},{(omi.y+oma.y)/2:.3f},{(omi.z+oma.z)/2:.3f}) mats={cols[:2]}")
    if len(meshes) > 45:
        print(f"  ... ({len(meshes) - 45} more meshes)")
        for o in meshes[45:]:
            mw = o.matrix_world
            b = [mw @ Vector(c) for c in o.bound_box]
            mins = Vector((min(mins.x, *(v.x for v in b)), min(mins.y, *(v.y for v in b)), min(mins.z, *(v.z for v in b))))
            maxs = Vector((max(maxs.x, *(v.x for v in b)), max(maxs.y, *(v.y for v in b)), max(maxs.z, *(v.z for v in b))))
    print(f"OVERALL BBOX min=({mins.x:.3f},{mins.y:.3f},{mins.z:.3f}) max=({maxs.x:.3f},{maxs.y:.3f},{maxs.z:.3f}) size=({maxs.x-mins.x:.3f},{maxs.y-mins.y:.3f},{maxs.z-mins.z:.3f})")


def main():
    for fn in ["VH_M_Heart.glb", "VH_M_Blood_Vasculature_Heart.glb", "VH_M_Lung.glb", "Allen_M_Brain.glb"]:
        inspect_glb(fn)


if __name__ == "__main__":
    main()
