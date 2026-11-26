"""
Karta: UKŁAD KOSTNY w biegu (agent 10, faza 1b). Typ treści wg modelu: KARTA z jedną liczbą obciążenia
(pionowa siła reakcji podłoża), bez wymuszonej różnicy kolorów spoczynek/sprint.
  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/plate_kostny.py

Widoki:
  front   całe ciało od przodu, kamera jak na planszy mięśniowej (obrys kości i mięśni, margines 1,06)
  side    całe ciało z prawego boku (kamera po prawej stronie ciała, przód ciała po prawej stronie obrazu),
          ta sama skala co front; tor strzałki „droga obciążenia” od podeszwy prawej stopy do kości krzyżowej
  detail  (K2) przekrój bliższego końca kości udowej: istota zbita, gąbczasta (beleczki), jama szpikowa

Stany (jasność to ilustracja w 3 stopniach, nie pomiar):
  rest    cały szkielet jednakowo w kolorze spoczynku (35% koloru układu)
  sprint  „droga obciążenia” w pełnym kolorze: kości kończyny dolnej, miednica, kość krzyżowa, kręgi i krążki
          lędźwiowe, łąkotki; reszta szkieletu osiowego 0,6; kończyna górna przygaszona ('dim')

Kolor: token 'bone' z atlas_lib (#B9A37E) BEZ ZMIAN, do czasu decyzji integratora w palette.json (K3).

Zmienne środowiskowe:
  ATLAS_DRY=1           tylko wypisuje dopasowane struktury, bez renderu
  ATLAS_QUICK=1         szybki podgląd biblioteki (pierwszy widok, tylko sprint)
  ATLAS_ANCHORS_ONLY=1  tylko kotwice
  KOST_VIEWS=front,side które widoki renderować (domyślnie "front,side")
  KOST_PREVIEW=<folder> podgląd: oba stany, 50% rozdzielczości, wynik do <folder> (nie do public/)
"""
import math
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from mathutils import Vector  # noqa: E402

VIEWS = [v.strip() for v in os.environ.get("KOST_VIEWS", "front,side,detail").split(",") if v.strip()]
PREVIEW = os.environ.get("KOST_PREVIEW")


# ============================================================ struktury
def coll_names(name):
    c = bpy.data.collections.get(name)
    return {o.name for o in c.all_objects} if c else set()


bones = al.find_meshes(collection="1: Skeletal system")
# Stawy: tylko chrząstki i krążki (torebki i więzadła zakryłyby kości). Jądra miażdżyste leżą wewnątrz krążków.
joints = al.find_meshes(collection="3: Joints", include=[
    r"^Intervertebral disc ", r"^(Lateral|Medial) meniscus\.(l|r)$", r"^Interpubic disc$", r"^Sacrococcygeal symphysis$",
])
muscles_for_frame = al.find_meshes(collection="4: Muscular system", exclude=[r"^Rectus sheath", r"^Linea alba"],
                                   exclude_materials=al.MUSCLE_COVER_MATERIALS)

LOWER = coll_names("Bones of lower limb") | coll_names("Bony pelvis")
LUMBAR = coll_names("Lumbar vertebrae")
# Kończyna górna po nazwach (kolekcja "Bones of upper limb" w Z-Anatomy nie obejmuje ręki i obręczy barkowej).
UPPER_RE = re.compile(r"^(Humerus|Radius|Ulna|Scapula|Clavicle|Scaphoid bone|Lunate bone|Triquetrum bone|Pisiform bone|"
                      r"Trapezium bone|Trapezoid bone|Capitate bone|Hamate bone|.*metacarpal bone|.*finger of hand|"
                      r"Sesamoid bones of hand)\.(l|r)$")


def group_of(o):
    n = o.name
    if UPPER_RE.match(n):
        return "upper"
    if (n in LOWER or n in LUMBAR or n in ("Sacrum", "Coccyx", "Interpubic disc", "Sacrococcygeal symphysis")
            or n.startswith(("Vertebra L", "Intervertebral disc L", "Intervertebral disc T12-L1", "Lateral meniscus",
                             "Medial meniscus", "Hip bone"))):
        return "load"
    return "axial"


groups = {"load": [], "axial": [], "upper": []}
for o in bones + joints:
    groups[group_of(o)].append(o)
LEVEL = {"load": 1.0, "axial": 0.6, "upper": "dim"}

print("KOST_MATCH bones", len(bones), "joints", len(joints), {k: len(v) for k, v in groups.items()})
print("KOST_MATCH load", sorted({o.name for o in groups["load"] if not o.name.endswith(".l")}))
print("KOST_MATCH joints", sorted(o.name for o in joints))

if os.environ.get("ATLAS_DRY"):
    raise SystemExit(0)


# ============================================================ punkty pomocnicze (metry, układ Z-Anatomy)
def pts(*names):
    return np.vstack([al._world_points(bpy.data.objects[n]) for n in names])


def center(*names):
    P = pts(*names)
    return Vector(((P.min(0) + P.max(0)) / 2).tolist())


def femoral_head(side="r"):
    """Środek głowy kości udowej: najwyżej leżące punkty kości (głowa jest wyżej niż krętarz większy)."""
    P = pts(f"Femur.{side}")
    top = P[P[:, 2] > P[:, 2].max() - 0.025]
    c = top.mean(0)
    return Vector((c[0], c[1], P[:, 2].max() - 0.022))


def knee_center(side="r"):
    return center(f"Lateral meniscus.{side}", f"Medial meniscus.{side}")


def sole_point(side="r"):
    """Punkt podparcia pod środkiem stopy: najniższy poziom kości stopy, w połowie między piętą a głowami kości śródstopia."""
    heel = pts(f"Calcaneus.{side}")
    meta = pts(f"First metatarsal bone.{side}", f"Fifth metatarsal bone.{side}")
    z = min(heel[:, 2].min(), meta[:, 2].min())
    x = (heel[:, 0].mean() + meta[:, 0].mean()) / 2
    y = (heel[:, 1].mean() + meta[:, 1].mean()) / 2
    return Vector((x, y, z))


# ============================================================ zbliżenie: przekrój bliższego końca kości udowej
# Zewnętrzny kształt i obrys przekroju: prawdziwa siatka Femur.r (Z-Anatomy). Wnętrze (grubość istoty zbitej, pasma
# beleczek, jama szpikowa) Z-Anatomy NIE ma, więc jest SCHEMATEM narysowanym na płaszczyźnie przekroju (podpis „schemat”).
# Płaszczyzna: przez środek głowy kości udowej i oś trzonu (prawie czołowa; czysto czołowa przecinałaby trzon z boku
# z powodu przodoskręcenia szyjki), kamera prostopadle do niej, od przodu.
DET_SHAFT = 0.20          # ile metrów trzonu poniżej środka głowy pokazać
DET_ORTHO = 0.265         # wysokość kadru (m)
CORT_SHAFT = 0.0055       # grubość istoty zbitej trzonu (schemat; rząd wielkości jak na przekrojach podręcznikowych)
CORT_END = 0.0012         # cienka warstwa zbita na głowie, szyjce i krętarzach (schemat)
MARROW_TOP = 0.075        # początek jamy szpikowej: tyle poniżej środka głowy (poniżej krętarza mniejszego, schemat)
TRAB_R = 0.0004           # promień linii beleczek


def lin(h):
    return al.hex_to_linear(h)


BONE_CTX = lin(al.CONTEXT_COLORS["bone"])
BONE_SYS = lin(al.SYSTEM_COLORS["bone"])
MUSCLE_CTX = lin(al.CONTEXT_COLORS["muscle"])
WHITE = (1.0, 1.0, 1.0, 1.0)
BLACK = (0.0, 0.0, 0.0, 1.0)


def section_material(kind, state):
    sprint = state == "sprint"
    if kind == "cortex":
        col, emi = (BONE_SYS, 0.12) if sprint else (al.mix(BONE_CTX, BONE_SYS, 0.55), 0.0)
        return al.make_material(f"KOST_cortex_{state}", col, roughness=0.75, emission=emi)
    if kind == "spongy":
        return al.make_material("KOST_spongy", al.mix(BONE_CTX, WHITE, 0.3), roughness=0.85)
    if kind == "trab":
        col, emi = (al.mix(BONE_SYS, BLACK, 0.2), 0.1) if sprint else (al.mix(BONE_CTX, BLACK, 0.3), 0.0)
        return al.make_material(f"KOST_trab_{state}", col, roughness=0.8, emission=emi)
    if kind == "marrow":
        return al.make_material("KOST_marrow", al.mix(BONE_CTX, MUSCLE_CTX, 0.55), roughness=0.8)
    if kind == "edge":
        return al.make_material("KOST_edge", lin("#070B14"), roughness=1.0)
    raise ValueError(kind)


def points_in_poly(P, poly):
    """Test punkt-w-wielokącie (promień poziomy), P: N×2, poly: M×2."""
    x, y = P[:, 0][:, None], P[:, 1][:, None]
    x0, y0 = poly[:, 0][None, :], poly[:, 1][None, :]
    x1, y1 = np.roll(poly[:, 0], -1)[None, :], np.roll(poly[:, 1], -1)[None, :]
    cond = (y0 > y) != (y1 > y)
    xi = x0 + (y - y0) * (x1 - x0) / np.where(y1 - y0 == 0, 1e-12, y1 - y0)
    return (cond & (x < xi)).sum(1) % 2 == 1


def hits(poly, v):
    """Współrzędne u przecięć prostej poziomej v z wielokątem (posortowane)."""
    out = []
    for (u0, v0), (u1, v1) in zip(poly, np.roll(poly, -1, axis=0)):
        if (v0 - v) * (v1 - v) < 0:
            out.append(u0 + (v - v0) * (u1 - u0) / (v1 - v0))
    return sorted(out)


def offset_loop(loop, thick):
    """Obrys przesunięty do środka o grubość thick(i) (na wierzchołek), wygładzony."""
    n = len(loop)
    area = 0.5 * np.sum(loop[:, 0] * np.roll(loop[:, 1], -1) - np.roll(loop[:, 0], -1) * loop[:, 1])
    t = np.roll(loop, -1, axis=0) - np.roll(loop, 1, axis=0)
    t /= np.linalg.norm(t, axis=1, keepdims=True) + 1e-12
    inward = np.stack([-t[:, 1], t[:, 0]], 1) * (1 if area > 0 else -1)  # obrys CCW: środek po lewej
    out = loop + inward * thick[:, None]
    for _ in range(3):
        out = (np.roll(out, 1, axis=0) + 2 * out + np.roll(out, -1, axis=0)) / 4
    return out


def bezier2(a, c, b, n=48):
    s = np.linspace(0, 1, n)[:, None]
    return (1 - s) ** 2 * a + 2 * (1 - s) * s * c + s ** 2 * b


def runs_inside(P, poly, min_pts=4):
    inside = points_in_poly(P, poly)
    runs, cur = [], []
    for p, ok in zip(P, inside):
        if ok:
            cur.append(p)
        elif cur:
            runs.append(cur)
            cur = []
    if cur:
        runs.append(cur)
    return [np.array(r) for r in runs if len(r) >= min_pts]


def poly_curve(name, pts3, width, closed=False):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = width
    cu.bevel_resolution = 2
    sp = cu.splines.new('POLY')
    sp.points.add(len(pts3) - 1)
    for p, q in zip(sp.points, pts3):
        p.co = (q.x, q.y, q.z, 1.0)
    sp.use_cyclic_u = closed
    return bpy.data.objects.new(name, cu)


def flat_mesh(name, pts3):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(p) for p in pts3], [], [tuple(range(len(pts3)))])
    me.update()
    return bpy.data.objects.new(name, me)


def build_detail(plate):
    import bmesh
    fem = bpy.data.objects["Femur.r"]
    P = al._world_points(fem)
    hc = femoral_head("r")
    top = P[:, 2].max()
    # oś trzonu: środki pasm punktów na dwóch wysokościach poniżej krętarza mniejszego
    def band_center(z):
        B = P[np.abs(P[:, 2] - z) < 0.006]
        return Vector(((B.min(0) + B.max(0)) / 2).tolist())
    s_lo, s_hi = band_center(hc.z - DET_SHAFT + 0.02), band_center(hc.z - 0.10)
    axis = (s_hi - s_lo).normalized()
    n = axis.cross(hc - s_lo).normalized()
    if n.dot(Vector((0, -1, 0))) < 0:
        n = -n                                      # normalna w stronę kamery (przód ciała, −Y)
    _, R, U = al._camera_basis(n)
    z_bot = hc.z - DET_SHAFT
    print("KOST_DET plane n", tuple(round(v, 3) for v in n), "head", tuple(round(v, 3) for v in hc),
          "angle to coronal (deg)", round(math.degrees(n.angle(Vector((0, -1, 0)))), 1))

    bm = bmesh.new()
    bm.from_mesh(fem.data)
    bm.transform(fem.matrix_world)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], dist=1e-7,
                           plane_co=hc, plane_no=n, clear_outer=True)      # usuń połowę od strony kamery
    # Bez cięcia poprzecznego: dwa cięcia dają jeden łamany otwór, którego nie da się zamknąć płaską ścianą.
    # Kość zostaje w całej długości, a kadr pokazuje tylko jej górną część.
    boundary = [e for e in bm.edges if e.is_boundary]
    caps = bmesh.ops.holes_fill(bm, edges=boundary, sides=0)["faces"]
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    front_loops = []
    for f in caps:
        f.smooth = False
        if abs((f.calc_center_median() - hc).dot(n)) < 1e-4:
            front_loops.append([v.co.copy() for v in f.verts])
    me = bpy.data.meshes.new("KOST_femur_half")
    bm.to_mesh(me)
    bm.free()
    half = bpy.data.objects.new("KOST_femur_half", me)
    print("KOST_DET caps", len(caps), "front loops", [len(l) for l in front_loops])
    loop3 = max(front_loops, key=len)

    def to2(p):
        d = p - hc
        return (d.dot(R), d.dot(U))

    def to3(u, v, lift):
        return hc + R * u + U * v + n * lift

    outer = np.array([to2(p) for p in loop3])
    v_bot = -DET_SHAFT  # dolna krawędź pokazanego fragmentu (reszta trzonu jest poza kadrem)
    # grubość istoty zbitej (schemat): gruba w trzonie, cienka w końcu bliższym; zero na sztucznym cięciu dolnym
    v = outer[:, 1]
    k = np.clip((v - (-0.085)) / 0.035, 0, 1)   # 0 w trzonie (v < −8,5 cm), 1 powyżej −5 cm
    thick = CORT_SHAFT * (1 - k) + CORT_END * k
    thick[v < -0.30] = CORT_END  # koniec dalszy (kłykcie) poza kadrem: cienka warstwa jak na końcu bliższym
    inner = offset_loop(outer, thick)

    objs = {"cortex": [half], "spongy": [], "marrow": [], "trab": [], "edge": []}
    sp = flat_mesh("KOST_spongy", [to3(u, w, 0.0004) for u, w in inner])
    objs["spongy"].append(sp)
    # jama szpikowa: wnętrze poniżej MARROW_TOP, z zaokrąglonym szczytem
    shaft = inner[inner[:, 1] < -MARROW_TOP]
    hl = hits(inner, -MARROW_TOP - 0.004)
    marrow_pts = None
    if len(hl) >= 2:
        uL, uR = hl[0] + 0.0015, hl[-1] - 0.0015
        arc = [((uL + uR) / 2 + (uR - uL) / 2 * math.cos(a), -MARROW_TOP - 0.004 + 0.012 * math.sin(a))
               for a in np.linspace(0, math.pi, 24)]
        # ściany jamy: wnętrze trzonu próbkowane poziomo (mały odstęp od istoty zbitej), od góry do końca kadru i dalej
        levels = np.linspace(-MARROW_TOP - 0.004, -0.34, 90)
        walls = [(w, hits(inner, w)) for w in levels]
        left = [(h[0] + 0.0007, w) for w, h in walls if len(h) >= 2]
        right = [(h[-1] - 0.0007, w) for w, h in walls if len(h) >= 2]
        marrow_pts = np.array(left + right[::-1] + arc[1:-1])
        objs["marrow"].append(flat_mesh("KOST_marrow", [to3(u, w, 0.0008) for u, w in marrow_pts]))
    print("KOST_DET shaft pts", len(shaft), "marrow", None if marrow_pts is None else len(marrow_pts))

    # pasma beleczek (schemat, tylko w części gąbczastej, poza jamą szpikową)
    r_h = 0.92 * (top - hc.z)
    region = inner
    curves2 = []
    med = lambda w: hits(inner, w)[-1]  # noqa: E731  (ściana przyśrodkowa: +u = przyśrodkowo)
    lat = lambda w: hits(inner, w)[0]   # noqa: E731
    # grupa główna ściskana: od ściany przyśrodkowej szyjki w górę do sklepienia głowy (wachlarz)
    N = 8
    for i in range(N):
        w0 = -0.072 + i * 0.0055
        a0 = np.array([med(w0) - 0.002, w0])
        ang = math.radians(118 - i * 10)
        b = np.array([r_h * math.cos(ang), r_h * math.sin(ang)])
        c = (a0 + b) / 2 + np.array([0.006, 0.0])
        curves2.append(("compressive", bezier2(a0, c, b)))
    # grupa główna rozciągana: łuki od ściany bocznej pod krętarzem większym, nad szyjką, do dolnej części głowy
    for i in range(6):
        w0 = -0.075 + i * 0.006
        a0 = np.array([lat(w0) + 0.002, w0])
        ang = math.radians(-80 + i * 12)
        b = np.array([r_h * math.cos(ang), r_h * math.sin(ang)])
        c = np.array([(a0[0] + b[0]) / 2 - 0.004, 0.004 + i * 0.004])
        curves2.append(("tensile", bezier2(a0, c, b)))
    # grupa wtórna ściskana: od ściany przyśrodkowej niżej, wachlarzem do krętarza większego
    gt_top = max(p[1] for p in inner if p[0] < lat(-0.03) + 0.025)
    for i in range(5):
        w0 = -0.09 + i * 0.005
        a0 = np.array([med(w0) - 0.002, w0])
        b = np.array([lat(gt_top - 0.02 - i * 0.008) + 0.004, gt_top - 0.012 - i * 0.008])
        c = (a0 + b) / 2 + np.array([0.0, -0.01])
        curves2.append(("secondary", bezier2(a0, c, b)))
    mid_pts = {}
    for g, pts in curves2:
        for run in runs_inside(pts, region):
            if marrow_pts is not None:
                run = run[~points_in_poly(run, marrow_pts)]
                if len(run) < 4:
                    continue
            cu = poly_curve(f"KOST_trab_{g}", [to3(u, w, 0.0012) for u, w in run], TRAB_R)
            objs["trab"].append(cu)
            mid_pts.setdefault(g, run[len(run) // 2])
    edge = poly_curve("KOST_edge", [to3(u, w, 0.0014) for u, w in outer], 0.00045, closed=True)
    objs["edge"].append(edge)
    for kind, lst in objs.items():
        plate.add(lst, role="section", system=kind, views=("detail",))
    print("KOST_DET trab curves", len(objs["trab"]))

    # widok: środek kadru nad środkiem pokazanego fragmentu, kamera prostopadle do przekroju
    cv = (v_bot + (top - hc.z)) / 2
    plate.set_view("detail", direction=tuple(n), center=to3(0.004, cv, 0.0), ortho_scale=DET_ORTHO)

    def at(u, w):
        return to3(u, w, 0.0016)
    w_shaft = v_bot + 0.06
    hs = hits(inner, w_shaft)
    ho = hits(outer, w_shaft)
    anchors = {
        "d_cortex": at((ho[0] + hs[0]) / 2, w_shaft),                        # boczna ściana trzonu
        "d_spongy": at(-0.004, -0.004),                                      # wnętrze głowy i szyjki
        "d_marrow": at((hs[0] + hs[-1]) / 2, w_shaft + 0.02),
        "d_head": at(r_h * math.cos(math.radians(60)) * 0.97 / 0.92, r_h * math.sin(math.radians(60)) * 0.97 / 0.92),
        "d_trochanter": at(lat(gt_top - 0.012) + 0.008, gt_top - 0.012),
        "d_compressive": at(*mid_pts["compressive"]) if "compressive" in mid_pts else None,
        "d_tensile": at(*mid_pts["tensile"]) if "tensile" in mid_pts else None,
    }
    return {k: {"point": p, "views": ["detail"]} for k, p in anchors.items() if p is not None}


# ============================================================ plansza
class BonePlate(al.Plate):
    """Lokalnie: materiały przekroju (rola 'section') zależne od stanu i słabsze światło zbliżenia."""

    def _apply_state(self, state):
        section = [i for i in self.items if i[1] == "section"]
        saved = self.items
        self.items = [i for i in self.items if i[1] != "section"]
        try:
            super()._apply_state(state)
        finally:
            self.items = saved
        for o, _role, kind, _lv in section:
            al.assign(o, section_material(kind, state))

    def _lights(self, view):
        super()._lights(view)
        if view == "detail":
            # Płaski przekrój zwrócony do kamery prześwietla się przy mocy dobranej do całego ciała (jak w mięśniowym).
            for o in self.scene.collection.objects:
                if o.type == 'LIGHT':
                    o.data.energy *= 0.72


out_dir = PREVIEW if PREVIEW else None
plate = BonePlate("kostny", out_dir=out_dir)
if PREVIEW:
    plate.scene.render.resolution_percentage = 50

body_views = tuple(v for v in ("front", "side") if v in VIEWS)
if body_views:  # pusty `views` w Plate.add znaczy „wszystkie widoki”, więc bez widoków ciała nie dodajemy ciała
    hull = al.build_silhouette()
    plate.add([hull], role="context_skin", views=body_views)
    for g, objs in groups.items():
        plate.add(objs, role="active", system="bone", sprint_level=LEVEL[g], ctx="bone", views=body_views)

# Kamera całego ciała jak na planszy mięśniowej: obrys kości i mięśni, margines 1,06 (warstwy da się nakładać).
frame = bones + muscles_for_frame
plate.set_view("front", direction="front", frame=frame, margin=1.06)
c_side, s_side = plate.frame_objects(frame, "right", 1.06)
s_front = plate.view_specs["front"]["ortho_scale"]
# Z boku prawa kończyna górna zasłania miednicę i głowę kości udowej, więc w tym widoku jej nie ma (opis w raporcie).
right_arm = {o for o in groups["upper"] if o.name.endswith(".r")}
plate.set_view("side", direction="right", center=c_side, ortho_scale=s_front,  # ta sama skala co front
               objects=[o for o, *_ in plate.items if o not in right_arm])
print("KOST_CAMERA front", plate.view_specs["front"]["center"], round(s_front, 4), "side", c_side, round(s_side, 4))

# Szerokość kadru widoku z boku: AtlasPlate przycina każdy widok do obrysu (bbox) i na telefonie dopasowuje go do szerokości
# ekranu, więc wąska sylwetka z boku wychodziła ok. 2,5 raza większa niż widok z przodu (audyt K2). Niewidoczna „ramka”
# (siatka z 2 wierzchołków, bez ścian: nic nie renderuje) poszerza obrys z boku do SIDE_FRAME × szerokość widoku z przodu.
SIDE_FRAME = 0.8
if "side" in body_views:
    fmn, fmx = al.vert_bbox(bones + [hull])
    smn, smx = al.vert_bbox(bones)
    half = 0.5 * SIDE_FRAME * (fmx.x - fmn.x)
    cy, cz = (smn.y + smx.y) / 2, (smn.z + smx.z) / 2
    if half > (smx.y - smn.y) / 2:
        fme = bpy.data.meshes.new("KOST_side_frame")
        fme.from_pydata([(0.0, cy - half, cz), (0.0, cy + half, cz)], [(0, 1)], [])
        side_frame = bpy.data.objects.new("KOST_side_frame", fme)
        plate.add([side_frame], role="context_bone", views=("side",))
        plate.view_specs["side"]["objects"].add(side_frame)  # lista obiektów widoku powstała wcześniej
        print("KOST_SIDE_FRAME szerokość", round(2 * half, 3), "m (front", round(fmx.x - fmn.x, 3), ")")

# ---------------------------------------------------------------- kotwice
# Front: prawa strona ciała (.r) leży po lewej stronie obrazu (podpisy w lewo); dwa podpisy z lewej strony ciała (.l)
# idą w prawo, żeby kolumny były zrównoważone. Side: kamera po prawej stronie ciała.
A = {
    "femur": {"objects": ["Femur.r"], "views": ["front"]},
    "tibia": {"objects": ["Tibia.r"], "views": ["front"]},
    "patella": {"objects": ["Patella.r"], "views": ["front"]},
    "fibula": {"objects": ["Fibula.r"], "views": ["front"], "offset": (0.0, -0.06)},
    "hip_bone": {"objects": ["Hip bone.l"], "views": ["front"]},
    "knee": {"objects": ["Medial meniscus.l"], "views": ["front"]},
    "humerus": {"objects": ["Humerus.l"], "views": ["front"]},
    "lumbar": {"objects": ["Vertebra L3"], "views": ["side"]},
    "disc": {"objects": ["Intervertebral disc L4-L5"], "views": ["side"]},
    "sacrum": {"objects": ["Sacrum"], "views": ["side"]},
    "femoral_head": {"point": femoral_head("r"), "views": ["side"]},
    "calcaneus": {"objects": ["Calcaneus.r"], "views": ["side"]},
    "talus": {"objects": ["Talus.r"], "views": ["side"]},
}
missing = [k for k, a in A.items() for n in a.get("objects", []) if n not in bpy.data.objects]
if missing:
    print("KOST_MISSING_ANCHORS", missing)
    A = {k: a for k, a in A.items() if k not in missing}

# ---------------------------------------------------------------- strzałka „droga obciążenia” (flows3d, metry)
# Kierunek: od podłoża w górę (siła reakcji podłoża działa na stopę od dołu). Punkty: podparcie pod stopą, środek kości
# skokowej, środek stawu kolanowego (łąkotki), głowa kości udowej, kość krzyżowa. To ilustracja drogi obciążenia
# przez kości, a nie linia działania siły w konkretnej chwili kroku.
load_path = [sole_point("r"), center("Talus.r"), knee_center("r"), femoral_head("r"), center("Sacrum")]
flows3d = [{
    "id": "load_path_r",
    "kind": "force",
    "labelPl": "Ilustracja: kości, które dźwigają ciężar ciała (od stopy do miednicy)",
    "views": ["front", "side"],
    "states": ["sprint"],  # decyzja Dyrygenta K1: strzałka siły tylko w sprincie
    "points": load_path,
}]
print("KOST_LOADPATH", [tuple(round(v, 3) for v in p) for p in load_path])

if "detail" in VIEWS:
    A.update(build_detail(plate))

views = body_views + (("detail",) if "detail" in VIEWS else ())
plate.render(views=views, states=("rest", "sprint"), anchors=A, flows3d=flows3d)
