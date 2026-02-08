import { useState, useCallback } from 'react';
import type { GameState } from '@/lib/types';
import { initializeGame } from '@/lib/engine/game-init';
import { parseCommand } from '@/lib/engine/command-parser';
import { processAction } from '@/lib/engine/game-engine';
import { ClassSelect } from '@/components/ClassSelect';
import { GameScreen } from '@/components/GameScreen';

type AppPhase = 'class-select' | 'playing';

export function App() {
  const [phase, setPhase] = useState<AppPhase>('class-select');
  const [gameState, setGameState] = useState<GameState | null>(null);

  const handleClassSelect = useCallback((className: string) => {
    const initialState = initializeGame(className);
    setGameState(initialState);
    setPhase('playing');
  }, []);

  const handleCommand = useCallback((input: string) => {
    setGameState((prev) => {
      if (!prev) return prev;

      const result = parseCommand(input, prev);

      if (!result.ok) {
        // Parse error -- append to game log manually
        return {
          ...prev,
          gameLog: [
            ...prev.gameLog,
            {
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              message: result.error,
              type: 'error' as const,
            },
          ],
        };
      }

      // Valid action -- run through the reducer
      return processAction(prev, result.action);
    });
  }, []);

  if (phase === 'class-select' || !gameState) {
    return <ClassSelect onSelect={handleClassSelect} />;
  }

  return (
    <GameScreen
      gameState={gameState}
      onCommand={handleCommand}
    />
  );
}
