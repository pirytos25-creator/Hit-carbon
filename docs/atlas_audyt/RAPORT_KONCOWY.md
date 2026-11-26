# Atlas układów: raport końcowy Dyrygenta

Data: 2026-11-26. Gałąź `atlas-uklady` (wszystko zatwierdzone lokalnie, **bez wysyłania na serwer**).
Ten raport jest dla Ciebie – prostym językiem. Szczegóły techniczne są w audytach w tym folderze.

## 1. Co jest gotowe

**Atlas ma 12 plansz** – wszystkie układy ciała w dwóch stanach: spoczynek i sprint HIIT (protokół wzorcowy: 6 × 45 s pracy przy ok. 88% VO₂max / 45 s przerwy).

| Grupa | Plansze |
|---|---|
| Sterowanie | nerwowy, mózg, dokrewny (hormonalny) |
| Napęd | mięśniowy, kostny |
| Zaopatrzenie | oddechowy, krwionośny, pokarmowy (z wątrobą) |
| Równowaga | skóra (powłokowy), moczowy (wydalniczy), limfatyczny |
| Inne | rozrodczy (karta bez stanów, rzeczowa, obie płcie) |

Każda plansza ma:
- render z Blendera na prawdziwych modelach anatomicznych (Z-Anatomy, HuBMAP) i zbliżenie (np. nefron, przekrój kości udowej, węzeł chłonny);
- podpisy czytelne na komputerze i telefonie (na telefonie numerowane pinezki i lista, przełącznik stanu przyklejony u dołu ekranu);
- **dwa poziomy**: „Podstawowy” (laik, licealista: szkolne nazwy, najwyżej 4 liczby) i „Rozszerzony” (student: łacina, cytaty, źródła, opisy badań);
- strzałki przepływu (krew, limfa, impulsy nerwowe, hormony, ciepło, mocz, siła) z legendą i różnym wzorem kreski;
- licencje źródeł w stopce.

**Fakty:** na ekranie są wyłącznie liczby i zdania, dla których niezależny agent znalazł **dosłowny cytat w źródle** (PubMed/DOI) – ok. 70 liczb i ponad 160 opisów działania struktur. Liczby z innego treningu niż nasz mają dopisek „W badaniu: …”. W poziomie Rozszerzonym widać przy źródle uczciwy dopisek: „sprawdzone przez agenta AI z dosłownym cytatem (nie przez eksperta)”.

### Jak uruchomić
W folderze projektu:
```
npm run dev
```
Otworzy się przeglądarka; dopisz do adresu `#atlas` (np. `http://localhost:5173/#atlas`).

## 2. Jak to powstało
- **Integrator** scalił 5 plansz z fazy 1, zbudował wspólny kod (jedno dopasowanie modeli HuBMAP do szkieletu z błędem ok. 1,6 cm, blokada modeli z licencją niekomercyjną, podpisy HTML, paleta kolorów odporna na daltonizm, walidatory) i zrobił krwionośny z ok. 650 prawdziwych naczyń.
- **Siedmiu agentów układów** zrobiło po jednej planszy, każdy w trzech częściach z audytem Dyrygenta po każdej (punkty K1–K3).
- **Fakty** sprawdzało łącznie kilkanaście niezależnych agentów (żaden nie sprawdzał własnej pracy), w kilku rundach, plus kontrola wyrywkowa.
- **Zgromadzenie** pięciu recenzentów (anatom-fizjolog, architekt 3D, dydaktyk, strażnik faktów, strażnik dostępności i licencji) oceniło całość w dwóch rundach. Decyzja: przyjęte z jedną ostatnią rundą poprawek – wykonaną.
- Wszystkie audyty: `docs/atlas_audyt/`; decyzja zgromadzenia: `docs/atlas_audyt/zgromadzenie/DECYZJA_KONCOWA.md`.

## 3. Co sprawdzono, a czego nie

**Sprawdzone (dowodami, nie deklaracjami):**
- build przechodzi; walidator atlasu przechodzi (kolory, położenie 200 kotwic podpisów z dokładnością do ułamka piksela, rozmiary obrazów, fakty);
- Dyrygent sam obejrzał zrzuty wszystkich 12 plansz na ekranie 1440 px i telefonie 390 px – konsola przeglądarki bez błędów, bez przewijania w poziomie;
- każdy fakt na ekranie ma cytat ze źródła sprawdzony przez drugiego agenta; kontrola wyrywkowa liczb: 25/25 zgodnych; kontrola końcowa: patrz §3a;
- modele z licencją niekomercyjną (nerka i ucho wewnętrzne Z-Anatomy) są zablokowane w kodzie i nie ma ich w żadnym renderze.

**Niesprawdzone:**
- żaden człowiek-ekspert (fizjolog, nauczyciel biologii) nie przejrzał treści – status „sprawdzone przez agenta AI”;
- nie było testu z prawdziwymi użytkownikami (licealistami);
- część źródeł agenci znali tylko z abstraktu (pełny tekst za płatną barierą albo zablokowany dla automatów); dwa wyjątki są jawnie opisane w danych (jeden cytat z indeksu wyszukiwarki, jedna tabela z publicznej kopii skanu);
- telefony fizyczne i Safari – tylko symulacja szerokości 390 px w Chrome.

### 3a. Kontrola końcowa (niezależny agent, `fakty_kontrola_koncowa.md`)
- **Wszystkie liczby na planszach zgodne ze źródłami.**
- 9 pozycji przyjętych wcześniej moją „regułą ostatniej rundy” (bez drugiego sprawdzenia) – sprawdzone od nowa: **9/9 zgodne**. Tym samym cała treść przeszła przez dwóch niezależnych agentów, tak jak chciałeś (§3.6).
- Losowa próba opisów działania struktur (≥ 10% z każdej planszy): **23/23 zgodne** i pasujące do podpisanej struktury.
- 4 nowe zdania objaśniające (3 o „sprincie”, 1 opis spoczynku skóry) okazały się nieścisłe albo niesprawdzalne – **są ukryte**; w ich miejscu jest neutralna informacja.
- Kontrola znalazła 2 błędy w programie sprawdzającym fakty – naprawione.
- Stan końcowy (sprawdzony przez Dyrygenta po scaleniu): build przechodzi; walidator przechodzi – **71 liczb, 164 opisy działania, 162 opisy budowy, 21 podsumowań, 0 faktów niesprawdzonych na ekranie**; 24 zrzuty 12 plansz (1440 i 390 px) bez błędów konsoli. Walidator zgłasza jeszcze 3 uwagi „liczba nie występuje w cytacie dosłownie” (36 przy 36,1; 83 przy „+83%”; 6,9) – to zaokrąglenia, potwierdzone przez sprawdzającego.

## 4. Znane problemy (żaden nie blokuje)
- Mózg w poziomie Podstawowym ma mało opisów – większość opisów ról nie ma źródła z PMID/DOI, więc jest ukryta.
- Na kilku planszach w spoczynku brakuje wartości („—”) z tego samego powodu.
- Dwie pary kolorów strzałek są do siebie podobne przy daltonizmie (rozróżnia je wzór kreski i legenda).
- Strzałka krwi w przekroju mózgu to schemat (oznaczona „schemat drogi”), nie dokładny przebieg tętnic.
- Zbliżenia oddechowego, moczowego, skóry i limfatycznego leżą w Blenderze poza ciałem – na planszach niewidoczne, ważne dopiero dla 3D.
- Nazwy niektórych hormonów i typów włókien (ACTH, IIx) bywają nierozwinięte w opisach.
- Pomiar wydajności 3D (prototypy) zrobiono na wbudowanej karcie graficznej laptopa, nie na RTX.

## 5. Rekomendacja następnych etapów (kolejność)
1. **Decyzja dla Ciebie – fakty podręcznikowe.** Dziś na ekran trafiają tylko fakty z badań z numerem PMID/DOI. Przez to mózg i wartości spoczynkowe są ubogie. Zgromadzenie zaleca dopuścić **podręczniki z numerem ISBN** (np. OpenStax, StatPearls) z dosłownym cytatem i drugim sprawdzającym, oznaczone na ekranie jako „Wiedza podręcznikowa”. To zmienia Twoją wcześniejszą zasadę, więc decyzja należy do Ciebie.
2. **E1 – porządek w danych** (1–2 sesje): spis struktur i faktów w plikach JSON (jeden rekord na każdy fakt), automatyczna kontrola spójności liczb między planszami.
3. **E2′ – przewodnik „Jeden interwał”** (plan Reżysera, `docs/ATLAS_REZYSER_PLAN.md`): 90 s, kolejność przyczyn, pytania „przewidź, zanim zobaczysz” – na 2D, niezależnie od 3D.
4. **E3 – pierwsze 3D: prototyp P1 „Gablota”** (krwionośny i mięśniowy, obrót w poziomie, widoki kluczowe; zgodny z Twoją decyzją, ok. 5,6 MB, płynny). Najpierw krótki „kontrakt danych” 3D (ok. 1 sesja).
5. **E4 – „Scena Całość” (prototyp P2)** – później, gdy będą łańcuchy przyczyn i spełni budżet wydajności.
6. **Prototyp P3 (swobodna kamera, suwaki warstw)** – odrzucony, bo wyklucza go Twoja decyzja o 3D.
7. Test z 2–3 licealistami: jedna plansza, pytanie „co zmienia sprint i dlaczego?”.

Prototypy 3D leżą na gałęzi `claude/atlas-wizualizacja-3d-1dc29a` (niescalone; nie zmieniają atlasu).

## 6. Koszty i zasady
- Tylko darmowe narzędzia i źródła; jedno darmowe pobranie z oficjalnego HuBMAP (pęcherz żeński, CC BY 4.0).
- Nic nie wysłano na serwer (bez `git push`, bez PR).
- Przerwy: dwa razy limit użycia i trzy razy zerwany internet – stan był zapisywany na bieżąco (`docs/atlas_audyt/ZESPOL.md`), nic nie zginęło.
- Błędy Dyrygenta, opisane w audytach: jedno scalenie zatwierdzone z błędem składni (naprawione w kilka minut), jedna seria zrzutów ze strony błędu (powtórzona), reguła „ostatniej rundy” faktów omijająca drugie sprawdzenie (naprawiona niezależną kontrolą końcową).
