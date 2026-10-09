import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import Stack from '@/components/ui/containers/Stack';
import { DisclosureItem } from '@/components/ui/sections/DisclosureList';
import InlineCard from '@/components/ui/sections/InlineCard';
import React from 'react';

// One measure in the "in effect today" list on the Approach-2 tariff-updates pages, import and
// export: who it applies to, what it is and its citations, the rate change as the headline with the
// date it took effect and the official document behind it, what it means for a
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
  /** ISO date the current rate took effect, and the official document that put it in force. */
  effectiveFrom: string;
  effectiveSource?: { citation: string; url: string };
}

function formatSince(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export default function DutyInEffectCard({
  country,
  measure,
  code,
  before,
  now,
  whatItMeans,
  details,
  sources,
  effectiveFrom,
  effectiveSource,
}: DutyInEffectCardProps): React.JSX.Element {
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
          <Stack gap="xs" align="end">
            <Text as="span" size="lg" weight="bold" tone="white">
              {before} → {now}
            </Text>
            <Text as="span" size="sm" tone="muted">
              In effect since <time dateTime={effectiveFrom}>{formatSince(effectiveFrom)}</time>
              {effectiveSource && (
                <>
                  {' · '}
                  <TextLink href={effectiveSource.url} size="sm" wrap>
                    {effectiveSource.citation} ↗
                  </TextLink>
                </>
              )}
            </Text>
          </Stack>
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
