import { describe, it, expect, vi } from 'vitest';
import {
  rollInitiative,
  determineTurnOrder,
  makeAttackRoll,
  rollDamage,
  getAttackBonus,
  getWeaponDamage,
  characterAttack,
  enemyAttack,
  attemptFlee,
  initiateCombat,
  getCurrentCombatant,
  isPlayerTurn,
  nextTurn,
  updateEnemyHP,
  shouldEndCombat,
  endCombat,
} from './combat';
import { createCharacter } from './character';
import type { NPC, AbilityScores } from '../types';

describe('combat', () => {
  const testScores: AbilityScores = {
    strength: 16,
    dexterity: 14,
    constitution: 13,
    intelligence: 10,
    wisdom: 8,
    charisma: 12,
  };

  const testCharacter = createCharacter('Test Hero', 'Human', 'fighter', testScores);

  const testEnemy: NPC = {
    id: 'goblin-1',
    name: 'Goblin',
    description: 'A small, green-skinned creature',
    dialogue: [],
    hostile: true,
    stats: {
      hitPoints: 15,
      armorClass: 13,
      attackBonus: 2,
      damage: '1d6+1',
    },
  };

  describe('rollInitiative', () => {
    it('should return a number between 1 and 20 plus modifier', () => {
      const result = rollInitiative(2);
      expect(result).toBeGreaterThanOrEqual(3); // 1 + 2
      expect(result).toBeLessThanOrEqual(22); // 20 + 2
    });

    it('should handle negative modifiers', () => {
      const result = rollInitiative(-1);
      expect(result).toBeGreaterThanOrEqual(0); // 1 + (-1)
      expect(result).toBeLessThanOrEqual(19); // 20 + (-1)
    });
  });

  describe('determineTurnOrder', () => {
    it('should return turn order with all combatants', () => {
      const { turnOrder } = determineTurnOrder(testCharacter, [testEnemy]);
      expect(turnOrder).toHaveLength(2);
      expect(turnOrder).toContain(testCharacter.id);
      expect(turnOrder).toContain(testEnemy.id);
    });

    it('should return initiatives for all combatants', () => {
      const { initiatives } = determineTurnOrder(testCharacter, [testEnemy]);
      expect(initiatives[testCharacter.id]).toBeDefined();
      expect(initiatives[testEnemy.id]).toBeDefined();
    });

    it('should handle multiple enemies', () => {
      const enemy2 = { ...testEnemy, id: 'goblin-2' };
      const { turnOrder } = determineTurnOrder(testCharacter, [testEnemy, enemy2]);
      expect(turnOrder).toHaveLength(3);
    });
  });

  describe('makeAttackRoll', () => {
    it('should return hit when total meets or exceeds AC', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom.mockReturnValue(0.5); // Roll of 11

      const result = makeAttackRoll(5, 15); // 11 + 5 = 16 vs AC 15
      expect(result.hits).toBe(true);
      expect(result.critical).toBe(false);

      mockRandom.mockRestore();
    });

    it('should return miss when total is below AC', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom.mockReturnValue(0); // Roll of 1

      const result = makeAttackRoll(2, 15); // 1 + 2 = 3 vs AC 15
      expect(result.hits).toBe(false);
      expect(result.criticalFail).toBe(true);

      mockRandom.mockRestore();
    });

    it('should always hit on natural 20', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom.mockReturnValue(0.99999); // Roll of 20

      const result = makeAttackRoll(0, 30); // Even with 0 bonus vs AC 30
      expect(result.hits).toBe(true);
      expect(result.critical).toBe(true);

      mockRandom.mockRestore();
    });

    it('should be critical fail on natural 1', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom.mockReturnValue(0); // Roll of 1

      const result = makeAttackRoll(10, 5); // Even with +10 vs AC 5
      expect(result.criticalFail).toBe(true);

      mockRandom.mockRestore();
    });
  });

  describe('rollDamage', () => {
    it('should parse and roll damage strings', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom.mockReturnValue(0.5); // Roll 4 on d6

      const damage = rollDamage('1d6+3');
      expect(damage).toBe(7); // 4 + 3

      mockRandom.mockRestore();
    });

    it('should handle multiple dice', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom.mockReturnValue(0.5); // Each d6 rolls 4

      const damage = rollDamage('2d6+2');
      expect(damage).toBe(10); // 4 + 4 + 2

      mockRandom.mockRestore();
    });

    it('should handle negative modifiers', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom.mockReturnValue(0); // Roll 1 on d6

      const damage = rollDamage('1d6-2');
      expect(damage).toBe(0); // 1 - 2, but minimum 0

      mockRandom.mockRestore();
    });

    it('should throw error for invalid damage strings', () => {
      expect(() => rollDamage('invalid')).toThrow('Invalid damage string');
      expect(() => rollDamage('sword')).toThrow('Invalid damage string');
    });
  });

  describe('getAttackBonus', () => {
    it('should calculate melee attack bonus', () => {
      const bonus = getAttackBonus(testCharacter, false);
      // Str modifier (+3) + proficiency bonus (+2 at level 1)
      expect(bonus).toBe(5);
    });

    it('should calculate ranged attack bonus', () => {
      const bonus = getAttackBonus(testCharacter, true);
      // Dex modifier (+2) + proficiency bonus (+2 at level 1)
      expect(bonus).toBe(4);
    });
  });

  describe('getWeaponDamage', () => {
    it('should return damage string with modifier', () => {
      const damage = getWeaponDamage(testCharacter);
      expect(damage).toMatch(/\dd\d+[+-]\d+/);
      expect(damage).toContain('1d8'); // Fighter base damage
    });
  });

  describe('characterAttack', () => {
    it('should perform an attack and return results', () => {
      const result = characterAttack(testCharacter, testEnemy);
      expect(result).toHaveProperty('attackRoll');
      expect(result).toHaveProperty('damage');
      expect(result).toHaveProperty('message');
      expect(result.message).toBeTruthy();
    });

    it('should throw error if enemy has no stats', () => {
      const invalidEnemy = { ...testEnemy, stats: undefined };
      expect(() => characterAttack(testCharacter, invalidEnemy)).toThrow(
        'Enemy has no combat stats'
      );
    });
  });

  describe('enemyAttack', () => {
    it('should perform an attack and return results', () => {
      const result = enemyAttack(testEnemy, testCharacter);
      expect(result).toHaveProperty('attackRoll');
      expect(result).toHaveProperty('damage');
      expect(result).toHaveProperty('message');
      expect(result.message).toBeTruthy();
    });

    it('should throw error if enemy has no stats', () => {
      const invalidEnemy = { ...testEnemy, stats: undefined };
      expect(() => enemyAttack(invalidEnemy, testCharacter)).toThrow(
        'Enemy has no combat stats'
      );
    });
  });

  describe('attemptFlee', () => {
    it('should return flee attempt results', () => {
      const result = attemptFlee(testCharacter);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('roll');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
    });

    it('should succeed on high rolls', () => {
      const mockRandom = vi.spyOn(Math, 'random');
      mockRandom.mockReturnValue(0.99999); // Roll 20

      const result = attemptFlee(testCharacter);
      expect(result.success).toBe(true);

      mockRandom.mockRestore();
    });
  });

  describe('initiateCombat', () => {
    it('should create combat state', () => {
      const combat = initiateCombat(testCharacter, [testEnemy]);
      expect(combat.active).toBe(true);
      expect(combat.enemies).toHaveLength(1);
      expect(combat.turnOrder.length).toBeGreaterThan(0);
      expect(combat.round).toBe(1);
      expect(combat.currentTurnIndex).toBe(0);
    });
  });

  describe('getCurrentCombatant', () => {
    it('should return current combatant ID', () => {
      const combat = initiateCombat(testCharacter, [testEnemy]);
      const current = getCurrentCombatant(combat);
      expect(combat.turnOrder).toContain(current);
    });
  });

  describe('isPlayerTurn', () => {
    it('should return true when it is player turn', () => {
      const combat = initiateCombat(testCharacter, [testEnemy]);
      combat.turnOrder = [testCharacter.id, testEnemy.id];
      combat.currentTurnIndex = 0;

      expect(isPlayerTurn(combat, testCharacter.id)).toBe(true);
    });

    it('should return false when it is not player turn', () => {
      const combat = initiateCombat(testCharacter, [testEnemy]);
      combat.turnOrder = [testEnemy.id, testCharacter.id];
      combat.currentTurnIndex = 0;

      expect(isPlayerTurn(combat, testCharacter.id)).toBe(false);
    });
  });

  describe('nextTurn', () => {
    it('should advance to next combatant', () => {
      const combat = initiateCombat(testCharacter, [testEnemy]);
      const initialIndex = combat.currentTurnIndex;

      const updated = nextTurn(combat);
      expect(updated.currentTurnIndex).toBe(initialIndex + 1);
      expect(updated.round).toBe(1);
    });

    it('should start new round after all combatants', () => {
      const combat = initiateCombat(testCharacter, [testEnemy]);
      combat.currentTurnIndex = combat.turnOrder.length - 1;

      const updated = nextTurn(combat);
      expect(updated.currentTurnIndex).toBe(0);
      expect(updated.round).toBe(2);
    });
  });

  describe('updateEnemyHP', () => {
    it('should reduce enemy HP', () => {
      const combat = initiateCombat(testCharacter, [testEnemy]);
      const { combat: updated } = updateEnemyHP(combat, testEnemy.id, 5);

      const enemy = updated.enemies.find(e => e.id === testEnemy.id);
      expect(enemy?.stats?.hitPoints).toBe(10); // 15 - 5
    });

    it('should remove defeated enemies', () => {
      const combat = initiateCombat(testCharacter, [testEnemy]);
      const { combat: updated, enemyDefeated, defeatedEnemy } = updateEnemyHP(
        combat,
        testEnemy.id,
        20
      );

      expect(updated.enemies).toHaveLength(0);
      expect(enemyDefeated).toBe(true);
      expect(defeatedEnemy).toBeDefined();
    });
  });

  describe('shouldEndCombat', () => {
    it('should return false when enemies remain', () => {
      const combat = initiateCombat(testCharacter, [testEnemy]);
      const { shouldEnd } = shouldEndCombat(combat);
      expect(shouldEnd).toBe(false);
    });

    it('should return true when all enemies defeated', () => {
      const combat = initiateCombat(testCharacter, [testEnemy]);
      combat.enemies = [];

      const { shouldEnd, victory } = shouldEndCombat(combat);
      expect(shouldEnd).toBe(true);
      expect(victory).toBe(true);
    });
  });

  describe('endCombat', () => {
    it('should calculate rewards', () => {
      const combat = initiateCombat(testCharacter, [testEnemy]);
      const { experienceGained, goldGained } = endCombat(combat);

      expect(experienceGained).toBeGreaterThan(0);
      expect(goldGained).toBeGreaterThanOrEqual(0);
    });
  });
});
