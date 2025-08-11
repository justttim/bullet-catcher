import Phaser from 'phaser';
import { Game } from '../scenes/Game';
import { Bullet } from './Bullet';
import { balance } from '../config/balance';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  body!: Phaser.Physics.Arcade.Body;
  private gameScene: Game;
  private fireTimer: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy');
    this.gameScene = scene as Game;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.fireTimer = this.scene.time.addEvent({
      delay: balance.enemyFirePeriod,
      callback: this.shoot,
      callbackScope: this,
      loop: true,
    });
  }

  shoot() {
    const player = this.gameScene.getPlayer();
    if (!player.active) {
      return;
    }

    const bullets = this.gameScene.getBullets();
    const bullet = new Bullet(this.scene, this.x, this.y);
    bullets.add(bullet);

    const target = this.gameScene['aiming'].getTarget(
      new Phaser.Math.Vector2(player.x, player.y),
    );
    const direction = target
      .subtract(new Phaser.Math.Vector2(this.x, this.y))
      .normalize();
    bullet.body.setVelocity(
      direction.x * balance.bulletSpeed,
      direction.y * balance.bulletSpeed,
    );
  }

  destroy(fromScene?: boolean) {
    this.fireTimer.destroy();
    super.destroy(fromScene);
  }
}
