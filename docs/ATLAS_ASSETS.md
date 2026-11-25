# Zasoby do trybu „Atlas układów” (gałąź `atlas-uklady`)

Surowe pliki leżą w `atlas_raw/` (folder ignorowany przez Git, ok. 577 MB). Ten dokument jest ich spisem.
Wszystko pobrano 2026-11-25 z oficjalnych źródeł i za darmo.

## 1. Z-Anatomy: atlas całego ciała (`atlas_raw/z_anatomy/`)
- Źródło: https://github.com/Z-Anatomy/Models-of-human-anatomy (`Z-Anatomy.zip`, 86,7 MB, md5 `3eef9e6bf91c640421663334d55031da`, suma zgodna z mirrorem KHDP).
- Rozpakowano tylko `extracted/Z-Anatomy/Startup.blend` (307 MB). Skryptów Pythona z paczki nie uruchamiano.
- Zawartość sprawdzona w Blenderze 5.2.1 (otwarty z `--disable-autoexec`): 4569 siatek, ok. 3,66 mln trójkątów.
  - mięśnie: 789 (np. czworogłowy, prosty uda, głowy brzuchatego łydki)
  - układ nerwowy i narządy zmysłów: 460 (np. zakręt przedśrodkowy, rogi przednie rdzenia)
  - szkielet: 1244, trzewia: 254 (przepona, oskrzela)
  - układ krążenia: tylko 60. Jest słaby, dlatego dobrane zostało naczyniowe drzewo z HuBMAP (pkt 2).
- Licencja: **CC BY-SA 4.0**. Trzeba podać autorów (Z-Anatomy, Gauthier Kervyn, Marcin Zieliński; BodyParts3D, DBCLS, CC BY-SA 2.1 JP). Modele pochodne trzeba udostępniać na tej samej licencji.
- Uwaga: model ucha wewnętrznego (CC BY-NC-SA) i nerki (CC BY-NC) mają licencje „NC”. Nie używać ich w projekcie komercyjnym; do tego projektu nie są potrzebne.
- Dołączono także `License.txt`, `Readme.md`, `TA2.csv` (terminologia anatomiczna) i `CheatSheet.png`.

## 2. HuBMAP Human Reference Atlas (`atlas_raw/hubmap/`)
- Źródło: https://github.com/hubmapconsortium/ccf-3d-reference-object-library (mężczyzna, VH_Male). Licencja **CC BY 4.0** (`HUBMAP_LICENSE.txt`).

| Plik | Wersja | Układ |
|---|---|---|
| `3d-vh-m-blood-vasculature.glb` (18 MB) | v1.4 | krwionośny: naczynia całego ciała |
| `VH_M_Heart.glb`, `VH_M_Blood_Vasculature_Heart.glb` | v1.2 | krwionośny: serce i naczynia wieńcowe |
| `3d-vh-m-lung.glb`, `3d-vh-m-trachea.glb`, `3d-vh-m-main-bronchus.glb`, `3d-vh-m-larynx.glb` | v1.4 | oddechowy |
| `Allen_M_Brain.glb` | v1.2 | mózg (używać mniej uproszczonego niż w v2) |
| `VH_M_Spinal_Cord.glb`, `VH_M_Vertebrae.glb` | v1.2 | nerwowy: rdzeń i kręgosłup |
| `VH_M_Skin.glb` | v1.2 | sylwetka ciała jako półprzezroczysta „skorupa” |

## 3. Struktury białek z RCSB PDB (`atlas_raw/pdb/`), domena publiczna
| PDB | Co to jest | Do czego |
|---|---|---|
| `4HHB` | ludzka deoksyhemoglobina | krew: hemoglobina bez tlenu |
| `1HHO` | ludzka oksyhemoglobina | krew: hemoglobina z tlenem |
| `5H53` | kompleks aktyna–miozyna mięśnia szkieletowego (królik) | mięsień: mostek poprzeczny |
| `6KN8` | ludzki filament cienki serca z wapniem (troponina, tropomiozyna) | mięsień: regulacja przez Ca²⁺ (struktura sercowa, poglądowo) |

Wcześniej pobrane (`assets_raw/`): 8H9T (syntaza ATP), 5XTD (łańcuch oddechowy), 3KG2 (receptor AMPA), 1B8M (BDNF).

## 4. Narzędzia zainstalowane w Blenderze 5.2.1
- **Molecular Nodes 520.3.0** (GPL-3.0) z extensions.blender.org, zainstalowany z pliku. Suma sha256 `c95fa521…2db86c` zgodna z platformą. Kopia paczki: `atlas_raw/molecular_nodes/`.
  Uwaga: w MN 520.x skala to 1 nm = 1 m w Blenderze.
- MPFB2 (MakeHuman) był zainstalowany wcześniej.
- Dostęp Blendera do internetu pozostaje wyłączony (ustawienie użytkownika). Rozszerzenia instaluje się z pliku.

## Czego celowo nie pobrano
- Aplikacji Z-Anatomy dla Windows (`.exe`/`.msi`): to tylko przeglądarka, modele są w `.blend`.
- Nagrań ruchu (motion capture): dla statycznego atlasu nie są potrzebne. W razie potrzeby można użyć CMU Mocap.
