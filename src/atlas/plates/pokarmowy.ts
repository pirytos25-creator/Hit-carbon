import type { AtlasPlateContent } from '../types';

/**
 * Plansza „Układ pokarmowy i wątroba” (faza 1b, agent 8). Render: blender/atlas/plate_pokarmowy.py.
 * front: Z-Anatomy (jama brzuszna); detail: HuBMAP (wątroba z naczyniami). Strzałki: public/atlas/pokarmowy/flows3d.json.
 *
 * Stany (wyjątek od księgi stylu §2, zgoda Dyrygenta na K1): w spoczynku przewód pokarmowy ma 75% koloru układu,
 * w sprincie jest przygaszony (mniej krwi w trzewiach), a wątroba świeci pełnym kolorem (uwalnia glukozę).
 *
 * Fakty: wszystkie `draft` (do sprawdzenia przez agenta faktów, model §3.6). Pełne cytaty i populacje:
 * notatki agenta 8, `pokarmowy_fakty_plan.md` (F1–F4, S1–S5).
 */
const ROWELL = 'rowell_1964';
const MARLISS_REV = 'marliss_vranic_2002';
const MARLISS = 'marliss_1992';
const PERKO = 'perko_1998';
const BROOKS = 'brooks_2020';

export const POKARMOWY: AtlasPlateContent = {
  id: 'pokarmowy',
  titlePl: 'Układ pokarmowy i wątroba',
  subtitlePl: 'Trawienie zwalnia, a wątroba uwalnia paliwo dla mięśni',
  colorVar: '--sys-digest',
  views: ['front', 'detail'],
  viewTitlesPl: { front: 'Jama brzuszna z przodu', detail: 'Wątroba i jej naczynia (zbliżenie)' },
  summary: {
    rest:
      'W spoczynku żołądek, jelita i wątroba dostają dużo krwi: przez samą wątrobę płynie ok. 1,6 litra krwi na minutę. Przewód pokarmowy trawi i wchłania pokarm, a wątroba powoli oddaje do krwi glukozę.',
    sprint:
      'W sprincie jelita i żołądek dostają mniej krwi, bo krew płynie do pracujących mięśni. Przepływ przez wątrobę spada kilkukrotnie. Mimo to wątroba pracuje pełną parą: oddaje do krwi glukozę ok. 7–8 razy szybciej niż w spoczynku, więc glukozy we krwi przybywa. Część mleczanu z mięśni wątroba przerabia z powrotem na glukozę (cykl Cori).',
  },
  summaryReferenceIds: {
    rest: [ROWELL, MARLISS],
    sprint: [ROWELL, PERKO, MARLISS_REV, MARLISS, BROOKS],
  },
  // rest: #1 audytu faktów (checked_agent po dopisaniu marliss_1992); sprint: zmienione po #2 (bez „po serii”) -> draft
  summaryStatus: { rest: 'checked_agent', sprint: 'draft' },
  protocolNotePl:
    'Sprint w atlasie to koniec 45 s pracy przy ok. 88% VO₂max (6 × 45 s pracy / 45 s przerwy). Badania wątroby i trzewi mierzyły zwykle wysiłek ciągły, kilkunastominutowy, więc liczby są przybliżeniem.',
  labels: [
    // ---------------------------------------------------------------- widok z przodu (Z-Anatomy)
    {
      anchor: 'oesophagus',
      view: 'front',
      namePl: 'Przełyk',
      nameLat: 'oesophagus',
      role: { rest: 'Przesuwa pokarm do żołądka', sprint: 'Przesuwa pokarm do żołądka' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'stomach',
      view: 'front',
      namePl: 'Żołądek',
      nameLat: 'gaster',
      role: { rest: 'Trawi pokarm, dużo krwi', sprint: 'Dostaje mniej krwi niż w spoczynku' },
      tier: 'primary',
      referenceIds: [PERKO],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #4, #5
    },
    {
      anchor: 'liver',
      view: 'front',
      namePl: 'Wątroba',
      nameLat: 'hepar',
      role: { rest: 'Powoli oddaje glukozę do krwi', sprint: 'Oddaje glukozę ok. 7–8× szybciej' },
      tier: 'primary',
      referenceIds: [MARLISS_REV, MARLISS],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #6, #7
    },
    {
      anchor: 'gallbladder',
      view: 'front',
      namePl: 'Pęcherzyk żółciowy',
      nameLat: 'vesica biliaris',
      role: { rest: 'Przechowuje żółć', sprint: 'Przechowuje żółć' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'small_intestine',
      view: 'front',
      namePl: 'Jelito cienkie',
      nameLat: 'intestinum tenue',
      role: { rest: 'Wchłania składniki pokarmu', sprint: 'Dostaje mniej krwi niż w spoczynku' },
      tier: 'primary',
      referenceIds: [PERKO],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #10
    },
    {
      anchor: 'colon',
      view: 'front',
      namePl: 'Jelito grube',
      nameLat: 'intestinum crassum (colon ascendens)',
      role: { rest: 'Wchłania wodę', sprint: 'Dostaje mniej krwi niż w spoczynku' },
      tier: 'primary',
      // #12: źródło zmienione z Rowella na Perko 1998 (t. krezkowa górna −32%, zaopatruje okrężnicę wstępującą) -> draft
      referenceIds: [PERKO],
      roleStatus: { rest: 'anatomy', sprint: 'draft' },
    },
    {
      anchor: 'duodenum',
      view: 'front',
      namePl: 'Dwunastnica',
      nameLat: 'duodenum',
      role: { rest: 'Tu wpływają żółć i sok trzustkowy', sprint: 'Tu wpływają żółć i sok trzustkowy' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'transverse_colon',
      view: 'front',
      namePl: 'Okrężnica poprzeczna',
      nameLat: 'colon transversum',
      role: { rest: 'Część jelita grubego', sprint: 'Część jelita grubego' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'sigmoid',
      view: 'front',
      namePl: 'Okrężnica esowata',
      nameLat: 'colon sigmoideum',
      role: { rest: 'Końcowa część okrężnicy', sprint: 'Końcowa część okrężnicy' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'portal_vein',
      view: 'front',
      namePl: 'Żyła wrotna',
      nameLat: 'v. portae hepatis',
      role: { rest: 'Krew z jelit i śledziony do wątroby', sprint: 'Mniej krwi płynie do wątroby' },
      tier: 'secondary',
      referenceIds: [ROWELL],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #16, #17
    },
    {
      anchor: 'hepatic_veins',
      view: 'front',
      namePl: 'Żyły wątrobowe',
      nameLat: 'vv. hepaticae → v. cava inferior',
      role: { rest: 'Krew z wątroby do serca', sprint: 'Wynoszą glukozę z wątroby do krwi' },
      tier: 'secondary',
      referenceIds: [MARLISS_REV],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #18, #19
    },
    // ---------------------------------------------------------------- zbliżenie wątroby (HuBMAP)
    {
      anchor: 'd_liver',
      view: 'detail',
      namePl: 'Wątroba',
      nameLat: 'hepar',
      role: { rest: 'Przepływ krwi ok. 1,6 L/min', sprint: 'Mniej krwi, ale dużo więcej glukozy' },
      tier: 'primary',
      referenceIds: [ROWELL, MARLISS_REV],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #20, #21
    },
    {
      anchor: 'd_portal',
      view: 'detail',
      namePl: 'Żyła wrotna',
      nameLat: 'v. portae hepatis',
      role: { rest: 'Przynosi krew z jelit', sprint: 'Przynosi też mleczan' },
      tier: 'primary',
      referenceIds: [BROOKS],
      roleStatus: { rest: 'anatomy', sprint: 'draft' }, // #23: usunięte „(głównie po serii)” -> draft
    },
    {
      anchor: 'd_hepatic_veins',
      view: 'detail',
      namePl: 'Żyły wątrobowe',
      nameLat: 'vv. hepaticae',
      role: { rest: 'Odprowadzają krew do serca', sprint: 'Wynoszą glukozę do krwi' },
      tier: 'primary',
      referenceIds: [MARLISS_REV],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #24, #25
    },
    {
      anchor: 'd_pancreas',
      view: 'detail',
      namePl: 'Trzustka',
      nameLat: 'pancreas',
      role: { rest: 'Wydziela sok trawienny i hormony', sprint: 'Insulina zmienia się niewiele' },
      tier: 'primary',
      referenceIds: [MARLISS_REV],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #26, #27
    },
    {
      anchor: 'd_hepatic_artery',
      view: 'detail',
      namePl: 'T. wątrobowa wspólna',
      nameLat: 'a. hepatica communis',
      role: { rest: 'Krew z tlenem dla wątroby', sprint: 'Niesie też mleczan z mięśni' },
      tier: 'secondary',
      referenceIds: [BROOKS],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #28, #29
    },
    {
      anchor: 'd_gallbladder',
      view: 'detail',
      namePl: 'Pęcherzyk żółciowy',
      nameLat: 'vesica biliaris',
      role: { rest: 'Przechowuje żółć', sprint: 'Przechowuje żółć' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'd_bile_duct',
      view: 'detail',
      namePl: 'Drogi żółciowe',
      nameLat: 'ductus cysticus, ductus hepaticus communis, ductus choledochus',
      // #31: dopisany przewód żółciowy wspólny (w modelu HuBMAP: VH_M_common_bile_duct) -> draft
      role: {
        rest: 'Przewód żółciowy wspólny wpada do dwunastnicy',
        sprint: 'Przewód żółciowy wspólny wpada do dwunastnicy',
      },
      tier: 'secondary',
      roleStatus: { rest: 'draft', sprint: 'draft' },
    },
    {
      anchor: 'd_duodenum',
      view: 'detail',
      namePl: 'Dwunastnica',
      nameLat: 'duodenum',
      role: { rest: 'Początek jelita cienkiego', sprint: 'Początek jelita cienkiego' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
  ],
  metrics: [
    {
      labelPl: 'Przepływ krwi przez wątrobę',
      rest: 'ok. 1,6',
      sprint: 'ok. 0,4',
      unit: 'L/min',
      referenceIds: [ROWELL],
      evidenceLevel: 'established_human',
      notePl: 'Krew trzewi (jelita, żołądek, śledziona) przepływa przez wątrobę. Im cięższy wysiłek, tym mniej krwi.',
      // #33: sprint zawężony do ok. 0,4 L/min (regresja Rowella dla 88% VO₂max) -> draft
      status: 'draft',
      restStatus: 'checked_agent', // #20
      protocolMismatch: 'wysiłek ciągły na bieżni, 26–97% VO₂max (pomiar od 5. min); nie interwały 45 s',
      conversionNote:
        'Spoczynek: 1614 mL/min ≈ 1,6 L/min. Sprint: regresja Rowella (klirens ICG w % spoczynku = −1,16 × %VO₂max + 127,89) dla 88% VO₂max daje ok. 26% spoczynku, czyli ok. 0,4 L/min; autorzy piszą, że klirens ICG odpowiada EHBF. W całym badaniu (wysiłek łagodny do bliskiego maksymalnego) przepływ wynosił 0,8–0,4 L/min.',
      quote:
        'The mean resting EHBF was 1,614 ml per minute, whereas during exercise of various intensities, EHBF fell to values ranging from 820 to 390 ml per minute.',
      locator: 'Rowell 1964, Results, „Estimated hepatic blood flow (EHBF)” (tab. II); regresja „y = -1.16x + 127.89” (ryc. 3)',
      measuredAt: 'w trakcie wysiłku (od 5. minuty)',
      tier: 'primary',
    },
    {
      labelPl: 'Tempo oddawania glukozy do krwi',
      rest: '1×',
      sprint: 'ok. 7–8×',
      referenceIds: [MARLISS_REV, MARLISS],
      evidenceLevel: 'established_human',
      notePl: 'Tempo pojawiania się glukozy we krwi, mierzone znakowaną glukozą. Napędzają je głównie adrenalina i noradrenalina.',
      status: 'checked_agent', // #34
      protocolMismatch:
        'jazda na rowerze do wyczerpania przy 80% maks. obciążenia (ok. 100% VO₂max); przegląd: wysiłek > 80% VO₂max',
      quote: 'In contrast, in intense exercise, GP rises seven- to eightfold and GU rises three- to fourfold',
      locator: 'Marliss & Vranic 2002, abstrakt; badanie pierwotne: Marliss 1992, abstrakt („Ra increased 7-fold by exhaustion”)',
      measuredAt: 'w chwili wyczerpania (koniec wysiłku)',
      tier: 'primary',
    },
    {
      labelPl: 'Glukoza we krwi',
      rest: 'ok. 4,9',
      sprint: 'ok. 6,9',
      unit: 'mmol/L',
      referenceIds: [MARLISS],
      evidenceLevel: 'established_human',
      notePl: 'Tuż po intensywnym wysiłku glukozy we krwi jest więcej, bo wątroba oddaje jej więcej, niż mięśnie zużywają.',
      status: 'checked_agent', // #35
      protocolMismatch: 'jazda na rowerze do wyczerpania przy 80% maks. obciążenia (ok. 100% VO₂max); 18 wytrenowanych mężczyzn',
      quote:
        'Plasma glucose was 4.90 +/- 0.08 mM/L at rest, increased during exercise, then abruptly to 6.91 +/- 0.40 mM/L at 4 min recovery then gradually declined.',
      locator: 'Marliss 1992, abstrakt',
      measuredAt: '4 min po wysiłku',
      tier: 'primary',
    },
    {
      labelPl: 'Mleczan spalany od razu (mięśnie, serce)',
      rest: 'ok. 50',
      sprint: 'ok. 75–80',
      unit: '% mleczanu',
      referenceIds: [BROOKS],
      evidenceLevel: 'established_human',
      notePl:
        'Reszta, ok. 25% mleczanu, wraca do wątroby (i nerek) i zamienia się w glukozę: to cykl Cori. Mleczan to główny surowiec, z którego wątroba robi nową glukozę.',
      status: 'checked_agent', // #36
      protocolMismatch: 'wysiłek ciągły (przegląd); brak danych dla interwałów 45 s',
      quote:
        'Because the majority of lactate disposal occurs via direct oxidation (≈50% at rest and 75–80% during sustained exercise) [14, 47], the discussion above on lactate utilization centered on oxidative disposal. However, while approximately 25% of lactate disposal is via gluconeogenesis [12, 48], lactate is by far the major gluconeogenic precursor [61, 92].',
      locator: 'Brooks 2020, rozdz. „Gluconeogenesis from Lactate”',
      measuredAt: 'w spoczynku i w trakcie wysiłku ciągłego',
      tier: 'primary',
    },
    {
      labelPl: 'Spadek przepływu: pień trzewny / t. krezkowa górna',
      rest: '0',
      sprint: 'ok. −50 / −32',
      unit: '% zmiany',
      referenceIds: [PERKO],
      evidenceLevel: 'established_human',
      notePl:
        'Pomiar USG Dopplera na czczo. Pień trzewny zaopatruje wątrobę, żołądek i śledzionę; t. krezkowa górna jelito cienkie, okrężnicę wstępującą i część poprzecznej.',
      status: 'draft', // #37: uściślony opis protokołu i notatka -> draft
      protocolMismatch: 'jazda na rowerze w pozycji półleżącej, ok. 75% VO₂max, pomiar w 15.–30. min (wysiłek submaksymalny, nie sprint)',
      quote:
        'During fasting, cycling increased mesenteric, coeliac and splanchnic resistances by 76, 165 and 126 %, respectively, and it reduced corresponding blood flows by 32, 50 and 43 %',
      locator: 'Perko 1998, abstrakt (pkt 3)',
      measuredAt: 'w trakcie wysiłku submaksymalnego',
      tier: 'secondary',
    },
    {
      labelPl: 'Glukoza we krwi zaraz po interwałach 8 × 60 s',
      rest: 'wyjściowa (tylko na wykresie)',
      sprint: 'ok. 6,6',
      unit: 'mmol/L',
      referenceIds: ['bogdanis_2022'],
      evidenceLevel: 'established_human',
      notePl:
        'Protokół bliższy atlasowi niż Marliss 1992. Glukoza wzrosła względem wartości wyjściowej tylko po interwałach 30 s i 60 s, nie po 10 s.',
      status: 'draft', // nowe (propozycja audytu #35)
      protocolMismatch: '8 × 60 s przy 100% mocy z testu VO₂max, przerwy 90 s przy 15% (11 zdrowych młodych mężczyzn)',
      quote:
        'Post-exercise leukocyte count (mean ± SD; 9.7 ± 2.8 k μL-1), uric acid concentration (0.35 ± 0.10 mmol L-1), glucose concentration (6.56 ± 1.44 mmol L-1), and plasma volume change (-13.5 ± 4.4%) were greater in HIIE60 compared to all other trials (p < 0.05).',
      locator: 'Bogdanis 2022, abstrakt (Results); wartość wyjściowa: ryc. 1A',
      measuredAt: 'zaraz po wysiłku',
      tier: 'secondary',
    },
  ],
  creditsPl:
    'Modele: Z-Anatomy (CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP): narządy jamy brzusznej, naczynia i szkielet; HuBMAP Human Reference Atlas, VH Male (CC BY 4.0): wątroba z naczyniami, drogi żółciowe, pęcherzyk, trzustka i dwunastnica w zbliżeniu. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0.',
};
