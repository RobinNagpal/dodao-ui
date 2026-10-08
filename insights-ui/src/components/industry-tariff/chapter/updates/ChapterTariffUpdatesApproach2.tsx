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
import type { TariffChangeType, TariffChapterPrototype, TariffUpdateSource, TariffUpdatesContent } from '@/types/tariff-chapter-prototype';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import { chapterCoverHref, chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import React from 'react';

// Approach 2 tariff-updates page (issue #1770): what changed, as data. Two
// snapshots of the schedule (an earlier edition vs now) rather than a history
// log, the extra duties in scope with their Federal Register citations, and
// an "unchanged since" on every line.

interface ChapterTariffUpdatesApproach2Props {
  content: TariffChapterPrototype;
  updates: TariffUpdatesContent;
}

const CHANGE_BADGE: Record<TariffChangeType, { variant: StatusBadgeVariant; label: string }> = {
  baseRate: { variant: 'success', label: 'Base rate' },
  extraDuty: { variant: 'warning', label: 'Extra duty' },
  reference: { variant: 'neutral', label: 'Schedule note' },
  pending: { variant: 'info', label: 'Pending / unconfirmed' },
};

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function SourceLinks({ ids, sources }: { ids: string[]; sources: Map<string, TariffUpdateSource> }): React.JSX.Element {
  return (
    <Stack direction="row" gap="md" wrap>
      {ids.map((id) => {
        const source = sources.get(id);
        if (!source) return null;
        return (
          <TextLink key={id} href={source.url} size="xs">
            {source.citation} ↗
          </TextLink>
        );
      })}
    </Stack>
  );
}

function BeforeNow({ before, now }: { before: string | null; now: string | null }): React.JSX.Element | null {
  // Only show the arrow when both ends are known — a half-known change ("— → +35%") reads as a fact we don't have.
  if (!before || !now) return null;
  return (
    <Text size="sm" weight="semibold">
      {before} → {now}
    </Text>
  );
}

export default function ChapterTariffUpdatesApproach2({ content, updates }: ChapterTariffUpdatesApproach2Props): React.JSX.Element {
  const { chapter } = content;
  const sources = new Map(updates.sources.map((s) => [s.id, s]));
  const beforeLabel = 'Jan 2025';

  return (
    <Stack gap="2xl">
      {/* The page H1 is rendered by the ChapterArticle shell from `updates.h1`. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          Compares the HTSUS {updates.before.edition} (in force {formatDate(updates.before.inForceFrom)}) with the {updates.now.edition} (in force{' '}
          {formatDate(updates.now.inForceFrom)}) · last checked {formatDate(updates.lastCheckedAt)}
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
            <SectionHeading as="h2">Extra duties in effect today</SectionHeading>
            <Text size="sm" tone="muted">
              Charged on top of the base rate, by country of origin. None of these existed in the {updates.before.edition}. Scope: {updates.scope}{' '}
              <TextLink href={chapterSectionHref(chapter.slug, 'industry-areas')}>Rates by country →</TextLink>
            </Text>
          </Stack>
          <Stack gap="md">
            {updates.inEffect.map((duty) => (
              <InlineCard key={duty.id} padding="roomy">
                <Stack gap="sm">
                  <Stack direction="row" gap="sm" align="center" justify="between" wrap>
                    <Stack direction="row" gap="sm" align="baseline" wrap>
                      <Heading as="h3" size="md" tone="white">
                        {duty.country}
                      </Heading>
                      <Text as="span" size="xs" tone="muted">
                        {duty.measure} · {duty.ch99Code}
                      </Text>
                    </Stack>
                    <StatusBadge variant="warning" size="sm" label={`${beforeLabel}: ${duty.before} → now: ${duty.now}`} />
                  </Stack>
                  <Text size="sm" tone="muted">
                    {duty.exemption}
                  </Text>
                  <SourceLinks ids={duty.sourceIds} sources={sources} />
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
              Newest first. Entries marked pending are recent actions whose product lists we have not been able to check against Chapter {chapter.padded} yet.
            </Text>
          </Stack>
          <Stack gap="md">
            {updates.changes.map((change) => {
              const badge = CHANGE_BADGE[change.type];
              return (
                <InlineCard key={change.id} padding="cozy">
                  <Stack gap="xs">
                    <Stack direction="row" gap="sm" align="center" wrap>
                      <Text as="span" size="xs" tone="muted">
                        {change.dateLabel} {formatDate(change.date)}
                      </Text>
                      <StatusBadge variant={badge.variant} size="sm" label={badge.label} />
                      {change.countries && (
                        <Text as="span" size="xs" tone="muted">
                          {change.countries}
                        </Text>
                      )}
                    </Stack>
                    <Text size="sm" weight="semibold" tone="white">
                      {change.title}
                    </Text>
                    <BeforeNow before={change.before} now={change.now} />
                    <Text size="sm" tone="muted">
                      {change.detail}
                    </Text>
                    <SourceLinks ids={change.sourceIds} sources={sources} />
                  </Stack>
                </InlineCard>
              );
            })}
          </Stack>
        </Stack>
      </CardSection>

      <Stack gap="sm">
        <SectionHeading as="h2" size="sm">
          Sources
        </SectionHeading>
        <Stack gap="xs">
          {updates.sources.map((source) => (
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
