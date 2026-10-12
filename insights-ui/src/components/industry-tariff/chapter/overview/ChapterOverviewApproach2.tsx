import GlossaryTerm from '@/components/industry-tariff/chapter/GlossaryTerm';
import ChapterKeyTakeaways from '@/components/industry-tariff/chapter/ChapterKeyTakeaways';
import BaseRateNotice from '@/components/industry-tariff/chapter/overview/BaseRateNotice';
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
import { SummaryRow, SummaryRowList } from '@/components/ui/sections/SummaryRowList';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import type { TariffChapterPrototype } from '@/types/tariff-chapter-prototype';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import { chapterDetailHref } from '@/utils/tariff-calculator/chapter-slug';
import { approach2SectionLabel, chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import { shipmentLines } from '@/utils/tariff-reports/shipment-duty';
import React from 'react';

// Approach 2 overview page (issue #1770). The page's job is the chapter's rate
// summary by heading; the full line-by-line schedule is on the HTS codes page.
//
// Reading order is deliberate: orient the reader (what this chapter is, and
// whether the rate is even the thing that matters), give them the chapter's
// numbers, then a heading-level rate table (one row per four-digit heading,
// linking out to the chapter's HTS codes page for every 10-digit line), then the
// arithmetic worked through on real lines. Nothing here is hidden behind an
// interaction — the collapsed chapter notes stay in the HTML.
//
// The heading table is the page's one boxed section, so it reads as the main
// element; the supporting sections sit straight on the page.

// A heading's rate summary lists every distinct rate ("Free · 5% · 4.2% · 40¢/kg + 10.4% · …"),
// which turns into noise past a few. The heading table shows the first three; the HTS codes page has them all.
const MAX_SUMMARY_RATES = 3;

function shortRateSummary(summary: string): string {
  const rates = summary.split(' · ');
  if (rates.length <= MAX_SUMMARY_RATES) return summary;
  return `${rates.slice(0, MAX_SUMMARY_RATES).join(' · ')} · +${rates.length - MAX_SUMMARY_RATES} more`;
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

      {/* A heading-level summary, not every line: the full line-by-line schedule lives on the
          chapter's HTS codes page, so this page stays readable and doesn't duplicate it. */}
      <CardSection padding="roomy" bordered id="rate-table">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              The {overview.productGroups.length} headings in Chapter {chapter.padded} and their duty rates
            </SectionHeading>
            <Text size="sm" tone="muted">
              Each four-digit heading with the number of tariff lines under it and the base (general / MFN) rates those lines carry. For all {lineCount}{' '}
              10-digit HTS codes, with the trade-deal and Column 2 rates, see the full HTS code list.
            </Text>
          </Stack>
          {tariffUpdates && (
            <BaseRateNotice
              inEffect={tariffUpdates.inEffect}
              ratesByCountryHref={industryAreas ? chapterSectionHref(chapter.slug, 'industry-areas') : undefined}
              ratesByCountryLabel={approach2SectionLabel('industry-areas')}
            />
          )}
          <SummaryRowList
            columns={[
              'Heading',
              'Products',
              <GlossaryTerm key="base-rate" id="base-rate">
                Base rates
              </GlossaryTerm>,
              'Tariff lines',
            ]}
          >
            {overview.productGroups.map((group) => (
              <SummaryRow
                key={group.heading}
                id={group.heading}
                code={group.heading}
                title={group.label}
                value={shortRateSummary(group.rateSummary)}
                emphasis={group.dutiableLineCount > 0}
                aside={group.dutiableLineCount > 0 ? `${group.lineCount} lines, ${group.dutiableLineCount} dutiable` : `${group.lineCount} lines`}
              >
                {group.blurb}
              </SummaryRow>
            ))}
          </SummaryRowList>
          <div>
            <TextLink look="button" href={chapterDetailHref(chapter.sectionNumber, chapter.number, chapter.title)}>
              See all {lineCount} HTS codes in Chapter {chapter.padded} →
            </TextLink>
          </div>
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
              These codes appear in the trade-deal (“Special”) rate of this chapter’s tariff lines. A shipment claims one of these programs at entry, and
              claiming it is what turns the base rate into Free.
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
