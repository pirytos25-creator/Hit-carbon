# Klatki koncepcyjne „Gablot narządów” (plan NARZADY_PLAN.md). Tylko render poglądowy, nie eksport do aplikacji.
# Geometria: wyłącznie HuBMAP (CC BY 4.0), bez Z-Anatomy w tym samym pliku/ujęciu. Kolory: palette.json.
# Uruchomienie (przez slot): blender --background --factory-startup --python blender/atlas/concept_narzady.py -- <out_dir> [klatka ...]
import bpy, bmesh, sys, os, math, json
from mathutils import Vector

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = ARGS[0] if ARGS else os.path.abspath("concept_out")
ONLY = set(ARGS[1:])
RAW = os.environ.get("ATLAS_RAW", r"C:\Users\piryt\Desktop\Luźny Vibecoading\HIIt\atlas_raw")
HUB = os.path.join(RAW, "hubmap")
os.makedirs(OUT, exist_ok=True)
STATS = {}


def lin(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c) + (1.0,)


def mix(a, b, t):
    a, b = a.lstrip("#"), b.lstrip("#")
    ca = [int(a[i:i + 2], 16) for i in (0, 2, 4)]
    cb = [int(b[i:i + 2], 16) for i in (0, 2, 4)]
    return "#" + "".join(f"{round(x + (y - x) * t):02x}" for x, y in zip(ca, cb))


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    for eng in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
        try:
            s.render.engine = eng
            break
        except TypeError:
            pass
    s.render.resolution_x, s.render.resolution_y = 1280, 960
    s.render.film_transparent = True
    s.render.image_settings.file_format = 'PNG'
    s.render.image_settings.color_mode = 'RGBA'
    s.view_settings.view_transform = 'Standard'
    try:
        s.eevee.taa_render_samples = 96
    except AttributeError:
        pass
    w = bpy.data.worlds.new("w")
    w.use_nodes = True
    bg = next(n for n in w.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs[0].default_value = lin("#2A3348")
    bg.inputs[1].default_value = 0.6
    s.world = w
    return s


def imp(name):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(HUB, name))
    objs = [o for o in bpy.data.objects if o not in before]
    for o in objs:  # spłaszcz hierarchię, zachowaj pozycje świata
        if o.parent:
            mw = o.matrix_world.copy()
            o.parent = None
            o.matrix_world = mw
    meshes = [o for o in objs if o.type == "MESH"]
    for o in objs:
        if o.type != "MESH":
            bpy.data.objects.remove(o)
    for o in meshes:
        o.name = o.name.split(".")[0]
    return {o.name: o for o in meshes}


def mat(name, hexcol, alpha=1.0, cut_hex=None, emit=0.0):
    """Matowy materiał; tył ściany (widoczny po przecięciu) w kolorze powierzchni cięcia."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Roughness"].default_value = 0.72
    try:
        bsdf.inputs["Specular IOR Level"].default_value = 0.25
    except KeyError:
        pass
    if cut_hex:
        geo = nt.nodes.new("ShaderNodeNewGeometry")
        mx = nt.nodes.new("ShaderNodeMix")
        mx.data_type = 'RGBA'
        mx.inputs[6].default_value = lin(hexcol)
        mx.inputs[7].default_value = lin(cut_hex)
        nt.links.new(geo.outputs["Backfacing"], mx.inputs[0])
        nt.links.new(mx.outputs[2], bsdf.inputs["Base Color"])
    else:
        bsdf.inputs["Base Color"].default_value = lin(hexcol)
    if emit > 0:
        bsdf.inputs["Emission Color"].default_value = lin(hexcol)
        bsdf.inputs["Emission Strength"].default_value = emit
    if alpha < 1:
        bsdf.inputs["Alpha"].default_value = alpha
        try:
            m.surface_render_method = 'BLENDED'
        except AttributeError:
            m.blend_method = 'BLEND'
        m.use_backface_culling = True
    m.use_backface_culling = m.use_backface_culling if alpha < 1 else False
    return m


def paint(o, m):
    o.data.materials.clear()
    o.data.materials.append(m)


def bbox(objs):
    pts = [o.matrix_world @ v.co for o in objs for v in o.data.vertices]  # z wierzchołków: bound_box nie odświeża się po cięciu
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return mn, mx


def cut(objs, origin, normal):
    """Usuwa część siatki po stronie +normal (jak płaszczyzna przycięcia w shaderze)."""
    for o in objs:
        me = o.data
        bm = bmesh.new()
        bm.from_mesh(me)
        inv = o.matrix_world.inverted()
        co = inv @ Vector(origin)
        no = (inv.to_3x3().transposed().inverted() @ Vector(normal)).normalized()
        geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
        bmesh.ops.bisect_plane(bm, geom=geom, plane_co=co, plane_no=no, clear_outer=True)
        bm.to_mesh(me)
        bm.free()


def lights(target, dist):
    t = Vector(target)
    for name, off, energy, size, col in (
        ("key", (-0.9, -1.0, 0.8), 260, 0.6, "#FFF4E8"),
        ("fill", (1.0, -0.7, 0.1), 90, 0.9, "#DDE6FF"),
        ("rim", (0.3, 1.2, 0.9), 200, 0.5, "#CFE0FF"),
    ):
        ld = bpy.data.lights.new(name, 'AREA')
        ld.energy = energy * dist * dist * 0.12
        ld.size = size * dist
        ld.color = lin(col)[:3]
        lo = bpy.data.objects.new(name, ld)
        bpy.context.scene.collection.objects.link(lo)
        lo.location = t + Vector(off) * dist
        d = t - lo.location
        lo.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def camera(target, direction, dist, fov=16, up='Z'):
    cd = bpy.data.cameras.new("cam")
    cd.lens_unit = 'FOV'
    cd.angle = math.radians(fov)
    cd.clip_start = 0.01
    co = bpy.data.objects.new("cam", cd)
    bpy.context.scene.collection.objects.link(co)
    t = Vector(target)
    d = Vector(direction).normalized()
    co.location = t - d * dist
    co.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.camera = co


def fit_dist(mn, mx, fov=16, margin=1.25, aspect=1280 / 960):
    size = mx - mn
    r = max(size.x, size.y, size.z)
    vhalf = math.atan(math.tan(math.radians(fov) / 2) / aspect)  # kąt podany dla dłuższego boku (poziomego)
    return margin * r / 2 / math.tan(vhalf) + r / 2


def render(name):
    p = os.path.join(OUT, name + ".png")
    bpy.context.scene.render.filepath = p
    bpy.ops.render.render(write_still=True)
    print("RENDER", p)


def tri_count(objs):
    n = 0
    for o in objs:
        o.data.calc_loop_triangles()
        n += len(o.data.loop_triangles)
    return n


# ---------------------------------------------------------------- SERCE
ART, VEIN = "#D93240", "#3E6FD8"
OXY_PARTS = ("left", "mitral", "aortic")  # strona lewa: krew natleniona (konwencja szkolna)


def heart(variant):
    reset()
    h = imp("VH_M_Heart.glb")
    v = imp("VH_M_Blood_Vasculature_Heart.glb")
    STATS["heart_parts"] = sorted(h)
    STATS["heart_tris"] = tri_count(h.values())
    STATS["heart_vessel_tris"] = tri_count(v.values())
    mn, mx = bbox(list(h.values()))
    c = (mn + mx) / 2
    STATS["heart_bbox_m"] = [round(x, 4) for x in (mx - mn)]
    STATS["heart_center"] = [round(x, 4) for x in c]
    nm = {}
    for n, o in h.items():
        bm = bmesh.new(); bm.from_mesh(o.data)
        nm[n.replace("VH_M_", "")] = [sum(1 for e in bm.edges if not e.is_manifold), len(bm.edges)]
        bm.free()
    STATS["heart_nonmanifold_edges"] = nm
    cut_col = "#F2C9C4"
    for n, o in h.items():
        if "valve" in n:
            col = "#F3E6D8"
        elif "papillary" in n:
            col = mix(ART, "#FFFFFF", 0.25)
        elif "septum" in n:
            col = mix(ART, "#000000", 0.15)
        elif "right" in n:
            col = mix(VEIN, ART, 0.25) if variant != "plain" else mix(ART, "#000000", 0.25)
        else:
            col = ART
        if variant == "hover" and n != "VH_M_heart_left_ventricle":
            paint(o, mat(n, mix(col, "#1A2238", 0.72), cut_hex=mix(cut_col, "#1A2238", 0.72)))
        elif variant == "hover":
            paint(o, mat(n, mix(ART, "#FFFFFF", 0.3), cut_hex="#FFE3DE", emit=0.45))
        else:
            paint(o, mat(n, col, cut_hex=cut_col))
    keep_v = ("aort", "pulmonary", "vena_cava", "brachiocephalic_vein", "coronary", "cardiac", "descending",
              "marginal", "diagonal", "carotid", "subclavian", "brachiocephalic_artery", "sinus", "oblique")
    for n, o in v.items():
        if not any(k in n for k in keep_v):
            bpy.data.objects.remove(o)
            continue
        if "pulmonary_vein" in n or "aort" in n or "artery" in n or "carotid" in n or "subclavian" in n \
                or "descending" in n or "marginal" in n or "diagonal" in n:
            col = ART
        else:
            col = VEIN
        if "pulmonary_artery" in n or "pulmonary_trunk" in n:
            col = VEIN  # pień płucny: krew odtleniona
        if variant == "hover":
            col = mix(col, "#1A2238", 0.72)
        paint(o, mat(n, col))
        cut([o], (0, 0, mn.z - 0.015), (0, 0, -1))  # naczynia tylko przy sercu
        cut([o], (0, 0, mx.z + 0.035), (0, 0, 1))
    if variant in ("cut", "hover"):
        # przekrój czołowy przez środek komór (płaszczyzna przycięcia shadera), naczynia zostają tylko za płaszczyzną
        cut(list(h.values()), c + Vector((0, 0.004, 0)), (0, -1, 0))
        for o in [o for o in bpy.data.objects if o.type == "MESH" and o.name in v]:
            cut([o], c + Vector((0, 0.004, 0)), (0, -1, 0))
    mn2, mx2 = bbox([o for o in bpy.data.objects if o.type == "MESH"])
    tgt = (mn2 + mx2) / 2
    d = fit_dist(mn2, mx2, margin=1.1)
    camera(tgt, (0, 1, 0), d)
    lights(tgt, d * 0.5)
    render({"plain": "serce_1_calosc", "cut": "serce_2_przekroj", "hover": "serce_3_najechanie_lewa_komora"}[variant])


# ---------------------------------------------------------------- NERKA
URI = "#276777"


def kidney():
    reset()
    k = imp("VH_M_Kidney_L.glb")
    v = imp("VH_M_Blood_Vasculature_Kidney.glb")
    STATS["kidney_parts"] = sorted(k)
    STATS["kidney_tris"] = tri_count(k.values())
    mn, mx = bbox(list(k.values()))
    c = (mn + mx) / 2
    STATS["kidney_bbox_m"] = [round(x, 4) for x in (mx - mn)]
    for n, o in k.items():
        if "column" in n:  # kolumny nerkowe przeplatają się z korą: w przekroju dają labirynt, w gablocie jako jedna „kora”
            continue
        if "capsule" in n:
            col = mix(URI, "#FFFFFF", 0.55)
        elif "cortex" in n:
            col = mix("#B5534A", URI, 0.15)  # kora: ciemnoczerwona (silnie ukrwiona) - do sprawdzenia przez Reżysera
        elif "pyramid" in n:
            col = "#8E2F45"
        elif "papilla" in n:
            col = "#E7C27A"
        else:  # wnęka / miedniczka
            col = "#E8D9A8"
        paint(o, mat(n, col, cut_hex=mix(col, "#FFFFFF", 0.35)))
    for n, o in v.items():
        if not n.endswith("_L") and "left" not in n:
            bpy.data.objects.remove(o)
            continue
        paint(o, mat(n, VEIN if "vein" in n else ART))
    for n in [n for n in k if "column" in n]:
        bpy.data.objects.remove(k.pop(n))
    cut(list(k.values()), c, (0, -1, 0))
    for o in [o for o in bpy.data.objects if o.type == "MESH" and o.name in v]:
        cut([o], (c.x - 0.07, 0, 0), (-1, 0, 0)) if c.x > 0 else cut([o], (c.x + 0.07, 0, 0), (1, 0, 0))
    mn2, mx2 = bbox([o for o in bpy.data.objects if o.type == "MESH"])
    c2 = (mn2 + mx2) / 2
    d = fit_dist(mn2, mx2, margin=1.1)
    camera(c2, (0, 1, 0), d)
    lights(c2, d * 0.5)
    render("nerka_1_przekroj")


# ---------------------------------------------------------------- WĄTROBA
DIG = "#B4B474"
SEG = {  # segmenty Couinauda wg nazw węzłów HuBMAP (numeracja do potwierdzenia przez agenta faktów)
    "caudate_lobe_of_liver": "#8C5A2C",
    "left_posterolateral_segment": "#E2C94A", "left_anterolateral_segment": "#F0DE8A",
    "left_superiomedial_segment": "#C9A040", "left_inferomedial_segment": "#B8B060",
    "quadrate_lobe_of_liver": "#D8C870",
    "right_anteroinferior_segment": "#8FA04A", "right_anterosuperior_segment": "#B5C46A",
    "right_posteroinferior_segment": "#6E8A3A", "right_posterosuperior_segment": "#A0B050",
}


def liver(variant):
    reset()
    L = imp("VH_M_Liver.glb")
    V = imp("VH_M_Blood_Vasculature_Liver.glb")
    G = imp("VH_M_Gallbladder.glb")
    B = imp("VH_M_Biliary_Tree.glb")
    STATS["liver_parts"] = sorted(L)
    STATS["liver_tris"] = tri_count(L.values())
    mn, mx = bbox(list(L.values()))
    c = (mn + mx) / 2
    STATS["liver_bbox_m"] = [round(x, 4) for x in (mx - mn)]
    for n, o in L.items():
        key = n.replace("VH_M_", "")
        if variant == "segments":
            if key in SEG:
                paint(o, mat(n, SEG[key]))
            else:
                bpy.data.objects.remove(o)
        else:
            if key == "liver_capsule":
                paint(o, mat(n, mix("#8E4A3A", DIG, 0.35), alpha=0.22))
            else:
                bpy.data.objects.remove(o)
    for n, o in V.items():
        if "portal" in n:
            col = "#7B5FC7"  # krew wrotna: z jelit (osobna barwa do uzgodnienia z Reżyserem)
        elif "vein" in n:
            col = VEIN
        else:
            col = ART
        if "celiac" in n:
            bpy.data.objects.remove(o)
            continue
        paint(o, mat(n, col, emit=0.1 if variant == "flow" else 0))
    for n, o in {**G, **B}.items():
        if "pancrea" in n or "ampulla" in n:
            bpy.data.objects.remove(o)
            continue
        paint(o, mat(n, "#6FA84A", emit=0.1 if variant == "flow" else 0))
    d = fit_dist(mn, mx, margin=1.2)
    camera(c, (0, 1, 0), d)
    lights(c, d * 0.5)
    render({"segments": "watroba_1_segmenty", "flow": "watroba_2_krew_i_zolc"}[variant])


# ---------------------------------------------------------------- MÓZG
LOBES = {
    "czolowy": ("precentral", "frontal", "gyrus_rectus", "orbital_gyrus", "paracentral_lobule_rostral",
                "frontomarginal", "rostral_gyrus", "paracingulate", "frontal_pole"),
    "ciemieniowy": ("postcentral", "supraparietal", "supramarginal", "angular", "precuneus",
                    "paracentral_lobule_caudal", "parietal_operculum"),
    "skroniowy": ("temporal", "Heschl", "planum", "perirhinal"),
    "potyliczny": ("occipital", "cuneus", "lingual"),
    "wyspa": ("insular", "limen_insula"),
    "limbiczny": ("cingulate", "ingulo", "parahippocampal", "hippocampus", "subcallosal", "gyrus_ambiens",
                  "amygdal", "nucleus_L", "nucleus_R", "olfactory", "piriform"),
    "mozdzek": ("cerebell", "vermis"),
    "pien": ("pons", "pontine", "medulla", "olive", "midbrain", "nigra", "colliculus", "peduncle_crus",
             "red_nucleus", "pretectal", "aqueduct", "fourth_ventricle", "central_canal"),
    "miedzymozgowie": ("thalam", "HTH", "hypothalamus", "pineal", "habenular", "zona_incerta", "geniculate",
                       "subthalamic", "pulvinar", "reuniens", "centromedian", "parafascicular", "midline_nuclear"),
    "jadra_podstawy": ("caudate", "putamen", "pallidus", "accumbens", "claustrum", "basal_forebrain", "septal",
                       "stria_terminalis"),
    "istota_biala": ("white_matter", "callosum", "fornix", "commissure", "tract", "radiation", "optic_chiasm"),
    "komory": ("ventricle",),
}
LOBE_COL = {"czolowy": "#9B7BEA", "ciemieniowy": "#C3AEF5", "skroniowy": "#7A5CC9", "potyliczny": "#B39CF0",
            "wyspa": "#E3D7FB", "limbiczny": "#D98FB0", "mozdzek": "#6F8FD8", "pien": "#E8B23A",
            "miedzymozgowie": "#E0A6C8", "jadra_podstawy": "#8FD0C0", "istota_biala": "#E9E4F5", "komory": "#4FC3E0"}


def lobe_of(n):
    k = n.replace("Allen_", "").replace("VH_M_", "")
    for lobe in ("komory", "mozdzek", "pien", "miedzymozgowie", "jadra_podstawy", "istota_biala", "wyspa",
                 "limbiczny", "skroniowy", "potyliczny", "ciemieniowy", "czolowy"):
        if any(p in k for p in LOBES[lobe]):
            return lobe
    return None


def brain(variant):
    reset()
    b = imp("Allen_M_Brain.glb")
    STATS["brain_regions"] = len(b)
    STATS["brain_tris"] = tri_count(b.values())
    groups = {}
    for n in b:
        groups.setdefault(lobe_of(n), []).append(n)
    STATS["brain_groups"] = {k or "BRAK": len(v) for k, v in groups.items()}
    STATS["brain_unassigned"] = groups.get(None, [])
    mn, mx = bbox(list(b.values()))
    c = (mn + mx) / 2
    STATS["brain_bbox_m"] = [round(x, 4) for x in (mx - mn)]
    if variant == "lobes":
        for n, o in b.items():
            lobe = lobe_of(n) or "istota_biala"
            paint(o, mat(n, LOBE_COL[lobe]))
        d = fit_dist(mn, mx, margin=1.15)
        camera(c, (-1, 0, 0), d)  # z lewej strony ciała (+X) patrzymy w -X: półkula lewa
        lights(c, d * 0.5)
        render("mozg_1_platy_bok")
    else:
        s = imp("VH_M_Spinal_Cord.glb")
        path = ("precentral_gyrus_L", "cerebral_peduncle_crus_cerebri_L", "basilar_part_of_pons_L",
                "pyramidal_part_of_medulla_oblongata_L")
        for n, o in b.items():
            if any(n.endswith(p) for p in path):
                paint(o, mat(n, "#E8B23A", emit=0.35))
            else:
                paint(o, mat(n, mix(LOBE_COL[lobe_of(n) or "istota_biala"], "#1A2238", 0.4), alpha=0.07))
        keep = [o for n, o in s.items() if any(t in n for t in ("C1_", "C2_", "C3_", "C4_", "C5_", "C6_"))]
        for o in s.values():
            if o in keep:
                paint(o, mat(o.name, "#E8B23A", emit=0.2))
            else:
                bpy.data.objects.remove(o)
        mn2, mx2 = bbox(list(b.values()) + keep)
        c2 = (mn2 + mx2) / 2
        d = fit_dist(mn2, mx2, margin=1.05)
        camera(c2, (0.35, 1, -0.05), d)  # z przodu, lekko z lewej
        lights(c2, d * 0.5)
        render("mozg_2_droga_ruchowa")


JOBS = {
    "serce_1": lambda: heart("plain"), "serce_2": lambda: heart("cut"), "serce_3": lambda: heart("hover"),
    "nerka_1": kidney, "watroba_1": lambda: liver("segments"), "watroba_2": lambda: liver("flow"),
    "mozg_1": lambda: brain("lobes"), "mozg_2": lambda: brain("path"),
}
for k, fn in JOBS.items():
    if ONLY and k not in ONLY:
        continue
    try:
        fn()
    except Exception as e:  # klatka koncepcyjna nie blokuje pozostałych
        import traceback
        traceback.print_exc()
        STATS.setdefault("errors", []).append(f"{k}: {e}")
with open(os.path.join(OUT, "stats.json"), "w", encoding="utf-8") as f:
    json.dump(STATS, f, ensure_ascii=False, indent=1)
print("DONE", json.dumps(STATS.get("errors", [])))
