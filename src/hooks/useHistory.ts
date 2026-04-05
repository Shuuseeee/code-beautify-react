"use client";

import { useState, useCallback, useEffect } from "react";

const HISTORY_KEY = "beautify_history";
const MAX_ENTRIES = 5;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  input: string;
  output: string;
  lang: string;
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // SSR-safe: load from localStorage after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    }
  }, []);

  const addEntry = useCallback((input: string, output: string, lang: string) => {
    setHistory((prev) => {
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        input: input.slice(0, 8000),
        output: output.slice(0, 8000),
        lang,
      };
      const next = [entry, ...prev].slice(0, MAX_ENTRIES);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // ignore
    }
    setHistory([]);
  }, []);

  return { history, addEntry, clearHistory };
}
