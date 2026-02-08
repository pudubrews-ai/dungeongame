/**
 * Core game types for the D&D-style text adventure
 */

export type AbilityScores = {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
};

export type AbilityModifiers = {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
};

export type Inventory = {
  items: Item[];
  maxWeight: number;
  currentWeight: number;
};

export type Item = {
  id: string;
  name: string;
  description: string;
  weight: number;
  value: number;
  type: 'weapon' | 'armor' | 'potion' | 'treasure' | 'quest' | 'misc';
  usable: boolean;
};

export type Character = {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  experience: number;
  hitPoints: {
    current: number;
    max: number;
  };
  abilityScores: AbilityScores;
  abilityModifiers: AbilityModifiers;
  inventory: Inventory;
  gold: number;
  armorClass: number;
};

export type Location = {
  id: string;
  name: string;
  description: string;
  connections: {
    north?: string;
    south?: string;
    east?: string;
    west?: string;
    up?: string;
    down?: string;
  };
  npcs: string[]; // NPC IDs
  items: Item[];
  visited: boolean;
};

export type NPC = {
  id: string;
  name: string;
  description: string;
  dialogue: DialogueNode[];
  hostile: boolean;
  stats?: {
    hitPoints: number;
    armorClass: number;
    attackBonus: number;
    damage: string;
  };
  questGiver?: boolean;
  shop?: ShopInventory;
};

export type DialogueNode = {
  id: string;
  text: string;
  options: DialogueOption[];
  condition?: (gameState: GameState) => boolean;
};

export type DialogueOption = {
  text: string;
  nextNodeId?: string;
  action?: (gameState: GameState) => GameState;
  requiresCheck?: {
    ability: keyof AbilityScores;
    dc: number;
  };
};

export type ShopInventory = {
  items: Item[];
  buyMultiplier: number; // e.g., 1.5 means shop sells at 150% value
  sellMultiplier: number; // e.g., 0.5 means shop buys at 50% value
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards: {
    experience: number;
    gold?: number;
    items?: Item[];
  };
  status: 'available' | 'active' | 'completed' | 'failed';
};

export type QuestObjective = {
  id: string;
  description: string;
  completed: boolean;
  type: 'kill' | 'collect' | 'talk' | 'explore' | 'deliver';
  target?: string;
  count?: number;
  currentCount?: number;
};

export type CombatState = {
  active: boolean;
  enemies: NPC[];
  enemyMaxHPs: Record<string, number>; // original max HP keyed by enemy ID
  totalEnemyCount: number; // enemies at start of combat (for reward calc)
  turnOrder: string[]; // IDs of combatants
  currentTurnIndex: number;
  round: number;
};

export type ActiveDialogue = {
  npcId: string;
  currentNodeId: string;
};

export type GameState = {
  character: Character;
  currentLocationId: string;
  locations: Record<string, Location>;
  npcs: Record<string, NPC>;
  quests: Quest[];
  combat: CombatState;
  activeDialogue: ActiveDialogue | null;
  gameLog: LogEntry[];
  timestamp: number;
};

export type LogEntry = {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'combat' | 'dialogue';
};

export type GameAction =
  | { type: 'MOVE'; direction: string }
  | { type: 'TALK'; npcId: string }
  | { type: 'DIALOGUE_SELECT'; optionIndex: number }
  | { type: 'TAKE'; itemId: string }
  | { type: 'USE'; itemId: string }
  | { type: 'DROP'; itemId: string }
  | { type: 'ATTACK'; targetId: string }
  | { type: 'DEFEND' }
  | { type: 'FLEE' }
  | { type: 'BUY'; itemId: string; npcId: string }
  | { type: 'SELL'; itemId: string; npcId: string }
  | { type: 'REST' }
  | { type: 'LOOK' }
  | { type: 'INVENTORY' }
  | { type: 'STATS' }
  | { type: 'SAVE_GAME' }
  | { type: 'LOAD_GAME'; saveId: string };
