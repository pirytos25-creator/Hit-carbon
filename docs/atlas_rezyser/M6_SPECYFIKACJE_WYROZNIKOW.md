# M6: specyfikacje 4 wyróżników pilota

Stan na 2026-11-26. Autor: Reżyser. Odbiorcy: integrator (kontrakt wyróżnika), Wizualizator (moduł `src/biomotion`), agenci układów krwionośnego, kostnego, nerwowego i powłokowego (wykonanie we własnych plikach). Bez kodu.

Podstawa:
- karta stylu (`UX_POSIEDZENIE.md` §3);
- przegląd filmu (`docs/atlas_wizualizacja/FILM_PRZEGLAD.md` §6: wszystkie wersje Low ≤ 1 ms; ROZDZIAŁ na skali ciała jako strumień w ścianie);
- moduł (`BIOMOTION_ARCHITEKTURA.md` §2–3);
- fakty `checked_agent` z `src/atlas/data/facts/<uklad>.json` (stan `576ee4d`).

## 0. Pola specyfikacji (do przeniesienia w kontrakt wyróżnika)

Kontrakt wyróżnika ustala integrator z Wizualizatorem. Jeszcze go nie ma, więc piszę w polach, które dają się przenieść jeden do jednego:

| Pole | Znaczenie |
|---|---|
| `id`, `plate` | identyfikator wyróżnika i planszy |
| `sign` | jak wygląda (znak) |
| `motion` | **jeden** ruch na planszy |
| `variable` | co ruch koduje (test zmiennej) |
| `magnitudeSource` | `factIds` (`checked_agent`) albo `"illustration3"` (3 stopnie jakościowe z chipem „ilustracja”) |
| `rule` | jak wartość faktu przechodzi w parametr ruchu |
| `moments` | jak wyróżnik wygląda w `Spoczynek / <moment> / Co się zmieniło` |
| `tracks` | tory w metrach (`flows3d.json`) jako dane torów, nie rysowane linie |
| `modules` | klocki `src/biomotion` (`FlowParticles`, `TissueMotion`, `materials`, `vascularFlowShader`, `BioClock`) |
| `low`, `high` | wersje jakości (Low: Intel UHD, ≥ 50 FPS, ≤ 1 ms GPU, bez postprocesu i bez półprzezroczystych nakładek) |
| `view2d` | wersja na planszy 2D (`src/atlas/signatures/<uklad>.tsx`) |
| `legend` | „Jak czytać”: 2–3 symbole; **tylko tu wolno kreski i strzałki** |
| `reducedMotion` | zachowanie przy `prefers-reduced-motion` |
| `filmAct` | akt filmu |
| `chips` | chipy na scenie („powiększone”, „zwolnione ×N”, „ilustracja”, „schemat”) |

Wspólne dla czterech wyróżników:
- **ruch zaczyna się przy zmianie momentu** (przejście 0,9 s), a potem trwa w pętli;
- **pauza** na „Spacja”, jak w widoku 3D;
- przy `prefers-reduced-motion` wyróżnik to stopklatki;
- **wersja 2D** używa sprite'ów wypieczonych w Blenderze (np. krwinka z profilu Evansa–Funga z kilku kątów, kropla potu, pakiet impulsu) poruszanych po torze rzutowanym `projection.ts`. To obraz z objętością, a nie kreska. Koszt jest pomijalny (canvas 2D albo SVG `<image>`);
- **etykiety momentu** (warunek Dyrygenta, uwaga do klatki B): tekst zawsze na własnym tle `#0D1526` z kryciem ≥ 85% (kontrast `#E6ECF5` 15,3:1). Na przycisku w kolorze układu tekst w `onColor` z `palette.json` (zmierzone: nerwowy 9,8:1, kostny 4,9:1, krwionośny 4,7:1, powłokowy 8,6:1). **Biały tekst na kolorze nerwowego (1,9:1) i powłokowego (2,2:1) jest zabroniony.**

---

## W1. Krwionośny: ROZDZIAŁ

| Pole | Specyfikacja |
|---|---|
| `sign` | **skala ciała:** strumień, czyli przesuwany wzór jasności w ścianie tętnic i żył (`vascularFlowShader` z filmu); **zbliżenie uda:** krwinki 3D (profil Evansa–Funga, 6–7 mm, chip „powiększone”) w ścianie z ditheringiem (Low) albo półprzezroczystej (High), jak w klatce B |
| `motion` | krew płynie: wzór i krwinki przesuwają się wzdłuż toru od serca (tętnice) i do serca (żyły) |
| `variable` | **dokąd idzie krew**: udział przepływu dla mięśni nóg, trzewi i mózgu w danym momencie |
| `magnitudeSource` | `krwionosny.metric.udzial_miesni_w_przeplywie_krwi` (< 20% → ok. 80%), `metric.rzut_serca` (ok. 5 → 20–25 L/min), `role.femoral.*` („wielokrotnie większy przepływ”), `role.portal.*` („mniej krwi: naczynia trzewne się zwężają”), `role.carotid.sprint` („przepływ do mózgu prawie stały”); wszystkie `protocolMismatch` (wysiłek maksymalny) |
| `rule` | **3 stopnie przepływu na tor** (niski, średni, wysoki), wybierane z kierunku faktów: nogi (spoczynek niski, sprint wysoki), trzewia (spoczynek średni, sprint niski), mózg (spoczynek średni, sprint średni). Parametry stopni: prędkość wzoru (okres 2,6 / 1,6 / 1,0 s, jak w karcie), jasność wzoru (+0 / +15 / +30% L*), w zbliżeniu gęstość krwinek (1× / 2× / 4×). Kierunek jest z faktów, a krok między stopniami to **ilustracja** (chip), bo literatura nie daje „prędkości strumienia” w tej formie. Liczba-bohater w panelu: „ok. 80% krwi do mięśni (spoczynek: < 20%)” |
| `moments` | Spoczynek: nogi niski, trzewia średni, mózg średni. Sprint: nogi wysoki, trzewia niski, mózg średni. **Co się zmieniło:** w pełnym kolorze tylko tory, które zmieniły stopień (nogi ↑, trzewia ↓); mózg wygaszony, bo bez zmiany, co jest samo w sobie lekcją |
| `tracks` | `artery_leg` (bez zmian); **`vein_leg` do poprawy** (niżej); **nowy `artery_gut`**: `Abdominal aorta` → `Coeliac trunk` / `Superior mesenteric artery` (nazwy z inwentarza Z-Anatomy, kierunek z topologii drzewa); `artery_head`, `vein_head` bez zmian |
| `modules` | `vascularFlowShader` (strumień), `FlowParticles` (zbliżenie), `materials` (dithering), `BioClock` |
| `low` | strumień w ścianie: 0 krwinek na skali ciała, < 0,5 ms; zbliżenie: ok. 500 krwinek, ściana z ditheringiem Bayera (+1,1 ms). Uwaga: w zbliżeniu suma może przekroczyć 1 ms, więc **w zbliżeniu strumień w ścianie się wyłącza** (krwinki go zastępują) |
| `high` | strumień + krwinki także na skali ciała w pobliżu kamery; zbliżenie: 3–5 tys. krwinek, prawdziwa przezroczystość ściany, prędkość z przekroju (v ~ 1/r²) |
| `view2d` | strumień jako przesuwający się gradient jasności nałożony maską naczynia z renderu (maska z warstwy tętnic i żył w Blenderze, eksport `mask_vessels.webp`); w zbliżeniu sprite'y krwinek na torze |
| `legend` | (1) jasny pas płynący w naczyniu: „krew w ruchu; szybciej i jaśniej = więcej krwi”; (2) krwinka czerwona / niebieska: „utlenowana / odtlenowana (kolor umowny)”; (3) strzałka tylko tutaj: kierunek od serca i do serca |
| `reducedMotion` | wzór stoi; stopnie widać jasnością i gęstością krwinek; przy torach w legendzie numery 1–3 stopni |
| `filmAct` | 3 (tunel krwiobiegu), 6 (HIIT: rozdział krwi), 12 |
| `chips` | „ilustracja: stopnie przepływu”, „powiększone” (zbliżenie) |

**Poprawka toru żylnego** (uwaga Dyrygenta, wykonuje agent krwionośny w `blender/atlas/plate_krwionosny.py`, `FLOW_PATHS`):
- dziś `vein_leg` zaczyna się żyłą odpiszczelową (`Great saphenous vein.r`), która jest **powierzchowna** i biegnie obok żyły udowej;
- tor ROZDZIAŁU ma iść **żyłami głębokimi, towarzyszącymi tętnicom toru `artery_leg`**:
  `Anterior tibial veins.r` → `Popliteal vein.r` → `Femoral vein.r` → `External iliac vein.r` → `Common iliac vein.r` → `Inferior vena cava (abdominal part)` → `Inferior vena cava (thoracic part)`;
- żyła odpiszczelowa zostaje torem wyróżnika CIEPŁO (powłokowy), bo to żyła skóry. **Rozdzielenie żył głębokich (praca mięśni) i powierzchownych (ciepło) to osobna, czytelna lekcja;**
- kotwica `saphenous` (podpis) się nie zmienia; zmienia się tylko tor strumienia;
- kontrola: tor na własnym kolorze ≥ 85% pikseli (metoda z `wizualna_K2_krwionosny.md` §2) i kierunek z dołu do góry.

---

## W2. Kostny: KONSTRUKCJA

| Pole | Specyfikacja |
|---|---|
| `sign` | **fala obciążenia**: rozjaśnienie w barwie `bone.light` przesuwa się wewnątrz kości nogi podporowej (stopa → piszczel → udowa → miednica → odcinek lędźwiowy) w materiale tkanki (emisja + SSS), bez strzałek i wektorów na scenie |
| `motion` | jedno „przejście” fali w górę szkieletu na każdy krok biegu |
| `variable` | **ile i którędy szkielet przenosi nacisk podłoża** |
| `magnitudeSource` | `kostny.metric.szczyt_nacisku_podloza_na_stope` (ok. 2,5–2,7 × masa ciała; szczyt w 35–50% czasu kontaktu), `metric.kontakt_stopy_z_podlozem` (ok. 0,24–0,27 s); oba `protocolMismatch` (bieg 3–5 m/s) |
| `rule` | czas trwania fali = czas kontaktu stopy (0,25 s), **zwolniony ×4** (chip „zwolnione ×4”), bo 0,25 s jest za krótkie do śledzenia; szczyt jasności w 35–50% przejścia; jasność szczytu odpowiada wartości 2,5–2,7 (jedna, stała jasność, bo nie porównujemy z innym nasileniem). Liczba-bohater: „ok. 2,5–2,7 × masa ciała” |
| `moments` | Spoczynek (stanie): fala nie biegnie, kości w zwykłym kolorze (liczby dla stania nie mamy, więc **bez liczby**). Krok biegu: fala w pętli. Po tygodniach: osobna karta „przebudowa kości ok. 120–200 dni” (`metric.przebudowa_kosci_po_tygodniach`), bez fali. **Co się zmieniło:** w pełnym kolorze kości toru `load_path_r`, reszta szkieletu 35% |
| `tracks` | `load_path_r` (`public/atlas/kostny/flows3d.json`, 50 punktów, kind `force`) jako oś fali |
| `modules` | `materials` (emisja z tekstury stanu + jednolity parametr fazy wzdłuż toru), `BioClock` (rytm kroku) |
| `low` | fala jako kolejne zapalanie 4 kości (stopa, piszczel, udowa, miednica) przez teksturę stanu, bez gradientu: ok. 0 ms |
| `high` | ciągły gradient jasności przesuwany wzdłuż toru w shaderze; lekkie SSS w kości |
| `view2d` | gradient jasności w masce kości nogi (maska z renderu `kostny/front`), przesuwany po rzucie `load_path_r` |
| `legend` | (1) rozjaśnienie w kości: „nacisk podłoża biegnie przez kości”; (2) „× masa ciała”: „ile razy więcej niż ciężar ciała”; (3) strzałka w górę tylko tutaj: kierunek przenoszenia nacisku |
| `reducedMotion` | stopklatka w szczycie (cała noga podporowa jasna) + liczba |
| `filmAct` | 1 (ujęcie 2: stopa na taśmie bieżni), 12 (przebudowa kości) |
| `chips` | „zwolnione ×4” |

Uwaga dydaktyczna: kostny jest **inny niż narządy**. Nie ma przepływu ani pracy chemicznej, jest konstrukcja. Dlatego jego ruch to przenoszenie nacisku, a nie cząstki.

---

## W3. Nerwowy: IMPULS

| Pole | Specyfikacja |
|---|---|
| `sign` | **pakiet impulsu**: jasny rdzeń (biel = sygnał) z poświatą `nerve` (bursztyn, decyzja Dyrygenta: ta sama barwa w filmie), biegnący po nerwie |
| `motion` | salwa pakietów biegnie torem **kora ruchowa → rdzeń → nerw kulszowy → mięśnie łydki** (widok z tyłu, tor `back_motor`, jedyny z całą kolejnością); w widoku z przodu od rdzenia: **rdzeń → splot lędźwiowy → nerw udowy → mięsień czworogłowy** (`front_femoral`), a etap „kora” zaznacza lokalizator. Przy dojściu do mięśnia krótki błysk w obszarze mięśnia (koniec tego samego ruchu, nie nowy ruch) |
| `variable` | **kolejność** (skąd i dokąd idzie rozkaz) i **jak często** motoneuron wysyła impulsy |
| `magnitudeSource` | kolejność: `nerwowy.role.motor_cortex.sprint`, `role.spinal_cord.sprint`, `role.lumbar_plexus.sprint`, `role.femoral.sprint` (anatomia + role sprawdzone); częstość: `metric.czestotliwosc_wyladowan_motoneuronu` (spoczynek: cisza, ok. 8–9 Hz przy włączeniu; sprint: ok. 30 Hz), `protocolMismatch` |
| `rule` | **odstęp między pakietami ∝ 1/częstość**: spoczynek pojedyncze pakiety rzadko (8–9 Hz), sprint ok. 3,5× gęściej (30 Hz). Prędkość pakietu po torze **nie** koduje prędkości przewodzenia (prawdziwa jest dla oka za duża); tor ok. 1,2 m przebiega w 1,5 s, chip „zwolnione”. Liczba-bohater: „ok. 30 impulsów na sekundę (włączenie: ok. 8–9)” |
| `moments` | Spoczynek: pojedyncze pakiety, rzadko. Sprint: gęsta salwa. **Co się zmieniło:** w pełnym kolorze tylko tor z pakietami, reszta nerwów 35% |
| `tracks` | **`back_motor` jako tor główny** (kora → rdzeń → nerw kulszowy → łydka), `front_femoral` w widoku z przodu (od rdzenia: splot lędźwiowy → nerw udowy → czworogłowy) z `public/atlas/nerwowy/flows3d.json`; domyślne ujęcie wyróżnika: **tył**; `front_sympathetic` **nie** w pilocie (to droga do nadnerczy, czyli wyróżnik hormonalny) |
| `modules` | `FlowParticles` (kształt „pakiet impulsu” z `shapes.ts`), `materials` (emisja na odcinku nerwu), `BioClock` |
| `low` | pakiet jako emisja przesuwana po odcinku rury nerwu (shader), bez sprite'a poświaty; najwyżej 6 pakietów naraz |
| `high` | rdzeń + poświata (sprite, nieprzezroczysty, addytywny tylko w profilu `film`), do 20 pakietów; w profilu `film` bloom tylko na pakietach |
| `view2d` | sprite pakietu (wypieczony) po rzucie toru; numery etapów 1–4 tylko w legendzie |
| `legend` | (1) jasny punkt z bursztynową poświatą: „rozkaz w drodze”; (2) 1 kora → 2 rdzeń → 3 nerw → 4 mięsień: „kolejność” (w widoku z przodu etapy 2–4); (3) odstęp między punktami: „jak często” (chip „zwolnione”) |
| `reducedMotion` | 4 stopklatki: pakiet kolejno w etapach 1–4, przełączane przyciskiem; częstość jako liczba |
| `filmAct` | 2 (ujęcia 1–2: kora ruchowa, złącze nerwowo-mięśniowe) |
| `chips` | „zwolnione” |

---

## W4. Powłokowy: CIEPŁO

| Pole | Specyfikacja |
|---|---|
| `sign` | **ciepło w skórze i pot**: ciepła poświata podpowierzchniowa skóry (emisja + SSS w barwie `skin`), krople potu (instancje, matowe, nieprzezroczyste, w barwie kontekstu skóry `#9AA4B5`) i strumień w żyłach powierzchownych (odpiszczelowa, odłokciowa, odpromieniowa) |
| `motion` | **wybrany ruch: strumień w żyłach skóry**; poświata i krople zmieniają się tylko w przejściu momentu (0,9 s), nie ruszają się w pętli. Dzięki temu na planszy jest jeden ruch |
| `variable` | **ile krwi płynie przez skórę (kierunek w czasie) i gdzie ciało poci się najbardziej** |
| `magnitudeSource` | `powlokowy.summary.sprint` (na starcie naczynia skóry się zwężają; po pracy rozszerzają), `role.vessels_sup.sprint`, `role.great_saphenous.sprint`, `role.cephalic.sprint`, `role.basilic.sprint` („odprowadza więcej krwi ze skóry”), `metric.pot_czolo_i_dlon` (czoło ok. 1,7 vs dłoń ok. 0,12 L/m²/h; `protocolMismatch`: 75% VO₂max, 55.–60. min), `role.skin_forehead.sprint`, `role.skin_back.sprint`, `metric.energia_z_pracy_miesni_zamieniana_w_cieplo` (> 75%) |
| `rule` | strumień w żyłach skóry: 3 stopnie (start pracy niski, spoczynek średni, po pracy wysoki), kierunek z faktów, krok to ilustracja. Gęstość kropli: czoło : dłoń ≈ 14 : 1 (z faktu, w zaokrągleniu); plecy jak tułów „najmocniej pocący się”, bez liczby. Poświata: 3 stopnie (ilustracja). Liczba-bohater: „ponad 75% energii mięśni zamienia się w ciepło” |
| `moments` | `momentLabelPl`: **Spoczynek / Start pracy / Po treningu** (plansza ma własne znaczenie „sprintu”, czyli koniec treningu). Spoczynek: strumień średni, bez potu. Start pracy: strumień niski (zwężone naczynia), bez potu. Po treningu: strumień wysoki, pot, poświata. **Co się zmieniło:** w pełnym kolorze żyły skóry i obszary potu |
| `tracks` | `vein_saphenous`, `vein_small_saphenous`, `vein_cephalic` z `public/atlas/powlokowy/flows3d.json`; tory `heat_*` **nie są rysowane** (zostają w danych jako miejsca poświaty) |
| `modules` | `vascularFlowShader` (strumień), `FlowParticles` (krople jako instancje statyczne, ze zmianą liczby w przejściu), `materials` (emisja + SSS „wrap”) |
| `low` | strumień w ścianie żył + emisja skóry; ≤ 150 kropli nieprzezroczystych; sylwetka jak w E3 (dithering) |
| `high` | + połysk kropli (sheen), więcej kropli, mocniejsze SSS |
| `view2d` | strumień w masce żył skóry; sprite'y kropli na czole i plecach; poświata jako zmiana jasności warstwy skóry (dwa rendery: spoczynek i po treningu, przenikanie) |
| `legend` | (1) jasny pas w żyle pod skórą: „więcej krwi płynie przez skórę i oddaje ciepło”; (2) kropla: „pot; więcej kropli = więcej potu”; (3) ciepła poświata: „skóra oddaje ciepło (3 stopnie, ilustracja)” |
| `reducedMotion` | 3 stopklatki momentów; bez przesuwania strumienia |
| `filmAct` | 6 (granice HIIT: ciepło), 11 (regeneracja) |
| `chips` | „ilustracja: stopnie przepływu i ciepła”, „W badaniu: 75% VO₂max, 55.–60. min” przy liczbach potu (Podstawowy: krótko, Rozszerzony: pełny protokół) |

---

## 5. Odbiór M6 (co sprawdzę na nagraniach i zrzutach)

1. **Test zmiennej:** każdy ruch ma wskazaną zmienną i źródło (tabele wyżej); element bez wpisu to poprawka.
2. **Jeden ruch na planszy** (W4: strumień; poświata i krople tylko w przejściu).
3. **Kontrast:** etykiety momentu ≥ 4,5:1; liczby-bohaterowie na tle panelu.
4. **Low:** ≥ 50 FPS na UHD przy 1440×900 dla 4 plansz × 3 momenty, ≤ 1 ms GPU na wyróżnik (`__bench`).
5. **Kotwice:** cząstki i poświata nie zasłaniają kotwic podpisów (zrzuty z naniesionymi kotwicami).
6. **`prefers-reduced-motion`:** stopklatki zgodne z tabelami.
7. **Tor żylny ROZDZIAŁU** idzie żyłami głębokimi (kontrola ≥ 85% na własnym kolorze).

## 6. Otwarte sprawy

- **Kontrakt wyróżnika** (integrator + Wizualizator): pola z §0 to moja propozycja; dopasuję się do ich nazw.
- **Maski 2D** (`mask_vessels.webp` i maski kości): nowy eksport z Blendera dla planszy 2D; wykonuje agent układu w swoim skrypcie. Do potwierdzenia w kontrakcie, czy 2D w pilocie jest konieczne, czy wystarczy 3D z planszą 2D bez ruchu.
- **Fakty bez liczby** (stopnie przepływu, poświata) zostają ilustracją z chipem. Jeśli agent faktów znajdzie liczby (np. przepływ trzewny w %), reguła przejdzie na liczbę bez zmiany ruchu.
