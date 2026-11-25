import { useState } from 'react';
import { BookOpen, ExternalLink, ShieldAlert, X, FlaskConical } from 'lucide-react';
import { useBiogenesisStore } from '../core/SimulationCore';
import { EVIDENCE_LEVEL_META, getClaimsForAct } from '../science/EducationalContent';
import { SCIENTIFIC_REFERENCES, getReferencesForAct } from '../science/ScientificReferences';
import { getActById } from '../core/TimelineEngine';

const PLASTICITY_PROCESSES = [
  {
    name: '1. Plastyczność synaptyczna (LTP/LTD)',
    desc: 'Funkcjonalne wzmacnianie lub osłabianie siły istniejących synaps (np. insercja receptorów AMPA zależna od NMDA i CaMKII). Dobrze udokumentowany mechanizm uczenia.',
  },
  {
    name: '2. Przebudowa kolców dendrytycznych',
    desc: 'Zmiany objętości, kształtu i zagęszczenia kolców na dendrytach dzięki reorganizacji aktyny. Zwiększa powierzchnię kontaktu synaptycznego.',
  },
  {
    name: '3. Synaptogeneza',
    desc: 'Powstawanie nowych połączeń synaptycznych w obrębie istniejących obwodów korowych i hipokampalnych.',
  },
  {
    name: '4. Angiogeneza mózgowa',
    desc: 'Tworzenie nowych naczyń włosowatych (VEGF/IGF-1), wspierające dowóz tlenu i glukozy m.in. w zakręcie zębatym.',
  },
  {
    name: '5. Adaptacje funkcjonalne sieci',
    desc: 'Zmiany synchronizacji i efektywności całych sieci (np. PFC–hipokamp) obserwowane w fMRI i testach wykonawczych.',
  },
  {
    name: '6. Neurogeneza dorosłych ludzi (Debata)',
    desc: 'Powstawanie nowych neuronów w zakręcie zębatym. Silnie potwierdzone u gryzoni (wzrost po bieganiu w kołowrotku); u dorosłych ludzi przedmiot aktywnej debaty (Sorrells 2018 vs Boldrini 2018 / Moreno-Jiménez 2019). Pojedyncza sesja HIIT NIE tworzy natychmiastowych nowych neuronów.',
  },
];

export function AcademicDrawer() {
  const open = useBiogenesisStore((s) => s.academicDrawerOpen);
  const setOpen = useBiogenesisStore((s) => s.setAcademicDrawerOpen);
  const currentActId = useBiogenesisStore((s) => s.currentActId);
  const [tab, setTab] = useState<'act' | 'plasticity' | 'bibliography'>('act');

  if (!open) return null;

  const act = getActById(currentActId);
  const claims = getClaimsForAct(currentActId);
  const actRefs = getReferencesForAct(currentActId);
  const allRefs = Object.values(SCIENTIFIC_REFERENCES);

  return (
    <div className="pointer-events-auto fixed right-4 top-16 bottom-24 z-40 w-full max-w-md bio-panel-strong rounded-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/70 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-300" />
          <div>
            <div className="font-display text-sm font-bold text-slate-100">Warstwa Akademicka i Źródła</div>
            <div className="text-[11px] text-slate-400">Akt {act.roman}: {act.title}</div>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
          aria-label="Zamknij panel naukowy"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sub-navigation */}
      <div className="grid grid-cols-3 gap-1 p-2 bg-slate-950/40 border-b border-slate-800 text-xs">
        <button
          onClick={() => setTab('act')}
          className={`py-1.5 rounded-lg font-medium ${tab === 'act' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40' : 'text-slate-400 hover:text-white'}`}
        >
          Mechanizmy Aktu
        </button>
        <button
          onClick={() => setTab('plasticity')}
          className={`py-1.5 rounded-lg font-medium ${tab === 'plasticity' ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40' : 'text-slate-400 hover:text-white'}`}
        >
          6 Procesów Mózg.
        </button>
        <button
          onClick={() => setTab('bibliography')}
          className={`py-1.5 rounded-lg font-medium ${tab === 'bibliography' ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40' : 'text-slate-400 hover:text-white'}`}
        >
          Bibliografia ({allRefs.length})
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bio-scroll p-4 space-y-4 text-xs leading-relaxed">
        {tab === 'act' && (
          <>
            {claims.map((claim) => {
              const ev = EVIDENCE_LEVEL_META[claim.evidenceLevel];
              return (
                <article key={claim.id} className="rounded-xl bg-slate-950/65 border border-slate-800 p-3.5 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-bold text-slate-100">{claim.titlePl}</h3>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${ev.badgeColor}1f`,
                        color: ev.badgeColor,
                        border: `1px solid ${ev.badgeColor}55`,
                      }}
                    >
                      {ev.labelPl}
                    </span>
                  </div>

                  <p className="text-slate-200">{claim.academicDetailPl}</p>

                  {claim.mythCorrectionPl && (
                    <div className="rounded-lg bg-amber-500/10 border border-amber-400/30 p-2.5 text-amber-100 flex gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-amber-300 mt-0.5" />
                      <div>
                        <strong className="text-amber-300">Korekta mitu: </strong>
                        {claim.mythCorrectionPl}
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 bg-slate-900/70 rounded-lg px-2.5 py-2 border border-slate-800">
                    <strong className="text-slate-300">Ograniczenia dowodów: </strong>
                    {claim.limitationsPl}
                  </div>
                </article>
              );
            })}

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                Źródła przypisane do Aktu {act.roman}
              </div>
              {actRefs.map((ref) => (
                <div key={ref.id} className="rounded-lg bg-slate-900/60 border border-slate-800 p-2.5 space-y-1">
                  <div className="font-semibold text-slate-200">{ref.authors} ({ref.year})</div>
                  <div className="italic text-slate-300">{ref.title}</div>
                  <div className="text-[11px] text-slate-400">{ref.journal}</div>
                  <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-mono-tech">
                    {ref.pmid && <span className="text-emerald-300">PMID: {ref.pmid}</span>}
                    {ref.doi && <span className="text-cyan-300">DOI: {ref.doi}</span>}
                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 text-sky-300 hover:underline"
                      >
                        PubMed <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'plasticity' && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <FlaskConical className="w-4 h-4" />
              Rozróżnienie 6 procesów adaptacji neuronalnej
            </div>
            <p className="text-slate-300">
              W neurobiologii wysiłku fizycznego niezwykle ważne jest nierozmywanie poniższych pojęć i wyraźne oddzielanie wyników na gryzoniach od dowodów u ludzi.
            </p>
            {PLASTICITY_PROCESSES.map((p) => (
              <div key={p.name} className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-1">
                <div className="font-semibold text-slate-100">{p.name}</div>
                <p className="text-slate-300 text-[11px]">{p.desc}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'bibliography' && (
          <div className="space-y-2.5">
            <div className="text-[11px] text-slate-400">
              Wszystkie pozycje zweryfikowane w bazie PubMed / DOI oraz podręcznikach akademickich (Kandel, Kenney).
            </div>
            {allRefs.map((ref) => (
              <div key={ref.id} className="rounded-xl bg-slate-950/65 border border-slate-800 p-3 space-y-1">
                <div className="font-semibold text-slate-100">
                  {ref.authors} ({ref.year})
                </div>
                <div className="text-cyan-200">{ref.title}</div>
                <div className="text-[11px] text-slate-400">{ref.journal}</div>
                <p className="text-[11px] text-slate-300 pt-1">{ref.summaryPl}</p>
                <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-mono-tech">
                  {ref.pmid && <span className="text-emerald-300">PMID: {ref.pmid}</span>}
                  {ref.pmcid && <span className="text-teal-300">{ref.pmcid}</span>}
                  {ref.doi && <span className="text-cyan-300">DOI: {ref.doi}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
