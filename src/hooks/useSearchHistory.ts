'use client';

import { useState } from 'react';
import {
  getUserSearchHistory,
  deleteSearchHistoryItem,
  clearSearchHistory,
  SearchHistoryItem,
  SearchHistoryResponse
} from '@/services/searchHistoryService';

interface GroupedSearchHistoryItem extends Omit<SearchHistoryItem, 'created_at'> {
  count: number;
  latest_created_at: string;
  original_search_ids: number[]; // To keep track of original IDs for potential deletion strategies
}

interface UseSearchHistoryProps {
  userId: string;
}

export function useSearchHistory({ userId }: UseSearchHistoryProps) {
  const [searchHistory, setSearchHistory] = useState<GroupedSearchHistoryItem[]>([]);
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
  const fetchSearchHistory = async (page = 1, limit = 10) => { // Page and limit for final paginated grouped data
    if (!userId) {
      setError('User ID is required');
      return;
    }

    setLoading(true);
    
    try {
      // Fetch all items from backend for client-side grouping.
      // Adjust if backend supports grouped fetching or if performance becomes an issue.
      const response: SearchHistoryResponse = await getUserSearchHistory({
        userId,
        page: 1, // Fetch all, then paginate client-side
        limit: 10000 // A large number to fetch all/most items
      });

      const groupedItems: Record<string, GroupedSearchHistoryItem> = {};
      response.items.forEach(item => {
        const key = `${item.query_text.toLowerCase().trim()}_${item.search_type}`;
        if (groupedItems[key]) {
          groupedItems[key].count += 1;
          // Summing result_count might not be meaningful if they are from different searches.
          // Let's keep the result_count of the latest item or average if needed. For now, latest.
          if (new Date(item.created_at) > new Date(groupedItems[key].latest_created_at)) {
            groupedItems[key].latest_created_at = item.created_at;
            groupedItems[key].search_id = item.search_id; // Use the latest search_id for the group representative
            groupedItems[key].result_count = item.result_count;
          }
          groupedItems[key].original_search_ids.push(item.search_id);
        } else {
          groupedItems[key] = {
            search_id: item.search_id,
            user_id: item.user_id,
            query_text: item.query_text,
            search_type: item.search_type,
            result_count: item.result_count,
            count: 1,
            latest_created_at: item.created_at,
            original_search_ids: [item.search_id],
          };
        }
      });

      const processedHistory = Object.values(groupedItems).sort((a, b) => new Date(b.latest_created_at).getTime() - new Date(a.latest_created_at).getTime());
      
      const paginatedHistory = processedHistory.slice((page - 1) * limit, page * limit);

      setSearchHistory(paginatedHistory);
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(processedHistory.length / limit),
        totalItems: processedHistory.length
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
   * Delete a specific search history item (which now represents a group or the latest of a group)
   * This will delete the representative search_id. To delete all items in a group,
   * the backend would need a new endpoint or logic.
   * For now, deleting one and refetching will update the count.
   */
  const removeSearchHistoryItem = async (searchId: number) => {
    if (!userId || !searchId) {
      setError('Missing required parameters for remove');
      return false;
    }

    try {
      // This deletes the specific entry with searchId.
      // If this searchId is a representative of a group, the group's count will reduce upon refetch.
      const success = await deleteSearchHistoryItem(searchId, userId);
      
      if (success) {
        // Refetch to update the grouped list and counts
        // This ensures that if the deleted item was part of a group, the count is updated.
        await fetchSearchHistory(pagination.currentPage, pagination.totalItems > 0 ? Math.ceil(pagination.totalItems / pagination.totalPages) : 10);
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
