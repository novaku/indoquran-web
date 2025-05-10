import { query } from '@/utils/db';

export interface Favorite {
  favorite_id: number;
  user_id: string;
  surah_id: number;
  ayat_number: number;
  created_at: string;
}

export interface FavoriteInput {
  user_id: string;
  surah_id: number;
  ayat_number: number;
}

export const favoriteService = {
  async addFavorite(favoriteData: FavoriteInput): Promise<Favorite> {
    try {
      // Insert favorite, ignore if it already exists
      await query({
        query: `
          INSERT IGNORE INTO favorites (user_id, surah_id, ayat_number)
          VALUES (?, ?, ?)
        `,
        values: [favoriteData.user_id, favoriteData.surah_id, favoriteData.ayat_number]
      });
      
      // Retrieve the created or existing favorite
      const favorites = await query({
        query: `
          SELECT * FROM favorites 
          WHERE user_id = ? AND surah_id = ? AND ayat_number = ?
        `,
        values: [favoriteData.user_id, favoriteData.surah_id, favoriteData.ayat_number]
      }) as Favorite[];
      
      return favorites[0];
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  },
  
  async getFavoritesByUser(userId: string): Promise<Favorite[]> {
    return await query({
      query: 'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
      values: [userId]
    }) as Favorite[];
  },
  
  async checkFavorite(userId: string, surahId: number, ayatNumber: number): Promise<boolean> {
    const favorites = await query({
      query: `
        SELECT * FROM favorites 
        WHERE user_id = ? AND surah_id = ? AND ayat_number = ?
      `,
      values: [userId, surahId, ayatNumber]
    }) as Favorite[];
    
    return favorites.length > 0;
  },
  
  async removeFavorite(userId: string, surahId: number, ayatNumber: number): Promise<boolean> {
    const result = await query({
      query: `
        DELETE FROM favorites 
        WHERE user_id = ? AND surah_id = ? AND ayat_number = ?
      `,
      values: [userId, surahId, ayatNumber]
    });
    
    return (result as any).affectedRows > 0;
  }
};
