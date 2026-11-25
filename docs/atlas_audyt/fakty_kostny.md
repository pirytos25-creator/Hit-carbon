# Sprawdzenie faktów: plansza „Układ kostny” (kostny)

Agent sprawdzający fakty (niezależny, procedura §3.6 i §3.7 modelu architektonicznego), 2026-11-25.
Sprawdzany plik: `.claude/worktrees/atlas-kostny-0ebfd9/src/atlas/plates/kostny.ts` oraz wpisy `munro_1987`, `weyand_2000`, `sims_martin_2014`, `eriksen_2010` w `src/science/ScientificReferences.ts` tego samego worktree.
Nie otwierano raportów sesji ani `side-session-notes`. Żadnych innych plików nie zmieniano.

## Podsumowanie

| Status | Liczba | Pozycje |
|---|---|---|
| `checked_agent` | 11 | 1, 2, 4, 5, 7, 8, 9, 11, 12, 13, 14 |
| `disputed` | 3 | 6 (podtytuł), 10 (cykl przebudowy 3–4 mies.), 18 (krętarz większy) |
| `unverifiable` (w podanych źródłach) | 4 | 3, 15, 16, 17 (twierdzenia o drodze obciążenia przez kości: Munro ich nie zawiera) |

Najważniejsze:
- **Wszystkie 4 identyfikatory (PMID, DOI, PMCID) są poprawne** – tytuły, autorzy, rok, czasopismo i strony zgadzają się z PubMed.
- **Wszystkie 4 cytaty z Munro 1987 i cytat z Sims i Martin 2014 występują dosłownie** w źródle, a lokalizatory stron się zgadzają (Munro: s. 148–149 czas kontaktu, s. 151 impact peak i thrust maximum).
- **Cytat z Weyand 2000** odpowiada wierszowi tabeli 2, ale nie jest dosłowny: pominięto gwiazdkę przy 0.107 i dopisano własny nawias. Wartość jest poprawna, pole `quote` trzeba poprawić (wersja dosłowna niżej).
- **Spór merytoryczny 1:** „Przebudowa kości: cykl ok. 3–4 miesięcy”. Cytat mówi, że **3–4 miesiące to sama faza odbudowy**. Cały cykl to resorpcja ok. 3 tygodnie + odbudowa, a według drugiego podanego źródła (Eriksen 2010) cykl trwa ok. 200 dni w kości gąbczastej i ok. 120 dni (mediana) w kości zbitej. Słowo „cykl” jest błędne.
- **Protokół (§3.7):** 88% VO₂max u rekreacyjnie aktywnego 25-latka to bieg ok. **3,0–3,7 m/s**, czyli **dolny koniec** zakresu Munro (3–5 m/s). Cały zakres 2,5–2,8 × masa ciała zawyża górną granicę. Lepiej pasuje ok. 2,5–2,7 × masa ciała, kontakt 0,24–0,27 s, impact peak ok. 1,6–1,9 × masa ciała (z tabel 2 i 3 Munro dla 3,00–3,75 m/s). Szczegóły w części „Protokół”.

## Weryfikacja identyfikatorów (PubMed E-utilities, 2026-11-25)

| id | PMID | DOI | PMCID | Zgodność |
|---|---|---|---|---|
| munro_1987 | 3571295 | 10.1016/0021-9290(87)90306-x | – | OK: Munro CF, Miller DI, Fuglevand AJ. J Biomech 1987;20(2):147–55 |
| weyand_2000 | 11053354 | 10.1152/jappl.2000.89.5.1991 | – | OK: Weyand PG, Sternlight DB, Bellizzi MJ, Wright S. J Appl Physiol 2000;89(5):1991–9 |
| sims_martin_2014 | 24466412 | 10.1038/bonekey.2013.215 | PMC3899560 | OK: Sims NA, Martin TJ. Bonekey Rep 2014;3:481 |
| eriksen_2010 | 21188536 | 10.1007/s11154-010-9153-1 | PMC3028072 | OK: Eriksen EF. Rev Endocr Metab Disord 2010;11(4):219–27 |

Dostęp do pełnych tekstów: Weyand 2000 – pełny tekst wydawcy (journals.physiology.org); Sims i Martin 2014 oraz Eriksen 2010 – pełny tekst PMC; Munro 1987 – pełny tekst w skanie OCR artykułu (studylib.net, z nagłówkami stron 147–155), abstrakt z PubMed.

## Tabela faktów

Cytaty w tabeli to krótkie, dosłowne fragmenty (≤ 15 słów). BW = body weight (masa ciała).

| # | Fakt (dosłownie z planszy) | Źródło | Status | Cytat (fragment) | Lokalizator | Protokół / flaga | Uwaga |
|---|---|---|---|---|---|---|---|
| 1 | summary.sprint: „nacisk podłoża w szczycie ok. 2,5–2,8 razy większy niż ciężar ciała” | munro_1987 | `checked_agent` | „increased (p < 0.001) from 2.5 BW at 3.0 m s-1 to 2.8 BW” | s. 151, akapit „Thrust maximum”; tab. 3 (2.51–2.83 BW) | 3–5 m/s, pojedyncze kroki; dla 88% VO₂max pasuje dolny koniec (ok. 2,5–2,7) | Zgodne z cytatem. Szczyt „thrust” opisano dla osób lądujących na pięcie (17 z 20 badanych). |
| 2 | summary.sprint: „dotyka podłoża tylko ok. 0,2–0,27 s” | munro_1987 | `checked_agent` | „decreased (p < 0.001) from 270 to 198 ms as the running speed increased” | s. 148–149, akapit „Stance time”; tab. 2 | jw.; dla 88% VO₂max: ok. 0,24–0,27 s | W tab. 2 przy 5,00 m/s jest 199 ms, w tekście 198 ms (rozbieżność w samym źródle, bez wpływu na 0,20 s). |
| 3 | summary.sprint: „Nacisk biegnie w górę przez kości stopy, podudzia i uda do miednicy i kręgosłupa lędźwiowego” | munro_1987, sims_martin_2014 (summaryReferenceIds) | `unverifiable` | – (żadne z dwóch źródeł tego nie opisuje) | – | – | Twierdzenie poprawne anatomicznie i opisane na planszy jako ilustracja, ale nie pochodzi z Munro (tylko siły podłoża) ani z Sims i Martin. Oznaczyć jako wiedzę anatomiczną albo dodać źródło biomechaniczne. |
| 4 | summary.sprint: „Gęstość kości nie zmienia się po jednym treningu: kość przebudowuje się tygodniami i miesiącami.” | sims_martin_2014 | `checked_agent` | „resorption activity in a BMU … takes approximately 3 weeks” | Introduction, akapit 2 | długoterminowe, oznaczone poprawnie | Skala czasu potwierdzona. „Nie zmienia się po jednym treningu” to wniosek z tej skali, nie dosłowne zdanie źródła. Dopuszczalne. |
| 5 | protocolNotePl: „Siły podłoża zmierzono w biegu ze stałą prędkością 3–5 m/s (pojedyncze kroki), nie w naszym interwale.” | munro_1987 | `checked_agent` | „self-selected speeds ranging from 2.5 to 5.5 m s-1” | abstrakt; Materials and Methods s. 147–148 | trafny opis niezgodności | Dokładniej: prędkości wybierane samodzielnie, 2,5–5,5 m/s, normy przeliczone dla 3,00–5,00 m/s. „Stała prędkość” to próby z niemal stałą prędkością poziomą (odrzucano zmianę > 0,10 m/s). Można zostawić. |
| 6 | subtitlePl: „Ile waży każdy krok: nacisk podłoża na kości nogi” | munro_1987 (pośrednio) | `disputed` | „Ground reaction force (GRF) data were collected … during running stance” | abstrakt | – | Płyta mierzy siłę podłoża działającą na stopę, nie na kości. Sama plansza mówi to w notePl metryki 1 („a nie siła wewnątrz kości”). Podtytuł temu przeczy. Proponowana zmiana: „nacisk podłoża na stopę i droga obciążenia przez kości”. |
| 7 | Metryka „Szczyt nacisku podłoża na stopę”: 2,5–2,8 × masa ciała, measuredAt „jeden krok biegu, 35–50% czasu kontaktu stopy” | munro_1987 | `checked_agent` | „generally occurred between 35 and 50% of the total stance time” | s. 151, „Thrust maximum”; tab. 3 | flaga `protocolMismatch` trafna, ale niepełna (patrz „Protokół”) | Cytat autora dosłowny (z dokładnością do zapisu jednostki m s⁻¹ w OCR). Populacja w `protocolMismatch` zgodna: 20 mężczyzn, 25,4 ± 2,4 roku, 22,8 km/tydz., „adult male joggers”. |
| 8 | notePl metryki 1: „To siła, z jaką podłoże naciska na stopę (zmierzona płytą pomiarową), a nie siła wewnątrz kości. W biegu 3–5 m/s, im szybciej, tym więcej.” | munro_1987 | `checked_agent` | „all vertical GRF descriptor variables increased significantly with running speed” | s. 151, „Vertical ground reaction force” | – | Zgodne. |
| 9 | Metryka „Kontakt stopy z podłożem”: 0,20–0,27 s na krok, measuredAt „jeden krok biegu (siła pionowa > 16 N)”, notePl „0,27 s przy 3 m/s, 0,20 s przy 5 m/s” | munro_1987 | `checked_agent` | „defined as the period of time during which the vertical GRF exceeded 16 N” | s. 148–149, „Stance time”; tab. 2 | jw.; dla 88% VO₂max: 0,24–0,27 s | Cytat dosłowny, conversionNote poprawny. Uwaga do porównań: Weyand liczy kontakt od 0 N, Munro od 16 N. |
| 10 | Metryka „Przebudowa kości (po tygodniach)”: „cykl ok. 3–4 miesięcy” | sims_martin_2014, eriksen_2010 | `disputed` | „takes approximately 3 weeks and the formation response 3 to 4 months” | Sims i Martin: Introduction, akapit 2 | długoterminowe, oznaczone poprawnie | Cytat dosłowny, ale **3–4 miesiące to sama odbudowa, a nie cały cykl**. Cały cykl według tego cytatu to ok. 4–5 miesięcy. Eriksen 2010 (również na liście źródeł, bez cytatu na planszy): kość gąbczasta „lasts about 200 days”, kość zbita „median of 120 days” (rozdz. „The bone remodeling cycle”, akapit 2). Do wyboru: „odbudowa ok. 3–4 miesięcy” (Sims) albo „cały cykl ok. 4–7 miesięcy (120–200 dni)” z cytatem z Eriksena. Locator „s. 1” nie do potwierdzenia w wersji HTML PMC; „Introduction, akapit 2” się zgadza. |
| 11 | notePl metryki 3: „Po tygodniach i miesiącach: kość przebudowuje się w miejscach obciążanych. Jeden trening nie zmienia gęstości kości.” | sims_martin_2014 | `checked_agent` | „provides a crucial mechanism for adaptation to physical stress” | Introduction, akapit 2 | długoterminowe | Zgodne. Niuans: Sims i Martin piszą też, że miejsce przebudowy wybiera się „in response to damage, to change in loading or to remove old bone” (Initiation of bone remodeling), więc „w miejscach obciążanych” to uproszczenie, ale poprawne. |
| 12 | Metryka „Szczyt uderzenia piętą”: 1,6–2,3 × masa ciała, measuredAt „6–17% czasu kontaktu stopy”, notePl „u osób lądujących na pięcie (w butach do biegania)” | munro_1987 | `checked_agent` | „the impact peak generally occurred between 6 and 17% of the total stance” | s. 151, „Impact peak”; tab. 3 (1.57–2.32 BW) | jw.; dla 88% VO₂max: ok. 1,6–1,9 | Cytat dosłowny, wartości i populacja zgodne („own jogging shoes”). |
| 13 | Metryka „Dla porównania: sprint na maksa, kontakt stopy”: ok. 0,11 s na krok; `protocolMismatch` „średnio 9,25 m/s … 5 osób” | weyand_2000 | `checked_agent` (z poprawką pola `quote`) | „Level, 0° \| 0.350 ± 0.007 \| 0.107 ± 0.003* \| 0.457 ± 0.005” | tab. 2, wiersz „Level, 0°”; 9,25 m/s: tab. 1 | sprint maksymalny na bieżni z płytą, uprząż; flaga trafna | Wartość 0,107 ± 0,003 s (SE, n = 5) i 9,25 ± 0,37 m/s potwierdzone. Cytat autora nie jest dosłowny: brak gwiazdki przy 0.107, a nawias „(t sw, t c, t str [s]; means ± SE for 5 subjects)” to parafraza nagłówka i stopki. Proponowany cytat dosłowny w liście poprawek. Płeć tych 5 osób nie jest podana (badanie obejmowało kobiety i mężczyzn), więc „5 osób” jest poprawnym opisem. |
| 14 | notePl metryki 5: „Przy maksymalnej prędkości stopa dotyka podłoża dwa razy krócej niż w szybkim biegu.” | weyand_2000 + munro_1987 | `checked_agent` | – (wyliczenie: 0,198 s / 0,107 s ≈ 1,9) | Weyand tab. 2; Munro tab. 2 | – | Przy 5 m/s: ok. 1,9 razy, przy 3 m/s: ok. 2,5 razy. „Ok. dwa razy” jest uczciwe. Progi kontaktu są różne (0 N u Weyanda, 16 N u Munro), co lekko zaniża różnicę. |
| 15 | Kość udowa, role.sprint: „Przy każdym lądowaniu przenosi nacisk z podudzia do miednicy” (roleStatus draft, ref. munro_1987) | munro_1987 | `unverifiable` | – (Munro nie opisuje sił w kościach) | – | – | Treść poprawna biomechanicznie, ale Munro mierzy tylko siłę podłoża. Zmienić roleStatus na `anatomy` albo podać źródło o obciążeniu kości (np. pomiary sił w stawie biodrowym w biegu). |
| 16 | Kość piszczelowa, role.sprint: „Główna kość podudzia: niesie nacisk podłoża w górę” (draft, munro_1987) | munro_1987 | `unverifiable` | – | – | – | Jak w poz. 15. |
| 17 | Kość piętowa, role.sprint: „U lądujących na pięcie przyjmuje pierwsze uderzenie” (draft, munro_1987) | munro_1987 | `unverifiable` | – (Munro: rear-foot strike = kontakt w tylnej 1/3 długości stopy) | s. 148, Materials and Methods | – | Munro definiuje lądowanie na pięcie i impact peak, ale nie wymienia kości piętowej. Wniosek anatomiczny jest poprawny. Zmienić roleStatus na `anatomy` albo zostawić draft z innym źródłem. |
| 18 | Krętarz większy, role: „Przyczep mięśni pośladkowych” (anatomy) | – (anatomia) | `disputed` | – | – | – | Nieprecyzyjne: do krętarza większego przyczepiają się mięśnie pośladkowy średni i mały (oraz gruszkowaty, zasłaniacze, bliźniacze). Pośladkowy wielki przyczepia się do guzowatości pośladkowej i pasma biodrowo-piszczelowego. Proponowane: „Przyczep mięśni pośladkowych średniego i małego”. |

### Pozostałe podpisy ze statusem `anatomy` (przejrzane, bez zastrzeżeń merytorycznych)

Kość miedniczna („przekazuje nacisk z nogi na kręgosłup”), staw kolanowy i łąkotki („rozkładają nacisk”), rzepka („kość w ścięgnie mięśnia czworogłowego”), kość strzałkowa, kość ramienna („nie dźwiga ciężaru ciała”), kręgosłup lędźwiowy, krążek międzykręgowy, kość krzyżowa, głowa kości udowej, kość skokowa, istota zbita, istota gąbczasta („w oczkach szpik czerwony”: w bliższym końcu kości udowej szpik czerwony u dorosłych zwykle się utrzymuje, więc poprawne), jama szpikowa („u dorosłych szpik żółty”), głowa kości udowej w przekroju („cienka warstwa zbita”), pasmo beleczek ściskanych („od ściany przyśrodkowej szyjki do głowy”).
Pasmo beleczek rozciąganych („łuk od ściany bocznej nad szyjką do głowy”): kierunek poprawny. Dokładniej: zaczyna się w istocie zbitej bocznej poniżej krętarza większego, przechodzi łukiem przez górną część szyjki i kończy w dolnej części głowy. Drobna nieścisłość, bez sporu.

## Nazwy anatomiczne (TA2 / polskie mianownictwo)

| Podpis | Polska | Łacińska | Ocena |
|---|---|---|---|
| femur | Kość udowa | femur | OK (TA: femur; os femoris) |
| tibia | Kość piszczelowa | tibia | OK |
| hip_bone | Kość miedniczna (miednica) | os coxae | Nazwy OK. Dopisek „(miednica)” nieścisły: miednica (pelvis) to obie kości miedniczne, kość krzyżowa i guziczna. Lepiej „Kość miedniczna” bez nawiasu albo „(część miednicy)”. |
| knee | Staw kolanowy (łąkotki) | articulatio genus, menisci | OK (meniscus medialis / lateralis) |
| patella | Rzepka | patella | OK |
| fibula | Kość strzałkowa | fibula | OK |
| humerus | Kość ramienna | humerus | OK |
| lumbar | Kręgosłup lędźwiowy | vertebrae lumbales L1–L5 | OK (TA: vertebrae lumbales [L I–L V]); polska nazwa opisuje odcinek kręgosłupa, łacińska kręgi. Dopuszczalne. |
| disc | Krążek międzykręgowy | discus intervertebralis L4–L5 | OK |
| calcaneus | Kość piętowa | calcaneus | OK |
| sacrum | Kość krzyżowa | os sacrum | OK |
| femoral_head, d_head | Głowa kości udowej | caput femoris | OK |
| talus | Kość skokowa | talus | OK |
| d_cortex | Istota zbita | substantia compacta | OK |
| d_spongy | Istota gąbczasta (beleczki) | substantia spongiosa | OK (TA: substantia spongiosa / trabecularis) |
| d_marrow | Jama szpikowa | cavitas medullaris | OK |
| d_trochanter | Krętarz większy | trochanter major | OK |
| d_compressive | Pasmo beleczek ściskanych | fasciculus compressivus principalis | **Brak w TA/TA2.** Łacina to neologizm. W literaturze funkcjonuje angielska nazwa kliniczna „principal compressive group” (klasyfikacja Singha). Usunąć nazwę łacińską albo oznaczyć jako opisową. |
| d_tensile | Pasmo beleczek rozciąganych | fasciculus tensorius principalis | **Brak w TA/TA2**, jak wyżej („principal tensile group”). |

## Protokół wzorcowy (§3.7) a dane Munro 1987

- Protokół: 45 s przy ok. 88% VO₂max, mężczyzna ok. 25 lat, rekreacyjnie aktywny.
- Szacunek prędkości (równanie metaboliczne ACSM dla biegu: VO₂ = 0,2 × v [m/min] + 3,5 ml/kg/min). To szacunek agenta, nie fakt na ekran:
  - VO₂max 45 ml/kg/min → 88% = 39,6 → v ≈ 180 m/min ≈ **3,0 m/s** (10,8 km/h);
  - VO₂max 50 → 44,0 → v ≈ 203 m/min ≈ **3,4 m/s** (12,2 km/h);
  - VO₂max 55 → 48,4 → v ≈ 225 m/min ≈ **3,7 m/s** (13,5 km/h).
- Wniosek: wzorcowy interwał to bieg ok. 3,0–3,7 m/s, czyli **dolna część** zakresu Munro (3–5 m/s). Górna połowa zakresu (4–5 m/s) to tempo szybsze niż wzorzec. Odpowiednie wartości z tabel Munro (3,00–3,75 m/s):

| Wielkość | Cały zakres na planszy (3–5 m/s) | Zakres zgodny z 88% VO₂max (3,00–3,75 m/s) | Lokalizator |
|---|---|---|---|
| Thrust maximum | 2,5–2,8 BW | 2,51–2,67 BW (ok. 2,5–2,7) | tab. 3 |
| Impact maximum | 1,6–2,3 BW | 1,57–1,86 BW (ok. 1,6–1,9) | tab. 3 |
| Czas kontaktu | 0,20–0,27 s | 0,270–0,238 s (ok. 0,24–0,27) | tab. 2 |

- Obecne pola `protocolMismatch` opisują protokół źródła trafnie (pojedyncze kroki, 3–5 m/s, brak % VO₂max), ale nie mówią, która część zakresu odpowiada wzorcowi. Brakuje też uwagi, że pomiar był w stanie wypoczętym, a nie pod koniec 45 s pracy w późniejszym interwale. Siły podłoża przy stałej prędkości zależą głównie od prędkości, więc to drobna różnica, ale warto ją wpisać.
- Etykieta „sprint” przy 3,0–3,7 m/s jest myląca dla odbiorcy (to szybki bieg, nie sprint). To decyzja nazewnicza modelu, nie fakt, więc tylko odnotowuję.
- Weyand 2000 (sprint maksymalny 9,25 m/s) jest słusznie podany jako „dla porównania” z flagą.

## Kolejność w czasie (`measuredAt`)

- Metryki 1, 2, 4: pojedynczy krok, fazy kontaktu (impact 6–17%, thrust 35–50% czasu kontaktu). Kolejność impact → thrust zgodna ze źródłem.
- Metryka 3 (przebudowa) jest poprawnie oznaczona jako adaptacja długoterminowa („tygodni i miesięcy, nie efekt jednego sprintu”). Podsumowanie też mówi to jasno.
- Metryka 5: kroki przy prędkości maksymalnej na bieżni. Opis poprawny.

## Do poprawy przez autora

1. **`metrics[2]` (Przebudowa kości), pole `sprint` / `labelPl`:** „cykl ok. 3–4 miesięcy” → „odbudowa ok. 3–4 miesięcy” (zgodnie z cytatem Sims i Martin) **albo** „cały cykl ok. 4–7 miesięcy” z cytatami z Eriksen 2010: „In cancellous bone remodeling occurs on the surface of trabeculae and lasts about 200 days in normal bone.” oraz „…the duration of the remodeling cycle in cortical is shorter than in cancellous bone with a median of 120 days” (Eriksen 2010, rozdz. „The bone remodeling cycle”, akapit 2). Teraz `eriksen_2010` jest w `referenceIds` bez cytatu: albo dodać cytat, albo usunąć odwołanie. Poprawić też `conversionNote`.
2. **`metrics[4]` (Weyand), pole `quote`:** zastąpić dosłownym wierszem: `Level, 0° | 0.350 ± 0.007 | 0.107 ± 0.003* | 0.457 ± 0.005`. Opis kolumn i n = 5 przenieść do `locator`, np. „Weyand 2000, tab. 2 (t sw, t c, t str w s; średnia ± SE, 5 osób), wiersz „Level, 0°””. (Zgodnie z §3.6 pkt 1 agent może zmienić pole cytatu; tu tylko proponuję, bo nie wolno mi edytować plików.)
3. **`subtitlePl`:** „nacisk podłoża na kości nogi” → np. „nacisk podłoża na stopę i jego droga przez kości nogi” (spójność z notePl metryki 1).
4. **`labels` femur, tibia, calcaneus (`roleStatus.sprint: 'draft'`, `referenceIds: ['munro_1987']`):** Munro nie zawiera tych twierdzeń. Zmienić `roleStatus.sprint` na `'anatomy'` i usunąć `munro_1987` z `referenceIds` albo podać źródło o obciążeniu kości lub stawów w biegu.
5. **`summary.sprint`, zdanie o drodze nacisku przez kości:** nie wynika z `munro_1987` ani `sims_martin_2014`. Oznaczyć jako wiedzę anatomiczną (np. rozbić podsumowanie albo dopisać, że to ilustracja anatomiczna bez źródła liczbowego).
6. **`labels` d_trochanter, `role`:** „Przyczep mięśni pośladkowych” → „Przyczep mięśni pośladkowych średniego i małego”.
7. **`labels` d_compressive, d_tensile, `nameLat`:** „fasciculus compressivus principalis” / „fasciculus tensorius principalis” nie występują w TA/TA2. Usunąć albo oznaczyć jako nazwę opisową (np. „principal compressive / tensile group, Singh”).
8. **`labels` hip_bone, `namePl`:** „Kość miedniczna (miednica)” → „Kość miedniczna” (miednica to cały pierścień kostny).
9. **`protocolMismatch` metryk 1, 2, 4 (i `protocolNotePl`):** dopisać, że wzorzec (88% VO₂max, rekreacyjny 25-latek) odpowiada ok. 3,0–3,7 m/s, czyli dolnej części zakresu. Rozważyć zawężenie wartości na ekranie do ok. 2,5–2,7 × masa ciała, 0,24–0,27 s i 1,6–1,9 × masa ciała (tab. 2 i 3 Munro, 3,00–3,75 m/s), z nowymi cytatami z tabel. Dopisać też: „pomiar w stanie wypoczętym, nie pod koniec 45 s pracy”. Opcjonalnie: „prędkości wybierane samodzielnie 2,5–5,5 m/s, normy dla 3–5 m/s”.
10. Drobne, opcjonalne: przy metryce 1 dopisać, że szczyt „thrust” opisano dla osób lądujących na pięcie (17 z 20 badanych).
