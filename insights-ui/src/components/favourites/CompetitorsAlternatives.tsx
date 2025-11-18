import TickerBadge from './TickerBadge';
import { TickerBasicsWithFinalScore } from '@/types/ticker-user';

interface CompetitorsAlternativesProps {
  competitorsConsidered: TickerBasicsWithFinalScore[];
  betterAlternatives: TickerBasicsWithFinalScore[];
}

export default function CompetitorsAlternatives({ competitorsConsidered, betterAlternatives }: CompetitorsAlternativesProps) {
  if (competitorsConsidered.length === 0 && betterAlternatives.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mt-2">
      {competitorsConsidered.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-gray-400 tracking-wider mb-2">Competitors Considered</h5>
          <div className="flex flex-wrap gap-2">
            {competitorsConsidered.map((ticker) => (
              <TickerBadge
                key={ticker.id}
                ticker={ticker}
                showScore={true}
                showName={true}
                linkToStock={true}
              />
            ))}
          </div>
        </div>
      )}

      {betterAlternatives.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-gray-400 tracking-wider mb-2">Better Alternatives</h5>
          <div className="flex flex-wrap gap-2">
            {betterAlternatives.map((ticker) => (
              <TickerBadge
                key={ticker.id}
                ticker={ticker}
                showScore={true}
                showName={true}
                linkToStock={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
