/**
 * Scena gabloty serca (M5): prawdziwe serce HuBMAP (CC BY 4.0) na wspólnym module src/biomotion.
 * Przekrój czołowy z zalaniem (stencil), wybór przez GPU (ID części w wierzchołku), krwinki 3D czekające
 * przy zamkniętych zastawkach, skurcz i zastawki (kształty z geometrii, „ruch poglądowy”), impuls jako fala
 * w ścianach od węzła zatokowo-przedsionkowego (węzły = schemat-bryła), kamera z obrotem, pochyleniem ±35° i zoomem.
 * Moduł nie zna treści: teksty i liczby podaje OrganView z danych (organPanel, fakty planszy).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {
  BioClock, createBioFrame, FlowParticles, FlowPath, createErythrocyteGeometry, heartCycle, createHeartWeights,
  PRESET_FILM_ACT3, Rail, tierParams, type BioFrame, type HeartCycleWindows,
} from '../biomotion';
import { PALETTE } from '../atlas/palette';
import { HEART_PARTS, PART_INDEX, LEFT_PARTS, partOfNode, type HeartPart } from './heartParts';

const TOK = { artery: '#D93240', arteryLight: '#F07A84', vein: '#3E6FD8', veinLight: '#86A6EE' };
const MYO = '#992E38'; // ściana: artery + #4a2a2e 55/45 (karta Reżysera, klatka M1)
const CUT = '#B44E56'; // przekrój: artery + #8e6a6c
const VALVE = '#BAB4AA'; // context.bone −35% liniowo (Reżyser); kontrast 2,45:1 do przekroju
const SCHEMA = '#F07A84'; // materiał schematu: jednolity `light` układu krwionośnego
void PALETTE;

/** Okna cyklu gabloty: jak w filmie (akt 3), żeby gablota i film pokazywały ten sam cykl. */
const WINDOWS: HeartCycleWindows = PRESET_FILM_ACT3;

export interface OrganFlags {
  /** krok 1+: krwinki płyną */
  flow: boolean;
  /** krwinki widoczne, ale zatrzymane (krok 4: limit 3 ruchów) */
  flowFrozen: boolean;
  /** krok 2+: zastawki otwierają się i zamykają */
  valves: boolean;
  /** krok 3+: skurcz ścian („ruch poglądowy”) */
  contraction: boolean;
  /** krok 4: impuls z węzła SA */
  impulse: boolean;
  /** przekrój czołowy */
  cut: boolean;
  /** ściany w barwie mięśnia (domyślnie) albo w barwie krwi */
  wallsTissue: boolean;
}

export interface OrganShot { az: number; el: number; dist: number; target: [number, number, number] }

const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function attrToFloat(attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute) {
  const n = attr.count, s = attr.itemSize, out = new Float32Array(n * s);
  for (let i = 0; i < n; i++) for (let k = 0; k < s; k++) out[i * s + k] = attr.getComponent(i, k);
  return out;
}

interface PathJson { p: [number, number, number]; r: number; seg: 'in' | 'out' | 'valve_av' | 'valve_sl' }
interface PathsFile { valves: Record<string, { c: [number, number, number]; R: number }>; axis: { base: [number, number, number]; apex: [number, number, number] }; paths: Record<string, PathJson[]> }

const MORPH_SLOT: Record<string, number> = { Atrial_Systole: 0, Ventricular_Systole: 1, Valve_Open: 0 };

export class OrganScene {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(16, 1, 0.01, 10);
  readonly rail: Rail;
  readonly frame: BioFrame = createBioFrame();
  readonly clock = new BioClock();
  flags: OrganFlags = { flow: true, flowFrozen: false, valves: true, contraction: true, impulse: false, cut: true, wallsTissue: true };
  /** tętno (1/min) z faktów sprawdzonych (OrganView); bez faktu tempo poglądowe */
  heartRate = 60;
  /** gęstość krwinek względna (sprint: ∝ objętość wyrzutowa) */
  density = 1;
  paused = false;
  reducedMotion = false;
  selected: HeartPart | null = null;
  hovered: HeartPart | null = null;
  onFrame?: () => void;

  private plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), -0.004);
  private tissueMats: THREE.MeshStandardMaterial[] = [];
  private uniforms = {
    uSel: { value: 0 }, uHover: { value: 0 }, uImpulse: { value: 0 }, uImpT: { value: 0 },
    uSA: { value: new THREE.Vector3() }, uAV: { value: new THREE.Vector3() }, uLight: { value: new THREE.Color(TOK.arteryLight) },
  };
  private groups: { L?: THREE.Mesh; R?: THREE.Mesh; AV?: THREE.Mesh; SL?: THREE.Mesh; V?: THREE.Mesh } = {};
  private caps: THREE.Object3D[] = [];
  private flows: { p: FlowParticles; left: boolean; base: number }[] = [];
  private schematic = new THREE.Group();
  private pickScene = new THREE.Scene();
  private pickTarget = new THREE.WebGLRenderTarget(1, 1);
  private raf = 0;
  private last = 0;
  private time = 0;
  private weights = createHeartWeights();
  private gateAV = 1;
  private gateSL = 1;
  shots: Record<string, OrganShot> = {};
  saPoint = new THREE.Vector3();
  avPoint = new THREE.Vector3();

  constructor(private host: HTMLElement) {
    const t = tierParams('Low');
    this.renderer = new THREE.WebGLRenderer({ antialias: t.msaa, alpha: true, stencil: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(1);
    this.renderer.localClippingEnabled = true;
    this.renderer.toneMapping = THREE.NoToneMapping; // profil `atlas` (zgodność barw z planszami)
    host.appendChild(this.renderer.domElement);
    this.scene.add(new THREE.HemisphereLight('#dfe8ff', '#1a2238', 0.7));
    const key = new THREE.DirectionalLight('#fff4e8', 2.6); key.position.set(-0.6, 0.8, 1.0); this.scene.add(key);
    const fill = new THREE.DirectionalLight('#dde6ff', 0.9); fill.position.set(0.9, 0.1, 0.6); this.scene.add(fill);
    const rim = new THREE.DirectionalLight('#cfe0ff', 1.6); rim.position.set(0.2, 0.7, -1.0); this.scene.add(rim);
    this.rail = new Rail(this.camera, { az: 0, el: 4, dist: 0.62, target: new THREE.Vector3(0.004, 0.004, 0) });
    this.resize();
  }

  // ------------------------------------------------------------------ wczytanie
  async load(base: string) {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const [gltf, pj] = await Promise.all([
      loader.loadAsync(`${base}serce.glb`),
      fetch(`${base}paths.json`).then((r) => { if (!r.ok) throw new Error(`brak ${base}paths.json`); return r.json() as Promise<PathsFile>; }),
    ]);
    gltf.scene.updateMatrixWorld(true);
    const nodes: THREE.Mesh[] = [];
    gltf.scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) nodes.push(o as THREE.Mesh); });
    const nameOf = (m: THREE.Mesh) => (m.name || m.parent?.name || '').replace(/^VH_M_/, '');
    const leftPap = (n: string) => n.includes('anterolateral') || n.includes('posteromedial');
    const pick = (fn: (n: string, part: HeartPart | null) => boolean) => nodes.filter((m) => fn(nameOf(m), partOfNode(nameOf(m))));
    const isLeft = (n: string, p: HeartPart | null) => (p !== null && LEFT_PARTS.has(p) && !p.endsWith('_valve')) || (p === 'papillary_muscles' && leftPap(n));
    const isRight = (n: string, p: HeartPart | null) => p === 'right_atrium' || p === 'right_ventricle' || (p === 'papillary_muscles' && !leftPap(n));
    const L = pick(isLeft), R = pick(isRight);
    const AV = pick((_, p) => p === 'mitral_valve' || p === 'tricuspid_valve');
    const SL = pick((_, p) => p === 'aortic_valve' || p === 'pulmonary_valve');
    const V = pick((n, p) => !isLeft(n, p) && !isRight(n, p) && p !== 'mitral_valve' && p !== 'tricuspid_valve' && p !== 'aortic_valve' && p !== 'pulmonary_valve');

    const wall = (side: 'L' | 'R') => () => (this.flags.wallsTissue ? MYO : side === 'L' ? TOK.artery : TOK.vein);
    this.groups.L = this.addGroup(L, 2, wall('L'), false);
    this.groups.R = this.addGroup(R, 2, wall('R'), false);
    this.groups.AV = this.addGroup(AV, 1, () => VALVE, true);
    this.groups.SL = this.addGroup(SL, 1, () => VALVE, true);
    this.groups.V = this.addGroup(V, 0, (n) => this.vesselColor(n), true);
    if (this.groups.L && this.groups.R) {
      for (const o of [...this.capGroup(this.groups.L, 1), ...this.capGroup(this.groups.R, 2)]) { this.scene.add(o); this.caps.push(o); }
    }
    this.buildSchematic(pj, nodes.find((m) => nameOf(m) === 'right_cardiac_atrium'), nodes.find((m) => nameOf(m) === 'interventricular_septum'));
    this.buildFlows(pj);
    this.buildShots(pj);
    this.applyFlags();
  }

  private vesselColor(n: string) {
    const p = partOfNode(n);
    if (p === 'pulmonary_veins') return TOK.artery;
    if (p === 'pulmonary_trunk' || p === 'venae_cavae' || p === 'cardiac_veins') return TOK.vein;
    return TOK.artery;
  }

  /** Scalenie części w jedną siatkę z atrybutami: kolor (token × AO), partId, kształty ruchu. */
  private addGroup(parts: THREE.Mesh[], nMorph: number, colorOf: (node: string) => string, doubleSide: boolean) {
    if (!parts.length) return undefined;
    let nv = 0, ni = 0;
    for (const p of parts) { nv += p.geometry.attributes.position.count; ni += p.geometry.index!.count; }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), pid = new Float32Array(nv), idx = new Uint32Array(ni);
    const aoOut = new Float32Array(nv);
    const morphs = Array.from({ length: nMorph }, () => new Float32Array(nv * 3));
    const v = new THREE.Vector3(), nm = new THREE.Matrix3(), lin = new THREE.Matrix3();
    let vo = 0, io = 0;
    for (const p of parts) {
      const M = p.matrixWorld; nm.getNormalMatrix(M); lin.setFromMatrix4(M);
      const g = p.geometry, P = attrToFloat(g.attributes.position), N = attrToFloat(g.attributes.normal);
      const aoAttr = g.attributes.color, ao = aoAttr ? attrToFloat(aoAttr) : null, aoS = aoAttr ? aoAttr.itemSize : 0;
      const name = (p.name || p.parent?.name || '').replace(/^VH_M_/, '');
      const c = new THREE.Color(colorOf(name));
      const part = partOfNode(name);
      const id = part ? PART_INDEX[part] : 0;
      const n = g.attributes.position.count;
      for (let i = 0; i < n; i++) {
        v.set(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]).applyMatrix4(M); pos.set([v.x, v.y, v.z], (vo + i) * 3);
        v.set(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]).applyMatrix3(nm).normalize(); nor.set([v.x, v.y, v.z], (vo + i) * 3);
        const a = ao ? 0.35 + 0.65 * ao[i * aoS] : 1;
        aoOut[vo + i] = a;
        col.set([c.r * a, c.g * a, c.b * a], (vo + i) * 3);
        pid[vo + i] = id;
      }
      const names: string[] = (p.userData.targetNames ?? p.parent?.userData?.targetNames ?? []) as string[];
      (g.morphAttributes.position ?? []).forEach((ma, k) => {
        const slot = MORPH_SLOT[names[k]] ?? k;
        if (slot >= nMorph) return;
        const D = attrToFloat(ma);
        for (let i = 0; i < n; i++) { v.set(D[i * 3], D[i * 3 + 1], D[i * 3 + 2]).applyMatrix3(lin); morphs[slot].set([v.x, v.y, v.z], (vo + i) * 3); }
      });
      const I = g.index!.array;
      for (let i = 0; i < I.length; i++) idx[io + i] = I[i] + vo;
      vo += n; io += I.length;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('partId', new THREE.BufferAttribute(pid, 1));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    if (nMorph) { geo.morphAttributes.position = morphs.map((m) => new THREE.BufferAttribute(m, 3)); geo.morphTargetsRelative = true; }
    geo.computeBoundingSphere();
    geo.userData.ao = aoOut;
    const mesh = new THREE.Mesh(geo, this.tissueMaterial(doubleSide));
    mesh.renderOrder = 6;
    this.scene.add(mesh);
    // siatka do wyboru: ta sama geometria (z kształtami ruchu), materiał zapisuje ID części
    const pm = new THREE.Mesh(geo, this.pickMaterial(doubleSide));
    pm.morphTargetInfluences = mesh.morphTargetInfluences;
    this.pickScene.add(pm);
    return mesh;
  }

  /** Materiał tkanki: mat, AO z wierzchołków, wyróżnienie wybranej części (reszta 35%), fala impulsu. */
  private tissueMaterial(doubleSide: boolean) {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0, side: doubleSide ? THREE.DoubleSide : THREE.FrontSide, clippingPlanes: [this.plane] });
    const u = this.uniforms;
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, u);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float partId;\nvarying float vPart;\nvarying vec3 vObj;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPart = partId;\nvObj = position;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', `#include <common>
          uniform float uSel, uHover, uImpulse, uImpT; uniform vec3 uSA, uAV, uLight;
          varying float vPart; varying vec3 vObj;`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          float pid = floor(vPart + .5);
          if (uSel > .5) diffuseColor.rgb *= (abs(pid - uSel) < .5) ? 1.15 : .35;   // reszta 35% (karta Reżysera)
          if (uHover > .5 && abs(pid - uHover) < .5) diffuseColor.rgb = mix(diffuseColor.rgb, uLight, .22);`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          if (uImpulse > .5) {
            // fala pobudzenia: przedsionki od węzła SA, komory od węzła AV po opóźnieniu (ID: 1-2 przedsionki, 3-5 komory i przegroda, 10 mięśnie brodawkowate)
            bool atrium = pid > .5 && pid < 2.5;
            bool vent = (pid > 2.5 && pid < 5.5) || abs(pid - 10.) < .5;
            float r = -1.;
            if (atrium) r = uImpT * .16;
            if (vent && uImpT > .42) r = (uImpT - .42) * .30;
            float d = atrium ? distance(vObj, uSA) : distance(vObj, uAV);
            float w = .012;
            float ring = r > 0. ? 1. - smoothstep(0., w, abs(d - r)) : 0.;
            float core = r > 0. ? 1. - smoothstep(0., w * .35, abs(d - r)) : 0.;
            totalEmissiveRadiance += uLight * ring * .9 + vec3(1.) * core * .9;   // biały rdzeń = sygnał (karta)
          }`);
    };
    m.customProgramCacheKey = () => `organ-tissue-${doubleSide ? 'd' : 's'}`;
    this.tissueMats.push(m);
    return m;
  }

  private pickMaterial(doubleSide: boolean) {
    const m = new THREE.MeshBasicMaterial({ side: doubleSide ? THREE.DoubleSide : THREE.FrontSide, clippingPlanes: [this.plane] });
    m.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float partId;\nvarying float vPart;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPart = partId;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vPart;')
        .replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor = vec4(floor(vPart + .5) / 255., 0., 0., 1.);');
    };
    m.customProgramCacheKey = () => `organ-pick-${doubleSide ? 'd' : 's'}`;
    return m;
  }

  /** Zalanie przekroju: ściana ma grubość (siatki komór i przedsionków są szczelne, sprawdzone w M2). */
  private capGroup(mesh: THREE.Mesh, order: number) {
    const mk = (side: THREE.Side, op: THREE.StencilOp) => {
      const mat = new THREE.MeshBasicMaterial({ side, clippingPlanes: [this.plane], depthWrite: false, depthTest: false, colorWrite: false,
        stencilWrite: true, stencilFunc: THREE.AlwaysStencilFunc, stencilFail: op, stencilZFail: op, stencilZPass: op });
      const s = new THREE.Mesh(mesh.geometry, mat);
      s.morphTargetInfluences = mesh.morphTargetInfluences; s.renderOrder = order; s.frustumCulled = false;
      return s;
    };
    const capMat = new THREE.MeshStandardMaterial({ color: CUT, roughness: 0.75, stencilWrite: true, stencilRef: 0, stencilFunc: THREE.NotEqualStencilFunc,
      stencilFail: THREE.ReplaceStencilOp, stencilZFail: THREE.ReplaceStencilOp, stencilZPass: THREE.ReplaceStencilOp });
    const cap = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), capMat);
    cap.position.z = this.plane.constant; // płaszczyzna: −z + c = 0
    cap.renderOrder = order + 0.1;
    cap.onAfterRender = (r) => r.clearStencil();
    return [mk(THREE.BackSide, THREE.IncrementWrapStencilOp), mk(THREE.FrontSide, THREE.DecrementWrapStencilOp), cap];
  }

  /** Węzły SA i AV oraz pęczek: SCHEMAT-BRYŁA (materiał schematu, bez faktury), położenie z opisu podręcznikowego. */
  private buildSchematic(pj: PathsFile, ra?: THREE.Mesh, septum?: THREE.Mesh) {
    // SA: ściana prawego przedsionka najbliżej ujścia żyły głównej górnej; AV: dolna część przedsionka przy przegrodzie
    const svc = pj.paths.right_svc_L ?? Object.values(pj.paths)[0];
    const junction = new THREE.Vector3(...svc[Math.max(0, svc.findIndex((q) => q.seg === 'valve_av') - 2)].p);
    const tri = new THREE.Vector3(...pj.valves.tricuspid_valve.c), mit = new THREE.Vector3(...pj.valves.mitral_valve.c);
    const avTarget = tri.clone().lerp(mit, 0.3).add(new THREE.Vector3(0, 0.008, 0));
    const nearest = (target: THREE.Vector3, out: THREE.Vector3) => {
      if (!ra) return out.copy(target);
      ra.updateWorldMatrix(true, false);
      const P = attrToFloat(ra.geometry.attributes.position), v = new THREE.Vector3();
      let best = Infinity;
      for (let i = 0; i < P.length; i += 3) {
        v.set(P[i], P[i + 1], P[i + 2]).applyMatrix4(ra.matrixWorld);
        const d = v.distanceToSquared(target);
        if (d < best) { best = d; out.copy(v); }
      }
      return out;
    };
    nearest(junction, this.saPoint);
    nearest(avTarget, this.avPoint);
    this.uniforms.uSA.value.copy(this.saPoint);
    this.uniforms.uAV.value.copy(this.avPoint);
    const mat = new THREE.MeshLambertMaterial({ color: SCHEMA, flatShading: true });
    const node = (p: THREE.Vector3, r: number, part: HeartPart) => {
      const g = new THREE.SphereGeometry(r, 12, 8);
      g.setAttribute('partId', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(PART_INDEX[part]), 1));
      const m = new THREE.Mesh(g, mat); m.position.copy(p); m.renderOrder = 7; this.schematic.add(m);
      const pm = new THREE.Mesh(g, this.pickMaterial(false)); pm.position.copy(p); this.pickScene.add(pm);
    };
    node(this.saPoint, 0.0045, 'sinoatrial_node');
    node(this.avPoint, 0.004, 'atrioventricular_node');
    // pęczek przedsionkowo-komorowy: rura W PRZEGRODZIE ku koniuszkowi (schemat): środki przekrojów przegrody wzdłuż osi
    const base = new THREE.Vector3(...pj.axis.base), apex = new THREE.Vector3(...pj.axis.apex), ax = apex.clone().sub(base);
    const L = ax.length(); ax.normalize();
    const pts: THREE.Vector3[] = [this.avPoint.clone()];
    if (septum) {
      septum.updateWorldMatrix(true, false);
      const P = attrToFloat(septum.geometry.attributes.position), v = new THREE.Vector3();
      const bins = Array.from({ length: 6 }, () => ({ s: new THREE.Vector3(), n: 0 }));
      for (let i = 0; i < P.length; i += 3) {
        v.set(P[i], P[i + 1], P[i + 2]).applyMatrix4(septum.matrixWorld);
        const t = v.clone().sub(base).dot(ax) / L; // 0 podstawa … 1 koniuszek
        if (t < 0.2 || t > 0.8) continue;
        const b = bins[Math.min(5, Math.floor(((t - 0.2) / 0.6) * 6))]; b.s.add(v); b.n++;
      }
      for (const b of bins) if (b.n > 20) pts.push(b.s.divideScalar(b.n));
    }
    if (pts.length < 3) pts.push(this.avPoint.clone().lerp(apex, 0.4), this.avPoint.clone().lerp(apex, 0.7));
    const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.0016, 6);
    const tm = new THREE.Mesh(tube, mat); tm.renderOrder = 7; this.schematic.add(tm);
    this.scene.add(this.schematic);
  }

  /** Krwinki: tory z promieniem z geometrii (v ~ 1/(π r²)), bramki zastawek, gęstość równa w obu połowach. */
  private buildFlows(pj: PathsFile) {
    const entries = Object.entries(pj.paths);
    const perSide = 750; // Low; mnożnik gęstości (sprint) zmienia widoczną liczbę
    const sideCount = (left: boolean) => entries.filter(([n]) => n.startsWith('left') === left).length;
    for (const [name, raw] of entries) {
      const pts = raw.filter((q, i) => i === 0 || Math.hypot(q.p[0] - raw[i - 1].p[0], q.p[1] - raw[i - 1].p[1], q.p[2] - raw[i - 1].p[2]) > 0.002);
      let curve = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q.p)), false, 'centripetal');
      if (!Number.isFinite(curve.getLength())) curve = new THREE.CatmullRomCurve3(curve.points, false, 'catmullrom', 0.5);
      const fr = [0]; let acc = 0;
      for (let i = 1; i < pts.length; i++) { acc += new THREE.Vector3(...pts[i].p).distanceTo(new THREE.Vector3(...pts[i - 1].p)); fr.push(acc); }
      const fracs = fr.map((x) => x / acc);
      const rAt = (u: number) => { let i = 1; while (i < fracs.length - 1 && fracs[i] < u) i++; const t = (u - fracs[i - 1]) / Math.max(1e-6, fracs[i] - fracs[i - 1]); return pts[i - 1].r + (pts[i].r - pts[i - 1].r) * Math.min(1, Math.max(0, t)); };
      const uAV = fracs[pts.findIndex((q) => q.seg === 'valve_av')] ?? 0.4, uSL = fracs[pts.findIndex((q) => q.seg === 'valve_sl')] ?? 0.6;
      const left = name.startsWith('left');
      const path = new FlowPath(curve, { area: (u) => Math.PI * Math.max(0.004, rAt(u)) ** 2 });
      const count = Math.round(perSide / sideCount(left));
      const geo = createErythrocyteGeometry(0.0013, 10, 14);
      const mat = new THREE.MeshStandardMaterial({ color: left ? TOK.artery : TOK.vein, roughness: 0.5, clippingPlanes: [this.plane] });
      const p = new FlowParticles({
        path, count, geometry: geo, material: mat, radiusSpread: 0.006,
        speedScale: () => 0.16 * (this.heartRate / 60), // tempo przepływu rośnie z tętnem (poglądowo)
        pulse: () => 1,
        gate: (u) => (u < uAV - 0.01 ? 0.25 + 0.75 * this.gateAV : u < uSL - 0.01 ? (this.gateSL > 0.1 ? 1.6 : this.gateAV > 0.5 ? 0.6 : 0.04) : 0.35 + 1.1 * this.gateSL),
        frozen: () => this.flags.flowFrozen || this.paused || this.reducedMotion,
        nearFade: [0.05, 0.08],
      });
      p.mesh.renderOrder = 7;
      this.scene.add(p.mesh);
      this.flows.push({ p, left, base: count });
    }
  }

  private buildShots(pj: PathsFile) {
    const c: [number, number, number] = [0.004, 0.004, 0];
    this.shots = {
      przekroj: { az: 0, el: 4, dist: 0.62, target: c },
      tyl: { az: 180, el: 4, dist: 0.62, target: c },
      podstawa: { az: 0, el: 35, dist: 0.6, target: c },
      przedsionek: { az: -18, el: 8, dist: 0.32, target: [this.saPoint.x * 0.5 + this.avPoint.x * 0.5, this.saPoint.y * 0.5 + this.avPoint.y * 0.5, this.saPoint.z * 0.5 + this.avPoint.z * 0.5] },
    };
    void pj;
  }

  // ------------------------------------------------------------------ sterowanie
  applyFlags() {
    const f = this.flags;
    this.plane.constant = f.cut ? -0.004 : 10;
    for (const o of this.caps) o.visible = f.cut;
    for (const fl of this.flows) fl.p.mesh.visible = f.flow;
    this.uniforms.uImpulse.value = f.impulse ? 1 : 0;
    this.schematic.visible = true;
  }

  setWallsTissue(on: boolean) {
    if (this.flags.wallsTissue === on) return;
    this.flags.wallsTissue = on;
    for (const [g, side] of [[this.groups.L, 'L'], [this.groups.R, 'R']] as const) {
      if (!g) continue;
      const col = g.geometry.attributes.color as THREE.BufferAttribute;
      const ao = g.geometry.userData.ao as Float32Array;
      const to = new THREE.Color(on ? MYO : side === 'L' ? TOK.artery : TOK.vein);
      for (let i = 0; i < col.count; i++) col.setXYZ(i, to.r * ao[i], to.g * ao[i], to.b * ao[i]);
      col.needsUpdate = true;
    }
  }

  goShot(name: string, dur = 1.2) {
    const s = this.shots[name];
    if (!s) return;
    this.rail.go({ az: s.az, el: s.el, dist: s.dist, target: new THREE.Vector3(...s.target) }, this.reducedMotion ? 0 : dur);
  }

  /** Obrót (przeciąganie): poziomo bez ograniczeń, pionowo ±35° (wyjątek gablot, decyzja Dyrygenta). */
  orbit(dAz: number, dEl: number) {
    const c = this.rail.cur;
    this.rail.go({ az: c.az + dAz, el: Math.max(-35, Math.min(35, c.el + dEl)) }, 0);
  }

  /** Zoom 0,6–2,5× kadru głównego. */
  zoom(factor: number) {
    const base = this.shots.przekroj?.dist ?? 0.62;
    const d = Math.max(base / 2.5, Math.min(base / 0.6, this.rail.cur.dist * factor));
    this.rail.go({ dist: d }, 0);
  }

  /** Wybór przez GPU: ID części pod pikselem (x, y w px płótna CSS). */
  pick(x: number, y: number): HeartPart | null {
    const r = this.renderer, el = r.domElement;
    const w = el.clientWidth, h = el.clientHeight;
    this.camera.setViewOffset(w, h, Math.round(x), Math.round(y), 1, 1);
    r.setRenderTarget(this.pickTarget);
    r.setClearColor(0x000000, 0);
    r.clear();
    r.render(this.pickScene, this.camera);
    const px = new Uint8Array(4);
    r.readRenderTargetPixels(this.pickTarget, 0, 0, 1, 1, px);
    r.setRenderTarget(null);
    this.camera.clearViewOffset();
    const id = px[0];
    return id > 0 && id <= HEART_PARTS.length ? HEART_PARTS[id - 1] : null;
  }

  setSelected(p: HeartPart | null) { this.selected = p; this.uniforms.uSel.value = p ? PART_INDEX[p] : 0; }
  setHovered(p: HeartPart | null) { this.hovered = p; this.uniforms.uHover.value = p ? PART_INDEX[p] : 0; }

  /** Rzut punktu sceny na px płótna (podpisy HTML). */
  project(p: THREE.Vector3, out: { x: number; y: number }) {
    const v = p.clone().project(this.camera);
    const el = this.renderer.domElement;
    out.x = (v.x * 0.5 + 0.5) * el.clientWidth; out.y = (-v.y * 0.5 + 0.5) * el.clientHeight;
    return v.z < 1;
  }

  resize() {
    const w = this.host.clientWidth || 1, h = this.host.clientHeight || 1;
    this.renderer.setSize(w, h, true);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // ------------------------------------------------------------------ pętla
  start() {
    this.last = performance.now();
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.step(dt);
      this.renderer.render(this.scene, this.camera);
      this.onFrame?.();
    };
    this.raf = requestAnimationFrame(loop);
  }

  /** Jedna klatka symulacji (także do pomiaru `__organBench`). */
  step(dt: number) {
    const run = !this.paused && !this.reducedMotion;
    if (run) this.time += dt;
    const { dt: simDt, seeked } = this.clock.update(this.time, this.heartRate, 12);
    const f = this.frame;
    f.timeSec = this.time; f.dtSec = run ? simDt : 0; f.seeked = seeked; f.playing = run; f.beatPhase = this.clock.beatPhase; f.heartRate = this.heartRate;
    const w = heartCycle(this.clock.beatPhase, 1, WINDOWS, this.weights);
    const g = this.groups;
    const set = (m: THREE.Mesh | undefined, i: number, val: number) => { if (m?.morphTargetInfluences) m.morphTargetInfluences[i] = val; };
    const cont = this.flags.contraction ? 1 : 0;
    set(g.L, 0, w.atrial * cont); set(g.R, 0, w.atrial * cont);
    set(g.L, 1, w.ventricular * cont); set(g.R, 1, w.ventricular * cont);
    // zastawki B: otwarte w rozkurczu (p-k) i w wyrzucie (półksiężycowate); bez kroku „zastawki” stoją otwarte (p-k) / zamknięte (półksiężycowate)
    const avOpen = 1 - sm(0.1, 0.14, this.clock.beatPhase) + sm(0.5, 0.55, this.clock.beatPhase);
    const slOpen = sm(0.15, 0.19, this.clock.beatPhase) * (1 - sm(0.42, 0.46, this.clock.beatPhase));
    this.gateAV = this.flags.valves ? Math.min(1, Math.max(0, avOpen)) : 1;
    this.gateSL = this.flags.valves ? slOpen : 1;
    set(g.AV, 0, this.flags.valves ? this.gateAV : 1);
    set(g.SL, 0, this.flags.valves ? this.gateSL : 0);
    this.uniforms.uImpT.value = this.clock.beatPhase;
    for (const fl of this.flows) {
      fl.p.mesh.count = Math.min(fl.base, Math.round(fl.base * Math.min(1, this.density / 1.4)));
      fl.p.advance(f);
      fl.p.write(this.camera);
    }
    this.rail.update(dt);
  }

  /** Pomiar jak __atlas3dBench: n klatek render + readPixels (ANGLE nie czeka na finish). */
  bench(n = 240) {
    const gl = this.renderer.getContext(), px = new Uint8Array(4), t0 = performance.now();
    for (let i = 0; i < n; i++) { this.step(1 / 60); this.renderer.render(this.scene, this.camera); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); }
    const ms = (performance.now() - t0) / n;
    return { msPerFrame: +ms.toFixed(2), fps: +(1000 / ms).toFixed(1), calls: this.renderer.info.render.calls, triangles: this.renderer.info.render.triangles };
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose();
    });
    this.pickTarget.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
