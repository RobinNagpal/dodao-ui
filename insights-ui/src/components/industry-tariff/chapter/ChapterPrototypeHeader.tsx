import { chapterReportNavItems } from '@/components/industry-tariff/chapter/ChapterRelatedSections';
import Heading from '@/components/ui/Heading';
import SegmentedLinks from '@/components/ui/SegmentedLinks';
import Text from '@/components/ui/Text';
import HeaderWithAside from '@/components/ui/containers/HeaderWithAside';
import Stack from '@/components/ui/containers/Stack';
import type { ChapterReportDirection, ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import type { ReactNode } from 'react';

// Page header for Approach-2 chapters (issue #1770), shared by all report pages: the H1, a
// "Rates checked …" (or "Updated …") line with the chapter's tool links beside it, then the report
// pages as a tab row, named with the Approach-2 page labels. Chapters with export content also get the import/export
// "you are here" line above the H1 (its link to the other half floats at the bottom of the page).

interface ChapterPrototypeHeaderProps {
  chapter: ChapterRouteInfo;
  pageTitle: string;
  // ISO date (YYYY-MM-DD) the chapter's content was compiled.
  ratesAsOf: string;
  // Wording before the date: "Rates checked" on the rate pages, "Updated" on pages that hold no rates.
  asOfLabel?: string;
  // Inline "Tools for this chapter" links (PrototypeChapterToolLinks).
  toolLinks: ReactNode;
  currentSlug: string;
  // Which half of the report the page is in; the tabs list that direction's pages.
  direction?: ChapterReportDirection;
  // Admin regenerate/edit actions, pinned beside the title.
  adminActions?: ReactNode;
  // Import / export indicator (ChapterDirectionSwitch), for chapters with export content.
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
  asOfLabel = 'Rates checked',
  toolLinks,
  currentSlug,
  direction = 'import',
  adminActions,
  directionSwitch,
}: ChapterPrototypeHeaderProps): JSX.Element {
  const tabs = chapterReportNavItems(chapter, direction, true).map((item) => ({
    key: item.slug,
    href: item.href,
    label: item.label,
    active: item.slug === currentSlug,
  }));

  return (
    <Stack gap="lg" mb="lg">
      <HeaderWithAside bordered={false} aside={adminActions}>
        <Stack gap="sm">
          {directionSwitch}
          <Heading as="h1" size="page" weight="bold" tone="white">
            {pageTitle}
          </Heading>
          <Stack direction="row" gap="lg" align="center" wrap>
            <Text as="span" size="sm" tone="muted">
              {asOfLabel} {formatRatesAsOf(ratesAsOf)}
            </Text>
            {toolLinks}
          </Stack>
        </Stack>
      </HeaderWithAside>
      <SegmentedLinks variant="tabs" ariaLabel="Chapter report sections" items={tabs} />
    </Stack>
  );
}
