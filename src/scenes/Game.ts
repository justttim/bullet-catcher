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

class Ally extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Game, x: number, y: number) {
    super(scene, x, y, 'ally');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
  }

  kill() {
    (this.scene as Game).decrementAllies();
    this.destroy();
  }
}

export class Game extends Phaser.Scene {
  player!: Player;
  level!: Level;
  aiming!: Aiming;
  boost!: Boost;
  audioSystem!: AudioSystem;

  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private allies!: Phaser.Physics.Arcade.Group;
  private spawner!: Spawner;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private isGameOver = false;
  private alliesAlive = 0;
  private enemiesAlive = 0;
  private aimAngle = 0;
  private telegraphCone?: Phaser.GameObjects.Graphics;

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

    const allyGraphics = this.make.graphics({ x: 0, y: 0 });
    allyGraphics.fillStyle(0x00ff00);
    allyGraphics.fillRect(0, 0, 24, 24);
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

    this.startLevel();
  }

  update(_time: number, _delta: number) {
    if (this.isGameOver) {
      return;
    }
    this.player.update(this.cursors);
    this.enemies.getChildren().forEach((enemy) => (enemy as Enemy).update());

    this.aimAngle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      this.input.activePointer.worldX,
      this.input.activePointer.worldY,
    );

    // Telegraph logic
    const boostValue = this.boost.getBoostValue();
    if (boostValue >= balance.boostTelegraphThreshold) {
      if (!this.telegraphCone) {
        this.telegraphCone = this.add.graphics();
      }
      this.telegraphCone.clear();

      let allyInDanger = false;
      if (this.alliesFeatureActive()) {
        this.getAllies()
          .getChildren()
          .forEach((ally) => {
            if (this.isTargetInCone(ally as Phaser.Physics.Arcade.Sprite)) {
              allyInDanger = true;
            }
          });
      }

      const color = allyInDanger ? 0xff0000 : 0xffffff;
      this.telegraphCone.fillStyle(color, 0.3);

      const blastArcRad = Phaser.Math.DegToRad(balance.blastArc);
      this.telegraphCone.slice(
        this.player.x,
        this.player.y,
        balance.blastRadius,
        this.aimAngle - blastArcRad / 2,
        this.aimAngle + blastArcRad / 2,
      );
    } else {
      if (this.telegraphCone) {
        this.telegraphCone.destroy();
        this.telegraphCone = undefined;
      }
    }
  }

  isTargetInCone(target: Phaser.GameObjects.Sprite): boolean {
    const toT = new Phaser.Math.Vector2(
      target.x - this.player.x,
      target.y - this.player.y,
    );
    if (toT.length() > balance.blastRadius) return false;
    const angleToTarget = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      target.x,
      target.y,
    ); // radians
    const delta = Phaser.Math.Angle.Wrap(angleToTarget - this.aimAngle); // radians
    const halfArc = Phaser.Math.DegToRad(balance.blastArc) / 2;
    return Math.abs(delta) <= halfArc;
  }

  alliesFeatureActive() {
    return (
      balance.allyEnabled && this.level.currentLevel >= balance.allyStartLevel
    );
  }

  decrementAllies() {
    this.alliesAlive--;
    this.maybeCheckGameOver();
  }

  maybeCheckGameOver() {
    if (this.alliesFeatureActive() && this.alliesAlive <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    this.isGameOver = true;
    this.physics.pause();

    const gameOverText = this.add
      .text(400, 300, 'No allies left - Game Over', {
        fontSize: '32px',
        color: '#ff0000',
      })
      .setOrigin(0.5);

    this.time.delayedCall(1000, () => {
      gameOverText.setText('Press any key to restart');
      this.input.keyboard!.once('keydown', () => {
        this.level.currentLevel = 0;
        this.isGameOver = false;
        this.scene.restart();
      });
    });
  }

  startLevel() {
    this.allies.clear(true, true);
    this.alliesAlive = 0;
    this.enemies.clear(true, true);
    this.enemiesAlive = 0;
    this.bullets.clear(true, true);

    if (this.level.currentLevel > 0) {
      this.audioSystem.play('LEVEL_UP');
    }
    this.level.currentLevel++;
    this.events.emit('levelChanged', this.level.currentLevel);

    const newEnemies = this.spawner.spawnEnemies(); // ONLY ONCE
    this.enemiesAlive = newEnemies.length;
    this.events.emit('enemiesChanged', this.enemiesAlive);
    newEnemies.forEach((e) => e.once('destroy', this.onEnemyDestroyed, this));

    // Allies appear only when alliesFeatureActive()
    if (this.alliesFeatureActive()) {
      // Spawn 2 allies
      for (let i = 0; i < 2; i++) {
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(400, 550);
        const ally = new Ally(this, x, y);
        this.allies.add(ally);
        this.alliesAlive++;
      }
    }
  }

  private onEnemyDestroyed() {
    this.enemiesAlive--;
    this.events.emit('enemiesChanged', this.enemiesAlive);
    if (this.enemiesAlive === 0) {
      this.time.delayedCall(
        400,
        () => {
          this.bullets.clear(true, true);
          this.startLevel();
        },
        [],
        this,
      );
    }
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

  getAllies(): Phaser.Physics.Arcade.Group {
    return this.allies;
  }

  getAimAngle(): number {
    return this.aimAngle;
  }
}
