// This file provides client-side safe wrappers around the quranService
// to be used in client components

import { Surah } from "../types/quran";
import { getAllSurah, getSurahDetail, getTafsir } from "./quranService";

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
  }
};

export default quranClient;
