"""
Wspólna biblioteka plansz "Atlas układów" (faza 0). Zasady: docs/ATLAS_STYLE_BIBLE.md

Uruchamianie planszy (przykład):
  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/plate_miesniowy.py

Skrypt planszy:
  import atlas_lib as al
  plate = al.Plate("miesniowy")
  objs = al.find_meshes(collection="4: Muscular system", suffixes=("l", "r"))
  plate.add(objs, role="context_muscle")
  plate.add(active_objs, role="active", system="muscle")   # kolor zależy od stanu
  plate.render(views=("front", "back"), states=("rest", "sprint"), anchors={...})

Startup.blend NIGDY nie jest zapisywany.
"""
import json
import os
import re
import subprocess

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT_ROOT = os.path.join(ROOT, "public", "atlas")
# atlas_raw/ jest poza Gitem, więc w worktree agentów go nie ma. Kolejność: zmienna ATLAS_RAW,
# folder w tym checkoutcie, główny checkout projektu.
_MAIN_RAW = r"C:\Users\piryt\Desktop\Luźny Vibecoading\HIIt\atlas_raw"
RAW = os.environ.get("ATLAS_RAW") or (
    os.path.join(ROOT, "atlas_raw") if os.path.isdir(os.path.join(ROOT, "atlas_raw")) else _MAIN_RAW
)

# ---------------------------------------------------------------- kolory (księga stylu §2)
SYSTEM_COLORS = {
    "nerve": "#E8B23A",
    "muscle": "#C8553D",
    "brain": "#9B7BEA",
    "resp": "#4FC3E0",
    "artery": "#D93240",
    "vein": "#3E6FD8",
}
CONTEXT_COLORS = {
    "bone": "#D8D1C4",
    "muscle": "#8E7A78",
    "skin": "#9AA4B5",
}
REST_MIX = 0.35  # spoczynek: 35% koloru układu + 65% kontekstu


def hex_to_linear(h):
    h = h.lstrip("#")
    srgb = [int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, 1.0)


def mix(a, b, t):
    return tuple(a[i] * (1 - t) + b[i] * t for i in range(4))


# ---------------------------------------------------------------- wyszukiwanie obiektów
MUSCLE_COVER_MATERIALS = ("Fascia", "Bursa", "Articular capsule", "Superficial")


def find_meshes(collection=None, suffixes=None, include=None, exclude=None, min_polys=1, exclude_materials=()):
    """Siatki z kolekcji (rekurencyjnie). include/exclude: listy wzorców regex (bez rozróżniania wielkości liter).
    exclude_materials: pomija siatki z takim ORYGINALNYM materiałem Z-Anatomy (np. powięzie przykrywające mięśnie).
    Wywoływać przed Plate.render (render podmienia materiały)."""
    if collection:
        col = bpy.data.collections.get(collection)
        if col is None:
            raise KeyError(f"Brak kolekcji: {collection}")
        pool = col.all_objects
    else:
        pool = bpy.data.objects
    inc = [re.compile(p, re.I) for p in (include or [])]
    exc = [re.compile(p, re.I) for p in (exclude or [])]
    out = []
    for o in pool:
        if o.type != 'MESH' or len(o.data.polygons) < min_polys:
            continue
        # Z-Anatomy trzyma tytuły kolekcji jako siatki tekstu (sufiks .g, materiał "Text"): pomijamy je.
        if o.name.endswith(".g") or any(m and m.name == "Text" for m in o.data.materials):
            continue
        if suffixes is not None:
            suf = o.name.rsplit(".", 1)[-1] if "." in o.name else ""
            if suf not in suffixes:
                continue
        if inc and not any(p.search(o.name) for p in inc):
            continue
        if any(p.search(o.name) for p in exc):
            continue
        if exclude_materials and any(m and m.name in exclude_materials for m in o.data.materials):
            continue
        out.append(o)
    return out


def world_bbox(objs):
    mn = Vector((1e9, 1e9, 1e9))
    mx = Vector((-1e9, -1e9, -1e9))
    for o in objs:
        for c in o.bound_box:
            p = o.matrix_world @ Vector(c)
            mn = Vector((min(mn.x, p.x), min(mn.y, p.y), min(mn.z, p.z)))
            mx = Vector((max(mx.x, p.x), max(mx.y, p.y), max(mx.z, p.z)))
    return mn, mx


# ---------------------------------------------------------------- materiały (księga stylu §3)
def _principled(mat):
    mat.use_nodes = True
    return next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")


def _set_input(bsdf, name, value):
    if name in bsdf.inputs:
        bsdf.inputs[name].default_value = value


def make_material(name, color, roughness=0.7, subsurface=0.0, emission=0.0, alpha=1.0):
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
    mat.diffuse_color = color
    return mat


def role_material(role, system=None, state="sprint", level=1.0):
    """role: context_bone | context_muscle | context_skin | active.
    level (0..1): jak mocno struktura pracuje w danym stanie (sprint może mieć różne poziomy)."""
    if role == "context_bone":
        return make_material("ATL_bone", hex_to_linear(CONTEXT_COLORS["bone"]), roughness=0.75)
    if role == "context_muscle":
        return make_material("ATL_ctx_muscle", hex_to_linear(CONTEXT_COLORS["muscle"]), roughness=0.7, subsurface=0.05)
    if role == "context_skin":
        return make_material("ATL_skin", hex_to_linear(CONTEXT_COLORS["skin"]), roughness=0.6, alpha=0.12)
    if role == "active":
        sys_col = hex_to_linear(SYSTEM_COLORS[system])
        ctx = hex_to_linear(CONTEXT_COLORS["muscle" if system == "muscle" else "bone"])
        t = REST_MIX if state == "rest" else max(REST_MIX, level)
        col = mix(ctx, sys_col, t)
        emi = 0.0 if state == "rest" else 0.3 * level
        key = f"ATL_{system}_{state}_{int(round(t * 100))}_{int(round(emi * 100))}"
        return make_material(key, col, roughness=0.6, subsurface=0.08, emission=emi)
    raise ValueError(role)


def assign(obj, mat):
    """Przypina materiał do wszystkich slotów, także tych powiązanych z obiektem (link='OBJECT')."""
    if not obj.material_slots:
        obj.data.materials.append(mat)
    for slot in obj.material_slots:
        slot.link = 'DATA'
        slot.material = mat


# ---------------------------------------------------------------- scena planszy
class Plate:
    def __init__(self, plate_id, resolution=(1000, 1800), ortho_scale=2.0):
        self.id = plate_id
        self.res = resolution
        self.ortho_scale = ortho_scale
        self.items = []  # (obj, role, system, levels{state: level})
        self.out_dir = os.path.join(OUT_ROOT, plate_id)
        os.makedirs(self.out_dir, exist_ok=True)
        self.scene = bpy.data.scenes.new(f"ATLAS_{plate_id}")
        self.col = bpy.data.collections.new(f"ATLAS_{plate_id}_objs")
        self.scene.collection.children.link(self.col)
        self._setup_render()
        self._setup_world()
        self.center = Vector((0, 0, 0.88))

    # -- dodawanie obiektów
    def add(self, objs, role, system=None, rest_level=None, sprint_level=1.0):
        for o in objs:
            if o.name not in self.col.objects:
                self.col.objects.link(o)
            o.hide_render = False
            o.hide_viewport = False
            self.items.append((o, role, system, {"rest": rest_level, "sprint": sprint_level}))

    def frame_all(self, margin=1.06):
        mn, mx = world_bbox([i[0] for i in self.items])
        self.center = (mn + mx) / 2
        h = (mx.z - mn.z)
        w = (mx.x - mn.x)
        aspect = self.res[0] / self.res[1]
        self.ortho_scale = max(h, w / aspect) * margin
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

    def _lights(self, view):
        for o in [o for o in self.scene.collection.objects if o.type == 'LIGHT']:
            bpy.data.objects.remove(o, do_unlink=True)
        sgn = -1 if view == "front" else 1  # front: kamera po stronie -Y
        c = self.center
        rigs = [  # (nazwa, pozycja względna, moc W, rozmiar, kolor)
            ("key", Vector((-1.6 * sgn * -1, 2.6 * sgn, 1.4)), 260, 1.6, (1.0, 0.97, 0.93)),
            ("fill", Vector((1.8 * sgn * -1, 2.4 * sgn, 0.2)), 90, 2.0, (0.9, 0.95, 1.0)),
            ("rim", Vector((0.6, -2.6 * sgn, 1.2)), 220, 1.0, (0.85, 0.92, 1.0)),
        ]
        for name, rel, power, size, colr in rigs:
            ld = bpy.data.lights.new(f"ATL_{name}", 'AREA')
            ld.energy = power
            ld.size = size
            ld.color = colr
            lo = bpy.data.objects.new(f"ATL_{name}", ld)
            lo.location = c + rel
            direction = c - lo.location
            lo.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
            self.scene.collection.objects.link(lo)

    def _camera(self, view):
        cam_d = bpy.data.cameras.get("ATL_cam") or bpy.data.cameras.new("ATL_cam")
        cam_d.type = 'ORTHO'
        cam_d.ortho_scale = self.ortho_scale
        cam_d.clip_start = 0.01
        cam_d.clip_end = 50
        cam = bpy.data.objects.get("ATL_cam") or bpy.data.objects.new("ATL_cam", cam_d)
        if cam.name not in self.scene.collection.objects:
            self.scene.collection.objects.link(cam)
        d = 6.0
        if view == "front":
            cam.location = self.center + Vector((0, -d, 0))
        elif view == "back":
            cam.location = self.center + Vector((0, d, 0))
        elif view == "side":
            cam.location = self.center + Vector((d, 0, 0))
        else:
            raise ValueError(view)
        cam.rotation_euler = (self.center - cam.location).to_track_quat('-Z', 'Y').to_euler()
        self.scene.camera = cam
        # Bez tego matrix_world kamery jest nieaktualna i rzutowanie kotwic daje złe wyniki.
        self.scene.view_layers[0].update()
        return cam

    def _apply_state(self, state):
        for o, role, system, levels in self.items:
            if role == "active":
                lvl = levels[state]
                if lvl is None:
                    lvl = REST_MIX if state == "rest" else 1.0
                assign(o, role_material(role, system, state, lvl))
            else:
                assign(o, role_material(role))

    def _project(self, cam, point):
        from bpy_extras.object_utils import world_to_camera_view
        v = world_to_camera_view(self.scene, cam, point)
        return [round(v.x, 4), round(1.0 - v.y, 4)]

    def anchor_point(self, obj_names, view):
        """Punkt kotwicy: środek widocznej (bliższej kamerze) części bbox jednego lub kilku obiektów."""
        objs = [bpy.data.objects[n] for n in obj_names]
        mn, mx = world_bbox(objs)
        p = (mn + mx) / 2
        if view == "front":
            p.y = mn.y
        elif view == "back":
            p.y = mx.y
        elif view == "side":
            p.x = mx.x
        return p

    # -- render
    def render(self, views=("front",), states=("rest", "sprint"), anchors=None, webp_quality=88):
        """anchors: {klucz: {"objects": [nazwy], "views": ["front"], "offset": (dx, dz)}}"""
        anchors = anchors or {}
        quick = bool(os.environ.get("ATLAS_QUICK"))  # szybki podgląd: tylko pierwszy widok w stanie sprint
        anchors_only = bool(os.environ.get("ATLAS_ANCHORS_ONLY"))  # tylko przelicz kotwice, bez renderu
        if quick:
            views, states = views[:1], ("sprint",)
        meta = {"id": self.id, "resolution": list(self.res), "views": {}}
        for view in views:
            cam = self._camera(view)
            self._lights(view)
            # Obrys ciała na obrazie (0-1): strona przycina nim puste marginesy.
            mn, mx = world_bbox([i[0] for i in self.items])
            corners = [Vector((x, y, z)) for x in (mn.x, mx.x) for y in (mn.y, mx.y) for z in (mn.z, mx.z)]
            pts = [self._project(cam, c) for c in corners]
            bbox = [min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts)]
            vmeta = {"images": {}, "anchors": {}, "bbox": [round(max(0.0, min(1.0, v)), 4) for v in bbox]}
            for key, a in anchors.items():
                if view not in a.get("views", [view]):
                    continue
                p = self.anchor_point(a["objects"], view)
                off = a.get("offset", (0, 0))
                p.x += off[0] * (1 if view != "back" else -1)
                p.z += off[1]
                vmeta["anchors"][key] = self._project(cam, p)
            for state in states:
                if anchors_only:
                    vmeta["images"][state] = f"{view}_{state}.webp"
                    continue
                self._apply_state(state)
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
            meta["views"][view] = vmeta
        with open(os.path.join(self.out_dir, "anchors.json"), "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2, ensure_ascii=False)
        print("ATLAS_DONE", os.path.join(self.out_dir, "anchors.json"))
        return meta
