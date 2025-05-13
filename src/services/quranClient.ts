// filepath: /Users/novaherdi/Documents/GitHub/indoquran-web/src/services/quranClient.ts
// This file provides client-side safe wrappers around the quranService
// to be used in client components

import { Surah } from "../types/quran";
import { 
  getAllSurah, 
  getSurahDetail, 
  getTafsir, 
  checkAllSurahsInCache,
  checkAllTafsirsInCache,
  searchAyatText, 
  AyatSearchResult,
  SearchParams,
  SearchResponse
} from "./quranService";

const quranClient = {
  // Client-side wrappers for API calls
  getAllSurah: async (): Promise<Surah[]> => {
    // Direct call to the server action
    return getAllSurah();
  },

  getSurahDetail: async (id: number): Promise<Surah> => {
    // Direct call to the server action
    return getSurahDetail(id);
  },

  getTafsir: async (surahId: number) => {
    // Direct call to the server action
    return getTafsir(surahId);
  },
  
  // Check if all surahs (1-114) are cached in Redis and return missing ones
  checkAllSurahsInCache: async (): Promise<{ isCached: boolean; missingSurahs: number[] }> => {
    return checkAllSurahsInCache();
  },
  
  // Fetch and cache any missing surah details
  fetchAndCacheMissingSurahs: async (surahIds: number[]): Promise<void> => {
    // We'll process these one by one to avoid overwhelming the API
    for (const surahId of surahIds) {
      await getSurahDetail(surahId);
    }
  },

  // Search with pagination using POST-style params
  searchAyatText: async (params: SearchParams | string): Promise<SearchResponse> => {
    // Handle backward compatibility by converting string to SearchParams
    const searchParams = typeof params === 'string' 
      ? { query: params, page: 1, itemsPerPage: 10 } 
      : params;
      
    return searchAyatText(searchParams);
  },

  // Check if all tafsirs are cached in Redis and return missing ones
  checkAllTafsirsInCache: async (): Promise<{ isCached: boolean; missingTafsirs: number[] }> => {
    return checkAllTafsirsInCache();
  },

  // Fetch and cache any missing tafsirs
  fetchAndCacheMissingTafsirs: async (surahIds: number[]): Promise<void> => {
    // We'll process these one by one to avoid overwhelming the API
    for (const surahId of surahIds) {
      await getTafsir(surahId);
    }
  }
};

// Only export as default to avoid import confusion
export default quranClient;
