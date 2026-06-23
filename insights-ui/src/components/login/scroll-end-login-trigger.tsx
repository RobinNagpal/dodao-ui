'use client';

import { LoginPopup } from '@/components/login/login-popup';
import { isInCooldown, isLikelyBot, safeGetSession, safeSetLocal, safeSetSession } from '@/components/login/login-popup-utils';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

const RESHOW_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

interface ScrollEndLoginTriggerProps {
  // sessionStorage flag — popup is shown at most once per browser session for this surface.
  shownKey: string;
  // localStorage timestamp — suppresses re-showing for a few days after the reader dismisses it.
  dismissedAtKey: string;
}

/**
 * Opens the login popup when a logged-out reader scrolls to the very end of a long page
 * (blog article, tariff-updates report, …).
 *
 * Rendered as a tiny invisible sentinel (`<div className="h-px">`) placed at the end of the
 * page content, plus the initially-closed popup. It therefore adds no SEO-relevant markup and
 * never alters the server-rendered content — the host page stays fully server-rendered and
 * indexable. Crawlers are skipped entirely so search engines never see an interstitial. The
 * popup is shown at most once per session and stays hidden for a few days after dismissal; it
 * is never enforced (clicking outside closes it).
 *
 * Storage keys are injected so different surfaces can either keep their own once-per-session
 * budget (blogs) or share the global login-popup budget with the nav-count auto-prompt (tariff),
 * which prevents two login popups firing on the same page.
 */
export function ScrollEndLoginTrigger({ shownKey, dismissedAtKey }: ScrollEndLoginTriggerProps): JSX.Element {
  const { status } = useSession();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (status !== 'unauthenticated') return;
    if (typeof IntersectionObserver === 'undefined') return;
    if (isLikelyBot()) return;
    if (safeGetSession(shownKey) === '1') return;
    if (isInCooldown(dismissedAtKey, RESHOW_COOLDOWN_MS)) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setOpen(true);
          safeSetSession(shownKey, '1');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [status, shownKey, dismissedAtKey]);

  const handleClose = (): void => {
    setOpen(false);
    safeSetLocal(dismissedAtKey, String(Date.now()));
  };

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      {status === 'unauthenticated' && <LoginPopup open={open} onClose={handleClose} />}
    </>
  );
}
