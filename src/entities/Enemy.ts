import Phaser from 'phaser';
import { Game } from '../scenes/Game';
import { Bullet } from './Bullet';
import { balance } from '../config/balance';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  private gameScene: Game;
  private fireTimer: Phaser.Time.TimerEvent;
  private wanderTimer: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy');
    this.gameScene = scene as Game;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body.setBounce(1, 1);

    this.fireTimer = this.scene.time.addEvent({
      delay: balance.enemyFirePeriod,
      callback: this.shoot,
      callbackScope: this,
      loop: true,
    });

    this.wanderTimer = this.scene.time.addEvent({
      delay: balance.enemyWanderIntervalMs,
      callback: this.wander,
      callbackScope: this,
      loop: true,
    });

    this.wander(); // Initial wander
  }

  wander() {
    const speed = Phaser.Math.Between(
      balance.enemyMoveSpeedMin,
      balance.enemyMoveSpeedMax,
    );
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  shoot() {
    const player = this.gameScene.getPlayer();
    if (!player.active) {
      return;
    }

    const bullet = new Bullet(this.scene, this.x, this.y);
    this.gameScene.getBullets().add(bullet);

    const target = this.gameScene.aiming.getTarget(
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

  update() {
    const ymax = this.scene.scale.height * balance.enemyTopZoneRatio;
    if (this.y > ymax) {
      this.y = ymax;
      this.body.setVelocityY(-Math.abs(this.body.velocity.y));
    }
    if (this.y < 32) {
      this.y = 32;
      this.body.setVelocityY(Math.abs(this.body.velocity.y));
    }
  }

  destroy(fromScene?: boolean) {
    this.fireTimer.destroy();
    this.wanderTimer.destroy();
    super.destroy(fromScene);
  }
}
