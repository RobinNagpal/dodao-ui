'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LogRocket from 'logrocket';

const PROJECT_ID = 'm3ahri/koalagains' as const;
const MIN_VISITS = 4 as const; // "more than the third time"
const PATH_PREFIX = '/stocks' as const;
const BLOCKED = new Set<string>(['CA', 'PK']);

// Storage keys (typed)
const LS = { id: 'lr_anon_id', visits: 'lr_visit_count' } as const;
type LocalKey = (typeof LS)[keyof typeof LS];

const SS = { counted: 'lr_counted', inited: 'lr_inited', identified: 'lr_identified' } as const;
type SessionKey = (typeof SS)[keyof typeof SS];

declare global {
  interface Window {
    __LR_INIT__?: boolean;
  }
}

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

function getVisitCount(): number {
  try {
    const raw = localStorage.getItem(LS.visits);
    const n = raw == null ? 0 : parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function setVisitCount(n: number): void {
  try {
    localStorage.setItem(LS.visits, String(n));
  } catch {
    /* noop */
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

export default function LogRocketComponent(): JSX.Element | null {
  const pathname = usePathname();

  useEffect(() => {
    // Only run on /stocks and subpaths
    if (typeof pathname !== 'string' || !pathname.startsWith(PATH_PREFIX)) return;

    try {
      // Count a "visit" once per tab session (only when on /stocks*)
      if (ssOnce(SS.counted)) {
        setVisitCount(getVisitCount() + 1);
      }
      const visitCount = getVisitCount();

      const country = getCountryFromCookie();
      // If country known and blocked, do nothing at all (no LogRocket init = no tracking)
      if (country && BLOCKED.has(country)) return;

      // Initialize LogRocket once per session (guards StrictMode double effects)
      if (!window.__LR_INIT__ && ssOnce(SS.inited)) {
        LogRocket.init(PROJECT_ID);
        window.__LR_INIT__ = true;
      }

      // Only identify on 4th+ visit, and never for blocked countries
      if (visitCount >= MIN_VISITS && !BLOCKED.has(country ?? '')) {
        if (ssOnce(SS.identified)) {
          try {
            const id = getOrCreateAnonId();
            LogRocket.identify(id, {
              visitCount,
              country: country ?? 'UN',
              audience: 'public',
              pathPrefix: PATH_PREFIX,
            });
          } catch {
            /* noop */
          }
        }
      }
    } catch {
      // Swallow errors to avoid breaking the app
    }
  }, [pathname]);

  return null;
}
