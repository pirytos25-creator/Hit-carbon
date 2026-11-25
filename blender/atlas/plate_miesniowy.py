"""
Plansza wzorcowa: UKŁAD MIĘŚNIOWY w sprincie (faza 0).
  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/plate_miesniowy.py
Zmienna ATLAS_DRY=1: tylko wypisuje dopasowane mięśnie, bez renderu.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402

# Główne mięśnie napędowe sprintu (praca 1.0) i pomocnicze (0.6): stabilizacja tułowia, praca ramion.
PRIMARY = [
    r"^Gluteus maximus muscle", r"^Rectus femoris muscle", r"^Vastus lateralis", r"^Vastus medialis",
    r"^Vastus intermedius", r"head of biceps femoris", r"^Biceps femoris", r"^Semitendinosus",
    r"^Semimembranosus", r"head of gastrocnemius", r"^Soleus", r"^Psoas major", r"^Iliacus",
    r"^Tibialis anterior",
]
SECONDARY = [
    r"^Gluteus medius", r"^Adductor magnus", r"^Adductor longus", r"^Rectus abdominis",
    r"abdominal oblique muscle", r"part of deltoid muscle", r"^Latissimus dorsi", r"^Iliocostalis", r"^Longissimus",
    r"^Gracilis", r"^Sartorius", r"^Tensor fasciae latae", r"^Fibularis longus",
]

EXCL = [r"bursa", r"fascia", r"sheath"]
HIDE = [r"^Rectus sheath", r"^Linea alba"]  # pochewki zakrywające mięśnie

muscles = al.find_meshes(collection="4: Muscular system", suffixes=None, exclude=HIDE, exclude_materials=al.MUSCLE_COVER_MATERIALS)
primary = al.find_meshes(collection="4: Muscular system", suffixes=("l", "r"), include=PRIMARY, exclude=EXCL, exclude_materials=al.MUSCLE_COVER_MATERIALS)
secondary = al.find_meshes(collection="4: Muscular system", suffixes=("l", "r"), include=SECONDARY, exclude=EXCL, exclude_materials=al.MUSCLE_COVER_MATERIALS)
secondary = [o for o in secondary if o not in primary]
taken = set(primary) | set(secondary)
context = [o for o in muscles if o not in taken]
bones = al.find_meshes(collection="1: Skeletal system")

print("ATLAS_MATCH primary", len(primary), sorted({o.name.rsplit('.', 1)[0] for o in primary}))
print("ATLAS_MATCH secondary", len(secondary), sorted({o.name.rsplit('.', 1)[0] for o in secondary}))
print("ATLAS_MATCH context", len(context), "bones", len(bones))

if os.environ.get("ATLAS_DRY"):
    raise SystemExit(0)

plate = al.Plate("miesniowy")
plate.add(bones, role="context_bone")
plate.add(context, role="context_muscle")
plate.add(secondary, role="active", system="muscle", sprint_level=0.6)
plate.add(primary, role="active", system="muscle", sprint_level=1.0)
mn, mx = plate.frame_all()
print("ATLAS_BBOX", tuple(round(v, 3) for v in mn), tuple(round(v, 3) for v in mx), "ortho", round(plate.ortho_scale, 3))

# Kotwice podpisów: zawsze prawa strona ciała (.r). Z przodu leży ona po lewej stronie obrazu (podpisy w lewo),
# z tyłu po prawej (podpisy w prawo). Dzięki temu linie odnośników nie przecinają ciała.
A = {
    "rectus_femoris": {"objects": ["Rectus femoris muscle.r"], "views": ["front"]},
    "vastus_lateralis": {"objects": ["Vastus lateralis muscle.r"], "views": ["front"], "offset": (-0.01, -0.05)},
    "tibialis_anterior": {"objects": ["Tibialis anterior muscle.r"], "views": ["front"]},
    "rectus_abdominis": {"objects": ["Rectus abdominis muscle.r"], "views": ["front"]},
    "deltoid": {"objects": ["Acromial part of deltoid muscle.r"], "views": ["front"]},
    "gluteus_maximus": {"objects": ["Gluteus maximus muscle.r"], "views": ["back"]},
    "biceps_femoris": {"objects": ["Long head of biceps femoris.r"], "views": ["back"]},
    "semitendinosus": {"objects": ["Semitendinosus muscle.r"], "views": ["back"]},
    "gastrocnemius": {"objects": ["Medial head of gastrocnemius.r"], "views": ["back"]},
    "soleus": {"objects": ["Soleus muscle.r"], "views": ["back"], "offset": (0.0, -0.06)},
}
missing = [k for k, a in A.items() for n in a["objects"] if n not in al.bpy.data.objects]
if missing:
    print("ATLAS_MISSING_ANCHORS", missing)
    A = {k: a for k, a in A.items() if k not in missing}

plate.render(views=("front", "back"), states=("rest", "sprint"), anchors=A)
