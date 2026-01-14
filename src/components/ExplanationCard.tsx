"use client";

import { useState, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { getLevelConfig, ExplanationLevel } from "@/lib/prompts";

interface ExplanationCardProps {
  explanation: string | null;
  level: ExplanationLevel;
  topic: string;
  isLoading: boolean;
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

export function ExplanationCard({
  explanation,
  level,
  topic,
  isLoading,
}: ExplanationCardProps) {
  const levelConfig = getLevelConfig(level);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animation when explanation changes
  useEffect(() => {
    if (explanation && !isLoading) {
      setIsVisible(false);
      // Small delay to ensure animation triggers
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [explanation, isLoading]);

  if (!explanation && !isLoading) {
    return (
      <div className="w-full max-w-2xl p-8 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600">
        <p className="text-center text-zinc-500 dark:text-zinc-400">
          Enter a topic and press Enter to get an explanation
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
            {levelConfig.label}
          </span>
          {topic && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">
              {topic}
            </span>
          )}
        </div>
        {explanation && !isLoading && <CopyButton text={explanation} />}
      </div>

      <div className="p-6 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
        {isLoading ? (
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
    </div>
  );
}
