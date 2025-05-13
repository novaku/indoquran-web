'use client';

import { useState, useEffect } from 'react';

export default function TestSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/search/surah?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Error fetching results');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Surah Search API</h1>
      
      <div className="flex mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search surah..."
          className="p-2 border mr-2 rounded"
        />
        <button 
          onClick={handleSearch}
          className="px-4 py-2 bg-amber-500 text-white rounded"
        >
          Search
        </button>
      </div>
      
      {isLoading && <p>Loading...</p>}
      
      {error && <p className="text-red-500">{error}</p>}
      
      {results && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Results:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
