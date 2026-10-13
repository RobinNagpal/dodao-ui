import FloatingReportCta from '@/components/ui/FloatingReportCta';
import StatusBadge from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import ShowAt from '@/components/ui/containers/ShowAt';
import Stack from '@/components/ui/containers/Stack';
import { chapterCoverHref, chapterExportHref, type ChapterReportDirection, type ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import React from 'react';

// Import / export indicator for a chapter report, rendered only for chapters that have export
// content; chapters without it show the import pages alone, with nothing to switch to.
//
// It is split in two so the page says both where you are and where else you can go:
// - a "you are here" line (badge + one-line explainer) at the top of the page;
// - a floating pill at the bottom centre linking to the other half of the report. The pill is
//   tablet-and-up only, so on phones the line drops the explainer and carries the link instead,
//   badge on the left and link on the right, on one row.
//
// `layout="row"` gives the line its own bottom margin (legacy pages); `layout="header"` leaves
// spacing to the parent (the Approach-2 header puts it above the H1).

const DIRECTION_COPY: Record<
  ChapterReportDirection,
  { badge: string; explainer: string; switchLabel: string; switchSubLabel: string; phoneLinkLabel: string }
> = {
  import: {
    badge: 'U.S. imports',
    explainer: 'What the U.S. charges on these goods coming in.',
    switchLabel: 'See export tariffs',
    switchSubLabel: 'What other countries charge on these goods from the U.S.',
    phoneLinkLabel: 'See export tariffs →',
  },
  export: {
    badge: 'U.S. exports',
    explainer: 'What other countries charge on these goods from the U.S.',
    switchLabel: 'Back to import tariffs',
    switchSubLabel: 'What the U.S. charges on these goods coming in.',
    phoneLinkLabel: '← Back to import tariffs',
  },
};

interface ChapterDirectionSwitchProps {
  chapter: ChapterRouteInfo;
  direction: ChapterReportDirection;
  layout?: 'row' | 'header';
}

export default function ChapterDirectionSwitch({ chapter, direction, layout = 'row' }: ChapterDirectionSwitchProps): React.JSX.Element {
  const copy = DIRECTION_COPY[direction];
  const otherHref = direction === 'import' ? chapterExportHref(chapter.slug) : chapterCoverHref(chapter.slug);
  const margin = layout === 'row' ? 'md' : 'none';

  return (
    <>
      <ShowAt range="below-md">
        <Stack direction="row" gap="sm" align="center" justify="between" mb={margin}>
          <StatusBadge variant="accent" label={copy.badge} />
          <TextLink href={otherHref}>{copy.phoneLinkLabel}</TextLink>
        </Stack>
      </ShowAt>
      <ShowAt range="md-up">
        <Stack direction="row" gap="sm" align="center" wrap mb={margin}>
          <StatusBadge variant="accent" label={copy.badge} />
          <Text as="span" size="sm" tone="muted" leading="snug">
            {copy.explainer}
          </Text>
        </Stack>
      </ShowAt>
      <FloatingReportCta href={otherHref} label={copy.switchLabel} subLabel={copy.switchSubLabel} icon={direction === 'import' ? 'forward' : 'back'} />
    </>
  );
}
