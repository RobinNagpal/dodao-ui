import ChapterToolsBar from '@/components/industry-tariff/chapter/ChapterToolsBar';
import { buildChapterToolLinks, buildUsExportsToolLink } from '@/components/industry-tariff/chapter/ChapterToolsCrossLinks';
import type { TariffChapterPrototype } from '@/types/tariff-chapter-prototype';
import { chapterDetailHref } from '@/utils/tariff-calculator/chapter-slug';
import { getChapterPrototype } from '@/utils/tariff-reports/chapter-prototype';

// "Tools for this chapter" bar for Approach-2 prototype chapters (issue #1770).
// Same links as renderChapterToolsCrossLinks(), but the HTS chapter link is
// built from the content file rather than a `tariff_chapters` lookup, so the
// prototype pages render with the tariff tables empty. Chapters whose content
// has a `usExports` page get a third "Tariffs on U.S. Exports" link, shown as
// active on that page.
interface PrototypeChapterToolsBarProps {
  chapter: TariffChapterPrototype['chapter'];
  usExportsActive?: boolean;
}

export default function PrototypeChapterToolsBar({ chapter, usExportsActive = false }: PrototypeChapterToolsBarProps): JSX.Element {
  const links = buildChapterToolLinks(chapter.number, chapterDetailHref(chapter.sectionNumber, chapter.number, chapter.title));
  if (getChapterPrototype(chapter.slug)?.usExports) links.push(buildUsExportsToolLink(chapter.slug, usExportsActive));
  return <ChapterToolsBar links={links} />;
}
