# Decyzja Dyrygenta: UI/UX atlasu, gabloty narządów i film (wersja 2)

Data: 2026-11-26. Wersja 1 (`4ec67df`) jest zastąpiona; jej ustalenia z §3 przechodzą tutaj.

Podstawa:
- §7 `ATLAS_MODEL_ARCHITEKTONICZNY.md`, decyzje (a)–(g), w tym nowe wymagania użytkownika:
  - animacje 3D dopracowane, a nie „kreseczki”;
  - wspólny moduł z filmem „12 aktów”;
  - kamienie milowe zamiast godzin;
  - odpowiedzi o gablotach;
- plan Reżysera `docs/atlas_rezyser/UX_POSIEDZENIE.md` (`77dd298`);
- plan Wizualizatora `docs/atlas_wizualizacja/NARZADY_PLAN.md` (`efb73c0`, gałąź `claude/atlas-wizualizacja-3d-1dc29a`);
- niezależne sprawdzenia Dyrygenta: `side-session-notes/…/dyrygent/podstawy_oceny_narzadow.md` i `ocena_NARZADY_PLAN.md`.

Oba plany są w poprawce pod (d)–(g) („PLAN 2”). Ta decyzja ustala ramę, którą PLAN 2 musi spełnić. Szczegóły kamieni M4–M8 uzupełnię po kamieniach M1–M2.

**Nic nie jest wdrażane bez zgody użytkownika.**

## 1. Zasady (obowiązują oba plany)

1. **Poprzeczka jakości: film.**
   - Przepływy to krwinki i cząstki 3D z objętością, zorientowane wzdłuż toru, z prędkością zależną od przekroju naczynia.
   - Tkanki ruszają się przez odkształcenie prawdziwej geometrii (cele morph, przemieszczenie w shaderze).
   - Światło i materiał są na poziomie filmu.
   - Strzałki i linie są tylko legendą „Jak czytać”.
   - Tory `flows3d` zostają jako **dane torów dla cząstek**, nie jako rysowane strzałki. W wersji 1 U3 opierało się na strzałkach i jest to unieważnione.
2. **Poziomy jakości zamiast niższej poprzeczki.**
   - Pełny poziom na mocnej karcie.
   - Uproszczony na Intel UHD przy ≥ 50 FPS: mniej cząstek, prostszy materiał, ten sam ruch i to samo znaczenie.
   - Wypiekany film z Blendera tylko wtedy, gdy krok nie mieści się nawet w poziomie uproszczonym.
   - Kontrakt Reżysera (≤ 1 ms GPU na wyróżnik w widoku układów, zakaz półprzezroczystych nakładek) obowiązuje na poziomie uproszczonym.
3. **Jeden wspólny moduł animacji dla trzech odbiorców:** atlas 3D, gabloty narządów i film „12 aktów”.
   - Moduł obejmuje cząstki, odkształcenia, materiały, światło, oś czasu kroków, kamerę po szynie, przejścia skali i poziomy jakości.
   - Budujemy na tym, co film już ma (`src/director`, `src/core/SimulationCore.ts`, `TimelineEngine.ts`, `QualityManager.ts`, `src/shaders/*`, `src/scenes/Act*`), a nie obok.
   - Granice plików i właściciela modułu ustala PLAN 2 Wizualizatora na podstawie przeglądu filmu (`FILM_PRZEGLAD.md`).
4. **Każdy element ma swój akt filmu** (mapa w §3).
5. **Wejście do gabloty jest diegetyczne.**
   - Kliknięcie narządu w widoku układu w świecie 3D uruchamia wjazd kamery w narząd, a ciało gaśnie.
   - Podmiana modelu (Z-Anatomy na HuBMAP, różni osobnicy) jest ukryta w ruchu kamery.
   - Bez menu i bez zwykłego przenikania ekranu. Menu „Narządy” najwyżej jako dodatek.
6. **Treść:** pierwsza wersja gablot ma tylko poziom Podstawowy, z poziomami zgodnymi z podstawą programową:
   - automatyzm serca (P V.4.9) i tworzenie moczu (P V.5.3) są w Podstawowym;
   - każdy tekst przechodzi bramkę §3.6.
7. **Ustalenia przeniesione z wersji 1:**
   - wspólna rama Reżysera także w gablotach;
   - nazwa poziomów „Podstawowy | Rozszerzony”;
   - K4 (teksty robocze na ekranie ucznia, pole `protocolNotePl` na 3 planszach) naprawiane w M3 i walidator obejmujący wszystkie pola tekstowe;
   - przekrój nerki bez „labiryntu”;
   - nefron, zrazik i układ bodźcoprzewodzący jako jawny „schemat, bez skali”;
   - zastawki: wariant A, a B wcześniej, jeśli M2 pokaże, że jest tani.
8. **Licencje:**
   - gabloty na HuBMAP (CC BY 4.0);
   - mózg Allen tylko w wersji ≥ v1.3 (lokalny plik to v1.2). Zgoda Dyrygenta na darmowe pobranie z oficjalnego repozytorium HuBMAP zgodnie ze statutem;
   - zero NC.

9. **Ustalenia z niezależnego przeglądu kodu filmu** (Dyrygent, 2026-11-26; pełny zapis: `side-session-notes/…/dyrygent/film_przeglad_dyrygent.md`):
   - **Film ma już gotowe serce HuBMAP z kształtami** `Atrial_Systole`, `Ventricular_Systole`, `Apex_Helical_Twist`, `Valve_Open` (`public/models/cardiopulmonary.glb`, `blender/gen_02_cardiopulmonary.py`) oraz krwinki 3D (`InstancedErythrocytes`, `src/scenes/MolecularSimulation.tsx`). **M2 zaczyna się od tych elementów.** Kształt `Valve_Open` może sprawić, że zastawki B są tanie, co M2 sprawdzi.
   - **Luka do zamknięcia w module:** w filmie prędkość krwinek nie zależy od przekroju naczynia (jest tylko profil promieniowy i puls). Wymaganie (d) mówi o „prędkości zależnej od przekroju”.
   - **Wspólna ścieżka koloru (decyzja w PLAN 2):** film liczy kolor przez AgX + HDRI + postprocessing, a atlas 3D przez `flat`, bez tone mappingu, żeby kolory zgadzały się z planszami 2D. Moduł musi mieć jawne profile wyglądu. Paleta układów sprawdzana walidatorem musi dawać ten sam odbiór w obu profilach, co potwierdza pomiar ΔE na zrzutach.
   - **Sprzężenia do rozplątania przy M4:**
     - globalne `liveSimulationRef` i `useBiogenesisStore` w komponentach;
     - cykl `ShotChoreography` ↔ `scenes`;
     - numery aktów w `CameraSystem`;
     - jeden `useFrame` w `CinematicDirector` łączący zegar, audio, narrację, jakość i światło;
     - dwie implementacje kamery na szynie (`evalPolySpline` i `Rail`).

     Warunek M4 bez zmian: akt 3 działa na module bez regresji.
   - **Ryzyko licencji w istniejącym filmie:** `brain_macro.glb` powstał z `VH_Male/v1.2/Allen_M_Brain.glb` (`gen_05_brain_synapse.py`), a CC BY mózgu Allen obowiązuje od v1.3. Po pobraniu v1.3+ trzeba przebudować `brain_macro.glb` i poprawić `docs/LICENSES_AND_ASSETS.md`. Zadanie dla Wizualizatora, osobny mały kamień. **Niepilne** (sprawdził koordynator, 2026-11-26): `brain_macro.glb` nie jest nigdzie opublikowany. Origin `Hit-carbon` jest pusty, a starsze publiczne repozytorium HIIT2 ma własny, proceduralny model mózgu. Przebudowa ma nastąpić przed publikacją filmu.

### Rozstrzygnięty spór 1 (Reżyser i Wizualizator): „jeden ruch na wyróżnik” a film serca
- **W widoku układu (plansza 2D i 3D)** wyróżnik ma jeden ruch, zgodnie z kartą Reżysera.
- **W filmie gabloty i w akcie filmu** każdy krok wprowadza **najwyżej jeden nowy ruch**. Ruchy z poprzednich kroków mogą trwać dalej (propozycja Wizualizatora).
- Uzasadnienie: obie strony chronią to samo. Uczeń w każdej chwili ma jedną nową rzecz do zrozumienia.

### Rozstrzygnięty spór 2 (Reżyser i Wizualizator): jak wygląda „schemat”
- Użytkownik: „nie te kreseczki”. **Schemat (nefron, zrazik, układ bodźcoprzewodzący, skrzyżowanie piramid) jest BRYŁĄ 3D, a nie kreską 2 px.**
- Schemat ma osobny materiał: matowy, jednolity, bez realistycznej tekstury. Do tego chip „schemat, bez skali”.
- Wspólna gramatyka:
  - materiał realistyczny = model z danych;
  - materiał matowy z chipem = schemat lub ilustracja;
  - kreska tylko w legendzie „Jak czytać”.

### Inne rozstrzygnięcia (wersja 3 planu Wizualizatora, `c640d7e`)
- **Mózg w gablocie:** domyślnie Z-Anatomy/Brainder, ten sam mózg co w widoku układów (BY-SA, osobny plik). Dzięki temu nie ma podmiany modelu, przerwy 6,8 mm ani pobierania. Allen ≥ v1.3 wchodzi tylko wtedy, gdy Brainder nie ma struktur potrzebnych na poziomie Podstawowym. To decyzja techniczna Dyrygenta, nie pytanie do użytkownika.
- **Poziomy jakości:** biorą istniejący `QualityManager` filmu (Low ≥ 50 FPS na UHD, High, Cinematic). Low odpowiada poziomowi „uproszczonemu” z §1 pkt 2.
- **Wspólny moduł:** `src/biomotion` (oś czasu, `ShotRail` na typie `CinematicShot`, `FlowParticles`, `TissueMotion`, `BioMaterials`, `QualityTier`), zgodnie z propozycją Wizualizatora. Granice plików ustala integrator przed M4.
- **Modele filmu mają opisane pochodzenie i licencje** w `docs/LICENSES_AND_ASSETS.md` i w skryptach `blender/gen_0*.py` (MPFB2 CC0, HuBMAP/Allen CC BY, PDB domena publiczna, Poly Haven CC0). Wyjątek to ryzyko Allen v1.2 opisane w §1 pkt 9.
- **Numeracja kamieni:** obowiązuje numeracja tej decyzji (M1–M8). U Wizualizatora: jego M0 = M2 (test serca), jego M1 = M3, M2 = M5, M3 = M5/M7 (film i wejście), M4 = M4, M5 = bramka B.

## 2. Kamienie milowe (zamiast godzin)

Każdy kamień kończy się **wynikiem do obejrzenia**. Przy M1 i M2 podaję szacunek czasu, żeby po nich porównać go z rzeczywistością. Dalsze szacunki przeliczę według tego porównania.

| Kamień | Wynik do obejrzenia | Kto | Szacunek | Warunek przejścia |
|---|---|---|---|---|
| **M1 Poprzeczka** | 4 klatki docelowe z prawdziwych modeli: serce z krwinkami 3D, ROZDZIAŁ krwionośnego w 3D, wejście diegetyczne w serce, wspólny język światła z filmem; przy każdej opis „co tu widać i czego uczy” | Reżyser | 4–8 h (niepewność duża) | akceptacja Dyrygenta, pokaz użytkownikowi |
| **M2 Test serca** | prototyp jednego ujęcia (skurcz serca HuBMAP + krwinki 3D przez jamy i zastawki), tylko w `prototypes/**`; nagranie lub seria zrzutów; FPS na Intel UHD (1440×900) dla obu poziomów; porównanie z klatką M1; czas szacowany i rzeczywisty; ocena kosztu zastawek B | Wizualizator | 6–12 h (niepewność duża) | uproszczony ≥ 50 FPS UHD; wygląd blisko M1 |
| **M2′ Przeliczenie** | tabela: szacunek a rzeczywistość dla M1 i M2, nowe przedziały dla M3–M8 | Dyrygent | — | raport do koordynatora |
| **BRAMKA A** | użytkownik ogląda M1 i M2 i decyduje o kierunku | użytkownik | — | zgoda na M3–M6 |
| **M3 Czytelność (U0)** | 24 zrzuty przed i po (12 plansz × 1440 i 390): cel lekcji, pytanie, liczba-bohater, protokół w „ⓘ”, nazwany moment, telefon z tytułem, 0 tekstów roboczych | integrator + agent treści + sprawdzający | po M2′ | `check:atlas` 0, konsola czysta |
| **M4 Wspólny moduł** | moduł wydzielony z filmu; **akt 3 filmu (Cardiopulmonary) działa na nim bez regresji** (nagranie przed i po, FPS); ten sam moduł w prototypie gabloty | Wizualizator (+ integrator dla punktu wpięcia) | po M2′ | film bez regresji, oba poziomy jakości |
| **M5 Serce wzorcowe** | nagranie: widok krwionośny 3D → kliknięcie serca → wjazd kamery → gablota (obrót, ujęcia, przekrój, najechanie, panel Podstawowy, Sprawdź się) → film cyklu serca; FPS na UHD dla obu poziomów | Wizualizator + agent faktów | po M2′ | audyt Dyrygenta (K1–K3 jak w E3) |
| **M6 Rama i pilot wyróżników** | wspólna rama (U1) i 4 wyróżniki jako animacje 3D (krwionośny, kostny, nerwowy, powłokowy) z wersją uproszczoną; nagrania 2D i 3D | integrator + agenci układów + Wizualizator | po M2′ | „test zmiennej”, ≥ 50 FPS UHD |
| **BRAMKA B** | pokaz użytkownikowi i test z 2–3 licealistami (ok. 5 min na osobę, „mów na głos”) | użytkownik | — | lista poprawek, zgoda na M7–M8 |
| **M7 Rozwinięcie atlasu** | 8 pozostałych wyróżników 3D + wpięcie do aktów filmu (§3) | agenci układów + Wizualizator | po bramce B | nagrania, FPS |
| **M8 Gabloty nerki, wątroby i mózgu** | każda gablota jako osobny kamień z nagraniem wejścia, gabloty i filmu działania + wpięcie do aktu filmu | drugi agent 3D + agent faktów | po bramce B | audyt każdej gabloty |

M3 nie zależy od animacji. Jeśli użytkownik się zgodzi, może iść **równolegle** z M1–M2.

**Uczciwie o niepewności:** poprzednie szacunki (155–210 h) dotyczyły „kresek”. Nowa poprzeczka (animacja filmowa, wspólny moduł, wejście diegetyczne) podnosi koszt w nieznanym stopniu. Wiarygodną liczbę da dopiero M2′. Do tego czasu nie podajemy łącznej sumy godzin.

## 3. Mapa „element → akt filmu” (propozycja; weryfikacja w `FILM_PRZEGLAD.md`)

| Element (atlas lub gablota) | Akt filmu |
|---|---|
| serce: skurcz, krwinki przez jamy i zastawki | Akt 3 Cardiopulmonary (serce z kształtami i krwinki już są) i Akt 12 (serce na `Ventricular_Systole`) |
| oddechowy: OBJĘTOŚĆ (wentylacja) | Akt 3 Cardiopulmonary |
| krwionośny: ROZDZIAŁ krwi do mięśni | Akt 3 i Akt 6 HIIT Limits |
| nerwowy: IMPULS; mózg: droga ruchowa „decyzja sprint” | Akt 2 Neural Mobilization |
| mięśniowy: PRACA (rekrutacja włókien) | Akt 4 Muscle Engines |
| wątroba: glikogen → glukoza; pokarmowy: MAGAZYN | Akt 5 Energy Mitochondria (i Akt 7 według Wizualizatora) |
| powłokowy: CIEPŁO (pot, przepływ skórny) | Akt 6 HIIT Limits |
| hormonalny: NADAWCA → ODBIORCA | Akt 8 Neurochemical Symphony (i Akt 7 Crosstalk) |
| mózg: gablota (płaty, przekrój) | Akt 8 (mózg Allen z przekrojem już jest) |
| limfatyczny: PATROL (komórki NK) | Akt 7 Body-Brain Crosstalk |
| nerka: filtracja, mniej krwi w wysiłku; moczowy: FILTR | Akt 6 (mniej krwi w wysiłku) i Akt 11 Recovery Homeostasis (dziś najuboższy akt, tylko sportowiec i rój; nerka i wątroba go wzbogacą) |
| kostny: KONSTRUKCJA; rozrodczy: DŁUGI CZAS | Akt 12 Week-Month-Year (adaptacja) i Akt 1 Gym Awakening (krok biegu) |

## 4. Pytania do użytkownika (zostają tylko te)

1. **Start:** czy zaczynamy od M1 (klatki docelowe) i M2 (test serca), a potem pokaz (bramka A)? Czy przy okazji równolegle M3 (poprawki czytelności plansz)?
2. **Fakty podręcznikowe:** czy wznowić ich sprawdzanie? Bez nich gabloty nie mają opisu budowy. Rekomendacja: tak, równolegle z M2.
3. **Telefon:** czy licealiści mają mieć gabloty na telefonie? Plan zakłada na telefonie planszę 2D z wypieczonymi ujęciami i stukaniem w części, a pełne 3D na komputerze.
4. **Test:** czy możesz po M6 pokazać atlas 2–3 licealistom (ok. 5 minut na osobę)?

Pytania o wejście do gablot, zastawki, nefron i zakres treści są zamknięte (§7 (g)).
