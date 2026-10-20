import type { EtfCompetitionResponse } from '@/types/etf/etf-analysis-types';
import { formatExchangeWithCountry, getCountryByExchange, isExchange } from '@/utils/countryExchangeUtils';
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
      aum: data.etf.aum,
      expenseRatio: data.etf.expenseRatio,
    });
  }

  const mainCountry = data.etf ? countryOf(data.etf.exchange) : undefined;

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
      aum: competitor.etfData!.aum,
      expenseRatio: competitor.etfData!.expenseRatio,
      foreignExchangeLabel:
        mainCountry && countryOf(competitor.etfData!.exchange) !== mainCountry ? formatExchangeWithCountry(competitor.etfData!.exchange) : undefined,
    });
  }

  return points;
}

function countryOf(exchange: string): string | undefined {
  const normalized = exchange.trim().toUpperCase();
  return isExchange(normalized) ? getCountryByExchange(normalized) : undefined;
}
