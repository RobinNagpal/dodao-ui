import Text from '@/components/ui/Text';
import MetricGrid, { cardGridColumns } from '@/components/ui/containers/MetricGrid';
import Stack from '@/components/ui/containers/Stack';
import InlineCard from '@/components/ui/sections/InlineCard';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import React from 'react';

// The numbered "In short" cards of an Approach-2 chapter (`finalConclusion.keyTakeaways`). Shown at the
// top of the overview, so a reader gets the answer before the rate table, and on the FAQ page.

interface ChapterKeyTakeawaysProps {
  takeaways: string[];
}

export default function ChapterKeyTakeaways({ takeaways }: ChapterKeyTakeawaysProps): React.JSX.Element | null {
  if (takeaways.length === 0) return null;
  return (
    <Stack as="section" gap="md">
      <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
        In short
      </SectionHeading>
      <MetricGrid columns={cardGridColumns(takeaways.length)} gap="lg">
        {takeaways.map((point, index) => (
          <InlineCard key={point} surface="card" padding="spacious" fill>
            <Stack direction="row" gap="md" align="start">
              <Text as="span" size="lg" weight="bold" tone="muted">
                {index + 1}
              </Text>
              <Text size="base">{point}</Text>
            </Stack>
          </InlineCard>
        ))}
      </MetricGrid>
    </Stack>
  );
}
