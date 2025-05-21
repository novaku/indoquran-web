'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Head from 'next/head';

interface DramaticDoaHeaderProps {
  title: string;
  subtitle: string;
}

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const DramaticDoaHeader: React.FC<DramaticDoaHeaderProps> = ({ 
  title, 
  subtitle
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [startSlideshow, setStartSlideshow] = useState(false);
  
  // Define static doa images with complete paths
  const staticDoaImages = [
    { src: '/images/doa/doa-1.jpeg', alt: 'Doa Bersama 1' },
    { src: '/images/doa/doa-2.jpeg', alt: 'Doa Bersama 2' },
    { src: '/images/doa/doa-3.jpeg', alt: 'Doa Bersama 3' },
    { src: '/images/doa/doa-4.jpeg', alt: 'Doa Bersama 4' },
    { src: '/images/doa/doa-5.jpeg', alt: 'Doa Bersama 5' },
    { src: '/images/doa/doa-6.jpeg', alt: 'Doa Bersama 6' }
  ];
  
  // Create shuffled version of images on component mount
  const [shuffledImages, setShuffledImages] = useState(staticDoaImages);

  // Shuffle images only on the client after hydration
  useEffect(() => {
    setShuffledImages(shuffleArray(staticDoaImages));
  }, []);
  
  // Preload all images first
  useEffect(() => {
    // Reset counters
    setImagesLoaded(0);
    setAllImagesLoaded(false);
    setStartSlideshow(false);
    
    // Create image elements and wait for all to load
    const imagePromises = shuffledImages.map((image) => {
      return new Promise<void>((resolve, reject) => {
        const img = new window.Image();
        img.src = image.src;
        img.onload = () => {
          setImagesLoaded(prevCount => {
            const newCount = prevCount + 1;
            return newCount;
          });
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${image.src}`);
          reject(new Error(`Failed to load image: ${image.src}`));
        };
      });
    });

    // Wait for all images to load or fail
    Promise.allSettled(imagePromises)
      .then(() => {
        // Set all images as loaded
        setAllImagesLoaded(true);
        // Add a small delay before starting the slideshow for a smoother transition
        setTimeout(() => {
          setStartSlideshow(true);
        }, 300);
      });
  }, [shuffledImages]);
  
  // Start slideshow timer once all images are loaded
  useEffect(() => {
    if (!startSlideshow) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === shuffledImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000); // Change image every 7 seconds
    
    return () => clearInterval(interval);
  }, [startSlideshow, shuffledImages.length]);
  
  return (
    <>
      {/* Preload images in head */}
      <Head>
        {shuffledImages.map((image, index) => (
          <link 
            key={`preload-${index}`} 
            rel="preload" 
            href={image.src} 
            as="image" 
          />
        ))}
      </Head>
      <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden">
        {/* Loading screen */}
        {!allImagesLoaded && (
          <div className="absolute inset-0 z-20 bg-amber-50 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-amber-800 font-medium">
              Memuat gambar... {imagesLoaded}/{shuffledImages.length}
            </p>
          </div>
        )}

        {/* Background image with dramatic overlay */}
        <div className="absolute inset-0 w-full h-full">
          {shuffledImages.map((image, index) => (
            <Image 
              key={image.src}
              src={image.src}
              alt={image.alt}
              fill
              priority={index === currentImageIndex}
              className={`object-cover transition-opacity duration-1000 ${
                index === currentImageIndex && allImagesLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
            />
          ))}
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
            {shuffledImages.map((_, index) => (
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
    </>
  );
};
