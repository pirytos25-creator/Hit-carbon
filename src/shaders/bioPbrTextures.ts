import * as THREE from 'three';

export type BioTissueType =
  | 'skin'
  | 'muscle'
  | 'myocardium'
  | 'endothelium'
  | 'membrane'
  | 'cortex'
  | 'gym_floor';

export interface BioTextureSet {
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  albedoMap?: THREE.CanvasTexture;
}

const _cache = new Map<BioTissueType, BioTextureSet>();

function hash2(x: number, y: number, seed: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}

function valueNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number, seed: number, octaves = 4): number {
  let v = 0;
  let amp = 0.5;
  let freq = 1.0;
  for (let i = 0; i < octaves; i++) {
    v += amp * valueNoise(x * freq, y * freq, seed + i * 19.3);
    freq *= 2.02;
    amp *= 0.5;
  }
  return v;
}

/**
 * Voronoi cellular distance for cobblestone endothelial cells / trabecular patterns.
 */
function cellular(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  let minD = 9.0;
  let secondD = 9.0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = ix + dx + hash2(ix + dx, iy + dy, seed) * 0.85;
      const cy = iy + dy + hash2(ix + dx, iy + dy, seed + 51.1) * 0.85;
      const d = Math.hypot(cx - x, cy - y);
      if (d < minD) {
        secondD = minD;
        minD = d;
      } else if (d < secondD) {
        secondD = d;
      }
    }
  }
  return Math.max(0, Math.min(1, secondD - minD));
}

function computeHeightSample(type: BioTissueType, u: number, v: number): { h: number; rough: number; r: number; g: number; b: number } {
  // Periodic tiling coordinates mapped gently so seams stay subtle
  const tu = u * 12;
  const tv = v * 12;

  switch (type) {
    case 'skin': {
      const pore = fbm(u * 42, v * 42, 11, 3);
      const ridge = Math.sin(u * 65 + fbm(u * 14, v * 14, 7, 2) * 3.5) * 0.5 + 0.5;
      const h = pore * 0.68 + ridge * 0.32;
      const rough = 0.42 + pore * 0.24;
      return { h, rough, r: 255, g: 245, b: 240 };
    }
    case 'muscle': {
      // Strong anisotropic longitudinal striations + cross Z-band modulation
      const warp = fbm(u * 8, v * 8, 3, 2) * 0.25;
      const fibers = Math.sin((u + warp) * 140) * 0.5 + 0.5;
      const sarcomereBand = Math.sin(v * 110 + warp * 4) * 0.5 + 0.5;
      const fascicle = fbm(u * 20, v * 6, 17, 3);
      const h = fibers * 0.52 + sarcomereBand * 0.23 + fascicle * 0.25;
      const rough = 0.28 + (1 - fibers) * 0.22;
      const tone = 165 + Math.round(fibers * 55 + fascicle * 35);
      return { h, rough, r: Math.min(255, tone), g: Math.round(tone * 0.28), b: Math.round(tone * 0.26) };
    }
    case 'myocardium': {
      const helical = Math.sin((u * 0.7 + v * 0.5) * 95 + fbm(u * 10, v * 10, 5, 2) * 2.5) * 0.5 + 0.5;
      const micro = fbm(u * 26, v * 26, 23, 3);
      const h = helical * 0.58 + micro * 0.42;
      const rough = 0.22 + micro * 0.20;
      const base = 155 + Math.round(h * 72);
      return { h, rough, r: Math.min(255, base), g: Math.round(base * 0.24), b: Math.round(base * 0.28) };
    }
    case 'endothelium': {
      // Cobblestone endothelial cells elongated along flow (V axis)
      const cell = cellular(u * 10, v * 5.2, 31);
      const ridge = Math.pow(Math.max(0, 1 - cell * 2.2), 1.6);
      const micro = fbm(u * 18, v * 12, 41, 3);
      const h = (1 - ridge) * 0.72 + micro * 0.28;
      const rough = 0.26 + ridge * 0.26;
      const red = Math.round(145 + h * 75);
      const green = Math.round(28 + h * 34);
      const blue = Math.round(38 + h * 42);
      return { h, rough, r: red, g: green, b: blue };
    }
    case 'membrane': {
      // Lipid bilayer fluid domains + embedded protein bumps
      const fluid = fbm(tu * 1.4, tv * 1.4, 53, 4);
      const bump = cellular(u * 14, v * 14, 61);
      const h = fluid * 0.65 + (1 - bump) * 0.35;
      const rough = 0.28 + fluid * 0.25;
      return { h, rough, r: 220, g: 215, b: 245 };
    }
    case 'cortex': {
      // Cortical gyri micro-folding & subtle capillary network
      const n1 = fbm(u * 16, v * 16, 71, 4);
      const vessel = Math.max(0, 1 - Math.abs(fbm(u * 12 + 4, v * 12 + 4, 83, 3) - 0.5) * 14);
      const h = n1 * 0.78 + vessel * 0.22;
      const rough = 0.36 + (1 - vessel) * 0.18;
      const r = Math.min(255, Math.round(218 - vessel * 35 + n1 * 22));
      const g = Math.min(255, Math.round(178 - vessel * 85 + n1 * 20));
      const b = Math.min(255, Math.round(176 - vessel * 75 + n1 * 20));
      return { h, rough, r, g, b };
    }
    case 'gym_floor': {
      const grain = hash2(Math.floor(u * 256), Math.floor(v * 256), 97);
      const broad = fbm(tu * 0.9, tv * 0.9, 103, 3);
      const h = grain * 0.45 + broad * 0.55;
      const rough = 0.68 + grain * 0.22;
      const c = Math.round(28 + h * 26);
      return { h, rough, r: c, g: c + 2, b: c + 6 };
    }
  }
}

export function getBioTextureSet(type: BioTissueType, repeatX = 1, repeatY = 1): BioTextureSet {
  const existing = _cache.get(type);
  if (existing) return existing;

  const size = 256;
  const heightBuf = new Float32Array(size * size);

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const roughCtx = roughCanvas.getContext('2d')!;
  const roughImg = roughCtx.createImageData(size, size);

  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const albedoCtx = albedoCanvas.getContext('2d')!;
  const albedoImg = albedoCtx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const s = computeHeightSample(type, u, v);
      const idx = y * size + x;
      heightBuf[idx] = s.h;

      const rv = Math.max(0, Math.min(255, Math.round(s.rough * 255)));
      roughImg.data[idx * 4 + 0] = rv;
      roughImg.data[idx * 4 + 1] = rv;
      roughImg.data[idx * 4 + 2] = rv;
      roughImg.data[idx * 4 + 3] = 255;

      albedoImg.data[idx * 4 + 0] = s.r;
      albedoImg.data[idx * 4 + 1] = s.g;
      albedoImg.data[idx * 4 + 2] = s.b;
      albedoImg.data[idx * 4 + 3] = 255;
    }
  }
  roughCtx.putImageData(roughImg, 0, 0);
  albedoCtx.putImageData(albedoImg, 0, 0);

  // Convert heightfield to tangent-space Normal Map (Sobel filter)
  const normCanvas = document.createElement('canvas');
  normCanvas.width = size;
  normCanvas.height = size;
  const normCtx = normCanvas.getContext('2d')!;
  const normImg = normCtx.createImageData(size, size);
  const strength = type === 'endothelium' || type === 'muscle' ? 3.2 : 2.1;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const xm = (x - 1 + size) % size;
      const xp = (x + 1) % size;
      const ym = (y - 1 + size) % size;
      const yp = (y + 1) % size;
      const dx = (heightBuf[y * size + xp] - heightBuf[y * size + xm]) * strength;
      const dy = (heightBuf[yp * size + x] - heightBuf[ym * size + x]) * strength;
      const invLen = 1.0 / Math.sqrt(dx * dx + dy * dy + 1.0);
      const nx = -dx * invLen;
      const ny = -dy * invLen;
      const nz = 1.0 * invLen;
      const idx = (y * size + x) * 4;
      normImg.data[idx + 0] = Math.round((nx * 0.5 + 0.5) * 255);
      normImg.data[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      normImg.data[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      normImg.data[idx + 3] = 255;
    }
  }
  normCtx.putImageData(normImg, 0, 0);

  const setupTex = (canvas: HTMLCanvasElement, isColor: boolean) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.needsUpdate = true;
    return tex;
  };

  const set: BioTextureSet = {
    normalMap: setupTex(normCanvas, false),
    roughnessMap: setupTex(roughCanvas, false),
    albedoMap:
      type === 'muscle' || type === 'myocardium' || type === 'endothelium' || type === 'cortex' || type === 'gym_floor'
        ? setupTex(albedoCanvas, true)
        : undefined,
  };

  _cache.set(type, set);
  return set;
}

export function applyBioPbrSurface(
  mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial,
  type: BioTissueType,
  normalScale = 0.65,
  repeatX = 3,
  repeatY = 3
) {
  const texSet = getBioTextureSet(type, repeatX, repeatY);
  mat.normalMap = texSet.normalMap;
  mat.normalScale.set(normalScale, normalScale);
  mat.roughnessMap = texSet.roughnessMap;
  mat.needsUpdate = true;
}

export function disposeAllBioTextures() {
  _cache.forEach((set) => {
    set.normalMap.dispose();
    set.roughnessMap.dispose();
    set.albedoMap?.dispose();
  });
  _cache.clear();
}
