'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PrayerCard, PrayerDetail, CreatePrayerForm } from '@/components/PrayerComponents';
import { Prayer, PrayerResponse, PaginatedPrayerResponse } from '@/types/prayer';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function PrayerPage() {
  const { data: session } = useSession();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [prayerResponses, setPrayerResponses] = useState<PrayerResponse[]>([]);
  const [loadingPrayerDetail, setLoadingPrayerDetail] = useState(false);

  const fetchPrayers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/prayers?page=${currentPage}&limit=10&sortBy=${sortBy}`);
      const data = await res.json();
      
      if (data.success && Array.isArray(data.prayers)) {
        setPrayers(data.prayers);
        setTotalPages(data.totalPages || 1);
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

  const fetchPrayerDetail = async (id: number) => {
    setLoadingPrayerDetail(true);
    try {
      const res = await fetch(`/api/prayers/${id}`);
      const data = await res.json();
      setSelectedPrayer(data.prayer);
      setPrayerResponses(data.responses);
    } catch (error) {
      console.error('Error fetching prayer detail:', error);
    } finally {
      setLoadingPrayerDetail(false);
    }
  };

  useEffect(() => {
    fetchPrayers();
  }, [currentPage, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleSubmitAmiin = async (authorName: string) => {
    if (!selectedPrayer) return;
    
    try {
      await fetch(`/api/prayers/${selectedPrayer.id}`, {
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

      // Refresh the prayer detail
      fetchPrayerDetail(selectedPrayer.id);
    } catch (error) {
      console.error('Error submitting amiin:', error);
    }
  };

  const handleSubmitComment = async (authorName: string, content: string, parentId?: number) => {
    if (!selectedPrayer) return;
    
    try {
      await fetch(`/api/prayers/${selectedPrayer.id}`, {
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

      // Refresh the prayer detail
      fetchPrayerDetail(selectedPrayer.id);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleViewPrayer = (id: number) => {
    fetchPrayerDetail(id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedPrayer(null);
    setPrayerResponses([]);
    fetchPrayers(); // Refresh the list to get updated counts
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i
              ? 'bg-amber-500 text-white'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center mt-6">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 mx-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &laquo;
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 mx-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &raquo;
        </button>
      </div>
    );
  };

  return (
    <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 bg-[#f8f4e5] text-[#5D4037]">
      <div className="bg-white rounded-xl overflow-hidden border border-amber-200 shadow-lg mb-8">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-800 mb-6 text-center">
              Halaman Doa Bersama
            </h1>
            <p className="text-center text-gray-700 mb-8">
              Bagikan doa Anda dan berikan dukungan kepada sesama. 
              Mari mendoakan satu sama lain dan mengucapkan &quot;Amiin&quot; untuk doa-doa yang telah dibagikan.
            </p>

            {selectedPrayer ? (
              loadingPrayerDetail ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <PrayerDetail
                  prayer={selectedPrayer}
                  responses={prayerResponses}
                  onSubmitAmiin={handleSubmitAmiin}
                  onSubmitComment={handleSubmitComment}
                  currentUserName={session?.user?.name || ''}
                  onBack={handleBackToList}
                />
              )
            ) : (
              <>
                <CreatePrayerForm
                  onSubmit={handleCreatePrayer}
                  currentUserName={session?.user?.name || ''}
                />

                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-amber-800">
                    Doa dari Jamaah
                  </h2>
                  
                  <div className="flex items-center">
                    <label htmlFor="sortBy" className="text-sm text-gray-600 mr-2">
                      Urutkan:
                    </label>
                    <select
                      id="sortBy"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-amber-200 rounded px-2 py-1 text-sm"
                    >
                      <option value="newest">Terbaru</option>
                      <option value="oldest">Terlama</option>
                      <option value="most_amiin">Terbanyak Amiin</option>
                      <option value="most_comments">Terbanyak Komentar</option>
                      <option value="recent_activity">Aktivitas Terbaru</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : prayers && prayers.length > 0 ? (
                  <div className="space-y-4">
                    {prayers.map((prayer) => (
                      <PrayerCard
                        key={prayer.id}
                        prayer={prayer}
                        onViewDetails={handleViewPrayer}
                      />
                    ))}

                    {totalPages > 1 && renderPagination()}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <p>Belum ada doa yang dibagikan.</p>
                    <p>Jadilah yang pertama berbagi doa Anda!</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
