import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { isExchange } from '@/utils/countryExchangeUtils';
import { revalidateAllEtfPageTagsOnly } from '@/utils/etf-cache-utils';
import { isEtfAnalyzerInfoUsable, ScrapeEtfAnalyzerInfoResult, ScrapeSectionError, scrapeEtfAnalyzerInfo } from '@/utils/stock-analyzer';
import { ETF_ANALYZER_INFO_REFRESHABLE_FIELDS, EtfAnalyzerInfoFieldKey } from '@/utils/stock-analyzer/etf-analyzer-info-parser';
import { generateEtfStockAnalyzeUrl } from '@/utils/stockAnalyzeUrlValidation';
import { NextRequest } from 'next/server';

export interface FetchEtfAnalyzerInfoResponse {
  success: boolean;
  /** The ETF's page on the stock-data source, for reference. */
  etfUrl: string;
  /** The ETF's row key in the source's screener data (`SPY`, `tsx/ZLC`). */
  sourceKey: string;
  /** Stored fields overwritten with fresh values. */
  updatedFields: EtfAnalyzerInfoFieldKey[];
  /** Refreshable fields the source had no value for; their stored values were kept. */
  keptFields: EtfAnalyzerInfoFieldKey[];
  errors: ScrapeSectionError[];
}

function normalizeUpperTrim(v: string | null | undefined): string {
  return (v ?? '').toUpperCase().trim();
}

/**
 * Refresh an ETF's `EtfStockAnalyzerInfo` row from the stock-data source.
 *
 * Only fields the source returned a value for are written; any field it has
 * no value for keeps its stored value (the row is never blanked), and an ETF
 * the source does not list leaves the row untouched.
 */
async function postHandler(
  _req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<FetchEtfAnalyzerInfoResponse> {
  const { spaceId, exchange, etf } = await params;
  const symbol = normalizeUpperTrim(etf);
  const ex = normalizeUpperTrim(exchange);

  if (!isExchange(ex)) {
    throw new Error(`Unsupported exchange: ${ex}`);
  }

  const etfRecord = await prisma.etf.findFirstOrThrow({
    where: { spaceId, symbol, exchange: ex },
    select: { id: true, symbol: true },
  });

  const etfUrl: string = generateEtfStockAnalyzeUrl(etfRecord.symbol, ex);
  const scraped: ScrapeEtfAnalyzerInfoResult = await scrapeEtfAnalyzerInfo(etfRecord.symbol, ex);
  const { data, errors, sourceKey } = scraped;

  const updatedFields = Object.keys(data) as EtfAnalyzerInfoFieldKey[];
  const keptFields: EtfAnalyzerInfoFieldKey[] = ETF_ANALYZER_INFO_REFRESHABLE_FIELDS.filter((field) => !(field in data));

  if (!isEtfAnalyzerInfoUsable(data)) {
    console.error(`Scraped no usable analyzer info for ${etfRecord.symbol} (${ex}) from source key ${sourceKey}; keeping previously stored analyzer info`);
    return { success: false, etfUrl, sourceKey, updatedFields: [], keptFields: [...ETF_ANALYZER_INFO_REFRESHABLE_FIELDS], errors };
  }

  await prisma.etfStockAnalyzerInfo.upsert({
    where: { etfId: etfRecord.id },
    update: { symbol: etfRecord.symbol, ...data },
    create: { etf: { connect: { id: etfRecord.id } }, symbol: etfRecord.symbol, ...data },
  });

  // Every per-ETF page (main + 6 sub-pages) reads this row: category, issuer,
  // asset class, returns, risk ratios…
  revalidateAllEtfPageTagsOnly(etfRecord.symbol, ex);

  return { success: true, etfUrl, sourceKey, updatedFields, keptFields, errors };
}

export const POST = withAdminOrToken<FetchEtfAnalyzerInfoResponse>(postHandler);
