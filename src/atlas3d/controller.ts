/**
 * Sterownik sceny 3D atlasu (bez Reacta): ujęcia, obrót poziomy z przyciąganiem, stan, strzałki, podpisy HTML.
 * Decyzja użytkownika (model §7): obrót tylko w poziomie + widoki kluczowe + gotowe zbliżenia; bez wolnej orbity,
 * bez suwaków warstw i bez wyboru dowolnej struktury. Podpisy: ta sama bramka faktów co plansza 2D (isShown, tier).
 */
import * as THREE from 'three';
import type { AtlasLabel, AtlasPlateContent, AtlasState } from '../atlas/types';
import { isShown, systemOfPlate, type AtlasLevel } from '../atlas/palette';
import { expandName } from '../atlas/AtlasPlate';
import {
  Rail, applyViews, attachLights, dirToAngles, disposeFiles, highlight, makeFlow, setUniform, shotFor, za,
  type AtlasData, type LoadedFile, type Flow3,
} from './engine';

export const FOV = 16;
const PENDING = 'opis czeka na sprawdzenie źródła';
export const KEY_VIEWS = [
  { az: 0, name: 'front', label: 'Przód' }, { az: 90, name: 'left', label: 'Bok lewy' },
  { az: 180, name: 'back', label: 'Tył' }, { az: 270, name: 'right', label: 'Bok prawy' },
] as const;
const angDiff = (a: number, b: number) => Math.abs(((((a - b) % 360) + 540) % 360) - 180);

export type Mode = { kind: 'main' } | { kind: 'detail'; view: string };

interface LabelItem { key: string; anchor: string; pos: THREE.Vector3; name: string; lat?: string; text: string; pending: boolean }

export class Controller {
  camera!: THREE.PerspectiveCamera;
  rail!: Rail;
  mode: Mode = { kind: 'main' };
  state: AtlasState = 'sprint';
  level: AtlasLevel = 'basic';
  reduced = false;
  private stateMix = 1;
  private visBox = new THREE.Box3();
  /** Liczba podpisów zbliżenia bez geometrii 3D (np. włókna i cząsteczki z kolażu 2D). */
  hiddenDetailLabels = 0;
  onLabelsChanged?: () => void;
  private flows: { mesh: THREE.Mesh; f: Flow3 }[] = [];
  private mainViews: Set<string>;
  private mainView: string;
  private detach?: () => void;
  private labelKey = '';
  private labels: LabelItem[] = [];
  private els = new Map<string, { d: HTMLElement; line: SVGPolylineElement; dot: SVGCircleElement }>();
  private time = 0;
  private stats = { frames: 0, t0: performance.now(), bytes: 0 };
  onKeyView?: (kv: string | null) => void;
  private lastKv: string | null = null;
  /** Wejście diegetyczne do gabloty (OrganDive): wjazd kamery, ciało gaśnie ditheringiem, na końcu onDone. */
  private dive: { organ: string; t: number; alpha0: Map<LoadedFile, Float32Array>; onDone: (organ: string) => void } | null = null;
  get diving() { return this.dive !== null; }

  constructor(
    readonly data: AtlasData, readonly files: LoadedFile[], readonly content: AtlasPlateContent,
    private host: HTMLElement, private svg: SVGSVGElement, private layer: HTMLElement, bytes: number,
  ) {
    const v = data.manifest.views;
    this.mainViews = new Set(Object.keys(v).filter((k) => v[k].frame === 'body' && !k.startsWith('detail')));
    this.mainView = ['front', 'side', 'body_front', 'back'].find((k) => this.mainViews.has(k)) ?? [...this.mainViews][0] ?? Object.keys(v)[0];
    this.stats.bytes = bytes;
  }

  get details(): { view: string; title: string }[] {
    const v = this.data.manifest.views;
    return Object.keys(v).filter((k) => k.startsWith('detail'))
      .map((k) => ({ view: k, title: (this.content.viewTitlesPl as Record<string, string | undefined>)[k] ?? 'Zbliżenie' }));
  }

  attach(camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
    this.camera = camera;
    camera.fov = FOV; camera.near = 0.01; camera.far = 120; camera.updateProjectionMatrix();
    const offLights = attachLights(camera, scene);
    for (const f of this.files) scene.add(f.root);
    this.flows = this.data.flows.map((f) => ({ mesh: makeFlow(f), f }));
    for (const { mesh } of this.flows) scene.add(mesh);
    this.rail = new Rail(camera, this.mainShot());
    this.applyMode();
    this.detach = () => {
      offLights();
      for (const f of this.files) scene.remove(f.root);
      for (const { mesh } of this.flows) { scene.remove(mesh); mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); }
    };
  }
  dispose() {
    this.detach?.();
    disposeFiles(this.files);
    // podpisy żyją w DOM komponentu: bez czyszczenia zostałyby po zmianie planszy (z nasłuchami do zwolnionych plików)
    this.layer.replaceChildren();
    this.svg.replaceChildren();
    this.els.clear();
    this.labelKey = '';
  }
  /** Karta bez stanów (np. rozrodczy): plansza nie ma renderu spoczynku. */
  get stateless(): boolean {
    return !!this.content.card || !!this.data.manifest.card || this.data.bindings.structures.every((b) => !b.look?.rest);
  }

  private aspect() { return Math.max(0.3, this.host.clientWidth / Math.max(1, this.host.clientHeight)); }
  /** Ujęcie główne: kadr planszy. Obszar 3D leży między paskami (CSS), więc model nie wchodzi pod przełączniki ani stopkę;
   *  to, co plansza 2D ucina (np. czaszka nad klatką oddechowego), ucina też krawędź obszaru 3D. */
  private mainShot() {
    const v = this.data.manifest.views[this.mainView];
    return shotFor(v.camera, v.resolution, FOV, this.aspect(), 1.04);
  }

  // ------------------------------------------------ polecenia
  setMode(m: Mode) {
    this.mode = m;
    this.applyMode();
    const dur = this.reduced ? 0 : 1.0; // „pchnięcie” do zbliżenia (Reżyser §4.3: 0,9–1,1 s)
    if (m.kind === 'main') { const ms = this.mainShot(); this.rail.go({ ...ms, dist: this.fitWidth(ms.az, ms.dist) }, dur); return; }
    const v = this.data.manifest.views[m.view];
    const s = shotFor(v.camera, v.resolution, FOV, this.aspect(), 1.05);
    // kadr planszy obejmował kolaż 2D (np. włókna i cząsteczki obok przekroju): w 3D kadrujemy samą geometrię
    if (!this.visBox.isEmpty()) {
      const c = this.visBox.getCenter(new THREE.Vector3()), size = this.visBox.getSize(new THREE.Vector3());
      const h = 2 * s.dist * Math.tan((FOV * Math.PI) / 360);
      if (c.distanceTo(s.target) > 0.25 * h) {
        s.target = c;
        s.dist = (Math.max(size.y, Math.max(size.x, size.z) / this.aspect()) * 1.3) / 2 / Math.tan((FOV * Math.PI) / 360);
      }
    }
    this.rail.go(s, dur);
  }
  keyView(az: number) {
    if (this.mode.kind !== 'main') { this.mode = { kind: 'main' }; this.applyMode(); }
    const s = this.mainShot();
    this.rail.go({ ...s, az, dist: this.fitWidth(az, s.dist) }, this.reduced ? 0 : 1.2);
  }
  rotate(step: number) {
    const az = Math.round(this.rail.cur.az / 90) * 90 + step;
    const base = this.mode.kind === 'main' ? this.mainShot().dist : this.rail.cur.dist;
    this.rail.go({ az, dist: this.mode.kind === 'main' ? this.fitWidth(az, base) : base }, this.reduced ? 0 : 1.2);
  }
  /** Kadr planszy powstał dla jednego kierunku (np. mózg z boku): w innym widoku kluczowym model bywa szerszy.
   *  Odsuń kamerę tak, by szerokość widocznego modelu zmieściła się w obszarze 3D (nigdy nie przybliżaj). */
  private fitWidth(az: number, dist: number) {
    if (this.visBox.isEmpty()) return dist;
    const size = this.visBox.getSize(new THREE.Vector3());
    const a = (az * Math.PI) / 180;
    const ext = Math.abs(Math.cos(a)) * size.x + Math.abs(Math.sin(a)) * size.z; // szerokość widziana z tego kierunku
    const need = (ext * 1.08) / 2 / Math.tan((FOV * Math.PI) / 360) / this.aspect();
    return ext < 1.2 ? Math.max(dist, need) : dist; // całe ciało (rozpiętość ramion) mieści się z zapasem w kadrze planszy
  }
  drag(dx: number) { this.rail.drag(-dx * 0.45); }
  snap() {
    const az = Math.round(this.rail.cur.az / 90) * 90;
    this.rail.go(this.mode.kind === 'main' ? { az, dist: this.fitWidth(az, this.mainShot().dist) } : { az }, this.reduced ? 0 : 0.6);
  }
  setState(s: AtlasState) { this.state = s; if (this.reduced) this.stateMix = s === 'sprint' ? 1 : 0; this.labelKey = ''; }
  setLevel(l: AtlasLevel) { this.level = l; this.labelKey = ''; }
  resize() { if (!this.rail.moving) this.setMode(this.mode); }

  private applyMode() {
    this.visBox = applyViews(this.files, this.mode.kind === 'main' ? this.mainViews : new Set([this.mode.view]));
    highlight(this.files, new Set());
    this.labelKey = '';
  }

  // ------------------------------------------------ podpisy
  private kvName(): (typeof KEY_VIEWS)[number] {
    const i = ((Math.round(this.rail.cur.az / 90) % 4) + 4) % 4;
    return KEY_VIEWS[i];
  }
  private buildLabels(): LabelItem[] {
    const extended = this.level === 'extended';
    const a3 = this.data.anchors.views;
    const vs = this.data.manifest.views;
    const kv = this.kvName();
    const pick = (l: AtlasLabel): THREE.Vector3 | null => {
      if (this.mode.kind === 'detail') {
        if (l.view !== this.mode.view || !a3[l.view]?.[l.anchor]) return null;
        const p = za(a3[l.view][l.anchor]);
        if (this.visBox.isEmpty() || this.visBox.clone().expandByScalar(0.01).containsPoint(p)) return p;
        hidden++; // kotwica poza geometrią 3D: ten element zbliżenia jest tylko na planszy 2D
        return null;
      }
      if (!this.mainViews.has(l.view) || !vs[l.view]) return null;
      const d = angDiff(dirToAngles(vs[l.view].camera.direction).az, kv.az);
      if (d >= 45 && !(d < 135 && (kv.name === 'left' || kv.name === 'right'))) return null; // tył nie dostaje podpisów przodu
      const own = d < 45;
      const p = a3[`k_${kv.name}`]?.[l.anchor] ?? a3[l.view]?.[l.anchor];
      if (!p) return null;
      // widok z boku dla podpisów z przodu/tyłu: tylko struktury po stronie ciała zwróconej do kamery
      // (Z-Anatomy: lewa strona ciała +X, kamera „Bok lewy” stoi po +X), inaczej kotwica byłaby zasłonięta ciałem
      if (!own && (kv.name === 'left' ? p[0] < -0.02 : p[0] > 0.02)) return null;
      return za(p);
    };
    const seen = new Set<string>();
    const out: LabelItem[] = [];
    let hidden = 0;
    for (const l of this.content.labels) {
      if (!extended && !(l.tier === undefined || l.tier === 'primary')) continue; // ten sam filtr co AtlasPlate
      if (seen.has(l.anchor)) continue;
      const pos = pick(l);
      if (!pos) continue;
      seen.add(l.anchor);
      const shown = isShown(l.roleStatus?.[this.state]); // bramka faktów: checked_agent / checked_human / anatomy
      out.push({
        key: `${l.view}/${l.anchor}`, anchor: l.anchor, pos, name: extended ? l.namePl : expandName(l.namePl),
        lat: extended ? l.nameLat : undefined, text: shown ? l.role[this.state] : extended ? PENDING : '', pending: !shown,
      });
    }
    if (hidden !== this.hiddenDetailLabels) { this.hiddenDetailLabels = hidden; this.onLabelsChanged?.(); }
    return out;
  }
  private rebuildLabelDom() {
    // przebudowa w trakcie obrotu nie może zgubić fokusu klawiatury ani zostawić podświetlenia
    const active = document.activeElement as HTMLElement | null;
    const focusedKey = active && this.layer.contains(active) ? active.dataset.key ?? null : null;
    highlight(this.files, new Set());
    this.layer.replaceChildren();
    this.svg.replaceChildren();
    this.els.clear();
    const color = systemOfPlate(this.content.id)?.light ?? '#e2e8f0';
    for (const it of this.labels) {
      const d = document.createElement('div');
      d.className = 'atlas3d-lbl';
      d.tabIndex = 0;
      d.dataset.key = it.key;
      d.setAttribute('role', 'note');
      const b = document.createElement('b');
      b.textContent = it.name;
      d.append(b);
      if (it.lat) { const i = document.createElement('i'); i.textContent = it.lat; d.append(i); }
      if (it.text) { const s = document.createElement('span'); s.textContent = it.text; s.style.color = it.pending ? '#94a3b8' : color; d.append(s); }
      const on = () => highlight(this.files, new Set(this.data.bindings.anchors?.[it.anchor] ?? []));
      const off = () => highlight(this.files, new Set());
      d.addEventListener('mouseenter', on); d.addEventListener('focus', on);
      d.addEventListener('mouseleave', off); d.addEventListener('blur', off);
      this.layer.append(d);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      line.setAttribute('stroke', color); line.setAttribute('fill', 'none'); line.setAttribute('stroke-width', '1');
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '4.5'); dot.setAttribute('fill', 'none'); dot.setAttribute('stroke', '#fff'); dot.setAttribute('stroke-width', '1.5');
      this.svg.append(line, dot);
      this.els.set(it.key, { d, line, dot });
    }
    if (focusedKey !== null) {
      const again = this.els.get(focusedKey)?.d;
      if (again) again.focus({ preventScroll: true });
      else this.host.closest<HTMLElement>('.atlas3d-root')?.focus({ preventScroll: true });
    }
  }
  private placeLabels(fade: number) {
    const W = this.host.clientWidth, H = this.host.clientHeight;
    this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    this.layer.style.opacity = this.svg.style.opacity = String(fade);
    this.layer.style.visibility = fade < 0.02 ? 'hidden' : 'visible'; // ukryte podpisy nie łapią fokusu
    if (fade < 0.02) return;
    const v = new THREE.Vector3();
    const proj = this.labels.map((it) => {
      v.copy(it.pos).project(this.camera);
      return { it, x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, ok: v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2 };
    });
    // obrys widocznego modelu na ekranie: kolumny podpisów stoją za nim (jak na planszy 2D), tekst nie leży na modelu
    let left = W, right = 0;
    const c = new THREE.Vector3();
    const bx = this.visBox;
    if (!bx.isEmpty()) {
      for (const xx of [bx.min.x, bx.max.x]) for (const yy of [bx.min.y, bx.max.y]) for (const zz of [bx.min.z, bx.max.z]) {
        c.set(xx, yy, zz).project(this.camera);
        const sx = (c.x * 0.5 + 0.5) * W;
        left = Math.min(left, sx); right = Math.max(right, sx);
      }
    }
    left = Math.max(0, left); right = Math.min(W, right);
    if (right <= left) { left = W * 0.4; right = W * 0.6; }
    const cx = (left + right) / 2;
    for (const side of [-1, 1]) {
      const col = proj.filter((p) => p.ok && (p.x < cx) === (side < 0)).sort((a, b) => a.y - b.y);
      let last = 8;
      // za obrysem; gdy brak miejsca (model szerszy niż ekran), kolumna przy krawędzi, a czytelność daje tło podpisu
      const colX = side < 0 ? Math.max(214, left - 18) : Math.min(W - 214, right + 18);
      // 1) z góry: podpis przy swojej kotwicy, bez nachodzenia; 2) od dołu: cała kolumna nad dolnym paskiem
      const placed = col.map((p) => {
        const e = this.els.get(p.it.key)!;
        const h = e.d.offsetHeight || 40;
        const y = Math.max(p.y - h / 2, last + 6);
        last = y + h;
        return { p, e, h, y };
      });
      let limit = H - 8;
      for (let i = placed.length - 1; i >= 0; i--) {
        placed[i].y = Math.max(8, Math.min(placed[i].y, limit - placed[i].h));
        limit = placed[i].y - 6;
      }
      for (const { p, e, y } of placed) {
        Object.assign(e.d.style, { display: 'block', top: `${y}px`, textAlign: side < 0 ? 'right' : 'left',
          left: side < 0 ? '' : `${colX + 8}px`, right: side < 0 ? `${W - colX + 8}px` : '' });
        e.line.setAttribute('points', `${colX},${y + 11} ${p.x},${p.y}`);
        e.dot.setAttribute('cx', String(p.x)); e.dot.setAttribute('cy', String(p.y));
        e.line.style.display = e.dot.style.display = '';
      }
    }
    for (const p of proj) if (!p.ok) { const e = this.els.get(p.it.key)!; e.d.style.display = 'none'; e.line.style.display = e.dot.style.display = 'none'; }
  }

  // ------------------------------------------------ gabloty narządów (M5)
  /** Narząd pod pikselem (kliknięcie): promień na siatki, ID struktury z wierzchołka. Na razie: serce. */
  organAt(x: number, y: number): string | null {
    const el = this.host;
    const ndc = new THREE.Vector2((x / el.clientWidth) * 2 - 1, -(y / el.clientHeight) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const meshes = this.files.flatMap((f) => f.meshes.filter((m) => m.visible).map((m) => ({ m, f })));
    const hits = ray.intersectObjects(meshes.map((x) => x.m), false);
    for (const h of hits) {
      const f = meshes.find((x) => x.m === h.object)?.f;
      const idAttr = (h.object as THREE.Mesh).geometry.getAttribute('_id');
      if (!f || !idAttr || !h.face) continue;
      const id = Math.round(idAttr.getX(h.face.a));
      if (f.state.getAlpha(id) < 0.5) continue; // struktury przygaszone (np. sylwetka) nie zasłaniają
      const meshId = f.ids[id - 1] ?? '';
      return meshId.startsWith('hra:VH_M_Heart.glb/') ? 'serce' : null;
    }
    return null;
  }

  /** Punkt narządu w scenie: środek jego siatek (z wierzchołków, raz). */
  private organCenter(organ: string): THREE.Vector3 | null {
    if (organ !== 'serce') return null;
    const box = new THREE.Box3(), v = new THREE.Vector3();
    for (const f of this.files) for (const m of f.meshes) {
      const idAttr = m.geometry.getAttribute('_id'), pos = m.geometry.getAttribute('position');
      if (!idAttr) continue;
      m.updateWorldMatrix(true, false);
      for (let i = 0; i < pos.count; i += 7) {
        const meshId = f.ids[Math.round(idAttr.getX(i)) - 1] ?? '';
        if (meshId.startsWith('hra:VH_M_Heart.glb/')) box.expandByPoint(v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld));
      }
    }
    return box.isEmpty() ? null : box.getCenter(new THREE.Vector3());
  }

  /**
   * OrganDive (BIOMOTION_ARCHITEKTURA §4): wjazd 1,2 s do narządu, reszta ciała gaśnie ditheringiem do 0
   * (bez półprzezroczystych nakładek; w kadrze końcowym ciało 0% krycia, warunek Dyrygenta ≤ 5%).
   * Serce w widoku krwionośnym to ten sam plik HuBMAP co w gablocie, więc nie ma podmiany modelu.
   */
  startDive(organ: string, onDone: (organ: string) => void) {
    const c = this.organCenter(organ);
    if (!c || this.dive) return false;
    const alpha0 = new Map<LoadedFile, Float32Array>();
    for (const f of this.files) alpha0.set(f, Float32Array.from({ length: f.ids.length + 1 }, (_, id) => f.state.getAlpha(id)));
    this.dive = { organ, t: 0, alpha0, onDone };
    this.rail.go({ az: 0, el: 0, target: c, dist: 0.62 }, this.reduced ? 0 : 1.2);
    return true;
  }

  /** Przywraca widok układu (pod nakładką gabloty, więc bez widocznego skoku). */
  endDive() {
    const d = this.dive;
    if (!d) return;
    for (const [f, a] of d.alpha0) { for (let id = 1; id < a.length; id++) f.state.setAlpha(id, a[id]); f.state.commit(); }
    this.dive = null;
    this.setMode(this.mode);
  }

  private stepDive(dt: number) {
    const d = this.dive;
    if (!d) return;
    d.t = Math.min(1, d.t + (this.reduced ? 1 : dt / 1.2));
    const e = d.t * d.t * (3 - 2 * d.t);
    for (const [f, a] of d.alpha0) {
      for (let id = 1; id < a.length; id++) {
        const heart = (f.ids[id - 1] ?? '').startsWith('hra:VH_M_Heart.glb/');
        f.state.setAlpha(id, heart ? a[id] : a[id] * (1 - e));
      }
      f.state.commit();
    }
    if (d.t >= 1 && !this.rail.moving) {
      const done = d.onDone, organ = d.organ;
      d.t = 2; // jednorazowo
      done(organ);
    }
  }

  // ------------------------------------------------ klatka
  frame(dt: number, gl: THREE.WebGLRenderer) {
    this.time += this.reduced ? 0 : dt;
    this.rail.update(dt);
    if (this.dive && this.dive.t <= 1) this.stepDive(dt);
    const target = this.state === 'sprint' ? 1 : 0;
    this.stateMix += Math.sign(target - this.stateMix) * Math.min(Math.abs(target - this.stateMix), dt / 0.9); // przenikanie 0,9 s
    setUniform(this.files, 'uState', this.stateMix);
    setUniform(this.files, 'uTime', this.time);
    const inMode = (f: Flow3) => this.mode.kind === 'main'
      ? f.frame === 'body' && (!f.views?.length || f.views.some((x) => this.mainViews.has(x)))
      : !!f.views?.includes(this.mode.view);
    for (const { mesh, f } of this.flows) {
      const on = inMode(f) && (!f.states?.length || f.states.includes(this.state));
      mesh.visible = on;
      const u = (mesh.material as THREE.ShaderMaterial).uniforms;
      u.uTime.value = this.time;
      u.uOn.value = 0.35 + 0.65 * this.stateMix;
      u.uSpeed.value = 0.35 + 0.65 * this.stateMix; // 2 stopnie jakościowe (ilustracja), nie liczba
    }
    const kv = this.kvName();
    const key = `${this.mode.kind === 'main' ? 'm' : this.mode.view}|${kv.name}|${this.state}|${this.level}`;
    if (key !== this.labelKey) { this.labels = this.buildLabels(); this.rebuildLabelDom(); this.labelKey = key; }
    const base = this.mode.kind === 'main' ? 0 : dirToAngles(this.data.manifest.views[this.mode.view].camera.direction).az;
    const off = angDiff(this.rail.cur.az, base + Math.round((this.rail.cur.az - base) / 90) * 90);
    this.placeLabels(this.rail.moving && this.mode.kind === 'detail' ? 0 : Math.max(0, 1 - off / 25));
    const kvNow = this.mode.kind === 'main' && off < 1 ? kv.name : null;
    if (kvNow !== this.lastKv) { this.lastKv = kvNow; this.onKeyView?.(kvNow); }
    // pomiar (do raportu K3): FPS, wywołania rysowania, trójkąty, pobrane bajty
    this.stats.frames++;
    const now = performance.now();
    if (now - this.stats.t0 >= 1000) {
      const fps = Math.round((this.stats.frames * 1000) / (now - this.stats.t0));
      (window as unknown as { __atlas3d: unknown }).__atlas3d = {
        fps, calls: gl.info.render.calls, tris: gl.info.render.triangles, bytes: this.stats.bytes, plate: this.content.id,
      };
      this.stats = { ...this.stats, frames: 0, t0: now };
    }
  }
}
