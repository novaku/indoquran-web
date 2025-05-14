'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  menuItems: {
    href: string;
    label: string;
    icon: JSX.Element;
  }[];
};

export default function Sidebar({ isOpen, onClose, menuItems }: SidebarProps) {
  const pathname = usePathname();
  // Determine if current page is a reading page (surah or ayat page)
  const isReadingPage = pathname.includes('/surah/') || pathname.includes('/ayat/');
  
  // Effect to manage body class for sidebar open state
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isOpen]);
  
  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside the sidebar
      const sidebar = document.getElementById('sidebar');
      if (isOpen && sidebar && !sidebar.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // Close sidebar on route change
    const handleRouteChange = () => {
      onClose();
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sidebar-overlay"
          style={{ opacity: isOpen ? 1 : 0 }}
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl z-50 transform sidebar ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isReadingPage ? 'bg-[#f8f4e5] text-[#5D4037]' : 'bg-white text-gray-800'}`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <Link href="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${isReadingPage ? 'text-[#5D4037]' : 'text-amber-600'}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <span className={`text-xl font-bold ${isReadingPage ? 'text-[#5D4037]' : 'text-amber-600'}`}>
              IndoQuran
            </span>
          </Link>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${
              isReadingPage 
                ? 'text-[#8D6E63] hover:text-[#6D4C41] hover:bg-[#e8e0ce]' 
                : 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
            }`}
            aria-label="Close menu"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="py-4">
          <div className="px-4 py-2 mb-4 border-b border-gray-200">
            <h2 className={`font-medium ${isReadingPage ? 'text-[#5D4037]' : 'text-amber-700'}`}>Menu Utama</h2>
          </div>
          
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm hover:bg-amber-50 ${
                pathname === item.href
                  ? `font-medium ${isReadingPage ? 'bg-[#e8e0ce] text-[#5D4037]' : 'bg-amber-50 text-amber-700'}`
                  : `${isReadingPage ? 'text-[#5D4037]' : 'text-gray-700'}`
              }`}
              onClick={onClose}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
