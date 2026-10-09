import TextLink from '@/components/ui/TextLink';
import Text from '@/components/ui/Text';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import { RuleList, RuleListItem } from '@/components/ui/sections/RuleList';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import type { TariffUpdateSource } from '@/types/tariff-chapter-prototype';
import React from 'react';

// "Sources" card at the foot of the Approach-2 tariff pages (issue #1770), import and export: each
// document's citation, title, publisher and dates, in two ruled columns.

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export default function SourcesCard({ sources }: { sources: TariffUpdateSource[] }): React.JSX.Element {
  return (
    <CardSection padding="roomy" bordered>
      <Stack gap="md">
        <SectionHeading as="h2" size="md" weight="bold" tone="heading">
          Sources
        </SectionHeading>
        <RuleList as="ol" columns="1-2">
          {sources.map((source) => (
            <RuleListItem key={source.id}>
              <TextLink href={source.url} wrap>
                {source.citation} · {source.document}
              </TextLink>
              <Text size="sm">{source.title}</Text>
              <Text size="xs" tone="muted">
                {source.publisher}
                {source.signed ? ` · Signed ${formatDate(source.signed)}` : ''} · Published {formatDate(source.published)}
              </Text>
            </RuleListItem>
          ))}
        </RuleList>
      </Stack>
    </CardSection>
  );
}
