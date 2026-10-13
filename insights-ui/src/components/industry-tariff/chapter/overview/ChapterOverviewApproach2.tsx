import ChapterKeyTakeaways from '@/components/industry-tariff/chapter/ChapterKeyTakeaways';
import BaseRateNotice from '@/components/industry-tariff/chapter/overview/BaseRateNotice';
import ChapterRateTable from '@/components/industry-tariff/chapter/overview/ChapterRateTable';
import ShipmentDutyBox from '@/components/industry-tariff/chapter/shipment/ShipmentDutyBox';
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
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import type { TariffChapterPrototype } from '@/types/tariff-chapter-prototype';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import { approach2SectionLabel, chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import { shipmentLines } from '@/utils/tariff-reports/shipment-duty';
import React from 'react';

// Approach 2 overview page (issue #1770). The page's single job is to be the
// chapter's rate lookup: every line, every rate, filterable by product name.
//
// Reading order is deliberate: orient the reader (what this chapter is, and
// whether the rate is even the thing that matters), give them the chapter's
// numbers, then the full table — grouped by heading, so it doubles as the map of
// the chapter's product groups — then the arithmetic worked through on real lines. Nothing here is hidden behind an
// interaction — the filters narrow content that is already rendered, and the
// collapsed chapter notes stay in the HTML.
//
// The rate table is the page's one boxed section, so it reads as the main
// element; the supporting sections sit straight on the page.

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

      <CardSection padding="roomy" bordered id="rate-table">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              {`HTS Chapter ${chapter.padded} duty rates: ${overview.productGroups.length} headings, ${lineCount} tariff lines`}
            </SectionHeading>
            <Text size="sm" tone="muted">
              All {lineCount} tariff lines in the schedule, grouped by 4-digit heading, with the base (general / MFN) rate, the rate with a trade deal or
              preference program, the Column 2 rate and the reporting unit. Each heading says what it covers, its rates and how many of its lines carry a
              base-rate duty; open it to see its lines, or search by product name or HTS code to open the headings that match. Select a line for its full
              description and preference list.
            </Text>
          </Stack>
          {tariffUpdates && (
            <BaseRateNotice
              inEffect={tariffUpdates.inEffect}
              ratesByCountryHref={industryAreas ? chapterSectionHref(chapter.slug, 'industry-areas') : undefined}
              ratesByCountryLabel={approach2SectionLabel('industry-areas')}
            />
          )}
          <ChapterRateTable rows={overview.rateTable.rows} productGroups={overview.productGroups} note={overview.rateTable.note} />
        </Stack>
      </CardSection>

      {/* The one-number answer needs the country matrix, so it appears once the chapter has one. */}
      {industryAreas && (
        <ShipmentDutyBox
          lines={shipmentLines(overview.rateTable.rows)}
          countries={industryAreas.countries}
          ratesAsOf={industryAreas.lastCheckedAt}
          scheduleEdition={industryAreas.scheduleEdition}
          ratesByCountryHref={chapterSectionHref(chapter.slug, 'industry-areas')}
        />
      )}

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
