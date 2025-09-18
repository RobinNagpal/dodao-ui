'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import getBaseUrl from '../../../../../shared/web-core/src/utils/api/getBaseURL';
import StockTickerItem from '@/components/stocks/StockTickerItem';
import * as Tooltip from '@radix-ui/react-tooltip';

export interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  industryKey: string;
  subIndustryKey: string;
  websiteUrl?: string | null;
  summary?: string | null;
  cachedScore: number;
}

export interface SearchBarProps {
  placeholder?: string;
  variant?: 'hero' | 'navbar';
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

export default function SearchBar({
  placeholder = 'Search stocks by symbol or company name...',
  variant = 'hero',
  onResultClick,
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search function
  const searchTickers = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/search?q=${encodeURIComponent(searchQuery)}&limit=8`);

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        // Keep dropdown open if we have results OR if we searched but found nothing
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setHighlightedIndex(-1);

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      searchTickers(value);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleResultClick(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle result selection
  const handleResultClick = (result: SearchResult) => {
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (onResultClick) {
      onResultClick(result);
    } else {
      // Default navigation
      window.location.href = `/stocks/${result.exchange}/${result.symbol}`;
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Get styling based on variant
  const getVariantStyles = () => {
    if (variant === 'navbar') {
      return {
        container: 'relative w-96',
        input:
          'w-full h-9 pl-9 pr-8 text-sm bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-400',
        dropdown: 'absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-xl z-50 max-h-80 overflow-y-auto',
        searchIcon: 'absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400',
        clearIcon: 'absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-200 cursor-pointer',
      };
    } else {
      return {
        container: 'relative w-full max-w-2xl mx-auto',
        input:
          'w-full h-12 pl-14 pr-12 text-base bg-gray-700/40 backdrop-blur-sm border border-gray-600/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 text-white placeholder-gray-300 transition-all duration-200',
        dropdown:
          'absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-600/40 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto',
        searchIcon: 'absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300 z-10',
        clearIcon:
          'absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-300 hover:text-white cursor-pointer transition-colors duration-200 z-10',
      };
    }
  };

  const styles = getVariantStyles();

  return (
    <div ref={searchRef} className={`${styles.container} ${className}`}>
      <div className="relative">
        <MagnifyingGlassIcon className={styles.searchIcon} />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.input}
          autoComplete="off"
        />

        {query && (
          <button onClick={handleClear} className="focus:outline-none" aria-label="Clear search">
            <XMarkIcon className={styles.clearIcon} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className={styles.dropdown}>
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto"></div>
              <span className="text-gray-400 text-sm mt-2 block">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <Tooltip.Provider>
              <div>
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className={`cursor-pointer transition-colors duration-150 border-b border-gray-700/50 last:border-b-0 ${
                      index === highlightedIndex ? 'bg-indigo-600/20' : 'hover:bg-gray-700/50'
                    }`}
                    onClick={() => handleResultClick(result)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="px-3 py-2">
                      <StockTickerItem symbol={result.symbol} name={result.name} exchange={result.exchange} score={result.cachedScore} />
                    </div>
                  </div>
                ))}

                {results.length >= 8 && (
                  <div className="p-3 text-center border-t border-gray-700/50">
                    <Link
                      href={`/stocks?search=${encodeURIComponent(query)}`}
                      className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      View all results for &ldquo;{query}&rdquo;
                    </Link>
                  </div>
                )}
              </div>
            </Tooltip.Provider>
          ) : query.trim() && !isLoading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="text-sm">No stocks found for &ldquo;{query}&rdquo;</div>
              <div className="text-xs mt-1 opacity-75">Try searching by company name or stock symbol</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
