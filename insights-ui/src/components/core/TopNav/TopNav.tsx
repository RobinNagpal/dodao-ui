'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { UserProfile } from '@/components/core/UserProfile/UserProfile';
import SearchBar from '@/components/core/SearchBar';

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

interface NavigationItem {
  name: string;
  href: string;
  newTab: boolean;
}

const reportsDropdown: ReportItem[] = [
  { name: 'Crowdfunding Reports', href: '/crowd-funding', description: 'Detailed crowdfunding analysis', isNew: false },
  { name: 'Stock Reports', href: '/stocks', description: 'Value investing insights', isNew: true },
  { name: 'Tariff Reports', href: '/tariff-reports', description: 'Trade tariff impact analysis', isNew: false },
  { name: 'All Reports', href: '/reports', description: 'Browse all available reports', isNew: false },
];

const genaiDropdown: GenAIItem[] = [
  { name: 'GenAI Business Simulations', href: '/genai-simulation', description: 'Interactive AI business simulations' },
  { name: 'GenAI in Business - Real Cases', href: '/genai-business', description: 'Real-world AI implementation cases' },
];

const navigation: NavigationItem[] = [
  { name: 'Blogs', href: '/blogs', newTab: true },
  // { name: 'Platform Docs', href: 'https://docs.koalagains.com', newTab: true },
];

export default function TopNav(): JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState<boolean>(false);
  const [genaiDropdownOpen, setGenaiDropdownOpen] = useState<boolean>(false);
  const [mobileReportsOpen, setMobileReportsOpen] = useState<boolean>(false);
  const [mobileGenaiOpen, setMobileGenaiOpen] = useState<boolean>(false);

  const reportsDropdownRef = useRef<HTMLDivElement | null>(null);
  const genaiDropdownRef = useRef<HTMLDivElement | null>(null);

  const pathname: string = usePathname();
  const isStocksRoute: boolean = pathname.startsWith('/stocks');

  // Close menus when clicking outside
  useEffect((): (() => void) => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (reportsDropdownRef.current && !reportsDropdownRef.current.contains(event.target as Node)) {
        setReportsDropdownOpen(false);
      }
      if (genaiDropdownRef.current && !genaiDropdownRef.current.contains(event.target as Node)) {
        setGenaiDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gray-800 mt-2 overflow-x-clip">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-2 lg:px-8">
        {/* Left: logo + search */}
        <div className="flex items-center space-x-3 sm:space-x-6 w-full lg:w-auto min-w-0">
          <Link href="/" className="-m-1.5 p-1.5 shrink-0" aria-label="KoalaGains home">
            <span className="sr-only">KoalaGains</span>

            {/* Mobile: app icon, Desktop: full logo */}
            <img alt="KoalaGains icon" src="/images/android-icon-512x512.png" className="h-8 w-auto sm:hidden" />
            <img alt="KoalaGains logo" src="/koalagain_logo.png" className="hidden sm:block h-8 w-auto" />
          </Link>

          {/* Search Bar
              - Always visible on desktop
              - On mobile, visible in the mobile menu for all routes */}
          <div className="flex-1 min-w-0 lg:block lg:w-auto lg:min-w-[24rem]">
            <div className="max-w-full lg:max-w-none">
              <SearchBar placeholder="Search stocks..." variant="navbar" />
            </div>
          </div>
        </div>

        {/* Right: mobile hamburger, desktop menus hidden on /stocks but profile always visible on lg */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={(): void => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md py-2.5 pl-4 pr-2.5 text-gray-300 hover:text-white"
            aria-label="Open main menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>

        {/* Desktop right side */}
        <div className="hidden lg:flex lg:items-center lg:space-x-8">
          {/* Desktop menus (hidden on /stocks) */}
          {!isStocksRoute && (
            <>
              {/* KoalaGains Insights Dropdown */}
              <div className="relative" ref={reportsDropdownRef}>
                <button
                  type="button"
                  onClick={(): void => setReportsDropdownOpen((prev) => !prev)}
                  onMouseEnter={(): void => setReportsDropdownOpen(true)}
                  onTouchStart={(): void => setReportsDropdownOpen((prev) => !prev)}
                  className="flex items-center text-sm/6 font-semibold text-color hover:text-indigo-400 transition-colors duration-200"
                  aria-expanded={reportsDropdownOpen}
                  aria-haspopup="true"
                >
                  KoalaGains Insights
                  <ChevronDownIcon aria-hidden="true" className={`ml-1 h-4 w-4 transition-transform duration-200 ${reportsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {reportsDropdownOpen && (
                  <div
                    onMouseLeave={(): void => setReportsDropdownOpen(false)}
                    onTouchStart={(e): void => e.stopPropagation()}
                    className="absolute left-0 z-20 mt-2 w-64 origin-top-left rounded-md bg-gray-700 shadow-xl ring-1 ring-gray-600 focus:outline-none overflow-hidden"
                    role="menu"
                  >
                    {reportsDropdown.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-600 hover:text-white transition-colors duration-150"
                        onClick={(): void => setReportsDropdownOpen(false)}
                      >
                        <div className="font-semibold flex items-center">
                          {item.name}
                          {item.isNew && <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-400 text-gray-900">NEW</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* GenAI Adoption Dropdown */}
              <div className="relative" ref={genaiDropdownRef}>
                <button
                  type="button"
                  onClick={(): void => setGenaiDropdownOpen((prev) => !prev)}
                  onMouseEnter={(): void => setGenaiDropdownOpen(true)}
                  onTouchStart={(): void => setGenaiDropdownOpen((prev) => !prev)}
                  className="flex items-center text-sm/6 font-semibold text-color hover:text-indigo-400 transition-colors duration-200"
                  aria-expanded={genaiDropdownOpen}
                  aria-haspopup="true"
                >
                  GenAI Adoption
                  <ChevronDownIcon aria-hidden="true" className={`ml-1 h-4 w-4 transition-transform duration-200 ${genaiDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {genaiDropdownOpen && (
                  <div
                    onMouseLeave={(): void => setGenaiDropdownOpen(false)}
                    onTouchStart={(e): void => e.stopPropagation()}
                    className="absolute left-0 z-20 mt-2 w-72 origin-top-left rounded-md bg-gray-700 shadow-xl ring-1 ring-gray-600 focus:outline-none overflow-hidden"
                    role="menu"
                  >
                    {genaiDropdown.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-600 hover:text-white transition-colors duration-150"
                        onClick={(): void => setGenaiDropdownOpen(false)}
                      >
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Regular Navigation Items */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm/6 font-semibold text-color hover:text-indigo-400 transition-colors duration-200"
                  target={item.newTab ? '_blank' : '_self'}
                  rel={item.newTab ? 'noopener noreferrer' : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </>
          )}

          {/* User Menu (ALWAYS visible on large screens) */}
          <UserProfile />
        </div>
      </nav>

      {/* Mobile Menu - Always rendered for all routes */}
      {
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-10" />
          <DialogPanel
            id="mobile-menu"
            className="fixed inset-y-0 right-0 z-10 w-[85%] overflow-y-auto bg-gray-800 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5" aria-label="KoalaGains home">
                <span className="sr-only">KoalaGains</span>
                {/* Mobile: app icon */}
                <img alt="KoalaGains icon" src="/images/android-icon-512x512.png" className="h-8 w-auto" />
              </Link>
              <button
                type="button"
                onClick={(): void => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-300 hover:text-white"
                aria-label="Close menu"
              >
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {/* Mobile KoalaGains Insights */}
                  <div>
                    <button
                      onClick={(): void => setMobileReportsOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between -mx-3 rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-300 hover:bg-gray-700"
                      aria-expanded={mobileReportsOpen}
                      aria-controls="mobile-reports"
                    >
                      KoalaGains Insights
                      <ChevronDownIcon aria-hidden="true" className={`h-5 w-5 transition-transform duration-200 ${mobileReportsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileReportsOpen && (
                      <div id="mobile-reports" className="ml-4 mt-2 space-y-2">
                        {reportsDropdown.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="block -mx-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                            onClick={(): void => {
                              setMobileReportsOpen(false);
                              setMobileMenuOpen(false);
                            }}
                          >
                            <div className="flex items-center">
                              {item.name}
                              {item.isNew && <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-400 text-gray-900">NEW</span>}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mobile GenAI Adoption */}
                  <div>
                    <button
                      onClick={(): void => setMobileGenaiOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between -mx-3 rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-300 hover:bg-gray-700"
                      aria-expanded={mobileGenaiOpen}
                      aria-controls="mobile-genai"
                    >
                      GenAI Adoption
                      <ChevronDownIcon aria-hidden="true" className={`h-5 w-5 transition-transform duration-200 ${mobileGenaiOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileGenaiOpen && (
                      <div id="mobile-genai" className="ml-4 mt-2 space-y-2">
                        {genaiDropdown.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="block -mx-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                            onClick={(): void => {
                              setMobileGenaiOpen(false);
                              setMobileMenuOpen(false);
                            }}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Regular Mobile Navigation */}
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-300 hover:bg-gray-700"
                      target={item.newTab ? '_blank' : '_self'}
                      rel={item.newTab ? 'noopener noreferrer' : undefined}
                      onClick={(): void => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="py-6">
                  <UserProfile isMobile={true} onMenuToggle={(): void => setMobileMenuOpen(false)} />
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      }
    </header>
  );
}
