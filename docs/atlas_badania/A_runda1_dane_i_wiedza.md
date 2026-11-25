# Badacz A, runda 1: model wiedzy i danych atlasu

Autor: Badacz A (anatom-ontolog, fizjolog danych). Stan: 2026-11-25. Dokument badawczy, bez kodu w repozytorium.
Wszystkie tezy są celowo ostre, żeby dało się je podważyć w rundzie 2.

## 0. Co sprawdziłem lokalnie (fakty, nie opinie)

- `za_inventory.json`: 2952 obiekty Z-Anatomy, ale tylko **1553 unikalne nazwy bazowe** po zdjęciu przyrostków.
  Przyrostki: `.l` 964, `.r` 965, brak 567, `.ol/.or` 269 (pola przyczepów w kolekcji `2: Muscular insertions`),
  `.el/.er` 186 (oraz numerowane fragmenty `.e12l` itp.), `.j` 1. Kolekcji jest 330; obiekt należy zwykle do kilku naraz
  (układ, narząd, region, unerwienie, np. mięsień piersiowy większy jest też w kolekcji „Lateral pectoral nerve”).
- `TA2.csv` (leży w `atlas_raw/z_anatomy/TA2.csv`, nie w `extracted/`): 7192 terminy z TA2ID, nazwą ang., łac. i 5 innymi językami.
  **Nie ma polskiego.** Proste dopasowanie nazw (małe litery, bez przyrostka) daje **1142 z 1553 (74%)** trafień po nazwie ang. lub łac.
  Nie trafiają m.in. kręgi („Vertebra T9”), zęby, żebra liczbowe („Fourth rib”), fragmenty przyczepów.
- Typy w aplikacji: `EvidenceLevel` ma 5 poziomów, `WorkoutPhaseId` ma już 6 faz (`rest`, `warmup`, `hiit_peak`,
  `active_recovery`, `hiit_repeat`, `cooldown`), a `TemporalHorizon` ma 5 horyzontów. Atlas (`src/atlas/types.ts`) ich nie używa:
  ma własne `AtlasState = 'rest' | 'sprint'`, a liczby są napisami (`'ok. 15–20'`).
- `AtlasMetric` łączy liczbę ze źródłem tylko przez `referenceIds` (całe źródło, bez strony, tabeli i warunków pomiaru).

## 1. Tezy

### A. Ontologie i identyfikatory

**T1. Kanonicznym ID struktury w atlasie powinien być własny, stabilny klucz (`slug`), a nie nazwa siatki ani ID jednej ontologii.**
Zewnętrzne ID są atrybutami, bo żadna ontologia nie pokrywa wszystkiego: HRA podaje, że 962 terminów ASCT+B nie ma jeszcze
odpowiednika w Uberonie (głównie naczynia, szkielet, mięśnie), a z 1192 struktur 3D tylko 516 ma unikalne ID Uberon
([Börner i in. 2025, Nature Methods](https://www.nature.com/articles/s41592-024-02563-5)).

**T2. Kolejność zaufania ID: TA2 (nazewnictwo) → FMA (granulacja i strona lewa/prawa) → Uberon (łączność z HuBMAP).**
TA2 mamy lokalnie i Z-Anatomy z niej korzysta (74% trafień już teraz). BodyParts3D, z którego wywodzą się siatki Z-Anatomy,
zarządza częściami przez FMAID ([plik BP3D: `FMA3734 → BP10374 aorta`](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/partof_parts_list_e.txt)).
HuBMAP mapuje swoje węzły GLB na Uberon i FMA w oficjalnej tabeli krzyżowej
([ASCT+B ↔ 3D crosswalk v1.8](https://doi.org/10.48539/hbm228.pzgr.344), przykład kolumn: `node_name, label, OntologyID, representation_of, glb file`
[w repo hubmap-ontology](https://github.com/hubmapconsortium/hubmap-ontology/blob/0d1eae4e4f6390129d4fa45b5feeda55d60ef30e/source_data/ASCT-B_3D_Models_Mapping.csv)).

**T3. Mostem między TA2, FMA i Uberonem powinien być Wikidata, a nie ręczne mapowanie.**
Wikidata ma właściwości TA2 ID (P7173), FMA ID (P1402), TA98 ID (P1323) i UBERON ID (P1554, do potwierdzenia), a do tego
etykiety **polskie**, których brakuje w TA2.csv. Jedno zapytanie SPARQL (darmowe) daje tabelę krzyżową; to, czego brak, uzupełnia
człowiek. Ryzyko: polskie etykiety Wikidaty są nierówne jakościowo, więc pole `namePl` wymaga statusu weryfikacji.

**T4. Lateralność (lewa/prawa) i „pole przyczepu” to kwalifikatory, a nie osobne struktury.**
FMA ma osobne klasy dla lewej i prawej strony, Uberon nie. Z-Anatomy koduje stronę przyrostkiem. Wniosek: `structureId` jest
bez strony, a obiekt siatki ma `side: 'L'|'R'|'mid'` i `facet: 'body'|'origin'|'insertion'`. Dzięki temu podpis „m. pośladkowy wielki”
działa na obu stronach, a fakty fizjologiczne nie dublują się.

**T5. Przynależność do układu jest relacją wiele-do-wielu, nigdy folderem.**
Trzustka jest w pokarmowym i hormonalnym, grasica w limfatycznym i hormonalnym, przepona w mięśniowym i oddechowym.
Z-Anatomy już tak to robi (wiele kolekcji na obiekt), a HRA ma osobny „graf układów” grupujący narządy w układy
([Nature Methods 2025](https://www.nature.com/articles/s41592-024-02563-5)). Plansza układu to **zapytanie** po tej relacji, nie lista siatek.

**T6. Siatka i struktura to dwa różne obiekty, powiązane wiele-do-wielu.**
Jedna struktura może mieć kilka siatek (Z-Anatomy + HuBMAP jako alternatywy, wątroba w 8 segmentach), a jedna siatka może
reprezentować kilka struktur (zbiorcze grupy węzłów chłonnych). HuBMAP rozdziela to samo: „Spatial Entity” jest
`representation_of` terminu ontologii ([CCF ontology, arXiv 2007.14474](https://arxiv.org/pdf/2007.14474v1.pdf)).

**T7. Mapowanie BodyParts3D/FMA nie jest wolne od błędów i trzeba je audytować.**
Przegląd etykiet BodyParts3D znalazł np. parę żeber oznaczoną jedną klasą FMA „Fourth rib” i kość krzyżową z guziczną jako „Sacrum”
([PMC6371295](https://pmc.ncbi.nlm.nih.gov/articles/PMC6371295)). Mapowanie automatyczne dostaje status `auto`, a do planszy trafia tylko `verified`.

### B. Model fizjologii stanów

**T8. Dwustanowy model „spoczynek/sprint” jest fizjologicznie niespójny, bo zmienne osiągają szczyt w różnym czasie.**
Mleczan we krwi rośnie najwyżej kilka minut po serii, hormon wzrostu po 30-sekundowym sprincie szczytuje z opóźnieniem i długo
utrzymuje się podwyższony ([Stokes i in. 2002, PMID 12137178](https://pubmed.ncbi.nlm.nih.gov/12137178/)), a HR i VO₂ rosną w ciągu sekund.
Liczba w kolumnie „sprint” miesza więc różne chwile. Dziś `miesniowy.ts` ma już dopisek „mmol/L (po seriach)”, co dowodzi problemu.

**T9. Rekomendacja: dane wieloetapowe (fazy z `WorkoutPhaseId`) + znacznik czasu pomiaru; widok może pozostać dwustanowy.**
Kanoniczne dane to wartości w punktach osi interwału (`rest`, `warmup`, `hiit_peak` koniec serii, `active_recovery` +1…3 min,
`cooldown`, opcjonalnie `post_exercise` z `TemporalHorizon`). UI może pokazać tylko dwa z nich, ale każda wartość wie, *kiedy* była mierzona.
Ciągła oś czasu tak, ale **tylko jako interpolacja** między zweryfikowanymi punktami (np. krzywa wykładnicza z podaną stałą czasową),
oznaczona jako ilustracja, nie pomiar.

**T10. Pulse Physiology Engine nadaje się jako offline'owy „kontroler spójności”, a nie jako źródło liczb na planszy.**
Pulse jest na Apache 2.0, ma akcję `Exercise` z intensywnością 0–1 jako ułamkiem ok. 1200 W i model zmęczenia z czterema magazynami energii
([Energy methodology](https://pulse.kitware.com/_energy_methodology.html), [SEExercise](https://pulse.kitware.com/class_s_e_exercise.html)).
Ale sam przyznaje, że „several physiological measures are failing validation” przy wysiłku (walidacja wieloetapowa: 76 dobrych, 3 średnie,
33 złe porównania), a endokrynnie modeluje tylko adrenalinę, noradrenalinę i insulinę, bez kortyzolu, GH, glukagonu, ADH i aldosteronu
([Endocrine methodology](https://pulse.kitware.com/_endocrine_methodology.html)). Nie znalazłem oficjalnej wersji przeglądarkowej (WASM);
są wiązania C++, Python, Java, C#. Wniosek: uruchomić raz skryptem w Pythonie, wygenerować krzywe HR/Q/VE/temperatury/przepływu trzewnego
dla scenariusza interwałowego, porównać z literaturą i zapisać jako JSON z etykietą `model_simulation`.

**T11. BioGears i HumMod odpadają jako główne narzędzia.**
BioGears to przodek Pulse (Pulse jest jego forkiem), na Apache 2.0, bez lepszego modelu wysiłku
([JOSS 2020](https://joss.theoj.org/papers/10.21105/joss.02645.pdf), [repo](https://github.com/BioGearsEngine/Engine)).
HumMod jest najbogatszy fizjologicznie (ok. 5000 zmiennych, m.in. nerki, hormony), ale działa tylko na Windows, licencja jest niejasna
([Hester i in. 2011, Front Physiol](https://frontiersin.org/articles/10.3389/fphys.2011.00012/full)); jego potomek
[Physiolibrary (Modelica, BSD-3)](https://www.github.com/modelica-3rdparty/Physiolibrary) wymaga środowiska Modelica, czyli to praca
dla programisty, nie dla tego projektu. Modele CellML/SBML z repozytorium Physiome są dobre do zbliżeń (np. energetyka mięśnia),
nie do całego ciała.

**T12. Każda wartość musi mieć „podmiot referencyjny” i protokół.**
Bez tego „HR 185” nic nie znaczy. Proponuję jednego podmiotu domyślnego zgodnego z modelem 3D (mężczyzna, ok. 25 lat, ok. 70 kg,
rekreacyjnie aktywny, `FitnessLevel = 'recreational'`) i protokół domyślny (np. 30 s „all-out” lub 4×4 min przy 90–95% HRmax).
To nie są te same liczby: protokół trzeba wybrać jawnie, a wartości z badań nad innym protokołem dostają flagę `protocolMismatch`.

### C. Model dowodów i ochrona przed halucynacjami

**T13. Jednostką wiedzy jest „fakt” (twierdzenie atomowe), a nie źródło ani plansza.**
Fakt = podmiot (struktura lub zmienna) + predykat + wartość/zakres + jednostka + czas pomiaru + populacja + źródło z **lokalizatorem**
(strona, tabela, rysunek) + `EvidenceLevel` + status (`draft` → `verified`). Obecne `ScientificClaim` i `AtlasMetric` są przypadkami
szczególnymi; należy je zmapować, a nie dublować.

**T14. Narracja AI wolno generować wyłącznie z zamkniętego, zweryfikowanego podgrafu faktów i musi przejść automatyczną kontrolę.**
Reguły: (1) do modelu idą tylko fakty `verified` dla danej planszy i fazy; (2) każde zdanie wyjściowe niesie `factIds`;
(3) walidator odrzuca tekst, w którym jest liczba, jednostka albo nazwa struktury nieobecna w podanych faktach; (4) poziom dowodów
ze słowami-kluczami („wstępnie”, „u zwierząt”, „spór”) musi pojawić się w zdaniu, gdy fakt nie jest `established_human`;
(5) gotowy tekst zatwierdza człowiek i dopiero wtedy jest zapisywany (AI działa w czasie budowy, nie na żywo u użytkownika).
To kopiuje logikę „RAG z cytowaniem” w twardej, sprawdzalnej postaci i nie wymaga płatnego API w aplikacji.

**T15. Do `EvidenceLevel` trzeba dodać dwie kategorie pochodzenia: `model_simulation` i `textbook_consensus`.**
Liczba z Pulse to nie dowód empiryczny, a liczba z Kenney 2022 bez wskazania badania pierwotnego to konsensus podręcznikowy.
Obie muszą być w interfejsie odróżnialne od wyniku badania. To jest osobna oś („skąd liczba”), obok osi „jak pewna wiedza”.

### D. Graf przyczynowy sprintu

**T16. Powiązania między układami trzeba zapisać jako graf skierowany z typem sygnału, znakiem, opóźnieniem i dowodem.**
Typy krawędzi: `neural`, `hormonal`, `hemodynamic`, `metabolic`, `mechanical`, `thermal`, `immune`. Ten sam graf zasila
(a) strzałki `flows` na planszach, (b) planszę „Całość”, (c) narrację (ścieżka w grafie = kolejność opowieści),
(d) animację (opóźnienie krawędzi = moment pojawienia się efektu). Szkic krawędzi rdzenia (wszystkie do zweryfikowania na fakty):

| Od | Do | Typ | Znak | Opóźnienie | Źródło startowe |
|---|---|---|---|---|---|
| kora ruchowa | motoneurony α | neural | + | ms | kandel_2021 |
| motoneurony α | mięśnie napędowe | neural | + | ms | kenney_2022 |
| kora ruchowa (central command) | pień mózgu / AUN | neural | + | s | kenney_2022 |
| AUN współczulny | rdzeń nadnerczy → adrenalina | neural→hormonal | + | s | Zouhal 2008 |
| adrenalina | wątroba (glikogenoliza) | hormonal | + | s–min | Trefts 2015* |
| mięśnie | mleczan we krwi | metabolic | + | s–min | brooks_2018 |
| mleczan | wątroba (glukoneogeneza, cykl Cori) | metabolic | + | min | brooks_2018 |
| mleczan / H⁺, CO₂ | wentylacja | metabolic→neural | + | s | kenney_2022 |
| AUN współczulny | przepływ trzewny i nerkowy | hemodynamic | − | s | van Wijck 2012, Poortmans |
| mięśnie (ciepło) | temperatura głęboka → skóra (pot, przepływ) | thermal | + | min | kenney_2022 |
| adrenalina | leukocyty (NK) we krwi | immune | + | min | Campbell & Turner 2018 |
| sprint (sygnał nieznany) | przysadka → GH | hormonal | + | 10–30 min | Stokes 2002 |
| mięśnie (pompa) | przepływ limfy | mechanical | + | s | kenney_2022 |
| kończyna dolna | kości (siły reakcji podłoża) | mechanical | + | ms | Weyand 2000* |

\* źródła, których nie ma jeszcze w `ScientificReferences.ts`; trzeba je dodać po weryfikacji PMID.

### E. Siła dowodów dla 7 pozostałych układów (pojedynczy sprint)

**T17. Mocne: hormonalny (katecholaminy), pokarmowy (przepływ trzewny, wątroba), wydalniczy (przepływ nerkowy). Średnie: powłokowy, kostny, limfatyczny. Słaby: rozrodczy.**

| Układ | Co mocne | Co słabe / sporne | Kluczowe źródła |
|---|---|---|---|
| Hormonalny | Wielokrotny wzrost adrenaliny i noradrenaliny przy wysiłku supramaksymalnym; GH rośnie po 30 s sprincie (silniej niż po 6 s), odpowiedź tłumi się przy powtórkach | kortyzol w krótkim HIIT zależy od objętości i pory dnia; „hormony szczęścia” to mit | [Zouhal 2008, PMID 18416594](https://pubmed.ncbi.nlm.nih.gov/18416594/); [Stokes 2002, PMID 12137178](https://pubmed.ncbi.nlm.nih.gov/12137178/) |
| Pokarmowy | Spadek przepływu trzewnego z intensywnością; glikogenoliza wątrobowa; cykl Cori | ilościowe dane dla 30 s sprintu są rzadkie (badania głównie w wysiłku ciągłym) | [van Wijck 2012, PMID 22517770](https://pubmed.ncbi.nlm.nih.gov/22517770/); brooks_2018 |
| Wydalniczy | Przepływ nerkowy spada nawet do ok. ¼ spoczynkowego przy ciężkim wysiłku, GFR mniej; białkomocz wysiłkowy | rola nerek w kwasicy w trakcie jednej serii: znikoma (to sprawa minut–godzin) | [Poortmans 1994, PMID 7886356](https://pubmed.ncbi.nlm.nih.gov/7886356/); Sports Med 1984, DOI 10.2165/00007256-198401020-00003 |
| Powłokowy | Konkurencja skóra–mięśnie o rzut serca; pocenie zależne od temperatury głębokiej | w pojedynczej 30 s serii temperatura prawie się nie zmienia; efekt kumuluje się w całej sesji, więc tu oś czasu jest konieczna | kenney_2022; Pulse energy methodology (model 2-węzłowy) |
| Kostny | Siły reakcji podłoża w sprincie są większe niż w truchcie i decydują o prędkości | „wzmacnianie kości” to adaptacja tygodniowa (`TemporalHorizon`), nie efekt sprintu | Weyand i in. 2000, J Appl Physiol (do dodania) |
| Limfatyczny | Natychmiastowa mobilizacja limfocytów, zwłaszcza NK, a po wysiłku spadek poniżej wyjścia | interpretacja spadku: „okno immunosupresji” vs przemieszczenie do tkanek, `contested_debate` | [Campbell & Turner 2018, PMC5911985](https://pmc.ncbi.nlm.nih.gov/articles/PMC5911985) |
| Rozrodczy | Krótki wzrost testosteronu u mężczyzn po intensywnym wysiłku | wpływ fazy cyklu na wydolność „trywialny” i niskiej jakości dowodów (ES −0,06, przedział obejmuje zero) | [McNulty i in. 2020, Sports Med](https://irep.ntu.ac.uk/id/eprint/41201/1/1344931_Elliott-Sale.pdf) |

Wniosek dla priorytetów: kolejność z `ATLAS_KOLEJNE_UKLADY.md` jest w porządku, ale **kostny i powłokowy** nie mają sensownej różnicy
„spoczynek/sprint” w modelu dwustanowym. Kostny potrzebuje fazy wewnątrzkrokowej (lądowanie), powłokowy osi sesji (minuty).
To dodatkowy argument za T9.

## 2. Proponowany schemat danych (szkic)

```ts
// Struktura anatomiczna: niezależna od siatki i od renderu
interface Structure {
  id: string;                       // własny slug, np. 'gluteus_maximus' (T1)
  names: { pl: string; la: string; en: string; plStatus: 'verified' | 'auto' };
  ids: { ta2?: string; fma?: string; uberon?: string; wikidata?: string };
  partOf?: string;                  // partonomia (FMA/Uberon part_of)
  systems: SystemId[];              // wiele-do-wielu (T5)
  regions: string[];                // 'thorax', 'left_lower_limb'… z kolekcji Z-Anatomy
  bilateral: boolean;
  mappingStatus: 'auto' | 'verified';
}

// Siatka 3D: wiele-do-wielu ze strukturą (T6)
interface MeshBinding {
  source: 'z-anatomy' | 'hubmap' | 'bodyparts3d';
  meshName: string;                 // 'Gluteus maximus muscle.l' lub węzeł GLB HuBMAP
  structureIds: string[];
  side: 'L' | 'R' | 'mid';          // z przyrostka .l/.r (T4)
  facet: 'body' | 'origin' | 'insertion';  // .ol/.or, .el/.er
  license: 'CC-BY-SA-4.0' | 'CC-BY-4.0' | 'CC-BY-NC';  // NC = blokada (nerka/ucho Z-Anatomy)
}

// Zmienna fizjologiczna i jej wartości w czasie (T8, T9, T12)
interface Variable { id: string; namePl: string; unit: string; structureId?: string; }  // 'hr', 'q_splanchnic'
interface Fact {
  id: string;
  variableId?: string; subjectStructureId?: string;
  predicatePl?: string;                     // dla faktów jakościowych
  value?: { min: number; max: number; typical?: number };
  phase: WorkoutPhaseId | TemporalHorizon;  // KIEDY (reuse istniejących typów)
  tSecFromBoutStart?: number;               // precyzyjnie, gdy znane
  population: { sex: 'M' | 'F' | 'any'; fitness: FitnessLevel; n?: number };
  protocol: string;                         // '30s_allout_cycle', '4x4_treadmill'…
  protocolMismatch?: boolean;
  refs: { refId: string; locator: string }[];  // 'Tab. 2', 's. 412'
  evidence: EvidenceLevel;
  provenance: 'primary_study' | 'meta_analysis' | 'textbook_consensus' | 'model_simulation'; // T15
  status: 'draft' | 'verified'; verifiedBy?: string;
}

// Graf przyczynowy (T16)
interface CausalEdge {
  from: string; to: string;          // Structure.id lub Variable.id
  kind: 'neural' | 'hormonal' | 'hemodynamic' | 'metabolic' | 'mechanical' | 'thermal' | 'immune';
  sign: '+' | '-'; latency: 'ms' | 's' | 'min' | 'h';
  factIds: string[];                 // krawędź bez faktu = nie istnieje w UI
}

// Narracja: tylko z faktów (T14)
interface NarrationSentence { textPl: string; factIds: string[]; register: NarrationRegister; approved: boolean }
```

Obecne `AtlasMetric` staje się *widokiem* (selektorem) na dwa fakty tej samej zmiennej w dwóch fazach. `AtlasLabel.anchor` wskazuje
`Structure.id`, a kotwice z Blendera liczy się dla `MeshBinding` (środek siatki strony L lub R).
Źródło prawdy: pliki JSON w repo (np. `src/atlas/data/*.json`) z testem walidującym (każdy fakt ma `refs`, każda krawędź ma fakt,
każda liczba w narracji pochodzi z faktu). Test to tani i darmowy strażnik jakości, który działa bez programisty po stronie użytkownika.

## 3. Czego oczekuję od B i C, gdzie przewiduję spór

**Od Badacza B (3D/silnik):**
- Oczekuję, że eksport z Blendera zachowa `meshName` 1:1 (z przyrostkiem) i nada każdej siatce `structureId` w `extras` glTF.
  Bez tego żadne kliknięcie w 3D nie trafi do faktów.
- **Spór 1:** B może chcieć łączyć siatki (dla wydajności) w jedną bryłę na układ. Akceptuję łączenie geometrii tylko pod warunkiem,
  że zachowa się mapę trójkąt/podsiatka → `structureId` (np. atrybut ID na wierzchołku).
- **Spór 2:** B może chcieć uruchamiać Pulse lub inny silnik na żywo w przeglądarce. Twierdzę, że to zbędne ryzyko: brak oficjalnego WASM,
  słaba walidacja wysiłku. Wystarczy wstępnie policzona oś czasu w JSON.
- **Spór 3:** dopasowanie HuBMAP (Visible Human) do Z-Anatomy (BodyParts3D, inny człowiek). B pewnie zrobi to „na oko” przekształceniem
  sztywnym; ja chcę zapisu, która siatka jest „źródłowa” dla danej struktury, żeby nie pokazywać dwóch wątrób naraz.

**Od Badacza C (UX/narracja):**
- Oczekuję zgody, że narracja AI nie powstaje na żywo i nie wychodzi poza graf faktów (T14).
- **Spór 4:** C może bronić prostego przełącznika „spoczynek/sprint” jako najczytelniejszego. Zgadzam się w UI, ale nie w danych:
  przełącznik musi pokazywać, *kiedy* mierzono wartość (np. „mleczan: 3 min po serii”).
- **Spór 5:** C może chcieć dramaturgii („burza hormonów”). Każda metafora musi być oznaczona jak `educationalMagnificationNote`,
  a dla `contested_debate` ton jest neutralny z obu stronami sporu.
- **Spór 6:** polskie nazwy. C zechce nazw potocznych („łydka”), ja nazw anatomicznych. Proponuję obie: `names.pl` (anatomiczna) i
  `labelPopularPl` (potoczna) tylko w treści planszy.

## 4. Ryzyka i niewiadome

1. **Licencja TA2.csv.** TA2 wydaje FIPAT; plik przyszedł w paczce Z-Anatomy, ale nie znalazłem jasnej licencji na redystrybucję
   samej listy. Do sprawdzenia przed wpisaniem TA2ID do repo (same ID są raczej bezpieczne, pełne tłumaczenia mniej).
2. **Licencje NC w Z-Anatomy** (nerka CC BY-NC, ucho wewnętrzne CC BY-NC-SA) muszą być zapisane w `MeshBinding.license`,
   bo plansza wydalnicza mogłaby nieświadomie użyć nerki z Z-Anatomy. Bezpieczna droga: nerka z HuBMAP.
3. **26% nazw Z-Anatomy bez trafienia w TA2** (kręgi, zęby, numerowane fragmenty). Wymaga ręcznej tabeli wyjątków; szacuję 1–2 dni pracy
   z pomocą AI i weryfikacją człowieka.
4. **Uberon a lateralność i granulacja:** HuBMAP używa Uberon, Z-Anatomy pośrednio FMA. Część struktur nie ma pary 1:1.
5. **Pulse:** nie wiem, czy istnieje gotowa paczka Pythona do instalacji bez kompilacji (do sprawdzenia w repo Kitware), ani czy jego
   model wytrzyma 30 s „all-out” (walidowano wysiłki etapowe po 6 minut, maks. ok. 430 W). Możliwe, że zostanie wyłącznie dla faz
   rozgrzewki, przerwy i regeneracji.
6. **Zmienność międzyosobnicza i płeć:** pojedyncza liczba ukrywa duży rozrzut; dane dla kobiet są w wielu obszarach skąpe
   (Zouhal 2008 pisze to wprost o katecholaminach). Zakresy zamiast punktów.
7. **Wikidata P1554** (UBERON ID) potwierdziłem tylko pośrednio; numery właściwości trzeba sprawdzić przed zapytaniem.
8. **Koszt utrzymania:** graf faktów jest tak dobry, jak dyscyplina weryfikacji. Bez osoby zatwierdzającej fakty (`verified`) system
   zamieni się w ten sam problem, który ma rozwiązać. Użytkownik nie jest programistą, więc weryfikacja musi być w prostej tabeli
   (np. arkusz → JSON), nie w kodzie TS.
