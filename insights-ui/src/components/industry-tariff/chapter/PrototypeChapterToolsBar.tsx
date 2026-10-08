import ChapterToolsBar from '@/components/industry-tariff/chapter/ChapterToolsBar';
import { buildChapterToolLinks } from '@/components/industry-tariff/chapter/ChapterToolsCrossLinks';
import type { TariffChapterPrototype } from '@/types/tariff-chapter-prototype';
import { chapterDetailHref } from '@/utils/tariff-calculator/chapter-slug';

// "Tools for this chapter" bar for Approach-2 prototype chapters (issue #1770).
// Same links as renderChapterToolsCrossLinks(), but the HTS chapter link is
// built from the content file rather than a `tariff_chapters` lookup, so the
// prototype pages render with the tariff tables empty.
export default function PrototypeChapterToolsBar({ chapter }: { chapter: TariffChapterPrototype['chapter'] }): JSX.Element {
  return <ChapterToolsBar links={buildChapterToolLinks(chapter.number, chapterDetailHref(chapter.sectionNumber, chapter.number, chapter.title))} />;
}
