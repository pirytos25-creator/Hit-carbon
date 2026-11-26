"""
Plansza: UKŁAD DOKREWNY (HORMONALNY) (faza 1b, agent 6). Zasady: docs/ATLAS_STYLE_BIBLE.md
  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/plate_hormonalny.py

Teza: sprint uruchamia oś „mózg → nadnercza → krew → narządy”. Adrenalina rośnie w sekundach,
pozostałe hormony zmieniają się wolniej (hormon wzrostu, kortyzol: minuty po wysiłku).

Widoki (jedna rozdzielczość 1000×1800 dla planszy):
  front   tułów z głową (od czubka głowy do miednicy, ortho_scale 1,0; decyzja Dyrygenta po K1: w całym ciele gruczoły
          były za małe). Całe ciało osobno jako widok `body_front` (kamera planszy mięśniowej, obrys kości i mięśni,
          margines 1,06) - poza treścią planszy, do warstw „Całość”.
          Gruczoły Z-Anatomy (CC BY-SA 4.0): podwzgórze, przysadka (płat przedni i tylny), szyszynka, tarczyca,
          przytarczyce, grasica, nadnercza, trzustka. Kontekst: szkielet (czaszka, żebra i mostek półprzezroczyste,
          bo zasłaniałyby przysadkę i grasicę), sylwetka, narządy docelowe przygaszone (wątroba, serce; nerki HuBMAP CC BY 4.0,
          bo nerka Z-Anatomy ma licencję NC), naczynia drogi hormonów (krzywe Z-Anatomy, przygaszone).
  detail  nadnercze prawe na górnym biegunie nerki: kora półprzezroczysta, rdzeń w środku. Kształt gruczołu i naczynia
          z Z-Anatomy, nerka z HuBMAP; podział na korę i rdzeń to SCHEMAT (Z-Anatomy nie rozdziela warstw):
          rdzeń = najgłębsza część gruczołu (ok. 12% objętości), liczona z odległości od powierzchni.

Strzałki (kind 'hormone', flows3d.json w metrach): nadnercze → żyła główna dolna → serce; serce → aorta → mięśnie nóg;
aorta → pień trzewny → wątroba; trzustka → żyła śledzionowa → żyła wrotna → wątroba. Kierunki sprawdzane z drzewa naczyń.

Zmienne:
  ATLAS_QUICK=1          podgląd biblioteki (pierwszy widok, sprint)
  ATLAS_ANCHORS_ONLY=1   tylko kotwice i strzałki
  ATLAS_DRY=1            tylko dopasowania i pomiary (bez renderu)
  ATLAS_FIT=<folder>     render kontrolny dopasowania HuBMAP (nerki, trzustka) do Z-Anatomy, poza repozytorium
  ATLAS_PREVIEW=<folder> podgląd OBU stanów i OBU widoków w połowie rozdzielczości, poza repozytorium
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402
import bmesh  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from mathutils import Matrix, Vector  # noqa: E402
from mathutils.bvhtree import BVHTree  # noqa: E402

DRY = bool(os.environ.get("ATLAS_DRY"))
FIT_DIR = os.environ.get("ATLAS_FIT")
PREVIEW_DIR = os.environ.get("ATLAS_PREVIEW")
ID = "hormonalny"
RES = (1000, 1800)
O = bpy.data.objects


def bb(objs):
    mn, mx = al.vert_bbox(objs)
    return [round(v, 4) for v in mn], [round(v, 4) for v in mx]


def center(objs):
    mn, mx = al.vert_bbox(objs)
    return (mn + mx) / 2


def report(*a):
    print("ENDO", *a)


# ============================================================ gruczoły Z-Anatomy
VIS = "8: Visceral systems"
adeno, neuro, pineal = O["Adenohypophysis"], O["Neurohypophysis"], O["Pineal gland"]
adrenal_r, adrenal_l = O["Suprarenal gland.r"], O["Suprarenal gland.l"]
thyroid = O["Thyroid gland"]  # połowa siatki + modyfikator Mirror (płat lewy powstaje w renderze)
parathyroids = [O[f"{a} parathyroid gland.{s}"] for a in ("Superior", "Inferior") for s in ("l", "r")]
pancreas = O["Pancreas"]
thymus = [O["Left lobe of thymus"], O["Right lobe of thymus"]]
liver = O["Liver"]


def clean_hypothalamus():
    """Kopia podwzgórza bez zabłąkanych wierzchołków (oryginał ma wierzchołek na z≈1,15 m; podwzgórze leży na z≈1,60 m)."""
    src = O["Hypothalamus"]
    ob = src.copy()
    ob.data = src.data.copy()
    ob.name = "ATL_hypothalamus"
    mw = ob.matrix_world
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    zs = np.array([(mw @ v.co).z for v in bm.verts])
    med = float(np.median(zs))
    kill = [v for v, z in zip(bm.verts, zs) if abs(z - med) > 0.03]
    report("hypothalamus: usunięte zabłąkane wierzchołki", len(kill), "mediana z", round(med, 4))
    bmesh.ops.delete(bm, geom=kill, context='VERTS')
    bm.to_mesh(ob.data)
    bm.free()
    return ob


hypothalamus = clean_hypothalamus()
glands_front = {
    "hypothalamus": [hypothalamus], "pituitary": [adeno, neuro], "pineal": [pineal], "thyroid": [thyroid],
    "parathyroid": parathyroids, "thymus": thymus, "adrenal": [adrenal_r, adrenal_l], "pancreas": [pancreas],
}
for k, v in glands_front.items():
    report("gland", k, [o.name for o in v], bb(v))

# Poziom w sprincie (ilustracja w 3 stopniach, nie liczba ze źródła; model §6 pkt 5):
#   1.0  nadnercza (rdzeń: adrenalina ×14-18), przysadka (ADH w trakcie; ACTH, hormon wzrostu - szczyt GH po wysiłku)
#   0.6  trzustka (glukagon/insulina zmieniają się niewiele przy ~87% VO₂max - korekta briefu przyjęta na K1)
#   dim  podwzgórze, tarczyca, przytarczyce, szyszynka, grasica (decyzja Dyrygenta K1: „reszta przygaszona”)
# Spoczynek i 'dim' mieszają się z tłem mięśni #8E7A78 (ctx="muscle"), żeby nie zlewać się z kością.
SPRINT = {"adrenal": 1.0, "pituitary": 1.0, "hypothalamus": "dim", "pancreas": 0.6,
          "thyroid": "dim", "parathyroid": "dim", "pineal": "dim", "thymus": "dim"}

# ============================================================ kontekst
bones_all = al.find_meshes(collection="1: Skeletal system")


def members(colname):
    try:
        return set(al.find_meshes(collection=colname))
    except KeyError:
        return set()


GHOST_COLS = ("Cranium", "Mandible", "Teeth", "Auditory ossicles", "Ribs", "Costal cartilages")
ghost_set = set().union(*(members(c) for c in GHOST_COLS))
ghost_set |= {o for o in bones_all if re.search(r"sternum|xiphoid|manubrium|hyoid", o.name, re.I)}
bones_ghost = [o for o in bones_all if o in ghost_set]
# Czaszka ma kilkadziesiąt nakładających się kości: przy alfie 0,22 warstwy sumują się i przysadka ginie (podgląd K2).
head_set = set().union(*(members(c) for c in ("Cranium", "Mandible", "Teeth", "Auditory ossicles")))
bones_ghost_head = [o for o in bones_ghost if o in head_set]
bones_ghost_trunk = [o for o in bones_ghost if o not in head_set]
bones_solid = [o for o in bones_all if o not in ghost_set]
report("bones", len(bones_all), "ghost", len(bones_ghost))
muscles_for_frame = al.find_meshes(collection="4: Muscular system", exclude_materials=al.MUSCLE_COVER_MATERIALS)
heart = al.find_meshes(collection="Heart", include=[r"atrium$", r"ventricle$"])

# HuBMAP: nerki (CC BY 4.0) zamiast nerki Z-Anatomy (CC BY-NC); trzustka HuBMAP tylko do porównania dopasowania
kid_r = al.import_glb("VH_M_Kidney_R.glb", collection="ENDO_hubmap")
kid_l = al.import_glb("VH_M_Kidney_L.glb", collection="ENDO_hubmap")
hub_panc = al.import_glb("VH_M_Pancreas.glb", collection="ENDO_hubmap")
al.align_hubmap(kid_r + kid_l + hub_panc, "male")
report("hub kidney_r", sorted(o.name for o in kid_r)[:30], len(kid_r))
report("hub pancreas", sorted(o.name for o in hub_panc)[:20])


def outer(objs):
    """Zewnętrzna powłoka modelu HuBMAP (obiekt o największym obrysie); wnętrze (kielichy, piramidy) nie jest potrzebne."""
    def vol(o):
        mn, mx = al.vert_bbox([o])
        e = mx - mn
        return e.x * e.y * e.z
    return max(objs, key=vol)


kidney_r_shell, kidney_l_shell = outer(kid_r), outer(kid_l)
report("kidney shells", kidney_r_shell.name, kidney_l_shell.name)

# ---- pomiary dopasowania (nerka Z-Anatomy NC: TYLKO pomiar, nigdy render)
zk_r, zk_l = O["Kidney.r"], O["Kidney.l"]
fit = {
    "kidney_r_center_cm": round((center([kidney_r_shell]) - center([zk_r])).length * 100, 2),
    "kidney_l_center_cm": round((center([kidney_l_shell]) - center([zk_l])).length * 100, 2),
    "kidney_r_delta_cm": [round(v * 100, 2) for v in (center([kidney_r_shell]) - center([zk_r]))],
    "kidney_l_delta_cm": [round(v * 100, 2) for v in (center([kidney_l_shell]) - center([zk_l]))],
    "pancreas_center_cm": round((center(hub_panc) - center([pancreas])).length * 100, 2),
    "pancreas_delta_cm": [round(v * 100, 2) for v in (center(hub_panc) - center([pancreas]))],
}


def gap_adrenal_kidney(adrenal, kidney):
    """Najmniejsza odległość wierzchołków nadnercza od powierzchni nerki (cm)."""
    P = al._world_points(kidney)
    A = al._world_points(adrenal)
    sub = P[np.random.default_rng(0).choice(len(P), min(len(P), 6000), replace=False)]
    d = np.sqrt(((A[:, None, :] - sub[None, :, :]) ** 2).sum(-1)).min()
    return round(float(d) * 100, 2)


fit["adrenal_r_to_hub_kidney_cm"] = gap_adrenal_kidney(adrenal_r, kidney_r_shell)
fit["adrenal_l_to_hub_kidney_cm"] = gap_adrenal_kidney(adrenal_l, kidney_l_shell)
fit["adrenal_r_to_z_kidney_cm"] = gap_adrenal_kidney(adrenal_r, zk_r)
fit["adrenal_l_to_z_kidney_cm"] = gap_adrenal_kidney(adrenal_l, zk_l)
fit["hub_kidney_r_bbox"], fit["z_kidney_r_bbox"] = bb([kidney_r_shell]), bb([zk_r])
fit["hub_kidney_l_bbox"], fit["z_kidney_l_bbox"] = bb([kidney_l_shell]), bb([zk_l])
report("FIT", json.dumps(fit, ensure_ascii=False))

# ============================================================ naczynia drogi hormonów (krzywe Z-Anatomy)
VESSELS = {
    "vein": ["Inferior vena cava (abdominal part)", "Inferior vena cava (thoracic part)", "Superior vena cava",
             "Hepatic portal vein", "Splenic vein", "Superior mesenteric vein", "Hepatic veins",
             "Left renal vein", "Right renal vein"],
    "artery": ["Ascending aorta", "Aortic arch", "Thoracic aorta", "Abdominal aorta", "Coeliac trunk", "Common hepatic artery",
               "Proper hepatic artery", "Splenic artery", "Inferior suprarenal artery.l", "Inferior suprarenal artery.r",
               "Left renal artery", "Right renal artery", "Inferior thyroid artery.l", "Inferior thyroid artery.r",
               "Common iliac artery.r", "External iliac artery.r", "Femoral artery.r", "Common iliac artery.l",
               "External iliac artery.l", "Femoral artery.l"],
}
vessels = {k: [O[n] for n in v if n in O] for k, v in VESSELS.items()}
report("vessels missing", [n for v in VESSELS.values() for n in v if n not in O])


def bevel_for(o):
    radii = [p.radius for sp in o.data.splines for p in (sp.bezier_points if sp.type == 'BEZIER' else sp.points)]
    med = float(np.median(radii)) if radii else 1.0
    return max(o.data.bevel_depth * 1.25, 0.0009 / max(med, 0.1))


al.thicken_curves(vessels["vein"] + vessels["artery"], bevel=bevel_for, resolution=3)
# Tętnice kończyn dolnych tylko jako tło dla strzałki „do mięśni”: cieńsze, żeby nie przykrywały gruczołów.
al.thicken_curves([o for o in vessels["artery"] if re.search(r"iliac|Femoral", o.name)], scale=0.6)

# ============================================================ strzałki (flows3d, metry)


def nearest_index(pts, p):
    return min(range(len(pts)), key=lambda i: (pts[i] - p).length)


def surface_point(obj, toward):
    """Wierzchołek obiektu najbliższy punktowi `toward`."""
    P = al._world_points(obj)
    i = int(np.argmin(((P - np.array(toward)) ** 2).sum(1)))
    return Vector(P[i].tolist())


ivc_abd, ivc_th = O["Inferior vena cava (abdominal part)"], O["Inferior vena cava (thoracic part)"]
ivc = al.curve_points(ivc_abd, start_near=(0, 0, 0)) + al.curve_points(ivc_th, start_near=(0, 0, 0))
ivc = sorted(ivc, key=lambda p: p.z)  # żyła główna dolna płynie w górę (do prawego przedsionka)
ar_med = surface_point(adrenal_r, center([adrenal_r]) + Vector((0.03, -0.01, -0.01)))
k0 = nearest_index(ivc, ar_med)
flow_adrenal_r = [ar_med] + ivc[k0:]
al_med = surface_point(adrenal_l, center([adrenal_l]) + Vector((-0.03, -0.01, -0.03)))
lrv = al.curve_points(O["Left renal vein"], start_near=al_med)  # od nerki lewej do żyły głównej dolnej
k1 = nearest_index(ivc, lrv[-1])
flow_adrenal_l = [al_med] + lrv + ivc[k1:]

flow_legs_full, rep_legs = al.vessel_path(["Ascending aorta", "Aortic arch", "Thoracic aorta", "Abdominal aorta",
                                      "Common iliac artery.r", "External iliac artery.r", "Femoral artery.r"])
flow_liver_art, rep_liver = al.vessel_path(["Thoracic aorta", "Abdominal aorta", "Coeliac trunk", "Common hepatic artery",
                                            "Proper hepatic artery"])
flow_portal, rep_portal = al.vessel_path(["Splenic vein", "Hepatic portal vein"])
# W widoku "front" (tułów z głową) kadr kończy się na miednicy: strzałka „do mięśni” kończy się nad jego dolną krawędzią.
flow_legs = [p for p in flow_legs_full if p.z >= 0.86]
for r in rep_legs + rep_liver + rep_portal:
    report("flow", r)
for name, pts in (("adrenal_r", flow_adrenal_r), ("adrenal_l", flow_adrenal_l), ("legs", flow_legs),
                  ("liver_art", flow_liver_art), ("portal", flow_portal)):
    report("flow_check", name, "start", [round(v, 3) for v in pts[0]], "koniec", [round(v, 3) for v in pts[-1]], "n", len(pts))

FLOWS3D = [
    {"id": "adrenalina_nadnercze_prawe", "kind": "hormone", "views": ["front", "detail"], "states": ["sprint"],
     "labelPl": "Adrenalina: z nadnercza żyłą główną dolną do serca", "points": flow_adrenal_r},
    {"id": "adrenalina_nadnercze_lewe", "kind": "hormone", "views": ["front"], "states": ["sprint"],
     "labelPl": "Adrenalina z lewego nadnercza (przez żyłę nerkową lewą)", "points": flow_adrenal_l},
    {"id": "hormony_do_miesni", "kind": "hormone", "views": ["front"], "states": ["sprint"],
     "labelPl": "Z sercem i aortą do mięśni nóg", "points": flow_legs},
    {"id": "hormony_do_watroby", "kind": "hormone", "views": ["front"], "states": ["sprint"],
     "labelPl": "Aortą i tętnicą wątrobową do wątroby", "points": flow_liver_art},
    {"id": "trzustka_zyla_wrotna", "kind": "hormone", "views": ["front"], "states": ["sprint"],
     "labelPl": "Glukagon i insulina: z trzustki żyłą wrotną do wątroby", "points": flow_portal},
]

if DRY:
    raise SystemExit(0)


# ============================================================ rdzeń nadnercza (schemat)
def build_medulla(gland, frac=0.10, step=0.0005):
    """Rdzeń = najgłębsza część gruczołu (frac objętości). Siatka z wokseli → remesh → wygładzenie."""
    dg = bpy.context.evaluated_depsgraph_get()
    mw = gland.matrix_world
    V = [mw @ v.co for v in gland.data.vertices]
    F = [tuple(p.vertices) for p in gland.data.polygons]
    tree = BVHTree.FromPolygons(V, F)
    mn, mx = al.vert_bbox([gland])
    xs = np.arange(mn.x, mx.x, step)
    ys = np.arange(mn.y, mx.y, step)
    zs = np.arange(mn.z, mx.z, step)
    inside, depth = [], []
    for x in xs:
        for y in ys:
            for z in zs:
                p = Vector((x, y, z))
                loc, nrm, _, dist = tree.find_nearest(p)
                if loc is not None and (p - loc).dot(nrm) < 0:
                    inside.append((x, y, z))
                    depth.append(dist)
    depth = np.array(depth)
    thr = float(np.quantile(depth, 1 - frac))
    pts = [p for p, d in zip(inside, depth) if d >= thr]
    report("medulla: wokseli wewnątrz", len(inside), "próg głębokości mm", round(thr * 1000, 2),
           "maks. głębokość mm", round(float(depth.max()) * 1000, 2), "wokseli rdzenia", len(pts))
    bm = bmesh.new()
    h = step * 0.55
    for (x, y, z) in pts:
        bmesh.ops.create_cube(bm, size=2 * h, matrix=Matrix.Translation((x, y, z)))
    me = bpy.data.meshes.new("ATL_adrenal_medulla")
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new("ATL_adrenal_medulla", me)
    bpy.context.scene.collection.objects.link(ob)
    rm = ob.modifiers.new("remesh", 'REMESH')
    rm.mode = 'VOXEL'
    rm.voxel_size = 0.0006
    sm = ob.modifiers.new("smooth", 'SMOOTH')
    sm.factor = 0.9
    sm.iterations = 12
    dg.update()
    me2 = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    bpy.context.scene.collection.objects.unlink(ob)
    ob.modifiers.clear()
    ob.data = me2
    for p in me2.polygons:
        p.use_smooth = True
    return ob, len(pts) / max(1, len(inside))


# ============================================================ plansza
GHOST_ORGAN = {"liver": 0.20, "heart": 0.22, "kidney": 0.30}


def organ_material(kind):
    """Narządy docelowe i nerki: kolor kontekstu mięśni/tła, półprzezroczyste (kontekst, nie układ aktywny).
    'skull': kości czaszki jak context_bone_ghost, ale alfa 0,10 (lokalny materiał, bo ATL_bone_ghost jest wspólny)."""
    if kind == "skull":
        return al.make_material("ENDO_bone_ghost_head", al.hex_to_linear(al.CONTEXT_COLORS["bone"]), roughness=0.75,
                                alpha=0.10, backface_culling=True)
    return al.make_material(f"ENDO_ctx_{kind}", al.hex_to_linear(al.CONTEXT_COLORS["muscle"]), roughness=0.7,
                            alpha=GHOST_ORGAN[kind], backface_culling=True)


class EndoPlate(al.Plate):
    """Lokalnie: role 'organ_<rodzaj>' (narządy kontekstu półprzezroczyste)."""

    def _apply_state(self, state):
        local = [i for i in self.items if str(i[1]).startswith("organ_")]
        saved = self.items
        self.items = [i for i in self.items if not str(i[1]).startswith("organ_")]
        try:
            super()._apply_state(state)
        finally:
            self.items = saved
        for o, role, *_ in local:
            al.assign(o, organ_material(role[6:]))


def front_surface(objs, frac=0.12, zband=None, xband=None):
    """Punkt na widocznej z przodu (−Y) powierzchni obiektu(ów), blisko środka tej powierzchni."""
    P = np.vstack([al._world_points(o) for o in objs])
    if zband:
        z0, z1 = P[:, 2].min(), P[:, 2].max()
        P = P[(P[:, 2] >= z0 + zband[0] * (z1 - z0)) & (P[:, 2] <= z0 + zband[1] * (z1 - z0))]
    if xband:
        P = P[(P[:, 0] >= xband[0]) & (P[:, 0] <= xband[1])]
    front = P[P[:, 1] <= np.quantile(P[:, 1], frac)]
    c = front[:, [0, 2]].mean(0)
    return Vector(front[np.argmin(((front[:, [0, 2]] - c) ** 2).sum(1))].tolist())


def on_curve(name, t=None, z=None):
    return al.curve_anchor(name, z=z, t=t) + Vector((0, -0.004, 0))


DETAIL_VESSELS = {"vein": ["Inferior vena cava (abdominal part)", "Right renal vein"],
                  "artery": ["Inferior suprarenal artery.r", "Right renal artery", "Abdominal aorta"]}


def build(plate, with_detail=True):
    hull = al.build_silhouette()
    F = ("front", "body_front")
    plate.add(bones_solid, role="context_bone", views=F)
    plate.add(bones_ghost_trunk, role="context_bone_ghost", views=F)
    plate.add(bones_ghost_head, role="organ_skull", views=F)
    for o in bones_ghost_head:
        o.visible_shadow = False
    plate.add([hull], role="context_skin", views=F)
    plate.add([liver], role="organ_liver", views=F)
    plate.add(heart, role="organ_heart", views=F)
    plate.add([kidney_l_shell], role="organ_kidney", views=F)
    for k, objs in glands_front.items():
        plate.add(objs, role="active", system="endo", sprint_level=SPRINT[k], ctx="muscle", views=F)
    both = set(DETAIL_VESSELS["vein"] + DETAIL_VESSELS["artery"])
    plate.add([o for o in vessels["vein"] if o.name not in both], role="active", system="vein", sprint_level="dim",
              ctx="muscle", views=F)
    plate.add([o for o in vessels["artery"] if o.name not in both], role="active", system="artery", sprint_level="dim",
              ctx="muscle", views=F)
    # Całe ciało (warstwy „Całość”): kamera jak plansze mięśniowa i krwionośna.
    plate.set_view("body_front", direction="front", frame=bones_all + muscles_for_frame, margin=1.06)
    # Tułów z głową: od czubka głowy do miednicy.
    bmn, bmx = al.vert_bbox(bones_all)
    # Górny margines 10 cm nad czaszką (audyt K2: głowa chowała się pod przełącznikiem widoków); dół nadal na miednicy.
    plate.set_view("front", direction="front", center=Vector((0.0, 0.0, bmx.z + 0.10 - 0.53)), ortho_scale=1.06)
    # Kotwice rozsunięte (audyt K1): głowa - podwzgórze (środek) i przysadka (dolny brzeg), szyszynka tylko rozszerzony;
    # brzuch - z lewej strony obrazu wątroba (wyżej) i głowa trzustki (niżej), w środku ż. wrotna i ż. główna dolna,
    # z prawej nadnercze LEWE (wyżej) i nerka lewa (niżej).
    A = {
        "hypothalamus": {"point": front_surface([hypothalamus], zband=(0.4, 1.0)), "views": ["front"]},
        "pituitary": {"point": front_surface([adeno], zband=(0.0, 0.4)), "views": ["front"]},
        "pineal": {"point": front_surface([pineal]), "views": ["front"]},
        "thyroid": {"point": front_surface([thyroid], xband=(-0.03, -0.008)), "views": ["front"]},
        "thymus": {"point": front_surface([O["Left lobe of thymus"]]), "views": ["front"]},
        "adrenal": {"point": front_surface([adrenal_l], zband=(0.4, 0.9)), "views": ["front"]},
        "pancreas": {"point": front_surface([pancreas], xband=(-0.045, -0.02)), "views": ["front"]},
        "liver": {"point": front_surface([liver], zband=(0.55, 0.9), xband=(-0.10, -0.06)), "views": ["front"]},
        "portal_vein": {"point": on_curve("Hepatic portal vein", t=0.6), "views": ["front"]},
        "ivc": {"point": on_curve("Inferior vena cava (abdominal part)", z=1.06), "views": ["front"]},
        "kidney": {"point": front_surface([kidney_l_shell], zband=(0.1, 0.4)), "views": ["front"]},
    }
    if not with_detail:
        return A, None
    # ---- DETAIL: nadnercze prawe (kora półprzezroczysta, rdzeń w środku), górny biegun nerki, naczynia
    cortex = adrenal_r.copy()
    cortex.name = "ATL_adrenal_cortex"
    medulla, frac = build_medulla(adrenal_r)
    D = ("detail",)
    plate.add([cortex], role="active", system="endo", sprint_level=0.6, alpha=0.5, ctx="muscle", views=D)
    plate.add([medulla], role="active", system="endo", sprint_level=1.0, ctx="muscle", views=D)
    plate.add([kidney_r_shell], role="organ_kidney", views=("front", "body_front", "detail"))
    det_vessels_v = [O[n] for n in DETAIL_VESSELS["vein"]]
    det_vessels_a = [O[n] for n in DETAIL_VESSELS["artery"]]
    plate.add(det_vessels_v, role="active", system="vein", sprint_level="dim", ctx="muscle", views=("front", "body_front", "detail"))
    plate.add(det_vessels_a, role="active", system="artery", sprint_level="dim", ctx="muscle", views=("front", "body_front", "detail"))
    amn, amx = al.vert_bbox([adrenal_r])
    # Kadr: nadnercze w górnej części obrazu, pod nim górny biegun nerki, z prawej brzeg żyły głównej dolnej.
    c = Vector(((amn.x + amx.x) / 2 + 0.0106, 0.0, amx.z - 0.045))
    plate.set_view("detail", direction="front", center=c, ortho_scale=0.13)
    A.update({
        "d_cortex": {"point": front_surface([adrenal_r], zband=(0.6, 0.95)), "views": ["detail"]},
        "d_medulla": {"point": front_surface([medulla], frac=0.3), "views": ["detail"]},
        "d_kidney": {"point": front_surface([kidney_r_shell], zband=(0.55, 0.8), xband=(-0.07, -0.045)), "views": ["detail"]},
        "d_ivc": {"point": on_curve("Inferior vena cava (abdominal part)", z=c.z - 0.02), "views": ["detail"]},
        # tętnica poniżej gruczołu (między nim a tętnicą nerkową), z dala od kotwicy rdzenia
        "d_artery": {"point": on_curve("Inferior suprarenal artery.r", z=amn.z - 0.006), "views": ["detail"]},
    })
    report("detail center", [round(v, 4) for v in c], "medulla frac", round(frac, 3))
    return A, medulla


# ---------------------------------------------------------------- render kontrolny dopasowania
if FIT_DIR:
    os.makedirs(FIT_DIR, exist_ok=True)
    fitp = EndoPlate(ID + "_fit", resolution=(1100, 1100), out_dir=FIT_DIR)
    fitp.add(bones_solid + bones_ghost, role="context_bone_ghost", alpha=0.35)
    fitp.add([adrenal_r, adrenal_l, pancreas], role="active", system="endo", sprint_level=1.0)
    fitp.add([kidney_r_shell, kidney_l_shell], role="active", system="urinary", sprint_level=1.0, alpha=0.6)
    fitp.add(hub_panc, role="active", system="resp", sprint_level=1.0, alpha=0.45)
    fitp.add([ivc_abd, ivc_th], role="active", system="vein", sprint_level=1.0)
    al.thicken_curves([ivc_abd, ivc_th], scale=1.0)
    torso = Vector((0.0, 0.0, 1.11))
    fitp.set_view("front", direction="front", center=torso, ortho_scale=0.36)
    fitp.set_view("side", direction="side", center=torso, ortho_scale=0.36)
    os.environ.pop("ATLAS_QUICK", None)
    fitp.render(views=("front", "side"), states=("sprint",))
    with open(os.path.join(FIT_DIR, "fit_report.json"), "w", encoding="utf-8") as f:
        json.dump(fit, f, indent=1, ensure_ascii=False)
    raise SystemExit(0)

# ---------------------------------------------------------------- plansza / podgląd
if PREVIEW_DIR:
    os.makedirs(PREVIEW_DIR, exist_ok=True)
    plate = EndoPlate(ID, resolution=(RES[0] // 2, RES[1] // 2), out_dir=PREVIEW_DIR)
    plate.scene.eevee.taa_render_samples = 16
    os.environ.pop("ATLAS_QUICK", None)
else:
    plate = EndoPlate(ID, resolution=RES)
A, medulla = build(plate)
plate.render(views=("front", "detail", "body_front"), states=("rest", "sprint"), anchors=A, flows3d=FLOWS3D)
