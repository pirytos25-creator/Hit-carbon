import * as THREE from 'three';

/**
 * Shader ścian naczyń krwionośnych reagujący na saturację tlenową (tętnice vs żyły) oraz falę tętna.
 */
export function createVascularFlowMaterial(options?: {
  oxygenation?: number; // 0 = venous burgundy, 1 = arterial scarlet
  opacity?: number;
}): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uOxygenation: { value: options?.oxygenation ?? 0.9 },
      uOpacity: { value: options?.opacity ?? 0.34 },
      uBeatPhase: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormalV;
      varying vec3 vViewPos;
      uniform float uBeatPhase;
      void main() {
        vUv = uv;
        float pulse = sin(uBeatPhase * 6.2831853) * 0.015;
        vec3 pos = position + normal * pulse;
        vNormalV = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        vViewPos = -mvPos.xyz;
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uOxygenation;
      uniform float uOpacity;
      varying vec2 vUv;
      varying vec3 vNormalV;
      varying vec3 vViewPos;

      void main() {
        vec3 venous = vec3(0.36, 0.09, 0.28);
        vec3 arterial = vec3(0.86, 0.12, 0.18);
        vec3 baseCol = mix(venous, arterial, uOxygenation);

        vec3 n = normalize(vNormalV);
        vec3 v = normalize(vViewPos);
        float rim = pow(1.0 - abs(dot(n, v)), 1.9);
        float flowBand = 0.5 + 0.5 * sin(vUv.x * 24.0 - uTime * 5.0);

        vec3 col = baseCol * (0.65 + 0.35 * flowBand) + vec3(1.0, 0.35, 0.4) * rim * 0.45;
        float alpha = clamp(uOpacity * (0.55 + rim * 0.85), 0.12, 0.92);

        gl_FragColor = vec4(col, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}
