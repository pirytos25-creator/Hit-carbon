/**
 * E1-K2 (jednorazowo): przepisuje src/atlas/plates/<plansza>.ts na sam układ planszy (AtlasPlateLayout).
 * Treść faktów (opisy ról, statusy, źródła, liczby, podsumowania, zdania o „sprincie”) jest już w
 * src/atlas/data/facts/<plansza>.json (migracja E1-K1); plansza składa się w src/atlas/facts.ts (buildPlate).
 * Uruchomienie: node scripts/atlas_split_plates.mjs   (odmawia, gdy plansze są już podzielone)
 */
import { build } from 'esbuild';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const idx = readFileSync(join(root, 'src/atlas/plates/index.ts'), 'utf-8');
if (idx.includes('buildPlate(')) {
  console.log('Plansze są już podzielone (index.ts używa buildPlate) – nic nie robię.');
  process.exit(0);
}
const out = join(mkdtempSync(join(tmpdir(), 'atlas-split-')), 'bundle.mjs');
await build({
  stdin: { contents: "export { ATLAS_SYSTEMS } from './src/atlas/plates/index.ts';", resolveDir: root, loader: 'ts' },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'silent',
});
const { ATLAS_SYSTEMS } = await import(pathToFileURL(out).href);

const TOP_FACT = ['summary', 'summaryReferenceIds', 'summaryStatus', 'summaryVerified', 'protocolNotePl', 'protocolNoteStatus', 'metrics'];
const LABEL_FACT = ['role', 'roleStatus', 'referenceIds', 'evidence', 'conversionNote'];
const names = {};
for (const m of idx.matchAll(/import \{ (\w+) \} from '\.\/(\w+)';/g)) names[m[2]] = m[1];

for (const sys of ATLAS_SYSTEMS) {
  const c = sys.content;
  if (!c) continue;
  const layout = {};
  for (const [k, v] of Object.entries(c)) if (!TOP_FACT.includes(k)) layout[k] = v;
  layout.labels = c.labels.map((l) => {
    const o = {};
    for (const [k, v] of Object.entries(l)) if (!LABEL_FACT.includes(k)) o[k] = v;
    return o;
  });
  const name = names[c.id];
  const body = JSON.stringify(layout, null, 2).replace(/^/gm, '').replace(/"(\w+)":/g, '$1:');
  const ts = `import type { AtlasPlateLayout } from '../facts';

/**
 * Układ planszy „${c.titlePl}” (E1-K2): kotwice, widoki, kolejność, tier, nazwy struktur i strzałki.
 * Treść faktów (opisy ról, statusy, źródła, liczby, podsumowania, zdanie o „sprincie”) jest wyłącznie w
 * src/atlas/data/facts/${c.id}.json; planszę składa src/atlas/facts.ts (buildPlate). Walidator
 * scripts/atlas_check_data.mjs pilnuje, żeby w tym pliku nie było tekstów faktów.
 */
export const ${name}: AtlasPlateLayout = ${body};
`;
  writeFileSync(join(root, 'src/atlas/plates', `${c.id}.ts`), ts);
  console.log('układ:', c.id, name);
}

// index.ts: układ + fakty -> treść planszy
let s = idx;
for (const [file, name] of Object.entries(names)) {
  s = s.replace(`import { ${name} } from './${file}';`, `import { ${name} } from './${file}';\nimport ${name}_FAKTY from '../data/facts/${file}.json';`);
  s = s.replace(new RegExp(`content: ${name} \\}`), `content: buildPlate(${name}, ${name}_FAKTY as AtlasFactsFile) }`);
}
s = s.replace("import type { AtlasPlateContent, AtlasSystemId } from '../types';",
  "import type { AtlasPlateContent, AtlasSystemId } from '../types';\nimport { buildPlate, type AtlasFactsFile } from '../facts';");
writeFileSync(join(root, 'src/atlas/plates/index.ts'), s);
console.log('index.ts: plansze składane przez buildPlate');
