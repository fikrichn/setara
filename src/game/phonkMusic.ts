// Synthesized Drift Phonk Boss Music Engine (100% Web Audio API, zero external MP3s, offline APK-ready)
// Features iconic 808 cowbell minor melodies, distorted 808 sub-bass, punchy kick, crisp snare & rolling trap hi-hats.
// Each Boss Chapter (0..5) has its own unique Phonk groove & scale, plus low-CPU shared saturation buses for Helio P35 smoothness.

interface BossPhonkTrack {
  bpmNormal: number;
  bpmEnraged: number;
  normalPattern: number[];
  enragedPattern: number[];
  bassPattern: number[];
  kickSteps: number[];
}

const BOSS_PHONK_TRACKS: Record<number, BossPhonkTrack> = {
  // Bab 0 Boss (Cumi Cilik) — Classic F# Minor Drift Phonk
  0: {
    bpmNormal: 132,
    bpmEnraged: 144,
    normalPattern: [
      66, 0, 66, 69,  73, 0, 72, 0,
      66, 0, 69, 66,  64, 0, 61, 0,
      66, 0, 66, 69,  73, 76, 73, 0,
      72, 0, 69, 66,  64, 66, 0, 0,
    ],
    enragedPattern: [
      73, 0, 73, 76,  78, 0, 76, 73,
      72, 0, 73, 69,  66, 0, 69, 72,
      73, 73, 76, 0,  78, 0, 80, 78,
      76, 73, 72, 69, 66, 0, 61, 0,
    ],
    bassPattern: [
      42, 0, 0, 42,   0, 0, 42, 0,
      38, 0, 0, 38,   0, 0, 37, 0,
      42, 0, 0, 42,   0, 45, 42, 0,
      40, 0, 0, 38,   37, 0, 0, 0,
    ],
    kickSteps: [0, 3, 6, 10],
  },

  // Bab 1 Boss (Kapten Buntal) — Swagger G Minor Pirate Drift Phonk
  1: {
    bpmNormal: 136,
    bpmEnraged: 150,
    normalPattern: [
      67, 0, 70, 67,  74, 0, 73, 70,
      67, 0, 67, 70,  65, 0, 62, 0,
      67, 70, 74, 0,  75, 0, 74, 70,
      67, 0, 65, 62,  65, 67, 0, 0,
    ],
    enragedPattern: [
      74, 0, 74, 77,  79, 0, 77, 74,
      73, 0, 74, 70,  67, 0, 70, 73,
      74, 77, 79, 0,  82, 0, 79, 77,
      74, 73, 70, 67, 70, 0, 62, 0,
    ],
    bassPattern: [
      43, 0, 0, 43,   0, 43, 0, 46,
      39, 0, 0, 39,   0, 0, 38, 0,
      43, 0, 0, 43,   0, 46, 43, 0,
      41, 0, 39, 0,   38, 0, 0, 0,
    ],
    kickSteps: [0, 3, 6, 9, 10],
  },

  // Bab 2 Boss (Kepiting Emas) — Heavy Metallic D Minor Phonk
  2: {
    bpmNormal: 138,
    bpmEnraged: 148,
    normalPattern: [
      62, 62, 65, 0,  69, 0, 68, 65,
      62, 0, 65, 69,  64, 0, 61, 0,
      62, 62, 65, 69, 74, 0, 72, 69,
      68, 0, 65, 64,  62, 0, 57, 0,
    ],
    enragedPattern: [
      74, 74, 77, 0,  81, 0, 80, 77,
      74, 0, 76, 77,  72, 0, 69, 72,
      74, 74, 77, 81, 82, 0, 81, 77,
      74, 72, 69, 68, 65, 0, 62, 0,
    ],
    bassPattern: [
      38, 0, 0, 38,   0, 0, 38, 0,
      41, 0, 0, 41,   0, 0, 37, 0,
      38, 0, 41, 38,  0, 45, 38, 0,
      40, 0, 38, 0,   37, 0, 0, 0,
    ],
    kickSteps: [0, 2, 6, 10, 14],
  },

  // Bab 3 Boss (Kura Meriam) — Heavy Cannon Bounce C Minor Phonk
  3: {
    bpmNormal: 126,
    bpmEnraged: 138,
    normalPattern: [
      60, 0, 0, 63,   67, 0, 66, 0,
      60, 0, 63, 60,  58, 0, 55, 0,
      60, 0, 63, 67,  72, 0, 70, 67,
      66, 0, 63, 60,  58, 60, 0, 0,
    ],
    enragedPattern: [
      72, 0, 72, 75,  79, 0, 78, 75,
      72, 0, 75, 72,  70, 0, 67, 70,
      72, 72, 75, 0,  79, 0, 80, 79,
      75, 72, 70, 67, 63, 0, 60, 0,
    ],
    bassPattern: [
      36, 0, 0, 36,   0, 0, 36, 0,
      39, 0, 0, 39,   0, 0, 35, 0,
      36, 0, 0, 36,   0, 43, 39, 0,
      34, 0, 0, 36,   35, 0, 0, 0,
    ],
    kickSteps: [0, 6, 8, 10],
  },

  // Bab 4 Boss (Kapten Orca) — Aggressive Predator E Minor Phonk
  4: {
    bpmNormal: 142,
    bpmEnraged: 152,
    normalPattern: [
      64, 0, 67, 71,  72, 0, 71, 67,
      64, 64, 67, 0,  62, 0, 59, 0,
      64, 0, 67, 71,  76, 74, 71, 0,
      72, 0, 71, 67,  64, 62, 59, 0,
    ],
    enragedPattern: [
      76, 0, 76, 79,  83, 0, 82, 79,
      76, 79, 83, 0,  74, 0, 71, 74,
      76, 76, 79, 83, 84, 0, 83, 79,
      76, 74, 72, 71, 67, 0, 64, 0,
    ],
    bassPattern: [
      40, 0, 0, 40,   0, 0, 40, 0,
      43, 0, 0, 43,   0, 0, 39, 0,
      40, 0, 43, 40,  0, 47, 43, 0,
      38, 0, 40, 0,   39, 0, 0, 0,
    ],
    kickSteps: [0, 3, 6, 10, 12],
  },

  // Bab 5 Boss (Cthulhu Samudra) — Relentless Cosmic F Minor Drift Phonk
  5: {
    bpmNormal: 144,
    bpmEnraged: 156,
    normalPattern: [
      65, 0, 65, 68,  72, 0, 71, 68,
      65, 0, 68, 72,  73, 0, 72, 68,
      65, 65, 68, 72, 77, 0, 76, 72,
      73, 72, 68, 65, 64, 0, 60, 0,
    ],
    enragedPattern: [
      77, 77, 80, 0,  84, 0, 83, 80,
      77, 0, 80, 84,  85, 0, 84, 80,
      77, 77, 80, 84, 85, 84, 80, 77,
      76, 72, 71, 68, 65, 0, 60, 0,
    ],
    bassPattern: [
      41, 0, 0, 41,   0, 41, 0, 44,
      41, 0, 0, 37,   0, 0, 36, 0,
      41, 0, 44, 41,  0, 48, 44, 0,
      37, 0, 41, 0,   36, 0, 0, 0,
    ],
    kickSteps: [0, 3, 6, 8, 10, 14],
  },
};

class PhonkBossMusic {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private cowbellBus: WaveShaperNode | null = null;
  private bassBus: WaveShaperNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private timerId: number | null = null;
  private step = 0;
  private nextNoteTime = 0;
  private running = false;
  private intensity: 'normal' | 'enraged' = 'normal';
  private chapterId = 0;
  private volume = 0.7;

  private midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  private getActiveTrack(): BossPhonkTrack {
    return BOSS_PHONK_TRACKS[this.chapterId] ?? BOSS_PHONK_TRACKS[0];
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

      // Shared soft-clipping overdrive curve (reused across all notes to avoid per-note WaveShaper allocations)
      const samples = 256;
      const curve = new Float32Array(new ArrayBuffer(samples * 4));
      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = Math.tanh(x * 3.4);
      }

      this.cowbellBus = this.ctx.createWaveShaper();
      this.cowbellBus.curve = curve;
      this.cowbellBus.connect(this.masterGain);

      this.bassBus = this.ctx.createWaveShaper();
      this.bassBus.curve = curve;
      const bassLp = this.ctx.createBiquadFilter();
      bassLp.type = 'lowpass';
      bassLp.frequency.value = 340;
      this.bassBus.connect(bassLp);
      bassLp.connect(this.masterGain);

      // Pre-generate crisp white noise buffer for snare & hi-hats
      const bufSize = Math.floor(this.ctx.sampleRate * 0.25);
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
    if (!ctx || !this.cowbellBus) return;

    const baseFreq = this.midiToFreq(midi);
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

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.24, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.17);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.cowbellBus);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.19);
    osc2.stop(time + 0.19);
  }

  private trigger808Bass(time: number, midi: number) {
    const ctx = this.ctx;
    if (!ctx || !this.bassBus) return;

    const freq = this.midiToFreq(midi);
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 1.5, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.045);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.46, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.34);

    osc.connect(gain);
    gain.connect(this.bassBus);

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
    const track = this.getActiveTrack();
    const idx = stepIdx % 32;
    const sub = stepIdx % 16;

    const melody = this.intensity === 'enraged' ? track.enragedPattern : track.normalPattern;
    const note = melody[idx];
    if (note > 0) {
      this.triggerCowbell(time, note);
    }

    const bass = track.bassPattern[idx];
    if (bass > 0) {
      this.trigger808Bass(time, bass);
    }

    if (
      track.kickSteps.includes(sub) ||
      (this.intensity === 'enraged' && sub === 14 && !track.kickSteps.includes(14))
    ) {
      this.triggerKick(time);
    }

    if (sub === 4 || sub === 12) {
      this.triggerSnare(time);
    }

    if (sub % 2 === 0 || sub === 11 || sub === 15) {
      this.triggerHiHat(time, sub % 4 === 0);
    }
    if (sub === 14 || (this.intensity === 'enraged' && sub === 7)) {
      const bpm = this.intensity === 'enraged' ? track.bpmEnraged : track.bpmNormal;
      const stepSec = 60 / bpm / 4;
      this.triggerHiHat(time + stepSec * 0.5, false);
    }
  }

  private scheduler = () => {
    const ctx = this.ctx;
    if (!this.running || !ctx) return;

    const track = this.getActiveTrack();
    const bpm = this.intensity === 'enraged' ? track.bpmEnraged : track.bpmNormal;
    const secondsPer16th = 60 / bpm / 4;

    while (this.nextNoteTime < ctx.currentTime + 0.15) {
      this.scheduleStep(this.step, this.nextNoteTime);
      this.nextNoteTime += secondsPer16th;
      this.step += 1;
    }
  };

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

  start(intensity: 'normal' | 'enraged' = 'normal', chapterId?: number) {
    this.intensity = intensity;
    if (typeof chapterId === 'number') {
      const nextCh = BOSS_PHONK_TRACKS[chapterId] ? chapterId : 0;
      if (this.chapterId !== nextCh) {
        this.chapterId = nextCh;
        this.step = 0;
      }
    }

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
    this.timerId = window.setInterval(this.scheduler, 50);
  }

  setIntensity(intensity: 'normal' | 'enraged') {
    this.intensity = intensity;
  }

  setMuted(_muted: boolean) {
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
