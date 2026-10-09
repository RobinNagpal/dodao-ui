'use client';

import { HIGH_RATE_PCT, rateEmphasis } from '@/components/industry-tariff/chapter/areas/rate-emphasis';
import { usd } from '@/components/industry-tariff/chapter/exports/export-shared';
import Text from '@/components/ui/Text';
import Stack from '@/components/ui/containers/Stack';
import SelectableMatrix, { type MatrixGroup, type MatrixRow, type MatrixSelection } from '@/components/ui/tables/SelectableMatrix';
import type { TariffExportMarketsContent } from '@/types/tariff-chapter-exports';
import React, { useMemo, useState } from 'react';

// Destination × product-group matrix of the tariff each buyer charges on U.S. goods (export
// markets page). Works like the import rates-by-country matrix: select a cell and its detail —
// where the rate comes from and the buyer's rule — opens in a modal (a list on phones).
// Every cell is rendered on the server; selection only changes which detail is open.

export default function ExportRateMatrix({ markets }: { markets: TariffExportMarketsContent }): React.JSX.Element {
  const countryByName = useMemo(() => new Map(markets.countries.map((c) => [c.country, c])), [markets.countries]);
  // Open on the biggest lane, like the import matrix.
  const firstLane = markets.biggestLanes[0];
  const [selected, setSelected] = useState<MatrixSelection>({
    row: firstLane?.country ?? markets.countries[0]?.country ?? '',
    group: firstLane?.heading ?? markets.groups[0]?.heading ?? '',
  });

  const groups: MatrixGroup[] = markets.groups.map((g) => ({ key: g.heading, label: g.label, shortLabel: g.shortLabel }));
  const rows: MatrixRow[] = markets.countries.map((c) => ({ key: c.country, name: c.country, sub: `${usd(c.exportsUsd)} in ${markets.tradeYear}` }));

  const country = countryByName.get(selected.row);
  const group = markets.groups.find((g) => g.heading === selected.group);
  const cell = country?.cells[selected.group];

  const detailTitle = country && group ? `${country.country} · ${group.heading} ${group.label}` : '';

  const detail =
    country && cell ? (
      <Stack gap="sm">
        <Text as="span" size="lg" weight="bold" tone={rateEmphasis([cell.rate]) === 'high' ? 'warning' : 'white'}>
          {cell.rate}
        </Text>
        <Text size="sm">
          Where the rate comes from: {cell.basis}. {markets.tradeYear} U.S. exports: {usd(cell.exportsUsd)}.
        </Text>
        <Text size="xs" tone="muted">
          {country.rule}
        </Text>
      </Stack>
    ) : null;

  return (
    <Stack gap="lg">
      <Text size="xs" tone="muted">
        Rates in{' '}
        <Text as="span" size="xs" weight="semibold" tone="warning">
          amber
        </Text>{' '}
        include a duty of {HIGH_RATE_PCT}% or more; grey rates are Free.
      </Text>
      <SelectableMatrix
        rowHeader="Destination"
        groups={groups}
        rows={rows}
        cell={(row, g) => {
          const c = countryByName.get(row.key)?.cells[g.key];
          if (!c) return { value: '—', emphasis: 'quiet' };
          return { value: c.rate, emphasis: rateEmphasis([c.rate]), secondary: usd(c.exportsUsd), dim: c.exportsUsd === 0 };
        }}
        cellLabel={(row, g) => `${g.label} to ${row.name}`}
        selected={selected}
        onSelect={setSelected}
        detailTitle={detailTitle}
        detail={detail}
      />
    </Stack>
  );
}
