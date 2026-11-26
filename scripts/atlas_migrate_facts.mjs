/**
 * Migracja E1 (K1): z treści plansz (src/atlas/plates/*.ts) do danych L1:
 *  - src/atlas/data/structures.json   pojęcia anatomiczne (ID bez strony, PL/LA, układy wiele-do-wielu, glif);
 *  - src/atlas/data/mesh_bindings.json  ID siatek `za:` / `hra:` dla kotwic (strona, licencja, structureId);
 *  - src/atlas/data/facts/<plansza>.json jeden rekord na fakt (liczby, wartości spoczynkowe, role, podsumowania,
 *    zdania o „sprincie”) + facts/_wspolne.json (słowniczek).
 * Migracja odtwarza dzisiejszy stan 1:1 (sprawdza to scripts/atlas_check_data.mjs). Pola `provenance` i `accessMode`
 * są wyliczane regułami (oznaczone `auto: true`), `checkedBy` pochodzi z komentarzy przy statusach w plikach planszy.
 * Uruchomienie: node scripts/atlas_migrate_facts.mjs
 */
import { build } from 'esbuild';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(mkdtempSync(join(tmpdir(), 'atlas-mig-')), 'bundle.mjs');
await build({
  stdin: {
    contents: `export { ATLAS_SYSTEMS } from './src/atlas/plates/index.ts';
export { SCIENTIFIC_REFERENCES } from './src/science/ScientificReferences.ts';
export { ATLAS_GLOSSARY } from './src/atlas/glossary.ts';`,
    resolveDir: root,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'silent',
});
const { ATLAS_SYSTEMS, SCIENTIFIC_REFERENCES, ATLAS_GLOSSARY } = await import(pathToFileURL(out).href);
const palette = JSON.parse(readFileSync(join(root, 'src/atlas/data/palette.json'), 'utf-8'));

// ---------------------------------------------------------------- pomocnicze
const slug = (t) =>
  String(t)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
const systemOfPlate = (id) => palette.systems.find((s) => s.plate === id);

/** Pochodzenie faktu (reguły; `auto: true`): podręcznik / metaanaliza / symulacja / badanie pierwotne. */
function provenanceOf(refIds, status) {
  if (status === 'anatomy') return null; // opis budowy: osobny status, nie pochodzenie liczby
  const refs = (refIds ?? []).map((id) => SCIENTIFIC_REFERENCES[id]).filter(Boolean);
  if (!refs.length) return null;
  const txt = (r) => `${r.id} ${r.title} ${r.journal} ${r.summaryPl ?? ''}`;
  if (refs.every((r) => /^statpearls_|^kenney_2022|openstax|textbook|podręcznik/i.test(txt(r)))) return 'textbook_consensus';
  if (refs.some((r) => /meta-analy|metaanaliz|systematic review/i.test(txt(r)))) return 'meta_analysis';
  if (refs.some((r) => /simulation|symulacj|computational model/i.test(txt(r)))) return 'model_simulation';
  return 'primary_study';
}
/** Tryb dostępu do tekstu źródła (reguły na lokalizatorze i komentarzu). */
function accessModeOf(locator, note) {
  const t = `${locator ?? ''} ${note ?? ''}`;
  if (/Exa|indeks(u)? wyszukiwarki|search index/i.test(t)) return 'search_index';
  if (/kopii? skanu|studylib|scan/i.test(t)) return 'third_party_scan';
  if (/rozdz\.|tab\.|tabela|ryc\.|Results|Methods|Discussion|s\. \d|akapit|Table|Fig/i.test(t)) return 'full_text';
  if (/abstrakt|abstract/i.test(t)) return 'abstract';
  return null;
}
/** Komentarz przy statusie -> checkedBy { report, rows, note }. */
function checkedByOf(comment, plate) {
  if (!comment) return null;
  let report = comment.match(/[\w.-]+\.md/)?.[0] ?? null;
  const rows = [...comment.matchAll(/#\d+|poz\. \d+(?:[-–]\d+)?|K\d #?\d+/g)].map((m) => m[0]);
  // Same numery wierszy (#n) bez nazwy pliku to wiersze audytu faktów tej planszy (docs/atlas_audyt/fakty_<plansza>.md).
  const inferred = !report && rows.length > 0 && !!plate;
  if (inferred) report = `fakty_${plate}.md`;
  return { report, rows, note: comment.trim(), ...(inferred ? { reportInferred: true } : {}) };
}

// komentarze przy statusach w źródłach plansz
const srcOf = {};
for (const f of readdirSync(join(root, 'src/atlas/plates'))) if (f.endsWith('.ts')) srcOf[f.replace('.ts', '')] = readFileSync(join(root, 'src/atlas/plates', f), 'utf-8');
const lineComment = (src, idx) => {
  const end = src.indexOf('\n', idx);
  const line = src.slice(idx, end);
  const c = line.indexOf('//');
  return c >= 0 ? line.slice(c + 2).trim() : '';
};
function commentNear(plate, anchorRe, fieldRe) {
  const src = srcOf[plate] ?? '';
  const m = anchorRe.exec(src);
  if (!m) return '';
  const rest = src.slice(m.index, m.index + 4000);
  const f = fieldRe.exec(rest);
  return f ? lineComment(src, m.index + f.index + 1) : ''; // +1: pomiń znak nowej linii
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------------------------------------------------------------- structures.json
const structures = new Map();
const structureIdOf = (l) => slug(l.nameLat || `pl ${l.namePl}`);
for (const sys of ATLAS_SYSTEMS) {
  const c = sys.content;
  if (!c) continue;
  const ps = systemOfPlate(c.id);
  for (const l of c.labels) {
    const id = structureIdOf(l);
    if (!structures.has(id)) structures.set(id, { id, namePl: l.namePl, nameLa: l.nameLat ?? null, systems: [], plates: [], glyph: ps?.glyph ?? null });
    const s = structures.get(id);
    if (ps && !s.systems.includes(ps.key)) s.systems.push(ps.key);
    if (!s.plates.includes(c.id)) s.plates.push(c.id);
  }
}

// ---------------------------------------------------------------- mesh_bindings.json (statycznie ze skryptów plansz)
const SKIP = new Set(['views', 'point', 'curve', 'objects', 't', 'R', 'L', 'l', 'r', 'front', 'back', 'side', 'detail', 'body_front', 'offset', 'zband', 'xband', 'frac']);
const NC = [/^Kidney\.(l|r)$/, /^Renal pelvis\.(l|r)$/, /^Cochlea\.(l|r)$/, /^Vestibule\.(l|r)$/, /^Intrarenal (arteries|veins) of (left|right) kidney$/];
const bindings = [];
const labelByAnchor = {};
for (const sys of ATLAS_SYSTEMS) for (const l of sys.content?.labels ?? []) labelByAnchor[`${sys.id}/${l.anchor}`] = l;
for (const sys of ATLAS_SYSTEMS) {
  const py = join(root, 'blender/atlas', `plate_${sys.id}.py`);
  let src = '';
  try { src = readFileSync(py, 'utf-8'); } catch { continue; }
  const seen = new Set();
  for (const m of src.matchAll(/^\s*"(\w+)":\s*\{\s*"(objects|point|curve)":\s*(.+)$/gm)) {
    const key = m[1];
    if (seen.has(key)) continue;
    seen.add(key);
    const l = labelByAnchor[`${sys.id}/${key}`];
    if (!l) continue; // kotwica bez podpisu (np. pomocnicza)
    const expr = m[3].split('"views"')[0];
    const lits = [...expr.matchAll(/"([^"]+)"/g)].map((x) => x[1]).filter((x) => !SKIP.has(x) && x !== key && x.length > 2);
    const structureId = structureIdOf(l);
    if (!lits.length) {
      bindings.push({ id: null, plate: sys.id, anchor: key, structureId, side: null, source: null, license: null, resolved: false,
        note: 'obiekty liczone w kodzie skryptu planszy; pełne powiązanie da zapis siatek przez atlas_lib przy renderze (E3-0)' });
      continue;
    }
    for (const name of lits) {
      const hra = /^VH_|^NIH_|^Allen_/.test(name) || /^3d-vh/.test(name);
      const side = /\.l$/.test(name) ? 'left' : /\.r$/.test(name) ? 'right' : null;
      bindings.push({
        id: `${hra ? 'hra' : 'za'}:${name}`,
        plate: sys.id,
        anchor: key,
        structureId,
        side,
        source: hra ? 'HuBMAP HRA' : 'Z-Anatomy',
        license: hra ? 'CC BY 4.0' : NC.some((re) => re.test(name)) ? 'NC (zablokowane)' : 'CC BY-SA 4.0',
        resolved: true,
      });
    }
  }
}

// ---------------------------------------------------------------- facts/<plansza>.json
const factsDir = join(root, 'src/atlas/data/facts');
mkdirSync(factsDir, { recursive: true });
const all = {};
for (const sys of ATLAS_SYSTEMS) {
  const c = sys.content;
  if (!c) continue;
  const recs = [];
  for (const m of c.metrics) {
    const base = `${c.id}.metric.${slug(m.labelPl)}`;
    const labRe = new RegExp(`labelPl: '${esc(m.labelPl)}'`);
    const cStatus = commentNear(c.id, labRe, /\n\s*status: /);
    const cRest = commentNear(c.id, labRe, /\n\s*restStatus: /);
    const common = {
      plate: c.id,
      labelPl: m.labelPl,
      unit: m.unit ?? null,
      referenceIds: m.referenceIds ?? [],
      evidenceLevel: m.evidenceLevel,
      quote: m.quote ?? null,
      locator: m.locator ?? null,
      conversionNote: m.conversionNote ?? null,
      protocolMismatch: m.protocolMismatch ?? null,
      measuredAt: m.measuredAt ?? null,
      tier: m.tier ?? 'primary',
    };
    recs.push({
      id: base,
      kind: 'metric',
      ...common,
      value: m.sprint,
      notePl: m.notePl ?? null,
      seeAlsoPlate: m.seeAlsoPlate ?? null,
      status: m.status ?? 'draft',
      provenance: provenanceOf(m.referenceIds, m.status),
      accessMode: accessModeOf(m.locator, cStatus),
      auto: ['provenance', 'accessMode'],
      checkedBy: checkedByOf(cStatus, c.id),
      order: c.metrics.indexOf(m),
    });
    recs.push({
      id: `${base}.rest`,
      kind: 'metric_rest',
      ...common,
      value: m.rest,
      status: m.restStatus ?? m.status ?? 'draft',
      restStatusExplicit: m.restStatus !== undefined,
      provenance: provenanceOf(m.referenceIds, m.restStatus ?? m.status),
      accessMode: accessModeOf(m.locator, cRest),
      auto: ['provenance', 'accessMode'],
      checkedBy: checkedByOf(cRest && !/zgromadzenie D1/.test(cRest) ? cRest : cStatus, c.id),
    });
  }
  for (const l of c.labels) {
    const anRe = new RegExp(`anchor: '${esc(l.anchor)}'`);
    const comment = commentNear(c.id, anRe, /\n\s*roleStatus: /);
    for (const state of ['rest', 'sprint']) {
      const st = l.roleStatus?.[state] ?? 'draft';
      const ev = typeof l.evidence === 'string' ? l.evidence : l.evidence?.[state] ?? null;
      recs.push({
        id: `${c.id}.role.${l.anchor}.${state}`,
        kind: 'role',
        plate: c.id,
        anchor: l.anchor,
        view: l.view,
        structureId: structureIdOf(l),
        state,
        textPl: l.role[state],
        status: st,
        referenceIds: l.referenceIds ?? [],
        evidence: ev,
        conversionNote: l.conversionNote ?? null,
        tier: l.tier ?? 'primary',
        provenance: provenanceOf(l.referenceIds, st),
        accessMode: null,
        auto: ['provenance'],
        checkedBy: checkedByOf(comment, c.id),
      });
    }
  }
  const sumComment = lineComment(srcOf[c.id] ?? '', (srcOf[c.id] ?? '').indexOf('summaryStatus:'));
  for (const state of ['rest', 'sprint']) {
    const st = c.summaryStatus?.[state] ?? 'draft';
    recs.push({
      id: `${c.id}.summary.${state}`,
      kind: 'summary',
      plate: c.id,
      state,
      textPl: c.summary[state],
      status: st,
      referenceIds: c.summaryReferenceIds?.[state] ?? [],
      provenance: provenanceOf(c.summaryReferenceIds?.[state], st),
      accessMode: null,
      auto: ['provenance'],
      checkedBy: checkedByOf(sumComment, c.id),
    });
    const v = c.summaryVerified?.[state];
    if (v) recs.push({ id: `${c.id}.summaryVerified.${state}`, kind: 'summary_verified', plate: c.id, state, textPl: v.text, referenceIds: v.referenceIds, status: 'checked_agent', checkedBy: { report: v.source.split(',')[0].trim(), rows: [], note: v.source } });
  }
  if (c.protocolNotePl) {
    const idx = (srcOf[c.id] ?? '').indexOf('protocolNoteStatus:');
    recs.push({
      id: `${c.id}.protocolNote`,
      kind: 'protocol_note',
      plate: c.id,
      textPl: c.protocolNotePl,
      status: c.protocolNoteStatus ?? 'draft',
      referenceIds: [],
      provenance: null,
      accessMode: null,
      checkedBy: checkedByOf(idx >= 0 ? lineComment(srcOf[c.id], idx) : ''),
    });
  }
  all[c.id] = recs;
  writeFileSync(join(factsDir, `${c.id}.json`), JSON.stringify({ schemaVersion: 1, plate: c.id, facts: recs }, null, 1) + '\n');
}
const common = ATLAS_GLOSSARY.map((g) => ({
  id: `_wspolne.glossary.${g.id}`, kind: 'glossary', plate: null, textPl: g.textPl, status: g.status, referenceIds: g.referenceIds,
  quote: g.quote ?? null, locator: g.locator ?? null, provenance: provenanceOf(g.referenceIds, g.status), accessMode: accessModeOf(g.locator, ''), auto: ['provenance', 'accessMode'], checkedBy: null,
}));
writeFileSync(join(factsDir, '_wspolne.json'), JSON.stringify({ schemaVersion: 1, plate: null, facts: common }, null, 1) + '\n');

writeFileSync(join(root, 'src/atlas/data/structures.json'), JSON.stringify({ schemaVersion: 1, structures: [...structures.values()].sort((a, b) => a.id.localeCompare(b.id)) }, null, 1) + '\n');
writeFileSync(join(root, 'src/atlas/data/mesh_bindings.json'), JSON.stringify({ schemaVersion: 1, bindings }, null, 1) + '\n');
const nF = Object.values(all).reduce((n, r) => n + r.length, 0) + common.length;
console.log(`MIGRACJA: ${structures.size} pojęć, ${bindings.length} powiązań siatek (nierozwiązane: ${bindings.filter((b) => !b.resolved).length}), ${nF} rekordów faktów w ${Object.keys(all).length + 1} plikach`);
