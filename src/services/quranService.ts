'use server';

import { Surah } from '../types/quran';
import { getCache, setCache } from '../utils/redis';

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
  
  // Try to get data from cache first
  const cachedData = await getCache<Surah[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // If not in cache, fetch from API
  const response = await fetch(`${BASE_URL}/surat`);
  if (!response.ok) {
    throw new Error('Failed to fetch surah list');
  }
  const result = await response.json();
  
  // Cache the data forever
  await setCache(cacheKey, result.data);
  
  return result.data;
}

export async function getSurahDetail(id: number): Promise<Surah> {
  const cacheKey = `quran:surah:${id}`;
  
  // Try to get data from cache first
  const cachedData = await getCache<Surah>(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // If not in cache, fetch from API
  const response = await fetch(`${BASE_URL}/surat/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch surah detail');
  }
  const result = await response.json();
  
  // Cache the data forever
  await setCache(cacheKey, result.data);
  
  return result.data;
}

export async function getTafsir(surahId: number): Promise<TafsirResponse['data']['tafsir']> {
  const cacheKey = `quran:tafsir:${surahId}`;
  
  // Try to get data from cache first
  const cachedData = await getCache<TafsirResponse['data']['tafsir']>(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // If not in cache, fetch from API
  const response = await fetch(`${BASE_URL}/tafsir/${surahId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tafsir');
  }
  const result: TafsirResponse = await response.json();
  
  // Cache the data forever
  await setCache(cacheKey, result.data.tafsir);
  
  return result.data.tafsir;
}