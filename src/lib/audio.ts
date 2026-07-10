/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class RetroAudioSynth {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    // Lazy initialized on first user interaction to bypass browser constraints
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playJump() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  playSlide() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.25);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  playShoot() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.12);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  playHit() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(180, t);
    osc1.frequency.linearRampToValueAtTime(40, t + 0.25);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(185, t);
    osc2.frequency.linearRampToValueAtTime(45, t + 0.25);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.26);
    osc2.stop(t + 0.26);
  }

  playScore() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Classic 8-bit double beep arpeggio (C5 then G5)
    osc.frequency.setValueAtTime(523.25, t); // C5
    osc.frequency.setValueAtTime(783.99, t + 0.08); // G5

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.21);
  }

  playBossWarning() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Dual frequency siren sweep
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.setValueAtTime(180, t + 0.2);
    osc.frequency.setValueAtTime(220, t + 0.4);
    osc.frequency.setValueAtTime(180, t + 0.6);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.7);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.8);
  }

  playBossDefeated() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Beautiful C Major arpeggio
    const step = 0.08;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + idx * step);

      gain.gain.setValueAtTime(0.05, t + idx * step);
      gain.gain.linearRampToValueAtTime(0.001, t + idx * step + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + idx * step);
      osc.stop(t + idx * step + 0.26);
    });
  }

  playBossLaser() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.4);

    gain.gain.setValueAtTime(0.07, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.46);
  }
}

export const audioSynth = new RetroAudioSynth();
export default audioSynth;
