import Phaser from 'phaser';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bullet');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setCollideWorldBounds(true);
    this.body.onWorldBounds = true;

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
}
