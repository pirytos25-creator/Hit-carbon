"""
Test blokady licencji NC w atlas_lib (integrator). Tylko czyta atlas, niczego nie renderuje.
  blender.exe --background --disable-autoexec <Startup.blend> --python blender/atlas/tools_license_test.py
Sprawdza: (1) find_meshes/find_curves pomijają struktury NC, (2) Plate.add rzuca LicenseError dla nerki i ucha
wewnętrznego Z-Anatomy, (3) Plate.render rzuca LicenseError, gdy obiekt NC trafi do sceny inną drogą,
(4) nerka HuBMAP (CC BY 4.0) NIE jest blokowana.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import atlas_lib as al  # noqa: E402
import bpy  # noqa: E402

results = []


def check(name, ok):
    results.append((name, ok))
    print(f"LICENSE_TEST {'OK ' if ok else 'BŁĄD'} {name}")


nc_names = ["Kidney.l", "Kidney.r", "Renal pelvis.l", "Renal pelvis.r", "Cochlea.l", "Cochlea.r", "Vestibule.l", "Vestibule.r"]
present = [n for n in nc_names if n in bpy.data.objects]
check(f"obiekty NC obecne w atlasie ({len(present)}/8)", len(present) == 8)
found = {o.name for o in al.find_meshes()}
check("find_meshes() pomija nerkę i ucho wewnętrzne", not (found & set(nc_names)))
check("find_meshes(allow_nc=True) je widzi (tylko do pomiarów)", set(present) <= {o.name for o in al.find_meshes(allow_nc=True)})
curves = {o.name for o in al.find_curves(collection="5: Cardiovascular system")}
check("find_curves() pomija naczynia wewnątrznerkowe", not any("Intrarenal" in n for n in curves))

plate = al.Plate("license_test", out_dir=os.path.join(bpy.app.tempdir or ".", "atlas_license_test"))
try:
    plate.add([bpy.data.objects["Kidney.l"]], role="context_muscle")
    check("Plate.add(Kidney.l) rzuca LicenseError", False)
except al.LicenseError as e:
    check("Plate.add(Kidney.l) rzuca LicenseError", True)
    print("LICENSE_MSG", e)
try:
    plate.add([bpy.data.objects["Cochlea.r"]], role="context_bone")
    check("Plate.add(Cochlea.r) rzuca LicenseError", False)
except al.LicenseError:
    check("Plate.add(Cochlea.r) rzuca LicenseError", True)

# obejście add(): obiekt dopisany ręcznie do listy - render musi go złapać przed renderowaniem
plate.items.append((bpy.data.objects["Vestibule.l"], "context_bone", None, {"rest": None, "sprint": 1.0}))
try:
    plate.render(views=("front",), states=("sprint",))
    check("Plate.render z Vestibule.l rzuca LicenseError", False)
except al.LicenseError:
    check("Plate.render z Vestibule.l rzuca LicenseError", True)

kid = al.import_glb("VH_M_Kidney_L.glb", collection="ATL_lic_test")
check("nerka HuBMAP (CC BY 4.0) nie jest blokowana", not any(al.is_nc(o) for o in kid))

bad = [n for n, ok in results if not ok]
print("LICENSE_TEST_SUMMARY", "wszystkie OK" if not bad else f"BŁĘDY: {bad}")
