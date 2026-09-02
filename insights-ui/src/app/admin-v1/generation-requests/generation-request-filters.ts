import { TickerV1GenerationRequestWithTicker } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import { matchesSelectedFilters, type FilterableTicker, type SelectedFiltersMap } from '@/utils/ticker-filter-utils';

/** Map a generation request onto the shape the shared stock filters evaluate. */
export function toFilterableTicker(request: TickerV1GenerationRequestWithTicker): FilterableTicker {
  const { ticker } = request;
  const scores = ticker.cachedScoreEntry;

  return {
    symbol: ticker.symbol,
    name: ticker.name,
    categoryScores: scores
      ? {
          BusinessAndMoat: scores.businessAndMoatScore,
          FinancialStatementAnalysis: scores.financialStatementAnalysisScore,
          PastPerformance: scores.pastPerformanceScore,
          FutureGrowth: scores.futureGrowthScore,
          FairValue: scores.fairValueScore,
        }
      : null,
    totalScore: scores?.finalScore ?? null,
    marketCap: ticker.financialInfo?.marketCap ?? null,
    pe: ticker.financialInfo?.pe ?? null,
    dividendYield: ticker.financialInfo?.dividendYield ?? null,
    forwardPe: ticker.forwardPe,
    reportUpdatedAt: ticker.reportUpdatedAt,
    managementAlignment: ticker.managementAlignment,
    stabilityResilience: ticker.stabilityResilience,
  };
}

/**
 * Apply the stock filters to already-fetched generation requests, entirely in
 * the browser — no request, no URL change.
 */
export function filterGenerationRequests(requests: TickerV1GenerationRequestWithTicker[], selected: SelectedFiltersMap): TickerV1GenerationRequestWithTicker[] {
  const hasSelection: boolean = Object.values(selected).some((v) => v && v.length > 0);
  if (!hasSelection) return requests;

  return requests.filter((request) => matchesSelectedFilters(toFilterableTicker(request), selected));
}
