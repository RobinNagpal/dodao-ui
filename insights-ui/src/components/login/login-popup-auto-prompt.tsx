'use client';

import { LoginPopup } from '@/components/login/login-popup';
import { isInCooldown, isLikelyBot, safeGetSession, safeSetLocal, safeSetSession } from '@/components/login/login-popup-utils';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_THRESHOLD = 3;
const SHOW_DELAY_MS = 1500;
const RESHOW_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

const NAV_COUNT_KEY = 'loginPopupNavCount';
const LAST_PATH_KEY = 'loginPopupLastPath';
const SHOWN_KEY = 'loginPopupShown';
const DISMISSED_AT_KEY = 'loginPopupDismissedAt';

const EXCLUDED_PATH_PREFIXES: readonly string[] = [
  '/login',
  '/authenticate',
  '/auth',
  '/admin-v1',
  '/prompts',
  '/invocations',
  '/public-equities',
  '/generate-ppt',
  '/api',
  '/blogs',
];

function isExcludedPath(pathname: string): boolean {
  if (EXCLUDED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return true;
  // `tariff-updates` report pages (both `/industry-tariff-report/<industryId>/tariff-updates` and
  // `/industry-tariff-report/chapters/<chapterSlug>/tariff-updates`) run their own scroll-end login
  // trigger, so they must not count toward the 3-navigation budget, and this auto-prompt must never
  // fire while on them. The shared cooldown key still links the two surfaces.
  if (pathname.startsWith('/industry-tariff-report/') && pathname.endsWith('/tariff-updates')) return true;
  return false;
}

function readNavCount(): number {
  const raw = safeGetSession(NAV_COUNT_KEY);
  if (!raw) return 0;
  const n = Number.parseInt(raw, 10);
  return Number.isNaN(n) ? 0 : n;
}

export function LoginPopupAutoPrompt(): JSX.Element | null {
  const pathname = usePathname() ?? '';
  const { status } = useSession();
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'authenticated') {
      safeSetSession(NAV_COUNT_KEY, '0');
      return;
    }
    if (!pathname) return;
    if (isLikelyBot()) return;
    if (isExcludedPath(pathname)) return;

    const lastPath = safeGetSession(LAST_PATH_KEY);
    if (lastPath === pathname) return;
    safeSetSession(LAST_PATH_KEY, pathname);

    if (safeGetSession(SHOWN_KEY) === '1') return;

    if (isInCooldown(DISMISSED_AT_KEY, RESHOW_COOLDOWN_MS)) return;

    const nextCount = readNavCount() + 1;
    safeSetSession(NAV_COUNT_KEY, String(nextCount));

    if (nextCount < NAV_THRESHOLD) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
      safeSetSession(SHOWN_KEY, '1');
    }, SHOW_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pathname, status]);

  const handleClose = (): void => {
    setOpen(false);
    safeSetLocal(DISMISSED_AT_KEY, String(Date.now()));
  };

  if (status !== 'unauthenticated') return null;

  return <LoginPopup open={open} onClose={handleClose} />;
}
