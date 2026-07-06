import commoditiesRaw from '@/commodity-data/commodities.json';
import { CommodityAnalysisCategory, CommodityBasicInfo, CommodityKeyFacts, CommodityReportJson } from '@/types/commodity/commodity-analysis-types';
import { COMMODITY_REPORTS } from '@/utils/commodity-analysis-reports/commodity-reports-registry';

/**
 * Static-JSON data access for commodities. Replaces the old prisma-backed
 * queries: the commodity universe lives in `commodity-data/commodities.json` and
 * each report lives in `commodity-data/reports/<slug>.json` (registered in
 * `commodity-reports-registry.ts`). The API routes read through these helpers so
 * the report pages keep fetching via `/api/...` exactly as before.
 */

/** One factor verdict as consumed by the report components. */
export interface CommodityAllDataFactorResult {
  factorKey: string;
  oneLineExplanation: string;
  detailedExplanation: string;
  result: 'Pass' | 'Fail';
}

/** One scored category as consumed by the report components. */
export interface CommodityAllDataCategoryResult {
  categoryKey: CommodityAnalysisCategory;
  summary: string;
  overallAnalysisDetails: string;
  createdAt: Date;
  updatedAt: Date;
  factorResults: CommodityAllDataFactorResult[];
}

/**
 * Full report payload consumed by the main + sub-report pages. Mirrors the old
 * prisma `include` shape (`keyFactsReport` + `categoryAnalysisResults` with
 * `factorResults`) so the UI components did not have to change — only the source
 * of the data did (static JSON instead of the database).
 */
export interface CommodityWithAllData {
  slug: string;
  name: string;
  commodityGroup: string;
  priceSymbol: string | null;
  exchange: string | null;
  unit: string | null;
  currency: string;
  summary: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  keyFactsReport: CommodityKeyFacts | null;
  categoryAnalysisResults: CommodityAllDataCategoryResult[];
}

const ALL_COMMODITIES = commoditiesRaw as CommodityBasicInfo[];

/** Every commodity in the universe, ordered by group then name. */
export function getAllCommodityBasicInfo(): CommodityBasicInfo[] {
  return [...ALL_COMMODITIES].sort((a, b) => a.commodityGroup.localeCompare(b.commodityGroup) || a.name.localeCompare(b.name));
}

/** Basic descriptive fields for one commodity, or null when the slug is unknown. */
export function getCommodityBasicInfo(slug: string): CommodityBasicInfo | null {
  return ALL_COMMODITIES.find((c) => c.slug === slug) ?? null;
}

/** The authored report JSON for a slug, or null when none has been published. */
export function getCommodityReportJson(slug: string): CommodityReportJson | null {
  return COMMODITY_REPORTS[slug] ?? null;
}

/**
 * A commodity's final score = the number of Pass factors across its scored
 * categories (max 20 = 4 categories × 5 factors). Returns null when there is no
 * report yet, so the listing/similar cards can render a neutral placeholder.
 */
export function computeCommodityFinalScore(report: CommodityReportJson | null): number | null {
  if (!report || report.categories.length === 0) return null;
  return report.categories.reduce((sum, category) => sum + category.factors.filter((f) => f.result === 'Pass').length, 0);
}

/**
 * Combine a commodity's basic info with its authored report into the shape the
 * report components expect. Category `createdAt`/`updatedAt` reuse the report's
 * top-level `updatedAt`, so downstream date handling stays unchanged.
 *
 * Returns null only when the slug is unknown (→ 404). A known commodity that has
 * no published report yet still returns a shell (null summary/key facts, empty
 * categories) so its page renders the same "not generated yet" placeholders it
 * did before — the listing links to every commodity, generated or not.
 */
export function getCommodityWithAllData(slug: string): CommodityWithAllData | null {
  const basic = getCommodityBasicInfo(slug);
  if (!basic) return null;
  const report = getCommodityReportJson(slug);

  const updatedAt = report ? new Date(report.updatedAt) : new Date();

  return {
    slug: basic.slug,
    name: basic.name,
    commodityGroup: basic.commodityGroup,
    priceSymbol: basic.priceSymbol ?? null,
    exchange: basic.exchange ?? null,
    unit: basic.unit ?? null,
    currency: basic.currency,
    summary: report?.summary ?? null,
    metaDescription: report?.metaDescription ?? null,
    createdAt: updatedAt,
    updatedAt,
    keyFactsReport: report?.keyFacts ?? null,
    categoryAnalysisResults: (report?.categories ?? []).map((category) => ({
      categoryKey: category.categoryKey,
      summary: category.summary,
      overallAnalysisDetails: category.overallAnalysisDetails,
      createdAt: updatedAt,
      updatedAt,
      factorResults: category.factors.map((factor) => ({
        factorKey: factor.factorKey,
        oneLineExplanation: factor.oneLineExplanation,
        detailedExplanation: factor.detailedExplanation,
        result: factor.result,
      })),
    })),
  };
}
