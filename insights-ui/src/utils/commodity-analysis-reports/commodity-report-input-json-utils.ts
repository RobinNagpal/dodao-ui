import {
  CommodityAnalysisCategory,
  CommodityCategoryFactorsConfig,
  CommodityReportType,
  COMMODITY_CATEGORY_NAMES,
  COMMODITY_REPORT_TYPE_TO_CATEGORY,
} from '@/types/commodity/commodity-analysis-types';
import { getCommodityCategoryConfig } from '@/utils/commodity-analysis-reports/commodity-analysis-factor-utils';
import { CommodityWithAllData } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';

/**
 * Builds the input JSON sent to the LLM for a given commodity report step.
 *
 * Commodities carry very little structured data (no balance sheet / income
 * statement), so the input is just the basic descriptive fields plus, for the
 * scored categories, the flat factor list the model must assess. The final
 * summary additionally receives the four category summaries + scores that were
 * generated earlier in the run.
 */

function baseCommodityInput(commodity: CommodityWithAllData): Record<string, unknown> {
  return {
    name: commodity.name,
    slug: commodity.slug,
    commodityGroup: commodity.commodityGroup,
    priceSymbol: commodity.priceSymbol,
    exchange: commodity.exchange,
    unit: commodity.unit,
    currency: commodity.currency,
  };
}

function categoryInput(commodity: CommodityWithAllData, categoryKey: CommodityAnalysisCategory): Record<string, unknown> {
  const config: CommodityCategoryFactorsConfig = getCommodityCategoryConfig(categoryKey);
  return {
    ...baseCommodityInput(commodity),
    categoryName: config.categoryName,
    categoryDescription: config.categoryDescription,
    factors: config.factors.map((f) => ({
      factorKey: f.factorKey,
      factorTitle: f.factorTitle,
      factorDescription: f.factorDescription,
      factorMetrics: f.factorMetrics ?? null,
    })),
  };
}

function finalSummaryInput(commodity: CommodityWithAllData): Record<string, unknown> {
  const cached = commodity.cachedScore;
  const scoreByCategory: Record<CommodityAnalysisCategory, number | null> = {
    [CommodityAnalysisCategory.SupplyAndDemand]: cached?.supplyAndDemandScore ?? null,
    [CommodityAnalysisCategory.PriceAndValue]: cached?.priceAndValueScore ?? null,
    [CommodityAnalysisCategory.VolatilityAndRisk]: cached?.volatilityAndRiskScore ?? null,
    [CommodityAnalysisCategory.FutureOutlook]: cached?.futureOutlookScore ?? null,
  };

  const categorySummaries = commodity.categoryAnalysisResults.map((result) => ({
    categoryName: COMMODITY_CATEGORY_NAMES[result.categoryKey as CommodityAnalysisCategory] ?? result.categoryKey,
    summary: result.summary,
    score: scoreByCategory[result.categoryKey as CommodityAnalysisCategory] ?? result.factorResults.filter((fr) => fr.result === 'Pass').length,
    total: result.factorResults.length,
  }));

  return {
    ...baseCommodityInput(commodity),
    categorySummaries,
  };
}

export function prepareCommodityInputJson(commodity: CommodityWithAllData, reportType: CommodityReportType): Record<string, unknown> {
  if (reportType === CommodityReportType.KEY_FACTS) {
    return baseCommodityInput(commodity);
  }
  if (reportType === CommodityReportType.FINAL_SUMMARY) {
    return finalSummaryInput(commodity);
  }
  const categoryKey = COMMODITY_REPORT_TYPE_TO_CATEGORY[reportType];
  if (!categoryKey) {
    throw new Error(`No category mapping for commodity report type ${reportType}`);
  }
  return categoryInput(commodity, categoryKey);
}
