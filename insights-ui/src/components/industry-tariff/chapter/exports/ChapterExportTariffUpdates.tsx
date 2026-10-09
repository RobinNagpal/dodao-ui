import { EXPORT_STATUS_BADGE } from '@/components/industry-tariff/chapter/exports/export-shared';
import ChapterChangeLog, { type ChangeLogEntry } from '@/components/industry-tariff/chapter/updates/ChapterChangeLog';
import { SourceLinks } from '@/components/industry-tariff/chapter/updates/SourceLinks';
import SourcesCard from '@/components/industry-tariff/chapter/updates/SourcesCard';
import StatusBadge, { type StatusBadgeVariant } from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import MetricGrid from '@/components/ui/containers/MetricGrid';
import Stack from '@/components/ui/containers/Stack';
import StatCardGrid from '@/components/ui/containers/StatCardGrid';
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
// January 2025 — the measures in force today, a dated change log, and each buyer's status. Laid
// out like the import tariff-updates page.

const TYPE_LABEL: Record<TariffExportChangeType, string> = {
  retaliation: 'Retaliation',
  tradeDeal: 'Trade deal',
  reference: 'Note',
};

const TYPE_VARIANT: Record<TariffExportChangeType, StatusBadgeVariant> = {
  retaliation: 'warning',
  tradeDeal: 'info',
  reference: 'neutral',
};

const COVERS_LABEL: Record<TariffExportChange['coversChapter'], string> = {
  yes: 'Covers this chapter',
  partly: 'Covers part of this chapter',
  no: 'Other U.S. goods only',
};

function toChangeLogEntry(change: TariffExportChange): ChangeLogEntry {
  return {
    id: change.id,
    date: change.date,
    type: change.type,
    badge: { label: TYPE_LABEL[change.type], variant: TYPE_VARIANT[change.type] },
    title: change.title,
    tag: COVERS_LABEL[change.coversChapter],
    detail: change.detail,
    before: change.before,
    now: change.now,
    facts: [...(change.countries.length > 0 ? [{ label: 'Countries', value: change.countries.join(', ') }] : []), { label: 'Status', value: change.status }],
    sourceIds: change.sourceIds,
  };
}

export default function ChapterExportTariffUpdates({ updates }: { updates: TariffExportUpdatesContent }): React.JSX.Element {
  const { chapter } = updates;
  const sources = new Map(updates.sources.map((s) => [s.id, s]));

  return (
    <Stack gap="2xl">
      {/* The page H1 and the "Rates as of" date are rendered by the ChapterArticle shell. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          Foreign tariff actions on U.S. goods since January 2025
        </Text>
        <MarkdownContent variant="body" html={parseChapterBodyMarkdown(updates.intro)} />
      </Stack>

      <StatCardGrid stats={updates.stats} />

      <CardSection padding="roomy" bordered>
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              In force today
            </SectionHeading>
            <Text size="sm" tone="muted">
              Foreign measures that charge U.S.-origin Chapter {chapter.padded} goods more than in January 2025. Scope: {updates.scope}
            </Text>
          </Stack>
          <Stack gap="md">
            {updates.inEffect.map((measure) => (
              <InlineCard key={measure.id} surface="sunken" padding="spacious">
                <MetricGrid columns="1-3-wide" gap="xl">
                  <Stack gap="xs">
                    <Text as="span" size="sm" tone="muted">
                      {measure.country}
                    </Text>
                    <Text as="span" size="base" weight="semibold" tone="white">
                      {measure.measure}
                    </Text>
                    <SourceLinks ids={measure.sourceIds} sources={sources} />
                  </Stack>
                  <Stack gap="xs">
                    <Text as="span" size="sm" tone="muted">
                      Jan 2025 → now
                    </Text>
                    <Text as="span" size="lg" weight="bold" tone="white">
                      {measure.before} → {measure.now}
                    </Text>
                    <Text as="span" size="sm">
                      {measure.appliesTo}
                    </Text>
                  </Stack>
                  <Text size="sm">
                    <Text as="span" size="sm" weight="semibold" tone="white">
                      What it means:{' '}
                    </Text>
                    {measure.whatItMeans}
                  </Text>
                </MetricGrid>
              </InlineCard>
            ))}
          </Stack>
        </Stack>
      </CardSection>

      <CardSection padding="roomy" bordered>
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              Every change since January 2025
            </SectionHeading>
            <Text size="sm" tone="muted">
              Newest first, grouped by year. Measures on other U.S. goods are listed where a buyer might expect them to reach Chapter {chapter.padded}, and
              marked when they don&apos;t.
            </Text>
          </Stack>
          <ChapterChangeLog changes={updates.changes.map(toChangeLogEntry)} typeLabels={TYPE_LABEL} sources={updates.sources} />
        </Stack>
      </CardSection>

      <CardSection padding="roomy" bordered>
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              Where each buyer stands
            </SectionHeading>
            <Text size="sm" tone="muted">
              The tariff each buyer charges on U.S. goods, January 2025 vs today. Rates by product group are on{' '}
              <TextLink href={chapterSectionHref(chapter.slug, 'exports/markets')}>Export markets</TextLink>.
            </Text>
          </Stack>
          <TableScroll>
            <DataTable>
              <TableHead look="plain">
                <TableRow>
                  <TableHeaderCell>Country</TableHeaderCell>
                  <TableHeaderCell>Jan 2025</TableHeaderCell>
                  <TableHeaderCell>Now</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell width="wide">What it means</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {updates.byCountry.map((c) => (
                  <TableRow key={c.country}>
                    <TableCell tone="emphasis">{c.country}</TableCell>
                    <TableCell variant="rateWrap" tone="muted">
                      {c.tariffBefore}
                    </TableCell>
                    <TableCell variant="rateWrap" tone="primary">
                      {c.tariffNow}
                    </TableCell>
                    <TableCell variant="rate">
                      <StatusBadge variant={EXPORT_STATUS_BADGE[c.status].variant} size="sm" label={EXPORT_STATUS_BADGE[c.status].label} />
                    </TableCell>
                    <TableCell>{c.headline}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </DataTable>
          </TableScroll>
        </Stack>
      </CardSection>

      <SourcesCard sources={updates.sources} />
    </Stack>
  );
}
