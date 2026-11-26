# Zgromadzenie, runda 1: DYDAKTYK

Materiał: 48 zrzutów końcowych (12 plansz × 1440/390 × spoczynek/sprint, poziom Podstawowy), treść `src/atlas/plates/*.ts` (zrzut pól przez esbuild), `AtlasApp.tsx`, `AtlasPlate.tsx`, model §3.5, plan Reżysera. Nic poza tym plikiem nie zmieniałem.

## Ocena ogólna

**Warunkowo dobra (ok. 6,5/10 dla licealisty).** Mocne są obrazy i podpisy w stanie „sprint” oraz uczciwa drabina dowodów. Licealista zrozumie jednak bez pomocy tylko część plansz: krwionośną, limfatyczną, pokarmową, moczową i hormonalną. Trzy problemy dotyczą całego atlasu:
1. Filtr „tylko sprawdzone” wyczyścił **stan spoczynku**, więc porównanie „przed → po” często wygląda jak „nic → coś”.
2. **Dopiski protokołu i skróty** są pisane dla studenta, a stoją w poziomie Podstawowym.
3. Atlas **pokazuje stany, ale nie uczy kolejności przyczyn**. Przewodnika „Jeden interwał” i pytań „przewidź” jeszcze nie ma (`src/atlas/guide` nie istnieje).

Limity z §3.5 kod pilnuje mechanicznie: najwyżej 4 liczby i 7–10 podpisów `primary`. Wyjątek to mięśniowy: 14 podpisów `primary`, rozłożonych na 2 zakładki. Treść nie zawsze jednak trzyma ducha tych limitów.

## Problemy według wagi

| # | Waga | Plansza | Co | Dlaczego to szkodzi | Propozycja |
|---|---|---|---|---|---|
| 1 | wysoka | wszystkie (w nagłówku) | „88% VO₂max” stoi na każdej planszy i nigdzie w Podstawowym nie ma definicji. | Bez tego licealista nie rozumie, czym jest „sprint”. | Jedno zdanie w nocie: „VO₂max = najwięcej tlenu, ile ciało zużyje w minucie; 88% to bardzo ciężki, ale nie maksymalny wysiłek”. |
| 2 | wysoka | mózg | W Podstawowym jest 8 nazw bez żadnego opisu roli (na widoku z boku tylko 3). Obraz pokazuje korę ruchową i móżdżek, a tekst i liczby mówią o paliwie (mleczan, glukoza). | Obraz i tekst się rozjeżdżają, a plansza staje się quizem z nazw. | Opisy ról z podręcznika jako status `anatomy`: móżdżek „koordynuje ruch”, pień „ośrodki oddechu i krążenia”, kora ruchowa: ten sam opis, co już sprawdzony na nerwowym. Liczby PET (µmol/100 g/min) i CMR przenieść do `student`, a do Podstawowego wpuścić przepływ krwi przez mózg. |
| 3 | wysoka | nerwowy, mięśniowy, powłokowy | Spoczynek nie ma podsumowania (`unverifiable`). Rolę w spoczynku ma tylko 1 podpis na 9 (nerwowy), 1 na 14 (mięśniowy) i 0 przy skórze (powłokowy). | Przełącznik nie pokazuje różnicy, więc „co zmienia sprint” trzeba zgadywać. | Spoczynek to wiedza podręcznikowa. Dopuścić ścieżkę `anatomy`/`textbook_consensus` z cytatem z podręcznika, np. „W spoczynku pracuje niewiele małych jednostek ruchowych”. |
| 4 | wysoka | oddechowy, powłokowy, kostny | Wartość spoczynkowa to „—”: w oddechowym w 3 z 4 liczb, w powłokowym i kostnym we wszystkich. | Bez punktu wyjścia nie ma krotności, której §3.5 wymaga. | Wartości podręcznikowe: ok. 6 L/min, 12–16 oddechów/min, 0,5 L, 37 °C. Dla kości: w staniu nacisk ok. 1× masa ciała (½ na stopę) → 2,5×, czyli najlepszy kontrast tej planszy. |
| 5 | wysoka | pokarmowy | Podsumowanie sprintu w Podstawowym podaje „przy wysiłku do wyczerpania 7–8 razy”. | Łamie decyzję a): 7–8× miało być tylko w Rozszerzonym. Podsumowanie nie zależy od poziomu, więc Rozszerzony tu przecieka. | Usunąć nawias, zostawić „4–6 razy” (zgodnie z hormonalnym). |
| 6 | średnia | rozrodczy | W Podstawowym widać liczbę „ES −0,06 (95% CrI od −0,16 do 0,04)”, bo w planszy są tylko 4 liczby i do limitu wpadła liczba `secondary`. Ta sama reguła wpuszcza liczbę `secondary` na powłokowym. | Przedział wiarygodności z modelu bayesowskiego to materiał dla studenta. | Zmienić tier na `student`. Regułę „uzupełniaj do 4 liczbami `secondary`” stosować tylko wtedy, gdy liczba jest szkolna. |
| 7 | średnia | rozrodczy | Sprawdzone podsumowanie sprintu (testosteron, REDs) nigdy się nie wyświetla, bo karta wymusza spoczynek. Podtytuł obiecuje „czego o wpływie sprintu nie wiadomo”. | Obietnica z podtytułu nie ma pokrycia w tekście. | Dokleić to zdanie do opisu karty albo pokazać je pod nim jako „Co wiadomo o wysiłku”. |
| 8 | średnia | nerwowy ↔ hormonalny | Adrenalina rośnie 7× na nerwowym (0,2 → 1,4), a na hormonalnym „ponad 12×” i „kilkanaście razy”. Wyjaśnienie jest tylko na hormonalnym. | Uczeń, który przechodzi między planszami, widzi sprzeczność. | Na nerwowym dopisać: „przy dłuższym ciężkim wysiłku ponad 12× (plansza hormonalna)”. |
| 9 | średnia | kostny, moczowy, rozrodczy, mięśniowy (mleczan) | Dopiski „W badaniu: …” mają po 4–6 wierszy, a w kolorze bursztynowym są wyraźniejsze niż sama liczba. Zawierają ACSM, OBLA, „próg kompensacji oddechowej”, n = 15. Nawiasy „(w badaniu: …)” siedzą też w środku podsumowań (oddechowy, mózg, rozrodczy). | Ważne zastrzeżenie przytłacza samą wiedzę. | W Podstawowym dopisek najwyżej 8–10 słów („W badaniu: dłuższy, ciągły wysiłek na rowerze”), pełny tylko w Rozszerzonym. Nawiasy z podsumowań przenieść do liczb. |
| 10 | średnia | wiele plansz | Skróty bez rozwinięcia w Podstawowym: T., Ż., m., mm. (krwionośny, mięśniowy), LAD, ACTH, „oś stresu”, IIa/IIx, ATP, HR, Wingate, cykloergometr, USG, „próg mleczanowy”. | Według §3.5 skróty powinny być rozwinięte albo ich nie ma. | W Podstawowym pełne słowa: „Tętnica udowa”, „Mięsień prosty uda”. Bez LAD. ACTH rozwinąć: „hormon pobudzający nadnercza”. Typ IIx opisać: „szybkie włókna”. |
| 11 | średnia | moczowy, powłokowy, oddechowy | Podsumowania sprintu mają 6–8 zdań. Na moczowym zdanie o mleczanie w moczu stoi dwa razy. | Licealista nie doczyta tekstu, który powtarza to samo. | Najwyżej 4 zdania, jedna myśl na zdanie, bez powtórzeń. |
| 12 | niska | kostny, hormonalny, mięśniowy | Na kostnym rola jest identyczna w obu stanach i powtarza nazwę („Kość udowa – Kość uda: …”). Tarczyca jest podpisem `primary` bez roli. Mięsień piszczelowy przedni nie ma roli nawet w sprincie. | Takie podpisy nic nie uczą. | Zmienić je na `secondary` albo dopisać rolę, która różni się między stanami. |
| 13 | niska | moczowy, powłokowy | „100% → ok. −30%” miesza wartość ze zmianą. Na powłokowym rola naczyń skóry w spoczynku to „Węższe”, czyli opis startu wysiłku. | Taki zapis myli. | „100% → ok. 70%”. Dla skóry w spoczynku: „Umiarkowany przepływ”. |
| 14 | niska | UI | „1 liczba czeka na sprawdzenie źródła i **nie są pokazywane**” (błąd składni). Komunikat o procesie stoi w Podstawowym. | Szum i błąd językowy. | „…i nie jest pokazywana”. W Podstawowym komunikat ukryć. |
| 15 | niska | telefon (390) | Przełącznik stanu i podsumowanie są dopiero pod wszystkimi obrazami (ok. 2000–3000 px). | Uczeń ogląda obrazy, nie wiedząc, jaki stan widzi. Pytanie „przewidź” nie ma gdzie się zmieścić. | Przyklejony przełącznik stanu nad obrazem. |

## Co jest dobre

- **Drabina dowodów słowami** jest zrozumiała dla laika: „U ludzi dobrze wiadomo”, „Najpewniej tak u ludzi”, „Pierwsze badania sugerują”, „Naukowcy się spierają”. Dopiski przy podpisach (limfatyczny: „Pierwsze badania sugerują”, akwaporyny: „model zwierzęcy”) uczą krytycznego czytania bez żargonu.
- **Nazwy szkolne** są zgodne z podstawą programową: „Układ moczowy (wydalniczy)”, „Układ dokrewny (hormonalny)”, „Wątroba (narząd docelowy)”, „Grasica (narząd limfatyczny)”.
- **Najlepsze plansze dydaktycznie:** krwionośna (krótkie zdania, krotności, pompa mięśniowa), limfatyczna (spoczynek wyjaśnia, czym jest limfa; spór naukowy opisany uczciwie), moczowa (wprost: „nerki przygaszone, to nie błąd”) i hormonalna (łańcuch nerw → nadnercze → adrenalina → wątroba).
- **Rozszerzony dodaje, a nie zmienia.** Ta sama liczba i ten sam opis dostają łacinę, cytat, protokół i pełne źródło. Jedyny przeciek to problem 5.
- Plansze rzetelnie pokazują **skale czasu**: kość („tygodniami i miesiącami”), skóra (minuty), odporność (1–2 h), REDs (tygodnie).

## Czy atlas uczy kolejności przyczyn?

**Częściowo, i tylko w tekście.** Łańcuchy przyczyn są w podsumowaniach: hormonalny, krwionośny, moczowy („bo układ współczulny zwęża naczynia”) i limfatyczny („adrenalina odrywa komórki”). Interfejs pokazuje jednak dwa stany bez osi czasu i bez przejść między planszami. Dopisek „(plansza hormonalna)” na moczowym nie jest linkiem. Uczeń nie dowie się, co dzieje się w 1. sekundzie, a co w 1. minucie.

## Rekomendacja dla następnego etapu dydaktycznego

1. **Najpierw poprawki treści (szybkie, bez nowych renderów):** problemy 1, 5, 6, 8 i 14 oraz skrócenie dopisków i podsumowań (9–11).
2. **Ścieżka faktów podręcznikowych dla spoczynku** (status `anatomy` z cytatem z podręcznika szkolnego), żeby wypełnić problemy 2–4. Fakty sprawdza drugi agent tak jak dotąd.
3. **Na każdej planszy krótki łańcuch „Co się dzieje najpierw” (3 kroki)** z etykietą czasu (s / min / h / tyg.) i linkami do sąsiednich plansz. To most do przewodnika „Jeden interwał”.
4. **Przewodnik R1-b z pytaniem „przewidź”.** Proponuję zacząć od krwionośnego i moczowego: ich kontrasty spoczynek → sprint są najbardziej wyraźne i sprawdzone (tętno, przepływ do mięśni, przepływ przez nerki).
5. **Test czytelności:** 3–5 licealistów albo agent w roli licealisty dostaje po jednej planszy i pytanie „co zmienia sprint i dlaczego?”. Kryterium zaliczenia: poprawna odpowiedź w 2 zdaniach bez przełączania na Rozszerzony.
