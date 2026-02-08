/**
 * Command parser - converts text input into GameAction objects
 */

import type { GameAction, GameState } from '../types';

type ParseResult =
  | { ok: true; action: GameAction }
  | { ok: false; error: string };

/**
 * Normalize raw input: trim, lowercase, collapse whitespace
 */
function normalize(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Try to find an NPC ID by matching a name fragment against NPCs in the current location.
 * Returns the NPC id or undefined.
 */
function findNpcId(
  nameFragment: string,
  state: GameState
): string | undefined {
  const location = state.locations[state.currentLocationId];
  if (!location) return undefined;

  const fragment = nameFragment.toLowerCase();

  // First try exact NPC id match
  if (location.npcs.includes(fragment)) return fragment;

  // Then try matching against NPC names
  for (const npcId of location.npcs) {
    const npc = state.npcs[npcId];
    if (npc && npc.name.toLowerCase().includes(fragment)) {
      return npcId;
    }
  }

  // Also try matching by converting the fragment to a potential id (spaces -> hyphens)
  const asId = fragment.replace(/\s+/g, '-');
  if (location.npcs.includes(asId)) return asId;

  return undefined;
}

/**
 * Try to find an item ID by matching a name fragment against items in the current location.
 */
function findLocationItemId(
  nameFragment: string,
  state: GameState
): string | undefined {
  const location = state.locations[state.currentLocationId];
  if (!location) return undefined;

  const fragment = nameFragment.toLowerCase();

  for (const item of location.items) {
    if (
      item.id.toLowerCase() === fragment ||
      item.name.toLowerCase().includes(fragment)
    ) {
      return item.id;
    }
  }
  return undefined;
}

/**
 * Try to find an item ID by matching a name fragment against the player's inventory.
 */
function findInventoryItemId(
  nameFragment: string,
  state: GameState
): string | undefined {
  const fragment = nameFragment.toLowerCase();

  for (const item of state.character.inventory.items) {
    if (
      item.id.toLowerCase() === fragment ||
      item.name.toLowerCase().includes(fragment)
    ) {
      return item.id;
    }
  }
  return undefined;
}

/**
 * Find an enemy ID in combat by name fragment
 */
function findEnemyId(
  nameFragment: string,
  state: GameState
): string | undefined {
  if (!state.combat.active) return undefined;

  const fragment = nameFragment.toLowerCase();

  for (const enemy of state.combat.enemies) {
    if (
      enemy.id.toLowerCase() === fragment ||
      enemy.name.toLowerCase().includes(fragment)
    ) {
      return enemy.id;
    }
  }
  return undefined;
}

const DIRECTION_ALIASES: Record<string, string> = {
  n: 'north',
  s: 'south',
  e: 'east',
  w: 'west',
  u: 'up',
  d: 'down',
};

const VALID_DIRECTIONS = new Set([
  'north',
  'south',
  'east',
  'west',
  'up',
  'down',
]);

/**
 * Parse a text command into a GameAction.
 *
 * Supported commands:
 *   go/move/walk <direction> | n/s/e/w/u/d | north/south/east/west/up/down
 *   talk/speak <npc name>
 *   take/get/pick up/grab <item name>
 *   drop <item name>
 *   use/drink/eat <item name>
 *   attack/hit/fight/kill <target name>
 *   defend/block/parry
 *   flee/run/escape
 *   buy/purchase <item name> from <npc name>
 *   sell <item name> to <npc name>
 *   rest/sleep/camp
 *   look/examine/inspect (returns LOOK pseudo-action)
 *   inventory/items/i (returns INVENTORY pseudo-action)
 *   stats/character/status (returns STATS pseudo-action)
 *   save (returns SAVE_GAME)
 */
export function parseCommand(
  input: string,
  state: GameState
): ParseResult {
  const raw = normalize(input);

  if (!raw) {
    return { ok: false, error: 'Please enter a command.' };
  }

  // --- Dialogue option selection (when in a conversation) ---
  if (state.activeDialogue) {
    // Accept bare numbers: "1", "2", "3"
    const numMatch = raw.match(/^(\d+)$/);
    if (numMatch) {
      return { ok: true, action: { type: 'DIALOGUE_SELECT', optionIndex: parseInt(numMatch[1], 10) - 1 } };
    }
    // Accept "reply 1", "choose 2", "select 3", "say 1", "option 2"
    const replyMatch = raw.match(/^(?:reply|choose|select|say|option|pick)\s+(\d+)$/);
    if (replyMatch) {
      return { ok: true, action: { type: 'DIALOGUE_SELECT', optionIndex: parseInt(replyMatch[1], 10) - 1 } };
    }
    // Allow "leave", "bye", "goodbye", "exit" to end the conversation
    if (['leave', 'bye', 'goodbye', 'exit', 'back'].includes(raw)) {
      return { ok: true, action: { type: 'DIALOGUE_SELECT', optionIndex: -1 } };
    }
    // Fall through to other commands — player can still move, look, etc. while in dialogue
  }

  const parts = raw.split(' ');
  const verb = parts[0];
  const rest = parts.slice(1).join(' ');

  // --- Direction shortcuts (single letter or bare direction word) ---
  if (DIRECTION_ALIASES[verb]) {
    return { ok: true, action: { type: 'MOVE', direction: DIRECTION_ALIASES[verb] } };
  }
  if (VALID_DIRECTIONS.has(verb) && parts.length === 1) {
    return { ok: true, action: { type: 'MOVE', direction: verb } };
  }

  // --- Movement ---
  if (['go', 'move', 'walk'].includes(verb)) {
    if (!rest) {
      return { ok: false, error: 'Where do you want to go? Specify a direction (north, south, east, west, up, down).' };
    }
    const dir = DIRECTION_ALIASES[rest] ?? rest;
    if (!VALID_DIRECTIONS.has(dir)) {
      return { ok: false, error: `"${rest}" is not a valid direction. Try: north, south, east, west, up, down.` };
    }
    return { ok: true, action: { type: 'MOVE', direction: dir } };
  }

  // --- Talk ---
  if (['talk', 'speak', 'chat'].includes(verb)) {
    const target = rest.replace(/^(to|with)\s+/, '');
    if (!target) {
      return { ok: false, error: 'Who do you want to talk to?' };
    }
    const npcId = findNpcId(target, state);
    if (!npcId) {
      return { ok: false, error: `There is no one called "${target}" here.` };
    }
    return { ok: true, action: { type: 'TALK', npcId } };
  }

  // --- Take / Get ---
  if (['take', 'get', 'grab', 'pickup'].includes(verb)) {
    const itemName = rest;
    if (!itemName) {
      return { ok: false, error: 'What do you want to take?' };
    }
    const itemId = findLocationItemId(itemName, state);
    if (!itemId) {
      return { ok: false, error: `There is no "${itemName}" here to take.` };
    }
    return { ok: true, action: { type: 'TAKE', itemId } };
  }

  // "pick up X"
  if (verb === 'pick' && parts[1] === 'up') {
    const itemName = parts.slice(2).join(' ');
    if (!itemName) {
      return { ok: false, error: 'What do you want to pick up?' };
    }
    const itemId = findLocationItemId(itemName, state);
    if (!itemId) {
      return { ok: false, error: `There is no "${itemName}" here to pick up.` };
    }
    return { ok: true, action: { type: 'TAKE', itemId } };
  }

  // --- Drop ---
  if (verb === 'drop') {
    if (!rest) {
      return { ok: false, error: 'What do you want to drop?' };
    }
    const itemId = findInventoryItemId(rest, state);
    if (!itemId) {
      return { ok: false, error: `You don't have "${rest}" in your inventory.` };
    }
    return { ok: true, action: { type: 'DROP', itemId } };
  }

  // --- Use ---
  if (['use', 'drink', 'eat', 'consume', 'quaff'].includes(verb)) {
    if (!rest) {
      return { ok: false, error: 'What do you want to use?' };
    }
    const itemId = findInventoryItemId(rest, state);
    if (!itemId) {
      return { ok: false, error: `You don't have "${rest}" in your inventory.` };
    }
    return { ok: true, action: { type: 'USE', itemId } };
  }

  // --- Attack ---
  if (['attack', 'hit', 'fight', 'kill', 'strike'].includes(verb)) {
    if (state.combat.active) {
      // In combat - find the target enemy
      if (!rest) {
        // Default to first enemy
        if (state.combat.enemies.length > 0) {
          return { ok: true, action: { type: 'ATTACK', targetId: state.combat.enemies[0].id } };
        }
        return { ok: false, error: 'There are no enemies to attack.' };
      }
      const enemyId = findEnemyId(rest, state);
      if (!enemyId) {
        return { ok: false, error: `There is no enemy called "${rest}".` };
      }
      return { ok: true, action: { type: 'ATTACK', targetId: enemyId } };
    } else {
      // Not in combat - try to attack an NPC in the location
      if (!rest) {
        return { ok: false, error: 'Who do you want to attack?' };
      }
      const npcId = findNpcId(rest, state);
      if (!npcId) {
        return { ok: false, error: `There is no "${rest}" here to attack.` };
      }
      return { ok: true, action: { type: 'ATTACK', targetId: npcId } };
    }
  }

  // --- Defend ---
  if (['defend', 'block', 'parry', 'guard'].includes(verb)) {
    return { ok: true, action: { type: 'DEFEND' } };
  }

  // --- Flee ---
  if (['flee', 'run', 'escape', 'retreat'].includes(verb)) {
    return { ok: true, action: { type: 'FLEE' } };
  }

  // --- Buy ---
  if (['buy', 'purchase'].includes(verb)) {
    if (!rest) {
      return { ok: false, error: 'What do you want to buy?' };
    }
    // Try "buy <item> from <npc>"
    const fromMatch = rest.match(/^(.+?)\s+from\s+(.+)$/);
    if (fromMatch) {
      const [, itemName, npcName] = fromMatch;
      const npcId = findNpcId(npcName, state);
      if (!npcId) {
        return { ok: false, error: `There is no "${npcName}" here to buy from.` };
      }
      const npc = state.npcs[npcId];
      if (!npc?.shop) {
        return { ok: false, error: `${npc?.name ?? npcName} doesn't sell anything.` };
      }
      // Find item in shop
      const shopItem = npc.shop.items.find(
        i => i.name.toLowerCase().includes(itemName) || i.id.toLowerCase() === itemName
      );
      if (!shopItem) {
        return { ok: false, error: `"${itemName}" is not available for purchase.` };
      }
      return { ok: true, action: { type: 'BUY', itemId: shopItem.id, npcId } };
    }
    // No "from" - find the first shop NPC at the location
    const location = state.locations[state.currentLocationId];
    const shopNpcId = location?.npcs.find(id => state.npcs[id]?.shop);
    if (!shopNpcId) {
      return { ok: false, error: 'There is no one here to buy from.' };
    }
    const npc = state.npcs[shopNpcId];
    const shopItem = npc?.shop?.items.find(
      i => i.name.toLowerCase().includes(rest) || i.id.toLowerCase() === rest
    );
    if (!shopItem) {
      return { ok: false, error: `"${rest}" is not available for purchase.` };
    }
    return { ok: true, action: { type: 'BUY', itemId: shopItem.id, npcId: shopNpcId } };
  }

  // --- Sell ---
  if (verb === 'sell') {
    if (!rest) {
      return { ok: false, error: 'What do you want to sell?' };
    }
    // Try "sell <item> to <npc>"
    const toMatch = rest.match(/^(.+?)\s+to\s+(.+)$/);
    if (toMatch) {
      const [, itemName, npcName] = toMatch;
      const npcId = findNpcId(npcName, state);
      if (!npcId) {
        return { ok: false, error: `There is no "${npcName}" here to sell to.` };
      }
      const itemId = findInventoryItemId(itemName, state);
      if (!itemId) {
        return { ok: false, error: `You don't have "${itemName}" in your inventory.` };
      }
      return { ok: true, action: { type: 'SELL', itemId, npcId } };
    }
    // No "to" - find the first shop NPC at the location
    const location = state.locations[state.currentLocationId];
    const shopNpcId = location?.npcs.find(id => state.npcs[id]?.shop);
    if (!shopNpcId) {
      return { ok: false, error: 'There is no one here to sell to.' };
    }
    const itemId = findInventoryItemId(rest, state);
    if (!itemId) {
      return { ok: false, error: `You don't have "${rest}" in your inventory.` };
    }
    return { ok: true, action: { type: 'SELL', itemId, npcId: shopNpcId } };
  }

  // --- Rest ---
  if (['rest', 'sleep', 'camp'].includes(verb)) {
    return { ok: true, action: { type: 'REST' } };
  }

  // --- Look ---
  if (['look', 'examine', 'inspect', 'l'].includes(verb)) {
    return { ok: true, action: { type: 'LOOK' } };
  }

  // --- Inventory ---
  if (['inventory', 'items', 'i'].includes(verb)) {
    return { ok: true, action: { type: 'INVENTORY' } };
  }

  // --- Stats ---
  if (['stats', 'character', 'status', 'char'].includes(verb)) {
    return { ok: true, action: { type: 'STATS' } };
  }

  // --- Save ---
  if (verb === 'save') {
    return { ok: true, action: { type: 'SAVE_GAME' } };
  }

  // --- Help ---
  if (['help', '?'].includes(verb)) {
    return {
      ok: false,
      error: 'Commands: go/north/n, look, talk, take, drop, use, attack, defend, flee, buy, sell, rest, inventory/i, stats, save, help.',
    };
  }

  // Unknown command
  return {
    ok: false,
    error: `Unknown command: "${raw}". Try: go, talk, take, drop, use, attack, defend, flee, buy, sell, rest, look, inventory, stats, save.`,
  };
}
