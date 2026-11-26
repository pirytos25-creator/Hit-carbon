# Zgromadzenie, runda 1: Architekt 3D i potoku

Data: 2026-11-26. Gałąź `atlas-uklady` (`c4420f9`), prototypy `claude/atlas-wizualizacja-3d-1dc29a` (`7f653b8`), plan Reżysera.
Sprawdziłem sam: `npm run check:atlas` przechodzi (ΔE min. 15,3; 200 kotwic ≤ 0,173 px; fakty OK). Obejrzałem 12 zrzutów 1440 (sprint).
Przejrzałem `anchors.json`/`flows3d.json` wszystkich plansz, `atlas_lib.py`, 12 skryptów plansz i eksport prototypu.

## Ocena ogólna: **dobra baza 2D, do E3 brakuje kontraktu danych, a nie silnika**

- **Spójność wizualna 12 plansz jest dobra.**
  - 6 plansz całego ciała ma identyczną kamerę: orto 1,80319, środek (0; −0,0036; 0,857), 1000×1800. Są to: kostny, krwionośny, limfatyczny, mięśniowy, nerwowy i powłokowy, a do tego `body_front` hormonalnego i moczowego.
  - Światło pochodzi z biblioteki, kolory z `palette.json`, materiały są matowe.
  - Odstaje rozrodczy: płaskie, jasne kości HuBMAP i brak sylwetki. To waga niska, bo plansza jest kartą.
- **Potok jest utrzymywalny.**
  - Jest jedna transformacja HuBMAP: `align_hubmap`, używana we wszystkich 9 importach.
  - Blokada NC obejmuje wszystkie 6 siatek NC z inwentarza: `Kidney`, `Renal pelvis`, `Cochlea` i `Vestibule`, każda w wersji `.l` i `.r`.
  - Walidatory działają.
- **Gotowość do E3 jest częściowa.**
  - Są już `anchors3d` i kamera w schemacie 2, `flows3d.json` w metrach dla 9 plansz oraz wspólna rama Z-Anatomy.
  - Brakuje 4 rzeczy:
    - `structures.json` i `mesh_bindings.json`;
    - znacznika ramy dla scen zbliżeń;
    - kotwic dla ujęć bocznych;
    - eksportu stanów poszczególnych struktur.

## Problemy według wagi

| # | Waga | Gdzie | Co | Dlaczego | Propozycja |
|---|---|---|---|---|---|
| 1 | **wysoka** | `anchors.json` i `flows3d.json`: oddechowy (x=20), moczowy (29,9), powłokowy (30), limfatyczny (3), **mięśniowy (0,0,0)** | Sceny zbliżeń leżą w tej samej przestrzeni co ciało i nie mają znacznika ramy. Zbliżenie mięśniowego leży w miejscu stóp. Tory `d_*` mają `"units": "m"`, choć nefron ma w nich ok. 1,5 m | Scena 3D umieści te kotwice i strzałki w ciele albo obok niego. Prosty test „\|x\| > 1 m” nie wyłapie mięśniowego | Pole `camera.frame: "body" \| "inset:<id>"` (+ `insetScale`) i `frame` na każdym torze. Walidator w `check:atlas` odrzuca widok `body` ze środkiem poza obrysem ciała. Sceny wstawek w 3D zostają obrazami 2D albo osobnymi minisceneami |
| 2 | **wysoka** | skrypty plansz ↔ `proto_export_glb.py` | Poziomy pracy w sprincie i role żyją tylko w skryptach plansz. Eksport 3D ma ich ręczną kopię (`VESSEL_LEVEL`), stąd zły kolor pnia płucnego. Nie ma `structures.json` ani `mesh_bindings.json` | Łamie §3.2: „jeden przebieg Blendera daje 2D i GLB”. Każda poprawka planszy rozjedzie 2D i 3D | `Plate.render` zapisuje `bindings.json` (nazwa obiektu → układ, rola, poziomy, widoki, źródło, licencja). To ziarno `mesh_bindings.json` z E1. `atlas_export_glb.py` czyta ten plik zamiast kopiować reguły |
| 3 | **wysoka** | `plate_oddechowy.py` | Strzałki są tylko w pikselach (`plates/oddechowy.ts`, `flows.json`). Lokalne `merge_anchors` gubi `schemaVersion`. Lokalny `import_glb` nie ustawia `atl_source` | Model §3.2 nazywa piksele „ślepą uliczką”. Brak pochodzenia psuje przyszłe wiązania i wyjątek NC dla HuBMAP | Przejść na `al.import_glb`, `render(flows3d=…)` i scalanie z biblioteki. Usunąć martwe `transform` oraz `zc` i `hc` |
| 4 | średnia | kostny i mięśniowy (światło zbliżenia × 0,72), powłokowy (emisja max 0,25), mózg (kolory obwódki wpisane na sztywno, `#B8B0C8` spoza palety), nerwowy (własna kopia `build_silhouette`), mięśniowy (literał `#EE8A6E`), moczowy i powłokowy (`#E9F7F6`, `#E8D6A8`, `#EEF3F8`) | Lokalne kompensacje światła i koloru | Księga §9 tego zabrania. Shader 3D liczy kolory z palety, więc 2D i 3D się rozjadą | Parametr biblioteki `detail_light`. W palecie `emission.maxBySystem` i tokeny `aux`. Walidator: zakaz literałów hex w `plate_*.py` |
| 5 | średnia | `check:atlas` | Test NC (`tools_license_test.py`) wymaga Blendera i nie jest w bramce. Dla GLB brak kontroli | GLB to nowa droga wycieku NC i mieszania BY-SA z BY | Kontrola w Node: tabele ID i węzły GLB kontra `NC_BLOCKLIST` oraz jedna licencja na plik |
| 6 | średnia | kamery | Torsy w 4 skalach: hormonalny 1,06 przy 1800 px, oddechowy i pokarmowy 0,56 przy 1600, moczowy 0,50 przy 1600. Bok nazwany niejednolicie: kostny ma `right` (przód po prawej), mózg i rozrodczy `side` (+X, przód po lewej) | W 3D „widok kluczowy” musi być stałym zestawem ujęć | Kanoniczne `camera.keyView` (`front`, `left`, `back`, `right`, `torso_front`…) i jedna skala tułowia przy następnym przewypieku |
| 7 | średnia | `anchors3d` | Kotwice są tylko dla renderowanych widoków. W P1 podpisy znikają w ujęciach bocznych | Obrót poziomy z 4 przyciąganiami to decyzja §7 | Przebieg `ATLAS_ANCHORS_ONLY=1` dla 4 widoków kluczowych (bez renderu) |
| 8 | niska | `nerwowy/flows.json` (martwy), `rozrodczy/flows3d.json` (pusty), docstring kostnego (stary kolor `#B9A37E`) | Śmieci | Mylą agentów i plan Reżysera (§5.1 wskazuje `flows.json`) | Usunąć albo poprawić |

## Propozycje Wizualizatora i plan Reżysera

- **P1 „Gablota”: zgodna z §7 i z budżetem desktopu.**
  - Liczby: 5,6 MB, 0,53–0,59 mln trójkątów, 3–10 wywołań rysowania, 40–55 kl./s na Intel UHD.
  - **Przyjąć jako E3**, ale przenieść do `src/atlas3d/` i rozdzielić role: `proto_export_glb.py` → `atlas_export_glb.py` na danych z p. 2.
  - Brakuje 2 pomiarów: pamięci GPU (budżet 600 MB) i pomiaru na RTX.
- **P2 „Scena Całość”: zgodna co do kamery, ale przekracza budżet.**
  - Ma 1,59 mln trójkątów przy budżecie ≤ 1,5 mln i tylko 17–24 kl./s.
  - Zdania i kroki są wpisane w kod, a nie wzięte z faktów.
  - **Dopiero jako E4**, po `chains.json`, faktach F1–F10 i wyłączaniu niewidocznych warstw.
- **P3 „Pełna przestrzeń”: odrzucić.**
  - Zastrzeżenie do rekomendacji Wizualizatora: przeniesienie z P3 **suwaka krycia** i **wyboru dowolnej struktury** też łamie §7, bo ta decyzja wprost wyklucza suwaki warstw i wybór dowolnej z ok. 4500 struktur.
  - Dopuszczalny jest najwyżej wybór kliknięciem wśród struktur, które mają podpis na planszy.
- **Plan Reżysera jest zgodny z §7.** Ma 4 dozwolone ruchy kamery, obrót ≤ 90° z przyciąganiem, telefon zostaje przy 2D, a koszt wynosi 0 zł.
  - Uwaga 1: „Warstwy Całości” (R2-a) muszą powstać z tych samych deklaracji plansz (p. 2), a nie z nowego `plate_calosc.py` z kopią reguł. Pliki BY-SA i BY trzeba trzymać osobno.
  - Uwaga 2: `chains.json` niech od początku odwołuje się do ID struktur i torów `flows3d`, a nie do pikseli. Wtedy R3-a, czyli scena 3D, nie będzie wymagała przeróbek.

## Rekomendowana kolejność

1. **E3-0, kontrakt** (integrator, ok. 1 sesja). Punkty 1, 3, 5, 6 (pola) i 8. Bez nowych renderów poza oddechowym.
2. **Wiązania** (integrator + agent danych). Punkt 2, czyli `bindings.json` z `Plate.render`, a potem minimalne `structures.json` i `mesh_bindings.json` dla krwionośnego i mięśniowego. Pełne E1 może iść równolegle.
3. **E3 = P1 na krwionośnym (+ mięśniowym)** w `src/atlas3d/` jako leniwy fragment, z kotwicami 4 widoków (p. 7). Pomiar budżetu §3.2 na Intel UHD i RTX, razem z pamięcią GPU.
4. **Równolegle: Reżyser R1** (przewodnik 2D na `chains.json`). Potem R2-a z deklaracji plansz.
5. **E4 = P2** na tym samym silniku, po faktach F1–F10 i spełnieniu budżetu. Punkt 4 (paleta `aux`, światło zbliżeń) zrobić przy najbliższym przewypieku danej planszy.
