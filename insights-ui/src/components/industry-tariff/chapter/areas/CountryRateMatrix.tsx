'use client';

import { HIGH_RATE_PCT, rateEmphasis } from '@/components/industry-tariff/chapter/areas/rate-emphasis';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import Stack from '@/components/ui/containers/Stack';
import { DataTable, TableCell, TableHead, TableHeaderCell, TableRow, TableScroll } from '@/components/ui/tables/DataTable';
import SelectableMatrix, { type MatrixCellValue, type MatrixGroup, type MatrixRow, type MatrixSelection } from '@/components/ui/tables/SelectableMatrix';
import type { TariffIndustryAreasContent, TariffMatrixCellRates, TariffMatrixCountry, TariffUpdateSource } from '@/types/tariff-chapter-prototype';
import { compactNames, labelledTotals, listNames, type MatrixBreakdownLabels } from '@/utils/tariff-reports/line-labels';
import React, { useMemo, useState } from 'react';

// Country x product-group matrix of the total rate (Approach 2, issue #1770).
// Every cell is rendered on the server; the USMCA toggle and the cell
// selection only change what's highlighted and which breakdown is open. The
// breakdown opens in a modal (the matrix becomes a list on phones).

interface CountryRateMatrixProps {
  areas: TariffIndustryAreasContent;
  /** Section title + description, laid out beside the USMCA switch. */
  heading: React.ReactNode;
  /**
   * Product names per breakdown row (from `matrixBreakdownLabels`, computed on the server from the
   * chapter's rate table), so a cell with several rates says which product pays which. Without
   * it, cells show the bare totals.
   */
  breakdownLabels?: MatrixBreakdownLabels;
}

/** Cells list at most this many labelled rates; the rest show as "+N more". */
const MAX_CELL_ENTRIES = 3;

function usd(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return value > 0 ? `$${value.toFixed(0)}` : 'no trade';
}

function linesLabel(lines: string[]): string {
  if (lines.length === 1) return lines[0];
  return `${lines[0]} + ${lines.length - 1} more`;
}

/** Cell value for one set of rates: labelled rates when names are available, else the joined totals. */
function cellValue(rates: TariffMatrixCellRates, names: string[][] | undefined): Pick<MatrixCellValue, 'value' | 'entries' | 'moreEntries'> {
  const value = rates.totals.join(' · ');
  const labelled = labelledTotals(rates, names);
  if (!labelled) return { value };
  return {
    value,
    entries: labelled.slice(0, MAX_CELL_ENTRIES).map((t) => ({ label: compactNames(t.names), value: t.total, emphasis: rateEmphasis([t.total]) })),
    moreEntries: Math.max(0, labelled.length - MAX_CELL_ENTRIES),
  };
}

/** Full labelled line for the detail header, e.g. "Horses 10% · Asses 16.8% · HTS 0101.90.40 14.5%". */
function labelledSummary(rates: TariffMatrixCellRates, names: string[][] | undefined): string {
  const labelled = labelledTotals(rates, names);
  if (!labelled) return rates.totals.join(' · ');
  return labelled.map((t) => `${compactNames(t.names)} ${t.total}`.trim()).join(' · ');
}

export default function CountryRateMatrix({ areas, heading, breakdownLabels }: CountryRateMatrixProps): React.JSX.Element {
  const [usmcaClaimed, setUsmcaClaimed] = useState(true);
  // Open on the chapter's biggest lane, so the first breakdown shown is the one most readers need.
  const firstLane = areas.biggestLanes[0];
  const [selected, setSelected] = useState<MatrixSelection>({
    row: firstLane?.country ?? areas.countries[0]?.country ?? '',
    group: firstLane?.heading ?? areas.groups[0]?.heading ?? '',
  });
  const hasUsmca = areas.countries.some((c) => c.rule.kind === 'usmca');
  const sources = useMemo(() => new Map<string, TariffUpdateSource>(areas.sources.map((s) => [s.id, s])), [areas.sources]);
  const countryByName = useMemo(() => new Map(areas.countries.map((c) => [c.country, c])), [areas.countries]);

  const mode = usmcaClaimed ? 'withUsmca' : 'withoutUsmca';
  const country: TariffMatrixCountry | undefined = countryByName.get(selected.row);
  const group = areas.groups.find((g) => g.heading === selected.group);
  const cell = country?.cells[selected.group];
  const rates = cell?.[mode];
  const names = breakdownLabels?.[selected.row]?.[selected.group]?.[mode];
  const showProducts = Boolean(names?.some((n) => n.length > 0));

  const groups: MatrixGroup[] = areas.groups.map((g) => ({ key: g.heading, label: g.label, shortLabel: g.shortLabel }));
  // `atLeast` marks the "any other country" floor row: no single trade figure of its own.
  const rows: MatrixRow[] = areas.countries.map((c) => ({
    key: c.country,
    name: c.country,
    sub: c.rule.atLeast ? undefined : `${usd(c.importsUsd)} in ${areas.tradeYear}`,
    floor: c.rule.atLeast,
  }));

  const detailTitle =
    country && group
      ? `${country.country} · ${group.heading} ${group.label}${country.rule.kind === 'usmca' ? (usmcaClaimed ? ' · USMCA claimed' : ' · no USMCA claim') : ''}`
      : '';

  const detail =
    country && cell && rates ? (
      <Stack gap="md">
        <Text as="span" size="lg" weight="bold" tone={rateEmphasis(rates.totals) === 'high' ? 'warning' : 'white'}>
          {labelledSummary(rates, names)}
        </Text>
        <Text size="sm">
          {country.rule.label}
          {!country.rule.atLeast ? ` ${areas.tradeYear} imports: ${usd(cell.importsUsd)}.` : ''}
        </Text>
        <TableScroll>
          <DataTable>
            <TableHead look="plain">
              <TableRow>
                {showProducts && <TableHeaderCell>Products</TableHeaderCell>}
                <TableHeaderCell>Base rate</TableHeaderCell>
                <TableHeaderCell>Lines</TableHeaderCell>
                <TableHeaderCell>Extra duty</TableHeaderCell>
                <TableHeaderCell>Preference</TableHeaderCell>
                <TableHeaderCell>Total</TableHeaderCell>
              </TableRow>
            </TableHead>
            <tbody>
              {rates.breakdown.map((row, i) => (
                <TableRow key={`${row.base}-${row.lines[0]}`}>
                  {showProducts && <TableCell variant="note">{listNames(names?.[i] ?? [])}</TableCell>}
                  <TableCell variant="rate" tone="emphasis">
                    {row.base}
                  </TableCell>
                  <TableCell variant="code">
                    {linesLabel(row.lines)} ({row.lineCount} {row.lineCount === 1 ? 'line' : 'lines'})
                  </TableCell>
                  <TableCell variant="note">{row.extra}</TableCell>
                  <TableCell variant="rateWrap">{row.preference}</TableCell>
                  <TableCell variant="rateWrap" tone="emphasis">
                    {row.total}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </DataTable>
        </TableScroll>
        <Stack direction="row" gap="md" wrap>
          {country.rule.sourceIds.map((id) => {
            const source = sources.get(id);
            return source ? (
              <TextLink key={id} href={source.url} size="xs" wrap>
                {source.citation} ↗
              </TextLink>
            ) : null;
          })}
        </Stack>
      </Stack>
    ) : null;

  return (
    <Stack gap="lg">
      <Stack direction="row" gap="md" align="end" justify="between" wrap>
        {heading}
        {hasUsmca && (
          <ToggleSwitch label="Goods qualify for USMCA (North American trade deal)" checked={usmcaClaimed} onToggle={() => setUsmcaClaimed(!usmcaClaimed)} />
        )}
      </Stack>

      <Text size="xs" tone="muted">
        Rates in{' '}
        <Text as="span" size="xs" weight="semibold" tone="warning">
          amber
        </Text>{' '}
        include a duty of {HIGH_RATE_PCT}% or more; grey rates are Free.
      </Text>

      <SelectableMatrix
        rowHeader="Country of origin"
        groups={groups}
        rows={rows}
        cell={(row, g) => {
          const c = countryByName.get(row.key);
          const cv = c?.cells[g.key];
          if (!c || !cv) return { value: '—', emphasis: 'quiet' };
          return {
            ...cellValue(cv[mode], breakdownLabels?.[row.key]?.[g.key]?.[mode]),
            emphasis: rateEmphasis(cv[mode].totals),
            secondary: c.rule.atLeast ? undefined : usd(cv.importsUsd),
            dim: !c.rule.atLeast && cv.importsUsd === 0,
          };
        }}
        cellLabel={(row, g) => `${g.label} from ${row.name}`}
        selected={selected}
        onSelect={setSelected}
        detailTitle={detailTitle}
        detail={detail}
      />
    </Stack>
  );
}
