'use client';

import SearchBar from '@/components/core/SearchBar';
import { UserProfile } from '@/components/core/UserProfile/UserProfile';
import MobileTopNav from '@/components/core/TopNav/MobileTopNav';
import { usePageTheme } from '@/components/theme/page-theme-context';
import { IndustryWithSubIndustriesAndCounts } from '@/types/ticker-typesv1';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { PopoverGroup } from '@headlessui/react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: 'Stock Reports', href: '/stocks' },
  { name: 'ETF Reports', href: '/etfs' },
  { name: 'Tariff Reports', href: '/tariff-reports' },
  { name: 'Top Gainers & Losers', href: '/daily-top-movers' },
];

export default function TopNav() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname() ?? ''; // <-- safe for null
  // The navbar themes itself by toggling its own `.dark` class rather than by
  // token swap: it already ships full `bg-white … dark:bg-gray-900` variants, so
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
      <header className="bg-white dark:bg-gray-900">
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
            <button
              type="button"
              onClick={openMobileMenu}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-400"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>

          <div className="hidden lg:flex lg:flex-1 gap-x-2 lg:justify-end">
            <div className="flex gap-6 items-center">
              {isStocksRoute && session && (
                <PopoverGroup className="flex gap-x-6">
                  <Link href="/favourites" className="text-sm/6 font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                    My Favourite Stocks
                  </Link>
                </PopoverGroup>
              )}
              {isEtfsRoute && session && (
                <PopoverGroup className="flex gap-x-6">
                  <Link
                    href="/etf-favourites"
                    className="text-sm/6 font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    My Favourite ETFs
                  </Link>
                </PopoverGroup>
              )}
              {!isStocksRoute && !isEtfsRoute && (
                <div className="hidden lg:flex lg:gap-x-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-sm/6 font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
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
          navItems={navItems}
        />
      </header>
    </div>
  );
}
