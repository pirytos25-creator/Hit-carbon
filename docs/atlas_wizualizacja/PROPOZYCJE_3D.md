# Atlas układów: trzy propozycje pełnej przestrzeni 3D

Stan: 2026-11-26, gałąź `claude/atlas-wizualizacja-3d-1dc29a` (scalona z `atlas-uklady` na `76e3ab3`, komplet 12 plansz).
Autor: agent wizualizacji. Przegląd przed pracą: `NOTATKI.md` w tym folderze.

## Jak obejrzeć (jedno polecenie)

Z katalogu repozytorium (worktree):

```powershell
npx vite --config prototypes/atlas3d/vite.config.mjs
```

Potem w przeglądarce otwórz `http://127.0.0.1:5201/` (spis), albo bezpośrednio:
- `http://127.0.0.1:5201/p1_gablota/`
- `http://127.0.0.1:5201/p2_scena/` (dopisek `#t=15` ustawia zegar na 15 s)
- `http://127.0.0.1:5201/p3_przestrzen/`

**Warunek:** pliki GLB leżą poza Gitem, w `prototypes/atlas3d/_assets/`. Na innym komputerze trzeba je raz wygenerować:
1. Blender: `blender/atlas/proto_export_glb.py` (przez slot `atlas_raw/.render_slot_N`, ok. 2 min);
2. kompresja: `node prototypes/atlas3d/tools/pack_assets.mjs`.

## Wspólna podstawa (płacona raz dla wszystkich trzech)

Wszystkie trzy propozycje stoją na tych samych plikach i tym samym silniku. Różnią się kamerą i scenariuszem, nie zasobami.

| Element | Jak zrobione | Zgodność z modelem |
|---|---|---|
| Eksport | `blender/atlas/proto_export_glb.py` (własny; `atlas_lib.py` tylko importowany) | §3.2 „jeden przebieg Blendera” |
| Geometria | scalone siatki: 1 warstwa = 1 siatka = 1 wywołanie rysowania; krzywe Z-Anatomy jako rury (4–6 ścianek) | §3.3 |
| ID struktury | atrybut `_ID` w każdym wierzchołku; tabela `ids_<plik>.json` z kluczem siatki (`za:Femoral artery.r`, `hra:VH_M_Kidney_L.glb/…`) | §3.1 |
| Stan | tekstura danych: na strukturę układ, poziom pracy, widoczność, wyróżnienie, własny moment. Zmiana stanu = zapis kilku tekseli | §3.3 |
| Kolor | shader liczy `REST_MIX` i emisję z `palette.json`, czyli tę samą funkcję co `atlas_lib.active_color` | §3.3 „kolory 2D i 3D to ta sama funkcja” |
| Kompresja | `EXT_meshopt_compression` + `KHR_mesh_quantization` (`gltf-transform`, pozycje 14 bitów, normalne 10 bitów) | §3.2 |
| Licencje | 5 plików `za_*` (Z-Anatomy, CC BY-SA 4.0) i `hra_kidney` (HuBMAP, CC BY 4.0) osobno; `license_check` blokuje NC (nerka i ucho Z-Anatomy); nerki z HuBMAP | §2 pkt 8 |
| Treść | podpisy importowane wprost z `src/atlas/plates/*.ts`; na ekran trafiają tylko statusy `checked_agent` i `anatomy`; kotwice z `anchors3d`, strzałki z `flows3d.json` | §3.6 |

### Pliki, trójkąty i rozmiary

| Plik | Struktur | Trójkątów | Przed kompresją | Po kompresji |
|---|---|---|---|---|
| `za_skeleton` (kości + sylwetka) | 278 | 294 078 | 7,45 MB | 1,82 MB |
| `za_muscles` | 500 | 329 165 | 8,58 MB | 2,08 MB |
| `za_vessels` (tętnice, żyły, serce) | 634 | 228 696 | 5,54 MB | 1,48 MB |
| `za_nervous` (nerwy, mózg, rdzeń) | 551 | 198 946 | 4,12 MB | 1,30 MB |
| `za_viscera` (trzewia) | 71 | 179 393 | 4,68 MB | 1,11 MB |
| `hra_kidney` (nerki, moczowody) | 73 | 30 558 | 0,66 MB | 0,22 MB |
| **Razem** | **2107** | **1 260 836** | **31,0 MB** | **8,0 MB** (+0,4 MB tabel ID) |

Budżet desktopu z §3.2: ≤ 20 MB, ≤ 1,5 mln trójkątów, ≤ 200 wywołań. **Całe ciało mieści się w nim z zapasem.**
Budżet telefonu (≤ 6 MB, ≤ 400 tys.) spełnia tylko pojedynczy układ (np. P1 w trybie krwionośnym bez mięśni: ok. 3,3 MB, 0,53 mln trójkątów, więc trójkąty za dużo o ok. 30%).

Kod: ok. 170–190 kB po gzip na stronę, z czego 162 kB to three.js (build: `vite build --config prototypes/atlas3d/vite.config.mjs`).

### Jak mierzyłem FPS (ważne zastrzeżenie)

Chrome na tym laptopie renderuje na **zintegrowanej karcie Intel UHD** (`ANGLE (Intel UHD Graphics … D3D11)`), a nie na RTX 4050.
Okno 1440×900, gęstość pikseli 1,25 (silnik ogranicza ją do 1,5). To wariant pesymistyczny, ale realny: wielu użytkowników laptopów też trafi na zintegrowaną kartę.
**Na RTX 4050 nie mierzyłem.** Pamięci GPU też nie mierzyłem.

---

## P1 „Gablota” (zgodna z decyzją z §7)

**Na czym polega.** Jeden albo dwa układy naraz (krwionośny, mięśniowy) na „podeście”, w tym samym kadrze co plansza 2D.
Obrót tylko w poziomie: przeciągnięcie albo strzałki ← →, a po puszczeniu widok dociąga do najbliższego z czterech ujęć (przód, bok lewy, tył, bok prawy).
Zbliżenia to gotowe ujęcia: serce (z wygaszonymi żebrami i mostkiem, jak `SKIP_BONES` na planszy) i udo.
Przełącznik Spoczynek/Sprint przenika kolory w 0,9 s w shaderze. Podpisy mają te same teksty i poziomy co plansza; w ujęciach bez kotwic (bok) znikają.
Strzałki płyną po torach `flows3d.json`, w sprincie szybciej (2 stopnie jakościowe, ilustracja).

**Zrzuty:** `zrzuty/p1_krwionosny_sprint_przod.jpeg`, `zrzuty/p1_serce_sprint.jpeg`, `zrzuty/p1_miesniowy_sprint_tyl.jpeg`.

| Pomiar | Wartość |
|---|---|
| Pobranie | 5,6 MB (3 pliki GLB + tabele ID) |
| Trójkąty na ekranie | 0,53 mln (krwionośny), 0,59 mln (mięśniowy) |
| Wywołania rysowania | 3–10 |
| FPS (Intel UHD) | 40–55 całe ciało; 20–27 w zbliżeniu serca (wygaszanie żeber ditheringiem kosztuje) |

**Gotowe:** obrót z przyciąganiem, 4 ujęcia, 2 zbliżenia, przełącznik stanów w shaderze, podpisy z plansz z filtrem poziomu, strzałki, kompas.
**Szkic:** tylko 2 z 12 układów; podpisy tylko dla ujęć, w których plansza ma kotwice (brak podpisów w bok); pień płucny w warstwie „serce” ma kolor tętnic, a na planszy kolor żył (do poprawy w eksporcie); brak wersji na telefon.
**Koszt dokończenia:** ok. 2–3 sesje agentów + jeden przebieg Blendera na grupę układów. Podłączenie do `AtlasApp` jako leniwy fragment (etap E3) robi integrator; mój eksport może być punktem wyjścia dla `atlas_export_glb.py`.
**Ryzyka:** małe. Kotwice dla ujęć bocznych trzeba dopisać w skryptach plansz. Kropkowane wygaszanie (dithering) jest widoczne z bliska.

## P2 „Scena Całość”

**Na czym polega.** Wszystkie układy w jednej scenie i jeden interwał na osi: od −4 do 90 s, czyli 45 s pracy (czerwone tło) i 45 s przerwy (turkusowe).
Dziewięć kroków ze storyboardu Reżysera §3.2: spoczynek → nerwy → serce → „krew zmienia adres” (z pytaniem „przewidź”) → oddech → szczyt → przerwa → wątroba i skóra → „co się zmieniło”.
Warstwy zapalają się w kolejności kroków, najwyżej 3 kolory naraz, a każda struktura może mieć własny moment (np. krew już w przerwie, oddech jeszcze w sprincie).
Kamera jedzie tylko po szynie: pchnięcie do serca i klatki, obrót ≤ 90°. Są przyciski Start/Pauza, Dalej i „Pomiń, chcę sam” (przejście do P1), a kliknięcie osi przewija.
Podpis-odpowiedź na pytanie „przewidź” pojawia się dopiero po wyborze.

**Zrzuty:** `zrzuty/p2_krok1_nerwy.jpeg`, `zrzuty/p2_krok3_krew.jpeg`, `zrzuty/p2_krok7_watroba_skora.jpeg`.

| Pomiar | Wartość |
|---|---|
| Pobranie | 8,4 MB (6 plików GLB + tabele ID) |
| Trójkąty na ekranie | 1,26 mln; 1,59 mln w krokach z półprzezroczystymi mięśniami (three rysuje przezroczyste siatki dwustronne w dwóch przebiegach) |
| Wywołania rysowania | 13–18 |
| FPS (Intel UHD) | 17–24 |

**Gotowe:** zegar, oś, 9 kroków, przenikanie warstw i momentów, „przewidź” z zatrzymaniem zegara, HUD jak w filmie, legenda warstw, strzałki 4 układów.
**Szkic:** zdania kroków są moje i nie mają liczb (czekają na fakty F1–F10 z `tSecFromBoutStart`); brak `chains.json`, więc kroki są wpisane w kod; strzałki ciepła wyglądają jak krótkie kreski; nie ma dźwięku; hormonalny i limfatyczny (już scalone) jeszcze nie są w scenie.
**Koszt dokończenia:** ok. 4–6 sesji agentów: `chains.json` i walidator, fakty F1–F10, wspólny odtwarzacz z koncepcją A Reżysera (2D), dźwięk, test z 2–3 osobami.
**Ryzyka:**
- wydajność: 17–24 FPS na zintegrowanej karcie. Łatwy zysk: nie rysować warstw o widoczności 0 (dziś są ukrywane w shaderze, a nie wyłączane) i ograniczyć gęstość pikseli;
- zależność od faktów: bez F1–F10 przewodnik pokazuje kierunki, ale nie liczby;
- ryzyko, przed którym ostrzega Reżyser: ładna scena może zastąpić treść.

## P3 „Pełna przestrzeń” (poza decyzją użytkownika)

> **Uwaga:** 25.11.2026 użytkownik zdecydował o „obrocie w poziomie + widokach kluczowych”, bez wolnej orbity i dowolnego zoomu (model §7). P3 to łamie.
> Zbudowałem ją tylko po to, żeby było z czym porównać. Decyzja należy do użytkownika.

**Na czym polega.** Wolna kamera (obrót w każdą stronę, przybliżenie do kursora, przesuwanie) i 11 przełączników warstw.
Jeden suwak krycia mięśni i kości działa jak w Zygote. Kliknięcie dowolnej z ok. 2100 struktur pokazuje jej nazwę, układ, ID siatki i licencję, a struktura pulsuje.
Przycisk „przelot” prowadzi kamerę wnętrzem tętnicy, po torze `artery_leg`, od aorty do stopy.

**Zrzuty:** `zrzuty/p3_zblizenie_wybor.jpeg` (zrobiony przed poprawką: widać jeszcze szerokie pasy strzałek z bliska, które teraz gasną), `zrzuty/p3_przelot_tetnica.jpeg`.

| Pomiar | Wartość |
|---|---|
| Pobranie | 8,4 MB |
| Trójkąty na ekranie | 0,93 mln (start, mięśnie wyłączone); 1,26 mln wszystko |
| Wywołania rysowania | 11–13 |
| FPS (Intel UHD) | 26–33 całe ciało; ok. 47 w przelocie |
| Wybór kliknięciem | ok. 83 ms (raycast bez BVH) |

**Gotowe:** wolna orbita, warstwy, suwak krycia, wybór i podświetlenie dowolnej struktury, przelot.
**Szkic:**
- nazwy są angielskie lub łacińskie z Z-Anatomy, bo polskie przyjdą dopiero z `structures.json` (E1);
- brak podpisów z faktami, bo w swobodnym 3D nie ma znanych ujęć, do których można je przypiąć;
- **przelot wygląda surowo:** rury naczyń mają 4–6 ścianek, a przez światło naczynia przechodzą sąsiednie struktury (zrzut).

**Koszt dokończenia:** ok. 6–10 sesji agentów. Potrzebne są:
- przyspieszenie wyboru (BVH, np. `three-mesh-bvh`, MIT);
- polskie nazwy (E1);
- podpisy z zasłanianiem;
- osobna, gęsta geometria wnętrza naczyń do przelotu (z krzywych, nie z AI);
- obsługa wyszukiwarki struktur;
- przemyślenie, czego uczy (dziś pokazuje anatomię, a nie sprint).

**Ryzyka:**
- duże ryzyko rozrostu zakresu (model §6 pkt 7);
- badania z §4 pkt 2: swobodne obracanie szkodzi części osób o słabszej wyobraźni przestrzennej, a docelowo odbiorcą są laicy i licealiści;
- telefon praktycznie odpada.

---

## Porównanie

| | P1 Gablota | P2 Scena Całość | P3 Pełna przestrzeń |
|---|---|---|---|
| Zgodność z decyzją §7 | tak | tak (kamera po szynie) | **nie** |
| Uczy, co robi sprint | tak, jeden układ | **najlepiej**: przyczyny i kolejność | słabo (anatomia, nie fizjologia) |
| Efekt „wow” | średni (obrót, paralaksa) | wysoki (kino danych) | wysoki (wolna kamera, przelot) |
| Pobranie | 5,6 MB | 8,4 MB | 8,4 MB |
| Trójkąty | 0,5–0,6 mln | 1,26–1,59 mln | 0,93–1,26 mln |
| FPS na Intel UHD | 40–55 | 17–24 | 26–47 |
| Gotowość prototypu | wysoka | średnia (szkic zdań, brak faktów F1–F10) | średnia (przelot surowy) |
| Koszt dokończenia | 2–3 sesje | 4–6 sesji | 6–10 sesji |
| Telefon | możliwy dla 1 układu po odchudzeniu | trudny | odpada |
| Ryzyko | małe | średnie (fakty, wydajność) | duże (zakres, dydaktyka, decyzja) |

## Rekomendacja

**P1 teraz, P2 jako następny etap na tym samym silniku, a P3 nie jako tryb główny.**

1. **P1 jako etap E3** (prototyp 3D na komputer z modelu §5): zgadza się z decyzją użytkownika, jest najtańszy, mieści się w budżecie z dużym zapasem i działa płynnie nawet na zintegrowanej karcie.
   Przy okazji potwierdza architekturę z §3.3: scalone siatki, ID w wierzchołkach i stan w teksturze działają, a całe ciało to 13–18 wywołań rysowania.
2. **P2 jako etap E4** („Całość” w 3D), po sprawdzeniu faktów F1–F10 i powstaniu `chains.json`. To trzecia odsłona koncepcji A Reżysera: ten sam scenariusz co przewodnik 2D, tylko w przestrzeni.
   Uczy najwięcej, bo pokazuje kolejność i przyczyny, a nie tylko stany. Przed wdrożeniem trzeba poprawić wydajność (wyłączać niewidoczne warstwy).
3. **P3 nie polecam jako trybu głównego.** Łamie decyzję, słabo uczy fizjologii sprintu, a przelot wymaga nowej geometrii.
   Z P3 warto przejąć tylko dwie drobne rzeczy, jeśli użytkownik zechce: kliknięcie struktury z nazwą (dla poziomu „Rozszerzony”) i suwak krycia.
   Oba da się dodać do P1 bez wolnej orbity.

## Problemy wykryte przy prototypach (dla integratora)

1. **Modyfikatory Z-Anatomy.** Serce, mózg, rdzeń i trzewia mają podział powierzchni. Decymację trzeba liczyć po modyfikatorach, bo z siatki bazowej wychodzi 2–10× za dużo trójkątów (poprawione w moim eksporcie).
2. **Pień płucny** w warstwie serca ma kolor tętnic. Eksport powinien klasyfikować jamy serca jak `plate_krwionosny.py`.
3. **Kotwice tylko dla renderowanych widoków.** W 3D brak podpisów w ujęciach bocznych. Potrzebne są `anchors3d` dla ujęć kluczowych 3D albo test zasłaniania.
4. **Strzałki rysowane „na wierzchu”** wyglądają z bliska jak szerokie pasy. Trzeba je chować w zbliżeniach albo przygaszać z odległością.
5. **Dithering** dobrze wygasza drobne struktury (żebra), ale na dużych warstwach daje kratkę. Na duże warstwy lepsza jest prawdziwa przezroczystość, która jednak rysuje siatkę dwa razy.
6. **Wybór bez BVH** zajmuje ok. 83 ms. Do przyjęcia na kliknięcie, za wolno na najechanie kursorem.
7. **Nazwy.** Tabele ID mają nazwy Z-Anatomy; polskie dopiero po E1.
8. **Karta graficzna.** Chrome na tym laptopie wybiera Intel UHD. Budżety z §3.2 warto mierzyć na karcie zintegrowanej, nie tylko na RTX.

## Pliki

- `blender/atlas/proto_export_glb.py`: eksport (warstwy, `_ID`, budżety trójkątów, licencje, poziomy pracy wg reguł plansz);
- `prototypes/atlas3d/tools/pack_assets.mjs`: meshopt + kwantyzacja, raport rozmiarów;
- `prototypes/atlas3d/shared/engine.js`: silnik (materiał z łatką shadera, tekstura stanu, strzałki, podpisy, kamera po szynie, wybór, pomiar);
- `prototypes/atlas3d/p1_gablota/`, `p2_scena/`, `p3_przestrzen/`: strony;
- `prototypes/atlas3d/_assets/` (poza Gitem): GLB, `ids_*.json`, `sizes.json`, `raw/export_report.json`.
