'use client';

import { rateEmphasis } from '@/components/industry-tariff/chapter/areas/rate-emphasis';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
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
  /** Section title + description, laid out beside the USMCA switch. */
  heading: React.ReactNode;
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

export default function CountryRateMatrix({ areas, heading }: CountryRateMatrixProps): React.JSX.Element {
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
      <Stack direction="row" gap="md" align="end" justify="between" wrap>
        {heading}
        {hasUsmca && <ToggleSwitch label="USMCA claimed (Canada, Mexico)" checked={usmcaClaimed} onToggle={() => setUsmcaClaimed(!usmcaClaimed)} />}
      </Stack>

      <TableScroll>
        <DataTable>
          <TableHead look="plain">
            <TableRow>
              <TableHeaderCell pinned>Country of origin</TableHeaderCell>
              {areas.groups.map((g) => (
                <TableHeaderCell key={g.heading} title={g.label}>
                  <Stack gap="xxs">
                    <span>{g.shortLabel}</span>
                    <Text as="span" size="xs" tone="primary" font="mono">
                      {g.heading}
                    </Text>
                  </Stack>
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <tbody>
            {areas.countries.map((c) => (
              // `atLeast` marks the "any other country" floor row: no single trade figure of its own.
              <TableRow key={c.country} emphasis={c.rule.atLeast ? 'group' : 'normal'}>
                <TableCell pinned>
                  <Stack gap="xxs">
                    <Text as="span" weight="semibold" tone="white">
                      {c.country}
                    </Text>
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
                        emphasis={rateEmphasis(cv[mode].totals)}
                        secondary={c.rule.atLeast ? undefined : usd(cv.importsUsd)}
                        selected={isSelected}
                        dim={!c.rule.atLeast && cv.importsUsd === 0}
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
        <InlineCard surface="highlight" padding="spacious">
          <Stack gap="md">
            <Stack direction="row" gap="md" align="baseline" justify="between" wrap>
              <Heading as="h3" size="md" tone="white">
                {country.country} · {group.heading} {group.label}
                {country.rule.kind === 'usmca' ? (usmcaClaimed ? ' · USMCA claimed' : ' · no USMCA claim') : ''}
              </Heading>
              <Text as="span" size="base" weight="bold" tone="primary">
                {rates.totals.join(' · ')}
              </Text>
            </Stack>
            <Text size="sm">
              {country.rule.label}
              {!country.rule.atLeast ? ` ${areas.tradeYear} imports: ${usd(cell.importsUsd)}.` : ''}
            </Text>
            <TableScroll>
              <DataTable>
                <TableHead look="plain">
                  <TableRow>
                    <TableHeaderCell>Base rate</TableHeaderCell>
                    <TableHeaderCell>Lines</TableHeaderCell>
                    <TableHeaderCell>Extra duty</TableHeaderCell>
                    <TableHeaderCell>Preference</TableHeaderCell>
                    <TableHeaderCell>Total</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <tbody>
                  {rates.breakdown.map((row) => (
                    <TableRow key={`${row.base}-${row.lines[0]}`}>
                      <TableCell variant="rate" tone="emphasis">
                        {row.base}
                      </TableCell>
                      <TableCell variant="code">
                        {linesLabel(row.lines)} ({row.lineCount} {row.lineCount === 1 ? 'line' : 'lines'})
                      </TableCell>
                      <TableCell variant="note">{row.extra}</TableCell>
                      <TableCell variant="rateWrap">{row.preference}</TableCell>
                      <TableCell variant="rateWrap" tone="primary">
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
        </InlineCard>
      )}
    </Stack>
  );
}
