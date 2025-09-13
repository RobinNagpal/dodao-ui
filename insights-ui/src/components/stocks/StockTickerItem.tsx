import Link from 'next/link';
import * as Tooltip from '@radix-ui/react-tooltip';
import { getScoreColorClasses } from '@/utils/score-utils';

interface StockTickerItemProps {
  symbol: string;
  name: string;
  exchange: string;
  score: number;
}

export default function StockTickerItem({ symbol, name, exchange, score }: StockTickerItemProps) {
  const { textColorClass, bgColorClass, scoreLabel } = getScoreColorClasses(score || 0);

  return (
    <Link href={`/stocks/${exchange}/${symbol}`} className="w-full">
      <div className="flex gap-1.5 items-center">
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <p className={`${textColorClass} px-1 rounded-md ${bgColorClass} bg-opacity-15 hover:bg-opacity-25 w-[45px] text-right`}>
              <span className="font-mono tabular-nums text-right text-xs">{score}/25</span>
            </p>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm shadow-lg z-50" sideOffset={5}>
              {scoreLabel} Score: {score}/25
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
        <p className="whitespace-nowrap rounded-md px-2 py-0.5 text-sm font-medium bg-[#4F46E5] text-white self-center shadow-sm">{symbol}</p>
        <p className="text-sm font-medium text-break break-words text-white truncate max-w-[180px]">{name}</p>
      </div>
    </Link>
  );
}
