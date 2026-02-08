import { CLASSES } from '@/lib/game/classes';
import type { CharacterClass } from '@/lib/game/classes';

type ClassSelectProps = {
  onSelect: (className: string) => void;
};

const CLASS_ICONS: Record<string, string> = {
  fighter: '\u2694\uFE0F',
  wizard: '\uD83E\uDDD9',
  rogue: '\uD83D\uDDE1\uFE0F',
  cleric: '\u2728',
  ranger: '\uD83C\uDFF9',
  paladin: '\uD83D\uDEE1\uFE0F',
};

function AbilityTag({ ability }: { ability: string }) {
  return (
    <span className="inline-block px-2 py-0.5 text-xs rounded bg-surface-overlay text-parchment-light border border-surface-border">
      {ability.charAt(0).toUpperCase() + ability.slice(1)}
    </span>
  );
}

function ClassCard({
  classKey,
  charClass,
  onSelect,
}: {
  classKey: string;
  charClass: CharacterClass;
  onSelect: (key: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(classKey)}
      className="class-card-glow flex flex-col gap-4 p-6 rounded-lg border border-surface-border bg-surface-raised text-left cursor-pointer hover:bg-surface-overlay transition-colors focus-ring"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl" role="img" aria-label={charClass.name}>
          {CLASS_ICONS[classKey] ?? '\u2728'}
        </span>
        <div>
          <h3 className="text-lg font-fantasy text-parchment">
            {charClass.name}
          </h3>
          <span className="text-xs text-text-muted">
            Hit Die: d{charClass.hitDie}
          </span>
        </div>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">
        {charClass.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mt-auto">
        {charClass.primaryAbilities.map((ability) => (
          <AbilityTag key={ability} ability={ability} />
        ))}
      </div>

      <div className="text-xs text-text-muted mt-1">
        Starting gold: {charClass.startingGold}gp &middot;{' '}
        {charClass.startingEquipment.length} items
      </div>
    </button>
  );
}

export function ClassSelect({ onSelect }: ClassSelectProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-fantasy text-parchment text-glow mb-3">
            Realm of Shadows
          </h1>
          <p className="text-text-secondary text-sm max-w-lg mx-auto">
            Darkness stirs in the forgotten lands. Choose your path, adventurer.
            Your name, race, and abilities have been foretold by the Fates.
          </p>
          <div className="mt-4 h-px w-48 mx-auto bg-gradient-to-r from-transparent via-parchment-dark to-transparent" />
        </header>

        <h2 className="text-center text-parchment-dark font-fantasy text-xl mb-6">
          Choose Your Class
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(CLASSES).map(([key, charClass]) => (
            <ClassCard
              key={key}
              classKey={key}
              charClass={charClass}
              onSelect={onSelect}
            />
          ))}
        </div>

        <p className="text-center text-text-muted text-xs mt-8">
          The Fates will assign your name, race, and ability scores.
        </p>
      </div>
    </div>
  );
}
