import Phaser from 'phaser';
import { Game } from './Game';

export class UI extends Phaser.Scene {
  private gameScene!: Game;
  private levelText!: Phaser.GameObjects.Text;
  private enemiesText!: Phaser.GameObjects.Text;
  private boostBarBg!: Phaser.GameObjects.Graphics;
  private boostBarFill!: Phaser.GameObjects.Graphics;
  private boostText!: Phaser.GameObjects.Text;

  private currentBoostWidth = 0;
  private boostTween: Phaser.Tweens.Tween | null = null;

  constructor() {
    super({ key: 'ui' });
  }

  create() {
    this.gameScene = this.scene.get('game') as Game;

    // Level Text
    this.levelText = this.add
      .text(
        this.scale.width - 10,
        10,
        `Level: ${this.gameScene.level.currentLevel}`,
        {
          fontSize: '24px',
          color: '#ffffff',
        },
      )
      .setOrigin(1, 0);

    // Timer Text
    this.enemiesText = this.add
      .text(this.scale.width - 10, 40, 'Enemies: 0', {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(1, 0);

    // Boost Bar
    this.boostBarBg = this.add.graphics();
    this.boostBarBg.fillStyle(0x333333);
    this.boostBarBg.fillRect(10, 10, 200, 30);

    this.boostBarFill = this.add.graphics();

    this.boostText = this.add
      .text(110, 25, '0%', {
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Event Listeners
    this.gameScene.events.on('levelChanged', (level: number) => {
      this.levelText.setText(`Level: ${level}`);
    });

    this.gameScene.events.on('enemiesChanged', (count: number) => {
      this.enemiesText.setText(`Enemies: ${count}`);
    });

    this.gameScene.events.on('boostChanged', (boostValue: number) => {
      const targetWidth = 200 * boostValue;

      if (this.boostTween) {
        this.boostTween.stop();
      }

      this.boostTween = this.tweens.add({
        targets: { value: this.currentBoostWidth },
        value: targetWidth,
        duration: 100,
        ease: 'Linear',
        onUpdate: (tween) => {
          this.currentBoostWidth = tween.getValue() ?? 0;
          this.boostBarFill.clear();
          this.boostBarFill.fillStyle(0x00ff00);
          this.boostBarFill.fillRect(10, 10, this.currentBoostWidth, 30);
        },
      });

      this.boostText.setText(`${Math.round(boostValue * 100)}%`);
    });
  }
}
