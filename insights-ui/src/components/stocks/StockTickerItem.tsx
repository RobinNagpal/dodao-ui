import { getScoreColorClasses } from '@/utils/score-utils';
import Link from 'next/link';

interface StockTickerItemProps {
  symbol: string;
  name: string;
  exchange: string;
  score: number;
  displayExchange?: string; // Optional formatted exchange (e.g., "US: NYSE")
  industry?: string; // Optional industry name
}

export default function StockTickerItem({ symbol, name, exchange, score, displayExchange, industry }: StockTickerItemProps) {
  const { textColorClass, bgColorClass, scoreLabel } = getScoreColorClasses(score || 0);

  return (
    <Link href={`/stocks/${exchange}/${symbol}`} className="w-full" aria-label={`View ${name}`} title={`View ${name}`}>
      <div className="flex gap-1.5 items-center min-w-0">
        <p className={`${textColorClass} px-1 rounded-md ${bgColorClass} bg-opacity-15 hover:bg-opacity-25 w-[45px] text-right shrink-0`}>
          <span className="font-mono tabular-nums text-right text-xs">{score}/25</span>
        </p>
        <p className="whitespace-nowrap rounded-md px-2 py-0.5 text-sm font-medium bg-[#4F46E5] text-white self-center shadow-sm shrink-0">{symbol}</p>
        <p className="text-sm font-medium text-break break-words text-white truncate min-w-0 flex-1">{name}</p>
        {industry && <p className="text-xs font-medium text-gray-400 whitespace-nowrap shrink-0 ml-2">{industry}</p>}
        {displayExchange && !industry && <p className="text-xs font-medium text-gray-400 whitespace-nowrap shrink-0 ml-2">{displayExchange}</p>}
      </div>
    </Link>
  );
}
