import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { QUALITY_PRESETS } from '../core/QualityManager';
import { useBiogenesisStore } from '../core/SimulationCore';

/**
 * Tworzy realistyczną geometrię erytrocytu (dwuwklęsły dysk bez jądra komórkowego)
 * zamiast prymitywnych kul!
 */
export function createBiconcaveErythrocyteGeometry(radius = 0.045): THREE.LatheGeometry {
  const pts: THREE.Vector2[] = [];
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = Math.sin(t * Math.PI * 0.5) * radius;
    // Biconcave profile: thin center (0.20*R), thicker rim (0.42*R)
    const u = r / radius;
    const halfThick = radius * (0.13 + 0.28 * Math.pow(u, 2) * (1 - 0.58 * Math.pow(u, 4)));
    pts.push(new THREE.Vector2(r, halfThick));
  }
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const r = Math.sin(t * Math.PI * 0.5) * radius;
    const u = r / radius;
    const halfThick = radius * (0.13 + 0.28 * Math.pow(u, 2) * (1 - 0.58 * Math.pow(u, 4)));
    pts.push(new THREE.Vector2(r, -halfThick));
  }
  const geo = new THREE.LatheGeometry(pts, 18);
  geo.computeVertexNormals();
  return geo;
}

const _dummy = new THREE.Object3D();
const _tmpPos = new THREE.Vector3();
const _tmpTan = new THREE.Vector3();
const _colOxy = new THREE.Color('#ef4444');
const _colDeoxy = new THREE.Color('#6b1d45');
const _colTmp = new THREE.Color();

interface InstancedErythrocytesProps {
  curve: THREE.CatmullRomCurve3;
  baseCount?: number;
  radiusSpread?: number;
  speedScale?: number;
  oxygenationMode?: 'arterial' | 'venous' | 'alveolar_transition';
  onHeroSample?: (pos: THREE.Vector3, lookAt: THREE.Vector3) => void;
}

export function InstancedErythrocytes({
  curve,
  baseCount = 240,
  radiusSpread = 0.04,
  speedScale = 0.16,
  oxygenationMode = 'alveolar_transition',
  onHeroSample,
}: InstancedErythrocytesProps) {
  const qualityTier = useBiogenesisStore((s) => s.qualityTier);
  const count = Math.max(40, Math.round(baseCount * QUALITY_PRESETS[qualityTier].particleMultiplier));
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const phaseRef = useRef(0);

  const geo = useMemo(() => createBiconcaveErythrocyteGeometry(0.032), []);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        roughness: 0.28,
        clearcoat: 0.45,
        clearcoatRoughness: 0.2,
      }),
    []
  );

  const offsets = useMemo(() => {
    const arr = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      const ang = (i * 2.39996) % (Math.PI * 2);
      const rad = ((i * 17) % 100) / 100 * radiusSpread;
      arr[i * 4 + 0] = i / count; // initial t
      arr[i * 4 + 1] = Math.cos(ang) * rad;
      arr[i * 4 + 2] = Math.sin(ang) * rad;
      arr[i * 4 + 3] = 0.8 + ((i * 31) % 40) * 0.01; // speed jitter
    }
    return arr;
  }, [count, radiusSpread]);

  useEffect(() => {
    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [geo, mat]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const isPlaying = useBiogenesisStore.getState().isPlaying;
    if (isPlaying) {
      phaseRef.current += Math.min(0.05, delta) * speedScale;
    }

    for (let i = 0; i < count; i++) {
      const t0 = offsets[i * 4 + 0];
      const ox = offsets[i * 4 + 1];
      const oy = offsets[i * 4 + 2];
      const sp = offsets[i * 4 + 3];
      const t = (t0 + phaseRef.current * sp) % 1;

      curve.getPointAt(t, _tmpPos);
      curve.getTangentAt(t, _tmpTan);

      _dummy.position.set(_tmpPos.x + ox, _tmpPos.y + oy, _tmpPos.z);
      _dummy.lookAt(_tmpPos.x + _tmpTan.x, _tmpPos.y + _tmpTan.y, _tmpPos.z + _tmpTan.z);
      _dummy.rotateX(t * 12 + i);
      _dummy.rotateZ(i * 0.7);
      _dummy.scale.setScalar(1.0);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);

      const oxy =
        oxygenationMode === 'arterial'
          ? 0.95
          : oxygenationMode === 'venous'
            ? 0.15
            : THREE.MathUtils.smoothstep(t, 0.25, 0.65);
      _colTmp.copy(_colDeoxy).lerp(_colOxy, oxy);
      mesh.setColorAt(i, _colTmp);

      if (i === 0 && onHeroSample) {
        const nextT = (t + 0.03) % 1;
        curve.getPointAt(nextT, _tmpTan);
        onHeroSample(_tmpPos, _tmpTan);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geo, mat, count]} frustumCulled={false} />;
}

interface MoleculeSwarmProps {
  count?: number;
  color: string;
  emissive?: string;
  radius?: number;
  bounds: [number, number, number];
  origin?: [number, number, number];
  speed?: number;
  flowDir?: [number, number, number];
}

export function MoleculeSwarm({
  count = 120,
  color,
  emissive,
  radius = 0.022,
  bounds,
  origin = [0, 0, 0],
  speed = 0.6,
  flowDir = [0, 1, 0],
}: MoleculeSwarmProps) {
  const qualityTier = useBiogenesisStore((s) => s.qualityTier);
  const effCount = Math.max(18, Math.round(count * QUALITY_PRESETS[qualityTier].particleMultiplier));
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const timeRef = useRef(0);

  const geo = useMemo(() => new THREE.IcosahedronGeometry(radius, 1), [radius]);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: emissive ?? color,
        emissiveIntensity: 0.75,
        roughness: 0.25,
      }),
    [color, emissive]
  );

  const seeds = useMemo(() => {
    const arr = new Float32Array(effCount * 3);
    for (let i = 0; i < effCount; i++) {
      arr[i * 3 + 0] = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 - 0.5;
      arr[i * 3 + 1] = ((Math.sin(i * 78.233) * 19341.123) % 1 + 1) % 1 - 0.5;
      arr[i * 3 + 2] = ((Math.sin(i * 45.164) * 91823.412) % 1 + 1) % 1 - 0.5;
    }
    return arr;
  }, [effCount]);

  useEffect(() => {
    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [geo, mat]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    if (useBiogenesisStore.getState().isPlaying) {
      timeRef.current += Math.min(0.05, delta) * speed;
    }
    const t = timeRef.current;

    for (let i = 0; i < effCount; i++) {
      const sx = seeds[i * 3 + 0];
      const sy = seeds[i * 3 + 1];
      const sz = seeds[i * 3 + 2];

      const fx = (((sx + t * flowDir[0] + 0.5) % 1 + 1) % 1 - 0.5) * bounds[0];
      const fy = (((sy + t * flowDir[1] + 0.5) % 1 + 1) % 1 - 0.5) * bounds[1];
      const fz = (((sz + t * flowDir[2] + 0.5) % 1 + 1) % 1 - 0.5) * bounds[2];

      _dummy.position.set(
        origin[0] + fx + Math.sin(t * 2.1 + i) * 0.03,
        origin[1] + fy + Math.cos(t * 1.7 + i) * 0.03,
        origin[2] + fz + Math.sin(t * 2.5 + i * 0.5) * 0.03
      );
      _dummy.scale.setScalar(1.0);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geo, mat, effCount]} />;
}
