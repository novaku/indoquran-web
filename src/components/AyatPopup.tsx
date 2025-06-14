'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import quranClient from '../services/quranClient';
import { LoadingSpinner } from './LoadingSpinner';
import HighlightedText from './HighlightedText';

interface AyatPopupProps { 
  isOpen: boolean; 
  onClose: () => void; 
  surahId: number; 
  ayatNumber: number;
  searchQuery?: string; // Optional search query for highlighting
}

// Reciters available for audio playback
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

const AyatPopup = ({ 
  isOpen, 
  onClose, 
  surahId, 
  ayatNumber,
  searchQuery = '' // Default to empty string if not provided
}: AyatPopupProps) => {
  const [arabicFontSize, setArabicFontSize] = useState(2.25); // rem
  const [selectedReciter, setSelectedReciter] = useState<keyof typeof RECITERS>("01");
  const [showTafsir, setShowTafsir] = useState(false);
  
  // Client-side only mounting check
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const { data: ayatData, isLoading: isAyatLoading } = useQuery({
    queryKey: ['ayat', surahId, ayatNumber],
    queryFn: async () => {
      const surahData = await quranClient.getSurahDetail(surahId);
      const ayat = surahData.ayat.find(a => a.nomorAyat === ayatNumber);
      return ayat;
    },
    enabled: isOpen && isMounted // Only fetch when popup is open
  });

  const { data: surahData } = useQuery({
    queryKey: ['surah', surahId],
    queryFn: () => quranClient.getSurahDetail(surahId),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen && isMounted
  });

  // Fetch tafsir data when needed
  const { data: tafsirData, isLoading: isTafsirLoading } = useQuery({
    queryKey: ['tafsir', surahId],
    queryFn: () => quranClient.getTafsir(surahId),
    enabled: isOpen && showTafsir && isMounted // Only fetch when user clicks to show tafsir
  });

  // Find the tafsir that matches this ayat
  const ayatTafsir = tafsirData?.find(t => t.ayat === ayatNumber);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen && isMounted) {
      // Save current scroll position and add styles to lock scroll
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'hidden';
      
      // Cleanup function that runs when the component unmounts or when dependencies change
      return () => {
        // Restore scroll position when popup closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        window.scrollTo(0, scrollY); // Use the captured scrollY value
      };
    }
  }, [isOpen, isMounted]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  const handleZoomIn = () => setArabicFontSize((size) => Math.min(size + 0.25, 4));
  const handleZoomOut = () => setArabicFontSize((size) => Math.max(size - 0.25, 1.25));
  
  if (!isOpen || !isMounted) return null;

  // Prepare the sharing content
  const shareTitle = `Surah ${surahData?.namaLatin || ''} (${surahId}): Ayat ${ayatNumber}`;
  const shareText = ayatData ? 
    `${ayatData.teksArab}\n\n${ayatData.teksLatin}\n\n${ayatData.teksIndonesia}\n\n- Al-Quran Digital` : 
    '';
  const shareUrl = typeof window !== 'undefined' ? 
    `${window.location.origin}/surah/${surahId}?ayat=${ayatNumber}` : 
    `/surah/${surahId}?ayat=${ayatNumber}`;

  // Function to share to WhatsApp
  const shareToSocial = (platform: string) => {
    if (platform === 'whatsapp') {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle}\n\n${shareText}\n\n${shareUrl}`)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto m-4 z-[10000]">
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {surahData?.namaLatin} ({surahId}) : Ayat {ayatNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Tutup"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {isAyatLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : ayatData ? (
            <div className="space-y-6">
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
              
              <p 
                className="text-right leading-loose font-arabic text-amber-900 transition-all duration-200"
                style={{ fontSize: arabicFontSize + 'rem' }}
              >
                {ayatData.teksArab}
              </p>
              
              <hr className="border-t border-amber-200" />
              
              {/* Display transliteration without highlighting */}
              <p className="text-lg text-amber-800 font-arabic-translation text-left">
                {ayatData.teksLatin}
              </p>
              
              <hr className="border-t border-amber-200" />
              
              {/* Display Indonesian translation with highlighting */}
              <div className="text-lg font-bold text-amber-900 bg-gradient-to-r from-amber-100 to-amber-200 rounded-lg px-3 py-2 shadow-inner border border-amber-200 text-left">
                {searchQuery && searchQuery.trim().length > 0 ? (
                  <HighlightedText 
                    text={ayatData.teksIndonesia}
                    query={searchQuery}
                    highlightClassName="font-bold bg-amber-200 text-amber-900 px-1 rounded"
                  />
                ) : (
                  <React.Fragment>{ayatData.teksIndonesia}</React.Fragment>
                )}
              </div>

              {/* Tafsir Toggle Button and Share Button */}
              <div className="mt-6 flex flex-wrap items-center gap-3 justify-between">
                <button
                  onClick={() => setShowTafsir(!showTafsir)}
                  className={`
                    px-4 py-2 rounded-md font-semibold text-base
                    flex items-center justify-center gap-2 
                    transition-all duration-200 ease-in-out
                    border-2
                    ${showTafsir 
                      ? "bg-white text-amber-900 border-amber-700 shadow-inner hover:bg-amber-50 focus:ring-2 focus:ring-amber-700" 
                      : "bg-amber-700 text-white border-amber-900 shadow-md hover:bg-amber-800 focus:ring-2 focus:ring-amber-900"}
                  `}
                  style={{
                    boxShadow: showTafsir ? '0 2px 8px 0 rgba(245, 158, 11, 0.10)' : '0 2px 8px 0 rgba(0,0,0,0.10)'
                  }}
                >
                  {showTafsir ? (
                    <span className="font-bold flex items-center gap-2">
                      {/* Eye-catching up arrow for Sembunyikan Tafsir */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 font-bold text-amber-700 drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M12 6c.28 0 .53.11.71.29l6 6a1 1 0 01-1.42 1.42L13 9.41V18a1 1 0 11-2 0V9.41l-4.29 4.3a1 1 0 01-1.42-1.42l6-6A1 1 0 0112 6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-amber-900">Sembunyikan Tafsir</span>
                    </span>
                  ) : (
                    <span className="font-bold flex items-center gap-2">
                      {/* Eye-catching down arrow for Tampilkan Tafsir */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 font-bold text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M12 18a1 1 0 01-.71-.29l-6-6a1 1 0 011.42-1.42L11 14.59V6a1 1 0 112 0v8.59l4.29-4.3a1 1 0 111.42 1.42l-6 6A1 1 0 0112 18z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white">Tampilkan Tafsir</span>
                    </span>
                  )}
                </button>

                {/* WhatsApp Share Button */}
                <button
                  onClick={() => shareToSocial('whatsapp')}
                  className="px-4 py-2 rounded-md font-medium text-base bg-green-600 text-white border border-green-700 shadow-sm hover:bg-green-700 transition-all duration-200 ease-in-out flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                  </svg>
                  Bagikan ke WhatsApp
                </button>
              </div>

              {/* Tafsir Content */}
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
                          Tafsir Surah {surahData?.namaLatin} ({surahId}) Ayat {ayatNumber}
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

              {/* Audio Player Section */}
              {ayatData.audio && (
                <>
                  <hr className="border-t border-amber-200" />
                  <div className="space-y-3">
                    <div className="inline-block">
                      <label htmlFor="popup-reciter-select" className="block text-sm font-medium text-amber-700 mb-2">
                        Pilih Qari
                      </label>
                      <select
                        id="popup-reciter-select"
                        value={selectedReciter}
                        onChange={(e) => setSelectedReciter(e.target.value as keyof typeof RECITERS)}
                        className="inline-block px-5 py-3 rounded-xl border-2 border-amber-700 bg-gradient-to-br from-amber-50 to-amber-200 text-lg text-amber-900 font-bold shadow-lg hover:border-amber-900 focus:outline-none focus:ring-4 focus:ring-amber-400 focus:border-amber-900 transition-all duration-200"
                        style={{ width: 'auto', minWidth: '12rem', maxWidth: '100%', boxShadow: '0 2px 12px 0 rgba(245, 158, 11, 0.15)' }}
                      >
                        {Object.entries(RECITERS).map(([key, name]) => (
                          <option key={key} value={key} className="py-2 text-base font-semibold text-amber-900 bg-white hover:bg-amber-100">
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <audio 
                      controls 
                      className="w-full"
                      src={ayatData.audio[selectedReciter]}
                    >
                      Browser Anda tidak mendukung pemutaran audio.
                    </audio>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <p className="text-red-600">Gagal memuat data ayat.</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AyatPopup;
