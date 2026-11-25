import { ActDefinition, ActId } from '../types/biogenesis';

export const TOTAL_TIMELINE_DURATION_SEC = 1080; // 18 minut przy tempie 1.0x (cel: 15-25 min)

export const ACT_DEFINITIONS: ActDefinition[] = [
  {
    id: 1,
    roman: 'I',
    title: 'Przebudzenie organizmu',
    subtitle: 'Człowiek na bieżni — narodziny skoordynowanego wysiłku',
    systemLabel: 'Cały organizm · Układ mięśniowy, krążenia, oddechowy i nerwowy',
    scaleLabel: '1,8 m (Skala makro)',
    scaleExponent: 0,
    startTime: 0,
    endTime: 90,
    musicMotif: 'awakening',
    accentColor: '#38bdf8',
  },
  {
    id: 2,
    roman: 'II',
    title: 'Mobilizacja układu nerwowego',
    subtitle: 'Od decyzji o biegu do aktywacji mięśni i autonomicznego przełączenia',
    systemLabel: 'Kora ruchowa · Rdzeń kręgowy · Złącze nerwowo-mięśniowe · AUN',
    scaleLabel: '10⁻² – 10⁻⁶ m',
    scaleExponent: -4,
    startTime: 90,
    endTime: 180,
    musicMotif: 'mobilization',
    accentColor: '#22d3ee',
    educationalMagnificationNote: 'Fale świetlne w aksonie są umowną wizualizacją depolaryzacji błony (Na⁺/K⁺), nie błyskawicą.',
  },
  {
    id: 3,
    roman: 'III',
    title: 'Serce, płuca i układ krążenia',
    subtitle: 'Biologiczny system transportowy i podróż z erytrocytem',
    systemLabel: 'Serce · Węzeł SA/AV · Płuca · Pęcherzyki · Krwiobieg',
    scaleLabel: '10⁻¹ – 10⁻⁵ m',
    scaleExponent: -3,
    startTime: 180,
    endTime: 270,
    musicMotif: 'bloodstream',
    accentColor: '#fb7185',
  },
  {
    id: 4,
    roman: 'IV',
    title: 'Mięśnie: biologiczne silniki',
    subtitle: 'Hierarchia od brzuśca po cykl mostków poprzecznych aktyny i miozyny',
    systemLabel: 'Mięsień → Pęczek → Włókno → Miofibryla → Sarkomer',
    scaleLabel: '10⁻² – 10⁻⁸ m',
    scaleExponent: -7,
    startTime: 270,
    endTime: 360,
    musicMotif: 'muscle_machinery',
    accentColor: '#f97316',
    educationalMagnificationNote: 'Skala czasowa cyklu mostków poprzecznych (ATP/Ca²⁺) została zwolniona dla przejrzystości.',
  },
  {
    id: 5,
    roman: 'V',
    title: 'Wojna o energię i mitochondrium',
    subtitle: 'Współpraca systemów ATP, syntaza F₀F₁ i czółenko mleczanowe',
    systemLabel: 'Fosfagen · Glikoliza · Łańcuch oddechowy · Mleczan (MCT1/4)',
    scaleLabel: '10⁻⁶ – 10⁻⁹ m',
    scaleExponent: -9,
    startTime: 360,
    endTime: 450,
    musicMotif: 'mitochondria',
    accentColor: '#a855f7',
    educationalMagnificationNote: 'Symbolika cząsteczek w mitochondrium ilustruje gradient H⁺ i mechaniczną rotację syntazy ATP.',
  },
  {
    id: 6,
    roman: 'VI',
    title: 'HIIT: granice intensywności',
    subtitle: 'Szczyt interwału, równowaga kwasowo-zasadowa, termoregulacja i odpoczynek',
    systemLabel: 'Integracja metaboliczna · Podwzgórze · Zmęczenie obwodowe i ośrodkowe',
    scaleLabel: '10⁰ – 10⁻⁶ m',
    scaleExponent: -2,
    startTime: 450,
    endTime: 540,
    musicMotif: 'hiit_peak',
    accentColor: '#ef4444',
  },
  {
    id: 7,
    roman: 'VII',
    title: 'Ciało rozmawia z mózgiem',
    subtitle: 'Miokiny, mleczan, nerw błędny i selektywna brama bariery krew–mózg',
    systemLabel: 'Mięśnie ↔ Wątroba ↔ Układ krążenia ↔ Bariera krew–mózg (BBB)',
    scaleLabel: '10⁻⁴ – 10⁻⁸ m',
    scaleExponent: -6,
    startTime: 540,
    endTime: 630,
    musicMotif: 'bloodstream',
    accentColor: '#14b8a6',
  },
  {
    id: 8,
    roman: 'VIII',
    title: 'Neurochemiczna symfonia',
    subtitle: 'Struktury mózgu, układy modulacyjne i współczesna wiedza o runner’s high',
    systemLabel: 'VTA · Jądro półleżące · Miejsce sinawe · Jądra szwu · Endokannabinoidy',
    scaleLabel: '10⁻¹ – 10⁻³ m',
    scaleExponent: -2,
    startTime: 630,
    endTime: 720,
    musicMotif: 'brain',
    accentColor: '#38bdf8',
  },
  {
    id: 9,
    roman: 'IX',
    title: 'Podróż do wnętrza synapsy',
    subtitle: '9 etapów transmisji synaptycznej i różnorodność receptorowa',
    systemLabel: 'Akson mielinowy · Szczelina synaptyczna (20 nm) · AMPA/NMDA/GABA/GPCR/CB1',
    scaleLabel: '10⁻⁶ – 10⁻⁹ m',
    scaleExponent: -9,
    startTime: 720,
    endTime: 810,
    musicMotif: 'brain',
    accentColor: '#06b6d4',
    educationalMagnificationNote: '20 nm szczelina synaptyczna i milisekundowa dyfuzja zostały powiększone oraz spowolnione edukacyjnie.',
  },
  {
    id: 10,
    roman: 'X',
    title: 'BDNF i architektura neuroplastyczności',
    subtitle: 'TrkB, kaskady MAPK/ERK·PI3K/Akt·PLCγ, LTP, hipokamp i PFC',
    systemLabel: 'BDNF–TrkB · Kolce dendrytyczne · Zakręt zębaty · Kora przedczołowa',
    scaleLabel: '10⁻⁹ – 10⁻² m',
    scaleExponent: -8,
    startTime: 810,
    endTime: 900,
    musicMotif: 'neuroplasticity',
    accentColor: '#fbbf24',
  },
  {
    id: 11,
    roman: 'XI',
    title: 'Regeneracja i powrót do równowagi',
    subtitle: 'Reaktywacja przywspółczulna, EPOC, odbudowa zasobów i rola snu',
    systemLabel: 'Nerw błędny · Odbudowa PCr · Klirens mleczanu · Termoregulacja · Sen',
    scaleLabel: '1,8 m (Powrót do organizmu)',
    scaleExponent: 0,
    startTime: 900,
    endTime: 990,
    musicMotif: 'recovery',
    accentColor: '#fb923c',
  },
  {
    id: 12,
    roman: 'XII',
    title: 'Tydzień, Miesiąc, Rok',
    subtitle: 'Skutki ostre, powysiłkowe i adaptacje długoterminowe organizmu',
    systemLabel: 'Biogeneza mitochondriów · Kapilaryzacja · Serce · Hipokamp i odporność psychiczna',
    scaleLabel: 'Oś czasu adaptacji (Min → Rok)',
    scaleExponent: -3,
    startTime: 990,
    endTime: 1080,
    musicMotif: 'neuroplasticity',
    accentColor: '#34d399',
  },
];

export function getActAtTime(timeSec: number): {
  act: ActDefinition;
  nextAct: ActDefinition | null;
  actProgress: number;
  transitionBlend: number;
} {
  const clamped = Math.max(0, Math.min(TOTAL_TIMELINE_DURATION_SEC - 0.001, timeSec));
  const idx = ACT_DEFINITIONS.findIndex((a) => clamped >= a.startTime && clamped < a.endTime);
  const act = idx >= 0 ? ACT_DEFINITIONS[idx] : ACT_DEFINITIONS[ACT_DEFINITIONS.length - 1];
  const nextAct = idx >= 0 && idx < ACT_DEFINITIONS.length - 1 ? ACT_DEFINITIONS[idx + 1] : null;
  const dur = act.endTime - act.startTime;
  const actProgress = Math.max(0, Math.min(1, (clamped - act.startTime) / dur));

  // Cross-scale transition window during final 5 seconds of each Act
  const remainingSec = act.endTime - clamped;
  const transitionBlend = nextAct && remainingSec < 5.0 ? Math.max(0, Math.min(1, 1 - remainingSec / 5.0)) : 0;

  return { act, nextAct, actProgress, transitionBlend };
}

export function getActById(id: ActId): ActDefinition {
  return ACT_DEFINITIONS.find((a) => a.id === id) ?? ACT_DEFINITIONS[0];
}
