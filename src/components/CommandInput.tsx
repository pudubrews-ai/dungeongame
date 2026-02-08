import { useState, useCallback, useRef, type KeyboardEvent, type FormEvent } from 'react';

type CommandInputProps = {
  onSubmit: (input: string) => void;
  disabled: boolean;
};

export function CommandInput({ onSubmit, disabled }: CommandInputProps) {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (!trimmed || disabled) return;

      onSubmit(trimmed);
      setHistory((prev) => [trimmed, ...prev.slice(0, 49)]);
      setHistoryIndex(-1);
      setValue('');
    },
    [value, disabled, onSubmit],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHistoryIndex((prev) => {
          const next = Math.min(prev + 1, history.length - 1);
          if (history[next] != null) setValue(history[next]);
          return next;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHistoryIndex((prev) => {
          const next = prev - 1;
          if (next < 0) {
            setValue('');
            return -1;
          }
          if (history[next] != null) setValue(history[next]);
          return next;
        });
      }
    },
    [history],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 px-5 py-3 border-t border-surface-border bg-surface-raised"
    >
      <span className="text-parchment font-mono text-sm select-none">&gt;</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setHistoryIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? 'Please wait...' : 'Enter command...'}
        autoFocus
        className="flex-1 bg-transparent text-text-primary font-mono text-sm caret-parchment placeholder:text-text-muted outline-none disabled:opacity-50 focus-ring"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="btn"
      >
        Send
      </button>
    </form>
  );
}
