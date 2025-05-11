import { query } from '@/utils/db';

export interface AyatNote {
  note_id: number;
  user_id: string;
  surah_id: number;
  ayat_number: number;
  content: string;
  is_public: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  username?: string; // For joining with user data when fetching public notes
  
  // Additional fields from API for UI display
  surah_name?: string;
  surah_name_arabic?: string;
}

export interface NoteInput {
  user_id: string;
  surah_id: number;
  ayat_number: number;
  content: string;
  is_public: boolean;
}

export const noteService = {
  async createNote(noteData: NoteInput): Promise<AyatNote> {
    try {
      const result = await query({
        query: `
          INSERT INTO ayat_notes (user_id, surah_id, ayat_number, content, is_public)
          VALUES (?, ?, ?, ?, ?)
        `,
        values: [
          noteData.user_id, 
          noteData.surah_id, 
          noteData.ayat_number, 
          noteData.content, 
          noteData.is_public
        ]
      });
      
      const notes = await query({
        query: 'SELECT * FROM ayat_notes WHERE note_id = ?',
        values: [(result as any).insertId]
      }) as AyatNote[];
      
      return notes[0];
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },
  
  async getNotesByUser(userId: string): Promise<AyatNote[]> {
    return await query({
      query: 'SELECT * FROM ayat_notes WHERE user_id = ? ORDER BY created_at DESC',
      values: [userId]
    }) as AyatNote[];
  },
  
  async getNotesByAyat(surahId: number, ayatNumber: number): Promise<AyatNote[]> {
    return await query({
      query: `
        SELECT n.*, u.username 
        FROM ayat_notes n
        JOIN users u ON n.user_id = u.user_id
        WHERE n.surah_id = ? AND n.ayat_number = ? AND n.is_public = TRUE
        ORDER BY n.likes_count DESC, n.created_at DESC
      `,
      values: [surahId, ayatNumber]
    }) as AyatNote[];
  },
  
  async getUserNoteForAyat(userId: string, surahId: number, ayatNumber: number): Promise<AyatNote | null> {
    const notes = await query({
      query: `
        SELECT * FROM ayat_notes 
        WHERE user_id = ? AND surah_id = ? AND ayat_number = ?
      `,
      values: [userId, surahId, ayatNumber]
    }) as AyatNote[];
    
    return notes.length > 0 ? notes[0] : null;
  },
  
  async updateNote(noteId: number, data: Partial<NoteInput>): Promise<boolean> {
    const fields = [];
    const values = [];
    
    if (data.content !== undefined) {
      fields.push('content = ?');
      values.push(data.content);
    }
    
    if (data.is_public !== undefined) {
      fields.push('is_public = ?');
      values.push(data.is_public);
    }
    
    if (fields.length === 0) {
      return false; // Nothing to update
    }
    
    values.push(noteId);
    
    const result = await query({
      query: `UPDATE ayat_notes SET ${fields.join(', ')} WHERE note_id = ?`,
      values
    });
    
    return (result as any).affectedRows > 0;
  },
  
  async deleteNote(noteId: number): Promise<boolean> {
    const result = await query({
      query: 'DELETE FROM ayat_notes WHERE note_id = ?',
      values: [noteId]
    });
    
    return (result as any).affectedRows > 0;
  },
  
  async likeNote(noteId: number, userId: string): Promise<boolean> {
    try {
      // First try to insert a like
      await query({
        query: `
          INSERT INTO note_likes (note_id, user_id)
          VALUES (?, ?)
        `,
        values: [noteId, userId]
      });
      
      // If successful, increment the likes_count
      await query({
        query: `
          UPDATE ayat_notes 
          SET likes_count = likes_count + 1 
          WHERE note_id = ?
        `,
        values: [noteId]
      });
      
      return true;
    } catch (error) {
      // If the user has already liked this note, this will fail
      console.error('Error liking note:', error);
      return false;
    }
  },
  
  async unlikeNote(noteId: number, userId: string): Promise<boolean> {
    try {
      // First delete the like
      const deleteResult = await query({
        query: `
          DELETE FROM note_likes 
          WHERE note_id = ? AND user_id = ?
        `,
        values: [noteId, userId]
      });
      
      if ((deleteResult as any).affectedRows > 0) {
        // If a row was deleted, decrement the likes_count
        await query({
          query: `
            UPDATE ayat_notes 
            SET likes_count = GREATEST(likes_count - 1, 0)
            WHERE note_id = ?
          `,
          values: [noteId]
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error unliking note:', error);
      return false;
    }
  },
  
  async checkIfUserLikedNote(noteId: number, userId: string): Promise<boolean> {
    const likes = await query({
      query: `
        SELECT 1 FROM note_likes 
        WHERE note_id = ? AND user_id = ?
      `,
      values: [noteId, userId]
    }) as any[];
    
    return likes.length > 0;
  },
  
  async getNoteById(noteId: number): Promise<AyatNote | null> {
    const notes = await query({
      query: 'SELECT * FROM ayat_notes WHERE note_id = ?',
      values: [noteId]
    }) as AyatNote[];
    
    return notes.length > 0 ? notes[0] : null;
  }
};
