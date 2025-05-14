import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ErrorMessage } from './ErrorMessage';

export interface SurahIndexItem {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  arti: string;
}

interface SurahListProps {
  surahs: SurahIndexItem[] | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function SurahList({ 
  surahs, loading, error, searchQuery, setSearchQuery 
}: SurahListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Function to handle the "Kembali ke Daftar Surah" link
  const handleResetSearch = () => {
    // Empty the search query
    setSearchQuery('');
    
    // Remove the search parameter from the URL and refresh
    const params = new URLSearchParams(searchParams);
    params.delete('q');
    router.push(pathname + (params.toString() ? `?${params.toString()}` : ''));
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-gray-200 p-4 rounded-md h-16"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} retry={() => router.refresh()} />;
  }

  if (!surahs || surahs.length === 0) {
    return (
      <ErrorMessage 
        message={`Gagal mencari terjemahan "${searchQuery}"`} 
        onClearSearchAndRefresh={handleResetSearch} 
      />
    );
  }

  return (
    <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {surahs.map((surah) => (
        <Link
          href={`/surah/${surah.nomor}`}
          key={surah.nomor}
          className="block"
        >
          <div className="h-full bg-[#f8f4e5] border border-[#d3c6a6] rounded-lg p-3 sm:p-4 hover:shadow-lg transition-shadow duration-200 flex flex-col">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#8D6E63] text-white font-bold shadow-sm">
                <span className="text-xs sm:text-sm">{surah.nomor}</span>
              </div>
              <span className="text-xl sm:text-2xl font-semibold text-[#5D4037] font-arabic">{surah.nama}</span>
            </div>
            <div>
              <h3 className="font-bold mb-1 text-[#5D4037] text-sm sm:text-base">{surah.namaLatin}</h3>
              <p className="text-xs sm:text-sm text-[#795548] mb-1 sm:mb-2">
                {surah.jumlahAyat} Ayat
              </p>
              <p className="text-xs text-[#8D6E63] italic line-clamp-2">
                {surah.arti}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}