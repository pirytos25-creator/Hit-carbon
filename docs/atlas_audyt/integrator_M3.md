# Audyt Dyrygenta: M3, czytelność plansz (integrator)

Data: 2026-11-26.

Commity integratora:

| Commit | Zakres |
|---|---|
| `be15e11` | dane lekcji |
| `9b7284b` | interfejs |
| `d59bc0f` | walidator |
| `36117cb` | moment nad 3D |
| `490e0a7` | odporność walidatorów na CRLF |
| `bb2e79e` | wynik kontroli 1 |
| `b6a6a0f` | wynik kontroli 2 |

Scalenia do `atlas-uklady`: `b38bb87`, `cf6f1ef`, `9995df9`.

## Werdykt: **M3 ZALICZONY**

| Poprawka (UX_POSIEDZENIE §2.1) | Wynik |
|---|---|
| S1 protokół i VO₂max pod „ⓘ Co znaczy »sprint«” | tak. Panel zaczyna się od celu lekcji i pytania planszy |
| S2 (K4) zero tekstów roboczych na ekranie ucznia | tak. Statusy tylko w Rozszerzonym (`StatusNotes`); walidator sprawdza wszystkie pola tekstowe. Gdy nota planszy nie jest sprawdzona, wyświetla się nota wzorcowa |
| S3 telefon | tytuł nad obrazem, pasek układów z „›” |
| S4 mały „Podstawowy \| Rozszerzony” w nagłówku, moment pod sceną | tak; steruje także widokiem 3D (po S9/S10) |
| S5 nazwa momentu | „Koniec 45 s pracy”, „Koniec treningu” (skóra), „Krok szybkiego biegu” (kostny) |
| S6 jedna nazwa szkolna | tak (np. „Skóra”) |
| S7 „Jak czytać” przy scenie | tak |
| S8 pełne słowa w Podstawowym | tak (2D) |
| S11–S12 tło studia i chip wielkości kadru | tak |
| S13 kontrast przycisku momentu | ≥ 4,5:1 dla 12 układów (najmniej: krwionośny 4,69) |
| P1 pola lekcji | `lessonGoal`, `question`, `summaryShort`, `momentLabel`, `curriculumRef` (7 dosłownych cytatów podstawy, 5 plansz bez cytatu, pole puste) |

**Treść:** 63 nowe teksty, wyłącznie przeformułowania sprawdzonych faktów.

| Kontrola | Kto | Wynik |
|---|---|---|
| 1 | niezależny agent (`M3_kontrola.md`) | 42 OK, 21 poprawek |
| 2 | drugi niezależny agent (`M3_kontrola_runda2.md`) | 19 OK, 2 poprawki |
| 3 | Dyrygent, dla 2 brzmień z kontroli 2 | OK |

Najczęstszy błąd pierwszych brzmień: skrót gubił dopisek „w badaniu: …”, więc liczba wyglądała, jakby dotyczyła sprintu z aplikacji. Wszystkie takie przypadki zostały naprawione.

**Testy Dyrygenta po scaleniu:**
- build 0, `check:atlas` 0 (0 draftów, 60 tekstów lekcji na ekranie, dane 0 uwag, test CRLF OK), `check:atlas3d` 0;
- obejrzane zrzuty: krwionośny 1440, hormonalny, pokarmowy i skóra z rozwiniętym „ⓘ”, telefon 390.

**Błąd znaleziony przy scalaniu:** nowe reguły walidatora nie działały przy końcach linii CRLF (główny checkout na Windows) i dawały 8 fałszywych błędów. Integrator naprawił to od razu: wszystkie walidatory normalizują końce linii, a doszedł test CRLF.

**Czas:** szacunek integratora 4–7 h. Rzeczywisty czas pracy to ok. 0,5 h (18:52–19:23) i ok. 0,3 h poprawki CRLF, do tego zrzuty w tle. Dwie kontrole treści trwały ok. 7 min i ok. 3 min. Najdłużej trwało czekanie w kolejce wiadomości.

## Zostaje na później
- Podpisy 3D w Podstawowym nadal mają skróty „m. …” (`fullWords` działa tylko w 2D). To zadanie dla Wizualizatora przy M6.
- W pasku 3D zostaje „zmiana w panelu obok”. Do ujednolicenia przy ramie M6.
- P2: podpisy bez opisu roli w Podstawowym (mózg 21, mięśniowy 19 i inne) zależą od decyzji użytkownika o faktach podręcznikowych (pytanie 2).
