'use client';

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

interface ReadingPosition {
  user_id: string;
  surah_id: number;
  ayat_number: number;
  last_read: string;
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
      const response = await axios.get(`/api/reading-position?userId=${userId}`);
      
      if (response.data.success) {
        setReadingPosition(response.data.data);
      } else {
        setError('Failed to fetch reading position');
      }
    } catch (err) {
      console.error('Error fetching reading position:', err);
      setError('Failed to fetch reading position');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Save reading position to the API
  const saveReadingPosition = useCallback(async (surahId: number, ayatNumber: number) => {
    if (!userId) return;
    
    // Don't set loading to true during save to avoid UI flicker
    setError(null);
    
    try {
      const now = Date.now();
      // Prevent excessive API calls by throttling saves to once per 5 seconds
      if (now - lastSaved < 5000) {
        return;
      }
      
      setLastSaved(now);
      
      const response = await axios.post('/api/reading-position', {
        user_id: userId,  // Fixed parameter name to match API expectations
        surah_id: surahId,
        ayat_number: ayatNumber
      });
      
      if (response.data.success) {
        setReadingPosition(response.data.data);
      } else {
        console.error('Failed to save reading position:', response.data.message);
      }
    } catch (err) {
      console.error('Error saving reading position:', err);
    }
  }, [userId, lastSaved]);

  // Initial fetch on component mount
  useEffect(() => {
    if (userId) {
      fetchReadingPosition();
    }
  }, [userId, fetchReadingPosition]);

  return {
    readingPosition,
    loading,
    error,
    saveReadingPosition,
    fetchReadingPosition
  };
}