// Enhanced sound system using Web Audio API
class SoundSystem {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.3;
    this.musicVolume = 0.2;
    this.sfxVolume = 0.3;
    this.musicEnabled = true;
    this.currentMusic = null;
    this.musicGainNode = null;
    this.backgroundMusicAudio = null;
    this.initAudioContext();
    this.loadBackgroundMusic();
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.musicGainNode = this.audioContext.createGain();
      this.musicGainNode.connect(this.audioContext.destination);
      this.musicGainNode.gain.value = this.musicVolume;
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  loadBackgroundMusic() {
    // Load the MP3 file
    this.backgroundMusicAudio = new Audio('Mike Leite Summer Vibes.mp3');
    this.backgroundMusicAudio.loop = true;
    this.backgroundMusicAudio.volume = this.musicVolume;
    
    // Preload
    this.backgroundMusicAudio.load();
  }

  // Resume audio context (required for user interaction)
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Toggle all sounds
  toggleMute() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopMusic();
    }
  }

  // Toggle music only
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) {
      this.stopMusic();
    } else if (this.enabled) {
      this.resumeMusic();
    }
    return this.musicEnabled;
  }

  // Check if muted
  get isMuted() {
    return !this.enabled;
  }

  // Play a tone with specific frequency and duration
  playTone(frequency, duration, type = 'sine', volume = null) {
    if (!this.enabled || !this.audioContext) return;

    this.resume();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    const vol = volume !== null ? volume : this.sfxVolume;
    gainNode.gain.setValueAtTime(vol, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Play multiple tones (chord)
  playChord(frequencies, duration, type = 'sine') {
    frequencies.forEach(freq => this.playTone(freq, duration, type));
  }

  // Play arpeggio (notes in sequence)
  playArpeggio(frequencies, noteLength, type = 'sine') {
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, noteLength, type), i * noteLength * 1000);
    });
  }

  // Sound effects
  playSelect() {
    this.playTone(440, 0.1, 'sine');
  }

  playMove() {
    // Swoosh sound
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.15);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.15);
  }

  playMatch() {
    // Sparkle sound
    this.playChord([523, 659, 784], 0.2, 'sine');
    setTimeout(() => {
      this.playTone(1047, 0.15, 'sine', this.sfxVolume * 0.5);
    }, 100);
  }

  playSpecialCreate() {
    // Ascending arpeggio with echo
    const notes = [523, 659, 784, 1047];
    notes.forEach((note, i) => {
      setTimeout(() => {
        this.playTone(note, 0.12, 'triangle');
        setTimeout(() => {
          this.playTone(note, 0.08, 'sine', this.sfxVolume * 0.3);
        }, 50);
      }, i * 60);
    });
  }

  playExplosion() {
    // Enhanced explosion with bass
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    // Bass thump
    const bass = this.audioContext.createOscillator();
    const bassGain = this.audioContext.createGain();
    bass.connect(bassGain);
    bassGain.connect(this.audioContext.destination);
    
    bass.frequency.setValueAtTime(80, this.audioContext.currentTime);
    bass.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.2);
    bass.type = 'sine';
    
    bassGain.gain.setValueAtTime(this.sfxVolume * 0.8, this.audioContext.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    bass.start();
    bass.stop(this.audioContext.currentTime + 0.2);

    // White noise burst
    const bufferSize = this.audioContext.sampleRate * 0.15;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 5);
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    noise.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.setValueAtTime(this.sfxVolume * 0.4, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

    noise.start();
  }

  playRowBomb() {
    // Horizontal laser sweep
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.25);
    osc.type = 'sawtooth';

    gain.gain.setValueAtTime(this.sfxVolume * 0.6, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.25);
    
    // Add echo
    setTimeout(() => {
      this.playTone(600, 0.1, 'sine', this.sfxVolume * 0.3);
    }, 150);
  }

  playColumnBomb() {
    // Vertical laser sweep
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.setValueAtTime(1200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.25);
    osc.type = 'sawtooth';

    gain.gain.setValueAtTime(this.sfxVolume * 0.6, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.25);
    
    // Add echo
    setTimeout(() => {
      this.playTone(300, 0.1, 'sine', this.sfxVolume * 0.3);
    }, 150);
  }

  playAreaBomb() {
    // Powerful explosion with rumble
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    // Deep bass rumble
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.setValueAtTime(120, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.4);
    osc.type = 'sine';

    gain.gain.setValueAtTime(this.sfxVolume * 1.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.4);
    
    // Add high frequency crack
    setTimeout(() => {
      this.playTone(2000, 0.08, 'square', this.sfxVolume * 0.4);
    }, 50);
  }

  playColorBomb() {
    // Rainbow cascade with sparkles
    const notes = [262, 330, 392, 523, 659, 784, 988, 1175];
    notes.forEach((note, i) => {
      setTimeout(() => {
        this.playTone(note, 0.12, 'sine');
        this.playTone(note * 2, 0.08, 'sine', this.sfxVolume * 0.3);
      }, i * 35);
    });
  }

  playCombo(level) {
    // Escalating combo sound
    const baseFreq = 523;
    const freq = baseFreq * (1 + level * 0.15);
    
    // Main chord
    this.playChord([freq, freq * 1.25, freq * 1.5], 0.25, 'triangle');
    
    // High sparkle
    setTimeout(() => {
      this.playTone(freq * 2, 0.15, 'sine', this.sfxVolume * 0.5);
    }, 100);
    
    // Echo
    setTimeout(() => {
      this.playChord([freq * 0.75, freq, freq * 1.25], 0.2, 'sine');
    }, 150);
  }

  playSpawn() {
    // Pop sound
    this.playTone(440, 0.08, 'sine');
    setTimeout(() => {
      this.playTone(550, 0.06, 'sine', this.sfxVolume * 0.5);
    }, 40);
  }

  playGameOver() {
    const notes = [523, 494, 440, 392];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.3, 'sine'), i * 200);
    });
  }

  playError() {
    // Buzzer sound
    this.playTone(150, 0.2, 'square', this.sfxVolume * 0.5);
  }

  playLevelComplete() {
    // Victory fanfare
    const melody = [523, 659, 784, 1047, 1319];
    melody.forEach((note, i) => {
      setTimeout(() => {
        this.playTone(note, 0.15, 'sine');
        this.playTone(note * 1.5, 0.15, 'sine', this.sfxVolume * 0.5);
      }, i * 100);
    });
  }

  // ===== BACKGROUND MUSIC =====
  
  playBackgroundMusic(level = 1) {
    if (!this.enabled || !this.musicEnabled) return;
    
    this.stopMusic();
    this.resume();
    
    // Play the MP3 file
    if (this.backgroundMusicAudio) {
      this.backgroundMusicAudio.volume = this.musicVolume;
      this.backgroundMusicAudio.currentTime = 0;
      
      const playPromise = this.backgroundMusicAudio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Music started playing');
        }).catch(error => {
          console.log('Music playback prevented:', error);
        });
      }
    }
  }

  stopMusic() {
    // Stop MP3 music
    if (this.backgroundMusicAudio && !this.backgroundMusicAudio.paused) {
      this.backgroundMusicAudio.pause();
    }
    
    // Stop procedural music (if any)
    if (this.currentMusic) {
      this.currentMusic.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Already stopped
        }
      });
      this.currentMusic = null;
    }
  }

  // Resume music (don't reset to beginning)
  resumeMusic() {
    if (!this.enabled || !this.musicEnabled) return;
    
    if (this.backgroundMusicAudio && this.backgroundMusicAudio.paused) {
      const playPromise = this.backgroundMusicAudio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Music resumed');
        }).catch(error => {
          console.log('Music resume prevented:', error);
        });
      }
    }
  }

  // Play level transition music
  playLevelTransition(newLevel) {
    // Don't stop music on level transition, just play the completion sound
    this.playLevelComplete();
    // Music continues playing
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.sfxVolume = this.volume;
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = this.musicVolume;
    }
    if (this.backgroundMusicAudio) {
      this.backgroundMusicAudio.volume = this.musicVolume;
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopMusic();
    }
    return this.enabled;
  }

  mute() {
    this.enabled = false;
    this.stopMusic();
  }

  unmute() {
    this.enabled = true;
    if (this.musicEnabled) {
      this.resumeMusic();
    }
  }
}

// Create global sound system instance
const soundSystem = new SoundSystem();
