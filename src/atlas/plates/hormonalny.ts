import type { AtlasPlateContent } from '../types';

/**
 * Plansza układu dokrewnego (hormonalnego), faza 1b, agent 6. Render: blender/atlas/plate_hormonalny.py.
 * Plan faktów z cytatami: notatki sesji, hormonalny/fakty_plan.md (raporty K1-K3).
 * Statusy: docs/atlas_audyt/fakty_hormonalny.md (numery # = wiersze audytu). Po audycie K2: potwierdzone = checked_agent
 * albo anatomy, zmienione = draft. Status `checked_agent` nadaje niezależny sprawdzający Dyrygenta, nie autor.
 * Protokół wzorcowy: 6 × (45 s przy ok. 88% VO₂max / 45 s przerwy). Najbliższe znalezione dane to ciągły wysiłek
 * przy 87% VO₂max (Sigal 1994, 1996), dlatego każda liczba ma `protocolMismatch`.
 * Korekta briefu (przyjęta na K1): przy ok. 87% VO₂max insulina prawie się nie zmienia, a glukagon najwyżej rośnie
 * umiarkowanie, więc trzustka w sprincie świeci słabiej niż nadnercza i przysadka.
 * Tarczyca, szyszynka i grasica: same nazwy (opis roli bez źródła, decyzja Dyrygenta K1), więc `role` jest pusty.
 */
const SIGAL = ['sigal_1994', 'sigal_1996'];

export const HORMONALNY: AtlasPlateContent = {
  id: 'hormonalny',
  titlePl: 'Układ dokrewny (hormonalny)',
  subtitlePl: 'Jak mózg i nadnercza w kilka chwil przestawiają ciało na sprint',
  colorVar: '--sys-endo',
  views: ['front', 'detail'],
  viewTitlesPl: { front: 'Głowa i tułów z przodu', detail: 'Nadnercze prawe: kora i rdzeń (schemat)' },
  summary: {
    rest:
      'W spoczynku gruczoły dokrewne wydzielają hormony spokojnie, w rytmie dnia i posiłków. We krwi jest mało adrenaliny. Insulina i glukagon z trzustki utrzymują stały poziom cukru.',
    // Zdania #3-#7 audytu, dosłownie w sprawdzonym brzmieniu. Usunięte zdanie #8 (disputed: kortyzol „w minutach po”);
    // hormon wzrostu i kortyzol są w podpisie kory nadnercza i w liczbach.
    sprint:
      'W sprincie nerwy współczulne każą rdzeniowi nadnerczy wyrzucić adrenalinę. Przy bardzo intensywnym wysiłku jej stężenie we krwi rośnie kilkanaście razy. Adrenalina płynie z krwią do serca, mięśni i wątroby, a wątroba wypuszcza do krwi kilka razy więcej glukozy. Insulina i glukagon zmieniają się przy tym niewiele. Przysadka wydziela więcej hormonu antydiuretycznego (ADH).',
  },
  summaryReferenceIds: {
    rest: ['marliss_vranic_2002', 'godfrey_2003', 'brooks_1988'],
    sprint: ['kindermann_1982', ...SIGAL, 'marliss_vranic_2002', 'convertino_1981'],
  },
  summaryStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #2 (+ referencje); #3-#7
  protocolNotePl:
    'Sprint na tej planszy to koniec 45 s pracy przy ok. 88% VO₂max. Liczby pochodzą z badań ciągłego wysiłku przy 80–87% VO₂max, z 30 s sprintu maksymalnego albo z krótkiego biegu do wyczerpania, więc dla jednego interwału są tylko przybliżeniem. Liczby pochodzą z późniejszych interwałów (po kilku minutach sesji).',
  protocolNoteStatus: 'disputed', // fakty_kontrola_koncowa.md: zdanie o „późniejszych interwałach” nieprawdziwe - ukryte
  labels: [
    // ---------------------------------------------------------------- widok: głowa i tułów
    {
      anchor: 'hypothalamus',
      view: 'front',
      namePl: 'Podwzgórze',
      nameLat: 'hypothalamus',
      role: { rest: 'Steruje przysadką', sprint: 'Uruchamia oś stresu: przysadka i nadnercza' },
      tier: 'primary',
      side: 'left',
      referenceIds: ['hill_2008'],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #10, #11
    },
    {
      anchor: 'pituitary',
      view: 'front',
      namePl: 'Przysadka mózgowa',
      nameLat: 'hypophysis',
      role: { rest: 'Mało ADH i hormonu wzrostu', sprint: 'Więcej ADH i ACTH; hormon wzrostu później' },
      tier: 'primary',
      side: 'right',
      referenceIds: ['convertino_1981', 'hill_2008', 'stokes_2002', 'peake_2014'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #12, #13
    },
    {
      anchor: 'pineal',
      view: 'front',
      namePl: 'Szyszynka',
      nameLat: 'glandula pinealis',
      role: { rest: '', sprint: '' },
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' }, // fakty_koncowe_B_horm_mocz_pokarm.md: sama nazwa (opis pusty)
      tier: 'secondary',
      side: 'right',
    },
    {
      anchor: 'thyroid',
      view: 'front',
      namePl: 'Tarczyca',
      nameLat: 'glandula thyroidea',
      role: { rest: '', sprint: '' },
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' }, // fakty_koncowe_B_horm_mocz_pokarm.md: sama nazwa (opis pusty)
      tier: 'primary',
    },
    {
      anchor: 'thymus',
      view: 'front',
      namePl: 'Grasica (narząd limfatyczny)',
      nameLat: 'thymus',
      role: { rest: '', sprint: '' },
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' }, // fakty_koncowe_B_horm_mocz_pokarm.md: sama nazwa (opis pusty)
      tier: 'secondary',
    },
    {
      anchor: 'liver',
      view: 'front',
      namePl: 'Wątroba (narząd docelowy)',
      nameLat: 'hepar',
      role: { rest: 'Powoli oddaje glukozę do krwi', sprint: 'Oddaje 4–6 razy więcej glukozy' },
      tier: 'primary',
      side: 'left',
      referenceIds: SIGAL,
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #17, #18
    },
    {
      anchor: 'pancreas',
      view: 'front',
      namePl: 'Trzustka',
      nameLat: 'pancreas',
      role: { rest: 'Insulina i glukagon trzymają stały cukier', sprint: 'Zmiana niewielka: glukagon bez zmian lub lekko w górę' },
      tier: 'primary',
      side: 'left',
      referenceIds: [...SIGAL, 'marliss_vranic_2002'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #19; fakty_koncowe_B_horm_mocz_pokarm.md: Sigal 1994/1996, Marliss i Vranic 2002
    },
    {
      anchor: 'portal_vein',
      view: 'front',
      namePl: 'Żyła wrotna',
      nameLat: 'v. portae hepatis',
      role: { rest: 'Krew z trzustki i jelit do wątroby', sprint: 'Niesie glukagon i insulinę do wątroby' },
      tier: 'secondary',
      referenceIds: ['marliss_vranic_2002'],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #21, #22 (+ referencja)
    },
    {
      anchor: 'ivc',
      view: 'front',
      namePl: 'Żyła główna dolna',
      nameLat: 'v. cava inferior',
      role: { rest: 'Krew z dolnej części ciała do serca', sprint: 'Niesie adrenalinę z nadnerczy do serca' },
      tier: 'secondary',
      referenceIds: ['sigal_1996'],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #23, #24 (+ referencja)
    },
    {
      anchor: 'adrenal',
      view: 'front',
      namePl: 'Nadnercza',
      nameLat: 'glandulae suprarenales',
      role: { rest: 'Mało adrenaliny we krwi', sprint: 'Wyrzut adrenaliny do krwi' },
      tier: 'primary',
      side: 'right',
      referenceIds: ['brooks_1988', 'kindermann_1982', 'sigal_1996'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #25, #26
    },
    {
      anchor: 'kidney',
      view: 'front',
      namePl: 'Nerka lewa',
      nameLat: 'ren sinister',
      role: { rest: 'Nadnercze przylega do jej górnego bieguna', sprint: 'Nadnercze przylega do jej górnego bieguna' },
      tier: 'secondary',
      side: 'right',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' }, // #27 (doprecyzowane wg uwagi audytu)
    },
    // ---------------------------------------------------------------- zbliżenie: nadnercze prawe (schemat warstw)
    {
      anchor: 'd_cortex',
      view: 'detail',
      namePl: 'Kora nadnercza',
      nameLat: 'cortex glandulae suprarenalis',
      role: { rest: 'Wydziela kortyzol w rytmie dnia', sprint: 'Kortyzol rośnie w dłuższym albo bardzo intensywnym wysiłku' },
      tier: 'primary',
      referenceIds: ['hill_2008', 'kindermann_1982', 'peake_2014'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #28; fakty_koncowe_B_horm_mocz_pokarm.md: Hill 2008, Kindermann 1982, Peake 2014
    },
    {
      anchor: 'd_medulla',
      view: 'detail',
      namePl: 'Rdzeń nadnercza',
      nameLat: 'medulla glandulae suprarenalis',
      role: { rest: 'Mało adrenaliny', sprint: 'Adrenalina do krwi: kilkanaście razy więcej' },
      tier: 'primary',
      referenceIds: ['brooks_1988', ...SIGAL],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #30 (+ referencja), #31
    },
    {
      anchor: 'd_artery',
      view: 'detail',
      namePl: 'T. nadnerczowa dolna',
      nameLat: 'a. suprarenalis inferior',
      role: { rest: 'Krew z tętnicy nerkowej do nadnercza', sprint: 'Krew z tętnicy nerkowej do nadnercza' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' }, // #32
    },
    {
      anchor: 'd_ivc',
      view: 'detail',
      namePl: 'Żyła główna dolna',
      nameLat: 'v. cava inferior',
      role: { rest: 'Odbiera krew z nadnercza prawego', sprint: 'Zabiera adrenalinę do serca' },
      tier: 'secondary',
      referenceIds: ['sigal_1996'],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #33, #34 (+ referencja)
    },
    {
      anchor: 'd_kidney',
      view: 'detail',
      namePl: 'Nerka prawa',
      nameLat: 'ren dexter',
      role: { rest: 'Górny biegun pod nadnerczem', sprint: 'Górny biegun pod nadnerczem' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' }, // #35
    },
  ],
  metrics: [
    {
      labelPl: 'Adrenalina we krwi',
      rest: '1×',
      sprint: 'ponad 12×',
      unit: 'spoczynku',
      referenceIds: [...SIGAL, 'brooks_1988'],
      evidenceLevel: 'established_human',
      notePl:
        'Krotność stężenia w spoczynku przy ok. 87% VO₂max; szczyt ok. 1,7 nmol/L. Dla porównania po 30 s sprintu maksymalnego: ok. 7 razy (0,2 → 1,4 nmol/L).',
      status: 'checked_agent', // fakty_koncowe_B_horm_mocz_pokarm.md: Sigal 1996/1994, Brooks 1988
      restStatus: 'checked_agent', // jawnie (zgromadzenie D1): spoczynek = status liczby
      protocolMismatch: 'ok. 14 min ciągłego wysiłku przy 87% VO₂max',
      quote: 'Plasma norepinephrine and epinephrine likewise increased > 12-fold with no differences among groups',
      locator: 'Sigal 1996, abstrakt; Sigal 1994, abstrakt (1715 pmol/L w grupie C); Brooks 1988, abstrakt (0,2 → 1,4 nmol/L)',
      conversionNote: '1715 pmol/L = 1,7 nmol/L; 1,4 / 0,2 = 7',
      measuredAt: 'w czasie wysiłku',
    },
    {
      labelPl: 'Glukoza wypuszczana do krwi (głównie z wątroby)',
      rest: '1×',
      sprint: '4–6×',
      unit: 'spoczynku',
      referenceIds: SIGAL,
      evidenceLevel: 'established_human',
      notePl: 'Napędzają ją głównie adrenalina i noradrenalina, a nie insulina i glukagon.',
      status: 'checked_agent', // #38, #39
      restStatus: 'checked_agent', // jawnie (zgromadzenie D1): spoczynek = status liczby
      protocolMismatch: 'ok. 14 min ciągłego wysiłku przy 87% VO₂max',
      quote: 'The rate of glucose appearance (Ra) rose about 8-fold in both MAX and P, but only 4-fold in C (P = 0.001). | Ra increased sixfold in control and both IC groups',
      locator: 'Sigal 1994, abstrakt (C = 87% VO₂max); Sigal 1996, abstrakt: „Ra increased sixfold in control and both IC groups.”',
      measuredAt: 'w czasie wysiłku',
    },
    {
      labelPl: 'Hormon wzrostu we krwi',
      rest: 'niski',
      sprint: 'nadal wyższy 60 min po',
      referenceIds: ['stokes_2002', 'pritzlaff_1999', 'godfrey_2003'],
      evidenceLevel: 'established_human',
      notePl:
        'Hormon wzrostu rośnie z opóźnieniem i zostaje podwyższony długo po sprincie. W tym badaniu drugi sprint, godzinę po pierwszym, nie wywołał już wzrostu.',
      status: 'checked_agent', // fakty_koncowe_B_horm_mocz_pokarm.md: Stokes 2002
      restStatus: 'checked_agent', // jawnie (zgromadzenie D1): spoczynek = status liczby
      protocolMismatch: '30 s sprint maksymalny na cykloergometrze',
      quote:
        'serum GH was still elevated 60 min after the first sprint. The second sprint in each trial did not elicit a serum GH response',
      locator: 'Stokes 2002, abstrakt; Results, ryc. 4 (szczyt po 30 min)',
      measuredAt: '60 min po sprincie',
    },
    {
      labelPl: 'Kortyzol we krwi',
      rest: '—',
      sprint: '+83% po 30 min',
      referenceIds: ['hill_2008'],
      evidenceLevel: 'established_human',
      notePl: 'Po 30 min wysiłku przy 80% VO₂max; przy 40% VO₂max kortyzol nie rósł. Część wzrostu to zagęszczenie krwi.',
      status: 'checked_agent', // #41, #42; usunięte zdanie #43 (disputed)
      protocolMismatch: '30 min ciągłego wysiłku przy 80% VO₂max',
      quote:
        'The percent change in cortisol from pre- to post-sampling at each session was: resting-control, 40, 60, and 80% sessions (mean+/-SD) =-6.6+/-3.5%, +5.7+/-11.0%, +39.9+/-11.8%, and +83.1+/-18.5%, respectively. | Twelve active moderately trained men performed 30 min of exercise',
      locator: 'Hill 2008, abstrakt',
      measuredAt: 'zaraz po 30 min wysiłku',
    },
    // ---------------------------------------------------------------- dla studentów
    {
      labelPl: 'Stosunek glukagon : insulina',
      rest: '0,20',
      sprint: '0,26',
      referenceIds: ['sigal_1996'],
      evidenceLevel: 'established_human',
      notePl: 'Przy 87% VO₂max insulina lekko spadła, a glukagon się nie zmienił.',
      status: 'checked_agent', // #44, #45; zdanie #46 przeniesione do osobnej liczby niżej
      restStatus: 'checked_agent', // jawnie (zgromadzenie D1): spoczynek = status liczby
      protocolMismatch: 'ciągły wysiłek przy 87% VO₂max',
      quote: 'the glucagon-to-insulin ratio increased from 0.20 to 0.26 (P = 0.02)',
      locator: 'Sigal 1996, abstrakt',
      measuredAt: 'w czasie wysiłku',
      tier: 'student',
    },
    {
      labelPl: 'Insulina po wysiłku',
      rest: '—',
      sprint: 'zależy od wysiłku',
      referenceIds: ['marliss_vranic_2002', 'marliss_1992', 'peake_2014'],
      evidenceLevel: 'established_human', // sprawdzający: to zależność od protokołu, nie spór
      notePl:
        'Po wysiłku do wyczerpania insulina rośnie (ok. 2×) i zostaje podwyższona przez 40–60 min. Po interwałach przy ok. 82% VO₂max (wytrenowani kolarze i triathloniści) spadała.',
      status: 'checked_agent', // fakty_koncowe_B_horm_mocz_pokarm.md: disputed -> brzmienie dosłownie wg sprawdzającego
      protocolMismatch: 'wysiłek do wyczerpania (przegląd) i interwały przy ok. 82% VO₂max',
      quote:
        'requiring a substantial rise in insulin for 40--60 min to restore pre-exercise levels | then doubled to 162 +/- 28 pmol/l until 20 min recovery, before declining | Plasma insulin decreased during recovery from both HIIT and MOD',
      locator: 'Marliss i Vranic 2002, abstrakt; Marliss 1992, abstrakt; Peake 2014, abstrakt',
      measuredAt: 'po wysiłku',
      tier: 'student',
    },
  ],
  creditsPl:
    'Modele: Z-Anatomy (gruczoły dokrewne, naczynia jako krzywe, szkielet; CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP), oraz HuBMAP Human Reference Atlas, VH Male (nerki; CC BY 4.0). Podział nadnercza na korę i rdzeń: schemat BIOGENESIS. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0.',
};
