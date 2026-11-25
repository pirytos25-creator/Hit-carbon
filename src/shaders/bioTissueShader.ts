import * as THREE from 'three';

/**
 * Tworzy materiał tkankowy z efektem rozpraszania podpowierzchniowego (Fresnel rim + organic micro-pulse)
 * zgodny z AgX ToneMapping w Three.js r169.
 */
export function createBioTissueMaterial(options: {
  color: string;
  rimColor?: string;
  opacity?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  pulseStrength?: number;
}): THREE.MeshPhysicalMaterial {
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(options.color),
    roughness: options.roughness ?? 0.36,
    metalness: 0.02,
    clearcoat: 0.35,
    clearcoatRoughness: 0.22,
    transparent: (options.opacity ?? 1) < 0.99,
    opacity: options.opacity ?? 1,
    depthWrite: (options.opacity ?? 1) >= 0.99,
    emissive: new THREE.Color(options.emissive ?? '#000000'),
    emissiveIntensity: options.emissiveIntensity ?? 0.0,
  });

  const rimCol = new THREE.Color(options.rimColor ?? options.color);
  const pulseAmp = options.pulseStrength ?? 0.0;

  mat.userData.uTime = { value: 0 };
  mat.customProgramCacheKey = () => `bio-tissue-${pulseAmp > 0 ? 'pulse' : 'static'}`;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uBioTime = mat.userData.uTime;
    shader.uniforms.uRimColor = { value: rimCol };
    shader.uniforms.uPulseAmp = { value: pulseAmp };

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vBioWorldPos;
        varying vec3 vBioNormalW;`
      )
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
        vBioWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vBioNormalW = normalize(mat3(modelMatrix) * objectNormal);`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uBioTime;
        uniform vec3 uRimColor;
        uniform float uPulseAmp;
        varying vec3 vBioWorldPos;
        varying vec3 vBioNormalW;`
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        vec3 bioViewDir = normalize(cameraPosition - vBioWorldPos);
        float bioFresnel = pow(1.0 - clamp(abs(dot(normalize(vBioNormalW), bioViewDir)), 0.0, 1.0), 2.6);
        float bioWave = 1.0 + uPulseAmp * sin(uBioTime * 3.2 + vBioWorldPos.y * 8.0);
        totalEmissiveRadiance += uRimColor * (bioFresnel * 0.42 * bioWave);`
      );
  };

  return mat;
}
