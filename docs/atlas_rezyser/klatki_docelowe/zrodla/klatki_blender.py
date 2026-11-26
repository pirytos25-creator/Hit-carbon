# Klatki docelowe Reżysera (poprzeczka jakości). Headless Blender 5.2, EEVEE, przezroczyste tło.
# Użycie: blender -b --factory-startup --python klatki.py -- <tryb: A|B|C> <katalog wyjścia>
# A: serce HuBMAP w przekroju czołowym, krwinki w jamach (lewa = artery, prawa = vein).
# B: całe ciało w kamerze planszy (orto 1,80319) + zbliżenie uda; krwinki wzdłuż flows3d, spoczynek i sprint.
# C: wejście w serce: kamera perspektywiczna przy klatce piersiowej, ciało wygaszone.
# Geometria: Z-Anatomy (CC BY-SA 4.0), HuBMAP (CC BY 4.0). Krwinka: profil Evansa–Funga (1972), powiększona (skala umowna).
import bpy, bmesh, json, math, random, sys
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

argv = sys.argv[sys.argv.index('--') + 1:]
MODE, OUT = argv[0], argv[1]
R = r"C:/Users/piryt/Desktop/Luźny Vibecoading/HIIt/"
random.seed(7)

PAL = dict(artery='#D93240', vein='#3E6FD8', bone='#D8D1C4', muscle='#8E7A78', skin='#9AA4B5',
           artery_l='#F07A84', vein_l='#86A6EE')
def hx(h, a=1.0):
    h = h.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (a,)
def mix(a, b, t):  # t = udział b
    A, B = hx(a), hx(b); return tuple(A[i] * (1 - t) + B[i] * t for i in range(3)) + (1,)

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    for eng in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE'):
        try: sc.render.engine = eng; break
        except TypeError: pass
    sc.render.film_transparent = True
    sc.view_settings.view_transform = 'Standard'
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
    w = bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True
    bg = next(n for n in w.node_tree.nodes if n.type == 'BACKGROUND'); bg.inputs[0].default_value = hx('#1b2236'); bg.inputs[1].default_value = 0.35
    return sc

def mat(name, col, rough=0.7, sss=0.0, alpha=1.0, inner=None, cut_y=None, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links
    p = next(n for n in N if n.type == 'BSDF_PRINCIPLED'); out = next(n for n in N if n.type == 'OUTPUT_MATERIAL')
    p.inputs['Roughness'].default_value = rough
    for k in ('Specular IOR Level',):
        if k in p.inputs: p.inputs[k].default_value = 0.3
    if 'Coat Weight' in p.inputs: p.inputs['Coat Weight'].default_value = 0.0
    if sss and 'Subsurface Weight' in p.inputs:
        p.inputs['Subsurface Weight'].default_value = sss; p.inputs['Subsurface Radius'].default_value = (0.02, 0.006, 0.004)
    base = col if isinstance(col, tuple) else hx(col)
    if inner:  # tylne ścianki (wnętrze po cięciu) w jaśniejszym tonie
        bf = N.new('ShaderNodeNewGeometry'); mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'
        mx.inputs[6].default_value = base; mx.inputs[7].default_value = inner if isinstance(inner, tuple) else hx(inner)
        L.new(bf.outputs['Backfacing'], mx.inputs[0]); L.new(mx.outputs[2], p.inputs['Base Color'])
    else:
        p.inputs['Base Color'].default_value = base
    if emit:
        p.inputs['Emission Color'].default_value = base; p.inputs['Emission Strength'].default_value = emit
    shader = p.outputs[0]
    if alpha < 1.0 or cut_y is not None:
        tr = N.new('ShaderNodeBsdfTransparent'); ms = N.new('ShaderNodeMixShader')
        if cut_y is not None:  # usuń wszystko przed płaszczyzną y = cut_y (przód ciała to −Y)
            g = N.new('ShaderNodeNewGeometry'); sep = N.new('ShaderNodeSeparateXYZ'); cmp = N.new('ShaderNodeMath'); cmp.operation = 'GREATER_THAN'
            cmp.inputs[1].default_value = cut_y; L.new(g.outputs['Position'], sep.inputs[0]); L.new(sep.outputs['Y'], cmp.inputs[0])
            L.new(cmp.outputs[0], ms.inputs[0]); L.new(tr.outputs[0], ms.inputs[1]); L.new(shader, ms.inputs[2])
        else:
            ms.inputs[0].default_value = alpha; L.new(tr.outputs[0], ms.inputs[1]); L.new(shader, ms.inputs[2])
        shader = ms.outputs[0]
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass
    L.new(shader, out.inputs['Surface'])
    return m

def rbc_mesh(diam):
    # Profil Evansa–Funga: grubość h(r) = sqrt(1-ρ²)(C0 + C2 ρ² + C4 ρ⁴), ρ = r/R0; R0 = 3,91 µm, C0 = 0,81, C2 = 7,83, C4 = −4,39 (µm).
    R0, C0, C2, C4 = 3.91, 0.81, 7.83, -4.39; s = diam / (2 * R0)
    bm = bmesh.new(); rings, seg = 14, 28; prof = []
    for i in range(rings + 1):
        rho = min(0.999, i / rings); h = math.sqrt(1 - rho ** 2) * (C0 + C2 * rho ** 2 + C4 * rho ** 4)
        prof.append((rho * R0 * s, 0.5 * h * s))
    top, bot = [], []
    for (r, hz) in prof:
        top.append([bm.verts.new((r * math.cos(2 * math.pi * k / seg), r * math.sin(2 * math.pi * k / seg), hz)) for k in range(seg)])
        bot.append([bm.verts.new((r * math.cos(2 * math.pi * k / seg), r * math.sin(2 * math.pi * k / seg), -hz)) for k in range(seg)])
    for layer, flip in ((top, False), (bot, True)):
        for i in range(rings):
            for k in range(seg):
                q = [layer[i][k], layer[i][(k + 1) % seg], layer[i + 1][(k + 1) % seg], layer[i + 1][k]]
                bm.faces.new(q[::-1] if flip else q)
    for k in range(seg):  # domknięcie brzegu
        bm.faces.new([top[-1][k], bot[-1][k], bot[-1][(k + 1) % seg], top[-1][(k + 1) % seg]])
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=diam * 1e-4)
    me = bpy.data.meshes.new('rbc'); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    return me

def place_cells(me, material, pts, dirs=None, jitter=0.6):
    coll = bpy.data.collections.new('krwinki_' + material.name); bpy.context.scene.collection.children.link(coll)
    me.materials.clear(); me.materials.append(material)
    for i, p in enumerate(pts):
        o = bpy.data.objects.new('rbc', me); o.location = p
        d = dirs[i] if dirs else Vector((random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-1, 1)))
        # oś dysku prostopadle do kierunku przepływu (krwinka płynie „płasko”), z rozrzutem
        ax = d.normalized().orthogonal().normalized()
        ax = (ax + Vector((random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-1, 1))) * jitter).normalized()
        o.rotation_euler = ax.to_track_quat('Z', 'Y').to_euler()
        coll.objects.link(o)

def lights(target, dist, scale=1.0):
    def area(name, loc, energy, size, col='#ffffff'):
        l = bpy.data.lights.new(name, 'AREA'); l.energy = energy * scale; l.size = size; l.color = hx(col)[:3]
        o = bpy.data.objects.new(name, l); o.location = target + Vector(loc) * dist
        o.rotation_euler = (target - o.location).to_track_quat('-Z', 'Y').to_euler(); bpy.context.scene.collection.objects.link(o)
    area('klucz', (-0.8, -1.0, 0.9), 220, 1.2 * dist)       # lewa-góra-przód
    area('wypelnienie', (1.0, -0.8, 0.1), 70, 1.5 * dist)   # prawa
    area('kontra', (0.3, 1.2, 0.6), 160, 0.8 * dist, '#cfe0ff')  # z tyłu: odcięcie od tła

def cam(loc, target, lens=None, ortho=None):
    c = bpy.data.cameras.new('K'); o = bpy.data.objects.new('K', c); bpy.context.scene.collection.objects.link(o)
    o.location = loc; o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    if ortho: c.type = 'ORTHO'; c.ortho_scale = ortho
    else: c.lens = lens or 85
    c.clip_start = 0.001; bpy.context.scene.camera = o; return o

def imp(path):
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=R + path)
    return [o for o in bpy.data.objects if o not in before and o.type == 'MESH']

# ------------------------------------------------------------------ serce HuBMAP z krwinkami
def heart(align=False, cut_y_raw=-0.047, n_cells=1400, cell_d=0.0026):
    objs = imp('atlas_raw/hubmap/VH_M_Heart.glb')
    T = Matrix.Translation((0.00248, -0.00142, 0.80971)) @ Matrix.Scale(0.98636, 4) if align else Matrix.Identity(4)
    for o in objs: o.matrix_world = T @ o.matrix_world
    bpy.context.view_layer.update()
    cut = (T @ Vector((0, cut_y_raw, 0))).y
    wall = mix(PAL['artery'], '#4a2a2e', 0.55); wall_in = mix(PAL['artery'], '#8e6a6c', 0.55)
    valve = mix(PAL['bone'], '#6b6460', 0.35)
    M_wall = mat('sciana', wall, 0.62, 0.08, inner=wall_in, cut_y=cut)
    M_sept = mat('przegroda', wall, 0.62, 0.08, inner=wall_in, cut_y=cut)
    M_valve = mat('zastawka', valve, 0.55, 0.05)
    M_pap = mat('brodawkowate', mix(PAL['artery'], '#4a2a2e', 0.45), 0.6, 0.08)
    cav = {}
    for o in objs:
        n = o.name.lower(); o.data.materials.clear()
        if 'valve' in n: o.data.materials.append(M_valve)
        elif 'papillary' in n: o.data.materials.append(M_pap)
        elif 'septum' in n: o.data.materials.append(M_sept)
        else: o.data.materials.append(M_wall)
        if 'ventricle' in n or 'atrium' in n: cav[n] = o
    # punkty we wnętrzu jam: 6 promieni musi trafić w ścianę tej samej jamy (punkt otoczony),
    # a parzysta liczba przecięć w górę oznacza, że punkt nie leży w samej ścianie
    def bvh(o):
        bm = bmesh.new(); bm.from_mesh(o.data); bm.transform(o.matrix_world); t = BVHTree.FromBMesh(bm); bm.free(); return t
    dirs6 = [Vector(v) for v in ((1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1))]
    left, right, ldir, rdir = [], [], [], []
    valves = {o.name.lower(): sum((o.matrix_world @ v.co for v in o.data.vertices), Vector()) / len(o.data.vertices) for o in objs if 'valve' in o.name.lower()}
    def vc(key): return next(v for k, v in valves.items() if key in k)
    flow = {'left_ventricle': vc('aortic') - vc('mitral'), 'right_ventricle': vc('pulmonary') - vc('tricuspid'),
            'left_cardiac_atrium': vc('mitral') - (vc('mitral') + Vector((0, 0.03, 0.03))), 'right_cardiac_atrium': vc('tricuspid') - (vc('tricuspid') + Vector((0, 0.02, 0.04)))}
    for n, o in cav.items():
        t = bvh(o); bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
        mn = Vector([min(v[i] for v in bb) for i in range(3)]); mx_ = Vector([max(v[i] for v in bb) for i in range(3)])
        want = n_cells * (0.34 if 'ventricle' in n else 0.16); got = 0; tries = 0
        while got < want and tries < want * 60:
            tries += 1
            p = Vector([random.uniform(mn[i], mx_[i]) for i in range(3)])
            if p.y < cut + cell_d: continue  # tylko w zachowanej (tylnej) połowie
            if not all(t.ray_cast(p, d, 0.12)[0] is not None for d in dirs6): continue
            hits, q = 0, p.copy()
            for _ in range(6):
                h = t.ray_cast(q, Vector((0, 0, 1)), 0.2)
                if h[0] is None: break
                hits += 1; q = h[0] + Vector((0, 0, 1e-5))
            if hits % 2: continue  # w ścianie
            near = t.find_nearest(p)
            if near[3] is not None and near[3] < cell_d * 0.8: continue
            key = next(k for k in flow if k in n)
            (left if 'left' in n else right).append(p); (ldir if 'left' in n else rdir).append(flow[key]); got += 1
    me_l = rbc_mesh(cell_d); me_r = rbc_mesh(cell_d)
    place_cells(me_l, mat('krwinka_utl', PAL['artery'], 0.45, 0.15), left, ldir)
    place_cells(me_r, mat('krwinka_odtl', PAL['vein'], 0.45, 0.15), right, rdir)
    print('krwinki: lewe', len(left), 'prawe', len(right))
    bb = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    ctr = sum(bb, Vector()) / len(bb)
    return objs, ctr

# ------------------------------------------------------------------ ciało (pliki atlasu 3D)
def body(state, dim=1.0, ghost=0.0, vessel_alpha=1.0):
    sk = imp('public/atlas3d/_shared/za_skeleton.glb'); za = imp('public/atlas3d/krwionosny/za_body.glb'); hra = imp('public/atlas3d/krwionosny/hra_body.glb')
    t = 1.0 if state == 'sprint' else 0.0
    art = mix(PAL['artery'], PAL['muscle'], 0.35 * (1 - t)); ven = mix(PAL['vein'], PAL['muscle'], 0.35 * (1 - t))
    if dim < 1: art = tuple(c * dim for c in art[:3]) + (1,); ven = tuple(c * dim for c in ven[:3]) + (1,)
    bone = tuple(c * dim for c in hx(PAL['bone'])[:3]) + (1,)
    for o in sk + za + hra:
        n = o.name.lower(); o.data.materials.clear()
        va = ghost if ghost else vessel_alpha
        if 'silhouette' in n: o.data.materials.append(mat('sylwetka', PAL['skin'], 0.8, alpha=0.10 * (ghost * 4 if ghost else dim)))
        elif '|artery|' in n: o.data.materials.append(mat('tetnice', art, 0.6, 0.05, alpha=va))
        elif '|vein|' in n: o.data.materials.append(mat('zyly', ven, 0.6, 0.05, alpha=va))
        elif n.startswith('heart'): o.data.materials.append(mat('serce_cialo', mix(PAL['artery'], PAL['muscle'], 0.3 + 0.35 * (1 - t)), 0.6, 0.06))
        else: o.data.materials.append(mat('kosc', bone, 0.75, alpha=ghost if ghost else 1.0))
    return sk + za + hra

def flow_cells(state, cell_d=0.0075, mult=1.0, emit=0.05):
    f = json.load(open(R + 'public/atlas3d/krwionosny/flows3d.json', encoding='utf-8'))
    # 3 stopnie jakościowe (ILUSTRACJA, nie dane): gęstość krwinek na metr toru
    dens = {'rest': {'artery_leg': 55, 'vein_leg': 45, 'artery_head': 120, 'vein_head': 100},
            'sprint': {'artery_leg': 260, 'vein_leg': 200, 'artery_head': 130, 'vein_head': 110}}[state]
    out = {'artery': ([], []), 'vein': ([], [])}
    for fl in f['flows']:
        P = [Vector(p) for p in fl['points']]; segs = list(zip(P[:-1], P[1:]))
        length = sum((b - a).length for a, b in segs); n = int(length * dens.get(fl['id'], 60) * mult)
        acc = [0]
        for a, b in segs: acc.append(acc[-1] + (b - a).length)
        for _ in range(n):
            s = random.uniform(0, length); i = max(0, min(len(segs) - 1, next(k for k in range(len(acc) - 1) if acc[k + 1] >= s)))
            a, b = segs[i]; u = (s - acc[i]) / max(1e-6, (b - a).length); d = (b - a)
            off = d.normalized().orthogonal().normalized() * random.uniform(0, 0.0035)
            off.rotate(Matrix.Rotation(random.uniform(0, 2 * math.pi), 3, d.normalized()))
            out[fl['kind']][0].append(a.lerp(b, u) + off); out[fl['kind']][1].append(d)
    me_a = rbc_mesh(cell_d); me_v = rbc_mesh(cell_d)
    place_cells(me_a, mat('krwinka_t_' + state, PAL['artery_l'], 0.45, 0.15, emit=emit), *out['artery'], jitter=0.35)
    place_cells(me_v, mat('krwinka_z_' + state, PAL['vein_l'], 0.45, 0.15, emit=emit), *out['vein'], jitter=0.35)
    print(state, 'krwinki', len(out['artery'][0]), len(out['vein'][0]))

def render(sc, path, w, h, samples=48):
    sc.render.resolution_x, sc.render.resolution_y = w, h
    try: sc.eevee.taa_render_samples = samples
    except Exception: pass
    sc.render.filepath = path; bpy.ops.render.render(write_still=True); print('ZAPIS', path)

if MODE == 'A':
    sc = reset(); objs, c = heart(align=False)
    lights(c, 0.35, scale=0.016)
    cam(c + Vector((0.0, -0.42, 0.04)), c + Vector((0, 0, -0.004)), lens=85)
    render(sc, OUT + '/A_serce_przekroj.png', 1600, 1300)
elif MODE == 'B':
    for st in ('rest', 'sprint'):
        sc = reset(); body(st); flow_cells(st, cell_d=0.013, emit=0.35)
        lights(Vector((0, 0, 0.9)), 2.2, scale=1.0)
        cam(Vector((0, -6, 0.85701)), Vector((0, -0.00359, 0.85701)), ortho=1.80319)
        render(sc, OUT + f'/B_cialo_{st}.png', 1000, 1800)
        sc = reset(); body(st, vessel_alpha=0.32); flow_cells(st, cell_d=0.0065, mult=3.0, emit=0.1)
        lights(Vector((-0.08, 0, 0.75)), 1.2, scale=0.5)
        cam(Vector((-0.33, -0.5, 0.86)), Vector((-0.085, -0.01, 0.76)), lens=70)
        render(sc, OUT + f'/B_udo_{st}.png', 1200, 1200)
elif MODE == 'C':
    sc = reset(); body('sprint', dim=0.45, ghost=0.12); objs, c = heart(align=True, n_cells=1100)
    for o in bpy.data.objects:  # serce z atlasu (hra) ukryte, zostaje serce HuBMAP w przekroju
        if o.name.lower().startswith('heart|'): o.hide_render = True
    lights(c, 0.6, scale=0.05)
    cam(c + Vector((-0.07, -0.20, 0.06)), c + Vector((0.006, 0, -0.008)), lens=32)
    render(sc, OUT + '/C_wejscie_w_serce.png', 1600, 1000)
