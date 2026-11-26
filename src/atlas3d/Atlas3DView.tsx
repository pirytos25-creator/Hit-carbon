/**
 * Widok 3D planszy atlasu (E3, P1 „Gablota”). Montowany leniwie przez AtlasApp (kontrakt Atlas3DViewProps).
 * Obrót tylko w poziomie z przyciąganiem do 4 widoków kluczowych, zbliżenia jako gotowe ujęcia (model §3.3, decyzja §7),
 * spoczynek/sprint w shaderze, podpisy przez bramkę faktów, strzałki po torach w metrach.
 * Klawiatura: ← → obrót o 90°, 1–4 widoki kluczowe, S spoczynek/sprint (z fokusem na widoku), Esc powrót do planszy.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Atlas3DViewProps } from '../atlas/AtlasApp';
import type { AtlasState } from '../atlas/types';
import type { AtlasLevel } from '../atlas/palette';
import { ATLAS_SYSTEMS } from '../atlas/plates';
import { usePrefersReducedMotion } from '../atlas/AtlasPlate';
import { loadAtlasData, loadFiles, MissingDataError } from './engine';
import { Controller, FOV, KEY_VIEWS, type Mode } from './controller';
import './atlas3d.css';

const BASE = import.meta.env.BASE_URL;

/** Mostek R3F: dołącza sterownik do kamery i sceny Canvas, wywołuje go w każdej klatce. */
function Bridge({ ctrl }: { ctrl: Controller }) {
  const { camera, scene, gl, size } = useThree();
  useEffect(() => {
    ctrl.attach(camera as THREE.PerspectiveCamera, scene);
    return () => ctrl.dispose();
  }, [ctrl, camera, scene]);
  useEffect(() => ctrl.resize(), [ctrl, size.width, size.height]);
  // Pomiar (tylko tryb deweloperski): N klatek renderu pod rząd, każda dokończona na karcie = przepustowość,
  // niezależna od dławienia requestAnimationFrame w zasłoniętym oknie przeglądarki.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as { __atlas3dBench?: (n?: number) => number };
    w.__atlas3dBench = (n = 60) => {
      const ctx = gl.getContext();
      const px = new Uint8Array(4);
      const sync = () => ctx.readPixels(0, 0, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, px); // wymusza koniec pracy karty (finish w ANGLE nie czeka)
      gl.render(scene, camera); sync();
      const t0 = performance.now();
      for (let i = 0; i < n; i++) { gl.render(scene, camera); sync(); }
      return Math.round((n * 1000) / (performance.now() - t0));
    };
    return () => { delete w.__atlas3dBench; };
  }, [gl, scene, camera]);
  useFrame((_, dt) => ctrl.frame(Math.min(dt, 0.1), gl));
  return null;
}

type Phase = { kind: 'loading'; mb: number } | { kind: 'error'; missing: boolean; msg: string } | { kind: 'ready'; ctrl: Controller };

export default function Atlas3DView({ system, state, level, onClose }: Atlas3DViewProps) {
  const content = useMemo(() => ATLAS_SYSTEMS.find((s) => s.id === system)?.content ?? null, [system]);
  const reduced = usePrefersReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>({ kind: 'loading', mb: 0 });
  const [st, setSt] = useState<AtlasState>(state);
  const [lv, setLv] = useState<AtlasLevel>(level);
  const [mode, setMode] = useState<Mode>({ kind: 'main' });
  const [kv, setKv] = useState<string | null>('front');
  const [hiddenN, setHiddenN] = useState(0);
  const dragRef = useRef<{ x: number; id: number } | null>(null);

  useEffect(() => setSt(state), [state]);
  useEffect(() => setLv(level), [level]);

  // wczytanie danych i modeli (GLB poza Gitem: przy braku czytelny komunikat zamiast pustej sceny)
  useEffect(() => {
    let alive = true;
    let bytes = 0;
    setPhase({ kind: 'loading', mb: 0 });
    (async () => {
      if (!content) throw new Error(`brak treści planszy ${system}`);
      const data = await loadAtlasData(BASE, system);
      const files = await loadFiles(BASE, data, (b) => { bytes += b; if (alive) setPhase({ kind: 'loading', mb: bytes / 1e6 }); });
      if (!alive) return;
      const ctrl = new Controller(data, files, content, hostRef.current!, svgRef.current!, layerRef.current!, bytes);
      setPhase({ kind: 'ready', ctrl });
    })().catch((e: unknown) => {
      if (!alive) return;
      const missing = e instanceof MissingDataError;
      setPhase({ kind: 'error', missing, msg: e instanceof Error ? e.message : String(e) });
    });
    return () => { alive = false; };
  }, [system, content]);

  const ctrl = phase.kind === 'ready' ? phase.ctrl : null;
  useEffect(() => { if (ctrl) { ctrl.reduced = reduced; ctrl.setState(st); } }, [ctrl, st, reduced]);
  useEffect(() => { if (ctrl) ctrl.setLevel(lv); }, [ctrl, lv]);
  useEffect(() => {
    if (!ctrl) return;
    ctrl.onKeyView = setKv;
    ctrl.onLabelsChanged = () => setHiddenN(ctrl.hiddenDetailLabels);
  }, [ctrl]);
  useEffect(() => { rootRef.current?.focus(); }, [ctrl]);

  const go = (m: Mode) => { setMode(m); ctrl?.setMode(m); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
    if (!ctrl || (e.target as HTMLElement).closest('button')) return; // przyciski obsługują Enter/spację same
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); ctrl.rotate(e.key === 'ArrowLeft' ? 90 : -90); }
    else if (/^[1-4]$/.test(e.key)) { setMode({ kind: 'main' }); ctrl.keyView(KEY_VIEWS[+e.key - 1].az); }
    else if (e.key === 's' || e.key === 'S') setSt((s) => (s === 'sprint' ? 'rest' : 'sprint'));
  };
  const details = ctrl?.details ?? [];
  const title = content?.titlePl ?? system;
  const btn = 'rounded-md px-2.5 py-1.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300';
  const seg = (on: boolean, extra = '') => `${btn} ${on ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'} ${extra}`;

  return (
    <div ref={rootRef} className="atlas3d-root" tabIndex={0} onKeyDown={onKey} aria-label={`Widok 3D: ${title}. Strzałki w lewo i w prawo obracają, 1–4 widoki, S zmienia stan, Esc wraca do planszy.`}>
      <div ref={hostRef} className="atlas3d-stage"
        onPointerDown={(e) => { if (ctrl && mode.kind === 'main') { dragRef.current = { x: e.clientX, id: e.pointerId }; (e.target as Element).setPointerCapture?.(e.pointerId); } }}
        onPointerMove={(e) => { const d = dragRef.current; if (d && ctrl) { ctrl.drag(e.clientX - d.x); d.x = e.clientX; } }}
        onPointerUp={() => { if (dragRef.current && ctrl) { dragRef.current = null; ctrl.snap(); } }}
        onPointerCancel={() => { if (dragRef.current && ctrl) { dragRef.current = null; ctrl.snap(); } }}>
        {ctrl && (
          <Canvas flat dpr={[1, 1.5]} camera={{ fov: FOV, near: 0.01, far: 120, position: [0, 1, 7] }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} style={{ touchAction: 'none' }}>
            <Bridge ctrl={ctrl} />
          </Canvas>
        )}
        <svg ref={svgRef} className="atlas3d-lines" aria-hidden="true" />
        <div ref={layerRef} className="atlas3d-labels" />
      </div>

      <div className="atlas3d-bar atlas3d-top">
        <span className="atlas3d-chip">3D · {title}</span>
        <div className="atlas3d-seg" role="group" aria-label="Moment">
          <button type="button" className={seg(st === 'rest')} aria-pressed={st === 'rest'} onClick={() => setSt('rest')}>Spoczynek</button>
          <button type="button" className={seg(st === 'sprint', st === 'sprint' ? '!bg-[#c8343f]' : '')} aria-pressed={st === 'sprint'} onClick={() => setSt('sprint')}>Sprint HIIT</button>
        </div>
        <div className="atlas3d-seg" role="group" aria-label="Poziom">
          <button type="button" className={seg(lv === 'basic')} aria-pressed={lv === 'basic'} onClick={() => setLv('basic')}>Podstawowy</button>
          <button type="button" className={seg(lv === 'extended')} aria-pressed={lv === 'extended'} onClick={() => setLv('extended')}>Rozszerzony</button>
        </div>
        <button type="button" className={`${btn} ml-auto bg-slate-800 text-slate-100 hover:bg-slate-700`} onClick={onClose}>← Wróć do planszy</button>
      </div>

      {ctrl && (
        <div className="atlas3d-bar atlas3d-bottom">
          <div className="atlas3d-seg" role="group" aria-label="Widoki kluczowe (obrót w poziomie)">
            {KEY_VIEWS.map((k, i) => (
              <button key={k.name} type="button" className={seg(mode.kind === 'main' && kv === k.name)} aria-pressed={mode.kind === 'main' && kv === k.name}
                title={`Klawisz ${i + 1}`} onClick={() => { setMode({ kind: 'main' }); ctrl.keyView(k.az); }}>{k.label}</button>
            ))}
          </div>
          {details.length > 0 && (
            <div className="atlas3d-seg" role="group" aria-label="Zbliżenia">
              <button type="button" className={seg(mode.kind === 'main')} aria-pressed={mode.kind === 'main'} onClick={() => go({ kind: 'main' })}>Całe ujęcie</button>
              {details.map((d) => (
                <button key={d.view} type="button" className={seg(mode.kind === 'detail' && mode.view === d.view)}
                  aria-pressed={mode.kind === 'detail' && mode.view === d.view} onClick={() => go({ kind: 'detail', view: d.view })}>{d.title}</button>
              ))}
            </div>
          )}
          <span className="atlas3d-hint">
            {mode.kind === 'detail' && hiddenN > 0
              ? `Część tego zbliżenia (${hiddenN} ${hiddenN === 1 ? 'podpis' : hiddenN < 5 ? 'podpisy' : 'podpisów'}, np. włókna i cząsteczki) jest tylko na planszy 2D.`
              : 'Przeciągnij w poziomie albo użyj ← →; po puszczeniu widok wraca do najbliższego ujęcia.'}
          </span>
        </div>
      )}

      {phase.kind === 'loading' && (
        <div className="atlas3d-center" role="status">Wczytywanie modeli 3D… {phase.mb > 0 ? `${phase.mb.toFixed(1)} MB` : ''}</div>
      )}
      {phase.kind === 'error' && (
        <div className="atlas3d-center" role="alert">
          <p className="text-slate-200 font-semibold">{phase.missing ? 'Brakuje modeli 3D dla tej planszy.' : 'Nie udało się wczytać widoku 3D.'}</p>
          <p className="text-slate-400 text-sm max-w-md text-center">
            {phase.missing
              ? 'Modele 3D nie są przechowywane w repozytorium. Utwórz je poleceniem npm run atlas:export3d (Blender, ok. 15 min), a potem odśwież stronę.'
              : phase.msg}
          </p>
          <button type="button" className={`${btn} bg-slate-800 text-slate-100 hover:bg-slate-700`} onClick={onClose}>Wróć do planszy</button>
        </div>
      )}
      {ctrl && (
        <p className="atlas3d-lic">
          Modele: Z-Anatomy (CC BY-SA 4.0){ctrl.data.manifest.files.some((f) => f.path.includes('hra_')) ? ', HuBMAP / NIH Visible Human (CC BY 4.0)' : ''}; zmienione (uproszczenie siatek, scalenie).
        </p>
      )}
    </div>
  );
}
