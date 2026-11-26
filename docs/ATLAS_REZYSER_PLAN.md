# Atlas układów jako prezentacja: plan Reżysera

Stan na 2026-11-25. Autor: Reżyser (sesja planistyczna, bez kodu aplikacji). Decyzję o wdrożeniu podejmuje Dyrygent razem z użytkownikiem.

Powiązane dokumenty:
- `docs/ATLAS_MODEL_ARCHITEKTONICZNY.md`: model, decyzje użytkownika (§7), przewodnik w §3.4
- `docs/ATLAS_STYLE_BIBLE.md`: księga stylu
- `docs/ATLAS_DYRYGENT.md`: statut, punkty kontrolne
- `docs/ARCHITECTURE_AND_ART_BIBLE.md`: biblia filmu (wzorzec jakości)

Materiały do obejrzenia (w `docs/atlas_rezyser/`):

| Plik | Co pokazuje |
|---|---|
| `zrzuty/01_film_i_atlas_na_zywo.jpg` | dzisiejsza aplikacja na żywo (gałąź `atlas-uklady`): ekran startowy, akty I, III, V, VI, VIII, XII i atlas |
| `zrzuty/02_film_12_aktow.jpg` | 12 aktów filmu po „overdrive v2” |
| `zrzuty/03_atlas_plansze_integrator_K2.jpg` | 4 plansze atlasu po scaleniu (integrator, K2) |
| `zrzuty/04_atlas_krwionosny_K3_spoczynek_sprint.jpg` | krwionośny v2 w K3: spoczynek obok sprintu |
| `zrzuty/05_powlokowy_warianty_K1.jpg` | przykład układu w toku (powłokowy, K1) |
| `zrzuty/06_makieta_jeden_interwal.jpg` | **makieta przewodnika** z tego planu (4 chwile) |
| `prototyp/jeden_interwal.html` | **działająca makieta** przewodnika na prawdziwych renderach (opis niżej, §3.3) |

---

## 0. Najkrócej

**Pomysł:** atlas dostaje własny „film”, ale z innym bohaterem. Bohaterem filmu jest podróż w głąb skali, a bohaterem atlasu **czas jednego interwału**.
Przewodnik „Jeden interwał” trwa 90 s, czyli 45 s pracy i 45 s przerwy. To dokładnie długość jednego aktu filmu.
Widz ogląda całe ciało na jednej scenie. Warstwy układów zapalają się w kolejności, w jakiej naprawdę reagują.
Serce w głośniku bije w tempie tętna ze sprawdzonego faktu, a strzałki krwi gęstnieją tam, gdzie płynie więcej krwi. Dwa razy przewodnik zatrzymuje się i pyta: „przewidź, zanim zobaczysz”.

**Zasada, która godzi piękno z nauką:** *każdy efekt ma zmienną*.
Światło, ruch, dźwięk i ruch kamery wolno dodać tylko wtedy, gdy kodują zmianę stanu, przyczynę, skalę albo miejsce.
Efekt bez zmiennej wylatuje, nawet gdy jest ładny. Badania pokazują, że animacja ozdobna nie uczy (d≈−0,05), a animacja samej zmiany uczy (d≈0,40).
Ta reguła przekłada wynik badań na zasadę reżyserską.

---

## 1. Wnioski z przeglądu

### 1.1 Wzorzec: czym jest film (12 aktów, „overdrive v2”)

Obejrzałem go na żywo (zrzuty 01 i 02) i w kodzie: `ShotChoreography.ts`, `CinematicDirector.tsx`, `ScaleTransitionSystem.tsx`, `AdaptiveMusicEngine.ts`, `EphemeralBioCallout.tsx`, `TimelineEngine.ts`.

| Cecha | Jak to robi film | Co z tego przejąć do atlasu |
|---|---|---|
| **Jeden zegar** | `SimulationCore`: czas T ∈ [0, 1080] s napędza kamerę, fizjologię, muzykę i napisy. Każdy akt trwa 90 s | Przewodnik też ma jeden zegar (`tSecFromBoutStart`, 0–90 s), który napędza warstwy, strzałki, dźwięk i napisy |
| **Ujęcia z celem** | Każde ujęcie ma `narrativeGoalPl` i `educationalGoalPl` (np. „Fala przewodzenia SA → AV → His-Purkinje”) | Każde ujęcie przewodnika ma cel i `factIds`. Ujęcie bez faktu nie istnieje |
| **Ciągłość** | „Zero czarnych ekranów i cięć”: przenikanie scen przez mgłę tkankową, `occlusion_dive`, `match_cut` | Przejścia atlas ↔ film przez „zasłonę” w kolorze aktu i dopasowanie kształtu (udo → udo) |
| **Oprawa ekranu** | Chip aktu z nazwą i skalą (lewy górny róg), chip z żywym odczytem (prawy górny), napisy w ramce u dołu | Ten sam układ chipów i napisów w przewodniku, dzięki czemu atlas i film wyglądają jak jedna aplikacja |
| **Światło jako nastrój aktu** | 8 presetów (`gym_daylight`, `anatomy_medical`, `bloodstream_organic`…), paleta każdego aktu w biblii | W atlasie światło koduje **fazę**: praca jest ciepła, przerwa chłodna (§4.1) |
| **Dźwięk** | Muzyka generowana w WebAudio, z motywem na akt i pulsem zsynchronizowanym z tętnem; lektor nagrany wcześniej | Ten sam pomysł, ale jako **sonifikacja danych**: serce i oddech w tempie z faktów (§4.6) |
| **Poziomy dowodów** | `EvidenceLevel` w `AcademicDrawer`, dwa rejestry (popularny/akademicki) | Atlas ma już więcej: `checked_agent`, cytat, `protocolMismatch`, drabinę sformułowań |

**Słabe strony filmu (świadomie ich nie przenoszę):**
- **Liczby bez źródeł.** Odczyty w chipach (np. „HR 184 bpm · Temp. 38,6 °C”) liczy `PhysiologyEngine` z ręcznie dobranych stałych (model §4, punkt 6). W atlasie odczyt pokazuje tylko fakt `checked_agent`.
- **Ozdobność.** W akcie VI wokół biegacza latają kolorowe kule, a w akcie V cząsteczki nie mają legendy. To dokładnie ta „dekoracja” o d≈−0,05.
- **Połysk „plastiku”** na sercu i mózgu (zrzut 01, akty III i VIII). Atlas zostaje matowy, zgodnie z księgą stylu §3.

### 1.2 Atlas dziś: co jest dobre

Obejrzałem: `#atlas` na żywo (gałąź `atlas-uklady`, sama plansza mięśniowa z fazy 0), zrzuty integratora K1–K3, audyty Dyrygenta, worktree 7 układów (tylko odczyt).

1. **Prawdziwa anatomia.** Rendery pochodzą z Z-Anatomy i HuBMAP, a nie z modeli stylizowanych. Kotwice są sprawdzane z dokładnością do piksela (`wizualna_K2_krwionosny.md`).
2. **Wspólna kamera.** Mięśniowy, nerwowy i krwionośny mają **identyczną kamerę przodu** (orto 1,80319, środek (0; −0,004; 0,857), obraz 1000×1800).
   Sprawdziłem to w `anchors.json` w worktree integratora. **To największy skarb dla prezentacji:** plansze można nakładać i przenikać jak warstwy jednej sceny, bez nowych renderów (makieta to pokazuje).
   Brief 1b każe 7 nowym układom używać tej samej kamery.
3. **Strzałki w metrach** (`flows3d.json`) i kierunek przepływu z topologii drzewa naczyń. Ten sam tor posłuży w 2D i w 3D.
4. **Dyscyplina faktów:** `checked_agent`, dosłowny cytat, `protocolMismatch`, protokół 45/45 zgodny z filmem.
5. **E0 w toku:** podpisy HTML, `palette.json` z ΔE, ikony, dwa poziomy treści.

### 1.3 Atlas dziś: co odstaje od filmu

| # | Problem | Gdzie widać | Skutek |
|---|---|---|---|
| 1 | **Ciało „na kartce”:** płaskie czarne tło, bez głębi i podłoża, bez światła sceny | zrzuty 01 i 03 | wygląda jak wydruk z podręcznika, a nie jak część tej samej aplikacji |
| 2 | **Ciało małe w kadrze:** przy 1440 px zajmuje ok. 40% szerokości, reszta to pusta czerń i kolumna liczb | zrzut 03 | brak „bohatera kadru” |
| 3 | **Brak czasu.** Są dwa stany i przełącznik, nic między nimi. Spoczynek ↔ sprint przenika **cały obraz naraz** | zrzut 04 | oko nie wie, *co zmieniło się pierwsze i najbardziej* (badacz C, T3) |
| 4 | **Brak przyczyn.** Każda plansza to wyspa; łańcuch „mózg → nerw → serce → naczynia” istnieje tylko w dokumentach | — | atlas pokazuje stany, ale nie mówi, *dlaczego* |
| 5 | **Cisza.** Film ma muzykę i lektora, atlas nie ma żadnego dźwięku | — | zmiana trybu wygląda jak wyjście z aplikacji |
| 6 | **Inna typografia ekranu.** Film ma chipy, napisy i HUD, a atlas ma układ „dokumentu” z panelem kart | zrzuty 01 i 03 | dwa języki wizualne |
| 7 | **Jedyny most z filmem** to link „← Podróż filmowa” i przycisk na ekranie startowym | zrzut 01 | dwie wyspy (badacz C, §0) |
| 8 | **Panel liczb jak arkusz:** 4–6 kart jedna pod drugą, wszystkie równie ważne | zrzut 03 | brak hierarchii: która liczba jest tu najważniejsza? |
| 9 | **Rozjazd kamer:** oddechowy (orto 0,56, sama klatka) i mózg (widok z boku) nie mają kadru całego ciała | `anchors.json` | nie da się ich nałożyć na scenę „Całość” bez dodatkowego renderu |
| 10 | **Każdy render ma wbudowany szkielet i sylwetkę** | wszystkie plansze | warstwy można tylko *przełączać*, nie *sumować* (np. naczynia + nerwy naraz) |

Problemy 1–8 rozwiązuje oprawa i przewodnik (kod, bez nowych renderów). Problemy 9–10 wymagają jednego dodatkowego przebiegu Blendera („warstwy Całości”, §5.2).

---

## 2. Koncepcje prezentacji

### A. „Jeden interwał: kino danych” (REKOMENDACJA)

Przewodnik, który najpierw działa w 2D, opiera się na nałożonych planszach w jednej kamerze i ma 90-sekundowy zegar interwału.
- **Scena:** całe ciało w centrum, na „podeście” z miękkim światłem. Warstwy układów przenikają się w kolejności z grafu przyczyn.
- **Zbliżenia** to gotowe widoki `detail` (serce, pęcherzyk, udo → włókna → miozyna, przekrój mózgu) jako wstawka z linią do kotwicy. Wchodzą przez pchnięcie kamery w to miejsce.
- **Oś interwału** u dołu: czerwona praca, turkusowa przerwa. Na osi są kroki, a przy pytaniu „przewidź” zegar staje.
- **Dźwięk** to sonifikacja: serce, oddech i cisza dokładnie w 45 s.
- **Wyjścia:** „Zobacz w środku → Akt III”, „Sam zbadaj planszę”, „Interwał 2 z 6”.
- **Dane** to `chains.json` (krok = czas, układy, kotwice, strzałki, `factIds`, zdanie). Ten sam plik odtworzy później scena 3D.

Plusy:
- działa od razu na tym, co już jest;
- telefon dostaje tę samą treść;
- zgodne z §7: kamera nie lata, są widoki kluczowe i gotowe zbliżenia;
- tanie: tylko darmowe narzędzia, bez płatnych generacji.

Minusy:
- 2D nie daje „wow” obrotu;
- warstwy sumowane wymagają jednego przebiegu Blendera (§5.2).

### B. „Scena Całość 3D”

Ten sam przewodnik, ale w scenie R3F z GLB (etap E3/E4 modelu). Obrót poziomy po szynie do widoków kluczowych, a warstwy jako siatki z ID.

Plusy:
- najbliżej filmu wizualnie (paralaksa, prawdziwe światło);
- „Całość” jako jedna przestrzeń.

Minusy:
- zależy od prototypu E3, który jeszcze nie istnieje;
- budżety z §3.2 trzeba zmierzyć;
- telefon na później;
- 3–4 razy droższe niż A;
- ryzyko, że ładna scena zastąpi treść.

**Werdykt:** to druga faza koncepcji A, a nie alternatywa. Przewodnik czyta te same dane (`chains.json`), więc przejście na 3D to wymiana sceny, nie scenariusza.

### C. „Atlas wewnątrz filmu”

Plansze jako tryb pauzy w filmie: stop-klatka aktu przechodzi w planszę i z powrotem, w jednej scenie R3F.

Plusy: idealna ciągłość.

Minusy:
- wiąże atlas z `SceneManager` i `App.tsx` (kod filmu, poza zespołem atlasu);
- duże ryzyko regresji 12 aktów;
- łamie zasadę „atlas to osobny, leniwy fragment”;
- film nie ma kamery ortograficznej, a plansze ją mają.

**Werdykt:** z C bierzemy tylko **mosty**: głębokie linki i „zasłonę” w kolorze aktu (§4.7). Wymagają paru linii w kodzie filmu.

### Rekomendacja

**A + mosty z C, potem B na tych samych danych.** A daje 80% efektu „jak w filmie” przy ok. 25% kosztu B. Każdy element A przechodzi test „czy uczy zmiany”.

---

## 3. Storyboard przewodnika „Jeden interwał”

### 3.1 Zasady (z reguł reżyserskich, przełożone na atlas)

- **Kadr 0 to plakat.** Przewodnik otwiera się złożonym kadrem: całe ciało w spoczynku, oś i jedno zdanie. Nigdy na czerni.
- **Jeden ruch na ujęcie:** cięcie, pchnięcie, przenikanie warstwy albo strzałka. Nigdy dwa naraz bez powodu.
- **Najpierw geografia, potem akcja:** zbliżenie zawsze wychodzi z miejsca na ciele (pchnięcie do kotwicy plus linia do wstawki).
- **Linijka skali:** chip „1,8 m · ciało” przy całym ciele, „≈ 12 cm · serce” przy zbliżeniu serca (wartość z kamery `detail`, nie z głowy).
- **Kierunek ekranu stały:** krew do nóg płynie w dół kadru, powrót żylny w górę. Nigdy odwrotnie w jednym przewodniku.
- **Ujęcia skracają się ku szczytowi** (16 s → 12 s → 5 s), a potem przychodzi **jedna zatrzymana chwila** w 40–45 s.
- **Cięcie dźwięku na 45 s** (koniec pracy) to najmocniejszy akcent. Wiąże się z fizjologią, bo przy przerwie zmienia się wszystko.

### 3.2 Lista ujęć

Czas to sekundy od startu serii (`tSecFromBoutStart`). „F#” to fakty do znalezienia i sprawdzenia wg modelu §3.6 (lista w §3.4).
Zdania w kolumnie „Co widać / napis” to szkic. Ostateczny tekst piszą agent treści i walidator drabiny dowodów.

| # | Czas | Cel (czego widz się uczy) | Kadr i ruch | Co widać / napis (szkic) | Co słychać | Fakt |
|---|---|---|---|---|---|---|
| 0 | przed (−4–0) | punkt odniesienia: tak wygląda spoczynek | całe ciało przodem, statycznie; „plakat” | warstwa mięśni w spoczynku, oś pusta. „Jeden interwał: 45 s pracy i 45 s przerwy. Patrz, co zmienia się pierwsze.” | cisza, potem wolne bicie serca | F2a (HR spoczynkowe) |
| 1 | 0–4 | ruch zaczyna się w mózgu, nie w nodze | **przenikanie warstwy** mięśnie → nerwy (0,9 s); puls kotwicy „nerw udowy” | bursztynowy impuls płynie strzałką w dół uda | krótki „klik” startu taśmy (jedyny efekt dźwiękowy, motywowany fabułą) | F1 |
| 2 | 4–12 | tętno rośnie w sekundy; dlaczego | **pchnięcie** do serca (1,0 → 1,06, 1 s), potem wstawka „serce z przodu” | **PRZEWIDŹ:** „Tętno rośnie w sekundach czy po minucie?” Potem: „Najpierw słabnie hamowanie nerwu błędnego, potem dołącza układ współczulny.” | bicie przyspiesza do tempa z F2b | F2b, F2c |
| 3 | 12–28 | krew zmienia adres | wstawka znika; warstwa krwi + mięśni; **strzałki**: grube i szybkie do nóg, cienkie do trzewi | **PRZEWIDŹ:** „Przepływ przez jelita: ↑ czy ↓?” Potem „Mięśnie nóg ↑, jelita i nerki ↓”; skóra najpierw ↓ (F3c) | serce stałe; pod spodem cichy pad w skali motywu `hiit_peak` z filmu | F3a, F3b, F3c |
| 4 | 28–40 | oddech dogania serce | wstawka „pęcherzyk płucny” (sprint); strzałki krwi trwają | „Więcej powietrza na minutę, więcej krwi w naczyniach włosowatych płuc.” | dochodzi warstwa oddechu: filtrowany szum w tempie z F4 | F4 |
| 5 | 40–45 | **szczyt** (zatrzymana chwila) | wszystko, co pracuje, w pełnym kolorze; **nic się nie rusza poza strzałkami** | „Koniec pracy. Adrenalina rośnie do samego końca pracy, nie w pierwszych sekundach.” | serce i oddech na maksimum… **cisza dokładnie w 45 s** | F5 |
| 6 | 45–58 | co wraca szybko, a co wolno | warstwa krwi przygasa (sprint → pół); wstawka oddechu **zostaje w sprincie** | **PRZEWIDŹ:** „Co szybciej wraca do spoczynku: tętno czy oddech?” Potem: „Tętno spada szybko, oddech zostaje podniesiony dłużej.” | serce zwalnia wg F6; oddech prawie bez zmian | F6, F7 |
| 7 | 58–78 | mleczan i ciepło po pracy | warstwa krwi + (po K3) pokarmowy z wątrobą i powłokowy; strzałka żylna nogi → tułów | „Mleczan płynie krwią do wątroby, która robi z niego znów glukozę (cykl Cori). Skóra oddaje ciepło.” | spokojny pad w skali `recovery` z filmu | F8, F9 |
| 8 | 78–90 | dlaczego kolejna seria zaczyna się wyżej | tryb **„Co się zmieniło”**: w kolorze tylko to, co nadal podniesione | „Po 90 s tętno prawie wróciło, a oddech i mleczan jeszcze nie.” Trzy wyjścia: Akt III · plansza · interwał 2/6 | ciche bicie, wolniejsze niż w szczycie, szybsze niż w kadrze 0 | F10 |

Interakcja (wszystkie ujęcia):
- „Dalej” przeskakuje do następnego kroku, a „Pomiń, chcę sam” jest zawsze widoczne;
- spacja to pauza, ale nie przechwytuje fokusu przycisków;
- „przewidź” zatrzymuje zegar do odpowiedzi;
- przy powrocie (`localStorage`) atlas startuje od plansz.

Napisy są zawsze widoczne. Lektor jest opcjonalny (§4.6).

### 3.3 Makieta (`docs/atlas_rezyser/prototyp/jeden_interwal.html`)

Statyczna strona HTML. Nie jest kodem aplikacji. Używa zmniejszonych kopii renderów integratora (K3): mięśniowy, nerwowy, krwionośny i dwa zbliżenia.
Strzałki są rzutowane z prawdziwych `flows3d.json` tą samą matematyką co `projection.ts`, a pierścienie stoją na prawdziwych kotwicach.

Co pokazuje:
- przenikanie warstw w jednej kamerze;
- oś 45/45;
- pytania „przewidź”;
- wstawki zbliżeń;
- chipy jak w filmie;
- prosty dźwięk serca (WebAudio, przycisk „Dźwięk”);
- `prefers-reduced-motion`.

Liczby są **celowo puste** (`[fakt]`), a tempo serca i strzałek to 3 stopnie jakościowe, oznaczone jako ilustracja.

Jak obejrzeć:
1. Uruchomić serwer w `docs/atlas_rezyser`: `python -m http.server 5199`.
2. Otworzyć `http://127.0.0.1:5199/prototyp/jeden_interwal.html`.
3. Dopisek `#t=42` w adresie zatrzymuje zegar w danej sekundzie.

Sprawdzone zrzutem headless Chrome w 7 chwilach. Konsola: brak błędów.

Czego makieta **nie** pokazuje:
- warstw sumowanych (dziś każdy render ma szkielet, więc warstwy się przełączają, a nie dodają);
- telefonu;
- przejścia do filmu.

### 3.4 Fakty potrzebne przewodnikowi

Bez nich ujęcie traci liczbę albo całe wypada. Zasada:
- fakt `checked_agent`: liczba i kierunek;
- sprawdzony jest tylko kierunek (cytat mówi „rośnie”, bez wartości): sam kierunek ↑/↓;
- nic nie jest pewne: ujęcie wypada, a przewodnik się skraca.

Nie podaję tu żadnych wartości, bo AI nie tworzy liczb.

| ID | Twierdzenie | Czas pomiaru | Uwaga |
|---|---|---|---|
| F1 | kolejność: kora ruchowa → rdzeń → nerw → mięsień | 0 s | anatomia i fizjologia podręcznikowa, `textbook_consensus` z cytatem |
| F2a/b/c | HR w spoczynku; tempo wzrostu HR w pierwszych sekundach; wycofanie napięcia nerwu błędnego jako pierwszy mechanizm | 0–10 s | szukać badań interwałów 30–60 s; plansza krwionośna ma HR, ale wartość 185/min może nie pasować do 88% VO₂max |
| F3a/b/c | udział mięśni w rzucie serca w pracy; spadek przepływu trzewnego i nerkowego; skóra najpierw zwęża naczynia | koniec pracy; 0–30 s dla skóry | model §4, punkt 4 już to wskazuje |
| F4 | wentylacja i częstość oddechów pod koniec 45 s | 45 s | plansza oddechowa ma wartości ogólne; potrzebny moment pomiaru |
| F5 | adrenalina szczytuje pod koniec pracy | koniec pracy | flaga `protocolMismatch`, jeśli źródło to Wingate |
| F6 | spadek HR w pierwszych 30–60 s przerwy (HRR) | 45–105 s | |
| F7 | wentylacja w przerwie zostaje podniesiona (EPOC) | 45–90 s | |
| F8 | mleczan szczytuje minuty po serii; cykl Cori | po serii | poziom dowodów słowem; wątroba z planszy pokarmowej |
| F9 | przepływ skórny i pocenie po pracy | przerwa | plansza powłokowa (w toku) |
| F10 | co po 90 s jest nadal podniesione względem startu | 90 s | może wynikać z F6 i F7; wtedy bez nowego faktu |

---

## 4. Język wizualny atlasu

### 4.1 Światło (2D: oprawa strony; 3D: później w scenie)

- **Studio zamiast kartki:** tło to radialny gradient (środek `#13203A`, krawędź `#070B14`), a pod stopami miękka elipsa „podestu” (skala i uziemienie postaci). Bez tekstury i szumu.
- **Faza = temperatura:** w pracy gradient ma 3–4% domieszki czerwieni (`--work #FF5A4F`), w przerwie turkusu (`--rest #5FD0C6`). Przejście trwa 1,5 s i zaczyna się dokładnie w 45 s. To jedyne światło „nastrojowe” i koduje zmienną (fazę).
- **Stan = jasność warstwy:** obowiązuje dotychczasowa reguła emisji z księgi stylu (sprint 0,15–0,35 tylko na pracujących strukturach). Bez bloomu i poświaty CSS na całości.
- **Spójność z filmem:** tło atlasu `#070B14` i grafit filmu `#090E17` są prawie równe; gradient je zbliża. Paleta układów zostaje z `palette.json`. Paleta aktów filmu służy tylko „zasłonie” przejścia (§4.7).

### 4.2 Materiały

Zostają matowe (księga §3: coat 0, specular ≤ 0,35). To świadomy kontrast: **atlas to „prawda anatomiczna”, a film to „podróż”**. Atlasu nie podciągamy do połysku filmu.

### 4.3 Kamera (2D i 3D)

Dozwolone są tylko 4 ruchy, każdy z celem:

| Ruch | Cel | Parametry |
|---|---|---|
| **Cięcie** między widokami kluczowymi (przód, tył, bok) | inna strona ciała | natychmiast albo przenikanie 0,4 s |
| **Pchnięcie** do kotwicy | geografia: „to zbliżenie jest *tutaj*” | skala 1,0 → 1,06–1,6, 0,9–1,1 s, ease-in-out, punkt stały = kotwica |
| **Wstawka zbliżenia** (gotowe ujęcie `detail`) z linią do kotwicy | skala narządu | wejście 0,8 s, wyjście 0,6 s |
| **Obrót po szynie** (tylko 3D, od E3) | bryła przestrzenna, np. serce za mostkiem | poziomo, ≤ 90° do najbliższego widoku kluczowego, 1,2 s, przyciąganie |

Zakazane: orbity ozdobne, dryf, drgania, dowolny zoom i ruch kamery w trakcie „przewidź”.

### 4.4 Typografia i oprawa ekranu

Układ jak w filmie, żeby tryby wyglądały na jedną aplikację:
- **lewy górny chip:** `ATLAS · <nazwa planszy lub przewodnika> · <skala>`, np. „1,8 m · ciało” albo „≈ 12 cm · serce”;
- **prawy górny chip (HUD):** `INTERWAŁ n/6 · PRACA|PRZERWA · 00:27` i najwyżej **jedna** liczba z faktu naraz, w parze „spoczynek → teraz” z momentem pomiaru;
- **napis u dołu:** najwyżej 2 linie, pogrubione słowo-klucz, pod nim drobna linia poziomu dowodów (plakietka + fraza z drabiny);
- **fonty bez zmian:** Figtree do zdań, JetBrains Mono do liczb i chipów;
- na planszach (poza przewodnikiem) panel liczb dostaje hierarchię: **jedna liczba „bohater”** na górze, duża, z krotnością „×N”. Reszta zwinięta w „więcej” (model §3.4: najwyżej 4 liczby).

### 4.5 Ruch

Dozwolonych jest tylko 5 animacji. Każda koduje zmienną:

| Animacja | Co koduje | Reguła |
|---|---|---|
| strzałka przepływu (`stroke-dashoffset`) | kierunek i wielkość przepływu | prędkość i grubość: reguła nad faktem (×N) albo 3 stopnie oznaczone jako ilustracja (model §3.1) |
| przenikanie warstwy (opacity 0,9 s) | zmiana stanu układu | tylko w chwili kroku z grafu przyczyn |
| puls kotwicy (pierścień 1,6 s) | „o tej strukturze mówi teraz zdanie” | jedna kotwica naraz (sygnalizacja, Mayer d≈0,46) |
| licznik liczby (0,6 s) | nowa wartość w nowym momencie | tylko przy zmianie momentu |
| oś interwału | czas | stała prędkość, stop przy „przewidź” |

Przy `prefers-reduced-motion` wszystko jest statyczne: strzałki ciągłe ze strzałką-grotem, oś skacze krokami.

### 4.6 Dźwięk

`AtlasSoundscape`: proceduralny WebAudio, bez plików i bez płatnych usług. Wartości skal i temp przepisane z `AdaptiveMusicEngine`, żeby motywy brzmiały jak film. Bez importu, bo silnik filmu żyje w jego magazynie stanu.

| Warstwa | Co koduje | Źródło tempa |
|---|---|---|
| serce (podwójne uderzenie niskiej sinusoidy) | tętno | F2/F6; między momentami interpolacja oznaczona jako ilustracja |
| oddech (filtrowany szum, wdech/wydech) | wentylacja | F4/F7 |
| pad w skali motywu filmu (`hiit_peak` w pracy, `recovery` w przerwie) | faza | oś |
| **cisza w 45 s** | koniec pracy | oś |

Zasady dźwięku:
- domyślnie wyłączony do kliknięcia „Start przewodnika” (polityka autoodtwarzania);
- suwak głośności i wyciszenie, zapamiętane;
- `prefers-reduced-motion` nie wyłącza dźwięku, ale przewodnik startuje wyciszony;
- **lektor:** w wersji 1 go nie ma, są tylko napisy. Nagrania filmu pochodzą z `edge-tts` (głosy Microsoftu), a licencja na ich rozpowszechnianie jest niejasna (model §3.4).
  Lektor wraca, gdy wyjaśni się licencja albo zostanie wybrany głos Piper ze sprawdzoną licencją. Każde nagranie odsłuchuje człowiek.

### 4.7 Przejścia atlas ↔ film

**Rym:** akt filmu trwa 90 s, interwał w przewodniku też 90 s. W obu trybach tę samą chwilę określa ta sama para (numer interwału, sekunda).

| Akt filmu | Układ lub moment w atlasie |
|---|---|
| I Przebudzenie | przewodnik krok 0–1; mięśniowy |
| II Mobilizacja nerwowa | nerwowy; hormonalny (nadnercza) |
| III Serce i płuca | krwionośny, oddechowy; przewodnik kroki 2–4 |
| IV Sarkomer | mięśniowy, zbliżenie (udo → włókna → miozyna) |
| V Mitochondrium | mięśniowy (link „zobacz w środku”) |
| VI Granice HIIT | przewodnik krok 5 (szczyt) |
| VII Bariera krew–mózg | krwionośny (szyja), mózg |
| VIII–X Mózg, synapsa, BDNF | mózg |
| XI Regeneracja | przewodnik kroki 6–8; powłokowy, wydalniczy, hormonalny |
| XII Tydzień, miesiąc, rok | karty: kostny, rozrodczy; „interwał 6/6 → co zostaje na tygodnie” |

**Atlas → film („Zobacz w środku”):**
1. Pchnięcie do kotwicy (×3, 0,7 s).
2. Zasłona w kolorze aktu z biblii filmu (np. `#DC2626` dla III) rośnie od kotwicy.
3. Zmiana adresu na `#film/<akt>/<sekunda>`.
4. Film startuje pod zasłoną i od razu przewija się do chwili (`jumpToAct` i `seekToTime` już istnieją).
5. Zasłona opada w 0,6 s.

Dopasowanie kształtu: udo w atlasie → ujęcie 5 aktu I (najazd na udo).

**Film → atlas:** chip aktu w filmie dostaje przycisk „Atlas tej chwili”. Film pauzuje i zapamiętuje czas, a atlas otwiera `#atlas/<uklad>/<moment>` z zasłoną odwrotną. Powrót wraca do tej samej sekundy.

**Mechanika:**
- `sessionStorage['biogenesis.bridge'] = {from, act, t, system, anchor, color}`; dzięki temu zasłona przeżywa przełączenie leniwych modułów w `main.tsx`;
- bez czarnej klatki (zasada filmu „zero czarnych ekranów”).

### 4.8 Plansza „Całość” jako scena

„Całość” to nie 12 kolorów naraz (badacz C, T5), tylko **odtwarzacz łańcuchów**: ten sam silnik co przewodnik, 4–6 łańcuchów z `chains.json`, najwyżej 3 kolory naraz.
Przewodnik „Jeden interwał” jest po prostu najdłuższym łańcuchem. Scena to stos warstw w jednej kamerze (§5.2): baza (szkielet i sylwetka) + warstwy układów.

---

## 5. Zasoby: co już jest, a co trzeba dorobić

### 5.1 Do użycia od razu

| Zasób | Gdzie | Do czego |
|---|---|---|
| rendery przodu całego ciała w **identycznej kamerze**: mięśniowy, nerwowy, krwionośny (oba stany) | `public/atlas/<u>/front_*.webp` (integrator) | scena przewodnika, przenikanie warstw |
| widoki `detail`: serce, pęcherzyk, udo → włókna → miozyna, przekrój mózgu | `public/atlas/<u>/detail_*.webp` | wstawki zbliżeń |
| `flows3d.json` (krwionośny), `flows.json` (nerwowy, oddechowy) | `public/atlas/<u>/` | strzałki |
| `anchors.json` z `camera` i `anchors3d` | `public/atlas/<u>/` | pierścienie, pchnięcia, rzut strzałek |
| `palette.json`, glify | `src/atlas/data/`, `glyphs.tsx` (integrator, E0) | kolory i ikony w chipach |
| fakty `checked_agent` w plates | `src/atlas/plates/*.ts` | HUD i napisy (po dopisaniu `tSec`) |
| motywy muzyczne (skale, tempa) | `src/audio/AdaptiveMusicEngine.ts` | `AtlasSoundscape` (przepisane wartości) |
| `jumpToAct`, `seekToTime`, czasy aktów | `SimulationCore`, `TimelineEngine` | mosty atlas ↔ film |
| makieta | `docs/atlas_rezyser/prototyp/` | wzór dla agenta sceny |

### 5.2 Do dorobienia

1. **„Warstwy Całości”** (jeden przebieg Blendera, po K2 wszystkich 12 układów):
   - każdy układ osobno, na przezroczystym tle, **bez szkieletu i sylwetki**, oba stany, w standardowej kamerze całego ciała (orto 1,80319);
   - jedna warstwa bazowa (szkielet i sylwetka), także osobno;
   - dla oddechowego i mózgu dodatkowo warstwa w tej kamerze (dziś ich nie ma, problem 9);
   - wynik: `public/atlas/calosc/<uklad>_{rest,sprint}.webp`, `base.webp`, plus wersje 500 px na telefon.
   - **Uwaga licencyjna:** plik warstw jest utworem zależnym Z-Anatomy (BY-SA) z dodatkiem HuBMAP (BY). Pliki BY-SA i BY nie są scalane w jeden (model §2, punkt 8). Warstwa krwionośna z HuBMAP zostaje osobnym plikiem z osobnym opisem.
2. **`chains.json`** w schemacie integratora: krok = { `tSec0`, `tSec1`, układy i poziom (0, ½, 1), `anchors`, `flows`, `factIds`, zdanie, opcjonalnie `predict` }.
   Walidator: każdy `factId` ma status `checked_agent`, a fraza zgadza się z drabiną dowodów.
3. **Fakty F1–F10** z polem `tSecFromBoutStart` (§3.4).
4. **Kod:** odtwarzacz przewodnika i łańcuchów, scena warstw, zegar, `AtlasSoundscape`, zasłona mostu, oprawa (gradient, chipy, oś).
5. **Dwa małe punkty w kodzie filmu:** obsługa `#film/<akt>/<s>` i przycisk „Atlas tej chwili” w chipie aktu.

---

## 6. Zadania dla agentów i kolejność

Zasada: **nic z tego planu nie dotyka plików, nad którymi trwają prace.** Integrator kończy K3 (E0) w `src/atlas/*`, a 7 agentów układów pisze tylko swoje pliki (`ATLAS_AGENT_BRIEFS_1B.md` §2).
Dlatego faza R0 działa wyłącznie poza `src/` i `public/`.

### Faza R0: teraz, równolegle, bez kolizji (tylko dokumenty i makiety)

| Zadanie | Agent | Pisze wyłącznie | Wynik | Warunek |
|---|---|---|---|---|
| R0-a Fakty przewodnika F1–F10 (szkic z cytatami) | agent treści (Opus) | `docs/atlas_rezyser/dane_robocze/fakty_przewodnik.md` | kandydaci faktów: źródło, cytat, lokalizator, `tSec`, populacja, protokół | sprawdzenie przez **osobnego** agenta wg §3.6 (zleca Dyrygent) |
| R0-b Scenariusz jako dane (szkic `chains.json`: przewodnik + 4 łańcuchy) | ten sam agent treści | `docs/atlas_rezyser/dane_robocze/chains_szkic.json` | kroki z `factIds` | schemat zatwierdza integrator w R1-a |
| R0-c Dźwięk: odsłuch | agent dźwięku (umiejętność `sound`, Sonnet wystarczy) | `docs/atlas_rezyser/dzwiek/` (strona odsłuchu WebAudio) | serce, oddech, pady w 3 tempach | **odsłuch użytkownika**: czy nie męczy |

### Faza R1: po scaleniu integratora (K3) do `atlas-uklady`, równolegle z 7 układami

| Zadanie | Agent | Pisze wyłącznie | Wynik | Warunek |
|---|---|---|---|---|
| R1-a Schemat `chains`/`guide` w `types.ts`, walidator, tokeny oprawy w `palette.json`/`index.css`, **jeden punkt montażu** w `AtlasApp.tsx` (trasa `#atlas/przewodnik`) | **integrator** (jego pliki) | `types.ts`, `AtlasApp.tsx` (kilka linii), `palette.json`, `index.css`, walidatory | kontrakt, w który wpina się agent sceny | build, test walidatora |
| R1-b Odtwarzacz przewodnika i łańcuchów, scena warstw, zegar, HUD, oś, „przewidź”, `AtlasSoundscape` | **nowy agent sceny** (Opus, wysoki poziom) | nowe katalogi `src/atlas/guide/**`, `src/atlas/sound/**`; port 5198 | przewodnik na obecnych renderach (przełączanie warstw jak w makiecie) | zrzuty 1440 i 390 w 8 chwilach, konsola czysta, `reduced-motion` |
| R1-c Fakty F1–F10 do `facts/*.json` (format E1) | agent danych z modelu §5 | pliki faktów wg E1 | fakty `checked_agent` | agent sprawdzający (osobna sesja) |

Kolizje w R1:
- agent sceny nie zmienia `AtlasPlate.tsx` ani plików układów;
- treści czyta z `plates/*.ts` i `chains.json`;
- jedyny wspólny punkt (`AtlasApp.tsx`) zmienia integrator.

### Faza R2: po K3 wszystkich 12 układów i zgromadzeniu (statut §6)

| Zadanie | Agent | Pisze wyłącznie | Warunek |
|---|---|---|---|
| R2-a „Warstwy Całości” (§5.2, punkt 1) | agent renderu (Opus) | `blender/atlas/plate_calosc.py`, `public/atlas/calosc/**` | slot Blendera (najwyżej 2 naraz, po renderach układów); zrzut nałożenia warstw na bazę: przesunięcie 0 px |
| R2-b Scena przechodzi na warstwy sumowane i dostaje łańcuchy „Całość” | agent sceny | `src/atlas/guide/**` | test z 2–3 osobami (model E2′) |
| R2-c Mosty z filmem (§4.7) | agent filmu (jeden, Opus) | `src/main.tsx`, `src/ui/TopBioBar.tsx` albo chip aktu, nowy `src/bridge/**` | **regresja 12 aktów:** zrzuty każdego aktu przed i po, konsola czysta |

### Faza R3: z etapem E3/E4 modelu

| Zadanie | Kto | Uwaga |
|---|---|---|
| R3-a Scena 3D dla przewodnika (koncepcja B): GLB krwionośnego + obrót po szynie, ten sam `chains.json` | integrator silnika (E3) + agent sceny | tylko po spełnieniu budżetu desktopu z §3.2; telefon zostaje przy 2D |

### Dyrygent

- zatwierdza ten plan razem z użytkownikiem;
- zleca R0 od razu;
- R1 rusza po scaleniu K3 integratora;
- audyty jak w statucie (K1/K2/K3 na zadanie) z dodatkową pozycją listy kontrolnej: **„test zmiennej”**. Każdy efekt w zrzucie musi mieć wskazaną zmienną (tabela §4.5), a efekt bez zmiennej to poprawka.

---

## 7. Ryzyka, koszt i czas

### Ryzyka

| # | Ryzyko | Skutek | Zabezpieczenie |
|---|---|---|---|
| 1 | Fakty F2–F9 nie dostaną `checked_agent` (mało badań 45/45 przy 88% VO₂max) | ujęcia bez liczb | zasada „kierunek bez liczby albo wypada”; flaga `protocolMismatch` |
| 2 | Kinowość rozrośnie się w ozdobność | spada skuteczność nauki | „test zmiennej” w audycie; lista 5 animacji i 4 ruchów kamery jest zamknięta |
| 3 | Przewodnik irytuje powracających | porzucenie | „Pomiń” zawsze widoczne, pamięć w `localStorage`, „Dalej” zamiast czekania |
| 4 | Dźwięk męczy albo straszy (bicie serca) | wyłączenie aplikacji | domyślnie cicho, odsłuch użytkownika w R0-c, łagodna barwa |
| 5 | Licencja lektora (głosy Microsoftu z `edge-tts`) | nie można publikować | wersja 1 bez lektora |
| 6 | Kolizja plików z integratorem | konflikty scalania | R1-a robi integrator; agent sceny tylko w nowych katalogach |
| 7 | Most zepsuje film | regresja 12 aktów | R2-c dopiero po atlasie, ze zrzutami przed i po |
| 8 | Telefon: 6–12 obrazów 1000×1800 naraz | pamięć, płynność | wersje 500 px, ładowanie warstw krok po kroku, najwyżej 3 warstwy naraz |
| 9 | Warstwy Całości: przezroczystość i nakładanie dają złe kolory (alfa sylwetki) | brudne krawędzie | render z premultiplied alpha; kontrola ΔE jak w K2 integratora |
| 10 | Brak testu z ludźmi | nie wiadomo, czy uczy | test „pomyśl na głos” z 2–3 osobami (darmowy, 5 min) przed R2 |

### Koszt

- **Pieniądze: 0 zł.** Tylko darmowe narzędzia: WebAudio, Blender, EEVEE, Python, Pillow, ImageMagick i headless Chrome. Żadnych płatnych generacji (`generate_3d`, TTS, wideo).
- **Moc obliczeniowa:**
  - warstwy Całości to ok. 13 przebiegów × 2 stany w EEVEE, szacunkowo 1–2 h slotu Blendera;
  - pobranie przewodnika: 2–3 MB na desktopie i ok. 1 MB na telefonie (wersje 500 px);
  - kod przewodnika: ok. 15–25 kB gzip (szacunek; zmierzyć w R1).

### Czas (sesje agentów, orientacyjnie)

| Faza | Sesje | Czas | Zależy od |
|---|---|---|---|
| R0 | 2 (treść, dźwięk) | 0,5–1 dnia | nic (start od razu) |
| R1 | 3 (integrator: kilka godzin; agent sceny: 1–2 dni; dane) | 1–2 dni | scalenie K3 integratora |
| R2 | 3 (render, scena, film) | 1–2 dni | K3 wszystkich 12 układów |
| R3 | wg E3 | — | prototyp 3D i budżety |

---

## 8. Uwagi z przeglądu dla Dyrygenta (poza zakresem planu)

1. **Port 5188** zajmuje podgląd planszy kostnej Dyrygenta (`vite preview` z worktree `atlas-kostny-0ebfd9`). Nie ruszałem go.
   Film na żywo obejrzałem na porcie 5198, a makietę podawałem na 5199. Oba serwery potem zatrzymałem.
   Wolne porty dla kolejnych prac: 5198 i 5199 (5189 to Dyrygent, 5190 integrator, 5191–5197 układy).
2. **chrome-devtools MCP był zajęty** przez inną sesję (profil zablokowany). Zrzuty zrobiłem headless Chrome przez własny skrypt CDP w katalogu tymczasowym.
3. Kotwica `portal` na krwionośnym (audyt `wizualna_K2_krwionosny.md`, punkt 3) jest **nieprzydatna dla przewodnika**, dopóki wskazuje ż. główną dolną. Krok 3 jej nie używa.
