// Testy wspólnego modułu (M4): node src/biomotion/__tests__/selftest.mjs  (Node ≥ 22: TypeScript przez usuwanie typów)
import { BioClock } from '../clock/BioClock.ts';
import { getSegmentAt } from '../timeline/segments.ts';
import { agx, hexToLinear, linearToLab, deltaE00, compensateForAgX, predictedDeltaE } from '../look/agx.ts';

let fail = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'OK ' : 'BŁĄD'}  ${msg}`); if (!cond) fail++; };
const wrap = (d) => (d < 0 ? d + 1 : d);

// 1. BioClock: przy zmianie tętna faza przyrasta o dt·HR/60 (stara formuła (t·HR/60)%1 skacze)
{
  const c = new BioClock(); const dt = 1 / 60; let t = 100; c.update(t, 150, 30);
  let maxErrNew = 0, maxErrOld = 0, prevOld = (t * 150) / 60 % 1, prevNew = c.beatPhase;
  for (let i = 1; i <= 600; i++) {
    t += dt; const hr = i < 300 ? 150 : 151 + (i % 7); // zaokrąglone tętno zmienia się co klatkę
    c.update(t, hr, 30);
    const expect = (dt * hr) / 60;
    maxErrNew = Math.max(maxErrNew, Math.abs(wrap(c.beatPhase - prevNew) - expect));
    const old = (t * hr) / 60 % 1; maxErrOld = Math.max(maxErrOld, Math.min(Math.abs(wrap(old - prevOld) - expect), 1 - Math.abs(wrap(old - prevOld) - expect)));
    prevNew = c.beatPhase; prevOld = old;
  }
  ok(maxErrNew < 1e-9, `BioClock: błąd przyrostu fazy ${maxErrNew.toExponential(1)} (stara formuła: skok do ${maxErrOld.toFixed(3)} cyklu)`);
  ok(maxErrOld > 0.1, 'stara formuła rzeczywiście skacze przy zmianie tętna (test wykrywa błąd)');
  const r = c.update(t + 5, 150, 30); ok(r.seeked && Math.abs(c.beatPhase - (((t + 5) * 150) / 60 % 1)) < 1e-9, 'przewinięcie: faza deterministyczna z (t·HR/60)%1');
}
// 2. getSegmentAt jak getActAtTime (12 × 90 s, przejście w ostatnich 5 s)
{
  const segs = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, startSec: i * 90, durationSec: 90 }));
  const out = {}; getSegmentAt(segs, 180 + 45, out); ok(out.segment.id === 3 && Math.abs(out.progress - 0.5) < 1e-9 && out.transitionBlend === 0, 'odcinki: akt 3 w połowie');
  getSegmentAt(segs, 269, out); ok(out.segment.id === 3 && Math.abs(out.transitionBlend - 0.8) < 1e-9, 'odcinki: przejście w ostatnich 5 s');
}
// 3. AgX: zgodność z formułą three.js (szarość średnia) i kompensacja tokenów
{
  const g = agx([0.18, 0.18, 0.18], 1); ok(Math.abs(g[0] - g[1]) < 1e-3 && Math.abs(g[1] - g[2]) < 1e-3 && g[0] > 0.1 && g[0] < 0.3, `AgX: 18% szarości → ${g[0].toFixed(3)} (neutralna)`);
  for (const [tok, max] of [['#D93240', 4.5], ['#3E6FD8', 1.5]]) {
    const d = predictedDeltaE(tok); ok(d <= max, `kompensacja ${tok} bez światła sceny: ΔE00 przewidywane ${d.toFixed(1)} (≤ ${max})`);
  }
  const raw = deltaE00(linearToLab(hexToLinear('#D93240')), linearToLab(agx(hexToLinear('#D93240'))));
  ok(raw > 5, `artery bez kompensacji przez AgX: ΔE00 ${raw.toFixed(1)} (powód kompensacji)`);
  ok(compensateForAgX('#D93240').every((x) => x >= 0 && x <= 1), 'kompensacja daje kolor w zakresie 0..1');
}
console.log(fail ? `WYNIK: ${fail} błędów` : 'WYNIK: biomotion OK');
process.exit(fail ? 1 : 0);
