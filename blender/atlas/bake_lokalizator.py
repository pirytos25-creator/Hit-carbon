"""
M6 (rama): wypiek LOKALIZATORA – mini-sylwetka ciała (z przodu i z boku) do rogu sceny atlasu i gablot.
Na sylwetkę AtlasApp nakłada prostokąt kadru liczony z kamery widoku (anchors.json: center, right, up, orthoScale).

  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/bake_lokalizator.py

Wynik (osobne pliki, licencja CC BY-SA 4.0, bo sylwetka to utwór zależny od Z-Anatomy / BodyParts3D):
  public/atlas/_lokalizator/front.webp, side.webp   sylwetka, jednolity kolor, przezroczyste tło
  public/atlas/_lokalizator/locator.json            parametry kamery każdego obrazu (te same pola co camera w anchors.json)
  public/atlas/_lokalizator/ATRYBUCJA.txt           atrybucja i licencja
Sylwetka: atlas_lib.build_silhouette() (mięśnie, kości i trzewia Z-Anatomy, remesh 11 mm; struktury NC wykluczone).
Startup.blend nie jest zapisywany.
"""
import json
import os
import subprocess
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402

OUT = os.path.join(al.OUT_ROOT, "_lokalizator")
os.makedirs(OUT, exist_ok=True)
RES = (240, 432)          # pionowo 1:1,8 jak plansze całego ciała
CENTER = Vector((0.0, -0.00359, 0.85701))  # środek kadru całego ciała z plansz (camera.center widoku front)
ORTHO = 1.90              # trochę szerzej niż plansze (1,80319), żeby prostokąt całego ciała nie dotykał krawędzi
COLOR = (0.58, 0.64, 0.74)  # sylwetka: jasny szaroniebieski (na tle #070B14 kontrast ok. 7:1)

# Osobna, czysta scena: Startup.blend ma Freestyle, kompozytor i własne ustawienia, które psują płaski wypiek.
scene = bpy.data.scenes.new("ATL_locator")
scene.render.use_freestyle = False
scene.use_nodes = False
sources = al.silhouette_sources()
al.license_check(sources, "lokalizator")  # blokada struktur NC (rzuca LicenseError)
hull = al.build_silhouette(sources)
scene.collection.objects.link(hull)  # w scenie jest tylko sylwetka i kamera

scene.render.engine = 'BLENDER_WORKBENCH'
sh = scene.display.shading
sh.light = 'FLAT'
sh.color_type = 'SINGLE'
sh.single_color = COLOR
sh.show_shadows = False
sh.show_cavity = False
sh.show_object_outline = False
scene.render.film_transparent = True
scene.render.resolution_x, scene.render.resolution_y = RES
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'Standard'

cam_d = bpy.data.cameras.new("ATL_loc_cam")
cam_d.type = 'ORTHO'
cam_d.ortho_scale = ORTHO
cam_d.sensor_fit = 'AUTO'
cam_d.clip_start, cam_d.clip_end = 0.01, 50
cam = bpy.data.objects.new("ATL_loc_cam", cam_d)
scene.collection.objects.link(cam)
scene.camera = cam

meta = {"schemaVersion": 1, "resolution": list(RES), "views": {}}
for view in ("front", "side"):
    d, right, up = al._camera_basis(view)
    cam.location = CENTER + d * 6.0
    cam.rotation_euler = (CENTER - cam.location).to_track_quat('-Z', 'Y').to_euler()
    scene.view_layers[0].update()
    png = os.path.join(OUT, f"{view}.png")
    scene.render.filepath = png
    bpy.ops.render.render(write_still=True, scene=scene.name)
    webp = os.path.join(OUT, f"{view}.webp")
    try:
        subprocess.run(["magick", png, "-quality", "90", "-define", "webp:alpha-quality=100", webp], check=True)
        os.remove(png)
    except Exception as e:  # bez ImageMagick zostaje PNG
        print("ATLAS_LOC magick:", e)
        webp = png
    meta["views"][view] = {
        "image": os.path.basename(webp),
        "center": [round(v, 5) for v in CENTER],
        "right": [round(v, 6) for v in right],
        "up": [round(v, 6) for v in up],
        "orthoScale": ORTHO,
    }
    print("ATLAS_RENDERED", webp)

with open(os.path.join(OUT, "locator.json"), "w", encoding="utf-8") as f:
    json.dump(meta, f, ensure_ascii=False, indent=1)
with open(os.path.join(OUT, "ATRYBUCJA.txt"), "w", encoding="utf-8") as f:
    f.write(
        "Lokalizator atlasu BIOGENESIS: sylwetka ciała (z przodu i z boku).\n"
        "Utwór zależny od Z-Anatomy (CC BY-SA 4.0, https://github.com/Z-Anatomy/Models-of-human-anatomy),\n"
        "na bazie BodyParts3D, (c) The Database Center for Life Science (CC BY-SA 2.1 JP).\n"
        "Zmiany: połączenie mięśni, kości i trzewi w jedną powłokę (remesh 11 mm), render płaski jednym kolorem.\n"
        "Licencja tego pliku: CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/deed.pl).\n"
    )
print("ATLAS_DONE", OUT)
