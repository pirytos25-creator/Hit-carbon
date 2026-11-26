# Runda końcowa: lista do niezależnej kontroli (zgromadzenie, pkt D2)

Wygenerowano: `node scripts/atlas_check_facts.mjs --drafts` po commitach 07ce653–db22aac (integrator). Na ekranie żadna z tych pozycji się nie pokazuje (status `draft`).

## 1. Nowe brzmienia i zdania bez statusu (12)

| plansza | rodzaj | klucz | nowa treść | źródła | lokalizator | cytat |
|---|---|---|---|---|---|---|
| miesniowy | opis podpisu (sprint) | deltoid (M. naramienny) | Wymach ramion równoważy obrót nóg (symulacja komputerowa, 1 biegacz) | hamner_2010 |  |  |
| krwionosny | opis podpisu (sprint) | saphenous (Ż. odpiszczelowa) | Spływa do żył głębokich, które pompa mięśniowa opróżnia szybciej | joyner_casey_2015 |  |  |
| hormonalny | zdanie o „sprincie” (protocolNotePl) | protocolNotePl | Sprint na tej planszy to koniec 45 s pracy przy ok. 88% VO₂max. Liczby pochodzą z badań ciągłego wysiłku przy 80–87% VO₂max, z 30 s sprintu maksymalnego albo z krótkiego biegu do wyczerpania, więc dla jednego interwału są tylko przybliżeniem. Liczby pochodzą z późniejszych interwałów (po kilku minutach sesji). |  |  |  |
| powlokowy | liczba | Ciepło oddane w odpoczynku po wysiłku (tak długim jak wysiłek) | — → 30–50 % ciepła zebranego w wysiłku (notatka: Dotyczy odpoczynku po wysiłku trwającym kilkanaście do kilkudziesięciu minut, nie krótkich przerw 45 s między interwałami. W badaniu Kenny 2008 po 60 min wysiłku i 60 min odpoczynku oddało się 53% ciepła.) | kenny_mcginn_2017, kenny_2008 | Kenny i McGinn 2017, rozdz. „Postexercise Thermoregulatory Control”, akapit 1 (cytat z indeksu wyszukiwarki Exa; pełny tekst wydawcy jest zablokowany dla automatów) | only 30–50% of the heat gained during exercise is lost during a recovery of similar duration (based on 1:1 work to rest ratio) |
| powlokowy | opis podpisu (spoczynek) | vessels_sup (Naczynia krwionośne skóry) | Umiarkowany przepływ | gonzalez_alonso_2008, johnson_1992 |  |  |
| powlokowy | zdanie o „sprincie” (protocolNotePl) | protocolNotePl | Naczynia skóry zwężają się już w pierwszych sekundach wysiłku, ale chłodzenie przez skórę (rozszerzone naczynia, obfity pot) rozkręca się w minutach. Dlatego „Sprint” na tej planszy to koniec treningu 6 × (45 s pracy / 45 s przerwy), a nie pojedyncze 45 s. |  |  |  |
| pokarmowy | zdanie o „sprincie” (protocolNotePl) | protocolNotePl | Sprint w atlasie to koniec 45 s pracy przy ok. 88% VO₂max (6 × 45 s pracy / 45 s przerwy). Badania wątroby i trzewi mierzyły zwykle wysiłek ciągły, kilkunastominutowy, więc liczby są przybliżeniem. Liczby pochodzą z późniejszych interwałów (po kilku minutach sesji). |  |  |  |
| wydalniczy | zdanie o „sprincie” (protocolNotePl) | protocolNotePl | Sprint to koniec 45 s pracy przy ok. 88% VO₂max. Badania nerek mierzyły zwykle dłuższy wysiłek albo stan tuż po nim, więc liczby pokazują kierunek zmian, nie dokładną wartość dla jednej serii. |  |  |  |
| kostny | zdanie o „sprincie” (protocolNotePl) | protocolNotePl | Sprint = koniec 45 s szybkiego biegu przy ok. 88% VO₂max (to ok. 3,0–3,7 m/s, szacunek). Siły podłoża zmierzono w pojedynczych krokach biegu ze stałą prędkością 3–5 m/s, w stanie wypoczętym, nie w naszym interwale. |  |  |  |
| limfatyczny | zdanie o „sprincie” (protocolNotePl) | protocolNotePl | „Sprint” to koniec 45 s pracy przy ok. 88% VO₂max. Liczby pochodzą z badań o innych protokołach (opis przy każdej liczbie). „Po” to 1 godzina po wysiłku. |  |  |  |
| rozrodczy | zdanie o „sprincie” (protocolNotePl) | protocolNotePl | To karta budowy, a nie plansza ze stanami: „sprint” (koniec 45 s pracy przy ok. 88% VO₂max) nie zmienia tu obrazu. |  |  |  |
| (wspólne) | słowniczek | vo2max | VO₂max to największa ilość tlenu, jaką organizm potrafi zużyć w ciągu minuty w wysiłku maksymalnym; mierzy się ją w teście na bieżni albo rowerze. | kaminsky_2015 |  |  |

## 2. Uwagi walidatora D1: liczba z faktu nie występuje w cytacie, a fakt nie ma `conversionNote`

Walidator szuka liczby w cytacie dosłownie; część to zapis słowny w źródle (np. „seven- to eightfold”). Do oceny przez sprawdzającego: albo cytat jest wystarczający, albo potrzebny `conversionNote`.

  - miesniowy / liczba „Zapotrzebowanie mięśni na ATP”: 1000
  - mozg / liczba „Pobór glukozy przez mózg (PET)”: 30
  - mozg / liczba „Utlenowanie kory przedczołowej (NIRS)”: 88
  - oddechowy / liczba „Objętość oddechowa”: 3
  - oddechowy / liczba „Tlen zużywany przez mięśnie oddechowe”: 15
  - krwionosny / liczba „Przepływ wieńcowy”: 3, 5, 1
  - hormonalny / liczba „Glukoza wypuszczana do krwi (głównie z wątroby)”: 6
  - hormonalny / liczba „Kortyzol we krwi”: 30
  - powlokowy / liczba „Parowanie potu 10 min po wysiłku”: 23
  - pokarmowy / liczba „Tempo oddawania glukozy do krwi”: 6
  - pokarmowy / liczba „Tempo oddawania glukozy: wysiłek do wyczerpania”: 7, 8, 1
  - pokarmowy / liczba „Glukoza we krwi zaraz po interwałach 8 × 60 s”: 6.6
  - wydalniczy / liczba „Przepływ nerkowy przy 60% VO₂peak (pomiar w trakcie)”: 100
  - wydalniczy / liczba „Frakcja filtracyjna (część osocza przesączona w kłębuszku)”: 2, 1
  - limfatyczny / liczba „Limfocyty we krwi”: 4.0, 2.3
  - limfatyczny / liczba „Odpływ limfy z pracującego mięśnia”: 3, 6, 1

## 3. Pozycje przyjęte regułą ostatniej rundy (do ponownej kontroli wg D2)

9 spornych pozycji z `fakty_koncowe_B_horm_mocz_pokarm.md` i `fakty_koncowe_C_reszta_i_kontrola.md`, poprawionych brzmieniem sprawdzającego: hormonalny „Insulina po wysiłku”; pokarmowy „Przepływ krwi przez wątrobę”, „Spadek przepływu: pień trzewny / t. krezkowa górna”, d_portal (sprint), podsumowanie sprintu; moczowy collecting_duct (sprint), podsumowanie sprintu; limfatyczny „Otwarte okno”; rozrodczy podsumowanie sprintu.
