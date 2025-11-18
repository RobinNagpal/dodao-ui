'use client';

import StockTickerItem from '@/components/stocks/StockTickerItem';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { formatExchangeWithCountry } from '@/utils/countryExchangeUtils';
import { getScoreColorClasses } from '@/utils/score-utils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as Tooltip from '@radix-ui/react-tooltip';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  industryKey: string;
  subIndustryKey: string;
  websiteUrl?: string | null;
  summary?: string | null;
  cachedScoreEntry: {
    finalScore: number;
  } | null;
}

export interface SearchBarProps {
  placeholder?: string;
  variant?: 'hero' | 'navbar';
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

type VariantStyles = {
  container: string;
  input: string;
  dropdown: string;
  searchIcon: string;
  clearIcon: string;
  searchButton: string;
};

export default function SearchBar({
  placeholder = 'Search stocks by symbol or company name...',
  variant = 'hero',
  onResultClick,
  className = '',
}: SearchBarProps): JSX.Element {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const searchRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown when clicking outside
  useEffect((): (() => void) => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return (): void => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search function
  const searchTickers = useCallback(async (searchQuery: string): Promise<void> => {
    if (!searchQuery.trim() || searchQuery.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/search?q=${encodeURIComponent(searchQuery)}&limit=8`);

      if (response.ok) {
        const data: { results?: SearchResult[] } = await response.json();
        setResults(Array.isArray(data.results) ? data.results : []);
        // Keep dropdown open if we have results OR if we searched but found nothing
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Search error:', error);
      setResults([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setQuery(value);
    setHighlightedIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout((): void => {
      void searchTickers(value);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
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
  const handleResultClick = (result: SearchResult): void => {
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (onResultClick) {
      onResultClick(result);
    } else if (typeof window !== 'undefined') {
      // Default navigation
      window.location.href = `/stocks/${result.exchange}/${result.symbol}`;
    }
  };

  // Clear search
  const handleClear = (): void => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Get styling based on variant
  const getVariantStyles = (): VariantStyles => {
    if (variant === 'navbar') {
      // Responsive widths that never force horizontal scrolling
      return {
        container:
          // On mobile: full width and shrinkable; grow within flex row without pushing nav off-screen
          'relative w-full min-w-0 flex-shrink sm:w-64 md:w-80 lg:w-96',
        input:
          'w-full h-9 pl-9 pr-8 text-sm bg-gray-700 border border-gray-600 rounded-md ' +
          'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ' +
          'text-gray-100 placeholder-gray-400',
        dropdown: 'absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 ' + 'rounded-md shadow-xl z-50 max-h-80 overflow-y-auto',
        searchIcon: 'absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400',
        clearIcon: 'absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-amber-300 cursor-pointer',
        searchButton: '',
      } as const;
    }

    // HERO variant — taller input + amber/yellow border (4px), same color palette
    return {
      container: 'relative w-full max-w-3xl mx-auto mb-16 mt-8',
      input:
        'w-full h-14 pl-16 pr-36 text-base bg-gray-700/40 backdrop-blur-sm border-3 border-amber-400 rounded-2xl ' +
        'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white placeholder-gray-300 ' +
        'transition-all duration-200 shadow-sm',
      dropdown:
        'absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-600/40 ' +
        'rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto',
      searchIcon: 'absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-amber-400 z-10',
      clearIcon: 'absolute right-28 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-300 hover:text-white cursor-pointer ' + 'transition-colors duration-200 z-10',
      searchButton:
        'absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] ' +
        'hover:from-[#F97316] hover:to-[#F59E0B] text-black rounded-lg transition-all duration-200 ' +
        'shadow-md hover:shadow-lg z-10',
    } as const;
  };

  const styles = getVariantStyles();

  // Helper to render ticker item content without Link wrapper when onResultClick is provided
  const renderTickerItem = (result: SearchResult): JSX.Element => {
    const { textColorClass, bgColorClass } = getScoreColorClasses(result.cachedScoreEntry?.finalScore ?? 0);

    return (
      <div className="flex gap-1.5 items-center min-w-0">
        <p className={`${textColorClass} px-1 rounded-md ${bgColorClass} bg-opacity-15 hover:bg-opacity-25 w-[45px] text-right shrink-0`}>
          <span className="font-mono tabular-nums text-right text-xs">{result.cachedScoreEntry?.finalScore ?? 0}/25</span>
        </p>
        <p className="whitespace-nowrap rounded-md px-2 py-0.5 text-sm font-medium bg-[#4F46E5] text-white self-center shadow-sm shrink-0">{result.symbol}</p>
        <p className="text-sm font-medium text-break break-words text-white truncate min-w-0 flex-1">{result.name}</p>
        <p className="text-xs font-medium text-gray-400 whitespace-nowrap shrink-0 ml-2">{formatExchangeWithCountry(result.exchange)}</p>
      </div>
    );
  };

  return (
    <div ref={searchRef} className={`${styles.container} ${className}`}>
      <div className="relative">
        <MagnifyingGlassIcon className={styles.searchIcon} aria-hidden="true" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.input}
          autoComplete="off"
          autoFocus={variant === 'hero'}
          aria-label="Search stocks"
        />

        {query && (
          <button onClick={handleClear} className="focus:outline-none" aria-label="Clear search" type="button">
            <XMarkIcon className={styles.clearIcon} />
          </button>
        )}

        {variant === 'hero' && (
          <button
            onClick={(): void => {
              if (query.trim()) void searchTickers(query);
            }}
            className={`${styles.searchButton} focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2`}
            aria-label="Search"
            type="button"
          >
            Search
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className={styles.dropdown} role="listbox" aria-live="polite">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto" />
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
                    onClick={(): void => handleResultClick(result)}
                    onMouseEnter={(): void => setHighlightedIndex(index)}
                    role="option"
                    aria-selected={index === highlightedIndex}
                  >
                    <div className="px-3 py-2">
                      {onResultClick ? (
                        renderTickerItem(result)
                      ) : (
                        <StockTickerItem
                          symbol={result.symbol}
                          name={result.name}
                          exchange={result.exchange}
                          score={result.cachedScoreEntry?.finalScore ?? 0}
                          displayExchange={formatExchangeWithCountry(result.exchange)}
                        />
                      )}
                    </div>
                  </div>
                ))}

                {results.length >= 8 && (
                  <div className="p-3 text-center border-t border-gray-700/50">
                    <Link
                      href={`/stocks?search=${encodeURIComponent(query)}`}
                      className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors duration-200"
                      onClick={(): void => setIsOpen(false)}
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
