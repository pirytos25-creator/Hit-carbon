# Atlas układów: notatki agenta wizualizacji (przegląd przed 3D)

Stan: 2026-11-26, gałąź `claude/atlas-wizualizacja-3d-1dc29a` (wycięta z `atlas-uklady` po scaleniu integracji 1b cz. 1, `cf70f98`).
Obejrzane: `#atlas` na żywo (Chrome przez chrome-devtools, 1440×900), kod `src/atlas/`, `public/atlas/*/`, `blender/atlas/`,
dokumenty: model architektoniczny (§3, §4, §7), plan Reżysera (`docs/ATLAS_REZYSER_PLAN.md`, w głównym checkoucie, nie w Gicie tej gałęzi),
badacz B (runda 1 i 2), księga stylu, biblia artystyczna filmu.

## 1. Co jest gotowe

| Rzecz | Stan | Gdzie |
|---|---|---|
| Plansze 2D | w chwili przeglądu **10 z 12**; po scaleniu `atlas-uklady` (`76e3ab3`, 2026-11-26) komplet 12 (doszły hormonalny i limfatyczny, jeszcze nie w prototypach 3D) | `public/atlas/<u>/*.webp`, `src/atlas/plates/<u>.ts` |
| Oprawa planszy | nakładka podpisów HTML, poziomy Podstawowy/Rozszerzony, przełącznik Spoczynek/Sprint, panel liczb, 5 grup menu z ikonami | `AtlasApp.tsx`, `AtlasPlate.tsx`, `glyphs.tsx` |
| Fakty | statusy `checked_agent` / `anatomy` / `disputed` przy każdym podpisie, `protocolNotePl` i dopisek „W badaniu: …” przy liczbach z innego protokołu | `plates/*.ts` |
| Paleta | `palette.json` (13 układów, `restMix` 0,35, reguła emisji 0,15–0,35), walidator ΔE | `src/atlas/data/palette.json` |
| Wspólny kod Blendera | `import_glb`, `align_hubmap` (skala 0,98636 + przesunięcie, błąd 1,56 cm na kręgach), `find_meshes`/`find_curves`, `thicken_curves`, `vessel_path`, `license_check` (blokada NC), `build_silhouette` | `blender/atlas/atlas_lib.py` |
| Film (wzorzec jakości) | 12 aktów po 90 s, jeden zegar `SimulationCore`, ujęcia z celem (`ShotChoreography.ts`), AgX, kontrolowany bloom, przenikanie scen mgłą | `src/director/`, `docs/ARCHITECTURE_AND_ART_BIBLE.md` |

Wrażenie wizualne (zrzut mięśniowego i krwionośnego): anatomia prawdziwa i czytelna, podpisy wyraźne, ale scena płaska
(czarne tło, brak podłoża i głębi). To samo zauważył Reżyser (§1.3, problemy 1–2). 3D może to naprawić „za darmo”: paralaksa przy obrocie
i prawdziwe światło sceny bez zmiany stylu matowego.

## 2. Co da się przenieść do 3D bez nowej pracy

1. **Rama współrzędnych.** Wszystko jest w jednym układzie Z-Anatomy: metry, przód −Y, prawa strona ciała −X, stopy Z≈0.
   HuBMAP wchodzi do niego jedną macierzą (`HUBMAP_ALIGN`). W three.js wystarczy jeden obrót (Z-up → Y-up), bez dopasowywania.
2. **Kotwice 3D (`anchors3d`)** w każdym `anchors.json` (schemat 2): punkt w metrach na kotwicę i widok. To gotowe punkty podpisów 3D.
   Teksty podpisów, statusy i poziomy (`tier`) leżą w `plates/<u>.ts`, więc prototyp 3D może je **importować bez kopiowania** (Vite czyta TS).
3. **Tory przepływów (`flows3d.json`, metry)**:

   | Układ | Tory | Uwagi |
   |---|---|---|
   | krwionośny | 4: `artery_leg`, `vein_leg`, `artery_head`, `vein_head` | kierunek z topologii drzewa naczyń (`vessel_path`) |
   | nerwowy | 3: `back_motor`, `front_femoral`, `front_sympathetic` | |
   | pokarmowy | 10 (żyła wrotna, tętnice, mleczan, glukoza) | |
   | powłokowy | 11 (żyły skórne, ciepło) | tory `d_*` leżą w przestrzeni zbliżenia, nie ciała |
   | moczowy | 10 (nerki, mocz) | tory `d_*` w przestrzeni zbliżenia |
   | kostny | 1 (`load_path_r`, siła) | |
   | oddechowy | tylko `flows.json` w pikselach | ślepa uliczka wg modelu §3.2; do przepisania na metry |
   | rozrodczy | pusty | |
4. **Wspólna kamera przodu całego ciała** (orto 1,80319, środek (0; −0,00359; 0,857)): kostny, krwionośny, mięśniowy, nerwowy, powłokowy,
   moczowy (`body_front`). Ten sam kadr = widok kluczowy „przód” w 3D. Prototypy przejmują go 1:1.
5. **Kolory 2D = kolory 3D.** `REST_MIX` i reguła emisji są w `palette.json`, więc shader 3D liczy tę samą funkcję co Blender.
   Rendery są w transformacji **Standard** (nie AgX), dlatego w 3D trzeba wyłączyć mapowanie tonów, inaczej kolory układów się rozjadą z planszami.
6. **Licencje w kodzie:** `license_check` + `NC_BLOCKLIST` (nerka, miedniczka, ślimak, przedsionek, naczynia wewnątrznerkowe). Eksport 3D używa tej samej listy.

## 3. Jakie dane już są, a jakich brak

| Dane | Jest? | Uwagi dla 3D |
|---|---|---|
| ID struktur | **częściowo**: kotwice mają klucze (`femoral`, `heart`), siatki mają nazwy Z-Anatomy (`Femoral artery.r`) | `structures.json` i `mesh_bindings.json` (etap E1) **nie istnieją**. Prototypy używają ID siatki w formie modelu §3.1: `za:<nazwa obiektu>` i `hra:<plik>/<węzeł>` |
| Stan per struktura | poziomy sprintu w skryptach plansz (`SPRINT_LEVEL` w `plate_krwionosny.py`, `sprint_level=` w `plate.add`) | nie są eksportowane do JSON; prototyp liczy je własną kopią reguł (opisane w eksporcie) |
| `chains.json` (łańcuchy „Całość”) | **nie istnieje** | P2 ma własną listę kroków wg storyboardu Reżysera §3.2, bez liczb |
| Fakty z `tSecFromBoutStart` | nie (F1–F10 Reżysera czekają na agenta faktów) | P2 pokazuje tylko kierunki i zdania już sprawdzone w planszach |
| GLB atlasu | **nie ma** (`src/atlas3d/`, `public/atlas3d/` nie istnieją; E3 nierozpoczęty) | prototypy mają własny eksport `blender/atlas/proto_export_glb.py` |

## 4. Problemy znalezione w przeglądzie

1. **Kotwice zbliżeń nie są w ramie ciała.** Zbliżenia oddechowego, moczowego i powłokowego mają środek kamery w x = 20 / 29,89 / 30
   (scena zbliżenia ustawiona obok ciała w Blenderze). Ich `anchors3d` i tory `d_*` nie nadają się wprost do sceny 3D całego ciała.
2. **Rozjazd kamer** (jak u Reżysera, problem 9): oddechowy i pokarmowy mają kadr tułowia (orto 0,56), mózg i rozrodczy widok z boku.
   W 3D to nie problem (jedna scena), ale przejście „plansza 2D → 3D w tym samym kadrze” wymaga osobnego ujęcia na takie plansze.
3. **Oddechowy ma strzałki w pikselach** (`flows.json`), a nie w metrach.
4. **Każdy render ma wbudowany szkielet i sylwetkę**, więc warstw 2D nie da się sumować. W 3D znika ten problem: szkielet to osobna siatka.
5. **`#atlas` wstępnie pobiera zasoby filmu** (`models/athlete_gym.glb`, `audio/narration/manifest.json`); konsola ostrzega, że nieużyte.
   Do zgłoszenia integratorowi (koszt pobrania na wejściu do atlasu).
6. **Naczynia i nerwy to krzywe**, nie siatki. W GLB muszą stać się rurami (koszt trójkątów) albo liniami. Model §3.2 szacuje 654 naczynia jako rury na ok. 390 tys. trójkątów.
7. **Brak `src/atlas3d/`**: wszystko, co zrobię, leży w `prototypes/atlas3d/`, żeby nie wchodzić integratorowi w pliki.
8. Plan Reżysera (`docs/ATLAS_REZYSER_PLAN.md`) i jego makieta są tylko w głównym checkoucie (nieśledzone), nie na gałęzi `atlas-uklady`.

## 5. Wnioski dla trzech propozycji

- Wszystkie trzy mogą stać na tych samych plikach GLB i tych samych danych (`anchors3d`, `flows3d`, `plates/*.ts`, `palette.json`).
  Różnią się kamerą i scenariuszem, nie zasobami. Dzięki temu porównanie jest uczciwe, a koszt eksportu płacimy raz.
- Podział plików wg licencji: `za_*.glb` (Z-Anatomy, CC BY-SA 4.0) i `hra_*.glb` (HuBMAP, CC BY 4.0), nigdy razem.
- Styl: matowy (księga §3), bez mapowania tonów, tło jak plansze `#070B14` z gradientem Reżysera (`#13203A` → `#070B14`), światło klucz/wypełnienie/kontra.
- „Każdy efekt ma zmienną”: emisja = poziom pracy w sprincie, strzałki = przepływ, zapalanie warstw = krok łańcucha. Żadnego bloomu dla ozdoby.

## 6. Co powstało po przeglądzie

Trzy prototypy i porównanie: `PROPOZYCJE_3D.md` w tym folderze. Zrzuty: `zrzuty/`.

## Stan na przerwę (E3-K3, 2026-11-26)
- Zrobione w K3 (nie wysłano jeszcze raportu `PUNKT KONTROLNY E3-K3`):
  - obszar 3D między paskami (model nie wchodzi pod przełączniki ani stopkę);
  - podpisy za obrysem modelu, na ciemnym tle (kontrast);
  - pasek skraca długie nazwy; dopasowanie szerokości kadru w widokach kluczowych (mózg z przodu);
  - odcięcie trójkątów nieużywanych przez planszę i ukrywanie pustych siatek: wszystkie 12 układów ma ≥ 50 FPS na Intel UHD (moczowy 25→50, oddechowy 29→56, krwionośny 48→60);
  - zrzuty 1440 wszystkich 12 (przód, bok, sprint) w `zrzuty/e3k3_1440/` + tablice `zrzuty/e3k3_12_ukladow_*`;
  - telefon 390 px: przycisk 3D ukryty (`zrzuty/e3k3_telefon_390_krwionosny.jpeg`).
- Sprawdzone: build, `check:atlas` i `check:atlas3d` OK; konsola bez błędów.
- Dalej: dopisać pomiary K3 do `E3_KONTRAKT_3D.md` i wysłać Dyrygentowi `PUNKT KONTROLNY E3-K3` (FPS z tabeli powyżej, zrzuty, telefon, kontrole).
- Modele GLB są poza Gitem (`public/atlas3d/`); po scaleniu w katalogu użytkownika: `npm run atlas:export3d`.
