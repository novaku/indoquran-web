'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Tooltip from '@/components/Tooltip';

const Footer: React.FC = () => {
  const [useAutoLocation, setUseAutoLocation] = useState<boolean>(true);
  
  useEffect(() => {
    // Load user preference from localStorage if available
    const storedPreference = localStorage.getItem('useAutoLocation');
    if (storedPreference !== null) {
      setUseAutoLocation(storedPreference === 'true');
    }
  }, []);
  
  const toggleLocationPreference = () => {
    const newValue = !useAutoLocation;
    setUseAutoLocation(newValue);
    localStorage.setItem('useAutoLocation', newValue.toString());
    // Dispatch custom event for prayer widget to listen to
    window.dispatchEvent(new CustomEvent('locationPreferenceChanged', { 
      detail: { useAutoLocation: newValue } 
    }));
  };
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#f8f4e5] dark:bg-gray-900 border-t border-[#d3c6a6] dark:border-gray-700 py-3 px-4 z-40 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-2 md:mb-0">
            <p className="text-[#5D4037] dark:text-gray-200 text-sm">
              © {new Date().getFullYear()} IndoQuran - Al-Quran Digital Bahasa Indonesia
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/donasi" className="text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 transition-colors flex items-center mr-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-4 h-4 mr-1"
              >
                <path d="M12,2 C17.5228475,2 22,6.4771525 22,12 C22,17.5228475 17.5228475,22 12,22 C6.4771525,22 2,17.5228475 2,12 C2,6.4771525 6.4771525,2 12,2 Z M11,8 L11,6 L13,6 L13,8 L15.75,8 C16.1642136,8 16.5,8.33578644 16.5,8.75 L16.5,16.25 C16.5,16.6642136 16.1642136,17 15.75,17 L8.25,17 C7.83578644,17 7.5,16.6642136 7.5,16.25 L7.5,8.75 C7.5,8.33578644 7.83578644,8 8.25,8 L11,8 Z" />
              </svg>
              Donasi
            </Link>
            <Tooltip text={useAutoLocation ? 'Beralih ke lokasi default (Jakarta)' : 'Deteksi lokasi otomatis'} position="top">
              <button 
                onClick={toggleLocationPreference}
                className="text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 transition-colors flex items-center"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-4 h-4 mr-1"
                >
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                {useAutoLocation ? 'Gunakan Lokasi Default' : 'Gunakan Lokasi Otomatis'}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
