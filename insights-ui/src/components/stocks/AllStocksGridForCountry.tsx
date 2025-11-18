import { getTickerScore, TickerWithIndustryNames } from '@/types/ticker-typesv1';
import { formatExchangeWithCountry } from '@/utils/countryExchangeUtils';
import StockTickerItem from './StockTickerItem';
import React, { use } from 'react';

interface AllStocksGridForCountryProps {
  stocks?: TickerWithIndustryNames[] | null;
  stocksPromise?: Promise<TickerWithIndustryNames[]> | null;
  countryName: string;
}

export default function AllStocksGridForCountry({ stocks, stocksPromise, countryName }: AllStocksGridForCountryProps): React.JSX.Element | null {
  // Handle both direct data and promise-based data
  const resolvedStocks = stocksPromise ? use(stocksPromise) : stocks;

  if (!resolvedStocks || resolvedStocks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#E5E7EB] text-lg">No {countryName} stocks found.</p>
        <p className="text-[#E5E7EB] text-sm mt-2">Please try again later.</p>
      </div>
    );
  }

  // Sort stocks by score descending, then by name
  const sortedStocks = resolvedStocks.sort((a, b) => {
    const scoreA = getTickerScore(a);
    const scoreB = getTickerScore(b);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {sortedStocks.map((stock) => {
        const score = getTickerScore(stock);
        const displayExchange = formatExchangeWithCountry(stock.exchange);

        return (
          <div key={stock.id} className="bg-block-bg-color rounded-lg border border-color p-3 hover:bg-[#2D3748] transition-colors">
            <StockTickerItem
              symbol={stock.symbol}
              name={stock.name}
              exchange={stock.exchange}
              score={score}
              displayExchange={displayExchange}
              industry={stock.industryName}
            />
          </div>
        );
      })}
    </div>
  );
}
