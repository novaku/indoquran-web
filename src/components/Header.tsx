'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import LazyLoadImage from '@/components/LazyLoadImage';
import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Tooltip from '@/components/Tooltip';
import Sidebar from '@/components/Sidebar';

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, logout, loading, user } = useAuthContext();
  const { showToast } = useToast();
  
  // Determine if current page is a reading page (surah or ayat page)
  const isReadingPage = pathname.includes('/surah/') || pathname.includes('/ayat/');

  useEffect(() => {
    // Close dropdowns when route changes
    setIsMenuOpen(false);
  }, [pathname]);
  
  // Create ref for user dropdown menu
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close user menu if clicking outside the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    {
      href: '/tentang',
      label: 'Tentang Kami',
      icon: (
        <LazyLoadImage src="/icons/tentang-icon.svg" alt="Tentang Kami" width={20} height={20} className="w-5 h-5 mr-2" />
      )
    },
    {
      href: '/doa',
      label: 'Doa Bersama',
      icon: (
        <LazyLoadImage src="/icons/doa-icon.svg" alt="Doa Bersama" width={20} height={20} className="w-5 h-5 mr-2" />
      )
    },
    {
      href: '/donasi',
      label: 'Donasi',
      icon: (
        <LazyLoadImage src="/icons/donasi-icon.svg" alt="Donasi" width={20} height={20} className="w-5 h-5 mr-2" />
      )
    },
    {
      href: '/kontak',
      label: 'Kontak',
      icon: (
        <LazyLoadImage src="/icons/kontak-icon.svg" alt="Kontak" width={20} height={20} className="w-5 h-5 mr-2" />
      )
    }
  ];

  return (
    <>
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        menuItems={menuItems} 
      />
      
      <header className={`sticky top-0 z-30 w-full transition-all duration-300 ${
        isReadingPage 
          ? 'bg-[#f8f4e5] text-[#5D4037] border-b border-[#d3c6a6]'
          : 'bg-white text-gray-800 shadow-md'
      }`}>
        <div className="w-full px-1 sm:px-2 py-4">
          <div className="flex items-center justify-between max-w-[1920px] mx-auto">
            <div className="flex items-center">
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`mr-1 sm:mr-2 p-1 sm:p-2 rounded-md ${
                  isReadingPage
                    ? 'text-[#8D6E63] hover:text-[#6D4C41] hover:bg-[#e8e0ce]' 
                    : 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                }`}
                aria-label="Open sidebar menu"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="h-6 w-6"
                >
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              
              <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
                <LazyLoadImage 
                  src="/icons/home-icon.svg" 
                  alt="Home" 
                  width={24}
                  height={24}
                  className="w-6 h-6" 
                />
                <span className={`text-xl sm:text-2xl font-bold ${isReadingPage ? 'text-[#5D4037]' : 'text-amber-600'}`}>
                  IndoQuran
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* User management dropdown menu */}
              <div className="relative" ref={dropdownRef}>
                <Tooltip text="Menu Akun Pengguna">
                  <button 
                    onClick={() => {
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    className={`flex items-center px-2 sm:px-3 py-2 rounded-md transition-colors ${
                      isReadingPage 
                        ? 'text-[#8D6E63] hover:text-[#6D4C41] hover:bg-[#e8e0ce]' 
                        : 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                    }`}
                    aria-expanded={isMenuOpen}
                    aria-label="Toggle user menu"
                  >
                    <LazyLoadImage src="/icons/profile-icon.svg" alt="User Account" width={20} height={20} className="h-5 w-5 mr-1 flex-shrink-0" />
                    {isAuthenticated && !loading && user ? (
                      <span className="mr-1 truncate max-w-[120px] hidden sm:inline-block">{user.email}</span>
                    ) : (
                      <span className="mr-1">Akun</span>
                    )}
                    {isMenuOpen ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </Tooltip>
                
                {isMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-56 sm:w-64 md:w-72 rounded-md shadow-lg p-2 z-40 animate-fadeIn ${
                    isReadingPage ? 'bg-[#f8f4e5] border border-[#d3c6a6]' : 'bg-white border border-gray-200'
                  }`}>
                    <div className="py-1">
                      {!loading && (isAuthenticated && user ? (
                        <>
                          {/* Display user email in dropdown */}
                          <div className={`px-4 py-2 mb-1 text-sm font-medium border-b ${
                            isReadingPage ? 'border-[#d3c6a6] text-[#5D4037]' : 'border-gray-100 text-gray-700'
                          }`}>
                            <div className="truncate">{user.email}</div>
                          </div>
                          <Link
                            href="/profile"
                            className={`flex items-center px-4 py-2 text-sm rounded-md ${
                              isReadingPage 
                                ? 'text-[#5D4037] hover:bg-[#e8e0ce]' 
                                : 'text-gray-700 hover:bg-amber-50'
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <LazyLoadImage src="/icons/profile-icon.svg" alt="Profile" width={20} height={20} className="w-5 h-5 mr-2" />
                            Profil
                          </Link>
                          <button
                            onClick={() => {
                              logout();
                              setIsMenuOpen(false);
                            }}
                            className={`flex items-center px-4 py-2 text-sm rounded-md w-full text-left ${
                              isReadingPage 
                                ? 'text-[#5D4037] hover:bg-[#e8e0ce]' 
                                : 'text-gray-700 hover:bg-amber-50'
                            }`}
                          >
                            <LazyLoadImage src="/icons/login-icon.svg" alt="Logout" width={20} height={20} className="w-5 h-5 mr-2 transform rotate-180" />
                            Keluar
                          </button>
                        </>
                      ) : (
                        <Link
                          href="/login"
                          className={`flex items-center px-4 py-2 text-sm rounded-md ${
                            isReadingPage 
                              ? 'text-[#5D4037] hover:bg-[#e8e0ce]' 
                              : 'text-gray-700 hover:bg-amber-50'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <LazyLoadImage src="/icons/login-icon.svg" alt="Login" width={20} height={20} className="w-5 h-5 mr-2" />
                          Masuk
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}