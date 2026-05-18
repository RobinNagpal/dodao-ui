'use client';

import { useEffect, useState } from 'react';
import { Bars3Icon, ChevronDoubleLeftIcon } from '@heroicons/react/20/solid';
import type { ReactNode } from 'react';
import EtfListingSidebar from '@/components/etfs/EtfListingSidebar';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';

const STORAGE_KEY = 'etf-listing-sidebar-open';

interface EtfPageLayoutShellProps {
  country: EtfSupportedCountry;
  children: ReactNode;
}

/**
 * Client shell that hosts the ETF listing sidebar in a collapsible flex layout
 * starting at `lg` (1024px+). When the user collapses the rail, the page reverts
 * to the original PageWrapper-only layout (max-w-7xl centered) and a floating
 * "Browse" tab appears on the left edge to reopen.
 *
 * Open/closed state persists across navigations via localStorage. SSR always
 * renders the open state; if the visitor previously collapsed it, the effect
 * below collapses it again on hydration (brief flash, acceptable for v1).
 */
export default function EtfPageLayoutShell({ country, children }: EtfPageLayoutShellProps) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'false') setIsOpen(false);
    } catch {
      // localStorage unavailable — keep default open state
    }
  }, []);

  const setOpenPersist = (value: boolean) => {
    setIsOpen(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // ignore
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setOpenPersist(true)}
          className="hidden lg:inline-flex fixed left-0 top-28 z-20 items-center gap-1.5 pl-2 pr-3 py-2 rounded-r-lg border border-l-0 border-white/10 bg-gray-900/90 hover:bg-gray-800 text-white text-xs font-medium shadow-lg backdrop-blur"
          aria-label="Open browse sidebar"
        >
          <Bars3Icon className="h-4 w-4" />
          Browse
        </button>
      )}
      <div className={isOpen ? 'lg:flex lg:items-start lg:gap-4 lg:pl-3' : ''}>
        <aside
          className={`${
            isOpen ? 'hidden lg:block' : 'hidden'
          } w-52 shrink-0 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-3`}
        >
          <div className="flex items-center justify-between mb-2 pl-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Browse</span>
            <button
              type="button"
              onClick={() => setOpenPersist(false)}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/5"
              aria-label="Collapse browse sidebar"
            >
              <ChevronDoubleLeftIcon className="h-4 w-4" />
            </button>
          </div>
          <EtfListingSidebar country={country} />
        </aside>
        <div className={isOpen ? 'lg:flex-1 lg:min-w-0' : ''}>{children}</div>
      </div>
    </>
  );
}
