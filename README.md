# Bullet Catcher

A top-down shooter where you catch bullets to power up and unleash a devastating blast.

## Gameplay Loop

The core gameplay loop revolves around survival and risk-reward mechanics.
- **Move:** Use WASD or Arrow Keys to control the player.
- **Survive:** Enemies spawn and shoot bullets at you. Dodge them!
- **Catch:** Flying into bullets doesn't kill you. Instead, it charges your boost meter.
- **Blast:** When the boost meter reaches 100%, it automatically triggers a blast wave. This wave destroys nearby enemies and pushes back all bullets on screen, giving you a moment of respite.
- **Progress:** Survive for the duration of the level (40 seconds) to advance to the next, more challenging level.

## Level Progression

The game gets progressively harder as you advance through the levels. The difficulty scales in two main ways:

1.  **Number of Enemies:** The number of enemies increases linearly with each level. The formula is `E(L) = baseEnemies + enemyIncrement * (L-1)`, where `L` is the current level.
2.  **Aiming Accuracy:** Enemies become more accurate as you progress. See the Aiming Noise section for details.

## Aiming Noise

Enemies don't have perfect aim. Their shots are directed towards the player's position plus a random offset. This offset is determined by a normal distribution with a standard deviation (`sigma`).

The `sigma` value decreases as the player progresses, making the enemies more accurate. The formula is `σ(L) = σ_0 * (1 + k * floor((L-1)/5))`. This means the accuracy increases every 5 levels.

## Tuning

All major gameplay variables can be tuned in the `src/config/balance.ts` file. This allows for easy modification of the game's difficulty and feel.

| Constant          | Description                                     | Default Value |
| ----------------- | ----------------------------------------------- | ------------- |
| `baseEnemies`     | Number of enemies at level 1.                   | 1             |
| `enemyIncrement`  | How many enemies are added each level.          | 1             |
| `bulletSpeed`     | Speed of enemy bullets.                         | 140           |
| `enemyFirePeriod` | Time in ms between enemy shots.                 | 1200          |
| `sigma0`          | Base aiming noise (standard deviation).         | 18            |
| `sigmaStep`       | How much sigma is multiplied every 5 levels.    | 0.6           |
| `boostPerBullet`  | How much boost is gained per bullet caught (0-1). | 0.2           |
| `blastRadius`     | The radius of the boost blast.                  | 180           |
| `blastKnockback`  | The force applied to bullets by the blast.      | 220           |
| `playerSpeed`     | The player's movement speed.                    | 220           |
| `levelTimeSec`    | Duration of each level in seconds.              | 40            |

## HUD

The Heads-Up Display provides essential information at a glance.

- **Boost Bar (Top-Left):** Shows the current boost meter charge. It fills up as you catch bullets.
- **Level Indicator (Top-Right):** Displays the current level.
- **Timer (Top-Right):** Counts down the time remaining in the current level.

![HUD Screenshot](placeholder.png)
*(Screenshot placeholder)*

---
*This line is added to verify the new PR workflow.*

Workflow sanity check.
