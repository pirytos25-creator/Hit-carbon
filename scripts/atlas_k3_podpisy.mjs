/**
 * E1-K3, partia 2 (opisy ról na planszach mózg, mięśniowy, nerwowy, oddechowy, powłokowy): 60 zatwierdzonych podpisów.
 * Wejście (tylko do odczytu): side-session-notes/…/dyrygent/E1K3_podpisy_wyszukane.md (cytaty, źródła) i
 * E1K3_podpisy_kontrola.md (runda 1, runda 2, trzecia kontrola Dyrygenta).
 * Brzmienie ostateczne: runda 2 (POPRAWKA) > runda 1 (POPRAWKA potwierdzona w rundzie 2) > tekst wyszukującego (OK).
 * ODRZUĆ (6) zostaje bez zmian (na planszy sama nazwa).
 * Fakty: checked_agent, provenance textbook_consensus, quote (dosłowny, bez zewnętrznych cudzysłowów ASCII, „ + ” łączy dwa
 * źródła), locator, url, referenceIds (OpenStax: openstax_ap2e; StatPearls: wpis z NBK i PMID), checkedBy z rundą.
 * Ogólny opis funkcji idzie też do drugiego stanu tej samej struktury, jeśli tam nie ma sprawdzonego opisu.
 * Uruchomienie: node scripts/atlas_k3_podpisy.mjs <katalog dyrygent/>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const D = process.argv[2];
if (!D) throw new Error('podaj katalog dyrygent/');
const W = readFileSync(join(D, 'E1K3_podpisy_wyszukane.md'), 'utf-8').replace(/\r\n/g, '\n');
const K = readFileSync(join(D, 'E1K3_podpisy_kontrola.md'), 'utf-8').replace(/\r\n/g, '\n');
const REPORT = 'side-session-notes/dyrygent/E1K3_podpisy_kontrola.md';
const OS_ISBN = 'ISBN 978-1-951693-42-8';

const cells = (l) => l.replace(/^\| /, '').replace(/ \|$/, '').split(' | ').map((x) => x.trim());
const rowsOf = (txt, from, to) => {
  const a = txt.indexOf(from);
  const b = to ? txt.indexOf(to, a + 1) : txt.length;
  if (a < 0 || b < 0) throw new Error(`brak sekcji ${from}`);
  return txt.slice(a, b).split('\n').filter((l) => /^\| [a-z]+\.role\./.test(l)).map(cells);
};
const order = [];
const R = {};
for (const c of rowsOf(W, '## Tabela', '## Podsumowanie')) {
  order.push(c[0]);
  R[c[0]] = { id: c[0], proposal: c[1], quoteCell: c[2], sourceCell: c[3], urlCell: c[4] };
}
for (const c of rowsOf(K, '## Tabela', '## Uwagi do metadanych')) Object.assign(R[c[0]], { r1: c[3], r1text: c[4] });
for (const c of rowsOf(K, '## Runda 2', '### Dla integratora')) Object.assign(R[c[0]], { r2: c[1], r2text: c[2] });

// ---- cytaty: rozwiązanie odwołań „(jak wyżej)”, „(jak <id>)”, „Podpis ryciny …:”
const stripQ = (t) => t.trim().replace(/^"/, '').replace(/"$/, '');
// „ + ” łączy dwa źródła; etykieta drugiego źródła („OS §11.6:”, „SP:”) nie należy do cytatu
const joinParts = (t) => t.split(/"\s*\+\s*(?:(?:OS|SP)[^"]*?:\s*)?"/).map(stripQ).join(' + ');
const quoteOf = {};
let prev = null;
for (const id of order) {
  const r = R[id];
  let q = r.quoteCell;
  const plate = id.split('.')[0];
  q = q.replace(/^Podpis rycin[y]? [\d.]+:\s*/, '');
  const explicit = q.match(/^\(jak ([a-z_]+\.(?:rest|sprint))[^)]*\)\s*$/);
  if (explicit) q = quoteOf[`${plate}.role.${explicit[1]}`];
  else if (/^\([^)]*\)\s*$/.test(q)) q = quoteOf[prev];
  else if (/^\([^)]*\)\s*\+\s*"/.test(q)) q = `${quoteOf[prev]} + ${joinParts(q.replace(/^\([^)]*\)\s*\+\s*/, ''))}`;
  else if (/^\([^)]*\)\s*"/.test(q)) q = joinParts(q.replace(/^\([^)]*\)\s*/, ''));
  else q = joinParts(q.replace(/\s*\+\s*wiersz tabeli „[^”]*”:\s*/, ' + '));
  if (!q) throw new Error(`${id}: nie da się ustalić cytatu (${r.quoteCell.slice(0, 60)})`);
  quoteOf[id] = q;
  prev = id;
}

// ---- źródła: StatPearls (NBK, PMID, tytuł, rok) i sekcje OpenStax
const SP = new Map(); // NBK -> {title, year, pmid}
for (const r of Object.values(R))
  for (const m of r.sourceCell.matchAll(/SP, „([^”]+)” \((\d{4}) Jan–\), (NBK\d+)[^;+]*; PMID (\d+)/g))
    SP.set(m[3], { title: m[1], year: Number(m[2]), pmid: m[4] });
// tytuły z uwag kontrolera (wiersze skrócone)
SP.set('NBK513304', { title: 'Anatomy, Bony Pelvis and Lower Limb: Tibialis Anterior Muscles', year: 2023, pmid: '30020676' });
SP.set('NBK538238', { title: 'Anatomy, Thorax, Intercostal Nerves', year: 2023, pmid: '30855826' });
for (const r of Object.values(R)) for (const m of r.sourceCell.matchAll(/NBK(\d+)/g)) if (!SP.has(`NBK${m[1]}`)) throw new Error(`brak metadanych NBK${m[1]}`);

const refsTs = readFileSync(join(root, 'src/science/ScientificReferences.ts'), 'utf-8');
const refsLf = refsTs.replace(/\r\n/g, '\n');
const existing = new Map();
for (const m of refsLf.matchAll(/^ {2}(\w+): \{\n([\s\S]*?)\n {2}\},/gm)) {
  const n = m[2].match(/NBK(\d+)/);
  if (n) existing.set(`NBK${n[1]}`, m[1]);
}
const spId = (nbk) => existing.get(nbk) ?? `statpearls_${nbk.toLowerCase()}`;
const newRefs = [...SP.entries()].filter(([nbk]) => !existing.has(nbk));

// źródło i adres dla wiersza (skrócone wiersze dziedziczą po wierszu, z którego mają cytat)
const sourceOf = {};
const urlOf = {};
prev = null;
for (const id of order) {
  const r = R[id];
  const plate = id.split('.')[0];
  const explicit = r.quoteCell.match(/^\(jak ([a-z_]+\.(?:rest|sprint))/);
  const from = explicit ? `${plate}.role.${explicit[1]}` : prev;
  const short = !/^(OS, ISBN|SP, „)/.test(r.sourceCell);
  sourceOf[id] = short && from && !/NBK513304|NBK538238/.test(r.sourceCell) ? sourceOf[from] : r.sourceCell;
  urlOf[id] = /^\(jak wyżej\)$/.test(r.urlCell) && from ? urlOf[from] : r.urlCell;
  prev = id;
}
const referenceIdsOf = (src) => {
  const ids = [];
  if (/\bOS\b/.test(src)) ids.push('openstax_ap2e');
  for (const m of src.matchAll(/NBK(\d+)/g)) ids.push(spId(`NBK${m[1]}`));
  return [...new Set(ids)];
};
const locatorOf = (id, src) => {
  if (id.startsWith('miesniowy.role.rectus_abdominis'))
    return `OpenStax A&P 2e (${OS_ISBN}), §11.4 Axial Muscles of the Abdominal Wall, and Thorax; Table 11.6 „Muscles of the Abdomen” (kolumny: Movement | Target | Target motion direction | Prime mover | Origin | Insertion), wiersz: Sitting up | Vertebral column | Flexion | Rectus abdominis | Pubis | Sternum; ribs 5 and 7`;
  return src
    .split(' + ')
    .map((part) => {
      const nbk = part.match(/NBK\d+/)?.[0];
      if (nbk) {
        const m = SP.get(nbk);
        const sec = part.match(/NBK\d+, ([^;]+);/)?.[1] ?? 'Introduction';
        return `StatPearls „${m.title}” (${m.year}), ${nbk}, ${sec}; PMID ${m.pmid}`;
      }
      return part.replace(/^OS, ISBN [\d-]+, /, `OpenStax A&P 2e (${OS_ISBN}), `).replace(/^OS /, `OpenStax A&P 2e (${OS_ISBN}), `);
    })
    .join(' + ');
};
const accessOf = (src) => (/\bOS\b/.test(src) ? 'full_text' : 'abstract'); // SP: sekcja Introduction z rekordu PubMed

// ---- brzmienie ostateczne
const finalOf = (r) => {
  if (r.r1 === 'ODRZUĆ') return null;
  if (r.r2 === 'POPRAWKA') return { text: r.r2text, how: 'brzmienie rundy 2, OK w trzeciej kontroli Dyrygenta' };
  if (r.r1 === 'POPRAWKA') return { text: r.r1text, how: 'brzmienie rundy 1, OK w rundzie 2' };
  if (r.r1 === 'OK') return { text: r.proposal, how: 'brzmienie wyszukującego, OK w rundzie 1' };
  throw new Error(`${r.id}: nieznany werdykt ${r.r1}`);
};

// ---- zapis do facts/<plansza>.json
const plates = [...new Set(order.map((id) => id.split('.')[0]))];
const files = Object.fromEntries(plates.map((p) => [p, JSON.parse(readFileSync(join(root, 'src/atlas/data/facts', `${p}.json`), 'utf-8'))]));
// pokazywane na planszy: sprawdzone opisy i opisy budowy ('anatomy') – takich nie nadpisujemy
const shown = (st) => st === 'checked_agent' || st === 'checked_human' || st === 'anatomy';
let written = 0;
let copied = 0;
const approved = new Set();
const apply = (rec, f, id, how) => {
  const src = sourceOf[id];
  let quote = quoteOf[id];
  let locator = locatorOf(id, src);
  if (id === 'mozg.role.brainstem.sprint') {
    // uwaga kontrolera: dopisać zdanie z OS §13.2, że rdzeń przedłużony należy do pnia mózgu (pobrane dosłownie 2026-11-26)
    quote += ' + The brain stem comprises three regions: the midbrain, the pons, and the medulla.';
    locator += ` + OpenStax A&P 2e (${OS_ISBN}), §13.2 The Central Nervous System › The Brain Stem`;
  }
  Object.assign(rec, {
    textPl: f.text,
    status: 'checked_agent',
    provenance: 'textbook_consensus',
    accessMode: accessOf(src),
    quote,
    locator,
    url: urlOf[id],
    referenceIds: referenceIdsOf(src),
    checkedBy: { report: REPORT, rows: [id], note: `E1-K3 partia 2: ${how} (2026-11-26)` },
  });
  rec.auto = (rec.auto ?? []).filter((x) => x !== 'provenance' && x !== 'accessMode');
  delete rec.provenanceNote;
};
for (const id of order) {
  const f = finalOf(R[id]);
  if (!f) continue;
  const plate = id.split('.')[0];
  const rec = files[plate].facts.find((x) => x.id === id);
  if (!rec) throw new Error(`brak rekordu ${id}`);
  apply(rec, f, id, f.how);
  approved.add(id);
  written++;
}
// ogólny opis funkcji także w drugim stanie, gdy tam nie ma sprawdzonego opisu ani własnego zatwierdzonego
for (const id of order) {
  if (!approved.has(id)) continue;
  const other = id.endsWith('.rest') ? id.replace(/\.rest$/, '.sprint') : id.replace(/\.sprint$/, '.rest');
  if (approved.has(other) || R[other]) continue;
  const plate = id.split('.')[0];
  const rec = files[plate].facts.find((x) => x.id === other);
  if (!rec || shown(rec.status)) continue;
  apply(rec, finalOf(R[id]), id, `ten sam ogólny opis co ${id}`);
  rec.checkedBy.rows = [id];
  copied++;
}
for (const [p, data] of Object.entries(files)) {
  const file = join(root, 'src/atlas/data/facts', `${p}.json`);
  const raw = readFileSync(file, 'utf-8');
  writeFileSync(file, (JSON.stringify(data, null, 1) + '\n').replace(/\n/g, raw.includes('\r\n') ? '\r\n' : '\n'));
}

// ---- nowe wpisy StatPearls w ScientificReferences.ts
if (newRefs.length) {
  const block = newRefs
    .map(([nbk, m]) => `  ${spId(nbk)}: {
    id: '${spId(nbk)}',
    authors: 'StatPearls Publishing (autorzy rozdziału wg NCBI Bookshelf)',
    year: ${m.year},
    title: '${m.title.replace(/'/g, "\\'")}',
    journal: 'StatPearls [Internet], StatPearls Publishing, Treasure Island (FL) (NCBI Bookshelf ${nbk})',
    pmid: '${m.pmid}',
    url: 'https://www.ncbi.nlm.nih.gov/books/${nbk}/',
    acts: [],
    summaryPl: 'Rozdział StatPearls (sekcja Introduction w rekordzie PubMed); źródło opisów ról w atlasie (E1-K3 partia 2).',
  },
`)
    .join('');
  const anchor = '  // E1-K3 (fakty podręcznikowe, gablota serca M5)';
  if (!refsLf.includes(anchor)) throw new Error('brak kotwicy w ScientificReferences.ts');
  const outTs = refsLf.replace(anchor, `  // E1-K3 partia 2: rozdziały StatPearls (NBK + PMID) dla opisów ról\n${block}${anchor}`);
  writeFileSync(join(root, 'src/science/ScientificReferences.ts'), refsTs.includes('\r\n') ? outTs.replace(/\n/g, '\r\n') : outTs);
}
console.log(`partia 2: ${written} opisów zatwierdzonych, ${copied} skopiowanych do drugiego stanu, ${order.length - written} odrzuconych; nowe źródła StatPearls: ${newRefs.length}`);
