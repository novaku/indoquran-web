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
        <h1 className="text-3xl font-bold text-amber-800 mb-6">Hubungi Kami</h1>
        
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
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Telepon</p>
                    <p className="text-sm text-gray-600">+62-21-12345678</p>
                  </div>
                </div>
                
                <div className="pt-5">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Ikuti Kami</h3>
                  <div className="flex space-x-4">
                    <a href="https://facebook.com/indoquran" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-amber-600">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                      </svg>
                    </a>
                    <a href="https://twitter.com/indoquran" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-amber-600">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                      </svg>
                    </a>
                    <a href="https://instagram.com/indoquran" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-amber-600">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 3.988-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-3.988-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                      </svg>
                    </a>
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
