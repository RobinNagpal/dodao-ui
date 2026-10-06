import { isStripeCreditPurchaseEnabled } from '@/utils/app-config-actions';
import { useEffect, useState } from 'react';

/** How long one answer is reused before asking the server again. */
const CACHE_MS = 5 * 60 * 1000;

let cached: { value: Promise<boolean>; at: number } | null = null;

/**
 * Whether credits can be bought right now (the admin kill switch in App Settings
 * → Payments). Shared across the page: the navbar, the regenerate control and
 * the pack picker all ask, but the server is asked once per few minutes.
 * Failing to read it counts as "off", so nothing offers a purchase that would fail.
 */
export function loadPurchasesEnabled(forceRefresh = false): Promise<boolean> {
  if (!cached || forceRefresh || Date.now() - cached.at > CACHE_MS) {
    cached = { value: isStripeCreditPurchaseEnabled().catch(() => false), at: Date.now() };
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
