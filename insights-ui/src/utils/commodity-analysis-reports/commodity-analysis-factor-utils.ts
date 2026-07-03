import { CommodityAnalysisCategory, CommodityCategoryFactorsConfig, CommodityFactorDefinition } from '@/types/commodity/commodity-analysis-types';
import supplyAndDemandRaw from '@/commodity-analysis/commodity-analysis-factors-supply-and-demand.json';
import priceAndValueRaw from '@/commodity-analysis/commodity-analysis-factors-price-and-value.json';
import volatilityAndRiskRaw from '@/commodity-analysis/commodity-analysis-factors-volatility-and-risk.json';
import futureOutlookRaw from '@/commodity-analysis/commodity-analysis-factors-future-outlook.json';

/**
 * Category/factor resolution for commodities. Unlike ETFs (which pick factors by
 * fund group), commodities use a flat factor list per category — every commodity
 * in a category is assessed on the same factors. Kept free of Node-only imports
 * so it can be bundled for the browser (report components import
 * `findCommodityFactorDefinition` from here).
 */

const CATEGORY_CONFIGS: Record<CommodityAnalysisCategory, CommodityCategoryFactorsConfig> = {
  [CommodityAnalysisCategory.SupplyAndDemand]: supplyAndDemandRaw as CommodityCategoryFactorsConfig,
  [CommodityAnalysisCategory.PriceAndValue]: priceAndValueRaw as CommodityCategoryFactorsConfig,
  [CommodityAnalysisCategory.VolatilityAndRisk]: volatilityAndRiskRaw as CommodityCategoryFactorsConfig,
  [CommodityAnalysisCategory.FutureOutlook]: futureOutlookRaw as CommodityCategoryFactorsConfig,
};

export function getCommodityCategoryConfig(categoryKey: CommodityAnalysisCategory): CommodityCategoryFactorsConfig {
  return CATEGORY_CONFIGS[categoryKey];
}

export function getCommodityFactorsForCategory(categoryKey: CommodityAnalysisCategory): CommodityFactorDefinition[] {
  return CATEGORY_CONFIGS[categoryKey].factors;
}

/**
 * Find a factor definition by key for a category. Falls back to a
 * case-insensitive title match, since the LLM occasionally returns the factor's
 * title in the `factorKey` slot instead of the snake_case key — without this the
 * factor would be silently dropped on save.
 */
export function findCommodityFactorDefinition(categoryKey: CommodityAnalysisCategory, factorKey: string): CommodityFactorDefinition | undefined {
  const config = CATEGORY_CONFIGS[categoryKey];
  const byKey = config.factors.find((f) => f.factorKey === factorKey);
  if (byKey) return byKey;
  const normalized = factorKey.trim().toLowerCase();
  return config.factors.find((f) => f.factorTitle.trim().toLowerCase() === normalized);
}

export function getCommodityFactorTitle(categoryKey: CommodityAnalysisCategory, factorKey: string): string {
  return findCommodityFactorDefinition(categoryKey, factorKey)?.factorTitle || factorKey;
}
