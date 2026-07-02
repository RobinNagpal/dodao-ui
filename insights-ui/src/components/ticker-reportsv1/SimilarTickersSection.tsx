import SimilarTickers from '@/components/ticker-reportsv1/SimilarTickers';
import { fetchSimilarTickers } from '@/utils/fetchSimilarTickers';
import { Suspense } from 'react';

export interface SimilarTickersSectionProps {
  /** Canonical exchange for the ticker (e.g. `NASDAQ`). */
  exchange: string;
  /** Canonical ticker symbol (e.g. `AAPL`). */
  ticker: string;
}

/**
 * Self-contained "Top Similar Companies" section: fetches from the shared
 * `similar-tickers` API and streams <SimilarTickers> behind its own Suspense
 * boundary. Drop-in for the stock report sub-pages so they show the same
 * section as the main stock report page.
 */
export default function SimilarTickersSection({ exchange, ticker }: SimilarTickersSectionProps): JSX.Element {
  const similarPromise = fetchSimilarTickers(exchange, ticker);

  return (
    <div className="[content-visibility:auto] [contain-intrinsic-size:auto_800px]">
      <Suspense fallback={null}>
        <SimilarTickers dataPromise={similarPromise} />
      </Suspense>
    </div>
  );
}
