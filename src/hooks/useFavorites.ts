import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

interface Favorite {
  favorite_id: number;
  user_id: string;
  surah_id: number;
  ayat_number: number;
  created_at: string;
}

interface UseFavoritesOptions {
  userId: string;
}

// Cache for favorites data
const favoritesCache: Record<string, {
  data: Favorite[];
  timestamp: number;
}> = {};

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

export function useFavorites({ userId }: UseFavoritesOptions) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchFavorites = useCallback(async (forceRefresh: boolean = false) => {
    if (!userId) return;
    
    const cacheKey = `favorites_${userId}`;
    const now = Date.now();
    
    // Check cache if not forcing refresh
    if (!forceRefresh && favoritesCache[cacheKey] && (now - favoritesCache[cacheKey].timestamp < CACHE_TTL)) {
      setFavorites(favoritesCache[cacheKey].data);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/favorites?userId=${userId}`);
      if (response.data.success) {
        const favoritesData = response.data.data;
        
        // Update state
        setFavorites(favoritesData);
        
        // Update cache
        favoritesCache[cacheKey] = {
          data: favoritesData,
          timestamp: now
        };
        
        // Track last updated time
        setLastUpdated(now);
      } else {
        setError(response.data.message || 'Gagal mengambil data favorit');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengambil data favorit');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addFavorite = useCallback(async (surahId: number, ayatNumber: number) => {
    if (!userId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/favorites', {
        user_id: userId,
        surah_id: surahId,
        ayat_number: ayatNumber
      });
      
      if (response.data.success) {
        // Refresh favorites after adding
        await fetchFavorites();
        return response.data.data;
      } else {
        setError(response.data.message || 'Gagal menambahkan favorit');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menambahkan favorit');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchFavorites]);

  const removeFavorite = useCallback(async (surahId: number, ayatNumber: number) => {
    if (!userId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.delete(`/api/favorites/${userId}/${surahId}/${ayatNumber}`);
      
      if (response.data.success) {
        // Refresh favorites after removing
        await fetchFavorites();
        return true;
      } else {
        setError(response.data.message || 'Gagal menghapus favorit');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menghapus favorit');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchFavorites]);

  const checkFavorite = useCallback(async (surahId: number, ayatNumber: number) => {
    if (!userId) return false;
    
    // Check in local cache first if available
    const cacheKey = `favorites_${userId}`;
    if (favoritesCache[cacheKey]) {
      const cachedFavorite = favoritesCache[cacheKey].data.find(
        favorite => favorite.surah_id === surahId && favorite.ayat_number === ayatNumber
      );
      if (cachedFavorite) return true;
    }
    
    try {
      const response = await axios.get(`/api/favorites/${userId}/${surahId}/${ayatNumber}`);
      return response.data.success && response.data.data.isFavorite;
    } catch (err) {
      return false;
    }
  }, [userId]);
  
  // Load favorites from cache or fetch on mount
  useEffect(() => {
    if (userId) {
      const cacheKey = `favorites_${userId}`;
      const now = Date.now();
      
      if (favoritesCache[cacheKey] && (now - favoritesCache[cacheKey].timestamp < CACHE_TTL)) {
        // Use cache if valid
        setFavorites(favoritesCache[cacheKey].data);
      } else {
        // Fetch fresh data
        fetchFavorites();
      }
    }
  }, [userId, fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    lastUpdated,
    fetchFavorites: (forceRefresh: boolean = false) => fetchFavorites(forceRefresh),
    addFavorite,
    removeFavorite,
    checkFavorite
  };
}
