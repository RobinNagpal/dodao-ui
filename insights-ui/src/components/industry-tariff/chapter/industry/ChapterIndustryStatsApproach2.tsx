import ImportsByYearChart from '@/components/industry-tariff/chapter/industry/ImportsByYearChart';
import SourcesCard, { labeledSourceItems } from '@/components/industry-tariff/chapter/updates/SourcesCard';
import ShareBar from '@/components/ui/ShareBar';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import Stack from '@/components/ui/containers/Stack';
import StatCardGrid from '@/components/ui/containers/StatCardGrid';
import CardSection from '@/components/ui/sections/CardSection';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import { DataTable, EmptyCellValue, TableCell, TableHead, TableHeaderCell, TableRow, TableScroll } from '@/components/ui/tables/DataTable';
import type { TariffChapterPrototype, TariffImportsByLine, TariffUnderstandIndustryContent } from '@/types/tariff-chapter-prototype';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import { approach2SectionLabel, chapterCoverHref, chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import React from 'react';

// Approach 2 understand-industry page (issue #1770): import statistics by
// country, by product and over time, plus the effective duty rate. Numbers
// first; the one prose block explains them. The chart is the page's one boxed
// section; the tables and prose sit straight on the page.

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

/** A share bar's length, scaled so the largest row in its table fills the track. */
function barWidth(sharePct: number, maxSharePct: number): number {
  return maxSharePct > 0 ? (sharePct / maxSharePct) * 100 : 0;
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
  const othersSharePct = latestTotal ? (industry.othersImportsUsd / latestTotal) * 100 : null;
  const otherLinesSharePct = totalLatest > 0 ? (sum(otherLines, 'importsUsd') / totalLatest) * 100 : null;
  const maxCountryShare = Math.max(...industry.byCountry.map((c) => c.sharePct), othersSharePct ?? 0);
  const maxLineShare = Math.max(...topLines.map((l) => l.sharePct ?? 0), otherLinesSharePct ?? 0);

  return (
    <Stack gap="2xl">
      {/* The page H1 and the "Rates as of" date are rendered by the ChapterArticle shell. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          {industry.byYear[0]?.year}–{latestYear} · {industry.valueBasis}
        </Text>
        <StatCardGrid stats={industry.stats} />
      </Stack>

      <Stack as="section" gap="lg">
        <Stack gap="md">
          <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
            Why imports moved
          </SectionHeading>
          <MarkdownContent variant="body" html={parseChapterBodyMarkdown(industry.why)} />
        </Stack>
      </Stack>

      <CardSection padding="roomy" bordered>
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              Imports over time
            </SectionHeading>
            <Text size="sm" tone="muted">
              {industry.byYearCaption}
            </Text>
          </Stack>
          <ImportsByYearChart byYear={industry.byYear} partners={industry.byYearPartners} chapterTitle={chapter.title} />
          <TableScroll>
            <DataTable>
              <TableHead look="plain">
                <TableRow>
                  <TableHeaderCell>Year</TableHeaderCell>
                  <TableHeaderCell align="right">{industry.byYearPartners[0]}</TableHeaderCell>
                  <TableHeaderCell align="right">{industry.byYearPartners[1]}</TableHeaderCell>
                  <TableHeaderCell align="right">Rest of world</TableHeaderCell>
                  <TableHeaderCell align="right">Total</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {industry.byYear.map((y) => (
                  <TableRow key={y.year}>
                    <TableCell variant="code">{y.year}</TableCell>
                    <TableCell variant="rate" align="right">
                      {usd(y.partnerAUsd)}
                    </TableCell>
                    <TableCell variant="rate" align="right">
                      {usd(y.partnerBUsd)}
                    </TableCell>
                    <TableCell variant="rate" align="right">
                      {usd(y.restUsd)}
                    </TableCell>
                    <TableCell variant="rate" align="right" tone="emphasis">
                      {usd(y.totalUsd)}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </DataTable>
          </TableScroll>
        </Stack>
      </CardSection>

      <Stack as="section" gap="lg">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              By country, {latestYear}
            </SectionHeading>
            <Text size="sm" tone="muted">
              The top {industry.byCountry.length} source countries. For the rate each country pays by product group, see{' '}
              <TextLink href={chapterSectionHref(chapter.slug, 'industry-areas')}>{approach2SectionLabel('industry-areas')}</TextLink>.
            </Text>
          </Stack>
          <TableScroll>
            <DataTable>
              <TableHead look="plain">
                <TableRow>
                  <TableHeaderCell>Country</TableHeaderCell>
                  <TableHeaderCell align="right">{latestYear}</TableHeaderCell>
                  <TableHeaderCell align="right">vs {priorYear}</TableHeaderCell>
                  <TableHeaderCell width="wide">Share of {latestYear} imports</TableHeaderCell>
                  <TableHeaderCell>Biggest product group</TableHeaderCell>
                  {hasCountryDuty && <TableHeaderCell>Duty paid</TableHeaderCell>}
                </TableRow>
              </TableHead>
              <tbody>
                {industry.byCountry.map((c) => (
                  <TableRow key={c.countryCode}>
                    <TableCell tone="emphasis">{c.country}</TableCell>
                    <TableCell variant="rate" align="right" tone="emphasis">
                      {usd(c.importsUsd)}
                    </TableCell>
                    <TableCell variant="rate" align="right">
                      {change(c.changePct) ?? <EmptyCellValue />}
                    </TableCell>
                    <TableCell>
                      <ShareBar tone="sky" widthPct={barWidth(c.sharePct, maxCountryShare)} label={`${c.sharePct.toFixed(1)}%`} />
                    </TableCell>
                    <TableCell variant="note">{c.mainHeading ? `${c.mainHeading} ${c.mainHeadingLabel ?? ''}` : <EmptyCellValue />}</TableCell>
                    {hasCountryDuty && <TableCell variant="rate">{c.dutyPaidUsd !== null ? usd(c.dutyPaidUsd) : <EmptyCellValue />}</TableCell>}
                  </TableRow>
                ))}
                <TableRow emphasis="group">
                  <TableCell>All other countries</TableCell>
                  <TableCell variant="rate" align="right">
                    {usd(industry.othersImportsUsd)}
                  </TableCell>
                  <TableCell variant="rate" align="right">
                    {industry.othersPriorImportsUsd ? (
                      change(((industry.othersImportsUsd - industry.othersPriorImportsUsd) / industry.othersPriorImportsUsd) * 100)
                    ) : (
                      <EmptyCellValue />
                    )}
                  </TableCell>
                  <TableCell>
                    {othersSharePct !== null ? (
                      <ShareBar tone="sky" widthPct={barWidth(othersSharePct, maxCountryShare)} label={`${othersSharePct.toFixed(1)}%`} />
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
      </Stack>

      <Stack as="section" gap="lg">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              By product, {latestYear}
            </SectionHeading>
            <Text size="sm" tone="muted">
              Imports by 6-digit product, largest first. These are the international 6-digit codes; each covers one or more of the 10-digit lines on the{' '}
              <TextLink href={chapterCoverHref(chapter.slug)}>{approach2SectionLabel('overview')}</TextLink> page.
            </Text>
          </Stack>
          <TableScroll pageSticky>
            <DataTable>
              <TableHead sticky look="plain">
                <TableRow>
                  <TableHeaderCell>HS code</TableHeaderCell>
                  <TableHeaderCell width="wide">Product</TableHeaderCell>
                  <TableHeaderCell align="right">{latestYear}</TableHeaderCell>
                  <TableHeaderCell align="right">vs {priorYear}</TableHeaderCell>
                  <TableHeaderCell width="quarter">Share</TableHeaderCell>
                  {hasLineDuty && <TableHeaderCell>Duty paid</TableHeaderCell>}
                </TableRow>
              </TableHead>
              <tbody>
                {topLines.map((line) => (
                  <TableRow key={line.hs6}>
                    <TableCell variant="code" tone="primary">
                      {line.hs6}
                    </TableCell>
                    <TableCell>{line.description}</TableCell>
                    <TableCell variant="rate" align="right" tone="emphasis">
                      {usd(line.importsUsd)}
                    </TableCell>
                    <TableCell variant="rate" align="right">
                      {change(line.changePct) ?? <EmptyCellValue />}
                    </TableCell>
                    <TableCell>
                      {line.sharePct !== null ? (
                        <ShareBar tone="teal" widthPct={barWidth(line.sharePct, maxLineShare)} label={`${line.sharePct.toFixed(1)}%`} />
                      ) : (
                        <EmptyCellValue />
                      )}
                    </TableCell>
                    {hasLineDuty && <TableCell variant="rate">{line.dutyPaidUsd !== null ? usd(line.dutyPaidUsd) : <EmptyCellValue />}</TableCell>}
                  </TableRow>
                ))}
                {otherLines.length > 0 && (
                  <TableRow emphasis="group">
                    <TableCell tone="muted">—</TableCell>
                    <TableCell>All other products ({otherLines.length})</TableCell>
                    <TableCell variant="rate" align="right">
                      {usd(sum(otherLines, 'importsUsd'))}
                    </TableCell>
                    <TableCell variant="rate" align="right">
                      <EmptyCellValue />
                    </TableCell>
                    <TableCell>
                      {otherLinesSharePct !== null ? (
                        <ShareBar tone="teal" widthPct={barWidth(otherLinesSharePct, maxLineShare)} label={`${otherLinesSharePct.toFixed(1)}%`} />
                      ) : (
                        <EmptyCellValue />
                      )}
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
      </Stack>

      <SourcesCard items={labeledSourceItems(industry.sources)} intro={industry.coverageNote} />
    </Stack>
  );
}
