// Cheerful Tropical Beach & Lagoon Stage Music Synthesizer (100% Web Audio API, offline APK-ready)
// Warm coastal marimba melody + sunny ukulele chords + gentle island bass + light beach shaker.
// Designed so music is always active (minimum volume floor 15%, controlled via Settings slider).

class StageIslandMusic {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private timerId: number | null = null;
  private step = 0;
  private nextNoteTime = 0;
  private running = false;
  private volume = 0.7; // Clamped to [0.15, 1.0]

  // Happy sunny pentatonic/C-major coastal marimba melody (32 eighth-note steps = 4 bars)
  private readonly melody = [
    72, 0, 76, 79,  81, 0, 79, 76,
    74, 0, 79, 74,  71, 0, 74, 0,
    72, 0, 76, 79,  84, 0, 81, 79,
    77, 76, 74, 72, 74, 0, 76, 0,
  ];

  // Warm bouncy island marimba bass (C3=48, G2=43, A2=45, F2=41)
  private readonly bass = [
    48, 0, 0, 48,   55, 0, 48, 0,
    43, 0, 0, 43,   50, 0, 43, 0,
    45, 0, 0, 45,   52, 0, 45, 0,
    41, 0, 43, 0,   48, 0, 43, 0,
  ];

  // Gentle ukulele chord arpeggios (C, G, Am, F)
  private readonly chords: number[][] = [
    [60, 64, 67], // C
    [59, 62, 67], // G
    [57, 60, 64], // Am
    [57, 60, 65], // F
  ];

  private midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  private getTargetGain(): number {
    return Math.max(0.15, Math.min(1, this.volume)) * 0.28;
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

      // Soft shaker noise buffer
      const bufSize = Math.floor(this.ctx.sampleRate * 0.08);
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

  private triggerMarimba(time: number, midi: number, amp = 0.24) {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;
    const freq = this.midiToFreq(midi);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // Subtle wooden overtone
    const overtone = ctx.createOscillator();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2, time);

    const oGain = ctx.createGain();
    oGain.gain.setValueAtTime(0.001, time);
    oGain.gain.linearRampToValueAtTime(amp * 0.22, time + 0.008);
    oGain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(amp, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.34);

    osc.connect(gain);
    overtone.connect(oGain);
    oGain.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    overtone.start(time);
    osc.stop(time + 0.36);
    overtone.stop(time + 0.18);
  }

  private triggerUkuleleChord(time: number, notes: number[]) {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    notes.forEach((midi, idx) => {
      const strumTime = time + idx * 0.018;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(this.midiToFreq(midi), strumTime);

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(1600, strumTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, strumTime);
      gain.gain.linearRampToValueAtTime(0.085, strumTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, strumTime + 0.28);

      osc.connect(lp);
      lp.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(strumTime);
      osc.stop(strumTime + 0.3);
    });
  }

  private triggerBass(time: number, midi: number) {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.midiToFreq(midi), time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.26, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.32);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.34);
  }

  private triggerShaker(time: number, accent: boolean) {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain || !this.noiseBuffer) return;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(5200, time);
    bp.Q.setValueAtTime(1.4, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(accent ? 0.065 : 0.032, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    src.connect(bp);
    bp.connect(gain);
    gain.connect(this.masterGain);
    src.start(time);
    src.stop(time + 0.055);
  }

  private scheduleStep(stepIdx: number, time: number) {
    const idx = stepIdx % 32;
    const bar = Math.floor(idx / 8); // 4 bars of 8 eighth-notes
    const sub = idx % 8;

    const mel = this.melody[idx];
    if (mel > 0) {
      this.triggerMarimba(time, mel, 0.24);
    }

    const b = this.bass[idx];
    if (b > 0) {
      this.triggerBass(time, b);
    }

    // Island off-beat ukulele strums
    if (sub === 0 || sub === 3 || sub === 6) {
      this.triggerUkuleleChord(time, this.chords[bar]);
    }

    // Light coastal shaker pulse
    this.triggerShaker(time, sub % 2 === 1);
  }

  private scheduler = () => {
    const ctx = this.ctx;
    if (!this.running || !ctx) return;

    const bpm = 108;
    const secondsPer8th = 60 / bpm / 2;

    while (this.nextNoteTime < ctx.currentTime + 0.14) {
      this.scheduleStep(this.step, this.nextNoteTime);
      this.nextNoteTime += secondsPer8th;
      this.step += 1;
    }
  };

  setVolume(vol: number) {
    this.volume = Math.max(0.15, Math.min(1, vol));
    if (this.ctx && this.masterGain && this.running) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(this.getTargetGain(), now, 0.06);
    }
  }

  start() {
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
    this.nextNoteTime = ctx.currentTime + 0.06;
    this.timerId = window.setInterval(this.scheduler, 35);
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

  isRunning() {
    return this.running;
  }
}

export const stageMusic = new StageIslandMusic();
