'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LogRocket from 'logrocket';

const PROJECT_ID = 'm3ahri/koalagains' as const;
const MIN_CLICKS = 2 as const; // Only gate by clicks (lifetime)
const STOCKS_PATH_PREFIX = '/stocks' as const;
const TARIFF_PATH_PREFIX = '/industry-tariff-report' as const;
const BLOCKED = new Set<string>(['CA', 'PK']);

// LocalStorage keys (typed)
const LS = {
  id: 'lr_anon_id',
  clicks: 'lr_click_count', // lifetime click counter
} as const;
type LocalKey = (typeof LS)[keyof typeof LS];

// SessionStorage keys (typed) — per-tab/session guards
const SS = {
  inited: 'lr_inited', // prevent double init in a session/StrictMode
  identified: 'lr_identified', // identify once per session
} as const;
type SessionKey = (typeof SS)[keyof typeof SS];

declare global {
  interface Window {
    __LR_INIT__?: boolean;
  }
}

/* ----------------- small helpers w/ explicit types ----------------- */

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

/* --------------- lifetime click counter (localStorage) --------------- */

function getClickCount(): number {
  try {
    const raw = localStorage.getItem(LS.clicks);
    const n = raw == null ? 0 : parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function setClickCount(n: number): void {
  try {
    localStorage.setItem(LS.clicks, String(n));
  } catch {
    /* noop */
  }
}

function incrementClickCount(): number {
  const next = getClickCount() + 1;
  setClickCount(next);
  return next;
}

function hasMinClicks(): boolean {
  return getClickCount() >= MIN_CLICKS;
}

/* ----------------- LogRocket connect/identify ----------------- */

function connectAndIdentify(country: string | null): void {
  // Initialize once per session (StrictMode-safe)
  if (!window.__LR_INIT__ && ssOnce(SS.inited)) {
    LogRocket.init(PROJECT_ID);
    window.__LR_INIT__ = true;
  }

  // Identify once per session (no visit gating)
  if (ssOnce(SS.identified)) {
    try {
      const id = getOrCreateAnonId();
      LogRocket.identify(id, {
        country: country ?? 'UN',
        audience: 'public',
        clickCount: getClickCount(),
      });
    } catch {
      /* noop */
    }
  }
}

/**
 * Connect after MIN_CLICKS (lifetime).
 * If already satisfied, connect immediately.
 * Returns a cleanup function.
 */
function gateConnectionOnLifetimeClicks(country: string | null): () => void {
  if (hasMinClicks()) {
    connectAndIdentify(country);
    return () => {};
  }

  const onClick: (e: MouseEvent) => void = () => {
    const clicks = incrementClickCount();
    if (clicks >= MIN_CLICKS) {
      connectAndIdentify(country);
      document.removeEventListener('click', onClick);
    }
  };

  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}

/* ----------------- component ----------------- */

export default function LogRocketComponent(): JSX.Element | null {
  const pathname = usePathname();

  useEffect((): void | (() => void) => {
    // Only run on /stocks and subpaths
    if (!(pathname.startsWith(STOCKS_PATH_PREFIX) || pathname.startsWith(TARIFF_PATH_PREFIX))) return;

    try {
      const country: string | null = getCountryFromCookie();

      // Blocked countries: do nothing at all (no init, no tracking)
      if (country && BLOCKED.has(country)) return;

      // Establish connection only after MIN_CLICKS lifetime clicks.
      const cleanup: () => void = gateConnectionOnLifetimeClicks(country);
      return cleanup;
    } catch {
      // Swallow errors to avoid breaking the app
    }
  }, [pathname]);

  return null;
}
