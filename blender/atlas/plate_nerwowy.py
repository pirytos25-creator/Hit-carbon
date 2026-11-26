"""
Plansza: UKŁAD NERWOWY w sprincie (faza 1, agent 1).
  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/plate_nerwowy.py
Zmienne: ATLAS_DRY=1 (tylko lista dopasowań), ATLAS_QUICK=1 (podgląd), ATLAS_ANCHORS_ONLY=1 (kotwice + flows.json).

Co pokazuje:
  droga rozkazu ruchu: kora ruchowa -> rdzeń kręgowy (opona twarda, korzenie, ogon koński) -> sploty
  lędźwiowy i krzyżowy -> nerw kulszowy / piszczelowy / strzałkowy (widok z tyłu) i nerw udowy (z przodu),
  oraz układ współczulny: pień współczulny i nadnercza (rdzeń nadnerczy).

Decyzje tylko w tym skrypcie (atlas_lib.py bez zmian):
  * Nerwy obwodowe w Z-Anatomy to KRZYWE z promieniem 0,5 mm (1 px na renderze całego ciała).
    Pogrubiamy je tu przez bevel_depth (nerw kulszowy ok. 8 mm, jak w rzeczywistości ok. 1-2 cm szerokości).
  * Kręgosłup i czaszka są „duchami” (półprzezroczysta kość), bo inaczej zasłaniają rdzeń i mózg.
  * Sylwetka: Z-Anatomy nie ma skóry, a skóra HuBMAP ma inną pozę i wzrost. Budujemy więc powłokę
    z mięśni, kości i trzewi (przemiana wokselowa), dopasowaną 1:1 do szkieletu.
  * Kamera: ta sama co na planszy mięśniowej (obrys kości + mięśni), żeby integrator mógł nakładać warstwy.
"""
import json
import os
import re
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402

bpy = al.bpy
from mathutils import Vector  # noqa: E402

NERV = "7: Nervous system & Sense organs"
DRY = bool(os.environ.get("ATLAS_DRY"))


def strip_side(name):
    return re.sub(r"\.(l|r)$", "", name)


# ---------------------------------------------------------------- nerwy obwodowe (krzywe)
# (wzorzec nazwy bez strony, poziom pracy w sprincie, promień bevel w metrach)
LOWER_MOTOR = [
    (r"^Sciatic nerve$", 1.0, 0.0048),
    (r"^Tibial nerve$", 1.0, 0.0034),
    (r"^Common fibular nerve$", 1.0, 0.0028),
    (r"^Femoral nerve$", 1.0, 0.0034),
    (r"^Deep fibular nerve$", 1.0, 0.0018),
    (r"^Superficial fibular nerve$", 1.0, 0.0016),
    (r"^Muscular branches of deep fibular nerve$", 1.0, 0.0014),
    (r"^Obturator nerve$", 1.0, 0.0020),
    (r"branch of obturator nerve$", 1.0, 0.0015),
    (r"^Superior gluteal nerve$", 1.0, 0.0018),
    (r"^Nerve to (piriformis|quadratus femoris) muscle$", 1.0, 0.0014),
    (r"plantar nerve$", 1.0, 0.0015),
]
LOWER_SENSORY = [
    r"^Saphenous nerve$", r"saphenous nerve$", r"[Ss]ural", r"femoral cutaneous nerve$",
    r"cutaneous branches of femoral nerve$", r"cutaneous nerve of foot$", r"genitofemoral nerve$",
    r"^Ilio-inguinal nerve$", r"^Iliohypogastric nerve$", r"^Pudendal nerve$", r"plantar digital",
    r"digital branches of (deep|superficial) fibular", r"root of posterior femoral cutaneous",
]
SYMPATHETIC = [(r"^Sympathetic trunk$", 0.0022), (r"^Sympathetic nerves$", 0.0012)]
ROOTS = [r"^(Anterior|Posterior) root of spinal nerve$", r"^Cauda equina$"]
THORACIC = [r"^Intercostal nerves$"]
CRANIAL = [r"\((I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\)$", r"mandibular|maxillary|ophthalmic|alveolar|buccal|lingual|"
           r"mental nerve|mylohyoid|chorda|cochlear|vestibular"]
SKIP_CURVES = [r"curve", r"Central canal"]


def match_any(pats, name):
    return any(re.search(p, name) for p in pats)


nerve_curves = [o for o in bpy.data.collections[NERV].all_objects
                if o.type == 'CURVE' and not match_any(SKIP_CURVES, o.name)]

groups = {"lower_motor": [], "lower_sensory": [], "sympathetic": [], "roots": [], "thoracic": [],
          "cranial": [], "upper": []}
bevel = {}
for o in nerve_curves:
    base = strip_side(o.name)
    hit = next(((lvl, bev) for p, lvl, bev in LOWER_MOTOR if re.search(p, base)), None)
    if hit:
        groups["lower_motor"].append(o)
        bevel[o.name] = hit[1]
        continue
    sym = next((bev for p, bev in SYMPATHETIC if re.search(p, base)), None)
    if sym:
        groups["sympathetic"].append(o)
        bevel[o.name] = sym
    elif match_any(LOWER_SENSORY, base):
        groups["lower_sensory"].append(o)
        bevel[o.name] = 0.0010
    elif match_any(ROOTS, base):
        groups["roots"].append(o)
        bevel[o.name] = 0.0009
    elif match_any(THORACIC, base):
        groups["thoracic"].append(o)
        bevel[o.name] = 0.0012
    elif match_any(CRANIAL, base):
        groups["cranial"].append(o)
        bevel[o.name] = 0.0008
    else:  # splot ramienny i nerwy kończyny górnej
        groups["upper"].append(o)
        bevel[o.name] = 0.0010

# ---------------------------------------------------------------- siatki: rdzeń, zwoje, mózg, nadnercza
cord = al.find_meshes(collection=NERV, include=[r"^Spinal dura$"])
ganglia = al.find_meshes(collection=NERV, include=[r"^Spinal ganglion\.", r"^Ganglia of sympathetic trunk\."])
symp_ganglia = [o for o in ganglia if "sympathetic" in o.name]
spinal_ganglia = [o for o in ganglia if o not in symp_ganglia]
adrenal = al.find_meshes(collection="8: Visceral systems", include=[r"^Suprarenal gland\.(l|r)$"])

BRAIN_MATS = {"Frontal lobe", "Parietal lobe", "Occipital lobe", "Temporal lobe", "Limbic lobe", "Insula",
              "Cerebellum", "Brain", "Interlobar sulci"}
brain_all = []
for o in al.find_meshes(collection=NERV):
    mn, mx = al.world_bbox([o])
    if mn.z < 1.5:
        continue
    mats = {m.name for m in o.data.materials if m}
    if mats & BRAIN_MATS:
        brain_all.append(o)
motor_cortex = [o for o in brain_all if re.match(r"^(Precentral gyrus|Paracentral gyrus and sulcus\*)\.", o.name)]
cerebellum = [o for o in brain_all if o not in motor_cortex and any(m and m.name == "Cerebellum" for m in o.data.materials)]
brainstem = [o for o in brain_all if re.match(r"^(Medulla oblongata|Pons|Midbrain|Base of peduncle)", o.name)]
brain_rest = [o for o in brain_all if o not in motor_cortex and o not in cerebellum and o not in brainstem]

# ---------------------------------------------------------------- kontekst: kości (część jako „duchy”)
bones = al.find_meshes(collection="1: Skeletal system")
AXIAL = re.compile(r"^(Vertebra [CTL]\d+|Atlas \(C1\)|Axis \(C2\)|Sacrum|Coccyx|Frontal bone|Parietal bone|Occipital bone|"
                   r"Temporal bone|Sphenoid bone|Ethmoid bone|Intervertebral)", re.I)
ghost_bones = [o for o in bones if AXIAL.match(o.name)]
solid_bones = [o for o in bones if o not in ghost_bones]

# Mięśnie: tylko do kamery (jak na planszy mięśniowej) i do budowy sylwetki.
muscles_all = al.find_meshes(collection="4: Muscular system", exclude=[r"^Rectus sheath", r"^Linea alba"],
                             exclude_materials=al.MUSCLE_COVER_MATERIALS)
viscera = al.find_meshes(collection="8: Visceral systems", exclude=[r"[Kk]idney", r"[Rr]enal"])

print("ATLAS_MATCH", {k: len(v) for k, v in groups.items()})
for k in ("lower_motor", "sympathetic"):
    print("ATLAS_MATCH", k, sorted({strip_side(o.name) for o in groups[k]}))
print("ATLAS_MATCH cord", [o.name for o in cord], "ganglia", [o.name for o in ganglia], "adrenal", [o.name for o in adrenal])
print("ATLAS_MATCH brain", len(brain_all), "motor", [o.name for o in motor_cortex], "cerebellum", len(cerebellum),
      "stem", [o.name for o in brainstem])
print("ATLAS_MATCH bones", len(bones), "ghost", len(ghost_bones), "muscles", len(muscles_all), "viscera", len(viscera))
if DRY:
    raise SystemExit(0)


# ---------------------------------------------------------------- sylwetka (powłoka wokselowa)
def combined_mesh(objs, name):
    vs, lts, lvs, base = [], [], [], 0
    for o in objs:
        me = o.data
        n = len(me.vertices)
        if n == 0 or len(me.polygons) == 0:
            continue
        co = np.empty(n * 3, np.float32)
        me.vertices.foreach_get("co", co)
        M = np.array(o.matrix_world, dtype=np.float64)
        co = co.reshape(-1, 3) @ M[:3, :3].T + M[:3, 3]
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


def keep_outer_shells(me, min_verts=400):
    """Usuwa wewnętrzne powłoki (jamy ciała) i drobne okruchy: zostają składowe, których obrys
    nie leży w całości wewnątrz obrysu większej składowej."""
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
        inside = any(np.all(mn >= kmn - 1e-4) and np.all(mx <= kmx + 1e-4) for _, _, kmn, kmx in keep)
        if not inside:
            keep.append((cnt, c, mn, mx))
    keep_ids = {k[1] for k in keep}
    drop = ~np.isin(lab, list(keep_ids))
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[bm.verts[i] for i in np.nonzero(drop)[0]], context='VERTS')
    bm.to_mesh(me)
    bm.free()
    print("ATLAS_HULL components kept", len(keep), "of", len(comps))
    return me


def build_silhouette(scene, col, sources, voxel=0.011, offset=0.005):
    src_me = combined_mesh(sources, "ATL_hull_src")
    tmp = bpy.data.objects.new("ATL_hull_tmp", src_me)
    col.objects.link(tmp)
    r = tmp.modifiers.new("remesh", 'REMESH')
    r.mode = 'VOXEL'
    r.voxel_size = voxel
    r.adaptivity = 0.0
    s = tmp.modifiers.new("smooth", 'SMOOTH')
    s.factor = 0.8
    s.iterations = 10
    d = tmp.modifiers.new("skin_thickness", 'DISPLACE')
    d.mid_level = 0.0
    d.strength = offset  # bez tekstury: przesunięcie = strength wzdłuż normalnej
    dg = scene.view_layers[0].depsgraph
    dg.update()
    me = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
    me.name = "ATL_hull"
    col.objects.unlink(tmp)
    bpy.data.objects.remove(tmp)
    bpy.data.meshes.remove(src_me)
    keep_outer_shells(me)
    for p in me.polygons:
        p.use_smooth = True
    hull = bpy.data.objects.new("ATL_silhouette", me)
    print("ATLAS_HULL polys", len(me.polygons))
    return hull


# ---------------------------------------------------------------- plansza
class NervePlate(al.Plate):
    """Rozszerzenie tylko na potrzeby tej planszy: rola context_bone_ghost (półprzezroczysta kość)."""

    def _apply_state(self, state):
        for o, role, system, levels in self.items:
            if role == "context_bone_ghost":
                al.assign(o, ghost_material())
        rest = [i for i in self.items if i[1] != "context_bone_ghost"]
        saved = self.items
        self.items = rest
        try:
            super()._apply_state(state)
        finally:
            self.items = saved
        skin = bpy.data.materials.get("ATL_skin")
        if skin:
            skin.use_backface_culling = True


def ghost_material():
    m = al.make_material("ATL_bone_ghost", al.hex_to_linear(al.CONTEXT_COLORS["bone"]), roughness=0.75, alpha=0.22)
    m.use_backface_culling = True
    return m


plate = NervePlate("nerwowy")

# Pogrubienie nerwów (tylko w pamięci, Startup.blend nie jest zapisywany).
# Grubość = bevel_depth × promień punktu, a promienie punktów w Z-Anatomy są nierówne (od 1 do 12
# w jednej krzywej). Wyrównujemy je względem mediany (zakres 0,7-1,3), żeby docelowa grubość była
# grubością typowego odcinka, a lokalne zgrubienia nie robiły „plam”.
def normalize_radii(curve):
    pts = [p for sp in curve.splines for p in (sp.bezier_points if sp.type == 'BEZIER' else sp.points)]
    if not pts:
        return 1.0
    med = float(np.median([p.radius for p in pts])) or 1.0
    for p in pts:
        p.radius = min(1.3, max(0.7, p.radius / med))
    return med


for o in nerve_curves:
    med = normalize_radii(o.data)
    o.data.bevel_depth = bevel[o.name]
    o.data.bevel_resolution = max(o.data.bevel_resolution, 3)
    if strip_side(o.name) in ("Sciatic nerve", "Femoral nerve", "Tibial nerve", "Cauda equina"):
        print("ATLAS_RADIUS", o.name, "median", round(med, 3), "bevel", round(o.data.bevel_depth, 5))

hull = build_silhouette(plate.scene, plate.col, muscles_all + bones + viscera)
plate.col.objects.link(hull)
hull.visible_shadow = False

plate.add(solid_bones, role="context_bone")
plate.add(ghost_bones, role="context_bone_ghost")
for o in ghost_bones:
    o.visible_shadow = False
plate.add([hull], role="context_skin")
# Mózg: reszta kory jako „nieaktywna” tkanka układu, móżdżek i pień pomocniczo, kora ruchowa w pełni.
plate.add(brain_rest, role="active", system="nerve", sprint_level=0.35)
plate.add(cerebellum + brainstem, role="active", system="nerve", sprint_level=0.6)
plate.add(motor_cortex, role="active", system="nerve", sprint_level=1.0)
plate.add(cord + groups["roots"] + spinal_ganglia, role="active", system="nerve", sprint_level=0.9)
plate.add(groups["lower_motor"], role="active", system="nerve", sprint_level=1.0)
plate.add(groups["lower_sensory"], role="active", system="nerve", sprint_level=0.45)
plate.add(groups["sympathetic"] + symp_ganglia + adrenal, role="active", system="nerve", sprint_level=1.0)
plate.add(groups["thoracic"], role="active", system="nerve", sprint_level=0.7)
plate.add(groups["upper"], role="active", system="nerve", sprint_level=0.45)
plate.add(groups["cranial"], role="active", system="nerve", sprint_level=0.35)

# Kamera jak na planszy mięśniowej: obrys kości + mięśni, margines 1,06.
mn, mx = al.world_bbox(bones + muscles_all)
plate.center = (mn + mx) / 2
aspect = plate.res[0] / plate.res[1]
plate.ortho_scale = max(mx.z - mn.z, (mx.x - mn.x) / aspect) * 1.06
print("ATLAS_BBOX", tuple(round(v, 3) for v in mn), tuple(round(v, 3) for v in mx), "ortho", round(plate.ortho_scale, 3))

# Kotwice podpisów: prawa strona ciała (.r), jak na planszy wzorcowej.
# Nerwy są cienkie i kręte, więc środek obrysu często wypada obok nerwu. Dla krzywych stawiamy pusty
# obiekt pomocniczy dokładnie na nerwie, na zadanej wysokości z (m), i to on jest kotwicą.
def spline_world_points(o):
    out = []
    for sp in o.data.splines:
        pts = [p.co for p in sp.bezier_points] if sp.type == 'BEZIER' else [p.co for p in sp.points]
        out.append([o.matrix_world @ Vector(tuple(p)[:3]) for p in pts])
    return out


def point_on_curve(obj_name, z):
    """Punkt na krzywej (interpolacja między punktami splajnu) najbliższy wysokości z."""
    best = None
    for pts in spline_world_points(bpy.data.objects[obj_name]):
        for a, b in zip(pts, pts[1:]):
            if (a.z - z) * (b.z - z) <= 0 and a.z != b.z:
                t = (z - a.z) / (b.z - a.z)
                return a.lerp(b, t)
            for q in (a, b):
                d = abs(q.z - z)
                if best is None or d < best[0]:
                    best = (d, q.copy())
    return best[1]


def curve_anchor(key, obj_name, z):
    from mathutils import Matrix
    e = bpy.data.objects.new(f"ATL_anchor_{key}", None)
    e.matrix_world = Matrix.Translation(point_on_curve(obj_name, z))
    return e.name


A = {
    "motor_cortex": {"objects": ["Precentral gyrus.l"], "views": ["back"], "offset": (0.0, 0.015)},  # lewa półkula: początek strzałki (zgromadzenie, anatom)
    "spinal_cord": {"objects": ["Spinal dura"], "views": ["back"], "offset": (0.0, 0.08)},
    "cauda_equina": {"objects": ["Cauda equina"], "views": ["back"], "offset": (0.012, -0.02)},
    "sciatic": {"objects": [curve_anchor("sciatic", "Sciatic nerve.r", 0.70)], "views": ["back"]},
    "common_fibular": {"objects": [curve_anchor("common_fibular", "Common fibular nerve.r", 0.47)], "views": ["back"]},
    "tibial": {"objects": [curve_anchor("tibial", "Tibial nerve.r", 0.36)], "views": ["back"]},
    "motor_units": {"objects": [curve_anchor("motor_units", "Tibial nerve.r", 0.20)], "views": ["back"]},
    "sympathetic_trunk": {"objects": [curve_anchor("sympathetic_trunk", "Sympathetic trunk.r", 1.19)], "views": ["front"]},
    "adrenal": {"objects": ["Suprarenal gland.r"], "views": ["front"]},
    "lumbar_plexus": {"objects": [curve_anchor("lumbar_plexus", "Femoral nerve.r", 1.04)], "views": ["front"]},
    "femoral": {"objects": [curve_anchor("femoral", "Femoral nerve.r", 0.80)], "views": ["front"]},
    "obturator": {"objects": [curve_anchor("obturator", "Anterior branch of obturator nerve.r", 0.74)], "views": ["front"]},
    "deep_fibular": {"objects": [curve_anchor("deep_fibular", "Deep fibular nerve.r", 0.25)], "views": ["front"]},
    "intercostal": {"objects": ["Intercostal nerves.r"], "views": ["front"], "offset": (-0.04, 0.02)},
}
missing = [k for k, a in A.items() for n in a["objects"] if n not in bpy.data.objects]
if missing:
    print("ATLAS_MISSING_ANCHORS", missing)
    A = {k: a for k, a in A.items() if k not in missing}

VIEWS = tuple(os.environ.get("NERW_VIEWS", "front,back").split(","))  # np. NERW_VIEWS=back do podglądu
meta = plate.render(views=VIEWS, states=("rest", "sprint"), anchors=A)


# ---------------------------------------------------------------- strzałki impulsu (flows.json)
def curve_points(obj_name, samples=40):
    """Punkty najdłuższego splajnu krzywej w świecie, od góry do dołu."""
    o = bpy.data.objects[obj_name]
    best = None
    for sp in o.data.splines:
        pts = [p.co for p in sp.bezier_points] if sp.type == 'BEZIER' else [Vector(p.co[:3]) for p in sp.points]
        pts = [o.matrix_world @ Vector(p[:3]) for p in pts]
        ln = sum((pts[i + 1] - pts[i]).length for i in range(len(pts) - 1))
        if best is None or ln > best[0]:
            best = (ln, pts)
    pts = best[1]
    if pts[0].z < pts[-1].z:
        pts = pts[::-1]
    step = max(1, len(pts) // samples)
    return pts[::step] + ([pts[-1]] if (len(pts) - 1) % step else [])


def cord_line(z_top, z_bot, n=6, side=0.0):
    mn, mx = al.world_bbox([bpy.data.objects["Spinal dura"]])
    cx, cy = (mn.x + mx.x) / 2 + side, (mn.y + mx.y) / 2
    return [Vector((cx, cy, z_top + (z_bot - z_top) * i / (n - 1))) for i in range(n)]


def obj_center(name, dz=0.0):
    mn, mx = al.world_bbox([bpy.data.objects[name]])
    c = (mn + mx) / 2
    c.z += dz
    return c


paths = {}
# Widok z tyłu: lewa kora ruchowa -> skrzyżowanie piramid w rdzeniu przedłużonym -> prawa połowa rdzenia
# -> ogon koński -> prawy nerw kulszowy -> nerw piszczelowy -> łydka.
cortex_l = obj_center("Precentral gyrus.l", 0.015)
medulla = obj_center("Medulla oblongata.l") if "Medulla oblongata.l" in bpy.data.objects else Vector((0, 0.02, 1.56))
medulla.x = 0.0
dura_mn, dura_mx = al.world_bbox([bpy.data.objects["Spinal dura"]])
back_path = [cortex_l, medulla] + cord_line(dura_mx.z - 0.02, dura_mn.z + 0.01, side=-0.004)
sci = curve_points("Sciatic nerve.r")
tib = curve_points("Tibial nerve.r")
back_path += sci + [p for p in tib if p.z > 0.25]
paths["back_motor"] = ("back", back_path, "Rozkaz ruchu: kora → rdzeń → nerw kulszowy → łydka")
# Widok z przodu: rdzeń lędźwiowy -> nerw udowy -> mięsień czworogłowy.
fem = curve_points("Femoral nerve.r")
# Rdzeń kończy się na wys. L1-L2, a nerw udowy zaczyna się niżej (korzenie L2-L4), więc linia schodzi
# z dolnego końca rdzenia prosto do początku nerwu.
# Zgromadzenie (anatom): z rdzenia L2–L4 przez splot lędźwiowy (w m. lędźwiowym), z dala od nadnercza - linia
# wychodzi poziomo z kanału kręgowego na wysokości początku nerwu udowego, bez odcinka w górę ku nadnerczu.
paths["front_femoral"] = ("front", cord_line(fem[0].z, fem[0].z, n=2) + fem,
                          "Rozkaz ruchu: rdzeń (L2–L4) → splot lędźwiowy → nerw udowy → mięsień czworogłowy")
# Współczulny: pień współczulny -> nerw trzewny -> nadnercze (rdzeń nadnerczy wydziela adrenalinę).
st = curve_points("Sympathetic trunk.r")
# Zgromadzenie (anatom): włókna przedzwojowe do rdzenia nadnerczy wychodzą z odcinka piersiowego (ok. Th5–Th12),
# więc strzałka zaczyna się ok. 22 cm nad nadnerczem (Th5), nie w odcinku szyjnym.
adr_z = obj_center("Suprarenal gland.r").z
paths["front_sympathetic"] = ("front", [p for p in st if adr_z < p.z < adr_z + 0.22] + [obj_center("Suprarenal gland.r")],
                              "Współczulny: odcinek piersiowy rdzenia → pień (bez przełączenia) → nerwy trzewne → rdzeń nadnerczy")

W, H = plate.res
flows = []
for key, (view, pts, label) in paths.items():
    if view not in VIEWS:
        continue
    cam = plate._camera(view)
    px = []
    for p in pts:
        u, v = plate._project(cam, p)
        q = [round(u * W, 1), round(v * H, 1)]
        if not px or abs(q[0] - px[-1][0]) + abs(q[1] - px[-1][1]) > 6:
            px.append(q)
    flows.append({"key": key, "view": view, "kind": "nerve", "labelPl": label, "points": px})
with open(os.path.join(plate.out_dir, "flows.json"), "w", encoding="utf-8") as f:
    json.dump(flows, f, indent=1, ensure_ascii=False)
print("ATLAS_FLOWS", [(fl["key"], len(fl["points"])) for fl in flows])
# Faza 2: te same tory w metrach (flows3d.json); AtlasPlate rzutuje je kamerą widoku z anchors.json.
plate.write_flows3d([{"id": key, "kind": "autonomic" if key == "front_sympathetic" else "nerve", "labelPl": label,
                      "views": [view], "points": pts}
                     for key, (view, pts, label) in paths.items() if view in VIEWS])
