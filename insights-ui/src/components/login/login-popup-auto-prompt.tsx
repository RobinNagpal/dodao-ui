'use client';

import { LoginPopup } from '@/components/login/login-popup';
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

const BOT_UA_PATTERN =
  /bot|crawler|spider|crawling|slurp|bingpreview|mediapartners|adsbot|googlebot|baiduspider|yandex|duckduckbot|facebot|facebookexternalhit|twitterbot|linkedinbot|embedly|quora link preview|pinterest|whatsapp|telegrambot|applebot|petalbot|semrush|ahrefs|mj12bot|dotbot|seznambot|sogou|exabot|gigabot|ia_archiver|chrome-lighthouse|headlesschrome|phantomjs|prerender/i;

function isExcludedPath(pathname: string): boolean {
  return EXCLUDED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isLikelyBot(): boolean {
  if (typeof navigator === 'undefined') return true;
  if (navigator.webdriver === true) return true;
  return BOT_UA_PATTERN.test(navigator.userAgent || '');
}

function isInCooldown(): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_AT_KEY);
    if (!raw) return false;
    const dismissedAt = Number.parseInt(raw, 10);
    if (Number.isNaN(dismissedAt)) return false;
    return Date.now() - dismissedAt < RESHOW_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function readNavCount(): number {
  try {
    const raw = sessionStorage.getItem(NAV_COUNT_KEY);
    if (!raw) return 0;
    const n = Number.parseInt(raw, 10);
    return Number.isNaN(n) ? 0 : n;
  } catch {
    return 0;
  }
}

function safeSetSession(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // sessionStorage may be unavailable (Safari private mode, etc.)
  }
}

function safeSetLocal(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage may be unavailable
  }
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

    let lastPath: string | null = null;
    try {
      lastPath = sessionStorage.getItem(LAST_PATH_KEY);
    } catch {
      lastPath = null;
    }
    if (lastPath === pathname) return;
    safeSetSession(LAST_PATH_KEY, pathname);

    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(SHOWN_KEY) === '1';
    } catch {
      alreadyShown = false;
    }
    if (alreadyShown) return;

    if (isInCooldown()) return;

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
