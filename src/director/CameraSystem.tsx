import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { ActId } from '../types/biogenesis';

interface CameraPreset {
  pos: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const ACT_CAMERA_KEYFRAMES: Record<ActId, { start: CameraPreset; mid: CameraPreset; end: CameraPreset }> = {
  1: {
    start: { pos: [2.45, 1.38, -1.15], target: [0, 1.02, 0], fov: 45 },
    mid: { pos: [-2.35, 1.40, -0.95], target: [0, 1.10, 0], fov: 44 },
    end: { pos: [0.35, 1.66, -0.68], target: [0, 1.62, -0.02], fov: 38 },
  },
  2: {
    start: { pos: [0.4, 2.2, 3.6], target: [0, 0.6, 0], fov: 46 },
    mid: { pos: [1.6, 0.6, 2.4], target: [0.6, -0.4, 0], fov: 44 },
    end: { pos: [2.4, -0.6, 1.8], target: [1.5, -1.1, 0], fov: 40 },
  },
  3: {
    start: { pos: [0.6, 0.35, 2.45], target: [0.04, 0.05, 0], fov: 44 },
    mid: { pos: [0.9, 0.25, 1.55], target: [0.35, 0.0, 0], fov: 40 },
    end: { pos: [1.65, 0.15, 0.85], target: [0.95, 0.0, 0], fov: 38 },
  },
  4: {
    start: { pos: [0.5, 1.5, 4.2], target: [0, 0.4, -0.4], fov: 44 },
    mid: { pos: [0.4, 0.65, 2.55], target: [0, 0, 0], fov: 42 },
    end: { pos: [-1.2, 0.45, 2.15], target: [0, 0, 0], fov: 38 },
  },
  5: {
    start: { pos: [0.3, 1.95, 3.45], target: [0, 0.1, 0], fov: 44 },
    mid: { pos: [0.65, 1.15, 1.85], target: [0.35, 0.36, 0.05], fov: 40 },
    end: { pos: [1.15, 0.78, 1.15], target: [0.46, 0.42, 0.04], fov: 36 },
  },
  6: {
    start: { pos: [2.45, 1.38, -1.10], target: [0, 1.05, 0], fov: 46 },
    mid: { pos: [-2.35, 1.44, -0.95], target: [0, 1.12, 0], fov: 47 },
    end: { pos: [1.95, 1.28, -1.25], target: [0, 1.02, 0], fov: 45 },
  },
  7: {
    start: { pos: [-2.4, 0.45, 2.6], target: [-0.4, 0, 0], fov: 44 },
    mid: { pos: [0.2, 0.65, 2.25], target: [0.2, 0.05, 0], fov: 42 },
    end: { pos: [1.55, 0.45, 1.75], target: [0.65, 0.05, 0], fov: 38 },
  },
  8: {
    start: { pos: [2.55, 1.0, 2.75], target: [0, 0, 0], fov: 42 },
    mid: { pos: [-2.50, 0.72, 2.55], target: [0, -0.04, 0], fov: 42 },
    end: { pos: [1.20, 0.52, 2.55], target: [0, -0.06, 0], fov: 40 },
  },
  9: {
    start: { pos: [-1.9, 0.95, 2.85], target: [-0.7, 0, 0], fov: 44 },
    mid: { pos: [0.1, 0.55, 1.85], target: [0.0, 0, 0], fov: 40 },
    end: { pos: [0.85, 0.35, 1.55], target: [0.08, 0, 0], fov: 36 },
  },
  10: {
    start: { pos: [0.35, 0.72, 2.25], target: [0.15, 0.05, 0], fov: 42 },
    mid: { pos: [1.45, 0.95, 2.15], target: [0.2, 0.15, 0], fov: 40 },
    end: { pos: [2.15, 1.05, 2.45], target: [0, 0.1, 0], fov: 42 },
  },
  11: {
    start: { pos: [0.55, 1.62, -0.95], target: [0, 1.50, 0], fov: 40 },
    mid: { pos: [2.35, 1.38, -1.15], target: [0, 1.05, 0], fov: 45 },
    end: { pos: [-2.35, 1.48, -1.05], target: [0, 1.0, 0], fov: 45 },
  },
  12: {
    start: { pos: [0.0, 1.15, 4.9], target: [0, 0.2, 0], fov: 46 },
    mid: { pos: [0.65, 1.15, 4.75], target: [0, 0.2, 0], fov: 46 },
    end: { pos: [-0.65, 1.15, 4.75], target: [0, 0.2, 0], fov: 46 },
  },
};

export const erythrocyteCameraTarget = {
  active: false,
  position: new THREE.Vector3(0.4, 0.05, 0.2),
  lookAt: new THREE.Vector3(0.6, 0.05, 0.0),
};

const _desiredPos = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();
const _currentTarget = new THREE.Vector3(0, 1.0, 0);

function lerpPreset(a: CameraPreset, b: CameraPreset, t: number, outPos: THREE.Vector3, outTarget: THREE.Vector3): number {
  const s = t * t * (3 - 2 * t);
  outPos.set(
    THREE.MathUtils.lerp(a.pos[0], b.pos[0], s),
    THREE.MathUtils.lerp(a.pos[1], b.pos[1], s),
    THREE.MathUtils.lerp(a.pos[2], b.pos[2], s)
  );
  outTarget.set(
    THREE.MathUtils.lerp(a.target[0], b.target[0], s),
    THREE.MathUtils.lerp(a.target[1], b.target[1], s),
    THREE.MathUtils.lerp(a.target[2], b.target[2], s)
  );
  return THREE.MathUtils.lerp(a.fov, b.fov, s);
}

export function CameraSystem() {
  const { camera } = useThree();
  const mode = useBiogenesisStore((s) => s.mode);
  const currentActId = useBiogenesisStore((s) => s.currentActId);
  const followErythrocyteCam = useBiogenesisStore((s) => s.followErythrocyteCam);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orbitRef = useRef<any>(null);

  const isFreeOrbit =
    mode === 'exploration' ||
    ((currentActId === 4 || currentActId === 8 || currentActId === 9 || currentActId === 10 || currentActId === 12) &&
      !useBiogenesisStore.getState().isPlaying);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    const actId = liveSimulationRef.actId;
    const u = liveSimulationRef.actProgress;
    const cam = camera as THREE.PerspectiveCamera;

    // Erythrocyte follow mode in Act III
    if (actId === 3 && followErythrocyteCam && erythrocyteCameraTarget.active) {
      cam.position.lerp(erythrocyteCameraTarget.position, 1 - Math.exp(-5.5 * dt));
      _currentTarget.lerp(erythrocyteCameraTarget.lookAt, 1 - Math.exp(-6.5 * dt));
      cam.lookAt(_currentTarget);
      cam.fov = THREE.MathUtils.lerp(cam.fov, 54, 1 - Math.exp(-3 * dt));
      cam.updateProjectionMatrix();
      return;
    }

    if (isFreeOrbit && orbitRef.current) {
      orbitRef.current.update();
      return;
    }

    const kf = ACT_CAMERA_KEYFRAMES[actId];
    let targetFov = 44;
    if (u < 0.5) {
      targetFov = lerpPreset(kf.start, kf.mid, u * 2.0, _desiredPos, _desiredTarget);
    } else {
      targetFov = lerpPreset(kf.mid, kf.end, (u - 0.5) * 2.0, _desiredPos, _desiredTarget);
    }

    // Subtle organic breathing / handheld micro-drift scaled down at molecular zooms
    const t = liveSimulationRef.masterTimeSec;
    const driftAmp = actId === 1 || actId === 6 || actId === 11 ? 0.028 : 0.012;
    _desiredPos.x += Math.sin(t * 0.45) * driftAmp;
    _desiredPos.y += Math.cos(t * 0.38) * driftAmp * 0.6;

    // Dolly-zoom FOV compression during final 5s cross-scale portal dive
    const blend = liveSimulationRef.transitionBlend;
    if (blend > 0) {
      targetFov -= blend * 8;
      _desiredPos.lerp(_desiredTarget, blend * 0.28);
    }

    const damp = 1 - Math.exp(-3.4 * dt);
    cam.position.lerp(_desiredPos, damp);
    _currentTarget.lerp(_desiredTarget, damp);
    cam.lookAt(_currentTarget);
    if (Math.abs(cam.fov - targetFov) > 0.05) {
      cam.fov = THREE.MathUtils.lerp(cam.fov, targetFov, damp);
      cam.updateProjectionMatrix();
    }
  });

  if (isFreeOrbit && !(currentActId === 3 && followErythrocyteCam)) {
    return (
      <OrbitControls
        ref={orbitRef}
        enableDamping
        dampingFactor={0.07}
        minDistance={0.45}
        maxDistance={9.0}
      />
    );
  }
  return null;
}
