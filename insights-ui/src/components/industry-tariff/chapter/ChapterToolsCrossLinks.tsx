import ChapterToolsBar, { type ChapterToolLink } from '@/components/industry-tariff/chapter/ChapterToolsBar';
import { getHtsChapterRefByNumber } from '@/utils/tariff-cross-links/hts-chapter-ref';
import { CHAPTER_US_EXPORTS_SLUG, chapterSectionHref, type ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import { Calculator, ListTree, Ship } from 'lucide-react';

/** The "Tools for this chapter" links; the HTS codes link is left out when the chapter has no HTS page. */
export function buildChapterToolLinks(chapterNumber: number, htsChapterHref: string | null): ChapterToolLink[] {
  const padded = chapterNumber.toString().padStart(2, '0');
  const links: ChapterToolLink[] = [
    {
      href: '/tariff-calculator',
      label: 'Tariff Calculator',
      description: `Estimate landed US duty for goods in HTS Chapter ${padded} — base rate plus Section 232, 301, and IEEPA fees.`,
      icon: <Calculator className="h-4 w-4" />,
      tone: 'indigo',
    },
  ];

  if (htsChapterHref) {
    links.push({
      href: htsChapterHref,
      label: `HTS Chapter ${padded} Codes`,
      description: 'Browse every HTS code in this chapter, with general rate, Column 2, special rates, and units of quantity.',
      icon: <ListTree className="h-4 w-4" />,
      tone: 'emerald',
    });
  }

  return links;
}

/** The "Tariffs on U.S. Exports" tool link — only for chapters whose content has that page. */
export function buildUsExportsToolLink(chapterSlug: string, active: boolean): ChapterToolLink {
  return {
    href: chapterSectionHref(chapterSlug, CHAPTER_US_EXPORTS_SLUG),
    label: 'Tariffs on U.S. Exports',
    description: 'Which countries buy these goods from the U.S., the tariff they charge on them, and what changed since January 2025.',
    icon: <Ship className="h-4 w-4" />,
    tone: 'amber',
    active,
  };
}

// Shared "Tools for this chapter" block. Exposed as an async helper rather than an async server
// component because the project's TypeScript (5.0.4) doesn't type-check `<AsyncComponent />` in
// JSX. Callers await it once and store the result; the JSX it returns can be embedded normally.
export async function renderChapterToolsCrossLinks(chapter: ChapterRouteInfo): Promise<JSX.Element> {
  const htsChapter = await getHtsChapterRefByNumber(chapter.number);
  return <ChapterToolsBar links={buildChapterToolLinks(chapter.number, htsChapter?.href ?? null)} />;
}
