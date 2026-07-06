/**
 * Commodities report-type domain model.
 *
 * A commodity (crude oil, gold, wheat…) is analyzed on its own, mirroring the
 * ETF report shape: 4 scored categories + a non-scored Key Facts section + a
 * Final Summary. The DB stores `category_key` as plain TEXT (no enum) so the
 * four category values can evolve without a migration — this enum is the
 * source of truth for the valid values.
 */
import { z } from 'zod';

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

/**
 * Zod schemas for each commodity report's LLM output. These are the single
 * source of truth for both the runtime structured-output contract (passed to the
 * shared `getLlmResponse`, like the tariff scripts) and the TS response types
 * below (via `z.infer`). Descriptions double as guidance for the model.
 */

/** One factor verdict returned by the category-analysis LLM call. */
export const CommodityFactorAnalysisSchema = z.object({
  factorKey: z.string().describe('Must match the factorKey from the input factors array.'),
  oneLineExplanation: z.string().describe('1–2 sentence quick takeaway for this factor.'),
  detailedExplanation: z.string().describe('1–2 paragraphs of investor-focused analysis justifying the Pass/Fail result; be honest about risks.'),
  result: z.enum(['Pass', 'Fail']).describe('Final judgment for this factor. Be conservative; a Fail must be justified in the detailedExplanation.'),
});
export type CommodityFactorAnalysisResult = z.infer<typeof CommodityFactorAnalysisSchema>;

export const CommodityCategoryAnalysisSchema = z.object({
  overallSummary: z
    .string()
    .describe('3–5 sentence takeaway for a retail investor: key strengths/weaknesses, ending with a clear stance (positive, negative, or mixed).'),
  overallAnalysisDetails: z.string().describe('3–4 markdown paragraphs discussing the category in detail for this specific commodity.'),
  factors: z.array(CommodityFactorAnalysisSchema).describe('One entry per input factor.'),
});
export type CommodityCategoryAnalysisResponse = z.infer<typeof CommodityCategoryAnalysisSchema>;

/** One green/red flag assessed for a specific commodity. */
export const CommodityKeyFactsFlagSchema = z.object({
  flag: z.string().describe('4-8 word plain-English headline.'),
  explanation: z.string().describe('About two sentences explaining the signal.'),
  result: z.enum(['Pass', 'Fail']).describe('Pass when the signal is currently present for this commodity, else Fail.'),
});
export type CommodityKeyFactsFlag = z.infer<typeof CommodityKeyFactsFlagSchema>;

export const CommodityKeyFactsProducerSchema = z.object({
  country: z.string(),
  share: z.string().optional().describe('Approximate share of global production, e.g. "~13%". Optional.'),
});
export type CommodityKeyFactsProducer = z.infer<typeof CommodityKeyFactsProducerSchema>;

export const CommodityKeyFactsWayToInvestSchema = z.object({
  type: z.string().describe('e.g. ETF, Futures, Physical, Equities.'),
  name: z.string().describe('A representative instrument, e.g. an ETF ticker.'),
  note: z.string().optional().describe('Optional short note.'),
});
export type CommodityKeyFactsWayToInvest = z.infer<typeof CommodityKeyFactsWayToInvestSchema>;

export const CommodityKeyFactsSchema = z.object({
  keyFacts: z
    .string()
    .describe(
      'Exactly TWO plain-prose paragraphs (separated by a blank line): what the commodity is, how it is priced/traded, what a retail investor most needs to know.'
    ),
  greenFlags: z.array(CommodityKeyFactsFlagSchema).describe('2-4 positive, non-obvious signals for this commodity right now.'),
  redFlags: z.array(CommodityKeyFactsFlagSchema).describe('2-4 genuine risks/negatives for this commodity right now.'),
  mainUses: z.array(z.string()).describe('Main real-world uses of the commodity.'),
  topProducers: z.array(CommodityKeyFactsProducerSchema).describe('Largest producing countries.'),
  waysToInvest: z.array(CommodityKeyFactsWayToInvestSchema).describe('Main ways a retail investor gets exposure.'),
});
export type CommodityKeyFactsResponse = z.infer<typeof CommodityKeyFactsSchema>;

export const CommodityFinalSummarySchema = z.object({
  summary: z
    .string()
    .describe(
      '6–7 short lines. First line gives the overall stance (Positive, Negative, or Mixed); the rest synthesize the four scored sections and say who the commodity suits.'
    ),
});
export type CommodityFinalSummaryResponse = z.infer<typeof CommodityFinalSummarySchema>;

/** The Zod output schema for a given report type — passed straight to `getLlmResponse`. */
export function getCommodityOutputSchema(reportType: CommodityReportType): z.ZodObject<any> {
  switch (reportType) {
    case CommodityReportType.KEY_FACTS:
      return CommodityKeyFactsSchema;
    case CommodityReportType.FINAL_SUMMARY:
      return CommodityFinalSummarySchema;
    default:
      return CommodityCategoryAnalysisSchema;
  }
}
