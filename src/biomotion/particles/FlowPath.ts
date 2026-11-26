import * as THREE from 'three';

/**
 * Tor przepływu jako tablica próbek (położenie, styczna) równo co długość łuku + profil czasu przejścia.
 *
 * PRĘDKOŚĆ Z PRZEKROJU: czas przejścia odcinka du jest proporcjonalny do pola przekroju A(u),
 * bo przy stałym przepływie objętościowym Q prędkość v = Q / A (ciągłość przepływu).
 * Uwaga dydaktyczna: A(u) to przekrój CAŁEGO łożyska na danym poziomie (np. suma wszystkich naczyń włosowatych),
 * a nie promień jednej rurki. Dlatego w naczyniach włosowatych krew płynie najwolniej, choć każde z nich jest wąskie.
 * Dla pojedynczego przewodu (jama serca, aorta) A(u) = π·r(u)² z geometrii.
 *
 * W pętli klatki nie liczy się krzywej: tylko interpolacja tablic (test M2: CPU 3,1 → 0,84 ms na 1500 krwinek).
 */
export interface FlowPathOptions {
  /** liczba próbek (domyślnie 512) */
  samples?: number;
  /** względne pole przekroju łożyska w punkcie u (0..1); domyślnie stałe = ta sama prędkość wszędzie */
  area?: (u: number) => number;
}

export class FlowPath {
  readonly samples: number;
  readonly length: number;
  private readonly pos: Float32Array;
  private readonly tan: Float32Array;
  /** travel[i]: znormalizowany czas dojścia do próbki i (0..1) */
  private readonly travel: Float32Array;
  /** uOfTravel[j]: u dla czasu j/(samples−1) (odwrotność travel) */
  private readonly uOfTravel: Float32Array;

  constructor(curve: THREE.Curve<THREE.Vector3>, opts: FlowPathOptions = {}) {
    const n = (this.samples = Math.max(16, opts.samples ?? 512));
    this.length = curve.getLength();
    this.pos = new Float32Array(n * 3);
    this.tan = new Float32Array(n * 3);
    const p = new THREE.Vector3(), t = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      curve.getPointAt(u, p);
      curve.getTangentAt(u, t).normalize();
      this.pos.set([p.x, p.y, p.z], i * 3);
      this.tan.set([t.x, t.y, t.z], i * 3);
    }
    // czas przejścia: całka z A(u) du (v ~ 1/A), znormalizowana do 1
    const area = opts.area ?? (() => 1);
    this.travel = new Float32Array(n);
    let acc = 0;
    for (let i = 1; i < n; i++) {
      const um = (i - 0.5) / (n - 1);
      acc += Math.max(1e-6, area(um)) / (n - 1);
      this.travel[i] = acc;
    }
    for (let i = 1; i < n; i++) this.travel[i] /= acc;
    this.uOfTravel = new Float32Array(n);
    let k = 0;
    for (let j = 0; j < n; j++) {
      const tau = j / (n - 1);
      while (k < n - 2 && this.travel[k + 1] < tau) k++;
      const a = this.travel[k], b = this.travel[k + 1];
      const f = b > a ? (tau - a) / (b - a) : 0;
      this.uOfTravel[j] = (k + Math.min(1, Math.max(0, f))) / (n - 1);
    }
  }

  /** Znormalizowany czas dojścia (0..1) do miejsca u. */
  travelAt(u: number): number {
    return this.lerp1(this.travel, u);
  }

  /** Miejsce u (0..1) dla znormalizowanego czasu tau (zawijane do 0..1). */
  uAtTravel(tau: number): number {
    const t = tau - Math.floor(tau);
    return this.lerp1(this.uOfTravel, t);
  }

  /** Położenie i styczna (jednostkowa) w miejscu u. */
  sample(u: number, outPos: THREE.Vector3, outTan: THREE.Vector3) {
    const n = this.samples;
    const f = Math.min(0.999999, Math.max(0, u)) * (n - 1);
    const i = f | 0, w = f - i, a = i * 3, b = a + 3;
    const P = this.pos, T = this.tan;
    outPos.set(P[a] + (P[b] - P[a]) * w, P[a + 1] + (P[b + 1] - P[a + 1]) * w, P[a + 2] + (P[b + 2] - P[a + 2]) * w);
    outTan.set(T[a] + (T[b] - T[a]) * w, T[a + 1] + (T[b + 1] - T[a + 1]) * w, T[a + 2] + (T[b + 2] - T[a + 2]) * w).normalize();
  }

  /** Względna prędkość w miejscu u (1 = średnia na całym torze). */
  relativeSpeedAt(u: number): number {
    const n = this.samples;
    const f = Math.min(0.999999, Math.max(0, u)) * (n - 1);
    const i = Math.min(n - 2, f | 0);
    const dTravel = this.travel[i + 1] - this.travel[i];
    return dTravel > 0 ? 1 / (dTravel * (n - 1)) : 1;
  }

  private lerp1(arr: Float32Array, x: number) {
    const n = this.samples;
    const f = Math.min(0.999999, Math.max(0, x)) * (n - 1);
    const i = f | 0, w = f - i;
    return arr[i] + (arr[i + 1] - arr[i]) * w;
  }
}
