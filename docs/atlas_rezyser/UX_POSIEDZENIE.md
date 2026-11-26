# Posiedzenie UI/UX atlasu: widoczność i zrozumienie dla licealisty

Stan na 2026-11-26. Prowadzi Reżyser. To plan bez zmian w kodzie aplikacji. Kod powstanie dopiero po zgodzie użytkownika (decyzja: Dyrygent razem z użytkownikiem).

Podstawa:
- polecenie użytkownika: „animacje są fajne, ale brakuje kropki nad i; każdy układ ma mieć bardzo podobny sznyt, ale coś wyróżniającego”;
- nowy priorytet: **nauka licealistów**.

Co obejrzałem: gałąź `atlas-uklady` (`2c6db64`), wszystkie 12 układów. Własny serwer Vite na porcie 5198, zrzuty headless Chrome przez własny skrypt CDP (bez Playwright MCP).

| Ujęcie | Zakres |
|---|---|
| 2D, 1440 px | spoczynek i sprint |
| 2D, 390 px | sprint, cała strona |
| 3D „Gablota”, 1440 px | sprint: przód i bok |

Razem 61 zrzutów. Konsola: 0 błędów i 0 wyjątków. Najmniejsza czcionka na wszystkich planszach to 14 px, zgodnie z E0.

Materiały w `docs/atlas_rezyser/ux/`:

| Plik | Co pokazuje |
|---|---|
| `przed/01_2d_12_ukladow_sprint_1440.jpg` | 12 plansz 2D, sprint |
| `przed/02_3d_12_ukladow_sprint_1440.jpg` | 12 gablot 3D, sprint, przód |
| `przed/03_telefon_390_pierwszy_ekran.jpg` | pierwszy ekran telefonu (6 układów) |
| `przed/04_panel_boczny_kolejnosc_tresci.jpg` | panel boczny: krwionośny, pokarmowy, moczowy |
| `przed/05_krwionosny_2d_ze_strzalkami_vs_3d_bez.jpg` | ten sam układ w 2D i 3D |
| `przed/06_skala_skacze_bez_lokalizatora.jpg` | mózg, oddechowy, krwionośny, rozrodczy obok siebie |
| `po/00_karta_stylu_12_ukladow.jpg` | **karta stylu** (obraz) |
| `po/klatka_krew.jpg`, `klatka_kosc.jpg`, `klatka_nerw.jpg`, `klatka_skora.jpg` | **klatki koncepcyjne**: wspólna rama + 4 różne wyróżniki |
| `klatki.html`, `karta_stylu.html` | źródła makiet (statyczny HTML, poza `src/`) |

Makiety otwiera serwer Vite aplikacji (`npm run dev`) pod adresami `/docs/atlas_rezyser/ux/klatki.html#k=krew` (`kosc`, `nerw`, `skora`) i `/docs/atlas_rezyser/ux/karta_stylu.html`.
Liczby w makietach pochodzą wyłącznie z faktów `checked_agent`, które już są na planszach. Nakładki (strzałki, izolinie, linie techniczne) to szkic rozmieszczenia, a nie dane.

---

## 0. Najkrócej

**„Kropka nad i” to nie kolejny efekt, tylko odpowiedź na pytanie ucznia „co mam z tego zrozumieć?”.**
Dziś każda plansza zaczyna się od przypisu o protokole i definicji VO₂max, potem jest ściana tekstu, a liczby i legenda strzałek leżą pod zgięciem ekranu.
Obraz jest dobry i anatomicznie rzetelny, ale nie ma nad nim **pytania, jednej najważniejszej liczby i instrukcji „jak czytać”**.

Propozycja: **wspólna rama** (ta sama na 12 planszach i w 3D) plus **jeden wyróżnik na układ**.
Wyróżnik to znak, jeden ruch i jedna miara, przypisane do jednej idei z biologii w liceum:

| Układ | Wyróżnik |
|---|---|
| kostny | konstrukcja |
| krwionośny | rozdział krwi |
| nerwowy | impuls |
| powłokowy | ciepło |
| …i tak dalej | §3 |

Wyróżnik ma uczyć, a nie zdobić. Każdy jego ruch koduje zmienną, zgodnie z zasadą z `ATLAS_REZYSER_PLAN.md`.

---

## 1. Co jest dobre (zostaje)

- **Anatomia i rzetelność.** Prawdziwe modele (Z-Anatomy, HuBMAP), kotwice sprawdzone, fakty z cytatem. Tego nie ma żaden szkolny atlas.
- **Wspólny kolor i ikona układu** w menu, w przycisku „Sprint” i w podpisach. Kolor przycisku sprintu zmienia się z układem, co już jest zalążkiem „sznytu”.
- **Telefon:** numerowane pinezki, lista pod obrazem i przełącznik stanu przyklejony u dołu (zrzut 03). Rozwiązanie E0 działa.
- **3D „Gablota”:** obrót tylko w poziomie, 4 widoki kluczowe i gotowe zbliżenia, podpisy na ciemnym tle poza obrysem modelu, ≥ 50 FPS na Intel UHD.
  Spójna z 2D: te same kolory, te same podpisy i ten sam panel.
- **Czcionka ≥ 14 px wszędzie** (pomiar skryptem na 12 planszach).

---

## 2. Problemy (z priorytetem)

### Krytyczne: blokują naukę

| # | Problem | Gdzie (zrzut „przed”) | Dlaczego szkodzi licealiście | Naprawa |
|---|---|---|---|---|
| K1 | **Panel zaczyna się od przypisu, nie od celu.** Na każdej planszy pierwsze są dwa szare akapity: protokół („Sprint to koniec 45 s pracy przy ok. 88% VO₂max…”) i definicja VO₂max. Dopiero potem treść | `04` | uczeń czyta najpierw metainformację, a pytanie „czego mam się nauczyć” nie pada nigdzie | **pytanie planszy + cel lekcji** na górze; protokół i VO₂max do rozwijanego „ⓘ Co znaczy sprint” |
| K2 | **Ściana tekstu i płaska hierarchia.** Opis sprintu ma 8–15 linii (pokarmowy, moczowy, powłokowy, limfatyczny). Liczby i legenda strzałek są przy 1440×900 pod zgięciem. Wszystkie liczby mają tę samą wagę | `01`, `04` | obciążenie poznawcze; najważniejsza zmiana ginie | **1 liczba-bohater** (duża, z „×N” i momentem), opis ≤ 3 zdania, reszta w „Więcej liczb i źródła” |
| K3 | **Telefon: pierwszy ekran nie mówi, co to za układ.** Tytuł planszy jest pod obrazem; pasek 12 układów jest ucięty („Mię…”) bez wskazówki, że jest ich więcej; liczby dopiero po długim przewinięciu | `03` | uczeń nie wie, gdzie jest ani ile jest do obejrzenia | tytuł i pytanie nad obrazem (1 linia), pasek układów z grupami i strzałką „więcej” albo menu „12 układów” |
| K4 | **Teksty robocze na ekranie ucznia:** „„Sprint” ma na tej planszy własne znaczenie; jego opis czeka na sprawdzenie.” | `01`, `04` (hormonalny, pokarmowy, powłokowy) | wygląda jak błąd i podważa zaufanie do całości | bramka faktów ma ukrywać pole z innym statusem niż `checked_agent` **bez zastępczego zdania dla autora**; ewentualnie neutralne „Moment: koniec pracy” |

### Ważne

| # | Problem | Gdzie | Naprawa |
|---|---|---|---|
| W1 | **Skala skacze bez lokalizatora.** Mózg, rozrodczy, oddechowy, pokarmowy i moczowy są w zbliżeniu narządu, a reszta to całe ciało. Nigdzie nie widać, *gdzie w ciele* jest kadr ani jak jest duży | `06` | **lokalizator**: mini-sylwetka w rogu z prostokątem kadru (liczony z `camera` w `anchors.json`, bez nowych renderów) + chip skali („1,8 m · całe ciało”, „≈ 20 cm · jama brzuszna”). Ten sam element dostają gabloty narządów Wizualizatora |
| W2 | **3D gubi to, co w 2D uczy najlepiej: strzałki przepływu.** W 2D są, w 3D ich nie ma. W 3D jest za to pulsowanie emisji (`sin(uTime*3.9)` w `engine.ts`), które nie koduje żadnej zmiennej | `05` | strzałki z `flows3d.json` w 3D (§4); pulsowanie tylko na strukturze z bieżącego podpisu albo wcale |
| W3 | **Strzałek nie da się odczytać bez czytania panelu.** Legenda jest daleko pod tekstem, a tory mają 1–2 px przy 1440. Tętnica i żyła różnią się wzorem przerywania, ale „co płynie” trzeba doczytać | `01` | legenda **„Jak czytać”** przy obrazie (lewy dolny róg sceny), nie w panelu; grubszy tor wyróżnika |
| W4 | **Dwa identyczne przełączniki jeden pod drugim** (Spoczynek/Sprint i Podstawowy/Rozszerzony), ten sam kształt i waga. W 3D powtórzone dodatkowo w pasku górnym | `04`, `02` | moment to główny przełącznik (pod sceną, kolor układu); poziom to mały przełącznik „Uczeń / Rozszerzony” w pasku górnym; w 3D jedno źródło sterowania |
| W5 | **„Sprint” znaczy na planszach różne rzeczy**: koniec 45 s pracy, koniec treningu (powłokowy), krok biegu (kostny), „po” (limfatyczny). Widać to tylko w drobnym przypisie | `04` | etykieta momentu wprost na przełączniku: „Koniec 45 s pracy”, „Po treningu”, „Krok biegu” (pole w danych planszy) |
| W6 | **Brak trybu „Co się zmieniło”.** Spoczynek i sprint różnią się nasyceniem całego obrazu; oko nie wie, co zmieniło się *najbardziej* | `01` | trzeci przycisk momentu: w kolorze tylko struktury z największą zmianą, reszta wygaszona |
| W7 | **Brak sprawdzenia wiedzy.** Przy priorytecie „nauka licealistów” nie ma ani jednego pytania | — | „Sprawdź się”: 1 pytanie ↑/↓ na planszę („przewidź, zanim zobaczysz”, g≈0,5) z odpowiedzią z faktu planszy |
| W8 | **Skróty bez rozwinięcia w poziomie podstawowym:** „t.”, „ż.”, „VO₂max”, „NK”, „ADH”, „GFR” | `01`, `04` | w poziomie „Uczeń”: pełne słowa („tętnica”, „żyła”), skrót tylko z rozwinięciem przy pierwszym użyciu; słowniczek jako dymek przy terminie |
| W9 | **Nazwy w menu i tytule się różnią:** „Moczowy” / „Układ moczowy (wydalniczy)”, „Powłokowy” / „Skóra (układ powłokowy)”, „Hormonalny” / „Układ dokrewny (hormonalny)” | `01` | jedna nazwa szkolna w obu miejscach (ustalić z podstawą programową) |

### Kosmetyczne

| # | Problem | Naprawa |
|---|---|---|
| C1 | Tło płaskie, ciało „na kartce” (oba tryby) | scena-studio: gradient `#13203A → #070B14` i miękki podest pod stopami (bez nowych renderów) |
| C2 | Tytuł widoku („WIDOK Z PRZODU”) pod obrazem jest mało widoczny; skala nieznana | chip skali w lewym górnym rogu sceny |
| C3 | Kostny w kolorze `#A17D2B` (musztarda) wygląda jak „wyróżnienie”, a nie jak kość | wyróżnik „Konstrukcja” daje kontur techniczny w bieli; sam kolor zostaje (walidator ΔE, decyzja integratora) |
| C4 | Przycisk sprintu na jasnych kolorach układu (pokarmowy, powłokowy): sprawdzić kontrast tekstu | `onColor` z `palette.json` jest; potwierdzić 4,5:1 pomiarem |
| C5 | Moczowy 3D: ziarnisty wzór półprzezroczystej sylwetki (znane z audytu E3-K3) | zostaje w zadaniach Wizualizatora |
| C6 | Pierwsze otwarcie 3D bywa wolne: w moim przebiegu limfatyczny nie zdążył w 7 s (headless), przy dłuższym oczekiwaniu działa | zmierzyć na zwykłym Chrome; jeśli > 3 s, dodać pasek postępu z „Wczytywanie modelu (x MB)” |
| C7 | „← Podróż filmowa” w rogu to jedyny most do filmu | „Zobacz w filmie” przy podpisie (plan Reżysera §4.7) |

---

## 3. Wspólny sznyt i wyróżnik

### 3.1 Wspólna rama (taka sama na 12 planszach, w 2D i 3D, w gablotach narządów)

Patrz `po/klatka_*.jpg`: cztery klatki mają identyczną ramę.

1. **Pasek górny:** okruszki „Atlas › grupa › układ”, **cel lekcji jednym zdaniem**, przełącznik poziomu „Uczeń | Rozszerzony” (mały).
2. **Scena-studio:** gradient, podest i chip skali; w zbliżeniach także **lokalizator** (mini-sylwetka z prostokątem kadru).
3. **Przełącznik momentu pod sceną:** `Spoczynek | <nazwany moment> | Co się zmieniło`, w kolorze układu. W 3D ten sam element, w tym samym miejscu.
4. **„Jak czytać”** (legenda wyróżnika) w lewym dolnym rogu sceny: 2–3 symbole z opisem.
5. **Panel, zawsze w tej kolejności:**
   1. pytanie planszy;
   2. **liczba-bohater** (spoczynek → moment, „×N”, kiedy zmierzono, plakietka dowodu słowem);
   3. opcjonalna miara wyróżnika (np. pasek „gdzie idzie krew”);
   4. opis ≤ 3 zdania;
   5. „Sprawdź się” (1 pytanie);
   6. „▸ Więcej liczb i źródła · ▸ Co znaczy sprint · ▸ Zobacz w filmie”.
6. **Typografia bez zmian:** Figtree do zdań, JetBrains Mono do liczb i chipów, ≥ 14 px.
7. **Telefon:** tytuł i pytanie nad obrazem, scena, przełącznik momentu przyklejony u dołu, pod obrazem kolejno liczba-bohater, lista pinezek i „Sprawdź się”.

### 3.2 Wyróżnik: jedna idea z liceum na układ

Wyróżnik = **znak** (jak wygląda nakładka) + **jeden ruch** (co się animuje, tylko przy zmianie momentu albo na żądanie) + **jedna miara** (wskaźnik w panelu).
Kostny jest inny niż narządy (konstrukcja zamiast przepływu), a narządy różnią się między sobą (magazyn, filtr, ciepło). O to prosił użytkownik.

| Układ | Wyróżnik | Znak | Ruch | Miara | Idea z liceum |
|---|---|---|---|---|---|
| Mózg | **OBSZAR** | strefy płatów z obrysem, jedna w pełnym kolorze | zapalenie strefy przy podpisie | która część mózgu za co odpowiada | płaty i ich funkcje |
| Nerwowy | **IMPULS** | świecący punkt na torze nerwu, numerowane etapy 1–4 | punkt biegnie mózg → rdzeń → nerw → mięsień | kolejność (nie prędkość) | neuron, droga ruchowa, układ współczulny |
| Hormonalny | **NADAWCA → ODBIORCA** | gruczoł, krople hormonu w naczyniu, cel | krople płyną krwią do narządu docelowego | opóźnienie: sekundy vs minuty | gruczoł, hormon, narząd docelowy |
| Mięśniowy | **PRACA** | pasek rekrutacji włókien I → IIa → IIx; strzałka ciągnięcia | wypełnienie paska przy przejściu w sprint | ile włókien pracuje | typy włókien, antagonizm |
| Kostny | **KONSTRUKCJA** | rysunek techniczny: strzałka nacisku, osie stawów, wymiar, biały kontur | jedno „uderzenie” strzałki przy kroku | × masa ciała | dźwignia, staw, przebudowa kości |
| Oddechowy | **OBJĘTOŚĆ** | miernik objętości obok płuc, fala powietrza w tchawicy | fala wdechu i wydechu w tempie z faktu | litry na oddech, oddechy na minutę | wentylacja, wymiana gazowa |
| Krwionośny | **ROZDZIAŁ** | grube i cienkie strzałki, pasek „gdzie idzie krew” | strzałki płyną, grubość = udział krwi | % rzutu serca do mięśni | krążenie, redystrybucja krwi |
| Pokarmowy | **MAGAZYN** | wątroba jako zbiornik z poziomem, jelita przygaszone | strzałka glukozy z wątroby do krwi | poziom zapasu (3 stopnie, ilustracja) | glikogen, rola wątroby |
| Powłokowy | **CIEPŁO** | izolinie i strzałki ciepła, krople potu | strzałki ciepła wychodzą ze skóry | kierunek przepływu skórnego ↓/↑ | termoregulacja, pot |
| Moczowy | **FILTR** | nerka jako filtr: krew wchodzi, mocz wychodzi | przepływ przez filtr zwalnia w sprincie | przepływ nerkowy ↓ | nefron, filtracja, bilans wody |
| Limfatyczny | **PATROL** | węzły jako punkty kontrolne, kropki-komórki | kropki przechodzą z węzłów do krwi | ×N komórek NK we krwi | odporność, krążenie limfy |
| Rozrodczy | **DŁUGI CZAS** | oś tygodni zamiast sprintu; uczciwe „brak widocznej zmiany” | brak animacji sprintu (karta) | tygodnie, nie sekundy | hormony płciowe, adaptacja |

Zasady wyróżnika:
- **Jeden wyróżnik na planszę.** Nie wolno mieszać (np. impulsu na planszy krwionośnej). Łańcuchy przyczyn między układami to osobny tryb („Całość”).
- **Ruch tylko z powodu:** przy zmianie momentu (0,9 s), na żądanie („▶ pokaż”) albo w pętli dla strzałek przepływu. Przy `prefers-reduced-motion` wszystko jest statyczne.
- **Kolor nigdy nie jest jedynym nośnikiem:** każdy znak ma kształt (gruba/cienka, kropla, izolinia przerywana, numer etapu).
- **Bez nowych kształtów anatomicznych i bez liczb od AI.** Nakładki rysujemy na istniejących kotwicach i torach (`anchors3d`, `flows3d`). Wielkości (grubość, ×N) to reguły nad faktami `checked_agent`, a gdzie faktu brak, 3 stopnie jakościowe z dopiskiem „ilustracja”.
- Dane, których jeszcze nie ma: kotwice osi stawów (kostny), tory hormonów (hormonalny ma `flows3d`), tor impulsu (nerwowy ma `flows3d`), objętość oddechu (fakt na planszy oddechowej). Brakujące kotwice dopisuje agent układu w swoich plikach.

---

## 4. Spór z Wizualizatorem: wykonalność w 3D i ≥ 50 FPS na Intel UHD

**Stan:** runda 1 wysłana do Wizualizatora (`local_dc5e6e98-3d75-4195-b564-6b8a39eb661f`) 2026-11-26. Do chwili zatwierdzenia tego pliku **odpowiedź nie przyszła**.
Poniżej jest moje stanowisko, oparte na jego udokumentowanych pomiarach (`docs/atlas_audyt/wizualizator_E3_K3.md`, `docs/atlas_wizualizacja/`). Jego odpowiedź dopiszę drugim commitem (§4.3).

### 4.1 Co wiemy z pomiarów E3-K3

- Wszystkie 12 układów ma ≥ 50 FPS na UHD, ale **moczowy jest na granicy (50 FPS)**, oddechowy ma 56, a krwionośny 60 (po odcięciu nieużywanych trójkątów: 784 → 418 tys.).
- Materiał: jeden `MeshStandardMaterial` z łatką (stan w teksturze danych, ditheringowa półprzezroczystość), bez postprocesu.
- **Wniosek:** w 3D nie ma zapasu „na efekty” przy moczowym. Każdy wyróżnik 3D musi mieć budżet i plan awaryjny.

### 4.2 Moje stanowisko (do sporu)

| Element 3D | Propozycja | Koszt (mój szacunek, do zmierzenia) | Plan awaryjny |
|---|---|---|---|
| strzałki przepływu (W2) | tory `flows3d` jako jedna geometria linii lub wstęgi na układ; przesuwany wzór w shaderze; nieprzezroczyste, bez sortowania | 1 wywołanie rysowania, kilka tys. wierzchołków; pomijalne wobec 418 tys. trójkątów | nakładka 2D rzutowana z `anchors3d` na znanych ujęciach (widoki są stałe, więc rzut jest pewny) |
| impuls nerwowy, krople hormonu, kropki NK | punkty instancjonowane (≤ 200) wzdłuż toru, bez fizyki | 1 wywołanie rysowania | jak wyżej |
| konstrukcja kostna (strzałka nacisku, osie, wymiar) | linie i sprite'y w 3D tylko w widokach „przód” i „bok”; reszta to nakładka 2D | < 10 wywołań rysowania | sama nakładka 2D |
| objętość oddechu | **miernik obok modelu (HTML)**, nie skalowanie siatki płuc (to byłaby zmiana kształtu wymyślona przez AI) | 0 | — |
| ciepło skóry | izolinie jako linie wokół sylwetki (3 stopnie, ilustracja), **nie** gradient w shaderze po wysokości (pseudo-dane) | 1–3 wywołania rysowania | nakładka 2D |
| pulsowanie emisji `sin(uTime)` | **usunąć**; puls tylko na strukturze z podpisu w fokusie | ujemny (mniej pracy shadera) | — |
| postproces, bloom, cienie | **nie** | — | — |

Reguły budżetu, które proponuję wpisać do kontraktu 3D:
1. Każdy wyróżnik w 3D może kosztować **najwyżej 1 ms GPU na UHD przy 1440 px** (pomiar jak w E3-K3).
2. Jeśli układ spada poniżej 50 FPS, wyróżnik przechodzi na nakładkę 2D bez zgody kogokolwiek. To nie porażka, tylko zasada.
3. Półprzezroczyste nakładki 3D są zakazane (przemalowywanie wypełnień na UHD). Nakładki są nieprzezroczyste albo w HTML.

Pytania wysłane Wizualizatorowi: (a) koszt linii z shaderem, (b) punkty instancjonowane, (c) kostny 3D czy 2D, (d) miernik zamiast skalowania płuc, (e) izolinie zamiast gradientu, (f) usunięcie `sin(uTime)`, (g) wspólna rama jego gablot narządów: lokalizator i ten sam przełącznik momentu.

### 4.3 Odpowiedź Wizualizatora

*(do uzupełnienia po odpowiedzi; jeśli się nie zgodzi, rozstrzyga Dyrygent)*

---

## 5. Kolejność wdrożenia i szacunek czasu

Granice plików jak w modelu §5: integrator pisze wspólny kod, agent układu swoje pliki, Wizualizator `src/atlas3d/**`.
Nowy kontrakt (interfejs wyróżnika) ustala integrator, zanim agenci układów zaczną.

| Etap | Co | Kto | Pisze | Godziny agentów | Warunek wyjścia |
|---|---|---|---|---|---|
| **U0** szybkie zwycięstwa (krytyczne K1–K4, W4, W5, W8, W9) | kolejność panelu, protokół do „ⓘ”, ukrycie tekstów roboczych, nazwany moment, mały przełącznik poziomu, tytuł nad obrazem na telefonie, pasek układów z „więcej”, jednolite nazwy | integrator | `AtlasApp.tsx`, `AtlasPlate.tsx`, `types.ts` (pola `lessonGoalPl`, `questionPl`, `momentLabelPl`, `heroMetricId`) | **8–10** | zrzuty 12 × (1440, 390), konsola czysta |
| U0-treść | 12 × cel lekcji, pytanie planszy, wybór liczby-bohatera, opis ≤ 3 zdania z istniejących faktów, rozwinięcia skrótów | agent treści | `facts/<uklad>.json` (nowe pola tekstowe) | **6–8** | sprawdzenie nowych zdań przez osobnego agenta (§3.6): **3–4** |
| **U1** wspólna rama | scena-studio, chip skali, lokalizator, „Jak czytać”, „Co się zmieniło”, „Sprawdź się”, interfejs wyróżnika (`signature` w danych planszy) | integrator | wspólne pliki `src/atlas/**` | **12–16** | 1 plansza wzorcowa + zrzuty |
| **U2a** pilot wyróżników 2D (4 skrajnie różne: krwionośny, kostny, nerwowy, powłokowy) | nakładki SVG i legendy wg §3.2 | 1–2 agentów układów | `src/atlas/signatures/<uklad>.tsx` (nowe) + kotwice w swoich plikach | **10–12** | **audyt Dyrygenta + „test zmiennej”** |
| **U2b** pozostałe 8 wyróżników 2D | jak wyżej | 2–3 agentów (wg grup ról) | jak wyżej | **18–24** | jak wyżej |
| **U3** wyróżniki w 3D + spójność 2D/3D | strzałki `flows3d`, punkty, linie kostne, usunięcie `sin(uTime)`, wspólny przełącznik momentu i lokalizator w gablotach narządów | Wizualizator | `src/atlas3d/**` | **16–20** + pomiary FPS **4** | ≥ 50 FPS na UHD dla 12 układów, zrzuty 2D obok 3D |
| **U4** test z ludźmi | 2–3 licealistów, „pomyśl na głos”, 5 min na osobę; poprawki | użytkownik + agent UX | — | **4–6** | lista poprawek |

**Razem: ok. 80–110 godzin pracy agentów.** Przy 3–4 sesjach równolegle to ok. 3–4 dni kalendarzowe. Koszt pieniężny: 0 zł (tylko darmowe narzędzia).

Kolejność: **U0 → U1 → U2a → audyt → U2b ‖ U3 → U4.**
- U0 daje największy zysk przy najmniejszym koszcie: czytelność dla ucznia bez nowego kodu graficznego.
- U3 rusza po U2a, żeby 3D powtarzało znaczenie ustalone w 2D, a nie odwrotnie.
- Przewodnik „Jeden interwał” (`ATLAS_REZYSER_PLAN.md`) korzysta z tej samej ramy i wyróżników, więc jego koszt po U2 maleje.

---

## 6. Ryzyka

| Ryzyko | Zabezpieczenie |
|---|---|
| Wyróżnik staje się ozdobą | „test zmiennej” w audycie: każdy element nakładki musi wskazać zmienną albo fakt |
| Nowe zdania (cel, pytanie, opis ≤ 3 zdania) to nowa treść | ta sama bramka faktów co dziś (§3.6); skrót zdania sprawdzonego to też nowe zdanie do sprawdzenia |
| Moczowy w 3D na granicy 50 FPS | plan awaryjny „nakładka 2D” zapisany w kontrakcie |
| Kolizje plików | U0 i U1 robi tylko integrator; agenci układów dostają nowe pliki `signatures/<uklad>.tsx` |
| Uproszczenie do fałszu w poziomie „Uczeń” | zasada modelu §3.5: pominięcie szczegółu tak, zmiana faktu nie; metafory („chłodnica”, „magazyn”) oznaczone w danych jako metafora |
