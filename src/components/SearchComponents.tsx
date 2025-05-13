'use client';

import React, { useState, useRef, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import HighlightedText from './HighlightedText';
import AyatPopup from './AyatPopup';

// Surah type definition for autocomplete
interface SurahSuggestion {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  arti: string;
}

// Common interface for all search input components
interface BaseSearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  initialQuery?: string;
  isDisabled?: boolean;
  enableSurahAutocomplete?: boolean;
}

// Interface for the SimpleSearchInput
interface SimpleSearchInputProps extends BaseSearchInputProps {}

// Interface for the BasicSearch
interface BasicSearchProps extends BaseSearchInputProps {}

// Interface for the AyatSearchInput
interface AyatSearchInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (event: FormEvent) => void;
  placeholder?: string;
  isDisabled?: boolean;
}

/**
 * SimpleSearchInput - A search input with a search icon and styled UI
 */
export function SimpleSearchInput({
  initialQuery = '',
  placeholder = 'Cari ayat atau surah...',
  onSearch,
  value,
  onChange,
  isDisabled = false,
  enableSurahAutocomplete = true
}: SimpleSearchInputProps) {
  // Local state for uncontrolled mode
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SurahSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Check if we're in controlled mode
  const isControlled = value !== undefined && onChange !== undefined;
  const currentQuery = isControlled ? (value || '') : query;
  
  // Fetch surah suggestions based on query
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!enableSurahAutocomplete || !currentQuery || currentQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(
          `/api/search/surah?q=${encodeURIComponent(currentQuery)}`, 
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        
        const result = await response.json();
        if (result.success && result.data) {
          setSuggestions(result.data);
          setShowSuggestions(result.data.length > 0);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Error fetching surah suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce the suggestion fetch
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [currentQuery, enableSurahAutocomplete]);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(e.target as Node) && 
        inputRef.current && 
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!currentQuery || currentQuery.trim().length < 3) return;
    
    const trimmedQuery = currentQuery.trim();
    setShowSuggestions(false);
    
    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      router.push(`/search/ayat?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (isControlled) {
      onChange?.(newValue);
    } else {
      setQuery(newValue);
    }
    
    // Show suggestions if we have a query
    if (newValue.length >= 2) {
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  const handleSuggestionClick = (surah: SurahSuggestion) => {
    // Navigate to the surah detail page
    router.push(`/surah/${surah.nomor}`);
    
    // Clear the search and hide suggestions
    if (isControlled) {
      onChange?.('');
    } else {
      setQuery('');
    }
    setShowSuggestions(false);
  };
  
  const handleClearClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setTimeout(() => {
      if (isControlled) {
        onChange?.('');
      } else {
        setQuery('');
      }
      
      setSuggestions([]);
      setShowSuggestions(false);
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);
  };

  return (
    <div className="w-full mb-6">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={currentQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full p-4 pl-12 pr-24 rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            style={{ zIndex: 10 }}
            autoComplete="off"
            minLength={2}
            disabled={isDisabled}
            onFocus={() => currentQuery.length >= 2 && setShowSuggestions(true)}
            aria-controls="surah-suggestions"
            aria-expanded={showSuggestions}
            aria-autocomplete="list"
            role="combobox"
            aria-activedescendant={selectedIndex >= 0 && suggestions[selectedIndex] ? `surah-suggestion-${suggestions[selectedIndex].nomor}` : ''}
          />
          
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
            {currentQuery && (
              <button
                type="button"
                onClick={handleClearClick}
                className="p-2 bg-amber-100 dark:bg-amber-700/50 hover:bg-amber-200 dark:hover:bg-amber-700 text-amber-600 dark:text-amber-200 rounded-full cursor-pointer"
                style={{ zIndex: 50, position: 'relative' }}
                aria-label="Hapus pencarian"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg cursor-pointer"
              style={{ zIndex: 50, position: 'relative' }}
              disabled={isDisabled || currentQuery.trim().length < 3}
            >
              Cari
            </button>
          </div>
          
          {/* Autocomplete Suggestions */}
          {showSuggestions && (
            <div 
              ref={suggestionsRef}
              className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 rounded-lg shadow-lg z-50 overflow-hidden"
              role="listbox"
              aria-label="Saran pencarian surah"
              id="surah-suggestions"
            >
              <ul className="max-h-60 overflow-auto">
                {isLoading ? (
                  <li className="p-3 flex items-center text-amber-700 dark:text-amber-300">
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-amber-500 rounded-full border-t-transparent"></div>
                    <span>Mencari surah...</span>
                  </li>
                ) : suggestions.length === 0 ? (
                  <li className="p-3 text-amber-700 dark:text-amber-300 text-center">
                    Tidak ditemukan surah yang sesuai
                  </li>
                ) : (
                  suggestions.map((surah, index) => (
                    <li 
                      key={surah.nomor}
                      onClick={() => handleSuggestionClick(surah)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`p-3 cursor-pointer transition-colors border-b border-amber-100 dark:border-amber-800 ${
                        index === selectedIndex 
                          ? 'bg-amber-100 dark:bg-amber-800/50' 
                          : 'hover:bg-amber-50 dark:hover:bg-amber-800/30'
                      }`}
                      role="option"
                      aria-selected={index === selectedIndex}
                      id={`surah-suggestion-${surah.nomor}`}
                    >
                      <div className="flex items-center">
                        <span className="w-8 h-8 flex items-center justify-center bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-100 rounded-full mr-3 text-sm font-semibold">
                          {surah.nomor}
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                              <HighlightedText text={surah.namaLatin} query={currentQuery} />
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{surah.jumlahAyat} ayat</span>
                          </div>
                          <div className="flex flex-wrap mt-1 text-sm">
                            <span className="text-amber-700 dark:text-amber-300 mr-3">{surah.nama}</span>
                            <span className="text-gray-600 dark:text-gray-400 italic">
                              <HighlightedText text={surah.arti} query={currentQuery} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </form>
      
      <div className="text-center mt-2">
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Cari surah dengan nama seperti "<span className="font-medium">Al-Fatihah</span>" atau cari ayat dengan frasa seperti "<span className="font-medium">maha pengasih</span>"
        </p>
      </div>
    </div>
  );
}

/**
 * BasicSearch - A simple search input with a clear button and submit button
 */
export function BasicSearch({
  value,
  onChange,
  placeholder = 'Cari ayat Al-Qur\'an...',
  onSearch,
  initialQuery = '',
  isDisabled = false
}: BasicSearchProps) {
  // Local state for uncontrolled mode
  const [localQuery, setLocalQuery] = useState(initialQuery);
  const router = useRouter();
  
  // Check if we're in controlled mode
  const isControlled = value !== undefined && onChange !== undefined;
  
  // Current query to display
  const displayValue = isControlled ? value : localQuery;
  
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    const query = (isControlled ? value : localQuery) || '';
    if (query.trim().length < 3) return;
    
    if (onSearch) {
      onSearch(query.trim());
    } else {
      router.push(`/search/ayat?q=${encodeURIComponent(query.trim())}`);
    }
  }
  
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    
    if (isControlled) {
      onChange?.(newValue);
    } else {
      setLocalQuery(newValue);
    }
  }
  
  function handleClearButtonClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    setTimeout(() => {
      if (isControlled) {
        onChange?.('');
      } else {
        setLocalQuery('');
      }
      
      if (onSearch && isControlled) {
        onSearch('CLEAR');
      }
    }, 0);
  }

  return (
    <div className="w-full mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center border-2 border-amber-400 dark:border-amber-700 rounded-lg overflow-hidden">
          <input
            type="text" 
            value={displayValue || ''}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="flex-grow p-3 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            autoComplete="off"
            disabled={isDisabled}
          />
          
          {displayValue && (
            <button
              type="button"
              className="px-3 py-2 bg-amber-100 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300"
              onClick={handleClearButtonClick}
              style={{ cursor: 'pointer' }}
              aria-label="Clear search"
            >
              X
            </button>
          )}
          
          <button 
            type="submit"
            className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white"
            disabled={isDisabled || (!displayValue || displayValue.trim().length < 3)}
          >
            Cari
          </button>
        </div>
      </form>
      
      <div className="text-center mt-2">
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Cari dengan frasa lengkap seperti "maha pengasih" untuk hasil terbaik
        </p>
      </div>
    </div>
  );
}

/**
 * AyatSearchInput - A simple search input specific for Ayat search
 */
export function AyatSearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Cari ayat...",
  isDisabled = false
}: AyatSearchInputProps) {
  return (
    <div className="w-full">
      <form onSubmit={onSearch} className="flex w-full">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          minLength={3}
          disabled={isDisabled}
          required
        />
        <button 
          type="submit"
          className={`px-4 py-2 rounded-r-md text-white transition ${
            isDisabled || value.trim().length < 3 
              ? 'bg-amber-300 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-600'
          }`}
          disabled={isDisabled || value.trim().length < 3}
        >
          Cari
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-1">
        Minimal 3 karakter untuk pencarian. Kata yang dipisahkan spasi akan dicari sebagai AND condition. 
        Contoh: "ampunan rahmat" akan mencari ayat yang mengandung kata "ampunan" DAN "rahmat"
      </p>
    </div>
  );
}

/**
 * AyatSearchResults - Component for displaying Qur'an verse search results with pagination
 */
import { AyatSearchResult } from '@/services/quranService';

interface AyatSearchResultsProps {
  results: AyatSearchResult[];
  isLoading: boolean;
  searchQuery: string;
  itemsPerPage?: number;
  currentPage?: number;
  totalPages?: number;
  totalResults?: number;
  onPageChange?: (page: number) => void;
}

export function AyatSearchResults({ 
  results = [], // Ensure results is never undefined or null
  isLoading, 
  searchQuery, 
  itemsPerPage = 10,
  currentPage: externalCurrentPage = 1,
  totalPages: externalTotalPages,
  totalResults: externalTotalResults = 0,
  onPageChange
}: AyatSearchResultsProps) {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [loadingPageNumber, setLoadingPageNumber] = useState<number | null>(null);
  const [selectedAyat, setSelectedAyat] = useState<{surahId: number; ayatNumber: number} | null>(null);
  
  // Use either controlled (external) values or internal state
  const currentPage = externalCurrentPage;
  const totalPages = externalTotalPages || Math.max(1, Math.ceil(results.length / itemsPerPage));
  
  // Reset pagination when search query changes, but only if the page isn't controlled externally
  useEffect(() => {
    // If we're using external pagination and search query changes, don't reset the page
    // This allows URL-based pagination to work correctly
    if (!externalCurrentPage && searchQuery) {
      setInternalCurrentPage(1);
    }
  }, [searchQuery, externalCurrentPage]);
  
  // Add pagination loading state effect
  useEffect(() => {
    if (!isLoading) {
      // When the main search completes, also end pagination loading
      setIsPaginationLoading(false);
      setLoadingPageNumber(null);
    }
  }, [isLoading]);
  
  // Safety timeout to prevent infinite loading state
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPaginationLoading) {
      // Automatically clear loading state after 3 seconds as a fallback
      timer = setTimeout(() => {
        setIsPaginationLoading(false);
        setLoadingPageNumber(null);
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPaginationLoading]);
  
  // Reset pagination loading state when results change
  useEffect(() => {
    setIsPaginationLoading(false);
    setLoadingPageNumber(null);
  }, [results]);
  
  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPage = Number(e.target.value);
    
    // Set pagination loading state and the page number we're loading
    setIsPaginationLoading(true);
    setLoadingPageNumber(newPage);
    
    // Short timeout to ensure the loading message with correct page number is displayed
    // before the page state actually changes
    setTimeout(() => {
      if (onPageChange) {
        onPageChange(newPage);
      } else {
        setInternalCurrentPage(newPage);
      }
      
      // Scroll to top of results when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };
  
  const changePage = (newPage: number) => {
    // Set pagination loading state and the page number we're loading
    setIsPaginationLoading(true);
    setLoadingPageNumber(newPage);
    
    // Short timeout to ensure the loading message with correct page number is displayed
    setTimeout(() => {
      if (onPageChange) {
        onPageChange(newPage);
      } else {
        setInternalCurrentPage(newPage);
      }
      
      // Scroll to top of results when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };
  
  // Show loading state for initial search and pagination
  if (isLoading || isPaginationLoading) {
    return (
      <div className="w-full">
        {/* If it's a pagination loading state, show a different type of loading indicator */}
        {isPaginationLoading && !isLoading && (
          <div className="flex justify-center items-center mb-4">
            <div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 border border-amber-300 rounded-md">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Memuat halaman {loadingPageNumber || currentPage}...</span>
            </div>
          </div>
        )}
        
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0 && searchQuery) {
    return (
      <div className="text-center py-8">
        <p className="text-lg">Tidak ada hasil untuk pencarian "{searchQuery}"</p>
        <p className="text-gray-500 mt-2">Silakan coba kata kunci lain</p>
      </div>
    );
  }

  // Calculate paginated results if using internal pagination
  const paginatedResults = onPageChange ? results : results.slice((internalCurrentPage - 1) * itemsPerPage, internalCurrentPage * itemsPerPage);
  
  return (
    <div className="w-full">
      {results.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <p className="text-gray-600 mb-2 sm:mb-0">
            Ditemukan {externalTotalResults || results.length} ayat untuk pencarian "{searchQuery}"
          </p>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <label htmlFor="page-select" className="text-sm text-gray-600">
                Halaman:
              </label>
              <select
                id="page-select"
                value={currentPage}
                onChange={handlePageChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {[...Array(totalPages)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1} dari {totalPages}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-6">
        {results.map((result, index) => (
          <div 
            key={index} 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedAyat({ surahId: result.surahId, ayatNumber: result.ayatNumber })}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">
                <span className="text-amber-600 hover:text-amber-700">
                  {result.surahNameLatin} ({result.surahId}:{result.ayatNumber})
                </span>
              </h3>
              <span className="text-gray-500 text-sm">{result.surahName}</span>
            </div>
            
            <div className="mt-2">
              <div className="text-gray-800 mb-1" 
                   dangerouslySetInnerHTML={{ __html: result.matchSnippet }} />
              
              
            </div>
          </div>
        ))}
      </div>
      
      {/* Show total results statistics even when on an empty page due to navigation */}
      {results.length > 0 && paginatedResults.length === 0 && (
        <div className="text-center py-8">
          <p className="text-amber-600">Halaman ini kosong. <button 
            onClick={() => changePage(1)} 
            className="text-amber-700 underline hover:text-amber-800"
          >
            Kembali ke halaman pertama
          </button></p>
        </div>
      )}
      
      {/* Dedicated bottom dropdown pagination for easier navigation */}
      {results.length > 0 && totalPages > 1 && (
        <div className="mt-8 mb-4 flex justify-center">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg px-5 py-3 border border-amber-200 dark:border-amber-700">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Loncat ke Halaman:
              </span>
              <div className="flex items-center gap-3">
                <select
                  value={currentPage}
                  onChange={handlePageChange}
                  className="block w-full min-w-[120px] border border-amber-300 dark:border-amber-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800 text-amber-800 dark:text-amber-200"
                  aria-label="Pilih halaman untuk dilihat"
                >
                  {[...Array(totalPages)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      Halaman {i + 1} dari {totalPages}
                    </option>
                  ))}
                </select>
                <span className="flex gap-2">
                  <button
                    onClick={() => changePage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                    aria-label="Halaman sebelumnya"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                    aria-label="Halaman berikutnya"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Ayat Popup */}
      {selectedAyat && (
        <AyatPopup
          isOpen={!!selectedAyat}
          onClose={() => setSelectedAyat(null)}
          surahId={selectedAyat.surahId}
          ayatNumber={selectedAyat.ayatNumber}
          searchQuery={searchQuery ? searchQuery.trim() : ''} // Ensure searchQuery is properly processed
        />
      )}
    </div>
  );
}
