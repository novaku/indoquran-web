import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchHistoryItem } from '@/services/searchHistoryService';

interface SearchHistoryProps {
  searchHistory: SearchHistoryItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
  onPageChange: (page: number) => void;
  onDeleteItem: (searchId: number) => void;
  onClearAll: () => void;
}

export default function SearchHistory({
  searchHistory,
  loading,
  error,
  pagination,
  onPageChange,
  onDeleteItem,
  onClearAll
}: SearchHistoryProps) {
  const router = useRouter();

  if (loading) {
    return <div className="py-4">
      <div className="animate-pulse">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center justify-between p-3 mb-2 bg-gray-100 rounded-md">
            <div className="w-2/3">
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-6 w-6 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    </div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-md my-4">
      Error: {error}
    </div>;
  }

  if (searchHistory.length === 0) {
    return <div className="text-center py-8 bg-amber-50 rounded-md">
      <p className="text-gray-600 mb-2">Belum ada riwayat pencarian</p>
      <Link href="/search" className="text-amber-700 hover:text-amber-900 font-medium">
        Mulai pencarian
      </Link>
    </div>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Riwayat Pencarian Ayat & Surah</h3>
        <button
          onClick={onClearAll}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Hapus Semua
        </button>
      </div>

      <div className="space-y-2">
        {searchHistory.map((item) => {
          const url = `/search/${item.search_type === 'surah' ? '' : 'ayat'}?q=${encodeURIComponent(item.query_text)}&fromHistory=1`;
          return (
            <div
              key={item.search_id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={e => {
                // Prevent navigation if clicking the delete button
                if ((e.target as HTMLElement).closest('button')) return;
                router.push(url);
              }}
              tabIndex={0}
              role="button"
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  router.push(url);
                }
              }}
            >
              <div className="flex-1">
                <span className="font-medium text-amber-700 hover:text-amber-900">
                  "{item.query_text}"
                </span>
                <div className="flex text-sm text-gray-500 mt-1">
                  <span className="mr-4">
                    <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs">
                      {item.search_type === 'surah' ? 'Surah' : 'Ayat'}
                    </span>
                  </span>
                  <span className="mr-4">Hasil: {item.result_count}</span>
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDeleteItem(item.search_id);
                }}
                className="text-gray-400 hover:text-red-600 focus:outline-none"
                aria-label="Delete search history item"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-6">
          <div className="flex justify-center">
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  pagination.currentPage === 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, idx) => {
                let pageNumber;
                
                // Calculate the page number based on current page and position
                if (pagination.totalPages <= 5) {
                  pageNumber = idx + 1; // Show 1, 2, 3, 4, 5 for small number of pages
                } else if (pagination.currentPage <= 3) {
                  pageNumber = idx + 1; // Show 1, 2, 3, 4, 5 when near the start
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNumber = pagination.totalPages - 4 + idx; // Show last 5 pages when near the end
                } else {
                  pageNumber = pagination.currentPage - 2 + idx; // Show current page and 2 pages on each side
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pagination.currentPage === pageNumber 
                        ? 'z-10 bg-amber-50 border-amber-500 text-amber-600' 
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  pagination.currentPage === pagination.totalPages 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}