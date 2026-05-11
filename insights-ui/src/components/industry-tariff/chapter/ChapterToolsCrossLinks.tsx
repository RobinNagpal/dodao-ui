import ChapterToolsBar, { type ChapterToolLink } from '@/components/industry-tariff/chapter/ChapterToolsBar';
import { getHtsChapterRefByNumber } from '@/utils/tariff-cross-links/hts-chapter-ref';
import type { ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import { Calculator, ListTree } from 'lucide-react';

// Shared "Tools for this chapter" block. Exposed as an async helper rather than an async server
// component because the project's TypeScript (5.0.4) doesn't type-check `<AsyncComponent />` in
// JSX. Callers await it once and store the result; the JSX it returns can be embedded normally.
export async function renderChapterToolsCrossLinks(chapter: ChapterRouteInfo): Promise<JSX.Element> {
  const padded = chapter.number.toString().padStart(2, '0');
  const htsChapter = await getHtsChapterRefByNumber(chapter.number);

  const links: ChapterToolLink[] = [
    {
      href: '/tariff-calculator',
      label: 'Tariff Calculator',
      description: `Estimate landed US duty for goods in HTS Chapter ${padded} — base rate plus Section 232, 301, and IEEPA fees.`,
      icon: <Calculator className="h-4 w-4" />,
      tone: 'indigo',
    },
  ];

  if (htsChapter) {
    links.push({
      href: htsChapter.href,
      label: `HTS Chapter ${padded} Codes`,
      description: 'Browse every HTS code in this chapter, with general rate, Column 2, special rates, and units of quantity.',
      icon: <ListTree className="h-4 w-4" />,
      tone: 'emerald',
    });
  }

  return <ChapterToolsBar links={links} />;
}
