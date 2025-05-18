'use server';

import { getCache, setCache, isRedisAvailable } from '@/utils/redis';
import { QuranFontPreferences, DEFAULT_QURAN_FONT_PREFS } from '@/types/quranPreferences';

/**
 * Gets font preferences for the Arabic Quran Pages from Redis
 * @param userId - Optional user ID for personalized settings (uses anonymous settings if not provided)
 * @returns Font preferences object
 */
export async function getQuranFontPreferences(userId?: string): Promise<QuranFontPreferences> {
  try {
    // Check if Redis is available first
    const redisAvailable = await isRedisAvailable();
    if (!redisAvailable) {
      console.log('Redis is not available - using default font preferences');
      return DEFAULT_QURAN_FONT_PREFS;
    }
    
    // Key for storing font preferences - use userId if provided, otherwise use 'anonymous'
    const key = `user:${userId || 'anonymous'}:preferences:quran-font`;
    
    // Try to get font preferences from Redis
    const preferences = await getCache<QuranFontPreferences>(key);
    
    if (preferences) {
      return preferences;
    }
    
    // If no preferences found, use defaults and save them for next time
    await setQuranFontPreferences(DEFAULT_QURAN_FONT_PREFS, userId);
    return DEFAULT_QURAN_FONT_PREFS;
  } catch (error) {
    console.error('Error getting Quran font preferences from Redis:', error);
    return DEFAULT_QURAN_FONT_PREFS;
  }
}

/**
 * Sets font preferences for the Arabic Quran Pages in Redis
 * @param preferences - Font preferences object to save
 * @param userId - Optional user ID for personalized settings (uses anonymous settings if not provided)
 */
export async function setQuranFontPreferences(preferences: QuranFontPreferences, userId?: string): Promise<void> {
  try {
    // Check if Redis is available first
    const redisAvailable = await isRedisAvailable();
    if (!redisAvailable) {
      console.log('Redis is not available - cannot save font preferences');
      return;
    }
    
    // Key for storing font preferences - use userId if provided, otherwise use 'anonymous'
    const key = `user:${userId || 'anonymous'}:preferences:quran-font`;
    
    // Validate preferences before saving
    const validatedPrefs: QuranFontPreferences = {
      // Only allow valid font families
      fontFamily: ['naskh', 'amiri', 'uthmani'].includes(preferences.fontFamily) 
        ? preferences.fontFamily 
        : DEFAULT_QURAN_FONT_PREFS.fontFamily,
      
      // Restrict font size to reasonable range (1.0 - 4.0 rem)
      fontSize: Math.min(Math.max(preferences.fontSize, 1.0), 4.0)
    };
    
    // Save preferences to Redis (with 1 year expiration)
    await setCache(key, validatedPrefs);
    console.log('Quran font preferences saved successfully:', validatedPrefs);
  } catch (error) {
    console.error('Error setting Quran font preferences in Redis:', error);
  }
}
