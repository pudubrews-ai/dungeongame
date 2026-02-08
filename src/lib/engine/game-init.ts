/**
 * Game initialization - creates a new game from a chosen class name
 */

import type { GameState, LogEntry } from '../types';
import { createRandomCharacter } from '../game/character';
import { initializeLocations } from '../world/locations';
import { initializeNPCs } from '../world/npcs';
import { nanoid } from 'nanoid';

/**
 * Create a log entry helper
 */
export function createLogEntry(
  message: string,
  type: LogEntry['type'] = 'info'
): LogEntry {
  return {
    id: nanoid(),
    timestamp: Date.now(),
    message,
    type,
  };
}

/**
 * Initialize a new game. The player picks ONLY their class.
 * Name, race, and ability scores are randomly generated.
 *
 * @param className - The class chosen by the player (e.g. "fighter", "wizard")
 * @returns A complete GameState ready for play
 */
export function initializeGame(className: string): GameState {
  const character = createRandomCharacter(className);
  const locations = initializeLocations();
  const npcs = initializeNPCs();

  const startingLocationId = 'village-square';

  // Mark starting location as visited
  locations[startingLocationId] = {
    ...locations[startingLocationId],
    visited: true,
  };

  const gameLog: LogEntry[] = [
    createLogEntry(
      `A new adventure begins! ${character.name}, a ${character.race} ${character.class}, arrives at the village.`,
      'success'
    ),
    createLogEntry(locations[startingLocationId].description, 'info'),
  ];

  return {
    character,
    currentLocationId: startingLocationId,
    locations,
    npcs,
    quests: [],
    combat: {
      active: false,
      enemies: [],
      enemyMaxHPs: {},
      totalEnemyCount: 0,
      turnOrder: [],
      currentTurnIndex: 0,
      round: 0,
    },
    activeDialogue: null,
    gameLog,
    timestamp: Date.now(),
  };
}
