# BIOGENESIS: THE HIIT EXPERIENCE — Architektura i Biblia Artystyczna

## 1. Wizja estetyczna i kolorymetria (AgX Look-Dev)
Projekt łączy dokumentalną fotografię makroskopową mikroskopii elektronowej i fluorescencyjnej z estetyką futurystycznej diagnostyki medycznej przyszłości.
- **Zarządzanie kolorem**: `THREE.AgXToneMapping` (`exposure ~1.05`) po stronie Three.js oraz `AgX` podczas weryfikacji w Blenderze 5.2 LTS.
- **Kontrolowany Bloom**: Próg luminancji `1.15`, niska intensywność (`0.28–0.35`), wyłącznie dla autentycznych struktur sygnałowych (fala potencjału czynnościowego, centra katalityczne ATP syntazy, pęcherzyki neuroprzekaźników, diody aparatury siłowni).
- **Brak plastikowego wyglądu**: Niestandardowe shadery tkankowe (`bioTissueShader.ts`) z efektem podpowierzchniowego rozpraszania światła (pseudo-SSS), warstwą śluzu/błony oraz organiczną modulacją normalnych.

### Palety kolorystyczne aktów (Ciągła metamorfoza nastroju)
1. **Akt I (Siłownia $\rightarrow$ Ciało)**: Chłodny grafit architektury (`#090e17`), stalowe światło kluczowe (`#dbeafe`), ciepły półton skóry z przejściem do głębokiej czerwieni mięśniowej (`#9e2a2b`) i błękitu układu nerwowego (`#38bdf8`).
2. **Akt II (Układ nerwowy)**: Ciemny granat korowy (`#060d1f`), cyjanowo-białe fale depolaryzacji błony (`#22d3ee`), złote pęcherzyki acetylocholiny (`#fbbf24`), bursztynowa kora nadnerczy (`#f59e0b`).
3. **Akt III (Serce i Płuca)**: Bogaty szkarłat tętniczy (`#dc2626`), głęboki burgund żylny (`#581c45`), perłowo-różowe pęcherzyki płucne (`#fda4af`), jasnoniebieskie cząsteczki $\text{O}_2$ (`#67e8f9`).
4. **Akt IV (Sarkomer)**: Koralowe wiązki mięśniowe (`#be123c`), srebrzysto-błękitne filamenty aktyny, złote główki miozyny S1, szmaragdowo-limonkowe jony $\text{Ca}^{2+}$ (`#4ade80`).
5. **Akt V (Mitochondrium)**: Głęboki fiolet macierzy (`#1e1035`), miedziano-szafirowe grzebienie błony wewnętrznej (`#0ea5e9` / `#f97316`), złocisty gradient protonowy i perłowy rotor $\text{F}_0\text{F}_1$.
6. **Akt VI (Granice HIIT)**: Dynamiczna czerwień termiczna (`#ef4444`), intensywne światło pulsacyjne zsynchronizowane z $HR$, złocisty kontrast fazy odpoczynku aktywnego.
7. **Akt VII (Bariera krew–mózg)**: Głęboki karmazyn tętnicy szyjnej przechodzący w turkusowo-szmaragdową sieć śródbłonka i astrocytów (`#14b8a6`).
8. **Akt VIII (Neurochemia mózgu)**: Półprzezroczysta kryształowa kora mózgowa (`#1e293b`), zróżnicowane sygnatury układów: Dopamina (`#f59e0b`), Serotonina (`#38bdf8`), Noradrenalina (`#22d3ee`), Endorfiny (`#f43f5e`), Endokannabinoidy (`#10b981`), Glutaminian/GABA (`#a78bfa` / `#60a5fa`).
9. **Akt IX (Wnętrze synapsy)**: Ultra-makro głębia mikroskopii konfokalnej (`#050a18`), fluorescencyjna zieleń i złoto błon pęcherzyków, błękitny gradient szczeliny synaptycznej.
10. **Akt X (BDNF i Neuroplastyczność)**: Kulminacja estetyczna — kaskady złocistego BDNF/TrkB, szmaragdowy rozrost kolców dendrytycznych, krystaliczna architektura hipokampa w ciepłym świetle odkrycia (`#fde68a` + `#38bdf8`).
11. **Akt XI (Regeneracja)**: Ciepłe złoto zachodu słońca w siłowni (`#fb923c` / `#fef3c7`), wyciszenie kontrastu, miękki szmaragd aktywacji nerwu błędnego.
12. **Akt XII (Tydzień, Miesiąc, Rok)**: Sterylny błękit atlasu przyszłości z dualistycznym porównaniem organów i biogenezą sieci mitochondrialnej.

---

## 2. Reżyseria skali i bezszwowe przejścia
- **Logarytmiczna oś skali**: od `10^0 m` (człowiek na bieżni) do `10^-9 m` (cząsteczki $\text{ATP}$, $\text{BDNF}$, receptory $\text{AMPA}/\text{NMDA}$).
- **Okno ładowania scen (`SceneManager`)**: W trybie filmowym podczas ostatnich 5 sekund każdego aktu (lub przez 1,4 s po ręcznym przeskoku) aktywne są jednocześnie dwie sąsiednie sceny: wychodząca i wchodząca, płynnie skalowane i łączone przez wolumetryczną mgłę tkankową (`ScaleTransitionSystem`) — **zero czarnych ekranów i cięć montażowych**.
- **Spójny zegar (`SimulationCore`)**: Jeden deterministyczny zegar czasu głównego $T \in [0, 1080]\text{ s}$ napędza jednocześnie: `PhysiologyEngine`, `CinematicDirector`, `AdaptiveMusicEngine`, `SpatialAudioSystem`, `NarrationEngine` i animacje obiektów 3D.

---

## 3. Kontrakty między 19 modułami architektury
Zgodnie z sekcją 24 specyfikacji system składa się z niezależnych modułów w `src/`:
- `SimulationCore` $\rightarrow$ udostępnia `useBiogenesisStore` (Zustand) oraz deterministyczną aktualizację klatkową bez alokacji GC w pętli `useFrame`.
- `PhysiologyEngine` $\rightarrow$ czysta funkcja / krokowy model `OrganismState` (0 zewnętrznych zależności od DOM/Three.js).
- `TimelineEngine` $\rightarrow$ mapuje czas $T$ na `ActId (1..12)`, postęp lokalny $u \in [0, 1]$, skalę logarytmiczną, segment narracji oraz parametry kamery.
- `AssetManager` $\rightarrow$ buforuje i zwalnia zasoby GLB (`athlete_gym.glb`, `cardiopulmonary.glb`, `muscle_sarcomere.glb`, `mitochondrion.glb`, `brain_synapse.glb`), pilnując niskiego zużycia VRAM na karcie RTX 4050 (6 GB).
- `QualityManager` & `PerformanceMonitor` $\rightarrow$ zarządzają budżetem klatek, histerezą jakości (Low–Cinematic) oraz odzyskiwaniem kontekstu WebGL.
- `AdaptiveMusicEngine`, `SpatialAudioSystem`, `NarrationEngine` $\rightarrow$ reagują wyłącznie na stan `SimulationCore` + `OrganismState`.
- `EducationalContent` & `ScientificReferences` $\rightarrow$ dostarczają dwujęzyczne rejestry wiedzy (Popularnonaukowy / Akademicki) wraz z klasyfikacją `EvidenceLevel` i zweryfikowanymi identyfikatorami PubMed/DOI.
