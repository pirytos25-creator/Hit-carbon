# Gablota serca (M5, z testu M2): serce HuBMAP z kształtami skurczu, zastawkami B, AO w wierzchołkach i torami krwinek.
# Geometria: wyłącznie HuBMAP (CC BY 4.0). Kształty ruchu liczone z geometrii, wielkość ruchu „poglądowa”.
# Uruchomienie (przez slot): blender --background --factory-startup --python blender/biomotion/export_heart.py -- public/atlas3d/_organs/serce   (potem gltf-transform quantize + meshopt → serce.glb)
import bpy, bmesh, sys, os, math, json, time
from mathutils import Vector, Matrix

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = ARGS[0] if ARGS else os.path.abspath("_assets")
os.makedirs(OUT, exist_ok=True)
RAW = os.environ.get("ATLAS_RAW", r"C:\Users\piryt\Desktop\Luźny Vibecoading\HIIt\atlas_raw")
HUB = os.path.join(RAW, "hubmap")
T0 = time.time()
LOG = {}

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def imp(name):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(HUB, name))
    objs = [o for o in bpy.data.objects if o not in before]
    for o in objs:
        if o.parent:
            mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
    out = {}
    for o in objs:
        if o.type != "MESH":
            bpy.data.objects.remove(o); continue
        o.data.transform(o.matrix_world); o.matrix_world = Matrix.Identity(4)  # wierzchołki w świecie
        o.name = o.name.split(".")[0]
        out[o.name.replace("VH_M_", "")] = o
    return out


def verts(o):
    return [v.co.copy() for v in o.data.vertices]


def centroid(pts):
    s = Vector((0, 0, 0))
    for p in pts: s += p
    return s / max(1, len(pts))


def pca(pts):
    c = centroid(pts)
    cov = [[0.0] * 3 for _ in range(3)]
    for p in pts:
        d = p - c
        for i in range(3):
            for j in range(3):
                cov[i][j] += d[i] * d[j]
    M = Matrix(cov)
    # potęgowanie: oś główna; najmniejsza przez odwrotność z regularyzacją
    v = Vector((1, 0.3, 0.2)).normalized()
    for _ in range(60): v = (M @ v).normalized()
    Mi = (M + Matrix.Identity(3) * 1e-9).inverted()
    w = Vector((0.2, 0.3, 1)).normalized()
    for _ in range(60): w = (Mi @ w).normalized()
    return c, v, w


def bisect(o, co, no):
    bm = bmesh.new(); bm.from_mesh(o.data)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=co, plane_no=no, clear_outer=True)
    bm.to_mesh(o.data); bm.free()


# ------------------------------------------------------------------ geometria
H = imp("VH_M_Heart.glb")
V = imp("VH_M_Blood_Vasculature_Heart.glb")
hall = [p for o in H.values() for p in verts(o)]
hmin = Vector((min(p.x for p in hall), min(p.y for p in hall), min(p.z for p in hall)))
hmax = Vector((max(p.x for p in hall), max(p.y for p in hall), max(p.z for p in hall)))
CEN = (hmin + hmax) / 2
LOG["heart_center_body_m"] = list(CEN)
keepv = ("aort", "pulmonary", "vena_cava", "brachiocephalic", "coronary", "cardiac", "descending", "marginal",
         "diagonal", "carotid", "subclavian", "sinus", "oblique")
for n in list(V):
    if not any(k in n for k in keepv):
        bpy.data.objects.remove(V.pop(n)); continue
    bisect(V[n], (0, 0, hmin.z - 0.02), (0, 0, -1))
    bisect(V[n], (0, 0, hmax.z + 0.04), (0, 0, 1))
    if len(V[n].data.vertices) == 0:
        bpy.data.objects.remove(V.pop(n))

# kluczowe punkty z geometrii
valve = {k: centroid(verts(H[k])) for k in ("mitral_valve", "tricuspid_valve", "aortic_valve", "pulmonary_valve")}
cham = {k: centroid(verts(H[k])) for k in ("left_cardiac_atrium", "right_cardiac_atrium", "heart_left_ventricle", "heart_right_ventricle")}
base = (valve["mitral_valve"] + valve["tricuspid_valve"]) / 2
lv = verts(H["heart_left_ventricle"])
apex = max(lv, key=lambda p: (p - base).length)
AX = (apex - base).normalized()
LONG = (apex - base).length
LOG["long_axis_m"] = round(LONG, 4)


def smooth(x):
    x = max(0.0, min(1.0, x)); return x * x * (3 - 2 * x)


# ------------------------------------------------------------------ kształty ruchu (poglądowe)
S_RAD, S_LONG = 0.14, 0.09  # skrócenie promieniowe i podłużne komór; wielkość do faktu (dziś „poglądowa”)


def ventricle_target(p):
    t = (p - base).dot(AX)              # 0 = podstawa, LONG = koniuszek
    a = base + AX * t
    u = smooth(t / LONG)                 # podstawa prawie nieruchoma, koniuszek najbardziej
    r = p - a
    a2 = base + AX * (t * (1 - S_LONG * u))
    return a2 + r * (1 - S_RAD * (0.35 + 0.65 * u))


def add_key(o, name, fn):
    if not o.data.shape_keys:
        o.shape_key_add(name="Basis")
    k = o.shape_key_add(name=name)
    for i, v in enumerate(o.data.vertices):
        k.data[i].co = fn(v.co.copy())
    return k


for n in ("heart_left_ventricle", "heart_right_ventricle", "interventricular_septum") + tuple(k for k in H if "papillary" in k):
    add_key(H[n], "Ventricular_Systole", ventricle_target)
def atrium_target_fn(c, ring):
    def f(p):
        w = smooth(((p - ring).length - 0.012) / 0.03)  # przy pierścieniu zastawki bez ruchu
        return c + (p - c) * (1 - 0.12 * w)
    return f


add_key(H["left_cardiac_atrium"], "Atrial_Systole", atrium_target_fn(cham["left_cardiac_atrium"], valve["mitral_valve"]))
add_key(H["right_cardiac_atrium"], "Atrial_Systole", atrium_target_fn(cham["right_cardiac_atrium"], valve["tricuspid_valve"]))

# zastawki B: rozchylenie płatków wokół linii przyczepu (bez podziału na płatki: wachlarz ciągły)
VALVE_FLOW = {  # skąd -> dokąd płynie krew przez zastawkę
    "mitral_valve": ("left_cardiac_atrium", "heart_left_ventricle"),
    "tricuspid_valve": ("right_cardiac_atrium", "heart_right_ventricle"),
    "aortic_valve": ("heart_left_ventricle", None),
    "pulmonary_valve": ("heart_right_ventricle", None),
}
VALVE_INFO = {}
for n, (up, down) in VALVE_FLOW.items():
    o = H[n]; P = verts(o)
    c, _, nrm = pca(P)
    flow = (c - cham[up]).normalized()
    if nrm.dot(flow) < 0: nrm = -nrm     # oś w kierunku przepływu
    R = max(((p - c) - nrm * (p - c).dot(nrm)).length for p in P)
    VALVE_INFO[n] = {"c": c, "n": nrm, "R": R}

    def opener(p, c=c, nrm=nrm, R=R):
        d = p - c
        radial = d - nrm * d.dot(nrm)
        r = radial.length
        if r < 1e-6: return p + nrm * R * 0.6
        rh = radial / r
        hinge_pt = c + rh * R + nrm * d.dot(nrm)
        tang = nrm.cross(rh).normalized()
        ang = math.radians(70) * smooth(1 - r / R)  # wolny brzeg najdalej od przyczepu obraca się najbardziej
        rot = Matrix.Rotation(ang, 3, tang)
        q = hinge_pt + rot @ (p - hinge_pt)
        # kierunek obrotu: wolny brzeg ma iść z prądem
        if (q - p).dot(nrm) < 0:
            q = hinge_pt + Matrix.Rotation(-ang, 3, tang) @ (p - hinge_pt)
        return q
    add_key(o, "Valve_Open", opener)
    LOG.setdefault("valves", {})[n] = {"R_mm": round(R * 1000, 1)}

# ------------------------------------------------------------------ tory krwinek z promieniem przekroju
def slice_centerline(o, nslices=10, arch=False):
    P = verts(o)
    c, ax, nn = pca(P)
    if arch:  # łuk: kąt wokół środka w płaszczyźnie łuku
        u = ax; w = nn.cross(u).normalized()
        angs = [math.atan2((p - c).dot(w), (p - c).dot(u)) for p in P]
        lo, hi = min(angs), max(angs)
        key = lambda i: angs[i]
    else:
        ts = [(p - c).dot(ax) for p in P]
        lo, hi = min(ts), max(ts)
        key = lambda i: ts[i]
    bins = [[] for _ in range(nslices)]
    for i, p in enumerate(P):
        k = min(nslices - 1, int((key(i) - lo) / (hi - lo + 1e-9) * nslices))
        bins[k].append(p)
    pts = []
    for b in bins:
        if len(b) < 8: continue
        cc = centroid(b)
        r = sum((p - cc).length for p in b) / len(b)
        pts.append((cc, r))
    return pts


def orient(pts, start_near):
    if (pts[0][0] - start_near).length > (pts[-1][0] - start_near).length:
        pts = pts[::-1]
    return pts


def chamber_r(n):
    P = verts(H[n]); c = centroid(P)
    return 0.55 * sum((p - c).length for p in P) / len(P)  # przybliżony promień światła jamy


def V_(n):
    return V[n] if n in V else None


paths = {}
# prawa: żyła główna górna i dolna -> PP -> trójdzielna -> PK -> płucna -> pień płucny -> tętnice płucne
svc = orient(slice_centerline(V_("superior_vena_cava"), 8), Vector((CEN.x, CEN.y, hmax.z + 0.05)))
ivc = orient(slice_centerline(V_("inferior_vena_cava_a"), 6), Vector((CEN.x, CEN.y, hmin.z - 0.05))) if V_("inferior_vena_cava_a") else []
tv, pv = VALVE_INFO["tricuspid_valve"], VALVE_INFO["pulmonary_valve"]
trunk = orient(slice_centerline(V_("pulmonary_trunk"), 6), pv["c"])
pa_l = orient(slice_centerline(V_("pulmonary_artery_L"), 6), trunk[-1][0])
pa_r = orient(slice_centerline(V_("pulmonary_artery_R"), 6), trunk[-1][0])
ra, rv = cham["right_cardiac_atrium"], cham["heart_right_ventricle"]
rv_apexish = rv + AX * 0.012
right_core = [(ra, chamber_r("right_cardiac_atrium"), "in"), (tv["c"], tv["R"] * 0.7, "valve_av"),
              (rv_apexish, chamber_r("heart_right_ventricle"), "out"), (pv["c"], pv["R"] * 0.7, "valve_sl")]
paths["right_svc_L"] = [(p, r, "in") for p, r in svc] + right_core + [(p, r, "out") for p, r in trunk + pa_l]
paths["right_svc_R"] = [(p, r, "in") for p, r in svc] + right_core + [(p, r, "out") for p, r in trunk + pa_r]
if ivc:
    paths["right_ivc_L"] = [(p, r, "in") for p, r in ivc] + right_core + [(p, r, "out") for p, r in trunk + pa_l]
# lewa: 4 żyły płucne -> LP -> mitralna -> LK -> aortalna -> aorta wstępująca -> łuk -> zstępująca
mv, av = VALVE_INFO["mitral_valve"], VALVE_INFO["aortic_valve"]
la, lvc = cham["left_cardiac_atrium"], cham["heart_left_ventricle"]
asc = orient(slice_centerline(V_("ascending_aorta"), 6), av["c"])
arch = orient(slice_centerline(V_("aortic_arch"), 10, arch=True), asc[-1][0])
desc = orient(slice_centerline(V_("descending_aorta_a"), 6), arch[-1][0]) if V_("descending_aorta_a") else []
left_core = [(la, chamber_r("left_cardiac_atrium"), "in"), (mv["c"], mv["R"] * 0.7, "valve_av"),
             (lvc + AX * 0.02, chamber_r("heart_left_ventricle"), "out"), (av["c"], av["R"] * 0.7, "valve_sl")]
for pvn in ("pulmonary_vein_R_inf", "pulmonary_vein_R_sup", "pulmonary_vein_L_inf", "pulmonary_vein_L_sup"):
    if not V_(pvn): continue
    seg = orient(slice_centerline(V_(pvn), 5), la)[::-1]  # od końca daleko od przedsionka
    if (seg[0][0] - la).length < (seg[-1][0] - la).length: seg = seg[::-1]
    paths["left_" + pvn] = [(p, r, "in") for p, r in seg] + left_core + [(p, r, "out") for p, r in asc + arch + desc]


def to_gl(p):  # Blender Z-up -> glTF Y-up, środek serca w (0,0,0)
    q = p - CEN
    return [round(q.x, 5), round(q.z, 5), round(-q.y, 5)]


paths_out = {k: [{"p": to_gl(p), "r": round(r, 5), "seg": s} for p, r, s in v] for k, v in paths.items()}
LOG["paths"] = {k: len(v) for k, v in paths_out.items()}

# ------------------------------------------------------------------ AO do koloru wierzchołków (Cycles, poziom „film” bez kosztu w czasie działania)
try:
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 16
    scene.cycles.device = 'CPU'
    scene.render.bake.target = 'VERTEX_COLORS'
    w = bpy.data.worlds.new("w"); scene.world = w
    m = bpy.data.materials.new("bake"); m.use_nodes = True
    allobj = list(H.values()) + list(V.values())
    for o in allobj:
        o.data.materials.clear(); o.data.materials.append(m)
        if "AO" not in o.data.color_attributes:
            o.data.color_attributes.new("AO", 'BYTE_COLOR', 'POINT')
        o.data.color_attributes.active_color = o.data.color_attributes["AO"]
    scene.world.light_settings.distance = 0.02
    t = time.time()
    for o in allobj:  # osobno, żeby ściany jam nie zasłaniały się wzajemnie zbyt mocno? -> razem: realny kontekst
        o.select_set(True)
    bpy.context.view_layer.objects.active = allobj[0]
    bpy.ops.object.bake(type='AO')
    LOG["ao_bake_s"] = round(time.time() - t, 1)
except Exception as e:
    LOG["ao_error"] = str(e)

# ------------------------------------------------------------------ przesunięcie do środka i eksport
for o in list(H.values()) + list(V.values()):
    o.data.transform(Matrix.Translation(-CEN), shape_keys=True)  # baza i wszystkie kształty razem
    o["atl_source"] = "hubmap"
    o["atl_license"] = "CC BY 4.0 HuBMAP CCF"
for o in bpy.data.objects: o.select_set(False)
for o in list(H.values()) + list(V.values()): o.select_set(True)
glb = os.path.join(OUT, "heart_m2.glb")
kw = dict(filepath=glb, export_format='GLB', use_selection=True, export_morph=True, export_morph_normal=False,
          export_apply=False, export_extras=True, export_copyright="HuBMAP CCF 3D Reference Object Library, CC BY 4.0")
for extra in ({"export_vertex_color": 'ACTIVE'}, {"export_colors": True}, {}):
    try:
        bpy.ops.export_scene.gltf(**kw, **extra); LOG["export_kw"] = list(extra); break
    except TypeError:
        continue
with open(os.path.join(OUT, "heart_m2_paths.json"), "w") as f:
    json.dump({"units": "m", "frame": "glTF Y-up, srodek serca = 0", "valves": {k: {"c": to_gl(v["c"]), "R": round(v["R"], 5)} for k, v in VALVE_INFO.items()},
               "axis": {"base": to_gl(base), "apex": to_gl(apex)}, "paths": paths_out}, f)
LOG["tris"] = sum(len(o.data.polygons) for o in list(H.values()) + list(V.values()))
LOG["build_s"] = round(time.time() - T0, 1)
with open(os.path.join(OUT, "heart_m2_log.json"), "w") as f:
    json.dump(LOG, f, indent=1, default=str)
print("M2DONE", json.dumps(LOG, default=str)[:1500])
