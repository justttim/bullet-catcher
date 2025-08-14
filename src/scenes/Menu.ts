import Phaser from 'phaser';
import { Game } from './Game';
import { balance } from '../config/balance';

// Utility functions for localStorage
function loadSetting<T>(key: string, defaultValue: T): T {
  const value = localStorage.getItem(key);
  if (value === null) {
    return defaultValue;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

function saveSetting<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save setting:', e);
  }
}

export class Menu extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  create(): void {
    this.applySettings();

    const { width, height } = this.scale;

    // Title
    this.add
      .text(width / 2, height / 4, 'BULLET CATCHER', {
        fontSize: '48px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Play button
    const playButton = this.add
      .text(width / 2, height / 2, '[ Play ]', {
        fontSize: '32px',
        color: '#00ff00',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    playButton.on('pointerdown', () => {
      this.scene.stop();
      const game = this.scene.get('game') as Game;
      if (!game.scene.isActive()) {
        this.scene.start('game', { fresh: true });
      } else {
        game.resetRun();
        game.scene.restart({ fresh: true });
      }
    });

    // Settings button
    const settingsButton = this.add
      .text(width / 2, height / 2 + 80, '[ Settings ]', {
        fontSize: '32px',
        color: '#ffff00',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    settingsButton.on('pointerdown', () => {
      this.showSettings();
    });

    // How to Play button
    const howToPlayButton = this.add
      .text(width / 2, height / 2 + 160, '[ How to Play ]', {
        fontSize: '32px',
        color: '#00ffff',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    howToPlayButton.on('pointerdown', () => {
      this.showHowToPlay();
    });
  }

  private applySettings(): void {
    balance.sfxEnabled = loadSetting('bc.sfxEnabled', true);
    balance.fxEnabled = loadSetting('bc.fxEnabled', true);
    balance.sfxVolume = loadSetting('bc.sfxVolume', 0.5);
  }

  private showSettings(): void {
    const { width, height } = this.scale;
    const panel = this.add.container(width / 2, height / 2);
    const background = this.add.graphics();
    background.fillStyle(0x000000, 0.9);
    background.fillRect(-width / 2, -height / 2, width, height);
    panel.add(background);

    const title = this.add
      .text(0, -150, 'Settings', { fontSize: '40px', color: '#ffffff' })
      .setOrigin(0.5);
    panel.add(title);

    // SFX Toggle
    const sfxText = this.add
      .text(-100, -50, `SFX: ${balance.sfxEnabled ? 'On' : 'Off'}`, {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setInteractive();
    sfxText.on('pointerdown', () => {
      balance.sfxEnabled = !balance.sfxEnabled;
      saveSetting('bc.sfxEnabled', balance.sfxEnabled);
      sfxText.setText(`SFX: ${balance.sfxEnabled ? 'On' : 'Off'}`);
    });
    panel.add(sfxText);

    // FX Toggle
    const fxText = this.add
      .text(-100, 0, `FX: ${balance.fxEnabled ? 'On' : 'Off'}`, {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setInteractive();
    fxText.on('pointerdown', () => {
      balance.fxEnabled = !balance.fxEnabled;
      saveSetting('bc.fxEnabled', balance.fxEnabled);
      fxText.setText(`FX: ${balance.fxEnabled ? 'On' : 'Off'}`);
    });
    panel.add(fxText);

    // Volume Slider
    const volumeLabel = this.add
      .text(-100, 50, 'Volume:', { fontSize: '24px', color: '#ffffff' })
      .setOrigin(0.5);
    panel.add(volumeLabel);

    const volumeValueText = this.add
      .text(150, 50, `${Math.round(balance.sfxVolume * 100)}%`, {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    panel.add(volumeValueText);

    const slider = this.add.graphics();
    slider.fillStyle(0x555555);
    slider.fillRect(-50, 40, 180, 20);
    const handle = this.add.graphics();
    handle.fillStyle(0xffffff);
    const updateHandle = () => {
      handle.clear();
      handle.fillStyle(0xffffff);
      handle.fillRect(-50 + 180 * balance.sfxVolume - 5, 35, 10, 30);
    };
    updateHandle();
    panel.add(slider);
    panel.add(handle);

    const sliderZone = this.add
      .zone(-50, 40, 180, 20)
      .setOrigin(0)
      .setInteractive();

    sliderZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const newVolume = Phaser.Math.Clamp(
        (pointer.x - (width / 2 - 50)) / 180,
        0,
        1,
      );
      balance.sfxVolume = newVolume;
      saveSetting('bc.sfxVolume', newVolume);
      volumeValueText.setText(`${Math.round(newVolume * 100)}%`);
      updateHandle();
    });
    sliderZone.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        const newVolume = Phaser.Math.Clamp(
          (pointer.x - (width / 2 - 50)) / 180,
          0,
          1,
        );
        balance.sfxVolume = newVolume;
        saveSetting('bc.sfxVolume', newVolume);
        volumeValueText.setText(`${Math.round(newVolume * 100)}%`);
        updateHandle();
      }
    });

    // Close button
    const closeButton = this.add
      .text(0, 150, '[ Close ]', { fontSize: '32px', color: '#ff0000' })
      .setOrigin(0.5)
      .setInteractive();

    closeButton.on('pointerdown', () => {
      panel.destroy();
    });
    panel.add(closeButton);

    this.input.keyboard!.once('keydown-ESC', () => {
      panel.destroy();
    });
  }

  private showHowToPlay(): void {
    const { width, height } = this.scale;
    const overlay = this.add.container(width / 2, height / 2);
    const background = this.add.graphics();
    background.fillStyle(0x000000, 0.9);
    background.fillRect(-width / 2, -height / 2, width, height);
    overlay.add(background);

    const text = `
    • Move: WASD / Arrows
    • Catch bullets to charge boost
    • Blast: directional 120° cone; allies can die in it
    • Levels: auto-advance when last enemy dies

    (Click or press ESC to close)
    `;

    const helpText = this.add
      .text(0, 0, text, {
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 10,
      })
      .setOrigin(0.5);
    overlay.add(helpText);

    const closeOverlay = () => {
      overlay.destroy();
      this.input.keyboard!.off('keydown-ESC', closeOverlay);
    };

    background.setInteractive();
    background.on('pointerdown', closeOverlay);
    this.input.keyboard!.once('keydown-ESC', closeOverlay);
  }
}
