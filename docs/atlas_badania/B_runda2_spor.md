# Badacz B, runda 2: spór z A i C, stanowisko po korekcie

Stan na 2026-11-25. Odnoszę się do `A_runda1_dane_i_wiedza.md`, `C_runda1_ux_narracja.md` i do faktu od koordynatora.
Ten fakt: Z-Anatomy ma **951 obiektów CURVE** (654 naczynia, 246 nerwów, oskrzela segmentowe, przewody, moczowody, a nawet `Jejunum`) oraz 1660 obiektów FONT.

## 1. Z czym się nie zgadzam

### C T2: „nigdy wolna kamera na starcie, obrót na szynie z 24–36 klatek”
Zgadzam się z domyślnym stanem (widoki kluczowe). Nie zgadzam się z dwoma wnioskami.

**(a) „Szyna” z gotowych klatek jest droższa niż GLB, a nie tańsza.**
Policzmy: 36 klatek × 2 stany × 12 układów × ok. 100 kB WebP (tyle mają dziś plansze) to ok. **86 MB**. Do tego każda zmiana podpisu albo stanu oznacza ponowny render wszystkiego.
GLB układu to w moim budżecie 6 MB na telefonie. „Szynę” robię więc w 3D: OrbitControls z zablokowanym kątem pionowym, obrót tylko w poziomie, przyciąganie do widoków przód, tył i bok oraz przycisk „wróć do widoku”.
Dydaktycznie to ta sama szyna, o którą prosi C, ale bez klatek. Dodatkowo daje płynne przejście między stanami.

**(b) Dowody C nie uzasadniają słowa „nigdy”.**
[Jang i in. 2017](https://www.tc.columbia.edu/faculty/jbb21/faculty-profile/files/JangVitaleBlack-Virtual-CAE.pdf) (*Computers & Education* 106) pokazali, że **samodzielne obracanie było lepsze od biernego oglądania** tych samych obrotów, także u części osób o niskiej zdolności przestrzennej.
[Stull, Hegarty i Mayer 2009](https://www.bohrium.com/paper-details/getting-a-handle-on-learning-anatomy-with-interactive-three-dimensional-graphics/811824570699874305-11152) (DOI 10.1037/a0016849) wskazują jako czynnik **punkty odniesienia orientacji**, a nie zakaz obrotu.
Wniosek: problemem jest dezorientacja, nie sam obrót. Na nią pomagają osie i znaczniki „przód/tył”, mini-sylwetka orientacji i ograniczone stopnie swobody. Na start: obrót tylko w poziomie. Wolna orbita jest od razu dostępna po jednym przełączniku, a nie dopiero w „trybie dla zaawansowanych”.

### C T5: „Całość” jako łańcuch, nie scena
Dydaktykę przyjmuję w całości (maks. 3 kolory, krok = jedno zdanie). Wniosek techniczny jest jednak odwrotny.
Łańcuch przyczyn **potrzebuje** jednej wspólnej sceny. Krok łańcucha to stan widoku: {zbiór widocznych ID, wyróżnione ≤ 3 układy, ujęcie kamery, aktywne krawędzie z grafu A (T16)}. Tak działają „rozdziały” i „trasy” w BioDigital i Visible Body.
W modelu 2D każdy krok to osobne rendery (6 łańcuchów × 6 kroków × 2 widoki = 72 obrazy, każdy do ponownego renderu po poprawce). W jednej scenie krok jest **wierszem danych**.
„Piękny zrzut ze wszystkimi układami” odrzucam razem z C. Ale scena to nie to samo co pokazanie wszystkiego naraz.

### C T7: podpisy w HTML na telefonie
Tu C ma rację i **przyjmuję tę tezę bez zastrzeżeń**. 6–8 px to błąd, który trzeba naprawić przed jakimkolwiek 3D.
Spieram się tylko o zakres. C proponuje to dla telefonu, a ja chcę HTML **wszędzie**, na desktopie też.
SVG zostaje wyłącznie na linie odnośników i strzałki przepływu. Wtedy ta sama nakładka obsłuży planszę 2D i widok 3D: kotwice rzutowane raz albo co klatkę, a pinezki, arkusz dolny i fokus działają tak samo. Jeden komponent zamiast dwóch.

### A T9: fazy `WorkoutPhaseId` jako klucz czasu danych
Zgadzam się, że dane muszą wiedzieć, *kiedy* zmierzono wartość. Nie zgadzam się z kluczem.
`WorkoutPhaseId` (`warmup`, `hiit_peak`, `hiit_repeat`, `cooldown`) opisuje **sesję** w głównej aplikacji. A używa go jako punktów **jednej serii** („`active_recovery` +1…3 min”). Te same nazwy dostałyby wtedy dwa znaczenia.
Kanonicznym kluczem ma być `tSecFromBoutStart`, które A sam proponuje, a faza jest tylko etykietą widoku.

Dla silnika najważniejsze jest co innego. Stan wizualny to **3 klatki kluczowe**: spoczynek, szczyt i odnowa (+2 min). Między nimi jest interpolacja w shaderze.
W 2D każda dodatkowa faza mnoży rendery (×views×układy). W 3D to tylko jeden wektor aktywności więcej. A ma tu niezamierzony argument za wariantem (b).

### A T10: Pulse offline
Nie spieram się o miejsce uruchamiania (nigdy w przeglądarce, tu się zgadzamy). Spieram się o **priorytet**.
A sam podaje, że Pulse nie przechodzi walidacji wysiłku (33 złe porównania) i nie ma GH, kortyzolu, ADH ani aldosteronu. Do tego trzeba go kompilować albo szukać wiązań Pythona, a użytkownik nie jest programistą.
Koszt jest pewny, a zysk tylko kontrolny. Odsuwam Pulse za etap 3D i za graf przyczynowy. Liczby z literatury (T12–T13 A) wystarczają.

### A T1–T6 a mój rejestr
Tu **A wygrywa w dwóch punktach** i zmieniam projekt (§2).
Spór zostaje o jedno: ile tożsamości jest w GPU. A chce `structureId` bez strony, a strona jest kwalifikatorem siatki.
Klik w 3D musi jednak wiedzieć, którą stronę podświetlić. Dlatego atrybut wierzchołka `_BINDING_ID` wskazuje **MeshBinding** (siatkę ze stroną), a nie Structure. Picking zwraca binding, a z niego wynika struktura i strona.
A dopuszcza scalanie siatek pod warunkiem zachowania mapy trójkąt → ID. Mój T3 robi dokładnie to. Spór 1 z listy A jest więc rozstrzygnięty: zgoda.

## 2. Co przyjmuję i jak to zmienia architekturę

1. **Od A T5/T6:** rezygnuję z `registry/<uklad>.json` jako źródła prawdy. Zamiast tego:
   - `structures.json` (globalny, układy to relacja wiele-do-wielu);
   - `mesh_bindings.json`: generowany automatycznie z inwentarza Blendera; ma `side`, `facet`, `license`, `source` i flagę `primary`, żeby nie było dwóch wątrób (spór 3 A).
   Żeby agenci układów się nie zderzali, każdy pisze tylko `overrides/<uklad>.json` (uzupełnienia, nazwy PL, wybór źródła), a skrypt scala je przy budowie. Plansza układu to zapytanie, a nie lista siatek.
2. **Od A T4:** fasety `.ol/.or/.el/.er` (455 obiektów) domyślnie **nie trafiają** do GLB. To nakładki przyczepów, więc tylko dublowałyby trójkąty.
3. **Od A (ryzyko 2) i mojego T9:** filtr licencji NC działa na `MeshBinding.license` przy budowie. Wspólna propozycja A i B.
4. **Od C T7:** jedna nakładka podpisów w HTML dla 2D i 3D (opisana wyżej). To pierwsza praca, jeszcze przed 3D.
5. **Od C T13:** kostny i rozrodczy jako karty bez stanów. Silnik to obsługuje: wektor aktywności ma wtedy jedną klatkę.
6. **Od koordynatora (951 krzywych):** zmieniam T6. Linie środkowe naczyń mamy gotowe w Z-Anatomy, więc **nie szkieletyzuję HuBMAP**. Każda krzywa idzie do eksportu dwa razy:
   - jako **rura** (`to_mesh` z kontrolowaną liczbą boków i przepróbkowaniem). Przy 654 naczyniach × ok. 50 segmentów × 6 boków × 2 trójkąty wychodzi ok. 390 tys. trójkątów, czyli za dużo na telefon. Stąd LOD0 = 6 boków na desktop, LOD1 = linie ekranowe (`Line2`) albo 3 boki;
   - jako **polilinia w `flows3d.json`**: tor strzałek krwi, powietrza (oskrzela), moczu (moczowody) i impulsu (nerwy).

   Kierunek krzywych w Z-Anatomy jest przypadkowy, więc kierunek przepływu jest polem danych do weryfikacji (A). Heurystyka „tętnica zaczyna się bliżej serca” jest tylko propozycją `auto`.
   Przy okazji: `Jejunum` istnieje jako krzywa, więc dokument `ATLAS_KOLEJNE_UKLADY.md` §4 („brak jelita czczego”) wymaga korekty (zadanie integratora).
   1660 obiektów FONT to napisy Z-Anatomy. Nigdy ich nie eksportujemy.

## 3. Stanowisko końcowe (tezy po korekcie)

**K1. Rekomendacja: wariant (b), hybryda.** Plansze 2D z podpisami HTML to domyślne wejście i szybka ścieżka dla 7 nowych układów. 3D to leniwy widok tego samego układu oraz silnik łańcuchów „Całość”. Wariant (c) odrzucam: przegrywa na telefonie i wyrzuca działającą fazę 1. Wariant (a) odrzucam: łańcuchy, przepływy i więcej niż dwa stany kosztują w nim wielokrotność renderów.

**K2. Tożsamość:** `Structure` (bez strony) + `MeshBinding` (strona, faseta, licencja, źródło, primary), generowane z Blendera, z nadpisaniami per układ. GPU zna tylko `_BINDING_ID`.

**K3. Czas:** dane są kluczowane `tSecFromBoutStart`. Wizualnie są 3 klatki kluczowe (spoczynek, szczyt, odnowa), przełącznik w UI pokazuje 2 lub 3. W 2D renderujemy tylko spoczynek i sprint.

**K4. Kamera:** start w widoku kluczowym, obrót tylko poziomy z przyciąganiem i znacznikami orientacji. Wolna orbita jest jednym przełącznikiem. Szyny z klatek nie robimy.

**K5. Krzywe Z-Anatomy** są podwójnym źródłem: geometria (rura lub linia zależnie od LOD) i tory przepływów. Krzywa w metrach rzutowana na planszę zastępuje dzisiejsze `AtlasFlow.points` w pikselach.

**K6. „Całość” = jedna scena + łańcuchy jako dane.** Krok łańcucha to {widoczne ID, ≤ 3 wyróżnione układy, ujęcie, krawędzie grafu A}.

**K7. Bramka budowania:** budżety (6/20 MB, 400 tys./1,5 mln trójkątów), blokada NC, każde ID w danych i treści, brak FONT i faset. AI działa tylko przy biurku autora (tu zgoda z A T14 i C T10).

**Kolejność etapów:**
- **E0:** nakładka podpisów HTML dla istniejących plansz + `palette.json` (naprawia 6 px na telefonie).
- **E1:** `structures` + `mesh_bindings` z inwentarza (z krzywymi).
- **E2:** 7 nowych układów jako plansze 2D na nowych danych, równolegle.
- **E3:** prototyp 3D jednego układu (krwionośny, bo testuje krzywe) + pomiar na prawdziwym telefonie.
- **E4:** łańcuchy „Całość” w 3D z grafu A.
- **E5:** 3D dla pozostałych układów, przekrój, ewentualnie Pulse jako kontrola.

## 4. Pytania rozstrzygające dla użytkownika

1. Kto jest odbiorcą: laik-sportowiec czy student AWF lub medycyny? Od tego zależy domyślna kamera (K4) i liczba struktur na ekranie.
2. Czy widok 3D **musi** działać na telefonie od pierwszej wersji, czy na start wystarczy desktop, a telefon dostaje plansze 2D?
3. Gdzie aplikacja będzie publicznie dostępna i czy zgadzasz się trzymać ok. 50 MB plików 3D poza zwykłą historią Gita (np. Git LFS albo osobny folder publikacji)?
