import StockTickerItem from './StockTickerItem';
import { TickerV1 } from '@prisma/client';

interface SubIndustryCardProps {
  subIndustry: string;
  tickers: TickerV1[] | any[];
  subIndustryName?: string; // Add optional subIndustryName prop
  total: number;
}

export default function SubIndustryCard({ subIndustry, subIndustryName, tickers, total }: SubIndustryCardProps) {
  // Use subIndustryName if provided, otherwise fallback to subIndustry key
  const displayName = subIndustryName || subIndustry;
  return (
    <div className="bg-block-bg-color rounded-lg shadow-lg border border-color overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
      <div className="px-3 py-2 sm:px-4 border-b border-color flex items-center justify-between bg-gradient-to-r from-[#374151] to-[#2D3748]">
        <h3 className="text-base font-semibold heading-color truncate max-w-[70%]" title={displayName}>
          {displayName}
        </h3>
        <p className="text-xs text-white bg-[#4F46E5] px-2 py-0.5 rounded-full whitespace-nowrap">
          {total} {total === 1 ? 'company' : 'companies'}
        </p>
      </div>
      <ul className="divide-y divide-color flex-grow">
        {tickers.map((ticker) => (
          <li key={ticker.symbol} className="px-2 py-1.5 hover:bg-[#2D3748] transition-colors duration-200">
            <div className="min-w-0 w-full">
              <StockTickerItem symbol={ticker.symbol} name={ticker.name} exchange={ticker.exchange} score={ticker.cachedScore} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
