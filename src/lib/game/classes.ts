/**
 * D&D-style character classes
 */

import type { Item } from '../types';

export type CharacterClass = {
  name: string;
  description: string;
  hitDie: number;
  primaryAbilities: Array<'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'>;
  startingEquipment: Item[];
  startingGold: number;
};

const createStartingItem = (
  id: string,
  name: string,
  description: string,
  weight: number,
  value: number,
  type: Item['type'],
  usable: boolean = false
): Item => ({
  id,
  name,
  description,
  weight,
  value,
  type,
  usable,
});

export const CLASSES: Record<string, CharacterClass> = {
  fighter: {
    name: 'Fighter',
    description: 'A master of martial combat, skilled with a variety of weapons and armor.',
    hitDie: 10,
    primaryAbilities: ['strength', 'constitution'],
    startingGold: 50,
    startingEquipment: [
      createStartingItem(
        'fighter-sword',
        'Longsword',
        'A well-balanced longsword with a leather-wrapped hilt.',
        3,
        15,
        'weapon'
      ),
      createStartingItem(
        'fighter-shield',
        'Wooden Shield',
        'A sturdy wooden shield reinforced with iron bands.',
        6,
        10,
        'armor'
      ),
      createStartingItem(
        'fighter-chainmail',
        'Chain Mail',
        'Heavy armor made of interlocking metal rings.',
        55,
        75,
        'armor'
      ),
      createStartingItem(
        'fighter-potion',
        'Healing Potion',
        'A red potion that restores 2d4+2 hit points.',
        0.5,
        50,
        'potion',
        true
      ),
    ],
  },

  wizard: {
    name: 'Wizard',
    description: 'A scholarly magic-user capable of manipulating the forces of arcane magic.',
    hitDie: 6,
    primaryAbilities: ['intelligence', 'wisdom'],
    startingGold: 30,
    startingEquipment: [
      createStartingItem(
        'wizard-staff',
        'Quarterstaff',
        'A simple wooden staff useful for walking and self-defense.',
        4,
        2,
        'weapon'
      ),
      createStartingItem(
        'wizard-spellbook',
        'Spellbook',
        'A leather-bound tome containing your arcane knowledge.',
        3,
        50,
        'quest'
      ),
      createStartingItem(
        'wizard-robes',
        'Wizard Robes',
        'Flowing robes adorned with mystical symbols.',
        4,
        10,
        'armor'
      ),
      createStartingItem(
        'wizard-potion',
        'Mana Potion',
        'A blue potion that restores magical energy.',
        0.5,
        40,
        'potion',
        true
      ),
    ],
  },

  rogue: {
    name: 'Rogue',
    description: 'A cunning and agile warrior who strikes from the shadows.',
    hitDie: 8,
    primaryAbilities: ['dexterity', 'charisma'],
    startingGold: 40,
    startingEquipment: [
      createStartingItem(
        'rogue-dagger',
        'Dagger',
        'A sharp blade perfect for quick strikes.',
        1,
        2,
        'weapon'
      ),
      createStartingItem(
        'rogue-shortbow',
        'Shortbow',
        'A compact bow for ranged attacks.',
        2,
        25,
        'weapon'
      ),
      createStartingItem(
        'rogue-leather',
        'Leather Armor',
        'Light armor that allows for quick movement.',
        10,
        10,
        'armor'
      ),
      createStartingItem(
        'rogue-lockpicks',
        'Thieves Tools',
        'A set of lockpicks and other tools of the trade.',
        1,
        25,
        'misc'
      ),
      createStartingItem(
        'rogue-potion',
        'Healing Potion',
        'A red potion that restores 2d4+2 hit points.',
        0.5,
        50,
        'potion',
        true
      ),
    ],
  },

  cleric: {
    name: 'Cleric',
    description: 'A holy warrior who channels divine magic to heal allies and smite foes.',
    hitDie: 8,
    primaryAbilities: ['wisdom', 'charisma'],
    startingGold: 35,
    startingEquipment: [
      createStartingItem(
        'cleric-mace',
        'Mace',
        'A heavy flanged weapon blessed by divine power.',
        4,
        5,
        'weapon'
      ),
      createStartingItem(
        'cleric-shield',
        'Wooden Shield',
        'A shield bearing your deity\'s holy symbol.',
        6,
        10,
        'armor'
      ),
      createStartingItem(
        'cleric-chainmail',
        'Chain Mail',
        'Heavy armor blessed for protection.',
        55,
        75,
        'armor'
      ),
      createStartingItem(
        'cleric-symbol',
        'Holy Symbol',
        'A sacred symbol used to channel divine magic.',
        0.5,
        5,
        'quest'
      ),
      createStartingItem(
        'cleric-potion',
        'Healing Potion',
        'A red potion that restores 2d4+2 hit points.',
        0.5,
        50,
        'potion',
        true
      ),
    ],
  },

  ranger: {
    name: 'Ranger',
    description: 'A skilled hunter and tracker who excels in wilderness survival.',
    hitDie: 10,
    primaryAbilities: ['dexterity', 'wisdom'],
    startingGold: 45,
    startingEquipment: [
      createStartingItem(
        'ranger-longbow',
        'Longbow',
        'A powerful bow for hunting and combat.',
        2,
        50,
        'weapon'
      ),
      createStartingItem(
        'ranger-shortsword',
        'Shortsword',
        'A versatile blade for close combat.',
        2,
        10,
        'weapon'
      ),
      createStartingItem(
        'ranger-leather',
        'Leather Armor',
        'Armor made from tanned hide, perfect for wilderness travel.',
        10,
        10,
        'armor'
      ),
      createStartingItem(
        'ranger-arrows',
        'Quiver of Arrows',
        'Twenty arrows for your bow.',
        1,
        1,
        'misc'
      ),
      createStartingItem(
        'ranger-potion',
        'Healing Potion',
        'A red potion that restores 2d4+2 hit points.',
        0.5,
        50,
        'potion',
        true
      ),
    ],
  },

  paladin: {
    name: 'Paladin',
    description: 'A holy knight bound by sacred oaths to uphold justice and righteousness.',
    hitDie: 10,
    primaryAbilities: ['strength', 'charisma'],
    startingGold: 40,
    startingEquipment: [
      createStartingItem(
        'paladin-longsword',
        'Longsword',
        'A gleaming blade consecrated with holy power.',
        3,
        15,
        'weapon'
      ),
      createStartingItem(
        'paladin-shield',
        'Steel Shield',
        'A polished shield emblazoned with a holy symbol.',
        6,
        15,
        'armor'
      ),
      createStartingItem(
        'paladin-chainmail',
        'Chain Mail',
        'Blessed armor that gleams with divine light.',
        55,
        75,
        'armor'
      ),
      createStartingItem(
        'paladin-symbol',
        'Holy Symbol',
        'A sacred symbol representing your sacred oath.',
        0.5,
        5,
        'quest'
      ),
      createStartingItem(
        'paladin-potion',
        'Healing Potion',
        'A red potion that restores 2d4+2 hit points.',
        0.5,
        50,
        'potion',
        true
      ),
    ],
  },
};

export const getClass = (className: string): CharacterClass | undefined => {
  return CLASSES[className.toLowerCase()];
};

export const getAllClasses = (): CharacterClass[] => {
  return Object.values(CLASSES);
};

export const getClassNames = (): string[] => {
  return Object.keys(CLASSES);
};
