"""
Headless Blender 5.2.1 LTS AgX EEVEE verification renderer for all Overdrive v2 GLB assets.
"""
import math
import os
import bpy
from mathutils import Vector

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "public", "models"))
RENDERS_DIR = os.path.join(SCRIPT_DIR, "renders")
os.makedirs(RENDERS_DIR, exist_ok=True)


def setup_render_scene(bg=(0.03, 0.045, 0.08, 1.0), strength=0.9):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.eevee.taa_render_samples = 18
    scene.render.resolution_x = 1152
    scene.render.resolution_y = 680
    scene.render.image_settings.file_format = 'PNG'
    scene.view_settings.view_transform = 'AgX'

    world = bpy.data.worlds.new("VerifyWorld")
    scene.world = world
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs["Color"].default_value = bg
        bg_node.inputs["Strength"].default_value = strength

    def add_sun(name, energy, rot_deg, color):
        ldata = bpy.data.lights.new(name, type='SUN')
        ldata.energy = energy
        ldata.color = color
        lobj = bpy.data.objects.new(name, ldata)
        lobj.rotation_euler = tuple(math.radians(a) for a in rot_deg)
        scene.collection.objects.link(lobj)

    add_sun("KeySun", 3.6, (48, 12, -35), (1.0, 0.96, 0.90))
    add_sun("FrontFillSun", 1.8, (-55, 0, 15), (0.88, 0.94, 1.0))
    add_sun("RimSun", 1.6, (25, 0, 155), (0.50, 0.85, 1.0))

    cam_d = bpy.data.cameras.new("VerifyCam")
    cam_d.clip_start = 0.01
    cam_d.clip_end = 100.0
    cam_o = bpy.data.objects.new("VerifyCam", cam_d)
    scene.collection.objects.link(cam_o)
    scene.camera = cam_o
    return scene, cam_o, cam_d


def snap(scene, cam_o, cam_d, loc, target, out_png, lens=38):
    cam_d.lens = lens
    cam_o.location = Vector(loc)
    cam_o.rotation_euler = (Vector(target) - cam_o.location).to_track_quat('-Z', 'Y').to_euler()
    out_path = os.path.join(RENDERS_DIR, out_png)
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"[VERIFIED] -> {out_png}")


def main():
    # 1. Athlete & Gym (Shots: full mid-run, front-lit face, shoes on deck)
    sc, co, cd = setup_render_scene()
    bpy.ops.import_scene.gltf(filepath=os.path.join(MODELS_DIR, "athlete_gym.glb"))
    rig = [o for o in bpy.data.objects if o.type == 'ARMATURE'][0]
    if rig.animation_data:
        for tr in rig.animation_data.nla_tracks:
            tr.mute = (tr.name != 'Run_Fast')
    sc.frame_set(8)
    bpy.context.view_layer.update()
    for o in bpy.data.objects:
        if any(o.name.startswith(p) for p in ("Layer_Muscular", "Layer_Thoracic", "Layer_Heart", "Layer_Lungs", "Layer_Vascular", "Layer_Nervous")):
            o.hide_render = True
    # Soft warm daylight fill inside gym
    pl_face = bpy.data.lights.new("GymKeySpot", 'POINT')
    pl_face.energy = 110.0; pl_face.color = (1.0, 0.94, 0.86)
    po_f = bpy.data.objects.new("GymKeySpot", pl_face); po_f.location = Vector((1.6, 1.4, 2.2)); sc.collection.objects.link(po_f)
    snap(sc, co, cd, (2.25, 1.95, 1.30), (0.0, -0.05, 1.02), "v2_athlete_full.png", 36)
    snap(sc, co, cd, (0.36, 0.88, 1.72), (0.0, -0.04, 1.67), "v2_athlete_face.png", 52)
    snap(sc, co, cd, (1.10, 0.35, 0.42), (0.0, -0.08, 0.24), "v2_athlete_shoes.png", 46)

    # 2. Cardiopulmonary (HuBMAP Heart & Lungs)
    sc, co, cd = setup_render_scene()
    bpy.ops.import_scene.gltf(filepath=os.path.join(MODELS_DIR, "cardiopulmonary.glb"))
    snap(sc, co, cd, (0.15, -1.35, 0.08), (0.0, 0.0, -0.02), "v2_cardiopulmonary.png", 42)

    # 3. Bloodstream Tunnel Interior (inside centerline at u=0.14 -> u=0.58)
    sc, co, cd = setup_render_scene(bg=(0.12, 0.02, 0.04, 1.0), strength=0.35)
    bpy.ops.import_scene.gltf(filepath=os.path.join(MODELS_DIR, "bloodstream_tunnel.glb"))
    def b_ctr(u):
        return (-5.5 + u * 11.0, math.sin(u * math.pi * 1.25) * 0.85, math.cos(u * math.pi * 1.1) * 0.30 - 0.08)
    for pu, col_l, e_l in ((0.22, (1.0, 0.38, 0.36), 65.0), (0.50, (1.0, 0.50, 0.40), 75.0), (0.78, (1.0, 0.45, 0.45), 55.0)):
        pl = bpy.data.lights.new(f"Lum{pu}", 'POINT'); pl.energy = e_l; pl.color = col_l
        po = bpy.data.objects.new(f"Lum{pu}", pl); po.location = Vector(b_ctr(pu)); sc.collection.objects.link(po)
    snap(sc, co, cd, b_ctr(0.14), b_ctr(0.55), "v2_bloodstream_interior.png", 24)

    # 4. Muscle Sarcomere
    sc, co, cd = setup_render_scene()
    bpy.ops.import_scene.gltf(filepath=os.path.join(MODELS_DIR, "muscle_sarcomere.glb"))
    snap(sc, co, cd, (0.55, 1.85, 0.75), (0.0, 0.0, 0.0), "v2_sarcomere.png", 38)

    # 5. Mitochondrion Cathedral & Close-up on PDB 8H9T ATP Synthase
    sc, co, cd = setup_render_scene(bg=(0.03, 0.02, 0.07, 1.0), strength=0.5)
    bpy.ops.import_scene.gltf(filepath=os.path.join(MODELS_DIR, "mitochondrion.glb"))
    pl_m = bpy.data.lights.new("MitoKey", 'POINT'); pl_m.energy = 150.0; pl_m.color = (1.0, 0.88, 0.68)
    po_m = bpy.data.objects.new("MitoKey", pl_m); po_m.location = Vector((0.35, -1.45, 0.85)); sc.collection.objects.link(po_m)
    snap(sc, co, cd, (0.20, -2.55, 0.72), (0.10, 0.10, 0.24), "v2_mitochondrion.png", 36)
    snap(sc, co, cd, (1.15, -1.15, 0.62), (0.68, -0.04, 0.34), "v2_atp_synthase_close.png", 48)

    # 6. Brain Macro (Allen Brain Atlas)
    sc, co, cd = setup_render_scene()
    bpy.ops.import_scene.gltf(filepath=os.path.join(MODELS_DIR, "brain_macro.glb"))
    snap(sc, co, cd, (1.65, -1.75, 0.55), (0.0, 0.0, -0.05), "v2_brain_macro.png", 40)

    # 7. Neural Forest
    sc, co, cd = setup_render_scene(bg=(0.02, 0.03, 0.08, 1.0), strength=0.55)
    bpy.ops.import_scene.gltf(filepath=os.path.join(MODELS_DIR, "neural_forest.glb"))
    snap(sc, co, cd, (1.35, -2.75, 0.55), (0.0, 0.45, 0.25), "v2_neural_forest.png", 34)

    # 8. Molecular Synapse Hero
    sc, co, cd = setup_render_scene(bg=(0.02, 0.035, 0.08, 1.0), strength=0.65)
    bpy.ops.import_scene.gltf(filepath=os.path.join(MODELS_DIR, "synapse_hero.glb"))
    snap(sc, co, cd, (0.25, -1.65, 0.35), (-0.05, 0.0, 0.0), "v2_synapse_hero.png", 40)


if __name__ == "__main__":
    main()
