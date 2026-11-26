# Strażnik faktów: runda 2

## (a) Z czym się nie zgadzam

- **Dydaktyk, ścieżka podręcznikowa ze statusem `anatomy`: tak dla ścieżki, nie dla statusu.**
  - `anatomy` oznacza dziś „opis budowy, bez kontroli źródła”. Zdania o spoczynku, np. „w spoczynku pracuje niewiele małych jednostek” albo „ok. 6 L/min”, to fizjologia.
  - Pod `anatomy` ominęłyby bramkę cytatu i zatarłyby jedyną granicę, której walidator nie umie sprawdzić.
  - Proponuję osobne pochodzenie `textbook_consensus` (już jest w §3.6 pkt 8) ze statusem `checked_agent` i z tymi samymi wymogami: dosłowny cytat, lokalizator (rozdział, strona), drugi agent.
  - Do tego zmiana reguły: podręcznik z ISBN, np. OpenStax, jest dopuszczalnym identyfikatorem. Dziś oddechowy odrzuca go za brak DOI i PMID.
  - Na ekranie potrzebna jest osobna fraza („Wiedza podręcznikowa”), nie „U ludzi dobrze wiadomo”.
  - Opis kory ruchowej skopiowany z planszy nerwowej przyjmuję, jeśli tekst i źródło są identyczne i w rekordzie zapisano „przeniesione z”.
  - Wartość „w staniu ok. 1× masa ciała” to wyliczenie, więc wymaga `conversionNote`.
- **Dydaktyk 9 (dopiski protokołu do 8–10 słów): zgoda pod warunkiem.** Skrót musi zachować kierunek różnicy: „maksymalny”, „30 s sprint”, „zwierzęta”, „ciągły, kilkanaście minut”. Inaczej łamie §3.7 pkt 2.
- **Dydaktyk 13 i anatom 2 („Umiarkowany przepływ”, nowa nota CMR):** to nowe twierdzenia, nie redakcja. Dostają `draft` i idą do sprawdzenia; reguły ostatniej rundy nie rozszerzamy.

## (b) Najważniejsze z cudzych list z mojej perspektywy

- **Anatom 5 (pompa mięśniowa na żyle powierzchownej) i moczowy („najpierw bufory krwi”).** Oba teksty mają status `checked_agent`. Sprawdzający potwierdzał zjawisko, ale nie to, czy pasuje do kotwicy. Kontrola ról musi pytać także „czy to ta struktura?”.
- **Anatom 2 i dydaktyk 8:** dwa sprawdzone fakty, które się sobie przeczą (glukoza w mózgu, adrenalina 7× i 12×). Brakuje kontroli spójności między planszami.
- **Dydaktyk 5:** przeciek decyzji a), czyli 7–8× w Podstawowym, przez podsumowanie.
- **Dostępność 3:** dopisek o uczciwości („Sprawdzone przez agenta AI…”) ma kontrast 3,75:1.
- **Architekt 2:** jedno źródło prawdy dotyczy też faktów. `chains.json` i narracja mają się odwoływać do `factIds` (§3.6 pkt 5), nie do tekstu.

## (c) 5 poprawek must-have przed przyjęciem (od najważniejszej)

1. **Poprawić teksty niezgodne z anatomią lub sprzeczne:**
   - żyła odpiszczelowa i pompa mięśniowa;
   - strzałka krwi w mózgu i sprzeczność z notą CMR;
   - rozdzielenie strzałek na planszy nerwowej;
   - bufory w mięśniach i we krwi.

   Nowe brzmienie dostaje `draft` i przechodzi przez drugiego agenta.
2. **Spójność liczb:**
   - pokarmowy: w Podstawowym tylko „przy ok. 87% VO₂max 4–6 razy”;
   - nerwowy: odsyłacz „ponad 12× przy dłuższym wysiłku”;
   - powłokowy: 30–50% wobec 53% u Kenny 2008.
3. **Skala czasu:** do `protocolNotePl` dopisać „Sprint = późniejsze interwały, po kilku minutach sesji”. `protocolNotePl` włączyć do bramki faktów.
4. **Walidator:**
   - liczba w cytacie albo `conversionNote`;
   - `restStatus` sprawdzany i liczony;
   - `anatomy` bez twierdzeń o zmianie;
   - ścieżka `textbook_consensus` z cytatem (jak w (a)) zamiast `anatomy`.
5. **Kontrola wyrywkowa ról i podsumowań:**
   - ≥10% na układ;
   - wszystkie 9 pozycji przyjętych regułą ostatniej rundy;
   - wykonawca spoza sprawdzających A, B i C;
   - pytanie o zgodność opisu z kotwicą.

   Napis o sprawdzeniu przez AI zmienić na `slate-400`.
