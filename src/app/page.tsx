'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ErrorMessage } from '../components/ErrorMessage';
import { useState, useEffect, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SimpleSearchInput as SearchInput } from '@/components/SearchComponents';
import LazyLoadImage from '@/components/LazyLoadImage';
import PrayerTimesWidget from '@/components/PrayerTimesWidget';
import tafsirData from '@/utils/tafsir_maudhui_full.json';
import { getQuranFontPreferences, setQuranFontPreferences } from '@/services/userPreferences';
import { QuranFontPreferences } from '@/types/quranPreferences';
import quranClient from '../services/quranClient';

// Dynamic imports for heavy tab content
const DynamicSurahList = dynamic(() => import('@/components/SurahList'), { ssr: false, loading: () => <div>Memuat daftar surah...</div> });
const DynamicTafsirMaudhuiTree = dynamic(() => import('@/components/TafsirMaudhuiTree'), { ssr: false, loading: () => <div>Memuat tafsir tematik...</div> });
const DynamicQuranPages = dynamic(() => import('@/components/QuranPages'), { ssr: false, loading: () => <div>Memuat halaman mushaf...</div> });

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  
  // Set initial active tab - if URL has hash, show corresponding tab
  const [activeTab, setActiveTab] = useState('surah'); // 'surah', 'tafsir', or 'arabic'
  // States for Redis cache initialization
  const [isRedisCacheInitializing, setIsRedisCacheInitializing] = useState(false);
  const [cachingStep, setCachingStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(1); // Reduced to 1 step (only Surahs, no Tafsirs)
  
  // Font preferences for Arabic Quran pages
  const [fontPreferences, setFontPreferences] = useState<QuranFontPreferences | null>(null);
  const [isFontLoading, setIsFontLoading] = useState(false);
  
  const { data: surahs, isLoading, error, refetch } = useQuery({
    queryKey: ['surahs'],
    queryFn: async () => {
      // Fetch from server-side Redis-cached API
      const res = await axios.get('/api/surahs');
      return res.data.surahs;
    },
    staleTime: 5 * 60 * 1000,
  });
  
  // Add Helmet for home page SEO
  const canonicalUrl = "http://indoquran.web.id";

  const [tooltipSurah, setTooltipSurah] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentArabicPage, setCurrentArabicPage] = useState(1);

  // Function to handle keyboard navigation for tabs
  const handleTabKeyDown = (e: React.KeyboardEvent, tabName: string) => {
    // Handle arrow keys for tab navigation
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const tabs = ['surah', 'tafsir', 'arabic'];
      const currentIndex = tabs.indexOf(tabName);
      let newIndex;
      
      if (e.key === 'ArrowLeft') {
        newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      } else {
        newIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
      }
      
      setActiveTab(tabs[newIndex]);
    }
  };

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Check URL hash for initial tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#tafsir-tematik') {
        setActiveTab('tafsir');
      } else if (window.location.hash === '#arabic-pages') {
        setActiveTab('arabic');
        
        // Check if there's a page parameter in the URL
        const pageMatch = window.location.hash.match(/page=(\d+)/);
        if (pageMatch && pageMatch[1]) {
          const page = parseInt(pageMatch[1], 10);
          if (!isNaN(page) && page >= 1 && page <= 604) {
            setCurrentArabicPage(page);
          }
        }
        
        // Fetch font preferences when switching to Arabic tab
        fetchFontPreferences();
      }
    }
  }, []);
  
  // Fetch font preferences from Redis
  const fetchFontPreferences = async () => {
    try {
      setIsFontLoading(true);
      // In a real app with auth, you'd pass user ID here
      const prefs = await getQuranFontPreferences();
      setFontPreferences(prefs);
    } catch (error) {
      console.error('Error fetching font preferences:', error);
    } finally {
      setIsFontLoading(false);
    }
  };
  
  // Handle font preference updates
  const handleFontPreferenceChange = async (newPrefs: QuranFontPreferences) => {
    setFontPreferences(newPrefs);
    try {
      // In a real app with auth, you'd pass user ID here
      await setQuranFontPreferences(newPrefs);
    } catch (error) {
      console.error('Error saving font preferences:', error);
    }
  };

  // Check Redis cache availability on component mount
  useEffect(() => {
    const prepareQuranData = async () => {
      try {
        setIsRedisCacheInitializing(true);
        console.log('Checking Redis cache availability...');
        
        // Step 1: Prepare Surahs
        setCachingStep(1);
        
        // Get the result of checking all surahs in cache, including which ones are missing
        const { isCached, missingSurahs } = await quranClient.checkAllSurahsInCache();
        
        // If everything is cached, we don't need to show the preparation UI
        if (isCached && missingSurahs.length === 0) {
          console.log('All surahs are already cached. Skipping initialization.');
          setIsRedisCacheInitializing(false);
          return;
        }
        
        // Ensure the main surah list is cached first
        if (!isCached && missingSurahs.length === 114) {
          console.log('Main surah list not found in Redis cache, initializing...');
          
          // Force a refetch to populate the main surah list in Redis cache
          const result = await refetch();
          
          if (!result.isSuccess) {
            console.error('Failed to load and cache main surah list', result.error);
            return;
          }
          
          console.log('Successfully loaded and cached main surah list');
        }
        
        // Check if there are any specific surahs missing from cache
        if (missingSurahs.length > 0) {
          console.log(`Fetching ${missingSurahs.length} missing surahs: ${missingSurahs.join(', ')}`);
          
          // Pre-cache the individual surahs that are missing (using batched fetching)
          const batchSize = 5; // Process 5 surahs at a time to avoid overwhelming the API
          const totalBatches = Math.ceil(missingSurahs.length / batchSize);
          const totalSurahs = missingSurahs.length;
          
          for (let i = 0; i < totalBatches; i++) {
            const batchStart = i * batchSize;
            const batchEnd = Math.min((i + 1) * batchSize, missingSurahs.length);
            const surahBatch = missingSurahs.slice(batchStart, batchEnd);
            
            console.log(`Fetching batch ${i + 1}/${totalBatches}: Surahs ${surahBatch.join(', ')}`);
            
            try {
              await Promise.all(surahBatch.map((id: number) => 
                quranClient.getSurahDetail(id).catch((err: unknown) => {
                  console.warn(`Failed to fetch surah ${id}:`, err);
                  return null;
                })
              ));
              
              console.log(`Surah cache initialization progress: ${Math.round((batchEnd / totalSurahs) * 100)}%`);
            } catch (batchError) {
              console.error(`Error processing batch ${i + 1}:`, batchError);
            }
          }
          
          console.log('All missing surah data has been cached to Redis');
        } else if (missingSurahs.length === 0) {
          // All 114 surahs are already cached, immediately finish
          console.log('All 114 surahs are already cached in Redis');
          setIsRedisCacheInitializing(false);
          return;
        }
        
        // Skip tafsir preparation since we're encountering server/client issues
        // Tafsirs will be fetched on demand when needed instead of precaching
        console.log('Skipping tafsir precaching due to server/client component limitations');

        // Add this to your prepareQuranData function after handling surahs
        // Check and prepare tafsir data
        setCachingStep(2);
        setTotalSteps(2);

        const { isCached: areTafsirsCached, missingTafsirs } = await quranClient.checkAllTafsirsInCache();

        if (!areTafsirsCached && missingTafsirs.length > 0) {
          console.log(`Fetching ${missingTafsirs.length} missing tafsirs`);
          
          // Pre-cache the individual tafsirs that are missing (using batched fetching)
          const batchSize = 5; // Process 5 tafsirs at a time
          const totalBatches = Math.ceil(missingTafsirs.length / batchSize);
          const totalTafsirs = missingTafsirs.length;
          
          for (let i = 0; i < totalBatches; i++) {
            const batchStart = i * batchSize;
            const batchEnd = Math.min((i + 1) * batchSize, missingTafsirs.length);
            const tafsirBatch = missingTafsirs.slice(batchStart, batchEnd);
            
            console.log(`Fetching tafsir batch ${i + 1}/${totalBatches}: Surahs ${tafsirBatch.join(', ')}`);
            
            try {
              await Promise.all(tafsirBatch.map((id: number) => 
                quranClient.getTafsir(id).catch((err: unknown) => {
                  console.warn(`Failed to fetch tafsir ${id}:`, err);
                  return null;
                })
              ));
              
              console.log(`Tafsir cache initialization progress: ${Math.round((batchEnd / totalTafsirs) * 100)}%`);
            } catch (batchError) {
              console.error(`Error processing tafsir batch ${i + 1}:`, batchError);
            }
          }
          
          console.log('All missing tafsir data has been cached to Redis');
        }
      } catch (error) {
        console.error('Error checking or updating Redis cache:', error);
        setTimeout(() => setIsRedisCacheInitializing(false), 1000);
      } finally {
        // Keep the status visible for a moment even after completion if we had to load data
        if (isRedisCacheInitializing) {
          setTimeout(() => {
            setIsRedisCacheInitializing(false);
          }, 2000);
        }
      }
    };

    prepareQuranData();
  }, [refetch]);

  // Show combined loading state (either initial loading or Redis cache initialization)
  const showLoading = isLoading || isRedisCacheInitializing;

  if (showLoading) {
    return (
      <div className="w-full p-4">
        {!isRedisCacheInitializing && isLoading && (
          <div className="flex flex-col items-center justify-center p-8 w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
            <p className="text-gray-600">Memuat daftar surah...</p>
          </div>
        )}
      </div>
    );
  }

  if (error && !isRedisCacheInitializing) {
    return (
      <div className="w-full mt-8 px-4">
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
    <main className="w-full px-3 sm:px-4 py-4 sm:py-8 bg-[#f8f4e5] text-[#5D4037]">
      <Helmet>
        <title>Al-Quran Indonesia | Baca Al-Quran Online dengan Terjemahan & Tafsir Tematik</title>
        <meta name="description" content="Baca Al-Quran online lengkap dengan terjemahan Bahasa Indonesia, tafsir tematik (Al-Maudhu'i), audio murottal. Tersedia 114 surah dengan navigasi mudah." />
        <meta name="keywords" content="al quran, quran online, baca quran, al-quran indonesia, terjemahan quran, tafsir quran, tafsir tematik, tafsir maudhui, quran digital, murottal quran" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Al-Quran Indonesia",
              "url": "${canonicalUrl}",
              "description": "Baca Al-Quran online dengan terjemahan, tafsir tematik, dan audio dalam Bahasa Indonesia",
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
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Tafsir Al-Maudhu'i (Tafsir Tematik)",
              "description": "Daftar tema-tema dalam tafsir Al-Maudhu'i (tafsir tematik) Al-Quran",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Tauhid",
                  "url": "${canonicalUrl}#tafsir-tematik"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Kenabian",
                  "url": "${canonicalUrl}#tafsir-tematik"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Ibadah",
                  "url": "${canonicalUrl}#tafsir-tematik"
                }
              ]
            }
          `}
        </script>
      </Helmet>      
      {/* Prayer Times Widget - Full Width */}
      <div className="w-full mb-4 sm:mb-6">
        <PrayerTimesWidget />
      </div>
      
      {/* Enhanced Search Section */}
      <div className="mb-6 sm:mb-8 w-full">
        <div className="w-full">
          <SearchInput
            value={searchQuery}
            onChange={(newQuery: string) => {
              setSearchQuery(newQuery);
              
              // If query is cleared, refresh the surah list data
              if (!newQuery && searchQuery) {
                // Only trigger a refetch if we're clearing an existing query
                refetch();
              }
            }}
            onSearch={(query: string) => {
              // Redirect to ayat search page with query
              if (query && query.trim().length >= 3) {
                router.push(`/search/ayat?q=${encodeURIComponent(query)}`);
              }
            }}
            placeholder="Cari ayat Al-Qur'an..."
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 w-full">
        <div role="tablist" aria-label="Konten Al-Quran" className="flex border-b-2 border-amber-200 bg-[#f8f4e5] rounded-t-lg shadow-sm overflow-hidden w-full">
          <button
            role="tab"
            id="tab-surah"
            aria-selected={activeTab === 'surah'}
            aria-controls="panel-surah"
            tabIndex={activeTab === 'surah' ? 0 : -1}
            onKeyDown={(e) => handleTabKeyDown(e, 'surah')}
            onClick={() => {
              setActiveTab('surah');
              // Remove hash from URL
              if (typeof window !== 'undefined') {
                history.pushState("", document.title, window.location.pathname + window.location.search);
              }
            }}
            className={`relative py-2 px-4 font-medium text-sm sm:text-base rounded-t-lg transition-colors flex items-center justify-center w-1/3
              ${activeTab === 'surah' 
                ? 'bg-amber-100 text-amber-800 border-b-2 border-amber-500' 
                : 'text-gray-600 hover:text-amber-700 hover:bg-amber-50'
              }`}
          >
            <LazyLoadImage src="/icons/home-icon.svg" alt="Beranda" width={20} height={20} className="w-5 h-5 mr-2" />
            Daftar Surah
            <span className="ml-2 bg-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full">114</span>
            {activeTab === 'surah' && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[6px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-amber-500"></span>
            )}
          </button>
          <button
            role="tab"
            id="tab-tafsir" 
            aria-selected={activeTab === 'tafsir'}
            aria-controls="panel-tafsir"
            tabIndex={activeTab === 'tafsir' ? 0 : -1}
            onKeyDown={(e) => handleTabKeyDown(e, 'tafsir')}
            onClick={() => {
              setActiveTab('tafsir');
              // Add hash to URL for direct linking
              if (typeof window !== 'undefined') {
                window.location.hash = 'tafsir-tematik';
              }
            }}
            className={`relative py-2 px-4 font-medium text-sm sm:text-base rounded-t-lg transition-colors flex items-center justify-center w-1/3
              ${activeTab === 'tafsir' 
                ? 'bg-amber-100 text-amber-800 border-b-2 border-amber-500' 
                : 'text-gray-600 hover:text-amber-700 hover:bg-amber-50'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            Tafsir Tematik
            <span className="ml-2 bg-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full">{tafsirData.topics.length}</span>
            {activeTab === 'tafsir' && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[6px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-amber-500"></span>
            )}
          </button>
          <button
            role="tab"
            id="tab-arabic"
            aria-selected={activeTab === 'arabic'}
            aria-controls="panel-arabic"
            tabIndex={activeTab === 'arabic' ? 0 : -1}
            onKeyDown={(e) => handleTabKeyDown(e, 'arabic')}
            onClick={() => {
              setActiveTab('arabic');
              // Add hash to URL for direct linking
              if (typeof window !== 'undefined') {
                window.location.hash = `arabic-pages${currentArabicPage > 1 ? `?page=${currentArabicPage}` : ''}`;
              }
              // Fetch font preferences when switching to this tab
              fetchFontPreferences();
            }}
            className={`relative py-2 px-4 font-medium text-sm sm:text-base rounded-t-lg transition-colors flex items-center justify-center w-1/3
              ${activeTab === 'arabic' 
                ? 'bg-amber-100 text-amber-800 border-b-2 border-amber-500' 
                : 'text-gray-600 hover:text-amber-700 hover:bg-amber-50'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            Mushaf Al-Quran
            <span className="ml-2 bg-amber-200 text-amber-800 text-xs px-2 py-0.5 rounded-full">604</span>
            <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="mr-0.5 h-2 w-2 text-green-500" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              Baru
            </span>
            {activeTab === 'arabic' && (
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[6px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-amber-500"></span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4 w-full">
        {/* Surah List Tab */}
        {activeTab === 'surah' && (
          <div 
            role="tabpanel"
            id="panel-surah"
            aria-labelledby="tab-surah"
            className="animate-fadeIn w-full">
            <div className="mb-3 sm:mb-4 w-full">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                <LazyLoadImage src="/icons/home-icon.svg" alt="Beranda" width={28} height={28} className="w-6 h-6 sm:w-7 sm:h-7 mr-2" />
                Daftar Surah
              </h2>
            </div>
            
            <DynamicSurahList
              surahs={surahs || null}
              loading={isLoading}
              error={error ? String(error) : null}
              searchQuery={debouncedQuery}
              setSearchQuery={setSearchQuery} // Pass this down to enable reset
            />
          </div>
        )}
        
        {/* Tafsir Al-Maudhu'i Tab */}
        {activeTab === 'tafsir' && (
          <div 
            role="tabpanel"
            id="panel-tafsir"
            aria-labelledby="tab-tafsir"
            className="animate-fadeIn w-full">
            <header className="mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-7 sm:h-7 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                Tafsir Al-Maudhu'i (Tafsir Tematik)
              </h2>
              <p className="text-gray-600 mt-2">
                Penafsiran Al-Quran berdasarkan tema-tema tertentu dengan mengumpulkan dan menganalisis ayat-ayat dari berbagai surah.
              </p>
            </header>
            <DynamicTafsirMaudhuiTree />
          </div>
        )}
        
        {/* Arabic Mushaf Pages Tab */}
        {activeTab === 'arabic' && (
            <div className="relative">
            <DynamicQuranPages 
              currentPage={currentArabicPage} 
              onPageChange={setCurrentArabicPage}
            />
            </div>
        )}
      </div>
    </main>
  );
}

// Export default component with Suspense boundary
export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center">Loading...</div>}>
      <div className="w-full max-w-none">
        <HomeContent />
      </div>
    </Suspense>
  );
}
