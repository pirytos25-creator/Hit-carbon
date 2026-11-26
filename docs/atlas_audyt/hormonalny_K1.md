# Audyt Dyrygenta: hormonalny, punkt kontrolny K1

Data: 2026-11-26. Sesja `local_ea8edc9b-cb7f-40ae-9ae2-81613e24be2c`. Raport agenta: `side-session-notes/.../hormonalny/hormonalny_K1.md`.

## Werdykt: **K1 ZALICZONY, kontynuuj** (runda 1 z 3), z obowiązkowymi zmianami kadru w K2

| # | Punkt | Wynik |
|---|---|---|
| 1 | Zakres plików | OK. Jeden nowy plik `plate_hormonalny.py`. |
| 2 | Anatomia | Gruczoły Z-Anatomy (nadnercza, przysadka, podwzgórze bez zabłąkanego wierzchołka, trzustka, tarczyca, przytarczyce, szyszynka, grasica); nerki HuBMAP (nerka Z-Anatomy NC tylko mierzona); trzustka Z-Anatomy, bo HuBMAP odchodzi o 3,2 cm. Nadnercza stykają się z nerkami (0,03–0,04 cm). Zbliżenie: nadnercze prawe na biegunie nerki, rdzeń jako schemat. |
| 3 | Obraz | Obejrzałem `K1/preview_kotwice.png`. **W ujęciu całego ciała gruczoły są za małe, a różnica stanów prawie niewidoczna** – teza planszy (oś mózg → nadnercza → krew) nie jest czytelna. Kotwice głowy (szyszynka, podwzgórze, przysadka) i brzucha (wątroba, ż. wrotna, trzustka, nadnercze) nachodzą na siebie; w zbliżeniu „rdzeń” nachodzi na „tętnicę”. |
| 4 | Fakty (plan) | 4 liczby z ciągłego wysiłku ok. 87% VO₂max (Sigal 1994/1996, Marliss i Vranic 2002) – blisko wzorca; GH (Stokes 2002, 30 s sprint) i kortyzol (Hill 2008) z `protocolMismatch`. Korekta briefu (insulina prawie bez zmian, glukagon umiarkowanie przy ~87%) – przyjęta. Pełne sprawdzenie w K2. |

## Decyzje (K2)
1. **Kadr:** widok `front` = tułów z głową (od czubka głowy do miednicy, `ortho_scale` ok. 1,0), żeby gruczoły były ok. 2× większe. Całe ciało wyrenderować osobno jako `body_front` (kamera planszy mięśniowej, poza treścią planszy – warstwy „Całość”), jak plansza moczowa. Trzeciego widoku „głowa” nie dodajemy.
2. **Kolor przygaszonych gruczołów:** mieszanie z tłem mięśni `#8E7A78` (cienkie tkanki), nie z kością – zgoda.
3. **Różnica stanów:** w sprincie wyraźnie: rdzeń nadnerczy, przysadka (poziom pełny), trzustka 0,6 (zgodnie z korektą), reszta przygaszona; strzałki `hormone` widoczne tylko w sprincie (`states: ['sprint']`).
4. **Kotwice:** rozsunąć nachodzące (głowa: szyszynka/podwzgórze/przysadka – część jako `secondary`; brzuch: wątroba/ż. wrotna/trzustka/nadnercze; zbliżenie: rdzeń/tętnica).
5. **Opisy ról bez źródła** (tarczyca, szyszynka, grasica): tylko nazwy – zgoda.
6. Źródło Marliss i Vranic 2002 jest też u agenta pokarmowego – użyć tego samego ID (`marliss_vranic_2002`), żeby scalenie nie dublowało wpisu.
