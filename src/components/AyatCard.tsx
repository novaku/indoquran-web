'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Ayat } from '../types/quran';
import { quranClient } from '../services/quranClient';
import { LoadingSpinner } from './LoadingSpinner';
import { useAuthContext } from '@/contexts/AuthContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useFavorites } from '@/hooks/useFavorites';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { useToast } from '@/contexts/ToastContext';
import offlineStorage from '@/utils/offlineStorage';

interface AudioUrls {
  "01": string;
  "02": string;
  "03": string;
  "04": string;
  "05": string;
}

interface AyatCardProps {
  ayat: Ayat;
  surahId: number;
}

const RECITERS = {
  "01": "Abdullah Al-Juhany",
  "02": "Abdul Muhsin Al-Qasim",
  "03": "Abdurrahman As-Sudais",
  "04": "Ibrahim Al-Dossari",
  "05": "Misyari Rasyid Al-Afasi"
} as const;

// Tooltip component
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
    >
      {children}
      {show && (
        <span className="absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-amber-800 text-white text-xs whitespace-nowrap shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
};

export const AyatCard = ({ ayat, surahId }: AyatCardProps) => {
  const [showTafsir, setShowTafsir] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState<keyof typeof RECITERS>("01");
  const [arabicFontSize, setArabicFontSize] = useState(2.25); // rem, default 3xl = 1.875rem, 2.25rem is a bit larger
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [bookmarkNotes, setBookmarkNotes] = useState('');
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  // Get the user context
  const { user, isAuthenticated } = useAuthContext();
  const { showToast } = useToast();
  
  // Initialize bookmark and favorite hooks
  const { checkBookmark, addBookmark, removeBookmark } = useBookmarks({ 
    userId: user?.user_id || '' 
  });
  
  const { checkFavorite, addFavorite, removeFavorite } = useFavorites({ 
    userId: user?.user_id || '' 
  });
  
  // Initialize reading history hook
  const { saveReadingPosition } = useReadingHistory({
    userId: user?.user_id || ''
  });
  
  // Reference to the ayat card element for intersection observer
  const ayatCardRef = useRef<HTMLDivElement>(null);

  // Fetch surah data to get the name
  const { data: surahData } = useQuery({
    queryKey: ['surah', surahId],
    queryFn: () => quranClient.getSurahDetail(surahId),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch tafsir data when needed
  const { data: tafsirData, isLoading: isTafsirLoading } = useQuery({
    queryKey: ['tafsir', surahId],
    queryFn: () => quranClient.getTafsir(surahId),
    enabled: showTafsir, // Only fetch when user clicks to show tafsir
  });

  // Prepare the sharing content
  const shareTitle = `Surah ${surahData?.namaLatin || ''} (${surahId}): Ayat ${ayat.nomorAyat}`;
  const shareText = `${ayat.teksArab}\n\n${ayat.teksLatin}\n\n${ayat.teksIndonesia}\n\n- Al-Quran Digital`;
  const shareUrl = typeof window !== 'undefined' ? 
    `${window.location.origin}/surah/${surahId}?ayat=${ayat.nomorAyat}` : 
    `/surah/${surahId}?ayat=${ayat.nomorAyat}`;

  // Function to share to WhatsApp
  const shareToSocial = (platform: string) => {
    if (platform === 'whatsapp') {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle}\n\n${shareText}\n\n${shareUrl}`)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleZoomIn = () => setArabicFontSize((size) => Math.min(size + 0.25, 4));
  const handleZoomOut = () => setArabicFontSize((size) => Math.max(size - 0.25, 1.25));

  // Check if the ayat is bookmarked or favorited when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const checkStatus = async () => {
        const bookmarked = await checkBookmark(surahId, ayat.nomorAyat);
        const favorited = await checkFavorite(surahId, ayat.nomorAyat);
        setIsBookmarked(bookmarked);
        setIsFavorite(favorited);
      };
      
      checkStatus();
    }
  }, [isAuthenticated, user, surahId, ayat.nomorAyat, checkBookmark, checkFavorite]);
  
  // Set up intersection observer to track reading position
  useEffect(() => {
    if (!ayatCardRef.current || !isAuthenticated || !user) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When ayat is visible in viewport for more than 70%
          if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
            // Save reading position with debounce to avoid too many API calls
            const savePosition = setTimeout(() => {
              saveReadingPosition(surahId, ayat.nomorAyat);
            }, 1000);
            
            return () => clearTimeout(savePosition);
          }
        });
      },
      { threshold: [0.7] } // 70% visibility threshold
    );

    observer.observe(ayatCardRef.current);

    return () => {
      if (ayatCardRef.current) {
        observer.unobserve(ayatCardRef.current);
      }
    };
  }, [surahId, ayat.nomorAyat, isAuthenticated, user, saveReadingPosition]);
  
  // Find the tafsir that matches this ayat
  const ayatTafsir = tafsirData?.find(t => t.ayat === ayat.nomorAyat);
  
  // Handle bookmark toggle
  const toggleBookmark = async () => {
    if (!isAuthenticated || !user) {
      // Redirect to login page with return URL
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    if (isBookmarked) {
      setBookmarkLoading(true);
      try {
        const success = await removeBookmark(surahId, ayat.nomorAyat);
        if (success) {
          setIsBookmarked(false);
          showToast('Bookmark berhasil dihapus', 'success');
        } else {
          showToast('Gagal menghapus bookmark', 'error');
        }
      } catch (error) {
        console.error('Error removing bookmark:', error);
        showToast('Terjadi kesalahan saat menghapus bookmark', 'error');
      } finally {
        setBookmarkLoading(false);
      }
    } else {
      setShowBookmarkModal(true);
    }
  };
  
  // Handle favorite toggle
  const toggleFavorite = async () => {
    if (!isAuthenticated || !user) {
      // Redirect to login page with return URL
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        const success = await removeFavorite(surahId, ayat.nomorAyat);
        if (success) {
          setIsFavorite(false);
          showToast('Ayat dihapus dari favorit', 'info');
        } else {
          showToast('Gagal menghapus dari favorit', 'error');
        }
      } else {
        const result = await addFavorite(surahId, ayat.nomorAyat);
        if (result) {
          setIsFavorite(true);
          showToast('Ayat ditambahkan ke favorit', 'success');
        } else {
          showToast('Gagal menambahkan ke favorit', 'error');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Terjadi kesalahan saat mengubah status favorit', 'error');
    } finally {
      setFavoriteLoading(false);
    }
  };
  
  // Handle bookmark save
  const saveBookmark = async () => {
    setBookmarkLoading(true);
    try {
      const result = await addBookmark(
        surahId, 
        ayat.nomorAyat, 
        bookmarkTitle || `Surah ${surahData?.namaLatin} Ayat ${ayat.nomorAyat}`, 
        bookmarkNotes
      );
      
      if (result) {
        setIsBookmarked(true);
        setShowBookmarkModal(false);
        // Reset form fields
        setBookmarkTitle('');
        setBookmarkNotes('');
        showToast('Bookmark berhasil ditambahkan', 'success');
      } else {
        showToast('Gagal menambahkan bookmark', 'error');
      }
    } catch (error) {
      console.error('Error saving bookmark:', error);
      showToast('Terjadi kesalahan saat menyimpan bookmark', 'error');
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <div ref={ayatCardRef} className="mb-8 p-6 border border-amber-200 rounded-lg bg-amber-50/30">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 flex items-center justify-center bg-amber-100 rounded-full">
          <span className="text-amber-800">{ayat.nomorAyat}</span>
        </div>
        
        <div className="flex space-x-2">
          <Tooltip text={isBookmarked ? "Hapus Bookmark" : "Tambah Bookmark"}>
            <button 
              onClick={toggleBookmark}
              disabled={bookmarkLoading}
              className={`p-2 rounded-full ${isBookmarked ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700'} hover:bg-amber-500 hover:text-white transition-colors ${bookmarkLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              aria-label={isBookmarked ? "Hapus Bookmark" : "Tambah Bookmark"}
            >
              {bookmarkLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={isBookmarked 
                    ? "M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5" 
                    : "M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"} />
                </svg>
              )}
            </button>
          </Tooltip>
          
          <Tooltip text={isFavorite ? "Hapus dari Favorit" : "Tambah ke Favorit"}>
            <button 
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              className={`p-2 rounded-full ${isFavorite ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700'} hover:bg-amber-500 hover:text-white transition-colors ${favoriteLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              aria-label={isFavorite ? "Hapus dari Favorit" : "Tambah ke Favorit"}
            >
              {favoriteLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              )}
            </button>
          </Tooltip>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-end gap-2 mb-1">
          <Tooltip text="Perkecil Teks Arab">
            <button
              type="button"
              onClick={handleZoomOut}
              className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs hover:bg-amber-200 border border-amber-200"
              aria-label="Perkecil Teks Arab"
            >
              A-
            </button>
          </Tooltip>
          <Tooltip text="Perbesar Teks Arab">
            <button
              type="button"
              onClick={handleZoomIn}
              className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs hover:bg-amber-200 border border-amber-200"
              aria-label="Perbesar Teks Arab"
            >
              A+
            </button>
          </Tooltip>
        </div>
        <p className="text-right leading-loose font-arabic text-amber-900" style={{ fontSize: arabicFontSize + 'rem' }}>
          {ayat.teksArab}
        </p>
        <p className="text-lg text-amber-800 font-arabic-translation text-left">
          {ayat.teksLatin}
        </p>
        <p className="text-gray-700 text-left">
          {ayat.teksIndonesia}
        </p>

        {/* Audio Player Section */}
        <div className="space-y-3">
          {/* Qari Selection - Make width fit content */}
          <div className="inline-block">
            <label htmlFor={`reciter-select-${ayat.nomorAyat}`} className="block text-sm font-medium text-amber-700 mb-2">
              Pilih Qari
            </label>
            <select 
              id={`reciter-select-${ayat.nomorAyat}`}
              value={selectedReciter}
              onChange={(e) => setSelectedReciter(e.target.value as keyof typeof RECITERS)}
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

          {/* Audio Player */}
          <audio 
            controls 
            className="w-full"
            src={ayat.audio[selectedReciter]}
          >
            Browser Anda tidak mendukung pemutaran audio.
          </audio>
        </div>

        {/* Tafsir Button and Content */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <button
              onClick={() => setShowTafsir(!showTafsir)}
              className={`
                px-4 py-2 rounded-md font-medium text-base
                flex items-center justify-center gap-2 
                transition-all duration-200 ease-in-out
                ${showTafsir 
                  ? "bg-amber-100 text-amber-800 border border-amber-300 shadow-inner" 
                  : "bg-amber-500 text-white border border-amber-600 shadow-sm hover:bg-amber-600"}
              `}
            >
              {showTafsir ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Sembunyikan Tafsir</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 011.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Tampilkan Tafsir</span>
                </>
              )}
            </button>

            {/* WhatsApp Share Button */}
            <button
              onClick={() => shareToSocial('whatsapp')}
              className="px-4 py-2 rounded-md font-medium text-base bg-green-500 text-white border border-green-600 shadow-sm hover:bg-green-600 transition-all duration-200 ease-in-out flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
              </svg>
              Bagikan ke WhatsApp
            </button>
          </div>

          {showTafsir && (
            <div className="mt-4 p-5 bg-amber-50 rounded-lg border border-amber-300 shadow-sm animate-fadeIn">
              <div className="text-gray-700 leading-relaxed">
                {isTafsirLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : ayatTafsir ? (
                  <>
                    <h3 className="text-amber-800 font-semibold text-lg mb-3 pb-2 border-b border-amber-200">
                      Tafsir Surah {surahData?.namaLatin} ({surahId}) Ayat {ayat.nomorAyat}
                    </h3>
                    <div 
                      className="whitespace-pre-wrap prose prose-amber prose-sm max-w-none text-left"
                      dangerouslySetInnerHTML={{ __html: ayatTafsir.teks }}
                    />
                  </>
                ) : (
                  <div className="py-4 text-left">
                    <p className="text-amber-600 font-medium">Tafsir tidak tersedia untuk ayat ini.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>


      </div>
      
      {/* Bookmark Modal */}
      {showBookmarkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-amber-800 mb-4">Tambah Bookmark</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="bookmark-title" className="block text-sm font-medium text-gray-700 mb-1">Judul Bookmark</label>
                <input
                  type="text"
                  id="bookmark-title"
                  value={bookmarkTitle}
                  onChange={(e) => setBookmarkTitle(e.target.value)}
                  placeholder={`Surah ${surahData?.namaLatin} Ayat ${ayat.nomorAyat}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label htmlFor="bookmark-notes" className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                <textarea
                  id="bookmark-notes"
                  value={bookmarkNotes}
                  onChange={(e) => setBookmarkNotes(e.target.value)}
                  rows={4}
                  placeholder="Tambahkan catatan..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBookmarkModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={saveBookmark}
                  disabled={bookmarkLoading}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {bookmarkLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Menyimpan...
                    </>
                  ) : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};