"""
Narzędzie (integrator): dowód dopasowania HuBMAP -> Z-Anatomy dla atlas_lib.align_hubmap.
Render z nałożonym szkieletem (przód i bok) + tabela błędów w cm. Tylko czyta atlas, obrazy zapisuje poza repo.
  blender.exe --background --disable-autoexec <Startup.blend> --python blender/atlas/tools_align_check.py -- <folder_wyjścia>
Kolory renderu: kości Z-Anatomy (kontekst), kręgi i miednica HuBMAP żółte, płuca HuBMAP błękitne, serce HuBMAP czerwone,
pęcherz i prostata HuBMAP zielone, narządy Z-Anatomy (płuca, serce, pęcherz) półprzezroczyste białe.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else os.path.join(al.RAW, "..", "align_check")
os.makedirs(OUT, exist_ok=True)

files = {f: al.import_glb(f, collection="ATL_hubmap") for f in (
    "VH_M_Vertebrae.glb", "VH_M_Pelvis.glb", "3d-vh-m-lung.glb", "VH_M_Heart.glb", "VH_M_Urinary_Bladder.glb",
    "VH_M_Prostate.glb", "VH_M_Liver.glb", "VH_M_Spleen.glb", "3d-vh-m-trachea.glb", "VH_M_Thymus.glb")}
for objs in files.values():
    al.align_hubmap(objs, "male")


def pts(objs):
    return np.vstack([al._world_points(o) for o in objs])


def zv(hub_name):
    kind, num = al._base_name(hub_name).replace("VH_M_", "").rsplit("_", 1)
    num = int(num)
    if kind == "cervical_vertebra":
        return {1: "Atlas (C1)", 2: "Axis (C2)"}.get(num, f"Vertebra C{num}")
    return f"Vertebra T{num}" if kind == "thoracic_vertebra" else f"Vertebra L{num}"


rows = []
for o in files["VH_M_Vertebrae.glb"]:
    z = zv(o.name)
    d = np.linalg.norm(pts([o]).mean(0) - pts([bpy.data.objects[z]]).mean(0))
    rows.append((z, round(float(d) * 100, 2)))
err = [r[1] for r in rows]


def zobj(names):
    return [bpy.data.objects[n] for n in names if n in bpy.data.objects]


z_lungs = [o for o in bpy.data.objects if o.type == 'MESH' and "lobe of" in o.name and "lung" in o.name]
z_heart = al.find_meshes(collection="Heart")
pelvis_pairs = {"Sacrum": ["VH_M_sacrum"], "Coccyx": ["VH_M_coccyx"],
                "Hip bone.r": [f"VH_M_{n}_compact_bone_R" for n in ("ilium", "ischium", "pubis")],
                "Hip bone.l": [f"VH_M_{n}_compact_bone_L" for n in ("ilium", "ischium", "pubis")]}
organ = {
    "płuca": (files["3d-vh-m-lung.glb"], z_lungs),
    "serce": (files["VH_M_Heart.glb"], z_heart),
    "pęcherz moczowy": (files["VH_M_Urinary_Bladder.glb"], zobj(["Urinary bladder"])),
    "prostata": (files["VH_M_Prostate.glb"], zobj(["Prostate"])),
    "wątroba": (files["VH_M_Liver.glb"], zobj(["Liver"])),
    "śledziona": (files["VH_M_Spleen.glb"], zobj(["Spleen"])),
    "tchawica": ([al.hub(files["3d-vh-m-trachea.glb"], "VH_M_trachea")], zobj(["Trachea"])),
    "grasica": (files["VH_M_Thymus.glb"], [o for o in bpy.data.objects if o.type == 'MESH' and "lobe of thymus" in o.name]),
}
for zn, hn in pelvis_pairs.items():
    organ[f"miednica: {zn}"] = ([al.hub(files["VH_M_Pelvis.glb"], n) for n in hn], zobj([zn]))
organ_rows = {}
for k, (h, z) in organ.items():
    if not h or not z:
        continue
    d = pts(h).mean(0) - pts(z).mean(0)
    organ_rows[k] = {"cm": round(float(np.linalg.norm(d)) * 100, 2), "dx_dy_dz_cm": np.round(d * 100, 1).tolist()}

# kobieta: ta sama transformacja; tylko informacyjnie (kręgi VH_F vs kręgi Z-Anatomy)
fem = al.import_glb(os.path.join(al.HUBMAP_DIR, "female", "VH_F_Vertebrae.glb"), collection="ATL_hubmap_f")
al.align_hubmap(fem, "female")
frows = []
for o in fem:
    try:
        z = zv(al._base_name(o.name).replace("VH_F_", "VH_M_"))
        d = np.linalg.norm(pts([o]).mean(0) - pts([bpy.data.objects[z]]).mean(0))
        frows.append(round(float(d) * 100, 2))
    except (ValueError, KeyError):
        pass

report = {
    "transform": al.HUBMAP_ALIGN["male"],
    "vertebrae_cm": {"mean": round(float(np.mean(err)), 2), "max": round(float(np.max(err)), 2), "per": rows},
    "organs_centroid_cm": organ_rows,
    "female_vertebrae_vs_zanatomy_cm": {"mean": round(float(np.mean(frows)), 2) if frows else None,
                                        "max": round(float(np.max(frows)), 2) if frows else None,
                                        "note": "informacyjnie: kobieta i Z-Anatomy to różni ludzie"},
}
with open(os.path.join(OUT, "align_report.json"), "w", encoding="utf-8") as f:
    json.dump(report, f, indent=1, ensure_ascii=False)
print("ALIGN_REPORT", json.dumps(report, ensure_ascii=False))

# ---------------------------------------------------------------- render z nałożonym szkieletem
os.environ.pop("ATLAS_QUICK", None)
pl = al.Plate("align_check", resolution=(1000, 1800), out_dir=OUT)
bones = al.find_meshes(collection="1: Skeletal system")
pl.add(bones, role="context_bone_ghost", alpha=0.35)
pl.add(files["VH_M_Vertebrae.glb"] + files["VH_M_Pelvis.glb"], role="active", system="nerve")
pl.add(files["3d-vh-m-lung.glb"], role="active", system="resp", alpha=0.55)
pl.add(files["VH_M_Heart.glb"], role="active", system="artery")
pl.add(files["VH_M_Urinary_Bladder.glb"] + files["VH_M_Prostate.glb"], role="active", system="lymph")
pl.add(z_lungs + z_heart + zobj(["Urinary bladder", "Prostate"]), role="context_skin", alpha=0.3)
trunk = [o for o in bones if o.name.startswith(("Vertebra", "Sacrum", "Hip bone", "Atlas", "Axis"))]
pl.set_view("front", direction="front", frame=trunk + z_lungs, margin=1.1)
pl.set_view("side", direction="side", frame=trunk + z_lungs, margin=1.1)
pl.render(views=("front", "side"), states=("sprint",))
print("ALIGN_DONE", OUT)
