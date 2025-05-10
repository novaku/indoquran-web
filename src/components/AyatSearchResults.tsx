import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AyatSearchResult } from '@/services/quranService';

interface Props {
  results: AyatSearchResult[];
  isLoading: boolean;
  searchQuery: string;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const AyatSearchResults: React.FC<Props> = ({ 
  results, 
  isLoading, 
  searchQuery, 
  itemsPerPage = 10,
  currentPage: externalCurrentPage,
  onPageChange
}) => {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [paginatedResults, setPaginatedResults] = useState<AyatSearchResult[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  
  // Use either controlled (external) page or internal page state
  const currentPage = externalCurrentPage !== undefined ? externalCurrentPage : internalCurrentPage;
  
  // Reset pagination when results or search query changes
  useEffect(() => {
    if (onPageChange) {
      onPageChange(1);
    } else {
      setInternalCurrentPage(1);
    }
  }, [searchQuery, results.length, onPageChange]);
  
  // Calculate paginated results and total pages
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(results.length / itemsPerPage));
    setTotalPages(totalPages);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, results.length);
    setPaginatedResults(results.slice(startIndex, endIndex));
  }, [results, currentPage, itemsPerPage]);
  
  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPage = Number(e.target.value);
    
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalCurrentPage(newPage);
    }
    
    // Scroll to top of results when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const changePage = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalCurrentPage(newPage);
    }
    
    // Scroll to top of results when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 p-4 rounded-md">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
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

  return (
    <div className="w-full">
      {results.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <p className="text-gray-600 mb-2 sm:mb-0">
            Ditemukan {results.length} ayat untuk pencarian "{searchQuery}"
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
        {paginatedResults.map((result, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">
                <Link 
                  href={`/surah/${result.surahId}?ayat=${result.ayatNumber}`}
                  className="text-amber-600 hover:text-amber-700"
                >
                  {result.surahNameLatin} ({result.surahId}:{result.ayatNumber})
                </Link>
              </h3>
              <span className="text-gray-500 text-sm">{result.surahName}</span>
            </div>
            
            <div className="mt-2">
              <div className="text-gray-800 mb-1" 
                   dangerouslySetInnerHTML={{ __html: result.matchSnippet }} />
              
              <div className="text-gray-600 text-sm mt-2 text-right">
                <Link 
                  href={`/surah/${result.surahId}?ayat=${result.ayatNumber}`} 
                  className="text-amber-500 hover:text-amber-600 flex items-center justify-end gap-1"
                >
                  <span>Lihat ayat</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Bottom pagination for better UX when there are many results */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => changePage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-2 py-1 rounded ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-amber-600 hover:bg-amber-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Sebelumnya</span>
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Halaman</span>
              <select
                value={currentPage}
                onChange={handlePageChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {[...Array(totalPages)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-600">dari {totalPages}</span>
            </div>
            
            <button
              onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-2 py-1 rounded ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-amber-600 hover:bg-amber-50'
              }`}
            >
              <span>Berikutnya</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AyatSearchResults;
