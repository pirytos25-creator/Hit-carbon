import { AthleteGymRig } from './Act01GymAwakening';
import { MoleculeSwarm } from './MolecularSimulation';

/**
 * Akt XI — Regeneracja i powrót do równowagi:
 * Ciepłe wyciszenie na siłowni, spadek tętna i wentylacji, reaktywacja nerwu błędnego,
 * odbudowa PCr, klirens mleczanu oraz integracja procesów naprawczych.
 */
export function Act11RecoveryHomeostasis() {
  return (
    <group>
      <pointLight position={[2.2, 2.8, 1.5]} intensity={2.6} color="#fed7aa" />
      <pointLight position={[-2.0, 1.5, -1.5]} intensity={1.8} color="#34d399" />
      <pointLight position={[0, 1.4, 2.2]} intensity={1.5} color="#bae6fd" />

      <AthleteGymRig modeVariant="act11" />

      {/* Warm calming parasympathetic & restorative aura */}
      <MoleculeSwarm
        count={75}
        color="#34d399"
        emissive="#10b981"
        radius={0.012}
        bounds={[2.2, 1.8, 2.2]}
        origin={[0, 1.1, 0]}
        speed={0.18}
        flowDir={[0.05, 0.35, 0.05]}
      />
    </group>
  );
}
