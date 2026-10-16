import ChapterKeyTakeaways from '@/components/industry-tariff/chapter/ChapterKeyTakeaways';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import { DisclosureItem, DisclosureList } from '@/components/ui/sections/DisclosureList';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import type { TariffFaq } from '@/types/tariff-chapter-prototype';
import { approach2SectionLabel, chapterPageHref } from '@/utils/tariff-reports/chapter-route-helpers';
import React from 'react';

// Approach 2 FAQ page (issue #1770): questions built from real searches, with
// FAQPage structured data. Answers only restate facts verified on the
// chapter's other pages, and each links to the page with the detail. Used by
// the import FAQ (final-conclusion) and the export FAQ (exports/faq).

interface ChapterFaqApproach2Props {
  chapterSlug: string;
  intro: string;
  keyTakeaways: string[];
  /** `link` is a page slug of the same report: '' = the chapter cover, an import section, or an export page. */
  faqs: TariffFaq[];
}

function faqJsonLd(faqs: TariffFaq[]): string {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
  // Escape "<" so no answer text can close the script tag.
  return JSON.stringify(ld).replace(/</g, '\\u003c');
}

export default function ChapterFaqApproach2({ chapterSlug, intro, keyTakeaways, faqs }: ChapterFaqApproach2Props): React.JSX.Element {
  return (
    <Stack gap="2xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd(faqs) }} />

      {/* The page H1 is rendered by the ChapterArticle shell. */}
      <Text size="base">{intro}</Text>

      <ChapterKeyTakeaways takeaways={keyTakeaways} />

      <CardSection padding="roomy" bordered>
        <Stack gap="md">
          <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
            Frequently asked questions
          </SectionHeading>
          <DisclosureList>
            {faqs.map((faq, i) => (
              <DisclosureItem key={faq.id} id={faq.id} summary={faq.question} defaultOpen={i === 0}>
                <Stack gap="sm">
                  <Text size="base" leading="relaxed">
                    {faq.answer}
                  </Text>
                  <TextLink href={chapterPageHref(chapterSlug, faq.link)}>{approach2SectionLabel(faq.link || 'overview')} →</TextLink>
                </Stack>
              </DisclosureItem>
            ))}
          </DisclosureList>
        </Stack>
      </CardSection>
    </Stack>
  );
}
