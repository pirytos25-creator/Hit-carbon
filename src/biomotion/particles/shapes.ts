import * as THREE from 'three';

/**
 * Krwinka czerwona: dwuwklęsły krążek z profilu Evansa-Funga (te same współczynniki co w filmie,
 * src/scenes/MolecularSimulation.tsx). `steps` i `segments` sterują poziomem szczegółu (LOD).
 */
export function createErythrocyteGeometry(radius = 0.044, steps = 26, segments = 28): THREE.LatheGeometry {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI;
    const sinT = Math.sin(theta);
    const u2 = sinT * sinT;
    pts.push(new THREE.Vector2(radius * sinT, 0.52 * radius * Math.cos(theta) * (0.207 + 2.003 * u2 - 1.123 * u2 * u2)));
  }
  const geo = new THREE.LatheGeometry(pts, segments);
  geo.computeVertexNormals();
  return geo;
}

/** Kropla (hormon, glukoza, mocz): spłaszczona kula. */
export function createDropletGeometry(radius = 0.02, detail = 1): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(radius, detail);
  g.scale(1, 0.82, 1);
  return g;
}
