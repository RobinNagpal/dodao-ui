import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import InlineCard from '@/components/ui/sections/InlineCard';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import type { TariffChapterPrototype, TariffFinalConclusionContent } from '@/types/tariff-chapter-prototype';
import { chapterCoverHref, chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import React from 'react';

// Approach 2 final-conclusion page (issue #1770): an FAQ built from real
// search questions, with FAQPage structured data. Answers only restate facts
// verified on the chapter's other pages, and each links to the page with the
// detail.

interface ChapterFaqApproach2Props {
  content: TariffChapterPrototype;
  conclusion: TariffFinalConclusionContent;
}

const LINK_LABEL: Record<string, string> = {
  '': 'Rate table',
  'tariff-updates': 'Tariff updates',
  'understand-industry': 'Import statistics',
  'industry-areas': 'Rates by country',
  'tariff-engineering': 'Documents & levers',
};

function faqJsonLd(conclusion: TariffFinalConclusionContent): string {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: conclusion.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
  // Escape "<" so no answer text can close the script tag.
  return JSON.stringify(ld).replace(/</g, '\\u003c');
}

export default function ChapterFaqApproach2({ content, conclusion }: ChapterFaqApproach2Props): React.JSX.Element {
  const { chapter } = content;

  return (
    <Stack gap="2xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd(conclusion) }} />

      {/* The page H1 is rendered by the ChapterArticle shell from `conclusion.h1`. */}
      <Text size="sm" tone="muted">
        {conclusion.intro}
      </Text>

      <CardSection padding="normal">
        <Stack gap="md">
          <SectionHeading as="h2">In short</SectionHeading>
          <Stack as="ul" gap="sm">
            {conclusion.keyTakeaways.map((point) => (
              <li key={point}>
                <Text size="sm">{point}</Text>
              </li>
            ))}
          </Stack>
        </Stack>
      </CardSection>

      <Stack gap="md">
        <SectionHeading as="h2">Frequently asked questions</SectionHeading>
        {conclusion.faqs.map((faq) => (
          <InlineCard key={faq.id} padding="roomy">
            <Stack gap="sm">
              <Heading as="h3" size="md" tone="white">
                {faq.question}
              </Heading>
              <Text size="sm" leading="relaxed">
                {faq.answer}
              </Text>
              <Stack direction="row" gap="md" align="center" wrap>
                <TextLink href={faq.link ? chapterSectionHref(chapter.slug, faq.link) : chapterCoverHref(chapter.slug)} size="xs">
                  {LINK_LABEL[faq.link] ?? 'Details'} →
                </TextLink>
                <Text as="span" size="xs" tone="muted">
                  Searched as: {faq.searchedAs.map((q) => `“${q}”`).join(', ')}
                </Text>
              </Stack>
            </Stack>
          </InlineCard>
        ))}
      </Stack>

      <Text size="xs" tone="muted">
        Questions: {conclusion.questionSource}. Answers draw on the tariff schedule, Federal Register, eCFR and UN Comtrade sources cited on this report&apos;s
        other pages.
      </Text>
    </Stack>
  );
}
