import ChapterToolsBar from '@/components/industry-tariff/chapter/ChapterToolsBar';
import type { TariffChapterPrototype } from '@/types/tariff-chapter-prototype';
import { chapterDetailHref } from '@/utils/tariff-calculator/chapter-slug';
import { Calculator, ListTree } from 'lucide-react';

// "Tools for this chapter" bar for Approach-2 prototype chapters (issue #1770).
// Same links as renderChapterToolsCrossLinks(), but built from the content file
// rather than a `tariff_chapters` lookup, so the prototype pages render with
// the tariff tables empty.
export default function PrototypeChapterToolsBar({ chapter }: { chapter: TariffChapterPrototype['chapter'] }): JSX.Element | null {
  return (
    <ChapterToolsBar
      links={[
        {
          href: '/tariff-calculator',
          label: 'Tariff Calculator',
          description: `Estimate landed US duty for goods in HTS Chapter ${chapter.padded} — base rate plus Section 232, 301, and IEEPA fees.`,
          icon: <Calculator className="h-4 w-4" />,
          tone: 'indigo',
        },
        {
          href: chapterDetailHref(chapter.sectionNumber, chapter.number, chapter.title),
          label: `HTS Chapter ${chapter.padded} Codes`,
          description: 'Browse the raw schedule for this chapter, exactly as HTSUS publishes it.',
          icon: <ListTree className="h-4 w-4" />,
          tone: 'emerald',
        },
      ]}
    />
  );
}
