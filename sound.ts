// Lightweight Web Audio API marimba / bamboo chime synthesizer (zero external audio files)

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled = true;
  private volume = 0.85; // 0.0 .. 1.0

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.enabled = this.volume > 0.01;
  }

  getVolume() {
    return this.volume;
  }

  private getContext(): AudioContext | null {
    if (!this.enabled || this.volume <= 0.01 || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'triangle',
    baseVol = 0.14,
    delay = 0
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const scaledVol = Math.max(0.001, baseVol * this.volume);
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(scaledVol, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  playPickup() {
    this.playTone(392, 0.08, 'triangle', 0.1);
  }

  playTranspose() {
    this.playTone(293.66, 0.1, 'triangle', 0.11, 0);
    this.playTone(440, 0.12, 'sine', 0.13, 0.07);
    this.playTone(587.33, 0.15, 'triangle', 0.12, 0.14);
  }

  playCombine() {
    this.playTone(440, 0.1, 'triangle', 0.12, 0);
    this.playTone(587.33, 0.14, 'triangle', 0.12, 0.05);
  }

  playZeroCancel() {
    this.playTone(523.25, 0.12, 'sine', 0.12, 0);
    this.playTone(659.25, 0.14, 'sine', 0.12, 0.05);
    this.playTone(783.99, 0.2, 'sine', 0.1, 0.1);
  }

  playExpand() {
    this.playTone(349.23, 0.09, 'triangle', 0.1, 0);
    this.playTone(440, 0.09, 'triangle', 0.1, 0.06);
    this.playTone(523.25, 0.12, 'triangle', 0.11, 0.12);
  }

  playNudge() {
    this.playTone(196, 0.14, 'sine', 0.1, 0);
  }

  playKiboGiggle() {
    const ctx = this.getContext();
    if (!ctx) return;
    const notes = [587.33, 783.99, 987.77];
    notes.forEach((f, i) => {
      const start = ctx.currentTime + i * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, start);
      osc.frequency.exponentialRampToValueAtTime(f * 1.18, start + 0.065);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.002, 0.13 * this.volume), start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.085);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.09);
    });
  }

  playKiboCry() {
    // Cute gentle descending whimper when player opens Exit Game confirmation
    const ctx = this.getContext();
    if (!ctx) return;
    const cries = [
      { from: 620, to: 490, delay: 0 },
      { from: 540, to: 415, delay: 0.19 },
      { from: 460, to: 350, delay: 0.39 },
    ];
    cries.forEach(({ from, to, delay }) => {
      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(from, start);
      osc.frequency.exponentialRampToValueAtTime(to, start + 0.16);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.002, 0.12 * this.volume), start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.2);
    });
  }

  playBossTaunt() {
    this.playTone(164.81, 0.12, 'sawtooth', 0.08, 0);
    this.playTone(146.83, 0.18, 'triangle', 0.11, 0.08);
  }

  playBossHit() {
    this.playTone(146.83, 0.16, 'sawtooth', 0.12, 0);
    this.playTone(110, 0.18, 'triangle', 0.15, 0.04);
    this.playTone(587.33, 0.18, 'triangle', 0.12, 0.1);
    this.playTone(880, 0.22, 'sine', 0.13, 0.16);
  }

  playVictory() {
    const notes = [392.0, 440.0, 523.25, 587.33, 783.99];
    notes.forEach((n, i) => {
      this.playTone(n, 0.28, 'triangle', 0.13, i * 0.085);
    });
  }

  playBossVictory() {
    const notes = [392.0, 493.88, 587.33, 783.99, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.playTone(n, 0.28, 'triangle', 0.14, i * 0.08);
    });
  }

  playHighFive() {
    const ctx = this.getContext();
    if (ctx) {
      const bufferSize = Math.floor(ctx.sampleRate * 0.06);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(Math.max(0.002, 0.28 * this.volume), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    }

    const sparkle = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    sparkle.forEach((n, i) => {
      this.playTone(n, 0.24, 'triangle', 0.14, 0.04 + i * 0.065);
    });
  }
}

export const sound = new SoundEngine();
