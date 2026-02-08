/**
 * Character creation and management
 */

import type { Character, AbilityScores, AbilityModifiers, Inventory } from '../types';
import { rollAbilityScores, getAbilityModifier, rollDice } from './dice';
import { getClass } from './classes';
import { nanoid } from 'nanoid';

/**
 * Calculate all ability modifiers from ability scores
 */
export function calculateAbilityModifiers(scores: AbilityScores): AbilityModifiers {
  return {
    strength: getAbilityModifier(scores.strength),
    dexterity: getAbilityModifier(scores.dexterity),
    constitution: getAbilityModifier(scores.constitution),
    intelligence: getAbilityModifier(scores.intelligence),
    wisdom: getAbilityModifier(scores.wisdom),
    charisma: getAbilityModifier(scores.charisma),
  };
}

/**
 * Calculate maximum hit points for a character
 * Level 1 characters get max hit die + constitution modifier
 */
export function calculateMaxHitPoints(hitDie: number, constitutionModifier: number): number {
  return Math.max(1, hitDie + constitutionModifier);
}

/**
 * Calculate armor class based on equipment and dexterity
 * Base AC = 10 + dexterity modifier
 * This will be modified by armor in the future
 */
export function calculateArmorClass(dexterityModifier: number): number {
  return 10 + dexterityModifier;
}

/**
 * Generate a random fantasy character name
 */
export function generateRandomName(): string {
  const firstNames = [
    'Aldric', 'Brynn', 'Cedric', 'Draven', 'Elara', 'Finn', 'Gwendolyn', 'Hadrian',
    'Isolde', 'Jareth', 'Kira', 'Leander', 'Morrigan', 'Nyx', 'Orion', 'Petra',
    'Quinlan', 'Raven', 'Soren', 'Thalia', 'Ulric', 'Vesper', 'Wren', 'Xander',
    'Yara', 'Zephyr'
  ];

  const lastNames = [
    'Ashworth', 'Blackwood', 'Crestfall', 'Darkwater', 'Emberstone', 'Frostwind',
    'Goldleaf', 'Hawthorne', 'Ironforge', 'Jadewing', 'Kindred', 'Lightbringer',
    'Moonwhisper', 'Nightshade', 'Oakenshield', 'Proudfoot', 'Quicksilver',
    'Ravenwood', 'Stormborn', 'Thornheart', 'Underwood', 'Valorwind', 'Wildheart',
    'Silverstar', 'Brightblade', 'Shadowmere'
  ];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  return `${firstName} ${lastName}`;
}

/**
 * Get a random race for character creation
 */
export function getRandomRace(): string {
  const races = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Half-Orc', 'Tiefling'];
  return races[Math.floor(Math.random() * races.length)];
}

/**
 * Create a new character with the specified class
 */
export function createCharacter(
  name: string,
  race: string,
  className: string,
  abilityScores?: AbilityScores
): Character {
  const characterClass = getClass(className);
  if (!characterClass) {
    throw new Error(`Invalid class: ${className}`);
  }

  // Roll ability scores if not provided
  const scores = abilityScores || rollAbilityScores();
  const modifiers = calculateAbilityModifiers(scores);

  // Calculate hit points and AC
  const maxHitPoints = calculateMaxHitPoints(characterClass.hitDie, modifiers.constitution);
  const armorClass = calculateArmorClass(modifiers.dexterity);

  // Calculate starting inventory weight
  const startingWeight = characterClass.startingEquipment.reduce(
    (total, item) => total + item.weight,
    0
  );

  const inventory: Inventory = {
    items: [...characterClass.startingEquipment],
    maxWeight: 150, // Base carrying capacity, could be modified by strength
    currentWeight: startingWeight,
  };

  return {
    id: nanoid(),
    name,
    race,
    class: characterClass.name,
    level: 1,
    experience: 0,
    hitPoints: {
      current: maxHitPoints,
      max: maxHitPoints,
    },
    abilityScores: scores,
    abilityModifiers: modifiers,
    inventory,
    gold: characterClass.startingGold,
    armorClass,
  };
}

/**
 * Create a character with randomly generated attributes
 */
export function createRandomCharacter(className: string): Character {
  const name = generateRandomName();
  const race = getRandomRace();
  return createCharacter(name, race, className);
}

/**
 * Award experience points to a character
 * Returns updated character and whether they leveled up
 */
export function awardExperience(
  character: Character,
  xp: number
): { character: Character; leveledUp: boolean } {
  const newExperience = character.experience + xp;
  const xpForNextLevel = character.level * 1000; // Simple progression: 1000 XP per level

  if (newExperience >= xpForNextLevel) {
    // Level up! Handle multiple level-ups if needed
    const characterClass = getClass(character.class);
    if (!characterClass) {
      throw new Error(`Invalid class: ${character.class}`);
    }

    let updatedCharacter = { ...character, experience: newExperience };
    let leveledUp = false;

    // Keep leveling up until we don't have enough XP
    while (updatedCharacter.experience >= updatedCharacter.level * 1000) {
      const hitPointIncrease = rollDice(characterClass.hitDie) + updatedCharacter.abilityModifiers.constitution;
      const actualIncrease = Math.max(1, hitPointIncrease); // Ensure minimum 1 HP gain

      updatedCharacter = {
        ...updatedCharacter,
        level: updatedCharacter.level + 1,
        hitPoints: {
          current: updatedCharacter.hitPoints.current + actualIncrease,
          max: updatedCharacter.hitPoints.max + actualIncrease,
        },
      };
      leveledUp = true;
    }

    return {
      character: updatedCharacter,
      leveledUp,
    };
  }

  return {
    character: {
      ...character,
      experience: newExperience,
    },
    leveledUp: false,
  };
}

/**
 * Heal a character by a specified amount
 */
export function healCharacter(character: Character, amount: number): Character {
  const newHP = Math.min(character.hitPoints.max, character.hitPoints.current + amount);

  return {
    ...character,
    hitPoints: {
      ...character.hitPoints,
      current: newHP,
    },
  };
}

/**
 * Damage a character by a specified amount
 */
export function damageCharacter(character: Character, amount: number): Character {
  const newHP = Math.max(0, character.hitPoints.current - amount);

  return {
    ...character,
    hitPoints: {
      ...character.hitPoints,
      current: newHP,
    },
  };
}

/**
 * Check if a character is alive
 */
export function isAlive(character: Character): boolean {
  return character.hitPoints.current > 0;
}
