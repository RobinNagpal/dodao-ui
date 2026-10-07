'use client';

import Stack from '@/components/ui/containers/Stack';
import SearchField from '@/components/ui/SearchField';
import StatusBadge, { type StatusBadgeVariant } from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import ToggleChip from '@/components/ui/ToggleChip';
import InlineCard from '@/components/ui/sections/InlineCard';
import { DataTable, EmptyCellValue, TableCell, TableHead, TableHeaderCell, TableRow, TableScroll } from '@/components/ui/tables/DataTable';
import type { TariffLineStatus } from '@/types/tariff-chapter-prototype';
import React, { useMemo, useState } from 'react';

// "Unchanged since" on every line — Approach 2's per-line half of the updates
// page. Each 10-digit line's base rate in the earlier edition vs now. Rendered
// in full on the server; search and the toggle only narrow it.

interface ChapterLineStatusTableProps {
  lines: TariffLineStatus[];
  beforeLabel: string;
  nowLabel: string;
}

const STATUS_BADGE: Record<TariffLineStatus['status'], { variant: StatusBadgeVariant; label: string }> = {
  unchanged: { variant: 'success', label: 'Unchanged' },
  changed: { variant: 'warning', label: 'Changed' },
  new: { variant: 'info', label: 'New line' },
};

function formatSince(value: string | null): string | null {
  if (!value) return null;
  const date = value.replace(/^≤\s*/, '');
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return value;
  const label = parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  return value.startsWith('≤') ? `at least ${label}` : label;
}

export default function ChapterLineStatusTable({ lines, beforeLabel, nowLabel }: ChapterLineStatusTableProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [changedOnly, setChangedOnly] = useState(false);

  const normalized = query.trim().toLowerCase();
  const digits = normalized.replace(/\D/g, '');
  const changedCount = useMemo(() => lines.filter((l) => l.status !== 'unchanged').length, [lines]);

  const shown = useMemo(
    () =>
      lines.filter((line) => {
        if (changedOnly && line.status === 'unchanged') return false;
        if (!normalized) return true;
        return line.searchText.includes(normalized) || (digits.length > 0 && line.hts.replace(/\D/g, '').startsWith(digits));
      }),
    [lines, changedOnly, normalized, digits]
  );

  return (
    <Stack gap="lg">
      <SearchField
        value={query}
        onChange={setQuery}
        label="Find a tariff line by product name or HTS code"
        placeholder='Is my line affected? Try "goat", "cattle", or an HTS code'
        resultLabel={`${shown.length} of ${lines.length} lines`}
      />
      <Stack direction="row" gap="sm" wrap>
        <ToggleChip label="Only lines whose base rate changed" active={changedOnly} onToggle={() => setChangedOnly(!changedOnly)} count={changedCount} />
      </Stack>

      {shown.length === 0 ? (
        <InlineCard padding="cozy">
          <Text size="sm" tone="muted">
            {changedOnly && changedCount === 0
              ? `No line in this chapter changed its base rate between the ${beforeLabel} and the ${nowLabel}.`
              : `No tariff line in this chapter matches “${query}”.`}
          </Text>
        </InlineCard>
      ) : (
        <TableScroll maxHeight="lg">
          <DataTable>
            <TableHead sticky>
              <TableRow>
                <TableHeaderCell>HTS code</TableHeaderCell>
                <TableHeaderCell width="wide">Description</TableHeaderCell>
                <TableHeaderCell>General, {beforeLabel}</TableHeaderCell>
                <TableHeaderCell>General, now</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Base rate unchanged since</TableHeaderCell>
              </TableRow>
            </TableHead>
            <tbody>
              {shown.map((line) => {
                const badge = STATUS_BADGE[line.status];
                return (
                  <TableRow key={line.hts}>
                    <TableCell variant="code">{line.hts}</TableCell>
                    <TableCell>
                      <Stack gap="xxs">
                        {line.ancestorPath.length > 0 && (
                          <Text size="xs" tone="muted">
                            {line.ancestorPath.join(' › ')}
                          </Text>
                        )}
                        <span>{line.description}</span>
                      </Stack>
                    </TableCell>
                    <TableCell variant="rate">{line.generalBefore ?? <EmptyCellValue />}</TableCell>
                    <TableCell variant="rate">{line.generalNow ?? <EmptyCellValue />}</TableCell>
                    <TableCell variant="rate">
                      <StatusBadge variant={badge.variant} size="sm" label={badge.label} />
                    </TableCell>
                    <TableCell variant="rate" tone="muted">
                      {formatSince(line.unchangedSince) ?? <EmptyCellValue />}
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </DataTable>
        </TableScroll>
      )}
    </Stack>
  );
}
