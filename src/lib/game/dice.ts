/**
 * Dice rolling utilities for D&D-style mechanics
 */

/**
 * Roll a single die with the specified number of sides
 * @param sides - Number of sides on the die (e.g., 6 for d6, 20 for d20)
 * @returns Random number between 1 and sides (inclusive)
 */
export function rollDice(sides: number): number {
  if (!Number.isInteger(sides) || sides < 1) {
    throw new Error('Die must have at least 1 side and be an integer');
  }
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll 3d6 (three six-sided dice)
 * @returns Sum of three d6 rolls
 */
export function roll3d6(): number {
  return rollDice(6) + rollDice(6) + rollDice(6);
}

/**
 * Roll ability scores for a new character (3d6 for each ability)
 * @returns Object containing all six ability scores
 */
export function rollAbilityScores(): {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
} {
  return {
    strength: roll3d6(),
    dexterity: roll3d6(),
    constitution: roll3d6(),
    intelligence: roll3d6(),
    wisdom: roll3d6(),
    charisma: roll3d6(),
  };
}

/**
 * Calculate ability modifier from ability score (D&D 5e style)
 * @param score - Ability score (typically 3-18 for standard characters)
 * @returns Modifier value (score - 10) / 2, rounded down
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}
