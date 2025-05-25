'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Tooltip from '@/components/Tooltip';
import LazyLoadImage from '@/components/LazyLoadImage';
import { useLocation } from './LocationSettingsProvider';
import { defaultLocation } from '@/utils/constants';
import AutoLocationPrompt from './AutoLocationPrompt';

const Footer: React.FC = () => {
  const { useAutoLocation, setUseAutoLocation } = useLocation();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    city: string;
    region: string;
  }>({
    city: defaultLocation.city,
    region: defaultLocation.region
  });
  const [deviceInfo, setDeviceInfo] = useState<{
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    name: string;
  }>({
    type: 'unknown',
    name: 'Unknown Device'
  });
  
  // Update location information when automatic location changes
  useEffect(() => {
    if (!useAutoLocation) {
      // Using default location
      setCurrentLocation({
        city: defaultLocation.city,
        region: defaultLocation.region
      });
    } else {
      // Using automatic location - try to get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10`
              );
              const data = await response.json();
              
              if (data && data.address) {
                setCurrentLocation({
                  city: data.address.city || data.address.town || data.address.village || 'Unknown',
                  region: data.address.state || data.address.region || data.address.county || 'Unknown'
                });
              }
            } catch (error) {
              console.error("Error fetching location data:", error);
              // Fall back to default location if reverse geocoding fails
              setCurrentLocation({
                city: defaultLocation.city,
                region: defaultLocation.region
              });
            }
          },
          (error) => {
            console.warn(`Geolocation error (${error.code}): ${error.message}`);
            // Fall back to default location on error
            setCurrentLocation({
              city: defaultLocation.city,
              region: defaultLocation.region
            });
          }
        );
      }
    }
  }, [useAutoLocation]);
  
  // Detect device information
  useEffect(() => {
    detectDevice();
  }, []);
  
  const detectDevice = () => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent;
      const width = window.innerWidth;
      
      // Detect device type based on screen width
      let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown';
      if (width <= 640) {
        deviceType = 'mobile';
      } else if (width <= 1024) {
        deviceType = 'tablet';
      } else {
        deviceType = 'desktop';
      }
      
      // Try to detect device name from user agent
      let deviceName = 'Unknown Device';
      
      // Check for common mobile devices
      if (/(iPhone|iPad|iPod)/i.test(userAgent)) {
        deviceName = userAgent.match(/(iPhone|iPad|iPod)/i)?.[0] || 'iOS Device';
      } else if (/Android/i.test(userAgent)) {
        const match = userAgent.match(/Android\s([0-9.]+)/);
        deviceName = match ? `Android ${match[1]}` : 'Android Device';
      } else if (/Windows Phone/i.test(userAgent)) {
        deviceName = 'Windows Phone';
      } else if (/Windows NT/i.test(userAgent)) {
        deviceName = 'Windows';
      } else if (/Macintosh/i.test(userAgent)) {
        deviceName = 'Mac';
      } else if (/Linux/i.test(userAgent)) {
        deviceName = 'Linux';
      }
      
      setDeviceInfo({
        type: deviceType,
        name: deviceName
      });
    }
  };
  
  const toggleLocationPreference = () => {
    if (!useAutoLocation) {
      // If currently using default location, show the prompt to confirm switch to auto location
      setShowLocationPrompt(true);
    } else {
      // If currently using auto location, directly switch to default
      const newValue = false; // Set to default location
      setUseAutoLocation(newValue);
      localStorage.setItem('useAutoLocation', newValue.toString());
      localStorage.setItem('hasSetLocationPreference', 'true');
      
      // Dispatch custom event for prayer widget to listen to
      window.dispatchEvent(new CustomEvent('locationPreferenceChanged', { 
        detail: { useAutoLocation: newValue } 
      }));
    }
  };
  
  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 bg-[#f8f4e5] border-t border-[#d3c6a6] py-2 sm:py-3 px-1 z-40 shadow-md">
        <div className="w-full px-1 sm:px-2">
          <div className="flex flex-col md:flex-row justify-between items-center max-w-[1920px] mx-auto">
            <div className="mb-2 md:mb-0 flex flex-col xs:flex-row items-center xs:items-start">
              <p className="text-[#5D4037] text-xs sm:text-sm">
                © {new Date().getFullYear()} IndoQuran - Al-Quran Digital Bahasa Indonesia
              </p>
              <div className="text-xs text-gray-500 mt-1 xs:mt-0 xs:ml-2">
                <span className="hidden xs:inline">|</span> {deviceInfo.name} ({deviceInfo.type})
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <Link href="/donasi" className="text-amber-700 hover:text-amber-900 transition-colors flex items-center mr-2 sm:mr-4">
                <LazyLoadImage 
                  src="/icons/donasi-icon.svg" 
                  alt="Donasi" 
                  className="w-4 h-4 mr-1"
                  width={16}
                  height={16}
                />
                Donasi
              </Link>
              
              {/* Current location info */}
              <div className="text-amber-700 flex items-center mr-2 sm:mr-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-4 h-4 mr-1"
                  width={16}
                  height={16}
                >
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">
                  <span className="font-medium">{useAutoLocation ? 'Lokasi Saat Ini:' : 'Lokasi Default:'}</span> {currentLocation.city}, {currentLocation.region}
                </span>
                <span className="inline sm:hidden">
                  <span className="text-xs opacity-80">{useAutoLocation ? 'Lokasi:' : 'Default:'}</span> {currentLocation.city}
                </span>
              </div>
              
              <Tooltip text={useAutoLocation 
                ? `Beralih ke lokasi default (${defaultLocation.city})` 
                : `Deteksi lokasi otomatis (akan menggantikan ${defaultLocation.city})`
              } position="top">
                <button 
                  onClick={toggleLocationPreference}
                  className="text-amber-700 hover:text-amber-900 transition-colors flex items-center text-xs sm:text-sm"
                >
                  {useAutoLocation ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                    </svg>
                  )}
                  <span className="hidden xs:inline">
                    {useAutoLocation 
                      ? `Gunakan Lokasi Default (${defaultLocation.city})` 
                      : 'Gunakan Lokasi Otomatis'
                    }
                  </span>
                  <span className="inline xs:hidden">
                    {useAutoLocation 
                      ? `Lok. Default` 
                      : `Lok. Otomatis`
                    }
                  </span>
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </footer>
      
      {/* AutoLocationPrompt */}
      <AutoLocationPrompt 
        isOpen={showLocationPrompt}
        onClose={() => setShowLocationPrompt(false)}
      />
    </>
  );
};

export default Footer;
