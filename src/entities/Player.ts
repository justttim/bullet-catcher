import Phaser from 'phaser';
import { balance } from '../config/balance';

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
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
    this.setCollideWorldBounds(false);
    this.body.setBounce(0.2);

    this.wasd = {
      up: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    this.body.setVelocity(0);

    if (cursors.left.isDown || this.wasd.left.isDown) {
      this.body.setVelocityX(-balance.playerSpeed);
    } else if (cursors.right.isDown || this.wasd.right.isDown) {
      this.body.setVelocityX(balance.playerSpeed);
    }

    if (cursors.up.isDown || this.wasd.up.isDown) {
      this.body.setVelocityY(-balance.playerSpeed);
    } else if (cursors.down.isDown || this.wasd.down.isDown) {
      this.body.setVelocityY(balance.playerSpeed);
    }
  }
}
