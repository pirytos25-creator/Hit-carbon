# Posiedzenie UI/UX atlasu: widoczność, zrozumienie i animacje na poziomie filmu

Stan na 2026-11-26. **Wersja 3 („PLAN 2”)**, po wymaganiach użytkownika (d)–(g) i decyzji Dyrygenta v2 (`docs/atlas_audyt/DECYZJA_UX_NARZADY.md`). Prowadzi Reżyser.
**To plan, bez kodu w `src/`.** Wdrożenie dopiero po zgodzie użytkownika.

Podstawa:
- §7 `ATLAS_MODEL_ARCHITEKTONICZNY.md`, decyzje użytkownika (a)–(g):
  - (a) licealiści przede wszystkim, HIIT jako przykład;
  - (b) gabloty serca, wątroby, mózgu i nerki;
  - (c) wspólny sznyt i wyróżnik;
  - (d) **animacje 3D na poziomie filmu, a nie „kreseczki”**;
  - (e) **wspólny moduł z filmem „12 aktów”**;
  - (f) **kamienie milowe zamiast godzin**;
  - (g) wejście diegetyczne do gablot;
- decyzja Dyrygenta v2: spory 1 i 2 rozstrzygnięte, numeracja kamieni M1–M8, mapa „element → akt”.

Co się zmieniło od wersji 2 (`31d7eb7`):
1. **Klatki docelowe** (M1, §A): cztery klatki z prawdziwych modeli, wyrenderowane w Blenderze.
2. Wyróżniki 12 układów to teraz **animacje 3D** z wersją uproszczoną i aktem filmu (§3.3). Strzałki i linie zostają tylko w legendzie „Jak czytać”.
3. **Schemat to bryła 3D** w osobnym materiale (spór 2, rozstrzygnięty przez Dyrygenta), a nie kreska.
4. **Kamienie milowe M1–M8** z wynikiem do obejrzenia i jawną niepewnością (§6).
5. Poziomy nazywają się **„Podstawowy | Rozszerzony”** (decyzja Dyrygenta; wcześniej proponowałem „Uczeń”).

---

## 0. Najkrócej

- **Kropka nad i ma dwie części.**
  - **Zrozumienie.** Każda plansza i gablota odpowiada na pytanie „co mam z tego zrozumieć”: cel lekcji, pytanie, jedna liczba-bohater, legenda „Jak czytać”, lokalizator. Dziś panel zaczyna się od przypisu, a na trzech kluczowych planszach podpisy w Podstawowym nie mówią, do czego dana struktura służy.
  - **Jakość ruchu.** Zamiast płaskich strzałek i kresek są cząstki 3D z objętością (krwinki, krople hormonu, komórki NK, cząstki powietrza), impuls biegnący po nerwie, odkształcenie tkanek i światło sygnału. To jedna rodzina animacji z filmem: te same krwinki, materiały, światło i barwy.
- **Klatki docelowe** (`docs/atlas_rezyser/klatki_docelowe/`) to poprzeczka dla testu serca Wizualizatora (M2):

  | Klatka | Co pokazuje |
  |---|---|
  | (a) | serce HuBMAP w przekroju z krwinkami w jamach |
  | (b) | ROZDZIAŁ jako gęstość krwinek w naczyniu, spoczynek obok sprintu |
  | (c) | wejście w serce, gdy ciało gaśnie |
  | (d) | wspólne światło i materiał z filmem |

- **Uczciwie:** dwie rzeczy z klatek jeszcze nie działają w przeglądarce (krwinki widoczne przez ścianę naczynia i skurcz ścian serca), a wielkości ruchów muszą wynikać z faktów. Opisuję to przy każdej klatce i w kamieniach.

---

## A. Klatki docelowe (kamień M1)

Wszystkie z prawdziwych modeli, w Blenderze 5.2 (EEVEE), headless, przez slot `atlas_raw/.render_slot_1`.
Skrypt: `klatki_docelowe/zrodla/klatki_blender.py`, tryby A, B i C. Żadnych rysunków AI ani płatnych generacji.

Wspólne dla wszystkich klatek:
- **Krwinka:** dysk dwuwklęsły z opublikowanego profilu Evansa i Funga (1972), a nie kształt wymyślony. Parametry profilu (R₀ = 3,91 µm, C₀ = 0,81, C₂ = 7,83, C₄ = −4,39 µm) sprawdzi agent faktów przed wdrożeniem.
  Krwinki są **celowo powiększone (skala umowna)**: na skali narządu prawdziwa krwinka (ok. 8 µm) byłaby niewidoczna. W aplikacji mówi o tym chip „powiększone”.
- **Barwy** tylko z tokenów `palette.json`: krew utlenowana `artery`, odtlenowana `vein`, kontekst `bone`, `muscle` i `skin`.
- **Materiał:** matowy (szorstkość 0,6–0,7), lekkie SSS 0,05–0,1, bez lakieru.
- **Światło:** klucz z lewej-góry-przodu, wypełnienie z prawej, kontra z tyłu; tło studia `#13203A → #070B14`; bez bloomu.

### (a) Skurcz serca z krwinkami przez jamy: gablota serca

Plik: `klatki_docelowe/A_serce_krwinki_w_jamach.jpg`

| | |
|---|---|
| **Co widać** | `VH_M_Heart` (HuBMAP, CC BY 4.0, 14 części: jamy, przegroda, 4 zastawki, mięśnie brodawkowate) w przekroju czołowym. Wnętrze ścian w jaśniejszym tonie. W prawej komorze i przedsionku krwinki w barwie `vein`, w lewej komorze w barwie `artery`. Oś każdego dysku jest ustawiona prostopadle do toru zastawka wpływu → zastawka wypływu |
| **Czego uczy** | dwie połowy serca, dwa rodzaje krwi, które się nie mieszają (przegroda); krew zawsze płynie tą samą drogą przez zastawki. Przekrój czołowy pozwala zobaczyć wszystkie 4 jamy naraz, czyli to, co szkolny rysunek serca |
| **Co się rusza (test M2, nie na klatce)** | 1) krwinki płyną torem wpływ → wypływ, a ich prędkość zależy od fazy cyklu; 2) zastawki: na start wariant A (kolor i cząstki), wariant B (ruch płatków) tylko jeśli M2 pokaże, że jest tani; 3) skurcz ścian według kształtów `Ventricular_Systole` i `Atrial_Systole` z serca filmu (`public/models/cardiopulmonary.glb`) |
| **Jeden nowy ruch na krok filmu gabloty** | krok 1: krwinki; krok 2: zastawki; krok 3: skurcz (spór 1) |
| **Niepewność** | kształty skurczu z filmu to przekształcenie modelu; wielkość skurczu wymaga faktu `checked_agent` albo podpisu „ruch poglądowy”. Liczba krwinek (ok. 900 na klatce) w 50 FPS na UHD jest niesprawdzona, to zadanie M2 |

### (b) ROZDZIAŁ krwionośnego w 3D: atlas

Pliki: `klatki_docelowe/B_rozdzial_udo_spoczynek_sprint.jpg` (zbliżenie uda), `B_rozdzial_cialo_spoczynek_sprint.jpg` (całe ciało w kamerze planszy, orto 1,80319).

| | |
|---|---|
| **Co widać** | naczynia Z-Anatomy (CC BY-SA 4.0) z atlasu 3D; tętnica i żyła udowa z **półprzezroczystą ścianą** w zbliżeniu; krwinki na torach `flows3d.json`. Spoczynek: rzadko. Sprint: gęsty strumień w tętnicy do nogi i w żyle powrotnej |
| **Czego uczy** | „w sprincie więcej krwi płynie do pracujących mięśni”. Uczeń widzi to jako **więcej i szybciej płynących krwinek**, a nie jako grubszą kreskę |
| **Co się rusza** | krwinki płyną wzdłuż toru; gęstość × prędkość ∝ przepływ (reguła nad faktami planszy: udział rzutu serca dla mięśni w spoczynku i sprincie), a prędkość zależy od przekroju naczynia (luka filmu do zamknięcia w module) |
| **Wnioski z renderu** | 1) **krwinki w nieprzezroczystym naczyniu są niewidoczne** (pierwszy render), więc w zbliżeniu ściana musi być półprzezroczysta (dithering jak w E3); 2) **na skali całego ciała krwinka ma ułamek piksela**, więc znaczenie niesie strumień: powiększone, jaśniejsze krwinki na torze; pojedyncze krwinki dopiero w zbliżeniu; 3) tor żylny z `flows3d` biegnie częściowo żyłą odpiszczelową obok żyły udowej (znana niedokładność toru z audytu K2) |
| **Niepewność** | gęstości na klatce to 3 stopnie **ilustracji**, nie dane; reguła z faktów do ustalenia w M6; koszt półprzezroczystej ściany na UHD do pomiaru |

### (c) Wejście diegetyczne: kamera wjeżdża w serce, ciało gaśnie

Plik: `klatki_docelowe/C_wejscie_w_serce.jpg`

| | |
|---|---|
| **Co widać** | klatka „w połowie wjazdu”: kamera perspektywiczna wewnątrz klatki piersiowej. Szkielet, sylwetka i naczynia ciała (Z-Anatomy) wygaszone do ok. 12% krycia; serce HuBMAP (ustawione transformacją `HUBMAP_ALIGN`) w przekroju, z krwinkami |
| **Czego uczy** | **gdzie** jest serce i jak jest duże względem żeber i mostka. Skala i położenie przechodzą płynnie z widoku układu do gabloty, bez cięcia, więc orientacja w ciele nie ginie |
| **Co się rusza** | kamera po szynie (1,2 s, ease-in-out); krycie ciała 100% → 12%; podmiana modelu (serce Z-Anatomy na HuBMAP) w chwili, gdy kamera jest najbliżej i ruch ją ukrywa |
| **Niepewność** | różni osobnicy (Z-Anatomy i HuBMAP, błąd dopasowania ok. 1,5 cm) mogą dać widoczny „przeskok” przy podmianie; M5 to sprawdzi. Półprzezroczyste ciało na UHD: wersja uproszczona gasi ciało do ciemnej, nieprzezroczystej barwy zamiast krycia |

### (d) Wspólny język światła i materiału z filmem „12 aktów”

Plik: `klatki_docelowe/D_swiatlo_i_material_z_filmem.jpg`. U góry kadry filmu (akt III: serce i krwiobieg), u dołu klatki atlasu (a) i (b).

| Element | Film dziś | Wspólny język (atlas, gabloty, film) |
|---|---|---|
| materiał tkanki | połysk „plastiku” (biblia filmu sama go wyklucza: „brak plastikowego wyglądu”) | mat, szorstkość 0,6–0,7, SSS 0,05–0,1, coat 0; **film przechodzi na mat atlasu** |
| krwinka | `InstancedErythrocytes` (`MolecularSimulation.tsx`) | jedna siatka (profil Evansa–Funga), instancjonowana, zorientowana wzdłuż toru, prędkość z przekroju |
| światło | presety aktów, AgX, bloom | presety aktów zostają w filmie; tkanka ma ten sam materiał; studio klucz/wypełnienie/kontra w atlasie i gablotach |
| barwa | palety aktów (np. nerwy cyjanowe w akcie II) | **barwy układów z `palette.json` także w filmie** (nerwowy = bursztyn `nerve`); dwa profile wyglądu: atlas Standard, film AgX; zgodność potwierdza pomiar ΔE na zrzutach |
| świecenie | bloom na sygnałach | **poziom uproszczony (Low):** tylko sygnał (impuls, struktura z bieżącego zdania) jako emisja + tani halo (sprite), bez postprocesu; **poziom pełny (High, Cinematic):** może mieć profil filmowy z postprocesem (bloom tylko na sygnałach). Profile wyglądu i zgodność palety projektuje Wizualizator (jego PLAN 2) |
| schemat | — | bryła 3D w jednolitym, matowym materiale + chip „schemat, bez skali”; kreska tylko w legendzie |

**Rozbieżność barw do decyzji:** w filmie układ nerwowy jest cyjanowo-błękitny (biblia, akt II), a w atlasie bursztynowy (`nerve` `#E8B23A`, sprawdzony walidatorem ΔE).
Proponuję jedną barwę układu w obu, czyli bursztyn z `palette.json`. Paleta atlasu przeszła test daltonizmu, a jasny rdzeń impulsu (biel) działa w obu stylach. Decyzja należy do Dyrygenta albo użytkownika (§7, pytanie 3).

---

## 1. Zgodność z biologią w liceum

### 1.1 Zasady

- **Dwa poziomy atlasu odpowiadają dwóm zakresom szkolnym:**
  - **Podstawowy** odpowiada zakresowi podstawowemu;
  - **Rozszerzony** odpowiada zakresowi rozszerzonemu, z dodatkami dla studentów.
- **Odniesienie do podstawy programowej** podaje się dokładnym punktem wymagań z rozporządzenia w sprawie podstawy programowej kształcenia ogólnego dla liceum.
  Numerów punktów nie podaję z pamięci: wpisuje je agent treści z dosłownym cytatem, a sprawdza osobny agent.
  Dyrygent potwierdził już dwa: automatyzm serca P V.4.9 i tworzenie moczu P V.5.3, oba w Podstawowym.
- Nowe pole w danych planszy i gabloty: `curriculumRef` (punkt, cytat wymagania, zakres P/R). Bez niego nie ma celu lekcji.
- **HIIT to przykład, nie temat.** Cel lekcji mówi o budowie lub funkcji, a sprint pokazuje ją w działaniu.
- **Uproszczenie nie zmienia faktu.** Metafory („magazyn”, „filtr”, „chłodnica”) mają w danych `metaphor: true`.
- Pierwsza wersja każdej gabloty to **tylko Podstawowy** (§7 (g) 4).

### 1.2 Co należy do którego poziomu (propozycja; do potwierdzenia cytatem z podstawy)

| Układ | Podstawowy: budowa i funkcja + 1 zmiana w wysiłku | Rozszerzony: dodatki |
|---|---|---|
| Mózg | kora, móżdżek, pień i ich ogólne funkcje; kora ruchowa steruje ruchem | płaty i obszary, drogi, paliwa mózgu |
| Nerwowy | ośrodkowy i obwodowy; nerw przewodzi rozkaz do mięśnia; współczulny przyspiesza narządy | sploty, rdzeń nadnerczy, rekrutacja jednostek |
| Hormonalny | gruczoł → hormon → krew → narząd docelowy; adrenalina w wysiłku | oś podwzgórze–przysadka, ADH, insulina i glukagon, czasy narastania |
| Mięśniowy | mięśnie szkieletowe, praca w parach, skurcz | typy włókien, zasada rozmiaru |
| Kostny | szkielet jako podpora i dźwignia, stawy | obciążenia (× masa ciała), przebudowa |
| Oddechowy | drogi oddechowe, płuca, wymiana gazowa, przepona | mięśnie dodatkowe, objętości, wentylacja |
| Krwionośny | serce, tętnice, żyły, krążenie duże i małe; rozdział krwi w wysiłku | rzut serca, objętość wyrzutowa, krążenie wieńcowe |
| Pokarmowy | narządy przewodu, wątroba jako magazyn glukozy | cykl Cori, przepływ trzewny |
| Powłokowy | skóra a termoregulacja, pot | przepływ skórny w czasie |
| Moczowy | nerki filtrują krew i tworzą mocz, bilans wody | nefron, ADH, aldosteron |
| Limfatyczny | węzły, limfa, odporność | komórki NK, spór o „okno” po wysiłku |
| Rozrodczy | budowa (karta bez stanu sprintu) | hormony płciowe w czasie tygodni |

---

## 2. Zrozumiałość: problemy i poprawki (dowody: `docs/atlas_rezyser/ux/przed/`)

Przegląd: gałąź `atlas-uklady` (`2c6db64`), 12 układów, 61 zrzutów (2D przy 1440 i 390, 3D przy 1440), konsola 0 błędów, czcionka ≥ 14 px.

### 2.1 Szybkie poprawki: kamień M3, nie zależą od animacji

| # | Problem | Plik / zrzut | Poprawka |
|---|---|---|---|
| S1 (K1) | panel zaczyna się od przypisu o protokole i definicji VO₂max | `przed/04`; `AtlasApp.tsx` (`protocolNote`, `glossary`) | rozwijane „ⓘ Co znaczy »sprint«” |
| S2 (K4) | teksty robocze na ekranie ucznia: „…jego opis czeka na sprawdzenie” (hormonalny, pokarmowy, powłokowy), „N liczb czeka na sprawdzenie źródła” | `AtlasApp.tsx:282`, `:558–561`, `AtlasPlate.tsx:38/377` | w Podstawowym nic zamiast faktu niesprawdzonego; status tylko w Rozszerzonym, w „Więcej”; walidator wszystkich pól tekstowych (decyzja Dyrygenta) |
| S3 (K3) | telefon: brak tytułu nad obrazem, pasek 12 układów ucięty | `przed/03` | tytuł w 1 linii nad obrazem; „›” albo „12 układów ▾” |
| S4 (W4) | dwa identyczne przełączniki jeden pod drugim | `przed/04` | „Podstawowy / Rozszerzony” mały, w nagłówku |
| S5 (W5) | „Sprint” znaczy na planszach różne rzeczy | `przed/04` | `momentLabelPl` na przycisku („Koniec 45 s pracy”, „Po treningu”, „Krok biegu”) |
| S6 (W9) | różne nazwy w menu i tytule | `palette.json` `namePl`, `plates/*.ts` | jedna nazwa szkolna |
| S7 (W3) | legenda strzałek pod opisem, daleko od obrazu | `AtlasApp.tsx` „Legenda strzałek” | „Jak czytać” w rogu sceny |
| S8 (W8) | skróty „t.”, „ż.”, „m.” w Podstawowym | `plates/*.ts` `namePl` | pełne słowa w Podstawowym |
| S9 | 3D: pulsowanie `sin(uTime*3.9)` bez zmiennej | `src/atlas3d/engine.ts` | puls tylko na strukturze z bieżącego zdania |
| S10 | 3D: przełączniki i w pasku 3D, i w panelu | `przed/02` | jedno sterowanie |
| S11 | tło płaskie w 2D | `przed/01` | gradient studia + podest |
| S12 | skala nieznana | `przed/06` | chip skali z `camera.orthoScale` |
| S13 | kontrast przycisku sprintu na jasnych barwach (pokarmowy, powłokowy) | `palette.json` `onColor` | pomiar 4,5:1, ewentualna zmiana |

### 2.2 Przebudowy

| # | Problem | Dowód | Poprawka | Kamień |
|---|---|---|---|---|
| P1 | brak celu lekcji i hierarchii; opis 8–15 linii; liczby równoważne | `przed/01`, `przed/04` | panel: pytanie → liczba-bohater → miara wyróżnika → opis ≤ 3 zdania → Sprawdź się → Więcej; pola `lessonGoalPl`, `questionPl`, `heroMetricId`, `curriculumRef` | M3 (pola, treść) + M6 (rama) |
| P2 | **podpisy bez funkcji w Podstawowym**: opisy ról bez `checked_agent` są ukryte, zostaje sama nazwa. Mózg 21, mięśniowy 19, nerwowy 14, oddechowy 8, powłokowy 4 (oba stany, z `facts/*.json`) | `przed/01` (mózg: „Kora ruchowa”, „Móżdżek” bez opisu) | doprowadzić opisy ról do `checked_agent`, najpierw `primary` | równolegle z M2 (pytanie 2 Dyrygenta: wznowić fakty) |
| P3 | skala skacze bez lokalizatora | `przed/06` | lokalizator: wypieczona mini-sylwetka z prostokątem kadru (BY-SA osobnym plikiem); ten sam w gablotach | M6 |
| P4 | **płaskie strzałki i linie przepływu** (2D: przerywane kreski; 3D: nieruchome rury ok. 9 mm, ok. 2 px w ujęciu całego ciała) nie mają jakości filmu i słabo pokazują kierunek | `przed/05`, `przed/01` | **cząstki 3D** według §3.3 (krwinki, krople, komórki, powietrze, impuls); tory `flows3d` jako dane torów; strzałka tylko w legendzie | M6 (pilot), M7 (reszta) |
| P5 | brak „Co się zmieniło” | `przed/01` | 3D: tekstura stanu; 2D: przygaszenie + pełny kolor w obrysach kotwic z największą zmianą | M6 |
| P6 | brak sprawdzenia wiedzy | — | „Sprawdź się”: 1 pytanie ↑/↓ albo „wskaż…” | M6 (atlas), M5 (gablota serca) |
| P7 | brak wyróżnika układu | `ux/po/klatka_*.jpg` | §3.3 jako animacje 3D | M6 / M7 |
| P8 | pierwsze otwarcie 3D bywa wolne (limfatyczny > 7 s headless) | — | pomiar w zwykłym Chrome, pasek postępu, jeśli > 3 s | M4 |

---

## 3. Karta stylu: atlas, gabloty i film

### 3.1 Wspólna rama (atlas 2D, atlas 3D, gabloty)

1. **Nagłówek:** „Atlas › grupa › układ (› narząd)”, cel lekcji jednym zdaniem, mały przełącznik „Podstawowy | Rozszerzony”, w gablotach zakładki trybów (Zwiedzaj, Jak to działa, Sprawdź się).
2. **Scena-studio:** gradient, podest, chip skali, lokalizator; chip „powiększone” przy cząstkach w skali umownej.
3. **Przełącznik momentu pod sceną:** `Spoczynek | <nazwany moment> | Co się zmieniło`, w kolorze układu. Domyślnie Spoczynek z celem lekcji o budowie (decyzja Dyrygenta).
4. **„Jak czytać”** w lewym dolnym rogu: legenda wyróżnika (tu, i tylko tu, są strzałki i kreski).
5. **Panel:** pytanie → liczba-bohater → miara wyróżnika → opis ≤ 3 zdania → Sprawdź się → Więcej.
6. **Podpis:**
   - nazwa: Figtree 600, 16 px;
   - opis: 14 px;
   - łacina: tylko w Rozszerzonym, w nawiasie przy pierwszym użyciu (14 px kursywą);
   - liczby: JetBrains Mono;
   - tło `#0D1526` z kryciem ok. 85%, kontrast ≥ 4,5:1.
7. **Podświetlenie:** wybrana struktura w pełnym kolorze z obrysem 2 px w `light`, reszta 35% (`restMix`).
8. **Ruch i tempo:**

   | Element | Parametr |
   |---|---|
   | zmiana stanu | 0,9 s, ease-in-out |
   | kamera po szynie | 1,2 s |
   | krok filmu | co najmniej max(4 s; 0,3 s na słowo + 1,5 s), pauza ręczna |
   | nowe ruchy | 1 nowy ruch na krok, najwyżej 3 naraz |
   | okres pętli cząstek | 2,6 / 1,6 / 1,0 s dla stopni 1 / 2 / 3 |
   | `prefers-reduced-motion` | stopklatki |

### 3.2 Wspólna gramatyka obrazu (po sporze 2)

| Rodzaj | Materiał | Przykłady |
|---|---|---|
| **model z danych** | realistyczny mat (SSS, światło studia) | narządy, kości, naczynia z Z-Anatomy, HuBMAP i BodyParts3D |
| **schemat lub ilustracja** | **bryła 3D w jednolitym, matowym materiale bez tekstury** + chip „schemat, bez skali” albo „ilustracja” | nefron, zrazik, układ bodźcoprzewodzący, skrzyżowanie piramid, miernik objętości |
| **cząstka w skali umownej** | ten sam materiał co model, z chipem „powiększone” | krwinka, kropla hormonu, komórka NK, cząstka powietrza |
| **sygnał** | jasny rdzeń (biel) + halo w barwie układu | impuls nerwowy, struktura z bieżącego zdania |
| **legenda** | kreska, strzałka, symbol | tylko „Jak czytać” |

### 3.3 Wyróżniki 12 układów jako animacje 3D

Dla każdego: **co się rusza i z jakiej zmiennej** (test zmiennej), **wersja uproszczona** (`QualityManager` Low, Intel UHD ≥ 50 FPS, ≤ 1 ms GPU na wyróżnik, bez półprzezroczystych nakładek) i **akt filmu** (mapa z decyzji Dyrygenta v2 §3, uzgodniona z Wizualizatorem).
Barwy wyłącznie z `palette.json`. Wielkości ruchu wyłącznie z faktów `checked_agent`, a bez faktu: 3 stopnie z chipem „ilustracja”.

| Układ | Wyróżnik | Co się rusza (pełny poziom) | Zmienna | Wersja uproszczona (UHD) | Akt filmu |
|---|---|---|---|---|---|
| Mózg | **OBSZAR** | obszar kory zapala się (emisja `brain` w strukturze z ID), potem fala aktywacji schodzi drogą ruchową do pnia i przechodzi w IMPULS | która struktura działa w bieżącym kroku (graf przyczyn) | zapalenie z tekstury stanu, bez fali | 2 (decyzja ruchu), 8 (gablota mózgu) |
| Nerwowy | **IMPULS** | jasny pakiet (rdzeń biały, halo `nerve`) biegnie po nerwie mózg → rdzeń → nerw → mięsień; w sprincie seria pakietów częściej | kolejność; częstość serii w 3 stopniach (ilustracja, brak liczby) | 1 pakiet naraz, bez halo (emisja na odcinku rury) | 2 |
| Hormonalny | **NADAWCA → ODBIORCA** | krople hormonu (instancje, `endo`) wypływają z nadnercza do żyły, płyną z krwinkami i docierają do serca i wątroby, które zmieniają stan | opóźnienie: sekundy vs minuty (`tSecFromBoutStart` z faktów) | ≤ 100 kropli, bez krwinek tła | 2 (ujęcie 3: nadnercza), 7, 8 |
| Mięśniowy | **PRACA** | brzusiec mięśnia odkształca się w rytmie kroku (cele morph, ruch poglądowy); w zbliżeniu udo → włókna zapalają się kolejno I → IIa → IIx | rekrutacja typów włókien (fakty planszy) | tylko zapalanie włókien w przekroju, bez odkształcenia | 4, 1 (ujęcie 5: najazd na udo) |
| Kostny | **KONSTRUKCJA** | „fala obciążenia” biegnie w górę kości: stopa → piszczel → udowa → miednica (rozjaśnienie przesuwa się po kościach) w rytmie kroku; licznik „× masa ciała” | szczyt nacisku podłoża ok. 2,5–2,7 × masa ciała (`checked_agent`) | rozjaśnienie per kość z tekstury stanu, kolejno 4 kości | 1 (ujęcie 2: krok na bieżni), 12 |
| Oddechowy | **OBJĘTOŚĆ** | cząstki powietrza (`resp`) płyną tchawicą do oskrzeli w rytmie oddechu; w pęcherzyku (schemat-bryła) O₂ przechodzi do naczynia, a CO₂ w drugą stronę; miernik objętości; ruch płuc tylko po fakcie i z chipem „ruch poglądowy” | częstość i objętość oddechu (fakty planszy) | ≤ 300 cząstek, bez wymiany w pęcherzyku | 3 (ujęcie 3: pęcherzyki) |
| Krwionośny | **ROZDZIAŁ** | krwinki 3D w naczyniach (klatka b): gęstość × prędkość ∝ przepływ, prędkość z przekroju; w zbliżeniu półprzezroczysta ściana | udział rzutu serca do mięśni (fakty planszy) | ok. 500 krwinek, ściana nieprzezroczysta, krwinki na zewnątrz osi naczynia jako „strumień” | 3 (tunel), 6 |
| Pokarmowy | **MAGAZYN** | w wątrobie granulki glikogenu (instancje, `digest`) maleją, a krople glukozy wypływają żyłami wątrobowymi do krwi; w naczyniach jelit mniej krwinek w sprincie | kierunek (wątroba oddaje glukozę); zapas w 3 stopniach (ilustracja) | ≤ 150 kropli, granulki statyczne | 5, 11 (cykl Cori) |
| Powłokowy | **CIEPŁO** | ciepła poświata podpowierzchniowa skóry narasta (emisja `skin` w 3 stopniach); krople potu (nieprzezroczyste instancje) pojawiają się na czole i plecach; więcej krwinek w żyłach powierzchownych po pracy | przepływ skórny: najpierw ↓, potem ↑ (`checked_agent`) | tylko barwa i emisja skóry, bez kropli | 6 |
| Moczowy | **FILTR** | w gablocie nerki krwinki wpływają tętnicą nerkową; w nefronie (schemat-bryła) cząstki osocza przechodzą przez kłębuszek do kanalika, a krwinki zostają; w sprincie wpływa mniej krwinek | przepływ nerkowy ↓ (fakt planszy) | mniej cząstek, nefron bez cząstek osocza | 6, 11 |
| Limfatyczny | **PATROL** | komórki NK (instancje z jądrem, `lymph`) odrywają się od ścian naczyń i ze śledziony i wchodzą do strumienia krwi; licznik ×N; po wysiłku część wraca, z chipem „naukowcy się spierają” | liczba komórek NK we krwi (fakt planszy, `contested_debate` po wysiłku) | ≤ 100 komórek | 7 |
| Rozrodczy | **DŁUGI CZAS** | brak animacji sprintu (karta); oś tygodni w legendzie; ewentualnie krótkotrwały wzrost hormonu jako krople, jeśli fakt planszy to uzasadnia | tygodnie, nie sekundy | to samo | 12 |

Strażnicy czytelności (bez zmian):
- jeden wyróżnik na planszę;
- ruch tylko z powodu;
- kolor nigdy jedynym nośnikiem (kształt cząstki, chip, licznik);
- cząstki nie zasłaniają kotwic podpisów;
- `prefers-reduced-motion` zamienia ruch na stopklatki.

### 3.4 Rdzeń dla gablot narządów (uzgodniony z Wizualizatorem)

| Gablota | Znak układu | Barwy części | Poprawka do klatek Wizualizatora (`bd9650c`) |
|---|---|---|---|
| Serce | ROZDZIAŁ, przepływ | `artery`, `vein`; mięsień jako ciemny odcień `artery` (klatka a) | zgodne |
| Nerka | FILTR | odcienie `urinary` (`#276777`), naczynia `artery` i `vein` | dziś w czerwieniach i kremie: do zmiany |
| Wątroba | MAGAZYN | odcienie `digest` (`#B4B474`), segmenty z numerem 1–8, żyła wrotna `vein` | dziś żółcie, wrotna fioletowa, drogi żółciowe zielone: do zmiany |
| Mózg | OBSZAR + IMPULS | `brain` (fiolet), drogi w `nerve` | zgodne |

Przekrój:
- powierzchnia cięcia w `light` układu;
- bez rozsuwania;
- w sercu otwarcie przedniej ściany komór. Klatka (a) pokazuje cięcie przez kolorowanie tylnych ścianek, bez booleanów; pytanie do Wizualizatora, czy to wystarczy zamiast stencila.

Wejście do gabloty: diegetyczne (klatka c), z menu „Narządy” najwyżej jako dodatek (§7 (g)).

---

## 4. Wydajność

- **Poziomy jakości z filmu** (`QualityManager`: Low, High, Cinematic). Low = wersja uproszczona z §3.3, ≥ 50 FPS na Intel UHD przy 1440×900.
- **„Bez postprocesu” obowiązuje tylko na poziomie Low.** Poziom pełny (High, Cinematic) może mieć profil filmowy (AgX, bloom na sygnałach). Profile wyglądu i zgodność palety w obu (pomiar ΔE na zrzutach) projektuje Wizualizator w swoim PLAN 2; ta karta podaje tylko znaczenie (co świeci i dlaczego).
- **Kontrakt na poziomie Low** (przyjęty przez Dyrygenta):
  - ≤ 1 ms GPU na wyróżnik w widoku układów;
  - zakaz półprzezroczystych nakładek pełnoekranowych;
  - automatyczny powrót do nakładki 2D, gdy FPS < 50;
  - usunięcie `sin(uTime)`.
- Cząstki: `InstancedMesh`, pozycja z toru w shaderze, 1 wywołanie rysowania na rodzaj. Wizualizator: ≤ 4 tys. cząstek to pomijalny koszt.
- **Dwa koszty do zmierzenia w M2 i M6:**
  1. półprzezroczysta ściana naczynia w zbliżeniu (dithering);
  2. ok. 1000 krwinek w gablocie serca z przekrojem.
- Jeśli krok nie mieści się nawet w Low, wypieka się go do filmu z Blendera (rozstrzygnięcie Dyrygenta, pkt 2).

## 5. Licencje

- Klatki docelowe: Z-Anatomy (CC BY-SA 4.0) i HuBMAP (CC BY 4.0), w osobnych plikach GLB, jak w atlasie 3D. Kadry filmu z `docs/screenshots/after`.
- Nowe zasoby zewnętrzne: brak. Krwinka i schematy to własna geometria: profil z publikacji to wzór matematyczny, nie plik.
- Film po wpięciu elementów z Z-Anatomy staje się w tych częściach utworem zależnym BY-SA (rozstrzygnięcie Dyrygenta, pkt 3). Stopka filmu i `docs/LICENSES_AND_ASSETS.md` do uzupełnienia przy M7.
- Zero NC: nerka tylko z HuBMAP.
- Czcionki na SIL OFL 1.1, bez zmian.

---

## 6. Kamienie milowe (numeracja z decyzji Dyrygenta v2)

Każdy kamień kończy się **wynikiem do obejrzenia**. Godziny są tylko przy M1 (wynik) i M2 (szacunek Wizualizatora), bo po nich Dyrygent przelicza resztę (M2′).

| Kamień | Wynik do obejrzenia | Udział Reżysera | Niepewność |
|---|---|---|---|
| **M1 Poprzeczka** | **gotowe:** 4 klatki w `klatki_docelowe/` z opisem „co widać i czego uczy” (§A) | całość | — |
| **M2 Test serca** (Wizualizator, `prototypes/**`) | nagranie lub seria zrzutów: krwinki przez jamy, zastawki A (B, jeśli tanie), skurcz z kształtów filmu; FPS UHD dla Low i High; porównanie z klatką (a) | ocena zgodności z klatką (a) według „test zmiennej” i §3.2 | **duża:** gęstość krwinek a FPS, przekrój stencilem lub tylnymi ściankami, kształty skurczu z filmu a HuBMAP |
| **M2′ Przeliczenie** (Dyrygent) | tabela szacunek a rzeczywistość | dane z M1 (wyżej) | — |
| **BRAMKA A** | użytkownik ogląda M1 i M2 | — | — |
| **M3 Czytelność** (integrator, treść, sprawdzający) | 24 zrzuty przed i po: S1–S13 + pola P1 | lista S1–S13 (§2.1), odbiór zrzutów | **mała**: zmiany w znanych plikach; ryzyko tylko w nowych zdaniach (bramka faktów) |
| **M4 Wspólny moduł** (`src/biomotion`, Wizualizator + integrator) | akt 3 filmu bez regresji na module (nagranie przed i po, FPS) | wspólne parametry ruchu i materiału z §3.1–3.2 jako stałe modułu | **duża:** sprzężenia w filmie (`liveSimulationRef`, cykl ShotChoreography ↔ scenes, jeden `useFrame`) |
| **M5 Serce wzorcowe** | nagranie: widok krwionośny 3D → klik w serce → wjazd (klatka c) → gablota → film cyklu; FPS | scenariusz kroków filmu gabloty (1 nowy ruch na krok), audyt zgodności z klatkami (a) i (c) | **średnio-duża:** podmiana modelu przy wjeździe, treść Podstawowa wymaga faktów |
| **M6 Rama i pilot wyróżników** | rama (lokalizator, chip, Jak czytać, Co się zmieniło, Sprawdź się) + 4 wyróżniki 3D (krwionośny, kostny, nerwowy, powłokowy) w Low i High; nagrania 2D i 3D | specyfikacja 4 wyróżników z §3.3, odbiór „test zmiennej” | **średnia:** reguły wielkości z faktów (gęstość, częstość) mogą nie mieć źródeł, wtedy 3 stopnie „ilustracja” |
| **BRAMKA B** | pokaz użytkownikowi + 2–3 licealistów (5 min, „mów na głos”) | scenariusz testu (3 pytania na planszę) | — |
| **M7 Rozwinięcie** | 8 pozostałych wyróżników + wpięcie do aktów filmu (§3.3 kolumna „Akt filmu”) | specyfikacje 8 wyróżników, zgodność barw film ↔ atlas (pomiar ΔE) | **duża:** film zmienia barwy i materiał (mat, palety układów) |
| **M8 Gabloty nerki, wątroby i mózgu** | każda gablota jako osobne nagranie | rdzeń karty (§3.4) | **średnia**: nefron i zrazik jako schemat-bryła |

**M1, uczciwie o czasie:** szacunek Dyrygenta to 4–8 h. Rzeczywiście ok. 1,5–2 h pracy sesji: 4 przebiegi Blendera w slocie 1 (inspekcja + 3 rundy renderu) i składanie tablic.
Szybciej niż szacunek, bo modele, tory i kamery już były w repo (eksport E3). Tego tempa **nie wolno przenosić** na M2: tam powstaje kod czasu rzeczywistego, nie render.

**Co da się zrobić bez czekania na gabloty i animacje:** M3 (wszystkie szybkie poprawki) i P2 (sprawdzenie opisów ról). Obie rzeczy są niezależne od M2 i M4.

---

## 7. Pytania do użytkownika

Do użytkownika trafiają tylko 4 pytania z decyzji Dyrygenta v2 §4 (start M2 i M3, fakty podręcznikowe, telefon, test z licealistami).
Moje pytania rozstrzygnął Dyrygent (2026-11-26):

| Pytanie | Rozstrzygnięcie Dyrygenta |
|---|---|
| łacina | Podstawowy: nazwy polskie; Rozszerzony: polska + łacińska w nawiasie przy pierwszym użyciu |
| wyniki „Sprawdź się” | tylko w przeglądarce, bez kont |
| telefon czy komputer w szkole | w pytaniu 3 decyzji |
| tryb „sama budowa” | nie powstaje; domyślny moment to Spoczynek z celem lekcji o budowie, a sprint jest przykładem (decyzja (a)) |
| test z licealistami | w pytaniu 4 decyzji |

Otwarta zostaje jedna sprawa dla Dyrygenta, nie dla użytkownika: **barwa układu nerwowego** (film błękit, atlas bursztyn). Proponuję bursztyn z `palette.json` w obu (§A d).

---

## 8. Spór z Wizualizatorem (protokół)

| Wymiana | Treść | Wynik |
|---|---|---|
| 1 (R → W) | 7 pytań o wykonalność | wszystko ≥ 50 FPS; strzałki w 3D już są (`makeFlow`); ruch płuc tylko po fakcie z chipem „ruch poglądowy”; lokalizator wypieczony |
| spór 1 (W) | „jeden ruch” a film gabloty | **zgoda**: znak gabloty = wyróżnik; 1 nowy ruch na krok, najwyżej 3 naraz (potwierdził Dyrygent) |
| 2 (R → W) | rdzeń karty, poprawki barw gablot, gramatyka „kreska = schemat” | gramatykę **zmienił Dyrygent (spór 2): schemat to bryła 3D**. Przyjmuję; §3.2 poprawiona |
| 3 (R → W) | klatka docelowa serca (a) + pytania o 1000 krwinek i cięcie tylnymi ściankami | czeka na odpowiedź i wynik M2 |

Sprostowanie: w wymianie 2 podałem złe wartości barw (`urinary`, `digest`), skopiowane ze starej propozycji. Wartości poprawiłem w wiadomości do Wizualizatora; obowiązuje `palette.json`.
Poprawki barw jego klatek gablot (nerka, wątroba) nie dostały jeszcze odpowiedzi. Jeśli je odrzuci, spór trafi do Dyrygenta jednym akapitem.

---

## 9. Ryzyka

| Ryzyko | Zabezpieczenie |
|---|---|
| animacja staje się ozdobą („wow” zamiast nauki) | test zmiennej w każdym audycie; kolumna „Zmienna” w §3.3 jest obowiązkowa |
| wielkości ruchu bez źródła (gęstość, częstość, skurcz) | tylko fakty `checked_agent`; bez faktu 3 stopnie z chipem „ilustracja” albo „ruch poglądowy” |
| skala umowna cząstek myli ucznia | chip „powiększone”; w Rozszerzonym prawdziwy rozmiar (ok. 8 µm) w „Więcej” |
| krwinki niewidoczne w naczyniach albo zbyt drobne na całym ciele | wnioski z klatki (b): półprzezroczysta ściana w zbliżeniu, strumień na całym ciele |
| koszt na UHD | poziomy jakości; Low z §3.3; nakładka 2D lub wypiekany film jako zapas |
| film traci własny charakter po ujednoliceniu | presety światła aktów zostają; ujednolicamy tylko materiał tkanki, barwy układów i krwinkę |
| kolizje plików | M3 integrator, M4 granice modułu ustala integrator, wyróżniki w nowych plikach |
| przydział P/R niezgodny z podstawą | `curriculumRef` z cytatem, sprawdzany osobno |
