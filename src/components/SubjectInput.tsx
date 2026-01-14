"use client";

interface SubjectInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function SubjectInput({
  value,
  onChange,
  onSubmit,
  isLoading,
}: SubjectInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading && value.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <label
        htmlFor="topic"
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
      >
        What would you like explained?
      </label>
      <div className="relative">
        <input
          id="topic"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a topic (e.g., quantum physics, blockchain, photosynthesis)"
          disabled={isLoading}
          className="w-full px-4 py-3 text-lg border border-zinc-300 dark:border-zinc-600
                     rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
                     placeholder-zinc-400 dark:placeholder-zinc-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Press <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded text-xs font-mono">Enter</kbd> to submit
      </p>
    </div>
  );
}
