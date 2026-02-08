import { describe, it, expect, vi } from 'vitest';
import { rollDice, roll3d6, rollAbilityScores, getAbilityModifier } from './dice';

describe('dice', () => {
  describe('rollDice', () => {
    it('should return a number between 1 and sides', () => {
      // Test multiple rolls to ensure range
      for (let i = 0; i < 100; i++) {
        const result = rollDice(6);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(6);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('should work with different die sizes', () => {
      const d20 = rollDice(20);
      expect(d20).toBeGreaterThanOrEqual(1);
      expect(d20).toBeLessThanOrEqual(20);

      const d4 = rollDice(4);
      expect(d4).toBeGreaterThanOrEqual(1);
      expect(d4).toBeLessThanOrEqual(4);
    });

    it('should throw error for invalid die sizes', () => {
      expect(() => rollDice(0)).toThrow('Die must have at least 1 side');
      expect(() => rollDice(-5)).toThrow('Die must have at least 1 side');
    });

    it('should return predictable values with mocked random', () => {
      const mockRandom = vi.spyOn(Math, 'random');

      // Mock Math.random to return 0 (should give us 1)
      mockRandom.mockReturnValue(0);
      expect(rollDice(6)).toBe(1);

      // Mock Math.random to return 0.99999 (should give us 6)
      mockRandom.mockReturnValue(0.99999);
      expect(rollDice(6)).toBe(6);

      // Mock Math.random to return 0.5 (should give us 4)
      mockRandom.mockReturnValue(0.5);
      expect(rollDice(6)).toBe(4);

      mockRandom.mockRestore();
    });
  });

  describe('roll3d6', () => {
    it('should return a sum between 3 and 18', () => {
      for (let i = 0; i < 100; i++) {
        const result = roll3d6();
        expect(result).toBeGreaterThanOrEqual(3);
        expect(result).toBeLessThanOrEqual(18);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('should return predictable values with mocked random', () => {
      const mockRandom = vi.spyOn(Math, 'random');

      // Three rolls of 1 (Math.random = 0)
      mockRandom.mockReturnValue(0);
      expect(roll3d6()).toBe(3);

      // Three rolls of 6 (Math.random = 0.99999)
      mockRandom.mockReturnValue(0.99999);
      expect(roll3d6()).toBe(18);

      mockRandom.mockRestore();
    });
  });

  describe('rollAbilityScores', () => {
    it('should return all six ability scores', () => {
      const scores = rollAbilityScores();

      expect(scores).toHaveProperty('strength');
      expect(scores).toHaveProperty('dexterity');
      expect(scores).toHaveProperty('constitution');
      expect(scores).toHaveProperty('intelligence');
      expect(scores).toHaveProperty('wisdom');
      expect(scores).toHaveProperty('charisma');
    });

    it('should return scores in valid range', () => {
      const scores = rollAbilityScores();

      Object.values(scores).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(3);
        expect(score).toBeLessThanOrEqual(18);
        expect(Number.isInteger(score)).toBe(true);
      });
    });

    it('should return predictable scores with mocked random', () => {
      const mockRandom = vi.spyOn(Math, 'random');

      // All minimum rolls (1s)
      mockRandom.mockReturnValue(0);
      let scores = rollAbilityScores();
      expect(scores.strength).toBe(3);
      expect(scores.dexterity).toBe(3);
      expect(scores.constitution).toBe(3);
      expect(scores.intelligence).toBe(3);
      expect(scores.wisdom).toBe(3);
      expect(scores.charisma).toBe(3);

      // All maximum rolls (6s)
      mockRandom.mockReturnValue(0.99999);
      scores = rollAbilityScores();
      expect(scores.strength).toBe(18);
      expect(scores.dexterity).toBe(18);
      expect(scores.constitution).toBe(18);
      expect(scores.intelligence).toBe(18);
      expect(scores.wisdom).toBe(18);
      expect(scores.charisma).toBe(18);

      mockRandom.mockRestore();
    });
  });

  describe('getAbilityModifier', () => {
    it('should calculate correct modifiers for standard scores', () => {
      expect(getAbilityModifier(3)).toBe(-4);
      expect(getAbilityModifier(8)).toBe(-1);
      expect(getAbilityModifier(10)).toBe(0);
      expect(getAbilityModifier(11)).toBe(0);
      expect(getAbilityModifier(12)).toBe(1);
      expect(getAbilityModifier(15)).toBe(2);
      expect(getAbilityModifier(18)).toBe(4);
      expect(getAbilityModifier(20)).toBe(5);
    });

    it('should handle edge cases', () => {
      expect(getAbilityModifier(1)).toBe(-5);
      expect(getAbilityModifier(9)).toBe(-1);
      expect(getAbilityModifier(30)).toBe(10);
    });

    it('should always round down', () => {
      // Score 13 = (13 - 10) / 2 = 1.5, should be 1
      expect(getAbilityModifier(13)).toBe(1);

      // Score 7 = (7 - 10) / 2 = -1.5, should be -2
      expect(getAbilityModifier(7)).toBe(-2);
    });
  });
});
