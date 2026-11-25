"""
Fetch free, legally redistributable / open-licensed (CC0 / CC BY 4.0 / Public Domain)
scientific 3D assets, cryo-EM structures, and studio HDRI for BIOGENESIS Overdrive.
Zero paid APIs or proprietary assets.
"""
import os
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RAW_DIR = os.path.join(ROOT, "assets_raw")
TEX_DIR = os.path.join(ROOT, "public", "textures")

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(TEX_DIR, exist_ok=True)

ASSETS = [
    (
        "Poly Haven Studio HDRI (CC0 1.0)",
        "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr",
        os.path.join(TEX_DIR, "studio_small_09_1k.hdr"),
        b"#?",
    ),
    (
        "HuBMAP HRA License (CC BY 4.0)",
        "https://raw.githubusercontent.com/hubmapconsortium/ccf-3d-reference-object-library/main/LICENSE",
        os.path.join(RAW_DIR, "HUBMAP_LICENSE.txt"),
        b"Attribution",
    ),
    (
        "HuBMAP VH_M_Heart (CC BY 4.0)",
        "https://raw.githubusercontent.com/hubmapconsortium/ccf-3d-reference-object-library/main/VH_Male/v1.2/VH_M_Heart.glb",
        os.path.join(RAW_DIR, "VH_M_Heart.glb"),
        b"glTF",
    ),
    (
        "HuBMAP VH_M_Blood_Vasculature_Heart (CC BY 4.0)",
        "https://raw.githubusercontent.com/hubmapconsortium/ccf-3d-reference-object-library/main/VH_Male/v1.2/VH_M_Blood_Vasculature_Heart.glb",
        os.path.join(RAW_DIR, "VH_M_Blood_Vasculature_Heart.glb"),
        b"glTF",
    ),
    (
        "HuBMAP VH_M_Lung (CC BY 4.0)",
        "https://raw.githubusercontent.com/hubmapconsortium/ccf-3d-reference-object-library/main/VH_Male/v1.2/VH_M_Lung.glb",
        os.path.join(RAW_DIR, "VH_M_Lung.glb"),
        b"glTF",
    ),
    (
        "HuBMAP Allen_M_Brain (CC BY 4.0)",
        "https://raw.githubusercontent.com/hubmapconsortium/ccf-3d-reference-object-library/main/VH_Male/v1.2/Allen_M_Brain.glb",
        os.path.join(RAW_DIR, "Allen_M_Brain.glb"),
        b"glTF",
    ),
    (
        "RCSB PDB 8H9T Human ATP Synthase (Public Domain / CC0)",
        "https://files.rcsb.org/download/8H9T.cif",
        os.path.join(RAW_DIR, "8H9T.cif"),
        b"data_8H9T",
    ),
    (
        "RCSB PDB 5XTD Human Respiratory Supercomplex (Public Domain / CC0)",
        "https://files.rcsb.org/download/5XTD.cif",
        os.path.join(RAW_DIR, "5XTD.cif"),
        b"data_5XTD",
    ),
    (
        "RCSB PDB 3KG2 GluA2 AMPA Receptor (Public Domain / CC0)",
        "https://files.rcsb.org/download/3KG2.pdb",
        os.path.join(RAW_DIR, "3KG2.pdb"),
        b"HEADER",
    ),
    (
        "RCSB PDB 1B8M Human BDNF Dimer (Public Domain / CC0)",
        "https://files.rcsb.org/download/1B8M.pdb",
        os.path.join(RAW_DIR, "1B8M.pdb"),
        b"HEADER",
    ),
]


def download_asset(label: str, url: str, dest: str, magic_prefix: bytes):
    if os.path.exists(dest) and os.path.getsize(dest) > 512:
        with open(dest, "rb") as f:
            head = f.read(64)
        if magic_prefix in head[:16] or head.startswith(magic_prefix):
            print(f"[SKIP OK] {label} -> {dest} ({os.path.getsize(dest)} B)")
            return
    req = urllib.request.Request(url, headers={"User-Agent": "BIOGENESIS-Overdrive/2.0"})
    print(f"[FETCH] {label} <- {url}")
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    with open(dest, "wb") as f:
        f.write(data)
    head = data[:64]
    if not (head.startswith(magic_prefix) or magic_prefix in head):
        raise RuntimeError(f"Unexpected header for {label}: {head[:32]!r}")
    print(f"[SAVED OK] {dest} ({len(data)} B)")


def main():
    for label, url, dest, magic in ASSETS:
        download_asset(label, url, dest, magic)
    print("\nAll open assets fetched and verified successfully!")


if __name__ == "__main__":
    main()
