"""
Narzędzie dla agentów: przegląd kolekcji Z-Anatomy (największe siatki, materiały, wyszukiwanie po nazwie).
  blender.exe --background --disable-autoexec <Startup.blend> --python blender/atlas/tools_inspect.py -- \
      "<kolekcja>" [regex]
"""
import os
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
collection = argv[0] if argv else "4: Muscular system"
pattern = argv[1] if len(argv) > 1 else None

ms = al.find_meshes(collection=collection, include=[pattern] if pattern else None)
rows = []
for o in ms:
    mn, mx = al.world_bbox([o])
    rows.append((round((mx.z - mn.z) * (mx.x - mn.x), 4), o.name, [m.name for m in o.data.materials if m][:2]))
rows.sort(reverse=True)
print("INSPECT_COUNT", len(ms))
for r in rows[:40]:
    print("INSPECT_AREA", r)
print("INSPECT_MATS", Counter(m.name for o in ms for m in o.data.materials if m).most_common(30))
