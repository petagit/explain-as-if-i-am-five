"use client";

import { useState, useCallback, useRef } from "react";
import { SubjectInput } from "@/components/SubjectInput";
import { LevelSelector } from "@/components/LevelSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HistoryPanel } from "@/components/HistoryPanel";
import { AnswerView } from "@/components/AnswerView";
import { useHistory, HistoryEntry } from "@/hooks/useHistory";
import { ExplanationLevel } from "@/lib/prompts";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [selectedLevel, setSelectedLevel] =
    useState<ExplanationLevel>("5-year-old");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedTopic, setSubmittedTopic] = useState("");
  const [view, setView] = useState<"input" | "answer">("input");
  const abortControllerRef = useRef<AbortController | null>(null);

  const { history, addEntry, removeEntry, clearHistory } = useHistory();

  const fetchExplanation = useCallback(
    async (topicToExplain: string, level: ExplanationLevel, addToHistory = true) => {
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
                if (data.done && addToHistory) {
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
      setSubmittedTopic(topic);
      setView("answer");
      fetchExplanation(topic, selectedLevel);
    }
  }, [topic, selectedLevel, isLoading, fetchExplanation]);

  const handleLevelChange = useCallback(
    (newLevel: ExplanationLevel) => {
      setSelectedLevel(newLevel);
      // If in answer view, regenerate with new level
      if (view === "answer" && submittedTopic) {
        fetchExplanation(submittedTopic, newLevel);
      }
    },
    [view, submittedTopic, fetchExplanation]
  );

  const handleBack = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setView("input");
    setTopic("");
    setExplanation(null);
    setSubmittedTopic("");
    setSelectedLevel("5-year-old");
    setIsLoading(false);
  }, []);

  const handleSelectHistoryEntry = useCallback((entry: HistoryEntry) => {
    setTopic(entry.topic);
    setSelectedLevel(entry.level);
    setExplanation(entry.explanation);
    setSubmittedTopic(entry.topic);
    setView("answer");
  }, []);

  const handleNewTopic = useCallback(
    (newTopic: string) => {
      setTopic(newTopic);
      setSubmittedTopic(newTopic);
      fetchExplanation(newTopic, selectedLevel);
    },
    [selectedLevel, fetchExplanation]
  );

  // Handle Enter key in input view
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && view === "input" && topic.trim() && !isLoading) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [view, topic, isLoading, handleSubmit]
  );

  return (
    <div
      className="min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors duration-200"
      onKeyDown={handleKeyDown}
    >
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
        {view === "input" ? (
          <>
            {/* Input View */}
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                Explain As If I Am?
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                Get any concept explained at your level of understanding
              </p>
            </div>

            <div className="w-full max-w-2xl space-y-8">
              <SubjectInput
                value={topic}
                onChange={setTopic}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />

              <LevelSelector
                selectedLevel={selectedLevel}
                onLevelChange={setSelectedLevel}
                disabled={isLoading}
              />

              <div className="flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={!topic.trim() || isLoading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white disabled:text-zinc-500 dark:disabled:text-zinc-400 font-medium rounded-xl transition-colors disabled:cursor-not-allowed"
                >
                  {isLoading ? "Generating..." : "Explain It!"}
                </button>
              </div>
            </div>

            <footer className="mt-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
              <p>Powered by Google Gemini</p>
            </footer>
          </>
        ) : (
          /* Answer View */
          <AnswerView
            topic={submittedTopic}
            explanation={explanation || ""}
            level={selectedLevel}
            isLoading={isLoading}
            onLevelChange={handleLevelChange}
            onBack={handleBack}
            onNewTopic={handleNewTopic}
          />
        )}
      </main>
    </div>
  );
}
