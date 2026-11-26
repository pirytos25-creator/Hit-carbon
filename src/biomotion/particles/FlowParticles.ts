import * as THREE from 'three';
import type { BioFrame } from '../frame';
import { FlowPath } from './FlowPath';

/**
 * Cząstki 3D (krwinki, krople) płynące po torze: instancje zorientowane wzdłuż toru, profil przyścienny
 * (szybciej przy osi), prędkość z przekroju łożyska (FlowPath), puls z fazy serca, zawirowanie i obrót.
 * Zachowanie 1:1 z filmowym InstancedErythrocytes przy stałym przekroju (bez regresji aktu 3),
 * a z profilem przekroju zamyka lukę „prędkość nie zależy od przekroju”.
 *
 * Deterministyczne przy przewinięciu: położenie wynika z fazy przepływu (frame.seeked → faza = czas · speedScale).
 */
export interface FlowParticlesOptions {
  path: FlowPath;
  count: number;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  /** postęp fazy przepływu na sekundę (jak speedScale w filmie); funkcja = liczona co klatkę (np. z rzutu serca) */
  speedScale: number | ((frame: BioFrame) => number);
  /** maks. odsunięcie od osi toru (promień rozrzutu) */
  radiusSpread: number;
  /** puls przepływu z fazy serca (domyślnie fala skurczowa jak w filmie) */
  pulse?: (beatPhase: number) => number;
  /** 0..1: ściskanie krwinek w wąskim naczyniu (kształt pocisku) */
  squeeze?: (u: number) => number;
  /** barwa w miejscu u (np. utlenowanie wzdłuż toru); bez niej barwa materiału */
  colorAt?: (u: number, out: THREE.Color) => void;
  /** wygaszanie krwinek tuż przy kamerze [od, do] w jednostkach sceny */
  nearFade?: [number, number];
  /** krwinka 0 jako „bohater” (kamera filmu za nią) */
  onHero?: (pos: THREE.Vector3, lookAt: THREE.Vector3, tangent: THREE.Vector3) => void;
}

export const filmSystolicPulse = (bp: number) => 0.72 + 0.68 * Math.exp(-Math.pow((bp - 0.28) * 4.5, 2));

const _d = new THREE.Object3D();
const _p = new THREE.Vector3(), _t = new THREE.Vector3(), _n = new THREE.Vector3(), _b = new THREE.Vector3(), _h = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _c = new THREE.Color();

export class FlowParticles {
  readonly mesh: THREE.InstancedMesh;
  phase = 0;
  private readonly seeds: Float32Array;
  private readonly t0Travel: Float32Array;

  constructor(private readonly o: FlowParticlesOptions) {
    this.mesh = new THREE.InstancedMesh(o.geometry, o.material, o.count);
    this.mesh.frustumCulled = false;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // rozkład deterministyczny jak w filmie: (t0, promień, kąt, obrót, rozmiar)
    this.seeds = new Float32Array(o.count * 5);
    this.t0Travel = new Float32Array(o.count);
    for (let i = 0; i < o.count; i++) {
      this.seeds[i * 5] = i / o.count;
      this.seeds[i * 5 + 1] = Math.sqrt(((i * 19 + 7) % 100) / 100);
      this.seeds[i * 5 + 2] = (i * 2.39996) % (Math.PI * 2);
      this.seeds[i * 5 + 3] = ((i * 31) % 628) * 0.01;
      this.seeds[i * 5 + 4] = 0.9 + ((i * 13) % 21) * 0.01;
      this.t0Travel[i] = o.path.travelAt(this.seeds[i * 5]);
    }
  }

  /** Przesuwa fazę przepływu o klatkę odbiorcy. */
  advance(frame: BioFrame) {
    const pulse = this.o.pulse ?? filmSystolicPulse;
    const k = typeof this.o.speedScale === 'function' ? this.o.speedScale(frame) : this.o.speedScale;
    if (frame.seeked) this.phase = frame.timeSec * k;
    else if (frame.dtSec > 0) this.phase += frame.dtSec * k * pulse(frame.beatPhase);
  }

  /** Zapisuje macierze (i barwy) instancji. `camera` do wygaszania przy kamerze. */
  write(camera?: THREE.Camera) {
    const { path, count, radiusSpread, squeeze, colorAt, nearFade = [0.28, 0.5], onHero } = this.o;
    const flowT = this.phase;
    const mesh = this.mesh;
    for (let i = 0; i < count; i++) {
      const radFrac = this.seeds[i * 5 + 1];
      const ang = this.seeds[i * 5 + 2];
      const tumble0 = this.seeds[i * 5 + 3];
      const size = this.seeds[i * 5 + 4];
      const laminar = 1.65 - 0.85 * radFrac * radFrac; // profil przyścienny (jak w filmie)
      const u = path.uAtTravel(this.t0Travel[i] + flowT * laminar);
      path.sample(u, _p, _t);

      const sq = squeeze ? squeeze(u) : 0;
      const localRad = radFrac * radiusSpread * (1 - sq * 0.72);
      _n.crossVectors(_t, _up);
      if (_n.lengthSq() < 1e-4) _n.set(1, 0, 0); else _n.normalize();
      _b.crossVectors(_t, _n).normalize();
      const swirl = ang + flowT * (1.8 + radFrac * 1.2);
      _d.position.copy(_p).addScaledVector(_n, Math.cos(swirl) * localRad).addScaledVector(_b, Math.sin(swirl) * localRad);
      _d.lookAt(_d.position.x + _t.x, _d.position.y + _t.y, _d.position.z + _t.z);
      const freeTumble = 1 - sq * 0.78;
      _d.rotateX((flowT * 10 + tumble0) * freeTumble + Math.PI * 0.5 * sq);
      _d.rotateZ(tumble0 * 1.7 * freeTumble);
      let vis = 1;
      if (camera) {
        const cd = _d.position.distanceTo(camera.position);
        const x = Math.min(1, Math.max(0, (cd - nearFade[0]) / (nearFade[1] - nearFade[0])));
        vis = x * x * (3 - 2 * x);
        if (vis <= 0.02) vis = 0.001;
      }
      const stretch = 1 + sq * 0.36, compress = 1 - sq * 0.24;
      _d.scale.set(size * compress * vis, size * stretch * vis, size * compress * vis);
      _d.updateMatrix();
      mesh.setMatrixAt(i, _d.matrix);
      if (colorAt) {
        colorAt(u, _c);
        mesh.setColorAt(i, _c);
      }
      if (i === 0 && onHero) {
        path.sample(path.uAtTravel(path.travelAt(u) + 0.035), _h, _n);
        onHero(_d.position, _h, _t);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }

  dispose() {
    this.mesh.dispose();
  }
}
