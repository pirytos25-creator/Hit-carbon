// Test techniczny M2: serce HuBMAP (CC BY 4.0) w przekroju, skurcz przez kształty z geometrii, krwinki 3D na torach z promieniem przekroju.
// Poziomy jakości: ?q=low (Intel UHD, cel >= 50 FPS) | ?q=high (mocna karta). Profile wyglądu: ?look=atlas (bez tone mappingu) | ?look=film (AgX).
// Zastawki: ?valves=a (stan kolorem) | ?valves=b (ruch płatków, morph). Wielkość ruchu, tempo i rozmiar krwinek: POGLĄDOWE (do bramki faktów).
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const Q = new URLSearchParams(location.search);
const TIER = Q.get('q') === 'high' ? 'high' : 'low';
const LOOK = Q.get('look') === 'film' ? 'film' : 'atlas';
const VALVES = Q.get('valves') === 'b' ? 'b' : 'a';
const CUT = Q.get('cut') !== '0';
const M1 = Q.get('m1') === '1'; // preset klatki docelowej (a) Reżysera
const WALLS = M1 || Q.get('walls') === 'tissue' ? 'tissue' : 'blood'; // tissue = jak klatka M1 Reżysera (ściana w barwie mięśnia, barwę niesie krew)
const GLASS = Q.get('glass') === '1', HASH = Q.get('glass') === '2'; // 2 = dithering (alphaHash, zapis głębi) jak w E3                           // półprzezroczyste ściany naczyń (koszt do zmierzenia w M2)
const TIERS = {
  low: { dpr: 1, aa: false, rbc: 1500, lathe: [10, 14], physical: false, env: false },
  high: { dpr: 1.5, aa: true, rbc: 3500, lathe: [18, 24], physical: true, env: true },
};
const T = TIERS[TIER];
if (Q.get('n')) T.rbc = +Q.get('n');

// tokeny palety (src/atlas/data/palette.json): artery / vein
const C = { artery: '#D93240', arteryLight: '#F07A84', vein: '#3E6FD8', veinLight: '#86A6EE', valve: '#EDE3D6' };
if (Q.get('m1') === '1') C.valve = '#8C8880'; // context.bone #D8D1C4 przygaszone o ok. 35%

// ------------------------------------------------------------------ pasek przełączników
const top = document.getElementById('top');
const link = (label, key, val) => {
  const u = new URLSearchParams(location.search); u.set(key, val);
  const on = (Q.get(key) || { q: 'low', look: 'atlas', valves: 'a', cut: '1', walls: 'blood', glass: '0' }[key]) === val;
  return `<a class="chip${on ? ' on' : ''}" href="?${u}">${label}</a>`;
};
top.innerHTML = [link('Poziom: niski (UHD)', 'q', 'low'), link('Poziom: wysoki', 'q', 'high'),
  link('Wygląd: atlas', 'look', 'atlas'), link('Wygląd: film (AgX)', 'look', 'film'),
  link('Zastawki A', 'valves', 'a'), link('Zastawki B', 'valves', 'b'),
  link('Przekrój', 'cut', '1'), link('Całość', 'cut', '0'), link('Ściany: krew', 'walls', 'blood'), link('Ściany: mięsień', 'walls', 'tissue'), link('Naczynia: szkło', 'glass', '1'), link('Naczynia: dithering', 'glass', '2'), link('Preset M1', 'm1', '1'),
  '<span class="note">Spacja: pauza · S: spoczynek/sprint · O: obrót</span>'].join('');

// ------------------------------------------------------------------ renderer i scena
const app = document.getElementById('app');
const AA = Q.get('aa') ? Q.get('aa') !== '0' : T.aa; // MSAA na UHD kosztuje ok. 12 ms przy 1440 px (pomiar M2)
const renderer = new THREE.WebGLRenderer({ antialias: AA, alpha: true, stencil: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(T.dpr);
renderer.setSize(innerWidth, innerHeight);
renderer.localClippingEnabled = true;
renderer.toneMapping = LOOK === 'film' ? THREE.AgXToneMapping : THREE.NoToneMapping;
renderer.toneMappingExposure = 1.05;
app.appendChild(renderer.domElement);
const gl = renderer.getContext();
const dbg = gl.getExtension('WEBGL_debug_renderer_info');
const GPU = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'nieznany';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(M1 ? 16 : 26, innerWidth / innerHeight, 0.01, 10); // M1: ok. 85 mm (16° w pionie)
const target = new THREE.Vector3(0.004, 0.006, 0);
let camDist = M1 ? 0.62 : 0.44;
scene.add(new THREE.HemisphereLight('#dfe8ff', '#1a2238', 0.7));
const key = new THREE.DirectionalLight('#fff4e8', 2.6); key.position.set(-0.6, 0.8, 1.0); scene.add(key);
const fill = new THREE.DirectionalLight('#dde6ff', 0.9); fill.position.set(0.9, 0.1, 0.6); scene.add(fill);
const rim = new THREE.DirectionalLight('#cfe0ff', 1.6); rim.position.set(0.2, 0.7, -1.0); scene.add(rim);
if (T.env) {
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;
}

// płaszczyzna przekroju: zostaje część za płaszczyzną (z <= CUTZ), przód usunięty
const CUTZ = Q.get('cz') ? +Q.get('cz') : -0.004; // jak klatka koncepcyjna serce_2 (4 mm za środkiem)
const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), CUTZ);
const clip = CUT ? [plane] : [];

function tissueMat(extra = {}) {
  const base = { vertexColors: true, roughness: 0.6, metalness: 0, clippingPlanes: clip, ...extra };
  return T.physical
    ? new THREE.MeshPhysicalMaterial({ ...base, roughness: 0.46, sheen: 0.55, sheenRoughness: 0.5, sheenColor: new THREE.Color('#ffd9d9'),
      clearcoat: 0.3, clearcoatRoughness: 0.35 })
    : new THREE.MeshStandardMaterial(base);
}

// ------------------------------------------------------------------ geometria: scalanie z przekształceniem do float i świata
function attrToFloat(attr) {
  const n = attr.count, s = attr.itemSize, out = new Float32Array(n * s);
  for (let i = 0; i < n; i++) for (let k = 0; k < s; k++) out[i * s + k] = attr.getComponent(i, k);
  return out;
}
const LEFT = ['left_cardiac_atrium', 'heart_left_ventricle', 'interventricular_septum', 'papillary_muscle_of_heart_anterolateral', 'papillary_muscle_of_heart_posteromedial'];
const RIGHT = ['right_cardiac_atrium', 'heart_right_ventricle', 'papillary_muscle_of_heart_anterior', 'papillary_muscle_of_heart_posterior', 'papillary_muscle_of_heart_medial'];
const MORPH_SLOT = { Atrial_Systole: 0, Ventricular_Systole: 1, Valve_Open: 0 };

function merge(parts, nMorph, colorOf) {
  let nv = 0, ni = 0;
  for (const p of parts) { nv += p.geometry.attributes.position.count; ni += p.geometry.index.count; }
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), idx = new Uint32Array(ni);
  const morphs = Array.from({ length: nMorph }, () => new Float32Array(nv * 3));
  let vo = 0, io = 0;
  const v = new THREE.Vector3(), nm = new THREE.Matrix3(), lin = new THREE.Matrix3();
  for (const p of parts) {
    p.updateWorldMatrix(true, false);
    const M = p.matrixWorld; nm.getNormalMatrix(M); lin.setFromMatrix4(M);
    const g = p.geometry, P = attrToFloat(g.attributes.position), N = attrToFloat(g.attributes.normal);
    const ao = g.attributes.color ? attrToFloat(g.attributes.color) : null, aoS = g.attributes.color ? g.attributes.color.itemSize : 0;
    const c = new THREE.Color(colorOf(p.name));
    const n = g.attributes.position.count;
    for (let i = 0; i < n; i++) {
      v.set(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]).applyMatrix4(M); pos.set([v.x, v.y, v.z], (vo + i) * 3);
      v.set(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]).applyMatrix3(nm).normalize(); nor.set([v.x, v.y, v.z], (vo + i) * 3);
      const a = ao ? 0.35 + 0.65 * ao[i * aoS] : 1; // AO wypieczone (Cycles) -> przyciemnienie zagłębień
      col.set([c.r * a, c.g * a, c.b * a], (vo + i) * 3);
    }
    const names = (p.userData.targetNames || p.parent?.userData?.targetNames || []);
    (g.morphAttributes.position || []).forEach((ma, k) => {
      const slot = MORPH_SLOT[names[k]] ?? k; if (slot >= nMorph) return;
      const D = attrToFloat(ma);
      for (let i = 0; i < n; i++) { v.set(D[i * 3], D[i * 3 + 1], D[i * 3 + 2]).applyMatrix3(lin); morphs[slot].set([v.x, v.y, v.z], (vo + i) * 3); }
    });
    const I = g.index.array; for (let i = 0; i < I.length; i++) idx[io + i] = I[i] + vo;
    vo += n; io += I.length;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  if (nMorph) { geo.morphAttributes.position = morphs.map((m) => new THREE.BufferAttribute(m, 3)); geo.morphTargetsRelative = true; }
  geo.computeBoundingSphere();
  return geo;
}

function vesselColor(name) {
  const n = name.toLowerCase();
  if (n.includes('pulmonary_vein')) return C.artery;
  if (n.includes('pulmonary_trunk') || n.includes('pulmonary_artery')) return C.vein;
  if (n.includes('vein') || n.includes('cava') || n.includes('sinus')) return C.vein;
  return C.artery;
}

// ------------------------------------------------------------------ stencil: zalanie przekroju (ściana ma grubość)
function capGroup(mesh, capHex, order) {
  const mk = (side, op) => {
    const m = new THREE.MeshBasicMaterial({ side, clippingPlanes: clip, depthWrite: false, depthTest: false, colorWrite: false,
      stencilWrite: true, stencilFunc: THREE.AlwaysStencilFunc, stencilFail: op, stencilZFail: op, stencilZPass: op });
    const s = new THREE.Mesh(mesh.geometry, m);
    s.morphTargetInfluences = mesh.morphTargetInfluences; s.renderOrder = order; s.frustumCulled = false;
    return s;
  };
  const back = mk(THREE.BackSide, THREE.IncrementWrapStencilOp), front = mk(THREE.FrontSide, THREE.DecrementWrapStencilOp);
  const capMat = T.physical ? new THREE.MeshPhysicalMaterial({ color: capHex, roughness: 0.7, sheen: 0.3 }) : new THREE.MeshStandardMaterial({ color: capHex, roughness: 0.75 });
  Object.assign(capMat, { stencilWrite: true, stencilRef: 0, stencilFunc: THREE.NotEqualStencilFunc,
    stencilFail: THREE.ReplaceStencilOp, stencilZFail: THREE.ReplaceStencilOp, stencilZPass: THREE.ReplaceStencilOp });
  const cap = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), capMat);
  cap.position.set(0, 0, CUTZ); cap.renderOrder = order + 0.1;
  cap.onAfterRender = (r) => r.clearStencil();
  return [back, front, cap];
}

// ------------------------------------------------------------------ krwinki 3D (kształt Evansa-Funga, jak w filmie: MolecularSimulation.tsx)
function rbcGeometry(radius, steps, segs) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * Math.PI, s = Math.sin(th), u2 = s * s;
    pts.push(new THREE.Vector2(radius * s, 0.52 * radius * Math.cos(th) * (0.207 + 2.003 * u2 - 1.123 * u2 * u2)));
  }
  const g = new THREE.LatheGeometry(pts, segs); g.computeVertexNormals(); return g;
}

// ------------------------------------------------------------------ cykl serca (tempo poglądowe)
let bpm = 72, sprint = false, paused = false, orbit = true, tSim = 0;
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function cycle(phi) {
  const atr = phi < 0.12 ? Math.sin(Math.PI * phi / 0.12) : 0;
  const ven = phi >= 0.12 && phi < 0.47 ? Math.sin(Math.PI * (phi - 0.12) / 0.35) : 0;
  const av = 1 - sm(0.10, 0.14, phi) + sm(0.50, 0.55, phi);           // otwarte w rozkurczu i skurczu przedsionków
  const sl = sm(0.15, 0.19, phi) * (1 - sm(0.42, 0.46, phi));         // otwarte w fazie wyrzutu
  const label = phi < 0.12 ? 'Skurcz przedsionków: krew przez zastawki przedsionkowo-komorowe do komór'
    : phi < 0.47 ? 'Skurcz komór: zastawki przedsionkowo-komorowe zamknięte, półksiężycowate otwarte' : 'Rozkurcz: komory napełniają się';
  return { atr, ven, av, sl, label };
}

// ------------------------------------------------------------------ wczytanie
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const [gltf, PJ] = await Promise.all([
  loader.loadAsync('./_assets/heart_m2_opt.glb'),
  fetch('./_assets/heart_m2_paths.json').then((r) => r.json()),
]);
const byName = {};
gltf.scene.traverse((o) => { if (o.isMesh) { const k = (o.name || o.parent?.name || '').replace(/^VH_M_/, '').replace(/_\d+$/, ''); byName[k] = o; o.userData.targetNames = o.userData.targetNames || o.parent?.userData?.targetNames; } });
gltf.scene.updateMatrixWorld(true);
const pick = (list) => list.map((k) => byName[k]).filter(Boolean);
const heartNames = [...LEFT, ...RIGHT, 'mitral_valve', 'tricuspid_valve', 'aortic_valve', 'pulmonary_valve'];

const MYO = '#992E38'; // karta Reżysera: artery + #4a2a2e 55/45 // mięsień sercowy w odcieniu artery (parametr karty Reżysera)
const mL = new THREE.Mesh(merge(pick(LEFT), 2, () => (WALLS === 'tissue' ? MYO : C.artery)), tissueMat());
const mR = new THREE.Mesh(merge(pick(RIGHT), 2, () => (WALLS === 'tissue' ? MYO : C.vein)), tissueMat());
const valveMat = () => tissueMat({ side: THREE.DoubleSide });
const mAV = new THREE.Mesh(merge(pick(['mitral_valve', 'tricuspid_valve']), 1, () => C.valve), valveMat());
const mSL = new THREE.Mesh(merge(pick(['aortic_valve', 'pulmonary_valve']), 1, () => C.valve), valveMat());
const vesselParts = Object.entries(byName).filter(([k]) => !heartNames.includes(k)).map(([, o]) => o);
const mV = new THREE.Mesh(merge(vesselParts, 0, (n) => vesselColor(n)), tissueMat(GLASS ? { side: THREE.DoubleSide, transparent: true, opacity: 0.35, depthWrite: false } : HASH ? { side: THREE.DoubleSide, alphaHash: true, opacity: 0.4 } : { side: THREE.DoubleSide }));
if (GLASS) mV.renderOrder = 8;
for (const m of [mL, mR, mAV, mSL, mV]) { m.renderOrder = 6; scene.add(m); }
if (CUT) for (const o of [...capGroup(mL, WALLS === 'tissue' ? '#B44E56' : C.arteryLight, 1), ...capGroup(mR, WALLS === 'tissue' ? '#B44E56' : C.veinLight, 2)]) scene.add(o);

// tory
function radiusAt(P, u) {
  const f = P.fracs; let i = 1; while (i < f.length - 1 && f[i] < u) i++;
  const t = (u - f[i - 1]) / Math.max(1e-6, f[i] - f[i - 1]);
  return THREE.MathUtils.lerp(P.pts[i - 1].r, P.pts[i].r, Math.min(1, Math.max(0, t)));
}
const dedupe = (pts) => pts.filter((q, i) => i === 0 || Math.hypot(q.p[0] - pts[i - 1].p[0], q.p[1] - pts[i - 1].p[1], q.p[2] - pts[i - 1].p[2]) > 0.002);
const paths = Object.entries(PJ.paths).map(([name, raw]) => {
  const pts = dedupe(raw);
  let curve = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q.p)), false, 'centripetal');
  if (!Number.isFinite(curve.getLength())) curve = new THREE.CatmullRomCurve3(curve.points, false, 'catmullrom', 0.5);
  const n = pts.length, iAV = pts.findIndex((q) => q.seg === 'valve_av'), iSL = pts.findIndex((q) => q.seg === 'valve_sl');
  // ułamek długości łuku dla każdego punktu toru
  const L = curve.getLength(), fr = [0]; let acc = 0;
  for (let i = 1; i < n; i++) { acc += new THREE.Vector3(...pts[i].p).distanceTo(new THREE.Vector3(...pts[i - 1].p)); fr.push(acc); }
  const fracs = fr.map((x) => x / acc);
  const P = { name, curve, pts, L, fracs, uAV: fracs[iAV], uSL: fracs[iSL], left: name.startsWith('left') };
  // tablica próbek (położenie, styczna, promień): w pętli tylko interpolacja, bez liczenia krzywej
  const NS = 512; P.lut = new Float32Array(NS * 7);
  const a = new THREE.Vector3(), t = new THREE.Vector3();
  for (let i = 0; i < NS; i++) {
    const u = i / (NS - 1); curve.getPointAt(u, a); curve.getTangentAt(u, t);
    P.lut.set([a.x, a.y, a.z, t.x, t.y, t.z, radiusAt(P, u)], i * 7);
  }
  return P;
});

const RBC_R = M1 ? 0.0013 : 0.0021; // M1: średnica 2,6 mm; // 2,1 mm na ekranie: POWIĘKSZONE ok. 550x (prawdziwa krwinka ok. 7,5 µm średnicy) - poglądowe
const rbcGeo = rbcGeometry(RBC_R, ...T.lathe);
const rbcMat = T.physical
  ? new THREE.MeshPhysicalMaterial({ roughness: 0.4, sheen: 0.6, sheenColor: new THREE.Color('#ffd0d0'), clearcoat: 0.2, clippingPlanes: clip })
  : new THREE.MeshStandardMaterial({ roughness: 0.5, clippingPlanes: clip });
const rbc = new THREE.InstancedMesh(rbcGeo, rbcMat, T.rbc);
rbc.instanceMatrix.setUsage(THREE.DynamicDrawUsage); rbc.frustumCulled = false; rbc.renderOrder = 7;
scene.add(rbc);
const totalL = paths.reduce((s, p) => s + p.L, 0);
const cells = [];
for (let i = 0; i < T.rbc; i++) {
  let x = Math.random() * totalL, pi = 0; while (x > paths[pi].L && pi < paths.length - 1) { x -= paths[pi].L; pi++; }
  const ang = Math.random() * Math.PI * 2, rho = Math.sqrt(Math.random()) * 0.62;
  cells.push({ p: pi, u: Math.random(), ang, rho, spin: Math.random() * Math.PI * 2, spinV: (Math.random() - 0.5) * 6 });
  rbc.setColorAt(i, new THREE.Color(paths[pi].left ? C.artery : C.vein));
}
rbc.instanceColor.needsUpdate = true;

// ------------------------------------------------------------------ aktualizacja
const _p = new THREE.Vector3(), _t = new THREE.Vector3(), _n = new THREE.Vector3(), _b = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _m = new THREE.Matrix4(), _s = new THREE.Vector3(1, 1, 1), Z = new THREE.Vector3(0, 0, 1);
const R_REF = 0.012, V0 = 0.05;
let cy = cycle(0);
function update(dt) {
  if (!paused) tSim += dt;
  const period = 60 / (sprint ? 165 : bpm);
  const phi = (tSim % period) / period;
  cy = cycle(phi);
  const sp = 72 / (sprint ? 165 : bpm); // tempo przepływu rośnie z tętnem (poglądowo)
  mL.morphTargetInfluences[0] = mR.morphTargetInfluences[0] = cy.atr;
  mL.morphTargetInfluences[1] = mR.morphTargetInfluences[1] = cy.ven;
  if (VALVES === 'b') { mAV.morphTargetInfluences[0] = cy.av; mSL.morphTargetInfluences[0] = cy.sl; }
  else {
    mAV.morphTargetInfluences[0] = 0; mSL.morphTargetInfluences[0] = 0;
    mAV.material.color.setScalar(0.55 + 0.45 * (1 - cy.av)); mSL.material.color.setScalar(0.55 + 0.45 * (1 - cy.sl)); // zamknięta = jasna, otwarta = przygaszona
  }
  if (paused) return;
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i], P = paths[c.p];
    const f = Math.min(0.999999, Math.max(0, c.u)) * 511, i0 = f | 0, w = f - i0, A = P.lut, o0 = i0 * 7, o1 = o0 + 7;
    const r = A[o0 + 6] + (A[o1 + 6] - A[o0 + 6]) * w;
    // prędkość z przekroju: v ~ 1/r^2 (ciągłość przepływu), profil przyścienny (szybciej przy osi), faza cyklu
    let k = Math.min(3.0, Math.max(0.3, (R_REF / r) ** 2)) * (1.25 - 0.5 * c.rho * c.rho);
    if (c.u < P.uAV) k *= 0.2 + 0.8 * cy.av;                         // przed zastawką p-k: czeka, gdy zamknięta
    else if (c.u < P.uSL) k *= cy.sl > 0.1 ? 1.6 : (cy.av > 0.5 ? 0.6 : 0.04); // komora: wyrzut / napełnianie / skurcz izowolumetryczny
    else k *= 0.35 + 1.1 * cy.sl;                                     // tętnice: fala wyrzutu
    c.u += (V0 * k * dt / P.L) / sp;
    if (!(c.u >= 0)) c.u = Math.random();
    if (c.u >= 1) { c.u -= 1; c.rho = Math.sqrt(Math.random()) * 0.62; c.ang = Math.random() * Math.PI * 2; }
    const g = Math.min(0.999999, Math.max(0, c.u)) * 511, j0 = g | 0, ww = g - j0, q0 = j0 * 7, q1 = q0 + 7;
    _p.set(A[q0] + (A[q1] - A[q0]) * ww, A[q0 + 1] + (A[q1 + 1] - A[q0 + 1]) * ww, A[q0 + 2] + (A[q1 + 2] - A[q0 + 2]) * ww);
    _t.set(A[q0 + 3] + (A[q1 + 3] - A[q0 + 3]) * ww, A[q0 + 4] + (A[q1 + 4] - A[q0 + 4]) * ww, A[q0 + 5] + (A[q1 + 5] - A[q0 + 5]) * ww).normalize();
    _n.crossVectors(_t, UP); if (_n.lengthSq() < 1e-6) _n.set(1, 0, 0); _n.normalize(); _b.crossVectors(_t, _n);
    const rr = c.rho * r;
    _p.addScaledVector(_n, Math.cos(c.ang) * rr).addScaledVector(_b, Math.sin(c.ang) * rr);
    c.spin += c.spinV * dt;
    _q.setFromUnitVectors(Z, _t); _q2.setFromAxisAngle(_t, c.spin); _q.premultiply(_q2);
    _m.compose(_p, _q, _s); rbc.setMatrixAt(i, _m);
  }
  rbc.instanceMatrix.needsUpdate = true;
}

let yaw = 0;
function placeCamera(time) {
  if (orbit) yaw = Math.sin(time * 0.25) * 0.35;
  camera.position.set(target.x + Math.sin(yaw) * camDist, target.y + 0.03, target.z + Math.cos(yaw) * camDist);
  camera.lookAt(target);
}

// ------------------------------------------------------------------ pętla, HUD, pomiar
const hud = document.getElementById('hud'), phaseEl = document.getElementById('phase');
let last = performance.now(), frames = 0, fpsT = last, fps = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  update(dt); placeCamera(now / 1000);
  renderer.render(scene, camera);
  frames++;
  if (now - fpsT > 1000) {
    fps = frames * 1000 / (now - fpsT); frames = 0; fpsT = now;
    const ri = renderer.info.render;
    hud.textContent = `${fps.toFixed(0)} FPS · wywołania ${ri.calls} · trójkąty ${(ri.triangles / 1e3).toFixed(0)} tys. · krwinki ${T.rbc} · ${TIER}/${LOOK}/zastawki ${VALVES.toUpperCase()} · ${GPU.replace(/ANGLE \(|\)$/g, '').slice(0, 60)}`;
    phaseEl.textContent = (sprint ? 'SPRINT (tempo poglądowe) · ' : 'Spoczynek (tempo poglądowe) · ') + cy.label;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
addEventListener('keydown', (e) => {
  if (e.code === 'Space') { paused = !paused; e.preventDefault(); }
  if (e.key === 's' || e.key === 'S') sprint = !sprint;
  if (e.key === 'o' || e.key === 'O') orbit = !orbit;
});

// pomiar jak __atlas3dBench w E3: render + readPixels (ANGLE nie czeka na finish), niezależny od dławienia rAF
window.__m2Bench = (n = 240) => {
  const px = new Uint8Array(4), t0 = performance.now();
  for (let i = 0; i < n; i++) { update(1 / 60); placeCamera(i / 60); renderer.render(scene, camera); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); }
  const ms = (performance.now() - t0) / n, ri = renderer.info.render;
  return { tier: TIER, look: LOOK, valves: VALVES, cut: CUT, rbc: T.rbc, msPerFrame: +ms.toFixed(2), fps: +(1000 / ms).toFixed(1),
    calls: ri.calls, triangles: ri.triangles, w: renderer.domElement.width, h: renderer.domElement.height, gpu: GPU };
};
window.__m2 = { meshes: { mL, mR, mAV, mSL, mV }, src: byName, names: Object.keys(byName), counts: [mL, mR, mAV, mSL, mV].map((m) => m.geometry.attributes.position.count), setPhase: (s) => { tSim = s; }, pause: (v) => { paused = v; }, orbit: (v) => { orbit = v; }, sprint: (v) => { sprint = v; }, cam: (d, x, y, z, yw) => { camDist = d; target.set(x, y, z); if (yw !== undefined) { orbit = false; yaw = yw; } } };
window.__m2Upd = update;
window.__m2Ready = true;
