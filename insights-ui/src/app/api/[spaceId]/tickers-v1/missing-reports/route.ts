// insights-ui/src/app/api/[spaceId]/tickers-v1/missing-reports/route.ts
import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { TickerV1 } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface MissingReportsForTicker extends TickerV1 {
  businessAndMoatFactorResultsCount: number;
  financialAnalysisFactorsResultsCount: number;
  pastPerformanceFactorsResultsCount: number;
  futureGrowthFactorsResultsCount: number;
  fairValueFactorsResultsCount: number;

  // existing flags
  isMissingFinalSummaryReport: boolean;
  isMissingCachedScoreRepot: boolean; // keeping existing spelling
  isMissingCompetitionReport: boolean;
  isMissingBillAckmanReport: boolean;
  isMissingWarrenBuffettReport: boolean;
  isMissingCharlieMungerReport: boolean;

  // NEW
  isMissingMetaDescriptionReport: boolean;

  industry: {
    name: string;
    industryKey: string;
  };

  subIndustry: {
    name: string;
    subIndustryKey: string;
  };
}

const getHandler = async (
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<MissingReportsForTicker[]> => {
  const { spaceId } = await params;

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

        COUNT(*) FILTER (WHERE fr.category_key::text = ${TickerAnalysisCategory.BusinessAndMoat})::int AS "businessAndMoatFactorResultsCount",
        COUNT(*) FILTER (WHERE fr.category_key::text = ${TickerAnalysisCategory.FinancialStatementAnalysis})::int AS "financialAnalysisFactorsResultsCount",
        COUNT(*) FILTER (WHERE fr.category_key::text = ${TickerAnalysisCategory.PastPerformance})::int AS "pastPerformanceFactorsResultsCount",
        COUNT(*) FILTER (WHERE fr.category_key::text = ${TickerAnalysisCategory.FutureGrowth})::int AS "futureGrowthFactorsResultsCount",
        COUNT(*) FILTER (WHERE fr.category_key::text = ${TickerAnalysisCategory.FairValue})::int AS "fairValueFactorsResultsCount",

        -- Investor analysis flags
        NOT EXISTS (
          SELECT 1 FROM ticker_v1_investor_analysis_results iar 
          WHERE iar.ticker_id = t.id AND iar.investor_key = 'BILL_ACKMAN'::text
        ) AS "isMissingBillAckmanReport",
        NOT EXISTS (
          SELECT 1 FROM ticker_v1_investor_analysis_results iar 
          WHERE iar.ticker_id = t.id AND iar.investor_key = 'WARREN_BUFFETT'::text
        ) AS "isMissingWarrenBuffettReport",
        NOT EXISTS (
          SELECT 1 FROM ticker_v1_investor_analysis_results iar 
          WHERE iar.ticker_id = t.id AND iar.investor_key = 'CHARLIE_MUNGER'::text
        ) AS "isMissingCharlieMungerReport",

        -- Competition present?
        NOT EXISTS (
          SELECT 1 FROM ticker_v1_vs_competition vc
          WHERE vc.ticker_id = t.id AND vc.space_id = t.space_id
        ) AS "isMissingCompetitionReport",

        -- Final summary present?
        (t.summary IS NULL OR btrim(t.summary) = '') AS "isMissingFinalSummaryReport",

        -- Cached score/about present?
        (t.cached_score IS NULL OR t.about_report IS NULL OR btrim(t.about_report) = '') AS "isMissingCachedScoreRepot",

        -- NEW: meta description present?
        (t.meta_description IS NULL OR btrim(t.meta_description) = '') AS "isMissingMetaDescriptionReport"

      FROM 
        tickers_v1 t
      LEFT JOIN 
        ticker_v1_analysis_category_factor_results fr 
          ON t.id = fr.ticker_id
      WHERE 
        t.space_id = ${spaceId}
      GROUP BY 
        t.id
    )
    SELECT * 
    FROM factor_counts
    WHERE 
      "businessAndMoatFactorResultsCount" < 1 OR
      "financialAnalysisFactorsResultsCount" < 1 OR
      "pastPerformanceFactorsResultsCount" < 1 OR
      "futureGrowthFactorsResultsCount" < 1 OR
      "fairValueFactorsResultsCount" < 1 OR
      "isMissingBillAckmanReport" = TRUE OR
      "isMissingWarrenBuffettReport" = TRUE OR
      "isMissingCharlieMungerReport" = TRUE OR
      "isMissingCompetitionReport" = TRUE OR
      "isMissingFinalSummaryReport" = TRUE OR
      "isMissingCachedScoreRepot" = TRUE OR
      "isMissingMetaDescriptionReport" = TRUE   
    ORDER BY symbol;
  `;

  return tickersWithMissingReports;
};

export const GET = withLoggedInAdmin<MissingReportsForTicker[]>(getHandler);
