"""
Plansza UKŁAD ODDECHOWY (faza 1, agent 4). Zasady: docs/ATLAS_STYLE_BIBLE.md
  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/plate_oddechowy.py

Widoki:
  front   klatka piersiowa z przodu: krtań, tchawica i drzewo oskrzelowe (HuBMAP v1.4), półprzezroczyste płuca,
          przepona, mięśnie międzyżebrowe i pochyłe (Z-Anatomy), szkielet jako kontekst.
  detail  schemat pęcherzyków płucnych z naczyniami włosowatymi (geometria proceduralna, nie model anatomiczny).

Zmienne środowiskowe:
  ATLAS_QUICK=1         szybki podgląd (tylko stan sprint)
  ATLAS_ANCHORS_ONLY=1  tylko kotwice i strzałki, bez renderu
  ATLAS_PART=front|detail|all   który widok liczyć (domyślnie all); anchors.json jest scalany
  ATLAS_FIT=<folder>    render kontrolny dopasowania HuBMAP do Z-Anatomy (szkielet + oba modele płuc) do <folder>
  ATLAS_DRY=1           tylko wypisuje dopasowania, bez renderu

Modele HuBMAP (CC BY 4.0) są w tym samym układzie osi co Z-Anatomy (metry, przód = -Y, prawa strona ciała = -X),
różnią się tylko położeniem i skalą. Dopasowanie: środek obrysu płuc HuBMAP -> środek obrysu płuc Z-Anatomy,
skala jednolita HUB_SCALE (przy 1,05 szczyt nagłośni HuBMAP pokrywa się z nagłośnią Z-Anatomy, ok. 1,51 m).
"""
import json
import math
import os
import random
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402
import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Matrix, Vector  # noqa: E402

PART = os.environ.get("ATLAS_PART", "all")
FIT_DIR = os.environ.get("ATLAS_FIT")
HUB_SCALE = 1.05
HUB_DIR = os.path.join(al.RAW, "hubmap")


def bb(objs):
    mn, mx = al.world_bbox(objs)
    return tuple(round(v, 3) for v in mn), tuple(round(v, 3) for v in mx)


# ---------------------------------------------------------------- import HuBMAP (lokalnie, bez zmian w atlas_lib)
def import_glb(fname):
    """Import do osobnej kolekcji "ATL_hubmap". Bez tego glTF wkłada obiekty do aktywnej kolekcji Startup.blend
    (to kolekcja szkieletu), a wtedy find_meshes("1: Skeletal system") zwraca je jako kości."""
    col = bpy.data.collections.get("ATL_hubmap")
    if col is None:
        col = bpy.data.collections.new("ATL_hubmap")
        bpy.context.scene.collection.children.link(col)
    vl = bpy.context.view_layer
    vl.active_layer_collection = vl.layer_collection.children[col.name]
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(HUB_DIR, fname))
    new = [o for o in bpy.data.objects if o not in before]
    bpy.context.view_layer.update()
    meshes = {}
    for o in new:
        if o.type == 'MESH':
            m = o.matrix_world.copy()
            o.parent = None
            o.matrix_world = m
            meshes[o.name] = o
    for o in new:  # puste węzły hierarchii są niepotrzebne
        if o.type != 'MESH':
            bpy.data.objects.remove(o, do_unlink=True)
    return meshes


def transform(objs, T):
    for o in objs:
        o.matrix_world = T @ o.matrix_world
    bpy.context.view_layer.update()


def smooth(objs):
    for o in objs:
        try:
            o.data.shade_smooth()
        except AttributeError:
            for p in o.data.polygons:
                p.use_smooth = True


hub = {}
for f in ("3d-vh-m-lung.glb", "3d-vh-m-trachea.glb", "3d-vh-m-main-bronchus.glb", "3d-vh-m-larynx.glb"):
    hub.update(import_glb(f))

hub_lung_segments = [o for n, o in hub.items() if n.endswith("bronchopulmonary_segment") or "hilum" in n]
hub_tree = [o for n, o in hub.items()
            if (n.endswith("bronchus") or n.endswith("_basal") or "lobar_bronchus" in n or "main_bronchus" in n
                or n in ("VH_M_trachea", "VH_M_tracheal_cartilage", "VH_M_carina") or "cartilage_of_the" in n)]
hub_larynx = [o for n, o in hub.items() if any(k in n for k in ("thyroid_cartilage", "cricoid", "arytenoid", "corniculate", "epiglottic"))]

# ---------------------------------------------------------------- Z-Anatomy
VIS = "8: Visceral systems"
MUS = "4: Muscular system"
z_lungs = al.find_meshes(collection=VIS, include=[r"lobe of (right|left) lung"])
diaphragm = al.find_meshes(collection=MUS, include=[r"^Diaphragm$", r"^Diaphragm\."], exclude=[r"fascia"])
intercostal_ext = al.find_meshes(collection=MUS, include=[r"^External intercostal muscles"], suffixes=("l", "r"))
scalenes = al.find_meshes(collection=MUS, include=[r"^Scalenus (anterior|medius|posterior)"], suffixes=("l", "r"))
scm = al.find_meshes(collection=MUS, include=[r"^Sternocleidomastoid muscle"], suffixes=("l", "r"))

# Dopasowanie HuBMAP -> Z-Anatomy
zmn, zmx = al.world_bbox(z_lungs)
hmn, hmx = al.world_bbox(hub_lung_segments)
zc, hc = (zmn + zmx) / 2, (hmn + hmx) / 2
T = Matrix.Translation(zc) @ Matrix.Scale(HUB_SCALE, 4) @ Matrix.Translation(-hc)
transform(list(hub.values()), T)
smooth(list(hub.values()))
print("ALIGN z_lungs", bb(z_lungs), "hub_lungs", bb(hub_lung_segments))
print("ALIGN hub_trachea", bb([hub["VH_M_trachea"]]), "z_trachea", bb([bpy.data.objects["Trachea"]]))
print("ALIGN hub_larynx", bb(hub_larynx), "z_thyroid", bb([bpy.data.objects["Thyroid cartilage"]]),
      "z_epiglottis", bb([bpy.data.objects["Epiglottis"]]))
print("ALIGN diaphragm", bb(diaphragm), "hub_tree", bb(hub_tree))

# Szkielet: tylko kości w kadrze klatki piersiowej; bez chrząstek krtani (zastępuje je HuBMAP)
# i bez mostka (zasłaniałby rozwidlenie tchawicy: klasyczne cięcie atlasowe "bez przedniej ściany klatki").
# Zbliżenie klatki piersiowej i szyi (od łuku żebrowego do żuchwy). Obraz niższy niż plansza całego ciała,
# ale ten sam dla obu widoków (AtlasPlate używa jednej rozdzielczości na planszę).
RES = (1150, 1600)
FRAME_C = Vector((0.0, 0.0, 1.285))
FRAME_H = 0.56
BONE_EXCL = [r"thyroid cartilage", r"cricoid", r"arytenoid", r"corniculate", r"cuneiform", r"epiglott",
             r"tracheal cartilage", r"of sternum", r"^Sternum", r"Xiphoid"]
bones_all = [o for o in al.find_meshes(collection="1: Skeletal system", exclude=BONE_EXCL) if o.name not in hub]


def in_frame(o, cx=FRAME_C, h=FRAME_H, w=FRAME_H * RES[0] / RES[1]):
    mn, mx = al.world_bbox([o])
    return (mx.z > cx.z - h / 2 and mn.z < cx.z + h / 2 and mx.x > -w / 2 and mn.x < w / 2)


bones = [o for o in bones_all if in_frame(o)]

# Cięcie atlasowe "bez przedniej ściany klatki": z żeber (z chrząstkami żebrowymi) i mięśni międzyżebrowych
# usuwamy część leżącą przed płaszczyzną czołową CUT_Y. Boczne i tylne odcinki zostają jako kontekst,
# a płuca i drzewo oskrzelowe są odsłonięte. Siatki są kopiowane (dane bywają współdzielone), Startup.blend
# i tak nie jest zapisywany.
CUT_Y = -0.04
RIB_RE = re.compile(r"\brib\b|costal cartilage", re.I)


def cut_anterior(objs, y_plane=CUT_Y):
    n = 0
    for o in objs:
        o.data = o.data.copy()
        mw = o.matrix_world
        bm = bmesh.new()
        bm.from_mesh(o.data)
        kill = [v for v in bm.verts if (mw @ v.co).y < y_plane]
        if kill:
            bmesh.ops.delete(bm, geom=kill, context='VERTS')
            n += 1
        bm.to_mesh(o.data)
        bm.free()
    bpy.context.view_layer.update()
    return n
for o in z_lungs:
    try:
        o.data.shade_smooth()
    except AttributeError:
        pass
    if not any(m.type == 'SUBSURF' for m in o.modifiers):
        mod = o.modifiers.new("ATL_subsurf", 'SUBSURF')
        mod.levels = 1
        mod.render_levels = 2

ribs = [o for o in bones if RIB_RE.search(o.name)]
print("ATLAS_CUT ribs", cut_anterior(ribs), "/", len(ribs), "intercostal", cut_anterior(intercostal_ext))
print("ATLAS_MATCH z_lungs", len(z_lungs), [o.name for o in z_lungs])
print("ATLAS_MATCH diaphragm", [o.name for o in diaphragm], "intercostal", [o.name for o in intercostal_ext])
print("ATLAS_MATCH scalenes", len(scalenes), "scm", len(scm), "bones", len(bones), "/", len(bones_all))
print("ATLAS_MATCH hub tree", len(hub_tree), "larynx", len(hub_larynx), "lung segments", len(hub_lung_segments))

if os.environ.get("ATLAS_DRY"):
    raise SystemExit(0)


# ---------------------------------------------------------------- materiały lokalne
RESP = al.hex_to_linear(al.SYSTEM_COLORS["resp"])
BONE = al.hex_to_linear(al.CONTEXT_COLORS["bone"])


def lung_material(state):
    """Półprzezroczyste płuca w kolorze układu (spoczynek: 35% koloru, jak w księdze stylu §2)."""
    t = al.REST_MIX if state == "rest" else 1.0
    col = al.mix(BONE, RESP, t)
    alpha = 0.18 if state == "rest" else 0.24
    mat = al.make_material(f"ATL_resp_lung_{state}", col, roughness=0.75, subsurface=0.0,
                           emission=0.0 if state == "rest" else 0.05, alpha=alpha)
    mat.use_backface_culling = True
    return mat


class RespPlate(al.Plate):
    """Plansza z lokalnymi materiałami (płuca) i obsługą widoku "detail" (kamera jak "front")."""

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.custom = []  # (obj, fn(state) -> material)
        self.rest_hidden = []  # obiekty widoczne tylko w sprincie (np. dodatkowe naczynia włosowate)

    def _apply_state(self, state):
        super()._apply_state(state)
        for o, fn in self.custom:
            al.assign(o, fn(state))
        for o in self.rest_hidden:
            o.hide_render = (state == "rest")

    def _camera(self, view):
        return super()._camera("front" if view == "detail" else view)

    def _lights(self, view):
        return super()._lights("front" if view == "detail" else view)

    def anchor_point(self, obj_names, view):
        return super().anchor_point(obj_names, "front" if view == "detail" else view)

    def pixels(self, view, pts):
        cam = self._camera(view)
        return [[round(x * self.res[0], 1), round(y * self.res[1], 1)] for x, y in (self._project(cam, Vector(p)) for p in pts)]


def bbox_center(objs):
    mn, mx = al.world_bbox(objs)
    return (mn + mx) / 2, mn, mx


def read_anchors(out_dir):
    """Stan anchors.json sprzed renderu (Plate.render nadpisuje plik tylko swoimi widokami)."""
    path = os.path.join(out_dir, "anchors.json")
    try:
        with open(path, encoding="utf-8") as f:
            old = json.load(f)
        if old.get("id") == "oddechowy" and old.get("resolution") == list(RES):
            return old
    except (OSError, ValueError):
        pass
    return {"id": "oddechowy", "resolution": list(RES), "views": {}}


def merge_anchors(out_dir, base, metas, flows):
    path = os.path.join(out_dir, "anchors.json")
    for m in metas:
        for v, vm in m["views"].items():
            prev = base["views"].get(v, {}).get("images", {})
            merged = dict(prev)
            merged.update(vm["images"])
            vm["images"] = {s: merged[s] for s in ("rest", "sprint") if s in merged}
            base["views"][v] = vm
    order = [v for v in ("front", "detail") if v in base["views"]]
    base["views"] = {v: base["views"][v] for v in order}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(base, f, indent=2, ensure_ascii=False)
    fpath = os.path.join(out_dir, "flows.json")
    old_flows = {}
    if os.path.exists(fpath):
        try:
            with open(fpath, encoding="utf-8") as f:
                old_flows = {k: v for k, v in json.load(f).items()}
        except (OSError, ValueError):
            pass
    old_flows.update(flows)
    with open(fpath, "w", encoding="utf-8") as f:
        json.dump(old_flows, f, indent=1, ensure_ascii=False)
    print("ATLAS_MERGED", path, list(base["views"]))


# ---------------------------------------------------------------- render kontrolny dopasowania
if FIT_DIR:
    os.makedirs(FIT_DIR, exist_ok=True)
    fit = RespPlate("oddechowy_fit", resolution=RES)
    try:
        os.rmdir(fit.out_dir)  # Plate tworzy public/atlas/<id>; render kontrolny ląduje poza repozytorium
    except OSError:
        pass
    fit.out_dir = FIT_DIR
    fit.add(bones, role="context_bone")
    fit.add(z_lungs, role="context_skin")
    fit.add(hub_lung_segments, role="active", system="resp")
    fit.add(hub_tree + hub_larynx, role="active", system="artery")
    fit.add([bpy.data.objects["Trachea"], bpy.data.objects["Epiglottis"]], role="context_muscle")
    fit.custom = [(o, lambda s: al.make_material("ATL_fit_zlung", (0.9, 0.9, 0.9, 1), alpha=0.35)) for o in z_lungs]
    fit.custom += [(o, lambda s: al.make_material("ATL_fit_hub", al.hex_to_linear("#4FC3E0"), alpha=0.45)) for o in hub_lung_segments]
    fit.center, fit.ortho_scale = FRAME_C, FRAME_H
    os.environ.pop("ATLAS_QUICK", None)
    fit.render(views=("front", "side"), states=("sprint",))
    raise SystemExit(0)

OUT = os.path.join(al.OUT_ROOT, "oddechowy")
base_anchors = read_anchors(OUT)
metas, flows = [], {}

# ---------------------------------------------------------------- widok FRONT
if PART in ("all", "front"):
    plate = RespPlate("oddechowy", resolution=RES)
    plate.add(bones, role="context_bone")
    plate.add(scm, role="active", system="resp", sprint_level=0.5)
    plate.add(scalenes, role="active", system="resp", sprint_level=0.65)
    plate.add(intercostal_ext, role="active", system="resp", sprint_level=0.8)
    plate.add(diaphragm, role="active", system="resp", sprint_level=1.0)
    plate.add(hub_larynx, role="active", system="resp", sprint_level=0.8)
    plate.add(hub_tree, role="active", system="resp", sprint_level=1.0)
    plate.add(z_lungs, role="context_skin")
    plate.custom = [(o, lung_material) for o in z_lungs]
    plate.center, plate.ortho_scale = FRAME_C, FRAME_H

    # Kotwice: prawa strona ciała (z przodu = lewa strona obrazu), bo podpisy widoku "front" idą w lewo.
    A = {
        "larynx": {"objects": ["VH_M_thyroid_cartilage"], "views": ["front"], "offset": (-0.012, 0.0)},
        "trachea": {"objects": ["VH_M_trachea"], "views": ["front"], "offset": (-0.008, 0.01)},
        "scalene": {"objects": ["Scalenus anterior muscle.r"], "views": ["front"], "offset": (0.0, -0.01)},
        "main_bronchus": {"objects": ["VH_M_right_main_bronchus"], "views": ["front"]},
        "lung": {"objects": ["Superior lobe of right lung"], "views": ["front"], "offset": (-0.035, 0.0)},
        # Po cięciu klatki mięśnie międzyżebrowe widać tylko na bocznej ścianie: kotwica w punkcie (pusty obiekt).
        "intercostal": {"objects": ["ATL_mk_intercostal"], "views": ["front"]},
        "diaphragm": {"objects": [diaphragm[0].name], "views": ["front"], "offset": (-0.07, -0.02)},
    }
    mk = bpy.data.objects.get("ATL_mk_intercostal") or bpy.data.objects.new("ATL_mk_intercostal", None)
    mk.location = (-0.133, -0.03, 1.30)
    mk.empty_display_size = 0.001
    if mk.name not in plate.col.objects:
        plate.col.objects.link(mk)
    plate.scene.view_layers[0].update()
    missing = [k for k, a in A.items() for n in a["objects"] if n not in bpy.data.objects]
    if missing:
        print("ATLAS_MISSING_ANCHORS", missing)
        A = {k: a for k, a in A.items() if k not in missing}

    # Strzałki powietrza: krtań -> tchawica -> rozwidlenie -> oskrzela główne -> płaty dolne.
    def c(name):
        return bbox_center([bpy.data.objects[name]])

    lar_c, lar_mn, lar_mx = c("VH_M_thyroid_cartilage")
    tr_c, tr_mn, tr_mx = c("VH_M_trachea")
    car_c, _, _ = c("VH_M_carina")
    rb_c, rb_mn, rb_mx = c("VH_M_right_main_bronchus")
    lb_c, lb_mn, lb_mx = c("VH_M_left_main_bronchus")
    r_end = c("VH_M_right_lower_lobar_bronchus")[0]
    r_base = c("VH_M_right_anterior_basal_bronchus")[0]
    r_up = c("VH_M_right_apical_bronchus")[0]
    l_end = c("VH_M_left_inferior_lobar_bronchus")[0]
    l_base = c("VH_M_left_lateral_basal_bronchus")[0]
    l_up = c("VH_M_left_apical_bronchus")[0]
    top = Vector((tr_c.x, 0, lar_mx.z + 0.02))
    path_r = [top, Vector((tr_c.x, 0, tr_mx.z)), Vector((tr_c.x, 0, car_c.z + 0.012)), Vector((rb_mn.x, 0, rb_c.z - 0.006)), r_end, r_base]
    path_l = [Vector((tr_c.x, 0, car_c.z + 0.012)), Vector((lb_mx.x, 0, lb_c.z - 0.008)), l_end, l_base]
    path_ru = [Vector((rb_mn.x, 0, rb_c.z - 0.006)), r_up]
    path_lu = [Vector((lb_mx.x, 0, lb_c.z - 0.008)), l_up]
    flows["front"] = [
        {"label": "Wdech: powietrze do płuca prawego", "kind": "air", "points": plate.pixels("front", path_r)},
        {"label": "Wdech: powietrze do płuca lewego", "kind": "air", "points": plate.pixels("front", path_l)},
        {"label": "Płat górny prawy", "kind": "air", "points": plate.pixels("front", path_ru)},
        {"label": "Płat górny lewy", "kind": "air", "points": plate.pixels("front", path_lu)},
    ]
    metas.append(plate.render(views=("front",), states=("rest", "sprint"), anchors=A))


# ---------------------------------------------------------------- widok DETAIL: pęcherzyki płucne (schemat)
def sphere_cluster(name, centers, radius, loc):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    for c_, r in zip(centers, radius):
        bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=20, radius=r, matrix=Matrix.Translation(c_))
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    rm = ob.modifiers.new("ATL_remesh", 'REMESH')
    rm.mode = 'VOXEL'
    rm.voxel_size = 0.008
    sm = ob.modifiers.new("ATL_smooth", 'CORRECTIVE_SMOOTH')
    sm.iterations = 8
    sm.use_only_smooth = True
    me.shade_smooth()
    return ob


def tube(name, pts, r, loc, radii=None):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = r
    cu.bevel_resolution = 6
    cu.use_fill_caps = True
    sp = cu.splines.new('BEZIER')
    sp.bezier_points.add(len(pts) - 1)
    for i, (bp, p) in enumerate(zip(sp.bezier_points, pts)):
        bp.co = p
        bp.radius = radii[i] if radii else 1.0
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    ob = bpy.data.objects.new(name, cu)
    ob.location = loc
    return ob


def ring(name, center, radius, normal, r, loc, arc=(0.0, 2 * math.pi), n=48):
    """Naczynie włosowate: łuk okręgu na powierzchni pęcherzyka."""
    nrm = Vector(normal).normalized()
    a = nrm.orthogonal().normalized()
    b = nrm.cross(a)
    pts = []
    for i in range(n + 1):
        t = arc[0] + (arc[1] - arc[0]) * i / n
        pts.append(Vector(center) + radius * (math.cos(t) * a + math.sin(t) * b))
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = r
    cu.bevel_resolution = 3
    cu.use_fill_caps = True
    sp = cu.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for p, v in zip(sp.points, pts):
        p.co = (*v, 1.0)
    ob = bpy.data.objects.new(name, cu)
    ob.location = loc
    return ob


if PART in ("all", "detail"):
    random.seed(7)
    L = Vector((20.0, 0.0, 0.0))  # daleko od ciała (osobna scena i tak, ale porządek)
    # Grono pęcherzyków: wokół przewodu pęcherzykowego, przód (-Y) dobrze widoczny.
    alv_centers = [
        (0.0, 0.0, 0.0), (-0.17, -0.02, 0.05), (0.17, -0.03, 0.04), (-0.09, -0.11, -0.12), (0.10, -0.10, -0.13),
        (-0.22, 0.04, -0.12), (0.23, 0.03, -0.11), (0.0, -0.05, -0.24), (-0.13, 0.02, -0.29), (0.14, 0.01, -0.29),
        (-0.08, 0.09, 0.12), (0.09, 0.08, 0.13), (0.0, 0.10, -0.12),
    ]
    alv_r = [0.105, 0.1, 0.1, 0.1, 0.1, 0.095, 0.095, 0.1, 0.09, 0.09, 0.09, 0.09, 0.1]
    alv_centers = [Vector(p) for p in alv_centers]
    sac = sphere_cluster("ATL_alveolar_sac", alv_centers, alv_r, L)
    # Przewód pęcherzykowy (cienki odcinek wnikający w grono) i oskrzelik końcowy nad nim.
    # Oskrzelik wychodzi poza górną krawędź kadru (wygląda na ciągły, bez uciętego końca).
    bronchiole = tube("ATL_bronchiole", [Vector((0.09, 0.0, 1.25)), Vector((0.03, 0, 0.6)), Vector((0, 0, 0.05))], 0.07, L,
                      radii=[1.0, 0.85, 0.6])
    # Krew: tętniczka płucna (krew odtlenowana) wchodzi z lewej, żyłka płucna (utlenowana) wychodzi z prawej.
    arteriole = tube("ATL_pulm_arteriole", [Vector((-0.46, -0.02, 0.38)), Vector((-0.34, -0.06, 0.18)), Vector((-0.24, -0.10, 0.02))], 0.032, L)
    venule = tube("ATL_pulm_venule", [Vector((0.25, -0.10, -0.02)), Vector((0.36, -0.06, -0.2)), Vector((0.46, -0.02, -0.42))], 0.032, L)
    caps_vein, caps_art, caps_extra = [], [], []
    k = 0
    for ci, (cc, rr) in enumerate(zip(alv_centers, alv_r)):
        for j in range(3):
            nrm = Vector((random.uniform(-1, 1), random.uniform(-0.6, 0.6), random.uniform(-1, 1)))
            ob = ring(f"ATL_capillary_{k:02d}", cc, rr * 1.01, nrm, 0.0075, L)
            k += 1
            if j == 2:
                caps_extra.append(ob)  # rezerwa: otwiera się dopiero w wysiłku (rekrutacja naczyń)
            elif cc.x + random.uniform(-0.05, 0.05) < 0:
                caps_vein.append(ob)
            else:
                caps_art.append(ob)
    extra_vein = [o for o in caps_extra if (o.data.splines[0].points[0].co.x < 0)]
    extra_art = [o for o in caps_extra if o not in extra_vein]

    det = RespPlate("oddechowy", resolution=RES)
    det.add([sac], role="active", system="resp", sprint_level=1.0)
    det.add([bronchiole], role="active", system="resp", sprint_level=0.75)
    det.add([arteriole] + caps_vein + extra_vein, role="active", system="vein", sprint_level=1.0)
    det.add([venule] + caps_art + extra_art, role="active", system="artery", sprint_level=1.0)
    det.rest_hidden = caps_extra
    det.scene.view_layers[0].update()
    mn, mx = det.frame_all(margin=1.1)
    # Kadr: szerokość grona + naczyń, dół pod gronem; oskrzelik ucięty górną krawędzią.
    width = 1.10 * 2 * max(abs(mn.x - L.x), abs(mx.x - L.x))
    det.ortho_scale = width * det.res[1] / det.res[0]
    bottom = mn.z - 0.05
    det.center = Vector((L.x, 0.0, bottom + det.ortho_scale / 2))
    print("ATLAS_DETAIL_BBOX", tuple(round(v, 3) for v in mn), tuple(round(v, 3) for v in mx), round(det.ortho_scale, 3))

    # Pomocnicze puste obiekty jako kotwice (anchor_point przyjmuje nazwy obiektów).
    def marker(name, p):
        e = bpy.data.objects.get(name) or bpy.data.objects.new(name, None)
        e.location = L + Vector(p)
        e.empty_display_size = 0.001
        return e

    a_alv = alv_centers[4]
    marker("ATL_mk_alveolus", a_alv + Vector((0.0, -alv_r[4], 0.0)))
    # Kotwica naczyń: najbardziej wysunięty do przodu punkt naczynia włosowatego po prawej stronie obrazu.
    cap_pts = [Vector(p.co[:3]) for o in caps_art for p in o.data.splines[0].points]
    cap_pt = min((p for p in cap_pts if 0.12 < p.x < 0.3 and -0.05 < p.z < 0.2), key=lambda p: p.y)
    marker("ATL_mk_capillary", cap_pt)
    marker("ATL_mk_bronchiole", Vector((0.04, -0.065, 0.66)))
    for n in ("ATL_mk_alveolus", "ATL_mk_capillary", "ATL_mk_bronchiole"):
        det.col.objects.link(bpy.data.objects[n])
    det.scene.view_layers[0].update()
    A2 = {
        "alveolus": {"objects": ["ATL_mk_alveolus"], "views": ["detail"]},
        "capillary": {"objects": ["ATL_mk_capillary"], "views": ["detail"]},
        "bronchiole": {"objects": ["ATL_mk_bronchiole"], "views": ["detail"]},
    }
    P = lambda *pts: det.pixels("detail", [L + Vector(p) for p in pts])  # noqa: E731
    flows["detail"] = [
        {"label": "Powietrze do pęcherzyków", "kind": "air", "points": P((0.05, -0.1, 0.84), (0.01, -0.1, 0.5), (0.0, -0.12, 0.12))},
        {"label": "O₂: z pęcherzyka do krwi", "kind": "air", "points": P((-0.02, -0.2, -0.02), (-0.13, -0.2, 0.06), (-0.24, -0.16, 0.12))},
        {"label": "CO₂: z krwi do pęcherzyka", "kind": "air", "points": P((0.26, -0.16, 0.14), (0.14, -0.2, 0.08), (0.04, -0.2, 0.02))},
        {"label": "Krew odtlenowana z serca", "kind": "vein", "points": P((-0.46, -0.06, 0.38), (-0.34, -0.1, 0.18), (-0.24, -0.14, 0.02))},
        {"label": "Krew utlenowana do serca", "kind": "artery", "points": P((0.25, -0.14, -0.02), (0.36, -0.1, -0.2), (0.46, -0.06, -0.42))},
    ]
    metas.append(det.render(views=("detail",), states=("rest", "sprint"), anchors=A2))

merge_anchors(OUT, base_anchors, metas, flows)
