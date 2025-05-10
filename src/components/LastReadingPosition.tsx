'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { useAuthContext } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { quranService } from '@/services/quranService';
import { LoadingSpinner } from './LoadingSpinner';

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export default function LastReadingPosition() {
  const { user, isAuthenticated } = useAuthContext();
  const { readingPosition, fetchReadingPosition, loading, error } = useReadingHistory({
    userId: user?.user_id || ''
  });
  const [refreshing, setRefreshing] = useState(false);

  // Fetch surah data if we have a reading position
  const { data: surahData, isLoading: isSurahLoading } = useQuery({
    queryKey: ['surah', readingPosition?.surah_id],
    queryFn: () => quranService.getSurahDetail(readingPosition?.surah_id || 0),
    enabled: !!readingPosition?.surah_id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const refreshReadingPosition = async () => {
    setRefreshing(true);
    await fetchReadingPosition();
    setRefreshing(false);
  };

  useEffect(() => {
    if (isAuthenticated && user?.user_id) {
      fetchReadingPosition();
    }
  }, [isAuthenticated, user, fetchReadingPosition]);

  if (loading || isSurahLoading) {
    return (
      <div className="bg-white border border-amber-200 rounded-lg p-6 shadow-sm w-full mb-6 animate-pulse">
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-6 shadow-sm w-full mb-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={refreshReadingPosition}
          className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
          disabled={refreshing}
        >
          {refreshing ? 'Memuat Ulang...' : 'Coba Lagi'}
        </button>
      </div>
    );
  }

  if (!readingPosition) {
    return (
      <div className="bg-white border border-amber-200 rounded-lg p-6 shadow-sm w-full mb-6">
        <h3 className="text-lg font-semibold text-amber-800 mb-2">Posisi Terakhir Membaca</h3>
        <p className="text-gray-600">Anda belum memiliki riwayat membaca.</p>
        <Link href="/" className="mt-3 inline-block px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700">
          Mulai Membaca
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-amber-200 rounded-lg p-6 shadow-sm w-full mb-6">
      <h3 className="text-lg font-semibold text-amber-800 mb-2">Posisi Terakhir Membaca</h3>
      <div className="space-y-2">
        <p className="text-gray-700">
          <span className="font-medium">Surah:</span>{' '}
          {surahData ? (
            <span>
              {surahData.namaLatin} ({surahData.nama})
            </span>
          ) : (
            <span>Surah {readingPosition.surah_id}</span>
          )}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Ayat:</span> {readingPosition.ayat_number}
        </p>          <p className="text-gray-500 text-sm">
            Terakhir dibaca: {formatDate(readingPosition.last_read)}
          </p>
        
        <div className="pt-3 mt-3 border-t border-amber-100 flex flex-wrap gap-2">
          <Link
            href={`/surah/${readingPosition.surah_id}?ayat=${readingPosition.ayat_number}`}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Lanjutkan Membaca
          </Link>
          <button
            onClick={refreshReadingPosition}
            className="px-4 py-2 border border-amber-300 bg-amber-50 text-amber-800 rounded-md hover:bg-amber-100"
            disabled={refreshing}
          >
            {refreshing ? 'Memuat Ulang...' : 'Segarkan'}
          </button>
        </div>
      </div>
    </div>
  );
}
