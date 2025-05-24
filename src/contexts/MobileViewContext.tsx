'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MobileViewContextType {
  isMobileAppView: boolean;
  toggleMobileAppView: () => void;
}

const MobileViewContext = createContext<MobileViewContextType | undefined>(undefined);

interface MobileViewProviderProps {
  children: ReactNode;
}

export const MobileViewProvider: React.FC<MobileViewProviderProps> = ({ children }) => {
  const [isMobileAppView, setIsMobileAppView] = useState(false);

  // Load mobile view preference from localStorage on component mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('mobileAppView');
    if (savedPreference === 'true') {
      setIsMobileAppView(true);
    }
  }, []);

  // Toggle mobile app view and save preference
  const toggleMobileAppView = () => {
    const newValue = !isMobileAppView;
    setIsMobileAppView(newValue);
    localStorage.setItem('mobileAppView', newValue.toString());

    // Dispatch custom event for other components to listen to
    window.dispatchEvent(
      new CustomEvent('mobileViewChanged', {
        detail: { isMobileAppView: newValue },
      }),
    );
  };

  // Apply mobile app view styles to body element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isMobileAppView) {
        document.body.classList.add('mobile-app-view');
        // Add viewport meta tag for better mobile experience
        let viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute(
            'content',
            'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
          );
        }
      } else {
        document.body.classList.remove('mobile-app-view');
        // Reset viewport meta tag
        let viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1');
        }
      }
    }
  }, [isMobileAppView]);

  // Add keyboard shortcut (Ctrl/Cmd + M) to toggle mobile view
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
        event.preventDefault();
        toggleMobileAppView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileAppView]);

  return (
    <MobileViewContext.Provider value={{ isMobileAppView, toggleMobileAppView }}>
      {children}
    </MobileViewContext.Provider>
  );
};

export const useMobileView = (): MobileViewContextType => {
  const context = useContext(MobileViewContext);
  if (context === undefined) {
    throw new Error('useMobileView must be used within a MobileViewProvider');
  }
  return context;
};
