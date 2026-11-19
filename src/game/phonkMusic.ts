// Synthesized Drift Phonk Boss Music Engine (100% Web Audio API, zero external MP3s, offline APK-ready)
// Features iconic 808 cowbell minor melody, distorted 808 sub-bass, punchy kick, crisp snare & rolling trap hi-hats.

class PhonkBossMusic {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private distortionCurve: Float32Array<ArrayBuffer> | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private timerId: number | null = null;
  private step = 0;
  private nextNoteTime = 0;
  private running = false;
  private muted = false;
  private intensity: 'normal' | 'enraged' = 'normal';

  // Dark Phonk minor pentatonic / Phrygian cowbell riff (in MIDI notes, 0 = rest)
  // Key: F# minor / Phrygian (classic Memphis/Drift Phonk vibe)
  private readonly patternA = [
    66, 0, 66, 69,  73, 0, 72, 0,
    66, 0, 69, 66,  64, 0, 61, 0,
    66, 0, 66, 69,  73, 76, 73, 0,
    72, 0, 69, 66,  64, 66, 0, 0,
  ];

  // Enraged Boss Phase 3 higher-energy cowbell melody
  private readonly patternB = [
    73, 0, 73, 76,  78, 0, 76, 73,
    72, 0, 73, 69,  66, 0, 69, 72,
    73, 73, 76, 0,  78, 0, 80, 78,
    76, 73, 72, 69, 66, 0, 61, 0,
  ];

  // Heavy 808 Bassline MIDI notes (F#1 = 42, D1 = 38, C#1 = 37, E1 = 40)
  private readonly bassPattern = [
    42, 0, 0, 42,   0, 0, 42, 0,
    38, 0, 0, 38,   0, 0, 37, 0,
    42, 0, 0, 42,   0, 45, 42, 0,
    40, 0, 0, 38,   37, 0, 0, 0,
  ];

  private midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  private ensureAudio(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.getTargetGain();
      this.masterGain.connect(this.ctx.destination);

      // Soft-clipping overdrive curve for crunchy phonk 808 & cowbell saturation
      const samples = 256;
      const curve = new Float32Array(new ArrayBuffer(samples * 4));
      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = Math.tanh(x * 3.4);
      }
      this.distortionCurve = curve;

      // Pre-generate crisp white noise buffer for snare & hi-hats
      const bufSize = this.ctx.sampleRate * 0.25;
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buf;
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private triggerCowbell(time: number, midi: number) {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    const baseFreq = this.midiToFreq(midi);
    // Iconic 808 cowbell = 2 detuned square waves at ratio ~1.48 + sharp bandpass
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'square';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(baseFreq, time);
    osc2.frequency.setValueAtTime(baseFreq * 1.485, time);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq * 2.1, time);
    filter.Q.setValueAtTime(2.6, time);

    const shaper = ctx.createWaveShaper();
    if (this.distortionCurve) shaper.curve = this.distortionCurve;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.24, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.17);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(shaper);
    shaper.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.19);
    osc2.stop(time + 0.19);
  }

  private trigger808Bass(time: number, midi: number) {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    const freq = this.midiToFreq(midi);
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    // Classic 808 pitch-punch glide
    osc.frequency.setValueAtTime(freq * 1.5, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.045);

    const shaper = ctx.createWaveShaper();
    if (this.distortionCurve) shaper.curve = this.distortionCurve;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(340, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.46, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.34);

    osc.connect(shaper);
    shaper.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.36);
  }

  private triggerKick(time: number) {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(155, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.09);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.55, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.16);
  }

  private triggerSnare(time: number) {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain || !this.noiseBuffer) return;

    // Noise snap
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(1400, time);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.28, time);
    nGain.gain.exponentialRampToValueAtTime(0.001, time + 0.13);

    noise.connect(hp);
    hp.connect(nGain);
    nGain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.14);

    // Body thump
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(125, time + 0.06);

    const oGain = ctx.createGain();
    oGain.gain.setValueAtTime(0.22, time);
    oGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(oGain);
    oGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.09);
  }

  private triggerHiHat(time: number, accent: boolean) {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain || !this.noiseBuffer) return;

    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(6800, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(accent ? 0.14 : 0.075, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (accent ? 0.055 : 0.032));

    noise.connect(hp);
    hp.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.06);
  }

  private scheduleStep(stepIdx: number, time: number) {
    const idx = stepIdx % 32;
    const sub = stepIdx % 16;

    // Cowbell melody
    const melody = this.intensity === 'enraged' ? this.patternB : this.patternA;
    const note = melody[idx];
    if (note > 0) {
      this.triggerCowbell(time, note);
    }

    // Distorted 808 sub-bass
    const bass = this.bassPattern[idx];
    if (bass > 0) {
      this.trigger808Bass(time, bass);
    }

    // Punchy Phonk Kick pattern
    if (sub === 0 || sub === 3 || sub === 6 || sub === 10 || (this.intensity === 'enraged' && sub === 14)) {
      this.triggerKick(time);
    }

    // Hard Snare / Clap on beats 2 & 4 (steps 4 & 12)
    if (sub === 4 || sub === 12) {
      this.triggerSnare(time);
    }

    // Fast Trap/Phonk Hi-Hat Groove + 32nd-note roll at end of bar
    if (sub % 2 === 0 || sub === 11 || sub === 15) {
      this.triggerHiHat(time, sub % 4 === 0);
    }
    if (sub === 14 || (this.intensity === 'enraged' && sub === 7)) {
      const bpm = this.intensity === 'enraged' ? 146 : 136;
      const stepSec = 60 / bpm / 4;
      this.triggerHiHat(time + stepSec * 0.5, false);
    }
  }

  private scheduler = () => {
    const ctx = this.ctx;
    if (!this.running || !ctx) return;

    const bpm = this.intensity === 'enraged' ? 146 : 136;
    const secondsPer16th = 60 / bpm / 4;

    while (this.nextNoteTime < ctx.currentTime + 0.12) {
      this.scheduleStep(this.step, this.nextNoteTime);
      this.nextNoteTime += secondsPer16th;
      this.step += 1;
    }
  };

  private volume = 0.7;

  private getTargetGain(): number {
    return Math.max(0.15, Math.min(1, this.volume)) * 0.42;
  }

  setVolume(vol: number) {
    this.volume = Math.max(0.15, Math.min(1, vol));
    if (this.ctx && this.masterGain && this.running) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(this.getTargetGain(), now, 0.05);
    }
  }

  start(intensity: 'normal' | 'enraged' = 'normal') {
    this.intensity = intensity;
    const ctx = this.ensureAudio();
    if (!ctx) return;

    if (this.masterGain) {
      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(this.getTargetGain(), now, 0.08);
    }

    if (this.running) return;
    this.running = true;
    this.step = 0;
    this.nextNoteTime = ctx.currentTime + 0.05;
    this.timerId = window.setInterval(this.scheduler, 30);
  }

  setIntensity(intensity: 'normal' | 'enraged') {
    this.intensity = intensity;
  }

  setMuted(_muted: boolean) {
    // Music cannot be disabled; use setVolume() via Settings instead.
    if (this.ctx && this.masterGain && this.running) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(this.getTargetGain(), now, 0.05);
    }
  }

  isRunning() {
    return this.running;
  }

  stop() {
    this.running = false;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(0.0001, now, 0.06);
    }
  }
}

export const phonkMusic = new PhonkBossMusic();
