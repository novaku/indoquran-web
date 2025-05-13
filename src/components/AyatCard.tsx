'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Ayat } from '../types/quran';
import quranClient from '../services/quranClient';
import { LoadingSpinner } from './LoadingSpinner';
import { useAuthContext } from '@/contexts/AuthContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useFavorites } from '@/hooks/useFavorites';
import { useReadingHistory } from '@/hooks/useReadingHistory';
import { useToast } from '@/contexts/ToastContext';
import { useNotes } from '@/hooks/useNotes';
import { NoteCard, CreateNoteForm } from './NoteComponents';
import { AyatNote } from '@/services/noteService';

interface AudioUrls {
  "01": string;
  "02": string;
  "03": string;
  "04": string;
  "05": string;
}

interface AyatCardProps {
  ayat: Ayat;
  surahId: number;
}

const RECITERS = {
  "01": "Abdullah Al-Juhany",
  "02": "Abdul Muhsin Al-Qasim",
  "03": "Abdurrahman As-Sudais",
  "04": "Ibrahim Al-Dossari",
  "05": "Misyari Rasyid Al-Afasi"
} as const;

// Tooltip component
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
    >
      {children}
      {show && (
        <span className="absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-book-primary text-white text-xs whitespace-nowrap shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
};

export const AyatCard = ({ ayat, surahId }: AyatCardProps) => {
  const [showTafsir, setShowTafsir] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState<keyof typeof RECITERS>("01");
  const [arabicFontSize, setArabicFontSize] = useState(2.00); // rem, increased from 2.25rem to 2.75rem for better readability
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [bookmarkNotes, setBookmarkNotes] = useState('');
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  // Note-related states
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [userNote, setUserNote] = useState<AyatNote | null>(null);
  const [publicNotes, setPublicNotes] = useState<AyatNote[]>([]);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteLikes, setNoteLikes] = useState<Record<number, boolean>>({});
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [notesCount, setNotesCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  
  // Get the user context
  const { user, isAuthenticated } = useAuthContext();
  const { showToast } = useToast();
  
  // Initialize bookmark and favorite hooks
  const { checkBookmark, addBookmark, removeBookmark } = useBookmarks({ 
    userId: user?.user_id || '' 
  });
  
  const { checkFavorite, addFavorite, removeFavorite } = useFavorites({ 
    userId: user?.user_id || '' 
  });

  // Initialize notes hook
  const { 
    getUserNote, 
    getPublicNotes, 
    addNote, 
    updateNote, 
    deleteNote,
    likeNote,
    unlikeNote,
    getNotesCount
  } = useNotes({ 
    userId: user?.user_id 
  });
  
  // Initialize reading history hook
  const { saveReadingPosition } = useReadingHistory({
    userId: user?.user_id || ''
  });
  
  // Reference to the ayat card element for intersection observer
  const ayatCardRef = useRef<HTMLDivElement>(null);

  // Fetch surah data to get the name
  const { data: surahData } = useQuery({
    queryKey: ['surah', surahId],
    queryFn: () => quranClient.getSurahDetail(surahId),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch tafsir data when needed
  const { data: tafsirData, isLoading: isTafsirLoading } = useQuery({
    queryKey: ['tafsir', surahId],
    queryFn: () => quranClient.getTafsir(surahId),
    enabled: showTafsir, // Only fetch when user clicks to show tafsir
  });

  // Prepare the sharing content
  const shareTitle = `Surah ${surahData?.namaLatin || ''} (${surahId}): Ayat ${ayat.nomorAyat}`;
  const shareText = `${ayat.teksArab}\n\n${ayat.teksLatin}\n\n${ayat.teksIndonesia}\n\n- Al-Quran Digital`;
  const shareUrl = typeof window !== 'undefined' ? 
    `${window.location.origin}/surah/${surahId}?ayat=${ayat.nomorAyat}` : 
    `/surah/${surahId}?ayat=${ayat.nomorAyat}`;

  // Function to share to WhatsApp
  const shareToSocial = (platform: string) => {
    if (platform === 'whatsapp') {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle}\n\n${shareText}\n\n${shareUrl}`)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleZoomIn = () => setArabicFontSize((size) => Math.min(size + 0.25, 4));
  const handleZoomOut = () => setArabicFontSize((size) => Math.max(size - 0.25, 1.25));

  // Check if the ayat is bookmarked or favorited when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const checkStatus = async () => {
        const bookmarked = await checkBookmark(surahId, ayat.nomorAyat);
        const favorited = await checkFavorite(surahId, ayat.nomorAyat);
        setIsBookmarked(bookmarked);
        setIsFavorite(favorited);
      };
      
      checkStatus();
    }
  }, [isAuthenticated, user, surahId, ayat.nomorAyat, checkBookmark, checkFavorite]);
  
  // Helper function to refresh the notes count
  const refreshNotesCount = async () => {
    setIsLoadingCount(true);
    try {
      const count = await getNotesCount(surahId, ayat.nomorAyat);
      setNotesCount(count);
    } catch (error) {
      console.error('Error refreshing notes count:', error);
    } finally {
      setIsLoadingCount(false);
    }
  };

  // Fetch the notes count when component mounts
  useEffect(() => {
    refreshNotesCount();
    
    // Set up periodic refresh (every 30 seconds)
    const intervalId = setInterval(refreshNotesCount, 30000);
    
    return () => clearInterval(intervalId);
  }, [surahId, ayat.nomorAyat]);
  
  // Set up intersection observer to track reading position
  useEffect(() => {
    if (!ayatCardRef.current || !isAuthenticated || !user) return;
    
    console.log("Setting up observer for ayat", ayat.nomorAyat);
    let savePositionTimeout: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log("Ayat visible:", ayat.nomorAyat);
            savePositionTimeout = setTimeout(() => {
              console.log("Saving position for ayat:", ayat.nomorAyat);
              saveReadingPosition(surahId, ayat.nomorAyat);
            }, 3000);
          } else {
            if (savePositionTimeout) {
              console.log("Clearing timeout for ayat:", ayat.nomorAyat);
              clearTimeout(savePositionTimeout);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(ayatCardRef.current);
    
    return () => {
      if (savePositionTimeout) {
        clearTimeout(savePositionTimeout);
      }
      if (ayatCardRef.current) {
        observer.unobserve(ayatCardRef.current);
      }
    };
  }, [surahId, ayat.nomorAyat, isAuthenticated, user, saveReadingPosition]);
  
  // Load notes when notes modal is opened
  const loadNotes = async () => {
    setIsLoadingNotes(true);
    try {
      // Fetch user's note if authenticated
      if (isAuthenticated && user?.user_id) {
        const userNoteData = await getUserNote(surahId, ayat.nomorAyat);
        setUserNote(userNoteData);
      }
      
      // Fetch public notes
      const notes = await getPublicNotes(surahId, ayat.nomorAyat);
      setPublicNotes(notes);
      
      // Update notes count
      setNotesCount(notes.length);
      
      // Initialize likes status for each note
      const likes: Record<number, boolean> = {};
      notes.forEach(note => {
        likes[note.note_id] = false; // Default to not liked
      });
      setNoteLikes(likes);
    } catch (error) {
      console.error('Error loading notes:', error);
      showToast('Gagal memuat catatan', 'error');
    } finally {
      setIsLoadingNotes(false);
    }
  };
  
  // This function is a duplicate and can be removed
  
  // Handle opening the notes modal
  const handleOpenNotes = () => {
    setShowNotesModal(true);
    loadNotes();
  };
  
  // Handle creating a new note
  const handleCreateNote = async (content: string, isPublic: boolean) => {
    try {
      const newNote = await addNote(surahId, ayat.nomorAyat, content, isPublic);
      if (newNote) {
        setUserNote(newNote);
        if (isPublic) {
          // If the note is public, add it to the public notes list
          setPublicNotes(prevNotes => [newNote, ...prevNotes.filter(n => n.user_id !== user?.user_id)]);
          
          // Update the notes count
          const updatedCount = await getNotesCount(surahId, ayat.nomorAyat);
          setNotesCount(updatedCount);
        }
        showToast('Catatan berhasil ditambahkan', 'success');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      showToast('Gagal menambahkan catatan', 'error');
    }
  };
  
  // Handle updating an existing note
  const handleUpdateNote = async (content: string, isPublic: boolean) => {
    if (!userNote) return;
    
    try {
      const wasPublic = userNote.is_public;
      const success = await updateNote(userNote.note_id, surahId, ayat.nomorAyat, { content, isPublic });
      if (success) {
        // Update the user's note
        setUserNote(prev => prev ? { ...prev, content, is_public: isPublic } : null);
        
        // Update in the public notes list if needed
        if (isPublic) {
          setPublicNotes(prevNotes => {
            const noteExists = prevNotes.some(note => note.user_id === user?.user_id);
            if (noteExists) {
              return prevNotes.map(note => 
                note.user_id === user?.user_id ? { ...note, content, is_public: true } : note
              );
            } else {
              return userNote ? [{ ...userNote, content, is_public: true }, ...prevNotes] : prevNotes;
            }
          });
        } else {
          // Remove from public notes if it's made private
          setPublicNotes(prevNotes => prevNotes.filter(note => note.user_id !== user?.user_id));
        }
        
        // If the public status changed, update the notes count
        if (wasPublic !== isPublic) {
          const updatedCount = await getNotesCount(surahId, ayat.nomorAyat);
          setNotesCount(updatedCount);
        }
        
        setIsEditingNote(false);
        showToast('Catatan berhasil diperbarui', 'success');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      showToast('Gagal memperbarui catatan', 'error');
    }
  };
  
  // Handle deleting a note
  const handleDeleteNote = async () => {
    if (!userNote) return;
    
    if (!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
      return;
    }
    
    try {
      const wasPublic = userNote.is_public;
      const success = await deleteNote(userNote.note_id);
      if (success) {
        // Remove the note from both user and public notes
        setUserNote(null);
        setPublicNotes(prevNotes => prevNotes.filter(note => note.user_id !== user?.user_id));
        
        // If the note was public, update the notes count
        if (wasPublic) {
          const updatedCount = await getNotesCount(surahId, ayat.nomorAyat);
          setNotesCount(updatedCount);
        }
        
        showToast('Catatan berhasil dihapus', 'success');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      showToast('Gagal menghapus catatan', 'error');
    }
  };
  
  // Handle liking a note
  const handleLikeNote = async (noteId: number) => {
    try {
      const success = await likeNote(noteId);
      if (success) {
        // Update the liked status
        setNoteLikes(prev => ({ ...prev, [noteId]: true }));
        
        // Increment likes count
        setPublicNotes(prevNotes => prevNotes.map(note => 
          note.note_id === noteId ? { ...note, likes_count: note.likes_count + 1 } : note
        ));
      }
    } catch (error) {
      console.error('Error liking note:', error);
      showToast('Gagal menyukai catatan', 'error');
    }
  };
  
  // Handle unliking a note
  const handleUnlikeNote = async (noteId: number) => {
    try {
      const success = await unlikeNote(noteId);
      if (success) {
        // Update the liked status
        setNoteLikes(prev => ({ ...prev, [noteId]: false }));
        
        // Decrement likes count
        setPublicNotes(prevNotes => prevNotes.map(note => 
          note.note_id === noteId ? { ...note, likes_count: Math.max(0, note.likes_count - 1) } : note
        ));
      }
    } catch (error) {
      console.error('Error unliking note:', error);
      showToast('Gagal membatalkan suka catatan', 'error');
    }
  };

  // Find the tafsir that matches this ayat
  const ayatTafsir = tafsirData?.find(t => t.ayat === ayat.nomorAyat);
  
  // Handle bookmark toggle
  const toggleBookmark = async () => {
    if (!isAuthenticated || !user) {
      // Redirect to login page with return URL
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    if (isBookmarked) {
      setBookmarkLoading(true);
      try {
        const success = await removeBookmark(surahId, ayat.nomorAyat);
        if (success) {
          setIsBookmarked(false);
          showToast('Bookmark berhasil dihapus', 'success');
        } else {
          showToast('Gagal menghapus bookmark', 'error');
        }
      } catch (error) {
        console.error('Error removing bookmark:', error);
        showToast('Terjadi kesalahan saat menghapus bookmark', 'error');
      } finally {
        setBookmarkLoading(false);
      }
    } else {
      setShowBookmarkModal(true);
    }
  };
  
  // Handle favorite toggle
  const toggleFavorite = async () => {
    if (!isAuthenticated || !user) {
      // Redirect to login page with return URL
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        const success = await removeFavorite(surahId, ayat.nomorAyat);
        if (success) {
          setIsFavorite(false);
          showToast('Ayat dihapus dari favorit', 'info');
        } else {
          showToast('Gagal menghapus dari favorit', 'error');
        }
      } else {
        const result = await addFavorite(surahId, ayat.nomorAyat);
        if (result) {
          setIsFavorite(true);
          showToast('Ayat ditambahkan ke favorit', 'success');
        } else {
          showToast('Gagal menambahkan ke favorit', 'error');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Terjadi kesalahan saat mengubah status favorit', 'error');
    } finally {
      setFavoriteLoading(false);
    }
  };
  
  // Handle bookmark save
  const saveBookmark = async () => {
    setBookmarkLoading(true);
    try {
      const result = await addBookmark(
        surahId, 
        ayat.nomorAyat, 
        bookmarkTitle || `Surah ${surahData?.namaLatin} Ayat ${ayat.nomorAyat}`, 
        bookmarkNotes
      );
      
      if (result) {
        setIsBookmarked(true);
        setShowBookmarkModal(false);
        // Reset form fields
        setBookmarkTitle('');
        setBookmarkNotes('');
        showToast('Bookmark berhasil ditambahkan', 'success');
      } else {
        showToast('Gagal menambahkan bookmark', 'error');
      }
    } catch (error) {
      console.error('Error saving bookmark:', error);
      showToast('Terjadi kesalahan saat menyimpan bookmark', 'error');
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <div 
      ref={ayatCardRef} 
      id={`ayat-${ayat.nomorAyat}`}
      className={`mb-6 pb-6 border-b border-[#d3c6a6] transition-all duration-500 
        ${isBookmarked ? 'bg-[#e8e0ce]' : ''} 
        hover:bg-[#f3efe0] rounded-lg p-4`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#8D6E63] text-white font-medium shadow-sm">
            <span className="text-sm">{ayat.nomorAyat}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigator.clipboard.writeText(`${ayat.teksArab}\n\n${ayat.teksLatin}\n\n${ayat.teksIndonesia}`)}
            className="p-2 text-[#795548] hover:bg-[#e8e0ce] rounded-md transition-colors"
            title="Salin Ayat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5h9.75M8.25 9h9.75M8.25 13.5h9.75M8.25 18h9.75M4.5 4.5h.008v.008H4.5V4.5zm0 4.5h.008v.008H4.5V9zm0 4.5h.008v.008H4.5v-.008zm0 4.5h.008v.008H4.5V18z" />
            </svg>
          </button>
          
          <button
            onClick={() => navigator.share ? 
              navigator.share({
                title: shareTitle,
                text: shareText,
                url: shareUrl
              }).catch(err => console.error('Error sharing:', err)) :
              shareToSocial('whatsapp')
            }
            className="p-2 text-[#795548] hover:bg-[#e8e0ce] rounded-md transition-colors"
            title="Bagikan"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
          </button>
          
          <button
            onClick={toggleFavorite}
            disabled={favoriteLoading}
            className={`p-2 ${isFavorite ? 'text-[#D32F2F]' : 'text-[#795548]'} hover:bg-[#e8e0ce] rounded-md transition-colors`}
            title={isFavorite ? "Hapus dari Favorit" : "Tambah ke Favorit"}
          >
            {favoriteLoading ? (
              <div className="w-5 h-5 border-2 border-t-transparent border-[#795548] rounded-full animate-spin"></div>
            ) : isFavorite ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            )}
          </button>
          
          <button
            onClick={toggleBookmark}
            className={`p-2 ${isBookmarked ? 'text-[#8D6E63]' : 'text-[#795548]'} hover:bg-[#e8e0ce] rounded-md transition-colors`}
            title={isBookmarked ? "Hapus Bookmark" : "Tambah Bookmark"}
          >
            {bookmarkLoading ? (
              <div className="w-5 h-5 border-2 border-t-transparent border-[#795548] rounded-full animate-spin"></div>
            ) : isBookmarked ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-end gap-2 mb-1">
          <Tooltip text="Perkecil Teks Arab">
            <button
              type="button"
              onClick={handleZoomOut}
              className="px-2 py-1 rounded bg-book-highlight text-book-primary text-xs hover:bg-book-accent border border-book-border"
              aria-label="Perkecil Teks Arab"
            >
              A-
            </button>
          </Tooltip>
          <Tooltip text="Perbesar Teks Arab">
            <button
              type="button"
              onClick={handleZoomIn}
              className="px-2 py-1 rounded bg-book-highlight text-book-primary text-xs hover:bg-book-accent border border-book-border"
              aria-label="Perbesar Teks Arab"
            >
              A+
            </button>
          </Tooltip>
        </div>
        <p className="text-right leading-loose font-arabic text-book-text" style={{ fontSize: arabicFontSize + 'rem' }}>
          {ayat.teksArab}
        </p>
        <p className="text-lg text-book-secondary font-arabic-translation text-left">
          {ayat.teksLatin}
        </p>
        <p className="text-book-text text-left">
          {ayat.teksIndonesia}
        </p>

        {/* Audio Player Section */}
        <div className="space-y-3">
          {/* Qari Selection - Make width fit content */}
          <div className="inline-block">
            <label htmlFor={`reciter-select-${ayat.nomorAyat}`} className="block text-sm font-medium text-book-secondary mb-2">
              Pilih Qari
            </label>
            <select 
              id={`reciter-select-${ayat.nomorAyat}`}
              value={selectedReciter}
              onChange={(e) => setSelectedReciter(e.target.value as keyof typeof RECITERS)}
              className="inline-block px-4 py-2 rounded-md border border-book-border bg-book-paper text-sm text-book-primary font-medium shadow-sm hover:border-book-secondary focus:outline-none focus:ring-2 focus:ring-book-primary focus:border-transparent"
              style={{ width: 'auto', minWidth: '8rem', maxWidth: '100%' }}
            >
              {Object.entries(RECITERS).map(([key, name]) => (
                <option key={key} value={key} className="py-1">
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Audio Player */}
          <audio 
            controls 
            className="w-full book-theme"
            src={ayat.audio[selectedReciter]}
          >
            Browser Anda tidak mendukung pemutaran audio.
          </audio>
        </div>

        {/* Tafsir Button and Content */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowTafsir(!showTafsir)}
                className={`
                  px-4 py-2 rounded-md font-medium text-base
                  flex items-center justify-center gap-2 
                  transition-all duration-200 ease-in-out
                  ${showTafsir 
                    ? "bg-book-highlight text-book-primary border border-book-border shadow-inner" 
                    : "bg-book-primary text-white border border-book-secondary shadow-sm hover:bg-book-secondary"}
                `}
              >
                {showTafsir ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 01-1.414-1.414l4-4a1 1 011.414 0l4 4a1 1 010 1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Sembunyikan Tafsir</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 011.414 0L10 10.586l3.293-3.293a1 1 011.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Tampilkan Tafsir</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleOpenNotes}
                className="px-4 py-2 rounded-md font-medium text-base flex items-center justify-center gap-2 
                  bg-blue-600 text-white border border-blue-700 shadow-sm hover:bg-blue-700 
                  transition-all duration-200 ease-in-out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>Catatan</span>
                {isLoadingCount ? (
                  <span className="inline-block w-5 h-5 ml-1">
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  </span>
                ) : notesCount > 0 ? (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-800 rounded-full ml-1">
                    {notesCount}
                  </span>
                ) : null}
              </button>
            </div>

            {/* WhatsApp Share Button */}
            <button
              onClick={() => shareToSocial('whatsapp')}
              className="px-4 py-2 rounded-md font-medium text-base bg-green-600 text-white border border-green-700 shadow-sm hover:bg-green-700 transition-all duration-200 ease-in-out flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
              </svg>
              Bagikan ke WhatsApp
            </button>
          </div>

          {showTafsir && (
            <div className="mt-4 p-5 bg-book-paper rounded-lg border border-book-border shadow-sm animate-fadeIn">
              <div className="text-book-text leading-relaxed">
                {isTafsirLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : ayatTafsir ? (
                  <>
                    <h3 className="text-book-primary font-semibold text-lg mb-3 pb-2 border-b border-book-border">
                      Tafsir Surah {surahData?.namaLatin} ({surahId}) Ayat {ayat.nomorAyat}
                    </h3>
                    <div 
                      className="whitespace-pre-wrap prose prose-stone max-w-none text-left"
                      dangerouslySetInnerHTML={{ __html: ayatTafsir.teks }}
                    />
                  </>
                ) : (
                  <div className="py-4 text-left">
                    <p className="text-book-secondary font-medium">Tafsir tidak tersedia untuk ayat ini.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>


      </div>
      
      {/* Bookmark Modal */}
      {showBookmarkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-book-paper rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-book-primary mb-4">Tambah Bookmark</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="bookmark-title" className="block text-sm font-medium text-book-text mb-1">Judul Bookmark</label>
                <input
                  type="text"
                  id="bookmark-title"
                  value={bookmarkTitle}
                  onChange={(e) => setBookmarkTitle(e.target.value)}
                  placeholder={`Surah ${surahData?.namaLatin} Ayat ${ayat.nomorAyat}`}
                  className="w-full px-3 py-2 border border-book-border rounded-md focus:outline-none focus:ring-2 focus:ring-book-primary bg-white"
                />
              </div>
              <div>
                <label htmlFor="bookmark-notes" className="block text-sm font-medium text-book-text mb-1">Catatan (Opsional)</label>
                <textarea
                  id="bookmark-notes"
                  value={bookmarkNotes}
                  onChange={(e) => setBookmarkNotes(e.target.value)}
                  rows={4}
                  placeholder="Tambahkan catatan..."
                  className="w-full px-3 py-2 border border-book-border rounded-md focus:outline-none focus:ring-2 focus:ring-book-primary bg-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBookmarkModal(false)}
                  className="px-4 py-2 border border-book-border rounded-md text-book-text hover:bg-book-highlight"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={saveBookmark}
                  disabled={bookmarkLoading}
                  className="px-4 py-2 bg-book-primary text-white rounded-md hover:bg-book-secondary disabled:bg-book-accent disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {bookmarkLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Menyimpan...
                    </>
                  ) : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden mx-4">
            <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Catatan untuk Surah {surahData?.namaLatin || surahId}:{ayat.nomorAyat}
              </h2>
              <button 
                onClick={() => setShowNotesModal(false)} 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 4rem)' }}>
              {isLoadingNotes ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-8">                    {/* User's Note Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {isAuthenticated ? 'Catatan Anda' : 'Buat Catatan'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Catatan akan terlihat oleh publik secara default.
                    </p>
                    
                    {isAuthenticated ? (
                      <>
                        {userNote && !isEditingNote ? (
                          <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 mb-4">
                            <div className="prose dark:prose-invert mb-4">{userNote.content}</div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="is-public"
                                  checked={userNote.is_public}
                                  disabled
                                  className="mr-2"
                                />
                                <label className="text-sm text-gray-700 dark:text-gray-300">
                                  {userNote.is_public ? 'Publik' : 'Pribadi'}
                                </label>
                              </div>
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => setIsEditingNote(true)}
                                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={handleDeleteNote}
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  Hapus
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <CreateNoteForm 
                            onSubmit={isEditingNote ? handleUpdateNote : handleCreateNote}
                            initialContent={userNote?.content || ''}
                            initialIsPublic={userNote?.is_public ?? true}
                            isEditing={isEditingNote}
                            onCancel={isEditingNote ? () => setIsEditingNote(false) : undefined}
                          />
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 dark:bg-gray-750 rounded-lg">
                        <p className="mb-4 text-gray-700 dark:text-gray-300">
                          Anda perlu masuk untuk membuat catatan.
                        </p>
                        <a 
                          href={`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`}
                          className="px-4 py-2 rounded bg-book-primary text-white hover:bg-book-primary/80"
                        >
                          Masuk
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {/* Public Notes Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <span>Catatan Publik</span>
                      <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                        {publicNotes.length}
                      </span>
                    </h3>
                    
                    {publicNotes.length > 0 ? (
                      <div className="space-y-4">
                        {publicNotes.map(note => (
                          <NoteCard 
                            key={note.note_id}
                            note={note}
                            onLike={() => handleLikeNote(note.note_id)}
                            onUnlike={() => handleUnlikeNote(note.note_id)}
                            isLikedByUser={noteLikes[note.note_id] || false}
                            isOwnNote={note.user_id === user?.user_id}
                            onEdit={note.user_id === user?.user_id ? () => {
                              setUserNote(note);
                              setIsEditingNote(true);
                            } : undefined}
                            onDelete={note.user_id === user?.user_id ? handleDeleteNote : undefined}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 dark:bg-gray-750 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                          Belum ada catatan publik untuk ayat ini.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};