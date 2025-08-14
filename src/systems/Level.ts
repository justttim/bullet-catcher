import { balance } from '../config/balance';

export class Level {
  public currentLevel: number;

  constructor() {
    this.currentLevel = 0;
  }

  enemiesForLevel(level: number): number {
    return balance.baseEnemies + (level - 1) * (balance.enemyIncrement ?? 1);
  }

  sigmaForLevel(level: number): number {
    return (
      balance.sigma0 * (1 + balance.sigmaStep * Math.floor((level - 1) / 5))
    );
  }
}
