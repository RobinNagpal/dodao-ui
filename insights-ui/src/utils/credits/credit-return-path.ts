import { CREDITS_PURCHASED_QUERY_PARAM } from '@/types/credits';

/**
 * Browser-only helpers for the round trip through Stripe Checkout.
 *
 * These read `window.location` rather than `useSearchParams()` on purpose: the
 * hook forces every page rendering the credit UI to sit behind a Suspense
 * boundary, and the credit controls are meant to drop into any report page
 * without imposing that.
 */

/** Path (with query) Stripe should return to, minus the purchase marker. */
export function getCurrentReturnPath(): string {
  if (typeof window === 'undefined') {
    return '/credits';
  }
  const url = new URL(window.location.href);
  url.searchParams.delete(CREDITS_PURCHASED_QUERY_PARAM);
  return `${url.pathname}${url.search}`;
}

/**
 * True when this page load is the return leg of a completed checkout. Clears
 * the marker from the URL as it reads it, so a refresh (or a back-navigation)
 * doesn't replay the "payment received" state.
 */
export function consumeCreditsPurchasedMarker(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const url = new URL(window.location.href);
  if (!url.searchParams.get(CREDITS_PURCHASED_QUERY_PARAM)) {
    return false;
  }
  url.searchParams.delete(CREDITS_PURCHASED_QUERY_PARAM);
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  return true;
}
