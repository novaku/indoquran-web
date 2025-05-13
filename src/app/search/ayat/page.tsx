'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import quranClient from '@/services/quranClient';
import Link from 'next/link';
import { AyatSearchResults, BasicSearch } from '@/components/SearchComponents';
import DynamicHead from '@/components/DynamicHead';

export default function AyatSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Track if we're handling an external URL change
  const isUrlChangeHandled = useRef(false);
  
  // Only sync from URL on initial page load
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const urlQuery = searchParams.get('q') || '';
    
    if (urlQuery) {
      setSearchQuery(urlQuery);
      setDebouncedQuery(urlQuery);
      setCurrentPage(urlPage);
    }
    
    // We're only running this on mount, not on searchParams change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle manual URL changes (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      // When the user navigates with browser controls, sync state with URL
      const newUrlParams = new URLSearchParams(window.location.search);
      const newQuery = newUrlParams.get('q') || '';
      const newPage = parseInt(newUrlParams.get('page') || '1', 10);
      
      console.log('[SearchPage] Browser navigation detected, syncing with URL', {
        query: newQuery,
        page: newPage
      });
      
      if (newQuery) {
        setSearchQuery(newQuery);
        setDebouncedQuery(newQuery);
        setCurrentPage(newPage);
      }
    };
    
    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  // Debounce search query changes
  useEffect(() => {
    // Skip empty queries or very short inputs
    if (!searchQuery || searchQuery.trim().length < 3) return;
    
    // Use a debounce timer
    const timer = setTimeout(() => {
      // Just update the debounced query state - no URL changes
      setDebouncedQuery(searchQuery.trim());
      // Reset to page 1 when query changes
      setCurrentPage(1);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // No need to track user page changes anymore since we're using POST
  // We'll handle page changes directly in the component without URL updates
  
  const { 
    data: searchResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['ayatSearch', debouncedQuery, currentPage],
    queryFn: async () => {
      try {
        // Use POST-style parameters with pagination
        const response = await quranClient.searchAyatText({
          query: debouncedQuery,
          page: currentPage,
          itemsPerPage: 10
        });
        
        return response;
      } catch (err) {
        console.error("Error searching ayat:", err);
        return { 
          results: [], 
          totalResults: 0, 
          totalPages: 0, 
          currentPage: 1 
        };
      }
    },
    enabled: debouncedQuery.trim().length >= 3,
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
  });
  
  // Debounce function now handled by SearchInput component
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <DynamicHead 
        title={debouncedQuery ? `Hasil Pencarian: ${debouncedQuery} | IndoQuran` : 'Pencarian Ayat | IndoQuran'}
        description="Cari ayat dalam Al-Quran berdasarkan kata kunci"
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Pencarian Ayat Al-Quran</h1>
        <p className="text-gray-600">Cari ayat dalam Al-Quran berdasarkan kata kunci (minimal 3 karakter)</p>
      </div>
      
      <div className="mb-8">          <BasicSearch
          value={searchQuery}
          onChange={(newValue) => {
            console.log('[SearchPage] onChange called with:', newValue);
            setSearchQuery(newValue);
          }}
          placeholder="Masukkan kata kunci pencarian ayat..."
          onSearch={(query: string) => {
            console.log('[SearchPage] onSearch called with:', query);
            
            // Special case for clear action
            if (query === 'CLEAR') {
              console.log('[SearchPage] Clear action received');
              // Just update the local state, don't navigate away from current page
              setDebouncedQuery('');
              // Update URL to remove search params but stay on search page
              router.replace('/search/ayat', { scroll: false });
              return;
            }
            
            if (query && query.trim().length >= 3) {
              setDebouncedQuery(query);
              // Update URL with search query
              const newUrl = `/search/ayat?q=${encodeURIComponent(query.trim())}`;
              console.log('[SearchPage] Navigating to:', newUrl);
              router.push(newUrl, { scroll: false });
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
        <React.Fragment>
          {/* Wrap in error boundary or try-catch to prevent element type errors */}
          {debouncedQuery.trim().length >= 3 ? (
            <AyatSearchResults 
              results={searchResponse?.results || []} 
              isLoading={Boolean(isLoading && debouncedQuery.trim().length >= 3)} 
              searchQuery={debouncedQuery}
              itemsPerPage={10}
              currentPage={searchResponse?.currentPage || currentPage}
              totalPages={searchResponse?.totalPages || 1}
              totalResults={searchResponse?.totalResults || 0}
              onPageChange={(page) => {
                // Simple page change - no need for URL updates
                if (page !== currentPage) {
                  setCurrentPage(page);
                  // Scroll to top of results
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Masukkan minimal 3 karakter untuk mencari</p>
            </div>
          )}
        </React.Fragment>
      )}
      
      <div className="mt-8 text-center">
        <Link href="/" className="text-amber-600 hover:text-amber-700">
          ← Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
