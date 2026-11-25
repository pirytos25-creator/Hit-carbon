# Audyt Dyrygenta: kostny, punkt kontrolny K1

Data: 2026-11-25. Sesja `local_e40f4943-860f-4eee-9aaf-2615cee60e38`, worktree z gałęzi integratora. Raport agenta: `side-session-notes/.../kostny/kostny_K1.md`.

## Werdykt: **K1 ZALICZONY, kontynuuj** (runda 1 z 3)

| # | Punkt | Wynik |
|---|---|---|
| 1 | Zakres plików | OK. Jedyna zmiana: nowy `blender/atlas/plate_kostny.py`. Wspólny kod nietknięty. |
| 2 | Anatomia | Tylko Z-Anatomy (szkielet, chrząstki stawowe i krążki z `3: Joints`), bez HuBMAP, więc bez dopasowania. Kamera jak mięśniowy. Obejrzałem `preview/states_sheet.png` i `overlay_sprint.png`: 13 kotwic leży na swoich kościach, strony ciała poprawne (strzałkowa po bocznej stronie prawej nogi), tor siły od podeszwy przez piszczel i udo do kości krzyżowej. |
| 3 | Obraz | Różnica stanów słaba, bo obecny `#B9A37E` jest bliski kości kontekstowej. Czeka na `palette.json` integratora (K3). Ilustracja „drogi obciążenia” w 3 stopniach jest uzasadniona. |
| 4 | Fakty (plan) | F1 i F2 z Munro 1987 (PMID 3571295): mężczyźni ok. 25 lat, rekreacyjni biegacze, 3–5 m/s – najbliżej protokołu wzorcowego ze wszystkich planów. Pełne sprawdzenie niezależnym agentem w K2. |
| 5 | Testy | Build nie dotyczy K1. |

## Decyzje do pytań agenta
1. Kolor: czekać na `palette.json`; rendery końcowe po scaleniu integratora.
2. Karta: zostaje różnica „droga obciążenia w sprincie” jako **ilustracja** (3 stopnie, oznaczona), bo niesie informację, które kości przenoszą siłę. Spoczynek: cały szkielet w przygaszonym kolorze układu.
3. Filtr stanu dla `flows3d` (`states?: AtlasState[]`): przekazane integratorowi. Do tego czasu agent zapisuje pole w danych.
4. Spoczynek dla F1: „—” (`anatomy`), bez liczby „1×”. Liczba na ekranie tylko z cytatem.
5. Zbliżenie w K2: przekrój czołowy prawdziwej siatki `Femur.r`, wnętrze jako schemat z podpisem „schemat”. Zgoda.
