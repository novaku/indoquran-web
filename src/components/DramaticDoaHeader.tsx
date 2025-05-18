'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface DramaticDoaHeaderProps {
  title: string;
  subtitle: string;
}

export const DramaticDoaHeader: React.FC<DramaticDoaHeaderProps> = ({ 
  title, 
  subtitle
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  
  // Define static doa images with complete paths
  const staticDoaImages = [
    { src: '/images/doa/doa-1.jpeg', alt: 'Doa Bersama 1' },
    { src: '/images/doa/doa-2.jpeg', alt: 'Doa Bersama 2' },
    { src: '/images/doa/doa-3.jpeg', alt: 'Doa Bersama 3' },
    { src: '/images/doa/doa-4.jpeg', alt: 'Doa Bersama 4' },
    { src: '/images/doa/doa-5.jpeg', alt: 'Doa Bersama 5' },
    { src: '/images/doa/doa-6.jpeg', alt: 'Doa Bersama 6' }
  ];
  
  // Preload all images
  useEffect(() => {
    // Reset counters
    setImagesLoaded(0);
    
    // Create a new Image element for each image to preload
    staticDoaImages.forEach((image) => {
      const img = new window.Image();
      img.src = image.src;
      img.onload = () => {
        setImagesLoaded(prevCount => {
          const newCount = prevCount + 1;
          // When all images are loaded, set allImagesLoaded to true
          if (newCount === staticDoaImages.length) {
            setAllImagesLoaded(true);
          }
          return newCount;
        });
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${image.src}`);
        // Count failed images as loaded so we don't get stuck
        setImagesLoaded(prevCount => {
          const newCount = prevCount + 1;
          if (newCount === staticDoaImages.length) {
            setAllImagesLoaded(true);
          }
          return newCount;
        });
      };
    });
  }, []);
  
  // Start slideshow timer once all images are loaded
  useEffect(() => {
    if (!allImagesLoaded) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === staticDoaImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000); // Change image every 7 seconds
    
    return () => clearInterval(interval);
  }, [allImagesLoaded, staticDoaImages.length]);
  
  return (
    <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden">
      {/* Loading screen */}
      {!allImagesLoaded && (
        <div className="absolute inset-0 z-20 bg-amber-50 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-amber-800 font-medium">
            Memuat gambar... {imagesLoaded}/{staticDoaImages.length}
          </p>
        </div>
      )}

      {/* Background image with dramatic overlay */}
      <div className="absolute inset-0 w-full h-full">
        <Image 
          src={staticDoaImages[currentImageIndex].src}
          alt={staticDoaImages[currentImageIndex].alt}
          fill
          priority
          className={`object-cover transition-opacity duration-1000 ${allImagesLoaded ? 'opacity-100' : 'opacity-0'}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
        />
        {/* Dark gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      </div>
      
      {/* Content */}
      <div className={`absolute inset-0 flex flex-col justify-center items-center text-white p-6 text-center z-10 transition-opacity duration-500 ${allImagesLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
          {title}
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl drop-shadow-md">
          {subtitle}
        </p>
        
        {/* Image indicators */}
        <div className="absolute bottom-6 flex space-x-2">
          {staticDoaImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentImageIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
              }`}
              aria-label={`Show image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
