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

  const canGoUp = currentIndex > 0;
  const canGoDown = currentIndex < LEVELS.length - 1;

  const goUp = useCallback(() => {
    if (canGoUp && !isLoading) {
      onLevelChange(LEVELS[currentIndex - 1].id);
    }
  }, [canGoUp, currentIndex, isLoading, onLevelChange]);

  const goDown = useCallback(() => {
    if (canGoDown && !isLoading) {
      onLevelChange(LEVELS[currentIndex + 1].id);
    }
  }, [canGoDown, currentIndex, isLoading, onLevelChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goUp();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goDown();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goUp, goDown, onBack]);

  // Trigger animation when explanation changes
  useEffect(() => {
    if (explanation && !isLoading) {
      setIsVisible(false);
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [explanation, isLoading]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Header */}
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

        <div className="text-xs text-zinc-400 dark:text-zinc-500">
          <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded font-mono">←</kbd>{" "}
          <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded font-mono">→</kbd>{" "}
          change level
        </div>
      </div>

      {/* Main content - side by side */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side - Topic and Level selector */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="sticky top-24">
            {/* Topic */}
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
              {topic}
            </h1>

            {/* Level selector with arrows */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Explanation Level
              </div>

              {/* Up arrow */}
              <button
                onClick={goUp}
                disabled={!canGoUp || isLoading}
                className={`w-full flex items-center justify-center py-2 rounded-lg transition-all ${
                  canGoUp && !isLoading
                    ? "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    : "text-zinc-200 dark:text-zinc-700 cursor-not-allowed"
                }`}
                aria-label="Simpler level"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>

              {/* Level buttons */}
              <div className="space-y-1">
                {LEVELS.map((l, i) => {
                  const isSelected = i === currentIndex;
                  return (
                    <button
                      key={l.id}
                      onClick={() => !isLoading && onLevelChange(l.id)}
                      disabled={isLoading}
                      className={`w-full px-4 py-3 rounded-xl text-left transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      } ${isLoading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                    >
                      <div className="font-medium">{l.label}</div>
                    </button>
                  );
                })}
              </div>

              {/* Down arrow */}
              <button
                onClick={goDown}
                disabled={!canGoDown || isLoading}
                className={`w-full flex items-center justify-center py-2 rounded-lg transition-all ${
                  canGoDown && !isLoading
                    ? "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    : "text-zinc-200 dark:text-zinc-700 cursor-not-allowed"
                }`}
                aria-label="More complex level"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Complexity indicator */}
              <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-500 pt-2">
                <span>Simpler</span>
                <span>Complex</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Explanation */}
        <div className="flex-1 min-w-0">
          {/* Header with level badge and copy button */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-4 py-1.5 text-sm font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
              {levelConfig.label}
            </span>
            {explanation && !isLoading && <CopyButton text={explanation} />}
          </div>

          {/* Explanation card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm min-h-[400px]">
            {isLoading && !explanation ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2 mt-6" />
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
                    p: ({ children, ...props }) => {
                      // Check if this is the first paragraph (definition)
                      const isFirst = props.node?.position?.start.line === 1;
                      if (isFirst) {
                        return (
                          <p className="text-xl font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
                            {children}
                          </p>
                        );
                      }
                      return (
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4 last:mb-0">
                          {children}
                        </p>
                      );
                    },
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
        </div>
      </div>
    </div>
  );
}
