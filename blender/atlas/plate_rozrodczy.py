"""
Karta UKŁAD ROZRODCZY (faza 1b, agent 12). Zasady: docs/ATLAS_STYLE_BIBLE.md, docs/ATLAS_AGENT_BRIEFS_1B.md §4 (Agent 12).
  blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend ^
      --python blender/atlas/plate_rozrodczy.py

To KARTA, nie plansza ze stanami (model §4 pkt 10): jeden render na widok, ten sam obraz dla "rest" i "sprint".
Dwie miednice obok siebie, w tej samej skali (ten sam ortho_scale i rozdzielczość) i z tego samego kierunku kamery:
  widok "side"    miednica męska: Z-Anatomy, kolekcja Genital systems' (jądra, najądrza, nasieniowody i przewody
                  wytryskowe jako krzywe, pęcherzyki nasienne, gruczoł krokowy, prącie) + kości miednicy Z-Anatomy.
  widok "detail"  miednica żeńska: HuBMAP VH_F (macica, jajniki, jajowody, pochwa, więzadła, naczynia maciczne)
                  na ŻEŃSKIEJ miednicy i kręgach HuBMAP (VH_F_Pelvis, VH_F_Vertebrae), sylwetka VH_F_skin (v1.3).
                  Narządów żeńskich NIE nakładamy na szkielet Z-Anatomy (model żeński leży ok. 7,4 cm od kręgów Z-Anatomy).
Kamera: z lewego boku ciała (+X), ujęcie jak przekrój strzałkowy w podręczniku: kość miedniczna strony bliższej
kamerze (lewa) jest ukryta, więc widać narządy na tle kości krzyżowej i prawej kości miednicznej.

Zmienne środowiskowe:
  ATLAS_QUICK=1         szybki podgląd (oba widoki, osobno)
  ATLAS_ANCHORS_ONLY=1  tylko kotwice, bez renderu
  REPRO_DIR=side|front  kierunek kamery dla obu miednic (domyślnie side; front tylko do porównań)
  ATLAS_OUT=<folder>    zapis renderów poza repozytorium (próby)
  ATLAS_FIT=<folder>    render kontrolny położenia narządów żeńskich w miednicy, kręgach i skórze HuBMAP + pomiary
"""
import json
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from mathutils import Vector  # noqa: E402
from mathutils.bvhtree import BVHTree  # noqa: E402

DIRECTION = os.environ.get("REPRO_DIR", "side")
FIT_DIR = os.environ.get("ATLAS_FIT")
OUT_DIR = os.environ.get("ATLAS_OUT")
FEMALE_DIR = os.path.join(al.HUBMAP_DIR, "female")
RES = (1000, 1250)
MARGIN = 1.08
V_MALE = "side" if DIRECTION == "side" else "front"  # identyfikator widoku męskiego (types.ts: front|back|side|detail)
V_FEMALE = "detail"


def r3(v):
    return [round(x, 4) for x in v]


# ---------------------------------------------------------------- miednica męska (Z-Anatomy)
GEN = "Genital systems'"
OB = bpy.data.objects
testes = [OB["Testis.l"], OB["Testis.r"]]
epididymis = [OB["Epididymis.l"], OB["Epididymis.r"]]
seminal = [OB["Seminal gland.l"], OB["Seminal gland.r"]]
prostate = [OB["Prostate"]]
penis = [OB["Corpus cavernosum of penis"], OB["Corpus spongiosum of penis"], OB["Glans penis"]]
deferens = [OB["Ductus deferens.l"], OB["Ductus deferens.r"]]
ejaculatory = [OB["Ejaculatory duct.l"], OB["Ejaculatory duct.r"]]
m_organs = testes + epididymis + seminal + prostate + penis
m_ducts = deferens + ejaculatory
bladder = [OB["Urinary bladder"]]
urethra = [OB["Urethra"]]
m_vessels_art = al.find_curves(include=[r"^Left testicular artery$", r"^Right testicular artery"])
m_vessels_vein = al.find_curves(include=[r"^(Left|Right) testicular vein$"])
near_m = ["Hip bone.l"] if DIRECTION == "side" else []
m_bones = [OB[n] for n in ("Hip bone.l", "Hip bone.r", "Sacrum", "Coccyx", "Vertebra L4", "Vertebra L5") if n not in near_m]
m_bones += [OB["Pubic symphysis"]]
print("REPRO_MALE organs", [o.name for o in m_organs], "ducts", [o.name for o in m_ducts],
      "vessels", [o.name for o in m_vessels_art + m_vessels_vein], "bones", [o.name for o in m_bones])
for o in m_ducts:
    pts = [p for sp in o.data.splines for p in (sp.bezier_points if sp.type == 'BEZIER' else sp.points)]
    print("REPRO_DUCT", o.name, "bevel", o.data.bevel_depth, "radius max", round(max(p.radius for p in pts), 2),
          "-> średnica mm", round(2000 * o.data.bevel_depth * max(p.radius for p in pts), 2))

# ---------------------------------------------------------------- miednica żeńska (HuBMAP VH_F)
F_ORGANS = ["VH_F_Uterus.glb", "VH_F_Ovary_L.glb", "VH_F_Ovary_R.glb", "VH_F_Fallopian_Tube_L.glb", "VH_F_Fallopian_Tube_R.glb",
            "VH_F_Vagina.glb", "VH_F_Ligaments_Uterus_Ovaries.glb", "VH_F_Blood_Vasculature_Uterus.glb"]
fem = {}
for f in F_ORGANS + ["VH_F_Pelvis.glb", "VH_F_Vertebrae.glb"]:
    fem[f] = al.import_glb(os.path.join(FEMALE_DIR, f), collection="ATL_female", source="hubmap:female/" + f)
all_f = [o for objs in fem.values() for o in objs]
al.align_hubmap(all_f, "female")


def F(name):
    return al.hub(all_f, name)


uterus = fem["VH_F_Uterus.glb"]
# Ujście brzuszne jajowodu jest w pliku macicy; to drobna siatka przy rogu macicy (zostaje z macicą).
ovaries = fem["VH_F_Ovary_L.glb"] + fem["VH_F_Ovary_R.glb"]
tubes = fem["VH_F_Fallopian_Tube_L.glb"] + fem["VH_F_Fallopian_Tube_R.glb"]
vagina = fem["VH_F_Vagina.glb"]
ligs = fem["VH_F_Ligaments_Uterus_Ovaries.glb"]
lig_broad = [o for o in ligs if "broad_ligament" in o.name or "uterovesical_pouch" in o.name]
lig_cords = [o for o in ligs if o not in lig_broad]
# Na karcie tylko więzadła jajnika (właściwe i wieszadłowe). Szerokie, poprzeczne szyjki, krzyżowo-maciczne, obłe,
# krezka jajowodu i jajnika zasłaniały macicę w widoku z boku (podgląd QUICK K1).
lig_card = [o for o in ligs if "ovarian_ligament" in o.name or "suspensory_ligament_of_ovary" in o.name]
f_vessels = fem["VH_F_Blood_Vasculature_Uterus.glb"]
f_art = [o for o in f_vessels if "artery" in o.name]
f_vein = [o for o in f_vessels if "vein" in o.name]
f_pelvis = fem["VH_F_Pelvis.glb"]
near_f = [o for o in f_pelvis if o.name.endswith("_L")] if DIRECTION == "side" else []
f_bones = [o for o in f_pelvis if o not in near_f]
f_vert = [o for o in fem["VH_F_Vertebrae.glb"] if any(k in o.name for k in ("lumbar_vertebra_5", "lumbar_vertebra_6"))]
f_organs = uterus + ovaries + tubes + vagina
# Pęcherz moczowy kobiety (kontekst): HuBMAP VH_F_Urinary_Bladder.glb (HRA v1.2, CC BY 4.0; pobrany 2026-11-25
# za zgodą użytkownika, w atlas_raw/hubmap/female/).
f_bladder = al.import_glb(os.path.join(FEMALE_DIR, "VH_F_Urinary_Bladder.glb"), collection="ATL_female",
                          source="hubmap:female/VH_F_Urinary_Bladder.glb")
al.align_hubmap(f_bladder, "female")
print("REPRO_F_BLADDER", [o.name for o in f_bladder])
print("REPRO_FEMALE organs", len(f_organs), "ligaments", [o.name for o in lig_cords], "broad", [o.name for o in lig_broad],
      "bones", len(f_bones), "vert", [o.name for o in f_vert])


# ---------------------------------------------------------------- pomiary położenia (render kontrolny K1)
def world_tree(o):
    """BVH w układzie ŚWIATA (BVHTree.FromObject daje współrzędne lokalne, a obiekty HuBMAP mają macierz dopasowania)."""
    me = o.data
    M = o.matrix_world
    verts = [M @ v.co for v in me.vertices]
    polys = [tuple(p.vertices) for p in me.polygons]
    return BVHTree.FromPolygons(verts, polys)


def _hits(trees, origin, direction):
    """Liczba przecięć promienia z powłoką (parzystość: nieparzysta = punkt wewnątrz)."""
    n = 0
    for t in trees:
        o = origin.copy()
        for _ in range(50):
            loc, _nrm, _i, _d = t.ray_cast(o, direction)
            if loc is None:
                break
            n += 1
            o = loc + direction * 1e-5
    return n


def inside_fraction(objs, shell_objs):
    """Ułamek (próbki) wierzchołków objs wewnątrz powłoki (skóra): parzystość przecięć promieni w przód (−Y) i w tył (+Y);
    punkt liczy się jako wewnętrzny, gdy oba promienie dają nieparzystą liczbę przecięć. Zwraca też najmniejszą odległość
    do skóry dla punktów wewnętrznych."""
    trees = [world_tree(o) for o in shell_objs]
    inside = total = 0
    dmin = 1e9
    for o in objs:
        P = al._world_points(o)
        step = max(1, len(P) // 300)
        for p in P[::step]:
            v = Vector(p.tolist())
            total += 1
            if _hits(trees, v, Vector((0, -1, 0))) % 2 == 1 and _hits(trees, v, Vector((0, 1, 0))) % 2 == 1:
                inside += 1
                dmin = min(dmin, min(t.find_nearest(v)[3] for t in trees))
    return inside, total, dmin


def bb(objs):
    mn, mx = al.vert_bbox(objs)
    return r3(mn), r3(mx)


def fit_report(skin):
    rep = {}
    pub = [o for o in f_pelvis if "pubis" in o.name]
    sac = [o for o in f_pelvis if "sacrum" in o.name or "coccyx" in o.name]
    ilium = [o for o in f_pelvis if "ilium" in o.name]
    rep["pelvis_bbox"] = bb(f_pelvis)
    rep["pubis_bbox"] = bb(pub)
    rep["sacrum_bbox"] = bb(sac)
    rep["ilium_bbox"] = bb(ilium)
    for name, objs in (("uterus", uterus), ("ovaries", ovaries), ("tubes", tubes), ("vagina", vagina), ("ligaments", ligs),
                       ("vessels", f_vessels), ("vertebrae_L5_L6", f_vert)):
        rep[name + "_bbox"] = bb(objs)
    pmn, pmx = al.vert_bbox(pub)
    smn, smx = al.vert_bbox(sac)
    umn, umx = al.vert_bbox(uterus)
    # Jama miednicy: między tylną krawędzią spojenia/kości łonowych a przednią powierzchnią kości krzyżowej.
    rep["uterus_between_pubis_and_sacrum_y"] = [round(pmn.y, 4), round(umn.y, 4), round(umx.y, 4), round(smn.y, 4)]
    imn, imx = al.vert_bbox(ilium)
    omn, omx = al.vert_bbox(ovaries)
    rep["ovaries_x_within_ilium_x"] = [round(imn.x, 4), round(omn.x, 4), round(omx.x, 4), round(imx.x, 4)]
    # Pęcherz: za spojeniem łonowym (y większe niż tylna powierzchnia spojenia) i przed macicą?
    if f_bladder:
        B = np.vstack([al._world_points(o) for o in f_bladder])
        Pp = np.vstack([al._world_points(o) for o in pub])
        mid_x = float(np.median(Pp[:, 0][np.abs(Pp[:, 0] - Pp[:, 0].mean()) < 0.02])) if len(Pp) else 0.0
        sym = Pp[np.abs(Pp[:, 0] - mid_x) < 0.012]  # okolica spojenia (pas 2,4 cm wokół linii środkowej)
        U = np.vstack([al._world_points(o) for o in uterus])
        rep["bladder_bbox"] = bb(f_bladder)
        rep["symphysis_band_y_min_max_z_min_max"] = [round(float(sym[:, 1].min()), 4), round(float(sym[:, 1].max()), 4),
                                                     round(float(sym[:, 2].min()), 4), round(float(sym[:, 2].max()), 4)]
        # Na wysokości spojenia: ile punktów pęcherza leży przed tylną powierzchnią spojenia (y mniejsze)
        zlo, zhi = float(sym[:, 2].min()), float(sym[:, 2].max())
        band = B[(B[:, 2] >= zlo) & (B[:, 2] <= zhi)]
        back_of_sym = float(sym[:, 1].max())
        front_of_sym = float(sym[:, 1].min())
        rep["bladder_pts_at_symphysis_height"] = int(len(band))
        rep["bladder_pts_in_front_of_symphysis_front_surface"] = int((band[:, 1] < front_of_sym).sum()) if len(band) else 0
        rep["bladder_pts_in_front_of_symphysis_back_surface"] = int((band[:, 1] < back_of_sym).sum()) if len(band) else 0
        rep["bladder_y_min_vs_symphysis_front_back_cm"] = [round(float(B[:, 1].min()) * 100, 2), round(front_of_sym * 100, 2),
                                                           round(back_of_sym * 100, 2)]
        rep["bladder_z_range_vs_symphysis_z_cm"] = [round(float(B[:, 2].min()) * 100, 2), round(float(B[:, 2].max()) * 100, 2),
                                                    round(zlo * 100, 2), round(zhi * 100, 2)]
        rep["bladder_y_max_vs_uterus_y_min_cm"] = [round(float(B[:, 1].max()) * 100, 2), round(float(U[:, 1].min()) * 100, 2)]
        # Czy pęcherz przenika kość łonową: parzystość promieni względem warstwy zbitej kości (zamknięta powłoka)
        # i najmniejsza odległość pęcherz-kość.
        pub_compact = [o for o in pub if "compact" in o.name]
        ins, tot, _ = inside_fraction(f_bladder, pub_compact)
        trees = [world_tree(o) for o in pub_compact]
        dmin = min(min(t.find_nearest(Vector(p.tolist()))[3] for t in trees) for p in B[::max(1, len(B) // 2000)])
        rep["bladder_pts_inside_pubic_bone"] = f"{ins}/{tot}"
        rep["bladder_min_distance_to_pubic_bone_cm"] = round(dmin * 100, 2)
        # Pęcherz powyżej spojenia: ile wystaje do przodu przed kość łonową
        above = B[B[:, 2] > zhi]
        rep["bladder_above_symphysis_pts_and_y_min_cm"] = [int(len(above)), round(float(above[:, 1].min()) * 100, 2) if len(above) else None]
    if skin:
        rep["skin_bbox"] = bb(skin)
        sac_only = [o for o in f_pelvis if "sacrum" in o.name]
        for name, objs in (("organs", f_organs), ("pelvis", f_pelvis), ("sacrum", sac_only), ("vertebrae_L5_L6", f_vert)):
            ins, tot, dmin = inside_fraction(objs, skin)
            rep[f"{name}_inside_skin"] = (f"{ins}/{tot} punktów próbki wewnątrz skóry"
                                          + (f", najmniejsza głębokość {dmin * 100:.1f} cm" if ins else ""))
        # Skóra pleców za kośćmi: najdalej z tyłu (+Y) punkt skóry na wysokości kręgów L5-L6 vs wyrostki kolczyste
        vmn, vmx = al.vert_bbox(f_vert)
        S = np.vstack([al._world_points(o) for o in skin])
        band = S[(S[:, 2] > vmn.z) & (S[:, 2] < vmx.z) & (np.abs(S[:, 0]) < 0.05)]
        if len(band):
            rep["skin_back_y_vs_spinous_y_at_L5_L6_cm"] = [round(float(band[:, 1].max()) * 100, 1), round(vmx.y * 100, 1)]
    # Odległość do kręgów Z-Anatomy (dlaczego nie nakładamy na szkielet Z-Anatomy)
    zv = [OB[n] for n in ("Vertebra L4", "Vertebra L5")]
    fv = [F("VH_F_lumbar_vertebra_5"), F("VH_F_lumbar_vertebra_6")]
    zc = [(lambda m: (m[0] + m[1]) / 2)(al.vert_bbox([o])) for o in zv]
    fc = [(lambda m: (m[0] + m[1]) / 2)(al.vert_bbox([o])) for o in fv]
    rep["last_two_lumbar_centres_ZA_vs_HuBMAP_F_cm"] = [round((a - b).length * 100, 1) for a, b in zip(zc, fc)]
    return rep


# ---------------------------------------------------------------- materiały lokalne (karta: bez emisji, bez stanów)
# Kolor układu z palette.json (integrator, etap E0: #EA7BB2 / jasny #F3B6D5). Gdy atlas_lib jeszcze nie czyta palety
# (gałąź sprzed E0), te same wartości lokalnie, żeby rendery K2 miały już ostateczny kolor.
if hasattr(al, "PALETTE"):
    REPRO_HEX, REPRO_LIGHT_HEX = al.SYSTEM_COLORS["repro"], al.SYSTEM_LIGHT["repro"]
else:
    REPRO_HEX, REPRO_LIGHT_HEX = "#EA7BB2", "#F3B6D5"
REPRO = al.hex_to_linear(REPRO_HEX)
REPRO_LIGHT = al.hex_to_linear(REPRO_LIGHT_HEX)
MUSC = al.hex_to_linear(al.CONTEXT_COLORS["muscle"])
BONE = al.hex_to_linear(al.CONTEXT_COLORS["bone"])
print("REPRO_COLOR", REPRO_HEX, REPRO_LIGHT_HEX)


def mat_for(kind):
    if kind == "organ":  # narządy układu: pełny kolor układu, bez świecenia (karta, nie „sprint”)
        return al.make_material("ATL_repro_organ", REPRO, roughness=0.6, subsurface=0.08)
    if kind == "duct":  # przewody (krzywe): jaśniejsze, żeby odcinały się od narządów, przy których biegną
        return al.make_material("ATL_repro_duct", REPRO_LIGHT, roughness=0.55)
    if kind == "ligament":  # więzadła: kolor układu przygaszony (35%, jak spoczynek w księdze stylu)
        return al.make_material("ATL_repro_lig", al.mix(MUSC, REPRO, al.REST_MIX), roughness=0.7)
    if kind == "broad":  # więzadło szerokie: cienka błona, półprzezroczysta
        return al.make_material("ATL_repro_broad", al.mix(MUSC, REPRO, al.REST_MIX), roughness=0.7, alpha=0.28,
                                backface_culling=False)
    if kind == "ctx_organ":  # pęcherz moczowy (kontekst): neutralny, półprzezroczysty
        return al.make_material("ATL_ctx_organ", MUSC, roughness=0.7, alpha=0.45, backface_culling=True)
    if kind in ("artery", "vein"):  # naczynia narządów: kolor naczyń zmieszany z tłem (nie są tematem karty)
        col = al.mix(MUSC, al.hex_to_linear(al.SYSTEM_COLORS[kind]), 0.6)
        return al.make_material(f"ATL_repro_{kind}", col, roughness=0.6)
    raise ValueError(kind)


class ReproPlate(al.Plate):
    """Role lokalne: organ, duct, ligament, broad, ctx_organ, artery, vein (materiał nie zależy od stanu)."""
    LOCAL = ("organ", "duct", "ligament", "broad", "ctx_organ", "artery", "vein")

    def _apply_state(self, state):
        loc = [i for i in self.items if i[1] in self.LOCAL]
        saved = self.items
        self.items = [i for i in self.items if i[1] not in self.LOCAL]
        try:
            super()._apply_state(state)
        finally:
            self.items = saved
        for o, role, *_ in loc:
            al.assign(o, mat_for(role))


# ---------------------------------------------------------------- render kontrolny dopasowania (K1)
if FIT_DIR:
    skin = al.import_glb(os.path.join(FEMALE_DIR, "VH_F_skin.glb"), collection="ATL_female", source="hubmap:female/VH_F_skin.glb")
    al.align_hubmap(skin, "female")
    rep = fit_report(skin)
    for k, v in rep.items():
        print("REPRO_FIT", k, json.dumps(v, ensure_ascii=False))
    os.makedirs(FIT_DIR, exist_ok=True)
    with open(os.path.join(FIT_DIR, "fit_report.json"), "w", encoding="utf-8") as f:
        json.dump(rep, f, indent=1, ensure_ascii=False)
    fit = ReproPlate("rozrodczy_fit", resolution=(1000, 1250), out_dir=FIT_DIR)
    fit.add(f_pelvis, role="context_bone")
    fit.add(fem["VH_F_Vertebrae.glb"], role="context_bone")
    fit.add(skin, role="context_skin", alpha=0.18)
    fit.add(uterus + ovaries + vagina, role="organ")
    fit.add(tubes, role="duct")
    fit.add(lig_cords, role="ligament")
    fit.add(f_bladder, role="artery")  # w renderze kontrolnym pęcherz wyraźnie (czerwony), żeby ocenić jego położenie
    fit.add(f_art, role="artery")
    fit.add(f_vein, role="vein")
    frame = f_pelvis + f_vert
    # cały tułów (skóra + kręgosłup) i zbliżenie miednicy, z przodu i z boku
    smn, smx = al.vert_bbox(skin)
    torso_c = Vector((0, (smn.y + smx.y) / 2, 0.95))
    fit.set_view("front", direction="front", center=torso_c, ortho_scale=0.9)
    fit.set_view("side", direction="side", center=torso_c, ortho_scale=0.9)
    fit.set_view("detail", direction="front", frame=frame + f_organs, margin=1.15)
    fit.set_view("back", direction="side", frame=frame + f_organs, margin=1.15)
    os.environ.pop("ATLAS_QUICK", None)
    fit.render(views=("front", "side", "detail", "back"), states=("sprint",))
    raise SystemExit(0)

# ---------------------------------------------------------------- karta
# Bez sylwetki skóry na obu miednicach: VH_F_skin (v1.3) nie pasuje do kości VH_F (render kontrolny K1: kość krzyżowa
# i kręgi L5-L6 wystają poza skórę pleców), a sylwetka tylko po stronie męskiej łamałaby porównanie „ta sama kamera”.
plate = ReproPlate("rozrodczy", resolution=RES, out_dir=OUT_DIR)
VM, VF = (V_MALE,), (V_FEMALE,)
plate.add(m_bones, role="context_bone", views=VM)
plate.add(bladder, role="ctx_organ", views=VM)
plate.add(m_organs, role="organ", views=VM)
plate.add(al.thicken_curves(m_ducts, scale=1.0), role="duct", views=VM)
plate.add(al.thicken_curves(urethra, scale=1.0), role="ctx_organ", views=VM)
plate.add(al.thicken_curves(m_vessels_art, scale=1.0), role="artery", views=VM)
plate.add(al.thicken_curves(m_vessels_vein, scale=1.0), role="vein", views=VM)

plate.add(f_bones + f_vert, role="context_bone", views=VF)
if f_bladder:
    plate.add(f_bladder, role="ctx_organ", views=VF)
plate.add(uterus + ovaries + vagina, role="organ", views=VF)
plate.add(tubes, role="duct", views=VF)
plate.add(lig_card, role="ligament", views=VF)
plate.add(f_art, role="artery", views=VF)
plate.add(f_vein, role="vein", views=VF)

# Ta sama skala: wspólny ortho_scale = większy z kadrów obu miednic (kości + narządy); środki osobno.
m_frame = m_bones + m_organs + m_ducts
f_frame = f_bones + f_vert + f_organs
cm, sm = plate.frame_objects(m_frame, DIRECTION, MARGIN)
cf, sf = plate.frame_objects(f_frame, DIRECTION, MARGIN)
S = max(sm, sf)
plate.set_view(V_MALE, direction=DIRECTION, center=cm, ortho_scale=S)
plate.set_view(V_FEMALE, direction=DIRECTION, center=cf, ortho_scale=S)
print("REPRO_FRAME", DIRECTION, "male", r3(cm), round(sm, 4), "female", r3(cf), round(sf, 4), "wspólna skala", round(S, 4),
      f"= {S / max(RES) * 1000:.3f} mm/px")


# ---------------------------------------------------------------- kotwice
def surf_point(objs, toward=None, frac=0.15, keep=None):
    """Punkt na powierzchni obiektów zwróconej do kamery (najbliższe kamerze wierzchołki, blisko ich środka).
    keep: funkcja (P: N×3) -> maska; zawęża wierzchołki przed wyborem (np. dolna część trzonu macicy)."""
    B = al._camera_basis(DIRECTION)[0] if toward is None else Vector(toward)
    P = np.vstack([al._world_points(o) for o in objs])
    if keep is not None:
        P = P[keep(P)]
    d = P @ np.array(B)
    near = P[d >= np.quantile(d, 1 - frac)]
    _, R, U = al._camera_basis(DIRECTION)
    uv = np.stack([near @ np.array(R), near @ np.array(U)], 1)
    c = uv.mean(0)
    return Vector(near[np.argmin(((uv - c) ** 2).sum(1))].tolist())


def side_suffix(left, right):
    """Narząd strony bliższej kamerze (bok: lewa strona ciała, +X)."""
    return left if DIRECTION == "side" else right


OV_NEAR = side_suffix("VH_F_left_ovary", "VH_F_right_ovary")
AMP_NEAR = side_suffix("VH_F_ampulla_of_uterine_tube_L", "VH_F_ampulla_of_uterine_tube_R")
_ovmn, _ovmx = al.vert_bbox([F(OV_NEAR)])
OV_TOP, OV_BOTTOM = _ovmx.z, _ovmn.z

A = {
    # mężczyzna
    "testis": {"point": surf_point([OB[side_suffix("Testis.l", "Testis.r")]]), "views": [V_MALE]},
    "epididymis": {"point": surf_point([OB[side_suffix("Epididymis.l", "Epididymis.r")]]), "views": [V_MALE]},
    "ductus_deferens": {"curve": side_suffix("Ductus deferens.l", "Ductus deferens.r"), "t": 0.62, "views": [V_MALE]},
    "seminal_gland": {"point": surf_point([OB[side_suffix("Seminal gland.l", "Seminal gland.r")]]), "views": [V_MALE]},
    "prostate": {"point": surf_point(prostate), "views": [V_MALE]},
    "penis": {"point": surf_point([OB["Corpus cavernosum of penis"]]), "views": [V_MALE]},
    "ejaculatory_duct": {"curve": side_suffix("Ejaculatory duct.l", "Ejaculatory duct.r"), "t": 0.5, "views": [V_MALE]},
    "bladder_m": {"point": surf_point(bladder), "views": [V_MALE]},
    "urethra_m": {"curve": "Urethra", "t": 0.35, "views": [V_MALE]},
    "testicular_vessels": {"curve": "Left testicular artery" if DIRECTION == "side" else "Right testicular artery.r",
                           "z": 0.90, "views": [V_MALE]},
    # kobieta
    "ovary": {"point": surf_point([F(OV_NEAR)]), "views": [V_FEMALE]},
    # Jajowód: górna część bańki, nad jajnikiem (w widoku z boku bańka i jajnik nachodzą na siebie; audyt K1, pkt 4).
    "uterine_tube": {"point": surf_point([F(AMP_NEAR)], frac=0.5, keep=lambda P: P[:, 2] > OV_TOP + 0.004), "views": [V_FEMALE]},
    # Macica: trzon poniżej jajnika i rogów (kotwica K1 leżała przy rogu, obok jajowodu).
    "uterus": {"point": surf_point([F("VH_F_body_of_uterus"), F("VH_F_anterior_wall_of_uterus")], frac=0.3,
                                   keep=lambda P: P[:, 2] < OV_BOTTOM - 0.008), "views": [V_FEMALE]},
    "bladder_f": {"point": surf_point(f_bladder), "views": [V_FEMALE]} if f_bladder else None,
    "cervix": {"point": surf_point([F("VH_F_cervix")]), "views": [V_FEMALE]},
    "vagina": {"point": surf_point([F("VH_F_vagina")]), "views": [V_FEMALE]},
    "ovarian_ligament": {"point": surf_point([F(side_suffix("VH_F_ovarian_ligament_L", "VH_F_ovarian_ligament_R"))]),
                         "views": [V_FEMALE]},
    "uterine_artery": {"point": surf_point([F(side_suffix("VH_F_left_uterine_artery", "VH_F_right_uterine_artery"))]),
                       "views": [V_FEMALE]},
}

A = {k: a for k, a in A.items() if a is not None}

# Trasy anatomiczne (w metrach, układ Z-Anatomy; strona żeńska w układzie HuBMAP po align_hubmap): droga plemników
# i droga komórki jajowej. Karta ich NIE rysuje: types.ts nie ma rodzaju strzałki dla tego układu (kolory rodzajów
# należą do innych układów). public/atlas/rozrodczy/flows3d.json jest więc pusty, a trasy idą do pliku propozycji
# (REPRO_NOTES=<folder>), gotowe do włączenia, gdy integrator doda rodzaj (np. 'repro').
def _route_m():
    pts = al.curve_points(side_suffix("Ductus deferens.l", "Ductus deferens.r"),
                          start_near=al.vert_bbox([OB[side_suffix("Epididymis.l", "Epididymis.r")]])[0])
    ej = al.curve_points(side_suffix("Ejaculatory duct.l", "Ejaculatory duct.r"), start_near=pts[-1])
    ur = al.curve_points("Urethra", start_near=ej[-1])
    k = min(range(len(ur)), key=lambda i: (ur[i] - ej[-1]).length)
    return pts + ej + ur[k:]


def _route_f():
    ov = (lambda m: (m[0] + m[1]) / 2)(al.vert_bbox([F(OV_NEAR)]))
    amp = (lambda m: (m[0] + m[1]) / 2)(al.vert_bbox([F(AMP_NEAR)]))
    ist = (lambda m: (m[0] + m[1]) / 2)(al.vert_bbox([F(side_suffix("VH_F_isthmus_of_fallopian_tube_L", "VH_F_isthmus_of_fallopian_tube_R"))]))
    body = (lambda m: (m[0] + m[1]) / 2)(al.vert_bbox([F("VH_F_body_of_uterus")]))
    return [ov, amp, ist, body]


routes = [
    {"id": "sperm_route", "kind": "repro", "labelPl": "Droga plemników: jądro → najądrze → nasieniowód → cewka", "views": [V_MALE],
     "points": _route_m()},
    {"id": "egg_route", "kind": "repro", "labelPl": "Droga komórki jajowej: jajnik → jajowód → macica", "views": [V_FEMALE],
     "points": _route_f()},
]
if os.environ.get("REPRO_NOTES"):
    with open(os.path.join(os.environ["REPRO_NOTES"], "routes3d_proposal.json"), "w", encoding="utf-8") as f:
        json.dump({"schemaVersion": 1, "units": "m", "note": "propozycja: rodzaj strzałki 'repro' (types.ts) do dodania przez integratora",
                   "flows": [{**r, "points": [r3(p) for p in al.resample([Vector(p) for p in r["points"]], 0.01)]} for r in routes]},
                  f, indent=1, ensure_ascii=False)

views = (V_MALE, V_FEMALE)
metas = []
for v in views:  # osobno: w trybie QUICK render() bierze tylko pierwszy widok
    metas.append(plate.render(views=(v,), states=("sprint",), anchors=A))
plate.write_flows3d([])  # karta bez strzałek (patrz wyżej)

# Karta bez stanów: jeden obraz na widok, wpisany jako "rest" i "sprint".
path = os.path.join(plate.out_dir, "anchors.json")
with open(path, encoding="utf-8") as f:
    meta = json.load(f)
meta["card"] = True
for v, vm in meta["views"].items():
    src = vm["images"].get("sprint")
    if src:
        name = f"{v}.webp" if src.endswith(".webp") else f"{v}.png"
        if src != name:
            shutil.move(os.path.join(plate.out_dir, src), os.path.join(plate.out_dir, name))
        vm["images"] = {"rest": name, "sprint": name}
meta["views"] = {v: meta["views"][v] for v in (V_MALE, V_FEMALE) if v in meta["views"]}
with open(path, "w", encoding="utf-8") as f:
    json.dump(meta, f, indent=2, ensure_ascii=False)
print("REPRO_CARD", path, {v: vm["images"] for v, vm in meta["views"].items()})
