import { EXPORT_STATUS_BADGE, ExportSources, change, formatDate, usd } from '@/components/industry-tariff/chapter/exports/export-shared';
import Heading from '@/components/ui/Heading';
import StatusBadge from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import MetricGrid from '@/components/ui/containers/MetricGrid';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import InlineCard from '@/components/ui/sections/InlineCard';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import { DataTable, TableCell, TableHead, TableHeaderCell, TableRow, TableScroll } from '@/components/ui/tables/DataTable';
import type { TariffExportMarketsContent } from '@/types/tariff-chapter-exports';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import React from 'react';

// Export markets: destination × product-group matrix of the tariff each buyer charges on U.S.
// goods (next to what the U.S. shipped there), the biggest lanes, and a short profile per market
// naming the regulator whose approval decides whether the product can be sold.

export default function ChapterExportMarkets({ markets }: { markets: TariffExportMarketsContent }): React.JSX.Element {
  const groupLabel = new Map(markets.groups.map((g) => [g.heading, g.label]));

  return (
    <Stack gap="2xl">
      {/* The page H1 is rendered by the ChapterArticle shell from `markets.page.h1`. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          Trade values {markets.tradeYear} · tariff schedules {markets.tariffYear} · last checked {formatDate(markets.page.lastCheckedAt)}
        </Text>
        <MarkdownContent variant="body" html={parseChapterBodyMarkdown(markets.intro)} />
      </Stack>

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">Tariff on U.S. goods by destination and product group</SectionHeading>
            <Text size="sm" tone="muted">
              Each cell: the destination&apos;s tariff on U.S.-origin goods, the {markets.tradeYear} U.S. exports in that group, and the rate&apos;s source.
            </Text>
          </Stack>
          <TableScroll>
            <DataTable>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Destination</TableHeaderCell>
                  {markets.groups.map((g) => (
                    <TableHeaderCell key={g.heading} title={g.label}>
                      {g.heading} {g.shortLabel}
                    </TableHeaderCell>
                  ))}
                </TableRow>
              </TableHead>
              <tbody>
                {markets.countries.map((c) => (
                  <TableRow key={c.countryCode}>
                    <TableCell>
                      <Stack gap="xxs">
                        <span>{c.country}</span>
                        <Text as="span" size="xs" tone="muted">
                          {usd(c.exportsUsd)} in {markets.tradeYear}
                        </Text>
                      </Stack>
                    </TableCell>
                    {markets.groups.map((g) => {
                      const cell = c.cells[g.heading];
                      return (
                        <TableCell key={g.heading} variant="rateWrap">
                          <Stack gap="xxs">
                            <Text as="span" size="xs" weight="semibold">
                              {cell.rate}
                            </Text>
                            <Text as="span" size="xs" tone="muted">
                              {usd(cell.exportsUsd)}
                            </Text>
                          </Stack>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </tbody>
            </DataTable>
          </TableScroll>
          <Stack as="ul" gap="xs">
            {markets.assumptions.map((assumption) => (
              <li key={assumption}>
                <Text size="xs" tone="muted">
                  {assumption}
                </Text>
              </li>
            ))}
          </Stack>
        </Stack>
      </CardSection>

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">Where the trade actually is</SectionHeading>
            <Text size="sm" tone="muted">
              The largest destination × product lanes in {markets.tradeYear}, with the tariff that applies.
            </Text>
          </Stack>
          <Stack gap="sm">
            {markets.biggestLanes.map((lane, index) => (
              <InlineCard key={`${lane.country}-${lane.heading}`} padding="snug">
                <Stack direction="row" gap="md" align="center" justify="between" wrap>
                  <Text size="sm">
                    {index + 1}. {lane.country} × {groupLabel.get(lane.heading) ?? lane.heading} ({lane.heading})
                  </Text>
                  <Text as="span" size="sm" weight="semibold">
                    {usd(lane.exportsUsd)} · {lane.rate}
                  </Text>
                </Stack>
              </InlineCard>
            ))}
          </Stack>
        </Stack>
      </CardSection>

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">Market by market</SectionHeading>
            <Text size="sm" tone="muted">
              What each destination buys, what it charges and whose approval is needed to sell there.
            </Text>
          </Stack>
          <MetricGrid columns="1-2-3" gap="md">
            {markets.countries.map((c) => {
              const badge = EXPORT_STATUS_BADGE[c.status];
              return (
                <InlineCard key={c.countryCode} padding="roomy">
                  <Stack gap="sm">
                    <Stack direction="row" gap="sm" align="center" justify="between" wrap>
                      <Heading as="h3" size="md" tone="white">
                        {c.country}
                      </Heading>
                      <StatusBadge variant={badge.variant} size="sm" label={badge.label} />
                    </Stack>
                    <Text size="xs" tone="muted">
                      {usd(c.exportsUsd)} in {markets.tradeYear} ({change(c.changePct) ?? 'n/a'}) · {c.sharePct.toFixed(1)}% of U.S. exports
                    </Text>
                    <Text size="sm" weight="semibold">
                      Tariff: {c.profile.tariffNow}
                    </Text>
                    <Text size="xs" tone="muted">
                      {c.rule}
                    </Text>
                    <Text size="sm">{c.profile.headline}</Text>
                    <Text size="xs" tone="muted">
                      Buys mostly: {c.profile.mainProducts}
                    </Text>
                    <Text size="xs">
                      To sell there: {c.profile.regulator.requirement}{' '}
                      <TextLink href={c.profile.regulator.url} size="xs">
                        {c.profile.regulator.name} ↗
                      </TextLink>
                    </Text>
                  </Stack>
                </InlineCard>
              );
            })}
          </MetricGrid>
        </Stack>
      </CardSection>

      <CardSection padding="normal">
        <Stack gap="md">
          <SectionHeading as="h2">Why the U.S. both buys and sells these goods</SectionHeading>
          <MarkdownContent variant="body" html={parseChapterBodyMarkdown(markets.why)} />
        </Stack>
      </CardSection>

      <ExportSources sources={markets.sources} />
    </Stack>
  );
}
