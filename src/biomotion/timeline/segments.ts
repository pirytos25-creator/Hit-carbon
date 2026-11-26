/**
 * Odcinki osi czasu: akty filmu, kroki filmu gabloty, przewodnik „Jeden interwał”.
 * Uogólnienie getActAtTime (src/core/TimelineEngine.ts) bez przydziałów pamięci co klatkę.
 */
export interface Segment<Id = string | number> {
  id: Id;
  startSec: number;
  durationSec: number;
}

export interface SegmentAt<S> {
  index: number;
  segment: S;
  /** postęp w odcinku 0..1 */
  progress: number;
  /** 0..1 w ostatnich `blendSec` sekundach odcinka (przejście do następnego) */
  transitionBlend: number;
}

/** Wynik jest zapisywany do `out` (bez nowych obiektów co klatkę). */
export function getSegmentAt<S extends Segment>(segments: readonly S[], timeSec: number, out: SegmentAt<S>, blendSec = 5): SegmentAt<S> {
  let i = 0;
  while (i < segments.length - 1 && timeSec >= segments[i].startSec + segments[i].durationSec) i++;
  const s = segments[i];
  const local = Math.min(s.durationSec, Math.max(0, timeSec - s.startSec));
  out.index = i;
  out.segment = s;
  out.progress = s.durationSec > 0 ? local / s.durationSec : 1;
  const remaining = s.durationSec - local;
  out.transitionBlend = i < segments.length - 1 && remaining < blendSec ? 1 - remaining / blendSec : 0;
  return out;
}

/** Kroki filmu gabloty: krok trwa co najmniej max(minSec; sekPerWord · słowa + extraSec) (tempo z karty Reżysera). */
export function stepDurationSec(caption: string, minSec = 4, secPerWord = 0.3, extraSec = 1.5): number {
  const words = caption.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(minSec, words * secPerWord + extraSec);
}
