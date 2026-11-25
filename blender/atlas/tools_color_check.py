"""
Narzędzie (integrator): czy światło biblioteki oddaje kolory układów (księga stylu §3: "kolory z tabeli mają wyjść 1:1").
Renderuje kule w kolorach układów (stan sprint, poziom 1.0, z emisją) przy kilku ustawieniach światła i mierzy
kolor w oświetlonej części kuli: ΔE (CIE76, Lab) względem koloru z tabeli, odcień (stopnie) i odsetek obciętych pikseli.
  blender.exe --background --factory-startup --python blender/atlas/tools_color_check.py -- <folder> [światło:klucz,...]
  np. "1.0:1.0,0.55:0.8" = światło fazy 0 (klucz 260 W) i ustawienie fazy 2.
Nie potrzebuje atlasu Z-Anatomy.
"""
import colorsys
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from mathutils import Vector  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else os.path.join(al.ROOT, "..", "color_check")
CONFIGS = [tuple(float(x) for x in c.split(":")) for c in (argv[1] if len(argv) > 1 else "1.0:1.0,0.55:0.8").split(",")]
os.makedirs(OUT, exist_ok=True)
SYSTEMS = ["nerve", "muscle", "brain", "resp", "artery", "vein", "endo", "skin", "digest", "urinary", "bone", "lymph", "repro"]


def srgb_to_lab(rgb):
    c = np.asarray(rgb, dtype=np.float64)
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ M.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def hexrgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)])


# scena: rząd kul (r = 6 cm), jak struktura na planszy całego ciała
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
spheres = []
for i, s in enumerate(SYSTEMS):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.06, location=(-0.84 + i * 0.14, 0, 1.0), segments=48, ring_count=24)
    o = bpy.context.active_object
    o.name = f"swatch_{s}"
    bpy.ops.object.shade_smooth()
    spheres.append((s, o))

results = {}
for scale, key in CONFIGS:
    al.LIGHT_SCALE, al.KEY_SCALE = scale, key
    tag = f"{scale}_{key}"
    pl = al.Plate(f"color_{tag}", resolution=(1820, 240), out_dir=OUT)
    for s, o in spheres:
        pl.add([o], role="active", system=s, sprint_level=1.0)
    pl.center = Vector((0, 0, 1.0))
    pl.ortho_scale = 1.82
    pl.light_scale = scale
    cam = pl._camera("front")
    pl._lights("front")
    pl._apply_state("sprint")
    png = os.path.join(OUT, f"swatches_light_{tag}.png")
    pl.scene.render.filepath = png
    bpy.ops.render.render(write_still=True, scene=pl.scene.name)
    img = bpy.data.images.load(png)
    W, H = img.size
    px = np.array(img.pixels[:]).reshape(H, W, 4)[::-1]  # wiersz 0 = góra
    row = {}
    for s, o in spheres:
        u, v = pl._project(cam, o.location)
        cx, cy, r = int(u * W), int(v * H), int(0.06 / 1.82 * W)
        yy, xx = np.mgrid[-r:r + 1, -r:r + 1]
        disk = (xx ** 2 + yy ** 2) <= (0.8 * r) ** 2
        patch = px[cy - r:cy + r + 1, cx - r:cx + r + 1, :3][disk]
        lum = patch @ np.array([0.2126, 0.7152, 0.0722])
        lit = patch[lum >= np.quantile(lum, 0.75)]  # oświetlona część kuli (górna ćwiartka jasności)
        med = np.median(patch, 0)
        target = hexrgb(al.SYSTEM_COLORS[s])
        dE_lit = float(np.linalg.norm(srgb_to_lab(lit.mean(0)) - srgb_to_lab(target)))
        dE_med = float(np.linalg.norm(srgb_to_lab(med) - srgb_to_lab(target)))
        h_t = colorsys.rgb_to_hsv(*target)[0] * 360
        h_l = colorsys.rgb_to_hsv(*lit.mean(0))[0] * 360
        dh = (h_l - h_t + 180) % 360 - 180
        clip = float((patch.max(1) >= 0.999).mean() * 100)
        row[s] = {"target": al.SYSTEM_COLORS[s], "lit": "#%02X%02X%02X" % tuple(int(round(c * 255)) for c in lit.mean(0)),
                  "median": "#%02X%02X%02X" % tuple(int(round(c * 255)) for c in med),
                  "dE_lit": round(dE_lit, 1), "dE_median": round(dE_med, 1), "hue_shift_deg": round(dh, 1),
                  "clipped_pct": round(clip, 1)}
    results[tag] = row
    print("COLOR_CHECK", tag, json.dumps(row))
    bpy.data.images.remove(img)

with open(os.path.join(OUT, "color_report.json"), "w", encoding="utf-8") as f:
    json.dump({"configs": "LIGHT_SCALE_KEY_SCALE", "emission": al.EMISSION_RULE, "results": results}, f, indent=1)
print("COLOR_DONE", OUT)
