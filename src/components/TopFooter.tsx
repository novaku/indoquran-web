'use client';

import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';

export const TopFooter = () => {
  const { isAuthenticated, user, logout, loading } = useAuthContext();
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-sm border-t border-amber-200 shadow-lg shadow-amber-100/20 py-3 px-4 z-40">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link 
            href="/" 
            className="text-amber-600 hover:text-amber-800 transition-colors px-3 py-1.5 rounded-md hover:bg-amber-50"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Beranda
            </div>
          </Link>
          <Link 
            href="/tentang" 
            className="text-amber-600 hover:text-amber-800 transition-colors px-3 py-1.5 rounded-md hover:bg-amber-50"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Tentang
            </div>
          </Link>
          {!loading && (isAuthenticated ? (
            <>
              <Link 
                href="/profile" 
                className="text-amber-600 hover:text-amber-800 transition-colors px-3 py-1.5 rounded-md hover:bg-amber-50"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Profil
                </div>
              </Link>
              <button
                onClick={() => logout()}
                className="text-amber-600 hover:text-amber-800 transition-colors px-3 py-1.5 rounded-md hover:bg-amber-50"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 5a1 1 0 00-1-1H6a1 1 0 00-1 1v6a1 1 0 001 1h3a1 1 0 001-1V8z" clipRule="evenodd" />
                    <path d="M11.293 9.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L12.586 14H7a1 1 0 010-2h5.586l-1.293-1.293a1 1 0 010-1.414z" />
                  </svg>
                  Keluar
                </div>
              </button>
            </>
          ) : (
            <Link 
              href="/login" 
              className="text-amber-600 hover:text-amber-800 transition-colors px-3 py-1.5 rounded-md hover:bg-amber-50"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 5a1 1 0 00-1-1H6a1 1 0 00-1 1v6a1 1 0 001 1h3a1 1 0 001-1V8z" clipRule="evenodd" />
                  <path d="M8.707 10.707a1 1 0 010-1.414l3-3a1 1 0 111.414 1.414L11.414 9H17a1 1 0 110 2h-5.586l1.707 1.707a1 1 0 01-1.414 1.414l-3-3z" />
                </svg>
                Masuk
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-amber-700 text-sm">
          © {new Date().getFullYear()} Al-Quran Indonesia
        </div>
      </div>
    </footer>
  );
};