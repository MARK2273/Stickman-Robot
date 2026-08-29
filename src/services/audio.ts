// High-performance Web Audio API Synthesizer for Stickman & Gun 2

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private soundVolume: number = 0.7;
  private musicVolume: number = 0.5;
  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;

  constructor() {
    // Lazy initialized on user gesture
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.soundVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  private resume() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundSettings(enabled: boolean, volume: number) {
    this.soundEnabled = enabled;
    this.soundVolume = volume;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(enabled ? volume : 0, this.ctx.currentTime);
    }
  }

  public setMusicSettings(enabled: boolean, volume: number) {
    this.musicEnabled = enabled;
    this.musicVolume = volume;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(enabled ? volume : 0, this.ctx.currentTime);
    }
    if (!enabled && this.isMusicPlaying) {
      this.stopMusic();
    } else if (enabled && !this.isMusicPlaying) {
      this.startBattleMusic();
    }
  }

  // Gunshot sounds
  public playShoot(type: 'pistol' | 'smg' | 'shotgun' | 'rifle' | 'sniper' | 'heavy' | 'laser' | 'rocket' | 'magic' | 'bow') {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    switch (type) {
      case 'pistol': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(380, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);

        // Noise buffer for snap
        this.playNoise(0.04, 0.4, 2500);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.08);
        break;
      }
      case 'smg': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(420, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.05);

        this.playNoise(0.03, 0.3, 3000);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
      }
      case 'shotgun': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(25, t + 0.2);

        this.playNoise(0.18, 0.8, 1200);

        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      }
      case 'rifle': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.09);

        this.playNoise(0.06, 0.5, 2200);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.09);
        break;
      }
      case 'sniper': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(550, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.25);

        this.playNoise(0.2, 0.9, 3500);

        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.25);
        break;
      }
      case 'heavy': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.08);

        this.playNoise(0.06, 0.6, 1800);

        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.08);
        break;
      }
      case 'laser': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(220, t + 0.12);

        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.12);
        break;
      }
      case 'rocket': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.linearRampToValueAtTime(380, t + 0.15);

        this.playNoise(0.18, 0.5, 900);

        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      }
      case 'magic': {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(600, t);
        osc1.frequency.exponentialRampToValueAtTime(1200, t + 0.15);
        osc2.frequency.setValueAtTime(450, t);
        osc2.frequency.exponentialRampToValueAtTime(900, t + 0.15);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGain);
        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.18);
        osc2.stop(t + 0.18);
        break;
      }
      case 'bow': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, t);
        osc.frequency.linearRampToValueAtTime(80, t + 0.08);

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.08);
        break;
      }
    }
  }

  // Explosion sound
  public playExplosion() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.4);

    this.playNoise(0.35, 0.9, 800);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  // Enemy hit / hurt
  public playHit() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.04);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  // Reload sound
  public playReload() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Click 1 (eject)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(700, t);
    osc1.frequency.setValueAtTime(900, t + 0.03);
    gain1.gain.setValueAtTime(0.3, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(t);
    osc1.stop(t + 0.06);

    // Click 2 (insert clip after delay)
    setTimeout(() => {
      if (!this.ctx || !this.sfxGain) return;
      const t2 = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(800, t2);
      osc2.frequency.setValueAtTime(1200, t2 + 0.04);
      gain2.gain.setValueAtTime(0.4, t2);
      gain2.gain.exponentialRampToValueAtTime(0.01, t2 + 0.08);
      osc2.connect(gain2);
      gain2.connect(this.sfxGain);
      osc2.start(t2);
      osc2.stop(t2 + 0.08);
    }, 280);
  }

  // Collect gold coin / ruby
  public playCoin() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.06); // E6

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  // Level up fanfare
  public playLevelUp() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.25);
      }, idx * 75);
    });
  }

  // Skill activation
  public playSkill() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.2);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  // UI Button Click
  public playClick() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(350, t + 0.04);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  // Jump / Roll
  public playJump() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.09);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  // Headshot high-impact critical crack & metallic ding
  public playHeadshot() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // 1. Sharp bullet crack snap
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(1400, t);
    snapOsc.frequency.exponentialRampToValueAtTime(180, t + 0.09);

    snapGain.gain.setValueAtTime(0.7, t);
    snapGain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
    snapOsc.connect(snapGain);
    snapGain.connect(this.sfxGain);
    snapOsc.start(t);
    snapOsc.stop(t + 0.09);

    // 2. Resonant metallic headshot bell/ding chime (satisfying headshot feedback)
    const bellOsc = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(2400, t);
    bellOsc.frequency.exponentialRampToValueAtTime(1800, t + 0.35);

    bellGain.gain.setValueAtTime(0.55, t);
    bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    bellOsc.connect(bellGain);
    bellGain.connect(this.sfxGain);
    bellOsc.start(t);
    bellOsc.stop(t + 0.35);

    // 3. Transient armor penetration noise
    this.playNoise(0.06, 0.45, 4500);
  }

  // Pet Audio SFX & Authentic Creature Attack Voices
  public playPetAttackVoice(species: string) {
    if (!this.soundEnabled) return;
    switch (species) {
      case 'dog':
        this.playPetDogBarkVoice();
        break;
      case 'cat':
        this.playPetCatMeowVoice();
        break;
      case 'wolf':
        this.playPetWolfHowlVoice();
        break;
      case 'falcon':
        this.playPetFalconScreechVoice();
        break;
      case 'panther':
        this.playPetPantherRoarVoice();
        break;
      case 'dragon':
        this.playPetDragonRoar();
        break;
      default:
        this.playPetDogBarkVoice();
        break;
    }
  }

  // Cyber Pup (Robo Dog) Bark / Yap Voice
  public playPetDogBarkVoice() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    
    // Quick energetic 2-stroke puppy bark ("Arf-Woof!")
    [0, 0.08].forEach((offset, idx) => {
      const startFreq = idx === 0 ? 680 : 540;
      const endFreq = idx === 0 ? 320 : 210;

      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(startFreq, t + offset);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + offset + 0.07);

      gain.gain.setValueAtTime(0.4, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + offset);
      osc.stop(t + offset + 0.07);
    });

    this.playNoise(0.05, 0.25, 1600);
  }

  // Mecha Kitty (Cyber Cat) Meow / Hiss Attack Voice
  public playPetCatMeowVoice() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Expressive feline frequency curve: rises then drops ("Mraaooww!")
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.linearRampToValueAtTime(1150, t + 0.09);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.22);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.22);

    // Cyber feline hiss transient
    this.playNoise(0.08, 0.2, 3800);
  }

  // Battle Hound / Combat Wolf Deep Roar / Howl
  public playPetWolfHowlVoice() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Deep resonant growl into ferocious lunge roar
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(360, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.3);

    gain.gain.setValueAtTime(0.42, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.3);

    this.playNoise(0.18, 0.35, 1200);
  }

  // Aero Falcon High Raptor Screech / Cry Voice
  public playPetFalconScreechVoice() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Piercing predatory raptor screech ("Skreeeech!")
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600, t);
    osc.frequency.linearRampToValueAtTime(2300, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.24);

    gain.gain.setValueAtTime(0.38, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.24);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.24);

    this.playNoise(0.09, 0.25, 4200);
  }

  // Void Panther Dark Matter Snarl / Growl Voice
  public playPetPantherRoarVoice() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Dark subterranean sub-bass snarl
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(260, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.32);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.32);

    this.playNoise(0.2, 0.38, 900);
  }

  public playPetBite() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playPetScratch() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  public playPetLaser() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.15);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playPetDragonRoar() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.4);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.4);
    this.playNoise(0.3, 0.35, 800);
  }

  public playPetUpgrade() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);
      gain.gain.setValueAtTime(0.25, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.07 + 0.16);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.16);
    });
  }

  // Noise generator helper for impacts/gun blast
  private playNoise(duration: number, volume: number, filterFreq: number = 2000) {
    if (!this.ctx || !this.sfxGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start();
  }

  // Synthesized Arcade Battle Background Music (dynamic bassline + arpeggios)
  public startBattleMusic() {
    if (!this.musicEnabled || this.isMusicPlaying) return;
    this.resume();
    if (!this.ctx || !this.musicGain) return;

    this.isMusicPlaying = true;
    let step = 0;
    const bassline = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83]; // A2, C3, D3, E3...
    const melody = [440, 523.25, 659.25, 587.33, 659.25, 783.99, 659.25, 523.25];

    this.musicInterval = setInterval(() => {
      if (!this.musicEnabled || !this.isMusicPlaying || !this.ctx || !this.musicGain) return;
      const t = this.ctx.currentTime;

      // Bass note
      const bassFreq = bassline[step % bassline.length];
      const bassOsc = this.ctx.createOscillator();
      const bassG = this.ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassFreq, t);
      bassG.gain.setValueAtTime(0.18, t);
      bassG.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
      bassOsc.connect(bassG);
      bassG.connect(this.musicGain);
      bassOsc.start(t);
      bassOsc.stop(t + 0.18);

      // Hi-hat / tick every other step
      if (step % 2 === 0) {
        this.playNoise(0.02, 0.05, 7000);
      }

      // Arpeggiated synth lead
      if (step % 4 === 2) {
        const leadFreq = melody[Math.floor(step / 2) % melody.length];
        const leadOsc = this.ctx.createOscillator();
        const leadG = this.ctx.createGain();
        leadOsc.type = 'triangle';
        leadOsc.frequency.setValueAtTime(leadFreq, t);
        leadG.gain.setValueAtTime(0.12, t);
        leadG.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
        leadOsc.connect(leadG);
        leadG.connect(this.musicGain);
        leadOsc.start(t);
        leadOsc.stop(t + 0.22);
      }

      step++;
    }, 175);
  }

  public playBeep() {
    if (!this.soundEnabled) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundManager = new SoundEngine();
