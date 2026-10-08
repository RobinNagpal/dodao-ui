import { SourceLinks } from '@/components/industry-tariff/chapter/updates/ChapterTariffUpdatesApproach2';
import Heading from '@/components/ui/Heading';
import MetricCell from '@/components/ui/MetricCell';
import StatusBadge, { type StatusBadgeVariant } from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import MetricGrid from '@/components/ui/containers/MetricGrid';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import InlineCard from '@/components/ui/sections/InlineCard';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import { DataTable, EmptyCellValue, TableCell, TableHead, TableHeaderCell, TableRow, TableScroll } from '@/components/ui/tables/DataTable';
import type { TariffChapterPrototype, TariffExportMarketStatus, TariffExportMarketUpdate, TariffUsExportsContent } from '@/types/tariff-chapter-prototype';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import { chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import React from 'react';

// "Tariffs on U.S. exports" tool page: the other direction from the rest of
// the chapter report. Which countries buy this chapter's goods from the U.S.,
// the tariff each charges on them, and the tariff actions between the U.S. and
// that country since January 2025. Country-level, not per tariff line.

interface ChapterUsExportsApproach2Props {
  content: TariffChapterPrototype;
  exports: TariffUsExportsContent;
}

const STATUS_BADGE: Record<TariffExportMarketStatus, { variant: StatusBadgeVariant; label: string }> = {
  unchanged: { variant: 'neutral', label: 'No change' },
  lowered: { variant: 'success', label: 'Tariff lowered' },
  raised: { variant: 'danger', label: 'Tariff raised' },
  raisedThenRemoved: { variant: 'warning', label: 'Raised, then removed' },
  pending: { variant: 'info', label: 'Change pending' },
};

const COVERS_LABEL: Record<TariffExportMarketUpdate['coversChapter'], string> = {
  yes: 'Covers this chapter',
  partly: 'Covers part of this chapter',
  no: 'Other U.S. goods only',
};

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

export default function ChapterUsExportsApproach2({ content, exports }: ChapterUsExportsApproach2Props): React.JSX.Element {
  const { chapter } = content;
  const sources = new Map(exports.sources.map((s) => [s.id, s]));
  const { latestYear, priorYear } = exports;
  const listedUsd = exports.markets.reduce((total, m) => total + m.exportsUsd, 0);
  const listedPriorUsd = exports.markets.reduce((total, m) => total + m.priorExportsUsd, 0);
  const othersUsd = exports.totalExportsUsd - listedUsd;
  const othersPriorUsd = exports.priorTotalExportsUsd - listedPriorUsd;

  return (
    <Stack gap="2xl">
      {/* The page H1 is rendered by the ChapterArticle shell from `exports.h1`. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          {priorYear}–{latestYear} · {exports.valueBasis} · last checked {formatDate(exports.lastCheckedAt)}
        </Text>
        <MarkdownContent variant="body" html={parseChapterBodyMarkdown(exports.intro)} />
        <MetricGrid columns="2-4" gap="md">
          {exports.stats.map((stat) => (
            <MetricCell key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </MetricGrid>
      </Stack>

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">Who buys these goods from the U.S.</SectionHeading>
            <Text size="sm" tone="muted">
              The main destinations for U.S. Chapter {chapter.padded} exports, with the tariff each country charges on U.S.-origin goods. For what the U.S.
              charges on imports, see <TextLink href={chapterSectionHref(chapter.slug, 'tariff-updates')}>Tariff updates</TextLink>.
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
                  <TableHeaderCell>Main products</TableHeaderCell>
                  <TableHeaderCell>Tariff on U.S. goods: Jan 2025 → now</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {exports.markets.map((m) => (
                  <TableRow key={m.countryCode}>
                    <TableCell>{m.country}</TableCell>
                    <TableCell variant="rate">{usd(m.exportsUsd)}</TableCell>
                    <TableCell variant="rate">{m.sharePct.toFixed(1)}%</TableCell>
                    <TableCell variant="rate" tone="muted">
                      {usd(m.priorExportsUsd)}
                    </TableCell>
                    <TableCell variant="rate">{change(m.changePct) ?? <EmptyCellValue />}</TableCell>
                    <TableCell variant="rateWrap" tone="muted">
                      {m.mainProducts}
                    </TableCell>
                    <TableCell variant="rateWrap">{m.tariffBefore === m.tariffNow ? m.tariffNow : `${m.tariffBefore} → ${m.tariffNow}`}</TableCell>
                  </TableRow>
                ))}
                <TableRow emphasis="header">
                  <TableCell>All other countries</TableCell>
                  <TableCell variant="rate">{usd(othersUsd)}</TableCell>
                  <TableCell variant="rate">
                    {exports.totalExportsUsd ? `${((othersUsd / exports.totalExportsUsd) * 100).toFixed(1)}%` : <EmptyCellValue />}
                  </TableCell>
                  <TableCell variant="rate" tone="muted">
                    {usd(othersPriorUsd)}
                  </TableCell>
                  <TableCell variant="rate">{othersPriorUsd ? change(((othersUsd - othersPriorUsd) / othersPriorUsd) * 100) : <EmptyCellValue />}</TableCell>
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
            {exports.coverageNote}
          </Text>
        </Stack>
      </CardSection>

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">Tariff changes by country since January 2025</SectionHeading>
            <Text size="sm" tone="muted">
              Tariff actions between the U.S. and each buyer, newest first. Some reached U.S. goods in general but not Chapter {chapter.padded}; those are
              marked.
            </Text>
          </Stack>
          <Stack gap="md">
            {exports.markets.map((m) => {
              const badge = STATUS_BADGE[m.status];
              return (
                <InlineCard key={m.countryCode} padding="roomy">
                  <Stack gap="md">
                    <Stack gap="xs">
                      <Stack direction="row" gap="sm" align="center" justify="between" wrap>
                        <Stack direction="row" gap="sm" align="baseline" wrap>
                          <Heading as="h3" size="md" tone="white">
                            {m.country}
                          </Heading>
                          <Text as="span" size="xs" tone="muted">
                            {usd(m.exportsUsd)} in {latestYear} · {m.mainProducts}
                          </Text>
                        </Stack>
                        <StatusBadge variant={badge.variant} size="sm" label={badge.label} />
                      </Stack>
                      <Text size="sm" weight="semibold">
                        Tariff on U.S. goods: {m.tariffBefore === m.tariffNow ? m.tariffNow : `${m.tariffBefore} → ${m.tariffNow}`}
                      </Text>
                      <Text size="sm" tone="muted">
                        {m.headline}
                      </Text>
                    </Stack>
                    {m.updates.length > 0 && (
                      <Stack gap="sm">
                        {m.updates.map((u) => (
                          <InlineCard key={u.id} padding="cozy">
                            <Stack gap="xs">
                              <Stack direction="row" gap="sm" align="center" wrap>
                                <Text as="span" size="xs" tone="muted">
                                  {formatDate(u.date)}
                                </Text>
                                <StatusBadge variant={u.coversChapter === 'no' ? 'neutral' : 'accent'} size="sm" label={COVERS_LABEL[u.coversChapter]} />
                                <Text as="span" size="xs" tone="muted">
                                  {u.status}
                                </Text>
                              </Stack>
                              <Text size="sm" weight="semibold" tone="white">
                                {u.title}
                              </Text>
                              {u.before && u.now && (
                                <Text size="sm" weight="semibold">
                                  {u.before} → {u.now}
                                </Text>
                              )}
                              <Text size="sm" tone="muted">
                                {u.detail}
                              </Text>
                              <SourceLinks ids={u.sourceIds} sources={sources} />
                            </Stack>
                          </InlineCard>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </InlineCard>
              );
            })}
          </Stack>
        </Stack>
      </CardSection>

      <CardSection padding="normal">
        <Stack gap="md">
          <SectionHeading as="h2">Why the U.S. both buys and sells these goods</SectionHeading>
          <MarkdownContent variant="body" html={parseChapterBodyMarkdown(exports.why)} />
        </Stack>
      </CardSection>

      <Stack gap="sm">
        <SectionHeading as="h2" size="sm">
          Sources
        </SectionHeading>
        <Stack gap="xs">
          {exports.sources.map((source) => (
            <Text key={source.id} size="xs" tone="muted">
              <TextLink href={source.url} size="xs">
                {source.citation}
              </TextLink>{' '}
              — {source.document}: {source.title}
              {source.signed ? ` · signed ${formatDate(source.signed)}` : ''} · published {formatDate(source.published)}
            </Text>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
