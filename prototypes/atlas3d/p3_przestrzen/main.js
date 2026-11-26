// P3 „Pełna przestrzeń”: swobodna eksploracja (wolna orbita, przybliżenie do kursora, przesuwanie), warstwy z jednym
// suwakiem krycia (jak Zygote), wybór dowolnej struktury kliknięciem i przelot do wnętrza wzdłuż tętnicy (tor flows3d).
// UWAGA: wykracza poza decyzję użytkownika z §7 modelu (obrót poziomy + widoki kluczowe). Tylko do porównania.
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  THREE, createViewer, loadAtlasFile, setStateMix, tickMaterials, makeFlow, createLabels, createStats, pick, SYS, za,
} from '../shared/engine.js';
import krwF from '../../../public/atlas/krwionosny/flows3d.json';

const $ = (s) => document.querySelector(s);
const stage = $('#stage');
const { renderer, scene, camera } = createViewer(stage, { fov: 35, near: 0.002, far: 40 });
const stats = createStats(renderer);
const labels = createLabels(document.body);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.95, 0);
controls.enableDamping = true;
controls.zoomToCursor = true;
controls.minDistance = 0.03;
controls.maxDistance = 7;
const HOME = () => { camera.position.set(0.9, 1.25, 3.1); controls.target.set(0, 0.95, 0); controls.update(); };
HOME();

const LAYERS = [
  ['za_skeleton', 'bone', 'Kości', 'bone', true], ['za_skeleton', 'skin', 'Sylwetka', 'skin', true],
  ['za_muscles', 'muscle', 'Mięśnie', 'muscle', true], ['za_vessels', 'artery', 'Tętnice', 'artery', true],
  ['za_vessels', 'vein', 'Żyły', 'vein', true], ['za_vessels', 'heart', 'Serce', 'artery', true],
  ['za_nervous', 'nerve', 'Nerwy', 'nerve', true], ['za_nervous', 'nervecore', 'Rdzeń i zwoje', 'nerve', true],
  ['za_nervous', 'brain', 'Mózg', 'brain', true], ['za_viscera', 'viscera', 'Trzewia', 'digest', true],
  ['hra_kidney', 'kidney', 'Nerki (HuBMAP)', 'urinary', true],
];
let files = [], stateMix = 0, stateTarget = 0, selected = null, flight = null;
const flowArt = makeFlow(krwF.flows.find((f) => f.id === 'artery_leg').points, 'artery');
const flowVein = makeFlow(krwF.flows.find((f) => f.id === 'vein_leg').points, 'vein');
scene.add(flowArt, flowVein);

$('#state').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  $('#state').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  stateTarget = b.dataset.v === 'sprint' ? 1 : 0;
  $('#chipR').textContent = stateTarget ? 'SPRINT · KONIEC 45 S PRACY' : 'SPOCZYNEK';
});
$('#opacity').addEventListener('input', (e) => {
  const a = +e.target.value;
  for (const f of files) for (const [ln, m] of Object.entries(f.layers)) {
    if (!['bone', 'muscle'].includes(ln)) continue;
    const tr = a < 0.999;
    if (tr !== m.material.transparent) { m.material.transparent = tr; m.material.depthWrite = !tr; m.material.needsUpdate = true; }
    m.material.opacity = a;
  }
});
$('#reset').onclick = () => { stopFlight(); HOME(); };

// ------------------------------------------------ wybór struktury
let down = null;
renderer.domElement.addEventListener('pointerdown', (e) => (down = [e.clientX, e.clientY]));
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 4 || flight) return;
  const rc = new THREE.Raycaster();
  const r = renderer.domElement.getBoundingClientRect();
  rc.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
  const t0 = performance.now();
  const hit = pick(rc, files);
  const ms = Math.round(performance.now() - t0);
  if (selected) { selected.file.state.set(selected.s.id, { hi: 0 }); selected.file.state.commit(); }
  selected = hit;
  if (!hit) { $('#info').style.display = 'none'; labels.set([]); return; }
  hit.file.state.set(hit.s.id, { hi: 1 }); hit.file.state.commit();
  const sys = SYS[hit.s.system];
  $('#info').style.display = 'block';
  $('#info').innerHTML = `<div class="cap">Struktura</div><h3 style="margin:4px 0">${hit.s.name}</h3>
    <div><i style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${sys.color}"></i> ${sys.namePl}</div>
    <div class="hint" style="margin-top:8px">ID siatki: <code>${hit.s.key}</code><br>Poziom pracy w sprincie (ilustracja): ${hit.s.level}<br>
    Nazwa z Z-Anatomy (angielska/łacińska). Polskie nazwy dopiero po etapie E1 (structures.json).<br>Wybór: ${ms} ms (raycast bez BVH).</div>
    <div class="hint" style="margin-top:6px">${hit.file.license}</div>`;
  labels.set([{ id: 'pick', pos: hit.point, name: hit.s.name, text: sys.namePl, color: sys.light }]);
});

// ------------------------------------------------ przelot wzdłuż tętnicy (aorta → t. piszczelowa przednia)
const curve = flowArt.userData.curve;
$('#flyBtn').onclick = () => {
  flight = { u: 0, dur: 24 };
  controls.enabled = false;
  flowArt.visible = flowVein.visible = false;
  camera.fov = 70; camera.updateProjectionMatrix();
  $('#fly').style.display = 'block';
  labels.set([]);
};
function stopFlight() {
  if (!flight) return;
  flight = null; controls.enabled = true; flowArt.visible = flowVein.visible = true;
  camera.fov = 35; camera.updateProjectionMatrix();
  $('#fly').style.display = 'none';
}
$('#flyStop').onclick = () => { stopFlight(); HOME(); };
const TRACK = krwF.flows.find((f) => f.id === 'artery_leg').labelPl;

// ------------------------------------------------ start
(async () => {
  files = await Promise.all(['za_skeleton', 'za_muscles', 'za_vessels', 'za_nervous', 'za_viscera', 'hra_kidney'].map((n) => loadAtlasFile(n)));
  for (const f of files) scene.add(f.root);
  $('#layers').innerHTML = LAYERS.map(([f, l, name, sys, on], i) =>
    `<label><input type="checkbox" data-i="${i}" ${on ? 'checked' : ''}/><i style="background:${SYS[sys].color}"></i>${name}</label>`).join('');
  $('#layers').addEventListener('change', (e) => {
    const [f, l] = LAYERS[+e.target.dataset.i];
    files.find((x) => x.name === f).layers[l].visible = e.target.checked;
  });
  // start: mięśnie wyłączone, żeby było widać naczynia i trzewia
  const mi = LAYERS.findIndex((x) => x[1] === 'muscle');
  $(`#layers input[data-i="${mi}"]`).checked = false;
  files.find((x) => x.name === 'za_muscles').layers.muscle.visible = false;
  $('#loading').style.opacity = 0; setTimeout(() => $('#loading').remove(), 600);
  window.__p3 = { files, camera, controls, renderer, fly: () => $('#flyBtn').click(), setFlight: (u) => flight && (flight.u = u) };
})();

// ------------------------------------------------ pętla
const clock = new THREE.Clock();
const look = new THREE.Vector3();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1), t = clock.elapsedTime;
  stateMix += Math.sign(stateTarget - stateMix) * Math.min(Math.abs(stateTarget - stateMix), dt / 0.9);
  setStateMix(files, stateMix);
  tickMaterials(files, t);
  // strzałki rysowane „na wierzchu” (jak na planszy) gasną z bliska, gdzie zamieniały się w szerokie pasy
  const near = THREE.MathUtils.smoothstep(camera.position.distanceTo(controls.target), 0.7, 1.4);
  for (const fl of [flowArt, flowVein]) { const u = fl.material.uniforms; u.uTime.value = t; u.uOn.value = (0.35 + 0.65 * stateMix) * near; u.uSpeed.value = 0.35 + 0.65 * stateMix; }
  if (flight) {
    flight.u = Math.min(0.985, flight.u + dt / flight.dur);
    const p = curve.getPointAt(flight.u);
    curve.getPointAt(Math.min(1, flight.u + 0.015), look);
    camera.position.copy(p);
    camera.lookAt(look);
    // odległość liczona z geometrii toru (nie fakt fizjologiczny); nazwy odcinków z etykiety toru w flows3d.json
    $('#flyTxt').textContent = `${TRACK} · ${Math.round(flight.u * curve.getLength() * 100)} cm od początku toru`;
    if (flight.u >= 0.985) stopFlight();
  } else controls.update();
  labels.update(camera, flight ? 0 : 1);
  renderer.render(scene, camera);
  stats.tick();
});
