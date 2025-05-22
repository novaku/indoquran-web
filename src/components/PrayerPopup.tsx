'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Prayer, PrayerResponse } from '@/types/prayer';
import { LoadingSpinner } from './LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import ErrorAlert from './ErrorAlert';
import { Toast, ToastType, ToastContainer } from './Toast';

interface PrayerPopupProps { 
  isOpen: boolean; 
  onClose: () => void; 
  prayer: Prayer | null;
  responses: PrayerResponse[];
  isLoading: boolean;
  onSubmitAmiin: (authorName: string) => Promise<void>;
  onSubmitComment: (authorName: string, content: string, parentId?: number) => Promise<void>;
  currentUserName?: string;
  pagination?: {
    commentPagination: {
      currentPage: number;
      totalPages: number;
      totalComments: number;
      commentsPerPage: number;
    };
    amiinPagination: {
      currentPage: number;
      totalPages: number;
      totalAmiins: number;
      amiinsPerPage: number;
    };
  };
  onCommentPageChange?: (prayerId: number, page: number) => void;
  onAmiinPageChange?: (prayerId: number, page: number) => void;
}

const PrayerPopup = ({ 
  isOpen, 
  onClose, 
  prayer, 
  responses,
  isLoading,
  onSubmitAmiin,
  onSubmitComment,
  currentUserName = '',
  pagination = {
    commentPagination: {
      currentPage: 1,
      totalPages: 1,
      totalComments: 0,
      commentsPerPage: 10
    },
    amiinPagination: {
      currentPage: 1,
      totalPages: 1,
      totalAmiins: 0,
      amiinsPerPage: 20
    }
  },
  onCommentPageChange = (id, page) => {
    console.log(`Default comment page change handler: prayer ${id}, page ${page}`);
  },
  onAmiinPageChange = (id, page) => {
    console.log(`Default amiin page change handler: prayer ${id}, page ${page}`);
  }
}: PrayerPopupProps) => {
  const [commentText, setCommentText] = useState('');
  const [userName, setUserName] = useState(currentUserName);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState<'amiin' | 'comment'>('comment');
  const [optimisticAmiins, setOptimisticAmiins] = useState<PrayerResponse[]>([]);
  const [isSubmittingAmiin, setIsSubmittingAmiin] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Initialize Amiin button as not submitted (always show Amiin button initially)
  const [hasSubmittedAmiin, setHasSubmittedAmiin] = useState(false);  // Always false to ensure Amiin button is shown
  const [hasSubmittedComment, setHasSubmittedComment] = useState(false);
  const [submittedReplyIds, setSubmittedReplyIds] = useState<number[]>([]);
  
  // Toast notification state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: ToastType }[]>([]);
  
  // Client-side only mounting check
  const [isMounted, setIsMounted] = useState(false);
  
  // Track last submitted name and prayerId for Amiin and Comment
  const [lastAmiin, setLastAmiin] = useState<{ name: string; prayerId: number } | null>(null);
  const [lastComment, setLastComment] = useState<{ name: string; prayerId: number } | null>(null);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    setUserName(currentUserName);
  }, [currentUserName]);
  
  // Helper function to add toast notifications
  const showToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove toast after its duration (separate from the UI auto-hide)
    setTimeout(() => {
      removeToast(id);
    }, type === 'error' ? 8000 : 5000);
  };
  
  // Helper function to remove a toast by id
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Reset when opening a new prayer
  useEffect(() => {
    if (prayer) {
      setErrorMessage(null);
      setSuccessMessage(null);
      // Always ensure Amiin button is enabled
      setHasSubmittedAmiin(false);
      setHasSubmittedComment(false);
      setSubmittedReplyIds([]);
    }
  }, [prayer]);
  
  // Reset states when the popup opens or closes
  useEffect(() => {
    if (isOpen) {
      // Only reset the states when opening the popup, not on first mount
      if (isMounted) {
        // Reset button states
        setHasSubmittedAmiin(false); // Always show Amiin button, hide Terkirim on initial load
        setHasSubmittedComment(false);
        setSubmittedReplyIds([]);
        
        // Reset any in-progress submissions
        setIsSubmittingAmiin(false);
        setIsSubmittingComment(false);
        setIsSubmittingReply(false);
        
        // Reset form states
        setReplyTo(null);
        setReplyText('');
        setCommentText(''); // Clear any partial comment text
        
        // Even if user has already said Amiin, keep the button enabled
        // if (prayer && prayer.currentUserSaidAmiin) {
        //   setHasSubmittedAmiin(true); // Set Amiin button to "Terkirim" if user has already said Amiin
        // }
      }
    } else {
      // When closing the popup, clean up any temporary states and reset button states
      setErrorMessage(null);
      setSuccessMessage(null);
      
      // Reset button states when closing the popup
      setHasSubmittedAmiin(false);
      setHasSubmittedComment(false);
      setSubmittedReplyIds([]);
      
      // Reset any in-progress submissions
      setIsSubmittingAmiin(false);
      setIsSubmittingComment(false);
      setIsSubmittingReply(false);
    }
  }, [isOpen, isMounted, prayer]);

  // Reset optimistic amiins when responses change
  useEffect(() => {
    setOptimisticAmiins([]);
  }, [responses]);

  // Separate responses by type
  const directResponses = responses.filter(r => r.parentId === null);
  // For comments, we only want comments from the responses
  const comments = directResponses.filter(r => r.responseType === 'comment');
  
  // For amiins, we combine responses with any optimistic updates
  // The API now returns amiins separately with pagination, 
  // but we still need to handle optimistic updates
  const amiins = [
    ...directResponses.filter(r => r.responseType === 'amiin'), 
    ...optimisticAmiins
  ];

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen && isMounted) {
      // Save current scroll position and add styles to lock scroll
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'hidden';
      
      // Cleanup function that runs when the component unmounts or when dependencies change
      return () => {
        // Restore scroll position when popup closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        window.scrollTo(0, scrollY); // Use the captured scrollY value
      };
    }
  }, [isOpen, isMounted]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);
  
  // Generate a deterministic gradient color based on prayer ID
  const getGradientColors = (prayerId: number) => {
    // Use prayer ID to generate a deterministic set of colors
    const hue = (prayerId * 37) % 60; // Keep hue in amber/gold range (30-60)
    const satBase = 75 + (prayerId % 20); // Saturation between 75-95%
    const lightBase = 75 + (prayerId % 15); // Lightness between 75-90%
    
    return {
      from: `hsl(${hue}, ${satBase}%, ${lightBase}%)`,
      via: `hsl(${(hue + 10) % 60}, ${Math.max(satBase - 5, 70)}%, ${Math.min(lightBase + 5, 95)}%)`,
      to: `hsl(${(hue + 20) % 60}, ${Math.max(satBase - 10, 65)}%, ${Math.min(lightBase + 10, 97)}%)`
    };
  };

  const handleAmiinSubmit = async () => {
    if (userName.trim() && !isSubmittingAmiin && !hasSubmittedAmiin) {
      // Confirmation if same name and same prayerId as last Amiin
      if (lastAmiin && lastAmiin.name === userName.trim() && lastAmiin.prayerId === (prayer?.id || 0)) {
        const confirmed = window.confirm('Anda sudah mengirim Amiin dengan nama yang sama untuk doa ini. Kirim lagi?');
        if (!confirmed) return;
      }
      setLastAmiin({ name: userName.trim(), prayerId: prayer?.id || 0 });
      setIsSubmittingAmiin(true);
      setErrorMessage(null); // Clear any previous error messages
      setSuccessMessage(null); // Clear any previous success messages
      
      // Generate a temporary ID for tracking this optimistic update
      const tempId = Date.now();
      
      // Optimistically add the amiin to the UI immediately
      const optimisticAmiin: PrayerResponse = {
        id: tempId, // Temporary ID
        authorName: userName,
        content: 'Amiin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prayerId: prayer?.id || 0,
        parentId: null,
        responseType: 'amiin',
        userId: null,
        replies: []
      };
      
      // Add to optimistic updates
      setOptimisticAmiins(prev => [...prev, optimisticAmiin]);
      
      // Switch to the amiin tab to show the result
      setActiveTab('amiin');
      
      try {
        // Call the API
        await onSubmitAmiin(userName);
        
        // Show success message inline and with toast notification
        const successMsg = 'Amiin berhasil ditambahkan. Terima kasih!';
        setSuccessMessage(successMsg);
        showToast(successMsg, 'success');
        
        setHasSubmittedAmiin(true);
        
        // Reset submitting state after a delay to show success animation
        setTimeout(() => {
          setIsSubmittingAmiin(false);
        }, 1000);
        
        // After 5 seconds, hide the inline success message but keep the button disabled
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } catch (error: any) {
        console.error('Error submitting amiin:', error);
        
        // Set error message with specific handling for prayer_stats errors
        let errorMsg = 'Gagal menambahkan Amiin. Doa mungkin tidak ditemukan atau telah dihapus.';
        
        if (error.message) {
          // Check for specific database table issues
          if (error.message.includes('prayer_stats') || 
              (error.message.includes('Table') && error.message.includes('doesn\'t exist'))) {
            errorMsg = 'Terjadi masalah dengan database. Mohon hubungi administrator.';
            console.error('Database schema error detected: The prayer_stats table reference still exists but table was removed.');
          } else {
            errorMsg = error.message;
          }
        }
        
        // Show error message inline and with toast notification
        setErrorMessage(errorMsg);
        showToast(errorMsg, 'error');
        
        // Remove the optimistic update in case of error
        setOptimisticAmiins(prev => prev.filter(item => item.id !== tempId));
        
        // Reset submitting state immediately on error
        setIsSubmittingAmiin(false);
        
        // Auto-hide error message after 8 seconds
        setTimeout(() => {
          setErrorMessage(null);
        }, 8000);
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim() && commentText.trim() && !isSubmittingComment && !hasSubmittedComment) {
      // Confirmation if same name and same prayerId as last Comment
      if (lastComment && lastComment.name === userName.trim() && lastComment.prayerId === (prayer?.id || 0)) {
        const confirmed = window.confirm('Anda sudah mengirim komentar dengan nama yang sama untuk doa ini. Kirim lagi?');
        if (!confirmed) return;
      }
      setLastComment({ name: userName.trim(), prayerId: prayer?.id || 0 });
      setErrorMessage(null); // Clear any previous error messages
      setSuccessMessage(null); // Clear any previous success messages
      setIsSubmittingComment(true);
      try {
        await onSubmitComment(userName, commentText);
        setCommentText('');
        
        // Show success message both inline and as a toast
        const successMsg = 'Komentar berhasil ditambahkan. Terima kasih!';
        setSuccessMessage(successMsg);
        showToast(successMsg, 'success');
        
        // Mark comment as submitted to update button state
        setHasSubmittedComment(true);
        
        // Reset submitting state after a delay to show success animation
        setTimeout(() => {
          setIsSubmittingComment(false);
        }, 1000);
        
        // After 5 seconds, hide the success message but keep the button disabled
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } catch (error: any) {
        console.error('Error submitting comment:', error);
        
        // Enhanced error handling with specific messages
        let errorMsg = 'Gagal menambahkan komentar. Silakan coba lagi.';
        
        if (error.message) {
          // Check for specific database table issues
          if (error.message.includes('prayer_stats') || 
              (error.message.includes('Table') && error.message.includes('doesn\'t exist'))) {
            errorMsg = 'Terjadi masalah dengan database. Mohon hubungi administrator.';
            console.error('Database schema error detected: The prayer_stats table reference still exists but table was removed.');
          } else {
            errorMsg = error.message;
          }
        }
        
        // Set error message both inline and as a toast
        setErrorMessage(errorMsg);
        showToast(errorMsg, 'error');
        
        // Auto-hide error message after 8 seconds
        setTimeout(() => {
          setErrorMessage(null);
        }, 8000);
        
        // Reset submitting state immediately on error
        setIsSubmittingComment(false);
      }
    }
  };

  const handleReplySubmit = async (parentId: number) => {
    if (userName.trim() && replyText.trim()) {
      setErrorMessage(null); // Clear any previous error messages
      setSuccessMessage(null); // Clear any previous success messages
      setIsSubmittingReply(true);
      try {
        await onSubmitComment(userName, replyText, parentId);
        setReplyTo(null);
        setReplyText('');
        
        // Add this reply ID to our list of submitted replies
        setSubmittedReplyIds(prev => [...prev, parentId]);
        
        // Show success message both inline and as a toast
        const successMsg = 'Balasan berhasil ditambahkan. Terima kasih!';
        setSuccessMessage(successMsg);
        showToast(successMsg, 'success');
        
        // After a delay, reset submitting state to show success animation
        setTimeout(() => {
          setIsSubmittingReply(false);
        }, 1000);
        
        // After 5 seconds, hide the success message but keep reply disabled
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } catch (error: any) {
        console.error('Error submitting reply:', error);
        
        // Enhanced error handling with specific messages
        let errorMsg = 'Gagal menambahkan balasan. Silakan coba lagi.';
        
        if (error.message) {
          // Check for specific database table issues
          if (error.message.includes('prayer_stats') || 
              (error.message.includes('Table') && error.message.includes('doesn\'t exist'))) {
            errorMsg = 'Terjadi masalah dengan database. Mohon hubungi administrator.';
            console.error('Database schema error detected: The prayer_stats table reference still exists but table was removed.');
          } else {
            errorMsg = error.message;
          }
        }
        
        // Set error message both inline and as a toast
        setErrorMessage(errorMsg);
        showToast(errorMsg, 'error');
        
        // Auto-hide error message after 8 seconds
        setTimeout(() => {
          setErrorMessage(null);
        }, 8000);
        
        // Reset submitting state immediately on error
        setIsSubmittingReply(false);
      }
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
                    className={`px-3 py-1 text-white rounded-md text-sm
                      ${submittedReplyIds.includes(response.id) 
                        ? 'bg-green-500 cursor-not-allowed opacity-80' 
                        : 'bg-amber-500 hover:bg-amber-600'}`}
                    disabled={!userName.trim() || !replyText.trim() || isSubmittingReply || submittedReplyIds.includes(response.id)}
                    title={submittedReplyIds.includes(response.id) ? "Balasan telah terkirim" : ""}
                  >
                    {isSubmittingReply ? (
                      <div className="flex items-center">
                        <svg className="animate-spin mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengirim...
                      </div>
                    ) : submittedReplyIds.includes(response.id) ? (
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Terkirim
                      </div>
                    ) : (
                      <>Kirim Balasan</>
                    )}
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
  
  if (!isOpen || !isMounted) return null;

  return createPortal(
    <>
      {/* Toast notifications container */}
      {toasts.length > 0 && <ToastContainer toasts={toasts} removeToast={removeToast} />}
      
      <div className="fixed inset-0 flex items-center justify-center z-[9999]">
        {/* Backdrop with blur effect */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={onClose}
          aria-hidden="true"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        ></div>
      
      <div 
        className="relative bg-gradient-to-br from-white to-amber-50 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto m-4 z-[10000] border border-amber-100"
        style={{ 
          animation: 'fadeInSlideUp 0.4s ease-out',
          transformOrigin: 'center bottom'
        }}
      >
        <div className="sticky top-0 bg-gradient-to-r from-amber-50 to-white px-6 py-4 border-b border-amber-200 flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center">
            <svg viewBox="0 0 512 512" className="h-5 w-5 text-amber-500 mr-2" fill="currentColor">
              <path d="M400 192c8.836 0 16-7.164 16-16v-27.96c0-48.53-39.47-88-88-88h-17.12c-10.39 0-19.98-6.512-23.61-16.56-4.445-12.33-16.24-20.6-29.59-20.32-13.08.2949-24.29 9.109-27.8 21.42-1.834 6.439-5.164 12.37-9.621 17.29-11.58 12.74-28.1 19.06-44.55 16.8-33.44-4.445-58.44-33.14-58.74-66.74C117 .6602 105.5-4.893 96.26 3.754 73.22 24.81 48.97 44.64 29.35 69.99c-73.41 94.9 15.25 209 118.9 208.1 19.31-.1914 36.94-4.492 53.22-12.42c9.338-4.367 20.28-1.912 27.25 5.701c9.254 9.969 9.273 25.39-.0039 35.38C205.7 331 174.2 344.6 138.8 346.3c-13.9 .7383-24.29 12.84-23.56 26.73c.7383 13.9 12.86 24.16 26.74 23.56c46.75-2.438 89.47-21.73 120.9-55.61c10.83 18.7 24.88 35.23 41.28 48.75c7.723 6.348 19.13 5.211 25.48-2.516c6.348-7.723 5.211-19.13-2.516-25.48c-41.13-33.84-60.1-93.55-48-149.7c.7832-3.648 3.309-6.426 7.053-7.625C334.8 191.4 367.3 192 400 192zM368 48c-13.23 0-24 10.77-24 24S354.8 96 368 96c13.23 0 24-10.77 24-24S381.2 48 368 48z"/>
            </svg>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text text-transparent">
              Detail Doa
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-100 rounded-full transition-colors duration-200"
            aria-label="Tutup"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4 animate-fadeIn">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errorMessage}</span>
              </div>
              <button
                className="absolute top-0 right-0 p-2 text-red-500 hover:text-red-700"
                onClick={() => setErrorMessage(null)}
              >
                <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4 animate-fadeIn">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{successMessage}</span>
              </div>
              <button
                className="absolute top-0 right-0 p-2 text-green-500 hover:text-green-700"
                onClick={() => setSuccessMessage(null)}
              >
                <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : prayer ? (
            <div>
              {/* Prayer Content with Gradient Background */}
              <div className="mb-6 relative">
                {/* Beautiful gradient background */}
                <div className="absolute inset-x-0 top-0 h-40 rounded-t-lg overflow-hidden -mx-6 -mt-6">
                  <div 
                    className="w-full h-full" 
                    style={{
                      background: prayer.id ? 
                        `linear-gradient(to bottom right, ${getGradientColors(prayer.id).from}, ${getGradientColors(prayer.id).via}, ${getGradientColors(prayer.id).to})` : 
                        'linear-gradient(to bottom right, #fcd34d, #fde68a, #fef3c7)'
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-white"></div>
                  {/* Decorative pattern overlay */}
                  <div className="absolute inset-0" style={{ 
                    backgroundImage: "radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2) 2px, transparent 0)",
                    backgroundSize: "40px 40px"
                  }}></div>
                </div>
                
                {/* Prayer content with decorative elements */}
                <div className="pt-16 relative">
                  <div className="absolute top-0 right-0 w-16 h-16">
                    <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-200 rounded-full border-2 border-amber-300 flex items-center justify-center shadow-lg">
                      <div className="h-10 w-10 flex items-center justify-center">
                        <svg viewBox="0 0 512 512" className="h-6 w-6 text-white" fill="currentColor">
                          <path d="M400 192c8.836 0 16-7.164 16-16v-27.96c0-48.53-39.47-88-88-88h-17.12c-10.39 0-19.98-6.512-23.61-16.56-4.445-12.33-16.24-20.6-29.59-20.32-13.08.2949-24.29 9.109-27.8 21.42-1.834 6.439-5.164 12.37-9.621 17.29-11.58 12.74-28.1 19.06-44.55 16.8-33.44-4.445-58.44-33.14-58.74-66.74C117 .6602 105.5-4.893 96.26 3.754 73.22 24.81 48.97 44.64 29.35 69.99c-73.41 94.9 15.25 209 118.9 208.1 19.31-.1914 36.94-4.492 53.22-12.42c9.338-4.367 20.28-1.912 27.25 5.701c9.254 9.969 9.273 25.39-.0039 35.38C205.7 331 174.2 344.6 138.8 346.3c-13.9 .7383-24.29 12.84-23.56 26.73c.7383 13.9 12.86 24.16 26.74 23.56c46.75-2.438 89.47-21.73 120.9-55.61c10.83 18.7 24.88 35.23 41.28 48.75c7.723 6.348 19.13 5.211 25.48-2.516c6.348-7.723 5.211-19.13-2.516-25.48c-41.13-33.84-60.1-93.55-48-149.7c.7832-3.648 3.309-6.426 7.053-7.625C334.8 191.4 367.3 192 400 192zM368 48c-13.23 0-24 10.77-24 24S354.8 96 368 96c13.23 0 24-10.77 24-24S381.2 48 368 48z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-amber-800">{prayer.authorName}</h3>
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(prayer.createdAt), { addSuffix: true, locale: id })}
                    </div>
                  </div>
                  
                  <div className="text-gray-700 whitespace-pre-wrap p-5 bg-gradient-to-br from-amber-50 to-white rounded-lg border border-amber-100 shadow-inner">
                    <div className="relative">
                      <svg className="absolute top-0 left-0 h-5 w-5 text-amber-300 opacity-30 -ml-2 -mt-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <div className="ml-4">
                        {prayer.content}
                      </div>
                      <svg className="absolute bottom-0 right-0 h-5 w-5 text-amber-300 opacity-30 -mr-2 -mb-2 transform rotate-180" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tabs with enhanced styling */}
              <div className="border-b border-amber-200 mb-6">
                <div className="flex">
                  <button 
                    onClick={() => setActiveTab('amiin')}
                    className={`py-2 px-4 font-medium text-sm rounded-t-lg transition-all duration-200 ${
                      activeTab === 'amiin' 
                        ? 'text-amber-800 border-b-2 border-amber-500 bg-amber-50' 
                        : 'text-amber-600 hover:text-amber-800 hover:bg-amber-50/50'
                    } ${optimisticAmiins.length > 0 ? 'relative' : ''}`}
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Amiin
                      {optimisticAmiins.length > 0 && (
                        <span className="flex h-2 w-2 relative ml-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                      )}
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('comment')}
                    className={`py-2 px-4 font-medium text-sm rounded-t-lg transition-all duration-200 ${
                      activeTab === 'comment' 
                        ? 'text-amber-800 border-b-2 border-amber-500 bg-amber-50' 
                        : 'text-amber-600 hover:text-amber-800 hover:bg-amber-50/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.97 20 12 20C10.5286 20 9.14053 19.7105 7.91872 19.1924L3 21L4.59634 16.5518C3.59351 15.2992 3 13.7079 3 12C3 7.58172 7.02944 4 12 4C16.97 4 21 7.58172 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Komentar
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Amiin section with enhanced styling */}
              {activeTab === 'amiin' && (
                <div className="mb-6">
                  <div className="p-4 mb-6 bg-gradient-to-r from-amber-50 to-amber-50/30 rounded-lg border border-amber-100 shadow-inner">
                    <div className="flex mb-4">
                      <input
                        type="text"
                        placeholder="Nama Anda"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-amber-200 rounded-l focus:ring focus:ring-amber-200 focus:border-amber-400 focus:outline-none transition-all duration-200"
                        required
                      />
                      <button
                        onClick={handleAmiinSubmit}
                        className={`px-4 py-2 ${hasSubmittedAmiin 
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 cursor-not-allowed opacity-80' 
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'} 
                          text-white rounded-r transition-all duration-200 flex items-center shadow-sm`}
                        disabled={!userName.trim() || isSubmittingAmiin}
                        title={hasSubmittedAmiin ? "" : "Kirim Amiin"}
                      >
                        {isSubmittingAmiin ? (
                          <div className="flex items-center">
                            <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Mengirim...
                          </div>
                        ) : hasSubmittedAmiin ? (
                          <>
                            <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Terkirim
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Amiin
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center py-6">
                      <LoadingSpinner />
                    </div>
                  ) : amiins.length > 0 ? (
                    <div>
                      <h4 className="text-lg font-medium text-amber-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-1.5 text-amber-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Amiin dari Jamaah
                      </h4>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {amiins.map((amiin, index) => {
                          // Check if this is an optimistic entry
                          const isOptimistic = optimisticAmiins.some(opt => opt.id === amiin.id);
                          
                          return (
                            <span 
                              key={amiin.id} 
                              className={`px-3 py-1.5 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 rounded text-sm border ${isOptimistic ? 'border-amber-300 shadow-md' : 'border-amber-200/50 shadow-sm'}`} 
                              style={{ 
                                animationDelay: `${index * 0.1}s`,
                                animation: 'fadeIn 0.5s ease-out forwards'
                              }}
                            >
                              <span className={`${isOptimistic ? 'text-amber-600' : 'text-amber-500'} mr-1.5`}>•</span>
                              <span className="font-medium">{amiin.authorName}</span>
                              <span className="text-amber-500/70 text-xs ml-1.5">
                                {formatDistanceToNow(new Date(amiin.createdAt), { addSuffix: true, locale: id })}
                              </span>
                              {isOptimistic && (
                                <span className="ml-1 inline-block animate-pulse">✓</span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                      
                      {/* Amiin Pagination */}
                      {pagination.amiinPagination.totalPages > 1 && (
                        <div className="flex justify-center items-center mt-4 mb-4">
                          <button
                            onClick={() => {
                              if (prayer && prayer.id) {
                                onAmiinPageChange(prayer.id, Math.max(1, pagination.amiinPagination.currentPage - 1));
                              } else {
                                console.error('Cannot change page: prayer or prayer.id is undefined');
                              }
                            }}
                            disabled={pagination.amiinPagination.currentPage === 1}
                            className="px-3 py-1 mx-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Previous page"
                          >
                            &laquo;
                          </button>
                          
                          {/* Page numbers */}
                          <div className="flex space-x-1">
                            {(() => {
                              const pageNumbers = [];
                              let lastRenderedPage = 0;
                              
                              for (let i = 1; i <= pagination.amiinPagination.totalPages; i++) {
                                const isCurrentPage = i === pagination.amiinPagination.currentPage;
                                const isFirstPage = i === 1;
                                const isLastPage = i === pagination.amiinPagination.totalPages;
                                const isAdjacentToCurrentPage = Math.abs(i - pagination.amiinPagination.currentPage) <= 1;
                                
                                if (isCurrentPage || isFirstPage || isLastPage || isAdjacentToCurrentPage) {
                                  // Add ellipsis if there's a gap
                                  if (i > lastRenderedPage + 1 && lastRenderedPage !== 0) {
                                    pageNumbers.push(
                                      <span key={`ellipsis-${i}`} className="px-2 py-1">
                                        &hellip;
                                      </span>
                                    );
                                  }
                                  
                                  pageNumbers.push(
                                    <button
                                      key={i}
                                      onClick={() => {
                                        if (prayer && prayer.id) {
                                          onAmiinPageChange(prayer.id, i);
                                        } else {
                                          console.error('Cannot change page: prayer or prayer.id is undefined');
                                        }
                                      }}
                                      className={`px-3 py-1 rounded ${
                                        i === pagination.amiinPagination.currentPage
                                          ? 'bg-amber-500 text-white'
                                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                      }`}
                                    >
                                      {i}
                                    </button>
                                  );
                                  
                                  lastRenderedPage = i;
                                }
                              }
                              
                              return pageNumbers;
                            })()}
                          </div>
                          
                          <button
                            onClick={() => {
                              if (prayer && prayer.id) {
                                onAmiinPageChange(prayer.id, Math.min(pagination.amiinPagination.totalPages, pagination.amiinPagination.currentPage + 1));
                              } else {
                                console.error('Cannot change page: prayer or prayer.id is undefined');
                              }
                            }}
                            disabled={pagination.amiinPagination.currentPage === pagination.amiinPagination.totalPages}
                            className="px-3 py-1 mx-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Next page"
                          >
                            &raquo;
                          </button>
                        </div>
                      )}
                      
                      <div className="text-center mt-2 text-sm text-gray-500">
                        Menampilkan {((pagination.amiinPagination.currentPage - 1) * pagination.amiinPagination.amiinsPerPage) + 1} sampai {Math.min(pagination.amiinPagination.currentPage * pagination.amiinPagination.amiinsPerPage, pagination.amiinPagination.totalAmiins)} dari {pagination.amiinPagination.totalAmiins} amiin
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-amber-50/50 rounded-lg border border-amber-100 shadow-inner">
                      <svg className="w-12 h-12 mx-auto text-amber-200 mb-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="text-amber-700">Belum ada yang mengucapkan Amiin untuk doa ini.</p>
                      <p className="text-amber-500 text-sm mt-1">Jadilah yang pertama mengucapkan Amiin!</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Comments section */}
              {activeTab === 'comment' && (
                <div>
                
                <form onSubmit={handleCommentSubmit} className="mb-6 bg-gradient-to-r from-amber-50 to-amber-50/30 p-4 rounded-lg border border-amber-100 shadow-inner">
                  <div className="mb-3">
                    <label htmlFor="userName" className="block text-sm text-amber-700 mb-1 font-medium">Nama Anda</label>
                    <input
                      id="userName"
                      type="text"
                      placeholder="Masukkan nama Anda"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-200 rounded focus:ring focus:ring-amber-200 focus:border-amber-400 focus:outline-none transition-all duration-200 bg-white/80"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="commentText" className="block text-sm text-amber-700 mb-1 font-medium">Komentar</label>
                    <textarea
                      id="commentText"
                      placeholder="Tulis komentar atau doa Anda..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-200 rounded focus:ring focus:ring-amber-200 focus:border-amber-400 focus:outline-none transition-all duration-200 bg-white/80"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className={`px-4 py-2 ${hasSubmittedComment 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 cursor-not-allowed opacity-80' 
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'} 
                          text-white rounded-md transition-all duration-200 flex items-center shadow-sm`}
                      disabled={!userName.trim() || !commentText.trim() || isSubmittingComment || hasSubmittedComment}
                      title={hasSubmittedComment ? "Komentar telah terkirim" : ""}
                    >
                      {isSubmittingComment ? (
                        <div className="flex items-center">
                          <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Mengirim...
                        </div>
                      ) : hasSubmittedComment ? (
                        <>
                          <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                          Terkirim
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Kirim Komentar
                        </>
                      )}
                    </button>
                  </div>
                </form>
                
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <LoadingSpinner />
                  </div>
                ) : comments.length > 0 ? (
                  <div>
                    <h4 className="text-lg font-medium text-amber-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-1.5 text-amber-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.97 20 12 20C10.5286 20 9.14053 19.7105 7.91872 19.1924L3 21L4.59634 16.5518C3.59351 15.2992 3 13.7079 3 12C3 7.58172 7.02944 4 12 4C16.97 4 21 7.58172 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Komentar Terbaru
                    </h4>
                    <div className="space-y-4 mb-6">
                      {comments.map((comment, index) => (
                        <div 
                          key={comment.id} 
                          style={{ 
                            animationDelay: `${index * 0.1}s`,
                            animation: 'fadeInSlideUp 0.5s ease-out forwards',
                            opacity: 0 
                          }}
                        >
                          {renderResponse(comment)}
                        </div>
                      ))}
                    </div>
                    
                    {/* Comment Pagination */}
                    {pagination.commentPagination.totalPages > 1 && (
                      <div className="flex justify-center items-center mt-4">
                        <button
                          onClick={() => {
                            if (prayer && prayer.id) {
                              onCommentPageChange(prayer.id, Math.max(1, pagination.commentPagination.currentPage - 1));
                            } else {
                              console.error('Cannot change page: prayer or prayer.id is undefined');
                            }
                          }}
                          disabled={pagination.commentPagination.currentPage === 1}
                          className="px-3 py-1 mx-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Previous page"
                        >
                          &laquo;
                        </button>
                        
                        {/* Page numbers */}
                        <div className="flex space-x-1">
                          {(() => {
                            const pageNumbers = [];
                            let lastRenderedPage = 0;
                            
                            for (let i = 1; i <= pagination.commentPagination.totalPages; i++) {
                              const isCurrentPage = i === pagination.commentPagination.currentPage;
                              const isFirstPage = i === 1;
                              const isLastPage = i === pagination.commentPagination.totalPages;
                              const isAdjacentToCurrentPage = Math.abs(i - pagination.commentPagination.currentPage) <= 1;
                              
                              if (isCurrentPage || isFirstPage || isLastPage || isAdjacentToCurrentPage) {
                                // Add ellipsis if there's a gap
                                if (i > lastRenderedPage + 1 && lastRenderedPage !== 0) {
                                  pageNumbers.push(
                                    <span key={`ellipsis-${i}`} className="px-2 py-1">
                                      &hellip;
                                    </span>
                                  );
                                }
                                
                                pageNumbers.push(
                                  <button
                                    key={i}
                                    onClick={() => {
                                      if (prayer && prayer.id) {
                                        onCommentPageChange(prayer.id, i);
                                      } else {
                                        console.error('Cannot change page: prayer or prayer.id is undefined');
                                      }
                                    }}
                                    className={`px-3 py-1 rounded ${
                                      i === pagination.commentPagination.currentPage
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                    }`}
                                  >
                                    {i}
                                  </button>
                                );
                                
                                lastRenderedPage = i;
                              }
                            }
                            
                            return pageNumbers;
                          })()}
                        </div>
                        
                        <button
                          onClick={() => {
                            if (prayer && prayer.id) {
                              onCommentPageChange(prayer.id, Math.min(pagination.commentPagination.totalPages, pagination.commentPagination.currentPage + 1));
                            } else {
                              console.error('Cannot change page: prayer or prayer.id is undefined');
                            }
                          }}
                          disabled={pagination.commentPagination.currentPage === pagination.commentPagination.totalPages}
                          className="px-3 py-1 mx-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Next page"
                        >
                          &raquo;
                        </button>
                      </div>
                    )}
                    
                    <div className="text-center mt-2 text-sm text-gray-500">
                      Menampilkan {((pagination.commentPagination.currentPage - 1) * pagination.commentPagination.commentsPerPage) + 1} sampai {Math.min(pagination.commentPagination.currentPage * pagination.commentPagination.commentsPerPage, pagination.commentPagination.totalComments)} dari {pagination.commentPagination.totalComments} komentar
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-amber-50/50 rounded-lg border border-amber-100 shadow-inner">
                    <svg className="w-12 h-12 mx-auto text-amber-200 mb-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.418 16.97 20 12 20C10.5286 20 9.14053 19.7105 7.91872 19.1924L3 21L4.59634 16.5518C3.59351 15.2992 3 13.7079 3 12C3 7.58172 7.02944 4 12 4C16.97 4 21 7.58172 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="text-amber-700">Belum ada komentar untuk doa ini.</p>
                    <p className="text-amber-500 text-sm mt-1">Jadilah yang pertama berkomentar!</p>
                  </div>
                )}
              </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-red-600">Gagal memuat data doa.</p>
              <p className="text-amber-700 mt-2">Doa yang Anda cari mungkin tidak ditemukan atau telah dihapus.</p>
              <button 
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors duration-200"
              >
                Kembali
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>,
    document.body
  );
};

export default PrayerPopup;
