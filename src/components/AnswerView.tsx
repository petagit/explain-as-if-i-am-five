"use client";

import { useState, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { LEVELS, getLevelConfig, ExplanationLevel } from "@/lib/prompts";

interface AnswerViewProps {
  topic: string;
  explanation: string;
  level: ExplanationLevel;
  isLoading: boolean;
  onLevelChange: (level: ExplanationLevel) => void;
  onBack: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
      aria-label={copied ? "Copied!" : "Copy to clipboard"}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? (
        <svg
          className="w-5 h-5 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-zinc-500 dark:text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  );
}

export function AnswerView({
  topic,
  explanation,
  level,
  isLoading,
  onLevelChange,
  onBack,
}: AnswerViewProps) {
  const levelConfig = getLevelConfig(level);
  const currentIndex = LEVELS.findIndex((l) => l.id === level);
  const [isVisible, setIsVisible] = useState(false);

  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < LEVELS.length - 1;

  const goLeft = useCallback(() => {
    if (canGoLeft && !isLoading) {
      onLevelChange(LEVELS[currentIndex - 1].id);
    }
  }, [canGoLeft, currentIndex, isLoading, onLevelChange]);

  const goRight = useCallback(() => {
    if (canGoRight && !isLoading) {
      onLevelChange(LEVELS[currentIndex + 1].id);
    }
  }, [canGoRight, currentIndex, isLoading, onLevelChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goLeft();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goRight();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goLeft, goRight, onBack]);

  // Trigger animation when explanation changes
  useEffect(() => {
    if (explanation && !isLoading) {
      setIsVisible(false);
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [explanation, isLoading]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Header with back button and topic */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="text-sm font-medium">New Topic</span>
        </button>

        <div className="flex items-center gap-2">
          {explanation && !isLoading && <CopyButton text={explanation} />}
        </div>
      </div>

      {/* Topic display */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {topic}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Press <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded text-xs font-mono">←</kbd>{" "}
          <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded text-xs font-mono">→</kbd>{" "}
          or click arrows to change level •{" "}
          <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded text-xs font-mono">Esc</kbd>{" "}
          for new topic
        </p>
      </div>

      {/* Main content with arrows */}
      <div className="flex items-center gap-4">
        {/* Left Arrow */}
        <button
          onClick={goLeft}
          disabled={!canGoLeft || isLoading}
          className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
            canGoLeft && !isLoading
              ? "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:scale-110 cursor-pointer"
              : "bg-zinc-50 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
          }`}
          aria-label="Previous level"
        >
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Content Card */}
        <div className="flex-1 min-w-0">
          {/* Level indicator */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {LEVELS.map((l, i) => (
              <button
                key={l.id}
                onClick={() => !isLoading && onLevelChange(l.id)}
                disabled={isLoading}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  i === currentIndex
                    ? "bg-blue-500 scale-125"
                    : "bg-zinc-300 dark:bg-zinc-600 hover:bg-zinc-400 dark:hover:bg-zinc-500"
                } ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
                aria-label={l.label}
                title={l.label}
              />
            ))}
          </div>

          {/* Level badge */}
          <div className="flex justify-center mb-4">
            <span className="px-4 py-1.5 text-sm font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
              {levelConfig.label}
            </span>
          </div>

          {/* Explanation card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm min-h-[200px]">
            {isLoading && !explanation ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-4/5" />
              </div>
            ) : (
              <div
                className={`prose dark:prose-invert prose-zinc max-w-none transition-all duration-500 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }`}
              >
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4 last:mb-0">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 text-zinc-700 dark:text-zinc-300 mb-4">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 text-zinc-700 dark:text-zinc-300 mb-4">
                        {children}
                      </ol>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-zinc-600 dark:text-zinc-400">
                        {children}
                      </em>
                    ),
                    code: ({ children }) => (
                      <code className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded text-sm font-mono">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {explanation || ""}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Level labels below */}
          <div className="flex justify-between mt-3 px-2 text-xs text-zinc-400 dark:text-zinc-500">
            <span>Simpler</span>
            <span>More Complex</span>
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={goRight}
          disabled={!canGoRight || isLoading}
          className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
            canGoRight && !isLoading
              ? "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:scale-110 cursor-pointer"
              : "bg-zinc-50 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
          }`}
          aria-label="Next level"
        >
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
