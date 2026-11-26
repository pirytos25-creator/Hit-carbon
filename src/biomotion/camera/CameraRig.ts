import * as THREE from 'three';

/** Współczynnik tłumienia niezależny od FPS: 1 − e^(−rate·dt). */
export const expDamp = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);

const _look = new THREE.Matrix4();
const _q = new THREE.Quaternion();

/**
 * Kamera podąża za celem z tłumieniem pozycji i obrotu (slerp), jak CameraSystem filmu.
 * `currentTarget` to stan odbiorcy (punkt, na który kamera faktycznie patrzy) i jest modyfikowany.
 */
export function followShot(
  cam: THREE.PerspectiveCamera,
  desiredPos: THREE.Vector3,
  desiredTarget: THREE.Vector3,
  currentTarget: THREE.Vector3,
  dt: number,
  posRate = 4.2,
  rotRate = 4.8
) {
  const dampPos = expDamp(posRate, dt);
  const dampRot = expDamp(rotRate, dt);
  cam.position.lerp(desiredPos, dampPos);
  currentTarget.lerp(desiredTarget, dampRot);
  _look.lookAt(cam.position, currentTarget, cam.up);
  _q.setFromRotationMatrix(_look);
  cam.quaternion.slerp(_q, dampRot);
  return { dampPos, dampRot };
}

/** Płynna zmiana FOV (aktualizuje macierz rzutu tylko przy realnej zmianie). */
export function dampFov(cam: THREE.PerspectiveCamera, targetFov: number, damp: number, eps = 0.04) {
  if (Math.abs(cam.fov - targetFov) > eps) {
    cam.fov += (targetFov - cam.fov) * damp;
    cam.updateProjectionMatrix();
  }
}

/** Dolly-zoom przy przejściu skali (ostatnie sekundy aktu / wjazd w narząd). */
export function dollyZoom(desiredPos: THREE.Vector3, desiredTarget: THREE.Vector3, fov: number, blend: number, fovDrop = 6.5, push = 0.22) {
  if (blend <= 0) return fov;
  desiredPos.lerp(desiredTarget, blend * push);
  return fov - blend * fovDrop;
}

/** Mikrodryf „oddechu” kamery zależny od czasu (bez choroby symulatorowej). */
export function microDrift(pos: THREE.Vector3, timeSec: number, amp: number) {
  pos.x += Math.sin(timeSec * 0.45) * amp;
  pos.y += Math.cos(timeSec * 0.36) * amp * 0.55;
}
