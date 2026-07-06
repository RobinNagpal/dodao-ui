import fs from 'fs';
import path from 'path';
import { CommodityReportType } from '@/types/commodity/commodity-analysis-types';

/**
 * Commodity prompt templates are file-backed (version-controlled markdown under
 * `insights-ui/commodity-prompts/`), mirroring the tariff/ETF file-backed prompts.
 * Generation reads the template from disk, embeds the input, and calls the LLM
 * directly — nothing is stored in the `Prompt` / `PromptInvocation` tables. The
 * output shape is a Zod schema (see `getCommodityOutputSchema`), not a file. Files
 * are read relative to `process.cwd()` so they ship with the Next app (same
 * runtime-file pattern as `etf-prompts/`).
 */
const COMMODITY_PROMPT_FILES: Record<CommodityReportType, string> = {
  [CommodityReportType.SUPPLY_AND_DEMAND]: 'supply-and-demand.md',
  [CommodityReportType.PRICE_AND_VALUE]: 'price-and-value.md',
  [CommodityReportType.VOLATILITY_AND_RISK]: 'volatility-and-risk.md',
  [CommodityReportType.FUTURE_OUTLOOK]: 'future-outlook.md',
  [CommodityReportType.KEY_FACTS]: 'key-facts.md',
  [CommodityReportType.FINAL_SUMMARY]: 'final-summary.md',
};

export function resolveCommodityPromptTemplate(reportType: CommodityReportType): string {
  const fileName = COMMODITY_PROMPT_FILES[reportType];
  const filePath = path.join(process.cwd(), 'commodity-prompts', fileName);
  return fs.readFileSync(filePath, 'utf8');
}
