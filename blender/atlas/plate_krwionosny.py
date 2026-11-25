"""
Plansza: UKŁAD KRWIONOŚNY v2 (faza 2, integrator; v1: agent 5). Zasady: docs/ATLAS_STYLE_BIBLE.md
  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/plate_krwionosny.py

Źródła geometrii:
  front  - Z-Anatomy (CC BY-SA 4.0): 650 naczyń całego ciała jako KRZYWE (kolekcja "5: Cardiovascular system":
           tętnice, żyły, naczynia płucne i wieńcowe), jamy serca (siatki), szkielet; sylwetka z al.build_silhouette().
           Krzywe tworzą połączone drzewo (końce kolejnych naczyń pokrywają się), więc nie ma szwów między źródłami.
           v1 budowała naczynia kończyn, szyi i głowy jako schematyczne rurki, bo find_meshes nie widział krzywych.
  detail - HuBMAP v1.2/v1.4 (CC BY 4.0): jamy serca (VH_M_Heart) i naczynia przy sercu (3d-vh-m-blood-vasculature),
           dopasowane al.align_hubmap (jedna transformacja HuBMAP -> Z-Anatomy).
Licencje: krzywe NC (naczynia wewnątrznerkowe) blokuje atlas_lib.

Kolor = utlenowanie krwi (konwencja atlasów): pień i tętnice płucne niosą krew odtlenowaną -> kolor żył; żyły płucne -> tętnic.
Strzałki przepływu: flows3d.json (metry) z torów po krzywych; kierunek z topologii drzewa Z-Anatomy (al.vessel_path).

Zmienne: ATLAS_QUICK=1 (podgląd front/sprint), ATLAS_ANCHORS_ONLY=1, ATLAS_DRY=1 (tylko klasyfikacja i tory).
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from mathutils import Vector  # noqa: E402

DRY = bool(os.environ.get("ATLAS_DRY"))
CV = "5: Cardiovascular system"

# ============================================================ FRONT: naczynia Z-Anatomy (krzywe)
vessels = al.find_curves(collection=CV, materials=("Artery", "Vein", "Pulmonary artery", "Pulmonary vein"))
blocked = [o.name for o in al.find_curves(collection=CV, allow_nc=True) if al.is_nc(o)]
print("KRW_CURVES", len(vessels), "zablokowane NC:", blocked)

GREAT = r"^(Ascending aorta|Aortic arch|Thoracic aorta|Abdominal aorta|Superior vena cava|Inferior vena cava|" \
        r"Brachiocephalic trunk|(Left|Right) brachiocephalic vein|Azygos vein)"
LEG = r"(Common|External) iliac (artery|vein)|femoral|popliteal|tibial|fibular|saphenous|plantar|dorsalis pedis|" \
      r"genicular|arcuate|metatarsal|tarsal|calcaneal|digital (arteries|veins) of foot|venous arch of foot|patellar"
VISCERAL = r"portal|mesenteric|splenic|hepatic|gastric|gastro|colic|pancrea|renal|suprarenal|coeliac|testicular|sigmoid|" \
           r"appendic|anorectal|rectal|cystic|phrenic|marginal artery|ileal"
PELVIC = r"internal iliac|gluteal|pudendal|sacral|obturator|penis|iliolumbar|vesical|division of internal"


def classify(o):
    """(system koloru, grupa) dla krzywej naczynia."""
    mat = o.data.materials[0].name if o.data.materials and o.data.materials[0] else ""
    cols = {c.name for c in o.users_collection}
    n = o.name
    if mat == "Pulmonary artery":
        return "vein", "pulmonary"
    if mat == "Pulmonary vein":
        return "artery", "pulmonary"
    system = "vein" if mat == "Vein" else "artery"
    if cols & {"Arteries of heart", "Cardiac veins"} or re.search(r"coronary|cardiac vein|interventricular|of heart|"
                                                               r"of left ventricle|Coronary sinus", n) or \
            (o.parent and re.search(r"Coronary sinus|coronary|of heart", o.parent.name)):
        return system, "coronary"
    if re.search(GREAT, n):
        return system, "great"
    if cols & {"Left lower limb", "Right lower limb", "Left foot", "Right foot"} or re.search(LEG, n, re.I):
        return system, "leg"
    if cols & {"Left upper limb", "Right upper limb"} or re.search(r"subclavian|axillary", n, re.I):
        return system, "arm"
    if cols & {"Head", "Neck"}:
        return system, "neck"
    if re.search(PELVIC, n, re.I):
        return system, "pelvic"
    if re.search(VISCERAL, n, re.I):
        return system, "visceral"
    return system, "wall"  # ściana tułowia: międzyżebrowe, nabrzuszne, piersiowe, lędźwiowe


groups = {}
for o in vessels:
    groups.setdefault(classify(o), []).append(o)
print("KRW_GROUPS", {f"{s}/{g}": len(v) for (s, g), v in sorted(groups.items())})
for k in (("artery", "leg"), ("artery", "neck"), ("artery", "great"), ("vein", "great"), ("artery", "visceral")):
    print("KRW_GROUP", k, sorted(o.name for o in groups.get(k, []))[:40])

# Poziom pracy w sprincie (1.0 = pełny kolor i emisja; "dim" = jak w spoczynku). Ilustracja w stopniach, nie liczba.
SPRINT_LEVEL = {
    ("artery", "leg"): 1.0, ("vein", "leg"): 0.9,
    ("artery", "coronary"): 1.0, ("vein", "coronary"): 0.9,
    ("artery", "great"): 1.0, ("vein", "great"): 1.0,
    ("artery", "pulmonary"): 1.0, ("vein", "pulmonary"): 1.0,
    ("artery", "arm"): 0.8, ("vein", "arm"): 0.75,
    ("artery", "neck"): 0.7, ("vein", "neck"): 0.65,
    ("artery", "pelvic"): 0.6, ("vein", "pelvic"): 0.55,
    ("artery", "wall"): "dim", ("vein", "wall"): "dim",
    ("artery", "visceral"): "dim", ("vein", "visceral"): "dim",
}


# Grubość: Z-Anatomy ma realne promienie (bevel 0,0005 m × promień punktu, np. t. udowa ok. 4,6 mm).
# W ujęciu całego ciała 1 px ≈ 1,1 mm, więc najcieńsze naczynia pogrubiamy do min. 0,9 mm promienia.
def bevel_for(o):
    radii = [p.radius for sp in o.data.splines for p in (sp.bezier_points if sp.type == 'BEZIER' else sp.points)]
    med = float(np.median(radii)) if radii else 1.0
    return max(o.data.bevel_depth * 1.25, 0.0009 / max(med, 0.1))


al.thicken_curves(vessels, bevel=bevel_for, resolution=3)
# Naczynia ściany tułowia (międzyżebrowe tylne: 3,3 m krzywych) tworzą gęstą sieć przed sercem: cieńsze i przygaszone.
al.thicken_curves(groups.get(("artery", "wall"), []) + groups.get(("vein", "wall"), []), scale=0.55)

# serce Z-Anatomy (ściany jam; zastawki i mięśnie brodawkowate są w środku)
heart_z = al.find_meshes(collection="Heart", include=[r"atrium$", r"ventricle$", r"^Pulmonary trunk$"])
print("KRW_HEART_Z", [o.name for o in heart_z])

SKIP_BONES = [r"sternum", r"costal cartilage", r"^Rib", r"rib\.", r"^First rib", r"^Second rib", r"xiphoid"]
bones = al.find_meshes(collection="1: Skeletal system", exclude=SKIP_BONES)
all_bones = al.find_meshes(collection="1: Skeletal system")
muscles_for_frame = al.find_meshes(collection="4: Muscular system", exclude_materials=al.MUSCLE_COVER_MATERIALS)

# ============================================================ tory strzałek (flows3d), kierunek z drzewa
FLOW_PATHS = {
    "artery_leg": ("artery", "Krew z serca do nogi (aorta → t. udowa → t. piszczelowa przednia)",
                   ["Ascending aorta", "Aortic arch", "Thoracic aorta", "Abdominal aorta", "Common iliac artery.r",
                    "External iliac artery.r", "Femoral artery.r", "Popliteal artery.r", "Anterior tibial artery.r"]),
    "vein_leg": ("vein", "Powrót krwi z nogi do serca (ż. odpiszczelowa → ż. główna dolna)",
                 ["Great saphenous vein.r", "Femoral vein.r", "External iliac vein.r", "Common iliac vein.r",
                  "Inferior vena cava (abdominal part)", "Inferior vena cava (thoracic part)"]),
    "artery_head": ("artery", "Krew do mózgu (pień ramienno-głowowy → t. szyjna)",
                    ["Brachiocephalic trunk", "Right common carotid artery", "Internal carotid artery.r"]),
    "vein_head": ("vein", "Powrót krwi z głowy (ż. szyjna wewnętrzna → ż. główna górna)",
                  ["Internal jugular vein.r", "Right brachiocephalic vein", "Superior vena cava"]),
}
flows3d, flow_report = [], {}
for fid, (kind, label, names) in FLOW_PATHS.items():
    pts, rep = al.vessel_path(names)
    flow_report[fid] = rep
    flows3d.append({"id": fid, "kind": kind, "labelPl": label, "views": ["front"], "points": pts})
    for line in rep:
        print("KRW_FLOW", fid, line)
    # kontrola: tętnice w nodze płyną w dół, żyły w górę
    print("KRW_FLOW_CHECK", fid, "z start→koniec", round(pts[0].z, 3), "→", round(pts[-1].z, 3))

# ============================================================ DETAIL: serce HuBMAP
vasc = al.import_glb("3d-vh-m-blood-vasculature.glb", collection="KRW_hubmap")
heart_h = al.import_glb("VH_M_Heart.glb", collection="KRW_hubmap")
al.align_hubmap(vasc + heart_h, "male")


def hub_kind(name):
    n = al._base_name(name).lower()
    if "pulmonary_trunk" in n or "pulmonary_artery" in n:
        return "vein", "pulmonary"
    if "pulmonary_vein" in n:
        return "artery", "pulmonary"
    system = "vein" if ("vein" in n or "vena_cava" in n or "coronary_sinus" in n) else "artery"
    if "drummond" not in n and any(k in n for k in ("cardiac_artery", "coronary_artery", "descending_artery", "marginal", "diagonal",
                                                    "cardiac_vein", "coronary_sinus", "vein_of_left_atrium", "vein_of_left_ventricle")):
        return system, "coronary"
    if any(k in n for k in ("aorta", "aortic", "brachiocephalic", "carotid", "subclavian", "vena_cava")):
        return system, "great"
    return system, "other"


heart_walls = [o for o in heart_h if not any(k in o.name for k in ("valve", "papillary"))]
detail_vessels = [o for o in vasc if hub_kind(o.name)[1] in ("coronary", "great", "pulmonary")]

if DRY:
    print("KRW_DRY", json.dumps(flow_report, ensure_ascii=False))
    raise SystemExit(0)

# ============================================================ plansza
HEART_MIX = {"rest": 0.10, "sprint": 0.30}


def heart_material(state):
    """Mięsień sercowy: kolor kontekstu mięśni z domieszką koloru tętnic. Naczynia wieńcowe (pełny kolor) muszą się
    od niego odcinać, dlatego serce nie jest w pełni czerwone."""
    col = al.mix(al.hex_to_linear(al.CONTEXT_COLORS["muscle"]), al.hex_to_linear(al.SYSTEM_COLORS["artery"]), HEART_MIX[state])
    return al.make_material(f"KRW_heart_{state}", col, roughness=0.6, subsurface=0.08, emission=0.0 if state == "rest" else 0.08)


class VascPlate(al.Plate):
    """Lokalnie tylko materiał mięśnia sercowego (rola 'heart')."""

    def _apply_state(self, state):
        heart = [i for i in self.items if i[1] == "heart"]
        saved = self.items
        self.items = [i for i in self.items if i[1] != "heart"]
        try:
            super()._apply_state(state)
        finally:
            self.items = saved
        for o, *_ in heart:
            al.assign(o, heart_material(state))


plate = VascPlate("krwionosny")
hull = al.build_silhouette()
plate.add(bones, role="context_bone", views=("front",))
plate.add([hull], role="context_skin", views=("front",))
plate.add(heart_z, role="heart", views=("front",))
for (system, group), objs in sorted(groups.items()):
    plate.add(objs, role="active", system=system, sprint_level=SPRINT_LEVEL[(system, group)], ctx="muscle", views=("front",))
plate.add(heart_walls, role="heart", views=("detail",))
for o in detail_vessels:
    s, g = hub_kind(o.name)
    plate.add([o], role="active", system=s, sprint_level=1.0 if g != "coronary" or s == "artery" else 0.9, ctx="muscle",
              views=("detail",))

# Kamera całego ciała jak na planszy mięśniowej: obrys kości i mięśni, margines 1,06 (warstwy da się nakładać).
plate.set_view("front", direction="front", frame=all_bones + muscles_for_frame, margin=1.06)
hmn, hmx = al.vert_bbox(heart_walls)
plate.set_view("detail", direction="front", center=Vector(((hmn.x + hmx.x) / 2 + 0.002, 0, (hmn.z + hmx.z) / 2 + 0.034)),
               ortho_scale=0.27)


def front_surface(objs, frac=0.12, zband=None):
    """Punkt na widocznej z przodu (−Y) powierzchni obiektu(ów), blisko środka tej powierzchni."""
    P = np.vstack([al._world_points(o) for o in objs])
    if zband:
        z0, z1 = P[:, 2].min(), P[:, 2].max()
        P = P[(P[:, 2] >= z0 + zband[0] * (z1 - z0)) & (P[:, 2] <= z0 + zband[1] * (z1 - z0))]
    front = P[P[:, 1] <= np.quantile(P[:, 1], frac)]
    c = front[:, [0, 2]].mean(0)
    return Vector(front[np.argmin(((front[:, [0, 2]] - c) ** 2).sum(1))].tolist())


def on_vessel(name, t=None, z=None):
    """Kotwica na przedniej ścianie naczynia (krzywa + promień w stronę kamery)."""
    p = al.curve_anchor(name, z=z, t=t)
    return p + Vector((0, -0.004, 0))


def H(*names, zband=None):
    return front_surface([al.hub(vasc + heart_h, n) for n in names], zband=zband)


A = {
    "carotid": {"point": on_vessel("Right common carotid artery", t=0.7), "views": ["front"]},
    "jugular": {"point": on_vessel("Internal jugular vein.r", t=0.45), "views": ["front"]},
    "aortic_arch": {"point": on_vessel("Aortic arch", t=0.5), "views": ["front"]},
    "heart": {"point": front_surface([o for o in heart_z if "ventricle" in o.name]), "views": ["front"]},
    "brachial": {"point": on_vessel("Brachial artery.r", t=0.45), "views": ["front"]},
    "portal": {"point": on_vessel("Hepatic portal vein", t=0.5), "views": ["front"]},
    "femoral": {"point": on_vessel("Femoral artery.r", t=0.3), "views": ["front"]},
    "saphenous": {"point": on_vessel("Great saphenous vein.r", z=0.30), "views": ["front"]},
    "anterior_tibial": {"point": on_vessel("Anterior tibial artery.r", t=0.45), "views": ["front"]},
    "d_aortic_arch": {"point": H("VH_M_aortic_arch"), "views": ["detail"]},
    "d_pulmonary_trunk": {"point": H("VH_M_pulmonary_trunk"), "views": ["detail"]},
    "d_lad": {"point": H("VH_M_left_anterior_descending_artery", zband=(0.15, 0.45)), "views": ["detail"]},
    "d_left_ventricle": {"point": H("VH_M_heart_left_ventricle"), "views": ["detail"]},
    "d_rca": {"point": H("VH_M_right_coronary_artery"), "views": ["detail"]},
    "d_svc": {"point": H("VH_M_superior_vena_cava"), "views": ["detail"]},
    "d_cardiac_vein": {"point": H("VH_M_great_cardiac_vein", zband=(0.6, 1.0)), "views": ["detail"]},
}

meta = plate.render(views=("front", "detail"), states=("rest", "sprint"), anchors=A, flows3d=flows3d)
print("KRW_FLOW_REPORT", json.dumps(flow_report, ensure_ascii=False))
