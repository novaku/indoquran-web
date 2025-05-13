'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import tafsirData from '../utils/tafsir_maudhui_full.json';

type Ayah = {
  surah: number;
  ayah: number;
};

type Topic = {
  topic: string;
  description: string;
  verses: Ayah[];
};

const TafsirMaudhuiTree = () => {
  const router = useRouter();
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingAyah, setLoadingAyah] = useState<{surah: number; ayah: number} | null>(null);
  
  // Calculate total verses across all topics
  const totalVerses = useMemo(() => {
    return tafsirData.topics.reduce((sum, topic) => sum + topic.verses.length, 0);
  }, []);

  const toggleTopic = (topicName: string) => {
    const newExpandedTopics = new Set(expandedTopics);
    if (newExpandedTopics.has(topicName)) {
      newExpandedTopics.delete(topicName);
    } else {
      newExpandedTopics.add(topicName);
    }
    setExpandedTopics(newExpandedTopics);

    // Find and set the selected topic
    const topic = tafsirData.topics.find(t => t.topic === topicName) || null;
    setSelectedTopic(topic);
    
    // Auto-scroll to topic details on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('topic-details')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleAyahClick = (surah: number, ayah: number) => {
    setIsLoading(true);
    setLoadingAyah({ surah, ayah });
    router.push(`/surah/${surah}?ayat=${ayah}`);
    
    // Reset loading state after a timeout in case navigation gets stuck
    setTimeout(() => {
      setIsLoading(false);
      setLoadingAyah(null);
    }, 3000);
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
    <div className="bg-[#f8f9fa] rounded-lg p-4 shadow-md">
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
        <div className="md:w-1/2 lg:w-2/5 overflow-auto max-h-[50vh] md:max-h-[70vh] border border-amber-100 rounded-md bg-white p-2">
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
                          {expandedTopics.has(topic.topic) || selectedTopic?.topic === topic.topic 
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
        <div id="topic-details" className="md:w-1/2 lg:w-3/5">
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
                <ul className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {selectedTopic.verses.map((verse, index) => {
                    const isVerseLoading = loadingAyah?.surah === verse.surah && loadingAyah?.ayah === verse.ayah;
                    
                    return (
                      <li 
                        key={`${verse.surah}-${verse.ayah}-${index}`} 
                        className="animate-fadeIn" 
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <button
                          onClick={() => handleAyahClick(verse.surah, verse.ayah)}
                          className={`w-full text-left py-1.5 px-3 rounded hover:bg-amber-100 transition-colors flex items-center
                            ${isLoading ? 'opacity-70' : ''}
                            ${isVerseLoading ? 'bg-amber-100' : ''}
                            ${isLoading ? 'pointer-events-none' : ''}
                          `}
                          title={`Buka Surah ${verse.surah} Ayat ${verse.ayah}`}
                          disabled={isLoading}
                        >
                          <span className="mr-2 bg-amber-200 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                            {index + 1}
                          </span>
                          <span>
                            Surah {verse.surah} : Ayat {verse.ayah}
                          </span>
                          <span className="ml-auto text-xs text-amber-700">
                            {isVerseLoading ? (
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
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
    </div>
  );
};

export default TafsirMaudhuiTree;
