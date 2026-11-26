// P1 „Gablota”: jeden albo dwa układy w 3D, obrót tylko w poziomie z przyciąganiem do ujęć kluczowych (model §3.3 i §7).
// Stan spoczynek/sprint w shaderze (jedna liczba uState), podpisy z plansz (tylko checked_agent/anatomy), strzałki po torach flows3d.
import {
  THREE, createViewer, loadAtlasFile, setStateMix, tickMaterials, makeFlow, createLabels, RailCamera, fitDist, createStats,
  plateLabels, za,
} from '../shared/engine.js';
import { KRWIONOSNY } from '../../../src/atlas/plates/krwionosny.ts';
import { MIESNIOWY } from '../../../src/atlas/plates/miesniowy.ts';
import krwAnchors from '../../../public/atlas/krwionosny/anchors.json';
import krwFlows from '../../../public/atlas/krwionosny/flows3d.json';
import mieAnchors from '../../../public/atlas/miesniowy/anchors.json';

const $ = (s) => document.querySelector(s);
const stage = $('#stage');
const { renderer, scene, camera } = createViewer(stage);
const stats = createStats(renderer);
const labels = createLabels(document.body);

const BODY = [0, 0.9, 0];
const FULL = () => ({ target: BODY, dist: fitDist(camera, 2.05) });
const rail = new RailCamera(camera, { az: 0, ...FULL() });

const PLATES = {
  krwionosny: {
    plate: KRWIONOSNY, anchors: krwAnchors, views: { 0: 'front' },
    show: { bone: 1, skin: 1, artery: 1, vein: 1, heart: 1, muscle: 0 },
    details: [{ name: 'Serce z przodu', view: 'detail', az: 0, target: za([0.02295, 0, 1.3133]).toArray(), h: 0.36,
      hideBones: /rib|sternum|costal cartilage|xiphoid|manubrium/i }], // jak SKIP_BONES w plate_krwionosny.py
  },
  miesniowy: {
    plate: MIESNIOWY, anchors: mieAnchors, views: { 0: 'front', 180: 'back' },
    show: { bone: 1, skin: 0, artery: 0, vein: 0, heart: 0, muscle: 1 },
    details: [{ name: 'Udo z przodu', view: 'front', az: 0, anchorMean: ['rectus_femoris', 'vastus_lateralis'], h: 0.62 }],
  },
};

const ui = { sys: 'krwionosny', state: 'rest', tier: 'primary', detail: null };
let files = [], flows = [], stateMix = 0, stateTarget = 0;

function seg(id, onPick) {
  const el = $(id);
  el.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    el.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    onPick(b.dataset.v);
  });
}

function layerVisibility() {
  const show = PLATES[ui.sys].show;
  for (const f of files) for (const [ln, m] of Object.entries(f.layers)) m.visible = !!show[ln];
  for (const fl of flows) fl.visible = ui.sys === 'krwionosny';
}

function currentLabels() {
  const P = PLATES[ui.sys];
  const view = ui.detail ? ui.detail.view : P.views[Math.round(((rail.cur.az % 360) + 360) % 360 / 90) * 90 % 360];
  if (!view) return [];
  return plateLabels(P.plate, P.anchors, view, ui.state, ui.tier === 'primary' ? 'primary' : 'all');
}
let labelKey = '';
function refreshLabels(force) {
  const items = currentLabels();
  const key = ui.sys + ui.state + ui.tier + items.map((i) => i.id).join();
  if (force || key !== labelKey) { labels.set(items); labelKey = key; }
}

function refreshSummary() {
  const p = PLATES[ui.sys].plate;
  const ok = p.summaryStatus?.[ui.state] === 'checked_agent';
  $('#summary').innerHTML = `<div class="cap">Plansza</div><h2 style="margin:4px 0 2px">${p.titlePl}</h2>
    <div class="hint" style="margin-bottom:10px">${p.subtitlePl}</div>
    ${ok ? `<div>${p.summary[ui.state]}</div>` : '<div class="hint">(streszczenie czeka na sprawdzenie faktów)</div>'}
    <div class="hint" style="margin-top:10px">Tekst i liczby: plik planszy <code>src/atlas/plates/${p.id}.ts</code>, tylko fakty sprawdzone z cytatem.</div>`;
  $('#chipR').textContent = ui.state === 'sprint' ? 'SPRINT · KONIEC 45 S PRACY' : 'SPOCZYNEK';
  stage.className = ui.state === 'sprint' ? 'work' : '';
}

function refreshDetailButtons() {
  const el = $('#detail');
  el.innerHTML = '<button data-v="" aria-pressed="true">Całe ciało</button>' +
    PLATES[ui.sys].details.map((d, i) => `<button data-v="${i}">${d.name}</button>`).join('');
}

/** Zbliżenie: wygaszenie zasłaniających kości (dithering w shaderze = zapis kilku tekseli) i schowanie strzałek. */
function applyDetailHide() {
  const sk = files.find((f) => f.name === 'za_skeleton');
  const re = ui.detail?.hideBones;
  for (const s of sk.ids) if (s.layer === 'bone') sk.state.set(s.id, { vis: re && re.test(s.name) ? 0.12 : 1 });
  sk.state.commit();
  for (const fl of flows) fl.visible = ui.sys === 'krwionosny' && !ui.detail;
}

function goDetail(i) {
  const P = PLATES[ui.sys];
  if (i === '' || i === undefined) { ui.detail = null; applyDetailHide(); rail.go({ az: 0, ...FULL() }, 1.0); return; }
  const d = P.details[+i];
  let target = d.target;
  if (d.anchorMean) {
    const a3 = P.anchors.views[d.view].anchors3d;
    const v = d.anchorMean.map((k) => za(a3[k])).reduce((s, p) => s.add(p), new THREE.Vector3()).multiplyScalar(1 / d.anchorMean.length);
    target = [v.x, v.y, 0];
  }
  ui.detail = d;
  applyDetailHide();
  rail.go({ az: d.az, target, dist: fitDist(camera, d.h) }, 1.0); // „pchnięcie” do kotwicy, 1 s (Reżyser §4.3)
}

seg('#sys', (v) => { ui.sys = v; ui.detail = null; refreshDetailButtons(); layerVisibility(); applyDetailHide(); refreshSummary(); rail.go({ az: 0, ...FULL() }, 0.8); refreshLabels(true); });
seg('#state', (v) => { ui.state = v; stateTarget = v === 'sprint' ? 1 : 0; refreshSummary(); refreshLabels(true); });
seg('#tier', (v) => { ui.tier = v; refreshLabels(true); });
seg('#detail', (v) => goDetail(v));
document.querySelectorAll('#compass .btn').forEach((b) => b.addEventListener('click', () => { ui.detail = null; rail.go({ az: +b.dataset.az, ...FULL() }, 1.2); }));

// ------------------------------------------------ obrót poziomy z przyciąganiem
let drag = null;
renderer.domElement.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, az: rail.cur.az }; renderer.domElement.setPointerCapture(e.pointerId); });
renderer.domElement.addEventListener('pointermove', (e) => {
  if (!drag) return;
  rail.anim = null;
  rail.cur.az = drag.az - (e.clientX - drag.x) * 0.45;
  rail.apply();
});
const snap = () => { const az = Math.round(rail.cur.az / 90) * 90; rail.go({ az, ...(ui.detail ? {} : FULL()) }, 0.6); };
renderer.domElement.addEventListener('pointerup', () => { if (drag) { drag = null; snap(); } });
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') rail.go({ az: Math.round(rail.cur.az / 90) * 90 + (e.key === 'ArrowLeft' ? 90 : -90) }, 1.2);
});

// ------------------------------------------------ start
(async () => {
  files = await Promise.all(['za_skeleton', 'za_vessels', 'za_muscles'].map((n) => loadAtlasFile(n)));
  for (const f of files) scene.add(f.root);
  for (const fl of krwFlows.flows) {
    const m = makeFlow(fl.points, fl.kind, { radius: fl.id.includes('head') ? 0.004 : 0.0055 });
    m.userData.id = fl.id;
    flows.push(m); scene.add(m);
  }
  $('#lic').textContent = 'Modele: Z-Anatomy (CC BY-SA 4.0, z BodyParts3D). Dane i podpisy: plansze atlasu. Prototyp, nie wersja ostateczna.';
  refreshDetailButtons(); layerVisibility(); refreshSummary(); refreshLabels(true);
  $('#loading').style.opacity = 0; setTimeout(() => $('#loading').remove(), 600);
  window.__p1 = { ui, rail, files, flows, renderer };
})();

// ------------------------------------------------ pętla
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1), t = clock.elapsedTime;
  rail.update(dt);
  stateMix += Math.sign(stateTarget - stateMix) * Math.min(Math.abs(stateTarget - stateMix), dt / 0.9); // przenikanie 0,9 s
  setStateMix(files, stateMix);
  tickMaterials(files, t);
  for (const fl of flows) {
    const u = fl.material.uniforms;
    u.uTime.value = t;
    u.uOn.value = 0.35 + 0.65 * stateMix;           // spoczynek: tor widoczny, przygaszony
    u.uSpeed.value = 0.35 + 0.65 * stateMix;        // prędkość: 2 stopnie jakościowe (ilustracja), nie liczba
  }
  // podpisy tylko blisko ujęcia kluczowego (wypiekana widoczność ze znanych ujęć, model §7)
  const az = ((rail.cur.az % 360) + 360) % 360;
  const off = Math.min(az % 90, 90 - (az % 90));
  refreshLabels();
  labels.update(camera, Math.max(0, 1 - off / 25));
  $('#needle').setAttribute('transform', `rotate(${-rail.cur.az})`);
  document.querySelectorAll('#compass .btn').forEach((b) => b.setAttribute('aria-pressed', String(!ui.detail && Math.abs(((+b.dataset.az - az + 540) % 360) - 180) < 1)));
  renderer.render(scene, camera);
  stats.tick();
});
