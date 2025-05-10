'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import offlineStorage from '../../utils/offlineStorage';

export default function OfflinePage() {
  const [cachedSurahs, setCachedSurahs] = useState<number[]>([]);
  const [cachedPages, setCachedPages] = useState<string[]>([]);

  // Check which surahs and pages might be available in cache
  useEffect(() => {
    // Use our utility function to get recent surahs
    const recentSurahs = offlineStorage.getRecentSurahs();
    
    // For each recent surah, check if we have cached data
    const checkCachedSurahs = async () => {
      const cachedSurahIds: number[] = [];
      
      for (const surahId of recentSurahs) {
        try {
          // Check if we have cached this surah
          const cachedSurah = await offlineStorage.getQuranData(`surah-${surahId}`);
          if (cachedSurah) {
            cachedSurahIds.push(surahId);
          }
        } catch (error) {
          console.error(`Error checking cached surah ${surahId}:`, error);
        }
      }
      
      setCachedSurahs(cachedSurahIds.length > 0 ? cachedSurahIds : recentSurahs);
    };
    
    // Check for cached static pages
    const checkCachedPages = async () => {
      // Get list of recently visited pages
      const recentPages = offlineStorage.getRecentStaticPages();
      const availablePages: string[] = [];
      
      for (const pagePath of recentPages) {
        try {
          // Check if we have cached this page
          const cachedPage = await offlineStorage.getStaticPage(pagePath);
          if (cachedPage) {
            availablePages.push(pagePath);
          }
        } catch (error) {
          console.error(`Error checking cached page ${pagePath}:`, error);
        }
      }
      
      // Always include contact and privacy policy pages as they should be cached by service worker
      if (!availablePages.includes('/kontak') && !recentPages.includes('/kontak')) {
        availablePages.push('/kontak');
      }
      
      if (!availablePages.includes('/kebijakan-privasi') && !recentPages.includes('/kebijakan-privasi')) {
        availablePages.push('/kebijakan-privasi');
      }
      
      setCachedPages(availablePages);
    };
    
    checkCachedSurahs();
    checkCachedPages();
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-amber-50 rounded-full p-6 mb-4">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-16 w-16 text-amber-600" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a5 5 0 010-7.072m3.536 9.9a9 9 0 010-12.728M5.636 18.364a9 9 0 010-12.728m3.536 3.536a5 5 0 010 7.072m-3.536-9.9a9 9 0 010 12.728"
          />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Anda Sedang Offline</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Sepertinya Anda sedang tidak terhubung ke internet. Beberapa fitur mungkin tidak berfungsi dengan baik.
      </p>
      
      {cachedSurahs.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Surah yang mungkin tersedia offline:</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {cachedSurahs.map((surahId) => (
              <Link 
                href={`/surah/${surahId}`} 
                key={surahId}
                className="bg-white border border-amber-200 hover:border-amber-400 rounded-lg px-4 py-2 text-amber-800"
              >
                Surah {surahId}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-600 mb-8">
          Belum ada surah yang tersedia offline. Silakan kunjungi surah-surah Al-Quran ketika Anda online untuk menyimpannya.
        </p>
      )}
      
      {/* Show cached static pages */}
      {cachedPages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Halaman yang tersedia offline:</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {cachedPages.includes('/kontak') && (
              <Link
                href="/kontak"
                className="bg-white border border-amber-200 hover:border-amber-400 rounded-lg px-4 py-2 text-amber-800"
              >
                Kontak Kami
              </Link>
            )}
            {cachedPages.includes('/kebijakan-privasi') && (
              <Link
                href="/kebijakan-privasi"
                className="bg-white border border-amber-200 hover:border-amber-400 rounded-lg px-4 py-2 text-amber-800"
              >
                Kebijakan Privasi
              </Link>
            )}
          </div>
        </div>
      )}
      
      <button 
        onClick={() => window.location.reload()} 
        className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
      >
        Coba Lagi
      </button>
      
      <div className="mt-8 text-sm text-gray-500">
        Tip: Anda dapat menginstal IndoQuran sebagai aplikasi untuk penggunaan offline yang lebih baik.
      </div>
    </div>
  );
}
