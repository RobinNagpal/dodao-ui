import { TopGainerWithTicker, TopLoserWithTicker } from '@/types/daily-stock-movers';
import { getCountryByExchange, toExchange } from '@/utils/countryExchangeUtils';
import Link from 'next/link';

interface StockMoverDetailsProps {
  mover: TopGainerWithTicker | TopLoserWithTicker;
  type: 'gainers' | 'losers';
}

export default function StockMoverDetails({ mover, type }: StockMoverDetailsProps) {
  const country = getCountryByExchange(toExchange(mover.ticker.exchange));
  const backLink = type === 'gainers' ? `/daily-top-gainers/country/${country}` : `/daily-top-losers/country/${country}`;
  const backText = type === 'gainers' ? 'Back to Top Gainers' : 'Back to Top Losers';
  const changeColorClass = type === 'gainers' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href={backLink} className="text-primary hover:underline text-sm">
          ← {backText}
        </Link>
      </div>

      <div className="background-color rounded-lg shadow-sm border border-color p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-color mb-2">{mover.ticker.name}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="text-lg font-semibold text-color">{mover.ticker.symbol}</span>
            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
              {mover.ticker.exchange}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="background-color rounded-lg border border-color p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-2">Percentage Change</h2>
            <p className={`text-2xl font-bold ${changeColorClass}`}>
              {type === 'gainers' ? '+' : ''}
              {mover.percentageChange.toFixed(2)}%
            </p>
          </div>

          <div className="background-color rounded-lg border border-color p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-2">Date</h2>
            <p className="text-2xl font-semibold text-color">{new Date(mover.createdAt).toLocaleDateString()}</p>
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
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-color whitespace-pre-wrap">{mover.detailedExplanation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
