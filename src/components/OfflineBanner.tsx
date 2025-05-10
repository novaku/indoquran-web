'use client';

import React, { useEffect, useState } from 'react';
import offlineStorage from '@/utils/offlineStorage';

export default function OfflineBanner() {
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    // Check if we're offline when component loads
    setIsOfflineMode(offlineStorage.isOffline());

    // Set up event listeners for online/offline status
    const handleOnline = () => setIsOfflineMode(false);
    const handleOffline = () => setIsOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOfflineMode) return null;

  return (
    <div className="bg-amber-100 text-amber-800 p-2 text-center text-sm">
      <span className="inline-block align-middle mr-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </span>
      Anda sedang melihat konten offline. Beberapa fitur mungkin tidak tersedia.
    </div>
  );
}
