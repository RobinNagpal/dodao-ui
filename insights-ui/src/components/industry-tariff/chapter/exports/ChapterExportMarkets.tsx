import ExportRateMatrix from '@/components/industry-tariff/chapter/exports/ExportRateMatrix';
import { EXPORT_STATUS_BADGE, change, usd } from '@/components/industry-tariff/chapter/exports/export-shared';
import SourcesCard, { documentSourceItems } from '@/components/industry-tariff/chapter/updates/SourcesCard';
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
// naming the regulator whose approval decides whether the product can be sold. Laid out like the
// import rates-by-country page: the matrix is the one boxed section, the rest sits on the page.

export default function ChapterExportMarkets({ markets }: { markets: TariffExportMarketsContent }): React.JSX.Element {
  const groupLabel = new Map(markets.groups.map((g) => [g.heading, g.label]));

  return (
    <Stack gap="2xl">
      {/* The page H1 and the "Rates as of" date are rendered by the ChapterArticle shell. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          Trade values {markets.tradeYear} · tariff schedules {markets.tariffYear}
        </Text>
        <MarkdownContent variant="body" html={parseChapterBodyMarkdown(markets.intro)} />
      </Stack>

      <CardSection padding="roomy" bordered>
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              Tariff on U.S. goods by destination and product group
            </SectionHeading>
            <Text size="sm" tone="muted">
              Each cell: the destination&apos;s tariff on U.S.-origin goods, then {markets.tradeYear} U.S. exports. Select a cell to see where the rate comes
              from.
            </Text>
          </Stack>
          <ExportRateMatrix markets={markets} />
        </Stack>
      </CardSection>

      <Stack as="section" gap="lg">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              Where the trade actually is
            </SectionHeading>
            <Text size="sm" tone="muted">
              The largest destination × product lanes in {markets.tradeYear}, with the tariff that applies.
            </Text>
          </Stack>
          <TableScroll>
            <DataTable>
              <TableHead look="plain">
                <TableRow>
                  <TableHeaderCell>Destination</TableHeaderCell>
                  <TableHeaderCell width="wide">Product group</TableHeaderCell>
                  <TableHeaderCell align="right">{markets.tradeYear} exports</TableHeaderCell>
                  <TableHeaderCell>Tariff on U.S. goods</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {markets.biggestLanes.map((lane) => (
                  <TableRow key={`${lane.country}-${lane.heading}`}>
                    <TableCell tone="emphasis">{lane.country}</TableCell>
                    <TableCell>
                      <Text as="span" tone="primary" font="mono">
                        {lane.heading}
                      </Text>{' '}
                      {groupLabel.get(lane.heading) ?? ''}
                    </TableCell>
                    <TableCell align="right" tone="emphasis">
                      {usd(lane.exportsUsd)}
                    </TableCell>
                    <TableCell tone="emphasis">{lane.rate}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </DataTable>
          </TableScroll>
        </Stack>
      </Stack>

      <Stack as="section" gap="lg">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              Market by market
            </SectionHeading>
            <Text size="sm" tone="muted">
              What each destination buys, what it charges and whose approval is needed to sell there.
            </Text>
          </Stack>
          <MetricGrid columns="1-2" gap="lg">
            {markets.countries.map((c) => {
              const badge = EXPORT_STATUS_BADGE[c.status];
              return (
                <InlineCard key={c.countryCode} surface="card" padding="spacious" fill>
                  <Stack gap="sm">
                    <Stack direction="row" gap="sm" align="center" justify="between" wrap>
                      <Heading as="h3" size="lg" tone="white">
                        {c.country}
                      </Heading>
                      <StatusBadge variant={badge.variant} size="sm" label={badge.label} />
                    </Stack>
                    <Text size="xs" tone="muted">
                      {usd(c.exportsUsd)} in {markets.tradeYear} ({change(c.changePct) ?? 'n/a'}) · {c.sharePct.toFixed(1)}% of U.S. exports
                    </Text>
                    <Text size="sm" weight="semibold" tone="white">
                      Tariff:{' '}
                      <Text as="span" size="sm" weight="semibold" tone="white">
                        {c.profile.tariffNow}
                      </Text>
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
                      <TextLink href={c.profile.regulator.url} size="xs" wrap>
                        {c.profile.regulator.name} ↗
                      </TextLink>
                    </Text>
                  </Stack>
                </InlineCard>
              );
            })}
          </MetricGrid>
        </Stack>
      </Stack>

      <Stack as="section" gap="lg">
        <Stack gap="md">
          <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
            Why the U.S. both buys and sells these goods
          </SectionHeading>
          <MarkdownContent variant="body" html={parseChapterBodyMarkdown(markets.why)} />
        </Stack>
      </Stack>

      <Stack as="section" gap="lg">
        <Stack gap="md">
          <SectionHeading as="h2" size="md" weight="bold" tone="heading">
            How these rates are worked out
          </SectionHeading>
          <Stack as="ul" gap="sm">
            {markets.assumptions.map((note) => (
              <li key={note}>
                <Text size="sm" tone="muted">
                  {note}
                </Text>
              </li>
            ))}
          </Stack>
        </Stack>
      </Stack>

      <SourcesCard items={documentSourceItems(markets.sources)} />
    </Stack>
  );
}
