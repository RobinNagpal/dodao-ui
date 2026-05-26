import fs from 'fs';
import path from 'path';
import { EtfReportType } from '@/types/etf/etf-analysis-types';

/**
 * The ETF analysis prompts whose template text is sourced from the
 * version-controlled markdown files in `insights-ui/etf-prompts/` instead of the
 * DB `Prompt.promptTemplate`. Every other prompt (competition, final-summary,
 * and everything outside ETFs) keeps using its DB template.
 *
 * Filenames are read at request time relative to `process.cwd()` — the same
 * runtime-file pattern used for `schemas/` and `blogs/`, so they ship with the
 * Next app. Files in `docs/` at the repo root are NOT deployed with the app and
 * must not be relied on at runtime.
 */
const FILE_BACKED_ETF_PROMPT_FILES: Partial<Record<EtfReportType, string>> = {
  [EtfReportType.PERFORMANCE_AND_RETURNS]: 'past-returns.md',
  [EtfReportType.COST_EFFICIENCY_AND_TEAM]: 'cost-efficiency-team.md',
  [EtfReportType.RISK_ANALYSIS]: 'risk-analysis.md',
  [EtfReportType.FUTURE_PERFORMANCE_OUTLOOK]: 'future-performance-outlook.md',
  [EtfReportType.KEY_FACTS]: 'key-facts.md',
};

/**
 * Resolve the prompt template for an ETF report type. For the five file-backed
 * report types it returns the markdown read from `insights-ui/etf-prompts/`; for
 * every other type it returns `dbTemplate` unchanged so the rest of the pipeline
 * behaves exactly as before.
 */
export function resolveEtfPromptTemplate(reportType: EtfReportType, dbTemplate: string): string {
  const fileName = FILE_BACKED_ETF_PROMPT_FILES[reportType];
  if (!fileName) return dbTemplate;
  const filePath = path.join(process.cwd(), 'etf-prompts', fileName);
  return fs.readFileSync(filePath, 'utf8');
}
