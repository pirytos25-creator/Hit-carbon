import type { AtlasPlateContent } from '../types';

/**
 * Plansza układu oddechowego (faza 1, agent 4). Render: blender/atlas/plate_oddechowy.py
 * Fakty: docs/atlas_audyt/fakty_oddechowy.md (statusy, cytaty i lokalizatory stamtąd; numery # = wiersze audytu).
 * Decyzja integratora (K3): podręcznik OpenStax nie ma DOI ani PMID, więc według §3.6 pkt 2 fakty oparte tylko na nim
 * mają status `unverifiable` (wiersze 13, 15, 28, 30 audytu). Wystarczy zmiana statusu, jeśli Dyrygent zdecyduje inaczej.
 */
export const ODDECHOWY: AtlasPlateContent = {
  id: 'oddechowy',
  titlePl: 'Układ oddechowy',
  subtitlePl: 'Skąd bierze się tlen na sprint i dokąd znika CO₂',
  colorVar: '--sys-resp',
  views: ['front', 'detail'],
  viewTitlesPl: { front: 'Widok z przodu', detail: 'Pęcherzyk płucny (schemat)' },
  summary: {
    rest:
      'W spoczynku oddech jest spokojny i prawie bezgłośny: wdech robi przepona z pomocą mięśni międzyżebrowych i pochyłych, a wydech jest bierny (płuca same się sprężyście kurczą).',
    sprint:
      'W sprincie przepona schodzi głęboko i szybko, mocniej pracują mięśnie międzyżebrowe zewnętrzne i mięśnie pochyłe szyi, a wydech staje się czynny (mięśnie międzyżebrowe wewnętrzne i brzucha). Wentylacja rośnie kilkunastokrotnie, a krew przepływa przez naczynia włosowate płuc szybciej, więc wymiana gazów musi zdążyć w krótszym czasie.',
  },
  summaryReferenceIds: {
    rest: ['detroyer_estenne_1984', 'aliverti_1997'],
    sprint: ['aliverti_1997', 'detroyer_2005', 'blackie_1991', 'hopkins_1996'],
  },
  summaryStatus: { rest: 'unverifiable', sprint: 'unverifiable' }, // #1, #3 (poprawione: bez 6 L/min); #6, #8
  labels: [
    {
      anchor: 'larynx',
      view: 'front',
      namePl: 'Krtań',
      nameLat: 'larynx',
      role: { rest: 'Głośnia lekko otwarta', sprint: 'Głośnia szeroko otwarta, mniejszy opór' },
      tier: 'secondary',
      referenceIds: ['england_1982'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #10
    },
    {
      anchor: 'trachea',
      view: 'front',
      namePl: 'Tchawica',
      nameLat: 'trachea',
      role: { rest: 'Spokojny przepływ powietrza', sprint: 'Bardzo szybki przepływ powietrza' },
      tier: 'primary',
      roleStatus: { rest: 'unverifiable', sprint: 'unverifiable' }, // #11
    },
    {
      anchor: 'scalene',
      view: 'front',
      namePl: 'Mm. pochyłe',
      nameLat: 'mm. scaleni',
      role: { rest: 'Lekko unoszą żebra', sprint: 'Mocno unoszą górne żebra przy wdechu' },
      tier: 'secondary',
      referenceIds: ['detroyer_estenne_1984'],
      roleStatus: { rest: 'checked_agent', sprint: 'unverifiable' }, // #12; #13 (tylko OpenStax)
    },
    {
      anchor: 'main_bronchus',
      view: 'front',
      namePl: 'Oskrzele główne prawe',
      nameLat: 'bronchus principalis dexter',
      role: { rest: 'Rozprowadza powietrze do płuca', sprint: 'Oskrzela lekko się rozszerzają' },
      tier: 'primary',
      referenceIds: ['antonelli_2012'],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #14 (spoczynek: opis anatomiczny, poza audytem)
    },
    {
      anchor: 'lung',
      view: 'front',
      namePl: 'Płuco prawe',
      nameLat: 'pulmo dexter',
      role: { rest: 'Wdech (oba płuca) ok. 0,5 L', sprint: 'Wdech (oba płuca) ok. 2,7 L' },
      tier: 'primary',
      referenceIds: ['blackie_1991'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #15 (tylko OpenStax), #16
    },
    {
      anchor: 'intercostal',
      view: 'front',
      namePl: 'Mm. międzyżebrowe',
      nameLat: 'mm. intercostales',
      role: { rest: 'Pracują lekko przy każdym wdechu', sprint: 'Unoszą żebra (wdech), ściągają (wydech)' },
      tier: 'primary',
      referenceIds: ['detroyer_estenne_1984', 'detroyer_2005'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #17 (poprawione), #18
    },
    {
      anchor: 'diaphragm',
      view: 'front',
      namePl: 'Przepona',
      nameLat: 'diaphragma',
      role: { rest: 'Główny mięsień spokojnego wdechu', sprint: 'Kurczy się bardzo szybko i napędza przepływ' },
      tier: 'primary',
      referenceIds: ['aliverti_1997'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #19; #20 (poprawione)
    },
    {
      anchor: 'bronchiole',
      view: 'detail',
      namePl: 'Oskrzelik końcowy',
      nameLat: 'bronchiolus terminalis',
      role: { rest: 'Doprowadza świeże powietrze', sprint: 'Dużo więcej powietrza na minutę' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'unverifiable' }, // #21
    },
    {
      anchor: 'alveolus',
      view: 'detail',
      namePl: 'Pęcherzyk płucny',
      nameLat: 'alveolus pulmonis',
      role: { rest: 'O₂ do krwi, CO₂ do powietrza', sprint: 'Więcej O₂ i CO₂ w krótszym czasie' },
      tier: 'primary',
      referenceIds: ['hopkins_1996'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #22, #23
    },
    {
      anchor: 'capillary',
      view: 'detail',
      namePl: 'Naczynia włosowate',
      nameLat: 'vasa capillaria',
      role: { rest: 'Krew płynie spokojnie', sprint: 'Krew płynie szybciej, więcej naczyń otwartych' },
      tier: 'primary',
      referenceIds: ['hopkins_1996'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #24
    },
  ],
  metrics: [
    {
      labelPl: 'Wentylacja minutowa',
      rest: 'ok. 6',
      sprint: 'ok. 97',
      unit: 'L/min',
      referenceIds: ['blackie_1991'],
      evidenceLevel: 'established_human',
      notePl: 'Objętość oddechowa × częstość oddechów. Średnia zdrowych mężczyzn na końcu testu maksymalnego: 97 ± 25 L/min; przy 88% VO₂max zwykle mniej.',
      status: 'checked_agent',
      restStatus: 'unverifiable', // #25: brak cytatu z liczbą 6 L/min
      protocolMismatch: 'koniec testu maksymalnego',
      quote: 'Mean ventilation at the end of exercise (Vemax) was significantly higher in men (mean +/- SD, 97 +/- 25 L/min)',
      locator: 'Blackie 1991, abstrakt',
    },
    {
      labelPl: 'Częstość oddechów',
      rest: 'ok. 12–16',
      sprint: 'ok. 36',
      unit: '/min',
      referenceIds: ['blackie_1991'],
      evidenceLevel: 'established_human',
      status: 'checked_agent',
      restStatus: 'unverifiable', // #28: tylko OpenStax (bez DOI/PMID)
      protocolMismatch: 'koniec testu maksymalnego',
      quote: 'Respiratory rate at the end of exercise (RRmax) was 36.1 +/- 9.2 breaths per minute',
      locator: 'Blackie 1991, abstrakt',
    },
    {
      labelPl: 'Objętość oddechowa',
      rest: 'ok. 0,5',
      sprint: 'ok. 2,7',
      unit: 'L na oddech',
      referenceIds: ['blackie_1991'],
      evidenceLevel: 'established_human',
      status: 'checked_agent',
      restStatus: 'unverifiable', // #30: tylko OpenStax (bez DOI/PMID)
      protocolMismatch: 'koniec testu maksymalnego',
      quote: 'Tidal volume at the end of exercise (Vtmax) was higher in men (2.70 +/- 0.48 L)',
      locator: 'Blackie 1991, abstrakt',
    },
    {
      labelPl: 'Pobór tlenu VO₂',
      rest: 'ok. 0,25 (3,5 mL/kg/min)',
      sprint: 'ok. 3–3,4 (ok. 88% VO₂max)',
      unit: 'L/min',
      referenceIds: ['jette_1990', 'kaminsky_2015', 'byrne_2005'],
      evidenceLevel: 'established_human',
      notePl:
        'Kanon atlasu: 45 s pracy przy ok. 88% VO₂max. Mediana VO₂max mężczyzn w wieku 20–29 lat to 48 mL/kg/min. Spoczynkowe 3,5 mL/kg/min to umowna wartość (1 MET).',
      status: 'checked_agent',
      conversionNote:
        'Spoczynek: 3,5 mL/kg/min × 70 kg = 0,245 L/min. Sprint: 48 mL/kg/min × 70–80 kg × 0,88 = 2,96–3,38 L/min.',
      quote: 'the 50th percentile VO 2max of men and women aged 20 to 29 years decreased from 48.0',
      locator: 'Kaminsky 2015, abstrakt (Results); Jetté 1990, abstrakt',
    },
    {
      labelPl: 'Tlen zużywany przez mięśnie oddechowe',
      rest: 'niewielka część',
      sprint: 'ok. 10 (do 15)',
      unit: '% VO₂max',
      referenceIds: ['aaron_1992'],
      evidenceLevel: 'established_human',
      notePl: 'Praca wszystkich mięśni oddechowych przy wysiłku maksymalnym (badanie na zdrowych młodych osobach).',
      status: 'checked_agent',
      restStatus: 'unverifiable', // #35
      protocolMismatch: 'wysiłek maksymalny',
      quote: 'At maximum exercise, the O2 cost of ventilation (VE) averaged 10 +/- 0.7% of the VO2max.',
      locator: 'Aaron 1992, abstrakt',
    },
    {
      labelPl: 'Krew dla mięśni oddechowych',
      rest: 'niewielka część',
      sprint: 'do 14–16',
      unit: '% rzutu serca',
      referenceIds: ['harms_1998'],
      evidenceLevel: 'established_human',
      notePl: 'Przy VO₂max mięśnie oddechowe „konkurują” o krew z mięśniami nóg (badanie u wytrenowanych kolarzy).',
      status: 'checked_agent',
      restStatus: 'unverifiable', // #38
      protocolMismatch: 'kolarze, wysiłek maksymalny',
      quote: 'up to 14-16% of the CO is directed to the respiratory muscles',
      locator: 'Harms 1998, abstrakt',
    },
  ],
  /**
   * Strzałki przepływu (piksele renderu 1150×1600), policzone w plate_oddechowy.py z położenia krtani, tchawicy
   * i oskrzeli HuBMAP (kopia: public/atlas/oddechowy/flows.json). Rysuje je AtlasPlate (faza 2).
   */
  flows: [
    { view: 'front', kind: 'air', labelPl: 'Wdech: powietrze do płuca prawego', points: [[549, 158], [549, 280], [549, 601], [477, 670], [435, 780], [340, 833]] },
    { view: 'front', kind: 'air', labelPl: 'Wdech: powietrze do płuca lewego', points: [[549, 601], [701, 705], [708, 769], [817, 873]] },
    { view: 'front', kind: 'air', labelPl: 'Płat górny prawy', points: [[477, 670], [406, 561]] },
    { view: 'front', kind: 'air', labelPl: 'Płat górny lewy', points: [[701, 705], [740, 584]] },
    { view: 'detail', kind: 'air', labelPl: 'Powietrze do pęcherzyków', points: [[628, 185], [586, 548], [575, 955]] },
    { view: 'detail', kind: 'air', labelPl: 'O₂: z pęcherzyka do krwi', points: [[554, 1104], [436, 1019], [319, 955]] },
    { view: 'detail', kind: 'air', labelPl: 'CO₂: z krwi do pęcherzyka', points: [[853, 933], [725, 997], [618, 1061]] },
    { view: 'detail', kind: 'vein', labelPl: 'Krew odtlenowana z serca', points: [[84, 677], [212, 890], [319, 1061]] },
    { view: 'detail', kind: 'artery', labelPl: 'Krew utlenowana do serca', points: [[842, 1104], [960, 1296], [1066, 1532]] },
  ],
  creditsPl:
    'Modele: HuBMAP Human Reference Atlas, VH Male v1.4 (płuca, tchawica, oskrzela główne, krtań; CC BY 4.0) oraz Z-Anatomy (CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP). Schemat pęcherzyka: BIOGENESIS. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0.',
};
