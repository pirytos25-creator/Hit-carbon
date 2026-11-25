import * as THREE from 'three';

/**
 * Shader błon selektywnych (wewnętrzna błona mitochondrium / gradient H+ lub śródbłonek bariery krew-mózg).
 */
export function createMembraneProtonMaterial(options?: {
  primaryColor?: string;
  secondaryColor?: string;
  opacity?: number;
}): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uPrimary: { value: new THREE.Color(options?.primaryColor ?? '#f97316') },
      uSecondary: { value: new THREE.Color(options?.secondaryColor ?? '#38bdf8') },
      uOpacity: { value: options?.opacity ?? 0.52 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormalV;
      varying vec3 vViewPos;
      void main() {
        vUv = uv;
        vNormalV = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uPrimary;
      uniform vec3 uSecondary;
      uniform float uOpacity;
      varying vec2 vUv;
      varying vec3 vNormalV;
      varying vec3 vViewPos;

      void main() {
        vec3 n = normalize(vNormalV);
        vec3 v = normalize(vViewPos);
        float rim = pow(1.0 - abs(dot(n, v)), 2.2);
        float shimmer = 0.5 + 0.5 * sin(vUv.x * 16.0 + vUv.y * 12.0 - uTime * 2.4);

        vec3 col = mix(uPrimary, uSecondary, shimmer * 0.45 + rim * 0.45);
        col += uSecondary * rim * 0.35;
        float alpha = clamp(uOpacity + rim * 0.35, 0.15, 0.9);

        gl_FragColor = vec4(col, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}
