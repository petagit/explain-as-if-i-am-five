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
  const currentIndex = LEVELS.findIndex((l) => l.id === selectedLevel);
  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < LEVELS.length - 1;

  const goLeft = () => {
    if (canGoLeft && !disabled) {
      onLevelChange(LEVELS[currentIndex - 1].id);
    }
  };

  const goRight = () => {
    if (canGoRight && !disabled) {
      onLevelChange(LEVELS[currentIndex + 1].id);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
        Explanation Level
      </label>

      {/* Arrow navigation with level display */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {/* Left arrow */}
        <button
          onClick={goLeft}
          disabled={!canGoLeft || disabled}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            canGoLeft && !disabled
              ? "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:scale-110"
              : "bg-zinc-50 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
          }`}
          aria-label="Previous level (simpler)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Current level display */}
        <div className="min-w-[140px] text-center">
          <div className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg">
            <div className="font-semibold text-lg">
              {LEVELS[currentIndex].label}
            </div>
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={goRight}
          disabled={!canGoRight || disabled}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            canGoRight && !disabled
              ? "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:scale-110"
              : "bg-zinc-50 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
          }`}
          aria-label="Next level (more complex)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Level dots indicator */}
      <div className="flex items-center justify-center gap-2 mb-3">
        {LEVELS.map((level, i) => (
          <button
            key={level.id}
            onClick={() => !disabled && onLevelChange(level.id)}
            disabled={disabled}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === currentIndex
                ? "bg-blue-500 scale-125"
                : "bg-zinc-300 dark:bg-zinc-600 hover:bg-zinc-400 dark:hover:bg-zinc-500"
            } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
            aria-label={level.label}
            title={level.label}
          />
        ))}
      </div>

      {/* Complexity labels */}
      <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-500 px-8">
        <span>Simpler</span>
        <span>More Complex</span>
      </div>

      <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Use <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded text-xs font-mono">←</kbd>{" "}
        <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded text-xs font-mono">→</kbd>{" "}
        arrow keys to navigate
      </p>
    </div>
  );
}
