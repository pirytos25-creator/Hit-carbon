"""
Headless Blender 5.2.1 LTS AgX EEVEE verification renderer with properly framed full-body & macro views.
"""
import math
import os
import bpy
from mathutils import Vector

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "public", "models"))
RENDERS_DIR = os.path.join(SCRIPT_DIR, "renders")
os.makedirs(RENDERS_DIR, exist_ok=True)


def setup_render_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.eevee.taa_render_samples = 24
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.image_settings.file_format = 'PNG'

    scene.view_settings.view_transform = 'AgX'
    try:
        scene.view_settings.look = 'AgX - Medium High Contrast'
    except TypeError:
        pass

    world = bpy.data.worlds.new("VerifyWorld")
    scene.world = world
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.02, 0.035, 0.06, 1.0)
        bg.inputs["Strength"].default_value = 0.75

    def add_sun(name, energy, rot_deg, color):
        ldata = bpy.data.lights.new(name, type='SUN')
        ldata.energy = energy
        ldata.color = color
        lobj = bpy.data.objects.new(name, ldata)
        lobj.rotation_euler = tuple(math.radians(a) for a in rot_deg)
        scene.collection.objects.link(lobj)

    add_sun("KeySun", 3.6, (48, 12, -38), (1.0, 0.96, 0.92))
    add_sun("FillSun", 1.3, (115, 0, 145), (0.60, 0.80, 1.0))
    add_sun("RimSun", 1.8, (25, 0, 155), (0.45, 0.85, 1.0))


def compute_bounds(objs):
    mins = Vector((1e9, 1e9, 1e9))
    maxs = Vector((-1e9, -1e9, -1e9))
    count = 0
    for obj in objs:
        if obj.type != 'MESH':
            continue
        for corner in obj.bound_box:
            wc = obj.matrix_world @ Vector(corner)
            mins.x = min(mins.x, wc.x)
            mins.y = min(mins.y, wc.y)
            mins.z = min(mins.z, wc.z)
            maxs.x = max(maxs.x, wc.x)
            maxs.y = max(maxs.y, wc.y)
            maxs.z = max(maxs.z, wc.z)
            count += 1
    if count == 0:
        return Vector((0, 0, 0)), 1.0
    center = (mins + maxs) * 0.5
    radius = max((maxs - mins).length * 0.5, 0.1)
    return center, radius


def render_glb(glb_filename, out_png, cam_dir=(1.6, -2.0, 0.75), target_override=None, dist_override=None, dist_mult=2.2):
    setup_render_scene()
    glb_path = os.path.join(MODELS_DIR, glb_filename)
    bpy.ops.import_scene.gltf(filepath=glb_path)
    bpy.context.view_layer.update()

    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    center, radius = compute_bounds(meshes)
    if target_override is not None:
        center = Vector(target_override)

    cam_data = bpy.data.cameras.new("VerifyCam")
    cam_data.lens = 42
    cam_data.clip_start = 0.01
    cam_data.clip_end = 100.0
    cam_obj = bpy.data.objects.new("VerifyCam", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    dir_v = Vector(cam_dir).normalized()
    dist = dist_override if dist_override is not None else radius * dist_mult
    cam_obj.location = center + dir_v * dist
    cam_obj.rotation_euler = (center - cam_obj.location).to_track_quat('-Z', 'Y').to_euler()

    out_path = os.path.join(RENDERS_DIR, out_png)
    bpy.context.scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)

    tris = sum(len(m.data.polygons) for m in meshes)
    print(f"[VERIFIED RENDER] {glb_filename} -> {out_png} | meshes={len(meshes)} | polys={tris} | size={os.path.getsize(glb_path)} B")


def main():
    # In Blender after GLTF re-import, Z is Up, so full athlete stands from Z=0.145 to Z=1.92
    render_glb("athlete_gym.glb", "verify_01_athlete.png", cam_dir=(1.8, 2.4, 0.55), target_override=(0.0, 0.0, 1.05), dist_override=3.4)
    render_glb("cardiopulmonary.glb", "verify_02_cardiopulmonary.png", cam_dir=(0.45, -1.7, 0.40), target_override=(0.04, 0.0, 0.02), dist_override=0.92)
    render_glb("muscle_sarcomere.glb", "verify_03_sarcomere.png", cam_dir=(0.65, 1.65, 0.90), target_override=(0.0, 0.0, 0.0), dist_override=2.9)
    render_glb("mitochondrion.glb", "verify_04_mitochondrion.png", cam_dir=(0.45, -1.65, 1.20), target_override=(0.0, 0.0, 0.05), dist_override=3.0)
    render_glb("brain_synapse.glb", "verify_05_brain.png", cam_dir=(1.45, -1.35, 0.65), target_override=(0.0, 0.0, -0.05), dist_override=2.55)
    render_glb("brain_synapse.glb", "verify_05b_synapse.png", cam_dir=(0.35, -1.65, 0.65), target_override=(2.95, 0.0, 0.0), dist_override=2.7)


if __name__ == "__main__":
    main()
