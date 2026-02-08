import { describe, it, expect } from 'vitest';
import { CLASSES, getClass, getAllClasses, getClassNames } from './classes';

describe('classes', () => {
  describe('CLASSES constant', () => {
    it('should have all 6 classes defined', () => {
      const classNames = Object.keys(CLASSES);
      expect(classNames).toHaveLength(6);
      expect(classNames).toContain('fighter');
      expect(classNames).toContain('wizard');
      expect(classNames).toContain('rogue');
      expect(classNames).toContain('cleric');
      expect(classNames).toContain('ranger');
      expect(classNames).toContain('paladin');
    });

    it('should have valid hit dice for all classes', () => {
      Object.values(CLASSES).forEach(charClass => {
        expect(charClass.hitDie).toBeGreaterThanOrEqual(6);
        expect(charClass.hitDie).toBeLessThanOrEqual(12);
        expect([6, 8, 10, 12]).toContain(charClass.hitDie);
      });
    });

    it('should have primary abilities for all classes', () => {
      Object.values(CLASSES).forEach(charClass => {
        expect(charClass.primaryAbilities).toBeDefined();
        expect(charClass.primaryAbilities.length).toBeGreaterThan(0);
        expect(charClass.primaryAbilities.length).toBeLessThanOrEqual(3);
      });
    });

    it('should have starting equipment for all classes', () => {
      Object.values(CLASSES).forEach(charClass => {
        expect(charClass.startingEquipment).toBeDefined();
        expect(charClass.startingEquipment.length).toBeGreaterThan(0);

        charClass.startingEquipment.forEach(item => {
          expect(item).toHaveProperty('id');
          expect(item).toHaveProperty('name');
          expect(item).toHaveProperty('description');
          expect(item).toHaveProperty('weight');
          expect(item).toHaveProperty('value');
          expect(item).toHaveProperty('type');
          expect(item).toHaveProperty('usable');
        });
      });
    });

    it('should have starting gold for all classes', () => {
      Object.values(CLASSES).forEach(charClass => {
        expect(charClass.startingGold).toBeGreaterThan(0);
        expect(charClass.startingGold).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Fighter class', () => {
    it('should have correct attributes', () => {
      const fighter = CLASSES.fighter;
      expect(fighter.name).toBe('Fighter');
      expect(fighter.hitDie).toBe(10);
      expect(fighter.primaryAbilities).toContain('strength');
      expect(fighter.primaryAbilities).toContain('constitution');
    });

    it('should have martial starting equipment', () => {
      const fighter = CLASSES.fighter;
      const equipment = fighter.startingEquipment;

      const hasWeapon = equipment.some(item => item.type === 'weapon');
      const hasArmor = equipment.some(item => item.type === 'armor');

      expect(hasWeapon).toBe(true);
      expect(hasArmor).toBe(true);
    });
  });

  describe('Wizard class', () => {
    it('should have correct attributes', () => {
      const wizard = CLASSES.wizard;
      expect(wizard.name).toBe('Wizard');
      expect(wizard.hitDie).toBe(6); // Wizards have the lowest hit die
      expect(wizard.primaryAbilities).toContain('intelligence');
    });

    it('should have spellbook in equipment', () => {
      const wizard = CLASSES.wizard;
      const hasSpellbook = wizard.startingEquipment.some(item =>
        item.name.toLowerCase().includes('spellbook')
      );
      expect(hasSpellbook).toBe(true);
    });
  });

  describe('Rogue class', () => {
    it('should have correct attributes', () => {
      const rogue = CLASSES.rogue;
      expect(rogue.name).toBe('Rogue');
      expect(rogue.hitDie).toBe(8);
      expect(rogue.primaryAbilities).toContain('dexterity');
    });

    it('should have thieves tools in equipment', () => {
      const rogue = CLASSES.rogue;
      const hasTools = rogue.startingEquipment.some(item =>
        item.name.toLowerCase().includes('thieves') || item.name.toLowerCase().includes('tools')
      );
      expect(hasTools).toBe(true);
    });
  });

  describe('Cleric class', () => {
    it('should have correct attributes', () => {
      const cleric = CLASSES.cleric;
      expect(cleric.name).toBe('Cleric');
      expect(cleric.hitDie).toBe(8);
      expect(cleric.primaryAbilities).toContain('wisdom');
    });

    it('should have holy symbol in equipment', () => {
      const cleric = CLASSES.cleric;
      const hasSymbol = cleric.startingEquipment.some(item =>
        item.name.toLowerCase().includes('holy')
      );
      expect(hasSymbol).toBe(true);
    });
  });

  describe('Ranger class', () => {
    it('should have correct attributes', () => {
      const ranger = CLASSES.ranger;
      expect(ranger.name).toBe('Ranger');
      expect(ranger.hitDie).toBe(10);
      expect(ranger.primaryAbilities).toContain('dexterity');
      expect(ranger.primaryAbilities).toContain('wisdom');
    });

    it('should have ranged weapon in equipment', () => {
      const ranger = CLASSES.ranger;
      const hasBow = ranger.startingEquipment.some(item =>
        item.name.toLowerCase().includes('bow')
      );
      expect(hasBow).toBe(true);
    });
  });

  describe('Paladin class', () => {
    it('should have correct attributes', () => {
      const paladin = CLASSES.paladin;
      expect(paladin.name).toBe('Paladin');
      expect(paladin.hitDie).toBe(10);
      expect(paladin.primaryAbilities).toContain('strength');
      expect(paladin.primaryAbilities).toContain('charisma');
    });

    it('should have holy equipment', () => {
      const paladin = CLASSES.paladin;
      const hasHolyItem = paladin.startingEquipment.some(item =>
        item.name.toLowerCase().includes('holy') || item.description.toLowerCase().includes('holy')
      );
      expect(hasHolyItem).toBe(true);
    });
  });

  describe('getClass', () => {
    it('should return the correct class by name', () => {
      const fighter = getClass('fighter');
      expect(fighter).toBeDefined();
      expect(fighter?.name).toBe('Fighter');
    });

    it('should be case-insensitive', () => {
      const fighter1 = getClass('FIGHTER');
      const fighter2 = getClass('Fighter');
      const fighter3 = getClass('fighter');

      expect(fighter1).toBeDefined();
      expect(fighter2).toBeDefined();
      expect(fighter3).toBeDefined();
      expect(fighter1?.name).toBe('Fighter');
      expect(fighter2?.name).toBe('Fighter');
      expect(fighter3?.name).toBe('Fighter');
    });

    it('should return undefined for invalid class names', () => {
      const invalid = getClass('barbarian');
      expect(invalid).toBeUndefined();
    });
  });

  describe('getAllClasses', () => {
    it('should return all 6 classes', () => {
      const classes = getAllClasses();
      expect(classes).toHaveLength(6);
    });

    it('should return class objects with all properties', () => {
      const classes = getAllClasses();
      classes.forEach(charClass => {
        expect(charClass).toHaveProperty('name');
        expect(charClass).toHaveProperty('description');
        expect(charClass).toHaveProperty('hitDie');
        expect(charClass).toHaveProperty('primaryAbilities');
        expect(charClass).toHaveProperty('startingEquipment');
        expect(charClass).toHaveProperty('startingGold');
      });
    });
  });

  describe('getClassNames', () => {
    it('should return all class names', () => {
      const names = getClassNames();
      expect(names).toHaveLength(6);
      expect(names).toContain('fighter');
      expect(names).toContain('wizard');
      expect(names).toContain('rogue');
      expect(names).toContain('cleric');
      expect(names).toContain('ranger');
      expect(names).toContain('paladin');
    });
  });
});
