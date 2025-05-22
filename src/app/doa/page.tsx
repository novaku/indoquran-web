'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PrayerCard, PrayerDetail, CreatePrayerForm } from '@/components/PrayerComponents';
import PrayerPopup from '@/components/PrayerPopup';
import { Prayer, PrayerResponse, PaginatedPrayerResponse } from '@/types/prayer';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { DramaticDoaHeader } from '@/components/DramaticDoaHeader';
import { getDoaImageByHash } from '@/lib/doaImages';

export default function PrayerPage() {
  const { data: session } = useSession();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPrayers, setTotalPrayers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [isPageSizeChanging, setIsPageSizeChanging] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [prayerResponses, setPrayerResponses] = useState<PrayerResponse[]>([]);
  const [loadingPrayerDetail, setLoadingPrayerDetail] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [paginationData, setPaginationData] = useState({
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
  });

  const fetchPrayers = async (page = currentPage, limit = itemsPerPage, sort = sortBy) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/prayers?page=${page}&limit=${limit}&sortBy=${sort}`);
      const data = await res.json();
      
      if (data.success && Array.isArray(data.prayers)) {
        console.log('Prayers data:', data.prayers);
        setPrayers(data.prayers);
        setTotalPages(data.totalPages || 1);
        setTotalPrayers(data.totalPrayers || 0);
      } else {
        console.error('Invalid response format:', data);
        setPrayers([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching prayers:', error);
      setPrayers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrayerDetail = async (id: number, commentPage: number = 1, amiinPage: number = 1) => {
    setLoadingPrayerDetail(true);
    try {
      const res = await fetch(`/api/prayers/${id}?commentPage=${commentPage}&commentsPerPage=10&amiinPage=${amiinPage}&amiinsPerPage=20`);
      
      if (!res.ok) {
        console.error(`Error fetching prayer detail: Server responded with ${res.status} ${res.statusText}`);
        return;
      }
      
      const data = await res.json();
      
      if (data && data.success === true && data.data) {
        setSelectedPrayer(data.data.prayer);
        // Combine comments and amiins into a single responses array for backward compatibility
        const allResponses = [
          ...(data.data.comments || []), 
          ...(data.data.amiins || [])
        ];
        setPrayerResponses(allResponses);
        setPaginationData(data.data.pagination || {
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
        });
        setShowPopup(true); // Show the popup after data is loaded
      } else {
        console.error('Error fetching prayer detail: Invalid response format', data);
      }
    } catch (error) {
      console.error('Error fetching prayer detail:', error);
    } finally {
      setLoadingPrayerDetail(false);
    }
  };

  useEffect(() => {
    // On mount, read pagination from URL if present
    const params = new URLSearchParams(window.location.search);
    const pageParam = parseInt(params.get('page') || '1', 10);
    const limitParam = parseInt(params.get('limit') || String(itemsPerPage), 10);
    const sortParam = params.get('sortBy') || sortBy;
    setCurrentPage(pageParam);
    setItemsPerPage(limitParam);
    setSortBy(sortParam);
    fetchPrayers(pageParam, limitParam, sortParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreatePrayer = async (authorName: string, content: string) => {
    try {
      const res = await fetch('/api/prayers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authorName, content }),
      });

      if (res.ok) {
        // Refresh the prayer list and go back to first page
        setCurrentPage(1);
        fetchPrayers();
      }
    } catch (error) {
      console.error('Error creating prayer:', error);
    }
  };

  const handleSubmitAmiin = async (authorName: string): Promise<void> => {
    if (!selectedPrayer) return;
    
    try {
      const response = await fetch(`/api/prayers/${selectedPrayer.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorName,
          content: 'Amiin',
          responseType: 'amiin',
          prayerId: selectedPrayer.id
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error submitting amiin:', response.status, errorData.message || 'Unknown error');
        
        // Let the error bubble up to be handled by the PrayerPopup component
        if (response.status === 404) {
          throw new Error('Doa tidak ditemukan atau telah dihapus.');
        } else {
          throw new Error(errorData.message || 'Gagal menambahkan Amiin.');
        }
      }

      // Refresh the prayer detail, preserving current pages for both comment and amiin
      fetchPrayerDetail(
        selectedPrayer.id, 
        paginationData.commentPagination.currentPage, 
        paginationData.amiinPagination.currentPage
      );
      
      // If successful, update the prayer data to reflect the user's amiin submission
      if (selectedPrayer) {
        setSelectedPrayer({
          ...selectedPrayer,
          currentUserSaidAmiin: true,
          amiinCount: (selectedPrayer.amiinCount || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error submitting amiin:', error);
      throw error; // Re-throw to be handled by the component
    }
  };

  const handleSubmitComment = async (authorName: string, content: string, parentId?: number) => {
    if (!selectedPrayer) return;
    
    try {
      const response = await fetch(`/api/prayers/${selectedPrayer.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorName,
          content,
          responseType: 'comment',
          prayerId: selectedPrayer.id,
          parentId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error submitting comment:', response.status, errorData.message || 'Unknown error');
        
        // Let the error bubble up to be handled by the PrayerPopup component
        if (response.status === 404) {
          throw new Error('Doa tidak ditemukan atau telah dihapus.');
        } else {
          throw new Error(errorData.message || 'Gagal menambahkan komentar.');
        }
      }

      // Refresh the prayer detail - go to first page after new comment
      fetchPrayerDetail(selectedPrayer.id, 1);
    } catch (error) {
      console.error('Error submitting comment:', error);
      throw error; // Re-throw to be handled by the component
    }
  };
  
  const handleCommentPageChange = (prayerId: number, page: number) => {
    console.log(`Changing to comment page ${page} for prayer ${prayerId}`);
    fetchPrayerDetail(prayerId, page, paginationData.amiinPagination.currentPage);
  };
  
  const handleAmiinPageChange = (prayerId: number, page: number) => {
    console.log(`Changing to amiin page ${page} for prayer ${prayerId}`);
    fetchPrayerDetail(prayerId, paginationData.commentPagination.currentPage, page);
  };

  const handleViewPrayer = (id: number) => {
    fetchPrayerDetail(id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Update URL with GET params for pagination
    const params = new URLSearchParams(window.location.search);
    params.set('page', String(page));
    params.set('limit', String(itemsPerPage));
    params.set('sortBy', sortBy);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    fetchPrayers(page, itemsPerPage, sortBy);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: number) => {
    setLoading(true); // Show loading indicator
    setIsPageSizeChanging(true); // Trigger the animation
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
    // Update URL with GET params for pagination
    const params = new URLSearchParams(window.location.search);
    params.set('page', '1');
    params.set('limit', String(value));
    params.set('sortBy', sortBy);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    fetchPrayers(1, value, sortBy);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Reset animation state after delay
    setTimeout(() => {
      setIsPageSizeChanging(false);
    }, 1500);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedPrayer(null);
    setPrayerResponses([]);
    fetchPrayers(); // Refresh the list to get updated counts
  };

  const renderPagination = () => {
    if (totalPages <= 1) {
      return null; // Don't render pagination if there's only one page
    }
    
    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // First page button if not in view
    if (startPage > 1) {
      pages.push(
        <button
          key="first"
          onClick={() => handlePageChange(1)}
          className="px-3 py-1.5 rounded-md bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 shadow-sm"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-2 py-1 text-amber-500">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3.5 py-1.5 mx-0.5 rounded-md shadow-md transition-all ${
            currentPage === i
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white transform scale-105'
              : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50 hover:border-amber-300'
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page button if not in view
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2 py-1 text-amber-500">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key="last"
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1.5 rounded-md bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 shadow-sm"
        >
          {totalPages}
        </button>
      );
    }

    return (
      <div className="flex flex-wrap justify-center items-center space-x-1">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-md bg-white border border-amber-200 text-amber-800 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center"
          aria-label="Previous page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="flex items-center">
          {pages}
        </div>
        
        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-md bg-white border border-amber-200 text-amber-800 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center"
          aria-label="Next page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <main className="w-full px-3 sm:px-4 py-4 sm:py-8 bg-gradient-to-b from-[#f8f4e5] to-white text-[#5D4037]">
      {/* Dramatic Header with rotating background images */}
      <DramaticDoaHeader 
        title="Doa Bersama" 
        subtitle="Bagikan doa Anda dan berikan dukungan kepada sesama dalam kebersamaan yang penuh makna"
      />
      
      <div className="bg-gradient-to-br from-white to-amber-50 backdrop-blur-sm rounded-xl overflow-hidden border border-amber-300 shadow-xl mb-8">
        <div className="px-6 py-8 md:p-8">
          <div className="w-full mx-auto">
            
            <CreatePrayerForm
              onSubmit={handleCreatePrayer}
              currentUserName={session?.user?.name || ''}
            />

            <div className="mb-8 relative">
              {/* Decorative line */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-px bg-gradient-to-r from-amber-300/0 via-amber-300 to-amber-300/0"></div>
              
              {/* Header with decorative elements */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
                <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-md border border-amber-200">
                  <img 
                    src="/icons/prayer-icon.svg" 
                    alt="Prayer Icon"
                    className="w-6 h-6 text-amber-600 mr-3"
                  />
                  <h2 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
                    Doa dari Jamaah
                  </h2>
                </div>
                
                <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-md border border-amber-200">
                  <label htmlFor="sortBy" className="text-sm text-amber-700 font-medium mr-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    Urutkan:
                  </label>
                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                      // Update URL with GET params for sort change
                      const params = new URLSearchParams(window.location.search);
                      params.set('page', '1');
                      params.set('limit', String(itemsPerPage));
                      params.set('sortBy', e.target.value);
                      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
                      fetchPrayers(1, itemsPerPage, e.target.value);
                    }}
                    className="border border-amber-200 rounded px-3 py-1.5 text-sm bg-amber-50 focus:border-amber-400 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="oldest">Terlama</option>
                    <option value="most_amiin">Terbanyak Amiin</option>
                    <option value="most_comments">Terbanyak Komentar</option>
                    <option value="recent_activity">Aktivitas Terbaru</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner />
                <p className="text-amber-600 mt-4 animate-pulse">Memuat doa...</p>
              </div>
            ) : prayers && prayers.length > 0 ? (
              <div className="space-y-2">
                {prayers.map((prayer, index) => (
                  <div 
                    key={prayer.id} 
                    className="prayer-card-container transform transition-all duration-300 hover:scale-[1.01]"
                    style={{"--order": index} as React.CSSProperties}
                  >
                    <div className="shimmer absolute inset-0 z-0"></div>
                    <PrayerCard
                      prayer={prayer}
                      onViewDetails={handleViewPrayer}
                    />
                  </div>
                ))}

                {prayers && prayers.length > 0 && (
                  <div className="mt-8 pt-4 border-t border-amber-200">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="w-full md:w-auto">
                        <div className="mb-2 text-center md:text-left text-sm text-amber-700">
                          <span className="font-medium">{totalPrayers}</span> doa ditemukan
                        </div>
                        <div className="pagination-container">
                          {renderPagination()}
                        </div>
                      </div>
                      <div className={`flex items-center bg-white px-3 py-2 rounded-lg shadow-md border border-amber-200 transition-all duration-300 hover:shadow-lg hover:border-amber-300 animate-floatUp ${isPageSizeChanging ? 'page-size-change' : ''}`}>
                        <label htmlFor="itemsPerPage" className="text-sm text-amber-700 font-medium mr-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                          </svg>
                          <span className="bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">Per halaman:</span>
                        </label>
                        <select
                          id="itemsPerPage"
                          value={itemsPerPage}
                          onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value, 10))}
                          className="border border-amber-200 rounded px-3 py-1.5 text-sm bg-gradient-to-r from-amber-50 to-amber-100 focus:border-amber-400 focus:ring focus:ring-amber-200 focus:ring-opacity-50 transition-all duration-200 hover:from-amber-100 hover:to-amber-200"
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="15">15</option>
                          <option value="20">20</option>
                          <option value="25">25</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-100 via-amber-200 to-amber-50 border-4 border-amber-200 shadow-lg flex items-center justify-center">
                    <svg className="w-16 h-16 text-amber-400" viewBox="0 0 512 512" fill="currentColor">
                      <path d="M400 192c8.836 0 16-7.164 16-16v-27.96c0-48.53-39.47-88-88-88h-17.12c-10.39 0-19.98-6.512-23.61-16.56-4.445-12.33-16.24-20.6-29.59-20.32-13.08.2949-24.29 9.109-27.8 21.42-1.834 6.439-5.164 12.37-9.621 17.29-11.58 12.74-28.1 19.06-44.55 16.8-33.44-4.445-58.44-33.14-58.74-66.74C117 .6602 105.5-4.893 96.26 3.754 73.22 24.81 48.97 44.64 29.35 69.99c-73.41 94.9 15.25 209 118.9 208.1 19.31-.1914 36.94-4.492 53.22-12.42c9.338-4.367 20.28-1.912 27.25 5.701c9.254 9.969 9.273 25.39-.0039 35.38C205.7 331 174.2 344.6 138.8 346.3c-13.9 .7383-24.29 12.84-23.56 26.73c.7383 13.9 12.86 24.16 26.74 23.56c46.75-2.438 89.47-21.73 120.9-55.61c10.83 18.7 24.88 35.23 41.28 48.75c7.723 6.348 19.13 5.211 25.48-2.516c6.348-7.723 5.211-19.13-2.516-25.48c-41.13-33.84-60.1-93.55-48-149.7c.7832-3.648 3.309-6.426 7.053-7.625C334.8 191.4 367.3 192 400 192zM368 48c-13.23 0-24 10.77-24 24S354.8 96 368 96c13.23 0 24-10.77 24-24S381.2 48 368 48z"/>
                    </svg>
                  </div>
                </div>
                <p className="text-gray-600 text-lg">Belum ada doa yang dibagikan.</p>
                <p className="text-amber-700 font-medium mt-2">Jadilah yang pertama berbagi doa Anda!</p>
                <div className="mt-6">
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-md hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-sm flex items-center mx-auto"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M12 5L18 11M12 5L6 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Tulis Doa Sekarang
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prayer Popup */}
      <PrayerPopup
        isOpen={showPopup}
        onClose={handleClosePopup}
        prayer={selectedPrayer}
        responses={prayerResponses}
        isLoading={loadingPrayerDetail}
        onSubmitAmiin={handleSubmitAmiin}
        onSubmitComment={handleSubmitComment}
        currentUserName={session?.user?.name || ''}
        pagination={paginationData}
        onCommentPageChange={handleCommentPageChange}
        onAmiinPageChange={handleAmiinPageChange}
      />
    </main>
  );
}
