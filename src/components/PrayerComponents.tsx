import React from 'react';
import { Prayer as PrayerType, PrayerResponse } from '@/types/prayer';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface PrayerCardProps {
  prayer: PrayerType;
  onViewDetails: (id: number) => void;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({ prayer, onViewDetails }) => {
  return (
    <div className="bg-white rounded-lg shadow border border-amber-100 p-4 mb-4 hover:border-amber-300 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="font-medium text-amber-800">{prayer.authorName}</div>
        <div className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(prayer.createdAt), { addSuffix: true, locale: id })}
        </div>
      </div>
      
      <div className="mb-4 text-gray-700 whitespace-pre-wrap">
        {prayer.content}
      </div>
      
      <div className="flex justify-between items-center pt-2 border-t border-amber-100">
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-1">
            <span className="text-amber-600">{prayer.stats?.amiinCount || 0}</span>
            <span className="text-gray-600">Amiin</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-amber-600">{prayer.stats?.commentCount || 0}</span>
            <span className="text-gray-600">Komentar</span>
          </div>
        </div>
        
        <button 
          onClick={() => onViewDetails(prayer.id)}
          className="text-sm text-amber-700 hover:text-amber-900 hover:underline"
        >
          Lihat Detail
        </button>
      </div>
    </div>
  );
};

interface PrayerDetailProps {
  prayer: PrayerType;
  responses: PrayerResponse[];
  onSubmitAmiin: (authorName: string) => void;
  onSubmitComment: (authorName: string, content: string, parentId?: number) => void;
  currentUserName?: string;
  onBack: () => void;
}

export const PrayerDetail: React.FC<PrayerDetailProps> = ({ 
  prayer, 
  responses,
  onSubmitAmiin,
  onSubmitComment,
  currentUserName = '',
  onBack
}) => {
  const [commentText, setCommentText] = React.useState('');
  const [userName, setUserName] = React.useState(currentUserName);
  const [replyTo, setReplyTo] = React.useState<number | null>(null);
  const [replyText, setReplyText] = React.useState('');

  // Get direct comments (not replies)
  const directResponses = responses.filter(r => r.parentId === null);
  const amiins = directResponses.filter(r => r.responseType === 'amiin');
  const comments = directResponses.filter(r => r.responseType === 'comment');

  const handleAmiinSubmit = () => {
    if (userName.trim()) {
      onSubmitAmiin(userName);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim() && commentText.trim()) {
      onSubmitComment(userName, commentText);
      setCommentText('');
    }
  };

  const handleReplySubmit = (parentId: number) => {
    if (userName.trim() && replyText.trim()) {
      onSubmitComment(userName, replyText, parentId);
      setReplyTo(null);
      setReplyText('');
    }
  };

  const renderResponse = (response: PrayerResponse) => {
    const isAmiin = response.responseType === 'amiin';
    
    return (
      <div key={response.id} className={`mb-3 ${isAmiin ? '' : 'bg-amber-50 rounded p-3'}`}>
        <div className="flex justify-between items-start">
          <div className="font-medium text-amber-800">{response.authorName}</div>
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(response.createdAt), { addSuffix: true, locale: id })}
          </div>
        </div>
        
        {!isAmiin && (
          <>
            <div className="my-2 text-gray-700">{response.content}</div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setReplyTo(replyTo === response.id ? null : response.id)}
                className="text-xs text-amber-700 hover:underline"
              >
                {replyTo === response.id ? 'Batal' : 'Balas'}
              </button>
            </div>
            
            {replyTo === response.id && (
              <div className="mt-2 pl-3 border-l-2 border-amber-200">
                <input
                  type="text"
                  placeholder="Nama Anda"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full mb-2 px-3 py-2 border border-amber-200 rounded text-sm"
                  required
                />
                <textarea
                  placeholder="Tulis balasan..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full mb-2 px-3 py-2 border border-amber-200 rounded text-sm"
                  rows={2}
                  required
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => handleReplySubmit(response.id)}
                    className="px-3 py-1 bg-amber-500 text-white rounded-md text-sm hover:bg-amber-600"
                    disabled={!userName.trim() || !replyText.trim()}
                  >
                    Kirim Balasan
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        
        {response.replies && response.replies.length > 0 && (
          <div className="mt-3 pl-4 border-l border-amber-300">
            {response.replies.map(reply => renderResponse(reply))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-amber-200 p-5">
      <button 
        onClick={onBack}
        className="flex items-center text-amber-700 hover:text-amber-900 mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
        </svg>
        <span className="ml-1">Kembali</span>
      </button>
      
      {/* Prayer Content */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-amber-800">{prayer.authorName}</h3>
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(prayer.createdAt), { addSuffix: true, locale: id })}
          </div>
        </div>
        <div className="text-gray-700 whitespace-pre-wrap">{prayer.content}</div>
      </div>
      
      {/* Amiin section */}
      <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
        <h4 className="font-medium text-amber-800 mb-2">Ucapkan Amiin ({amiins.length})</h4>
        
        <div className="flex mb-4">
          <input
            type="text"
            placeholder="Nama Anda"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="flex-1 px-3 py-2 border border-amber-200 rounded-l"
            required
          />
          <button
            onClick={handleAmiinSubmit}
            className="px-4 py-2 bg-amber-500 text-white rounded-r hover:bg-amber-600"
            disabled={!userName.trim()}
          >
            Amiin
          </button>
        </div>
        
        {amiins.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {amiins.map(amiin => (
              <span key={amiin.id} className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-sm">
                {amiin.authorName}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Comments section */}
      <div className="mb-6">
        <h4 className="font-medium text-amber-800 mb-3">Komentar ({comments.length})</h4>
        
        <form onSubmit={handleCommentSubmit} className="mb-4">
          <input
            type="text"
            placeholder="Nama Anda"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full mb-2 px-3 py-2 border border-amber-200 rounded"
            required
          />
          <textarea
            placeholder="Tulis komentar atau doa Anda..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full mb-2 px-3 py-2 border border-amber-200 rounded"
            rows={3}
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
              disabled={!userName.trim() || !commentText.trim()}
            >
              Kirim Komentar
            </button>
          </div>
        </form>
        
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map(comment => renderResponse(comment))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">Belum ada komentar</p>
        )}
      </div>
    </div>
  );
};

interface CreatePrayerFormProps {
  onSubmit: (authorName: string, content: string) => void;
  currentUserName?: string;
}

export const CreatePrayerForm: React.FC<CreatePrayerFormProps> = ({ onSubmit, currentUserName = '' }) => {
  const [authorName, setAuthorName] = React.useState(currentUserName);
  const [content, setContent] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authorName.trim() && content.trim()) {
      onSubmit(authorName, content);
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-amber-50 rounded-lg border border-amber-200 p-5 mb-6">
      <h3 className="text-lg font-semibold text-amber-800 mb-4">Bagikan Doa Anda</h3>
      
      <div className="mb-4">
        <label htmlFor="authorName" className="block text-amber-700 mb-1">
          Nama Anda
        </label>
        <input
          type="text"
          id="authorName"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full px-3 py-2 border border-amber-200 rounded"
          placeholder="Masukkan nama Anda (atau bisa anonim)"
          required
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="content" className="block text-amber-700 mb-1">
          Doa Anda
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 border border-amber-200 rounded"
          placeholder="Tulis doa Anda di sini..."
          rows={5}
          required
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-5 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
          disabled={!authorName.trim() || !content.trim()}
        >
          Kirim Doa
        </button>
      </div>
    </form>
  );
};
