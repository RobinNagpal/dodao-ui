import {
  chapterUrlSlug,
  getCanonicalIndustryForChapter,
  getIndustryForPrimaryChapter,
  HTS_CHAPTERS,
  HtsChapterRef,
  parseChapterNumberFromSlug,
  TariffIndustryDefinition,
} from '@/scripts/industry-tariff-reports/tariff-industries';

export interface ChapterReportSection {
  slug: string;
  label: string;
}

export const CHAPTER_REPORT_SECTIONS: readonly ChapterReportSection[] = [
  { slug: 'tariff-updates', label: 'Tariff Updates' },
  { slug: 'understand-industry', label: 'Understand Industry' },
  { slug: 'industry-areas', label: 'Industry Areas' },
  { slug: 'final-conclusion', label: 'Final Conclusion' },
] as const;

export interface ResolvedChapterRoute {
  // Canonical chapter slug. Different from the requested slug → caller should redirect.
  canonicalSlug: string;
  chapter: HtsChapterRef;
  // Industry whose URL is the canonical home for this chapter (chapter is its primary).
  // When set, callers should redirect to the industry URL instead of rendering chapter content.
  primaryIndustry: TariffIndustryDefinition | undefined;
  // Industry that owns this chapter via htsChapters (any position). Used for context (back-links,
  // "see industry report" CTA), not for canonical URL routing.
  ownerIndustry: TariffIndustryDefinition | undefined;
}

// Parses a chapter slug from the URL and resolves it. Returns undefined for malformed slugs or
// unknown chapter numbers — caller should `notFound()` in that case.
export function resolveChapterRoute(rawSlug: string): ResolvedChapterRoute | undefined {
  const chapterNumber = parseChapterNumberFromSlug(rawSlug);
  if (chapterNumber === undefined) return undefined;
  const chapter = HTS_CHAPTERS[chapterNumber];
  if (!chapter) return undefined;
  return {
    canonicalSlug: chapterUrlSlug(chapter),
    chapter,
    primaryIndustry: getIndustryForPrimaryChapter(chapterNumber),
    ownerIndustry: getCanonicalIndustryForChapter(chapterNumber),
  };
}

export function chapterCoverHref(chapter: HtsChapterRef): string {
  return `/industry-tariff-report/chapter/${chapterUrlSlug(chapter)}`;
}

export function chapterSectionHref(chapter: HtsChapterRef, sectionSlug: string): string {
  return `${chapterCoverHref(chapter)}/${sectionSlug}`;
}

// Per-section copy used for page H1, meta description, and the placeholder body. Kept here so the
// six chapter route files stay thin and the wording lives in one place.
interface ChapterSectionCopy {
  pageTitle: string;
  description: string;
}

const SECTION_COPY: Record<string, (shortName: string, padded: string) => ChapterSectionCopy> = {
  'tariff-updates': (shortName, padded) => ({
    pageTitle: 'Tariff Updates',
    description: `Recent tariff updates affecting HTS Chapter ${padded} (${shortName}) — rate changes, effective dates, exclusions, and policy actions impacting goods classified under this chapter.`,
  }),
  'understand-industry': (shortName, padded) => ({
    pageTitle: 'Understand the Industry',
    description: `Background on the industry structure behind HTS Chapter ${padded} (${shortName}) — supply chains, established players, challengers, and the economics that drive tariff impact.`,
  }),
  'industry-areas': (shortName, padded) => ({
    pageTitle: 'Industry Areas',
    description: `Sub-areas of HTS Chapter ${padded} (${shortName}) — segment-level tariff exposure across the product groupings inside this chapter.`,
  }),
  'final-conclusion': (shortName, padded) => ({
    pageTitle: 'Final Conclusion',
    description: `Forward-looking conclusion for HTS Chapter ${padded} (${shortName}) — what the latest tariff actions mean for sourcing, pricing, and strategic positioning.`,
  }),
};

export function getChapterSectionCopy(sectionSlug: string, chapter: HtsChapterRef): ChapterSectionCopy | undefined {
  const padded = chapter.number.toString().padStart(2, '0');
  return SECTION_COPY[sectionSlug]?.(chapter.shortName, padded);
}
