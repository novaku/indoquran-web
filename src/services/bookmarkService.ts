import { query } from '@/utils/db';

export interface Bookmark {
  bookmark_id: number;
  user_id: string;
  surah_id: number;
  ayat_number: number;
  title: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookmarkInput {
  user_id: string;
  surah_id: number;
  ayat_number: number;
  title?: string;
  notes?: string;
}

export const bookmarkService = {
  async createBookmark(bookmarkData: BookmarkInput): Promise<Bookmark> {
    try {
      const result = await query({
        query: `
          INSERT INTO bookmarks (user_id, surah_id, ayat_number, title, notes)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE title = VALUES(title), notes = VALUES(notes)
        `,
        values: [
          bookmarkData.user_id, 
          bookmarkData.surah_id, 
          bookmarkData.ayat_number, 
          bookmarkData.title || null, 
          bookmarkData.notes || null
        ]
      });
      
      // If the bookmark already existed and was updated
      if ((result as any).insertId === 0) {
        const bookmarks = await query({
          query: `
            SELECT * FROM bookmarks 
            WHERE user_id = ? AND surah_id = ? AND ayat_number = ?
          `,
          values: [bookmarkData.user_id, bookmarkData.surah_id, bookmarkData.ayat_number]
        }) as Bookmark[];
        
        return bookmarks[0];
      }
      
      // If it was a new insertion
      const bookmarks = await query({
        query: 'SELECT * FROM bookmarks WHERE bookmark_id = ?',
        values: [(result as any).insertId]
      }) as Bookmark[];
      
      return bookmarks[0];
    } catch (error) {
      console.error('Error creating/updating bookmark:', error);
      throw error;
    }
  },
  
  async getBookmarksByUser(userId: string): Promise<Bookmark[]> {
    return await query({
      query: 'SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC',
      values: [userId]
    }) as Bookmark[];
  },
  
  async getBookmark(userId: string, surahId: number, ayatNumber: number): Promise<Bookmark | null> {
    const bookmarks = await query({
      query: `
        SELECT * FROM bookmarks 
        WHERE user_id = ? AND surah_id = ? AND ayat_number = ?
      `,
      values: [userId, surahId, ayatNumber]
    }) as Bookmark[];
    
    return bookmarks.length > 0 ? bookmarks[0] : null;
  },
  
  async updateBookmark(bookmarkId: number, data: Partial<BookmarkInput>): Promise<boolean> {
    const fields = [];
    const values = [];
    
    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }
    
    if (fields.length === 0) {
      return false; // Nothing to update
    }
    
    values.push(bookmarkId);
    
    const result = await query({
      query: `UPDATE bookmarks SET ${fields.join(', ')} WHERE bookmark_id = ?`,
      values
    });
    
    return (result as any).affectedRows > 0;
  },
  
  async deleteBookmark(userId: string, surahId: number, ayatNumber: number): Promise<boolean> {
    const result = await query({
      query: `
        DELETE FROM bookmarks 
        WHERE user_id = ? AND surah_id = ? AND ayat_number = ?
      `,
      values: [userId, surahId, ayatNumber]
    });
    
    return (result as any).affectedRows > 0;
  }
};
