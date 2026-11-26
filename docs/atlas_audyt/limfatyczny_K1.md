# Audyt Dyrygenta: limfatyczny, punkt kontrolny K1

Data: 2026-11-25. Sesja `local_562c4781-155b-408c-9843-240bfffcb276`. Raport agenta: `side-session-notes/.../limfatyczny/limfatyczny_K1.md`.

## Werdykt: **K1 ZALICZONY, kontynuuj** (runda 1 z 3)

| # | Punkt | Wynik |
|---|---|---|
| 1 | Zakres plików | OK. Jeden nowy plik `plate_limfatyczny.py`; podglądy poza repo. |
| 2 | Anatomia | 158 obiektów `6: Lymphoid organs` (9 grup węzłów, śledziona, grasica, migdałki). Narządy HuBMAP leżą 2,5–3,4 cm od Z-Anatomy, więc w widoku ciała są narządy Z-Anatomy, a HuBMAP tylko w zbliżeniu węzła – słusznie. Obejrzałem `preview4_sheet.jpg`: przewód piersiowy wzdłuż kręgosłupa do **lewego** kąta żylnego (po prawej stronie obrazu – poprawnie), zbiornik mleczu przed L1–L2, śledziona po lewej stronie ciała. Przekrój węzła HuBMAP czytelny (torebka, grudki, strefa przykorowa, rdzeń, naczynia doprowadzające i odprowadzające). Brak obiektów NC. |
| 3 | Obraz | Węzły w ujęciu całego ciała nadal drobne; różnica stanów widoczna głównie na śledzionie i nogach. |
| 4 | Fakty (plan) | NK ×2,8 (Nieman 1992, Wingate, `protocolMismatch`), limfocyty i leukocyty z Bogdanis 2022 (8 × 60 s przy mocy VO₂max – najbliżej wzorca), śledziona −56% (Stewart 2002, test do wyczerpania). Spory jako `contested_debate` z obiema stronami. Pełne sprawdzenie w K2. |
| 5 | Testy | Build nie dotyczy K1. |

## Decyzje
1. Rodzaj strzałki `lymph` (`var(--sys-lymph-light)`) – przekazany integratorowi do K3. Do tego czasu `kind: "lymph"` w danych.
2. Moment „po wysiłku” w `notePl`/`measuredAt`, bez osobnego renderu – zgoda.
3. Powiększenie węzłów (mediana 2,5×, wokół własnych środków) – zgoda, z dopiskiem na planszy „węzły powiększone, naczynia chłonne: schemat”.
4. Jasność w sprincie w 3 stopniach jako ilustracja – zgoda. Śledziona: wyróżnienie w sprincie nie może sugerować, że rośnie; podpis mówi, że się **kurczy** i oddaje krew i komórki (liczba z testu do wyczerpania z `protocolMismatch`).
5. K2: węzły w sprincie bardziej nasycone, żeby różnica była czytelna także przy 390 px.
