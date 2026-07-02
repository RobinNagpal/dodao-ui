import SimilarTickers from '@/components/ticker-reportsv1/SimilarTickers';
import { fetchSimilarTickers } from '@/utils/fetchSimilarTickers';
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
 */
export default function SimilarTickersSection({ exchange, ticker, subPageSlug }: SimilarTickersSectionProps): JSX.Element {
  const similarPromise = fetchSimilarTickers(exchange, ticker);

  return (
    <div className="[content-visibility:auto] [contain-intrinsic-size:auto_800px]">
      <Suspense fallback={null}>
        <SimilarTickers dataPromise={similarPromise} subPageSlug={subPageSlug} />
      </Suspense>
    </div>
  );
}
