"use client";

import { useState, useEffect, useCallback } from "react";
import { ExplanationLevel } from "@/lib/prompts";

export interface HistoryEntry {
  id: string;
  topic: string;
  level: ExplanationLevel;
  explanation: string;
  timestamp: number;
}

const STORAGE_KEY = "explanation-history";
const MAX_HISTORY_ITEMS = 20;

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        console.error("Failed to save history:", error);
      }
    }
  }, [history, isLoaded]);

  const addEntry = useCallback(
    (topic: string, level: ExplanationLevel, explanation: string) => {
      const newEntry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        topic,
        level,
        explanation,
        timestamp: Date.now(),
      };

      setHistory((prev) => {
        // Remove duplicate topics with same level
        const filtered = prev.filter(
          (entry) => !(entry.topic === topic && entry.level === level)
        );
        // Add new entry at the beginning and limit to max items
        return [newEntry, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      });

      return newEntry;
    },
    []
  );

  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    isLoaded,
    addEntry,
    removeEntry,
    clearHistory,
  };
}
