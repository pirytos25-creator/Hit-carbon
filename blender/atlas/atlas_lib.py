"""
Wspólna biblioteka plansz "Atlas układów" (faza 0 + faza 2, integrator). Zasady: docs/ATLAS_STYLE_BIBLE.md

Uruchamianie planszy (przykład):
  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/plate_miesniowy.py

Skrypt planszy (skrót; pełny wzór: plate_krwionosny.py):
  import atlas_lib as al
  plate = al.Plate("miesniowy")
  plate.add(al.find_meshes(collection="1: Skeletal system"), role="context_bone")
  plate.add(active_objs, role="active", system="muscle", sprint_level=1.0)
  plate.add(vessels, role="active", system="artery", ctx="muscle")       # cienka tkanka: spoczynek miesza się z #8E7A78
  plate.add(lungs, role="active", system="resp", alpha=0.25)              # aktywny półprzezroczysty
  plate.set_view("detail", direction="front", frame=heart_objs, objects=heart_objs + great_vessels)
  plate.render(views=("front", "detail"), anchors={...}, flows3d=[...])

Najważniejsze narzędzia:
  import_glb(path, collection)        import GLB do własnej kolekcji (pułapka aktywnej kolekcji), bez rodziców
  align_hubmap(objs, version)         JEDNA transformacja HuBMAP -> Z-Anatomy na płeć (wersje v1.2-v1.4 mają wspólny układ)
  find_meshes / find_curves           wyszukiwanie siatek i krzywych (naczynia, nerwy, przewody to KRZYWE)
  thicken_curves, curve_points, curve_anchor, vessel_path   krzywe: grubość, punkty, kotwice, tory strzałek
  vert_bbox / world_bbox              obrys z wierzchołków (bound_box bywa nieaktualny)
  build_silhouette()                  sylwetka ciała z Z-Anatomy (remesh 11 mm, +5 mm), jedna dla wszystkich plansz
  license_check()                     blokada struktur NC (nerka, ucho wewnętrzne): render rzuca LicenseError

Zmienne środowiskowe: ATLAS_QUICK=1 (podgląd: pierwszy widok, stan sprint), ATLAS_ANCHORS_ONLY=1 (bez renderu),
ATLAS_LIGHT=<skala> (nadpisuje LIGHT_SCALE), ATLAS_CACHE=<folder> (pamięć podręczna sylwetki).
Startup.blend NIGDY nie jest zapisywany.
"""
import hashlib
import json
import os
import re
import subprocess
import tempfile

import bpy
from mathutils import Matrix, Vector

import numpy as np  # dołączony do Blendera

SCHEMA_VERSION = 2  # anchors.json: kamera i punkty 3D kotwic na widok; flows3d.json

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT_ROOT = os.path.join(ROOT, "public", "atlas")
# atlas_raw/ jest poza Gitem, więc w worktree agentów go nie ma. Kolejność: zmienna ATLAS_RAW,
# folder w tym checkoutcie, główny checkout projektu.
_MAIN_RAW = r"C:\Users\piryt\Desktop\Luźny Vibecoading\HIIt\atlas_raw"
RAW = os.environ.get("ATLAS_RAW") or (
    os.path.join(ROOT, "atlas_raw") if os.path.isdir(os.path.join(ROOT, "atlas_raw")) else _MAIN_RAW
)
HUBMAP_DIR = os.path.join(RAW, "hubmap")

# ---------------------------------------------------------------- kolory (księga stylu §2)
# Jedno źródło kolorów dla Pythona i TS: src/atlas/data/palette.json (walidator: scripts/atlas_check_palette.ts).
PALETTE_PATH = os.path.join(ROOT, "src", "atlas", "data", "palette.json")
with open(PALETTE_PATH, encoding="utf-8") as _f:
    PALETTE = json.load(_f)
SYSTEM_COLORS = {s["key"]: s["color"] for s in PALETTE["systems"]}
SYSTEM_LIGHT = {s["key"]: s["light"] for s in PALETTE["systems"]}
CONTEXT_COLORS = {k: v for k, v in PALETTE["context"].items() if k != "pageBg"}
REST_MIX = float(PALETTE["restMix"])  # spoczynek: 35% koloru układu + 65% kontekstu

# Światło. Faza 0 miała klucz 260 W, wypełnienie 90 W, kontrę 220 W: przy emisji sprintu kanał R się obcinał
# (bursztyn wychodził cytrynowy, ceglasty łososiowy). LIGHT_SCALE mnoży wszystkie trzy lampy, KEY_SCALE dodatkowo klucz.
# Wartości sprawdzone renderem próbek kolorów (tools_color_check.py, raport integratora K2): przy 1,0/1,0 bursztyn
# wychodził #FFFF76 (odcień +18,6°, 94% pikseli obciętych); przy 0,45/0,7 wszystkie 13 kolorów układów mają
# ΔE (mediana kuli, CIE76) ≤ 2,6 względem tabeli i 0-2% obciętych pikseli.
LIGHT_SCALE = float(os.environ.get("ATLAS_LIGHT", "0.45"))
KEY_SCALE = 0.7
EMISSION = 0.3  # emisja sprintu = EMISSION × poziom


def hex_to_linear(h):
    h = h.lstrip("#")
    srgb = [int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, 1.0)


def mix(a, b, t):
    return tuple(a[i] * (1 - t) + b[i] * t for i in range(4))


# ---------------------------------------------------------------- licencje: blokada NC
# Z-Anatomy License.txt: "Anatomy of the Inner Ear - University of Dundee - CC-BY-NC-SA 4.0",
# "Kidney - by Lissie Cowley - CC-BY-NC 4.0". Takich obiektów NIE wolno renderować (nawet jako tła).
# Krzywe "Intrarenal arteries/veins of ... kidney" leżą w drzewie naczyń, ale biegną wewnątrz modelu nerki NC,
# więc są zablokowane ostrożnościowo (nerki i ich naczynia bierze się z HuBMAP, CC BY 4.0).
NC_BLOCKLIST = [
    r"^Kidney\.(l|r)$",
    r"^Renal pelvis\.(l|r)$",
    r"^Cochlea\.(l|r)$",
    r"^Vestibule\.(l|r)$",
    r"^Intrarenal (arteries|veins) of (left|right) kidney$",
]
_NC_RE = [re.compile(p) for p in NC_BLOCKLIST]


class LicenseError(RuntimeError):
    pass


def _base_name(name):
    return re.sub(r"\.\d{3}$", "", name)  # sufiks kopii Blendera (.001)


def is_nc(obj_or_name):
    name = obj_or_name if isinstance(obj_or_name, str) else obj_or_name.name
    if not isinstance(obj_or_name, str) and obj_or_name.get("atl_source", "").startswith("hubmap"):
        return False  # obiekty HuBMAP (np. VH_M_Kidney_L) mają licencję CC BY 4.0
    return any(p.search(_base_name(name)) for p in _NC_RE)


def license_check(objs, where=""):
    bad = sorted({o.name for o in objs if is_nc(o)})
    if bad:
        raise LicenseError(f"ATLAS_LICENSE: struktury na licencji NC nie mogą trafić na planszę {where}: {bad}")


# ---------------------------------------------------------------- wyszukiwanie obiektów
MUSCLE_COVER_MATERIALS = ("Fascia", "Bursa", "Articular capsule", "Superficial")


def _pool(collection):
    if collection:
        col = bpy.data.collections.get(collection)
        if col is None:
            raise KeyError(f"Brak kolekcji: {collection}")
        return col.all_objects
    return bpy.data.objects


def _name_filter(o, suffixes, inc, exc):
    if suffixes is not None:
        suf = o.name.rsplit(".", 1)[-1] if "." in o.name else ""
        if suf not in suffixes:
            return False
    if inc and not any(p.search(o.name) for p in inc):
        return False
    if any(p.search(o.name) for p in exc):
        return False
    return True


def find_meshes(collection=None, suffixes=None, include=None, exclude=None, min_polys=1, exclude_materials=(), allow_nc=False):
    """Siatki z kolekcji (rekurencyjnie). include/exclude: listy wzorców regex (bez rozróżniania wielkości liter).
    exclude_materials: pomija siatki z takim ORYGINALNYM materiałem Z-Anatomy (np. powięzie przykrywające mięśnie).
    Struktury NC są pomijane (allow_nc=True tylko do pomiarów, nigdy do renderu).
    Wywoływać przed Plate.render (render podmienia materiały)."""
    inc = [re.compile(p, re.I) for p in (include or [])]
    exc = [re.compile(p, re.I) for p in (exclude or [])]
    out = []
    for o in _pool(collection):
        if o.type != 'MESH' or len(o.data.polygons) < min_polys:
            continue
        # Z-Anatomy trzyma tytuły kolekcji jako siatki tekstu (sufiks .g, materiał "Text"): pomijamy je.
        if o.name.endswith(".g") or any(m and m.name == "Text" for m in o.data.materials):
            continue
        if not _name_filter(o, suffixes, inc, exc):
            continue
        if exclude_materials and any(m and m.name in exclude_materials for m in o.data.materials):
            continue
        if not allow_nc and is_nc(o):
            continue
        out.append(o)
    return out


def find_curves(collection=None, suffixes=None, include=None, exclude=None, materials=None, allow_nc=False):
    """Krzywe (CURVE) z kolekcji: naczynia (materiały Z-Anatomy "Artery", "Vein", "Pulmonary artery", "Pulmonary vein"),
    nerwy obwodowe, oskrzela segmentowe, przewody. materials: tylko krzywe z takim oryginalnym materiałem."""
    inc = [re.compile(p, re.I) for p in (include or [])]
    exc = [re.compile(p, re.I) for p in (exclude or [])]
    out = []
    for o in _pool(collection):
        if o.type != 'CURVE' or o.name.endswith(".g"):
            continue
        if not _name_filter(o, suffixes, inc, exc):
            continue
        if materials is not None and not any(m and m.name in materials for m in o.data.materials):
            continue
        if not allow_nc and is_nc(o):
            continue
        out.append(o)
    return out


# ---------------------------------------------------------------- obrys
def _world_points(o):
    """Punkty obiektu w świecie (numpy N×3): wierzchołki siatki, punkty krzywej albo narożniki bound_box."""
    M = np.array(o.matrix_world, dtype=np.float64)
    if o.type == 'MESH' and len(o.data.vertices):
        co = np.empty(len(o.data.vertices) * 3, np.float64)
        o.data.vertices.foreach_get("co", co)
        co = co.reshape(-1, 3)
    elif o.type == 'CURVE':
        pts = []
        for sp in o.data.splines:
            if sp.type == 'BEZIER':
                pts += [tuple(p.co) for p in sp.bezier_points]
            else:
                pts += [tuple(p.co)[:3] for p in sp.points]
        if not pts:
            return np.zeros((0, 3))
        co = np.array(pts, dtype=np.float64)
    else:
        co = np.array([tuple(c) for c in o.bound_box], dtype=np.float64)
    return co @ M[:3, :3].T + M[:3, 3]


def vert_bbox(objs):
    """Obrys z wierzchołków/punktów w świecie. bound_box obiektów Z-Anatomy bywa nieaktualny po edycji siatki w pamięci.
    Uwaga: niektóre obiekty mają zabłąkane wierzchołki (np. Hypothalamus ma wierzchołek na z≈1,15 m)."""
    mn = np.full(3, 1e9)
    mx = np.full(3, -1e9)
    for o in objs:
        p = _world_points(o)
        if len(p):
            mn = np.minimum(mn, p.min(0))
            mx = np.maximum(mx, p.max(0))
    return Vector(mn.tolist()), Vector(mx.tolist())


def world_bbox(objs):
    """Obrys w świecie. Od fazy 2 liczony z wierzchołków (vert_bbox), nie z bound_box."""
    return vert_bbox(objs)


# ---------------------------------------------------------------- import GLB i dopasowanie HuBMAP
def import_glb(path, collection="ATL_import", smooth=True, source=None):
    """Import GLB do WŁASNEJ kolekcji. Bez tego glTF wkłada obiekty do aktywnej kolekcji Startup.blend
    (kolekcji szkieletu) i find_meshes("1: Skeletal system") zwraca je jako kości.
    Zdejmuje rodziców (z zachowaniem położenia) i usuwa puste węzły hierarchii. Zwraca listę siatek.
    path: pełna ścieżka albo nazwa pliku w atlas_raw/hubmap."""
    if not os.path.isabs(path):
        path = os.path.join(HUBMAP_DIR, path)
    col = bpy.data.collections.get(collection)
    if col is None:
        col = bpy.data.collections.new(collection)
        bpy.context.scene.collection.children.link(col)
    vl = bpy.context.view_layer
    prev = vl.active_layer_collection
    lc = next((c for c in vl.layer_collection.children if c.collection == col), None)
    if lc is not None:
        vl.active_layer_collection = lc
    before = set(bpy.data.objects)
    try:
        bpy.ops.import_scene.gltf(filepath=path)
    finally:
        vl.active_layer_collection = prev
    new = [o for o in bpy.data.objects if o not in before]
    vl.update()
    meshes = []
    tag = source or ("hubmap:" + os.path.basename(path) if os.path.normcase(HUBMAP_DIR) in os.path.normcase(path) else os.path.basename(path))
    for o in new:
        if o.type == 'MESH':
            m = o.matrix_world.copy()
            o.parent = None
            o.matrix_world = m
            o["atl_source"] = tag
            for c in list(o.users_collection):
                if c != col:
                    c.objects.unlink(o)
            if o.name not in col.objects:
                col.objects.link(o)
            if smooth:
                for p in o.data.polygons:
                    p.use_smooth = True
            meshes.append(o)
    for o in new:
        if o.type != 'MESH':
            bpy.data.objects.remove(o, do_unlink=True)
    vl.update()
    print(f"ATLAS_IMPORT {os.path.basename(path)}: {len(meshes)} siatek -> {collection}")
    return meshes


def hub(objs, name):
    """Obiekt HuBMAP po nazwie węzła (importer może dodać sufiks .001)."""
    for o in objs:
        if o.name == name or _base_name(o.name) == name:
            return o
    raise KeyError(name)


# JEDNA transformacja HuBMAP -> Z-Anatomy (metry, przód −Y, prawa strona ciała −X, stopy na Z≈0).
# Wyznaczona przez integratora (K2, 2026-11-25) metodą najmniejszych kwadratów na środkach 24 kręgów C1-L5
# (HuBMAP VH_M_Vertebrae.glb vs kręgi Z-Anatomy): skala jednolita + przesunięcie, BEZ obrotu.
#   błąd na kręgach: średnio 1,56 cm, maks. 2,43 cm (różna krzywizna kręgosłupa obu ludzi wzorcowych)
#   środki narządów po dopasowaniu (HuBMAP vs Z-Anatomy): płuca 0,9 cm, serce 1,5, prostata 0,5, tchawica 2,2,
#   pęcherz 2,4, grasica 2,4, wątroba 3,6, śledziona 3,6
#   wariant z obrotem (Umeyama, 12,5°) ma mniejszy błąd na kręgach (0,96 cm), ale gorszy na narządach (do 5,7 cm);
#   wariant „płuca do płuc, skala 1,05” (faza 1, oddechowy) ma 2,1 cm na kręgach i do 5,3 cm na narządach.
# Wersje v1.2 i v1.4 mają wspólny układ: 37 tych samych naczyń serca w VH_M_Blood_Vasculature_Heart (v1.2) i
# 3d-vh-m-blood-vasculature (v1.4) leży w identycznym miejscu (różnica środków 0,0 mm).
HUBMAP_ALIGN = {
    "male": {
        "scale": 0.98636,
        "translation": (0.00248, -0.00142, 0.80971),
        "method": "24 kręgi C1-L5, skala + przesunięcie",
        "error_cm": {"mean": 1.56, "max": 2.43},
    },
    # Kobieta (VH_F): ta sama transformacja co dla mężczyzny, żeby obie miednice miały wspólną skalę i kamerę.
    # NIE nakładać narządów żeńskich na męski szkielet Z-Anatomy (kontekst: VH_F_Pelvis, VH_F_Vertebrae, VH_F_skin).
    "female": {
        "scale": 0.98636,
        "translation": (0.00248, -0.00142, 0.80971),
        "method": "jak male (wspólna skala); kontekst żeński z HuBMAP",
        "error_cm": None,
    },
}
_VERSION_ALIAS = {"m": "male", "male": "male", "v1.2": "male", "v1.3": "male", "v1.4": "male", "vh_m": "male",
                  "f": "female", "female": "female", "vh_f": "female"}


def hubmap_matrix(version="male"):
    a = HUBMAP_ALIGN[_VERSION_ALIAS[str(version).lower()]]
    return Matrix.Translation(Vector(a["translation"])) @ Matrix.Scale(a["scale"], 4)


def align_hubmap(objs, version="male"):
    """Przenosi obiekty HuBMAP (zaimportowane przez import_glb, bez rodziców) do układu Z-Anatomy. Idempotentne."""
    M = hubmap_matrix(version)
    n = 0
    for o in objs:
        if o.get("atl_aligned"):
            continue
        o.matrix_world = M @ o.matrix_world
        o["atl_aligned"] = str(version)
        n += 1
    bpy.context.view_layer.update()
    print(f"ATLAS_ALIGN {version}: {n} obiektów")
    return objs


# ---------------------------------------------------------------- krzywe: grubość, punkty, kotwice, tory
def thicken_curves(curves, bevel=None, scale=1.0, normalize=False, resolution=3, caps=True):
    """Pogrubia krzywe do renderu (tylko w pamięci). Grubość = bevel_depth × promień punktu.
    bevel=None: zostaje bevel_depth z Z-Anatomy (naczynia: 0,0005, promienie punktów dają realną średnicę),
    pomnożony przez scale. normalize=True: promienie punktów wyrównane do mediany (zakres 0,7-1,3) - dla nerwów,
    w których promienie skaczą od 1 do 12 w jednej krzywej."""
    for o in curves:
        cd = o.data
        if normalize:
            pts = [p for sp in cd.splines for p in (sp.bezier_points if sp.type == 'BEZIER' else sp.points)]
            if pts:
                med = float(np.median([p.radius for p in pts])) or 1.0
                for p in pts:
                    p.radius = min(1.3, max(0.7, p.radius / med))
        if bevel is not None:
            cd.bevel_depth = bevel(o) if callable(bevel) else bevel
        cd.bevel_depth *= scale
        cd.bevel_mode = 'ROUND'
        cd.bevel_resolution = max(cd.bevel_resolution, resolution)
        cd.use_fill_caps = caps
    return curves


def _bezier_samples(sp, M, per_seg=6):
    from mathutils.geometry import interpolate_bezier
    bps = list(sp.bezier_points)
    if sp.use_cyclic_u and bps:
        bps.append(bps[0])
    out = []
    for a, b in zip(bps, bps[1:]):
        seg = interpolate_bezier(a.co, a.handle_right, b.handle_left, b.co, per_seg + 1)
        out += [M @ p for p in (seg if not out else seg[1:])]
    if len(bps) == 1:
        out = [M @ bps[0].co]
    return out


def spline_points(obj, per_seg=6):
    """Lista splajnów krzywej, każdy jako lista punktów świata (Bezier próbkowany, POLY/NURBS: punkty kontrolne)."""
    M = obj.matrix_world
    res = []
    for sp in obj.data.splines:
        if sp.type == 'BEZIER':
            res.append(_bezier_samples(sp, M, per_seg))
        else:
            res.append([M @ Vector(tuple(p.co)[:3]) for p in sp.points])
    return [r for r in res if r]


def curve_points(obj, spline="longest", per_seg=6, start_near=None):
    """Punkty jednego splajnu (domyślnie najdłuższego) w świecie. start_near: punkt, przy którym ma się zaczynać
    (kierunek krzywych w Z-Anatomy jest przypadkowy)."""
    if isinstance(obj, str):
        obj = bpy.data.objects[obj]
    sps = spline_points(obj, per_seg)
    if not sps:
        return []
    if spline == "longest":
        pts = max(sps, key=lambda s: sum((s[i + 1] - s[i]).length for i in range(len(s) - 1)))
    else:
        pts = sps[int(spline)]
    if start_near is not None and (pts[-1] - Vector(start_near)).length < (pts[0] - Vector(start_near)).length:
        pts = pts[::-1]
    return list(pts)


def curve_anchor(obj, z=None, t=None):
    """Punkt kotwicy NA krzywej: na wysokości z (m) albo w ułamku długości t (0-1) najdłuższego splajnu.
    Zwraca Vector (punkt świata) - przekazać jako {"point": ...} w anchors."""
    if isinstance(obj, str):
        obj = bpy.data.objects[obj]
    if t is not None:
        pts = curve_points(obj)
        L = [0.0]
        for a, b in zip(pts, pts[1:]):
            L.append(L[-1] + (b - a).length)
        target = t * L[-1]
        for i in range(len(pts) - 1):
            if L[i + 1] >= target:
                f = (target - L[i]) / max(1e-9, L[i + 1] - L[i])
                return pts[i].lerp(pts[i + 1], f)
        return pts[-1].copy()
    best = None
    for pts in spline_points(obj):
        for a, b in zip(pts, pts[1:]):
            if (a.z - z) * (b.z - z) <= 0 and a.z != b.z:
                return a.lerp(b, (z - a.z) / (b.z - a.z))
            for q in (a, b):
                d = abs(q.z - z)
                if best is None or d < best[0]:
                    best = (d, q.copy())
    return best[1]


def vessel_direction(obj):
    """Kierunek przepływu w krzywej naczynia Z-Anatomy z topologii drzewa: rodzicem krzywej jest naczynie,
    z którego wychodzi (tętnice) albo do którego uchodzi (żyły). Zwraca (punkty od początku do końca przepływu,
    opis kontroli). Tętnica: start = koniec bliższy rodzicowi. Żyła: koniec = koniec bliższy rodzicowi."""
    if isinstance(obj, str):
        obj = bpy.data.objects[obj]
    pts = curve_points(obj)
    mat = (obj.data.materials[0].name if obj.data.materials and obj.data.materials[0] else "").lower()
    if mat == "text":
        mat = ""
    is_vein = "vein" in mat or "vein" in obj.name.lower() or "vena" in obj.name.lower()
    par = obj.parent if obj.parent is not None and obj.parent.type == 'CURVE' else None
    if par is None:
        return pts, "brak rodzica-krzywej: kierunek nieustalony"
    ppts = [p for s in spline_points(par) for p in s]
    d0 = min((pts[0] - q).length for q in ppts)
    d1 = min((pts[-1] - q).length for q in ppts)
    near_start = d0 <= d1
    if is_vein:
        pts = pts[::-1] if near_start else pts  # żyła płynie DO rodzica
    else:
        pts = pts if near_start else pts[::-1]  # tętnica płynie OD rodzica
    return pts, f"rodzic {par.name}: odległość końców {min(d0, d1) * 1000:.1f} mm"


def vessel_path(names):
    """Tor przepływu przez kolejne naczynia (krzywe Z-Anatomy, najdłuższy splajn każdej).
    Naczynie potomne często odchodzi (albo uchodzi) w połowie naczynia macierzystego, a nie na jego końcu, dlatego:
      wejście = punkt naczynia najbliższy końcowi poprzedniego odcinka (pierwsze naczynie: koniec dalszy od wyjścia),
      wyjście = punkt najbliższy następnemu naczyniu (ostatnie: koniec dalszy od wejścia).
    Kierunek każdego odcinka jest potem porównany z kierunkiem z topologii drzewa (vessel_direction), jeśli da się go
    ustalić. Zwraca (punkty, raport): przerwy w mm i zgodność z drzewem."""
    curves = [bpy.data.objects[n] for n in names]
    pts_all = [curve_points(o) for o in curves]
    flat = [[p for s in spline_points(o) for p in s] for o in curves]

    def nearest(pts, targets):
        return min(range(len(pts)), key=lambda j: min((pts[j] - q).length for q in targets))

    out, report = [], []
    for i, (n, pts) in enumerate(zip(names, pts_all)):
        last = len(pts) - 1
        if i + 1 < len(names):
            exit_i = nearest(pts, flat[i + 1])
        else:
            exit_i = None
        if out:
            entry_i = nearest(pts, [out[-1]])
        else:
            entry_i = last if (exit_i is not None and exit_i < last / 2) else 0
        if exit_i is None:
            exit_i = 0 if entry_i > last / 2 else last
        seg = pts[entry_i:exit_i + 1] if entry_i <= exit_i else pts[exit_i:entry_i + 1][::-1]
        if len(seg) < 2:  # wejście i wyjście w tym samym punkcie: odcinek zerowy
            seg = [pts[entry_i]]
        topo, note = vessel_direction(n)
        if note.startswith("brak") or len(seg) < 2:
            agree = "kierunek z ciągłości toru (drzewo go nie rozstrzyga)"
        else:
            fwd = (seg[-1] - seg[0]).normalized()
            tdir = (topo[-1] - topo[0]).normalized()
            agree = "zgodny z drzewem" if fwd.dot(tdir) > 0 else "NIEZGODNY z drzewem"
        gap = (seg[0] - out[-1]).length if out else 0.0
        report.append(f"{n}: {agree}; {note}" + (f"; przerwa od poprzedniego {gap * 1000:.1f} mm" if out else ""))
        out += seg[1:] if (out and gap < 1e-4) else seg
    return out, report


def resample(pts, step=0.02):
    """Punkty co `step` metrów (strzałki nie potrzebują setek punktów)."""
    if len(pts) < 2:
        return list(pts)
    out = [pts[0]]
    acc = 0.0
    for a, b in zip(pts, pts[1:]):
        seg = (b - a).length
        while acc + seg >= step:
            f = (step - acc) / seg
            a = a.lerp(b, f)
            seg = (b - a).length
            out.append(a.copy())
            acc = 0.0
        acc += seg
    if (out[-1] - pts[-1]).length > step * 0.3:
        out.append(pts[-1].copy())
    return out


# ---------------------------------------------------------------- materiały (księga stylu §3)
def _principled(mat):
    mat.use_nodes = True
    return next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")


def _set_input(bsdf, name, value):
    if name in bsdf.inputs:
        bsdf.inputs[name].default_value = value


def make_material(name, color, roughness=0.7, subsurface=0.0, emission=0.0, alpha=1.0, backface_culling=None):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    bsdf = _principled(mat)
    _set_input(bsdf, "Base Color", color)
    _set_input(bsdf, "Roughness", roughness)
    _set_input(bsdf, "Specular IOR Level", 0.3)
    _set_input(bsdf, "Coat Weight", 0.0)
    _set_input(bsdf, "Subsurface Weight", subsurface)
    _set_input(bsdf, "Subsurface Radius", (0.02, 0.008, 0.005))
    _set_input(bsdf, "Emission Color", color)
    _set_input(bsdf, "Emission Strength", emission)
    _set_input(bsdf, "Alpha", alpha)
    if alpha < 1.0:
        try:
            mat.surface_render_method = 'BLENDED'
        except (AttributeError, TypeError):
            pass
    if backface_culling is not None:
        mat.use_backface_culling = backface_culling
    mat.diffuse_color = color
    return mat


def active_color(system, state="sprint", level=1.0, ctx=None):
    """Kolor struktury aktywnej (ta sama funkcja dla 2D i, później, 3D). ctx: 'bone' | 'muscle' - kolor kontekstu,
    z którym miesza się spoczynek. Cienkie tkanki (naczynia, przewody, nerwy jako krzywe) mieszamy z mięśniami/tłem
    #8E7A78, bo z kością 35% daje prawie biel. level: 0-1 albo 'dim' (w sprincie wygląda jak w spoczynku)."""
    sys_col = hex_to_linear(SYSTEM_COLORS[system])
    ctx = ctx or ("muscle" if system == "muscle" else "bone")
    ctx_col = hex_to_linear(CONTEXT_COLORS[ctx])
    if state == "rest" or level == "dim":
        return mix(ctx_col, sys_col, REST_MIX), 0.0, REST_MIX
    t = max(REST_MIX, float(level))
    return mix(ctx_col, sys_col, t), EMISSION * float(level), t


def role_material(role, system=None, state="sprint", level=1.0, alpha=None, ctx=None):
    """role: context_bone | context_bone_ghost | context_muscle | context_skin | active.
    level (0..1 albo 'dim'): jak mocno struktura pracuje w danym stanie. alpha: aktywny półprzezroczysty."""
    if role == "context_bone":
        return make_material("ATL_bone", hex_to_linear(CONTEXT_COLORS["bone"]), roughness=0.75)
    if role == "context_bone_ghost":
        return make_material("ATL_bone_ghost", hex_to_linear(CONTEXT_COLORS["bone"]), roughness=0.75,
                             alpha=alpha or 0.22, backface_culling=True)
    if role == "context_muscle":
        return make_material("ATL_ctx_muscle", hex_to_linear(CONTEXT_COLORS["muscle"]), roughness=0.7, subsurface=0.05)
    if role == "context_skin":
        return make_material("ATL_skin", hex_to_linear(CONTEXT_COLORS["skin"]), roughness=0.6, alpha=alpha or 0.12,
                             backface_culling=True)
    if role == "active":
        col, emi, t = active_color(system, state, level, ctx)
        a = 1.0 if alpha is None else alpha
        key = f"ATL_{system}_{ctx or 'd'}_{state}_{int(round(t * 100))}_{int(round(emi * 100))}_{int(round(a * 100))}"
        return make_material(key, col, roughness=0.6, subsurface=0.08 if a >= 1 else 0.0, emission=emi, alpha=a,
                             backface_culling=True if a < 1 else None)
    raise ValueError(role)


def assign(obj, mat):
    """Przypina materiał do wszystkich slotów, także tych powiązanych z obiektem (link='OBJECT')."""
    if not obj.material_slots:
        obj.data.materials.append(mat)
    for slot in obj.material_slots:
        slot.link = 'DATA'
        slot.material = mat


# ---------------------------------------------------------------- sylwetka ciała
def _combined_mesh(objs, name):
    vs, lts, lvs, base = [], [], [], 0
    for o in objs:
        me = o.data
        n = len(me.vertices)
        if n == 0 or len(me.polygons) == 0:
            continue
        co = _world_points(o).astype(np.float32)
        lt = np.empty(len(me.polygons), np.int32)
        me.polygons.foreach_get("loop_total", lt)
        lv = np.empty(len(me.loops), np.int32)
        me.loops.foreach_get("vertex_index", lv)
        vs.append(co)
        lts.append(lt)
        lvs.append(lv + base)
        base += n
    V = np.concatenate(vs).astype(np.float32)
    LT = np.concatenate(lts)
    LV = np.concatenate(lvs).astype(np.int32)
    me = bpy.data.meshes.new(name)
    me.vertices.add(len(V))
    me.vertices.foreach_set("co", V.ravel())
    me.loops.add(len(LV))
    me.loops.foreach_set("vertex_index", LV)
    me.polygons.add(len(LT))
    me.polygons.foreach_set("loop_start", np.concatenate([[0], np.cumsum(LT)[:-1]]).astype(np.int32))
    me.update(calc_edges=True)
    return me


def _keep_outer_shells(me, min_verts=400):
    """Usuwa wewnętrzne powłoki (jamy ciała) i okruchy: zostają składowe, których obrys nie leży
    w całości wewnątrz obrysu większej składowej."""
    import bmesh
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
    co = np.empty(n * 3, np.float32)
    me.vertices.foreach_get("co", co)
    co = co.reshape(-1, 3)
    comps = []
    for c in np.unique(lab):
        idx = np.nonzero(lab == c)[0]
        comps.append((len(idx), c, co[idx].min(0), co[idx].max(0)))
    comps.sort(key=lambda t: -t[0])
    keep = []
    for cnt, c, mn, mx in comps:
        if cnt < min_verts:
            continue
        if not any(np.all(mn >= kmn - 1e-4) and np.all(mx <= kmx + 1e-4) for _, _, kmn, kmx in keep):
            keep.append((cnt, c, mn, mx))
    drop = ~np.isin(lab, [k[1] for k in keep])
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[bm.verts[i] for i in np.nonzero(drop)[0]], context='VERTS')
    bm.to_mesh(me)
    bm.free()
    return me


def silhouette_sources():
    """Źródła sylwetki: mięśnie (bez powięzi), kości i trzewia Z-Anatomy (bez struktur NC)."""
    muscles = find_meshes(collection="4: Muscular system", exclude=[r"^Rectus sheath", r"^Linea alba"],
                          exclude_materials=MUSCLE_COVER_MATERIALS)
    bones = find_meshes(collection="1: Skeletal system")
    viscera = find_meshes(collection="8: Visceral systems")
    return muscles + bones + viscera


def build_silhouette(sources=None, voxel=0.011, offset=0.005, name="ATL_silhouette", cache=True):
    """Sylwetka ciała: powłoka wokselowa (remesh `voxel`, wygładzenie, +`offset` wzdłuż normalnej) z mięśni, kości
    i trzewi Z-Anatomy. Jedna dla wszystkich plansz (pasuje do szkieletu Z-Anatomy; skóra HuBMAP ma inną pozę i wzrost).
    Zwraca obiekt (niepodpięty do sceny; Plate.add go podepnie). Wynik trzymany w pamięci podręcznej poza repo."""
    sources = sources if sources is not None else silhouette_sources()
    key = hashlib.sha1((",".join(sorted(o.name for o in sources)) + f"|{voxel}|{offset}").encode()).hexdigest()[:12]
    cache_dir = os.environ.get("ATLAS_CACHE") or os.path.join(tempfile.gettempdir(), "atlas_cache")
    path = os.path.join(cache_dir, f"silhouette_{key}.npz")
    if cache and os.path.exists(path):
        d = np.load(path)
        me = bpy.data.meshes.new(name)
        me.from_pydata(d["v"].tolist(), [], d["f"].tolist())
        print("ATLAS_SILHOUETTE z pamięci podręcznej", path)
    else:
        src = _combined_mesh(sources, "ATL_hull_src")
        tmp = bpy.data.objects.new("ATL_hull_tmp", src)
        bpy.context.scene.collection.objects.link(tmp)
        r = tmp.modifiers.new("remesh", 'REMESH')
        r.mode = 'VOXEL'
        r.voxel_size = voxel
        r.adaptivity = 0.0
        s = tmp.modifiers.new("smooth", 'SMOOTH')
        s.factor = 0.8
        s.iterations = 10
        dsp = tmp.modifiers.new("skin_thickness", 'DISPLACE')
        dsp.mid_level = 0.0
        dsp.strength = offset
        dg = bpy.context.evaluated_depsgraph_get()
        dg.update()
        me = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
        me.name = name
        bpy.data.objects.remove(tmp, do_unlink=True)
        bpy.data.meshes.remove(src)
        _keep_outer_shells(me)
        if cache:
            os.makedirs(cache_dir, exist_ok=True)
            v = np.empty(len(me.vertices) * 3, np.float32)
            me.vertices.foreach_get("co", v)
            f = np.empty(len(me.polygons) * 4, np.int32) if all(p.loop_total == 4 for p in me.polygons) else None
            if f is not None:
                me.polygons.foreach_get("vertices", f)
                np.savez_compressed(path, v=v.reshape(-1, 3), f=f.reshape(-1, 4))
    for p in me.polygons:
        p.use_smooth = True
    hull = bpy.data.objects.new(name, me)
    hull.visible_shadow = False
    print("ATLAS_SILHOUETTE wielokąty", len(me.polygons))
    return hull


# ---------------------------------------------------------------- scena planszy
# Kierunki kamery: wektor OD środka DO kamery. Obraz: prawo = forward × up (forward = -kierunek).
VIEW_DIRECTIONS = {
    "front": Vector((0, -1, 0)),  # kamera przed ciałem (−Y), prawa strona ciała po lewej stronie obrazu
    "back": Vector((0, 1, 0)),
    "side": Vector((1, 0, 0)),    # kamera po lewej stronie ciała (+X), przód (−Y) po lewej stronie obrazu
    "left": Vector((1, 0, 0)),
    "right": Vector((-1, 0, 0)),
}


def _camera_basis(direction):
    d = VIEW_DIRECTIONS[direction] if isinstance(direction, str) else Vector(direction).normalized()
    forward = -d
    up = Vector((0, 0, 1))
    right = forward.cross(up).normalized()
    up = right.cross(forward).normalized()
    return d, right, up


class Plate:
    def __init__(self, plate_id, resolution=(1000, 1800), ortho_scale=2.0, out_dir=None):
        self.id = plate_id
        self.res = resolution
        self.ortho_scale = ortho_scale
        self.items = []  # (obj, role, system, levels{state: level}) - krotka 4 elementów (zgodność z fazą 1)
        self.extra = {}  # obj.name -> {"alpha", "ctx", "views"}
        self.view_specs = {}  # nazwa widoku -> {"direction", "center", "ortho_scale", "objects"}
        self.out_dir = out_dir or os.path.join(OUT_ROOT, plate_id)
        os.makedirs(self.out_dir, exist_ok=True)
        self.scene = bpy.data.scenes.new(f"ATLAS_{plate_id}")
        self.col = bpy.data.collections.new(f"ATLAS_{plate_id}_objs")
        self.scene.collection.children.link(self.col)
        self.light_scale = LIGHT_SCALE
        self._setup_render()
        self._setup_world()
        self.center = Vector((0, 0, 0.88))

    # -- dodawanie obiektów
    def add(self, objs, role, system=None, rest_level=None, sprint_level=1.0, alpha=None, ctx=None, views=None):
        """alpha: aktywny półprzezroczysty. ctx: kolor kontekstu spoczynku ('bone'/'muscle'; krzywe domyślnie 'muscle').
        views: obiekt widoczny tylko w tych widokach (np. ("detail",))."""
        objs = list(objs)
        license_check(objs, self.id)
        for o in objs:
            if o.name not in self.col.objects:
                self.col.objects.link(o)
            o.hide_render = False
            o.hide_viewport = False
            self.items.append((o, role, system, {"rest": rest_level, "sprint": sprint_level}))
            c = ctx if ctx is not None else ("muscle" if (o.type == 'CURVE' and role == "active") else None)
            self.extra[o.name] = {"alpha": alpha, "ctx": c, "views": tuple(views) if views else None}
            if role == "context_bone_ghost":
                o.visible_shadow = False
        return objs

    def set_view(self, name, direction="front", center=None, ortho_scale=None, objects=None, frame=None, margin=1.06):
        """Widok o dowolnej nazwie (np. 'detail', 'detail_knee'): kierunek kamery, środek i ortho_scale
        (albo frame=lista obiektów: kadr z ich obrysu), zbiór widocznych obiektów (None = wszystkie)."""
        spec = {"direction": direction, "center": Vector(center) if center is not None else None,
                "ortho_scale": ortho_scale, "objects": set(objects) if objects is not None else None}
        if frame is not None:
            c, s = self.frame_objects(frame, direction, margin)
            spec["center"] = spec["center"] or c
            spec["ortho_scale"] = spec["ortho_scale"] or s
        self.view_specs[name] = spec
        return spec

    def frame_objects(self, objs, direction="front", margin=1.06):
        """Środek i ortho_scale kadru obejmującego obiekty w danym kierunku (obraz pionowy lub poziomy)."""
        mn, mx = vert_bbox(objs)
        c = (mn + mx) / 2
        _, right, up = _camera_basis(direction)
        ext = mx - mn
        w = abs(ext.dot(Vector([abs(v) for v in right])))
        h = abs(ext.dot(Vector([abs(v) for v in up])))
        aspect = self.res[0] / self.res[1]
        # Blender: ortho_scale obejmuje dłuższy bok obrazu
        s = (max(w, h * aspect) if aspect >= 1 else max(h, w / aspect)) * margin
        return c, s

    def frame_all(self, margin=1.06):
        mn, mx = world_bbox([i[0] for i in self.items])
        self.center, self.ortho_scale = self.frame_objects([i[0] for i in self.items], "front", margin)
        return mn, mx

    # -- ustawienia
    def _setup_render(self):
        s = self.scene
        for eng in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
            try:
                s.render.engine = eng
                break
            except TypeError:
                continue
        s.render.resolution_x, s.render.resolution_y = self.res
        s.render.resolution_percentage = 100
        s.render.film_transparent = True
        s.render.image_settings.file_format = 'PNG'
        s.render.image_settings.color_mode = 'RGBA'
        try:
            s.view_settings.view_transform = 'Standard'
            s.view_settings.look = 'None'
        except TypeError:
            pass
        try:
            s.eevee.taa_render_samples = 64
        except AttributeError:
            pass
        for attr, val in (("use_gtao", True), ("use_shadows", True), ("shadow_ray_count", 2), ("shadow_step_count", 8)):
            try:
                setattr(s.eevee, attr, val)
            except (AttributeError, TypeError):
                pass

    def _setup_world(self):
        w = bpy.data.worlds.new(f"ATLAS_world_{self.id}")
        w.use_nodes = True
        bg = next(n for n in w.node_tree.nodes if n.type == "BACKGROUND")
        bg.inputs[0].default_value = hex_to_linear("#2A3348")
        bg.inputs[1].default_value = 0.35
        self.scene.world = w

    def _spec(self, view):
        spec = self.view_specs.get(view)
        if spec is not None:
            return spec
        return {"direction": view if view in VIEW_DIRECTIONS else "front", "center": None, "ortho_scale": None, "objects": None}

    def _lights(self, view):
        """Klucz z lewej-góry-przodu (względem kamery), wypełnienie z prawej, kontra z tyłu."""
        for o in [o for o in self.scene.collection.objects if o.type == 'LIGHT']:
            bpy.data.objects.remove(o, do_unlink=True)
        spec = self._spec(view)
        B, R, _ = _camera_basis(spec["direction"])
        Z = Vector((0, 0, 1))
        c = spec["center"] if spec["center"] is not None else self.center
        k = self.light_scale
        rigs = [  # (nazwa, pozycja względna, moc W, rozmiar, kolor)
            ("key", -1.6 * R + 2.6 * B + 1.4 * Z, 260 * k * KEY_SCALE, 1.6, (1.0, 0.97, 0.93)),
            ("fill", 1.8 * R + 2.4 * B + 0.2 * Z, 90 * k, 2.0, (0.9, 0.95, 1.0)),
            ("rim", 0.6 * R - 2.6 * B + 1.2 * Z, 220 * k, 1.0, (0.85, 0.92, 1.0)),
        ]
        for name, rel, power, size, colr in rigs:
            ld = bpy.data.lights.new(f"ATL_{name}", 'AREA')
            ld.energy = power
            ld.size = size
            ld.color = colr
            lo = bpy.data.objects.new(f"ATL_{name}", ld)
            lo.location = c + rel
            lo.rotation_euler = (c - lo.location).to_track_quat('-Z', 'Y').to_euler()
            self.scene.collection.objects.link(lo)

    def _camera(self, view):
        spec = self._spec(view)
        cam_d = bpy.data.cameras.get("ATL_cam") or bpy.data.cameras.new("ATL_cam")
        cam_d.type = 'ORTHO'
        cam_d.ortho_scale = spec["ortho_scale"] or self.ortho_scale
        cam_d.sensor_fit = 'AUTO'
        cam_d.shift_x = cam_d.shift_y = 0.0
        cam_d.clip_start = 0.01
        cam_d.clip_end = 50
        cam = bpy.data.objects.get("ATL_cam") or bpy.data.objects.new("ATL_cam", cam_d)
        if cam.name not in self.scene.collection.objects:
            self.scene.collection.objects.link(cam)
        c = spec["center"] if spec["center"] is not None else self.center
        B, _, _ = _camera_basis(spec["direction"])
        cam.location = c + B * 6.0
        cam.rotation_euler = (c - cam.location).to_track_quat('-Z', 'Y').to_euler()
        self.scene.camera = cam
        self._visible(view)
        # Bez tego matrix_world kamery jest nieaktualna i rzutowanie kotwic daje złe wyniki.
        self.scene.view_layers[0].update()
        return cam

    def _visible(self, view):
        keep = self._spec(view)["objects"]
        for o, *_ in self.items:
            ex = self.extra.get(o.name, {})
            vis = (keep is None or o in keep) and (not ex.get("views") or view in ex["views"])
            o.hide_render = not vis

    def camera_meta(self, view):
        """Parametry rzutu ortograficznego (te same w TS: src/atlas/projection.ts)."""
        spec = self._spec(view)
        B, R, U = _camera_basis(spec["direction"])
        c = spec["center"] if spec["center"] is not None else self.center
        return {"direction": spec["direction"] if isinstance(spec["direction"], str) else list(spec["direction"]),
                "center": [round(v, 5) for v in c], "right": [round(v, 6) for v in R], "up": [round(v, 6) for v in U],
                "orthoScale": round(spec["ortho_scale"] or self.ortho_scale, 5)}

    def _apply_state(self, state):
        for o, role, system, levels in self.items:
            ex = self.extra.get(o.name, {})
            if role == "active":
                lvl = levels[state]
                if lvl is None:
                    lvl = REST_MIX if state == "rest" else 1.0
                assign(o, role_material(role, system, state, lvl, alpha=ex.get("alpha"), ctx=ex.get("ctx")))
            else:
                assign(o, role_material(role, alpha=ex.get("alpha")))

    def _project(self, cam, point):
        from bpy_extras.object_utils import world_to_camera_view
        v = world_to_camera_view(self.scene, cam, Vector(point))
        return [round(v.x, 4), round(1.0 - v.y, 4)]

    def anchor_point(self, obj_names, view):
        """Punkt kotwicy: środek obrysu obiektu(ów), przesunięty na stronę bliższą kamerze."""
        objs = [bpy.data.objects[n] for n in obj_names]
        mn, mx = world_bbox(objs)
        p = (mn + mx) / 2
        B, _, _ = _camera_basis(self._spec(view)["direction"])
        for i in range(3):
            if B[i] > 0.5:
                p[i] = mx[i]
            elif B[i] < -0.5:
                p[i] = mn[i]
        return p

    def resolve_anchor(self, a, view):
        """a: {"objects": [nazwy], "offset": (dx, dz)} | {"point": (x, y, z)} | {"curve": nazwa, "z": z albo "t": t}."""
        if "point" in a:
            p = Vector(a["point"])
        elif "curve" in a:
            p = curve_anchor(a["curve"], z=a.get("z"), t=a.get("t"))
        else:
            p = self.anchor_point(a["objects"], view)
        # offset (dx, dz): dx w prawo NA OBRAZIE (front: +X, back: −X, jak w fazie 0), dz w górę
        off = a.get("offset", (0, 0))
        _, R, _ = _camera_basis(self._spec(view)["direction"])
        return p + R * off[0] + Vector((0, 0, off[1]))

    def _read_existing(self):
        path = os.path.join(self.out_dir, "anchors.json")
        try:
            with open(path, encoding="utf-8") as f:
                old = json.load(f)
            if old.get("id") == self.id and list(old.get("resolution", [])) == list(self.res):
                return old
        except (OSError, ValueError):
            pass
        return None

    # -- render
    def render(self, views=("front",), states=("rest", "sprint"), anchors=None, flows3d=None, webp_quality=88):
        """anchors: {klucz: {"objects"|"point"|"curve": ..., "views": [widoki], "offset": (dx, dz)}}
        flows3d: [{"id", "kind", "labelPl", "views": [...], "points": [Vector...]}] - tory strzałek w metrach.
        anchors.json jest SCALANY z istniejącym (widoki i stany, których teraz nie renderujemy, zostają)."""
        anchors = anchors or {}
        quick = bool(os.environ.get("ATLAS_QUICK"))  # szybki podgląd: tylko pierwszy widok w stanie sprint
        anchors_only = bool(os.environ.get("ATLAS_ANCHORS_ONLY"))  # tylko przelicz kotwice, bez renderu
        if quick:
            views, states = views[:1], ("sprint",)
        license_check([i[0] for i in self.items], self.id)
        old = self._read_existing() or {}
        meta = {"schemaVersion": SCHEMA_VERSION, "id": self.id, "resolution": list(self.res),
                "views": dict(old.get("views", {}))}
        for view in views:
            cam = self._camera(view)
            self._lights(view)
            visible = [i[0] for i in self.items if not i[0].hide_render]
            license_check(visible, f"{self.id}/{view}")
            # Obrys ciała na obrazie (0-1): strona przycina nim puste marginesy.
            mn, mx = world_bbox(visible)
            corners = [Vector((x, y, z)) for x in (mn.x, mx.x) for y in (mn.y, mx.y) for z in (mn.z, mx.z)]
            pts = [self._project(cam, c) for c in corners]
            bbox = [min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts)]
            prev = meta["views"].get(view, {})
            vmeta = {"images": dict(prev.get("images", {})), "anchors": {}, "anchors3d": {},
                     "bbox": [round(max(0.0, min(1.0, v)), 4) for v in bbox], "camera": self.camera_meta(view)}
            for key, a in anchors.items():
                if view not in a.get("views", [view]):
                    continue
                p = self.resolve_anchor(a, view)
                vmeta["anchors"][key] = self._project(cam, p)
                vmeta["anchors3d"][key] = [round(v, 5) for v in p]
            for state in states:
                if anchors_only:
                    vmeta["images"].setdefault(state, f"{view}_{state}.webp")
                    continue
                self._apply_state(state)
                self._visible(view)
                png = os.path.join(self.out_dir, f"{view}_{state}.png")
                self.scene.render.filepath = png
                bpy.ops.render.render(write_still=True, scene=self.scene.name)
                webp = png[:-4] + ".webp"
                try:
                    subprocess.run(["magick", png, "-quality", str(webp_quality), webp], check=True)
                    os.remove(png)
                    vmeta["images"][state] = f"{view}_{state}.webp"
                except (OSError, subprocess.CalledProcessError) as e:
                    print("ATLAS: konwersja do webp nieudana, zostaje PNG:", e)
                    vmeta["images"][state] = f"{view}_{state}.png"
                print(f"ATLAS_RENDERED {self.id} {view} {state}")
            vmeta["images"] = {s: vmeta["images"][s] for s in ("rest", "sprint") if s in vmeta["images"]}
            meta["views"][view] = vmeta
        for o, *_ in self.items:
            o.hide_render = False
        with open(os.path.join(self.out_dir, "anchors.json"), "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2, ensure_ascii=False)
        if flows3d is not None:
            self.write_flows3d(flows3d)
        print("ATLAS_DONE", os.path.join(self.out_dir, "anchors.json"))
        return meta

    def write_flows3d(self, flows, step=0.02):
        """public/atlas/<id>/flows3d.json: tory strzałek w metrach (układ Z-Anatomy). AtlasPlate rzutuje je tym samym
        rzutem co kotwice (kamera z anchors.json), więc działają w każdym widoku i później w 3D."""
        out = {"schemaVersion": 1, "units": "m", "frame": "Z-Anatomy (przód −Y, prawa strona ciała −X, stopy Z≈0)",
               "flows": []}
        for fl in flows:
            pts = resample([Vector(p) for p in fl["points"]], step)
            out["flows"].append({k: v for k, v in {
                "id": fl["id"], "kind": fl["kind"], "labelPl": fl.get("labelPl"), "views": fl.get("views"),
                "points": [[round(v, 4) for v in p] for p in pts]}.items() if v is not None})
        path = os.path.join(self.out_dir, "flows3d.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(out, f, indent=1, ensure_ascii=False)
        print("ATLAS_FLOWS3D", path, len(out["flows"]))
        return path
