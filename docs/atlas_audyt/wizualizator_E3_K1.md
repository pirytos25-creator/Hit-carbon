# Audyt Dyrygenta: Wizualizator 3D, E3-K1 (kontrakt danych 3D i eksport GLB)

Data: 2026-11-26. Gałąź `claude/atlas-wizualizacja-3d-1dc29a` (`4a06cf4`, `509a3f8`), scalona do `atlas-uklady` (`f5f82fb`; konflikt tylko w skryptach `package.json` – zachowane wpisy obu stron).

## Werdykt: **E3-K1 ZALICZONY, kontynuuj** (runda 1 z 3)

- `blender/atlas/atlas_export_glb.py`: eksport przez skrypty plansz z podmianą zapisów w pamięci – te same struktury, role, poziomy i kolory co w 2D; `atlas_lib.py` i `plate_*.py` bez zmian, `public/atlas/` nietknięte.
- GLB dzielone wg licencji (`za_*` BY-SA, `hra_*` BY) i ramy (ciało / zbliżenia poza ciałem – rozwiązuje problem zgłoszony przez architekta); wspólna baza `_shared` (kości z sylwetką, mięśnie).
- `public/atlas3d/<u>/bindings.json` (w Gicie, 12 plików, 2,5 MB) z polem `anchors`/`anchorMethod` dla migracji integratora; kotwice także dla widoków kluczowych 3D (przód, lewy, tył, prawy).
- Oddechowy: `flows3d` w metrach (rzut odwrotny, błąd 0,08 mm na kotwicach).
- **Decyzja Dyrygenta (model §7, ryzyko §6 pkt 6):** GLB i `manifest.json` poza Gitem (`.gitignore`), odtwarzane poleceniem `npm run atlas:export3d` (Blender przez sloty, ok. 15 min dla 12 układów).
- Walidator `npm run check:atlas3d`: licencja każdego węzła zgodna z plikiem, NC z `NC_BLOCKLIST`, budżet, strzałki z ramą; selftest 4/4. Złapał prawdziwy błąd (serce HuBMAP w pliku BY-SA) – naprawiony.

## Testy Dyrygenta
- W worktree Wizualizatora: `check:atlas3d` kod 0 – 12 układów, licencje rozdzielone, 0 struktur NC, budżet desktopu spełniony (najcięższy oddechowy 7,0 MB / 0,89 mln trójkątów; krwionośny 4,8 MB / 0,78 mln; mięśniowy 3,8 MB / 0,58 mln); selftest kod 0.
- Po scaleniu w `atlas-uklady`: build 0, `check:atlas` 0 (paleta, fakty, dane OK).
- Obrazu 3D w aplikacji jeszcze nie ma (to K2) – oceny wizualnej brak.

## Uwagi na K2
- `level` od integratora to `'basic'|'extended'` – komponent przyjmuje obie postacie (zgoda).
- `prototypes/` (P1–P3) weszło do `atlas-uklady` jako materiał porównawczy; P3 jest odrzucone – w K2 dopisać w `prototypes/README` „P3 odrzucone (decyzja §7), tylko do porównania”.
- FPS mierzyć w K2 na prawdziwym komponencie, na zintegrowanej karcie i (jeśli się da) na RTX.
