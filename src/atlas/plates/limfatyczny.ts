import type { AtlasPlateContent } from '../types';

/**
 * Plansza układu limfatycznego i odpornościowego (faza 1b, agent 11). Render: blender/atlas/plate_limfatyczny.py
 * Widok z przodu: węzły chłonne i narządy Z-Anatomy (CC BY-SA 4.0); węzły POWIĘKSZONE dla czytelności (ok. 2,8×, każdy wokół własnego środka).
 * Naczyń chłonnych nie ma w żadnym źródle: przewód piersiowy, zbiornik mleczu i naczynia chłonne nóg to SCHEMAT.
 * Zbliżenie: węzeł chłonny HuBMAP (NIH_M_Lymph_Node, CC BY 4.0) w przekroju.
 * Strzałki: public/atlas/limfatyczny/flows3d.json (metry, kind 'lymph' - kolor dopisuje integrator).
 *
 * Fakty: statusy z docs/atlas_audyt/fakty_limfatyczny.md (numery # = wiersze audytu): potwierdzone 'checked_agent'
 * i 'anatomy'; fakty przepisane po audycie K2 (#1, #8, #12, #34) wracają do 'draft'.
 * Trzeci moment („po wysiłku”, 1-2 h) jest w `notePl` i `measuredAt` (typy znają tylko rest/sprint; decyzja Dyrygenta K1).
 * Jasność struktur w sprincie to ilustracja w 3 stopniach, nie liczba ze źródła.
 */
const NIEMAN = 'nieman_1992';
const BOGDANIS = 'bogdanis_2022';
const STEWART = 'stewart_2003';
const CAMPBELL = 'campbell_turner_2018';

export const LIMFATYCZNY: AtlasPlateContent = {
  id: 'limfatyczny',
  titlePl: 'Układ limfatyczny i odpornościowy',
  subtitlePl: 'Jak wysiłek wypycha komórki odpornościowe do krwi',
  colorVar: '--sys-lymph',
  views: ['front', 'detail'],
  viewTitlesPl: {
    front: 'Widok z przodu (węzły powiększone, naczynia chłonne: schemat)',
    detail: 'Węzeł chłonny w przekroju',
  },
  summary: {
    rest:
      'Z naczyń krwionośnych wycieka do tkanek płyn tkankowy. Gdy trafi do naczyń chłonnych, staje się limfą. Naczynia chłonne prowadzą ją powoli przez węzły chłonne, które działają jak filtry. Przewód piersiowy oddaje limfę z powrotem do krwi, do żyły przy lewym obojczyku. Część komórek odpornościowych, np. komórek NK, przylega do ścian naczyń krwionośnych.',
    sprint:
      'W wysiłku adrenalina odrywa komórki odpornościowe od ścian naczyń, więc w krwi szybko przybywa komórek NK i limfocytów. Śledziona się kurczy i oddaje krew do krążenia. Pracujące mięśnie wyciskają limfę szybciej. 1–2 godziny po wysiłku limfocytów we krwi jest przejściowo mniej niż przed nim. Naukowcy się spierają, czy to osłabia odporność, czy komórki po prostu przechodzą do tkanek.',
  },
  summaryReferenceIds: {
    rest: [CAMPBELL],
    sprint: [CAMPBELL, NIEMAN, STEWART, 'havas_1997', 'pedersen_bruunsgaard_1995'],
  },
  // K2 (sprawdzający, docs/atlas_audyt/fakty_limfatyczny.md): rest #1 disputed -> przepisane (draft), sprint #2 checked_agent
  summaryStatus: { rest: 'draft', sprint: 'checked_agent' },
  protocolNotePl:
    '„Sprint” to koniec 45 s pracy przy ok. 88% VO₂max. Liczby pochodzą z badań o innych protokołach (opis przy każdej liczbie). „Po” to 1 godzina po wysiłku.',
  labels: [
    // ---------------- widok z przodu: podstawowe (7)
    {
      anchor: 'cervical',
      view: 'front',
      namePl: 'Węzły chłonne szyjne',
      nameLat: 'nodi lymphoidei cervicales',
      role: { rest: 'Oczyszczają limfę z głowy i szyi', sprint: 'Oczyszczają limfę z głowy i szyi' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'axillary',
      view: 'front',
      namePl: 'Węzły chłonne pachowe',
      nameLat: 'nodi lymphoidei axillares',
      role: { rest: 'Oczyszczają limfę z ręki i klatki piersiowej', sprint: 'Oczyszczają limfę z ręki i klatki piersiowej' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'thymus',
      view: 'front',
      namePl: 'Grasica',
      nameLat: 'thymus',
      // sprint: bez twierdzenia o wysiłku (K2 #6 unverifiable usunięte); ten sam opis anatomiczny co w spoczynku (#5 anatomy)
      role: { rest: 'Tu dojrzewają limfocyty T; u dorosłych jest mała', sprint: 'Tu dojrzewają limfocyty T; u dorosłych jest mała' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'thoracic_duct',
      view: 'front',
      namePl: 'Przewód piersiowy (schemat)',
      nameLat: 'ductus thoracicus',
      role: { rest: 'Zbiera limfę z nóg, brzucha i lewej połowy ciała', sprint: 'Prawdopodobnie odprowadza więcej limfy z nóg' }, // K2 #8 disputed -> złagodzone, draft
      tier: 'primary',
      referenceIds: ['havas_1997'],
      evidence: 'preliminary_human', // pomiar pośredni u ludzi (Havas 1997); przewód piersiowy: dane głównie zwierzęce
      roleStatus: { rest: 'anatomy', sprint: 'draft' }, // #7 anatomy; #8 przepisane
    },
    {
      anchor: 'spleen',
      view: 'front',
      namePl: 'Śledziona',
      nameLat: 'splen (lien)',
      role: { rest: 'Filtruje krew i przechowuje krwinki', sprint: 'Kurczy się i oddaje do krążenia krew z krwinkami' },
      tier: 'primary',
      referenceIds: [STEWART],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #9, #10
    },
    {
      anchor: 'inguinal',
      view: 'front',
      namePl: 'Węzły chłonne pachwinowe',
      nameLat: 'nodi lymphoidei inguinales',
      role: { rest: 'Oczyszczają limfę z nogi', sprint: 'Prawdopodobnie dopływa więcej limfy z pracujących nóg' }, // K2 #12 disputed -> „prawdopodobnie”, draft
      tier: 'primary',
      referenceIds: ['havas_1997'],
      evidence: 'preliminary_human', // pomiar pośredni u ludzi (Havas 1997); przewód piersiowy: dane głównie zwierzęce
      roleStatus: { rest: 'anatomy', sprint: 'draft' },
    },
    {
      anchor: 'venous_angle',
      view: 'front',
      namePl: 'Ujście limfy do krwi',
      nameLat: 'angulus venosus sinister',
      role: { rest: 'Limfa wraca do krwi (lewy kąt żylny)', sprint: 'Limfa wraca do krwi (lewy kąt żylny)' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    // ---------------- widok z przodu: dla studentów
    {
      anchor: 'leg_lymph',
      view: 'front',
      namePl: 'Naczynia chłonne nogi (schemat)',
      nameLat: 'vasa lymphatica membri inferioris',
      role: { rest: 'Limfa płynie powoli w górę (zastawki)', sprint: 'Skurcze mięśni wyciskają limfę szybciej' },
      tier: 'secondary',
      referenceIds: ['havas_1997'],
      evidence: 'preliminary_human', // pomiar pośredni u ludzi (Havas 1997)
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #14, #15
    },
    {
      anchor: 'cisterna',
      view: 'front',
      namePl: 'Zbiornik mleczu (schemat)',
      nameLat: 'cisterna chyli',
      role: { rest: 'Zbiera limfę z nóg i jelit', sprint: 'Zbiera limfę z nóg i jelit' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'mediastinal',
      view: 'front',
      namePl: 'Węzły tchawiczo-oskrzelowe',
      nameLat: 'nodi lymphoidei tracheobronchiales',
      role: { rest: 'Oczyszczają limfę z płuc', sprint: 'Oczyszczają limfę z płuc' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'abdominal',
      view: 'front',
      namePl: 'Węzły krezkowe',
      nameLat: 'nodi lymphoidei mesenterici',
      role: { rest: 'Oczyszczają limfę z jelit', sprint: 'Oczyszczają limfę z jelit' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'iliac',
      view: 'front',
      namePl: 'Węzły biodrowe',
      nameLat: 'nodi lymphoidei iliaci',
      role: { rest: 'Zbierają limfę z nóg i miednicy', sprint: 'Zbierają limfę z nóg i miednicy' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    // ---------------- zbliżenie: węzeł chłonny
    {
      anchor: 'd_afferent',
      view: 'detail',
      namePl: 'Naczynie chłonne doprowadzające',
      nameLat: 'vas lymphaticum afferens',
      role: { rest: 'Wnosi limfę do węzła', sprint: 'Wnosi limfę do węzła' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'd_follicle',
      view: 'detail',
      namePl: 'Grudka chłonna',
      nameLat: 'nodulus lymphoideus',
      role: { rest: 'Tu namnażają się limfocyty B', sprint: 'Tu namnażają się limfocyty B' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'd_efferent',
      view: 'detail',
      namePl: 'Naczynie chłonne odprowadzające',
      nameLat: 'vas lymphaticum efferens',
      role: { rest: 'Wyprowadza limfę z węzła (wnęka)', sprint: 'Wyprowadza limfę z węzła (wnęka)' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'd_capsule',
      view: 'detail',
      namePl: 'Torebka węzła',
      nameLat: 'capsula',
      role: { rest: 'Otacza węzeł; pod nią płynie limfa', sprint: 'Otacza węzeł; pod nią płynie limfa' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'd_paracortex',
      view: 'detail',
      namePl: 'Strefa przykorowa',
      nameLat: 'paracortex',
      role: { rest: 'Strefa limfocytów T', sprint: 'Strefa limfocytów T' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'd_medulla',
      view: 'detail',
      namePl: 'Rdzeń węzła',
      nameLat: 'medulla',
      role: { rest: 'Zatoki prowadzą limfę do wnęki', sprint: 'Zatoki prowadzą limfę do wnęki' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
  ],
  metrics: [
    // ---------------- podstawowe (4)
    {
      labelPl: 'Komórki NK we krwi',
      rest: '1×',
      sprint: 'ok. 2,8×',
      unit: 'względem spoczynku',
      referenceIds: [NIEMAN],
      evidenceLevel: 'established_human',
      notePl:
        'Komórki NK („naturalni zabójcy”) niszczą komórki zakażone wirusem i nowotworowe. Po 1 h ich liczba spada umiarkowanie, a limfocytów ogółem jest o 36% mniej niż przed wysiłkiem.',
      status: 'checked_agent', // #26
      protocolMismatch: '30 s sprint maksymalny (Wingate)',
      measuredAt: '3 min po wysiłku; po: 1 h po wysiłku',
      conversionNote: '+176% = 2,76× wartości wyjściowej',
      quote:
        'The post-test lymphocytosis can be explained primarily from the 176% increase in natural killer cells (NK) and 28% increase in cytotoxic/suppressor T cells, while the 1-h recovery lymphopenia occurred because of a sharp decrease in total T cells and a moderate decrease in NK cells.',
      locator: 'Nieman 1992, abstrakt',
      tier: 'primary',
    },
    {
      labelPl: 'Limfocyty we krwi',
      rest: '2,3',
      sprint: '4,0',
      unit: 'tys./µL',
      referenceIds: [BOGDANIS, CAMPBELL],
      evidenceLevel: 'established_human',
      notePl:
        'Po 1 h: 1,7 tys./µL, czyli mniej niż przed wysiłkiem. Według przeglądu najmniej limfocytów jest 1–2 h po wysiłku, a w ciągu doby ich liczba wraca do normy.',
      status: 'checked_agent', // #27, #28
      protocolMismatch: '8 × 60 s przy mocy odpowiadającej VO₂max, przerwy 90 s (11 mężczyzn, 28 lat)',
      measuredAt: 'zaraz po ostatnim interwale; po: 1 h po wysiłku',
      quote:
        'lymphocyte count was reduced 1 h post-exercise compared to baseline in all HIIE trials (p < 0.05, Table 1)',
      locator: 'Bogdanis 2022, Tabela 1 (HIIE60: Pre 2.3 ± 0.6, Post 4.0 ± 0.9, 1 h post 1.7 ± 0.6 k/μL) i wyniki „Hematologic responses”',
      tier: 'primary',
    },
    {
      labelPl: 'Białe krwinki (leukocyty)',
      rest: '6,1',
      sprint: '9,7',
      unit: 'tys./µL',
      referenceIds: [BOGDANIS],
      evidenceLevel: 'established_human',
      notePl: 'Po 1 h: 6,1 tys./µL, czyli tyle samo co przed wysiłkiem.',
      status: 'checked_agent', // #27, #28
      protocolMismatch: '8 × 60 s przy mocy odpowiadającej VO₂max, przerwy 90 s (11 mężczyzn, 28 lat)',
      measuredAt: 'zaraz po ostatnim interwale; po: 1 h po wysiłku',
      quote: 'The increase in HIIE60 (from 6.1 ± 1.6 to 9.7 ± 2.6 k/μL) was greater than in all other trials (p < 0.05).',
      locator: 'Bogdanis 2022, wyniki „Hematologic responses” i Tabela 1 (1 h post: 6.1 ± 1.8)',
      tier: 'primary',
    },
    {
      labelPl: 'Objętość śledziony',
      rest: '100%',
      sprint: 'ok. 44%',
      unit: 'objętości spoczynkowej',
      referenceIds: [STEWART],
      evidenceLevel: 'established_human',
      notePl:
        'Śledziona się kurczy i oddaje krew do krążenia. Po wysiłku do wyczerpania jest mniejsza o 56%, po 5–15 min jazdy przy 60% VO₂max o 28–36%. Po ok. 20 min wraca do normy. Na rysunku sprintu śledziona jest mniejsza o ok. 1/3 objętości (ilustracja, ostrożnie).',
      status: 'checked_agent', // #29
      protocolMismatch: 'test stopniowany do wyczerpania na rowerze (9 mężczyzn, 25 lat)',
      measuredAt: 'zaraz po wysiłku; po: 20 min po wysiłku',
      conversionNote: '−56% objętości = 44% wartości spoczynkowej',
      quote:
        'The incremental ride to exhaustion resulted in a 56% reduction in spleen volume, which recovered to baseline levels within 20 min.',
      locator: 'Stewart 2003, abstrakt; Tabela 2',
      tier: 'primary',
    },
    // ---------------- dla studentów
    {
      labelPl: 'Komórki NK przy długim intensywnym wysiłku',
      rest: '1×',
      sprint: 'do 10×',
      unit: 'względem spoczynku',
      referenceIds: [CAMPBELL],
      evidenceLevel: 'established_human',
      notePl: 'Limfocyty T CD8 rosną ok. 2,5×. Mechanizm: adrenalina działa na receptory β2 limfocytów.',
      status: 'checked_agent', // #30
      protocolMismatch: 'intensywny wysiłek ciągły trwający co najmniej 45–60 min (przegląd)',
      measuredAt: 'w trakcie i zaraz po wysiłku',
      quote:
        'This response is typified by a dramatic influx of natural killer cells, which rise by up to 10-fold, and CD8+ T cells which increase to a lesser—but still profound—extent by approximately 2.5-fold',
      locator: 'Campbell i Turner 2018, część A, „Transient Changes to Blood Lymphocyte Frequency in the Hours Following Exercise”',
      tier: 'student',
    },
    {
      labelPl: 'Spadek limfocytów po wysiłku',
      rest: '0',
      sprint: '−30 do −60',
      unit: '% (1–2 h po wysiłku)',
      referenceIds: [CAMPBELL],
      evidenceLevel: 'established_human',
      notePl: 'Najmniej limfocytów jest ok. 1–2 h po wysiłku; w ciągu 24 h ich liczba wraca do normy.',
      status: 'checked_agent', // #31: cytat podmieniony na zdanie z liczbą (wskazane przez sprawdzającego)
      protocolMismatch: 'intensywny wysiłek ciągły (przegląd)',
      measuredAt: 'po: 1–2 h po wysiłku',
      quote:
        'Given the 30–60% decrease in lymphocyte numbers post-exercise (89, 101, 102), apoptosis could be a small contributor to exercise-induced lymphopenia',
      locator:
        'Campbell i Turner 2018, część A, „Transient Changes to Blood Lymphocyte Frequency in the Hours Following Exercise”, akapit o apoptozie; moment 1–2 h i powrót w 24 h: ten sam rozdział („This nadir is typically observed approximately 1–2 h post-exercise”)',
      tier: 'student',
    },
    {
      labelPl: 'Odpływ limfy z pracującego mięśnia',
      rest: '1×',
      sprint: '3–6×',
      unit: 'względem spoczynku',
      referenceIds: ['havas_1997'],
      evidenceLevel: 'preliminary_human',
      notePl:
        'Pierwsze badania sugerują, że skurcze mięśni wyciskają limfę szybciej. Pomiar pośredni: tempo usuwania znakowanego białka z mięśnia uda (8 mężczyzn). Przepływu w przewodzie piersiowym w wysiłku u ludzi nie zmierzono; dane o nim pochodzą głównie z badań na zwierzętach.',
      status: 'checked_agent', // #32
      protocolMismatch: '100 skurczów mięśnia uda w 10 min (prostowanie kolana), nie bieg ani rower',
      measuredAt: 'w trakcie 10 min skurczów',
      quote: 'Exercise increased the clearance rate three- to sixfold',
      locator: 'Havas 1997, abstrakt, punkt 3',
      tier: 'student',
    },
    {
      labelPl: 'Czy śledziona dostarcza limfocytów w wysiłku?',
      rest: '—',
      sprint: 'sporne',
      referenceIds: ['nielsen_1997', 'baum_1996'],
      evidenceLevel: 'contested_debate',
      notePl:
        'Naukowcy się spierają. U osób bez śledziony limfocytów przybywało mniej (Nielsen 1997: śledziona daje ok. 2/3 wzrostu), ale w innym badaniu nie było różnicy (Baum 1996).',
      status: 'checked_agent', // #33
      protocolMismatch: 'wysiłek maksymalny do wyczerpania, osoby po usunięciu śledziony',
      measuredAt: 'w trakcie wysiłku maksymalnego',
      quote:
        'the spleen is important for lymphocytosis during exercise, accounting for two-thirds of the increase in T lymphocytes and NK cells',
      locator:
        'Nielsen 1997, abstrakt; strona przeciwna: Baum 1996, abstrakt („the pattern of white blood cell mobilization is unchanged after splenectomy”)',
      tier: 'secondary',
    },
    {
      labelPl: '„Otwarte okno” na infekcje po wysiłku',
      rest: '—',
      sprint: 'sporne',
      referenceIds: ['pedersen_bruunsgaard_1995', CAMPBELL, 'simpson_2020'],
      evidenceLevel: 'contested_debate',
      // K2 #34 disputed -> bez „przez kilka godzin” (brak u Pedersena), dodany wspólny przegląd obu stron (Simpson 2020); draft
      notePl:
        'Naukowcy się spierają, czy spadek limfocytów po wysiłku osłabia odporność. Jedni (Pedersen i Bruunsgaard 1995): po długim, intensywnym wysiłku łatwiej o infekcję („otwarte okno”). Drudzy (Campbell i Turner 2018): brak wiarygodnych dowodów, a komórki przechodzą do tkanek, gdzie pilnują porządku. Wspólny przegląd obu stron (Simpson i wsp. 2020): sprawa wciąż nierozstrzygnięta.',
      status: 'draft',
      measuredAt: '1–2 h po wysiłku (spadek limfocytów; Campbell i Turner 2018)',
      quote:
        'During this time of immunodepression, often referred to as ‘the open window’, the host may be more susceptible to micro-organisms bypassing the first line of defence.',
      locator:
        'Pedersen i Bruunsgaard 1995, abstrakt; strona przeciwna: Campbell i Turner 2018, abstrakt („limited reliable evidence exists to support the claim that vigorous exercise heightens risk of opportunistic infections”); Simpson 2020, abstrakt („An issue that remains to be resolved is whether exercise per se is a causative factor of increased infection risk in athletes.”)',
      tier: 'secondary',
    },
  ],
  creditsPl:
    'Modele: Z-Anatomy (węzły chłonne, śledziona, grasica, migdałki, szkielet, żyły; CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP), oraz HuBMAP Human Reference Atlas (węzeł chłonny NIH_M_Lymph_Node; CC BY 4.0). Schemat naczyń chłonnych i powiększenie węzłów: BIOGENESIS. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0.',
};
