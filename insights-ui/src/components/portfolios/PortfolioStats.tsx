import { PortfolioTicker } from '@/types/portfolio';
import Button from '@dodao/web-core/components/core/buttons/Button';

interface PortfolioStatsProps {
  portfolioTickers: PortfolioTicker[];
  isOwner: boolean;
  onDeletePortfolio: () => void;
}

export default function PortfolioStats({ portfolioTickers, isOwner, onDeletePortfolio }: PortfolioStatsProps) {
  const totalAllocation = portfolioTickers.reduce((sum, ticker) => sum + ticker.allocation, 0);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-medium text-white mb-4">Portfolio Stats</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Total Holdings</span>
          <span className="text-white font-medium">{portfolioTickers.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Total Allocation</span>
          <span className={`font-medium ${totalAllocation > 100 ? 'text-red-400' : totalAllocation < 100 ? 'text-yellow-400' : 'text-green-400'}`}>
            {totalAllocation.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Unallocated</span>
          <span className={`font-medium ${100 - totalAllocation < 0 ? 'text-red-400' : 'text-gray-300'}`}>{(100 - totalAllocation).toFixed(1)}%</span>
        </div>
      </div>

      {isOwner && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <Button onClick={onDeletePortfolio} variant="text" className="text-red-400 hover:text-red-300 w-full">
            Delete Portfolio
          </Button>
        </div>
      )}
    </div>
  );
}
