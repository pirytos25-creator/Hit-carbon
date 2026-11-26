// Atlas 3D (E3): kontrola licencji, struktur NC i budżetów na gotowych plikach public/atlas3d/ (bez Blendera).
// Sprawdza:
//  1. każdy GLB ma jedną licencję zgodną z prefiksem nazwy (za_ = Z-Anatomy CC BY-SA 4.0, hra_ = HuBMAP CC BY 4.0):
//     asset.copyright i extras.atlas_license każdego węzła; pliki BY-SA i BY nigdy razem (model §2 pkt 8)
//  2. żaden meshId Z-Anatomy nie pasuje do NC_BLOCKLIST z blender/atlas/atlas_lib.py (nerka, ucho wewnętrzne)
//  3. bindings: każdy meshId istnieje w tabeli swojego pliku; plik jest w manifeście; licencja struktury = licencja pliku
//  4. budżet desktopu z modelu §3.2 (bajty, trójkąty, wywołania rysowania)
//  5. strzałki: tory w metrach z ramą body/staging
// Uruchom: node scripts/atlas3d_check.mjs   (autotest walidatora: --selftest)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'atlas3d');
const LIB = path.join(ROOT, 'blender', 'atlas', 'atlas_lib.py');
const DESKTOP = { bytes: 20e6, tris: 1.5e6, calls: 200 };
const LIC = { za: { id: 'CC-BY-SA-4.0', word: 'Z-Anatomy' }, hra: { id: 'CC-BY-4.0', word: 'HuBMAP' } };

/** Wzorce NC czytane wprost z atlas_lib.py (jedno źródło prawdy z blokadą w Blenderze). */
export function ncPatterns(src = fs.readFileSync(LIB, 'utf8')) {
  const m = src.match(/NC_BLOCKLIST\s*=\s*\[([\s\S]*?)\]/);
  if (!m) throw new Error('nie znaleziono NC_BLOCKLIST w atlas_lib.py');
  return [...m[1].matchAll(/r"([^"]+)"/g)].map((x) => new RegExp(x[1]));
}

/** Część JSON pliku GLB (nagłówek 12 B + pierwszy blok JSON). */
export function glbJson(buf) {
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error('to nie jest GLB');
  const len = buf.readUInt32LE(12);
  if (buf.readUInt32LE(16) !== 0x4e4f534a) throw new Error('pierwszy blok GLB nie jest JSON');
  return JSON.parse(buf.subarray(20, 20 + len).toString('utf8'));
}

export function checkGlb(name, gltf, errors) {
  const pre = path.basename(name).split('_')[0];
  const lic = LIC[pre];
  if (!lic) { errors.push(`${name}: nazwa bez prefiksu licencji za_/hra_`); return; }
  const cr = gltf.asset?.copyright ?? '';
  if (!cr.includes(lic.word)) errors.push(`${name}: asset.copyright nie wskazuje ${lic.word}: "${cr.slice(0, 60)}"`);
  const other = Object.values(LIC).find((l) => l !== lic);
  if (cr.includes(other.word) && !cr.includes(lic.word)) errors.push(`${name}: copyright innej licencji`);
  const used = gltf.extensionsUsed ?? [];
  if (!used.includes('EXT_meshopt_compression')) errors.push(`${name}: brak EXT_meshopt_compression`);
  for (const n of gltf.nodes ?? []) {
    const l = n.extras?.atlas_license;
    if (l !== lic.id) errors.push(`${name}: węzeł ${n.name} ma licencję ${l ?? 'brak'} zamiast ${lic.id} (mieszanie licencji)`);
  }
}

export function checkNc(meshIds, where, nc, errors) {
  for (const m of meshIds) {
    if (!m.startsWith('za:')) continue;
    const name = m.slice(3);
    if (nc.some((r) => r.test(name))) errors.push(`${where}: struktura NC w pliku: ${m}`);
  }
}

function run() {
  const errors = [], info = [];
  const nc = ncPatterns();
  if (!fs.existsSync(OUT)) { console.log('atlas3d: brak public/atlas3d (nic do sprawdzenia)'); return 0; }
  const sharedIds = fs.existsSync(path.join(OUT, '_shared', 'ids.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, '_shared', 'ids.json'), 'utf8')) : { files: {} };
  for (const [f, d] of Object.entries(sharedIds.files)) {
    checkGlb(`_shared/${f}`, glbJson(fs.readFileSync(path.join(OUT, '_shared', f))), errors);
    checkNc(d.ids, `_shared/${f}`, nc, errors);
  }
  const plates = fs.readdirSync(OUT).filter((d) => !d.startsWith('_') && fs.existsSync(path.join(OUT, d, 'manifest.json')));
  for (const p of plates) {
    const dir = path.join(OUT, p);
    const man = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
    const bind = JSON.parse(fs.readFileSync(path.join(dir, 'bindings.json'), 'utf8'));
    const tables = { ...bind.tables };
    for (const [f, d] of Object.entries(sharedIds.files)) tables[`_shared/${f}`] = d.ids;
    const filesInManifest = new Set(man.files.map((f) => f.path));
    for (const f of man.files) {
      const fp = path.join(OUT, f.shared ? '' : p, f.path);
      if (!fs.existsSync(fp)) { errors.push(`${p}: brak pliku ${f.path}`); continue; }
      if (!f.shared) checkGlb(`${p}/${f.path}`, glbJson(fs.readFileSync(fp)), errors);
      if (!f.shared) checkNc(bind.tables[f.path] ?? [], `${p}/${f.path}`, nc, errors);
      const pre = path.basename(f.path).split('_')[0];
      if (LIC[pre]?.id !== f.license) errors.push(`${p}: ${f.path} w manifeście ma licencję ${f.license}`);
    }
    const sets = Object.fromEntries(Object.entries(tables).map(([k, v]) => [k, new Set(v)]));
    for (const s of bind.structures) {
      if (!filesInManifest.has(s.file)) errors.push(`${p}: ${s.meshId} wskazuje plik spoza manifestu ${s.file}`);
      else if (!sets[s.file]?.has(s.meshId)) errors.push(`${p}: ${s.meshId} nie ma w tabeli ${s.file}`);
      const pre = path.basename(s.file).split('_')[0];
      if (LIC[pre]?.id !== s.license) errors.push(`${p}: ${s.meshId} (${s.license}) w pliku ${s.file}`);
    }
    checkNc(bind.structures.map((s) => s.meshId), `${p}/bindings`, nc, errors);
    const b = man.budget;
    if (b.all.bytes > DESKTOP.bytes) errors.push(`${p}: pobranie ${(b.all.bytes / 1e6).toFixed(1)} MB > 20 MB`);
    if (b.body.tris > DESKTOP.tris) errors.push(`${p}: ${b.body.tris} trójkątów > 1,5 mln`);
    if (b.all.calls > DESKTOP.calls) errors.push(`${p}: ${b.all.calls} wywołań > 200`);
    const fl = JSON.parse(fs.readFileSync(path.join(dir, 'flows3d.json'), 'utf8'));
    for (const f of fl.flows) {
      if (!['body', 'staging'].includes(f.frame)) errors.push(`${p}: strzałka ${f.id} bez ramy`);
      if (!f.points?.length || f.points.some((q) => q.length !== 3 || q.some((x) => Math.abs(x) > 50))) errors.push(`${p}: strzałka ${f.id} nie jest w metrach`);
    }
    info.push(`${p}: ${man.files.length} plików, ${bind.structures.length} struktur, ciało ${(b.body.bytes / 1e6).toFixed(1)} MB / ${b.body.tris} tr., całość ${(b.all.bytes / 1e6).toFixed(1)} MB, ${fl.flows.length} strzałek`);
  }
  info.forEach((l) => console.log('atlas3d:', l));
  if (errors.length) { errors.forEach((e) => console.error('atlas3d BŁĄD:', e)); return 1; }
  console.log(`atlas3d: OK (${plates.length} układów, licencje rozdzielone, 0 struktur NC, budżet desktopu spełniony)`);
  return 0;
}

/** Autotest: walidator musi złapać nerkę Z-Anatomy, mieszanie licencji i brak meshopt. */
function selftest() {
  const nc = ncPatterns();
  const e = [];
  checkNc(['za:Kidney.l', 'za:Femur.r', 'hra:VH_M_Kidney_L.glb/x', 'za:Cochlea.r'], 'test', nc, e);
  checkGlb('za_body.glb', { asset: { copyright: 'Z-Anatomy' }, extensionsUsed: ['EXT_meshopt_compression'],
    nodes: [{ name: 'a', extras: { atlas_license: 'CC-BY-SA-4.0' } }, { name: 'b', extras: { atlas_license: 'CC-BY-4.0' } }] }, e);
  checkGlb('hra_body.glb', { asset: { copyright: 'HuBMAP' }, nodes: [] }, e);
  const ok = e.length === 4 && e[0].includes('Kidney.l') && e[1].includes('Cochlea.r') && e[2].includes('mieszanie') && e[3].includes('meshopt');
  console.log(ok ? `atlas3d selftest: OK (${nc.length} wzorców NC z atlas_lib.py; wykryto ${e.length}/4 celowe błędy)` : `atlas3d selftest: BŁĄD ${JSON.stringify(e)}`);
  return ok ? 0 : 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  process.exit(process.argv.includes('--selftest') ? selftest() : run());
}
