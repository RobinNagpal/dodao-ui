// Definitions of every section step in the chapter-report generation pipeline.
// The admin UI iterates this list to render per-row status pills, the per-section
// "Gen" buttons, and the "Generate all" sequence; the listing API uses the same
// `field` keys to compute per-field populated/empty status. Order matches the
// full chapter generation flow — headings first, every other section, SEO last.
//
// Dependency graph (`requires`) — a section's generator reads these sections and
// THROWS ("<X> not found") if any is missing, so they must be generated first:
//   industryAreas (headings)  → (none)
//   understandIndustry        → industryAreas
//   tariffUpdates             → industryAreas
//   industryAreasSections     → industryAreas
//   executiveSummary          → industryAreas, tariffUpdates
//   introduction (cover)      → industryAreas, tariffUpdates, executiveSummary
//   conclusion                → industryAreas, tariffUpdates
//   tariffEngineering         → industryAreas   (uses tariffUpdates if present, not required)
//   seoDetails                → (none hard; summarizes every section — run last)

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
  // Sections whose content must already exist before this one can generate.
  // The generator throws "<X> not found" otherwise. Drives the admin UI's
  // per-section button disabling + the dependency legend.
  requires: readonly ChapterReportField[];
}

export const CHAPTER_GENERATE_STEPS: readonly ChapterGenerateStep[] = [
  { field: 'industryAreas', label: 'industryAreas', apiPath: 'generate-headings', requires: [] },
  { field: 'understandIndustry', label: 'understandIndustry', apiPath: 'generate-understand-industry', requires: ['industryAreas'] },
  { field: 'tariffUpdates', label: 'tariffUpdates', apiPath: 'generate-tariff-updates', requires: ['industryAreas'] },
  { field: 'industryAreasSections', label: 'industryAreasSections', apiPath: 'generate-industry-areas', requires: ['industryAreas'] },
  { field: 'executiveSummary', label: 'executiveSummary', apiPath: 'generate-executive-summary', requires: ['industryAreas', 'tariffUpdates'] },
  { field: 'introduction', label: 'introduction', apiPath: 'generate-report-cover', requires: ['industryAreas', 'tariffUpdates', 'executiveSummary'] },
  { field: 'conclusion', label: 'conclusion', apiPath: 'generate-final-conclusion', requires: ['industryAreas', 'tariffUpdates'] },
  { field: 'tariffEngineering', label: 'tariffEngineering', apiPath: 'generate-tariff-engineering', requires: ['industryAreas'] },
  { field: 'seoDetails', label: 'seoDetails', apiPath: 'generate-seo-info', requires: [] },
] as const;
