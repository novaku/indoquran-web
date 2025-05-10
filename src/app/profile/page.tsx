'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useFavorites } from '@/hooks/useFavorites';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import LastReadingPosition from '@/components/LastReadingPosition';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import * as quranService from '@/services/quranService';
import { useToast } from '@/contexts/ToastContext';

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, createTempUser, logout } = useAuthContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('bookmarks');
  const { showToast } = useToast();

  // If not authenticated and not loading, redirect to login page
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const {
    bookmarks,
    loading: bookmarksLoading,
    error: bookmarksError,
    fetchBookmarks,
    removeBookmark
  } = useBookmarks({ userId: user?.user_id || '' });

  const {
    favorites,
    loading: favoritesLoading,
    error: favoritesError,
    fetchFavorites,
    removeFavorite
  } = useFavorites({ userId: user?.user_id || '' });

  // Fetch bookmarks and favorites when the user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBookmarks();
      fetchFavorites();
    }
  }, [isAuthenticated, user, fetchBookmarks, fetchFavorites]);

  // Query for surah data for each unique surah_id in bookmarks and favorites
  const uniqueSurahIds = new Set([
    ...(bookmarks || []).map(b => b.surah_id),
    ...(favorites || []).map(f => f.surah_id)
  ]);

  // For each surah ID, fetch the surah data
  const surahQueries = [...uniqueSurahIds].map(surahId => ({
    queryKey: ['surah', surahId],
    queryFn: () => quranService.getSurahDetail(surahId),
    staleTime: 5 * 60 * 1000,
  }));

  const surahResults = useQuery({
    queryKey: ['surahBatch', [...uniqueSurahIds]],
    queryFn: async () => {
      const results = await Promise.all(
        [...uniqueSurahIds].map(surahId => quranService.getSurahDetail(surahId))
      );
      return results.reduce((acc: Record<number, any>, curr, i) => {
        acc[[...uniqueSurahIds][i]] = curr;
        return acc;
      }, {});
    },
    enabled: uniqueSurahIds.size > 0,
  });

  // Handle bookmark deletion
  const handleDeleteBookmark = async (bookmark: any) => {
    if (confirm('Apakah Anda yakin ingin menghapus bookmark ini?')) {
      await removeBookmark(bookmark.surah_id, bookmark.ayat_number);
      fetchBookmarks();
    }
  };

  // Handle favorite deletion
  const handleDeleteFavorite = async (favorite: any) => {
    if (confirm('Apakah Anda yakin ingin menghapus favorit ini?')) {
      await removeFavorite(favorite.surah_id, favorite.ayat_number);
      fetchFavorites();
    }
  };

  // Navigate to surah page
  const navigateToSurah = (surahId: number, ayatNumber: number) => {
    router.push(`/surah/${surahId}?ayat=${ayatNumber}`);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-amber-50 rounded-lg border border-amber-200 p-6 mb-8">
        <h1 className="text-2xl font-bold text-amber-800 mb-4">Profil Pengguna</h1>
        
        {isAuthenticated && user ? (
          <div className="mb-6">
            <p className="mb-2"><span className="font-semibold">Nama Pengguna:</span> {user.username}</p>
            <p className="mb-4"><span className="font-semibold">Email:</span> {user.email}</p>
            <button 
              onClick={logout}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            >
              Keluar
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <p className="mb-4">Silakan login untuk mengakses fitur profil.</p>
            <button 
              onClick={createTempUser}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            >
              Masuk sebagai pengguna sementara
            </button>
          </div>
        )}
      </div>

      {isAuthenticated && (
        <>
          <div className="flex border-b border-amber-200 mb-6">
            <button
              className={`py-2 px-4 ${activeTab === 'bookmarks' ? 'text-amber-800 border-b-2 border-amber-600 font-medium' : 'text-gray-500 hover:text-amber-600'}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              Bookmark
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'favorites' ? 'text-amber-800 border-b-2 border-amber-600 font-medium' : 'text-gray-500 hover:text-amber-600'}`}
              onClick={() => setActiveTab('favorites')}
            >
              Favorit
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'history' ? 'text-amber-800 border-b-2 border-amber-600 font-medium' : 'text-gray-500 hover:text-amber-600'}`}
              onClick={() => setActiveTab('history')}
            >
              Riwayat Baca
            </button>
          </div>

          {activeTab === 'bookmarks' && (
            <div>
              <h2 className="text-xl font-semibold text-amber-800 mb-4">Bookmark Saya</h2>
              
              {bookmarksLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : bookmarks && bookmarks.length > 0 ? (
                <div className="grid gap-4">
                  {bookmarks.map((bookmark) => {
                    const surahData = surahResults.data?.[bookmark.surah_id];
                    return (
                      <div key={bookmark.bookmark_id} className="bg-white p-4 rounded-lg border border-amber-200 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-amber-800">{bookmark.title || (surahData ? `Surah ${surahData.namaLatin} Ayat ${bookmark.ayat_number}` : `Surah ${bookmark.surah_id} Ayat ${bookmark.ayat_number}`)}</h3>
                          <p className="text-gray-600 text-sm">{surahData ? `${surahData.namaLatin} (${surahData.arti})` : `Surah ${bookmark.surah_id}`}</p>
                          {bookmark.notes && (
                            <p className="text-gray-600 mt-2 text-sm italic">"{bookmark.notes}"</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigateToSurah(bookmark.surah_id, bookmark.ayat_number)}
                            className="text-amber-600 hover:text-amber-800"
                            title="Lihat Ayat"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteBookmark(bookmark)}
                            className="text-red-500 hover:text-red-700"
                            title="Hapus Bookmark"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600">Belum ada bookmark yang ditambahkan.</p>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-xl font-semibold text-amber-800 mb-4">Favorit Saya</h2>
              
              {favoritesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : favorites && favorites.length > 0 ? (
                <div className="grid gap-4">
                  {favorites.map((favorite) => {
                    const surahData = surahResults.data?.[favorite.surah_id];
                    return (
                      <div key={favorite.favorite_id} className="bg-white p-4 rounded-lg border border-amber-200 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-amber-800">{surahData ? `Surah ${surahData.namaLatin} Ayat ${favorite.ayat_number}` : `Surah ${favorite.surah_id} Ayat ${favorite.ayat_number}`}</h3>
                          <p className="text-gray-600 text-sm">{surahData ? `${surahData.namaLatin} (${surahData.arti})` : `Surah ${favorite.surah_id}`}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigateToSurah(favorite.surah_id, favorite.ayat_number)}
                            className="text-amber-600 hover:text-amber-800"
                            title="Lihat Ayat"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteFavorite(favorite)}
                            className="text-red-500 hover:text-red-700"
                            title="Hapus Favorit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600">Belum ada ayat favorit yang ditambahkan.</p>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-amber-800">Riwayat Baca</h2>
              </div>
              
              <LastReadingPosition />
            </div>
          )}
        </>
      )}
    </div>
  );
}
