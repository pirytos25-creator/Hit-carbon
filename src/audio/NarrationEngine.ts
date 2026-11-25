import { NARRATION_SEGMENTS } from '../science/NarrationScript';
import { NarrationRegister, NarrationSegment } from '../types/biogenesis';
import { performanceMonitor } from '../core/PerformanceMonitor';

interface ManifestEntry {
  id: string;
  actId: number;
  startSec: number;
  endSec: number;
  popularDisplayPl: string;
  academicDisplayPl: string;
  files: { popular: string; academic: string };
  durations: { popular: number; academic: number };
}

interface NarrationManifest {
  voices: Record<NarrationRegister, string>;
  segments: ManifestEntry[];
}

/**
 * Silnik polskiej narracji lektorskiej:
 * 1. Korzysta z wygenerowanych lokalnie nagrań neuronowych (pl-PL-MarekNeural / pl-PL-ZofiaNeural)
 *    z manifestu /audio/narration/manifest.json.
 * 2. W razie braku pliku / błędu dekodowania przełącza się płynnie na Web Speech API (pl-PL) + napisy.
 * 3. Utrzymuje pełną synchronizację z osią czasu, prędkością, pauzą, wyciszeniem i powtarzaniem segmentów.
 */
class NarrationEngineImpl {
  private manifest: NarrationManifest | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private activeSegmentId: string | null = null;
  private activeRegister: NarrationRegister = 'popular';
  private isSpeaking = false;
  private lastRepeatCounter = 0;
  private fallbackActive = false;

  public async loadManifest(): Promise<void> {
    try {
      const resp = await fetch('/audio/narration/manifest.json');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      this.manifest = (await resp.json()) as NarrationManifest;
      performanceMonitor.setNarrationManifestLoaded(true);
    } catch {
      this.manifest = null;
      performanceMonitor.setNarrationManifestLoaded(false);
    }
  }

  private ensureAudioEl(): HTMLAudioElement {
    if (!this.audioEl) {
      this.audioEl = new Audio();
      this.audioEl.preload = 'auto';
      this.audioEl.addEventListener('ended', () => {
        this.isSpeaking = false;
      });
      this.audioEl.addEventListener('error', () => {
        this.isSpeaking = false;
      });
    }
    return this.audioEl;
  }

  public stop() {
    if (this.audioEl) {
      this.audioEl.pause();
    }
    if (this.fallbackActive && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.fallbackActive = false;
    }
    this.isSpeaking = false;
  }

  private findSegmentAtTime(timeSec: number): NarrationSegment | null {
    return (
      NARRATION_SEGMENTS.find((s) => timeSec >= s.startSec && timeSec <= s.endSec) ?? null
    );
  }

  private playSegment(
    seg: NarrationSegment,
    register: NarrationRegister,
    volume: number,
    playbackSpeed: number,
    offsetWithinSegSec: number
  ) {
    this.stop();
    this.activeSegmentId = seg.id;
    this.activeRegister = register;

    const manifestEntry = this.manifest?.segments.find((m) => m.id === seg.id);
    const audioUrl = manifestEntry?.files?.[register];

    if (audioUrl) {
      const el = this.ensureAudioEl();
      el.src = audioUrl;
      el.volume = Math.max(0, Math.min(1, volume));
      el.playbackRate = Math.max(0.5, Math.min(2.0, playbackSpeed));
      const seekOffset = Math.max(0, offsetWithinSegSec);
      el.onloadedmetadata = () => {
        if (seekOffset > 0.3 && seekOffset < (el.duration || 30) - 0.5) {
          el.currentTime = seekOffset;
        }
      };
      this.isSpeaking = true;
      el.play().catch(() => {
        this.isSpeaking = false;
      });
      return;
    }

    // Fallback: Web Speech API pl-PL (gdyby plik audio nie był jeszcze gotowy)
    if ('speechSynthesis' in window) {
      const text = register === 'popular' ? seg.popularTtsPl : seg.academicTtsPl;
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'pl-PL';
      utt.volume = Math.max(0, Math.min(1, volume));
      utt.rate = Math.max(0.75, Math.min(1.5, playbackSpeed));
      utt.onend = () => {
        this.isSpeaking = false;
        this.fallbackActive = false;
      };
      this.fallbackActive = true;
      this.isSpeaking = true;
      window.speechSynthesis.speak(utt);
    }
  }

  public update(params: {
    started: boolean;
    isPlaying: boolean;
    masterTimeSec: number;
    playbackSpeed: number;
    register: NarrationRegister;
    enabled: boolean;
    volume: number;
    masterVolume: number;
    repeatTriggerCounter: number;
    onStatusChange: (speaking: boolean, subtitlePl: string, segmentId: string | null) => void;
  }) {
    const seg = this.findSegmentAtTime(params.masterTimeSec);
    const subtitle = seg
      ? params.register === 'popular'
        ? seg.popularDisplayPl
        : seg.academicDisplayPl
      : '';

    if (!params.started || !params.enabled) {
      if (this.isSpeaking) this.stop();
      params.onStatusChange(false, subtitle, seg?.id ?? null);
      return;
    }

    // At 4x fast-forward, preserve subtitles cleanly while pausing overlapping TTS voiceover
    if (params.playbackSpeed > 2.2) {
      if (this.isSpeaking) this.stop();
      params.onStatusChange(false, subtitle, seg?.id ?? null);
      return;
    }

    const effVol = params.volume * params.masterVolume;
    if (this.audioEl) {
      this.audioEl.volume = Math.max(0, Math.min(1, effVol));
      this.audioEl.playbackRate = Math.max(0.5, Math.min(2.0, params.playbackSpeed));
    }

    if (!params.isPlaying) {
      if (this.audioEl && !this.audioEl.paused) {
        this.audioEl.pause();
      }
      if (this.fallbackActive && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      params.onStatusChange(false, subtitle, seg?.id ?? null);
      return;
    } else if (this.audioEl && this.audioEl.paused && this.isSpeaking && this.activeSegmentId === seg?.id && this.activeRegister === params.register) {
      this.audioEl.play().catch(() => {});
    }

    const repeatRequested = params.repeatTriggerCounter !== this.lastRepeatCounter;
    if (repeatRequested) {
      this.lastRepeatCounter = params.repeatTriggerCounter;
    }

    if (seg) {
      const registerChanged = params.register !== this.activeRegister;
      const segmentChanged = seg.id !== this.activeSegmentId;
      if (segmentChanged || registerChanged || repeatRequested) {
        const offset = repeatRequested ? 0 : Math.max(0, params.masterTimeSec - seg.startSec);
        this.playSegment(seg, params.register, effVol, params.playbackSpeed, offset);
      }
    } else {
      if (this.activeSegmentId !== null) {
        this.stop();
        this.activeSegmentId = null;
      }
    }

    params.onStatusChange(this.isSpeaking, subtitle, seg?.id ?? null);
  }
}

export const narrationEngine = new NarrationEngineImpl();
