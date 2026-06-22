'use client';

import { LoginPopup } from '@/components/login/login-popup';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const SHOW_DELAY_MS = 1200;
const RESHOW_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

const SHOWN_KEY = 'blogsLoginModalShown';
const DISMISSED_AT_KEY = 'blogsLoginModalDismissedAt';

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

/**
 * Shows the login modal to unauthenticated visitors on the blogs pages.
 *
 * Mounted from `src/app/blogs/layout.tsx`, so it covers both the blogs listing
 * (`/blogs`) and individual articles (`/blogs/[blogSlug]`). The modal is shown
 * once per browser session after a short delay, and stays hidden for a few days
 * after the reader dismisses it so returning readers aren't repeatedly blocked.
 */
export function BlogsLoginModal(): JSX.Element | null {
  const { status } = useSession();
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (status !== 'unauthenticated') return;

    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(SHOWN_KEY) === '1';
    } catch {
      alreadyShown = false;
    }
    if (alreadyShown) return;

    if (isInCooldown()) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
      safeSetSession(SHOWN_KEY, '1');
    }, SHOW_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [status]);

  const handleClose = (): void => {
    setOpen(false);
    safeSetLocal(DISMISSED_AT_KEY, String(Date.now()));
  };

  if (status !== 'unauthenticated') return null;

  return <LoginPopup open={open} onClose={handleClose} />;
}
