'use client';

import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistration() {
  const [showReload, setShowReload] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register the service worker
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
          .then(function(registration) {
            console.log('Service Worker registered with scope:', registration.scope);
            
            // Check for updates on each page load
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content is available, show update notification
                    setWaitingWorker(newWorker);
                    setShowReload(true);
                  } else if (newWorker.state === 'activated') {
                    // Set offline ready status when service worker is active
                    setOfflineReady(true);
                    setTimeout(() => setOfflineReady(false), 4000); // Hide after 4 seconds
                  }
                });
              }
            });

            // Handle already existing updates
            if (registration.waiting) {
              setWaitingWorker(registration.waiting);
              setShowReload(true);
            }
          })
          .catch(function(error) {
            console.log('Service Worker registration failed:', error);
          });
      });

      // Add event listener for updates from the service worker
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // This fires when the service worker controlling this page
        // changes, eg a new worker has skipped waiting and become active
        window.location.reload();
      });
    }
  }, []);

  // Function to update the service worker
  const updateServiceWorker = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowReload(false);
    }
  };

  // Toast notification styles
  const toastClasses = `fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 
    bg-amber-600 text-white font-medium rounded-lg px-4 py-2 shadow-lg
    flex items-center justify-between`;

  return (
    <>
      {/* Update available notification */}
      {showReload && (
        <div className={`${toastClasses} animate-fade-in`} style={{ maxWidth: '90vw', width: 'auto' }}>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            <span>Pembaruan tersedia</span>
          </div>
          <button 
            onClick={updateServiceWorker}
            className="ml-4 bg-white text-amber-600 px-3 py-1 rounded text-sm hover:bg-amber-50 transition-colors"
            aria-label="Perbarui aplikasi"
          >
            Perbarui
          </button>
        </div>
      )}
      
      {/* Offline ready notification */}
      {offlineReady && (
        <div className={`${toastClasses} animate-fade-in`} style={{ maxWidth: '90vw', width: 'auto' }}>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
            <span>Aplikasi siap digunakan offline</span>
          </div>
          <button 
            onClick={() => setOfflineReady(false)}
            className="ml-4 text-white opacity-70 hover:opacity-100"
            aria-label="Tutup notifikasi"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
