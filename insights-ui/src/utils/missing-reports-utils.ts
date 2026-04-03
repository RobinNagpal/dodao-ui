import { prisma } from '@/prisma';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { TickerWithMissingReportInfo } from '@/utils/analysis-reports/report-steps-statuses';
import { Prisma } from '@prisma/client';

/**
 * Extended interface to include financial data status
 */
export interface TickerWithMissingReportInfoExtended extends TickerWithMissingReportInfo {
  isMissingFinancialData: boolean;
}

export interface MissingReportsDateFilters {
  businessAndMoatBefore?: string;
  fairValueBefore?: string;
}

/**
 * Gets tickers with missing reports OR missing financial data for a given space.
 *
 * When NO date filters are provided: returns tickers that have any missing report
 * or missing financial data (the default "missing reports" view).
 *
 * When date filters ARE provided: returns ONLY tickers whose category analysis
 * was last updated before the given date (or has no result at all). The normal
 * "missing reports" criteria are NOT mixed in — the results are exclusively
 * date-filtered so the admin knows exactly what they're looking at.
 *
 * Excludes tickers with pending generation requests (NotStarted or InProgress).
 */
export async function getTickersWithMissingReports(spaceId: string, dateFilters?: MissingReportsDateFilters): Promise<TickerWithMissingReportInfoExtended[]> {
  const hasBusinessAndMoatFilter = !!dateFilters?.businessAndMoatBefore;
  const hasFairValueFilter = !!dateFilters?.fairValueBefore;
  const hasAnyDateFilter = hasBusinessAndMoatFilter || hasFairValueFilter;

  const businessAndMoatJoin = hasBusinessAndMoatFilter
    ? Prisma.sql`LEFT JOIN ticker_v1_category_analysis_results car_bm
        ON t.id = car_bm.ticker_id AND car_bm.category_key = 'BusinessAndMoat'`
    : Prisma.empty;

  const fairValueJoin = hasFairValueFilter
    ? Prisma.sql`LEFT JOIN ticker_v1_category_analysis_results car_fv
        ON t.id = car_fv.ticker_id AND car_fv.category_key = 'FairValue'`
    : Prisma.empty;

  // Expose the joined date columns in the CTE SELECT so the outer query can filter on them
  const businessAndMoatSelect = hasBusinessAndMoatFilter ? Prisma.sql`, car_bm.updated_at AS "bmCategoryUpdatedAt"` : Prisma.empty;
  const fairValueSelect = hasFairValueFilter ? Prisma.sql`, car_fv.updated_at AS "fvCategoryUpdatedAt"` : Prisma.empty;

  const businessAndMoatGroupBy = hasBusinessAndMoatFilter ? Prisma.sql`, car_bm.updated_at` : Prisma.empty;
  const fairValueGroupBy = hasFairValueFilter ? Prisma.sql`, car_fv.updated_at` : Prisma.empty;

  // Build the outer WHERE clause depending on whether date filters are active
  let outerWhereClause: Prisma.Sql;

  if (hasAnyDateFilter) {
    const conditions: Prisma.Sql[] = [];

    if (hasBusinessAndMoatFilter) {
      conditions.push(Prisma.sql`("bmCategoryUpdatedAt" IS NULL OR "bmCategoryUpdatedAt" < ${new Date(dateFilters!.businessAndMoatBefore!)}::timestamptz)`);
    }
    if (hasFairValueFilter) {
      conditions.push(Prisma.sql`("fvCategoryUpdatedAt" IS NULL OR "fvCategoryUpdatedAt" < ${new Date(dateFilters!.fairValueBefore!)}::timestamptz)`);
    }

    outerWhereClause = conditions.length === 2 ? Prisma.sql`${conditions[0]} AND ${conditions[1]}` : conditions[0];
  } else {
    outerWhereClause = Prisma.sql`
      "businessAndMoatFactorResultsCount" < 1 OR
      "financialAnalysisFactorsResultsCount" < 1 OR
      "pastPerformanceFactorsResultsCount" < 1 OR
      "futureGrowthFactorsResultsCount" < 1 OR
      "fairValueFactorsResultsCount" < 1 OR
      "isMissingCompetitionReport" = TRUE OR
      "isMissingFinalSummaryReport" = TRUE OR
      "isMissingMetaDescriptionReport" = TRUE OR
      "isMissingAboutReport" = TRUE OR
      "isMissingFinancialData" = TRUE`;
  }

  const tickersWithMissingReports = await prisma.$queryRaw<TickerWithMissingReportInfoExtended[]>`
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
        t.meta_description AS "metaDescription",
        t.space_id AS "spaceId",
        t.stock_analyze_url AS "stockAnalyzeUrl",

        -- Factor counts for reports
        COUNT(*) FILTER (WHERE fr.category_key::text = ${TickerAnalysisCategory.BusinessAndMoat})::int AS "businessAndMoatFactorResultsCount",
        COUNT(*) FILTER (WHERE fr.category_key::text = ${TickerAnalysisCategory.FinancialStatementAnalysis})::int AS "financialAnalysisFactorsResultsCount",
        COUNT(*) FILTER (WHERE fr.category_key::text = ${TickerAnalysisCategory.PastPerformance})::int AS "pastPerformanceFactorsResultsCount",
        COUNT(*) FILTER (WHERE fr.category_key::text = ${TickerAnalysisCategory.FutureGrowth})::int AS "futureGrowthFactorsResultsCount",
        COUNT(*) FILTER (WHERE fr.category_key::text = ${TickerAnalysisCategory.FairValue})::int AS "fairValueFactorsResultsCount",

        -- Competition present?
        NOT EXISTS (
          SELECT 1 FROM ticker_v1_vs_competition vc
          WHERE vc.ticker_id = t.id AND vc.space_id = t.space_id
        ) AS "isMissingCompetitionReport",

        -- Final summary present?
        (t.summary IS NULL OR btrim(t.summary) = '') AS "isMissingFinalSummaryReport",

        -- Meta description present?
        (t.meta_description IS NULL OR btrim(t.meta_description) = '') AS "isMissingMetaDescriptionReport",

        -- About report present?
        (t.about_report IS NULL OR btrim(t.about_report) = '') AS "isMissingAboutReport",

        -- Financial data status (missing if no scrapper info OR empty summary)
        (
          sasi.ticker_id IS NULL OR
          (sasi.summary = '{}'::jsonb OR sasi.summary::text = '{}')
        ) AS "isMissingFinancialData"

        ${businessAndMoatSelect}
        ${fairValueSelect}

      FROM
        tickers_v1 t
      LEFT JOIN
        ticker_v1_analysis_category_factor_results fr ON t.id = fr.ticker_id
      LEFT JOIN
        ticker_v1_stock_analyzer_scrapper_info sasi ON t.id = sasi.ticker_id
      ${businessAndMoatJoin}
      ${fairValueJoin}
      WHERE
        t.space_id = ${spaceId}
        -- Exclude tickers with pending generation requests
        AND NOT EXISTS (
          SELECT 1 FROM ticker_v1_generation_requests gr 
          WHERE gr.ticker_id = t.id 
          AND gr.status IN ('NotStarted', 'InProgress')
        )
      GROUP BY
        t.id, sasi.ticker_id, sasi.summary ${businessAndMoatGroupBy} ${fairValueGroupBy}
    )
    SELECT *
    FROM factor_counts
    WHERE ${outerWhereClause}
    ORDER BY symbol;
  `;

  return tickersWithMissingReports;
}

/**
 * Gets missing reports for a specific ticker
 */
export async function getMissingReportsForTicker(spaceId: string, tickerId: string): Promise<TickerWithMissingReportInfo | null> {
  const tickersWithMissingReports = await prisma.$queryRaw<TickerWithMissingReportInfo[]>`
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
        t.meta_description AS "metaDescription",
        t.space_id AS "spaceId",
        t.stock_analyze_url AS "stockAnalyzeUrl",

        COUNT(*) FILTER (WHERE fr.category_key::text = ${TickerAnalysisCategory.BusinessAndMoat})::int AS "businessAndMoatFactorResultsCount",
        COUNT(*) FILTER (WHERE fr.category_key::text = ${TickerAnalysisCategory.FinancialStatementAnalysis})::int AS "financialAnalysisFactorsResultsCount",
        COUNT(*) FILTER (WHERE fr.category_key::text = ${TickerAnalysisCategory.PastPerformance})::int AS "pastPerformanceFactorsResultsCount",
        COUNT(*) FILTER (WHERE fr.category_key::text = ${TickerAnalysisCategory.FutureGrowth})::int AS "futureGrowthFactorsResultsCount",
        COUNT(*) FILTER (WHERE fr.category_key::text = ${TickerAnalysisCategory.FairValue})::int AS "fairValueFactorsResultsCount",

        -- Competition present?
        NOT EXISTS (
          SELECT 1 FROM ticker_v1_vs_competition vc
          WHERE vc.ticker_id = t.id AND vc.space_id = t.space_id
        ) AS "isMissingCompetitionReport",

        -- Final summary present?
        (t.summary IS NULL OR btrim(t.summary) = '') AS "isMissingFinalSummaryReport",

        -- NEW: meta description present?
        (t.meta_description IS NULL OR btrim(t.meta_description) = '') AS "isMissingMetaDescriptionReport",

        -- NEW: about report present?
        (t.about_report IS NULL OR btrim(t.about_report) = '') AS "isMissingAboutReport"

      FROM
        tickers_v1 t
      LEFT JOIN
        ticker_v1_analysis_category_factor_results fr
          ON t.id = fr.ticker_id
      WHERE
        t.space_id = ${spaceId}
        AND t.id = ${tickerId}
      GROUP BY 
        t.id
    )
    SELECT * 
    FROM factor_counts;
  `;

  return tickersWithMissingReports.length > 0 ? tickersWithMissingReports[0] : null;
}
