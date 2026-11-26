# Audyt faktów: plansza `limfatyczny`

Agent sprawdzający fakty (procedura §3.6 i §3.7 `docs/ATLAS_MODEL_ARCHITEKTONICZNY.md`). Data: 2026-11-26.
Plik planszy: `.claude/worktrees/atlas-limfatyczny-dcd0be/src/atlas/plates/limfatyczny.ts` oraz wpisy w `src/science/ScientificReferences.ts` tego samego worktree. Raportów autora ani notatek sesji nie czytałem. Plików planszy nie zmieniałem.

## Podsumowanie

- **Sprawdzonych faktów: 34.** Obejmują 2 podsumowania, 23 podpisy (rest/sprint liczone razem, gdy są identyczne) i 9 metryk z notatkami.
- **`checked_agent`: 11.** Jeden z nich jest oznaczony † i wymaga podmiany pola `quote` (wartość jest w źródle, ale nie w podanym cytacie).
- **`anatomy`: 18.** Opisy czysto anatomiczne są poprawne.
- **`disputed`: 4.** To podsumowanie spoczynku, przewód piersiowy w sprincie, węzły pachwinowe w sprincie i notatka do „otwartego okna”.
- **`unverifiable`: 1.** To grasica w sprincie („Brak danych…”, bez źródła).
- **`protocolMismatch`:** wszystkie 8 metryk liczbowych ma trafną flagę. Żadne źródło nie opisuje 6 × 45 s przy 88% VO₂max. Najbliżej jest Bogdanis 2022 (8 × 60 s przy 100% mocy VO₂max). Momenty `measuredAt` zgadzają się z literaturą: NK i limfocyty rosną w trakcie wysiłku i zaraz po nim, a spadają 1–2 h po nim. Śledziona jest najmniejsza zaraz po wysiłku i wraca do normy w ciągu 20 min.
- **Spory (`contested_debate`):** obie strony są zacytowane dosłownie i uczciwie. W sporze o śledzionę oba cytaty się zgadzają. W sporze o „otwarte okno” jest drobna nieścisłość („przez kilka godzin” nie występuje u Pedersena 1995). Dane zwierzęce (przewód piersiowy) są oznaczone w notatce, ale podpis przewodu piersiowego im przeczy.

**Najważniejsze rozbieżności:**
1. **Przewód piersiowy, sprint: „Odprowadza do krwi więcej limfy z nóg” (źródło: Havas 1997).** Havas mierzył tylko usuwanie znakowanej albuminy z mięśnia uda. Przewodu piersiowego nie mierzył. Notatka tej samej planszy mówi: „Przepływu w przewodzie piersiowym w wysiłku u ludzi nie zmierzono”. Podpis podaje wniosek jak pewny fakt.
2. **Podsumowanie spoczynku: „Komórki NK w większości czekają w ścianach naczyń, w śledzionie i w węzłach”.** Campbell 2018 mówi o „marginal pools” i odklejaniu od śródbłonka. Nie mówi „w większości”. Rola śledziony jest na tej samej planszy oznaczona jako sporna (Nielsen vs Baum). Zdanie „Limfa to płyn, który wycieka z naczyń krwionośnych do tkanek” opisuje płyn tkankowy, a nie limfę.
3. **Metryka „Spadek limfocytów −30 do −60%”.** Liczba jest w Campbell 2018, ale w innym zdaniu niż podany cytat. Walidator (§3.6 p. 5) jej nie znajdzie. Poprawny cytat podaję niżej.

## Weryfikacja źródeł (PubMed efetch, 2026-11-26)

| id w repo | PMID | DOI | Zgodność metadanych | Co czytałem |
|---|---|---|---|---|
| `nieman_1992` | 1470016 | 10.1249/00005768-199212000-00006 | tak: Nieman DC i in., Med Sci Sports Exerc 1992;24(12):1339–45 | abstrakt |
| `bogdanis_2022` | 35510255 (PMC9035712) | 10.1016/j.jesf.2022.03.005 | tak: Bogdanis GC i in., J Exerc Sci Fit 2022;20(3):216–23 | pełny tekst (PMC), tab. 1 |
| `stewart_2003` | 12482773 | 10.1152/japplphysiol.00040.2002 | tak: Stewart IB i in., J Appl Physiol 2003;94(4):1619–26 | pełny tekst (wydawca), tab. 2 |
| `campbell_turner_2018` | 29713319 (PMC5911985) | 10.3389/fimmu.2018.00648 | tak: Campbell JP, Turner JE, Front Immunol 2018;9:648 | pełny tekst (PMC) |
| `havas_1997` | 9350633 (PMC1159951) | 10.1111/j.1469-7793.1997.233bf.x | tak: Havas E i in., J Physiol 1997;504(Pt 1):233–9 | abstrakt + spis literatury |
| `pedersen_bruunsgaard_1995` | 7676100 (PMC7101836) | 10.2165/00007256-199519060-00003 | tak: Pedersen BK, Bruunsgaard H, Sports Med 1995;19(6):393–400 | abstrakt (w PMC tylko abstrakt i literatura) |
| `nielsen_1997` | 9227599 | 10.1152/ajpregu.1997.272.6.R1847 | tak: Nielsen HB i in., Am J Physiol 1997;272(6 Pt 2):R1847–52 | abstrakt |
| `baum_1996` | 8973982 | 10.1055/s-2007-972902 | tak: Baum M, Geitner T, Liesen H, Int J Sports Med 1996;17(8):604–7 | abstrakt |
| *proponowane:* Simpson i in. 2020 | 32139352 | – | tak: Simpson RJ, Campbell JP, Gleeson M, Krüger K i in., Exerc Immunol Rev 2020;26:8–22 | metadane |

## Tabela faktów

Oznaczenia: PM = `protocolMismatch`; † = `checked_agent` pod warunkiem podmiany pola `quote` na cytat z tej tabeli (zmiana pola cytatu leży w gestii sprawdzającego, §3.6 p. 1).

| # | fakt na planszy (dosłownie) | źródło | status | cytat (≤ 15 słów) | lokalizator | protokół / flaga | uwaga |
|---|---|---|---|---|---|---|---|
| 1 | summary.rest: „Limfa to płyn, który wycieka z naczyń krwionośnych do tkanek. […] Komórki odpornościowe, np. komórki NK, w większości czekają w ścianach naczyń, w śledzionie i w węzłach.” | Campbell 2018 | `disputed` | „non-specific flushing of the marginal pools” | Campbell 2018, cz. A, „Transient Changes to Blood Lymphocyte Frequency…” | – | (a) Płyn, który wycieka z naczyń, to płyn tkankowy. Limfą staje się po wejściu do naczyń chłonnych. Proponuję: „Limfa powstaje z płynu, który wycieka z naczyń krwionośnych do tkanek”. (b) Źródło nie mówi „w większości”. Śledziona jako magazyn NK jest na tej samej planszy sporna (#33). Proponuję: „część komórek NK przylega do ścian naczyń”. Reszta (naczynia chłonne → węzły → przewód piersiowy → żyła przy lewym obojczyku) jest anatomicznie poprawna. |
| 2 | summary.sprint: „W wysiłku adrenalina odrywa komórki odpornościowe od ścian naczyń […] Śledziona się kurczy […] Pracujące mięśnie wyciskają limfę szybciej. 1–2 godziny po wysiłku limfocytów we krwi jest przejściowo mniej […] Naukowcy się spierają…” | Campbell 2018; Stewart 2003; Havas 1997; Nieman 1992; Pedersen 1995 | `checked_agent` | „arising from adrenaline released during exercise, causing endothelial detachment” | Campbell 2018, cz. A (jw.); Stewart 2003 abstrakt; Havas 1997 abstrakt pkt 3 | PM w metrykach | Każde zdanie ma pokrycie. Nieman 1992 dodatkowo: „Plasma epinephrine increased 300%”. |
| 3 | Węzły chłonne szyjne / nodi lymphoidei cervicales: „Oczyszczają limfę z głowy i szyi” | – | `anatomy` | – | – | – | TA2 dzieli je na cervicales anteriores i laterales. Nazwa zbiorcza jest poprawna. |
| 4 | Węzły chłonne pachowe / nodi lymphoidei axillares: „Oczyszczają limfę z ręki i klatki piersiowej” | – | `anatomy` | – | – | – | Poprawne (kończyna górna, ściana klatki piersiowej, sutek). |
| 5 | Grasica / thymus, rest: „Tu dojrzewają limfocyty T; u dorosłych jest mała” | – | `anatomy` | – | – | – | Poprawne (inwolucja). |
| 6 | Grasica, sprint: „Brak danych o zmianie w jednym wysiłku” | brak | `unverifiable` | – | – | – | Twierdzenie o braku danych nie ma źródła. Proponuję usunąć albo napisać neutralnie: „W wysiłku bez zmian na rysunku”. |
| 7 | Przewód piersiowy / ductus thoracicus, rest: „Zbiera limfę z nóg, brzucha i lewej połowy ciała” | – | `anatomy` | – | – | – | Poprawne. |
| 8 | Przewód piersiowy, sprint: „Odprowadza do krwi więcej limfy z nóg” | Havas 1997 | `disputed` | „Exercise increased the clearance rate three- to sixfold” | Havas 1997, abstrakt pkt 3 | mięsień uda, 100 skurczów / 10 min | Havas mierzył klirens albuminy z m. obszernego bocznego, a nie przepływ w przewodzie piersiowym. Notatka metryki #31 sama mówi, że u ludzi go nie zmierzono (dane zwierzęce, np. Lindena 1984, psy, cytowane przez Havasa). Podpis trzeba złagodzić („prawdopodobnie więcej limfy”) i oznaczyć poziom `preliminary_human` lub dane zwierzęce. |
| 9 | Śledziona / splen (lien), rest: „Filtruje krew i przechowuje krwinki” | – | `anatomy` | – | – | – | Poprawne. |
| 10 | Śledziona, sprint: „Kurczy się i oddaje do krążenia krew z krwinkami” | Stewart 2003 | `checked_agent` | „resulted in a 56% reduction in spleen volume” | Stewart 2003, abstrakt; tab. 2 | test stopniowany do wyczerpania | Moment jest zgodny z literaturą (zaraz po wysiłku). |
| 11 | Węzły chłonne pachwinowe / nodi lymphoidei inguinales, rest: „Oczyszczają limfę z nogi” | – | `anatomy` | – | – | – | Poprawne. W rozszerzonym poziomie można dodać dolną ścianę brzucha i krocze. |
| 12 | Węzły pachwinowe, sprint: „Dopływa więcej limfy z pracujących mięśni nóg” | Havas 1997 | `disputed` | „Exercise increased the clearance rate three- to sixfold” | Havas 1997, abstrakt pkt 3 | jw. | Ekstrapolacja: Havas nie mierzył dopływu do węzłów. Dodać „prawdopodobnie”, zgodnie z `preliminary_human` w metryce #31. Drobna poprawka. |
| 13 | Ujście limfy do krwi / angulus venosus sinister: „Limfa wraca do krwi (lewy kąt żylny)” | – | `anatomy` | – | – | – | Anatomicznie poprawne. „Angulus venosus” to termin tradycyjny (kąt Pirogowa). Nie potwierdziłem go jako oficjalnego terminu TA2. |
| 14 | Naczynia chłonne nogi (schemat) / vasa lymphatica membri inferioris, rest: „Limfa płynie powoli w górę (zastawki)” | – | `anatomy` | – | – | – | Poprawne. Nazwa łacińska jest opisowa, nie jest hasłem TA2. |
| 15 | Naczynia chłonne nogi, sprint: „Skurcze mięśni wyciskają limfę szybciej” | Havas 1997 | `checked_agent` | „Exercise increased the clearance rate three- to sixfold” | Havas 1997, abstrakt pkt 3 | PM: 100 skurczów uda / 10 min | Pomiar pośredni, 8 mężczyzn. Autorzy wprost: „lymph propulsion by working muscle”. |
| 16 | Zbiornik mleczu / cisterna chyli: „Zbiera limfę z nóg i jelit” | – | `anatomy` | – | – | – | Poprawne (pnie lędźwiowe i jelitowy). |
| 17 | Węzły tchawiczo-oskrzelowe / nodi lymphoidei tracheobronchiales: „Oczyszczają limfę z płuc” | – | `anatomy` | – | – | – | Poprawne. Kotwica nazywa się `mediastinal`, ale to tylko identyfikator. |
| 18 | Węzły krezkowe / nodi lymphoidei mesenterici: „Oczyszczają limfę z jelit” | – | `anatomy` | – | – | – | Poprawne. |
| 19 | Węzły biodrowe / nodi lymphoidei iliaci: „Zbierają limfę z nóg i miednicy” | – | `anatomy` | – | – | – | Poprawne. |
| 20 | Naczynie chłonne doprowadzające / vas lymphaticum afferens: „Wnosi limfę do węzła” | – | `anatomy` | – | – | – | Poprawne. |
| 21 | Grudka chłonna / nodulus lymphoideus: „Tu namnażają się limfocyty B” | – | `anatomy` | – | – | – | Poprawne dla grudek wtórnych (ośrodek rozmnażania). |
| 22 | Naczynie chłonne odprowadzające / vas lymphaticum efferens: „Wyprowadza limfę z węzła (wnęka)” | – | `anatomy` | – | – | – | Poprawne. |
| 23 | Torebka węzła / capsula: „Otacza węzeł; pod nią płynie limfa” | – | `anatomy` | – | – | – | Poprawne (zatoka podtorebkowa). |
| 24 | Strefa przykorowa / paracortex: „Strefa limfocytów T” | – | `anatomy` | – | – | – | Poprawne. |
| 25 | Rdzeń węzła / medulla: „Zatoki prowadzą limfę do wnęki” | – | `anatomy` | – | – | – | Poprawne. |
| 26 | Metryka: Komórki NK we krwi 1× → „ok. 2,8×”; notatka: „Po 1 h ich liczba spada umiarkowanie, a limfocytów ogółem jest o 36% mniej” | Nieman 1992 | `checked_agent` | „explained primarily from the 176% increase in natural killer cells (NK)” | Nieman 1992, abstrakt | PM: 30 s sprint maksymalny, 10 mężczyzn, 22 lata; pomiar 3 min po | Przeliczenie +176% = 2,76× jest poprawne. „36% below pretest levels after 1 h” jest dosłownie w abstrakcie. `measuredAt` się zgadza. Zdanie „NK niszczą komórki zakażone wirusem i nowotworowe” to wiedza podręcznikowa (bez cytatu, ale poprawna). |
| 27 | Metryka: Limfocyty 2,3 → 4,0 tys./µL; po 1 h 1,7 | Bogdanis 2022 | `checked_agent` | „lymphocyte count was reduced 1 h post-exercise compared to baseline in all HIIE trials” | Bogdanis 2022, 3.2 „Hematologic responses”, tab. 1 (HIIE60: 2.3 ± 0.6 / 4.0 ± 0.9 / 1.7 ± 0.6) | PM trafny: 8 × 60 s przy 100% PPO, przerwy 90 s przy 15% PPO; 11 mężczyzn, 28 ± 6 lat | Wartości z tabeli 1 się zgadzają. Uwaga: liczby nie są korygowane o spadek objętości osocza (HIIE60: −13,9%), więc część wzrostu to zagęszczenie krwi. To najbliższy protokół (§3.7, priorytet 1). |
| 28 | Metryka: Leukocyty 6,1 → 9,7 tys./µL; po 1 h 6,1 | Bogdanis 2022 | `checked_agent` | „The increase in HIIE60 (from 6.1 ± 1.6 to 9.7 ± 2.6 k/μL)” | Bogdanis 2022, 3.2 i tab. 1 (1 h post 6.1 ± 1.8) | jw. | Cytat jest dosłowny. Abstrakt podaje 9.7 ± 2.8 (niespójność w samym źródle; średnia ta sama). |
| 29 | Metryka: Objętość śledziony 100% → „ok. 44%”; notatka: „po 5–15 min jazdy przy 60% VO₂max o 28–36%. Po ok. 20 min wraca do normy” | Stewart 2003 | `checked_agent` | „56% reduction in spleen volume, which recovered to baseline levels within 20 min” | Stewart 2003, abstrakt; tab. 2 (0 min: 36,35 ml = 43,x% spoczynku) | PM trafny: test stopniowany do wyczerpania; 9 mężczyzn, 25 ± 1 lat | Przeliczenie −56% = 44% jest poprawne. Populacja jest idealna dla kanonu. Uwaga: test do wyczerpania następował po trzech jazdach submaksymalnych. |
| 30 | Metryka (stud.): NK „do 10×”; notatka: „Limfocyty T CD8 rosną ok. 2,5×. Mechanizm: adrenalina działa na receptory β2” | Campbell 2018 | `checked_agent` | „natural killer cells, which rise by up to 10-fold” | Campbell 2018, cz. A, „Transient Changes to Blood Lymphocyte Frequency in the Hours Following Exercise” | PM trafny: wysiłek ciągły „at least 45–60 minutes” | Mechanizm β2 jest w tym samym akapicie („beta-2-adrenergic receptors”). |
| 31 | Metryka (stud.): Spadek limfocytów „−30 do −60” % (1–2 h po) | Campbell 2018 | `checked_agent` † | „Given the 30–60% decrease in lymphocyte numbers post-exercise” | Campbell 2018, cz. A, akapit o apoptozie | PM trafny | Obecny `quote` (zdanie o „nadir… 1–2 h”) nie zawiera liczby 30–60. Do pola `quote` trzeba dodać zdanie zaczynające się od „Given the 30–60% decrease in lymphocyte numbers post-exercise” (akapit o apoptozie). |
| 32 | Metryka (stud.): Odpływ limfy z mięśnia 1× → 3–6×; notatka: „Przepływu w przewodzie piersiowym w wysiłku u ludzi nie zmierzono; dane o nim pochodzą głównie z badań na zwierzętach” | Havas 1997 | `checked_agent` | „Exercise increased the clearance rate three- to sixfold” | Havas 1997, abstrakt pkt 3 | PM trafny: 100 skurczów w 10 min, 8 mężczyzn | Liczba, populacja i `measuredAt` się zgadzają. `preliminary_human` jest trafne. Zdanie o przewodzie piersiowym nie ma własnego źródła. Havas cytuje badanie na psach (Lindena 1984), które można dopisać jako dane zwierzęce. |
| 33 | Metryka (spór): „Czy śledziona dostarcza limfocytów w wysiłku?”; „Nielsen 1997: śledziona daje ok. 2/3 wzrostu […] w innym badaniu nie było różnicy (Baum 1996)” | Nielsen 1997; Baum 1996 | `checked_agent` | „accounting for two-thirds of the increase in T lymphocytes and NK cells” | Nielsen 1997, abstrakt; Baum 1996, abstrakt („the pattern of white blood cell mobilization is unchanged after splenectomy”) | PM trafny: Nielsen 6 + 6 osób, 2 × 12 min submaks. + supramaksymalnie do wyczerpania; Baum 13 + 13, test stopniowany | Oba cytaty są dosłowne, a spór przedstawiony uczciwie. W rozszerzonym poziomie warto dodać, że u Bauma grupa kontrolna ćwiczyła intensywniej (wyższy mleczan i katecholaminy) i że badania różniły się protokołem. |
| 34 | Metryka (spór): „Otwarte okno”; „Starsza hipoteza (Pedersen i Bruunsgaard 1995): przez kilka godzin łatwiej o infekcję. Nowszy przegląd (Campbell i Turner 2018): brak wiarygodnych dowodów…” | Pedersen 1995; Campbell 2018 | `disputed` | „often referred to as ‘the open window’, the host may be more susceptible” | Pedersen 1995, abstrakt; Campbell 2018, abstrakt („limited reliable evidence exists to support the claim…”) | brak PM (opis ogólny) | Oba cytaty są dosłowne. Rozbieżność: „przez kilka godzin” nie występuje w abstrakcie Pedersena (podaje tylko „after prolonged, intense exercise”). Do tego `measuredAt: kilka godzin` nie ma pokrycia. Uczciwość: ujęcie „starsza vs nowsza” sugeruje rozstrzygnięcie. Wspólny przegląd obu stron (Simpson, Campbell, Gleeson, Krüger i in. 2020, PMID 32139352) pokazuje, że spór trwa. Proponuję go dopisać. |

Uwaga poza tabelą: `protocolNotePl` ustala „Po = 1 h po wysiłku”, a kanon §3.7 mówi „2–3 min po (gdzie dane to uzasadniają)”. Dla limfocytów 1 h jest uzasadniona literaturą (najniższa liczba 1–2 h po wysiłku). Autor opisał to jako decyzję Dyrygenta K1, więc nie liczę tego jako błąd.

## Nazwy anatomiczne (TA2, polskie)

Wszystkie nazwy łacińskie są poprawne lub dopuszczalne. Dwie uwagi:
- „angulus venosus sinister” to termin tradycyjny, nie znalazłem go jako hasła TA2;
- „vasa lymphatica membri inferioris” to opis, a nie hasło TA2.

Polskie nazwy (zbiornik mleczu, strefa przykorowa, grudka chłonna, torebka węzła, węzły tchawiczo-oskrzelowe) są zgodne z polskim mianownictwem.

## Do poprawy przez autora

1. **#1 summary.rest:**
   - „Limfa to płyn, który wycieka…” → „Limfa powstaje z płynu, który wycieka z naczyń krwionośnych do tkanek”;
   - „w większości czekają w ścianach naczyń, w śledzionie i w węzłach” → „część z nich przylega do ścian naczyń” (bez „w większości”; śledziona jest sporna, #33).
2. **#8 Przewód piersiowy, sprint:** złagodzić („Prawdopodobnie odprowadza więcej limfy”) i oznaczyć, że u ludzi tego nie zmierzono. Ewentualnie usunąć referencję Havas z tego podpisu.
3. **#12 Węzły pachwinowe, sprint:** dodać „prawdopodobnie”.
4. **#6 Grasica, sprint:** usunąć twierdzenie bez źródła albo podać źródło.
5. **#31:** sprawdzający podmienia `quote` na zdanie z „30–60% decrease” (tekst w tabeli). Wtedy status to `checked_agent`.
6. **#34:** usunąć „przez kilka godzin” albo podać źródło z czasem trwania. Zmienić `measuredAt` na „1–2 h po wysiłku (Campbell)”. Rozważyć dodanie Simpson i in. 2020 (PMID 32139352) jako dowodu, że spór trwa.
7. **#32 (opcjonalnie):** dopisać źródło zwierzęce do zdania o przewodzie piersiowym (Lindena i in. 1984, psy; cytowane przez Havasa).
8. **#27–28 (opcjonalnie, poziom rozszerzony):** dopisać, że wartości Bogdanisa nie są korygowane o objętość osocza (−13,9%).
