'use client';

import { highlightText } from '@/utils/highlightText';

interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

export default function HighlightedText({ 
  text, 
  query, 
  className = '', 
  highlightClassName = 'font-bold text-amber-700' 
}: HighlightedTextProps) {
  // Check if we have valid inputs
  if (!text || !query || query.trim() === '') {
    return <span className={className}>{text}</span>;
  }

  // Process the search query and get the highlighted parts
  const parts = highlightText(text, query);
  
  // Create nice highlighted version with extra styling
  return (
    <span className={className}>
      {parts.map((part, i) => (
        part.isHighlighted ? (
          <mark 
            key={i} 
            className={`${highlightClassName} px-0.5 rounded`}
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      ))}
    </span>
  );
}
