import { useState, useEffect } from 'react';

export interface MatchHistoryItem {
  id: string;
  timestamp: number;
  imageUrl: string;
  topMatch: {
    name: string;
    profileSlug: string;
    profileImageUrl: string;
    similarityPercentage: number;
    profession: string;
  };
  topThree: Array<{
    name: string;
    profileSlug: string;
    similarityPercentage: number;
  }>;
}

const STORAGE_KEY = 'celebrity-match-history';
const MAX_HISTORY_ITEMS = 5;

export const useMatchHistory = () => {
  const [history, setHistory] = useState<MatchHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Failed to load match history:', error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  const saveToStorage = (newHistory: MatchHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save match history:', error);
    }
  };

  const addToHistory = (item: Omit<MatchHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: MatchHistoryItem = {
      ...item,
      id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    const newHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    setHistory(newHistory);
    saveToStorage(newHistory);
  };

  const removeFromHistory = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    saveToStorage(newHistory);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
};
