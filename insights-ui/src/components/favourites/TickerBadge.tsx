import { getScoreColorClasses } from '@/utils/score-utils';
import Link from 'next/link';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { TickerBasicsWithFinalScore } from '@/types/ticker-user';

interface TickerBadgeProps {
  ticker: TickerBasicsWithFinalScore;
  showScore?: boolean;
  showName?: boolean;
  showFullName?: boolean;
  linkToStock?: boolean;
  onRemove?: () => void;
}

export default function TickerBadge({ ticker, showScore = false, showName = false, showFullName = false, linkToStock = false, onRemove }: TickerBadgeProps) {
  const score = ticker.cachedScoreEntry?.finalScore || 0;
  const { textColorClass, bgColorClass } = getScoreColorClasses(score);

  const content = (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 border border-border rounded hover:border-surface-3 transition-colors">
      {showScore && <span className={`${textColorClass} px-1 rounded ${bgColorClass} bg-opacity-15 text-[11px] font-mono`}>{score}/25</span>}
      <span className="text-xs font-semibold bg-primary text-primary-text px-1 rounded shrink-0">{ticker.symbol}</span>
      {showName && <span className={`text-xs text-body ${showFullName ? '' : 'truncate max-w-[130px]'}`}>{ticker.name}</span>}
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="text-muted hover:text-red-400 -ml-0.5"
        >
          <XMarkIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  if (linkToStock) {
    return (
      <Link href={`/stocks/${ticker.exchange}/${ticker.symbol}`} prefetch={false}>
        {content}
      </Link>
    );
  }

  return content;
}
