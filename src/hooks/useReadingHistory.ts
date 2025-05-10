'use client';

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import offlineStorage from '@/utils/offlineStorage';

interface ReadingPosition {
  user_id: string;
  surah_id: number;
  ayat_number: number;
  last_read: string;
}

interface OfflineReadingPosition {
  id?: string;
  surahId: number;
  ayatNumber: number;
  timestamp: number;
}

interface UseReadingHistoryOptions {
  userId: string;
}

export function useReadingHistory({ userId }: UseReadingHistoryOptions) {
  const [readingPosition, setReadingPosition] = useState<ReadingPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<number>(0);

  // Fetch the current reading position from the API
  const fetchReadingPosition = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Try to get from API first
      const response = await axios.get(`/api/reading-position?userId=${userId}`);
      
      if (response.data.success) {
        setReadingPosition(response.data.data);
        
        // Save to offline storage for offline access
        if (offlineStorage.isOfflineSupported()) {
          offlineStorage.saveReadingPosition(userId, response.data.data.surah_id, response.data.data.ayat_number);
        }
      } else {
        // If API fails, try to get from offline storage
        if (offlineStorage.isOfflineSupported()) {
          const offlinePosition = await offlineStorage.getReadingPosition(userId) as OfflineReadingPosition;
          if (offlinePosition) {
            setReadingPosition({
              user_id: userId,
              surah_id: offlinePosition.surahId,
              ayat_number: offlinePosition.ayatNumber,
              last_read: new Date(offlinePosition.timestamp).toISOString()
            });
          }
        } else {
          setError(response.data.message || 'Gagal mengambil posisi membaca');
        }
      }
    } catch (err: any) {
      // On network error, try offline storage
      if (offlineStorage.isOfflineSupported()) {
        try {
          const offlinePosition = await offlineStorage.getReadingPosition(userId) as OfflineReadingPosition;
          if (offlinePosition) {
            setReadingPosition({
              user_id: userId,
              surah_id: offlinePosition.surahId,
              ayat_number: offlinePosition.ayatNumber,
              last_read: new Date(offlinePosition.timestamp).toISOString()
            });
          }
        } catch (offlineErr) {
          setError('Gagal mengambil posisi membaca dari penyimpanan offline');
        }
      } else {
        setError(err.message || 'Terjadi kesalahan saat mengambil posisi membaca');
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Save the current reading position
  const saveReadingPosition = useCallback(async (surahId: number, ayatNumber: number) => {
    if (!userId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      // Save to offline storage first for immediate feedback
      if (offlineStorage.isOfflineSupported()) {
        await offlineStorage.saveReadingPosition(userId, surahId, ayatNumber);
      }
      
      // Then save to the server
      const response = await axios.post('/api/reading-position', {
        user_id: userId,
        surah_id: surahId,
        ayat_number: ayatNumber
      });
      
      if (response.data.success) {
        setReadingPosition({
          user_id: userId,
          surah_id: surahId,
          ayat_number: ayatNumber,
          last_read: new Date().toISOString()
        });
        setLastSaved(Date.now());
        return true;
      } else {
        // Even if server save fails, we still have offline data
        setError(response.data.message || 'Gagal menyimpan posisi membaca ke server');
        return false;
      }
    } catch (err: any) {
      // Server save failed, but offline save might have succeeded
      setError(err.message || 'Terjadi kesalahan saat menyimpan posisi membaca');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load reading position on mount
  useEffect(() => {
    if (userId) {
      fetchReadingPosition();
    }
  }, [userId, fetchReadingPosition]);

  return {
    readingPosition,
    loading,
    error,
    lastSaved,
    fetchReadingPosition,
    saveReadingPosition
  };
}