import { buildChapterToolLinks } from '@/components/industry-tariff/chapter/ChapterToolsCrossLinks';
import LinkMenu from '@/components/ui/LinkMenu';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import ShowAt from '@/components/ui/containers/ShowAt';
import type { TariffChapterPrototype } from '@/types/tariff-chapter-prototype';
import { chapterDetailHref } from '@/utils/tariff-calculator/chapter-slug';
import { Fragment } from 'react';

// Inline "Tools for this chapter: Tariff Calculator · HTS Chapter NN Codes" line for Approach-2
// chapters (issue #1770), shown beside "Rates as of …" in ChapterPrototypeHeader. Same links as
// renderChapterToolsCrossLinks(), but the HTS chapter link is built from the content file rather
// than a `tariff_chapters` lookup, so the pages render with the tariff tables empty.
//
// On phones the same links sit behind a "Tools" menu so the date and tools share one line; the
// inline copy stays in the HTML (CSS-hidden there), so crawlers still follow the links.
export default function PrototypeChapterToolLinks({ chapter }: { chapter: TariffChapterPrototype['chapter'] }): JSX.Element {
  const links = buildChapterToolLinks(chapter.number, chapterDetailHref(chapter.sectionNumber, chapter.number, chapter.title));
  return (
    <>
      <ShowAt range="md-up">
        <Text as="span" size="sm" tone="muted">
          Tools for this chapter:{' '}
          {links.map((link, index) => (
            <Fragment key={link.href}>
              {index > 0 && ' · '}
              <TextLink href={link.href}>{link.label}</TextLink>
            </Fragment>
          ))}
        </Text>
      </ShowAt>
      <ShowAt range="below-md">
        <LinkMenu label="Tools" items={links.map(({ href, label }) => ({ href, label }))} />
      </ShowAt>
    </>
  );
}
