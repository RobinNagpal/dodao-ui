// Which glossary terms an Approach-2 chapter page uses (issue #1784). The page's content-file section is
// scanned for every term's aliases, so a newly migrated chapter gets its "Key terms on this page" block
// with no extra data. DB-backed chapters have no content file and get no terms.

import { findGlossaryTerms, TARIFF_GLOSSARY, type GlossaryEntry } from '@/tariff-data/glossary';
import { getChapterExports } from '@/utils/tariff-reports/chapter-exports';
import { getChapterPrototype } from '@/utils/tariff-reports/chapter-prototype';
import type { ChapterReportDirection } from '@/utils/tariff-reports/chapter-route-helpers';

// Fields that are never shown as page text: ids, links, search indexes, SEO metadata.
const SKIPPED_KEYS = new Set(['id', 'url', 'path', 'slug', 'href', 'sourceIds', 'ruleIds', 'leverIds', 'searchText', 'searchedAs', 'seo', 'nav']);

function collectText(value: unknown, out: string[]): void {
  if (typeof value === 'string') {
    if (!/^https?:\/\//.test(value)) out.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectText(item, out);
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (!SKIPPED_KEYS.has(key)) collectText(child, out);
    }
  }
}

// Terms in a page's fixed component labels rather than its data, e.g. the rate table's column headers.
const STATIC_TERM_IDS: Record<string, string[]> = {
  overview: ['base-rate', 'special-rate', 'column-2'],
};

const EXPORT_PAGE_KEYS = { exports: 'overview', 'exports/tariff-updates': 'tariffUpdates', 'exports/markets': 'markets' } as const;

/** The content-file data rendered on an Approach-2 page, or null when the page has none. */
function approach2PageContent(chapterSlug: string, currentSlug: string, direction: ChapterReportDirection): unknown[] | null {
  if (direction === 'export') {
    const key = EXPORT_PAGE_KEYS[currentSlug as keyof typeof EXPORT_PAGE_KEYS];
    const content = key ? getChapterExports(chapterSlug)?.[key] : undefined;
    return content ? [content] : null;
  }
  const prototype = getChapterPrototype(chapterSlug);
  if (!prototype) return null;
  switch (currentSlug) {
    // The overview also shows the "In short" takeaways and the extra duties in effect.
    case 'overview':
      return [prototype.overview, prototype.finalConclusion?.keyTakeaways, prototype.tariffUpdates?.inEffect];
    case 'tariff-updates':
      return prototype.tariffUpdates ? [prototype.tariffUpdates] : null;
    case 'understand-industry':
      return prototype.understandIndustry ? [prototype.understandIndustry] : null;
    case 'industry-areas':
      return prototype.industryAreas ? [prototype.industryAreas] : null;
    case 'tariff-engineering':
      return prototype.tariffEngineering ? [prototype.tariffEngineering] : null;
    case 'final-conclusion':
      return prototype.finalConclusion ? [prototype.finalConclusion] : null;
    default:
      return null;
  }
}

/** Glossary entries used on an Approach-2 page, in glossary order; empty for DB-backed chapters. */
export function approach2PageGlossaryTerms(chapterSlug: string, currentSlug: string, direction: ChapterReportDirection): GlossaryEntry[] {
  const content = approach2PageContent(chapterSlug, currentSlug, direction);
  if (!content) return [];
  const text: string[] = [];
  collectText(content, text);
  const ids = new Set(findGlossaryTerms(text.join('\n')).map((entry) => entry.id));
  if (direction === 'import') for (const id of STATIC_TERM_IDS[currentSlug] ?? []) ids.add(id);
  return TARIFF_GLOSSARY.filter((entry) => ids.has(entry.id));
}
