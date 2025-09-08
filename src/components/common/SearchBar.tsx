'use client';

import { useState, useEffect } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (searchTerm: string) => void;
  initialValue?: string;
}

export default function SearchBar({ 
  placeholder = "Search...", 
  onSearch, 
  initialValue = "" 
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      onSearch(searchTerm);
    }, 300); // Debounce search

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-400">🔍</span>
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="input-field pl-10 pr-10"
        placeholder={placeholder}
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}