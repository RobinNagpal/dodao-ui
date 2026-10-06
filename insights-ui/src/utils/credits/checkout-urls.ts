import { getSafeCallbackPath } from '@dodao/web-core/utils/auth/safeCallbackPath';
import { CHECKOUT_SESSION_QUERY_PARAM, CREDITS_PURCHASED_QUERY_PARAM } from '@/types/credits';
import { getCanonicalUrl } from '@/utils/getBaseUrlForServerSidePages';

/**
 * Origin Stripe sends the user back to after Checkout.
 *
 * Never the request's own origin in production: in the container (Next standalone,
 * HOSTNAME=0.0.0.0) `req.nextUrl.origin` is the internal host
 * (`https://ip-172-…ec2.internal:3000`), not the domain the user browsed. Outside
 * production (`next dev`) the request origin is the right one — it is localhost,
 * and sending a local test purchase back to the live site would be wrong.
 */
export function getCheckoutReturnOrigin(requestOrigin: string, nodeEnv: string | undefined = process.env.NODE_ENV): string {
  return nodeEnv === 'production' ? getCanonicalUrl() : requestOrigin;
}

/**
 * `returnPath` comes from the browser, so it is only ever used as a path on
 * this origin. Anything that `getSafeCallbackPath` rejects (absolute,
 * protocol-relative `//evil.com`, backslash tricks, dot-segments that normalize
 * to `//…`, unparseable) falls back to the credits page — a checkout flow must
 * not become an open redirect.
 */
export function toSameOriginUrl(origin: string, returnPath: string | undefined): string {
  const fallback = `${origin}/credits`;
  const safePath = getSafeCallbackPath(returnPath);
  if (!safePath) {
    return fallback;
  }
  try {
    const url = new URL(safePath, origin);
    return url.origin === new URL(origin).origin ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

export interface CheckoutReturnUrls {
  successUrl: string;
  cancelUrl: string;
}

/**
 * Success and cancel URLs for a credits Checkout Session.
 *
 * The success URL carries `checkout_session={CHECKOUT_SESSION_ID}`, which Stripe
 * replaces with the session id so the page can confirm the purchase on return.
 * The braces must reach Stripe un-encoded (URLSearchParams would turn them into
 * `%7B…%7D` and Stripe would no longer substitute), so that part is appended as
 * a raw string after everything else is built.
 */
export function buildCheckoutReturnUrls(origin: string, returnPath: string | undefined, credits: number): CheckoutReturnUrls {
  const returnUrl = toSameOriginUrl(origin, returnPath);

  const success = new URL(returnUrl);
  success.searchParams.set(CREDITS_PURCHASED_QUERY_PARAM, String(credits));
  success.searchParams.delete(CHECKOUT_SESSION_QUERY_PARAM);
  // The raw query part has to go before any #fragment, so the fragment is re-attached after it.
  const hash = success.hash;
  success.hash = '';
  const successUrl = `${success.toString()}&${CHECKOUT_SESSION_QUERY_PARAM}={CHECKOUT_SESSION_ID}${hash}`;

  return { successUrl, cancelUrl: returnUrl };
}
