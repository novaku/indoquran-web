'use client';

import React, { useEffect } from 'react';
// next/head is deprecated in App Router, but we're using direct DOM manipulation instead

interface DynamicHeadProps {
  title: string;
  description?: string;
}

/**
 * A client component to dynamically update the document title and meta tags
 */
const DynamicHead: React.FC<DynamicHeadProps> = ({ title, description }) => {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    try {
      // Update the document title
      if (title) {
        document.title = title;
      }

      // Update meta description if provided
      if (description) {
        // Find existing meta description tag or create a new one
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description);
      }
    } catch (error) {
      console.error('Error updating document head:', error);
    }

    return () => {
      // Optional: Reset title on unmount if needed
      // document.title = 'IndoQuran';
    };
  }, [title, description]);

  // This component doesn't render anything visible
  return null;
};

export default DynamicHead;
