import { chapterReportNavItems } from '@/components/industry-tariff/chapter/ChapterRelatedSections';
import Heading from '@/components/ui/Heading';
import SegmentedLinks from '@/components/ui/SegmentedLinks';
import Text from '@/components/ui/Text';
import HeaderWithAside from '@/components/ui/containers/HeaderWithAside';
import Stack from '@/components/ui/containers/Stack';
import TabsWithAside from '@/components/ui/containers/TabsWithAside';
import type { ChapterReportDirection, ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import type { ReactNode } from 'react';

// Page header for Approach-2 chapters (issue #1770), shared by all six report pages: the H1, a
// "Rates as of …" line with the chapter's tool links beside it, then the report pages as a tab row.

interface ChapterPrototypeHeaderProps {
  chapter: ChapterRouteInfo;
  pageTitle: string;
  // ISO date (YYYY-MM-DD) the chapter's content was compiled.
  ratesAsOf: string;
  // Inline "Tools for this chapter" links (PrototypeChapterToolLinks).
  toolLinks: ReactNode;
  currentSlug: string;
  // Which half of the report the page is in; the tabs list that direction's pages.
  direction?: ChapterReportDirection;
  // Admin regenerate/edit actions, pinned beside the title.
  adminActions?: ReactNode;
  // Import | Export switch, for chapters with export content.
  directionSwitch?: ReactNode;
}

function formatRatesAsOf(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  // Date-only ISO strings parse as UTC midnight; format in UTC so the day doesn't shift.
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export default function ChapterPrototypeHeader({
  chapter,
  pageTitle,
  ratesAsOf,
  toolLinks,
  currentSlug,
  direction = 'import',
  adminActions,
  directionSwitch,
}: ChapterPrototypeHeaderProps): JSX.Element {
  const tabs = chapterReportNavItems(chapter, direction).map((item) => ({
    key: item.slug,
    href: item.href,
    label: item.label,
    active: item.slug === currentSlug,
  }));

  return (
    <Stack gap="lg" mb="lg">
      <HeaderWithAside bordered={false} aside={adminActions}>
        <Stack gap="sm">
          <Heading as="h1" size="page" weight="bold" tone="white">
            {pageTitle}
          </Heading>
          <Stack direction="row" gap="lg" align="center" wrap>
            <Text as="span" size="sm" tone="muted">
              Rates as of {formatRatesAsOf(ratesAsOf)}
            </Text>
            {toolLinks}
          </Stack>
        </Stack>
      </HeaderWithAside>
      {/* The Import | Export switch sits with the section tabs: one navigation bar for side and page. */}
      <TabsWithAside tabs={<SegmentedLinks variant="tabs" ariaLabel="Chapter report sections" items={tabs} />} aside={directionSwitch} />
    </Stack>
  );
}
