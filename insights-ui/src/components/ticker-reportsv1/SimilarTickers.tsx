import { getScoreColorClasses } from '@/utils/score-utils';
import type { SimilarTicker } from '@/utils/ticker-v1-model-utils';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { use } from 'react';

/** Resolved stand-in for a missing `slugAvailableIdsPromise` so `use()` stays unconditional. */
const NO_AVAILABILITY_FILTER: Promise<ReadonlySet<string> | undefined> = Promise.resolve(undefined);

export interface SimilarTickersProps {
  /** Promise-based fetch (resolved via `use()` to keep Suspense at the caller). */
  dataPromise: Promise<SimilarTicker[]>;
  /**
   * Optional sub-page slug (e.g. `competition`, `fair-value`). When set, each
   * peer links to that same sub-page for the peer instead of its main report,
   * so navigating from a sub-page keeps the reader on the same section. When
   * omitted (main report page), peers link to the main report.
   */
  subPageSlug?: string;
  /**
   * Ids of the peers that actually have a report for `subPageSlug`. Peers not in
   * the set link to their main stock page instead, so we never emit a link to a
   * sub-page that renders the not-found page. Omit to link every peer to
   * `subPageSlug` unconditionally (only safe when the slug is known to exist).
   */
  slugAvailableIdsPromise?: Promise<ReadonlySet<string>>;
}

export default function SimilarTickers({ dataPromise, subPageSlug, slugAvailableIdsPromise }: SimilarTickersProps): JSX.Element | null {
  const similarTickers: ReadonlyArray<SimilarTicker> = use(dataPromise);
  const slugAvailableIds: ReadonlySet<string> | undefined = use(slugAvailableIdsPromise ?? NO_AVAILABILITY_FILTER);
  if (!similarTickers || similarTickers.length === 0) {
    return null;
  }

  return (
    <div id="similar-tickers" className="bg-surface rounded-lg shadow-sm p-3 sm:p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border">Top Similar Companies</h2>
      <p className="text-body mb-4">Based on industry classification and performance score:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarTickers.map((similarTicker) => {
          const scoreValue: number | '-' = similarTicker.cachedScoreEntry?.finalScore ?? '-';
          const { textColorClass } = typeof scoreValue === 'number' ? getScoreColorClasses(scoreValue) : { textColorClass: 'text-muted' };

          const tickerBasePath = `/stocks/${similarTicker.exchange.toUpperCase()}/${similarTicker.symbol.toUpperCase()}`;
          const hasSubPage = !!subPageSlug && (!slugAvailableIds || slugAvailableIds.has(similarTicker.id));
          const href = hasSubPage ? `${tickerBasePath}/${subPageSlug}` : tickerBasePath;

          return (
            <Link
              key={similarTicker.id}
              href={href}
              prefetch={false}
              className="block bg-surface-2 p-3 sm:p-4 rounded-md border border-border hover:border-primary transition-colors group"
            >
              <div className="flex flex-col gap-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-2">
                    <h3 className="font-semibold text-lg  text-link group-hover:text-heading transition-colors">{similarTicker.name}</h3>
                    <ArrowTopRightOnSquareIcon className="size-4 text-muted group-hover:text-link transition-colors" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted">
                    {similarTicker.symbol} • {similarTicker.exchange.toUpperCase()}
                  </div>
                  <span className={`text-sm font-medium ${textColorClass}`}>
                    {typeof scoreValue === 'number' ? Number(scoreValue) : '-'}
                    {typeof scoreValue === 'number' ? '/25' : ''}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
