import { FolderIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import TickerBadge from '@/components/favourites/TickerBadge';
import { PortfolioWithTickers } from '@/types/portfolio';

interface PortfolioCardsProps {
  portfolios: PortfolioWithTickers[];
  portfolioManagerId: string;
}

export default function PortfolioCards({ portfolios, portfolioManagerId }: PortfolioCardsProps) {
  const totalHoldings = portfolios.reduce((sum, p) => sum + (p.portfolioTickers?.length || 0), 0);

  const renderEmptyState = () => (
    <div className="bg-gray-800 rounded-lg p-8 text-center">
      <FolderIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">No portfolios yet</h3>
      <p className="text-gray-400 mb-4">This portfolio manager hasn’t published any portfolios yet.</p>
    </div>
  );

  const renderPortfolioCard = (portfolio: PortfolioWithTickers) => {
    const topHoldings = portfolio.portfolioTickers?.slice(0, 3) || [];
    const totalAllocation = portfolio.portfolioTickers?.reduce((sum, t) => sum + t.allocation, 0) || 0;

    return (
      <Link
        key={portfolio.id}
        href={`/portfolio-managers/profile-details/${portfolioManagerId}/portfolios/${portfolio.id}`}
        className="bg-gray-900 rounded-lg p-6 hover:bg-gray-750 transition-colors block"
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">{portfolio.name}</h3>
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{portfolio.summary}</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Holdings:</span>
            <span className="text-white font-medium">{portfolio.portfolioTickers?.length || 0}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Total Allocation:</span>
            <span className={`font-medium ${totalAllocation > 100 ? 'text-red-400' : totalAllocation < 100 ? 'text-yellow-400' : 'text-green-400'}`}>
              {totalAllocation.toFixed(1)}%
            </span>
          </div>

          {topHoldings.length > 0 && (
            <div className="pt-3 border-t border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Top Holdings:</div>
              <div className="space-y-2">
                {topHoldings.map((ticker) => (
                  <div key={ticker.id} className="flex justify-between items-center">
                    {ticker.ticker && (
                      <TickerBadge
                        ticker={{
                          id: ticker.ticker.id,
                          symbol: ticker.ticker.symbol,
                          name: ticker.ticker.name,
                          exchange: ticker.ticker.exchange,
                          cachedScoreEntry: ticker.ticker.cachedScoreEntry,
                        }}
                        showScore={true}
                        showName={true}
                        linkToStock={false}
                      />
                    )}
                    <span className="text-gray-400 text-sm font-medium ml-2">{ticker.allocation}%</span>
                  </div>
                ))}
                {(portfolio.portfolioTickers?.length || 0) > 3 && (
                  <div className="text-sm text-gray-500">+{(portfolio.portfolioTickers?.length || 0) - 3} more</div>
                )}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-gray-700">
            <span className="text-blue-400 hover:text-blue-300 text-sm font-medium">View Details →</span>
          </div>
        </div>
      </Link>
    );
  };

  if (portfolios.length === 0) {
    return renderEmptyState();
  }

  return (
    <div>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderIcon className="w-6 h-6 text-blue-500" />
            Portfolios
          </h2>
          <p className="text-gray-400 mt-1">
            {portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''} • {totalHoldings} total holdings
          </p>
        </div>
      </div>

      {/* Portfolio Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{portfolios.map(renderPortfolioCard)}</div>
    </div>
  );
}
