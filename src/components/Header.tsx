'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuIcon, XIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Determine if current page is a reading page (surah or ayat page)
  const isReadingPage = pathname.includes('/surah/') || pathname.includes('/ayat/');

  useEffect(() => {
    // Close menu when route changes
    setIsMenuOpen(false);
  }, [pathname]);

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
          
          {/* Added footer links to the right side of the header */}
          <div className="hidden md:flex space-x-6">
            <Link 
              href="/tentang" 
              className={`${isReadingPage ? 'text-[#8D6E63] hover:text-[#6D4C41]' : 'text-amber-600 hover:text-amber-800'} text-sm transition-colors flex items-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              Tentang Kami
            </Link>
            <Link 
              href="/kebijakan-privasi" 
              className={`${isReadingPage ? 'text-[#8D6E63] hover:text-[#6D4C41]' : 'text-amber-600 hover:text-amber-800'} text-sm transition-colors flex items-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Kebijakan Privasi
            </Link>
            <Link 
              href="/kontak" 
              className={`${isReadingPage ? 'text-[#8D6E63] hover:text-[#6D4C41]' : 'text-amber-600 hover:text-amber-800'} text-sm transition-colors flex items-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Kontak
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md focus:outline-none ${
                isReadingPage 
                  ? 'text-[#5D4037] hover:bg-[#e8e0ce]' 
                  : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              {isMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className={`md:hidden mt-4 py-2 border-t ${
            isReadingPage ? 'border-[#d3c6a6]' : 'border-gray-200'
          }`}>
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/tentang" 
                className={`py-2 px-3 rounded-md ${
                  isReadingPage ? 'text-[#5D4037] hover:bg-[#e8e0ce]' : 'text-gray-700 hover:bg-gray-100'
                } flex items-center`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                Tentang Kami
              </Link>
              <Link 
                href="/kebijakan-privasi" 
                className={`py-2 px-3 rounded-md ${
                  isReadingPage ? 'text-[#5D4037] hover:bg-[#e8e0ce]' : 'text-gray-700 hover:bg-gray-100'
                } flex items-center`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Kebijakan Privasi
              </Link>
              <Link 
                href="/kontak" 
                className={`py-2 px-3 rounded-md ${
                  isReadingPage ? 'text-[#5D4037] hover:bg-[#e8e0ce]' : 'text-gray-700 hover:bg-gray-100'
                } flex items-center`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Kontak
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}