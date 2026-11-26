# Posiedzenie UI/UX atlasu: widoczność i zrozumienie dla licealisty

Stan na 2026-11-26 (wersja 2, po zasadach Dyrygenta i dwóch wymianach z Wizualizatorem). Prowadzi Reżyser.
**To plan, bez kodu.** Kod powstanie dopiero po zgodzie użytkownika (decyzja: Dyrygent razem z użytkownikiem).

Podstawa:
- decyzje użytkownika z §7 `ATLAS_MODEL_ARCHITEKTONICZNY.md` (commit `6840b29`):
  - (a) atlas przede wszystkim dla licealistów, a HIIT to przykład do nauki;
  - (b) gabloty serca, wątroby, mózgu i nerki;
  - (c) wspólny sznyt i wyróżnik każdego układu;
- rozstrzygnięcia z góry Dyrygenta (`dyrygent/spory_UX_narzady.md` w folderze notatek).

**Co obejrzałem.** Gałąź `atlas-uklady` (`2c6db64`), wszystkie 12 układów. Własny serwer Vite na porcie 5198, zrzuty headless Chrome przez własny skrypt CDP (bez Playwright MCP).

| Ujęcie | Zakres |
|---|---|
| 2D, 1440 px | spoczynek i sprint |
| 2D, 390 px | sprint, cała strona |
| 3D „Gablota”, 1440 px | sprint: przód i bok |

Razem 61 zrzutów. Konsola: 0 błędów i 0 wyjątków. Najmniejsza czcionka na wszystkich planszach to 14 px.
Do tego przejrzałem kod (`src/atlas/AtlasApp.tsx`, `AtlasPlate.tsx`, `src/atlas3d/engine.ts`) i statusy faktów (`src/atlas/data/facts/*.json`).

**Materiały** (`docs/atlas_rezyser/ux/`):

| Plik | Co pokazuje |
|---|---|
| `przed/01_2d_12_ukladow_sprint_1440.jpg` | 12 plansz 2D, sprint |
| `przed/02_3d_12_ukladow_sprint_1440.jpg` | 12 gablot 3D, sprint, przód |
| `przed/03_telefon_390_pierwszy_ekran.jpg` | pierwszy ekran telefonu |
| `przed/04_panel_boczny_kolejnosc_tresci.jpg` | panel: krwionośny, pokarmowy, moczowy |
| `przed/05_krwionosny_2d_ze_strzalkami_vs_3d_bez.jpg` | 2D i 3D obok siebie |
| `przed/06_skala_skacze_bez_lokalizatora.jpg` | mózg, oddechowy, krwionośny, rozrodczy |
| `po/00_karta_stylu_12_ukladow.jpg` | karta stylu |
| `po/klatka_{krew,kosc,nerw,skora}.jpg` | 4 klatki koncepcyjne: ta sama rama, 4 różne wyróżniki |
| `klatki.html`, `karta_stylu.html` | źródła makiet |

Makiety otwiera serwer Vite aplikacji: `/docs/atlas_rezyser/ux/klatki.html#k=krew` (`kosc`, `nerw`, `skora`).
Liczby w makietach pochodzą wyłącznie z faktów `checked_agent` obecnych na planszach.
Barwy makiet pochodzą z `palette.json`. Biel kreski `#E9EEF7` to propozycja nowego tokenu (§3.3).

---

## 0. Najkrócej

„Kropka nad i” to nie kolejny efekt. To odpowiedź na pytanie ucznia: **„co mam z tego zrozumieć?”**. Dziś:
- panel zaczyna się od przypisu o protokole i definicji VO₂max;
- dalej jest ściana tekstu, a liczby i legenda strzałek leżą pod zgięciem ekranu;
- na planszach mózgu, nerwowej i mięśniowej podpisy w poziomie Podstawowym pokazują **same nazwy**, bez „do czego to służy”, bo opisy czekają na sprawdzenie.

Propozycja:
- **wspólna rama** dla 12 plansz, widoku 3D i gablot narządów: cel lekcji, pytanie planszy, jedna liczba-bohater, legenda „Jak czytać”, nazwany moment, lokalizator „gdzie to jest w ciele”;
- **jeden wyróżnik na układ**: znak, jeden ruch i jedna miara, przypisane do jednej idei z biologii w liceum. Przykłady: kostny = konstrukcja, krwionośny = rozdział krwi, nerwowy = impuls, powłokowy = ciepło;
- **wspólna gramatyka obrazu**: *cieniowane = prawdziwy kształt z modelu, kreska = schemat albo ilustracja*.

Wszystko mieści się w ≥ 50 FPS na Intel UHD, co potwierdził Wizualizator (§4), i nie wymaga nowych zasobów spoza CC BY / BY-SA / CC0 (§5).
Około połowy pracy to **szybkie poprawki ≤ 2 h**, które nie czekają na gabloty ani na siebie nawzajem (§6).

---

## 1. Zgodność z biologią w liceum

### 1.1 Zasady

- **Dwa poziomy atlasu odpowiadają dwóm zakresom szkolnym:**
  - „Podstawowy”, na ekranie **„Uczeń”**, odpowiada zakresowi podstawowemu;
  - „Rozszerzony” odpowiada zakresowi rozszerzonemu, z dodatkami dla studentów.
- **Odniesienie do podstawy programowej** podaje się dokładnym punktem wymagań z rozporządzenia ministra edukacji w sprawie podstawy programowej kształcenia ogólnego dla liceum (2018, z późniejszymi zmianami).
  **Numerów punktów nie podaję z pamięci.** Wpisuje je agent treści z dosłownym cytatem wymagania, a sprawdza osobny agent, tak jak fakty (§3.6 modelu).
  Podstawa jest ogólna (np. „przedstawia budowę…”), więc szczegóły struktur nadal potrzebują faktów podręcznikowych (rozstrzygnięcie Dyrygenta, pkt 8).
- **Nowe pole w danych planszy:** `curriculumRef`, z identyfikatorem punktu, dosłownym cytatem wymagania i zakresem (P/R). Plansza bez tego pola nie dostaje celu lekcji.
- **HIIT to przykład, nie temat.** Cel lekcji zawsze mówi o budowie lub funkcji układu, a sprint pokazuje ją w działaniu.
  Przykład: „Jak krew trafia tam, gdzie jest potrzebna” zamiast „Co robi krew w HIIT”.
- **Uproszczenie nie zmienia faktu.** Metafory („chłodnica”, „magazyn”, „filtr”) są w danych oznaczone jako metafora (`metaphor: true`) i mają dopisek w Rozszerzonym.

### 1.2 Co należy do którego poziomu (propozycja; zakresy do potwierdzenia cytatem z podstawy)

| Układ | Uczeń (Podstawowy): budowa i funkcja + 1 zmiana w wysiłku | Rozszerzony: dodatki |
|---|---|---|
| Mózg | główne części (kora, móżdżek, pień) i ich ogólne funkcje; kora ruchowa steruje ruchem | płaty i obszary kory, drogi, zużycie paliw przez mózg |
| Nerwowy | ośrodkowy i obwodowy; nerw przewodzi rozkaz do mięśnia; współczulny przyspiesza pracę narządów | sploty, rdzeń nadnerczy, rekrutacja jednostek ruchowych |
| Hormonalny | gruczoł → hormon → krew → narząd docelowy; adrenalina w wysiłku | oś podwzgórze–przysadka, ADH, insulina i glukagon, czasy narastania |
| Mięśniowy | mięśnie szkieletowe, praca w parach (antagonizm), skurcz | typy włókien I / IIa / IIx, zasada rozmiaru |
| Kostny | szkielet jako podpora i dźwignia, stawy | obciążenia (× masa ciała), przebudowa kości |
| Oddechowy | drogi oddechowe, płuca, wymiana gazowa w pęcherzykach, przepona | mięśnie wdechowe dodatkowe, objętości, wentylacja |
| Krwionośny | serce, tętnice, żyły; krążenie duże i małe; rozdział krwi w wysiłku | rzut serca, objętość wyrzutowa, krążenie wieńcowe |
| Pokarmowy | narządy przewodu, wątroba jako magazyn glukozy (glikogen) | cykl Cori, przepływ trzewny |
| Powłokowy | skóra a termoregulacja, pot | przepływ skórny w czasie, ograniczenia wysiłku w upale |
| Moczowy | nerki filtrują krew i tworzą mocz; bilans wody | nefron, ADH, aldosteron, równowaga kwasowo-zasadowa |
| Limfatyczny | węzły chłonne, limfa, odporność | mobilizacja komórek NK, spór o „okno” po wysiłku (`contested_debate`) |
| Rozrodczy | budowa narządów (karta, bez stanu sprintu) | hormony płciowe a trening w czasie tygodni |

To propozycja przydziału. Agent treści sprawdza ją z tekstem podstawy i podręcznikiem.
Jeśli coś z kolumny „Uczeń” leży w podstawie tylko w zakresie rozszerzonym, przenosi to w prawo.

---

## 2. Zrozumiałość: problemy i poprawki

### 2.1 Co jest dobre (zostaje)

- prawdziwa anatomia (Z-Anatomy, HuBMAP), sprawdzone kotwice, fakty z cytatem;
- kolor i ikona układu w menu, w przycisku sprintu i w podpisach (zalążek sznytu);
- telefon: numerowane pinezki, lista pod obrazem, przełącznik stanu przyklejony u dołu (`przed/03`);
- 3D „Gablota”: obrót w poziomie, 4 widoki, gotowe zbliżenia, podpisy na ciemnym tle, ≥ 50 FPS na UHD; spójne z 2D;
- czcionka ≥ 14 px wszędzie (pomiar skryptem).

### 2.2 Szybkie poprawki (≤ 2 h agenta każda, nie czekają na gabloty)

| # | Problem | Plik / zrzut | Poprawka | Kto | h |
|---|---|---|---|---|---|
| S1 | Panel zaczyna się od przypisu o protokole i definicji VO₂max (ten sam tekst na każdej planszy) | `przed/04`; `AtlasApp.tsx` (sekcja `protocolNote` i `glossary`) | przenieść do rozwijanego „ⓘ Co znaczy »sprint«” pod przełącznikiem momentu | integrator | 1 |
| S2 | **Teksty robocze na ekranie ucznia:** „„Sprint” ma na tej planszy własne znaczenie; jego opis czeka na sprawdzenie.” (hormonalny, pokarmowy, powłokowy) i „N liczb czeka na sprawdzenie źródła…” | `przed/01`, `przed/04`; `AtlasApp.tsx:282`, `AtlasApp.tsx:558–561`, `AtlasPlate.tsx:38/377` | w poziomie Uczeń nic nie pokazywać zamiast faktu niesprawdzonego; komunikaty o statusie tylko w Rozszerzonym, w „Więcej” | integrator | 1 |
| S3 | Telefon: pierwszy ekran nie mówi, co to za układ; pasek 12 układów ucięty („Mię…”) bez wskazówki | `przed/03` | tytuł planszy (1 linia) nad obrazem; na pasku cień i strzałka „›” na krawędzi albo przycisk „12 układów ▾” | integrator | 2 |
| S4 | Dwa identyczne przełączniki jeden pod drugim (moment i poziom) | `przed/04` | poziom jako mały przełącznik „Uczeń / Rozszerzony” w nagłówku; moment zostaje duży, w kolorze układu | integrator | 1 |
| S5 | „Sprint” znaczy na planszach różne rzeczy (koniec 45 s pracy, koniec treningu, krok biegu, „po”) | `przed/04`; dane planszy | pole `momentLabelPl` i etykieta wprost na przycisku („Koniec 45 s pracy”, „Po treningu”, „Krok biegu”) | integrator 1 h + treść 1 h | 2 |
| S6 | Nazwy w menu i tytule się różnią („Moczowy” / „Układ moczowy (wydalniczy)”, „Powłokowy” / „Skóra (układ powłokowy)”) | `przed/01`; `palette.json` `namePl`, `plates/*.ts` `titlePl` | jedna nazwa szkolna w obu miejscach, zgodna z podstawą (cytat w `curriculumRef`) | integrator + treść | 1 |
| S7 | Legendy strzałek nie widać przy obrazie (jest pod opisem) | `przed/01`; `AtlasApp.tsx` sekcja „Legenda strzałek” | „Jak czytać” w lewym dolnym rogu sceny (ta sama treść, inne miejsce) | integrator | 2 |
| S8 | Skróty w Podstawowym: „t.”, „ż.”, „m.” w nazwach podpisów | `przed/01`; `plates/*.ts` `namePl` (nazwy to nie fakty, bez bramki) | pełne słowa w poziomie Uczeń, skrót tylko w Rozszerzonym | treść | 2 |
| S9 | 3D: pulsowanie emisji `sin(uTime*3.9)` nie koduje żadnej zmiennej | `przed/02`; `src/atlas3d/engine.ts` (łatka `color_fragment`) | puls tylko na strukturze z bieżącego zdania, w zbliżeniu; przy `reduced-motion` brak | Wizualizator | 0,5 |
| S10 | 3D: przełączniki momentu i poziomu są i w pasku 3D, i w panelu (dwa źródła sterowania) | `przed/02` | jedno sterowanie: pasek 3D znika, panel steruje obydwoma widokami | Wizualizator + integrator | 2 |
| S11 | Tło płaskie, ciało „na kartce” | `przed/01` | gradient studia `#13203A → #070B14` i miękki podest (już w 3D, brakuje w 2D) | integrator | 1 |
| S12 | Skala nieznana; tytuł widoku pod obrazem jest mało widoczny | `przed/06` | chip skali w lewym górnym rogu sceny, liczony z `camera.orthoScale` w `anchors.json` | integrator | 2 |
| S13 | Kontrast tekstu na jasnych przyciskach sprintu (pokarmowy, powłokowy) niezmierzony | `przed/01`; `palette.json` `onColor` | pomiar 4,5:1 skryptem, ewentualna zmiana `onColor` | integrator | 0,5 |

**Razem S1–S13: ok. 18 h.** Wszystkie poza S9 i S10 to pliki integratora, a S9 i S10 to pliki Wizualizatora.

### 2.3 Przebudowy (> 2 h)

| # | Problem | Plik / zrzut | Poprawka | Kto | h | Czeka na gabloty? |
|---|---|---|---|---|---|---|
| P1 | **Brak celu lekcji i hierarchii**: nigdzie nie pada pytanie; opis ma 8–15 linii; wszystkie liczby mają tę samą wagę | `przed/01`, `przed/04` | panel w stałej kolejności: pytanie planszy → **liczba-bohater** → miara wyróżnika → opis ≤ 3 zdania → Sprawdź się → „Więcej”; nowe pola `lessonGoalPl`, `questionPl`, `heroMetricId`, `curriculumRef` | integrator 6 + treść 8 + sprawdzenie 4 | **18** | nie |
| P2 | **Podpisy bez funkcji w poziomie Uczeń.** Opisy ról bez statusu `checked_agent` są w Podstawowym ukryte, więc zostaje sama nazwa: mózg 21 opisów, mięśniowy 19, nerwowy 14, oddechowy 8, powłokowy 4 (liczone w `facts/*.json`, oba stany) | `przed/01` (mózg: „Kora ruchowa”, „Móżdżek” bez opisu) | doprowadzić opisy ról do `checked_agent`, zaczynając od podpisów `primary`, albo zastąpić je opisem z podręcznika z cytatem | agent faktów (osobna sesja) | **10–12** | nie |
| P3 | **Skala skacze bez lokalizatora**: 5 plansz to zbliżenia narządów, 7 to całe ciało | `przed/06` | lokalizator: mini-sylwetka (wypieczony obrazek 2D, Z-Anatomy BY-SA osobnym plikiem) z prostokątem kadru z `camera`; ten sam element w gablotach narządów | integrator 3 + render 1 | **4** | nie (gabloty go dziedziczą) |
| P4 | **Strzałek w 3D nie widać**: rury z `flows3d` istnieją (`makeFlow`, `engine.ts:248`), ale mają ok. 9 mm średnicy, czyli ok. 2 px w ujęciu całego ciała, nie ruszają się, a grot ginie | `przed/05` | przesuwany wzór w shaderze (kierunek), grubość wg wyróżnika ROZDZIAŁ, w Rozszerzonym 3 stopnie | Wizualizator | **3** | nie |
| P5 | **Brak „Co się zmieniło”**: spoczynek i sprint różnią się nasyceniem całego obrazu | `przed/01` | 2D: obraz sprintu przygaszony do 35%, pełny kolor w obrysach kotwic z największą zmianą (reguła nad faktami); 3D: tekstura stanu (tanie) | integrator 5 + Wizualizator 2 | **7** | nie |
| P6 | **Brak sprawdzenia wiedzy** przy priorytecie „nauka” | — | „Sprawdź się”: 1 pytanie ↑/↓ albo „wskaż…” na planszę, z odpowiedzią z faktu planszy; bez zapisu wyników (pytanie 2 do użytkownika) | integrator 4 + treść 3 | **7** | nie |
| P7 | **Brak wyróżnika układu** (prośba użytkownika) | `po/klatka_*.jpg` | §3: nakładki 2D (pilot 4 układy, potem 8) i 3D | agenci układów + Wizualizator | **50–60** | nie |
| P8 | Pierwsze otwarcie 3D bywa wolne (limfatyczny > 7 s w przebiegu headless, przy dłuższym oczekiwaniu działa) | `ux2/` (scratchpad) | zmierzyć w zwykłym Chrome; jeśli > 3 s, pasek postępu z rozmiarem pliku | Wizualizator | **2** | nie |

---

## 3. Karta stylu 12 układów

### 3.1 Wspólna rama (2D, 3D, gabloty narządów)

1. **Nagłówek:** „Atlas › grupa › układ (› narząd)”, cel lekcji jednym zdaniem, mały przełącznik „Uczeń | Rozszerzony”.
2. **Scena-studio:** gradient, podest, chip skali; w zbliżeniach **lokalizator**.
3. **Przełącznik momentu pod sceną:** `Spoczynek | <nazwany moment> | Co się zmieniło`, w kolorze układu, w tym samym miejscu w 2D, 3D i gablotach.
4. **„Jak czytać”** w lewym dolnym rogu sceny: 2–3 symbole wyróżnika z opisem.
5. **Panel w stałej kolejności:** pytanie → liczba-bohater → miara wyróżnika → opis ≤ 3 zdania → Sprawdź się → „▸ Więcej liczb i źródła · ▸ Co znaczy sprint · ▸ Zobacz w filmie”.
6. **Podpis:**
   - nazwa: Figtree 600, 16 px;
   - opis: 14 px;
   - łacina: 14 px kursywą, tylko w Rozszerzonym;
   - liczby: JetBrains Mono;
   - tło `#0D1526` z kryciem ok. 85%, kontrast ≥ 4,5:1; linia odnośnika 1 px w `light` układu; kropka na strukturze.
7. **Podświetlenie:** wybrana struktura w pełnym kolorze z obrysem 2 px w `light`, reszta przygaszona do **35%** (ta sama liczba co `restMix` w `palette.json`). Bez emisji i bez pulsu dla ozdoby.
8. **Ruch i tempo:**

   | Element | Parametr |
   |---|---|
   | zmiana stanu | 0,9 s, ease-in-out |
   | kamera po szynie | 1,2 s |
   | krok filmu lub przewodnika | co najmniej max(4 s; 0,3 s na słowo podpisu + 1,5 s), pauza ręczna |
   | nowe ruchy | najwyżej 1 nowy ruch na krok i 3 ruchy naraz |
   | okres pętli przepływu | 2,6 / 1,6 / 1,0 s dla stopni 1 / 2 / 3 |
   | `prefers-reduced-motion` | stopklatki |

9. **Telefon:** tytuł i pytanie nad obrazem, przełącznik momentu u dołu, pod obrazem kolejno liczba-bohater, pinezki i Sprawdź się.

### 3.2 Wspólna gramatyka obrazu (ustalona z Wizualizatorem)

- **Cieniowane** (matowe, światło studia) to **prawdziwy kształt z modelu** (Z-Anatomy, HuBMAP, BodyParts3D).
- **Kreska** (linie 2 px w `light` układu, bez cieniowania, chip „SCHEMAT · bez skali” albo „ILUSTRACJA”) to **schemat albo ilustracja**. Należą do niej:
  - nefron, zrazik wątroby, neuron (gabloty);
  - linie konstrukcji kostnej;
  - izolinie ciepła;
  - miernik oddechu;
  - tory impulsu.
- Uczeń od razu widzi, co jest modelem, a co rysunkiem. AI nie tworzy kształtów anatomicznych, a schematy to jawnie rysunki.

### 3.3 Wyróżnik: znak + jeden ruch + jedna miara

Barwy wyłącznie z tokenów `palette.json`: `color`, `light`, `onColor`, kolory kontekstu, `artery` i `vein`.
Biel kreski (`#E9EEF7`) i ewentualne nowe barwy dodaje tylko integrator jako token, z walidatorem ΔE (`check:atlas`, ΔE ≥ 15 dla par pokazywanych razem).

| Układ | Wyróżnik | Znak | Ruch | Miara (panel) | Tokeny | Idea z liceum |
|---|---|---|---|---|---|---|
| Mózg | **OBSZAR** | strefy z obrysem, jedna w pełnym kolorze | zapalenie strefy przy podpisie | która część za co odpowiada | `brain` | części mózgu i funkcje |
| Nerwowy | **IMPULS** | świecący punkt na torze, etapy 1–4 (kreska) | punkt biegnie mózg → rdzeń → nerw → mięsień | kolejność, nie prędkość | `nerve` | droga ruchowa, współczulny |
| Hormonalny | **NADAWCA → ODBIORCA** | gruczoł, krople w naczyniu, narząd docelowy | krople płyną krwią do celu | opóźnienie: sekundy vs minuty | `endo`, `artery` | gruczoł, hormon, cel |
| Mięśniowy | **PRACA** | pasek rekrutacji I → IIa → IIx; strzałka ciągnięcia | wypełnienie paska przy zmianie momentu | ile włókien pracuje | `muscle` | antagonizm, włókna |
| Kostny | **KONSTRUKCJA** | rysunek techniczny: strzałka nacisku, osie stawów, wymiar (kreska, biel) | jedno „uderzenie” strzałki przy kroku | × masa ciała | `bone`, biel kreski | dźwignia, staw, przebudowa |
| Oddechowy | **OBJĘTOŚĆ** | miernik obok płuc; fala powietrza w tchawicy | fala wdechu i wydechu w tempie z faktu | litry na oddech, oddechy na minutę | `resp` | wentylacja, wymiana gazowa |
| Krwionośny | **ROZDZIAŁ** | grube i cienkie strzałki; pasek „gdzie idzie krew” | strzałki płyną; grubość = udział krwi | % krwi do mięśni | `artery`, `vein` | krążenie, rozdział krwi |
| Pokarmowy | **MAGAZYN** | wątroba jako zbiornik z poziomem; jelita przygaszone | strzałka glukozy z wątroby do krwi | poziom zapasu (3 stopnie, ilustracja) | `digest`, `artery` | glikogen, wątroba |
| Powłokowy | **CIEPŁO** | izolinie i strzałki ciepła; krople potu (kreska) | strzałki ciepła wychodzą ze skóry | kierunek przepływu skórnego ↓/↑ | `skin` (`light`) | termoregulacja |
| Moczowy | **FILTR** | nerka jako filtr: krew wchodzi, mocz wychodzi | przepływ przez filtr zwalnia w sprincie | przepływ nerkowy ↓ | `urinary`, `artery` | nefron, filtracja |
| Limfatyczny | **PATROL** | węzły jako punkty kontrolne; kropki-komórki | kropki przechodzą z węzłów do krwi | ×N komórek NK we krwi | `lymph` | odporność, limfa |
| Rozrodczy | **DŁUGI CZAS** | oś tygodni zamiast sprintu; „brak widocznej zmiany” | brak (karta) | tygodnie, nie sekundy | `repro` | budowa, hormony w czasie |

Strażnicy czytelności:
- **jeden wyróżnik na planszę**;
- **ruch tylko z powodu** (zmiana momentu, żądanie albo pętla przepływu);
- **kolor nigdy nie jest jedynym nośnikiem**: grubość, kształt kropli, numer etapu, izolinia przerywana;
- **nakładka nie zasłania kotwic podpisów** (sprawdza to kontrola wizualna kotwic);
- **liczby i wielkości tylko z faktów `checked_agent`**, a gdy faktu brak, 3 stopnie jakościowe z dopiskiem „ilustracja”;
- brakujące kotwice (osie stawów, objętość) dopisuje agent układu w swoich plikach.

### 3.4 Rdzeń dla gablot narządów (wysłany Wizualizatorowi 2026-11-26)

| Gablota | Znak układu | Barwy części narządu | Uwaga do klatek koncepcyjnych Wizualizatora (`bd9650c`) |
|---|---|---|---|
| Serce | ROZDZIAŁ / przepływ | `artery`, `vein` (oba już w palecie); mięsień jako odcień `artery` | zgodne |
| Nerka | FILTR | miąższ w odcieniach `urinary` (`#276777`, ciemny morski), naczynia `artery` i `vein` | klatka jest w czerwieniach i kremie: do zmiany |
| Wątroba | MAGAZYN | odcienie `digest`; segmenty z **numerem 1–8**; żyła wrotna `vein` | klatka w żółciach, wrotna fioletowa (fiolet = mózg), drogi żółciowe zielone (zieleń = limfatyczny): do zmiany |
| Mózg | OBSZAR + IMPULS | płaty w odcieniach `brain` (fiolet), drogi w `nerve` | zgodne |

Przekrój:
- powierzchnia cięcia w `light` układu, obrys 1,5 px;
- bez rozsuwania „eksplodującego”;
- serce: otwarcie przedniej ściany komór.

Wejście do gabloty: z planszy („Gablota: serce ›” przy podpisie i klik w narząd w 3D) oraz z piątej grupy menu „Narządy”.

---

## 4. Wydajność (≥ 50 FPS na Intel UHD przy 1440×900)

Stan wyjściowy (pomiar E3-K3):
- wszystkie 12 układów ≥ 50 FPS;
- **moczowy na granicy (50)**, oddechowy 56, krwionośny 60.

Wizualizator potwierdził (wymiana 1), że każdy element karty mieści się w budżecie:

| Element | Technika (decyzja Wizualizatora) | Koszt |
|---|---|---|
| strzałki przepływu z kierunkiem | istniejące rury `makeFlow` + przesuwany wzór UV w shaderze | 1 wywołanie na układ, < 0,5 ms |
| impuls, krople hormonu, kropki NK | `InstancedMesh`, pozycja z toru w shaderze | 1 wywołanie (nawet przy 4 tys.) |
| konstrukcja kostna | grube linie w 3D (1 wywołanie na rodzaj) + teksty wymiarów jako nakładka HTML (rzut punktu) | kilka wywołań |
| izolinie ciepła | pasma w shaderze albo 3 linie | pomijalny |
| miernik oddechu | HTML obok modelu; ruch płuc tylko po fakcie `checked_agent` i z podpisem „ruch poglądowy” | 0 |
| lokalizator | wypieczony obraz 2D | 0 GPU |
| usunięcie `sin(uTime)` | — | mniej pracy |
| gabloty narządów | ≤ 400 tys. trójkątów, ≤ 40 wywołań, przekrój przez stencil (2 przebiegi) | budżet Wizualizatora |

Reguły do kontraktu 3D:
1. **Każdy wyróżnik w 3D najwyżej 1 ms GPU na UHD przy 1440×900.** Pomiar jak w E3-K3, dla 12 układów, w obu stanach, z włączonym wyróżnikiem.
2. **Spadek poniżej 50 FPS** oznacza, że wyróżnik przechodzi na nakładkę 2D rzutowaną z `anchors3d`. Animację, która nie mieści się w budżecie, wypieka się do filmu (rozstrzygnięcie Dyrygenta, pkt 2).
3. **Bez półprzezroczystych nakładek pełnoekranowych, bez postprocesu i bez bloomu.**

---

## 5. Licencje

- **Bez nowych zasobów zewnętrznych.** Wszystko w tym planie powstaje z danych, które już są w repo:
  - rendery Z-Anatomy (CC BY-SA 4.0) i HuBMAP (CC BY 4.0);
  - `anchors3d`, `flows3d`;
  - fakty;
  - własny kod i własne rysunki: kreska, ikony, nakładki SVG.
- **Utwory zależne:** lokalizator z sylwetki Z-Anatomy to BY-SA; narząd HuBMAP na lokalizatorze to osobny plik BY. Pliki BY-SA i BY nie są scalane (model §2, pkt 8).
- **NC wykluczone:** nerka i ucho wewnętrzne Z-Anatomy zostają zablokowane (`NC_BLOCKLIST`); nerka w gablocie tylko z HuBMAP (rozstrzygnięcie Dyrygenta, pkt 6).
- **Czcionki:** Figtree i JetBrains Mono na licencji SIL OFL 1.1 (bez zmian; licencja zgodna z użyciem w aplikacji).
- **Schematy mikroskopowe** (nefron, zrazik) to własna geometria kreskowa. Bez Sketchfab, chyba że autor i licencja dają się zweryfikować.
- **Dźwięk** (jeśli w przewodniku) to własna synteza WebAudio. Bez lektora z głosów o niejasnej licencji.

---

## 6. Czas i kolejność

| Etap | Pozycje | Kto | Godziny | Czeka na gabloty? | Czeka na |
|---|---|---|---|---|---|
| **U0** szybkie poprawki | S1–S13 | integrator (S9–S10: Wizualizator) | **18** | nie | nic; może ruszyć od razu |
| **U0-fakty** | P2: opisy ról do `checked_agent` (najpierw `primary`: mózg, mięśniowy, nerwowy) | agent faktów | **10–12** | nie | równolegle z U0 |
| **U1** rama | P1 (pytanie, cel, bohater, `curriculumRef`), P3 lokalizator, P5 „Co się zmieniło”, P6 Sprawdź się | integrator + treść + sprawdzenie | **36** | nie (gabloty ją dziedziczą) | U0 |
| **U2a** pilot wyróżników 2D | krwionośny, kostny, nerwowy, powłokowy (skrajnie różne) | 1–2 agentów układów (`src/atlas/signatures/<uklad>.tsx`, nowe) | **12** | nie | interfejs `signature` z U1 |
| audyt | „test zmiennej” + test zrozumienia na zrzutach | Dyrygent | — | — | U2a |
| **U2b** pozostałe 8 | jak U2a | 2–3 agentów wg grup ról | **20** | nie | audyt |
| **U3** 3D | P4 (strzałki z kierunkiem), wyróżniki 3D, P5 w 3D, P8, wspólne sterowanie | Wizualizator | **18–22** + pomiary **4** | nie (równolegle do gablot, ten sam kod ramy) | U2a (znaczenie ustala 2D) |
| **U4** test | 2–3 licealistów, „pomyśl na głos”, 5 min na osobę; poprawki | użytkownik + agent UX | **4–6** | nie | U1 i U2a wystarczą do pierwszego testu |

**Razem: ok. 125–140 godzin pracy agentów**, z czego U0 i U0-fakty (ok. 30 h) dają największy zysk dla ucznia przy najmniejszym ryzyku.
Wersja 1 tego planu podawała 80–110 h. Wzrost wynika z doliczenia P2 (opisy ról), P5, P6 i sprawdzenia nowych zdań.
Przy 3–4 sesjach równolegle to ok. 4–5 dni. Koszt pieniężny: 0 zł.

**Kolejność:** U0 ‖ U0-fakty → U1 → U2a → audyt → U2b ‖ U3 → U4.
**Nic z tego nie czeka na gabloty.** To gabloty korzystają z U1 (rama, lokalizator, podświetlenie, tempo), a rdzeń ramy Wizualizator dostał już teraz (§3.4).

Granice plików (model §5):
- integrator: wspólne pliki `src/atlas/**`, `palette.json`, `types.ts`;
- agenci układów: swoje pliki + nowe `src/atlas/signatures/<uklad>.tsx`;
- Wizualizator: `src/atlas3d/**`;
- agent treści i agent faktów: `facts/*.json` (nowe pola i statusy);
- Reżyser: tylko `docs/atlas_rezyser/**`.

---

## 7. Pytania do użytkownika

1. **Łacina dla ucznia:** w poziomie „Uczeń” ukrywamy nazwy łacińskie całkiem (zostają w „Rozszerzonym”)? *Proponuję: tak.*
2. **„Sprawdź się”:** tylko pytanie i od razu odpowiedź, czy zapamiętywać wyniki ucznia (postęp)? *Proponuję: bez zapamiętywania na start.*
3. **Telefon czy komputer w szkole:** na czym uczniowie będą najczęściej oglądać atlas? Od tego zależy, czy poprawki telefonu idą na sam początek.
4. **HIIT w tle:** czy plansza ma mieć też tryb „sama budowa” (bez sprintu) do zwykłej lekcji, czy sprint zostaje zawsze jako przykład?
5. **Test z uczniami:** czy masz 2–3 licealistów, którzy obejrzą atlas po 5 minut i powiedzą na głos, co rozumieją?

---

## 8. Spór z Wizualizatorem (protokół)

**Wymiana 1** (Reżyser → Wizualizator): 7 pytań o wykonalność (a)–(g). Odpowiedź Wizualizatora:
- wszystko mieści się w ≥ 50 FPS;
- korekta: strzałki w 3D już są (`makeFlow`);
- warunek: ruch płuc tylko po fakcie `checked_agent` i z podpisem „ruch poglądowy”;
- lokalizator jako wypieczony obraz 2D.

**Spór 1** (Wizualizator): wyróżnik = „jeden ruch” kontra film gabloty, który pokazuje kilka ruchów naraz (skurcz, zastawki, przepływ).
**Rozstrzygnięty zgodnie w wymianie 2:**
- wyróżnik układu jest *znakiem* gabloty;
- w filmie każdy krok wprowadza najwyżej 1 nowy ruch, a najwyżej 3 ruchy trwają naraz.

**Wymiana 2** (Reżyser → Wizualizator): rdzeń karty stylu (§3.1, §3.4) oraz zgoda w jego punktach 2, 3 i 6, z poprawkami barw:
- nerka w barwie układu moczowego (`urinary`);
- wątroba w barwie pokarmowego, z numerami segmentów;
- żyła wrotna niebieska, nie fioletowa;
- drogi żółciowe nie na zielono;
- mózg w tokenie `brain`.

Odpowiedź Wizualizatora na wymianę 2 jeszcze nie przyszła.
**Do Dyrygenta nie idzie żaden spór:** po dwóch wymianach nie ma niezgody. Jeśli Wizualizator odrzuci poprawki barw, wyślę spór w jednym akapicie.

---

## 9. Ryzyka

| Ryzyko | Zabezpieczenie |
|---|---|
| wyróżnik staje się ozdobą | „test zmiennej” w audycie: każdy element nakładki wskazuje zmienną albo fakt |
| nowe zdania (cel, pytanie, opis ≤ 3 zdania, Sprawdź się) to nowa treść | ta sama bramka faktów (§3.6); skrót sprawdzonego zdania też trzeba sprawdzić |
| P2 nie da się w całości sprawdzić (brak dostępu do źródeł) | podpis zostaje bez opisu w poziomie Uczeń; priorytet mają podpisy `primary` |
| moczowy w 3D na granicy 50 FPS | reguła awaryjna „nakładka 2D” w kontrakcie |
| kolizje plików | U0 i U1 tylko integrator; wyróżniki w nowych plikach `signatures/<uklad>.tsx` |
| przydział P/R niezgodny z podstawą | `curriculumRef` z dosłownym cytatem wymagania, sprawdzany przez osobnego agenta |
| barwy wyróżników łamią paletę | tylko tokeny `palette.json`; nowe barwy przez integratora i walidator ΔE |
