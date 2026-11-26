# M5: scenariusz filmu gabloty serca („Jak to działa”)

Stan na 2026-11-26. Autor: Reżyser. Odbiorca: Wizualizator (M5), agent faktów (bramka §3.6), integrator (zakładki panelu).
Poziom: **tylko Podstawowy** (§7 (g) 4). Bez kodu. Podstawa:
- klatki M1: `klatki_docelowe/A_serce_krwinki_w_jamach.jpg`, `C_wejscie_w_serce.jpg`;
- test M2: `docs/atlas_wizualizacja/M2_TEST_SERCA.md`, preset `m1`;
- kontrakt ruchu: spór 1, czyli **najwyżej 1 nowy ruch na krok, najwyżej 3 ruchy naraz**;
- tempo z karty stylu (`UX_POSIEDZENIE.md` §3.1).

## 0. Zasady scenariusza

- **Jeden nowy ruch na krok.** Ruchy z wcześniejszych kroków trwają dalej, najwyżej 3 naraz.
- **Kamera stoi w czasie kroku.** Zmienia ujęcie tylko w przejściu między krokami (1,2 s, ease-in-out), gdy żaden nowy ruch się nie zaczyna. Wtedy ruch kamery nie jest „drugim nowym ruchem”.
- **Czas kroku:** co najmniej max(4 s; 0,3 s × liczba słów podpisu + 1,5 s). Pauza ręczna i przycisk „Dalej”. Po ostatnim kroku nie ma pętli; jest „Powtórz” albo przejście do „Sprawdź się”.
- **Podpis:** 1–2 zdania w poziomie Podstawowym. Każde zdanie to **nowy tekst**, więc przechodzi bramkę faktów (§3.6) przed wdrożeniem. Przy kroku podaję fakty `checked_agent`, które już są, i twierdzenia podręcznikowe do sprawdzenia.
- **Ujęcie:** domyślnie przekrój czołowy przez 4 jamy, jak w klatce A i M2 (przód, ok. 85 mm, stencil, preset `m1`: ściana w barwie mięśnia, przekrój `#B44E56`, zastawki `#BAB4AA`, krwinki 2,6 mm z chipem „powiększone”).
- **Barwy krwi to umowa szkolna:** utlenowana `artery` (czerwień), odtlenowana `vein` (błękit). Legenda mówi to wprost: „kolor to umowa: krew odtlenowana jest w rzeczywistości ciemnoczerwona”. Ta informacja jest w „Więcej” i wymaga faktu podręcznikowego.
- **Liczby:** tylko z faktów `checked_agent` planszy krwionośnej. Wszystkie mają flagę `protocolMismatch` (wysiłek maksymalny, nie 45 s przy 88% VO₂max), więc podpis mówi „przy wysiłku maksymalnym”.
- **`prefers-reduced-motion`:** każdy krok to 2 stopklatki („przed” i „po” ruchu), przełączane przyciskiem, bez animacji.

## 1. Wejście (przed krokiem 1, nie jest krokiem filmu)

`OrganDive` według `BIOMOTION_ARCHITEKTURA.md` §4:
1. klik w serce w widoku krwionośnym 3D;
2. wjazd 1,2 s; ciało gaśnie ditheringiem do 0; okno kuliste wycina żebra (warunek Dyrygenta: w kadrze końcowym ciało ≤ 5% krycia albo wycięte);
3. ustawienie w studiu 0,9 s.

Kadr środkowy: klatka C. Kadr końcowy: ujęcie kroku 1.

## 2. Kroki

| # | Tytuł | Ujęcie | NOWY ruch | Ruchy trwające | Podpis (Podstawowy, do bramki faktów) | Uczeń ma zrozumieć | Fakty |
|---|---|---|---|---|---|---|---|
| **1** | Dwie połowy, dwie drogi | przekrój czołowy, 4 jamy (klatka A) | **krwinki płyną**: prawa połowa: żyły główne → prawy przedsionek → prawa komora → pień płucny (błękit); lewa: żyły płucne → lewy przedsionek → lewa komora → aorta (czerwień); gęstość równa w obu komorach (według objętości jam) | — | „Prawa połowa serca pompuje krew do płuc, a lewa do całego ciała. Przegroda nie pozwala obu strumieniom się zmieszać.” | serce to dwie pompy obok siebie; krążenie małe (płuca) i duże (ciało) | **nowe, podręcznik:** dwie połowy i krążenia; przegroda. Istniejące: `krwionosny.role.d_pulmonary_trunk.sprint` („Cały rzut serca przez płuca”) |
| **2** | Zastawki: tylko w jedną stronę | to samo | **zastawki otwierają się i zamykają** (wariant B: kształt `Valve_Open`, bo M2 pokazał, że jest tani); krwinki czekają przy zamkniętej zastawce (mnożnik fazy w `FlowParticles`) | krwinki | „Zastawki otwierają się tylko w jedną stronę. Dzięki nim krew nie cofa się, tylko płynie dalej.” | zastawka to zawór jednokierunkowy; widać, że krwinki stają, gdy zastawka jest zamknięta | **nowe, podręcznik:** rola zastawek (przedsionkowo-komorowe, półksiężycowate) |
| **3** | Skurcz: przedsionki, potem komory | to samo | **skurcz ścian** (`Atrial_Systole`, potem `Ventricular_Systole`); chip „ruch poglądowy”, bo wielkość skurczu nie ma jeszcze faktu; wyłączalny jedną wagą | krwinki, zastawki | „Najpierw kurczą się przedsionki i dopełniają komory krwią. Zaraz potem kurczą się komory i wypychają krew do tętnic.” | kolejność skurczu; zastawki i krwinki z kroków 1–2 „tłumaczą się” skurczem | **nowe, podręcznik:** kolejność skurczu przedsionków i komór (cykl pracy serca) |
| **4** | Automatyzm serca | **cięcie w przejściu** do bliższego ujęcia prawego przedsionka i przegrody (węzeł zatokowo-przedsionkowy i przedsionkowo-komorowy w kadrze) | **impuls**: jasny rdzeń (biel, sygnał) z poświatą `artery.light` rodzi się w węźle zatokowo-przedsionkowym, rozchodzi po przedsionkach, chwilę czeka w węźle przedsionkowo-komorowym i biegnie do komór; każdy impuls wyzwala znany skurcz z kroku 3. Węzły i drogi przewodzenia to **schemat-bryła** (materiał schematu, chip „schemat, bez skali”) | zastawki, skurcz; **krwinki zatrzymane** (widoczne, nieruchome), żeby naraz były najwyżej 3 ruchy | „Serce samo wytwarza impulsy do skurczu. Rodzą się w węźle zatokowo-przedsionkowym, dlatego mówimy o automatyzmie serca.” | serce nie czeka na rozkaz z mózgu do każdego uderzenia (P V.4.9 w uproszczeniu); impuls jest przed skurczem | **nowe, podręcznik:** automatyzm, węzeł zatokowo-przedsionkowy, kolejność przewodzenia; **punkt podstawy P V.4.9** z cytatem w `curriculumRef` |
| **5** | Sprint: szybciej i mocniej | powrót do ujęcia z kroków 1–3 (przejście 1,2 s) | **tempo cyklu rośnie** (`BioClock`): przełącznik momentu Spoczynek → Sprint; licznik w panelu (liczba-bohater) | krwinki znów płyną (więcej na uderzenie: gęstość ∝ objętość wyrzutowa, ok. 1,4×), zastawki, skurcz; **impuls wyłączony** (limit 3 ruchów) | „Przy wysiłku maksymalnym serce bije szybciej, do ok. 190 razy na minutę, i przy każdym uderzeniu wyrzuca więcej krwi. Pompuje wtedy ok. 20–25 litrów krwi na minutę zamiast ok. 5.” | dwa sposoby zwiększenia pracy serca: częściej i mocniej; rzut serca = tętno × objętość wyrzutowa (pojęcie w Rozszerzonym) | **istniejące `checked_agent`:** `krwionosny.metric.tetno_hr` (do ok. 190 /min), `.rest` (ok. 60), `objetosc_wyrzutowa` (ok. 90 → ok. 125 mL), `rzut_serca` (ok. 5 → 20–25 L/min); wszystkie `protocolMismatch` (wysiłek maksymalny) |
| **6** | Dokąd płynie ta krew | **odjazd kamery w przejściu** (1,2 s, wyjście `OrganDive` wstecz) do widoku krwionośnego; w czasie przejścia nic nowego się nie zaczyna | **strumień w ścianach naczyń** (`vascularFlowShader`, wyróżnik ROZDZIAŁ): nogi jaśniej i szybciej, jelita wolniej, mózg bez zmian | serce w ciele bije dalej w tempie sprintu (skurcz jako proxy w LOD); krwinki gabloty znikają z gablotą | „W sprincie większość krwi, ok. 80%, płynie do pracujących mięśni. W spoczynku dostają one mniej niż 20%.” | serce jest pompą całego ciała; w wysiłku krew zmienia adres (łącznik z wyróżnikiem ROZDZIAŁ) | **istniejące `checked_agent`:** `krwionosny.metric.udzial_miesni_w_przeplywie_krwi` (ok. 80%; spoczynek < 20%), `role.femoral.sprint`, `role.portal.sprint`, `role.carotid.sprint` |

Czasy kroków (wzór z §0, liczba słów podpisu):

| Krok | Czas |
|---|---|
| 1 | ≥ 6,3 s |
| 2 | ≥ 6,0 s |
| 3 | ≥ 6,6 s |
| 4 | ≥ 6,6 s |
| 5 | ≥ 10,2 s |
| 6 | ≥ 6,3 s |

Razem ok. 42 s bez pauz, plus wejście ok. 2,1 s.

## 3. „Sprawdź się” po filmie (zakładka panelu, 1 pytanie na podejście)

Typ „wskaż…” na modelu w przekroju, z wyborem przez GPU (ID w wierzchołku):
1. „Wskaż komorę, która pompuje krew do całego ciała.” (lewa komora)
2. „Wskaż zastawkę, przez którą krew wypływa do aorty.” (zastawka aortalna)
3. ↑/↓: „W sprincie objętość krwi wyrzucanej przy jednym uderzeniu: rośnie czy maleje?” (rośnie; fakt `objetosc_wyrzutowa`)

Odpowiedź zawsze z jednym zdaniem wyjaśnienia z faktu. Wyniki tylko w przeglądarce, bez kont (decyzja Dyrygenta).

## 4. Legenda „Jak czytać” (gablota serca)

| Symbol | Znaczenie |
|---|---|
| krwinka czerwona / niebieska | krew utlenowana / odtlenowana (kolor umowny; chip „powiększone”) |
| jasny punkt z poświatą | impuls, który uruchamia skurcz |
| bryła w jednolitym kolorze z chipem „schemat” | węzły i drogi przewodzenia narysowane jako schemat, bez skali |

## 5. Otwarte sprawy dla agenta faktów (przed M5)

Twierdzenia podręcznikowe do znalezienia z cytatem (`textbook_consensus`, zgodnie z rozstrzygnięciem Dyrygenta, pkt 8):
1. dwie połowy serca, krążenie małe i duże;
2. rola zastawek przedsionkowo-komorowych i półksiężycowatych;
3. kolejność skurczu przedsionków i komór;
4. automatyzm serca i węzeł zatokowo-przedsionkowy (oraz cytat punktu podstawy P V.4.9);
5. „krew odtlenowana jest ciemnoczerwona, a błękit to umowa” (do „Więcej”).

Bez tych faktów kroki 1–4 idą z samymi nazwami struktur (anatomia), bez zdań o funkcji. Wtedy film jest krótszy, ale nie wolno go wypełnić tekstem bez źródła.
