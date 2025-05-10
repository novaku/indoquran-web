import Link from 'next/link';
import { Surah } from '../types/quran';
import { useState, useEffect } from 'react';
import { quranClient } from '../services/quranClient';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from './LoadingSpinner';

// Define RECITERS constant
const RECITERS = {
  "01": "Abdullah Al-Juhany",
  "02": "Abdul Muhsin Al-Qasim",
  "03": "Abdurrahman As-Sudais",
  "04": "Ibrahim Al-Dossari",
  "05": "Misyari Rasyid Al-Afasi"
} as const;

interface SurahCardProps {
  surah: Surah;
}

export const SurahCard = ({ surah }: SurahCardProps) => {
  return (
    <Link 
      href={`/surah/${surah.nomor}`}
      className="block p-6 bg-amber-50/30 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 flex items-center justify-center bg-amber-100 rounded-full shrink-0">
          <span className="text-amber-800">{surah.nomor}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-xl font-semibold text-amber-900">{surah.namaLatin}</h3>
            <span className="text-lg font-arabic text-amber-800 shrink-0">{surah.nama}</span>
          </div>
          
          <p className="text-sm text-amber-600">
            {surah.jumlahAyat} Ayat • {surah.tempatTurun === 'mekah' ? 'Makkah' : 'Madinah'}
          </p>
          
          <p className="text-sm text-amber-700 mt-1">{surah.arti}</p>
        </div>
      </div>
    </Link>
  );
};

// --- Homepage Search Feature ---

interface SurahSearchProps {
  onSearchStateChange?: (isSearching: boolean) => void;
  onQueryChange?: (query: string) => void;
}

// Highlighted Text component
const HighlightedText = ({ text, searchTerms }: { text: string, searchTerms: string[] }) => {
  // Case-insensitive regex pattern for all search terms
  const pattern = new RegExp(`(${searchTerms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  
  const parts = text.split(pattern);
  
  return (
    <>
      {parts.map((part, i) => {
        const isMatch = searchTerms.some(term => part.toLowerCase() === term.toLowerCase());
        return isMatch ? (
          <mark key={i} className="bg-amber-200 rounded px-1">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
};

// AyatDetailPopup Component
const AyatDetailPopup = ({ 
  isOpen, 
  onClose, 
  surahNumber, 
  surahName, 
  ayatNumber, 
  arabicText,
  latinText,
  translation,
  audio,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  searchTerms,
  selectedIndex,
  results // Add results prop
}: { 
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  ayatNumber: number;
  arabicText: string;
  latinText: string;
  translation: string;
  audio?: { [key: string]: string };
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  searchTerms?: string[];
  selectedIndex: number;
  results: any[];
}) => {
  const [selectedReciter, setSelectedReciter] = useState<keyof typeof RECITERS>("01");
  const [arabicFontSize, setArabicFontSize] = useState(2.25); // rem, default 3xl = 1.875rem, 2.25rem is a bit larger
  const [showTafsir, setShowTafsir] = useState(false);

  // Fetch tafsir data when needed
  const { data: tafsirData, isLoading: isTafsirLoading } = useQuery({
    queryKey: ['tafsir', surahNumber],
    queryFn: () => quranClient.getTafsir(surahNumber),
    enabled: showTafsir, // Only fetch when user clicks to show tafsir
  });

  // Find the tafsir that matches this ayat
  const ayatTafsir = tafsirData?.find(t => t.ayat === ayatNumber);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position and add styles to lock scroll
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position when popup closes
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleZoomIn = () => setArabicFontSize((size) => Math.min(size + 0.25, 4));
  const handleZoomOut = () => setArabicFontSize((size) => Math.max(size - 0.25, 1.25));

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

  // Prepare the sharing content
  const shareTitle = `Surah ${surahName} (${surahNumber}): Ayat ${ayatNumber}`;
  const shareText = `${arabicText}\n\n${latinText}\n\n${translation}\n\n- Al-Quran Digital`;
  const shareUrl = typeof window !== 'undefined' ? 
    `${window.location.origin}/surah/${surahNumber}?ayat=${ayatNumber}` : 
    `/surah/${surahNumber}?ayat=${ayatNumber}`;

  // Function to share to WhatsApp
  const shareToSocial = (platform: string) => {
    if (platform === 'whatsapp') {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle}\n\n${shareText}\n\n${shareUrl}`)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-amber-900">
              Surah {surahName} ({surahNumber}): Ayat {ayatNumber}
            </h3>
            <button
              onClick={onClose}
              className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
              aria-label="Tutup"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
            <p 
              className="text-right leading-loose font-arabic text-amber-900 transition-all duration-200"
              style={{ fontSize: arabicFontSize + 'rem' }}
            >
              {arabicText}
            </p>
            
            <hr className="border-t border-amber-200" />
            
            <p className="text-lg text-amber-800 font-arabic-translation text-left">
              {latinText}
            </p>
            
            <hr className="border-t border-amber-200" />
            
            <p className="text-gray-700 text-left">
              {searchTerms ? (
                <HighlightedText 
                  text={translation} 
                  searchTerms={searchTerms}
                />
              ) : (
                translation
              )}
            </p>

            {/* Tafsir Toggle Button and Share Button */}
            <div className="mt-6 flex flex-wrap items-center gap-3 justify-between">
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
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
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
                        Tafsir Surah {surahName} ({surahNumber}) Ayat {ayatNumber}
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
            {audio && (
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
                    src={audio[selectedReciter]}
                  >
                    Browser Anda tidak mendukung pemutaran audio.
                  </audio>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center gap-4 pt-6 mt-2 border-t border-amber-200">
              {/* Previous Button Container */}
              <div className="w-1/2">
                {hasPrevious && results[selectedIndex - 1] && (
                  <button
                    onClick={onPrevious}
                    className="w-full p-3 text-sm font-medium bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border border-amber-300 rounded-lg hover:shadow-md transition-all duration-200 flex items-center gap-3 group"
                    aria-label={`Lihat ayat sebelumnya dari ${results[selectedIndex - 1].surahNamaLatin}`}
                  >
                    <div className="bg-amber-200 p-2 rounded-full group-hover:bg-amber-300 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                    <div className="text-left overflow-hidden">
                      <div className="text-xs text-amber-700 font-medium uppercase tracking-wide">Ayat Sebelumnya</div>
                      <div className="text-sm font-semibold truncate">
                        {results[selectedIndex - 1].surahNamaLatin} ({results[selectedIndex - 1].surahNomor}:{results[selectedIndex - 1].ayatNomor})
                      </div>
                    </div>
                  </button>
                )}
              </div>
              
              {/* Next Button Container */}
              <div className="w-1/2">
                {hasNext && results[selectedIndex + 1] && (
                  <button
                    onClick={onNext}
                    className="w-full p-3 text-sm font-medium bg-gradient-to-l from-amber-100 to-amber-50 text-amber-800 border border-amber-300 rounded-lg hover:shadow-md transition-all duration-200 flex items-center gap-3 group justify-end"
                    aria-label={`Lihat ayat berikutnya dari ${results[selectedIndex + 1].surahNamaLatin}`}
                  >
                    <div className="text-right overflow-hidden">
                      <div className="text-xs text-amber-700 font-medium uppercase tracking-wide">Ayat Berikutnya</div>
                      <div className="text-sm font-semibold truncate">
                        {results[selectedIndex + 1].surahNamaLatin} ({results[selectedIndex + 1].surahNomor}:{results[selectedIndex + 1].ayatNomor})
                      </div>
                    </div>
                    <div className="bg-amber-200 p-2 rounded-full group-hover:bg-amber-300 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                )}
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export const SurahSearch = ({ onSearchStateChange, onQueryChange }: SurahSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedAyat, setSelectedAyat] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const pageSize = 10;

  const handleClear = () => {
    setQuery('');
    onQueryChange?.('');
    setResults([]);
    setPage(1);
    setSearchSubmitted(false);
    onSearchStateChange?.(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setResults([]);
    setPage(1);
    setSearchSubmitted(true);
    onSearchStateChange?.(true);

    try {
      const searchTerms = query.trim().toLowerCase().split(/\s+/);
      const surahPromises = Array.from({ length: 114 }, (_, i) => quranService.getSurahDetail(i + 1));
      const surahDetails = await Promise.all(surahPromises);
      const ayatResults: any[] = [];

      surahDetails.forEach(surah => {
        surah.ayat.forEach((ayat: any) => {
          // Check if all search terms are present in the text
          const matches = searchTerms.every(term => 
            ayat.teksIndonesia.toLowerCase().includes(term)
          );
          
          if (matches) {
            ayatResults.push({
              surahNomor: surah.nomor,
              surahNamaLatin: surah.namaLatin,
              ayatNomor: ayat.nomorAyat,
              teksIndonesia: ayat.teksIndonesia
            });
          }
        });
      });
      setResults(ayatResults);
    } catch (err) {
      setError('Gagal mencari terjemahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onQueryChange?.(e.target.value);
    if (!e.target.value) {
      setResults([]);
      onSearchStateChange?.(false);
    }
  };

  const totalPages = Math.ceil(results.length / pageSize);
  const paginatedResults = results.slice((page - 1) * pageSize, page * pageSize);

  // Function to navigate to next/previous ayat in search results
  const navigateAyat = async (direction: 'next' | 'previous') => {
    const newIndex = direction === 'next' ? selectedIndex + 1 : selectedIndex - 1;
    if (newIndex >= 0 && newIndex < results.length) {
      const item = results[newIndex];
      try {
        const surahDetail = await quranService.getSurahDetail(item.surahNomor);
        const ayatDetail = surahDetail.ayat.find((a: any) => a.nomorAyat === item.ayatNomor);
        if (ayatDetail) {
          setSelectedAyat({
            surahNumber: item.surahNomor,
            surahName: item.surahNamaLatin,
            ayatNumber: item.ayatNomor,
            arabicText: ayatDetail.teksArab,
            latinText: ayatDetail.teksLatin,
            translation: ayatDetail.teksIndonesia,
            audio: ayatDetail.audio,
            searchTerms: query.trim().split(/\s+/) // Add search terms
          });
          setSelectedIndex(newIndex);
        }
      } catch (err) {
        console.error('Failed to fetch ayat detail:', err);
      }
    }
  };

  return (
    <div className="mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-amber-200 w-full mx-auto">
        <form onSubmit={handleSearch} className="space-y-4 w-full">
          <div className="w-full mx-auto">
            <label htmlFor="search-query" className="block text-sm font-medium text-amber-700 mb-1">
              Cari Terjemahan Al-Qur'an
            </label>
            <div className="flex gap-2 w-full">
              <div className="relative flex-1 w-full">
                <input
                  id="search-query"
                  type="text"
                  placeholder="Masukkan kata kunci pencarian (contoh: rahmat iman)..."
                  value={query}
                  onChange={handleQueryChange}
                  className="w-full px-4 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-amber-300 text-amber-900 pr-10"
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-600"
                    aria-label="Hapus pencarian"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                disabled={loading || !query.trim()}
              >
                {loading ? 'Mencari...' : 'Cari'}
              </button>
            </div>
            <p className="mt-1 text-sm text-amber-500">
              Tip: Gunakan spasi untuk mencari beberapa kata sekaligus, contoh: "rahmat iman sholat"
            </p>
          </div>
        </form>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <span>{error}</span>
            <Link 
              href="/" 
              className="text-red-600 hover:text-red-700 inline-flex items-center gap-1 font-medium text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Daftar Surah
            </Link>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 overflow-hidden border border-amber-200 rounded-lg bg-white w-full mx-auto">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex justify-between items-center">
            <p className="text-sm text-amber-700">
              Ditemukan <span className="font-medium">{results.length}</span> hasil pencarian untuk &quot;{query}&quot;
            </p>
          </div>
          
          <div className="grid gap-2 p-4">
            {paginatedResults.map((item, idx) => (
              <div 
                key={idx} 
                className="p-4 bg-amber-50/30 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
                onClick={() => {
                  // Fetch the complete ayat data when card is clicked
                  const fetchAyatDetail = async () => {
                    try {
                      const surahDetail = await quranService.getSurahDetail(item.surahNomor);
                      const ayatDetail = surahDetail.ayat.find((a: any) => a.nomorAyat === item.ayatNomor);
                      if (ayatDetail) {
                        setSelectedAyat({
                          surahNumber: item.surahNomor,
                          surahName: item.surahNamaLatin,
                          ayatNumber: item.ayatNomor,
                          arabicText: ayatDetail.teksArab,
                          latinText: ayatDetail.teksLatin,
                          translation: ayatDetail.teksIndonesia,
                          audio: ayatDetail.audio,
                          searchTerms: query.trim().split(/\s+/) // Add search terms
                        });
                        setSelectedIndex(idx + ((page - 1) * pageSize));
                      }
                    } catch (err) {
                      console.error('Failed to fetch ayat detail:', err);
                    }
                  };
                  fetchAyatDetail();
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 flex items-center justify-center bg-amber-100 rounded-full shrink-0">
                      <span className="text-amber-800">{item.ayatNomor}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <Link 
                        href={`/surah/${item.surahNomor}`}
                        className="text-lg font-semibold text-amber-900 hover:underline"
                        onClick={e => e.stopPropagation()} // Prevent card click when clicking the link
                      >
                        {item.surahNomor} - {item.surahNamaLatin}
                      </Link>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      <p className="text-sm text-amber-800 font-arabic-translation text-left">
                        <HighlightedText 
                          text={item.teksLatin || ''} 
                          searchTerms={query.trim().split(/\s+/)}
                        />
                      </p>
                      <p className="text-sm text-amber-900 text-left">
                        <HighlightedText 
                          text={item.teksIndonesia} 
                          searchTerms={query.trim().split(/\s+/)}
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-t border-amber-200">
              <div className="flex items-center gap-2">
                <label htmlFor="page-select" className="text-sm text-amber-600">
                  Halaman:
                </label>
                <select
                  id="page-select"
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value))}
                  className="px-3 py-1 rounded-md bg-white text-sm text-amber-700 border border-amber-200 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <option key={pageNum} value={pageNum}>
                      {pageNum}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-sm text-amber-600">
                dari <span className="font-medium">{totalPages}</span> halaman
              </span>
            </div>
          )}

        </div>
      )}
      
      {searchSubmitted && query && results.length === 0 && !loading && error === null && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <span>Tidak ada hasil yang ditemukan</span>
          </div>
        </div>
      )}
      
      {/* Ayat Detail Popup */}
      <AyatDetailPopup
        isOpen={!!selectedAyat}
        onClose={() => setSelectedAyat(null)}
        surahNumber={selectedAyat?.surahNumber}
        surahName={selectedAyat?.surahName}
        ayatNumber={selectedAyat?.ayatNumber}
        arabicText={selectedAyat?.arabicText}
        latinText={selectedAyat?.latinText}
        translation={selectedAyat?.translation}
        audio={selectedAyat?.audio}
        onNext={() => navigateAyat('next')}
        onPrevious={() => navigateAyat('previous')}
        hasNext={selectedIndex < results.length - 1}
        hasPrevious={selectedIndex > 0}
        searchTerms={selectedAyat?.searchTerms} // Pass search terms to popup
        selectedIndex={selectedIndex}
        results={results}
      />
      
    </div>
  );
};