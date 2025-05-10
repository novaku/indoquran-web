'use client';

import { useQuery } from '@tanstack/react-query';
import { quranClient } from '../services/quranClient';
import { ErrorMessage } from '../components/ErrorMessage';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SurahList from '@/components/SurahList';
import SearchInput from '@/components/SearchInput';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  // States for Redis cache initialization
  const [isRedisCacheInitializing, setIsRedisCacheInitializing] = useState(false);
  const [cacheProgress, setCacheProgress] = useState(0);
  const [cachingStatus, setCachingStatus] = useState('');
  const [cachingStep, setCachingStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(1); // Reduced to 1 step (only Surahs, no Tafsirs)
  
  const { data: surahs, isLoading, error, refetch } = useQuery({
    queryKey: ['surahs'],
    queryFn: () => quranClient.getAllSurah(),
    staleTime: 5 * 60 * 1000,
  });
  
  // Add Helmet for home page SEO
  const canonicalUrl = "http://indoquran.web.id";

  const [tooltipSurah, setTooltipSurah] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Check Redis cache availability on component mount
  useEffect(() => {
    const prepareQuranData = async () => {
      try {
        setIsRedisCacheInitializing(true);
        setCacheProgress(0);
        setCachingStatus('Memeriksa ketersediaan cache...');
        console.log('Checking Redis cache availability...');
        
        // Step 1: Prepare Surahs
        setCachingStep(1);
        
        // Get the result of checking all surahs in cache, including which ones are missing
        const { isCached, missingSurahs } = await quranClient.checkAllSurahsInCache();
        
        // Ensure the main surah list is cached first
        if (!isCached && missingSurahs.length === 114) {
          setCachingStatus('Memuat daftar surah utama...');
          console.log('Main surah list not found in Redis cache, initializing...');
          
          // Force a refetch to populate the main surah list in Redis cache
          const result = await refetch();
          
          if (!result.isSuccess) {
            console.error('Failed to load and cache main surah list', result.error);
            setCachingStatus('Gagal memuat daftar surah utama');
            return;
          }
          
          setCacheProgress(5); // 5% progress after fetching the main list
          console.log('Successfully loaded and cached main surah list');
        }
        
        // Check if there are any specific surahs missing from cache
        if (missingSurahs.length > 0) {
          setCachingStatus(`Memuat ${missingSurahs.length} surah yang belum tersimpan...`);
          console.log(`Fetching ${missingSurahs.length} missing surahs: ${missingSurahs.join(', ')}`);
          
          // Pre-cache the individual surahs that are missing (using batched fetching)
          const batchSize = 5; // Process 5 surahs at a time to avoid overwhelming the API
          const totalBatches = Math.ceil(missingSurahs.length / batchSize);
          const totalSurahs = missingSurahs.length;
          
          for (let i = 0; i < totalBatches; i++) {
            const batchStart = i * batchSize;
            const batchEnd = Math.min((i + 1) * batchSize, missingSurahs.length);
            const surahBatch = missingSurahs.slice(batchStart, batchEnd);
            
            setCachingStatus(`Memuat surah ${surahBatch.join(', ')}...`);
            console.log(`Fetching batch ${i + 1}/${totalBatches}: Surahs ${surahBatch.join(', ')}`);
            
            try {
              await Promise.all(surahBatch.map(id => 
                quranClient.getSurahDetail(id).catch(err => {
                  console.warn(`Failed to fetch surah ${id}:`, err);
                  return null;
                })
              ));
              
              // Calculate progress as a percentage (5% for main list + 95% for individual surahs)
              const baseProgress = 5;
              const individualSurahProgress = 95;
              const percentComplete = baseProgress + Math.round((batchEnd / totalSurahs) * individualSurahProgress);
              
              setCacheProgress(percentComplete > 100 ? 100 : percentComplete);
              console.log(`Surah cache initialization progress: ${percentComplete}%`);
            } catch (batchError) {
              console.error(`Error processing batch ${i + 1}:`, batchError);
            }
          }
          
          setCachingStatus('Semua surah berhasil disimpan di cache');
          console.log('All missing surah data has been cached to Redis');
        } else {
          setCachingStatus('Semua 114 surah sudah tersimpan di cache');
          console.log('All 114 surahs are already cached in Redis');
        }
        
        // Skip tafsir preparation since we're encountering server/client issues
        // Tafsirs will be fetched on demand when needed instead of precaching
        setCachingStatus('Inisialisasi selesai');
        setCacheProgress(100);
        console.log('Skipping tafsir precaching due to server/client component limitations');
      } catch (error) {
        console.error('Error checking or updating Redis cache:', error);
        setCachingStatus('Terjadi kesalahan saat memeriksa cache');
      } finally {
        // Keep the status visible for a moment even after completion
        setTimeout(() => {
          setIsRedisCacheInitializing(false);
          setCacheProgress(0);
        }, 2000);
      }
    };

    prepareQuranData();
  }, [refetch]);

  // Show combined loading state (either initial loading or Redis cache initialization)
  const showLoading = isLoading || isRedisCacheInitializing;

  if (showLoading) {
    return (
      <div className="w-full mx-auto p-4">
        {isRedisCacheInitializing && (
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Mempersiapkan Al-Quran</h2>
            <p className="mb-4 text-gray-600">{cachingStatus}</p>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-amber-500 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${cacheProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">
              {cacheProgress}% selesai
            </p>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Data sedang disiapkan untuk penggunaan offline. Mohon tunggu sebentar...</p>
              <ul className="list-disc pl-5 mt-2">
                <li className="font-semibold">Teks Al-Quran dan terjemahan</li>
              </ul>
            </div>
          </div>
        )}
        
        {!isRedisCacheInitializing && isLoading && (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
            <p className="text-gray-600">Memuat daftar surah...</p>
          </div>
        )}
      </div>
    );
  }

  if (error && !isRedisCacheInitializing) {
    return (
      <div className="w-full mx-auto mt-8 px-4">
        <ErrorMessage 
          message="Gagal memuat daftar surah. Silakan coba lagi." 
          retry={() => {
            setIsRedisCacheInitializing(true);
            refetch().finally(() => setIsRedisCacheInitializing(false));
          }}
          additionalInfo={
            "Jika Anda mengalami masalah koneksi, pastikan perangkat terhubung ke internet."
          }
        />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 bg-[#f8f4e5] text-[#5D4037]">
      <Helmet>
        <title>Al-Quran Indonesia | Baca Al-Quran Online dengan Terjemahan & Tafsir</title>
        <meta name="description" content="Baca Al-Quran online lengkap dengan terjemahan Bahasa Indonesia, tafsir, audio murottal. Tersedia 114 surah dengan navigasi mudah." />
        <meta name="keywords" content="al quran, quran online, baca quran, al-quran indonesia, terjemahan quran, tafsir quran, quran digital, murottal quran" />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Al-Quran Indonesia",
              "url": "${canonicalUrl}",
              "description": "Baca Al-Quran online dengan terjemahan dan tafsir Bahasa Indonesia",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "${canonicalUrl}?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            }
          `}
        </script>
      </Helmet>      
      <div className="mb-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={(query: string) => {
            // Redirect to ayat search page with query
            if (query && query.trim().length >= 3) {
              router.push(`/search/ayat?q=${encodeURIComponent(query)}`);
            }
          }}
          placeholder="Cari ayat Al-Qur'an..."
        />
      </div>
      
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Daftar Surah</h2>
      </div>

      <SurahList
        surahs={surahs || null}
        loading={isLoading}
        error={error ? String(error) : null}
        searchQuery={debouncedQuery}
        setSearchQuery={setSearchQuery} // Pass this down to enable reset
      />
    </main>
  );
}
