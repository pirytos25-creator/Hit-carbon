# Wspólny moduł animacji `src/biomotion`: architektura (PLAN 2)

Stan: 2026-11-26, Wizualizator 3D. **To projekt, bez kodu w `src/`.**

Moduł powstaje w M4 (decyzja Dyrygenta v2). Ostateczne granice plików ustala integrator przed M4.

Podstawy:
- `FILM_PRZEGLAD.md`: co film ma i co da się wziąć;
- `M2_TEST_SERCA.md`: pomiary na Intel UHD;
- decyzja Dyrygenta v2 (`DECYZJA_UX_NARZADY.md`);
- karta Reżysera (`UX_POSIEDZENIE.md` §3.3–3.4).

## 1. Zasady

1. **Jeden moduł, trzech odbiorców:** atlas 3D (`src/atlas3d`), gabloty narządów (`src/organs`) i film (`src/director`, `src/scenes`).
2. **Moduł nie zna treści.** Dostaje dane (geometria, tory, ujęcia, stan 0–1) i parametry stylu (tokeny, tempo). Fakty, teksty i numery aktów zostają u odbiorców.
3. **Stan podawany z zewnątrz.** Moduł nie importuje `useBiogenesisStore` ani `liveSimulationRef`. Odbiorca podaje zegar i stan przez obiekt `BioFrame` (wzorzec „ref co klatkę” z `SimulationCore`).
4. **Ten sam ruch na każdym poziomie jakości.** Poziom zmienia tylko gęstość i oprawę (rozstrzygnięcie Dyrygenta §1 pkt 2).
5. **Kształty i tory liczone z geometrii w Blenderze**, a nie wpisywane ręcznie. Wielkość ruchu bez faktu jest „poglądowa” (chip).

## 2. Części modułu

| Część (plik w `src/biomotion/`) | Rola | Pochodzenie | Koszt na Low (UHD, zmierzony lub szacowany) |
|---|---|---|---|
| `clock/BioClock.ts` | zegar; fazy całkowane (serce, oddech), żeby nie skakały przy zmianie tętna; tempo; pauza | nowe (zamiast `beatPhase` z `PhysiologyEngine:218`) | ~0 |
| `timeline/segments.ts` | odcinki (akty, kroki gabloty, przewodnik „Jeden interwał”), `getSegmentAt`, przejście na końcu odcinka, stopklatki przy `prefers-reduced-motion` | uogólnione `getActAtTime` (`TimelineEngine:168-186`) | ~0 |
| `camera/ShotRail.ts` | ujęcia w formacie `CinematicShot` (bez zmian typu), krzywa Catmulla-Roma (zamiast odcinków liniowych), cel, FOV, DoF, `transitionType` naprawdę wykonywany | typ z `ShotChoreography:16-31`; ewaluacja przepisana | ~0 |
| `camera/CameraRig.ts` | tłumienie, slerp, dolly-zoom, mikrodryf; tryb „ujęcia kluczowe” (atlas E3), „gablota” (pochylenie ±35°, zoom) i „film” | `CameraSystem:81-107` + `Rail` z E3 (jedna szyna zamiast dwóch) | ~0 |
| `particles/FlowPaths.ts` | tory z Blendera (JSON) → **tekstura danych** (położenie, styczna, promień przekroju, etykieta odcinka) | nowe (M2: tablica 512 próbek) | 0 |
| `particles/FlowParticles.ts` | `InstancedMesh` z położeniem liczonym **w shaderze** z tekstury toru: v ~ 1/r², profil przyścienny, mnożnik fazy (czekanie przy zamkniętej zastawce), orientacja po stycznej z obrotem | nowe; w M2 CPU 0,84 ms na 1500 krwinek, w shaderze ~0 CPU | M2: 1500 krwinek mieści się w 91 FPS |
| `particles/shapes.ts` | kształty: krwinka (Evans-Fung, LOD 120/320 trójkątów), kropla (hormon, glukoza), komórka NK (z jądrem), pakiet impulsu, cząstka powietrza | `MolecularSimulation:10-26` + nowe | — |
| `tissue/TissueMotion.ts` | wagi kształtów (morph) z fazy: `Atrial_Systole`, `Ventricular_Systole`, `Valve_Open`; przemieszczenie w shaderze dla prostych przypadków (fala tętna w ścianie naczynia) | nowe + `vascularFlowShader` | M2: 0 FPS kosztu (zastawki B) |
| `tissue/CutPlane.ts` | płaszczyzna przekroju + **zalanie stencil** (ściana ma grubość); dla siatek nieszczelnych tryb „tylne ścianki”; przekrój kulisty („okno” wokół narządu) | `cutawayShader` (tryby 1, 2) + M2 | 2 przebiegi; w 91 FPS |
| `look/profiles.ts` | **profile wyglądu**: `atlas` (bez mapowania tonów, zgodny z planszami 2D) i `film` (AgX, ekspozycja). Tablica **kompensacji barw**: kolor bazowy przed AgX dobrany tak, żeby wynik trafiał w token (pomiar ΔE na zrzutach) | nowe; pomiar M2: artery w filmie ΔE00 18 bez kompensacji | ~0 |
| `look/materials.ts` | materiał tkanki (mat, AO z wierzchołków, SSS „wrap”); **materiał schematu** (jednolity `light`, płaskie cieniowanie, obrys 1,5 px; rozstrzygnięcie sporu 2); dithering Bayera (wygaszanie, ściana naczynia na Low); prawdziwa przezroczystość (High); tekstura stanu z E3 (`StateTex`, `_id`) | `atlasMaterial` (E3) + `bioPbrTextures` (po poprawce pamięci podręcznej) + M2 | dithering +1,1 ms; przezroczystość +15 ms (tylko High) |
| `look/lights.ts` | presety świateł z interpolacją (8 z filmu + „studio atlasu”) | `CinematicDirector:33-146, 228-260` | ~0 |
| `transition/ScaleTransition.ts` | przenikanie tła i mgły, wygaszanie kontekstu ditheringiem, okno kuliste | `ScaleTransitionSystem:55-81` + E3 | ~0–1 ms |
| `transition/OrganDive.ts` | wejście diegetyczne (§4) | nowe | jw. |
| `quality/tiers.ts` | parametry modułu per poziom (§3); korzysta z `QualityManager` **bez zmian** | `QualityManager.ts` | — |
| `r3f/*` | komponenty i hooki R3F: `<FlowParticles>`, `<BioLook>`, `<CutPlane>`, `useBioFrame` | nowe | — |

Po stronie Blendera:
- `blender/biomotion/`: eksport narządu (ID w wierzchołku jak E3, kształty z geometrii, AO, tory z promieniem, ujęcia). To uogólnienie `prototypes/organs_m2/tools/build_heart_m2.py`;
- wspólne funkcje z `atlas_lib.py` przez import, bez zmian w nim.

Dane:
- `public/organs/<narzad>/`: `organ.glb` (meshopt), `paths.json`, `shots.json`, `manifest.json`;
- wzorem E3: GLB poza Gitem, a `bindings.json` w Gicie.

## 3. Poziomy jakości (parametry modułu)

| | Low (Intel UHD, cel ≥ 50 FPS przy 1440×900) | High (karta dedykowana) | Cinematic (wypieki, nagrania) |
|---|---|---|---|
| DPR / wygładzanie | 1 / **bez MSAA** (M2: MSAA ok. 12 ms), opcjonalnie FXAA ok. 1 ms | 1,5 / MSAA 2–4 | Blender lub render offline |
| Krwinki w gablocie | ok. 900–1500 (LOD 120 trójkątów) | 3–5 tys. (320) | dowolnie |
| Krwinki na skali ciała | 0, czyli strumień jako wzór w ścianie (`vascularFlowShader`) | strumień + krwinki w zbliżeniu | — |
| Ściana naczynia w zbliżeniu | dithering Bayera | prawdziwa przezroczystość | — |
| Materiał | mat + AO z wierzchołków + SSS „wrap” | + sheen, mapa środowiska, SSAO | Cycles/EEVEE |
| Profil | atlas albo film z kompensacją | jw. | jw. |
| Automat | `AdaptiveQualityController` (istniejący) | jw. | — |

Liczby z M2 dla Low: 91 FPS (serce, stencil, 1500 krwinek). Ten sam pomiar (`__bench`) będzie częścią każdego punktu kontrolnego.

## 4. Wejście diegetyczne (`OrganDive`)

Przebieg (np. widok krwionośny → serce), ok. 2,1 s; przy `prefers-reduced-motion` zamiast tego przenikanie 0,3 s:
1. **Klik** w narząd (albo Enter na strukturze z klawiatury). Wybór przez GPU z ID w wierzchołku (E3).
2. **Wjazd (1,2 s):** `ShotRail` z ujęciem `organ_dive`, typ `occlusion_dive` (format filmu).
   - Ciało gaśnie ditheringiem Bayera do 0, bez półprzezroczystych nakładek (kontrakt Reżysera).
   - Równocześnie **okno kuliste wokół narządu** (`cutawayShader` tryb 2) wycina żebra i naczynia z przodu. To spełnia warunek Dyrygenta dla M5: w kadrze końcowym ciało ≤ 5% krycia albo wycięte wokół narządu.
   - Tło przechodzi w studio gabloty (`ScaleTransition`).
3. **Podmiana modelu**, ukryta ruchem:
   - **Serce, nerka, wątroba:** widok układów E3 używa **tych samych plików HuBMAP** (`bindings.json`). Nie ma podmiany osobnika, a gablota dociąga tylko wnętrze i kształty ruchu. Plik gabloty pobiera się w tle już przy najechaniu na narząd (ok. 2 MB, M2: serce 1,91 MB). Jeśli nie zdąży, wjazd zwalnia i lokalizator pokazuje postęp.
   - **Mózg:** gablota na Z-Anatomy/Brainder (decyzja Dyrygenta), czyli też bez podmiany.
   - **Gdyby kiedyś trzeba było zmienić osobnika** (np. Allen): podmiana w klatce, w której narząd zajmuje > 85% kadru i kamera jest w ruchu. Nowy model jest ustawiony w ramie ciała (`align_hubmap`, średni błąd 1,56 cm). Do tego przenikanie ditheringiem 0,25 s. Ryzyko: przy dużej różnicy kształtu widać „przeskok” obrysu. Zamiennik: wjazd w powierzchnię (pełne zasłonięcie kadru) i podmiana pod zasłoną.
4. **Ustawienie w studiu (0,9 s):** pierwsze ujęcie gabloty; panel i zakładki wsuwają się.
5. **Wyjście:** to samo odtworzone wstecz.

**Ryzyka:**
- czas pobrania na wolnym łączu, czyli wyprzedzające pobieranie przy najechaniu;
- koszt dwóch scen naraz w trakcie wjazdu: ciało z ditheringiem i gablota, przez ok. 1 s; do pomiaru w M5, a zamiennik to zwolnienie geometrii ciała po 50% wjazdu;
- skala: w widoku układów narząd jest w ramie ciała, w gablocie w studiu, czyli przejście to ruch kamery, a nie przeskalowanie modelu.

## 5. Jak moduł wpina się w trzech odbiorców

| Odbiorca | Co bierze | Punkt wpięcia | Kto pisze |
|---|---|---|---|
| **Atlas 3D** (`src/atlas3d`, E3) | `CameraRig` (zamiast `Rail`), `FlowParticles` (wyróżniki z torami `flows3d` jako dane), `look/profiles` (`atlas`), `materials` (`StateTex` zostaje), `ScaleTransition` + `OrganDive` | `engine.ts` i `controller.ts` (moje pliki z E3) | Wizualizator |
| **Gabloty** (`src/organs`) | całość | nowy `OrganView.tsx` na ramie integratora (lokalizator, chip skali, przełącznik momentu, „Jak czytać”, zakładki panelu) | Wizualizator (scena) + integrator (rama, wejście w `AtlasApp`) + agent faktów (treść) |
| **Film** (`src/director`, `src/scenes`) | `ShotRail` i `CameraRig` (zamiast `evaluateActShot` i kamery w `CameraSystem`), `FlowParticles` (zamiast `InstancedErythrocytes`), `TissueMotion` + zasób serca z M2 (zamiast serca z `cardiopulmonary.glb`), `look/profiles` (`film`), `QualityManager` bez zmian | `Act03Cardiopulmonary.tsx`, `Act12*`, `CameraSystem.tsx`, `CinematicDirector.tsx` | Wizualizator (M4), przegląd integratora; warunek M4: akt 3 bez regresji (nagranie przed i po, FPS) |

Granice plików (propozycja dla integratora):
- Wizualizator:
  - `src/biomotion/**`, `blender/biomotion/**`, `src/organs/**` (scena gabloty), `src/atlas3d/**`;
  - w M4 akty 3 i 12 oraz `CameraSystem` i `CinematicDirector` w zakresie wpięcia modułu.
- Integrator: `AtlasApp`, rama gabloty i punkty wejścia.
- Agent faktów: dane treści.
- Nikt poza integratorem: `src/atlas/**` (plansze).

## 6. Element modułu → akt filmu

| Element | Pierwsze użycie | Akty filmu |
|---|---|---|
| `FlowParticles` (krwinki z przekrojem) | gablota serca (M5) | **3** (serce i tunel), **7** (tunel), **6** (ROZDZIAŁ), **12** |
| `FlowParticles` (krople: hormon, glukoza) | wyróżniki MAGAZYN i NADAWCA → ODBIORCA (M6–M7) | **5**, **7**, **8**, **11** |
| `FlowParticles` (komórki NK) | PATROL (M7) | **7** |
| `FlowParticles` (powietrze) | OBJĘTOŚĆ (M7) | **3** |
| `TissueMotion` serca (skurcz, zastawki) | M2 → M5 | **3**, **12**; proxy serca w **1, 6, 11** (LOD) |
| `TissueMotion` (płuca i przepona, po fakcie) | OBJĘTOŚĆ | **3** |
| `CutPlane` + stencil | gablota serca | **3** (przekrój serca), **8** (przekrój mózgu: dziś `cutawayShader` bez zalania), **1** (udo) |
| `ShotRail` / `CameraRig` | M4 (akt 3) | **wszystkie 12** |
| `ScaleTransition` / `OrganDive` | wejście w serce (M5) | **3** (wjazd w serce), **2** (mózg → rdzeń), **8** |
| `look/profiles` | M2 (pomiar), M4 | wszystkie; atlas używa `atlas`, film `film` |
| impuls (`actionPotentialShader`) | wyróżnik IMPULS | **2**, **9** |
| gablota nerki (filtr, nefron-schemat) | M8 | **6**, **11** |
| gablota wątroby (magazyn, zrazik-schemat) | M8 | **5**, **7**, **11** |
| gablota mózgu (obszary, droga ruchowa) | M8 | **2**, **8**, **10** |

## 7. Ryzyka modułu

1. **Regresja filmu przy M4.** Akt 3 ma dziś swoje serce, kamerę i krwinki. Warunek: nagranie przed i po + FPS na obu poziomach. Zmiana wyglądu filmu (mat atlasu zamiast połysku, bursztynowy nerwowy) wymaga decyzji użytkownika na bramce A.
2. **Profile wyglądu:** kompensacja barw dla AgX musi trzymać `minDeltaE` z `check:atlas`. Pomiar ΔE na zrzutach to część każdego punktu kontrolnego.
3. **Kompozytor postprocesu w filmie** może pomijać AgX na poziomach Medium i wyższych (do sprawdzenia w M4).
4. **Shader z wieloma łatkami** (`onBeforeCompile` z E3, `cutawayShader`, stan, dithering). Potrzebny jeden składacz łatek z kluczem programu, bo dziś `cutawayShader` nadpisuje cudze łatki.
5. **Wydajność dwóch scen w trakcie wejścia** do pomiaru w M5.
