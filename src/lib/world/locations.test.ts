import { describe, it, expect } from 'vitest';
import {
  LOCATIONS,
  getLocation,
  getAllLocationIds,
  getAllLocations,
  canMove,
  getConnectedLocation,
  getAvailableDirections,
  markLocationVisited,
  initializeLocations,
} from './locations';

describe('locations', () => {
  describe('LOCATIONS constant', () => {
    it('should have at least 5 locations', () => {
      const locationCount = Object.keys(LOCATIONS).length;
      expect(locationCount).toBeGreaterThanOrEqual(5);
    });

    it('should have all required properties for each location', () => {
      Object.values(LOCATIONS).forEach(location => {
        expect(location).toHaveProperty('id');
        expect(location).toHaveProperty('name');
        expect(location).toHaveProperty('description');
        expect(location).toHaveProperty('connections');
        expect(location).toHaveProperty('npcs');
        expect(location).toHaveProperty('items');
        expect(location).toHaveProperty('visited');

        expect(location.description.length).toBeGreaterThan(50);
        expect(Array.isArray(location.npcs)).toBe(true);
        expect(Array.isArray(location.items)).toBe(true);
        expect(location.visited).toBe(false);
      });
    });

    it('should have valid connection references', () => {
      Object.values(LOCATIONS).forEach(location => {
        Object.values(location.connections).forEach(connectedId => {
          if (connectedId) {
            expect(LOCATIONS[connectedId]).toBeDefined();
          }
        });
      });
    });

    it('should have bidirectional connections', () => {
      // If A connects to B via north, B should connect to A via south
      Object.entries(LOCATIONS).forEach(([locationId, location]) => {
        const { connections } = location;

        if (connections.north) {
          const northLocation = LOCATIONS[connections.north];
          expect(northLocation.connections.south).toBe(locationId);
        }

        if (connections.south) {
          const southLocation = LOCATIONS[connections.south];
          expect(southLocation.connections.north).toBe(locationId);
        }

        if (connections.east) {
          const eastLocation = LOCATIONS[connections.east];
          expect(eastLocation.connections.west).toBe(locationId);
        }

        if (connections.west) {
          const westLocation = LOCATIONS[connections.west];
          expect(westLocation.connections.east).toBe(locationId);
        }
      });
    });

    it('should have items with all required properties', () => {
      Object.values(LOCATIONS).forEach(location => {
        location.items.forEach(item => {
          expect(item).toHaveProperty('id');
          expect(item).toHaveProperty('name');
          expect(item).toHaveProperty('description');
          expect(item).toHaveProperty('weight');
          expect(item).toHaveProperty('value');
          expect(item).toHaveProperty('type');
          expect(item).toHaveProperty('usable');

          expect(item.weight).toBeGreaterThanOrEqual(0);
          expect(item.value).toBeGreaterThanOrEqual(0);
          expect(['weapon', 'armor', 'potion', 'treasure', 'quest', 'misc']).toContain(
            item.type
          );
        });
      });
    });
  });

  describe('Starting location', () => {
    it('should have village-square as a starting location', () => {
      expect(LOCATIONS['village-square']).toBeDefined();
      expect(LOCATIONS['village-square'].name).toBe('Village Square');
    });

    it('village-square should have multiple connections', () => {
      const square = LOCATIONS['village-square'];
      const connectionCount = Object.keys(square.connections).length;
      expect(connectionCount).toBeGreaterThanOrEqual(3);
    });
  });

  describe('getLocation', () => {
    it('should return location by ID', () => {
      const location = getLocation('village-square');
      expect(location).toBeDefined();
      expect(location?.id).toBe('village-square');
    });

    it('should return undefined for invalid ID', () => {
      const location = getLocation('nonexistent-location');
      expect(location).toBeUndefined();
    });
  });

  describe('getAllLocationIds', () => {
    it('should return all location IDs', () => {
      const ids = getAllLocationIds();
      expect(ids.length).toBeGreaterThan(0);
      expect(ids).toContain('village-square');
    });

    it('should return unique IDs', () => {
      const ids = getAllLocationIds();
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('getAllLocations', () => {
    it('should return all locations', () => {
      const locations = getAllLocations();
      expect(locations.length).toBeGreaterThan(0);
      expect(locations[0]).toHaveProperty('id');
      expect(locations[0]).toHaveProperty('name');
    });
  });

  describe('canMove', () => {
    it('should return true for valid directions', () => {
      const square = LOCATIONS['village-square'];
      expect(canMove(square, 'north')).toBe(true);
    });

    it('should return false for invalid directions', () => {
      const square = LOCATIONS['village-square'];
      expect(canMove(square, 'northwest')).toBe(false);
      expect(canMove(square, 'invalid')).toBe(false);
    });
  });

  describe('getConnectedLocation', () => {
    it('should return connected location ID', () => {
      const square = LOCATIONS['village-square'];
      const northLocation = getConnectedLocation(square, 'north');
      expect(northLocation).toBe('town-hall');
    });

    it('should return undefined for invalid direction', () => {
      const square = LOCATIONS['village-square'];
      const nowhere = getConnectedLocation(square, 'invalid');
      expect(nowhere).toBeUndefined();
    });
  });

  describe('getAvailableDirections', () => {
    it('should return all available directions', () => {
      const square = LOCATIONS['village-square'];
      const directions = getAvailableDirections(square);

      expect(directions.length).toBeGreaterThan(0);
      expect(directions).toContain('north');
    });

    it('should only return valid directions', () => {
      const square = LOCATIONS['village-square'];
      const directions = getAvailableDirections(square);

      const validDirections = ['north', 'south', 'east', 'west', 'up', 'down'];
      directions.forEach(dir => {
        expect(validDirections).toContain(dir);
      });
    });
  });

  describe('markLocationVisited', () => {
    it('should mark location as visited', () => {
      const square = LOCATIONS['village-square'];
      expect(square.visited).toBe(false);

      const visited = markLocationVisited(square);
      expect(visited.visited).toBe(true);
    });

    it('should not mutate original location', () => {
      const square = LOCATIONS['village-square'];
      const originalVisited = square.visited;

      markLocationVisited(square);
      expect(square.visited).toBe(originalVisited);
    });
  });

  describe('initializeLocations', () => {
    it('should create a copy of all locations', () => {
      const locations = initializeLocations();

      expect(Object.keys(locations).length).toBe(Object.keys(LOCATIONS).length);
    });

    it('should reset visited status', () => {
      const locations = initializeLocations();

      Object.values(locations).forEach(location => {
        expect(location.visited).toBe(false);
      });
    });

    it('should create deep copies', () => {
      const locations = initializeLocations();

      // Modify the copy
      locations['village-square'].visited = true;
      locations['village-square'].items = [];

      // Original should be unchanged
      expect(LOCATIONS['village-square'].visited).toBe(false);
    });
  });

  describe('Game world structure', () => {
    it('should have a town area', () => {
      const townLocations = Object.values(LOCATIONS).filter(loc =>
        loc.name.toLowerCase().includes('village') || loc.name.toLowerCase().includes('town')
      );
      expect(townLocations.length).toBeGreaterThanOrEqual(3);
    });

    it('should have a wilderness area', () => {
      const wildernessLocations = Object.values(LOCATIONS).filter(loc =>
        loc.name.toLowerCase().includes('forest') || loc.name.toLowerCase().includes('path')
      );
      expect(wildernessLocations.length).toBeGreaterThanOrEqual(2);
    });

    it('should have a dungeon area', () => {
      const dungeonLocations = Object.values(LOCATIONS).filter(loc =>
        loc.name.toLowerCase().includes('dungeon') ||
        loc.name.toLowerCase().includes('ruins') ||
        loc.name.toLowerCase().includes('depths')
      );
      expect(dungeonLocations.length).toBeGreaterThanOrEqual(2);
    });

    it('should have treasure items in appropriate locations', () => {
      const treasureLocations = Object.values(LOCATIONS).filter(loc =>
        loc.items.some(item => item.type === 'treasure')
      );
      expect(treasureLocations.length).toBeGreaterThan(0);
    });

    it('should have quest items in appropriate locations', () => {
      const questLocations = Object.values(LOCATIONS).filter(loc =>
        loc.items.some(item => item.type === 'quest')
      );
      expect(questLocations.length).toBeGreaterThan(0);
    });
  });
});
