"use client";

import { LEVELS, ExplanationLevel } from "@/lib/prompts";

interface LevelSelectorProps {
  selectedLevel: ExplanationLevel;
  onLevelChange: (level: ExplanationLevel) => void;
  disabled?: boolean;
}

export function LevelSelector({
  selectedLevel,
  onLevelChange,
  disabled = false,
}: LevelSelectorProps) {
  return (
    <div className="w-full max-w-2xl">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
        Explanation Level
      </label>
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((level) => {
          const isSelected = selectedLevel === level.id;
          return (
            <button
              key={level.id}
              onClick={() => onLevelChange(level.id)}
              disabled={disabled}
              className={`
                px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                dark:focus:ring-offset-zinc-900
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }
              `}
              aria-pressed={isSelected}
            >
              {level.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Use <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded text-xs font-mono">←</kbd> <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded text-xs font-mono">→</kbd> arrow keys to navigate
      </p>
    </div>
  );
}
