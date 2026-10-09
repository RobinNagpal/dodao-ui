import Text from '@/components/ui/Text';
import Stack from '@/components/ui/containers/Stack';
import { DisclosureItem } from '@/components/ui/sections/DisclosureList';
import InlineCard from '@/components/ui/sections/InlineCard';
import React from 'react';

// One measure in the "in effect today" list on the Approach-2 tariff-updates pages, import and
// export: who it applies to, what it is and its citations, the rate change as the headline, what it means for a
// shipment, and the long scope / exemption text folded behind "Scope and exemptions".

interface DutyInEffectCardProps {
  /** Who the measure applies to, e.g. "All countries (default)" or "China". */
  country: string;
  measure: string;
  /** Chapter 99 heading(s), shown as an HTS code. */
  code?: string;
  before: string;
  now: string;
  whatItMeans: string;
  /** Scope, exemptions and lower-rate options — folded away by default. */
  details: string;
  /** Citation links for the measure. */
  sources: React.ReactNode;
}

export default function DutyInEffectCard({ country, measure, code, before, now, whatItMeans, details, sources }: DutyInEffectCardProps): React.JSX.Element {
  return (
    <InlineCard surface="card" padding="spacious">
      <Stack gap="md">
        <Stack direction="row" gap="lg" align="start" justify="between" wrap>
          <Stack gap="xs">
            <Text as="span" size="sm" tone="muted">
              {country}
            </Text>
            <Text as="span" size="base" weight="semibold" tone="white">
              {measure}
            </Text>
            {code && (
              <Text as="span" size="sm" tone="primary" font="mono">
                {code}
              </Text>
            )}
            {sources}
          </Stack>
          <Text as="span" size="lg" weight="bold" tone="white">
            {before} → {now}
          </Text>
        </Stack>
        <Text size="sm">
          <Text as="span" size="sm" weight="semibold" tone="white">
            What it means:{' '}
          </Text>
          {whatItMeans}
        </Text>
        <DisclosureItem look="inline" summary="Scope and exemptions">
          <Text size="sm">{details}</Text>
        </DisclosureItem>
      </Stack>
    </InlineCard>
  );
}
