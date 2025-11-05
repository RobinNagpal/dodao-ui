'use client';

import SearchBar from '@/components/core/SearchBar';
import { UserProfile } from '@/components/core/UserProfile/UserProfile';
import { Dialog, DialogPanel, Disclosure, DisclosureButton, DisclosurePanel, Popover, PopoverButton, PopoverGroup, PopoverPanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

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
  { name: 'Tariff Reports', href: '/tariff-reports', description: 'Trade tariff impact analysis', isNew: false },
  { name: 'All Reports', href: '/reports', description: 'Browse all available reports', isNew: false },
];

const genaiDropdown: GenAIItem[] = [
  { name: 'GenAI Business Simulations', href: '/genai-simulation', description: 'Interactive AI business simulations' },
  { name: 'GenAI in Business - Real Cases', href: '/genai-business', description: 'Real-world AI implementation cases' },
];

export default function TopNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname() ?? ''; // <-- safe for null
  const isStocksRoute = pathname.startsWith('/stocks');

  // Wrap the whole header in a parent with className="dark" to force dark mode here
  return (
    <div className="dark">
      <header className="bg-white dark:bg-gray-900">
        <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-6">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 shrink-0" aria-label="KoalaGains home">
              <span className="sr-only">KoalaGains</span>

              {/* Mobile: app icon, Desktop: full logo */}
              <img alt="KoalaGains icon" src="/images/android-icon-512x512.png" className="h-8 w-auto sm:hidden" />
              <img alt="KoalaGains logo" src="/koalagain_logo.png" className="hidden sm:block h-8 w-auto" />
            </Link>
            <div className="hidden ml-4 lg:block lg:w-auto lg:min-w-[24rem]">
              <div className="max-w-full lg:max-w-none">
                <SearchBar placeholder="Search stocks..." variant="navbar" />
              </div>
            </div>
          </div>

          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-400"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>

          <div className="hidden lg:flex lg:flex-1 gap-x-2 lg:justify-end">
            <div className="flex gap-6">
              {!isStocksRoute && (
                <PopoverGroup className="hidden lg:flex lg:gap-x-6">
                  <Popover className="relative">
                    <PopoverButton className="flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900 dark:text-white">
                      KoalaGains Insights
                      <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-gray-400 dark:text-gray-500" />
                    </PopoverButton>

                    <PopoverPanel
                      transition
                      className="absolute left-1/2 z-10 mt-3 w-screen max-w-md -translate-x-1/2 overflow-hidden rounded-3xl bg-white shadow-lg outline outline-1 outline-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                    >
                      <div className="p-4">
                        {reportsDropdown.map((item) => (
                          <div
                            key={item.name}
                            className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50 dark:hover:bg-white/5"
                          >
                            <div className="flex-auto">
                              <Link href={item.href} className="block font-semibold text-gray-900 dark:text-white">
                                {item.name}
                                <span className="absolute inset-0" />
                              </Link>
                              <p className="mt-1 text-gray-600 dark:text-gray-400">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </PopoverPanel>
                  </Popover>

                  <Popover className="relative">
                    <PopoverButton className="flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900 dark:text-white">
                      Gen AI Adoption
                      <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-gray-400 dark:text-gray-500" />
                    </PopoverButton>

                    <PopoverPanel
                      transition
                      className="absolute left-1/2 z-10 mt-3 w-screen max-w-md -translate-x-1/2 overflow-hidden rounded-3xl bg-white shadow-lg outline outline-1 outline-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                    >
                      <div className="p-4">
                        {genaiDropdown.map((item) => (
                          <div
                            key={item.name}
                            className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50 dark:hover:bg-white/5"
                          >
                            <div className="flex-auto">
                              <Link href={item.href} className="block font-semibold text-gray-900 dark:text-white">
                                {item.name}
                                <span className="absolute inset-0" />
                              </Link>
                              <p className="mt-1 text-gray-600 dark:text-gray-400">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </PopoverPanel>
                  </Popover>
                </PopoverGroup>
              )}
              <UserProfile />
            </div>
          </div>
        </nav>

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
                  {!isStocksRoute && (
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

                <div className="py-6">
                  <UserProfile isMobile={true} onMenuToggle={(): void => setMobileMenuOpen(false)} />
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>
    </div>
  );
}
