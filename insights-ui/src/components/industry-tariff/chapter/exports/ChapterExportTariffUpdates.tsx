import { EXPORT_STATUS_BADGE, ExportSources, formatDate } from '@/components/industry-tariff/chapter/exports/export-shared';
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
import { DataTable, TableCell, TableHead, TableHeaderCell, TableRow, TableScroll } from '@/components/ui/tables/DataTable';
import type { TariffExportChange, TariffExportChangeType, TariffExportUpdatesContent } from '@/types/tariff-chapter-exports';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import { chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import React from 'react';

// Export tariff updates: what other countries changed on U.S. goods in this chapter since
// January 2025 — the measures in force today, a dated change log, and each buyer's status.

const CHANGE_BADGE: Record<TariffExportChangeType, { variant: StatusBadgeVariant; label: string }> = {
  retaliation: { variant: 'warning', label: 'Retaliation' },
  tradeDeal: { variant: 'info', label: 'Trade deal' },
  reference: { variant: 'neutral', label: 'Note' },
};

const COVERS_LABEL: Record<TariffExportChange['coversChapter'], string> = {
  yes: 'Covers this chapter',
  partly: 'Covers part of this chapter',
  no: 'Other U.S. goods only',
};

export default function ChapterExportTariffUpdates({ updates }: { updates: TariffExportUpdatesContent }): React.JSX.Element {
  const { chapter } = updates;
  const sources = new Map(updates.sources.map((s) => [s.id, s]));

  return (
    <Stack gap="2xl">
      {/* The page H1 is rendered by the ChapterArticle shell from `updates.page.h1`. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          Foreign tariff actions on U.S. goods since January 2025 · last checked {formatDate(updates.page.lastCheckedAt)}
        </Text>
        <MarkdownContent variant="body" html={parseChapterBodyMarkdown(updates.intro)} />
        <MetricGrid columns="2-4" gap="md">
          {updates.stats.map((stat) => (
            <MetricCell key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </MetricGrid>
      </Stack>

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">In force today</SectionHeading>
            <Text size="sm" tone="muted">
              Foreign measures that charge U.S.-origin Chapter {chapter.padded} goods more than in January 2025. Scope: {updates.scope}
            </Text>
          </Stack>
          <Stack gap="md">
            {updates.inEffect.map((measure) => (
              <InlineCard key={measure.id} padding="roomy">
                <Stack gap="sm">
                  <Stack direction="row" gap="sm" align="center" justify="between" wrap>
                    <Stack direction="row" gap="sm" align="baseline" wrap>
                      <Heading as="h3" size="md" tone="white">
                        {measure.country}
                      </Heading>
                      <Text as="span" size="xs" tone="muted">
                        {measure.measure}
                      </Text>
                    </Stack>
                    <StatusBadge variant="danger" size="sm" label={`Jan 2025: ${measure.before} → now: ${measure.now}`} />
                  </Stack>
                  <Text size="sm">{measure.appliesTo}</Text>
                  <Text size="sm" tone="muted">
                    {measure.whatItMeans}
                  </Text>
                  <SourceLinks ids={measure.sourceIds} sources={sources} />
                </Stack>
              </InlineCard>
            ))}
          </Stack>
        </Stack>
      </CardSection>

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">Change log since January 2025</SectionHeading>
            <Text size="sm" tone="muted">
              Newest first. Measures on other U.S. goods are listed where a buyer might expect them to reach Chapter {chapter.padded}, and marked when they
              don&apos;t.
            </Text>
          </Stack>
          <Stack gap="md">
            {updates.changes.map((entry) => {
              const badge = CHANGE_BADGE[entry.type];
              return (
                <InlineCard key={entry.id} padding="cozy">
                  <Stack gap="xs">
                    <Stack direction="row" gap="sm" align="center" wrap>
                      <Text as="span" size="xs" tone="muted">
                        {formatDate(entry.date)}
                      </Text>
                      <StatusBadge variant={badge.variant} size="sm" label={badge.label} />
                      <StatusBadge variant={entry.coversChapter === 'no' ? 'neutral' : 'accent'} size="sm" label={COVERS_LABEL[entry.coversChapter]} />
                      <Text as="span" size="xs" tone="muted">
                        {entry.countries.join(', ')} · {entry.status}
                      </Text>
                    </Stack>
                    <Text size="sm" weight="semibold" tone="white">
                      {entry.title}
                    </Text>
                    {entry.before && entry.now && (
                      <Text size="sm" weight="semibold">
                        {entry.before} → {entry.now}
                      </Text>
                    )}
                    <Text size="sm" tone="muted">
                      {entry.detail}
                    </Text>
                    <SourceLinks ids={entry.sourceIds} sources={sources} />
                  </Stack>
                </InlineCard>
              );
            })}
          </Stack>
        </Stack>
      </CardSection>

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">Where each buyer stands</SectionHeading>
            <Text size="sm" tone="muted">
              The tariff each buyer charges on U.S. goods, January 2025 vs today. Rates by product group are on{' '}
              <TextLink href={chapterSectionHref(chapter.slug, 'exports/markets')}>Export markets</TextLink>.
            </Text>
          </Stack>
          <TableScroll>
            <DataTable>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Country</TableHeaderCell>
                  <TableHeaderCell>Jan 2025</TableHeaderCell>
                  <TableHeaderCell>Now</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>What it means</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {updates.byCountry.map((c) => (
                  <TableRow key={c.country}>
                    <TableCell>{c.country}</TableCell>
                    <TableCell variant="rateWrap" tone="muted">
                      {c.tariffBefore}
                    </TableCell>
                    <TableCell variant="rateWrap">{c.tariffNow}</TableCell>
                    <TableCell variant="rate">
                      <StatusBadge variant={EXPORT_STATUS_BADGE[c.status].variant} size="sm" label={EXPORT_STATUS_BADGE[c.status].label} />
                    </TableCell>
                    <TableCell tone="muted">{c.headline}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </DataTable>
          </TableScroll>
        </Stack>
      </CardSection>

      <ExportSources sources={updates.sources} />
    </Stack>
  );
}
