'use client';

import SearchBar from '@/components/core/SearchBar';
import { IndustryWithSubIndustriesAndCounts } from '@/types/ticker-typesv1';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Dialog, DialogPanel, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileTopNavProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  reportsDropdown: Array<{
    name: string;
    href: string;
    description: string;
    isNew: boolean;
  }>;
  genaiDropdown: Array<{
    name: string;
    href: string;
    description: string;
  }>;
}

export default function MobileTopNav({ mobileMenuOpen, setMobileMenuOpen, reportsDropdown, genaiDropdown }: MobileTopNavProps) {
  const pathname = usePathname() ?? '';
  const isStocksRoute = pathname.startsWith('/stocks');

  // Fetch industries data when on stocks page
  const { data: industries, loading } = useFetchData<IndustryWithSubIndustriesAndCounts[]>(`${getBaseUrl()}/api/industries`, {}, 'Failed to load industries');

  return (
    <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
      <div className="fixed inset-0 z-50" />
      <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:bg-gray-900 dark:sm:ring-white/10">
        <div className="flex items-center justify-between">
          <Link href="/" className="-m-1.5 p-1.5" aria-label="KoalaGains home">
            <span className="sr-only">KoalaGains</span>
            {/* Mobile: app icon */}
            <img alt="KoalaGains icon" src="/images/android-icon-512x512.png" className="h-8 w-auto" />
          </Link>
          <button type="button" onClick={() => setMobileMenuOpen(false)} className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-400">
            <span className="sr-only">Close menu</span>
            <XMarkIcon aria-hidden="true" className="size-6" />
          </button>
        </div>

        <div className="mt-6 flow-root">
          <div className="mb-4">
            <SearchBar placeholder="Search stocks..." variant="navbar" />
          </div>

          <div className="-my-6 divide-y divide-gray-500/10 dark:divide-white/10">
            <div className="space-y-2 py-6">
              {isStocksRoute ? (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Industries</h3>

                  {loading ? (
                    <div className="text-center">
                      <div
                        className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] text-gray-500 dark:text-gray-400"
                        role="status"
                      >
                        <span className="sr-only">Loading...</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading industries...</p>
                    </div>
                  ) : !industries || industries.length === 0 ? (
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No industries found.</p>
                      <Link
                        href="/stocks"
                        className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        View all stocks
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {industries
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((industry) => (
                          <Link
                            key={industry.industryKey}
                            href={`/stocks/industries/${encodeURIComponent(industry.industryKey)}`}
                            className="flex items-center rounded-lg py-2 px-3 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <span className="truncate text-[#F59E0B]">
                              {industry.name} ({industry.tickerCount}){' '}
                            </span>
                            <span className="ml-2 flex items-center">
                              <span className="text-[#F59E0B]">→</span>
                            </span>
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Disclosure as="div" className="-mx-3">
                    <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5">
                      KoalaGains Insights
                      <ChevronDownIcon aria-hidden="true" className="size-5 flex-none group-data-[open]:rotate-180" />
                    </DisclosureButton>
                    <DisclosurePanel className="mt-2 space-y-2">
                      {[...reportsDropdown].map((item) => (
                        <DisclosureButton
                          key={item.name}
                          as={Link}
                          href={item.href}
                          className="block rounded-lg py-2 pl-6 pr-3 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
                        >
                          {item.name}
                        </DisclosureButton>
                      ))}
                    </DisclosurePanel>
                  </Disclosure>

                  <Disclosure as="div" className="-mx-3">
                    <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5">
                      Gen AI Adoption
                      <ChevronDownIcon aria-hidden="true" className="size-5 flex-none group-data-[open]:rotate-180" />
                    </DisclosureButton>
                    <DisclosurePanel className="mt-2 space-y-2">
                      {[...genaiDropdown].map((item) => (
                        <DisclosureButton
                          key={item.name}
                          as={Link}
                          href={item.href}
                          className="block rounded-lg py-2 pl-6 pr-3 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
                        >
                          {item.name}
                        </DisclosureButton>
                      ))}
                    </DisclosurePanel>
                  </Disclosure>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
