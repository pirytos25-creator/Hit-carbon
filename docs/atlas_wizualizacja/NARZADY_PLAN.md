# Gabloty narządów: plan (serce, nerka, wątroba, mózg)

Stan: 2026-11-26, agent wizualizacji 3D, gałąź `claude/atlas-wizualizacja-3d-1dc29a`. **To jest tylko plan z klatkami koncepcyjnymi.** W `src/` nic się nie zmieniło. Kod powstanie dopiero po zgodzie użytkownika.

Prośba użytkownika (cytat): „interaktywne 3D z możliwością obrotu, najazdem na strukturę, omówieniem jej budowy, obrazowa 3D filmowa animacja działania”.
Nowy priorytet: atlas ma przede wszystkim uczyć licealistów.

Klatki koncepcyjne: `zrzuty/narzady/` (tablica zbiorcza: `narzady_tablica.jpg`). To rendery Blendera (EEVEE) prawdziwych modeli HuBMAP, ustawionych tak, jak pokazywałaby je gablota. Nie są zrzutami aplikacji. Skrypt: `blender/atlas/concept_narzady.py` (tylko do renderu poglądowego, nie do eksportu). Liczby z modeli: `zrzuty/narzady/stats_modeli.json`.

![tablica](zrzuty/narzady/narzady_tablica.jpg)

## 0. W skrócie (dla użytkownika)

- **Gablota narządu** to jeden narząd na środku ekranu, w tym samym studiu co widok 3D układów. Można go obracać i przełączać ujęcia, w tym przekrój. Po najechaniu na część widać jej nazwę, a kliknięcie otwiera panel „budowa i funkcja”. Jest też tryb „sprawdź się” („wskaż lewą komorę”) i przełącznik Spoczynek/Wysiłek.
- **Film działania** to osobny przycisk „Jak to działa”. Uruchamia sekwencję ujęć z kamerą po szynie, którą można zatrzymywać krok po kroku. Każdy narząd ma swoją historię: serce (cykl i przepływ krwi), nerka (od krwi do moczu z wejściem do nefronu), wątroba (krew wrotna → komórki → żółć), mózg (decyzja „sprint” od kory ruchowej do rdzenia).
- **Geometria:** wszystkie cztery narządy są w HuBMAP (CC BY 4.0) i sprawdziłem je w Blenderze. Do poziomu mikro (nefron, zrazik, neuron) potrzebne są osobne otwarte modele: neurony z NeuroMorpho (CC BY 4.0) i zrazik OrganUI (CC0). Licencja nefronu wymaga jeszcze sprawdzenia albo decyzji o schemacie (§6).
- **Kolejność:** najpierw **serce** jako wzór (ok. 22–30 godzin pracy agentów), potem nerka, wątroba i mózg. Razem ok. 75–100 godzin pracy agentów, bez pracy agenta faktów.
- **Do decyzji użytkownika** są cztery sprawy (§9): wejście do gablot, ruch zastawek, poziom mikro bez modelu oraz zakres faktów.

## 1. Co jest w danych (zmierzone)

| Narząd | Plik HuBMAP (CC BY 4.0) | Części | Trójkąty (surowe) | Rozmiar | Uwagi z Blendera |
|---|---|---|---|---|---|
| Serce | `VH_M_Heart.glb` | **14**: 2 przedsionki, 2 komory, przegroda międzykomorowa, 4 zastawki, 5 mięśni brodawkowatych | 164 tys. | 12,4 × 10,5 × 10,5 cm | ściany komór i przedsionków to **zamknięte bryły** (0 krawędzi niezamkniętych), więc przekrój da się „zalać” (§2.3). **Zastawki są jedną siatką bez osobnych płatków** |
| + naczynia serca | `VH_M_Blood_Vasculature_Heart.glb` | 37: aorta, pień płucny, tętnice i żyły płucne, żyły główne, naczynia wieńcowe | 153 tys. | | do gabloty wystarczy odcinek przy sercu (przycięcie, ok. 60–80 tys.) |
| Nerka | `VH_M_Kidney_L.glb` (i `_R`) | 22: torebka, kora zewnętrzna, kolumny nerkowe, 9 piramid, 9 brodawek, wnęka | 84 tys. | 7,6 × 8,2 × 10,7 cm | kolumny nerkowe przeplatają się z korą. W przekroju bez „zalania” powstaje labirynt (klatka `nerka_1`), więc w gablocie kolumny i kora tworzą jedną „korę” |
| + naczynia, moczowód | `VH_M_Blood_Vasculature_Kidney.glb`, `VH_M_Ureter_L.glb` | tętnica i żyła nerkowa, moczowód | 5 tys. + moczowód | | **nerka Z-Anatomy jest zakazana (NC)**, a HuBMAP jest dozwolony |
| Wątroba | `VH_M_Liver.glb` | 26: torebka, 8 części segmentowych (w tym płat ogoniasty i czworoboczny), więzadła, wnęka, odciski narządów | 60 tys. | 19,1 × 20,2 × 17,5 cm | segmenty są osobnymi bryłami (klatka `watroba_1`) |
| + naczynia, żółć | `VH_M_Blood_Vasculature_Liver.glb`, `VH_M_Gallbladder.glb`, `VH_M_Biliary_Tree.glb` | żyła wrotna i jej gałęzie, tętnice wątrobowe, 3 żyły wątrobowe, pęcherzyk, przewody żółciowe | 16 + 2 + 31 tys. | | z drzewa żółciowego wycinam przewody trzustkowe |
| Mózg | `Allen_M_Brain.glb` | **283 obszary** (L/P) | 656 tys. | 13,6 × 16,7 × 14,6 cm | zgrupowane automatycznie po nazwach w 12 grup (§4.4); niedopasowane były tylko 2 obszary, jądra ciała migdałowatego (`central_nuclear_group`) |
| + rdzeń | `VH_M_Spinal_Cord.glb` | 30 segmentów C1–S | 16 tys. | | **przerwa 6,8 mm** między dolnym końcem rdzenia przedłużonego (Allen) a C1 (VH), bo to dwa różne źródła. W filmie przerwę maskuje ujęcie, nie dorysowujemy jej |

Z-Anatomy (BY-SA) w gablotach nie jest potrzebne. Gabloty to czysty HuBMAP (BY) i nie ma ryzyka mieszania licencji. Kontekst ciała (opcjonalna miniatura „gdzie jest narząd”) dałby osobny plik `za_*`, jak w E3.

## 2. Gablota narządu (wspólna dla czterech)

### 2.1 Układ ekranu
Oprawa jak w E3 (`Atlas3DView`): pasek górny z nazwą narządu, ujęciami i przełącznikiem Spoczynek/Wysiłek, pasek dolny z trybami **Zwiedzaj · Jak to działa · Sprawdź się**, stopka licencji. Narząd zajmuje obszar między paskami. Panel „budowa i funkcja” wysuwa się z prawej (od 1100 px szerokości) albo z dołu (telefon i wąskie okno).

### 2.2 Kamera
- Obrót poziomy z przyciąganiem do ujęć (`Rail` z E3). Dla gablot dochodzi przechylenie pionowe ±35°, bo narząd trzeba też zobaczyć od góry i od dołu (np. podstawę serca z zastawkami). Zoom jest ograniczony do przedziału od 0,6× do 2,5× kadru głównego.
- **Ujęcia** to gotowe kadry, każdy z celem dydaktycznym, np. serce: Przód · Tył · Przekrój 4 jam · Podstawa (zastawki) · Lewa komora z bliska.
- Klawiatura jak w E3 (← → 1–9 S Esc), a do tego Tab do przechodzenia po częściach (dostępność: najechanie bez myszy).

### 2.3 Przekrój i „otwarcie”
- **Technika:** płaszczyzna przycięcia w shaderze (jak `clipping_planes_fragment` w E3) plus **zalanie przekroju** buforem szablonu (stencil). Przednie i tylne ściany zliczają, gdzie jesteśmy w bryle, a płaski wielokąt w płaszczyźnie cięcia rysuje się tylko tam. Dzięki temu ściana komory ma grubość i kolor „miąższu”. Warunek: bryły zamknięte. Serce go spełnia (sprawdzone), nerkę i wątrobę sprawdzę w K1. Wycinek przekroju kosztuje 2 dodatkowe przebiegi dla przeciętych siatek.
- Klatka `serce_2_przekroj` pokazuje wariant bez zalania (wnętrze ściany w kolorze cięcia). Już to jest czytelne: widać 4 jamy, przegrodę, zastawki i mięśnie brodawkowate.
- „Otwarcie” to animowane przesunięcie płaszczyzny cięcia od przodu do środka (0,6 s, bez ruchu przy `prefers-reduced-motion`). **Bez rozsuwania części („eksplozji”)**, bo licealista traci wtedy orientację, gdzie co leży.

### 2.4 Najechanie i wybór
- **ID w wierzchołku** (atrybut `_ID` z E3) daje strukturę bez osobnych siatek, czyli 1 wywołanie rysowania na plik.
- **Wybór:** proponuję **wybór przez GPU** (render ID do bufora 1×1 px pod kursorem, tylko przy ruchu myszy, nie częściej niż co 50 ms). Zalety: przycięcie, przezroczystość i dithering są uwzględnione automatycznie, nie ma nowej biblioteki, a koszt na Intel UHD to ok. 1–2 ms za odczyt. Alternatywą jest **three-mesh-bvh (MIT)**: raycast z odrzuceniem trafień po wyciętej stronie. Budowa BVH dla 300 tys. trójkątów trwa ok. 100–200 ms przy wczytaniu, a przydaje się do dotyku (palec zasłania piksel). Rekomendacja: GPU na myszy, BVH tylko na dotyku. Do uzgodnienia w K2. Obie drogi są darmowe.
- **Wygląd:** wybrana część rozjaśniona z lekką emisją, reszta przygaszona do ok. 30% (klatka `serce_3`), podpis w stylu E3 (ciemne tło, kontrast ≥ 4,5:1).

### 2.5 Panel „budowa i funkcja”
Treść składa się z nazwy, 1 zdania „gdzie”, 2–3 zdań „budowa”, 2–3 zdań „funkcja” i ewentualnie „W wysiłku: …”. Do tego poziom **Podstawowy / Rozszerzony** (jak `tier` w planszach) i status faktów (`checked_agent` itd.) przy każdym zdaniu. Teksty idą zwykłą ścieżką: drugi agent z cytatem. Przycisk „Pokaż w filmie” przeskakuje do kroku animacji z tą strukturą.

### 2.6 Tryb „Sprawdź się”
- Pytania typu **„Wskaż …”** (klik w strukturę) i **„Co to jest?”** (struktura podświetlona, 3 odpowiedzi do wyboru). Pula pytań pochodzi z listy struktur gabloty i ich poziomu (podstawa albo rozszerzenie).
- Informacja zwrotna: przy dobrej odpowiedzi zielony obrys i zdanie z panelu, przy złej nazwa tego, co wskazano, i podświetlenie poprawnej części. Bez punktów za czas (liceum, nie gra).
- Wynik zostaje tylko w przeglądarce (`localStorage`), bez kont.

### 2.7 Spoczynek / Wysiłek
Ten sam mechanizm co w atlasie: tekstura stanu (`StateTex`) i przenikanie `uState`. Przykłady **bez liczb** (liczby tylko od agenta faktów): serce bije szybciej i mocniej, nerka dostaje mniej krwi, wątroba uwalnia glukozę z glikogenu, w mózgu pracuje kora ruchowa. W filmie wysiłek zmienia tempo i gęstość cząstek.

## 3. Wspólny język wizualny

Moje stanowisko (spór z Reżyserem, §8):
1. **Ciągłość z E3:** tło studia `#13203A → #070B14`, styl matowy, mapowanie tonów wyłączone (rendery plansz są w Standard), światło klucz, wypełnienie i kontra, bez bloomu dla ozdoby. „Każdy efekt ma zmienną”: emisja oznacza pracę, cząstki przepływ, a puls przewodzenie.
2. **Kolor narządu = kolor układu** z `palette.json`: serce to krwionośny `#D93240`, nerka moczowy `#276777`, wątroba pokarmowy `#B4B474`, mózg `#9B7BEA`. Części narządu to odcienie tej barwy. Wyjątki dydaktyczne mają barwę z palety:
   - **krew natleniona czerwona, odtleniona niebieska** (`--sys-vein #3E6FD8` już jest w palecie);
   - krew wrotna: do ustalenia (w klatce `watroba_2` fiolet, propozycja);
   - żółć zielona;
   - mocz złoty.
3. **Kolor przekroju:** jasna, „miąższowa” wersja barwy układu i cienki obrys krawędzi cięcia.
4. **Mikro w innym stylu niż makro:** poziom komórkowy (nefron, zrazik, neuron) ma płaskie, półprzezroczyste światło i ramkę z podpisem „powiększenie, schemat” albo „rekonstrukcja z mikroskopu”. Uczeń widzi wtedy, że zmieniła się skala i rodzaj obrazu. Przejście to ciągły najazd kamery, który kończy się przenikaniem mgłą (jak w filmie: `ShotChoreography`).

## 4. Filmy działania (animacje 3D)

Wspólna technika:
- **Oś czasu** to jeden zegar kroków (wzorem `SimulationCore` z filmu). Każdy krok ma ujęcie kamery, stan materiałów, cząstki i 1 zdanie podpisu. Przyciski ◀ ❚❚ ▶ i suwak; przy `prefers-reduced-motion` stopklatki.
- **Kamera po szynie:** krzywa Catmulla-Roma przez punkty ujęć, wygładzanie prędkości, cel przyklejony do struktury. Bez swobodnej kamery w filmie.
- **Cząstki:** `InstancedMesh` (2–4 tys. punktów) płynące po torach w metrach. Tory liczy się z geometrii: środki przekrojów naczyń i jam (w Blenderze, deterministycznie, bez rysowania „z ręki”), tak jak `vessel_path` w E3.
- **Ruch tkanek:** przemieszczenie wierzchołków w shaderze o wartość z tekstury stanu. Kształt pochodzi z modelu, a animacja tylko go skaluje lub przesuwa. Wielkość ruchu (np. o ile kurczy się komora) to liczba, więc pochodzi od agenta faktów. Do czasu sprawdzenia oznaczamy ją „ruch poglądowy”.

### 4.1 Serce: cykl pracy i przepływ krwi (wzór)
| Krok | Ujęcie | Co się dzieje | Technika |
|---|---|---|---|
| 1 | Przód, całe serce z naczyniami | krew wraca: żyły główne (niebieskie) do prawego przedsionka, żyły płucne (czerwone) do lewego | cząstki na torach żył |
| 2 | Przekrój 4 jam | skurcz przedsionków, krew przechodzi przez zastawki trójdzielną i mitralną | przesunięcie ścian przedsionków, cząstki |
| 3 | Przekrój, zbliżenie komór | skurcz komór: zastawki przedsionkowo-komorowe zamknięte, półksiężycowate otwarte | ruch ścian komór, stan zastawek (§9, pyt. 2), cząstki do aorty i pnia płucnego |
| 4 | Podstawa serca od góry | rozkurcz: 4 zastawki widziane razem | kamera po szynie nad podstawą |
| 5 | Lewa komora z bliska | dlaczego ściana lewej komory jest grubsza (opór krążenia dużego) | zalany przekrój, porównanie grubości ścian |
| 6 | Przód | Wysiłek: tempo cyklu i gęstość cząstek rosną | `uState` |
| (rozszerzenie) | Przedsionki | pobudzenie z węzła zatokowo-przedsionkowego, fala po przedsionkach | fala odległości od punktu w shaderze; **punkt węzła to fakt anatomiczny do potwierdzenia, HuBMAP nie ma węzła** |

**Ruch zastawek:** zastawki są jedną siatką bez płatków. Wariant A (bezpieczny): zastawka zmienia stan kolorem i przezroczystością, a przepływ pokazują cząstki. Wariant B: podział siatki na płatki w Blenderze (klasyfikacja wierzchołków po kącie wokół osi ujścia) i morph target „otwarta”. Kształt otwartej zastawki byłby wtedy **przekształceniem** prawdziwej siatki, a nie wymyślonym kształtem, ale to wciąż uproszczenie. Decyzja w §9.

Koszt: 8–12 godzin (tory cząstek, shader ruchu, oś czasu, kamera, 6 kroków).

### 4.2 Nerka: od krwi do moczu
| Krok | Ujęcie | Co się dzieje |
|---|---|---|
| 1 | Nerka w przekroju (`nerka_1`) | tętnica nerkowa wnosi krew, żyła wynosi |
| 2 | Najazd w korę | kamera wchodzi w korę nad piramidą, przenikanie mgłą do mikro |
| 3 | **Nefron** (mikro) | kłębuszek: filtracja, czyli małe cząstki przechodzą do torebki, krwinki i białka zostają |
| 4 | Kanalik | resorpcja (cząstki wracają do naczyń), wydzielanie |
| 5 | Kanalik zbiorczy → brodawka | powrót do makro: mocz (złoty) przez brodawkę do kielicha i miedniczki |
| 6 | Wnęka → moczowód | `VH_M_Ureter_L` (HuBMAP) |
| 7 | Wysiłek | mniej krwi do nerek (wartość od agenta faktów) |

Geometria mikro (nefron): **nie ma jej w HuBMAP**. Opcje w §6. Koszt: 8–10 godzin plus mikro (2–6 godzin zależnie od opcji).

### 4.3 Wątroba: krew wrotna → komórki → żółć
| Krok | Ujęcie | Co się dzieje |
|---|---|---|
| 1 | Wątroba z naczyniami (`watroba_2`) | żyła wrotna wnosi krew z jelit, tętnica wątrobowa krew natlenioną |
| 2 | Segmenty (`watroba_1`) | podział na segmenty: każdy ma własne gałęzie naczyń i przewodów (rozszerzenie) |
| 3 | **Zrazik** (mikro, OrganUI CC0) | krew płynie od triady wrotnej do żyły środkowej, hepatocyty |
| 4 | Zrazik | żółć płynie w przeciwną stronę, do przewodzika |
| 5 | Drogi żółciowe (HuBMAP) | żółć przez przewody do pęcherzyka i przewodu żółciowego wspólnego |
| 6 | Wysiłek | glikogen → glukoza do krwi (łącze z planszą pokarmową atlasu) |

Koszt: 8–10 godzin plus mikro (2–3 godziny, model CC0 gotowy).

### 4.4 Mózg: droga decyzji „sprint”
Grupowanie 283 obszarów Allen (automatycznie po nazwach, sprawdzone w Blenderze):

| Grupa | Obszarów | Podstawa | Rozszerzenie |
|---|---|---|---|
| płat czołowy (w tym zakręt przedśrodkowy, czyli kora ruchowa) | 28 | ✓ | ✓ |
| płat ciemieniowy | 14 | ✓ | ✓ |
| płat skroniowy | 22 | ✓ | ✓ |
| płat potyliczny | 10 | ✓ | ✓ |
| wyspa | 10 | | ✓ |
| układ limbiczny (hipokamp, ciało migdałowate, zakręt obręczy) | 52 | | ✓ |
| międzymózgowie (wzgórze, podwzgórze, szyszynka) | 48 | ✓ | ✓ |
| jądra podstawy | 24 | | ✓ |
| istota biała (spoidło wielkie, sklepienie) | 17 | | ✓ |
| komory mózgu | 14 | | ✓ |
| móżdżek | 14 | ✓ | ✓ |
| pień mózgu (śródmózgowie, most, rdzeń przedłużony) | 28 | ✓ | ✓ |

W gablocie każda grupa to jedna struktura z możliwością rozwinięcia na podgrupy w trybie Rozszerzonym (np. pień → śródmózgowie, most, rdzeń przedłużony). Przypisanie obszarów do grup musi sprawdzić agent faktów: to klasyfikacja, a nie liczba, ale wciąż fakt.

Film „decyzja sprint” (klatka `mozg_2`):
| Krok | Ujęcie | Co się dzieje |
|---|---|---|
| 1 | Mózg z boku (`mozg_1`) | płaty, kora ruchowa podświetlona |
| 2 | Kora ruchowa z bliska → **neuron piramidowy** (mikro, NeuroMorpho CC BY 4.0) | impuls biegnie po aksonie (puls w shaderze wzdłuż drzewa SWC) |
| 3 | Droga w dół: istota biała → odnoga mózgu → most → piramida rdzenia przedłużonego | tor przez środki obszarów Allen (z geometrii), puls |
| 4 | Skrzyżowanie piramid | **schemat linią** (brak osobnej geometrii, oznaczony „schemat”) |
| 5 | Rdzeń kręgowy (VH) → motoneuron → mięsień | przejście do atlasu mięśniowego (Gablota E3) |
| (rozszerzenie) | Móżdżek i jądra podstawy | pętla korekty ruchu |

Koszt: 10–14 godzin (grupowanie, decymacja, tor, neuron).

## 5. Zakres treści pod liceum

Struktura treści każdej gabloty: **Podstawowy** odpowiada zakresowi podstawowemu biologii, **Rozszerzony** rozszerzonemu. Poniżej jest **robocza** lista. Agent faktów ma ją sprawdzić z cytatem z aktualnej podstawy programowej i podręczników, bo nie podaję tu numerów wymagań ani liczb.

| Narząd | Podstawowy (propozycja) | Rozszerzony (propozycja) |
|---|---|---|
| Serce | 4 jamy, zastawki, przegroda; krążenie duże i małe; krew natleniona i odtleniona; wysiłek: tętno | cykl pracy serca (fazy), układ bodźcoprzewodzący, naczynia wieńcowe, grubość ścian komór i opór krążenia |
| Nerka | położenie, kora, rdzeń, miedniczka; nefron jako jednostka; mocz jako produkt | filtracja, resorpcja, wydzielanie; kłębuszek, kanaliki, pętla nefronu; regulacja (hormony) |
| Wątroba | największy gruczoł; żółć i trawienie tłuszczów; magazyn glikogenu | zrazik, krążenie wrotne, detoksykacja, mocznik, segmenty |
| Mózg | płaty, móżdżek, pień, rdzeń; kora ruchowa i czuciowa | międzymózgowie, układ limbiczny, drogi piramidowe, skrzyżowanie dróg, jądra podstawy |

Liczby w filmach i panelach (tętno, objętości, przepływ nerkowy, czasy faz) **tylko od agenta faktów**, ze statusem i dopiskiem, jeśli pochodzą z innego protokołu (jak `protocolNotePl` w planszach).

## 6. Geometria mikro i licencje

| Poziom | Źródło | Licencja | Stan |
|---|---|---|---|
| Narządy, naczynia, drogi żółciowe, moczowód, rdzeń | HuBMAP CCF (`atlas_raw/hubmap`) | CC BY 4.0 (`HUBMAP_LICENSE.txt`) | lokalnie, sprawdzone |
| Neuron (kora ruchowa) | NeuroMorpho.Org, rekonstrukcja SWC (np. ludzki neuron piramidowy kory) | **CC BY 4.0**. Warunki: cytat pracy źródłowej, nazwa NeuroMorpho.Org (RRID:SCR_002145) i praca Tecuatl i in. 2024 | do pobrania (zapytam o zgodę na pobranie pliku); SWC → rury w Blenderze, ok. 20–50 tys. trójkątów |
| Zrazik wątroby | OrganUI `liver-lobule.glb` | **CC0 1.0**, model schematyczny | autorzy sami opisują go jako schemat; w UI podpis „schemat” |
| Nefron | (a) Sketchfab „Free Nephron 3D Model” (Novsred, 31,6 tys. trójkątów); (b) NIH 3D „Human Kidney Model 3D” (3DPX-023373, z nefronami) | **niesprawdzone**: strona nie podaje licencji w opisie, trzeba ją odczytać. Tylko CC0, BY lub BY-SA, nigdy NC | decyzja w §9 |
| (alternatywa) | BodyParts3D: według OrganUI obecnie CC BY 4.0 | do potwierdzenia | rezerwa dla brakujących części |

Zasady:
- Żadnego modelu NC (nerka i ucho Z-Anatomy pozostają zakazane, `NC_BLOCKLIST`).
- Każdy plik GLB ma jedną licencję (`extras.atlas_license`, kontrola jak `check:atlas3d`), a stopka gabloty wymienia źródła.
- Bez płatnych generatorów i bez AI do kształtów. Jeśli dla nefronu nie znajdzie się otwarty model, jedyna droga bez naruszenia zasady to **schemat topologiczny** oznaczony „schemat, bez skali” (rury: kłębuszek, kanalik, pętla, kanalik zbiorczy), zbudowany z kolejności odcinków podanej przez agenta faktów. To jednak też decyzja użytkownika (§9).

## 7. Budżety, wydajność, ryzyka

| | Desktop (Intel UHD) | Telefon |
|---|---|---|
| Pobranie gabloty (GLB meshopt) | ≤ 4 MB (szacunek: serce i naczynia przycięte ok. 2–2,5 MB, mózg zdecymowany do ok. 250 tys. trójkątów ok. 2,5–3 MB) | ≤ 2 MB (decymacja ×0,4) |
| Trójkąty | ≤ 400 tys. (makro) + ≤ 60 tys. (mikro, wczytywane dopiero w filmie) | ≤ 150 tys. |
| Wywołania rysowania | ≤ 40 (w tym zalanie przekroju) | ≤ 20 |
| FPS | **≥ 50** (próg z E3; E3 osiągało 50–144 przy 0,3–0,9 mln trójkątów) | ≥ 30; film na telefonie domyślnie jako stopklatki |
| Wybór pod kursorem | ≤ 2 ms za odczyt, co ≥ 50 ms | dotyk: BVH |

Rozmiary to szacunki z proporcji E3 (meshopt i kwantyzacja). Zmierzę je w K1 serca, zanim padnie jakakolwiek obietnica.

**Ryzyka:**
1. **Ruch zastawek** (jedna siatka) to wariant A albo B, §4.1 i §9.
2. **Nerka w przekroju** nie wygląda jak rycina z podręcznika (labirynt kolumn). Rozwiązania to kolumny scalone z korą i zalanie przekroju; trzeba sprawdzić, czy bryły nerki są zamknięte.
3. **Przerwa 6,8 mm** mózg–rdzeń (dwa źródła): maskowanie ujęciem, bez dorysowywania.
4. **Grupowanie obszarów mózgu** musi sprawdzić agent faktów; np. zakręt obręczy i przyhipokampowy to „układ limbiczny” w części podręczników, a w innych płat.
5. **Mikro bez licencji** (nefron) to §6.
6. **Wydajność zalania przekroju** na Intel UHD (2 przebiegi): zmierzę w K2 serca.
7. **Ilość faktów:** każda gablota to ok. 15–30 struktur × (budowa + funkcja) i 6–7 kroków filmu. Agent faktów jest wąskim gardłem, więc treść Podstawową warto puścić najpierw.
8. **Spójność z atlasem:** HuBMAP to inny osobnik niż Z-Anatomy. Gablota jest osobną sceną, więc to nie przeszkadza. Przejście z widoku układu do gabloty to przenikanie, nie ciągły najazd.

## 8. Uzgodnienie z Reżyserem

Wysłałem Reżyserowi (sesja „Reżyser: wizualna prezentacja atlasu”) stanowisko z §3 i trzy pytania:
- (a) wspólny sznyt i wyróżnik układów krwionośnego, moczowego, pokarmowego i nerwowego w gablotach;
- (b) zgoda lub sprzeciw w sprawie kolorów, przekroju bez „eksplozji” i mikro w innym stylu;
- (c) wejście do gabloty.

**Stan:** do chwili zatwierdzenia planu odpowiedź nie przyszła. Gdy przyjdzie, dopiszę ją tu z przypisaniem, a punkty sporne oznaczę „do decyzji użytkownika”.

## 9. Do decyzji użytkownika

1. **Wejście do gablot:** (A) z widoku układu (klik w serce w 3D krwionośnym otwiera gablotę serca) albo (B) osobne menu „Narządy”. Proponuję oba: B jako główne, A jako skrót.
2. **Ruch zastawek serca:** (A) kolor i cząstki, bez ruchu płatków (zero ryzyka, tańsze o ok. 4 godziny) albo (B) podział prawdziwej siatki na płatki i animowane otwieranie (uproszczenie z podpisem „ruch poglądowy”). Proponuję A w pierwszej wersji, B jako dodatek.
3. **Nefron bez otwartego modelu:** zgoda na schemat topologiczny „bez skali” czy szukamy dalej (licencja Sketchfab i NIH 3D do sprawdzenia)?
4. **Kolejność i zakres:** serce jako wzór, potem nerka, wątroba, mózg. Pierwsza wersja każdej gabloty tylko z treścią Podstawową?

## 10. Kolejność i szacunek pracy

| Etap | Zakres | Godziny pracy agentów |
|---|---|---|
| **N1 Serce (wzór)** | K1: eksport GLB (HuBMAP serce i przycięte naczynia, `_ID`, manifest, kontrola licencji): 3–4 h. K2: `OrganView` (kamera i ujęcia, przekrój z zalaniem, wybór, panel, „Sprawdź się”, Spoczynek/Wysiłek): 8–10 h. K3: film (6 kroków, cząstki, ruch ścian, szyna kamery): 8–12 h. Zrzuty, pomiary, poprawki: 3–4 h | **22–30** |
| N2 Nerka | eksport i przekrój (kolumny, zalanie): 3 h; film i mikro: 8–14 h | 12–17 |
| N3 Wątroba | eksport i segmenty: 3 h; film i zrazik CC0: 8–12 h | 11–15 |
| N4 Mózg | grupowanie, decymacja, rdzeń: 5 h; film i neuron SWC: 10–14 h | 15–20 |
| Fakty (równolegle, agent faktów + drugi agent) | ok. 4–6 h na narząd | 16–24 |
| **Razem** | | **ok. 75–105** |

Serce idzie pierwsze jako wzór, bo:
- ma najlepszą geometrię (zamknięte bryły, wszystkie jamy i zastawki);
- to sedno programu liceum;
- jego historia (przepływ krwi) daje się pokazać bez modelu mikro;
- konwencja czerwone i niebieskie jest od razu czytelna.

Kod `OrganView` z serca (przekrój, wybór, panel, quiz, oś czasu filmu) przejdą bez zmian do pozostałych narządów. Dlatego kolejne są tańsze.

Punkty kontrolne jak w E3: raport „PUNKT KONTROLNY N1-K<n>” po każdej części. Pliki: `src/organs/**` i `public/organs/**`, bez zmian w `src/atlas/**` i `src/atlas3d/**` poza jednym punktem wejścia (do uzgodnienia z integratorem).
