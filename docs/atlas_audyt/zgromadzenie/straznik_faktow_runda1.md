# Strażnik faktów: runda 1

Rola: cytaty, protokoły, poziomy dowodów, uczciwość procesu (model §3.6, §3.7). Gałąź `atlas-uklady` (72af276). Data: 2026-11-26.
Materiał: 12 plansz, walidator, raporty `fakty_koncowe_A/B/C`, `ZESPOL.md`, diffy `cce0f36`, `157171c`, `48fd880`, zrzuty pokarmowy i powłokowy (1440, sprint).
Nic poza tym plikiem nie zmieniałem.

## Ocena ogólna

**Proces był rzetelny, a stan końcowy go dotrzymuje, z kilkoma lukami formalnymi.** `check:atlas`: 71 liczb, 165 opisów ról (+162 budowy), 21 podsumowań, 0 błędów.
Na ekran trafiają tylko `checked_agent` i `anatomy`: filtr `isShown` w UI, `shownSummary` w podsumowaniach, a dla liczb walidator wymaga `checked_*`, cytatu i lokalizatora.
Fakty `unverifiable` są ukryte (5 na powłokowym, m.in. temperatura w przełyku). Poprawki po `disputed` wpisano dosłownie brzmieniem sprawdzającego: porównałem 9 pozycji B i C z diffami i wszystkie się zgadzają.
Atlas pokazuje dopisek „Sprawdzone przez agenta AI z dosłownym cytatem (nie przez eksperta)”, zgodnie z §3.6 pkt 7.

## Problemy według wagi

**Średnie**
1. **Walidator nie realizuje całego §3.6 pkt 5.** Nie sprawdza, czy liczba z faktu stoi w cytacie.
   Heurystyka: 27 z 71 pokazywanych liczb ma wartość spoza cytatu, z czego 13 bez `conversionNote`. Zwykle to zaokrąglenia albo słowa („sixfold”, 22,9 → 23), ale reguły nikt nie egzekwuje.
   Opisy ról i podsumowania nie mają w kodzie ani cytatu, ani lokalizatora. Dowód jest tylko w raportach `.md`, a walidator wymaga przy nich wyłącznie `referenceIds`.
2. **Status `anatomy` (162 opisy, 1 podsumowanie) nadaje się bez żadnej kontroli.** Walidator nie odróżnia opisu budowy od twierdzenia fizjologicznego oznaczonego jako `anatomy`. Dziś nie znalazłem nadużycia, ale to otwarta furtka.
3. **Teksty spoza bramki faktów:** `protocolNotePl` (7 plansz, np. powłokowy: „naczynia skóry zwężają się już w pierwszych sekundach…”), podtytuły plansz, `notePl` i `measuredAt`.
   Na ekranie są, a nie mają statusu. Sprawdzający czytali `notePl` przy liczbach, ale tylko przy okazji.
4. **Kontrola wyrywkowa 25/25 obejmuje tylko liczby.** Jest losowa i ma jawne ziarno, ale żaden z 165 opisów ról i 20 podsumowań nie trafił do próby, choć to 85% faktów na ekranie.
   Na planszy rozrodczej to ok. 5% faktów. Wymaganie „≥10% każdego układu” (§3.6 pkt 6) nie jest więc spełnione dla ról. Sprawdzający C sam to zgłosił, a Dyrygent tego nie dobrał.
5. **Wyjątki Dyrygenta (a–e) i reguła ostatniej rundy są opisane tylko w komentarzach kodu i w jednej linii `ZESPOL.md`.** Nie ma zapisu decyzji z uzasadnieniem.
   Merytorycznie wyjątki są uczciwe, a lokalizatory to jawnie mówią: „cytat z indeksu wyszukiwarki Exa”, „tabele sprawdzone na publicznej kopii skanu”.
   Reguła „brzmienie dosłownie od sprawdzającego = `checked_agent`” omija jednak drugą rundę, której §3.6 nie przewiduje. Wymaga to zgody użytkownika, a nie tylko decyzji Dyrygenta.

**Niskie**

6. **Powłokowy, liczba „30–50% ciepła”.** `protocolMismatch` podaje jako przykład Kenny 2008 (60 min / 60 min), a ten abstrakt daje **53%** („only 53% of the heat stored… was dissipated after 60 min”), czyli wartość spoza pokazanego zakresu.
   `notePl` „kilkanaście do kilkudziesięciu minut” nadal nie ma źródła; sprawdzający A zgłosił to jako opcjonalne. Cytatu przeglądu nie da się sprawdzić w wolnym dostępie, bo Europe PMC ma tylko „Subscription required”.
7. **Mięśniowy, deltoid w sprincie.** Hamner 2010 to symulacja komputerowa, a fraza „Pierwsze badania sugerują” (`preliminary_human`) brzmi jak badanie ludzi. Dopisku „symulacja”, o który prosił C, nie dodano. Drabina nie ma poziomu dla modeli.
8. **Pokarmowy: liczba „4–6×” i podpis wątroby** to fakty przeniesione z planszy hormonalnej (ten sam cytat Sigal) i oznaczone `checked_agent` bez sprawdzenia na tej planszy. Ryzyko jest niskie, ale to nie było sprawdzenie.
9. **Liczby w `restStatus: 'draft'`** (rozrodczy testosteron, wydalniczy białko) są ukryte, ale walidator ich nie liczy, więc komunikat „0 draft” jest nieścisły.
10. **Wątpliwe poziomy dowodów:** `contested_debate` przy metaanalizie McNulty (ES −0,06). To raczej „mała pewność” niż spór.
11. **Liczby bez `protocolMismatch`.** Skład włókien i „>75% energii jako ciepło” go nie potrzebują. VO₂ „ok. 3–3,4 L/min (88% VO₂max)” to wyliczenie z norm Kaminsky 2015, nie pomiar, i warto to nazwać.

## Moja próba: 5 faktów z ekranu (PubMed efetch, abstrakty)

| Fakt | Źródło | Wynik |
|---|---|---|
| Oddechowy: tlen dla mięśni oddechowych ok. 10 (do 15)% VO₂max | Aaron 1992, PMID 1601791 | Zgodny: „averaged 10 +/- 0.7%”, „13-15% of VO2max”. Uwaga: 15 jest poza polem `quote`, a koszt mierzono naśladowaniem oddechu w spoczynku. |
| Limfatyczny: śledziona ok. 44% objętości | Stewart 2003, PMID 12482773 | Zgodny: „56% reduction”, 100 − 56 = 44. Protokół (9 mężczyzn, test do wyczerpania) zgodny. |
| Mózg: mleczan ok. 8 → do 27% energii mózgu | van Hall 2009, PMID 19337275 | Zgodny: 8% w spoczynku bez wlewu, 27% w wysiłku przy 75% VO₂max z wlewem (mleczan tętniczy 6,9 mmol/L). Flaga protokołu jest trafna. |
| Moczowy: frakcja filtracyjna do ok. 2× | Poortmans i Vanderstraeten 1994, PMID 7886356 | Zgodny: „the filtration fraction can double with maximal exercise”. |
| Mięśniowy (podpis): deltoid, „Wymach ramion równoważy obrót nóg” | Hamner 2010, PMID 20691972 | Treść zgodna („arms effectively counterbalanced the vertical angular momentum”). Poziom dowodu mylący (pkt 7). |

Wynik: 5/5 zgodnych co do treści, 0 rozbieżności merytorycznych, 2 uwagi formalne. Przy okazji wyszła niespójność 30–50% wobec 53% (pkt 6).

## Rekomendacje dla E1 (`structures.json`, `facts/*.json`)

1. **Jeden rekord na fakt, także dla ról i podsumowań**, z polami: `quote`, `locator`, `referenceIds`, `status`, `checkedBy` (raport + wiersz), `accessMode`.
   `accessMode` przyjmuje wartości `full_text | abstract | search_index | third_party_scan`. Wyjątki staną się wtedy danymi, a nie komentarzami.
2. **Walidator:**
   - liczba w cytacie albo `conversionNote`;
   - `anatomy` tylko dla rekordów bez `referenceIds` do badań wysiłkowych i bez słów zmiany (więcej/mniej/rośnie);
   - `restStatus` sprawdzany i liczony;
   - `accessMode: search_index` tylko z flagą widoczną w poziomie Rozszerzonym.
3. **Wszystkie teksty ekranowe przez bramkę:** `protocolNotePl`, `notePl` i podtytuły jako fakty ze statusem albo jawnie oznaczone „opis karty”.
4. **Drabina:** dodać poziom „model / symulacja” albo wymusić dopisek. Każdy `protocolMismatch` w Podstawowym ma zostać krótką uwagą (§3.7 pkt 2).
5. **Kontrola wyrywkowa w E1:** losowanie z puli wszystkich faktów ekranowych (liczby, role, podsumowania), ≥10% na układ, wykonawca spoza sprawdzających A, B i C.
   Dodatkowo co najmniej 2 role i 1 podsumowanie na układ oraz wszystkie 9 pozycji przyjętych regułą ostatniej rundy.
6. **Decyzje a–e i regułę ostatniej rundy** zapisać w `ATLAS_MODEL_ARCHITEKTONICZNY.md` §3.6 jako wyjątek zatwierdzony przez użytkownika (albo cofnąć do `draft`).
   Naprawić pkt 6: dopisać „(w badaniu Kenny 2008: 53% po 60 min)” albo zmienić przykład.
