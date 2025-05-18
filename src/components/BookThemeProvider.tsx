'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

interface BookThemeProviderProps {
  children: React.ReactNode;
}

export default function BookThemeProvider({ children }: BookThemeProviderProps) {
  const pathname = usePathname();
  
  // Determine if current page is a reading page (surah or ayat page)
  const isReadingPage = pathname.includes('/surah/') || pathname.includes('/ayat/');
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isReadingPage 
        ? 'bg-[#f8f4e5] text-[#5D4037]' 
        : 'bg-white text-gray-800'
    }`}>
      {children}
    </div>
  );
}