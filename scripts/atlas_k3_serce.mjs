/**
 * E1-K3, partia 1 (gablota serca, M5): fakty podręcznikowe do src/atlas/data/organs/serce.json.
 * Wejście (tylko do odczytu): side-session-notes/…/dyrygent/E1K3_serce_wyszukane.md (cytaty, zdania, źródła) oraz
 * E1K3_serce_kontrola.md (niezależna kontrola + trzecia kontrola Dyrygenta). Zdania i cytaty są KOPIOWANE z tabel,
 * nie przepisywane ręcznie; 8 brzmień sprawdzającego i 1 brzmienie Dyrygenta podmieniają zdanie wyszukującego.
 * Status checked_agent, provenance textbook_consensus („Wiedza podręcznikowa”), accessMode full_text.
 * Liczby z D9 (100 ms, 80–100/min, 70–80%) -> tier 'student' (Rozszerzony); reszta 'primary' (Podstawowy).
 * Uruchomienie: node scripts/atlas_k3_serce.mjs <katalog dyrygent/>
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.argv[2];
if (!dir) throw new Error('podaj katalog z E1K3_serce_wyszukane.md');
const md = readFileSync(join(dir, 'E1K3_serce_wyszukane.md'), 'utf-8').replace(/\r\n/g, '\n');

const EXCLUDED = new Set(['serce.funkcja.przegroda_bez_mieszania', 'serce.funkcja.niebieski_to_umowa']);
// Brzmienia po kontroli (E1K3_serce_kontrola.md): 8 × sprawdzający (OK w trzeciej kontroli), 1 × Dyrygent.
const FINAL = {
  'serce.funkcja.zastawki_jednokierunkowe':
    'W każdym otworze między przedsionkiem a komorą jest zastawka, która zapewnia przepływ krwi tylko w jedną stronę. Są to zastawki przedsionkowo-komorowe, a zastawki w ujściach prowadzących do pnia płucnego i aorty to zastawki półksiężycowate.',
  'serce.funkcja.wezel_sa_rozrusznik':
    'Węzeł zatokowo-przedsionkowy ma najwyższe własne tempo wytwarzania impulsów i nazywa się go rozrusznikiem serca. Zapoczątkowuje rytm zatokowy, czyli prawidłowy rytm pobudzeń, po których serce się kurczy.',
  'serce.funkcja.przewodzenie_sa_av':
    'Impuls z węzła zatokowo-przedsionkowego rozchodzi się po przedsionkach. W węźle przedsionkowo-komorowym jest opóźniany o ok. 0,1 s. Dzięki temu przedsionki mogą zakończyć tłoczenie krwi, zanim impuls pobiegnie dalej.',
  'serce.role.atrioventricular_node':
    'Węzeł przedsionkowo-komorowy leży w dolnej części prawego przedsionka, w przegrodzie przedsionkowo-komorowej. Ta przegroda nie pozwala impulsowi przejść wprost do komór z pominięciem węzła.',
  'serce.funkcja.barwa_krwi_ciemnoczerwona':
    'Hemoglobina związana z tlenem jest jasnoczerwona. W tkankach oddaje część tlenu i staje się ciemniejsza, ciemnoczerwona.',
  'serce.role.right_atrium': 'Prawy przedsionek przyjmuje krew, która wraca do serca z krążenia dużego, czyli z tkanek ciała.',
  'serce.role.chordae_tendineae':
    'Każdy płatek zastawki jest przyczepiony do mocnych pasm tkanki łącznej, czyli nici ścięgnistych. Łączą one płatki z mięśniem brodawkowatym, który wyrasta z dolnej ściany komory.',
  'serce.role.pulmonary_trunk':
    'Pień płucny prowadzi krew odtlenowaną z prawej komory w stronę płuc i dzieli się na prawą i lewą tętnicę płucną. Pień płucny, tętnice płucne i ich odgałęzienia to po urodzeniu jedyne tętnice, które niosą krew uboższą w tlen.',
  'serce.role.venae_cavae': 'Dwie główne żyły krążenia dużego, żyła główna górna i żyła główna dolna, oddają krew do prawego przedsionka.',
};
const WHO = (id) => (id === 'serce.funkcja.przewodzenie_sa_av' ? 'brzmienie Dyrygenta (trzecia kontrola)' : FINAL[id] ? 'brzmienie sprawdzającego, OK w trzeciej kontroli' : 'brzmienie wyszukującego, OK w kontroli');
// Liczby z D9: tylko poziom Rozszerzony
const NUMBERS = new Set(['serce.funkcja.skurcz_przedsionkow_dopelnia', 'serce.funkcja.przedsionki_przed_komorami', 'serce.funkcja.wezel_sa_bez_nerwow', 'serce.funkcja.przewodzenie_sa_av']);
// Doprecyzowanie sekcji z kontroli
const LOCATOR_FIX = { 'serce.role.aorta': 'OS 2e, 20.5 Circulatory Pathways › The Aorta, tabela „Components of the Aorta”, wiersz „Aorta”' };

const rows = [];
let section = '';
for (const line of md.split('\n')) {
  if (line.startsWith('## ')) section = line;
  if (!section.startsWith('## A.') && !section.startsWith('## B.')) continue;
  if (!line.startsWith('| serce.')) continue;
  const cells = line.split(' | ').map((c) => c.replace(/^\| /, '').replace(/ \|$/, '').trim());
  if (cells.length < 6) throw new Error(`zły wiersz: ${line.slice(0, 80)}`);
  const [id, , textPl, quote, source, url] = cells;
  if (EXCLUDED.has(id)) continue;
  // cytat bez zewnętrznych cudzysłowów ASCII (UI dodaje własne); dwa fragmenty z tej samej strony łączy „[…]”
  const q = quote.replace(/^"/, '').replace(/"$/, '').replace(/" oraz "/g, ' […] ').replace(/\[…\](\s*\[…\])+/g, '[…]');
  rows.push({ id, textPl, quote: q, source, url });
}
if (rows.length !== 41) throw new Error(`oczekiwano 41 faktów, jest ${rows.length}`);

const facts = rows.map((r) => {
  const isCM = /NBK367|^CM/.test(r.source);
  const part = r.id.startsWith('serce.role.') ? r.id.slice('serce.role.'.length) : null;
  return {
    id: r.id,
    kind: part ? 'organ_role' : 'organ_function',
    plate: null,
    organ: 'serce',
    ...(part ? { part } : {}),
    textPl: FINAL[r.id] ?? r.textPl,
    status: 'checked_agent',
    provenance: 'textbook_consensus',
    accessMode: 'full_text',
    quote: r.quote,
    locator: LOCATOR_FIX[r.id] ?? r.source.replace(/^OS 2e, ISBN [\d-]+, /, 'OS 2e, '),
    url: r.url,
    referenceIds: [isCM ? 'clinical_methods_cyanosis' : 'openstax_ap2e'],
    tier: NUMBERS.has(r.id) ? 'student' : 'primary',
    checkedBy: {
      report: 'side-session-notes/dyrygent/E1K3_serce_kontrola.md',
      rows: [r.id],
      note: `E1-K3 partia 1: cytat dosłowny potwierdzony w niezależnej kontroli; ${WHO(r.id)} (2026-11-26)`,
    },
  };
});

const out = {
  schemaVersion: 1,
  plate: null,
  organ: 'serce',
  description:
    'Gablota serca (M5): fakty podręcznikowe do panelu „budowa i funkcja” (E1-K3 partia 1). Panel pokazuje tylko statusy checked_* z dopiskiem „Wiedza podręcznikowa”. Teksty interfejsu (legenda) są w polu `interface`, nie w faktach.',
  interface: {
    // D6 (decyzja Dyrygenta): opis barw samej aplikacji, nie fakt podręcznikowy
    legendBloodPl: 'Na tym schemacie krew uboga w tlen jest niebieska.',
  },
  facts: [
    ...facts,
    {
      id: 'serce.curriculum',
      kind: 'curriculum_ref',
      plate: null,
      organ: 'serce',
      status: 'draft',
      referenceIds: [],
      scope: 'P',
      locator: 'V.4.9) (numeracja 2024; w numeracji 2018: V.4.11)',
      quote: 'przedstawia automatyzm pracy serca;',
      notePl: 'Podstawa programowa, biologia, liceum (zpe.gov.pl, rok szkolny 2025/2026, brzmienie z 2024 r.); cytat z dyrygent/podstawy_oceny_narzadow.md §A2',
    },
  ],
};
mkdirSync(join(root, 'src/atlas/data/organs'), { recursive: true });
writeFileSync(join(root, 'src/atlas/data/organs/serce.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`serce.json: ${facts.length} faktów podręcznikowych (${facts.filter((f) => f.tier === 'student').length} z liczbami -> Rozszerzony), ${Object.keys(FINAL).length} brzmień po kontroli.`);
