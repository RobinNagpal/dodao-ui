import { chapterReportNavItems } from '@/components/industry-tariff/chapter/ChapterRelatedSections';
import TextLink from '@/components/ui/TextLink';
import RelatedSectionsNav from '@/components/ui/sections/RelatedSectionsNav';
import type { ChapterReportDirection, ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';

// Bottom-of-page navigation for Approach-2 chapter pages: a "Next: <page> →" link to the following
// page of the report (in tab order), above the list of the report's other pages. Built from the
// same nav items as the header tabs, so it never lists a page the chapter doesn't have.

interface ChapterNextPageNavProps {
  chapter: ChapterRouteInfo;
  currentSlug: string;
  direction?: ChapterReportDirection;
}

export default function ChapterNextPageNav({ chapter, currentSlug, direction = 'import' }: ChapterNextPageNavProps): JSX.Element | null {
  const pages = chapterReportNavItems(chapter, direction, true);
  const currentIndex = pages.findIndex((page) => page.slug === currentSlug);
  const next = currentIndex >= 0 ? pages[currentIndex + 1] : undefined;
  const others = pages.filter((page) => page.slug !== currentSlug);
  if (others.length === 0) return null;

  return (
    <RelatedSectionsNav
      ariaLabel="More pages in this chapter report"
      heading={
        next ? (
          <TextLink href={next.href} size="base">
            Next: {next.label} →
          </TextLink>
        ) : (
          'More pages in this report'
        )
      }
      items={others.map((page) => ({ href: page.href, label: page.label }))}
    />
  );
}
