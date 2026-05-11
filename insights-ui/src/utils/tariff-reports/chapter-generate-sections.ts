// Definitions of every section step in the chapter-report generation pipeline.
// The admin UI iterates this list to render per-row status pills and to fire the
// "Generate all" sequence; the listing API uses the same `field` keys to compute
// per-field populated/empty status. Order matches `run-tariff-report.ts`'s ALL
// flow — headings first, every other section, SEO last.

// JSONB column names on `tariff_chapter_reports` that store each section.
export type ChapterReportField =
  | 'industryAreas'
  | 'introduction'
  | 'executiveSummary'
  | 'tariffUpdates'
  | 'understandIndustry'
  | 'industryAreasSections'
  | 'conclusion'
  | 'tariffEngineering'
  | 'seoDetails';

export interface ChapterGenerateStep {
  // JSONB column on `tariff_chapter_reports` that this step populates.
  field: ChapterReportField;
  // Human-readable label used for column headers / progress UI.
  label: string;
  // Path segment under `/api/industry-tariff-reports/chapters/<slug>/`.
  apiPath: string;
}

export const CHAPTER_GENERATE_STEPS: readonly ChapterGenerateStep[] = [
  { field: 'industryAreas', label: 'industryAreas', apiPath: 'generate-headings' },
  { field: 'understandIndustry', label: 'understandIndustry', apiPath: 'generate-understand-industry' },
  { field: 'tariffUpdates', label: 'tariffUpdates', apiPath: 'generate-tariff-updates' },
  { field: 'industryAreasSections', label: 'industryAreasSections', apiPath: 'generate-industry-areas' },
  { field: 'executiveSummary', label: 'executiveSummary', apiPath: 'generate-executive-summary' },
  { field: 'introduction', label: 'introduction', apiPath: 'generate-report-cover' },
  { field: 'conclusion', label: 'conclusion', apiPath: 'generate-final-conclusion' },
  { field: 'tariffEngineering', label: 'tariffEngineering', apiPath: 'generate-tariff-engineering' },
  { field: 'seoDetails', label: 'seoDetails', apiPath: 'generate-seo-info' },
] as const;
