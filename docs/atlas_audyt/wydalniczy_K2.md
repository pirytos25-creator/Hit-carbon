# Audyt Dyrygenta: wydalniczy (moczowy), punkt kontrolny K2

Data: 2026-11-25. Sesja `local_37e1ca28-e80a-4465-a772-f7cebfdf8e93`, worktree `.claude/worktrees/atlas-wydalniczy-d343d3`.

## Werdykt: **K2 ZALICZONY warunkowo** (runda 1 z 3): poprawki przed K3; sprawdzam je w audycie K3

| # | Punkt | Wynik |
|---|---|---|
| 1 | Zakres plików | OK: plansza, rendery, `index.ts` 2 linie, `ScientificReferences.ts` +136. |
| 2 | Anatomia i licencja | Warunki K1 spełnione. `plate_wydalniczy.py` nie wczytuje obiektów z `NC_BLOCKLIST` (sprawdziłem w kodzie); nerki i naczynia nerkowe z HuBMAP; pomiar NC tylko w narzędziu poza repo. Widok całego ciała (`body_front`) z kamerą jak mięśniowy/krwionośny, poza treścią planszy. |
| 3 | Obraz | `k2/kontrola_1440_sprint.jpg`: oba widoki obok siebie, nerka przygaszona celowo i tak opisana. Podpisy przy 1440 gęste – ocena po nakładce HTML w K3. |
| 4 | Fakty | Niezależny sprawdzający (`fakty_wydalniczy.md`): 52 pozycje – 27 `checked_agent`, 8 `disputed`, 6 `unverifiable`, 11 `anatomy`. Cytaty `quote` dosłowne, przeliczenia poprawne, metadane 11 źródeł zgodne. |
| 5 | Testy | Sam: `npm.cmd run build` w worktree agenta – kod 0. |

## Poprawki (przed K3)
1. **„Po treningu nerki sprzątają kwas”** (podtytuł, podsumowanie, notatka pH) – sprzeczne z literaturą: mleczan po wysiłku zużywają głównie mięśnie i wątroba; z moczem wydala się < 2% (McKelvie 1989, PMID 2750954; Poortmans 1994). Przeformułować: oddech wyrównuje kwasowość w minutach; nerki odpowiadają za długotrwałą równowagę kwasowo-zasadową (odtwarzanie wodorowęglanów, godziny), ale w usuwaniu mleczanu mają mały udział. Poprawić też podmiot zdania „Kwas z mięśni najpierw buforuje krew…”.
2. **Tętniczka doprowadzająca „węższa”** – bez źródła i w sprzeczności z rosnącą frakcją filtracyjną; opisać zgodnie ze źródłem (np. zwężenie naczyń nerkowych, w tym tętniczki odprowadzającej) albo usunąć.
3. **Kanalik: „Aldosteron zatrzymuje więcej soli” w sprincie** – zmienić: w sprincie mniej soli trafia do moczu głównie przez spadek filtracji; aldosteron rośnie i działa w dłuższej skali (minuty–godziny).
4. **Cewka zbiorcza (akwaporyny):** w opisie wprost „mechanizm poznany u zwierząt” (`animal_model` – pole w typie podpisu dodaje integrator); czas „minuty” tylko z cytatem albo jako „po serii”.
5. **Podsumowanie spoczynku:** `poortmans_1984` tych twierdzeń nie zawiera – podać właściwe źródło albo przeformułować.
6. **Kawakami 2024** – dodać do `referenceIds` albo usunąć z notatki; „nie jest chorobą” i „bez zmian w czasie serii” – źródło albo usunąć.
7. **`protocolMismatch`:** Kawakami 2018 – etapy po 4 min; Del Coso – 163% progu kompensacji oddechowej = wysiłek ponadmaksymalny.
8. **`poortmans_1985`:** dopisać DOI 10.1001/jama.1985.03350260088032.
9. **pH spoczynkowe 7,4:** `checked_agent` z cytatem Shaw 2022 („The normal blood pH is 7.35–7.45”).
10. Pozostałe punkty listy w `fakty_wydalniczy.md`. Statusy: potwierdzone → `checked_agent`; zmienione → `draft`.
