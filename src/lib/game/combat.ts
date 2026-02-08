/**
 * Combat system for turn-based battles
 */

import type { Character, NPC, CombatState } from '../types';
import { rollDice } from './dice';

/**
 * Roll initiative for a combatant (d20 + dexterity modifier)
 */
export function rollInitiative(dexterityModifier: number): number {
  return rollDice(20) + dexterityModifier;
}

/**
 * Determine turn order based on initiative rolls
 * Returns array of combatant IDs sorted by initiative (highest first)
 */
export function determineTurnOrder(
  character: Character,
  enemies: NPC[]
): { turnOrder: string[]; initiatives: Record<string, number> } {
  const initiatives: Record<string, number> = {};

  // Roll for player character
  initiatives[character.id] = rollInitiative(character.abilityModifiers.dexterity);

  // Roll for each enemy
  enemies.forEach(enemy => {
    const dexMod = enemy.stats ? Math.floor((enemy.stats.armorClass - 10) / 2) : 0; // Derive dex from AC
    initiatives[enemy.id] = rollInitiative(dexMod);
  });

  // Sort by initiative (highest first)
  const turnOrder = Object.entries(initiatives)
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => id);

  return { turnOrder, initiatives };
}

/**
 * Make an attack roll (d20 + attack modifier) against target AC
 * Returns whether the attack hits
 */
export function makeAttackRoll(attackBonus: number, targetAC: number): {
  roll: number;
  total: number;
  hits: boolean;
  critical: boolean;
  criticalFail: boolean;
} {
  const roll = rollDice(20);
  const total = roll + attackBonus;

  return {
    roll,
    total,
    hits: total >= targetAC || roll === 20,
    critical: roll === 20,
    criticalFail: roll === 1,
  };
}

/**
 * Calculate damage from a weapon or attack
 * Format: "XdY+Z" (e.g., "1d8+3" means 1d8 + 3)
 */
export function rollDamage(damageString: string): number {
  const match = damageString.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) {
    throw new Error(`Invalid damage string: ${damageString}`);
  }

  const [, numDice, dieSize, modifier] = match;
  const dice = parseInt(numDice, 10);
  const sides = parseInt(dieSize, 10);
  const mod = modifier ? parseInt(modifier, 10) : 0;

  let total = mod;
  for (let i = 0; i < dice; i++) {
    total += rollDice(sides);
  }

  return Math.max(0, total);
}

/**
 * Calculate character's attack bonus
 * Melee: strength modifier + proficiency bonus
 * Ranged: dexterity modifier + proficiency bonus
 */
export function getAttackBonus(character: Character, ranged: boolean = false): number {
  const proficiencyBonus = Math.floor((character.level - 1) / 4) + 2; // +2 at level 1, increases every 4 levels
  const abilityModifier = ranged
    ? character.abilityModifiers.dexterity
    : character.abilityModifiers.strength;

  return abilityModifier + proficiencyBonus;
}

/**
 * Calculate base weapon damage for character
 * This is simplified - in a full game, weapons would have their own damage dice
 */
export function getWeaponDamage(character: Character, ranged: boolean = false): string {
  const abilityModifier = ranged
    ? character.abilityModifiers.dexterity
    : character.abilityModifiers.strength;

  // Base weapon damage by class (simplified)
  const baseDamage: Record<string, string> = {
    Fighter: '1d8',
    Paladin: '1d8',
    Ranger: ranged ? '1d8' : '1d6',
    Cleric: '1d6',
    Rogue: '1d6',
    Wizard: '1d4',
  };

  const base = baseDamage[character.class] || '1d6';
  const modifier = abilityModifier >= 0 ? `+${abilityModifier}` : `${abilityModifier}`;

  return `${base}${modifier}`;
}

/**
 * Perform a character's attack on an enemy
 */
export function characterAttack(character: Character, enemy: NPC): {
  attackRoll: ReturnType<typeof makeAttackRoll>;
  damage: number;
  message: string;
} {
  if (!enemy.stats) {
    throw new Error('Enemy has no combat stats');
  }

  const attackBonus = getAttackBonus(character);
  const attackRoll = makeAttackRoll(attackBonus, enemy.stats.armorClass);

  let damage = 0;
  let message = '';

  if (attackRoll.critical) {
    const weaponDamage = getWeaponDamage(character);
    damage = rollDamage(weaponDamage) * 2; // Critical hits double damage
    message = `CRITICAL HIT! ${character.name} strikes ${enemy.name} for ${damage} damage!`;
  } else if (attackRoll.hits) {
    const weaponDamage = getWeaponDamage(character);
    damage = rollDamage(weaponDamage);
    message = `${character.name} hits ${enemy.name} for ${damage} damage!`;
  } else if (attackRoll.criticalFail) {
    message = `CRITICAL MISS! ${character.name}'s attack goes completely astray!`;
  } else {
    message = `${character.name} misses ${enemy.name}. (Rolled ${attackRoll.total} vs AC ${enemy.stats.armorClass})`;
  }

  return { attackRoll, damage, message };
}

/**
 * Perform an enemy's attack on the character
 */
export function enemyAttack(enemy: NPC, character: Character): {
  attackRoll: ReturnType<typeof makeAttackRoll>;
  damage: number;
  message: string;
} {
  if (!enemy.stats) {
    throw new Error('Enemy has no combat stats');
  }

  const attackRoll = makeAttackRoll(enemy.stats.attackBonus, character.armorClass);

  let damage = 0;
  let message = '';

  if (attackRoll.critical) {
    damage = rollDamage(enemy.stats.damage) * 2;
    message = `CRITICAL HIT! ${enemy.name} strikes ${character.name} for ${damage} damage!`;
  } else if (attackRoll.hits) {
    damage = rollDamage(enemy.stats.damage);
    message = `${enemy.name} hits ${character.name} for ${damage} damage!`;
  } else if (attackRoll.criticalFail) {
    message = `${enemy.name}'s attack fails miserably!`;
  } else {
    message = `${enemy.name} misses ${character.name}. (Rolled ${attackRoll.total} vs AC ${character.armorClass})`;
  }

  return { attackRoll, damage, message };
}

/**
 * Attempt to flee from combat
 * Success based on dexterity check (DC 12)
 */
export function attemptFlee(character: Character): {
  success: boolean;
  roll: number;
  message: string;
} {
  const dc = 12;
  const roll = rollDice(20) + character.abilityModifiers.dexterity;
  const success = roll >= dc;

  const message = success
    ? `${character.name} successfully flees from combat! (Rolled ${roll} vs DC ${dc})`
    : `${character.name} fails to escape! (Rolled ${roll} vs DC ${dc})`;

  return { success, roll, message };
}

/**
 * Initialize combat state with player and enemies
 */
export function initiateCombat(character: Character, enemies: NPC[]): CombatState {
  const { turnOrder } = determineTurnOrder(character, enemies);

  const enemyMaxHPs: Record<string, number> = {};
  for (const e of enemies) {
    if (e.stats) enemyMaxHPs[e.id] = e.stats.hitPoints;
  }

  return {
    active: true,
    enemies: enemies.map(e => ({ ...e })), // Clone enemies
    enemyMaxHPs,
    totalEnemyCount: enemies.length,
    turnOrder,
    currentTurnIndex: 0,
    round: 1,
  };
}

/**
 * Get the ID of the current combatant
 */
export function getCurrentCombatant(combat: CombatState): string {
  return combat.turnOrder[combat.currentTurnIndex];
}

/**
 * Check if it's the player's turn
 */
export function isPlayerTurn(combat: CombatState, playerId: string): boolean {
  return getCurrentCombatant(combat) === playerId;
}

/**
 * Advance to the next turn in combat
 */
export function nextTurn(combat: CombatState): CombatState {
  const nextIndex = combat.currentTurnIndex + 1;

  if (nextIndex >= combat.turnOrder.length) {
    // New round
    return {
      ...combat,
      currentTurnIndex: 0,
      round: combat.round + 1,
    };
  }

  return {
    ...combat,
    currentTurnIndex: nextIndex,
  };
}

/**
 * Update enemy hit points and remove defeated enemies
 */
export function updateEnemyHP(
  combat: CombatState,
  enemyId: string,
  damage: number
): {
  combat: CombatState;
  enemyDefeated: boolean;
  defeatedEnemy?: NPC;
} {
  const updatedEnemies = combat.enemies.map(enemy => {
    if (enemy.id === enemyId && enemy.stats) {
      const newHP = Math.max(0, enemy.stats.hitPoints - damage);
      return {
        ...enemy,
        stats: {
          ...enemy.stats,
          hitPoints: newHP,
        },
      };
    }
    return enemy;
  });

  const defeatedEnemy = updatedEnemies.find(
    e => e.id === enemyId && e.stats && e.stats.hitPoints <= 0
  );

  const remainingEnemies = updatedEnemies.filter(
    e => !e.stats || e.stats.hitPoints > 0
  );

  // Remove defeated enemy from turn order
  const turnOrder = defeatedEnemy
    ? combat.turnOrder.filter(id => id !== enemyId)
    : combat.turnOrder;

  return {
    combat: {
      ...combat,
      enemies: remainingEnemies,
      turnOrder,
    },
    enemyDefeated: !!defeatedEnemy,
    defeatedEnemy,
  };
}

/**
 * Check if combat should end
 */
export function shouldEndCombat(combat: CombatState): {
  shouldEnd: boolean;
  victory: boolean;
} {
  const allEnemiesDefeated = combat.enemies.every(
    e => !e.stats || e.stats.hitPoints <= 0
  );

  return {
    shouldEnd: allEnemiesDefeated,
    victory: allEnemiesDefeated,
  };
}

/**
 * End combat and calculate rewards
 */
export function endCombat(combat: CombatState): {
  experienceGained: number;
  goldGained: number;
} {
  // Use totalEnemyCount (set at combat start) so rewards are correct
  // even after defeated enemies are filtered from the enemies array
  const count = combat.totalEnemyCount || combat.enemies.length;

  // Simple XP calculation: 100 XP per defeated enemy
  const experienceGained = count * 100;

  // Simple gold calculation: 10-50 gold per enemy
  let goldGained = 0;
  for (let i = 0; i < count; i++) {
    goldGained += Math.floor(Math.random() * 41) + 10; // 10-50 gold
  }

  return { experienceGained, goldGained };
}
