import { getScoreColorClasses } from '@/utils/score-utils';
import type { SimilarTicker } from '@/utils/ticker-v1-model-utils';
import CardSection from '@/components/ui/sections/CardSection';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { use } from 'react';

export interface SimilarTickersProps {
  /** Promise-based fetch (resolved via `use()` to keep Suspense at the caller). */
  dataPromise: Promise<SimilarTicker[]>;
}

export default function SimilarTickers({ dataPromise }: SimilarTickersProps): JSX.Element | null {
  const similarTickers: ReadonlyArray<SimilarTicker> = use(dataPromise);
  if (!similarTickers || similarTickers.length === 0) {
    return null;
  }

  return (
    <CardSection id="similar-tickers" padding="cozy" mb="lg">
      <SectionHeading as="h2" weight="bold" bordered>
        Top Similar Companies
      </SectionHeading>
      <p className="text-body mb-4">Based on industry classification and performance score:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarTickers.map((similarTicker) => {
          const scoreValue: number | '-' = similarTicker.cachedScoreEntry?.finalScore ?? '-';
          const { textColorClass } = typeof scoreValue === 'number' ? getScoreColorClasses(scoreValue) : { textColorClass: 'text-muted' };

          return (
            <Link
              key={similarTicker.id}
              href={`/stocks/${similarTicker.exchange.toUpperCase()}/${similarTicker.symbol.toUpperCase()}`}
              prefetch={false}
              className="block bg-surface-2 p-3 sm:p-4 rounded-md border border-border hover:border-primary transition-colors group"
            >
              <div className="flex flex-col gap-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-2">
                    <h3 className="font-semibold text-lg text-link group-hover:text-heading transition-colors">{similarTicker.name}</h3>
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
    </CardSection>
  );
}
