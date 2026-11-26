import type { AtlasPlateContent } from '../types';

/**
 * Plansza układu nerwowego (faza 1, agent 1). Render: blender/atlas/plate_nerwowy.py.
 * Kotwice podpisów: public/atlas/nerwowy/anchors.json. Strzałki: flows3d.json (metry, rzutowane kamerą widoku).
 * Fakty: docs/atlas_audyt/fakty_nerwowy.md (statusy, cytaty i lokalizatory stamtąd; numery # = wiersze audytu).
 */
export const NERWOWY: AtlasPlateContent = {
  id: 'nerwowy',
  titlePl: 'Układ nerwowy',
  subtitlePl: 'Jak rozkaz z mózgu dociera do nóg i jak układ współczulny mobilizuje ciało',
  colorVar: '--sys-nerve',
  views: ['front', 'back'],
  viewTitlesPl: { front: 'Widok z przodu', back: 'Widok z tyłu' },
  summary: {
    rest:
      'W spoczynku nerwy ruchowe nóg prawie milczą: kilka małych jednostek ruchowych podtrzymuje postawę, wyładowując się z małą częstotliwością. Przeważa nerw błędny, a układ współczulny pracuje oszczędnie.',
    sprint:
      'W sprincie kora ruchowa wysyła rozkaz drogą korowo-rdzeniową. Większość jej włókien krzyżuje się w rdzeniu przedłużonym, więc lewa półkula steruje głównie prawą nogą. W rdzeniu kręgowym rozkaz przechodzi na motoneurony, a stamtąd biegnie nerwami kulszowym, piszczelowym i udowym do mięśni. Włączają się kolejne jednostki ruchowe (najpierw o niskim, potem o wysokim progu pobudzenia), a ich częstotliwość wyładowań rośnie. Jednocześnie układ współczulny przyspiesza serce, a rdzeń nadnerczy wyrzuca do krwi adrenalinę.',
  },
  summaryReferenceIds: {
    sprint: ['statpearls_pyramidal', 'statpearls_corticospinal', 'statpearls_lower_limb_nerves', 'duchateau_enoka_2022', 'enoka_duchateau_2017', 'garcia_2022', 'statpearls_ans', 'brooks_1988'],
  },
  // Reguła 1b: dopóki `summary.sprint` czeka na sprawdzenie, na ekranie są tylko zdania już potwierdzone (brzmienie sprzed poprawki).
  summaryVerified: {
    sprint: {
      text: 'W sprincie kora ruchowa wysyła rozkaz drogą korowo-rdzeniową. Większość jej włókien krzyżuje się w rdzeniu przedłużonym, więc lewa półkula steruje głównie prawą nogą. W rdzeniu kręgowym rozkaz przechodzi na motoneurony, a stamtąd biegnie nerwami kulszowym, piszczelowym i udowym do mięśni. Jednocześnie układ współczulny przyspiesza serce, a rdzeń nadnerczy wyrzuca do krwi adrenalinę.',
      referenceIds: ['statpearls_pyramidal', 'statpearls_corticospinal', 'statpearls_lower_limb_nerves', 'statpearls_ans', 'garcia_2022'],
      source: 'fakty_draft_1b.md, nerwowy summary (sprint): zdania 1, 2, 3 i 5 mają oparcie',
    },
  },
  summaryStatus: { rest: 'unverifiable', sprint: 'draft' }, // fakty_draft_1b.md: disputed („coraz większe”) -> „niski, potem wysoki próg” = draft
  labels: [
    {
      anchor: 'intercostal',
      view: 'front',
      namePl: 'Nerwy międzyżebrowe',
      nameLat: 'nn. intercostales',
      role: { rest: 'Pomagają przeponie', sprint: 'Szybki, głęboki oddech' },
      tier: 'secondary',
      roleStatus: { rest: 'unverifiable', sprint: 'unverifiable' }, // #26; fakty_draft_K3_ruch.md: spoczynek unverifiable (brak źródła)
    },
    {
      anchor: 'sympathetic_trunk',
      view: 'front',
      namePl: 'Pień współczulny',
      nameLat: 'truncus sympathicus',
      role: { rest: 'Niska aktywność, przewaga n. błędnego', sprint: 'Mobilizacja: serce, naczynia, pot' },
      tier: 'primary',
      referenceIds: ['statpearls_ans', 'garcia_2022'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #18, #27
    },
    {
      anchor: 'adrenal',
      view: 'front',
      namePl: 'Rdzeń nadnercza',
      nameLat: 'medulla glandulae suprarenalis',
      role: { rest: 'Mało adrenaliny we krwi', sprint: 'Wyrzut adrenaliny do krwi' },
      tier: 'primary',
      referenceIds: ['brooks_1988'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #28
    },
    {
      anchor: 'lumbar_plexus',
      view: 'front',
      namePl: 'Splot lędźwiowy',
      nameLat: 'plexus lumbalis',
      role: { rest: 'Prawie cisza', sprint: 'Rozdziela rozkaz na biodro i udo' },
      tier: 'secondary',
      referenceIds: ['statpearls_lumbar_plexus'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #29, #34
    },
    {
      anchor: 'femoral',
      view: 'front',
      namePl: 'Nerw udowy',
      nameLat: 'n. femoralis',
      role: { rest: 'Prawie cisza', sprint: 'Czworogłowy prostuje kolano' },
      tier: 'primary',
      referenceIds: ['statpearls_femoral_nerve'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #30, #34
    },
    {
      anchor: 'obturator',
      view: 'front',
      namePl: 'Nerw zasłonowy',
      nameLat: 'n. obturatorius',
      role: { rest: 'Prawie cisza', sprint: 'Unerwia przywodziciele uda' },
      tier: 'secondary',
      referenceIds: ['statpearls_lumbar_plexus'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #31, #34; fakty_draft_K3_ruch.md: StatPearls Lumbar Plexus, Nerves (obturator)
    },
    {
      anchor: 'deep_fibular',
      view: 'front',
      namePl: 'Nerw strzałkowy głęboki',
      nameLat: 'n. fibularis profundus',
      role: { rest: 'Prawie cisza', sprint: 'Unerwia przedni przedział goleni' },
      tier: 'secondary',
      referenceIds: ['statpearls_lower_limb_nerves'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #32, #34; fakty_draft_K3_ruch.md: StatPearls Lower Limb Nerves, Structure and Function
    },
    {
      anchor: 'motor_cortex',
      view: 'back',
      namePl: 'Kora ruchowa',
      nameLat: 'gyrus precentralis',
      role: { rest: 'Drobne korekty postawy', sprint: 'Wysyła rozkaz ruchu do nóg' },
      tier: 'primary',
      referenceIds: ['statpearls_lateral_cst', 'statpearls_pyramidal'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #33, #34
    },
    {
      anchor: 'spinal_cord',
      view: 'back',
      namePl: 'Rdzeń kręgowy',
      nameLat: 'medulla spinalis',
      role: { rest: 'Odruchy i napięcie postawy', sprint: 'Przekazuje rozkaz motoneuronom' },
      tier: 'primary',
      referenceIds: ['statpearls_corticospinal'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #21, #34
    },
    {
      anchor: 'cauda_equina',
      view: 'back',
      namePl: 'Ogon koński',
      nameLat: 'cauda equina',
      role: { rest: 'Korzenie nerwów nóg, mało impulsów', sprint: 'Korzenie L2–S3 niosą salwy do nóg' },
      tier: 'secondary',
      referenceIds: ['statpearls_lumbar_spine', 'statpearls_lower_limb_nerves'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #35, #34
    },
    {
      anchor: 'sciatic',
      view: 'back',
      namePl: 'Nerw kulszowy',
      nameLat: 'n. ischiadicus',
      role: { rest: 'Pojedyncze impulsy postawy', sprint: 'Napędza mięśnie tylnej strony uda' },
      tier: 'primary',
      referenceIds: ['statpearls_lower_limb_nerves'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #36, #34
    },
    {
      anchor: 'common_fibular',
      view: 'back',
      namePl: 'Nerw strzałkowy wspólny',
      nameLat: 'n. fibularis communis',
      role: { rest: 'Prawie cisza', sprint: 'Prostowniki stopy i mm. strzałkowe' },
      tier: 'primary',
      referenceIds: ['statpearls_lower_limb_nerves'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #37, #34; fakty_draft_K3_ruch.md: StatPearls Lower Limb Nerves, Structure and Function
    },
    {
      anchor: 'tibial',
      view: 'back',
      namePl: 'Nerw piszczelowy',
      nameLat: 'n. tibialis',
      role: { rest: 'Napięcie łydki w staniu', sprint: 'Unerwia mięśnie łydki' },
      tier: 'primary',
      referenceIds: ['statpearls_lower_limb_nerves'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #38, #34; fakty_draft_K3_ruch.md: StatPearls Lower Limb Nerves, Structure and Function
    },
    {
      anchor: 'motor_units',
      view: 'back',
      namePl: 'Jednostki ruchowe nogi',
      nameLat: 'unitates motoriae',
      role: { rest: 'Pracują nieliczne, małe (typ I)', sprint: 'Włączona także część dużych, szybkich (IIx)' },
      tier: 'primary',
      referenceIds: ['vollestad_blom_1985'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #39, #7; fakty_draft_K3_ruch.md: Vøllestad & Blom 1985, abstrakt
    },
  ],
  metrics: [
    {
      labelPl: 'Częstotliwość wyładowań motoneuronu',
      rest: 'cisza; ok. 8–9 przy włączeniu',
      sprint: 'ok. 30 (skurcz balistyczny: 60–120)',
      unit: 'Hz',
      referenceIds: ['duchateau_enoka_2022', 'enoka_duchateau_2017'],
      evidenceLevel: 'established_human',
      notePl:
        'Pomiary w m. piszczelowym przednim: ok. 8–9 Hz to najmniejsza częstotliwość świeżo włączonej jednostki, ok. 30 Hz to średnia częstotliwość szczytowa (badania: ok. 21–42 Hz). Gwałtowny skurcz zaczyna się krótką salwą 60–120 Hz.',
      protocolMismatch: 'skurcz izometryczny m. piszczelowego przedniego',
      conversionNote: '1 pps (impulsy na sekundę) = 1 Hz.',
      quote: 'the average values are … 29.3 pps for tibialis anterior',
      locator: 'Duchateau & Enoka 2022, tab. 3; Enoka & Duchateau 2017, „Rate Coding and Contraction Speed”',
      status: 'checked_agent', // fakty_draft_K3_ruch.md
    },
    {
      labelPl: 'Rekrutacja jednostek ruchowych',
      rest: 'tylko małe (typ I)',
      sprint: 'małe i średnie, ok. połowa dużych',
      referenceIds: ['duchateau_enoka_2022', 'vollestad_blom_1985', 'enoka_duchateau_2017'],
      evidenceLevel: 'established_human',
      notePl:
        'Zasada rozmiaru: najpierw małe jednostki, potem coraz większe. W m. piszczelowym przednim komplet jest włączony przy ok. 90% siły maksymalnej w powolnym skurczu, a w szybkim już przy ok. 40%.',
      protocolMismatch: 'rower, 91% VO₂max (mięsień uda)',
      quote: 'all type I and IIA and … about 50% of type IIAB and IIB',
      locator: 'Vøllestad & Blom 1985, abstrakt; Duchateau & Enoka 2022, Introduction',
      status: 'checked_agent', // fakty_draft_K3_ruch.md
    },
    {
      labelPl: 'Noradrenalina w osoczu',
      rest: '2,2',
      sprint: '13,4',
      unit: 'nmol/L',
      referenceIds: ['brooks_1988', 'zouhal_2008', 'goldstein_2010'],
      evidenceLevel: 'established_human',
      notePl:
        'Średnie po 30 s maksymalnego biegu na bieżni (10 mężczyzn). Noradrenalina pochodzi głównie z zakończeń nerwów współczulnych. W przeglądzie badań wzrost katecholamin w wysiłku wynosi od 1,5 do ponad 20 razy.',
      measuredAt: 'po wysiłku',
      protocolMismatch: '30 s sprint maksymalny na bieżni bez napędu',
      quote: 'increased from 2.2 +/- 0.6 to 13.4 +/- 6.4 nmol.l-1',
      locator: 'Brooks 1988, abstrakt',
      status: 'checked_agent',
    },
    {
      labelPl: 'Adrenalina w osoczu',
      rest: '0,2',
      sprint: '1,4',
      unit: 'nmol/L',
      referenceIds: ['brooks_1988', 'zouhal_2008', 'goldstein_2010', 'statpearls_ans'],
      evidenceLevel: 'established_human',
      notePl: 'To samo badanie (30 s sprintu na bieżni). Adrenalinę wydziela rdzeń nadnerczy na sygnał z nerwów współczulnych.',
      measuredAt: 'po wysiłku',
      protocolMismatch: '30 s sprint maksymalny na bieżni bez napędu',
      quote: '0.2 +/- 0.2 to 1.4 +/- 0.6 nmol.l-1 … for … adrenaline (AD)',
      locator: 'Brooks 1988, abstrakt',
      status: 'checked_agent',
    },
    {
      labelPl: 'Skąd bierze się zmęczenie',
      rest: '—',
      sprint: 'mięsień + motoneuron + kora',
      referenceIds: ['taylor_gandevia_2001'],
      evidenceLevel: 'established_human',
      notePl:
        'Badania stymulacją magnetyczną mózgu (TMS) pokazują, że przy zmęczeniu słabnie nie tylko mięsień: część utraty siły powstaje „wyżej”, bo kora ruchowa przestaje wysyłać pełny rozkaz.',
      protocolMismatch: 'długi skurcz maksymalny jednego mięśnia',
      quote: 'suboptimal output from the motor cortex, that is, fatigue at a supraspinal level',
      locator: 'Taylor & Gandevia 2001, abstrakt',
      status: 'checked_agent',
    },
  ],
  // Strzałki impulsu: public/atlas/nerwowy/flows3d.json (metry; generuje plate_nerwowy.py, rzutuje AtlasPlate).
  creditsPl:
    'Modele: Z-Anatomy (CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP). Sylwetka wyliczona z tych samych modeli. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0.',
};
