# Przegląd filmu „12 aktów” pod kątem wspólnego modułu animacji

Stan: 2026-11-26, Wizualizator 3D. Tylko odczyt kodu, bez zmian w `src/`.

Źródła:
- mój spis (z pomocą podagenta czytającego kod, z odnośnikami plik:linia);
- niezależny przegląd Dyrygenta (`side-session-notes/…/dyrygent/film_przeglad_dyrygent.md`), który się z moim zgadza;
- doświadczenie z testu M2 (`M2_TEST_SERCA.md`).

Ocena każdego elementu:
- **BEZ ZMIAN**: wchodzi do modułu tak jak jest;
- **PO ODPLĄTANIU**: dobry, ale trzeba odciąć od globalnego stanu filmu;
- **PRZEPISAĆ**: nie spełnia wymagań (d)–(e);
- **ZOSTAJE W FILMIE**: specyficzne dla filmu.

## 1. Rdzeń, reżyseria, aplikacja

| Plik | Co robi | Ocena | Uwagi (plik:linia) |
|---|---|---|---|
| `core/QualityManager.ts` (122) | 5 poziomów (Low → Cinematic) + automat z histerezą (p75 z 90 klatek) | **BEZ ZMIAN** | `envResolution` nieużywane; automat nigdy nie wchodzi w Cinematic (:112). Lekcja z M2: preset Low musi mieć `msaaSamples: 0` (już ma) i to ma pozostać, bo MSAA na UHD kosztuje ok. 12 ms |
| `core/PerformanceMonitor.ts` (69) | bufor czasów klatki + `gl.info` | **BEZ ZMIAN** (drobna poprawka) | `Array.shift()` co klatkę (:20) |
| `core/TimelineEngine.ts` (190) | 12 × 90 s, `getActAtTime`, `transitionBlend` (ostatnie 5 s) | **PO ODPLĄTANIU** | `getActAtTime` (:168-186) uogólnia się na dowolną listę odcinków (akty, kroki gabloty, przewodnik). Nowy obiekt co klatkę (:175, :185), sztywne 5 s (:183) |
| `core/SimulationCore.ts` (372) | magazyn Zustand + mutowalny `liveSimulationRef` (60 Hz), zegar główny | **PO ODPLĄTANIU** (wzorzec), magazyn **ZOSTAJE W FILMIE** | Wzorzec „ref co klatkę + magazyn co 0,1 s” (:45-54, :359-370) jest dobry dla modułu. Magazyn miesza film, audio i UI (:56-146); nowy `OrganismState` co klatkę (:342) |
| `core/PhysiologyEngine.ts` (471) | model organizmu; `beatPhase` = `(t·HR/60)%1` (:218), `breathPhase` (:226) | **PRZEPISAĆ** (oscylatory) | W trybie filmowym faza **skacze**, gdy zmienia się zaokrąglone tętno (:217). Moduł potrzebuje fazy całkowanej, bo w M2 faza cyklu steruje kształtami i zastawkami |
| `core/AssetManager.ts` (92) | rejestr modeli, wstępne wczytanie na akt | **PO ODPLĄTANIU** | `ACT_MODEL_MAP` (:26-39) **nie zgadza się ze scenami** (akt 2 ładuje `brain_macro`, którego nie ma na liście; akt 6 nie ładuje `cardiopulmonary`); `disposeObject3D` (:72-89) nieużywane, a przydatne |
| `director/ShotChoreography.ts` (786) | 38 ujęć, `CinematicShot`, `evalPolySpline`, `evaluateActShot` | **PO ODPLĄTANIU** | Typ `CinematicShot` (:16-31) to dobry format ujęć dla modułu (gabloty też). **Cykl importów** reżyseria ↔ sceny (:3-4: `sampleBloodstreamCenterline` z aktu 3). `transitionType` jest tylko danymi (nikt go nie czyta poza plikiem). `evalPolySpline` to odcinki liniowe ze smoothstep (:728-745), więc na łukach widać załamania |
| `director/CameraSystem.tsx` (122) | szyna + tłumienie, slerp, dolly-zoom, mikrodryf, OrbitControls | **PO ODPLĄTANIU** | Tłumienie, slerp, FOV (:94-107) i dolly-zoom (:87-92) są dobre. Numery aktów wpisane na sztywno (:43, :53, :82). Singleton `erythrocyteCameraTarget` nigdy nie jest zerowany |
| `director/ScaleTransitionSystem.tsx` (113) | tło i mgła per akt, „welon” z torusa w ostatnich 5 s aktu | **PO ODPLĄTANIU** | Przenikanie tła i mgły (:55-81) nada się do wejścia diegetycznego (ciało gaśnie, studio gabloty). Kolory per numer aktu (:18-31), `color.set(string)` co klatkę |
| `director/CinematicDirector.tsx` (323) | jeden `useFrame`: zegar, audio, światło, kompozytor | **PO ODPLĄTANIU** (presety światła), reszta **ZOSTAJE W FILMIE** | 8 presetów światła z interpolacją (:33-146, :228-260) wchodzą do modułu. Zegar symulacji i audio w pętli renderu (:174-225); głębia ostrości zależna od numeru aktu (:263), a wartości DoF z ujęcia nie są czytane |
| `App.tsx` (150) | Canvas filmu: AgX, ekspozycja 1,05, `antialias = msaa > 0`, DPR z poziomu | **ZOSTAJE W FILMIE** | Do sprawdzenia w M4: kompozytor postprocesu (Medium+) może pomijać AgX, bo nie ma efektu ToneMapping (podagent, niezweryfikowane). Wpływa na profile wyglądu |

## 2. Shadery

| Plik | Ocena | Uwagi |
|---|---|---|
| `cutawayShader.ts` (94) | **BEZ ZMIAN** (+ rozszerzenie) | przekrój płaski lub kulisty z obwódką. Do modułu z zalaniem stencil z M2. Nadpisuje istniejący `onBeforeCompile` i ma jeden klucz programu (:31), więc trzeba składać łatki |
| `actionPotentialShader.ts` (69) | **BEZ ZMIAN** | fala wzdłuż UV.x, gotowa na wyróżnik IMPULS i drogę ruchową mózgu |
| `membraneProtonShader.ts` (58) | **BEZ ZMIAN** | |
| `vascularFlowShader.ts` (62) | **BEZ ZMIAN** (dziś nieużywany) | ściana naczynia tętnicza lub żylna + fala tętna z `uBeatPhase`. Pasuje do ROZDZIAŁU |
| `bioPbrTextures.ts` (264) | **PO POPRAWCE** | tekstury proceduralne (normalne, szorstkość). Błąd: pamięć podręczna po typie, więc `repeat` pierwszego wywołania wygrywa (:149-151, :224); generuje albedo, którego nie używa |
| `bioTissueShader.ts` (74) | nieużywany | |

## 3. Sceny i cząstki

| Element | Ocena | Uwagi |
|---|---|---|
| `createBiconcaveErythrocyteGeometry` (`MolecularSimulation.tsx:10-26`) | **BEZ ZMIAN** | profil Evansa-Funga; użyty w M2 |
| `InstancedErythrocytes` (`:55-199`) | **PRZEPISAĆ** | jeden tor, prędkość bez przekroju (`1,65 − 0,85 r²` + puls), kapilara jako zakodowany zakres t, `getPointAt` co klatkę dla każdej krwinki, odtwarzanie `InstancedMesh` przy zmianie poziomu, odczyt magazynu co klatkę. M2 zastępuje to torami z promieniem i tablicą próbek (CPU 3,1 → 0,84 ms) |
| `MoleculeSwarm` (`:213-297`) | **PO ODPLĄTANIU** | rój w prostopadłościanie bez toru. Nadaje się na tło („osocze”), nie na przepływ |
| `NeuralPathwayTube` (`NeuralSimulation.tsx`) | **PO POPRAWCE** | rura z potencjałem czynnościowym; `useMemo` z tablicą tworzoną w locie, więc geometria odtwarza się przy każdym renderze rodzica (:32-37) |
| `SceneManager.tsx` | **ZOSTAJE W FILMIE** | jedno `Suspense` na dwa akty, więc brak wczytanego modelu następnego aktu wstrzymuje bieżący |
| Wzorzec „skok czasu > 0,45 s = przewinięcie” w aktach 5, 7, 9 i w cząstkach | **DO WSPÓLNEGO HOOKA** | powtórzony 5 razy |
| `AnatomySystem.tsx` | **ZOSTAJE W FILMIE** | klasyfikator warstw sportowca; zapisy przezroczystości co klatkę |

## 4. Modele (`public/models`, licencje w `docs/LICENSES_AND_ASSETS.md`)

| GLB | Akty | Źródło | Ocena dla modułu |
|---|---|---|---|
| `cardiopulmonary.glb` (2,5 MB) | 3, 12 | HuBMAP serce, naczynia, płuca (CC BY 4.0), `gen_02` | **PRZEPISAĆ** serce: scalone w 4 obiekty, zdecymowane, bez ID struktur, skala ×4,2 poza ramą ciała, kształty z ręcznie wpisanych punktów, `Valve_Open` to rozdęcie zastawki (`gen_02:58-108`). Zastąpić zasobem z M2 (pełne serce, kształty z geometrii, ID) |
| `brain_macro.glb` (2,9 MB) | 2, 8, 10, 12 | HuBMAP Allen **v1.2** | ryzyko licencji (CC BY od v1.3); przebudowa przed publikacją filmu (decyzja v2 §1 pkt 9). Gablota mózgu stoi na Z-Anatomy/Brainder |
| `athlete_gym.glb` (2,6 MB) | 1, 6, 11 | MPFB2 CC0, 53 kości, 6 klipów chodu, „proxy serca HuBMAP” | **ZOSTAJE W FILMIE**. Proxy serca w aktach 1, 6 i 11 skaluje się `beatPhase` (Act01:201-204) |
| `bloodstream_tunnel.glb` (0,3 MB) | 3, 7 | proceduralny (`gen_06`) | zostaje (scena „podróż z erytrocytem”); jego krwinki przejdą na `FlowParticles` |
| `muscle_sarcomere`, `mitochondrion`, `neural_forest`, `synapse_hero` | 4, 5, 8–10 | proceduralne i PDB (domena publiczna) | zostają w filmie |

Kształty używane w kodzie:
- akt 3: `Atrial_Systole`, `Ventricular_Systole`, `Apex_Helical_Twist`, `Valve_Open`, `Lung_Inspiration`, `Diaphragm_Contract`;
- akt 12: `Ventricular_Systole`;
- inne akty: `Breath_Expand`, `Effort_Face`, `Catalytic_*`, `Pore_Open`, `Spine_Mature_Mushroom`, `Actin_Polymerized`.

## 5. Weryfikacja mapy „element → akt” (decyzja Dyrygenta v2 §3)

Co dziś jest w aktach:
- **serce:** akt 3 (główne) i 12, a jako proxy w aktach 1, 6 i 11;
- **mózg:** akty 2, 8, 10 i 12;
- **krwinki:** akt 3 (tunel, 360 bazowo) i 7 (180);
- **wątroby i nerki nie ma w żadnym akcie**: wątroba tylko w tekście (`TimelineEngine.ts:92`), a w akcie 2 są tylko prymitywne nadnercza (stożek i kula).

| Element | Akt wg decyzji | Weryfikacja |
|---|---|---|
| serce: skurcz, krwinki przez jamy i zastawki | 3 i 12 | **potwierdzone.** Akt 3 ma serce z kształtami (do podmiany na zasób M2) i tunel; akt 12 ma serce na `Ventricular_Systole`. Do tego proxy serca w aktach 1, 6, 11 (ten sam zasób w małej skali) |
| oddechowy: OBJĘTOŚĆ | 3 | **potwierdzone** (`Lung_Inspiration`, `Diaphragm_Contract` w akcie 3) |
| krwionośny: ROZDZIAŁ | 3 i 6 | **potwierdzone.** Akt 6 ma dziś tylko sportowca i rój, więc ROZDZIAŁ będzie tam nową treścią |
| nerwowy: IMPULS; mózg: droga ruchowa | 2 | **potwierdzone** (kora ruchowa, rdzeń, złącze, `NeuralPathwayTube` z potencjałem) |
| mięśniowy: PRACA | 4 (+1, ujęcie 5) | **potwierdzone** (sarkomer w akcie 4; akt 1 ujęcie 5 „thigh-cutaway”) |
| wątroba: glikogen → glukoza | 5 i 7 | **częściowo.** Akt 5 to mitochondrium i ATP (pasuje treściowo), akt 7 ma w podpisie „Mięśnie ↔ Wątroba”. **W żadnym akcie nie ma modelu wątroby**, więc gablota wątroby wnosi pierwszy model |
| powłokowy: CIEPŁO | 6 | **potwierdzone** (akt 6: termoregulacja w podtytule) |
| hormonalny: NADAWCA → ODBIORCA | 8 (+7, +2 ujęcie 3) | **potwierdzone**, ale nadnercza w akcie 2 są prymitywne (stożek i kula). Do podmiany na model z danych |
| mózg: gablota | 8 | **potwierdzone**; uwaga licencyjna Allen v1.2 (`brain_macro.glb`) |
| limfatyczny: PATROL | 7 | **potwierdzone** (tunel z krwinkami) |
| nerka: FILTR | 6 i 11 | **potwierdzone jako nowa treść.** Akt 11 (regeneracja) ma dziś tylko sportowca i rój, więc nerka i wątroba go wzbogacą. Nie ma tam modelu nerki |
| kostny i rozrodczy | 12 i 1 | **potwierdzone** (akt 1 ma krok biegu, akt 12 tryptyk adaptacji) |

Uzupełnienie mapy:
- **serce występuje też w aktach 1, 6 i 11 jako proxy** w sportowcu. Ten sam zasób z modułu (LOD) zastąpi proxy;
- **mózg jest też w akcie 10** (hipokamp i kora przedczołowa w BDNF), co może korzystać z grup obszarów z gabloty mózgu.

## 6. Krytyka wersji Low 12 wyróżników Reżysera (`UX_POSIEDZENIE.md` §3.3)

Pomiar odniesienia z M2 na UHD przy 1440×900:
- serce, stencil i 1500 krwinek z CPU 0,84 ms dają 91 FPS;
- MSAA kosztuje ok. 12 ms;
- prawdziwa przezroczystość ściany kosztuje ok. 15 ms;
- dithering ok. 1 ms.

W widoku układu obowiązuje kontrakt Reżysera: ≤ 1 ms GPU na wyróżnik.

| Wyróżnik (Low) | Ocena wykonalności | Uwaga |
|---|---|---|
| OBSZAR (mózg): zapalenie z tekstury stanu | **tak**, ok. 0 ms | to samo co E3 (`StateTex`) |
| IMPULS: 1 pakiet, emisja na odcinku rury | **tak**, < 0,2 ms | `actionPotentialShader` bez zmian |
| NADAWCA → ODBIORCA: ≤ 100 kropli | **tak**, < 0,3 ms | `FlowParticles` z torem w żyle |
| PRACA: zapalanie włókien w przekroju | **tak** | przekrój uda wymaga zalania stencil (jak serce) |
| KONSTRUKCJA: rozjaśnienie 4 kości po kolei | **tak**, ok. 0 ms | |
| OBJĘTOŚĆ: ≤ 300 cząstek powietrza | **tak**, < 0,3 ms | |
| ROZDZIAŁ: ok. 500 krwinek, ściana nieprzezroczysta, „strumień” | **tak, ale** | na skali całego ciała krwinka to ułamek piksela, a w nieprzezroczystym naczyniu jest niewidoczna. **Zamiennik:** na skali ciała „strumień” jako przesuwany wzór jasności w ścianie naczynia (`vascularFlowShader`), czyli 0 krwinek i < 0,5 ms; krwinki dopiero w zbliżeniu, z ditheringiem Bayera (+1 ms). 500 krwinek w nieprzezroczystej ścianie nic nie pokaże |
| MAGAZYN: ≤ 150 kropli, granulki statyczne | **tak** | |
| CIEPŁO: barwa i emisja skóry | **tak**, ok. 0 ms | |
| FILTR: mniej cząstek, nefron bez osocza | **tak** | nefron to schemat-bryła (rozstrzygnięcie sporu 2) |
| PATROL: ≤ 100 komórek | **tak** | |
| DŁUGI CZAS | **tak** | brak animacji |

Wniosek: wszystkie wersje Low mieszczą się w ≤ 1 ms. **Jedyna korekta dotyczy ROZDZIAŁU na skali ciała:** strumień w ścianie zamiast krwinek w nieprzezroczystym naczyniu.

## 7. Co z tego wynika dla wspólnego modułu (szczegóły: `BIOMOTION_ARCHITEKTURA.md`)

| Moduł | Bierzemy z filmu | Co dopisujemy lub przepisujemy |
|---|---|---|
| jakość | `QualityManager` bez zmian, `PerformanceMonitor` | — |
| oś czasu | `getActAtTime` uogólnione na odcinki | kroki gabloty, pauza i krok, stopklatki przy `prefers-reduced-motion`, faza całkowana (zamiast skaczącego `beatPhase`) |
| kamera | `CinematicShot`, tłumienie, slerp, dolly-zoom z `CameraSystem` | krzywa Catmulla-Roma zamiast odcinków liniowych; jedna szyna zamiast dwóch (`evalPolySpline` i `Rail` z E3); bez numerów aktów |
| przejście skali | przenikanie tła i mgły z `ScaleTransitionSystem` | wygaszanie kontekstu ditheringiem (E3), wejście diegetyczne |
| światło i materiał | 8 presetów światła, `cutawayShader`, `vascularFlowShader`, `actionPotentialShader`, `bioPbrTextures` (po poprawce) | profile wyglądu `atlas`/`film` z kompensacją ΔE, zalanie przekroju stencil, AO z wierzchołków, SSS „wrap”, dithering Bayera, tekstura stanu z E3 |
| cząstki | profil krwinki | `FlowParticles`: tory z promieniem, v~1/r², faza, tablica próbek → tekstura i GPU |
| odkształcenia | — (kształty filmu do przepisania) | `TissueMotion`: kształty liczone z geometrii w Blenderze, waga z fazy |

Sprzężenia do rozplątania w M4 (zgodne z Dyrygentem):
- `liveSimulationRef` i `useBiogenesisStore` w komponentach, czyli stan ma być podawany z zewnątrz;
- cykl `ShotChoreography` ↔ sceny, czyli tory jako dane, a nie import ze sceny;
- numery aktów w `CameraSystem` i `ScaleTransitionSystem`;
- jeden `useFrame` w `CinematicDirector`;
- dwie szyny kamery.
