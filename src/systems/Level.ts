import { balance } from '../config/balance';

export class Level {
  public currentLevel: number;

  constructor() {
    this.currentLevel = 1;
  }

  enemiesForLevel(level: number): number {
    return Math.floor(
      balance.baseEnemies * Math.pow(balance.enemyRatio, level - 1),
    );
  }

  sigmaForLevel(level: number): number {
    return (
      balance.sigma0 * (1 + balance.sigmaStep * Math.floor((level - 1) / 5))
    );
  }
}
