"""
Plansza UKŁAD MOCZOWY (WYDALNICZY) (faza 1b, agent 9). Zasady: docs/ATLAS_STYLE_BIBLE.md
  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/plate_wydalniczy.py

LICENCJA: nerka Z-Anatomy ("Kidney - by Lissie Cowley - CC-BY-NC 4.0": Kidney.l/.r, Renal pelvis.l/.r, krzywe naczyń
wewnątrznerkowych) NIE trafia na planszę. Blokuje ją atlas_lib (license_check); ten skrypt jej nawet nie dodaje.
  - Nerki, miedniczki, kielichy, moczowody i naczynia nerkowe: HuBMAP VH Male (CC BY 4.0), dopasowane al.align_hubmap.
  - Krzywe Z-Anatomy "Ureter.l/.r" kończą się wewnątrz miedniczki NC, więc ich nie używamy (moczowody z HuBMAP).
  - Z-Anatomy (CC BY-SA 4.0): pęcherz moczowy, cewka moczowa (krzywa), nadnercza, aorta brzuszna, żyła główna dolna,
    tętnice i żyły biodrowe wspólne (krzywe), szkielet, mięśnie lędźwiowe jako tło, sylwetka (al.build_silhouette).
  - HuBMAP VH_M_Blood_Vasculature_Kidney ma zamienione nazwy tętnic: "VH_M_left_renal_artery" leży po stronie
    prawej ciała (−X). Tętnice wybieramy więc po położeniu, nie po nazwie.

Widoki (jedna rozdzielczość na planszę, jak oddechowy):
  front   jama brzuszna i miednica z przodu: nerki, naczynia nerkowe, moczowody, pęcherz, cewka, nadnercza; szkielet,
          mięśnie lędźwiowe i sylwetka jako tło; żebra półprzezroczyste (zasłaniałyby nerki).
  detail  nefron (SCHEMAT, geometria proceduralna): kłębuszek w torebce, kanaliki, pętla, cewka zbiorcza z akwaporynami.

Stany: nerka w sprincie dostaje mniej krwi, więc odwrotnie niż w innych planszach to SPOCZYNEK ma pełniejszy kolor
nerek, naczyń nerkowych i moczowodów, a sprint jest przygaszony. W sprincie świecą nadnercza (spina z planszą
hormonalną), a w zbliżeniu cewka zbiorcza z dużą liczbą akwaporyn (działanie ADH). Jasność = ilustracja w 3 stopniach.

Zmienne:
  ATLAS_QUICK=1         (atlas_lib) tylko front/sprint
  ATLAS_ANCHORS_ONLY=1  tylko kotwice i strzałki
  ATLAS_DRY=1           tylko wypisuje dopasowania i tory strzałek
  WYD_FIT=<folder>      render kontrolny dopasowania HuBMAP do szkieletu Z-Anatomy (przód, bok, tył) do <folder>
  WYD_OUT=<folder>      zapis renderów planszy poza public/ (podgląd K1)
"""
import math
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402
import bmesh  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from mathutils import Matrix, Vector  # noqa: E402

DRY = bool(os.environ.get("ATLAS_DRY"))
FIT_DIR = os.environ.get("WYD_FIT")
OUT_DIR = os.environ.get("WYD_OUT")
RES = (1150, 1600)
# Kadr widoku front: od nadnerczy (z ok. 1,18) do cewki pod spojeniem łonowym (z ok. 0,75).
FRAME_C = Vector((0.0, 0.0, 0.985))
FRAME_H = 0.50
FRAME_W = FRAME_H * RES[0] / RES[1]


def bb(objs):
    mn, mx = al.vert_bbox(objs)
    return [round(v, 4) for v in mn], [round(v, 4) for v in mx]


def center(objs):
    mn, mx = al.vert_bbox(objs)
    return (mn + mx) / 2


# ============================================================ HuBMAP (CC BY 4.0)
H = {}
for f in ("VH_M_Kidney_L.glb", "VH_M_Kidney_R.glb", "VH_M_Blood_Vasculature_Kidney.glb", "VH_M_Ureter_L.glb",
          "VH_M_Ureter_R.glb"):
    ms = al.import_glb(f, collection="WYD_hubmap")
    al.align_hubmap(ms, "male")
    H[f] = ms


def hub_all():
    return [o for ms in H.values() for o in ms]


kidney = {s: H[f"VH_M_Kidney_{s}.glb"] for s in ("L", "R")}
# Powierzchnia nerki: torebka (zewnętrzna skorupa). Wnętrze (piramidy, słupy) jest pod nią i nie wpływa na obraz.
kidney_shell = {s: [o for o in kidney[s] if "capsule" in o.name or "hilum" in o.name] for s in ("L", "R")}
kidney_inner = {s: [o for o in kidney[s] if o not in kidney_shell[s]] for s in ("L", "R")}
uret = {s: H[f"VH_M_Ureter_{s}.glb"] for s in ("L", "R")}
ureter_tube = {s: al.hub(uret[s], f"VH_M_ureter_{s}") for s in ("L", "R")}
pelvis_hub = {s: [o for o in uret[s] if "pelvis" in o.name or "calyx" in o.name] for s in ("L", "R")}
vasc = H["VH_M_Blood_Vasculature_Kidney.glb"]
arteries = [o for o in vasc if "artery" in o.name]
veins = [o for o in vasc if "vein" in o.name]
# Strona po położeniu (HuBMAP ma zamienione nazwy tętnic): x < 0 = prawa strona ciała.
art = {("R" if center([o]).x < 0 else "L"): o for o in arteries}
vein = {("R" if center([o]).x < 0 else "L"): o for o in veins}
print("WYD_ART", {k: v.name for k, v in art.items()}, "VEIN", {k: v.name for k, v in vein.items()})

# ============================================================ Z-Anatomy (CC BY-SA 4.0)
bladder = [bpy.data.objects["Urinary bladder"]]
urethra = [bpy.data.objects["Urethra"]]
adrenals = [bpy.data.objects["Suprarenal gland.l"], bpy.data.objects["Suprarenal gland.r"]]
aorta = al.find_curves(include=[r"^Abdominal aorta$", r"^Common iliac artery\.(l|r)$"])
ivc = al.find_curves(include=[r"^Inferior vena cava \(abdominal part\)$", r"^Common iliac vein\.(l|r)$"])
psoas = al.find_meshes(collection="4: Muscular system", include=[r"^Psoas major\.(l|r)$", r"^Quadratus lumborum muscle\.(l|r)$"])
for o in bladder:
    if not any(m.type == 'SUBSURF' for m in o.modifiers):
        mod = o.modifiers.new("ATL_subsurf", 'SUBSURF')
        mod.levels = mod.render_levels = 1
    for p in o.data.polygons:
        p.use_smooth = True
al.thicken_curves(urethra, scale=1.0)
# Aorta i żyła główna: realne promienie Z-Anatomy (bevel 0,0005 × promień punktu), lekko pogrubione do zbliżenia.
al.thicken_curves(aorta + ivc, scale=1.1)

RIB_RE = re.compile(r"\brib\b|costal cartilage|sternum|xiphoid", re.I)


def in_frame(o, pad=0.02):
    mn, mx = al.vert_bbox([o])
    return (mx.z > FRAME_C.z - FRAME_H / 2 - pad and mn.z < FRAME_C.z + FRAME_H / 2 + pad
            and mx.x > -FRAME_W / 2 - pad and mn.x < FRAME_W / 2 + pad)


bones_all = [o for o in al.find_meshes(collection="1: Skeletal system") if in_frame(o)]
ribs = [o for o in bones_all if RIB_RE.search(o.name)]
bones = [o for o in bones_all if o not in ribs]

# kontrola licencji: żadna struktura NC nie może być w zbiorach planszy
_all_front = bones_all + psoas + bladder + urethra + adrenals + aorta + ivc + hub_all()
al.license_check(_all_front, "wydalniczy (kontrola wstępna)")

# ---------------------------------------------------------------- pomiary dopasowania (tylko obiekty z licencją BY/BY-SA)
# Porównanie z nerką Z-Anatomy (NC) robi osobne narzędzie kontrolne poza repozytorium (inspect_uro.py w notatkach);
# ten skrypt nie wczytuje żadnego obiektu z NC_BLOCKLIST.
FIT_REPORT = {}
for s, adr in (("L", "Suprarenal gland.l"), ("R", "Suprarenal gland.r")):
    kmn, kmx = al.vert_bbox(kidney[s])
    amn, amx = al.vert_bbox([bpy.data.objects[adr]])
    FIT_REPORT[f"adrenal_{s}_gap_cm"] = round((amn.z - kmx.z) * 100, 2)  # < 0: nadnercze zachodzi na biegun górny
# poziom wnęki nerki względem kręgów (anatomicznie: L1-L2)
for v in ("Vertebra T12", "Vertebra L1", "Vertebra L2", "Vertebra L3"):
    if v in bpy.data.objects:
        mn, mx = al.vert_bbox([bpy.data.objects[v]])
        FIT_REPORT[v] = [round(mn.z, 3), round(mx.z, 3)]
for s in ("L", "R"):
    FIT_REPORT[f"hilum_{s}_z"] = round(center([al.hub(kidney[s], f"VH_M_hilum_of_kidney_{s}")]).z, 3)
# koniec moczowodu HuBMAP względem pęcherza Z-Anatomy
bmn, bmx = al.vert_bbox(bladder)
for s in ("L", "R"):
    P = al._world_points(ureter_tube[s])
    low = P[P[:, 2] <= P[:, 2].min() + 0.004].mean(0)
    inside = all(bmn[i] - 0.003 <= low[i] <= bmx[i] + 0.003 for i in range(3))
    FIT_REPORT[f"ureter_{s}_end"] = [round(v, 4) for v in low] + ["w obrysie pęcherza" if inside else "POZA pęcherzem"]
print("WYD_FIT_REPORT", FIT_REPORT)
print("WYD_BONES", len(bones), "ribs", len(ribs), "psoas", [o.name for o in psoas], "aorta", [o.name for o in aorta],
      "ivc", [o.name for o in ivc])


# ============================================================ osie rurek HuBMAP (tory strzałek)
def tube_axis(obj, axis=2, bins=24, reverse=False):
    """Oś rurki (siatka HuBMAP): średnia wierzchołków w przedziałach wzdłuż osi `axis` (moczowód: z, tętnica: x)."""
    P = al._world_points(obj)
    lo, hi = P[:, axis].min(), P[:, axis].max()
    edges = np.linspace(lo, hi, bins + 1)
    pts = []
    for a, b in zip(edges, edges[1:]):
        sel = P[(P[:, axis] >= a) & (P[:, axis] <= b)]
        if len(sel):
            pts.append(Vector(sel.mean(0).tolist()))
    return pts[::-1] if reverse else pts


def oriented(pts, start_near):
    return pts if (pts[0] - start_near).length <= (pts[-1] - start_near).length else pts[::-1]


aorta_main = bpy.data.objects["Abdominal aorta"]
ivc_main = bpy.data.objects["Inferior vena cava (abdominal part)"]
FLOWS = []
for s, side in (("R", "prawej"), ("L", "lewej")):
    hil = center([al.hub(kidney[s], f"VH_M_hilum_of_kidney_{s}")])
    a_pts = oriented(tube_axis(art[s], axis=0), Vector((0.008, 0, hil.z)))  # od aorty do wnęki
    z0 = a_pts[0].z
    aorta_pts = [p for p in al.curve_points(aorta_main, start_near=(0, 0, 2)) if p.z > z0][-6:] + [a_pts[0]]
    FLOWS.append({"id": f"artery_kidney_{s}", "kind": "artery", "labelPl": f"Krew z aorty do nerki {side}",
                  "views": ["front"], "points": aorta_pts + a_pts[1:]})
    v_pts = oriented(tube_axis(vein[s], axis=0), hil)  # od wnęki do żyły głównej dolnej
    FLOWS.append({"id": f"vein_kidney_{s}", "kind": "vein", "labelPl": f"Krew z nerki {side} do żyły głównej dolnej",
                  "views": ["front"], "points": v_pts})
    u_pts = tube_axis(ureter_tube[s], axis=2, reverse=True)  # z góry (miedniczka) w dół (pęcherz)
    FLOWS.append({"id": f"urine_{s}", "kind": "urine", "labelPl": f"Mocz: moczowód {side.replace('ej', 'y')} do pęcherza",
                  "views": ["front"], "points": u_pts})
for fl in FLOWS:
    p = fl["points"]
    print("WYD_FLOW", fl["id"], len(p), [round(v, 3) for v in p[0]], "->", [round(v, 3) for v in p[-1]])

if DRY:
    raise SystemExit(0)


# ============================================================ schemat nefronu (geometria proceduralna)
L = Vector((30.0, 0.0, 0.0))  # daleko od ciała


def curve_obj(name, pts, r, cyclic=False, res=6, radii=None, poly=False):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = r
    cu.bevel_resolution = res
    cu.use_fill_caps = True
    if poly:
        sp = cu.splines.new('POLY')
        sp.points.add(len(pts) - 1)
        for i, (p, v) in enumerate(zip(sp.points, pts)):
            p.co = (*v, 1.0)
            p.radius = radii[i] if radii else 1.0
    else:
        sp = cu.splines.new('BEZIER')
        sp.bezier_points.add(len(pts) - 1)
        for i, (bp, v) in enumerate(zip(sp.bezier_points, pts)):
            bp.co = v
            bp.radius = radii[i] if radii else 1.0
            bp.handle_left_type = bp.handle_right_type = 'AUTO'
    sp.use_cyclic_u = cyclic
    ob = bpy.data.objects.new(name, cu)
    ob.location = L
    return ob


def wiggle(a, b, n_turns, amp, steps=60, plane=(1, 0, 0), depth=0.0):
    """Kręta rurka (kanalik kręty) między punktami a i b: sinusoida w płaszczyźnie obrazu + lekko w głąb."""
    a, b = Vector(a), Vector(b)
    d = b - a
    side = d.cross(Vector((0, 1, 0))).normalized() if abs(d.normalized().y) < 0.9 else Vector(plane)
    pts = []
    for i in range(steps + 1):
        t = i / steps
        env = math.sin(math.pi * t)
        p = a + d * t + side * amp * env * math.sin(2 * math.pi * n_turns * t)
        p.y += depth * env * math.cos(2 * math.pi * n_turns * t)
        pts.append(p)
    return pts


def sphere(name, c, r, seg=40, cut_front=None):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=r, matrix=Matrix.Translation(Vector(c)))
    if cut_front is not None:  # usuń przednią czaszę (widok z −Y): torebka otwarta, widać kłębuszek
        kill = [v for v in bm.verts if v.co.y < Vector(c).y - cut_front]
        bmesh.ops.delete(bm, geom=kill, context='VERTS')
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    ob.location = L
    if cut_front is not None:
        sol = ob.modifiers.new("ATL_shell", 'SOLIDIFY')
        sol.thickness = 0.012
    return ob


GLOM_C = Vector((-0.36, 0.0, 0.74))
caps_c = GLOM_C + Vector((0.0, 0.0, 0.0))
capsule = sphere("WYD_bowman_capsule", caps_c, 0.17, cut_front=0.03)
# kłębuszek: splot pętli naczyń włosowatych w kuli r ≈ 0,11
rng = np.random.default_rng(11)
glom_loops = []
for k in range(14):
    nrm = Vector(rng.uniform(-1, 1, 3).tolist()).normalized()
    a = nrm.orthogonal().normalized()
    b = nrm.cross(a)
    rr = rng.uniform(0.045, 0.075)
    off = Vector(rng.uniform(-0.04, 0.04, 3).tolist())
    pts = [GLOM_C + off + rr * (math.cos(t) * a + math.sin(t) * b) for t in np.linspace(0, 2 * math.pi, 40)]
    glom_loops.append(curve_obj(f"WYD_glom_{k:02d}", pts, 0.011, cyclic=True, res=3, poly=True))
# tętniczki: doprowadzająca (z lewej, z góry) i odprowadzająca (w prawo, w górę); w sprincie węższe (dwie wersje)
aff_path = [Vector((-0.86, -0.02, 1.16)), Vector((-0.66, -0.02, 1.0)), Vector((-0.5, -0.02, 0.86)), GLOM_C + Vector((-0.06, 0, 0.05))]
eff_path = [GLOM_C + Vector((0.05, 0, 0.06)), Vector((-0.2, -0.02, 0.92)), Vector((-0.06, -0.03, 1.02)), Vector((0.1, -0.03, 1.02)),
            Vector((0.22, -0.04, 0.9))]
aff = {"rest": curve_obj("WYD_afferent_rest", aff_path, 0.036), "sprint": curve_obj("WYD_afferent_sprint", aff_path, 0.022)}
eff = {"rest": curve_obj("WYD_efferent_rest", eff_path, 0.028), "sprint": curve_obj("WYD_efferent_sprint", eff_path, 0.019)}
# naczynia okołokanalikowe / proste: z tętniczki odprowadzającej w dół wzdłuż pętli i z powrotem (krew odtlenowana po drodze)
peri = curve_obj("WYD_vasa_recta", [Vector((0.22, -0.04, 0.9)), Vector((0.28, -0.07, 0.3)), Vector((0.28, -0.07, -0.45)),
                                     Vector((0.34, -0.07, -0.62)), Vector((0.4, -0.07, -0.45)), Vector((0.4, -0.07, 0.3)),
                                     Vector((0.44, -0.05, 0.95)), Vector((0.36, -0.04, 1.28))], 0.016)  # uchodzi do żyłki (w górę), nie do cewki
# kanaliki
pct = curve_obj("WYD_pct", [GLOM_C + Vector((0.12, 0, -0.1))] + wiggle(GLOM_C + Vector((0.16, 0, -0.12)), Vector((-0.04, 0, 0.42)),
                                                                        3, 0.07, depth=0.05)[1:], 0.032, res=5)
loop_pts = [Vector((-0.04, 0, 0.42)), Vector((-0.03, 0, 0.0)), Vector((-0.02, 0, -0.5)), Vector((0.03, 0, -0.62)),
            Vector((0.08, 0, -0.5)), Vector((0.09, 0, 0.0)), Vector((0.1, 0, 0.45))]
loop = curve_obj("WYD_loop_henle", loop_pts, 0.026, radii=[1.0, 0.75, 0.75, 0.8, 1.0, 1.15, 1.15])
CD_X = 0.62
# kanalik dalszy uchodzi wprost do cewki zbiorczej (jedna krzywa, bez szczeliny na łączeniu)
dct = curve_obj("WYD_dct", wiggle(Vector((0.1, 0, 0.45)), Vector((CD_X - 0.035, 0, 0.6)), 2, 0.06, depth=0.04), 0.03, res=5)
cd = curve_obj("WYD_collecting_duct", [Vector((CD_X - 0.04, 0, 1.3)), Vector((CD_X, 0, 0.6)), Vector((CD_X + 0.01, 0, -0.2)),
                                        Vector((CD_X + 0.02, 0, -0.95))], 0.055, radii=[0.8, 1.0, 1.1, 1.2])


def aqp_dots(name, n, seed):
    """Akwaporyny w błonie cewki zbiorczej (kropki na przedniej ścianie). Schemat: liczba kropek ≈ "mało" / "dużo"."""
    r = np.random.default_rng(seed)
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    zs = np.linspace(0.5, -0.85, n)
    for i, z in enumerate(zs):
        ang = r.uniform(-1.1, 1.1)
        x = CD_X + 0.01 * (0.6 - z) / 1.5
        rad = 0.055 * (1.0 + 0.15 * (0.6 - z) / 1.5) + 0.004
        c = Vector((x + rad * math.sin(ang), -rad * math.cos(ang), z + r.uniform(-0.02, 0.02)))
        bmesh.ops.create_uvsphere(bm, u_segments=10, v_segments=6, radius=0.012, matrix=Matrix.Translation(c))
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    ob.location = L
    return ob


aqp_rest = aqp_dots("WYD_aqp_rest", 6, 3)
aqp_sprint = aqp_dots("WYD_aqp_sprint", 26, 5)
NEPHRON = [capsule, pct, loop, dct, cd]

# ============================================================ materiały i plansza
URIN = al.hex_to_linear(al.SYSTEM_COLORS["urinary"])
MUSC = al.hex_to_linear(al.CONTEXT_COLORS["muscle"])
BONE = al.hex_to_linear(al.CONTEXT_COLORS["bone"])


# Stopnie jasności (ilustracja, nie liczba ze źródła): pełny 1,0 / średni 0,65 / przygaszony 0,35.
# K3: kolor układu z palette.json (#276777) jest ciemny; przy mieszaniu z kością poniżej ok. 0,5 wychodził szary,
# więc przygaszenie sprintu to 0,52-0,65 (spoczynek nadal wyraźnie jaśniejszy, kolejność bez zmian).
LEVELS = {
    #                rest  sprint
    "kidney":       (0.85, 0.52),
    "pelvis":       (0.95, 0.60),
    "ureter":       (0.85, 0.55),
    "bladder":      (0.65, 0.65),
    "urethra":      (0.65, 0.65),
    "nephron":      (0.85, 0.58),
    "duct":         (0.70, 1.00),   # cewka zbiorcza: w sprincie ADH -> więcej akwaporyn
}


# Integracja 1b cz. 2: poziomy z LEVELS liczy atlas_lib (Plate.add z rest_level/sprint_level), jak w innych planszach:
# spoczynek bez świecenia, w sprincie świecenie wg reguły palette.json (poziom >= 0,6). Dawniej lokalne materiały
# (lvl_fn) i naczynia liczone stanem „sprint” także w spoczynku (świeciły w spoczynku).
CTX = {id(BONE): "bone", id(MUSC): "muscle"}


def add_lvl(p, objs, key, alpha=None, ctx=BONE, views=None):
    r, s = LEVELS[key]
    p.add(objs, role="active", system="urinary", rest_level=r, sprint_level=s, alpha=alpha, ctx=CTX[id(ctx)], views=views)


class UroPlate(al.Plate):
    """Lokalnie: materiały zależne od stanu (nerki jaśniejsze w spoczynku) i obiekty widoczne tylko w jednym stanie."""

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.custom = []        # (obj, fn(state) -> material)
        self.only_state = {}    # obj.name -> "rest" | "sprint"
        self._state = "sprint"

    LOCAL_ROLES = ("urinary", "renal_vessel")  # materiał wyłącznie z self.custom

    def _apply_state(self, state):
        self._state = state
        saved = self.items
        self.items = [i for i in self.items if i[1] not in self.LOCAL_ROLES]
        try:
            super()._apply_state(state)
        finally:
            self.items = saved
        for o, fn in self.custom:
            al.assign(o, fn(state))

    def _visible(self, view):
        super()._visible(view)
        for o, *_ in self.items:
            st = self.only_state.get(o.name)
            if st and st != self._state:
                o.hide_render = True


def front_surface(objs, frac=0.12, zband=None, xband=None):
    """Punkt na widocznej z przodu (−Y) powierzchni obiektu(ów), blisko środka tej powierzchni."""
    P = np.vstack([al._world_points(o) for o in objs])
    if zband:
        z0, z1 = P[:, 2].min(), P[:, 2].max()
        P = P[(P[:, 2] >= z0 + zband[0] * (z1 - z0)) & (P[:, 2] <= z0 + zband[1] * (z1 - z0))]
    if xband:
        x0, x1 = P[:, 0].min(), P[:, 0].max()
        P = P[(P[:, 0] >= x0 + xband[0] * (x1 - x0)) & (P[:, 0] <= x0 + xband[1] * (x1 - x0))]
    front = P[P[:, 1] <= np.quantile(P[:, 1], frac)]
    c = front[:, [0, 2]].mean(0)
    return Vector(front[np.argmin(((front[:, [0, 2]] - c) ** 2).sum(1))].tolist())


# ---------------------------------------------------------------- render kontrolny dopasowania (WYD_FIT)
if FIT_DIR:
    os.makedirs(FIT_DIR, exist_ok=True)
    fit = UroPlate("wydalniczy_fit", resolution=RES, out_dir=FIT_DIR)
    fit.add(bones, role="context_bone")
    fit.add(ribs, role="context_bone_ghost")
    for s in ("L", "R"):
        fit.add(kidney_shell[s], role="active", system="urinary", alpha=0.45)
        fit.add(pelvis_hub[s] + [ureter_tube[s]], role="active", system="urinary")
    fit.add(arteries, role="active", system="artery")
    fit.add(veins, role="active", system="vein")
    fit.add(aorta, role="active", system="artery", ctx="muscle")
    fit.add(ivc, role="active", system="vein", ctx="muscle")
    fit.add(bladder + urethra, role="active", system="resp", alpha=0.6)  # Z-Anatomy: błękitny, żeby odróżnić źródło
    fit.add(adrenals, role="active", system="endo")
    for v in ("front", "side", "back"):
        fit.set_view(v, direction=v, center=FRAME_C, ortho_scale=FRAME_H)
    fit.render(views=("front", "side", "back"), states=("sprint",))
    print("WYD_FIT_DONE", FIT_DIR)
    raise SystemExit(0)

# ---------------------------------------------------------------- plansza
plate = UroPlate("wydalniczy", resolution=RES, out_dir=OUT_DIR)
hull = al.build_silhouette()
FRONT = ("front",)
DETAIL = ("detail",)
plate.add(bones, role="context_bone", views=FRONT)
plate.add(ribs, role="context_bone_ghost", views=FRONT)
plate.add(psoas, role="context_muscle", views=FRONT)
plate.add([hull], role="context_skin", views=FRONT)
# aorta i żyła główna dolna: źródło i ujście krwi nerek, w obu stanach w pełnym kolorze (rzut serca rośnie)
plate.add(aorta, role="active", system="artery", sprint_level=1.0, ctx="muscle", views=FRONT)
plate.add(ivc, role="active", system="vein", sprint_level=1.0, ctx="muscle", views=FRONT)
# naczynia nerkowe: pełne w spoczynku, przygaszone w sprincie (mniej krwi w nerkach)
art_objs, vein_objs = list(art.values()), list(vein.values())
plate.add(art_objs, role="active", system="artery", rest_level=1.0, sprint_level="dim", ctx="muscle", views=FRONT)
plate.add(vein_objs, role="active", system="vein", rest_level=0.9, sprint_level="dim", ctx="muscle", views=FRONT)
for s in ("L", "R"):
    # półprzezroczysta torebka: widać miedniczkę i kielichy (HuBMAP) wewnątrz nerki
    add_lvl(plate, kidney_shell[s], "kidney", alpha=0.6, views=FRONT)
    add_lvl(plate, pelvis_hub[s], "pelvis", views=FRONT)
    add_lvl(plate, [ureter_tube[s]], "ureter", ctx=MUSC, views=FRONT)
add_lvl(plate, bladder, "bladder", views=FRONT)
add_lvl(plate, urethra, "urethra", ctx=MUSC, views=FRONT)
# nadnercza: spoczynek przygaszony, sprint pełny kolor (rdzeń nadnerczy: adrenalina; spina z planszą hormonalną)
plate.add(adrenals, role="active", system="endo", sprint_level=1.0, views=FRONT)

# --- zbliżenie: nefron (schemat)
add_lvl(plate, [pct, loop, dct], "nephron", views=DETAIL)
add_lvl(plate, [capsule], "nephron", alpha=0.55, views=DETAIL)
add_lvl(plate, [cd], "duct", views=DETAIL)
plate.add([aqp_rest, aqp_sprint], role="urinary", views=DETAIL)
for o in (aqp_rest, aqp_sprint):
    plate.custom.append((o, lambda st: al.make_material("WYD_aqp", al.hex_to_linear("#E9F7F6"), roughness=0.5, emission=0.25)))
plate.only_state.update({aqp_rest.name: "rest", aqp_sprint.name: "sprint"})
plate.add(glom_loops, role="active", system="artery", rest_level=1.0, sprint_level=0.6, ctx="muscle", views=DETAIL)
for st in ("rest", "sprint"):
    plate.add([aff[st], eff[st]], role="active", system="artery", rest_level=1.0, sprint_level=1.0, ctx="muscle", views=DETAIL)
    plate.only_state.update({aff[st].name: st, eff[st].name: st})
plate.add([peri], role="active", system="vein", rest_level=0.9, sprint_level=0.9, ctx="muscle", views=DETAIL)


plate.set_view("front", direction="front", center=FRAME_C, ortho_scale=FRAME_H)
# obiekty schematu powstały poza sceną: bez przeliczenia matrix_world jest jednostkowa (obrys bez przesunięcia L)
plate.scene.view_layers[0].update()
dmn, dmx = al.vert_bbox(NEPHRON + [peri, aff["rest"], eff["rest"]] + glom_loops)
DET_H = (dmx.z - dmn.z) * 1.08
DET_H = max(DET_H, (dmx.x - dmn.x) * 1.12 * RES[1] / RES[0])
plate.set_view("detail", direction="front", center=Vector(((dmn.x + dmx.x) / 2, 0.0, (dmn.z + dmx.z) / 2)), ortho_scale=DET_H)
print("WYD_DETAIL_FRAME", bb(NEPHRON), round(DET_H, 3))

# ---------------------------------------------------------------- kotwice (prawa strona ciała = lewa strona obrazu)
A = {
    "kidney": {"point": front_surface(kidney_shell["R"], xband=(0.0, 0.55), zband=(0.55, 0.85)), "views": ["front"]},
    "renal_pelvis": {"point": front_surface(pelvis_hub["R"], frac=0.2), "views": ["front"]},
    "renal_artery": {"point": front_surface([art["R"]], xband=(0.35, 0.6), frac=0.25), "views": ["front"]},
    "renal_vein": {"point": front_surface([vein["R"]], xband=(0.15, 0.5), frac=0.25), "views": ["front"]},
    # moczowód: nad talerzem kości krzyżowej, poniżej rozwidlenia naczyń biodrowych (tam nie nakłada się na żyłę)
    "ureter": {"point": front_surface([ureter_tube["R"]], zband=(0.28, 0.38), frac=0.3), "views": ["front"]},
    "bladder": {"point": front_surface(bladder, zband=(0.55, 0.9)), "views": ["front"]},
    "urethra": {"curve": "Urethra", "t": 0.25, "views": ["front"]},
    # K3: kotwice na strukturach prawej strony ciała (lewa strona obrazu), bo wszystkie podpisy widoku front są z lewej
    "adrenal": {"point": front_surface([bpy.data.objects["Suprarenal gland.r"]]), "views": ["front"]},
    "aorta": {"point": al.curve_anchor(aorta_main, z=1.06) + Vector((0, -0.006, 0)), "views": ["front"]},
    "ivc": {"point": al.curve_anchor(ivc_main, z=1.07) + Vector((0, -0.006, 0)), "views": ["front"]},
    "glomerulus": {"point": L + GLOM_C + Vector((-0.02, -0.08, -0.02)), "views": ["detail"]},
    "bowman": {"point": L + caps_c + Vector((-0.15, -0.06, -0.06)), "views": ["detail"]},
    "afferent": {"point": L + Vector((-0.66, -0.06, 1.0)), "views": ["detail"]},
    "tubule": {"point": L + Vector((-0.12, -0.08, 0.6)), "views": ["detail"]},
    "loop": {"point": L + Vector((0.03, -0.05, -0.6)), "views": ["detail"]},
    "collecting_duct": {"point": L + Vector((CD_X + 0.01, -0.07, -0.1)), "views": ["detail"]},
}
# strzałki zbliżenia (metry w układzie sceny; kamera widoku "detail")
D = lambda *ps: [L + Vector(p) for p in ps]  # noqa: E731
FLOWS += [
    {"id": "d_blood_in", "kind": "artery", "labelPl": "Krew do kłębuszka", "views": ["detail"],
     "points": D((-0.86, -0.08, 1.16), (-0.66, -0.08, 1.0), (-0.5, -0.08, 0.86), (-0.42, -0.08, 0.79))},
    {"id": "d_filtrate", "kind": "urine", "labelPl": "Przesącz: kanalik → pętla → cewka zbiorcza", "views": ["detail"],
     "points": D((-0.2, -0.1, 0.62), (-0.04, -0.1, 0.42), (-0.03, -0.1, 0.0), (-0.02, -0.1, -0.5), (0.03, -0.1, -0.62),
                 (0.08, -0.1, -0.5), (0.09, -0.1, 0.0), (0.1, -0.1, 0.45), (0.3, -0.1, 0.6), (CD_X, -0.1, 0.6))},
    {"id": "d_urine_down", "kind": "urine", "labelPl": "Mocz do miedniczki nerkowej", "views": ["detail"],
     "points": D((CD_X, -0.12, 0.6), (CD_X + 0.01, -0.12, -0.2), (CD_X + 0.02, -0.12, -0.95))},
    {"id": "d_water_back", "kind": "vein", "labelPl": "Woda wraca do krwi (ADH, akwaporyny)", "views": ["detail"],
     "points": D((CD_X - 0.06, -0.1, -0.25), (0.52, -0.1, -0.27), (0.42, -0.1, -0.3))},
]
missing = [k for k, a in A.items() if "curve" in a and a["curve"] not in bpy.data.objects]
assert not missing, missing
meta = plate.render(views=("front", "detail"), states=("rest", "sprint"), anchors=A, flows3d=FLOWS)
print("WYD_DONE", plate.out_dir)

# ============================================================ BODY_FRONT: całe ciało tylko dla warstw „Całość”
# Decyzja Dyrygenta (K2, wariant B): ten widok NIE wchodzi do treści planszy. Kamera jak na planszy mięśniowej
# i krwionośnej (obrys kości i mięśni, margines 1,06, 1000×1800). Plate ma jedną rozdzielczość, a anchors.json planszy
# ma 1150×1600, więc całe ciało renderujemy osobną sceną do folderu tymczasowego i dopisujemy do anchors.json jako
# widok "body_front" z własnym polem "resolution". Pliki: body_front_rest.webp, body_front_sprint.webp.
if not any(os.environ.get(k) for k in ("WYD_SKIP_BODY", "ATLAS_QUICK", "ATLAS_ANCHORS_ONLY")):
    import json
    import shutil
    import tempfile

    tmp = tempfile.mkdtemp(prefix="wyd_body_")
    body = UroPlate("wydalniczy", resolution=(1000, 1800), out_dir=tmp)
    SKIP_BONES = [r"sternum", r"costal cartilage", r"^Rib", r"rib\.", r"^First rib", r"^Second rib", r"xiphoid"]
    all_bones = al.find_meshes(collection="1: Skeletal system")
    muscles_for_frame = al.find_meshes(collection="4: Muscular system", exclude_materials=al.MUSCLE_COVER_MATERIALS)
    body.add(al.find_meshes(collection="1: Skeletal system", exclude=SKIP_BONES), role="context_bone")
    body.add([hull], role="context_skin")
    body.add(art_objs, role="active", system="artery", rest_level=1.0, sprint_level="dim", ctx="muscle")
    body.add(vein_objs, role="active", system="vein", rest_level=0.9, sprint_level="dim", ctx="muscle")
    for s in ("L", "R"):
        add_lvl(body, kidney_shell[s], "kidney")
        add_lvl(body, pelvis_hub[s], "pelvis")
        add_lvl(body, [ureter_tube[s]], "ureter", ctx=MUSC)
    add_lvl(body, bladder, "bladder")
    add_lvl(body, urethra, "urethra", ctx=MUSC)
    body.set_view("body_front", direction="front", frame=all_bones + muscles_for_frame, margin=1.06)
    # Bez kotwic: warstwy „Całość” potrzebują tylko kamery. Kotwice z własną rozdzielczością widoku myliłyby
    # scripts/atlas_check_projection.ts, który rzutuje z rozdzielczością całego pliku (1150×1600).
    AB = {}
    bmeta = body.render(views=("body_front",), states=("rest", "sprint"), anchors=AB)
    vm = bmeta["views"]["body_front"]
    vm["resolution"] = [1000, 1800]
    vm["note"] = "Tylko dla warstw „Całość” (kamera planszy mięśniowej); nie jest widokiem planszy wydalniczej."
    for img in vm["images"].values():
        shutil.move(os.path.join(tmp, img), os.path.join(plate.out_dir, img))
    apath = os.path.join(plate.out_dir, "anchors.json")
    with open(apath, encoding="utf-8") as f:
        am = json.load(f)
    am["views"]["body_front"] = vm
    with open(apath, "w", encoding="utf-8") as f:
        json.dump(am, f, indent=2, ensure_ascii=False)
    shutil.rmtree(tmp, ignore_errors=True)
    print("WYD_BODY_DONE", vm["camera"])
