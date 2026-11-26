# M2: test techniczny serca (skurcz + krwinki 3D)

Stan: 2026-11-26, Wizualizator 3D, gałąź `claude/atlas-wizualizacja-3d-1dc29a`. Zgoda użytkownika na M2: „Tak, M2 i M3” (decyzja Dyrygenta v2, `732fe9a` na `atlas-uklady`).
Wszystko leży w `prototypes/organs_m2/`. **Bez zmian w `src/`.**

## 0. Wynik w skrócie

| Pytanie z M2 | Odpowiedź |
|---|---|
| Czy poziom uproszczony trzyma **≥ 50 FPS na Intel UHD przy 1440×900**? | **Tak: 91 FPS** (10,95 ms na klatkę) przy pełnym sercu HuBMAP (271 tys. trójkątów), przekroju z zalaniem ścian, 1500 krwinkach 3D, skurczu i zastawkach B. Na żywo 60 FPS (limit odświeżania ekranu). |
| Poziom pełny na UHD? | **10,5 FPS** (z presetem M1: 9,8) (3500 krwinek, MeshPhysical, mapa środowiska, MSAA, DPR 1,5 przy 2160×1350). To poziom dla mocnej karty. **Na RTX niezmierzone**: Chrome renderuje na Intel UHD, a przełączenie wymaga ustawień grafiki w Windows. |
| Prędkość zależna od przekroju | **Jest.** Tor każdej krwinki ma promień zmierzony na geometrii (przekroje naczyń, jamy, ujścia zastawek). Prędkość ~ 1/r² (ciągłość przepływu) plus profil przyścienny i faza cyklu. Krew czeka przed zamkniętą zastawką. |
| Zastawki B (ruch płatków): tanie? | **Tanie w GPU: 0 FPS różnicy** (94,8 wobec 91,3). Kształt „otwarta” jest liczony automatycznie z geometrii (obrót wokół linii przyczepu), budowa trwa sekundy. **Wierność umiarkowana:** zastawka otwiera się jak lejek, a płatki się nie rozdzielają (siatka HuBMAP to jedna bryła bez podziału na płatki). Rekomendacja: B od razu, z podpisem „ruch poglądowy”. Rozdzielenie płatków to osobne zadanie z kontrolą anatomii. |
| Wygląd blisko klatki M1 | Wariant „ściany: mięsień” jest blisko klatki (a) Reżysera (`m2_porownanie_z_M1_A.jpg`, `m2_warianty_scian.jpg`). Różnice i decyzje w §4. |
| Czas szacowany a rzeczywisty | Szacunek Dyrygenta 6–12 h, mój 4 h. Rzeczywisty czas według zegara systemowego: **start 18:40, koniec ok. 19:05, czyli ok. 25 minut** na budowę zasobu, prototyp, 3 rundy poprawek, pomiary, nagranie i ten raport. Pracował jeden agent i jeden podagent (spis kodu filmu do PLAN 2, poza M2). Przyczyna: ponowne użycie E3 (meshopt, `__atlas3dBench`, sloty Blendera) i gotowego profilu krwinki z filmu. **Tego tempa nie przenoszę wprost na M4–M5**: tam dochodzi integracja z filmem i aplikacją. |

## 1. Co zbudowano

- **Zasób (Blender, slot `.render_slot_*`, ok. 30 s):** `tools/build_heart_m2.py`. Bierze pełne serce HuBMAP `VH_M_Heart` (14 części) i naczynia przy sercu z `VH_M_Blood_Vasculature_Heart`, przycięte w pionie. Licencja: CC BY 4.0, bez Z-Anatomy.
  - **Kształty ruchu liczone z geometrii, a nie wpisane ręcznie** (w filmie `gen_02_cardiopulmonary.py` używa stałych punktów i 2 grup scalonych siatek):
    - oś długa komór od środka pierścieni zastawek przedsionkowo-komorowych do koniuszka (najdalszy wierzchołek lewej komory), 86,6 mm;
    - `Ventricular_Systole`: ściska komory do osi i skraca je od koniuszka, przy nieruchomej podstawie;
    - `Atrial_Systole`: każdy przedsionek do własnego środka, a przy pierścieniu zastawki bez ruchu;
    - `Valve_Open` (wariant B): obrót wolnego brzegu wokół linii przyczepu, w kierunku przepływu.
    - Wielkość ruchu (14% promieniowo, 9% podłużnie, 12% przedsionki, 70° zastawki) jest **poglądowa** i czeka na fakt.
  - **AO** wypieczone w Cycles do koloru wierzchołków (24 s), czyli głębia bruzd i jam bez kosztu w czasie działania.
  - **Tory krwinek z promieniem:**
    - przekroje naczyń z cięcia wzdłuż osi głównej (łuk aorty po kącie);
    - środki jam i ujść zastawek, promień jamy i ujścia;
    - 7 torów: żyła główna górna i dolna → prawy przedsionek → zastawka trójdzielna → prawa komora → zastawka pnia płucnego → pień płucny → tętnice płucne; 4 żyły płucne → lewy przedsionek → zastawka mitralna → lewa komora → zastawka aortalna → aorta wstępująca → łuk → aorta zstępująca.
  - Wynik: `heart_m2.glb` (7,6 MB) → meshopt i kwantyzacja → **`heart_m2_opt.glb` 1,91 MB** (cel gabloty ≤ 4 MB), `heart_m2_paths.json` (13 KB).
- **Strona (three.js 0.169, bez R3F):** `index.html`, `main.js`, serwer `vite.config.mjs` na porcie 5202 (`.claude/launch.json`: `organs-m2`).
  - Scalenie do 5 siatek (lewe serce, prawe serce, zastawki p-k, zastawki półksiężycowate, naczynia) z kształtami ruchu, czyli 12 wywołań rysowania razem z zalaniem przekroju i krwinkami.
  - **Przekrój z zalaniem przez stencil:** ściana komory ma grubość, a jama jest otwarta (bryły serca są zamknięte, sprawdzone w Blenderze).
  - **Krwinki:** dwuwklęsłe (profil Evansa-Funga, ten sam co `InstancedErythrocytes` w filmie), `InstancedMesh`, orientacja wzdłuż stycznej toru z obrotem. Na ekranie są **powiększone ok. 550×** (chip „krwinki powiększone, nie w skali”).
  - Barwa: natleniona `artery`, odtleniona `vein` (tokeny `palette.json`).
  - Cykl: skurcz przedsionków, skurcz komór, rozkurcz. Zastawki przedsionkowo-komorowe i półksiężycowate w fazie; tempo spoczynek i sprint (klawisz S) **poglądowe**.
  - Przełączniki w adresie strony:
    - `q=low|high`: poziom jakości;
    - `look=atlas|film`: profil wyglądu;
    - `valves=a|b`: wariant zastawek;
    - `walls=blood|tissue`: barwa ścian;
    - `glass=0|1|2`: ściany naczyń (nieprzezroczyste, przezroczyste, dithering);
    - `cut=1|0`: przekrój;
    - `n=`: liczba krwinek.
  - Pomiar: `window.__m2Bench(n)`, czyli render z `readPixels`, tak samo jak `__atlas3dBench` w E3 (niezależny od dławienia rAF).

## 2. Pomiary (Chrome, ANGLE D3D11, Intel UHD Graphics 0xA7A8, emulacja okna 1440×900)

| Wariant | Krwinki | Trójkąty w klatce | Wywołania | ms/klatkę | FPS |
|---|---|---|---|---|---|
| **niski**, atlas, zastawki A, przekrój | 1500 | 950 tys. | 12 | 10,95 | **91,3** |
| niski, jw., sprint | 1500 | 950 tys. | 12 | 10,74 | 93,1 |
| **niski, zastawki B** | 1500 | 950 tys. | 12 | 10,55 | **94,8** |
| niski, profil film (AgX) | 1500 | 950 tys. | 12 | 12,70 | 78,8 |
| niski, ściany mięsień, kamera bliżej (0,36 m) | 1500 | 950 tys. | 12 | 13,14 | 76,1 |
| niski, jw. + **naczynia przezroczyste** | 1500 | 1,06 mln | 13 | 28,30 | **35,3** ✗ |
| niski, jw. + naczynia z ditheringiem | 1500 | 950 tys. | 12 | 14,24 | 70,2 |
| **wysoki**, film (MSAA, DPR 1,5, MeshPhysical, środowisko) | 3500 | 3,55 mln | 12 | 95,18 | **10,5** (UHD; poziom dla RTX) |
| *przed optymalizacją:* niski z MSAA, 900 krwinek, tory liczone krzywą co klatkę (1442×732) | 900 | 782 tys. | 12 | 24,3 | 41,2 ✗ |

Na żywo (rAF, poziom niski): średnio 60,3 FPS (limit ekranu), 95. percentyl 27 ms. Pojedyncze przycięcia do poprawy w M4, prawdopodobnie przez tworzenie obiektów co klatkę.

**Co zadecydowało o wydajności (lekcje dla wspólnego modułu):**
1. **MSAA na UHD kosztuje ok. 12 ms przy 1440 px.** Poziom niski działa bez MSAA. Zamiennik wygładzania: FXAA/SMAA w jednym przebiegu (ok. 1 ms) albo nic, bo matowy styl i ciemne tło dobrze to znoszą. Do decyzji Reżysera po obejrzeniu.
2. **Tory jako tablica próbek** (512 punktów: położenie, styczna, promień) zamiast liczenia krzywej Catmulla-Roma co klatkę. CPU spada z 3,1 ms (900 krwinek) do 0,84 ms (1500 krwinek). W module ten sam układ danych pójdzie do tekstury i shadera (GPU), co pozwoli na tysiące krwinek bez kosztu CPU.
3. **Przezroczystość prawdziwa jest za droga na UHD** (+15 ms: przerysowywanie krwinek i wnętrza). Na poziomie niskim stosujemy dithering uporządkowany (wzór Bayera, jak w E3), a nie losowy `alphaHash` (szumi, `m2_warianty_scian.jpg`). Na poziomie wysokim prawdziwa przezroczystość.
4. Zalanie przekroju (2 przebiegi stencil) i kształty ruchu mieszczą się bez problemu.

## 3. Profile wyglądu i ΔE (wymóg Dyrygenta, decyzja v2 §1 pkt 9)

Ten sam kadr i stan (poziom niski), profil `atlas` (bez mapowania tonów, jak E3) i `film` (AgX, ekspozycja 1,05). Mediany pikseli serca, ΔE CIEDE2000 (`m2_niski_atlas.jpg`, `m2_niski_film.jpg`):

| | atlas → film (mediana / p90) | token → atlas | token → film |
|---|---|---|---|
| `artery` #D93240 | 7,6 / 10,0 | 4,5 | **18,0** (czerwień blednie w róż) |
| `vein` #3E6FD8 | 8,5 / 9,6 | 7,6 | 4,9 |
| rozróżnienie `artery` ↔ `vein` | tokeny 42,5 · atlas 39,6 · film 33,5 | | |

Wniosek dla PLAN 2: moduł potrzebuje **jawnych profili wyglądu** z kompensacją:
- dla profilu `film` przed AgX przesuwamy kolor bazowy tak, żeby wynik trafiał w token: tabela korekcji per token liczona automatycznie z takiego pomiaru;
- kontrola polega na pomiarze ΔE na zrzutach obu profili, a progiem jest ten sam `minDeltaE` co w `check:atlas`.

Rozróżnienie par zostaje wysokie w obu profilach.

## 4. Porównanie z klatką M1 Reżysera (a) „serce w przekroju z krwinkami w jamach”

Prototyp ma przełącznik `m1=1`, czyli preset według karty Reżysera:
- ściana `#992E38` (artery + `#4a2a2e` 55/45);
- przekrój `#B44E56` (artery + `#8e6a6c`);
- zastawki `context.bone` przygaszone o 35%;
- krwinki o średnicy 2,6 mm;
- obiektyw ok. 85 mm (16° w pionie).

Na poziomie niskim przy tym presecie: **77 FPS** na UHD przy 1440×900.

Pliki:
- `zrzuty/m2/m2_porownanie_z_M1_A.jpg`: lewo M1, prawo M2 z presetem;
- `m2_cykl_niski.jpg`, `m2_cykl_wysoki.jpg`: 8 klatek cyklu na każdy poziom;
- `m2_warianty_scian.jpg`.

**Ocena 5 cech podanych przez Reżysera:**

| Cecha | Wynik M2 | Ocena |
|---|---|---|
| 1. Ujęcie: przód, przekrój czołowy przez 4 jamy, ok. 85 mm | przód, cięcie 4 mm za środkiem serca, 16° w pionie. Widać obie komory, prawy przedsionek i drogę odpływu. Lewy przedsionek leży za płaszczyzną i jest widoczny słabiej niż w M1. W kadrze są też duże naczynia | **częściowo**. Płaszczyzna i kąt kamery do strojenia w M5 (M1 ma lekko skośne ujęcie). Naczynia zostawiam, bo pokazują, dokąd krew wypływa |
| 2. Materiał: mat, ściana artery z brązem, przekrój jaśniejszy, zastawki bone przygaszone | barwy z karty 1:1. Poziom niski: mat i AO z wierzchołków, **bez SSS**. Zastawki wyszły ciemniejsze niż na klatce M1 (tam są prawie białe mimo „przygaszone 35%”) | **tak, z wyjątkiem SSS i jasności zastawek**. SSS jako tanie oświetlenie „wrap” w module; jasność zastawek do ustalenia z Reżyserem |
| 3. Światło: klucz, wypełnienie, kontra, tło studia, Low bez postprocesu, High bez „przepalenia” krwinek | Low tak. **High z profilem film (AgX + środowisko): krwinki tracą kontrast na różowej ścianie** (`m2_cykl_wysoki.jpg`), czyli dokładnie problem z pierwszej wersji Reżysera | **Low tak, High nie**. Poprawka w module: kompensacja barwy przed AGX (§3), mniejsza siła środowiska, krwinki o jeden stopień jaśniejsze od ściany |
| 4. Krwinki: Evans-Fung, 2,6 mm, ok. 900 w jamach, lewa artery, prawa vein, oś po torze, nic przed przekrojem | kształt, barwy i orientacja zgodne; przycinane płaszczyzną (nic nie wisi przed przekrojem). Liczba: 1500 na wszystkich torach, w tym w naczyniach, więc w jamach jest ich mniej niż ok. 900 w M1; prawy przedsionek wygląda rzadziej | **tak, z wyjątkiem gęstości w jamach**. Liczba na Low ma zapas (91 FPS), więc w M5 dam ok. 900 w samych jamach + strumień w naczyniach |
| 5. Czytelność: krwinki odcinają się jasnością, 4 jamy i 4 zastawki naraz, kolejność ruchów | Low: krwinki odcinają się od ciemnej ściany. Zastawki widać 3 z 4 (mitralna częściowo zasłonięta). **Kolejność ruchów nie jest jeszcze krokami**: w teście wszystko rusza naraz (cykl). Kroki „najpierw krwinki, potem zastawki, potem skurcz” to oś czasu w M5 | **częściowo**. Kontrast jest. Kroki dopiero w M5, bo M2 sprawdzał koszt, a nie scenariusz |

**Odpowiedzi na pytania techniczne Reżysera:**
1. **Ok. 1000 krwinek i przekrój z zalaniem stencil na UHD:** tak, 1500 krwinek daje 91 FPS na poziomie niskim, a stencil jest w tym wliczony.
2. **Czy kolorowanie tylnych ścianek wystarczy zamiast stencila:** siatki komór, przegrody i lewego przedsionka **są szczelne**: 0 krawędzi niezamkniętych, sprawdzone w Blenderze. Prawy przedsionek ma 40 na 72 tys., zastawka aortalna 72 na 4 tys. Stencil działa poprawnie na całym przekroju (`m2_cykl_niski.jpg`).
   - **Decyzja techniczna:** stencil dla ścian (pełna grubość ściany i płaski przekrój), a kolorowanie tylnych ścianek jako zamiennik dla siatek nieszczelnych (sprawdzę przy nerce i wątrobie w ich K1).
   - Koszt stencila mieści się w 91 FPS.
3. **Skurcz domyślnie wyłączony do czasu faktu:** zgoda na kolejność kroków (krwinki → zastawki → skurcz). Skurcz w kroku 3 tylko z chipem „ruch poglądowy”, dopóki fakt o wielkości skurczu nie ma statusu `checked_agent`. Jeśli bramka faktów wymaga wyłączenia, wystarczy przełącznik (waga kształtu = 0), bez innych zmian.

## 5. Nagranie i zrzuty (`docs/atlas_wizualizacja/zrzuty/m2/`)

- `m2_serce_niski_UHD_1080.mp4` (14 s, 1,5 MB): poziom niski na UHD; całe serce, potem zbliżenie lewej komory i zastawki mitralnej, potem sprint.
- `m2_klatki_z_nagrania.jpg`: 8 klatek z nagrania.
- `m2_zastawkiB_para.jpg`: zastawki B w rozkurczu (mitralna otwarta) i w skurczu (aortalna otwarta).
- `m2_niski_atlas.jpg`, `m2_niski_film.jpg`: profile wyglądu.
- `m2_niski_miesien*.jpg`, `m2_warianty_scian.jpg`: warianty ścian.
- `m2_porownanie_z_M1_A.jpg`: porównanie z klatką M1 (lewo M1, prawo preset `m1=1`).
- `m2_cykl_niski.jpg` (profil atlas, 77 FPS) i `m2_cykl_wysoki.jpg` (profil film; 9,8 FPS na UHD przy 2160×1350): po 8 klatek z jednego cyklu, co 0,12 s. W fazach 0,28–0,42 widać skurcz lewej komory (mniejszy pierścień), a w rozkurczu otwartą zastawkę mitralną.

## 6. Uczciwie: czego M2 nie pokazuje

- **RTX niezmierzony** (wymaga zmiany ustawień grafiki Windows przez użytkownika).
- **Wielkość ruchu, tempo i rozmiar krwinek są poglądowe.** Liczby (frakcja skrócenia, tętno w sprincie) czekają na bramkę faktów.
- Promień ujścia zastawki to 70% zasięgu siatki zastawki (mitralna 26 mm zasięgu). Służy tylko do skalowania prędkości, nie jest wartością anatomiczną do pokazania.
- Strugi w jamach to tory poglądowe, a nie symulacja płynów.
- Zastawki B nie rozdzielają płatków.
- Brak SSS na poziomie niskim, brak FXAA (do decyzji po obejrzeniu).
- Pojedyncze przycięcia klatek (p95 27 ms) do zbadania w M4.
- Prototyp nie jest kodem aplikacji. To, co przejdzie do modułu, opisuje `NARZADY_PLAN.md` §2 (PLAN 2).

## 7. Wnioski dla M4 (wspólny moduł)

**Wziąłem z filmu bez zmian:**
- profil krwinki Evansa-Funga (`createBiconcaveErythrocyteGeometry`, `MolecularSimulation.tsx:10-26`): te same współczynniki, w prototypie przepisane do czystego three.js;
- zasada poziomów jakości z `QualityManager.ts` (nazwy Low/High, mnożnik cząstek, DPR);
- profil krzywej przyściennej (szybciej przy osi) w uproszczonej postaci.

**Przepisałem albo zbudowałem od nowa:**

| Element filmu | Co jest nie tak dla gablot i atlasu | Co jest w M2 |
|---|---|---|
| `cardiopulmonary.glb` (`gen_02_cardiopulmonary.py`) | serce scalone w 4 obiekty i zdecymowane (komory 7500, przedsionki 4500 wielokątów), więc **nie ma ID struktur** do najechania i panelu; skalowane ×4,2 poza ramą ciała. Kształty liczone **od ręcznie wpisanych punktów** (`l_ctr`, `r_ctr`, oś komór jako stała). `Valve_Open` to **rozdęcie całej zastawki promieniowo i przesunięcie w osi**, a nie ruch płatków | pełne serce HuBMAP (14 części), oś komór i środki jam z geometrii, `Valve_Open` jako obrót wolnego brzegu wokół przyczepu, w kierunku przepływu |
| `InstancedErythrocytes` | tor to jedna krzywa, prędkość bez przekroju (`1,65 − 0,85 r²` + puls), kapilara to zakodowany zakres t. `getPointAt`/`getTangentAt` co klatkę dla każdej krwinki (koszt CPU). Zmiana poziomu odtwarza `InstancedMesh`. Zależy od `useBiogenesisStore`/`liveSimulationRef` | wiele torów z promieniem z geometrii, prędkość ~1/r² i zależna od fazy (czekanie przy zamkniętej zastawce), **tablica próbek** zamiast liczenia krzywej (CPU 3,1 → 0,84 ms), stan podawany z zewnątrz |
| Kolor | film: AgX + HDRI + postproces; atlas: bez mapowania tonów | jawne profile `atlas`/`film` z pomiarem ΔE (§3) |

**Koszt półprzezroczystej ściany naczynia** (prośba Reżysera z klatek docelowych):
- prawdziwa przezroczystość: **+15 ms na UHD** (76 → 35 FPS), więc nie mieści się w poziomie Low;
- dithering: +1,1 ms (70 FPS), ale losowy `alphaHash` szumi;
- **Decyzja techniczna:** Low = dithering uporządkowany (Bayer, jak w E3), High = prawdziwa przezroczystość.

**Do zrobienia w module (M4):**
1. tory i stan krwinek w teksturze i shaderze (GPU), co pozwoli na tysiące krwinek bez CPU;
2. kompensacja barwy dla profilu film;
3. SSS jako tanie oświetlenie „wrap”;
4. FXAA/SMAA zamiast MSAA na Low (po decyzji Reżysera);
5. likwidacja przydziałów pamięci co klatkę (p95 27 ms);
6. kroki osi czasu: krwinki → zastawki → skurcz.

## 8. Jak uruchomić

```
blender --background --factory-startup --python prototypes/organs_m2/tools/build_heart_m2.py -- prototypes/organs_m2/_assets   (przez slot .render_slot_*)
npx gltf-transform quantize prototypes/organs_m2/_assets/heart_m2.glb q.glb --pattern "{POSITION,NORMAL}" && npx gltf-transform meshopt q.glb prototypes/organs_m2/_assets/heart_m2_opt.glb
node node_modules/vite/bin/vite.js --config prototypes/organs_m2/vite.config.mjs      → http://127.0.0.1:5202/?q=low
```
W konsoli: `__m2Bench(300)` (pomiar), `__m2.cam(odległość, x, y, z, obrót)`, `__m2.sprint(true)`.
