# Zespół atlasu: sesje i stan punktów kontrolnych

Stan na 2026-11-26 (po wznowieniu o 01:00). Ten plik jest zapisem stanu na wypadek przerwy (limit użycia).

Dyrygent (CEO): `local_d25e62f6-f11b-4af7-b30c-5a3005c68551`, główny checkout, gałąź `atlas-uklady`.
Koordynator (sesja nadrzędna): `local_522be64d-3ad8-4991-8085-7f34b69c40a3`.

| Agent | Sesja | Port | K1 | K2 | K3 |
|---|---|---|---|---|---|
| integrator | `local_172431d6-a66e-4c5b-a8af-65b81ba57f5d` | 5190 | zaliczony | zaliczony | **zaliczony, scalony** (227befb) → teraz integracja 1b cz. 1 |
| hormonalny | `local_ea8edc9b-cb7f-40ae-9ae2-81613e24be2c` | 5191 | zaliczony (zmiana kadru) | zaliczony | **zaliczony, scalony** (12/12) |
| powłokowy | `local_e1dedfd1-808a-4610-9b7e-b27f70554bb6` | 5192 | zaliczony | zaliczony | **zaliczony, scalony** |
| pokarmowy | `local_dc0d456d-5b08-4b78-885d-fbb7b4512592` | 5193 | zaliczony | zaliczony | **zaliczony, scalony** |
| wydalniczy | `local_37e1ca28-e80a-4465-a772-f7cebfdf8e93` | 5194 | zaliczony | zaliczony | **zaliczony, scalony** |
| kostny | `local_e40f4943-860f-4eee-9aaf-2615cee60e38` | 5195 | zaliczony | zaliczony | **zaliczony, scalony** |
| limfatyczny | `local_562c4781-155b-408c-9843-240bfffcb276` | 5196 | zaliczony | zaliczony | **zaliczony, scalony** |
| rozrodczy | `local_38e25e6a-ea22-4f47-9266-0aa8758cd6d5` | 5197 | zaliczony | zaliczony | **zaliczony, scalony** |
| Reżyser | `local_0e06d3c8-a948-4de9-b211-ddf665a1cee7` | 5198 | plan gotowy (`docs/ATLAS_REZYSER_PLAN.md`), czeka na decyzję użytkownika | | |
| Wizualizacja 3D (prototypy P1–P3) | `local_dc5e6e98-3d75-4195-b564-6b8a39eb661f` | 5200–5202 | uruchomiony przez koordynatora; worktree, `prototypes/atlas3d/`, nie scala do `atlas-uklady`; streszczenie do zgromadzenia | | |

Sprawdzanie faktów w toku:
- 55 faktów `draft` 5 plansz po K3 integratora: `fakty_draft_K3_zaopatrzenie.md` (17/5/5), `fakty_draft_K3_ruch.md` (22/4/2) – oba gotowe, przekazane integratorowi. Po obu – integrator nadaje statusy w 1b.
- K2 limfatyczny i pokarmowy: `fakty_limfatyczny.md`, `fakty_pokarmowy.md` – gotowe.
- Fakty `draft` 7 nowych układów po poprawkach K2 – sprawdzane przy ich K3.

Kolejność scalania do `atlas-uklady`: układy po K3 (każdy po audycie), w `plates/index.ts` i `ScientificReferences.ts` zachować wszystkie wpisy (uwaga: `marliss_vranic_2002` u hormonalnego i pokarmowego – jedno ID).
Integracja 1b cz. 1 (integrator): `rest_level`, ukrycie przełącznika przy `card: true`, strzałka `repro`, mózg na świetle biblioteki, brief powłokowego, kadr oddechowego, statusy faktów po sprawdzeniu.
Decyzja użytkownika potrzebna: wdrożenie planu Reżysera (rekomendacja Dyrygenta: po 12 planszach).

## Plan końcowy (polecenie użytkownika przez koordynatora, 2026-11-26)
1. K3 hormonalnego → scalenie do `atlas-uklady`.
2. Zaraz potem wiadomość do Wizualizatora 3D: w `atlas-uklady` jest 12 plansz (doszły limfatyczna, hormonalna, dokończenie 1b) – `git merge atlas-uklady` u siebie.
3. Bez czekania na użytkownika: integracja 1b cz. 2 (przegląd spójności 12 plansz; integrator, w toku od scalenia limfatycznego) → końcowe sprawdzenie wszystkich `draft` → zgromadzenie (statut §6; materiał: plan Reżysera, propozycje Wizualizatora) → decyzja końcowa i `RAPORT_KONCOWY.md`.
Decyzja Dyrygenta: sceny zbliżeń oddechowego, moczowego i powłokowego poza ramą ciała (x = 20–30 m) – nie przerabiamy w 2D (nie wpływa na plansze), opis w raporcie końcowym jako zadanie dla E3.

## Wstrzymanie (polecenie użytkownika, 2026-11-26 wieczorem)
- Prace kończą się na przeglądzie spójności (integracja 1b cz. 2, integrator w toku). Po jego audycie i scaleniu – STOP.
- Końcowe sprawdzenie faktów było już uruchomione (3 agenci: A powłokowy, B hormonalny+moczowy+pokarmowy, C reszta + kontrola wyrywkowa 10%) i zostało **zatrzymane** zgodnie z poleceniem; ich pliki `fakty_koncowe_*.md` mogą nie istnieć lub być niepełne – jutro uruchomić od nowa.
- Listę faktów `draft` generuje: `node scripts/atlas_check_facts.mjs --drafts <plik.md>` (stan przed przeglądem spójności: 74 – powłokowy 31, hormonalny 11, moczowy 10, pokarmowy 8, kostny 4, limfatyczny 4, oddechowy 2, mięśniowy/mózg/nerwowy/rozrodczy po 1).

## Wznowienie 2026-11-26, 10:50
- Integrator: część 2 w toku (na gałęzi `8a116f7`, `a9882fd`, `4ed417f`, `0b54162`); poproszony o dokończenie i raport `PUNKT KONTROLNY 1b cz. 2`.
- Końcowe sprawdzenie faktów uruchomione od nowa (lista: `docs/atlas_audyt/robocze/drafts_final.md`, 74 pozycje): A powłokowy → `fakty_koncowe_A_powlokowy.md`; B hormonalny+moczowy+pokarmowy → `fakty_koncowe_B_horm_mocz_pokarm.md`; C reszta + kontrola wyrywkowa 10% → `fakty_koncowe_C_reszta_i_kontrola.md`.
- Dalej: integrator nadaje statusy wg A/B/C → scalenie → zgromadzenie (materiał: `docs/ATLAS_REZYSER_PLAN.md`, P1 Wizualizatora `ba239ff`, P2/P3 jeśli gotowe) → `RAPORT_KONCOWY.md`.

## Stan 2026-11-26 przed zgromadzeniem
- Integracja 1b cz. 2 przyjęta i scalona (`5fa3f3e`), audyt `integrator_1b_czesc2.md`.
- Końcowe sprawdzenie faktów: A (powłokowy 5/21/0/5), B (horm+mocz+pokarm 14/8/7/0), C (reszta 12 checked, 2 disputed; kontrola wyrywkowa 25/25 zgodnych) – zatwierdzone (`cf85db4`).
- Integrator: nadaje statusy wg A/B/C i wprowadza poprawki; reguła ostatniej rundy – brzmienie dosłownie od sprawdzającego (z jego cytatem) = `checked_agent`, własne = `draft` (ukryte, bez kolejnej rundy).
- Następnie: zgromadzenie (5 ról, statut §6) → decyzja końcowa → `RAPORT_KONCOWY.md`.

## 100% osiągnięte (statut §6) – zgromadzenie w toku
- Fakty końcowe scalone (`cce0f36`, `157171c`, `48fd880`): `check:atlas` – 71 liczb, 165 opisów ról (+162 budowy), 21 podsumowań, **0 `draft`**; build 0; 24 zrzuty 12 plansz bez błędów konsoli (kopie: `side-session-notes/.../dyrygent/zrzuty_koncowe/`).
- Zgromadzenie, runda 1 (5 podagentów): anatom, architekt 3D, dydaktyk, strażnik faktów, dostępność i licencje → `docs/atlas_audyt/zgromadzenie/*_runda1.md`. Potem runda 2 (wzajemna krytyka), decyzja końcowa, `RAPORT_KONCOWY.md`.

## Zgromadzenie zakończone (2026-11-26)
- 10 werdyktów (5 ról × 2 rundy) + `zgromadzenie/DECYZJA_KONCOWA.md` (`9916381`): **przyjęty z jedną ostatnią rundą poprawek** (A treść, B dostępność, C licencje, D bramka faktów).
- W toku: integrator – runda końcowa → `PUNKT KONTROLNY runda końcowa`.
- Potem: niezależna kontrola (nowe brzmienia `draft`, 9 pozycji reguły ostatniej rundy, ≥ 10% ról i podsumowań na układ, dopasowanie opisu do struktury) → integrator nadaje statusy → scalenie → `RAPORT_KONCOWY.md`.

## ZAKOŃCZONE (2026-11-26)
- Kontrola końcowa (`0d3e895`) i statusy wg niej scalone; walidator naprawiony. Stan: 71 liczb, 164 opisy ról, 162 budowy, 21 podsumowań, 0 `draft`; build i `check:atlas` 0; 24 zrzuty bez błędów.
- `RAPORT_KONCOWY.md` zatwierdzony. Prace Dyrygenta zakończone; bez push.

## Decyzja użytkownika 2026-11-26: fakty podręcznikowe – „Tak, dopuść”
- Zapisana w `docs/ATLAS_MODEL_ARCHITEKTONICZNY.md` §3.6 pkt 9 i §7 (przez koordynatora).
- Zasady: podręcznik z ISBN lub stałym identyfikatorem (OpenStax, StatPearls/NCBI Bookshelf), wydanie i strona/sekcja; dosłowny cytat + drugi niezależny sprawdzający; w danych `textbook_consensus`, na ekranie „Wiedza podręcznikowa”; głównie wartości spoczynkowe, budowa i role struktur – dla zmian w sprincie pierwszeństwo mają badania.
- Następny etap (wzbogacenie mózgu i wartości spoczynkowych razem z E1) – czeka na zgodę użytkownika; Dyrygent nie zaczyna prac.

## Etap E1 + fakty podręcznikowe (start 2026-11-26, zgoda użytkownika „Tak, ruszaj”)
- Integrator (`local_172431d6…`): K1 dane i schemat (bez zmiany wyglądu), K2 przepięcie plansz + walidator (spójność między planszami, `anatomy` bez zmian, `textbook_consensus`), K3 wpisanie faktów podręcznikowych sprawdzonych przez niezależnego agenta.
- Najpierw integrator zapisuje listę luk: `docs/atlas_audyt/robocze/luki_spoczynku.md`.
- Dyrygent: podagent wyszukujący (fakty podręcznikowe: role mózgu, wartości spoczynkowe) → osobny podagent sprawdzający → lista dla integratora (K3).
- Na koniec `docs/atlas_audyt/RAPORT_E1.md`.

## Zmiana priorytetu (użytkownik): najpierw 3D
- **E1-K3 (fakty podręcznikowe) wstrzymane.** Dwóch wyszukujących zatrzymano przed zapisaniem wyników (brak częściowych plików). Lista luk: `side-session-notes/.../dyrygent/luki_spoczynku.md` (kopia z gałęzi integratora, commit `7441665`). Wrócimy po obejrzeniu 3D przez użytkownika.
- Integrator kończy E1-K1 i K2 (dane, przepięcie, walidator) + **punkt montażu 3D w `AtlasApp`** (lazy `src/atlas3d/Atlas3DView`, props `system/state/level/onClose`, przycisk „Obróć w 3D” tylko desktop i przy `public/atlas3d/<uklad>/manifest.json`).
- **E3 = P1 „Gablota”**: Wizualizator 3D (`local_dc5e6e98…`, uruchamia koordynator), pliki `src/atlas3d/**`, `blender/atlas/atlas_export_glb.py`, `public/atlas3d/**`; K1 eksport GLB krwionośny+mięśniowy i budżet, K2 widok, K3 integracja. Audyty Dyrygenta.

## WSTRZYMANIE (użytkownik wyłącza komputer, 2026-11-26)
**Stan:**
- `atlas-uklady`: 12 plansz przyjętych (RAPORT_KONCOWY.md); E1-K1 i E1-K2 integratora scalone (dane L1, fakty tylko w `facts/*.json`, punkt montażu 3D); rundy siatek 1 i 2 scalone (106 rozwiązanych, 70 `nearest` do kontroli, 12 bez siatki; licencje z pola `origin`, 0 NC).
- E3 (3D „Gablota”, Wizualizator `local_dc5e6e98…`): K1 zaliczony i scalony (`f5f82fb`); **K2 zaliczony warunkowo** (audyt `wizualizator_E3_K2.md`), kod K2 (`8168026`, `3d55db7`) **jeszcze NIE scalony** do `atlas-uklady`; K3 był w toku – Wizualizator zapisuje commit WIP na swojej gałęzi `claude/atlas-wizualizacja-3d-1dc29a`.
- E1-K3 (fakty podręcznikowe) – wstrzymane decyzją użytkownika (najpierw obejrzeć 3D). Lista luk: `side-session-notes/.../dyrygent/luki_spoczynku.md`.

**Po wznowieniu (kolejność):**
1. Wizualizator kończy E3-K3: czytelność podpisów na modelu (tło/kolumny, kontrast ≥ 4,5:1), kadr pod paskiem i stopką (oddechowy), ew. wydajność moczowego (25 FPS) i oddechowego (29 FPS), integracja przez punkt montażu, zrzuty 12 układów, build, `check:atlas`, `check:atlas3d` → `PUNKT KONTROLNY E3-K3`.
2. Dyrygent: audyt K3, scalenie gałęzi Wizualizatora do `atlas-uklady`, `RAPORT_E1.md` (E1 + E3) dla użytkownika z instrukcją: `npm run atlas:export3d` (raz, ok. 15 min) i `npm run dev` → `#atlas` → „Obróć w 3D”.
3. Użytkownik ogląda 3D i decyduje o E1-K3 (fakty podręcznikowe) i dalszych etapach. Opcjonalnie: pomiar FPS na RTX wymaga zmiany ustawień grafiki Windows przez użytkownika.

## E3 ZAKOŃCZONE (2026-11-26, po wznowieniu)
- E3-K2 i K3 Wizualizatora zaliczone, gałąź scalona do `atlas-uklady` (`a289337`); audyt `wizualizator_E3_K3.md`.
- 3D „Gablota” działa dla 12 układów: `npm run dev` → `#atlas/<układ>` → „Obróć w 3D” (desktop). GLB lokalnie w `public/atlas3d` (poza Gitem; na nowej kopii: `npm run atlas:export3d`).
- Czeka na decyzję użytkownika: E1-K3 (fakty podręcznikowe), E2′ (przewodnik „Jeden interwał”), E4/P2 („Scena Całość”), test z licealistami, pomiar na RTX (ustawienia grafiki Windows), kontrola 70 kotwic `nearest`.

## Nowe decyzje użytkownika (2026-11-26, po obejrzeniu 3D) – etap planów, BEZ KODU
- (a) Atlas służy **przede wszystkim nauce licealistów**; HIIT zostaje jako przykład do nauki.
- (b) **Gabloty pojedynczych narządów:** serce, wątroba, mózg, nerka. Każda ma interaktywne 3D (obrót, najechanie na strukturę), omówienie budowy i filmową animację działania.
- (c) **Posiedzenie UI/UX całego atlasu** (widoczność i zrozumienie): wspólny sznyt, a każdy układ z czymś wyróżniającym.
- Zapisane w `docs/ATLAS_MODEL_ARCHITEKTONICZNY.md` §7.

| Zlecenie | Sesja | Wynik |
|---|---|---|
| Reżyser: posiedzenie UI/UX + karta stylu 12 układów | `local_0e06d3c8-a948-4de9-b211-ddf665a1cee7` | `docs/atlas_rezyser/UX_POSIEDZENIE.md` |
| Wizualizator: plan gablot 4 narządów z animacjami | `local_dc5e6e98-3d75-4195-b564-6b8a39eb661f` | `docs/atlas_wizualizacja/NARZADY_PLAN.md` |

- Dyrygent pilnuje, żeby obaj szli równolegle, i rozstrzyga ich spory (zapis: `side-session-notes/.../dyrygent/spory_UX_narzady.md`).
- Dyrygent ocenia: biologia liceum, zrozumiałość, ≥ 50 FPS Intel UHD, licencje bez NC, realny czas.
- Wynik oceny: `docs/atlas_audyt/DECYZJA_UX_NARZADY.md` (kolejność wdrożenia, godziny pracy agentów, pytania do użytkownika).
- **Wdrożenie dopiero po zgodzie użytkownika.**
- **Plany gotowe i ocenione (2026-11-26):** Reżyser `77dd298` (na `atlas-uklady`), Wizualizator `bd9650c` (jego gałąź, nie scalona; poprawki poziomów treści zlecone). Decyzja: `docs/atlas_audyt/DECYZJA_UX_NARZADY.md`, kolejność F1 → F2 → F3 → bramka (pokaz + test z licealistami) → F4, ok. 155–210 h agentów, 0 zł. Luka K4 (`protocolNotePl` niesprawdzone na 3 planszach) potwierdzona. **Czeka na zgodę użytkownika (7 pytań w §5 decyzji).**

## Nowe wymagania użytkownika (2026-11-26, później) – decyzja `4ec67df` ZAWIESZONA
- (d) Jakość animacji na poziomie filmu: cząstki i krwinki 3D, odkształcanie geometrii, światło i materiał filmowe; poziomy jakości zamiast obniżania poprzeczki. Przed kodem: **klatki docelowe** Reżysera i **test techniczny ujęcia serca** Wizualizatora z pomiarem FPS.
- (e) Wspólny moduł z filmem „12 aktów” (`src/director`, `src/scenes/Act*`): najpierw przegląd filmu; każdy element ma przypisany akt filmu.
- (f) Kamienie milowe z wynikiem do obejrzenia zamiast godzin; po pierwszym kamieniu przeliczenie reszty; jawna niepewność.
- (g) Gabloty: wejście diegetyczne (kamera wjeżdża w narząd, ciało gaśnie, podmiana modelu ukryta w ruchu); zastawki A (B wcześniej, jeśli tanie); nefron jako schemat „bez skali”; v1 tylko poziom Podstawowy.
- Zapis: §7 modelu (d)–(g). Kolejny krok: poprawione plany obu agentów, potem nowa decyzja Dyrygenta.
- **Decyzja wersja 2** (`DECYZJA_UX_NARZADY.md`): kamienie milowe M1 Poprzeczka (Reżyser) → M2 Test serca (Wizualizator, `prototypes/**`) → M2′ przeliczenie → BRAMKA A (użytkownik) → M3 czytelność (może iść równolegle) → M4 wspólny moduł z filmem (akt 3 bez regresji) → M5 serce wzorcowe z wejściem diegetycznym → M6 rama + 4 wyróżniki 3D → BRAMKA B (test z licealistami) → M7 reszta atlasu i akty filmu → M8 nerka, wątroba, mózg. Spór 1 rozstrzygnięty (w filmie każdy krok najwyżej 1 nowy ruch). Zgoda Dyrygenta na pobranie Allen v1.3+ (CC BY) z oficjalnego repozytorium. Do użytkownika zostają pytania 1–4.
- Reżyser `31d7eb7` i Wizualizator `efb73c0`: wersje pośrednie (odpowiedź na kryteria sprzed (d)–(g)); oczekiwane PLAN 2 obu oraz M1 (klatki docelowe) i M2 (test serca). Pytania Reżysera rozstrzygnięte przez Dyrygenta:
  - łacina tylko na poziomie Rozszerzonym w nawiasie;
  - wyniki „Sprawdź się” tylko w przeglądarce;
  - brak osobnego trybu „sama budowa”: domyślnie Spoczynek z celem lekcji o budowie.

  Odkrycie P2 (podpisy bez sprawdzonego opisu: mózg 21, mięśniowy 19, nerwowy 14, oddechowy 8, powłokowy 4) wzmacnia argument za wznowieniem faktów podręcznikowych.
- **PLAN 2 obu przyjęty** (Reżyser `8c20b84`, Wizualizator `c640d7e`). **M1 zaliczony**: klatki docelowe w `docs/atlas_rezyser/klatki_docelowe/` (czas rzeczywisty 1,5–2 h wobec szacunku 4–8 h). Następny kamień M2 (test serca) czeka na zgodę użytkownika (pytanie 1 decyzji). Spór 2 (schemat jako bryła) rozstrzygnięty.
- **2026-11-26: zgoda użytkownika na M2 i M3.**
  - M2: Wizualizator, test serca w `prototypes/**`, szacunek 6–12 h.
  - M3: integrator, U0 według `UX_POSIEDZENIE.md` §2. Nowe teksty mają status `draft` do czasu niezależnego sprawdzenia przez Dyrygenta.
- **M2 ZALICZONY** (`wizualizator_M2.md`). Low 91 FPS na UHD (widoczne okno; pomiar Dyrygenta headless potwierdza względnie). Zastawki B od razu. High tylko dla RTX (niezmierzone). Warunek M4: ΔE00 profilu film ≤ 10. Czas rzeczywisty ok. 25 min wobec szacunku 6–12 h. Gałąź Wizualizatora (tylko docs i prototypy) scalona.
- Barwa ścian serca („mięsień” czy „krew”) trafia na bramkę A jako porównanie.
- S9/S10 (Wizualizator, `e899bd1`) scalone (`d234200`): bez pulsu sin(uTime), jedno sterowanie w 3D. Build 0, check:atlas 0, check:atlas3d 0. Integrator przed oddaniem M3 robi `git merge atlas-uklady`.
- **M3 ZALICZONY** (`integrator_M3.md`; scalenia `b38bb87`, `cf6f1ef`, `9995df9`): 63 nowe teksty po dwóch niezależnych kontrolach i trzeciej kontroli Dyrygenta, wszystkie `checked_agent`; 0 tekstów roboczych na ekranie; walidatory odporne na CRLF. Czas rzeczywisty ok. 0,8 h wobec szacunku 4–7 h.
- **M2′** w decyzji (`e2cf373`). **BRAMKA A gotowa do pokazu.**
- **BRAMKA A: zgoda użytkownika na M4–M6.** Podział: Wizualizator M4 → M5; integrator rama M6 + kontrakt wyróżnika + punkt wejścia gabloty; Reżyser scenariusz serca i specyfikacje 4 wyróżników; agenci krwionośny, kostny, nerwowy, powłokowy wyróżniki po M4 (decyzja: tabela „Po bramce A”).
- **E1-K3 wznowione** (zgoda użytkownika „Tak, wznów”): partia 1 serce (M5), partia 2: 66 podpisów (`dyrygent/E1K3_luki_podpisow.md`), partia 3: narządy M8. Wyszukujący i sprawdzający to podagenci Dyrygenta; wpis do `facts/*.json` robi integrator osobnym commitem.
- **(k) Bez danych FreeSurfer** w atlasie (decyzja użytkownika po przeglądzie AtlasClaude). Ryzyko: pochodzenie mózgu Brainder w Z-Anatomy, sprawdza podagent Dyrygenta. Koncepcje z AtlasClaude (fala impulsu, kamera za impulsem, przekrój GPU) dla Wizualizatora i agenta nerwowego; fakt „pole nóg kory ruchowej po przyśrodkowej stronie półkuli” trafia do partii 3 E1-K3.
- **M4 ZALICZONY i scalony** (`d0be24c`, audyt `wizualizator_M4.md`): `src/biomotion`, akt 3 i 12 bez regresji, naprawy filmu, AgX na Medium+ za przełącznikiem (domyślnie wyłączony). Wizualizator robi M5. Następni: agenci krwionośny, kostny, nerwowy, powłokowy (wyróżniki M6).
- **Mózg Brainder:** kora Z-Anatomy to „Brain for Blender” (A. M. Winkler, CC BY-SA 3.0), wygenerowana w FreeSurfer 5.2.0 z MRI jednej osoby, nie z fsaverage (`dyrygent/mozg_brainder_licencja.md`). Brak atrybucji Winklera w manifeście 3D, do uzupełnienia. Czy decyzja (k) obejmuje siatki zrobione programem FreeSurfer: pytanie do użytkownika.
- **(l) Użytek komercyjny w szkołach** (wymóg użytkownika): tylko licencje dopuszczające komercję. Cytaty ze źródeł NC-ND (StatPearls) i zastrzeżonych (Clinical Methods) poza danymi produktu. Audyt licencji prowadzi koordynator.
- **(k′) Mózg Brainder zostaje** (decyzja użytkownika „A, zostaw”); pełna atrybucja Winklera wszędzie. Wykonują Wizualizator (stopka 3D, manifest, eksport) i integrator (plansza mózgu, ekran licencji, ATLAS_ASSETS, LICENSES_AND_ASSETS).
- **Audyt komercyjny** zapisany (`AUDYT_KOMERCYJNY.md`); kamień **ML** w decyzji (po M5). Blokujące, czekają na decyzję użytkownika: mózg filmu (Allen v1.2) i lektor (Edge TTS). Wstrzymane automatyczne pobieranie OpenStax przez agentów.
