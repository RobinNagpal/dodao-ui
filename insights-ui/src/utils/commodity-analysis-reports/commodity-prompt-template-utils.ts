import fs from 'fs';
import path from 'path';
import { CommodityReportType } from '@/types/commodity/commodity-analysis-types';

/**
 * Commodity prompt templates are file-backed (version-controlled markdown under
 * `insights-ui/commodity-prompts/`), mirroring the tariff/ETF file-backed prompts.
 * Generation reads the template from disk, embeds the input, and calls the LLM
 * directly — nothing is stored in the `Prompt` / `PromptInvocation` tables. Files
 * are read relative to `process.cwd()` so they ship with the Next app (same
 * runtime-file pattern as `schemas/` and `etf-prompts/`).
 */
const COMMODITY_PROMPT_FILES: Record<CommodityReportType, string> = {
  [CommodityReportType.SUPPLY_AND_DEMAND]: 'supply-and-demand.md',
  [CommodityReportType.PRICE_AND_VALUE]: 'price-and-value.md',
  [CommodityReportType.VOLATILITY_AND_RISK]: 'volatility-and-risk.md',
  [CommodityReportType.FUTURE_OUTLOOK]: 'future-outlook.md',
  [CommodityReportType.KEY_FACTS]: 'key-facts.md',
  [CommodityReportType.FINAL_SUMMARY]: 'final-summary.md',
};

/** Input-schema path (relative to `schemas/`) for each report type. */
const COMMODITY_INPUT_SCHEMAS: Record<CommodityReportType, string> = {
  [CommodityReportType.SUPPLY_AND_DEMAND]: 'commodity-analysis/inputs/category-analysis-input.schema.yaml',
  [CommodityReportType.PRICE_AND_VALUE]: 'commodity-analysis/inputs/category-analysis-input.schema.yaml',
  [CommodityReportType.VOLATILITY_AND_RISK]: 'commodity-analysis/inputs/category-analysis-input.schema.yaml',
  [CommodityReportType.FUTURE_OUTLOOK]: 'commodity-analysis/inputs/category-analysis-input.schema.yaml',
  [CommodityReportType.KEY_FACTS]: 'commodity-analysis/inputs/key-facts-input.schema.yaml',
  [CommodityReportType.FINAL_SUMMARY]: 'commodity-analysis/inputs/final-summary-input.schema.yaml',
};

/** Output-schema path (relative to `schemas/`) for each report type. */
const COMMODITY_OUTPUT_SCHEMAS: Record<CommodityReportType, string> = {
  [CommodityReportType.SUPPLY_AND_DEMAND]: 'commodity-analysis/outputs/category-analysis-output.schema.yaml',
  [CommodityReportType.PRICE_AND_VALUE]: 'commodity-analysis/outputs/category-analysis-output.schema.yaml',
  [CommodityReportType.VOLATILITY_AND_RISK]: 'commodity-analysis/outputs/category-analysis-output.schema.yaml',
  [CommodityReportType.FUTURE_OUTLOOK]: 'commodity-analysis/outputs/category-analysis-output.schema.yaml',
  [CommodityReportType.KEY_FACTS]: 'commodity-analysis/outputs/key-facts-output.schema.yaml',
  [CommodityReportType.FINAL_SUMMARY]: 'commodity-analysis/outputs/final-summary-output.schema.yaml',
};

export function resolveCommodityPromptTemplate(reportType: CommodityReportType): string {
  const fileName = COMMODITY_PROMPT_FILES[reportType];
  const filePath = path.join(process.cwd(), 'commodity-prompts', fileName);
  return fs.readFileSync(filePath, 'utf8');
}

export function getCommodityInputSchemaPath(reportType: CommodityReportType): string {
  return COMMODITY_INPUT_SCHEMAS[reportType];
}

export function getCommodityOutputSchemaPath(reportType: CommodityReportType): string {
  return COMMODITY_OUTPUT_SCHEMAS[reportType];
}
