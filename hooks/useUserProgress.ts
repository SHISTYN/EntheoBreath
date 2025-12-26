
import { useState, useEffect, useCallback } from 'react';
import { get, set } from 'idb-keyval';

export const useUserProgress = () => {
    const [favorites, setFavorites] = useState<string[]>([]);

    // Загрузка избранного из IndexedDB
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const storedFavs = await get<string[]>('entheo_favorites');
                if (storedFavs) {
                    setFavorites(storedFavs);
                }
            } catch (e) {
                console.error("Failed to load favorites from IDB", e);
                // Fallback to localStorage if IDB fails
                const fallback = localStorage.getItem('entheo_favorites');
                if (fallback) setFavorites(JSON.parse(fallback));
            }
        };
        loadFavorites();
    }, []);

    const toggleFavorite = useCallback((id: string) => {
        setFavorites(prev => {
            const isFav = prev.includes(id);
            const newFavs = isFav ? prev.filter(f => f !== id) : [...prev, id];
            
            // Сохраняем и в IDB, и в localStorage для максимальной надежности
            set('entheo_favorites', newFavs);
            localStorage.setItem('entheo_favorites', JSON.stringify(newFavs));
            
            return newFavs;
        });
    }, []);

    const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

    return {
        favorites,
        toggleFavorite,
        isFavorite,
    };
};
