import { slugify } from '@dodao/web-core/utils/auth/slugify';

// URL helpers for the HTSUS chapter routes
// (/hts-codes/us/section-<n>/chapter-<n>-<short-title-slug>).

const CHAPTER_TITLE_MAX_WORDS = 10;

function padChapter(chapterNumber: number): string {
  return chapterNumber.toString().padStart(2, '0');
}

function truncateSlugWords(slug: string, maxWords: number): string {
  return slug.split('-').filter(Boolean).slice(0, maxWords).join('-');
}

// Truncate to ~10 words so chapter titles like "Dairy produce; birds' eggs;
// natural honey; edible products of animal origin..." don't blow out the URL.
export function chapterTitleSlug(title: string): string {
  return truncateSlugWords(slugify(title), CHAPTER_TITLE_MAX_WORDS);
}

export function sectionUrlSegment(sectionNumber: number): string {
  return `section-${sectionNumber}`;
}

export function chapterUrlSegment(chapterNumber: number, title: string): string {
  const slug = chapterTitleSlug(title);
  const padded = padChapter(chapterNumber);
  return slug ? `chapter-${padded}-${slug}` : `chapter-${padded}`;
}

export function chapterDetailHref(sectionNumber: number, chapterNumber: number, title: string): string {
  return `/hts-codes/us/${sectionUrlSegment(sectionNumber)}/${chapterUrlSegment(chapterNumber, title)}`;
}

export function parseSectionSegment(segment: string): number | null {
  const m = /^section-(\d{1,2})$/.exec(segment);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (n < 1 || n > 22) return null;
  return n;
}

export function parseChapterSegment(segment: string): number | null {
  const m = /^chapter-(\d{1,2})(?:-.+)?$/.exec(segment);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (n < 1 || n > 99) return null;
  return n;
}
