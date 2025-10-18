'use client';

import { KoalaGainsSession } from '@/types/auth';
import { UserIcon } from '@heroicons/react/24/solid';
import { signOut, useSession } from 'next-auth/react';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface UserProfileProps {
  isMobile?: boolean;
  onMenuToggle?: () => void;
}

export function UserProfile({ isMobile = false, onMenuToggle }: UserProfileProps): JSX.Element {
  const { data: koalaSession } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;
  const toggleUserMenu = (): void => {
    setUserMenuOpen((prev) => !prev);
  };

  function deleteAllCookies() {
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });
  }

  const handleUserLogout = async () => {
    localStorage.clear();
    deleteAllCookies();
    await signOut({
      redirect: true,
      callbackUrl: `/?updated=${Date.now()}`,
    });

    setUserMenuOpen(false);
    if (onMenuToggle) {
      onMenuToggle();
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!isMobile) {
      const handleClickOutside = (event: MouseEvent): void => {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
          setUserMenuOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMobile]);

  if (isMobile) {
    return (
      <>
        {session ? (
          <>
            {session.role === 'Admin' && (
              <>
                <Link
                  href="/prompts"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-300 hover:bg-gray-700 w-full text-left"
                  onClick={onMenuToggle}
                >
                  Prompts
                </Link>
                <Link
                  href="/invocations"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-300 hover:bg-gray-700 w-full text-left"
                  onClick={onMenuToggle}
                >
                  Invocations
                </Link>
                <Link
                  href="/tickers-v1-requests"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-300 hover:bg-gray-700 w-full text-left"
                  onClick={onMenuToggle}
                >
                  Requests
                </Link>
                <Link
                  href="/admin-v1/industry-management"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-300 hover:bg-gray-700 w-full text-left"
                  onClick={onMenuToggle}
                >
                  Industry Management
                </Link>
                <Link
                  href="/admin-v1/ticker-management"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-300 hover:bg-gray-700 w-full text-left"
                  onClick={onMenuToggle}
                >
                  Ticker Management
                </Link>
                <div className="border-t border-gray-700 my-1"></div>
              </>
            )}
            <button
              onClick={handleUserLogout}
              className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-300 hover:bg-gray-700 w-full text-left"
            >
              Log out
            </button>
          </>
        ) : (
          <Link href="/login" className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-300 hover:bg-gray-700 w-full text-left">
            Log in
          </Link>
        )}
      </>
    );
  }

  return (
    <>
      {session ? (
        <div className="relative" ref={userMenuRef}>
          <div>
            <button
              type="button"
              onClick={toggleUserMenu}
              className="relative flex text-sm ring-2 ring-color rounded-full hover:ring-indigo-400 transition-colors duration-200"
              id="user-menu-button"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <span className="absolute -inset-1.5"></span>
              <span className="sr-only">Open user menu</span>
              <UserIcon className="m-2 text-color h-5 w-5" />
            </button>
          </div>
          {userMenuOpen && (
            <div
              className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md background-color py-1 ring-1 shadow-lg ring-color focus:outline-hidden"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu-button"
            >
              {session.role === 'Admin' && (
                <>
                  <Link href="/prompts" className="block w-full px-4 py-2 text-sm font-semibold text-color cursor-pointer text-left hover:bg-gray-700">
                    Prompts
                  </Link>
                  <Link href="/invocations" className="block w-full px-4 py-2 text-sm font-semibold text-color cursor-pointer text-left hover:bg-gray-700">
                    Invocations
                  </Link>
                  <Link
                    href="/tickers-v1-requests"
                    className="block w-full px-4 py-2 text-sm font-semibold text-color cursor-pointer text-left hover:bg-gray-700"
                  >
                    Requests
                  </Link>
                  <Link
                    href="/admin-v1/industry-management"
                    className="block w-full px-4 py-2 text-sm font-semibold text-color cursor-pointer text-left hover:bg-gray-700"
                  >
                    Industry Management
                  </Link>
                  <Link
                    href="/admin-v1/ticker-management"
                    className="block w-full px-4 py-2 text-sm font-semibold text-color cursor-pointer text-left hover:bg-gray-700"
                  >
                    Ticker Management
                  </Link>
                  <div className="border-t border-gray-700 my-1"></div>
                </>
              )}
              <button
                className="block w-full px-4 py-2 text-sm font-semibold text-color cursor-pointer text-left hover:bg-gray-700"
                id="user-menu-item-2"
                onClick={handleUserLogout}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login" className="text-sm/6 font-semibold text-color cursor-pointer hover:text-indigo-400 transition-colors duration-200">
          Log in <span aria-hidden="true">&rarr;</span>
        </Link>
      )}
    </>
  );
}
