'use client';

import { useState, useEffect } from 'react';

export function useFavorites() {
    const [favorites, setFavorites] = useState<number[]>([]);

    // Charger depuis localStorage au montage
    useEffect(() => {
        const saved = localStorage.getItem('angora_favorites');
        if (saved) {
            setFavorites(JSON.parse(saved));
        }
    }, []);

    // Sauvegarder dans localStorage à chaque changement
    useEffect(() => {
        localStorage.setItem('angora_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const addFavorite = (id: number) => {
        setFavorites(prev => [...prev, id]);
    };

    const removeFavorite = (id: number) => {
        setFavorites(prev => prev.filter(fav => fav !== id));
    };

    const toggleFavorite = (id: number) => {
        if (favorites.includes(id)) {
            removeFavorite(id);
        } else {
            addFavorite(id);
        }
    };

    const isFavorite = (id: number) => favorites.includes(id);

    return { favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite };
}
