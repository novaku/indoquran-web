import { useState, useEffect, FormEvent, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SearchResult {
  key: string;
  href: string;
  title: string;
  surah: string;
  snippet: string;
}

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
  const [query, setQuery] = useState(initialQuery);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef(null);
  
  // Use controlled component if value and onChange are provided
  const isControlled = value !== undefined && onChange !== undefined;

  // Sync query state with URL search param
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    setQuery(urlQuery);
  }, [searchParams]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const currentQuery = isControlled ? value : query;
    
    // Validate and format the search query in MySQL-like format
    if (!currentQuery || currentQuery.trim().length < 3) {
      return;
    }
    
    // Use the search query exactly as provided, just trim whitespace
    const formattedQuery = currentQuery.trim();
    
    if (formattedQuery.length < 3) {
      return; // Search query is too short
    }
    
    // Call the onSearch prop if provided
    if (onSearch) {
      onSearch(formattedQuery);
      return; // Let the parent component handle navigation
    }
    
    // Default behavior if no onSearch prop provided
    router.push(`/search/ayat?q=${encodeURIComponent(formattedQuery)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleSearch = () => {
    handleSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={isControlled ? value : query}
            onChange={(e) => {
              if (isControlled) {
                onChange?.(e.target.value);
              } else {
                setQuery(e.target.value);
              }
            }}
            onKeyDown={handleKeyDown}
            className="w-full py-3 px-4 pr-12 rounded-lg border border-[#d3c6a6] bg-[#f8f4e5] focus:ring-2 focus:ring-[#8D6E63] focus:border-transparent transition-all outline-none text-[#5D4037] placeholder-[#9E9E9E]"
            placeholder={placeholder}
            ref={inputRef}
            minLength={3}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#8D6E63] text-white rounded-md hover:bg-[#6D4C41] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          {showResults && searchResults && searchResults.length > 0 && (
            <div className="absolute w-full mt-1 bg-[#f8f4e5] border border-[#d3c6a6] rounded-lg shadow-lg z-20 max-h-[70vh] overflow-y-auto">
              {searchResults.map((result) => (
                <Link 
                  key={result.key} 
                  href={result.href}
                  onClick={() => setShowResults(false)}
                  className="block p-3 border-b border-[#d3c6a6] last:border-b-0 hover:bg-[#e8e0ce] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-[#5D4037]">{result.title}</div>
                    <div className="text-xs text-[#8D6E63]">{result.surah}</div>
                  </div>
                  <div className="text-xs text-[#795548] mt-1">{result.snippet}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-1">
        Minimal 3 karakter untuk pencarian. Cari dengan frasa lengkap seperti "maha pengasih" untuk menemukan ayat yang mengandung frasa tersebut.
      </p>
    </form>
  );
}
