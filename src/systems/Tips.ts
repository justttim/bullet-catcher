import Phaser from 'phaser';
import { balance } from '../config/balance';
import { Game } from '../scenes/Game';

// Utility functions for localStorage, adapted from Menu.ts
function loadSetting<T>(key: string, defaultValue: T): T {
  const value = localStorage.getItem(key);
  if (value === null) {
    return defaultValue;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed = JSON.parse(value) as any;
    // Handle legacy boolean values that were not stored as JSON 'true'/'false'
    if (
      typeof defaultValue === 'boolean' &&
      (parsed === 'true' || parsed === 'false')
    ) {
      return JSON.parse(parsed);
    }
    return parsed as T;
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

export class TipSystem {
  private scene: Phaser.Scene;
  public enabled: boolean;
  private seen: Record<string, boolean>;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.enabled = loadSetting(
      'bc.tipsEnabled',
      balance.help.tipsEnabledDefault,
    );
    this.seen = loadSetting('bc.tipsSeen', {});
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    saveSetting('bc.tipsEnabled', on);
  }

  resetSeen(): void {
    this.seen = {};
    saveSetting('bc.tipsSeen', {});
  }

  markSeen(key: string): void {
    if (this.seen[key]) {
      return;
    }
    this.seen[key] = true;
    saveSetting('bc.tipsSeen', this.seen);
  }

  hasSeen(key: string): boolean {
    return !!this.seen[key];
  }

  maybeShow(key: string, text: string, opts?: { pause?: boolean }): void {
    if (!this.enabled || this.hasSeen(key)) {
      return;
    }

    const shouldPause = opts?.pause ?? balance.help.pauseOnTip;

    if (shouldPause) {
      this.showPausedOverlay(key, text);
    } else {
      this.showToast(key, text);
    }
  }

  private showPausedOverlay(key: string, text: string): void {
    const { width, height } = this.scene.scale;
    const overlay = this.scene.add.container(0, 0);
    overlay.setDepth(100); // Ensure it's on top of everything

    const background = this.scene.add.graphics();
    background.fillStyle(0x000000, 0.7);
    background.fillRect(0, 0, width, height);
    overlay.add(background);

    const panelWidth = width * 0.6;
    const panelHeight = height * 0.4;
    const panel = this.scene.add.graphics();
    panel.fillStyle(0x111111, 1);
    panel.fillRoundedRect(
      (width - panelWidth) / 2,
      (height - panelHeight) / 2,
      panelWidth,
      panelHeight,
      10,
    );
    overlay.add(panel);

    const tipText = this.scene.add
      .text(width / 2, height / 2 - 30, text, {
        fontSize: '20px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: panelWidth - 40 },
      })
      .setOrigin(0.5);
    overlay.add(tipText);

    const okButton = this.scene.add
      .text(width / 2, height / 2 + panelHeight / 2 - 40, '[ OK ]', {
        fontSize: '24px',
        color: '#00ff00',
        backgroundColor: '#333333',
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive();

    overlay.add(okButton);

    // Pause the game
    if (this.scene.scene.key === 'game') {
      const gameScene = this.scene as Game;
      gameScene.physics.pause();
      gameScene.time.paused = true;
    }

    const closeOverlay = () => {
      // Resume the game
      if (this.scene.scene.key === 'game') {
        const gameScene = this.scene as Game;
        gameScene.physics.resume();
        gameScene.time.paused = false;
      }

      this.markSeen(key);
      overlay.destroy();
      this.scene.input.keyboard?.off('keydown-ENTER', closeOverlay);
      this.scene.input.keyboard?.off('keydown-ESC', closeOverlay);
    };

    okButton.once('pointerdown', closeOverlay);
    this.scene.input.keyboard?.once('keydown-ENTER', closeOverlay);
    this.scene.input.keyboard?.once('keydown-ESC', closeOverlay);
  }

  private showToast(key: string, text: string): void {
    const { width } = this.scene.scale;
    const toastHeight = 50;
    const toast = this.scene.add.container(width / 2, -toastHeight);
    toast.setDepth(100);

    const background = this.scene.add.graphics();
    background.fillStyle(0x222222, 0.9);
    const toastWidth = width * 0.8;
    background.fillRoundedRect(-toastWidth / 2, 0, toastWidth, toastHeight, 10);
    toast.add(background);

    const toastText = this.scene.add
      .text(0, toastHeight / 2, text, {
        fontSize: '18px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);
    toast.add(toastText);

    this.scene.tweens.add({
      targets: toast,
      y: 20,
      duration: 300,
      ease: 'Quad.easeOut',
      yoyo: true,
      hold: 4000,
      onComplete: () => {
        toast.destroy();
        this.markSeen(key);
      },
    });
  }
}

export function createTips(scene: Phaser.Scene): TipSystem {
  return new TipSystem(scene);
}
