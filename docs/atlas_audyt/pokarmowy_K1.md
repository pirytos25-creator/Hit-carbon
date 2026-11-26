# Audyt Dyrygenta: pokarmowy, punkt kontrolny K1

Data: 2026-11-26. Sesja `local_dc0d456d-5b08-4b78-885d-fbb7b4512592`. Raport agenta: `side-session-notes/.../pokarmowy/pokarmowy_K1.md`.

## Werdykt: **K1 ZALICZONY, kontynuuj** (runda 1 z 3)

| # | Punkt | Wynik |
|---|---|---|
| 1 | Zakres plików | OK. Jeden nowy plik `plate_pokarmowy.py`; podglądy poza repo. |
| 2 | Anatomia | Przód: wyłącznie Z-Anatomy (żołądek, dwunastnica, jelito czcze i kręte jako krzywa, okrężnica, wątroba, pęcherzyk, drogi żółciowe, trzustka, przełyk, naczynia trzewne). Zbliżenie: wyłącznie HuBMAP (wątroba z naczyniami, drogi żółciowe, trzustka, dwunastnica) przez `align_hubmap`. Otwory w siatkach Z-Anatomy załatane w pamięci (śledziona prześwitywała). Obejrzałem `quick/front_rest_sprint.jpg` i `quick/detail_rest_sprint.jpg`: wątroba po prawej stronie ciała, pęcherzyk pod wątrobą, okrężnica wstępująca po prawej, ż. wrotna do wnęki wątroby. Brak NC. Kotwice sprawdzane promieniem z kamery; zasłonięte struktury usunięte z przodu – dobra praktyka. |
| 3 | Obraz | Różnica stanów czytelna: w sprincie przewód pokarmowy przygaszony, wątroba w pełnym kolorze. W zbliżeniu podpisy `d_bile_duct` i `d_portal` nachodzą na siebie. U góry kadru przodu za dużo pustej klatki. |
| 4 | Fakty (plan) | F1 Rowell 1964 (przepływ wątrobowy), F2 Marliss i Vranic 2002 (produkcja glukozy ×7–8 w intensywnym wysiłku), F3 Marliss 1992 (glukoza 4 min po), F4 Brooks 2020 (los mleczanu). Wszystkie z `protocolMismatch`. Pełne sprawdzenie w K2. |
| 5 | Testy | Build nie dotyczy K1; przebiegi Blendera kod 0. |

## Decyzje
1. **Jelita z Z-Anatomy zamiast HuBMAP** (odstępstwo od briefu) – zgoda: HuBMAP odchodzi o 2,6–4,1 cm i zasłania żołądek Z-Anatomy; jelito czcze i kręte są w jednej krzywej. HuBMAP tylko w zbliżeniu.
2. **Poziomy spoczynku** (przewód 75%, wątroba 60%, naczynia 55%; w sprincie przewód i naczynia przygaszone, wątroba 100% ze świeceniem) – zgoda jako udokumentowany wyjątek od księgi §2, ten sam typ co plansza moczowa (układ, który w sprincie „gaśnie”). Zasadę „plansz odwróconych” integrator dopisze do księgi stylu w integracji 1b; obsługę `rest_level` w `Plate` zgłaszam do 1b.
3. **K2:** obniżyć kadr przodu (mniej pustej klatki); rozdzielić podpisy dróg żółciowych i ż. wrotnej w zbliżeniu; w podsumowaniu wprost: „w sprincie trawienie zwalnia, bo jelita dostają mniej krwi; wątroba pracuje pełną parą” (z faktami).
4. Błąd `vessel_path` (zły koniec aorty) – zgłoszony do integratora.
