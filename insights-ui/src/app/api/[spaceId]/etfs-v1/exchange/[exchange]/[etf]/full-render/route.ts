/**
 * Consolidated payload for the main `/etfs/[exchange]/[etf]` page.
 *
 * The page used to issue 8 separately-tagged fetches (etf, financial-info,
 * analysis, scores, similar-etfs, portfolio-holdings, competition,
 * price-history) — each became one Vercel Data Cache entry, so a single
 * umbrella invalidation cost 1 HTML ISR write + 8 Data Cache writes per
 * rebuild. Routing the page through this endpoint collapses the per-rebuild
 * cost to 1 HTML + 1 Data Cache entry. Mirrors
 * `tickers-v1/.../full-render` on the stocks side.
 */
import type { EtfAnalysisResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/route';
import type { EtfPortfolioHoldingsResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/portfolio-holdings/route';
import type { EtfFastResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/route';
import type { EtfFinancialInfoResponse, EtfScoresResponse, SimilarEtf } from '@/types/etf/etf-detail-response-types';
import type { EtfApplicableInvestorGoals, EtfCompetitionResponse, EtfKeyFactsFlagAssessment } from '@/types/etf/etf-analysis-types';
import { getEtfFullRenderData } from '@/utils/etf-page-data';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface EtfKeyFactsReportResponse {
  keyFacts: string | null;
  greenFlags: EtfKeyFactsFlagAssessment[];
  redFlags: EtfKeyFactsFlagAssessment[];
  applicableInvestorGoals: EtfApplicableInvestorGoals[];
}

/**
 * Compact risk/return figures surfaced as a tight row under the financial-info
 * + radar block on the main ETF page. Sharpe/Sortino/beta come from the
 * screener (`stockAnalyzerInfo`), max drawdown from the Morningstar risk JSON,
 * and the expected forward returns from the key-facts report. All nullable —
 * the row renders only the figures that exist.
 */
export interface EtfKeyMetricsResponse {
  sharpe: number | null;
  sortino: number | null;
  beta5y: number | null;
  /** Worst peak-to-trough loss as a percent (negative, e.g. -18.4). */
  maxDrawdown: number | null;
  expectedNext1YrReturns: number | null;
  expectedNext1YrReturnsReason: string | null;
  expectedNext3YrReturns: number | null;
  expectedNext3YrReturnsReason: string | null;
  expectedNext5YrReturns: number | null;
  expectedNext5YrReturnsReason: string | null;
}

export interface EtfFullRenderResponse {
  etf: EtfFastResponse | null;
  financialInfo: EtfFinancialInfoResponse | null;
  analysis: EtfAnalysisResponse;
  scores: EtfScoresResponse | null;
  similarEtfs: SimilarEtf[];
  portfolioHoldings: EtfPortfolioHoldingsResponse;
  competition: EtfCompetitionResponse | null;
  keyFacts: EtfKeyFactsReportResponse | null;
  keyMetrics: EtfKeyMetricsResponse;
}

async function getHandler(
  _req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<EtfFullRenderResponse> {
  const { spaceId, exchange, etf } = await params;
  return getEtfFullRenderData(spaceId, exchange, etf);
}

export const GET = withErrorHandlingV2<EtfFullRenderResponse>(getHandler);
