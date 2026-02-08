import { useEffect, useRef } from 'react';
import type { LogEntry } from '@/lib/types';

type GameLogProps = {
  entries: LogEntry[];
};

const TYPE_COLORS: Record<LogEntry['type'], string> = {
  info: 'text-text-secondary',
  success: 'text-emerald-glow',
  warning: 'text-gold-coin',
  error: 'text-blood-light',
  combat: 'text-orange-400',
  dialogue: 'text-frost',
};

const BORDER_CLASSES: Record<LogEntry['type'], string> = {
  combat: 'log-border-combat',
  error: 'log-border-error',
  success: 'log-border-success',
  warning: 'log-border-warning',
  dialogue: 'log-border-dialogue',
  info: 'log-border-info',
};

export function GameLog({ entries }: GameLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-3 font-mono text-[13px]">
      {entries.length === 0 && (
        <p className="text-text-muted italic">Your adventure begins...</p>
      )}
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`animate-fade-in mb-2.5 leading-relaxed ${TYPE_COLORS[entry.type] ?? 'text-text-secondary'} ${BORDER_CLASSES[entry.type] ?? 'log-border-info'}`}
        >
          {entry.type === 'dialogue' && (
            <span className="text-frost/60 mr-1">&ldquo;</span>
          )}
          {entry.message}
          {entry.type === 'dialogue' && (
            <span className="text-frost/60 ml-0.5">&rdquo;</span>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
