import { useState, useEffect, FormEvent, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SearchInputProps {
  initialQuery?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  value?: string;
  onChange?: (query: string) => void;
}

export default function SearchInput({ 
  initialQuery = '',
  placeholder = 'Cari ayat Al-Qur\'an...', 
  onSearch,
  value,
  onChange
}: SearchInputProps) {
  // For internal state when not controlled
  const [query, setQuery] = useState(initialQuery);
  
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Determine if we're using controlled mode
  const isControlled = value !== undefined && onChange !== undefined;
  
  // Current query value based on whether we're controlled or not
  const currentQuery = isControlled ? value || '' : query;
  
  // Handle search submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Don't proceed if query is too short
    if (!currentQuery || currentQuery.trim().length < 3) {
      return;
    }
    
    // Trim the query
    const formattedQuery = currentQuery.trim();
    
    // Call onSearch prop if provided (let parent handle navigation)
    if (onSearch) {
      onSearch(formattedQuery);
      return;
    }
    
    // Default navigation behavior
    router.push(`/search/ayat?q=${encodeURIComponent(formattedQuery)}`);
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (isControlled) {
      // If controlled, use the provided onChange handler
      onChange?.(newValue);
    } else {
      // Otherwise update our internal state
      setQuery(newValue);
    }
  };
  
  // Handle clearing the search
  const handleClear = () => {
    if (isControlled) {
      // If controlled, use the provided onChange handler
      onChange?.('');
    } else {
      // Otherwise update our internal state
      setQuery('');
    }
    
    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="relative">
        {/* Search form with decorative elements */}
        <div className="relative bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg p-0.5 border-[1.5px] border-amber-300 dark:border-amber-700/50">
          {/* Decorative circles */}
          <div className="absolute left-0 top-0 w-16 h-16 bg-amber-200/30 dark:bg-amber-700/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute right-2 bottom-0 w-8 h-8 bg-amber-200/30 dark:bg-amber-700/10 rounded-full translate-y-1/2"></div>
          
          <div className="relative flex items-center">
            {/* Search icon decorative */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <input
              type="text"
              value={currentQuery}
              onChange={handleChange}
              className="w-full py-3.5 sm:py-4 pl-10 sm:pl-12 pr-24 sm:pr-28 rounded-lg bg-transparent focus:outline-none text-amber-900 dark:text-amber-100 placeholder-amber-500 dark:placeholder-amber-400/70 text-base sm:text-lg font-medium"
              placeholder={placeholder}
              ref={inputRef}
              minLength={3}
              autoComplete="off"
            />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {/* Clear button - only show when there's text */}
              {currentQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 sm:p-2 bg-amber-100 dark:bg-amber-800/30 hover:bg-amber-200 dark:hover:bg-amber-700/50 text-amber-700 dark:text-amber-300 rounded-full transition-colors z-10"
                  aria-label="Hapus pencarian"
                  title="Hapus pencarian"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              
              <button
                type="submit"
                className="p-2 sm:p-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 dark:from-amber-600 dark:to-amber-700 dark:hover:from-amber-500 dark:hover:to-amber-600 text-white rounded-lg shadow-sm hover:shadow transition-all duration-300 flex items-center gap-1 z-10"
                aria-label="Cari"
              >
                <span className="hidden sm:inline font-medium">Cari</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-2">
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
          Cari dengan frasa lengkap seperti "<span className="font-medium">maha pengasih</span>" untuk hasil terbaik
        </p>
      </div>
    </form>
  );
}
