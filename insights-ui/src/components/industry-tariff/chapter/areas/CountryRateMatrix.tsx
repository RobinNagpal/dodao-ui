'use client';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import ToggleChip from '@/components/ui/ToggleChip';
import Stack from '@/components/ui/containers/Stack';
import InlineCard from '@/components/ui/sections/InlineCard';
import { DataTable, MatrixCellButton, TableCell, TableHead, TableHeaderCell, TableRow, TableScroll } from '@/components/ui/tables/DataTable';
import type { TariffIndustryAreasContent, TariffMatrixCountry, TariffUpdateSource } from '@/types/tariff-chapter-prototype';
import React, { useMemo, useState } from 'react';

// Country x product-group matrix of the total rate (Approach 2, issue #1770).
// Every cell is rendered on the server; the USMCA toggle and the cell
// selection only change what's highlighted and which breakdown is open.

interface CountryRateMatrixProps {
  areas: TariffIndustryAreasContent;
}

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

export default function CountryRateMatrix({ areas }: CountryRateMatrixProps): React.JSX.Element {
  const [usmcaClaimed, setUsmcaClaimed] = useState(true);
  // Open on the chapter's biggest lane, so the first breakdown shown is the one most readers need.
  const firstLane = areas.biggestLanes[0];
  const [selected, setSelected] = useState<{ country: string; heading: string }>({
    country: firstLane?.country ?? areas.countries[0]?.country ?? '',
    heading: firstLane?.heading ?? areas.groups[0]?.heading ?? '',
  });
  const hasUsmca = areas.countries.some((c) => c.rule.kind === 'usmca');
  const sources = useMemo(() => new Map<string, TariffUpdateSource>(areas.sources.map((s) => [s.id, s])), [areas.sources]);

  const mode = usmcaClaimed ? 'withUsmca' : 'withoutUsmca';
  const country: TariffMatrixCountry | undefined = areas.countries.find((c) => c.country === selected.country);
  const group = areas.groups.find((g) => g.heading === selected.heading);
  const cell = country?.cells[selected.heading];
  const rates = cell?.[mode];

  return (
    <Stack gap="lg">
      {hasUsmca && (
        <Stack direction="row" gap="sm" align="center" wrap>
          <ToggleChip label="Canada & Mexico claiming USMCA" active={usmcaClaimed} onToggle={() => setUsmcaClaimed(!usmcaClaimed)} />
          <Text as="span" size="xs" tone="muted">
            Turn off to see the rate for goods that don&apos;t qualify for USMCA.
          </Text>
        </Stack>
      )}

      <TableScroll>
        <DataTable>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Country of origin</TableHeaderCell>
              {areas.groups.map((g) => (
                <TableHeaderCell key={g.heading} title={g.label}>
                  {g.heading} {g.shortLabel}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <tbody>
            {areas.countries.map((c) => (
              <TableRow key={c.country} emphasis={c.country === 'Any other country' ? 'header' : 'normal'}>
                <TableCell>
                  <Stack gap="xxs">
                    <span>{c.country}</span>
                    <Text as="span" size="xs" tone="muted">
                      {usd(c.importsUsd)} in {areas.tradeYear}
                    </Text>
                  </Stack>
                </TableCell>
                {areas.groups.map((g) => {
                  const cv = c.cells[g.heading];
                  const isSelected = selected.country === c.country && selected.heading === g.heading;
                  return (
                    <TableCell key={g.heading}>
                      <MatrixCellButton
                        label={`${g.label} from ${c.country}`}
                        primary={cv[mode].totals.join(' · ')}
                        secondary={c.country === 'Any other country' ? undefined : usd(cv.importsUsd)}
                        selected={isSelected}
                        dim={c.country !== 'Any other country' && cv.importsUsd === 0}
                        onSelect={() => setSelected({ country: c.country, heading: g.heading })}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </tbody>
        </DataTable>
      </TableScroll>

      {country && group && cell && rates && (
        <InlineCard padding="roomy">
          <Stack gap="md">
            <Stack gap="xs">
              <Heading as="h3" size="md" tone="white">
                {group.label} ({group.heading}) from {country.country}
                {country.rule.kind === 'usmca' ? (usmcaClaimed ? ', claiming USMCA' : ', not claiming USMCA') : ''}
              </Heading>
              <Text size="sm" tone="muted">
                {country.rule.label}
                {country.country !== 'Any other country' ? ` ${areas.tradeYear} imports: ${usd(cell.importsUsd)}.` : ''}
              </Text>
            </Stack>
            <TableScroll>
              <DataTable>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Lines</TableHeaderCell>
                    <TableHeaderCell>Base rate</TableHeaderCell>
                    <TableHeaderCell>Extra duty</TableHeaderCell>
                    <TableHeaderCell>Preference</TableHeaderCell>
                    <TableHeaderCell>Total</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <tbody>
                  {rates.breakdown.map((row) => (
                    <TableRow key={`${row.base}-${row.lines[0]}`}>
                      <TableCell variant="code">
                        {linesLabel(row.lines)} ({row.lineCount} {row.lineCount === 1 ? 'line' : 'lines'})
                      </TableCell>
                      <TableCell variant="rate">{row.base}</TableCell>
                      <TableCell variant="rate">{row.extra}</TableCell>
                      <TableCell variant="rateWrap">{row.preference}</TableCell>
                      <TableCell variant="rate">{row.total}</TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </DataTable>
            </TableScroll>
            <Stack direction="row" gap="md" wrap>
              {country.rule.sourceIds.map((id) => {
                const source = sources.get(id);
                return source ? (
                  <TextLink key={id} href={source.url} size="xs">
                    {source.citation} ↗
                  </TextLink>
                ) : null;
              })}
            </Stack>
          </Stack>
        </InlineCard>
      )}
    </Stack>
  );
}
