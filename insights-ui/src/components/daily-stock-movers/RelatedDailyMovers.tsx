import { TopGainerWithTicker, TopLoserWithTicker } from '@/types/daily-stock-movers';
import { DailyMoverType } from '@/types/daily-mover-constants';
import Link from 'next/link';

interface RelatedDailyMoversProps {
  movers: (TopGainerWithTicker | TopLoserWithTicker)[];
  type: DailyMoverType;
}

export default function RelatedDailyMovers({ movers, type }: RelatedDailyMoversProps) {
  if (!movers || movers.length === 0) {
    return null;
  }

  const isGainer = type === DailyMoverType.GAINER;
  const title = isGainer ? 'More Top Gainers from This Day' : 'More Top Losers from This Day';
  const detailsPath = isGainer ? '/daily-top-movers/top-gainers/details' : '/daily-top-movers/top-losers/details';
  const changeColorClass = isGainer ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="bg-gray-900 rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-700">{title}</h2>
      <p className="text-gray-300 mb-4">Explore other {isGainer ? 'top gainers' : 'top losers'} from the same trading day:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {movers.map((mover) => (
          <Link
            key={mover.id}
            href={`${detailsPath}/${mover.id}`}
            className="block bg-gray-800 p-4 rounded-md border border-gray-700 hover:border-[#F97316] transition-colors group"
          >
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                  <h3 className="font-semibold text-lg text-[#F59E0B] group-hover:text-[#F97316] transition-colors">{mover.ticker.name}</h3>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  {mover.ticker.symbol} • {mover.ticker.exchange.toUpperCase()}
                </div>
                <span className={`text-sm font-bold ${changeColorClass}`}>
                  {isGainer ? '+' : ''}
                  {mover.percentageChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
