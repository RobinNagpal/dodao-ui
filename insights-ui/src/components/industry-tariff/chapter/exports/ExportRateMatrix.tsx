'use client';

import { HIGH_RATE_PCT, rateEmphasis } from '@/components/industry-tariff/chapter/areas/rate-emphasis';
import { usd } from '@/components/industry-tariff/chapter/exports/export-shared';
import Text from '@/components/ui/Text';
import Stack from '@/components/ui/containers/Stack';
import SelectableMatrix, { type MatrixGroup, type MatrixRow, type MatrixSelection } from '@/components/ui/tables/SelectableMatrix';
import type { TariffExportMarketsContent } from '@/types/tariff-chapter-exports';
import React, { useMemo, useState } from 'react';

// Market × product-group matrix of the tariff each buyer charges on U.S. goods (export markets
// page). Works like the import rates-by-country matrix: select a cell and its detail — where the
// rate comes from, the normal rate when a trade agreement or extra duty changes it, and the buyer's
// rule — opens in a modal (a list on phones). Every cell is rendered on the server; selection only
// changes which detail is open.

export default function ExportRateMatrix({ markets }: { markets: TariffExportMarketsContent }): React.JSX.Element {
  const marketByName = useMemo(() => new Map(markets.markets.map((m) => [m.name, m])), [markets.markets]);
  // Open on the biggest lane, like the import matrix.
  const firstLane = markets.biggestLanes[0];
  const [selected, setSelected] = useState<MatrixSelection>({
    row: firstLane?.market ?? markets.markets[0]?.name ?? '',
    group: firstLane?.heading ?? markets.groups[0]?.heading ?? '',
  });

  const groups: MatrixGroup[] = markets.groups.map((g) => ({ key: g.heading, label: g.label, shortLabel: g.shortLabel }));
  const rows: MatrixRow[] = markets.markets.map((m) => ({ key: m.name, name: m.name, sub: `${usd(m.exportsUsd)} in ${markets.tradeYear}` }));

  const market = marketByName.get(selected.row);
  const group = markets.groups.find((g) => g.heading === selected.group);
  const cell = market?.cells[selected.group];

  const detailTitle = market && group ? `${market.name} · ${group.heading} ${group.label}` : '';

  const detail =
    market && cell ? (
      <Stack gap="sm">
        <Text as="span" size="lg" weight="bold" tone={rateEmphasis([cell.rate]) === 'high' ? 'warning' : 'white'}>
          {cell.rate}
        </Text>
        {cell.normalRate && <Text size="sm">Normal (MFN) rate for other countries: {cell.normalRate}.</Text>}
        <Text size="sm">
          Where the rate comes from: {cell.basis}. {markets.tradeYear} U.S. exports: {usd(cell.exportsUsd)}.
        </Text>
        <Text size="xs" tone="muted">
          {market.rule}
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
        rowHeader="Market"
        groups={groups}
        rows={rows}
        cell={(row, g) => {
          const c = marketByName.get(row.key)?.cells[g.key];
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
