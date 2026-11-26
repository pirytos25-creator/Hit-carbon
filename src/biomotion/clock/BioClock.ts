/**
 * Zegar faz fizjologicznych (serce, oddech) całkowany w czasie.
 * Naprawia błąd filmu: w trybie filmowym PhysiologyEngine liczył beatPhase = (t·HR/60) % 1,
 * więc przy każdej zmianie zaokrąglonego tętna faza skakała (skurcz „przeskakiwał”).
 * Tu faza rośnie o dt·HR/60. Przy skoku czasu (przewinięcie) ustawia się deterministycznie z (t·HR/60) % 1.
 */
export const SEEK_THRESHOLD_SEC = 0.45;

const frac = (x: number) => x - Math.floor(x);

export class BioClock {
  beatPhase = 0;
  breathPhase = 0;
  private last: number | null = null;

  /** Ustawia fazy deterministycznie dla czasu t (start albo przewinięcie). */
  reset(timeSec: number, heartRate: number, respiratoryRate: number) {
    this.beatPhase = frac((timeSec * heartRate) / 60);
    this.breathPhase = frac((timeSec * respiratoryRate) / 60);
    this.last = timeSec;
  }

  /**
   * Przesuwa fazy do czasu `timeSec`. Zwraca przyrost czasu i to, czy był skok.
   * Skok: czas cofnął się albo przeskoczył o więcej niż SEEK_THRESHOLD_SEC.
   */
  update(timeSec: number, heartRate: number, respiratoryRate: number): { dt: number; seeked: boolean } {
    if (this.last === null) {
      this.reset(timeSec, heartRate, respiratoryRate);
      return { dt: 0, seeked: true };
    }
    const dt = timeSec - this.last;
    if (dt < 0 || dt > SEEK_THRESHOLD_SEC) {
      this.reset(timeSec, heartRate, respiratoryRate);
      return { dt: 0, seeked: true };
    }
    this.last = timeSec;
    this.beatPhase = frac(this.beatPhase + (dt * heartRate) / 60);
    this.breathPhase = frac(this.breathPhase + (dt * respiratoryRate) / 60);
    return { dt, seeked: false };
  }
}
