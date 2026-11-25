/**
 * Walidator palety atlasu (src/atlas/data/palette.json), model §4 spór 11.
 *  1. Pary pokazywane razem: ΔE (CIEDE2000) ≥ minDeltaE przy zwykłym widzeniu, deuteranopii i protanopii
 *     (symulacja Machado, Oliveira i Fernandes 2009, nasilenie 1,0, w liniowym RGB).
 *  2. Menu: każda para układów ΔE ≥ minDeltaE przy zwykłym widzeniu (poza wyjątkami z uzasadnieniem).
 *  3. Jasny wariant (podpisy, linie) na tle strony: kontrast WCAG ≥ 4,5:1.
 *  4. Tokeny w src/index.css są takie same jak w palette.json (CSS jest kopią dla reszty aplikacji).
 * Uruchomienie: node scripts/atlas_check_palette.ts  (kod 0 = wszystko OK)
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type Rgb = [number, number, number];
interface Sys { key: string; token: string; color: string; light: string }
const root = join(import.meta.dirname, '..');
const pal = JSON.parse(readFileSync(join(root, 'src/atlas/data/palette.json'), 'utf-8'));
const MIN: number = pal.validation.minDeltaE;

const hex = (h: string): Rgb => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as Rgb;
const lin = (c: Rgb): Rgb => c.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)) as Rgb;
const mul = (m: number[][], v: Rgb): Rgb => m.map((r) => Math.min(1, Math.max(0, r[0] * v[0] + r[1] * v[1] + r[2] * v[2]))) as Rgb;
const DEUT = [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]];
const PROT = [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]];

function lab(l: Rgb): Rgb {
  const x = (0.4124 * l[0] + 0.3576 * l[1] + 0.1805 * l[2]) / 0.95047;
  const y = 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
  const z = (0.0193 * l[0] + 0.1192 * l[1] + 0.9505 * l[2]) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

function de2000(A: Rgb, B: Rgb): number {
  const [L1, a1, b1] = A;
  const [L2, a2, b2] = B;
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const h1p = ((Math.atan2(b1, a1p) / rad) + 360) % 360;
  const h2p = ((Math.atan2(b2, a2p) / rad) + 360) % 360;
  let dh = h2p - h1p;
  if (C1p * C2p === 0) dh = 0;
  else if (dh > 180) dh -= 360;
  else if (dh < -180) dh += 360;
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dh / 2) * rad);
  const Lbp = (L1 + L2) / 2;
  const Cbp = (C1p + C2p) / 2;
  let hbp = h1p + h2p;
  if (C1p * C2p !== 0) hbp = Math.abs(h1p - h2p) <= 180 ? (h1p + h2p) / 2 : h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;
  const T = 1 - 0.17 * Math.cos((hbp - 30) * rad) + 0.24 * Math.cos(2 * hbp * rad) + 0.32 * Math.cos((3 * hbp + 6) * rad) - 0.2 * Math.cos((4 * hbp - 63) * rad);
  const dth = 30 * Math.exp(-(((hbp - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2);
  const Sc = 1 + 0.045 * Cbp;
  const Sh = 1 + 0.015 * Cbp * T;
  const Rt = -Math.sin(2 * dth * rad) * Rc;
  const dL = (L2 - L1) / Sl;
  const dC = (C2p - C1p) / Sc;
  const dH = dHp / Sh;
  return Math.sqrt(dL * dL + dC * dC + dH * dH + Rt * dC * dH);
}

const VISIONS = { zwykłe: (l: Rgb) => l, deuteranopia: (l: Rgb) => mul(DEUT, l), protanopia: (l: Rgb) => mul(PROT, l) };
function deltaAll(h1: string, h2: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [name, f] of Object.entries(VISIONS)) out[name] = de2000(lab(f(lin(hex(h1)))), lab(f(lin(hex(h2)))));
  return out;
}

const systems: Sys[] = pal.systems;
// Kontekst ma prefiks „kontekst:”, bo „bone” to też klucz układu kostnego.
const colorOf = (k: string): string =>
  k.startsWith('kontekst:') ? pal.context[k.slice(9)] : (systems.find((s) => s.key === k)?.color as string);
let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.log('BŁĄD  ' + msg);
};

// 1. pary pokazywane razem
const st = pal.validation.shownTogether;
const pairs: [string, string, string][] = [];
for (const s of systems) for (const c of st.withContext) pairs.push([s.key, `kontekst:${c}`, 'układ + kolor kontekstu']);
for (const s of st.withVessels) for (const v of ['artery', 'vein']) pairs.push([s, v, 'plansza z naczyniami']);
for (const [a, b, why] of st.pairs) pairs.push([a, b, why]);
let worst = Infinity;
for (const [a, b, why] of pairs) {
  const d = deltaAll(colorOf(a), colorOf(b));
  const m = Math.min(...Object.values(d));
  worst = Math.min(worst, m);
  if (m < MIN) fail(`${a} – ${b} (${why}): ` + Object.entries(d).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', '));
}
console.log(`Pary pokazywane razem: ${pairs.length}, najmniejsza ΔE (wszystkie 3 rodzaje widzenia): ${worst.toFixed(1)}`);

// 2. menu (zwykłe widzenie)
const exc = new Set((pal.validation.menu.exceptions as string[][]).map(([a, b]) => [a, b].sort().join('|')));
let worstMenu = Infinity;
let nMenu = 0;
for (let i = 0; i < systems.length; i++)
  for (let j = i + 1; j < systems.length; j++) {
    const [a, b] = [systems[i], systems[j]];
    if (exc.has([a.key, b.key].sort().join('|'))) continue;
    nMenu++;
    const d = deltaAll(a.color, b.color)['zwykłe'];
    worstMenu = Math.min(worstMenu, d);
    if (d < MIN) fail(`menu: ${a.key} – ${b.key}: ΔE ${d.toFixed(1)} (zwykłe widzenie)`);
  }
console.log(`Pary w menu: ${nMenu} (+ ${exc.size} wyjątek z uzasadnieniem), najmniejsza ΔE: ${worstMenu.toFixed(1)}`);

// 3. kontrast jasnego wariantu na tle
const relLum = (h: string) => {
  const l = lin(hex(h));
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
};
const bg = relLum(pal.context.pageBg);
for (const s of systems) {
  const cr = (relLum(s.light) + 0.05) / (bg + 0.05);
  if (cr < 4.5) fail(`kontrast ${s.key} (jasny ${s.light}) na tle: ${cr.toFixed(1)}:1 < 4,5:1`);
}
console.log('Kontrast jasnych wariantów na tle strony: sprawdzony (WCAG ≥ 4,5:1).');

// 4. zgodność z index.css
const css = readFileSync(join(root, 'src/index.css'), 'utf-8');
for (const s of systems) {
  for (const [tok, val] of [[s.token, s.color], [`${s.token}-light`, s.light]]) {
    const m = css.match(new RegExp(`${tok}:\\s*(#[0-9a-fA-F]{6})`));
    if (!m) fail(`index.css: brak tokenu ${tok}`);
    else if (m[1].toLowerCase() !== val.toLowerCase()) fail(`index.css: ${tok} = ${m[1]}, a w palette.json ${val}`);
  }
}
console.log('Tokeny index.css zgodne z palette.json: sprawdzone.');
console.log(failures ? `WYNIK: ${failures} błędów` : 'WYNIK: paleta OK');
process.exit(failures ? 1 : 0);
