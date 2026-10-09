import ChapterKeyTakeaways from '@/components/industry-tariff/chapter/ChapterKeyTakeaways';
import BaseRateNotice from '@/components/industry-tariff/chapter/overview/BaseRateNotice';
import ChapterRateTable from '@/components/industry-tariff/chapter/overview/ChapterRateTable';
import SourcesCard, { labeledSourceItems } from '@/components/industry-tariff/chapter/updates/SourcesCard';
import DefinitionList from '@/components/ui/DefinitionList';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import MetricGrid, { cardGridColumns } from '@/components/ui/containers/MetricGrid';
import StatCardGrid from '@/components/ui/containers/StatCardGrid';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import { DisclosureItem, DisclosureList } from '@/components/ui/sections/DisclosureList';
import InlineCard from '@/components/ui/sections/InlineCard';
import LinkTile from '@/components/ui/sections/LinkTile';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import type { TariffChapterPrototype } from '@/types/tariff-chapter-prototype';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import { approach2SectionLabel, chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import React from 'react';

// Approach 2 overview page (issue #1770). The page's single job is to be the
// chapter's rate lookup: every line, every rate, filterable by product name.
//
// Reading order is deliberate: orient the reader (what this chapter is, and
// whether the rate is even the thing that matters), give them the chapter's
// numbers, let them jump to their product group, then the full table, then the
// arithmetic worked through on real lines. Nothing here is hidden behind an
// interaction — the filters narrow content that is already rendered, and the
// collapsed chapter notes stay in the HTML.
//
// The rate table is the page's one boxed section, so it reads as the main
// element; the supporting sections sit straight on the page.

// A heading's rate summary lists every distinct rate ("Free · 5% · 4.2% · 40¢/kg + 10.4% · …"),
// which turns into noise past a few. The tile shows the first three; the table has them all.
const MAX_TILE_RATES = 3;

function tileRateSummary(summary: string): string {
  const rates = summary.split(' · ');
  if (rates.length <= MAX_TILE_RATES) return summary;
  return `${rates.slice(0, MAX_TILE_RATES).join(' · ')} · +${rates.length - MAX_TILE_RATES} more`;
}

interface ChapterOverviewApproach2Props {
  content: TariffChapterPrototype;
}

export default function ChapterOverviewApproach2({ content }: ChapterOverviewApproach2Props): React.JSX.Element {
  const { chapter, overview, sources, tariffUpdates, industryAreas, finalConclusion } = content;
  const lineCount = overview.rateTable.rows.filter((row) => row.htsCode10).length;

  return (
    <Stack gap="2xl">
      {/* The page H1 is rendered by the ChapterArticle shell from `overview.h1`. */}
      {/* The FAQ page's takeaways come first, so a reader gets the answer before the table. */}
      {finalConclusion && <ChapterKeyTakeaways takeaways={finalConclusion.keyTakeaways} />}

      <MarkdownContent variant="body" html={parseChapterBodyMarkdown(overview.intro)} />

      <Stack gap="md">
        <StatCardGrid stats={overview.stats} />
        <Text size="sm">
          <TextLink href={chapterSectionHref(chapter.slug, 'understand-industry')}>See {approach2SectionLabel('understand-industry').toLowerCase()} →</TextLink>
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
              aside={group.dutiableLineCount > 0 ? `${group.lineCount} lines · ${group.dutiableLineCount} with a base-rate duty` : `${group.lineCount} lines`}
              title={group.label}
              meta={tileRateSummary(group.rateSummary)}
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
              All {lineCount} tariff lines in the schedule, with the base (general / MFN) rate, the rate with a trade deal or preference program, the Column 2
              rate and the reporting unit. Search by product name or HTS code; select a line for its full description and preference list.
            </Text>
          </Stack>
          {tariffUpdates && (
            <BaseRateNotice
              inEffect={tariffUpdates.inEffect}
              ratesByCountryHref={industryAreas ? chapterSectionHref(chapter.slug, 'industry-areas') : undefined}
              ratesByCountryLabel={approach2SectionLabel('industry-areas')}
            />
          )}
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
        <Stack as="section" gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="md" weight="bold" tone="heading">
              What the preference codes mean
            </SectionHeading>
            <Text size="sm" tone="muted">
              These are the codes behind the trade-deal count in the “With a trade deal” column of the table above (expand a row to see them). A shipment claims
              one of these programs at entry, and claiming it is what turns the base rate into Free.
            </Text>
          </Stack>
          <DefinitionList columns="1-2" items={overview.spiLegend.map((entry) => ({ term: entry.code, definition: entry.name }))} />
        </Stack>
      )}

      {/* The legal notes are long reference text: collapsed by default, still in the HTML. */}
      {(overview.notes.chapterNotes || overview.notes.additionalUsNotes) && (
        <DisclosureList>
          {overview.notes.chapterNotes && (
            <DisclosureItem summary="Chapter notes">
              <MarkdownContent variant="plain" html={parseChapterBodyMarkdown(overview.notes.chapterNotes)} />
            </DisclosureItem>
          )}
          {overview.notes.additionalUsNotes && (
            <DisclosureItem summary="Additional U.S. notes">
              <MarkdownContent variant="plain" html={parseChapterBodyMarkdown(overview.notes.additionalUsNotes)} />
            </DisclosureItem>
          )}
        </DisclosureList>
      )}

      <SourcesCard items={labeledSourceItems(sources)} />
    </Stack>
  );
}
