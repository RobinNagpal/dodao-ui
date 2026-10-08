import SegmentedLinks from '@/components/ui/SegmentedLinks';
import Text from '@/components/ui/Text';
import Stack from '@/components/ui/containers/Stack';
import { chapterCoverHref, chapterSectionHref, type ChapterReportDirection, type ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import React from 'react';

// Import | Export switch at the top of a chapter report. Rendered only for chapters that have
// export content; chapters without it show the import pages alone, with no switch.

const EXPLAINER: Record<ChapterReportDirection, string> = {
  import: 'What the U.S. charges on these goods coming in.',
  export: 'What other countries charge on these goods from the U.S.',
};

interface ChapterDirectionSwitchProps {
  chapter: ChapterRouteInfo;
  direction: ChapterReportDirection;
}

export default function ChapterDirectionSwitch({ chapter, direction }: ChapterDirectionSwitchProps): React.JSX.Element {
  return (
    <Stack direction="row" gap="md" align="center" wrap mb="md">
      <SegmentedLinks
        ariaLabel="Report direction"
        items={[
          { key: 'import', href: chapterCoverHref(chapter.slug), label: 'Import', active: direction === 'import' },
          { key: 'export', href: chapterSectionHref(chapter.slug, 'exports'), label: 'Export', active: direction === 'export' },
        ]}
      />
      <Text as="span" size="sm" tone="muted">
        {EXPLAINER[direction]}
      </Text>
    </Stack>
  );
}
