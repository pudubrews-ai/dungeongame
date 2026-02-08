# Realm of Shadows

A D&D-inspired text adventure game built with React and TypeScript. Explore a dark fantasy world, talk to NPCs, trade with shopkeepers, and battle monsters — all through a command-line interface in your browser.

## Screenshots

> *Class selection screen, game screen with sidebar, combat view, and shop dialogue are all playable in-browser.*

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Commands

| Command | Description |
|---|---|
| `go north` / `n` | Move in a direction (north, south, east, west) |
| `look` | Examine your surroundings |
| `talk <npc>` | Start a conversation with an NPC |
| `1`, `2`, `3` | Select a dialogue option during conversation |
| `leave` / `bye` | End a conversation early |
| `buy <item>` | Buy an item from a shopkeeper |
| `sell <item>` | Sell an item to a shopkeeper |
| `take <item>` | Pick up an item |
| `drop <item>` | Drop an item from your inventory |
| `use <item>` | Use an item (potions, etc.) |
| `attack <target>` | Attack an NPC or enemy |
| `defend` | Take a defensive stance in combat (+2 AC) |
| `flee` | Attempt to escape combat |
| `rest` | Rest at a safe location to restore HP |
| `inventory` / `i` | View your inventory |
| `stats` | View your character stats |
| `help` | Show available commands |

## Gameplay

- **Character creation** — Pick a class (Fighter, Wizard, Rogue, Cleric, Ranger, or Paladin). Name, race, and ability scores are randomly generated.
- **Exploration** — 12 interconnected locations including a village, tavern, forest, ancient ruins, and a shadow temple.
- **NPCs** — 11 characters with branching dialogue trees. Some have ability checks (roll d20 + modifier vs DC).
- **Combat** — Turn-based with initiative order. Attack, defend, use items, or flee.
- **Shopping** — Buy gear from the shopkeeper or sell your loot. Prices are based on item value with buy/sell multipliers.

## Tech Stack

- **Frontend:** React 19, TypeScript 5 (strict), Vite 7
- **Styling:** Tailwind CSS 4 (dark theme with fantasy fonts)
- **Testing:** Vitest — 166 tests
- **Architecture:** Pure-function game engine (`processAction(state, action) => state`) with a command parser that converts text input into typed actions.

## Project Structure

```
src/
  components/       UI components (GameScreen, CharacterSheet, CombatView, etc.)
  lib/
    types.ts        All core types
    engine/         Game init, command parser, game engine (state reducer)
    game/           Dice, classes, character creation, combat system
    world/          Locations, NPCs, dialogue trees
```

## Scripts

```bash
npm run dev         # Start dev server
npm run build       # Production build (tsc + vite)
npm run preview     # Preview production build
npm test            # Run tests in watch mode
npm run test:ui     # Vitest UI
npm run lint        # ESLint
```

## License

MIT
