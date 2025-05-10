'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
  }
}

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Store the beforeinstallprompt event for later use
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      
      // Check if we've already shown the prompt recently
      const lastPromptTime = localStorage.getItem('pwaPromptTime');
      const now = Date.now();
      
      // Only show if we haven't prompted in the last 7 days
      if (!lastPromptTime || now - parseInt(lastPromptTime) > 7 * 24 * 60 * 60 * 1000) {
        setShowInstallBanner(true);
      }
    };

    // Check if the user already has the app installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
                        
    if (!isStandalone) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the installation prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    // Store the time of this prompt
    localStorage.setItem('pwaPromptTime', Date.now().toString());
    
    // Clear the saved prompt since it can't be used twice
    setInstallPrompt(null);
    setShowInstallBanner(false);
    
    // Log the outcome
    console.log(`User ${outcome} the PWA installation`);
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    
    // Remember that we've shown the prompt recently
    localStorage.setItem('pwaPromptTime', Date.now().toString());
  };

  if (!showInstallBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 p-4 shadow-lg z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-4 bg-amber-600 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900">Instal IndoQuran</p>
            <p className="text-sm text-gray-600">Pasang aplikasi ini di perangkat Anda untuk akses lebih cepat dan penggunaan offline</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={dismissInstallBanner}
            className="px-3 py-2 text-gray-600 hover:text-gray-800"
          >
            Nanti
          </button>
          <button 
            onClick={handleInstallClick}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
          >
            Instal
          </button>
        </div>
      </div>
    </div>
  );
}
