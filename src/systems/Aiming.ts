import Phaser from 'phaser';
import { Level } from './Level';

export class Aiming {
  private level: Level;

  constructor(level: Level) {
    this.level = level;
  }

  getTarget(targetPosition: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    const sigma = this.level.sigmaForLevel(this.level.currentLevel);
    const offsetX = Phaser.Math.RND.normal() * sigma;
    const offsetY = Phaser.Math.RND.normal() * sigma;
    return new Phaser.Math.Vector2(
      targetPosition.x + offsetX,
      targetPosition.y + offsetY,
    );
  }
}
