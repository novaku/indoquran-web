'use server';

import { Surah } from '../types/quran';
import { getCache, setCache, isRedisAvailable } from '../utils/redis';

interface TafsirResponse {
  code: number;
  message: string;
  data: {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
    tempatTurun: string;
    arti: string;
    deskripsi: string;
    audioFull: {
      "01": string;
      "02": string;
      "03": string;
      "04": string;
      "05": string;
    };
    tafsir: Array<{
      ayat: number;
      teks: string;
    }>;
    suratSelanjutnya: {
      nomor: number;
      nama: string;
      namaLatin: string;
      jumlahAyat: number;
    } | false;
    suratSebelumnya: {
      nomor: number;
      nama: string;
      namaLatin: string;
      jumlahAyat: number;
    } | false;
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// In 'use server' files, we need to use individual function exports instead of object
export async function getAllSurah(): Promise<Surah[]> {
  const cacheKey = 'quran:allSurah';
  
  try {
    // Try to get data from cache first
    const cachedData = await getCache<Surah[]>(cacheKey);
    if (cachedData) {
      console.log('Retrieved all surahs from Redis cache');
      return cachedData;
    }
  } catch (cacheError) {
    // If there's an error accessing Redis, log it but continue to fetch from API
    console.warn('Redis cache error when retrieving all surahs:', cacheError);
  }
  
  console.log('Fetching all surahs from API');
  // If not in cache or Redis error, fetch from API
  try {
    const response = await fetch(`${BASE_URL}/surat`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surah list (${response.status})`);
    }
    const result = await response.json();
    
    // Try to cache the data, but don't fail if Redis is unavailable
    try {
      await setCache(cacheKey, result.data);
      console.log('Successfully cached all surahs in Redis');
    } catch (cacheError) {
      console.warn('Redis cache error when setting all surahs:', cacheError);
    }
    
    return result.data;
  } catch (apiError) {
    console.error('API error when fetching all surahs:', apiError);
    throw apiError;
  }
}

export async function getSurahDetail(id: number): Promise<Surah> {
  const cacheKey = `quran:surah:${id}`;
  
  try {
    // Try to get data from cache first
    const cachedData = await getCache<Surah>(cacheKey);
    if (cachedData) {
      console.log(`Retrieved surah ${id} from Redis cache`);
      return cachedData;
    }
  } catch (cacheError) {
    // If there's an error accessing Redis, log it but continue to fetch from API
    console.warn(`Redis cache error when retrieving surah ${id}:`, cacheError);
  }
  
  console.log(`Fetching surah ${id} from API`);
  // If not in cache or Redis error, fetch from API
  try {
    const response = await fetch(`${BASE_URL}/surat/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surah ${id} detail (${response.status})`);
    }
    const result = await response.json();
    
    // Try to cache the data, but don't fail if Redis is unavailable
    try {
      await setCache(cacheKey, result.data);
      console.log(`Successfully cached surah ${id} in Redis`);
    } catch (cacheError) {
      console.warn(`Redis cache error when setting surah ${id}:`, cacheError);
    }
    
    return result.data;
  } catch (apiError) {
    console.error(`API error when fetching surah ${id}:`, apiError);
    throw apiError;
  }
}

export async function getTafsir(surahId: number): Promise<TafsirResponse['data']['tafsir']> {
  try {
    // Check if BASE_URL is defined
    if (!BASE_URL) {
      console.error("API Base URL is not defined. Please check your environment variables.");
      throw new Error('API configuration error');
    }
    
    // Fetch from API with better error handling
    console.log(`Fetching tafsir data for surah ${surahId} from ${BASE_URL}/tafsir/${surahId}`);
    
    const response = await fetch(`${BASE_URL}/tafsir/${surahId}`, {
      // Adding headers and longer timeout for reliability
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      next: { revalidate: 3600 } // Cache for 1 hour on the Next.js layer
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      console.error(`API Error (${response.status}): ${errorText}`);
      throw new Error(`Failed to fetch tafsir (Status: ${response.status})`);
    }
    
    const result: TafsirResponse = await response.json();
    
    // Make sure the expected data structure exists
    if (!result.data?.tafsir) {
      console.error('Unexpected API response format:', result);
      throw new Error('Invalid API response format');
    }
    
    return result.data.tafsir;
  } catch (error) {
    console.error('Error fetching tafsir data:', error);
    
    // Return empty array as fallback instead of failing completely
    return [];
  }
}

// Function to check if all surahs (1-114) are cached in Redis and return missing ones
export async function checkAllSurahsInCache(): Promise<{ isCached: boolean; missingSurahs: number[] }> {
  // First check if Redis is available
  const redisAvailable = await isRedisAvailable();
  if (!redisAvailable) {
    console.log('Redis is not available');
    return { isCached: false, missingSurahs: Array.from({ length: 114 }, (_, i) => i + 1) };
  }
  
  // Check if the list of all surahs is cached
  const allSurahsCached = await getCache<Surah[]>('quran:allSurah');
  if (!allSurahsCached) {
    console.log('All surahs list is not cached in Redis');
    // If the main list is missing, we'll consider all surahs as missing
    return { isCached: false, missingSurahs: Array.from({ length: 114 }, (_, i) => i + 1) };
  }
  
  // Check all 114 surahs to determine which ones are missing from cache
  const missingSurahs: number[] = [];
  
  // We'll check in batches to avoid overloading Redis
  const checkBatch = async (startId: number, endId: number) => {
    const promises = [];
    for (let surahId = startId; surahId <= endId; surahId++) {
      promises.push(
        getCache<Surah>(`quran:surah:${surahId}`)
          .then(cached => ({ surahId, cached: !!cached }))
          .catch(() => ({ surahId, cached: false }))
      );
    }
    
    const results = await Promise.all(promises);
    return results.filter(result => !result.cached).map(result => result.surahId);
  };
  
  // Check in batches of 20 to avoid overloading Redis
  const batchSize = 20;
  const batches = Math.ceil(114 / batchSize);
  
  for (let i = 0; i < batches; i++) {
    const start = i * batchSize + 1;
    const end = Math.min((i + 1) * batchSize, 114);
    const batchMissing = await checkBatch(start, end);
    missingSurahs.push(...batchMissing);
  }
  
  if (missingSurahs.length > 0) {
    console.log(`Found ${missingSurahs.length} surahs missing from Redis cache: ${missingSurahs.join(', ')}`);
  } else {
    console.log('All 114 surahs are cached in Redis');
  }
  
  return { 
    isCached: missingSurahs.length === 0, 
    missingSurahs 
  };
}

// Define a type for search results
export interface AyatSearchResult {
  surahId: number;
  surahName: string;
  surahNameLatin: string;
  ayatNumber: number;
  ayatText: string;
  matchSnippet: string;
}

// New function to search for text in all surah ayats (MySQL-like query format)
export async function searchAyatText(searchQuery: string): Promise<AyatSearchResult[]> {
  if (!searchQuery || searchQuery.trim().length < 3) {
    return [];
  }

  // Split the search query into terms for AND-based search
  const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
  const results: AyatSearchResult[] = [];
  const redisAvailable = await isRedisAvailable();
  
  if (!redisAvailable) {
    console.error('Redis client not available for search operation');
    throw new Error('Search service unavailable');
  }
  
  try {
    console.log(`Searching for terms: ${searchTerms.join(' AND ')} in all surahs...`);
    
    // Get list of all surahs first to have information about total count
    const allSurahsCached = await getCache<Surah[]>('quran:allSurah');
    if (!allSurahsCached || allSurahsCached.length === 0) {
      console.error('All surahs list not found in cache');
      throw new Error('Search index not available');
    }
    
    // Search through each surah in Redis cache
    const searchPromises = [];
    
    for (let surahId = 1; surahId <= 114; surahId++) {
      searchPromises.push(
        getCache<Surah>(`quran:surah:${surahId}`)
          .then(surah => {
            if (!surah) return [];
            
            // Find ayats that match ALL search terms (AND condition)
            const matchingAyats = surah.ayat.filter(ayat => {
              const lowerCaseText = ayat.teksIndonesia.toLowerCase();
              // Check if ALL search terms are present in the text (AND condition)
              return searchTerms.every(term => lowerCaseText.includes(term));
            });
            
            return matchingAyats.map(ayat => {
              // Create a snippet with all search terms highlighted
              let highlightedText = ayat.teksIndonesia;
              // Highlight each term separately
              searchTerms.forEach(term => {
                highlightedText = highlightSearchTermInText(highlightedText, term);
              });
              
              return {
                surahId: surah.nomor,
                surahName: surah.nama,
                surahNameLatin: surah.namaLatin,
                ayatNumber: ayat.nomorAyat,
                ayatText: ayat.teksIndonesia,
                matchSnippet: highlightedText
              };
            });
          })
          .catch(err => {
            console.warn(`Error searching surah ${surahId}:`, err);
            return [];
          })
      );
    }
    
    const searchResults = await Promise.all(searchPromises);
    const flattenedResults = searchResults.flat();
    
    return flattenedResults;
  } catch (error) {
    console.error('Error searching ayat text:', error);
    throw error;
  } finally {
    // No need to release Redis client as we're using the utility functions
  }
}

// Helper function to highlight search term in text
function highlightSearchTermInText(text: string, searchTerm: string): string {
  if (!text || !searchTerm) return text;
  
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  
  return text.replace(regex, '<mark class="bg-amber-200">$1</mark>');
}

// Helper function to search via API if Redis fails
async function searchFromAPI(searchTerm: string): Promise<AyatSearchResult[]> {
  console.log('Falling back to API search - this would typically query the API directly');
  // In a real implementation, this would make an API call to search the text
  // For now, we'll return an empty array since the API doesn't support this feature
  return [];
}

// The tafsir caching functions have been removed to avoid server/client component conflicts
// Tafsirs will now be fetched on-demand directly from the API instead of being pre-cached