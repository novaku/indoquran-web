'use client';

import React, { useState, useEffect } from 'react';
import { useLocation } from './LocationSettingsProvider';

interface AutoLocationPromptProps {
  onClose: () => void;
  onAccept: () => void;
}

const AutoLocationPrompt: React.FC<AutoLocationPromptProps> = ({ onClose, onAccept }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl">
        <div className="flex items-center mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-amber-500 mr-3" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
          <h2 className="text-lg font-semibold text-amber-800">
            Tingkatkan Akurasi Jadwal Sholat
          </h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          Saat ini Anda menggunakan lokasi default ({defaultLocation.city}). Untuk jadwal yang lebih akurat, 
          izinkan aplikasi mendeteksi lokasi Anda secara otomatis.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <button
            onClick={onAccept}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Gunakan Lokasi Otomatis
          </button>
          
          <button
            onClick={onClose}
            className="w-full border border-amber-400 hover:bg-amber-50 text-amber-700 py-2 px-4 rounded-lg transition-colors"
          >
            Tetap Gunakan Lokasi Default
          </button>
        </div>
      </div>
    </div>
  );
};

// Record that the prompt was shown today
const recordPromptShown = () => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  localStorage.setItem('lastAutoLocationPrompt', today);
};

// Check if we should show the prompt
const shouldShowPrompt = () => {
  // Get the last time we showed the prompt
  const lastPrompt = localStorage.getItem('lastAutoLocationPrompt');
  
  // If we've never shown the prompt, or if it's been more than 7 days
  if (!lastPrompt) {
    return true;
  }
  
  const lastPromptDate = new Date(lastPrompt);
  const today = new Date();
  const daysSinceLastPrompt = Math.floor((today.getTime() - lastPromptDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Show again after 7 days
  return daysSinceLastPrompt >= 7;
};

// Default location information from constants
const defaultLocation = {
  city: "Jakarta",
  region: "Indonesia"
};

export const useAutoLocationPrompt = () => {
  const { useAutoLocation, setUseAutoLocation } = useLocation();
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    // Only show if using default location and we haven't shown recently
    if (useAutoLocation === false && shouldShowPrompt()) {
      // Wait a bit after page load to show the prompt
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [useAutoLocation]);
  
  const handleAccept = () => {
    setUseAutoLocation(true);
    recordPromptShown();
    setShowPrompt(false);
  };
  
  const handleClose = () => {
    recordPromptShown();
    setShowPrompt(false);
  };
  
  return {
    showPrompt,
    AutoLocationPrompt: () => 
      showPrompt ? <AutoLocationPrompt onClose={handleClose} onAccept={handleAccept} /> : null
  };
};
