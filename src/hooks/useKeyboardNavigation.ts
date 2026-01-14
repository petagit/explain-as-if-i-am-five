"use client";

import { useEffect, useCallback } from "react";
import { LEVELS, ExplanationLevel } from "@/lib/prompts";

interface UseKeyboardNavigationProps {
  currentLevel: ExplanationLevel;
  onLevelChange: (level: ExplanationLevel) => void;
  onSubmit: () => void;
  hasSubmitted: boolean;
  isLoading: boolean;
  topic: string;
}

export function useKeyboardNavigation({
  currentLevel,
  onLevelChange,
  onSubmit,
  hasSubmitted,
  isLoading,
  topic,
}: UseKeyboardNavigationProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle keyboard navigation when typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const currentIndex = LEVELS.findIndex((l) => l.id === currentLevel);

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (currentIndex > 0) {
            const newLevel = LEVELS[currentIndex - 1].id;
            onLevelChange(newLevel);
          }
          break;

        case "ArrowRight":
          e.preventDefault();
          if (currentIndex < LEVELS.length - 1) {
            const newLevel = LEVELS[currentIndex + 1].id;
            onLevelChange(newLevel);
          }
          break;

        case "Enter":
          // Only trigger submit from global keyboard if not in input
          if (!isLoading && topic.trim()) {
            onSubmit();
          }
          break;
      }
    },
    [currentLevel, onLevelChange, onSubmit, isLoading, topic]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}
