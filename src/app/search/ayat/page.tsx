'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { quranClient } from '@/services/quranClient';
import { Helmet } from 'react-helmet-async';
import Link from 'next/link';
import AyatSearchResults from '@/components/AyatSearchResults';
import SearchInput from '@/components/SearchInput';

export default function AyatSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Use debounce to avoid too many searches while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      // Update URL with search query, reset to page 1 when query changes
      if (searchQuery.trim() !== '') {
        router.push(`/search/ayat?q=${encodeURIComponent(searchQuery.trim())}&page=1`, { scroll: false });
        setCurrentPage(1);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery, router]);
  
  // Update URL when page changes but query remains the same
  useEffect(() => {
    if (debouncedQuery.trim() !== '' && initialPage !== currentPage) {
      router.push(`/search/ayat?q=${encodeURIComponent(debouncedQuery.trim())}&page=${currentPage}`, { scroll: false });
    }
  }, [currentPage, debouncedQuery, router, initialPage]);
  
  const { 
    data: searchResults = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['ayatSearch', debouncedQuery],
    queryFn: () => quranClient.searchAyatText(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 3,
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
  });
  
  // Debounce function now handled by SearchInput component
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Helmet>
        <title>{debouncedQuery ? `Hasil Pencarian: ${debouncedQuery} | IndoQuran` : 'Pencarian Ayat | IndoQuran'}</title>
        <meta name="description" content="Cari ayat dalam Al-Quran berdasarkan kata kunci" />
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Pencarian Ayat Al-Quran</h1>
        <p className="text-gray-600">Cari ayat dalam Al-Quran berdasarkan kata kunci (minimal 3 karakter)</p>
      </div>
      
      <div className="mb-8">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Masukkan kata kunci pencarian ayat..."
          onSearch={(query: string) => {
            if (query && query.trim().length >= 3) {
              setDebouncedQuery(query);
              // Update URL with search query
              router.push(`/search/ayat?q=${encodeURIComponent(query.trim())}`, { scroll: false });
            }
          }}
        />
      </div>
      
      {error ? (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Terjadi kesalahan saat mencari. Silakan coba lagi.</p>
          <p className="text-sm">{(error as Error).message}</p>
        </div>
      ) : (
        <AyatSearchResults 
          results={searchResults} 
          isLoading={isLoading && debouncedQuery.trim().length >= 3} 
          searchQuery={debouncedQuery}
          itemsPerPage={10}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
      
      <div className="mt-8 text-center">
        <Link href="/" className="text-amber-600 hover:text-amber-700">
          ← Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
