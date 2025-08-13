import { balance } from '../config/balance';

export class Level {
  public currentLevel: number;

  constructor() {
    this.currentLevel = 1;
  }

  enemiesForLevel(level: number): number {
    return balance.baseEnemies + balance.enemyIncrement * (level - 1);
  }

  sigmaForLevel(level: number): number {
    return (
      balance.sigma0 * (1 + balance.sigmaStep * Math.floor((level - 1) / 5))
    );
  }
}
