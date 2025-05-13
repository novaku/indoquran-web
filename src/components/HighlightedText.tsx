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
  highlightClassName = 'font-bold text-amber-700 dark:text-amber-300' 
}: HighlightedTextProps) {
  const parts = highlightText(text, query);
  
  return (
    <span className={className}>
      {parts.map((part, i) => (
        part.isHighlighted ? (
          <span key={i} className={highlightClassName}>{part.text}</span>
        ) : (
          <span key={i}>{part.text}</span>
        )
      ))}
    </span>
  );
}
