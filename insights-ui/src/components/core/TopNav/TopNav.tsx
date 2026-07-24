'use client';

import SearchBar from '@/components/core/SearchBar';
import { UserProfile } from '@/components/core/UserProfile/UserProfile';
import MobileTopNav from '@/components/core/TopNav/MobileTopNav';
import { usePageTheme } from '@/components/theme/page-theme-context';
import { IndustryWithSubIndustriesAndCounts } from '@/types/ticker-typesv1';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Popover, PopoverButton, PopoverGroup, PopoverPanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface ReportItem {
  name: string;
  href: string;
  description: string;
  isNew: boolean;
}

interface GenAIItem {
  name: string;
  href: string;
  description: string;
}

const reportsDropdown: ReportItem[] = [
  { name: 'Crowdfunding Reports', href: '/crowd-funding', description: 'Detailed crowdfunding analysis', isNew: false },
  { name: 'Stock Reports', href: '/stocks', description: 'Value investing insights', isNew: true },
  { name: 'ETF Reports', href: '/etfs', description: 'ETF investment analysis by asset class', isNew: true },
  { name: 'Commodities', href: '/commodities', description: 'Energy, metals, agriculture & livestock analysis', isNew: true },
  { name: 'Stock Scenarios', href: '/stock-scenarios', description: 'Stocks that win or lose per scenario', isNew: true },
  { name: 'Tariff Reports', href: '/tariff-reports', description: 'Trade tariff impact analysis', isNew: false },
  { name: 'Daily Top Gainers', href: '/daily-top-movers/top-gainers/country/US', description: 'Top performing stocks today', isNew: true },
  { name: 'Daily Top Losers', href: '/daily-top-movers/top-losers/country/US', description: 'Biggest stock declines today', isNew: true },
  { name: 'Professional Managers', href: '/portfolio-managers/professional-managers', description: 'Professional Managers', isNew: false },
  { name: 'College Ambassadors', href: '/portfolio-managers/college-ambassadors', description: 'College Ambassadors', isNew: false },
];

const genaiDropdown: GenAIItem[] = [
  { name: 'GenAI Business Simulations', href: '/genai-simulation', description: 'Interactive AI business simulations' },
  { name: 'GenAI in Business - Real Cases', href: '/genai-business', description: 'Real-world AI implementation cases' },
];

export default function TopNav() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname() ?? ''; // <-- safe for null
  // The navbar themes itself by toggling its own `.dark` class rather than by
  // token swap: it already ships full `… bg-bg` variants, so
  // flipping the `.dark` ancestor is all that's needed. It reads the app-wide
  // theme from the global provider it now renders inside.
  const navTheme = usePageTheme();
  const isStocksRoute = pathname.startsWith('/stocks');
  const isEtfsRoute = pathname.startsWith('/etfs');
  const isHomeRoute = pathname === '/';

  // Lazily fetch industries: only when the mobile menu is actually opened on a
  // /stocks route. Firing from the click handler (instead of a useEffect that
  // reacts to `mobileMenuOpen`) avoids re-firing during render churn — see
  // useFetchData's setLoading(false)→setData(...) gap.
  const {
    data: industries,
    loading: industriesLoading,
    reFetchData: fetchIndustries,
  } = useFetchData<IndustryWithSubIndustriesAndCounts[]>(`${getBaseUrl()}/api/industries`, { skipInitialFetch: true }, 'Failed to load industries');

  const openMobileMenu = () => {
    setMobileMenuOpen(true);
    if (isStocksRoute && !industries && !industriesLoading) {
      fetchIndustries();
    }
  };

  // Wrap the header in a parent that carries `.dark` only in dark mode, so in
  // light mode the header renders its existing light variants instead of being
  // force-darkened.
  return (
    <div className={navTheme === 'dark' ? 'dark' : ''}>
      <header className="bg-bg">
        <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-6">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 shrink-0" aria-label="KoalaGains home">
              <span className="sr-only">KoalaGains</span>

              {/* Mobile: app icon, Desktop: full logo */}
              <Image alt="KoalaGains icon" src="/images/android-icon-512x512.png" className="h-8 w-auto sm:hidden" width={32} height={32} />
              <Image alt="KoalaGains logo" src="/koalagain_logo.png" className="hidden sm:block h-8 w-auto" width={160} height={32} />
            </Link>
            {!isHomeRoute && (
              <div className="hidden ml-4 lg:block lg:w-auto lg:min-w-[24rem]">
                <div className="max-w-full lg:max-w-none">
                  <SearchBar placeholder={isEtfsRoute ? 'Search ETFs...' : 'Search stocks...'} variant="navbar" kind={isEtfsRoute ? 'etfs' : 'stocks'} />
                </div>
              </div>
            )}
          </div>

          <div className="flex lg:hidden">
            <button type="button" onClick={openMobileMenu} className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-muted">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>

          <div className="hidden lg:flex lg:flex-1 gap-x-2 lg:justify-end">
            <div className="flex gap-6 items-center">
              {isStocksRoute && session && (
                <PopoverGroup className="flex gap-x-6">
                  <Link href="/favourites" className="text-sm/6 font-semibold text-heading hover:text-link">
                    My Favourite Stocks
                  </Link>
                </PopoverGroup>
              )}
              {isEtfsRoute && session && (
                <PopoverGroup className="flex gap-x-6">
                  <Link href="/etf-favourites" className="text-sm/6 font-semibold text-heading hover:text-link">
                    My Favourite ETFs
                  </Link>
                </PopoverGroup>
              )}
              {!isStocksRoute && !isEtfsRoute && (
                <PopoverGroup className="hidden lg:flex lg:gap-x-6">
                  <Popover className="relative">
                    {({ close }) => (
                      <>
                        <PopoverButton className="flex items-center gap-x-1 text-sm/6 font-semibold text-heading data-[open]:text-primary dark:data-[open]:text-link">
                          KoalaGains Insights
                          <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-muted data-[open]:text-primary dark:data-[open]:text-link" />
                        </PopoverButton>

                        <PopoverPanel
                          transition
                          className="absolute left-1/2 z-10 mt-3 w-screen max-w-xs -translate-x-1/2 overflow-hidden rounded-3xl shadow-lg outline outline-1 outline-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in bg-surface dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                        >
                          <div className="p-2.5">
                            {reportsDropdown.map((item) => (
                              <div
                                key={item.name}
                                className="group relative flex items-center gap-x-6 rounded-lg p-3 text-sm/6 hover:bg-surface dark:hover:bg-white/5"
                              >
                                <div className="flex-auto">
                                  <Link href={item.href} className="block font-semibold text-heading" onClick={() => close()}>
                                    {item.name}
                                    <span className="absolute inset-0" />
                                  </Link>
                                  <p className="mt-1 text-xs text-muted">{item.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </PopoverPanel>
                      </>
                    )}
                  </Popover>

                  <Popover className="relative">
                    {({ close }) => (
                      <>
                        <PopoverButton className="flex items-center gap-x-1 text-sm/6 font-semibold text-heading data-[open]:text-primary dark:data-[open]:text-link">
                          Gen AI Adoption
                          <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-muted data-[open]:text-primary dark:data-[open]:text-link" />
                        </PopoverButton>

                        <PopoverPanel
                          transition
                          className="absolute left-1/2 z-10 mt-3 w-screen max-w-xs -translate-x-1/2 overflow-hidden rounded-3xl shadow-lg outline outline-1 outline-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in bg-surface dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                        >
                          <div className="p-3">
                            {genaiDropdown.map((item) => (
                              <div
                                key={item.name}
                                className="group relative flex items-center gap-x-6 rounded-lg p-3 text-sm/6 hover:bg-surface dark:hover:bg-white/5"
                              >
                                <div className="flex-auto">
                                  <Link href={item.href} className="block font-semibold text-heading" onClick={() => close()}>
                                    {item.name}
                                    <span className="absolute inset-0" />
                                  </Link>
                                  <p className="mt-1 text-muted">{item.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </PopoverPanel>
                      </>
                    )}
                  </Popover>
                </PopoverGroup>
              )}
              <UserProfile />
            </div>
          </div>
        </nav>

        <MobileTopNav
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          industries={industries}
          industriesLoading={industriesLoading}
          reportsDropdown={reportsDropdown}
          genaiDropdown={genaiDropdown}
        />
      </header>
    </div>
  );
}
