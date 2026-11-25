# Źródła otwartych zasobów 3D, danych naukowych i licencje (BIOGENESIS Overdrive)

Wszystkie zasoby zewnętrzne użyte w projekcie pochodzą wyłącznie z bezpłatnych, otwartych repozytoriów naukowych i projektowych (0 PLN kosztów). Dane surowe przed przetworzeniem znajdują się tymczasowo w `assets_raw/` (ignorowanym przez Git), natomiast zoptymalizowane zasoby scenowe w `public/models/` i `public/textures/`.

---

## 1. Człowiek i rig anatomiczny
- **Zasób:** **MPFB2 (MakeHuman Plugin For Blender 2)** — bazowa siatka ludzka (`base.obj`), targety morfologiczne oraz szkielet `game_engine` (53 kości).
- **Źródło:** Oficjalne rozszerzenie Blendera `bl_ext.blender_org.mpfb` (lokalna instalacja Blendera 5.2.1 LTS).
- **Licencja:** Dane geometrii, targetów i tekstur MakeHuman/MPFB2 udostępniane są na licencji **CC0 1.0 Universal (Public Domain)**; kod dodatku MPFB2 na GPL-3.0 (użyty wyłącznie offline jako narzędzie build-time do wyeksportowania własnych plików `.glb`).

---

## 2. Modele anatomiczne narządów (HuBMAP / Allen Brain / Visible Human)
- **Zasób:** Human Reference Atlas (HRA) 3D Reference Object Library (`ccf-3d-reference-object-library`):
  - `VH_Male/v1.2/VH_M_Heart.glb` (serce dorosłego człowieka)
  - `VH_Male/v1.2/VH_M_Blood_Vasculature_Heart.glb` (naczynia wieńcowe i pnie naczyniowe serca)
  - `VH_Male/v1.2/VH_M_Lung.glb` (płuca i drzewo oskrzelowe)
  - `VH_Male/v1.2/Allen_M_Brain.glb` (mózg z zakrętami, bruzdami, móżdżkiem, hipokampem i strukturami podkorowymi na bazie Allen Human Brain Atlas & Visible Human)
- **Źródło:** https://github.com/hubmapconsortium/ccf-3d-reference-object-library
- **Licencja:** **Creative Commons Attribution 4.0 International (CC BY 4.0)**.
- **Atrybucja wymagana:** Human Biomolecular Atlas Program (HuBMAP) / Indiana University Cyberscience & DBCLS / NIH Visible Human / Allen Institute for Brain Science (modyfikacja: decymacja, nadanie shape keys skurczu/oddechu/przekroju oraz tekstur PBR w Blenderze 5.2).

---

## 3. Struktury molekularne cryo-EM / rentgenograficzne (RCSB Protein Data Bank)
Wszystkie pliki atomowe z bazy **RCSB PDB / wwPDB** należą do **domeny publicznej / CC0 1.0** (brak ograniczeń praw autorskich dla danych współrzędnych strukturalnych):
- **PDB `8H9T`** (*Homo sapiens* mitochondrialna syntaza $F_1F_o$-ATP w wysokiej rozdzielczości cryo-EM 2,77 Å) — baza do rekonstrukcji pierścienia $c_8$, asymetrycznego trzonka $\gamma$, statora i heksameru katalitycznego $\alpha_3\beta_3$.
  - Źródło: https://files.rcsb.org/download/8H9T.cif (Lai et al., *Nature*, 2023 / wwPDB).
- **PDB `5XTD`** (*Homo sapiens* mitochondrialny superkompleks oddechowy $\mathrm{I_1III_2IV_1}$, cryo-EM) — baza do rekonstrukcji kompleksów łańcucha transportu elektronów.
  - Źródło: https://files.rcsb.org/download/5XTD.cif (Guo et al., *Cell*, 2017 / wwPDB).
- **PDB `3KG2`** (tetrameryczny receptor glutaminergiczny AMPA GluA2) — baza do rekonstrukcji postsynaptycznych receptorów AMPA.
  - Źródło: https://files.rcsb.org/download/3KG2.pdb (Sobolevsky et al., *Nature*, 2009 / wwPDB).
- **PDB `1B8M`** (ludzki czynnik neurotroficzny pochodzenia mózgowego **BDNF** — heterodimer / homodimer z NT-4) — baza do modelu cząsteczki BDNF dokującej do dimeryzujących receptorów TrkB w Akcie X.
  - Źródło: https://files.rcsb.org/download/1B8M.pdb (Robinson et al., *Protein Science*, 1999 / wwPDB).

---

## 4. Oświetlenie środowiskowe HDRI
- **Zasób:** `studio_small_09_1k.hdr` (rozdzielczość 1K HDR do realistycznego IBL).
- **Źródło:** https://polyhaven.com/a/studio_small_09 (`https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr`).
- **Licencja:** **CC0 1.0 Universal (Public Domain)**.

---

## 5. Tekstury, modele proceduralne, narracja i ścieżka dźwiękowa
- **Proceduralne tekstury PBR i shadery** (`src/shaders/bioPbrTextures.ts`, `src/shaders/cutawayShader.ts`, `vascularFlowShader.ts`, `actionPotentialShader.ts`, `membraneProtonShader.ts`): napisane od zera w ramach projektu BIOGENESIS (własne / MIT-kompatybilne).
- **Ścieżka dźwiękowa i SFX** (`AdaptiveMusicEngine.ts`, `SpatialAudioSystem.ts`): syntezowana lokalnie w czasie rzeczywistym za pomocą Web Audio API (0 zewnętrznych próbek płatnych).
- **Lektor polski** (`public/audio/narration/*.mp3`): wygenerowany lokalnie za pomocą otwartego narzędzia `edge-tts` (głosy `pl-PL-MarekNeural` oraz `pl-PL-ZofiaNeural`).
- **Oprogramowanie i biblioteki UI/3D:** React, Three.js, React Three Fiber, Drei, Postprocessing, GSAP, Zustand, Tailwind CSS, Lucide Icons — otwarte licencje MIT. Blender 5.2.1 LTS oraz FFmpeg 9.0 użyte wyłącznie jako lokalne narzędzia produkcyjne offline.
