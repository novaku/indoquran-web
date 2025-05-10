import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

interface Bookmark {
  bookmark_id: number;
  user_id: string;
  surah_id: number;
  ayat_number: number;
  title: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface UseBookmarksOptions {
  userId: string;
}

// Cache for bookmarks data
const bookmarksCache: Record<string, {
  data: Bookmark[];
  timestamp: number;
}> = {};

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

export function useBookmarks({ userId }: UseBookmarksOptions) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchBookmarks = useCallback(async (forceRefresh: boolean = false) => {
    if (!userId) return;
    
    const cacheKey = `bookmarks_${userId}`;
    const now = Date.now();
    
    // Check cache if not forcing refresh
    if (!forceRefresh && bookmarksCache[cacheKey] && (now - bookmarksCache[cacheKey].timestamp < CACHE_TTL)) {
      setBookmarks(bookmarksCache[cacheKey].data);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/bookmarks?userId=${userId}`);
      if (response.data.success) {
        const bookmarksData = response.data.data;
        
        // Update state
        setBookmarks(bookmarksData);
        
        // Update cache
        bookmarksCache[cacheKey] = {
          data: bookmarksData,
          timestamp: now
        };
        
        // Track last updated time
        setLastUpdated(now);
      } else {
        setError(response.data.message || 'Gagal mengambil data bookmark');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengambil data bookmark');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addBookmark = useCallback(async (surahId: number, ayatNumber: number, title?: string, notes?: string) => {
    if (!userId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/bookmarks', {
        user_id: userId,
        surah_id: surahId,
        ayat_number: ayatNumber,
        title,
        notes
      });
      
      if (response.data.success) {
        // Refresh bookmarks after adding
        await fetchBookmarks();
        return response.data.data;
      } else {
        setError(response.data.message || 'Gagal menambahkan bookmark');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menambahkan bookmark');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchBookmarks]);

  const removeBookmark = useCallback(async (surahId: number, ayatNumber: number) => {
    if (!userId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.delete(`/api/bookmarks/${userId}/${surahId}/${ayatNumber}`);
      
      if (response.data.success) {
        // Refresh bookmarks after removing
        await fetchBookmarks();
        return true;
      } else {
        setError(response.data.message || 'Gagal menghapus bookmark');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menghapus bookmark');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchBookmarks]);

  const checkBookmark = useCallback(async (surahId: number, ayatNumber: number) => {
    if (!userId) return false;
    
    // Check in local cache first if available
    const cacheKey = `bookmarks_${userId}`;
    if (bookmarksCache[cacheKey]) {
      const cachedBookmark = bookmarksCache[cacheKey].data.find(
        bookmark => bookmark.surah_id === surahId && bookmark.ayat_number === ayatNumber
      );
      if (cachedBookmark) return true;
    }
    
    try {
      const response = await axios.get(`/api/bookmarks/${userId}/${surahId}/${ayatNumber}`);
      return response.data.success;
    } catch (err) {
      return false;
    }
  }, [userId]);
  
  // Load bookmarks from cache or fetch on mount
  useEffect(() => {
    if (userId) {
      const cacheKey = `bookmarks_${userId}`;
      const now = Date.now();
      
      if (bookmarksCache[cacheKey] && (now - bookmarksCache[cacheKey].timestamp < CACHE_TTL)) {
        // Use cache if valid
        setBookmarks(bookmarksCache[cacheKey].data);
      } else {
        // Fetch fresh data
        fetchBookmarks();
      }
    }
  }, [userId, fetchBookmarks]);

  return {
    bookmarks,
    loading,
    error,
    lastUpdated,
    fetchBookmarks: (forceRefresh: boolean = false) => fetchBookmarks(forceRefresh),
    addBookmark,
    removeBookmark,
    checkBookmark
  };
}
