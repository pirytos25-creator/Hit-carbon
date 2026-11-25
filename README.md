# BIOGENESIS: THE HIIT EXPERIENCE
**Wewnętrzny wszechświat ludzkiego organizmu podczas intensywnego wysiłku fizycznego**

Interaktywna, filmowo-growa podróż naukowa przez 12 aktów i 10 rzędów wielkości biologicznej (od bieżni w siłowni w skali `1,8 m` aż po synapsę, syntazę ATP i receptory TrkB w skali `10⁻⁹ m`).

---

## Szybkie uruchomienie lokalne (Windows)
1. Kliknij dwukrotnie plik **`start.bat`** w katalogu projektu (lub uruchom `.\start.ps1` w PowerShell).
2. Aplikacja zainstaluje brakujące pakiety (przy pierwszym razie) i uruchomi lokalny serwer Vite pod adresem **`http://127.0.0.1:5173`**.

Możesz też uruchomić ręcznie z terminala:
```powershell
npm.cmd install
npm.cmd run dev
```
Build produkcyjny:
```powershell
npm.cmd run build
```

---

## Pięć trybów doświadczenia (przełączane w locie)
1. **Tryb Filmowy** — automatyczna podróż przez 12 aktów (~18 min przy `1.0x`), zsynchronizowana z narracją, muzyką adaptacyjną, efektami dźwiękowymi i reżyserią kamer.
2. **Tryb Eksploracyjny** — swobodna kamera orbitująca wokół narządów, komórek i cząsteczek, zatrzymywanie procesów, zmiana skali i warstw anatomicznych.
3. **Tryb Interaktywny (Symulator HIIT)** — modyfikacja intensywności (`% VO₂max`), czasu interwałów, odpoczynku, liczby serii, poziomu wytrenowania oraz przełączanie 6 kanonicznych faz wysiłku.
4. **Tryb Akademicki** — zaawansowana narracja neurobiologiczno-psychofizjologiczna (`pl-PL-ZofiaNeural`), taksonomia poziomów dowodowych, korekty mitów, ograniczenia badań i bibliografia PubMed/DOI.
5. **Tryb Popularnonaukowy** — przystępna, filmowa narracja (`pl-PL-MarekNeural`), analogie i nacisk na zrozumienie całości organizmu.

---

## Skróty klawiaturowe
- `Spacja` — Odtwarzanie / Pauza osi czasu
- `←` / `→` — Przeskok do poprzedniego / następnego Aktu
- `H` — Ukrycie / przywrócenie interfejsu diegetycznego (czysty tryb kinowy)
- `M` — Wyciszenie / przywrócenie dźwięku
- `F` — Pełny ekran

---

## Zastrzeżenie naukowe i edukacyjne
- Fizjologiczny model HIIT (`src/core/PhysiologyEngine.ts`) ma charakter **poglądowy i edukacyjny**. Nie służy do diagnozowania stanu zdrowia ani zalecania indywidualnych obciążeń treningowych.
- Model nie wylicza liczbowych stężeń neuroprzekaźników mózgowych ani BDNF z parametrów treningu na suwakach — procesy ośrodkowego układu nerwowego prezentowane są jakościowo z wyraźnym wskazaniem poziomu dowodów (`EvidenceLevel`) oraz różnic między badaniami na ludziach a modelami zwierzęcymi.
- Szczegółowa bibliografia i dokumentacja znajdują się w katalogu `docs/`.
