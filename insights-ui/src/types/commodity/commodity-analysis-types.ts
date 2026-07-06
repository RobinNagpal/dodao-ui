/**
 * Commodities report-type domain model.
 *
 * A commodity (crude oil, gold, wheat…) is analyzed on its own, mirroring the
 * ETF report shape: 4 scored categories + a non-scored Key Facts section + a
 * Final Summary. The DB stores `category_key` as plain TEXT (no enum) so the
 * four category values can evolve without a migration — this enum is the
 * source of truth for the valid values.
 */

/** The four scored analysis categories. Values match the `category_key` TEXT column. */
export enum CommodityAnalysisCategory {
  SupplyAndDemand = 'SupplyAndDemand',
  PriceAndValue = 'PriceAndValue',
  VolatilityAndRisk = 'VolatilityAndRisk',
  FutureOutlook = 'FutureOutlook',
}

/**
 * Every generatable report step. The four scored categories each produce a
 * `CommodityCategoryAnalysisResult` + factor rows; KEY_FACTS and FINAL_SUMMARY
 * are stored on their own tables/columns.
 */
export enum CommodityReportType {
  SUPPLY_AND_DEMAND = 'supply-and-demand',
  PRICE_AND_VALUE = 'price-and-value',
  VOLATILITY_AND_RISK = 'volatility-and-risk',
  FUTURE_OUTLOOK = 'future-outlook',
  KEY_FACTS = 'key-facts',
  FINAL_SUMMARY = 'final-summary',
}

/**
 * Maps a scored report step to its category key. KEY_FACTS / FINAL_SUMMARY are
 * NOT category analyses and are intentionally excluded — callers must handle
 * them before consulting this map.
 */
export const COMMODITY_REPORT_TYPE_TO_CATEGORY: Partial<Record<CommodityReportType, CommodityAnalysisCategory>> = {
  [CommodityReportType.SUPPLY_AND_DEMAND]: CommodityAnalysisCategory.SupplyAndDemand,
  [CommodityReportType.PRICE_AND_VALUE]: CommodityAnalysisCategory.PriceAndValue,
  [CommodityReportType.VOLATILITY_AND_RISK]: CommodityAnalysisCategory.VolatilityAndRisk,
  [CommodityReportType.FUTURE_OUTLOOK]: CommodityAnalysisCategory.FutureOutlook,
};

/** URL slug for each scored category subpage under `/commodities/[slug]/`. */
export const COMMODITY_CATEGORY_TO_PATH: Record<CommodityAnalysisCategory, string> = {
  [CommodityAnalysisCategory.SupplyAndDemand]: 'supply-and-demand',
  [CommodityAnalysisCategory.PriceAndValue]: 'price-and-value',
  [CommodityAnalysisCategory.VolatilityAndRisk]: 'volatility-and-risk',
  [CommodityAnalysisCategory.FutureOutlook]: 'future-outlook',
};

/** Human-readable category names, used by the radar chart and section headings. */
export const COMMODITY_CATEGORY_NAMES: Record<CommodityAnalysisCategory, string> = {
  [CommodityAnalysisCategory.SupplyAndDemand]: 'Supply & Demand',
  [CommodityAnalysisCategory.PriceAndValue]: 'Price & Value',
  [CommodityAnalysisCategory.VolatilityAndRisk]: 'Volatility & Risk',
  [CommodityAnalysisCategory.FutureOutlook]: 'Future Outlook',
};

/**
 * Prompt keys tracked in the `Prompt` / `PromptInvocation` tables. The template
 * text itself is file-backed (see `commodity-prompts/`), but every invocation is
 * still recorded against these keys so it shows up in the prompt-invocation
 * tooling alongside the stock/ETF ones.
 */
export const COMMODITY_PROMPT_KEYS: Record<CommodityReportType, string> = {
  [CommodityReportType.SUPPLY_AND_DEMAND]: 'US/commodities/supply-and-demand',
  [CommodityReportType.PRICE_AND_VALUE]: 'US/commodities/price-and-value',
  [CommodityReportType.VOLATILITY_AND_RISK]: 'US/commodities/volatility-and-risk',
  [CommodityReportType.FUTURE_OUTLOOK]: 'US/commodities/future-outlook',
  [CommodityReportType.KEY_FACTS]: 'US/commodities/key-facts',
  [CommodityReportType.FINAL_SUMMARY]: 'US/commodities/final-summary',
};

/** A single analysis factor definition (flat — commodities have no group logic). */
export interface CommodityFactorDefinition {
  factorKey: string;
  factorTitle: string;
  factorDescription: string;
  factorMetrics?: string;
}

export interface CommodityCategoryFactorsConfig {
  categoryKey: CommodityAnalysisCategory;
  categoryName: string;
  categoryDescription: string;
  factors: CommodityFactorDefinition[];
}

/** One factor verdict returned by the category-analysis LLM call. */
export interface CommodityFactorAnalysisResult {
  factorKey: string;
  oneLineExplanation: string;
  detailedExplanation: string;
  result: 'Pass' | 'Fail';
}

export interface CommodityCategoryAnalysisResponse {
  overallSummary: string;
  overallAnalysisDetails: string;
  factors: CommodityFactorAnalysisResult[];
}

/** One green/red flag assessed for a specific commodity. */
export interface CommodityKeyFactsFlag {
  flag: string;
  explanation: string;
  result: 'Pass' | 'Fail';
}

export interface CommodityKeyFactsProducer {
  country: string;
  share?: string;
}

export interface CommodityKeyFactsWayToInvest {
  type: string;
  name: string;
  note?: string;
}

export interface CommodityKeyFactsResponse {
  keyFacts: string;
  greenFlags: CommodityKeyFactsFlag[];
  redFlags: CommodityKeyFactsFlag[];
  mainUses: string[];
  topProducers: CommodityKeyFactsProducer[];
  waysToInvest: CommodityKeyFactsWayToInvest[];
}

export interface CommodityFinalSummaryResponse {
  summary: string;
}
