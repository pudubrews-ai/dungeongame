import type { CombatState, NPC } from '@/lib/types';

type CombatViewProps = {
  combat: CombatState;
  npcs: Record<string, NPC>;
  onAction: (command: string) => void;
};

function EnemyHpBar({ current, max, name }: { current: number; max: number; name: string }) {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  let barColor = 'bg-blood-light';
  if (percent > 50) barColor = 'bg-blood';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-text-primary">{name}</span>
        <span className="text-blood-light">
          {current} / {max}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-surface-overlay overflow-hidden">
        <div
          className={`h-full rounded-full hp-bar-transition ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

const COMBAT_ACTIONS = [
  { label: 'Attack', command: 'attack', color: 'border-blood-light text-blood-light hover:bg-blood-dark/30 active:bg-blood-dark/50' },
  { label: 'Defend', command: 'defend', color: 'border-parchment-dark text-parchment hover:bg-surface-overlay active:bg-surface-border/50' },
  { label: 'Flee', command: 'flee', color: 'border-gold-coin text-gold-coin hover:bg-surface-overlay active:bg-surface-border/50' },
  { label: 'Use Item', command: 'use', color: 'border-emerald-glow text-emerald-glow hover:bg-surface-overlay active:bg-surface-border/50' },
] as const;

export function CombatView({ combat, npcs, onAction }: CombatViewProps) {
  const currentTurnId = combat.turnOrder[combat.currentTurnIndex];

  return (
    <div className="mx-5 my-3 p-4 rounded-lg border border-blood/60 bg-surface-raised combat-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-surface-border">
        <h3 className="font-fantasy text-blood-light text-sm uppercase tracking-wider">
          Combat - Round {combat.round}
        </h3>
        <span className="text-xs text-text-muted">
          Turn: <span className="text-text-primary">{currentTurnId === 'player' ? 'Your turn' : npcs[currentTurnId]?.name ?? 'Enemy'}</span>
        </span>
      </div>

      {/* Enemies */}
      <div className="flex flex-col gap-3 mb-4">
        {combat.enemies.map((enemy) => {
          if (!enemy.stats) return null;
          const maxHp = combat.enemyMaxHPs[enemy.id] ?? enemy.stats.hitPoints;
          return (
            <EnemyHpBar
              key={enemy.id}
              name={enemy.name}
              current={enemy.stats.hitPoints}
              max={maxHp}
            />
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {COMBAT_ACTIONS.map(({ label, command, color }) => (
          <button
            key={command}
            type="button"
            onClick={() => onAction(command)}
            className={`px-4 py-2 text-xs font-mono rounded-md border transition-colors focus-ring ${color}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
