"""
Narzędzie: spis struktur Z-Anatomy do pliku JSON. Dla każdej siatki: nazwa, liczba wielokątów i wszystkie
kolekcje, w których jest (Z-Anatomy zapisuje układ/narząd/region jako kolejne kolekcje tego samego obiektu,
np. "8: Visceral systems" + "Urinary system" + "Kidney"). Tylko czyta atlas.
  blender.exe --background --disable-autoexec <Startup.blend> --python blender/atlas/tools_inventory.py -- <wyjście.json>
Wynik: {"structures": [...], "by_collection": {kolekcja: liczba siatek}}
"""
import json
import os
import sys
from collections import Counter

import bpy

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
out_path = argv[0] if argv else os.path.join(os.path.dirname(os.path.abspath(__file__)), "za_inventory.json")


def is_structure(o):
    if o.type != 'MESH' or len(o.data.polygons) == 0:
        return False
    if o.name.endswith(".g") or any(m and m.name == "Text" for m in o.data.materials):
        return False
    return True


structures = []
counts = Counter()
for o in bpy.data.objects:
    if not is_structure(o):
        continue
    cols = sorted(c.name for c in o.users_collection)
    structures.append({"name": o.name, "polys": len(o.data.polygons), "collections": cols})
    counts.update(cols)

with open(out_path, "w", encoding="utf-8") as f:
    json.dump({"structures": structures, "by_collection": dict(counts.most_common())}, f, indent=1, ensure_ascii=False)
print("INVENTORY_DONE", out_path, len(structures))
