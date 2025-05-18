'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import tafsirData from '../utils/tafsir_maudhui_full.json';
import { AyatCard } from './AyatCard'; // Import AyatCard component
import { useQuery } from '@tanstack/react-query';
import quranClient from '../services/quranClient';

// Mapping of surah numbers to their names
const surahNames: {[key: number]: string} = {
  1: "Al-Fatihah", 2: "Al-Baqarah", 3: "Ali 'Imran", 4: "An-Nisa'", 5: "Al-Ma'idah",
  6: "Al-An'am", 7: "Al-A'raf", 8: "Al-Anfal", 9: "At-Tawbah", 10: "Yunus",
  11: "Hud", 12: "Yusuf", 13: "Ar-Ra'd", 14: "Ibrahim", 15: "Al-Hijr",
  16: "An-Nahl", 17: "Al-Isra'", 18: "Al-Kahf", 19: "Maryam", 20: "Ta-Ha",
  21: "Al-Anbiya'", 22: "Al-Hajj", 23: "Al-Mu'minun", 24: "An-Nur", 25: "Al-Furqan",
  26: "Ash-Shu'ara'", 27: "An-Naml", 28: "Al-Qasas", 29: "Al-Ankabut", 30: "Ar-Rum",
  31: "Luqman", 32: "As-Sajdah", 33: "Al-Ahzab", 34: "Saba'", 35: "Fatir",
  36: "Ya-Sin", 37: "As-Saffat", 38: "Sad", 39: "Az-Zumar", 40: "Ghafir",
  41: "Fussilat", 42: "Ash-Shura", 43: "Az-Zukhruf", 44: "Ad-Dukhan", 45: "Al-Jathiyah",
  46: "Al-Ahqaf", 47: "Muhammad", 48: "Al-Fath", 49: "Al-Hujurat", 50: "Qaf",
  51: "Adh-Dhariyat", 52: "At-Tur", 53: "An-Najm", 54: "Al-Qamar", 55: "Ar-Rahman",
  56: "Al-Waqi'ah", 57: "Al-Hadid", 58: "Al-Mujadilah", 59: "Al-Hashr", 60: "Al-Mumtahanah",
  61: "As-Saff", 62: "Al-Jumu'ah", 63: "Al-Munafiqun", 64: "At-Taghabun", 65: "At-Talaq",
  66: "At-Tahrim", 67: "Al-Mulk", 68: "Al-Qalam", 69: "Al-Haqqah", 70: "Al-Ma'arij",
  71: "Nuh", 72: "Al-Jinn", 73: "Al-Muzzammil", 74: "Al-Muddathir", 75: "Al-Qiyamah",
  76: "Al-Insan", 77: "Al-Mursalat", 78: "An-Naba'", 79: "An-Nazi'at", 80: "'Abasa",
  81: "At-Takwir", 82: "Al-Infitar", 83: "Al-Mutaffifin", 84: "Al-Inshiqaq", 85: "Al-Buruj",
  86: "At-Tariq", 87: "Al-A'la", 88: "Al-Ghashiyah", 89: "Al-Fajr", 90: "Al-Balad",
  91: "Ash-Shams", 92: "Al-Layl", 93: "Ad-Duha", 94: "Ash-Sharh", 95: "At-Tin",
  96: "Al-'Alaq", 97: "Al-Qadr", 98: "Al-Bayyinah", 99: "Az-Zalzalah", 100: "Al-'Adiyat",
  101: "Al-Qari'ah", 102: "At-Takathur", 103: "Al-'Asr", 104: "Al-Humazah", 105: "Al-Fil",
  106: "Quraysh", 107: "Al-Ma'un", 108: "Al-Kawthar", 109: "Al-Kafirun", 110: "An-Nasr",
  111: "Al-Masad", 112: "Al-Ikhlas", 113: "Al-Falaq", 114: "An-Nas"
};

// Function to get surah name by number
const getSurahName = (surahNumber: number): string => {
  return surahNames[surahNumber] || `Surah ${surahNumber}`;
};

type Ayah = {
  surah: number;
  ayah: number;
};

type Topic = {
  topic: string;
  description: string;
  verses: Ayah[];
};

// Define AyatPopup component
const AyatPopup: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  surahId: number; 
  ayatId: number;
}> = ({ 
  isOpen, 
  onClose, 
  surahId, 
  ayatId 
}) => {
  const { data: ayatData, isLoading } = useQuery({
    queryKey: ['ayat', surahId, ayatId],
    queryFn: async () => {
      const surahData = await quranClient.getSurahDetail(surahId);
      const ayat = surahData.ayat.find(a => a.nomorAyat === ayatId);
      return ayat;
    },
    enabled: isOpen // Only fetch when popup is open
  });
  
  // Client-side only mounting check
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

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

  if (!isOpen || !isMounted) return null;

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
            {getSurahName(surahId)} ({surahId}) : Ayat {ayatId}
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
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {!isLoading && ayatData && (
            <AyatCard ayat={ayatData} surahId={surahId} />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const TafsirMaudhuiTree = () => {
  const router = useRouter();
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  // We don't need isLoading state anymore as we're using anchor tags that open in new tabs
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingAyah, setLoadingAyah] = useState<{surah: number; ayah: number} | null>(null);
  // State for the ayat popup
  const [selectedAyat, setSelectedAyat] = useState<{surah: number; ayah: number} | null>(null);
  
  // Calculate total verses across all topics
  const totalVerses = useMemo(() => {
    return tafsirData.topics.reduce((sum, topic) => sum + topic.verses.length, 0);
  }, []);

  // Sort verses by surah number first, then by ayat number
  const getSortedVerses = (verses: Ayah[]): Ayah[] => {
    return [...verses].sort((a, b) => {
      // First sort by surah number
      if (a.surah !== b.surah) {
        return a.surah - b.surah;
      }
      // If same surah, sort by ayat number
      return a.ayah - b.ayah;
    });
  };

  // Group verses by surah number
  const getGroupedVersesBySurah = (verses: Ayah[]): Record<number, Ayah[]> => {
    const sortedVerses = getSortedVerses(verses);
    return sortedVerses.reduce<Record<number, Ayah[]>>((acc, verse) => {
      if (!acc[verse.surah]) {
        acc[verse.surah] = [];
      }
      acc[verse.surah].push(verse);
      return acc;
    }, {});
  };

  const toggleTopic = (topicName: string) => {
    // Check if we're clicking the same topic that's already selected
    const isClickingSameTopic = selectedTopic?.topic === topicName;
    
    if (isClickingSameTopic) {
      // Clicking the same topic again, deselect it
      setSelectedTopic(null);
    } else {
      // Find and set the selected topic
      const topic = tafsirData.topics.find(t => t.topic === topicName) || null;
      setSelectedTopic(topic);
    }
    
    // Keep track of topic expansion state for content display
    const newExpandedTopics = new Set(expandedTopics);
    if (!isClickingSameTopic) {
      // If selecting a new topic, set it as expanded
      newExpandedTopics.add(topicName);
    }
    setExpandedTopics(newExpandedTopics);
    
    // Auto-scroll to topic details on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('topic-details')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Function to get ayah URL
  const getAyahUrl = (surah: number, ayah: number) => {
    return `/surah/${surah}?ayat=${ayah}`;
  };
  
  // Handle ayah click - now opens a popup instead of a new tab
  const handleAyahClick = (surah: number, ayah: number, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault(); // Prevent default link behavior
    }
    
    setLoadingAyah({ surah, ayah });
    setSelectedAyat({ surah, ayah });
    
    // Reset loading state after a timeout
    setTimeout(() => {
      setLoadingAyah(null);
    }, 2000);
  };

  // Close the ayat popup
  const closeAyatPopup = () => {
    setSelectedAyat(null);
  };

  // Filter topics based on search term
  const filteredTopics = useMemo(() => {
    if (!searchTerm.trim()) return tafsirData.topics;
    
    const term = searchTerm.toLowerCase();
    return tafsirData.topics.filter(topic => 
      topic.topic.toLowerCase().includes(term) || 
      topic.description.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  // Group topics alphabetically
  const groupedTopics = useMemo(() => {
    return filteredTopics.reduce<Record<string, Topic[]>>((acc, topic) => {
      const firstLetter = topic.topic[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(topic);
      return acc;
    }, {});
  }, [filteredTopics]);

  const alphabeticalGroups = useMemo(() => {
    return Object.keys(groupedTopics).sort();
  }, [groupedTopics]);

  return (
    <div className="w-full bg-[#f8f9fa] rounded-lg p-4 shadow-md">
      <h2 className="text-xl font-bold mb-2 text-[#5D4037]">Tafsir Al-Maudhu'i (Tafsir Tematik)</h2>
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="bg-amber-100 text-amber-800 rounded-full px-3 py-1 text-sm font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {tafsirData.topics.length} Tema
        </div>
        <div className="bg-amber-100 text-amber-800 rounded-full px-3 py-1 text-sm font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {totalVerses} Ayat
        </div>
      </div>
      <p className="mb-4 text-gray-700">
        Tafsir Al-Maudhu'i adalah metode menafsirkan Al-Quran berdasarkan tema-tema tertentu
        dengan mengumpulkan ayat-ayat yang relevan dari berbagai surah.
      </p>
      
      {/* Search input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari tema tafsir..."
            className="w-full px-4 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 pl-10"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {searchTerm ? `${filteredTopics.length} tema ditemukan` : `${tafsirData.topics.length} tema total`}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Topics Tree */}
        <div className="md:w-1/2 overflow-auto max-h-[50vh] md:max-h-[70vh] border border-amber-100 rounded-md bg-white p-2">
          {alphabeticalGroups.length > 0 ? (
            alphabeticalGroups.map((letter) => (
              <div key={letter} className="mb-3">
                <h3 className="text-lg font-semibold text-amber-700 border-b border-amber-300 pb-1 mb-2">
                  {letter}
                </h3>
                <ul className="pl-2">
                  {groupedTopics[letter].map((topic, index) => (
                    <li key={`${topic.topic}-${index}`} className="mb-2">
                      <button
                        onClick={() => toggleTopic(topic.topic)}
                        className={`flex items-center text-left w-full p-2 rounded hover:bg-amber-50 transition-colors ${
                          selectedTopic?.topic === topic.topic ? 'bg-amber-100 font-semibold' : ''
                        }`}
                      >
                        <span className="mr-2">
                          {selectedTopic?.topic === topic.topic
                            ? '▼' 
                            : '►'}
                        </span>
                        <span>{topic.topic}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          ({topic.verses.length})
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="py-8 px-4 text-center bg-white rounded-md shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-gray-600">Tidak ada tema yang sesuai dengan pencarian "{searchTerm}"</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-3 text-amber-600 hover:text-amber-800 font-medium"
              >
                Reset pencarian
              </button>
            </div>
          )}
        </div>

        {/* Topic Details */}
        <div id="topic-details" className="md:w-1/2">
          {selectedTopic ? (
            <div className="bg-white p-4 rounded-md shadow-sm animate-fadeIn">
              <h3 className="text-lg font-bold text-amber-800 mb-2">{selectedTopic.topic}</h3>
              <p className="text-gray-700 mb-4">{selectedTopic.description}</p>
              
              <div className="bg-amber-50 p-3 rounded-md">
                <h4 className="font-medium mb-2 text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ayat-ayat terkait:
                </h4>
                <div className="max-h-[500px] overflow-y-auto pr-1 space-y-4">
                  {/* Group verses by surah */}
                  {Object.entries(getGroupedVersesBySurah(selectedTopic.verses)).map(([surahId, verses]) => {
                    const surahNumber = parseInt(surahId);
                    return (
                      <div key={surahNumber} className="animate-fadeIn">
                        <h5 className="font-medium text-amber-700 mb-2 pb-1 border-b border-amber-200">
                          {getSurahName(surahNumber)} (Surah {surahNumber})
                        </h5>
                        <ul className="space-y-2">
                          {verses.map((verse, index) => {
                            const isVerseLoading = loadingAyah?.surah === verse.surah && loadingAyah?.ayah === verse.ayah;
                            
                            return (
                              <li 
                                key={`${verse.surah}-${verse.ayah}`} 
                                className="animate-fadeIn" 
                                style={{ animationDelay: `${index * 50}ms` }}
                              >
                                <button
                                  onClick={(e) => handleAyahClick(verse.surah, verse.ayah, e)}
                                  className={`w-full text-left py-1.5 px-3 rounded hover:bg-amber-100 transition-colors flex items-center cursor-pointer
                                    ${isVerseLoading ? 'bg-amber-100' : ''}
                                  `}
                                  title={`Buka ${getSurahName(verse.surah)} Ayat ${verse.ayah} dalam popup`}
                                >
                                  <span className="mr-2 bg-amber-200 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                    {verse.ayah}
                                  </span>
                                  <span>
                                    Ayat {verse.ayah}
                                  </span>
                                  <span className="ml-auto text-xs text-amber-700">
                                    {isVerseLoading ? (
                                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    )}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-md shadow-sm text-center text-gray-500 h-full flex items-center justify-center">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-amber-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="mb-2">Pilih tema tafsir di sebelah kiri untuk melihat detailnya</p>
                <p className="text-sm">Terdapat {filteredTopics.length} tema tafsir 
                  {searchTerm && ` untuk pencarian "${searchTerm}"`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Ayat Popup - Display when an ayat is selected */}
      {selectedAyat && (
        <AyatPopup
          isOpen={!!selectedAyat}
          onClose={closeAyatPopup}
          surahId={selectedAyat.surah}
          ayatId={selectedAyat.ayah}
        />
      )}
    </div>
  );
};

export default TafsirMaudhuiTree;
