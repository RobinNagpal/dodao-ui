'use client';

import { useEffect } from 'react';
// NOTE: `@microsoft/clarity` is intentionally NOT imported statically — that would
// pull the SDK into the shared client bundle that loads on every page. It's
// dynamically imported inside `init` (which runs on idle, after load), so the SDK
// chunk is fetched on demand instead of up front.
import { PROD_HOST } from './LogRocketComponent';

const CLARITY_PROJECT_ID = 'u82d3rnsxw';

/**
 * Defer Clarity until *after* `window.load` (so it doesn't compete with image
 * decoding, font loading, or any other LCP-bound work) and then further
 * postpone it to the next idle moment. This keeps Clarity out of the critical
 * rendering path for Core Web Vitals while still capturing the session.
 */
export default function ClarityComponent(): null {
  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hostname !== PROD_HOST) {
      return;
    }

    let cancelled = false;

    const init = (): void => {
      if (cancelled) return;
      // Load the SDK on demand (keeps it out of the initial/shared bundle).
      import('@microsoft/clarity')
        .then((m) => {
          if (!cancelled) m.default.init(CLARITY_PROJECT_ID);
        })
        .catch(() => {
          /* swallow — analytics must not break the app */
        });
    };

    const scheduleIdle = (): void => {
      type IdleWindow = Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      };
      const ric = (window as IdleWindow).requestIdleCallback;
      if (typeof ric === 'function') {
        ric(init, { timeout: 4000 });
      } else {
        window.setTimeout(init, 2000);
      }
    };

    if (document.readyState === 'complete') {
      scheduleIdle();
      return () => {
        cancelled = true;
      };
    }

    window.addEventListener('load', scheduleIdle, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('load', scheduleIdle);
    };
  }, []);

  return null;
}
