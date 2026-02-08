import type { Inventory, Item } from '@/lib/types';

type InventoryViewProps = {
  inventory: Inventory;
  onUse: (itemId: string) => void;
  onDrop: (itemId: string) => void;
  onClose: () => void;
};

const TYPE_COLORS: Record<Item['type'], string> = {
  weapon: 'text-blood-light',
  armor: 'text-parchment',
  potion: 'text-emerald-glow',
  treasure: 'text-gold-coin',
  quest: 'text-frost',
  misc: 'text-text-secondary',
};

const TYPE_LABELS: Record<Item['type'], string> = {
  weapon: 'Weapon',
  armor: 'Armor',
  potion: 'Potion',
  treasure: 'Treasure',
  quest: 'Quest',
  misc: 'Misc',
};

function WeightBar({ current, max }: { current: number; max: number }) {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  let barColor = 'bg-parchment-dark';
  if (percent > 75) barColor = 'bg-gold-coin';
  if (percent > 90) barColor = 'bg-blood-light';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="section-label">Weight</span>
        <span className="text-text-secondary">
          {current.toFixed(1)} / {max} lbs
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-surface-overlay overflow-hidden">
        <div
          className={`h-full rounded-full hp-bar-transition ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function ItemRow({
  item,
  onUse,
  onDrop,
}: {
  item: Item;
  onUse: (id: string) => void;
  onDrop: (id: string) => void;
}) {
  return (
    <div className="flex items-start gap-3 py-2 px-3 rounded hover:bg-surface-overlay transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${TYPE_COLORS[item.type]}`}>
            {item.name}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-overlay text-text-muted border border-surface-border">
            {TYPE_LABELS[item.type]}
          </span>
        </div>
        <p className="text-xs text-text-muted mt-0.5 truncate">
          {item.description}
        </p>
        <div className="flex gap-3 text-[10px] text-text-muted mt-0.5">
          <span>{item.weight} lbs</span>
          <span>{item.value} gp</span>
        </div>
      </div>
      <div className="flex gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
        {item.usable && (
          <button
            type="button"
            onClick={() => onUse(item.id)}
            className="px-2 py-1 text-[10px] rounded border border-emerald-glow/40 text-emerald-glow hover:bg-emerald-glow/10 transition-colors focus-ring"
          >
            Use
          </button>
        )}
        <button
          type="button"
          onClick={() => onDrop(item.id)}
          className="px-2 py-1 text-[10px] rounded border border-blood/40 text-blood-light hover:bg-blood/10 transition-colors focus-ring"
        >
          Drop
        </button>
      </div>
    </div>
  );
}

export function InventoryView({ inventory, onUse, onDrop, onClose }: InventoryViewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="panel-elevated w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
          <h2 className="font-fantasy text-parchment text-glow text-base">
            Inventory
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors text-lg leading-none"
            aria-label="Close inventory"
          >
            &times;
          </button>
        </div>

        {/* Weight bar */}
        <div className="px-4 py-3 border-b border-surface-border">
          <WeightBar current={inventory.currentWeight} max={inventory.maxWeight} />
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-1 py-2">
          {inventory.items.length === 0 ? (
            <p className="text-center text-text-muted text-sm py-8 italic">
              Your pack is empty.
            </p>
          ) : (
            inventory.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onUse={onUse}
                onDrop={onDrop}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-4 py-2 border-t border-surface-border text-xs text-text-muted">
          <span>{inventory.items.length} items</span>
          <button
            type="button"
            onClick={onClose}
            className="btn"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
