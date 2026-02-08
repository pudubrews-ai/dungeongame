import { describe, it, expect } from 'vitest';
import {
  calculateAbilityModifiers,
  calculateMaxHitPoints,
  calculateArmorClass,
  generateRandomName,
  getRandomRace,
  createCharacter,
  createRandomCharacter,
  awardExperience,
  healCharacter,
  damageCharacter,
  isAlive,
} from './character';
import type { AbilityScores } from '../types';

describe('character', () => {
  describe('calculateAbilityModifiers', () => {
    it('should calculate modifiers correctly', () => {
      const scores: AbilityScores = {
        strength: 16,
        dexterity: 14,
        constitution: 13,
        intelligence: 10,
        wisdom: 8,
        charisma: 12,
      };

      const modifiers = calculateAbilityModifiers(scores);

      expect(modifiers.strength).toBe(3);
      expect(modifiers.dexterity).toBe(2);
      expect(modifiers.constitution).toBe(1);
      expect(modifiers.intelligence).toBe(0);
      expect(modifiers.wisdom).toBe(-1);
      expect(modifiers.charisma).toBe(1);
    });
  });

  describe('calculateMaxHitPoints', () => {
    it('should calculate max HP from hit die and constitution modifier', () => {
      expect(calculateMaxHitPoints(10, 2)).toBe(12); // Fighter with +2 CON
      expect(calculateMaxHitPoints(6, 1)).toBe(7);   // Wizard with +1 CON
      expect(calculateMaxHitPoints(8, 0)).toBe(8);   // Rogue with +0 CON
    });

    it('should handle negative constitution modifiers', () => {
      expect(calculateMaxHitPoints(10, -2)).toBe(8);
      expect(calculateMaxHitPoints(6, -3)).toBe(3);
    });

    it('should always return at least 1 HP', () => {
      expect(calculateMaxHitPoints(6, -5)).toBe(1);
      expect(calculateMaxHitPoints(1, -10)).toBe(1);
    });
  });

  describe('calculateArmorClass', () => {
    it('should calculate base AC from dexterity modifier', () => {
      expect(calculateArmorClass(0)).toBe(10);
      expect(calculateArmorClass(2)).toBe(12);
      expect(calculateArmorClass(4)).toBe(14);
      expect(calculateArmorClass(-1)).toBe(9);
    });
  });

  describe('generateRandomName', () => {
    it('should generate a name with first and last name', () => {
      const name = generateRandomName();
      expect(name).toBeTruthy();
      expect(name.split(' ')).toHaveLength(2);
    });

    it('should generate different names on multiple calls', () => {
      const names = new Set();
      for (let i = 0; i < 50; i++) {
        names.add(generateRandomName());
      }
      // Should have at least some variety
      expect(names.size).toBeGreaterThan(10);
    });
  });

  describe('getRandomRace', () => {
    it('should return a valid race', () => {
      const validRaces = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Half-Orc', 'Tiefling'];
      const race = getRandomRace();
      expect(validRaces).toContain(race);
    });

    it('should generate different races on multiple calls', () => {
      const races = new Set();
      for (let i = 0; i < 50; i++) {
        races.add(getRandomRace());
      }
      // Should have at least some variety
      expect(races.size).toBeGreaterThan(1);
    });
  });

  describe('createCharacter', () => {
    it('should create a valid character', () => {
      const scores: AbilityScores = {
        strength: 16,
        dexterity: 14,
        constitution: 13,
        intelligence: 10,
        wisdom: 8,
        charisma: 12,
      };

      const character = createCharacter('Test Hero', 'Human', 'fighter', scores);

      expect(character.name).toBe('Test Hero');
      expect(character.race).toBe('Human');
      expect(character.class).toBe('Fighter');
      expect(character.level).toBe(1);
      expect(character.experience).toBe(0);
      expect(character.abilityScores).toEqual(scores);
      expect(character.hitPoints.current).toBeGreaterThan(0);
      expect(character.hitPoints.max).toBeGreaterThan(0);
      expect(character.gold).toBeGreaterThan(0);
      expect(character.inventory.items.length).toBeGreaterThan(0);
    });

    it('should roll ability scores if not provided', () => {
      const character = createCharacter('Test Hero', 'Human', 'fighter');

      expect(character.abilityScores.strength).toBeGreaterThanOrEqual(3);
      expect(character.abilityScores.strength).toBeLessThanOrEqual(18);
      expect(character.abilityScores.dexterity).toBeGreaterThanOrEqual(3);
      expect(character.abilityScores.dexterity).toBeLessThanOrEqual(18);
    });

    it('should throw error for invalid class', () => {
      expect(() => createCharacter('Test', 'Human', 'invalid-class')).toThrow('Invalid class');
    });

    it('should set starting equipment and calculate inventory weight', () => {
      const character = createCharacter('Test Hero', 'Human', 'fighter');

      expect(character.inventory.items.length).toBeGreaterThan(0);
      expect(character.inventory.currentWeight).toBeGreaterThan(0);
      expect(character.inventory.maxWeight).toBe(150);
    });

    it('should calculate correct HP for different classes', () => {
      const scores: AbilityScores = {
        strength: 10,
        dexterity: 10,
        constitution: 14, // +2 modifier
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      };

      const fighter = createCharacter('Fighter', 'Human', 'fighter', scores);
      expect(fighter.hitPoints.max).toBe(12); // d10 (10) + 2

      const wizard = createCharacter('Wizard', 'Human', 'wizard', scores);
      expect(wizard.hitPoints.max).toBe(8); // d6 (6) + 2
    });
  });

  describe('createRandomCharacter', () => {
    it('should create a character with random attributes', () => {
      const character = createRandomCharacter('fighter');

      expect(character.name).toBeTruthy();
      expect(character.race).toBeTruthy();
      expect(character.class).toBe('Fighter');
      expect(character.level).toBe(1);
    });
  });

  describe('awardExperience', () => {
    it('should add experience without leveling up', () => {
      const character = createRandomCharacter('fighter');
      const { character: updated, leveledUp } = awardExperience(character, 500);

      expect(updated.experience).toBe(500);
      expect(updated.level).toBe(1);
      expect(leveledUp).toBe(false);
    });

    it('should level up when reaching required XP', () => {
      const character = createRandomCharacter('fighter');
      const initialMaxHP = character.hitPoints.max;

      const { character: updated, leveledUp } = awardExperience(character, 1000);

      expect(updated.level).toBe(2);
      expect(updated.experience).toBe(1000);
      expect(updated.hitPoints.max).toBeGreaterThan(initialMaxHP);
      expect(leveledUp).toBe(true);
    });

    it('should increase hit points on level up', () => {
      const character = createRandomCharacter('fighter');
      const initialHP = character.hitPoints.current;

      const { character: updated } = awardExperience(character, 1000);

      expect(updated.hitPoints.current).toBeGreaterThan(initialHP);
      expect(updated.hitPoints.max).toBeGreaterThan(character.hitPoints.max);
    });
  });

  describe('healCharacter', () => {
    it('should heal damage', () => {
      const character = createRandomCharacter('fighter');
      character.hitPoints.current = 5;

      const healed = healCharacter(character, 3);

      expect(healed.hitPoints.current).toBe(8);
    });

    it('should not exceed max hit points', () => {
      const character = createRandomCharacter('fighter');
      character.hitPoints.current = character.hitPoints.max - 2;

      const healed = healCharacter(character, 10);

      expect(healed.hitPoints.current).toBe(character.hitPoints.max);
    });

    it('should not modify original character', () => {
      const character = createRandomCharacter('fighter');
      character.hitPoints.current = 5;
      const original = character.hitPoints.current;

      healCharacter(character, 3);

      expect(character.hitPoints.current).toBe(original);
    });
  });

  describe('damageCharacter', () => {
    it('should reduce hit points', () => {
      const character = createRandomCharacter('fighter');
      const initial = character.hitPoints.current;

      const damaged = damageCharacter(character, 5);

      expect(damaged.hitPoints.current).toBe(initial - 5);
    });

    it('should not go below 0 hit points', () => {
      const character = createRandomCharacter('fighter');
      character.hitPoints.current = 5;

      const damaged = damageCharacter(character, 100);

      expect(damaged.hitPoints.current).toBe(0);
    });

    it('should not modify original character', () => {
      const character = createRandomCharacter('fighter');
      const original = character.hitPoints.current;

      damageCharacter(character, 5);

      expect(character.hitPoints.current).toBe(original);
    });
  });

  describe('isAlive', () => {
    it('should return true for characters with HP > 0', () => {
      const character = createRandomCharacter('fighter');
      expect(isAlive(character)).toBe(true);
    });

    it('should return false for characters with HP = 0', () => {
      const character = createRandomCharacter('fighter');
      character.hitPoints.current = 0;
      expect(isAlive(character)).toBe(false);
    });

    it('should return false for characters with HP < 0', () => {
      const character = createRandomCharacter('fighter');
      character.hitPoints.current = -5;
      expect(isAlive(character)).toBe(false);
    });
  });
});
