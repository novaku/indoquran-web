'use client';

import { useState } from 'react';

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
}

const CopyButton = ({ textToCopy, className = '' }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className={`ml-2 text-xs ${copied ? 'bg-green-500' : 'bg-amber-500 hover:bg-amber-600'} text-white py-1 px-2 rounded transition-colors duration-200 ${className}`}
      onClick={handleCopy}
      title="Salin ke clipboard"
    >
      {copied ? 'Tersalin!' : 'Salin'}
    </button>
  );
};

export default CopyButton;
