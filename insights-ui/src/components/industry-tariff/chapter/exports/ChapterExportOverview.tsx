import { EXPORT_STATUS_BADGE, ExportSources, change, formatDate, usd } from '@/components/industry-tariff/chapter/exports/export-shared';
import ImportsByYearChart from '@/components/industry-tariff/chapter/industry/ImportsByYearChart';
import MetricCell from '@/components/ui/MetricCell';
import StatusBadge from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import MetricGrid from '@/components/ui/containers/MetricGrid';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import { DataTable, EmptyCellValue, TableCell, TableHead, TableHeaderCell, TableRow, TableScroll } from '@/components/ui/tables/DataTable';
import type { TariffExportOverviewContent } from '@/types/tariff-chapter-exports';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import { chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import React from 'react';

// Export overview: how much of this chapter the U.S. sells abroad, to whom, what, and the tariff
// each top buyer charges. The detail lives on the export tariff-updates and markets pages.

export default function ChapterExportOverview({ overview }: { overview: TariffExportOverviewContent }): React.JSX.Element {
  const { chapter, latestYear, priorYear } = overview;
  const latestTotal = overview.byYear.find((y) => y.year === latestYear)?.totalUsd ?? 0;

  return (
    <Stack gap="2xl">
      {/* The page H1 is rendered by the ChapterArticle shell from `overview.page.h1`. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          {overview.byYear[0]?.year}–{latestYear} · {overview.valueBasis} · last checked {formatDate(overview.page.lastCheckedAt)}
        </Text>
        <MarkdownContent variant="body" html={parseChapterBodyMarkdown(overview.intro)} />
        <MetricGrid columns="2-3-5" gap="md">
          {overview.stats.map((stat) => (
            <MetricCell key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </MetricGrid>
      </Stack>

      <CardSection padding="normal">
        <Stack gap="md">
          <SectionHeading as="h2">In short</SectionHeading>
          <Stack as="ul" gap="sm">
            {overview.keyTakeaways.map((point) => (
              <li key={point}>
                <Text size="sm">{point}</Text>
              </li>
            ))}
          </Stack>
        </Stack>
      </CardSection>

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">Exports over time</SectionHeading>
            <Text size="sm" tone="muted">
              {overview.byYearCaption}
            </Text>
          </Stack>
          <ImportsByYearChart byYear={overview.byYear} partners={overview.byYearPartners} chapterTitle={chapter.title} flow="exports" />
        </Stack>
      </CardSection>

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">Who buys these goods from the U.S.</SectionHeading>
            <Text size="sm" tone="muted">
              The largest destinations and the tariff each charges on U.S.-origin goods today. Rates by product group are on{' '}
              <TextLink href={chapterSectionHref(chapter.slug, 'exports/markets')}>Export markets</TextLink>; what changed is on{' '}
              <TextLink href={chapterSectionHref(chapter.slug, 'exports/tariff-updates')}>Export tariff updates</TextLink>.
            </Text>
          </Stack>
          <TableScroll>
            <DataTable>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Country</TableHeaderCell>
                  <TableHeaderCell>U.S. exports {latestYear}</TableHeaderCell>
                  <TableHeaderCell>Share</TableHeaderCell>
                  <TableHeaderCell>{priorYear}</TableHeaderCell>
                  <TableHeaderCell>Change</TableHeaderCell>
                  <TableHeaderCell>Tariff on U.S. goods now</TableHeaderCell>
                  <TableHeaderCell>Since Jan 2025</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {overview.topMarkets.map((m) => (
                  <TableRow key={m.countryCode}>
                    <TableCell>{m.country}</TableCell>
                    <TableCell variant="rate">{usd(m.exportsUsd)}</TableCell>
                    <TableCell variant="rate">{m.sharePct.toFixed(1)}%</TableCell>
                    <TableCell variant="rate" tone="muted">
                      {usd(m.priorExportsUsd)}
                    </TableCell>
                    <TableCell variant="rate">{change(m.changePct) ?? <EmptyCellValue />}</TableCell>
                    <TableCell variant="rateWrap">{m.tariffNow}</TableCell>
                    <TableCell variant="rate">
                      <StatusBadge variant={EXPORT_STATUS_BADGE[m.status].variant} size="sm" label={EXPORT_STATUS_BADGE[m.status].label} />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow emphasis="header">
                  <TableCell>All other countries</TableCell>
                  <TableCell variant="rate">{usd(overview.othersExportsUsd)}</TableCell>
                  <TableCell variant="rate">{latestTotal ? `${((overview.othersExportsUsd / latestTotal) * 100).toFixed(1)}%` : <EmptyCellValue />}</TableCell>
                  <TableCell variant="rate" tone="muted">
                    {usd(overview.othersPriorExportsUsd)}
                  </TableCell>
                  <TableCell variant="rate">
                    {overview.othersPriorExportsUsd ? (
                      change(((overview.othersExportsUsd - overview.othersPriorExportsUsd) / overview.othersPriorExportsUsd) * 100)
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

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">What the U.S. sells</SectionHeading>
            <Text size="sm" tone="muted">
              U.S. exports by product group and the largest six-digit lines, {latestYear} vs {priorYear}.
            </Text>
          </Stack>
          <TableScroll>
            <DataTable>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Product group</TableHeaderCell>
                  <TableHeaderCell>Exports {latestYear}</TableHeaderCell>
                  <TableHeaderCell>Share</TableHeaderCell>
                  <TableHeaderCell>{priorYear}</TableHeaderCell>
                  <TableHeaderCell>Change</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {overview.byHeading.map((h) => (
                  <TableRow key={h.heading}>
                    <TableCell>
                      {h.heading} {h.label}
                    </TableCell>
                    <TableCell variant="rate">{usd(h.exportsUsd)}</TableCell>
                    <TableCell variant="rate">{h.sharePct.toFixed(1)}%</TableCell>
                    <TableCell variant="rate" tone="muted">
                      {usd(h.priorExportsUsd)}
                    </TableCell>
                    <TableCell variant="rate">{change(h.changePct) ?? <EmptyCellValue />}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </DataTable>
          </TableScroll>
          <TableScroll>
            <DataTable>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>HS line</TableHeaderCell>
                  <TableHeaderCell>Product</TableHeaderCell>
                  <TableHeaderCell>Exports {latestYear}</TableHeaderCell>
                  <TableHeaderCell>Share</TableHeaderCell>
                  <TableHeaderCell>Change</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {overview.byLine.map((line) => (
                  <TableRow key={line.hs6}>
                    <TableCell variant="code">{line.hs6}</TableCell>
                    <TableCell>{line.description}</TableCell>
                    <TableCell variant="rate">{usd(line.exportsUsd)}</TableCell>
                    <TableCell variant="rate">{line.sharePct.toFixed(1)}%</TableCell>
                    <TableCell variant="rate">{change(line.changePct) ?? <EmptyCellValue />}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </DataTable>
          </TableScroll>
        </Stack>
      </CardSection>

      <CardSection padding="normal">
        <Stack gap="md">
          <SectionHeading as="h2">Why the import rates don&apos;t apply here</SectionHeading>
          <MarkdownContent variant="body" html={parseChapterBodyMarkdown(overview.classificationNote)} />
        </Stack>
      </CardSection>

      <ExportSources sources={overview.sources} />
    </Stack>
  );
}
