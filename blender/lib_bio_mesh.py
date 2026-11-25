"""
Shared anatomical and molecular procedural modeling utilities for Blender 5.2+ LTS.
Upgraded for high-resolution organic silhouettes, continuous smooth-shaded surfaces,
and zero artifacts at tube caps or joint junctions.
"""
import math
import bpy
import bmesh
from mathutils import Vector, Matrix, Euler


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def ensure_collection(name: str, parent=None):
    if name in bpy.data.collections:
        return bpy.data.collections[name]
    col = bpy.data.collections.new(name)
    if parent is None:
        bpy.context.scene.collection.children.link(col)
    else:
        parent.children.link(col)
    return col


def link_obj(obj, collection=None):
    target = collection if collection is not None else bpy.context.scene.collection
    if obj.name not in target.objects:
        target.objects.link(obj)
    return obj


def create_empty(name: str, location=(0.0, 0.0, 0.0), parent=None, collection=None):
    empty = bpy.data.objects.new(name, None)
    empty.empty_display_type = 'PLAIN_AXES'
    empty.empty_display_size = 0.06
    empty.location = Vector(location)
    if parent is not None:
        empty.parent = parent
    link_obj(empty, collection)
    return empty


def make_pbr_material(
    name: str,
    base_color=(0.8, 0.2, 0.2, 1.0),
    roughness=0.45,
    metallic=0.0,
    emission_color=(0.0, 0.0, 0.0, 1.0),
    emission_strength=0.0,
    transmission=0.0,
    ior=1.45,
    alpha=1.0,
    coat_weight=0.0,
    subsurface_weight=0.0,
):
    if name in bpy.data.materials:
        return bpy.data.materials[name]
    mat = bpy.data.materials.new(name=name)
    nt = mat.node_tree
    bsdf = None
    for node in nt.nodes:
        if node.type == 'BSDF_PRINCIPLED':
            bsdf = node
            break
    if bsdf is None:
        bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')

    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    if 'Emission Color' in bsdf.inputs:
        bsdf.inputs['Emission Color'].default_value = emission_color
    if 'Emission Strength' in bsdf.inputs:
        bsdf.inputs['Emission Strength'].default_value = emission_strength
    if 'Transmission Weight' in bsdf.inputs:
        bsdf.inputs['Transmission Weight'].default_value = transmission
    if 'IOR' in bsdf.inputs:
        bsdf.inputs['IOR'].default_value = ior
    if 'Alpha' in bsdf.inputs:
        bsdf.inputs['Alpha'].default_value = alpha
    if 'Coat Weight' in bsdf.inputs and coat_weight > 0:
        bsdf.inputs['Coat Weight'].default_value = coat_weight
        bsdf.inputs['Coat Roughness'].default_value = 0.14
    if 'Subsurface Weight' in bsdf.inputs and subsurface_weight > 0:
        bsdf.inputs['Subsurface Weight'].default_value = subsurface_weight

    if alpha < 0.99 or transmission > 0.05:
        mat.surface_render_method = 'BLENDED'
    return mat


def _parallel_transport_frames(points):
    """
    Computes twist-free parallel transport frames along a polyline of 3D points
    so curved tubes never pinch or invert.
    """
    n = len(points)
    tangents = []
    for i in range(n):
        if i == 0:
            t = points[1] - points[0]
        elif i == n - 1:
            t = points[-1] - points[-2]
        else:
            t = points[i + 1] - points[i - 1]
        if t.length < 1e-7:
            t = Vector((0.0, 0.0, 1.0))
        else:
            t.normalize()
        tangents.append(t)

    up = Vector((0.0, 0.0, 1.0)) if abs(tangents[0].z) < 0.9 else Vector((1.0, 0.0, 0.0))
    n0 = tangents[0].cross(up).normalized()
    b0 = tangents[0].cross(n0).normalized()
    frames = [(n0, b0, tangents[0])]

    for i in range(1, n):
        prev_n, prev_b, prev_t = frames[-1]
        curr_t = tangents[i]
        rot = prev_t.rotation_difference(curr_t)
        curr_n = (rot @ prev_n).normalized()
        curr_b = curr_t.cross(curr_n).normalized()
        frames.append((curr_n, curr_b, curr_t))
    return frames


def add_lofted_profile_to_bm(
    bm: bmesh.types.BMesh,
    stations,
    rings=20,
    cap_ends=True,
    noise_amp=0.0,
    noise_freq=6.0,
    seed=1.0,
    dome_factor=0.35,
):
    """
    Lofts a smooth organic anatomical volume along stations with twist-free frames:
    Each station is (pos, rx, ry, twist).
    """
    if len(stations) < 2:
        return
    pts = [Vector(st[0]) for st in stations]
    frames = _parallel_transport_frames(pts)
    ring_verts = []

    for i, st in enumerate(stations):
        pos = pts[i]
        rx = float(st[1])
        ry = float(st[2])
        twist = float(st[3]) if len(st) > 3 else 0.0
        n_vec, b_vec, _ = frames[i]

        row = []
        for j in range(rings):
            ang = (2.0 * math.pi * j) / rings + twist
            ca = math.cos(ang)
            sa = math.sin(ang)
            mod = 1.0
            if noise_amp > 0.0:
                mod += noise_amp * math.sin(ang * noise_freq + i * 0.75 + seed)
            offset = n_vec * (ca * rx * mod) + b_vec * (sa * ry * mod)
            row.append(bm.verts.new(pos + offset))
        ring_verts.append(row)

    for i in range(len(stations) - 1):
        r0 = ring_verts[i]
        r1 = ring_verts[i + 1]
        for j in range(rings):
            jn = (j + 1) % rings
            try:
                bm.faces.new((r0[j], r0[jn], r1[jn], r1[j]))
            except ValueError:
                pass

    if cap_ends:
        # Start dome cap
        t0 = -frames[0][2]
        c0 = bm.verts.new(pts[0] + t0 * min(stations[0][1], stations[0][2]) * dome_factor)
        for j in range(rings):
            jn = (j + 1) % rings
            try:
                bm.faces.new((ring_verts[0][jn], ring_verts[0][j], c0))
            except ValueError:
                pass

        # End dome cap
        t1 = frames[-1][2]
        c1 = bm.verts.new(pts[-1] + t1 * min(stations[-1][1], stations[-1][2]) * dome_factor)
        for j in range(rings):
            jn = (j + 1) % rings
            try:
                bm.faces.new((ring_verts[-1][j], ring_verts[-1][jn], c1))
            except ValueError:
                pass


def add_tube_along_points(bm: bmesh.types.BMesh, points, radii, rings=12, cap_ends=True):
    # Subdivide long straight segments slightly for smooth caps
    pts = [Vector(p) for p in points]
    rlist = list(radii) if isinstance(radii, (list, tuple)) else [float(radii)] * len(pts)
    stations = [(pts[i], rlist[i], rlist[i], 0.0) for i in range(len(pts))]
    add_lofted_profile_to_bm(bm, stations, rings=rings, cap_ends=cap_ends, dome_factor=0.30)


def add_uv_sphere_to_bm(bm: bmesh.types.BMesh, center, radii=(1.0, 1.0, 1.0), u_seg=18, v_seg=12, rot_euler=(0, 0, 0)):
    mat = Matrix.Translation(Vector(center)) @ Euler(rot_euler, 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal((*radii, 1.0))
    bmesh.ops.create_uvsphere(bm, u_segments=u_seg, v_segments=v_seg, radius=1.0, matrix=mat)


def add_box_to_bm(bm: bmesh.types.BMesh, center, half_extents, rot_euler=(0, 0, 0)):
    mat = Matrix.Translation(Vector(center)) @ Euler(rot_euler, 'XYZ').to_matrix().to_4x4() @ Matrix.Diagonal((*half_extents, 1.0))
    bmesh.ops.create_cube(bm, size=2.0, matrix=mat)


def finish_bmesh_object(
    name: str,
    bm: bmesh.types.BMesh,
    material=None,
    parent=None,
    collection=None,
    location=(0.0, 0.0, 0.0),
    smooth=True,
    subsurf_levels=0,
):
    bm.normal_update()
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    if smooth:
        for poly in mesh.polygons:
            poly.use_smooth = True

    obj = bpy.data.objects.new(name, mesh)
    obj.location = Vector(location)
    if material is not None:
        obj.data.materials.append(material)
    if parent is not None:
        obj.parent = parent
    link_obj(obj, collection)

    if subsurf_levels > 0:
        mod = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        mod.levels = subsurf_levels
        mod.render_levels = subsurf_levels

    return obj


def export_hierarchy_glb(root_obj, filepath: str):
    bpy.ops.object.select_all(action='DESELECT')
    stack = [root_obj]
    while stack:
        curr = stack.pop()
        curr.select_set(True)
        for child in curr.children:
            stack.append(child)
    bpy.context.view_layer.objects.active = root_obj
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_animations=False,
        export_cameras=False,
        export_lights=False,
        export_extras=True,
        export_yup=True,
        export_materials='EXPORT',
        export_image_format='AUTO',
        export_draco_mesh_compression_enable=False,
    )
    print(f"[EXPORTED] {filepath}")
