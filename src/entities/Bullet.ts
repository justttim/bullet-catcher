import Phaser from 'phaser';

import { balance } from '../config/balance';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  private bounces = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bullet');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCollideWorldBounds(true);
    this.body.onWorldBounds = true;
    this.body.setAllowGravity(false);
    this.body.setDrag(0, 0);
    this.body.setBounce(1, 1);

    this.body.world.on(
      'worldbounds',
      (body: Phaser.Physics.Arcade.Body) => {
        if (body.gameObject === this) {
          this.destroy();
        }
      },
      this,
    );
  }

  ricochet() {
    this.bounces++;
    if (
      balance.bulletRicochet.enabled &&
      this.bounces > balance.bulletRicochet.maxBounces
    ) {
      this.destroy();
    }
  }
}
