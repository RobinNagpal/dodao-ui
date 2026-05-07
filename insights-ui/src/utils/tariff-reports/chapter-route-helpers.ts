import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

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

export interface ChapterRouteInfo {
  number: number;
  title: string;
  slug: string;
}

export interface ResolvedChapterRoute {
  chapter: ChapterRouteInfo;
  // Legacy industryId set on the row when the chapter is part of an existing industry report.
  // When set, callers should redirect to `/industry-tariff-report/<oldUrl>` instead of rendering
  // chapter content.
  oldUrl: string | null;
}

// Resolves a chapter slug from the URL by reading the seeded `tariff_chapter_reports` row.
// Returns undefined for unknown slugs — caller should `notFound()` in that case.
export async function resolveChapterRoute(rawSlug: string): Promise<ResolvedChapterRoute | undefined> {
  const row = await prisma.tariffChapterReport.findUnique({
    where: { spaceId_slug: { spaceId: KoalaGainsSpaceId, slug: rawSlug } },
    select: { slug: true, oldUrl: true, chapter: { select: { number: true, title: true } } },
  });
  if (!row) return undefined;
  return {
    chapter: { number: row.chapter.number, title: row.chapter.title, slug: row.slug },
    oldUrl: row.oldUrl,
  };
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
};

export function getChapterSectionCopy(sectionSlug: string, chapter: ChapterRouteInfo): ChapterSectionCopy | undefined {
  const padded = chapter.number.toString().padStart(2, '0');
  return SECTION_COPY[sectionSlug]?.(chapter.title, padded);
}
