import { describe, it, expect, beforeEach } from 'vitest';
import { Level } from './Level';
import { balance } from '../config/balance';

describe('Level', () => {
  let level: Level;

  beforeEach(() => {
    level = new Level();
    // Reset balance to defaults before each test
    balance.baseEnemies = 1;
    balance.enemyIncrement = 1;
  });

  describe('enemiesForLevel', () => {
    it('should return the correct number of enemies for level 1', () => {
      expect(level.enemiesForLevel(1)).toBe(1); // 1 + 1 * 0
    });

    it('should return the correct number of enemies for level 2', () => {
      expect(level.enemiesForLevel(2)).toBe(2); // 1 + 1 * 1
    });

    it('should return the correct number of enemies for level 6', () => {
      expect(level.enemiesForLevel(6)).toBe(6); // 1 + 1 * 5
    });

    it('should handle custom balance config', () => {
      balance.baseEnemies = 5;
      balance.enemyIncrement = 2;
      expect(level.enemiesForLevel(3)).toBe(9); // 5 + 2 * 2
    });
  });

  describe('sigmaForLevel', () => {
    beforeEach(() => {
      // Reset balance config before each test
      balance.sigma0 = 18;
      balance.sigmaStep = 0.6;
    });

    it('should return the correct sigma for level 1', () => {
      expect(level.sigmaForLevel(1)).toBe(18);
    });

    it('should return the correct sigma for level 5', () => {
      expect(level.sigmaForLevel(5)).toBe(18);
    });

    it('should return the correct sigma for level 6', () => {
      expect(level.sigmaForLevel(6)).toBeCloseTo(28.8);
    });

    it('should return the correct sigma for level 10', () => {
      expect(level.sigmaForLevel(10)).toBeCloseTo(28.8);
    });

    it('should return the correct sigma for level 11', () => {
      expect(level.sigmaForLevel(11)).toBeCloseTo(39.6);
    });

    it('should handle custom balance config', () => {
      balance.sigma0 = 10;
      balance.sigmaStep = 0.5;
      // 10 * (1 + 0.5 * floor(14/5)) = 10 * (1 + 0.5 * 2) = 10 * 2 = 20
      expect(level.sigmaForLevel(15)).toBe(20);
    });
  });
});
