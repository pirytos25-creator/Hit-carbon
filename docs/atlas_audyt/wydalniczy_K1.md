# Audyt Dyrygenta: wydalniczy (moczowy), punkt kontrolny K1

Data: 2026-11-25. Sesja `local_37e1ca28-e80a-4465-a772-f7cebfdf8e93`. Raport agenta: `side-session-notes/.../wydalniczy/wydalniczy_K1.md`.

## Werdykt: **K1 ZALICZONY, kontynuuj** (runda 1 z 3), z warunkami na K2

| # | Punkt | Wynik |
|---|---|---|
| 1 | Zakres plików | OK. Jeden nowy plik `blender/atlas/plate_wydalniczy.py`. |
| 2 | Anatomia i licencja | Nerki, miedniczki, moczowody, naczynia nerkowe z HuBMAP (CC BY); pęcherz, cewka, nadnercza, aorta, ż. główna dolna z Z-Anatomy (CC BY-SA). Krzywe moczowodów Z-Anatomy odrzucone (kończą się w miedniczce NC) – słusznie. Obejrzałem `fit/fit_check.png` (przód, bok, tył): nerki na wysokości Th12–L2 (lewa wyżej, nadnercza na biegunach), moczowody do pęcherza, aorta po lewej, ż. główna po prawej stronie ciała. Błąd dopasowania nerek 1,41 / 0,37 cm. |
| 3 | Obraz | `preview/kotwice.png`: 16 kotwic trafia (nerka, miedniczka, tętnica i żyła nerkowa, nadnercze, aorta, ż. główna dolna, moczowód, pęcherz, cewka; w zbliżeniu tętniczka doprowadzająca, kłębuszek, torebka, kanalik, pętla, cewka zbiorcza). Nefron (`detail_both.png`) czytelny jako schemat. |
| 4 | Fakty (plan) | 4 podstawowe + 6 dodatkowych, wszystkie `draft` z cytatami z abstraktów i `protocolMismatch`. Pełne sprawdzenie niezależnym agentem w K2. |
| 5 | Testy | Build nie dotyczy K1. |

## Decyzje
1. **Odwrócone stany nerki** (spoczynek pełniejszy, sprint przygaszony; w sprincie świecą nadnercza, aorta i cewka zbiorcza) – zgoda, to właśnie treść planszy. Legenda/podsumowanie musi to powiedzieć wprost („w sprincie nerka dostaje mniej krwi”), żeby przygaszenie nie wyglądało na błąd.
2. **Widok całego ciała:** tak. Zbliżenie jamy brzusznej i miednicy zostaje jako „Zbliżenie”, a dochodzi render całego ciała kamerą planszy mięśniowej (brief §2, warstwy „Całość”) jako „Całe ciało” (przełącznik już istnieje).
3. **Akwaporyny 6 → 26:** to ilustracja, nie liczba ze źródła; oznaczyć jako ilustrację. Wstawianie akwaporyn pod wpływem ADH trwa minuty, więc moment (`measuredAt`) i podpis mają mówić „po kilku minutach wysiłku / po serii”, nie „w 45 s”.
4. **Licencja:** pomiar położenia nerki Z-Anatomy (NC) wolno robić tylko w osobnym narzędziu kontrolnym poza repozytorium (folder notatek). `plate_wydalniczy.py` nie może omijać `NC_BLOCKLIST` ani wczytywać obiektów NC.
