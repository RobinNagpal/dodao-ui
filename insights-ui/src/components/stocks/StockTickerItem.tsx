import { getScoreColorClasses } from '@/utils/score-utils';
import Link from 'next/link';

interface StockTickerItemProps {
  symbol: string;
  name: string;
  exchange: string;
  score: number;
}

export default function StockTickerItem({ symbol, name, exchange, score }: StockTickerItemProps) {
  const { textColorClass, bgColorClass, scoreLabel } = getScoreColorClasses(score || 0);

  return (
    <Link prefetch={false} href={`/stocks/${exchange}/${symbol}`} className="w-full" aria-label={`View ${name}`} title={`View ${name}`}>
      <div className="flex gap-1.5 items-center">
        <p className={`${textColorClass} px-1 rounded-md ${bgColorClass} bg-opacity-15 hover:bg-opacity-25 w-[45px] text-right`}>
          <span className="font-mono tabular-nums text-right text-xs">{score}/25</span>
        </p>
        <p className="whitespace-nowrap rounded-md px-2 py-0.5 text-sm font-medium bg-[#4F46E5] text-white self-center shadow-sm">{symbol}</p>
        <p className="text-sm font-medium text-break break-words text-white truncate max-w-[260px]">{name}</p>
      </div>
    </Link>
  );
}
