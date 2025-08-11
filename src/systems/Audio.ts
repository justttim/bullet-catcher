import Phaser from 'phaser';
import { balance } from '../config/balance';

type SoundEvent = 'BULLET_CATCH' | 'BLAST' | 'LEVEL_UP';

export class AudioSystem {
  private scene: Phaser.Scene;
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundEvent, Phaser.Sound.BaseSound> = new Map();
  private loadedSounds: Set<SoundEvent> = new Set();

  private soundFiles: Record<SoundEvent, string> = {
    BULLET_CATCH: 'sfx/bullet_catch.wav',
    BLAST: 'sfx/blast.wav',
    LEVEL_UP: 'sfx/level_up.wav',
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.init();
  }

  private init() {
    const soundManager = this.scene.game.sound;
    if (!(soundManager instanceof Phaser.Sound.WebAudioSoundManager)) {
      console.warn('WebAudio not supported. Audio system disabled.');
      return;
    }
    this.audioContext = soundManager.context;

    // Unlock audio on first user gesture
    this.scene.input.once('pointerdown', () => {
      if (this.audioContext?.state === 'suspended') {
        this.audioContext.resume();
      }
    });

    // Load sounds
    Object.entries(this.soundFiles).forEach(([key, path]) => {
      this.scene.load.audio(key, path);
    });

    // Handle loading errors
    this.scene.load.on(
      'fileerror',
      (file: Phaser.Loader.File) => {
        console.warn(`Failed to load audio: ${file.key}`);
      },
      this,
    );

    this.scene.load.on(
      'complete',
      () => {
        Object.keys(this.soundFiles).forEach((key) => {
          const soundKey = key as SoundEvent;
          if (this.scene.cache.audio.has(soundKey)) {
            this.sounds.set(soundKey, this.scene.sound.add(soundKey));
            this.loadedSounds.add(soundKey);
          }
        });
      },
      this,
    );
  }

  public play(event: SoundEvent) {
    if (!balance.sfxEnabled || !this.audioContext) {
      return;
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    if (this.loadedSounds.has(event)) {
      this.sounds.get(event)?.play({ volume: balance.sfxVolume });
    } else {
      this.playFallback(event);
    }
  }

  private playFallback(event: SoundEvent) {
    if (!this.audioContext) return;

    switch (event) {
      case 'BULLET_CATCH':
        this.playTone(880, 0.08);
        break;
      case 'BLAST':
        this.playTone(160, 0.2);
        break;
      case 'LEVEL_UP':
        this.playArpeggio([440, 554, 659], 0.1);
        break;
    }
  }

  private playTone(frequency: number, duration: number) {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);

    gainNode.gain.setValueAtTime(balance.sfxVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  private playArpeggio(frequencies: number[], durationPerNote: number) {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;

    frequencies.forEach((freq, index) => {
      const startTime = now + index * durationPerNote;
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(balance.sfxVolume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        startTime + durationPerNote,
      );

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + durationPerNote);
    });
  }
}
