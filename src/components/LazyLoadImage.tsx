'use client';

import { useState, useEffect, useRef } from 'react';
import Image, { ImageProps } from 'next/image';

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
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
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

  return (
    <div 
      ref={imgRef} 
      className={`relative overflow-hidden ${wrapperClassName}`}
      style={{ width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : height }}
    >
      {/* Only render the image when it's about to be visible */}
      {isVisible ? (
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
  );
};

export default LazyLoadImage;