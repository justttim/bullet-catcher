import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { Level } from '../systems/Level';
import { Spawner } from '../systems/Spawner';
import { Boost } from '../systems/Boost';
import { Aiming } from '../systems/Aiming';
import { balance } from '../config/balance';

export class Game extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.GameObjects.Group;
  private bullets!: Phaser.GameObjects.Group;
  private level!: Level;
  private spawner!: Spawner;
  private boost!: Boost;
  private aiming!: Aiming;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private levelTimer!: Phaser.Time.TimerEvent;

  constructor() {
    super('game');
  }

  preload() {
    // Create placeholder graphics
    const playerGraphics = this.make.graphics({ x: 0, y: 0 }, false);
    playerGraphics.fillStyle(0xffffff);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    const enemyGraphics = this.make.graphics({ x: 0, y: 0 }, false);
    enemyGraphics.fillStyle(0xff0000);
    enemyGraphics.fillTriangle(0, 0, 32, 0, 16, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    const bulletGraphics = this.make.graphics({ x: 0, y: 0 }, false);
    bulletGraphics.fillStyle(0xffff00);
    bulletGraphics.fillCircle(8, 8, 8);
    bulletGraphics.generateTexture('bullet', 16, 16);
    bulletGraphics.destroy();
  }

  create() {
    this.level = new Level();
    this.aiming = new Aiming(this.level);
    this.boost = new Boost(this);

    this.player = new Player(this, 400, 500);
    this.cursors = this.input.keyboard!.createCursorKeys();

    this.enemies = this.add.group({
      classType: Enemy,
      runChildUpdate: true,
    });
    this.bullets = this.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });

    this.spawner = new Spawner(this, this.level, this.enemies);

    this.physics.add.overlap(
      this.player,
      this.bullets,
      this.handlePlayerBulletCollision,
      undefined,
      this,
    );

    this.startLevel();
  }

  update(_time: number, _delta: number) {
    this.player.update(this.cursors);
  }

  startLevel() {
    this.level.currentLevel++;
    this.events.emit('levelChanged', this.level.currentLevel);
    this.spawner.spawnEnemies();

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

  handlePlayerBulletCollision(
    _player: Phaser.GameObjects.GameObject,
    bullet: Phaser.GameObjects.GameObject,
  ) {
    bullet.destroy();
    this.boost.increaseBoost();
    this.events.emit('boostChanged', this.boost.getBoostValue());
  }

  getEnemies(): Phaser.GameObjects.Group {
    return this.enemies;
  }

  getBullets(): Phaser.GameObjects.Group {
    return this.bullets;
  }

  getPlayer(): Player {
    return this.player;
  }
}
