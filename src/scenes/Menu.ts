import Phaser from 'phaser';
import { Game } from './Game';
import { balance } from '../config/balance';
import { TipSystem, createTips } from '../systems/Tips';

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
  private tips!: TipSystem;

  constructor() {
    super('menu');
  }

  create(): void {
    this.tips = createTips(this);
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

    // Help button
    const helpButton = this.add
      .text(width / 2, height / 2 + 160, '[ Help ]', {
        fontSize: '32px',
        color: '#00ffff',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    helpButton.on('pointerdown', () => {
      this.showHelp();
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

  private showHelp(): void {
    const { width, height } = this.scale;
    const overlay = this.add.container(width / 2, height / 2).setDepth(100);
    const background = this.add.graphics();
    background.fillStyle(0x000000, 0.9);
    background.fillRect(-width / 2, -height / 2, width, height);
    overlay.add(background);

    const helpTitle = this.add
      .text(0, -height / 2 + 40, 'Help', {
        fontSize: '40px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    overlay.add(helpTitle);

    const helpTextContent = `
• Controls: Move: WASD/Arrows. Aim: last movement direction. Catch bullets to charge boost.
• Boost & Blast: Catch bullets → fill boost bar; at full — directional 120° cone blast that can kill allies in the cone.
• Allies: From L2. Protect them; Game Over if all allies die.
• Walls & wrap: From L10 borders with random gaps. You can wrap through gaps to the opposite side.
• Obstacles: From L20 random blocks that stop movement. Enemy bullets can ricochet from walls/obstacles.
• Level flow: Level advances right after the last enemy dies.
    `;

    const helpText = this.add
      .text(0, -height / 2 + 150, helpTextContent, {
        fontSize: '18px',
        color: '#ffffff',
        align: 'left',
        lineSpacing: 8,
        wordWrap: { width: width * 0.8 - 40 },
      })
      .setOrigin(0.5, 0);
    overlay.add(helpText);

    // Toggle for tips
    const tipsToggleText = this.add
      .text(0, height / 2 - 120, `[ ] Show tips during play`, {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setInteractive();

    const updateToggle = () => {
      tipsToggleText.setText(
        `[${this.tips.enabled ? 'X' : ' '}] Show tips during play`,
      );
    };
    updateToggle();

    tipsToggleText.on('pointerdown', () => {
      this.tips.setEnabled(!this.tips.enabled);
      updateToggle();
    });
    overlay.add(tipsToggleText);

    // Reset tips button
    const resetTipsButton = this.add
      .text(0, height / 2 - 70, '[ Reset tutorial tips ]', {
        fontSize: '24px',
        color: '#ffff00',
      })
      .setOrigin(0.5)
      .setInteractive();

    resetTipsButton.on('pointerdown', () => {
      this.tips.resetSeen();
      // Optional: show a confirmation
      const confirmation = this.add
        .text(0, height / 2 - 40, 'Tutorial tips have been reset.', {
          fontSize: '16px',
          color: '#00ff00',
          fontStyle: 'italic',
        })
        .setOrigin(0.5);
      overlay.add(confirmation);
      this.time.delayedCall(2000, () => confirmation.destroy());
    });
    overlay.add(resetTipsButton);

    // Close button
    const closeButton = this.add
      .text(0, height / 2 - 20, '[ Close ]', {
        fontSize: '32px',
        color: '#ff0000',
      })
      .setOrigin(0.5)
      .setInteractive();

    const closeOverlay = () => {
      overlay.destroy();
      this.input.keyboard?.off('keydown-ESC', closeOverlay);
    };

    closeButton.on('pointerdown', closeOverlay);
    this.input.keyboard?.once('keydown-ESC', closeOverlay);
    background.setInteractive();
    background.on('pointerdown', closeOverlay);
  }
}
