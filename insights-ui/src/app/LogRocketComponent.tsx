'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LogRocket from 'logrocket';

const PROJECT_ID = 'm3ahri/koalagains';
const MIN_CLICKS = 2; // Require at least 2 clicks in the current session
const STOCKS_PATH_PREFIX = '/stocks';
const TARIFF_PATH_PREFIX = '/industry-tariff-report';
export const PROD_HOST = 'koalagains.com'; // ✅ only allow this exact host

// LocalStorage keys (lifetime analytics; not used for gating)
const LS = {
  id: 'lr_anon_id',
  clicks: 'lr_click_count', // lifetime click counter (optional analytics)
};
type LocalKey = (typeof LS)[keyof typeof LS];

// SessionStorage keys (session-scoped gating & guards)
const SS = {
  inited: 'lr_inited',
  identified: 'lr_identified',
  clicks: 'lr_clicks_session', // NEW: session click counter for gating
};
type SessionKey = (typeof SS)[keyof typeof SS];

declare global {
  interface Window {
    __LR_INIT__?: boolean;
  }
}

/* ----------------- small helpers (explicit types) ----------------- */

function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  try {
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return m ? m[1] : null;
  }
}

function isISO2(v: unknown): v is string {
  return typeof v === 'string' && /^[A-Z]{2}$/.test(v);
}

function getCountryFromCookie(): string | null {
  const c = readCookie('country');
  const up = c?.toUpperCase();
  return isISO2(up) ? up : null;
}

function ssOnce(key: SessionKey): boolean {
  try {
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, '1');
    return true;
  } catch {
    return true;
  }
}

function getOrCreateAnonId(): string {
  try {
    const existing = localStorage.getItem(LS.id);
    if (existing) return existing;
  } catch {
    /* fall through */
  }
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? (crypto.randomUUID() as string) : `lr_${Math.random().toString(36).slice(2)}${Date.now()}`;
  try {
    localStorage.setItem(LS.id, id);
  } catch {
    /* noop */
  }
  return id;
}

/** ✅ allow LR only on the exact production host */
function onProdDomain(): boolean {
  try {
    return typeof location !== 'undefined' && location.hostname === PROD_HOST;
  } catch {
    return false;
  }
}

/* ----------------- lifetime click counter (optional) ----------------- */

function getLifetimeClickCount(): number {
  try {
    const raw = localStorage.getItem(LS.clicks);
    const n = raw == null ? 0 : parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function setLifetimeClickCount(n: number): void {
  try {
    localStorage.setItem(LS.clicks, String(n));
  } catch {
    /* noop */
  }
}

/* ----------------- session click counter (gating) ----------------- */

function getSessionClickCount(): number {
  try {
    const raw = sessionStorage.getItem(SS.clicks);
    const n = raw == null ? 0 : parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function setSessionClickCount(n: number): void {
  try {
    sessionStorage.setItem(SS.clicks, String(n));
  } catch {
    /* noop */
  }
}

function incrementSessionClickCount(): { session: number; lifetime: number } {
  const sessionNext = getSessionClickCount() + 1;
  setSessionClickCount(sessionNext);

  // keep lifetime analytics if you want the metric; not used for gating
  const lifetimeNext = getLifetimeClickCount() + 1;
  setLifetimeClickCount(lifetimeNext);

  return { session: sessionNext, lifetime: lifetimeNext };
}

function hasMinSessionClicks(): boolean {
  return getSessionClickCount() >= MIN_CLICKS;
}

/* ----------------- LogRocket connect/identify ----------------- */

function connectAndIdentify(country: string | null): void {
  // init once per session (StrictMode-safe)
  if (!window.__LR_INIT__ && ssOnce(SS.inited)) {
    LogRocket.init(PROJECT_ID);
    window.__LR_INIT__ = true;
  }

  // identify once per session
  if (ssOnce(SS.identified)) {
    try {
      const id = getOrCreateAnonId();
      LogRocket.identify(id, {
        country: country ?? 'UN',
        audience: 'public',
        sessionClickCount: getSessionClickCount(),
        lifetimeClickCount: getLifetimeClickCount(),
      });
    } catch {
      /* noop */
    }
  }
}

/**
 * Connect after MIN_CLICKS **in this session**.
 * If already satisfied, connect immediately.
 * Returns a cleanup function.
 */
function gateConnectionOnSessionClicks(country: string | null): () => void {
  if (hasMinSessionClicks()) {
    connectAndIdentify(country);
    return () => {};
  }

  const onClick: (e: MouseEvent) => void = (e) => {
    // Ignore synthetic/programmatic clicks
    if (!e.isTrusted) return;

    const { session } = incrementSessionClickCount();
    if (session >= MIN_CLICKS) {
      connectAndIdentify(country);
      document.removeEventListener('click', onClick, { capture: true } as AddEventListenerOptions);
    }
  };

  // Use capture to avoid being blocked by stopPropagation in bubbling phase
  document.addEventListener('click', onClick, { capture: true });

  // Clean up on route change / unmount
  return () => document.removeEventListener('click', onClick, { capture: true } as EventListenerOptions);
}

/* ----------------- component ----------------- */

export default function LogRocketComponent(): JSX.Element | null {
  const pathname = usePathname();

  useEffect((): void | (() => void) => {
    // Only run on allowed paths
    if (typeof pathname !== 'string' || !(pathname.startsWith(STOCKS_PATH_PREFIX) || pathname.startsWith(TARIFF_PATH_PREFIX))) {
      return;
    }

    // ✅ Only initialize on the exact production domain
    if (!onProdDomain()) return;

    try {
      const country: string | null = getCountryFromCookie();

      // Connect only after MIN_CLICKS in the current session
      const cleanup: () => void = gateConnectionOnSessionClicks(country);
      return cleanup;
    } catch {
      // Swallow errors to avoid breaking the app
    }
  }, [pathname]);

  return null;
}
