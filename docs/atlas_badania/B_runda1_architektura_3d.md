# Badacz B, runda 1: architektura renderu, zasobów i silnika atlasu 3D

Autor: Badacz B (architekt 3D i silnika). Stan na 2026-11-25, gałąź `atlas-uklady`.
Punkt wyjścia w repo: React 18.3 + `@react-three/fiber` 8.17 + drei 9.121 + three r169 + Vite 6 (`package.json`).
Atlas to dziś osobny tryb `#atlas`, w całości 2D: render EEVEE (WebP, ok. 100–120 kB na obraz) + podpisy SVG z `anchors.json`.
Główna aplikacja już ładuje GLB przez `useGLTF` (`src/core/AssetManager.ts`, 8 modeli po 0,3–3 MB). Silnik 3D mamy, ale atlas z niego nie korzysta.

Uwaga o źródłach: narzędzie Exa szybko wyczerpało darmowy limit, więc część badań zrobiłem przez WebSearch/WebFetch.
Liczby poligonów atlasów komercyjnych **nie są publiczne**. Nie znalazłem ich w żadnym źródle i nie zgaduję.

---

## 1. Przegląd atlasów komercyjnych i otwartych

| Projekt | Technologia (co da się potwierdzić) | Wybór / warstwy / przekroje | Co przejąć | Źródło |
|---|---|---|---|---|
| **BioDigital Human** (USA) | WebGL w przeglądarce, wcześniej na SceneJS. Modele z Mayi, potem „własne narzędzia” przygotowują je do czasu rzeczywistego. iframe + JS API, SDK na iOS/Android. | Obiekty mają `objectId` i **`fmaId`** (ontologia FMA). API: `showObjects`, `selectObjects`, tryby `xray`, `dissect`, `isolate`, `highlight`, `labels`; `camera.flyTo({objectId})`, `timeline` do animacji. | **Model danych:** stan sceny = zbiór widocznych i zbiór wybranych ID, a tryby (rentgen, izolacja) to funkcje tych zbiorów | [HumanAPI.Scene](https://human-api.biodigital.com/docs/unstyled/symbols/HumanAPI.Scene.html), [HumanAPI.Human](https://human-api.biodigital.com/docs/unstyled/symbols/HumanAPI.Human.html), [XRay](https://human-api.biodigital.com/docs/unstyled/symbols/HumanAPI.XRay.html), [standardy treści](https://www.biodigital.com/p/content-standards-and-development-process), [Wikipedia](https://en.wikipedia.org/wiki/BioDigital) |
| **Zygote Body** (dawniej Google Body, 2010) | WebGL bez wtyczek, otwarty kod przeglądarki Google | Suwaki przezroczystości warstw (skóra → mięśnie → kości), szybkie wyszukiwanie | **Warstwy jako suwaki krycia**: najprostszy i bardzo czytelny „ghosting” | [Google Open Source Blog 2012](https://opensource.googleblog.com/2012/01/google-body-becomes-zygote-body-built.html), [Wikipedia](https://en.wikipedia.org/wiki/ZygoteBody) |
| **Visible Body** | Web (Chrome/Safari/Edge) + aplikacje natywne. Silnik niepubliczny. | Modele męski i żeński, ponad 24 tys. zasobów | Dwa warianty płci od początku | [visiblebody.com](https://www.visiblebody.com/request-a-quote), [App Store](https://apps.apple.com/app/id1117998129) |
| **Primal Pictures / Anatomy.TV** | Modele real-time z wtyczką Unity (starsze materiały bibliotek). Modele z danych obrazowych. | Dodawanie i usuwanie struktur, tryb rentgena, korelacja przekroju z MRI w 3 płaszczyznach | Przekrój zestawiony z obrazem 2D | [UDel](https://library.udel.edu/database/primal/), [Citeline](https://www.citeline.com/en/products-services/clinical/primal-pictures) |
| **Anatomage Table** | Segmentowane prawdziwe zwłoki (do 0,2 mm), stół dotykowy | Cięcie w dowolnej płaszczyźnie, presety renderu objętościowego | Przekrój jako podstawowe narzędzie, nie dodatek | [anatomage.com](https://eu.anatomage.com/table/), [UMass](https://umassmed.edu/icels/services/Anatomage) |
| **Complete Anatomy** (Elsevier) | Natywne aplikacje, silnik niepubliczny | 12 układów, wybór każdej struktury, śledzenie przebiegu nerwów i tętnic, ciało w ruchu | Ścieżki (nerw, tętnica) jako osobny typ obiektu | [HKBU](https://eduapps.hkbu.edu.hk/?p=4972) |
| **Z-Anatomy** (nasze źródło) | Szablon Blendera; osobna aplikacja PC na Unity (LluisV), stara wersja HTML5 | Kolekcje = układy, napisy jako siatki | Nic z silnika, tylko dane | [GitHub](https://github.com/Z-Anatomy/Models-of-human-anatomy), [Unity](https://github.com/LluisV/Z-Anatomy) |
| **BodyParts3D / Anatomography** (DBCLS) | OBJ, ID z FMA, 1523 części (v3.0), 127 MB po redukcji i 521 MB w wysokiej jakości. **Licencja dziś CC BY 4.0** (strona z 2025-02-27), wcześniej CC BY-SA 2.1 JP. | Hierarchia FMA | **Każda siatka = jedno ID ontologii** | [licencja](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html), [README](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20110915/README_e.html) |
| **HuBMAP HRA** (nasze źródło) | GLB na organ i „United GLB”. Przeglądarki (EUI/RUI, `ccf-body-ui-wc`) to Angular + **deck.gl 8.8** + loaders.gl (gltf, draco), a także three 0.172 i `model-viewer`. Kontrola jakości w Babylon Sandbox. | Organy umieszczone we wspólnej ramie CCF, tkanki rejestrowane w 3D | **Wspólna rama współrzędnych + SOP zatwierdzania modelu** | [biblioteka 3D](https://hubmapconsortium.github.io/ccf/pages/ccf-3d-reference-library.html), [hra-ui](https://github.com/hubmapconsortium/hra-ui), [package.json](https://raw.githubusercontent.com/hubmapconsortium/hra-ui/main/package.json), [SOP](https://zenodo.org/records/10358858) |
| **Open Anatomy Browser** (SPL/Harvard) | three.js + Angular 1, format atlasu JSON-LD, który wskazuje pliki geometrii i obrazów. Bez backendu: same pliki statyczne. | Etykiety i ontologia **oddzielone od geometrii**, wygląd przez style podobne do CSS, tłumaczenia bez kopiowania atlasu | **Rozdział: geometria / tożsamość / styl / tekst** | [technologia](https://openanatomy.org/technology.html), [repo](https://github.com/mhalle/oabrowser), [artykuł](https://www.frontiersin.org/articles/10.3389/fninf.2017.00022/text) |
| **„3D Anatomy Atlas” (svitylo), three.js web component, 2026** | ok. 4454 struktur, ok. 3 mln trójkątów, całe ciało w 2 jakościach: **ok. 55 MB i ok. 21 MB**. Kawałki według regionów, jeden węzeł na GLB, `EXT_meshopt_compression` + `KHR_mesh_quantization`. Leniwe ładowanie, wybór na CPU z BVH, do 300 struktur półprzezroczystych z sortowaniem. | Suwak przezroczystości niewybranych struktur, poziom otoczenia | **Najbliższy nam punkt odniesienia skali** (prawie ta sama liczba struktur co Z-Anatomy) | [three.js forum](https://discourse.threejs.org/t/3d-anatomy-atlas-an-anatomy-atlas-as-a-web-component-from-svitylo/95045) |
| **human-atlas** (ashemag) | BodyParts3D, 2234 siatki → 3432 pojęcia FMA. meshoptimizer z błędem 0,2%, normalne w int16, pakowanie w binarne kawałki. | | Konkretne parametry upraszczania siatek | [ATTRIBUTION.md](https://raw.githubusercontent.com/ashemag/human-atlas/master/public/ATTRIBUTION.md) |
| **OPANEX** (UGent), **3D Slicer** | Angular + WebGL; Slicer to desktopowe narzędzie autorskie (MRML, segmentacje) | Quizy, etykietowanie | Slicer tylko jako narzędzie kontroli, nie w runtime | [OPANEX](https://github.com/biocat-ugent/Open-Anatomy-Explorer), [slicer.org](https://www.slicer.org) |

**Wnioski z przeglądu:**
1. Wszystkie dojrzałe atlasy dzielą tę samą abstrakcję: **struktura = stabilne ID powiązane z ontologią (FMA/TA)**, a widok = funkcja zbiorów ID (widoczne, wybrane, wyróżnione). Nikt nie steruje widokiem przez nazwy siatek z pliku.
2. Silnik ma mniejsze znaczenie niż potok treści. BioDigital otwarcie pisze, że przewagę daje im „proprietary software” przygotowujące modele z Mayi. Nasz odpowiednik to Blender + gltf-transform.
3. Rząd wielkości jest znany: cały człowiek z ok. 4,5 tys. struktur mieści się w przeglądarce w **20–55 MB** po meshopt i kwantyzacji (svitylo). Trzeba jednak ładować kawałkami, a nie całość naraz.
4. Rentgen/ghosting, izolacja i przekrój to standard rynkowy. Animacje fizjologii u komercyjnych graczy to zwykle osobne, autorskie klipy (BioDigital `timeline`), a nie symulacja.

---

## 2. Tezy (do podważenia)

**T1. Rekomenduję wariant (b), hybrydę, ale odwróconą: najpierw jeden „pakiet układu” wypiekany przez Blendera, z którego powstają jednocześnie plansze 2D i GLB 3D.**
Plansza WebP + SVG zostaje domyślnym wejściem (szybka, precyzyjna, działa na każdym telefonie). Przycisk „Obróć w 3D” leniwie ładuje R3F i GLB tego samego układu.
Oba widoki czytają tę samą treść (`src/atlas/plates/<uklad>.ts`) kluczowaną tym samym ID struktury.
Uzasadnienie: (a) samo 2D nie spełni celu „pełny atlas 3D”; (c) od razu pełne 3D wyrzuca działającą fazę 1, a na telefonie przegrywa z planszą czytelnością podpisów.
Rynek robi tak samo: BioDigital też wypuszcza statyczne „snapshoty” i treści 2D obok sceny 3D ([API](https://human-api.biodigital.com/docs/unstyled/symbols/HumanAPI.Human.html)).

**T2. Kanoniczna tożsamość struktury to rejestr `structures.<uklad>.json`, a nie nazwa obiektu w Blenderze.**
Pola: `id` (np. `za:rectus_femoris.r`), nazwa PL i łacińska, TA2/FMA (Z-Anatomy ma `TA2.csv`), źródło modelu, licencja, układ, rola (aktywny/kontekst).
Ten sam `id` trafia do: `extras` węzła glTF, atrybutu wierzchołka `_STRUCTURE_ID`, `anchors.json`, `anchors3d.json` i treści planszy.
Dziś łącznikiem są regexy na nazwach Z-Anatomy w `plate_*.py` oraz ręczne klucze kotwic. To nie przetrwa 12 układów ani dwóch źródeł (HuBMAP ma inne nazwy).
Wzór: `fmaId` w BioDigital, „data accessors” w Open Anatomy ([technologia](https://openanatomy.org/technology.html)).

**T3. Geometria w przeglądarce: scalanie po (układ × kawałek × rola), wybór przez ID w wierzchołku, stan przez teksturę danych. Nie po jednym `Mesh` na strukturę.**
Z-Anatomy ma 4569 siatek. Tyle wywołań rysowania zabije telefon. `BatchedMesh` (three r159+, mamy r169) daje widoczność i kolor per instancja, ale nie krycie per instancja ([dyskusja](https://discourse.threejs.org/t/batchedmesh-set-per-instance-opacity/64170)), a ghosting go potrzebuje.
Dlatego proponuję jedną scaloną siatkę na kawałek (`gltf-transform join`) z atrybutem `_STRUCTURE_ID` (uint16) i jeden shader. Shader czyta z `DataTexture` (N×1, RGBA) kolor, krycie, poziom aktywności i flagi (wybrany, ukryty, wyróżniony).
Zmiana stanu to wtedy zapis kilku tekseli, bez nowych materiałów i bez przebudowy sceny. Wybór: dodatkowy przebieg ID do małego bufora (technika deck.gl „color picking”, [docs](https://deck.gl/docs/developer-guide/interactivity)) albo CPU raycast z three-mesh-bvh.
Teza do podważenia: to więcej własnego shadera niż „gotowe drei”. Moim zdaniem to jedyna droga do mniej niż 50 wywołań rysowania na telefonie.

**T4. Budżety (propozycja, do zmierzenia na prototypie):**

| | Telefon (średnia półka) | Desktop (RTX 4050 jak u użytkownika) |
|---|---|---|
| Pobranie przy otwarciu układu w 3D | ≤ 6 MB (GLB) | ≤ 20 MB |
| Cały atlas, wszystkie układy | nie ładujemy całości | ≤ 60 MB (zgodne z ok. 55 MB u svitylo) |
| Trójkąty widoczne naraz | ≤ 400 tys. | ≤ 1,5 mln |
| Wywołania rysowania | ≤ 50 | ≤ 200 |
| Tekstury | brak (kolor z tekstury danych), ewentualnie 1 matcap/rampa KTX2 | to samo |
| Pamięć GPU na atlas | ≤ 150 MB | ≤ 600 MB (z 6 GB, główna aplikacja też żyje) |

Z-Anatomy ma 3,66 mln trójkątów, więc LOD0 (desktop) ≈ 35–40% po `simplify`, a LOD1 (telefon) ≈ 10–12%. Kontekst (kości i mięśnie tła) dostaje zawsze LOD1, bo jest przygaszony.
Format: `EXT_meshopt_compression` + `KHR_mesh_quantization`, a nie Draco. Meshopt dekoduje się szybciej, drei `useGLTF` obsługuje go domyślnie, a svitylo i human-atlas potwierdzają ten wybór w praktyce. Komendy: `gltf-transform weld/simplify/join/quantize/meshopt/prune` ([CLI](https://gltf-transform.dev/cli)).
KTX2 tylko wtedy, gdy pojawią się tekstury; styl „matowej ilustracji” (księga stylu §3) ich nie potrzebuje.

**T5. Spoczynek/sprint to parametr shadera, nie osobne pliki ani osobna geometria.**
W 2D mamy 2 rendery na widok. W 3D stan to wektor aktywności per struktura (0–1, z poziomami `sprint_level` jak w `plate_miesniowy.py`).
Shader miesza kolor kontekstu z kolorem układu dokładnie wzorem `REST_MIX` z `atlas_lib.py` i dodaje emisję. Przejście 700 ms to interpolacja jednej wartości uniform. Dzięki temu kolory 2D i 3D są tą samą funkcją.
Warunek: `atlas_lib.SYSTEM_COLORS` i tokeny `--sys-*` w `index.css` muszą pochodzić z jednego pliku (np. `src/atlas/palette.json`, czytanego przez Pythona i TS).

**T6. Przepływy (krew, powietrze, impuls, hormon) to krzywe 3D w kanonicznej przestrzeni, eksportowane z Blendera jako JSON. Na planszy 2D są rzutowane, w 3D animowane shaderem.**
Dziś `AtlasFlow.points` to piksele renderu. To ślepa uliczka: każdy nowy widok wymaga ręcznego rysowania.
Krzywa w metrach (np. linia środkowa aorty wyznaczona z drzewa naczyń HuBMAP) daje 2D za darmo przez to samo rzutowanie co kotwice (`Plate._project`), a w 3D jest wstęgą lub cząstkami z przesuwanym `dashOffset`.
Szybkość zależy od stanu i jest wartością z danych Badacza A (np. rzut serca), a nie stałą „na oko”.

**T7. Przekrój: `clippingPlanes` + kolorowanie tylnych ścianek, nie stencil caps.**
Stencilowe „zaślepki” z przykładu three.js psują się przy wielu siatkach, nakładających się ściankach i ruchomych płaszczyznach ([wątek 1](https://discourse.threejs.org/t/clipping-plane-stencil-capping/74018), [wątek 2](https://discourse.threejs.org/t/how-to-render-caps-like-webgl-clipping-stencil/36727)).
Siatki Z-Anatomy nie zawsze są szczelne, więc stencil będzie migotał. Tańszy i odporny trik: `side: DoubleSide`, a w shaderze `gl_FrontFacing == false` → płaski kolor przekroju struktury (jaśniejszy kolor układu).
Wizualnie to „przecięty organ”, a koszt jest zerowy. Najwyżej jedna płaszczyzna naraz na telefonie.

**T8. Podpisy 3D: maksymalnie ok. 10 naraz, kotwice wypiekane w Blenderze (punkt na powierzchni + normalna), zasłanianie z bufora ID.**
`drei <Html occlude>` przy wielu etykietach jest drogie (raycast na etykietę na klatkę). Zamiast tego: kotwica jest widoczna, jeśli bufor ID w jej rzucie zawiera jej `structure_id`, albo jeśli normalna patrzy w stronę kamery.
Linie odnośników zostają w SVG nad canvasem, w tej samej gramatyce co `AtlasPlate` (kropka, linia 1 px, tekst przy krawędzi). Atlas ma wyglądać jak jedna książka w 2D i w 3D.

**T9. Licencje: każdy GLB pochodny Z-Anatomy jest utworem zależnym CC BY-SA 4.0. Plików ze źródeł BY-SA i BY nie scalamy w jeden GLB, a strukturę „NC” blokuje skrypt budujący, nie pamięć agenta.**
Dekymacja i eksport to adaptacja, więc GLB musi być na BY-SA z atrybucją ([CC FAQ](https://creativecommons.org/faq/)). Kod aplikacji to osobny utwór, który tylko wyświetla pliki, i nie dziedziczy BY-SA (tak jak plansze WebP dziś).
Osobne GLB na źródło (`za_*.glb` BY-SA, `hra_*.glb` BY) zachowują czytelność licencji. Licencję zapisujemy w `asset.copyright` i `extras.license` każdego pliku.
**Konkret dla fazy 1b:** `ATLAS_ASSETS.md` mówi, że model nerki Z-Anatomy jest na **CC BY-NC**. Mimo to `ATLAS_KOLEJNE_UKLADY.md` §4 podaje nerkę Z-Anatomy dla układu wydalniczego. Nerka musi pochodzić z HuBMAP (`VH_M_Kidney_L/R`, CC BY), a `find_meshes` powinno odrzucać obiekty z listy NC.
Nowość: BodyParts3D jest dziś na **CC BY 4.0** ([licencja](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html)). Dla struktur, których Z-Anatomy nie zmienił, można by brać bazę z BP3D na łagodniejszej licencji. To niewiadoma prawna do sprawdzenia, bo Z-Anatomy dodał własne poprawki.

**T10. AI pomaga w potoku, nie w geometrii anatomicznej.** Szczegóły w §4.

**T11. Atlas 3D ładuje się jako osobny, leniwy fragment (`React.lazy`) i nie wymaga podnoszenia Reacta do 19.**
R3F 9 wymaga Reacta 19, a całe 12 aktów stoi na R3F 8. Podniesienie wersji to ryzyko dla głównej aplikacji bez zysku dla atlasu: `BatchedMesh`, clipping i meshopt są dostępne w r169.

---

## 3. Proponowana architektura

```
L0 ŹRÓDŁA (atlas_raw/, poza Gitem)
   Z-Anatomy Startup.blend (BY-SA) | HuBMAP GLB (BY) | BodyParts3D (BY, opcja) | PDB (PD)
        │
L1 KANON (blender/atlas/, Python, tylko odczyt źródeł)
   atlas_lib.py ─ align_hubmap.py (jedna macierz dopasowania na źródło, test renderem)
   registry/<uklad>.json  ← id, PL/LAT, TA2/FMA, źródło, licencja, rola, poziomy rest/sprint
   palette.json (wspólne z TS)
        │  jeden przebieg Blendera na układ: plate_<uklad>.py
        ▼
L2 WYPIEKI (generowane, nigdy nie edytowane ręcznie)
   public/atlas/<uklad>/{widok}_{stan}.webp, anchors.json        ← dzisiejsze 2D, bez zmian
   public/atlas3d/<uklad>/{za|hra}_{kawalek}.lod{0,1}.glb         ← meshopt + quantize, _STRUCTURE_ID
   public/atlas3d/<uklad>/anchors3d.json, flows3d.json, manifest.json (rozmiary, trójkąty, licencje, sumy)
        │  tools/atlas_validate (budżety z T4, brak NC, każde id w rejestrze i treści)
        ▼
L3 SILNIK (src/atlas3d/, leniwy fragment, R3F 8)
   AtlasCanvas ─ ChunkLoader(manifest, LOD wg urządzenia) ─ StructureStateTexture
   AtlasMaterial (kolor/krycie/aktywność/przekrój z tekstury) ─ PickPass(ID) ─ SectionPlane
   FlowLayer(flows3d) ─ LabelOverlay(SVG nad canvasem) ─ CameraRig(widoki front/back/side = te same co 2D)
        │  stan: zustand `atlasStore` {system, state, selected[], hidden[], ghost, section}
L4 TREŚĆ (src/atlas/plates/<uklad>.ts) ─ jedna dla 2D i 3D, klucz = id z rejestru
L5 UX (AtlasApp): plansza 2D domyślnie → „Obróć w 3D” → powrót do planszy w tym samym stanie
```

Przepływ danych przy kliknięciu: `PickPass` zwraca `structure_id` → `atlasStore.select(id)` → panel boczny czyta treść po `id`, a `StructureStateTexture` zapala teksel. Ten sam `id` w 2D podświetla podpis (dzisiejszy `hovered`).

Kolejność wdrożenia (propozycja):
1. Rejestr ID + `palette.json` dla 5 gotowych układów (bez zmiany wyglądu).
2. Eksport GLB jednego układu (mięśniowy) + pomiar budżetów na telefonie.
3. Silnik L3 z ghostingiem i wyborem.
4. Przepływy 3D.
5. Przekrój.
6. Pozostałe układy już w nowym potoku.

---

## 4. AI: gdzie pomaga, a gdzie szkodzi

| Zastosowanie | Werdykt | Dlaczego |
|---|---|---|
| Generatory 3D z tekstu lub obrazu (TRELLIS, MIT, [HF](https://huggingface.co/microsoft/trellis.2-4b); Hunyuan3D) | **Nie dla struktur anatomicznych.** Ewentualnie rekwizyty (bieżnia, hantla) w głównej aplikacji. | Dają wiarygodnie wyglądający, ale nieprawdziwy kształt (liczba płatów, przebieg naczyń). Hunyuan3D ma licencję **wyłączającą UE** ([LICENSE](https://huggingface.co/tencent/Hunyuan3D-2/blob/main/LICENSE)), więc w Polsce odpada. |
| Segmentacja z CT (TotalSegmentator, kod Apache-2.0, [repo](https://github.com/wasserth/TotalSegmentator)) | Tylko jako narzędzie kontrolne, nie źródło siatek | Struktury są prawdziwe, ale modele mają osobną licencję (niekomercyjna darmowa) i potrzebny jest otwarty CT. To dużo pracy przy wątpliwym zysku wobec Z-Anatomy i HRA. |
| Upscaling renderów | Zbędny | Render z Blendera w 2× rozdzielczości jest wierny, a upscaler dorysowuje fałszywe detale. |
| Tekstury generowane (mikroanatomia, „mokra tkanka”) | Nie w atlasie, ewentualnie w aktach filmowych | Księga stylu wymaga matowej ilustracji bez tekstur. AI dodałaby szum, który wygląda jak dane. |
| Wideo generatywne | Nie dla anatomii; najwyżej klimatyczne przebitki poza atlasem | Brak kontroli geometrii, halucynacje struktur. |
| **Agent wizualnej kontroli jakości** (model z widzeniem porównuje render + kotwice z rejestrem) | **Tak, największa wartość** | Wykrywa podpis na złej strukturze, dziury i złe kolory. To dokładnie punkt 7.2 księgi stylu, dziś robiony ręcznie. |
| AI do kodu potoku (skrypty Blendera, shadery, walidatory) | Tak | Wynik da się sprawdzić renderem i testem. |
| AI do dopasowania HuBMAP → Z-Anatomy (propozycja macierzy) | Tak, z weryfikacją renderem z nałożonym szkieletem | Błąd jest widoczny i mierzalny. |
| Tłumaczenia nazw i TTS narracji | Tak, przy weryfikacji terminologii TA2 | Działka Badacza C. Ja dostarczam tylko ID i kotwice. |

Zasada: AI może tworzyć to, co **da się automatycznie zweryfikować względem danych źródłowych**. Nie tworzy kształtów anatomicznych ani liczb.

---

## 5. Podział pracy na równoległych agentów

Granice plików, żeby agenci się nie zderzali:

| Rola agenta | Pisze wyłącznie | Czyta |
|---|---|---|
| **Integrator silnika** (jeden, długowieczny) | `src/atlas3d/**` (bez `systems/`), `blender/atlas/atlas_lib.py`, `atlas_export_glb.py`, `palette.json`, `tools/atlas_validate*`, `src/atlas/types.ts`, `AtlasPlate.tsx` | wszystko |
| **Agent układu `<uklad>`** (po jednym na układ, równolegle) | `blender/atlas/plate_<uklad>.py`, `blender/atlas/registry/<uklad>.json`, `src/atlas/plates/<uklad>.ts`, `public/atlas/<uklad>/**`, `public/atlas3d/<uklad>/**` (tylko przez skrypt) | `atlas_lib`, księga stylu |
| **Agent dopasowania źródeł** (raz, potem na żądanie) | `blender/atlas/align_*.py`, `blender/atlas/registry/_sources.json` | `atlas_raw/` |
| **Agent QA wizualnego** | tylko raporty poza repo lub komentarze, zero kodu | rendery, zrzuty, rejestr |

Reguły:
- Pliki generowane (`public/atlas*/**`) zmienia tylko skrypt. Każdy agent uruchamia walidator przed oddaniem.
- Wspólne kontrakty (`types.ts`, format rejestru, format `manifest.json`) zmienia tylko integrator, z podniesieniem `schemaVersion`.
- Blender: dziś agenci zajmują slot `.render_slot_*`. Zostaje to, bo jeden Startup.blend (307 MB) w RAM na agenta to fizyczny limit równoległości (szacuję 2–3 naraz).

---

## 6. Czego oczekuję od pozostałych i gdzie przewiduję spór

**Od Badacza A (anatom-ontolog, dane):**
- Wybór ontologii kluczy: proponuję TA2 (jest w paczce Z-Anatomy) + FMA tam, gdzie się da. UBERON dla HuBMAP przez ich crosswalk.
- Per struktura: poziom aktywności `rest`/`sprint` (0–1) ze źródłem. To zasila T5 bez zmian w silniku.
- Parametry przepływów (prędkości względne, kierunki) dla T6.

**Spór przewiduję w dwóch miejscach.**
Po pierwsze, A może chcieć ciągłej symulacji fizjologii w czasie (krzywe HR, mleczanu w sekundach). Ja twierdzę, że silnik atlasu powinien znać tylko **dwa stany + interpolację**, a ciągły model żyje w `PhysiologyEngine` głównej aplikacji. Inaczej zdublujemy logikę.
Po drugie, A może chcieć granulacji „każda struktura z ontologii”. Ja tnę do budżetu T4 i łączę drobne struktury (np. pojedyncze węzły chłonne) w grupy z jednym ID grupy.

**Od Badacza C (UX, narracja):**
- Lista interakcji w kolejności ważności (obrót, izolacja, ghosting, przekrój, quiz, wycieczka z kamerą). Każda kosztuje inaczej, a przekrój i podpisy 3D są najdroższe.
- Decyzja, co widzi telefon.

**Spór przewiduję w trzech miejscach.**
Po pierwsze, C może chcieć 3D jako domyślnego wejścia i „filmowej” kamery. Ja bronię planszy 2D jako domyślnej, z 3D jako pogłębieniem.
Po drugie, C może chcieć generatywnej grafiki i wideo AI. Ja ograniczam je do miejsc poza strukturami anatomicznymi (§4).
Po trzecie, C może chcieć wielu etykiet naraz w 3D. Ja daję limit ok. 10.

---

## 7. Ryzyka i niewiadome

1. **Jakość siatek Z-Anatomy pod dekymację:** nieszczelne i nakładające się powłoki, siatki-napisy (`.g`). `simplify` może zrobić dziury, więc potrzebny jest test „przed i po” renderem. Niewiadoma: realny współczynnik redukcji bez artefaktów (zakładam 35% / 10%).
2. **Dopasowanie HuBMAP ↔ Z-Anatomy:** różne ciała referencyjne (VH Male vs BP3D). Organy mogą „przenikać” kości. Jedna sztywna macierz może nie wystarczyć.
3. **Licencje:** BY-SA na GLB jest jasne, ale niejasne jest, czy pliki z BodyParts3D (dziś BY) „oczyszczają” część Z-Anatomy. Struktury NC (nerka, ucho wewnętrzne) trzeba blokować automatycznie. Kod przeglądarki svitylo nie ma podanej licencji, więc niczego z niego nie kopiujemy, bierzemy tylko liczby.
4. **Hosting i rozmiar repo:** nie wiem, gdzie aplikacja jest wdrażana. 40–60 MB GLB w Gicie bez LFS spuchnie przy każdym przewypieku. Rozważyć trzymanie GLB poza historią (artefakt budowania albo LFS). To decyzja użytkownika.
5. **Telefony / Safari:** WebGL2 na iOS ma ostre limity pamięci. Budżety T4 to szacunek, trzeba je zmierzyć na prawdziwym urządzeniu.
6. **Własny shader (T3/T5/T7):** więcej kodu do utrzymania przez agentów niż gotowe komponenty drei. Łagodzenie: jeden plik materiału, testy wizualne zrzutem.
7. **Brak publicznych danych o silnikach komercyjnych:** porównania opieram na API i opisach funkcji, nie na liczbach poligonów (BioDigital, Visible Body, Complete Anatomy ich nie publikują).
8. **NIH 3D i inne repozytoria:** nie zweryfikowałem w tej rundzie. Licencje są tam per model, więc każdy plik trzeba sprawdzić osobno.
9. **Równoległość Blendera:** 307 MB pliku + EEVEE na RTX 4050 6 GB ogranicza liczbę agentów renderujących naraz.
