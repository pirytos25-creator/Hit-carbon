// Wspólny silnik prototypów 3D atlasu (P1, P2, P3). Vanilla three r169 (ta sama wersja co aplikacja).
// Architektura wg modelu §3.3: scalone siatki z ID struktury w każdym wierzchołku (_ID), stan w teksturze danych
// (zmiana stanu = zapis kilku tekseli), kolory z palette.json tą samą funkcją co atlas_lib.active_color.
// „Każdy efekt ma zmienną” (plan Reżysera): emisja = poziom pracy w sprincie, strzałka = przepływ, wygaszanie = krok łańcucha.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import palette from '../../../src/atlas/data/palette.json';

export { THREE };

// ---------------------------------------------------------------- rama współrzędnych
// Z-Anatomy: metry, przód −Y, prawa strona ciała −X, Z w górę. glTF/three: Y w górę => three(x, y, z) = ZA(x, z, −y).
export const za = (p) => new THREE.Vector3(p[0], p[2], -p[1]);

// ---------------------------------------------------------------- paleta (jedno źródło z Pythonem)
export const SYSTEMS = palette.systems.map((s) => s.key);
export const SYS = Object.fromEntries(palette.systems.map((s, i) => [s.key, { ...s, index: i }]));
const lin = (hex) => new THREE.Color(hex); // ColorManagement: sRGB hex -> liniowy kolor roboczy
export const CTX = { bone: lin(palette.context.bone), muscle: lin(palette.context.muscle), skin: lin(palette.context.skin) };
export const REST_MIX = palette.restMix;
export const FLOW_COLOR = {
  artery: SYS.artery.light, vein: SYS.vein.light, nerve: SYS.nerve.light, heat: SYS.skin.light,
  lactate: SYS.muscle.light, glucose: SYS.digest.light, urine: SYS.urinary.light, force: SYS.bone.light, air: SYS.resp.light,
};

// ---------------------------------------------------------------- renderer i scena
export function createViewer(container, { fov = 16, near = 0.05, far = 60, background = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.NoToneMapping; // rendery plansz: transformacja Standard, nie AgX (kolory 1:1)
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, near, far);
  scene.add(camera);
  // światło jak w atlas_lib.Plate._lights: klucz z lewej-góry-przodu, wypełnienie z prawej, kontra z tyłu (względem kamery)
  const key = new THREE.DirectionalLight(0xfff7ee, 2.1);
  key.position.set(-1.6, 1.4, 2.6);
  const fill = new THREE.DirectionalLight(0xe6f2ff, 0.75);
  fill.position.set(1.8, 0.2, 2.4);
  const rim = new THREE.DirectionalLight(0xd9ebff, 1.5);
  rim.position.set(0.6, 1.2, -2.6);
  camera.add(key, fill, rim, key.target, fill.target, rim.target);
  [key, fill, rim].forEach((l) => (l.target.position.set(0, 0, -1)));
  scene.add(new THREE.HemisphereLight(0xbcc8dc, 0x2a2420, 0.55));
  if (background) scene.add(makePlinth());

  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = w + 'px';
    renderer.domElement.style.height = h + 'px';
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(container);
  resize();
  return { renderer, scene, camera };
}

/** „Podest” pod stopami (plan Reżysera §4.1): skala i uziemienie postaci, bez tekstury. */
function makePlinth() {
  const g = new THREE.CircleGeometry(0.55, 64);
  g.rotateX(-Math.PI / 2);
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { c: { value: new THREE.Color('#2A3B5E') } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform vec3 c; varying vec2 vUv; void main(){ float r = length(vUv-.5)*2.; gl_FragColor = vec4(c, .55*smoothstep(1.,.1,r)); }',
  });
  const mesh = new THREE.Mesh(g, m);
  mesh.position.y = -0.002;
  mesh.renderOrder = -1;
  return mesh;
}

// ---------------------------------------------------------------- ładowanie GLB + tabele ID
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
export const ASSET_BASE = '/_assets/';
export const downloaded = { bytes: 0, files: [] };

async function fetchCounted(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  const buf = await r.arrayBuffer();
  downloaded.bytes += buf.byteLength;
  downloaded.files.push([url, buf.byteLength]);
  return buf;
}

/**
 * Wczytuje plik GLB atlasu i jego tabelę ID. Zwraca { name, layers: {nazwa: mesh}, ids: [...], byKey, state }.
 * Każda warstwa (np. "artery") to JEDNA siatka = jedno wywołanie rysowania.
 */
export async function loadAtlasFile(name, onProgress) {
  const [buf, idsBuf] = await Promise.all([fetchCounted(`${ASSET_BASE}${name}.glb`), fetchCounted(`${ASSET_BASE}ids_${name}.json`)]);
  const ids = JSON.parse(new TextDecoder().decode(idsBuf));
  const gltf = await loader.parseAsync(buf, '');
  const state = new StateTexture(ids.structures.length + 1);
  for (const s of ids.structures) state.setStructure(s.id, s);
  state.commit();
  const layers = {};
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    const lname = o.userData.atlas_layer || o.name;
    o.material = makeAtlasMaterial(state, layerRole(lname));
    o.userData.file = name;
    o.userData.layer = lname;
    o.frustumCulled = false;
    layers[lname] = o;
  });
  onProgress?.(name);
  const byKey = new Map(ids.structures.map((s) => [s.key, s]));
  const byId = new Map(ids.structures.map((s) => [s.id, s]));
  return { name, root: gltf.scene, layers, ids: ids.structures, byKey, byId, state, license: ids.license };
}

/** Rola warstwy decyduje, z jakim kolorem kontekstu miesza się spoczynek (atlas_lib.role_material / active_color). */
function layerRole(lname) {
  if (lname === 'bone') return { role: 'ctx_bone', ctx: CTX.bone, dimMix: 0 };
  if (lname === 'skin') return { role: 'skin', ctx: CTX.skin, dimMix: 0, opacity: 0.12 };
  if (lname === 'muscle') return { role: 'active', ctx: CTX.muscle, dimMix: 0 }; // niepracujące mięśnie = kontekst #8E7A78
  // naczynia, nerwy, serce, trzewia: cienkie tkanki mieszają się z kolorem mięśni/tła (active_color, ctx="muscle")
  return { role: 'active', ctx: CTX.muscle, dimMix: REST_MIX };
}

// ---------------------------------------------------------------- stan w teksturze danych
// wiersz 0, teksel ID: R = indeks układu, G = poziom pracy w sprincie (−1 = "dim"), B = widoczność 0-1, A = wyróżnienie 0-1
// wiersz 1, teksel ID: R = własny moment struktury 0-1 (−1 = wspólny uState materiału); używa go łańcuch w P2
export class StateTexture {
  constructor(n) {
    this.n = n;
    this.data = new Float32Array(n * 4 * 2);
    this.tex = new THREE.DataTexture(this.data, n, 2, THREE.RGBAFormat, THREE.FloatType);
    this.tex.minFilter = this.tex.magFilter = THREE.NearestFilter;
    for (let i = 0; i < n; i++) { this.data[i * 4 + 2] = 1; this.data[(n + i) * 4] = -1; }
  }
  setMoment(id, m) { this.data[(this.n + id) * 4] = m; }
  setStructure(id, s) {
    const d = this.data, k = id * 4;
    d[k] = SYS[s.system]?.index ?? 0;
    d[k + 1] = typeof s.level === 'number' ? s.level : -1;
    d[k + 2] = 1;
    d[k + 3] = 0;
  }
  set(id, { vis, hi, level } = {}) {
    const k = id * 4;
    if (vis !== undefined) this.data[k + 2] = vis;
    if (hi !== undefined) this.data[k + 3] = hi;
    if (level !== undefined) this.data[k + 1] = level;
  }
  get(id) { const k = id * 4; return { sys: this.data[k], level: this.data[k + 1], vis: this.data[k + 2], hi: this.data[k + 3] }; }
  commit() { this.tex.needsUpdate = true; }
}

// ---------------------------------------------------------------- materiał atlasu (MeshStandardMaterial + łatka shadera)
const paletteUniform = palette.systems.map((s) => lin(s.color));

export function makeAtlasMaterial(state, { role, ctx, dimMix, opacity = 1 }) {
  const skin = role === 'skin';
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: skin ? 0.6 : 0.68, metalness: 0,
    transparent: skin, opacity, depthWrite: !skin, side: skin ? THREE.FrontSide : THREE.DoubleSide,
  });
  const u = {
    uStateTex: { value: state.tex },
    uState: { value: 0 },            // 0 = spoczynek, 1 = sprint (przenikanie = jedna liczba)
    uPalette: { value: paletteUniform },
    uCtx: { value: ctx.clone() },
    uDimMix: { value: dimMix },
    uRole: { value: role === 'ctx_bone' ? 1 : skin ? 2 : 0 },
    uLayerVis: { value: 1 },          // widoczność całej warstwy (dithering, bez sortowania)
    uTime: { value: 0 },
    uEmiMin: { value: palette.emission.min }, uEmiMax: { value: palette.emission.max }, uEmiLo: { value: palette.emission.minLevel },
  };
  mat.userData.u = u;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float _id;\nvarying float vId;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvId = _id;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform sampler2D uStateTex; uniform float uState; uniform vec3 uPalette[${paletteUniform.length}];
        uniform vec3 uCtx; uniform float uDimMix; uniform int uRole; uniform float uLayerVis; uniform float uTime;
        uniform float uEmiMin, uEmiMax, uEmiLo;
        varying float vId;
        float bayer4(vec2 p){ ivec2 q = ivec2(mod(p, 4.)); int i = q.x + q.y*4;
          float m[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.); return (m[i]+.5)/16.; }
        float emiFor(float lv){ if (lv < uEmiLo) return 0.; return uEmiMin + (uEmiMax-uEmiMin)*clamp((lv-uEmiLo)/max(1e-4,1.-uEmiLo),0.,1.); }`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        vec4 st = texelFetch(uStateTex, ivec2(int(vId + .5), 0), 0);
        float own = texelFetch(uStateTex, ivec2(int(vId + .5), 1), 0).r;
        float S = own < -.5 ? uState : own;
        float vis = st.b * uLayerVis;
        if (uRole != 2 && vis < .999 && vis <= bayer4(gl_FragCoord.xy)) discard; // wygaszanie przez dithering
        if (uRole == 2 && vis < .01) discard;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec3 sysCol = uPalette[int(st.r + .5)];
        float lv = st.g;
        vec3 restC = mix(uCtx, sysCol, uDimMix);
        float tS = lv < 0. ? uDimMix : max(${REST_MIX.toFixed(2)}, lv);
        vec3 sprintC = mix(uCtx, sysCol, tS);
        vec3 baseC = uRole == 0 ? mix(restC, sprintC, S) : uCtx;
        float hi = st.a * (.55 + .45*sin(uTime*3.9));
        diffuseColor.rgb = mix(baseC, sysCol*1.15 + .08, hi*.55);
        if (uRole == 2) diffuseColor.a *= vis;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float emi = (uRole == 0 && lv >= 0.) ? emiFor(lv) * S : 0.;
        totalEmissiveRadiance = sysCol * emi + sysCol * hi * .35;`);
  };
  mat.customProgramCacheKey = () => 'atlas-' + role;
  return mat;
}

/** Ustawia stan (0 spoczynek .. 1 sprint) na wszystkich warstwach plików. */
export function setStateMix(files, t) {
  for (const f of files) for (const m of Object.values(f.layers)) m.material.userData.u.uState.value = t;
}
export function tickMaterials(files, time) {
  for (const f of files) for (const m of Object.values(f.layers)) m.material.userData.u.uTime.value = time;
}

// ---------------------------------------------------------------- strzałki przepływu po torach 3D (flows3d.json)
/**
 * Rura wzdłuż toru w metrach z przesuwanymi „grotami”. Zmienna: kierunek i prędkość przepływu.
 * speed: 3 stopnie jakościowe (ilustracja, model §3.1), nie liczba.
 */
export function makeFlow(points, kind, { radius = 0.0055, speed = 1, dash = 0.085 } = {}) {
  const pts = points.map(za);
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const len = curve.getLength();
  const geo = new THREE.TubeGeometry(curve, Math.max(24, Math.round(len / 0.01)), radius, 6, false);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color(FLOW_COLOR[kind] || '#ffffff') }, uTime: { value: 0 }, uSpeed: { value: speed },
      uOn: { value: 0 }, uLen: { value: len }, uDash: { value: dash } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform vec3 uColor; uniform float uTime, uSpeed, uOn, uLen, uDash; varying vec2 vUv;
      void main(){
        float s = vUv.x*uLen/uDash - uTime*uSpeed*2.2;
        float f = fract(s);
        float head = smoothstep(.35,.85,f)*step(f,.9);      // grot: jaśnieje ku przodowi, ostro ucięty, potem przerwa
        float a = (.1 + .9*head) * uOn;
        gl_FragColor = vec4(mix(uColor, vec3(1.), .45*head), a);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 20;
  mesh.userData.curve = curve;
  mesh.userData.kind = kind;
  return mesh;
}

// ---------------------------------------------------------------- podpisy HTML z liniami (gramatyka AtlasPlate)
/**
 * items: [{ id, pos: Vector3, name, text, color }]. Podpis stoi w kolumnie po stronie kotwicy (lewa/prawa połowa ekranu),
 * linia 1 px do kropki na kotwicy. fade 0-1: widoczność całości (np. tylko przy widoku kluczowym).
 */
export function createLabels(host) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'lbl-svg');
  const layer = document.createElement('div');
  layer.className = 'lbl-layer';
  host.append(svg, layer);
  let items = [], els = new Map();
  const v = new THREE.Vector3();
  return {
    set(newItems) {
      items = newItems;
      layer.innerHTML = ''; svg.innerHTML = ''; els = new Map();
      for (const it of items) {
        const d = document.createElement('div');
        d.className = 'lbl';
        d.innerHTML = `<b>${it.name}</b>${it.text ? `<span style="color:${it.color}">${it.text}</span>` : ''}`;
        layer.append(d);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        line.setAttribute('stroke', it.color); line.setAttribute('fill', 'none'); line.setAttribute('stroke-width', '1');
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('r', '4.5'); dot.setAttribute('fill', 'none'); dot.setAttribute('stroke', '#fff'); dot.setAttribute('stroke-width', '1.5');
        svg.append(line, dot);
        els.set(it, { d, line, dot });
      }
    },
    update(camera, fade = 1) {
      const W = host.clientWidth, H = host.clientHeight;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      layer.style.opacity = svg.style.opacity = String(fade);
      if (fade <= 0.01) return;
      const proj = items.map((it) => {
        v.copy(it.pos).project(camera);
        return { it, x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, ok: v.z < 1 };
      });
      const cx = W / 2;
      for (const side of [-1, 1]) {
        const col = proj.filter((p) => p.ok && (p.x < cx) === (side < 0)).sort((a, b) => a.y - b.y);
        let last = -1e9;
        const off = Math.min(W * 0.14, host.labelOffset ?? 200); // tuż obok sylwetki, nie pod panelami bocznymi
        const colX = side < 0 ? Math.max(16, cx - off) : Math.min(W - 16, cx + off);
        for (const p of col) {
          const { d, line, dot } = els.get(p.it);
          const h = d.offsetHeight || 40;
          const y = Math.max(p.y - h / 2, last + 6);
          last = y + h;
          d.style.display = 'block';
          d.style.top = y + 'px';
          d.style.textAlign = side < 0 ? 'right' : 'left';
          d.style.left = side < 0 ? '' : colX + 8 + 'px';
          d.style.right = side < 0 ? W - colX + 8 + 'px' : '';
          const ty = y + 12;
          line.setAttribute('points', `${colX},${ty} ${p.x},${p.y}`);
          dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y);
          line.style.display = dot.style.display = '';
        }
      }
      for (const p of proj) if (!p.ok) { const e = els.get(p.it); e.d.style.display = 'none'; e.line.style.display = e.dot.style.display = 'none'; }
    },
  };
}

// ---------------------------------------------------------------- kamera po szynie (obrót tylko poziomy, model §3.3)
/** Ujęcie: { az (stopnie, 0 = przód), target [x,y,z] three, dist }. Przejścia: ease-in-out, czas w s. */
export class RailCamera {
  constructor(camera, shot) { this.camera = camera; this.cur = { ...shot, target: [...shot.target] }; this.anim = null; this.apply(); }
  apply() {
    const { az, target, dist } = this.cur, r = (az * Math.PI) / 180;
    this.camera.position.set(target[0] + Math.sin(r) * dist, target[1], target[2] + Math.cos(r) * dist);
    this.camera.lookAt(target[0], target[1], target[2]);
  }
  go(shot, dur = 1.2) {
    const from = { ...this.cur, target: [...this.cur.target] };
    let to = { ...this.cur, ...shot, target: shot.target ? [...shot.target] : [...this.cur.target] };
    let d = ((to.az - from.az) % 360 + 540) % 360 - 180; // najkrótsza droga po okręgu
    to.az = from.az + d;
    this.anim = { from, to, t: 0, dur: Math.max(0.01, dur) };
  }
  update(dt) {
    if (!this.anim) return false;
    const a = this.anim;
    a.t = Math.min(1, a.t + dt / a.dur);
    const e = a.t < 0.5 ? 4 * a.t ** 3 : 1 - (-2 * a.t + 2) ** 3 / 2;
    this.cur.az = a.from.az + (a.to.az - a.from.az) * e;
    this.cur.dist = a.from.dist + (a.to.dist - a.from.dist) * e;
    this.cur.target = a.from.target.map((x, i) => x + (a.to.target[i] - x) * e);
    if (a.t >= 1) this.anim = null;
    this.apply();
    return true;
  }
}

/** Odległość kamery, przy której wysokość h (m) wypełnia kadr. */
export const fitDist = (camera, h) => h / 2 / Math.tan((camera.fov * Math.PI) / 360);

// ---------------------------------------------------------------- pomiar FPS i rysowania (do PROPOZYCJE_3D.md)
export function createStats(renderer) {
  const el = document.createElement('div');
  el.className = 'stats';
  document.body.append(el);
  let frames = 0, last = performance.now(), fps = 0;
  const out = { fps: 0, calls: 0, tris: 0, el };
  window.__atlasStats = out;
  out.tick = () => {
    frames++;
    const now = performance.now();
    if (now - last >= 1000) {
      fps = (frames * 1000) / (now - last); frames = 0; last = now;
      const i = renderer.info;
      Object.assign(out, { fps: Math.round(fps), calls: i.render.calls, tris: i.render.triangles, mb: +(downloaded.bytes / 1e6).toFixed(1) });
      el.textContent = `${out.fps} FPS · ${out.calls} wywołań · ${(out.tris / 1e6).toFixed(2)} mln tr. · pobrano ${out.mb} MB`;
    }
  };
  return out;
}

/** Wszystkie siatki warstw jako lista (do raycastu i ukrywania). */
export const allMeshes = (files) => files.flatMap((f) => Object.values(f.layers));

/** Struktura pod kursorem: { file, s (wpis tabeli ID), point } albo null. */
export function pick(raycaster, files) {
  const hits = raycaster.intersectObjects(allMeshes(files).filter((m) => m.visible && m.userData.layer !== 'skin'), false);
  for (const h of hits) {
    const f = files.find((x) => x.name === h.object.userData.file);
    const id = Math.round(h.object.geometry.attributes._id.getX(h.face.a));
    const st = f.state.get(id);
    if (st.vis * h.object.material.userData.u.uLayerVis.value < 0.5) continue;
    return { file: f, s: f.byId.get(id), point: h.point };
  }
  return null;
}

// ---------------------------------------------------------------- treść plansz (tylko odczyt)
/** Podpisy planszy z jej pliku .ts: tylko statusy checked_agent i anatomy (bez disputed/draft), z filtrem poziomu. */
export function plateLabels(plate, anchorsJson, view, state, tier = 'primary') {
  const a3 = anchorsJson.views[view]?.anchors3d || {};
  const sys = palette.systems.find((s) => s.plate === plate.id);
  return plate.labels
    .filter((l) => l.view === view && a3[l.anchor])
    .filter((l) => tier !== 'primary' || (l.tier ?? 'primary') === 'primary')
    .map((l) => {
      const st = l.roleStatus?.[state];
      const ok = st === 'checked_agent' || st === 'anatomy';
      return { id: `${plate.id}/${l.anchor}`, anchor: l.anchor, pos: za(a3[l.anchor]), name: l.namePl,
        text: ok ? l.role?.[state] ?? '' : '', color: sys?.light ?? '#ddd', status: st };
    });
}
