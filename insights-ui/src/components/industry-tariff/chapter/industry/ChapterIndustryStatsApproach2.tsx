import ImportsByYearChart from '@/components/industry-tariff/chapter/industry/ImportsByYearChart';
import MetricCell from '@/components/ui/MetricCell';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import MetricGrid from '@/components/ui/containers/MetricGrid';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import { DataTable, EmptyCellValue, TableCell, TableHead, TableHeaderCell, TableRow, TableScroll } from '@/components/ui/tables/DataTable';
import type { TariffChapterPrototype, TariffImportsByLine, TariffUnderstandIndustryContent } from '@/types/tariff-chapter-prototype';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import { chapterCoverHref, chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import React from 'react';

// Approach 2 understand-industry page (issue #1770): import statistics by
// country, by product and over time, plus the effective duty rate. Numbers
// first; the one prose block explains them.

interface ChapterIndustryStatsApproach2Props {
  content: TariffChapterPrototype;
  industry: TariffUnderstandIndustryContent;
}

// The product table lists the largest lines; the long tail of near-zero
// lines folds into one "All other products" row.
const TOP_LINES = 15;

function sum(lines: TariffImportsByLine[], key: 'importsUsd' | 'priorImportsUsd'): number {
  return lines.reduce((total, line) => total + (line[key] ?? 0), 0);
}

function usd(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function change(pct: number | null): string | null {
  if (pct === null) return null;
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
}

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export default function ChapterIndustryStatsApproach2({ content, industry }: ChapterIndustryStatsApproach2Props): React.JSX.Element {
  const { chapter } = content;
  const { latestYear, priorYear } = industry;
  const hasCountryDuty = industry.byCountry.some((c) => c.dutyPaidUsd !== null);
  const hasLineDuty = industry.byLine.some((l) => l.dutyPaidUsd !== null);
  const topLines = industry.byLine.slice(0, TOP_LINES);
  const otherLines = industry.byLine.slice(TOP_LINES);
  const totalLatest = sum(industry.byLine, 'importsUsd');
  const latestTotal = industry.byYear.find((y) => y.year === latestYear)?.totalUsd ?? 0;

  return (
    <Stack gap="2xl">
      {/* The page H1 is rendered by the ChapterArticle shell from `industry.h1`. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          {industry.byYear[0]?.year}–{latestYear} · {industry.valueBasis} · last checked {formatDate(industry.lastCheckedAt)}
        </Text>
        <MetricGrid columns="2-3-5" gap="md">
          {industry.stats.map((stat) => (
            <MetricCell key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </MetricGrid>
      </Stack>

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">Imports over time</SectionHeading>
            <Text size="sm" tone="muted">
              U.S. imports of Chapter {chapter.padded} goods each year, split into the two USMCA partners and everyone else.
            </Text>
          </Stack>
          <ImportsByYearChart byYear={industry.byYear} />
          <TableScroll>
            <DataTable>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Year</TableHeaderCell>
                  <TableHeaderCell>Canada</TableHeaderCell>
                  <TableHeaderCell>Mexico</TableHeaderCell>
                  <TableHeaderCell>Rest of world</TableHeaderCell>
                  <TableHeaderCell>Total</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {industry.byYear.map((y) => (
                  <TableRow key={y.year}>
                    <TableCell variant="code">{y.year}</TableCell>
                    <TableCell variant="rate">{usd(y.canadaUsd)}</TableCell>
                    <TableCell variant="rate">{usd(y.mexicoUsd)}</TableCell>
                    <TableCell variant="rate">{usd(y.restUsd)}</TableCell>
                    <TableCell variant="rate">{usd(y.totalUsd)}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </DataTable>
          </TableScroll>
        </Stack>
      </CardSection>

      <CardSection padding="normal">
        <Stack gap="lg">
          <SectionHeading as="h2">What the numbers say</SectionHeading>
          <MarkdownContent variant="body" html={parseChapterBodyMarkdown(industry.why)} />
        </Stack>
      </CardSection>

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">By country, {latestYear}</SectionHeading>
            <Text size="sm" tone="muted">
              The top {industry.byCountry.length} source countries. For the rate each country pays by product group, see{' '}
              <TextLink href={chapterSectionHref(chapter.slug, 'industry-areas')}>Industry areas</TextLink>.
            </Text>
          </Stack>
          <TableScroll>
            <DataTable>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Country</TableHeaderCell>
                  <TableHeaderCell>Imports {latestYear}</TableHeaderCell>
                  <TableHeaderCell>Share</TableHeaderCell>
                  <TableHeaderCell>{priorYear}</TableHeaderCell>
                  <TableHeaderCell>Change</TableHeaderCell>
                  <TableHeaderCell>Biggest product group</TableHeaderCell>
                  {hasCountryDuty && <TableHeaderCell>Duty paid</TableHeaderCell>}
                </TableRow>
              </TableHead>
              <tbody>
                {industry.byCountry.map((c) => (
                  <TableRow key={c.countryCode}>
                    <TableCell>{c.country}</TableCell>
                    <TableCell variant="rate">{usd(c.importsUsd)}</TableCell>
                    <TableCell variant="rate">{c.sharePct.toFixed(1)}%</TableCell>
                    <TableCell variant="rate" tone="muted">
                      {usd(c.priorImportsUsd)}
                    </TableCell>
                    <TableCell variant="rate">{change(c.changePct) ?? <EmptyCellValue />}</TableCell>
                    <TableCell variant="rate" tone="muted">
                      {c.mainHeading ? `${c.mainHeading} ${c.mainHeadingLabel ?? ''}` : <EmptyCellValue />}
                    </TableCell>
                    {hasCountryDuty && <TableCell variant="rate">{c.dutyPaidUsd !== null ? usd(c.dutyPaidUsd) : <EmptyCellValue />}</TableCell>}
                  </TableRow>
                ))}
                <TableRow emphasis="header">
                  <TableCell>All other countries</TableCell>
                  <TableCell variant="rate">{usd(industry.othersImportsUsd)}</TableCell>
                  <TableCell variant="rate">{latestTotal ? `${((industry.othersImportsUsd / latestTotal) * 100).toFixed(1)}%` : <EmptyCellValue />}</TableCell>
                  <TableCell variant="rate" tone="muted">
                    {usd(industry.othersPriorImportsUsd)}
                  </TableCell>
                  <TableCell variant="rate">
                    {industry.othersPriorImportsUsd ? (
                      change(((industry.othersImportsUsd - industry.othersPriorImportsUsd) / industry.othersPriorImportsUsd) * 100)
                    ) : (
                      <EmptyCellValue />
                    )}
                  </TableCell>
                  <TableCell variant="rate">
                    <EmptyCellValue />
                  </TableCell>
                  {hasCountryDuty && (
                    <TableCell variant="rate">
                      <EmptyCellValue />
                    </TableCell>
                  )}
                </TableRow>
              </tbody>
            </DataTable>
          </TableScroll>
        </Stack>
      </CardSection>

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">By product, {latestYear}</SectionHeading>
            <Text size="sm" tone="muted">
              Imports by 6-digit product, largest first. These are the international 6-digit codes; each covers one or more of the 10-digit lines on the{' '}
              <TextLink href={chapterCoverHref(chapter.slug)}>rate table</TextLink>.
            </Text>
          </Stack>
          <TableScroll maxHeight="lg">
            <DataTable>
              <TableHead sticky>
                <TableRow>
                  <TableHeaderCell>HS code</TableHeaderCell>
                  <TableHeaderCell width="wide">Product</TableHeaderCell>
                  <TableHeaderCell>Imports {latestYear}</TableHeaderCell>
                  <TableHeaderCell>Share</TableHeaderCell>
                  <TableHeaderCell>{priorYear}</TableHeaderCell>
                  <TableHeaderCell>Change</TableHeaderCell>
                  {hasLineDuty && <TableHeaderCell>Duty paid</TableHeaderCell>}
                </TableRow>
              </TableHead>
              <tbody>
                {topLines.map((line) => (
                  <TableRow key={line.hs6}>
                    <TableCell variant="code">{line.hs6}</TableCell>
                    <TableCell>{line.description}</TableCell>
                    <TableCell variant="rate">{usd(line.importsUsd)}</TableCell>
                    <TableCell variant="rate">{line.sharePct !== null ? `${line.sharePct.toFixed(1)}%` : <EmptyCellValue />}</TableCell>
                    <TableCell variant="rate" tone="muted">
                      {usd(line.priorImportsUsd)}
                    </TableCell>
                    <TableCell variant="rate">{change(line.changePct) ?? <EmptyCellValue />}</TableCell>
                    {hasLineDuty && <TableCell variant="rate">{line.dutyPaidUsd !== null ? usd(line.dutyPaidUsd) : <EmptyCellValue />}</TableCell>}
                  </TableRow>
                ))}
                {otherLines.length > 0 && (
                  <TableRow emphasis="header">
                    <TableCell tone="muted">—</TableCell>
                    <TableCell>All other products ({otherLines.length})</TableCell>
                    <TableCell variant="rate">{usd(sum(otherLines, 'importsUsd'))}</TableCell>
                    <TableCell variant="rate">{`${((sum(otherLines, 'importsUsd') / totalLatest) * 100).toFixed(1)}%`}</TableCell>
                    <TableCell variant="rate" tone="muted">
                      {usd(sum(otherLines, 'priorImportsUsd'))}
                    </TableCell>
                    <TableCell variant="rate">
                      <EmptyCellValue />
                    </TableCell>
                    {hasLineDuty && (
                      <TableCell variant="rate">
                        <EmptyCellValue />
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </tbody>
            </DataTable>
          </TableScroll>
        </Stack>
      </CardSection>

      <Stack gap="xs">
        <Text size="xs" tone="muted">
          {industry.coverageNote}
        </Text>
        <Stack direction="row" gap="md" wrap>
          {industry.sources.map((source) =>
            source.url ? (
              <TextLink key={source.label} href={source.url} size="xs">
                {source.label} ↗
              </TextLink>
            ) : (
              <Text key={source.label} as="span" size="xs" tone="muted">
                {source.label}
              </Text>
            )
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
