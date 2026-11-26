"""
Eksport GLB dla PROTOTYPÓW 3D atlasu (agent wizualizacji; nie zastępuje przyszłego atlas_export_glb.py integratora).

  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/proto_export_glb.py

Wynik (poza Gitem): prototypes/atlas3d/_assets/raw/{za_*,hra_*}.glb + ids_*.json + export_report.json.
Potem: node prototypes/atlas3d/tools/pack_assets.mjs (gltf-transform: meshopt + kwantyzacja).

Zasady:
- model §3.2: scalone siatki (plik × warstwa), ID struktury w KAŻDYM wierzchołku (atrybut _ID, float),
  tabela ID -> {key, system, level} w extras węzła i w ids_<plik>.json. Klucz = ID siatki z modelu §3.1:
  "za:<obiekt Z-Anatomy>" albo "hra:<plik>/<węzeł>".
- licencje: pliki za_* (Z-Anatomy, CC BY-SA 4.0) i hra_* (HuBMAP, CC BY 4.0) nigdy razem.
  Struktury NC blokuje al.license_check (nerka, ucho wewnętrzne); nerki biorą się z HuBMAP.
- krzywe Z-Anatomy (naczynia, nerwy) -> rury o małej rozdzielczości (bevel_resolution 0-1).
- poziomy pracy w sprincie skopiowane z reguł plansz (plate_miesniowy / plate_krwionosny / plate_nerwowy);
  to ilustracja w stopniach (model §3.1), nie fakt.
Startup.blend NIGDY nie jest zapisywany. atlas_lib.py tylko importowany.
"""
import json
import os
import re
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402

T0 = time.time()
OUT = os.path.join(al.ROOT, "prototypes", "atlas3d", "_assets", "raw")
os.makedirs(OUT, exist_ok=True)
REPORT = {"files": {}, "notes": []}

ZA_LICENSE = "Z-Anatomy (CC BY-SA 4.0, z BodyParts3D). Utwór zależny: decymacja, scalenie, rury z krzywych. https://www.z-anatomy.com"
HRA_LICENSE = "HuBMAP Human Reference Atlas 3D (CC BY 4.0). Dopasowanie do Z-Anatomy: atlas_lib.align_hubmap. https://humanatlas.io"

# budżety trójkątów na warstwę (desktop ≤ 1,5 mln razem, model §3.2)
TARGET = {"bone": 220_000, "muscle": 320_000, "viscera": 150_000, "skin": 40_000, "heart": 25_000, "brain": 90_000,
          "nervecore": 25_000, "hra_kidney": 30_000}

CV = "5: Cardiovascular system"
NERV = "7: Nervous system & Sense organs"
VIS = "8: Visceral systems"
MUS = "4: Muscular system"


def base(n):
    return re.sub(r"\.\d{3}$", "", n)


def side_strip(n):
    return re.sub(r"\.(l|r)$", "", base(n))


# ------------------------------------------------------------------ zbiory struktur
# (obiekt, system, poziom w sprincie: liczba 0-1 albo "dim" = jak w spoczynku)
def muscles():
    PRIMARY = [r"^Gluteus maximus muscle", r"^Rectus femoris muscle", r"^Vastus lateralis", r"^Vastus medialis",
               r"^Vastus intermedius", r"head of biceps femoris", r"^Biceps femoris", r"^Semitendinosus",
               r"^Semimembranosus", r"head of gastrocnemius", r"^Soleus", r"^Psoas major", r"^Iliacus", r"^Tibialis anterior"]
    SECONDARY = [r"^Gluteus medius", r"^Adductor magnus", r"^Adductor longus", r"^Rectus abdominis",
                 r"abdominal oblique muscle", r"part of deltoid muscle", r"^Latissimus dorsi", r"^Iliocostalis",
                 r"^Longissimus", r"^Gracilis", r"^Sartorius", r"^Tensor fasciae latae", r"^Fibularis longus"]
    RESP = [r"^Diaphragm", r"^External intercostal muscles", r"^Scalenus (anterior|medius|posterior)"]
    ms = al.find_meshes(collection=MUS, exclude=[r"^Rectus sheath", r"^Linea alba", r"bursa", r"fascia", r"sheath"],
                        exclude_materials=al.MUSCLE_COVER_MATERIALS)
    out = []
    for o in ms:
        n = o.name
        if any(re.search(p, n) for p in RESP):
            out.append((o, "resp", 1.0 if "Diaphragm" in n else 0.75))
        elif any(re.search(p, n) for p in PRIMARY):
            out.append((o, "muscle", 1.0))
        elif any(re.search(p, n) for p in SECONDARY):
            out.append((o, "muscle", 0.6))
        else:
            out.append((o, "muscle", "dim"))
    return out


GREAT = r"^(Ascending aorta|Aortic arch|Thoracic aorta|Abdominal aorta|Superior vena cava|Inferior vena cava|" \
        r"Brachiocephalic trunk|(Left|Right) brachiocephalic vein|Azygos vein)"
LEG = r"(Common|External) iliac (artery|vein)|femoral|popliteal|tibial|fibular|saphenous|plantar|dorsalis pedis|" \
      r"genicular|arcuate|metatarsal|tarsal|calcaneal|digital (arteries|veins) of foot|venous arch of foot|patellar"
VISCERAL = r"portal|mesenteric|splenic|hepatic|gastric|gastro|colic|pancrea|renal|suprarenal|coeliac|testicular|sigmoid|" \
           r"appendic|anorectal|rectal|cystic|phrenic|marginal artery|ileal"
VESSEL_LEVEL = {"leg": 1.0, "coronary": 1.0, "great": 1.0, "pulmonary": 1.0, "arm": 0.8, "neck": 0.7, "pelvic": 0.6,
                "wall": "dim", "visceral": "dim"}


def vessel_group(o):
    mat = o.data.materials[0].name if o.data.materials and o.data.materials[0] else ""
    cols = {c.name for c in o.users_collection}
    n = o.name
    if mat == "Pulmonary artery":
        return "vein", "pulmonary"
    if mat == "Pulmonary vein":
        return "artery", "pulmonary"
    s = "vein" if mat == "Vein" else "artery"
    if cols & {"Arteries of heart", "Cardiac veins"} or re.search(r"coronary|cardiac vein|interventricular|of heart|Coronary sinus", n):
        return s, "coronary"
    if re.search(GREAT, n):
        return s, "great"
    if cols & {"Left lower limb", "Right lower limb", "Left foot", "Right foot"} or re.search(LEG, n, re.I):
        return s, "leg"
    if cols & {"Left upper limb", "Right upper limb"} or re.search(r"subclavian|axillary", n, re.I):
        return s, "arm"
    if cols & {"Head", "Neck"}:
        return s, "neck"
    if re.search(r"internal iliac|gluteal|pudendal|sacral|obturator|penis|iliolumbar|vesical|division of internal", n, re.I):
        return s, "pelvic"
    if re.search(VISCERAL, n, re.I):
        return s, "visceral"
    return s, "wall"


HIDE_V = re.compile(r"ophthalm|retinal|ciliary|lacrimal|supraorbital|supratrochlear|palpebral|ethmoidal|dorsal nasal", re.I)


def vessels():
    cs = al.find_curves(collection=CV, materials=("Artery", "Vein", "Pulmonary artery", "Pulmonary vein"))
    cs = [o for o in cs if not HIDE_V.search(o.name)]
    out = []
    for o in cs:
        s, g = vessel_group(o)
        lvl = VESSEL_LEVEL[g]
        if s == "vein" and isinstance(lvl, float):
            lvl = round(lvl * 0.92, 2)
        radii = [p.radius for sp in o.data.splines for p in (sp.bezier_points if sp.type == 'BEZIER' else sp.points)]
        med = float(np.median(radii)) if radii else 1.0
        d = o.data
        d.bevel_depth = max(d.bevel_depth * 1.15, 0.0008 / max(med, 0.1)) * (0.6 if g == "wall" else 1.0)
        d.bevel_mode = 'ROUND'
        big = g in ("great", "coronary", "pulmonary") or d.bevel_depth * med > 0.003
        d.bevel_resolution = 1 if big else 0   # 0 = przekrój czworokątny (cienkie), 1 = sześciokątny
        d.resolution_u = 3 if big else 2
        d.use_fill_caps = False
        out.append((o, s, lvl, g))
    return out


LOWER_MOTOR = [(r"^Sciatic nerve$", 0.0048), (r"^Tibial nerve$", 0.0034), (r"^Common fibular nerve$", 0.0028),
               (r"^Femoral nerve$", 0.0034), (r"^Deep fibular nerve$", 0.0018), (r"^Superficial fibular nerve$", 0.0016),
               (r"^Obturator nerve$", 0.0020), (r"^Superior gluteal nerve$", 0.0018), (r"plantar nerve$", 0.0015)]


def nerves():
    cs = [o for o in bpy.data.collections[NERV].all_objects
          if o.type == 'CURVE' and not re.search(r"curve|Central canal", o.name) and not al.is_nc(o)]
    out = []
    for o in cs:
        b = side_strip(o.name)
        hit = next((bev for p, bev in LOWER_MOTOR if re.search(p, b)), None)
        if hit:
            lvl, bev = 1.0, hit
        elif re.search(r"^Sympathetic (trunk|nerves)$", b):
            lvl, bev = 1.0, 0.0018
        elif re.search(r"^(Anterior|Posterior) root of spinal nerve$|^Cauda equina$", b):
            lvl, bev = 0.9, 0.0009
        elif re.search(r"^Intercostal nerves$", b):
            lvl, bev = 0.7, 0.0011
        elif re.search(r"\((I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\)$", b):
            lvl, bev = 0.35, 0.0008
        else:
            lvl, bev = 0.45, 0.0010
        pts = [p for sp in o.data.splines for p in (sp.bezier_points if sp.type == 'BEZIER' else sp.points)]
        if pts:
            med = float(np.median([p.radius for p in pts])) or 1.0
            for p in pts:
                p.radius = min(1.3, max(0.7, p.radius / med))
        d = o.data
        d.bevel_depth, d.bevel_mode, d.bevel_resolution, d.resolution_u, d.use_fill_caps = bev, 'ROUND', 0, 2, False
        out.append((o, "nerve", lvl))
    return out


def brain_and_cord():
    ms = al.find_meshes(collection=NERV)
    brain, core = [], []
    for o in ms:
        n = o.name
        top = al.world_bbox([o])[1].z
        if re.search(r"eye|lens|retina|cornea|sclera|iris|choroid|vitreous|ossicle|malleus|incus|stapes|tympan|auricle|cartilage of", n, re.I):
            continue  # narządy zmysłów: poza zakresem atlasu sprintu
        if top > 1.42 and not re.search(r"Spinal", n):
            lvl = 1.0 if re.search(r"precentral|motor", n, re.I) else (0.6 if re.search(r"cerebell|pons|medulla|midbrain", n, re.I) else "dim")
            brain.append((o, "brain", lvl))
        else:
            core.append((o, "nerve", 0.9 if re.search(r"Spinal dura|ganglion", n, re.I) else 0.6))
    return brain, core


def viscera():
    ms = al.find_meshes(collection=VIS)
    out = []
    for o in ms:
        n = o.name
        if re.search(r"lung|bronch|trachea|lary|epiglott|thyroid cartilage|cricoid|arytenoid|pleura", n, re.I):
            s, lvl = "resp", (1.0 if re.search(r"lung|lobe", n, re.I) else 0.8)
        elif re.search(r"ureter|bladder|urethra", n, re.I):
            s, lvl = "urinary", "dim"
        elif re.search(r"testis|epididym|prostate|seminal|ductus deferens|penis|scrot|spermatic|corpus (cavernosum|spongiosum)", n, re.I):
            s, lvl = "repro", "dim"
        elif re.search(r"thyroid gland|parathyroid|suprarenal|pituitary|pineal|thymus", n, re.I):
            s, lvl = "endo", (1.0 if "uprarenal" in n else 0.5)
        elif re.search(r"spleen|tonsil|lymph", n, re.I):
            s, lvl = "lymph", 0.5
        elif re.search(r"liver|hepat", n, re.I):
            s, lvl = "digest", 1.0   # cykl Cori po pracy (plansza pokarmowa: wątroba 1.0)
        else:
            s, lvl = "digest", "dim"
        out.append((o, s, lvl))
    return out


def heart():
    return [(o, "artery", 1.0) for o in al.find_meshes(collection="Heart", include=[r"atrium$", r"ventricle$", r"^Pulmonary trunk$"])]


# ------------------------------------------------------------------ scalanie z _ID
def add_decimate(items, target):
    """Collapse na siatkach tak, żeby warstwa zmieściła się w budżecie trójkątów. Liczy trójkąty PO modyfikatorach
    (serce, mózg, rdzeń i trzewia Z-Anatomy mają podział powierzchni; liczenie z siatki bazowej dawało 2-10× za dużo)."""
    dg = bpy.context.evaluated_depsgraph_get()

    def ntri(o):
        me = o.evaluated_get(dg).data
        return len(me.loops) - 2 * len(me.polygons)
    tris = sum(ntri(o) for o, *_ in items if o.type == 'MESH')
    ratio = min(1.0, target / max(tris, 1))
    if ratio < 0.999:
        for o, *_ in items:
            if o.type == 'MESH' and ntri(o) > 240:
                m = o.modifiers.new("PROTO_dec", 'DECIMATE')
                m.decimate_type = 'COLLAPSE'
                m.ratio = max(ratio, 0.04)
                m.use_collapse_triangulate = True
    return tris, ratio


def merge_layer(items, name, file_tag, id_table, next_id):
    """items: [(obj, system, level, ...)] -> jedna siatka z atrybutem _ID. Zwraca (obj, next_id, tris)."""
    dg = bpy.context.evaluated_depsgraph_get()
    cos, tris_all, ids = [], [], []
    voff = 0
    for it in items:
        o, system, lvl = it[0], it[1], it[2]
        ev = o.evaluated_get(dg)
        try:
            me = ev.to_mesh()
        except RuntimeError:
            continue
        if me is None or len(me.vertices) == 0:
            ev.to_mesh_clear()
            continue
        me.calc_loop_triangles()
        nv, nt = len(me.vertices), len(me.loop_triangles)
        if nt == 0:
            ev.to_mesh_clear()
            continue
        co = np.empty(nv * 3, np.float32)
        me.vertices.foreach_get("co", co)
        co = co.reshape(-1, 3)
        M = np.array(ev.matrix_world, dtype=np.float32)
        co = co @ M[:3, :3].T + M[:3, 3]
        tri = np.empty(nt * 3, np.int32)
        me.loop_triangles.foreach_get("vertices", tri)
        ev.to_mesh_clear()
        sid = next_id
        next_id += 1
        c = co.mean(axis=0)
        src = o.get("atl_source", "")
        key = f"hra:{src.split(':', 1)[-1]}/{base(o.name)}" if src.startswith("hubmap") else f"{file_tag}:{o.name}"
        id_table.append({"id": sid, "key": key, "name": side_strip(o.name), "layer": name,
                         "system": system, "level": lvl, "group": it[3] if len(it) > 3 else None,
                         "center": [round(float(c[0]), 4), round(float(c[1]), 4), round(float(c[2]), 4)]})
        cos.append(co)
        tris_all.append(tri.reshape(-1, 3) + voff)
        ids.append(np.full(nv, sid, np.float32))
        voff += nv
    if not cos:
        return None, next_id, 0
    co = np.concatenate(cos)
    tri = np.concatenate(tris_all)
    idv = np.concatenate(ids)
    me = bpy.data.meshes.new(name)
    me.vertices.add(len(co))
    me.vertices.foreach_set("co", co.ravel())
    nt = len(tri)
    me.loops.add(nt * 3)
    me.loops.foreach_set("vertex_index", tri.ravel())
    me.polygons.add(nt)
    me.polygons.foreach_set("loop_start", np.arange(0, nt * 3, 3, dtype=np.int32))
    me.polygons.foreach_set("loop_total", np.full(nt, 3, np.int32))
    me.update(calc_edges=True)
    me.polygons.foreach_set("use_smooth", np.ones(nt, bool))
    attr = me.attributes.new("_ID", 'FLOAT', 'POINT')
    attr.data.foreach_set("value", idv)
    ob = bpy.data.objects.new(name, me)
    return ob, next_id, nt


def export_file(fname, layers, license_text, file_tag):
    """layers: [(nazwa warstwy, items)]. Jeden GLB = jedna licencja."""
    col = bpy.data.collections.new("PROTO_" + fname)
    bpy.context.scene.collection.children.link(col)
    id_table, next_id, objs, rep = [], 1, [], {}
    for lname, items in layers:
        objs_src = [i[0] for i in items]
        if file_tag == "za":
            al.license_check(objs_src, where=f"{fname}/{lname}")
        ob, next_id, nt = merge_layer(items, lname, file_tag, id_table, next_id)
        if ob is None:
            continue
        ob["atlas_layer"] = lname
        ob["atlas_license"] = license_text
        col.objects.link(ob)
        objs.append(ob)
        rep[lname] = {"structures": len(items), "tris": nt}
        print(f"PROTO_LAYER {fname}/{lname}: {len(items)} struktur, {nt} trójkątów ({time.time() - T0:.0f} s)")
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objs:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    path = os.path.join(OUT, fname + ".glb")
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True, export_attributes=True,
                              export_extras=True, export_materials='NONE', export_texcoords=False,
                              export_normals=True, export_yup=True, export_apply=False, export_copyright=license_text)
    with open(os.path.join(OUT, f"ids_{fname}.json"), "w", encoding="utf-8") as f:
        json.dump({"file": fname + ".glb", "license": license_text, "frame": "glTF Y-up: three(x,y,z) = Z-Anatomy(x, z, -y)",
                   "levelRule": "poziom pracy w sprincie: ilustracja w stopniach z reguł plansz (model §3.1), nie fakt",
                   "structures": id_table}, f, ensure_ascii=False)
    REPORT["files"][fname] = {"layers": rep, "bytes_raw": os.path.getsize(path), "license": license_text}
    for ob in objs:
        bpy.data.objects.remove(ob, do_unlink=True)
    print(f"PROTO_FILE {fname}: {os.path.getsize(path) / 1e6:.1f} MB")


# ------------------------------------------------------------------ przebieg
only = set(filter(None, os.environ.get("PROTO_ONLY", "").split(",")))


def want(n):
    return not only or n in only


if want("za_skeleton"):
    bones = [(o, "bone", "dim") for o in al.find_meshes(collection="1: Skeletal system")]
    print("PROTO bones", len(bones), "tris≈", add_decimate(bones, TARGET["bone"]))
    sil = al.build_silhouette()
    bpy.context.scene.collection.objects.link(sil)
    skin = [(sil, "skin", "dim")]
    print("PROTO skin", add_decimate(skin, TARGET["skin"]))
    export_file("za_skeleton", [("bone", bones), ("skin", skin)], ZA_LICENSE, "za")

if want("za_muscles"):
    mus = muscles()
    print("PROTO muscles", len(mus), add_decimate(mus, TARGET["muscle"]))
    export_file("za_muscles", [("muscle", mus)], ZA_LICENSE, "za")

if want("za_vessels"):
    ves = vessels()
    art = [v for v in ves if v[1] == "artery"]
    vei = [v for v in ves if v[1] == "vein"]
    hrt = heart()
    print("PROTO vessels", len(art), len(vei), "heart", add_decimate(hrt, TARGET["heart"]))
    export_file("za_vessels", [("artery", art), ("vein", vei), ("heart", hrt)], ZA_LICENSE, "za")

if want("za_nervous"):
    nv = nerves()
    br, core = brain_and_cord()
    print("PROTO nerves", len(nv), "brain", len(br), add_decimate(br, TARGET["brain"]), "core", len(core), add_decimate(core, TARGET["nervecore"]))
    export_file("za_nervous", [("nerve", nv), ("brain", br), ("nervecore", core)], ZA_LICENSE, "za")

if want("za_viscera"):
    vs = viscera()
    print("PROTO viscera", len(vs), add_decimate(vs, TARGET["viscera"]))
    export_file("za_viscera", [("viscera", vs)], ZA_LICENSE, "za")

if want("hra_kidney"):
    kid = al.import_glb("VH_M_Kidney_L.glb", collection="PROTO_hubmap") + al.import_glb("VH_M_Kidney_R.glb", collection="PROTO_hubmap")
    ure = al.import_glb("VH_M_Ureter_L.glb", collection="PROTO_hubmap") + al.import_glb("VH_M_Ureter_R.glb", collection="PROTO_hubmap")
    al.align_hubmap(kid + ure, "male")
    items = [(o, "urinary", "dim") for o in kid + ure]
    for o in kid + ure:
        o.name = o.name  # nazwy węzłów HuBMAP zostają
    print("PROTO hra kidney", len(items), add_decimate(items, TARGET["hra_kidney"]))
    export_file("hra_kidney", [("kidney", items)], HRA_LICENSE, "hra")

REPORT["seconds"] = round(time.time() - T0)
rp = os.path.join(OUT, "export_report.json")
old = json.load(open(rp, encoding="utf-8")) if os.path.exists(rp) and only else {"files": {}}
old["files"].update(REPORT["files"])
old["seconds_last"] = REPORT["seconds"]
with open(rp, "w", encoding="utf-8") as f:
    json.dump(old, f, ensure_ascii=False, indent=1)
print("PROTO_DONE", REPORT["seconds"], "s")
