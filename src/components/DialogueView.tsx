import type { NPC, DialogueNode, AbilityScores } from '@/lib/types';

type DialogueViewProps = {
  npc: NPC;
  currentNode: DialogueNode;
  onSelectOption: (optionIndex: number) => void;
};

function CheckBadge({ ability, dc }: { ability: keyof AbilityScores; dc: number }) {
  const abilityLabel = ability.slice(0, 3).toUpperCase();
  return (
    <span className="inline-flex items-center gap-1 ml-2 px-1.5 py-0.5 text-[10px] rounded bg-surface-overlay border border-surface-border text-parchment-dark">
      [{abilityLabel} DC {dc}]
    </span>
  );
}

export function DialogueView({ npc, currentNode, onSelectOption }: DialogueViewProps) {
  return (
    <div className="mx-5 my-3 p-4 rounded-lg border border-frost/30 bg-surface-raised">
      {/* NPC header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-surface-overlay border border-frost/40 flex items-center justify-center">
          <span className="text-frost text-lg font-fantasy">
            {npc.name.charAt(0)}
          </span>
        </div>
        <div>
          <h3 className="font-fantasy text-frost text-sm">{npc.name}</h3>
          <p className="text-xs text-text-muted">{npc.description}</p>
        </div>
      </div>

      {/* Dialogue text */}
      <div className="mb-4 pl-2 border-l-2 border-frost/20">
        <p className="text-sm text-text-secondary italic leading-relaxed">
          &ldquo;{currentNode.text}&rdquo;
        </p>
      </div>

      {/* Response options */}
      {currentNode.options.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {currentNode.options.map((option, i) => (
            <button
              key={option.text}
              type="button"
              onClick={() => onSelectOption(i)}
              className="text-left px-3 py-2 text-sm rounded border border-surface-border text-text-secondary hover:text-frost hover:border-frost/40 hover:bg-surface-overlay transition-colors focus-ring"
            >
              <span className="text-frost/60 mr-2">{i + 1}.</span>
              {option.text}
              {option.requiresCheck && (
                <CheckBadge
                  ability={option.requiresCheck.ability}
                  dc={option.requiresCheck.dc}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
