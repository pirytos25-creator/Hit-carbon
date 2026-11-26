# Zgromadzenie agentów: decyzja końcowa Dyrygenta (CEO)

Data: 2026-11-26. Podstawa: statut §6. Materiał: 10 werdyktów (5 ról × 2 rundy) w tym folderze, raporty i audyty w `docs/atlas_audyt/`, plan Reżysera (`docs/ATLAS_REZYSER_PLAN.md`), propozycje 3D Wizualizatora (gałąź `claude/atlas-wizualizacja-3d-1dc29a`, `docs/atlas_wizualizacja/PROPOZYCJE_3D.md`).

## Decyzja

**Atlas 12 plansz: PRZYJĘTY Z JEDNĄ OSTATNIĄ RUNDĄ POPRAWEK** (statut §6: najwyżej jedna dodatkowa runda). Żadna rola nie zgłosiła błędu krytycznego; wszystkie pięć zgodnie wskazało te same poprawki „must-have”. Po rundzie: niezależna kontrola zmienionych tekstów, potem przyjęcie i raport końcowy.

## Runda poprawek (integrator, jedna runda)

### A. Treść niezgodna z anatomią lub sprzeczna (zgoda 5/5)
1. **Nerwowy:** rozdzielić strzałkę współczulną (start w odcinku piersiowym, ok. Th5–Th12) i ruchową nerwu udowego (L2–L4, splot lędźwiowy, z dala od nadnercza); zapis w `flows3d.json`, przebieg `ATLAS_ANCHORS_ONLY=1` (slot). Pinezka kory ruchowej z tyłu na lewej półkuli.
2. **Mózg:** strzałka krwi wchodzi przez t. szyjną wewnętrzną (albo podpis „schemat”); usunąć sprzeczność „mniej/więcej glukozy” – liczby PET i CMR tylko w poziomie Rozszerzonym.
3. **Spójność liczb między planszami:** pokarmowy – „7–8×” usunąć z podsumowania Podstawowego (zostaje „przy ok. 87% VO₂max 4–6 razy”); nerwowy – przy adrenalinie odsyłacz do planszy hormonalnej (ponad 12× przy 87% VO₂max); rozrodczy – liczba ES do poziomu `student`.
4. **Opis przy złej strukturze lub stanie:** krwionośny – pompa mięśniowa nie na ż. odpiszczelowej (żyła powierzchowna): opis anatomiczny albo przeniesienie na żyły głębokie; powłokowy – rola naczyń skóry w spoczynku (dziś „Węższe” = opis startu wysiłku); moczowy – „najpierw bufory w mięśniach i we krwi”.
5. **Uczciwość dowodu:** deltoid – „symulacja komputerowa (1 biegacz)”; powłokowy 30–50% – dopisek, że w badaniu Kenny 2008 było 53% po 60 min.
6. **Skala czasu:** `protocolNotePl` hormonalny i pokarmowy – „liczby z późniejszych interwałów (po kilku minutach sesji)”.
7. **Jedno zdanie definicji VO₂max** w poziomie Podstawowym (ze źródłem).
8. Dopiski „W badaniu: …” w Podstawowym skrócić (zachowując, czym badanie różni się od wzorca); pełny opis w Rozszerzonym. Rozwinąć skróty w Podstawowym (T., Ż., m., LAD, ACTH, IIx).

**Reguła:** każde nowe brzmienie dostaje `draft` i pokazuje się dopiero po niezależnym sprawdzeniu (pkt D). Usunięcie tekstu lub przeniesienie do Rozszerzonego nie wymaga sprawdzenia.

### B. Dostępność (zgoda 4/5)
1. Kontrast tekstu na kolorze układu ≥ 4,5:1 (przycisk „Sprint”, numery pinezek; moczowy 2,97:1) – kolor tekstu dobrany per układ + test w walidatorze palety.
2. **Legenda strzałek** (podpis `labelPl`) i różny wzór kreski dla każdego rodzaju; kolory przepływów przenieść do `palette.json`; walidator ΔE także dla jasnych wariantów par pokazywanych w jednym widoku (powłokowy 12,3; moczowy 14,4/14,5; pokarmowy 13,1).
3. Tekst szary `slate-500` → `slate-400` (w tym napis „Sprawdzone przez agenta AI…”); stopka i menu ≥ 14 px; poprawić składnię komunikatu „1 liczba czeka … nie są pokazywane”.
4. Klawiatura i telefon: spacja nie przełącza stanu, skrót S tylko z fokusem na planszy; link „← Podróż filmowa” widoczny na telefonie; przełącznik stanu dostępny bez przewijania 2000–3000 px (przyklejony).

### C. Licencje (dokumenty)
Pęcherz żeński HRA (CC BY 4.0) w `docs/ATLAS_ASSETS.md` §2 i `docs/LICENSES_AND_ASSETS.md` §6; w stopce odnośniki do licencji i informacja o zmianach w modelach; „NIH Visible Human / Indiana University” przy HuBMAP; sprawdzić i dopisać autorów modeli dołączonych do Z-Anatomy dla mózgu i nerwów, jeśli dotyczy.

### D. Bramka faktów
1. Walidator: liczba z faktu występuje w cytacie albo ma `conversionNote`; `restStatus` liczony i wymagany; `protocolNotePl` ma status i przechodzi przez bramkę.
2. **Niezależna kontrola po rundzie** (agent spoza sprawdzających A, B, C): wszystkie nowe brzmienia z pkt A; wszystkie 9 pozycji przyjętych regułą ostatniej rundy; losowo ≥ 10% opisów ról i podsumowań każdego układu – z pytaniem, czy opis pasuje do podpisanej struktury. To przywraca pełną zgodność z §3.6 (dwóch niezależnych agentów).

## Odłożone na następne etapy (nie blokują przyjęcia)
- **Ścieżka faktów podręcznikowych** (`textbook_consensus` ze statusem `checked_agent`, cytat z rozdziałem i stroną, fraza „Wiedza podręcznikowa”) – dla wartości spoczynkowych i ról mózgu. Zgoda strażnika, anatoma i architekta; **nie** przez status `anatomy`. Uznanie podręcznika z ISBN za identyfikator zmienia regułę §3.6 pkt 2 (decyzja użytkownika) – rekomendacja dla użytkownika.
- **E1:** `structures.json`, `mesh_bindings.json`, `facts/*.json` (jeden rekord na każdy fakt na ekranie, także role, z `accessMode`), walidator „`anatomy` bez twierdzeń o zmianie”, kontrola spójności liczb między planszami.
- **E3-0 (kontrakt 3D):** znacznik ramy scen zbliżeń i ich torów, `bindings.json` z `Plate.render`, test NC i licencji na GLB w Node, oddechowy na `flows3d` w metrach.
- **E3 = P1 „Gablota”** (zgodna z §7, w budżecie); pomiar także na zintegrowanej karcie i GPU.
- **E2′ / E4:** przewodnik „Jeden interwał” 2D (R1 Reżysera) niezależnie od E3; P2 „Scena Całość” dopiero po `chains.json` z `factIds` i spełnieniu budżetu.
- **P3 „Pełna przestrzeń”: odrzucona w całości**, łącznie z suwakiem krycia i wyborem dowolnej struktury (decyzja użytkownika §7 wprost je wyklucza).
- Tętnica nerkowa za ż. główną dolną (głębokość) – w 3D.
