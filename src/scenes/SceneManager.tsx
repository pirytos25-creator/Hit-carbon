import { Suspense } from 'react';
import { useBiogenesisStore } from '../core/SimulationCore';
import { ActId } from '../types/biogenesis';
import { Act01GymAwakening } from './Act01GymAwakening';
import { Act02NeuralMobilization } from './Act02NeuralMobilization';
import { Act03Cardiopulmonary } from './Act03Cardiopulmonary';
import { Act04MuscleEngines } from './Act04MuscleEngines';
import { Act05EnergyMitochondria } from './Act05EnergyMitochondria';
import { Act06HIITLimits } from './Act06HIITLimits';
import { Act07BodyBrainCrosstalk } from './Act07BodyBrainCrosstalk';
import { Act08NeurochemicalSymphony } from './Act08NeurochemicalSymphony';
import { Act09InsideSynapse } from './Act09InsideSynapse';
import { Act10BDNFNeuroplasticity } from './Act10BDNFNeuroplasticity';
import { Act11RecoveryHomeostasis } from './Act11RecoveryHomeostasis';
import { Act12WeekMonthYear } from './Act12WeekMonthYear';

function renderActScene(actId: ActId) {
  switch (actId) {
    case 1:
      return <Act01GymAwakening />;
    case 2:
      return <Act02NeuralMobilization />;
    case 3:
      return <Act03Cardiopulmonary />;
    case 4:
      return <Act04MuscleEngines />;
    case 5:
      return <Act05EnergyMitochondria />;
    case 6:
      return <Act06HIITLimits />;
    case 7:
      return <Act07BodyBrainCrosstalk />;
    case 8:
      return <Act08NeurochemicalSymphony />;
    case 9:
      return <Act09InsideSynapse />;
    case 10:
      return <Act10BDNFNeuroplasticity />;
    case 11:
      return <Act11RecoveryHomeostasis />;
    case 12:
      return <Act12WeekMonthYear />;
  }
}

/**
 * Zarządza okienkowaniem scen na karcie RTX 4050 (6 GB VRAM):
 * W aktywnym rendererze przebywa wyłącznie bieżący akt (+ opcjonalnie kolejny w oknie
 * ostatnich 5s przejścia między skalami, aby nie było żadnych czarnych ekranów ani cięć).
 */
export function SceneManager() {
  const currentActId = useBiogenesisStore((s) => s.currentActId);
  const nextActId = useBiogenesisStore((s) => s.nextActId);
  const transitionBlend = useBiogenesisStore((s) => s.transitionBlend);

  const shouldPreMountNext = nextActId !== null && transitionBlend > 0.05;

  return (
    <Suspense fallback={null}>
      <group key={`act-${currentActId}`}>
        {renderActScene(currentActId)}
      </group>
      {shouldPreMountNext && nextActId && (
        <group key={`next-${nextActId}`} scale={0.15 + transitionBlend * 0.85} visible={transitionBlend > 0.45}>
          {renderActScene(nextActId)}
        </group>
      )}
    </Suspense>
  );
}
