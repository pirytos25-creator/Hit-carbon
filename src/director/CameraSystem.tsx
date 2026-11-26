import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { ACT_SHOT_CHOREOGRAPHY, LightingPresetId } from './ShotChoreography';
import { evaluateShots, followShot, dampFov, dollyZoom, microDrift } from '../biomotion';

export const erythrocyteCameraTarget = {
  active: false,
  position: new THREE.Vector3(0.4, -24.0, 0.2),
  lookAt: new THREE.Vector3(0.8, -24.0, 0.0),
};

export const liveCameraMetaRef: {
  lightingPreset: LightingPresetId;
  dofFocusDistance: number;
  dofBokehScale: number;
  activeShotId: string;
} = {
  lightingPreset: 'gym_daylight',
  dofFocusDistance: 0.025,
  dofBokehScale: 1.4,
  activeShotId: 'act01-shot01-gym-panorama',
};

const _desiredPos = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();
const _currentTarget = new THREE.Vector3(0, 1.05, 0);
const _lookMatrix = new THREE.Matrix4();
const _targetQuat = new THREE.Quaternion();
// Szyna kamery, tłumienie, dolly-zoom i mikrodryf pochodzą ze wspólnego modułu (src/biomotion, M4);
// ewaluacja ujęć jest 1:1 z dawnym evaluateActShot, więc ruch kamery filmu się nie zmienia.

export function CameraSystem() {
  const { camera } = useThree();
  const mode = useBiogenesisStore((s) => s.mode);
  const currentActId = useBiogenesisStore((s) => s.currentActId);
  const followErythrocyteCam = useBiogenesisStore((s) => s.followErythrocyteCam);
  const isPlaying = useBiogenesisStore((s) => s.isPlaying);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orbitRef = useRef<any>(null);

  const isFreeOrbit =
    mode === 'exploration' ||
    ((currentActId === 4 || currentActId === 8 || currentActId === 9 || currentActId === 10 || currentActId === 12) &&
      !isPlaying);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, Math.max(0.001, delta));
    const actId = liveSimulationRef.actId;
    const u = liveSimulationRef.actProgress;
    const cam = camera as THREE.PerspectiveCamera;

    // Erythrocyte explicit camera toggle in Act III
    if (actId === 3 && followErythrocyteCam && erythrocyteCameraTarget.active) {
      liveCameraMetaRef.lightingPreset = 'bloodstream_organic';
      liveCameraMetaRef.dofFocusDistance = 0.015;
      liveCameraMetaRef.dofBokehScale = 2.0;

      const damp = 1 - Math.exp(-5.5 * dt);
      cam.position.lerp(erythrocyteCameraTarget.position, damp);
      _currentTarget.lerp(erythrocyteCameraTarget.lookAt, damp);
      _lookMatrix.lookAt(cam.position, _currentTarget, cam.up);
      _targetQuat.setFromRotationMatrix(_lookMatrix);
      cam.quaternion.slerp(_targetQuat, damp);
      cam.fov = THREE.MathUtils.lerp(cam.fov, 54, 1 - Math.exp(-3.2 * dt));
      cam.updateProjectionMatrix();
      return;
    }

    if (isFreeOrbit && orbitRef.current) {
      orbitRef.current.update();
      return;
    }

    const evalRes = evaluateShots(ACT_SHOT_CHOREOGRAPHY[actId], u, _desiredPos, _desiredTarget);
    liveCameraMetaRef.lightingPreset = evalRes.lightingPreset;
    liveCameraMetaRef.dofFocusDistance = evalRes.dofFocusDistance;
    liveCameraMetaRef.dofBokehScale = evalRes.dofBokehScale;
    liveCameraMetaRef.activeShotId = evalRes.shot.id;

    // Subtle FPS-independent organic breathing micro-drift derived from masterTimeSec (never causes simulator sickness!)
    microDrift(_desiredPos, liveSimulationRef.masterTimeSec, actId === 1 || actId === 6 || actId === 11 ? 0.016 : 0.008);

    // Dolly-zoom compression during cross-scale portal dive (last 5s of Act)
    const targetFov = dollyZoom(_desiredPos, _desiredTarget, evalRes.fov, liveSimulationRef.transitionBlend);

    // Damped follow + smooth quaternion slerp orientation (no harsh snap between shots!)
    const { dampPos } = followShot(cam, _desiredPos, _desiredTarget, _currentTarget, dt);
    dampFov(cam, targetFov, dampPos);
  });

  if (isFreeOrbit && !(currentActId === 3 && followErythrocyteCam)) {
    return (
      <OrbitControls
        ref={orbitRef}
        enableDamping
        dampingFactor={0.07}
        minDistance={0.35}
        maxDistance={10.0}
      />
    );
  }
  return null;
}
