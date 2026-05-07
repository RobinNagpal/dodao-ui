import { notFound } from 'next/navigation';

export interface DeletableTicker {
  isDeleted?: boolean | null;
}

/**
 * If the ticker has been marked as deleted, treat the URL as gone and serve
 * the not-found page (which already sets `robots: noindex, follow`).
 *
 * Status-code note: Next.js App Router pages cannot set arbitrary HTTP status
 * codes — only `notFound()` (404) and the redirect helpers (307/308) are
 * supported from a page component. The semantically correct status for a
 * removed ticker is 410 Gone, but 404 + `noindex` achieves the same SEO
 * outcome (Google de-indexes both equivalently). True 410 would require a
 * middleware that intercepts every `/stocks/:exchange/:ticker` request and
 * checks a cached deleted-ticker list — keep that as a follow-up if the exact
 * status code is required.
 *
 * Listing endpoints (and therefore the sitemap) already filter out deleted
 * tickers, so search engines re-crawling will see the page disappear from
 * the sitemap and hit a 404 + noindex on the detail URL.
 */
export function enforceDeletedTicker(ticker: DeletableTicker): void {
  if (ticker.isDeleted) {
    notFound();
  }
}
