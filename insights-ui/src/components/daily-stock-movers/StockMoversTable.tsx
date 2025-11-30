import { TopGainerWithTicker, TopLoserWithTicker } from '@/types/daily-stock-movers';
import Link from 'next/link';

interface StockMoversTableProps {
  movers: (TopGainerWithTicker | TopLoserWithTicker)[];
  type: 'gainers' | 'losers';
  country: string;
}

export default function StockMoversTable({ movers, type, country }: StockMoversTableProps) {
  const title = type === 'gainers' ? 'Daily Top Gainers' : 'Daily Top Losers';
  const description = type === 'gainers' ? 'Stocks with the highest percentage gains today' : 'Stocks with the highest percentage losses today';
  const detailsPath = type === 'gainers' ? '/daily-top-gainers/details' : '/daily-top-losers/details';
  const changeColorClass = type === 'gainers' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-color">
          {title} - {country.toUpperCase()}
        </h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      {movers.length === 0 ? (
        <div className="text-center py-12 background-color rounded-lg shadow-sm border border-color">
          <p className="text-muted-foreground text-lg">No {type} found</p>
        </div>
      ) : (
        <div className="background-color rounded-lg shadow-sm border border-color overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y border-color">
              <thead className="block-bg-color">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Exchange</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Company Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Change %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y border-color">
                {movers.map((mover) => (
                  <tr key={mover.id} className="hover:block-bg-color transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-color">{mover.ticker.symbol}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                        {mover.ticker.exchange}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-color">{mover.ticker.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${changeColorClass}`}>
                        {type === 'gainers' ? '+' : ''}
                        {mover.percentageChange.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-color">{mover.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">{new Date(mover.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`${detailsPath}/${mover.id}`}
                        className="inline-flex items-center px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow hover:bg-primary/90 transition-colors"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
