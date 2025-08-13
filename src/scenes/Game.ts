import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { Level } from '../systems/Level';
import { Spawner } from '../systems/Spawner';
import { Boost } from '../systems/Boost';
import { Aiming } from '../systems/Aiming';
import { AudioSystem } from '../systems/Audio';
import { balance } from '../config/balance';

export class Game extends Phaser.Scene {
  player!: Player;
  level!: Level;
  aiming!: Aiming;
  boost!: Boost;
  audioSystem!: AudioSystem;
  levelTimer!: Phaser.Time.TimerEvent;

  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private spawner!: Spawner;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('game');
  }

  preload() {
    const playerGraphics = this.make.graphics({ x: 0, y: 0 });
    playerGraphics.fillStyle(0xffffff);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    const enemyGraphics = this.make.graphics({ x: 0, y: 0 });
    enemyGraphics.fillStyle(0xff0000);
    enemyGraphics.fillTriangle(0, 0, 32, 0, 16, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    const bulletGraphics = this.make.graphics({ x: 0, y: 0 });
    bulletGraphics.fillStyle(0xffff00);
    bulletGraphics.fillCircle(8, 8, 8);
    bulletGraphics.generateTexture('bullet', 16, 16);
    bulletGraphics.destroy();
  }

  create(): void {
    this.level = new Level();
    this.aiming = new Aiming(this.level);
    this.audioSystem = new AudioSystem(this);
    this.boost = new Boost(this, this.audioSystem);

    this.player = new Player(this, 400, 500);
    this.cursors = this.input.keyboard!.createCursorKeys();

    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group();

    this.spawner = new Spawner(this, this.level, this.enemies);

    this.physics.add.overlap(
      this.player,
      this.bullets,
      this.onBulletHitPlayer,
      undefined,
      this,
    );

    this.startLevel();
  }

  update(_time: number, _delta: number) {
    this.player.update(this.cursors);
    this.enemies.getChildren().forEach((enemy) => (enemy as Enemy).update());
  }

  startLevel() {
    if (this.level.currentLevel > 0) {
      this.audioSystem.play('LEVEL_UP');
    }
    this.level.currentLevel++;
    this.events.emit('levelChanged', this.level.currentLevel);
    this.spawner.spawnEnemies();

    if (this.levelTimer) {
      this.levelTimer.destroy();
    }
    this.levelTimer = this.time.addEvent({
      delay: balance.levelTimeSec * 1000,
      callback: this.endLevel,
      callbackScope: this,
    });

    this.events.emit('timerChanged', balance.levelTimeSec);
  }

  endLevel() {
    this.enemies.clear(true, true);
    this.bullets.clear(true, true);
    this.startLevel();
  }

  private onBulletHitPlayer: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback =
    (_playerGO, bulletGO): void => {
      const bullet = bulletGO as Bullet;
      bullet.destroy();
      this.boost.increaseBoost();
      this.audioSystem.play('BULLET_CATCH');

      if (balance.fxEnabled) {
        this.tweens.add({
          targets: this.player,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 50,
          yoyo: true,
          ease: 'Quad.easeInOut',
        });
      }
    };

  getEnemies(): Phaser.Physics.Arcade.Group {
    return this.enemies;
  }

  getBullets(): Phaser.Physics.Arcade.Group {
    return this.bullets;
  }

  getPlayer(): Player {
    return this.player;
  }
}
