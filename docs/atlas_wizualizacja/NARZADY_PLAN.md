# Gabloty narządów: plan (serce, nerka, wątroba, mózg), wersja 4 (PLAN 2)

Stan: 2026-11-26, Wizualizator 3D, gałąź `claude/atlas-wizualizacja-3d-1dc29a`.
**Bez kodu w `src/`.** Wdrożenie dopiero po zgodzie użytkownika (bramka A).
Test techniczny M2 jest **wykonany** po zgodzie użytkownika („Tak, M2 i M3”) w `prototypes/organs_m2/`; wyniki są w §7 i w `M2_TEST_SERCA.md`.

Dokumenty PLAN 2:
- ten plan;
- `FILM_PRZEGLAD.md`: przegląd filmu i weryfikacja mapy aktów;
- `BIOMOTION_ARCHITEKTURA.md`: wspólny moduł, granice plików, wejście diegetyczne, element → akt;
- `M2_TEST_SERCA.md`: test serca.

Wersja 4 dodaje do wersji 3:
- wyniki M2;
- numerację kamieni z decyzji Dyrygenta v2 (M1–M8);
- korektę o pochodzeniu modeli filmu;
- zamknięte spory 1 i 2;
- mózg gabloty jako decyzję techniczną Dyrygenta (Z-Anatomy/Brainder).

Wersja 3 uwzględniała:
- odpowiedzi użytkownika na pytania z wersji 1;
- nowe wymagania użytkownika co do jakości animacji i wspólnej pracy z filmem;
- decyzję Dyrygenta `docs/atlas_audyt/DECYZJA_UX_NARZADY.md` (4ec67df) i jego ocenę (`dyrygent/ocena_NARZADY_PLAN.md`);
- kartę stylu Reżysera (`docs/atlas_rezyser/UX_POSIEDZENIE.md`).

Podział ról: **styl należy do Reżysera** (tokeny, podpisy, podświetlenie, tempo). Tutaj jest zapisany jako parametry. **Wykonalność i budżet należą do mnie**: tam, gdzie karta przekracza budżet, podaję zamiennik.

Klatki koncepcyjne: `zrzuty/narzady/` (tablica zbiorcza `narzady_tablica.jpg`). To rendery Blendera prawdziwych modeli HuBMAP, a nie zrzuty aplikacji. Kolory na klatkach to wersja robocza sprzed karty Reżysera; obowiązują tokeny z §4.2. Skrypt: `skrypty/concept_narzady.py`. Liczby z modeli: `zrzuty/narzady/stats_modeli.json`.

![tablica](zrzuty/narzady/narzady_tablica.jpg)

## 0. W skrócie (dla użytkownika)

- **Animacje mają być dopracowane, nie „kreseczki”:**
  - krwinki to małe trójwymiarowe krążki, które płyną, obracają się i zwalniają w szerszych miejscach;
  - ściany serca naprawdę się kurczą, bo odkształcamy prawdziwy model;
  - światło i materiały są na poziomie filmu;
  - strzałki zostają tylko jako legenda.
- **Jedna wspólna „maszyneria” dla gablot, atlasu i filmu:** oś czasu, kamera po szynie, cząstki, materiały i ujęcia. Każda animacja narządu ma z góry wskazane miejsce w filmie 12 aktów (§2).
- **Wejście do gabloty jest „w świecie”:** klik w serce w widoku 3D układu. Kamera wjeżdża w serce, ciało gaśnie, a narząd zostaje w studiu gabloty. Serce, nerka i wątroba to już dziś **te same modele** w widoku układów i w gablocie, więc żadnej podmiany nie widać. Mózg ma osobny trik (§3).
- **Słabsze komputery dostają tę samą animację w lżejszej oprawie** (mniej krwinek, prostsze światło), a nie gorszą animację dla wszystkich (§4.4).
- **Test techniczny serca jest zrobiony (M2).** Na zwykłej grafice laptopa (Intel UHD) serce z przekrojem, skurczem i 1500 krwinkami 3D chodzi w 91 klatkach na sekundę (próg to 50). Wynik: nagranie i zrzuty w `zrzuty/m2/` (§7). Dalej **kamienie milowe z wynikiem do obejrzenia** (§8).
- Pierwsza wersja ma tylko **zakres Podstawowy** (Twoja decyzja). Nefron to wyraźnie oznaczony schemat.

## 1. Decyzje, na których stoi plan

| Kto | Decyzja | Skutek w planie |
|---|---|---|
| Użytkownik | Wejście „osobne, ale diegetyczne po kliknięciu”; menu „Narządy” najwyżej jako dodatek | §3 |
| Użytkownik | Zastawki: A (stan i przepływ) w pierwszej wersji, B (ruch płatków) później; wcześniej, jeśli test pokaże, że B jest tani | §6.1, §7 |
| Użytkownik | Nefron: schemat topologiczny „bez skali”, wyraźnie oznaczony | §6.2 |
| Użytkownik | Pierwsza wersja tylko z zakresem Podstawowym | §6: kolumna R to „później” |
| Użytkownik | „Dość dopracowane animacje 3D, a nie te kreseczki”; „animacje i grafikę stąd wkomponuj potem do filmu” | §2, §4 |
| Dyrygent | Rama wspólna Reżysera: lokalizator, chip skali, przełącznik momentu pod sceną, „Jak czytać”, mały przełącznik „Podstawowy \| Rozszerzony” w pasku górnym. Tryby gabloty (Zwiedzaj, Jak to działa, Sprawdź się) są zakładkami w nagłówku panelu bocznego | §5 |
| Dyrygent | W widoku układów obowiązuje kontrakt 3D Reżysera: wyróżnik ≤ 1 ms GPU na UHD, poniżej 50 FPS nakładka 2D, bez półprzezroczystych nakładek 3D, bez pulsu `sin(uTime)` | dotyczy E3; gablot dotyczy §4.4 |
| Dyrygent | Kamera gablot (pochylenie ±35°, zoom 0,6–2,5×) to **wyjątek tylko dla gablot**; widok układów E3 zostaje bez zmian (obrót poziomy, ujęcia) | §5.2 |
| Dyrygent | Kolejność: F1 (N1-K1: eksport serca, pomiar FPS i MB), F2 (OrganView serca na ramie integratora), pokaz i test z licealistami, dopiero potem N2–N4 (może je prowadzić drugi agent 3D) | §8 |
| Dyrygent | Poziomy: automatyzm serca jest w P (P V.4.9), „proces tworzenia moczu” też w P (P V.5.3) | §6.1, §6.2 |
| Dyrygent | Fakty podręcznikowe (E1-K3) trzeba wznowić razem z N1, inaczej panel serca będzie pusty | §8 |

## 2. Architektura wspólna z filmem

### 2.1 Co już jest w filmie (przejrzane)
- `src/director/ShotChoreography.ts`: typ `CinematicShot` z punktami pozycji i celu (krzywa), FOV, głębią ostrości, presetem światła i rodzajem przejścia (`continuous`, `occlusion_dive`, `match_cut`), opcjonalnie `dynamicSampler` (np. lot wzdłuż osi naczynia). Funkcja `evaluateActShot` liczy kamerę dla postępu aktu.
- `src/director/CinematicDirector.tsx`, `CameraSystem.tsx`: światło według presetu i kamera z celem (`erythrocyteCameraTarget`).
- `src/director/ScaleTransitionSystem.tsx`: przenikanie skal (tło, mgła) bez czarnych ekranów.
- `src/core/SimulationCore.ts` (`liveSimulationRef`, magazyn stanu) i `TimelineEngine.ts` (12 aktów, 1080 s).
- `src/core/QualityManager.ts`: poziomy Low, Medium, High, Ultra i Cinematic z mnożnikiem cząstek, DPR, cieniami, postprocesem oraz `AdaptiveQualityController` (histereza po p75 czasu klatki).
- Shadery: `vascularFlowShader.ts` (ściana naczynia tętnicza lub żylna, fala tętna), `cutawayShader.ts` (przekrój płaski lub kulisty z obwódką), `bioTissueShader.ts`, `actionPotentialShader.ts`.
- `src/scenes/Act03Cardiopulmonary.tsx`: `cardiopulmonary.glb` i `bloodstream_tunnel.glb` z osią tunelu (`sampleBloodstreamCenterline`).
- Modele filmu (`public/models/*.glb`) **mają opisane pochodzenie i licencje** w `docs/LICENSES_AND_ASSETS.md` i w skryptach `blender/gen_0*.py`. W wersji 3 błędnie napisałem, że nie mają; poprawka za Dyrygentem. Licencje: MPFB2 CC0, HuBMAP/Allen CC BY, PDB domena publiczna, Poly Haven CC0.
  - Wyjątek: `brain_macro.glb` z Allen **v1.2**, a CC BY obowiązuje od v1.3. To niepilne, bo plik nie jest nigdzie opublikowany, ale trzeba go przebudować przed publikacją filmu jako osobny mały kamień (§8).
  - Serce filmu (`cardiopulmonary.glb`) M2 zastępuje pełnym sercem z ID struktur i kształtami liczonymi z geometrii (`FILM_PRZEGLAD.md` §4).
- Pełny przegląd i ocena przydatności każdego elementu: `FILM_PRZEGLAD.md`. Architektura modułu: `BIOMOTION_ARCHITEKTURA.md`.

### 2.2 Wspólny moduł `src/biomotion/` (propozycja; pliki powstaną dopiero przy wdrożeniu)

| Część | Rola | Skąd się bierze | Kto używa |
|---|---|---|---|
| `Timeline` | kroki z czasem, pauza, krok wstecz i naprzód, prędkość; tryb „stopklatki” przy `prefers-reduced-motion` | uogólnienie `TimelineEngine` (akty → kroki) | film (akty), gabloty (kroki filmu), atlas (przewodnik „Jeden interwał”) |
| `ShotRail` | kamera po krzywej z celem, FOV, przejścia `continuous`, `occlusion_dive` i `match_cut` | **typ `CinematicShot` bez zmian**, wydzielony z `ShotChoreography` | film, gabloty (ujęcia i wejście diegetyczne), atlas (ujęcia kluczowe = `Rail` z E3) |
| `FlowParticles` | cząstki 3D z kształtem (krwinka, kropla, pęcherzyk) na torach; prędkość z przekroju naczynia; orientacja wzdłuż toru i obrót | nowe; tory jak `vessel_path` z E3, liczone w Blenderze z geometrii | film (akt 3 i inne), gabloty, atlas (wyróżnik „ROZDZIAŁ”, „FILTR” zamiast rurek) |
| `TissueMotion` | odkształcenie prawdziwej siatki: morph target liczony z geometrii i krzywa fazy | nowe; cel morfu z Blendera (§4.2) | gabloty, film |
| `BioMaterials` | materiały tkanek z poziomami jakości, stan i podświetlenie przez teksturę stanu (`StateTex` z E3), przekrój (`cutawayShader` + zalanie stencil) | scalenie `atlasMaterial` (E3) i shaderów filmu | wszyscy |
| `QualityTier` | wybór poziomu i automat | **`QualityManager` bez zmian** (te same nazwy poziomów) | wszyscy |
| `ShotLibrary` | ujęcia narządów jako dane (JSON, metry w ramie ciała) | nowe | gablota i film korzystają z tych samych ujęć |

Zasady:
- moduł nie zna treści (fakty, teksty), tylko liczby stanu i dane;
- treść dostarczają gabloty, plansze i akty;
- styl (tokeny, tempo) przychodzi z karty Reżysera jako parametry.

### 2.3 Gdzie animacje gablot trafią w filmie

Zweryfikowane w kodzie (`FILM_PRZEGLAD.md` §5):
- serce jest w aktach 3 i 12 oraz jako proxy w 1, 6 i 11;
- mózg w 2, 8, 10 i 12;
- **wątroby i nerki w filmie nie ma** (wątroba tylko w tekście aktu 7), więc gabloty wnoszą pierwsze modele;
- mapa Dyrygenta (decyzja v2 §3) jest przyjęta: wątroba w aktach 5, 7 i 11, nerka w 6 i 11, mózg w 2, 8 i 10.

| Animacja gabloty | Akt filmu | Jak |
|---|---|---|
| Serce: krążenie, cykl, krwinki | **Akt 3** „Serce, płuca i układ krążenia” | ujęcie serca HuBMAP z cyklem i krwinkami zamiast (albo przed) `cardiopulmonary.glb`; lot krwinki to ten sam `FlowParticles` co tunel |
| Mózg: decyzja „biegnę”, kora ruchowa → rdzeń | **Akt 2** „Mobilizacja układu nerwowego” (podtytuł: „od decyzji o biegu do aktywacji mięśni”) | ten sam tor impulsu i te same ujęcia |
| Wątroba: glikogen → glukoza do krwi | **Akt 7** „Ciało rozmawia z mózgiem” (mięśnie ↔ wątroba) i **Akt 5** „Wojna o energię” | stan „MAGAZYN”, krople glukozy jako `FlowParticles` |
| Nerka: krew → filtr → mocz | **Akt 6** „HIIT: granice intensywności” (równowaga) i **Akt 11** „Regeneracja i powrót do równowagi” | przepływ nerkowy w sprincie i po nim |

Licencje w filmie:
- film z geometrią Z-Anatomy jest utworem zależnym BY-SA (rozstrzygnięcie 3), więc napisy końcowe muszą podawać źródła;
- HuBMAP wymaga atrybucji BY.

## 3. Wejście diegetyczne (klik w narząd w widoku 3D układu)

Technika i ryzyka w szczegółach: `BIOMOTION_ARCHITEKTURA.md` §4. Do warunku Dyrygenta dla M5 (ciało ≤ 5% krycia w kadrze końcowym) dochodzi **okno kuliste wokół narządu** (`cutawayShader` tryb 2 z filmu), które wycina żebra i naczynia z przodu.

Przebieg (np. serce w widoku krwionośnym):
1. **Klik** (albo Enter na podświetlonej strukturze, bo klawiatura działa tak samo) uruchamia ujęcie `organ_dive` z biblioteki ujęć, typu `occlusion_dive`.
2. **Najazd (1,2 s, szyna):** kamera jedzie do narządu. Reszta ciała gaśnie ditheringiem: kontekst przechodzi do 0 tym samym mechanizmem co wygaszanie warstw w E3, czyli bez półprzezroczystych nakładek (kontrakt Reżysera). Tło przechodzi z tła układu w tło studia gabloty (`ScaleTransitionSystem`).
3. **Podmiana geometrii:**
   - **Serce, nerka, wątroba:** w widoku układów E3 to **już te same pliki HuBMAP** (sprawdzone w `bindings.json`: krwionośny `hra:VH_M_Heart.glb`, wydalniczy `hra:VH_M_Kidney_L/R.glb`, pokarmowy `hra:VH_M_Liver.glb`). Nie ma czego ukrywać. Gablota tylko dociąga **wnętrze** (zastawki i jamy już są, mięśnie brodawkowate, przekrój) i wyższy poziom szczegółu. Pliki gabloty są pobierane w tle, kiedy kursor najedzie na narząd (wyprzedzenie ok. 0,5–1 s). Jeśli klik przyjdzie wcześniej, najazd zwalnia, aż plik będzie gotowy (wskaźnik postępu w lokalizatorze).
   - **Mózg:** widok układów używa Z-Anatomy. Rekomendacja: **gablota mózgu też na Z-Anatomy/Brainder** (CC BY-SA, osobny plik), §6.4. Wtedy podmiany nie ma. Gdyby wybrano Allen (HuBMAP), podmiana dzieje się **pod pełnym zasłonięciem**: kamera wjeżdża w powierzchnię zakrętu przedśrodkowego, aż kora zajmie cały kadr (przejście `occlusion_dive` z filmu). Wtedy w jednej klatce zamieniamy model i wyjeżdżamy już z modelem Allen ustawionym w tej samej ramie (`align_hubmap`, średni błąd 1,56 cm).
4. **Ustawienie w studiu (0,9 s):** narząd obraca się do pierwszego ujęcia gabloty, a panel i zakładki wsuwają się.
5. **Wyjście (Esc, „Wróć do układu”):** to samo ujęcie odtworzone wstecz.
6. **`prefers-reduced-motion`:** zamiast lotu przenikanie 0,3 s.

Menu „Narządy” w grupie menu atlasu: dodatek, otwiera gablotę bez lotu.

## 4. Jakość animacji („dopracowane 3D”)

### 4.1 Krwinki i cząstki 3D (`FlowParticles`)
- **Kształt:**
  - krwinka czerwona to dwuwklęsły krążek z równania kształtu z literatury (np. Evans i Fung 1972; to fakt do bramki, a nie wymysł), siatka 2 poziomów szczegółu: ok. 120 i 320 trójkątów;
  - płytki i krwinki białe tylko tam, gdzie ma to cel dydaktyczny;
  - inne cząstki (glukoza, mocz, impuls) jako proste bryły w stylu „SCHEMAT” (§4.3).
- **Ruch:**
  - tory to krzywe środkowe naczyń i strugi przez jamy, liczone w Blenderze z geometrii (jak `vessel_path` w E3);
  - prędkość jest odwrotnie proporcjonalna do pola przekroju naczynia mierzonego na geometrii, czyli wolniej w szerokich miejscach;
  - rozrzut w przekroju (bliżej osi szybciej), orientacja wzdłuż stycznej toru z obrotem;
  - w jamach serca strugi „poglądowe”, bo to nie symulacja płynów.
- **Technika:**
  - `InstancedMesh`, położenie liczone w shaderze z tekstury toru (punkty, pole przekroju), czyli 1 wywołanie na rodzaj cząstki;
  - liczba według poziomu jakości (§4.4).
- **Strzałki** zostają tylko jako legenda (przycisk „pokaż kierunki”) i w nakładce 2D telefonu.

### 4.2 Odkształcenie tkanek (`TissueMotion`)
- **Skurcz ścian serca:**
  - dla każdej jamy w Blenderze liczę oś (od koniuszka do środka podstawy, z geometrii);
  - morph target „skurcz” to przesunięcie każdego wierzchołka ściany w stronę osi o stały ułamek;
  - w aplikacji wagę morfu steruje krzywa fazy cyklu (z faktów: kolejność i proporcje faz);
  - wielkość skurczu to liczba, więc do czasu faktu podpisujemy „ruch poglądowy”.
  Kształt pochodzi z prawdziwego modelu, a ruch go tylko przekształca.
- **Zastawki:**
  - wariant A: stan (barwa, obrys) i przepływ krwinek przez otwartą;
  - wariant B: podział siatki zastawki na płatki (klasyfikacja wierzchołków po kącie wokół osi ujścia) i morph „otwarta”. Test (§7) mierzy koszt B.
- **Inne narządy:** nerka i wątroba nie mają widocznego ruchu własnego. Ich animacja to przepływ (§4.1) i stan (np. poziom glikogenu jako wypełnienie). Mózg: impuls jako fala jasności po torze i po komórce (puls, który ma zmienną, czyli dozwolony).

### 4.3 Materiały, światło i gramatyka „model / schemat”
- **Makro:** materiał tkanki jako parametr karty Reżysera. Zalecenie techniczne:
  - okluzja otoczenia wypieczona w Blenderze do koloru wierzchołków (darmowa w czasie działania, daje głębię zagłębień i bruzd);
  - światło klucz, wypełnienie i kontra;
  - na wyższych poziomach połysk wilgotnej tkanki (`sheen`/`clearcoat` w `MeshPhysicalMaterial`) i światło otoczenia z mapy środowiska.
- **Mapowanie tonów:** w atlasie (E3) wyłączone dla zgodności kolorów z planszami 2D. W gablotach i filmie to wybór Reżysera; technicznie oba warianty kosztują tyle samo.
- **Gramatyka (spór 2 rozstrzygnięty przez Dyrygenta):**
  - materiał realistyczny = model z danych;
  - **schemat (nefron, zrazik, układ bodźcoprzewodzący, skrzyżowanie piramid) = BRYŁA 3D** w materiale schematu: jednolity `light` układu, płaskie cieniowanie bez faktury i AO, obrys 1,5 px, chip „schemat · bez skali”;
  - kreska tylko w legendzie „Jak czytać”.
- **Profile wyglądu** (M2): `atlas` (bez mapowania tonów) i `film` (AgX).
  - Bez kompensacji czerwień `artery` w profilu film odbiega od tokenu o ΔE00 18, a krwinki na poziomie High gubią się na różowej ścianie.
  - Moduł dostaje tablicę kompensacji barw i pomiar ΔE na zrzutach (`BIOMOTION_ARCHITEKTURA.md` §2).

### 4.4 Poziomy jakości (zamiast obniżania poprzeczki dla wszystkich)

| Poziom (`QualityManager`) | Sprzęt | Krwinki | Światło i materiały | Cel |
|---|---|---|---|---|
| Low | Intel UHD, słabe laptopy | ok. 600–1000 (krążek 120 trójkątów) | AO z wierzchołków, 3 światła, bez postprocesu | **≥ 50 FPS** przy 1440×900 |
| High | grafika dedykowana (np. RTX 4050) | 3–5 tys. (320 trójkątów) | + połysk, mapa środowiska, SSAO | ≥ 60 FPS |
| Cinematic | render filmu i wypieki | dowolnie | Blender (EEVEE lub Cycles) w slotach | film i nagrania |

- **Ta sama animacja i te same kroki na każdym poziomie.** Różni się tylko gęstość i oprawa.
- Automat `AdaptiveQualityController` (istniejący) i ręczny wybór w ustawieniach.
- Krok, który na Low nie trzyma 50 FPS, dostaje wypiekany film (rozstrzygnięcie 2 Dyrygenta).

### 4.5 Budżet gabloty (Low, Intel UHD, 1440×900)

| | Zwiedzanie | Film |
|---|---|---|
| Trójkąty | ≤ 400 tys. narządu + przekrój | + cząstki ≤ 150 tys. (instancje) + schemat mikro ≤ 60 tys. |
| Wywołania rysowania | ≤ 40 (1 na plik × warstwę, ID w wierzchołku; +2 zalanie przekroju; +1 obrys wybranej struktury) | ≤ 50 |
| Pobranie | ≤ 4 MB (narząd i morfy; szacunek do pomiaru w F1) | mikro i tory dociągane: ≤ 1 MB |
| GPU na klatkę | ≤ 20 ms (= 50 FPS); wybór pod kursorem przez GPU ok. 1–2 ms, nie częściej niż co 50 ms | jw. |

Wszystkie liczby to szacunki z proporcji E3 i **zostaną zmierzone w teście (§7)**, zanim padnie jakakolwiek obietnica.

## 5. Gablota (rama i interakcja)

### 5.1 Rama (karta Reżysera i decyzja Dyrygenta)
- **Pasek górny:** „Atlas › układ › narząd”, cel lekcji i mały przełącznik „Podstawowy | Rozszerzony” (w pierwszej wersji zakres R jest wyłączony).
- **Pod sceną:** przełącznik momentu Spoczynek/Sprint, jak w atlasie.
- **Pozostała rama:**
  - lokalizator „gdzie w ciele” jako wypieczony obrazek 2D (sylwetka Z-Anatomy BY-SA i narząd jako osobne pliki);
  - chip skali;
  - „Jak czytać” w lewym dolnym rogu.
- **Panel boczny:** zakładki **Zwiedzaj · Jak to działa · Sprawdź się** w nagłówku. Treść ma kolejność: pytanie → liczba-bohater → opis (≤ 3 zdania) → Sprawdź się → Więcej.
- **Podpis:** nazwa Figtree 600 16 px, opis 14 px, liczby JetBrains Mono, tło `#0d1526` przy kryciu ok. 85%, kontrast ≥ 4,5:1, linia 1 px w `light`, kropka na strukturze.

### 5.2 Kamera (wyjątek tylko dla gablot)
- Obrót poziomy z przyciąganiem do ujęć, pochylenie ±35°, zoom 0,6–2,5× kadru głównego. Kolejne ujęcia: `ShotRail` 1,2 s.
- Widok układów E3 zostaje bez zmian: obrót poziomy i ujęcia, bez zoomu.

### 5.3 Najechanie, wybór, podświetlenie
- **Wybór przez GPU** (render ID do 1 px pod kursorem). Na dotyku zamiast tego BVH (three-mesh-bvh, MIT), tylko na tablecie.
- **Podświetlenie wg karty:** wybrana część w pełnym kolorze z obrysem 2 px `light`, reszta 35% (`restMix`), bez emisji i bez pulsu.
  - Obrys: technika „odwróconej powłoki” tylko dla wierzchołków z wybranym ID (1 dodatkowe wywołanie, ok. 0,2 ms).
  - Zamiennik, gdyby obrys przy dużych strukturach był za gruby w zbliżeniu: obrys liczony w ekranie z bufora ID (ok. 1 ms; tylko na High).
- **Puls** tylko na strukturze z bieżącego zdania filmu, w zbliżeniu.

### 5.4 Przekrój
- Płaszczyzna przycięcia z **zalaniem przez stencil** (ściana ma grubość). Powierzchnia cięcia w `light` układu, obrys 1,5 px `light`.
- „Otwarcie” to ruch płaszczyzny, bez rozsuwania części.
- Warunek to zamknięte bryły: serce spełnia go (sprawdzone), nerkę i wątrobę sprawdzę w ich K1.

### 5.5 Sprawdź się
- Pytania: „Wskaż…” (klik) i „Co to jest?” (3 odpowiedzi). Pula pytań pochodzi tylko ze struktur z faktami `checked_agent` i z zakresu P.
- Wynik zostaje lokalnie, bez punktów za czas.

### 5.6 Dostępność i telefon
- **Klawiatura:**
  - ← → i 1–9 wybierają ujęcia;
  - Tab i Shift+Tab przechodzą po częściach (podświetlenie i odczyt nazwy);
  - Enter otwiera panel;
  - S zmienia moment;
  - spacja to pauza, a , i . krok wstecz i naprzód;
  - Esc wraca do układu.
  Rola `application`, podpisy filmu w `aria-live="polite"`.
- **`prefers-reduced-motion`:** film jako stopklatki kroków, przejścia przenikaniem, bez lotu kamery i bez cząstek.
- **Podpisy filmu** zawsze na ekranie (1–2 zdania na krok). Krok trwa co najmniej max(4 s; 0,3 s na słowo + 1,5 s), z pauzą ręczną i przyciskiem „Dalej” (tempo z karty).
- **Telefon:** decyzja §7 to „3D najpierw na komputerze”. Telefon dostaje **planszę 2D gabloty**: wypieczone ujęcia (renderowane tym samym modułem w jakości Cinematic) z podpisami HTML. Do tego lista struktur do stuknięcia (maska ID wypieczona z renderem podświetla część i otwiera panel) oraz film jako stopklatki albo krótkie nagranie. **Pytanie do użytkownika:** czy 3D gablot ma od początku działać także na telefonie (§10).

## 6. Narządy

Zakres P to pierwsza wersja. Kolumna R jest na później. Każdy tekst przechodzi bramkę §3.6 (fakty podręcznikowe z ISBN, drugi agent), więc **teksty zależą od E1-K3**. Geometria, ruch i UI powstają równolegle z polami „czeka na fakt”.

### 6.1 Serce (gablota wzorcowa)
- **Źródło:**
  - HuBMAP `VH_M_Heart` (14 części, 164 tys. trójkątów; jamy i przegroda to zamknięte bryły) i naczynia przy sercu z `VH_M_Blood_Vasculature_Heart` (ok. 70 tys. po przycięciu); CC BY 4.0;
  - układ bodźcoprzewodzący jako **schemat własny** (węzły i drogi w materiale schematu).
- **Kolor (P):** jamy prawe `vein`, lewe `artery` (krew, którą zawierają; tokeny krwionośnego), barwa układu dla obrysu i serca z zewnątrz. Ocena Dyrygenta pkt 6, karta Reżysera.

| | P (pierwsza wersja) | R (później) |
|---|---|---|
| Budowa | 2 przedsionki, 2 komory, przegroda, zastawki (nazwy szkolne), aorta, pień płucny, żyły główne i płucne | mięśnie brodawkowate, naczynia wieńcowe, grubość ścian komór |
| Działanie | obieg płucny i ustrojowy (P V.4.8); **automatyzm** (P V.4.9): węzeł zatokowo-przedsionkowy i fala pobudzenia w uproszczeniu; skurcz i rozkurcz | pełny układ bodźcoprzewodzący (węzeł AV, pęczek, włókna), fazy cyklu z zastawkami w każdej fazie |
| HIIT | w sprincie serce bije szybciej i mocniej (liczby po bramce, flaga protokołu) | objętość wyrzutowa i pojemność minutowa |

Film (P):
1. krew wraca żyłami (krwinki `vein`) do prawego przedsionka, z płuc do lewego (krwinki `artery`);
2. węzeł zatokowo-przedsionkowy, fala pobudzenia po przedsionkach (schemat), skurcz przedsionków (morph);
3. skurcz komór (morph), zastawki wariant A, krwinki do aorty i pnia płucnego;
4. rozkurcz, ujęcie podstawy serca od góry;
5. Sprint: szybszy cykl i gęstsze krwinki.

Każdy krok wprowadza najwyżej 1 nowy ruch, a naraz trwają najwyżej 3 (zgoda z Reżyserem).

Film 12 aktów: **akt 3**.

Fakty potrzebne do P:
- nazwy szkolne jam, zastawek i naczyń;
- kolejność przepływu w obu obiegach;
- położenie węzła zatokowo-przedsionkowego (opis do umieszczenia znacznika);
- kolejność pobudzenia w uproszczeniu;
- kolejność skurczu i rozkurczu;
- tętno: spoczynek i sprint protokołu wzorcowego;
- równanie kształtu krwinki (źródło, jeśli krążek ma być wierny).

Do R: fazy z zastawkami, elementy układu bodźcoprzewodzącego, grubość ścian, objętość wyrzutowa.

Ryzyka:
- zastawki to jedna siatka (wariant B wymaga podziału);
- wielkość skurczu to liczba („ruch poglądowy” do czasu faktu).

### 6.2 Nerka
- **Źródło:** HuBMAP `VH_M_Kidney_L` (84 tys.; słupy scalone z korą), naczynia nerkowe, `VH_M_Ureter_L`; CC BY 4.0. Nefron jako **schemat własny „bez skali”** (decyzja użytkownika): rury po krzywych, kłębuszek jako kłębek rur, materiał schematu, ok. 20–30 tys. trójkątów.
- **Kolor:** miąższ w odcieniach tokenu `urinary`, naczynia `artery`/`vein`. Na klatce `nerka_1` są kolory robocze sprzed karty.
- **Warunek przejścia K1 nerki:** zrzut przekroju **bez „labiryntu”** (kolumny scalone z korą, zalanie stencil) (ocena Dyrygenta pkt 2).

| | P | R |
|---|---|---|
| Budowa | kora, rdzeń (piramidy), miedniczka, moczowód, tętnica i żyła nerkowa; nefron jako jednostka | brodawki, słupy, kłębuszek, torebka, odcinki kanalików, pętla, kanalik zbiorczy |
| Działanie | **proces tworzenia moczu** (P V.5.3): filtracja i resorpcja w ujęciu ogólnym; **znaczenie regulacji hormonalnej w ogólnym ujęciu** (to też jest w brzmieniu P V.5.3) | odcinki nefronu, wydzielanie kanalikowe, konkretne hormony (np. wazopresyna, aldosteron), miejsce i kierunek działania |
| HIIT | w sprincie do nerek płynie mniej krwi (wyróżnik „FILTR”) | liczby przepływu i filtracji |

Uwaga do oceny Dyrygenta: P V.5.3 brzmi „przedstawia proces tworzenia moczu oraz wyjaśnia znaczenie regulacji hormonalnej w tym procesie”. W P zostawiam więc jedno zdanie o tym, że hormony regulują ilość wody w moczu, bez nazw hormonów. Nazwy i mechanizmy idą do R.

Film (P):
1. krew tętnicą do nerki (krwinki);
2. najazd w korę i przenikanie skal do schematu nefronu;
3. filtracja (małe cząstki przechodzą, duże zostają);
4. resorpcja (część wraca do krwi);
5. mocz (krople w kolorze z karty) przez brodawkę do miedniczki i moczowodu;
6. Sprint.

Film 12 aktów: **akt 6 i akt 11**.

Fakty do P:
- nazwy szkolne części nerki;
- kolejność drogi krwi i moczu;
- co przechodzi przez filtr, a co nie (kategorie);
- co jest odzyskiwane (kategorie);
- zdanie o regulacji hormonalnej;
- zmiana przepływu nerkowego w sprincie.

### 6.3 Wątroba
- **Źródło:**
  - HuBMAP `VH_M_Liver` (60 tys.), naczynia (żyła wrotna z gałęziami, tętnice, 3 żyły wątrobowe), pęcherzyk, drogi żółciowe bez przewodów trzustkowych; CC BY 4.0;
  - plik wątroby **ma 8 brył segmentowych** (sprawdzone), więc BodyParts3D jest niepotrzebne, chyba że agent faktów nie dopasuje nazw do numeracji;
  - zrazik jako **schemat własny** (graniastosłup sześciokątny z żyłą środkową, triadami w narożach i beleczkami; materiał schematu; ok. 30–50 tys.).
- **Kolor (karta Reżysera):** miąższ w odcieniach tokenu `digest`; żyła wrotna `vein`; pęcherzyk i drogi żółciowe w `digest.light` z kreskowanym obrysem (kreska w shaderze wzdłuż rury, 0 dodatkowych wywołań); segmenty (R) z **numerem 1–8** jako podpis HTML w środku segmentu, bo kolor nie może być jedynym nośnikiem.

| | P | R |
|---|---|---|
| Budowa | płaty, pęcherzyk, przewody żółciowe, żyła wrotna, tętnica wątrobowa, żyły wątrobowe | segmenty z numerami, więzadła, zrazik |
| Działanie | rola wątroby w przemianach substancji wchłoniętych (P V.2.7): krew z jelit najpierw do wątroby; żółć i trawienie tłuszczów (P V.2.3); magazyn glikogenu i uwalnianie glukozy, antagonizm hormonów (P V.6.3, III.4) | glikogenoliza i glukoneogeneza ze schematu (R III.7), kierunki krwi i żółci w zraziku |
| HIIT | w sprincie wątroba uwalnia glukozę (wyróżnik „MAGAZYN”) | liczby wyrzutu glukozy |

Film (P):
1. żyła wrotna przynosi krew z jelit (krwinki i krople substancji);
2. „magazyn”: glikogen jako wypełnienie płatów;
3. żółć drogami do pęcherzyka i dwunastnicy;
4. Sprint: poziom glikogenu spada, a krople glukozy wychodzą do krwi.

Zrazik (mikro) dopiero w R.

Film 12 aktów: **akt 7 i akt 5**.

Fakty do P:
- nazwy płatów;
- droga krwi wrotnej;
- rola żółci;
- rola w przemianach (lista z podręcznika);
- hormony, które podnoszą i obniżają glukozę (nazwy szkolne);
- zmiana wyrzutu glukozy w sprincie (badanie, flaga protokołu).

### 6.4 Mózg
- **Źródło (zmiana rekomendacji):**
  - **Z-Anatomy/Brainder** (CC BY-SA, osobny plik `za_*`), czyli ten sam mózg co w widoku układów (`bindings.json` mózgu: `za:Precentral gyrus.l` itd.). Daje wejście diegetyczne bez podmiany i ciągłą drogę mózg → pień → rdzeń z jednego źródła (bez przerwy 6,8 mm między Allen a rdzeniem VH). Nie wymaga też pobierania;
  - Allen (HuBMAP) zostaje alternatywą. Lokalny plik to v1.2, a CC BY obowiązuje od v1.3, więc wymagałby pobrania nowszej wersji;
  - moje klatki mózgu (`mozg_1`, `mozg_2`) są z Allen v1.2: to dokumentacja wewnętrzna, nie do publikacji;
  - neuron: rekonstrukcja z NeuroMorpho (CC BY 4.0, 3 cytaty) albo schemat. Dopiero w R.
- **Kolor:** token `brain`, drogi nerwowe w mózgu `nerve`.

| | P | R |
|---|---|---|
| Budowa | półkule, płaty (z faktów podręcznikowych; podstawa ich nie wymienia), móżdżek, pień (śródmózgowie, most, rdzeń przedłużony), międzymózgowie, rdzeń kręgowy | wzgórze, podwzgórze, przysadka, ciało modzelowate, komory, jądra podstawy, hipokamp |
| Działanie | budowa i funkcje mózgu i rdzenia (P V.7.5): co robią główne części; polecenie ruchu z kory do rdzenia jako przykład | ośrodki autonomiczne, oś podwzgórze–przysadka, ośrodek głodu i sytości, skrzyżowanie dróg |
| HIIT | „decyzja: biegnę” (wyróżnik „OBSZAR + IMPULS”, bez prędkości liczbowej) | |

Film (P):
1. płaty (obszary podświetlane po kolei);
2. kora ruchowa: impuls (fala jasności, `nerve`);
3. droga w dół przez pień do rdzenia (tor z geometrii);
4. rdzeń → nerw → mięsień (przejście do widoku mięśniowego).

Film 12 aktów: **akt 2**.

Fakty do P:
- podział na płaty i ich funkcje (podręcznik);
- funkcje móżdżku, pnia i międzymózgowia;
- położenie kory ruchowej;
- kolejność drogi polecenia ruchu.

Ryzyko: liczba obszarów Brainder i jej koszt (do pomiaru w K1 mózgu). Rezerwa: scalanie zakrętów w płaty, tak jak przy Allen (281 z 283 obszarów przypisanych automatem).

## 7. Test techniczny serca: wykonany (M2 decyzji Dyrygenta = moje dawne M0)

Szczegóły: `M2_TEST_SERCA.md`, zrzuty i nagranie w `zrzuty/m2/`, prototyp w `prototypes/organs_m2/` (port 5202).

| Wynik | Wartość (Intel UHD, 1440×900) |
|---|---|
| Low: serce HuBMAP 271 tys. trójkątów, przekrój ze stencilem, 1500 krwinek 3D, skurcz | **91 FPS** (zastawki B: 94,8; preset klatki M1: 77) |
| High (MSAA, DPR 1,5, 3500 krwinek, MeshPhysical, środowisko) | 10,5 FPS na UHD; **RTX niezmierzony** |
| Prędkość z przekroju | tak: tory z promieniem z geometrii, v ~ 1/r², czekanie przy zamkniętej zastawce |
| Zastawki B | 0 FPS kosztu, budowa automatyczna; wierność umiarkowana (lejek, bez rozdzielenia płatków), więc **B od razu z chipem „ruch poglądowy”** |
| Półprzezroczysta ściana naczynia | +15 ms (Low się nie mieści), więc Low = dithering Bayera (+1 ms), High = prawdziwa |
| MSAA na UHD | ok. 12 ms, więc Low bez MSAA |
| Plik serca (meshopt) | 1,91 MB |
| Czas | szacunek 6–12 h (Dyrygent) i 4 h (mój), rzeczywisty ok. 25 min zegarowych; **nie przenoszę tego tempa na M4–M5** |

Do decyzji Dyrygenta i Reżysera: ściany serca w barwie mięśnia, a barwę niesie krew (jak klatka M1), czy w barwie krwi (ocena Dyrygenta pkt 6)? Rekomenduję jak M1. W prototypie to przełącznik `walls`, bez kosztu.

## 8. Kamienie milowe (numeracja decyzji Dyrygenta v2)

Zgodność numeracji:

| Moje (wersja 3) | Decyzja Dyrygenta v2 |
|---|---|
| M0 test serca | **M2** (wykonany) |
| M1 = F1 eksport serca | część **M5** (K1) |
| M2 = F2 OrganView serca | **M5** (K2) |
| M3 film serca i wejście | **M5** (K3) i **M7** (wpięcie do aktów) |
| M4 moduł w filmie | **M4** |
| M5 test z licealistami | **bramka B** |
| N2–N4 nerka, wątroba, mózg | **M8** |

Moje kamienie w numeracji Dyrygenta:

| Kamień | Wynik do obejrzenia | Warunek przejścia | Niepewność |
|---|---|---|---|
| **M2** test serca | nagranie, 2 serie cyklu, tabela FPS, porównanie z M1 | ✓ Low 91 FPS | — |
| **M2′** przeliczenie (Dyrygent) | szacunek a rzeczywistość | | |
| **bramka A** (użytkownik) | M1 + M2 | zgoda na M3–M6 | |
| **M4** moduł `src/biomotion` + akt 3 filmu na module | nagranie aktu 3 przed i po, FPS Low i High, ten sam moduł w prototypie gabloty | akt 3 bez regresji; granice plików od integratora | **wysoka**: rozplątanie `liveSimulationRef`, `useBiogenesisStore`, cyklu ujęcia ↔ sceny, dwóch szyn kamery; możliwa zmiana wyglądu filmu (decyzja użytkownika) |
| **M5** serce wzorcowe | nagranie: widok krwionośny → klik → wejście diegetyczne → gablota (obrót, ujęcia, przekrój, najechanie, panel P, Sprawdź się) → film cyklu (kroki: krwinki → zastawki → skurcz); FPS Low i High | audyt jak E3; ciało ≤ 5% albo okno kuliste; fakty P serca z E1-K3 | średnia (zależy od faktów i ramy integratora) |
| **M6** pilot wyróżników 3D (Wizualizator: technika) | 4 wyróżniki na module | ≤ 1 ms GPU na wyróżnik na Low | średnia |
| **M7** wpięcie do aktów | serce w aktach 3, 12 (i proxy 1, 6, 11), wyróżniki w aktach wg mapy | brak regresji filmu | średnia |
| **M8** gabloty nerki, wątroby, mózgu | każda: nagranie wejścia, gablota, film, akt filmu | nerka: przekrój bez labiryntu; mózg: koszt Brainder | niższa (moduł gotowy); może prowadzić drugi agent 3D |
| **mały kamień** `brain_macro.glb` | przebudowa z Allen ≥ v1.3 + poprawka `LICENSES_AND_ASSETS.md` | przed publikacją filmu | niska; wymaga pobrania Allen ≥ v1.3 (zgoda Dyrygenta jest; o samo pobranie pliku poproszę użytkownika w chwili, gdy kamień ruszy) |

Szacunki godzinowe po M2′ poda Dyrygent. Wielkość względna: M4 to największa niewiadoma, a M5 największa praca.

## 9. Uzgodnienia z Reżyserem

| Temat | Stan |
|---|---|
| Wykonalność karty (a)–(g) | uzgodnione w wymianie 1 (strzałki z przesuwanym wzorem, punkty instancjonowane, linie kostne w 3D z tekstem HTML, miernik oddechu, izolinie ciepła, puls tylko z bieżącego zdania, lokalizator 2D) |
| Spór 1: jeden ruch na wyróżnik | **zgoda** w wymianie 2: wyróżnik układu to znak gabloty; krok filmu wprowadza najwyżej 1 nowy ruch, naraz trwają najwyżej 3 |
| Kolory | **zgoda:** tylko tokeny `palette.json`, odcienie części (`color`, `light`, `color` przyciemniony o 25%), przygaszenie 35%, przekrój w `light`; walidator ΔE (`check:atlas`). Klatki koncepcyjne mają kolory robocze, do poprawy przy wdrożeniu |
| Przekrój i otwarcie | **zgoda** (`light`, obrys 1,5 px, bez rozsuwania, stencil przy ≥ 50 FPS) |
| Wejście | **zgoda:** oba sposoby. Użytkownik doprecyzował „diegetycznie po kliknięciu” (§3), a menu jako dodatek |
| Podświetlenie (obrys 2 px, bez emisji) | **zgoda**, technika: odwrócona powłoka, a na High obrys z bufora ID (§5.3) |
| Spór 2: schemat = kreska czy bryła | **rozstrzygnięty przez Dyrygenta:** bryła 3D w materiale schematu z chipem; kreska tylko w legendzie „Jak czytać” (§4.3) |
| Klatki docelowe (M1) | gotowe (`docs/atlas_rezyser/klatki_docelowe/`, `8c20b84`). M2 porównany z klatką (a), ocena 5 cech: `M2_TEST_SERCA.md` §4 |
| Pytania Reżysera z M1 | ok. 1000 krwinek ze stencilem mieści się (91 FPS); stencil dla ścian (siatki komór szczelne), tylne ścianki jako zamiennik dla siatek nieszczelnych; skurcz w 3. kroku z chipem „ruch poglądowy” |
| Wersja Low jego 12 wyróżników | wszystkie mieszczą się w ≤ 1 ms. Korekta ROZDZIAŁU na skali ciała: strumień jako wzór w ścianie naczynia zamiast 500 krwinek w nieprzezroczystym naczyniu (`FILM_PRZEGLAD.md` §6) |

## 10. Pytania do użytkownika (krótko)

Zamknięte: test serca (zgoda „Tak, M2 i M3”, wykonany); mózg gabloty (decyzja techniczna Dyrygenta: Z-Anatomy/Brainder).

1. **Telefon:** czy gabloty w 3D mają od razu działać na telefonie, czy na początek wystarczą obrazki ujęć i film w stopklatkach, jak dziś plansze?

## 11. Załącznik: zmierzone liczby modeli

| Plik | Węzły | Trójkąty (surowe) | Obrys |
|---|---|---|---|
| `VH_M_Heart.glb` | 14 | 164 tys. | 12,4 × 10,5 × 10,5 cm |
| `VH_M_Blood_Vasculature_Heart.glb` | 37 | 153 tys. | |
| `VH_M_Kidney_L.glb` | 22 | 84 tys. | 7,6 × 8,2 × 10,7 cm |
| `VH_M_Blood_Vasculature_Kidney.glb` | 4 | 5 tys. | |
| `VH_M_Liver.glb` | 26 | 60 tys. | 19,1 × 20,2 × 17,5 cm |
| `VH_M_Blood_Vasculature_Liver.glb` | 15 | 16 tys. | |
| `VH_M_Gallbladder.glb` / `VH_M_Biliary_Tree.glb` | 1 / 8 | 2 / 31 tys. | |
| `Allen_M_Brain.glb` (v1.2) | 283 | 656 tys. | 13,6 × 16,7 × 14,6 cm |
| `VH_M_Spinal_Cord.glb` | 30 | 16 tys. | |

Zamkniętość brył serca (krawędzie niezamknięte / wszystkie):
- komory, przegroda, lewy przedsionek, zastawki mitralna, trójdzielna i płucna: 0;
- prawy przedsionek: 40 / 72 tys.;
- zastawka aortalna: 72 / 4 tys.;
- 3 małe mięśnie brodawkowate: 21–42.

Zastawki mają po 1 spójnej części, czyli brak osobnych płatków. Przerwa między rdzeniem przedłużonym Allen a C1 rdzenia VH: 6,8 mm.
