import { prisma } from '@/prisma';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { TickerWithMissingReportInfo } from '@/utils/analysis-reports/report-steps-statuses';

/**
 * Extended interface to include financial data status
 */
export interface TickerWithMissingReportInfoExtended extends TickerWithMissingReportInfo {
  isMissingFinancialData: boolean;
}

/**
 * What the report-status query returns per ticker: the `tickers_v1` columns plus
 * the computed missing-report flags. The `industry` / `subIndustry` /
 * `cachedScoreEntry` relations are not part of it — callers merge those in from
 * their own Prisma record.
 */
export type TickerReportStatusRow = Omit<TickerWithMissingReportInfoExtended, 'industry' | 'subIndustry' | 'cachedScoreEntry'>;

/**
 * Computes the report-status flags for a set of tickers in one query: per-category
 * factor-result counts, and whether each of the standalone reports (competition,
 * management team, stability, final summary / about / meta description) and the
 * scraped financial data are present.
 *
 * Order is not guaranteed; match rows back by `id`.
 */
export async function getReportStatusForTickerIds(spaceId: string, tickerIds: string[]): Promise<TickerReportStatusRow[]> {
  if (tickerIds.length === 0) return [];

  return prisma.$queryRaw<TickerReportStatusRow[]>`
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
      t.moved_exchange AS "movedExchange",
      t.moved_symbol AS "movedSymbol",
      t.is_deleted AS "isDeleted",

      -- Factor counts for the five scored categories
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

      -- Management team report present?
      NOT EXISTS (
        SELECT 1 FROM ticker_v1_management_team_reports mt
        WHERE mt.ticker_id = t.id AND mt.space_id = t.space_id
      ) AS "isMissingManagementTeamReport",

      -- Stability report present?
      NOT EXISTS (
        SELECT 1 FROM ticker_v1_stability_reports st
        WHERE st.ticker_id = t.id AND st.space_id = t.space_id
      ) AS "isMissingStabilityReport",

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

    FROM
      tickers_v1 t
    LEFT JOIN
      ticker_v1_analysis_category_factor_results fr ON t.id = fr.ticker_id
    LEFT JOIN
      ticker_v1_stock_analyzer_scrapper_info sasi ON t.id = sasi.ticker_id
    WHERE
      t.space_id = ${spaceId}
      AND t.id = ANY(${tickerIds}::text[])
    GROUP BY
      t.id, sasi.ticker_id, sasi.summary
  `;
}

/**
 * Gets missing reports for a specific ticker
 */
export async function getMissingReportsForTicker(spaceId: string, tickerId: string): Promise<TickerWithMissingReportInfo | null> {
  const rows = await getReportStatusForTickerIds(spaceId, [tickerId]);
  // The declared type carries the `industry` / `subIndustry` relations, but
  // every caller spreads this over its own Prisma ticker record, which is
  // where those actually come from — hence the widening cast.
  return rows.length > 0 ? (rows[0] as unknown as TickerWithMissingReportInfo) : null;
}
