'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Tooltip from '@/components/Tooltip';
import LazyLoadImage from '@/components/LazyLoadImage';

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
    <footer className="fixed bottom-0 left-0 right-0 bg-[#f8f4e5] border-t border-[#d3c6a6] py-2 sm:py-3 px-1 z-40 shadow-md">
      <div className="w-full px-1 sm:px-2">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-[1920px] mx-auto">
          <div className="mb-2 md:mb-0">
            <p className="text-[#5D4037] text-xs sm:text-sm">
              © {new Date().getFullYear()} IndoQuran - Al-Quran Digital Bahasa Indonesia
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <Link href="/donasi" className="text-amber-700 hover:text-amber-900 transition-colors flex items-center mr-2 sm:mr-4">
              <LazyLoadImage 
                src="/icons/donasi-icon.svg" 
                alt="Donasi" 
                className="w-4 h-4 mr-1"
                width={16}
                height={16}
              />
              Donasi
            </Link>
            <Tooltip text={useAutoLocation ? 'Beralih ke lokasi default (Jakarta)' : 'Deteksi lokasi otomatis'} position="top">
              <button 
                onClick={toggleLocationPreference}
                className="text-amber-700 hover:text-amber-900 transition-colors flex items-center text-xs sm:text-sm"
              >
                {/* Replace with Google Maps-like location icon */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-4 h-4 mr-1"
                  width={16}
                  height={16}
                >
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span className="hidden xs:inline">
                  {useAutoLocation ? 'Gunakan Lokasi Default' : 'Gunakan Lokasi Otomatis'}
                </span>
                <span className="inline xs:hidden">
                  {useAutoLocation ? 'Lok. Default' : 'Lok. Otomatis'}
                </span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
