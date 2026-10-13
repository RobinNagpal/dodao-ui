export interface ChapterReportSection {
  slug: string;
  label: string;
}

export const CHAPTER_REPORT_SECTIONS: readonly ChapterReportSection[] = [
  { slug: 'tariff-updates', label: 'Tariff Updates' },
  { slug: 'understand-industry', label: 'Understand Industry' },
  { slug: 'industry-areas', label: 'Industry Areas' },
  { slug: 'tariff-engineering', label: 'Tariff Engineering' },
  { slug: 'final-conclusion', label: 'Final Conclusion' },
] as const;

export interface ChapterExportSection extends ChapterReportSection {
  /** Path under the chapter's export URL ('' = the export overview). */
  path: string;
}

// Export half of a chapter report (only for chapters with export content — see chapter-exports.ts).
// The pages live under their own URL tree, /industry-tariff-report/exports/chapters/<slug>/<path>, so
// "exports" sits up front in every export URL. `slug` is the page's id inside the app (tabs, glossary,
// FAQ links, the content files' `page.slug`); it keeps the "exports" prefix so it never collides with
// an import section slug. The labels skip "Export" because the Import | Export switch beside the tabs
// already says which side is open.
export const CHAPTER_EXPORT_SECTIONS: readonly ChapterExportSection[] = [
  { slug: 'exports', path: '', label: 'Overview' },
  { slug: 'exports/tariff-updates', path: 'tariff-updates', label: 'Tariff updates' },
  { slug: 'exports/markets', path: 'markets', label: 'Markets' },
  { slug: 'exports/rules', path: 'rules', label: 'Export rules' },
  { slug: 'exports/faq', path: 'faq', label: 'FAQ' },
] as const;

// Approach-2 chapters (issue #1770) name each page after what it holds, so the tab, the page H1,
// the footer badge and the in-page links all use the same words. Same slugs as the DB-backed
// chapters; only the labels differ ("Industry Areas" there is a sub-area essay, here a rate matrix).
const APPROACH2_SECTION_LABELS: Record<string, string> = {
  overview: 'Tariff rates',
  'tariff-updates': 'Tariff updates',
  'understand-industry': 'Import statistics',
  'industry-areas': 'Rates by country',
  'tariff-engineering': 'Duty-saving rules',
  'final-conclusion': 'FAQ',
};

/** Label for an Approach-2 page ('overview' for the chapter cover, otherwise a section slug, import or export). */
export function approach2SectionLabel(slug: string): string {
  return APPROACH2_SECTION_LABELS[slug] ?? CHAPTER_EXPORT_SECTIONS.find((s) => s.slug === slug)?.label ?? slug;
}

export type ChapterReportDirection = 'import' | 'export';

export interface ChapterRouteInfo {
  number: number;
  title: string;
  slug: string;
}

export function chapterCoverHref(slug: string): string {
  return `/industry-tariff-report/chapters/${slug}`;
}

export function chapterSectionHref(slug: string, sectionSlug: string): string {
  return `${chapterCoverHref(slug)}/${sectionSlug}`;
}

/** URL of an export page: `exportSlug` is a CHAPTER_EXPORT_SECTIONS slug ('exports' = the export overview). */
export function chapterExportHref(slug: string, exportSlug = 'exports'): string {
  const section = CHAPTER_EXPORT_SECTIONS.find((s) => s.slug === exportSlug);
  if (!section) throw new Error(`unknown export page "${exportSlug}"`);
  const base = `/industry-tariff-report/exports/chapters/${slug}`;
  return section.path ? `${base}/${section.path}` : base;
}

/** URL of any page of a chapter report: '' / 'overview' = the cover, an import section slug, or an export page slug. */
export function chapterPageHref(slug: string, pageSlug: string): string {
  if (!pageSlug || pageSlug === 'overview') return chapterCoverHref(slug);
  if (CHAPTER_EXPORT_SECTIONS.some((s) => s.slug === pageSlug)) return chapterExportHref(slug, pageSlug);
  return chapterSectionHref(slug, pageSlug);
}

// Per-section copy used for page H1, meta description, and the placeholder body. Kept here so the
// six chapter route files stay thin and the wording lives in one place.
interface ChapterSectionCopy {
  pageTitle: string;
  description: string;
}

const SECTION_COPY: Record<string, (title: string, padded: string) => ChapterSectionCopy> = {
  'tariff-updates': (title, padded) => ({
    pageTitle: 'Tariff Updates',
    description: `Recent tariff updates affecting HTS Chapter ${padded} (${title}) — rate changes, effective dates, exclusions, and policy actions impacting goods classified under this chapter.`,
  }),
  'understand-industry': (title, padded) => ({
    pageTitle: 'Understand the Industry',
    description: `Background on the industry structure behind HTS Chapter ${padded} (${title}) — supply chains, established players, challengers, and the economics that drive tariff impact.`,
  }),
  'industry-areas': (title, padded) => ({
    pageTitle: 'Industry Areas',
    description: `Sub-areas of HTS Chapter ${padded} (${title}) — segment-level tariff exposure across the product groupings inside this chapter.`,
  }),
  'tariff-engineering': (title, padded) => ({
    pageTitle: 'Tariff Engineering',
    description: `Tariff engineering strategies for HTS Chapter ${padded} (${title}) — classification levers, country-of-origin moves, first-sale valuation, FTZ usage, and duty drawback to lawfully reduce US duty exposure.`,
  }),
  'final-conclusion': (title, padded) => ({
    pageTitle: 'Final Conclusion',
    description: `Forward-looking conclusion for HTS Chapter ${padded} (${title}) — what the latest tariff actions mean for sourcing, pricing, and strategic positioning.`,
  }),
};

export function getChapterSectionCopy(sectionSlug: string, chapter: ChapterRouteInfo): ChapterSectionCopy | undefined {
  const padded = chapter.number.toString().padStart(2, '0');
  return SECTION_COPY[sectionSlug]?.(chapter.title, padded);
}

// Admin edit page for a chapter page. `pageSlug` is 'overview' for the chapter cover, otherwise a
// CHAPTER_REPORT_SECTIONS slug.
export function chapterEditHref(slug: string, pageSlug: string): string {
  return pageSlug === 'overview' ? `${chapterCoverHref(slug)}/edit` : `${chapterSectionHref(slug, pageSlug)}/edit`;
}
