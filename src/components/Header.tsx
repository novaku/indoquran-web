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
            <span className={`text-2xl font-bold ${isReadingPage ? 'text-[#5D4037]' : 'text-amber-600'}`}>
              IndoQuran
            </span>
          </Link>
          
          {/* Added footer links to the right side of the header */}
          <div className="hidden md:flex space-x-6">
            <Link 
              href="/tentang" 
              className={`${isReadingPage ? 'text-[#8D6E63] hover:text-[#6D4C41]' : 'text-amber-600 hover:text-amber-800'} text-sm transition-colors`}
            >
              Tentang Kami
            </Link>
            <Link 
              href="/kebijakan-privasi" 
              className={`${isReadingPage ? 'text-[#8D6E63] hover:text-[#6D4C41]' : 'text-amber-600 hover:text-amber-800'} text-sm transition-colors`}
            >
              Kebijakan Privasi
            </Link>
            <Link 
              href="/kontak" 
              className={`${isReadingPage ? 'text-[#8D6E63] hover:text-[#6D4C41]' : 'text-amber-600 hover:text-amber-800'} text-sm transition-colors`}
            >
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
                }`}
              >
                Tentang Kami
              </Link>
              <Link 
                href="/kebijakan-privasi" 
                className={`py-2 px-3 rounded-md ${
                  isReadingPage ? 'text-[#5D4037] hover:bg-[#e8e0ce]' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Kebijakan Privasi
              </Link>
              <Link 
                href="/kontak" 
                className={`py-2 px-3 rounded-md ${
                  isReadingPage ? 'text-[#5D4037] hover:bg-[#e8e0ce]' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Kontak
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}