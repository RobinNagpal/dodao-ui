import { getScoreColorClasses } from '@/utils/score-utils';
import type { SimilarTicker } from '@/utils/ticker-v1-model-utils';
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
    <div id="similar-tickers" className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Top Similar Companies</h2>
      <p className="text-gray-300 mb-4">Based on industry classification and performance score:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarTickers.map((similarTicker) => {
          const scoreValue: number | '-' = (similarTicker as any).cachedScore ?? '-';
          const { textColorClass } = typeof scoreValue === 'number' ? getScoreColorClasses(scoreValue) : { textColorClass: 'text-gray-400' };

          return (
            <Link
              key={similarTicker.id}
              href={`/stocks/${similarTicker.exchange.toUpperCase()}/${similarTicker.symbol.toUpperCase()}`}
                className="block bg-gray-800 p-4 rounded-md border border-gray-700 hover:border-[#F97316] transition-colors group"
            >
              <div className="flex flex-col gap-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-2">
                    <h3 className="font-semibold text-lg group-hover:text-[#F59E0B] transition-colors">{similarTicker.name}</h3>
                    <ArrowTopRightOnSquareIcon className="size-4 text-gray-400 group-hover:text-[#F59E0B] transition-colors" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
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
