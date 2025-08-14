import Phaser from 'phaser';
import { balance } from '../config/balance';

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  private lastDir = new Phaser.Math.Vector2(0, -1); // default: up
  private wasd: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.body.setBounce(0.2);

    this.wasd = {
      up: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    let vx = 0;
    let vy = 0;

    if (cursors.left.isDown || this.wasd.left.isDown) {
      vx = -balance.playerSpeed;
    } else if (cursors.right.isDown || this.wasd.right.isDown) {
      vx = balance.playerSpeed;
    }

    if (cursors.up.isDown || this.wasd.up.isDown) {
      vy = -balance.playerSpeed;
    } else if (cursors.down.isDown || this.wasd.down.isDown) {
      vy = balance.playerSpeed;
    }

    this.body.setVelocity(vx, vy);

    if (vx !== 0 || vy !== 0) {
      this.lastDir.set(vx, vy).normalize();
    }
  }

  getFacingAngle(): number {
    return Phaser.Math.Angle.Between(0, 0, this.lastDir.x, this.lastDir.y);
  }
}
