'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuIcon, XIcon, ChevronDownIcon, ChevronUpIcon, UserIcon, LogInIcon, LogOutIcon, Sun, Moon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Tooltip from '@/components/Tooltip';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, logout, loading, user } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  
  // Determine if current page is a reading page (surah or ayat page)
  const isReadingPage = pathname.includes('/surah/') || pathname.includes('/ayat/');

  useEffect(() => {
    // Close both dropdowns when route changes
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);
  
  // Create refs for both dropdown menus
  const mainMenuRef = useRef<HTMLDivElement>(null);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close user menu if clicking outside the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      
      // Close main menu if clicking outside the dropdown
      if (mainMenuRef.current && !mainMenuRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
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
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      )
    },
    {
      href: '/kebijakan-privasi',
      label: 'Kebijakan Privasi',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      )
    },
    {
      href: '/kontak',
      label: 'Kontak',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      )
    }
  ];

  return (
    <header className={`sticky top-0 z-30 w-full transition-all duration-300 ${
      isReadingPage 
        ? 'bg-[#f8f4e5] text-[#5D4037] border-b border-[#d3c6a6]' 
        : 'bg-white text-gray-800 shadow-md'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${isReadingPage ? 'text-[#5D4037]' : 'text-amber-600'}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span className={`text-2xl font-bold ${isReadingPage ? 'text-[#5D4037]' : 'text-amber-600'}`}>
              IndoQuran
            </span>
          </Link>
          
          <div className="flex items-center space-x-2">
            {/* Main navigation dropdown menu */}            <div className="relative" ref={mainMenuRef}>
              <Tooltip text="Menu Navigasi">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    isReadingPage
                      ? 'text-[#8D6E63] hover:text-[#6D4C41] hover:bg-[#e8e0ce]' 
                      : 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                  }`}
                  aria-expanded={isDropdownOpen}
                  aria-label="Toggle menu"
                >
                  <span className="mr-1">Menu</span>
                  {isDropdownOpen ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </button>
              </Tooltip>
              
              {isDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-64 sm:w-56 rounded-md shadow-lg p-2 z-40 animate-fadeIn ${
                  isReadingPage ? 'bg-[#f8f4e5] border border-[#d3c6a6]' : 'bg-white border border-gray-200'
                }`}>
                  <div className="py-1">
                    {menuItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className={`flex items-center px-4 py-2 text-sm rounded-md ${
                          isReadingPage 
                            ? 'text-[#5D4037] hover:bg-[#e8e0ce]' 
                            : 'text-gray-700 hover:bg-amber-50'
                        }`}
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* User management dropdown menu */}
            <div className="relative" ref={dropdownRef}>
              <Tooltip text="Menu Akun Pengguna">
                <button 
                  onClick={() => {
                    // Only toggle user menu when the main menu is closed
                    if (isDropdownOpen) setIsDropdownOpen(false);
                    setIsMenuOpen(!isMenuOpen);
                  }}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    isReadingPage 
                      ? 'text-[#8D6E63] hover:text-[#6D4C41] hover:bg-[#e8e0ce]' 
                      : 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                  }`}
                  aria-expanded={isMenuOpen}
                  aria-label="Toggle user menu"
                >
                  <UserIcon className="h-5 w-5 mr-1 flex-shrink-0" />
                  {isAuthenticated && !loading && user ? (
                    <span className="mr-1 truncate max-w-[120px] hidden sm:inline-block">{user.email}</span>
                  ) : (
                    <span className="mr-1">Akun</span>
                  )}
                  {isMenuOpen ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </button>
              </Tooltip>
              
              {isMenuOpen && (
                <div className={`absolute right-0 mt-2 w-64 sm:w-72 rounded-md shadow-lg p-2 z-40 animate-fadeIn ${
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
                          <UserIcon className="w-5 h-5 mr-2" />
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
                          <LogOutIcon className="w-5 h-5 mr-2" />
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
                        <LogInIcon className="w-5 h-5 mr-2" />
                        Masuk
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* We can remove the mobile menu button since we now have a dropdown menu that works on all screen sizes */}
        </div>
      </div>
    </header>
  );
}