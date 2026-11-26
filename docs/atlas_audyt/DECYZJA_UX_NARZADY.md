# Decyzja Dyrygenta: UI/UX atlasu i gabloty narządów (wspólna kolejność wdrożenia)

Data: 2026-11-26.

> **ZAWIESZONA (2026-11-26).** Doszły nowe wymagania użytkownika (d)–(g) z §7 modelu: jakość animacji na poziomie filmu, wspólny moduł z filmem „12 aktów”, kamienie milowe zamiast godzin oraz odpowiedzi o gablotach. Oba plany wracają do poprawki. Ta decyzja zostanie zastąpiona nową wersją po ocenie poprawionych planów, klatek docelowych i testu technicznego serca. Ustalenia z §2–§3 (wspólna rama, K4, poziomy według podstawy programowej, nerka, nefron) pozostają w mocy.

Podstawa:
- decyzje użytkownika (a)–(c) z §7 `ATLAS_MODEL_ARCHITEKTONICZNY.md`;
- plan Reżysera `docs/atlas_rezyser/UX_POSIEDZENIE.md` (`77dd298`);
- plan Wizualizatora `docs/atlas_wizualizacja/NARZADY_PLAN.md` (`bd9650c`, gałąź `claude/atlas-wizualizacja-3d-1dc29a`, jeszcze nie scalona);
- niezależne sprawdzenie Dyrygenta: podstawa programowa i licencje siatek (`side-session-notes/…/dyrygent/podstawy_oceny_narzadow.md`, `ocena_NARZADY_PLAN.md`).

**To jest plan.** Wdrożenie rusza dopiero po zgodzie użytkownika.

## 1. Werdykt

| Plan | Ocena | Warunki |
|---|---|---|
| Reżyser: UI/UX i karta stylu 12 układów | **przyjęty** | poprawki z §3 tej decyzji |
| Wizualizator: gabloty serca, nerki, wątroby i mózgu | **przyjęty** | poprawki poziomów treści i nerki (§3), wspólna rama z §2 |

Ocena według kryteriów:

| Kryterium | UX (Reżyser) | Gabloty (Wizualizator) |
|---|---|---|
| Biologia w liceum | rama „cel lekcji → pytanie → 1 liczba → Sprawdź się” odpowiada lekcji; wyróżniki przypisane do idei z liceum | struktura Podstawowy/Rozszerzony. Po poprawce zgodna z podstawą programową: automatyzm serca P V.4.9, tworzenie moczu P V.5.3, wątroba P V.2.7, mózg P V.7.5 |
| Zrozumiałość | trafna diagnoza: przypis protokołu przed celem, ściana tekstu, liczby pod zgięciem, telefon bez tytułu, teksty robocze | przekrój bez „eksplozji”, najechanie z przygaszeniem reszty, film krok po kroku; przekrój nerki na klatce nieczytelny (warunek K1) |
| Wydajność (≥ 50 FPS Intel UHD) | budżet 1 ms GPU na wyróżnik, automatyczny powrót do nakładki 2D, bez postprocesu | ≤ 4 MB, ≤ 400 tys. trójkątów makro + 60 tys. mikro; pomiar w N1-K1, zanim cokolwiek obiecamy |
| Licencje (bez NC) | bez nowych zasobów: nakładki na istniejących kotwicach | wyłącznie HuBMAP (CC BY 4.0), NeuroMorpho (CC BY 4.0), zrazik OrganUI (CC0); nerka Z-Anatomy (NC) wykluczona; nefron domyślnie jako własny schemat |
| Realny czas | 80–110 h | 75–105 h (z faktami) |

## 2. Rozstrzygnięte spory i wspólny język

1. **Gabloty narządów dostają wspólną ramę Reżysera.** Wspólne elementy:
   - okruszki i cel lekcji;
   - chip skali i lokalizator „gdzie w ciele”;
   - przełącznik momentu pod sceną;
   - „Jak czytać” w lewym dolnym rogu;
   - mały przełącznik poziomu w pasku górnym.

   Tryby gabloty („Zwiedzaj · Jak to działa · Sprawdź się”) to zakładki w nagłówku panelu bocznego, a nie drugi pasek pod sceną. Pod sceną jest tylko jeden przełącznik.
2. **Nazwa poziomu: „Podstawowy | Rozszerzony”**, a nie „Uczeń | Rozszerzony”. To słowa ze szkoły i z matury.
3. **Etykieta momentu pochodzi z danych.**
   - Na planszach: „Koniec 45 s pracy”, „Po treningu”, „Krok biegu” (W5).
   - W gablotach: „Spoczynek | Wysiłek”, dopóki fakt nie pozwoli na dokładniejszą nazwę.
4. **Kontrakt 3D** (stanowisko Reżysera §4.2, przyjęte):
   - wyróżnik kosztuje ≤ 1 ms GPU na UHD przy 1440 px;
   - poniżej 50 FPS wyróżnik sam przechodzi na nakładkę 2D;
   - półprzezroczyste nakładki 3D są zakazane.

   Pulsowanie `sin(uTime)` w widoku układów usuwamy, bo nie koduje żadnej zmiennej. Puls zostaje tylko na strukturze z podpisu w fokusie. Wizualizator może się odwołać, przynosząc pomiar z U3.
5. **Kamera gabloty** (przechylenie ±35°, zoom 0,6–2,5×) to wyjątek tylko dla gablot. Widok układów zostaje przy obrocie poziomym (§7).
6. **Kolory:** narząd w barwie swojego układu. Wyjątki dydaktyczne: krew natleniona czerwona i odtleniona niebieska (jamy serca według krwi, którą zawierają), żółć zielona, mocz złoty. Barwy dobiera Reżyser z palety, a walidator `check:atlas` sprawdza ΔE.

Jeśli Wizualizator nie zgodzi się z §2.4 po pomiarach, rozstrzyga Dyrygent na podstawie liczb.

## 3. Poprawki obowiązkowe przed wdrożeniem

1. **K4 (teksty robocze na ekranie): luka potwierdzona przez Dyrygenta.**
   - Na planszach hormonalnej, pokarmowej i powłokowej pole `protocolNotePl` ma status inny niż sprawdzony, więc `AtlasApp.tsx` pokazuje uczniowi zdanie „…opis czeka na sprawdzenie”.
   - Kontrola końcowa faktów (liczby, role, budowa, podsumowania) nie objęła tego pola. To błąd zakresu kontroli Dyrygenta.
   - Naprawa w U0:
     - (a) agent faktów sprawdza 3 opisy momentu (cytat i drugi sprawdzający);
     - (b) bramka nie pokazuje uczniowi żadnego zdania zastępczego dla autora;
     - (c) walidator obejmuje odtąd wszystkie pola tekstowe planszy, a nie tylko cztery rodzaje.
2. **Poziomy treści gablot według podstawy programowej:**
   - automatyzm serca (węzeł zatokowo-przedsionkowy, fala pobudzenia, w uproszczeniu) przechodzi do Podstawowego;
   - filtracja i resorpcja w ogólnym ujęciu przechodzą do Podstawowego;
   - odcinki nefronu i hormony zostają w Rozszerzonym.
3. **Nerka:** warunkiem K1 jest zrzut przekroju bez „labiryntu” (kolumny scalone z korą, zalanie przekroju).
4. **Nefron:** domyślnie własny schemat „bez skali”, jak w podręcznikach. Modele z Sketchfab i NIH 3D tylko po weryfikacji autora i licencji.
5. **Nowe zdania** (cel lekcji, pytanie planszy, opis ≤ 3 zdania, „Sprawdź się”, panele gablot) przechodzą bramkę §3.6. Skrót sprawdzonego zdania też jest nowym zdaniem.

## 4. Wspólna kolejność wdrożenia

Zasada: najpierw to, co najbardziej pomaga licealiście przy najmniejszym koszcie. Potem jedna plansza wzorcowa i jedna gablota wzorcowa. Potem **test z licealistami jako bramka**, a dopiero po nim rozwinięcie na całość.

| Faza | Co | Kto (pliki) | Godziny agentów | Warunek wyjścia |
|---|---|---|---|---|
| **F1** szybkie poprawki (równolegle) | U0: kolejność panelu, protokół do „ⓘ”, K4, nazwany moment, przełącznik poziomu, telefon (tytuł nad obrazem, pasek „więcej”), jednolite nazwy | integrator (`src/atlas/**`) | 8–10 | zrzuty 12 × (1440, 390), konsola czysta, `check:atlas` 0 |
| | U0-treść: 12 × cel lekcji, pytanie, liczba-bohater, opis ≤ 3 zdania; 3 opisy momentu (K4) | agent treści + sprawdzający (`facts/*.json`) | 10–13 | 0 tekstów niesprawdzonych na ekranie |
| | N1-K1: eksport serca (HuBMAP), `_ID`, licencje, **pomiar FPS i MB** | Wizualizator (`public/organs/**`, `scripts/`) | 3–4 | ≥ 50 FPS UHD, ≤ 4 MB |
| | fakty podręcznikowe serca (wznowienie E1-K3 w zakresie serca) | agent faktów + sprawdzający | 4–6 | panel serca z cytatami |
| **F2** rama i serce wzorcowe | U1: wspólna rama (scena-studio, chip skali, lokalizator, „Jak czytać”, „Co się zmieniło”, „Sprawdź się”, interfejs wyróżnika). Integrator **najpierw publikuje kontrakt ramy** (ok. 2 h), żeby Wizualizator nie czekał | integrator | 12–16 | 1 plansza wzorcowa + zrzuty |
| | N1-K2/K3: `OrganView` serca na ramie z U1 (przekrój, wybór, panel, Sprawdź się, Spoczynek/Wysiłek) i film cyklu serca (wariant zastawek A) | Wizualizator (`src/organs/**`) | 16–22 | ≥ 50 FPS, zrzuty, audyt Dyrygenta |
| **F3** pilot wyróżników | U2a: 4 wyróżniki 2D (krwionośny, kostny, nerwowy, powłokowy) | 1–2 agentów układów (`src/atlas/signatures/<uklad>.tsx`) | 10–12 | audyt Dyrygenta + „test zmiennej” |
| **Bramka** | **pokaz użytkownikowi + test z 2–3 licealistami** (U4 przeniesiony wcześniej): plansza wzorcowa, 4 wyróżniki, gablota serca | użytkownik + agent UX | 4–6 | lista poprawek; decyzja o F4 |
| **F4** rozwinięcie | U2b: 8 pozostałych wyróżników 2D | 2–3 agentów układów | 18–24 | audyt |
| | U3: wyróżniki w 3D widoku układów (strzałki `flows3d`, punkty, bez `sin(uTime)`) | Wizualizator (`src/atlas3d/**`) | 20–24 | ≥ 50 FPS dla 12 układów |
| | N2–N4: nerka, wątroba, mózg na wzorcu serca, wraz z faktami. Proponowany **drugi agent 3D**, bo `src/organs/**` i `src/atlas3d/**` są rozłączne, a jeden Wizualizator byłby wąskim gardłem | drugi agent 3D + agent faktów | 38–52 + fakty 12–18 | każda gablota: K1–K3 i audyt |

**Szacunek łączny:** ok. **155–210 godzin pracy agentów**. Wspólna rama i „Sprawdź się” oszczędzają kilka godzin na gablotach.

| Odcinek | Godziny agentów |
|---|---|
| F1–F3 i bramka | ok. 65–90 |
| F4 | ok. 90–120 |

Przy 3–4 sesjach równolegle:
- F1–F3: ok. 2–3 dni kalendarzowe;
- F4: ok. 3–4 dni.

**Koszt pieniężny: 0 zł.** Pobrania są darmowe i z oficjalnych źródeł: HuBMAP, NeuroMorpho, OrganUI.

Wąskie gardło: **agent faktów** (U0-treść, opisy momentu, panele 4 gablot, grupowanie obszarów mózgu). Dlatego pierwsza wersja gablot powstaje na poziomie Podstawowym.

## 5. Pytania do użytkownika

1. **Start:** czy ruszamy z F1–F3 (szybkie poprawki, wspólna rama, serce wzorcowe, 4 wyróżniki), a potem pokaz? (ok. 65–90 h pracy agentów)
2. **Fakty podręcznikowe:** czy wznowić ich sprawdzanie (wstrzymane przy 3D)? Bez nich gabloty nie mają opisu budowy. Rekomendacja: tak.
3. **Telefon:** czy licealiści mają mieć gabloty i 3D także na telefonie? Dziś 3D działa tylko na komputerze, a na telefonie są plansze 2D. Rekomendacja: gabloty na telefonie w lżejszej wersji po teście.
4. **Test:** czy możesz po F3 pokazać atlas 2–3 licealistom (ok. 5 minut na osobę, „mów na głos, co widzisz”)?
5. **Wejście do gablot:** osobne menu „Narządy” i skrót przez kliknięcie serca w widoku układu krwionośnego. Rekomendacja: oba.
6. **Zastawki serca:** w pierwszej wersji zmiana koloru i przepływ krwi, bez ruchu płatków. Ruch płatków później jako dodatek. Rekomendacja: tak.
7. **Nefron:** czy schemat „bez skali”, jak w podręczniku, jest w porządku? Rekomendacja: tak.
