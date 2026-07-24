'use client';

import StockTickerItem from '@/components/stocks/StockTickerItem';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { formatExchangeWithCountry } from '@/utils/countryExchangeUtils';
import { getEtfScoreColorClasses, getScoreColorClasses } from '@/utils/score-utils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as Tooltip from '@radix-ui/react-tooltip';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

/** A concrete result type — one backend table. */
export type ResultKind = 'stocks' | 'etfs';
/**
 * `combined` searches stocks + ETFs together (used on the home hero). It fans out to both
 * single-kind endpoints in parallel and merges the results. The navbar bars stay single-kind.
 */
export type SearchKind = ResultKind | 'combined';

export interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  industryKey?: string;
  subIndustryKey?: string;
  websiteUrl?: string | null;
  summary?: string | null;
  cachedScoreEntry: {
    finalScore: number;
  } | null;
}

/** A result carrying the kind of table it came from, so a combined list can render/route each row. */
interface RankedResult extends SearchResult {
  resultKind: ResultKind;
}

export interface SearchBarProps {
  placeholder?: string;
  variant?: 'hero' | 'navbar';
  kind?: SearchKind;
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

interface KindConfig {
  apiPath: string;
  detailHref: (r: SearchResult) => string;
  viewAllHref: (q: string) => string;
  noResultsTitle: (q: string) => string;
  noResultsHint: string;
  ariaLabel: string;
}

const KIND_CONFIG: Record<ResultKind, KindConfig> = {
  stocks: {
    apiPath: 'tickers-v1/search',
    detailHref: (r) => `/stocks/${r.exchange}/${r.symbol}`,
    viewAllHref: (q) => `/stocks?search=${encodeURIComponent(q)}`,
    noResultsTitle: (q) => `No stocks found for “${q}”`,
    noResultsHint: 'Try searching by company name or stock symbol',
    ariaLabel: 'Search stocks',
  },
  etfs: {
    apiPath: 'etfs-v1/search',
    detailHref: (r) => `/etfs/${r.exchange}/${r.symbol}`,
    viewAllHref: (q) => `/etfs?search=${encodeURIComponent(q)}`,
    noResultsTitle: (q) => `No ETFs found for “${q}”`,
    noResultsHint: 'Try searching by ETF name or ticker symbol',
    ariaLabel: 'Search ETFs',
  },
};

// How closely a result matches the query, mirroring the priority tiers the two search APIs use.
// Lower = better. Used only to merge the already-relevance-sorted stock and ETF lists so an exact
// ticker match floats to the top regardless of which table it came from.
function matchRank(result: SearchResult, term: string): number {
  const symbol = result.symbol.toUpperCase();
  const name = result.name.toLowerCase();
  const upper = term.toUpperCase();
  const lower = term.toLowerCase();
  if (symbol === upper) return 0;
  if (symbol.startsWith(upper)) return 1;
  if (name.startsWith(lower)) return 2;
  if (symbol.includes(upper)) return 3;
  return 4;
}

// Merge the two single-kind result lists for combined search. We interleave stock/ETF rows so both
// types stay visible, then stable-sort by match rank (Array.sort is stable) so the interleaving is
// preserved within a tier while stronger matches surface first. Finally cap at `limit` total rows.
function mergeCombinedResults(stocks: SearchResult[], etfs: SearchResult[], term: string, limit: number): RankedResult[] {
  const interleaved: RankedResult[] = [];
  const max = Math.max(stocks.length, etfs.length);
  for (let i = 0; i < max; i++) {
    if (i < stocks.length) interleaved.push({ ...stocks[i], resultKind: 'stocks' });
    if (i < etfs.length) interleaved.push({ ...etfs[i], resultKind: 'etfs' });
  }
  interleaved.sort((a, b) => matchRank(a, term) - matchRank(b, term));
  return interleaved.slice(0, limit);
}

async function fetchResults(apiPath: string, searchQuery: string, limit: number): Promise<SearchResult[]> {
  const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/${apiPath}?q=${encodeURIComponent(searchQuery)}&limit=${limit}`);
  if (!response.ok) return [];
  const data: { results?: SearchResult[] } = await response.json();
  return Array.isArray(data.results) ? data.results : [];
}

export default function SearchBar({
  placeholder = 'Search stocks by symbol or company name...',
  variant = 'hero',
  kind = 'stocks',
  onResultClick,
  className = '',
}: SearchBarProps): JSX.Element {
  // Single-kind config (detail/view-all hrefs, aria label, no-results copy). Undefined in combined mode.
  const singleConfig = kind === 'combined' ? undefined : KIND_CONFIG[kind];
  const ariaLabel = singleConfig ? singleConfig.ariaLabel : 'Search stocks and ETFs';

  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<RankedResult[]>([]);
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
  const runSearch = useCallback(
    async (searchQuery: string): Promise<void> => {
      if (!searchQuery.trim() || searchQuery.length < 1) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);

      try {
        let merged: RankedResult[];
        if (kind === 'combined') {
          // Fan out to both endpoints in parallel and merge — one search bar, both tables.
          const [stocks, etfs] = await Promise.all([
            fetchResults(KIND_CONFIG.stocks.apiPath, searchQuery, 8),
            fetchResults(KIND_CONFIG.etfs.apiPath, searchQuery, 8),
          ]);
          merged = mergeCombinedResults(stocks, etfs, searchQuery.trim(), 8);
        } else {
          const single = await fetchResults(KIND_CONFIG[kind].apiPath, searchQuery, 8);
          merged = single.map((r) => ({ ...r, resultKind: kind }));
        }
        setResults(merged);
        setIsOpen(true);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Search error:', error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [kind]
  );

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setQuery(value);
    setHighlightedIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout((): void => {
      void runSearch(value);
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
  const handleResultClick = (result: RankedResult): void => {
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (onResultClick) {
      onResultClick(result);
    } else if (typeof window !== 'undefined') {
      // Route by the row's own kind so a combined list sends stocks to /stocks and ETFs to /etfs.
      window.location.href = KIND_CONFIG[result.resultKind].detailHref(result);
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
          'w-full h-9 pl-9 pr-8 text-sm bg-surface-2 border border-border rounded-md ' +
          'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ' +
          'text-body placeholder-muted',
        dropdown: 'absolute top-full left-0 right-0 mt-1 bg-surface border border-border ' + 'rounded-md shadow-xl z-50 max-h-80 overflow-y-auto',
        searchIcon: 'absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400',
        clearIcon: 'absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted hover:text-amber-300 cursor-pointer',
        searchButton: '',
      } as const;
    }

    // HERO variant — taller input + amber/yellow border (4px), same color palette
    return {
      container: 'relative w-full max-w-3xl mx-auto mb-14 mt-8',
      input:
        'w-full h-14 pl-16 pr-36 text-base bg-surface-2 backdrop-blur-sm border-3 border-amber-400 rounded-2xl ' +
        'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-heading placeholder-muted ' +
        'transition-all duration-200 shadow-sm',
      dropdown:
        'absolute top-full left-0 right-0 mt-2 bg-surface backdrop-blur-sm border border-border ' + 'rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto',
      searchIcon: 'absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-amber-400 z-10',
      clearIcon: 'absolute right-28 top-1/2 -translate-y-1/2 h-6 w-6 text-muted hover:text-heading cursor-pointer ' + 'transition-colors duration-200 z-10',
      searchButton:
        'absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 bg-gradient-to-r from-amber-500 to-amber-400 ' +
        'hover:from-orange-500 hover:to-amber-500 text-black rounded-lg transition-all duration-200 ' +
        'shadow-md hover:shadow-lg z-10',
    } as const;
  };

  const styles = getVariantStyles();

  // Inline renderer used when we can't (or don't want to) defer to a per-row Link
  // component — i.e. when `onResultClick` is provided, or for ETF results where
  // we don't have a stock-specific ticker item with notes/favourites.
  const renderInlineRow = (result: RankedResult): JSX.Element => {
    const score = result.cachedScoreEntry?.finalScore ?? 0;
    const isEtf = result.resultKind === 'etfs';
    const { textColorClass, bgColorClass } = isEtf ? getEtfScoreColorClasses(score) : getScoreColorClasses(score);
    const scoreDenominator = isEtf ? 20 : 25;

    return (
      <div className="flex gap-1.5 items-center min-w-0">
        <p className={`${textColorClass} px-1 rounded-md ${bgColorClass} bg-opacity-15 hover:bg-opacity-25 w-[45px] text-right shrink-0`}>
          <span className="font-mono tabular-nums text-right text-xs">
            {score}/{scoreDenominator}
          </span>
        </p>
        <p className="whitespace-nowrap rounded-md px-2 py-0.5 text-sm font-medium bg-primary text-primary-text self-center shadow-sm shrink-0">
          {result.symbol}
        </p>
        <p className="text-sm font-medium text-break break-words text-heading truncate min-w-0 flex-1">{result.name}</p>
        <p className="text-xs font-medium text-muted whitespace-nowrap shrink-0 ml-2">{formatExchangeWithCountry(result.exchange)}</p>
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
          aria-label={ariaLabel}
        />

        {query && (
          <button onClick={handleClear} className="focus:outline-none" aria-label="Clear search" type="button">
            <XMarkIcon className={styles.clearIcon} />
          </button>
        )}

        {variant === 'hero' && (
          <button
            onClick={(): void => {
              if (query.trim()) void runSearch(query);
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
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
              <span className="text-muted text-sm mt-2 block">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <Tooltip.Provider>
              <div>
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className={`cursor-pointer transition-colors duration-150 border-b border-border last:border-b-0 ${
                      index === highlightedIndex ? 'bg-indigo-600/20' : 'hover:bg-surface-2'
                    }`}
                    onClick={(): void => handleResultClick(result)}
                    onMouseEnter={(): void => setHighlightedIndex(index)}
                    role="option"
                    aria-selected={index === highlightedIndex}
                  >
                    <div className="px-3 py-2">
                      {onResultClick || result.resultKind === 'etfs' ? (
                        renderInlineRow(result)
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

                {singleConfig && results.length >= 8 && (
                  <div className="p-3 text-center border-t border-border">
                    <Link
                      href={singleConfig.viewAllHref(query)}
                      className="text-link hover:text-link text-sm transition-colors duration-200"
                      onClick={(): void => setIsOpen(false)}
                    >
                      View all results for &ldquo;{query}&rdquo;
                    </Link>
                  </div>
                )}
              </div>
            </Tooltip.Provider>
          ) : query.trim() && !isLoading ? (
            <div className="p-4 text-center text-muted">
              <div className="text-sm">{singleConfig ? singleConfig.noResultsTitle(query) : `No stocks or ETFs found for “${query}”`}</div>
              <div className="text-xs mt-1 opacity-75">{singleConfig ? singleConfig.noResultsHint : 'Try searching by name or ticker symbol'}</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
