import { CompetitorTickerCachedScore } from '@/utils/ticker-v1-model-utils';

export interface QuadrantDataPoint {
  ticker: string;
  companyName: string;
  qualityScore: number;
  valueScore: number;
  classification: 'High Quality' | 'Investable' | 'Value Play' | 'Underperform';
  isMainTicker: boolean;
  exchange?: string;
}

/**
 * Quality = Business & Moat + Financial Statement Analysis + Past Performance (out of 15, normalized to 0–100)
 * Value = Fair Value + Future Growth (out of 10, normalized to 0–100)
 */
export function computeQuadrantScores(scores: CompetitorTickerCachedScore): { qualityScore: number; valueScore: number } {
  const qualityRaw = scores.businessAndMoatScore + scores.financialStatementAnalysisScore + scores.pastPerformanceScore;
  const valueRaw = scores.fairValueScore + scores.futureGrowthScore;
  return {
    qualityScore: (qualityRaw / 15) * 100,
    valueScore: (valueRaw / 10) * 100,
  };
}

export function classifyStock(qualityScore: number, valueScore: number): 'High Quality' | 'Investable' | 'Value Play' | 'Underperform' {
  const isHighQuality = qualityScore >= 50;
  const isGoodValue = valueScore >= 50;
  if (isHighQuality && isGoodValue) return 'High Quality';
  if (isHighQuality && !isGoodValue) return 'Investable';
  if (!isHighQuality && isGoodValue) return 'Value Play';
  return 'Underperform';
}
