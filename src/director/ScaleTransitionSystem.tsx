import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { liveSimulationRef } from '../core/SimulationCore';
import { ACT_DEFINITIONS } from '../core/TimelineEngine';
import { liveCameraMetaRef } from './CameraSystem';
import { LightingPresetId } from './ShotChoreography';

/**
 * Zarządza płynnym przenikaniem między skalami biologicznymi (10^0 m -> 10^-9 m)
 * oraz płynnym wygaszaniem tła i mgły bez czarnych ekranów i brutalnych cięć.
 */
const _bgCol = new THREE.Color();
const _nextBgCol = new THREE.Color();
const _targetBgCol = new THREE.Color();
const _camFwd = new THREE.Vector3();

const ACT_BG_COLORS: Record<number, string> = {
  1: '#0a111f',
  2: '#050c1d',
  3: '#14060c',
  4: '#12070c',
  5: '#0c0618',
  6: '#16080c',
  7: '#08101a',
  8: '#050b16',
  9: '#030812',
  10: '#070a16',
  11: '#110d14',
  12: '#050b14',
};

const PRESET_FOG_DENSITY: Record<LightingPresetId, number> = {
  gym_daylight: 0.018,
  anatomy_medical: 0.030,
  bloodstream_organic: 0.022,
  mito_cathedral: 0.032,
  brain_atlas: 0.026,
  neural_forest: 0.034,
  synapse_macro: 0.024,
  recovery_golden: 0.020,
};

export function ScaleTransitionSystem() {
  const veilRef = useRef<THREE.Mesh>(null);
  const veilMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ scene, camera }, delta) => {
    const dt = Math.min(0.05, Math.max(0.001, delta));
    const actId = liveSimulationRef.actId;
    const nextId = liveSimulationRef.nextActId;
    const blend = liveSimulationRef.transitionBlend;
    const lightingPreset = liveCameraMetaRef.lightingPreset;

    _bgCol.set(
      lightingPreset === 'bloodstream_organic'
        ? '#180509'
        : ACT_BG_COLORS[actId] ?? '#050a14',
    );
    if (nextId && blend > 0) {
      _nextBgCol.set(ACT_BG_COLORS[nextId] ?? '#050a14');
      _bgCol.lerp(_nextBgCol, blend);
    }

    if (scene.background instanceof THREE.Color) {
      _targetBgCol.copy(_bgCol);
      scene.background.lerp(_targetBgCol, 1 - Math.exp(-4.0 * dt));
    } else {
      scene.background = _bgCol.clone();
    }

    if (scene.fog instanceof THREE.FogExp2) {
      if (scene.background instanceof THREE.Color) {
        scene.fog.color.copy(scene.background);
      } else {
        scene.fog.color.copy(_bgCol);
      }
      const baseFog = PRESET_FOG_DENSITY[lightingPreset] ?? 0.028;
      const targetDensity = baseFog + blend * 0.042;
      scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, targetDensity, 1 - Math.exp(-4.0 * dt));
    }

    // Subtle organic translucent membrane veil framed smoothly in front of active camera during portal dive
    if (veilRef.current && veilMatRef.current) {
      const portalBell = blend > 0 ? Math.sin(blend * Math.PI) : 0;
      veilRef.current.visible = portalBell > 0.02;
      if (veilRef.current.visible) {
        camera.getWorldDirection(_camFwd);
        veilRef.current.position.copy(camera.position).addScaledVector(_camFwd, 3.2);
        veilRef.current.quaternion.copy(camera.quaternion);
        veilRef.current.rotateZ(liveSimulationRef.masterTimeSec * 0.45);
        const s = THREE.MathUtils.lerp(1.4, 0.55, portalBell);
        veilRef.current.scale.setScalar(s);
        veilMatRef.current.opacity = portalBell * 0.16;
        const actDef = ACT_DEFINITIONS[actId - 1];
        veilMatRef.current.color.set(actDef?.accentColor ?? '#38bdf8');
      }
    }
  });

  return (
    <mesh ref={veilRef} visible={false} position={[0, 0.8, 0]} renderOrder={999}>
      <torusGeometry args={[2.8, 0.65, 16, 48]} />
      <meshBasicMaterial
        ref={veilMatRef}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
