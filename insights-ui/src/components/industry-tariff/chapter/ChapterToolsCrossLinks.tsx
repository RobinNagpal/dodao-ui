import TariffCrossLinks, { type TariffCrossLink } from '@/components/tariff-cross-links/TariffCrossLinks';
import { getHtsChapterRefByNumber } from '@/utils/tariff-cross-links/hts-chapter-ref';
import type { ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import { Calculator, ListTree } from 'lucide-react';

// Shared "Tools for this chapter" block. Exposed as an async helper rather than an async server
// component because the project's TypeScript (5.0.4) doesn't type-check `<AsyncComponent />` in
// JSX. Callers await it once and store the result; the JSX it returns can be embedded normally.
export async function renderChapterToolsCrossLinks(chapter: ChapterRouteInfo): Promise<JSX.Element> {
  const padded = chapter.number.toString().padStart(2, '0');
  const htsChapter = await getHtsChapterRefByNumber(chapter.number);

  const links: TariffCrossLink[] = [
    {
      href: '/tariff-calculator',
      title: 'Tariff Calculator',
      description: `Estimate landed US duty for goods in HTS Chapter ${padded} — base rate plus Section 232, 301, and IEEPA fees.`,
      icon: <Calculator className="h-5 w-5" />,
    },
  ];

  if (htsChapter) {
    links.push({
      href: htsChapter.href,
      title: `HTS Chapter ${padded} — ${chapter.title}`,
      description: 'Browse every HTS code in this chapter, with general rate, Column 2, special rates, and units of quantity.',
      icon: <ListTree className="h-5 w-5" />,
    });
  }

  return <TariffCrossLinks heading="Tools for this chapter" links={links} />;
}
