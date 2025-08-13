import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { Ally } from '../entities/Ally';
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
  private allies!: Phaser.Physics.Arcade.Group;
  private spawner!: Spawner;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('game');
  }

  preload() {
    // Player
    const playerGraphics = this.make.graphics({ x: 0, y: 0 });
    playerGraphics.fillStyle(0xffffff);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // Enemy
    const enemyGraphics = this.make.graphics({ x: 0, y: 0 });
    enemyGraphics.fillStyle(0xff0000);
    enemyGraphics.fillTriangle(0, 0, 32, 0, 16, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // Bullet
    const bulletGraphics = this.make.graphics({ x: 0, y: 0 });
    bulletGraphics.fillStyle(0xffff00);
    bulletGraphics.fillCircle(8, 8, 8);
    bulletGraphics.generateTexture('bullet', 16, 16);
    bulletGraphics.destroy();

    // Ally
    const allyGraphics = this.make.graphics({ x: 0, y: 0 });
    allyGraphics.fillStyle(0x00ff00);
    allyGraphics.fillCircle(12, 12, 12);
    allyGraphics.generateTexture('ally', 24, 24);
    allyGraphics.destroy();
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
    this.allies = this.physics.add.group();

    this.spawner = new Spawner(this, this.level, this.enemies);

    this.physics.add.overlap(
      this.player,
      this.bullets,
      this.onBulletHitPlayer,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.allies,
      this.bullets,
      this.onBulletHitAlly,
      undefined,
      this,
    );

    this.startLevel();
  }

  update(_time: number, _delta: number) {
    this.player.update(this.cursors);
    this.enemies.getChildren().forEach((enemy) => (enemy as Enemy).update());
    this.allies.getChildren().forEach((ally) => (ally as Ally).update());
    this.allies
      .getChildren()
      .forEach((ally, _i) =>
        (ally as Ally).follow(this.player, this.allies.getLength()),
      );
  }

  startLevel() {
    if (this.level.currentLevel > 0) {
      this.audioSystem.play('LEVEL_UP');
    }
    this.level.currentLevel++;
    this.events.emit('levelChanged', this.level.currentLevel);
    this.spawner.spawnEnemies();
    this.updateAllies();

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

  updateAllies() {
    const { allyEnabled, allyStartLevel, allyAddEveryNLevels, allyMaxCount } =
      balance;
    const targetAllyCount =
      !allyEnabled || this.level.currentLevel < allyStartLevel
        ? 0
        : Math.min(
            allyMaxCount,
            1 +
              Math.floor(
                (this.level.currentLevel - allyStartLevel) /
                  allyAddEveryNLevels,
              ),
          );

    // Add or remove allies to match the target count
    const currentAllyCount = this.allies.getLength();
    if (targetAllyCount > currentAllyCount) {
      for (let i = currentAllyCount; i < targetAllyCount; i++) {
        const newAlly = new Ally(this, this.player.x, this.player.y + 60, i);
        this.allies.add(newAlly);
      }
    } else if (targetAllyCount < currentAllyCount) {
      this.allies
        .getChildren()
        .slice(targetAllyCount)
        .forEach((ally) => ally.destroy());
    }

    // Update ally indices
    this.allies.getChildren().forEach((ally, i) => ((ally as Ally).idx = i));
  }

  endLevel() {
    this.enemies.clear(true, true);
    this.bullets.clear(true, true);
    this.startLevel();
  }

  private onBulletHitPlayer: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback =
    (_playerGO, bulletGO): void => {
      const bullet = bulletGO as Bullet;

      // Check for ally save bonus
      let savedByAlly = false;
      for (const ally of this.allies.getChildren() as Ally[]) {
        if (
          Phaser.Math.Distance.Between(bullet.x, bullet.y, ally.x, ally.y) <=
          balance.allySaveRadius
        ) {
          savedByAlly = true;
          break;
        }
      }

      bullet.destroy();
      this.boost.increaseBoost(savedByAlly);
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

  private onBulletHitAlly: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    allyGO,
    bulletGO,
  ): void => {
    const ally = allyGO as Ally;
    const bullet = bulletGO as Bullet;
    bullet.destroy();
    ally.takeDamage();
  };

  getEnemies(): Phaser.Physics.Arcade.Group {
    return this.enemies;
  }

  getBullets(): Phaser.Physics.Arcade.Group {
    return this.bullets;
  }

  getAllies(): Phaser.Physics.Arcade.Group {
    return this.allies;
  }

  getPlayer(): Player {
    return this.player;
  }
}
