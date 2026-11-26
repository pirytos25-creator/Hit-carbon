// Atlas 3D (E3): odtworzenie modeli jednym poleceniem:  npm run atlas:export3d  [-- uklad1 uklad2 ...]
// 1) Blender (przez slot atlas_raw/.render_slot_1|2, zajmowany atomowo, najwyżej 2 naraz): baza wspólna + układy
//    (blender/atlas/atlas_export_glb.py), 2) kompresja i manifest (scripts/atlas3d_pack.mjs), 3) kontrola (atlas3d_check.mjs).
// GLB i manifest.json są poza Gitem (decyzja Dyrygenta, model §7); w Gicie zostaje bindings.json.
// Zmienne: BLENDER=<ścieżka do blender.exe>, ATLAS_RAW=<folder atlas_raw> (domyślnie jak w atlas_lib.py).
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAIN_RAW = 'C:\\Users\\piryt\\Desktop\\Luźny Vibecoading\\HIIt\\atlas_raw'; // jak _MAIN_RAW w atlas_lib.py
const RAW = process.env.ATLAS_RAW || (fs.existsSync(path.join(ROOT, 'atlas_raw')) ? path.join(ROOT, 'atlas_raw') : MAIN_RAW);
const BLENDER = process.env.BLENDER || 'C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe';
const STARTUP = path.join(RAW, 'z_anatomy', 'extracted', 'Z-Anatomy', 'Startup.blend');
const SCRIPT = path.join(ROOT, 'blender', 'atlas', 'atlas_export_glb.py');
const LOGS = path.join(ROOT, '.atlas3d_build', 'logs');
const ALL = fs.readdirSync(path.join(ROOT, 'blender', 'atlas')).filter((f) => /^plate_\w+\.py$/.test(f)).map((f) => f.slice(6, -3));
const want = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const plates = want.length ? want : ALL;

for (const [p, what] of [[BLENDER, 'Blender (zmienna BLENDER)'], [STARTUP, 'Startup.blend Z-Anatomy (zmienna ATLAS_RAW)']]) {
  if (!fs.existsSync(p)) { console.error(`atlas:export3d: brak ${what}: ${p}`); process.exit(1); }
}
fs.mkdirSync(LOGS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Zajmuje slot atomowo (mkdir), czeka, gdy oba zajęte. Nigdy nie usuwa cudzego slotu. */
async function takeSlot() {
  for (;;) {
    for (const n of [1, 2]) {
      const dir = path.join(RAW, `.render_slot_${n}`);
      try { fs.mkdirSync(dir); return dir; } catch { /* zajęty */ }
    }
    await sleep(15000);
  }
}

async function blender(mode) {
  const slot = await takeSlot();
  const log = path.join(LOGS, `${mode}.log`);
  const t0 = Date.now();
  try {
    await new Promise((resolve, reject) => {
      const out = fs.openSync(log, 'w');
      const p = spawn(BLENDER, ['--background', '--disable-autoexec', STARTUP, '--python', SCRIPT],
        { env: { ...process.env, ATLAS3D: mode }, stdio: ['ignore', out, out] });
      p.on('error', reject);
      p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${mode}: Blender zakończył się kodem ${code} (log: ${log})`))));
    });
  } finally {
    fs.rmdirSync(slot);
  }
  const txt = fs.readFileSync(log, 'utf8');
  if (/Traceback|LicenseError/.test(txt) || !/ATL3D_(DONE|FILE)/.test(txt)) throw new Error(`${mode}: błąd eksportu (log: ${log})`);
  console.log(`atlas:export3d: ${mode} gotowy (${Math.round((Date.now() - t0) / 1000)} s)`);
}

const t0 = Date.now();
if (!want.length || want.includes('shared') || !fs.existsSync(path.join(ROOT, '.atlas3d_build', '_shared', 'export.json'))) {
  await blender('shared');
}
const queue = plates.filter((p) => p !== 'shared');
await Promise.all([0, 1].map(async () => { while (queue.length) await blender(queue.shift()); })); // najwyżej 2 Blendery
const node = (s, ...a) => execFileSync(process.execPath, [path.join(ROOT, 'scripts', s), ...a], { stdio: 'inherit' });
node('atlas3d_pack.mjs');
node('atlas3d_check.mjs', '--selftest');
node('atlas3d_check.mjs');
console.log(`atlas:export3d: gotowe w ${Math.round((Date.now() - t0) / 60000)} min. Modele: public/atlas3d/ (poza Gitem).`);
