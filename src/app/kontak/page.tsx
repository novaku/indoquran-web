'use client';

import React, { useEffect, useState } from 'react';
import ContactForm from '@/components/ContactForm';

export default function ContactPage() {
  const [isOffline, setIsOffline] = useState(false);
  
  // Check if we're offline
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      
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
    <main className="w-full px-3 sm:px-4 py-4 sm:py-8 bg-[#f8f4e5] text-[#5D4037]">
      <div className="w-full mx-auto">
        <h1 className="text-3xl font-bold text-amber-800 mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Kontak Kami
        </h1>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-amber-700 dark:text-amber-400 mb-4">Kirim Pesan</h2>
          {isOffline ? (
            <div className="bg-yellow-100 dark:bg-yellow-800/30 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 mb-4">
              <p className="font-medium">Anda sedang dalam mode offline</p>
              <p className="text-sm">Untuk mengirim pesan, silakan hubungkan kembali ke internet.</p>
            </div>
          ) : (
            <ContactForm />
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-amber-700 dark:text-amber-400 mb-4">Pertanyaan Umum</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-300">Apakah IndoQuran tersedia sebagai aplikasi?</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                IndoQuran tersedia sebagai aplikasi web yang dapat diakses langsung dari browser.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-300">Bagaimana cara melaporkan kesalahan terjemahan?</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Untuk melaporkan kesalahan terjemahan atau tafsir, silakan kirimkan pesan melalui 
                formulir kontak di atas dengan menyebutkan surah, ayat, dan koreksi yang perlu dilakukan.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-300">Apakah pembaharuan sering dilakukan?</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Ya, kami selalu berusaha meningkatkan IndoQuran. Pembaruan dilakukan secara berkala untuk 
                menambah fitur baru dan memperbaiki kesalahan.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-300">Bagaimana cara memberikan saran fitur?</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Untuk memberikan saran fitur atau masukan lainnya, silakan kirim pesan melalui 
                formulir kontak di atas. Semua saran akan kami pertimbangkan.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-300">Bagaimana cara menyebarkan IndoQuran?</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Anda dapat membagikan tautan IndoQuran melalui media sosial atau aplikasi pesan. 
                Bantu kami menyebarkan manfaat kepada lebih banyak pengguna.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
