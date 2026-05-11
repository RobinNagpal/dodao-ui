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
  'final-conclusion': (title, padded) => ({
    pageTitle: 'Final Conclusion',
    description: `Forward-looking conclusion for HTS Chapter ${padded} (${title}) — what the latest tariff actions mean for sourcing, pricing, and strategic positioning.`,
  }),
  'tariff-engineering': (title, padded) => ({
    pageTitle: 'Tariff Engineering',
    description: `Tariff engineering strategies for HTS Chapter ${padded} (${title}) — classification levers, country-of-origin moves, first-sale valuation, FTZ usage, and duty drawback to lawfully reduce US duty exposure.`,
  }),
};

export function getChapterSectionCopy(sectionSlug: string, chapter: ChapterRouteInfo): ChapterSectionCopy | undefined {
  const padded = chapter.number.toString().padStart(2, '0');
  return SECTION_COPY[sectionSlug]?.(chapter.title, padded);
}
