'use client';

import { useState } from 'react';
import { 
  getUserSearchHistory, 
  deleteSearchHistoryItem, 
  clearSearchHistory,
  SearchHistoryItem,
  SearchHistoryResponse
} from '@/services/searchHistoryService';

interface UseSearchHistoryProps {
  userId: string;
}

export function useSearchHistory({ userId }: UseSearchHistoryProps) {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  /**
   * Fetch user's search history with pagination
   */
  const fetchSearchHistory = async (page = 1, limit = 10) => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    setLoading(true);
    
    try {
      const response: SearchHistoryResponse = await getUserSearchHistory({
        userId,
        page,
        limit
      });

      setSearchHistory(response.items);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalItems: response.totalItems
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching search history:', err);
      setError('Failed to load search history');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a specific search history item
   */
  const removeSearchHistoryItem = async (searchId: number) => {
    if (!userId || !searchId) {
      setError('Missing required parameters');
      return false;
    }

    try {
      const success = await deleteSearchHistoryItem(searchId, userId);
      
      if (success) {
        // Update the local state
        setSearchHistory(prevHistory => 
          prevHistory.filter(item => item.search_id !== searchId)
        );
      }
      
      return success;
    } catch (err) {
      console.error('Error removing search history item:', err);
      setError('Failed to remove search history item');
      return false;
    }
  };

  /**
   * Clear all search history for the user
   */
  const clearAllSearchHistory = async () => {
    if (!userId) {
      setError('User ID is required');
      return false;
    }

    try {
      const success = await clearSearchHistory(userId);
      
      if (success) {
        // Clear local state
        setSearchHistory([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0
        });
      }
      
      return success;
    } catch (err) {
      console.error('Error clearing search history:', err);
      setError('Failed to clear search history');
      return false;
    }
  };

  return {
    searchHistory,
    loading,
    error,
    pagination,
    fetchSearchHistory,
    removeSearchHistoryItem,
    clearAllSearchHistory
  };
}
