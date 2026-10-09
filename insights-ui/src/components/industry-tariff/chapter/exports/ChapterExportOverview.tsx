import { EXPORT_STATUS_BADGE, barWidth, change, usd } from '@/components/industry-tariff/chapter/exports/export-shared';
import ImportsByYearChart from '@/components/industry-tariff/chapter/industry/ImportsByYearChart';
import SourcesCard from '@/components/industry-tariff/chapter/updates/SourcesCard';
import ShareBar from '@/components/ui/ShareBar';
import StatusBadge from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import MetricGrid, { cardGridColumns } from '@/components/ui/containers/MetricGrid';
import Stack from '@/components/ui/containers/Stack';
import StatCardGrid from '@/components/ui/containers/StatCardGrid';
import CardSection from '@/components/ui/sections/CardSection';
import InlineCard from '@/components/ui/sections/InlineCard';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import { DataTable, EmptyCellValue, TableCell, TableHead, TableHeaderCell, TableRow, TableScroll } from '@/components/ui/tables/DataTable';
import type { TariffExportOverviewContent } from '@/types/tariff-chapter-exports';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import { chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import React from 'react';

// Export overview: how much of this chapter the U.S. sells abroad, to whom, what, and the tariff
// each top buyer charges. The detail lives on the export tariff-updates and markets pages. Laid
// out like the import pages: stat cards, numbered takeaways, then bordered cards.

export default function ChapterExportOverview({ overview }: { overview: TariffExportOverviewContent }): React.JSX.Element {
  const { chapter, latestYear, priorYear } = overview;
  const latestTotal = overview.byYear.find((y) => y.year === latestYear)?.totalUsd ?? 0;
  const othersSharePct = latestTotal ? (overview.othersExportsUsd / latestTotal) * 100 : null;
  const maxMarketShare = Math.max(...overview.topMarkets.map((m) => m.sharePct), othersSharePct ?? 0);
  const maxHeadingShare = Math.max(...overview.byHeading.map((h) => h.sharePct), 0);
  const maxLineShare = Math.max(...overview.byLine.map((l) => l.sharePct), 0);

  return (
    <Stack gap="2xl">
      {/* The page H1 and the "Rates as of" date are rendered by the ChapterArticle shell. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          {overview.byYear[0]?.year}–{latestYear} · {overview.valueBasis}
        </Text>
        <MarkdownContent variant="body" html={parseChapterBodyMarkdown(overview.intro)} />
      </Stack>

      <StatCardGrid stats={overview.stats} />

      <Stack as="section" gap="md">
        <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
          In short
        </SectionHeading>
        <MetricGrid columns={cardGridColumns(overview.keyTakeaways.length)} gap="lg">
          {overview.keyTakeaways.map((point, index) => (
            <InlineCard key={point} surface="card" padding="spacious" fill>
              <Stack direction="row" gap="md" align="start">
                <Text as="span" size="lg" weight="bold" tone="primary">
                  {index + 1}
                </Text>
                <Text size="base">{point}</Text>
              </Stack>
            </InlineCard>
          ))}
        </MetricGrid>
      </Stack>

      <CardSection padding="roomy" bordered>
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              Exports over time
            </SectionHeading>
            <Text size="sm" tone="muted">
              {overview.byYearCaption}
            </Text>
          </Stack>
          <ImportsByYearChart byYear={overview.byYear} partners={overview.byYearPartners} chapterTitle={chapter.title} flow="exports" />
        </Stack>
      </CardSection>

      <CardSection padding="roomy" bordered>
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              Who buys these goods from the U.S.
            </SectionHeading>
            <Text size="sm" tone="muted">
              The largest destinations and the tariff each charges on U.S.-origin goods today. Rates by product group are on{' '}
              <TextLink href={chapterSectionHref(chapter.slug, 'exports/markets')}>Export markets</TextLink>; what changed is on{' '}
              <TextLink href={chapterSectionHref(chapter.slug, 'exports/tariff-updates')}>Export tariff updates</TextLink>.
            </Text>
          </Stack>
          <TableScroll>
            <DataTable>
              <TableHead look="plain">
                <TableRow>
                  <TableHeaderCell>Country</TableHeaderCell>
                  <TableHeaderCell align="right">{latestYear}</TableHeaderCell>
                  <TableHeaderCell align="right">vs {priorYear}</TableHeaderCell>
                  <TableHeaderCell width="quarter">Share of {latestYear} exports</TableHeaderCell>
                  <TableHeaderCell>Tariff on U.S. goods now</TableHeaderCell>
                  <TableHeaderCell>Since Jan 2025</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {overview.topMarkets.map((m) => (
                  <TableRow key={m.countryCode}>
                    <TableCell tone="emphasis">{m.country}</TableCell>
                    <TableCell variant="rate" align="right" tone="emphasis">
                      {usd(m.exportsUsd)}
                    </TableCell>
                    <TableCell variant="rate" align="right">
                      {change(m.changePct) ?? <EmptyCellValue />}
                    </TableCell>
                    <TableCell>
                      <ShareBar tone="primary" widthPct={barWidth(m.sharePct, maxMarketShare)} label={`${m.sharePct.toFixed(1)}%`} />
                    </TableCell>
                    <TableCell variant="rateWrap" tone="primary">
                      {m.tariffNow}
                    </TableCell>
                    <TableCell variant="rate">
                      <StatusBadge variant={EXPORT_STATUS_BADGE[m.status].variant} size="sm" label={EXPORT_STATUS_BADGE[m.status].label} />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow emphasis="group">
                  <TableCell>All other countries</TableCell>
                  <TableCell variant="rate" align="right">
                    {usd(overview.othersExportsUsd)}
                  </TableCell>
                  <TableCell variant="rate" align="right">
                    {overview.othersPriorExportsUsd ? (
                      change(((overview.othersExportsUsd - overview.othersPriorExportsUsd) / overview.othersPriorExportsUsd) * 100)
                    ) : (
                      <EmptyCellValue />
                    )}
                  </TableCell>
                  <TableCell>
                    {othersSharePct !== null ? (
                      <ShareBar tone="primary" widthPct={barWidth(othersSharePct, maxMarketShare)} label={`${othersSharePct.toFixed(1)}%`} />
                    ) : (
                      <EmptyCellValue />
                    )}
                  </TableCell>
                  <TableCell variant="rate">
                    <EmptyCellValue />
                  </TableCell>
                  <TableCell variant="rate">
                    <EmptyCellValue />
                  </TableCell>
                </TableRow>
              </tbody>
            </DataTable>
          </TableScroll>
          <Text size="xs" tone="muted">
            {overview.coverageNote}
          </Text>
        </Stack>
      </CardSection>

      <CardSection padding="roomy" bordered>
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              What the U.S. sells
            </SectionHeading>
            <Text size="sm" tone="muted">
              U.S. exports by product group and the largest six-digit lines, {latestYear} vs {priorYear}.
            </Text>
          </Stack>
          <TableScroll>
            <DataTable>
              <TableHead look="plain">
                <TableRow>
                  <TableHeaderCell width="wide">Product group</TableHeaderCell>
                  <TableHeaderCell align="right">{latestYear}</TableHeaderCell>
                  <TableHeaderCell align="right">vs {priorYear}</TableHeaderCell>
                  <TableHeaderCell width="quarter">Share</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {overview.byHeading.map((h) => (
                  <TableRow key={h.heading}>
                    <TableCell>
                      <Text as="span" tone="primary" font="mono">
                        {h.heading}
                      </Text>{' '}
                      {h.label}
                    </TableCell>
                    <TableCell variant="rate" align="right" tone="emphasis">
                      {usd(h.exportsUsd)}
                    </TableCell>
                    <TableCell variant="rate" align="right">
                      {change(h.changePct) ?? <EmptyCellValue />}
                    </TableCell>
                    <TableCell>
                      <ShareBar tone="teal" widthPct={barWidth(h.sharePct, maxHeadingShare)} label={`${h.sharePct.toFixed(1)}%`} />
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </DataTable>
          </TableScroll>
          <TableScroll>
            <DataTable>
              <TableHead look="plain">
                <TableRow>
                  <TableHeaderCell>HS code</TableHeaderCell>
                  <TableHeaderCell width="wide">Product</TableHeaderCell>
                  <TableHeaderCell align="right">{latestYear}</TableHeaderCell>
                  <TableHeaderCell align="right">vs {priorYear}</TableHeaderCell>
                  <TableHeaderCell width="quarter">Share</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {overview.byLine.map((line) => (
                  <TableRow key={line.hs6}>
                    <TableCell variant="code" tone="primary">
                      {line.hs6}
                    </TableCell>
                    <TableCell>{line.description}</TableCell>
                    <TableCell variant="rate" align="right" tone="emphasis">
                      {usd(line.exportsUsd)}
                    </TableCell>
                    <TableCell variant="rate" align="right">
                      {change(line.changePct) ?? <EmptyCellValue />}
                    </TableCell>
                    <TableCell>
                      <ShareBar tone="teal" widthPct={barWidth(line.sharePct, maxLineShare)} label={`${line.sharePct.toFixed(1)}%`} />
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </DataTable>
          </TableScroll>
        </Stack>
      </CardSection>

      <CardSection padding="roomy" bordered>
        <Stack gap="md">
          <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
            Why the import rates don&apos;t apply here
          </SectionHeading>
          <MarkdownContent variant="body" html={parseChapterBodyMarkdown(overview.classificationNote)} />
        </Stack>
      </CardSection>

      <SourcesCard sources={overview.sources} />
    </Stack>
  );
}
