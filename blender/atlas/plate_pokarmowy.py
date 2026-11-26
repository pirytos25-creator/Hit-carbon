"""
Plansza UKŁAD POKARMOWY I WĄTROBA (faza 1b, agent 8). Zasady: docs/ATLAS_STYLE_BIBLE.md
  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/plate_pokarmowy.py

Teza: w sprincie trawienie schodzi na boczny tor (mniej krwi w trzewiach), a wątroba pracuje jak elektrownia:
uwalnia glukozę i przerabia część mleczanu z mięśni na glukozę (cykl Cori).

Widoki (jedna rozdzielczość RES dla całej planszy, jak w planszy oddechowej):
  front   jama brzuszna z przodu (od dolnej części przełyku do miednicy). Narządy i naczynia z Z-Anatomy (CC BY-SA 4.0):
          żołądek, dwunastnica, jelito cienkie (krzywa "Jejunum" = całe jelito czcze i kręte, od zgięcia
          dwunastniczo-czczego do zastawki krętniczo-kątniczej), okrężnica, wyrostek, wątroba, pęcherzyk, trzustka,
          przełyk (krzywa), przewód żółciowy wspólny (krzywa), naczynia trzewne (krzywe). Szkielet jako kontekst
          (żebra i mostek półprzezroczyste), sylwetka z al.build_silhouette(). Sieć większa pominięta (zasłania jelita).
  detail  wątroba z naczyniami (HuBMAP VH_M_Liver, VH_M_Blood_Vasculature_Liver, VH_M_Biliary_Tree, VH_M_Gallbladder,
          VH_M_Pancreas, dwunastnica z VH_M_Small_Intestine; CC BY 4.0), dopasowane al.align_hubmap.
          Modele HuBMAP są tu same (bez narządów Z-Anatomy), więc różnica dwóch ludzi wzorcowych (2,6-3,4 cm) nie psuje obrazu.

Stany: spoczynek = przewód pokarmowy, wątroba i naczynia trzewne w kolorze umiarkowanym (REST_GUT), bez świecenia;
       sprint = wątroba w pełnym kolorze ze świeceniem, przewód pokarmowy i naczynia trzewne przygaszone ("dim").
       To lokalny wyjątek od reguły "spoczynek = 35%" (księga stylu §2): opis w raporcie K1.

Zmienne:
  ATLAS_QUICK=1              podgląd (pierwszy widok, stan sprint; atlas_lib)
  ATLAS_QUICK_STATE=rest|both  z ATLAS_QUICK: podgląd spoczynku albo obu stanów pierwszego widoku (lokalnie)
  ATLAS_PART=front|detail|all  które widoki liczyć (domyślnie all); anchors.json jest scalany przez atlas_lib
  ATLAS_OUT=<folder>         zapis renderów i anchors.json poza repozytorium (podglądy, kontrola kotwic)
  ATLAS_FIT=<folder>         render kontrolny dopasowania HuBMAP (jelita, wątroba) do Z-Anatomy i szkieletu
  ATLAS_ANCHORS_ONLY=1       tylko kotwice i strzałki
  ATLAS_DRY=1                tylko wypisuje dopasowania, tory i kotwice, bez renderu
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

PART = os.environ.get("ATLAS_PART", "all")
FIT_DIR = os.environ.get("ATLAS_FIT")
OUT_DIR = os.environ.get("ATLAS_OUT")
DRY = bool(os.environ.get("ATLAS_DRY"))
QUICK_STATE = os.environ.get("ATLAS_QUICK_STATE")

RES = (1150, 1600)
FRONT_C = Vector((0.0, 0.0, 1.02))  # od dolnej części przełyku (z ok. 1,30 m) do miednicy (ok. 0,74 m); K2: kadr niżej
FRONT_H = 0.56
DETAIL_H = 0.30
REST_GUT = 0.75  # przewód pokarmowy w spoczynku (ilustracja w stopniach, nie liczba); sprint: "dim" (35%)
REST_LIVER = 0.6  # wątroba w spoczynku; sprint: pełny kolor ze świeceniem

DIG = "Digestive system"
CV = "5: Cardiovascular system"


def obj(name):
    o = bpy.data.objects.get(name)
    if o is None:
        raise KeyError(f"Brak obiektu Z-Anatomy: {name}")
    return o


def bb(objs):
    mn, mx = al.vert_bbox(objs)
    return [round(v, 3) for v in mn], [round(v, 3) for v in mx]


def fill_holes(o, max_sides=0):
    """Łata otwory w siatce (tylko w pamięci, na kopii danych). Żołądek Z-Anatomy ma okrągły otwór w ścianie przedniej
    (70 krawędzi brzegowych): bez łaty przez otwór widać wnętrze i śledzionę."""
    import bmesh
    o.data = o.data.copy()
    bm = bmesh.new()
    bm.from_mesh(o.data)
    edges = [e for e in bm.edges if e.is_boundary]
    n = len(edges)
    if edges:
        bmesh.ops.holes_fill(bm, edges=edges, sides=max_sides)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(o.data)
    bm.free()
    return n


# ============================================================ Z-Anatomy: narządy, przewody, naczynia
stomach = obj("Stomach")
duodenum = obj("Duodenum")
colon = [obj(n) for n in ("Ascending colon", "Transverse colon", "Descending colon", "Sigmoid colon")]
appendix = obj("Vermiform appendix")
liver = obj("Liver")
gallbladder = obj("Gallbladder")
pancreas = obj("Pancreas")
spleen = obj("Spleen")
small_int = obj("Jejunum")  # krzywa: całe jelito czcze + kręte (koniec przy okrężnicy wstępującej, z ok. 0,965 m)
oesophagus = obj("Oesophagus")
bile_duct = obj("Bile duct")
for _o in (stomach, liver, duodenum, gallbladder, pancreas):
    print("DIG_FILL", _o.name, "krawędzi brzegowych:", fill_holes(_o))

V_PORTAL = ["Hepatic portal vein", "Superior mesenteric vein", "Splenic vein", "Inferior mesenteric vein"]
V_HEPATIC = ["Hepatic veins"]
A_VISCERAL = ["Coeliac trunk", "Common hepatic artery", "Proper hepatic artery", "Splenic artery", "Left gastric artery",
              "Gastroduodenal artery", "Superior mesenteric artery", "Inferior mesenteric artery", "Middle colic artery",
              "Right colic artery", "Ileocolic artery", "Left colic artery", "Sigmoid arteries"]
V_VISCERAL_SMALL = ["Middle colic vein", "Right colic vein", "Right gastro-omental vein", "Left gastro-omental vein",
                    "Sigmoid veins"]
GREAT = ["Abdominal aorta", "Inferior vena cava (abdominal part)", "Inferior vena cava (thoracic part)"]
portal_veins = [obj(n) for n in V_PORTAL]
hepatic_veins = [obj(n) for n in V_HEPATIC]
visc_arteries = [obj(n) for n in A_VISCERAL if bpy.data.objects.get(n)]
visc_veins_small = [obj(n) for n in V_VISCERAL_SMALL if bpy.data.objects.get(n)]
aorta, ivc_abd, ivc_th = [obj(n) for n in GREAT]


# Grubość krzywych. Naczynia Z-Anatomy mają realne promienie (bevel 0,0005 m × promień punktu: ż. wrotna ok. 2,8 mm).
# W kadrze tułowia 1 px ≈ 0,36 mm, więc najcieńsze naczynia pogrubiamy do min. 0,8 mm promienia.
def vessel_bevel(o):
    radii = [p.radius for sp in o.data.splines for p in (sp.bezier_points if sp.type == 'BEZIER' else sp.points)]
    med = float(np.median(radii)) if radii else 1.0
    return max(o.data.bevel_depth * 1.1, 0.0008 / max(med, 0.1))


vessels = portal_veins + hepatic_veins + visc_arteries + visc_veins_small + [aorta, ivc_abd, ivc_th]
al.thicken_curves(vessels, bevel=vessel_bevel, resolution=4)
# Przewód żółciowy wspólny: w Z-Anatomy promień 1 mm (średnica 2 mm); realnie ok. 6 mm średnicy -> x2,5.
al.thicken_curves([bile_duct], scale=2.5, resolution=4)
# Jelito cienkie: bevel 0,01 m × promień punktu (0,8-1,0) = średnica ok. 1,6-2 cm. Zostaje, tylko gładsza rura.
al.thicken_curves([small_int], resolution=6)

print("DIG_BBOX liver", bb([liver]), "stomach", bb([stomach]), "small_int", bb([small_int]), "colon", bb(colon))

# Szkielet w kadrze; żebra, chrząstki żebrowe i mostek półprzezroczyste (leżą przed wątrobą i żołądkiem).
FRONT_W = FRONT_H * RES[0] / RES[1]
RIB_RE = re.compile(r"\brib\b|costal cartilage|sternum|xiphoid", re.I)


def in_frame(o, c=FRONT_C, h=FRONT_H, w=FRONT_W):
    mn, mx = al.vert_bbox([o])
    return mx.z > c.z - h / 2 and mn.z < c.z + h / 2 and mx.x > c.x - w / 2 and mn.x < c.x + w / 2


bones_all = al.find_meshes(collection="1: Skeletal system")
bones_frame = [o for o in bones_all if in_frame(o) and not o.get("atl_source")]
bones_ghost = [o for o in bones_frame if RIB_RE.search(o.name)]
bones_solid = [o for o in bones_frame if o not in bones_ghost]
print("DIG_BONES", len(bones_solid), "solid,", len(bones_ghost), "ghost /", len(bones_all))

# ============================================================ HuBMAP (zbliżenie wątroby i render kontrolny)
H_LIVER = al.import_glb("VH_M_Liver.glb", collection="DIG_hubmap")
H_VASC = al.import_glb("VH_M_Blood_Vasculature_Liver.glb", collection="DIG_hubmap")
H_BILE = al.import_glb("VH_M_Biliary_Tree.glb", collection="DIG_hubmap")
H_GB = al.import_glb("VH_M_Gallbladder.glb", collection="DIG_hubmap")
H_PANC = al.import_glb("VH_M_Pancreas.glb", collection="DIG_hubmap")
H_SI = al.import_glb("VH_M_Small_Intestine.glb", collection="DIG_hubmap")
hub_all = H_LIVER + H_VASC + H_BILE + H_GB + H_PANC + H_SI
H_LI = al.import_glb("SBU_M_Intestine_Large.glb", collection="DIG_hubmap") if FIT_DIR else []
al.align_hubmap(hub_all + H_LI, "male")


def H(name, pool=None):
    return al.hub(pool or (hub_all + H_LI), name)


h_capsule = H("VH_M_liver_capsule")
h_portal = [H(n) for n in ("VH_M_portal_vein", "VH_M_hepatic_portal_vein", "VH_M_right_branch_of_portal_vein",
                          "VH_M_left_branch_of_portal_vein")]
h_hep_veins = [H(n) for n in ("VH_M_right_hepatic_vein", "VH_M_middle_hepatic_vein", "VH_M_left_hepatic_vein")]
h_arteries = [o for o in H_VASC if "artery" in o.name or "celiac" in o.name]
h_bile = [o for o in H_BILE if "pancreatic" not in o.name]
h_panc_ducts = [o for o in H_BILE if "pancreatic" in o.name]
h_gb = H_GB
h_pancreas = H_PANC
h_duodenum = [o for o in H_SI if "duoden" in o.name]
print("DIG_HUB portal", [o.name for o in h_portal], "hep", [o.name for o in h_hep_veins])
print("DIG_HUB arteries", [o.name for o in h_arteries])
print("DIG_HUB bile", [o.name for o in h_bile], "duodenum", [o.name for o in h_duodenum])
for zn, hs in (("Liver", [h_capsule]), ("Gallbladder", h_gb), ("Pancreas", h_pancreas), ("Duodenum", h_duodenum)):
    a, b = al.vert_bbox([obj(zn)])
    c, d = al.vert_bbox(hs)
    print("DIG_ALIGN", zn, "Z-Anatomy", [round(v, 3) for v in (a + b) / 2], "HuBMAP", [round(v, 3) for v in (c + d) / 2],
          "odległość środków [cm]", round(((a + b) / 2 - (c + d) / 2).length * 100, 1))


# ============================================================ materiały i plansza
class DigestPlate(al.Plate):
    """Lokalnie: (1) materiały własne (custom: obj -> fn(state)), (2) zapis poza repo (ATLAS_OUT / ATLAS_FIT).
    Poziom koloru w spoczynku (`rest_level`) liczy atlas_lib (integracja 1b cz. 2; dawniej lokalne obejście)."""

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.custom = {}

    def _apply_state(self, state):
        super()._apply_state(state)
        for o, *_ in self.items:
            if o.name in self.custom:
                al.assign(o, self.custom[o.name](state))


def front_surface(objs, frac=0.12, zband=None, xband=None):
    """Punkt na widocznej z przodu (−Y) powierzchni obiektu(ów), blisko środka tej powierzchni."""
    P = np.vstack([al._world_points(o) for o in objs])
    if zband:
        P = P[(P[:, 2] >= zband[0]) & (P[:, 2] <= zband[1])]
    if xband:
        P = P[(P[:, 0] >= xband[0]) & (P[:, 0] <= xband[1])]
    front = P[P[:, 1] <= np.quantile(P[:, 1], frac)]
    c = front[:, [0, 2]].mean(0)
    return Vector(front[np.argmin(((front[:, [0, 2]] - c) ** 2).sum(1))].tolist())


# ============================================================ render kontrolny dopasowania
if FIT_DIR:
    os.makedirs(FIT_DIR, exist_ok=True)
    fit = DigestPlate("pokarmowy_fit", resolution=RES, out_dir=FIT_DIR)
    fit.add(bones_solid, role="context_bone")
    fit.add(bones_ghost, role="context_bone_ghost")
    z_gut = [stomach, duodenum, appendix] + colon + [small_int]
    fit.add(z_gut + [liver, gallbladder, pancreas], role="context_skin")
    fit.add([o for o in H_SI if "duoden" not in o.name] + H_LI, role="active", system="digest")
    fit.add([h_capsule] + h_gb + h_pancreas, role="active", system="endo")
    white = al.make_material("DIG_fit_z", (0.92, 0.92, 0.92, 1.0), alpha=0.35, backface_culling=True)
    for o in z_gut + [liver, gallbladder, pancreas]:
        fit.custom[o.name] = lambda s, m=white: m
    fit.set_view("front", direction="front", center=FRONT_C, ortho_scale=FRONT_H)
    fit.set_view("side", direction="side", center=FRONT_C, ortho_scale=FRONT_H)
    os.environ.pop("ATLAS_QUICK", None)
    fit.render(views=("front", "side"), states=("sprint",))
    raise SystemExit(0)

# ============================================================ tory strzałek (flows3d, metry)
flows3d, flow_report = [], {}


def add_flow(fid, kind, label, pts, views, report=None):
    flows3d.append({"id": fid, "kind": kind, "labelPl": label, "views": list(views), "points": pts})
    flow_report[fid] = report or []
    print("DIG_FLOW", fid, kind, "z", round(pts[0].z, 3), "->", round(pts[-1].z, 3), "|", report)


# Żyła wrotna: krew z jelit (ż. krezkowa górna) i ze śledziony (ż. śledzionowa) do wątroby (w górę).
p, rep = al.vessel_path(["Superior mesenteric vein", "Hepatic portal vein"])
if p[0].z > p[-1].z:
    p = p[::-1]
add_flow("portal_smv", "vein", "Krew z jelit do wątroby (ż. krezkowa górna → ż. wrotna)", p, ["front"], rep)
p, rep = al.vessel_path(["Splenic vein", "Hepatic portal vein"])
if (p[0] - Vector((0.0999, -0.0026, 1.1555))).length > (p[-1] - Vector((0.0999, -0.0026, 1.1555))).length:
    p = p[::-1]
add_flow("portal_splenic", "vein", "Krew ze śledziony i żołądka do ż. wrotnej", p, ["front"], rep)
# Żyły wątrobowe -> ż. główna dolna -> serce (w górę).
hv = al.curve_points("Hepatic veins", start_near=(-0.0178, -0.0364, 1.2353))
ivc_top = al.curve_points("Inferior vena cava (thoracic part)")
ivc_top = sorted(ivc_top, key=lambda q: q.z)
p = hv + [q for q in ivc_top if q.z > hv[-1].z + 0.003]
add_flow("hepatic_out", "vein", "Krew z wątroby do serca (żż. wątrobowe → ż. główna dolna)", p, ["front"],
         ["Hepatic veins (od ujścia w wątrobie) + Inferior vena cava (thoracic part) powyżej ujścia"])
# Tętnice: aorta (w dół, od przepony) -> pień trzewny -> t. wątrobowa wspólna -> właściwa (do wątroby).
# Od scalenia atlas-uklady al.vessel_path sam zaczyna aortę od końca bliższego sercu (wcześniej obejście lokalne).
p, rep = al.vessel_path(["Abdominal aorta", "Coeliac trunk", "Common hepatic artery", "Proper hepatic artery"])
add_flow("artery_liver", "artery", "Krew tętnicza do wątroby (pień trzewny → t. wątrobowa)", p, ["front"], rep)
p, rep = al.vessel_path(["Abdominal aorta", "Superior mesenteric artery"])
add_flow("artery_gut", "artery", "Krew tętnicza do jelit (t. krezkowa górna)", p, ["front"], rep)


def centerline(objs, n=10, axis=None, start_near=None):
    """Oś przewodu z chmury wierzchołków siatki HuBMAP: przekroje wzdłuż głównej osi (PCA), środek każdego."""
    P = np.vstack([al._world_points(o) for o in objs])
    c = P.mean(0)
    if axis is None:
        _, _, vt = np.linalg.svd(P - c, full_matrices=False)
        axis = vt[0]
    axis = np.asarray(axis, float) / np.linalg.norm(axis)
    t = (P - c) @ axis
    edges = np.linspace(t.min(), t.max(), n + 1)
    pts = []
    for a, b in zip(edges, edges[1:]):
        m = (t >= a) & (t <= b)
        if m.sum() > 3:
            pts.append(Vector(P[m].mean(0).tolist()))
    if start_near is not None and (pts[-1] - Vector(start_near)).length < (pts[0] - Vector(start_near)).length:
        pts = pts[::-1]
    return pts


# Zbliżenie: mleczan wchodzi z krwią (ż. wrotna i t. wątrobowa), glukoza wychodzi żyłami wątrobowymi.
pv_main = centerline([H("VH_M_portal_vein")], n=8, start_near=(0.0, -0.03, 1.13))
pv_right = centerline([H("VH_M_right_branch_of_portal_vein")], n=6, start_near=pv_main[-1])
pv_left = centerline([H("VH_M_left_branch_of_portal_vein")], n=5, start_near=pv_main[-1])
pha = centerline([H("VH_M_common_hepatic_artery"), H("VH_M_proper_hepatic_artery")], n=7, start_near=(0.011, -0.02, 1.15))
rhv = centerline([H("VH_M_right_hepatic_vein")], n=9, axis=(0.3, 0, 1), start_near=(-0.108, 0.01, 1.13))
mhv = centerline([H("VH_M_middle_hepatic_vein")], n=8, axis=(0.5, 0.4, 1), start_near=(-0.086, -0.067, 1.174))
lhv = centerline([H("VH_M_left_hepatic_vein")], n=7, axis=(0.1, 0.8, 0.6), start_near=(-0.02, -0.09, 1.175))
add_flow("lactate_portal", "lactate", "Mleczan z krwią do wątroby (ż. wrotna)", pv_main + pv_right, ["detail"],
         ["oś VH_M_portal_vein + prawa gałąź (HuBMAP)"])
add_flow("lactate_artery", "lactate", "Mleczan z krwią tętniczą", pha, ["detail"], ["oś t. wątrobowej wspólnej i właściwej"])
add_flow("glucose_right", "glucose", "Glukoza z wątroby do krwi (ż. wątrobowa prawa)", rhv, ["detail"], ["oś VH_M_right_hepatic_vein"])
add_flow("glucose_middle", "glucose", "Glukoza z wątroby do krwi (ż. wątrobowa pośrodkowa)", mhv, ["detail"], ["oś VH_M_middle_hepatic_vein"])
add_flow("glucose_left", "glucose", "Glukoza z wątroby do krwi (ż. wątrobowa lewa)", lhv, ["detail"], ["oś VH_M_left_hepatic_vein"])

# ============================================================ plansza
plate = DigestPlate("pokarmowy", resolution=RES, out_dir=OUT_DIR)
hull = al.build_silhouette()
F = ("front",)
D = ("detail",)
plate.add(bones_solid, role="context_bone", views=F)
plate.add(bones_ghost, role="context_bone_ghost", views=F)
plate.add([hull], role="context_skin", views=F)
plate.add([spleen], role="context_muscle", views=F)
# Przewód pokarmowy: spoczynek REST_GUT, sprint przygaszony.
# ctx="muscle": przygaszony przewód pokarmowy miesza się z tłem #8E7A78, nie z kością (inaczej zlewa się z żebrami i miednicą).
plate.add([stomach, duodenum, appendix] + colon, role="active", system="digest", rest_level=REST_GUT, sprint_level="dim", ctx="muscle", views=F)
plate.add([small_int], role="active", system="digest", rest_level=REST_GUT, sprint_level="dim", ctx="muscle", views=F)
plate.add([oesophagus], role="active", system="digest", sprint_level="dim", views=F)
plate.add([pancreas], role="active", system="digest", rest_level=REST_GUT, sprint_level="dim", ctx="muscle", views=F)
plate.add([gallbladder, bile_duct], role="active", system="digest", rest_level=0.5, sprint_level="dim", ctx="muscle", views=F)
# Wątroba: pracuje w obu stanach, w sprincie najmocniej.
plate.add([liver], role="active", system="digest", rest_level=REST_LIVER, sprint_level=1.0, ctx="muscle", views=F)
# Naczynia trzewne: w spoczynku duży przepływ, w sprincie przygaszone (jak na planszy krwionośnej).
plate.add(portal_veins + hepatic_veins + visc_veins_small, role="active", system="vein", rest_level=0.55, sprint_level="dim",
          ctx="muscle", views=F)
plate.add(visc_arteries, role="active", system="artery", rest_level=0.55, sprint_level="dim", ctx="muscle", views=F)
plate.add([aorta], role="active", system="artery", sprint_level=0.8, ctx="muscle", views=F)
plate.add([ivc_abd, ivc_th], role="active", system="vein", sprint_level=0.8, ctx="muscle", views=F)

# Zbliżenie wątroby (HuBMAP): torebka półprzezroczysta, naczynia i drogi żółciowe w środku widoczne.
plate.add([h_capsule], role="active", system="digest", rest_level=REST_LIVER, sprint_level=1.0, alpha=0.32, ctx="muscle", views=D)
plate.add(h_portal, role="active", system="vein", rest_level=0.7, sprint_level=0.6, ctx="muscle", views=D)
plate.add(h_hep_veins, role="active", system="vein", rest_level=0.7, sprint_level=0.6, ctx="muscle", views=D)
plate.add(h_arteries, role="active", system="artery", rest_level=0.7, sprint_level=0.6, ctx="muscle", views=D)
plate.add(h_bile + h_gb, role="active", system="digest", rest_level=0.5, sprint_level="dim", ctx="muscle", views=D)
# Trzustka i dwunastnica leżą przed żyłą wrotną i wnęką wątroby: półprzezroczyste, żeby było widać naczynia za nimi.
plate.add(h_pancreas, role="active", system="digest", rest_level=0.45, sprint_level="dim", alpha=0.45, ctx="muscle", views=D)
plate.add(h_panc_ducts, role="active", system="digest", rest_level=0.45, sprint_level="dim", ctx="muscle", views=D)
plate.add(h_duodenum, role="active", system="digest", rest_level=0.45, sprint_level="dim", alpha=0.45, ctx="muscle", views=D)

plate.set_view("front", direction="front", center=FRONT_C, ortho_scale=FRONT_H)
lmn, lmx = al.vert_bbox([h_capsule] + h_duodenum + h_pancreas)
plate.set_view("detail", direction="front", center=Vector(((lmn.x + lmx.x) / 2, 0.0, (lmn.z + lmx.z) / 2 + 0.005)),
               ortho_scale=DETAIL_H)


# ============================================================ kotwice (sprawdzone promieniem z kamery)
def visible_anchor(targets, view, hide, xband=None, zband=None, n=36, pick="center"):
    """Punkt kotwicy, który NAPRAWDĘ widać z kamery: siatka promieni z przodu (−Y, kierunek +Y) przez obrys celu;
    zostają trafienia, w których pierwszą trafioną bryłą jest cel. hide: obiekty pomijane przez promienie
    (półprzezroczyste: żebra, sylwetka, torebka wątroby w zbliżeniu; obiekty drugiego widoku).
    pick="center": trafienie najbliższe środkowi widocznej części. Zwraca (punkt, ułamek widocznych próbek)."""
    names = {o.name for o in targets}
    hide = [o for o in hide if o.name not in names]
    for o in hide:
        o.hide_viewport = True
    plate.scene.view_layers[0].update()
    dg = plate.scene.view_layers[0].depsgraph
    mn, mx = al.vert_bbox(targets)
    x0, x1 = (max(mn.x, xband[0]), min(mx.x, xband[1])) if xband else (mn.x, mx.x)
    z0, z1 = (max(mn.z, zband[0]), min(mx.z, zband[1])) if zband else (mn.z, mx.z)
    hits, total = [], 0
    for i in range(n):
        for j in range(n):
            x = x0 + (x1 - x0) * (i + 0.5) / n
            z = z0 + (z1 - z0) * (j + 0.5) / n
            total += 1
            ok, loc, _nrm, _idx, ob, _m = plate.scene.ray_cast(dg, Vector((x, -1.0, z)), Vector((0, 1, 0)))
            if ok and ob is not None and (ob.original.name if ob.original else ob.name) in names:
                hits.append(Vector(loc))
    for o in hide:
        o.hide_viewport = False
    plate.scene.view_layers[0].update()
    if not hits:
        print("DIG_ANCHOR_HIDDEN", sorted(names), view)
        return None, 0.0
    c = sum(hits, Vector()) / len(hits)
    best = min(hits, key=lambda q: (q.x - c.x) ** 2 + (q.z - c.z) ** 2)
    return best + Vector((0, -0.001, 0)), len(hits) / total


front_objs = [i[0] for i in plate.items if (plate.extra[i[0].name]["views"] or ("front",))[0] == "front"]
detail_objs = [i[0] for i in plate.items if (plate.extra[i[0].name]["views"] or ("",))[0] == "detail"]
HIDE_F = bones_ghost + [hull] + detail_objs
HIDE_D = front_objs + [h_capsule] + h_pancreas + h_duodenum  # półprzezroczyste w zbliżeniu
# Pominięte z przodu (promienie: < 0,5% widocznej powierzchni albo ok. 3%): wyrostek robaczkowy, t. krezkowa górna,
# trzustka (za żołądkiem i okrężnicą poprzeczną). Trzustka ma podpis w zbliżeniu.
FRONT_SPEC = {  # klucz: (cele, xband, zband)
    "oesophagus": ([oesophagus], None, (1.25, 1.29)),
    "stomach": ([stomach], None, None),
    "liver": ([liver], (-0.11, -0.04), None),
    "gallbladder": ([gallbladder], None, None),
    "duodenum": ([duodenum], None, None),
    "small_intestine": ([small_int], (-0.03, 0.06), (0.93, 1.02)),
    "colon": ([obj("Ascending colon")], None, (0.97, 1.08)),
    "transverse_colon": ([obj("Transverse colon")], (-0.02, 0.06), None),
    "sigmoid": ([obj("Sigmoid colon")], None, None),
    "hepatic_veins": ([obj("Hepatic veins"), ivc_th], None, None),
    "portal_vein": ([obj("Hepatic portal vein")], None, None),
}
DETAIL_SPEC = {
    # Wnęka wątroby: trzy kotwice rozsunięte (K2): ż. wrotna nisko przy trzustce, t. wątrobowa wspólna przy pniu trzewnym
    # (przyśrodkowo), drogi żółciowe bocznie (przewód pęcherzykowy i wątrobowy wspólny).
    "d_portal": ([H("VH_M_portal_vein"), H("VH_M_hepatic_portal_vein")], None, (1.135, 1.149)),
    "d_hepatic_veins": ([H("VH_M_middle_hepatic_vein")], None, (1.19, 1.23)),
    "d_hepatic_artery": ([H("VH_M_common_hepatic_artery")], (0.002, 0.012), None),
    "d_gallbladder": (h_gb, None, None),
    "d_bile_duct": ([H("VH_M_cystic_duct"), H("VH_M_common_hepatic_duct")], (-0.056, -0.036), None),
    "d_pancreas": ([H("VH_M_body_of_pancreas"), H("VH_M_neck_of_pancreas")], None, None),
    "d_duodenum": (h_duodenum, None, None),
}
anchors_all, anchor_report = {}, {}
for key, (tg, xb, zb) in FRONT_SPEC.items():
    p, frac = visible_anchor(tg, "front", HIDE_F, xb, zb)
    anchor_report[key] = round(frac, 3)
    if p is not None:
        anchors_all[key] = {"point": p, "views": ["front"]}
for key, (tg, xb, zb) in DETAIL_SPEC.items():
    p, frac = visible_anchor(tg, "detail", HIDE_D, xb, zb)
    anchor_report[key] = round(frac, 3)
    if p is not None:
        anchors_all[key] = {"point": p, "views": ["detail"]}
# Torebka wątroby (półprzezroczysta) w zbliżeniu: punkt na jej przedniej powierzchni, w płacie prawym.
anchors_all["d_liver"] = {"point": front_surface([h_capsule], zband=(1.17, 1.22), xband=(-0.11, -0.07)), "views": ["detail"]}
for k, a in anchors_all.items():
    print("DIG_ANCHOR", k, [round(v, 4) for v in a["point"]], "widoczne:", anchor_report.get(k))

if DRY:
    print("DIG_DRY", json.dumps(flow_report, ensure_ascii=False))
    raise SystemExit(0)

views = {"front": ("front",), "detail": ("detail",)}.get(PART, ("front", "detail"))
states = ("rest", "sprint")
if os.environ.get("ATLAS_QUICK") and QUICK_STATE:
    os.environ.pop("ATLAS_QUICK")
    views, states = views[:1], (("rest", "sprint") if QUICK_STATE == "both" else (QUICK_STATE,))
anchors = {k: a for k, a in anchors_all.items() if a["views"][0] in views}
plate.render(views=views, states=states, anchors=anchors, flows3d=flows3d if PART == "all" else None)
print("DIG_FLOW_REPORT", json.dumps(flow_report, ensure_ascii=False))
