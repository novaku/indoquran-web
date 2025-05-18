import { useState } from 'react';
import { AyatNote } from '@/services/noteService';
import { useAuthContext } from '@/contexts/AuthContext';

interface NoteCardProps {
  note: AyatNote;
  onLike: () => Promise<void>;
  onUnlike: () => Promise<void>;
  isLikedByUser: boolean;
  isOwnNote?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const NoteCard = ({
  note,
  onLike,
  onUnlike,
  isLikedByUser,
  isOwnNote = false,
  onEdit,
  onDelete
}: NoteCardProps) => {
  const [isLiking, setIsLiking] = useState(false);
  
  const handleLikeClick = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      if (isLikedByUser) {
        await onUnlike();
      } else {
        await onLike();
      }
    } finally {
      setIsLiking(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="font-medium text-gray-900">
          {note.username || 'User'}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(note.created_at).toLocaleDateString()}
        </div>
      </div>
      
      <div className="prose prose-sm mb-4">{note.content}</div>
      
      <div className="flex justify-between items-center">
        <button 
          onClick={handleLikeClick} 
          disabled={isLiking}
          className={`flex items-center space-x-1 ${
            isLikedByUser 
              ? 'text-book-primary' 
              : 'text-gray-500'
          }`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill={isLikedByUser ? "currentColor" : "none"}
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{note.likes_count}</span>
        </button>
        
        {isOwnNote && (
          <div className="flex space-x-2">
            {onEdit && (
              <button 
                onClick={onEdit}
                className="text-blue-500 hover:text-blue-700"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            {onDelete && (
              <button 
                onClick={onDelete}
                className="text-red-500 hover:text-red-700"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface CreateNoteFormProps {
  onSubmit: (content: string, isPublic: boolean) => Promise<void>;
  initialContent?: string;
  initialIsPublic?: boolean;
  isEditing?: boolean;
  onCancel?: () => void;
}

export const CreateNoteForm = ({
  onSubmit,
  initialContent = '',
  initialIsPublic = true, // Default to public (true) for new notes
  isEditing = false,
  onCancel
}: CreateNoteFormProps) => {
  const [content, setContent] = useState(initialContent);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(content, isPublic);
      if (!isEditing) {
        setContent('');
        setIsPublic(true); // Reset to public for new notes
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tulis catatan Anda di sini..."
          className="w-full px-3 py-2 border rounded-lg"
          rows={4}
          required
        />
      </div>
      
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="is-public"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="is-public" className="text-sm text-gray-700">
          Jadikan catatan ini publik (terlihat oleh pengguna lain)
        </label>
      </div>
      
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 rounded bg-book-primary text-white hover:bg-book-primary/80 disabled:opacity-50"
        >
          {isSubmitting ? 'Menyimpan...' : isEditing ? 'Perbarui' : 'Kirim'}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
};

interface NotesContainerProps {
  surahId: number;
  ayatNumber: number;
  onClose: () => void;
}

export const NotesContainer = ({
  surahId,
  ayatNumber,
  onClose
}: NotesContainerProps) => {
  const { isAuthenticated, user } = useAuthContext();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Catatan untuk Surah {surahId}:{ayatNumber}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {!isAuthenticated ? (
            <div className="text-center py-8">
              <p className="mb-4 text-gray-700">
                Anda perlu masuk untuk membuat catatan.
              </p>
              <a 
                href={`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`}
                className="px-4 py-2 rounded bg-book-primary text-white hover:bg-book-primary/80"
              >
                Masuk
              </a>
            </div>
          ) : (
            <NotesContent 
              surahId={surahId} 
              ayatNumber={ayatNumber} 
              userId={user?.user_id || ''}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// This component will be implemented in the AyatCard.tsx file
// Here's just a placeholder for the structure
const NotesContent = ({ surahId, ayatNumber, userId }: { surahId: number; ayatNumber: number; userId: string }) => {
  return (
    <div>
      {/* Actual implementation will be in AyatCard.tsx */}
      <p>Konten catatan akan diimplementasikan di komponen AyatCard</p>
      {/* Notes are public by default */}
    </div>
  );
};
