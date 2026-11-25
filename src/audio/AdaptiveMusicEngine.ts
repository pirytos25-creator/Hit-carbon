import { ActDefinition } from '../types/biogenesis';
import { getActAtTime } from '../core/TimelineEngine';

type MotifName = ActDefinition['musicMotif'];

interface MotifSpec {
  scaleSemitones: number[];
  rootMidi: number;
  baseTempoBpm: number;
  padFilterHz: number;
  pulseGain: number;
  padGain: number;
  bassGain: number;
  arpRateMul: number;
}

const MOTIFS: Record<MotifName, MotifSpec> = {
  awakening: {
    scaleSemitones: [0, 2, 7, 9, 12, 14], // C pentatonic / open atmospheric
    rootMidi: 48, // C3
    baseTempoBpm: 92,
    padFilterHz: 620,
    pulseGain: 0.14,
    padGain: 0.28,
    bassGain: 0.22,
    arpRateMul: 0.5,
  },
  mobilization: {
    scaleSemitones: [0, 3, 7, 10, 14, 15], // C minor / Dorian urgency
    rootMidi: 48,
    baseTempoBpm: 118,
    padFilterHz: 1100,
    pulseGain: 0.30,
    padGain: 0.22,
    bassGain: 0.32,
    arpRateMul: 1.0,
  },
  bloodstream: {
    scaleSemitones: [0, 4, 7, 11, 14, 19], // Warm Lydian/Maj7 pulse synced with HR
    rootMidi: 45, // A2
    baseTempoBpm: 132,
    padFilterHz: 950,
    pulseGain: 0.38,
    padGain: 0.26,
    bassGain: 0.36,
    arpRateMul: 1.0,
  },
  muscle_machinery: {
    scaleSemitones: [0, 5, 7, 10, 12, 17], // Driving rhythmic suspended fourths
    rootMidi: 43, // G2
    baseTempoBpm: 138,
    padFilterHz: 1350,
    pulseGain: 0.42,
    padGain: 0.20,
    bassGain: 0.38,
    arpRateMul: 2.0,
  },
  mitochondria: {
    scaleSemitones: [0, 2, 7, 11, 14, 18], // Ethereal Lydian shimmer (proton rotor)
    rootMidi: 50, // D3
    baseTempoBpm: 124,
    padFilterHz: 1650,
    pulseGain: 0.26,
    padGain: 0.32,
    bassGain: 0.24,
    arpRateMul: 2.0,
  },
  hiit_peak: {
    scaleSemitones: [0, 3, 5, 7, 10, 12], // Monumental high-drive HIIT climax
    rootMidi: 41, // F2
    baseTempoBpm: 160,
    padFilterHz: 2100,
    pulseGain: 0.54,
    padGain: 0.25,
    bassGain: 0.46,
    arpRateMul: 2.0,
  },
  brain: {
    scaleSemitones: [0, 2, 3, 7, 11, 14], // Mysterious spatial neural texture
    rootMidi: 52, // E3
    baseTempoBpm: 104,
    padFilterHz: 1200,
    pulseGain: 0.18,
    padGain: 0.34,
    bassGain: 0.20,
    arpRateMul: 1.0,
  },
  neuroplasticity: {
    scaleSemitones: [0, 4, 7, 9, 11, 14, 16], // Emotional wide major9 sense of discovery
    rootMidi: 48, // C3
    baseTempoBpm: 98,
    padFilterHz: 1800,
    pulseGain: 0.20,
    padGain: 0.40,
    bassGain: 0.26,
    arpRateMul: 1.5,
  },
  recovery: {
    scaleSemitones: [0, 2, 4, 7, 9, 12], // Warm calming return to equilibrium
    rootMidi: 46, // Bb2
    baseTempoBpm: 76,
    padFilterHz: 560,
    pulseGain: 0.08,
    padGain: 0.36,
    bassGain: 0.18,
    arpRateMul: 0.5,
  },
};

function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Autorski silnik muzyki filmowej (Web Audio API):
 * - 9 odrębnych motywów kompozytorskich dopasowanych do aktów
 * - Dynamiczna synchronizacja pulsu z tętnem (HR) oraz intensywnością HIIT
 * - Płynna modulacja filtra w trybie pauzy/eksploracji
 * - Automatyczne ściszanie (ducking -9 dB) podczas wypowiedzi lektora
 */
class AdaptiveMusicEngineImpl {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private duckGain: GainNode | null = null;
  private padFilter: BiquadFilterNode | null = null;
  private padOscs: OscillatorNode[] = [];
  private padGains: GainNode[] = [];
  private reverbNode: ConvolverNode | null = null;
  private stepTimer: number | null = null;
  private stepIndex = 0;
  private currentMotif: MotifName = 'awakening';
  private isUnlocked = false;

  // Dynamic parameters fed from SimulationCore
  private heartRate = 72;
  private actProgress = 0;
  private enabled = true;
  private pausedOrExplore = false;
  private ducking = false;
  private volume = 0.65;

  public unlock(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.setupGraph();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    this.isUnlocked = true;
    return this.ctx;
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public getIsUnlocked(): boolean {
    return this.isUnlocked && this.ctx?.state === 'running';
  }

  private setupGraph() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0;

    this.duckGain = ctx.createGain();
    this.duckGain.gain.value = 1.0;

    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.value = 800;
    this.padFilter.Q.value = 1.2;

    // Warm algorithmic stereo impulse response for cinematic space
    const irLen = Math.floor(ctx.sampleRate * 2.2);
    const irBuf = ctx.createBuffer(2, irLen, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = irBuf.getChannelData(ch);
      for (let i = 0; i < irLen; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2.4) * 0.35;
      }
    }
    this.reverbNode = ctx.createConvolver();
    this.reverbNode.buffer = irBuf;

    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.38;

    this.padFilter.connect(this.duckGain);
    this.padFilter.connect(this.reverbNode);
    this.reverbNode.connect(wetGain);
    wetGain.connect(this.duckGain);
    this.duckGain.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);

    // 3 warm detuned pad voices forming harmonic chord bed
    const types: OscillatorType[] = ['sine', 'triangle', 'sawtooth'];
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      osc.type = types[i];
      osc.frequency.value = midiToHz(48 + [0, 7, 12][i]);
      const g = ctx.createGain();
      g.gain.value = i === 2 ? 0.04 : 0.11;
      osc.connect(g);
      g.connect(this.padFilter);
      osc.start();
      this.padOscs.push(osc);
      this.padGains.push(g);
    }

    this.startSequencerLoop();
  }

  private startSequencerLoop() {
    if (this.stepTimer !== null) window.clearTimeout(this.stepTimer);
    const tick = () => {
      this.triggerStep();
      const spec = MOTIFS[this.currentMotif];
      const hrDriven = Math.max(66, Math.min(180, this.heartRate * 0.72 + spec.baseTempoBpm * 0.28));
      const stepMs = (60 / hrDriven / 2) * 1000 / Math.max(0.5, spec.arpRateMul * 0.65);
      this.stepTimer = window.setTimeout(tick, Math.max(110, Math.min(480, stepMs)));
    };
    this.stepTimer = window.setTimeout(tick, 180);
  }

  private triggerStep() {
    if (!this.ctx || !this.padFilter || !this.enabled || this.ctx.state !== 'running') return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const spec = MOTIFS[this.currentMotif];
    const step = this.stepIndex++ % 16;

    // 1. Update sustained harmonic chord pad & warm sub-bass voice on bar boundaries
    if (step === 0 || step === 8) {
      const chordOffsets = step === 0 ? [0, 7, 14] : [0, 5, 12];
      this.padOscs.forEach((osc, i) => {
        const semi = spec.scaleSemitones[chordOffsets[i] % spec.scaleSemitones.length];
        osc.frequency.setTargetAtTime(midiToHz(spec.rootMidi + semi), now, 0.9);
      });

      const bassRoot = spec.rootMidi - 12 + (step === 8 ? spec.scaleSemitones[2] : 0);
      const bassOsc = ctx.createOscillator();
      const bassG = ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(midiToHz(bassRoot), now);
      const bassAmp = spec.bassGain * (this.pausedOrExplore ? 0.14 : 0.28);
      bassG.gain.setValueAtTime(0.0001, now);
      bassG.gain.linearRampToValueAtTime(bassAmp, now + 0.06);
      bassG.gain.exponentialRampToValueAtTime(0.0001, now + 1.45);
      bassOsc.connect(bassG);
      bassG.connect(this.padFilter);
      bassOsc.start(now);
      bassOsc.stop(now + 1.5);
    }

    // 2. Rhythmic Pulse / Percussion (intensity-scaled)
    if (!this.pausedOrExplore && spec.pulseGain > 0.05) {
      const isDownbeat = step % 4 === 0;
      const isAccent = step === 0 || step === 6 || step === 10 || step === 12;
      if (isDownbeat || (isAccent && this.currentMotif !== 'awakening' && this.currentMotif !== 'recovery')) {
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(isDownbeat ? 108 : 165, now);
        kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.14);
        kickGain.gain.setValueAtTime(spec.pulseGain * (isDownbeat ? 0.45 : 0.22), now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        kickOsc.connect(kickGain);
        kickGain.connect(this.duckGain!);
        kickOsc.start(now);
        kickOsc.stop(now + 0.17);
      }
    }

    // 3. Melodic / Molecular Pluck Arpeggio + Neuroplasticity Shimmer Layer
    if (step % 2 === 0 || this.currentMotif === 'mitochondria' || this.currentMotif === 'neuroplasticity') {
      const degIdx = (step * 3 + Math.floor(step / 4)) % spec.scaleSemitones.length;
      const midi = spec.rootMidi + 12 + spec.scaleSemitones[degIdx];
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = this.currentMotif === 'muscle_machinery' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(midiToHz(midi), now);
      const climaxBoost =
        this.currentMotif === 'neuroplasticity' ? 1 + this.actProgress * 0.45 : 1;
      const amp = (this.pausedOrExplore ? 0.035 : 0.075) * (spec.padGain * 2.5) * climaxBoost;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(amp, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.56);
      osc.connect(g);
      g.connect(this.padFilter);
      osc.start(now);
      osc.stop(now + 0.58);

      if (
        (this.currentMotif === 'neuroplasticity' || this.currentMotif === 'mitochondria') &&
        step % 4 === 0 &&
        !this.pausedOrExplore
      ) {
        const harmOsc = ctx.createOscillator();
        const harmG = ctx.createGain();
        harmOsc.type = 'sine';
        harmOsc.frequency.setValueAtTime(midiToHz(midi + 19), now); // sparkling upper fifth above octave
        harmG.gain.setValueAtTime(0.0001, now);
        harmG.gain.linearRampToValueAtTime(amp * 0.32, now + 0.05);
        harmG.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
        harmOsc.connect(harmG);
        harmG.connect(this.padFilter);
        harmOsc.start(now);
        harmOsc.stop(now + 0.75);
      }
    }
  }

  public update(params: {
    masterTimeSec: number;
    heartRate: number;
    enabled: boolean;
    volume: number;
    masterVolume: number;
    isPlaying: boolean;
    isExploration: boolean;
    isNarratorSpeaking: boolean;
  }) {
    this.heartRate = params.heartRate;
    this.enabled = params.enabled;
    this.pausedOrExplore = !params.isPlaying || params.isExploration;
    this.ducking = params.isNarratorSpeaking;
    this.volume = params.volume * params.masterVolume;

    const { act, actProgress } = getActAtTime(params.masterTimeSec);
    this.actProgress = actProgress;
    if (act.musicMotif !== this.currentMotif) {
      this.currentMotif = act.musicMotif;
    }

    if (!this.ctx || !this.masterGain || !this.duckGain || !this.padFilter) return;
    const now = this.ctx.currentTime;
    const spec = MOTIFS[this.currentMotif];

    const targetMaster = this.enabled ? this.volume * (this.pausedOrExplore ? 0.65 : 1.0) : 0.0;
    this.masterGain.gain.setTargetAtTime(targetMaster, now, 0.25);

    // Smooth -9 dB ducking during narration
    const targetDuck = this.ducking ? 0.35 : 1.0;
    this.duckGain.gain.setTargetAtTime(targetDuck, now, 0.18);

    const dynamicFilter =
      this.currentMotif === 'neuroplasticity'
        ? spec.padFilterHz * (0.72 + actProgress * 0.58)
        : spec.padFilterHz;
    const targetCutoff = this.pausedOrExplore ? Math.min(580, dynamicFilter * 0.55) : dynamicFilter;
    this.padFilter.frequency.setTargetAtTime(targetCutoff, now, 0.45);
  }
}

export const adaptiveMusicEngine = new AdaptiveMusicEngineImpl();
