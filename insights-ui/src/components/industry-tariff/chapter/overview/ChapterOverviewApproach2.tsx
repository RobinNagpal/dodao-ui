import ChapterRateTable from '@/components/industry-tariff/chapter/overview/ChapterRateTable';
import DefinitionList from '@/components/ui/DefinitionList';
import Heading from '@/components/ui/Heading';
import MetricCell from '@/components/ui/MetricCell';
import Text from '@/components/ui/Text';
import MetricGrid from '@/components/ui/containers/MetricGrid';
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

function formatAsOf(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ChapterOverviewApproach2({ content }: ChapterOverviewApproach2Props): React.JSX.Element {
  const { chapter, overview, asOf, sources } = content;

  return (
    <Stack gap="2xl">
      {/* The page H1 is rendered by the ChapterArticle shell from `overview.h1`. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          Section {chapter.sectionRoman} · {chapter.sectionTitle} · rates as of {formatAsOf(asOf)}
        </Text>
        <MarkdownContent variant="body" html={parseChapterBodyMarkdown(overview.intro)} />
      </Stack>

      <Stack gap="md">
        <MetricGrid columns="2-4" gap="md">
          {overview.stats.map((stat) => (
            <MetricCell key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </MetricGrid>
        <Text size="xs" tone="muted">
          <Link href={chapterSectionHref(chapter.slug, 'understand-industry')}>Full trade statistics →</Link>
        </Text>
      </Stack>

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">Jump to a product group</SectionHeading>
            <Text size="sm" tone="muted">
              Chapter {chapter.padded} splits into six headings. Each tile shows the general rates in that heading and how many of its lines actually carry a
              duty.
            </Text>
          </Stack>
          <MetricGrid columns="1-2-3" gap="md">
            {overview.productGroups.map((group) => (
              <LinkTile
                key={group.heading}
                href={`#${group.heading}`}
                eyebrow={group.heading}
                title={group.label}
                meta={group.rateSummary}
                footer={`${group.lineCount} lines · ${group.dutiableLineCount} with a duty · try “${group.searchExamples[0]}”`}
              >
                {group.blurb}
              </LinkTile>
            ))}
          </MetricGrid>
        </Stack>
      </CardSection>

      <CardSection padding="normal" id="rate-table">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">Every HTS Chapter {chapter.padded} tariff line and its duty rate</SectionHeading>
            <Text size="sm" tone="muted">
              All {overview.rateTable.rowCount} rows of the schedule, with the general (MFN) rate, the free-trade and preference rates, the Column 2 rate and
              the reporting unit. Search by product name or HTS code; select a line for its full description and preference list.
            </Text>
          </Stack>
          <ChapterRateTable rows={overview.rateTable.rows} note={overview.rateTable.note} />
        </Stack>
      </CardSection>

      <CardSection padding="normal">
        <Stack gap="lg">
          <SectionHeading as="h2">What the rate works out to</SectionHeading>
          <Stack gap="md">
            {overview.workedExamples.map((example) => (
              <InlineCard key={example.title} padding="roomy">
                <Stack gap="xs">
                  <Stack direction="row" gap="sm" align="baseline" wrap>
                    <Heading as="h3" size="md" tone="white">
                      {example.title}
                    </Heading>
                    <Text as="span" size="xs" tone="muted">
                      {example.line}
                    </Text>
                  </Stack>
                  <MarkdownContent variant="plain" html={parseChapterBodyMarkdown(example.body)} />
                </Stack>
              </InlineCard>
            ))}
          </Stack>
        </Stack>
      </CardSection>

      {overview.spiLegend.length > 0 && (
        <CardSection padding="normal">
          <Stack gap="lg">
            <Stack gap="xs">
              <SectionHeading as="h2">What the preference codes mean</SectionHeading>
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
        <CardSection padding="normal">
          <Stack gap="lg">
            <SectionHeading as="h2">Chapter notes</SectionHeading>
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
