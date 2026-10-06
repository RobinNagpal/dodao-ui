import { CHECKOUT_SESSION_QUERY_PARAM, CREDITS_PURCHASED_QUERY_PARAM } from '@/types/credits';

/**
 * Browser-only helpers for the round trip through Stripe Checkout.
 *
 * These read `window.location` rather than `useSearchParams()` on purpose: the
 * hook forces every page rendering the credit UI to sit behind a Suspense
 * boundary, and the credit controls are meant to drop into any report page
 * without imposing that.
 */

/** Query params Stripe's success URL adds; never part of a path we hand out again. */
const CHECKOUT_RETURN_PARAMS = [CREDITS_PURCHASED_QUERY_PARAM, CHECKOUT_SESSION_QUERY_PARAM];

/** What the success URL told us about the checkout the user just finished. */
export interface CheckoutReturn {
  /** The Checkout Session id (`cs_…`) to confirm, or null on an older-style return URL. */
  sessionId: string | null;
  /** Credits in the pack bought, when the marker carries a number. */
  creditsPurchased: number | null;
}

/**
 * Pure part of the return-leg handling, kept separate so it can be tested
 * without a browser: reads the checkout markers from `href` and returns them
 * with the same path minus the markers (hash kept). `checkoutReturn` is null
 * when the URL is not a return from Stripe.
 */
export function parseCheckoutReturn(href: string): { checkoutReturn: CheckoutReturn | null; cleanedPath: string } {
  const url = new URL(href, 'http://localhost');
  const marker = url.searchParams.get(CREDITS_PURCHASED_QUERY_PARAM);
  const sessionId = url.searchParams.get(CHECKOUT_SESSION_QUERY_PARAM)?.trim() || null;
  CHECKOUT_RETURN_PARAMS.forEach((param) => url.searchParams.delete(param));
  const cleanedPath = `${url.pathname}${url.search}${url.hash}`;

  if (!marker && !sessionId) {
    return { checkoutReturn: null, cleanedPath };
  }
  const credits = marker ? Number.parseInt(marker, 10) : NaN;
  return {
    checkoutReturn: {
      // An unsubstituted `{CHECKOUT_SESSION_ID}` placeholder is not a session id.
      sessionId: sessionId && sessionId.startsWith('cs_') ? sessionId : null,
      creditsPurchased: Number.isFinite(credits) && credits > 0 ? credits : null,
    },
    cleanedPath,
  };
}

/** Path (with query) Stripe should return to, minus the checkout markers. */
export function getCurrentReturnPath(): string {
  if (typeof window === 'undefined') {
    return '/credits';
  }
  const { cleanedPath } = parseCheckoutReturn(window.location.href);
  // The hash is browser-only state; Stripe's return URL doesn't need it.
  return cleanedPath.split('#')[0];
}

/**
 * The checkout markers when this page load is the return leg of a completed
 * checkout, else null. Clears them from the URL as it reads them, so a refresh
 * (or a back-navigation) doesn't replay the "payment received" state.
 */
export function consumeCheckoutReturn(): CheckoutReturn | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const { checkoutReturn, cleanedPath } = parseCheckoutReturn(window.location.href);
  if (!checkoutReturn) {
    return null;
  }
  window.history.replaceState(window.history.state, '', cleanedPath);
  return checkoutReturn;
}

/** Window event fired whenever this tab changes the user's balance. */
export const CREDITS_CHANGED_EVENT = 'koalagains:credits-changed';

/** Tell balance displays elsewhere on the page (e.g. the navbar) to re-read it. */
export function notifyCreditsChanged(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new Event(CREDITS_CHANGED_EVENT));
}
