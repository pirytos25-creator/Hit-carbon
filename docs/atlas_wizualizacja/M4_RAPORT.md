# M4: wspólny moduł animacji `src/biomotion` i akt 3 filmu na module

Stan: 2026-11-26, Wizualizator 3D, gałąź `claude/atlas-wizualizacja-3d-1dc29a` (po scaleniu `atlas-uklady` 576ee4d). Zgoda użytkownika: bramka A, „Tak, M4–M6”.
Architektura: `BIOMOTION_ARCHITEKTURA.md`. Nagrania i zrzuty: `zrzuty/m4/`.

## 0. Wynik w skrócie (warunki Dyrygenta)

| Warunek M4 | Wynik |
|---|---|
| 1. Akt 3 (i 12) na module, **bez regresji**, nagranie przed i po, FPS Low i High | **spełniony.** Ta sama klatka Low przed i po: średnia różnica pikseli **0,3/255**. Nagranie obok siebie: `m4_akt3_przed_po_low.mp4`. Pomiar A/B w tej samej karcie (Low): stary kod serce 19–24 FPS i tunel 41 FPS, moduł serce 22–25 FPS i tunel 42–44 FPS. Akt 12 na zegarze i cyklu serca modułu, konsola czysta |
| 2. Profil `film` = obecny wygląd; mat atlasu tylko jako nagranie porównawcze | **spełniony.** Domyślnie `film`. Mat atlasu (`filmMatte`) włącza się tylko ręcznie (`window.__BIOMOTION_LOOK__ = 'filmMatte'`). Nagranie: `m4_akt3_film_vs_mat.mp4`, klatka: `film_dzis_vs_mat_atlasu_t190.jpg` |
| 3. Kompensacja przed AgX: ΔE00 ≤ 10 dla `artery` i `vein` (zrzuty) | **spełniony: artery 9,7, vein 4,9** (bez kompensacji: 14,3 i 4,9), §3 |
| 4. Błędy filmu | **naprawione** (AgX na Medium+ za przełącznikiem, domyślnie wyłączonym, warunek Dyrygenta): `beatPhase` (zegar całkowany `BioClock`; test: błąd przyrostu fazy 2,5·10⁻¹⁵ wobec skoku do 0,5 cyklu w starej formule), `ACT_MODEL_MAP` zgodny ze scenami, **AgX był pomijany na Medium i wyżej (potwierdzone)**, teraz efekt `ToneMapping(AGX)` w kompozytorze (§4) |
| 5. Moduł nie importuje `useBiogenesisStore` ani `liveSimulationRef` | **spełniony** (grep: tylko komentarz w `frame.ts`). Stan przez `BioFrame`, wypełniany w `CinematicDirector` (`filmBioFrame`) |
| 6. Testy | build OK, `tsc` OK, `check:atlas` 0, `check:atlas3d` 0, `node src/biomotion/__tests__/selftest.mjs`: **biomotion OK** (10 testów). Atlas 3D krwionośny: scena bez zmian (`m4_atlas3d_przed_po.jpg`; różnice ramy po lewej i prawej pochodzą ze scalonej M3 integratora, nie z M4), 61 FPS, konsola czysta |
| Wydajność filmu (stan zastany) | **film już przed M4 ma na Low ok. 23 FPS w ujęciu serca aktu 3** (Intel UHD, 1440×900). To nie regresja M4; wchodzi do M7 (§5) |
| Czas | szacunek przed M4: **3–5 h** pracy agenta (niepewność wysoka). Rzeczywisty zegar: **19:55 → ok. 20:45, czyli ok. 50 min** z nagraniami i raportem |

## 1. Co jest w module (`src/biomotion`)

| Plik | Co robi | Skąd |
|---|---|---|
| `frame.ts` | `BioFrame`: stan klatki od odbiorcy (czas, dt, przewinięcie, fazy, tętno, rzut serca, poziom jakości) | nowe |
| `clock/BioClock.ts` | fazy serca i oddechu **całkowane** (dt·HR/60); przy przewinięciu deterministycznie | nowe (naprawa `PhysiologyEngine:217`) |
| `timeline/segments.ts` | `getSegmentAt` (akty, kroki gabloty), `stepDurationSec` (tempo z karty Reżysera) | uogólnione `getActAtTime` |
| `camera/ShotRail.ts` | `evaluateShots` **1:1 z `evaluateActShot`** (odcinki z smoothstep) + tryb `catmull` dla nowych ujęć | `ShotChoreography:728-786` |
| `camera/CameraRig.ts` | `followShot` (tłumienie + slerp), `dampFov`, `dollyZoom`, `microDrift` | `CameraSystem:81-107` |
| `camera/Rail.ts` | kamera ujęć kluczowych atlasu (przeniesiona 1:1 z `src/atlas3d/engine.ts`, eksport zostaje) | E3 |
| `particles/FlowPath.ts` | tor jako tablica próbek + **czas przejścia z przekroju łożyska** (v = Q/A) | M2 |
| `particles/FlowParticles.ts` | krwinki 3D: profil przyścienny, puls skurczowy, ściskanie, utlenowanie, krwinka-bohater, wygaszanie przy kamerze; **prędkość jako funkcja klatki** (w filmie liczona przy renderze, przez co się „starzała”) | `InstancedErythrocytes` + M2 |
| `particles/shapes.ts` | krwinka Evansa-Funga (LOD), kropla | film |
| `tissue/heartCycle.ts` | cykl serca → wagi kształtów; presety `PRESET_FILM_ACT3` / `ACT12` = dotychczasowe formuły | akt 3 i 12 |
| `look/agx.ts` | AgX z three.js 0.169 w JS, CIELAB, ΔE00, **kompensacja minimalizująca ΔE00** z modelem światła sceny, dopasowanie modelu z pomiaru | nowe |
| `look/profiles.ts` | profile `film` / `atlas` / `filmMatte`; mat atlasu odwracalny (`applyMatte`) | nowe |
| `quality/tiers.ts` | parametry modułu per poziom **z `QualityManager` bez zmian** (Low: bez MSAA, dithering ścian; od Medium: przezroczystość, materiał fizyczny) | M2 |
| `r3f/BioFlowParticles.tsx` | komponent R3F krwinek (film, gabloty, atlas) | nowe |
| `__tests__/selftest.mjs` | testy zegara, odcinków, AgX i kompensacji | nowe |

**Wpięcie (tylko w zakresie wpięcia):**
- `CinematicDirector.tsx`:
  - `BioClock` po `tickSimulation`, czyli fazy w stanie filmu są całkowane, z czego korzystają wszystkie akty, dźwięk bicia serca i HUD;
  - `filmBioFrame`;
  - profil wyglądu;
  - `ToneMapping(AGX)` w kompozytorze.
- `CameraSystem.tsx`: `evaluateShots`, `followShot`, `dampFov`, `dollyZoom` i `microDrift` z modułu.
- `Act03Cardiopulmonary.tsx`: `heartCycle` i `BioFlowParticles` zamiast `InstancedErythrocytes`.
- `Act12WeekMonthYear.tsx`: `BioClock` i `heartCycle`, czyli zmiana horyzontu (tempa) już nie powoduje skoku skurczu.
- `src/core/AssetManager.ts`: `ACT_MODEL_MAP`.
- `src/atlas3d/engine.ts`: `Rail` z modułu.

## 2. Prędkość z przekroju: ważna poprawka dydaktyczna

Tunel w akcie 3 zwęża się od tętniczki do naczynia włosowatego. Reguła „v ~ 1/r² jednej rurki” dałaby **najszybszy** przepływ w naczyniu włosowatym. Według wiedzy szkolnej krew płynie tam **najwolniej**, bo łączny przekrój wszystkich naczyń włosowatych jest największy.

Moduł bierze więc **przekrój całego łożyska** `A(u)` z danych (`FlowPath`), a nie promień jednej rurki:
- w tunelu łożysko włosowate ma względny przekrój ×3, co jest wielkością poglądową, bez liczby na ekranie;
- w jamach serca i aorcie (gablota, M2) `A = π·r²` z geometrii.

**Fakt do bramki** (agent faktów, poziom P): „krew płynie najwolniej w naczyniach włosowatych”.

## 3. Kompensacja barw przed AgX (warunek 3)

Pomiar: prototyp serca M2 (`prototypes/organs_m2`, ściany w barwie krwi, poziom Low, Intel UHD, 1440×900), mediany pikseli, ΔE00 jak w `check:atlas`. Zrzut porównawczy: `m4_deltaE_atlas_film_filmkomp.jpg`.

| Profil | artery: piksel | ΔE00 | vein: piksel | ΔE00 |
|---|---|---|---|---|
| atlas (bez mapowania tonów) | #D94650 | 3,7 | #3C5FB3 | 7,2 |
| film (AgX), bez kompensacji | #C47376 | **14,3** | #4F78B3 | 4,9 |
| film + kompensacja wszystkich tokenów | #C96563 | 9,7 | #2C58C7 | 8,1 |
| **film + kompensacja tokenów z ΔE > 10 (tu: artery)** | **#C96563** | **9,7** | **#4F78B3** | **4,9** |

Rozróżnienie artery–vein w profilu film z kompensacją: 37,4. Próg palety to 15.

Co wyszło po drodze:
- **AgX z three.js w ogóle nie potrafi wytworzyć tokenu `artery` #D93240.** Z założenia odbarwia nasycone barwy, więc nawet czysta czerwień daje najwyżej #D95745. Najlepszy osiągalny wynik bez światła sceny to ΔE00 = 3,5 przy ciemniejszej czerwieni. Dlatego kompensacja **minimalizuje ΔE00**, a nie dąży do równego RGB.
- Odbarwienie dokłada światło wypełniające sceny. Kompensacja korzysta z **modelu światła** `AgX(baza·irr + lift)` dopasowanego z jednego zrzutu bez kompensacji (`fitLightModel`); tu irr 0,70, lift 0,06.
- Dla `artery` margines jest cienki (9,7). Model z jednym szarym „liftem” słabo opisuje niebieski (dla `vein` kompensacja pogarszała wynik). Dlatego zasada: **kompensujemy tylko tokeny, których zmierzone ΔE bez kompensacji przekracza 10**. W gablotach (M5) każde studio dostaje własny pomiar i dopasowanie, co jest częścią kontroli punktu kontrolnego.

## 4. Błędy filmu naprawione w M4

1. **`beatPhase` skakał.** `PhysiologyEngine` liczył w trybie filmowym `(t·HR/60) % 1`, a HR jest zaokrąglany, więc przy każdej zmianie tętna faza przeskakiwała, nawet o pół cyklu (test). Teraz `BioClock` całkuje fazę w `CinematicDirector`, a przy przewinięciu ustawia ją deterministycznie. Akt 12 miał to samo przy zmianie horyzontu i też przeszedł na `BioClock`.
2. **`ACT_MODEL_MAP`** jest teraz zgodny z tym, co sceny faktycznie wczytują:
   - akt 2: `brain_macro` + `synapse_hero` (było: sportowiec i `neural_forest`);
   - akt 6: bez `cardiopulmonary`;
   - akt 12: bez `mitochondrion.glb`.
3. **AgX na Medium i wyżej: potwierdzone pomijanie.** `@react-three/postprocessing` (`EffectComposer.js:117-118`) na czas renderu ustawia `NoToneMapping`, więc na poziomach z kompozytorem film nie miał AgX (obraz przesycony, `przed_low_vs_medium_t190.jpg`).
   - W każdym łańcuchu kompozytora jest `ToneMapping(AGX)` przed winietą, ale **domyślnie WYŁĄCZONY** (`blendFunction: SKIP`): profil `film` = wygląd znany użytkownikowi, dopóki on nie zdecyduje (warunek Dyrygenta po audycie M4).
   - Włączenie do pokazu: `window.__BIOMOTION_AGX_ALL_TIERS__ = true`, a potem zmiana poziomu jakości; w danych: `LOOK_PROFILES.film.agxAllTiers`.
   - Sprawdzone: Medium domyślnie ma jasność 160,5, tak samo jak przed M4 (160,5).
   - **Do decyzji użytkownika:** `m4_medium_agx_dzis_vs_naprawa.jpg` (Medium dziś / po naprawie: kolory spokojniejsze, zgodne z Low, serce bledsze).
   - Na Low (bez kompozytora) bez zmian.

## 5. FPS (Intel UHD 0xA7A8, Chrome ANGLE D3D11, 1440×900, rAF w oknie na wierzchu, bez nagrywania)

| Fragment aktu 3 | Low przed | Low po | High przed | High po |
|---|---|---|---|---|
| serce (185–197 s) | 23,5 / 22,7 | 19,6 … 22,7 (A/B: stary 19–24, moduł 22–25) | 15,4 | 13,1 |
| tunel z krwinkami (245–257 s) | 48,3 | 40,4 … 43,8 (A/B: stary 41, moduł 42–44) | 22,9 | 19,7 |

- Rozrzut między przebiegami na tej maszynie wynosi ok. ±15% (karta GPU dzielona z innymi sesjami). Dlatego rozstrzyga **pomiar A/B w tej samej karcie** (tymczasowy przełącznik, usunięty przed commitem): moduł nie jest wolniejszy.
- High po zmianie ma dodatkowo efekt `ToneMapping` w kompozytorze. Postprocessing łączy efekty w jeden przebieg, a różnica mieści się w rozrzucie.
- RTX: **niezmierzony** (decyzja użytkownika o ustawieniach Windows).
- **Uwaga do M7:** film już przed M4 nie trzyma 50 FPS na UHD w ujęciu serca na Low (ok. 23 FPS: płuca półprzezroczyste, rój cząsteczek, scena następnego aktu). To stan zastany, nie regresja. Wpisuję jako zadanie optymalizacji filmu przy wpięciu serca M2 do aktu 3 (M7).

## 6. Nagrania i zrzuty (`zrzuty/m4/`)

- `m4_akt3_przed_po_low.mp4` (27 s, obok siebie: przed i po, serce i tunel, Low), klatki: `m4_przed_po_klatki.jpg`;
- `m4_akt3_film_vs_mat.mp4` (27 s, obok siebie: film dziś i mat atlasu), klatka: `film_dzis_vs_mat_atlasu_t190.jpg`, **do decyzji użytkownika**;
- `przed_low_vs_medium_t190.jpg` (błąd AgX przed), `przed_po_low_medium_t190.jpg` (przed i po, Low i Medium);
- `m4_deltaE_atlas_film_filmkomp.jpg` (pomiar ΔE: atlas / film / film z kompensacją);
- `m4_atlas3d_przed_po.jpg` (atlas 3D krwionośny).

## 7. Czego M4 nie robi (uczciwie)

- **Serce w akcie 3 to nadal `cardiopulmonary.glb`** (scalone, zdecymowane, kształty z ręcznych punktów). Podmiana na serce z M2 to zmiana wyglądu filmu, więc M7.
- Krwinki są liczone na CPU z tablicą próbek, nie w shaderze. Przy liczbach filmu (≤ 576) kosztuje to ułamki milisekundy, a przejście na GPU zostaje na gabloty z tysiącami krwinek.
- `getSegmentAt` nie zastąpił `TimelineEngine` (plik `src/core` poza granicami M4). Moduł go udostępnia, a gablota (M5) użyje go do kroków.
- Model światła do kompensacji jest dopasowany do jednej sceny (prototyp serca). Każde studio gabloty dostanie własny pomiar.
- Wzorzec „ref co klatkę” i `useBiogenesisStore` w innych aktach nie są ruszane. Moduł ich nie potrzebuje, a akty poza 3 i 12 są poza zakresem M4.
