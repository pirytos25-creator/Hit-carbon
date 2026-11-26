// Atlas 3D (E3): kompresja GLB i kontrakt danych dla aplikacji.
// Wejście: .atlas3d_build/ (blender/atlas/atlas_export_glb.py). Wyjście: public/atlas3d/
//   _shared/{za_skeleton,za_muscles}.glb + _shared/ids.json      baza wspólna (raz dla wszystkich układów)
//   <uklad>/{za,hra}_{body,staging}.glb                            pliki układu (licencje nigdy razem)
//   <uklad>/manifest.json   pliki, licencje, widoki (kamera + rama body/staging), budżet
//   <uklad>/bindings.json   meshId -> plik, warstwa, rola, układ, poziomy, alpha, ctx, widoki; anchors (dla E1)
//   <uklad>/anchors3d.json  kotwice w metrach: widoki planszy + widoki kluczowe 3D (k_front, k_left, k_back, k_right)
//   <uklad>/flows3d.json    tory strzałek w metrach z ramą; oddechowy: odrzutowany z flows.json (piksele)
// Kompresja: EXT_meshopt_compression + KHR_mesh_quantization (gltf-transform; _ID bez kwantyzacji).
// Uruchom: node scripts/atlas3d_pack.mjs [uklad ...]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = path.join(ROOT, '.atlas3d_build');
const OUT = path.join(ROOT, 'public', 'atlas3d');
const ATLAS = path.join(ROOT, 'public', 'atlas');
export const BUDGET = { desktop: { bytes: 20e6, tris: 1.5e6, calls: 200 }, phone: { bytes: 6e6, tris: 4e5, calls: 50 } }; // model §3.2

const gt = (...a) => execFileSync('gltf-transform', a.map((x) => `"${x}"`), { stdio: 'pipe', shell: true });
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, o, pretty = false) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(o, null, pretty ? 1 : 0)); };

function pack(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  const tmp = dst.replace(/\.glb$/, '.q.glb');
  gt('quantize', src, tmp, '--pattern', '{POSITION,NORMAL}', '--quantize-position', '14', '--quantize-normal', '10');
  gt('meshopt', tmp, dst, '--level', 'medium');
  fs.rmSync(tmp);
  return fs.statSync(dst).size;
}

// ---------------------------------------------------------------- baza wspólna
function packShared() {
  const ex = readJson(path.join(BUILD, '_shared', 'export.json'));
  const ids = { schemaVersion: 1, files: {} };
  for (const f of ex.files) {
    const bytes = pack(path.join(BUILD, '_shared', f.file), path.join(OUT, '_shared', f.file));
    ids.files[f.file] = { license: f.license, attribution: f.attribution, bytes, tris: f.tris, layers: f.layers, ids: f.ids };
    console.log(`_shared/${f.file}: ${(bytes / 1e6).toFixed(2)} MB, ${f.tris} trójkątów`);
  }
  writeJson(path.join(OUT, '_shared', 'ids.json'), ids);
  return ids;
}

// ---------------------------------------------------------------- strzałki
/** Odwrotność projection.ts/projectPoint dla kamery ortograficznej: piksel -> punkt na płaszczyźnie kamery + głębokość. */
function unproject([px, py], cam, [W, H], depth) {
  const wWorld = W >= H ? cam.orthoScale : (cam.orthoScale * W) / H;
  const hWorld = W >= H ? (cam.orthoScale * H) / W : cam.orthoScale;
  const x = (px / W - 0.5) * wWorld, y = (0.5 - py / H) * hWorld;
  const fwd = [cam.up[1] * cam.right[2] - cam.up[2] * cam.right[1], cam.up[2] * cam.right[0] - cam.up[0] * cam.right[2], cam.up[0] * cam.right[1] - cam.up[1] * cam.right[0]];
  return [0, 1, 2].map((i) => +(cam.center[i] + cam.right[i] * x + cam.up[i] * y + fwd[i] * depth).toFixed(4));
}

/** Oddechowy: strzałki planszy są w pikselach (flows.json). Rzut odwrotny przez kamerę widoku front;
 *  głębokość (oś Y ciała) z kotwic: tchawica powyżej rozwidlenia, oskrzele główne niżej (przybliżenie, oznaczone). */
function respiratoryFlows(anchors) {
  const fl = readJson(path.join(ATLAS, 'oddechowy', 'flows.json'));
  const v = anchors.views.front, cam = v.camera, res = v.resolution ?? anchors.resolution;
  const a3 = v.anchors3d;
  const zSplit = a3.main_bronchus[2] + 0.03;
  const out = [];
  for (const [view, list] of Object.entries(fl)) {
    if (view !== 'front') continue;
    list.forEach((f, i) => {
      const pts = f.points.map((p) => {
        const flat = unproject(p, cam, res, 0);
        const yBody = flat[2] > zSplit ? a3.trachea[1] : a3.main_bronchus[1];
        return [flat[0], yBody, flat[2]];
      });
      out.push({ id: `air_${i}`, kind: f.kind, labelPl: f.label, views: ['front'], points: pts, frame: 'body',
        source: 'flows.json (piksele) -> rzut odwrotny kamerą front; głębokość przybliżona z kotwic trachea/main_bronchus' });
    });
  }
  // kontrola rzutu: kotwice 3D -> piksele -> z powrotem (błąd w płaszczyźnie obrazu)
  let maxErr = 0;
  for (const [k, p] of Object.entries(a3)) {
    const [u, w] = v.anchors[k];
    const back = unproject([u * res[0], w * res[1]], cam, res, 0);
    maxErr = Math.max(maxErr, Math.hypot(back[0] - p[0], back[2] - p[2]));
  }
  return { flows: out, roundTripErrorM: +maxErr.toFixed(5) };
}

function flowsFor(plate, views, anchors) {
  if (plate === 'oddechowy') {
    const r = respiratoryFlows(anchors);
    console.log(`oddechowy: ${r.flows.length} strzałek z pikseli na metry, błąd rzutu kotwic ${r.roundTripErrorM} m`);
    return { flows: r.flows, note: `rzut odwrotny z flows.json, błąd kotwic ${r.roundTripErrorM} m` };
  }
  const p = path.join(ATLAS, plate, 'flows3d.json');
  if (!fs.existsSync(p)) return { flows: [] };
  const src = readJson(p);
  return {
    flows: src.flows.map((f) => {
      const fv = (f.views ?? []).filter((x) => views[x]);
      return { ...f, frame: fv.length && fv.every((x) => views[x].frame === 'staging') ? 'staging' : 'body' };
    }),
  };
}

// ---------------------------------------------------------------- układ
function packPlate(plate, shared) {
  const ex = readJson(path.join(BUILD, plate, 'export.json'));
  const out = path.join(OUT, plate);
  const sharedOf = new Map();
  for (const [file, d] of Object.entries(shared.files)) for (const m of d.ids) sharedOf.set(m, `_shared/${file}`);
  const files = [];
  const tables = {};
  for (const f of ex.files) {
    const bytes = pack(path.join(BUILD, plate, f.file), path.join(out, f.file));
    tables[f.file] = f.ids;
    files.push({ path: f.file, license: f.license, attribution: f.attribution, frame: f.frame, bytes, tris: f.tris, layers: f.layers });
  }
  const skipped = []; // obiekty bez geometrii (np. pomocnicze ramki kadru): nie ma ich w żadnej siatce
  const structures = ex.items.flatMap((it) => {
    const file = it.shared ? sharedOf.get(it.meshId) : it.file;
    if (!file) throw new Error(`${plate}: ${it.meshId} bez pliku`);
    if (!it.shared && !tables[file]?.includes(it.meshId)) { skipped.push(it.meshId); return []; }
    return [{ meshId: it.meshId, file, layer: it.shared ? null : it.layer, role: it.role, system: it.system, levels: it.levels,
      alpha: it.alpha, ctx: it.ctx, views: it.views, frame: it.frame, license: it.license, look: it.look ?? null }];
  });
  if (skipped.length) console.log(`${plate}: pominięte bez geometrii: ${skipped.join(', ')}`);
  const usedShared = [...new Set(structures.filter((s) => s.file.startsWith('_shared/')).map((s) => s.file))];
  for (const sf of usedShared) {
    const d = shared.files[sf.slice(8)];
    files.unshift({ path: sf, license: d.license, attribution: d.attribution, frame: 'body', bytes: d.bytes, tris: d.tris, layers: d.layers, shared: true });
  }
  const anchors = readJson(path.join(ATLAS, plate, 'anchors.json'));
  const flows = flowsFor(plate, ex.views, anchors);
  const body = files.filter((f) => f.frame === 'body');
  const sum = (arr, k) => arr.reduce((s, f) => s + (k === 'calls' ? f.layers.length : f[k]), 0);
  const budget = {
    note: 'model §3.2; „ciało” = pliki ładowane od razu, „całość” = z zbliżeniami (ładowane leniwie)',
    body: { bytes: sum(body, 'bytes'), tris: sum(body, 'tris'), calls: sum(body, 'calls') },
    all: { bytes: sum(files, 'bytes'), tris: sum(files, 'tris'), calls: sum(files, 'calls') },
    desktop: BUDGET.desktop, phone: BUDGET.phone,
  };
  budget.okDesktop = budget.all.bytes <= BUDGET.desktop.bytes && budget.body.tris <= BUDGET.desktop.tris && budget.all.calls <= BUDGET.desktop.calls;
  budget.okPhone = budget.body.bytes <= BUDGET.phone.bytes && budget.body.tris <= BUDGET.phone.tris && budget.body.calls <= BUDGET.phone.calls;
  writeJson(path.join(out, 'manifest.json'), {
    schemaVersion: 1, plate, units: 'm',
    frame: 'Z-Anatomy (przód −Y, prawa strona ciała −X, Z w górę); w glTF/three: (x, z, −y)',
    files, views: ex.views, roles: ex.roles, budget,
    generatedBy: 'blender/atlas/atlas_export_glb.py + scripts/atlas3d_pack.mjs',
  }, true);
  writeJson(path.join(out, 'bindings.json'), {
    schemaVersion: 1, plate, tables, structures, skipped,
    anchors: ex.anchorMeshes ?? {}, anchorMethod: ex.anchorMethod ?? {},
    note: 'meshId wg modelu §3.1; semantyka (structureId) w src/atlas/data/mesh_bindings.json (E1). Tabele _shared: _shared/ids.json',
  });
  writeJson(path.join(out, 'anchors3d.json'), { schemaVersion: 1, plate, units: 'm', views: ex.anchors3d, anchorViews: ex.anchorViews });
  writeJson(path.join(out, 'flows3d.json'), { schemaVersion: 1, plate, units: 'm', ...flows });
  const mb = (b) => (b / 1e6).toFixed(2);
  console.log(`${plate}: ciało ${mb(budget.body.bytes)} MB / ${budget.body.tris} tr. / ${budget.body.calls} wyw.; ` +
    `całość ${mb(budget.all.bytes)} MB / ${budget.all.tris} tr.; desktop ${budget.okDesktop ? 'OK' : 'PRZEKROCZONY'}, telefon ${budget.okPhone ? 'OK' : 'nie'}`);
}

const want = process.argv.slice(2);
const shared = fs.existsSync(path.join(BUILD, '_shared', 'export.json')) && (!want.length || want.includes('_shared'))
  ? packShared() : readJson(path.join(OUT, '_shared', 'ids.json'));
for (const d of fs.readdirSync(BUILD)) {
  if (d.startsWith('_') || !fs.existsSync(path.join(BUILD, d, 'export.json'))) continue;
  if (want.length && !want.includes(d)) continue;
  packPlate(d, shared);
}
