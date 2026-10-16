import LeverCards, { Citations } from '@/components/industry-tariff/chapter/engineering/LeverCards';
import RulesByGroup from '@/components/industry-tariff/chapter/engineering/RulesByGroup';
import { formatIsoDate } from '@/components/industry-tariff/chapter/exports/export-shared';
import DefinitionList from '@/components/ui/DefinitionList';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import InlineCard from '@/components/ui/sections/InlineCard';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import type { TariffExportRulesContent } from '@/types/tariff-chapter-exports';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import React from 'react';

// Export rules: what the U.S. requires before this chapter's goods leave the country, and the legal
// ways to pay less abroad. Three parts: the steps every exporter takes (classify, screen, licence,
// sanctions, file), each with what it means for this chapter; the agency rules that reach only some
// product groups; and the savings (trade-agreement rates abroad, U.S. duty drawback). The export
// counterpart of the import duty-saving rules page, built from the same pieces.

export default function ChapterExportRules({ rules }: { rules: TariffExportRulesContent }): React.JSX.Element {
  const { chapter } = rules;

  return (
    <Stack gap="2xl">
      {/* The page H1 and the "Updated" date are rendered by the ChapterArticle shell. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          Regulations as of {formatIsoDate(rules.regulationsAsOf)} (eCFR)
        </Text>
        <MarkdownContent variant="body" html={parseChapterBodyMarkdown(rules.intro)} />
      </Stack>

      <CardSection padding="roomy" bordered>
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              Before you ship, step by step
            </SectionHeading>
            <Text size="sm" tone="muted">
              What every U.S. exporter does before goods leave, with what each step means for Chapter {chapter.padded} goods.
            </Text>
          </Stack>
          <Stack gap="md">
            {rules.steps.map((step, index) => (
              <InlineCard key={step.id} id={step.id} surface="card" padding="spacious">
                <Stack gap="sm">
                  <Stack direction="row" gap="md" align="baseline">
                    <Text as="span" size="lg" weight="bold" tone="muted">
                      {index + 1}
                    </Text>
                    <Heading as="h3" size="lg" tone="white">
                      {step.title}
                    </Heading>
                  </Stack>
                  <Text size="sm">{step.whatToDo}</Text>
                  <DefinitionList
                    look="fields"
                    columns="1"
                    items={[
                      { term: 'When', definition: step.when },
                      ...(step.chapterNote ? [{ term: `Chapter ${chapter.padded}`, definition: step.chapterNote }] : []),
                    ]}
                  />
                  <Citations citations={step.citations} />
                </Stack>
              </InlineCard>
            ))}
          </Stack>
        </Stack>
      </CardSection>

      <RulesByGroup
        rules={rules.rules}
        groups={rules.groups}
        heading="Agency rules by product group"
        caption="Rules that reach only some of this chapter's goods: the agency, what it requires before export, and the regulation that says so."
      />

      <LeverCards
        levers={rules.savings}
        heading="Ways to pay less abroad"
        caption="Legal ways to lower the duty the buyer's country charges, or to get back U.S. duty paid on imported inputs. Select one for who it applies to, the document and what to watch out for."
      />

      <Text size="xs" tone="muted">
        {rules.disclaimer}
      </Text>
    </Stack>
  );
}
