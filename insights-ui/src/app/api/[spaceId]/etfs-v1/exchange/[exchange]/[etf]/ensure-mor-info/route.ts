import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { ensureMorDataForAnalysis, MorKind } from '@/utils/etf-analysis-reports/mor-scrape-utils';
import { fetchEtfBySymbolAndExchange } from '@/utils/etf-analysis-reports/get-etf-report-data-utils';
import { NextRequest } from 'next/server';

export interface EnsureMorInfoResponse {
  /** Kinds whose tables were empty and for which a scrape lambda was triggered. Empty when all data is already present. */
  triggeredKinds: MorKind[];
}

/**
 * Check the four MOR tables for an ETF; for any that are empty, trigger the Morningstar
 * scrape lambda to populate them. Scraping is fire-and-forget (callbacks upsert the rows
 * asynchronously), so a caller that needs the data immediately should sleep a few seconds
 * before requesting the prompt.
 */
async function handler(
  _req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<EnsureMorInfoResponse> {
  const { spaceId, exchange, etf } = await params;

  const etfRecord = await fetchEtfBySymbolAndExchange(etf, exchange);

  const triggeredKinds = await ensureMorDataForAnalysis({
    etfId: etfRecord.id,
    spaceId,
    exchange: etfRecord.exchange,
    symbol: etfRecord.symbol,
  });

  return { triggeredKinds };
}

export const POST = withAdminOrToken<EnsureMorInfoResponse>(handler);
