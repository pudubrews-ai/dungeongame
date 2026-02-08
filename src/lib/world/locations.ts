/**
 * Game world locations
 */

import type { Location } from '../types';

/**
 * Starter locations for the game world
 */
export const LOCATIONS: Record<string, Location> = {
  'village-square': {
    id: 'village-square',
    name: 'Village Square',
    description: `You stand in the heart of a bustling village. The cobblestone square is surrounded by timber-framed buildings with thatched roofs. A stone fountain bubbles in the center, and villagers go about their daily business. To the north, you see the town hall. The village shop lies to the east, and a path leads south toward the forest. The tavern entrance is visible to the west.`,
    connections: {
      north: 'town-hall',
      east: 'village-shop',
      south: 'forest-path',
      west: 'village-tavern',
    },
    npcs: ['village-guard', 'merchant'],
    items: [],
    visited: false,
  },

  'town-hall': {
    id: 'town-hall',
    name: 'Town Hall',
    description: `A grand wooden building with high ceilings and polished floors. The mayor's office is at the far end, and notice boards line the walls with job postings and wanted posters. Sunlight streams through tall windows, illuminating dust motes in the air.`,
    connections: {
      south: 'village-square',
    },
    npcs: ['mayor', 'town-clerk'],
    items: [],
    visited: false,
  },

  'village-shop': {
    id: 'village-shop',
    name: 'Village Shop',
    description: `A cozy shop filled with adventuring supplies. Shelves are stocked with potions, rations, rope, and torches. The shopkeeper stands behind a worn wooden counter, ready to trade. A sign on the wall reads "Fair Prices for Adventurers!"`,
    connections: {
      west: 'village-square',
    },
    npcs: ['shopkeeper'],
    items: [],
    visited: false,
  },

  'village-tavern': {
    id: 'village-tavern',
    name: 'The Prancing Pony Tavern',
    description: `A warm, inviting tavern filled with the smell of ale and roasted meat. Wooden tables are scattered throughout, and a large fireplace crackles in the corner. Adventurers and locals alike gather here to share stories and rumors. The bartender polishes glasses behind the bar.`,
    connections: {
      east: 'village-square',
      up: 'tavern-rooms',
    },
    npcs: ['bartender', 'mysterious-stranger'],
    items: [],
    visited: false,
  },

  'tavern-rooms': {
    id: 'tavern-rooms',
    name: 'Tavern Guest Rooms',
    description: `A quiet hallway with several guest rooms. The wooden floors creak softly underfoot. A small window at the end of the hall provides a view of the village square below. You can rest here to recover your strength.`,
    connections: {
      down: 'village-tavern',
    },
    npcs: [],
    items: [],
    visited: false,
  },

  'forest-path': {
    id: 'forest-path',
    name: 'Forest Path',
    description: `A well-worn dirt path leads into a dense forest. Tall trees create a canopy overhead, filtering the sunlight into dappled patterns on the ground. You hear birds chirping and the rustle of small creatures in the underbrush. The path continues deeper into the woods to the south, or you can return north to the village.`,
    connections: {
      north: 'village-square',
      south: 'deep-forest',
      east: 'forest-clearing',
    },
    npcs: [],
    items: [
      {
        id: 'forest-stick',
        name: 'Sturdy Branch',
        description: 'A thick oak branch that could serve as a makeshift weapon.',
        weight: 2,
        value: 1,
        type: 'misc',
        usable: false,
      },
    ],
    visited: false,
  },

  'forest-clearing': {
    id: 'forest-clearing',
    name: 'Forest Clearing',
    description: `A peaceful clearing in the forest where sunlight breaks through the trees. Wildflowers grow in patches, and a small stream trickles nearby. This would be a good place to rest and recover. The forest path lies to the west.`,
    connections: {
      west: 'forest-path',
    },
    npcs: ['hermit'],
    items: [],
    visited: false,
  },

  'deep-forest': {
    id: 'deep-forest',
    name: 'Deep Forest',
    description: `The forest grows darker and more ominous here. The trees are ancient and gnarled, their branches forming twisted shapes. Strange sounds echo in the distance. You sense danger lurking in the shadows. A path continues south toward what appears to be ruins, or you can return north to safety.`,
    connections: {
      north: 'forest-path',
      south: 'ancient-ruins-entrance',
    },
    npcs: [],
    items: [],
    visited: false,
  },

  'ancient-ruins-entrance': {
    id: 'ancient-ruins-entrance',
    name: 'Ancient Ruins Entrance',
    description: `Crumbling stone archways mark the entrance to ancient ruins. Moss and vines cover weathered walls carved with forgotten runes. A sense of foreboding fills the air. Stone steps lead down into darkness below. The forest lies to the north.`,
    connections: {
      north: 'deep-forest',
      down: 'ruins-dungeon',
    },
    npcs: ['ruins-guardian'],
    items: [
      {
        id: 'ancient-key',
        name: 'Ancient Bronze Key',
        description: 'A tarnished key covered in ancient symbols. It might open something in the ruins.',
        weight: 0.2,
        value: 50,
        type: 'quest',
        usable: false,
      },
    ],
    visited: false,
  },

  'ruins-dungeon': {
    id: 'ruins-dungeon',
    name: 'Ruins Dungeon',
    description: `A dark, damp underground chamber. The walls are lined with ancient stonework, and the air is thick with dust and the smell of decay. Torches flicker in wall sconces, casting dancing shadows. You hear the sound of dripping water and distant growls. Passages lead deeper into the dungeon to the east and south.`,
    connections: {
      up: 'ancient-ruins-entrance',
      east: 'dungeon-treasury',
      south: 'dungeon-depths',
    },
    npcs: ['skeleton-warrior'],
    items: [],
    visited: false,
  },

  'dungeon-treasury': {
    id: 'dungeon-treasury',
    name: 'Ancient Treasury',
    description: `A small chamber that once held great treasure. Now mostly empty, you can see scattered coins on the floor and empty chests against the walls. A single ornate chest remains locked in the corner. The exit is to the west.`,
    connections: {
      west: 'ruins-dungeon',
    },
    npcs: [],
    items: [
      {
        id: 'gold-coins',
        name: 'Pile of Gold Coins',
        description: 'Ancient gold coins scattered on the floor.',
        weight: 1,
        value: 100,
        type: 'treasure',
        usable: false,
      },
      {
        id: 'magic-amulet',
        name: 'Amulet of Protection',
        description: 'A mystical amulet that glows with a faint blue light.',
        weight: 0.1,
        value: 250,
        type: 'treasure',
        usable: true,
      },
    ],
    visited: false,
  },

  'dungeon-depths': {
    id: 'dungeon-depths',
    name: 'Dungeon Depths',
    description: `The deepest part of the ruins. The air is cold and still. Ancient bones litter the floor, and ominous red runes glow on the walls. You sense a powerful presence here. This is clearly the lair of something dangerous. A passage leads north back to safety.`,
    connections: {
      north: 'ruins-dungeon',
    },
    npcs: ['dungeon-boss'],
    items: [],
    visited: false,
  },
};

/**
 * Get a location by ID
 */
export function getLocation(locationId: string): Location | undefined {
  return LOCATIONS[locationId];
}

/**
 * Get all location IDs
 */
export function getAllLocationIds(): string[] {
  return Object.keys(LOCATIONS);
}

/**
 * Get all locations
 */
export function getAllLocations(): Location[] {
  return Object.values(LOCATIONS);
}

/**
 * Check if a direction is valid from the current location
 */
export function canMove(location: Location, direction: string): boolean {
  return direction in location.connections;
}

/**
 * Get the location ID in a given direction
 */
export function getConnectedLocation(
  location: Location,
  direction: string
): string | undefined {
  type Direction = keyof typeof location.connections;
  return location.connections[direction as Direction];
}

/**
 * Get available directions from a location
 */
export function getAvailableDirections(location: Location): string[] {
  return Object.keys(location.connections);
}

/**
 * Mark a location as visited
 */
export function markLocationVisited(location: Location): Location {
  return {
    ...location,
    visited: true,
  };
}

/**
 * Create a copy of all locations for a new game
 */
export function initializeLocations(): Record<string, Location> {
  const locations: Record<string, Location> = {};

  Object.entries(LOCATIONS).forEach(([id, location]) => {
    locations[id] = {
      ...location,
      items: [...location.items],
      npcs: [...location.npcs],
      visited: false,
    };
  });

  return locations;
}
