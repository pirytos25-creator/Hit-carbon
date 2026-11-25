import {
  ActId,
  BloodFlowDistribution,
  EnergySystemShares,
  FitnessLevel,
  HIITProtocolConfig,
  OrganismState,
  SignalingQualitativeState,
  WorkoutPhaseId,
} from '../types/biogenesis';

/**
 * Edukacyjny, sprzężony model fizjologii wysiłku interwałowego (HIIT).
 * UWAGA NAUKOWA: Model ma charakter poglądowo-edukacyjny. Nie służy do diagnozowania
 * ani przepisywania indywidualnych obciążeń treningowych.
 * Nie oblicza fałszywych stężeń neuroprzekaźników OUN ani BDNF na podstawie suwaka intensywności.
 */

export const DEFAULT_HIIT_CONFIG: HIITProtocolConfig = {
  intensityPctVO2max: 88,
  intervalWorkSec: 45,
  intervalRestSec: 45,
  intervalsCount: 6,
  fitnessLevel: 'recreational',
};

const FITNESS_FACTORS: Record<
  FitnessLevel,
  { vo2MaxLpm: number; restHr: number; maxSvMl: number; pcrRecoveryRate: number; lactateClearance: number }
> = {
  beginner: { vo2MaxLpm: 2.7, restHr: 72, maxSvMl: 108, pcrRecoveryRate: 0.72, lactateClearance: 0.75 },
  recreational: { vo2MaxLpm: 3.6, restHr: 60, maxSvMl: 132, pcrRecoveryRate: 1.0, lactateClearance: 1.0 },
  trained: { vo2MaxLpm: 4.8, restHr: 48, maxSvMl: 158, pcrRecoveryRate: 1.38, lactateClearance: 1.35 },
};

export function normalizeEnergyShares(rawPhos: number, rawGly: number, rawOx: number): EnergySystemShares {
  const p = Math.max(0.5, rawPhos);
  const g = Math.max(0.5, rawGly);
  const o = Math.max(0.5, rawOx);
  const sum = p + g + o;
  const phosphagen = Math.round((p / sum) * 1000) / 10;
  const glycolytic = Math.round((g / sum) * 1000) / 10;
  const oxidative = Math.max(0, Math.round((100 - phosphagen - glycolytic) * 10) / 10);
  return { phosphagen, glycolytic, oxidative };
}

export function normalizeBloodFlow(
  muscle: number,
  heart: number,
  brain: number,
  skin: number,
  visceral: number
): BloodFlowDistribution {
  const total = muscle + heart + brain + skin + visceral;
  const m = Math.round((muscle / total) * 100);
  const h = Math.round((heart / total) * 100);
  const b = Math.round((brain / total) * 100);
  const s = Math.round((skin / total) * 100);
  const v = Math.max(2, 100 - m - h - b - s);
  return { muscle: m, heart: h, brain: b, skin: s, visceral: v };
}

export function getPhaseLabelPl(phase: WorkoutPhaseId): string {
  switch (phase) {
    case 'rest':
      return 'Spoczynek bazowy';
    case 'warmup':
      return 'Rozgrzewka — trucht';
    case 'hiit_peak':
      return 'Intensywny interwał HIIT';
    case 'active_recovery':
      return 'Aktywny odpoczynek';
    case 'hiit_repeat':
      return 'Kolejny interwał (kumulacja)';
    case 'cooldown':
      return 'Wyciszenie i regeneracja';
  }
}

export function createInitialOrganismState(fitness: FitnessLevel = 'recreational'): OrganismState {
  const f = FITNESS_FACTORS[fitness];
  return {
    workoutPhase: 'rest',
    workoutLabel: getPhaseLabelPl('rest'),
    speedKmh: 0,
    strideFrequencyHz: 0,
    stridePhase: 0,
    heartRate: f.restHr,
    beatPhase: 0,
    strokeVolumeMl: 76,
    cardiacOutputLpm: Number(((f.restHr * 76) / 1000).toFixed(1)),
    respiratoryRate: 13,
    breathPhase: 0,
    ventilationLpm: 7.5,
    vo2Lpm: 0.28,
    vo2PctMax: 8,
    epocDebtL: 0,
    energyShares: { phosphagen: 6, glycolytic: 9, oxidative: 85 },
    atpTurnoverMultiplier: 1,
    pcrPct: 100,
    atpBufferPct: 100,
    lactateMmol: 0.9,
    lactateShuttleRate: 0.08,
    musclePh: 7.05,
    coreTempC: 37.0,
    sweatRateLph: 0.04,
    sympatheticDrive: 0.1,
    parasympatheticTone: 0.85,
    peripheralFatigue: 0,
    centralFatigue: 0,
    bloodFlowPct: { muscle: 20, heart: 4, brain: 14, skin: 8, visceral: 54 },
    signaling: {
      sympatheticCatecholamines: 'bazowy',
      muscleIL6Release: 'spoczynkowy',
      lactateSignaling: 'bazowy (MCT równowaga)',
      centralNeuromodulationNote:
        'Stan spoczynkowy. Brak bezpośredniego pomiaru stężeń neuroprzekaźników OUN z parametrów zewnętrznych.',
    },
  };
}

/**
 * Deterministycznie wylicza spójny stan organizmu dla trybu filmowego (odtwarzanie lub przewijanie osi czasu).
 */
export function evaluateCinematicOrganismState(
  masterTimeSec: number,
  actId: ActId,
  actProgress: number,
  config: HIITProtocolConfig = DEFAULT_HIIT_CONFIG
): OrganismState {
  const f = FITNESS_FACTORS[config.fitnessLevel];
  let phase: WorkoutPhaseId = 'warmup';
  let targetIntensity = 0.35; // 0..1 of peak
  let intervalAgeSec = 10;
  let cumulativeLoad = 0.2;

  if (actId === 1) {
    // Walk (0..0.35) -> Jog (0.35..0.72) -> Sprint onset (0.72..1.0)
    if (actProgress < 0.32) {
      phase = 'warmup';
      targetIntensity = 0.22 + (actProgress / 0.32) * 0.22;
      intervalAgeSec = 5;
    } else if (actProgress < 0.72) {
      phase = 'warmup';
      targetIntensity = 0.44 + ((actProgress - 0.32) / 0.40) * 0.24;
      intervalAgeSec = 25;
    } else {
      phase = 'hiit_peak';
      targetIntensity = 0.68 + ((actProgress - 0.72) / 0.28) * 0.24;
      intervalAgeSec = 12;
    }
    cumulativeLoad = 0.15 + actProgress * 0.35;
  } else if (actId === 2) {
    phase = 'hiit_peak';
    targetIntensity = 0.78 + actProgress * 0.12;
    intervalAgeSec = 10 + actProgress * 15;
    cumulativeLoad = 0.42;
  } else if (actId === 3) {
    phase = 'hiit_peak';
    targetIntensity = 0.86;
    intervalAgeSec = 24 + actProgress * 20;
    cumulativeLoad = 0.55;
  } else if (actId === 4) {
    phase = 'hiit_peak';
    targetIntensity = 0.90;
    intervalAgeSec = 30 + actProgress * 25;
    cumulativeLoad = 0.65;
  } else if (actId === 5) {
    phase = 'hiit_peak';
    // Sweep intervalAgeSec across 2s..85s to illustrate overlapping Phosphagen/Glycolytic/Oxidative curves
    targetIntensity = 0.92;
    intervalAgeSec = 3 + actProgress * 82;
    cumulativeLoad = 0.72;
  } else if (actId === 6) {
    // 0..0.58 intense HIIT limit -> 0.58..1.0 active recovery!
    if (actProgress < 0.58) {
      phase = 'hiit_repeat';
      targetIntensity = 0.94 + Math.sin(actProgress * Math.PI) * 0.06;
      intervalAgeSec = 42 + actProgress * 30;
      cumulativeLoad = 0.92;
    } else {
      phase = 'active_recovery';
      const recU = (actProgress - 0.58) / 0.42;
      targetIntensity = 0.94 - recU * 0.48;
      intervalAgeSec = 75;
      cumulativeLoad = 0.78 - recU * 0.25;
    }
  } else if (actId >= 7 && actId <= 10) {
    // Inside blood/brain/synapse: ongoing post-interval elevated metabolic signaling & steady state
    phase = actId === 7 ? 'hiit_repeat' : 'active_recovery';
    targetIntensity = actId === 7 ? 0.80 : 0.62 - (actId - 8) * 0.08;
    intervalAgeSec = 65;
    cumulativeLoad = 0.75 - (actId - 7) * 0.08;
  } else if (actId === 11) {
    phase = 'cooldown';
    targetIntensity = Math.max(0.08, 0.48 * (1.0 - actProgress * 0.88));
    intervalAgeSec = 90;
    cumulativeLoad = 0.45 * (1.0 - actProgress * 0.72);
  } else {
    phase = 'rest';
    targetIntensity = 0.14;
    intervalAgeSec = 100;
    cumulativeLoad = 0.10;
  }

  const intensityScale = config.intensityPctVO2max / 100;
  const effIntensity = Math.min(1.0, Math.max(0.05, targetIntensity * (0.45 + 0.55 * intensityScale)));

  // Speed & biomechanical stride cadence
  const speedKmh = phase === 'rest' ? 0 : Number((effIntensity * 18.8).toFixed(1));
  const strideFrequencyHz =
    speedKmh < 0.5 ? 0 : speedKmh < 6.5 ? 0.85 + speedKmh * 0.06 : 1.15 + speedKmh * 0.042;
  const stridePhase = (masterTimeSec * strideFrequencyHz) % 1;

  // Heart rate & hemodynamics
  const maxHr = 194;
  const heartRate = Math.round(f.restHr + (maxHr - f.restHr) * effIntensity);
  const beatPhase = (masterTimeSec * (heartRate / 60)) % 1;
  const strokeVolumeMl = Math.round(76 + (f.maxSvMl - 76) * Math.min(1, effIntensity * 1.25));
  const cardiacOutputLpm = Number(((heartRate * strokeVolumeMl) / 1000).toFixed(1));

  // Pulmonary ventilation & VO2
  const vo2PctMax = Math.round(10 + effIntensity * 88);
  const vo2Lpm = Number(((vo2PctMax / 100) * f.vo2MaxLpm).toFixed(2));
  const respiratoryRate = Math.round(13 + effIntensity * 34);
  const breathPhase = (masterTimeSec * (respiratoryRate / 60)) % 1;
  const ventilationLpm = Number((8 + Math.pow(effIntensity, 1.45) * 132).toFixed(1));
  const epocDebtL = Number((cumulativeLoad * 6.2).toFixed(2));

  // Overlapping Energy Systems (Baker et al. 2010: ~50/50 aerobic vs anaerobic around ~75s maximal work)
  const phosRaw = effIntensity > 0.25 ? effIntensity * 72 * Math.exp(-intervalAgeSec / 14) + 3 : 5;
  const glyRaw =
    effIntensity > 0.35
      ? effIntensity * 66 * (1 - Math.exp(-intervalAgeSec / 9)) * Math.exp(-intervalAgeSec / 130) + 8
      : 10;
  const oxRaw =
    18 + (1 - Math.exp(-intervalAgeSec / 38)) * 78 * (phase === 'active_recovery' || phase === 'cooldown' ? 1.45 : 1.0);
  const energyShares = normalizeEnergyShares(phosRaw, glyRaw, oxRaw);

  const atpTurnoverMultiplier = Math.round(1 + Math.pow(effIntensity, 2.2) * 920);
  const pcrPct = Math.round(
    Math.max(16, Math.min(100, 100 - effIntensity * 72 * (1 - Math.exp(-intervalAgeSec / 22)) * (phase === 'active_recovery' ? 0.55 : 1)))
  );
  // Muscle ATP strictly buffered against rigor (stays >= 83%)
  const atpBufferPct = Number((100 - effIntensity * cumulativeLoad * 14).toFixed(1));

  const lactateMmol = Number(
    Math.max(0.9, Math.min(14.5, 0.9 + Math.pow(effIntensity, 1.8) * cumulativeLoad * 12.8 / f.lactateClearance)).toFixed(1)
  );
  const lactateShuttleRate = Number(Math.min(1, lactateMmol / 11).toFixed(2));
  const musclePh = Number(Math.max(6.66, 7.06 - ((lactateMmol - 0.9) / 13.5) * 0.37).toFixed(2));

  const coreTempC = Number((37.0 + cumulativeLoad * 1.75).toFixed(2));
  const sweatRateLph = Number((0.05 + Math.max(0, coreTempC - 37.2) * 0.95).toFixed(2));

  const sympatheticDrive = Number(Math.min(0.98, 0.08 + effIntensity * 0.88).toFixed(2));
  const parasympatheticTone = Number(Math.max(0.05, 0.86 * (1 - effIntensity * 0.92)).toFixed(2));

  const peripheralFatigue = Number(Math.min(1, cumulativeLoad * (1 - pcrPct / 110) * 1.15).toFixed(2));
  const centralFatigue = Number(Math.min(1, cumulativeLoad * 0.68 * Math.max(0, coreTempC - 37.3)).toFixed(2));

  const bloodFlowPct = normalizeBloodFlow(
    20 + effIntensity * 62,
    4 + effIntensity * 1.5,
    14 - effIntensity * 9, // absolute brain perfusion stays remarkably stable (~750 mL/min), relative % drops as Q rises 4-5x
    8 + Math.max(0, coreTempC - 37.2) * 8,
    54 - effIntensity * 48
  );

  const signaling: SignalingQualitativeState = {
    sympatheticCatecholamines:
      sympatheticDrive > 0.72 ? 'silna mobilizacja' : sympatheticDrive > 0.35 ? 'umiarkowany wzrost' : phase === 'cooldown' ? 'wygaszanie' : 'bazowy',
    muscleIL6Release:
      cumulativeLoad > 0.65 ? 'szczytowy sygnał metaboliczny' : cumulativeLoad > 0.3 ? 'narastający skurczowy' : phase === 'cooldown' ? 'powysiłkowy spadek' : 'spoczynkowy',
    lactateSignaling:
      lactateMmol > 6.5 ? 'intensywny shuttle do serca i mózgu' : lactateMmol > 2.4 ? 'aktywny transfer międzykomórkowy' : phase === 'cooldown' ? 'utlenianie i glukoneogeneza' : 'bazowy (MCT równowaga)',
    centralNeuromodulationNote:
      'Model symuluje wyłącznie fizjologię krążeniowo-oddechową i metaboliczną; zmiany neuroprzekaźników i neurotrofin w OUN prezentowane są jakościowo z poziomem dowodów.',
  };

  return {
    workoutPhase: phase,
    workoutLabel: getPhaseLabelPl(phase),
    speedKmh,
    strideFrequencyHz,
    stridePhase,
    heartRate,
    beatPhase,
    strokeVolumeMl,
    cardiacOutputLpm,
    respiratoryRate,
    breathPhase,
    ventilationLpm,
    vo2Lpm,
    vo2PctMax,
    epocDebtL,
    energyShares,
    atpTurnoverMultiplier,
    pcrPct,
    atpBufferPct,
    lactateMmol,
    lactateShuttleRate,
    musclePh,
    coreTempC,
    sweatRateLph,
    sympatheticDrive,
    parasympatheticTone,
    peripheralFatigue,
    centralFatigue,
    bloodFlowPct,
    signaling,
  };
}

/**
 * Krokowa aktualizacja modelu fizjologicznego w trybie Interaktywnym (reaguje na suwaki i fazy HIIT).
 */
export function stepInteractiveOrganismState(
  prev: OrganismState,
  dt: number,
  config: HIITProtocolConfig,
  manualPhase: WorkoutPhaseId | 'auto',
  workoutElapsedSec: number
): OrganismState {
  const f = FITNESS_FACTORS[config.fitnessLevel];
  const cycleLen = config.intervalWorkSec + config.intervalRestSec;
  const warmupDur = 20;
  const totalWorkDur = warmupDur + config.intervalsCount * cycleLen;

  let activePhase: WorkoutPhaseId;
  let intervalAgeSec = 15;
  if (manualPhase !== 'auto') {
    activePhase = manualPhase;
    intervalAgeSec = activePhase === 'hiit_peak' ? 28 : activePhase === 'hiit_repeat' ? 60 : 20;
  } else {
    if (workoutElapsedSec < 4) {
      activePhase = 'rest';
    } else if (workoutElapsedSec < warmupDur) {
      activePhase = 'warmup';
      intervalAgeSec = workoutElapsedSec;
    } else if (workoutElapsedSec < totalWorkDur) {
      const inBlock = workoutElapsedSec - warmupDur;
      const cycleIdx = Math.floor(inBlock / cycleLen);
      const inCycle = inBlock % cycleLen;
      if (inCycle < config.intervalWorkSec) {
        activePhase = cycleIdx === 0 ? 'hiit_peak' : 'hiit_repeat';
        intervalAgeSec = inCycle;
      } else {
        activePhase = 'active_recovery';
        intervalAgeSec = inCycle - config.intervalWorkSec;
      }
    } else {
      activePhase = 'cooldown';
      intervalAgeSec = workoutElapsedSec - totalWorkDur;
    }
  }

  const maxTarget = config.intensityPctVO2max / 100;
  const targetEff =
    activePhase === 'rest'
      ? 0.04
      : activePhase === 'warmup'
        ? 0.36
        : activePhase === 'hiit_peak'
          ? maxTarget
          : activePhase === 'hiit_repeat'
            ? Math.min(1, maxTarget * 1.04)
            : activePhase === 'active_recovery'
              ? 0.32
              : 0.14;

  const rate = Math.min(1, dt * 1.6);
  const prevEff = Math.max(0.04, (prev.heartRate - f.restHr) / (194 - f.restHr));
  const eff = prevEff + (targetEff - prevEff) * rate;

  const speedKmh = activePhase === 'rest' ? 0 : Number((eff * 18.8).toFixed(1));
  const strideFrequencyHz =
    speedKmh < 0.5 ? 0 : speedKmh < 6.5 ? 0.85 + speedKmh * 0.06 : 1.15 + speedKmh * 0.042;
  const stridePhase = (prev.stridePhase + dt * strideFrequencyHz) % 1;

  const heartRate = Math.round(f.restHr + (194 - f.restHr) * eff);
  const beatPhase = (prev.beatPhase + dt * (heartRate / 60)) % 1;
  const strokeVolumeMl = Math.round(76 + (f.maxSvMl - 76) * Math.min(1, eff * 1.25));
  const cardiacOutputLpm = Number(((heartRate * strokeVolumeMl) / 1000).toFixed(1));

  const respiratoryRate = Math.round(13 + eff * 34);
  const breathPhase = (prev.breathPhase + dt * (respiratoryRate / 60)) % 1;
  const ventilationLpm = Number((8 + Math.pow(eff, 1.45) * 132).toFixed(1));
  const vo2PctMax = Math.round(10 + eff * 88);
  const vo2Lpm = Number(((vo2PctMax / 100) * f.vo2MaxLpm).toFixed(2));

  // PCr depletion vs recovery ODE
  const isHard = activePhase === 'hiit_peak' || activePhase === 'hiit_repeat';
  const targetPcr = isHard ? Math.max(16, 100 - eff * 78) : activePhase === 'active_recovery' ? 78 : 98;
  const pcrTau = isHard ? 0.18 : 0.25 * f.pcrRecoveryRate;
  const pcrPct = Math.round(prev.pcrPct + (targetPcr - prev.pcrPct) * Math.min(1, dt * pcrTau));

  // Lactate dynamics
  const targetLactate = isHard
    ? Math.min(14.5, 1.2 + Math.pow(eff, 1.9) * 13.0 / f.lactateClearance)
    : activePhase === 'active_recovery'
      ? 3.8
      : 1.1;
  const lacTau = isHard ? 0.12 : 0.08 * f.lactateClearance;
  const lactateMmol = Number((prev.lactateMmol + (targetLactate - prev.lactateMmol) * Math.min(1, dt * lacTau)).toFixed(1));

  // Core temperature slow drift
  const targetTemp = 37.0 + eff * 1.65;
  const coreTempC = Number((prev.coreTempC + (targetTemp - prev.coreTempC) * Math.min(1, dt * 0.06)).toFixed(2));

  const phosRaw = isHard ? eff * 72 * Math.exp(-intervalAgeSec / 15) + 4 : 6;
  const glyRaw = isHard ? eff * 66 * (1 - Math.exp(-intervalAgeSec / 8)) + 10 : 12;
  const oxRaw = 20 + (1 - Math.exp(-intervalAgeSec / 35)) * 75 * (isHard ? 1.0 : 1.5);
  const energyShares = normalizeEnergyShares(phosRaw, glyRaw, oxRaw);

  const epocDebtL = Number(
    Math.max(0, prev.epocDebtL + (isHard ? dt * 0.14 * eff : -dt * 0.06)).toFixed(2)
  );
  const peripheralFatigue = Number(Math.min(1, (100 - pcrPct) / 100 * 0.65 + (lactateMmol / 15) * 0.35).toFixed(2));
  const centralFatigue = Number(Math.min(1, Math.max(0, coreTempC - 37.1) * 0.45 + peripheralFatigue * 0.35).toFixed(2));
  const sympatheticDrive = Number(Math.min(0.98, 0.08 + eff * 0.88).toFixed(2));
  const parasympatheticTone = Number(Math.max(0.05, 0.86 * (1 - eff * 0.92)).toFixed(2));

  return {
    workoutPhase: activePhase,
    workoutLabel: getPhaseLabelPl(activePhase),
    speedKmh,
    strideFrequencyHz,
    stridePhase,
    heartRate,
    beatPhase,
    strokeVolumeMl,
    cardiacOutputLpm,
    respiratoryRate,
    breathPhase,
    ventilationLpm,
    vo2Lpm,
    vo2PctMax,
    epocDebtL,
    energyShares,
    atpTurnoverMultiplier: Math.round(1 + Math.pow(eff, 2.2) * 920),
    pcrPct,
    atpBufferPct: Number((100 - eff * peripheralFatigue * 14).toFixed(1)),
    lactateMmol,
    lactateShuttleRate: Number(Math.min(1, lactateMmol / 11).toFixed(2)),
    musclePh: Number(Math.max(6.66, 7.06 - ((lactateMmol - 0.9) / 13.5) * 0.37).toFixed(2)),
    coreTempC,
    sweatRateLph: Number((0.05 + Math.max(0, coreTempC - 37.2) * 0.95).toFixed(2)),
    sympatheticDrive,
    parasympatheticTone,
    peripheralFatigue,
    centralFatigue,
    bloodFlowPct: normalizeBloodFlow(
      20 + eff * 62,
      4 + eff * 1.5,
      14 - eff * 9,
      8 + Math.max(0, coreTempC - 37.2) * 8,
      54 - eff * 48
    ),
    signaling: {
      sympatheticCatecholamines:
        sympatheticDrive > 0.72 ? 'silna mobilizacja' : sympatheticDrive > 0.35 ? 'umiarkowany wzrost' : 'bazowy',
      muscleIL6Release:
        peripheralFatigue > 0.55 ? 'szczytowy sygnał metaboliczny' : eff > 0.3 ? 'narastający skurczowy' : 'spoczynkowy',
      lactateSignaling:
        lactateMmol > 6.5 ? 'intensywny shuttle do serca i mózgu' : lactateMmol > 2.4 ? 'aktywny transfer międzykomórkowy' : 'bazowy (MCT równowaga)',
      centralNeuromodulationNote:
        'Symulator edukacyjny: parametry fizjologiczne są sprzężone; neuroprzekaźniki mózgowe nie są wyliczane liczbowo z suwaka.',
    },
  };
}
