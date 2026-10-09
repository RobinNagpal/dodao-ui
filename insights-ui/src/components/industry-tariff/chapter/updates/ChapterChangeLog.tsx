'use client';

import { SourceLinks } from '@/components/industry-tariff/chapter/updates/SourceLinks';
import Heading from '@/components/ui/Heading';
import StatusBadge, { type StatusBadgeVariant } from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import ToggleChip from '@/components/ui/ToggleChip';
import Stack from '@/components/ui/containers/Stack';
import TimelineRow from '@/components/ui/sections/TimelineRow';
import type { TariffUpdateSource } from '@/types/tariff-chapter-prototype';
import React, { useMemo, useState } from 'react';

// The dated change log on the Approach-2 tariff-updates pages (issue #1770), import and export:
// every entry newest first, grouped by year, with filter chips per type. A client component only
// for the filter state — every entry is server-rendered into the HTML. Callers map their own
// entry shape onto `ChangeLogEntry`.

export interface ChangeLogEntry {
  id: string;
  /** ISO date. */
  date: string;
  /** Filter key; its chip label comes from `typeLabels`. */
  type: string;
  /** Pill under the date, e.g. "Effective" or "Retaliation". */
  badge: { label: string; variant: StatusBadgeVariant };
  title: string;
  /** Muted tag beside the title, e.g. "Extra duty" or "Covers this chapter". */
  tag?: string;
  detail: string;
  before?: string | null;
  now?: string | null;
  /** Small "Label: value" facts under the detail, e.g. "Applies to: All". */
  facts?: Array<{ label: string; value: string }>;
  sourceIds: string[];
}

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

interface ChapterChangeLogProps {
  changes: ChangeLogEntry[];
  typeLabels: Record<string, string>;
  sources: TariffUpdateSource[];
}

export default function ChapterChangeLog({ changes, typeLabels, sources }: ChapterChangeLogProps): React.JSX.Element {
  const [filter, setFilter] = useState<string>('all');
  const sourceById = useMemo(() => new Map(sources.map((s) => [s.id, s])), [sources]);

  // Filter chips in the order the types first appear, each with its count.
  const types = useMemo(() => Array.from(new Set(changes.map((c) => c.type))), [changes]);
  const shown = filter === 'all' ? changes : changes.filter((c) => c.type === filter);

  const years: Array<{ year: string; entries: ChangeLogEntry[] }> = [];
  shown.forEach((change) => {
    const year = change.date.slice(0, 4);
    const group = years.find((y) => y.year === year);
    if (group) group.entries.push(change);
    else years.push({ year, entries: [change] });
  });

  return (
    <Stack gap="lg">
      <Stack direction="row" gap="sm" wrap>
        <ToggleChip size="md" look="outline" label="All" count={changes.length} active={filter === 'all'} onToggle={() => setFilter('all')} />
        {types.map((type) => (
          <ToggleChip
            key={type}
            size="md"
            look="outline"
            label={typeLabels[type] ?? type}
            count={changes.filter((c) => c.type === type).length}
            active={filter === type}
            onToggle={() => setFilter(type)}
          />
        ))}
      </Stack>

      <Stack gap="xl">
        {years.map(({ year, entries }) => (
          <Stack key={year} gap="xs">
            <Heading as="h3" size="md" weight="bold" tone="muted">
              {year}
            </Heading>
            <div>
              {entries.map((change) => (
                <TimelineRow
                  key={change.id}
                  aside={
                    <>
                      <Text size="sm" weight="semibold" tone="white">
                        {formatDate(change.date)}
                      </Text>
                      <StatusBadge variant={change.badge.variant} label={change.badge.label} />
                    </>
                  }
                >
                  <Stack direction="row" gap="sm" align="baseline" wrap>
                    <Text as="span" size="base" weight="semibold" tone="white">
                      {change.title}
                    </Text>
                    {change.tag && (
                      <Text as="span" size="xs" tone="muted">
                        {change.tag}
                      </Text>
                    )}
                  </Stack>
                  <Text size="sm">{change.detail}</Text>
                  <Stack direction="row" gap="lg" align="baseline" wrap>
                    {/* Only show the arrow when both ends are known — a half-known change reads as a fact we don't have. */}
                    {change.before && change.now && (
                      <Text as="span" size="xs" tone="muted">
                        Rate:{' '}
                        <Text as="span" size="xs" weight="semibold" tone="white">
                          {change.before} → {change.now}
                        </Text>
                      </Text>
                    )}
                    {change.facts?.map((fact) => (
                      <Text key={fact.label} as="span" size="xs" tone="muted">
                        {fact.label}: {fact.value}
                      </Text>
                    ))}
                    <SourceLinks ids={change.sourceIds} sources={sourceById} />
                  </Stack>
                </TimelineRow>
              ))}
            </div>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
