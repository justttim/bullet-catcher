import Phaser from 'phaser';
import { balance } from '../config/balance';
import { Game } from '../scenes/Game';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';

export class Boost {
  private gameScene: Game;
  private boostValue: number;

  constructor(scene: Phaser.Scene) {
    this.gameScene = scene as Game;
    this.boostValue = 0;
  }

  increaseBoost() {
    this.boostValue = Math.min(1, this.boostValue + balance.boostPerBullet);
    this.gameScene.events.emit('boostChanged', this.getBoostValue());

    if (this.boostValue >= 1) {
      this.triggerBlast();
      this.boostValue = 0;
      this.gameScene.events.emit('boostChanged', this.getBoostValue());
    }
  }

  triggerBlast() {
    const player = this.gameScene.getPlayer();
    const blastRadius = balance.blastRadius;

    // Visual effect for the blast
    const blastCircle = this.gameScene.add.circle(
      player.x,
      player.y,
      blastRadius,
      0xffffff,
      0.5,
    );
    this.gameScene.tweens.add({
      targets: blastCircle,
      radius: blastRadius * 1.5,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        blastCircle.destroy();
      },
    });

    // Affect enemies
    this.gameScene
      .getEnemies()
      .getChildren()
      .forEach((enemyGO) => {
        const enemy = enemyGO as Enemy;
        if (
          Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y) <=
          blastRadius
        ) {
          enemy.destroy();
        }
      });

    // Affect bullets
    this.gameScene
      .getBullets()
      .getChildren()
      .forEach((bulletGO) => {
        const bullet = bulletGO as Bullet;
        if (
          Phaser.Math.Distance.Between(
            player.x,
            player.y,
            bullet.x,
            bullet.y,
          ) <= blastRadius
        ) {
          const knockbackVector = new Phaser.Math.Vector2(
            bullet.x - player.x,
            bullet.y - player.y,
          ).normalize();
          bullet.body.setVelocity(
            knockbackVector.x * balance.blastKnockback,
            knockbackVector.y * balance.blastKnockback,
          );
        }
      });
  }

  getBoostValue(): number {
    return this.boostValue;
  }
}
