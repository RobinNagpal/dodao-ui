import { TickerAnalysisCategory, CATEGORY_MAPPINGS } from '@/types/ticker-typesv1';

interface CategoryScoresProps {
  cachedScoreEntry:
    | {
        businessAndMoatScore: number;
        financialStatementAnalysisScore: number;
        pastPerformanceScore: number;
        futureGrowthScore: number;
        fairValueScore: number;
      }
    | null
    | undefined;
}

export default function CategoryScores({ cachedScoreEntry }: CategoryScoresProps) {
  if (!cachedScoreEntry) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-2 text-xs">
      <div>
        <span className="text-gray-500">{CATEGORY_MAPPINGS[TickerAnalysisCategory.BusinessAndMoat]}:</span>{' '}
        <span className="font-semibold">{cachedScoreEntry.businessAndMoatScore}/5</span>
      </div>
      <div>
        <span className="text-gray-500">{CATEGORY_MAPPINGS[TickerAnalysisCategory.FinancialStatementAnalysis]}:</span>{' '}
        <span className="font-semibold">{cachedScoreEntry.financialStatementAnalysisScore}/5</span>
      </div>
      <div>
        <span className="text-gray-500">{CATEGORY_MAPPINGS[TickerAnalysisCategory.PastPerformance]}:</span>{' '}
        <span className="font-semibold">{cachedScoreEntry.pastPerformanceScore}/5</span>
      </div>
      <div>
        <span className="text-gray-500">{CATEGORY_MAPPINGS[TickerAnalysisCategory.FutureGrowth]}:</span>{' '}
        <span className="font-semibold">{cachedScoreEntry.futureGrowthScore}/5</span>
      </div>
      <div>
        <span className="text-gray-500">{CATEGORY_MAPPINGS[TickerAnalysisCategory.FairValue]}:</span>{' '}
        <span className="font-semibold">{cachedScoreEntry.fairValueScore}/5</span>
      </div>
    </div>
  );
}
