'use client';

import { HtsSearchResponse, HtsSearchResult } from '@/app/api/tariff-calculator/hts-search/route';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface HtsCodeSearchProps {
  // Called when the user picks a result. Receives the chosen 10-digit code
  // (with no separators) plus a short label for display.
  onSelect: (selection: { hts10: string; htsNumber: string; description: string }) => void;
  className?: string;
}

interface FetchState {
  loading: boolean;
  results: HtsSearchResult[];
  query: string;
  error: string | null;
}

const DEBOUNCE_MS = 250;

function formatHts10(hts10: string): string {
  return hts10.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1.$2.$3.$4');
}

export default function HtsCodeSearch({ onSelect, className }: HtsCodeSearchProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<FetchState>({ loading: false, results: [], query: '', error: null });
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Tracks the most recently issued query so that out-of-order responses
  // don't overwrite newer results when the user types fast.
  const latestQueryRef = useRef('');

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setState({ loading: false, results: [], query: q, error: null });
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    latestQueryRef.current = q;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${getBaseUrl()}/api/tariff-calculator/hts-search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`Search failed (HTTP ${res.status})`);
      const data = (await res.json()) as HtsSearchResponse;
      // Only commit if this is still the latest query the user typed.
      if (latestQueryRef.current !== q) return;
      setState({ loading: false, results: data.results, query: q, error: null });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (latestQueryRef.current !== q) return;
      setState({ loading: false, results: [], query: q, error: err instanceof Error ? err.message : 'Search failed' });
    }
  }, []);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    setOpen(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      void runSearch(value);
    }, DEBOUNCE_MS);
  }

  function handlePick(result: HtsSearchResult) {
    setOpen(false);
    setQuery('');
    setState({ loading: false, results: [], query: '', error: null });
    onSelect({ hts10: result.htsCode10, htsNumber: result.htsNumber, description: result.description });
  }

  function handleClear() {
    setQuery('');
    setState({ loading: false, results: [], query: '', error: null });
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={wrapperRef} className={`relative ${className ?? ''}`}>
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-400" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={onChange}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          placeholder="Search by product description (e.g. frozen shrimp, lithium battery, cotton t-shirt) or HTS code"
          className="w-full h-12 rounded-lg border border-amber-500/40 bg-gray-900/70 backdrop-blur-sm pl-11 pr-10 text-sm text-white placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          aria-label="Search HTS codes"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {open && (state.loading || state.results.length > 0 || state.error || state.query.length >= 2) && (
        <div
          className="absolute left-0 right-0 z-30 mt-2 max-h-[28rem] overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 shadow-2xl"
          role="listbox"
        >
          {state.loading && state.results.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-400">
              <div className="mx-auto mb-2 h-5 w-5 animate-spin rounded-full border-b-2 border-amber-400" />
              Searching HTSUS catalog…
            </div>
          )}

          {state.error && <div className="p-4 text-center text-sm text-red-400">{state.error}</div>}

          {!state.loading && !state.error && state.results.length === 0 && state.query.length >= 2 && (
            <div className="p-4 text-center text-sm text-gray-400">
              <div>No HTS codes match &ldquo;{state.query}&rdquo;.</div>
              <div className="mt-1 text-xs opacity-75">Try a more general term, or paste a 4–10 digit HTS code.</div>
            </div>
          )}

          {state.results.length > 0 && (
            <ul className="divide-y divide-gray-800">
              {state.results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    onClick={() => handlePick(result)}
                    className="w-full text-left px-4 py-3 hover:bg-amber-500/10 focus:bg-amber-500/10 focus:outline-none transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-mono text-sm font-semibold text-amber-300">{formatHts10(result.htsCode10)}</span>
                      <span className="text-[11px] uppercase tracking-wide text-gray-500">
                        Ch. {String(result.chapterNumber).padStart(2, '0')} · {result.chapterTitle}
                      </span>
                    </div>
                    <ol className="mt-2 space-y-0.5 text-xs text-gray-300">
                      {result.hierarchy.map((node, idx) => {
                        const isLeaf = idx === result.hierarchy.length - 1;
                        return (
                          <li key={node.id} className={isLeaf ? 'text-white font-medium' : 'text-gray-400'} style={{ paddingLeft: `${node.indent * 12}px` }}>
                            <span className="opacity-60">{isLeaf ? '└─ ' : '├─ '}</span>
                            {node.htsNumber && <span className="font-mono mr-2 text-amber-200/80">{node.htsNumber}</span>}
                            <span>{node.description}</span>
                          </li>
                        );
                      })}
                    </ol>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
