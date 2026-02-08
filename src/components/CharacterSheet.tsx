import type { Character, AbilityScores } from '@/lib/types';

type CharacterSheetProps = {
  character: Character;
};

const ABILITY_LABELS: Record<keyof AbilityScores, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
};

function HpBar({ current, max }: { current: number; max: number }) {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  let barColor = 'bg-emerald-glow';
  if (percent <= 25) barColor = 'bg-blood-light';
  else if (percent <= 50) barColor = 'bg-gold-coin';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="section-label">HP</span>
        <span className={percent <= 25 ? 'text-blood-light' : 'text-text-secondary'}>
          {current} / {max}
        </span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-surface-overlay overflow-hidden">
        <div
          className={`h-full rounded-full hp-bar-transition ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function AbilityScore({
  label,
  score,
  modifier,
}: {
  label: string;
  score: number;
  modifier: number;
}) {
  const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
  const modColor =
    modifier > 0 ? 'text-emerald-glow' : modifier < 0 ? 'text-blood-light' : 'text-text-muted';
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-text-muted w-8">{label}</span>
      <span className="text-sm text-text-primary w-6 text-center">{score}</span>
      <span className={`text-xs w-8 text-right font-mono ${modColor}`}>
        {modStr}
      </span>
    </div>
  );
}

export function CharacterSheet({ character }: CharacterSheetProps) {
  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Identity */}
      <div>
        <h2 className="font-fantasy text-parchment text-glow text-base">
          {character.name}
        </h2>
        <p className="text-xs text-text-muted">
          {character.race} {character.class}
        </p>
      </div>

      {/* Level & XP */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-parchment-dark">Level {character.level}</span>
        <span className="text-text-muted">{character.experience} XP</span>
      </div>

      {/* HP */}
      <HpBar current={character.hitPoints.current} max={character.hitPoints.max} />

      {/* AC & Gold card */}
      <div className="flex justify-between text-sm rounded-md bg-surface-overlay px-4 py-3 border border-surface-border">
        <div className="flex flex-col items-center gap-0.5">
          <span className="section-label">AC</span>
          <span className="text-parchment font-mono text-base font-bold">
            {character.armorClass}
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="section-label">Gold</span>
          <span className="text-gold-coin font-mono text-base font-bold">
            {character.gold}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-surface-border" />

      {/* Ability Scores */}
      <div>
        <h3 className="section-label mb-2">Abilities</h3>
        <div className="flex flex-col">
          {(Object.keys(ABILITY_LABELS) as Array<keyof AbilityScores>).map(
            (ability) => (
              <AbilityScore
                key={ability}
                label={ABILITY_LABELS[ability]}
                score={character.abilityScores[ability]}
                modifier={character.abilityModifiers[ability]}
              />
            ),
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-surface-border" />

      {/* Quick inventory summary */}
      <div>
        <h3 className="section-label mb-1">Equipment</h3>
        <div className="text-xs text-text-muted">
          {character.inventory.items.length} items &middot;{' '}
          {character.inventory.currentWeight.toFixed(1)} /{' '}
          {character.inventory.maxWeight} lbs
        </div>
        <ul className="mt-1.5 flex flex-col gap-0.5">
          {character.inventory.items.slice(0, 5).map((item) => (
            <li key={item.id} className="text-xs text-text-secondary truncate">
              {item.name}
            </li>
          ))}
          {character.inventory.items.length > 5 && (
            <li className="text-xs text-text-muted">
              +{character.inventory.items.length - 5} more
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
