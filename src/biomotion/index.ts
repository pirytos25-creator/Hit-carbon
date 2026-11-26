// Wspólny moduł animacji `biomotion` (M4): atlas 3D, gabloty narządów, film „12 aktów”.
// Architektura: docs/atlas_wizualizacja/BIOMOTION_ARCHITEKTURA.md. Moduł nie importuje stanu filmu.
export { type BioFrame, createBioFrame } from './frame';
export { BioClock, SEEK_THRESHOLD_SEC } from './clock/BioClock';
export { getSegmentAt, stepDurationSec, type Segment, type SegmentAt } from './timeline/segments';
export { evaluateShots, evalSmoothstepSegments, evalCatmull, type RailShot, type ShotTransition, type ShotEval } from './camera/ShotRail';
export { followShot, dampFov, dollyZoom, microDrift, expDamp } from './camera/CameraRig';
export { Rail, type Shot } from './camera/Rail';
export { FlowPath, type FlowPathOptions } from './particles/FlowPath';
export { FlowParticles, filmSystolicPulse, type FlowParticlesOptions } from './particles/FlowParticles';
export { createErythrocyteGeometry, createDropletGeometry } from './particles/shapes';
export { heartCycle, createHeartWeights, setMorph, PRESET_FILM_ACT3, PRESET_FILM_ACT12, type HeartCycleWindows, type HeartCycleWeights } from './tissue/heartCycle';
export { LOOK_PROFILES, tokenColorFor, applyMatte, type LookProfile, type LookProfileId } from './look/profiles';
export { agx, compensateForAgX, compensateHexForAgX, predictedDeltaE, fitLightModel, deltaE00, linearToLab, hexToLinear, linearToHex, DEFAULT_LIGHT, type LightModel } from './look/agx';
export { tierParams, type BioTierParams } from './quality/tiers';
