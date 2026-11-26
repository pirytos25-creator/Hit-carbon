import type { AtlasPlateContent, AtlasState } from '../types';

/**
 * Karta układu rozrodczego (faza 1b, agent 12). Render: blender/atlas/plate_rozrodczy.py
 *
 * To KARTA, nie plansza ze stanami (docs/ATLAS_MODEL_ARCHITEKTONICZNY.md §4, pkt 10): pojedynczy interwał wpływa na ten
 * układ słabo i niejednoznacznie, więc obraz jest ten sam w obu stanach (anchors.json: jeden plik na widok, "card": true).
 * Dwie miednice z boku (jak przekrój strzałkowy w podręczniku), w tej samej skali i z tego samego kierunku kamery:
 *   `side`   miednica męska: Z-Anatomy;
 *   `detail` miednica żeńska: HuBMAP VH_F na żeńskiej miednicy i kręgach HuBMAP (nie na szkielecie Z-Anatomy).
 * Hormony płciowe są tylko w liczbach i tekście, z etykietami dowodów. RED-S tylko jako informacja długoterminowa.
 * Wszystkie fakty mają status 'draft' do czasu sprawdzenia przez agenta faktów (model §3.6).
 */

/** Ten sam opis w obu stanach (karta). */
const same = (t: string): Record<AtlasState, string> => ({ rest: t, sprint: t });

export const ROZRODCZY: AtlasPlateContent = {
  id: 'rozrodczy',
  titlePl: 'Układ rozrodczy',
  subtitlePl: 'Budowa u mężczyzny i u kobiety oraz to, czego o wpływie sprintu jeszcze nie wiadomo',
  colorVar: '--sys-repro',
  views: ['side', 'detail'],
  viewTitlesPl: { side: 'Miednica męska, z boku', detail: 'Miednica żeńska, z boku' },
  summary: {
    rest:
      'Karta pokazuje budowę układu rozrodczego mężczyzny i kobiety z boku, jak przekrój w podręczniku, w tej samej skali. U mężczyzny jądra leżą w mosznie poza miednicą, a plemniki płyną przez najądrze i nasieniowód do cewki moczowej. U kobiety jajniki, jajowody, macica i pochwa leżą w miednicy mniejszej, za pęcherzem moczowym.',
    sprint:
      'Obraz się nie zmienia, bo karta pokazuje budowę, a nie stan w wysiłku. U mężczyzn wolny testosteron we krwi rośnie zaraz po intensywnym wysiłku, a po 12 godzinach bywa niższy niż zwykle (w badaniu: wytrenowani biegacze, 90 s biegu przy 100–110% VO₂max przez ok. 45 min); znaczenie tych zmian jest niejasne. Zespół REDs (dawniej RED-S), wywołany długotrwałym lub silnym niedoborem energii, może zaburzać pracę tego układu, ale to skutek tygodni, nie jednego treningu.',
  },
  summaryReferenceIds: {
    rest: ['statpearls_testes', 'statpearls_male_gu', 'statpearls_seminal_vesicle', 'statpearls_female_internal', 'statpearls_uterus'],
    sprint: ['hackney_2012', 'velasco_orjuela_2018', 'mountjoy_2023'],
  },
  summaryStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_draft_1b.md (spoczynek); fakty_koncowe_C_reszta_i_kontrola.md: Hackney 2012, Velasco-Orjuela 2018, Mountjoy 2023 (+ dopisek o protokole, decyzja Dyrygenta d)
  protocolNotePl:
    'To karta budowy, a nie plansza ze stanami: „sprint” (koniec 45 s pracy przy ok. 88% VO₂max) nie zmienia tu obrazu.',
  protocolNoteStatus: 'draft', // zgromadzenie, runda końcowa: zdanie o „sprincie” przez bramkę faktów (dotąd bez statusu)
  labels: [
    // --- miednica męska (widok `side`): przód ciała po lewej stronie obrazu
    {
      anchor: 'testis',
      view: 'side',
      namePl: 'Jądro',
      nameLat: 'testis',
      role: same('Męski gruczoł płciowy: plemniki i hormony'),
      tier: 'primary',
      referenceIds: ['statpearls_testes'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_rozrodczy.md: checked_agent
    },
    {
      anchor: 'epididymis',
      view: 'side',
      namePl: 'Najądrze',
      nameLat: 'epididymis',
      role: same('Tu plemniki dojrzewają i są przechowywane'),
      tier: 'primary',
      referenceIds: ['statpearls_testes'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_rozrodczy.md: checked_agent
    },
    {
      anchor: 'ductus_deferens',
      view: 'side',
      namePl: 'Nasieniowód',
      nameLat: 'ductus deferens',
      role: same('Przewód od najądrza do przewodu wytryskowego'),
      tier: 'primary',
      referenceIds: ['statpearls_male_gu', 'statpearls_seminal_vesicle'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_draft_1b.md: StatPearls Male GU (2022), Seminal Vesicle (2023), Structure and Function
    },
    {
      anchor: 'seminal_gland',
      view: 'side',
      namePl: 'Pęcherzyk nasienny',
      nameLat: 'glandula seminalis',
      role: same('Gruczoł pod dnem pęcherza; łączy się z nasieniowodem'),
      tier: 'primary',
      referenceIds: ['statpearls_seminal_vesicle'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_draft_1b.md: StatPearls Seminal Vesicle (2023), Introduction; Structure and Function
    },
    {
      anchor: 'prostate',
      view: 'side',
      namePl: 'Gruczoł krokowy (prostata)',
      nameLat: 'prostata',
      role: same('Wydzielina, która chroni plemniki'),
      tier: 'primary',
      referenceIds: ['statpearls_prostate'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_rozrodczy.md: checked_agent
    },
    {
      anchor: 'penis',
      view: 'side',
      namePl: 'Prącie',
      nameLat: 'penis',
      role: same('Oddawanie moczu i rozród; w środku cewka'),
      tier: 'primary',
      referenceIds: ['statpearls_penis'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_rozrodczy.md: checked_agent
    },
    {
      anchor: 'ejaculatory_duct',
      view: 'side',
      namePl: 'Przewód wytryskowy',
      nameLat: 'ductus ejaculatorius',
      role: same('Uchodzi do cewki moczowej w prostacie'),
      tier: 'secondary',
      referenceIds: ['statpearls_seminal_vesicle'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_rozrodczy.md: checked_agent
    },
    {
      anchor: 'urethra_m',
      view: 'side',
      namePl: 'Cewka moczowa',
      nameLat: 'urethra masculina',
      role: same('Jej część gąbczasta biegnie w prąciu'),
      tier: 'secondary',
      referenceIds: ['statpearls_penis'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_draft_1b.md: StatPearls Penis (2023), Introduction
    },
    {
      anchor: 'bladder_m',
      view: 'side',
      namePl: 'Pęcherz moczowy (tło)',
      nameLat: 'vesica urinaria',
      role: same('Gromadzi mocz, punkt orientacyjny'),
      tier: 'secondary',
      referenceIds: ['statpearls_male_gu'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_draft_1b.md: StatPearls Male GU (2022), Structure and Function
    },
    {
      anchor: 'testicular_vessels',
      view: 'side',
      namePl: 'Naczynia jądrowe',
      nameLat: 'a. et v. testicularis',
      role: same('Tętnica i żyła jądra, biegną z jamy brzusznej'),
      tier: 'secondary',
      referenceIds: ['statpearls_testes'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_draft_1b.md: StatPearls Testes (2023), Blood Supply and Lymphatics
    },
    // --- miednica żeńska (widok `detail`)
    {
      anchor: 'ovary',
      view: 'detail',
      namePl: 'Jajnik',
      nameLat: 'ovarium',
      role: same('Dojrzewają w nim komórki jajowe; wydziela hormony'),
      tier: 'primary',
      referenceIds: ['statpearls_ovary'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_rozrodczy.md: checked_agent
    },
    {
      anchor: 'uterine_tube',
      view: 'detail',
      namePl: 'Jajowód',
      nameLat: 'tuba uterina',
      role: same('Droga komórki jajowej i miejsce zapłodnienia'),
      tier: 'primary',
      referenceIds: ['statpearls_fallopian_tube'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_rozrodczy.md: checked_agent
    },
    {
      anchor: 'uterus',
      view: 'detail',
      namePl: 'Macica',
      nameLat: 'uterus',
      role: same('Ciąża, miesiączka i poród'),
      tier: 'primary',
      referenceIds: ['statpearls_uterus'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_rozrodczy.md: checked_agent
    },
    {
      anchor: 'vagina',
      view: 'detail',
      namePl: 'Pochwa',
      nameLat: 'vagina',
      role: same('Do niej uchodzi szyjka macicy'),
      tier: 'primary',
      side: 'right', // układ: 8 podpisów żeńskich w jednej kolumnie nie mieściło się w poziomie rozszerzonym
      referenceIds: ['statpearls_uterus', 'statpearls_female_internal'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_rozrodczy.md: checked_agent
    },
    {
      anchor: 'cervix',
      view: 'detail',
      namePl: 'Szyjka macicy',
      nameLat: 'cervix uteri',
      role: same('Dolna część macicy, wnika do pochwy'),
      tier: 'secondary',
      side: 'right', // układ: 8 podpisów żeńskich w jednej kolumnie nie mieściło się w poziomie rozszerzonym
      referenceIds: ['statpearls_uterus'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_rozrodczy.md: checked_agent
    },
    {
      anchor: 'ovarian_ligament',
      view: 'detail',
      namePl: 'Więzadło właściwe jajnika',
      nameLat: 'lig. ovarii proprium',
      role: same('Łączy jajnik z macicą'),
      tier: 'secondary',
      referenceIds: ['statpearls_ovary'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_draft_1b.md: StatPearls Ovary (2023), Structure and Function
    },
    {
      anchor: 'uterine_artery',
      view: 'detail',
      namePl: 'Tętnica maciczna',
      nameLat: 'a. uterina',
      role: same('Doprowadza krew do macicy'),
      tier: 'secondary',
      side: 'right', // układ: 8 podpisów żeńskich w jednej kolumnie nie mieściło się w poziomie rozszerzonym
      referenceIds: ['statpearls_uterus'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_draft_1b.md: StatPearls Uterus (2025), Blood Supply and Lymphatics
    },
    {
      anchor: 'bladder_f',
      view: 'detail',
      namePl: 'Pęcherz moczowy (tło)',
      nameLat: 'vesica urinaria',
      role: same('Leży przed macicą'),
      tier: 'secondary',
      referenceIds: ['statpearls_uterus'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_rozrodczy.md: checked_agent
    },
  ],
  metrics: [
    {
      labelPl: 'Wolny testosteron we krwi (mężczyźni)',
      rest: 'wartość wyjściowa',
      sprint: 'chwilowy wzrost',
      referenceIds: ['hackney_2012', 'west_2010', 'velasco_orjuela_2018'], // velasco: tylko do „znaczenie niejasne” (poz. 30)
      evidenceLevel: 'preliminary_human',
      notePl:
        'Wzrost jest krótki: po 12 h wolny testosteron był obniżony (w porównaniu z dniem bez wysiłku). Czy takie zmiany mają znaczenie, nie wiadomo: w innym badaniu (HIIT u nieaktywnych mężczyzn) podobne zmiany kortyzolu i stosunku testosteronu do kortyzolu wystąpiły też bez ćwiczeń. W badaniu treningu siłowego chwilowe wyrzuty hormonów nie zwiększyły przyrostu mięśni ani siły.',
      status: 'checked_agent', // fakty_draft_1b.md: treść, cytat i protokół potwierdzone; poprawiony tylko lokalizator (zdanie 9),
      restStatus: 'draft',
      protocolMismatch:
        '90 s biegu przy 100–110% VO₂max / 90 s aktywnej przerwy przy 40% VO₂max przez 42–47 min; mężczyźni wytrenowani wytrzymałościowo (n = 15)',
      quote: 'IE and SSE each caused an increase (p<0.01) in FT, but IE more so than SSE (p<0.05).',
      locator: 'Hackney 2012, abstrakt (jednoakapitowy), zdanie 9; 12 h: zdanie 10',
      measuredAt: 'zaraz po sesji; ponownie 12 h po sesji',
      tier: 'primary',
    },
    {
      labelPl: 'Faza cyklu miesiączkowego a wydolność',
      rest: 'nie dotyczy',
      sprint: 'efekt znikomy',
      referenceIds: ['mcnulty_2020'],
      evidenceLevel: 'contested_debate',
      notePl:
        'We wczesnej fazie folikularnej (pierwsze dni cyklu) wydolność może być bardzo nieznacznie niższa. Jakość dowodów jest niska, więc autorzy nie dają ogólnych zaleceń, tylko radzą obserwować własne reakcje.',
      status: 'checked_agent', // poz. 31-32, 34
      restStatus: 'checked_agent', // jawnie (zgromadzenie D1): spoczynek = status liczby
      protocolMismatch: 'metaanaliza 78 badań z różnymi testami wytrzymałości i siły, nie interwały 45/45 s',
      quote:
        'exercise performance might be trivially reduced during the early follicular phase of the MC, compared to all other phases.',
      locator: 'McNulty 2020, abstrakt (Conclusion)',
      measuredAt: 'testy wysiłkowe powtarzane w różnych fazach cyklu',
      tier: 'primary',
    },
    {
      labelPl: 'REDs, dawniej RED-S (niedobór energii w sporcie)',
      rest: 'nie dotyczy',
      sprint: 'nie dotyczy (skutek tygodni)',
      referenceIds: ['mountjoy_2023'],
      evidenceLevel: 'established_human',
      notePl:
        'Gdy przez dłuższy czas je się za mało w stosunku do treningu, cierpi zdrowie (także praca układu rozrodczego) i wyniki, u kobiet i u mężczyzn. Jeden trening tego nie wywołuje.',
      status: 'checked_agent', // poz. 35-36; zmieniona tylko nazwa skrótu wg sprawdzającego
      restStatus: 'checked_agent', // jawnie (zgromadzenie D1): spoczynek = status liczby
      protocolMismatch: 'nie dotyczy pojedynczego wysiłku: to skutek długotrwałego niedoboru energii',
      quote:
        'a syndrome of deleterious health and performance outcomes experienced by female and male athletes exposed to low energy availability (LEA; inadequate energy intake in relation to exercise energy expenditure)',
      locator: 'Mountjoy 2023 (konsensus MKOl), abstrakt',
      measuredAt: 'długoterminowo (tygodnie, miesiące)',
      tier: 'primary',
    },
    {
      labelPl: 'Faza cyklu: wielkość efektu (ES)',
      rest: '—',
      sprint: '−0,06 (95% CrI od −0,16 do 0,04)',
      referenceIds: ['mcnulty_2020'],
      evidenceLevel: 'contested_debate',
      notePl:
        'Wczesna faza folikularna wobec pozostałych faz razem (51 badań, model bayesowski). Wartość bliska zeru, przedział obejmuje zero.',
      status: 'checked_agent', // poz. 33
      protocolMismatch: 'metaanaliza różnych testów wytrzymałości i siły',
      quote: '(ES0.5 = - 0.06 [95% credible interval (CrI): - 0.16 to 0.04])',
      locator: 'McNulty 2020, abstrakt (Results)',
      measuredAt: 'testy wysiłkowe powtarzane w różnych fazach cyklu',
      tier: 'student', // zgromadzenie, runda końcowa
    },
  ],
  creditsPl:
    'Modele: Z-Anatomy (CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP): miednica i narządy płciowe mężczyzny. HuBMAP Human Reference Atlas, VH Female (macica, jajniki, jajowody, pochwa, więzadła jajnika, naczynia maciczne, pęcherz moczowy, miednica, kręgi; CC BY 4.0). Render i opracowanie: BIOGENESIS, CC BY-SA 4.0.',
};
