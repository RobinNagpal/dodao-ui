import { type StatusBadgeVariant } from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import Stack from '@/components/ui/containers/Stack';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import type { TariffExportMarketStatus } from '@/types/tariff-chapter-exports';
import type { TariffUpdateSource } from '@/types/tariff-chapter-prototype';
import React from 'react';

// Formatting and small blocks shared by the three export pages of a chapter report.

export function usd(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function change(pct: number | null): string | null {
  if (pct === null) return null;
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
}

export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export const EXPORT_STATUS_BADGE: Record<TariffExportMarketStatus, { variant: StatusBadgeVariant; label: string }> = {
  unchanged: { variant: 'neutral', label: 'No change' },
  lowered: { variant: 'success', label: 'Tariff lowered' },
  raised: { variant: 'danger', label: 'Tariff raised' },
  raisedThenRemoved: { variant: 'warning', label: 'Raised, then removed' },
  pending: { variant: 'info', label: 'Change pending' },
};

export function ExportSources({ sources }: { sources: TariffUpdateSource[] }): React.JSX.Element {
  return (
    <Stack gap="sm">
      <SectionHeading as="h2" size="sm">
        Sources
      </SectionHeading>
      <Stack gap="xs">
        {sources.map((source) => (
          <Text key={source.id} size="xs" tone="muted">
            <TextLink href={source.url} size="xs">
              {source.citation}
            </TextLink>{' '}
            — {source.document}: {source.title}
          </Text>
        ))}
      </Stack>
    </Stack>
  );
}
