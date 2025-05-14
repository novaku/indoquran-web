import React from 'react';
import { Prayer as PrayerType, PrayerResponse } from '@/types/prayer';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface PrayerCardProps {
  prayer: PrayerType;
  onViewDetails: (id: number) => void;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({ prayer, onViewDetails }) => {
  // Use the existing prayer SVG icon
  const prayerIconSvg = "/icons/prayer-icon.svg";
  // Generate a random number for a visual effect
  const animationDelay = React.useMemo(() => (Math.random() * 0.5).toFixed(2), []);
  
  return (
    <div 
      className="bg-gradient-to-br from-white to-amber-50 rounded-lg shadow-lg border border-amber-200 p-5 mb-5 hover:border-amber-400 transition-all hover:shadow-xl relative overflow-hidden transform hover:-translate-y-1 duration-300"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      {/* Prayer icon as decorative element */}
      <div className="absolute top-3 left-3 w-10 h-10 opacity-10 pointer-events-none">
        <img 
          src={prayerIconSvg} 
          alt="" 
          className="w-full h-full object-contain text-amber-500"
        />
      </div>
      
      {/* Decorative flourish */}
      <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-amber-100 opacity-20"></div>
      <div className="absolute top-1/2 left-0 h-20 w-1 bg-gradient-to-b from-amber-400/0 via-amber-400/60 to-amber-400/0 rounded-r"></div>
      
      {/* Author and time header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center">
          <div className="bg-amber-400/90 p-2 rounded-full mr-3 shadow-md">
            <img 
              src={prayerIconSvg} 
              alt="" 
              className="w-5 h-5"
              style={{filter: "brightness(0) invert(1)"}} // Make the SVG white
            />
          </div>
          <div className="font-semibold text-amber-800 text-lg">{prayer.authorName}</div>
        </div>
        <div className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-full shadow-sm">
          {formatDistanceToNow(new Date(prayer.createdAt), { addSuffix: true, locale: id })}
        </div>
      </div>
      
      {/* Prayer content with enhanced styling */}
      <div className="mb-5 text-gray-700 whitespace-pre-wrap relative z-10 p-4 bg-white/80 rounded-lg border border-amber-100 shadow-md hover:shadow-inner transition-shadow">
        {prayer.content.length > 150 ? `${prayer.content.substring(0, 150)}...` : prayer.content}
        {prayer.content.length > 150 && (
          <button 
            onClick={() => onViewDetails(prayer.id)}
            className="ml-1 text-amber-600 hover:text-amber-800 text-xs italic"
          >
            baca selengkapnya
          </button>
        )}
      </div>
      
      {/* Engagement stats and action buttons */}
      <div className="flex justify-between items-center pt-3 border-t border-amber-200/50 relative z-10">
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-1 bg-amber-100 px-3 py-1.5 rounded-full shadow-sm transition-all hover:bg-amber-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span className="text-amber-700 font-medium">{prayer.amiinCount || 0}</span>
            <span className="text-amber-800">Amiin</span>
          </div>
          <div className="flex items-center space-x-1 bg-amber-100 px-3 py-1.5 rounded-full shadow-sm transition-all hover:bg-amber-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-amber-700 font-medium">{prayer.commentCount || 0}</span>
            <span className="text-amber-800">Komentar</span>
          </div>
        </div>
        
        <button 
          onClick={() => onViewDetails(prayer.id)}
          className="flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white px-4 py-2 rounded-full transition-colors shadow-md hover:shadow-lg transform transition-transform hover:scale-105"
        >
          <span>Detail</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
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
  const [showGuidance, setShowGuidance] = React.useState(false);
  const [animation, setAnimation] = React.useState(false);

  React.useEffect(() => {
    // Add entrance animation after component mounts
    setTimeout(() => setAnimation(true), 300);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authorName.trim() && content.trim()) {
      onSubmit(authorName, content);
      setContent('');
    }
  };

  // Use a specific static image for the form background
  const doaBackgroundImage = "/images/doa/doa-1.jpeg";
  
  // Sample inspirational duas (could be moved to an external data source)
  const inspiredDuas = [
    "Ya Allah, berikan kami kebaikan di dunia dan di akhirat, dan lindungilah kami dari siksa api neraka.",
    "Ya Allah, jadikanlah hari ini lebih baik dari kemarin, dan esok lebih baik dari hari ini.",
    "Ya Allah, ampuni aku, kedua orang tuaku, dan kaum muslimin dan muslimat."
  ];
  
  // Random dua inspiration
  const randomInspiration = inspiredDuas[Math.floor(Math.random() * inspiredDuas.length)];

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`bg-amber-50 rounded-xl p-6 shadow-lg border border-amber-200 mb-10 relative overflow-hidden transform transition-all duration-700 ${
        animation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-90'
      }`}
    >
      {/* Background pulsing effect */}
      <div className="absolute inset-0 bg-amber-100 animate-pulse opacity-30 -z-20" />
      
      {/* Background image with overlay */}
      <div className="absolute inset-0 -z-10">
        <img 
          src={doaBackgroundImage} 
          alt="" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/90 to-white/80" />
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 h-full w-1 bg-amber-500"></div>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-200/30 rounded-full blur-2xl"></div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-amber-300/10 rounded-full -translate-y-20 translate-x-20 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full translate-y-10 -translate-x-10 blur-xl" />
      
      <div className="relative z-10 p-6">
        <div className="mb-6 flex items-center">
          <div className="bg-amber-500 p-3 rounded-full shadow-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-amber-800">Sampaikan Doa Anda</h3>
          <button 
            type="button" 
            onClick={() => setShowGuidance(!showGuidance)}
            className="ml-auto text-amber-600 hover:text-amber-800 focus:outline-none transition-colors"
            aria-label={showGuidance ? "Sembunyikan panduan" : "Tampilkan panduan"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      
        {showGuidance && (
          <div className="mb-5 p-4 bg-white/80 rounded-lg border border-amber-200 shadow-inner animate-fadeIn">
            <h4 className="font-semibold text-amber-800 mb-2">Panduan Berdoa:</h4>
            <ul className="list-disc list-inside text-sm text-amber-900 space-y-1">
              <li>Mulailah dengan memuji Allah SWT</li>
              <li>Kemudian sampaikan harapan dan permohonan Anda</li>
              <li>Akhiri dengan doa untuk semua Muslim</li>
            </ul>
            <div className="mt-3 p-2 bg-amber-50 rounded border-l-4 border-amber-400 italic text-sm">
              <p className="font-medium text-amber-800">Inspirasi doa:</p>
              <p className="text-amber-700">{randomInspiration}</p>
            </div>
          </div>
        )}
      
        <div className="mb-5 group">
          <label htmlFor="authorName" className="block text-amber-700 mb-1.5 font-medium group-hover:text-amber-900 transition-colors">
            Nama Anda
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              type="text"
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full pl-10 px-4 py-3 bg-white/90 border border-amber-200 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all group-hover:border-amber-300"
              placeholder="Masukkan nama Anda (atau bisa anonim)"
              required
            />
          </div>
        </div>
        
        <div className="mb-5 group">
          <label htmlFor="content" className="flex justify-between items-center text-amber-700 mb-1.5 font-medium group-hover:text-amber-900 transition-colors">
            <span>Doa Anda</span>
            <span className="text-xs font-normal text-amber-600">{content.length > 0 ? `${content.length} karakter` : "Tulis dari hati Anda"}</span>
          </label>
          <div className="relative">
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 bg-white/90 border border-amber-200 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all group-hover:border-amber-300"
              placeholder="اللهم... (Ya Allah, saya berdoa untuk...)"
              rows={6}
              required
            />
            <div className="absolute right-3 bottom-3 opacity-70 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            </div>
          </div>
        </div>
      
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-amber-700 italic">
            "Berdoalah kepada-Ku, niscaya Aku perkenankan bagimu." <span className="font-semibold">(QS. Al-Mu'min: 60)</span>
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            disabled={!authorName.trim() || !content.trim()}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Kirim Doa</span>
            </div>
          </button>
        </div>
      </div>
    </form>
  );
};
