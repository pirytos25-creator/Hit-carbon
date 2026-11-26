/**
 * Silnik widoku 3D atlasu (E3, P1 „Gablota”). Dane: public/atlas3d/<uklad>/ (kontrakt: docs/atlas_wizualizacja/E3_KONTRAKT_3D.md).
 * Architektura wg modelu §3.3:
 *  - scalone siatki (plik × warstwa = 1 wywołanie rysowania) z ID struktury w każdym wierzchołku (atrybut _ID),
 *  - stan w teksturze danych: zmiana stanu = zapis kilku tekseli, przenikanie spoczynek↔sprint = jedna liczba (uState),
 *  - kolor i emisja każdej struktury odczytane z materiałów planszy (bindings.json → look), więc 3D = render 2D.
 * Rama: Z-Anatomy (metry, przód −Y, prawa strona ciała −X, Z w górę); w three: (x, z, −y).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { PALETTE } from '../atlas/palette';

// ---------------------------------------------------------------- typy kontraktu
export type Vec3 = [number, number, number];
export interface Cam3 { direction: string | number[]; center: number[]; right: number[]; up: number[]; orthoScale: number }
export interface ManifestFile { path: string; license: string; attribution: string; frame: 'body' | 'staging'; bytes: number; tris: number; shared?: boolean }
export interface Manifest {
  plate: string;
  /** Karta bez stanów (anchors.json planszy: "card": true), jak AtlasApp.isCard. */
  card?: boolean;
  files: ManifestFile[];
  views: Record<string, { camera: Cam3; frame: 'body' | 'staging'; resolution?: [number, number] | null }>;
  budget: { body: { bytes: number; tris: number; calls: number }; all: { bytes: number; tris: number; calls: number } };
}
interface Look { color: number[]; emission: number; emissionColor: number[]; alpha: number }
export interface Binding {
  meshId: string; file: string; role: string; system: string | null; views: string[]; frame: string; license: string;
  alpha: number | null; look: Partial<Record<'rest' | 'sprint', Look>> | null;
}
export interface Bindings { tables: Record<string, string[]>; structures: Binding[]; anchors?: Record<string, string[]> }
export interface Anchors3D { views: Record<string, Record<string, Vec3>> }
export interface Flow3 { id: string; kind: string; labelPl?: string; views?: string[]; states?: string[]; points: Vec3[]; frame: 'body' | 'staging' }

/** Z-Anatomy → three. */
export const za = (p: readonly number[]) => new THREE.Vector3(p[0], p[2], -p[1]);

// ---------------------------------------------------------------- dane
export interface AtlasData { manifest: Manifest; bindings: Bindings; anchors: Anchors3D; flows: Flow3[]; sharedIds: Record<string, string[]> }

export class MissingDataError extends Error {}

async function getJson<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) throw new MissingDataError(url);
  return r.json() as Promise<T>;
}

export async function loadAtlasData(base: string, plate: string): Promise<AtlasData> {
  const d = `${base}atlas3d/${plate}/`;
  const [manifest, bindings, anchors, flows, shared] = await Promise.all([
    getJson<Manifest>(d + 'manifest.json'), getJson<Bindings>(d + 'bindings.json'), getJson<Anchors3D>(d + 'anchors3d.json'),
    getJson<{ flows: Flow3[] }>(d + 'flows3d.json'), getJson<{ files: Record<string, { ids: string[] }> }>(`${base}atlas3d/_shared/ids.json`),
  ]);
  const sharedIds: Record<string, string[]> = {};
  for (const [f, v] of Object.entries(shared.files)) sharedIds[`_shared/${f}`] = v.ids;
  return { manifest, bindings, anchors, flows: flows.flows, sharedIds };
}

// ---------------------------------------------------------------- stan w teksturze danych
// wiersz 0: kolor spoczynku (liniowy) + widoczność; wiersz 1: kolor sprintu + wyróżnienie; wiersz 2: emisja spoczynku, emisja sprintu, alfa
export class StateTex {
  readonly n: number;
  readonly data: Float32Array;
  readonly tex: THREE.DataTexture;
  constructor(n: number) {
    this.n = n;
    this.data = new Float32Array(n * 4 * 3);
    this.tex = new THREE.DataTexture(this.data, n, 3, THREE.RGBAFormat, THREE.FloatType);
    this.tex.minFilter = this.tex.magFilter = THREE.NearestFilter;
  }
  private k(row: number, id: number) { return (row * this.n + id) * 4; }
  setLook(id: number, rest: Look, sprint: Look) {
    const d = this.data;
    d.set([...rest.color.slice(0, 3)], this.k(0, id));
    d.set([...sprint.color.slice(0, 3)], this.k(1, id));
    const k2 = this.k(2, id);
    d[k2] = rest.emission; d[k2 + 1] = sprint.emission; d[k2 + 2] = Math.min(rest.alpha, sprint.alpha);
  }
  setVis(id: number, v: number) { this.data[this.k(0, id) + 3] = v; }
  setHi(id: number, v: number) { this.data[this.k(1, id) + 3] = v; }
  commit() { this.tex.needsUpdate = true; }
}

// ---------------------------------------------------------------- materiał (MeshStandardMaterial + łatka shadera)
export function atlasMaterial(state: StateTex, transparent: boolean, opacity: number) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 0.66, metalness: 0, transparent, opacity, depthWrite: !transparent,
    side: transparent ? THREE.FrontSide : THREE.DoubleSide, // siatki Z-Anatomy nie są szczelne
  });
  const u = { uStateTex: { value: state.tex }, uState: { value: 0 }, uTime: { value: 0 } };
  mat.userData.u = u;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float _id;\nvarying float vId;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvId = _id;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform sampler2D uStateTex; uniform float uState; uniform float uTime; varying float vId;
        float bayer4(vec2 p){ ivec2 q = ivec2(mod(p, 4.)); int i = q.x + q.y*4;
          float m[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.); return (m[i]+.5)/16.; }`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        int sid = int(vId + .5);
        vec4 r0 = texelFetch(uStateTex, ivec2(sid, 0), 0);
        vec4 r1 = texelFetch(uStateTex, ivec2(sid, 1), 0);
        vec4 r2 = texelFetch(uStateTex, ivec2(sid, 2), 0);
        if (r0.a < .01) discard;                                   // struktura spoza tego widoku planszy
        ${transparent ? '' : 'if (r2.b < .999 && r2.b <= bayer4(gl_FragCoord.xy)) discard; // półprzezroczysta w siatce nieprzezroczystej'}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float hi = r1.a * (.55 + .45 * sin(uTime * 3.9));
        vec3 baseC = mix(r0.rgb, r1.rgb, uState);
        diffuseColor.rgb = mix(baseC, baseC * 1.25 + .1, hi);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance = baseC * mix(r2.r, r2.g, uState) + baseC * hi * .3;`);
  };
  mat.customProgramCacheKey = () => (transparent ? 'atlas3d-t' : 'atlas3d-o');
  return mat;
}

// ---------------------------------------------------------------- pliki GLB
export interface LoadedFile {
  path: string; root: THREE.Group; meshes: THREE.Mesh[]; state: StateTex; ids: string[];
  byMesh: Map<string, number>; bind: Map<number, Binding>;
}

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

export async function loadFiles(base: string, data: AtlasData, onBytes?: (b: number) => void): Promise<LoadedFile[]> {
  const plate = data.manifest.plate;
  const byFile = new Map<string, Binding[]>();
  for (const s of data.bindings.structures) {
    const arr = byFile.get(s.file) ?? [];
    arr.push(s);
    byFile.set(s.file, arr);
  }
  return Promise.all(data.manifest.files.map(async (f) => {
    const url = f.shared ? `${base}atlas3d/${f.path}` : `${base}atlas3d/${plate}/${f.path}`;
    const r = await fetch(url);
    if (!r.ok) throw new MissingDataError(url);
    const buf = await r.arrayBuffer();
    onBytes?.(buf.byteLength);
    const gltf = await loader.parseAsync(buf, '');
    const ids = f.shared ? data.sharedIds[f.path] : data.bindings.tables[f.path];
    const state = new StateTex(ids.length + 1);
    const byMesh = new Map(ids.map((m, i) => [m, i + 1]));
    const bind = new Map<number, Binding>();
    for (const s of byFile.get(f.path) ?? []) {
      const id = byMesh.get(s.meshId);
      if (id === undefined) continue;
      bind.set(id, s);
      const rest = s.look?.rest ?? s.look?.sprint, sprint = s.look?.sprint ?? s.look?.rest;
      if (rest && sprint) state.setLook(id, rest, sprint);
    }
    state.commit();
    const meshes: THREE.Mesh[] = [];
    gltf.scene.traverse((o) => {
      if (!(o as THREE.Mesh).isMesh) return;
      const m = o as THREE.Mesh;
      const idAttr = m.geometry.getAttribute('_id');
      // warstwa przezroczysta, gdy wszystkie jej struktury w tym układzie mają alfę < 1 (np. sylwetka 0,12)
      const alphas = new Set<number>();
      if (idAttr) for (let i = 0; i < idAttr.count; i += 97) {
        const b = bind.get(Math.round(idAttr.getX(i)));
        if (b) alphas.add(+(Math.min(b.look?.rest?.alpha ?? 1, b.look?.sprint?.alpha ?? 1)).toFixed(2));
      }
      const a = alphas.size === 1 ? [...alphas][0] : 1;
      m.material = atlasMaterial(state, a < 0.999, a < 0.999 ? a : 1);
      m.renderOrder = a < 0.999 ? 2 : 0;
      m.frustumCulled = false;
      meshes.push(m);
    });
    return { path: f.path, root: gltf.scene, meshes, state, ids, byMesh, bind };
  }));
}

/** Zwolnienie geometrii, materiałów i tekstur stanu (zamknięcie widoku, przerwane ładowanie). */
export function disposeFiles(files: LoadedFile[]) {
  for (const f of files) {
    for (const m of f.meshes) { m.geometry.dispose(); (m.material as THREE.Material).dispose(); }
    f.state.tex.dispose();
  }
}

/** Widoczność struktur w danym zestawie widoków planszy (główny zestaw albo jedno zbliżenie).
 *  Zwraca obrys (three) widocznej geometrii: zbliżenie pokazuje tylko podpisy, których kotwica leży przy niej. */
export function applyViews(files: LoadedFile[], views: Set<string>): THREE.Box3 {
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  for (const f of files) {
    const vis = new Uint8Array(f.ids.length + 1);
    for (let id = 1; id <= f.ids.length; id++) {
      const b = f.bind.get(id);
      vis[id] = b && b.views.some((x) => views.has(x)) ? 1 : 0;
      f.state.setVis(id, vis[id]);
    }
    f.state.commit();
    for (const m of f.meshes) {
      const pos = m.geometry.getAttribute('position'), ida = m.geometry.getAttribute('_id');
      if (!pos || !ida) continue;
      m.updateWorldMatrix(true, false);
      for (let i = 0; i < pos.count; i += 7) if (vis[Math.round(ida.getX(i))]) box.expandByPoint(v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld));
    }
  }
  return box;
}

export function setUniform(files: LoadedFile[], name: 'uState' | 'uTime', v: number) {
  for (const f of files) for (const m of f.meshes) ((m.material as THREE.Material).userData.u[name] as { value: number }).value = v;
}

/** Wyróżnienie struktur kotwicy (fokus na podpisie). */
export function highlight(files: LoadedFile[], meshIds: Set<string>) {
  for (const f of files) {
    for (const [m, id] of f.byMesh) f.state.setHi(id, meshIds.has(m) ? 1 : 0);
    f.state.commit();
  }
}

// ---------------------------------------------------------------- strzałki
export function flowHex(kind: string): string {
  const f = (PALETTE as unknown as { flows: { kinds: Record<string, { system?: string }> } }).flows.kinds[kind];
  return PALETTE.systems.find((s) => s.key === f?.system)?.light ?? '#cbd5e1';
}

/** Rura wzdłuż toru w metrach z przesuwanymi grotami. Zmienna: kierunek i prędkość przepływu (2 stopnie, ilustracja). */
export function makeFlow(f: Flow3) {
  const curve = new THREE.CatmullRomCurve3(f.points.map(za), false, 'centripetal');
  const len = curve.getLength();
  const geo = new THREE.TubeGeometry(curve, Math.max(24, Math.round(len / 0.01)), 0.0045, 6, false);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color(flowHex(f.kind)) }, uTime: { value: 0 }, uSpeed: { value: 1 }, uOn: { value: 1 }, uLen: { value: len } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform vec3 uColor; uniform float uTime, uSpeed, uOn, uLen; varying vec2 vUv;
      void main(){
        float f = fract(vUv.x * uLen / .085 - uTime * uSpeed * 2.2);
        float head = smoothstep(.35, .85, f) * step(f, .9);
        gl_FragColor = vec4(mix(uColor, vec3(1.), .45 * head), (.1 + .9 * head) * uOn);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 20;
  mesh.frustumCulled = false;
  return mesh;
}

// ---------------------------------------------------------------- kamera po szynie (obrót tylko poziomy)
export interface Shot { az: number; el: number; target: THREE.Vector3; dist: number }

/** Kierunek widoku planszy (od środka do kamery, rama Z-Anatomy) → azymut i wysokość w three. */
export function dirToAngles(direction: string | number[]): { az: number; el: number } {
  const named: Record<string, number> = { front: 0, left: 90, side: 90, back: 180, right: 270 };
  if (typeof direction === 'string') return { az: named[direction] ?? 0, el: 0 };
  const [x, y, z] = direction;
  return { az: (Math.atan2(x, -y) * 180) / Math.PI, el: (Math.asin(Math.max(-1, Math.min(1, z))) * 180) / Math.PI };
}

export function shotFor(cam: Cam3, res: [number, number] | null | undefined, fovDeg: number, aspect: number, margin = 1.0): Shot {
  const [W, H] = res ?? [1000, 1800];
  const hW = W >= H ? (cam.orthoScale * H) / W : cam.orthoScale;
  const wW = W >= H ? cam.orthoScale : (cam.orthoScale * W) / H;
  const t = Math.tan((fovDeg * Math.PI) / 360);
  const dist = (Math.max(hW, wW / aspect) * margin) / 2 / t;
  return { ...dirToAngles(cam.direction), target: za(cam.center), dist };
}

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

/** Światło jak atlas_lib.Plate._lights: klucz z lewej-góry-przodu, wypełnienie z prawej, kontra z tyłu (względem kamery). */
export function attachLights(camera: THREE.Camera, scene: THREE.Scene) {
  const add = (c: number, i: number, p: Vec3) => {
    const l = new THREE.DirectionalLight(c, i);
    l.position.set(...p);
    l.target.position.set(0, 0, -1);
    camera.add(l, l.target);
    return l;
  };
  const lights = [add(0xfff7ee, 2.1, [-1.6, 1.4, 2.6]), add(0xe6f2ff, 0.75, [1.8, 0.2, 2.4]), add(0xd9ebff, 1.5, [0.6, 1.2, -2.6])];
  const hemi = new THREE.HemisphereLight(0xbcc8dc, 0x2a2420, 0.55);
  scene.add(camera, hemi);
  return () => { lights.forEach((l) => camera.remove(l, l.target)); scene.remove(hemi); };
}
