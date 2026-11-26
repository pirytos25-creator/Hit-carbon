# Audyt Dyrygenta: M2, test techniczny serca (Wizualizator)

Data: 2026-11-26.
- Gałąź `claude/atlas-wizualizacja-3d-1dc29a`, commity `05daecb` i `7ef6995`.
- Prototyp w `prototypes/organs_m2/` (poza `src/`).
- Raport `docs/atlas_wizualizacja/M2_TEST_SERCA.md`.

## Werdykt: **M2 ZALICZONY**

| Wymaganie | Wynik |
|---|---|
| Skurcz przez odkształcenie prawdziwej geometrii | Kształty `Atrial_Systole`, `Ventricular_Systole`, `Valve_Open` są liczone z geometrii HuBMAP (oś długa komór, środki przedsionków, linia przyczepu zastawek). Wielkość ruchu jest oznaczona jako „poglądowa”, dopóki nie przejdzie bramki faktów |
| Krwinki 3D z objętością, zorientowane wzdłuż toru, z prędkością zależną od przekroju | Profil Evansa–Funga z filmu. 7 torów z promieniem zmierzonym na geometrii, v ~ 1/r². Krew czeka przed zamkniętą zastawką. Zamyka lukę filmu |
| Przekrój czytelny | Zalanie przez stencil: ściana ma grubość, jama jest otwarta |
| Poziom Low ≥ 50 FPS na Intel UHD przy 1440×900 | Wizualizator, widoczne okno: **91 FPS** (zastawki B 95, profil film 79) |
| Licencje | Tylko HuBMAP (CC BY 4.0). `heart_m2_opt.glb` ma 1,91 MB |
| Konsola | 0 błędów (pomiar Dyrygenta) |

**Niezależny pomiar Dyrygenta** (headless Chrome, ANGLE D3D11, Intel UHD 0xA7A8, ta sama metoda render + `readPixels`):

| Wariant | FPS |
|---|---|
| Low, zastawki A | 39–43 |
| Low, zastawki B | 41–42 |
| Low, profil film | 40–43 |
| High | 4–5 |

Headless zaniża wyniki. Kalibracja tą samą metodą na widoku 3D oddechowym (E3) daje **16–19 FPS**, a w E3-K3 widoczne okno dawało dla niego 56 FPS. Test serca jest więc w tych samych warunkach ok. 2,3× szybszy od oddechowego, który mieści się w budżecie. **Wynik Wizualizatora jest wiarygodny.**

## Rozstrzygnięcia

1. **Zastawki B od razu**, z chipem „ruch poglądowy” (0 FPS kosztu). Użytkownik dopuścił B wcześniej, jeśli test pokaże, że jest tani.
   Ograniczenie: płatki się nie rozdzielają, zastawka otwiera się jak lejek. Rozdzielenie płatków to osobne zadanie z kontrolą anatomii.
2. **Poziom High na UHD nie istnieje** (4–10 FPS). Wybór poziomu ma być automatyczny i na zintegrowanej karcie zawsze Low.
   High na RTX pozostaje **niezmierzony**: pomiar wymaga zmiany ustawień grafiki w Windows i należy do użytkownika.
3. **Profil film (AgX):** dla tętnic ΔE00 względem tokenu wynosi 18, więc czerwień blednie w róż, a krwinki giną na różowej ścianie.
   **Warunek M4:** kompensacja barwy przed AgX tak, by ΔE00 ≤ 10 dla tokenów `artery` i `vein`. Rozróżnienie tętnica/żyła ≥ 30 jest dziś spełnione (33,5).
4. **Ściany naczyń w zbliżeniu:**
   - Low: dithering Bayera (+1,1 ms);
   - High: prawdziwa przezroczystość (+15 ms, na UHD się nie mieści).
5. **Barwa ścian serca:** „mięsień” (barwę niesie krew, jak w klatce M1) czy „krew” (jamy prawe niebieskie, lewe czerwone, jak w schematach podręcznikowych). Obie wersje są gotowe (`m2_warianty_scian.jpg`). **Pokazać użytkownikowi na bramce A jako porównanie.** Rekomendacja Reżysera i Wizualizatora: „mięsień”.
6. **Przeniesione z filmu bez zmian:** profil krwinki, zasada poziomów `QualityManager`.
   **Przepisane:**
   - serce: w filmie scalone w 4 obiekty, bez ID struktur, kształty z ręcznych punktów, a `Valve_Open` to rozdęcie całej zastawki;
   - tory krwinek: z promieniem, z tablicą próbek, co daje CPU 3,1 → 0,84 ms.

   To wsad do architektury `src/biomotion` w M4.

## Czas (wsad do M2′)
- Szacunek Dyrygenta: 6–12 h. Szacunek Wizualizatora: 4 h.
- **Rzeczywisty czas: ok. 25 minut** (18:40–19:05, z raportem).
- Przyczyna: ponowne użycie potoku E3 (meshopt, pomiar, sloty Blendera) i profilu krwinki z filmu.
- Wizualizator słusznie zastrzega, że tego tempa nie przenosimy wprost na M4–M5 (integracja z filmem i aplikacją).
