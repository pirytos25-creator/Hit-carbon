# Audyt Dyrygenta: M4, wspólny moduł animacji `src/biomotion` (Wizualizator)

Data: 2026-11-26.
- Commity: `94e32a2` (M4), `f6381e0` (kontrakt wyróżnika 3D), `edd0135` (AgX za przełącznikiem).
- Scalenie do `atlas-uklady`: `d0be24c`.
- Raport: `docs/atlas_wizualizacja/M4_RAPORT.md`, nagrania w `docs/atlas_wizualizacja/zrzuty/m4/`.

## Werdykt: **M4 ZALICZONY** (po jednej poprawce: AgX na Medium+ za przełącznikiem)

| Warunek | Wynik |
|---|---|
| Akt 3 (i 12) na module bez regresji | Ta sama klatka Low przed i po: średnia różnica 0,3/255. Nagranie obok siebie: `m4_akt3_przed_po_low.mp4`. FPS w rozrzucie pomiaru (A/B na tej samej karcie). |
| Profil `film` = obecny wygląd | tak. Mat atlasu tylko ręcznie (`filmMatte`). Porównanie dla użytkownika: `m4_akt3_film_vs_mat.mp4`, `film_dzis_vs_mat_atlasu_t190.jpg`. |
| Kompensacja AgX ΔE00 ≤ 10 | artery 9,7, vein 4,9 (margines artery cienki; w M5 każde studio gabloty mierzy osobno). |
| Błędy filmu | `beatPhase` całkowany w `BioClock` (test: błąd 2,5e-15); `ACT_MODEL_MAP` zgodny ze scenami; AgX pomijany na Medium+ (potwierdzone w `EffectComposer`). Naprawa jest **za przełącznikiem, domyślnie wyłączona**, bo zmienia wygląd filmu znany użytkownikowi. Porównanie: `m4_medium_agx_dzis_vs_naprawa.jpg`. |
| Moduł bez globalnych store'ów | tak (`BioFrame`). |
| Kontrakt wyróżnika 3D (§4) | `src/biomotion/signatures/contract.ts`, `createSignature3D`, budżet Low ≤ 1 ms. |

**Testy Dyrygenta po scaleniu:**
- build 0, `tsc --noEmit` 0, `check:atlas` 0, `check:atlas3d` 0, `selftest` biomotion 0.
- Zbudowana aplikacja w przeglądarce:
  - plansza krwionośna i „Obróć w 3D” działają, konsola bez błędów;
  - ekran startowy filmu ładuje się z kanwą 3D, konsola bez błędów.
- Na serwerze deweloperskim pierwsze wejście dawało pustą stronę: Vite przebudowywał zależności po zmianie konfiguracji. Zbudowana wersja jest poprawna.

**Stan zastany (do M7):** film na Low ma ok. 23 FPS w ujęciu serca jeszcze sprzed M4.

**Ważne dla faktów:** prędkość w tunelu liczona z przekroju całego łożyska. Fakt „krew płynie najwolniej w naczyniach włosowatych” trafia do kolejki partii 3 E1-K3.

**Czas:** szacunek 3–5 h, rzeczywisty ok. 50 min (z nagraniami) i ok. 10 min poprawki.

**Do decyzji użytkownika (bramka B):**
- (a) mat atlasu w filmie;
- (b) poprawne AgX na Medium+, które zmienia wygląd.
