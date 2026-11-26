"""
Eksport 3D atlasu (etap E3, kontrakt E3-0). Na bazie proto_export_glb.py (prototyp P1).

  # 1) wspólna baza (kości + sylwetka, mięśnie) - raz dla wszystkich układów
  set ATLAS3D=shared
  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend --python blender/atlas/atlas_export_glb.py
  # 2) jeden układ (nazwa jak plate_<uklad>.py)
  set ATLAS3D=krwionosny
  blender.exe ... --python blender/atlas/atlas_export_glb.py
  # 3) kompresja, manifest, bindings, kontrola:  node scripts/atlas3d_pack.mjs  &&  node scripts/atlas3d_check.mjs

Jak to działa (bez zmian w atlas_lib.py i plate_*.py):
- skrypt planszy jest uruchamiany w tym procesie (runpy), a Plate.render / Plate.write_flows3d / bpy.ops.render.render /
  subprocess.run są PODMIENIONE W PAMIĘCI: nic się nie renderuje, a zapisy do public/atlas/ trafiają do katalogu tymczasowego.
  Zostaje to, co plansza naprawdę pokazuje: plate.items (obiekt, rola, układ, poziomy), plate.extra (alpha, ctx, widoki),
  view_specs (kamera, kadr), kotwice. Dzięki temu 3D = te same struktury, role i poziomy co plansza 2D.
- siatki dzielone na pliki wg LICENCJI (za_* = Z-Anatomy CC BY-SA 4.0, hra_* = HuBMAP CC BY 4.0, nigdy razem) i RAMY:
  "body" (ciało, wspólna rama Z-Anatomy) albo "staging" (zbliżenia zbudowane w Blenderze z dala od ciała, np. x=20/30).
- obiekty z bazy wspólnej (_shared) nie są kopiowane: bindings wskazuje plik wspólny i rolę w tym układzie.
- ID siatki (meshId) wg modelu §3.1: "za:<obiekt>" albo "hra:<plik.glb>/<węzeł>"; semantykę (structureId) daje E1.
- w każdym wierzchołku atrybut _ID (numer w pliku); tabela numer -> meshId w export_<x>.json -> bindings.json.
Wynik surowy: .atlas3d_build/ (poza Gitem). Startup.blend NIGDY nie jest zapisywany.
"""
import builtins
import json
import os
import re
import runpy
import subprocess
import sys
import tempfile
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from mathutils import Vector  # noqa: E402

T0 = time.time()
MODE = os.environ.get("ATLAS3D", "").strip()
if not MODE:
    raise SystemExit("ATLAS3D=shared albo ATLAS3D=<uklad>")
BUILD = os.path.join(al.ROOT, ".atlas3d_build")
os.makedirs(BUILD, exist_ok=True)

LIC = {
    "za": "Z-Anatomy (CC BY-SA 4.0, z BodyParts3D). Utwór zależny: decymacja, scalenie siatek, rury z krzywych. https://www.z-anatomy.com",
    "hra": "HuBMAP Human Reference Atlas 3D (CC BY 4.0; NIH Visible Human / Indiana University). Dopasowanie: atlas_lib.align_hubmap. https://humanatlas.io",
}
LIC_ID = {"za": "CC-BY-SA-4.0", "hra": "CC-BY-4.0"}
KEY_VIEWS = ("front", "left", "back", "right")  # widoki kluczowe 3D (obrót poziomy co 90°)
STAGING_X = 5.0  # środek kadru dalej niż 5 m od osi ciała = scena zbliżenia poza ciałem
# zbliżenia zbudowane przy środku świata, ale NIE w ramie ciała (geometria schematyczna, np. włókna mięśnia)
STAGING_VIEWS = {"miesniowy": {"detail"}}


def base(n):
    return re.sub(r"\.\d{3}$", "", n)


def mesh_id(o):
    src = o.get("atl_source", "")
    if src.startswith("hubmap"):
        return f"hra:{os.path.basename(src.split(':', 1)[-1])}/{base(o.name)}"
    return f"za:{base(o.name)}"


def lic_of(o):
    return "hra" if o.get("atl_source", "").startswith("hubmap") else "za"


# ------------------------------------------------------------------ geometria (jak w proto_export_glb.py)
def _ntri(o, dg):
    me = o.evaluated_get(dg).data
    return len(me.loops) - 2 * len(me.polygons) if hasattr(me, "loops") else 0


def decimate_to(objs, target):
    """Collapse tak, żeby suma trójkątów PO modyfikatorach zmieściła się w budżecie. Krzywe bez decymacji."""
    dg = bpy.context.evaluated_depsgraph_get()
    meshes = [o for o in objs if o.type == 'MESH']
    tris = sum(_ntri(o, dg) for o in meshes)
    ratio = min(1.0, target / max(tris, 1))
    if ratio < 0.999:
        for o in meshes:
            if _ntri(o, dg) > 240 and not any(m.name == "ATL3D_dec" for m in o.modifiers):
                m = o.modifiers.new("ATL3D_dec", 'DECIMATE')
                m.decimate_type = 'COLLAPSE'
                m.ratio = max(ratio, 0.04)
                m.use_collapse_triangulate = True
    return tris, ratio


def light_curves(objs):
    """Rury z krzywych: grubość z planszy (bevel_depth), ale mniej ścianek i odcinków (budżet 3D)."""
    for o in objs:
        if o.type != 'CURVE':
            continue
        d = o.data
        pts = [p for sp in d.splines for p in (sp.bezier_points if sp.type == 'BEZIER' else sp.points)]
        med = float(np.median([p.radius for p in pts])) if pts else 1.0
        big = d.bevel_depth * med > 0.003
        d.bevel_resolution = min(d.bevel_resolution, 1 if big else 0)
        d.resolution_u = min(max(d.resolution_u, 1), 3 if big else 2)
        d.use_fill_caps = False


def merge(objs, name, table):
    """Jedna siatka z atrybutem _ID. table: lista meshId (indeks = _ID - 1), dopisywana."""
    dg = bpy.context.evaluated_depsgraph_get()
    cos, tris, ids = [], [], []
    voff = 0
    for o in objs:
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
        table.append(mesh_id(o))
        sid = len(table)
        cos.append(co)
        tris.append(tri.reshape(-1, 3) + voff)
        ids.append(np.full(nv, sid, np.float32))
        voff += nv
    if not cos:
        return None, 0
    co, tri, idv = np.concatenate(cos), np.concatenate(tris), np.concatenate(ids)
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
    me.attributes.new("_ID", 'FLOAT', 'POINT').data.foreach_set("value", idv)
    return bpy.data.objects.new(name, me), nt


def export_glb(fname, layers, lic, out_dir):
    """layers: [(nazwa warstwy, [obiekty])]. Jeden plik = jedna licencja. Zwraca opis pliku do manifestu."""
    if lic == "za":
        al.license_check([o for _, objs in layers for o in objs], fname)
    col = bpy.data.collections.new("ATL3D_" + fname)
    bpy.context.scene.collection.children.link(col)
    table, objs, rep = [], [], []
    for lname, src in layers:
        ob, nt = merge(src, lname, table)
        if ob is None:
            continue
        ob["atlas_layer"] = lname
        ob["atlas_license"] = LIC_ID[lic]
        col.objects.link(ob)
        objs.append(ob)
        rep.append({"layer": lname, "structures": len(src), "tris": nt})
        print(f"ATL3D_LAYER {fname}/{lname}: {len(src)} struktur, {nt} trójkątów ({time.time() - T0:.0f} s)")
    if not objs:
        return None
    # select_all(DESELECT) pomija obiekty UKRYTE: zaimportowane i ukryte siatki HuBMAP zostawały zaznaczone
    # i trafiały do pliku Z-Anatomy (mieszanie licencji, wykryte przez scripts/atlas3d_check.mjs). Odznaczamy każdy.
    for o in bpy.context.view_layer.objects:
        try:
            o.select_set(False)
        except RuntimeError:
            pass
    for ob in objs:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, fname + ".glb")
    # use_active_scene: plansze tworzą własne sceny (Plate.scene); bez tego eksporter dokłada ich zaznaczone obiekty
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True, use_active_scene=True, export_attributes=True,
                              export_extras=True, export_materials='NONE', export_texcoords=False, export_normals=True,
                              export_yup=True, export_apply=False, export_copyright=LIC[lic])
    for ob in objs:
        bpy.data.objects.remove(ob, do_unlink=True)
    print(f"ATL3D_FILE {fname}: {os.path.getsize(path) / 1e6:.1f} MB")
    return {"file": fname + ".glb", "license": LIC_ID[lic], "attribution": LIC[lic], "layers": rep, "ids": table,
            "tris": sum(r["tris"] for r in rep)}


# ------------------------------------------------------------------ tryb: baza wspólna
def run_shared():
    out = os.path.join(BUILD, "_shared")
    bones = al.find_meshes(collection="1: Skeletal system")
    decimate_to(bones, 220_000)
    sil = al.build_silhouette()
    if sil.name not in bpy.context.scene.collection.objects:
        bpy.context.scene.collection.objects.link(sil)
    decimate_to([sil], 40_000)
    muscles = al.find_meshes(collection="4: Muscular system", exclude=[r"^Rectus sheath", r"^Linea alba"],
                             exclude_materials=al.MUSCLE_COVER_MATERIALS)
    decimate_to(muscles, 320_000)
    files = [export_glb("za_skeleton", [("bone", bones), ("silhouette", [sil])], "za", out),
             export_glb("za_muscles", [("muscle", muscles)], "za", out)]
    with open(os.path.join(out, "export.json"), "w", encoding="utf-8") as f:
        json.dump({"schemaVersion": 1, "mode": "shared", "files": [x for x in files if x]}, f, ensure_ascii=False)


# ------------------------------------------------------------------ tryb: plansza (przechwycenie Plate.render)
CAPT = []        # [{"plate": Plate, "views": [...], "anchors": {...}}]
_tmp = tempfile.mkdtemp(prefix="atl3d_")
_real_open = builtins.open
OUT_ROOT_N = os.path.normcase(os.path.abspath(al.OUT_ROOT))


def _guard_open(file, mode="r", *a, **k):
    """Zapisy skryptów planszy do public/atlas/ idą do katalogu tymczasowego (pliki plansz zostają nietknięte)."""
    if isinstance(file, str) and any(c in mode for c in "wax+"):
        p = os.path.normcase(os.path.abspath(file))
        if p.startswith(OUT_ROOT_N):
            file = os.path.join(_tmp, os.path.relpath(p, OUT_ROOT_N).replace(os.sep, "__"))
    return _real_open(file, mode, *a, **k)


def _fake_render(self, views=("front",), states=("rest", "sprint"), anchors=None, flows3d=None, **kw):
    CAPT.append({"plate": self, "views": list(views), "anchors": dict(anchors or {})})
    meta = {"schemaVersion": al.SCHEMA_VERSION, "id": self.id, "resolution": list(self.res), "views": {}}
    for view in views:
        try:
            cam = self._camera(view)
            vm = {"images": {}, "anchors": {}, "anchors3d": {}, "bbox": [0, 0, 1, 1], "camera": self.camera_meta(view)}
            for key, a in (anchors or {}).items():
                if view in a.get("views", [view]):
                    p = self.resolve_anchor(a, view)
                    vm["anchors"][key] = self._project(cam, p)
                    vm["anchors3d"][key] = [round(v, 5) for v in p]
            meta["views"][view] = vm
        except Exception as e:  # noqa: BLE001 - przechwycenie nie może przerwać skryptu planszy
            print("ATL3D_WARN meta", view, e)
    print(f"ATL3D_CAPTURE {self.id} views={list(views)} items={len(self.items)}")
    return meta


def run_plate(plate_id):
    script = os.path.join(os.path.dirname(os.path.abspath(__file__)), f"plate_{plate_id}.py")
    if not os.path.exists(script):
        raise SystemExit(f"brak {script}")
    al.Plate.render = _fake_render
    al.Plate.write_flows3d = lambda self, flows, step=0.02: None
    subprocess.run = lambda *a, **k: subprocess.CompletedProcess(a, 0)
    try:
        bpy.ops.render.render = lambda *a, **k: {'CANCELLED'}
    except (AttributeError, TypeError) as e:
        print("ATL3D_WARN nie podmieniono bpy.ops.render.render:", e)
    # Źródło obiektów z GLB: plate_oddechowy.py ma własny import bez atl_source (45 struktur HuBMAP trafiało do pliku
    # Z-Anatomy - wykrył integrator). bpy.ops.import_scene tworzy się przy każdym odwołaniu, więc podmiana operatora
    # nie działa. Zamiast tego: mapa nazwa węzła -> plik ze WSZYSTKICH GLB HuBMAP (część JSON pliku), po przebiegu
    # planszy każdy nowy obiekt bez atl_source o nazwie węzła HuBMAP dostaje źródło z właściwego pliku.
    hub_nodes = {}
    for dirpath, _, fnames in os.walk(al.HUBMAP_DIR):
        for fn in sorted(fnames):
            if not fn.lower().endswith(".glb"):
                continue
            try:
                with _real_open(os.path.join(dirpath, fn), "rb") as fh:
                    head = fh.read(20)
                    n = int.from_bytes(head[12:16], "little")
                    gj = json.loads(fh.read(n).decode("utf-8"))
                for node in gj.get("nodes", []):
                    if node.get("name"):
                        hub_nodes.setdefault(node["name"], fn)
            except (OSError, ValueError) as e:
                print("ATL3D_WARN odczyt GLB", fn, e)
    startup_names = {o.name for o in bpy.data.objects}
    for k in ("ATLAS_QUICK", "ATLAS_ANCHORS_ONLY", "ATLAS_DRY"):
        os.environ.pop(k, None)
    builtins.open = _guard_open
    try:
        runpy.run_path(script, run_name="__main__")
    except SystemExit:
        pass
    finally:
        builtins.open = _real_open
    tagged = 0
    for o in bpy.data.objects:
        if o.name not in startup_names and not o.get("atl_source") and base(o.name) in hub_nodes:
            o["atl_source"] = "hubmap:" + hub_nodes[base(o.name)]
            tagged += 1
    print(f"ATL3D_SOURCE oznaczone jako HuBMAP po nazwie węzła: {tagged}")
    caps = [c for c in CAPT if c["plate"].id == plate_id]
    if not caps:
        raise SystemExit(f"ATL3D: plansza {plate_id} nie wywołała render()")

    # --- baza wspólna (ID siatek z _shared/export.json)
    shared_ids = set()
    sp = os.path.join(BUILD, "_shared", "export.json")
    if os.path.exists(sp):
        with _real_open(sp, encoding="utf-8") as f:
            for fdesc in json.load(f)["files"]:
                shared_ids |= set(fdesc["ids"])
    else:
        print("ATL3D_WARN brak bazy wspólnej (uruchom ATLAS3D=shared): wszystko trafi do plików układu")

    def visible_in(P, o, v):
        ex = P.extra.get(o.name, {})
        keep = P._spec(v)["objects"]
        return (keep is None or o in keep) and (not ex.get("views") or v in ex["views"])

    # --- widoki i rama: "staging" = zbliżenie zbudowane poza ciałem (środek kadru daleko od osi ciała
    #     albo jawny wyjątek STAGING_VIEWS); "body" = wspólna rama Z-Anatomy (także HuBMAP po align_hubmap)
    views = {}  # nazwa -> {camera, frame, resolution}
    for c in caps:
        P = c["plate"]
        for v in c["views"]:
            cm = P.camera_meta(v)
            staged = abs(cm["center"][0]) > STAGING_X or v in STAGING_VIEWS.get(plate_id, ())
            frame = "staging" if staged else "body"
            views.setdefault(v, {"camera": cm, "frame": frame, "resolution": list(P.res)})

    # --- struktury
    items, objs_by_id = {}, {}
    for c in caps:
        P = c["plate"]
        for o, role, system, levels in P.items:
            if o.type not in ('MESH', 'CURVE'):
                continue
            vis_views = [v for v in c["views"] if visible_in(P, o, v)]
            if not vis_views:
                continue
            ex = P.extra.get(o.name, {})
            mid = mesh_id(o)
            it = items.get(mid)
            if it is None:
                ctx = ex.get("ctx") or ("muscle" if (o.type == 'CURVE' and role == "active") or system == "muscle" else "bone")
                origin = ("hubmap" if lic_of(o) == "hra" else
                          "zanatomy" if o.name in startup_names and not o.get("atl_source") else "plate")
                it = items[mid] = {"meshId": mid, "role": role, "system": system, "levels": dict(levels),
                                   "alpha": ex.get("alpha"), "ctx": ctx, "views": [], "license": LIC_ID[lic_of(o)],
                                   "origin": origin}
                objs_by_id[mid] = o
            it["views"] = sorted(set(it["views"]) | set(vis_views))
    # --- wygląd wprost z materiałów planszy: _apply_state(stan) przypisuje te same materiały co do renderu 2D
    #     (także role lokalne: heart, section, organ_*, ln_layer...). Odczyt: kolor bazowy (liniowy), emisja, alfa.
    def read_look(o):
        m = o.active_material or (o.data.materials[0] if getattr(o.data, "materials", None) else None)
        if m is None or not m.use_nodes:
            return None
        b = next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if b is None:
            return None
        col = list(b.inputs["Base Color"].default_value)[:3]
        emi = float(b.inputs["Emission Strength"].default_value) if "Emission Strength" in b.inputs else 0.0
        ecol = list(b.inputs["Emission Color"].default_value)[:3] if "Emission Color" in b.inputs else col
        alpha = float(b.inputs["Alpha"].default_value) if "Alpha" in b.inputs else 1.0
        return {"color": [round(x, 4) for x in col], "emission": round(emi, 3),
                "emissionColor": [round(x, 4) for x in ecol], "alpha": round(alpha, 3)}

    for c in caps:
        P = c["plate"]
        for state in ("rest", "sprint"):
            try:
                P._apply_state(state)
            except Exception as e:  # noqa: BLE001 - np. karta bez stanu "rest"
                print("ATL3D_WARN _apply_state", state, e)
                continue
            for o, *_ in P.items:
                mid = mesh_id(o)
                if mid in items and o.type in ('MESH', 'CURVE'):
                    lk = read_look(o)
                    if lk:
                        items[mid].setdefault("look", {})[state] = lk

    for mid, it in items.items():
        it["frame"] = "staging" if all(views[v]["frame"] == "staging" for v in it["views"]) else "body"
        if mid in shared_ids:
            it["shared"] = True

    # --- pliki układu: licencja × rama; warstwy: rola|układ|ctx|alpha
    out = os.path.join(BUILD, plate_id)
    groups = {}
    for mid, it in items.items():
        if it.get("shared"):
            continue
        o = objs_by_id[mid]
        fname = f"{lic_of(o)}_{it['frame']}"
        alpha = it["alpha"]
        lkey = "|".join([it["role"], it["system"] or "-", it["ctx"], f"a{int(round((alpha or 1) * 100))}"])
        groups.setdefault(fname, {}).setdefault(lkey, []).append(o)
        it["file"] = fname + ".glb"
        it["layer"] = lkey
    BUDGET = {"body": 420_000, "staging": 260_000}
    files = []
    for fname, layers in sorted(groups.items()):
        allo = [o for objs in layers.values() for o in objs]
        light_curves(allo)
        tris, ratio = decimate_to(allo, BUDGET[fname.split("_", 1)[1]])
        print(f"ATL3D_DECIMATE {fname}: {tris} -> współczynnik {ratio:.3f}")
        fd = export_glb(fname, sorted(layers.items()), fname.split("_", 1)[0], out)
        if fd:
            fd["frame"] = fname.split("_", 1)[1]
            files.append(fd)

    # --- kotwice 3D: widoki planszy wprost z public/atlas/<u>/anchors.json (to, co narysowano w 2D);
    #     widoki kluczowe 3D (front/left/back/right) liczone tutaj, tylko dla kotwic z ramy ciała
    anchors3d, anchor_views = {}, {}
    apath = os.path.join(al.OUT_ROOT, plate_id, "anchors.json")
    if os.path.exists(apath):
        with _real_open(apath, encoding="utf-8") as f:
            for v, vm in json.load(f).get("views", {}).items():
                for key, p in vm.get("anchors3d", {}).items():
                    anchors3d.setdefault(v, {})[key] = p
                    anchor_views.setdefault(key, set()).add(v)
                if v not in views and vm.get("camera"):
                    cm = vm["camera"]
                    views[v] = {"camera": cm, "frame": "staging" if abs(cm["center"][0]) > STAGING_X else "body",
                                "resolution": vm.get("resolution")}
    for c in caps:
        P = c["plate"]
        for key, a in c["anchors"].items():
            own = [v for v in a.get("views", c["views"]) if v in c["views"]]
            anchor_views.setdefault(key, set()).update(own)
            if not any(views[v]["frame"] == "body" for v in own):
                continue
            for v in KEY_VIEWS:
                try:
                    p = P.resolve_anchor(a, v)
                    anchors3d.setdefault("k_" + v, {})[key] = [round(x, 5) for x in p]
                except Exception as e:  # noqa: BLE001
                    print("ATL3D_WARN kotwica", key, v, e)
    anchor_views = {k: sorted(v) for k, v in anchor_views.items()}
    # obiekty kotwic po wyliczeniu w Pythonie (wsad dla mesh_bindings.json integratora, E1)
    #     "objects"/"curve": podane wprost; "point": najbliższa widoczna struktura (≤ 20 mm), metoda i odległość zapisane
    anchor_meshes, anchor_method = {}, {}
    dg = bpy.context.evaluated_depsgraph_get()
    _pts_cache = {}

    def world_pts(o):
        if o.name not in _pts_cache:
            ev = o.evaluated_get(dg)
            try:
                me = ev.to_mesh()
                co = np.empty(len(me.vertices) * 3, np.float32)
                me.vertices.foreach_get("co", co)
                M = np.array(ev.matrix_world, dtype=np.float32)
                _pts_cache[o.name] = co.reshape(-1, 3) @ M[:3, :3].T + M[:3, 3]
                ev.to_mesh_clear()
            except RuntimeError:
                _pts_cache[o.name] = np.zeros((0, 3), np.float32)
        return _pts_cache[o.name]

    for c in caps:
        P = c["plate"]
        for key, a in c["anchors"].items():
            names = a.get("objects") or ([a["curve"]] if "curve" in a else [])
            objs = [bpy.data.objects[n] for n in names if bpy.data.objects.get(n) is not None]
            real = [o for o in objs if o.type in ('MESH', 'CURVE') and not o.name.startswith("ATL_anchor")]
            if real:
                anchor_meshes[key] = sorted(set(anchor_meshes.get(key, [])) | {mesh_id(o) for o in real})
                anchor_method[key] = "objects"
                continue
            if "point" in a:
                p = np.array(a["point"], np.float32)
            elif objs:  # pomocnicze puste obiekty: punkt kotwicy = ich położenie
                p = np.mean([np.array(o.matrix_world.translation, np.float32) for o in objs], axis=0)
            else:
                continue
            own = [v for v in a.get("views", c["views"]) if v in c["views"]]
            best = (1e9, None)
            for o, *_ in P.items:
                if o.type not in ('MESH', 'CURVE') or not any(visible_in(P, o, v) for v in own):
                    continue
                mn, mx = al.world_bbox([o])
                if np.any(p < np.array(mn) - 0.02) or np.any(p > np.array(mx) + 0.02):
                    continue
                pts = world_pts(o)
                if len(pts):
                    d = float(np.min(np.linalg.norm(pts - p, axis=1)))
                    if d < best[0]:
                        best = (d, o)
            if best[1] is not None and best[0] <= 0.02:
                anchor_meshes[key] = [mesh_id(best[1])]
                anchor_method[key] = f"nearest:{best[0] * 1000:.1f}mm"

    roles = sorted({it["role"] for it in items.values()})
    res = {"schemaVersion": 1, "plate": plate_id, "views": views, "items": list(items.values()), "files": files,
           "anchors3d": anchors3d, "anchorViews": anchor_views, "anchorMeshes": anchor_meshes, "anchorMethod": anchor_method, "roles": roles,
           "seconds": round(time.time() - T0)}
    os.makedirs(out, exist_ok=True)
    with _real_open(os.path.join(out, "export.json"), "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False)
    print(f"ATL3D_DONE {plate_id}: {len(items)} struktur ({sum(1 for i in items.values() if i.get('shared'))} ze wspólnej bazy), "
          f"{len(files)} plików, role {roles}, {res['seconds']} s")


if MODE == "shared":
    run_shared()
else:
    run_plate(MODE)
