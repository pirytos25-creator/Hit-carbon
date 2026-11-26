/**
 * AgX z three.js 0.169 (ShaderChunk/tonemapping_pars_fragment) przeniesiony do JS, plus jego przybliżona odwrotność.
 * Cel (warunek M4): w profilu `film` barwa tokenu palety po AgX ma ΔE00 ≤ 10 względem tokenu.
 * Kompensacja: kolor bazowy materiału dobrany tak, by po oświetleniu (współczynnik `irradiance`) i AgX wyszedł token.
 */
type V3 = [number, number, number];

// macierze GLSL mat3(c0, c1, c2) są kolumnowe: M·v = c0·v.x + c1·v.y + c2·v.z
const mul = (c: [V3, V3, V3], v: V3): V3 => [
  c[0][0] * v[0] + c[1][0] * v[1] + c[2][0] * v[2],
  c[0][1] * v[0] + c[1][1] * v[1] + c[2][1] * v[2],
  c[0][2] * v[0] + c[1][2] * v[1] + c[2][2] * v[2],
];
const SRGB_TO_2020: [V3, V3, V3] = [[0.6274, 0.0691, 0.0164], [0.3293, 0.9195, 0.088], [0.0433, 0.0113, 0.8956]];
const R2020_TO_SRGB: [V3, V3, V3] = [[1.6605, -0.1246, -0.0182], [-0.5876, 1.1329, -0.1006], [-0.0728, -0.0083, 1.1187]];
const INSET: [V3, V3, V3] = [[0.856627153315983, 0.137318972929847, 0.11189821299995], [0.0951212405381588, 0.761241990602591, 0.0767994186031903], [0.0482516061458583, 0.101439036467562, 0.811302368396859]];
const OUTSET: [V3, V3, V3] = [[1.1271005818144368, -0.1413297634984383, -0.14132976349843826], [-0.11060664309660323, 1.157823702216272, -0.11060664309660294], [-0.016493938717834573, -0.016493938717834257, 1.2519364065950405]];
const MIN_EV = -12.47393, MAX_EV = 4.026069;

const contrast = (x: number) => {
  const x2 = x * x, x4 = x2 * x2;
  return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232;
};

/** AgX dla koloru liniowego sRGB → liniowy sRGB (0..1), jak shader three.js. */
export function agx(linear: V3, exposure = 1.05): V3 {
  let c: V3 = [linear[0] * exposure, linear[1] * exposure, linear[2] * exposure];
  c = mul(INSET, mul(SRGB_TO_2020, c));
  c = c.map((x) => {
    const l = (Math.log2(Math.max(x, 1e-10)) - MIN_EV) / (MAX_EV - MIN_EV);
    return contrast(Math.min(1, Math.max(0, l)));
  }) as V3;
  c = mul(OUTSET, c).map((x) => Math.pow(Math.max(0, x), 2.2)) as V3;
  c = mul(R2020_TO_SRGB, c);
  return c.map((x) => Math.min(1, Math.max(0, x))) as V3;
}

export const srgbToLinear = (x: number) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
export const linearToSrgb = (x: number) => (x <= 0.0031308 ? x * 12.92 : 1.055 * x ** (1 / 2.4) - 0.055);

export function hexToLinear(hex: string): V3 {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => srgbToLinear(parseInt(h.slice(i, i + 2), 16) / 255)) as V3;
}
export function linearToHex(c: V3): string {
  return '#' + c.map((x) => Math.round(Math.min(1, Math.max(0, linearToSrgb(x))) * 255).toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------- CIELAB i ΔE00 (CIEDE2000), jak w check:atlas
export function linearToLab(c: V3): V3 {
  const M = [[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]];
  const w = [0.95047, 1, 1.08883];
  const xyz = M.map((r, i) => (r[0] * c[0] + r[1] * c[1] + r[2] * c[2]) / w[i]);
  const f = xyz.map((x) => (x > 0.008856 ? Math.cbrt(x) : 7.787 * x + 16 / 116));
  return [116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])];
}

export function deltaE00(l1: V3, l2: V3): number {
  const [L1, a1, b1] = l1, [L2, a2, b2] = l2;
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const h1 = (Math.atan2(b1, a1p) / rad + 360) % 360, h2 = (Math.atan2(b2, a2p) / rad + 360) % 360;
  let dh = h2 - h1;
  if (dh > 180) dh -= 360; else if (dh < -180) dh += 360;
  const dL = L2 - L1, dC = C2p - C1p, dH = 2 * Math.sqrt(C1p * C2p) * Math.sin((dh / 2) * rad);
  const Lb = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2;
  const hb = Math.abs(h1 - h2) > 180 ? (h1 + h2 + 360) / 2 : (h1 + h2) / 2;
  const T = 1 - 0.17 * Math.cos((hb - 30) * rad) + 0.24 * Math.cos(2 * hb * rad) + 0.32 * Math.cos((3 * hb + 6) * rad) - 0.2 * Math.cos((4 * hb - 63) * rad);
  const SL = 1 + (0.015 * (Lb - 50) ** 2) / Math.sqrt(20 + (Lb - 50) ** 2), SC = 1 + 0.045 * Cbp, SH = 1 + 0.015 * Cbp * T;
  const RT = -2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7)) * Math.sin(60 * Math.exp(-(((hb - 275) / 25) ** 2)) * rad);
  return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH));
}

/**
 * Model światła sceny dla kompensacji: wynik ≈ AgX(baza · irradiance + lift), gdzie `lift` to szare rozjaśnienie
 * od światła wypełniającego i otoczenia (ono najbardziej odbarwia). Dopasowuje się go z jednego zrzutu bez kompensacji.
 */
export interface LightModel { irradiance: number; lift: number; exposure: number }
export const DEFAULT_LIGHT: LightModel = { irradiance: 1, lift: 0, exposure: 1.05 };

const renderAgx = (base: V3, lm: LightModel): V3 => agx([base[0] * lm.irradiance + lm.lift, base[1] * lm.irradiance + lm.lift, base[2] * lm.irradiance + lm.lift], lm.exposure);

/** Dopasowanie modelu światła do par (token, zmierzony kolor piksela) z renderu BEZ kompensacji. */
export function fitLightModel(samples: { tokenHex: string; measuredHex: string }[], exposure = 1.05): LightModel {
  let best: LightModel = { ...DEFAULT_LIGHT, exposure }, bestErr = Infinity;
  for (let irr = 0.4; irr <= 2.0001; irr += 0.05) {
    for (let lift = 0; lift <= 0.1201; lift += 0.005) {
      const lm = { irradiance: irr, lift, exposure };
      let err = 0;
      for (const s of samples) err += deltaE00(linearToLab(hexToLinear(s.measuredHex)), linearToLab(renderAgx(hexToLinear(s.tokenHex), lm)));
      if (err < bestErr) { bestErr = err; best = lm; }
    }
  }
  return best;
}

const compCache = new Map<string, V3>();

/**
 * Kolor bazowy (liniowy) minimalizujący ΔE00 między tokenem a wynikiem AgX(baza · irr + lift).
 * Uwaga: AgX z założenia odbarwia nasycone barwy, więc część tokenów (np. artery #D93240) leży POZA jego gamą:
 * najlepszy osiągalny wynik bez światła to ΔE00 ≈ 3,5 przy ciemniejszej czerwieni. Dlatego cel to min ΔE, a nie równe RGB.
 */
export function compensateForAgX(tokenHex: string, light: Partial<LightModel> = {}): V3 {
  const lm: LightModel = { ...DEFAULT_LIGHT, ...light };
  const key = `${tokenHex}|${lm.irradiance}|${lm.lift}|${lm.exposure}`;
  const hit = compCache.get(key);
  if (hit) return hit;
  const target = linearToLab(hexToLinear(tokenHex));
  const err = (b: V3) => deltaE00(target, linearToLab(renderAgx(b, lm)));
  let best: V3 = hexToLinear(tokenHex), bestE = err(best);
  const n = 20;
  for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) for (let k = 0; k <= n; k++) {
    const b: V3 = [i / n, j / n, k / n];
    const e = err(b);
    if (e < bestE) { bestE = e; best = b; }
  }
  // dokładniej wokół najlepszego punktu
  let step = 1 / n;
  for (let pass = 0; pass < 4; pass++) {
    step /= 2;
    const c = best;
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) for (let k = -2; k <= 2; k++) {
      const b: V3 = [c[0] + i * step, c[1] + j * step, c[2] + k * step].map((x) => Math.min(1, Math.max(0, x))) as V3;
      const e = err(b);
      if (e < bestE) { bestE = e; best = b; }
    }
  }
  compCache.set(key, best);
  return best;
}

/** ΔE00 przewidywany dla skompensowanego tokenu (do raportu i testów). */
export function predictedDeltaE(tokenHex: string, light: Partial<LightModel> = {}): number {
  const lm: LightModel = { ...DEFAULT_LIGHT, ...light };
  return deltaE00(linearToLab(hexToLinear(tokenHex)), linearToLab(renderAgx(compensateForAgX(tokenHex, lm), lm)));
}

export function compensateHexForAgX(tokenHex: string, light: Partial<LightModel> = {}): string {
  return linearToHex(compensateForAgX(tokenHex, light));
}
