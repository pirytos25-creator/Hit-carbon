import type { AtlasPlateContent } from '../types';

/**
 * Plansza układu dokrewnego (hormonalnego), faza 1b, agent 6. Render: blender/atlas/plate_hormonalny.py.
 * Plan faktów z cytatami: notatki sesji, hormonalny/fakty_plan.md (raport K1/K2).
 *
 * Wszystkie fakty mają status `draft`. Status `checked_agent` nadaje niezależny sprawdzający Dyrygenta, nie autor.
 * Protokół wzorcowy: 6 × (45 s przy ok. 88% VO₂max / 45 s przerwy). Najbliższe znalezione dane to ciągły wysiłek
 * przy 87% VO₂max (Sigal 1994, 1996), dlatego każda liczba ma `protocolMismatch`.
 * Korekta briefu (przyjęta na K1): przy ok. 87% VO₂max insulina prawie się nie zmienia, a glukagon rośnie
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
    sprint:
      'W sprincie nerwy współczulne każą rdzeniowi nadnerczy wyrzucić adrenalinę. Przy bardzo intensywnym wysiłku jej stężenie we krwi rośnie kilkanaście razy. Adrenalina płynie z krwią do serca, mięśni i wątroby, a wątroba wypuszcza do krwi kilka razy więcej glukozy. Insulina i glukagon zmieniają się przy tym niewiele. Przysadka wydziela więcej hormonu antydiuretycznego (ADH), a hormon wzrostu i kortyzol rosną wolniej, w minutach po wysiłku.',
  },
  summaryReferenceIds: {
    rest: ['marliss_vranic_2002'],
    sprint: ['marliss_vranic_2002', ...SIGAL, 'kindermann_1982', 'convertino_1981', 'stokes_2002', 'hill_2008'],
  },
  summaryStatus: { rest: 'draft', sprint: 'draft' },
  protocolNotePl:
    'Sprint na tej planszy to koniec 45 s pracy przy ok. 88% VO₂max. Liczby pochodzą z badań ciągłego wysiłku przy 80–87% VO₂max albo z 30 s sprintu maksymalnego, więc dla jednego interwału są tylko przybliżeniem.',
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
      roleStatus: { rest: 'draft', sprint: 'draft' },
    },
    {
      anchor: 'pituitary',
      view: 'front',
      namePl: 'Przysadka mózgowa',
      nameLat: 'hypophysis',
      role: { rest: 'Mało ADH i hormonu wzrostu', sprint: 'Więcej ADH i ACTH; hormon wzrostu później' },
      tier: 'primary',
      side: 'right',
      referenceIds: ['convertino_1981', 'hill_2008', 'stokes_2002'],
      roleStatus: { rest: 'draft', sprint: 'draft' },
    },
    {
      anchor: 'pineal',
      view: 'front',
      namePl: 'Szyszynka',
      nameLat: 'glandula pinealis',
      role: { rest: '', sprint: '' },
      tier: 'secondary',
      side: 'right',
    },
    {
      anchor: 'thyroid',
      view: 'front',
      namePl: 'Tarczyca',
      nameLat: 'glandula thyroidea',
      role: { rest: '', sprint: '' },
      tier: 'primary',
    },
    {
      anchor: 'thymus',
      view: 'front',
      namePl: 'Grasica',
      nameLat: 'thymus',
      role: { rest: '', sprint: '' },
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
      roleStatus: { rest: 'draft', sprint: 'draft' },
    },
    {
      anchor: 'pancreas',
      view: 'front',
      namePl: 'Trzustka',
      nameLat: 'pancreas',
      role: { rest: 'Insulina i glukagon trzymają stały cukier', sprint: 'Zmiana niewielka: glukagon lekko w górę' },
      tier: 'primary',
      side: 'left',
      referenceIds: [...SIGAL, 'marliss_vranic_2002'],
      roleStatus: { rest: 'draft', sprint: 'draft' },
    },
    {
      anchor: 'portal_vein',
      view: 'front',
      namePl: 'Żyła wrotna',
      nameLat: 'v. portae hepatis',
      role: { rest: 'Krew z trzustki i jelit do wątroby', sprint: 'Niesie glukagon i insulinę do wątroby' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'draft' },
    },
    {
      anchor: 'ivc',
      view: 'front',
      namePl: 'Żyła główna dolna',
      nameLat: 'v. cava inferior',
      role: { rest: 'Krew z dolnej części ciała do serca', sprint: 'Niesie adrenalinę z nadnerczy do serca' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'draft' },
    },
    {
      anchor: 'adrenal',
      view: 'front',
      namePl: 'Nadnercza',
      nameLat: 'glandulae suprarenales',
      role: { rest: 'Mało adrenaliny we krwi', sprint: 'Wyrzut adrenaliny do krwi' },
      tier: 'primary',
      side: 'right',
      referenceIds: ['marliss_vranic_2002', 'kindermann_1982', 'brooks_1988'],
      roleStatus: { rest: 'draft', sprint: 'draft' },
    },
    {
      anchor: 'kidney',
      view: 'front',
      namePl: 'Nerka lewa',
      nameLat: 'ren sinister',
      role: { rest: 'Nadnercze leży na jej górnym biegunie', sprint: 'Nadnercze leży na jej górnym biegunie' },
      tier: 'secondary',
      side: 'right',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    // ---------------------------------------------------------------- zbliżenie: nadnercze prawe (schemat warstw)
    {
      anchor: 'd_cortex',
      view: 'detail',
      namePl: 'Kora nadnercza',
      nameLat: 'cortex glandulae suprarenalis',
      role: { rest: 'Wydziela kortyzol w rytmie dnia', sprint: 'Kortyzol rośnie dopiero w dłuższym wysiłku' },
      tier: 'primary',
      referenceIds: ['hill_2008'],
      roleStatus: { rest: 'draft', sprint: 'draft' },
    },
    {
      anchor: 'd_medulla',
      view: 'detail',
      namePl: 'Rdzeń nadnercza',
      nameLat: 'medulla glandulae suprarenalis',
      role: { rest: 'Mało adrenaliny', sprint: 'Adrenalina do krwi: kilkanaście razy więcej' },
      tier: 'primary',
      referenceIds: ['marliss_vranic_2002', ...SIGAL],
      roleStatus: { rest: 'draft', sprint: 'draft' },
    },
    {
      anchor: 'd_artery',
      view: 'detail',
      namePl: 'T. nadnerczowa dolna',
      nameLat: 'a. suprarenalis inferior',
      role: { rest: 'Krew z tętnicy nerkowej do nadnercza', sprint: 'Krew z tętnicy nerkowej do nadnercza' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'd_ivc',
      view: 'detail',
      namePl: 'Żyła główna dolna',
      nameLat: 'v. cava inferior',
      role: { rest: 'Odbiera krew z nadnercza prawego', sprint: 'Zabiera adrenalinę do serca' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'draft' },
    },
    {
      anchor: 'd_kidney',
      view: 'detail',
      namePl: 'Nerka prawa',
      nameLat: 'ren dexter',
      role: { rest: 'Górny biegun pod nadnerczem', sprint: 'Górny biegun pod nadnerczem' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
  ],
  metrics: [
    {
      labelPl: 'Adrenalina we krwi',
      rest: '1×',
      sprint: '14–18×',
      unit: 'spoczynku',
      referenceIds: ['marliss_vranic_2002', ...SIGAL],
      evidenceLevel: 'established_human',
      notePl:
        'Krotność stężenia w spoczynku przy bardzo intensywnym wysiłku (powyżej 80% VO₂max). Przy 87% VO₂max: ponad 12 razy, szczyt ok. 1,7 nmol/L.',
      status: 'draft',
      protocolMismatch: 'ok. 14 min ciągłego wysiłku przy 87–100% VO₂max (do wyczerpania)',
      quote:
        'In contrast, in intense exercise there is a marked 14-to 18-fold increase of both EPI and NE (Fig. 1C and D) (e.g., 19, [21] [22] [23] 25, 26) to levels seen in pheochromocytoma.',
      locator: 'Marliss i Vranic 2002, pełny tekst, część o katecholaminach, rys. 1C–D; Sigal 1996, abstrakt („> 12-fold”); Sigal 1994, abstrakt (1715 pmol/L w grupie C)',
      conversionNote: '1715 pmol/L = 1,7 nmol/L',
      measuredAt: 'szczyt pod koniec wysiłku',
    },
    {
      labelPl: 'Glukoza wypuszczana do krwi (głównie z wątroby)',
      rest: '1×',
      sprint: '4–6×',
      unit: 'spoczynku',
      referenceIds: SIGAL,
      evidenceLevel: 'established_human',
      notePl: 'Napędzają ją głównie adrenalina i noradrenalina, a nie insulina i glukagon.',
      status: 'draft',
      protocolMismatch: 'ok. 14 min ciągłego wysiłku przy 87% VO₂max',
      quote: 'The rate of glucose appearance (Ra) rose about 8-fold in both MAX and P, but only 4-fold in C (P = 0.001).',
      locator: 'Sigal 1994, abstrakt (C = 87% VO₂max); Sigal 1996, abstrakt: „Ra increased sixfold in control and both IC groups.”',
      measuredAt: 'w czasie wysiłku',
    },
    {
      labelPl: 'Hormon wzrostu we krwi',
      rest: 'niski',
      sprint: 'szczyt ok. 30 min po',
      referenceIds: ['stokes_2002', 'pritzlaff_1999', 'godfrey_2003'],
      evidenceLevel: 'established_human',
      notePl: 'Hormon wzrostu rośnie z opóźnieniem: najwyżej jest ok. pół godziny po sprincie, a nie w jego trakcie.',
      status: 'draft',
      protocolMismatch: '30 s sprint maksymalny na cykloergometrze',
      quote:
        'The first sprint resulted in a distinct GH pulse with highest measured mean concentrations of 40.8 ± 8.2 and 20.8 ± 6.1 mU/l 30 min after the sprint in the fast and slow trials, respectively.',
      locator: 'Stokes 2002, Wyniki („Hormone responses to cycle ergometer sprinting”), rys. 4',
      measuredAt: '30 min po sprincie',
    },
    {
      labelPl: 'Kortyzol we krwi',
      rest: '—',
      sprint: '+83% po 30 min',
      referenceIds: ['hill_2008', 'peake_2014'],
      evidenceLevel: 'established_human',
      notePl:
        'Po 30 min wysiłku przy 80% VO₂max; przy 40% VO₂max kortyzol nie rósł. W jednym 45 s interwale wyraźnej zmiany się nie spodziewamy. Część wzrostu to zagęszczenie krwi.',
      status: 'draft',
      protocolMismatch: '30 min ciągłego wysiłku przy 80% VO₂max',
      quote:
        'The percent change in cortisol from pre- to post-sampling at each session was: resting-control, 40, 60, and 80% sessions (mean+/-SD) =-6.6+/-3.5%, +5.7+/-11.0%, +39.9+/-11.8%, and +83.1+/-18.5%, respectively.',
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
      notePl: 'Przy 87% VO₂max insulina lekko spadła, a glukagon się nie zmienił. Po wysiłku insulina rośnie przez 40–60 min.',
      status: 'draft',
      protocolMismatch: 'ciągły wysiłek przy 87% VO₂max',
      quote: 'the glucagon-to-insulin ratio increased from 0.20 to 0.26 (P = 0.02)',
      locator: 'Sigal 1996, abstrakt',
      measuredAt: 'w czasie wysiłku',
      tier: 'student',
    },
  ],
  creditsPl:
    'Modele: Z-Anatomy (gruczoły dokrewne, naczynia jako krzywe, szkielet; CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP), oraz HuBMAP Human Reference Atlas, VH Male (nerki; CC BY 4.0). Podział nadnercza na korę i rdzeń: schemat BIOGENESIS. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0.',
};
