import { useState, useCallback } from 'react';
import { AyatNote } from '@/services/noteService';

interface UseNotesOptions {
  userId?: string;
}

export function useNotes({ userId }: UseNotesOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get current user's note for a specific ayat
  const getUserNote = useCallback(async (surahId: number, ayatNumber: number) => {
    if (!userId) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/notes?userId=${userId}&surahId=${surahId}&ayatNumber=${ayatNumber}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get note');
      }
      
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  // Get all public notes for an ayat
  const getPublicNotes = useCallback(async (surahId: number, ayatNumber: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/notes?surahId=${surahId}&ayatNumber=${ayatNumber}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get public notes');
      }
      
      return result.data as AyatNote[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Get the count of notes for an ayat
  const getNotesCount = useCallback(async (surahId: number, ayatNumber: number) => {
    try {
      const response = await fetch(`/api/notes/count?surahId=${surahId}&ayatNumber=${ayatNumber}`);
      const result = await response.json();
      
      if (!result.success) {
        console.error('Failed to get notes count:', result.message);
        return 0;
      }
      
      return result.data.count;
    } catch (err) {
      console.error('Error getting notes count:', err);
      return 0;
    }
  }, []);
  
  // Create a new note
  const addNote = useCallback(async (surahId: number, ayatNumber: number, content: string, isPublic: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          surah_id: surahId,
          ayat_number: ayatNumber,
          content,
          is_public: isPublic
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create note');
      }
      
      return result.data as AyatNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Update an existing note
  const updateNote = useCallback(async (noteId: number, surahId: number, ayatNumber: number, updates: { content?: string; isPublic?: boolean }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/notes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          note_id: noteId,
          surah_id: surahId,
          ayat_number: ayatNumber,
          content: updates.content,
          is_public: updates.isPublic
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update note');
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Delete a note
  const deleteNote = useCallback(async (noteId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete note');
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Like a note
  const likeNote = useCallback(async (noteId: number) => {
    if (!userId) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/notes/${noteId}/like`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to like note');
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  // Unlike a note
  const unlikeNote = useCallback(async (noteId: number) => {
    if (!userId) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/notes/${noteId}/like`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to unlike note');
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  // Check if user has liked a note
  const checkIfLiked = useCallback(async (noteId: number) => {
    if (!userId) return false;
    
    try {
      const response = await fetch(`/api/notes/${noteId}/like/check`);
      const result = await response.json();
      
      return result.success && result.data.liked;
    } catch (err) {
      console.error('Error checking if note is liked:', err);
      return false;
    }
  }, [userId]);

  // Get all notes for the current user
  const getUserNotes = useCallback(async (forceRefresh = false) => {
    if (!userId) return [];
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/notes/user/${userId}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get user notes');
      }
      
      // Fix: properly access the notes array from the response structure
      return result.data.notes as AyatNote[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred fetching your notes');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  return {
    isLoading,
    error,
    getUserNote,
    getPublicNotes,
    addNote,
    updateNote,
    deleteNote,
    likeNote,
    unlikeNote,
    checkIfLiked,
    getUserNotes,
    getNotesCount
  };
}
