# Atlas układów: model teoretyczno-architektoniczny

Stan na 2026-11-25. Dokument syntezy, obok planu merytorycznego (`docs/ATLAS_KOLEJNE_UKLADY.md`, `docs/ATLAS_AGENT_BRIEFS_1B.md`).
Opisuje, **jak atlas ma być zbudowany od danych do ekranu**, tak żeby z dzisiejszych plansz 2D dało się dojść do pełnego atlasu 3D
podrasowanego AI bez wyrzucania pracy. To plan, nie kod.

## 0. Jak powstał

Trzech niezależnych badaczy (agenci Opus) przeszło przez dwie rundy:
1. Runda 1: każdy napisał własne stanowisko.
2. Runda 2: każdy przeczytał dwa pozostałe i je skrytykował.

Koordynator rozstrzygnął spory w §4. Pełne teksty, z linkami do źródeł, leżą w `docs/atlas_badania/`:

| Badacz | Działka | Runda 1 | Runda 2 |
|---|---|---|---|
| A | anatomia, ontologie, fizjologia danych, dowody | `A_runda1_dane_i_wiedza.md` | `A_runda2_spor.md` |
| B | render, zasoby, silnik 3D, atlasy komercyjne i otwarte | `B_runda1_architektura_3d.md` | `B_runda2_spor.md` |
| C | UX, dydaktyka, narracja, AI, dostępność | `C_runda1_ux_narracja.md` | `C_runda2_spor.md` |

Ograniczenie: darmowy limit Exa skończył się szybko, więc badacze szukali też przez WebSearch/WebFetch.
Liczby poligonów atlasów komercyjnych nie są publiczne i nikt ich nie zgadywał.

---

## 1. Czego uczą amerykańskie atlasy 3D i otwarte repozytoria

**Rynek (BioDigital Human, Zygote Body, Visible Body, Primal Pictures, Anatomage; dla porównania Complete Anatomy i Kenhub):**
- **Wspólna abstrakcja:** struktura ma stabilne ID powiązane z ontologią (BioDigital: `fmaId`). Widok to funkcja zbiorów ID
  (widoczne, wybrane, wyróżnione, w „rentgenie”). Nikt nie steruje sceną nazwami siatek.
- **Przewaga to potok treści, nie silnik.** BioDigital wprost przypisuje ją własnym narzędziom przygotowania modeli.
  Naszym odpowiednikiem jest Blender + gltf-transform.
- **Primal Pictures** opiera „3D” na sekwencjach wyrenderowanych klatek i warstwach. To dowód, że atlas oparty na renderach jest pełnoprawnym atlasem.
  Wykładowcy oceniają go najwyżej za szczegółowość, a studenci najniżej za łatwość obsługi.
- **Wszystkie te atlasy to narzędzia referencyjne dla studentów medycyny.** Bez prowadzenia przytłaczają (Aland i in. 2023).
  BioDigital w 2023 r. schował część narzędzi, bo zaśmiecały ekran.
- **Warte przeniesienia:**
  - izolacja i wygaszanie kontekstu (już mamy)
  - zapisane trasy (tours)
  - jawne poziomy złożoności (Anatomage)
  - jeden suwak krycia warstw (Zygote)
  - wymowa nazw
- **Nie warte przeniesienia:** drzewo 3000 struktur, AR, quizy z łaciny, rysowanie.

**Otwarte projekty:**

| Projekt | Co przejmujemy |
|---|---|
| HuBMAP HRA | wspólna rama współrzędnych, SOP zatwierdzania modelu, oficjalna tabela GLB ↔ Uberon/FMA |
| Open Anatomy Browser (SPL/Harvard) | rozdział geometrii, tożsamości, stylu i tekstu; atlas jako pliki statyczne |
| BodyParts3D | jedna siatka = jedno ID FMA. Licencja zmieniła się na **CC BY 4.0** (do sprawdzenia prawnie, czy coś to daje) |
| „3D Anatomy Atlas” (svitylo, three.js) | punkt odniesienia skali: ok. 4450 struktur i 3 mln trójkątów mieszczą się w **21–55 MB** po meshopt i kwantyzacji, ładowane kawałkami |
| human-atlas (ashemag) | parametry upraszczania siatek |

**Silniki fizjologii:**
- **Pulse (Kitware, Apache 2.0)** ma wysiłek, ale sam przyznaje, że przy wysiłku część walidacji wypada źle (76 dobrych, 3 średnie, 33 złe).
  Z hormonów modeluje tylko adrenalinę, noradrenalinę i insulinę.
- **BioGears** to przodek Pulse. **HumMod** działa tylko na Windows i ma niejasną licencję. Oba odpadają.

---

## 2. Zasady nadrzędne (zgoda wszystkich trzech)

1. **Jednostką treści jest zdarzenie sprintu, nie układ.** Użytkownik pyta „co dzieje się w ciele, gdy przyspieszam”. Menu układów to indeks.
2. **Struktura to nie siatka.** Wiedza (struktury, fakty, związki) żyje niezależnie od geometrii i renderu.
3. **Każda liczba to fakt z czasem pomiaru, źródłem i poziomem dowodów.** Liczba bez „kiedy” jest myląca:
   mleczan szczytuje minuty po serii, hormon wzrostu po 10–30 min, a tętno w sekundy.
4. **AI pracuje przy biurku autora, nie u użytkownika.** Generuje szkice tylko z zatwierdzonych faktów, a automat to sprawdza.
   W aplikacji nie ma czatu generatywnego (badania z 2026 r.: 61% odpowiedzi zdrowotnych z halucynacjami, do 97% zmyślonych źródeł).
5. **AI nie tworzy kształtów anatomicznych ani liczb.** Wolno jej to, co da się automatycznie sprawdzić z danymi źródłowymi:
   - kod potoku
   - wizualna kontrola renderów i podpisów
   - propozycje dopasowania modeli
   - szkice tekstu
6. **Kolor nigdy nie jest jedynym nośnikiem informacji** (WCAG 1.4.1). Układ ma kolor, ikonę i nazwę, a poziom dowodów ma tekst.
7. **Telefon jest pełnoprawny.** Dziś podpisy mają tam 6–8 px. To usterka do naprawy przed nowymi układami.
8. **Licencje pilnuje skrypt, nie pamięć agenta.**
   - Struktury NC (nerka i ucho wewnętrzne Z-Anatomy) są blokowane przy budowie.
   - Pliki BY-SA (Z-Anatomy) i BY (HuBMAP) nie są scalane w jeden plik.

---

## 3. Model warstwowy

```
L0  ŹRÓDŁA            atlas_raw/ (poza Gitem)
                      Z-Anatomy .blend (CC BY-SA; 4569 siatek + 951 krzywych) · HuBMAP GLB (CC BY) · PDB (domena publiczna)
                            │  tylko odczyt
L1  KANON WIEDZY      src/atlas/data/ (JSON w repo, walidowany testem)
                      structures.json     pojęcia: id, PL/LA/EN, TA2/FMA/Uberon/Wikidata, układy (wiele-do-wielu), glyph
                      mesh_bindings.json  siatki: źródło, nazwa obiektu, strona L/R/mid, faseta, licencja, primary → structureId
                      facts/<uklad>.json  fakty: zmienna/struktura, wartość, jednostka, KIEDY (tSec od startu serii + faza),
                                          populacja, protokół, źródło + lokalizator, poziom dowodów, pochodzenie, status, cytat
                      graph.json          graf przyczyn: od → do, typ sygnału, znak, opóźnienie, factIds
                      chains.json         łańcuchy „Całość” i kroki przewodnika (ścieżki w grafie)
                      palette.json        kolory i ikony układów (jedno źródło dla Pythona i TS)
                            │  jeden przebieg Blendera na układ
L2  WYPIEKI           generowane, nigdy nie edytowane ręcznie
                      public/atlas/<uklad>/   rendery WebP (spoczynek, sprint), anchors.json, flows3d rzutowane do 2D
                      public/atlas3d/<uklad>/ GLB (meshopt + kwantyzacja, _BINDING_ID w wierzchołkach, LOD0/LOD1),
                                              anchors3d.json, flows3d.json (krzywe w metrach), manifest.json
                            │  bramka: budżety, brak NC, każde ID w danych i treści, ΔE kolorów
L3  SILNIKI           2D: AtlasPlate (render + SVG linii) + nakładka podpisów HTML (≥ 14 px, fokus, dotyk)
                      3D: osobny leniwy fragment, R3F 8, scalone siatki, stan w teksturze danych, wybór przez ID
                      wspólny stan: system, moment, wybrane, ukryte, krok łańcucha; adres = stan (#atlas/<uklad>/<moment>/<krok>)
L4  TREŚĆ I NARRACJA  plates/<uklad>.ts (podpisy, wybór faktów do pokazania), zdania narracji z factIds,
                      drabina sformułowań dowodów, teksty „do czytania” dla lektora
L5  DOŚWIADCZENIE     Przewodnik „Jeden interwał” · Plansze układów · Łańcuchy „Całość” · „Zapytaj atlas” (wyszukiwarka faktów)
```

### 3.1 Dane (L1)

Szkic typów jest w `A_runda1_dane_i_wiedza.md` §2. Po sporze obowiązują te zmiany:
- **ID pojęcia** to własny klucz bez źródła i bez strony (np. `rectus_femoris`).
  ID siatki to `za:Rectus femoris.r` albo `hra:VH_M_Kidney_L`. Karta graficzna zna tylko ID siatki (`_BINDING_ID`),
  bo kliknięcie musi wiedzieć, którą stronę podświetlić.
- **Pliki są globalne, nie per układ**, bo trzustka, grasica i przepona należą do kilku układów.
  Agent układu pisze tylko `overrides/<uklad>.json`, a skrypt scala całość przy budowie.
- **Mapowanie do ontologii:**
  - 74% nazw Z-Anatomy pasuje wprost do `TA2.csv`;
  - FMA i Uberon przez Wikidatę, która daje też polskie nazwy (jakość nierówna, więc z flagą);
  - reszta to ręczna tabela wyjątków (kręgi, zęby, żebra numerowane).
- **Grupy drobnych struktur** (np. węzły chłonne) mają jedno ID grupy. FMA ma takie klasy zbiorcze.
- **Czas:** kluczem jest `tSecFromBoutStart`, a faza (`WorkoutPhaseId`) służy tylko jako etykieta.
  Ekran pokazuje 2 albo 3 momenty, a przy każdej liczbie stoi, kiedy ją zmierzono.
- **Statusy faktu:** `draft` → `checked_agent` (drugi agent znalazł **dosłowny cytat** ze źródła) → `checked_human` (opcjonalnie).
  Słowo „verified” bez człowieka byłoby fikcją.
- **Pola obowiązkowe:** 8. Populacja i protokół są wymagane tylko przy liczbach.
- **Pochodzenie liczby** (`primary_study`, `meta_analysis`, `textbook_consensus`, `model_simulation`) to osobna oś w danych.
  Ekran pokazuje jedną plakietkę.
- **Wartości wizualne** (jasność struktury w sprincie, prędkość strzałki, krotność „×N”) to **reguły nad faktami, nie fakty**:
  - albo są wyliczone z faktów o wspólnym źródle i protokole,
  - albo mają trzy jakościowe stopnie oznaczone jako ilustracja.

  Wartość „aktywność 0–1 ze źródłem” nie istnieje w literaturze.

### 3.2 Wypieki (L2)

- **Jeden przebieg Blendera daje naraz plansze 2D i GLB 3D** tego samego układu, z tymi samymi ID i kotwicami.
- **Krzywe Z-Anatomy** (naczynia, nerwy, przewody) służą podwójnie:
  - jako geometria: rura na desktopie, cienka linia na telefonie (654 naczynia jako rury to ok. 390 tys. trójkątów, za dużo na telefon);
  - jako tory strzałek przepływu w metrach.

  Kierunek przepływu trzeba sprawdzić, bo kierunek krzywych w Z-Anatomy jest przypadkowy.
- **Strzałki** to krzywe 3D w metrach, rzutowane na planszę 2D tym samym rzutowaniem co kotwice.
  Dzisiejsze `AtlasFlow.points` w pikselach to ślepa uliczka.
- **GLB nie zawierają:** obiektów FONT (1660 napisów) ani faset przyczepów mięśni (455).
- **Format:** `EXT_meshopt_compression` + `KHR_mesh_quantization`, bez Draco. KTX2 tylko wtedy, gdy pojawią się tekstury (styl ich nie przewiduje).
- **Budżety (do zmierzenia na prototypie):**

  | Urządzenie | Pobranie na układ | Trójkąty | Wywołania rysowania | Pamięć GPU |
  |---|---|---|---|---|
  | telefon | ≤ 6 MB | ≤ 400 tys. | ≤ 50 | ≤ 150 MB |
  | desktop | ≤ 20 MB | ≤ 1,5 mln | ≤ 200 | ≤ 600 MB |

### 3.3 Silniki (L3)

- **2D zostaje domyślnym wejściem.** Najpierw dostaje nakładkę podpisów HTML (E0).
- **3D to leniwy fragment, bez przejścia na React 19** (R3F 9 wymaga Reacta 19, a 12 aktów stoi na R3F 8).
  - **Geometria:** scalone siatki (układ × kawałek × rola) z ID w każdym wierzchołku.
  - **Stan:** spoczynek/sprint, wygaszanie i wybór to tekstura danych, więc zmiana stanu to zapis kilku tekseli.
  - **Wybór:** przez bufor ID.
  - **Przekrój (później, opcjonalny):** płaszczyzna tnąca i kolorowanie tylnych ścianek, bez stencila, bo siatki Z-Anatomy nie są szczelne.
- **Kamera:**
  - start w widoku kluczowym (przód, tył, bok jak na planszach);
  - obrót tylko poziomy (wokół osi ciała), z przyciąganiem do widoków i znacznikami orientacji;
  - przybliżenie do zbliżeń (`detail`) przez gotowe ujęcia, nie przez dowolny zoom;
  - **wolna orbita i zdejmowanie warstw jak w BioDigital nie są celem** (decyzja użytkownika z 2026-11-25, §7).
- **Kolory 2D i 3D to ta sama funkcja** (`REST_MIX` z `atlas_lib`), czytana z `palette.json`.

### 3.4 Doświadczenie (L5)

```
#atlas
 ├─ PRZEWODNIK „Jeden interwał” (pierwsze wejście; ok. 90 s, 6–8 kroków; „Pomiń, chcę sam” zawsze widoczne)
 │    kolejność kroków wynika z opóźnień w grafie przyczyn, nie z intuicji, np.:
 │    start ruchu (mózg → nerwy → mięśnie) → tętno rośnie, bo słabnie hamowanie nerwu błędnego →
 │    redystrybucja krwi (mięśnie ↑, jelita i nerki ↓; skóra najpierw ↓) → koniec serii: szczyt adrenaliny →
 │    po serii: mleczan → wątroba (cykl Cori), pot i przepływ skórny ↑, tętno wraca
 ├─ PLANSZE UKŁADÓW (indeks w 4 grupach ról: Sterowanie · Napęd · Zaopatrzenie · Równowaga, plus „Inne”)
 │    przełącznik: Spoczynek | Sprint (| 2–3 min po, tam, gdzie dane to uzasadniają) | Co się zmieniło
 │    każdy podpis: „powiązane” (inne ogniwa łańcucha), „Zobacz w filmie” (akt i moment)
 ├─ ŁAŃCUCHY „Całość” (4–6 gotowych ścieżek w grafie, najwyżej 3 kolory naraz)
 └─ ZAPYTAJ ATLAS (wyszukiwarka po sprawdzonych faktach i gotowych odpowiedziach, bez generowania)
```

- **Dydaktyka:** „przewidź, zanim zobaczysz” (jedno pytanie ↑/↓ przed przełączeniem na sprint) zamiast quizów z nazw.
  Ćwiczenie przypominania ma solidny efekt (ok. g=0,5).
- **Limity ekranu:** 6–10 podpisów i najwyżej 4 liczby na planszy. Reszta trafia do „więcej” (pole `displayPriority`).
- **Animacja tylko dla samej zmiany:** strzałki przepływu i przenikanie stanów. Bez przelotów kamery i ozdobnego świecenia.
  Animacje dekoracyjne mają efekt d≈−0,05.
- **Lektor:** nagrany wcześniej i odsłuchany przez człowieka, napisy na żądanie, osobny tekst „do czytania” dla łaciny i skrótów.
  - Piper ma polskie głosy, ale licencję trzeba sprawdzić dla każdego głosu (część pochodzi z nagrań niekomercyjnych).
  - Kokoro nie ma polskiego, a XTTS-v2 ma licencję niekomercyjną.
  - Obecne głosy Microsoftu: do wyjaśnienia, czy wolno je rozpowszechniać.
- **Poziom dowodów słychać w języku.** Stała drabina sformułowań, po 2–3 warianty na poziom:

  | Poziom | Przykładowe sformułowanie |
  |---|---|
  | `established_human` | „U ludzi dobrze wiadomo, że…” |
  | `probable_human` | „Najpewniej…” |
  | `preliminary_human` | „Pierwsze badania sugerują…” |
  | `animal_model` | „U zwierząt zaobserwowano…; u ludzi tego nie wiemy” |
  | `contested_debate` | „Naukowcy się spierają, czy…” |

  Walidator odrzuca zdanie, w którym fraza nie zgadza się z poziomem.
- **Zakres skali:** atlas obejmuje poziom ciała i narządu. Komórki i cząsteczki są w 12 aktach filmu, do których atlas linkuje.
  Zbliżenia PDB zostają dodatkiem, nie osobnym poziomem atlasu.
- **Nazwy na ekranie:** „Układ moczowy” i „Układ dokrewny (hormonalny)”. Identyfikatory w kodzie się nie zmieniają.

### 3.5 Odbiorcy i dwa poziomy złożoności (decyzja użytkownika z 2026-11-25)

**Odbiorcy:** laicy i uczniowie liceum, z dodatkami dla studentów (AWF, medycyna, biologia).
Atlas ma więc **dwa poziomy**, przełączane jednym przyciskiem i zapamiętywane. Wzorem są jawne poziomy złożoności Anatomage.

| | **Podstawowy** (domyślny: laik, licealista) | **Rozszerzony** („dla studentów”) |
|---|---|---|
| Nazwy | polskie, szkolne; łacina ukryta | polska + łacińska (TA2), w razie potrzeby angielska |
| Podpisy | 6–10 na planszę (`tier: 'primary'`) | dodatkowe podpisy (`tier: 'secondary'`/`'student'`), do ok. 20 |
| Liczby | najwyżej 4, zaokrąglone, z krotnością „×N” i momentem pomiaru | wszystkie fakty z zakresami, populacją, protokołem i źródłem ze stroną lub tabelą |
| Dowody | plakietka + zdanie z drabiny sformułowań | to samo + pełny opis źródła i pochodzenia liczby (badanie, metaanaliza, podręcznik) |
| Język | krótkie zdania, bez skrótów lub z ich rozwinięciem | terminy fachowe (VO₂max, GFR, cykl Cori) z krótką definicją |
| Interakcja | przewodnik „Jeden interwał”, przełącznik stanów, „przewidź, zanim zobaczysz” | do tego wyszukiwarka struktur, więcej ujęć kluczowych (np. skosy, góra) i (później) przekrój |
| Zbliżenia | ciało i narząd | do tego zbliżenia tkankowe i molekularne (PDB) oraz linki do aktów filmu |

Zasady:
- **Ten sam render, inna gęstość treści.** Poziom nie mnoży renderów, tylko filtruje podpisy i fakty (pole `displayPriority` / `tier`).
- **Zgodność ze szkołą.** Nazwy i podział układów w poziomie podstawowym trzymają się podstawy programowej biologii dla liceum.
  Przykład: „Układ moczowy (wydalniczy)”, „Układ dokrewny (hormonalny)”. Agent treści sprawdza nazewnictwo z podręcznikiem szkolnym.
- **Poziom podstawowy nie upraszcza do fałszu.** Uproszczenie to pominięcie szczegółu, nigdy zmiana faktu. Metafory mają oznaczenie.
- **Rozszerzony to dodatek, nie osobna aplikacja.** Bez drzewa 3000 struktur i quizów z łaciny (zakres §1).
- **Wpływ na spory z §4:**
  - punkt 2: poziom rozszerzony dostaje więcej ujęć kluczowych, nie wolną orbitę (decyzja z §7);
  - punkt 3: przekrój wraca do planu jako dodatek dla studentów w E5;
  - punkt 10: karty kostna i rozrodcza mogą mieć w poziomie rozszerzonym więcej szczegółów anatomicznych.

### 3.6 Zatwierdzanie faktów (decyzja użytkownika z 2026-11-25)

Fakty sprawdza **drugi, niezależny agent** (nie ten, który je dopisał). Użytkownik nie przegląda arkusza.
Ponieważ nie ma człowieka-fizjologa, procedura musi być twarda i sprawdzalna automatem:

1. **Kto:** agent sprawdzający startuje w osobnej sesji i nie widzi uzasadnień autora, tylko fakt i źródło. Zmienia wyłącznie status i pole cytatu, nigdy wartości.
2. **Co musi znaleźć:**
   - **dosłowny cytat** (1–2 zdania, język oryginału) ze źródła, który zawiera liczbę albo twierdzenie;
   - **lokalizator** (strona, tabela, rysunek);
   - identyfikator źródła (PMID albo DOI), sprawdzony w PubMed lub Crossref.
3. **Wynik:**

   | Status | Kiedy |
   |---|---|
   | `checked_agent` | cytat, lokalizator i identyfikator się zgadzają, a wartość, jednostka, populacja i protokół pasują do cytatu |
   | `disputed` | coś się nie zgadza; fakt wraca do autora z opisem rozbieżności |
   | `unverifiable` | brak dostępu do pełnego tekstu i sam abstrakt nie wystarcza; fakt nie trafia na ekran |

4. **Na ekran trafiają tylko fakty `checked_agent`.** Dotyczy obu poziomów złożoności i narracji lektora.
5. **Automatyczna kontrola (walidator przy budowie):**
   - każdy fakt na ekranie ma status `checked_agent`, cytat i lokalizator;
   - liczba z faktu występuje w cytacie (dopuszczalne przeliczenie jednostek opisane w polu `conversionNote`);
   - zdania narracji mają `factIds` i frazę dowodu zgodną z drabiną (§3.4).
6. **Kontrola wyrywkowa:** co najmniej 10% faktów każdego układu sprawdza trzeci agent, wybrany losowo.
   Gdy rozbieżności przekroczą 1 na 10, sprawdza się ponownie cały układ.
7. **Uczciwość wobec użytkownika:** w poziomie rozszerzonym źródło ma dopisek „sprawdzone przez agenta AI z cytatem”, a nie „zweryfikowane przez eksperta”.
   Pole `checked_human` zostaje w schemacie na przyszłość (np. recenzja nauczyciela biologii).
8. **Liczby podręcznikowe** (`kenney_2022` bez badania pierwotnego) dostają pochodzenie `textbook_consensus`.
   Agent sprawdzający szuka do nich badania pierwotnego albo cytatu z podręcznika. Bez tego taka liczba nie dostaje statusu `checked_agent`.
9. **Fakty podręcznikowe z numerem ISBN** (decyzja użytkownika z 2026-11-26) są dopuszczone na ekran na tych samych zasadach co badania:
   - **źródło:** podręcznik lub opracowanie z numerem ISBN albo stałym identyfikatorem (np. OpenStax, StatPearls/NCBI Bookshelf z NBK lub PMID), podane z wydaniem, rozdziałem i stroną albo sekcją;
   - **cytat:** dosłowny, 1–2 zdania, sprawdzony przez drugiego, niezależnego agenta;
   - **pochodzenie** w danych: `textbook_consensus`; na ekranie dopisek „Wiedza podręcznikowa”;
   - **zastosowanie:** wartości spoczynkowe, budowa i rola struktur (np. mózg). Dla zmian w sprincie nadal pierwszeństwo mają badania (PMID/DOI); podręcznik wolno użyć tylko wtedy, gdy podaje wartość wprost i nie ma lepszego źródła.

### 3.7 Protokół wzorcowy (decyzja użytkownika z 2026-11-25)

**Kanon:**
- 6 interwałów × (45 s pracy przy ok. 88% VO₂max / 45 s przerwy);
- osoba wzorcowa: mężczyzna ok. 25 lat, rekreacyjnie aktywny;
- to ten sam protokół co w filmie (`DEFAULT_HIIT_CONFIG`), więc atlas i film opisują ten sam trening.

Skutki:
1. **Momenty na ekranie dostają konkretny czas:**

   | Moment | Kiedy |
   |---|---|
   | Spoczynek | przed treningiem |
   | Sprint | koniec 45 s pracy, najlepiej w późniejszym interwale, gdy wartości się ustaliły |
   | Po | 2–3 min po ostatnim interwale (tam, gdzie dane to uzasadniają) |

   Przewodnik „Jeden interwał” to dokładnie 90 s: 45 s pracy i 45 s przerwy.
2. **To wysiłek bardzo intensywny, ale submaksymalny, a nie sprint „all-out”.** Wiele klasycznych liczb pochodzi z 30 s testu Wingate albo sprintów maksymalnych.
   Przykłady: katecholaminy (Brooks 1988), hormon wzrostu (Stokes 2002), mleczan po seriach.
   Takie liczby mają flagę `protocolMismatch` i dopisek, z jakiego protokołu są:
   - w poziomie podstawowym: krótka uwaga, np. „w badaniu: 30 s sprint maksymalny”;
   - w poziomie rozszerzonym: pełny opis protokołu.
3. **Kolejność szukania źródeł:**
   1. badania interwałów o podobnej długości i intensywności (ok. 30–60 s przy 85–100% VO₂max);
   2. wysiłek przy ok. 85–90% VO₂max (np. przegląd Kenneya);
   3. sprint maksymalny, z flagą `protocolMismatch`.
4. **Liczby z obecnych pięciu plansz** sprawdzi agent faktów (§3.6) także pod tym kątem. Część dostanie flagę.
   Np. noradrenalina 2,2 → 13,4 nmol/L na planszy nerwowej pochodzi ze sprintu 30 s, więc jest wyższa niż przy 45 s pracy przy 88% VO₂max.
5. **Silnik filmu (`PhysiologyEngine`)** korzysta z tego samego protokołu, więc sprawdzone fakty mogą służyć wprost jako test jego wyników (§4, punkt 6).

---

## 4. Rozstrzygnięte spory

| # | Spór | A | B | C | **Rozstrzygnięcie** | Dlaczego |
|---|---|---|---|---|---|---|
| 1 | 2D czy 3D | dane niezależne od widoku | hybryda (b), 3D na żądanie | 2D, obrót z klatek, 3D po teście | **Hybryda (b) etapami:** 2D domyślnie, 3D jako prototyp jednego układu z pomiarem na telefonie i testem z 2–3 osobami, dopiero potem reszta | Szyna z klatek dla 12 układów to ok. 86 MB wobec ok. 6 MB GLB na układ. Dowody na korzyść z 3D są słabe, a obracanie szkodzi osobom o słabszej wyobraźni przestrzennej, więc start zawsze w widoku kluczowym |
| 2 | Wolna orbita | — | po przełączeniu | nigdy na start | **Start w widoku kluczowym, obrót poziomy z przyciąganiem. Bez wolnej orbity** (decyzja użytkownika) | Łączy dowody C (obracanie szkodzi części osób) z dowodami B (samodzielny obrót wygrywa z biernym oglądaniem) |
| 3 | Przekrój | — | później | wykreślić | **Poza planem do etapu E5, opcjonalny** | Żadne pytanie o sprint go nie wymaga |
| 4 | Dwa stany czy fazy | fazy + czas pomiaru | `tSec` + 3 klatki kluczowe | 3 momenty | **Dane: `tSecFromBoutStart`, a faza jako etykieta. Rendery 2D: nadal 2 stany. Liczby i przewodnik: 3 momenty, gdzie dane je mają** | Bez czasu pomiaru przewodnik byłby błędny (adrenalina szczytuje pod koniec serii, nie w 5–15 s; skóra na starcie zwęża naczynia) |
| 5 | Pulse | offline, kontrola spójności | na koniec | nie pokazywać liczb | **Tylko offline, nigdy na ekranie** | Słaba walidacja wysiłku, brak części hormonów |
| 6 | Źródło liczb dla filmu | fakty jako wyrocznia dla `PhysiologyEngine` | ciągły model w silniku filmu | — | **Fakty sprawdzają silnik filmu, nie odwrotnie** | `PhysiologyEngine` liczy z ręcznie dobranych stałych bez źródeł (odkrycie A w rundzie 2). Film i atlas powinny mieć jedno źródło prawdy |
| 7 | Rejestr struktur | globalny `structures` + `MeshBinding` | rejestr per układ | — | **Globalne pliki + nadpisania per układ** (B przyjął) | Struktury wspólne dla kilku układów |
| 8 | „Aktywność 0–1” | reguła, nie fakt | ze źródła | 3 stopnie | **Reguła albo 3 stopnie jakościowe, oznaczone jako ilustracja** | Takiej liczby nie ma w literaturze |
| 9 | Status „verified” | człowiek zatwierdza | — | `checked_agent` z cytatem | **`checked_agent` z dosłownym cytatem wystarcza do publikacji, `checked_human` opcjonalny** | Użytkownik nie jest fizjologiem. Statusy muszą mówić prawdę o tym, kto sprawdził |
| 10 | Typ treści 7 układów | plansze: hormonalny, pokarmowy, moczowy, limfatyczny; skóra w skali sesji; karty: kostny, rozrodczy | karty: kostny, rozrodczy | karty: kostny, rozrodczy, limfatyczny | **Wersja A** | Mobilizacja komórek NK w trakcie wysiłku jest dobrze zbadana, sporna jest tylko interpretacja spadku po wysiłku. Kostny dostaje liczbę obciążenia, a nie napis „brak zmiany” |
| 11 | Kolory | — | `palette.json` | ΔE przy daltonizmie, zmienić kostny lub powłokowy | **`palette.json` + walidator ΔE ≥ 15 dla par pokazywanych razem + ikony. Kolor kostnego do zmiany** | Przy deuteranopii mięśniowy, pokarmowy i tętnice są nierozróżnialne. Powłokowy i kostny są bliskie nawet przy normalnym widzeniu (ΔE 13) |
| 12 | Podpisy | — | nakładka HTML, także desktop | HTML, pinezki i lista na telefonie | **Nakładka HTML jako pierwsza praca (E0)** | Zgoda B i C. Dziś na telefonie 6 px |

---

## 5. Mapa drogowa (etapy)

| Etap | Co | Kto | Warunek przejścia dalej |
|---|---|---|---|
| **Faza 2** | Scalenie 5 gałęzi, wspólny kod z raportów (`ATLAS_AGENT_BRIEFS_1B.md` §1), rysowanie strzałek, krwionośny v2 z krzywymi Z-Anatomy | integrator (Opus extra) | build, zrzuty 1440/390, przegląd spójności |
| **E0** | Nakładka podpisów HTML (≥ 14 px, pinezki i lista na telefonie, fokus, dotyk), `palette.json` + walidator ΔE, ikony układów, poziom dowodów tekstem, `prefers-reduced-motion` | integrator, razem z fazą 2 albo zaraz po | plansze czytelne na 375 px |
| **E1** | `structures.json` + `mesh_bindings.json` z inwentarza (siatki + krzywe), mapowanie TA2/Wikidata, blokada NC, format faktów z czasem pomiaru, walidator danych; sprawdzenie liczb 5 gotowych plansz wg §3.6 | 1 agent danych + 1 agent sprawdzający (osobna sesja) | test przechodzi, 5 istniejących plansz przepięte na ID |
| **E2** | 7 nowych układów (faza 1b) na nowych danych: plansze albo karty wg §4 punkt 10 | 7 agentów (fale A i B) | jak w briefach 1b |
| **E2′** | Graf przyczyn + 4–6 łańcuchów + przewodnik „Jeden interwał” w 2D | agent treści + agent UX | test „pomyśl na głos” z 2–3 osobami |
| **E3** | Prototyp 3D na komputer: eksport GLB krwionośnego (sprawdza krzywe), silnik L3, pomiar budżetu desktopu. Pomiar na telefonie tylko informacyjnie | integrator silnika | budżet desktopu z §3.2 spełniony |
| **E4** | Łańcuchy „Całość” w scenie 3D | integrator + agent UX | test z ludźmi |
| **E5** | 3D dla pozostałych układów, ewentualnie przekrój, Pulse jako kontrola spójności, lektor | agenci układów | — |

Równolegle i niezależnie: przepięcie `PhysiologyEngine` filmu na sprawdzone fakty (A, §4 punkt 6). To osobne zadanie, dotyczy głównej aplikacji.

### Podział pracy agentów (granice plików)

| Rola | Pisze wyłącznie |
|---|---|
| Integrator (jeden, długowieczny) | `atlas_lib.py`, `atlas_export_glb.py`, `src/atlas3d/**`, `types.ts`, `AtlasPlate.tsx`, `AtlasApp.tsx`, `palette.json`, walidatory, schematy danych |
| Agent danych | `src/atlas/data/structures.json`, `mesh_bindings.json`, tabela wyjątków TA2 |
| Agent układu | `plate_<uklad>.py`, `overrides/<uklad>.json`, `facts/<uklad>.json`, `plates/<uklad>.ts`, `public/atlas*/<uklad>/**` (tylko przez skrypt) |
| Agent sprawdzający fakty | statusy `checked_agent` i cytaty w `facts/*.json` (bez zmiany wartości) |
| Agent QA wizualnego | tylko raporty poza repo |

Wspólne kontrakty (`types.ts`, schematy JSON, `manifest.json`) zmienia tylko integrator, podnosząc `schemaVersion`.
Blender: najwyżej 2–3 naraz, bo plik Z-Anatomy waży 307 MB, a karta ma 6 GB.

---

## 6. Ryzyka

1. **Dyscyplina faktów.** Bez roli sprawdzającej model „tylko sprawdzone fakty” zamieni się w ten sam problem, który ma rozwiązać.
2. **Dopasowanie HuBMAP ↔ Z-Anatomy.** To różni ludzie referencyjni. Dwie sesje dały dwie różne transformacje, a jedna sztywna macierz może nie wystarczyć.
3. **Dekymacja siatek Z-Anatomy.** Siatki są nieszczelne i nakładają się. Realnego współczynnika redukcji (zakładane 35% i 10%) bez dziur nie znamy.
4. **Telefony i Safari.** Budżety to szacunek do zmierzenia (E3).
5. **Licencje:**
   - `TA2.csv` (redystrybucja niejasna, same ID raczej bezpieczne)
   - głosy lektora
   - nerka i ucho NC
   - status BodyParts3D CC BY wobec poprawek Z-Anatomy
6. **Rozmiar repo.** Ok. 50 MB GLB przy każdym przewypieku spuchnie historię Gita. Potrzebna decyzja o LFS albo trzymaniu plików poza historią.
7. **Rozrost zakresu.** Test dla każdej funkcji: *czy pomaga zrozumieć, co robi sprint?* Jeśli nie, odpada.
8. **Dowody o 3D** dotyczą studentów medycyny i anatomii statycznej, nie laików i fizjologii wysiłku. Trzeba je przenosić ostrożnie.

---

## 7. Pytania do użytkownika (nie rozstrzygną ich dowody)

Wszyscy trzej badacze niezależnie wskazali te same decyzje:
1. **Odbiorca:** laik-sportowiec (ty i osoby ciekawe sprintu) czy student AWF lub medycyny?
   Od tego zależy, ile 3D i ile szczegółowej anatomii warto budować.
2. **Człowiek wzorcowy i protokół:**
   - mężczyzna ok. 25 lat, rekreacyjnie aktywny (zgodny z modelem 3D), czy od razu M i K?
   - 30 s „all-out” czy domyślny protokół aplikacji (45 s / 45 s przy 88% VO₂max)?
3. **Kto zatwierdza fakty:** wystarczy drugi agent z dosłownym cytatem, czy chcesz przeglądać arkusz (ok. 10 minut na układ)?
4. **Jakie 3D:**
   - czy obrót w poziomie z widokami kluczowymi spełnia marzenie o „atlasie 3D”, czy chodzi o swobodne zdejmowanie warstw jak w BioDigital?
   - czy 3D musi działać na telefonie od początku?
   - gdzie aplikacja będzie publicznie dostępna?

**Rozstrzygnięte 2026-11-25 (użytkownik):**
- Odbiorcy to **laicy i uczniowie liceum, z dodatkami dla studentów**. Skutki opisuje §3.5.
- Fakty zatwierdza **drugi agent z dosłownym cytatem** (status `checked_agent`). Użytkownik nie przegląda arkusza faktów.
  Zasady opisuje §3.6.
- 2026-11-26: dopuszczone są **fakty z podręczników z numerem ISBN** z dosłownym cytatem i drugim sprawdzającym, oznaczone „Wiedza podręcznikowa” (§3.6 pkt 9).
- Cel 3D: **obrót w poziomie + widoki kluczowe**, a nie swobodne 3D jak w BioDigital.
  - Technicznie: GLB z ograniczoną kamerą (§3.3), bo to ok. 6 MB na układ wobec ok. 86 MB dla sekwencji klatek.
    Jeśli prototyp E3 nie zmieści się w budżecie telefonu, telefon dostaje sekwencję klatek tylko dla „Całości”.
  - Wypada z planu: wolna orbita, suwaki zdejmowania warstw, dowolny zoom, wybieranie dowolnej z ok. 4500 struktur.
    Zostają: wygaszanie kontekstu, przełącznik stanów, podpisy, strzałki przepływu.
  - Prostszy silnik: ograniczona kamera zmniejsza koszt podpisów 3D (znane ujęcia pozwalają częściowo wypiec ich widoczność) i przekroju.

- Protokół wzorcowy to **protokół aplikacji**: `DEFAULT_HIIT_CONFIG` w `src/core/PhysiologyEngine.ts`, czyli 6 × (45 s pracy / 45 s przerwy)
  przy ok. 88% VO₂max, osoba rekreacyjnie aktywna. Skutki opisuje §3.7.

- 3D **najpierw na komputerze**:
  - telefon dostaje pełne plansze 2D z czytelnymi podpisami HTML (E0) i przewodnik;
  - przycisk 3D pokazuje się tylko na urządzeniach, które spełniają budżet desktopu (§3.2);
  - wersja 3D na telefon to osobny etap po E5, jeśli pomiary z E3 pokażą, że ma sens.

**Rozstrzygnięte 2026-11-26 (użytkownik, po obejrzeniu 3D „Gablota”):**
- (a) **Cel atlasu: przede wszystkim nauka licealistów.** Wątek HIIT zostaje jako przykład do nauki, a nie oś całego atlasu.
  Skutki:
  - treść i kolejność omawiania układają się wokół biologii w liceum, a sprint pokazuje, jak układ działa pod obciążeniem;
  - test z §6 pkt 7 („czy pomaga zrozumieć, co robi sprint?”) zastępuje pytanie: „czy pomaga licealiście zrozumieć budowę i działanie?”.
- (b) **Gabloty pojedynczych narządów:** serce, wątroba, mózg, nerka. Każda gablota daje:
  - interaktywne 3D z obrotem;
  - podświetlenie struktury po najechaniu;
  - omówienie budowy;
  - filmową animację działania.
  Plan przygotowuje Wizualizator: `docs/atlas_wizualizacja/NARZADY_PLAN.md`.
  Fakty w omówieniu przechodzą tę samą bramkę co plansze (§3.6, w tym „Wiedza podręcznikowa”).
- (c) **Posiedzenie nad UI i UX całego atlasu** pod kątem widoczności i zrozumienia, z „kropką nad i”: wspólny sznyt, a każdy układ z czymś wyróżniającym.
  Prowadzi Reżyser: `docs/atlas_rezyser/UX_POSIEDZENIE.md`.
  Oba plany ocenia Dyrygent i składa jedną kolejność wdrożenia. **Wdrożenie dopiero po zgodzie użytkownika.**
- (d) **Jakość animacji 3D na poziomie filmu.** Słowa użytkownika: „dość dopracowane animacje 3D, a nie te kreseczki”.
  - Przepływy są trójwymiarowe: krwinki i cząstki z kształtem i objętością, zorientowane wzdłuż toru, z prędkością zależną od przekroju.
  - Tkanki ruszają się przez odkształcenie prawdziwej geometrii (cele morph, przemieszczenie w shaderze).
  - Światło i materiał są na poziomie filmu. Strzałki zostają najwyżej jako legenda.
  - Przed kodem:
    - Reżyser przygotowuje **klatki docelowe** (poprzeczkę jakości);
    - Wizualizator robi **test techniczny jednego ujęcia** (skurcz serca z przepływem) z pomiarem FPS.
  - Konflikt jakości z FPS na Intel UHD rozwiązują **poziomy jakości** (pełny na mocnej karcie, uproszczony na słabej), a nie niższa poprzeczka dla wszystkich.
- (e) **Wspólna architektura z filmem „12 aktów”.**
  - Animacje, materiały, cząstki, oś czasu i ujęcia powstają jako wspólny moduł. Używają go atlas, gabloty i film (`src/director`, `SimulationCore`, `ShotChoreography`, `src/scenes/Act*`, modele GLB).
  - Najpierw przegląd tego, co film już ma: budujemy na tym, nie obok.
  - Każdy plan wskazuje, w którym akcie filmu wyląduje dany element. Film jest docelowym miejscem tych animacji.
- (f) **Szacunki:**
  - kamienie milowe z wynikiem do obejrzenia (zrzut, nagranie, pomiar) zamiast samych godzin;
  - po pierwszym kamieniu porównanie czasu szacowanego z rzeczywistym i przeliczenie reszty;
  - jawnie zaznaczona niepewność.
- (g) **Odpowiedzi na pytania o gabloty** (`NARZADY_PLAN.md` §9):
  1. Wejście **diegetyczne**: kliknięcie narządu w widoku układu w świecie 3D, kamera wjeżdża w narząd, a reszta ciała gaśnie. Bez menu i bez zwykłego przenikania ekranu. Podmianę modelu (Z-Anatomy na HuBMAP, różni osobnicy) ukrywa ruch kamery. Menu „Narządy” najwyżej jako dodatek.
  2. Zastawki: najpierw wariant A (kolor i cząstki). Wariant B (ruch płatków) może wejść wcześniej, jeśli test techniczny pokaże, że jest tani.
  3. Nefron: schemat topologiczny „bez skali”, wyraźnie oznaczony, jeśli nie ma otwartego modelu (CC0, BY lub BY-SA).
  4. Pierwsza wersja każdej gabloty: **tylko treści z poziomu Podstawowego**.
- (h) 2026-11-26: użytkownik zgodził się na **M2** (test techniczny serca w `prototypes/`) i **M3** (poprawki czytelności plansz, U0) według `docs/atlas_audyt/DECYZJA_UX_NARZADY.md`. Pytania 2–4 tej decyzji pozostają otwarte.
- (i) 2026-11-26, **bramka A:** użytkownik zgodził się na **M4–M6** („Tak, M4–M6”): wspólny moduł z filmem, serce wzorcowe z wejściem diegetycznym, rama i 4 wyróżniki 3D. Barwa ścian serca i mat filmu nie zostały wybrane, więc domyślne są rekomendacje zespołu („mięsień”, wygląd filmu bez zmian do nagrania przed i po w M4). Pytania o fakty podręcznikowe, telefon i test z licealistami pozostają otwarte.
- (j) 2026-11-26: użytkownik zgodził się na **wznowienie faktów podręcznikowych (E1-K3)** („Tak, wznów”), zgodnie z zasadami §3.6 pkt 9. Kolejność Dyrygenta:
  1. serce pod M5 (5 twierdzeń ze scenariusza Reżysera i panel „budowa i funkcja” w zakresie Podstawowym);
  2. 66 podpisów bez opisu roli (mózg 21, mięśniowy 19, nerwowy 14, oddechowy 8, skóra 4);
  3. nerka, wątroba, mózg pod M8.

  Wyszukuje i sprawdza dwóch niezależnych agentów Dyrygenta. Fakty do danych wpisuje integrator w osobnym commicie.

Dopóki nie ma pozostałych odpowiedzi, plan przyjmuje:
- mężczyzna ok. 25 lat, rekreacyjnie aktywny (zgodny z modelem 3D i z `fitnessLevel: 'recreational'`)
- GLB poza historią Gita
