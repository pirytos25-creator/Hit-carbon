"""
Narzędzie: spis struktur Z-Anatomy do pliku JSON: siatki ORAZ krzywe (naczynia, nerwy obwodowe, oskrzela segmentowe,
przewody to w Z-Anatomy krzywe, których find_meshes nie widzi). Tylko czyta atlas.
  blender.exe --background --disable-autoexec <Startup.blend> --python blender/atlas/tools_inventory.py -- <wyjście.json>
Wynik:
  {"structures": [{name, type: MESH, polys, collections, nc}],
   "curves": [{name, collections, material, parent, splines, points, length_m, bbox, ends, bevel_depth, radius_median, nc}],
   "by_collection": {kolekcja: liczba siatek}, "curves_by_collection": {kolekcja: liczba krzywych}}
Kolekcje: Z-Anatomy zapisuje układ/narząd/region jako kolejne kolekcje tego samego obiektu.
Pole `parent` krzywej naczynia to naczynie, z którego ona wychodzi (tętnica) albo do którego uchodzi (żyła):
z tego atlas_lib.vessel_direction wyznacza kierunek przepływu. `nc`: struktura na licencji NC (nie renderować).
"""
import json
import os
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
out_path = argv[0] if argv else os.path.join(os.path.dirname(os.path.abspath(__file__)), "za_inventory.json")


def is_structure(o):
    if o.type != 'MESH' or len(o.data.polygons) == 0:
        return False
    if o.name.endswith(".g") or any(m and m.name == "Text" for m in o.data.materials):
        return False
    return True


structures, curves = [], []
counts, ccounts = Counter(), Counter()
for o in bpy.data.objects:
    cols = sorted(c.name for c in o.users_collection)
    if is_structure(o):
        structures.append({"name": o.name, "type": "MESH", "polys": len(o.data.polygons), "collections": cols,
                           "nc": al.is_nc(o)})
        counts.update(cols)
    elif o.type == 'CURVE' and not o.name.endswith(".g"):
        sps = al.spline_points(o, per_seg=4)
        pts = np.array([tuple(p) for s in sps for p in s]) if sps else np.zeros((1, 3))
        length = sum(sum((s[i + 1] - s[i]).length for i in range(len(s) - 1)) for s in sps)
        radii = [p.radius for sp in o.data.splines for p in (sp.bezier_points if sp.type == 'BEZIER' else sp.points)]
        curves.append({
            "name": o.name, "collections": cols,
            "material": next((m.name for m in o.data.materials if m), None),
            "parent": o.parent.name if o.parent else None,
            "splines": len(sps), "points": int(sum(len(s) for s in sps)), "length_m": round(length, 4),
            "bbox": [np.round(pts.min(0), 4).tolist(), np.round(pts.max(0), 4).tolist()],
            "ends": [[[round(v, 4) for v in s[0]], [round(v, 4) for v in s[-1]]] for s in sps[:6]],
            "bevel_depth": round(o.data.bevel_depth, 6),
            "radius_median": round(float(np.median(radii)), 3) if radii else None,
            "nc": al.is_nc(o),
        })
        ccounts.update(cols)

with open(out_path, "w", encoding="utf-8") as f:
    json.dump({"structures": structures, "curves": curves, "by_collection": dict(counts.most_common()),
               "curves_by_collection": dict(ccounts.most_common())}, f, indent=1, ensure_ascii=False)
print("INVENTORY_DONE", out_path, "siatki", len(structures), "krzywe", len(curves))
