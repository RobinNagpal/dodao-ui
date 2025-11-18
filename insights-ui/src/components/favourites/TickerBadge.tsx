import { getScoreColorClasses } from '@/utils/score-utils';
import Link from 'next/link';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { TickerBasicsWithFinalScore } from '@/types/ticker-user';

interface TickerBadgeProps {
  ticker: TickerBasicsWithFinalScore;
  showScore?: boolean;
  showName?: boolean;
  linkToStock?: boolean;
  onRemove?: () => void;
}

export default function TickerBadge({ ticker, showScore = false, showName = false, linkToStock = false, onRemove }: TickerBadgeProps) {
  const score = ticker.cachedScoreEntry?.finalScore || 0;
  const { textColorClass, bgColorClass } = getScoreColorClasses(score);

  const content = (
    <div className="flex items-center gap-1.5 px-2 py-1 border border-gray-600 rounded hover:border-gray-500 transition-colors">
      {showScore && <span className={`${textColorClass} px-1 rounded ${bgColorClass} bg-opacity-15 text-xs font-mono`}>{score}/25</span>}
      <span className="text-xs font-medium bg-[#4F46E5] text-white px-1.5 py-0.5 rounded shrink-0">{ticker.symbol}</span>
      {showName && <span className="text-xs text-white truncate max-w-[150px]">{ticker.name}</span>}
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="text-gray-400 hover:text-red-400 ml-1"
        >
          <XMarkIcon className="w-3 h-3" />
        </button>
      )}
    </div>
  );

  if (linkToStock) {
    return <Link href={`/stocks/${ticker.exchange}/${ticker.symbol}`}>{content}</Link>;
  }

  return content;
}
