import ChapterRateTable from '@/components/industry-tariff/chapter/overview/ChapterRateTable';
import DefinitionList from '@/components/ui/DefinitionList';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import MetricGrid, { cardGridColumns } from '@/components/ui/containers/MetricGrid';
import StatCardGrid from '@/components/ui/containers/StatCardGrid';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import InlineCard from '@/components/ui/sections/InlineCard';
import LinkTile from '@/components/ui/sections/LinkTile';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import type { TariffChapterPrototype } from '@/types/tariff-chapter-prototype';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import { chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import Link from 'next/link';
import React from 'react';

// Approach 2 overview page (issue #1770). The page's single job is to be the
// chapter's rate lookup: every line, every rate, filterable by product name.
//
// Reading order is deliberate: orient the reader (what this chapter is, and
// whether the rate is even the thing that matters), give them the chapter's
// numbers, let them jump to their product group, then the full table, then the
// arithmetic worked through on real lines. Nothing here is hidden behind an
// interaction — the filters narrow content that is already rendered.

interface ChapterOverviewApproach2Props {
  content: TariffChapterPrototype;
}

export default function ChapterOverviewApproach2({ content }: ChapterOverviewApproach2Props): React.JSX.Element {
  const { chapter, overview, sources } = content;

  return (
    <Stack gap="2xl">
      {/* The page H1 is rendered by the ChapterArticle shell from `overview.h1`. */}
      <MarkdownContent variant="body" html={parseChapterBodyMarkdown(overview.intro)} />

      <Stack gap="md">
        <StatCardGrid stats={overview.stats} />
        <Text size="xs" tone="muted">
          <Link href={chapterSectionHref(chapter.slug, 'understand-industry')}>Full trade statistics →</Link>
        </Text>
      </Stack>

      <Stack as="section" gap="md">
        <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
          The {overview.productGroups.length} headings in Chapter {chapter.padded}
        </SectionHeading>
        <MetricGrid columns={cardGridColumns(overview.productGroups.length)} gap="md">
          {overview.productGroups.map((group) => (
            <LinkTile
              key={group.heading}
              href={`#${group.heading}`}
              eyebrow={group.heading}
              aside={group.dutiableLineCount > 0 ? `${group.lineCount} lines · ${group.dutiableLineCount} with a duty` : `${group.lineCount} lines`}
              title={group.label}
              meta={group.rateSummary}
            >
              {group.blurb}
            </LinkTile>
          ))}
        </MetricGrid>
      </Stack>

      <CardSection padding="roomy" bordered id="rate-table">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              Every HTS Chapter {chapter.padded} tariff line and its duty rate
            </SectionHeading>
            <Text size="sm" tone="muted">
              All {overview.rateTable.rowCount} rows of the schedule, with the general (MFN) rate, the free-trade and preference rates, the Column 2 rate and
              the reporting unit. Search by product name or HTS code; select a line for its full description and preference list.
            </Text>
          </Stack>
          <ChapterRateTable rows={overview.rateTable.rows} note={overview.rateTable.note} />
        </Stack>
      </CardSection>

      <Stack as="section" gap="md">
        <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
          What the rate works out to
        </SectionHeading>
        <MetricGrid columns={cardGridColumns(overview.workedExamples.length)} gap="lg">
          {overview.workedExamples.map((example) => (
            <InlineCard key={example.title} surface="card" padding="spacious">
              <Stack gap="sm">
                <Text as="span" size="sm" tone="primary" font="mono">
                  {example.line}
                </Text>
                <Heading as="h3" size="lg" tone="white">
                  {example.title}
                </Heading>
                <MarkdownContent variant="plain" html={parseChapterBodyMarkdown(example.body)} />
              </Stack>
            </InlineCard>
          ))}
        </MetricGrid>
      </Stack>

      {overview.spiLegend.length > 0 && (
        <CardSection padding="roomy" bordered>
          <Stack gap="lg">
            <Stack gap="xs">
              <SectionHeading as="h2" size="md" weight="bold" tone="heading">
                What the preference codes mean
              </SectionHeading>
              <Text size="sm" tone="muted">
                These are the codes behind the program count in the FTA column of the table above (expand a row to see them). A shipment claims one of these
                programs at entry, and claiming it is what turns the general rate into Free.
              </Text>
            </Stack>
            <DefinitionList columns="1-2" items={overview.spiLegend.map((entry) => ({ term: entry.code, definition: entry.name }))} />
          </Stack>
        </CardSection>
      )}

      {(overview.notes.chapterNotes || overview.notes.additionalUsNotes) && (
        <CardSection padding="roomy" bordered>
          <Stack gap="lg">
            <SectionHeading as="h2" size="md" weight="bold" tone="heading">
              Chapter notes
            </SectionHeading>
            <Stack gap="md">
              {overview.notes.chapterNotes && <MarkdownContent variant="plain" html={parseChapterBodyMarkdown(overview.notes.chapterNotes)} />}
              {overview.notes.additionalUsNotes && <MarkdownContent variant="plain" html={parseChapterBodyMarkdown(overview.notes.additionalUsNotes)} />}
            </Stack>
          </Stack>
        </CardSection>
      )}

      <Text size="xs" tone="muted">
        Sources: {sources.map((source) => (source.url ? `${source.label} (${source.url})` : source.label)).join(' · ')}.
      </Text>
    </Stack>
  );
}
