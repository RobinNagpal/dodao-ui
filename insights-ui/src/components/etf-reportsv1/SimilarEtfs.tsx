import type { SimilarEtf } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/similar-etfs/route';
import { formatCompactAmount } from '@/utils/etf-display-format-utils';
import { getScoreColorClasses } from '@/utils/score-utils';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { use } from 'react';

export interface SimilarEtfsProps {
  /** Promise-based fetch (resolved via `use()` to keep Suspense at the caller). */
  dataPromise: Promise<SimilarEtf[]>;
}

// Final score is the sum of 4 category scores, each capped at 5 factors → 20.
const ETF_MAX_SCORE = 20;

export default function SimilarEtfs({ dataPromise }: SimilarEtfsProps): JSX.Element | null {
  const similarEtfs: ReadonlyArray<SimilarEtf> = use(dataPromise);
  if (!similarEtfs || similarEtfs.length === 0) {
    return null;
  }

  return (
    <div id="similar-etfs" className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">Similar ETFs</h2>
      <p className="text-gray-300 mb-4">Based on ETF category and AUM proximity:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarEtfs.map((similarEtf) => {
          const rawScore: number | null = similarEtf.cachedScore?.finalScore ?? null;
          // getScoreColorClasses uses /25 thresholds; scale ETF /20 score onto that range for color.
          const scaledForColor: number | null = rawScore !== null ? (rawScore / ETF_MAX_SCORE) * 25 : null;
          const { textColorClass } = scaledForColor !== null ? getScoreColorClasses(scaledForColor) : { textColorClass: 'text-gray-400' };
          const formattedAum: string = formatCompactAmount(similarEtf.aum);

          return (
            <Link
              key={similarEtf.id}
              href={`/etfs/${similarEtf.exchange.toUpperCase()}/${similarEtf.symbol.toUpperCase()}`}
              className="block bg-gray-800 p-4 rounded-md border border-gray-700 hover:border-[#F97316] transition-colors group"
            >
              <div className="flex flex-col gap-y-2">
                <div className="flex items-center justify-between gap-x-3">
                  <div className="flex items-center gap-x-2 min-w-0">
                    <h3 className="font-semibold text-lg text-[#F59E0B] group-hover:text-[#F97316] transition-colors truncate">{similarEtf.name}</h3>
                    <ArrowTopRightOnSquareIcon className="size-4 text-gray-400 group-hover:text-[#F59E0B] transition-colors flex-shrink-0" />
                  </div>
                  {rawScore !== null && (
                    <span
                      className={`flex-shrink-0 inline-flex items-baseline gap-0.5 rounded-full bg-gray-900/60 px-2 py-0.5 text-sm font-semibold ${textColorClass}`}
                    >
                      {rawScore}
                      <span className="text-xs font-normal text-gray-400">/{ETF_MAX_SCORE}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    {similarEtf.symbol} • {similarEtf.exchange.toUpperCase()}
                  </div>
                  {formattedAum !== 'N/A' && <div className="text-sm text-gray-300">AUM: ${formattedAum}</div>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
