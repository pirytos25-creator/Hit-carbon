// P2 „Scena Całość”: wszystkie układy w jednej przestrzeni, warstwy zapalane w kolejności reakcji na sprint.
// Zegar = jeden interwał (−4…90 s; 45 s pracy / 45 s przerwy), kroki wg storyboardu Reżysera §3.2, kamera tylko po szynie
// (cięcie, pchnięcie do kotwicy, obrót ≤ 90°; Reżyser §4.3). Każdy efekt ma zmienną: zapalenie warstwy = krok łańcucha,
// jasność = moment (spoczynek…sprint) struktury, strzałka = przepływ, kolor tła = faza.
// Liczby wyłącznie z podpisów plansz o statusie checked_agent; zdania kroków to szkic bez liczb.
import {
  THREE, createViewer, loadAtlasFile, tickMaterials, makeFlow, createLabels, RailCamera, fitDist, createStats, plateLabels, za,
  SYS,
} from '../shared/engine.js';
import { KRWIONOSNY } from '../../../src/atlas/plates/krwionosny.ts';
import { MIESNIOWY } from '../../../src/atlas/plates/miesniowy.ts';
import { NERWOWY } from '../../../src/atlas/plates/nerwowy.ts';
import { ODDECHOWY } from '../../../src/atlas/plates/oddechowy.ts';
import { POKARMOWY } from '../../../src/atlas/plates/pokarmowy.ts';
import { POWLOKOWY } from '../../../src/atlas/plates/powlokowy.ts';
import krwA from '../../../public/atlas/krwionosny/anchors.json';
import mieA from '../../../public/atlas/miesniowy/anchors.json';
import nerA from '../../../public/atlas/nerwowy/anchors.json';
import oddA from '../../../public/atlas/oddechowy/anchors.json';
import pokA from '../../../public/atlas/pokarmowy/anchors.json';
import powA from '../../../public/atlas/powlokowy/anchors.json';
import krwF from '../../../public/atlas/krwionosny/flows3d.json';
import nerF from '../../../public/atlas/nerwowy/flows3d.json';
import pokF from '../../../public/atlas/pokarmowy/flows3d.json';
import powF from '../../../public/atlas/powlokowy/flows3d.json';

const $ = (s) => document.querySelector(s);
const stage = $('#stage');
const { renderer, scene, camera } = createViewer(stage);
const stats = createStats(renderer);
const labels = createLabels(document.body);

const PL = {
  krwionosny: [KRWIONOSNY, krwA], miesniowy: [MIESNIOWY, mieA], nerwowy: [NERWOWY, nerA],
  oddechowy: [ODDECHOWY, oddA], pokarmowy: [POKARMOWY, pokA], powlokowy: [POWLOKOWY, powA],
};
const BODY = [0, 0.9, 0];
const full = (az = 0) => ({ az, target: BODY, dist: fitDist(camera, 2.05) });
const push = (target, h, az = 0) => ({ az, target, dist: fitDist(camera, h) });
const HEART = za([0.02295, 0, 1.3133]).toArray();

// ------------------------------------------------ łańcuch (kroki); layers: widoczność grup, moment: 0 spoczynek … 1 sprint
const STEPS = [
  { t: -4, title: 'Spoczynek: punkt odniesienia', text: 'Całe ciało przed serią. Patrz, co zmieni się pierwsze.',
    layers: { muscle: 1 }, moment: { muscle: 0 }, shot: () => full(0), labels: [['miesniowy', 'front', 'rectus_femoris', 'rest']] },
  { t: 0, title: 'Ruch zaczyna się w układzie nerwowym', text: 'Sygnał z mózgu biegnie rdzeniem i nerwami do mięśni nóg.',
    layers: { nerve: 1 }, moment: { nerve: 1 }, ghostSkull: true, shot: () => full(20), flows: ['nerwowy/front_femoral'],
    labels: [['nerwowy', 'front', 'femoral', 'sprint'], ['nerwowy', 'front', 'deep_fibular', 'sprint'], ['nerwowy', 'front', 'lumbar_plexus', 'sprint']] },
  { t: 4, title: 'Serce przyspiesza', text: 'Kamera podchodzi do serca: to stąd zaczyna się zmiana przepływu.',
    layers: { blood: 1 }, moment: { blood: 1 }, ghostRibs: true, shot: () => push(HEART, 0.5), flows: ['krwionosny/artery_head', 'krwionosny/vein_head'],
    labels: [['krwionosny', 'front', 'heart', 'sprint'], ['krwionosny', 'front', 'aortic_arch', 'sprint']] },
  { t: 12, title: 'Krew zmienia adres', text: 'Grube, szybkie strzałki do nóg; naczynia trzewne się zwężają.',
    layers: { blood: 1, muscle: 0.4 }, muscleWorkingOnly: true, moment: { blood: 1, muscle: 1 }, shot: () => full(-25),
    flows: ['krwionosny/artery_leg', 'krwionosny/vein_leg'],
    labels: [['krwionosny', 'front', 'femoral', 'sprint'], ['krwionosny', 'front', 'portal', 'sprint'], ['krwionosny', 'front', 'saphenous', 'sprint']],
    predict: { q: 'Przepływ krwi przez jelita w sprincie:', answer: 'down', at: 14 } },
  { t: 28, title: 'Oddech dogania serce', text: 'Przepona i mięśnie oddechowe pracują mocniej; płuca w kolorze sprintu.',
    layers: { resp: 1 }, moment: { resp: 1 }, ghostRibs: true, shot: () => push([0, 1.27, 0], 0.85),
    labels: [['oddechowy', 'front', 'lung', 'sprint'], ['oddechowy', 'front', 'diaphragm', 'sprint'], ['oddechowy', 'front', 'intercostal', 'sprint']] },
  { t: 40, title: 'Szczyt: koniec pracy', text: 'Wszystko, co pracuje, w pełnym kolorze. Rusza się tylko krew.',
    layers: { muscle: 1, nerve: 1, resp: 1 }, muscleWorkingOnly: true, moment: { muscle: 1, nerve: 1, resp: 1 }, shot: () => full(0),
    flows: ['krwionosny/artery_leg', 'krwionosny/vein_leg'] },
  { t: 45, title: 'Przerwa: co wraca szybciej?', text: 'Krew przygasa, oddech zostaje podniesiony (ilustracja; czeka na fakty F6 i F7).',
    layers: { blood: 1, resp: 1 }, moment: { blood: 0.45, resp: 1 }, ghostRibs: true, shot: () => push([0, 1.2, 0], 1.0, 30) },
  { t: 58, title: 'Po pracy: wątroba i skóra', text: 'Mleczan płynie krwią do wątroby, a skóra oddaje ciepło.',
    layers: { digest: 1 }, moment: { digest: 1 }, ghostRibs: true, shot: () => full(0),
    flows: ['pokarmowy/lactate_portal', 'pokarmowy/lactate_artery', 'powlokowy/heat_head', 'powlokowy/heat_arm_r', 'powlokowy/heat_thigh_r', 'powlokowy/heat_thigh_l'],
    labels: [['pokarmowy', 'front', 'liver', 'sprint'], ['powlokowy', 'front', 'skin_trunk', 'sprint']] },
  { t: 78, title: 'Co się zmieniło', text: 'W kolorze tylko to, co jeszcze nie wróciło do spoczynku (ilustracja; czeka na fakt F10).',
    layers: { resp: 1, blood: 1, muscle: 0.4 }, muscleWorkingOnly: true, moment: { resp: 0.6, blood: 0.3, muscle: 0.25 }, shot: () => full(0) },
];
const GROUP_NAMES = { muscle: 'Mięśnie', nerve: 'Nerwy i mózg', blood: 'Krew (tętnice, żyły)', resp: 'Oddech', digest: 'Wątroba i jelita',
  urinary: 'Nerki', endo: 'Hormony', lymph: 'Limfa', repro: 'Rozrodczy' };
const GROUP_COLOR = { muscle: 'muscle', nerve: 'nerve', blood: 'artery', resp: 'resp', digest: 'digest', urinary: 'urinary', endo: 'endo', lymph: 'lymph', repro: 'repro' };

function groupOf(file, s) {
  if (file === 'za_skeleton') return 'base';
  if (file === 'za_muscles') return s.system === 'resp' ? 'resp' : 'muscle';
  if (file === 'za_vessels') return 'blood';
  if (file === 'za_nervous') return 'nerve';
  if (file === 'hra_kidney') return 'urinary';
  return s.system; // trzewia: resp, digest, urinary, endo, lymph, repro
}

// ------------------------------------------------ stan
let files = [], flows = new Map(), entries = []; // entries: { f, id, g, working, rib }
const cur = {}; // grupa -> { vis, moment } (animowane)
let T = -4, playing = false, stepIdx = -1, waitPredict = null, answered = new Set();

function targetFor(step, e) {
  const L = step.layers[e.g] ?? 0;
  let vis = e.g === 'base' ? 1 : L;
  if (e.g === 'muscle') vis = L > 0 ? 1 : 0; // półprzezroczystość mięśni = krycie całej siatki (muscleAlpha), nie dithering
  if (e.g === 'muscle' && step.muscleWorkingOnly && !e.working) vis = 0;
  if (e.rib && step.ghostRibs) vis = 0.12;
  if (e.skull && step.ghostSkull) vis = 0.12;
  return { vis, moment: step.moment[e.g] ?? 0 };
}

function applyStep(i, cut = false) {
  stepIdx = i;
  const st = STEPS[i];
  rail.go(st.shot(), cut ? 0.01 : 1.2);
  $('#capTitle').textContent = st.title;
  $('#capText').textContent = st.text;
  const plates = [...new Set((st.labels || []).map((l) => l[0]))];
  $('#capSrc').textContent = plates.length ? `Podpisy: plansze ${plates.join(', ')} (tylko fakty sprawdzone z cytatem)` : '';
  const items = (st.labels || []).flatMap(([p, view, anchor, state]) =>
    plateLabels(PL[p][0], PL[p][1], view, state, 'all').filter((x) => x.anchor === anchor));
  labels.set(items);
  for (const [k, m] of flows) m.userData.target = st.flows?.includes(k) ? 1 : 0;
  $('#legendItems').innerHTML = Object.entries(st.layers).filter(([, v]) => v > 0)
    .map(([g]) => `<div><i style="background:${SYS[GROUP_COLOR[g]].color}"></i>${GROUP_NAMES[g]}</div>`).join('');
  $('#predict').classList.remove('on');
  document.querySelectorAll('#axis .tick').forEach((el, j) => (el.style.background = j === i ? '#fff' : 'rgba(255,255,255,.35)'));
}

// ------------------------------------------------ oś interwału
const axis = $('#axis');
const tx = (t) => ((t + 4) / 94) * 100;
STEPS.forEach((s, i) => {
  const el = document.createElement('div');
  el.className = 'tick'; el.style.left = tx(s.t) + '%';
  el.innerHTML = `<span>${i}</span>`; el.title = s.title;
  axis.append(el);
});
axis.addEventListener('click', (e) => { const r = axis.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * 94 - 4); });
function seek(t) { T = Math.max(-4, Math.min(90, t)); waitPredict = null; }
$('#play').onclick = () => { playing = !playing; $('#play').textContent = playing ? '⏸ Pauza' : '▶ Dalej'; };
$('#next').onclick = () => { const n = STEPS[Math.min(STEPS.length - 1, stepIdx + 1)]; seek(n.t + 0.01); };
$('#skip').onclick = () => { location.href = '../p1_gablota/'; };
window.addEventListener('keydown', (e) => { if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); $('#play').click(); } });
document.querySelectorAll('#predict button').forEach((b) => b.addEventListener('click', () => {
  const p = STEPS[stepIdx].predict;
  answered.add(stepIdx);
  $('#pq').textContent = b.dataset.a === p.answer ? 'Dobrze.' : 'Odwrotnie:';
  setTimeout(() => { $('#predict').classList.remove('on'); waitPredict = null; }, 1400);
}));

const rail = new RailCamera(camera, full(0));

// ------------------------------------------------ start
(async () => {
  files = await Promise.all(['za_skeleton', 'za_muscles', 'za_vessels', 'za_nervous', 'za_viscera', 'hra_kidney'].map((n) => loadAtlasFile(n)));
  for (const f of files) {
    scene.add(f.root);
    for (const s of f.ids) {
      entries.push({ f, id: s.id, g: groupOf(f.name, s), working: typeof s.level === 'number',
        rib: f.name === 'za_skeleton' && /rib|sternum|costal cartilage|xiphoid|manubrium/i.test(s.name),
        skull: f.name === 'za_skeleton' && /frontal bone|parietal bone|occipital bone|temporal bone|sphenoid|ethmoid/i.test(s.name) });
    }
  }
  for (const g of ['base', ...Object.keys(GROUP_NAMES)]) cur[g] = { vis: g === 'base' ? 1 : 0, moment: 0 };
  const add = (plate, json) => json.flows.forEach((fl) => {
    const m = makeFlow(fl.points, fl.kind, { radius: fl.kind === 'nerve' ? 0.004 : 0.0055 });
    m.userData.target = 0; m.userData.on = 0;
    flows.set(`${plate}/${fl.id}`, m); scene.add(m);
  });
  add('krwionosny', krwF); add('nerwowy', nerF); add('pokarmowy', pokF); add('powlokowy', powF);
  for (const e of entries) { const t = targetFor(STEPS[0], e); e.vis = t.vis; e.moment = t.moment; e.f.state.set(e.id, { vis: e.vis }); e.f.state.setMoment(e.id, e.moment); }
  files.forEach((f) => f.state.commit());
  applyStep(0, true);
  $('#loading').style.opacity = 0; setTimeout(() => $('#loading').remove(), 600);
  window.__p2 = { seek, STEPS, files, rail, renderer, get T() { return T; }, play: () => { playing = true; } };
  if (location.hash.startsWith('#t=')) seek(parseFloat(location.hash.slice(3)));
})();

// ------------------------------------------------ pętla
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1), time = clock.elapsedTime;
  if (!entries.length) { renderer.render(scene, camera); return; }
  if (playing && !waitPredict) T = Math.min(90, T + dt);
  // krok wg czasu
  let i = 0; while (i + 1 < STEPS.length && T >= STEPS[i + 1].t) i++;
  if (i !== stepIdx) applyStep(i);
  const st = STEPS[i];
  if (st.predict && !answered.has(i) && T >= st.predict.at && !waitPredict) {
    waitPredict = st.predict; $('#pq').textContent = st.predict.q; $('#predict').classList.add('on');
  }
  // przenikanie warstw i momentów (0,9 s), zapis tylko zmienionych tekseli
  const k = dt / 0.9;
  const dirty = new Set();
  for (const e of entries) {
    const t = targetFor(st, e);
    const nv = e.vis + Math.sign(t.vis - e.vis) * Math.min(Math.abs(t.vis - e.vis), k);
    const nm = e.moment + Math.sign(t.moment - e.moment) * Math.min(Math.abs(t.moment - e.moment), k);
    if (nv !== e.vis || nm !== e.moment) { e.vis = nv; e.moment = nm; e.f.state.set(e.id, { vis: nv }); e.f.state.setMoment(e.id, nm); dirty.add(e.f); }
  }
  dirty.forEach((f) => f.state.commit());
  // warstwa mięśni jako półprzezroczysta powłoka (Reżyser §3.2 krok 3: krew + mięśnie razem)
  const mm = files.find((f) => f.name === 'za_muscles').layers.muscle;
  const aT = st.layers.muscle > 0 && st.layers.muscle < 1 ? st.layers.muscle : 1;
  const mat = mm.material, a = mat.opacity + Math.sign(aT - mat.opacity) * Math.min(Math.abs(aT - mat.opacity), k);
  const tr = a < 0.999;
  if (tr !== mat.transparent) { mat.transparent = tr; mat.depthWrite = !tr; mat.needsUpdate = true; }
  mat.opacity = a;
  for (const [, m] of flows) {
    const d = m.userData; d.on += Math.sign(d.target - d.on) * Math.min(Math.abs(d.target - d.on), k);
    m.visible = d.on > 0.01;
    const u = m.material.uniforms; u.uOn.value = d.on; u.uTime.value = time; u.uSpeed.value = T < 45 ? 1 : 0.45;
  }
  tickMaterials(files, time);
  rail.update(dt);
  const labelsHidden = waitPredict && !answered.has(i); // „przewidź”: odpowiedź (podpis) dopiero po wyborze
  labels.update(camera, rail.anim || labelsHidden ? 0 : 1);
  const work = T < 45;
  stage.className = T < 0 ? '' : work ? 'work' : 'rest-phase';
  const sec = Math.max(0, Math.floor(work ? T : T - 45));
  $('#hud').textContent = `INTERWAŁ 1/6 · ${T < 0 ? 'PRZED SERIĄ' : work ? 'PRACA' : 'PRZERWA'} · 00:${String(sec).padStart(2, '0')}`;
  $('#head').style.left = tx(T) + '%';
  renderer.render(scene, camera);
  stats.tick();
});
