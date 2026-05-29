import fs from 'fs';
import path from 'path';
import { ETF_PROMPT_KEYS, EtfReportType } from '@/types/etf/etf-analysis-types';

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

/**
 * Display-side counterpart of {@link resolveEtfPromptTemplate}: given a prompt
 * `key` (e.g. `US/etfs/key-facts`), return the template that is actually sent at
 * runtime — the file-backed markdown for the five file-backed ETF prompts, or
 * `dbTemplate` unchanged for everything else. Used so invocation views show the
 * real template instead of the stale DB copy. Falls back to `dbTemplate` if the
 * key is unknown or the file cannot be read, so viewing never errors.
 */
export function resolveEtfPromptTemplateByKey(promptKey: string, dbTemplate: string): string {
  const entry = (Object.entries(ETF_PROMPT_KEYS) as Array<[EtfReportType, string]>).find(([, key]) => key === promptKey);
  if (!entry) return dbTemplate;
  try {
    return resolveEtfPromptTemplate(entry[0], dbTemplate);
  } catch {
    return dbTemplate;
  }
}

/**
 * ETF report types whose LLM output schema is overridden in code (rather than the
 * DB `Prompt.outputSchema`). The Future Performance Outlook report shares the
 * common category-analysis schema but additionally returns expected forward
 * returns, so it points at its own schema file. Paths are relative to `schemas/`.
 */
const FILE_BACKED_ETF_OUTPUT_SCHEMAS: Partial<Record<EtfReportType, string>> = {
  [EtfReportType.FUTURE_PERFORMANCE_OUTLOOK]: 'etf-analysis/outputs/future-performance-outlook-output.schema.yaml',
};

/**
 * Resolve the output-schema filename for an ETF report type, preferring the
 * code-defined override and falling back to the DB-configured `dbSchemaName`.
 */
export function resolveEtfOutputSchema(reportType: EtfReportType, dbSchemaName: string): string {
  return FILE_BACKED_ETF_OUTPUT_SCHEMAS[reportType] ?? dbSchemaName;
}
