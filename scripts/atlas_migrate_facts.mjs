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
// Po E1-K2 źródłem prawdy faktów są facts/*.json, a plates/*.ts trzymają sam układ: wtedy skrypt NIE zapisuje faktów
// (komentarzy ze statusami już nie ma), tylko odtwarza structures.json i mesh_bindings.json.
const FACTS_FROM_TS = !readFileSync(join(root, 'src/atlas/plates/index.ts'), 'utf-8').includes('buildPlate(');
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
// Węzły HuBMAP: nazwa węzła -> plik GLB (z bloku JSON każdego pliku w atlas_raw/hubmap), żeby ID miało postać
// `hra:<plik.glb>/<węzeł>` (kontrakt z wizualizatorem 3D, model §3.1).
const RAW = process.env.ATLAS_RAW || join(root, '..', '..', '..', 'atlas_raw');
const hraNodeFile = new Map();
function scanGlb(dir) {
  let ents = [];
  try { ents = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    const full = join(dir, e.name);
    if (e.isDirectory()) { scanGlb(full); continue; }
    if (!e.name.endsWith('.glb')) continue;
    const buf = readFileSync(full);
    const len = buf.readUInt32LE(12);
    const json = JSON.parse(buf.toString('utf8', 20, 20 + len));
    for (const n of json.nodes ?? []) if (n.name) { if (!hraNodeFile.has(n.name)) hraNodeFile.set(n.name, []); hraNodeFile.get(n.name).push(e.name); }
  }
}
for (const cand of [join(RAW, 'hubmap'), 'C:/Users/piryt/Desktop/Luźny Vibecoading/HIIt/atlas_raw/hubmap']) if (!hraNodeFile.size) scanGlb(cand);
const bindings = [];
const labelByAnchor = {};
for (const sys of ATLAS_SYSTEMS) for (const l of sys.content?.labels ?? []) labelByAnchor[`${sys.id}/${l.anchor}`] = l;
for (const sys of ATLAS_SYSTEMS) {
  const py = join(root, 'blender/atlas', `plate_${sys.id}.py`);
  let src = '';
  try { src = readFileSync(py, 'utf-8'); } catch { continue; }
  const seen = new Set();
  // pliki GLB wczytywane przez skrypt planszy: wśród nich szukamy węzła HuBMAP
  const plateGlbs = new Set([...src.matchAll(/([A-Za-z0-9_-]+\.glb)/g)].map((x) => x[1]));
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
      bindings.push({ meshId: null, plate: sys.id, anchor: key, structureId, side: null, primary: true, source: null, license: null, resolved: false,
        note: 'obiekty liczone w kodzie skryptu planszy; uzupełni je lista siatek z eksportu 3D (atlas_export_glb.py)' });
      continue;
    }
    lits.forEach((name, i) => {
      const hra = /^VH_|^NIH_|^Allen_|^SBU_/.test(name) || /^3d-vh/.test(name);
      const files = hra ? hraNodeFile.get(name) ?? [] : [];
      const file = files.find((f) => plateGlbs.has(f)) ?? files[0] ?? null;
      const side = /\.l$|_L$|left/i.test(name) ? 'l' : /\.r$|_R$|right/i.test(name) ? 'r' : 'mid';
      bindings.push({
        meshId: hra ? `hra:${file ?? '?'}/${name}` : `za:${name.replace(/\.\d{3}$/, '')}`,
        plate: sys.id,
        anchor: key,
        structureId,
        side,
        primary: i === 0,
        source: hra ? 'HuBMAP HRA' : 'Z-Anatomy',
        license: hra ? 'CC BY 4.0' : NC.some((re) => re.test(name)) ? 'NC (zablokowane)' : 'CC BY-SA 4.0',
        resolved: !hra || !!file,
        ...(hra && !file ? { note: 'nie znaleziono węzła w plikach atlas_raw/hubmap' } : {}),
      });
    });
  }
}

// Uzupełnienie brakujących siatek kotwic z eksportu 3D (wizualizator: atlas_export_glb.py):
// public/atlas3d/<plansza>/bindings.json (albo anchors_meshes.json), pole `anchors: { kotwica: [meshId, ...] }`.
// Obok `anchorMethod: { kotwica: "objects" | "nearest:<x>mm" }`: "objects" = obiekty wprost ze słownika planszy
// (rozwiązane); "nearest" = najbliższa widoczna struktura od punktu kotwicy – meshId wpisujemy, ale zostaje
// resolved: false (do ręcznej kontroli) z zapisaną odległością.
// Podpisy, których kotwic skrypt planszy nie opisuje słownikiem (np. pokarmowy): miejsce na siatki z eksportu.
for (const [k, l] of Object.entries(labelByAnchor)) {
  const [plate, anchor] = k.split('/');
  if (bindings.some((b) => b.plate === plate && b.anchor === anchor)) continue;
  let exp = null;
  try {
    exp = JSON.parse(readFileSync(join(root, 'public/atlas3d', plate, 'bindings.json'), 'utf-8'));
  } catch {
    /* brak eksportu */
  }
  if (!exp?.anchors?.[anchor]?.length) continue; // podpis bez siatki (np. schemat mikroskopowy) – nie ma czego wiązać
  bindings.push({ meshId: null, plate, anchor, structureId: structureIdOf(l), side: null, primary: true, source: null, license: null, resolved: false,
    note: 'skrypt planszy nie ma słownika tej kotwicy; siatki tylko z eksportu 3D' });
}
// Pochodzenie siatki: pole structures[].origin eksportu ("zanatomy" | "hubmap" | "plate"). "plate" = obiekt utworzony
// przez skrypt planszy z geometrii Z-Anatomy (utwór zależny -> CC BY-SA 4.0). Bez pola: zgadujemy po prefiksie.
const ORIGIN = {
  zanatomy: ['Z-Anatomy', 'CC BY-SA 4.0'],
  hubmap: ['HuBMAP HRA', 'CC BY 4.0'],
  plate: ['geometria planszy', 'CC BY-SA 4.0'],
};
const originOf = (exp, meshId) =>
  ORIGIN[(exp?.structures ?? []).find((x) => x.meshId === meshId)?.origin] ??
  (meshId.startsWith('hra:') ? ORIGIN.hubmap : /^za:(ATL|[A-Z]{3,5})_/.test(meshId) ? ORIGIN.plate : ORIGIN.zanatomy);

// Kontrola wpisów statycznych (ze słownika skryptu planszy) wobec modelu 3D z eksportu:
//  - nazwa węzła HuBMAP (np. Yao_* z węzła chłonnego NIH) -> hra:<plik.glb>/<węzeł>, CC BY 4.0;
//  - obiekt utworzony przez skrypt planszy (origin "plate") -> „geometria planszy”;
//  - obiektu nie ma w modelu (pusty znacznik ATL_mk_*, zmienna albo wyrażenie ze skryptu) -> wpis usuwany, gdy
//    kotwica ma inne prawdziwe siatki, inaczej resolved: false i uzupełnienie z eksportu niżej.
const expCache = {};
const expOf = (plate) => {
  if (!(plate in expCache)) {
    try {
      expCache[plate] = JSON.parse(readFileSync(join(root, 'public/atlas3d', plate, 'bindings.json'), 'utf-8'));
    } catch {
      expCache[plate] = null;
    }
  }
  return expCache[plate];
};
const staticFix = { hra: 0, plate: 0, removed: 0, unresolved: 0 };
const notInModel = [];
for (const b of bindings) {
  if (!b.meshId?.startsWith('za:')) continue;
  const exp = expOf(b.plate);
  const name = b.meshId.slice(3);
  const hraIds = (exp?.structures ?? []).filter((s) => s.origin === 'hubmap' && s.meshId.endsWith(`/${name}`)).map((s) => s.meshId);
  const files = hraNodeFile.get(name) ?? [];
  if (hraIds.length || files.length) {
    Object.assign(b, { meshId: hraIds[0] ?? `hra:${files[0]}/${name}`, source: ORIGIN.hubmap[0], license: ORIGIN.hubmap[1] });
    staticFix.hra++;
    continue;
  }
  if (!exp?.structures) continue;
  const origin = exp.structures.find((s) => s.meshId === b.meshId)?.origin;
  if (origin) {
    [b.source, b.license] = ORIGIN[origin] ?? [b.source, b.license];
    if (origin === 'plate') staticFix.plate++;
    continue;
  }
  notInModel.push(b);
}
for (const b of [...notInModel]) {
  const exp = expOf(b.plate);
  const zaNames = exp.structures.filter((s) => s.origin !== 'hubmap').map((s) => s.meshId);
  const name = b.meshId.slice(3);
  // "Nazwa@z<1.57" = obiekt z filtrem wysokości w skrypcie planszy
  const base = name.split('@')[0];
  // literał-filtr w wyrażeniu punktu (np. [o for o in heart_z if "ventricle" in o.name]) -> obiekty „<Jedno słowo> <literał>”
  // (Right/Left ventricle), bez drobnych części typu „… papillary muscle of right ventricle”
  const matched = zaNames.includes(`za:${base}`)
    ? [`za:${base}`]
    : zaNames.filter((m) => m.endsWith(` ${base}`) && !m.slice(3, -base.length - 1).includes(' '));
  if (!matched.length) continue;
  bindings.splice(
    bindings.indexOf(b),
    1,
    ...matched.map((meshId, k) => ({
      ...b,
      meshId,
      side: /\.l$/.test(meshId) ? 'l' : /\.r$/.test(meshId) ? 'r' : 'mid',
      primary: b.primary && k === 0,
      source: originOf(exp, meshId)[0],
      license: originOf(exp, meshId)[1],
      resolved: true,
      note: `ze słownika planszy („${name}”), obiekty dopasowane w modelu 3D`,
    })),
  );
  notInModel.splice(notInModel.indexOf(b), 1);
  staticFix.matched = (staticFix.matched ?? 0) + matched.length;
}
for (const b of notInModel) {
  const others = bindings.some((x) => x !== b && !notInModel.includes(x) && x.plate === b.plate && x.anchor === b.anchor && x.resolved);
  if (others) {
    bindings.splice(bindings.indexOf(b), 1);
    staticFix.removed++;
  } else {
    Object.assign(b, { resolved: false, note: `w modelu 3D nie ma obiektu ${b.meshId} (znacznik albo wyrażenie w skrypcie planszy)` });
    staticFix.unresolved++;
  }
}
const filledAnchors = new Set();
let fromExport = 0;
for (const b of bindings.filter((x) => !x.resolved)) {
  let exp = null;
  for (const f of ['bindings.json', 'anchors_meshes.json']) {
    try {
      exp = JSON.parse(readFileSync(join(root, 'public/atlas3d', b.plate, f), 'utf-8'));
      break;
    } catch {
      /* brak pliku eksportu */
    }
  }
  // Kontrakt: hra:<plik.glb>/<węzeł> – sama nazwa pliku (eksport bywa z podfolderem, np. hra:female/<plik.glb>/…).
  const ids = exp?.anchors?.[b.anchor]?.map((m) => m.replace(/^hra:(?:[^/]+\/)+?([^/]+\.glb\/)/, 'hra:$1'));
  if (!Array.isArray(ids) || !ids.length) {
    if (exp) b.note = 'brak tej kotwicy w eksporcie 3D (element przekroju schematycznego, bez siatki w modelu)';
    continue;
  }
  const method = String(exp?.anchorMethod?.[b.anchor] ?? 'objects');
  const near = /^nearest:([\d.]+)\s*mm$/.exec(method);
  const anchorKey = `${b.plate}/${b.anchor}`;
  if (filledAnchors.has(anchorKey)) {
    bindings.splice(bindings.indexOf(b), 1); // kotwica już uzupełniona z eksportu (kilka pustych wpisów)
    continue;
  }
  filledAnchors.add(anchorKey);
  bindings.splice(
    bindings.indexOf(b),
    1,
    ...ids.map((meshId, k) => ({
      meshId,
      plate: b.plate,
      anchor: b.anchor,
      structureId: b.structureId,
      side: /\.l$|_L$|left/i.test(meshId) ? 'l' : /\.r$|_R$|right/i.test(meshId) ? 'r' : 'mid',
      primary: k === 0,
      source: originOf(exp, meshId)[0],
      license: originOf(exp, meshId)[1],
      method: near ? 'nearest' : 'objects',
      ...(near ? { distanceMm: Number(near[1]) } : {}),
      resolved: !near,
      note: near ? `z eksportu 3D: najbliższa struktura (${near[1]} mm) – do ręcznej kontroli` : 'z eksportu 3D (public/atlas3d)',
    })),
  );
  fromExport++;
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
  if (FACTS_FROM_TS) writeFileSync(join(factsDir, `${c.id}.json`), JSON.stringify({ schemaVersion: 1, plate: c.id, facts: recs }, null, 1) + '\n');
}
const common = ATLAS_GLOSSARY.map((g) => ({
  id: `_wspolne.glossary.${g.id}`, kind: 'glossary', plate: null, textPl: g.textPl, status: g.status, referenceIds: g.referenceIds,
  quote: g.quote ?? null, locator: g.locator ?? null, provenance: provenanceOf(g.referenceIds, g.status), accessMode: accessModeOf(g.locator, ''), auto: ['provenance', 'accessMode'], checkedBy: null,
}));
if (FACTS_FROM_TS) writeFileSync(join(factsDir, '_wspolne.json'), JSON.stringify({ schemaVersion: 1, plate: null, facts: common }, null, 1) + '\n');

writeFileSync(join(root, 'src/atlas/data/structures.json'), JSON.stringify({ schemaVersion: 1, structures: [...structures.values()].sort((a, b) => a.id.localeCompare(b.id)) }, null, 1) + '\n');
writeFileSync(join(root, 'src/atlas/data/mesh_bindings.json'), JSON.stringify({ schemaVersion: 1, bindings }, null, 1) + '\n');
const nF = Object.values(all).reduce((n, r) => n + r.length, 0) + common.length;
if (!FACTS_FROM_TS) console.log('Fakty: źródłem prawdy są facts/*.json (E1-K2), nie nadpisuję ich.');
console.log(`Wpisy statyczne wobec modelu 3D: HuBMAP ${staticFix.hra}, geometria planszy ${staticFix.plate}, dopasowane w modelu ${staticFix.matched ?? 0}, bez obiektu w modelu: usunięte ${staticFix.removed}, do uzupełnienia ${staticFix.unresolved}`);
console.log(`MIGRACJA (powiązania z eksportu 3D: ${fromExport}): ${structures.size} pojęć, ${bindings.length} powiązań siatek (nierozwiązane: ${bindings.filter((b) => !b.resolved).length}; węzłów HuBMAP w GLB: ${hraNodeFile.size}), ${nF} rekordów faktów w ${Object.keys(all).length + 1} plikach`);
