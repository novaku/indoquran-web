import { setCache, getCache, isRedisAvailable } from '../../../utils/redis';
import { checkAllSurahsInCache } from '@/services/quranService';
import { NextRequest } from 'next/server';

// Enhanced API route for testing Redis connection and cache status
export async function GET(request: NextRequest) {
  try {
    // Check if there's a query parameter to force a check of specific surah
    const forcedSurahCheck = request.nextUrl.searchParams.get('check_surah');
    
    // Check if Redis is available
    const redisAvailable = await isRedisAvailable();
    
    if (!redisAvailable) {
      return Response.json({ 
        success: false, 
        message: 'Redis is not available',
        redisAvailable: false
      }, { status: 503 }); // Service Unavailable
    }
    
    // Test basic Redis functionality via setCache/getCache functions
    const testKey = 'test_key';
    const testValue = 'Redis is working!';
    
    await setCache(testKey, testValue);
    const value = await getCache<string>(testKey);
    
    // Check if the Quran data is cached
    const { isCached, missingSurahs } = await checkAllSurahsInCache();
    
    // If a specific surah check is requested
    let specificSurahCheck = null;
    if (forcedSurahCheck) {
      const surahId = parseInt(forcedSurahCheck);
      if (!isNaN(surahId) && surahId >= 1 && surahId <= 114) {
        const surahKey = `quran:surah:${surahId}`;
        const surahExists = await getCache(surahKey);
        specificSurahCheck = {
          surahId,
          exists: !!surahExists,
          cacheKey: surahKey
        };
      }
    }
    
    if (value === 'Redis is working!') {
      return Response.json({ 
        success: true, 
        message: 'Redis connection is working properly',
        redisAvailable: true,
        testValue: value,
        quranDataStatus: {
          allSurahsCached: isCached,
          missingSurahCount: missingSurahs.length,
          missingSurahs: missingSurahs.length > 0 ? missingSurahs : [],
          specificSurahCheck
        },
        timestamp: new Date().toISOString()
      });
    } else {
      return Response.json({ 
        success: false, 
        message: 'Redis set/get operations failed',
        redisAvailable: true,
        quranDataStatus: {
          allSurahsCached: isCached,
          missingSurahCount: missingSurahs.length,
          missingSurahs: missingSurahs.length > 0 ? missingSurahs : [],
          specificSurahCheck
        },
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Redis test error:', error);
    return Response.json({ 
      success: false, 
      message: 'Redis connection test failed',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
