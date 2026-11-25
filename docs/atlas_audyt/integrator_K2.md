# Audyt Dyrygenta: Integrator, punkt kontrolny K2 (B: wspólny kod, C: krwionośny v2)

Data: 2026-11-25. Gałąź `claude/atlas-integrator-2ef0c7`, commit `b215139`.

## Werdykt: **K2 ZALICZONY, kontynuuj** (runda 1 z 3)

Kontrola wizualna kotwic krwionośnego v2 (`wizualna_K2_krwionosny.md`) biegnie równolegle. Jej poprawki, jeśli będą, trafią do zakresu K3.

## Lista kontrolna (statut §5)
| # | Punkt | Wynik |
|---|---|---|
| 1 | Zakres plików | OK. W K2: `atlas_lib.py`, 3 nowe narzędzia, `plate_krwionosny.py`, `public/atlas/krwionosny/**`, `src/atlas/**`, `index.css`, `scripts/atlas_check_projection.ts`. Wszystko w granicach integratora (model §5). |
| 2 | Anatomia i odwzorowanie | **Jedna transformacja HuBMAP** (skala 0,98636 + przesunięcie, 24 kręgi): błąd 1,56 cm średnio, 2,43 cm maks. Obejrzałem sam `align_check/align_front_side.jpg`: kręgi i miednica HuBMAP pokrywają się ze szkieletem Z-Anatomy w przodzie i z boku, płuca i serce w klatce, pęcherz w miednicy. Odrzucone warianty są zmierzone (lepsza metoda dla kręgów psuła narządy do 5,7 cm). Narządy żeńskie nie trafiają na szkielet męski (VH_F 7,4 cm od kręgów Z-Anatomy). Krwionośny v2: 650 krzywych Z-Anatomy zamiast rurek, kierunek strzałek z topologii drzewa naczyń. **Blokada NC**: test 8/8. |
| 3 | Obraz | Obejrzałem sam swoje zrzuty: krwionośny 1440 (sprint) i 390 (sprint), mięśniowy 1440 (sprint), nerwowy 1440 (sprint). Krwionośny v2: naczynia całego ciała, strzałki przerywane rysowane wzdłuż nogi i szyi, podpisy po stronie bliższej kotwicy, linie nie przecinają serca, tytuł pod obrazem. Mięśniowy: przełącznik „Całe ciało / Zbliżenie”, podpisy tyłu już nie nachodzą na zbliżenie. Światło: ΔE ≤ 2,6 dla 13 kolorów po zmianie (pomiar kulami). |
| 4 | Fakty | Treść liczb bez zmian (zgodnie z poleceniem). Schemat ma już `status`, `protocolMismatch`, `quote`, `locator`, `measuredAt`, `tier`, `referenceIds`. |
| 5 | Testy | Sam: `npm.cmd run build` kod 0 (AtlasApp 43,45 kB); `node scripts/atlas_check_projection.ts`: 16 kotwic, maks. 0,12 px (oddechowy pominięty, bo brak kamery w starym renderze). 20 zrzutów na porcie 5189: 0 błędów i wyjątków w konsoli. |
| 6 | Dydaktyka | Telefon: podpisy SVG 10–11 px (było 5–7) — nadal poniżej celu 14 px; właściwe rozwiązanie to nakładka HTML w D. |

## Decyzje Dyrygenta do otwartych problemów integratora (§6 jego raportu)
1. **Przerenderowanie 4 plansz** (nowe światło, `camera` w `anchors.json`) — tak, w E, zawsze najpierw `ATLAS_QUICK=1`. Zakres zgodny ze statutem §3 E.
2. **Oddechowy** przechodzi na `align_hubmap`; dowód renderem z nałożonym szkieletem, przesunięcie oskrzeli podać w cm.
3. **Naczynia wewnątrznerkowe** zostają zablokowane (ostrożność licencyjna, i tak nie są potrzebne na żadnej planszy).
4. Telefon → D.
5. Kotwice krwionośnego → kontrola wizualna Dyrygenta (w toku).
6. Serce Z-Anatomy w widoku całego ciała — akceptuję (szczegół daje zbliżenie).
7. Emisja w sprincie: według księgi stylu §2 tylko na strukturach, które naprawdę pracują (0,15–0,35); integrator ustala jedną regułę razem z `palette.json` w E0 i opisuje ją w księdze (F).
8. Filtr `checked_agent` → D.
9. Brief §0 i księga stylu → F.

## Decyzja o faktach (zakres K3)
- **Liczby i twierdzenia przyczynowe** pokazują się na ekranie tylko ze statusem `checked_agent`, w obu poziomach.
- **Nazwy anatomiczne** (polska i łacińska) nie są faktami w rozumieniu §3.6; nie wymagają cytatu.
- **Krótkie opisy funkcji w podpisach** (np. „Prostuje kolano”) muszą mieć `referenceIds` do sprawdzonego źródła albo zostać zastąpione opisem, który takie źródło ma. Opisy bez oparcia, wskazane w raportach `fakty_*.md` jako błędne lub mylące, trzeba poprawić lub usunąć.
- **Integrator** wprowadza poprawki z list „do poprawy” w `fakty_<uklad>.md`, dopisuje brakujące źródła i ustawia flagi `protocolMismatch`. Wartość z raportu sprawdzającego jest propozycją; integrator jako autor treści przyjmuje ją lub nie.
- **Każdy zmieniony fakt** przed scaleniem sprawdza nowy, niezależny agent (§3.6). Statusu `checked_agent` autor nie nadaje sam sobie.
