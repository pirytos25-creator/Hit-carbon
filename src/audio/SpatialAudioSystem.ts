import { ActId, OrganismState } from '../types/biogenesis';
import { adaptiveMusicEngine } from './AdaptiveMusicEngine';

/**
 * Przestrzenny i proceduralny system efektów dźwiękowych (Web Audio API):
 * - Kroki i szum taśmy bieżni zsynchronizowane z stridePhase i speedKmh (Akty I, VI, XI)
 * - Oddech zsynchronizowany z breathPhase
 * - Dwutonowe bicie serca (lub-dub) zsynchronizowane z beatPhase (Akty I, III, VI, XI)
 * - Szum przepływu krwi / sonifikacja molekularna (ATP rotor, mostki sarkomeru, impulsy nerwowe)
 * - Przejścia pomiędzy skalami biologicznymi
 */
class SpatialAudioSystemImpl {
  private sfxBus: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private breathGain: GainNode | null = null;
  private breathFilter: BiquadFilterNode | null = null;
  private treadmillGain: GainNode | null = null;

  private lastStrideHalf = -1;
  private lastBeatHalf = -1;
  private lastAct: ActId = 1;
  private lastMolTick = 0;

  private ensureInit() {
    const ctx = adaptiveMusicEngine.getContext();
    if (!ctx || this.sfxBus) return ctx;

    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0.72;
    this.sfxBus.connect(ctx.destination);

    // Reusable 2s white noise buffer for breath, treadmill friction & blood flow
    const len = ctx.sampleRate * 2;
    this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      ch[i] = Math.random() * 2 - 1;
    }

    // Continuous modulated breath airflow node
    const breathSrc = ctx.createBufferSource();
    breathSrc.buffer = this.noiseBuf;
    breathSrc.loop = true;
    this.breathFilter = ctx.createBiquadFilter();
    this.breathFilter.type = 'bandpass';
    this.breathFilter.frequency.value = 380;
    this.breathFilter.Q.value = 1.4;
    this.breathGain = ctx.createGain();
    this.breathGain.gain.value = 0;
    breathSrc.connect(this.breathFilter);
    this.breathFilter.connect(this.breathGain);
    this.breathGain.connect(this.sfxBus);
    breathSrc.start();

    // Continuous treadmill belt hum
    const tmSrc = ctx.createBufferSource();
    tmSrc.buffer = this.noiseBuf;
    tmSrc.loop = true;
    const tmFilt = ctx.createBiquadFilter();
    tmFilt.type = 'lowpass';
    tmFilt.frequency.value = 220;
    this.treadmillGain = ctx.createGain();
    this.treadmillGain.gain.value = 0;
    tmSrc.connect(tmFilt);
    tmFilt.connect(this.treadmillGain);
    this.treadmillGain.connect(this.sfxBus);
    tmSrc.start();

    return ctx;
  }

  private playLubDub(ctx: AudioContext, isLub: boolean, gainScale: number) {
    if (!this.sfxBus) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isLub ? 64 : 82, now);
    osc.frequency.exponentialRampToValueAtTime(isLub ? 32 : 44, now + 0.09);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime((isLub ? 0.28 : 0.21) * gainScale, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  private playFootstep(ctx: AudioContext, speedKmh: number) {
    if (!this.sfxBus || !this.noiseBuf) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 260 + speedKmh * 16;
    const g = ctx.createGain();
    const amp = Math.min(0.24, 0.06 + speedKmh * 0.01);
    g.gain.setValueAtTime(amp, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
    src.connect(filt);
    filt.connect(g);
    g.connect(this.sfxBus);
    src.start(now);
    src.stop(now + 0.08);
  }

  public playScaleTransitionSweep() {
    const ctx = this.ensureInit();
    if (!ctx || !this.sfxBus || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.35);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.75);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.11, now + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.78);
    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start(now);
    osc.stop(now + 0.8);
  }

  public playUiInteractionPing(freq = 660) {
    const ctx = this.ensureInit();
    if (!ctx || !this.sfxBus || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(0.04, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc.connect(g);
    g.connect(this.sfxBus);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public update(params: {
    actId: ActId;
    organism: OrganismState;
    isPlaying: boolean;
    sfxVolume: number;
    masterVolume: number;
    timeSec: number;
  }) {
    const ctx = this.ensureInit();
    if (!ctx || !this.sfxBus || ctx.state !== 'running') return;

    const now = ctx.currentTime;
    const vol = params.isPlaying ? params.sfxVolume * params.masterVolume : 0;
    this.sfxBus.gain.setTargetAtTime(vol, now, 0.08);

    if (params.actId !== this.lastAct) {
      this.lastAct = params.actId;
      this.playScaleTransitionSweep();
    }

    if (!params.isPlaying) return;

    const org = params.organism;
    const isGymAct = params.actId === 1 || params.actId === 6 || params.actId === 11;
    const isHeartAct = params.actId === 1 || params.actId === 3 || params.actId === 6 || params.actId === 11;

    // 1. Treadmill & footsteps
    if (this.treadmillGain) {
      const tmAmp = isGymAct && org.speedKmh > 0.3 ? Math.min(0.11, org.speedKmh * 0.0055) : 0;
      this.treadmillGain.gain.setTargetAtTime(tmAmp, now, 0.15);
    }
    const strideHalf = org.stridePhase < 0.5 ? 0 : 1;
    if (isGymAct && org.speedKmh > 0.4 && strideHalf !== this.lastStrideHalf) {
      this.lastStrideHalf = strideHalf;
      this.playFootstep(ctx, org.speedKmh);
    }

    // 2. Breath airflow envelope synced to breathPhase
    if (this.breathGain && this.breathFilter) {
      const breathWave = Math.abs(Math.sin(org.breathPhase * Math.PI * 2));
      const breathAmp =
        (isGymAct || params.actId === 3 ? 0.05 : 0.012) *
        breathWave *
        Math.min(1.6, org.ventilationLpm / 55);
      this.breathGain.gain.setTargetAtTime(breathAmp, now, 0.06);
      this.breathFilter.frequency.setTargetAtTime(280 + breathWave * 420, now, 0.06);
    }

    // 3. Dual-valve heartbeat lub-dub synced to beatPhase
    const beatHalf = org.beatPhase < 0.28 ? 0 : org.beatPhase < 0.6 ? 1 : 2;
    if (isHeartAct && beatHalf !== this.lastBeatHalf) {
      this.lastBeatHalf = beatHalf;
      if (beatHalf === 0) this.playLubDub(ctx, true, params.actId === 3 ? 1.1 : 0.65);
      if (beatHalf === 1) this.playLubDub(ctx, false, params.actId === 3 ? 1.0 : 0.55);
    }

    // 4. Artistic molecular / neural sonification chimes (Acts II, IV, V, VIII, IX, X)
    if (params.timeSec - this.lastMolTick > 0.65) {
      this.lastMolTick = params.timeSec;
      if (params.actId === 2 || params.actId === 8 || params.actId === 9 || params.actId === 10) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(params.actId === 9 ? 980 : 740, now);
        g.gain.setValueAtTime(0.018, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
        osc.connect(g);
        g.connect(this.sfxBus);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (params.actId === 5) {
        // Subtle rotary harmonic hum representing proton flux (explicitly artistic sonification)
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320 + org.atpTurnoverMultiplier * 0.25, now);
        g.gain.setValueAtTime(0.015, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
        osc.connect(g);
        g.connect(this.sfxBus);
        osc.start(now);
        osc.stop(now + 0.30);
      }
    }
  }
}

export const spatialAudioSystem = new SpatialAudioSystemImpl();
