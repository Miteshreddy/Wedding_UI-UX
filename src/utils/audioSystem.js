/**
 * Web Audio API Procedural Sound Synthesizer
 * Generates organic, tactile audio effects purely with Web Audio API.
 * Zero external audio assets needed — instantly available and lightweight.
 */

class AudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false; // Audio on by default after init — immersive by design
    this.masterGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch {
      // Graceful fallback if Web Audio is unsupported
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (!this.initialized) {
      if (!muted) this.init();
      return;
    }
    if (this.ctx && this.ctx.state === 'suspended' && !muted) {
      this.ctx.resume();
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.35, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // 1. Wax Crack: Crisp fracture snap followed by a resonant harmonic ring
  playWaxCrack() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Noise burst for crisp snap
    const bufferSize = this.ctx.sampleRate * 0.06;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1800, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(now);

    // Resonant chime body
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);

    oscGain.gain.setValueAtTime(0.25, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // 2. Paper Rustle: Soft filtered noise simulating ancient parchment drag
  playPaperRustle() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const dur = 0.45;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const env = Math.sin(progress * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env * (1 - progress * 0.5);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(850, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  // 3. Ink Writing: High-frequency quill scratching delicately onto paper
  playInkWrite() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const dur = 0.28;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400 + Math.random() * 400, now);
    osc.frequency.linearRampToValueAtTime(800 + Math.random() * 300, now + dur);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(3.5, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);
  }

  // 4. Footstep: Gentle muffled stone / path tap
  playFootstep() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const dur = 0.12;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + dur);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);
  }

  // 5. Liquid Whoosh: Low-pass harmonic sweep for photo distortion transitions
  playLiquidWhoosh() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const dur = 0.55;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + dur * 0.4);
    osc.frequency.exponentialRampToValueAtTime(120, now + dur);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.exponentialRampToValueAtTime(900, now + dur * 0.4);
    filter.frequency.exponentialRampToValueAtTime(180, now + dur);
    filter.Q.setValueAtTime(4.0, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);
  }

  // 6. Clock Tick: Antique mechanical escapement click
  playClockTick() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const dur = 0.04;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + dur);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);
  }

  // 7. Stamp Thud: Heavy antique brass wax stamp impact with deep sub-resonance
  playStampThud() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Sub bass impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.4);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.4);

    // High metallic seal ring
    const bell = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();

    bell.type = 'sine';
    bell.frequency.setValueAtTime(880, now);
    bell.frequency.exponentialRampToValueAtTime(440, now + 0.6);

    bellGain.gain.setValueAtTime(0.2, now);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    bell.connect(bellGain);
    bellGain.connect(this.masterGain);

    bell.start(now);
    bell.stop(now + 0.6);
  }

  // 8. Celestial Chime: Harmonic chord for constellations and final reveal
  playCelestialChime(freq = 528) {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const harmonics = [1, 1.5, 2, 2.5, 3];

    harmonics.forEach((h, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * h, now);

      const dur = 1.2 + idx * 0.2;
      const initialGain = 0.12 / (idx + 1);

      gain.gain.setValueAtTime(initialGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + dur);
    });
  }
}

export const sound = new AudioSystem();
