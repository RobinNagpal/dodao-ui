import ChapterChangeLog, { type ChangeLogEntry } from '@/components/industry-tariff/chapter/updates/ChapterChangeLog';
import { SourceLinks } from '@/components/industry-tariff/chapter/updates/SourceLinks';
import SourcesCard from '@/components/industry-tariff/chapter/updates/SourcesCard';
import { type StatusBadgeVariant } from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import MetricGrid from '@/components/ui/containers/MetricGrid';
import StatCardGrid from '@/components/ui/containers/StatCardGrid';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import InlineCard from '@/components/ui/sections/InlineCard';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import type { TariffChangeEntry, TariffChangeType, TariffChapterPrototype, TariffUpdatesContent } from '@/types/tariff-chapter-prototype';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import { chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import React from 'react';

// Approach 2 tariff-updates page (issue #1770): what changed, as data. Two
// snapshots of the schedule (an earlier edition vs now) rather than a history
// log, the extra duties in scope with their Federal Register citations, and
// a dated change log.

interface ChapterTariffUpdatesApproach2Props {
  content: TariffChapterPrototype;
  updates: TariffUpdatesContent;
}

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

const TYPE_LABEL: Record<TariffChangeType, string> = {
  baseRate: 'Base rate',
  extraDuty: 'Extra duty',
  reference: 'Reference',
  pending: 'Pending',
};

// Status pill for what the date is ("Effective", "Signed", …). Pending entries show "Pending".
const STATUS_VARIANT: Record<string, StatusBadgeVariant> = {
  Effective: 'success',
  Signed: 'accent',
  Published: 'info',
  Announced: 'warning',
  Pending: 'warning',
  Expired: 'neutral',
  Checked: 'neutral',
};

function toChangeLogEntry(change: TariffChangeEntry): ChangeLogEntry {
  const status = change.type === 'pending' ? 'Pending' : change.dateLabel;
  return {
    id: change.id,
    date: change.date,
    type: change.type,
    badge: { label: status, variant: STATUS_VARIANT[status] ?? 'neutral' },
    title: change.title,
    tag: TYPE_LABEL[change.type],
    detail: change.detail,
    before: change.before,
    now: change.now,
    facts: change.countries ? [{ label: 'Applies to', value: change.countries }] : undefined,
    sourceIds: change.sourceIds,
  };
}

/** "Jan 2025" (short) or "January 2025" (long) for the month an edition came into force. */
function formatMonth(iso: string, month: 'short' | 'long'): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { year: 'numeric', month, timeZone: 'UTC' });
}

export default function ChapterTariffUpdatesApproach2({ content, updates }: ChapterTariffUpdatesApproach2Props): React.JSX.Element {
  const { chapter } = content;
  const sources = new Map(updates.sources.map((s) => [s.id, s]));
  const beforeLabel = formatMonth(updates.before.inForceFrom, 'short');
  // Only claim the duties are all new when every one of them started from nothing.
  const allNew = updates.inEffect.every((duty) => duty.before === 'None');

  return (
    <Stack gap="2xl">
      {/* The page H1 and the "Rates as of" date are rendered by the ChapterArticle shell. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          Compares the HTSUS {updates.before.edition} (in force {formatDate(updates.before.inForceFrom)}) with the {updates.now.edition} (in force{' '}
          {formatDate(updates.now.inForceFrom)})
        </Text>
        <MarkdownContent variant="body" html={parseChapterBodyMarkdown(updates.intro)} />
      </Stack>

      <StatCardGrid stats={updates.stats} />

      <CardSection padding="roomy" bordered>
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              Extra duties in effect today
            </SectionHeading>
            <Text size="sm" tone="muted">
              Charged on top of the base rate, by country of origin.{allNew ? ` None of these existed in the ${updates.before.edition}.` : ''} Scope:{' '}
              {updates.scope} <TextLink href={chapterSectionHref(chapter.slug, 'industry-areas')}>Rates by country →</TextLink>
            </Text>
          </Stack>
          <Stack gap="md">
            {updates.inEffect.map((duty) => (
              <InlineCard key={duty.id} surface="sunken" padding="spacious">
                <MetricGrid columns="1-3-wide" gap="xl">
                  <Stack gap="xs">
                    <Text as="span" size="sm" tone="muted">
                      {duty.country}
                    </Text>
                    <Text as="span" size="base" weight="semibold" tone="white">
                      {duty.measure}
                    </Text>
                    <Text as="span" size="sm" tone="primary" font="mono">
                      {duty.ch99Code}
                    </Text>
                    <SourceLinks ids={duty.sourceIds} sources={sources} />
                  </Stack>
                  <Stack gap="xs">
                    <Text as="span" size="sm" tone="muted">
                      {beforeLabel} → now
                    </Text>
                    <Text as="span" size="lg" weight="bold" tone="white">
                      {duty.before} → {duty.now}
                    </Text>
                    <Text as="span" size="sm">
                      {duty.exemption}
                    </Text>
                  </Stack>
                  <Text size="sm">
                    <Text as="span" size="sm" weight="semibold" tone="white">
                      What it means:{' '}
                    </Text>
                    {duty.whatItMeans}
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
              Every change since {formatMonth(updates.before.inForceFrom, 'long')}
            </SectionHeading>
            <Text size="sm" tone="muted">
              Newest first, grouped by year. Entries marked pending are recent actions whose product lists we have not been able to check against Chapter{' '}
              {chapter.padded} yet.
            </Text>
          </Stack>
          <ChapterChangeLog changes={updates.changes.map(toChangeLogEntry)} typeLabels={TYPE_LABEL} sources={updates.sources} />
        </Stack>
      </CardSection>

      <SourcesCard sources={updates.sources} />
    </Stack>
  );
}
