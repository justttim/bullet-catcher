export const balance = {
  // Enemy progression
  baseEnemies: 1,
  enemyIncrement: 1, // Linear progression

  // Enemy behavior
  enemyFirePeriod: 1200,
  enemyTopZoneRatio: 0.33,
  enemyMoveSpeedMin: 40,
  enemyMoveSpeedMax: 90,
  enemyWanderIntervalMs: 900,

  // Aiming
  sigma0: 18,
  sigmaStep: 0.6,

  // Bullet
  bulletSpeed: 140,

  // Player
  playerSpeed: 220,
  boostPerBullet: 0.2,
  blastRadius: 180,
  blastArc: 120, // Angle in degrees
  blastKnockback: 220,
  boostTelegraphThreshold: 0.8,

  // Ally
  allyEnabled: true,
  allyStartLevel: 2,

  // Level
  levelTimeSec: 40,
  // Audio and visual effects
  fxEnabled: true,
  sfxEnabled: true,
  sfxVolume: 0.5,

  // World wrap and boundaries
  wrap: {
    enabled: true,
    borderStartLevel: 10,
    obstacleStartLevel: 20,
    wallThickness: 12,
    gapMin: 60,
    gapMax: 140,
    sideCoverageMin: 0.6, // 60–100% coverage by walls
    sideCoverageMax: 1.0,
    maxGapsPerSide: 2,
    obstaclesMin: 0,
    obstaclesMax: 3,
    obstacleMinSize: 40,
    obstacleMaxSize: 110,
    safeRadiusFromPlayer: 120,
  },

  // Bullet ricochet
  bulletRicochet: {
    enabled: true,
    maxBounces: 6,
  },
};
