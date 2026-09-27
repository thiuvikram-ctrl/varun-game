/**
 * Synthesized Web Audio API sound engine for tactical military combat
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Gunfire synthesized with noise burst + low-end thump + high crack
  public playGunshot(type: 'ar' | 'sniper' | 'smg' | 'shotgun' | 'lmg' | 'pistol' = 'ar') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Noise burst
    const bufferSize = this.ctx.sampleRate * (type === 'sniper' ? 0.35 : type === 'shotgun' ? 0.28 : 0.15);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = type === 'sniper' ? 'lowpass' : 'bandpass';
    filter.frequency.setValueAtTime(type === 'sniper' ? 1200 : type === 'smg' ? 2400 : 1800, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.15);

    const noiseGain = this.ctx.createGain();
    const vol = type === 'sniper' ? 0.45 : type === 'shotgun' ? 0.4 : 0.25;
    noiseGain.gain.setValueAtTime(vol, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + (type === 'sniper' ? 0.35 : 0.15));

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);

    // Punchy low-end sub-bass thump
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    const startFreq = type === 'sniper' ? 140 : type === 'shotgun' ? 120 : 90;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);

    oscGain.gain.setValueAtTime(type === 'sniper' ? 0.5 : 0.3, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Tactical COD hitmarker tick
  public playHitmarker(isHeadshot: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isHeadshot) {
      // Crisp metallic ding for headshot
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800, t);
      osc.frequency.setValueAtTime(2400, t + 0.04);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    } else {
      // COD style subtle marker snap
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + (isHeadshot ? 0.2 : 0.07));
  }

  // Elimination / Kill chime
  public playKillSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [520, 650, 780].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);
      gain.gain.setValueAtTime(0.2, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.16);
    });
  }

  // Tactical reload magazine snap
  public playReload() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Step 1: Magazine release
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.frequency.setValueAtTime(320, t);
    gain1.gain.setValueAtTime(0.2, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.09);

    // Step 2: New magazine click in
    setTimeout(() => {
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(950, t2);
      gain2.gain.setValueAtTime(0.25, t2);
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.1);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t2);
      osc2.stop(t2 + 0.11);
    }, 350);
  }

  // Vehicle engine hum / rev
  public playVehicleEngine() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.exponentialRampToValueAtTime(130, t + 0.25);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  // Safe zone alarm / warning
  public playZoneWarning() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(330, t + 0.15);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  // UI button click
  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(1200, t);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Healing / Medkit use sound
  public playHealSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(780, t + 0.28);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  // Armor plate slotting sound
  public playArmorEquip() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.setValueAtTime(420, t + 0.08);
    osc.frequency.setValueAtTime(260, t + 0.16);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  // Diamond purchase / reward fanfare
  public playDiamondChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);
      gain.gain.setValueAtTime(0.2, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.4);
    });
  }

  // Victory Royale anthem
  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const fanfare = [
      { f: 440, d: 0.15 },
      { f: 554.37, d: 0.15 },
      { f: 659.25, d: 0.2 },
      { f: 880, d: 0.6 }
    ];
    let cursor = 0;
    fanfare.forEach(item => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, t + cursor);
      gain.gain.setValueAtTime(0.3, t + cursor);
      gain.gain.exponentialRampToValueAtTime(0.001, t + cursor + item.d);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t + cursor);
      osc.stop(t + cursor + item.d + 0.05);
      cursor += item.d;
    });
  }

  // Defeat / Elimination sound
  public playDefeatSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.5);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  // Roblox-style energetic jump sound
  public playJumpSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.12);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  // Roblox-style soft landing thud
  public playLandSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.1);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  // Roblox-style satisfying hit tick chime
  public playDamageTick(isCritical: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isCritical ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isCritical ? 1400 : 950, t);
    osc.frequency.exponentialRampToValueAtTime(isCritical ? 1900 : 1200, t + 0.05);
    gain.gain.setValueAtTime(isCritical ? 0.35 : 0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  // Roblox-style multi-kill streak fanfare
  public playStreakFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [440, 554, 659, 880].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      gain.gain.setValueAtTime(0.25, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.22);
    });
  }
}

export const sound = new SoundEngine();
