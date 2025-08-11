import Phaser from 'phaser';
import { Level } from './Level';
import { Enemy } from '../entities/Enemy';

export class Spawner {
  private scene: Phaser.Scene;
  private level: Level;
  private enemies: Phaser.Physics.Arcade.Group;

  constructor(
    scene: Phaser.Scene,
    level: Level,
    enemies: Phaser.Physics.Arcade.Group,
  ) {
    this.scene = scene;
    this.level = level;
    this.enemies = enemies;
  }

  spawnEnemies() {
    const numEnemies = this.level.enemiesForLevel(this.level.currentLevel);
    for (let i = 0; i < numEnemies; i++) {
      const x = Phaser.Math.Between(50, this.scene.scale.width - 50);
      const y = Phaser.Math.Between(50, 100);
      const enemy = new Enemy(this.scene, x, y);
      this.enemies.add(enemy);
    }
  }
}
