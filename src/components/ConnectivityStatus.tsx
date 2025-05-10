'use client';

import { useState, useEffect } from 'react';
import offlineStorage from '../utils/offlineStorage';

/**
 * Component to display the current connectivity status
 */
export default function ConnectivityStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  
  useEffect(() => {
    // Initialize with current network state
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      setFadeOut(false);
      
      // Hide the indicator after 5 seconds
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setShowIndicator(false), 500); // 500ms for fade out animation
      }, 5000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
      setFadeOut(false);
    };
    
    // Register event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Don't render anything if we don't need to show the indicator
  if (!showIndicator) {
    return null;
  }
  
  const bgColor = isOnline ? 'bg-green-500' : 'bg-red-500';
  const message = isOnline ? 'Back Online' : 'You are offline';
  const iconClass = isOnline ? 'fas fa-wifi' : 'fas fa-wifi-slash';
  
  return (
    <div
      className={`fixed bottom-5 left-5 z-50 rounded-lg px-4 py-2 text-white shadow-lg transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      } ${bgColor}`}
    >
      <div className="flex items-center space-x-2">
        <i className={iconClass}></i>
        <span>{message}</span>
        {!isOnline && (
          <span className="text-xs ml-2">
            (Some features may be limited)
          </span>
        )}
      </div>
    </div>
  );
}
