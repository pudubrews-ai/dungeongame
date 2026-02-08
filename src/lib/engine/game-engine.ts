/**
 * Game state reducer - processes GameAction objects and returns new GameState
 */

import type { GameState, GameAction } from '../types';
import {
  healCharacter,
  damageCharacter,
  awardExperience,
  isAlive,
} from '../game/character';
import { rollDice } from '../game/dice';
import {
  initiateCombat,
  characterAttack,
  enemyAttack,
  attemptFlee,
  updateEnemyHP,
  shouldEndCombat,
  endCombat,
  getCurrentCombatant,
  isPlayerTurn,
  nextTurn,
} from '../game/combat';
import {
  getConnectedLocation,
  getAvailableDirections,
} from '../world/locations';
import { getStartingDialogue, getDialogueNode, isHostile } from '../world/npcs';
import { createLogEntry } from './game-init';

/**
 * Safe location IDs where the player can rest
 */
const REST_LOCATIONS = new Set(['tavern-rooms', 'forest-clearing']);

/**
 * Process a game action and return a new game state (reducer pattern).
 */
export function processAction(
  state: GameState,
  action: GameAction
): GameState {
  // Character dead check
  if (!isAlive(state.character) && action.type !== 'LOAD_GAME') {
    return addLog(state, 'You are dead. Your adventure is over.', 'error');
  }

  switch (action.type) {
    case 'MOVE':
      return handleMove(state, action.direction);
    case 'TALK':
      return handleTalk(state, action.npcId);
    case 'DIALOGUE_SELECT':
      return handleDialogueSelect(state, action.optionIndex);
    case 'TAKE':
      return handleTake(state, action.itemId);
    case 'DROP':
      return handleDrop(state, action.itemId);
    case 'USE':
      return handleUse(state, action.itemId);
    case 'ATTACK':
      return handleAttack(state, action.targetId);
    case 'DEFEND':
      return handleDefend(state);
    case 'FLEE':
      return handleFlee(state);
    case 'BUY':
      return handleBuy(state, action.itemId, action.npcId);
    case 'SELL':
      return handleSell(state, action.itemId, action.npcId);
    case 'REST':
      return handleRest(state);
    case 'LOOK':
      return handleLook(state);
    case 'INVENTORY':
      return handleInventory(state);
    case 'STATS':
      return handleStats(state);
    case 'SAVE_GAME':
      return addLog(state, 'Game saved.', 'success');
    case 'LOAD_GAME':
      return addLog(state, 'Game loaded.', 'success');
  }
}

// ---- Helpers ----

function addLog(
  state: GameState,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' | 'combat' | 'dialogue' = 'info'
): GameState {
  return {
    ...state,
    gameLog: [...state.gameLog, createLogEntry(message, type)],
    timestamp: Date.now(),
  };
}

// ---- Action handlers ----

function handleMove(state: GameState, direction: string): GameState {
  if (state.combat.active) {
    return addLog(state, 'You cannot move while in combat! Try to flee instead.', 'warning');
  }

  // End any active dialogue when moving
  if (state.activeDialogue) {
    state = { ...state, activeDialogue: null };
  }

  const currentLocation = state.locations[state.currentLocationId];
  const targetLocationId = getConnectedLocation(currentLocation, direction);

  if (!targetLocationId) {
    const available = getAvailableDirections(currentLocation);
    return addLog(
      state,
      `You cannot go ${direction}. Available directions: ${available.join(', ')}.`,
      'warning'
    );
  }

  const targetLocation = state.locations[targetLocationId];
  if (!targetLocation) {
    return addLog(state, 'That path leads nowhere.', 'error');
  }

  // Update locations: mark target as visited
  const updatedLocations = {
    ...state.locations,
    [targetLocationId]: { ...targetLocation, visited: true },
  };

  let newState: GameState = {
    ...state,
    currentLocationId: targetLocationId,
    locations: updatedLocations,
  };

  newState = addLog(newState, targetLocation.description, 'info');

  // List items on the ground
  if (targetLocation.items.length > 0) {
    const itemNames = targetLocation.items.map(i => i.name).join(', ');
    newState = addLog(newState, `You see on the ground: ${itemNames}.`, 'info');
  }

  // Check for hostile NPCs -> auto-initiate combat
  const hostileNpcIds = targetLocation.npcs.filter(npcId => {
    const npc = newState.npcs[npcId];
    return npc && isHostile(npc) && npc.stats && npc.stats.hitPoints > 0;
  });

  if (hostileNpcIds.length > 0) {
    const hostileNpcs = hostileNpcIds.map(id => newState.npcs[id]);
    const names = hostileNpcs.map(n => n.name).join(', ');
    newState = addLog(newState, `${names} attacks you!`, 'combat');
    const combatState = initiateCombat(newState.character, hostileNpcs);
    newState = { ...newState, combat: combatState };

    // If it's not the player's turn, run enemy turns
    newState = runEnemyTurns(newState);
  } else {
    // List friendly NPCs
    const friendlyNpcs = targetLocation.npcs
      .map(id => newState.npcs[id])
      .filter(n => n && !n.hostile);
    if (friendlyNpcs.length > 0) {
      const npcNames = friendlyNpcs.map(n => n.name).join(', ');
      newState = addLog(newState, `You see: ${npcNames}.`, 'info');
    }
  }

  return newState;
}

function handleTalk(state: GameState, npcId: string): GameState {
  if (state.combat.active) {
    return addLog(state, 'You cannot talk while in combat!', 'warning');
  }

  const npc = state.npcs[npcId];
  if (!npc) {
    return addLog(state, 'That person does not exist.', 'error');
  }

  const location = state.locations[state.currentLocationId];
  if (!location.npcs.includes(npcId)) {
    return addLog(state, `${npc.name} is not here.`, 'warning');
  }

  if (isHostile(npc)) {
    return addLog(state, `${npc.name} is hostile and won't talk to you!`, 'warning');
  }

  const startDialogue = getStartingDialogue(npc);
  if (!startDialogue) {
    return addLog(state, `${npc.name} has nothing to say.`, 'info');
  }

  let newState = addLog(state, `${npc.name}: "${startDialogue.text}"`, 'dialogue');

  if (startDialogue.options.length > 0) {
    const optionTexts = startDialogue.options
      .map((opt, i) => `  ${i + 1}. ${opt.text}`)
      .join('\n');
    newState = addLog(newState, optionTexts, 'dialogue');
    // Enter dialogue mode
    newState = { ...newState, activeDialogue: { npcId, currentNodeId: startDialogue.id } };
  }

  return newState;
}

function handleDialogueSelect(state: GameState, optionIndex: number): GameState {
  if (!state.activeDialogue) {
    return addLog(state, 'You are not in a conversation.', 'warning');
  }

  const { npcId, currentNodeId } = state.activeDialogue;
  const npc = state.npcs[npcId];
  if (!npc) {
    return { ...state, activeDialogue: null };
  }

  // "leave" / "bye" → end conversation
  if (optionIndex === -1) {
    let newState = addLog(state, `You end the conversation with ${npc.name}.`, 'info');
    return { ...newState, activeDialogue: null };
  }

  const currentNode = getDialogueNode(npc, currentNodeId);
  if (!currentNode) {
    return { ...addLog(state, `${npc.name} has nothing more to say.`, 'info'), activeDialogue: null };
  }

  if (optionIndex < 0 || optionIndex >= currentNode.options.length) {
    return addLog(state, `Choose a number between 1 and ${currentNode.options.length}, or type "leave" to end the conversation.`, 'warning');
  }

  const option = currentNode.options[optionIndex];
  let newState = addLog(state, `You: "${option.text}"`, 'dialogue');

  // Handle ability check if required
  if (option.requiresCheck) {
    const { ability, dc } = option.requiresCheck;
    const modifier = newState.character.abilityModifiers[ability];
    const roll = rollDice(20);
    const total = roll + modifier;
    const success = total >= dc;
    const abilityLabel = ability.slice(0, 3).toUpperCase();
    newState = addLog(
      newState,
      `[${abilityLabel} check: rolled ${roll} + ${modifier} = ${total} vs DC ${dc} — ${success ? 'Success!' : 'Failed.'}]`,
      success ? 'success' : 'warning'
    );
    if (!success) {
      newState = addLog(newState, `${npc.name} is not convinced.`, 'dialogue');
      // Stay on current node so the player can try a different option
      return newState;
    }
  }

  // Run option's action callback if present
  if (option.action) {
    newState = option.action(newState);
  }

  // Follow to next node
  if (option.nextNodeId) {
    const nextNode = getDialogueNode(npc, option.nextNodeId);
    if (nextNode) {
      newState = addLog(newState, `${npc.name}: "${nextNode.text}"`, 'dialogue');
      if (nextNode.options.length > 0) {
        const optionTexts = nextNode.options
          .map((opt, i) => `  ${i + 1}. ${opt.text}`)
          .join('\n');
        newState = addLog(newState, optionTexts, 'dialogue');
        return { ...newState, activeDialogue: { npcId, currentNodeId: nextNode.id } };
      }
    }
  }

  // No next node or no more options → end conversation
  return { ...newState, activeDialogue: null };
}

function handleTake(state: GameState, itemId: string): GameState {
  if (state.combat.active) {
    return addLog(state, 'You cannot pick up items while in combat!', 'warning');
  }

  const location = state.locations[state.currentLocationId];
  const itemIndex = location.items.findIndex(i => i.id === itemId);

  if (itemIndex === -1) {
    return addLog(state, 'That item is not here.', 'warning');
  }

  const item = location.items[itemIndex];
  const newWeight = state.character.inventory.currentWeight + item.weight;

  if (newWeight > state.character.inventory.maxWeight) {
    return addLog(
      state,
      `You cannot carry "${item.name}". It would exceed your carrying capacity (${state.character.inventory.currentWeight}/${state.character.inventory.maxWeight} lbs).`,
      'warning'
    );
  }

  // Remove item from location
  const updatedLocationItems = [...location.items];
  updatedLocationItems.splice(itemIndex, 1);

  const updatedLocations = {
    ...state.locations,
    [state.currentLocationId]: {
      ...location,
      items: updatedLocationItems,
    },
  };

  // Add item to inventory
  const updatedCharacter = {
    ...state.character,
    inventory: {
      ...state.character.inventory,
      items: [...state.character.inventory.items, item],
      currentWeight: newWeight,
    },
  };

  return addLog(
    { ...state, character: updatedCharacter, locations: updatedLocations },
    `You pick up ${item.name}.`,
    'success'
  );
}

function handleDrop(state: GameState, itemId: string): GameState {
  if (state.combat.active) {
    return addLog(state, 'You cannot drop items while in combat!', 'warning');
  }

  const itemIndex = state.character.inventory.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) {
    return addLog(state, 'You don\'t have that item.', 'warning');
  }

  const item = state.character.inventory.items[itemIndex];

  // Remove from inventory
  const updatedItems = [...state.character.inventory.items];
  updatedItems.splice(itemIndex, 1);

  const updatedCharacter = {
    ...state.character,
    inventory: {
      ...state.character.inventory,
      items: updatedItems,
      currentWeight: state.character.inventory.currentWeight - item.weight,
    },
  };

  // Add to location
  const location = state.locations[state.currentLocationId];
  const updatedLocations = {
    ...state.locations,
    [state.currentLocationId]: {
      ...location,
      items: [...location.items, item],
    },
  };

  return addLog(
    { ...state, character: updatedCharacter, locations: updatedLocations },
    `You drop ${item.name}.`,
    'info'
  );
}

function handleUse(state: GameState, itemId: string): GameState {
  const itemIndex = state.character.inventory.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) {
    return addLog(state, 'You don\'t have that item.', 'warning');
  }

  const item = state.character.inventory.items[itemIndex];
  if (!item.usable) {
    return addLog(state, `You can't use ${item.name}.`, 'warning');
  }

  // Handle potions (healing)
  if (item.type === 'potion') {
    const healAmount = rollDice(4) + rollDice(4) + 2; // 2d4+2
    const healedCharacter = healCharacter(state.character, healAmount);

    // Remove used potion from inventory
    const updatedItems = [...healedCharacter.inventory.items];
    updatedItems.splice(itemIndex, 1);

    const updatedCharacter = {
      ...healedCharacter,
      inventory: {
        ...healedCharacter.inventory,
        items: updatedItems,
        currentWeight: healedCharacter.inventory.currentWeight - item.weight,
      },
    };

    return addLog(
      { ...state, character: updatedCharacter },
      `You use ${item.name} and recover ${healAmount} hit points. (HP: ${updatedCharacter.hitPoints.current}/${updatedCharacter.hitPoints.max})`,
      'success'
    );
  }

  // Generic usable item
  return addLog(state, `You use ${item.name}. Nothing special happens.`, 'info');
}

function handleAttack(state: GameState, targetId: string): GameState {
  // If not in combat, initiate combat with the target NPC
  if (!state.combat.active) {
    const npc = state.npcs[targetId];
    if (!npc) {
      return addLog(state, 'That target does not exist.', 'error');
    }
    if (!npc.stats) {
      return addLog(state, `You cannot attack ${npc.name}.`, 'warning');
    }

    let newState = addLog(state, `You attack ${npc.name}!`, 'combat');
    const combatState = initiateCombat(newState.character, [npc]);
    newState = { ...newState, combat: combatState };

    // Process the player's attack
    return processPlayerAttack(newState, targetId);
  }

  // Already in combat
  if (!isPlayerTurn(state.combat, state.character.id)) {
    return addLog(state, 'It\'s not your turn!', 'warning');
  }

  return processPlayerAttack(state, targetId);
}

function processPlayerAttack(state: GameState, targetId: string): GameState {
  const enemy = state.combat.enemies.find(e => e.id === targetId);
  if (!enemy) {
    return addLog(state, 'That enemy is not in this fight.', 'warning');
  }

  const result = characterAttack(state.character, enemy);
  let newState = addLog(state, result.message, 'combat');

  if (result.damage > 0) {
    const { combat: updatedCombat, enemyDefeated, defeatedEnemy } = updateEnemyHP(
      newState.combat,
      targetId,
      result.damage
    );
    newState = { ...newState, combat: updatedCombat };

    if (enemyDefeated && defeatedEnemy) {
      newState = addLog(newState, `${defeatedEnemy.name} has been defeated!`, 'success');
    }
  }

  // Check if combat should end
  const { shouldEnd, victory } = shouldEndCombat(newState.combat);
  if (shouldEnd && victory) {
    return handleCombatVictory(newState);
  }

  // Advance turn and run enemy turns
  newState = { ...newState, combat: nextTurn(newState.combat) };
  return runEnemyTurns(newState);
}

function handleDefend(state: GameState): GameState {
  if (!state.combat.active) {
    return addLog(state, 'You are not in combat.', 'warning');
  }

  if (!isPlayerTurn(state.combat, state.character.id)) {
    return addLog(state, 'It\'s not your turn!', 'warning');
  }

  // Defending gives a temporary AC boost (simplified: just skip the turn with a note)
  let newState = addLog(state, `${state.character.name} takes a defensive stance. (+2 AC until next turn)`, 'combat');

  // Advance turn and run enemy turns
  // We temporarily boost AC; for simplicity we'll reduce damage taken during enemy turns
  const boostedCharacter = {
    ...newState.character,
    armorClass: newState.character.armorClass + 2,
  };
  newState = { ...newState, character: boostedCharacter };

  newState = { ...newState, combat: nextTurn(newState.combat) };
  newState = runEnemyTurns(newState);

  // Remove the AC boost after enemy turns
  const restoredCharacter = {
    ...newState.character,
    armorClass: newState.character.armorClass - 2,
  };
  return { ...newState, character: restoredCharacter };
}

function handleFlee(state: GameState): GameState {
  if (!state.combat.active) {
    return addLog(state, 'You are not in combat. There is nothing to flee from.', 'warning');
  }

  const result = attemptFlee(state.character);
  let newState = addLog(state, result.message, 'combat');

  if (result.success) {
    // End combat
    newState = {
      ...newState,
      combat: {
        active: false,
        enemies: [],
        enemyMaxHPs: {},
        totalEnemyCount: 0,
        turnOrder: [],
        currentTurnIndex: 0,
        round: 0,
      },
    };
    return addLog(newState, 'You escaped from combat!', 'success');
  }

  // Failed to flee - enemies get their turns
  newState = { ...newState, combat: nextTurn(newState.combat) };
  return runEnemyTurns(newState);
}

function handleBuy(state: GameState, itemId: string, npcId: string): GameState {
  if (state.combat.active) {
    return addLog(state, 'You cannot buy items while in combat!', 'warning');
  }

  const npc = state.npcs[npcId];
  if (!npc?.shop) {
    return addLog(state, 'This merchant has no shop.', 'warning');
  }

  const itemIndex = npc.shop.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) {
    return addLog(state, 'That item is not for sale.', 'warning');
  }

  const item = npc.shop.items[itemIndex];
  const price = Math.ceil(item.value * npc.shop.buyMultiplier);

  if (state.character.gold < price) {
    return addLog(
      state,
      `You cannot afford ${item.name}. It costs ${price} gold but you only have ${state.character.gold} gold.`,
      'warning'
    );
  }

  // Weight check
  const newWeight = state.character.inventory.currentWeight + item.weight;
  if (newWeight > state.character.inventory.maxWeight) {
    return addLog(state, `You cannot carry ${item.name}. Too heavy.`, 'warning');
  }

  // Remove item from shop
  const updatedShopItems = [...npc.shop.items];
  updatedShopItems.splice(itemIndex, 1);

  const updatedNpcs = {
    ...state.npcs,
    [npcId]: {
      ...npc,
      shop: {
        ...npc.shop,
        items: updatedShopItems,
      },
    },
  };

  // Add item to inventory and deduct gold
  const updatedCharacter = {
    ...state.character,
    gold: state.character.gold - price,
    inventory: {
      ...state.character.inventory,
      items: [...state.character.inventory.items, item],
      currentWeight: newWeight,
    },
  };

  return addLog(
    { ...state, character: updatedCharacter, npcs: updatedNpcs },
    `You buy ${item.name} for ${price} gold. (${updatedCharacter.gold} gold remaining)`,
    'success'
  );
}

function handleSell(state: GameState, itemId: string, npcId: string): GameState {
  if (state.combat.active) {
    return addLog(state, 'You cannot sell items while in combat!', 'warning');
  }

  const npc = state.npcs[npcId];
  if (!npc?.shop) {
    return addLog(state, 'This person doesn\'t buy items.', 'warning');
  }

  const itemIndex = state.character.inventory.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) {
    return addLog(state, 'You don\'t have that item.', 'warning');
  }

  const item = state.character.inventory.items[itemIndex];
  const price = Math.floor(item.value * npc.shop.sellMultiplier);

  // Remove from inventory
  const updatedInventoryItems = [...state.character.inventory.items];
  updatedInventoryItems.splice(itemIndex, 1);

  // Add to shop and add gold
  const updatedNpcs = {
    ...state.npcs,
    [npcId]: {
      ...npc,
      shop: {
        ...npc.shop,
        items: [...npc.shop.items, item],
      },
    },
  };

  const updatedCharacter = {
    ...state.character,
    gold: state.character.gold + price,
    inventory: {
      ...state.character.inventory,
      items: updatedInventoryItems,
      currentWeight: state.character.inventory.currentWeight - item.weight,
    },
  };

  return addLog(
    { ...state, character: updatedCharacter, npcs: updatedNpcs },
    `You sell ${item.name} for ${price} gold. (${updatedCharacter.gold} gold total)`,
    'success'
  );
}

function handleRest(state: GameState): GameState {
  if (state.combat.active) {
    return addLog(state, 'You cannot rest while in combat!', 'warning');
  }

  if (!REST_LOCATIONS.has(state.currentLocationId)) {
    return addLog(
      state,
      'This is not a safe place to rest. Try the tavern rooms or the forest clearing.',
      'warning'
    );
  }

  if (state.character.hitPoints.current >= state.character.hitPoints.max) {
    return addLog(state, 'You are already at full health.', 'info');
  }

  // Heal to full HP
  const healedCharacter = healCharacter(
    state.character,
    state.character.hitPoints.max
  );

  return addLog(
    { ...state, character: healedCharacter },
    `You rest and recover your strength. HP restored to ${healedCharacter.hitPoints.current}/${healedCharacter.hitPoints.max}.`,
    'success'
  );
}

function handleLook(state: GameState): GameState {
  const location = state.locations[state.currentLocationId];
  if (!location) return addLog(state, 'You see nothing.', 'info');

  let newState = addLog(state, `--- ${location.name} ---`, 'info');
  newState = addLog(newState, location.description, 'info');

  const directions = getAvailableDirections(location);
  if (directions.length > 0) {
    newState = addLog(newState, `Exits: ${directions.join(', ')}.`, 'info');
  }

  if (location.items.length > 0) {
    const itemNames = location.items.map(i => i.name).join(', ');
    newState = addLog(newState, `On the ground: ${itemNames}.`, 'info');
  }

  const npcsHere = location.npcs
    .map(id => state.npcs[id])
    .filter(Boolean);
  if (npcsHere.length > 0) {
    const npcNames = npcsHere.map(n => n.name).join(', ');
    newState = addLog(newState, `Present: ${npcNames}.`, 'info');
  }

  return newState;
}

function handleInventory(state: GameState): GameState {
  const inv = state.character.inventory;
  if (inv.items.length === 0) {
    return addLog(state, 'Your inventory is empty.', 'info');
  }

  let newState = addLog(state, `--- Inventory (${inv.currentWeight.toFixed(1)}/${inv.maxWeight} lbs) ---`, 'info');
  for (const item of inv.items) {
    const usable = item.usable ? ' [usable]' : '';
    newState = addLog(newState, `  ${item.name} (${item.type}, ${item.weight} lbs)${usable}`, 'info');
  }
  newState = addLog(newState, `Gold: ${state.character.gold}`, 'info');
  return newState;
}

function handleStats(state: GameState): GameState {
  const c = state.character;
  let newState = addLog(state, `--- ${c.name} ---`, 'info');
  newState = addLog(newState, `${c.race} ${c.class} | Level ${c.level} (${c.experience} XP)`, 'info');
  newState = addLog(newState, `HP: ${c.hitPoints.current}/${c.hitPoints.max} | AC: ${c.armorClass} | Gold: ${c.gold}`, 'info');
  newState = addLog(
    newState,
    `STR ${c.abilityScores.strength} (${c.abilityModifiers.strength >= 0 ? '+' : ''}${c.abilityModifiers.strength}) | DEX ${c.abilityScores.dexterity} (${c.abilityModifiers.dexterity >= 0 ? '+' : ''}${c.abilityModifiers.dexterity}) | CON ${c.abilityScores.constitution} (${c.abilityModifiers.constitution >= 0 ? '+' : ''}${c.abilityModifiers.constitution})`,
    'info'
  );
  newState = addLog(
    newState,
    `INT ${c.abilityScores.intelligence} (${c.abilityModifiers.intelligence >= 0 ? '+' : ''}${c.abilityModifiers.intelligence}) | WIS ${c.abilityScores.wisdom} (${c.abilityModifiers.wisdom >= 0 ? '+' : ''}${c.abilityModifiers.wisdom}) | CHA ${c.abilityScores.charisma} (${c.abilityModifiers.charisma >= 0 ? '+' : ''}${c.abilityModifiers.charisma})`,
    'info'
  );
  return newState;
}

// ---- Combat helpers ----

/**
 * Process enemy turns until it's the player's turn (or combat ends).
 */
function runEnemyTurns(state: GameState): GameState {
  let newState = state;

  while (
    newState.combat.active &&
    !isPlayerTurn(newState.combat, newState.character.id)
  ) {
    const currentId = getCurrentCombatant(newState.combat);
    const enemy = newState.combat.enemies.find(e => e.id === currentId);

    if (!enemy || !enemy.stats || enemy.stats.hitPoints <= 0) {
      // Skip dead or invalid enemies
      newState = { ...newState, combat: nextTurn(newState.combat) };
      continue;
    }

    const result = enemyAttack(enemy, newState.character);
    newState = addLog(newState, result.message, 'combat');

    if (result.damage > 0) {
      const damagedCharacter = damageCharacter(newState.character, result.damage);
      newState = { ...newState, character: damagedCharacter };

      if (!isAlive(damagedCharacter)) {
        newState = addLog(newState, `${newState.character.name} has fallen!`, 'error');
        newState = {
          ...newState,
          combat: {
            active: false,
            enemies: [],
            enemyMaxHPs: {},
            totalEnemyCount: 0,
            turnOrder: [],
            currentTurnIndex: 0,
            round: 0,
          },
        };
        return newState;
      }
    }

    newState = { ...newState, combat: nextTurn(newState.combat) };
  }

  return newState;
}

/**
 * Handle victory: award XP, gold, end combat.
 */
function handleCombatVictory(state: GameState): GameState {
  const rewards = endCombat(state.combat);

  const { character: xpCharacter, leveledUp } = awardExperience(
    state.character,
    rewards.experienceGained
  );

  const updatedCharacter = {
    ...xpCharacter,
    gold: xpCharacter.gold + rewards.goldGained,
  };

  let newState: GameState = {
    ...state,
    character: updatedCharacter,
    combat: {
      active: false,
      enemies: [],
      enemyMaxHPs: {},
      totalEnemyCount: 0,
      turnOrder: [],
      currentTurnIndex: 0,
      round: 0,
    },
  };

  newState = addLog(
    newState,
    `Victory! You gained ${rewards.experienceGained} XP and ${rewards.goldGained} gold.`,
    'success'
  );

  if (leveledUp) {
    newState = addLog(
      newState,
      `LEVEL UP! You are now level ${updatedCharacter.level}! Max HP: ${updatedCharacter.hitPoints.max}.`,
      'success'
    );
  }

  // Remove defeated NPCs from their locations
  const defeatedIds = state.combat.enemies.map(e => e.id);
  const updatedLocations = { ...newState.locations };
  for (const locId of Object.keys(updatedLocations)) {
    const loc = updatedLocations[locId];
    const filteredNpcs = loc.npcs.filter(id => !defeatedIds.includes(id));
    if (filteredNpcs.length !== loc.npcs.length) {
      updatedLocations[locId] = { ...loc, npcs: filteredNpcs };
    }
  }

  return { ...newState, locations: updatedLocations };
}
