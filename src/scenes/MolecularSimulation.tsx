import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { QUALITY_PRESETS } from '../core/QualityManager';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';

/**
 * Biconcave erythrocyte geometry (authentic ~7.5 um human discocyte proportions, non-nucleated).
 */
export function createBiconcaveErythrocyteGeometry(radius = 0.044): THREE.LatheGeometry {
  // Parametric Evans-Fung biconcave discocyte profile (smooth continuous rim, zero cylinder seams)
  const pts: THREE.Vector2[] = [];
  const steps = 26;
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    const u2 = sinT * sinT;
    const r = radius * sinT;
    const y = 0.52 * radius * cosT * (0.207 + 2.003 * u2 - 1.123 * u2 * u2);
    pts.push(new THREE.Vector2(r, y));
  }
  const geo = new THREE.LatheGeometry(pts, 28);
  geo.computeVertexNormals();
  return geo;
}

const _dummy = new THREE.Object3D();
const _tmpPos = new THREE.Vector3();
const _tmpTan = new THREE.Vector3();
const _tmpNorm = new THREE.Vector3();
const _tmpBinorm = new THREE.Vector3();
const _upRef = new THREE.Vector3(0, 1, 0);
const _colOxy = new THREE.Color('#ef4444');
const _colDeoxy = new THREE.Color('#6b1d45');
const _colTmp = new THREE.Color();

interface InstancedErythrocytesProps {
  curve: THREE.CatmullRomCurve3;
  baseCount?: number;
  cellRadius?: number;
  radiusSpread?: number;
  speedScale?: number;
  oxygenationMode?: 'arterial' | 'venous' | 'alveolar_transition';
  capillaryDeformRange?: [number, number]; // curve t range where cells squeeze into bullet/parachute profile
  onHeroSample?: (pos: THREE.Vector3, lookAt: THREE.Vector3, tangent: THREE.Vector3) => void;
}

/**
 * GPU-instanced Erythrocyte flow with Poiseuille laminar velocity profile (centerline faster than walls),
 * Windkessel pulsatile arterial surge synchronized with `beatPhase`, organic individual tumbling,
 * and capillary bullet/parachute squeeze deformation in narrow vessels.
 * 100% FPS-independent & Pause/Speed synchronized.
 */
export function InstancedErythrocytes({
  curve,
  baseCount = 260,
  cellRadius = 0.036,
  radiusSpread = 0.04,
  speedScale = 0.16,
  oxygenationMode = 'alveolar_transition',
  capillaryDeformRange = [0.68, 1.0],
  onHeroSample,
}: InstancedErythrocytesProps) {
  const qualityTier = useBiogenesisStore((s) => s.qualityTier);
  const count = Math.max(48, Math.round(baseCount * QUALITY_PRESETS[qualityTier].particleMultiplier));
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const phaseRef = useRef(0);
  const prevMasterTimeRef = useRef(liveSimulationRef.masterTimeSec);

  const geo = useMemo(() => createBiconcaveErythrocyteGeometry(cellRadius), [cellRadius]);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        roughness: 0.24,
        clearcoat: 0.58,
        clearcoatRoughness: 0.18,
      }),
    []
  );

  // Per-cell deterministic distribution (t0, radialFraction, angle, tumblePhase, sizeJitter)
  const cellSeeds = useMemo(() => {
    const arr = new Float32Array(count * 5);
    for (let i = 0; i < count; i++) {
      const ang = (i * 2.39996) % (Math.PI * 2);
      const radialFrac = Math.sqrt(((i * 19 + 7) % 100) / 100); // area-uniform disk distribution
      arr[i * 5 + 0] = i / count;
      arr[i * 5 + 1] = radialFrac;
      arr[i * 5 + 2] = ang;
      arr[i * 5 + 3] = ((i * 31) % 628) * 0.01;
      arr[i * 5 + 4] = 0.90 + ((i * 13) % 21) * 0.01;
    }
    return arr;
  }, [count]);

  useEffect(() => {
    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [geo, mat]);

  useFrame(({ camera }, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const store = useBiogenesisStore.getState();
    const org = liveSimulationRef.organism;
    const dt = Math.min(0.05, Math.max(0, delta));

    // FPS-independent pulsatile flow progression (Windkessel systolic surge + diastolic runoff)
    const timeJump = Math.abs(liveSimulationRef.masterTimeSec - prevMasterTimeRef.current);
    prevMasterTimeRef.current = liveSimulationRef.masterTimeSec;

    const systolicSurge = 0.72 + 0.68 * Math.exp(-Math.pow((org.beatPhase - 0.28) * 4.5, 2));
    if (timeJump > 0.45 && store.mode !== 'interactive') {
      phaseRef.current = liveSimulationRef.masterTimeSec * speedScale;
    } else if (store.started && store.isPlaying) {
      phaseRef.current += dt * store.playbackSpeed * speedScale * systolicSurge;
    }

    const flowT = phaseRef.current;
    const [capStart, capEnd] = capillaryDeformRange;

    for (let i = 0; i < count; i++) {
      const t0 = cellSeeds[i * 5 + 0];
      const radFrac = cellSeeds[i * 5 + 1];
      const ang = cellSeeds[i * 5 + 2];
      const tumble0 = cellSeeds[i * 5 + 3];
      const sizeScale = cellSeeds[i * 5 + 4];

      // Poiseuille laminar flow profile: centerline r=0 moves 1.65x faster than wall r=1!
      const laminarFactor = 1.65 - 0.85 * radFrac * radFrac;
      const t = (t0 + flowT * laminarFactor) % 1;

      curve.getPointAt(t, _tmpPos);
      curve.getTangentAt(t, _tmpTan);

      // Smooth capillary squeeze: narrow radial offset & deform biconcave disc into elongated bullet!
      const squeeze = THREE.MathUtils.smoothstep(t, capStart, capEnd);
      const effSpread = radiusSpread * (1 - squeeze * 0.72);
      const localRad = radFrac * effSpread;

      _tmpNorm.crossVectors(_tmpTan, _upRef);
      if (_tmpNorm.lengthSq() < 1e-4) _tmpNorm.set(1, 0, 0);
      else _tmpNorm.normalize();
      _tmpBinorm.crossVectors(_tmpTan, _tmpNorm).normalize();

      const swirlAng = ang + flowT * (1.8 + radFrac * 1.2);
      const offN = Math.cos(swirlAng) * localRad;
      const offB = Math.sin(swirlAng) * localRad;

      _dummy.position.copy(_tmpPos).addScaledVector(_tmpNorm, offN).addScaledVector(_tmpBinorm, offB);

      // Individual orientation variation + tank-treading alignment as cells squeeze into capillaries
      _dummy.lookAt(_dummy.position.x + _tmpTan.x, _dummy.position.y + _tmpTan.y, _dummy.position.z + _tmpTan.z);
      const freeTumble = 1 - squeeze * 0.78;
      _dummy.rotateX((flowT * 10 + tumble0) * freeTumble + Math.PI * 0.5 * squeeze);
      _dummy.rotateZ(tumble0 * 1.7 * freeTumble);

      // Prevent foreground RBCs from slicing camera near plane
      const camDist = _dummy.position.distanceTo(camera.position);
      const nearFade = THREE.MathUtils.smoothstep(camDist, 0.28, 0.50);

      // Elongate along travel direction (Y in cell local after rotateX) & compress laterally under capillary squeeze
      const stretchZ = 1.0 + squeeze * 0.36;
      const compressRadial = 1.0 - squeeze * 0.24;
      const visScale = nearFade > 0.02 ? nearFade : 0.001;
      _dummy.scale.set(
        sizeScale * compressRadial * visScale,
        sizeScale * stretchZ * visScale,
        sizeScale * compressRadial * visScale
      );
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);

      const oxy =
        oxygenationMode === 'arterial'
          ? 0.96
          : oxygenationMode === 'venous'
            ? 0.16
            : THREE.MathUtils.smoothstep(t, 0.24, 0.62);
      _colTmp.copy(_colDeoxy).lerp(_colOxy, oxy);
      mesh.setColorAt(i, _colTmp);

      if (i === 0 && onHeroSample) {
        const nextT = (t + 0.035) % 1;
        curve.getPointAt(nextT, _tmpNorm);
        onHeroSample(_dummy.position, _tmpNorm, _tmpTan);
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
  brownianJitter?: number;
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
  brownianJitter = 0.035,
}: MoleculeSwarmProps) {
  const qualityTier = useBiogenesisStore((s) => s.qualityTier);
  const effCount = Math.max(18, Math.round(count * QUALITY_PRESETS[qualityTier].particleMultiplier));
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const timeRef = useRef(0);
  const prevMasterTimeRef = useRef(liveSimulationRef.masterTimeSec);

  const geo = useMemo(() => new THREE.IcosahedronGeometry(radius, 1), [radius]);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: emissive ?? color,
        emissiveIntensity: 0.72,
        roughness: 0.28,
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
    const store = useBiogenesisStore.getState();
    const dt = Math.min(0.05, Math.max(0, delta));

    const timeJump = Math.abs(liveSimulationRef.masterTimeSec - prevMasterTimeRef.current);
    prevMasterTimeRef.current = liveSimulationRef.masterTimeSec;
    if (timeJump > 0.45 && store.mode !== 'interactive') {
      timeRef.current = liveSimulationRef.masterTimeSec * speed;
    } else if (store.started && store.isPlaying) {
      timeRef.current += dt * store.playbackSpeed * speed;
    }
    const t = timeRef.current;

    for (let i = 0; i < effCount; i++) {
      const sx = seeds[i * 3 + 0];
      const sy = seeds[i * 3 + 1];
      const sz = seeds[i * 3 + 2];

      const fx = (((sx + t * flowDir[0] + 0.5) % 1 + 1) % 1 - 0.5) * bounds[0];
      const fy = (((sy + t * flowDir[1] + 0.5) % 1 + 1) % 1 - 0.5) * bounds[1];
      const fz = (((sz + t * flowDir[2] + 0.5) % 1 + 1) % 1 - 0.5) * bounds[2];

      // Thermal Brownian agitation superimposed onto macroscopic bulk gradient/flow (never conscious homing!)
      _dummy.position.set(
        origin[0] + fx + Math.sin(t * 5.2 + i * 1.7) * brownianJitter,
        origin[1] + fy + Math.cos(t * 4.4 + i * 2.3) * brownianJitter,
        origin[2] + fz + Math.sin(t * 5.9 + i * 0.9) * brownianJitter
      );
      _dummy.scale.setScalar(1.0);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geo, mat, effCount]} />;
}
