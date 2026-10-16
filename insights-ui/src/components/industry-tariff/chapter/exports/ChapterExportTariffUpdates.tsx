import { formatIsoDate } from '@/components/industry-tariff/chapter/exports/export-shared';
import ChapterChangeLog, { type ChangeLogEntry } from '@/components/industry-tariff/chapter/updates/ChapterChangeLog';
import DutyInEffectCard from '@/components/industry-tariff/chapter/updates/DutyInEffectCard';
import { SourceLinks } from '@/components/industry-tariff/chapter/updates/SourceLinks';
import SourcesCard, { documentSourceItems } from '@/components/industry-tariff/chapter/updates/SourcesCard';
import Heading from '@/components/ui/Heading';
import StatusBadge, { type StatusBadgeVariant } from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import Stack from '@/components/ui/containers/Stack';
import StatCardGrid from '@/components/ui/containers/StatCardGrid';
import CardSection from '@/components/ui/sections/CardSection';
import { DisclosureItem } from '@/components/ui/sections/DisclosureList';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import TimelineRow from '@/components/ui/sections/TimelineRow';
import type { TariffUpdateSource } from '@/types/tariff-chapter-prototype';
import type { TariffExportChange, TariffExportChangeType, TariffExportUpcoming, TariffExportUpdatesContent } from '@/types/tariff-chapter-exports';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import { chapterExportHref } from '@/utils/tariff-reports/chapter-route-helpers';
import React from 'react';

// Export tariff updates: what other countries changed on U.S. goods in this chapter since January
// 2025, and what is coming. Dated events ahead first (the thing an exporter must plan for), then the
// foreign measures in force today, then the change log — measures that reach this chapter, with the
// ones that only touch other U.S. goods folded away as context. Each buyer's current rate by product
// group is on the markets page, not repeated here.

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

function UpcomingList({
  upcoming,
  sources,
  chapterPadded,
}: {
  upcoming: TariffExportUpcoming[];
  sources: Map<string, TariffUpdateSource>;
  chapterPadded: string;
}): React.JSX.Element {
  return (
    <div>
      {upcoming.map((event) => (
        <TimelineRow
          key={event.id}
          asideWidth="wide"
          aside={
            <>
              <Text as="span" size="base" weight="semibold" tone="white">
                {formatIsoDate(event.expectedOn)}
              </Text>
              <StatusBadge variant="warning" size="sm" label={event.dateLabel} />
            </>
          }
        >
          <Stack gap="sm">
            <Heading as="h3" size="md" tone="white">
              {event.title}
            </Heading>
            <Text size="sm">{event.whatHappens}</Text>
            <Text size="sm">
              <Text as="span" size="sm" weight="semibold" tone="white">
                For Chapter {chapterPadded} goods:{' '}
              </Text>
              {event.impact}
            </Text>
            <Text size="xs" tone="muted">
              {event.countries.join(', ')} · {event.status}
            </Text>
            <SourceLinks ids={event.sourceIds} sources={sources} />
          </Stack>
        </TimelineRow>
      ))}
    </div>
  );
}

export default function ChapterExportTariffUpdates({ updates }: { updates: TariffExportUpdatesContent }): React.JSX.Element {
  const { chapter } = updates;
  const sources = new Map(updates.sources.map((s) => [s.id, s]));
  const reaching = updates.changes.filter((c) => c.coversChapter !== 'no');
  const context = updates.changes.filter((c) => c.coversChapter === 'no');

  return (
    <Stack gap="2xl">
      {/* The page H1 and the "Rates as of" date are rendered by the ChapterArticle shell. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          Foreign tariff actions on U.S. goods since January 2025, and what is coming
        </Text>
        <MarkdownContent variant="body" html={parseChapterBodyMarkdown(updates.intro)} />
      </Stack>

      <StatCardGrid stats={updates.stats} />

      {updates.upcoming.length > 0 && (
        <CardSection padding="roomy" bordered>
          <Stack gap="lg">
            <Stack gap="xs">
              <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
                What&apos;s coming
              </SectionHeading>
              <Text size="sm" tone="muted">
                Dated events ahead that could change what buyers charge on U.S. Chapter {chapter.padded} goods, soonest first.
              </Text>
            </Stack>
            <UpcomingList upcoming={updates.upcoming} sources={sources} chapterPadded={chapter.padded} />
          </Stack>
        </CardSection>
      )}

      <Stack as="section" gap="lg">
        <Stack gap="xs">
          <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
            In force today
          </SectionHeading>
          <Text size="sm" tone="muted">
            Foreign measures that charge U.S.-origin Chapter {chapter.padded} goods more than in January 2025; each rate reads Jan 2025 → now. Scope:{' '}
            {updates.scope}
          </Text>
        </Stack>
        <Stack gap="md">
          {updates.inEffect.map((measure) => (
            <DutyInEffectCard
              key={measure.id}
              country={measure.country}
              measure={measure.measure}
              before={measure.before}
              now={measure.now}
              whatItMeans={measure.whatItMeans}
              details={measure.appliesTo}
              sources={<SourceLinks ids={measure.sourceIds} sources={sources} />}
              effectiveFrom={measure.effectiveFrom}
              effectiveSource={sources.get(measure.effectiveSourceId)}
            />
          ))}
        </Stack>
      </Stack>

      <Stack as="section" gap="lg">
        <Stack gap="xs">
          <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
            Every change since January 2025
          </SectionHeading>
          <Text size="sm" tone="muted">
            Foreign tariff actions that reach Chapter {chapter.padded} goods, newest first. Each buyer&apos;s rate today, by product group, is on{' '}
            <TextLink href={chapterExportHref(chapter.slug, 'exports/markets')}>Markets</TextLink>.
          </Text>
        </Stack>
        <ChapterChangeLog changes={reaching.map(toChangeLogEntry)} typeLabels={TYPE_LABEL} sources={updates.sources} />
        {context.length > 0 && (
          <DisclosureItem
            look="inline"
            summary={`Actions on other U.S. goods only (${context.length}) — listed because a buyer might expect them to reach this chapter`}
          >
            <ChapterChangeLog changes={context.map(toChangeLogEntry)} typeLabels={TYPE_LABEL} sources={updates.sources} />
          </DisclosureItem>
        )}
      </Stack>

      <SourcesCard items={documentSourceItems(updates.sources)} />
    </Stack>
  );
}
