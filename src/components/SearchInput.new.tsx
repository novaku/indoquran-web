import { useState, useEffect, FormEvent } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
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
    
    // Validate search has minimum 3 characters
    if (currentQuery.trim().length < 3) {
      return;
    }
    
    // Format the search terms for MySQL-like query with AND conditions
    const searchTerms = currentQuery.trim().split(/\s+/);
    
    // Call the onSearch prop if provided
    if (onSearch) {
      onSearch(currentQuery || '');
      return; // Let the parent component handle navigation
    }
    
    // Default behavior if no onSearch prop provided
    if (currentQuery && currentQuery.trim().length >= 3) {
      router.push(`/search/ayat?q=${encodeURIComponent(currentQuery)}`);
    } else {
      // If no query, just stay on the same page
      router.push(pathname);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
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
          placeholder={placeholder}
          className="w-full p-3 pl-10 border border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          minLength={3}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <button 
          type="submit"
          className={`absolute right-2 top-2 px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors ${
            (isControlled ? value : query).trim().length < 3 
              ? 'opacity-70 cursor-not-allowed' 
              : ''
          }`}
          disabled={(isControlled ? value : query).trim().length < 3}
        >
          Cari
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-1">
        Minimal 3 karakter untuk pencarian ayat. Kata yang dipisahkan spasi akan dicari sebagai AND condition. 
        Contoh: "ampunan rahmat" akan mencari ayat yang mengandung kata "ampunan" DAN "rahmat"
      </p>
    </form>
  );
}
