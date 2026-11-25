"""
Plansza: UKŁAD KRWIONOŚNY (faza 1, agent 5). Zasady: docs/ATLAS_STYLE_BIBLE.md
  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/plate_krwionosny.py

Źródła geometrii:
  - HuBMAP v1.4 `3d-vh-m-blood-vasculature.glb` (CC BY 4.0): aorta i jej gałęzie przy sercu, żyły główne,
    naczynia wieńcowe, płucne, trzewne (wątroba, śledziona, nerki, jelito grube), żyły biodrowe.
  - HuBMAP v1.2 `VH_M_Heart.glb`: jamy serca (przedsionki, komory, przegroda).
  - Z-Anatomy (CC BY-SA 4.0): szkielet i skóra jako kontekst oraz punkty orientacyjne kości.
  HuBMAP NIE ma naczyń kończyn ani szyi powyżej łuku aorty, a Z-Anatomy ma tylko serce.
  Dlatego tętnice i żyły kończyn, szyi i głowy oraz tętnice biodrowe są tu budowane proceduralnie:
  rurki prowadzone po przebiegu podręcznikowym wzdłuż kości Z-Anatomy (schemat, nie skan).

Dopasowanie HuBMAP -> Z-Anatomy: podobieństwo (skala + przesunięcie) dopasowane metodą najmniejszych
kwadratów do środków 24 kręgów (HuBMAP `VH_M_Vertebrae.glb` C1-L5 vs kręgi Z-Anatomy).

Zmienne środowiskowe:
  ATLAS_QUICK=1         szybki podgląd: tylko widok `front`, stan sprint
  ATLAS_ANCHORS_ONLY=1  tylko kotwice (anchors.json), bez renderu
  ATLAS_ALIGN_CHECK=<folder>  render kontrolny dopasowania (kręgi HuBMAP na szkielecie Z-Anatomy), bez planszy
  ATLAS_DRY=1           tylko dopasowanie i statystyki
"""
import json
import os
import subprocess
import sys

import bpy
import numpy as np
from mathutils import Matrix, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402

HUB = os.path.join(al.RAW, "hubmap")
QUICK = bool(os.environ.get("ATLAS_QUICK"))
ANCHORS_ONLY = bool(os.environ.get("ATLAS_ANCHORS_ONLY"))
ALIGN_CHECK = os.environ.get("ATLAS_ALIGN_CHECK")
DRY = bool(os.environ.get("ATLAS_DRY"))

WORK = bpy.data.collections.new("KRW_work")  # robocza kolekcja (import, krzywe), poza sceną planszy
bpy.context.scene.collection.children.link(WORK)


# ============================================================ import HuBMAP
def import_glb(fname):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(HUB, fname))
    new = [o for o in bpy.data.objects if o not in before]
    print(f"KRW_IMPORT {fname}: {len(new)} obiektów")
    return new


def apply_to_roots(objs, M):
    for o in objs:
        if o.parent is None:
            o.matrix_world = M @ o.matrix_world
    bpy.context.view_layer.update()


_VC = {}


def V(obj):
    """Wierzchołki w układzie świata (numpy N×3). Bufor jest unieważniany po przesunięciu obiektów."""
    if isinstance(obj, str):
        obj = bpy.data.objects[obj]
    if obj.name not in _VC:
        me = obj.data
        a = np.empty(len(me.vertices) * 3, dtype=np.float32)
        me.vertices.foreach_get("co", a)
        M = np.array(obj.matrix_world)
        _VC[obj.name] = a.reshape(-1, 3).astype(np.float64) @ M[:3, :3].T + M[:3, 3]
    return _VC[obj.name]


# HuBMAP kręgi -> Z-Anatomy kręgi
def zanat_vertebra(hub_name):
    kind, num = hub_name.replace("VH_M_", "").rsplit("_", 1)
    num = int(num)
    if kind == "cervical_vertebra":
        return {1: "Atlas (C1)", 2: "Axis (C2)"}.get(num, f"Vertebra C{num}")
    if kind == "thoracic_vertebra":
        return f"Vertebra T{num}"
    return f"Vertebra L{num}"


vert_all = import_glb("VH_M_Vertebrae.glb")
vert_objs = [o for o in vert_all if o.type == "MESH"]
pairs = []
for o in vert_objs:
    zn = zanat_vertebra(o.name.split(".")[0])
    if zn in bpy.data.objects:
        pairs.append((V(o).mean(0), V(zn).mean(0), o.name, zn))
P = np.array([p[0] for p in pairs])
Q = np.array([p[1] for p in pairs])
pm, qm = P.mean(0), Q.mean(0)
SCALE = float(((P - pm) * (Q - qm)).sum() / ((P - pm) ** 2).sum())
T = qm - SCALE * pm
resid = np.linalg.norm(SCALE * P + T - Q, axis=1)
print(f"KRW_ALIGN pary={len(pairs)} skala={SCALE:.4f} przesunięcie={np.round(T, 4).tolist()} "
      f"błąd śr.={resid.mean() * 1000:.1f} mm maks.={resid.max() * 1000:.1f} mm")
ALIGN = Matrix.Translation(Vector(T.tolist())) @ Matrix.Scale(SCALE, 4)
apply_to_roots(vert_all, ALIGN)  # korzeń (pusty obiekt) niesie transformację dzieci
_VC.clear()

vasc = import_glb("3d-vh-m-blood-vasculature.glb")
heart = import_glb("VH_M_Heart.glb")
apply_to_roots(vasc + heart, ALIGN)
for o in vasc + heart + vert_all:
    for c in list(o.users_collection):
        c.objects.unlink(o)
    WORK.objects.link(o)


def H(name):
    """Obiekt HuBMAP po nazwie węzła (importer może dodać sufiks .001)."""
    o = bpy.data.objects.get(name)
    if o is None:
        o = next((x for x in bpy.data.objects if x.name.split(".")[0] == name and x.type == "MESH"), None)
    if o is None:
        raise KeyError(name)
    return o


vasc_meshes = [o for o in vasc if o.type == "MESH"]
heart_meshes = [o for o in heart if o.type == "MESH"]


# ============================================================ klasyfikacja naczyń HuBMAP
def hub_kind(name):
    """Zwraca (system koloru, grupa). Kolor = utlenowanie krwi (konwencja atlasów):
    pień i tętnice płucne niosą krew odtlenowaną -> kolor żył; żyły płucne -> kolor tętnic."""
    n = name.split(".")[0].lower()
    if "pulmonary_trunk" in n or "pulmonary_artery" in n:
        return "vein", "pulmonary"
    if "pulmonary_vein" in n:
        return "artery", "pulmonary"
    system = "vein" if ("vein" in n or "vena_cava" in n or "coronary_sinus" in n) else "artery"
    if "drummond" not in n and any(k in n for k in ("cardiac_artery", "coronary_artery", "descending_artery", "marginal", "diagonal")):
        return system, "coronary"
    if any(k in n for k in ("cardiac_vein", "coronary_sinus", "vein_of_left_atrium", "vein_of_left_ventricle")):
        return system, "coronary"
    if any(k in n for k in ("aorta", "aortic", "brachiocephalic", "carotid", "subclavian", "vena_cava")):
        return system, "great"
    if any(k in n for k in ("iliac", "pudendal", "sacral", "rectal")):
        return system, "pelvic"
    if any(k in n for k in ("ophthalm", "retinal", "ciliary")):
        return system, "eye"
    return system, "visceral"  # wątroba, śledziona, nerki, jelito grube, krezka, żyła wrotna


groups = {}
for o in vasc_meshes:
    s, g = hub_kind(o.name)
    groups.setdefault((s, g), []).append(o)
print("KRW_GROUPS", {f"{s}/{g}": len(v) for (s, g), v in sorted(groups.items())})
for (s, g), v in sorted(groups.items()):
    print("KRW_GROUP", s, g, sorted(o.name.split(".")[0].replace("VH_M_", "") for o in v))


# ============================================================ punkty orientacyjne kości Z-Anatomy
def sl(name, z, dz=0.006):
    """Przekrój poziomy kości na wysokości z: środek, min, maks (numpy)."""
    P_ = V(name)
    for k in (1, 2, 4, 8):
        m = np.abs(P_[:, 2] - z) < dz * k
        if m.sum() >= 8:
            Q_ = P_[m]
            return {"c": Q_.mean(0), "mn": Q_.min(0), "mx": Q_.max(0)}
    raise ValueError(f"pusty przekrój {name} z={z}")


def end_point(obj, direction, band=0.004):
    """Koniec naczynia HuBMAP w danym kierunku: środek i promień pierścienia wierzchołków."""
    P_ = V(obj)
    d = np.array(direction, dtype=np.float64)
    d /= np.linalg.norm(d)
    proj = P_ @ d
    ring = P_[proj > proj.max() - band]
    c = ring.mean(0)
    r = float(np.median(np.linalg.norm(ring - c, axis=1)))
    return Vector(c.tolist()), max(0.0015, min(r, 0.012))


def front_surface(objs, frac=0.12, zband=None):
    """Punkt na widocznej z przodu (-Y) powierzchni obiektu(ów), blisko środka tej powierzchni.
    zband=(a, b): tylko część obiektu między ułamkami a..b jego wysokości (0 = dół, 1 = góra)."""
    P_ = np.vstack([V(o) for o in objs])
    if zband:
        z0, z1 = P_[:, 2].min(), P_[:, 2].max()
        P_ = P_[(P_[:, 2] >= z0 + zband[0] * (z1 - z0)) & (P_[:, 2] <= z0 + zband[1] * (z1 - z0))]
    thr = np.quantile(P_[:, 1], frac)
    front = P_[P_[:, 1] <= thr]
    cxz = front[:, [0, 2]].mean(0)
    i = np.argmin(((front[:, [0, 2]] - cxz) ** 2).sum(1))
    return Vector(front[i].tolist())


def lerp(a, b, t):
    return a + (b - a) * t


def X(side):
    return -1.0 if side == "r" else 1.0  # strona prawa ciała leży po ujemnej stronie X


# ============================================================ rurki proceduralne
TUBES = {}  # nazwa -> (obiekt, system, grupa, punkty)


def tube(name, pts, radii, system, group):
    pts = [Vector(p) for p in pts]
    if isinstance(radii, (int, float)):
        radii = [radii] * len(pts)
    elif len(radii) == 2 and len(pts) > 2:
        radii = [radii[0] + (radii[1] - radii[0]) * i / (len(pts) - 1) for i in range(len(pts))]
    cd = bpy.data.curves.new(name, "CURVE")
    cd.dimensions = "3D"
    cd.resolution_u = 10
    cd.bevel_depth = 1.0
    cd.bevel_resolution = 4
    cd.use_fill_caps = True
    sp = cd.splines.new("BEZIER")
    sp.bezier_points.add(len(pts) - 1)
    for bp, p, r in zip(sp.bezier_points, pts, radii):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = "AUTO"
        bp.radius = r
    co = bpy.data.objects.new(name + "_crv", cd)
    WORK.objects.link(co)
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(co.evaluated_get(dg))
    me.shade_smooth()
    mo = bpy.data.objects.new(name, me)
    WORK.objects.link(mo)
    bpy.data.objects.remove(co, do_unlink=True)
    TUBES[name] = (mo, system, group, pts)
    return mo


def build_limb_and_neck_vessels():
    """Naczynia, których nie ma w HuBMAP. Przebieg wg podręcznikowej anatomii, punkty z kości Z-Anatomy."""
    # ---------- tętnice biodrowe (HuBMAP ma tylko żyły biodrowe)
    bif, r_aorta = end_point(H("VH_M_descending_aorta_b"), (0, 0, -1))
    for side in ("r", "l"):
        s = X(side)
        ext_v_name = "VH_M_external_iliac_vein_R" if side == "r" else "VH_M_external_iliac_vein_L"
        v0, rv0 = end_point(H(ext_v_name), (0.25 * s, -0.35, -0.9))
        a0 = v0 + Vector((0.013 * s, 0.002, 0.0))  # tętnica udowa leży bocznie od żyły
        ci_end = Vector((bif.x + 0.040 * s, bif.y + 0.004, bif.z - 0.055))
        tube(f"KRW_common_iliac_artery.{side}", [bif + Vector((0.004 * s, 0, 0.004)), lerp(bif, ci_end, 0.5) + Vector((0, -0.002, 0)), ci_end],
             (0.0058, 0.0052), "artery", "pelvic")
        tube(f"KRW_internal_iliac_artery.{side}",
             [ci_end, ci_end + Vector((0.006 * s, 0.018, -0.022)), ci_end + Vector((0.004 * s, 0.035, -0.06))],
             (0.004, 0.003), "artery", "pelvic")
        ei_mid = lerp(ci_end, a0, 0.55) + Vector((0.004 * s, -0.004, 0.006))
        tube(f"KRW_external_iliac_artery.{side}", [ci_end, ei_mid, a0], (0.005, 0.0048), "artery", "leg")

        # ---------- kończyna dolna
        F, T_, Fi = f"Femur.{side}", f"Tibia.{side}", f"Fibula.{side}"

        def med(sl_, d=0.0):  # krawędź przyśrodkowa przekroju + przesunięcie przyśrodkowe d
            return (sl_["mx"][0] if side == "r" else sl_["mn"][0]) - s * d

        def lat(sl_, d=0.0):
            return (sl_["mn"][0] if side == "r" else sl_["mx"][0]) + s * d

        f72, f62, f55, f49, f45 = (sl(F, z) for z in (0.72, 0.62, 0.55, 0.49, 0.45))
        t40, t36, t28, t20, t13, t10, t08 = (sl(T_, z) for z in (0.40, 0.36, 0.28, 0.20, 0.13, 0.10, 0.08))
        fi36, fi28, fi20, fi13 = (sl(Fi, z) for z in (0.36, 0.28, 0.20, 0.13))

        def gap(t_, fi_):  # przestrzeń międzykostna: między piszczelą a strzałką
            return 0.5 * (lat(t_) + med(fi_)), 0.5 * (t_["c"][1] + fi_["c"][1])

        fem = [
            a0,
            Vector((lerp(a0.x, med(f72, 0.004), 0.45), a0.y - 0.004, 0.80)),
            Vector((med(f72, 0.004), f72["mn"][1] - 0.022, 0.72)),
            Vector((med(f62, 0.001), f62["mn"][1] - 0.014, 0.62)),
            Vector((med(f55, -0.004), f55["c"][1] - 0.006, 0.55)),  # rozwór przywodzicieli: przejście do tyłu
        ]
        pop = [
            fem[-1],
            Vector((f49["c"][0] - s * 0.004, f49["mx"][1] + 0.008, 0.49)),
            Vector((f45["c"][0] - s * 0.002, f45["mx"][1] + 0.006, 0.45)),
            Vector((t40["c"][0], t40["mx"][1] + 0.006, 0.40)),
            Vector((t36["c"][0] + s * 0.004, t36["mx"][1] + 0.004, 0.37)),
        ]
        bif_leg = pop[-1]
        g36, g28, g20, g13 = gap(t36, fi36), gap(t28, fi28), gap(t20, fi20), gap(t13, fi13)
        talus = sl(f"Talus.{side}", 0.075)
        m1, m2 = bpy.data.objects[f"First metatarsal bone.{side}"], bpy.data.objects[f"Second metatarsal bone.{side}"]
        dp_x = 0.5 * (V(m1)[:, 0].mean() + V(m2)[:, 0].mean())
        dp_top = max(V(m1)[:, 2].max(), V(m2)[:, 2].max())
        ant_tib = [
            bif_leg,
            Vector((g36[0], g36[1] - 0.004, 0.355)),
            Vector((g28[0], g28[1] - 0.007, 0.28)),
            Vector((g20[0], g20[1] - 0.008, 0.20)),
            Vector((lerp(g13[0], t13["c"][0], 0.5), t13["mn"][1] - 0.004, 0.13)),
            Vector((t10["c"][0] + s * 0.006, t10["mn"][1] - 0.006, 0.10)),
            Vector((talus["c"][0], talus["mn"][1] - 0.006, 0.08)),  # przed stawem skokowym
        ]
        dors = [ant_tib[-1], Vector((dp_x, -0.022, dp_top + 0.006)), Vector((dp_x, -0.045, dp_top - 0.004))]
        post_tib = [
            bif_leg,
            Vector((t28["c"][0] - s * 0.004, t28["mx"][1] + 0.008, 0.30)),
            Vector((t20["c"][0] - s * 0.008, t20["mx"][1] + 0.006, 0.20)),
            Vector((med(t10, -0.004), t10["mx"][1] + 0.003, 0.10)),
            Vector((med(t08, 0.002), t08["c"][1] + 0.004, 0.06)),  # za kostką przyśrodkową
            Vector((med(t08, -0.010), -0.005, 0.03)),
        ]
        prof = [
            fem[1] + Vector((0, 0.004, -0.012)),
            Vector((med(f72, -0.006), f72["c"][1], 0.74)),
            Vector((med(f62, -0.002), f62["mx"][1] + 0.004, 0.64)),
            Vector((med(f55, 0.002), f55["mx"][1] + 0.006, 0.58)),
        ]
        tube(f"KRW_femoral_artery.{side}", fem + pop[1:2], (0.0047, 0.0042), "artery", "leg")
        tube(f"KRW_popliteal_artery.{side}", pop, (0.0042, 0.0036), "artery", "leg")
        tube(f"KRW_deep_femoral_artery.{side}", prof, (0.0036, 0.0024), "artery", "leg")
        tube(f"KRW_anterior_tibial_artery.{side}", ant_tib, (0.0028, 0.0022), "artery", "leg")
        tube(f"KRW_dorsalis_pedis_artery.{side}", dors, (0.0022, 0.0016), "artery", "leg")
        tube(f"KRW_posterior_tibial_artery.{side}", post_tib, (0.0028, 0.002), "artery", "leg")

        # żyły kończyny dolnej: towarzyszą tętnicom (przyśrodkowo / z tyłu) + żyła odpiszczelowa
        def off(pts, dx, dy, dz=0.0):
            return [p + Vector((dx, dy, dz)) for p in pts]

        fv = [v0] + [p + Vector((-s * d, 0.003 + e, 0)) for p, d, e in zip(fem[1:], (0.011, 0.010, 0.006, -0.002), (0, 0.001, 0.003, 0.006))]
        popv = off(pop, s * 0.004, 0.007)
        tube(f"KRW_femoral_vein.{side}", fv + popv[1:2], (max(rv0, 0.0055), 0.005), "vein", "leg")
        tube(f"KRW_popliteal_vein.{side}", popv, (0.005, 0.0042), "vein", "leg")
        tube(f"KRW_anterior_tibial_vein.{side}", [popv[-1]] + off(ant_tib[1:], s * 0.0045, 0.0015), (0.0024, 0.0018), "vein", "leg")
        tube(f"KRW_posterior_tibial_vein.{side}", [popv[-1]] + off(post_tib[1:], -s * 0.0045, 0.002), (0.0024, 0.0018), "vein", "leg")
        f68, f80 = sl(F, 0.68), sl(F, 0.80)
        t16, t38 = sl(T_, 0.16), sl(T_, 0.38)
        join = fv[1] + Vector((-s * 0.002, -0.006, 0.012))
        gsv = [
            Vector((V(m1)[:, 0].mean() - s * 0.004, -0.035, dp_top - 0.006)),
            Vector((med(t08, 0.004), t08["mn"][1] - 0.006, 0.085)),  # przed kostką przyśrodkową
            Vector((med(t16, 0.008), t16["c"][1] - 0.004, 0.16)),
            Vector((med(t28, 0.012), t28["c"][1], 0.28)),
            Vector((med(t38, 0.016), t38["c"][1] + 0.012, 0.38)),
            Vector((med(f45, 0.020), f45["c"][1] + 0.014, 0.45)),  # za kłykciem przyśrodkowym
            Vector((med(f55, 0.030), f55["c"][1] + 0.004, 0.56)),
            Vector((med(f68, 0.030), f68["mn"][1] + 0.004, 0.68)),
            Vector((lerp(med(f80, 0.022), join.x, 0.5), join.y - 0.008, 0.78)),
            join,
        ]
        tube(f"KRW_great_saphenous_vein.{side}", gsv, (0.0024, 0.0032), "vein", "leg")

    # ---------- szyja i kończyna górna
    bca_top, r_bca = end_point(H("VH_M_brachiocephalic_artery_b"), (0, 0, 1))
    lcca_top, r_lcca = end_point(H("VH_M_left_common_carotid_artery_b"), (0, 0, 1))
    lsa_top, r_lsa = end_point(H("VH_M_left_subclavian_artery_b"), (0.3, 0, 1))
    bcv_r, r_bcv_r = end_point(H("VH_M_brachiocephalic_vein_R"), (-0.6, 0, 0.8))
    bcv_l, r_bcv_l = end_point(H("VH_M_brachiocephalic_vein_L"), (0.75, 0, 0.65))
    for side in ("r", "l"):
        s = X(side)
        Hm, Ra, Ul, Cl = f"Humerus.{side}", f"Radius.{side}", f"Ulna.{side}", f"Clavicle.{side}"

        def med(sl_, d=0.0):
            return (sl_["mx"][0] if side == "r" else sl_["mn"][0]) - s * d

        def lat(sl_, d=0.0):
            return (sl_["mn"][0] if side == "r" else sl_["mx"][0]) + s * d

        cca0 = bca_top if side == "r" else lcca_top
        sa0 = bca_top if side == "r" else lsa_top
        c4 = sl("Vertebra C4", 1.49)
        cca_top = Vector((s * 0.026, c4["mn"][1] - 0.016, 1.492))
        cca = [cca0, Vector((lerp(cca0.x, cca_top.x, 0.6), lerp(cca0.y, cca_top.y, 0.5) - 0.004, lerp(cca0.z, 1.492, 0.45))), cca_top]
        tube(f"KRW_common_carotid_artery.{side}", cca, (0.0045, 0.0042), "artery", "neck")
        ica = [cca_top, cca_top + Vector((s * 0.002, 0.012, 0.03)), Vector((s * 0.024, c4["c"][1] - 0.002, 1.565))]
        tube(f"KRW_internal_carotid_artery.{side}", ica, (0.0036, 0.003), "artery", "neck")
        eca = [cca_top, cca_top + Vector((s * 0.006, -0.012, 0.025)), Vector((s * 0.052, -0.004, 1.545)),
               Vector((s * 0.064, -0.002, 1.585)), Vector((s * 0.066, -0.010, 1.625)), Vector((s * 0.055, -0.045, 1.66))]
        tube(f"KRW_external_carotid_artery.{side}", eca, (0.003, 0.0016), "artery", "neck")
        fac = [eca[1], Vector((s * 0.042, -0.050, 1.505)), Vector((s * 0.036, -0.074, 1.53)), Vector((s * 0.022, -0.086, 1.56))]
        tube(f"KRW_facial_artery.{side}", fac, (0.0022, 0.0014), "artery", "neck")

        # żyły szyi
        bcv = bcv_r if side == "r" else bcv_l
        ijv = [bcv, Vector((s * 0.040, bcv.y - 0.004, 1.43)), Vector((s * 0.042, c4["mn"][1] - 0.006, 1.49)),
               Vector((s * 0.040, c4["c"][1] + 0.004, 1.555))]
        tube(f"KRW_internal_jugular_vein.{side}", ijv, (0.0062, 0.005), "vein", "neck")

        # tętnica podobojczykowa -> pachowa -> ramienna -> promieniowa / łokciowa
        cl = sl(Cl, sl(Cl, 1.40)["c"][2])
        h30, h22, h15, h11 = (sl(Hm, z) for z in (1.30, 1.22, 1.15, 1.11))
        r05, r95, r88 = (sl(Ra, z) for z in (1.04, 0.95, 0.88))
        u05, u95, u88 = (sl(Ul, z) for z in (1.04, 0.95, 0.88))
        sub = [sa0, sa0 + Vector((s * 0.020, 0.004, 0.022)), Vector((s * 0.075, 0.006, 1.425)),
               Vector((s * 0.105, cl["c"][1] + 0.012, 1.392))]
        axi = [sub[-1], Vector((s * 0.135, 0.006, 1.355)), Vector((med(h30, 0.012), h30["c"][1] - 0.004, 1.30))]
        bra = [axi[-1], Vector((med(h22, 0.010), h22["mn"][1] - 0.004, 1.22)), Vector((med(h15, 0.012), h15["mn"][1] - 0.008, 1.15)),
               Vector((lerp(h11["c"][0], med(h11), 0.3), h11["mn"][1] - 0.014, 1.10)), Vector((lerp(r05["c"][0], u05["c"][0], 0.5), r05["mn"][1] - 0.012, 1.06))]
        bif_arm = bra[-1]
        rad = [bif_arm, Vector((r95["c"][0] + s * 0.002, r95["mn"][1] - 0.006, 0.97)), Vector((lat(r88, -0.006), r88["mn"][1] - 0.005, 0.88))]
        uln = [bif_arm, Vector((u95["c"][0] - s * 0.004, u95["mn"][1] - 0.008, 0.97)), Vector((med(u88, -0.004), u88["mn"][1] - 0.006, 0.88))]
        mc2 = V(f"Second metacarpal bone.{side}")
        mc4 = V(f"Fourth metacarpal bone.{side}")
        arch_y = min(mc2[:, 1].min(), mc4[:, 1].min()) - 0.006
        arch = [uln[-1], Vector((mc4[:, 0].mean(), arch_y, 0.835)), Vector((0.5 * (mc2[:, 0].mean() + mc4[:, 0].mean()), arch_y - 0.002, 0.822)),
                Vector((mc2[:, 0].mean() + s * 0.004, arch_y, 0.828))]
        tube(f"KRW_subclavian_artery.{side}", sub, (max(r_lsa, 0.0045) if side == "l" else 0.0048, 0.0045), "artery", "arm")
        tube(f"KRW_axillary_artery.{side}", axi, (0.0045, 0.0040), "artery", "arm")
        tube(f"KRW_brachial_artery.{side}", bra, (0.0038, 0.0032), "artery", "arm")
        tube(f"KRW_radial_artery.{side}", rad, (0.0024, 0.0020), "artery", "arm")
        tube(f"KRW_ulnar_artery.{side}", uln, (0.0025, 0.0020), "artery", "arm")
        tube(f"KRW_palmar_arch.{side}", arch, (0.0017, 0.0013), "artery", "arm")

        # żyły kończyny górnej
        subv = [bcv, Vector((s * 0.075, -0.006, 1.405)), Vector((s * 0.105, cl["c"][1] - 0.004, 1.378))]
        axv = [subv[-1], Vector((s * 0.135, -0.004, 1.345)), Vector((med(h30, 0.018), h30["c"][1] - 0.006, 1.29))]
        brv = [axv[-1]] + [p + Vector((-s * 0.006, 0.003, 0)) for p in bra[1:4]]
        tube(f"KRW_subclavian_vein.{side}", subv, (max(r_bcv_r if side == "r" else r_bcv_l, 0.005), 0.0052), "vein", "arm")
        tube(f"KRW_axillary_vein.{side}", axv, (0.0052, 0.0046), "vein", "arm")
        tube(f"KRW_brachial_vein.{side}", brv, (0.003, 0.0025), "vein", "arm")
        bas = [brv[1], Vector((med(h15, 0.024), h15["c"][1], 1.15)), Vector((med(h11, 0.022), h11["c"][1] - 0.004, 1.09)),
               Vector((med(u95, 0.012), u95["c"][1] - 0.006, 0.97)), Vector((med(u88, 0.006), u88["c"][1] - 0.004, 0.88))]
        tube(f"KRW_basilic_vein.{side}", bas, (0.003, 0.0024), "vein", "arm")
        ceph = [axv[0] + Vector((s * 0.01, -0.02, -0.004)), Vector((s * 0.145, -0.04, 1.34)), Vector((lat(h22, 0.006), h22["mn"][1] + 0.004, 1.22)),
                Vector((lat(h11, 0.008), h11["c"][1] - 0.008, 1.09)), Vector((lat(r95, 0.010), r95["c"][1] - 0.004, 0.97)),
                Vector((lat(r88, 0.006), r88["c"][1] - 0.004, 0.88))]
        tube(f"KRW_cephalic_vein.{side}", ceph, (0.0026, 0.0022), "vein", "arm")
        mcv = [ceph[3] + Vector((0, -0.004, -0.012)), Vector((lerp(ceph[3].x, bas[2].x, 0.5), h11["mn"][1] - 0.02, 1.085)), bas[2] + Vector((0, -0.003, 0.012))]
        tube(f"KRW_median_cubital_vein.{side}", mcv, 0.002, "vein", "arm")
        ejv = [Vector((s * 0.050, -0.012, 1.535)), Vector((s * 0.056, -0.022, 1.47)), subv[1] + Vector((0, -0.006, 0.006))]
        tube(f"KRW_external_jugular_vein.{side}", ejv, (0.002, 0.0028), "vein", "neck")

    # prawa t. podobojczykowa i t. szyjna wspólna zaczynają się na rozwidleniu pnia ramienno-głowowego (bca_top)


build_limb_and_neck_vessels()
print("KRW_TUBES", len(TUBES))

# ============================================================ kontekst: szkielet i skóra
SKIP_BONES = [r"sternum", r"costal cartilage", r"^Rib", r"rib\.", r"^First rib", r"^Second rib", r"xiphoid"]
bones = al.find_meshes(collection="1: Skeletal system", exclude=SKIP_BONES)
skin = al.find_meshes(collection="9: Regions of human body", exclude=[r"hair", r"eyebrow", r"eyelash", r"nail"])
print("KRW_CONTEXT bones", len(bones), "skin", len(skin))


# ============================================================ render kontrolny dopasowania
if ALIGN_CHECK:
    os.makedirs(ALIGN_CHECK, exist_ok=True)
    pl = al.Plate("krwionosny")
    pl.out_dir = ALIGN_CHECK  # obrazy kontrolne nie trafiają do public/
    all_bones = al.find_meshes(collection="1: Skeletal system")
    pl.add(all_bones, role="context_bone")
    pl.add(vert_objs, role="active", system="nerve")
    pl.add([o for o in vasc_meshes if hub_kind(o.name)[0] == "artery"], role="active", system="artery")
    pl.add([o for o in vasc_meshes if hub_kind(o.name)[0] == "vein"], role="active", system="vein")
    pl.add(heart_meshes, role="context_muscle")
    pl.add([t[0] for t in TUBES.values() if t[1] == "artery"], role="active", system="artery")
    pl.add([t[0] for t in TUBES.values() if t[1] == "vein"], role="active", system="vein")
    pl.frame_all()
    pl.render(views=("front", "side"), states=("sprint",))
    raise SystemExit(0)

if DRY:
    raise SystemExit(0)


# ============================================================ poziomy pracy w sprincie
# level: 1.0 = pracuje najmocniej, "dim" = przygaszone (wygląd jak w spoczynku, bez emisji).
# Emisja tylko od poziomu 0.9 w górę ("struktury, które naprawdę pracują", księga §2).
SPRINT_LEVEL = {
    ("artery", "leg"): 1.0, ("vein", "leg"): 0.9,
    ("artery", "coronary"): 1.0, ("vein", "coronary"): 0.9,
    ("artery", "great"): 1.0, ("vein", "great"): 1.0,
    ("artery", "pulmonary"): 1.0, ("vein", "pulmonary"): 1.0,
    ("artery", "arm"): 0.8, ("vein", "arm"): 0.75,
    ("artery", "neck"): 0.7, ("vein", "neck"): 0.65,
    ("artery", "pelvic"): 0.6, ("vein", "pelvic"): 0.55,
    ("artery", "visceral"): "dim", ("vein", "visceral"): "dim",
}


def vessel_material(system, state, level):
    """Jak al.role_material('active'), ale kolor spoczynku miesza się z kolorem kontekstu MIĘŚNI/TŁA (#8E7A78),
    a nie kości. Przy kości (#D8D1C4) 35% domieszki daje prawie biel i tętnic nie da się odróżnić od żył."""
    sys_col = al.hex_to_linear(al.SYSTEM_COLORS[system])
    ctx = al.hex_to_linear(al.CONTEXT_COLORS["muscle"])
    if state == "rest" or level == "dim":
        t, emi = al.REST_MIX, 0.0
    else:
        t = max(al.REST_MIX, level)
        emi = 0.3 * level if level >= 0.9 else 0.0
    col = al.mix(ctx, sys_col, t)
    return al.make_material(f"KRW_{system}_{int(round(t * 100))}_{int(round(emi * 100))}", col,
                            roughness=0.55, subsurface=0.08, emission=emi)


class VascPlate(al.Plate):
    """Rozszerzenie lokalne (bez zmiany atlas_lib): widok `detail`, widoczność obiektów na widok,
    materiał mięśnia sercowego, poziom 'dim' i kotwice z dowolnych punktów 3D."""

    def _apply_state(self, state):
        for o, role, system, levels in self.items:
            if role == "heart":
                assign(o, heart_material(state))
            elif role == "active":
                assign(o, vessel_material(system, state, levels[state] if levels[state] is not None else 1.0))
            else:
                assign(o, al.role_material(role))

    def render_views(self, specs, states=("rest", "sprint"), webp_quality=88):
        path = os.path.join(self.out_dir, "anchors.json")
        meta = {"id": self.id, "resolution": list(self.res), "views": {}}
        if os.path.exists(path) and (QUICK or ANCHORS_ONLY):
            with open(path, encoding="utf-8") as f:
                old = json.load(f)
            meta["views"].update(old.get("views", {}))
        if QUICK:
            specs, states = specs[:1], ("sprint",)
        all_objs = [i[0] for i in self.items]
        for spec in specs:
            view = spec["view"]
            visible = set(spec.get("objects") or all_objs)
            for o in all_objs:
                o.hide_render = o not in visible
            self.center = spec["center"]
            self.ortho_scale = spec["ortho"]
            cam = self._camera("front")
            self._lights("front")
            vis = [o for o in all_objs if o in visible]
            mn, mx = al.world_bbox(vis)
            corners = [Vector((x, y, z)) for x in (mn.x, mx.x) for y in (mn.y, mx.y) for z in (mn.z, mx.z)]
            pts = [self._project(cam, c) for c in corners]
            bbox = [min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts)]
            vmeta = {"images": {}, "anchors": {}, "bbox": [round(max(0.0, min(1.0, v)), 4) for v in bbox]}
            for key, p in spec["anchors"].items():
                vmeta["anchors"][key] = self._project(cam, p)
            for state in states:
                vmeta["images"][state] = f"{view}_{state}.webp"
                if ANCHORS_ONLY:
                    continue
                self._apply_state(state)
                png = os.path.join(self.out_dir, f"{view}_{state}.png")
                self.scene.render.filepath = png
                bpy.ops.render.render(write_still=True, scene=self.scene.name)
                webp = png[:-4] + ".webp"
                try:
                    subprocess.run(["magick", png, "-quality", str(webp_quality), webp], check=True)
                    os.remove(png)
                except (OSError, subprocess.CalledProcessError) as e:
                    print("ATLAS: konwersja do webp nieudana, zostaje PNG:", e)
                    vmeta["images"][state] = f"{view}_{state}.png"
                print(f"ATLAS_RENDERED {self.id} {view} {state}")
            if QUICK and view in meta["views"]:
                vmeta["images"] = {**meta["views"][view].get("images", {}), **vmeta["images"]}
            meta["views"][view] = vmeta
            # rzut ścieżek przepływu (piksele renderu) dla AtlasFlow
            flows = {}
            for name, pts3 in spec.get("flows", {}).items():
                flows[name] = [[round(v * r) for v, r in zip(self._project(cam, p), self.res)] for p in pts3]
            if flows:
                print("KRW_FLOWS", view, json.dumps(flows))
        for o in all_objs:
            o.hide_render = False
        with open(path, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2, ensure_ascii=False)
        print("ATLAS_DONE", path)
        return meta


assign = al.assign
HEART_MIX = {"rest": 0.10, "sprint": 0.30}


def heart_material(state):
    """Mięsień sercowy: kolor kontekstu mięśni z domieszką koloru tętnic (w sprincie serce pracuje mocno).
    Naczynia wieńcowe (pełny kolor) muszą się od niego odcinać, dlatego nie jest w pełni czerwony."""
    col = al.mix(al.hex_to_linear(al.CONTEXT_COLORS["muscle"]), al.hex_to_linear(al.SYSTEM_COLORS["artery"]), HEART_MIX[state])
    emi = 0.0 if state == "rest" else 0.08
    return al.make_material(f"KRW_heart_{state}", col, roughness=0.6, subsurface=0.08, emission=emi)


plate = VascPlate("krwionosny")
plate.add(bones, role="context_bone")
plate.add(skin, role="context_skin")
heart_walls = [o for o in heart_meshes if not any(k in o.name for k in ("valve", "papillary"))]
plate.add(heart_walls, role="heart")
for (system, group), objs in sorted(groups.items()):
    if group == "eye":
        continue  # naczynia oka są w całości zasłonięte czaszką
    plate.add(objs, role="active", system=system, sprint_level=SPRINT_LEVEL[(system, group)])
for name, (mo, system, group, _) in sorted(TUBES.items()):
    plate.add([mo], role="active", system=system, sprint_level=SPRINT_LEVEL[(system, group)])

vessel_objs = [i[0] for i in plate.items if i[1] in ("active", "heart")]
body_objs = [i[0] for i in plate.items]
bmn, bmx = al.world_bbox(bones + skin)
aspect = plate.res[0] / plate.res[1]
front_center = (bmn + bmx) / 2
front_ortho = max(bmx.z - bmn.z, (bmx.x - bmn.x) / aspect) * 1.06

# zbliżenie serca: serce + wielkie naczynia (od żyły głównej dolnej do pni łuku aorty)
heart_set = heart_walls + [o for o in vasc_meshes if hub_kind(o.name)[1] in ("coronary", "great", "pulmonary")]
hmn, hmx = al.world_bbox(heart_walls)
detail_center = Vector(((hmn.x + hmx.x) / 2 + 0.002, 0, (hmn.z + hmx.z) / 2 + 0.034))
detail_ortho = 0.27
detail_objs = heart_set  # bez rurek szyi i kończyn: wielkie naczynia są "ucięte", jak w atlasie


def tube_at(name, t):
    pts = TUBES[name][3]
    i = min(int(t * (len(pts) - 1)), len(pts) - 2)
    f = t * (len(pts) - 1) - i
    return lerp(pts[i], pts[i + 1], f) + Vector((0, -0.003, 0))  # przednia ściana rurki


def hub_front(*names, zband=None):
    return front_surface([H(n) for n in names], zband=zband)


A_FRONT = {
    "carotid": tube_at("KRW_common_carotid_artery.r", 0.75),
    "jugular": tube_at("KRW_internal_jugular_vein.r", 0.78),
    "aortic_arch": hub_front("VH_M_aortic_arch"),
    "heart": hub_front("VH_M_heart_right_ventricle", "VH_M_heart_left_ventricle"),
    "brachial": tube_at("KRW_brachial_artery.r", 0.45),
    "portal": hub_front("VH_M_portal_vein", "VH_M_hepatic_portal_vein"),
    "femoral": tube_at("KRW_femoral_artery.r", 0.35),
    "saphenous": tube_at("KRW_great_saphenous_vein.r", 0.40),
    "anterior_tibial": tube_at("KRW_anterior_tibial_artery.r", 0.45),
}
A_DETAIL = {
    "d_aortic_arch": hub_front("VH_M_aortic_arch"),
    "d_pulmonary_trunk": hub_front("VH_M_pulmonary_trunk"),
    "d_lad": hub_front("VH_M_left_anterior_descending_artery", zband=(0.15, 0.45)),
    "d_left_ventricle": hub_front("VH_M_heart_left_ventricle"),
    "d_rca": hub_front("VH_M_right_coronary_artery"),
    "d_svc": hub_front("VH_M_superior_vena_cava"),
    "d_cardiac_vein": hub_front("VH_M_great_cardiac_vein", zband=(0.6, 1.0)),
}
# ścieżki strzałek przepływu (AtlasFlow): krew z aorty do stopy i z powrotem do serca
FLOWS_FRONT = {
    "artery_leg": [hub_front("VH_M_descending_aorta_b")] + TUBES["KRW_common_iliac_artery.r"][3][1:] + TUBES["KRW_external_iliac_artery.r"][3][1:]
    + TUBES["KRW_femoral_artery.r"][3][1:4] + TUBES["KRW_anterior_tibial_artery.r"][3][2:],
    "vein_leg": TUBES["KRW_great_saphenous_vein.r"][3][1:] + [hub_front("VH_M_inferior_vena_cava_b"), hub_front("VH_M_inferior_vena_cava_a")],
}

missing = [k for k, p in {**A_FRONT, **A_DETAIL}.items() if p is None]
print("KRW_ANCHORS", len(A_FRONT), len(A_DETAIL), "brak:", missing)

plate.render_views([
    {"view": "front", "center": front_center, "ortho": front_ortho, "objects": body_objs, "anchors": A_FRONT, "flows": FLOWS_FRONT},
    {"view": "detail", "center": detail_center, "ortho": detail_ortho, "objects": detail_objs, "anchors": A_DETAIL},
])
