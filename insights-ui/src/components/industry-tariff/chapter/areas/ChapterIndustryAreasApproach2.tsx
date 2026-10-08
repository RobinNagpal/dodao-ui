import CountryRateMatrix from '@/components/industry-tariff/chapter/areas/CountryRateMatrix';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import InlineCard from '@/components/ui/sections/InlineCard';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import SectionHeading from '@/components/ui/sections/SectionHeading';
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

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export default function ChapterIndustryAreasApproach2({ content, areas }: ChapterIndustryAreasApproach2Props): React.JSX.Element {
  const { chapter } = content;
  const groupLabel = new Map(areas.groups.map((g) => [g.heading, g.label]));
  const hasUsmca = areas.countries.some((c) => c.rule.kind === 'usmca');

  return (
    <Stack gap="2xl">
      {/* The page H1 is rendered by the ChapterArticle shell from `areas.h1`. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          Rates from the HTSUS {areas.scheduleEdition} · trade values {areas.tradeYear} · last checked {formatDate(areas.lastCheckedAt)}
        </Text>
        <MarkdownContent variant="body" html={parseChapterBodyMarkdown(areas.intro)} />
      </Stack>

      <CardSection padding="normal" id="rate-matrix">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">Total rate by country and product group</SectionHeading>
            <Text size="sm" tone="muted">
              Base rate + extra duty − preference, for the {areas.countries.length - 1} largest source countries and everyone else. Under each rate:{' '}
              {areas.tradeYear} imports. Select a cell to see how it adds up.
            </Text>
          </Stack>
          <CountryRateMatrix areas={areas} />
        </Stack>
      </CardSection>

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">Where the trade actually is</SectionHeading>
            <Text size="sm" tone="muted">
              The largest country × product lanes in {areas.tradeYear}, with the rate that applies{hasUsmca ? ' (USMCA claimed)' : ''}. Full statistics are on{' '}
              <TextLink href={chapterSectionHref(chapter.slug, 'understand-industry')}>Understand industry</TextLink>.
            </Text>
          </Stack>
          <Stack gap="sm">
            {areas.biggestLanes.map((lane, index) => (
              <InlineCard key={`${lane.country}-${lane.heading}`} padding="snug">
                <Stack direction="row" gap="md" align="center" justify="between" wrap>
                  <Text size="sm">
                    {index + 1}. {lane.country} × {groupLabel.get(lane.heading) ?? lane.heading} ({lane.heading})
                  </Text>
                  <Stack direction="row" gap="lg" align="center">
                    <Text as="span" size="sm" tone="muted">
                      {usd(lane.importsUsd)}
                    </Text>
                    <Text as="span" size="sm" weight="semibold">
                      {lane.totals.join(' · ')}
                    </Text>
                  </Stack>
                </Stack>
              </InlineCard>
            ))}
          </Stack>
        </Stack>
      </CardSection>

      <CardSection padding="normal">
        <Stack gap="md">
          <SectionHeading as="h2">How these rates are worked out</SectionHeading>
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
              <TextLink key={source.id} href={source.url} size="xs">
                {source.citation} ↗
              </TextLink>
            ))}
          </Stack>
        </Stack>
      </CardSection>
    </Stack>
  );
}
