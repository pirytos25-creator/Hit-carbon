"""
Plansza SKÓRA (UKŁAD POWŁOKOWY), faza 1b, agent 7. Zasady: docs/ATLAS_STYLE_BIBLE.md, docs/ATLAS_AGENT_BRIEFS_1B.md §4.
  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/plate_powlokowy.py

Plansza w skali SESJI (model §4 pkt 10): skóra zmienia się w minutach, nie w sekundach.
  rest   = przed treningiem;
  sprint = koniec treningu (ostatnie interwały): naczynia skóry rozszerzone, gruczoły potowe pracują.
  Na samym starcie wysiłku naczynia skóry się ZWĘŻAJĄ; to mówi tekst planszy, nie render (rendery 2D mają 2 stany, model §4 pkt 4).

Widoki:
  front   całe ciało: skóra = sylwetka al.build_silhouette() (Z-Anatomy, remesh 11 mm, +5 mm) jako warstwa aktywna,
          półprzezroczysta; pod nią mięśnie (kontekst) i szkielet; żyły powierzchowne z krzywych Z-Anatomy (CC BY-SA 4.0).
          W sprincie jasność skóry w 3 stopniach wg regionalnego tempa pocenia (Smith i Havenith 2011: najwięcej czoło i plecy,
          najmniej dłonie i stopy). To ilustracja w stopniach, nie liczba.
  detail  przekrój skóry: naskórek, skóra właściwa, tkanka podskórna, gruczoł potowy ekrynowy, splot naczyń skóry,
          mieszek włosowy z mięśniem przywłosowym i gruczołem łojowym. Geometria proceduralna (SCHEMAT, nie model anatomiczny),
          grubości warstw nie są w skali.
HuBMAP VH_M_Skin (CC BY 4.0) tylko w renderze kontrolnym dopasowania (inna poza i wzrost), nie na planszy.

Zmienne: ATLAS_DRY=1 (tylko pomiary), ATLAS_FIT=<folder> (render kontrolny: szkielet + sylwetka + VH_M_Skin, przód i bok),
ATLAS_PREVIEW=<folder> (podgląd obu widoków i stanów w 50% rozdzielczości do folderu poza repo),
ATLAS_QUICK=1, ATLAS_ANCHORS_ONLY=1 (jak w atlas_lib).
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
from mathutils.bvhtree import BVHTree  # noqa: E402
from mathutils.kdtree import KDTree  # noqa: E402

DRY = bool(os.environ.get("ATLAS_DRY"))
FIT_DIR = os.environ.get("ATLAS_FIT")
PREVIEW_DIR = os.environ.get("ATLAS_PREVIEW")
CV = "5: Cardiovascular system"


def r3(v):
    return tuple(round(float(x), 3) for x in v)


# ============================================================ FRONT: źródła
all_bones = al.find_meshes(collection="1: Skeletal system")
muscles = al.find_meshes(collection="4: Muscular system", exclude=[r"^Rectus sheath", r"^Linea alba"],
                         exclude_materials=al.MUSCLE_COVER_MATERIALS)
hull = al.build_silhouette()

bpy.context.scene.collection.objects.link(hull)  # tymczasowo (pomiary); Plate.add podepnie do sceny planszy
bpy.context.view_layer.update()

# Żyły powierzchowne (podskórne) - krzywe Z-Anatomy. Pominięte: ż. szyjna przednia (w modelu leży ok. 2,6 cm pod
# powierzchnią, pod mięśniami), tętnice skroniowe i nabrzuszne powierzchowne (drobne, w ujęciu całego ciała mylą się z żyłami).
SUPERFICIAL = {
    "Great saphenous vein": "leg", "Small saphenous vein": "leg", "Dorsal venous arch of foot": "leg",
    "Cephalic vein": "arm", "Basilic vein": "arm", "Median cubital vein": "arm", "Median antebrachial vein": "arm",
    "Dorsal venous network of hand": "arm", "External jugular vein": "neck",
    "Superficial epigastric vein": "trunk",
}
sup_veins = al.find_curves(collection=CV, include=[r"^(" + "|".join(re.escape(k) for k in SUPERFICIAL) + r")\.(l|r)$"])
print("PWL_VEINS", len(sup_veins), sorted(o.name for o in sup_veins))

# BVH sylwetki (świat) do pomiarów głębokości i rzutów
_HV = [hull.matrix_world @ v.co for v in hull.data.vertices]
_HF = [tuple(p.vertices) for p in hull.data.polygons]
HULL_BVH = BVHTree.FromPolygons(_HV, _HF)


def signed_depth(p):
    loc, nrm, _, d = HULL_BVH.find_nearest(p)
    return (d if (p - loc).dot(nrm) > 0 else -d), loc, nrm


def bevel_for(o):
    radii = [p.radius for sp in o.data.splines for p in (sp.bezier_points if sp.type == 'BEZIER' else sp.points)]
    med = float(np.median(radii)) if radii else 1.0
    # ×1,6 (krwionośny: ×1,25): żyły leżą pod półprzezroczystą skórą i w ujęciu całego ciała (1 px ≈ 1,1 mm) by znikały
    return max(o.data.bevel_depth * 1.6, 0.0011 / max(med, 0.1))


def sink_under_skin(curves, margin=0.0015):
    """Żyły podskórne mają leżeć POD skórą. Odcinki, które wystają ponad sylwetkę (różnica kształtu sylwetki wokselowej
    i krzywych, do kilku mm), przesuwamy wzdłuż normalnej pod powierzchnię (tylko w pamięci). Zwraca raport w mm."""
    rep = {}
    for o in curves:
        M = o.matrix_world
        Minv3 = M.to_3x3().inverted()
        moved, worst = 0, 0.0
        r = o.data.bevel_depth
        for sp in o.data.splines:
            pts = sp.bezier_points if sp.type == 'BEZIER' else sp.points
            for p in pts:
                co = Vector(tuple(p.co)[:3])
                w = M @ co
                d, loc, nrm = signed_depth(w)
                need = -(margin + r * p.radius)
                if d > need:
                    worst = max(worst, d - need)
                    delta_w = nrm * (need - d)
                    dl = Minv3 @ delta_w
                    if sp.type == 'BEZIER':
                        p.co = co + dl
                        p.handle_left = Vector(p.handle_left) + dl
                        p.handle_right = Vector(p.handle_right) + dl
                    else:
                        p.co = (*(co + dl), p.co[3])
                    moved += 1
        rep[o.name] = (moved, round(worst * 1000, 1))
    return rep


al.thicken_curves(sup_veins, bevel=bevel_for, resolution=3)
sink_rep = sink_under_skin(sup_veins)
print("PWL_SINK (punkty przesunięte, maks. mm)", sink_rep)


def snap_to_skin(curves, frac=0.6, max_depth=0.008):
    """Wersja SPRINT żył powierzchownych: pod koniec treningu żyły skóry są wypełnione i widać je na skórze.
    Punkty leżące płycej niż max_depth ustawiamy tak, że oś żyły jest frac × promień pod powierzchnią
    (żyła lekko odciska się na skórze). Głębsze odcinki (np. ujście do żył głębokich) zostają bez zmian."""
    n = 0
    for o in curves:
        M = o.matrix_world
        Minv3 = M.to_3x3().inverted()
        r = o.data.bevel_depth
        for sp in o.data.splines:
            for p in (sp.bezier_points if sp.type == 'BEZIER' else sp.points):
                co = Vector(tuple(p.co)[:3])
                d, _, nrm = signed_depth(M @ co)
                if d < -max_depth:
                    continue
                dl = Minv3 @ (nrm * (-frac * r * p.radius - d))
                if sp.type == 'BEZIER':
                    p.co = co + dl
                    p.handle_left = Vector(p.handle_left) + dl
                    p.handle_right = Vector(p.handle_right) + dl
                else:
                    p.co = (*(co + dl), p.co[3])
                n += 1
    return n


VEIN_SPRINT_SCALE = 1.5  # wypełnione żyły pod koniec treningu: grubsze (ilustracja, nie pomiar)
sup_veins_sprint = []
for o in sup_veins:
    c = o.copy()
    c.data = o.data.copy()  # .l i .r w Z-Anatomy mogą dzielić dane krzywej
    c.name = "PWL_sprint_" + o.name
    c.data.bevel_depth *= VEIN_SPRINT_SCALE
    sup_veins_sprint.append(c)
print("PWL_SNAP punkty żył (sprint) przy skórze:", snap_to_skin(sup_veins_sprint))


# ---------------------------------------------------------------- regiony skóry (mapa pocenia, 3 stopnie)
def bone_region(o):
    n = o.name.lower()
    mn, mx = al.vert_bbox([o])
    c = (mn + mx) / 2
    if mx.z < 0.15:
        return "foot"
    if re.search(r"humerus", n):
        return "upper_arm"
    if re.search(r"radius|ulna", n):
        return "forearm"
    if c.z < 0.9 and abs(c.x) > 0.19:
        return "hand"
    if re.search(r"femur|patella", n):
        return "thigh"
    if re.search(r"tibia|fibula", n):
        return "leg"
    return "axial"


# Stopnie (Smith i Havenith 2011, 75% VO2max, 25 °C): najwięcej czoło oraz środek i dół pleców; najmniej palce, dłonie
# (i stopy); policzki i podbródek nisko; tułów przyśrodkowo więcej niż bocznie. 1 = wysoki, 0.5 = średni, 0 = niski.
def sweat_level(region, p):
    if region in ("hand", "foot"):
        return 0.0
    if region == "leg":
        return 0.0
    if region in ("upper_arm", "forearm", "thigh"):
        return 0.5
    # osiowe: głowa, szyja, tułów
    if p.z > 1.50:  # głowa
        if p.z > 1.585 and p.y < -0.02:
            return 1.0  # czoło
        if p.z < 1.585 and p.y < -0.02:
            return 0.0  # twarz poniżej czoła (policzki, podbródek)
        return 0.5  # owłosiona skóra głowy, boki
    if p.z > 1.42:
        return 0.5  # szyja
    if p.y > 0.0 and abs(p.x) < 0.11:
        return 1.0  # środek pleców (niewidoczny z przodu, ale spójny z danymi)
    return 0.5


def build_sweat_attribute(obj):
    kd_pts, labels = [], []
    for b in all_bones:
        reg = bone_region(b)
        P = al._world_points(b)
        step = max(1, len(P) // 300)
        for q in P[::step]:
            kd_pts.append(q)
            labels.append(reg)
    kd = KDTree(len(kd_pts))
    for i, q in enumerate(kd_pts):
        kd.insert(Vector(q.tolist()), i)
    kd.balance()
    me = obj.data
    vals = np.zeros(len(me.vertices), np.float32)
    regs = {}
    for v in me.vertices:
        p = obj.matrix_world @ v.co
        _, idx, _ = kd.find(p)
        reg = labels[idx]
        regs[reg] = regs.get(reg, 0) + 1
        vals[v.index] = sweat_level(reg, p)
    # łagodne przejścia między stopniami: kilka iteracji uśredniania po krawędziach
    ev = np.empty(len(me.edges) * 2, np.int32)
    me.edges.foreach_get("vertices", ev)
    a, b = ev[0::2], ev[1::2]
    deg = np.bincount(np.concatenate([a, b]), minlength=len(vals)).astype(np.float32)
    for _ in range(6):
        acc = np.zeros_like(vals)
        np.add.at(acc, a, vals[b])
        np.add.at(acc, b, vals[a])
        vals = 0.5 * vals + 0.5 * acc / np.maximum(deg, 1)
    attr = me.attributes.get("pwl_sweat") or me.attributes.new("pwl_sweat", 'FLOAT', 'POINT')
    attr.data.foreach_set("value", vals)
    print("PWL_SWEAT regiony (wierzchołki)", regs, "średnia", round(float(vals.mean()), 3))
    return vals


sweat_vals = build_sweat_attribute(hull)


def front_point(x, z, obj_bvh=HULL_BVH, inset=0.0):
    """Punkt na przedniej (−Y) powierzchni sylwetki w (x, z): promień od kamery wzdłuż +Y."""
    hit = obj_bvh.ray_cast(Vector((x, -1.0, z)), Vector((0, 1, 0)))
    if hit[0] is None:
        raise RuntimeError(f"brak trafienia w sylwetkę w x={x}, z={z}")
    return hit[0] + Vector((0, inset, 0))


# ---------------------------------------------------------------- pomiary dopasowania (raport K1)
def midline_profile(objs, zs, xhalf=0.03):
    """Najbardziej wysunięty do przodu i do tyłu punkt (y) w pasie |x| < xhalf na wysokościach zs."""
    P = np.vstack([al._world_points(o) for o in objs])
    out = {}
    for z in zs:
        sel = P[(np.abs(P[:, 2] - z) < 0.006) & (np.abs(P[:, 0]) < xhalf)]
        out[z] = (round(float(sel[:, 1].min()), 4), round(float(sel[:, 1].max()), 4)) if len(sel) else None
    return out


depth_rep = {}
for o in sorted(sup_veins, key=lambda o: o.name):
    ds = []
    for s in al.spline_points(o):
        for p in s[:: max(1, len(s) // 30)]:
            ds.append(signed_depth(p)[0])
    ds = np.array(ds) * 1000
    depth_rep[o.name] = (round(float(np.median(ds)), 1), round(float(ds.min()), 1), round(float(ds.max()), 1))
print("PWL_DEPTH (mediana, min, maks. mm; ujemne = pod skórą)", depth_rep)

if DRY or FIT_DIR:
    skin_h = al.import_glb("VH_M_Skin.glb", collection="PWL_hubmap")
    al.align_hubmap(skin_h, "male")
    zs = [1.60, 1.45, 1.30, 1.15, 1.00, 0.85]
    ph = midline_profile([hull], zs)
    pv = midline_profile(skin_h, zs)
    print("PWL_PROFILE z: sylwetka (y przód, y tył) | VH_M_Skin | różnica przód/tył cm")
    for z in zs:
        if ph[z] and pv[z]:
            print("PWL_PROFILE", z, ph[z], pv[z], round((pv[z][0] - ph[z][0]) * 100, 1), round((pv[z][1] - ph[z][1]) * 100, 1))
    hmn, hmx = al.vert_bbox([hull])
    smn, smx = al.vert_bbox(skin_h)
    print("PWL_BBOX sylwetka", r3(hmn), r3(hmx), "| VH_M_Skin", r3(smn), r3(smx))

if DRY:
    raise SystemExit(0)

# ============================================================ materiały lokalne
SKIN = al.hex_to_linear(al.SYSTEM_COLORS["skin"])
BONE = al.hex_to_linear(al.CONTEXT_COLORS["bone"])
MUSC = al.hex_to_linear(al.CONTEXT_COLORS["muscle"])
SKIN_ALPHA = {"rest": 0.6, "sprint": 0.6}
SPRINT_ALPHA_HIGH = 0.93  # sprint: krycie rośnie ze stopniem (niski 0,6 jak spoczynek, wysoki 0,93)
MUSCLE_ALPHA = float(os.environ.get("PWL_MUSCLE_A", "0.3"))  # 0 = bez mięśni
LEVEL_LOW, LEVEL_HIGH = 0.4, 1.0  # stopnie w sprincie: niski 0,4, średni 0,7, wysoki 1,0 (spoczynek: 0,35)
# Emisja wg wspólnej reguły (palette.json → emission, al.emission_for): świeci tylko stopień ≥ minLevel (0,6),
# od min (0,15) do max. Maksimum własne 0,25 zamiast 0,35 z palety: kolor #FA947A ma R = 250, więc przy 0,35 czoło
# obcinało kanał R (pomiar K3: 2,2% pikseli R = 255 w najjaśniejszej ćwiartce ciała; przy 0,25: 1,0%).
SKIN_EMISSION_MAX = float(os.environ.get("PWL_SKIN_EMAX", "0.25"))


def skin_layer_material(state):
    """Sylwetka skóry. Spoczynek: jednolicie 35% koloru skóry. Sprint: kolor i emisja wg atrybutu pwl_sweat (0..1)."""
    name = f"PWL_skin_{state}"
    mat = bpy.data.materials.get(name)
    if mat is not None:
        return mat
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    for k, v in (("Roughness", 0.55), ("Specular IOR Level", 0.3), ("Coat Weight", 0.0), ("Alpha", SKIN_ALPHA[state])):
        if k in bsdf.inputs:
            bsdf.inputs[k].default_value = v
    if state == "rest":
        col = al.mix(BONE, SKIN, al.REST_MIX)
        bsdf.inputs["Base Color"].default_value = col
        bsdf.inputs["Emission Strength"].default_value = 0.0
    else:
        attr = nt.nodes.new("ShaderNodeAttribute")
        attr.attribute_type = 'GEOMETRY'
        attr.attribute_name = "pwl_sweat"
        rng = nt.nodes.new("ShaderNodeMapRange")  # 0..1 -> LEVEL_LOW..LEVEL_HIGH
        rng.inputs["From Min"].default_value = 0.0
        rng.inputs["From Max"].default_value = 1.0
        rng.inputs["To Min"].default_value = LEVEL_LOW
        rng.inputs["To Max"].default_value = LEVEL_HIGH
        nt.links.new(attr.outputs["Fac"], rng.inputs["Value"])
        mixn = nt.nodes.new("ShaderNodeMix")
        mixn.data_type = 'RGBA'
        a_in = next(s for s in mixn.inputs if s.identifier == "A_Color")
        b_in = next(s for s in mixn.inputs if s.identifier == "B_Color")
        f_in = next(s for s in mixn.inputs if s.identifier == "Factor_Float")
        out = next(s for s in mixn.outputs if s.identifier == "Result_Color")
        a_in.default_value = BONE
        b_in.default_value = SKIN
        nt.links.new(rng.outputs["Result"], f_in)
        ra = nt.nodes.new("ShaderNodeMapRange")  # krycie: 0..1 -> SKIN_ALPHA..SPRINT_ALPHA_HIGH
        ra.inputs["To Min"].default_value = SKIN_ALPHA["sprint"]
        ra.inputs["To Max"].default_value = SPRINT_ALPHA_HIGH
        nt.links.new(attr.outputs["Fac"], ra.inputs["Value"])
        nt.links.new(ra.outputs["Result"], bsdf.inputs["Alpha"])
        nt.links.new(out, bsdf.inputs["Base Color"])
        nt.links.new(out, bsdf.inputs["Emission Color"])
        # emisja = emission_for(stopień): stopień < minLevel -> 0; dalej liniowo min..SKIN_EMISSION_MAX
        lo = al.EMISSION_RULE["minLevel"]
        er = nt.nodes.new("ShaderNodeMapRange")
        er.clamp = True
        er.inputs["From Min"].default_value = lo
        er.inputs["From Max"].default_value = 1.0
        er.inputs["To Min"].default_value = al.EMISSION_RULE["min"]
        er.inputs["To Max"].default_value = SKIN_EMISSION_MAX
        nt.links.new(rng.outputs["Result"], er.inputs["Value"])
        gate = nt.nodes.new("ShaderNodeMath")
        gate.operation = 'GREATER_THAN'
        gate.inputs[1].default_value = lo - 1e-4
        nt.links.new(rng.outputs["Result"], gate.inputs[0])
        em = nt.nodes.new("ShaderNodeMath")
        em.operation = 'MULTIPLY'
        nt.links.new(er.outputs["Result"], em.inputs[0])
        nt.links.new(gate.outputs["Value"], em.inputs[1])
        nt.links.new(em.outputs["Value"], bsdf.inputs["Emission Strength"])
    try:
        mat.surface_render_method = 'BLENDED'
    except (AttributeError, TypeError):
        pass
    mat.use_backface_culling = True
    mat.diffuse_color = SKIN
    return mat


def flat_material(name, color, roughness=0.6, emission=0.0, alpha=1.0, subsurface=0.05):
    return al.make_material(name, color, roughness=roughness, subsurface=subsurface, emission=emission, alpha=alpha,
                            backface_culling=True if alpha < 1 else None)


class SkinPlate(al.Plate):
    """Role lokalne: 'skin_layer' (sylwetka z mapą pocenia) i 'fixed' (materiał od funkcji stanu).
    rest_only / sprint_only: obiekty widoczne tylko w jednym stanie (np. naczynia wąskie / rozszerzone)."""

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.state_fn = {}  # nazwa obiektu -> fn(state) -> materiał
        self.rest_only, self.sprint_only = set(), set()
        self._state = "sprint"

    def add_fixed(self, objs, fn, views=None):
        objs = self.add(objs, role="fixed", views=views)
        for o in objs:
            self.state_fn[o.name] = fn
        return objs

    def _apply_state(self, state):
        self._state = state
        saved = self.items
        self.items = [i for i in self.items if i[1] not in ("fixed", "skin_layer")]
        try:
            super()._apply_state(state)
        finally:
            self.items = saved
        for o, role, *_ in self.items:
            if role == "skin_layer":
                al.assign(o, skin_layer_material(state))
            elif role == "fixed":
                al.assign(o, self.state_fn[o.name](state))

    def _visible(self, view):
        super()._visible(view)
        for o, *_ in self.items:
            if (o.name in self.rest_only and self._state != "rest") or (o.name in self.sprint_only and self._state != "sprint"):
                o.hide_render = True


def preview_mode(plate):
    if PREVIEW_DIR:
        plate.scene.render.resolution_percentage = 50
        try:
            plate.scene.eevee.taa_render_samples = 16
        except AttributeError:
            pass


# ============================================================ render kontrolny dopasowania (K1)
if FIT_DIR:
    os.makedirs(FIT_DIR, exist_ok=True)
    os.environ.pop("ATLAS_QUICK", None)
    fit = SkinPlate("powlokowy_fit", out_dir=FIT_DIR)
    fit.add(all_bones, role="context_bone")
    fit.add([hull], role="active", system="skin", alpha=0.35)
    fit.add(skin_h, role="active", system="resp", alpha=0.22)
    fit.add(sup_veins, role="active", system="vein", ctx="muscle")
    fit.set_view("front", direction="front", frame=[hull] + skin_h, margin=1.04)
    fit.set_view("side", direction="side", frame=[hull] + skin_h, margin=1.04)
    fit.render(views=("front", "side"), states=("sprint",))
    raise SystemExit(0)

# ============================================================ DETAIL: przekrój skóry (schemat proceduralny)
L = Vector((30.0, 0.0, 0.0))  # osobne miejsce w świecie; widoczne tylko w widoku detail
W, D = 0.90, 0.55  # szerokość (x) i głębokość bloku (y od płaszczyzny cięcia y=0 w głąb)
Z_EPI = 0.0
Z_DERM = -0.62
Z_HYPO = -1.10
PAP = 0.11  # okres brodawek skóry właściwej


def epi_bottom(x, y):
    """Granica naskórek / skóra właściwa: brodawki (fala)."""
    return -0.075 - 0.03 * (0.5 + 0.5 * math.cos(2 * math.pi * x / PAP)) * (0.85 + 0.15 * math.cos(2 * math.pi * y / 0.21))


def derm_bottom(x, y):
    return Z_DERM + 0.025 * math.sin(2 * math.pi * x / 0.37 + 0.6) + 0.015 * math.sin(2 * math.pi * y / 0.29)


def slab(name, top_fn, bot_fn, nx=120, ny=40):
    """Zamknięta bryła: góra z=top_fn(x,y), dół z=bot_fn(x,y), na prostokącie x∈[-W/2,W/2], y∈[0,D]."""
    bm = bmesh.new()
    xs = [-W / 2 + W * i / nx for i in range(nx + 1)]
    ys = [D * j / ny for j in range(ny + 1)]
    T = [[bm.verts.new((x, y, top_fn(x, y))) for x in xs] for y in ys]
    B = [[bm.verts.new((x, y, bot_fn(x, y))) for x in xs] for y in ys]
    for j in range(ny):
        for i in range(nx):
            bm.faces.new((T[j][i], T[j][i + 1], T[j + 1][i + 1], T[j + 1][i]))
            bm.faces.new((B[j][i], B[j + 1][i], B[j + 1][i + 1], B[j][i + 1]))
    for i in range(nx):  # przód (y=0) i tył (y=D)
        bm.faces.new((B[0][i], B[0][i + 1], T[0][i + 1], T[0][i]))
        bm.faces.new((T[ny][i], T[ny][i + 1], B[ny][i + 1], B[ny][i]))
    for j in range(ny):  # boki
        bm.faces.new((T[j][0], T[j + 1][0], B[j + 1][0], B[j][0]))
        bm.faces.new((B[j][nx], B[j + 1][nx], T[j + 1][nx], T[j][nx]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = L
    return ob


def tube(name, pts, r, radii=None, res=6, cyclic=False):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = r
    cu.bevel_resolution = res
    cu.use_fill_caps = True
    sp = cu.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for i, (p, v) in enumerate(zip(sp.points, pts)):
        p.co = (*Vector(v), 1.0)
        p.radius = radii[i] if radii else 1.0
    sp.use_cyclic_u = cyclic
    ob = bpy.data.objects.new(name, cu)
    ob.location = L
    return ob


def smooth_path(ctrl, n=14):
    """Catmull-Rom przez punkty kontrolne -> gęsta łamana."""
    P = [Vector(c) for c in ctrl]
    P = [P[0]] + P + [P[-1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(n):
            t = k / n
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(P[-2])
    return out


def blob(name, center, radius, scale=(1, 1, 1), seg=24):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=radius,
                              matrix=Matrix.Translation(Vector(center)) @ Matrix.Diagonal((*scale, 1)))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    ob.location = L
    return ob


epidermis = slab("PWL_epidermis", lambda x, y: Z_EPI, epi_bottom)
dermis = slab("PWL_dermis", epi_bottom, derm_bottom)
hypodermis = slab("PWL_hypodermis", derm_bottom, lambda x, y: Z_HYPO)
# przegrody łącznotkankowe między zrazikami tłuszczu (linie na płaszczyźnie cięcia)
septa = []
for k, (x0, x1) in enumerate(((-0.33, -0.25), (-0.05, 0.02), (0.20, 0.27))):
    pts = smooth_path([(x0, -0.004, Z_DERM - 0.02), ((x0 + x1) / 2 + 0.03, -0.004, -0.85), (x1, -0.004, Z_HYPO + 0.01)], 10)
    septa.append(tube(f"PWL_septum_{k}", pts, 0.006, res=3))
for k, (xa, za, xb, zb) in enumerate(((-0.45, -0.88, -0.29, -0.86), (0.0, -0.92, 0.23, -0.95), (0.25, -0.80, 0.45, -0.78))):
    pts = smooth_path([(xa, -0.004, za), ((xa + xb) / 2, -0.004, (za + zb) / 2 - 0.03), (xb, -0.004, zb)], 10)
    septa.append(tube(f"PWL_septum_h{k}", pts, 0.006, res=3))

# Gruczoł potowy ekrynowy: kłębek wydzielniczy na granicy skóry właściwej i tkanki podskórnej, przewód do poru.
GX = -0.20
coil_pts = []
for i in range(220):
    t = i / 219 * 7 * 2 * math.pi
    rr = 0.055 * (0.65 + 0.35 * math.sin(t * 0.37))
    coil_pts.append((GX + rr * math.cos(t), -0.01 + 0.035 * math.sin(t), -0.66 + 0.06 * math.sin(t * 0.21) + 0.012 * math.sin(t * 1.7)))
duct_pts = smooth_path([coil_pts[-1], (GX + 0.03, -0.01, -0.55), (GX - 0.01, -0.01, -0.35), (GX + 0.02, -0.01, -0.15),
                        (GX, -0.01, -0.095)], 12)
for i in range(1, 49):  # spiralny odcinek w naskórku (akrosyringium) do poru
    t = i / 48
    duct_pts.append(Vector((GX + 0.018 * math.cos(t * 3 * 2 * math.pi), -0.01 + 0.018 * math.sin(t * 3 * 2 * math.pi), -0.095 + 0.098 * t)))
gland_coil = tube("PWL_sweat_coil", coil_pts, 0.016, res=5)
gland_duct = tube("PWL_sweat_duct", duct_pts, 0.010, res=4)
# kropla potu na porze i kilka mniejszych (tylko sprint)
drops = [blob("PWL_drop_0", (GX, -0.02, 0.012), 0.045, scale=(1, 1, 0.55))]
for k, (dx, dy, rr) in enumerate(((-0.33, 0.12, 0.024), (0.05, 0.20, 0.03), (0.33, 0.08, 0.022), (-0.06, 0.38, 0.026))):
    drops.append(blob(f"PWL_drop_{k + 1}", (dx, dy, rr * 0.25), rr, scale=(1, 1, 0.55)))

# Mieszek włosowy z włosem, mięsień przywłosowy, gruczoł łojowy (pochylone jak w podręczniku).
HX = 0.20
fol_base = Vector((HX + 0.10, 0.02, -0.70))
fol_top = Vector((HX, 0.02, 0.0))
follicle = tube("PWL_follicle", [fol_base + (fol_top - fol_base) * (i / 20) for i in range(21)], 0.034,
                radii=[1.25 if i < 2 else 1.0 for i in range(21)], res=6)
bulb = blob("PWL_hair_bulb", fol_base + Vector((0, 0, 0.01)), 0.05, scale=(1, 1, 1.15))
hair_dir = (fol_top - fol_base).normalized()
hair = tube("PWL_hair", [fol_base + hair_dir * (0.03 + 1.05 * i / 30) for i in range(31)], 0.012, res=4)
sebaceous = blob("PWL_sebaceous", fol_base + (fol_top - fol_base) * 0.72 + Vector((-0.055, -0.02, 0.0)), 0.038, scale=(1, 0.8, 1.3))
mp_a = fol_base + (fol_top - fol_base) * 0.45 + Vector((0.035, -0.01, 0))
mp_b = Vector((HX + 0.17, -0.01, -0.105))
arrector = tube("PWL_arrector_pili", smooth_path([mp_a, (mp_a + mp_b) / 2 + Vector((0.01, 0, 0.02)), mp_b], 10), 0.017,
                radii=None, res=4)


# Naczynia: splot głęboki (granica skóry właściwej i podskórnej) i splot powierzchowny (pod brodawkami), połączone
# naczyniami pionowymi; pętle włosowate w brodawkach. Dwie wersje promienia: spoczynek (węższe) i sprint (rozszerzone).
def vessel_set(tag, scale):
    objs = {"artery": [], "vein": []}
    Y_A, Y_V = -0.006, 0.02
    for kind, yy, dz in (("artery", Y_A, 0.0), ("vein", Y_V, 0.03)):
        r = (0.020 if kind == "artery" else 0.024) * scale
        rs = (0.011 if kind == "artery" else 0.013) * scale
        deep = smooth_path([(-W / 2 - 0.02, yy, -0.585 + dz), (-0.1, yy, -0.60 + dz), (0.15, yy, -0.575 + dz), (W / 2 + 0.02, yy, -0.59 + dz)], 16)
        sup = smooth_path([(-W / 2 - 0.02, yy, -0.155 - dz * 0.6), (0.0, yy, -0.145 - dz * 0.6), (W / 2 + 0.02, yy, -0.16 - dz * 0.6)], 16)
        objs[kind].append(tube(f"PWL_{tag}_{kind}_deep", deep, r))
        objs[kind].append(tube(f"PWL_{tag}_{kind}_sup", sup, rs))
        for k, xx in enumerate((-0.36, 0.05, 0.40)):
            x2 = xx + (0.02 if kind == "artery" else -0.02)
            vert = smooth_path([(x2, yy, -0.59 + dz), (x2 + 0.03, yy, -0.38), (x2 - 0.01, yy, -0.16 - dz * 0.6)], 10)
            objs[kind].append(tube(f"PWL_{tag}_{kind}_conn{k}", vert, rs * 0.95))
    # pętle włosowate w brodawkach: tętnicza połowa w górę, żylna w dół (kolor wg utlenowania)
    caps = []
    n_loops = 0
    for i in range(-4, 5):
        xc = i * PAP
        if abs(xc - GX) < 0.05 or abs(xc - HX) < 0.06:
            continue
        top = epi_bottom(xc, 0.0) + 0.012
        a = [(xc - 0.012, -0.006, -0.15), (xc - 0.012, -0.008, (top - 0.15) / 2 - 0.03), (xc - 0.006, -0.01, top)]
        v = [(xc + 0.006, -0.01, top), (xc + 0.012, -0.008, (top - 0.15) / 2 - 0.03), (xc + 0.012, 0.0, -0.15)]
        objs["artery"].append(tube(f"PWL_{tag}_cap_a{i}", smooth_path(a, 6), 0.0055 * scale, res=3))
        objs["vein"].append(tube(f"PWL_{tag}_cap_v{i}", smooth_path(v, 6), 0.0055 * scale, res=3))
        n_loops += 1
    # naczynia wokół kłębka potowego
    ring_pts = [(GX + 0.075 * math.cos(t / 40 * 2 * math.pi), -0.02 + 0.03 * math.sin(t / 40 * 2 * math.pi), -0.66 + 0.02 * math.sin(t / 40 * 6 * math.pi)) for t in range(41)]
    objs["artery"].append(tube(f"PWL_{tag}_gland_cap", ring_pts, 0.0065 * scale, res=3))
    return objs


ves_rest = vessel_set("rest", 0.62)
ves_sprint = vessel_set("sprint", 1.0)

detail_objs = [epidermis, dermis, hypodermis, gland_coil, gland_duct, follicle, bulb, hair, sebaceous, arrector] + septa + drops
detail_objs += [o for d in (ves_rest, ves_sprint) for k in d for o in d[k]]

# ============================================================ plansza
LIGHT_SKIN = al.hex_to_linear(al.SYSTEM_LIGHT["skin"])
EPI_COL = al.mix(LIGHT_SKIN, BONE, 0.25)
DERM_COL = al.mix(SKIN, MUSC, 0.15)
HYPO_COL = al.mix(BONE, al.hex_to_linear("#E8D6A8"), 0.45)  # tłuszcz: kremowy (jasny kontekst, nie kolor układu)


def layer_mat(name, col):
    return lambda s: flat_material(name, col, roughness=0.7, subsurface=0.04)


def gland_mat(s):
    col, emi, _ = al.active_color("skin", s, 1.0, ctx="muscle")
    return flat_material(f"PWL_gland_{s}", col, roughness=0.55, emission=emi)


def drop_mat(s):
    return al.make_material("PWL_sweat_drop", al.hex_to_linear("#EEF3F8"), roughness=0.08, alpha=0.55, backface_culling=True)


plate = SkinPlate("powlokowy")
preview_mode(plate)
if PREVIEW_DIR:
    os.makedirs(PREVIEW_DIR, exist_ok=True)
    os.environ.pop("ATLAS_QUICK", None)
    try:
        os.rmdir(plate.out_dir)
    except OSError:
        pass
    plate.out_dir = PREVIEW_DIR

FRONT = ("front", "back")  # całe ciało: przód i tył
DET = ("detail",)
plate.add(all_bones, role="context_bone", views=FRONT)
if MUSCLE_ALPHA > 0:
    plate.add_fixed(muscles, lambda s: flat_material("PWL_ctx_muscle", MUSC, roughness=0.7, alpha=MUSCLE_ALPHA, subsurface=0.0), views=FRONT)
plate.add([hull], role="skin_layer", views=FRONT)
plate.add(sup_veins, role="active", system="vein", ctx="muscle", sprint_level=1.0, views=FRONT)
plate.add(sup_veins_sprint, role="active", system="vein", ctx="muscle", sprint_level=1.0, views=FRONT)

plate.add_fixed([epidermis], layer_mat("PWL_epi", EPI_COL), views=DET)
plate.add_fixed([dermis], layer_mat("PWL_derm", DERM_COL), views=DET)
plate.add_fixed([hypodermis], layer_mat("PWL_hypo", HYPO_COL), views=DET)
plate.add_fixed(septa, lambda s: flat_material("PWL_septum", al.mix(BONE, MUSC, 0.5), roughness=0.7), views=DET)
plate.add_fixed([gland_coil, gland_duct], gland_mat, views=DET)
plate.add_fixed([follicle, bulb, sebaceous], lambda s: flat_material("PWL_follicle", al.mix(LIGHT_SKIN, MUSC, 0.35)), views=DET)
plate.add_fixed([hair], lambda s: flat_material("PWL_hair", al.mix(MUSC, (0.05, 0.04, 0.04, 1), 0.55), roughness=0.5), views=DET)
plate.add_fixed([arrector], lambda s: flat_material("PWL_arrector", al.hex_to_linear(al.CONTEXT_COLORS["muscle"]), roughness=0.65), views=DET)
plate.add_fixed(drops, drop_mat, views=DET)
for d, lvl in ((ves_rest, None), (ves_sprint, 1.0)):
    plate.add(d["artery"], role="active", system="artery", ctx="muscle", sprint_level=1.0, views=DET)
    plate.add(d["vein"], role="active", system="vein", ctx="muscle", sprint_level=1.0, views=DET)
plate.rest_only = {o.name for d in (ves_rest,) for k in d for o in d[k]} | {o.name for o in sup_veins}
plate.sprint_only = {o.name for d in (ves_sprint,) for k in d for o in d[k]} | {o.name for o in drops} | {o.name for o in sup_veins_sprint}

# Kamera całego ciała jak na planszy mięśniowej (obrys kości i mięśni, margines 1,06): warstwy nakładają się na „Całość”.
plate.set_view("front", direction="front", frame=all_bones + muscles, margin=1.06)
plate.set_view("back", direction="back", frame=all_bones + muscles, margin=1.06)
# Zbliżenie: blok z góry-przodu (jak rycina podręcznikowa), obraz pionowy tej samej rozdzielczości.
DET_DIR = Vector((0.0, -1.0, 0.42)).normalized()
plate.set_view("detail", direction=DET_DIR, center=L + Vector((0.0, 0.10, -0.47)), ortho_scale=1.82)

# ---------------------------------------------------------------- kotwice
def on_vessel(name, t=None, z=None, toward=-1):
    """Kotwica na żyle, 6 mm w stronę kamery (toward=-1: przód, +1: tył)."""
    p = al.curve_anchor(name, z=z, t=t)
    return p + Vector((0, 0.006 * toward, 0))


def back_point(x, z):
    """Punkt na tylnej (+Y) powierzchni sylwetki w (x, z)."""
    hit = HULL_BVH.ray_cast(Vector((x, 1.0, z)), Vector((0, -1, 0)))
    if hit[0] is None:
        raise RuntimeError(f"brak trafienia w sylwetkę (tył) w x={x}, z={z}")
    return hit[0]


A = {
    "skin_forehead": {"point": front_point(-0.022, 1.625), "views": ["front"]},
    "skin_trunk": {"point": front_point(-0.075, 1.12), "views": ["front"]},
    "skin_back": {"point": back_point(0.045, 1.25), "views": ["back"]},
    "small_saphenous": {"point": on_vessel("Small saphenous vein.r", z=0.27, toward=+1), "views": ["back"]},
    "great_saphenous": {"point": on_vessel("Great saphenous vein.r", z=0.30), "views": ["front"]},
    "cephalic": {"point": on_vessel("Cephalic vein.r", z=1.17), "views": ["front"]},
    "median_cubital": {"point": on_vessel("Median cubital vein.r", t=0.5), "views": ["front"]},
    "external_jugular": {"point": on_vessel("External jugular vein.r", t=0.45), "views": ["front"]},
    "basilic": {"point": on_vessel("Basilic vein.l", z=0.98), "views": ["front"]},
    "hand_veins": {"point": on_vessel("Dorsal venous network of hand.l", t=0.5), "views": ["front"]},
    # zbliżenie: punkty na płaszczyźnie cięcia (y≈0) albo na powierzchni struktur
    "epidermis": {"point": L + Vector((-0.40, -0.002, -0.03)), "views": ["detail"]},
    "dermis": {"point": L + Vector((-0.40, -0.002, -0.36)), "views": ["detail"]},
    "hypodermis": {"point": L + Vector((-0.40, -0.002, -0.80)), "views": ["detail"]},
    "sweat_gland": {"point": L + Vector((GX - 0.03, -0.05, -0.66)), "views": ["detail"]},
    "sweat_pore": {"point": L + Vector((GX, -0.02, 0.005)), "views": ["detail"]},
    "vessels_sup": {"point": L + Vector((0.30, -0.03, -0.152)), "views": ["detail"]},
    "vessels_deep": {"point": L + Vector((0.32, -0.035, -0.58)), "views": ["detail"]},
    "arrector_pili": {"point": L + (mp_a + mp_b) / 2 + Vector((0.01, -0.025, 0.02)), "views": ["detail"]},
    "hair_follicle": {"point": L + fol_base + (fol_top - fol_base) * 0.25 + Vector((0.0, -0.03, 0)), "views": ["detail"]},
    "sebaceous": {"point": L + fol_base + (fol_top - fol_base) * 0.72 + Vector((-0.075, -0.045, 0.0)), "views": ["detail"]},
}

# ---------------------------------------------------------------- strzałki (flows3d.json, metry)
flows3d = []
saph, saph_note = al.vessel_direction("Great saphenous vein.r")
print("PWL_FLOW saphenous", saph_note, "z", round(saph[0].z, 3), "->", round(saph[-1].z, 3))
flows3d.append({"id": "vein_saphenous", "kind": "vein", "labelPl": "Krew ze skóry nogi wraca żyłą odpiszczelową do serca",
                "views": ["front"], "points": [p + Vector((0, -0.006, 0)) for p in saph]})
ceph, ceph_note = al.vessel_direction("Cephalic vein.r")
print("PWL_FLOW cephalic", ceph_note, "z", round(ceph[0].z, 3), "->", round(ceph[-1].z, 3))
ssv, ssv_note = al.vessel_direction("Small saphenous vein.r")
print("PWL_FLOW small_saphenous", ssv_note, "z", round(ssv[0].z, 3), "->", round(ssv[-1].z, 3))
flows3d.append({"id": "vein_small_saphenous", "kind": "vein", "labelPl": "Krew ze skóry łydki wraca żyłą odstrzałkową",
                "views": ["back"], "points": [p + Vector((0, 0.006, 0)) for p in ssv]})
flows3d.append({"id": "vein_cephalic", "kind": "vein", "labelPl": "Krew ze skóry ręki wraca żyłą odpromieniową",
                "views": ["front"], "points": [p + Vector((0, -0.006, 0)) for p in ceph]})
arm, arm_rep = al.vessel_path(["Axillary artery.l", "Brachial artery.l", "Radial artery.l"])
for line in arm_rep:
    print("PWL_FLOW artery_arm", line)
flows3d.append({"id": "artery_arm", "kind": "artery", "labelPl": "Ciepła krew z wnętrza ciała płynie do skóry ręki",
                "views": ["front"], "points": arm})


def heat_out(x, z, dirx, length=0.09, inside=0.025):
    """Strzałka ciepła: od punktu 2,5 cm wewnątrz sylwetki na wysokości z, w poziomie na zewnątrz (kierunek ±X)."""
    P = np.array([list(v) for v in _HV])
    sel = P[(np.abs(P[:, 2] - z) < 0.008) & (np.sign(P[:, 0]) == np.sign(dirx)) & (np.abs(P[:, 0] - x) < 0.08)]
    edge = sel[np.argmax(sel[:, 0] * dirx)]
    e = Vector((float(edge[0]), 0.0, z))
    return [e - Vector((dirx * inside, 0, 0)), e + Vector((dirx * length, 0, 0))]


flows3d += [
    {"id": "heat_head", "kind": "heat", "labelPl": "Ciepło uchodzi przez skórę głowy",
     "views": ["front", "back"], "points": [Vector((0.0, 0.0, 1.66)), Vector((0.0, 0.0, 1.765))]},
    {"id": "heat_arm_r", "kind": "heat", "labelPl": "Ciepło uchodzi przez skórę ramienia",
     "views": ["front", "back"], "points": heat_out(-0.24, 1.26, -1)},
    {"id": "heat_thigh_r", "kind": "heat", "labelPl": "Ciepło uchodzi przez skórę uda",
     "views": ["front", "back"], "points": heat_out(-0.15, 0.62, -1)},
    {"id": "heat_thigh_l", "kind": "heat", "labelPl": "Ciepło uchodzi przez skórę uda",
     "views": ["front", "back"], "points": heat_out(0.15, 0.62, 1)},
]
DL = lambda *pts: [L + Vector(p) for p in pts]  # noqa: E731
flows3d += [
    {"id": "d_artery", "kind": "artery", "labelPl": "Ciepła krew z wnętrza ciała do skóry", "views": ["detail"],
     "points": DL((-0.44, -0.05, -0.585), (-0.20, -0.05, -0.598), (0.02, -0.05, -0.59), (0.06, -0.05, -0.45), (0.06, -0.05, -0.20))},
    {"id": "d_heat_skin", "kind": "heat", "labelPl": "Ciepło z krwi przez skórę na zewnątrz", "views": ["detail"],
     "points": DL((0.10, -0.06, -0.14), (0.10, -0.06, 0.02), (0.10, -0.06, 0.20))},
    {"id": "d_heat_sweat", "kind": "heat", "labelPl": "Parowanie potu zabiera ciepło", "views": ["detail"],
     "points": DL((GX, -0.03, 0.04), (GX - 0.02, -0.03, 0.14), (GX - 0.04, -0.03, 0.26))},
]

plate.scene.view_layers[0].update()
VIEWS = tuple(os.environ.get("PWL_VIEWS", "front,back,detail").split(","))
meta = plate.render(views=VIEWS, states=("rest", "sprint"), anchors=A, flows3d=flows3d)
