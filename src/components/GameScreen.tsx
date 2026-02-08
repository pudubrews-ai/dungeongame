import { useState } from 'react';
import type { GameState } from '@/lib/types';
import { CharacterSheet } from '@/components/CharacterSheet';
import { GameLog } from '@/components/GameLog';
import { CommandInput } from '@/components/CommandInput';
import { CombatView } from '@/components/CombatView';
// DialogueView is available at @/components/DialogueView for when
// the engine exposes active dialogue state on GameState.
import { InventoryView } from '@/components/InventoryView';

type GameScreenProps = {
  gameState: GameState;
  onCommand: (input: string) => void;
};

export function GameScreen({ gameState, onCommand }: GameScreenProps) {
  const [showInventory, setShowInventory] = useState(false);
  const [showMobileStats, setShowMobileStats] = useState(false);

  const currentLocation = gameState.locations[gameState.currentLocationId];
  const inCombat = gameState.combat.active;

  // Check if there's an active dialogue by looking for a dialogue-type recent log entry
  // The engine manages dialogue state; we detect it from NPC presence at location
  const locationNpcs = currentLocation?.npcs
    .map((id) => gameState.npcs[id])
    .filter(Boolean) ?? [];

  const availableDirections = currentLocation
    ? Object.entries(currentLocation.connections)
        .filter(([_, id]) => id != null)
        .map(([dir]) => dir)
    : [];

  return (
    <div className="h-screen flex flex-col bg-surface-base overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-2.5 bg-surface-raised border-b border-surface-border">
        <h1 className="font-fantasy text-parchment text-glow text-lg">
          Realm of Shadows
        </h1>
        <div className="flex items-center gap-3">
          {currentLocation && (
            <span className="hidden sm:inline text-sm text-text-secondary">
              <span className="text-parchment-dark">Location:</span>{' '}
              {currentLocation.name}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowMobileStats((v) => !v)}
            className="btn md:hidden"
          >
            Stats
          </button>
          <button
            type="button"
            onClick={() => setShowInventory((v) => !v)}
            className="btn"
          >
            Inventory
          </button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left / center: game log + location + combat/dialogue */}
        <main className="flex flex-col flex-1 overflow-hidden">
          {/* Location description */}
          {currentLocation && (
            <div className="px-5 py-3 bg-surface-raised border-b border-surface-border">
              <h2 className="font-fantasy text-parchment text-base mb-1">
                {currentLocation.name}
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {currentLocation.description}
              </p>
              {availableDirections.length > 0 && (
                <p className="text-xs text-text-muted mt-1.5">
                  Exits:{' '}
                  {availableDirections.map((dir, i) => (
                    <span key={dir}>
                      {i > 0 && ', '}
                      <span className="text-parchment-dark">{dir}</span>
                    </span>
                  ))}
                </p>
              )}
              {locationNpcs.length > 0 && (
                <p className="text-xs text-text-muted mt-1">
                  Present:{' '}
                  {locationNpcs.map((npc, i) => (
                    <span key={npc.id}>
                      {i > 0 && ', '}
                      <span className={npc.hostile ? 'text-blood-light' : 'text-frost'}>
                        {npc.name}
                      </span>
                    </span>
                  ))}
                </p>
              )}
            </div>
          )}

          {/* Combat overlay */}
          {inCombat && (
            <CombatView
              combat={gameState.combat}
              npcs={gameState.npcs}
              onAction={onCommand}
            />
          )}

          {/* Game log */}
          <GameLog entries={gameState.gameLog} />

          {/* Command input */}
          <CommandInput onSubmit={onCommand} disabled={false} />
        </main>

        {/* Right sidebar: character sheet (desktop) */}
        <aside className="hidden md:flex flex-col w-72 border-l border-surface-border bg-surface-raised overflow-y-auto">
          <CharacterSheet character={gameState.character} />
        </aside>
      </div>

      {/* Mobile character sheet slide-in overlay */}
      {showMobileStats && (
        <div className="fixed inset-0 z-40 md:hidden flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMobileStats(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setShowMobileStats(false); }}
            role="button"
            tabIndex={0}
            aria-label="Close stats"
          />
          <div className="relative w-72 max-w-[80vw] bg-surface-raised border-l border-surface-border overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
              <span className="section-label">Character</span>
              <button
                type="button"
                onClick={() => setShowMobileStats(false)}
                className="text-text-muted hover:text-text-primary transition-colors text-lg leading-none"
                aria-label="Close stats"
              >
                &times;
              </button>
            </div>
            <CharacterSheet character={gameState.character} />
          </div>
        </div>
      )}

      {/* Inventory overlay */}
      {showInventory && (
        <InventoryView
          inventory={gameState.character.inventory}
          onUse={(itemId) => onCommand(`use ${itemId}`)}
          onDrop={(itemId) => onCommand(`drop ${itemId}`)}
          onClose={() => setShowInventory(false)}
        />
      )}
    </div>
  );
}
