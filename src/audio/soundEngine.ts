/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Web Audio API sound synthesizer with Chiptune BGM generator
class SoundEngine {
  private ctx: AudioContext | null = null;
  private volumeNode: GainNode | null = null;
  private volume: number = 0.7;
  private musicEnabled: boolean = true;
  private bgmInterval: number | null = null;
  private bgmStep: number = 0;

  private init() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.volumeNode = this.ctx.createGain();
      this.volumeNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.volumeNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.volumeNode && this.ctx) {
      this.volumeNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  // --- PROCEDURAL CHIPTUNE BACKGROUND MUSIC ---
  public startBGM() {
    if (!this.musicEnabled || this.bgmInterval !== null) return;
    this.init();

    // Catchy upbeat chiptune pentatonic progression (C major pentatonic / G / A / F)
    const melody = [
      523.25, 0, 659.25, 783.99, 1046.5, 783.99, 659.25, 0,
      587.33, 0, 698.46, 880.0, 1174.66, 880.0, 698.46, 0,
      440.0, 0, 523.25, 659.25, 880.0, 659.25, 523.25, 0,
      392.0, 0, 493.88, 587.33, 783.99, 587.33, 493.88, 523.25,
    ];

    const bass = [
      130.81, 130.81, 130.81, 130.81,
      146.83, 146.83, 146.83, 146.83,
      110.0, 110.0, 110.0, 110.0,
      98.0, 98.0, 98.0, 130.81,
    ];

    this.bgmInterval = window.setInterval(() => {
      if (!this.musicEnabled || !this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;

      // Melody note
      const note = melody[this.bgmStep % melody.length];
      if (note > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(note, now);
        gain.gain.setValueAtTime(0.04 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(this.volumeNode);
        osc.start(now);
        osc.stop(now + 0.18);
      }

      // Bass note every 2 steps
      if (this.bgmStep % 2 === 0) {
        const bIdx = Math.floor(this.bgmStep / 2) % bass.length;
        const bFreq = bass[bIdx];
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(bFreq, now);
        bGain.gain.setValueAtTime(0.08 * this.volume, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        bOsc.connect(bGain);
        bGain.connect(this.volumeNode);
        bOsc.start(now);
        bOsc.stop(now + 0.3);
      }

      this.bgmStep++;
    }, 140);
  }

  public stopBGM() {
    if (this.bgmInterval !== null) {
      window.clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  // --- SOUND EFFECTS ---
  public playJump() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.14);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.volumeNode);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  public playOof() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.volumeNode);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  public playCoin() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;

      const playTone = (freq: number, start: number, dur: number) => {
        if (!this.ctx || !this.volumeNode) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + dur);
        osc.connect(gain);
        gain.connect(this.volumeNode);
        osc.start(start);
        osc.stop(start + dur + 0.02);
      };

      playTone(987.77, now, 0.08);
      playTone(1318.51, now + 0.08, 0.25);
    } catch {}
  }

  public playSlash() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;

      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.14);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.volumeNode);
      noise.start(now);

      const metal = this.ctx.createOscillator();
      const metalGain = this.ctx.createGain();
      metal.type = 'sine';
      metal.frequency.setValueAtTime(1200, now);
      metal.frequency.exponentialRampToValueAtTime(800, now + 0.12);
      metalGain.gain.setValueAtTime(0.15, now);
      metalGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      metal.connect(metalGain);
      metalGain.connect(this.volumeNode);
      metal.start(now);
      metal.stop(now + 0.13);
    } catch {}
  }

  public playHit() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

      osc.connect(gain);
      gain.connect(this.volumeNode);
      osc.start(now);
      osc.stop(now + 0.17);
    } catch {}
  }

  public playBounce() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.25);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(this.volumeNode);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  public playCheckpoint() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.volumeNode) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.2);
        osc.connect(gain);
        gain.connect(this.volumeNode);
        osc.start(start);
        osc.stop(start + 0.22);
      });
    } catch {}
  }

  public playSpeedBoost() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(this.volumeNode);
      osc.start(now);
      osc.stop(now + 0.24);
    } catch {}
  }

  public playSecretKey() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;
      const notes = [659.25, 880, 1174.66, 1567.98];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.volumeNode) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.06;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.18);
        osc.connect(gain);
        gain.connect(this.volumeNode);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch {}
  }

  public playPaintballShot() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain);
      gain.connect(this.volumeNode);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch {}
  }

  // Comical cartoon BONK sound
  public playBonk() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(this.volumeNode);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  // Funny slide whistle
  public playSlideWhistle() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.55);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.58);
      osc.connect(gain);
      gain.connect(this.volumeNode);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch {}
  }

  // Squeaky toy honk
  public playSqueak() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain);
      gain.connect(this.volumeNode);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  // Banana peel slip
  public playSlip() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.3);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
      osc.connect(gain);
      gain.connect(this.volumeNode);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  public playAlarm() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.15);
      osc.frequency.setValueAtTime(440, now + 0.3);
      osc.frequency.setValueAtTime(880, now + 0.45);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.connect(gain);
      gain.connect(this.volumeNode);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch {}
  }

  public playClick() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.connect(gain);
      gain.connect(this.volumeNode);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  public playBuildPlace() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.06);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(this.volumeNode);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  public playDelete() {
    try {
      this.init();
      if (!this.ctx || !this.volumeNode || this.volume === 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.volumeNode);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }
}

export const sound = new SoundEngine();
