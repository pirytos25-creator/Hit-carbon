"""
Plansza MÓZG (agent 3, faza 1). Zasady: docs/ATLAS_STYLE_BIBLE.md
  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/plate_mozg.py
Widoki (oba z kamery po stronie +X, przód głowy po lewej stronie obrazu):
  side   - lewa półkula z boku (prawdziwe zakręty Z-Anatomy)
  detail - przekrój pośrodkowy: przyśrodkowa powierzchnia prawej półkuli, obiekty leżące w linii pośrodkowej
           (ciało modzelowate, robak móżdżku, podwzgórze...) są przecinane w pamięci na płaszczyźnie x = 0.
           Jądra podstawy leżą bocznie od tej płaszczyzny, więc nakładamy je jako półprzezroczysty "rzut" z obrysem.
Zmienne: ATLAS_DRY=1 (tylko lista dopasowań), ATLAS_QUICK=1, ATLAS_ANCHORS_ONLY=1 (jak w atlas_lib).
Startup.blend NIE jest zapisywany; cięcia siatek dzieją się tylko w pamięci.
"""
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402
import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

NERV = "7: Nervous system & Sense organs"
Z_MIN_BRAIN = 1.535  # wszystko poniżej to rdzeń kręgowy / zabłąkane wierzchołki

# Elementy kolekcji nerwowej, które nie są mózgowiem (narządy zmysłów, rdzeń, opony, płyn mózgowo-rdzeniowy).
NOT_BRAIN = [
    r"eyeball", r"lacrimal", r"Lacrimal", r"Cornea", r"^Iris", r"^Lens", r"Retina", r"Sclera", r"Cochlea",
    r"^Vestibule", r"Tympanic", r"Auditory tube", r"Nasolacrimal", r"Vitreous", r"Zonular", r"Cochlear nerve",
    r"tract", r"fasciculus", r"horn of spinal", r"Spinal", r"spinal", r"ganglion", r"Ganglia",
    r"^Intermedio", r"Lateral intermediate", r"Nucleus proprius", r"Central canal", r"White matter of spinal",
    r"Falx", r"Tentorium", r"ventricle", r"Aqueduct", r"Choroid plexus", r"Posterolateral",
]

# Poziom pracy w sprincie (1.0 = pełny kolor i emisja). Wzorce dopasowujemy do nazwy bez sufiksu .l/.r.
SPRINT = [
    # kora ruchowa: zakręt przedśrodkowy + płacik okołośrodkowy (pole nóg)
    (r"^Precentral gyrus$", 1.0),
    (r"^Paracentral gyrus", 1.0),
    # móżdżek: półkule i robak
    (r"quadrangular lobule|semilunar lobule|^Biventral lobule|^Gracile lobule|^Flocculus|^Culmen|^Declive|^Folium|^Tuber of vermis|^Pyramis|^Uvula|^Nodule|^Lingula|"
     r"^Central lobule|^Tonsil|^Wing of central|^Peduncle of flocculus|^Superior cerebellar peduncle", 1.0),
    # jądra podstawy
    (r"^Caudate nucleus|^Putamen|^Globus pallidus|^Lentiform nucleus", 1.0),
    # pień mózgu: ośrodki oddechowe i krążeniowe (rdzeń przedłużony, most)
    (r"^Medulla oblongata|^Pons|^Olive|^Pyramid of medulla|^Nucleus ambiguus|^Posterior nucleus of vagus", 1.0),
    (r"^Midbrain|^Base of peduncle|^Red nucleus|colliculus$", 0.6),
    # podwzgórze (z ciałami suteczkowatymi)
    (r"^Hypothalamus|^Mamillary body", 1.0),
    # czucie z pracujących mięśni i stawów
    (r"^Postcentral gyrus", 0.6),
    (r"^Thalamus", 0.6),
]
GHOST_RE = r"^(Caudate nucleus|Putamen|Globus pallidus)\.r$"  # jądra podstawy rzutowane na przekrój


def base_name(n):
    return n[:-2] if n.endswith((".l", ".r")) else n


def side_of(n):
    return n[-1] if n.endswith((".l", ".r")) else "m"  # m = linia pośrodkowa


def sprint_level(n):
    b = base_name(n).strip()
    for pat, lvl in SPRINT:
        if re.search(pat, b):
            return lvl
    return None


# ---------------------------------------------------------------- wybór obiektów
brain = [o for o in al.find_meshes(collection=NERV, exclude=NOT_BRAIN) if al.world_bbox([o])[1].z > Z_MIN_BRAIN]


def clip_below(obj, zmin):
    """Usuwa wierzchołki poniżej zmin (Z-Anatomy: podwzgórze ma zabłąkane wierzchołki aż w jamie brzusznej)."""
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    mw = obj.matrix_world
    bad = [v for v in bm.verts if (mw @ v.co).z < zmin]
    if bad:
        bmesh.ops.delete(bm, geom=bad, context='VERTS')
        # nowa siatka zamiast nadpisania: inaczej obiekt zachowuje stary (zbyt duży) bound_box
        me = bpy.data.meshes.new(obj.data.name + "_clip")
        bm.to_mesh(me)
        for m in obj.data.materials:
            me.materials.append(m)
        obj.data = me
    bm.free()
    return len(bad)


for o in brain:
    if al.world_bbox([o])[0].z < Z_MIN_BRAIN:
        print("ATLAS_CLIP", o.name, clip_below(o, Z_MIN_BRAIN))


def vert_bbox(objs):
    """bbox z wierzchołków (bound_box obiektów Z-Anatomy bywa nieaktualny po edycji siatki)."""
    import numpy as np
    mn = np.full(3, 1e9)
    mx = np.full(3, -1e9)
    for o in objs:
        n = len(o.data.vertices)
        if not n:
            continue
        co = np.empty(n * 3)
        o.data.vertices.foreach_get("co", co)
        co = co.reshape(-1, 3)
        m = np.array(o.matrix_world)
        w = co @ m[:3, :3].T + m[:3, 3]
        mn = np.minimum(mn, w.min(0))
        mx = np.maximum(mx, w.max(0))
    return Vector(mn.tolist()), Vector(mx.tolist())


# Lokalna podmiana: Plate.render liczy obrys kadru przez al.world_bbox, a ten używa bound_box.
al.world_bbox = vert_bbox
low = sorted((vert_bbox([o])[0].z, o.name) for o in brain)[:3]
print("ATLAS_LOWEST", [(round(z, 3), n) for z, n in low])


def cut_midline(obj):
    """Kopia obiektu z linii pośrodkowej przycięta do x <= 0 (prawa połowa ciała), z zamkniętym przekrojem."""
    cp = obj.copy()
    cp.data = obj.data.copy()
    cp.name = obj.name + " (przekrój)"
    bm = bmesh.new()
    bm.from_mesh(cp.data)
    # siatka w układzie obiektu: płaszczyzna x_świat = 0 przeliczona do układu lokalnego
    inv = cp.matrix_world.inverted()
    co = inv @ Vector((0, 0, 0))
    no = (inv.to_3x3().transposed().inverted() @ Vector((1, 0, 0))).normalized()
    res = bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], dist=1e-6,
                                 plane_co=co, plane_no=no, clear_outer=True)
    cut_edges = [e for e in res["geom_cut"] if isinstance(e, bmesh.types.BMEdge)]
    if cut_edges:
        bmesh.ops.holes_fill(bm, edges=cut_edges, sides=0)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(cp.data)
    cp.data.update()
    bm.free()
    return cp


def cap_medial(obj, tol=0.0015):
    """Domyka otwarte brzegi połówek (.r) leżące na płaszczyźnie pośrodkowej, żeby przekrój nie miał dziur."""
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    mw = obj.matrix_world
    edges = [e for e in bm.edges if e.is_boundary and all(abs((mw @ v.co).x) < tol for v in e.verts)]
    if edges:
        bmesh.ops.holes_fill(bm, edges=edges, sides=0)
        bm.to_mesh(obj.data)
        obj.data.update()
    bm.free()
    return len(edges)


left = [o for o in brain if side_of(o.name) == "l"]
right = [o for o in brain if side_of(o.name) == "r"]
mid = [o for o in brain if side_of(o.name) == "m"]

print("ATLAS_MATCH brain", len(brain), "l", len(left), "r", len(right), "mid", len(mid))
print("ATLAS_MATCH active", sorted({base_name(o.name) for o in brain if sprint_level(o.name)}))
print("ATLAS_MATCH mid", sorted(o.name for o in mid))

if os.environ.get("ATLAS_DRY"):
    for c in bpy.data.collections:
        if c.name[:2].strip().rstrip(":").isdigit():
            print("ATLAS_COL", c.name)
    for o in bpy.data.objects:
        if o.type == 'MESH' and re.search(r"cerebral artery|basilar|vertebral artery|internal carotid|skin", o.name, re.I):
            mn, mx = al.world_bbox([o])
            print("ATLAS_CAND", o.name, [c.name for c in o.users_collection], tuple(round(v, 3) for v in mn), tuple(round(v, 3) for v in mx))
    raise SystemExit(0)

for o in right:
    n = cap_medial(o)
    if n:
        print("ATLAS_CAP", o.name, n)
mid_cut = [cut_midline(o) for o in mid]

SIDE_OBJS = set(left) | set(mid)
DETAIL_OBJS = set(right) | set(mid_cut)
GHOST = [o for o in right if re.search(GHOST_RE, o.name)]


# ---------------------------------------------------------------- plansza z własną kamerą i światłem dla widoków bocznych
class BrainPlate(al.Plate):
    """Lokalne rozszerzenie: widoki 'side' i 'detail' (oba z +X), osobne zestawy obiektów na widok,
    kadr dla obrazu poziomego i nakładka jąder podstawy na przekroju."""

    def __init__(self, *a, **k):
        super().__init__(*a, **k)
        self.view_objs = {}

    def _visible(self, view):
        keep = self.view_objs.get(view)
        for o, *_ in self.items:
            o.hide_render = keep is not None and o not in keep

    def _camera(self, view):
        self._visible(view)
        real = "side" if view in ("side", "detail") else view
        return super()._camera(real)

    def _lights(self, view):
        # Integracja 1b: światło biblioteki (LIGHT_SCALE/KEY_SCALE z atlas_lib), liczone względem kamery z boku (+X).
        # Dawniej lokalny zestaw lamp × 0,6 (fiolet wychodził jaśniejszy niż w tabeli kolorów).
        return super()._lights("side" if view in ("side", "detail") else view)

    def camera_meta(self, view):
        # Przekrój ('detail') ma tę samą kamerę co widok z boku; bez tego anchors.json dostawał kierunek 'front'.
        return super().camera_meta("side" if view in ("side", "detail") else view)

    def anchor_point(self, obj_names, view):
        """Kotwica na widocznej powierzchni: wierzchołek najbliższy medianie Y/Z wierzchołków najbliższych kamerze (+X).
        Nazwa może mieć filtr wysokości, np. "Medulla oblongata.l@z<1.56" (tylko widoczny dolny odcinek)."""
        if view not in ("side", "detail"):
            return super().anchor_point(obj_names, view)
        pts = []
        for n in obj_names:
            name, _, zf = n.partition("@z<")
            o = bpy.data.objects[name]
            mw = o.matrix_world
            ps = [mw @ v.co for v in o.data.vertices]
            pts += [p for p in ps if p.z < float(zf)] if zf else ps
        xs = sorted(p.x for p in pts)
        x_cut = xs[int(len(xs) * 0.8)]
        near = [p for p in pts if p.x >= x_cut]
        ys = sorted(p.y for p in near)
        zs = sorted(p.z for p in near)
        my, mz = ys[len(ys) // 2], zs[len(zs) // 2]
        # mediana kształtu łukowatego (np. ciało modzelowate) wypada w pustce: bierzemy najbliższy prawdziwy wierzchołek
        best = min(near, key=lambda p: (p.y - my) ** 2 + (p.z - mz) ** 2)
        return Vector((xs[-1], best.y, best.z))

    def frame_side(self, margin=1.03):
        mn, mx = al.world_bbox([i[0] for i in self.items])
        self.center = (mn + mx) / 2
        w, h = mx.y - mn.y, mx.z - mn.z
        aspect = self.res[0] / self.res[1]
        # Blender: ortho_scale obejmuje dłuższy bok obrazu
        self.ortho_scale = (max(w, h * aspect) if aspect >= 1 else max(h, w / aspect)) * margin
        return mn, mx

    def ghost_overlay(self, view="detail", states=("rest", "sprint"), opacity=0.3):
        """Rzut jąder podstawy na przekrój: osobny render samych jąder, nałożony w ImageMagick z obrysem."""
        if not GHOST:
            return
        self._camera(view)
        self._lights(view)
        for o, *_ in self.items:
            o.hide_render = o not in GHOST
        light = al.SYSTEM_COLORS["brain"]
        for state in states:
            img = os.path.join(self.out_dir, f"{view}_{state}.webp")
            if not os.path.exists(img):
                continue
            self._apply_state(state)
            ghost = os.path.join(self.out_dir, f"_ghost_{state}.png")
            self.scene.render.filepath = ghost
            bpy.ops.render.render(write_still=True, scene=self.scene.name)
            cmd = [
                "magick", img,
                "(", ghost, "-channel", "A", "-evaluate", "multiply", str(opacity), "+channel", ")",
                "-compose", "over", "-composite",
                "(", ghost, "-alpha", "extract", "-threshold", "50%", "-morphology", "EdgeOut", "Diamond:2",
                "-fill", "#C3AEF5" if state == "sprint" else "#B8B0C8", "-opaque", "white",
                "-transparent", "black", ")",
                "-compose", "over", "-composite",
                "-quality", "88", img,
            ]
            subprocess.run(cmd, check=True)
            os.remove(ghost)
            print("ATLAS_GHOST", view, state, light)
        self._visible(view)


plate = BrainPlate("mozg", resolution=(1200, 1100))
for o in mid_cut:
    plate.col.objects.link(o)
everything = left + right + mid + mid_cut
for o in everything:
    lvl = sprint_level(o.name)
    if lvl is None:
        plate.add([o], role="context_bone")
    else:
        plate.add([o], role="active", system="brain", sprint_level=lvl)
plate.view_objs = {"side": SIDE_OBJS, "detail": DETAIL_OBJS}
mn, mx = plate.frame_side()
print("ATLAS_BBOX", tuple(round(v, 3) for v in mn), tuple(round(v, 3) for v in mx), "ortho", round(plate.ortho_scale, 3))

A = {
    # widok z boku (lewa półkula)
    "motor_cortex": {"objects": ["Precentral gyrus.l"], "views": ["side"]},
    "sensory_cortex": {"objects": ["Postcentral gyrus.l"], "views": ["side"]},
    "prefrontal": {"objects": ["Middle frontal gyrus.l"], "views": ["side"]},
    "visual_cortex": {"objects": ["Lateral occipital gyrus (Middle occipital gyrus*).l"], "views": ["side"]},
    "cerebellum": {"objects": ["Superior semilunar lobule.l", "Inferior semilunar lobule.l"], "views": ["side"]},
    # most i górna część rdzenia przedłużonego są z boku zasłonięte (płat skroniowy, móżdżek): kotwica na widocznym dolnym odcinku
    "brainstem": {"objects": ["Medulla oblongata.l@z<1.572"], "views": ["side"]},
    # przekrój pośrodkowy (prawa półkula od strony przyśrodkowej)
    "paracentral": {"objects": ["Paracentral gyrus and sulcus*.r"], "views": ["detail"]},
    "corpus_callosum": {"objects": ["Corpus callosum (przekrój)"], "views": ["detail"]},
    "thalamus": {"objects": ["Thalamus.r"], "views": ["detail"]},
    "basal_ganglia": {"objects": ["Putamen.r", "Globus pallidus.r"], "views": ["detail"]},
    "hypothalamus": {"objects": ["Hypothalamus (przekrój)"], "views": ["detail"]},
    "midbrain": {"objects": ["Midbrain.r"], "views": ["detail"]},
    "pons": {"objects": ["Pons.r"], "views": ["detail"]},
    "medulla": {"objects": ["Medulla oblongata.r"], "views": ["detail"]},
    "vermis": {"objects": ["Declive (przekrój)", "Folium of vermis (przekrój)", "Tuber of vermis (przekrój)"], "views": ["detail"]},
}
missing = [k for k, a in A.items() for n in a["objects"] if n.partition("@")[0] not in bpy.data.objects]
if missing:
    print("ATLAS_MISSING_ANCHORS", missing)
    A = {k: a for k, a in A.items() if k not in missing}

meta = plate.render(views=("side", "detail"), states=("rest", "sprint"), anchors=A)
if not os.environ.get("ATLAS_ANCHORS_ONLY"):
    plate.ghost_overlay()
