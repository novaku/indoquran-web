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
                className="text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 transition-colors flex items-center"
              >
                <LazyLoadImage 
                  src="/icons/prayer-icon.svg"
                  alt="Location" 
                  className="w-4 h-4 mr-1"
                  width={16}
                  height={16}
                />
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
