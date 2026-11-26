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
   - mózg Allen tylko w wersji ≥ v1.3 (lokalny plik to v1.2). Pobranie v1.3+ wymaga zgody użytkownika na pobranie pliku (zasada bezpieczeństwa agentów, surowsza niż statut). Gablota mózgu używa Braindera, więc pobranie przydaje się tylko do przebudowy `brain_macro.glb` w filmie;
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

### Stan kamieni (aktualizacja 2026-11-26)

**PLAN 2 obu agentów przyjęty:**
- Reżyser: `UX_POSIEDZENIE.md` v3, `8c20b84` (z uzupełnieniami `9473b53` i `cf56a8f`);
- Wizualizator: `NARZADY_PLAN.md` v3, `c640d7e`.

**M1 Poprzeczka: ZALICZONY.** Klatki w `docs/atlas_rezyser/klatki_docelowe/`, render Blender EEVEE prawdziwych modeli.

| Klatka | Ocena |
|---|---|
| (a) serce w przekroju z krwinkami 3D | jamy prawe z krwią odtlenioną, lewe z natlenioną; czytelna i zgodna z anatomią |
| (b) ROZDZIAŁ | spoczynek a sprint jako gęstość krwinek; różnica widoczna od razu |
| (c) wejście w serce | kierunek dobry. **Warunek dla M5:** w kadrze końcowym ciało ≤ 5% krycia albo wycięte wokół narządu, bo przy 12% żebra i naczynia zasłaniają serce. W M5 trzeba też poprawić kontrast napisu „SPOCZYNEK” na (b) |
| (d) wspólny materiał | mat, lekkie SSS, bez połysku; dwa profile wyglądu (atlas Standard, film AgX) z pomiarem ΔE |

**Czas M1:** rzeczywisty ok. 1,5–2 h wobec szacunku 4–8 h. Reżyser słusznie zastrzega, że tego tempa nie przenosimy na M2, bo tam powstaje kod czasu rzeczywistego. Pełne przeliczenie w M2′.

**Ustalenia Reżysera przyjęte:**
- przy zbliżeniu naczynia mają półprzezroczystą ścianę (koszt mierzy M2);
- na skali całego ciała znaczenie niesie strumień, a szczegół krwinki pojawia się dopiero w zbliżeniu;
- tor żylny `flows3d` przez żyłę odpiszczelową trzeba poprawić przy M6;
- **układ nerwowy w obu (atlas i film) w bursztynie z `palette.json`**.

**Do pokazania użytkownikowi na BRAMCE A, a nie jako osobne pytanie:**
- propozycja (d), czyli film przechodzi z połysku na mat atlasu;
- bursztynowy układ nerwowy w filmie.

Wizualizator pokaże w M4 nagranie aktu 3 przed zmianą i po niej. Ostatnie słowo należy do użytkownika, bo zmienia się wygląd filmu, który już zna.

**2026-11-26: zgoda użytkownika na M2 i M3 („Tak, M2 i M3”).** Uruchomione równolegle. Bramka A odbędzie się po M2 i M2′.

### M2′ Przeliczenie szacunków (2026-11-26)

| Kamień | Szacunek | Rzeczywisty czas pracy agenta | Stosunek |
|---|---|---|---|
| M1 klatki docelowe (Reżyser) | 4–8 h | ok. 1,5–2 h | ok. 0,25–0,4 |
| M2 test serca (Wizualizator; jego własny szacunek 4 h) | 6–12 h | ok. 0,4 h | ok. 0,05 |
| M3 czytelność plansz (integrator; jego szacunek 4–7 h) | — | ok. 0,5 h pracy + zrzuty w tle + 0,3 h poprawki walidatora (CRLF) | ok. 0,1–0,2 |

**Wnioski:**
- Sama praca agentów była 3–20 razy krótsza niż szacunki, także szacunki samych agentów.
- Wszystkie trzy kamienie w dużej mierze korzystały z gotowych elementów: potoku E3, profilu krwinki z filmu, znanych plików plansz.
- Czas kalendarzowy wyznaczają co innego:
  - kontrola faktów (niezależny agent sprawdza każde nowe zdanie);
  - audyty i pomiary Dyrygenta;
  - kolejka wiadomości między sesjami;
  - decyzje użytkownika.
  To one, a nie pisanie kodu, są wąskim gardłem.
- **Nie przenoszę wprost tempa M2 na M4 i M7.** Rozplątanie filmu (`liveSimulationRef`, cykl `ShotChoreography` ↔ `scenes`, jeden `useFrame`) to praca na cudzym, sprzężonym kodzie z ryzykiem regresji.

**Nowe szacunki** (czas pracy agentów; niepewność oznaczona; dodatkowo wspólnie ok. 1–3 h na kontrolę faktów i audyty na każdy kamień):

| Kamień | Czas pracy agentów | Niepewność | Główne ryzyko |
|---|---|---|---|
| M4 wspólny moduł, akt 3 bez regresji | 2–6 h | **duża** | sprzężenia filmu, kompensacja AgX (ΔE00 ≤ 10) |
| M5 serce wzorcowe z wejściem diegetycznym | 3–8 h | średnia | dwie sceny naraz przy wjeździe; teksty Podstawowe zależą od faktów (pytanie 2) |
| M6 rama + 4 wyróżniki 3D | 3–8 h | średnia | reguły wielkości z faktów (gęstość, częstość) |
| M7 8 wyróżników + wpięcie do aktów filmu | 6–15 h | **duża** | zmiana materiału i barw filmu (decyzja użytkownika na bramce A) |
| M8 nerka, wątroba, mózg | 2–5 h na gablotę, razem 6–15 h | średnia | schematy nefronu i zrazika, przekrój nerki, fakty |

**Razem M4–M8: ok. 20–50 h pracy agentów.** Poprzedni szacunek 155–210 h dotyczył „kresek”, przy innej poprzeczce jakości.

Kalendarzowo, przy 2–3 sesjach równolegle i sprawnych decyzjach: ok. 3–6 dni. Kolejne przeliczenie po M4.

### Po bramce A (2026-11-26): zgoda na M4–M6, podział pracy

| Kto | Co | Pliki | Kiedy |
|---|---|---|---|
| Wizualizator | **M4**: `src/biomotion` według `BIOMOTION_ARCHITEKTURA.md`; akt 3 (i 12) filmu na module **bez regresji**; profil `film` = obecny wygląd filmu (mat i bursztyn tylko jako nagranie porównawcze dla użytkownika); kompensacja AgX ΔE00 ≤ 10; poprawki błędów filmu: `beatPhase`, `ACT_MODEL_MAP`, AgX w kompozytorze | `src/biomotion/**`, `blender/biomotion/**`, akty 3 i 12, `CameraSystem`, `CinematicDirector` (tylko wpięcie) | teraz |
| Wizualizator | **M5**: gablota serca (`src/organs`) z wejściem diegetycznym z widoku krwionośnego 3D, ściany „mięsień” (przełącznik zostaje), zastawki B, panel tylko ze sprawdzonych faktów poziomu Podstawowego | `src/organs/**`, `src/atlas3d/**`, `public/organs/**` | po M4 |
| Integrator | **M6 rama**: lokalizator, „Co się zmieniło”, „Sprawdź się” (1 pytanie na planszę: nowe teksty jako draft, potem dwie kontrole jak w M3); **kontrakt wyróżnika** (2D i 3D, uzgodniony z Wizualizatorem); **punkt wejścia gabloty** w `AtlasApp` | `src/atlas/**` | teraz |
| Reżyser | scenariusz kroków filmu serca (M5; najwyżej 1 nowy ruch na krok) i specyfikacje 4 wyróżników (krwionośny ROZDZIAŁ, kostny KONSTRUKCJA, nerwowy IMPULS, powłokowy CIEPŁO): zmienna, Low, „Jak czytać” | `docs/atlas_rezyser/**` | teraz |
| Agenci 4 układów | **M6 wyróżniki**: 2D `src/atlas/signatures/<uklad>.tsx` i 3D jako wtyczka do modułu według kontraktu | każdy tylko swoje pliki | po M4 i kontrakcie |

### Kamień ML: licencje i wdrożenie w szkołach (po audycie komercyjnym, 2026-11-26)
Podstawa: `docs/atlas_audyt/AUDYT_KOMERCYJNY.md` (koordynator) i wymóg (l). Kamień rusza **po M5**, żeby nie blokować gabloty serca. Pozycje blokujące czekają na decyzję użytkownika.

| Pozycja | Kto | Kiedy |
|---|---|---|
| **Mózg filmu** (`brain_macro.glb`, Allen v1.2 bez komercji): **przebudowa z kory Brainder** (decyzja użytkownika (m)); usunięcie renderów v1.2 i pobierania Allen v1.2 | Wizualizator | zaraz po M5 (pierwsza pozycja ML) |
| **Lektor filmu** (68 MP3 z Edge „Czytaj na głos”, brak zgody na komercję): Azure płatny / Piper lokalny / lektor-człowiek | integrator | **decyzja użytkownika** |
| Ekran „Źródła i licencje” z manifestów i `creditsPl`, stały link w atlasie, 3D, filmie i gablotach | integrator | po M5 |
| Krok prebuild: publiczne fakty bez `quote`, `checkedBy`, `auto` (152 cytaty poza bundlem); `check:licencje` z błędem, gdy w dist są te pola lub zewnętrzne CDN | integrator | po M5 |
| Cytaty ze źródeł NC-ND i zastrzeżonych (StatPearls, Clinical Methods) w ogóle poza repozytorium produktu, tylko w dokumentacji kontroli | integrator | teraz (partia 2) |
| Pole `license` w `ScientificReferences`; pełny podpis OpenStax („Access for free at…”) | integrator | po M5 |
| **Wstrzymanie automatycznego pobierania OpenStax przez agentów** (zastrzeżenie OpenStax wobec AI); partia 3 E1-K3 czeka na nowe zasady źródeł | Dyrygent | od teraz |
| Atrybucje z URI licencji: DBCLS CC BY-SA 2.1 JP, Brainder, Dundee, HuBMAP z cytowaniem Browne 2020 i opisem zmian | Wizualizator | po M5 |
| Sprawdzenie nerwu VIII, gałęzi tętnicy nerkowej i kosteczek słuchowych pod `NC_BLOCKLIST` | Wizualizator | po M5 |
| Czcionki u siebie (@fontsource, OFL), usunięcie nieużywanego gsap; zgłoszenie zmian `package.json` koordynatorowi | integrator | po M5 |
| Film: skróty klawiszowe tylko przy fokusie, wersja tekstowa aktów, `BASE_URL` w `AssetManager`, start na Low na słabym GPU, ekran dla telefonu | integrator | po M5 |
| Poprawki `docs/LICENSES_AND_ASSETS.md` (Allen, „lokalny” lektor, GSAP, lucide ISC, postprocessing Zlib, BodyParts3D CC BY 4.0) i pliki LICENSE/NOTICE | integrator | razem z atrybucją Brainder |
| Rejestr zasobów `docs/ASSET_REGISTRY.json` | integrator + Wizualizator | po M5 |
| Projekty regulaminu, polityki prywatności, deklaracji dostępności i raportu WCAG; tabela zgodności z podstawą 2024/2027 | Dyrygent (projekty) → prawnik i nauczyciel | po M6 |

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

1. **Start:** M1 (klatki docelowe Reżysera, render bez kodu aplikacji) jest już w toku jako część planowania. Czy zgadzasz się na M2 (krótki test serca w katalogu prototypów, poza aplikacją), a potem pokaz (bramka A)? Czy równolegle zrobić M3 (poprawki czytelności plansz)?
2. **Fakty podręcznikowe:** czy wznowić ich sprawdzanie? Bez nich gabloty nie mają opisu budowy. Rekomendacja: tak, równolegle z M2.
3. **Telefon:** czy licealiści mają mieć gabloty na telefonie? Plan zakłada na telefonie planszę 2D z wypieczonymi ujęciami i stukaniem w części, a pełne 3D na komputerze.
4. **Test:** czy możesz po M6 pokazać atlas 2–3 licealistom (ok. 5 minut na osobę)?

Pytania o wejście do gablot, zastawki, nefron i zakres treści są zamknięte (§7 (g)).
