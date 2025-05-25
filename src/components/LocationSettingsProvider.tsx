'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import LocationSettingsPopup from './LocationSettingsPopup';

interface LocationContextType {
  useAutoLocation: boolean | null;
  setUseAutoLocation: (value: boolean) => void;
  hasSetPreference: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationSettingsProvider');
  }
  return context;
};

export const LocationSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [useAutoLocation, setUseAutoLocation] = useState<boolean | null>(null);
  const [hasSetPreference, setHasSetPreference] = useState(false);

  useEffect(() => {
    // Check if the user has already set their preference
    const storedPreference = localStorage.getItem('hasSetLocationPreference');
    const autoLocation = localStorage.getItem('useAutoLocation');
    
    if (storedPreference === 'true') {
      setHasSetPreference(true);
      setUseAutoLocation(autoLocation === 'true');
    } else {
      // Wait a bit before showing the popup to prevent blocking the initial render
      const timer = setTimeout(() => {
        setShowLocationPopup(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLocationPreference = (useAuto: boolean) => {
    localStorage.setItem('useAutoLocation', useAuto.toString());
    localStorage.setItem('hasSetLocationPreference', 'true');
    setUseAutoLocation(useAuto);
    setHasSetPreference(true);
    setShowLocationPopup(false);
  };

  return (
    <LocationContext.Provider value={{ useAutoLocation, setUseAutoLocation: handleLocationPreference, hasSetPreference }}>
      {children}
      <LocationSettingsPopup
        isOpen={showLocationPopup}
        onClose={() => setShowLocationPopup(false)}
        onSelectOption={handleLocationPreference}
      />
    </LocationContext.Provider>
  );
};

export default LocationSettingsProvider;
