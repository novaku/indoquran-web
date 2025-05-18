'use client';

import { useState, useEffect } from 'react';
import quranByPage from '@/utils/quran_by_page.json';
import surahNames from '@/utils/surah-names';
import { getSurahAyatCount } from '@/services/quranService';

interface QuranPagesProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

/**
 * QuranPages component displays Quran page navigation UI.
 * Arabic text content has been removed as per requirements.
 */
const QuranPages: React.FC<QuranPagesProps> = ({
  currentPage,
  onPageChange
}) => {
  // Total number of Quran pages
  const TOTAL_PAGES = 604;
  
  // Image loading and error states
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Get current page's ayat information
  const currentPageInfo = quranByPage.find((p: any) => p.page === currentPage);
  
  // State for active tab (ayat or info)
  const [activeTab, setActiveTab] = useState<'ayat' | 'info'>('ayat');
  
  // State for storing surah ayat counts from Redis
  const [surahAyatCounts, setSurahAyatCounts] = useState<Record<number, number>>({});
  const [isLoadingAyatCounts, setIsLoadingAyatCounts] = useState<boolean>(true);
  
  // Reset image loading and error states when page changes
  useEffect(() => {
    setIsImageLoading(true);
    setHasError(false);
    // Reset tab to default 'ayat' tab
    setActiveTab('ayat');
  }, [currentPage]);
  
  // Effect to fetch ayat counts when page changes
  useEffect(() => {
    const fetchSurahAyatCounts = async () => {
      if (!currentPageInfo) return;
      
      setIsLoadingAyatCounts(true);
      
      try {
        const { start, end } = currentPageInfo;
        // Get all surahs on the page
        const allSurahs = [];
        
        // Add all surahs between start and end (inclusive)
        for (let surah = start.surah; surah <= end.surah; surah++) {
          allSurahs.push(surah);
        }
        
        const counts: Record<number, number> = {};
        
        // Fetch ayat counts for each surah
        for (const surah of allSurahs) {
          const count = await getSurahAyatCount(surah);
          if (count !== null) {
            counts[surah] = count;
          } else {
            // Fallback values if Redis data is not available
            counts[surah] = surah === 1 ? 7 : (surah === 9 ? 129 : 286); // Better fallbacks
          }
        }
        
        setSurahAyatCounts(counts);
      } catch (error) {
        console.error('Error fetching ayat counts:', error);
      } finally {
        setIsLoadingAyatCounts(false);
      }
    };
    
    fetchSurahAyatCounts();
  }, [currentPageInfo]);
  
  // Function to render the ayat list for the current page
  const renderAyatList = () => {
    if (!currentPageInfo || isLoadingAyatCounts) return null;
    
    const ayatList = [];
    const { start, end } = currentPageInfo;
    
    // If it's a single surah on the page
    if (start.surah === end.surah) {
      const surahName = surahNames[start.surah];
      
      // Add surah header
      ayatList.push(
        <div key={`surah-header-${start.surah}`} className="px-3 py-2 bg-amber-100 text-amber-800 font-medium rounded-md">
          Surah {surahName}
        </div>
      );
      
      // Add ayat
      for (let ayah = start.ayah; ayah <= end.ayah; ayah++) {
        ayatList.push(
          <div 
            key={`${start.surah}-${ayah}`}
            className="px-3 py-2 flex items-center justify-between bg-amber-50 hover:bg-amber-100 rounded-md text-amber-800 transition-colors"
          >
            <span className="font-semibold">Surah {start.surah}, Ayat {ayah}</span>
            <a 
              href={`/surah/${start.surah}?ayat=${ayah}`}
              className="text-amber-600 hover:text-amber-800 flex items-center gap-1 text-sm"
            >
              <span>Lihat</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        );
      }
    } 
    // If the page spans multiple surahs
    else {
      // Iterate through all surahs on the page
      for (let surahNum = start.surah; surahNum <= end.surah; surahNum++) {
        const surahName = surahNames[surahNum];
        
        // Add surah header
        ayatList.push(
          <div key={`surah-header-${surahNum}`} className={`px-3 py-2 bg-amber-100 text-amber-800 font-medium rounded-md ${surahNum !== start.surah ? 'mt-4' : ''}`}>
            Surah {surahName}
          </div>
        );
        
        // Get max ayat for this surah from Redis
        const surahMaxAyat = surahAyatCounts[surahNum] || 286; // Default fallback
        
        // Determine start and end ayat for this surah
        let fromAyah = 1; // Default start from first ayat
        let toAyah = surahMaxAyat; // Default end at last ayat
        
        if (surahNum === start.surah) {
          // If this is the first surah on the page, start from the specified ayat
          fromAyah = start.ayah;
        }
        
        if (surahNum === end.surah) {
          // If this is the last surah on the page, end at the specified ayat
          toAyah = end.ayah;
        }
        
        // Add ayat for this surah
        for (let ayah = fromAyah; ayah <= toAyah; ayah++) {
          ayatList.push(
            <div 
              key={`${surahNum}-${ayah}`}
              className="px-3 py-2 flex items-center justify-between bg-amber-50 hover:bg-amber-100 rounded-md text-amber-800 transition-colors"
            >
              <span className="font-semibold">Surah {surahNum}, Ayat {ayah}</span>
              <a 
                href={`/surah/${surahNum}?ayat=${ayah}`}
                className="text-amber-600 hover:text-amber-800 flex items-center gap-1 text-sm"
              >
                <span>Lihat</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          );
        }
      }
    }
    
    // If no ayat information was found (shouldn't happen with quran_by_page.json)
    if (ayatList.length === 0) {
      ayatList.push(
        <div key="no-data" className="px-3 py-2 text-center text-amber-600">
          Tidak ada informasi ayat untuk halaman ini.
        </div>
      );
    }
    
    return ayatList;
  };
  
  // Calculate Juz number based on page number
  const calculateJuzFromPage = (page: number): string => {
    // Approximate mapping of pages to juz
    const juzPageRanges = [
      { start: 1, end: 21, juz: 1 },    // Juz 1: pages 1-21
      { start: 22, end: 41, juz: 2 },   // Juz 2: pages 22-41
      { start: 42, end: 61, juz: 3 },   // Juz 3
      { start: 62, end: 81, juz: 4 },   // Juz 4
      { start: 82, end: 101, juz: 5 },  // Juz 5
      { start: 102, end: 121, juz: 6 }, // Juz 6
      { start: 122, end: 141, juz: 7 }, // Juz 7
      { start: 142, end: 161, juz: 8 }, // Juz 8
      { start: 162, end: 181, juz: 9 }, // Juz 9
      { start: 182, end: 201, juz: 10 },// Juz 10
      { start: 202, end: 221, juz: 11 },// Juz 11
      { start: 222, end: 241, juz: 12 },// Juz 12
      { start: 242, end: 261, juz: 13 },// Juz 13
      { start: 262, end: 281, juz: 14 },// Juz 14
      { start: 282, end: 301, juz: 15 },// Juz 15
      { start: 302, end: 321, juz: 16 },// Juz 16
      { start: 322, end: 341, juz: 17 },// Juz 17
      { start: 342, end: 361, juz: 18 },// Juz 18
      { start: 362, end: 381, juz: 19 },// Juz 19
      { start: 382, end: 401, juz: 20 },// Juz 20
      { start: 402, end: 421, juz: 21 },// Juz 21
      { start: 422, end: 441, juz: 22 },// Juz 22
      { start: 442, end: 461, juz: 23 },// Juz 23
      { start: 462, end: 481, juz: 24 },// Juz 24
      { start: 482, end: 501, juz: 25 },// Juz 25
      { start: 502, end: 521, juz: 26 },// Juz 26
      { start: 522, end: 541, juz: 27 },// Juz 27
      { start: 542, end: 561, juz: 28 },// Juz 28
      { start: 562, end: 581, juz: 29 },// Juz 29
      { start: 582, end: 604, juz: 30 } // Juz 30
    ];
    
    const juzInfo = juzPageRanges.find(range => page >= range.start && page <= range.end);
    return juzInfo ? juzInfo.juz.toString() : "?";
  };

  // Go to specific page (with validation)
  const goToPage = (pageNumber: number) => {
    const validPage = Math.max(1, Math.min(TOTAL_PAGES, pageNumber));
    onPageChange(validPage);
  };

  // Handle direct page input
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') return;
    
    const pageNumber = parseInt(inputValue, 10);
    if (!isNaN(pageNumber)) {
      const validPage = Math.max(1, Math.min(TOTAL_PAGES, pageNumber));
      onPageChange(validPage);
    }
  };
  
  // Generate the formatted page number string (e.g., 001, 023, 604)
  const formattedPageNumber = currentPage.toString().padStart(3, '0');

  return (
    <div className="w-full max-w-5xl mx-auto bg-amber-50 rounded-lg p-4 mb-6 border border-amber-200 shadow-sm">
      <header className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-7 sm:h-7 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          Mushaf Al-Quran
        </h2>
        <p className="text-gray-600 mt-2">
          Navigasi halaman mushaf Al-Quran.
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full ml-2">
            Fitur sedang dalam pengembangan
          </span>
        </p>
      </header>
      
      {/* Quran Page Navigation */}
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-full mb-6 gap-4">
          <button 
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-md bg-white text-sm text-amber-700 border border-amber-200 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Halaman Pertama"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0L9 10.414V13a1 1 0 11-2 0v-5a1 1 0 011-1h5a1 1 0 110 2h-2.586l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button 
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-md bg-white text-sm text-amber-700 border border-amber-200 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            aria-label="Halaman Sebelumnya"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="ml-1">Sebelumnya</span>
          </button>
          
          <div className="flex items-center px-3 py-2">
            <span className="mr-2 text-amber-700">Hal.</span>
            <input
              type="number"
              min="1"
              max={TOTAL_PAGES}
              value={currentPage}
              onChange={handlePageInputChange}
              className="w-16 px-2 py-1 text-center rounded border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Nomor Halaman"
            />
            <span className="ml-1 text-amber-700">dari {TOTAL_PAGES}</span>
          </div>
          
          <button 
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === TOTAL_PAGES}
            className="px-3 py-2 rounded-md bg-white text-sm text-amber-700 border border-amber-200 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            aria-label="Halaman Selanjutnya"
          >
            <span className="mr-1">Selanjutnya</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <button 
            onClick={() => goToPage(TOTAL_PAGES)}
            disabled={currentPage === TOTAL_PAGES}
            className="px-3 py-2 rounded-md bg-white text-sm text-amber-700 border border-amber-200 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Halaman Terakhir"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10H12a1 1 0 010-2h5a1 1 0 011 1v5a1 1 0 11-2 0V11.414l-4.293 4.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Quran Page Image Display */}
        <div className="w-full max-w-3xl mx-auto mb-6">
            <div className="relative bg-white border border-amber-200 rounded-lg shadow-md overflow-hidden">
              <div className="flex justify-center items-center p-2">
                <div className="relative w-full flex items-center justify-center">
                  <div className="relative w-full">
                    <img 
                      src={`/images/quran-pages/page${formattedPageNumber}.png`}
                      alt={`Halaman ${currentPage} Al-Quran`}
                      className="w-full h-auto object-contain"
                      onLoad={() => {
                        setIsImageLoading(false);
                      }}
                      onError={() => {
                        setIsImageLoading(false);
                        setHasError(true);
                        console.error(`Failed to load image for page ${currentPage}`);
                      }}
                      style={{ display: hasError ? 'none' : 'block' }}
                    />
                  </div>
                  
                  {/* Fallback when image fails to load */}
                  {hasError && (
                    <div className="flex flex-col items-center justify-center h-full w-full p-6 bg-amber-50 absolute inset-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-amber-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                      <p className="text-amber-800 text-center">Gambar halaman tidak tersedia</p>
                    </div>
                  )}
                  
                  {/* Loading overlay */}
                  {isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-3"></div>
                        <p className="text-amber-700">Memuat halaman {currentPage}...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
        
        {/* Page information displayed below the image */}
        {!isImageLoading && !hasError && (
          <div className="flex justify-center mt-3 mb-2">
            <div className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-md text-sm font-medium shadow-sm border border-amber-200">
              Halaman {currentPage}
            </div>
          </div>
        )}
        
        {/* Ayat List for Current Page - Tabbed Interface */}
        {currentPageInfo && (
          <div className="w-full max-w-3xl mx-auto mt-6 bg-white rounded-lg border border-amber-200 shadow-sm">
            {/* Tabs Navigation */}
            <div className="border-b border-amber-200">
              <div className="flex">
                <button 
                  onClick={() => setActiveTab('ayat')}
                  className={`px-4 py-3 font-medium flex items-center ${
                    activeTab === 'ayat' 
                      ? 'text-amber-900 border-b-2 border-amber-600' 
                      : 'text-amber-600 hover:text-amber-800'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Ayat dalam Halaman
                </button>
                <button 
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-3 font-medium flex items-center ${
                    activeTab === 'info' 
                      ? 'text-amber-900 border-b-2 border-amber-600' 
                      : 'text-amber-600 hover:text-amber-800'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Info Halaman
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'ayat' && (
                <div className="space-y-2">
                  {isLoadingAyatCounts ? (
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-500 mr-3"></div>
                      <p className="text-amber-700">Memuat data ayat...</p>
                    </div>
                  ) : (
                    renderAyatList()
                  )}
                </div>
              )}
              
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 rounded-md p-4">
                    <h4 className="font-semibold text-amber-800 mb-2">Informasi Halaman</h4>
                    <ul className="space-y-2 text-amber-700">
                      <li className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        <span>Halaman {currentPage} dari {TOTAL_PAGES}</span>
                      </li>
                      <li className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>
                          Surah: {currentPageInfo.start.surah === currentPageInfo.end.surah 
                            ? surahNames[currentPageInfo.start.surah] 
                            : `${surahNames[currentPageInfo.start.surah]} - ${surahNames[currentPageInfo.end.surah]}`}
                        </span>
                      </li>
                      <li className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span>
                          Juz: {calculateJuzFromPage(currentPage)}
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="text-sm text-center text-amber-600 italic">
                    Gunakan tab "Ayat dalam Halaman" untuk melihat daftar lengkap ayat.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Page Jump Quick Navigation */}
        <div className="mt-8 w-full">
          <h3 className="text-lg font-medium text-amber-800 mb-3 text-center">Navigasi Cepat</h3>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {[1, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600].map(page => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  currentPage === page
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuranPages;