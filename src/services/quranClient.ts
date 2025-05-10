// filepath: /Users/novaherdi/Documents/GitHub/indoquran-web/src/services/quranClient.ts
// This file provides client-side safe wrappers around the quranService
// to be used in client components

import { Surah } from "../types/quran";
import { 
  getAllSurah, 
  getSurahDetail, 
  getTafsir, 
  checkAllSurahsInCache,
  searchAyatText, 
  AyatSearchResult 
} from "./quranService";

export const quranClient = {
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

  // New function to search for text across all surah ayats
  searchAyatText: async (query: string): Promise<AyatSearchResult[]> => {
    return searchAyatText(query);
  }
};

export default quranClient;
