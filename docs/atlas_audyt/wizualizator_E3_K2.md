# Audyt Dyrygenta: Wizualizator 3D, E3-K2 (Atlas3DView)

Data: 2026-11-26. Commity `8168026`, `3d55db7` (gałąź `claude/atlas-wizualizacja-3d-1dc29a`, po scaleniu `atlas-uklady` `0f06be8`).

## Werdykt: **E3-K2 ZALICZONY warunkowo** (runda 1 z 3) – poprawki czytelności w K3

| Punkt | Wynik |
|---|---|
| Kontrakt i decyzje §7 | Default export z `{system, state, level, onClose}`, leniwy fragment 9,4 kB gzip. Obrót tylko w poziomie z przyciąganiem do 4 widoków, zbliżenia jako gotowe ujęcia, bez wolnej orbity, suwaków i wyboru struktur. Karta (rozrodczy) bez przełącznika stanu. |
| Wierność 2D | Kolor i emisja z materiałów planszy (pień płucny niebieski – błąd z P1 poprawiony). Podpisy przez tę samą bramkę faktów co plansza (`isShown`, `tier`); z boku tylko struktury zwrócone do kamery. Zbliżenia-kolaże uczciwie opisane („część tylko na planszy 2D”). |
| Licencje | Błąd wykryty przez integratora (45 struktur HuBMAP z własnego importu oddechowego w pliku BY-SA) naprawiony u źródła; walidator rozszerzony (selftest 6/6). GLB poza Gitem – błąd nie wyszedł poza dysk. |
| Dostępność | `prefers-reduced-motion` (cięcia zamiast animacji), klawiatura (← → 1–4 S Esc), fokus, `role=application`, komunikat przy braku GLB. Niezależny przegląd kodu: 0 krytycznych, 8 poprawek wprowadzonych. |
| Wydajność (Intel UHD, 1440×900) | 12/12 otwiera się bez błędów; FPS: kostny 69 … krwionośny 48, mięśniowy 43, oddechowy 29, moczowy 25. RTX 4050 niezmierzony (wymaga zmiany ustawień grafiki Windows – decyzja użytkownika). |
| Testy Dyrygenta | W worktree: build 0, `check:atlas3d` 0 (12 układów, 0 NC), `check:atlas` 0. Obejrzane zrzuty: krwionośny przód i bok (sprint), mięśniowy zbliżenie, oddechowy (sprint). |

## Poprawki obowiązkowe w K3
1. **Czytelność podpisów na modelu:** tekst podpisu nie może leżeć bezpośrednio na geometrii (oddechowy: „Płuco prawe”, „Przepona” na żebrach i przeponie; mięśniowy zbliżenie: „Mięsień obszerny boczny” pomarańczowym na pomarańczowym). Kolumny podpisów poza obrysem modelu (jak w 2D) albo tło/obwódka tekstu z kontrastem ≥ 4,5:1.
2. **Kadr:** model nie może wchodzić pod pasek przełączników u góry ani pod stopkę licencji (oddechowy: czaszka pod paskiem, stopka na kręgosłupie). Margines kadru albo przesunięcie ujęcia.
3. Moczowy (25 FPS) i oddechowy (29 FPS): jeśli tanio – ograniczenie liczby wywołań/trójkątów; jeśli nie – opis w raporcie.
4. K3 jak w planie: integracja przez punkt montażu, zrzuty 1440 i telefon (przycisk ukryty), build, `check:atlas`, `check:atlas3d`.
