'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Prayer, PrayerResponse } from '@/types/prayer';
import { LoadingSpinner } from './LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface PrayerPopupProps { 
  isOpen: boolean; 
  onClose: () => void; 
  prayer: Prayer | null;
  responses: PrayerResponse[];
  isLoading: boolean;
  onSubmitAmiin: (authorName: string) => void;
  onSubmitComment: (authorName: string, content: string, parentId?: number) => void;
  currentUserName?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalComments: number;
    commentsPerPage: number;
  };
  onCommentPageChange?: (prayerId: number, page: number) => void;
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
    currentPage: 1,
    totalPages: 1,
    totalComments: 0,
    commentsPerPage: 10
  },
  onCommentPageChange = (id, page) => {
    console.log(`Default comment page change handler: prayer ${id}, page ${page}`);
  }
}: PrayerPopupProps) => {
  const [commentText, setCommentText] = useState('');
  const [userName, setUserName] = useState(currentUserName);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState<'amiin' | 'comment'>('comment');
  
  // Client-side only mounting check
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    setUserName(currentUserName);
  }, [currentUserName]);

  // Get direct comments (not replies)
  const directResponses = responses.filter(r => r.parentId === null);
  const amiins = directResponses.filter(r => r.responseType === 'amiin');
  const comments = directResponses.filter(r => r.responseType === 'comment');

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
  
  if (!isOpen || !isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto m-4 z-[10000]">
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold text-amber-800">
            Detail Doa
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Tutup"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : prayer ? (
            <div>
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
              
              {/* Tabs */}
              <div className="border-b border-amber-200 mb-6">
                <div className="flex">
                  <button 
                    onClick={() => setActiveTab('amiin')}
                    className={`py-2 px-4 font-medium text-sm ${
                      activeTab === 'amiin' 
                        ? 'text-amber-800 border-b-2 border-amber-500' 
                        : 'text-amber-600 hover:text-amber-800'
                    }`}
                  >
                    Amiin ({amiins.length})
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('comment')}
                    className={`py-2 px-4 font-medium text-sm ${
                      activeTab === 'comment' 
                        ? 'text-amber-800 border-b-2 border-amber-500' 
                        : 'text-amber-600 hover:text-amber-800'
                    }`}
                  >
                    Komentar ({pagination.totalComments})
                  </button>
                </div>
              </div>
              
              {/* Amiin section */}
              {activeTab === 'amiin' && (
                <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
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
              )}
              
              {/* Comments section */}
              {activeTab === 'comment' && (
                <div>
                
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
                
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <LoadingSpinner />
                  </div>
                ) : comments.length > 0 ? (
                  <div>
                    <div className="space-y-4 mb-6">
                      {comments.map(comment => renderResponse(comment))}
                    </div>
                    
                    {/* Comment Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex justify-center items-center mt-4">
                        <button
                          onClick={() => {
                            if (prayer && prayer.id) {
                              onCommentPageChange(prayer.id, Math.max(1, pagination.currentPage - 1));
                            } else {
                              console.error('Cannot change page: prayer or prayer.id is undefined');
                            }
                          }}
                          disabled={pagination.currentPage === 1}
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
                            
                            for (let i = 1; i <= pagination.totalPages; i++) {
                              const isCurrentPage = i === pagination.currentPage;
                              const isFirstPage = i === 1;
                              const isLastPage = i === pagination.totalPages;
                              const isAdjacentToCurrentPage = Math.abs(i - pagination.currentPage) <= 1;
                              
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
                                      i === pagination.currentPage
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
                              onCommentPageChange(prayer.id, Math.min(pagination.totalPages, pagination.currentPage + 1));
                            } else {
                              console.error('Cannot change page: prayer or prayer.id is undefined');
                            }
                          }}
                          disabled={pagination.currentPage === pagination.totalPages}
                          className="px-3 py-1 mx-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Next page"
                        >
                          &raquo;
                        </button>
                      </div>
                    )}
                    
                    <div className="text-center mt-2 text-sm text-gray-500">
                      Showing {((pagination.currentPage - 1) * pagination.commentsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.commentsPerPage, pagination.totalComments)} of {pagination.totalComments} comments
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Belum ada komentar
                  </p>
                )}
              </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <p className="text-red-600">Gagal memuat data doa.</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PrayerPopup;
