import StockTickerItem from './StockTickerItem';
import { TickerWithScore, getTickerScore } from '@/types/ticker-typesv1';

type Variant = 'footer' | 'header-sub' | 'corner-badge';

interface SubIndustryCardProps {
  subIndustry: string;
  tickers: TickerWithScore[];
  subIndustryName?: string;
  total: number;
  variant?: Variant; // 'footer' | 'header-sub' | 'corner-badge'
}

export default function SubIndustryCard({ subIndustry, subIndustryName, tickers, total }: SubIndustryCardProps) {
  const displayName = subIndustryName || subIndustry;
  const companyLabel = `${total.toLocaleString()} ${total === 1 ? 'company' : 'companies'}`;

  return (
    <div className="relative bg-block-bg-color rounded-lg border border-color overflow-hidden flex flex-col">
      <div className={`px-3 py-2 sm:px-4 border-b border-color bg-[#374151]`}>
        <h3 className="text-sm font-semibold heading-color leading-snug break-words pr-24" title={displayName}>
          {displayName}
        </h3>
      </div>
      <div className="absolute top-2 right-2 z-10 text-[13px] text-white bg-[#4F46E5] px-2 py-0.5 rounded-full" aria-label={companyLabel} title={companyLabel}>
        {companyLabel}
      </div>
      {/* ----- LIST ----- */}
      <ul className="divide-y divide-color flex-1">
        {tickers.map((ticker) => (
          <li key={ticker.symbol} className="px-3 sm:px-4 py-1.5 hover:bg-[#2D3748] transition-colors">
            <div className="min-w-0 w-full">
              <StockTickerItem symbol={ticker.symbol} name={ticker.name} exchange={ticker.exchange} score={getTickerScore(ticker)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
