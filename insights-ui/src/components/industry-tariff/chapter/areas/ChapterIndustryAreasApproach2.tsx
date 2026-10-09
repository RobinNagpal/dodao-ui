import CountryRateMatrix from '@/components/industry-tariff/chapter/areas/CountryRateMatrix';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import { DataTable, TableCell, TableHead, TableHeaderCell, TableRow, TableScroll } from '@/components/ui/tables/DataTable';
import type { TariffChapterPrototype, TariffIndustryAreasContent } from '@/types/tariff-chapter-prototype';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import { chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import React from 'react';

// Approach 2 industry-areas page (issue #1770): the country x product-group
// matrix of the total rate, then the biggest trade lanes, then how the
// numbers were worked out.

interface ChapterIndustryAreasApproach2Props {
  content: TariffChapterPrototype;
  areas: TariffIndustryAreasContent;
}

function usd(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${(value / 1e3).toFixed(0)}K`;
}

export default function ChapterIndustryAreasApproach2({ content, areas }: ChapterIndustryAreasApproach2Props): React.JSX.Element {
  const { chapter } = content;
  const groupLabel = new Map(areas.groups.map((g) => [g.heading, g.label]));
  const hasUsmca = areas.countries.some((c) => c.rule.kind === 'usmca');

  return (
    <Stack gap="2xl">
      {/* The page H1 and the "Rates as of" date are rendered by the ChapterArticle shell. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          Rates from the HTSUS {areas.scheduleEdition} · trade values {areas.tradeYear}
        </Text>
        <MarkdownContent variant="body" html={parseChapterBodyMarkdown(areas.intro)} />
      </Stack>

      <CardSection padding="roomy" bordered id="rate-matrix">
        <CountryRateMatrix
          areas={areas}
          heading={
            <Stack gap="xs">
              <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
                Total rate by country and product group
              </SectionHeading>
              <Text size="sm" tone="muted">
                Each cell: the total rate, then {areas.tradeYear} imports. Select a cell to see how it adds up.
              </Text>
            </Stack>
          }
        />
      </CardSection>

      <CardSection padding="roomy" bordered>
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              The biggest trade lanes
            </SectionHeading>
            <Text size="sm" tone="muted">
              The largest country × product lanes in {areas.tradeYear}, with the rate each one faces now{hasUsmca ? ' (USMCA claimed)' : ''}. Full statistics
              are on <TextLink href={chapterSectionHref(chapter.slug, 'understand-industry')}>Understand industry</TextLink>.
            </Text>
          </Stack>
          <TableScroll>
            <DataTable>
              <TableHead look="plain">
                <TableRow>
                  <TableHeaderCell>Country</TableHeaderCell>
                  <TableHeaderCell width="wide">Product group</TableHeaderCell>
                  <TableHeaderCell align="right">{areas.tradeYear} imports</TableHeaderCell>
                  <TableHeaderCell>Total rate now</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {areas.biggestLanes.map((lane) => (
                  <TableRow key={`${lane.country}-${lane.heading}`}>
                    <TableCell tone="emphasis">{lane.country}</TableCell>
                    <TableCell>
                      <Text as="span" tone="primary" font="mono">
                        {lane.heading}
                      </Text>{' '}
                      {groupLabel.get(lane.heading) ?? ''}
                    </TableCell>
                    <TableCell align="right" tone="emphasis">
                      {usd(lane.importsUsd)}
                    </TableCell>
                    <TableCell tone="primary">{lane.totals.join(' · ')}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </DataTable>
          </TableScroll>
        </Stack>
      </CardSection>

      <CardSection padding="roomy" bordered>
        <Stack gap="md">
          <SectionHeading as="h2" size="md" weight="bold" tone="heading">
            How these rates are worked out
          </SectionHeading>
          <Stack as="ul" gap="sm">
            {areas.assumptions.map((note) => (
              <li key={note}>
                <Text size="sm" tone="muted">
                  {note}
                </Text>
              </li>
            ))}
          </Stack>
          <Stack direction="row" gap="md" wrap>
            {areas.sources.map((source) => (
              <TextLink key={source.id} href={source.url} size="xs" wrap>
                {source.citation} ↗
              </TextLink>
            ))}
          </Stack>
        </Stack>
      </CardSection>
    </Stack>
  );
}
