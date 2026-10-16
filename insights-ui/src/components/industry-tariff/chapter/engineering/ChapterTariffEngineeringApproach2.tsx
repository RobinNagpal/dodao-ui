import LeverCards from '@/components/industry-tariff/chapter/engineering/LeverCards';
import RulesByGroup from '@/components/industry-tariff/chapter/engineering/RulesByGroup';
import Text from '@/components/ui/Text';
import Stack from '@/components/ui/containers/Stack';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import type { TariffChapterPrototype, TariffEngineeringContent } from '@/types/tariff-chapter-prototype';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import React from 'react';

// Approach 2 tariff-engineering page (issue #1770): the documents and rules
// required, per line, and the legal levers that lower the duty — each tied to
// the regulation or schedule text that creates it. A summary table of the
// levers (what each saves) comes first and links to each lever's card, where
// the conditions are folded away.

interface ChapterTariffEngineeringApproach2Props {
  content: TariffChapterPrototype;
  engineering: TariffEngineeringContent;
}

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export default function ChapterTariffEngineeringApproach2({ content, engineering }: ChapterTariffEngineeringApproach2Props): React.JSX.Element {
  return (
    <Stack gap="2xl">
      {/* The page H1 and the "Rates as of" date are rendered by the ChapterArticle shell. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          Regulations as of {formatDate(engineering.regulationsAsOf)} (eCFR)
          {content.tariffUpdates ? ` · tariff schedule ${content.tariffUpdates.now.edition}` : ''}
        </Text>
        <MarkdownContent variant="body" html={parseChapterBodyMarkdown(engineering.intro)} />
      </Stack>

      <LeverCards
        levers={engineering.levers}
        heading="Legal ways to pay less"
        caption="Each one is written into the tariff schedule or customs regulations — and each depends on a document. Select one for who it applies to, the document and what to watch out for."
      />

      <RulesByGroup
        rules={engineering.rules}
        groups={engineering.groups}
        heading="Documents and rules by product group"
        caption="Who clears the goods at the border, and the regulation that says what they need."
      />

      <Text size="xs" tone="muted">
        {engineering.disclaimer}
      </Text>
    </Stack>
  );
}
