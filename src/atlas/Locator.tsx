import { useEffect, useState } from 'react';
import { projectPoint, viewResolution } from './projection';
import type { AtlasAnchorsFile, AtlasCamera, AtlasView } from './types';

/**
 * M6 (rama), LOKALIZATOR (UX_POSIEDZENIE §2.2 P3, §3.1 pkt 2): mini-sylwetka ciała w rogu sceny z prostokątem kadru
 * bieżącego widoku. Sylwetka to wypiek z Blendera (blender/atlas/bake_lokalizator.py, CC BY-SA 4.0, osobny plik
 * public/atlas/_lokalizator/ z ATRYBUCJA.txt). Prostokąt liczony z kamery widoku (anchors.json: center, right, up,
 * orthoScale) tym samym rzutem co kotwice (projection.ts). Ten sam komponent trafi do gablot (OrganView).
 */
interface LocatorFile {
  resolution: [number, number];
  views: Record<'front' | 'side', AtlasCamera & { image: string }>;
}

let cache: Promise<LocatorFile | null> | null = null;
function loadLocator(base: string): Promise<LocatorFile | null> {
  cache ??= fetch(`${base}atlas/_lokalizator/locator.json`)
    .then((r) => (r.ok ? (r.json() as Promise<LocatorFile>) : null))
    .catch(() => null);
  return cache;
}

/** Prostokąt kadru widoku na sylwetce [x0, y0, x1, y1] (0–1) albo null (schemat bez skali, kamera ukośna, brak kamery). */
export function frameRect(anchors: AtlasAnchorsFile, view: AtlasView, loc: LocatorFile, sil: 'front' | 'side', scaleFree?: AtlasView[]) {
  const cam = anchors.views[view]?.camera;
  if (!cam || scaleFree?.includes(view)) return null;
  // Scena schematu ustawiona z dala od ciała (np. pęcherzyk w x = 20 m) nie ma miejsca na sylwetce.
  if (Math.abs(cam.center[0]) > 1.5) return null;
  // Kamera ukośna (np. przekrój skóry) też nie ma prostokąta na sylwetce z przodu ani z boku.
  const axis = (v: readonly number[]) => Math.max(...v.map(Math.abs)) > 0.99;
  if (!axis(cam.right) || !axis(cam.up)) return null;
  const [W, H] = viewResolution(anchors, view);
  const w = W >= H ? cam.orthoScale : (cam.orthoScale * W) / H;
  const h = W >= H ? (cam.orthoScale * H) / W : cam.orthoScale;
  const corners = [-1, 1].flatMap((sx) =>
    [-1, 1].map((sy) => [0, 1, 2].map((i) => cam.center[i] + (sx * w * cam.right[i]) / 2 + (sy * h * cam.up[i]) / 2))
  );
  const pts = corners.map((p) => projectPoint(p, loc.views[sil], loc.resolution));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return [clamp(Math.min(...xs)), clamp(Math.min(...ys)), clamp(Math.max(...xs)), clamp(Math.max(...ys))] as const;
}

/** Sylwetka z boku, gdy widok patrzy z boku (prawo kamery wzdłuż osi Y); inaczej z przodu (przód i tył). */
export function silhouetteFor(anchors: AtlasAnchorsFile, view: AtlasView): 'front' | 'side' {
  const r = anchors.views[view]?.camera?.right;
  return r && Math.abs(r[1]) > 0.99 ? 'side' : 'front';
}

export function Locator({
  base,
  anchors,
  views,
  scaleFree,
  height,
  color,
}: {
  base: string;
  anchors: AtlasAnchorsFile;
  views: AtlasView[];
  scaleFree?: AtlasView[];
  height: number;
  color: string;
}) {
  const [loc, setLoc] = useState<LocatorFile | null>(null);
  useEffect(() => {
    let alive = true;
    loadLocator(base).then((l) => alive && setLoc(l));
    return () => {
      alive = false;
    };
  }, [base]);
  if (!loc || !views.length) return null;
  const sil = silhouetteFor(anchors, views[0]);
  const rects = views.filter((v) => silhouetteFor(anchors, v) === sil).map((v) => frameRect(anchors, v, loc, sil, scaleFree));
  const width = (height * loc.resolution[0]) / loc.resolution[1];
  const schematic = rects.every((r) => r === null);
  return (
    <figure
      className="m-0 rounded-lg border border-slate-700/80 bg-slate-950/70 p-1"
      aria-label={schematic ? 'Lokalizator: schemat bez miejsca na sylwetce' : 'Lokalizator: kadr na sylwetce ciała'}
      title={schematic ? 'Schemat – bez skali i bez miejsca na sylwetce' : 'Kadr planszy na sylwetce ciała'}
    >
      <div className="relative" style={{ width, height }}>
        <img src={`${base}atlas/_lokalizator/${loc.views[sil].image}`} alt="" width={width} height={height} className="block opacity-55" />
        <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="absolute inset-0" width={width} height={height} aria-hidden="true">
          {rects.map(
            (r, i) =>
              r && (
                <rect
                  key={i}
                  x={r[0]}
                  y={r[1]}
                  width={Math.max(0.02, r[2] - r[0])}
                  height={Math.max(0.02, r[3] - r[1])}
                  fill={color}
                  fillOpacity={0.18}
                  stroke={color}
                  strokeWidth={1.6}
                  vectorEffect="non-scaling-stroke"
                />
              )
          )}
        </svg>
      </div>
    </figure>
  );
}
