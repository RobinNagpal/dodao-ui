import type { EtfCompetitionResponse } from '@/types/etf/etf-analysis-types';
import { classifyEtf, computeEtfQuadrantScores, type EtfQuadrantDataPoint } from '@/util/etf-quadrant-chart-utils';

/**
 * Build the quadrant data points rendered by the ETF competition chart.
 *
 * Main ETF always appears when a cached score exists; peers are included only
 * when we cover them in our system and have a cached score for them. Peers
 * without cached scores are still shown in the competitor list further down
 * the page — they just can't be positioned on the Returns × Efficiency axes.
 */
export function buildEtfQuadrantDataPoints(data: EtfCompetitionResponse): EtfQuadrantDataPoint[] {
  const points: EtfQuadrantDataPoint[] = [];

  const mainScore = data.etf?.cachedScoreEntry;
  if (data.etf && mainScore) {
    const { returnsScore, efficiencyScore } = computeEtfQuadrantScores(mainScore);
    points.push({
      symbol: data.etf.symbol,
      name: data.etf.name,
      returnsScore,
      efficiencyScore,
      classification: classifyEtf(returnsScore, efficiencyScore),
      isMainEtf: true,
      exchange: data.etf.exchange,
    });
  }

  for (const competitor of data.competitors) {
    const cached = competitor.etfData?.cachedScoreEntry;
    if (!cached || !competitor.existsInSystem) continue;
    const { returnsScore, efficiencyScore } = computeEtfQuadrantScores(cached);
    points.push({
      symbol: competitor.etfData!.symbol,
      name: competitor.companyName,
      returnsScore,
      efficiencyScore,
      classification: classifyEtf(returnsScore, efficiencyScore),
      isMainEtf: false,
      exchange: competitor.etfData!.exchange,
    });
  }

  return points;
}
