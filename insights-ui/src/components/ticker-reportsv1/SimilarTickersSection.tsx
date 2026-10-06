import SimilarTickers from '@/components/ticker-reportsv1/SimilarTickers';
import { filterTickerIdsWithSlug } from '@/components/ticker-reportsv1/TickerRelatedSections';
import { fetchSimilarTickers } from '@/utils/fetchSimilarTickers';
import type { SimilarTicker } from '@/utils/ticker-v1-model-utils';
import { Suspense } from 'react';

export interface SimilarTickersSectionProps {
  /** Canonical exchange for the ticker (e.g. `NASDAQ`). */
  exchange: string;
  /** Canonical ticker symbol (e.g. `AAPL`). */
  ticker: string;
  /**
   * Sub-page slug of the page hosting this section (e.g. `competition`,
   * `fair-value`). Each peer then links to the *same* sub-page for that peer,
   * keeping the reader on the section they were viewing.
   */
  subPageSlug: string;
}

/**
 * Self-contained "Top Similar Companies" section: fetches from the shared
 * `similar-tickers` API and streams <SimilarTickers> behind its own Suspense
 * boundary. Drop-in for the stock report sub-pages so they show the same
 * section as the main stock report page, with peer links pointing back to the
 * same sub-page.
 *
 * Peers that have no report for `subPageSlug` fall back to their main stock
 * page — linking them to a missing sub-page would emit a crawlable URL that
 * renders the not-found page (a `noindex` soft 404 in Search Console).
 */
export default function SimilarTickersSection({ exchange, ticker, subPageSlug }: SimilarTickersSectionProps): JSX.Element {
  const similarPromise: Promise<SimilarTicker[]> = fetchSimilarTickers(exchange, ticker);
  // Never rejects: a failed lookup degrades to "no peer has this sub-page", which
  // links every peer to its main stock page. Errors on `similarPromise` itself
  // still surface through `dataPromise`.
  const slugAvailableIdsPromise: Promise<ReadonlySet<string>> = similarPromise
    .then((peers) =>
      filterTickerIdsWithSlug(
        peers.map((peer) => peer.id),
        subPageSlug
      )
    )
    .catch(() => new Set<string>());

  return (
    <div className="[content-visibility:auto] [contain-intrinsic-size:auto_800px]">
      <Suspense fallback={null}>
        <SimilarTickers dataPromise={similarPromise} subPageSlug={subPageSlug} slugAvailableIdsPromise={slugAvailableIdsPromise} />
      </Suspense>
    </div>
  );
}
