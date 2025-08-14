import Phaser from 'phaser';
import { balance } from '../config/balance';
import { Game } from '../scenes/Game';
import { Level } from './Level';

export class Boundaries {
  private scene: Game;
  private level: Level;
  public walls: Phaser.Physics.Arcade.StaticGroup;
  public obstacles: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Game, level: Level) {
    this.scene = scene;
    this.level = level;
    this.walls = this.scene.physics.add.staticGroup();
    this.obstacles = this.scene.physics.add.staticGroup();
  }

  public setup() {
    this.walls.clear(true, true);
    this.obstacles.clear(true, true);

    if (
      !balance.wrap.enabled ||
      this.level.currentLevel < balance.wrap.borderStartLevel
    ) {
      return;
    }

    this.createBorderWalls();

    if (this.level.currentLevel >= balance.wrap.obstacleStartLevel) {
      this.createObstacles();
    }
  }

  private createBorderWalls() {
    const { width, height } = this.scene.scale;
    const { wallThickness, gapMin, gapMax, maxGapsPerSide, sideCoverageMin } =
      balance.wrap;

    const createWallSegments = (
      length: number,
    ): { start: number; size: number }[] => {
      const segments = [{ start: 0, size: length }];
      const numGaps = Phaser.Math.Between(0, maxGapsPerSide);

      for (let i = 0; i < numGaps; i++) {
        // Find the largest segment to split
        segments.sort((a, b) => b.size - a.size);
        const segmentToSplit = segments.shift();
        if (!segmentToSplit) continue;

        const gapSize = Phaser.Math.Between(gapMin, gapMax);
        if (segmentToSplit.size <= gapSize) {
          // Gap is larger than the segment, so the whole segment becomes a gap
          continue;
        }

        const gapStart = Phaser.Math.Between(
          segmentToSplit.start,
          segmentToSplit.start + segmentToSplit.size - gapSize,
        );

        // Create two new segments around the gap
        const seg1Size = gapStart - segmentToSplit.start;
        if (seg1Size > 0) {
          segments.push({ start: segmentToSplit.start, size: seg1Size });
        }

        const seg2Start = gapStart + gapSize;
        const seg2Size = segmentToSplit.start + segmentToSplit.size - seg2Start;
        if (seg2Size > 0) {
          segments.push({ start: seg2Start, size: seg2Size });
        }
      }

      // This logic does not use sideCoverageMin/Max, but it's simpler and more robust.
      // It creates 0..maxGapsPerSide gaps of random size in the largest available wall segments.
      return segments;
    };

    // Top and bottom walls
    createWallSegments(width).forEach((seg) => {
      this.walls
        .create(seg.start + seg.size / 2, wallThickness / 2, 'wall')
        .setSize(seg.size, wallThickness)
        .setDisplaySize(seg.size, wallThickness)
        .refreshBody();
      this.walls
        .create(
          seg.start + seg.size / 2,
          height - wallThickness / 2,
          'wall',
        )
        .setSize(seg.size, wallThickness)
        .setDisplaySize(seg.size, wallThickness)
        .refreshBody();
    });

    // Left and right walls
    createWallSegments(height).forEach((seg) => {
      this.walls
        .create(wallThickness / 2, seg.start + seg.size / 2, 'wall')
        .setSize(wallThickness, seg.size)
        .setDisplaySize(wallThickness, seg.size)
        .refreshBody();
      this.walls
        .create(
          width - wallThickness / 2,
          seg.start + seg.size / 2,
          'wall',
        )
        .setSize(wallThickness, seg.size)
        .setDisplaySize(wallThickness, seg.size)
        .refreshBody();
    });
  }

  private createObstacles() {
    const { width, height } = this.scene.scale;
    const {
      obstaclesMin,
      obstaclesMax,
      obstacleMinSize,
      obstacleMaxSize,
      safeRadiusFromPlayer,
      wallThickness,
    } = balance.wrap;

    const numObstacles = Phaser.Math.Between(obstaclesMin, obstaclesMax);
    const player = this.scene.getPlayer();

    for (let i = 0; i < numObstacles; i++) {
      let x, y, w, h;
      let attempts = 0;
      do {
        w = Phaser.Math.Between(obstacleMinSize, obstacleMaxSize);
        h = Phaser.Math.Between(obstacleMinSize, obstacleMaxSize);
        x = Phaser.Math.Between(wallThickness + w / 2, width - wallThickness - w / 2);
        y = Phaser.Math.Between(wallThickness + h / 2, height - wallThickness - h / 2);
        attempts++;
      } while (
        Phaser.Math.Distance.Between(player.x, player.y, x, y) <
          safeRadiusFromPlayer && attempts < 20
      );

      if (attempts < 20) {
        this.obstacles.create(x, y, 'obstacle')
          .setSize(w, h)
          .setDisplaySize(w, h)
          .refreshBody();
      }
    }
  }
}
