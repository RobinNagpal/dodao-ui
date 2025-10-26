import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { TickerAnalysisCategory } from '@/lib/mappingsV1';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { TickerV1 } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface MissingReportsForTicker extends TickerV1 {
  businessAndMoatFactorResultsCount: number;
  financialAnalysisFactorsResultsCount: number;
  pastPerformanceFactorsResultsCount: number;
  futureGrowthFactorsResultsCount: number;
  fairValueFactorsResultsCount: number;
  isMissingBillAckmanReport: boolean;
  isMissingWarrenBuffettReport: boolean;
  isMissingCharlieMungerReport: boolean;
}

const getHandler = async (
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<MissingReportsForTicker[]> => {
  const { spaceId } = await params;

  // Use Prisma's raw query to efficiently find tickers with missing reports
  // This avoids loading all tickers into memory
  const tickersWithMissingReports = await prisma.$queryRaw<MissingReportsForTicker[]>`
    WITH factor_counts AS (
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
        t.cached_score AS "cachedScore",
        t.meta_description AS "metaDescription",
        t.space_id AS "spaceId",
        t.stock_analyze_url AS "stockAnalyzeUrl",
        COUNT(CASE WHEN fr.category_key = ${TickerAnalysisCategory.BusinessAndMoat} THEN 1 END) AS "businessAndMoatFactorResultsCount",
        COUNT(CASE WHEN fr.category_key = ${TickerAnalysisCategory.FinancialStatementAnalysis} THEN 1 END) AS "financialAnalysisFactorsResultsCount",
        COUNT(CASE WHEN fr.category_key = ${TickerAnalysisCategory.PastPerformance} THEN 1 END) AS "pastPerformanceFactorsResultsCount",
        COUNT(CASE WHEN fr.category_key = ${TickerAnalysisCategory.FutureGrowth} THEN 1 END) AS "futureGrowthFactorsResultsCount",
        COUNT(CASE WHEN fr.category_key = ${TickerAnalysisCategory.FairValue} THEN 1 END) AS "fairValueFactorsResultsCount",
        NOT EXISTS (
          SELECT 1 FROM ticker_v1_investor_analysis_results iar 
          WHERE iar.ticker_id = t.id AND iar.investor_key = 'BILL_ACKMAN'
        ) AS "isMissingBillAckmanReport",
        NOT EXISTS (
          SELECT 1 FROM ticker_v1_investor_analysis_results iar 
          WHERE iar.ticker_id = t.id AND iar.investor_key = 'WARREN_BUFFETT'
        ) AS "isMissingWarrenBuffettReport",
        NOT EXISTS (
          SELECT 1 FROM ticker_v1_investor_analysis_results iar 
          WHERE iar.ticker_id = t.id AND iar.investor_key = 'CHARLIE_MUNGER'
        ) AS "isMissingCharlieMungerReport"
      FROM 
        tickers_v1 t
      LEFT JOIN 
        ticker_v1_analysis_category_factor_results fr ON t.id = fr.ticker_id
      WHERE 
        t.space_id = ${spaceId}
      GROUP BY 
        t.id
    )
    SELECT * FROM factor_counts
    WHERE 
      "businessAndMoatFactorResultsCount" < 1 OR
      "financialAnalysisFactorsResultsCount" < 1 OR
      "pastPerformanceFactorsResultsCount" < 1 OR
      "futureGrowthFactorsResultsCount" < 1 OR
      "fairValueFactorsResultsCount" < 1;
  `;

  return tickersWithMissingReports;
};

export const GET = withLoggedInAdmin<MissingReportsForTicker[]>(getHandler);
