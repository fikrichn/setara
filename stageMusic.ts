// Cheerful Tropical Beach & Lagoon Stage Music Synthesizer (100% Web Audio API, offline APK-ready)
// Warm coastal marimba melody + sunny ukulele chords + gentle island bass + light beach shaker.
// Theme 0 (Lobby & Bab 0) keeps the original signature theme; Themes 1..5 provide unique melodies per chapter.

interface StageThemeTrack {
  bpm: number;
  melody: number[]; // 32 eighth-note MIDI steps
  bass: number[]; // 32 eighth-note MIDI steps
  chords: number[][]; // 4 bars
  melodyWave?: OscillatorType;
  shakerFreq?: number;
}

const STAGE_THEMES: Record<number, StageThemeTrack> = {
  // Bab 0 & Lobby — EXACT original signature theme song
  0: {
    bpm: 108,
    melody: [
      72, 0, 76, 79,  81, 0, 79, 76,
      74, 0, 79, 74,  71, 0, 74, 0,
      72, 0, 76, 79,  84, 0, 81, 79,
      77, 76, 74, 72, 74, 0, 76, 0,
    ],
    bass: [
      48, 0, 0, 48,   55, 0, 48, 0,
      43, 0, 0, 43,   50, 0, 43, 0,
      45, 0, 0, 45,   52, 0, 45, 0,
      41, 0, 43, 0,   48, 0, 43, 0,
    ],
    chords: [
      [60, 64, 67], // C
      [59, 62, 67], // G
      [57, 60, 64], // Am
      [57, 60, 65], // F
    ],
    melodyWave: 'sine',
    shakerFreq: 5200,
  },

  // Bab 1: Pulau Batu Angka — Upbeat G-Major Calypso Island Groove
  1: {
    bpm: 114,
    melody: [
      79, 0, 83, 86,  83, 0, 81, 79,
      78, 0, 81, 86,  81, 0, 79, 78,
      76, 0, 79, 83,  86, 0, 83, 79,
      81, 79, 78, 76, 79, 0, 83, 0,
    ],
    bass: [
      43, 0, 0, 43,   50, 0, 43, 0,
      50, 0, 0, 50,   45, 0, 50, 0,
      40, 0, 0, 40,   47, 0, 40, 0,
      48, 0, 50, 0,   43, 0, 50, 0,
    ],
    chords: [
      [62, 67, 71], // G
      [62, 66, 69], // D
      [59, 64, 67], // Em
      [60, 64, 67], // C
    ],
    melodyWave: 'sine',
    shakerFreq: 5600,
  },

  // Bab 2: Teluk Tambah & Kurang — Sparkling F-Major Treasure Cove
  2: {
    bpm: 112,
    melody: [
      77, 81, 0, 84,  86, 0, 84, 81,
      79, 0, 84, 79,  76, 0, 79, 0,
      74, 77, 0, 81,  84, 0, 82, 79,
      77, 0, 76, 74,  77, 0, 81, 0,
    ],
    bass: [
      41, 0, 48, 0,   41, 0, 45, 0,
      48, 0, 43, 0,   48, 0, 43, 0,
      50, 0, 45, 0,   46, 0, 41, 0,
      48, 0, 43, 0,   41, 0, 48, 0,
    ],
    chords: [
      [60, 65, 69], // F
      [60, 64, 67], // C
      [57, 62, 65], // Dm
      [58, 62, 65], // Bb
    ],
    melodyWave: 'triangle',
    shakerFreq: 5900,
  },

  // Bab 3: Laguna Suku x — Breezy D-Major Misty Lagoon
  3: {
    bpm: 104,
    melody: [
      74, 0, 78, 81,  86, 0, 81, 78,
      76, 0, 81, 85,  81, 0, 76, 0,
      74, 0, 78, 83,  81, 0, 79, 78,
      76, 74, 73, 76, 74, 0, 78, 0,
    ],
    bass: [
      50, 0, 0, 50,   45, 0, 50, 0,
      45, 0, 0, 45,   52, 0, 45, 0,
      47, 0, 0, 47,   43, 0, 47, 0,
      45, 0, 49, 0,   50, 0, 45, 0,
    ],
    chords: [
      [62, 66, 69], // D
      [61, 64, 69], // A
      [59, 62, 66], // Bm
      [59, 62, 67], // G
    ],
    melodyWave: 'sine',
    shakerFreq: 4700,
  },

  // Bab 4: Karang Kali & Bagi — Energetic A-Minor / C Sea Voyager
  4: {
    bpm: 118,
    melody: [
      81, 0, 84, 88,  86, 84, 83, 81,
      79, 0, 83, 86,  84, 0, 83, 79,
      77, 0, 81, 84,  88, 0, 84, 81,
      79, 77, 76, 79, 81, 0, 76, 0,
    ],
    bass: [
      45, 0, 52, 45,  45, 0, 48, 0,
      43, 0, 50, 43,  48, 0, 43, 0,
      41, 0, 48, 41,  45, 0, 41, 0,
      43, 0, 47, 0,   45, 0, 52, 0,
    ],
    chords: [
      [60, 64, 69], // Am
      [59, 62, 67], // G
      [60, 65, 69], // F
      [60, 64, 67], // C
    ],
    melodyWave: 'triangle',
    shakerFreq: 6200,
  },

  // Bab 5: Samudra Aljabar — Shimmering E-Minor Deep Ocean Quest
  5: {
    bpm: 116,
    melody: [
      76, 0, 79, 83,  88, 0, 86, 83,
      84, 0, 83, 79,  81, 0, 79, 76,
      74, 0, 78, 81,  86, 0, 83, 81,
      79, 78, 76, 74, 76, 0, 83, 0,
    ],
    bass: [
      40, 0, 47, 0,   40, 0, 43, 0,
      48, 0, 43, 0,   45, 0, 48, 0,
      50, 0, 45, 0,   43, 0, 47, 0,
      47, 0, 45, 0,   40, 0, 47, 0,
    ],
    chords: [
      [59, 64, 67], // Em
      [60, 64, 67], // C
      [62, 66, 69], // D
      [59, 62, 67], // G
    ],
    melodyWave: 'sine',
    shakerFreq: 6400,
  },
};

class StageIslandMusic {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private timerId: number | null = null;
  private step = 0;
  private nextNoteTime = 0;
  private running = false;
  private volume = 0.7; // Clamped to [0.15, 1.0]
  private themeId = 0;

  private midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  private getTargetGain(): number {
    return Math.max(0.15, Math.min(1, this.volume)) * 0.28;
  }

  private getActiveTrack(): StageThemeTrack {
    return STAGE_THEMES[this.themeId] ?? STAGE_THEMES[0];
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

  private triggerMarimba(time: number, midi: number, amp = 0.24, wave: OscillatorType = 'sine') {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;
    const freq = this.midiToFreq(midi);

    const osc = ctx.createOscillator();
    osc.type = wave;
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

  private triggerShaker(time: number, accent: boolean, freq = 5200) {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain || !this.noiseBuffer) return;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(freq, time);
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
    const track = this.getActiveTrack();
    const idx = stepIdx % 32;
    const bar = Math.floor(idx / 8); // 4 bars of 8 eighth-notes
    const sub = idx % 8;

    const mel = track.melody[idx];
    if (mel > 0) {
      this.triggerMarimba(time, mel, 0.24, track.melodyWave ?? 'sine');
    }

    const b = track.bass[idx];
    if (b > 0) {
      this.triggerBass(time, b);
    }

    // Island off-beat ukulele strums
    if (sub === 0 || sub === 3 || sub === 6) {
      this.triggerUkuleleChord(time, track.chords[bar]);
    }

    // Light coastal shaker pulse
    this.triggerShaker(time, sub % 2 === 1, track.shakerFreq ?? 5200);
  }

  private scheduler = () => {
    const ctx = this.ctx;
    if (!this.running || !ctx) return;

    const bpm = this.getActiveTrack().bpm;
    const secondsPer8th = 60 / bpm / 2;

    while (this.nextNoteTime < ctx.currentTime + 0.16) {
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

  setTheme(themeId: number) {
    const normalized = STAGE_THEMES[themeId] ? themeId : 0;
    if (this.themeId !== normalized) {
      this.themeId = normalized;
      this.step = 0;
      if (this.ctx) {
        this.nextNoteTime = Math.max(this.nextNoteTime, this.ctx.currentTime + 0.04);
      }
    }
  }

  start(themeId?: number) {
    if (typeof themeId === 'number') {
      this.setTheme(themeId);
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
    this.nextNoteTime = ctx.currentTime + 0.06;
    this.timerId = window.setInterval(this.scheduler, 50);
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
