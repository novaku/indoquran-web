'use client';

import { useQuery } from '@tanstack/react-query';
import { quranClient } from '../services/quranClient';
import { SurahCardSkeleton } from '../components/SurahCardSkeleton';
import { ErrorMessage } from '../components/ErrorMessage';
import Link from 'next/link';
import { useState } from 'react';
import { SurahSearch } from '../components/SurahCard';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  const { data: surahs, isLoading, error, refetch } = useQuery({
    queryKey: ['surahs'],
    queryFn: () => quranClient.getAllSurah(),
    staleTime: 5 * 60 * 1000,
  });
  
  // Add Helmet for home page SEO
  const canonicalUrl = "http://indoquran.web.id";

  const [tooltipSurah, setTooltipSurah] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <div className="w-full mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-amber-100 rounded mb-6 w-48" />
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="grid grid-cols-5 gap-4 mb-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-amber-100 rounded" />
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="grid grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-amber-50/50 rounded" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mx-auto mt-8 px-4">
        <ErrorMessage 
          message="Gagal memuat daftar surah. Silakan coba lagi." 
          retry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <main className="w-full mx-auto px-4 py-8 bg-[#FDF8EE]">
      <Helmet>
        <title>Al-Quran Indonesia | Baca Al-Quran Online dengan Terjemahan & Tafsir</title>
        <meta name="description" content="Baca Al-Quran online lengkap dengan terjemahan Bahasa Indonesia, tafsir, audio murottal. Tersedia 114 surah dengan navigasi mudah." />
        <meta name="keywords" content="al quran, quran online, baca quran, al-quran indonesia, terjemahan quran, tafsir quran, quran digital, murottal quran" />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Al-Quran Indonesia",
              "url": "${canonicalUrl}",
              "description": "Baca Al-Quran online dengan terjemahan dan tafsir Bahasa Indonesia",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "${canonicalUrl}?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            }
          `}
        </script>
      </Helmet>
      <div className="mb-12 text-center">
        <div className="w-full mx-auto">
          <SurahSearch 
            onSearchStateChange={setIsSearching} 
            onQueryChange={setSearchQuery}
          />
        </div>
      </div>

      {(!isSearching || !searchQuery) && (
        <div className="bg-white rounded-xl overflow-hidden border border-amber-200 shadow-lg relative">
          <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 opacity-50"></div>
          <div className="text-center py-3 bg-amber-100/80 border-b border-amber-200">
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-amber-800">Klik pada baris untuk melihat detail surah</span>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full divide-y divide-amber-200">
              <thead className="sticky top-0 z-10 shadow-md">
                <tr className="bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200">
                  <th scope="col" className="px-6 py-5 text-left text-base font-extrabold text-amber-950 w-16">No.</th>
                  <th scope="col" className="px-6 py-5 text-right text-base font-extrabold text-amber-950 w-48">Nama Arab</th>
                  <th scope="col" className="px-6 py-5 text-left text-base font-extrabold text-amber-950">Nama Latin</th>
                  <th scope="col" className="px-6 py-5 text-center text-base font-extrabold text-amber-950 w-32">Jumlah Ayat</th>
                  <th scope="col" className="px-6 py-5 text-left text-base font-extrabold text-amber-950">Arti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {surahs?.map((surah) => (
                  <tr
                    key={surah.nomor}
                    className="hover:bg-amber-50/90 transition-all relative group cursor-pointer hover:shadow-md"
                    onMouseEnter={() => setTooltipSurah(surah.nomor)}
                    onMouseLeave={() => setTooltipSurah(null)}
                    onClick={() => window.location.href = `/surah/${surah.nomor}`}
                  >
                    <td className="px-6 py-5 whitespace-nowrap text-lg font-semibold text-amber-900">
                      {surah.nomor}
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <span className="text-3xl font-arabic text-amber-800 leading-relaxed">{surah.nama}</span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-amber-900 font-medium text-lg">{surah.namaLatin}</span>
                    </td>
                    <td className="px-6 py-5 text-center whitespace-nowrap text-left text-amber-700">
                      {surah.jumlahAyat} Ayat
                    </td>
                    <td className="px-6 py-5 text-amber-700 leading-relaxed">
                      {surah.arti}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
