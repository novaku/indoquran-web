'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useFavorites } from '@/hooks/useFavorites';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import LastReadingPosition from '@/components/LastReadingPosition';
import BookmarkSkeleton from '@/components/BookmarkSkeleton';
import FavoriteSkeleton from '@/components/FavoriteSkeleton';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import * as quranService from '@/services/quranService';
import { useToast } from '@/contexts/ToastContext';

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, createTempUser, logout } = useAuthContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('bookmarks');
  const [tabsInitialized, setTabsInitialized] = useState<Record<string, boolean>>({
    bookmarks: false,
    favorites: false,
    history: false
  });
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

  // Fetch data only for the active tab when it changes or when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      // Only fetch data for the active tab and mark as initialized
      if (activeTab === 'bookmarks' && !tabsInitialized.bookmarks) {
        fetchBookmarks();
        setTabsInitialized(prev => ({ ...prev, bookmarks: true }));
      } else if (activeTab === 'favorites' && !tabsInitialized.favorites) {
        fetchFavorites();
        setTabsInitialized(prev => ({ ...prev, favorites: true }));
      }
      // Reading history is handled internally by LastReadingPosition component
    }
  }, [isAuthenticated, user, activeTab, fetchBookmarks, fetchFavorites, tabsInitialized]);

  // Get unique surah IDs only for the active tab data
  const getActiveTabSurahIds = () => {
    if (activeTab === 'bookmarks' && bookmarks) {
      return new Set(bookmarks.map(b => b.surah_id));
    } else if (activeTab === 'favorites' && favorites) {
      return new Set(favorites.map(f => f.surah_id));
    }
    return new Set<number>();
  };

  // Only fetch surah data for the currently visible tab
  const uniqueSurahIds = getActiveTabSurahIds();

  // Query for surah data using React Query
  const surahResults = useQuery({
    queryKey: ['surahBatch', activeTab, [...uniqueSurahIds]],
    queryFn: async () => {
      if (uniqueSurahIds.size === 0) return {};
      
      const results = await Promise.all(
        [...uniqueSurahIds].map(surahId => quranService.getSurahDetail(surahId))
      );
      return results.reduce((acc: Record<number, any>, curr, i) => {
        acc[[...uniqueSurahIds][i]] = curr;
        return acc;
      }, {});
    },
    enabled: uniqueSurahIds.size > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
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
              onClick={() => {
                setActiveTab('bookmarks');
                // Only force refresh if this is the first time viewing the tab or if explicitly refreshing
                if (!tabsInitialized.bookmarks) {
                  fetchBookmarks(true);
                  setTabsInitialized(prev => ({ ...prev, bookmarks: true }));
                }
              }}
            >
              Bookmark
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'favorites' ? 'text-amber-800 border-b-2 border-amber-600 font-medium' : 'text-gray-500 hover:text-amber-600'}`}
              onClick={() => {
                setActiveTab('favorites');
                // Only force refresh if this is the first time viewing the tab or if explicitly refreshing
                if (!tabsInitialized.favorites) {
                  fetchFavorites(true);
                  setTabsInitialized(prev => ({ ...prev, favorites: true }));
                }
              }}
            >
              Favorit
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'history' ? 'text-amber-800 border-b-2 border-amber-600 font-medium' : 'text-gray-500 hover:text-amber-600'}`}
              onClick={() => {
                setActiveTab('history');
                // Mark as initialized - actual data fetching is handled by LastReadingPosition
                setTabsInitialized(prev => ({ ...prev, history: true }));
              }}
            >
              Riwayat Baca
            </button>
          </div>

          {activeTab === 'bookmarks' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-amber-800">Bookmark Saya</h2>
                <button 
                  onClick={() => fetchBookmarks(true)}
                  className="text-amber-600 hover:text-amber-800 flex items-center"
                  disabled={bookmarksLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span className="text-sm">Segarkan</span>
                </button>
              </div>
              
              {bookmarksLoading || (bookmarks && bookmarks.length > 0 && surahResults.isLoading) ? (
                <BookmarkSkeleton 
                  count={bookmarks?.length || 3} 
                  groupsCount={bookmarks ? new Set(bookmarks.map(b => b.surah_id)).size : 2} 
                />
              ) : bookmarks && bookmarks.length > 0 ? (
                <div className="grid gap-6">
                  {(() => {
                    // Group bookmarks by surah_id
                    const bookmarksBySurah: Record<number, typeof bookmarks> = {};
                    
                    bookmarks.forEach(bookmark => {
                      if (!bookmarksBySurah[bookmark.surah_id]) {
                        bookmarksBySurah[bookmark.surah_id] = [];
                      }
                      bookmarksBySurah[bookmark.surah_id].push(bookmark);
                    });
                    
                    // Sort ayat within each surah group by ayat_number
                    Object.keys(bookmarksBySurah).forEach(surahId => {
                      bookmarksBySurah[Number(surahId)].sort((a, b) => a.ayat_number - b.ayat_number);
                    });
                    
                    // Render grouped bookmarks
                    return Object.entries(bookmarksBySurah).map(([surahId, surahBookmarks]) => {
                      const numericSurahId = Number(surahId);
                      const surahData = surahResults.data?.[numericSurahId];
                      
                      return (
                        <div key={`surah-${surahId}`} className="bg-white rounded-lg border border-amber-200 overflow-hidden">
                          {/* Surah Header */}
                          <div className="bg-amber-50 p-4 border-b border-amber-200">
                            <h3 className="font-bold text-amber-800">
                              {surahData ? `${surahData.namaLatin} (${surahData.nama})` : `Surah ${surahId}`}
                            </h3>
                            {surahData && (
                              <p className="text-sm text-amber-700">{surahData.arti}</p>
                            )}
                          </div>
                          
                          {/* Ayat List */}
                          <div className="divide-y divide-amber-100">
                            {surahBookmarks.map(bookmark => (
                              <div key={bookmark.bookmark_id} className="p-3 flex justify-between items-center hover:bg-amber-50">
                                <div className="flex items-center">
                                  <div className="bg-amber-100 text-amber-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 font-medium">
                                    {bookmark.ayat_number}
                                  </div>
                                  <div>
                                    <p className="text-gray-700">{bookmark.title || `Ayat ${bookmark.ayat_number}`}</p>
                                    {bookmark.notes && (
                                      <p className="text-gray-600 text-sm italic mt-1 line-clamp-1">"{bookmark.notes}"</p>
                                    )}
                                  </div>
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
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                <p className="text-gray-600">Belum ada bookmark yang ditambahkan.</p>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-amber-800">Favorit Saya</h2>
                <button 
                  onClick={() => fetchFavorites(true)}
                  className="text-amber-600 hover:text-amber-800 flex items-center"
                  disabled={favoritesLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span className="text-sm">Segarkan</span>
                </button>
              </div>
              
              {favoritesLoading || (favorites && favorites.length > 0 && surahResults.isLoading) ? (
                <FavoriteSkeleton 
                  count={favorites?.length || 3} 
                  groupsCount={favorites ? new Set(favorites.map(f => f.surah_id)).size : 2} 
                />
              ) : favorites && favorites.length > 0 ? (
                <div className="grid gap-6">
                  {(() => {
                    // Group favorites by surah_id and sort by ayat_number
                    const favoritesBySurah: Record<number, typeof favorites> = {};
                    
                    favorites.forEach(favorite => {
                      if (!favoritesBySurah[favorite.surah_id]) {
                        favoritesBySurah[favorite.surah_id] = [];
                      }
                      favoritesBySurah[favorite.surah_id].push(favorite);
                    });
                    
                    // Sort ayat within each surah group by ayat_number
                    Object.keys(favoritesBySurah).forEach(surahId => {
                      favoritesBySurah[Number(surahId)].sort((a, b) => a.ayat_number - b.ayat_number);
                    });
                    
                    // Render grouped favorites
                    return Object.entries(favoritesBySurah).map(([surahId, surahFavorites]) => {
                      const numericSurahId = Number(surahId);
                      const surahData = surahResults.data?.[numericSurahId];
                      
                      return (
                        <div key={`surah-${surahId}`} className="bg-white rounded-lg border border-amber-200 overflow-hidden">
                          {/* Surah Header */}
                          <div className="bg-amber-50 p-4 border-b border-amber-200">
                            <h3 className="font-bold text-amber-800">
                              {surahData ? `${surahData.namaLatin} (${surahData.nama})` : `Surah ${surahId}`}
                            </h3>
                            {surahData && (
                              <p className="text-sm text-amber-700">{surahData.arti}</p>
                            )}
                          </div>
                          
                          {/* Ayat List */}
                          <div className="divide-y divide-amber-100">
                            {surahFavorites.map(favorite => (
                              <div key={favorite.favorite_id} className="p-3 flex justify-between items-center hover:bg-amber-50">
                                <div className="flex items-center">
                                  <div className="bg-amber-100 text-amber-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 font-medium">
                                    {favorite.ayat_number}
                                  </div>
                                  <p className="text-gray-700">Ayat {favorite.ayat_number}</p>
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
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
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
              
              <LastReadingPosition isActive={activeTab === 'history'} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
