"""
Plansza UKŁAD LIMFATYCZNY I ODPORNOŚCIOWY (faza 1b, agent 11). Zasady: docs/ATLAS_STYLE_BIBLE.md
  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/plate_limfatyczny.py

Widoki:
  front   całe ciało: węzły chłonne Z-Anatomy (158 obiektów w 9 grupach), śledziona, grasica, migdałki podniebienne,
          żyły kąta żylnego (kontekst), szkielet (żebra i mostek półprzezroczyste) i sylwetka.
          Naczynia chłonne (przewód piersiowy, zbiornik mleczu, pnie lędźwiowe, przewód chłonny prawy, naczynia
          chłonne kończyn dolnych) są SCHEMATEM: nie ma ich ani w Z-Anatomy, ani w HuBMAP. Przebieg wyznaczony
          z położenia kręgów, aorty, żyły nieparzystej, żył odpiszczelowych i węzłów (opis: schematic_lymph_paths()).
  detail  węzeł chłonny HuBMAP (NIH_M_Lymph_Node, CC BY 4.0): torebka (półprzezroczysta), grudki, strefa przykorowa,
          rdzeń, naczynia chłonne doprowadzające i odprowadzające, naczynia krwionośne.

Stany: spoczynek i sprint (koniec 45 s pracy). Trzeci moment („po wysiłku”, 1-2 h) nie ma osobnego renderu:
anatomia wygląda wtedy jak w spoczynku, a zmiana dotyczy liczby komórek we krwi (liczby na planszy).
Jasność struktur w sprincie to ilustracja w 3 stopniach (1,0 / 0,85 / przygaszone), nie liczba ze źródła.

Zmienne środowiskowe:
  ATLAS_QUICK=1           szybki podgląd (pierwszy widok, stan sprint) - atlas_lib
  ATLAS_ANCHORS_ONLY=1    tylko kotwice i strzałki
  ATLAS_DRY=1             tylko wypisuje dobór struktur i punkty schematu, bez renderu
  ATLAS_PART=front|detail|all
  ATLAS_PREVIEW=<folder>  podgląd obu stanów i obu widoków w połowie rozdzielczości, do <folder> (poza repo)
  ATLAS_FIT=<folder>      render kontrolny dopasowania HuBMAP (śledziona, grasica, migdałki) do Z-Anatomy ze szkieletem
"""
import json
import math
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from mathutils import Matrix, Vector  # noqa: E402

PART = os.environ.get("ATLAS_PART", "all")
DRY = bool(os.environ.get("ATLAS_DRY"))
PREVIEW = os.environ.get("ATLAS_PREVIEW")
FIT_DIR = os.environ.get("ATLAS_FIT")
NODE_SCALE = float(os.environ.get("LYM_NODE_SCALE", "1.6"))  # 0 = rozmiar z modelu
PLATE_ID = "limfatyczny"

# ============================================================ struktury Z-Anatomy
LYM = "6: Lymphoid organs"
lymph_all = al.find_meshes(collection=LYM)

# Grupy (ID pojęcia grupy, jak w modelu §3.1: drobne węzły pod jednym ID). Kolejność ma znaczenie (pierwsze trafienie).
GROUPS = [
    ("spleen", r"^Spleen$"),
    ("thymus", r"lobe of thymus"),
    ("tonsil", r"^Palatine tonsil"),
    ("nodes_lower_limb", r"popliteal|tibial node|Fibular node"),
    ("nodes_inguinal", r"inguinal|lacunar"),
    ("nodes_pelvic", r"iliac|gluteal|sacral|obturator|vesical|pararectal|Inferior epigastric|Subaortic"),
    ("nodes_abdominal", r"coeliac|mesenteric|colic|caecal|appendicular|Ileocolic|Sigmoid|pancrea|Right gastric|gastro-omental|"
                        r"Splenic nodes|Cystic|pyloric|aortic nodes|caval|lumbar"),
    ("nodes_thoracic", r"tracheobronchial|Paratracheal thoracic|Prevertebral|Juxta-oesophageal|Intercostal|Parasternal|"
                       r"pericardial|Brachiocephalic nodes|diaphragmatic|Intrapulmonary|ligamentum arteriosum|azygos"),
    ("nodes_axillary", r"axillary|Interpectoral|^Brachial nodes|Infraclavicular"),
    ("nodes_upper_limb", r"Cubital|Supratrochlear"),
    ("nodes_cervical", r".*"),  # reszta: głowa i szyja (sprawdzane w DRY: wszystkie leżą powyżej z = 1,40 m)
]
# Poziom w sprincie: ilustracja w 3 stopniach. Wyróżnione: węzły kończyn dolnych i pachwinowe (limfa z pracujących
# mięśni nóg) oraz śledziona (obkurcza się, oddaje krew i komórki). Grasica i migdałki bez roli w ostrym wysiłku.
SPRINT_LEVEL = {
    "spleen": 1.0, "nodes_lower_limb": 1.0, "nodes_inguinal": 1.0,
    # K2 (Dyrygent): średni stopień 0,85 zamiast 0,65, żeby różnica stanów była czytelna także przy 390 px
    "nodes_pelvic": 0.85, "nodes_thoracic": 0.85, "nodes_axillary": 0.85, "nodes_upper_limb": 0.85, "nodes_cervical": 0.85,
    "nodes_abdominal": "dim", "thymus": "dim", "tonsil": "dim",
}
groups = {g: [] for g, _ in GROUPS}
for o in lymph_all:
    for g, rx in GROUPS:
        if re.search(rx, o.name, re.I):
            groups[g].append(o)
            break
for g, objs in groups.items():
    zs = [round(((lambda b: (b[0].z + b[1].z) / 2)(al.vert_bbox([o]))), 3) for o in objs]
    print("LYM_GROUP", g, len(objs), "z", (min(zs), max(zs)) if zs else None, sorted({al._base_name(o.name) for o in objs})[:60])
bad_cerv = [o.name for o in groups["nodes_cervical"] if al.vert_bbox([o])[1].z < 1.40]
print("LYM_CHECK cervical below 1.40 m:", bad_cerv)

# Szkielet: żebra, chrząstki żebrowe i mostek półprzezroczyste (widać grasicę i węzły śródpiersia).
all_bones = al.find_meshes(collection="1: Skeletal system")
GHOST_RE = re.compile(r"\brib\b|costal cartilage|sternum|xiphoid", re.I)
bones_ghost = [o for o in all_bones if GHOST_RE.search(o.name)]
bones = [o for o in all_bones if o not in bones_ghost]
muscles_for_frame = al.find_meshes(collection="4: Muscular system", exclude_materials=al.MUSCLE_COVER_MATERIALS)

# Żyły kąta żylnego (kontekst: tu limfa wraca do krwi). Krzywe Z-Anatomy.
VEIN_NAMES = ["Internal jugular vein.l", "Internal jugular vein.r", "Left subclavian vein", "Right subclavian vein",
              "Left brachiocephalic vein", "Right brachiocephalic vein", "Superior vena cava"]
veins = [bpy.data.objects[n] for n in VEIN_NAMES if n in bpy.data.objects]
print("LYM_VEINS", [o.name for o in veins])


def bevel_for(o):
    """Jak plate_krwionosny: realne promienie Z-Anatomy ×1,25, najcieńsze do 0,9 mm."""
    radii = [p.radius for sp in o.data.splines for p in (sp.bezier_points if sp.type == 'BEZIER' else sp.points)]
    med = float(np.median(radii)) if radii else 1.0
    return max(o.data.bevel_depth * 1.25, 0.0009 / max(med, 0.1))


al.thicken_curves(veins, bevel=bevel_for, resolution=3)


# ============================================================ punkty pomocnicze
def obj(name):
    return bpy.data.objects[name]


def center(objs):
    mn, mx = al.vert_bbox(objs if isinstance(objs, (list, tuple)) else [objs])
    return (mn + mx) / 2


def pts_of(name):
    return [p for s in al.spline_points(obj(name)) for p in s]


def at_z(pts, z):
    """Punkt krzywej (lista punktów) na wysokości z: interpolacja na odcinku, który przecina z; inaczej najbliższy."""
    best = None
    for a, b in zip(pts, pts[1:]):
        if (a.z - z) * (b.z - z) <= 0 and a.z != b.z:
            return a.lerp(b, (z - a.z) / (b.z - a.z))
    for q in pts:
        if best is None or abs(q.z - z) < abs(best.z - z):
            best = q
    return best.copy()


def vert(nm):
    mn, mx = al.vert_bbox([obj(f"Vertebra {nm}")])
    return (mn + mx) / 2, mn, mx


def closest_pair(pa, pb):
    A = np.array([tuple(p) for p in pa])
    B = np.array([tuple(p) for p in pb])
    d = ((A[:, None, :] - B[None, :, :]) ** 2).sum(-1)
    i, j = np.unravel_index(np.argmin(d), d.shape)
    return Vector(((A[i] + B[j]) / 2).tolist()), math.sqrt(d[i, j])


def smooth_path(pts, iters=2):
    """Wygładzenie Chaikina (końce zostają)."""
    P = [Vector(p) for p in pts]
    for _ in range(iters):
        Q = [P[0]]
        for a, b in zip(P, P[1:]):
            Q += [a.lerp(b, 0.25), a.lerp(b, 0.75)]
        Q.append(P[-1])
        P = Q
    return P


def schematic_lymph_paths():
    """Przebieg schematu naczyń chłonnych (metry, układ Z-Anatomy). Reguły anatomiczne (podręcznikowe):
    - zbiornik mleczu: przed trzonami L1-L2, po prawej stronie aorty brzusznej;
    - przewód piersiowy: przez rozwór aortowy w górę, między aortą piersiową a żyłą nieparzystą, przed kręgosłupem;
      na wysokości T4-T5 przechodzi na lewo, biegnie po lewej stronie przełyku do C7, tworzy łuk i uchodzi do
      lewego kąta żylnego (zbieg ż. szyjnej wewnętrznej lewej i ż. podobojczykowej lewej);
    - pnie lędźwiowe: od węzłów biodrowych wspólnych wzdłuż aorty do zbiornika mleczu;
    - naczynia chłonne kończyny dolnej (powierzchowne): wzdłuż żyły odpiszczelowej do węzłów pachwinowych,
      dalej do węzłów biodrowych zewnętrznych i wspólnych;
    - przewód chłonny prawy: krótki pień do prawego kąta żylnego."""
    aorta = pts_of("Abdominal aorta") + pts_of("Thoracic aorta")
    aorta.sort(key=lambda p: p.z)
    azyg = sorted(pts_of("Azygos vein"), key=lambda p: p.z)
    L1, L1mn, L1mx = vert("L1")
    L2, L2mn, L2mx = vert("L2")
    T12, _, _ = vert("T12")
    T5, _, _ = vert("T5")
    T4, _, _ = vert("T4")
    T1, T1mn, _ = vert("T1")
    C7, C7mn, C7mx = vert("C7")
    angle_l, dl = closest_pair(pts_of("Internal jugular vein.l"), pts_of("Left subclavian vein"))
    angle_r, dr = closest_pair(pts_of("Internal jugular vein.r"), pts_of("Right subclavian vein"))
    print("LYM_ANGLE L", tuple(round(v, 3) for v in angle_l), round(dl * 1000, 1), "mm; R",
          tuple(round(v, 3) for v in angle_r), round(dr * 1000, 1), "mm")

    # zbiornik mleczu: od środka L2 do górnej krawędzi L1, po prawej stronie aorty, tuż przed trzonem
    def cist_pt(z):
        a = at_z(aorta, z)
        return Vector((a.x - 0.011, min(L1mn.y, L2mn.y) - 0.004, z))

    cz0, cz1 = L2.z, L1mx.z - 0.004
    cist = [cist_pt(cz0 + (cz1 - cz0) * k / 6) for k in range(7)]
    cist_r = [0.45, 0.8, 1.0, 1.0, 0.9, 0.7, 0.5]

    # przewód piersiowy
    duct = [cist[-1]]
    zs = np.linspace(cz1 + 0.01, T5.z, 9)
    for z in zs:
        a, v = at_z(aorta, z), at_z(azyg, z)
        duct.append(Vector(((a.x + v.x) / 2, (a.y + v.y) / 2, z)))
    # przejście na lewo T5 -> T3, potem w górę po lewej stronie przełyku do C7
    oes_x = 0.0
    oes = [o for o in bpy.data.objects if o.name == "Oesophagus"]
    if oes:
        op = sorted([p for s in al.spline_points(oes[0]) for p in s], key=lambda p: p.z)
        oes_x = at_z(op, T1.z).x
    left_x = oes_x + 0.014
    for z, f in ((T4.z, 0.35), ((T4.z + T1.z) / 2, 0.8), (T1.z, 1.0), (C7.z, 1.0)):
        base = duct[-1]
        duct.append(Vector((base.x * (1 - f) + left_x * f, T1mn.y - 0.006 if z >= T1.z else base.y * (1 - f) + (T1mn.y - 0.006) * f, z)))
    # łuk nad kątem żylnym (szczyt ok. 1,5 cm nad kątem, nie niżej niż C7) i ujście z góry-przyśrodkowo
    apex_z = max(C7.z + 0.008, angle_l.z + 0.022)
    duct.append(Vector((left_x + 0.006, C7mn.y - 0.012, apex_z)))
    duct.append(Vector(((left_x + angle_l.x) / 2 + 0.004, (C7mn.y - 0.012 + angle_l.y) / 2, apex_z + 0.004)))
    duct.append(Vector((angle_l.x - 0.002, angle_l.y, angle_l.z + 0.006)))
    duct.append(angle_l.copy())

    # przewód chłonny prawy: ok. 1,5 cm, z dołu-bocznie do prawego kąta żylnego
    rduct = [angle_r + Vector((-0.012, 0.004, -0.010)), angle_r + Vector((-0.005, 0.002, -0.003)), angle_r.copy()]

    # pnie lędźwiowe i naczynia kończyn dolnych
    legs = {}
    for side, sx in (("r", -1), ("l", 1)):
        gsv = al.curve_points(f"Great saphenous vein.{side}", start_near=(0, 0, 0))  # najdłuższy splajn, od stopy
        top = max(gsv, key=lambda p: p.z)
        leg = [p + Vector((0, -0.004, 0)) for p in gsv if 0.09 <= p.z <= top.z - 0.01]
        leg = al.resample(leg, 0.03)
        ing = center(obj(f"Superomedial superficial inguinal nodes.{side}"))
        deep = center(obj(f"(Proximal deep inguinal node).{side}"))
        ext = center([obj(f"Medial external iliac nodes.{side}"), obj(f"Intermediate external iliac nodes.{side}")])
        ext_lo = Vector((ext.x, ext.y, ext.z - 0.02))
        com = center(obj("Lateral common iliac nodes"))
        com_side = Vector((com.x + sx * 0.02, com.y, com.z))
        a_lo = at_z(aorta, com.z + 0.03)
        trunk = [com_side, Vector((a_lo.x + sx * 0.016, a_lo.y + 0.006, com.z + 0.03)),
                 Vector((at_z(aorta, cz0).x + sx * 0.012, cist[0].y, cz0 - 0.012)), cist[0].copy()]
        legs[side] = leg + [ing, deep, ext_lo, ext] + trunk
    return {"cisterna": (cist, cist_r), "duct": duct, "rduct": rduct, "legs": legs, "angle_l": angle_l,
            "angle_r": angle_r}


S = schematic_lymph_paths()
for k in ("duct", "rduct"):
    print("LYM_PATH", k, [tuple(round(v, 3) for v in p) for p in S[k]])
print("LYM_PATH cisterna", [tuple(round(v, 3) for v in p) for p in S["cisterna"][0]])
for side, p in S["legs"].items():
    print("LYM_PATH leg", side, len(p), "z", round(p[0].z, 3), "->", round(p[-1].z, 3))


def tube(name, pts, r, radii=None, smooth=2):
    """Rura schematu (krzywa POLY z promieniem w punktach)."""
    P = smooth_path(pts, smooth) if smooth else [Vector(p) for p in pts]
    if radii:
        # promienie przeliczone na wygładzone punkty (po długości)
        L = [0.0]
        for a, b in zip(P, P[1:]):
            L.append(L[-1] + (b - a).length)
        rr = [float(np.interp(l / max(L[-1], 1e-9), np.linspace(0, 1, len(radii)), radii)) for l in L]
    else:
        rr = [1.0] * len(P)
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = r
    cu.bevel_resolution = 4
    cu.use_fill_caps = True
    sp = cu.splines.new('POLY')
    sp.points.add(len(P) - 1)
    for p, v, ri in zip(sp.points, P, rr):
        p.co = (*v, 1.0)
        p.radius = ri
    ob = bpy.data.objects.new(name, cu)
    return ob


# Grubości schematu są powiększone dla czytelności (1 px ≈ 1 mm w ujęciu całego ciała); przewód piersiowy ma
# w rzeczywistości ok. 2-5 mm średnicy, kolektory kończyn ok. 1 mm.
schem_duct = tube("LYM_schem_thoracic_duct", S["duct"], 0.0035)
schem_cist = tube("LYM_schem_cisterna_chyli", S["cisterna"][0], 0.009, radii=S["cisterna"][1], smooth=1)
schem_rduct = tube("LYM_schem_right_lymphatic_duct", S["rduct"], 0.0028)
schem_legs = {s: tube(f"LYM_schem_leg_lymph.{s}", p, 0.0024) for s, p in S["legs"].items()}
schematic = [schem_duct, schem_cist, schem_rduct] + list(schem_legs.values())


def scale_islands(o, factor=NODE_SCALE, min_r=0.0036, max_f=3.0):
    """Powiększa KAŻDY pojedynczy węzeł (spójną część siatki) wokół jego własnego środka, więc położenie węzłów
    w grupie się nie zmienia. Współczynnik: max(factor, min_r / promień węzła), najwyżej max_f.
    Ilustracja dla czytelności (węzły 3-10 mm to 3-10 px w ujęciu całego ciała); opisane w raporcie i na planszy."""
    me = o.data = o.data.copy()
    n = len(me.vertices)
    ev = np.empty(len(me.edges) * 2, np.int32)
    me.edges.foreach_get("vertices", ev)
    a, b = ev[0::2], ev[1::2]
    lab = np.arange(n)
    while True:
        m = np.minimum(lab[a], lab[b])
        new = lab.copy()
        np.minimum.at(new, a, m)
        np.minimum.at(new, b, m)
        new = new[new]
        if np.array_equal(new, lab):
            break
        lab = new
    co = np.empty(n * 3, np.float64)
    me.vertices.foreach_get("co", co)
    co = co.reshape(-1, 3)
    sc = np.array(o.matrix_world.to_scale())
    fs = []
    for c in np.unique(lab):
        idx = lab == c
        cen = co[idx].mean(0)
        r = float(np.sqrt((((co[idx] - cen) * sc) ** 2).sum(1)).max())
        f = min(max_f, max(factor, min_r / max(r, 1e-5)))
        co[idx] = cen + (co[idx] - cen) * f
        fs.append(f)
    me.vertices.foreach_set("co", co.ravel())
    me.update()
    return fs


if NODE_SCALE > 0:
    allf = []
    for g, objs in groups.items():
        if g.startswith("nodes_"):
            for o in objs:
                allf += scale_islands(o)
    print("LYM_NODE_SCALE węzłów", len(allf), "współczynnik min/mediana/maks",
          round(min(allf), 2), round(float(np.median(allf)), 2), round(max(allf), 2))

# ============================================================ HuBMAP: węzeł chłonny (detail)
LN_OFFSET = Vector((3.0, 0.0, 0.0))  # daleko od ciała (i tak osobny widok)
ln = al.import_glb("NIH_M_Lymph_Node.glb", collection="LYM_hubmap_ln")
ln_by = {al._base_name(o.name): o for o in ln}
c0 = center(ln)
# Model ma wymiary 1,8 × 1,3 × 0,8 cm, a wnęka (naczynie odprowadzające) leży na płaskiej stronie (oś Z modelu).
# Obrót: dłuższa oś pionowo, wnęka po prawej stronie obrazu (jak „fasolka” w podręczniku), kamera z przodu.
R = Matrix.Rotation(math.radians(-90), 4, 'Z') @ Matrix.Rotation(math.radians(90), 4, 'Y') @ Matrix.Rotation(math.radians(-90), 4, 'X')
T = Matrix.Translation(LN_OFFSET) @ R @ Matrix.Translation(-c0)
for o in ln:
    o.matrix_world = T @ o.matrix_world
bpy.context.view_layer.update()
eff_c = center(ln_by["Yao_efferent_lymph_node"])
if eff_c.x < LN_OFFSET.x:  # wnęka ma być po prawej stronie obrazu (+X w widoku z przodu)
    F = Matrix.Translation(LN_OFFSET) @ Matrix.Rotation(math.pi, 4, 'Z') @ Matrix.Translation(-LN_OFFSET)
    for o in ln:
        o.matrix_world = F @ o.matrix_world
    bpy.context.view_layer.update()


def cut_front(o, y_plane):
    """Przekrój: usuwa część siatki przed płaszczyzną czołową y_plane (bliżej kamery). Kopia danych."""
    import bmesh
    o.data = o.data.copy()
    mw = o.matrix_world
    bm = bmesh.new()
    bm.from_mesh(o.data)
    kill = [v for v in bm.verts if (mw @ v.co).y < y_plane]
    bmesh.ops.delete(bm, geom=kill, context='VERTS')
    bm.to_mesh(o.data)
    bm.free()


# Przekrój przez środek węzła (torebka zostaje cała, półprzezroczysta): widać grudki pod torebką, strefę przykorową,
# rdzeń i wnękę. Naczynia doprowadzające leżą na powierzchni, więc też zostają całe.
LN_CUT_Y = center(ln).y
for n in ("Yao_follicles", "Yao_paracortex", "Yao_medulla_of_lymph_node", "Yao_blood_vasculature"):
    cut_front(ln_by[n], LN_CUT_Y)
bpy.context.view_layer.update()
for n, o in ln_by.items():
    mn, mx = al.vert_bbox([o])
    print("LYM_LN", n, len(o.data.polygons), "c", tuple(round(v, 4) for v in (mn + mx) / 2), "size", tuple(round(v, 4) for v in mx - mn))

if DRY:
    raise SystemExit(0)


# ============================================================ plansza
# Śledziona w sprincie mniejsza: skala liniowa 0,88 = −32% objętości. Stewart 2003: −28 do −36% po 5-15 min przy
# 60% VO₂max, −56% po wysiłku do wyczerpania. Wybrana wartość ostrożna (ilustracja, nie pomiar w protokole 45/45 s).
SPLEEN_SPRINT_SCALE = 0.88


class LymphPlate(al.Plate):
    """Lokalne materiały: torebka węzła półprzezroczysta (rola 'ln_capsule'), warstwy węzła ('ln_layer');
    śledziona obkurczona w sprincie (SPLEEN_SPRINT_SCALE)."""

    def _apply_state(self, state):
        for o in groups["spleen"]:
            base = o.get("lym_base")
            if base is None:
                o["lym_base"] = [v for row in o.matrix_world for v in row]
                base = o["lym_base"]
            M = Matrix([base[0:4], base[4:8], base[8:12], base[12:16]])
            o.matrix_world = M
            if state == "sprint":
                c = center(o)
                o.matrix_world = Matrix.Translation(c) @ Matrix.Scale(SPLEEN_SPRINT_SCALE, 4) @ Matrix.Translation(-c) @ M
        self.scene.view_layers[0].update()
        self._apply_state_materials(state)

    def write_flows3d(self, flows, step=0.02):
        """Jak atlas_lib.Plate.write_flows3d, ale z krokiem na strzałkę (pole "step"): węzeł chłonny ma 1,8 cm, więc
        domyślne 2 cm zostawiały z toru tylko 2 punkty. Obejście lokalne (propozycja dla atlas_lib w raporcie)."""
        out = {"schemaVersion": 1, "units": "m", "frame": "Z-Anatomy (przód −Y, prawa strona ciała −X, stopy Z≈0)",
               "flows": []}
        for fl in flows:
            pts = al.resample([Vector(p) for p in fl["points"]], fl.get("step", step))
            out["flows"].append({k: v for k, v in {
                "id": fl["id"], "kind": fl["kind"], "labelPl": fl.get("labelPl"), "views": fl.get("views"),
                "states": fl.get("states"),
                "points": [[round(v, 5) for v in p] for p in pts]}.items() if v is not None})
        path = os.path.join(self.out_dir, "flows3d.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(out, f, indent=1, ensure_ascii=False)
        print("ATLAS_FLOWS3D", path, [(f_["id"], len(f_["points"])) for f_ in out["flows"]])
        return path

    def _apply_state_materials(self, state):
        local = [i for i in self.items if i[1] in ("ln_capsule", "ln_layer")]
        saved = self.items
        self.items = [i for i in self.items if i[1] not in ("ln_capsule", "ln_layer")]
        try:
            super()._apply_state(state)
        finally:
            self.items = saved
        for o, role, _system, levels in local:
            if role == "ln_capsule":
                col = al.active_color("lymph", "sprint", 0.65)[0]
                al.assign(o, al.make_material("LYM_capsule", col, roughness=0.55, alpha=0.22, backface_culling=True))
            else:  # warstwa węzła: stała jasność niezależna od stanu (active_color w spoczynku zawsze daje 35%)
                lvl = levels[state]
                col = al.active_color("lymph", "sprint", lvl, ctx=self.extra.get(o.name, {}).get("ctx"))[0]
                if os.environ.get("LYM_DEBUG_LAYERS"):  # diagnostyka kotwic: strefa przykorowa czerwona, rdzeń niebieski
                    col = {"Yao_paracortex": (1, 0, 0, 1), "Yao_medulla_of_lymph_node": (0, 0.2, 1, 1)}.get(al._base_name(o.name), col)
                al.assign(o, al.make_material(f"LYM_layer_{int(lvl * 100)}", col, roughness=0.6, subsurface=0.08))


def surface_point(objs, frac=0.12, zband=None, xband=None, direction=Vector((0, -1, 0))):
    """Punkt na widocznej od strony kamery powierzchni obiektu(ów), blisko środka tej powierzchni."""
    P = np.vstack([al._world_points(o) for o in objs])
    if zband:
        z0, z1 = P[:, 2].min(), P[:, 2].max()
        P = P[(P[:, 2] >= z0 + zband[0] * (z1 - z0)) & (P[:, 2] <= z0 + zband[1] * (z1 - z0))]
    if xband:
        x0, x1 = P[:, 0].min(), P[:, 0].max()
        P = P[(P[:, 0] >= x0 + xband[0] * (x1 - x0)) & (P[:, 0] <= x0 + xband[1] * (x1 - x0))]
    d = np.array(tuple(direction))
    depth = P @ d
    front = P[depth >= np.quantile(depth, 1 - frac)]
    c = front[:, [0, 2]].mean(0)
    return Vector(front[np.argmin(((front[:, [0, 2]] - c) ** 2).sum(1))].tolist())


def on_tube(ob, z=None, t=None):
    return al.curve_anchor(ob, z=z, t=t) + Vector((0, -0.003, 0))


def build(out_dir=None, res=(1000, 1800)):
    plate = LymphPlate(PLATE_ID if out_dir is None else PLATE_ID, resolution=res, out_dir=out_dir)
    hull = al.build_silhouette()
    F = ("front",)
    plate.add(bones, role="context_bone", views=F)
    plate.add(bones_ghost, role="context_bone_ghost", views=F)
    plate.add([hull], role="context_skin", views=F)
    plate.add(veins, role="active", system="vein", sprint_level="dim", ctx="muscle", views=F)
    for g, objs in groups.items():
        if g in ("thymus", "tonsil"):
            # bez roli w ostrym wysiłku: ta sama, średnia jasność w obu stanach (rola lokalna "ln_layer")
            plate.add(objs, role="ln_layer", system="lymph", rest_level=0.6, sprint_level=0.6, ctx="muscle", views=F)
            continue
        # ctx="muscle": spoczynek miesza się z #8E7A78, nie z kością (inaczej węzły giną na tle kości; brief §0)
        plate.add(objs, role="active", system="lymph", sprint_level=SPRINT_LEVEL[g], ctx="muscle", views=F)
    plate.add([schem_duct, schem_cist, schem_rduct], role="active", system="lymph", sprint_level=1.0, ctx="muscle", views=F)
    plate.add(list(schem_legs.values()), role="active", system="lymph", sprint_level=1.0, ctx="muscle", views=F)
    # detail: węzeł chłonny HuBMAP
    D = ("detail",)
    plate.add([ln_by["Yao_capsule_of_lymph_node"]], role="ln_capsule", views=D)
    # Warstwy węzła różnią się jasnością (ten sam układ): grudki najjaśniejsze, strefa przykorowa średnia, rdzeń ciemny.
    # W sprincie węzeł się nie zmienia (brak dowodów u ludzi), więc warstwy mają ten sam poziom w obu stanach.
    plate.add([ln_by["Yao_follicles"]], role="ln_layer", system="lymph", rest_level=0.9, sprint_level=0.9, views=D)
    plate.add([ln_by["Yao_paracortex"]], role="ln_layer", system="lymph", rest_level=0.6, sprint_level=0.6, views=D)
    plate.add([ln_by["Yao_medulla_of_lymph_node"]], role="ln_layer", system="lymph", rest_level=0.45, sprint_level=0.45,
              ctx="muscle", views=D)
    plate.add([ln_by["Yao_afferent_lymphatic_vessel"], ln_by["Yao_efferent_lymph_node"]], role="active", system="lymph",
              sprint_level=1.0, ctx="muscle", views=D)
    # Naczynia krwionośne węzła (Yao_blood_vasculature) pominięte: w przekroju zasłaniały warstwy (podgląd 2).

    plate.set_view("front", direction="front", frame=all_bones + muscles_for_frame, margin=1.06)
    plate.set_view("detail", direction="front", frame=ln, margin=1.12)

    def visible_on(name, target=None, n=60, skip=("Yao_capsule_of_lymph_node",)):
        """Kotwica tam, gdzie warstwa jest NAPRAWDĘ widoczna z kamery: siatka promieni z przodu (−Y → +Y) przez kadr
        węzła; pierwsze trafienie (z pominięciem półprzezroczystej torebki) musi należeć do obiektu `name`.
        Zwraca trafienie najbliższe `target` (x, z) albo medianie trafień. Sprawdzone renderem diagnostycznym
        (LYM_DEBUG_LAYERS=1: strefa przykorowa czerwona, rdzeń niebieski)."""
        dg = plate.scene.view_layers[0].depsgraph
        dg.update()
        mn, mx = al.vert_bbox(ln)
        hits = []
        for i in range(n):
            for j in range(n):
                x = mn.x + (mx.x - mn.x) * (i + 0.5) / n
                z = mn.z + (mx.z - mn.z) * (j + 0.5) / n
                o_ = Vector((x, mn.y - 0.01, z))
                for _ in range(6):
                    ok, loc, _nrm, _idx, ob, _m = plate.scene.ray_cast(dg, o_, Vector((0, 1, 0)))
                    if not ok:
                        break
                    if al._base_name(ob.name) in skip:
                        o_ = loc + Vector((0, 1e-5, 0))
                        continue
                    if al._base_name(ob.name) == name:
                        hits.append(loc.copy())
                    break
        if not hits:
            raise RuntimeError(f"warstwa {name} niewidoczna")
        H = np.array([tuple(h) for h in hits])
        t = np.median(H[:, [0, 2]], axis=0) if target is None else np.array(target)
        k = np.argmin(((H[:, [0, 2]] - t) ** 2).sum(1))
        print("LYM_VISIBLE", name, len(hits), "trafień; kotwica", tuple(round(v, 4) for v in H[k]))
        return Vector(H[k].tolist()) + Vector((0, -0.0003, 0))

    # punkty węzła (HuBMAP): naczynie doprowadzające najdalej po lewej, brzeg torebki po lewej w połowie wysokości
    AP = al._world_points(ln_by["Yao_afferent_lymphatic_vessel"])
    a_out = Vector(AP[np.argmin(AP[:, 0])].tolist())
    near = AP[np.linalg.norm(AP - AP[np.argmin(AP[:, 0])], axis=1) < 0.004]
    a_in = Vector(near[np.argmax(near[:, 0])].tolist())
    aff_pt = Vector(near[np.argmin(near[:, 1])].tolist())
    CP = al._world_points(ln_by["Yao_capsule_of_lymph_node"])
    zc0, zc1 = CP[:, 2].min(), CP[:, 2].max()
    band = CP[(CP[:, 2] > zc0 + 0.7 * (zc1 - zc0)) & (CP[:, 2] < zc0 + 0.8 * (zc1 - zc0))]
    capsule_edge = Vector(band[np.argmin(band[:, 0])].tolist())

    A = {
        # front: grupy węzłów i narządy (kotwice na widocznej powierzchni; strona prawa ciała = lewa strona obrazu)
        "cervical": {"point": surface_point([obj("Superficial lateral cervical nodes.r")]), "views": ["front"]},
        "thymus": {"point": surface_point(groups["thymus"]), "views": ["front"]},
        "axillary": {"point": surface_point([obj("Anterior axillary nodes.r")]), "views": ["front"]},
        "mediastinal": {"point": surface_point([obj("Inferior tracheobronchial nodes")]), "views": ["front"]},
        "spleen": {"point": (lambda b: Vector(((b[0].x + b[1].x) / 2, b[0].y, (b[0].z + b[1].z) / 2)))(al.vert_bbox(groups["spleen"])),
                   "views": ["front"]},
        "abdominal": {"point": surface_point([obj("Juxta-intestinal mesenteric nodes")]), "views": ["front"]},
        "iliac": {"point": surface_point([obj("Medial external iliac nodes.l")]), "views": ["front"]},
        "inguinal": {"point": surface_point([obj("Inferior superficial inguinal nodes.r")]), "views": ["front"]},
        "leg_lymph": {"point": on_tube(schem_legs["l"], z=0.42), "views": ["front"]},
        "thoracic_duct": {"point": on_tube(schem_duct, t=0.3), "views": ["front"]},
        "cisterna": {"point": on_tube(schem_cist, t=0.5) + Vector((0, -0.004, 0)), "views": ["front"]},
        "venous_angle": {"point": S["angle_l"] + Vector((0, -0.004, 0)), "views": ["front"]},
        # detail: węzeł chłonny
        "d_capsule": {"point": capsule_edge, "views": ["detail"]},
        "d_follicle": {"point": surface_point([ln_by["Yao_follicles"]], zband=(0.55, 0.75), xband=(0.0, 0.45)), "views": ["detail"]},
        "d_paracortex": {"point": visible_on("Yao_paracortex"), "views": ["detail"]},
        "d_medulla": {"point": visible_on("Yao_medulla_of_lymph_node"), "views": ["detail"]},
        "d_afferent": {"point": aff_pt, "views": ["detail"]},
        "d_efferent": {"point": surface_point([ln_by["Yao_efferent_lymph_node"]]), "views": ["detail"]},
    }

    # Punkty kotwic zaokrąglone do 10 µm PRZED rzutowaniem: atlas_lib zapisuje anchors3d z 5 miejscami po przecinku,
    # a w zbliżeniu węzła 1 px = 12 µm, więc bez tego rzut w TS (scripts/atlas_check_projection.ts) różnił się o 0,51 px.
    for a_ in A.values():
        if "point" in a_:
            a_["point"] = Vector([round(v, 5) for v in a_["point"]])

    # Strzałki (metry). Kierunek: limfa płynie od obwodu do kąta żylnego (zgodnie z zastawkami); sprawdzone z.
    leg_r = S["legs"]["r"] + S["cisterna"][0][1:]
    duct = S["cisterna"][0][-1:] + S["duct"][1:]
    # Węzeł: limfa wpływa naczyniem doprowadzającym (najdalej po lewej), płynie zatokami przez korę do rdzenia
    # i wypływa naczyniem odprowadzającym we wnęce (po prawej). Punkty z geometrii HuBMAP.
    n_c = center(ln)
    EP = al._world_points(ln_by["Yao_efferent_lymph_node"])
    e_out = Vector(EP[np.argmax(np.linalg.norm(EP - np.array(tuple(n_c)), axis=1))].tolist())
    med = center(ln_by["Yao_medulla_of_lymph_node"])
    fy = n_c.y - 0.006  # przed przekrojem (strzałka nad obrazem)
    node_path = [Vector((p.x, fy, p.z)) for p in (a_out, a_in, Vector((a_in.x + 0.0015, 0, a_in.z - 0.002)),
                                                   Vector((med.x, 0, med.z)), Vector((e_out.x - 0.002, 0, (med.z + e_out.z) / 2)), e_out)]
    flows3d = [
        {"id": "lymph_leg_r", "kind": "lymph", "labelPl": "Limfa z nogi do zbiornika mleczu (schemat)", "views": ["front"],
         "points": smooth_path(leg_r, 1)},
        {"id": "lymph_leg_l", "kind": "lymph", "labelPl": "Limfa z nogi do zbiornika mleczu (schemat)", "views": ["front"],
         "points": smooth_path(S["legs"]["l"] + S["cisterna"][0][1:], 1)},
        {"id": "lymph_thoracic_duct", "kind": "lymph", "labelPl": "Przewód piersiowy: limfa wraca do krwi (schemat)",
         "views": ["front"], "points": smooth_path(duct, 1)},
        {"id": "lymph_node_through", "kind": "lymph", "labelPl": "Limfa przepływa przez węzeł", "views": ["detail"], "step": 0.0008,
         "points": smooth_path(node_path, 2)},
    ]
    for f in flows3d:
        print("LYM_FLOW", f["id"], "z", round(f["points"][0].z, 3), "->", round(f["points"][-1].z, 3), len(f["points"]))
    return plate, A, flows3d


if FIT_DIR:
    # Render kontrolny: szkielet + narządy Z-Anatomy (zielone) + te same narządy HuBMAP po align_hubmap (różowe, półprzezroczyste)
    os.makedirs(FIT_DIR, exist_ok=True)
    hub = []
    for f in ("VH_M_Spleen.glb", "VH_M_Thymus.glb", "3d-vh-m-palatine-tonsil-l.glb", "3d-vh-m-palatine-tonsil-r.glb"):
        hub += al.import_glb(f, collection="LYM_hubmap_fit")
    al.align_hubmap(hub, "male")
    za = groups["spleen"] + groups["thymus"] + groups["tonsil"]
    pairs = {"śledziona": (groups["spleen"], [o for o in hub if "spleen" in o.name]),
             "grasica": (groups["thymus"], [o for o in hub if "thymus" in o.name]),
             "migdałek L": ([obj("Palatine tonsil.l")], [o for o in hub if "tonsil_L" in o.name]),
             "migdałek P": ([obj("Palatine tonsil.r")], [o for o in hub if "tonsil_R" in o.name])}
    rep = {k: round((center(a) - center(b)).length * 100, 2) for k, (a, b) in pairs.items()}
    print("LYM_FIT_CM", json.dumps(rep, ensure_ascii=False))
    with open(os.path.join(FIT_DIR, "fit_report.json"), "w", encoding="utf-8") as fh:
        json.dump({"center_distance_cm": rep, "method": "align_hubmap('male') z atlas_lib"}, fh, ensure_ascii=False, indent=1)
    fit = LymphPlate("limfatyczny_fit", resolution=(1000, 1000), out_dir=FIT_DIR)
    try:
        os.rmdir(os.path.join(al.OUT_ROOT, "limfatyczny_fit"))
    except OSError:
        pass
    fit.add(all_bones, role="context_bone_ghost")
    fit.add(za, role="active", system="lymph")
    fit.add(hub, role="active", system="repro", alpha=0.45)
    fc = center(za)
    os.environ.pop("ATLAS_QUICK", None)
    for d in ("front", "side"):
        fit.set_view(d, direction=d, center=Vector((0.03, 0, (1.16 + 1.56) / 2)), ortho_scale=0.62)
    fit.render(views=("front", "side"), states=("sprint",))
    raise SystemExit(0)

if PREVIEW:
    os.makedirs(PREVIEW, exist_ok=True)
    plate, A, flows3d = build(out_dir=PREVIEW, res=(500, 900))
    plate.scene.eevee.taa_render_samples = 16
    os.environ.pop("ATLAS_QUICK", None)
    views = ("front", "detail") if PART == "all" else (PART,)
    plate.render(views=views, states=("rest", "sprint"), anchors=A, flows3d=flows3d)
    raise SystemExit(0)

plate, A, flows3d = build()
views = ("front", "detail") if PART == "all" else (PART,)
plate.render(views=views, states=("rest", "sprint"), anchors=A, flows3d=flows3d)
