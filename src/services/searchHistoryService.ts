'use server';

import db from '@/utils/db';
import { revalidatePath } from 'next/cache';
import { RowDataPacket, OkPacket } from 'mysql2';

export interface SearchHistoryItem extends RowDataPacket {
  search_id: number;
  user_id: string;
  query_text: string;
  search_type: 'surah' | 'ayat';
  created_at: string;
  result_count: number;
}

export interface SearchHistoryParams {
  page?: number;
  limit?: number;
  userId: string;
}

export interface SearchHistoryResponse {
  items: SearchHistoryItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Save a search query to the user's search history
 */
export async function saveSearchHistory(
  userId: string,
  queryText: string,
  searchType: 'surah' | 'ayat',
  resultCount: number
): Promise<boolean> {
  try {
    if (!userId || !queryText) {
      console.warn('Missing required parameters for saveSearchHistory');
      return false;
    }

    const trimmedQuery = queryText.trim();

    // Check if a similar search exists in the last 5 minutes (to prevent duplicates)
    const existingSearches = await db.query({
      query: `SELECT search_id FROM search_history 
              WHERE user_id = ? 
              AND query_text = ? 
              AND search_type = ? 
              AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
              LIMIT 1`,
      values: [userId, trimmedQuery, searchType]
    });

    // If a recent search exists, don't add a duplicate
    if (Array.isArray(existingSearches) && existingSearches.length > 0) {
      console.log('Similar search found within 5 minutes, skipping save');
      return true;
    }

    await db.query({
      query: 'INSERT INTO search_history (user_id, query_text, search_type, result_count) VALUES (?, ?, ?, ?)',
      values: [userId, trimmedQuery, searchType, resultCount]
    });

    // Revalidate the user's profile page to show updated search history
    revalidatePath('/profile');
    return true;
  } catch (error) {
    console.error('Error saving search history:', error);
    return false;
  }
}

/**
 * Get the user's search history with pagination
 */
export async function getUserSearchHistory(
  params: SearchHistoryParams
): Promise<SearchHistoryResponse> {
  const { userId, page = 1, limit = 10 } = params;
  // Ensure limit and page are integers (MySQL prepared statements require raw integers)
  const safeLimit = Math.max(1, Math.floor(Number(limit)) || 10);
  const safePage = Math.max(1, Math.floor(Number(page)) || 1);

  if (!userId) {
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: safePage
    };
  }

  try {
    // Calculate offset for pagination
    const offset = (safePage - 1) * safeLimit;

    // Get total count
    const countResult = await db.query({
      query: 'SELECT COUNT(*) as total FROM search_history WHERE user_id = ?',
      values: [userId]
    });
    
    // Extract total from count result
    let totalItems = 0;
    if (Array.isArray(countResult) && countResult.length > 0) {
      totalItems = (countResult[0] as RowDataPacket & { total: number }).total || 0;
    }
    
    const totalPages = Math.ceil(totalItems / safeLimit);

    // Get paginated results (interpolate LIMIT/OFFSET directly)
    const rows = await db.query({
      query: `SELECT * FROM search_history 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ${offset}, ${safeLimit}`,
      values: [userId]
    });

    return {
      items: Array.isArray(rows) ? rows as SearchHistoryItem[] : [],
      totalItems,
      totalPages,
      currentPage: safePage
    };
  } catch (error) {
    console.error('Error fetching search history:', error);
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: safePage
    };
  }
}

/**
 * Delete a search history item
 */
export async function deleteSearchHistoryItem(searchId: number, userId: string): Promise<boolean> {
  try {
    if (!searchId || !userId) {
      return false;
    }

    await db.query({
      query: 'DELETE FROM search_history WHERE search_id = ? AND user_id = ?',
      values: [searchId, userId]
    });

    // Revalidate the user's profile page
    revalidatePath('/profile');
    return true;
  } catch (error) {
    console.error('Error deleting search history item:', error);
    return false;
  }
}

/**
 * Clear all search history for a user
 */
export async function clearSearchHistory(userId: string): Promise<boolean> {
  try {
    if (!userId) {
      return false;
    }

    await db.query({
      query: 'DELETE FROM search_history WHERE user_id = ?',
      values: [userId]
    });

    // Revalidate the user's profile page
    revalidatePath('/profile');
    return true;
  } catch (error) {
    console.error('Error clearing search history:', error);
    return false;
  }
}
