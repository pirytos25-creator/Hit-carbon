"""
Plansza: UKŁAD MIĘŚNIOWY w sprincie.
  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/plate_miesniowy.py

Widoki:
  front, back  całe ciało (plansza wzorcowa z fazy 0, styl zaakceptowany)
  detail       zbliżenie w trzech skalach, jedno pod drugim:
               1) blok prawego uda przecięty na wysokości biopsji m. obszernego bocznego
                  (ok. 16 cm nad rzepką, Staron 2000), prawdziwe siatki Z-Anatomy,
               2) mozaika włókien typu I / IIa / IIx w proporcjach ze Staron 2000 i rekrutacja
                  wg zasady rozmiaru (Henneman 1957; Gollnick 1974),
               3) mostek poprzeczny aktyna–miozyna z PDB 5H53 (Molecular Nodes, 1 nm = 1 m).

Zmienne środowiskowe:
  ATLAS_DRY=1           tylko wypisuje dopasowane mięśnie, bez renderu
  ATLAS_QUICK=1         szybki podgląd (biblioteka: pierwszy widok, tylko sprint)
  ATLAS_ANCHORS_ONLY=1  tylko kotwice
  MIES_VIEWS=detail     które widoki renderować (domyślnie "front,back,detail").
                        Widoki pominięte zostają w anchors.json bez zmian.
"""
import json
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402
import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Matrix, Vector  # noqa: E402

VIEWS = [v.strip() for v in os.environ.get("MIES_VIEWS", "front,back,detail").split(",") if v.strip()]
ANCHORS_PATH = os.path.join(al.OUT_ROOT, "miesniowy", "anchors.json")

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


def read_anchors():
    try:
        with open(ANCHORS_PATH, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def merge_anchors(previous):
    """Plate.render zapisuje anchors.json tylko z renderowanymi widokami. Dokładamy pozostałe z poprzedniej wersji."""
    if not previous:
        return
    cur = read_anchors() or {"id": "miesniowy", "resolution": previous["resolution"], "views": {}}
    for view, data in previous.get("views", {}).items():
        cur["views"].setdefault(view, data)
    order = ["front", "back", "side", "detail"]
    cur["views"] = {k: cur["views"][k] for k in sorted(cur["views"], key=lambda k: order.index(k) if k in order else 9)}
    with open(ANCHORS_PATH, "w", encoding="utf-8") as f:
        json.dump(cur, f, indent=2, ensure_ascii=False)
    print("ATLAS_MERGED", list(cur["views"]))


# =====================================================================================================
# 1. Całe ciało (przód / tył): plansza wzorcowa, bez zmian stylu
# =====================================================================================================
body_views = tuple(v for v in ("front", "back") if v in VIEWS)
if body_views:
    previous = read_anchors()
    plate = al.Plate("miesniowy")
    plate.add(bones, role="context_bone")
    plate.add(context, role="context_muscle")
    plate.add(secondary, role="active", system="muscle", sprint_level=0.6)
    plate.add(primary, role="active", system="muscle", sprint_level=1.0)
    mn_, mx_ = plate.frame_all()
    print("ATLAS_BBOX", tuple(round(v, 3) for v in mn_), tuple(round(v, 3) for v in mx_), "ortho", round(plate.ortho_scale, 3))

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
    missing = [k for k, a in A.items() for n in a["objects"] if n not in bpy.data.objects]
    if missing:
        print("ATLAS_MISSING_ANCHORS", missing)
        A = {k: a for k, a in A.items() if k not in missing}

    plate.render(views=body_views, states=("rest", "sprint"), anchors=A)
    merge_anchors(previous)

if "detail" not in VIEWS:
    raise SystemExit(0)

# =====================================================================================================
# 2. Zbliżenie (widok "detail")
# =====================================================================================================
# Układ obrazu 1000×1800 px. Kamera ortograficzna od przodu (−Y), 1 m sceny = 1800 px.
DET_H = 1.0                      # wysokość kadru w metrach sceny (ortho_scale)
DET_HALF_W = 0.5 * DET_H * 1000 / 1800
SLAB_Z = 0.262                   # środek bloku uda
SLAB_SCALE = 2.3                 # powiększenie bloku uda
MOSAIC_Z = -0.105                # środek mozaiki włókien
MOSAIC_R = 0.13                  # promień „soczewki” z włóknami
MOL_Z = -0.405                   # oś filamentu aktynowego
MOL_LEN = 0.42                   # długość narysowanego filamentu

# Proporcje włókien w m. obszernym bocznym (Staron i in. 2000, n = 150 biopsji, mATPase).
# Typy mieszane zsumowane jak w pracy: I = I + IC; IIa = IIC + IIA + ½IIAB; IIx = ½IIAB + IIB.
FIBER_SHARE = {"I": 0.42, "IIa": 0.35, "IIx": 0.23}
# Średnie pole przekroju włókien u mężczyzn [µm²] (Staron 2000, tab. 3): skala wielkości komórek mozaiki.
FIBER_CSA = {"I": 4844, "IIa": 6174, "IIx": 5160}
REST_RECRUITED_I = 0.3           # w spoczynku pracują tylko nieliczne, małe jednostki typu I (ilustracja, nie pomiar)

PATELLA = "Patella.r"
SLAB_PRIMARY = [
    "Vastus lateralis muscle.r", "Vastus intermedius muscle.r", "Vastus medialis muscle.r", "Rectus femoris muscle.r",
    "Long head of biceps femoris.r", "Short head of biceps femoris.r", "Semitendinosus muscle.r", "Semimembranosus muscle.r",
]
SLAB_SECONDARY = ["Adductor magnus.r", "Adductor longus.r", "Gracilis muscle.r", "Sartorius muscle.r"]
SLAB_CONTEXT = ["Iliotibial tract.r"]
SLAB_BONE = ["Femur.r"]

PDB_5H53 = os.path.join(al.RAW, "pdb", "5H53.cif")


def lin(h):
    return al.hex_to_linear(h)


MUSCLE = lin(al.SYSTEM_COLORS["muscle"])
MUSCLE_LIGHT = lin("#EE8A6E")
CTX = lin(al.CONTEXT_COLORS["muscle"])
WHITE = (1.0, 1.0, 1.0, 1.0)
BLACK = (0.0, 0.0, 0.0, 1.0)


class DetailPlate(al.Plate):
    """Plansza zbliżenia: własna kamera, kotwice z punktów i materiały zależne od stanu (lokalnie, bez zmian w bibliotece)."""

    def __init__(self, plate_id):
        super().__init__(plate_id)
        self.center = Vector((0.0, 0.0, 0.0))
        self.ortho_scale = DET_H
        self.points = {}          # klucz kotwicy -> punkt w świecie
        self.state_hooks = []     # funkcje(state) wywoływane przy zmianie stanu

    def _camera(self, view):
        return super()._camera("front" if view == "detail" else view)

    def _lights(self, view):
        super()._lights("front" if view == "detail" else view)
        if view == "detail":
            # Płaskie przekroje zwrócone ku światłu kluczowemu prześwietlały się przy mocy dobranej do całego ciała.
            for o in self.scene.collection.objects:
                if o.type == 'LIGHT':
                    o.data.energy *= 0.72

    def anchor_point(self, obj_names, view):
        if view == "detail":
            return self.points[obj_names[0]].copy()
        return super().anchor_point(obj_names, view)

    def _apply_state(self, state):
        super()._apply_state(state)
        for hook in self.state_hooks:
            hook(state)


def link(dp, obj):
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    dp.col.objects.link(obj)
    obj.hide_render = False
    return obj


def new_mesh_object(name, verts, faces, smooth=False):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], faces)
    me.update()
    for p in me.polygons:
        p.use_smooth = smooth
    return bpy.data.objects.new(name, me)


def world_bb(o):
    pts = [o.matrix_world @ Vector(c) for c in o.bound_box]
    return (Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))),
            Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts))))


# ---------------------------------------------------------------- 2a. blok uda
def slab_copy(src, z0, z1, offset):
    """Kopia siatki przycięta do plastra z0..z1 i zamknięta płaskimi „wieczkami” (przekrój)."""
    bm = bmesh.new()
    bm.from_mesh(src.data)
    bm.transform(src.matrix_world)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], dist=1e-7,
                           plane_co=(0, 0, z1), plane_no=(0, 0, 1), clear_outer=True)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], dist=1e-7,
                           plane_co=(0, 0, z0), plane_no=(0, 0, 1), clear_inner=True)
    boundary = [e for e in bm.edges if e.is_boundary]
    for e in boundary:
        e.smooth = False
    caps = bmesh.ops.holes_fill(bm, edges=boundary, sides=0)["faces"]
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    top = Vector((0, 0, 0))
    area = 0.0
    loops = []  # obrysy górnego przekroju (do konturów)
    for f in caps:
        f.smooth = False
        c = f.calc_center_median()
        if abs(c.z - z1) < 1e-4:
            a = f.calc_area()
            top += f.calc_center_bounds() * a
            area += a
            loops.append([v.co - offset for v in f.verts])
    bm.transform(Matrix.Translation(-offset))
    me = bpy.data.meshes.new(src.name + ".slab")
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(src.name + ".slab", me)
    return obj, (top / area - offset) if area > 0 else None, len(caps), loops


def build_slab(dp):
    pat = bpy.data.objects[PATELLA]
    z1 = world_bb(pat)[1].z + 0.16  # miejsce biopsji: ok. 16 cm nad górnym brzegiem rzepki (Staron 2000)
    z0 = z1 - 0.07
    names = SLAB_PRIMARY + SLAB_SECONDARY + SLAB_CONTEXT + SLAB_BONE
    srcs = [bpy.data.objects[n] for n in names if n in bpy.data.objects]
    lo, hi = Vector((1e9, 1e9, 0)), Vector((-1e9, -1e9, 0))
    for o in srcs:
        a, b = world_bb(o)
        if o.name.startswith(("Vastus lateralis", "Femur", "Semimembranosus", "Adductor longus", "Rectus femoris")):
            lo = Vector((min(lo.x, a.x), min(lo.y, a.y), 0))
            hi = Vector((max(hi.x, b.x), max(hi.y, b.y), 0))
    offset = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, (z0 + z1) / 2))

    pivot = bpy.data.objects.new("MIES_slab_pivot", None)
    dp.col.objects.link(pivot)
    rot = Matrix.Rotation(math.radians(58), 4, 'X') @ Matrix.Rotation(math.radians(24), 4, 'Z')
    pivot.matrix_world = Matrix.Translation((0, 0, SLAB_Z)) @ rot @ Matrix.Diagonal((SLAB_SCALE,) * 3 + (1,))
    M = pivot.matrix_world.copy()

    groups = {"primary": [], "secondary": [], "context": [], "bone": []}
    caps = {}
    # kontury przekrojów (powięzie między mięśniami): ciemna linia w kolorze tła strony
    edge_mat = al.make_material("MIES_section_edge", lin("#070B14"), roughness=1.0)
    marrow_mat = al.make_material("MIES_marrow", al.mix(lin(al.CONTEXT_COLORS["bone"]), CTX, 0.55), roughness=0.8)
    lift = Vector((0, 0, 0.0004))
    for o in srcs:
        obj, top, ncaps, loops = slab_copy(o, z0, z1, offset)
        if not obj.data.polygons:
            continue
        dp.col.objects.link(obj)
        obj.parent = pivot
        obj.matrix_parent_inverse = Matrix.Identity(4)
        caps[o.name] = top
        for loop in loops:
            cu = poly_curve(dp, "MIES_section_edge", [p + lift for p in loop], True, 0.00045, edge_mat)
            cu.parent = pivot
            cu.matrix_parent_inverse = Matrix.Identity(4)
            if o.name in SLAB_BONE and len(loop) > 2:
                # jama szpikowa trzonu kości udowej (poglądowo: obrys przeskalowany do ok. połowy)
                c = sum(loop, Vector()) / len(loop)
                inner = [c + 0.5 * (p - c) + lift * 0.5 for p in loop]
                mo = new_mesh_object("MIES_marrow", inner, [tuple(range(len(inner)))])
                mo.data.materials.append(marrow_mat)
                link(dp, mo)
                mo.parent = pivot
                mo.matrix_parent_inverse = Matrix.Identity(4)
        key = ("primary" if o.name in SLAB_PRIMARY else "secondary" if o.name in SLAB_SECONDARY
               else "bone" if o.name in SLAB_BONE else "context")
        groups[key].append(obj)
        print("MIES_SLAB", o.name, len(obj.data.polygons), "caps", ncaps, "top", top and tuple(round(v, 3) for v in top))
    dp.add(groups["bone"], role="context_bone")
    dp.add(groups["context"], role="context_muscle")
    dp.add(groups["secondary"], role="active", system="muscle", sprint_level=0.6)
    dp.add(groups["primary"], role="active", system="muscle", sprint_level=1.0)
    return M, caps, z1


# ---------------------------------------------------------------- 2b. mozaika włókien (diagram mocy / ważony Woronoj)
def clip(poly, a, b):
    """Przycina wielokąt wypukły półpłaszczyzną a·x <= b."""
    out = []
    n = len(poly)
    for i in range(n):
        p, q = poly[i], poly[(i + 1) % n]
        fp = a[0] * p[0] + a[1] * p[1] - b
        fq = a[0] * q[0] + a[1] * q[1] - b
        if fp <= 0:
            out.append(p)
        if (fp < 0) != (fq < 0) and fp != fq:
            t = fp / (fp - fq)
            out.append((p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])))
    return out


def poly_centroid(poly):
    A = cx = cy = 0.0
    for i in range(len(poly)):
        x0, y0 = poly[i]
        x1, y1 = poly[(i + 1) % len(poly)]
        c = x0 * y1 - x1 * y0
        A += c
        cx += (x0 + x1) * c
        cy += (y0 + y1) * c
    if abs(A) < 1e-12:
        return poly[0], 0.0
    return (cx / (3 * A), cy / (3 * A)), A / 2


def fiber_cells(R, n, rng):
    types = []
    for t, share in FIBER_SHARE.items():
        types += [t] * round(share * n)
    types = types[:n]
    while len(types) < n:
        types.append("I")
    rng.shuffle(types)
    mean_csa = sum(FIBER_CSA[t] * FIBER_SHARE[t] for t in FIBER_SHARE)
    rm = R / math.sqrt(n)
    weights = [(0.55 * rm) ** 2 * FIBER_CSA[t] / mean_csa for t in types]
    # punkty startowe: losowanie z minimalnym odstępem
    pts = []
    tries = 0
    while len(pts) < n and tries < 200000:
        tries += 1
        a = rng.random() * 2 * math.pi
        r = R * 0.97 * math.sqrt(rng.random())
        p = (r * math.cos(a), r * math.sin(a))
        if all((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 > (1.3 * rm) ** 2 for q in pts):
            pts.append(p)
    n = len(pts)
    types, weights = types[:n], weights[:n]
    circle = [(R * math.cos(2 * math.pi * k / 96), R * math.sin(2 * math.pi * k / 96)) for k in range(96)]
    cells = []
    for _it in range(5):  # relaksacja Lloyda (niepełna: mozaika ma wyglądać naturalnie)
        cells = []
        for i, p in enumerate(pts):
            poly = circle
            for j, q in enumerate(pts):
                if i == j or (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 > (5 * rm) ** 2:
                    continue
                a = (2 * (q[0] - p[0]), 2 * (q[1] - p[1]))
                b = (q[0] ** 2 + q[1] ** 2) - (p[0] ** 2 + p[1] ** 2) - weights[j] + weights[i]
                poly = clip(poly, a, b)
                if not poly:
                    break
            cells.append(poly)
        pts = [poly_centroid(c)[0] if len(c) >= 3 else p for c, p in zip(cells, pts)]
    return [(c, t) for c, t in zip(cells, types) if len(c) >= 3]


def build_mosaic(dp, rng):
    cells = fiber_cells(MOSAIC_R, 190, rng)
    n_i = [k for k, (_, t) in enumerate(cells) if t == "I"]
    rest_on = set(rng.sample(n_i, round(REST_RECRUITED_I * len(n_i))))
    # sloty materiałów: 0 = typ I pracujący w spoczynku, 1 = pozostałe typu I, 2 = IIa, 3 = IIx
    verts, faces, slots, info = [], [], [], []
    for k, (poly, t) in enumerate(cells):
        c, area = poly_centroid(poly)
        r = math.sqrt(abs(area) / math.pi)
        ring = [(c[0] + 0.86 * (x - c[0]), c[1] + 0.86 * (y - c[1])) for x, y in poly]
        base = len(verts)
        verts.append(Vector((c[0], -0.35 * r, MOSAIC_Z + c[1])))  # środek „poduszki” bliżej kamery
        for x, y in ring:
            verts.append(Vector((x, 0.0, MOSAIC_Z + y)))
        m = len(ring)
        slot = (0 if k in rest_on else 1) if t == "I" else (2 if t == "IIa" else 3)
        for i in range(m):
            faces.append((base, base + 1 + i, base + 1 + (i + 1) % m))
            slots.append(slot)
        info.append({"c": Vector((c[0], 0.0, MOSAIC_Z + c[1])), "type": t, "rest_on": k in rest_on, "r": r})
    obj = new_mesh_object("MIES_fibers", verts, faces, smooth=True)
    link(dp, obj)
    for _ in range(4):
        obj.data.materials.append(None)
    obj.data.polygons.foreach_set("material_index", slots)
    obj.data.update()
    print("MIES_FIBERS", len(cells), {t: sum(1 for _, tt in cells if tt == t) for t in FIBER_SHARE}, "rest_on", len(rest_on))

    I_on = al.make_material("MIES_fib_I_on", MUSCLE, roughness=0.6, subsurface=0.08)
    IIa_on = al.make_material("MIES_fib_IIa_on", MUSCLE_LIGHT, roughness=0.6, subsurface=0.08)
    IIx_on = al.make_material("MIES_fib_IIx_on", al.mix(MUSCLE_LIGHT, WHITE, 0.22), roughness=0.6, subsurface=0.08)
    I_off = al.make_material("MIES_fib_I_off", al.mix(CTX, BLACK, 0.3), roughness=0.7)
    IIa_off = al.make_material("MIES_fib_IIa_off", CTX, roughness=0.7)
    IIx_off = al.make_material("MIES_fib_IIx_off", al.mix(CTX, WHITE, 0.14), roughness=0.7)

    def on_state(state):
        sprint = state == "sprint"
        for m in (I_on, IIa_on, IIx_on):
            next(nd for nd in m.node_tree.nodes if nd.type == "BSDF_PRINCIPLED").inputs["Emission Strength"].default_value = 0.15 if sprint else 0.0
        mats = [I_on, I_on, IIa_on, IIx_on] if sprint else [I_on, I_off, IIa_off, IIx_off]
        for i, m in enumerate(mats):
            obj.data.materials[i] = m

    dp.state_hooks.append(on_state)
    return info


# ---------------------------------------------------------------- 2c. linie „lupy”
def ring_points(center, radius, normal_basis, n=96):
    u, v = normal_basis
    return [center + radius * (math.cos(2 * math.pi * k / n) * u + math.sin(2 * math.pi * k / n) * v) for k in range(n)]


def poly_curve(dp, name, pts, closed, width, mat):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = width
    cu.bevel_resolution = 2
    sp = cu.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts):
        p.co = (q.x, q.y, q.z, 1.0)
    sp.use_cyclic_u = closed
    obj = bpy.data.objects.new(name, cu)
    obj.data.materials.append(mat)
    link(dp, obj)
    return obj


def zoom_lines(dp, mat, small_c, small_r, big_c, big_r, y=-0.6, small_basis=None, lift=0.28):
    """Mały pierścień na strukturze + duży pierścień powiększenia + dwie styczne łączące."""
    X, Z = Vector((1, 0, 0)), Vector((0, 0, 1))
    small_pts = ring_points(small_c, small_r, small_basis or (X, Z))
    poly_curve(dp, "MIES_zoom_small", small_pts, True, 0.0016, mat)
    # proste styczne w płaszczyźnie obrazu (x, z), rysowane przed sceną
    s2 = Vector((small_c.x, y, small_c.z))
    b2 = Vector((big_c.x, y, big_c.z))
    for sgn in (-1, 1):
        a = Vector((s2.x + sgn * small_r, y, s2.z))
        b = Vector((b2.x + sgn * big_r * math.sqrt(1 - lift * lift), y, b2.z + big_r * lift))
        poly_curve(dp, "MIES_zoom_line", [a, b], False, 0.0011, mat)


# ---------------------------------------------------------------- 2d. molekuła 5H53
def read_cif_atoms(path):
    """Minimalny czytnik _atom_site (ATOM): łańcuch auth_asym_id, numer reszty, nazwa atomu, xyz [Å]."""
    cols, atoms = [], []
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.startswith("_atom_site."):
                cols.append(line.strip().split(".", 1)[1])
            elif line.startswith("ATOM") and cols:
                p = line.split()
                d = dict(zip(cols, p))
                atoms.append((d["auth_asym_id"], int(d["auth_seq_id"]), d["label_atom_id"],
                              Vector((float(d["Cartn_x"]), float(d["Cartn_y"]), float(d["Cartn_z"])))))
    return atoms


def screw_from_pair(A, B):
    """Ruch śrubowy (oś, kąt, przesunięcie) przenoszący punkty A na B (Kabsch)."""
    import numpy as np
    P = np.array([[v.x, v.y, v.z] for v in A])
    Q = np.array([[v.x, v.y, v.z] for v in B])
    pc, qc = P.mean(0), Q.mean(0)
    H = (P - pc).T @ (Q - qc)
    U, _S, Vt = np.linalg.svd(H)
    d = np.sign(np.linalg.det(Vt.T @ U.T))
    D = np.diag([1, 1, d])
    R = Vt.T @ D @ U.T
    T = qc - R @ pc
    ang = math.acos(max(-1.0, min(1.0, (np.trace(R) - 1) / 2)))
    axis = np.array([R[2, 1] - R[1, 2], R[0, 2] - R[2, 0], R[1, 0] - R[0, 1]])
    axis = axis / np.linalg.norm(axis)
    rise = float(T @ axis)
    c, *_ = np.linalg.lstsq(np.eye(3) - R, T - rise * axis, rcond=None)
    rms = float(np.sqrt((((P @ R.T + T) - Q) ** 2).sum(1).mean()))
    return Vector(axis), ang, rise, Vector(c), rms


def screw_matrix(axis, point, ang, rise):
    return Matrix.Translation(point + axis * rise) @ Matrix.Rotation(ang, 4, axis) @ Matrix.Translation(-point)


def build_molecule(dp):
    """Filament aktynowy (łańcuch D powielony wg symetrii helikalnej wyliczonej z pary D/E) i główka miozyny (A, B, C)."""
    try:
        import addon_utils
        addon_utils.enable("bl_ext.user_default.molecularnodes", default_set=False)
        from bl_ext.user_default import molecularnodes as mn
    except Exception as e:  # noqa: BLE001
        print("MIES_MN_FAIL import", e)
        return None

    atoms = read_cif_atoms(PDB_5H53)
    ca = {}
    for ch, rid, name, xyz in atoms:
        if name == "CA":
            ca.setdefault(ch, {})[rid] = xyz
    common = sorted(set(ca["D"]) & set(ca["E"]))
    axis, ang2, rise2, point, rms = screw_from_pair([ca["D"][r] for r in common], [ca["E"][r] for r in common])
    # D i E to podjednostki n i n+2 (ta sama nić długiego skoku). Krok o jedną podjednostkę: połowa przesunięcia
    # i połowa kąta + 180° (helisa genetyczna aktyny, ok. −167° i 2,75 nm na podjednostkę).
    step_ang, step_rise = ang2 / 2 + math.pi, rise2 / 2
    print("MIES_SCREW 2-step: ang %.1f deg rise %.1f A rms %.2f A | step: %.1f deg %.2f A" %
          (math.degrees(ang2), rise2, rms, math.degrees(step_ang) - 360, step_rise))

    s = 0.1  # Å -> nm (MN: 1 nm = 1 m)
    head = [xyz for ch, rid, name, xyz in atoms if ch == "A" and rid < 780]
    head_c = sum(head, Vector()) / len(head)
    d_c = sum(ca["D"].values(), Vector()) / len(ca["D"])

    # orientacja: oś filamentu -> X świata, główka miozyny -> +Z (w górę, w stronę filamentu grubego)
    u = axis.normalized()
    foot = point + u * (head_c - point).dot(u)
    r = (head_c - foot).normalized()
    yv = r.cross(u)
    src = Matrix((u, yv, r)).transposed()   # kolumny: u, y, r
    Q = src.inverted()                      # u->X, y->Y, r->Z
    scale = MOL_LEN / (16 * abs(step_rise) * s)
    # środek układu: punkt osi pod główką
    place = (Matrix.Translation((0.0, 0.0, MOL_Z)) @ Matrix.Diagonal((scale,) * 3 + (1,)) @ Q.to_4x4()
             @ Matrix.Translation(-foot * s))

    mat_actin = al.make_material("MIES_actin", CTX, roughness=0.7)
    mat_myo = al.make_material("MIES_myosin", MUSCLE, roughness=0.6, subsurface=0.05)
    mat_lc = al.make_material("MIES_lightchains", MUSCLE_LIGHT, roughness=0.6, subsurface=0.05)

    objs = []
    try:
        myo = mn.Molecule.load(PDB_5H53, name="MIES_5H53_myosin")
        myo.add_style("surface", selection="chainID A", material=mat_myo)
        myo.add_style("surface", selection="chainID B C", material=mat_lc)
        act = mn.Molecule.load(PDB_5H53, name="MIES_5H53_actin")
        act.add_style("surface", selection="chainID D", material=mat_actin)
    except Exception as e:  # noqa: BLE001
        print("MIES_MN_FAIL load", repr(e))
        return None
    mo, ao = myo.object, act.object
    link(dp, mo)
    link(dp, ao)
    mo.matrix_world = place
    objs.append(mo)
    # kopie łańcucha D wzdłuż osi: k-ta kopia = ruch śrubowy^k (w Å, przeliczony do nm)
    step = screw_matrix(u, point, step_ang, step_rise)
    Sc, Si = Matrix.Diagonal((s, s, s, 1)), Matrix.Diagonal((1 / s, 1 / s, 1 / s, 1))
    # Podjednostka D leży przy główce. Zakres kopii dobieramy tak, by filament był symetryczny wokół główki.
    k_d = (d_c - foot).dot(u) / step_rise
    ks = [k for k in range(-12, 13) if abs(k + k_d) <= 8]
    for k in ks:
        Mk = Matrix.Identity(4)
        for _ in range(abs(k)):
            Mk = (step if k > 0 else step.inverted()) @ Mk
        o = ao if k == ks[0] else ao.copy()
        if o is not ao:
            dp.col.objects.link(o)
        o.matrix_world = place @ Sc @ Mk @ Si
        objs.append(o)
    print("MIES_MOL actin copies", len(ks), "scale", round(scale, 4), "k_d", round(k_d, 2))

    def on_state(state):
        sprint = state == "sprint"
        for m, col in ((mat_myo, MUSCLE), (mat_lc, MUSCLE_LIGHT)):
            b = next(nd for nd in m.node_tree.nodes if nd.type == "BSDF_PRINCIPLED")
            c = col if sprint else al.mix(CTX, col, al.REST_MIX)
            b.inputs["Base Color"].default_value = c
            b.inputs["Emission Color"].default_value = c
            b.inputs["Emission Strength"].default_value = 0.25 if sprint else 0.0

    dp.state_hooks.append(on_state)
    # punkty kotwic (świat)
    head_w = place @ (head_c * s)
    d_far = None
    for k in ks:
        Mk = Matrix.Identity(4)
        for _ in range(abs(k)):
            Mk = (step if k > 0 else step.inverted()) @ Mk
        p = place @ ((Mk @ d_c) * s)
        if d_far is None or p.x > d_far.x:
            d_far = p
    return {"head": head_w, "actin": d_far}


# ---------------------------------------------------------------- 2e. złożenie widoku
def render_detail():
    previous = read_anchors()
    rng = random.Random(7)
    dp = DetailPlate("miesniowy")

    M, caps, z1 = build_slab(dp)
    vl_top = M @ caps["Vastus lateralis muscle.r"]
    femur_top = M @ caps["Femur.r"]
    hams_top = M @ caps["Long head of biceps femoris.r"]

    fibers = build_mosaic(dp, rng)
    mol = build_molecule(dp)

    line_mat = al.make_material("MIES_zoom", lin(al.CONTEXT_COLORS["skin"]), roughness=0.9, emission=0.6)
    # lupa 1: m. obszerny boczny -> mozaika
    cap_u = (M.to_3x3() @ Vector((1, 0, 0))).normalized()
    cap_v = (M.to_3x3() @ Vector((0, 1, 0))).normalized()
    zoom_lines(dp, line_mat, vl_top + (M.to_3x3() @ Vector((0, 0, 0.0008))), 0.011, Vector((0, 0, MOSAIC_Z)), MOSAIC_R,
               small_basis=(cap_u, cap_v))
    poly_curve(dp, "MIES_lens", ring_points(Vector((0, -0.02, MOSAIC_Z)), MOSAIC_R * 1.025,
                                            (Vector((1, 0, 0)), Vector((0, 0, 1)))), True, 0.0018, line_mat)
    # lupa 2: jedno włókno IIx -> mostek poprzeczny
    low = sorted([f for f in fibers if f["type"] == "IIx" and abs(f["c"].x) < 0.04], key=lambda f: f["c"].z)
    src = low[0] if low else min(fibers, key=lambda f: f["c"].z)
    if mol:
        zoom_lines(dp, line_mat, src["c"] + Vector((0, -0.05, 0)), src["r"] * 0.9, Vector((0, 0, MOL_Z + 0.012)), MOL_LEN / 2 * 0.97,
                   y=0.6, lift=0.0)  # za molekułą: linie chowają się za główką miozyny

    # kotwice włókien: po jednym włóknie każdego typu w prawej połowie soczewki, na różnych wysokościach
    picks = {}
    bands = {"I": 0.55, "IIa": 0.05, "IIx": -0.5}
    for t, zb in bands.items():
        cand = [f for f in fibers if f["type"] == t and f["c"].x > 0.35 * MOSAIC_R and (t != "I" or f["rest_on"])]
        picks[t] = min(cand, key=lambda f: abs((f["c"].z - MOSAIC_Z) / MOSAIC_R - zb))["c"]

    dp.points.update({
        "d_vastus_lateralis": vl_top, "d_femur": femur_top, "d_hamstrings": hams_top,
        "d_fiber_I": picks["I"], "d_fiber_IIa": picks["IIa"], "d_fiber_IIx": picks["IIx"],
    })
    if mol:
        dp.points.update({"d_myosin": mol["head"], "d_actin": mol["actin"]})

    # obrys kadru dla przycięcia w AtlasPlate (bbox): niewidoczny prostokąt na całą szerokość treści
    half_w = 0.27
    frame = new_mesh_object("MIES_frame", [(-half_w, 0.5, -0.49), (half_w, 0.5, -0.49), (half_w, 0.5, 0.49), (-half_w, 0.5, 0.49)], [(0, 1, 2, 3)])
    dp.add([frame], role="context_bone")
    frame.hide_render = True

    A = {k: {"objects": [k], "views": ["detail"]} for k in dp.points}
    dp.render(views=("detail",), states=("rest", "sprint"), anchors=A)
    merge_anchors(previous)


render_detail()
