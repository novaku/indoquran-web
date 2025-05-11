'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useFavorites } from '@/hooks/useFavorites';
import { useNotes } from '@/hooks/useNotes';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import LastReadingPosition from '@/components/LastReadingPosition';
import BookmarkSkeleton from '@/components/BookmarkSkeleton';
import FavoriteSkeleton from '@/components/FavoriteSkeleton';
import ReadingHistorySkeleton from '@/components/ReadingHistorySkeleton';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import * as quranService from '@/services/quranService';
import { useToast } from '@/contexts/ToastContext';
import { AyatNote } from '@/services/noteService';

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, createTempUser, logout } = useAuthContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('bookmarks');
  const [tabsInitialized, setTabsInitialized] = useState<Record<string, boolean>>({
    bookmarks: false,
    favorites: false,
    history: false,
    notes: false
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
  
  // Add state for notes
  const [userNotes, setUserNotes] = useState<AyatNote[]>([]);
  const [notesLoading, setNotesLoading] = useState<boolean>(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  
  const { 
    isLoading: hookNotesLoading,
    error: hookNotesError,
    getUserNotes,
    deleteNote
  } = useNotes({ userId: user?.user_id || '' });

  // Function to fetch user's notes
  const fetchUserNotes = async (forceRefresh = false) => {
    if (!user?.user_id) return;
    
    setNotesLoading(true);
    try {
      const notes = await getUserNotes(forceRefresh);
      setUserNotes(notes);
      setNotesError(null);
    } catch (error) {
      setNotesError('Gagal memuat catatan');
      console.error('Error fetching notes:', error);
    } finally {
      setNotesLoading(false);
    }
  };

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
      } else if (activeTab === 'notes' && !tabsInitialized.notes) {
        fetchUserNotes();
        setTabsInitialized(prev => ({ ...prev, notes: true }));
      }
      // Reading history is handled internally by LastReadingPosition component
    }
  }, [isAuthenticated, user, activeTab, fetchBookmarks, fetchFavorites, fetchUserNotes, tabsInitialized]);

  // Get unique surah IDs only for the active tab data
  const getActiveTabSurahIds = () => {
    if (activeTab === 'bookmarks' && bookmarks) {
      return new Set(bookmarks.map(b => b.surah_id));
    } else if (activeTab === 'favorites' && favorites) {
      return new Set(favorites.map(f => f.surah_id));
    } else if (activeTab === 'notes' && userNotes) {
      return new Set(userNotes.map(n => n.surah_id));
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-amber-800 flex items-center">
            <img src="/icons/profile-icon.svg" alt="Profil" className="w-7 h-7 mr-2" />
            Profil Pengguna
          </h1>
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        
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
              className={`py-2 px-4 flex items-center ${activeTab === 'bookmarks' ? 'text-amber-800 border-b-2 border-amber-600 font-medium' : 'text-gray-500 hover:text-amber-600'}`}
              onClick={() => {
                setActiveTab('bookmarks');
                // Only force refresh if this is the first time viewing the tab or if explicitly refreshing
                if (!tabsInitialized.bookmarks) {
                  fetchBookmarks(true);
                  setTabsInitialized(prev => ({ ...prev, bookmarks: true }));
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
              Bookmark
            </button>
            <button
              className={`py-2 px-4 flex items-center ${activeTab === 'favorites' ? 'text-amber-800 border-b-2 border-amber-600 font-medium' : 'text-gray-500 hover:text-amber-600'}`}
              onClick={() => {
                setActiveTab('favorites');
                // Only force refresh if this is the first time viewing the tab or if explicitly refreshing
                if (!tabsInitialized.favorites) {
                  fetchFavorites(true);
                  setTabsInitialized(prev => ({ ...prev, favorites: true }));
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              Favorit
            </button>
            <button
              className={`py-2 px-4 flex items-center ${activeTab === 'history' ? 'text-amber-800 border-b-2 border-amber-600 font-medium' : 'text-gray-500 hover:text-amber-600'}`}
              onClick={() => {
                setActiveTab('history');
                // Mark as initialized - actual data fetching is handled by LastReadingPosition
                setTabsInitialized(prev => ({ ...prev, history: true }));
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Riwayat Baca
            </button>
            <button
              className={`py-2 px-4 flex items-center ${activeTab === 'notes' ? 'text-amber-800 border-b-2 border-amber-600 font-medium' : 'text-gray-500 hover:text-amber-600'}`}
              onClick={() => {
                setActiveTab('notes');
                // Only force refresh if this is the first time viewing the tab or if explicitly refreshing
                if (!tabsInitialized.notes) {
                  fetchUserNotes(true);
                  setTabsInitialized(prev => ({ ...prev, notes: true }));
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Catatan
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

          {activeTab === 'notes' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-amber-800">Catatan Saya</h2>
                <button 
                  onClick={() => fetchUserNotes(true)}
                  className="text-amber-600 hover:text-amber-800 flex items-center"
                  disabled={notesLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span className="text-sm">Segarkan</span>
                </button>
              </div>
              
              {notesLoading ? (
                <div className="space-y-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-lg border border-amber-200 overflow-hidden animate-pulse">
                      {/* Skeleton for Surah Header */}
                      <div className="bg-amber-50 p-4 border-b border-amber-200">
                        <div className="h-5 bg-amber-100 rounded w-40 mb-2"></div>
                        <div className="h-4 bg-amber-50 rounded w-24"></div>
                      </div>
                      
                      {/* Skeleton for Ayat Items */}
                      <div className="divide-y divide-amber-100">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="p-3 flex justify-between">
                            <div className="flex items-start">
                              <div className="bg-amber-100 rounded-full w-8 h-8 mr-3"></div>
                              <div>
                                <div className="h-4 bg-gray-100 rounded w-48 mb-2"></div>
                                <div className="h-3 bg-gray-100 rounded w-32"></div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <div className="h-5 w-5 bg-amber-100 rounded"></div>
                              <div className="h-5 w-5 bg-red-100 rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : userNotes && userNotes.length > 0 ? (
                <div className="grid gap-6">
                  {(() => {
                    // Group notes by surah_id
                    const notesBySurah: Record<number, typeof userNotes> = {};
                    
                    userNotes.forEach(note => {
                      if (!notesBySurah[note.surah_id]) {
                        notesBySurah[note.surah_id] = [];
                      }
                      notesBySurah[note.surah_id].push(note);
                    });
                    
                    // Sort ayat within each surah group by ayat_number
                    Object.keys(notesBySurah).forEach(surahId => {
                      notesBySurah[Number(surahId)].sort((a, b) => a.ayat_number - b.ayat_number);
                    });
                    
                    // Render grouped notes
                    return Object.entries(notesBySurah).map(([surahId, surahNotes]) => {
                      const numericSurahId = Number(surahId);
                      const surahData = surahResults.data?.[numericSurahId];
                      const firstNote = surahNotes[0];
                      
                      return (
                        <div key={`surah-${surahId}`} className="bg-white rounded-lg border border-amber-200 overflow-hidden">
                          {/* Surah Header */}
                          <div className="bg-amber-50 p-4 border-b border-amber-200">
                            <h3 className="font-bold text-amber-800">
                              {surahData ? `${surahData.namaLatin} (${surahData.nama})` : firstNote.surah_name ? `${firstNote.surah_name} ${firstNote.surah_name_arabic ? `(${firstNote.surah_name_arabic})` : ''}` : `Surah ${surahId}`}
                            </h3>
                            {surahData && (
                              <p className="text-sm text-amber-700">{surahData.arti}</p>
                            )}
                          </div>
                          
                          {/* Ayat Notes List */}
                          <div className="divide-y divide-amber-100">
                            {surahNotes.map(note => (
                              <div key={note.note_id} className="p-3 hover:bg-amber-50">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-start">
                                    <div className="bg-amber-100 text-amber-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 font-medium shrink-0 mt-1">
                                      {note.ayat_number}
                                    </div>
                                    <div>
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-medium">Ayat {note.ayat_number}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                          note.is_public 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-amber-100 text-amber-800'
                                        }`}>
                                          {note.is_public ? 'Publik' : 'Privat'}
                                        </span>
                                      </div>
                                      <p className="text-gray-700 text-sm whitespace-pre-wrap mb-2">{note.content}</p>
                                      <div className="text-xs text-gray-500 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                        </svg>
                                        {note.likes_count} suka • {new Date(note.created_at).toLocaleDateString('id-ID', { 
                                          day: 'numeric', 
                                          month: 'short',
                                          year: 'numeric'
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2 shrink-0">
                                    <button
                                      onClick={() => navigateToSurah(note.surah_id, note.ayat_number)}
                                      className="text-amber-600 hover:text-amber-800"
                                      title="Lihat Ayat"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
                                          deleteNote(note.note_id).then(() => {
                                            fetchUserNotes();
                                            showToast('Catatan berhasil dihapus', 'success');
                                          });
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-700"
                                      title="Hapus Catatan"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                      </svg>
                                    </button>
                                  </div>
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
                <p className="text-gray-600">Belum ada catatan yang dibuat. Tambahkan catatan pada ayat Al-Quran untuk melihatnya di sini.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
