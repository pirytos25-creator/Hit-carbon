import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { liveSimulationRef } from '../core/SimulationCore';
import { ACT_DEFINITIONS } from '../core/TimelineEngine';

/**
 * Zarządza płynnym przenikaniem między skalami biologicznymi (10^0 m -> 10^-9 m)
 * oraz płynnym wygaszaniem tła i mgły bez czarnych ekranów i brutalnych cięć.
 */
const _bgCol = new THREE.Color();
const _nextBgCol = new THREE.Color();

const ACT_BG_COLORS: Record<number, string> = {
  1: '#070b14',
  2: '#040a18',
  3: '#11060c',
  4: '#12070c',
  5: '#0c0618',
  6: '#16070a',
  7: '#080e16',
  8: '#050b16',
  9: '#030812',
  10: '#070a16',
  11: '#0e0b12',
  12: '#050b14',
};

export function ScaleTransitionSystem() {
  const veilRef = useRef<THREE.Mesh>(null);
  const veilMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ scene }) => {
    const actId = liveSimulationRef.actId;
    const nextId = liveSimulationRef.nextActId;
    const blend = liveSimulationRef.transitionBlend;

    _bgCol.set(ACT_BG_COLORS[actId] ?? '#050a14');
    if (nextId && blend > 0) {
      _nextBgCol.set(ACT_BG_COLORS[nextId] ?? '#050a14');
      _bgCol.lerp(_nextBgCol, blend);
    }

    if (scene.background instanceof THREE.Color) {
      scene.background.copy(_bgCol);
    } else {
      scene.background = _bgCol.clone();
    }

    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(_bgCol);
      scene.fog.density = 0.042 + blend * 0.045;
    }

    // Subtle organic translucent membrane veil during the cross-scale portal moment
    if (veilRef.current && veilMatRef.current) {
      const portalBell = blend > 0 ? Math.sin(blend * Math.PI) : 0;
      veilRef.current.visible = portalBell > 0.02;
      veilMatRef.current.opacity = portalBell * 0.18;
      const actDef = ACT_DEFINITIONS[actId - 1];
      veilMatRef.current.color.set(actDef?.accentColor ?? '#38bdf8');
      veilRef.current.rotation.z += 0.008;
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
