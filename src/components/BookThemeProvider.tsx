'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

interface BookThemeProviderProps {
  children: React.ReactNode;
}

export default function BookThemeProvider({ children }: BookThemeProviderProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  
  // Determine if current page is a reading page (surah or ayat page)
  const isReadingPage = pathname.includes('/surah/') || pathname.includes('/ayat/');
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? isReadingPage 
          ? 'bg-gray-900 text-amber-50'
          : 'bg-gray-900 text-gray-100'
        : isReadingPage 
          ? 'bg-[#f8f4e5] text-[#5D4037]' 
          : 'bg-white text-gray-800'
    }`}>
      {children}
    </div>
  );
}