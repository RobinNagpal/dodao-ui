import { TopGainerWithTicker, TopLoserWithTicker } from '@/types/daily-stock-movers';
import { getCountryByExchange, toExchange } from '@/utils/countryExchangeUtils';
import { DailyMoverType } from '@/utils/daily-movers-generation-utils';
import { parseMarkdown } from '@/util/parse-markdown';
import Link from 'next/link';

interface StockMoverDetailsProps {
  mover: TopGainerWithTicker | TopLoserWithTicker;
  type: DailyMoverType;
}

export default function StockMoverDetails({ mover, type }: StockMoverDetailsProps) {
  const country = getCountryByExchange(toExchange(mover.ticker.exchange));
  const backLink = type === DailyMoverType.GAINER ? `/daily-top-gainers/country/${country}` : `/daily-top-losers/country/${country}`;
  const backText = type === DailyMoverType.GAINER ? 'Back to Top Gainers' : 'Back to Top Losers';
  const changeColorClass = type === DailyMoverType.GAINER ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="mb-4">
        <Link href={backLink} className="link-color hover:underline text-sm inline-flex items-center gap-1">
          ← {backText}
        </Link>
      </div>

      <div className="bg-gray-900 rounded-lg shadow-sm border border-color p-6 md:p-8">
        {/* Compact header with all info in one line on desktop */}
        <div className="mb-6 pb-4 border-b border-color">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-color mb-2">
                {mover.ticker.name} <span className="text-muted-foreground">({mover.ticker.symbol})</span>
              </h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm">
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                  {mover.ticker.exchange}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className={`font-bold text-base ${changeColorClass}`}>
                  {type === DailyMoverType.GAINER ? '+' : ''}
                  {mover.percentageChange.toFixed(2)}%
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground text-sm">{new Date(mover.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <Link
              href={`/stocks/${toExchange(mover.ticker.exchange)}/${mover.ticker.symbol}`}
              className="link-color hover:underline text-sm font-medium whitespace-nowrap flex items-center gap-1"
            >
              View Full Report →
            </Link>
          </div>
        </div>

        {mover.title && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-color mb-3">Title</h2>
            <p className="text-color">{mover.title}</p>
          </div>
        )}

        {mover.oneLineExplanation && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-color mb-3">Summary</h2>
            <p className="text-color">{mover.oneLineExplanation}</p>
          </div>
        )}

        {mover.detailedExplanation && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-color mb-3">Detailed Explanation</h2>
            <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(mover.detailedExplanation) }} />
          </div>
        )}
      </div>
    </div>
  );
}
