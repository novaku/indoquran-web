'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { quranClient } from '../../../services/quranClient';
import { AyatCard } from '../../../components/AyatCard';
import { AyatCardSkeleton } from '../../../components/AyatCardSkeleton';
import { ErrorMessage } from '../../../components/ErrorMessage';
import { Ayat } from '../../../types/quran';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import SurahStructuredData from '../../../components/SurahStructuredData';
import offlineStorage from '../../../utils/offlineStorage';

const RECITERS = {
  "01": "Abdullah Al-Juhany",
  "02": "Abdul Muhsin Al-Qasim",
  "03": "Abdurrahman As-Sudais",
  "04": "Ibrahim Al-Dossari",
  "05": "Misyari Rasyid Al-Afasi"
} as const;

type ReciterKey = keyof typeof RECITERS;

interface AyatCardProps {
  ayat: Ayat;
  surahId: number;
  tafsirData: { ayat: number; teks: string; }[] | undefined;
}

export default function SurahPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const surahId = Number(params.id);
  const [selectedReciter, setSelectedReciter] = useState<ReciterKey>("01");
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  
  // Get current page from URL or default to 1
  const currentPage = Number(searchParams.get('page') || '1');
  const pageSize = 10; // Number of ayats per page
  
  // Check if there's a specific ayat to navigate to
  const ayatParam = searchParams.get('ayat');
  
  // Function to change page with scroll to top
  const changePage = (newPage: number) => {
    if (newPage < 1) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    router.push(`/surah/${surahId}?page=${newPage}`);
  };
  
  // Add scroll listener to show/hide floating navigation
  useEffect(() => {
    const handleScroll = () => {
      // Show floating nav when user has scrolled down a bit
      setShowFloatingNav(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Calculate the correct page for a specific ayat number - memoized to avoid recalculation
  const getPageForAyat = useMemo(() => {
    return (ayatNumber: number) => Math.ceil(ayatNumber / pageSize);
  }, [pageSize]);
  
  // This useMemo has been moved below after data is fetched to avoid the ReferenceError

  const { 
    data: surah, 
    isLoading: isSurahLoading, 
    error: surahError, 
    refetch: refetchSurah 
  } = useQuery({
    queryKey: ['surah', surahId],
    queryFn: () => quranClient.getSurahDetail(surahId),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
  
  // We'll move this useMemo to after the data is fetched to ensure all variables are defined
  // This helps avoid the ReferenceError with accessing surah before it's defined

  const {
    data: tafsirData,
    isLoading: isTafsirLoading,
    error: tafsirError
  } = useQuery({
    queryKey: ['tafsir', surahId],
    queryFn: () => quranClient.getTafsir(surahId),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  const isLoading = isSurahLoading || isTafsirLoading;
  const error = surahError || tafsirError;
  
  // Track this surah for offline access when data is loaded
  useEffect(() => {
    if (surah && !isLoading) {
      // Track the current surah for offline access
      offlineStorage.trackRecentSurah(surahId);
      
      // Cache the surah data for offline access
      if (surah) {
        offlineStorage.saveQuranData(`surah-${surahId}`, surah);
      }
    }
  }, [surah, surahId, isLoading]);
  
  // This code section is after loading state and data has been fetched 
  // Handle navigation to specific ayat if provided in URL
  useEffect(() => {
    if (!isLoading && surah?.ayat && ayatParam) {
      const ayatNumber = parseInt(ayatParam, 10);
      if (!isNaN(ayatNumber) && ayatNumber > 0 && ayatNumber <= surah.ayat.length) {
        const correctPage = getPageForAyat(ayatNumber);
        if (correctPage !== currentPage) {
          // Navigate to the correct page that contains the ayat
          router.replace(`/surah/${surahId}?page=${correctPage}&ayat=${ayatNumber}`);
        } else {
          // After page loads, scroll to the specific ayat
          setTimeout(() => {
            const ayatElement = document.getElementById(`ayat-${ayatNumber}`);
            if (ayatElement) {
              ayatElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Add highlight class
              ayatElement.classList.add('highlight-ayat');
              // Remove highlight class after animation completes
              setTimeout(() => {
                ayatElement.classList.remove('highlight-ayat');
              }, 2000);
            }
          }, 500);
        }
      }
    }
  }, [surah, ayatParam, currentPage, isLoading, pageSize, surahId, router, getPageForAyat]);

  if (isLoading) {
    return (
      <div className="w-full mx-auto px-4">
        <Link href="/" className="text-amber-600 hover:text-amber-700 mb-8 inline-block">
          ← Kembali ke Daftar Surah
        </Link>

        <div className="text-center mb-12 p-8 bg-amber-50 rounded-lg border border-amber-200 animate-pulse">
          <div key="title" className="h-10 w-48 bg-amber-200 rounded mx-auto mb-4"></div>
          <div key="subtitle" className="h-8 w-32 bg-amber-200 rounded mx-auto mb-4"></div>
          <div key="description" className="h-6 w-24 bg-amber-200 rounded mx-auto"></div>
        </div>

        <div className="space-y-6">
          {[...Array(5)].map((_, index) => (
            <AyatCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mx-auto mt-8 px-4">
        <Link href="/" className="text-amber-600 hover:text-amber-700 mb-8 inline-block">
          ← Kembali ke Daftar Surah
        </Link>
        <ErrorMessage 
          message="Gagal memuat data. Silakan coba lagi." 
          retry={() => refetchSurah()}
        />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4">
      <Helmet>
        <title>Surah {surah?.namaLatin} - {surah?.arti} | Al-Quran Indonesia</title>
        <meta name="description" content={`Baca Surah ${surah?.namaLatin} (${surah?.nama}) - ${surah?.arti} lengkap dengan terjemahan Bahasa Indonesia dan tafsir.`} />
        <meta name="keywords" content={`surah ${surah?.namaLatin?.toLowerCase()}, ${surah?.nama}, ${surah?.arti}, quran, al-quran, terjemahan ${surah?.namaLatin}, tafsir ${surah?.namaLatin}, baca ${surah?.namaLatin}`} />
        <link rel="canonical" href={`https://indoquran.web.app/surah/${surahId}`} />
      </Helmet>
      {surah && <SurahStructuredData surah={surah} />}
      <Link href="/" className="text-amber-600 hover:text-amber-700 mb-8 inline-block">
        ← Kembali ke Daftar Surah
      </Link>
      
      {/* Floating Navigation */}
      {surah?.ayat && surah.ayat.length > pageSize && showFloatingNav && (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
          <div className="bg-amber-600 text-white text-sm px-3 py-2 rounded-full shadow-lg flex items-center gap-2">
            <button
              onClick={() => currentPage > 1 && changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Halaman Sebelumnya"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span className="mx-2 font-medium">{currentPage}/{Math.ceil(surah.ayat.length / pageSize)}</span>
            
            <button
              onClick={() => currentPage < Math.ceil(surah.ayat.length / pageSize) && changePage(currentPage + 1)}
              disabled={currentPage === Math.ceil(surah.ayat.length / pageSize)}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Halaman Berikutnya"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-book-primary text-white p-2 rounded-full shadow-lg hover:bg-book-secondary"
            aria-label="Kembali ke atas"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      )}

      <div className="text-center mb-12 p-8 bg-book-paper rounded-lg border border-book-border shadow-md">
        {/* Arabic name */}
        <p className="text-4xl font-arabic text-book-primary mb-4">{surah?.nama}</p>
        
        {/* Latin name */}
        <h1 className="text-3xl font-bold text-book-primary mb-2">{surah?.namaLatin}</h1>
        
        {/* Indonesian meaning */}
        <p className="text-xl text-book-secondary mb-4">{surah?.arti}</p>
        
        {/* Location and number of ayats */}
        <div className="mt-4 text-book-secondary">
          <p className="text-lg">
            <span className="font-semibold">Tempat Turun:</span>{' '}
            {surah?.tempatTurun === 'mekah' ? 'Makkah' : 'Madinah'} •{' '}
            <span className="font-semibold">Jumlah Ayat:</span> {surah?.jumlahAyat}
          </p>
        </div>

        {/* Description with HTML support */}
        {surah?.deskripsi && (
          <div className="mt-6 text-sm text-book-text max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold mb-2">Deskripsi Surah</h2>
            <div 
              className="prose prose-stone prose-sm"
              dangerouslySetInnerHTML={{ __html: surah.deskripsi }} 
            />
          </div>
        )}

        {/* Audio player */}
        {surah?.audioFull && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2 text-book-primary">Murattal</h2>
            <div className="flex flex-col items-center gap-4">
              <div className="inline-block">
                <label htmlFor="full-reciter-select" className="block text-sm font-medium text-amber-700 mb-1">
                  Pilih Qari
                </label>
                <select 
                  id="full-reciter-select"
                  value={selectedReciter}
                  onChange={(e) => setSelectedReciter(e.target.value as ReciterKey)}
                  className="inline-block px-4 py-2 rounded-md border border-amber-200 bg-white text-sm text-amber-900 font-medium shadow-sm hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  style={{ width: 'auto', minWidth: '8rem', maxWidth: '100%' }}
                >
                  {Object.entries(RECITERS).map(([key, name]) => (
                    <option key={key} value={key} className="py-1">
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <audio 
                controls 
                className="w-full"
                src={surah.audioFull[selectedReciter]}
              >
                Browser Anda tidak mendukung pemutaran audio.
              </audio>
            </div>
          </div>
        )}
      </div>

      {/* Ayat list with pagination */}
      <div className="space-y-6">
        {surah?.ayat
          ?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .map((ayat: Ayat) => (
            <div 
              key={ayat.nomorAyat}
              id={`ayat-${ayat.nomorAyat}`}
              className="scroll-mt-8 rounded-lg transition-all"
            >
              <AyatCard 
                ayat={ayat} 
                surahId={Number(params.id)} 
              />
            </div>
          ))
        }
      </div>
      
      {/* Pagination controls */}
      {surah?.ayat && surah.ayat.length > pageSize && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <label htmlFor="page-select" className="text-sm text-amber-600">
                Halaman:
              </label>
              <select
                id="page-select"
                value={currentPage}
                onChange={(e) => changePage(Number(e.target.value))}
                className="px-3 py-1 rounded-md bg-white text-sm text-amber-700 border border-amber-200 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {Array.from({ length: Math.ceil(surah.ayat.length / pageSize) }, (_, i) => i + 1).map((pageNum) => (
                  <option key={pageNum} value={pageNum}>
                    {pageNum}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Jump to ayat feature */}
            <div className="flex items-center gap-2 ml-4">
              <label htmlFor="jump-to-ayat" className="text-sm text-amber-600">
                Ayat:
              </label>
              <select
                id="jump-to-ayat"
                value={ayatParam || ''}
                onChange={(e) => {
                  const ayatNumber = Number(e.target.value);
                  if (ayatNumber > 0) {
                    const pageForAyat = getPageForAyat(ayatNumber);
                    router.push(`/surah/${surahId}?page=${pageForAyat}&ayat=${ayatNumber}`);
                  }
                }}
                className="px-3 py-1 rounded-md bg-white text-sm text-amber-700 border border-amber-200 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Pilih</option>
                {Array.from({ length: surah.ayat.length }, (_, i) => i + 1).map((ayatNum) => (
                  <option key={`ayat-${ayatNum}`} value={ayatNum}>
                    {ayatNum}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <span className="text-sm text-amber-600 hidden md:inline">
            {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, surah.ayat.length)} dari <span className="font-medium">{surah.ayat.length}</span> ayat
          </span>
          
          <div className="flex gap-2">
            <button
              onClick={() => currentPage > 1 && changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-white text-sm text-amber-700 border border-amber-200 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>
            <button
              onClick={() => currentPage < Math.ceil(surah.ayat.length / pageSize) && changePage(currentPage + 1)}
              disabled={currentPage === Math.ceil(surah.ayat.length / pageSize)}
              className="px-3 py-1 rounded-md bg-white text-sm text-amber-700 border border-amber-200 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span className="hidden sm:inline">Berikutnya</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div className="flex justify-center my-6">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          Kembali ke atas
        </button>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {surah?.suratSebelumnya && (
          <Link 
            href={`/surah/${surah.suratSebelumnya.nomor}`}
            className="text-amber-600 hover:text-amber-700 group"
          >
            <span className="block text-sm">Surah Sebelumnya</span>
            <span>← {surah.suratSebelumnya.namaLatin}</span>
          </Link>
        )}
        {surah?.suratSelanjutnya && (
          <Link 
            href={`/surah/${surah.suratSelanjutnya.nomor}`}
            className="text-amber-600 hover:text-amber-700 ml-auto text-right group"
          >
            <span className="block text-sm">Surah Selanjutnya</span>
            <span>{surah.suratSelanjutnya.namaLatin} →</span>
          </Link>
        )}
      </div>
    </div>
  );
}