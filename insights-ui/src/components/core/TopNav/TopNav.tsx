'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { UserIcon } from '@heroicons/react/24/solid';
import AdminLoginModal from '@/components/ui/AdminLoginModal';
import { getAuthKey } from '@/util/auth/authKey';

const navigation = [
  { name: 'Crowdfunding Reports', href: '/crowd-funding', newTab: false },
  { name: 'REIT Reports', href: '/public-equities/tickers', newTab: false },
  { name: 'Blog', href: '/blogs', newTab: true },
  { name: 'Reports', href: '/reports', newTab: false },
  { name: 'Docs', href: 'https://docs.koalagains.com', newTab: true },
];

export default function TopNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const checkLoginStatus = () => {
    setIsLoggedin(!!getAuthKey());
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('AUTHENTICATION_KEY');
    setIsLoggedin(false);
    setMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLoginSuccess = () => {
    checkLoginStatus();
  };

  // Close the menu when clicking outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gray-800 mt-2">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-2 lg:px-8">
        <Link href="/" className="-m-1.5 p-1.5">
          <span className="sr-only">KoalaGains</span>
          <img alt="" src="/koalagain_logo.png" className="h-8 w-auto" />
        </Link>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-300 hover:text-white"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12 items-center">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className="text-sm/6 font-semibold text-color" target={item.newTab ? '_blank' : '_self'}>
              {item.name}
            </Link>
          ))}
          {isLoggedin ? (
            <div className="relative" ref={menuRef}>
              <div>
                <button
                  type="button"
                  onClick={toggleMenu}
                  className="relative flex text-sm ring-2 ring-color rounded-full"
                  id="user-menu-button"
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                >
                  <span className="absolute -inset-1.5"></span>
                  <span className="sr-only">Open user menu</span>
                  <UserIcon className="m-2 text-color h-5 w-5" />
                </button>
              </div>
              {menuOpen && (
                <div
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md background-color py-1 ring-1 shadow-lg ring-color focus:outline-hidden"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <Link href="/prompts" className="block w-full px-4 py-2 text-sm font-semibold text-color cursor-pointer text-left hover:bg-gray-700">
                    Prompts
                  </Link>
                  <Link href="/invocations" className="block w-full px-4 py-2 text-sm font-semibold text-color cursor-pointer text-left hover:bg-gray-700">
                    Invocations
                  </Link>
                  <div className="border-t border-gray-700 my-1"></div>
                  <button
                    className="block w-full px-4 py-2 text-sm font-semibold text-color cursor-pointer text-left hover:bg-gray-700"
                    id="user-menu-item-2"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setLoginModalOpen(true)} className="text-sm/6 font-semibold text-color cursor-pointer">
              Log in <span aria-hidden="true">&rarr;</span>
            </button>
          )}
        </div>
      </nav>
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-gray-800 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-700/50">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">KoalaGains</span>
              <img alt="" src="/koalagain_logo.png" className="h-8 w-auto" />
            </Link>
            <button type="button" onClick={() => setMobileMenuOpen(false)} className="-m-2.5 rounded-md p-2.5 text-gray-300 hover:text-white">
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-300 hover:bg-gray-700"
                    target={item.newTab ? '_blank' : '_self'}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                {isLoggedin ? (
                  <>
                    <Link
                      href="/prompts"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-300 hover:bg-gray-700 w-full text-left"
                    >
                      Prompts
                    </Link>
                    <Link
                      href="/invocations"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-300 hover:bg-gray-700 w-full text-left"
                    >
                      Invocations
                    </Link>
                    <div className="border-t border-gray-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-300 hover:bg-gray-700 w-full text-left"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-300 hover:bg-gray-700 w-full text-left"
                  >
                    Log in
                  </button>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
      <AdminLoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} />
    </header>
  );
}
