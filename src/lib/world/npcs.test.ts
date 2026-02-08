import { describe, it, expect } from 'vitest';
import {
  NPCS,
  getNPC,
  getAllNPCs,
  getDialogueNode,
  getStartingDialogue,
  isHostile,
  initializeNPCs,
  villageGuard,
  merchant,
  mayor,
  bartender,
  skeletonWarrior,
  dungeonBoss,
} from './npcs';

describe('npcs', () => {
  describe('NPCS constant', () => {
    it('should have all required NPCs', () => {
      expect(NPCS['village-guard']).toBeDefined();
      expect(NPCS['merchant']).toBeDefined();
      expect(NPCS['mayor']).toBeDefined();
      expect(NPCS['town-clerk']).toBeDefined();
      expect(NPCS['shopkeeper']).toBeDefined();
      expect(NPCS['bartender']).toBeDefined();
      expect(NPCS['mysterious-stranger']).toBeDefined();
      expect(NPCS['hermit']).toBeDefined();
      expect(NPCS['ruins-guardian']).toBeDefined();
      expect(NPCS['skeleton-warrior']).toBeDefined();
      expect(NPCS['dungeon-boss']).toBeDefined();
    });

    it('should have valid structure for all NPCs', () => {
      Object.values(NPCS).forEach(npc => {
        expect(npc).toHaveProperty('id');
        expect(npc).toHaveProperty('name');
        expect(npc).toHaveProperty('description');
        expect(npc).toHaveProperty('dialogue');
        expect(npc).toHaveProperty('hostile');

        expect(npc.name.length).toBeGreaterThan(0);
        expect(npc.description.length).toBeGreaterThan(10);
        expect(Array.isArray(npc.dialogue)).toBe(true);
        expect(typeof npc.hostile).toBe('boolean');
      });
    });

    it('should have dialogue nodes for non-hostile NPCs', () => {
      Object.values(NPCS).forEach(npc => {
        if (!npc.hostile) {
          expect(npc.dialogue.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have valid dialogue structure', () => {
      Object.values(NPCS).forEach(npc => {
        npc.dialogue.forEach(node => {
          expect(node).toHaveProperty('id');
          expect(node).toHaveProperty('text');
          expect(node).toHaveProperty('options');

          expect(node.id.length).toBeGreaterThan(0);
          expect(node.text.length).toBeGreaterThan(0);
          expect(Array.isArray(node.options)).toBe(true);

          node.options.forEach(option => {
            expect(option).toHaveProperty('text');
            expect(option.text.length).toBeGreaterThan(0);
          });
        });
      });
    });

    it('should have combat stats for hostile NPCs', () => {
      Object.values(NPCS).forEach(npc => {
        if (npc.hostile) {
          expect(npc.stats).toBeDefined();
          expect(npc.stats?.hitPoints).toBeGreaterThan(0);
          expect(npc.stats?.armorClass).toBeGreaterThan(0);
          expect(npc.stats?.attackBonus).toBeDefined();
          expect(npc.stats?.damage).toBeDefined();
          expect(npc.stats?.damage).toMatch(/\d+d\d+[+-]?\d*/);
        }
      });
    });
  });

  describe('Village Guard', () => {
    it('should be non-hostile', () => {
      expect(villageGuard.hostile).toBe(false);
    });

    it('should have greeting dialogue', () => {
      const greeting = getStartingDialogue(villageGuard);
      expect(greeting).toBeDefined();
      expect(greeting?.id).toBe('greeting');
    });

    it('should have multiple dialogue options', () => {
      const greeting = getStartingDialogue(villageGuard);
      expect(greeting?.options.length).toBeGreaterThanOrEqual(2);
    });

    it('should have connected dialogue nodes', () => {
      const greeting = villageGuard.dialogue.find(n => n.id === 'greeting');
      expect(greeting).toBeDefined();

      const firstOption = greeting?.options[0];
      if (firstOption?.nextNodeId) {
        const nextNode = getDialogueNode(villageGuard, firstOption.nextNodeId);
        expect(nextNode).toBeDefined();
      }
    });
  });

  describe('Merchant', () => {
    it('should be non-hostile', () => {
      expect(merchant.hostile).toBe(false);
    });

    it('should provide information about shops and village', () => {
      const hasShopInfo = merchant.dialogue.some(node =>
        node.text.toLowerCase().includes('shop')
      );
      const hasVillageInfo = merchant.dialogue.some(node =>
        node.text.toLowerCase().includes('village')
      );

      expect(hasShopInfo).toBe(true);
      expect(hasVillageInfo).toBe(true);
    });
  });

  describe('Mayor', () => {
    it('should be non-hostile', () => {
      expect(mayor.hostile).toBe(false);
    });

    it('should be a quest giver', () => {
      expect(mayor.questGiver).toBe(true);
    });

    it('should offer quests', () => {
      const hasQuestDialogue = mayor.dialogue.some(node =>
        node.text.toLowerCase().includes('quest') ||
        node.text.toLowerCase().includes('help') ||
        node.text.toLowerCase().includes('troubles')
      );
      expect(hasQuestDialogue).toBe(true);
    });

    it('should mention rewards', () => {
      const hasRewards = mayor.dialogue.some(node =>
        node.text.toLowerCase().includes('gold') || node.text.toLowerCase().includes('reward')
      );
      expect(hasRewards).toBe(true);
    });
  });

  describe('Bartender', () => {
    it('should be non-hostile', () => {
      expect(bartender.hostile).toBe(false);
    });

    it('should offer rumors', () => {
      const hasRumors = bartender.dialogue.some(node =>
        node.id.includes('rumor') ||
        node.text.toLowerCase().includes('rumor') ||
        node.options.some(opt => opt.text.toLowerCase().includes('rumor'))
      );
      expect(hasRumors).toBe(true);
    });

    it('should offer room rental', () => {
      const hasRooms = bartender.dialogue.some(node =>
        node.text.toLowerCase().includes('room')
      );
      expect(hasRooms).toBe(true);
    });
  });

  describe('Skeleton Warrior', () => {
    it('should be hostile', () => {
      expect(skeletonWarrior.hostile).toBe(true);
    });

    it('should have combat stats', () => {
      expect(skeletonWarrior.stats).toBeDefined();
      expect(skeletonWarrior.stats?.hitPoints).toBeGreaterThan(0);
      expect(skeletonWarrior.stats?.armorClass).toBeGreaterThan(0);
    });

    it('should have appropriate difficulty for early game', () => {
      expect(skeletonWarrior.stats?.hitPoints).toBeLessThanOrEqual(30);
      expect(skeletonWarrior.stats?.armorClass).toBeLessThanOrEqual(15);
    });
  });

  describe('Dungeon Boss', () => {
    it('should be hostile', () => {
      expect(dungeonBoss.hostile).toBe(true);
    });

    it('should have higher stats than regular enemies', () => {
      expect(dungeonBoss.stats?.hitPoints).toBeGreaterThan(30);
      expect(dungeonBoss.stats?.armorClass).toBeGreaterThan(14);
      expect(dungeonBoss.stats?.attackBonus).toBeGreaterThan(4);
    });

    it('should have pre-combat dialogue', () => {
      const encounter = dungeonBoss.dialogue.find(n => n.id === 'encounter');
      expect(encounter).toBeDefined();
      expect(encounter?.options.length).toBeGreaterThan(0);
    });
  });

  describe('getNPC', () => {
    it('should return NPC by ID', () => {
      const guard = getNPC('village-guard');
      expect(guard).toBeDefined();
      expect(guard?.id).toBe('village-guard');
    });

    it('should return undefined for invalid ID', () => {
      const invalid = getNPC('nonexistent-npc');
      expect(invalid).toBeUndefined();
    });
  });

  describe('getAllNPCs', () => {
    it('should return all NPCs', () => {
      const npcs = getAllNPCs();
      expect(npcs.length).toBeGreaterThanOrEqual(10);
    });

    it('should return NPC objects', () => {
      const npcs = getAllNPCs();
      npcs.forEach(npc => {
        expect(npc).toHaveProperty('id');
        expect(npc).toHaveProperty('name');
        expect(npc).toHaveProperty('dialogue');
      });
    });
  });

  describe('getDialogueNode', () => {
    it('should return dialogue node by ID', () => {
      const greeting = getDialogueNode(villageGuard, 'greeting');
      expect(greeting).toBeDefined();
      expect(greeting?.id).toBe('greeting');
    });

    it('should return undefined for invalid node ID', () => {
      const invalid = getDialogueNode(villageGuard, 'nonexistent');
      expect(invalid).toBeUndefined();
    });
  });

  describe('getStartingDialogue', () => {
    it('should return greeting for non-hostile NPCs', () => {
      const starting = getStartingDialogue(villageGuard);
      expect(starting).toBeDefined();
      expect(starting?.id).toBe('greeting');
    });

    it('should return encounter or combat for hostile NPCs', () => {
      const starting = getStartingDialogue(dungeonBoss);
      expect(starting).toBeDefined();
      expect(['encounter', 'combat', 'greeting']).toContain(starting?.id);
    });
  });

  describe('isHostile', () => {
    it('should return true for hostile NPCs', () => {
      expect(isHostile(skeletonWarrior)).toBe(true);
      expect(isHostile(dungeonBoss)).toBe(true);
    });

    it('should return false for non-hostile NPCs', () => {
      expect(isHostile(villageGuard)).toBe(false);
      expect(isHostile(merchant)).toBe(false);
      expect(isHostile(mayor)).toBe(false);
    });
  });

  describe('initializeNPCs', () => {
    it('should create a copy of all NPCs', () => {
      const npcs = initializeNPCs();
      expect(Object.keys(npcs).length).toBe(Object.keys(NPCS).length);
    });

    it('should create deep copies', () => {
      const npcs = initializeNPCs();

      // Modify the copy
      npcs['village-guard'].dialogue = [];
      if (npcs['skeleton-warrior'].stats) {
        npcs['skeleton-warrior'].stats.hitPoints = 999;
      }

      // Original should be unchanged
      expect(NPCS['village-guard'].dialogue.length).toBeGreaterThan(0);
      expect(NPCS['skeleton-warrior'].stats?.hitPoints).not.toBe(999);
    });

    it('should preserve all NPC properties', () => {
      const npcs = initializeNPCs();

      Object.values(npcs).forEach(npc => {
        expect(npc).toHaveProperty('id');
        expect(npc).toHaveProperty('name');
        expect(npc).toHaveProperty('description');
        expect(npc).toHaveProperty('dialogue');
        expect(npc).toHaveProperty('hostile');
      });
    });
  });

  describe('Dialogue chains', () => {
    it('should have valid dialogue chains for complex NPCs', () => {
      // Test mayor's quest dialogue chain
      const greeting = getDialogueNode(mayor, 'greeting');
      expect(greeting).toBeDefined();

      const firstOption = greeting?.options[0];
      if (firstOption?.nextNodeId) {
        const nextNode = getDialogueNode(mayor, firstOption.nextNodeId);
        expect(nextNode).toBeDefined();
      }
    });

    it('should allow terminating dialogue', () => {
      const allNPCs = getAllNPCs();

      allNPCs.forEach(npc => {
        if (!npc.hostile) {
          const hasExitOption = npc.dialogue.some(node =>
            node.options.some(option => option.nextNodeId === undefined)
          );
          expect(hasExitOption).toBe(true);
        }
      });
    });

    it('should not have broken dialogue links', () => {
      const allNPCs = getAllNPCs();

      allNPCs.forEach(npc => {
        npc.dialogue.forEach(node => {
          node.options.forEach(option => {
            if (option.nextNodeId) {
              const nextNode = getDialogueNode(npc, option.nextNodeId);
              expect(nextNode).toBeDefined();
            }
          });
        });
      });
    });
  });

  describe('NPC distribution', () => {
    it('should have mix of hostile and non-hostile NPCs', () => {
      const allNPCs = getAllNPCs();
      const hostile = allNPCs.filter(npc => npc.hostile);
      const friendly = allNPCs.filter(npc => !npc.hostile);

      expect(hostile.length).toBeGreaterThan(0);
      expect(friendly.length).toBeGreaterThan(0);
      expect(friendly.length).toBeGreaterThan(hostile.length); // More friendly than hostile
    });

    it('should have at least one quest giver', () => {
      const questGivers = getAllNPCs().filter(npc => npc.questGiver);
      expect(questGivers.length).toBeGreaterThanOrEqual(1);
    });

    it('should have at least one shopkeeper', () => {
      const shopkeepers = getAllNPCs().filter(npc => npc.shop);
      expect(shopkeepers.length).toBeGreaterThanOrEqual(1);
    });
  });
});
