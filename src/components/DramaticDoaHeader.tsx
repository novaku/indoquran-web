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
  
  // Define static doa images with complete paths
  const staticDoaImages = [
    { src: '/images/doa/doa-1.jpeg', alt: 'Doa Bersama 1' },
    { src: '/images/doa/doa-2.jpeg', alt: 'Doa Bersama 2' },
    { src: '/images/doa/doa-3.jpeg', alt: 'Doa Bersama 3' },
    { src: '/images/doa/doa-4.jpeg', alt: 'Doa Bersama 4' },
    { src: '/images/doa/doa-5.jpeg', alt: 'Doa Bersama 5' },
    { src: '/images/doa/doa-6.jpeg', alt: 'Doa Bersama 6' }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === staticDoaImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000); // Change image every 7 seconds
    
    return () => clearInterval(interval);
  }, [staticDoaImages.length]);
  
  return (
    <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden">
      {/* Background image with dramatic overlay */}
      <div className="absolute inset-0 w-full h-full">
        <Image 
          src={staticDoaImages[currentImageIndex].src}
          alt={staticDoaImages[currentImageIndex].alt}
          fill
          priority
          className="object-cover transition-opacity duration-1000"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
        />
        {/* Dark gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6 text-center z-10">
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
