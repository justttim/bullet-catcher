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
};
