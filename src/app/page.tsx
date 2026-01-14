"use client";

import { useState, useCallback, useRef } from "react";
import { SubjectInput } from "@/components/SubjectInput";
import { LevelSelector } from "@/components/LevelSelector";
import { ExplanationCard } from "@/components/ExplanationCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HistoryPanel } from "@/components/HistoryPanel";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useHistory, HistoryEntry } from "@/hooks/useHistory";
import { ExplanationLevel } from "@/lib/prompts";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [selectedLevel, setSelectedLevel] =
    useState<ExplanationLevel>("5-year-old");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedTopic, setSubmittedTopic] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const { history, addEntry, removeEntry, clearHistory } = useHistory();

  const fetchExplanation = useCallback(
    async (topicToExplain: string, level: ExplanationLevel) => {
      if (!topicToExplain.trim()) return;

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setExplanation("");

      try {
        const response = await fetch("/api/explain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: topicToExplain,
            level: level,
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch explanation");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.text) {
                  fullText += data.text;
                  setExplanation(fullText);
                }
                if (data.done) {
                  // Add to history when complete
                  addEntry(topicToExplain, level, fullText);
                }
              } catch {
                // Ignore JSON parse errors for incomplete chunks
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Request was cancelled, ignore
          return;
        }
        console.error("Error fetching explanation:", error);
        setExplanation("Sorry, something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [addEntry]
  );

  const handleSubmit = useCallback(() => {
    if (topic.trim() && !isLoading) {
      setHasSubmitted(true);
      setSubmittedTopic(topic);
      fetchExplanation(topic, selectedLevel);
    }
  }, [topic, selectedLevel, isLoading, fetchExplanation]);

  const handleLevelChange = useCallback(
    (newLevel: ExplanationLevel) => {
      setSelectedLevel(newLevel);
      // Auto-regenerate if we've already submitted
      if (hasSubmitted && submittedTopic) {
        fetchExplanation(submittedTopic, newLevel);
      }
    },
    [hasSubmitted, submittedTopic, fetchExplanation]
  );

  const handleClear = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setTopic("");
    setExplanation(null);
    setHasSubmitted(false);
    setSubmittedTopic("");
    setSelectedLevel("5-year-old");
    setIsLoading(false);
  }, []);

  const handleSelectHistoryEntry = useCallback((entry: HistoryEntry) => {
    setTopic(entry.topic);
    setSelectedLevel(entry.level);
    setExplanation(entry.explanation);
    setHasSubmitted(true);
    setSubmittedTopic(entry.topic);
  }, []);

  useKeyboardNavigation({
    currentLevel: selectedLevel,
    onLevelChange: handleLevelChange,
    onSubmit: handleSubmit,
    hasSubmitted,
    isLoading,
    topic,
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors duration-200">
      <header className="fixed top-0 right-0 p-4 z-10">
        <ThemeToggle />
      </header>

      <HistoryPanel
        history={history}
        onSelectEntry={handleSelectHistoryEntry}
        onDeleteEntry={removeEntry}
        onClearHistory={clearHistory}
      />

      <main className="flex flex-col items-center justify-start min-h-screen px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Explain As If I Am?
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            Get any concept explained at your level of understanding
          </p>
        </div>

        <div className="w-full max-w-2xl space-y-8">
          <div className="relative">
            <SubjectInput
              value={topic}
              onChange={setTopic}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
            {(topic || explanation) && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                aria-label="Clear"
                title="Clear"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <LevelSelector
            selectedLevel={selectedLevel}
            onLevelChange={handleLevelChange}
            disabled={isLoading}
          />

          <ExplanationCard
            explanation={explanation}
            level={selectedLevel}
            topic={submittedTopic}
            isLoading={isLoading && !explanation}
          />
        </div>

        <footer className="mt-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>Powered by Google Gemini</p>
          <p className="mt-1 text-xs">
            Use arrow keys to switch levels, Enter to submit
          </p>
        </footer>
      </main>
    </div>
  );
}
