'use client';

import React, { useEffect, useState } from 'react';
import ContactForm from '@/components/ContactForm';
import OfflineBanner from '@/components/OfflineBanner';
import offlineStorage from '@/utils/offlineStorage';

export default function ContactPage() {
  // Cache this page for offline access when it's loaded
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Track that this page was visited (for offline access history)
      offlineStorage.trackStaticPage('/kontak');
      
      // Get the current page content
      const pageContent = {
        title: 'Kontak Kami | IndoQuran',
        content: document.querySelector('main')?.innerHTML || '',
        lastUpdated: Date.now()
      };
      
      // Store the page content for offline access
      offlineStorage.saveStaticPage('/kontak', pageContent);
    }
  }, []);

  const [isOffline, setIsOffline] = useState(false);
  
  // Check if we're offline
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOffline(offlineStorage.isOffline());
      
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <OfflineBanner />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-800 mb-6 flex items-center">
          <img src="/icons/kontak-icon.svg" alt="Kontak" className="w-8 h-8 mr-3" />
          Hubungi Kami
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-gray-700 mb-4">
            Kami senang mendengar dari Anda! Jika Anda memiliki pertanyaan, saran, atau menemukan 
            masalah dalam aplikasi IndoQuran, jangan ragu untuk menghubungi kami menggunakan 
            formulir di bawah ini.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div>
              <h2 className="text-xl font-semibold text-amber-700 mb-4">Informasi Kontak</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">info@indoquran.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Lokasi</p>
                    <p className="text-sm text-gray-600">Jakarta, Indonesia</p>
                  </div>
                </div>
                
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-amber-700 mb-4">Kirim Pesan</h2>
              <ContactForm />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-amber-700 mb-4">Pertanyaan Umum</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-amber-800">Bagaimana cara mengunduh aplikasi IndoQuran?</h3>
              <p className="text-gray-600 mt-1">
                IndoQuran tersedia sebagai aplikasi web yang dapat diakses langsung dari browser. Anda juga dapat 
                menambahkan ke layar utama perangkat Anda untuk pengalaman aplikasi native.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-amber-800">Apakah IndoQuran dapat digunakan secara offline?</h3>
              <p className="text-gray-600 mt-1">
                Ya, IndoQuran mendukung penggunaan offline setelah Anda mengakses konten untuk pertama kalinya. 
                Kami menggunakan teknologi PWA (Progressive Web App) untuk menyimpan data di perangkat Anda.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-amber-800">Bagaimana cara melaporkan kesalahan terjemahan?</h3>
              <p className="text-gray-600 mt-1">
                Jika Anda menemukan kesalahan dalam terjemahan atau tafsir, silakan gunakan formulir kontak di atas 
                dengan subjek "Koreksi Terjemahan" dan berikan detail ayat yang perlu diperbaiki.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
