import type { PurchasesEnabledResponse } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useEffect, useState } from 'react';

/** How long one answer is reused before asking the server again. */
const CACHE_MS = 5 * 60 * 1000;

/** A slow origin must not leave the navbar waiting; past this the answer is "off". */
const REQUEST_TIMEOUT_MS = 10 * 1000;

/**
 * A plain GET, not a Server Action: action ids change with every build, so a page
 * CloudFront cached before a deploy would call an id that no longer exists, and an
 * action fired on mount holds up the router's action queue (navigation) while pending.
 */
async function fetchPurchasesEnabled(): Promise<boolean> {
  const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/credits/purchases-enabled`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`purchases-enabled: ${response.status}`);
  const body = (await response.json()) as PurchasesEnabledResponse;
  return body.enabled === true;
}

let cached: { value: Promise<boolean>; at: number } | null = null;

/**
 * Whether credits can be bought right now (the admin kill switch in App Settings
 * → Payments). Shared across the page: the navbar, the regenerate control and
 * the pack picker all ask, but the server is asked once per few minutes.
 * Failing to read it counts as "off", so nothing offers a purchase that would fail.
 */
export function loadPurchasesEnabled(forceRefresh = false): Promise<boolean> {
  if (!cached || forceRefresh || Date.now() - cached.at > CACHE_MS) {
    const value = fetchPurchasesEnabled().catch(() => {
      // Don't keep a failed read for the full cache window; the next caller asks again.
      if (cached?.value === value) cached = null;
      return false;
    });
    cached = { value, at: Date.now() };
  }
  return cached.value;
}

/** `null` while loading (or while `enabled` is false), then the switch's value. */
export function usePurchasesEnabled(enabled = true): boolean | null {
  const [purchasesEnabled, setPurchasesEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void loadPurchasesEnabled().then((value) => {
      if (active) setPurchasesEnabled(value);
    });
    return () => {
      active = false;
    };
  }, [enabled]);

  return enabled ? purchasesEnabled : null;
}
