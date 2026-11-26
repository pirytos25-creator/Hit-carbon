# Audyt Dyrygenta: rozrodczy, punkt kontrolny K1

Data: 2026-11-25. Sesja `local_38e25e6a-ea22-4f47-9266-0aa8758cd6d5`. Raport agenta: `side-session-notes/.../rozrodczy/rozrodczy_K1.md`.

## Werdykt: **K1 ZALICZONY, kontynuuj** (runda 1 z 3)

| # | Punkt | Wynik |
|---|---|---|
| 1 | Zakres plików | OK. `plate_rozrodczy.py`, `public/atlas/rozrodczy/*` (nieśledzone). Wspólny kod nietknięty. |
| 2 | Anatomia | Miednica męska z Z-Anatomy, żeńska z HuBMAP VH_F na własnej miednicy i kręgach VH_F. Narządów żeńskich nie nałożono na szkielet Z-Anatomy (kręgi VH_F 8,7–9,5 cm od Z-Anatomy; zgodnie z ustaleniem integratora). Obejrzałem `fit/dopasowanie_miednica.png`: macica między spojeniem a kością krzyżową, jajniki przy ścianie miednicy małej, pochwa ku dołowi. Obejrzałem `kotwice_K1.png`: oba widoki z boku, przód po lewej, ta sama orientacja i skala. Męskie kotwice 10/10 trafiają. |
| 3 | Obraz | Ujęcie jak przekrój strzałkowy w podręczniku, rzeczowe. Karta bez stanów, bez emisji (zgodnie z typem treści). Sylwetki brak, bo skóra VH_F v1.3 nie pasuje do kości VH_F – uzasadnione pomiarem. |
| 4 | Fakty (plan) | Testosteron po interwałach (Hackney 2012, `protocolMismatch`), niejasne znaczenie (Velasco-Orjuela 2018, West 2010), faza cyklu (McNulty 2020, `contested_debate`), RED-S (IOC 2023) tylko długoterminowo. Bez wymyślonych liczb. Pełne sprawdzenie w K2. |
| 5 | Testy | Build nie dotyczy K1. |

## Decyzje
1. **Kamera z boku dla obu miednic** – zatwierdzona.
2. **Pęcherz:** sprawdź w oficjalnym HRA (darmowe pobranie dozwolone), czy jest żeński model pęcherza (VH_F urinary bladder). Jeśli jest, dodaj go jako kontekst po stronie żeńskiej (macica leży nad pęcherzem, to pomaga w orientacji). Jeśli nie ma, zostaw pęcherz męski jako przygaszony kontekst i dopisz w poziomie rozszerzonym, że model żeński go nie zawiera.
3. **Skóra VH_F v1.3** – zapisane jako znany problem zasobu (do `docs/ATLAS_ASSETS.md` w integracji 1b). Nie blokuje karty.
4. **K2:** przesunąć kotwice macicy (na trzon) i jajowodu (rozdzielić z jajnikiem).
