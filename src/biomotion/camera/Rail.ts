import * as THREE from 'three';

/**
 * Kamera „ujęć kluczowych” (atlas 3D E3, gabloty): azymut, elewacja, cel, odległość; przejścia z wygładzeniem,
 * najkrótsza droga po azymucie, przeciąganie w poziomie. Przeniesione 1:1 z src/atlas3d/engine.ts (M4).
 */
export interface Shot { az: number; el: number; target: THREE.Vector3; dist: number }

export class Rail {
  cur: Shot;
  private anim: { from: Shot; to: Shot; t: number; dur: number } | null = null;
  constructor(private camera: THREE.PerspectiveCamera, s: Shot) { this.cur = { ...s, target: s.target.clone() }; this.apply(); }
  get moving() { return this.anim !== null; }
  apply() {
    const { az, el, target, dist } = this.cur;
    const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180;
    this.camera.position.set(target.x + Math.sin(a) * Math.cos(e) * dist, target.y + Math.sin(e) * dist, target.z + Math.cos(a) * Math.cos(e) * dist);
    this.camera.lookAt(target);
  }
  go(s: Partial<Shot>, dur: number) {
    const from = { ...this.cur, target: this.cur.target.clone() };
    const to: Shot = { ...from, ...s, target: (s.target ?? from.target).clone() };
    to.az = from.az + ((((to.az - from.az) % 360) + 540) % 360) - 180; // najkrótsza droga
    if (dur <= 0.01) { this.cur = to; this.anim = null; this.apply(); return; }
    this.anim = { from, to, t: 0, dur };
  }
  drag(dAz: number) { this.anim = null; this.cur.az += dAz; this.apply(); }
  update(dt: number) {
    const a = this.anim;
    if (!a) return;
    a.t = Math.min(1, a.t + dt / a.dur);
    const e = a.t < 0.5 ? 4 * a.t ** 3 : 1 - (-2 * a.t + 2) ** 3 / 2;
    this.cur = {
      az: a.from.az + (a.to.az - a.from.az) * e, el: a.from.el + (a.to.el - a.from.el) * e,
      dist: a.from.dist + (a.to.dist - a.from.dist) * e, target: a.from.target.clone().lerp(a.to.target, e),
    };
    if (a.t >= 1) this.anim = null;
    this.apply();
  }
}
