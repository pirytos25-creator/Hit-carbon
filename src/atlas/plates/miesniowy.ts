import type { AtlasPlateContent } from '../types';

/**
 * Plansza wzorcowa (faza 0) + zbliżenie (faza 1). Wzór dla pozostałych układów.
 * Widok `detail`: blok uda → mozaika włókien → mostek poprzeczny (blender/atlas/plate_miesniowy.py).
 * Fakty: docs/atlas_audyt/fakty_miesniowy.md (statusy, cytaty i lokalizatory stamtąd; numery # = wiersze audytu).
 * „Sprint” = 45 s szybkiego biegu przy ok. 88% VO₂max (model §3.7), nie bieg na maksa.
 */
export const MIESNIOWY: AtlasPlateContent = {
  id: 'miesniowy',
  titlePl: 'Układ mięśniowy',
  subtitlePl: 'Które mięśnie napędzają sprint na bieżni',
  colorVar: '--sys-muscle',
  views: ['front', 'back', 'detail'],
  viewTitlesPl: { front: 'Widok z przodu', back: 'Widok z tyłu', detail: 'Zbliżenie: udo, włókna, białka' },
  summary: {
    rest: 'W spoczynku mięśnie szkieletowe pracują głównie nad postawą. Rekrutowane są nieliczne, małe jednostki ruchowe z włóknami typu I.',
    sprint:
      'W sprincie pracuje cały łańcuch napędowy: pośladki i mięśnie kulszowo-goleniowe prostują biodro, czworogłowy prostuje kolano, łydka odbija stopę od taśmy. Zgodnie z zasadą rozmiaru najpierw pracują małe jednostki z włóknami typu I; przy ok. 90% VO₂max dołączają włókna IIa i część włókien IIx. W każdym pracującym włóknie główki miozyny raz za razem chwytają aktynę i ciągną ją, zużywając ATP.',
  },
  summaryReferenceIds: { sprint: ['dorn_2012', 'hamner_2010', 'vollestad_blom_1985', 'mendell_2005', 'fujii_namba_2017'] },
  summaryStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // fakty_draft_K3_ruch.md: Dorn 2012, Hamner 2010, Mendell 2005, Vøllestad 1985, Fujii 2017
  labels: [
    {
      anchor: 'deltoid',
      view: 'front',
      namePl: 'M. naramienny',
      nameLat: 'm. deltoideus',
      role: { rest: 'Napięcie posturalne', sprint: 'Wymach ramion równoważy obrót nóg' },
      tier: 'secondary',
      referenceIds: ['hamner_2010'],
      evidence: { sprint: 'preliminary_human' }, // fakty_koncowe_C_reszta_i_kontrola.md: symulacja komputerowa jednego biegacza (Hamner 2010)
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #7, #17; fakty_koncowe_C_reszta_i_kontrola.md: Hamner 2010, abstrakt; Discussion
    },
    {
      anchor: 'rectus_abdominis',
      view: 'front',
      namePl: 'M. prosty brzucha',
      nameLat: 'm. rectus abdominis',
      role: { rest: 'Niska aktywność', sprint: 'Usztywnia tułów przy każdym kroku' },
      tier: 'secondary',
      roleStatus: { rest: 'unverifiable', sprint: 'unverifiable' }, // #8, #17
    },
    {
      anchor: 'rectus_femoris',
      view: 'front',
      namePl: 'M. prosty uda',
      nameLat: 'm. rectus femoris',
      role: { rest: 'Prawie bez pracy', sprint: 'Pomaga prostować kolano' },
      tier: 'primary',
      referenceIds: ['dorn_2012'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #9, #17; fakty_draft_K3_ruch.md: Dorn 2012, Results
    },
    {
      anchor: 'vastus_lateralis',
      view: 'front',
      namePl: 'M. obszerny boczny',
      nameLat: 'm. vastus lateralis',
      role: { rest: 'Prawie bez pracy', sprint: 'Prostuje kolano, amortyzuje lądowanie' },
      tier: 'primary',
      referenceIds: ['hamner_2010'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #10, #17
    },
    {
      anchor: 'tibialis_anterior',
      view: 'front',
      namePl: 'M. piszczelowy przedni',
      nameLat: 'm. tibialis anterior',
      role: { rest: 'Prawie bez pracy', sprint: 'Unosi stopę w fazie wymachu' },
      tier: 'primary',
      roleStatus: { rest: 'unverifiable', sprint: 'unverifiable' }, // #11, #17
    },
    {
      anchor: 'gluteus_maximus',
      view: 'back',
      namePl: 'M. pośladkowy wielki',
      nameLat: 'm. gluteus maximus',
      role: { rest: 'Prawie bez pracy', sprint: 'Prostuje biodro, podpiera ciało po lądowaniu' },
      tier: 'primary',
      referenceIds: ['hamner_2010', 'dorn_2012'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #12, #17; fakty_draft_K3_ruch.md: Dorn 2012, Results; Hamner 2010, Results
    },
    {
      anchor: 'biceps_femoris',
      view: 'back',
      namePl: 'M. dwugłowy uda',
      nameLat: 'm. biceps femoris',
      role: { rest: 'Prawie bez pracy', sprint: 'Hamuje goleń przed lądowaniem, prostuje biodro' },
      tier: 'primary',
      referenceIds: ['dorn_2012'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #13, #17
    },
    {
      anchor: 'semitendinosus',
      view: 'back',
      namePl: 'M. półścięgnisty',
      nameLat: 'm. semitendinosus',
      role: { rest: 'Prawie bez pracy', sprint: 'Hamuje goleń, prostuje biodro' },
      tier: 'primary',
      referenceIds: ['dorn_2012'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #14, #17; fakty_draft_K3_ruch.md: Dorn 2012, Results (HAMS jako grupa)
    },
    {
      anchor: 'gastrocnemius',
      view: 'back',
      namePl: 'M. brzuchaty łydki',
      nameLat: 'm. gastrocnemius',
      role: { rest: 'Niska aktywność (postawa)', sprint: 'Odbicie stopy od taśmy' },
      tier: 'primary',
      referenceIds: ['hamner_2010'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #15, #17
    },
    {
      anchor: 'soleus',
      view: 'back',
      namePl: 'M. płaszczkowaty',
      nameLat: 'm. soleus',
      role: { rest: 'Utrzymuje postawę stojącą', sprint: 'Duża siła odbicia przy każdym kroku' },
      tier: 'primary',
      referenceIds: ['dorn_2012', 'hamner_2010'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #16, #17
    },
    // --- Zbliżenie (widok detail): blok prawego uda na wysokości biopsji, mozaika włókien, mostek poprzeczny ---
    {
      anchor: 'd_vastus_lateralis',
      view: 'detail',
      namePl: 'M. obszerny boczny',
      nameLat: 'm. vastus lateralis',
      role: { rest: 'Przekrój w miejscu biopsji: pracuje mało włókien', sprint: 'Przekrój w miejscu biopsji: pracują wszystkie typy (z IIx ok. połowa)' },
      tier: 'primary',
      referenceIds: ['vollestad_blom_1985'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #18, #17; fakty_draft_K3_ruch.md: Vøllestad & Blom 1985, abstrakt
    },
    {
      anchor: 'd_femur',
      view: 'detail',
      namePl: 'Kość udowa',
      nameLat: 'femur',
      role: { rest: 'Dźwignia dla mięśni uda', sprint: 'Dźwignia dla mięśni uda' },
      tier: 'secondary',
      roleStatus: { rest: 'unverifiable', sprint: 'unverifiable' }, // #26: audyt dopuszcza zwolnienie opisu anatomicznego
    },
    {
      anchor: 'd_hamstrings',
      view: 'detail',
      namePl: 'M. dwugłowy uda',
      nameLat: 'm. biceps femoris',
      role: { rest: 'Prawie bez pracy', sprint: 'Prostuje biodro, hamuje goleń' },
      tier: 'primary',
      referenceIds: ['dorn_2012'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #13, #17
    },
    {
      anchor: 'd_fiber_I',
      view: 'detail',
      namePl: 'Włókno typu I',
      nameLat: 'wolne, tlenowe · ok. 42%',
      role: { rest: 'Pracuje pierwsze', sprint: 'Pracuje dalej' },
      tier: 'primary',
      referenceIds: ['gollnick_1974', 'vollestad_blom_1985'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #21, #18; fakty_draft_K3_ruch.md: Gollnick 1974 pkt 3; Vøllestad & Blom 1985
    },
    {
      anchor: 'd_fiber_IIa',
      view: 'detail',
      namePl: 'Włókno typu IIa',
      nameLat: 'szybkie, mieszane · ok. 35%',
      role: { rest: 'Nie pracuje', sprint: 'Dołącza: pracują wszystkie' },
      tier: 'primary',
      referenceIds: ['vollestad_blom_1985'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #18, #22; fakty_draft_K3_ruch.md: Vøllestad & Blom 1985, abstrakt
    },
    {
      anchor: 'd_fiber_IIx',
      view: 'detail',
      namePl: 'Włókno typu IIx',
      nameLat: 'najszybsze, beztlenowe · ok. 23%',
      role: { rest: 'Nie pracuje', sprint: 'Dołącza ok. połowa: największa moc' },
      tier: 'primary',
      referenceIds: ['bottinelli_1996', 'vollestad_blom_1985'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #23, #22; fakty_draft_K3_ruch.md: Vøllestad & Blom 1985; Bottinelli 1996 pkt 3
    },
    {
      anchor: 'd_myosin',
      view: 'detail',
      namePl: 'Główka miozyny',
      nameLat: 'mostek poprzeczny (PDB 5H53)',
      role: { rest: 'Nieliczne cykle mostków', sprint: 'Chwyta aktynę i ciągnie, zużywając ATP' },
      tier: 'primary',
      referenceIds: ['fujii_namba_2017'],
      roleStatus: { rest: 'unverifiable', sprint: 'checked_agent' }, // #6, #24 (model: stan rygoru, bez ATP)
    },
    {
      anchor: 'd_actin',
      view: 'detail',
      namePl: 'Filament aktynowy',
      nameLat: 'aktyna F',
      role: { rest: 'Lina, po której przesuwa się miozyna', sprint: 'Lina, po której przesuwa się miozyna' },
      tier: 'secondary',
      referenceIds: ['fujii_namba_2017'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #25
    },
  ],
  metrics: [
    {
      labelPl: 'Rekrutowane włókna mięśniowe',
      rest: 'typ I',
      sprint: 'typ I + IIa + część IIx',
      referenceIds: ['vollestad_blom_1985', 'mendell_2005', 'gollnick_1974'],
      evidenceLevel: 'established_human',
      notePl:
        'Zasada rozmiaru: jednostki ruchowe włączają się od najmniejszych do największych (opisana u kotów). Przy 91% VO₂max od początku pracują wszystkie włókna I i IIa oraz ok. połowa IIx.',
      protocolMismatch: 'rower, wysiłek ciągły przy 91% VO₂max',
      quote: 'glycogen breakdown was observed in all type I and IIA and in about 50% of type IIAB and IIB fibres',
      locator: 'Vøllestad & Blom 1985, abstrakt',
      status: 'checked_agent', // fakty_draft_K3_ruch.md
    },
    {
      labelPl: 'Skład włókien m. obszernego bocznego (I / IIa / IIx)',
      rest: '42 / 35 / 23',
      sprint: '42 / 35 / 23',
      unit: '%',
      referenceIds: ['staron_2000'],
      evidenceLevel: 'established_human',
      notePl:
        'Skład się nie zmienia, zmienia się to, które włókna pracują. Średnia ze 150 biopsji młodych, niewytrenowanych osób; rozrzut jest duży (typ I od ok. 17 do 97%).',
      conversionNote: 'I = I + IC; IIa = IIC + IIA + ½ IIAB; IIx = ½ IIAB + IIB (wzór autorów); IIB = IIX.',
      quote: 'approximately 41% I, 1% IC, 1% IIC, 31% IIA, 6% IIAB, and 20% IIB',
      locator: 'Staron 2000, abstrakt; Materials and Methods; tab. 2',
      status: 'checked_agent',
    },
    {
      labelPl: 'Udział mięśni w przepływie krwi',
      rest: 'ok. 15–20',
      sprint: 'ok. 80–85',
      unit: '% rzutu serca',
      referenceIds: ['kenney_2022'],
      evidenceLevel: 'established_human',
      status: 'unverifiable',
    },
    {
      labelPl: 'Zapotrzebowanie mięśni na ATP',
      rest: '1×',
      sprint: 'nawet ok. 1000×',
      referenceIds: ['baker_2010'],
      evidenceLevel: 'established_human',
      notePl: 'Przy maksymalnym wysiłku. ATP odtwarzają jednocześnie fosfokreatyna, glikoliza i mitochondria.',
      protocolMismatch: 'krótki wysiłek maksymalny; w naszym interwale mniej',
      quote: 'High-intensity exercise can result in up to a 1,000-fold increase in the rate of ATP demand',
      locator: 'Baker 2010, abstrakt',
      status: 'checked_agent',
    },
    {
      labelPl: 'Mleczan we krwi',
      rest: 'ok. 1',
      sprint: 'ok. 10',
      unit: 'mmol/L',
      referenceIds: ['brooks_2020', 'astorino_2025', 'brooks_2018'],
      evidenceLevel: 'established_human',
      notePl: 'Średnie z różnych badań HIIT: ok. 7–13. Mleczan nie jest „odpadem”: serce, mózg i włókna tlenowe zużywają go jako paliwo.',
      measuredAt: 'najwyższa wartość w połowie sesji albo 3 min po niej',
      protocolMismatch: 'rower, 8–12 × 30–60 s przy 70–85% mocy maksymalnej; 60 mężczyzn i 44 kobiety, VO₂max ok. 40 mL/kg/min, szczyt ok. 78% VO₂max',
      conversionNote: 'Średnie badań 6,6–13,2 mM zaokrąglone do 7–13.',
      quote: 'Peak BLa and energy expenditure were equal to 9.9 ± 3.1 mM',
      locator: 'Astorino 2025, Results „Physiological data”; Brooks 2020, Background (spoczynek ok. 1,0 mM)',
      status: 'checked_agent', // fakty_draft_K3_ruch.md
    },
  ],
  creditsPl:
    'Modele: Z-Anatomy (CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP). Mostek poprzeczny: PDB 5H53 (Fujii i Namba 2017, struktura z mięśnia królika), Molecular Nodes. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0.',
};
