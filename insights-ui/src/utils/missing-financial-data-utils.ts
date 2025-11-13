import { prisma } from '@/prisma';
import { TickerV1, TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';

export interface TickerWithMissingFinancialData extends TickerV1 {
  industry: TickerV1Industry | null;
  subIndustry: TickerV1SubIndustry | null;
}

/**
 * Gets tickers with missing financial data (no stockAnalyzerScrapperInfo OR empty summary {}) for a given space
 */
export async function getTickersWithMissingFinancialData(spaceId: string): Promise<TickerWithMissingFinancialData[]> {
  // First, get tickers with no stockAnalyzerScrapperInfo
  const tickersWithoutInfo = await prisma.tickerV1.findMany({
    where: {
      spaceId,
      stockAnalyzerScrapperInfo: null,
    },
    include: {
      industry: true,
      subIndustry: true,
    },
    orderBy: {
      symbol: 'asc',
    },
  });

  // Then, get tickers with empty summary ({} - empty JSON object)
  // Using raw SQL to check if summary is empty JSON object
  const tickersWithEmptySummary = await prisma.$queryRaw<
    Array<{
      id: string;
      name: string;
      symbol: string;
      exchange: string;
      industryKey: string;
      subIndustryKey: string;
      websiteUrl: string | null;
      summary: string | null;
      aboutReport: string | null;
      createdAt: Date;
      updatedAt: Date;
      createdBy: string | null;
      updatedBy: string | null;
      metaDescription: string | null;
      spaceId: string;
      stockAnalyzeUrl: string;
    }>
  >`
    SELECT 
      t.id,
      t.name,
      t.symbol,
      t.exchange,
      t.industry_key AS "industryKey",
      t.sub_industry_key AS "subIndustryKey",
      t.website_url AS "websiteUrl",
      t.summary,
      t.about_report AS "aboutReport",
      t.created_at AS "createdAt",
      t.updated_at AS "updatedAt",
      t.created_by AS "createdBy",
      t.updated_by AS "updatedBy",
      t.meta_description AS "metaDescription",
      t.space_id AS "spaceId",
      t.stock_analyze_url AS "stockAnalyzeUrl"
    FROM tickers_v1 t
    INNER JOIN ticker_v1_stock_analyzer_scrapper_info sasi ON t.id = sasi.ticker_id
    WHERE 
      t.space_id = ${spaceId}
      AND (sasi.summary = '{}'::jsonb OR sasi.summary::text = '{}')
  `;

  // Get full ticker data with relations for tickers with empty summary
  const tickerIdsWithEmptySummary = tickersWithEmptySummary.map((t) => t.id);
  const fullTickersWithEmptySummary =
    tickerIdsWithEmptySummary.length > 0
      ? await prisma.tickerV1.findMany({
          where: {
            id: { in: tickerIdsWithEmptySummary },
          },
          include: {
            industry: true,
            subIndustry: true,
          },
          orderBy: {
            symbol: 'asc',
          },
        })
      : [];

  // Combine both lists and remove duplicates
  const allTickers = [...tickersWithoutInfo, ...fullTickersWithEmptySummary];
  const uniqueTickers = Array.from(new Map(allTickers.map((ticker) => [ticker.id, ticker])).values());

  // Sort by symbol
  return uniqueTickers.sort((a, b) => a.symbol.localeCompare(b.symbol));
}
