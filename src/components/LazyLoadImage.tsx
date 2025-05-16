'use client';

import { useState, useEffect, useRef } from 'react';
import Image, { ImageProps } from 'next/image';
import ImageViewer from './ImageViewer';

interface LazyLoadImageProps extends Omit<ImageProps, 'onLoadingComplete'> {
  /**
   * Placeholder image to use while loading the actual image
   * Can be a data URL or a path to an image
   */
  placeholderSrc?: string;
  
  /**
   * Blur effect intensity when loading (1-20)
   */
  blurAmount?: number;
  
  /**
   * Optional className for the wrapper div
   */
  wrapperClassName?: string;
  
  /**
   * Root margin for Intersection Observer
   * Controls how far from the viewport the image should start loading
   */
  rootMargin?: string;
  
  /**
   * Fade-in duration in milliseconds
   */
  fadeInDuration?: number;
  
  /**
   * Whether the image is clickable to view in full size
   */
  clickable?: boolean;
}

/**
 * LazyLoadImage component that only loads images when they are about to enter the viewport
 * Uses IntersectionObserver to detect when the image is close to viewport
 */
const LazyLoadImage: React.FC<LazyLoadImageProps> = ({
  src,
  alt,
  width,
  height,
  placeholderSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f1f1f1'/%3E%3C/svg%3E",
  blurAmount = 10,
  wrapperClassName = "",
  rootMargin = "200px",
  fadeInDuration = 500,
  priority = false,
  className = "",
  clickable = false,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If priority is true, we don't need the IntersectionObserver
    if (priority) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once the image is visible, we don't need to observe it anymore
          if (imgRef.current) {
            observer.unobserve(imgRef.current);
          }
        }
      },
      {
        rootMargin, // Start loading earlier
        threshold: 0.01, // Trigger when at least 1% of the image is visible
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority, rootMargin]);

  // Apply styles for the fade-in effect
  const imageStyle = {
    opacity: isLoaded ? 1 : 0,
    transition: `opacity ${fadeInDuration}ms ease-in-out`,
    objectFit: props.objectFit || 'cover',
  };

  // Handle image click if clickable
  const handleImageClick = () => {
    if (clickable) {
      setShowViewer(true);
    }
  };

  return (
    <>
      <div 
        ref={imgRef} 
        className={`relative overflow-hidden ${wrapperClassName} ${clickable ? 'cursor-pointer' : ''}`}
        style={{ width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : height }}
        onClick={handleImageClick}
      >
        {/* Only render the image when it's about to be visible */}
        {isVisible ? (
          <>
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className={`transition-opacity duration-500 ${className}`}
              style={imageStyle as any}
              onLoad={() => setIsLoaded(true)}
              placeholder="blur"
              blurDataURL={placeholderSrc}
              priority={priority}
              {...props}
            />
            {clickable && isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                <div className="bg-amber-600 text-white p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </div>
              </div>
            )}
          </>
        ) : (
          // Placeholder while the image is not yet visible
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `url(${placeholderSrc}) no-repeat center center`,
              backgroundSize: 'cover',
              filter: `blur(${blurAmount}px)`,
            }}
            aria-hidden="true"
          />
        )}
      </div>
      
      {/* Image Viewer Modal */}
      {clickable && (
        <ImageViewer
          isOpen={showViewer}
          imageUrl={src as string}
          alt={alt}
          width={typeof width === 'number' ? width * 1.5 : parseInt(width as string) * 1.5}
          height={typeof height === 'number' ? height * 1.5 : parseInt(height as string) * 1.5}
          onClose={() => setShowViewer(false)}
        />
      )}
    </>
  );
};

export default LazyLoadImage;