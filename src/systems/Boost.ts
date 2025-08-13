import Phaser from 'phaser';
import { balance } from '../config/balance';
import { Game } from '../scenes/Game';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { AudioSystem } from './Audio';

export class Boost {
  private gameScene: Game;
  private audioSystem: AudioSystem;
  private boostValue: number;

  constructor(scene: Phaser.Scene, audioSystem: AudioSystem) {
    this.gameScene = scene as Game;
    this.audioSystem = audioSystem;
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
    this.audioSystem.play('BLAST');

    if (balance.fxEnabled) {
      this.gameScene.cameras.main.flash(100, 255, 255, 255);
      this.gameScene.cameras.main.shake(150, 0.01);
    }

    const player = this.gameScene.getPlayer();

    // Visual effect for the blast
    const blastGraphics = this.gameScene.add.graphics();
    blastGraphics.fillStyle(0xffffff, 0.7);
    const blastArcRad = Phaser.Math.DegToRad(balance.blastArc);
    blastGraphics.slice(
      player.x,
      player.y,
      balance.blastRadius,
      this.gameScene.getAimAngle() - blastArcRad / 2,
      this.gameScene.getAimAngle() + blastArcRad / 2,
    );
    this.gameScene.tweens.add({
      targets: blastGraphics,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        blastGraphics.destroy();
      },
    });

    // Affect enemies
    this.gameScene
      .getEnemies()
      .getChildren()
      .forEach((enemyGO) => {
        const enemy = enemyGO as Enemy;
        if (this.gameScene.isTargetInCone(enemy)) {
          enemy.destroy();
        }
      });

    // Affect bullets
    this.gameScene
      .getBullets()
      .getChildren()
      .forEach((bulletGO) => {
        const bullet = bulletGO as Bullet;
        if (this.gameScene.isTargetInCone(bullet)) {
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

    // Affect allies
    if (this.gameScene.alliesFeatureActive()) {
      this.gameScene
        .getAllies()
        .getChildren()
        .forEach((allyGO) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ally = allyGO as any; // Type assertion to the Ally class defined in Game.ts
          if (this.gameScene.isTargetInCone(ally)) {
            ally.kill();
          }
        });
    }
  }

  getBoostValue(): number {
    return this.boostValue;
  }
}
