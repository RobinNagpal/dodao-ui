'use client';

import { LoginPopup } from '@/components/login/login-popup';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

const RESHOW_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

const SHOWN_KEY = 'blogScrollLoginShown';
const DISMISSED_AT_KEY = 'blogScrollLoginDismissedAt';

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
 * Opens the login popup when a logged-out reader scrolls to the bottom of a blog
 * article (the "Related Articles" section).
 *
 * Rendered as a tiny invisible sentinel just before the server-rendered
 * `RelatedBlogs` section, so the article body and related posts stay fully
 * server-rendered — this component adds no SSR markup and does not wrap any
 * SEO-relevant content. The popup is shown at most once per browser session and
 * stays hidden for a few days after dismissal.
 */
export function BlogScrollLoginTrigger(): JSX.Element | null {
  const { status } = useSession();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (status !== 'unauthenticated') return;
    if (typeof IntersectionObserver === 'undefined') return;

    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(SHOWN_KEY) === '1';
    } catch {
      alreadyShown = false;
    }
    if (alreadyShown) return;

    if (isInCooldown()) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setOpen(true);
          safeSetSession(SHOWN_KEY, '1');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [status]);

  const handleClose = (): void => {
    setOpen(false);
    safeSetLocal(DISMISSED_AT_KEY, String(Date.now()));
  };

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      {status === 'unauthenticated' && <LoginPopup open={open} onClose={handleClose} />}
    </>
  );
}
