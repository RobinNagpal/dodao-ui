import ChapterKeyTakeaways from '@/components/industry-tariff/chapter/ChapterKeyTakeaways';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import { DisclosureItem, DisclosureList } from '@/components/ui/sections/DisclosureList';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import type { TariffChapterPrototype, TariffFinalConclusionContent } from '@/types/tariff-chapter-prototype';
import { approach2SectionLabel, chapterCoverHref, chapterSectionHref } from '@/utils/tariff-reports/chapter-route-helpers';
import React from 'react';

// Approach 2 final-conclusion page (issue #1770): an FAQ built from real
// search questions, with FAQPage structured data. Answers only restate facts
// verified on the chapter's other pages, and each links to the page with the
// detail.

interface ChapterFaqApproach2Props {
  content: TariffChapterPrototype;
  conclusion: TariffFinalConclusionContent;
}

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
      <Text size="base">{conclusion.intro}</Text>

      <ChapterKeyTakeaways takeaways={conclusion.keyTakeaways} />

      <CardSection padding="roomy" bordered>
        <Stack gap="md">
          <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
            Frequently asked questions
          </SectionHeading>
          <DisclosureList>
            {conclusion.faqs.map((faq, i) => (
              <DisclosureItem key={faq.id} id={faq.id} summary={faq.question} defaultOpen={i === 0}>
                <Stack gap="sm">
                  <Text size="base" leading="relaxed">
                    {faq.answer}
                  </Text>
                  <TextLink href={faq.link ? chapterSectionHref(chapter.slug, faq.link) : chapterCoverHref(chapter.slug)}>
                    {approach2SectionLabel(faq.link || 'overview')} →
                  </TextLink>
                </Stack>
              </DisclosureItem>
            ))}
          </DisclosureList>
        </Stack>
      </CardSection>
    </Stack>
  );
}
