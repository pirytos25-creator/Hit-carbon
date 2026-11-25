import * as THREE from 'three';

/**
 * Shader propagacji potencjału czynnościowego wzdłuż błony aksonu lub sarkolemy.
 * Uwaga edukacyjna: reprezentuje przesuwającą się falę depolaryzacji (-70mV -> +30mV),
 * a NIE wyładowanie elektryczne (błyskawicę).
 */
export function createActionPotentialMaterial(options?: {
  baseColor?: string;
  waveColor?: string;
  speed?: number;
  frequency?: number;
}): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: true,
    uniforms: {
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color(options?.baseColor ?? '#0e3a5c') },
      uWaveColor: { value: new THREE.Color(options?.waveColor ?? '#38f5ff') },
      uSpeed: { value: options?.speed ?? 1.8 },
      uFreq: { value: options?.frequency ?? 1.0 },
      uActivity: { value: 1.0 },
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
      uniform vec3 uBaseColor;
      uniform vec3 uWaveColor;
      uniform float uSpeed;
      uniform float uFreq;
      uniform float uActivity;
      varying vec2 vUv;
      varying vec3 vNormalV;
      varying vec3 vViewPos;

      void main() {
        float phase = fract(vUv.x * uFreq - uTime * uSpeed);
        // Asymmetric action potential envelope: steep depolarization front + refractory tail
        float rise = smoothstep(0.0, 0.08, phase);
        float decay = exp(-max(0.0, phase - 0.08) * 7.5);
        float wave = rise * decay * uActivity;

        vec3 n = normalize(vNormalV);
        vec3 v = normalize(vViewPos);
        float fresnel = pow(1.0 - max(0.0, dot(n, v)), 2.2);

        vec3 col = mix(uBaseColor, uWaveColor * 1.45, clamp(wave + fresnel * 0.28, 0.0, 1.0));
        col += uWaveColor * wave * 0.65;
        float alpha = 0.86 + wave * 0.14;

        gl_FragColor = vec4(col, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}
