import Phaser from 'phaser';
import { balance } from '../config/balance';

export class Ally extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  public hp: number;
  public invUntil: number;
  public idx: number;

  private hpBar: Phaser.GameObjects.Graphics;
  private hpBarTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, idx: number) {
    super(scene, x, y, 'ally'); // Texture to be created in Game.ts
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.hp = balance.allyMaxHP;
    this.invUntil = 0;
    this.idx = idx;

    this.setTint(0x00ff00); // Greenish tint
    this.setCollideWorldBounds(true);
    this.body.setBounce(1, 1);

    this.hpBar = this.scene.add.graphics();
    this.hpBar.setVisible(false);
  }

  public follow(player: Phaser.GameObjects.Sprite, alliesCount: number) {
    const formationOffset =
      (this.idx - (alliesCount - 1) / 2) * balance.allySpacing;
    const targetX = player.x + formationOffset;
    const targetY = player.y + balance.allyOffsetY;

    this.x += (targetX - this.x) * balance.allyFollowLerp;
    this.y += (targetY - this.y) * balance.allyFollowLerp;
    this.body.setVelocity(0, 0);
  }

  public takeDamage() {
    if (this.scene.time.now < this.invUntil) {
      return;
    }

    this.hp--;
    this.invUntil = this.scene.time.now + balance.allyIFrameMs;

    this.showHpBar();

    if (this.hp <= 0) {
      this.destroy();
    }
  }

  private showHpBar() {
    this.hpBar.setVisible(true);
    this.updateHpBar();

    if (this.hpBarTimer) {
      this.hpBarTimer.remove();
    }
    this.hpBarTimer = this.scene.time.addEvent({
      delay: balance.allyShowHpMs,
      callback: () => {
        this.hpBar.setVisible(false);
      },
    });
  }

  private updateHpBar() {
    this.hpBar.clear();
    const width = 30;
    const height = 5;
    const x = this.x - width / 2;
    const y = this.y - this.height / 2 - height - 2;

    // Background
    this.hpBar.fillStyle(0x333333);
    this.hpBar.fillRect(x, y, width, height);

    // Health
    const healthPercentage = this.hp / balance.allyMaxHP;
    this.hpBar.fillStyle(healthPercentage > 0.5 ? 0x00ff00 : 0xff0000);
    this.hpBar.fillRect(x, y, width * healthPercentage, height);
  }

  update() {
    if (this.hpBar.visible) {
      this.updateHpBar();
    }
  }

  destroy(fromScene?: boolean): void {
    // Add flash/SFX later via AudioSystem event
    this.hpBar.destroy();
    if (this.hpBarTimer) {
      this.hpBarTimer.remove();
    }
    super.destroy(fromScene);
  }
}
