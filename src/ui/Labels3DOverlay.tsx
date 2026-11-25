import { Html } from '@react-three/drei';
import { useBiogenesisStore } from '../core/SimulationCore';
import { ActId } from '../types/biogenesis';

interface PinSpec {
  pos: [number, number, number];
  label: string;
  detail?: string;
}

const ACT_PINS: Partial<Record<ActId, PinSpec[]>> = {
  2: [
    { pos: [-0.85, 1.48, 0.1], label: 'Kora ruchowa (M1)', detail: 'Planowanie ruchu' },
    { pos: [1.35, -0.15, 0.1], label: 'Złącze nerwowo-mięśniowe', detail: 'ACh → receptory nikotynowe' },
    { pos: [-1.45, -0.62, 0.25], label: 'Nadnercza', detail: 'Adrenalina (hormon)' },
  ],
  3: [
    { pos: [-0.35, 0.45, 0.15], label: 'Węzeł SA → AV → Purkinje', detail: 'Układ przewodzący serca' },
    { pos: [1.05, 0.35, 0.12], label: 'Pęcherzyk płucny', detail: 'Dyfuzja O₂ / CO₂ (~0,5 µm)' },
  ],
  4: [
    { pos: [-1.45, 0.65, 0], label: 'Prążek Z (α-aktynina)' },
    { pos: [0, 0.68, 0], label: 'Linia M · główki miozyny S1' },
    { pos: [1.45, 0.65, 0], label: 'Prążek Z' },
  ],
  5: [
    { pos: [-0.58, 0.58, 0.06], label: 'Kompleksy I–IV (ETC)', detail: 'Pompowanie H⁺' },
    { pos: [0.46, 0.88, 0.04], label: 'Syntaza ATP (F₀F₁)', detail: 'Rotor napędzany H⁺' },
  ],
  7: [
    { pos: [0.34, 0.64, 0.05], label: 'Bariera Krew–Mózg (BBB)', detail: 'Ścisłe złącza śródbłonka' },
    { pos: [0.34, -0.26, 0.15], label: 'Transporter MCT1', detail: 'Selektywne przejście mleczanu' },
  ],
  8: [
    { pos: [0.32, 0.55, -0.65], label: 'Kora przedczołowa (PFC)' },
    { pos: [0.42, -0.12, 0.10], label: 'Hipokamp' },
    { pos: [-0.08, -0.58, 0.22], label: 'Miejsce sinawe · Jądra szwu · VTA' },
  ],
  9: [
    { pos: [-1.15, 0.28, 0], label: 'Osłonki mielinowe · Przewężenia Ranviera' },
    { pos: [-0.28, 0.56, 0], label: 'Kolbka presynaptyczna + CaV' },
    { pos: [0.32, 0.56, 0], label: 'Kolec postsynaptyczny (AMPA / NMDA / GABA)' },
  ],
  10: [
    { pos: [0.02, 0.46, 0], label: 'BDNF ↔ Receptor TrkB' },
    { pos: [0.58, 0.28, 0.08], label: 'Kaskady MAPK/ERK · PI3K/Akt · PLCγ' },
  ],
  12: [
    { pos: [-1.32, 0.88, 0], label: 'Serce i angiogeneza' },
    { pos: [0, 0.92, 0], label: 'Biogeneza mitochondriów (PGC-1α)' },
    { pos: [1.32, 0.88, 0], label: 'Hipokamp i PFC' },
  ],
};

export function Labels3DOverlay() {
  const currentActId = useBiogenesisStore((s) => s.currentActId);
  const hudHidden = useBiogenesisStore((s) => s.hudHidden);
  const showAnnotations = useBiogenesisStore((s) => s.sarcomereShowAnnotations);
  const mitoTech = useBiogenesisStore((s) => s.mitoTechnicalMode);
  const mode = useBiogenesisStore((s) => s.mode);

  if (hudHidden) return null;
  if (currentActId === 4 && !showAnnotations) return null;
  if (currentActId === 5 && !mitoTech && mode !== 'academic') return null;

  const pins = ACT_PINS[currentActId];
  if (!pins || pins.length === 0) return null;

  return (
    <group>
      {pins.map((p, idx) => (
        <Html
          key={idx}
          position={p.pos}
          center
          zIndexRange={[5, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="px-2 py-0.5 rounded-md border border-cyan-400/45 bg-slate-950/85 backdrop-blur-md text-[10px] leading-tight whitespace-nowrap shadow-md">
            <div className="font-semibold text-cyan-200">{p.label}</div>
            {p.detail && <div className="text-[9px] text-slate-300">{p.detail}</div>}
          </div>
        </Html>
      ))}
    </group>
  );
}
