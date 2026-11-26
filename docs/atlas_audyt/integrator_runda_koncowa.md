# Audyt Dyrygenta: Integrator, runda końcowa po zgromadzeniu

Data: 2026-11-26. Commity `07ce653`, `c88b7fb`, `d0a6a69`, `db22aac`, `5926483`, scalone do `atlas-uklady`.

## Werdykt: **PRZYJĘTA i scalona** (jedyna runda dodatkowa wg statutu §6)

| Sekcja decyzji | Stan |
|---|---|
| A. Treść | Nerwowy: strzałka współczulna od odcinka piersiowego jako osobny rodzaj, nerw udowy z L2–L4 z dala od nadnercza, pinezka kory ruchowej na lewej półkuli (przebieg `ATLAS_ANCHORS_ONLY` w slocie). Usunięte/przeniesione do Rozszerzonego: „7–8×” z podsumowania pokarmowego, PET i CMR mózgu, ES rozrodczego, „najpierw” przy buforach (moczowy). Odsyłacz adrenaliny nerwowy → dokrewny. Nowe brzmienia (`draft`, ukryte do kontroli): deltoid (symulacja), ż. odpiszczelowa, naczynia skóry w spoczynku, 30–50% z 53%, zdania o „sprincie” hormonalnego i pokarmowego, definicja VO₂max. Strzałka mózgu: dopisek „schemat drogi” (bez przerysowania). |
| B. Dostępność | Kolor tekstu na kolorze układu ≥ 4,5:1 (walidator); legenda strzałek i 15 wzorów kreski w `palette.json`; `slate-400`; menu i stopka 14 px; S tylko z fokusem, spacja nie przełącza; na telefonie przełącznik stanu przyklejony u dołu, link „Podróż filmowa” widoczny; skróty nazw rozwinięte; krótsze „W badaniu”. |
| C. Licencje | Stopka z odnośnikami do licencji i opisem zmian; pęcherz żeński HRA, NIH Visible Human / Indiana University i modele dołączone do Z-Anatomy w dokumentach. |
| D1. Bramka | `protocolNoteStatus` (zdania o „sprincie” w `draft` → na ekranie neutralna informacja), wymagany `restStatus`, słowniczek przez bramkę, kontrola „liczba w cytacie albo `conversionNote`” (16 uwag). |

**Niezrobione (opisane, przyjęte):** kolory par o ΔE < 15 w jasnych wariantach strzałek (rozróżnia je wzór kreski i legenda); rozwinięcie ACTH/IIx/LAD w tekstach ról; przebieg strzałki mózgu przez t. szyjną wewnętrzną (oznaczona „schemat drogi”).

## Testy Dyrygenta po scaleniu
- Build kod 0; `check:atlas` kod 0 – 70 liczb (46 wartości spoczynkowych z jawnym `restStatus`), 162 opisy ról + 162 budowy, 21 podsumowań, 12 `draft`; paleta OK; 200 kotwic ≤ 0,173 px.
- Serwer podglądu znów przestał działać – uruchomiony ponownie (kod HTTP sprawdzony przed zrzutami). 12 zrzutów 6 zmienionych plansz (1440 i 390): 0 błędów konsoli, bez przewijania w poziomie. Obejrzane: nerwowy 1440 (strzałki rozdzielone, legenda), moczowy 390 (przełącznik stanu przyklejony u dołu, legenda, rozwinięte nazwy, stopka z licencjami).
- Niezależna kontrola końcowa (D2) w toku: `fakty_kontrola_koncowa.md`.
