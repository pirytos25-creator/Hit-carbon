import * as THREE from 'three';
import { ActId } from '../types/biogenesis';
import { sampleBloodstreamCenterline } from '../scenes/Act03Cardiopulmonary';
import { NEURAL_FOREST_DIVE_POS } from '../scenes/Act08NeurochemicalSymphony';

export type LightingPresetId =
  | 'gym_daylight'
  | 'anatomy_medical'
  | 'bloodstream_organic'
  | 'mito_cathedral'
  | 'brain_atlas'
  | 'neural_forest'
  | 'synapse_macro'
  | 'recovery_golden';

export interface CinematicShot {
  id: string;
  narrativeGoalPl: string;
  educationalGoalPl: string;
  startU: number;
  endU: number;
  posPoints: [number, number, number][];
  targetPoints: [number, number, number][];
  fovStart: number;
  fovEnd: number;
  dofFocusDistance: number;
  dofBokehScale: number;
  lightingPreset: LightingPresetId;
  transitionType: 'continuous' | 'occlusion_dive' | 'match_cut';
  dynamicSampler?: (localU: number, outPos: THREE.Vector3, outTarget: THREE.Vector3) => void;
}

function makeDynamicBloodstreamSampler(uStartTunnel: number, uEndTunnel: number) {
  return (localU: number, outPos: THREE.Vector3, outTarget: THREE.Vector3) => {
    const tu = THREE.MathUtils.lerp(uStartTunnel, uEndTunnel, localU);
    sampleBloodstreamCenterline(tu, outPos);
    outPos.y += 0.08 * Math.sin(localU * Math.PI * 2);
    outPos.z += 0.10 * Math.cos(localU * Math.PI * 2);
    sampleBloodstreamCenterline(Math.min(0.99, tu + 0.12), outTarget);
  };
}

export const ACT_SHOT_CHOREOGRAPHY: Record<ActId, CinematicShot[]> = {
  // AKT I — 90-Second 8-Shot Cinematic Opening (Section 6)
  1: [
    {
      id: 'act01-shot01-gym-panorama',
      narrativeGoalPl: 'Ujęcie 1: Poranne światło naturalne i panorama architektonicznej siłowni.',
      educationalGoalPl: 'Kontekst środowiskowy organizmu przed eskalacją wysiłku.',
      startU: 0.0,
      endU: 0.133,
      posPoints: [
        [3.15, 2.35, -2.55],
        [2.75, 2.05, -2.15],
        [2.20, 1.75, -1.75],
      ],
      targetPoints: [
        [0.0, 1.05, 0.0],
        [0.0, 1.02, 0.0],
      ],
      fovStart: 46,
      fovEnd: 41,
      dofFocusDistance: 0.032,
      dofBokehScale: 1.0,
      lightingPreset: 'gym_daylight',
      transitionType: 'continuous',
    },
    {
      id: 'act01-shot02-shoes-treadmill',
      narrativeGoalPl: 'Ujęcie 2: Zbliżenie na buty biegowe i startujący pas bieżni.',
      educationalGoalPl: 'Synchronizacja fazy podporu i napędu bez poślizgu.',
      startU: 0.133,
      endU: 0.255,
      posPoints: [
        [1.35, 0.52, -0.78],
        [0.18, 0.46, -1.08],
        [-1.18, 0.52, -0.80],
      ],
      targetPoints: [
        [0.0, 0.36, 0.02],
        [0.0, 0.36, 0.02],
      ],
      fovStart: 36,
      fovEnd: 34,
      dofFocusDistance: 0.016,
      dofBokehScale: 1.9,
      lightingPreset: 'gym_daylight',
      transitionType: 'continuous',
    },
    {
      id: 'act01-shot03-silhouette-tracking',
      narrativeGoalPl: 'Ujęcie 3: Dynamiczny dolly wzdłuż pracującej sylwetki biegacza.',
      educationalGoalPl: 'Koordynacja rotacji bioder, pracy ramion i oddechu klatki piersiowej.',
      startU: 0.255,
      endU: 0.411,
      posPoints: [
        [-1.65, 1.25, -0.95],
        [-2.05, 1.38, 0.15],
        [-1.55, 1.35, 1.15],
        [1.45, 1.32, -1.05],
      ],
      targetPoints: [
        [0.0, 1.08, 0.04],
        [0.0, 1.12, 0.02],
      ],
      fovStart: 42,
      fovEnd: 38,
      dofFocusDistance: 0.026,
      dofBokehScale: 1.3,
      lightingPreset: 'gym_daylight',
      transitionType: 'continuous',
    },
    {
      id: 'act01-shot04-face-effort',
      narrativeGoalPl: 'Ujęcie 4: Portretowe zbliżenie na twarz, skupienie i narastający wysiłek.',
      educationalGoalPl: 'Wzrost wentylacji, grymas oddechowy i termoregulacja.',
      startU: 0.411,
      endU: 0.533,
      posPoints: [
        [0.55, 1.82, -1.06],
        [0.06, 1.84, -1.00],
        [-0.46, 1.80, -1.02],
      ],
      targetPoints: [
        [0.0, 1.78, 0.02],
        [0.0, 1.79, 0.02],
      ],
      fovStart: 32,
      fovEnd: 30,
      dofFocusDistance: 0.014,
      dofBokehScale: 2.0,
      lightingPreset: 'gym_daylight',
      transitionType: 'continuous',
    },
    {
      id: 'act01-shot05-thigh-cutaway',
      narrativeGoalPl: 'Ujęcie 5: Najazd na udo i organiczne odsłonięcie pracujących mięśni czworogłowych.',
      educationalGoalPl: 'Przekrój anatomiczny ujawniający pracę mięśni pod skórą.',
      startU: 0.533,
      endU: 0.667,
      posPoints: [
        [-0.45, 0.92, -0.82],
        [-0.64, 0.72, -0.62],
        [-0.68, 0.70, -0.35],
      ],
      targetPoints: [
        [-0.12, 0.72, 0.04],
        [-0.14, 0.68, 0.04],
      ],
      fovStart: 34,
      fovEnd: 32,
      dofFocusDistance: 0.015,
      dofBokehScale: 1.8,
      lightingPreset: 'anatomy_medical',
      transitionType: 'continuous',
    },
    {
      id: 'act01-shot06-deep-anatomy-orbit',
      narrativeGoalPl: 'Ujęcie 6: Przegląd głębokich grup mięśniowych, kośćca, serca i sieci naczyń.',
      educationalGoalPl: 'Integracja układu ruchu, krążenia i nerwowego w tym samym kroku.',
      startU: 0.667,
      endU: 0.800,
      posPoints: [
        [-0.85, 1.15, -0.95],
        [-0.15, 1.25, -1.35],
        [0.78, 1.20, -0.95],
      ],
      targetPoints: [
        [0.0, 1.05, 0.02],
        [0.0, 1.08, 0.02],
      ],
      fovStart: 38,
      fovEnd: 36,
      dofFocusDistance: 0.022,
      dofBokehScale: 1.4,
      lightingPreset: 'anatomy_medical',
      transitionType: 'continuous',
    },
    {
      id: 'act01-shot07-scale-dive-fibers',
      narrativeGoalPl: 'Ujęcie 7: Wejście w przestrzeń biologiczną ku naczyniom i włóknom uda.',
      educationalGoalPl: 'Przejście z makroanatomii w głąb tkanek.',
      startU: 0.800,
      endU: 0.922,
      posPoints: [
        [-0.55, 0.86, -0.65],
        [-0.36, 0.78, -0.38],
        [-0.24, 0.74, -0.18],
      ],
      targetPoints: [
        [-0.10, 0.70, 0.03],
        [-0.08, 0.70, 0.05],
      ],
      fovStart: 35,
      fovEnd: 26,
      dofFocusDistance: 0.012,
      dofBokehScale: 2.2,
      lightingPreset: 'anatomy_medical',
      transitionType: 'occlusion_dive',
    },
    {
      id: 'act01-shot08-interior-portal',
      narrativeGoalPl: 'Ujęcie 8: Ostateczne przeniknięcie przez powłoki tkanek do wnętrza organizmu.',
      educationalGoalPl: 'Początek podróży neuronalnej i metabolicznej wewnątrz ciała.',
      startU: 0.922,
      endU: 1.0,
      posPoints: [
        [-0.24, 0.74, -0.18],
        [-0.12, 0.71, -0.02],
      ],
      targetPoints: [
        [-0.04, 0.74, 0.14],
        [0.0, 0.82, 0.25],
      ],
      fovStart: 26,
      fovEnd: 18,
      dofFocusDistance: 0.010,
      dofBokehScale: 2.6,
      lightingPreset: 'neural_forest',
      transitionType: 'occlusion_dive',
    },
  ],

  // AKT II — Mobilizacja układu nerwowego
  2: [
    {
      id: 'act02-s1-motor-cortex',
      narrativeGoalPl: 'Kora ruchowa projektuje komendę ruchu jeszcze przed odbiciem stopy.',
      educationalGoalPl: 'Droga korowo-rdzeniowa i motoneurony alfa.',
      startU: 0.0,
      endU: 0.38,
      posPoints: [[-0.55, 2.05, 2.85], [-0.45, 1.35, 2.25]],
      targetPoints: [[-0.68, 1.28, 0.0], [-0.55, 0.65, 0.0]],
      fovStart: 42,
      fovEnd: 38,
      dofFocusDistance: 0.024,
      dofBokehScale: 1.5,
      lightingPreset: 'neural_forest',
      transitionType: 'continuous',
    },
    {
      id: 'act02-s2-nmj-recruitment',
      narrativeGoalPl: 'Wędrówka sygnału do złącza nerwowo-mięśniowego i rekrutacja jednostek.',
      educationalGoalPl: 'Acetylocholina oraz zasada wielkości Hennemana.',
      startU: 0.38,
      endU: 0.72,
      posPoints: [[0.55, 0.45, 2.25], [1.45, -0.45, 1.95]],
      targetPoints: [[0.95, -0.55, 0.0], [1.25, -0.78, 0.0]],
      fovStart: 38,
      fovEnd: 35,
      dofFocusDistance: 0.020,
      dofBokehScale: 1.7,
      lightingPreset: 'neural_forest',
      transitionType: 'continuous',
    },
    {
      id: 'act02-s3-autonomic-adrenal',
      narrativeGoalPl: 'Współczulna mobilizacja nadnerczy i wycofanie hamowania błędnego.',
      educationalGoalPl: 'Noradrenalina lokalna vs adrenalina z rdzenia nadnerczy.',
      startU: 0.72,
      endU: 1.0,
      posPoints: [[-0.65, -0.45, 2.25], [-1.35, -0.78, 1.65]],
      targetPoints: [[-1.35, -0.88, 0.15], [-1.45, -0.92, 0.18]],
      fovStart: 38,
      fovEnd: 34,
      dofFocusDistance: 0.020,
      dofBokehScale: 1.7,
      lightingPreset: 'neural_forest',
      transitionType: 'occlusion_dive',
    },
  ],

  // AKT III — Serce, Płuca & Benchmark B Krwiobieg Wewnętrzny
  3: [
    {
      id: 'act03-s1-heart-reveal',
      narrativeGoalPl: 'Skoordynowana praca serca HuBMAP: przedsionki, komory i zastawki.',
      educationalGoalPl: 'Fala przewodzenia SA -> AV -> His-Purkinje i skręt koniuszka.',
      startU: 0.0,
      endU: 0.24,
      posPoints: [[0.58, 0.34, 2.25], [0.22, 0.12, 1.65]],
      targetPoints: [[0.0, 0.02, 0.0], [0.02, 0.0, 0.04]],
      fovStart: 40,
      fovEnd: 35,
      dofFocusDistance: 0.018,
      dofBokehScale: 1.6,
      lightingPreset: 'anatomy_medical',
      transitionType: 'continuous',
    },
    {
      id: 'act03-s2-coronary-valves',
      narrativeGoalPl: 'Zbliżenie na zastawki półksiężycowate i krążenie wieńcowe.',
      educationalGoalPl: 'Mechanika otwierania zastawek i rzut serca przy HIIT.',
      startU: 0.24,
      endU: 0.38,
      posPoints: [[0.18, 0.08, 1.18], [-0.42, 0.12, 0.96]],
      targetPoints: [[0.02, 0.04, 0.04], [0.04, 0.06, 0.04]],
      fovStart: 35,
      fovEnd: 31,
      dofFocusDistance: 0.015,
      dofBokehScale: 1.9,
      lightingPreset: 'anatomy_medical',
      transitionType: 'continuous',
    },
    {
      id: 'act03-s3-alveoli-diffusion',
      narrativeGoalPl: 'Przeniknięcie przez oskrzela ku pęcherzykom płucnym i wymianie gazowej.',
      educationalGoalPl: 'Bierna dyfuzja O2 i CO2 przez barierę pęcherzykowo-włośniczkową.',
      startU: 0.38,
      endU: 0.56,
      posPoints: [[1.15, 0.22, 1.25], [2.42, 0.10, 0.68]],
      targetPoints: [[2.42, 0.04, 0.0], [2.45, 0.04, 0.0]],
      fovStart: 36,
      fovEnd: 30,
      dofFocusDistance: 0.015,
      dofBokehScale: 2.0,
      lightingPreset: 'bloodstream_organic',
      transitionType: 'occlusion_dive',
    },
    {
      id: 'act03-s4-bloodstream-tunnel-entry',
      narrativeGoalPl: 'Wejście do wnętrza tętnicy z falą przepływu erytrocytów.',
      educationalGoalPl: 'Laminarny profil Poiseuille’a i tętno fali tętna.',
      startU: 0.56,
      endU: 0.80,
      posPoints: [[0, -24, 0]],
      targetPoints: [[1, -24, 0]],
      fovStart: 50,
      fovEnd: 54,
      dofFocusDistance: 0.016,
      dofBokehScale: 1.8,
      lightingPreset: 'bloodstream_organic',
      transitionType: 'match_cut',
      dynamicSampler: makeDynamicBloodstreamSampler(0.10, 0.52),
    },
    {
      id: 'act03-s5-capillary-squeeze',
      narrativeGoalPl: 'Zwężenie włośniczek: elastyczne odkształcenie erytrocytów i oddawanie tlenu.',
      educationalGoalPl: 'Odkształcenie spadochronowe krwinek w mikrokrążeniu mięśni.',
      startU: 0.80,
      endU: 1.0,
      posPoints: [[0, -24, 0]],
      targetPoints: [[1, -24, 0]],
      fovStart: 54,
      fovEnd: 46,
      dofFocusDistance: 0.014,
      dofBokehScale: 2.1,
      lightingPreset: 'bloodstream_organic',
      transitionType: 'occlusion_dive',
      dynamicSampler: makeDynamicBloodstreamSampler(0.52, 0.86),
    },
  ],

  // AKT IV — Mięśnie: wieloskalowa podróż do sarkomeru
  4: [
    {
      id: 'act04-s1-muscle-belly',
      narrativeGoalPl: 'Zbliżenie na cały brzusiec mięśniowy i ślizg pęczków włókien.',
      educationalGoalPl: 'Hierarchia od mięśnia do włókien typu I i II.',
      startU: 0.0,
      endU: 0.30,
      posPoints: [[-0.65, 1.55, 3.25], [0.25, 1.22, 2.35]],
      targetPoints: [[-0.1, 0.85, 1.35], [0.55, 0.85, 1.35]],
      fovStart: 42,
      fovEnd: 38,
      dofFocusDistance: 0.022,
      dofBokehScale: 1.5,
      lightingPreset: 'anatomy_medical',
      transitionType: 'continuous',
    },
    {
      id: 'act04-s2-sr-t-tubule',
      narrativeGoalPl: 'Kanaliki T wyzwalają uwolnienie jonów Ca2+ z siateczki sarkoplazmatycznej.',
      educationalGoalPl: 'Sprzężenie pobudzenie–skurcz i wiązanie Ca2+ z troponiną.',
      startU: 0.30,
      endU: 0.55,
      posPoints: [[0.95, 1.05, 2.15], [1.25, 0.55, 1.65]],
      targetPoints: [[1.15, 0.85, 1.35], [0.45, 0.15, 0.25]],
      fovStart: 38,
      fovEnd: 36,
      dofFocusDistance: 0.018,
      dofBokehScale: 1.8,
      lightingPreset: 'anatomy_medical',
      transitionType: 'continuous',
    },
    {
      id: 'act04-s3-sarcomere-crossbridge',
      narrativeGoalPl: 'Zwolniony czas w sarkomerze: ruch roboczy główek miozyny wzdłuż aktyny.',
      educationalGoalPl: 'Niezmienna długość filamentów w modelu ślizgowym Huxleya.',
      startU: 0.55,
      endU: 1.0,
      posPoints: [[0.75, 0.38, 2.15], [0.05, 0.28, 1.78], [-0.85, 0.32, 1.88]],
      targetPoints: [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0]],
      fovStart: 36,
      fovEnd: 34,
      dofFocusDistance: 0.015,
      dofBokehScale: 1.9,
      lightingPreset: 'anatomy_medical',
      transitionType: 'occlusion_dive',
    },
  ],

  // AKT V — Benchmark C: Monumentalne Mitochondrium & PDB 8H9T Syntaza ATP
  5: [
    {
      id: 'act05-s1-cathedral-entry',
      narrativeGoalPl: 'Wkroczenie w katedrę grzebieni błonowych mitochondrium.',
      educationalGoalPl: 'Podwójna błona i pofałdowane grzebienie zwiększające powierzchnię bioenergetyczną.',
      startU: 0.0,
      endU: 0.28,
      posPoints: [[0.18, 0.92, 3.10], [-0.78, 0.58, 2.05]],
      targetPoints: [[-0.25, 0.20, 0.02], [-0.55, 0.18, 0.04]],
      fovStart: 42,
      fovEnd: 37,
      dofFocusDistance: 0.020,
      dofBokehScale: 1.5,
      lightingPreset: 'mito_cathedral',
      transitionType: 'continuous',
    },
    {
      id: 'act05-s2-etc-5xtd',
      narrativeGoalPl: 'Przelot wzdłuż superkompleksu oddechowego I -> III2 -> IV (Cryo-EM 5XTD).',
      educationalGoalPl: 'Transport elektronów sprzężony z pompowaniem protonów H+ do przestrzeni międzybłonowej.',
      startU: 0.28,
      endU: 0.54,
      posPoints: [[-1.32, 0.48, 1.52], [-0.62, 0.44, 1.38], [0.15, 0.46, 1.28]],
      targetPoints: [[-0.85, 0.16, 0.04], [-0.25, 0.16, 0.04], [0.35, 0.24, 0.04]],
      fovStart: 36,
      fovEnd: 34,
      dofFocusDistance: 0.016,
      dofBokehScale: 1.8,
      lightingPreset: 'mito_cathedral',
      transitionType: 'continuous',
    },
    {
      id: 'act05-s3-atp-synthase-macro',
      narrativeGoalPl: 'Makro na ludzką syntazę F1F0-ATP (Cryo-EM 8H9T): rotacja c8 i konformacja F1.',
      educationalGoalPl: 'Kataliza obrotowa Boyera (Open -> Loose -> Tight) produkująca ATP.',
      startU: 0.54,
      endU: 0.84,
      posPoints: [[0.40, 0.56, 1.52], [1.05, 0.50, 1.32], [1.32, 0.46, 1.28]],
      targetPoints: [[0.68, 0.30, 0.04], [0.68, 0.32, 0.04]],
      fovStart: 35,
      fovEnd: 31,
      dofFocusDistance: 0.013,
      dofBokehScale: 2.2,
      lightingPreset: 'mito_cathedral',
      transitionType: 'continuous',
    },
    {
      id: 'act05-s4-lactate-shuttle',
      narrativeGoalPl: 'Uwolnione pakiety ATP oraz czółenko mleczanowe opuszczające mitochondrium.',
      educationalGoalPl: 'Mleczan jako cenne paliwo oksydacyjne mięśni, serca i mózgu.',
      startU: 0.84,
      endU: 1.0,
      posPoints: [[1.22, 0.44, 0.92], [0.35, 1.02, 2.40]],
      targetPoints: [[0.35, 0.32, 0.04], [0.15, 0.28, 0.0]],
      fovStart: 29,
      fovEnd: 40,
      dofFocusDistance: 0.022,
      dofBokehScale: 1.4,
      lightingPreset: 'mito_cathedral',
      transitionType: 'occlusion_dive',
    },
  ],

  // AKT VI — HIIT: Granice intensywności
  6: [
    {
      id: 'act06-s1-peak-sprint',
      narrativeGoalPl: 'Maksymalny sprint interwałowy na bieżni i prześwit pracy serca.',
      educationalGoalPl: 'Szczytowy obrót ATP, buforowanie H+ i odpowiedź termoregulacyjna.',
      startU: 0.0,
      endU: 0.55,
      posPoints: [[2.25, 1.44, -0.65], [1.92, 1.56, 0.35], [-1.95, 1.48, -0.58]],
      targetPoints: [[0.0, 1.08, 0.02], [0.0, 1.12, 0.02]],
      fovStart: 44,
      fovEnd: 40,
      dofFocusDistance: 0.022,
      dofBokehScale: 1.4,
      lightingPreset: 'anatomy_medical',
      transitionType: 'continuous',
    },
    {
      id: 'act06-s2-recovery-transition',
      narrativeGoalPl: 'Przejście do aktywnego odpoczynku i obniżenie tempa kroku.',
      educationalGoalPl: 'Współczynnik powrotu tętna i spłata długu fosfagenowego.',
      startU: 0.55,
      endU: 1.0,
      posPoints: [[-2.10, 1.42, -0.95], [1.85, 1.32, -1.25]],
      targetPoints: [[0.0, 1.08, 0.02], [0.0, 1.04, 0.02]],
      fovStart: 40,
      fovEnd: 43,
      dofFocusDistance: 0.024,
      dofBokehScale: 1.2,
      lightingPreset: 'gym_daylight',
      transitionType: 'occlusion_dive',
    },
  ],

  // AKT VII — Bariera Krew-Mózg (BBB) wewnątrz naczynia
  7: [
    {
      id: 'act07-s1-carotid-approach',
      narrativeGoalPl: 'Lot tętnicą w głąb naczynia mózgowego ku ścisłym połączeniom BBB.',
      educationalGoalPl: 'Selektywna bariera chroniąca środowisko synaptyczne.',
      startU: 0.0,
      endU: 0.45,
      posPoints: [[-3.1, 0.16, 0.05], [-1.35, 0.12, -0.45]],
      targetPoints: [[0.35, 0.02, -0.78], [0.38, 0.02, -0.78]],
      fovStart: 46,
      fovEnd: 38,
      dofFocusDistance: 0.018,
      dofBokehScale: 1.8,
      lightingPreset: 'bloodstream_organic',
      transitionType: 'continuous',
    },
    {
      id: 'act07-s2-mct1-gate',
      narrativeGoalPl: 'Zatrzymanie obwodowej adrenaliny przy przepuszczeniu mleczanu przez MCT1.',
      educationalGoalPl: 'Różnica między sygnalizacją hormonalną a nerwem błędnym.',
      startU: 0.45,
      endU: 1.0,
      posPoints: [[-1.35, 0.12, -0.45], [-0.45, 0.38, -0.25], [1.45, 0.25, -0.35]],
      targetPoints: [[0.38, 0.02, -0.78], [1.15, 0.02, -0.72]],
      fovStart: 38,
      fovEnd: 35,
      dofFocusDistance: 0.016,
      dofBokehScale: 2.0,
      lightingPreset: 'bloodstream_organic',
      transitionType: 'occlusion_dive',
    },
  ],

  // AKT VIII — Benchmark D: Realny Mózg Allen Atlas -> Zanurzenie w Las Neuronów
  8: [
    {
      id: 'act08-s1-cortex-gyri',
      narrativeGoalPl: 'Zbliżenie do anatomicznych zakrętów i bruzd kory ludzkiego mózgu.',
      educationalGoalPl: 'Topografia kory przedczołowej, ruchowej, móżdżku i pnia.',
      startU: 0.0,
      endU: 0.26,
      posPoints: [[2.60, 0.92, 2.75], [2.15, 0.68, 2.15]],
      targetPoints: [[0.0, 0.0, 0.0], [0.0, -0.02, 0.0]],
      fovStart: 42,
      fovEnd: 38,
      dofFocusDistance: 0.020,
      dofBokehScale: 1.5,
      lightingPreset: 'brain_atlas',
      transitionType: 'continuous',
    },
    {
      id: 'act08-s2-sagittal-cutaway',
      narrativeGoalPl: 'Przekrój strzałkowy prawej półkuli odsłaniający głębokie jądra i szlaki.',
      educationalGoalPl: 'Szlaki dopaminergiczne VTA->NAcc, miejsce sinawe, jądra szwu i układ endokannabinoidowy.',
      startU: 0.26,
      endU: 0.68,
      posPoints: [[1.75, 0.58, 1.75], [2.10, 0.35, 0.35], [1.25, 0.25, 1.45]],
      targetPoints: [[0.0, -0.05, 0.05], [0.0, -0.08, 0.12]],
      fovStart: 38,
      fovEnd: 35,
      dofFocusDistance: 0.018,
      dofBokehScale: 1.6,
      lightingPreset: 'brain_atlas',
      transitionType: 'continuous',
    },
    {
      id: 'act08-s3-dive-neural-forest',
      narrativeGoalPl: 'Przeniknięcie w głąb hipokampa wprost w trójwymiarowy las neuronów.',
      educationalGoalPl: 'Przejście z makroanatomii mózgu do sieci komórek piramidowych i gleju.',
      startU: 0.68,
      endU: 1.0,
      posPoints: [
        [0.45, 0.10, 0.55],
        [NEURAL_FOREST_DIVE_POS.x + 1.15, NEURAL_FOREST_DIVE_POS.y + 0.52, NEURAL_FOREST_DIVE_POS.z + 2.35],
        [NEURAL_FOREST_DIVE_POS.x + 0.25, NEURAL_FOREST_DIVE_POS.y + 0.22, NEURAL_FOREST_DIVE_POS.z + 1.15],
      ],
      targetPoints: [
        [NEURAL_FOREST_DIVE_POS.x, NEURAL_FOREST_DIVE_POS.y + 0.1, NEURAL_FOREST_DIVE_POS.z],
        [NEURAL_FOREST_DIVE_POS.x - 0.35, NEURAL_FOREST_DIVE_POS.y + 0.15, NEURAL_FOREST_DIVE_POS.z - 0.5],
      ],
      fovStart: 38,
      fovEnd: 46,
      dofFocusDistance: 0.014,
      dofBokehScale: 2.1,
      lightingPreset: 'neural_forest',
      transitionType: 'occlusion_dive',
    },
  ],

  // AKT IX — Benchmark D: Molekularna Choreografia Synapsy
  9: [
    {
      id: 'act09-s1-axon-wave',
      narrativeGoalPl: 'Lot wzdłuż aksonu mielinowego śladem depolaryzacji skokowej.',
      educationalGoalPl: 'Przewężenia Ranviera i błyskawiczne pobudzenie zakończenia.',
      startU: 0.0,
      endU: 0.28,
      posPoints: [[-1.75, 0.52, 1.55], [-0.95, 0.38, 1.38]],
      targetPoints: [[-0.85, 0.02, 0.0], [-0.35, 0.0, 0.0]],
      fovStart: 42,
      fovEnd: 38,
      dofFocusDistance: 0.015,
      dofBokehScale: 2.0,
      lightingPreset: 'synapse_macro',
      transitionType: 'continuous',
    },
    {
      id: 'act09-s2-cav-snare-fusion',
      narrativeGoalPl: 'Otwarcie kanałów CaV i fuzja pęcherzyków przy udziale białek SNARE.',
      educationalGoalPl: 'Zależne od wapnia uwolnienie neuroprzekaźników.',
      startU: 0.28,
      endU: 0.56,
      posPoints: [[-0.95, 0.38, 1.38], [-0.22, 0.28, 1.12]],
      targetPoints: [[-0.18, 0.0, 0.0], [-0.04, 0.0, 0.0]],
      fovStart: 38,
      fovEnd: 32,
      dofFocusDistance: 0.013,
      dofBokehScale: 2.2,
      lightingPreset: 'synapse_macro',
      transitionType: 'continuous',
    },
    {
      id: 'act09-s3-cleft-receptors',
      narrativeGoalPl: '20-nanometrowa szczelina synaptyczna i odmienne mechanizmy receptorowe.',
      educationalGoalPl: 'Kanały AMPA/NMDA (wyrzut Mg2+), GABA_A, GPCR D1/białko G oraz wsteczny 2-AG/CB1.',
      startU: 0.56,
      endU: 1.0,
      posPoints: [[-0.28, 0.34, 1.45], [0.52, 0.28, 1.42], [0.95, 0.42, 1.65]],
      targetPoints: [[0.06, 0.06, 0.0], [0.14, 0.06, 0.0], [0.05, 0.04, 0.0]],
      fovStart: 35,
      fovEnd: 38,
      dofFocusDistance: 0.014,
      dofBokehScale: 2.1,
      lightingPreset: 'synapse_macro',
      transitionType: 'continuous',
    },
  ],

  // AKT X — Benchmark D: Kulminacja BDNF & Neuroplastyczności
  10: [
    {
      id: 'act10-s1-bdnf-trkb-docking',
      narrativeGoalPl: 'Homodimer PDB 1B8M BDNF spina receptory TrkB, uruchamiając trzy kaskady.',
      educationalGoalPl: 'MAPK/ERK -> transkrypcja CREB, PI3K/Akt -> mTOR, PLCγ -> Ca2+.',
      startU: 0.0,
      endU: 0.45,
      posPoints: [[0.28, 0.54, 1.95], [0.42, 0.42, 1.48]],
      targetPoints: [[0.14, 0.12, 0.0], [0.20, 0.10, 0.0]],
      fovStart: 40,
      fovEnd: 34,
      dofFocusDistance: 0.015,
      dofBokehScale: 2.0,
      lightingPreset: 'synapse_macro',
      transitionType: 'continuous',
    },
    {
      id: 'act10-s2-actin-spine-timelapse',
      narrativeGoalPl: 'Time-lapse: polimeryzacja aktyny, wstawienie receptorów AMPA i rozrost kolca.',
      educationalGoalPl: 'Przebudowa strukturalna długotrwałego wzmocnienia (LTP) w skali czasu.',
      startU: 0.45,
      endU: 0.78,
      posPoints: [[0.42, 0.42, 1.48], [0.88, 0.44, 1.60]],
      targetPoints: [[0.22, 0.08, 0.0], [0.20, 0.06, 0.0]],
      fovStart: 34,
      fovEnd: 37,
      dofFocusDistance: 0.015,
      dofBokehScale: 1.9,
      lightingPreset: 'synapse_macro',
      transitionType: 'match_cut',
    },
    {
      id: 'act10-s3-network-climax-pullback',
      narrativeGoalPl: 'Wielki odjazd ukazujący wzmocnioną synapsę na tle sieci Hipokamp–PFC.',
      educationalGoalPl: 'Znaczenie wielotygodniowego treningu dla pamięci i odporności poznawczej.',
      startU: 0.78,
      endU: 1.0,
      posPoints: [[0.95, 0.65, 1.95], [2.15, 0.92, 2.55]],
      targetPoints: [[0.0, 0.05, 0.0], [0.0, 0.08, 0.0]],
      fovStart: 38,
      fovEnd: 44,
      dofFocusDistance: 0.022,
      dofBokehScale: 1.4,
      lightingPreset: 'brain_atlas',
      transitionType: 'occlusion_dive',
    },
  ],

  // AKT XI — Regeneracja i powrót do ciała
  11: [
    {
      id: 'act11-s1-cooldown',
      narrativeGoalPl: 'Powrót ze struktur mózgu do chłodzącego się, spokojnego organizmu na siłowni.',
      educationalGoalPl: 'Reaktywacja nerwu błędnego, EPOC, klirens mleczanu i rola snu.',
      startU: 0.0,
      endU: 1.0,
      posPoints: [[0.45, 1.68, -0.88], [2.25, 1.40, -1.25], [-2.15, 1.48, -1.08]],
      targetPoints: [[0.0, 1.52, 0.02], [0.0, 1.06, 0.02], [0.0, 1.02, 0.02]],
      fovStart: 36,
      fovEnd: 45,
      dofFocusDistance: 0.024,
      dofBokehScale: 1.2,
      lightingPreset: 'recovery_golden',
      transitionType: 'continuous',
    },
  ],

  // AKT XII — Tydzień, Miesiąc, Rok
  12: [
    {
      id: 'act12-s1-long-term-triptych',
      narrativeGoalPl: 'Panorama adaptacji: przebudowa serca, biogeneza mitochondriów i neuroplastyczność.',
      educationalGoalPl: 'Wyraźne rozróżnienie skutków ostrych i adaptacji wielomiesięcznych.',
      startU: 0.0,
      endU: 1.0,
      posPoints: [[-0.55, 1.05, 4.65], [0.0, 0.95, 4.35], [0.65, 1.05, 4.55]],
      targetPoints: [[0.0, 0.22, 0.0], [0.0, 0.22, 0.0]],
      fovStart: 44,
      fovEnd: 40,
      dofFocusDistance: 0.026,
      dofBokehScale: 1.1,
      lightingPreset: 'recovery_golden',
      transitionType: 'continuous',
    },
  ],
};

function evalPolySpline(points: [number, number, number][], t: number, out: THREE.Vector3) {
  if (points.length === 1) {
    out.set(points[0][0], points[0][1], points[0][2]);
    return;
  }
  const n = points.length - 1;
  const scaled = Math.max(0, Math.min(n - 1e-6, t * n));
  const i = Math.floor(scaled);
  const f = scaled - i;
  const s = f * f * (3 - 2 * f);
  const a = points[i];
  const b = points[Math.min(n, i + 1)];
  out.set(
    THREE.MathUtils.lerp(a[0], b[0], s),
    THREE.MathUtils.lerp(a[1], b[1], s),
    THREE.MathUtils.lerp(a[2], b[2], s)
  );
}

export function evaluateActShot(
  actId: ActId,
  actProgress: number,
  outPos: THREE.Vector3,
  outTarget: THREE.Vector3
): {
  shot: CinematicShot;
  fov: number;
  dofFocusDistance: number;
  dofBokehScale: number;
  lightingPreset: LightingPresetId;
} {
  const shots = ACT_SHOT_CHOREOGRAPHY[actId];
  let activeShot = shots[shots.length - 1];
  for (let i = 0; i < shots.length; i++) {
    if (actProgress <= shots[i].endU || i === shots.length - 1) {
      activeShot = shots[i];
      break;
    }
  }

  const span = Math.max(0.001, activeShot.endU - activeShot.startU);
  const localU = THREE.MathUtils.clamp((actProgress - activeShot.startU) / span, 0, 1);

  if (activeShot.dynamicSampler) {
    activeShot.dynamicSampler(localU, outPos, outTarget);
  } else {
    evalPolySpline(activeShot.posPoints, localU, outPos);
    evalPolySpline(activeShot.targetPoints, localU, outTarget);
  }

  const smoothU = localU * localU * (3 - 2 * localU);
  return {
    shot: activeShot,
    fov: THREE.MathUtils.lerp(activeShot.fovStart, activeShot.fovEnd, smoothU),
    dofFocusDistance: activeShot.dofFocusDistance,
    dofBokehScale: activeShot.dofBokehScale,
    lightingPreset: activeShot.lightingPreset,
  };
}
