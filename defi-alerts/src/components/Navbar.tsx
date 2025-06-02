'use client';

import { getAlertsSpaceIdClientSide } from '@/utils/getAlertsSpaceIdClientSide';
import { useAuth } from '@dodao/web-core/ui/auth/useAuth';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: session } = useSession();
  const spaceId = getAlertsSpaceIdClientSide();
  const { logout } = useAuth(spaceId);
  const isLoggedIn = !!session;

  const tabs = [
    { name: 'Compound Alerts', href: '/alerts' },
    { name: 'Compound vs Others', href: '/alerts/compare-compound' },
  ];

  if (pathname === '/login' || (pathname === '/' && !session?.user)) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-theme-primary border-b">
      <nav className="flex max-w-7xl items-center justify-between py-4 mx-4 xl:mx-auto">
        <div className="flex lg:flex-1 lg:items-center lg:gap-x-12">
          <Link href="/alerts" className="-m-1.5 p-1.5">
            <span className="sr-only">Defi Alerts for Compound</span>
            <img
              src="https://d31h13bdjwgzxs.cloudfront.net/academy/compound-eth-1/Space/compound/1717288684207_compound-comp-logo.png"
              alt=""
              className="h-8 w-auto"
            />
          </Link>

          <div className="hidden lg:flex lg:gap-x-12">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={isActive ? 'text-sm font-medium text-primary-color' : 'text-sm font-medium text-theme-primary hover-text-primary'}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right side buttons */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-4">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm border border-primary-color text-theme-primary rounded-lg hover-bg-primary-color hover-text-primary-text"
            >
              Logout
            </button>
          ) : (
            <a href="/login" className="px-4 py-2 text-sm bg-primary-color text-primary-text border border-transparent rounded-lg hover-border-body">
              Login <span aria-hidden="true">&rarr;</span>
            </a>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button onClick={() => setMobileMenuOpen(true)} className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700">
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <Dialog open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} className="lg:hidden">
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/alerts" className="-m-1.5 p-1.5">
              <span className="sr-only">Defi Alerts for Compound</span>
              <img
                src="https://d31h13bdjwgzxs.cloudfront.net/academy/compound-eth-1/Space/compound/1717288684207_compound-comp-logo.png"
                alt=""
                className="h-8 w-auto"
              />
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="-m-2.5 rounded-md p-2.5 text-gray-700">
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 space-y-2">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={
                    isActive
                      ? 'block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 bg-gray-100'
                      : 'block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-100'
                  }
                >
                  {tab.name}
                </Link>
              );
            })}
            {isLoggedIn ? (
              <button onClick={handleLogout} className="w-full text-left block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50">
                Logout
              </button>
            ) : (
              <a href="/login" className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50">
                Log in
              </a>
            )}
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
