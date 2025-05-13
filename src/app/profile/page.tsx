'use client';

import { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import * as quranService from '@/services/quranService';
import { useToast } from '@/contexts/ToastContext';
import { AyatNote } from '@/services/noteService';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BookmarkSkeleton, FavoriteSkeleton, ReadingHistorySkeleton, NoteSkeleton } from '@/components/SkeletonComponents';
import LazyLoadImage from '@/components/LazyLoadImage';

// Lazy load heavy components
const LastReadingPosition = dynamic(() => import('@/components/LastReadingPosition'), {
  loading: () => <ReadingHistorySkeleton />,
  ssr: false
});

// Import hooks directly - they will only execute their logic when called
import { useBookmarks } from '@/hooks/useBookmarks';
import { useFavorites } from '@/hooks/useFavorites';
import { useNotes } from '@/hooks/useNotes';

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
  // Add state to track expanded surah groups in different tabs (default to collapsed/hidden)
  const [expandedFavoriteSurahs, setExpandedFavoriteSurahs] = useState<Record<string, boolean>>({});
  const [expandedBookmarkSurahs, setExpandedBookmarkSurahs] = useState<Record<string, boolean>>({});
  const [expandedNoteSurahs, setExpandedNoteSurahs] = useState<Record<string, boolean>>({}); 
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
  const getNeededSurahIds = () => {
    if (activeTab === 'bookmarks' && bookmarks) {
      return [...new Set(bookmarks.map((bookmark: any) => bookmark.surah_id))];
    }
    if (activeTab === 'favorites' && favorites) {
      return [...new Set(favorites.map((favorite: any) => favorite.surah_id))];
    }
    if (activeTab === 'notes' && userNotes) {
      return [...new Set(userNotes.map((note: AyatNote) => note.surah_id))];
    }
    return [];
  };
  
  // Use memo to avoid recalculating the needed surah IDs on every render
  const neededSurahIds = useMemo(() => getNeededSurahIds(), [
    activeTab, 
    bookmarks, 
    favorites, 
    userNotes
  ]);

  const surahResults = useQuery({
    queryKey: ['surahsForProfile', activeTab, neededSurahIds],
    queryFn: async () => {
      if (neededSurahIds.length === 0) return {};
      
      const results: Record<number, any> = {};
      
      // Use Promise.all for parallel fetching instead of sequential
      await Promise.all(
        neededSurahIds.map(async (surahId: number) => {
          try {
            const surah = await quranService.getSurahDetail(surahId);
            results[surahId] = surah;
          } catch (error) {
            console.error(`Error fetching surah ${surahId}:`, error);
          }
        })
      );
      
      return results;
    },
    enabled: isAuthenticated && neededSurahIds.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const navigateToSurah = (surahId: number, ayatNumber: number) => {
    router.push(`/surah/${surahId}?ayat=${ayatNumber}`);
  };

  // Functions to toggle expansion of a surah's list in different tabs
  const toggleSurahExpansion = (surahId: string) => {
    setExpandedFavoriteSurahs(prev => {
      const isCurrentlyExpanded = !!prev[surahId];
      // If currently expanded, collapse it, otherwise collapse all and expand only this one
      return isCurrentlyExpanded 
        ? { ...prev, [surahId]: false } 
        : { [surahId]: true }; // Reset all, only this one is expanded
    });
  };

  const toggleBookmarkExpansion = (surahId: string) => {
    setExpandedBookmarkSurahs(prev => {
      const isCurrentlyExpanded = !!prev[surahId];
      // If currently expanded, collapse it, otherwise collapse all and expand only this one
      return isCurrentlyExpanded 
        ? { ...prev, [surahId]: false } 
        : { [surahId]: true }; // Reset all, only this one is expanded
    });
  };

  const toggleNoteExpansion = (surahId: string) => {
    setExpandedNoteSurahs(prev => {
      const isCurrentlyExpanded = !!prev[surahId];
      // If currently expanded, collapse it, otherwise collapse all and expand only this one
      return isCurrentlyExpanded 
        ? { ...prev, [surahId]: false } 
        : { [surahId]: true }; // Reset all, only this one is expanded
    });
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 bg-[#f8f4e5] text-[#5D4037]">
      <Link href="/" className="text-amber-600 hover:text-amber-700 mb-8 inline-flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Kembali ke Beranda
      </Link>
      
      <div className="bg-white rounded-xl overflow-hidden border border-amber-200 shadow-lg mb-8">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-amber-900 flex items-center">
              <LazyLoadImage src="/icons/profile-icon.svg" alt="Profil" width={32} height={32} className="w-8 h-8 mr-3" />
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

          {isAuthenticated && (
            <>
              <div className="border-b border-amber-200 mb-6">
                <nav className="flex flex-wrap gap-1">
                  <button
                    onClick={() => {
                      setActiveTab('bookmarks');
                      if (!tabsInitialized.bookmarks) {
                        fetchBookmarks(true);
                        setTabsInitialized(prev => ({ ...prev, bookmarks: true }));
                      }
                    }}
                    className={`px-3 py-2 font-medium rounded-t-lg flex items-center ${
                      activeTab === 'bookmarks' 
                        ? 'text-amber-900 border-b-2 border-amber-600' 
                        : 'text-amber-600 hover:text-amber-800'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                    Bookmark
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('favorites');
                      if (!tabsInitialized.favorites) {
                        fetchFavorites(true);
                        setTabsInitialized(prev => ({ ...prev, favorites: true }));
                      }
                    }}
                    className={`px-3 py-2 font-medium rounded-t-lg flex items-center ${
                      activeTab === 'favorites' 
                        ? 'text-amber-900 border-b-2 border-amber-600' 
                        : 'text-amber-600 hover:text-amber-800'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                    Favorit
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('history');
                      setTabsInitialized(prev => ({ ...prev, history: true }));
                    }}
                    className={`px-3 py-2 font-medium rounded-t-lg flex items-center ${
                      activeTab === 'history' 
                        ? 'text-amber-900 border-b-2 border-amber-600' 
                        : 'text-amber-600 hover:text-amber-800'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    Riwayat Baca
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('notes');
                      if (!tabsInitialized.notes) {
                        fetchUserNotes(true);
                        setTabsInitialized(prev => ({ ...prev, notes: true }));
                      }
                    }}
                    className={`px-3 py-2 font-medium rounded-t-lg flex items-center ${
                      activeTab === 'notes' 
                        ? 'text-amber-900 border-b-2 border-amber-600' 
                        : 'text-amber-600 hover:text-amber-800'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Catatan
                  </button>
                </nav>
              </div>

              {activeTab === 'bookmarks' && (
                <Suspense fallback={<BookmarkSkeleton count={3} />}>
                  <div className="animate-fadeIn">
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
                      <BookmarkSkeleton count={3} />
                    ) : bookmarksError ? (
                      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                        <p>Gagal memuat bookmark. Silakan coba lagi.</p>
                      </div>
                    ) : bookmarks && bookmarks.length > 0 ? (
                      <div className="space-y-3 animate-fadeIn">
                        {Object.entries(
                          bookmarks.reduce((acc: Record<string, any[]>, bookmark: any) => {
                            const surahId = bookmark.surah_id;
                            if (!acc[surahId]) {
                              acc[surahId] = [];
                            }
                            acc[surahId].push(bookmark);
                            return acc;
                          }, {} as Record<string, any[]>)
                        )
                          .sort(([surahIdA], [surahIdB]) => parseInt(surahIdA) - parseInt(surahIdB))
                          .map(([surahId, surahBookmarks]) => {
                            const surah = surahResults.data?.[parseInt(surahId)];
                            
                            // Sort bookmarks by ayat number
                            const sortedBookmarks = [...(surahBookmarks as any[])].sort((a, b) => a.ayat_number - b.ayat_number);
                            
                            return (
                              <div key={`surah-${surahId}`} className="bg-amber-50 rounded-lg border border-amber-200 overflow-hidden">
                                <div className="bg-amber-100 p-3 border-b border-amber-200">
                                  <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                      <h3 className="font-bold text-amber-900">
                                        {surah ? `${surah.namaLatin} (${surahId})` : `Surah ${surahId}`}
                                        <span className="ml-2 bg-amber-200 text-amber-800 text-xs py-0.5 px-1.5 rounded-full">
                                          {surahBookmarks.length} ayat
                                        </span>
                                      </h3>
                                      {surah && (
                                        <p className="text-sm text-gray-600">{surah.arti}</p>
                                      )}
                                    </div>
                                    <button 
                                      onClick={() => toggleBookmarkExpansion(surahId)}
                                      className="p-2 bg-amber-100 rounded-full hover:bg-amber-200 text-amber-700 transition-colors"
                                      aria-label={expandedBookmarkSurahs[surahId] === true ? "Sembunyikan ayat" : "Tampilkan ayat"}
                                    >
                                      {expandedBookmarkSurahs[surahId] === true ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                        </svg>
                                      ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                      )}
                                    </button>
                                  </div>
                                </div>
                                
                                {expandedBookmarkSurahs[surahId] === true && (
                                  <div className="divide-y divide-amber-100">
                                    {sortedBookmarks.map((bookmark) => (
                                      <div 
                                        key={`${bookmark.surah_id}-${bookmark.ayat_number}`}
                                        className="p-3 hover:bg-amber-100/50 transition-colors"
                                      >
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h4 className="font-medium text-amber-900">
                                            Ayat {bookmark.ayat_number}
                                          </h4>
                                          <p className="text-amber-800 text-sm">{bookmark.created_at ? new Date(bookmark.created_at).toLocaleString('id-ID') : 'Tanggal tidak tersedia'}</p>
                                        </div>
                                        
                                        <div className="flex space-x-2">
                                          <button 
                                            onClick={() => navigateToSurah(bookmark.surah_id, bookmark.ayat_number)} 
                                            className="p-2 bg-amber-100 rounded hover:bg-amber-200 text-amber-700"
                                            aria-label="Buka ayat"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                            </svg>
                                          </button>
                                          
                                          <button 
                                            onClick={async () => {
                                              try {
                                                await removeBookmark(bookmark.surah_id, bookmark.ayat_number);
                                                showToast('Bookmark berhasil dihapus', 'success');
                                              } catch (error) {
                                                console.error('Error removing bookmark:', error);
                                                showToast('Gagal menghapus bookmark', 'error');
                                              }
                                            }} 
                                            className="p-2 bg-red-100 rounded hover:bg-red-200 text-red-700"
                                            aria-label="Hapus bookmark"
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
                                )}
                              </div>
                            );
                          })
                        }
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-amber-300 mb-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                        </svg>
                        <p className="text-gray-600">Anda belum memiliki bookmark.</p>
                        <p className="text-gray-500 mt-1 text-sm">Tambahkan bookmark dengan klik ikon bookmark pada ayat.</p>
                      </div>
                    )}
                  </div>
                </Suspense>
              )}

              {activeTab === 'favorites' && (
                <Suspense fallback={<FavoriteSkeleton count={3} />}>
                  <div className="animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-rose-800">Ayat Favorit Saya</h2>
                      <button 
                        onClick={() => fetchFavorites(true)}
                        className="text-rose-600 hover:text-rose-800 flex items-center"
                        disabled={favoritesLoading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        <span className="text-sm">Segarkan</span>
                      </button>
                    </div>
                    
                    {favoritesLoading || (favorites && favorites.length > 0 && surahResults.isLoading) ? (
                      <FavoriteSkeleton count={3} />
                    ) : favoritesError ? (
                      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                        <p>Gagal memuat ayat favorit. Silakan coba lagi.</p>
                      </div>
                    ) : favorites && favorites.length > 0 ? (
                      <div className="space-y-3 animate-fadeIn">
                        {Object.entries(
                          favorites.reduce((acc: Record<string, any[]>, favorite: any) => {
                            const surahId = favorite.surah_id;
                            if (!acc[surahId]) {
                              acc[surahId] = [];
                            }
                            acc[surahId].push(favorite);
                            return acc;
                          }, {} as Record<string, any[]>)
                        )
                          .sort(([surahIdA], [surahIdB]) => parseInt(surahIdA) - parseInt(surahIdB))
                          .map(([surahId, surahFavorites]) => {
                            const surah = surahResults.data?.[parseInt(surahId)];
                            
                            // Sort favorites by ayat number
                            const sortedFavorites = [...(surahFavorites as any[])].sort((a, b) => a.ayat_number - b.ayat_number);
                            
                            // Determine if this surah is expanded, default to false if not set
                            const isExpanded = expandedFavoriteSurahs[surahId] === true; // Default to collapsed
                            
                            return (
                              <div key={`surah-${surahId}`} className="bg-rose-50 rounded-lg border border-rose-200 overflow-hidden">
                                <div className="bg-rose-100 p-3 border-b border-rose-200">
                                  <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                      <h3 className="font-bold text-rose-900">
                                        {surah ? `${surah.namaLatin} (${surahId})` : `Surah ${surahId}`}
                                        <span className="ml-2 bg-rose-200 text-rose-800 text-xs py-0.5 px-1.5 rounded-full">
                                          {surahFavorites.length} ayat
                                        </span>
                                      </h3>
                                      {surah && (
                                        <p className="text-sm text-gray-600">{surah.arti}</p>
                                      )}
                                    </div>
                                    <button 
                                      onClick={() => toggleSurahExpansion(surahId)}
                                      className="p-2 bg-rose-100 rounded-full hover:bg-rose-200 text-rose-700 transition-colors"
                                      aria-label={isExpanded ? "Sembunyikan ayat" : "Tampilkan ayat"}
                                    >
                                      {isExpanded ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                        </svg>
                                      ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                      )}
                                    </button>
                                  </div>
                                </div>
                                
                                {isExpanded && (
                                  <div className="divide-y divide-rose-100">
                                    {sortedFavorites.map((favorite) => (
                                      <div 
                                        key={`${favorite.surah_id}-${favorite.ayat_number}`}
                                        className="p-3 hover:bg-rose-100/50 transition-colors"
                                      >
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <h4 className="font-medium text-rose-900">
                                              Ayat {favorite.ayat_number}
                                            </h4>
                                            <p className="text-rose-800 text-sm">{favorite.created_at ? new Date(favorite.created_at).toLocaleString('id-ID') : 'Tanggal tidak tersedia'}</p>
                                          </div>
                                          
                                          <div className="flex space-x-2">
                                            <button 
                                              onClick={() => navigateToSurah(favorite.surah_id, favorite.ayat_number)} 
                                              className="p-2 bg-rose-100 rounded hover:bg-rose-200 text-rose-700"
                                              aria-label="Buka ayat"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                              </svg>
                                            </button>
                                            
                                            <button 
                                              onClick={async () => {
                                                try {
                                                  await removeFavorite(favorite.surah_id, favorite.ayat_number);
                                                  showToast('Ayat favorit berhasil dihapus', 'success');
                                                } catch (error) {
                                                  console.error('Error removing favorite:', error);
                                                  showToast('Gagal menghapus ayat favorit', 'error');
                                                }
                                              }} 
                                              className="p-2 bg-red-100 rounded hover:bg-red-200 text-red-700"
                                              aria-label="Hapus favorit"
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
                                )}
                              </div>
                            );
                          })
                        }
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-rose-300 mb-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        <p className="text-gray-600">Anda belum memiliki ayat favorit.</p>
                        <p className="text-gray-500 mt-1 text-sm">Tambahkan ayat favorit dengan klik ikon hati pada ayat.</p>
                      </div>
                    )}
                  </div>
                </Suspense>
              )}

              {activeTab === 'history' && (
                <Suspense fallback={<ReadingHistorySkeleton />}>
                  <div className="animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-amber-800">Riwayat Membaca</h2>
                    </div>
                    
                    <LastReadingPosition isActive={true} />
                  </div>
                </Suspense>
              )}

              {activeTab === 'notes' && (
                <Suspense fallback={<NoteSkeleton count={3} />}>
                  <div className="animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-green-800">Catatan Saya</h2>
                      <button 
                        onClick={() => fetchUserNotes(true)}
                        className="text-green-600 hover:text-green-800 flex items-center"
                        disabled={notesLoading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        <span className="text-sm">Segarkan</span>
                      </button>
                    </div>
                  
                    {notesLoading || (userNotes && userNotes.length > 0 && surahResults.isLoading) ? (
                      <NoteSkeleton count={3} />
                    ) : notesError ? (
                      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                        <p>Gagal memuat catatan. Silakan coba lagi.</p>
                      </div>
                    ) : userNotes && userNotes.length > 0 ? (
                      <div className="space-y-6 animate-fadeIn">
                        {/* Group notes by surah */}
                        {Object.entries(
                          userNotes.reduce((acc, note) => {
                            const surahId = note.surah_id;
                            if (!acc[surahId]) {
                              acc[surahId] = [];
                            }
                            acc[surahId].push(note);
                            return acc;
                          }, {} as Record<string, typeof userNotes>)
                        )
                          .sort(([surahIdA], [surahIdB]) => parseInt(surahIdA) - parseInt(surahIdB))
                          .map(([surahId, surahNotes]) => {
                            const surah = surahResults.data?.[parseInt(surahId)];
                            
                            // Sort notes by ayat number
                            const sortedNotes = [...surahNotes].sort((a, b) => a.ayat_number - b.ayat_number);
                            
                            return (
                              <div key={`surah-${surahId}`} className="bg-green-50 rounded-lg border border-green-200 overflow-hidden">
                                <div className="bg-green-100 p-3 border-b border-green-200">
                                  <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                      <h3 className="font-bold text-green-900">
                                        {surah ? `${surah.namaLatin} (${surahId})` : `Surah ${surahId}`}
                                        <span className="ml-2 bg-green-200 text-green-800 text-xs py-0.5 px-1.5 rounded-full">
                                          {surahNotes.length} catatan
                                        </span>
                                      </h3>
                                      {surah && (
                                        <p className="text-sm text-gray-600">{surah.arti}</p>
                                      )}
                                    </div>
                                    <button 
                                      onClick={() => toggleNoteExpansion(surahId)}
                                      className="p-2 bg-green-100 rounded-full hover:bg-green-200 text-green-700 transition-colors"
                                      aria-label={expandedNoteSurahs[surahId] === true ? "Sembunyikan catatan" : "Tampilkan catatan"}
                                    >
                                      {expandedNoteSurahs[surahId] === true ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                        </svg>
                                      ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                      )}
                                    </button>
                                  </div>
                                </div>
                                
                                {expandedNoteSurahs[surahId] === true && (
                                  <div className="divide-y divide-green-100">
                                    {sortedNotes.map((note) => (
                                      <div 
                                        key={`note-${note.note_id}`}
                                        className="p-3 hover:bg-green-100/50 transition-colors"
                                      >
                                        <div className="space-y-2">
                                          <div className="flex justify-between items-start">
                                            <h4 className="font-medium text-green-900">
                                              Ayat {note.ayat_number}
                                            </h4>
                                            <div className="flex space-x-2">
                                              <button 
                                                onClick={() => navigateToSurah(note.surah_id, note.ayat_number)} 
                                                className="p-2 bg-green-100 rounded hover:bg-green-200 text-green-700"
                                                aria-label="Buka ayat"
                                              >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                </svg>
                                              </button>
                                              
                                              <button 
                                                onClick={async () => {
                                                  try {
                                                    await deleteNote(note.note_id);
                                                    fetchUserNotes(true); // Refresh notes
                                                    showToast('Catatan berhasil dihapus', 'success');
                                                  } catch (error) {
                                                    console.error('Error deleting note:', error);
                                                    showToast('Gagal menghapus catatan', 'error');
                                                  }
                                                }} 
                                                className="p-2 bg-red-100 rounded hover:bg-red-200 text-red-700"
                                                aria-label="Hapus catatan"
                                              >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                              </button>
                                            </div>
                                          </div>
                                          
                                          <div className="bg-white p-3 rounded border border-green-100">
                                            <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                                          </div>
                                          
                                          <p className="text-green-800 text-sm">
                                            {note.updated_at ? new Date(note.updated_at).toLocaleString('id-ID') : 'Tanggal tidak tersedia'}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        }
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-green-300 mb-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        <p className="text-gray-600">Anda belum memiliki catatan.</p>
                        <p className="text-gray-500 mt-1 text-sm">Tambahkan catatan dengan klik ikon catatan pada ayat.</p>
                      </div>
                    )}
                  </div>
                </Suspense>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
