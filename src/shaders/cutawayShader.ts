import * as THREE from 'three';

export interface OrganicCutawayUniforms {
  uCutMode: { value: number }; // 0=off, 1=planar X slice (brain), 2=spherical window reveal (athlete thigh/torso)
  uCutProgress: { value: number }; // planar cutoff X OR spherical radius
  uCutCenter: { value: THREE.Vector3 };
  uCutRimColor: { value: THREE.Color };
}

export function createCutawayUniforms(
  mode: 0 | 1 | 2 = 2,
  rimColorHex = '#fb7185'
): OrganicCutawayUniforms {
  return {
    uCutMode: { value: mode },
    uCutProgress: { value: 0.0 },
    uCutCenter: { value: new THREE.Vector3(0.14, 0.72, 0.02) },
    uCutRimColor: { value: new THREE.Color(rimColorHex) },
  };
}

/**
 * Patches any MeshStandardMaterial / MeshPhysicalMaterial with an animated,
 * noise-modulated biological anatomical cutaway (no jagged flat slicing or ghost alphas!).
 */
export function patchMaterialWithOrganicCutaway(
  mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial,
  uniforms: OrganicCutawayUniforms
) {
  mat.side = THREE.DoubleSide;
  mat.customProgramCacheKey = () => 'biogenesis_organic_cutaway_v2';
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uCutMode = uniforms.uCutMode;
    shader.uniforms.uCutProgress = uniforms.uCutProgress;
    shader.uniforms.uCutCenter = uniforms.uCutCenter;
    shader.uniforms.uCutRimColor = uniforms.uCutRimColor;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vCutWorldPos;`
      )
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
         #if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
           vCutWorldPos = worldPosition.xyz;
         #else
           vCutWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
         #endif`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform float uCutMode;
         uniform float uCutProgress;
         uniform vec3 uCutCenter;
         uniform vec3 uCutRimColor;
         varying vec3 vCutWorldPos;
         float bioCutNoise(vec3 p) {
           return (sin(p.x * 26.0 + sin(p.z * 19.0)) * cos(p.y * 23.0 + p.z * 17.0)) * 0.5 + 0.5;
         }`
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
         float cutRimMask = 0.0;
         if (uCutMode > 0.5 && uCutProgress > 0.005) {
           float n = bioCutNoise(vCutWorldPos) * 0.035;
           if (uCutMode < 1.5) {
             // Mode 1: Anatomical sagittal cutaway sliding inward
             float dist = vCutWorldPos.x - uCutProgress + n;
             if (dist > 0.0) discard;
             cutRimMask = smoothstep(-0.045, 0.0, dist);
           } else {
             // Mode 2: Spherical localized anatomical window opening cleanly over thigh/torso
             float d = length((vCutWorldPos - uCutCenter) * vec3(1.0, 0.72, 1.0));
             float r = uCutProgress + n;
             if (d < r) discard;
             cutRimMask = 1.0 - smoothstep(r, r + 0.042, d);
           }
         }`
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         totalEmissiveRadiance += uCutRimColor * cutRimMask * 1.15;`
      );
  };
  mat.needsUpdate = true;
}
