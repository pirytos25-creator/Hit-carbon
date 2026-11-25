import * as THREE from 'three';
import { PerformanceMetricsSnapshot, QualityTier } from '../types/biogenesis';

class PerformanceMonitorImpl {
  private frameTimesMs: number[] = [];
  private maxSamples = 120;
  private drawCalls = 0;
  private triangles = 0;
  private geometries = 0;
  private textures = 0;
  private webglContextAlive = true;
  private audioUnlocked = false;
  private narrationManifestLoaded = false;
  private activeQuality: QualityTier = 'High';

  public recordFrame(dtSec: number, gl?: THREE.WebGLRenderer) {
    const ms = Math.min(200, Math.max(0.1, dtSec * 1000));
    this.frameTimesMs.push(ms);
    if (this.frameTimesMs.length > this.maxSamples) {
      this.frameTimesMs.shift();
    }
    if (gl) {
      this.drawCalls = gl.info.render.calls;
      this.triangles = gl.info.render.triangles;
      this.geometries = gl.info.memory.geometries;
      this.textures = gl.info.memory.textures;
    }
  }

  public setWebglAlive(alive: boolean) {
    this.webglContextAlive = alive;
  }

  public setAudioUnlocked(unlocked: boolean) {
    this.audioUnlocked = unlocked;
  }

  public setNarrationManifestLoaded(loaded: boolean) {
    this.narrationManifestLoaded = loaded;
  }

  public setActiveQuality(tier: QualityTier) {
    this.activeQuality = tier;
  }

  public getSnapshot(): PerformanceMetricsSnapshot {
    const samples = this.frameTimesMs.length > 0 ? [...this.frameTimesMs].sort((a, b) => a - b) : [16.67];
    const p50 = samples[Math.floor(samples.length * 0.5)] || 16.67;
    const p95 = samples[Math.floor(samples.length * 0.95)] || p50;
    const avg = samples.reduce((acc, v) => acc + v, 0) / samples.length;
    const fps = Math.round(1000 / Math.max(1, avg));

    return {
      fps,
      frameTimeMsP50: Number(p50.toFixed(2)),
      frameTimeMsP95: Number(p95.toFixed(2)),
      drawCalls: this.drawCalls,
      triangles: this.triangles,
      geometries: this.geometries,
      textures: this.textures,
      webglContextAlive: this.webglContextAlive,
      audioUnlocked: this.audioUnlocked,
      narrationManifestLoaded: this.narrationManifestLoaded,
      activeQuality: this.activeQuality,
    };
  }
}

export const performanceMonitor = new PerformanceMonitorImpl();
