'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface ImageViewerProps {
  isOpen: boolean;
  imageUrl: string;
  alt: string;
  width: number;
  height: number;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ 
  isOpen, 
  imageUrl, 
  alt, 
  width, 
  height, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match transition duration
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isVisible) return null;
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full">
        <button 
          className="absolute -top-12 right-0 text-white bg-amber-600 hover:bg-amber-700 rounded-full p-2 transition-colors"
          onClick={onClose}
          aria-label="Tutup gambar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div 
          className="relative overflow-auto bg-white rounded-lg shadow-xl"
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: 'calc(100vh - 80px)', maxWidth: 'calc(100vw - 40px)' }}
        >
          <Image
            src={imageUrl}
            alt={alt}
            width={width}
            height={height}
            className="h-auto w-auto object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
