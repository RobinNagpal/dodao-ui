import { PortfolioTicker } from '@/types/portfolio';

interface PortfolioStatsProps {
  portfolioTickers: PortfolioTicker[];
}

export default function PortfolioStats({ portfolioTickers }: PortfolioStatsProps) {
  const totalAllocation = portfolioTickers.reduce((sum, ticker) => sum + ticker.allocation, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="text-gray-400 text-xs font-medium mb-1">Total Holdings</div>
        <div className="text-2xl font-bold text-white">{portfolioTickers.length}</div>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="text-gray-400 text-xs font-medium mb-1">Total Allocation</div>
        <div className={`text-2xl font-bold ${totalAllocation > 100 ? 'text-red-400' : totalAllocation < 100 ? 'text-yellow-400' : 'text-green-400'}`}>
          {totalAllocation.toFixed(1)}%
        </div>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="text-gray-400 text-xs font-medium mb-1">Unallocated</div>
        <div className={`text-2xl font-bold ${100 - totalAllocation < 0 ? 'text-red-400' : 'text-gray-300'}`}>{(100 - totalAllocation).toFixed(1)}%</div>
      </div>
    </div>
  );
}
