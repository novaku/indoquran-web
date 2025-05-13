'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import quranClient from '@/services/quranClient';
import { ErrorMessage } from '@/components/ErrorMessage';
import SurahList, { SurahIndexItem } from '@/components/SurahList';
import { SimpleSearchInput as SearchInput } from '@/components/SearchComponents';
import Link from 'next/link';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(query);

  // Fetch all surahs
  const { data: allSurahs, isLoading: isLoadingSurahs, error: surahsError } = useQuery({
    queryKey: ['surahs'],
    queryFn: () => quranClient.getAllSurah(),
    staleTime: 5 * 60 * 1000,
  });

  // Filter surahs based on search query
  const filteredSurahs: SurahIndexItem[] | null = query && allSurahs 
    ? allSurahs.filter(surah => 
        surah.namaLatin.toLowerCase().includes(query.toLowerCase()) ||
        surah.arti.toLowerCase().includes(query.toLowerCase())
      )
    : (allSurahs || null);

  // Handle going back to home
  const handleBackToHome = () => {
    router.push('/');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    router.push('/');
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Cari Surah: {query} | Al-Quran Indonesia</title>
        <meta name="description" content={`Hasil pencarian untuk "${query}" di Al-Quran Indonesia. Cari surah berdasarkan nama atau terjemahan.`} />
      </Helmet>

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBackToHome}
          className="flex items-center text-amber-700 hover:text-amber-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>
        <h1 className="text-2xl font-bold">Hasil Pencarian</h1>
      </div>
      
      <div className="mb-6 w-full">
        <SearchInput 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Cari ayat Al-Qur'an..."
          onSearch={(query: string) => {
            if (query && query.trim().length >= 3) {
              router.push(`/search/ayat?q=${encodeURIComponent(query)}`);
            }
          }}
        />
      </div>
      
      {query ? (
        <>
          <p className="mb-4 text-gray-600">
            Menampilkan hasil pencarian untuk: <span className="font-medium">"{query}"</span>
          </p>
          
          <div className="w-full">
            <SurahList 
              surahs={filteredSurahs}
              loading={isLoadingSurahs}
              error={surahsError ? "Gagal memuat hasil pencarian" : null}
              searchQuery={query}
              setSearchQuery={setSearchQuery}
            />
          </div>
        </>
      ) : (
        <div className="text-center p-8 bg-amber-50 rounded-lg">
          <p className="text-lg mb-4">Silakan masukkan kata kunci untuk mencari surah.</p>
          <Link 
            href="/"
            className="text-amber-700 hover:text-amber-900 font-medium"
          >
            Kembali ke Daftar Surah
          </Link>
        </div>
      )}
    </main>
  );
}
