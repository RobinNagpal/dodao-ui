import type { EtfCompetitorCachedScore } from '@/types/etf/etf-analysis-types';

/**
 * Axis labels for the ETF competition quadrant.
 * Top-right (High Returns + High Efficiency) is the "Top Pick" quadrant,
 * analogous to "High Quality" on the ticker competition chart.
 */
export type EtfCompetitorClassification = 'Top Pick' | 'Return Focused' | 'Cost Efficient' | 'Underperform';

export interface EtfQuadrantDataPoint {
  symbol: string;
  name: string;
  returnsScore: number; // 0-100 — past returns + future outlook axis
  efficiencyScore: number; // 0-100 — cost efficiency + risk analysis axis
  classification: EtfCompetitorClassification;
  isMainEtf: boolean;
  exchange?: string;
}

// Each ETF analysis category caps at ~5 group-filtered factors per fund.
// The two-category sum therefore caps at ~10 — same assumption the ticker
// `computeQuadrantScores` makes (3 cats × 5 factors = 15, 2 cats × 5 = 10).
// We clamp the final percent to [0, 100] so an over-specified factor set
// (11 factors in Future Outlook today) cannot push the axis past 100%.
const RETURNS_RAW_MAX = 10;
const EFFICIENCY_RAW_MAX = 10;

function clampPercent(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 100) return 100;
  return value;
}

/**
 * Map a cached ETF score row to the two axes of the competition quadrant chart.
 *
 * - returns axis  = past returns + future outlook (what did / will the fund deliver)
 * - efficiency axis = cost efficiency + risk analysis (what does it cost / what can break)
 */
export function computeEtfQuadrantScores(scores: EtfCompetitorCachedScore): { returnsScore: number; efficiencyScore: number } {
  const returnsRaw = scores.performanceAndReturnsScore + (scores.futurePerformanceOutlookScore ?? 0);
  const efficiencyRaw = scores.costEfficiencyAndTeamScore + scores.riskAnalysisScore;
  return {
    returnsScore: clampPercent((returnsRaw / RETURNS_RAW_MAX) * 100),
    efficiencyScore: clampPercent((efficiencyRaw / EFFICIENCY_RAW_MAX) * 100),
  };
}

export function classifyEtf(returnsScore: number, efficiencyScore: number): EtfCompetitorClassification {
  const strongReturns = returnsScore >= 50;
  const strongEfficiency = efficiencyScore >= 50;
  if (strongReturns && strongEfficiency) return 'Top Pick';
  if (strongReturns && !strongEfficiency) return 'Return Focused';
  if (!strongReturns && strongEfficiency) return 'Cost Efficient';
  return 'Underperform';
}
