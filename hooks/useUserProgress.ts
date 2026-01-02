
import { useState, useEffect, useCallback } from 'react';
import { SessionHistoryItem } from '../types';

export const useUserProgress = () => {
    // State
    const [favorites, setFavorites] = useState<string[]>([]);
    const [history, setHistory] = useState<SessionHistoryItem[]>([]);

    // Load Data from LocalStorage on mount
    useEffect(() => {
        try {
            const storedFavs = localStorage.getItem('entheo_favorites');
            if (storedFavs) setFavorites(JSON.parse(storedFavs));

            const storedHistory = localStorage.getItem('entheo_history');
            if (storedHistory) setHistory(JSON.parse(storedHistory));
        } catch (e) {
            console.error("Failed to load user progress", e);
        }
    }, []);

    // Actions
    const toggleFavorite = useCallback((id: string) => {
        setFavorites(prev => {
            const newFavs = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
            localStorage.setItem('entheo_favorites', JSON.stringify(newFavs));
            return newFavs;
        });
    }, []);

    const saveSession = useCallback((item: Omit<SessionHistoryItem, 'id' | 'date'>) => {
        const newItem: SessionHistoryItem = {
            ...item,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
        };

        setHistory(prev => {
            const newHistory = [newItem, ...prev].slice(0, 100); // Keep last 100
            localStorage.setItem('entheo_history', JSON.stringify(newHistory));
            return newHistory;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem('entheo_history');
    }, []);

    const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

    return {
        favorites,
        toggleFavorite,
        isFavorite,
        history,
        saveSession,
        clearHistory
    };
};
