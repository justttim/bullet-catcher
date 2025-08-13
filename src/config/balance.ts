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
  blastKnockback: 220,

  // Level
  levelTimeSec: 40,

  // Ally
  allyEnabled: true,
  allyStartLevel: 6,
  allyAddEveryNLevels: 4,
  allyMaxCount: 3,
  allyMaxHP: 3,
  allyFollowLerp: 0.08,
  allyOffsetY: 56,
  allySpacing: 26,
  allyIFrameMs: 800,
  allyShowHpMs: 2000,
  allySaveBoostBonus: 0.05,
  allySaveRadius: 72,

  // Audio and visual effects
  fxEnabled: true,
  sfxEnabled: true,
  sfxVolume: 0.5,
};
